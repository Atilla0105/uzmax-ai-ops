import type { QueueOptions } from "bullmq";

import {
  createOrderImportCsvTextBullmqWorker,
  orderImportBullmqQueueDefaults
} from "./order-import-bullmq-runtime.ts";
import {
  createTelegramBotConversationBullmqWorker,
  type TelegramBotConversationPersistenceGateway
} from "./conversation-runtime.ts";
import { PrismaTelegramBotConversationPersistenceGateway } from "./telegram-bot-conversation-persistence.ts";
import {
  runOrderImportCsvTextPersistenceJob,
  type OrderImportWorkerPersistenceGateway
} from "./main.ts";
import { telegramBotConversationQueueDefaults } from "../../../packages/channels/src/index.ts";

type Env = Record<string, string | undefined>;
type WorkerLog = (entry: Record<string, unknown>) => void;
type WorkerKind = "order-import" | "telegram-bot-conversation";
type TelegramPersistenceMode = "rls_prisma_gateway" | "telemetry";
type TelegramBotPrismaGatewayClient = ConstructorParameters<
  typeof PrismaTelegramBotConversationPersistenceGateway
>[0];
type WorkerServiceConfig = {
  connection: QueueOptions["connection"];
  orderImportQueueName: string;
  prefix?: string;
  queues: readonly WorkerKind[];
  rlsDatabaseUrl?: string;
  telegramBotConversationQueueName: string;
  telegramPersistenceMode: TelegramPersistenceMode;
};
type WorkerJob = {
  attemptsMade: number;
  id?: string;
  name: string;
};
type ClosableWorker = {
  close(): Promise<void>;
  on(event: "completed", listener: (job: WorkerJob, result: unknown) => void): void;
  on(
    event: "failed",
    listener: (job: WorkerJob | undefined, error: Error) => void
  ): void;
  on(event: "error", listener: (error: Error) => void): void;
  waitUntilReady(): Promise<unknown>;
};
type ClosableResource = { close(): Promise<void> } | { $disconnect(): Promise<void> };

