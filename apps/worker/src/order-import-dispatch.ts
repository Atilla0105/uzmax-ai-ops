import type {
  OrderImportCsvTextPersistenceJobInput,
  OrderImportCsvTextPersistenceJobResult,
  OrderImportWorkerPersistenceGateway
} from "./main.ts";

export const orderImportWorkerJobNames = {
  csvText: "order_import_csv_text"
} as const;

export type OrderImportWorkerJobName =
  (typeof orderImportWorkerJobNames)[keyof typeof orderImportWorkerJobNames];

export type OrderImportCsvTextDispatchInput = OrderImportCsvTextPersistenceJobInput & {
  attempt?: number;
  backoffMs?: number;
  enqueuedAt: string;
  idempotencyKey: string;
  jobId: string;
  jobName?: OrderImportWorkerJobName;
  maxAttempts?: number;
};

type NormalizedDispatchInput = OrderImportCsvTextDispatchInput & {
  attempt: number;
  backoffMs: number;
  jobName: typeof orderImportWorkerJobNames.csvText;
  maxAttempts: number;
};

export type OrderImportCsvTextDispatchContract = {
  idempotencyKey: string;
  jobId: string;
  jobName: typeof orderImportWorkerJobNames.csvText;
  payload: NormalizedDispatchInput;
  retry: { attempts: number; backoffMs: number };
};

export type OrderImportCsvTextDispatchHandler = (
  input: OrderImportCsvTextPersistenceJobInput,
  gateway: OrderImportWorkerPersistenceGateway
) => Promise<OrderImportCsvTextPersistenceJobResult>;

export type OrderImportCsvTextDispatchResult =
  OrderImportCsvTextPersistenceJobResult & {
    dispatch: {
      attempt: number;
      enqueuedAt: string;
      idempotencyKey: string;
      jobId: string;
      jobName: typeof orderImportWorkerJobNames.csvText;
      maxAttempts: number;
    };
  };

export function createOrderImportCsvTextDispatchContract(
  input: OrderImportCsvTextDispatchInput
): OrderImportCsvTextDispatchContract {
  const payload = normalizeDispatchInput(input);
  return {
    idempotencyKey: payload.idempotencyKey,
    jobId: payload.jobId,
    jobName: payload.jobName,
    payload,
    retry: { attempts: payload.maxAttempts, backoffMs: payload.backoffMs }
  };
}

export async function runOrderImportCsvTextDispatchContract(
  input: OrderImportCsvTextDispatchInput,
  gateway: OrderImportWorkerPersistenceGateway,
  handler: OrderImportCsvTextDispatchHandler
): Promise<OrderImportCsvTextDispatchResult> {
  const dispatch = createOrderImportCsvTextDispatchContract(input);
  const result = await handler(dispatch.payload, gateway);
  return {
    ...result,
    dispatch: {
      attempt: dispatch.payload.attempt,
      enqueuedAt: dispatch.payload.enqueuedAt,
      idempotencyKey: dispatch.idempotencyKey,
      jobId: dispatch.jobId,
      jobName: dispatch.jobName,
      maxAttempts: dispatch.payload.maxAttempts
    }
  };
}

function normalizeDispatchInput(
  input: OrderImportCsvTextDispatchInput
): NormalizedDispatchInput {
  const jobName = input.jobName ?? orderImportWorkerJobNames.csvText;
  if (jobName !== orderImportWorkerJobNames.csvText) {
    throw new Error("order import worker jobName is unsupported");
  }
  const maxAttempts = boundedInteger(input.maxAttempts ?? 3, "maxAttempts", 1, 10);
  const attempt = boundedInteger(input.attempt ?? 1, "attempt", 1, maxAttempts);
  return {
    ...input,
    attempt,
    backoffMs: boundedInteger(input.backoffMs ?? 30_000, "backoffMs", 0, 600_000),
    enqueuedAt: timestampText(input.enqueuedAt, "enqueuedAt"),
    idempotencyKey: controlledText(input.idempotencyKey, "idempotencyKey"),
    jobId: uuidText(input.jobId, "jobId"),
    jobName,
    maxAttempts
  };
}

function boundedInteger(
  value: unknown,
  name: string,
  minimum: number,
  maximum: number
): number {
  if (
    !Number.isInteger(value) ||
    (value as number) < minimum ||
    (value as number) > maximum
  ) {
    throw new Error(`${name} must be an integer from ${minimum} to ${maximum}`);
  }
  return value as number;
}

function timestampText(value: unknown, name: string): string {
  const text = nonEmptyText(value, name);
  if (!Number.isFinite(Date.parse(text))) throw new Error(`${name} must be parseable`);
  return text;
}

function uuidText(value: unknown, name: string): string {
  const text = nonEmptyText(value, name);
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      text
    )
  ) {
    throw new Error(`${name} must be a UUID`);
  }
  return text;
}

function controlledText(value: unknown, name: string): string {
  const text = nonEmptyText(value, name);
  if (!/^(controlled|import):\/\/[a-z0-9][a-z0-9/._:-]{0,180}$/i.test(text)) {
    throw new Error(`${name} must be a controlled ref`);
  }
  return text;
}

function nonEmptyText(value: unknown, name: string): string {
  if (typeof value !== "string" || !value.trim())
    throw new Error(`${name} is required`);
  return value.trim();
}
