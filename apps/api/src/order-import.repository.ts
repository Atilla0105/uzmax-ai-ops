import type { AccessContext } from "../../../packages/authz/src/index.ts";
import type { M4OrderImportContractInput } from "../../../packages/db/src/m4-order-import-contracts.ts";

import type {
  OrderImportJobSummary,
  OrderImportQueryKind,
  OrderImportRowErrorItem,
  OrderImportSeed,
  OrderSnapshotRecord
} from "./order-import.types.ts";

export const ORDER_IMPORT_REPOSITORY = Symbol("ORDER_IMPORT_REPOSITORY");

export type OrderSnapshotLookup = {
  queryKind: OrderImportQueryKind;
  queryRef: string;
};

export type OrderImportRepositoryPort = {
  findSnapshot(
    accessContext: AccessContext,
    lookup: OrderSnapshotLookup
  ): OrderSnapshotRecord | undefined;
  getJob(
    accessContext: AccessContext,
    jobId: string
  ): OrderImportJobSummary | undefined;
  listJobs(accessContext: AccessContext): OrderImportJobSummary[];
  listRowErrors(accessContext: AccessContext, jobId: string): OrderImportRowErrorItem[];
};

export type OrderImportPersistenceScope = {
  orgId: string;
  tenantId: string;
};

export type OrderImportPersistenceGateway = {
  findOrderSnapshot(
    scope: OrderImportPersistenceScope,
    lookup: OrderSnapshotLookup
  ): M4OrderImportContractInput | undefined;
  getImportJob(
    scope: OrderImportPersistenceScope,
    jobId: string
  ): M4OrderImportContractInput | undefined;
  listImportJobs(
    scope: OrderImportPersistenceScope
  ): readonly M4OrderImportContractInput[];
  listImportRowErrors(
    scope: OrderImportPersistenceScope,
    jobId: string
  ): readonly M4OrderImportContractInput[];
};

type OrderImportPersistenceRow = M4OrderImportContractInput;

export class InMemoryOrderImportRepository implements OrderImportRepositoryPort {
  private jobs: OrderImportJobSummary[];
  private rowErrors: OrderImportRowErrorItem[];
  private snapshots: OrderSnapshotRecord[];

  constructor(seed: OrderImportSeed = {}) {
    this.jobs = [...(seed.jobs ?? defaultJobs)];
    this.rowErrors = [...(seed.rowErrors ?? defaultRowErrors)];
    this.snapshots = [...(seed.snapshots ?? defaultSnapshots)];
  }

  listJobs(accessContext: AccessContext) {
    return scoped(this.jobs, accessContext).map(clone);
  }

  getJob(accessContext: AccessContext, jobId: string) {
    return clone(scoped(this.jobs, accessContext).find((job) => job.id === jobId));
  }

  listRowErrors(accessContext: AccessContext, jobId: string) {
    return scoped(this.rowErrors, accessContext)
      .filter((rowError) => rowError.importJobId === jobId)
      .map(clone);
  }

  findSnapshot(accessContext: AccessContext, lookup: OrderSnapshotLookup) {
    return clone(
      scoped(this.snapshots, accessContext).find((snapshot) =>
        snapshot.queryRefs.includes(lookup.queryRef)
      )
    );
  }
}

export class PersistenceOrderImportRepository implements OrderImportRepositoryPort {
  constructor(private readonly gateway: OrderImportPersistenceGateway) {}

  listJobs(accessContext: AccessContext) {
    return this.gateway
      .listImportJobs(scopeFor(accessContext))
      .flatMap((row) => mapJob(row, accessContext));
  }

  getJob(accessContext: AccessContext, jobId: string) {
    const row = this.gateway.getImportJob(scopeFor(accessContext), jobId);
    return row ? mapJob(row, accessContext)[0] : undefined;
  }

  listRowErrors(accessContext: AccessContext, jobId: string) {
    return this.gateway
      .listImportRowErrors(scopeFor(accessContext), jobId)
      .flatMap((row) => mapRowError(row, accessContext));
  }

  findSnapshot(accessContext: AccessContext, lookup: OrderSnapshotLookup) {
    const row = this.gateway.findOrderSnapshot(scopeFor(accessContext), lookup);
    return row ? mapSnapshot(row, accessContext, lookup.queryRef)[0] : undefined;
  }
}

