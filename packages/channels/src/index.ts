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
  contentKind: TelegramBotContentKind;
  fileIds?: string[];
  messageExternalRef?: string;
  occurredAt?: string;
  participantExternalRef?: string;
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
  ].join(":");
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
const maxFileIds = 4;

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
  return dropUndefined({
    ...normalizeMessageContent(message),
    chatExternalRef: externalRef("chat", readNestedId(message, "chat")),
    messageExternalRef: externalRef("message", readId(message.message_id)),
    occurredAt: readTelegramDate(message.date),
    participantExternalRef: externalRef("user", readNestedId(message, "from")),
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
  return dropUndefined({
    callbackData: boundedString(callbackQuery.data, maxCallbackDataLength),
    chatExternalRef: message
      ? externalRef("chat", readNestedId(message, "chat"))
      : undefined,
    contentKind: "callback",
    messageExternalRef: message
      ? externalRef("message", readId(message.message_id))
      : undefined,
    participantExternalRef: externalRef("user", readNestedId(callbackQuery, "from")),
    provider: "telegram_bot",
    providerUpdateId,
    updateKind: "callback_query"
  });
}

function normalizeMessageContent(
  message: UnknownRecord
): Pick<
  NormalizedTelegramBotIngress,
  "contentKind" | "fileIds" | "text" | "unsupportedReason"
> {
  const text = boundedString(message.text, maxTextLength);
  if (text) {
    return { contentKind: "text", text };
  }

  const photoFileIds = readPhotoFileIds(message.photo);
  if (photoFileIds.length > 0) {
    return { contentKind: "image", fileIds: photoFileIds };
  }

  const voiceFileId = readRecordProperty(message, "voice")?.file_id;
  if (typeof voiceFileId === "string" && voiceFileId.trim()) {
    return { contentKind: "voice", fileIds: [voiceFileId] };
  }

  return {
    contentKind: "unsupported",
    unsupportedReason: "message_content_unsupported"
  };
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

function uuidText(value: unknown, label: string): string {
  const text = controlledText(value, label);
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      text
    )
  ) {
    throw new Error(`${label} must be a UUID`);
  }
  return text;
}

function readPhotoFileIds(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .flatMap((item) => (readRecordLike(item)?.file_id ?? []) as string[])
    .filter((fileId) => typeof fileId === "string" && fileId.trim())
    .slice(0, maxFileIds);
}

function readRecordLike(value: unknown): UnknownRecord | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : undefined;
}

function dropUndefined<T extends UnknownRecord>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== undefined)
  ) as T;
}
