import { createHash } from "node:crypto";

import { Queue, Worker, type Job, type JobsOptions, type QueueOptions } from "bullmq";

import {
  createOrderImportCsvTextDispatchContract,
  orderImportWorkerJobNames,
  runOrderImportCsvTextDispatchContract,
  type OrderImportCsvTextDispatchContract,
  type OrderImportCsvTextDispatchHandler,
  type OrderImportCsvTextDispatchInput,
  type OrderImportCsvTextDispatchResult
} from "./order-import-dispatch.ts";
import type { OrderImportWorkerPersistenceGateway } from "./main.ts";

export const orderImportBullmqQueueDefaults = {
  healthThresholds: { backlog: 25, delayed: 10, failed: 1, waiting: 20 },
  lockPrefix: "uzmax:m4:order-import:storage-lock",
  lockTtlMs: 900_000,
  queueName: "order-import"
} as const;

type RuntimeJobData = OrderImportCsvTextDispatchContract["payload"];
type RuntimeJobName = typeof orderImportWorkerJobNames.csvText;
type RuntimeJob = Job<RuntimeJobData, OrderImportCsvTextDispatchResult, RuntimeJobName>;
type RuntimeQueue = Queue<
  RuntimeJobData,
  OrderImportCsvTextDispatchResult,
  RuntimeJobName
>;
type QueueRuntimeOptions = {
  connection: QueueOptions["connection"];
  prefix?: string;
  queueName?: string;
};
type ProcessorOptions = {
  gateway: OrderImportWorkerPersistenceGateway;
  handler: OrderImportCsvTextDispatchHandler;
};
type RedisLockPort = {
  eval: (
    ...args: [script: string, keyCount: number, key: string, token: string]
  ) => Promise<number | string> | number | string;
  set: (
    ...args: [key: string, token: string, pxMode: "PX", ttlMs: number, nxMode: "NX"]
  ) => Promise<"OK" | null> | "OK" | null;
};
type QueueHealthCounts = { delayed: number; failed: number; waiting: number };
type QueueHealthThresholds = Partial<QueueHealthCounts & { backlog: number }>;

export function createOrderImportBullmqQueue(
  options: QueueRuntimeOptions
): RuntimeQueue {
  return new Queue<RuntimeJobData, OrderImportCsvTextDispatchResult, RuntimeJobName>(
    options.queueName ?? orderImportBullmqQueueDefaults.queueName,
    { connection: options.connection, prefix: options.prefix }
  );
}

export function createOrderImportBullmqCsvTextJobPlan(
  input: OrderImportCsvTextDispatchInput
) {
  const contract = createOrderImportCsvTextDispatchContract(input);
  const options: JobsOptions = {
    attempts: contract.retry.attempts,
    backoff: { delay: contract.retry.backoffMs, type: "fixed" },
    jobId: contract.jobId,
    removeOnComplete: 25,
    removeOnFail: 25
  };
  return { contract, jobName: contract.jobName, options, payload: contract.payload };
}

export async function enqueueOrderImportBullmqCsvTextJob(
  queue: RuntimeQueue,
  input: OrderImportCsvTextDispatchInput
) {
  const plan = createOrderImportBullmqCsvTextJobPlan(input);
  const job = await queue.add(plan.jobName, plan.payload, plan.options);
  return { ...plan, job };
}

export function createOrderImportCsvTextBullmqProcessor(options: ProcessorOptions) {
  return async (job: RuntimeJob): Promise<OrderImportCsvTextDispatchResult> => {
    if (job.name !== orderImportWorkerJobNames.csvText) {
      throw new Error("order import BullMQ jobName is unsupported");
    }
    return runOrderImportCsvTextDispatchContract(
      {
        ...job.data,
        attempt: boundedInteger(job.attemptsMade + 1, "attempt", 1, 10),
        maxAttempts: boundedInteger(
          job.opts.attempts ?? job.data.maxAttempts,
          "maxAttempts",
          1,
          10
        )
      },
      options.gateway,
      options.handler
    );
  };
}

export function createOrderImportCsvTextBullmqWorker(
  options: QueueRuntimeOptions & ProcessorOptions
) {
  return new Worker<RuntimeJobData, OrderImportCsvTextDispatchResult, RuntimeJobName>(
    options.queueName ?? orderImportBullmqQueueDefaults.queueName,
    createOrderImportCsvTextBullmqProcessor(options),
    { connection: options.connection, prefix: options.prefix }
  );
}

