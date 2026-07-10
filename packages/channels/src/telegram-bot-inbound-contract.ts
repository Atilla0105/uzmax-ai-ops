export type TelegramBotParticipantProfile = {
  displayName?: string;
  firstName?: string;
  languageCode?: string;
  lastName?: string;
  username?: string;
};

export type TelegramBotChatType = "channel" | "group" | "private" | "supergroup";

export type TelegramBotInboundAdmissionPolicy = {
  allowedChatExternalRefs: ReadonlySet<string>;
  allowedParticipantExternalRefs: ReadonlySet<string>;
};

export type TelegramBotCustomerIdentityDraft = {
  channelConnectionId: string;
  externalSubjectRef: string;
  identityKind: "channel_subject";
  orgId: string;
  participantProfile?: TelegramBotParticipantProfile;
  provider: "telegram_bot";
  seenAt: string;
  tenantId: string;
};

type InboundPayload = {
  callbackData?: unknown;
  channelConnectionId: string;
  chatExternalRef?: string;
  contentKind: string;
  enqueuedAt: string;
  fileIds?: unknown;
  occurredAt?: string;
  orgId: string;
  participantExternalRef?: string;
  participantProfile?: unknown;
  provider: "telegram_bot";
  providerUpdateId: string;
  tenantId: string;
  text?: unknown;
  traceId: string;
  updateKind?: string;
};

type TelegramBotMessageContent = {
  contentKind: "image" | "text" | "unsupported" | "voice";
  fileIds?: string[];
  text?: string;
  unsupportedReason?: string;
};

const telegramChatExternalRefPattern = /^telegram:chat:-?\d+$/;
const telegramUserExternalRefPattern = /^telegram:user:\d+$/;
const controlledRefPattern = /^[a-zA-Z0-9][a-zA-Z0-9:._-]{0,180}$/;

export function parseTelegramBotAllowedChatExternalRefs(
  value: unknown
): ReadonlySet<string> {
  return parseCanonicalRefs(
    value,
    telegramChatExternalRefPattern,
    "telegram bot approved chat allowlist"
  );
}

export function parseTelegramBotAllowedParticipantExternalRefs(value: unknown) {
  return parseCanonicalRefs(
    value,
    telegramUserExternalRefPattern,
    "telegram bot approved participant allowlist"
  );
}

export function isTelegramBotInboundAllowed(
  input: {
    chatExternalRef?: string;
    chatType?: TelegramBotChatType;
    participantExternalRef?: string;
  },
  policy: TelegramBotInboundAdmissionPolicy | undefined
) {
  return Boolean(
    policy &&
    input.chatType === "private" &&
    input.chatExternalRef &&
    policy.allowedChatExternalRefs.has(input.chatExternalRef) &&
    input.participantExternalRef &&
    policy.allowedParticipantExternalRefs.has(input.participantExternalRef)
  );
}

export function normalizeTelegramBotChatType(
  value: unknown
): TelegramBotChatType | undefined {
  return value === "private" ||
    value === "group" ||
    value === "supergroup" ||
    value === "channel"
    ? value
    : undefined;
}

export function normalizeTelegramBotParticipantProfile(
  value: unknown
): TelegramBotParticipantProfile | undefined {
  const profile = recordValue(value);
  const firstName = boundedText(profile.first_name, 128);
  const lastName = boundedText(profile.last_name, 128);
  return profileValue({
    displayName: derivedDisplayName(firstName, lastName),
    firstName,
    languageCode: boundedText(profile.language_code, 16),
    lastName,
    username: boundedText(profile.username, 64)
  });
}

export function normalizeTelegramBotMessageContent(
  value: unknown
): TelegramBotMessageContent {
  const message = recordValue(value);
  const text = boundedText(message.text, 4096);
  if (text) return { contentKind: "text", text };
  const photoFileIds = rawPhotoFileIds(message.photo);
  if (photoFileIds.length > 0) {
    return { contentKind: "image", fileIds: photoFileIds };
  }
  const voiceFileId = boundedText(recordValue(message.voice).file_id, 256);
  if (voiceFileId) return { contentKind: "voice", fileIds: [voiceFileId] };
  return {
    contentKind: "unsupported",
    unsupportedReason: "message_content_unsupported"
  };
}

