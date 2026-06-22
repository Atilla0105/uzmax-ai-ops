import { Injectable } from "@nestjs/common";

import {
  assertPermission,
  type AccessContext
} from "../../../packages/authz/src/index.ts";
import { evaluateOrderSnapshotForRead } from "../../../packages/capabilities/order-read/src/index.ts";

import { InMemoryOrderImportRepository } from "./order-import.repository.ts";
import {
  OrderImportApiError,
  type OrderImportQueryKind
} from "./order-import.types.ts";

@Injectable()
export class OrderImportService {
  constructor(private readonly repository: InMemoryOrderImportRepository) {}

  async listImportJobs(accessContext: AccessContext) {
    assertPermission(accessContext, "order:read");
    return { items: this.repository.listJobs(accessContext) };
  }

  async listImportRowErrors(accessContext: AccessContext, jobId: string) {
    assertPermission(accessContext, "order:read");
    const job = this.repository.getJob(accessContext, jobId);
    if (!job) throw new OrderImportApiError(404, "import job not found");
    return { items: this.repository.listRowErrors(accessContext, jobId) };
  }

  async searchSnapshot(
    accessContext: AccessContext,
    input: { now?: string; queryKind: OrderImportQueryKind; queryRef: string }
  ) {
    assertPermission(accessContext, "order:read");
    return evaluateOrderSnapshotForRead({
      now: input.now,
      queryKind: input.queryKind,
      queryRef: input.queryRef,
      snapshot: this.repository.findSnapshot(accessContext, input.queryRef)
    });
  }
}
