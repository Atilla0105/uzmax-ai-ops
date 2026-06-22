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
