import {
  createTelegramBotConversationJobId,
  createTelegramBotConversationJobPayload,
  normalizeTelegramBotUpdate,
  telegramBotConversationQueueDefaults,
  type NormalizedTelegramBotIngress
} from "../../../packages/channels/src/index.ts";
import {
  isTelegramBotInboundAllowed,
  parseTelegramBotAllowedChatExternalRefs,
  parseTelegramBotAllowedParticipantExternalRefs
} from "../../../packages/channels/src/telegram-bot-inbound-contract.ts";
import { randomUUID } from "node:crypto";
import { createRequire } from "node:module";

export const TELEGRAM_BOT_INGRESS_QUEUE = "TELEGRAM_BOT_INGRESS_QUEUE";
export const TELEGRAM_BOT_SECRET_HEADER = "x-telegram-bot-api-secret-token";
export const TELEGRAM_BOT_WEBHOOK_SECRET = "TELEGRAM_BOT_WEBHOOK_SECRET";

export type TelegramBotQueueStatus =
  | "accepted"
  | "deduped"
  | "rejected"
  | "unsupported";

export type TelegramBotQueueResult = {
  contentKind: NormalizedTelegramBotIngress["contentKind"];
  providerUpdateId: string;
  status: TelegramBotQueueStatus;
  updateKind: NormalizedTelegramBotIngress["updateKind"];
};

export type TelegramBotIngressQueuePort = {
  enqueue(update: NormalizedTelegramBotIngress): Promise<TelegramBotQueueResult>;
};

type TelegramBotIngressQueueRuntimeMode = "bullmq" | "disabled";
type BullmqConnection = { url: string };
type BullmqQueuePort = {
  add(name: string, payload: unknown, options: unknown): Promise<unknown>;
  name: string;
};
export type TelegramBotIngressRuntimeEnv = Partial<
  Record<
    | "UZMAX_REDIS_URL"
    | "UZMAX_TELEGRAM_BOT_CHANNEL_CONNECTION_ID"
    | "UZMAX_TELEGRAM_BOT_INGRESS_QUEUE_MODE"
    | "UZMAX_TELEGRAM_BOT_ALLOWED_CHAT_REFS"
    | "UZMAX_TELEGRAM_BOT_ALLOWED_PARTICIPANT_REFS"
    | "UZMAX_TELEGRAM_BOT_ORG_ID"
    | "UZMAX_TELEGRAM_BOT_TENANT_ID"
    | typeof TELEGRAM_BOT_WEBHOOK_SECRET,
    string
  >
>;

export type TelegramBotWebhookInput = {
  body: unknown;
  headers: Record<string, string | string[] | undefined>;
};

export class TelegramBotWebhookError extends Error {
  constructor(
    readonly statusCode: 400 | 401 | 503,
    message: string
  ) {
    super(message);
    this.name = "TelegramBotWebhookError";
  }
}

export class InMemoryTelegramBotIngressQueue implements TelegramBotIngressQueuePort {
  readonly jobs: NormalizedTelegramBotIngress[] = [];
  private readonly seenProviderUpdateIds = new Set<string>();

  async enqueue(update: NormalizedTelegramBotIngress): Promise<TelegramBotQueueResult> {
    if (this.seenProviderUpdateIds.has(update.providerUpdateId)) {
      return queueResult(update, "deduped");
    }

    this.seenProviderUpdateIds.add(update.providerUpdateId);
    if (update.contentKind === "unsupported") {
      return queueResult(update, "unsupported");
    }

    this.jobs.push(update);
    return queueResult(update, "accepted");
  }

  readinessStatus() {
    return "contract" as const;
  }
}

export class DisabledTelegramBotIngressQueue implements TelegramBotIngressQueuePort {
  async enqueue(): Promise<never> {
    throw new TelegramBotWebhookError(
      503,
      "telegram bot ingress queue is not configured"
    );
  }

  readinessStatus() {
    return "not_configured" as const;
  }
}

class BullmqTelegramBotIngressQueue implements TelegramBotIngressQueuePort {
  constructor(
    private readonly options: {
      allowedChatExternalRefs: ReadonlySet<string>;
      allowedParticipantExternalRefs: ReadonlySet<string>;
      channelConnectionId: string;
      orgId: string;
      queue: BullmqQueuePort;
      tenantId: string;
    }
  ) {}

  async enqueue(update: NormalizedTelegramBotIngress): Promise<TelegramBotQueueResult> {
    if (update.contentKind === "unsupported") return queueResult(update, "unsupported");
    if (!isTelegramBotInboundAllowed(update, this.options)) {
      return queueResult(update, "rejected");
    }

    const payload = createTelegramBotConversationJobPayload({
      channelConnectionId: this.options.channelConnectionId,
      orgId: this.options.orgId,
      tenantId: this.options.tenantId,
      traceId: `trace:${randomUUID()}`,
      update
    });
    await this.options.queue.add(
      telegramBotConversationQueueDefaults.jobName,
      payload,
      {
        attempts: 3,
        backoff: { delay: 1_000, type: "fixed" },
        jobId: createTelegramBotConversationJobId(payload),
        removeOnComplete: 1_000,
        removeOnFail: 1_000
      }
    );
    return queueResult(update, "accepted");
  }

  readinessStatus() {
    return "bullmq" as const;
  }
}

