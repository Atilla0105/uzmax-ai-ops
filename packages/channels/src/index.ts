import {
  normalizeTelegramBotChatType,
  normalizeTelegramBotMessageContent,
  normalizeTelegramBotParticipantProfile,
  type TelegramBotChatType,
  type TelegramBotParticipantProfile
} from "./telegram-bot-inbound-contract.ts";

export {
  parseTelegramBotAllowedChatExternalRefs,
  parseTelegramBotAllowedParticipantExternalRefs
} from "./telegram-bot-inbound-contract.ts";
export type {
  TelegramBotChatType,
  TelegramBotParticipantProfile
} from "./telegram-bot-inbound-contract.ts";

export const packageName = "@uzmax/channels";

export const telegramBotAllowedUpdates = ["message", "callback_query"] as const;

export type TelegramBotAllowedUpdate = (typeof telegramBotAllowedUpdates)[number];
export type TelegramBotUpdateKind = "callback_query" | "message" | "unsupported";
export type TelegramBotContentKind =
  | "callback"
  | "image"
  | "text"
  | "unsupported"
  | "voice";

export type NormalizedTelegramBotIngress = {
  callbackData?: string;
  chatExternalRef?: string;
  chatType?: TelegramBotChatType;
  contentKind: TelegramBotContentKind;
  // Telegram file_id values are bounded provider cache metadata, not durable assets.
  fileIds?: string[];
  messageExternalRef?: string;
  occurredAt?: string;
  participantExternalRef?: string;
  participantProfile?: TelegramBotParticipantProfile;
  provider: "telegram_bot";
  providerUpdateId: string;
  text?: string;
  unsupportedReason?: string;
  updateKind: TelegramBotUpdateKind;
};

export const telegramBotConversationQueueDefaults = {
  jobName: "telegram-bot.conversation.ingress",
  queueName: "telegram-bot-conversation"
} as const;

export type TelegramBotConversationJobPayload = NormalizedTelegramBotIngress & {
  channelConnectionId: string;
  enqueuedAt: string;
  orgId: string;
  tenantId: string;
  traceId: string;
};

export type TelegramBotOutboundDeliveryStatus = "FAILED" | "QUEUED" | "SENT";

export type TelegramBotOutboundSendRequest = {
  channelConnectionId: string;
  chatExternalRef: string;
  idempotencyKey: string;
  orgId: string;
  replyToMessageExternalRef?: string;
  tenantId: string;
  text: string;
  traceId: string;
};

export type TelegramBotOutboundSendResult = {
  dryRun: boolean;
  provider: "telegram_bot";
  providerMessageRef: string;
  requestId: string;
  sentAt: string;
  status: TelegramBotOutboundDeliveryStatus;
  traceId: string;
};

type TelegramBotHttpTransport = (request: {
  body: Record<string, unknown>;
  headers: Record<string, string>;
  method: "POST";
  url: string;
}) => Promise<{ json(): Promise<unknown>; ok: boolean; status: number }>;

export type TelegramBotOutboundSendPort = {
  sendMessage(
    request: TelegramBotOutboundSendRequest
  ): Promise<TelegramBotOutboundSendResult>;
};

export function createTelegramBotConversationJobPayload(input: {
  channelConnectionId: string;
  enqueuedAt?: string;
  orgId: string;
  tenantId: string;
  traceId: string;
  update: NormalizedTelegramBotIngress;
}): TelegramBotConversationJobPayload {
  return {
    ...input.update,
    channelConnectionId: uuidText(input.channelConnectionId, "channelConnectionId"),
    enqueuedAt: input.enqueuedAt ?? new Date().toISOString(),
    orgId: uuidText(input.orgId, "orgId"),
    tenantId: uuidText(input.tenantId, "tenantId"),
    traceId: controlledText(input.traceId, "traceId")
  };
}

export function createTelegramBotConversationJobId(
  payload: Pick<
    TelegramBotConversationJobPayload,
    "channelConnectionId" | "orgId" | "providerUpdateId" | "tenantId"
  >
): string {
  return [
    "telegram-bot",
    uuidText(payload.orgId, "orgId"),
    uuidText(payload.tenantId, "tenantId"),
    uuidText(payload.channelConnectionId, "channelConnectionId"),
    controlledText(payload.providerUpdateId, "providerUpdateId")
  ].join("__");
}

