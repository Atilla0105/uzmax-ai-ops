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

const ORDER_IMPORT_SUBMIT_DISPATCHER = "ORDER_IMPORT_SUBMIT_DISPATCHER";

type MaybePromise<T> = Promise<T> | T;

type OrderImportCsvTextSubmitInput = {
  csvText: string;
  importedAt: string;
  importJobId: string;
  maxRows?: number;
  rowErrorIds: readonly string[];
  snapshotIds: readonly string[];
  sourceRef: string;
};

type OrderImportCsvTextSubmitDispatchInput = OrderImportCsvTextSubmitInput & {
  createdByUserId: string;
  enqueuedAt: string;
  idempotencyKey: string;
  jobId: string;
  orgId: string;
  tenantId: string;
};

type OrderImportCsvTextSubmitDispatchResult = {
  dispatch: {
    idempotencyKey: string;
    jobId: string;
    jobName: string;
  };
  persisted: {
    importJobs: number;
    rowErrors: number;
    snapshots: number;
  };
};

type OrderImportSubmitDispatcherPort = {
  dispatchCsvText(
    input: OrderImportCsvTextSubmitDispatchInput
  ): MaybePromise<OrderImportCsvTextSubmitDispatchResult>;
};

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

    return {
      dispatch: {
        idempotencyKey: requiredText(
          result.dispatch.idempotencyKey,
          "dispatch.idempotencyKey"
        ),
        jobId: requiredText(result.dispatch.jobId, "dispatch.jobId"),
        jobName: requiredText(result.dispatch.jobName, "dispatch.jobName")
      },
      importJobId: input.importJobId,
      persisted: {
        importJobs: nonNegativeInteger(
          result.persisted.importJobs,
          "persisted.importJobs"
        ),
        rowErrors: nonNegativeInteger(
          result.persisted.rowErrors,
          "persisted.rowErrors"
        ),
        snapshots: nonNegativeInteger(result.persisted.snapshots, "persisted.snapshots")
      },
      sourceRef: input.sourceRef,
      status: "submitted"
    };
  }
}

function orderImportCsvTextSubmitInput(body: unknown): OrderImportCsvTextSubmitInput {
  const record = recordValue(body, "order import submit body");
  const maxRows =
    record.maxRows === undefined
      ? undefined
      : positiveInteger(record.maxRows, "maxRows");
  return {
    csvText: requiredText(record.csvText, "csvText"),
    importedAt: timestampText(record.importedAt, "importedAt"),
    importJobId: uuidText(record.importJobId, "importJobId"),
    maxRows,
    rowErrorIds: uuidArray(record.rowErrorIds, "rowErrorIds"),
    snapshotIds: uuidArray(record.snapshotIds, "snapshotIds"),
    sourceRef: controlledSourceRef(record.sourceRef, "sourceRef")
  };
}

function recordValue(value: unknown, name: string): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  throw new OrderImportApiError(400, `${name} must be an object`);
}

function uuidArray(value: unknown, name: string): string[] {
  if (!Array.isArray(value)) throw new OrderImportApiError(400, `${name} is required`);
  return value.map((item, index) => uuidText(item, `${name}.${index}`));
}

function requiredText(value: unknown, name: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new OrderImportApiError(400, `${name} is required`);
  }
  return value.trim();
}

function timestampText(value: unknown, name: string): string {
  const text = requiredText(value, name);
  if (!Number.isFinite(Date.parse(text))) {
    throw new OrderImportApiError(400, `${name} must be parseable`);
  }
  return text;
}

function uuidText(value: unknown, name: string): string {
  const text = requiredText(value, name);
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      text
    )
  ) {
    throw new OrderImportApiError(400, `${name} must be a UUID`);
  }
  return text;
}

function controlledSourceRef(value: unknown, name: string): string {
  const text = requiredText(value, name);
  if (
    !/^(controlled|import|storage|upload):\/\/[a-z0-9][a-z0-9/._:-]{0,220}$/i.test(text)
  ) {
    throw new OrderImportApiError(400, `${name} must be a controlled import ref`);
  }
  return text;
}

function positiveInteger(value: unknown, name: string): number {
  if (!Number.isInteger(value) || (value as number) < 1 || (value as number) > 5000) {
    throw new OrderImportApiError(400, `${name} must be an integer from 1 to 5000`);
  }
  return value as number;
}

function nonNegativeInteger(value: unknown, name: string): number {
  if (!Number.isInteger(value) || (value as number) < 0) {
    throw new OrderImportApiError(400, `${name} must be a non-negative integer`);
  }
  return value as number;
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