export type WorkerServiceShell = {
  close(signal?: string): Promise<void>;
  config: {
    orderImportQueueName: string;
    prefix?: string;
    queues: readonly WorkerKind[];
    telegramBotConversationQueueName: string;
    telegramPersistenceMode: TelegramPersistenceMode;
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
  const resources: ClosableResource[] = [];
  const workers: ClosableWorker[] = [];

  if (config.queues.includes("order-import")) {
    const worker = createOrderImportCsvTextBullmqWorker({
      connection: config.connection,
      gateway: createTelemetryOnlyOrderImportGateway(log),
      handler: runOrderImportCsvTextPersistenceJob,
      prefix: config.prefix,
      queueName: config.orderImportQueueName
    });
    attachOrderImportLogs(worker, config.orderImportQueueName, log);
    workers.push(worker);
  }

  if (config.queues.includes("telegram-bot-conversation")) {
    const { gateway, resource } = await createTelegramBotConversationGateway(
      config,
      log
    );
    const worker = createTelegramBotConversationBullmqWorker({
      connection: config.connection,
      gateway,
      prefix: config.prefix,
      queueName: config.telegramBotConversationQueueName
    });
    attachTelegramBotConversationLogs(
      worker,
      config.telegramBotConversationQueueName,
      log
    );
    if (resource) resources.push(resource);
    workers.push(worker);
  }

  let closed = false;
  log({
    event: "worker.starting",
    prefix: config.prefix,
    queues: config.queues,
    service: "worker"
  });
  await Promise.all(workers.map((worker) => worker.waitUntilReady()));
  log({
    event: "worker.ready",
    prefix: config.prefix,
    queues: config.queues,
    service: "worker",
    status: "ready"
  });

  return {
    async close(signal = "manual") {
      if (closed) return;
      closed = true;
      log({
        event: "worker.shutdown.start",
        queues: config.queues,
        service: "worker",
        signal
      });
      await Promise.all(workers.map(closeWorker));
      await Promise.all(resources.map(closeResource));
      log({
        event: "worker.shutdown.complete",
        queues: config.queues,
        service: "worker",
        signal
      });
    },
    config: {
      orderImportQueueName: config.orderImportQueueName,
      prefix: config.prefix,
      queues: config.queues,
      telegramBotConversationQueueName: config.telegramBotConversationQueueName,
      telegramPersistenceMode: config.telegramPersistenceMode
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

function attachOrderImportLogs(
  worker: ClosableWorker,
  queueName: string,
  log: WorkerLog
) {
  worker.on("completed", (job, result) => {
    log({
      attemptsMade: job.attemptsMade,
      event: "worker.order_import.completed",
      jobId: job.id,
      persisted: resultRecord(result).persisted,
      queueName,
      service: "worker"
    });
  });
  worker.on("failed", (job, error) => {
    log({
      error: error.message,
      event: "worker.order_import.failed",
      jobId: job?.id,
      queueName,
      service: "worker"
    });
  });
  worker.on("error", (error) => {
    log({ error: error.message, event: "worker.error", queueName, service: "worker" });
  });
}

function attachTelegramBotConversationLogs(
  worker: ClosableWorker,
  queueName: string,
  log: WorkerLog
) {
  worker.on("completed", (job, result) => {
    log({
      attemptsMade: job.attemptsMade,
      event: "worker.telegram_bot.completed",
      jobId: job.id,
      queueName,
      result: resultRecord(result),
      service: "worker"
    });
  });
  worker.on("failed", (job, error) => {
    log({
      error: error.message,
      event: "worker.telegram_bot.failed",
      jobId: job?.id,
      queueName,
      service: "worker"
    });
  });
  worker.on("error", (error) => {
    log({ error: error.message, event: "worker.error", queueName, service: "worker" });
  });
}

async function createTelegramBotConversationGateway(
  config: WorkerServiceConfig,
  log: WorkerLog
): Promise<{
  gateway: TelegramBotConversationPersistenceGateway;
  resource?: ClosableResource;
}> {
  if (config.telegramPersistenceMode === "telemetry") {
    return { gateway: createTelemetryOnlyTelegramBotConversationGateway(log) };
  }

  const dbUrl = requiredValue(config.rlsDatabaseUrl, "UZMAX_RLS_DATABASE_URL");
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });
  return {
    gateway: new PrismaTelegramBotConversationPersistenceGateway(
      prisma as unknown as TelegramBotPrismaGatewayClient
    ),
    resource: prisma
  };
}

function createTelemetryOnlyTelegramBotConversationGateway(
  log: WorkerLog
): TelegramBotConversationPersistenceGateway {
  const seen = new Set<string>();
  return {
    persistAcceptedUpdate(input) {
      const key = [
        input.dedupe.orgId,
        input.dedupe.tenantId,
        input.dedupe.channelConnectionId,
        input.dedupe.providerUpdateId
      ].join("__");
      if (seen.has(key)) {
        log({
          event: "worker.telegram_bot.persist.deduped",
          providerUpdateId: input.dedupe.providerUpdateId,
          service: "worker",
          traceId: input.traceId
        });
        return {
          providerUpdateId: input.dedupe.providerUpdateId,
          status: "deduped",
          traceId: input.traceId
        };
      }

      seen.add(key);
      log({
        contentKind: input.message.contentKind,
        event: "worker.telegram_bot.persist.accepted",
        providerUpdateId: input.dedupe.providerUpdateId,
        runtimeBranch: input.runtimeBranch,
        service: "worker",
        traceId: input.traceId
      });
      return {
        conversationId: input.conversation.id,
        messageId: input.message.id,
        outboundMessageId:
          input.runtimeBranch === "answer" ? input.outboundMessage.id : undefined,
        providerUpdateId: input.dedupe.providerUpdateId,
        runtimeBranch: input.runtimeBranch,
        status: "accepted",
        ticketId: input.runtimeBranch === "handoff" ? input.ticket.id : undefined,
        traceId: input.traceId
      };
    }
  };
}

function resolveWorkerServiceConfig(env: Env): WorkerServiceConfig {
  const redisUrl = requiredEnv(env, "UZMAX_REDIS_URL");
  const queues = parseWorkerQueues(env.UZMAX_WORKER_QUEUES);
  const telegramPersistenceMode = parseTelegramPersistenceMode(
    env.UZMAX_WORKER_TELEGRAM_BOT_PERSISTENCE_MODE
  );
  return {
    connection: { maxRetriesPerRequest: null, url: redisUrl },
    orderImportQueueName:
      optionalControlledText(env.UZMAX_WORKER_ORDER_IMPORT_QUEUE_NAME, "queueName") ??
      orderImportBullmqQueueDefaults.queueName,
    prefix: optionalControlledText(env.UZMAX_WORKER_BULLMQ_PREFIX, "prefix"),
    queues,
    rlsDatabaseUrl: queues.includes("telegram-bot-conversation")
      ? requiredRlsDatabaseUrl(env, telegramPersistenceMode)
      : undefined,
    telegramBotConversationQueueName:
      optionalControlledText(
        env.UZMAX_WORKER_TELEGRAM_BOT_CONVERSATION_QUEUE_NAME,
        "telegramBotConversationQueueName"
      ) ?? telegramBotConversationQueueDefaults.queueName,
    telegramPersistenceMode
  };
}

function parseWorkerQueues(value: string | undefined): readonly WorkerKind[] {
  if (!value?.trim()) return ["order-import"];
  const queues = value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((queue) => {
      if (queue === "order-import" || queue === "telegram-bot-conversation") {
        return queue;
      }
      throw new Error("UZMAX_WORKER_QUEUES contains unsupported queue");
    });
  return queues.length === 0 ? ["order-import"] : [...new Set(queues)];
}

function parseTelegramPersistenceMode(
  value: string | undefined
): TelegramPersistenceMode {
  if (!value?.trim()) return "rls_prisma_gateway";
  if (value === "rls_prisma_gateway" || value === "telemetry") return value;
  throw new Error("UZMAX_WORKER_TELEGRAM_BOT_PERSISTENCE_MODE is invalid");
}

function requiredRlsDatabaseUrl(env: Env, mode: TelegramPersistenceMode) {
  if (mode === "telemetry") return undefined;
  return requiredEnv(env, "UZMAX_RLS_DATABASE_URL");
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

async function closeResource(resource: ClosableResource) {
  if ("$disconnect" in resource) {
    await resource.$disconnect();
    return;
  }
  await resource.close();
}

function resultRecord(value: unknown) {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function requiredEnv(env: Env, name: string) {
  return requiredValue(env[name], name);
}

function requiredValue(value: string | undefined, name: string) {
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
