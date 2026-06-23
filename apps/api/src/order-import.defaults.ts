import type {
  OrderImportJobSummary,
  OrderImportRowErrorItem,
  OrderSnapshotRecord
} from "./order-import.types.ts";

const orgId = "11111111-1111-4111-8111-111111111111";
const tenantId = "22222222-2222-4222-8222-222222222222";

export const defaultOrderImportJobs: readonly OrderImportJobSummary[] = [
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

export const defaultOrderImportRowErrors: readonly OrderImportRowErrorItem[] = [
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

export const defaultOrderImportSnapshots: readonly OrderSnapshotRecord[] = [
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
