import {
  normalizeTelegramBotUpdate,
  type NormalizedTelegramBotIngress
} from "../../../packages/channels/src/index.ts";

export const TELEGRAM_BOT_INGRESS_QUEUE = "TELEGRAM_BOT_INGRESS_QUEUE";
export const TELEGRAM_BOT_SECRET_HEADER = "x-telegram-bot-api-secret-token";
export const TELEGRAM_BOT_WEBHOOK_SECRET = "TELEGRAM_BOT_WEBHOOK_SECRET";

export type TelegramBotQueueStatus = "accepted" | "deduped" | "unsupported";

export type TelegramBotQueueResult = {
  contentKind: NormalizedTelegramBotIngress["contentKind"];
  providerUpdateId: string;
  status: TelegramBotQueueStatus;
  updateKind: NormalizedTelegramBotIngress["updateKind"];
};

export type TelegramBotIngressQueuePort = {
  enqueue(update: NormalizedTelegramBotIngress): Promise<TelegramBotQueueResult>;
};

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
    return { ok: true, ...queueResult } as const;
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
