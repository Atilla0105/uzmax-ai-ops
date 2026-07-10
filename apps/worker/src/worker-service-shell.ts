import type { QueueOptions } from "bullmq";

import {
  createOrderImportCsvTextBullmqWorker,
  orderImportBullmqQueueDefaults
} from "./order-import-bullmq-runtime.ts";
import { createTelegramBotConversationBullmqWorker } from "./conversation-runtime.ts";
import {
  createTelegramBotConversationGateway,
  createTelegramBotConversationRuntimeOptions,
  optionalHttpUrl,
  parseTelegramAnswerMode,
  parseTelegramLlmProviderMode,
  parseTelegramPersistenceMode,
  parseTelegramRequiredCapability,
  requiredTelegramRlsDatabaseUrl,
  type TelegramAnswerMode,
  type TelegramBotWorkerRuntimeConfig,
  type TelegramPersistenceMode
} from "./telegram-bot-worker-service-runtime.ts";
import {
  runOrderImportCsvTextPersistenceJob,
  type OrderImportWorkerPersistenceGateway
} from "./main.ts";
import { telegramBotConversationQueueDefaults } from "../../../packages/channels/src/index.ts";
import {
  parseTelegramBotAllowedChatExternalRefs,
  parseTelegramBotAllowedParticipantExternalRefs
} from "../../../packages/channels/src/telegram-bot-inbound-contract.ts";

export { createTelegramBotAnswerRuntime } from "./telegram-bot-answer-runtime.ts";
type Env = Record<string, string | undefined>;
type WorkerLog = (entry: Record<string, unknown>) => void;
type WorkerKind = "order-import" | "telegram-bot-conversation";
type WorkerServiceConfig = TelegramBotWorkerRuntimeConfig & {
  connection: QueueOptions["connection"];
  orderImportQueueName: string;
  prefix?: string;
  queues: readonly WorkerKind[];
  telegramBotConversationQueueName: string;
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
    telegramAnswerMode: TelegramAnswerMode;
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
    const { gateway, prisma, resource } = await createTelegramBotConversationGateway(
      config,
      log
    );
    const runtimeOptions = createTelegramBotConversationRuntimeOptions({
      config,
      log,
      prisma
    });
    const worker = createTelegramBotConversationBullmqWorker({
      connection: config.connection,
      gateway,
      prefix: config.prefix,
      queueName: config.telegramBotConversationQueueName,
      runtimeOptions
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
      telegramAnswerMode: config.telegramAnswerMode,
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
      queueName,
      result: resultRecord(result),
      service: "worker"
    });
  });
  worker.on("failed", () => {
    log({
      errorCode: "telegram_bot_job_failed",
      event: "worker.telegram_bot.failed",
      queueName,
      service: "worker"
    });
  });
  worker.on("error", () => {
    log({
      errorCode: "telegram_bot_worker_error",
      event: "worker.error",
      queueName,
      service: "worker"
    });
  });
}

function resolveWorkerServiceConfig(env: Env): WorkerServiceConfig {
  const redisUrl = requiredEnv(env, "UZMAX_REDIS_URL");
  const queues = parseWorkerQueues(env.UZMAX_WORKER_QUEUES);
  const telegramPersistenceMode = parseTelegramPersistenceMode(
    env.UZMAX_WORKER_TELEGRAM_BOT_PERSISTENCE_MODE
  );
  const telegramAnswerMode = parseTelegramAnswerMode(
    env.UZMAX_WORKER_TELEGRAM_BOT_ANSWER_MODE
  );
  const telegramLlmProviderMode = parseTelegramLlmProviderMode(
    env.UZMAX_WORKER_TELEGRAM_BOT_LLM_PROVIDER
  );
  return {
    connection: { maxRetriesPerRequest: null, url: redisUrl },
    deepSeekApiKey:
      telegramLlmProviderMode === "deepseek"
        ? requiredValue(env.UZMAXADMIN_DEEPSEEK_KEY, "UZMAXADMIN_DEEPSEEK_KEY")
        : undefined,
    deepSeekBaseUrl: optionalHttpUrl(env.UZMAX_WORKER_DEEPSEEK_BASE_URL),
    deepSeekModelId: optionalControlledText(
      env.UZMAX_WORKER_DEEPSEEK_MODEL,
      "deepSeekModelId"
    ),
    orderImportQueueName:
      optionalControlledText(env.UZMAX_WORKER_ORDER_IMPORT_QUEUE_NAME, "queueName") ??
      orderImportBullmqQueueDefaults.queueName,
    prefix: optionalControlledText(env.UZMAX_WORKER_BULLMQ_PREFIX, "prefix"),
    queues,
    rlsDatabaseUrl: queues.includes("telegram-bot-conversation")
      ? requiredTelegramRlsDatabaseUrl(env, telegramPersistenceMode, telegramAnswerMode)
      : undefined,
    telegramAiMemberKey: optionalControlledText(
      env.UZMAX_WORKER_TELEGRAM_BOT_AI_MEMBER_KEY,
      "telegramAiMemberKey"
    ),
    telegramAllowedChatExternalRefs: queues.includes("telegram-bot-conversation")
      ? parseTelegramBotAllowedChatExternalRefs(
          env.UZMAX_TELEGRAM_BOT_ALLOWED_CHAT_REFS
        )
      : new Set<string>(),
    telegramAllowedParticipantExternalRefs: queues.includes("telegram-bot-conversation")
      ? parseTelegramBotAllowedParticipantExternalRefs(
          env.UZMAX_TELEGRAM_BOT_ALLOWED_PARTICIPANT_REFS
        )
      : new Set<string>(),
    telegramAnswerMode,
    telegramBotApiBaseUrl: optionalHttpUrl(env.UZMAX_TELEGRAM_BOT_API_BASE_URL),
    telegramBotConversationQueueName:
      optionalControlledText(
        env.UZMAX_WORKER_TELEGRAM_BOT_CONVERSATION_QUEUE_NAME,
        "telegramBotConversationQueueName"
      ) ?? telegramBotConversationQueueDefaults.queueName,
    telegramBotToken: env.UZMAX_TELEGRAM_BOT_TOKEN?.trim(),
    telegramKbEntryKey: optionalControlledText(
      env.UZMAX_WORKER_TELEGRAM_BOT_KB_ENTRY_KEY,
      "telegramKbEntryKey"
    ),
    telegramLocale: optionalControlledText(
      env.UZMAX_WORKER_TELEGRAM_BOT_LOCALE,
      "telegramLocale"
    ),
    telegramLlmProviderMode,
    telegramPersistenceMode,
    telegramRequiredCapabilityKey: parseTelegramRequiredCapability(
      env.UZMAX_WORKER_TELEGRAM_BOT_REQUIRED_CAPABILITY_KEY
    )
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
