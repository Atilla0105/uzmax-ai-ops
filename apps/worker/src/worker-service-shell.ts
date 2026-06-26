import type { QueueOptions } from "bullmq";

import {
  createOrderImportCsvTextBullmqWorker,
  orderImportBullmqQueueDefaults
} from "./order-import-bullmq-runtime.ts";
import {
  runOrderImportCsvTextPersistenceJob,
  type OrderImportWorkerPersistenceGateway
} from "./main.ts";

type Env = Record<string, string | undefined>;
type WorkerLog = (entry: Record<string, unknown>) => void;
type WorkerServiceConfig = {
  connection: QueueOptions["connection"];
  prefix?: string;
  queueName: string;
};
type ClosableWorker = { close(): Promise<void> };

export type WorkerServiceShell = {
  close(signal?: string): Promise<void>;
  config: {
    prefix?: string;
    queueName: string;
  };
};

const controlledQueueTextPattern = /^[a-z0-9][a-z0-9._:-]{0,120}$/i;

export async function startWorkerServiceShell(
  options: {
    env?: Env;
    log?: WorkerLog;
  } = {}
): Promise<WorkerServiceShell> {
  const log = options.log ?? logJson;
  const config = resolveWorkerServiceConfig(options.env ?? process.env);
  const gateway = createTelemetryOnlyOrderImportGateway(log);
  const worker = createOrderImportCsvTextBullmqWorker({
    ...config,
    gateway,
    handler: runOrderImportCsvTextPersistenceJob
  });
  let closed = false;

  worker.on("completed", (job, result) => {
    log({
      attemptsMade: job.attemptsMade,
      event: "worker.order_import.completed",
      jobId: job.id,
      persisted: result.persisted,
      queueName: config.queueName,
      service: "worker"
    });
  });
  worker.on("failed", (job, error) => {
    log({
      error: error.message,
      event: "worker.order_import.failed",
      jobId: job?.id,
      queueName: config.queueName,
      service: "worker"
    });
  });
  worker.on("error", (error) => {
    log({
      error: error.message,
      event: "worker.error",
      queueName: config.queueName,
      service: "worker"
    });
  });

  log({
    event: "worker.starting",
    prefix: config.prefix,
    queueName: config.queueName,
    service: "worker"
  });
  await worker.waitUntilReady();
  log({
    event: "worker.ready",
    prefix: config.prefix,
    queueName: config.queueName,
    service: "worker",
    status: "ready"
  });

  return {
    async close(signal = "manual") {
      if (closed) return;
      closed = true;
      log({
        event: "worker.shutdown.start",
        queueName: config.queueName,
        service: "worker",
        signal
      });
      await closeWorker(worker);
      log({
        event: "worker.shutdown.complete",
        queueName: config.queueName,
        service: "worker",
        signal
      });
    },
    config: {
      prefix: config.prefix,
      queueName: config.queueName
    }
  };
}

export async function runWorkerServiceShellFromCli() {
  let service: WorkerServiceShell | undefined;
  const shutdown = async (signal: string) => {
    try {
      await service?.close(signal);
      process.exit(0);
    } catch (error) {
      logJson({
        error: error instanceof Error ? error.message : String(error),
        event: "worker.shutdown.error",
        service: "worker",
        signal
      });
      process.exit(1);
    }
  };

  process.once("SIGINT", () => void shutdown("SIGINT"));
  process.once("SIGTERM", () => void shutdown("SIGTERM"));

  try {
    service = await startWorkerServiceShell();
  } catch (error) {
    logJson({
      error: error instanceof Error ? error.message : String(error),
      event: "worker.startup.error",
      service: "worker"
    });
    process.exit(1);
  }

  await new Promise<never>(() => undefined);
}

function resolveWorkerServiceConfig(env: Env): WorkerServiceConfig {
  const redisUrl = requiredEnv(env, "UZMAX_REDIS_URL");
  return {
    connection: { maxRetriesPerRequest: null, url: redisUrl },
    prefix: optionalControlledText(env.UZMAX_WORKER_BULLMQ_PREFIX, "prefix"),
    queueName:
      optionalControlledText(env.UZMAX_WORKER_ORDER_IMPORT_QUEUE_NAME, "queueName") ??
      orderImportBullmqQueueDefaults.queueName
  };
}

function createTelemetryOnlyOrderImportGateway(
  log: WorkerLog
): OrderImportWorkerPersistenceGateway {
  return {
    persistImportJob() {
      log({ event: "worker.order_import.persist.import_job", service: "worker" });
    },
    persistImportRowErrors(drafts) {
      log({
        count: drafts.length,
        event: "worker.order_import.persist.row_errors",
        service: "worker"
      });
    },
    persistOrderSnapshots(drafts) {
      log({
        count: drafts.length,
        event: "worker.order_import.persist.snapshots",
        service: "worker"
      });
    }
  };
}

async function closeWorker(worker: ClosableWorker) {
  await worker.close();
}

function requiredEnv(env: Env, name: string) {
  const value = env[name];
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${name} is required`);
  }
  return value.trim();
}

function optionalControlledText(value: unknown, name: string) {
  if (value === undefined || value === "") return undefined;
  if (typeof value !== "string" || !controlledQueueTextPattern.test(value)) {
    throw new Error(`${name} must be controlled text`);
  }
  return value;
}

function logJson(entry: Record<string, unknown>) {
  console.log(JSON.stringify(entry));
}
