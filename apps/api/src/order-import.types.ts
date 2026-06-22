import type { AccessContext } from "../../../packages/authz/src/index.ts";
import type { OrderSnapshotDraft } from "../../../packages/capabilities/order-read/src/index.ts";

export type ApiRequestWithContext = { accessContext?: AccessContext };

export type OrderImportQueryKind =
  | "batch_ref"
  | "customer_ref"
  | "external_ref"
  | "order_ref"
  | "search_ref";

export type OrderImportJobSummary = Record<
  "id" | "orgId" | "sourceRef" | "status" | "tenantId",
  string
> &
  Record<"failedRows" | "successfulRows" | "totalRows", number> & {
    completedAt?: string;
  };

export type OrderImportRowErrorItem = Record<
  "errorCode" | "id" | "importJobId" | "messageRef" | "orgId" | "tenantId",
  string
> & {
  columnKey?: string;
  rowNumber: number;
  severity: "error";
};

export type OrderSnapshotRecord = OrderSnapshotDraft &
  Record<"orgId" | "tenantId", string> & {
    queryRefs: readonly string[];
  };

export type OrderImportSeed = {
  jobs?: readonly OrderImportJobSummary[];
  rowErrors?: readonly OrderImportRowErrorItem[];
  snapshots?: readonly OrderSnapshotRecord[];
};

export class OrderImportApiError extends Error {
  constructor(
    readonly statusCode: 400 | 403 | 404,
    message: string
  ) {
    super(message);
    this.name = "OrderImportApiError";
  }
}
