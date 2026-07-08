import {
  type TelegramBotConversationPersistenceGateway,
  type TelegramBotConversationRuntimeOptions
} from "./conversation-runtime.ts";
import { PrismaTelegramBotConversationPersistenceGateway } from "./telegram-bot-conversation-persistence.ts";
import {
  createDbBackedTelegramBotAnswerRuntime,
  type TelegramBotAnswerRuntimePrismaPort
} from "./telegram-bot-active-answer-runtime.ts";
import {
  createTelegramBotSendMessageAdapter,
  type TelegramBotOutboundSendPort
} from "../../../packages/channels/src/index.ts";

export type TelegramAnswerMode = "disabled" | "dry_run" | "live";
export type TelegramLlmProviderMode = "deepseek" | "mock";
export type TelegramPersistenceMode = "rls_prisma_gateway" | "telemetry";
const telegramRequiredCapabilityKeys = [
  "BUSINESS_DRAFT",
  "ORDER_READ",
  "QUOTE",
  "TUTORIAL",
  "VISION"
] as const;
export type TelegramRequiredCapabilityKey =
  (typeof telegramRequiredCapabilityKeys)[number];
export type TelegramBotWorkerRuntimeConfig = {
  deepSeekApiKey?: string;
  deepSeekBaseUrl?: string;
  deepSeekModelId?: string;
  rlsDatabaseUrl?: string;
  telegramAiMemberKey?: string;
  telegramAnswerMode: TelegramAnswerMode;
  telegramBotApiBaseUrl?: string;
  telegramBotToken?: string;
  telegramKbEntryKey?: string;
  telegramLocale?: string;
  telegramLlmProviderMode: TelegramLlmProviderMode;
  telegramPersistenceMode: TelegramPersistenceMode;
  telegramRequiredCapabilityKey: TelegramRequiredCapabilityKey;
};

type WorkerLog = (entry: Record<string, unknown>) => void;
type ClosableResource = { close(): Promise<void> } | { $disconnect(): Promise<void> };
type TelegramBotPrismaGatewayClient = ConstructorParameters<
  typeof PrismaTelegramBotConversationPersistenceGateway
>[0];
type TelegramBotWorkerPrismaClient = TelegramBotPrismaGatewayClient &
  TelegramBotAnswerRuntimePrismaPort;

export async function createTelegramBotConversationGateway(
  config: TelegramBotWorkerRuntimeConfig,
  log: WorkerLog
): Promise<{
  gateway: TelegramBotConversationPersistenceGateway;
  prisma?: TelegramBotWorkerPrismaClient;
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
    prisma: prisma as unknown as TelegramBotWorkerPrismaClient,
    resource: prisma
  };
}

export function createTelegramBotConversationRuntimeOptions(input: {
  config: TelegramBotWorkerRuntimeConfig;
  log: WorkerLog;
  prisma?: TelegramBotWorkerPrismaClient;
}): TelegramBotConversationRuntimeOptions {
  if (input.config.telegramAnswerMode === "disabled") return {};
  const prisma = input.prisma;
  if (!prisma) {
    throw new Error(
      "UZMAX_RLS_DATABASE_URL is required when Telegram answers are enabled"
    );
  }
  return {
    answerRuntime: createDbBackedTelegramBotAnswerRuntime({
      aiMemberKey: requiredValue(
        input.config.telegramAiMemberKey,
        "UZMAX_WORKER_TELEGRAM_BOT_AI_MEMBER_KEY"
      ),
      deepSeekApiKey: input.config.deepSeekApiKey,
      deepSeekBaseUrl: input.config.deepSeekBaseUrl,
      deepSeekModelId: input.config.deepSeekModelId,
      kbEntryKey: requiredValue(
        input.config.telegramKbEntryKey,
        "UZMAX_WORKER_TELEGRAM_BOT_KB_ENTRY_KEY"
      ),
      llmProviderMode: input.config.telegramLlmProviderMode,
      locale: input.config.telegramLocale,
      prisma,
      requiredCapabilityKey: input.config.telegramRequiredCapabilityKey
    }),
    sendPort: createTelegramBotOutboundSendPort(input.config, input.log)
  };
}

