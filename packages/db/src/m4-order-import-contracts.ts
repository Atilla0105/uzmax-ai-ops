const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type M4OrderImportContractInput = {
  orgId: string;
  tenantId: string;
} & Record<string, unknown>;

const tableNames = {
  importJob: "import_job",
  importRowError: "import_row_error",
  orderQueryLog: "order_query_log",
  orderSnapshot: "order_snapshot"
} as const;
const snapshotSourceKinds = { importSnapshot: "import_snapshot" } as const;
const snapshotStatuses = { active: "active", archived: "archived" } as const;
const importJobStatuses = {
  completed: "completed",
  completedWithErrors: "completed_with_errors",
  failed: "failed",
  queued: "queued",
  rolledBack: "rolled_back",
  running: "running"
} as const;
const rowErrorSeverities = { error: "error", warning: "warning" } as const;
const queryKinds = {
  batchRef: "batch_ref",
  customerRef: "customer_ref",
  externalRef: "external_ref",
  orderRef: "order_ref",
  searchRef: "search_ref"
} as const;
const queryOutcomes = {
  degraded: "degraded",
  handoff: "handoff",
  hit: "hit",
  miss: "miss",
  stale: "stale"
} as const;

function createOrderSnapshotContract(
  input: M4OrderImportContractInput
): Record<string, unknown> {
  const expiresAt = readText(input.expiresAt, "order snapshot expiresAt");
  const sourceUpdatedAt = readText(
    input.sourceUpdatedAt,
    "order snapshot sourceUpdatedAt"
  );
  const expiresAtTime = Date.parse(expiresAt);
  const sourceUpdatedAtTime = Date.parse(sourceUpdatedAt);
  if (!Number.isFinite(expiresAtTime) || !Number.isFinite(sourceUpdatedAtTime)) {
    throw new Error("order snapshot timestamps must be parseable");
  }
  if (expiresAtTime <= sourceUpdatedAtTime) {
    throw new Error("order snapshot expiresAt must be after sourceUpdatedAt");
  }

  return clean({
    ...tenantScope(input, "order snapshot"),
    customerId: optionalUuid(input, "customerId"),
    expiresAt,
    externalBatchRef: optionalString(input, "externalBatchRef"),
    externalOrderRef: readText(
      input.externalOrderRef,
      "order snapshot externalOrderRef"
    ),
    id: readUuid(input.id, "order snapshot id"),
    importJobId: optionalUuid(input, "importJobId"),
    metadata: optionalRecord(input, "metadata") ?? {},
    orderStatusRef: readText(input.orderStatusRef, "order snapshot orderStatusRef"),
    payloadSummary: readObject(input.payloadSummary, "order snapshot payloadSummary"),
    sourceKind: enumValue(
      input.sourceKind,
      snapshotSourceKinds,
      "order snapshot sourceKind"
    ),
    sourceRef: readText(input.sourceRef, "order snapshot sourceRef"),
    sourceUpdatedAt,
    status: enumValue(input.status, snapshotStatuses, "order snapshot status")
  });
}

function createImportJobContract(
  input: M4OrderImportContractInput
): Record<string, unknown> {
  const totalRows = optionalInteger(input, "totalRows", 0) ?? 0;
  const successfulRows = optionalInteger(input, "successfulRows", 0) ?? 0;
  const failedRows = optionalInteger(input, "failedRows", 0) ?? 0;
  if (successfulRows + failedRows > totalRows) {
    throw new Error("import job row counts cannot exceed totalRows");
  }

  return clean({
    ...tenantScope(input, "import job"),
    completedAt: optionalString(input, "completedAt"),
    createdByUserId: optionalUuid(input, "createdByUserId"),
    errorReportRef: optionalString(input, "errorReportRef"),
    failedRows,
    fileRef: readText(input.fileRef, "import job fileRef"),
    fileSha256: optionalString(input, "fileSha256"),
    id: readUuid(input.id, "import job id"),
    metadata: optionalRecord(input, "metadata") ?? {},
    rollbackOfJobId: optionalUuid(input, "rollbackOfJobId"),
    startedAt: optionalString(input, "startedAt"),
    status: enumValue(input.status, importJobStatuses, "import job status"),
    successfulRows,
    totalRows
  });
}

function createImportRowErrorContract(
  input: M4OrderImportContractInput
): Record<string, unknown> {
  return clean({
    ...tenantScope(input, "import row error"),
    columnKey: optionalString(input, "columnKey"),
    errorCode: readText(input.errorCode, "import row error errorCode"),
    id: readUuid(input.id, "import row error id"),
    importJobId: readUuid(input.importJobId, "import row error importJobId"),
    messageRef: readText(input.messageRef, "import row error messageRef"),
    metadata: optionalRecord(input, "metadata") ?? {},
    rowNumber: readInteger(input.rowNumber, "rowNumber", 1),
    rowRef: optionalString(input, "rowRef"),
    severity: enumValue(input.severity, rowErrorSeverities, "row error severity")
  });
}