export function createTelegramBotSendMessageAdapter(input: {
  apiBaseUrl?: string;
  botToken: string;
  now?: () => Date;
  transport: TelegramBotHttpTransport;
}): TelegramBotOutboundSendPort {
  const botToken = requiredToken(input.botToken, "botToken");
  const apiBaseUrl = (input.apiBaseUrl ?? "https://api.telegram.org").replace(
    /\/+$/,
    ""
  );
  const now = input.now ?? (() => new Date());

  return {
    async sendMessage(request) {
      const response = await input.transport({
        body: createTelegramBotSendMessagePayload(request),
        headers: { "content-type": "application/json" },
        method: "POST",
        url: `${apiBaseUrl}/bot${botToken}/sendMessage`
      });
      const json = await response.json();
      const result = parseTelegramBotSendMessageResponse(json, response);
      return {
        dryRun: false,
        provider: "telegram_bot",
        providerMessageRef: `telegram:message:${result.messageId}`,
        requestId: controlledText(request.idempotencyKey, "requestId"),
        sentAt: now().toISOString(),
        status: "SENT",
        traceId: controlledText(request.traceId, "traceId")
      };
    }
  };
}

export function createTelegramBotSendMessagePayload(
  request: TelegramBotOutboundSendRequest
): Record<string, unknown> {
  const replyMessageId = externalMessageId(request.replyToMessageExternalRef);
  const text = boundedString(request.text, maxTextLength);
  if (!text) throw new Error("telegram bot outbound text is required");
  return dropUndefined({
    chat_id: externalChatId(request.chatExternalRef),
    reply_parameters: replyMessageId ? { message_id: replyMessageId } : undefined,
    text
  });
}

type UnknownRecord = Record<string, unknown>;

const businessUpdateKeys = new Set([
  "business_connection",
  "business_message",
  "deleted_business_messages",
  "edited_business_message"
]);
const maxTextLength = 4096;
const maxCallbackDataLength = 256;

export function normalizeTelegramBotUpdate(
  update: unknown
): NormalizedTelegramBotIngress {
  const updateRecord = requireRecord(update, "telegram update");
  const providerUpdateId = readProviderUpdateId(updateRecord);
  const message = readRecordProperty(updateRecord, "message");
  if (message) {
    return normalizeTelegramMessage(providerUpdateId, message);
  }

  const callbackQuery = readRecordProperty(updateRecord, "callback_query");
  if (callbackQuery) {
    return normalizeTelegramCallbackQuery(providerUpdateId, callbackQuery);
  }

  return unsupportedUpdate(providerUpdateId, readUnsupportedReason(updateRecord));
}

function normalizeTelegramMessage(
  providerUpdateId: string,
  message: UnknownRecord
): NormalizedTelegramBotIngress {
  const chat = readRecordProperty(message, "chat");
  return dropUndefined({
    ...normalizeTelegramBotMessageContent(message),
    chatExternalRef: externalRef("chat", readNestedId(message, "chat")),
    chatType: normalizeTelegramBotChatType(chat?.type),
    messageExternalRef: externalRef("message", readId(message.message_id)),
    occurredAt: readTelegramDate(message.date),
    participantExternalRef: externalRef("user", readNestedId(message, "from")),
    participantProfile: normalizeTelegramBotParticipantProfile(
      readRecordProperty(message, "from")
    ),
    provider: "telegram_bot",
    providerUpdateId,
    updateKind: "message"
  });
}

function normalizeTelegramCallbackQuery(
  providerUpdateId: string,
  callbackQuery: UnknownRecord
): NormalizedTelegramBotIngress {
  const message = readRecordProperty(callbackQuery, "message");
  const chat = message ? readRecordProperty(message, "chat") : undefined;
  return dropUndefined({
    callbackData: boundedString(callbackQuery.data, maxCallbackDataLength),
    chatExternalRef: message
      ? externalRef("chat", readNestedId(message, "chat"))
      : undefined,
    chatType: normalizeTelegramBotChatType(chat?.type),
    contentKind: "callback",
    messageExternalRef: message
      ? externalRef("message", readId(message.message_id))
      : undefined,
    participantExternalRef: externalRef("user", readNestedId(callbackQuery, "from")),
    participantProfile: normalizeTelegramBotParticipantProfile(
      readRecordProperty(callbackQuery, "from")
    ),
    provider: "telegram_bot",
    providerUpdateId,
    updateKind: "callback_query"
  });
}

