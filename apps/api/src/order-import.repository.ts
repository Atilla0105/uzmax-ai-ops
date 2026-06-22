import type { AccessContext } from "../../../packages/authz/src/index.ts";

import type {
  OrderImportJobSummary,
  OrderImportRowErrorItem,
  OrderImportSeed,
  OrderSnapshotRecord
} from "./order-import.types.ts";

export class InMemoryOrderImportRepository {
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

  findSnapshot(accessContext: AccessContext, queryRef: string) {
    return clone(
      scoped(this.snapshots, accessContext).find((snapshot) =>
        snapshot.queryRefs.includes(queryRef)
      )
    );
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