function createOrderQueryLogContract(
  input: M4OrderImportContractInput
): Record<string, unknown> {
  const outcome = enumValue(input.outcome, queryOutcomes, "order query outcome");
  const staleSnapshotUsed =
    optionalBoolean(input, "staleSnapshotUsed") ?? outcome === queryOutcomes.stale;
  const handoffRequired =
    optionalBoolean(input, "handoffRequired") ?? outcome === queryOutcomes.handoff;
  if (outcome === queryOutcomes.stale && !staleSnapshotUsed) {
    throw new Error("stale order query outcome requires staleSnapshotUsed");
  }
  if (outcome === queryOutcomes.handoff && !handoffRequired) {
    throw new Error("handoff order query outcome requires handoffRequired");
  }

  return clean({
    ...tenantScope(input, "order query log"),
    customerId: optionalUuid(input, "customerId"),
    handoffRequired,
    id: readUuid(input.id, "order query log id"),
    metadata: optionalRecord(input, "metadata") ?? {},
    occurredAt: optionalString(input, "occurredAt"),
    orderSnapshotId: optionalUuid(input, "orderSnapshotId"),
    outcome,
    queryKind: enumValue(input.queryKind, queryKinds, "order query kind"),
    queryRef: readText(input.queryRef, "order query queryRef"),
    reasonRef: optionalString(input, "reasonRef"),
    staleSnapshotUsed
  });
}

export const m4OrderImportContracts = {
  createImportJobContract,
  createImportRowErrorContract,
  createOrderQueryLogContract,
  createOrderSnapshotContract,
  importJobStatuses,
  queryKinds,
  queryOutcomes,
  rowErrorSeverities,
  snapshotSourceKinds,
  snapshotStatuses,
  tableNames
} as const;

function tenantScope(input: M4OrderImportContractInput, name: string) {
  const scopedKeys = ["orgId", "tenantId"] as const;
  return Object.fromEntries(
    scopedKeys.map((key) => [key, readUuid(input[key], `${name} ${key}`)])
  ) as { orgId: string; tenantId: string };
}

function clean(record: Record<string, unknown>): Record<string, unknown> {
  const entries: Array<[string, unknown]> = [];
  for (const [key, value] of Object.entries(record)) {
    if (value !== undefined) entries.push([key, value]);
  }
  return Object.fromEntries(entries);
}

function enumValue<T extends string>(
  value: unknown,
  allowed: Record<string, T>,
  name: string
): T {
  if (typeof value !== "string") invalid(name, "is invalid");
  const match = Object.values(allowed).find((candidate) => candidate === value);
  if (!match) invalid(name, "is invalid");
  return match;
}

function optionalBoolean(
  source: M4OrderImportContractInput,
  key: string
): boolean | undefined {
  if (source[key] === undefined) return undefined;
  if (typeof source[key] !== "boolean") throw new Error(`${key} must be boolean`);
  return source[key];
}

function optionalInteger(
  source: M4OrderImportContractInput,
  key: string,
  minimum: number
): number | undefined {
  return source[key] === undefined ? undefined : readInteger(source[key], key, minimum);
}

function optionalRecord(
  source: M4OrderImportContractInput,
  key: string
): Record<string, unknown> | undefined {
  return source[key] === undefined ? undefined : readObject(source[key], key);
}

function optionalString(
  source: M4OrderImportContractInput,
  key: string
): string | undefined {
  return source[key] === undefined ? undefined : readText(source[key], key);
}

function optionalUuid(
  source: M4OrderImportContractInput,
  key: string
): string | undefined {
  return source[key] === undefined ? undefined : readUuid(source[key], key);
}

function readInteger(value: unknown, name: string, minimum: number): number {
  if (!Number.isInteger(value) || (value as number) < minimum) {
    throw new Error(`${name} must be an integer from ${minimum}`);
  }
  return value as number;
}

function readObject(value: unknown, name: string): Record<string, unknown> {
  if (isPlainRecord(value)) return value;
  invalid(name, "must be an object");
}

function readText(value: unknown, name: string): string {
  if (typeof value !== "string") invalid(name, "is required");
  const text = value.trim();
  return text ? text : invalid(name, "is required");
}

function readUuid(value: unknown, name: string): string {
  const text = readText(value, name);
  return UUID_PATTERN.test(text) ? text : invalid(name, "must be a UUID");
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function invalid(name: string, detail: string): never {
  throw new Error(`${name} ${detail}`);
}
