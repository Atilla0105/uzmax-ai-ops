import {
  createOrderImportBatchContract,
  type OrderImportBatchResult,
  type OrderImportRowErrorDraft,
  type OrderSnapshotDraft
} from "../../../packages/capabilities/order-read/src/index.ts";
import { m4OrderImportContracts } from "../../../packages/db/src/m4-order-import-contracts.ts";

export const processName = "worker";

type AnyRecord = Record<string, unknown>;

export type OrderImportWorkerDraftInput = {
  createdByUserId: string;
  importJobId: string;
  importedAt: string;
  orgId: string;
  rowErrorIds: readonly string[];
  rows: readonly AnyRecord[];
  snapshotIds: readonly string[];
  sourceRef: string;
  tenantId: string;
};

export type OrderImportWorkerDrafts = {
  batch: OrderImportBatchResult;
  importJobDraft: Record<string, unknown>;
  rowErrorDrafts: readonly Record<string, unknown>[];
  snapshotDrafts: readonly Record<string, unknown>[];
};

export type OrderImportWorkerPersistenceGateway = {
  persistImportJob(draft: Record<string, unknown>): Promise<void> | void;
  persistImportRowErrors(
    drafts: readonly Record<string, unknown>[]
  ): Promise<void> | void;
  persistOrderSnapshots(
    drafts: readonly Record<string, unknown>[]
  ): Promise<void> | void;
};

export type OrderImportCsvParseInput = {
  csvText: string;
  maxRows?: number;
  sourceRef: string;
};

export type OrderImportCsvParseResult = {
  headers: readonly string[];
  rows: readonly AnyRecord[];
  sourceRef: string;
};

export type OrderImportCsvTextPersistenceJobInput = Omit<
  OrderImportWorkerDraftInput,
  "rows"
> &
  OrderImportCsvParseInput;

export type OrderImportCsvTextPersistenceJobResult = OrderImportWorkerDrafts & {
  parsed: OrderImportCsvParseResult;
  persisted: {
    importJobs: 1;
    rowErrors: number;
    snapshots: number;
  };
};

type CsvParseState = {
  field: string;
  quoted: boolean;
  record: string[];
  records: string[][];
};

const orderImportCsvHeaderMap = {
  customer_ref: "customerRef",
  expires_at: "expiresAt",
  external_batch_ref: "externalBatchRef",
  external_order_ref: "externalOrderRef",
  order_status_ref: "orderStatusRef",
  source_updated_at: "sourceUpdatedAt"
} as const;
const requiredOrderImportCsvHeaders = [
  "expires_at",
  "external_order_ref",
  "order_status_ref",
  "source_updated_at"
] as const;

export function parseOrderImportCsvText(
  input: OrderImportCsvParseInput
): OrderImportCsvParseResult {
  const maxRows = maxImportRows(input.maxRows);
  const records = parseCsvRecords(input.csvText);
  const headers = normalizeCsvHeaders(records[0]);
  assertCsvHeaders(headers);

  const rows: AnyRecord[] = [];
  for (const record of records.slice(1)) {
    if (isBlankCsvRecord(record)) continue;
    if (rows.length >= maxRows) {
      throw new Error("order import CSV row count exceeds maxRows");
    }
    rows.push(csvRecordToOrderRow(record, headers, rows.length + 1, input.sourceRef));
  }

  return { headers, rows, sourceRef: input.sourceRef };
}

export function createOrderImportWorkerDrafts(
  input: OrderImportWorkerDraftInput
): OrderImportWorkerDrafts {
  const batch = createOrderImportBatchContract({
    importedAt: input.importedAt,
    rows: input.rows,
    sourceRef: input.sourceRef
  });
  assertIdAllocation("snapshotIds", input.snapshotIds, batch.successfulRows.length);
  assertIdAllocation("rowErrorIds", input.rowErrorIds, batch.errorRows.length);

  return {
    batch,
    importJobDraft: m4OrderImportContracts.createImportJobContract({
      completedAt: input.importedAt,
      createdByUserId: input.createdByUserId,
      failedRows: batch.summary.failedRows,
      fileRef: batch.sourceRef,
      id: input.importJobId,
      orgId: input.orgId,
      status: batch.summary.status,
      successfulRows: batch.summary.successfulRows,
      tenantId: input.tenantId,
      totalRows: batch.summary.totalRows
    }),
    rowErrorDrafts: batch.errorRows.map((error, index) =>
      createRowErrorDraft(input, error, input.rowErrorIds[index])
    ),
    snapshotDrafts: batch.successfulRows.map((snapshot, index) =>
      createSnapshotDraft(input, snapshot, input.snapshotIds[index])
    )
  };
}

export async function runOrderImportCsvTextPersistenceJob(
  input: OrderImportCsvTextPersistenceJobInput,
  gateway: OrderImportWorkerPersistenceGateway
): Promise<OrderImportCsvTextPersistenceJobResult> {
  const parsed = parseOrderImportCsvText(input);
  const drafts = createOrderImportWorkerDrafts({
    ...input,
    rows: parsed.rows,
    sourceRef: parsed.sourceRef
  });

  await gateway.persistImportJob(drafts.importJobDraft);
  await gateway.persistOrderSnapshots(drafts.snapshotDrafts);
  await gateway.persistImportRowErrors(drafts.rowErrorDrafts);

  return {
    ...drafts,
    parsed,
    persisted: {
      importJobs: 1,
      rowErrors: drafts.rowErrorDrafts.length,
      snapshots: drafts.snapshotDrafts.length
    }
  };
}

