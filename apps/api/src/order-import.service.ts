import { Inject, Injectable, Optional } from "@nestjs/common";

import {
  assertPermission,
  type AccessContext
} from "../../../packages/authz/src/index.ts";
import {
  evaluateOrderSnapshotForRead,
  type OrderReadResult
} from "../../../packages/capabilities/order-read/src/index.ts";

import {
  ORDER_IMPORT_REPOSITORY,
  type OrderImportRepositoryPort
} from "./order-import.repository.ts";
import {
  OrderImportApiError,
  type OrderImportQueryKind
} from "./order-import.types.ts";
import {
  ORDER_IMPORT_SUBMIT_DISPATCHER,
  orderImportCsvTextSubmitInput,
  orderImportStorageObjectSubmitInput,
  orderImportSubmitResponse,
  type OrderImportSubmitDispatcherPort
} from "./order-import.submit.ts";

@Injectable()
export class OrderImportService {
  constructor(
    @Inject(ORDER_IMPORT_REPOSITORY)
    private readonly repository: OrderImportRepositoryPort,
    @Optional()
    @Inject(ORDER_IMPORT_SUBMIT_DISPATCHER)
    private readonly submitDispatcher?: OrderImportSubmitDispatcherPort
  ) {}

  async listImportJobs(accessContext: AccessContext) {
    assertPermission(accessContext, "order:read");
    return { items: await this.repository.listJobs(accessContext) };
  }

  async listImportRowErrors(accessContext: AccessContext, jobId: string) {
    assertPermission(accessContext, "order:read");
    const job = await this.repository.getJob(accessContext, jobId);
    if (!job) throw new OrderImportApiError(404, "import job not found");
    return { items: await this.repository.listRowErrors(accessContext, jobId) };
  }

  async searchSnapshot(
    accessContext: AccessContext,
    input: { now?: string; queryKind: OrderImportQueryKind; queryRef: string }
  ) {
    assertPermission(accessContext, "order:read");
    const result = evaluateOrderSnapshotForRead({
      now: input.now,
      queryKind: input.queryKind,
      queryRef: input.queryRef,
      snapshot: await this.repository.findSnapshot(accessContext, {
        queryKind: input.queryKind,
        queryRef: input.queryRef
      })
    });
    return withOrderSnapshotRuntimeWarning(result);
  }

  async submitImportCsvTextJob(accessContext: AccessContext, body: unknown) {
    assertPermission(accessContext, "order:write");
    if (!this.submitDispatcher) {
      throw new OrderImportApiError(
        403,
        "order import submit dispatcher is not configured"
      );
    }

    const input = orderImportCsvTextSubmitInput(body);
    const result = await this.submitDispatcher.dispatchCsvText({
      ...input,
      createdByUserId: accessContext.userId,
      enqueuedAt: input.importedAt,
      idempotencyKey: `controlled://order-import/${input.importJobId}`,
      jobId: input.importJobId,
      orgId: accessContext.orgId,
      tenantId: accessContext.selectedTenantId
    });

    return orderImportSubmitResponse({
      importJobId: input.importJobId,
      result,
      sourceRef: input.sourceRef
    });
  }

  async submitImportStorageObjectJob(accessContext: AccessContext, body: unknown) {
    assertPermission(accessContext, "order:write");
    if (!this.submitDispatcher?.dispatchStorageObject) {
      throw new OrderImportApiError(
        403,
        "order import storage submit dispatcher is not configured"
      );
    }

    const input = orderImportStorageObjectSubmitInput(body);
    const result = await this.submitDispatcher.dispatchStorageObject({
      ...input,
      createdByUserId: accessContext.userId,
      enqueuedAt: input.importedAt,
      idempotencyKey: `controlled://order-import/${input.importJobId}`,
      jobId: input.importJobId,
      orgId: accessContext.orgId,
      tenantId: accessContext.selectedTenantId
    });

    return orderImportSubmitResponse({
      importJobId: input.importJobId,
      result,
      sourceRef: input.sourceRef
    });
  }
}

function withOrderSnapshotRuntimeWarning(result: OrderReadResult) {
  if (result.status === "snapshot_ready") return result;

  return {
    ...result,
    runtimeWarning: {
      code: result.reasonCode,
      expiresAt: result.customerVisible.expiresAt,
      handoffRequired: true,
      messageRef:
        result.queryLogDraft.reasonRef ??
        `reason://order-read/${result.reasonCode.replaceAll("_", "-")}`,
      sourceUpdatedAt: result.customerVisible.sourceUpdatedAt,
      staleSnapshotUsed: result.queryLogDraft.staleSnapshotUsed
    }
  };
}