const orgId = "11111111-1111-4111-8111-111111111111";
const tenantId = "22222222-2222-4222-8222-222222222222";
const defaultJobs: readonly OrderImportJobSummary[] = [
  {
    failedRows: 1,
    id: "job-a",
    orgId,
    sourceRef: "storage://order-imports/snapshot-a",
    status: "completed_with_errors",
    successfulRows: 2,
    tenantId,
    totalRows: 3
  }
];
const defaultRowErrors: readonly OrderImportRowErrorItem[] = [
  {
    columnKey: "orderStatusRef",
    errorCode: "order_status_ref_required",
    id: "row-error-a",
    importJobId: "job-a",
    messageRef: "reason://order-import/order-status-ref-required",
    orgId,
    rowNumber: 3,
    severity: "error",
    tenantId
  }
];
const defaultSnapshots: readonly OrderSnapshotRecord[] = [
  {
    expiresAt: "2026-06-23T00:00:00.000Z",
    externalOrderRef: "controlled://order/ref-a",
    orderStatusRef: "status://order/in-transit",
    orgId,
    payloadSummary: { statusRef: "status://order/in-transit" },
    queryRefs: ["query://order/fresh-a"],
    sourceKind: "import_snapshot",
    sourceRef: "storage://order-imports/snapshot-a",
    sourceUpdatedAt: "2026-06-22T00:00:00.000Z",
    tenantId
  },
  {
    expiresAt: "2026-06-21T00:00:00.000Z",
    externalOrderRef: "controlled://order/ref-stale",
    orderStatusRef: "status://order/stale-hidden",
    orgId,
    payloadSummary: { statusRef: "status://order/stale-hidden" },
    queryRefs: ["query://order/stale-a"],
    sourceKind: "import_snapshot",
    sourceRef: "storage://order-imports/snapshot-stale-a",
    sourceUpdatedAt: "2026-06-20T00:00:00.000Z",
    tenantId
  }
];

function scoped<T extends { orgId: string; tenantId: string }>(
  items: readonly T[],
  accessContext: AccessContext
): T[] {
  return items.filter(
    (item) =>
      item.orgId === accessContext.orgId &&
      item.tenantId === accessContext.selectedTenantId
  );
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function scopeFor(accessContext: AccessContext): OrderImportPersistenceScope {
  return {
    orgId: accessContext.orgId,
    tenantId: accessContext.selectedTenantId
  };
}

function mapJob(
  row: OrderImportPersistenceRow,
  accessContext: AccessContext
): OrderImportJobSummary[] {
  if (!matchesScope(row, accessContext)) return [];
  return [
    {
      completedAt: optionalString(row.completedAt),
      failedRows: numberValue(row.failedRows),
      id: stringValue(row.id),
      orgId: stringValue(row.orgId),
      sourceRef: stringValue(row.fileRef),
      status: stringValue(row.status),
      successfulRows: numberValue(row.successfulRows),
      tenantId: stringValue(row.tenantId),
      totalRows: numberValue(row.totalRows)
    }
  ];
}

function mapRowError(
  row: OrderImportPersistenceRow,
  accessContext: AccessContext
): OrderImportRowErrorItem[] {
  if (!matchesScope(row, accessContext)) return [];
  return [
    {
      columnKey: optionalString(row.columnKey),
      errorCode: stringValue(row.errorCode),
      id: stringValue(row.id),
      importJobId: stringValue(row.importJobId),
      messageRef: stringValue(row.messageRef),
      orgId: stringValue(row.orgId),
      rowNumber: numberValue(row.rowNumber),
      severity: "error",
      tenantId: stringValue(row.tenantId)
    }
  ];
}

function mapSnapshot(
  row: OrderImportPersistenceRow,
  accessContext: AccessContext,
  queryRef: string
): OrderSnapshotRecord[] {
  if (!matchesScope(row, accessContext) || row.status === "archived") return [];
  return [
    {
      customerRef: optionalString(row.customerRef),
      expiresAt: stringValue(row.expiresAt),
      externalBatchRef: optionalString(row.externalBatchRef),
      externalOrderRef: stringValue(row.externalOrderRef),
      orderStatusRef: stringValue(row.orderStatusRef),
      orgId: stringValue(row.orgId),
      payloadSummary: recordValue(row.payloadSummary),
      queryRefs: [queryRef],
      sourceKind: "import_snapshot",
      sourceRef: stringValue(row.sourceRef),
      sourceUpdatedAt: stringValue(row.sourceUpdatedAt),
      tenantId: stringValue(row.tenantId)
    }
  ];
}

function matchesScope(row: OrderImportPersistenceRow, accessContext: AccessContext) {
  return (
    row.orgId === accessContext.orgId && row.tenantId === accessContext.selectedTenantId
  );
}

function optionalString(value: unknown): string | undefined {
  return value === undefined ? undefined : stringValue(value);
}

function stringValue(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) throw new Error("row value required");
  return value.trim();
}

function numberValue(value: unknown): number {
  if (!Number.isInteger(value)) throw new Error("row number value required");
  return value as number;
}

function recordValue(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  throw new Error("row record value required");
}