export function assertTelegramBotInboundPayload(payload: InboundPayload) {
  const required = [
    payload.channelConnectionId,
    payload.enqueuedAt,
    payload.orgId,
    payload.providerUpdateId,
    payload.tenantId,
    payload.traceId
  ];
  if (required.some((value) => typeof value !== "string" || !value.trim())) {
    throw new Error("telegram bot conversation job identifiers are required");
  }
  if (payload.provider !== "telegram_bot") {
    throw new Error("telegram bot conversation job provider is invalid");
  }
  assertControlledJobMetadata(payload);
  if (!["callback", "image", "text", "voice"].includes(payload.contentKind)) {
    throw new Error("unsupported telegram bot updates are not conversation jobs");
  }
  if (!Number.isFinite(Date.parse(payload.enqueuedAt))) {
    throw new Error("telegram bot conversation job enqueuedAt is invalid");
  }
}

function assertControlledJobMetadata(payload: InboundPayload) {
  if (
    !controlledRefPattern.test(payload.providerUpdateId) ||
    !controlledRefPattern.test(payload.traceId)
  ) {
    throw new Error("telegram bot conversation job refs are invalid");
  }
  if (payload.updateKind !== "message" && payload.updateKind !== "callback_query") {
    throw new Error("telegram bot conversation job updateKind is invalid");
  }
  if (payload.occurredAt && !Number.isFinite(Date.parse(payload.occurredAt))) {
    throw new Error("telegram bot conversation job occurredAt is invalid");
  }
}

export function createTelegramBotInboundMessageContent(payload: InboundPayload) {
  const text = boundedText(payload.text, 4096);
  return dropUndefined({
    callbackData: boundedText(payload.callbackData, 256),
    contentKind: payload.contentKind,
    fileIds: boundedFileIds(payload.fileIds),
    provider: payload.provider,
    providerUpdateId: payload.providerUpdateId,
    text,
    textLength: text?.length ?? 0,
    traceId: payload.traceId
  });
}

export function createTelegramBotCustomerIdentityDraft(
  payload: InboundPayload
): TelegramBotCustomerIdentityDraft | undefined {
  const externalSubjectRef = payload.participantExternalRef;
  if (!externalSubjectRef || !telegramUserExternalRefPattern.test(externalSubjectRef)) {
    return undefined;
  }
  return {
    channelConnectionId: payload.channelConnectionId,
    externalSubjectRef,
    identityKind: "channel_subject",
    orgId: payload.orgId,
    participantProfile: revalidateParticipantProfile(payload.participantProfile),
    provider: payload.provider,
    seenAt: payload.enqueuedAt,
    tenantId: payload.tenantId
  };
}

function revalidateParticipantProfile(
  value: unknown
): TelegramBotParticipantProfile | undefined {
  const profile = recordValue(value);
  const firstName = boundedText(profile.firstName, 128);
  const lastName = boundedText(profile.lastName, 128);
  return profileValue({
    displayName: derivedDisplayName(firstName, lastName),
    firstName,
    languageCode: boundedText(profile.languageCode, 16),
    lastName,
    username: boundedText(profile.username, 64)
  });
}

function parseCanonicalRefs(value: unknown, pattern: RegExp, label: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} is required`);
  }
  const entries = value.split(",").map((entry) => entry.trim());
  if (entries.some((entry) => !entry || !pattern.test(entry))) {
    throw new Error(`${label} is invalid`);
  }
  return new Set(entries);
}

function profileValue(profile: TelegramBotParticipantProfile) {
  const bounded = dropUndefined(profile);
  return Object.keys(bounded).length > 0 ? bounded : undefined;
}

function derivedDisplayName(firstName?: string, lastName?: string) {
  return boundedText([firstName, lastName].filter(Boolean).join(" "), 256);
}

function boundedFileIds(value: unknown) {
  if (!Array.isArray(value)) return undefined;
  const ids = value.flatMap((entry) => boundedText(entry, 256) ?? []).slice(0, 4);
  return ids.length > 0 ? ids : undefined;
}

function rawPhotoFileIds(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .flatMap((entry) => boundedText(recordValue(entry).file_id, 256) ?? [])
    .slice(0, 4);
}

function boundedText(value: unknown, maxLength: number) {
  return typeof value === "string" && value.trim()
    ? value.trim().slice(0, maxLength)
    : undefined;
}

function recordValue(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function dropUndefined<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== undefined)
  ) as T;
}