function createSnapshotDraft(
  input: OrderImportWorkerDraftInput,
  snapshot: OrderSnapshotDraft,
  id: string | undefined
) {
  return m4OrderImportContracts.createOrderSnapshotContract({
    expiresAt: snapshot.expiresAt,
    externalBatchRef: snapshot.externalBatchRef,
    externalOrderRef: snapshot.externalOrderRef,
    id,
    importJobId: input.importJobId,
    orderStatusRef: snapshot.orderStatusRef,
    orgId: input.orgId,
    payloadSummary: snapshot.payloadSummary,
    sourceKind: snapshot.sourceKind,
    sourceRef: snapshot.sourceRef,
    sourceUpdatedAt: snapshot.sourceUpdatedAt,
    status: "active",
    tenantId: input.tenantId
  });
}

function createRowErrorDraft(
  input: OrderImportWorkerDraftInput,
  error: OrderImportRowErrorDraft,
  id: string | undefined
) {
  return m4OrderImportContracts.createImportRowErrorContract({
    columnKey: error.columnKey,
    errorCode: error.errorCode,
    id,
    importJobId: input.importJobId,
    messageRef: error.messageRef,
    orgId: input.orgId,
    rowNumber: error.rowNumber,
    severity: error.severity,
    tenantId: input.tenantId
  });
}

function assertIdAllocation(
  name: string,
  ids: readonly string[],
  expectedCount: number
) {
  if (ids.length !== expectedCount) {
    throw new Error(`${name} must match generated draft count`);
  }
}

function csvRecordToOrderRow(
  record: readonly string[],
  headers: readonly string[],
  rowNumber: number,
  sourceRef: string
): AnyRecord {
  if (record.length > headers.length) {
    throw new Error(`order import CSV row ${rowNumber} has too many columns`);
  }

  const payloadSummary: AnyRecord = {
    rowRef: `import://order-import/row-${rowNumber}`
  };
  const row: AnyRecord = { payloadSummary, rowNumber, sourceRef };
  for (let index = 0; index < headers.length; index += 1) {
    const cell = record[index]?.trim();
    if (!cell) continue;
    const field =
      orderImportCsvHeaderMap[headers[index] as keyof typeof orderImportCsvHeaderMap];
    row[field] = cell;
    if (field === "orderStatusRef") payloadSummary.statusRef = cell;
  }
  return row;
}

function normalizeCsvHeaders(record: readonly string[] | undefined): string[] {
  if (!record || isBlankCsvRecord(record)) {
    throw new Error("order import CSV must include a header row");
  }
  return record.map((header) =>
    header.trim().toLowerCase().replace(/\s+/g, "_").replaceAll("-", "_")
  );
}

function assertCsvHeaders(headers: readonly string[]) {
  const seen = new Set<string>();
  for (const header of headers) {
    if (!header) throw new Error("order import CSV header is required");
    if (seen.has(header)) {
      throw new Error(`order import CSV header ${header} is duplicated`);
    }
    if (!(header in orderImportCsvHeaderMap)) {
      throw new Error(`order import CSV header ${header} is not allowed`);
    }
    seen.add(header);
  }
  for (const header of requiredOrderImportCsvHeaders) {
    if (!seen.has(header)) {
      throw new Error(`order import CSV header ${header} is required`);
    }
  }
}

function parseCsvRecords(csvText: string): string[][] {
  if (typeof csvText !== "string" || !csvText.trim()) {
    throw new Error("csvText is required");
  }
  const state: CsvParseState = {
    field: "",
    quoted: false,
    record: [],
    records: []
  };
  for (let index = 0; index < csvText.length; index += 1) {
    index = consumeCsvCharacter(csvText, index, state);
  }
  finishCsvParse(state);
  return state.records;
}

function consumeCsvCharacter(
  csvText: string,
  index: number,
  state: CsvParseState
): number {
  if (state.quoted) return consumeQuotedCsvCharacter(csvText, index, state);
  return consumeUnquotedCsvCharacter(csvText, index, state);
}

function consumeQuotedCsvCharacter(
  csvText: string,
  index: number,
  state: CsvParseState
): number {
  const character = csvText[index];
  if (character !== '"') {
    state.field += character;
    return index;
  }
  if (csvText[index + 1] === '"') {
    state.field += '"';
    return index + 1;
  }
  state.quoted = false;
  return index;
}

function consumeUnquotedCsvCharacter(
  csvText: string,
  index: number,
  state: CsvParseState
): number {
  const character = csvText[index];
  if (character === '"') {
    if (state.field.length > 0) throw new Error("quote must start a CSV field");
    state.quoted = true;
  } else if (character === ",") {
    pushCsvField(state);
  } else if (character === "\n" || character === "\r") {
    if (character === "\r" && csvText[index + 1] === "\n") index += 1;
    pushCsvRecord(state);
  } else {
    state.field += character;
  }
  return index;
}

function finishCsvParse(state: CsvParseState) {
  if (state.quoted) throw new Error("unterminated quoted CSV field");
  pushCsvRecord(state);
  while (state.records.length > 1 && isBlankCsvRecord(state.records.at(-1) ?? [])) {
    state.records.pop();
  }
}

function pushCsvRecord(state: CsvParseState) {
  pushCsvField(state);
  state.records.push(state.record);
  state.record = [];
}

function pushCsvField(state: CsvParseState) {
  state.record.push(state.field);
  state.field = "";
}

function isBlankCsvRecord(record: readonly string[]): boolean {
  return record.every((cell) => !cell.trim());
}

function maxImportRows(value: number | undefined): number {
  if (value === undefined) return 500;
  if (!Number.isInteger(value) || value < 1 || value > 5000) {
    throw new Error("maxRows must be an integer from 1 to 5000");
  }
  return value;
}
