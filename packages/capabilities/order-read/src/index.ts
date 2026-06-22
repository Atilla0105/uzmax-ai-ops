export const packageName = "@uzmax/capability-order-read";

export const orderSnapshotSourceKinds = { importSnapshot: "import_snapshot" } as const;
export const orderImportRowStatuses = {
  accepted: "accepted",
  rowError: "row_error"
} as const;
export const orderReadResultStatuses = {
  handoffRequired: "handoff_required",
  snapshotReady: "snapshot_ready"
} as const;
export const orderQueryKinds = {
  batchRef: "batch_ref",
  customerRef: "customer_ref",
  externalRef: "external_ref",
  orderRef: "order_ref",
  searchRef: "search_ref"
} as const;
export const orderQueryOutcomes = {
  degraded: "degraded",
  handoff: "handoff",
  hit: "hit",
  miss: "miss",
  stale: "stale"
} as const;

type ValueOf<T> = T[keyof T];
type AnyRecord = Record<string, unknown>;
type HandoffReasonCode =
  | "order_data_degraded"
  | "order_snapshot_missing"
  | "order_snapshot_stale";
type ImportBatchStatus = "completed" | "completed_with_errors" | "failed";
type QueryKind = ValueOf<typeof orderQueryKinds>;

export type OrderSnapshotDraft = {
  customerRef?: string;
  expiresAt: string;
  externalBatchRef?: string;
  externalOrderRef: string;
  orderStatusRef: string;
  payloadSummary: AnyRecord;
  sourceKind: typeof orderSnapshotSourceKinds.importSnapshot;
  sourceRef: string;
  sourceUpdatedAt: string;
};

export type OrderImportRowErrorDraft = Record<"errorCode" | "messageRef", string> & {
  columnKey?: string;
  rowNumber: number;
  severity: "error";
};

export type OrderImportRowResult =
  | {
      rowNumber: number;
      snapshotDraft: OrderSnapshotDraft;
      status: typeof orderImportRowStatuses.accepted;
    }
  | {
      error: OrderImportRowErrorDraft;
      rowNumber: number;
      status: typeof orderImportRowStatuses.rowError;
    };

export type OrderImportBatchResult = {
  errorRows: readonly OrderImportRowErrorDraft[];
  importedAt: string;
  sourceRef: string;
  successfulRows: readonly OrderSnapshotDraft[];
  summary: Record<"failedRows" | "successfulRows" | "totalRows", number> & {
    status: ImportBatchStatus;
  };
};

export type OrderReadResult =
  | {
      customerVisible: {
        expiresAt: string;
        orderStatusRef: string;
        sourceKind: typeof orderSnapshotSourceKinds.importSnapshot;
        sourceUpdatedAt: string;
      };
      handoff: { required: false };
      queryLogDraft: OrderQueryLogDraft;
      reasonCode: "snapshot_fresh";
      status: typeof orderReadResultStatuses.snapshotReady;
    }
  | {
      customerVisible: {
        expiresAt?: string;
        sourceUpdatedAt?: string;
        warningCode: HandoffReasonCode;
      };
      handoff: { reasonCode: string; required: true };
      queryLogDraft: OrderQueryLogDraft;
      reasonCode: HandoffReasonCode;
      status: typeof orderReadResultStatuses.handoffRequired;
    };
export type OrderQueryLogDraft = {
  handoffRequired: boolean;
  outcome: ValueOf<typeof orderQueryOutcomes>;
  queryKind: QueryKind;
  queryRef: string;
  reasonRef?: string;
  staleSnapshotUsed: boolean;
};
type OrderReadInput = {
  degradedReasonRef?: string;
  now?: string;
  queryKind: QueryKind;
  queryRef: string;
  snapshot?: OrderSnapshotDraft;
};
const controlledRefPattern =
  /^(controlled|storage|import|summary|status|query|reason):\/\/[a-z0-9][a-z0-9/._:-]{0,180}$/i;
const unsafeRefPatterns = [
  /^data:/i,
  /^https?:\/\//i,
  /^(?:\/|\.\/|\.\.\/|[a-z]:\\)/i,
  /^blob:/i,
  /^[a-z0-9+/]{24,}={0,2}$/i
];
const unsafeFieldPattern =
  /^(raw.*|.*plaintext.*|rawPayload|payloadRaw|.*bytes.*|.*blob.*|phone.*|address.*|payment.*|secret.*|token.*|prompt|completion|telegramPayload|publicUrl|csv|xlsx|export)$/i;