export class TelegramBotWebhookCore {
  constructor(
    private readonly options: {
      queue: TelegramBotIngressQueuePort;
      secretToken: string | undefined;
    }
  ) {}

  async handleWebhook(input: TelegramBotWebhookInput) {
    this.assertSecret(input.headers);
    const normalized = this.normalize(input.body);
    const queueResult = await this.options.queue.enqueue(normalized);
    const acknowledgement =
      queueResult.status === "rejected"
        ? { ...queueResult, status: "accepted" as const }
        : queueResult;
    return { ok: true, ...acknowledgement } as const;
  }

  private assertSecret(headers: TelegramBotWebhookInput["headers"]) {
    const configuredSecret = this.options.secretToken?.trim();
    if (!configuredSecret) {
      throw new TelegramBotWebhookError(
        503,
        "telegram webhook secret is not configured"
      );
    }

    if (readHeader(headers, TELEGRAM_BOT_SECRET_HEADER) !== configuredSecret) {
      throw new TelegramBotWebhookError(401, "telegram secret token mismatch");
    }
  }

  private normalize(body: unknown): NormalizedTelegramBotIngress {
    try {
      return normalizeTelegramBotUpdate(body);
    } catch (error) {
      throw new TelegramBotWebhookError(
        400,
        error instanceof Error ? error.message : "telegram update is invalid"
      );
    }
  }
}

export class TelegramBotWebhookService {
  constructor(private readonly core: TelegramBotWebhookCore) {}

  handleWebhook(input: TelegramBotWebhookInput) {
    return this.core.handleWebhook(input);
  }
}

export function createTelegramBotWebhookServiceFromEnv(
  queue: TelegramBotIngressQueuePort,
  env: TelegramBotIngressRuntimeEnv = process.env
) {
  return new TelegramBotWebhookService(
    new TelegramBotWebhookCore({
      queue,
      secretToken: env[TELEGRAM_BOT_WEBHOOK_SECRET]
    })
  );
}

export function createTelegramBotIngressQueueProviderFromEnv(
  options: {
    env?: TelegramBotIngressRuntimeEnv;
    queue?: BullmqQueuePort;
  } = {}
): TelegramBotIngressQueuePort {
  const env = options.env ?? process.env;
  const mode = readIngressQueueRuntimeMode(env);
  if (mode === "disabled") return new DisabledTelegramBotIngressQueue();

  return new BullmqTelegramBotIngressQueue({
    allowedChatExternalRefs: parseTelegramBotAllowedChatExternalRefs(
      env.UZMAX_TELEGRAM_BOT_ALLOWED_CHAT_REFS
    ),
    allowedParticipantExternalRefs: parseTelegramBotAllowedParticipantExternalRefs(
      env.UZMAX_TELEGRAM_BOT_ALLOWED_PARTICIPANT_REFS
    ),
    channelConnectionId: requiredEnv(env, "UZMAX_TELEGRAM_BOT_CHANNEL_CONNECTION_ID"),
    orgId: requiredEnv(env, "UZMAX_TELEGRAM_BOT_ORG_ID"),
    queue:
      options.queue ??
      createBullmqQueue({
        connection: redisConnectionFromEnv(env),
        queueName: telegramBotConversationQueueDefaults.queueName
      }),
    tenantId: requiredEnv(env, "UZMAX_TELEGRAM_BOT_TENANT_ID")
  });
}

function queueResult(
  update: NormalizedTelegramBotIngress,
  status: TelegramBotQueueStatus
): TelegramBotQueueResult {
  return {
    contentKind: update.contentKind,
    providerUpdateId: update.providerUpdateId,
    status,
    updateKind: update.updateKind
  };
}

function readHeader(
  headers: TelegramBotWebhookInput["headers"],
  targetHeader: string
): string | undefined {
  const entry = Object.entries(headers).find(
    ([header]) => header.toLowerCase() === targetHeader
  );
  const value = entry?.[1];
  return Array.isArray(value) ? value[0] : value;
}

function readIngressQueueRuntimeMode(
  env: TelegramBotIngressRuntimeEnv
): TelegramBotIngressQueueRuntimeMode {
  const mode = env.UZMAX_TELEGRAM_BOT_INGRESS_QUEUE_MODE?.trim() ?? "disabled";
  if (mode === "disabled" || mode === "bullmq") return mode;
  throw new Error(`unsupported telegram bot ingress queue mode: ${mode}`);
}

function redisConnectionFromEnv(env: TelegramBotIngressRuntimeEnv): BullmqConnection {
  const url = requiredEnv(env, "UZMAX_REDIS_URL");
  return { url };
}

function createBullmqQueue(options: {
  connection: BullmqConnection;
  queueName: string;
}): BullmqQueuePort {
  const require = createRequire(import.meta.url);
  const bullmq = require("bullmq") as {
    Queue: new (
      name: string,
      options: { connection: BullmqConnection }
    ) => BullmqQueuePort;
  };
  return new bullmq.Queue(options.queueName, { connection: options.connection });
}

function requiredEnv(
  env: TelegramBotIngressRuntimeEnv,
  key: keyof TelegramBotIngressRuntimeEnv
): string {
  const value = env[key]?.trim();
  if (!value) throw new Error(`${key} is required`);
  return value;
}
