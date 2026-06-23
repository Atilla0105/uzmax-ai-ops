import { Inject, Injectable } from "@nestjs/common";

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

@Injectable()
export class OrderImportService {
  constructor(
    @Inject(ORDER_IMPORT_REPOSITORY)
    private readonly repository: OrderImportRepositoryPort
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