const rowKeys = new Set(
  "customerRef expiresAt externalBatchRef externalOrderRef orderStatusRef payloadSummary rowNumber sourceRef sourceUpdatedAt".split(
    " "
  )
);
export function createOrderImportRowContract(input: AnyRecord): OrderImportRowResult {
  assertNoRawOrderCarrier(input);
  assertAllowedKeys(input, rowKeys, "order import row");
  const rowNumber = positiveInteger(input.rowNumber, "rowNumber");
  const payloadSummary = readSummary(input.payloadSummary, rowNumber);
  const sourceUpdatedAt = timestamp(
    input.sourceUpdatedAt,
    "sourceUpdatedAt",
    rowNumber
  );
  const expiresAt = timestamp(input.expiresAt, "expiresAt", rowNumber);

  if (Date.parse(expiresAt) <= Date.parse(sourceUpdatedAt)) {
    return rowError(rowNumber, "expiresAt", "snapshot_expiry_not_after_source_update");
  }

  const requiredRefs = [
    ["externalOrderRef", "external_order_ref_required"],
    ["orderStatusRef", "order_status_ref_required"],
    ["sourceRef", "source_ref_required"]
  ] as const;
  for (const [key, code] of requiredRefs) {
    if (!isControlledRef(input[key])) return rowError(rowNumber, key, code);
  }

  return {
    rowNumber,
    snapshotDraft: {
      customerRef: optionalControlledRef(input.customerRef, "customerRef", rowNumber),
      expiresAt,
      externalBatchRef: optionalControlledRef(
        input.externalBatchRef,
        "externalBatchRef",
        rowNumber
      ),
      externalOrderRef: controlledRef(input.externalOrderRef, "externalOrderRef"),
      orderStatusRef: controlledRef(input.orderStatusRef, "orderStatusRef"),
      payloadSummary,
      sourceKind: orderSnapshotSourceKinds.importSnapshot,
      sourceRef: controlledRef(input.sourceRef, "sourceRef"),
      sourceUpdatedAt
    },
    status: orderImportRowStatuses.accepted
  };
}
export function createOrderImportBatchContract(input: {
  importedAt: string;
  rows: readonly AnyRecord[];
  sourceRef: string;
}): OrderImportBatchResult {
  const importedAt = timestamp(input.importedAt, "importedAt");
  const sourceRef = controlledRef(input.sourceRef, "sourceRef");
  const results = input.rows.map((row) => createOrderImportRowContract(row));
  const successfulRows = results.flatMap((result) =>
    result.status === orderImportRowStatuses.accepted ? [result.snapshotDraft] : []
  );
  const errorRows = results.flatMap((result) =>
    result.status === orderImportRowStatuses.rowError ? [result.error] : []
  );

  return {
    errorRows,
    importedAt,
    sourceRef,
    successfulRows,
    summary: {
      failedRows: errorRows.length,
      status: batchStatus(successfulRows.length, errorRows.length),
      successfulRows: successfulRows.length,
      totalRows: results.length
    }
  };
}
export function evaluateOrderSnapshotForRead(input: OrderReadInput): OrderReadResult {
  const now = timestamp(input.now ?? new Date().toISOString(), "now");
  const queryRef = controlledRef(input.queryRef, "queryRef");
  const queryKind = enumValue(input.queryKind, orderQueryKinds, "queryKind");

  if (input.degradedReasonRef) {
    const reasonRef = controlledRef(input.degradedReasonRef, "degradedReasonRef");
    return handoffResult("order_data_degraded", queryKind, queryRef, {
      outcome: orderQueryOutcomes.degraded,
      reasonRef
    });
  }
  if (!input.snapshot) {
    return handoffResult("order_snapshot_missing", queryKind, queryRef, {
      outcome: orderQueryOutcomes.miss,
      reasonRef: "reason://order-read/snapshot-missing"
    });
  }

  const snapshot = normalizeSnapshot(input.snapshot);
  if (Date.parse(snapshot.expiresAt) <= Date.parse(now)) {
    return handoffResult("order_snapshot_stale", queryKind, queryRef, {
      expiresAt: snapshot.expiresAt,
      outcome: orderQueryOutcomes.stale,
      reasonRef: "reason://order-read/snapshot-stale",
      sourceUpdatedAt: snapshot.sourceUpdatedAt,
      staleSnapshotUsed: true
    });
  }

  return {
    customerVisible: {
      expiresAt: snapshot.expiresAt,
      orderStatusRef: snapshot.orderStatusRef,
      sourceKind: snapshot.sourceKind,
      sourceUpdatedAt: snapshot.sourceUpdatedAt
    },
    handoff: { required: false },
    queryLogDraft: {
      handoffRequired: false,
      outcome: orderQueryOutcomes.hit,
      queryKind,
      queryRef,
      staleSnapshotUsed: false
    },
    reasonCode: "snapshot_fresh",
    status: orderReadResultStatuses.snapshotReady
  };
}
function normalizeSnapshot(snapshot: OrderSnapshotDraft): OrderSnapshotDraft {
  assertNoRawOrderCarrier(snapshot);
  return {
    customerRef: optionalControlledRef(snapshot.customerRef, "customerRef"),
    expiresAt: timestamp(snapshot.expiresAt, "expiresAt"),
    externalBatchRef: optionalControlledRef(
      snapshot.externalBatchRef,
      "externalBatchRef"
    ),
    externalOrderRef: controlledRef(snapshot.externalOrderRef, "externalOrderRef"),
    orderStatusRef: controlledRef(snapshot.orderStatusRef, "orderStatusRef"),
    payloadSummary: readSummary(snapshot.payloadSummary),
    sourceKind: enumValue(snapshot.sourceKind, orderSnapshotSourceKinds, "sourceKind"),
    sourceRef: controlledRef(snapshot.sourceRef, "sourceRef"),
    sourceUpdatedAt: timestamp(snapshot.sourceUpdatedAt, "sourceUpdatedAt")
  };
}
function handoffResult(
  reasonCode: HandoffReasonCode,
  queryKind: QueryKind,
  queryRef: string,
  options: {
    expiresAt?: string;
    outcome: ValueOf<typeof orderQueryOutcomes>;
    reasonRef: string;
    sourceUpdatedAt?: string;
    staleSnapshotUsed?: boolean;
  }
): OrderReadResult {
  return {
    customerVisible: {
      expiresAt: options.expiresAt,
      sourceUpdatedAt: options.sourceUpdatedAt,
      warningCode: reasonCode
    },
    handoff: { reasonCode, required: true },
    queryLogDraft: {
      handoffRequired: true,
      outcome: options.outcome,
      queryKind,
      queryRef,
      reasonRef: options.reasonRef,
      staleSnapshotUsed: options.staleSnapshotUsed ?? false
    },
    reasonCode,
    status: orderReadResultStatuses.handoffRequired
  };
}
function rowError(
  rowNumber: number,
  columnKey: string,
  errorCode: string
): OrderImportRowResult {
  return {
    error: {
      columnKey,
      errorCode,
      messageRef: `reason://order-import/${errorCode}`,
      rowNumber,
      severity: "error"
    },
    rowNumber,
    status: orderImportRowStatuses.rowError
  };
}
function batchStatus(successfulRows: number, failedRows: number): ImportBatchStatus {
  if (successfulRows > 0 && failedRows === 0) return "completed";
  if (successfulRows > 0) return "completed_with_errors";
  return "failed";
}
function readSummary(value: unknown, rowNumber?: number): AnyRecord {
  if (!isPlainRecord(value)) {
    throw new Error(`${rowPrefix(rowNumber)}payloadSummary must be an object`);
  }
  assertNoRawOrderCarrier(value);
  return structuredClone(value);
}
function timestamp(value: unknown, name: string, rowNumber?: number): string {
  const text = requiredText(value, name);
  if (!Number.isFinite(Date.parse(text))) {
    throw new Error(`${rowPrefix(rowNumber)}${name} must be a parseable timestamp`);
  }
  return text;
}
function controlledRef(value: unknown, name: string): string {
  const text = requiredText(value, name);
  if (!isControlledRef(text)) throw new Error(`${name} must be a controlled ref`);
  return text;
}
function optionalControlledRef(
  value: unknown,
  name: string,
  rowNumber?: number
): string | undefined {
  if (value === undefined) return undefined;
  if (!isControlledRef(value)) {
    throw new Error(`${rowPrefix(rowNumber)}${name} must be a controlled ref`);
  }
  return value;
}
function isControlledRef(value: unknown): value is string {
  return (
    typeof value === "string" &&
    controlledRefPattern.test(value) &&
    !isUnsafeString(value)
  );
}
function enumValue<T extends string>(
  value: unknown,
  allowed: Record<string, T>,
  name: string
): T {
  if (typeof value !== "string" || !Object.values(allowed).includes(value as T)) {
    throw new Error(`${name} is invalid`);
  }
  return value as T;
}
function positiveInteger(value: unknown, name: string): number {
  if (!Number.isInteger(value) || (value as number) < 1) {
    throw new Error(`${name} must be a positive integer`);
  }
  return value as number;
}
function requiredText(value: unknown, name: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${name} is required`);
  }
  return value.trim();
}
function assertAllowedKeys(
  input: AnyRecord,
  allowed: ReadonlySet<string>,
  name: string
) {
  for (const key of Object.keys(input)) {
    if (!allowed.has(key)) throw new Error(`${name} field ${key} is not allowed`);
  }
}
function assertNoRawOrderCarrier(value: unknown): void {
  if (!value || typeof value !== "object") return;
  for (const [key, entry] of Object.entries(value as AnyRecord)) {
    if (unsafeFieldPattern.test(key)) {
      throw new Error(`raw order/customer field is not allowed: ${key}`);
    }
    if (typeof entry === "string" && isUnsafeString(entry)) {
      throw new Error(`unsafe order/customer value is not allowed: ${key}`);
    }
    if (entry && typeof entry === "object") assertNoRawOrderCarrier(entry);
  }
}
function isPlainRecord(value: unknown): value is AnyRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function isUnsafeString(value: string): boolean {
  return unsafeRefPatterns.some((pattern) => pattern.test(value));
}
function rowPrefix(rowNumber?: number): string {
  return rowNumber ? `row ${rowNumber} ` : "";
}