export function parseTelegramPersistenceMode(
  value: string | undefined
): TelegramPersistenceMode {
  if (!value?.trim()) return "rls_prisma_gateway";
  if (value === "rls_prisma_gateway" || value === "telemetry") return value;
  throw new Error("UZMAX_WORKER_TELEGRAM_BOT_PERSISTENCE_MODE is invalid");
}

export function parseTelegramAnswerMode(value: string | undefined): TelegramAnswerMode {
  if (!value?.trim()) return "disabled";
  if (value === "disabled" || value === "dry_run" || value === "live") return value;
  throw new Error("UZMAX_WORKER_TELEGRAM_BOT_ANSWER_MODE is invalid");
}

export function parseTelegramLlmProviderMode(
  value: string | undefined
): TelegramLlmProviderMode {
  if (!value?.trim()) return "mock";
  const normalized = value.trim().toLowerCase();
  if (normalized === "mock" || normalized === "deepseek") return normalized;
  throw new Error("UZMAX_WORKER_TELEGRAM_BOT_LLM_PROVIDER is invalid");
}

export function parseTelegramRequiredCapability(
  value: string | undefined
): TelegramRequiredCapabilityKey {
  if (!value?.trim()) return "TUTORIAL";
  const normalized = value.trim().toUpperCase().replaceAll("-", "_");
  if (
    telegramRequiredCapabilityKeys.includes(normalized as TelegramRequiredCapabilityKey)
  ) {
    return normalized as TelegramRequiredCapabilityKey;
  }
  throw new Error("UZMAX_WORKER_TELEGRAM_BOT_REQUIRED_CAPABILITY_KEY is invalid");
}

export function requiredTelegramRlsDatabaseUrl(
  env: Record<string, string | undefined>,
  mode: TelegramPersistenceMode,
  answerMode: TelegramAnswerMode
) {
  if (mode === "telemetry" && answerMode === "disabled") return undefined;
  return requiredValue(env.UZMAX_RLS_DATABASE_URL, "UZMAX_RLS_DATABASE_URL");
}

export function optionalHttpUrl(value: unknown) {
  if (value === undefined || value === "") return undefined;
  if (typeof value !== "string" || !/^https?:\/\/[a-zA-Z0-9.:/_-]+$/.test(value)) {
    throw new Error("UZMAX_TELEGRAM_BOT_API_BASE_URL must be an http(s) URL");
  }
  return value.replace(/\/+$/, "");
}

function createTelegramBotOutboundSendPort(
  config: TelegramBotWorkerRuntimeConfig,
  log: WorkerLog
): TelegramBotOutboundSendPort {
  if (config.telegramAnswerMode === "dry_run") {
    return {
      async sendMessage(request) {
        log({
          channelConnectionId: request.channelConnectionId,
          event: "worker.telegram_bot.outbound.dry_run",
          requestId: request.idempotencyKey,
          service: "worker",
          traceId: request.traceId
        });
        return {
          dryRun: true,
          provider: "telegram_bot",
          providerMessageRef: `dry-run:telegram-bot:${request.idempotencyKey}`,
          requestId: request.idempotencyKey,
          sentAt: new Date().toISOString(),
          status: "SENT",
          traceId: request.traceId
        };
      }
    };
  }

  return createTelegramBotSendMessageAdapter({
    apiBaseUrl: config.telegramBotApiBaseUrl,
    botToken: requiredValue(config.telegramBotToken, "UZMAX_TELEGRAM_BOT_TOKEN"),
    async transport(request) {
      const response = await fetch(request.url, {
        body: JSON.stringify(request.body),
        headers: request.headers,
        method: request.method
      });
      return {
        json: () => response.json() as Promise<unknown>,
        ok: response.ok,
        status: response.status
      };
    }
  });
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

function requiredValue(value: string | undefined, name: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${name} is required`);
  }
  return value.trim();
}
