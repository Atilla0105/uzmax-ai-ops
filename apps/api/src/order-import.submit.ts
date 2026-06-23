import { OrderImportApiError } from "./order-import.types.ts";

export const ORDER_IMPORT_SUBMIT_DISPATCHER = "ORDER_IMPORT_SUBMIT_DISPATCHER";

type MaybePromise<T> = Promise<T> | T;

export type OrderImportCsvTextSubmitInput = {
  csvText: string;
  importedAt: string;
  importJobId: string;
  maxRows?: number;
  rowErrorIds: readonly string[];
  snapshotIds: readonly string[];
  sourceRef: string;
};

export type OrderImportStorageObjectSubmitInput = {
  bucketId: string;
  importedAt: string;
  importJobId: string;
  maxRows?: number;
  mediaType?: string;
  objectPath: string;
  rowErrorIds: readonly string[];
  snapshotIds: readonly string[];
  sourceRef: string;
};

type OrderImportCsvTextSubmitDispatchInput = OrderImportCsvTextSubmitInput &
  OrderImportSubmitContext;

type OrderImportStorageObjectSubmitDispatchInput = OrderImportStorageObjectSubmitInput &
  OrderImportSubmitContext;

export type OrderImportSubmitDispatchResult = {
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

export type OrderImportSubmitDispatcherPort = {
  dispatchCsvText(
    input: OrderImportCsvTextSubmitDispatchInput
  ): MaybePromise<OrderImportSubmitDispatchResult>;
  dispatchStorageObject?(
    input: OrderImportStorageObjectSubmitDispatchInput
  ): MaybePromise<OrderImportSubmitDispatchResult>;
};

type OrderImportSubmitContext = {
  createdByUserId: string;
  enqueuedAt: string;
  idempotencyKey: string;
  jobId: string;
  orgId: string;
  tenantId: string;
};

export function orderImportCsvTextSubmitInput(
  body: unknown
): OrderImportCsvTextSubmitInput {
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

export function orderImportStorageObjectSubmitInput(
  body: unknown
): OrderImportStorageObjectSubmitInput {
  const record = recordValue(body, "order import storage submit body");
  rejectStorageInlinePayload(record);
  const bucketId = storageBucketId(record.bucketId);
  const objectPath = storageObjectPath(record.objectPath);
  const maxRows =
    record.maxRows === undefined
      ? undefined
      : positiveInteger(record.maxRows, "maxRows");
  return {
    bucketId,
    importedAt: timestampText(record.importedAt, "importedAt"),
    importJobId: uuidText(record.importJobId, "importJobId"),
    maxRows,
    mediaType: optionalText(record.mediaType, "mediaType"),
    objectPath,
    rowErrorIds: uuidArray(record.rowErrorIds, "rowErrorIds"),
    snapshotIds: uuidArray(record.snapshotIds, "snapshotIds"),
    sourceRef: storageSourceRef(bucketId, objectPath)
  };
}

export function orderImportSubmitResponse({
  importJobId,
  result,
  sourceRef
}: {
  importJobId: string;
  result: OrderImportSubmitDispatchResult;
  sourceRef: string;
}) {
  return {
    dispatch: {
      idempotencyKey: requiredText(
        result.dispatch.idempotencyKey,
        "dispatch.idempotencyKey"
      ),
      jobId: requiredText(result.dispatch.jobId, "dispatch.jobId"),
      jobName: requiredText(result.dispatch.jobName, "dispatch.jobName")
    },
    importJobId,
    persisted: {
      importJobs: nonNegativeInteger(
        result.persisted.importJobs,
        "persisted.importJobs"
      ),
      rowErrors: nonNegativeInteger(result.persisted.rowErrors, "persisted.rowErrors"),
      snapshots: nonNegativeInteger(result.persisted.snapshots, "persisted.snapshots")
    },
    sourceRef,
    status: "submitted"
  };
}

function rejectStorageInlinePayload(record: Record<string, unknown>) {
  if (record.csvText !== undefined) {
    throw new OrderImportApiError(400, "csvText is not accepted for storage submit");
  }
  if (record.sourceRef !== undefined) {
    throw new OrderImportApiError(400, "sourceRef is derived from storage metadata");
  }
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

function optionalText(value: unknown, name: string): string | undefined {
  return value === undefined ? undefined : requiredText(value, name);
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

function storageBucketId(value: unknown): string {
  const text = requiredText(value, "bucketId");
  if (!/^[a-z0-9][a-z0-9._-]{1,62}$/i.test(text)) {
    throw new OrderImportApiError(400, "bucketId is invalid");
  }
  return text;
}

function storageObjectPath(value: unknown): string {
  const text = requiredText(value, "objectPath");
  if (
    text.length > 150 ||
    text.startsWith("/") ||
    text.endsWith("/") ||
    text.includes("//") ||
    text.includes("..") ||
    /[\\\0]/.test(text) ||
    !/^[a-z0-9][a-z0-9/._:-]*$/i.test(text)
  ) {
    throw new OrderImportApiError(400, "objectPath is invalid");
  }
  return text;
}

function storageSourceRef(bucketId: string, objectPath: string): string {
  return controlledSourceRef(`storage://${bucketId}/${objectPath}`, "sourceRef");
}