function unsupportedUpdate(
  providerUpdateId: string,
  unsupportedReason: string
): NormalizedTelegramBotIngress {
  return {
    contentKind: "unsupported",
    provider: "telegram_bot",
    providerUpdateId,
    unsupportedReason,
    updateKind: "unsupported"
  };
}

function readUnsupportedReason(update: UnknownRecord): string {
  const updateKeys = Object.keys(update).filter((key) => key !== "update_id");
  const businessKey = updateKeys.find((key) => businessUpdateKeys.has(key));
  if (businessKey) {
    return "telegram_business_deferred";
  }

  const firstUpdateKey = updateKeys[0];
  return firstUpdateKey
    ? `unsupported_update_type:${firstUpdateKey}`
    : "unsupported_update_type:empty";
}

function readProviderUpdateId(update: UnknownRecord): string {
  const updateId = update.update_id;
  if (typeof updateId !== "number" || !Number.isSafeInteger(updateId)) {
    throw new Error("telegram update_id must be a safe integer");
  }

  return String(updateId);
}

function requireRecord(value: unknown, label: string): UnknownRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }

  return value as UnknownRecord;
}

function readRecordProperty(
  value: UnknownRecord,
  property: string
): UnknownRecord | undefined {
  const candidate = value[property];
  return candidate && typeof candidate === "object" && !Array.isArray(candidate)
    ? (candidate as UnknownRecord)
    : undefined;
}

function readNestedId(value: UnknownRecord, property: string): string | undefined {
  const record = readRecordProperty(value, property);
  return record ? readId(record.id) : undefined;
}

function readId(value: unknown): string | undefined {
  if (typeof value === "number" && Number.isSafeInteger(value)) {
    return String(value);
  }

  if (typeof value === "string" && value.trim()) {
    return value;
  }

  return undefined;
}

function externalRef(kind: "chat" | "message" | "user", id: string | undefined) {
  return id ? `telegram:${kind}:${id}` : undefined;
}

function readTelegramDate(value: unknown): string | undefined {
  if (typeof value !== "number" || !Number.isSafeInteger(value)) {
    return undefined;
  }

  return new Date(value * 1000).toISOString();
}

function boundedString(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : undefined;
}

function controlledText(value: unknown, label: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} is required`);
  }
  const trimmed = value.trim();
  if (!/^[a-zA-Z0-9][a-zA-Z0-9:._-]{0,180}$/.test(trimmed)) {
    throw new Error(`${label} must be a controlled ref`);
  }
  return trimmed;
}

function requiredToken(value: unknown, label: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} is required`);
  }
  const token = value.trim();
  if (!/^[0-9]{4,}:[A-Za-z0-9_-]{20,}$/.test(token)) {
    throw new Error(`${label} is invalid`);
  }
  return token;
}

function uuidText(value: unknown, label: string): string {
  const text = controlledText(value, label);
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidPattern.test(text)) {
    throw new Error(`${label} must be a UUID`);
  }
  return text;
}

function externalChatId(value: unknown): string {
  if (typeof value !== "string") {
    throw new Error("chatExternalRef is required");
  }
  const match = /^telegram:chat:([A-Za-z0-9@._:-]{1,80})$/.exec(value.trim());
  if (!match) throw new Error("chatExternalRef is invalid");
  return match[1] as string;
}

function externalMessageId(value: unknown): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string") {
    throw new Error("replyToMessageExternalRef is invalid");
  }
  const match = /^telegram:message:([0-9]{1,16})$/.exec(value.trim());
  if (!match) throw new Error("replyToMessageExternalRef is invalid");
  const messageId = Number(match[1]);
  if (!Number.isSafeInteger(messageId) || messageId <= 0) {
    throw new Error("replyToMessageExternalRef is invalid");
  }
  return messageId;
}

function parseTelegramBotSendMessageResponse(
  value: unknown,
  response: { ok: boolean; status: number }
): { messageId: string } {
  const record = requireRecord(value, "telegram sendMessage response");
  if (!response.ok || record.ok !== true) {
    throw new Error("telegram sendMessage failed");
  }
  const result = readRecordProperty(record, "result");
  const messageId = result ? readId(result.message_id) : undefined;
  if (!messageId) throw new Error("telegram sendMessage response missing message_id");
  return { messageId };
}

function dropUndefined<T extends UnknownRecord>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== undefined)
  ) as T;
}