export async function acquireOrderImportStorageSourceLock(
  redis: RedisLockPort,
  input: { lockPrefix?: string; sourceRef: string; token: string; ttlMs?: number }
) {
  const sourceRef = storageSourceRef(input.sourceRef);
  const token = lockToken(input.token);
  const ttlMs = boundedInteger(
    input.ttlMs ?? orderImportBullmqQueueDefaults.lockTtlMs,
    "ttlMs",
    1_000,
    86_400_000
  );
  const key = orderImportStorageSourceLockKey(sourceRef, input.lockPrefix);
  if ((await redis.set(key, token, "PX", ttlMs, "NX")) !== "OK") {
    throw new Error("order import storage source is already locked");
  }
  return {
    key,
    release: () => releaseOrderImportStorageSourceLock(redis, { key, token }),
    sourceRef,
    token
  };
}

export async function releaseOrderImportStorageSourceLock(
  redis: RedisLockPort,
  input: { key: string; token: string }
) {
  const released = await redis.eval(
    'if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("del", KEYS[1]) else return 0 end',
    1,
    lockKey(input.key),
    lockToken(input.token)
  );
  return Number(released) === 1;
}

export function orderImportStorageSourceLockKey(
  sourceRef: string,
  lockPrefix: string = orderImportBullmqQueueDefaults.lockPrefix
) {
  const digest = createHash("sha256").update(storageSourceRef(sourceRef)).digest("hex");
  return `${lockPrefix}:${digest}`;
}

export async function getOrderImportBullmqQueueHealthSnapshot(
  queue: Pick<RuntimeQueue, "getJobCounts">,
  thresholds: QueueHealthThresholds = {}
) {
  const counts = await queue.getJobCounts("waiting", "delayed", "failed");
  return evaluateOrderImportBullmqQueueHealth(
    {
      delayed: boundedInteger(counts.delayed, "delayed", 0, 1_000_000),
      failed: boundedInteger(counts.failed, "failed", 0, 1_000_000),
      waiting: boundedInteger(counts.waiting, "waiting", 0, 1_000_000)
    },
    thresholds
  );
}

export function evaluateOrderImportBullmqQueueHealth(
  counts: QueueHealthCounts,
  thresholds: QueueHealthThresholds = {}
) {
  const resolved = Object.assign(
    {},
    orderImportBullmqQueueDefaults.healthThresholds,
    thresholds
  );
  const backlog = counts.waiting + counts.delayed;
  const alerts = [
    queueAlert("order_import_queue_waiting_high", counts.waiting, resolved.waiting),
    queueAlert("order_import_queue_delayed_high", counts.delayed, resolved.delayed),
    queueAlert("order_import_queue_failed_high", counts.failed, resolved.failed),
    queueAlert("order_import_queue_backlog_high", backlog, resolved.backlog)
  ].filter((alert) => alert !== null);
  return {
    ...counts,
    alerts,
    backlog,
    status: alerts.length > 0 ? "alert" : "ok"
  };
}

function queueAlert(code: string, count: number, threshold: number) {
  return count >= threshold ? { code, count, threshold } : null;
}

function boundedInteger(
  value: unknown,
  name: string,
  minimum: number,
  maximum: number
) {
  const numeric = Number.isInteger(value) ? (value as number) : Number.NaN;
  if (numeric < minimum || numeric > maximum) {
    throw new Error(`${name} must be an integer from ${minimum} to ${maximum}`);
  }
  return numeric;
}

function storageSourceRef(value: unknown) {
  return patternValue(
    value,
    "sourceRef",
    /^storage:\/\/[a-z0-9][a-z0-9/._:-]{0,180}$/i,
    "sourceRef must be a controlled Storage ref"
  );
}

function lockKey(value: unknown) {
  return patternValue(
    value,
    "lockKey",
    /^[a-z0-9][a-z0-9:._-]{1,220}:[a-f0-9]{64}$/i,
    "lockKey must be controlled"
  );
}

function lockToken(value: unknown) {
  return patternValue(
    value,
    "token",
    /^[a-z0-9][a-z0-9._:-]{7,120}$/i,
    "token must be a controlled lock token"
  );
}

function patternValue(value: unknown, name: string, pattern: RegExp, message: string) {
  const text = textValue(value, name);
  if (!pattern.test(text)) throw new Error(message);
  return text;
}

function textValue(value: unknown, name: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${name} is required`);
  }
  return value.trim();
}
