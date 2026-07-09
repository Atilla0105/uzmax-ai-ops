import type {
  ConversationDetail,
  ConversationRow,
  MessageRow,
  RuntimeStatus
} from "./conversationWorkbenchRuntime";
import type { AdminRuntimeConfig } from "../../adminRuntimeConfig";

type ApiFetcher = (
  input: string,
  init?: { body?: string; headers?: Record<string, string>; method?: "GET" | "POST" }
) => Promise<{ json(): Promise<unknown>; ok: boolean; status: number }>;

class PreviewRuntimeUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PreviewRuntimeUnavailableError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function text(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function numberValue(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function bool(value: unknown) {
  return value === true;
}

function stringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function pairArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter(isRecord).map((item) => ({
        label: text(item.label, "字段"),
        value: text(item.value, "—")
      }))
    : [];
}

function notesArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter(isRecord).map((item) => ({
        text: text(item.text, "—"),
        time: text(item.time, "刚刚"),
        who: text(item.who, "运营")
      }))
    : [];
}

function tracksArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter(isRecord).map((item) => ({
        stage: text(item.stage, "引导节点"),
        time: text(item.time, "—"),
        via: text(item.via, "对话")
      }))
    : [];
}

function readConversation(value: unknown): ConversationRow {
  const record = isRecord(value) ? value : {};
  const status = text(record.status, "open") as ConversationRow["status"];
  return {
    aiState: record.aiState === "suspended" ? "suspended" : "active",
    awaitingReply: bool(record.awaitingReply),
    channel: text(record.channel, "Business"),
    customerName: text(record.customerName),
    customerRef: text(record.customerRef),
    customFields: pairArray(record.customFields),
    displayRef: text(record.displayRef),
    draftText: text(record.draftText),
    dualTracks: tracksArray(record.dualTracks),
    externalConversationRef: text(
      record.externalConversationRef,
      "external-ref-unavailable"
    ),
    journeyStage: text(record.journeyStage),
    language: text(record.language, "中 / ru"),
    id: text(record.id, "conversation-unavailable"),
    inFlightAiMessages: Array.isArray(record.inFlightAiMessages)
      ? record.inFlightAiMessages.filter(isRecord).map((message) => ({
          id: text(message.id, "ai-message"),
          status: text(message.status, "pending_cancel")
        }))
      : [],
    lastMessageAt: text(record.lastMessageAt),
    lastPreview: text(record.lastPreview),
    memberLabel: text(record.memberLabel),
    notes: notesArray(record.notes),
    orderRef: text(record.orderRef),
    participantExternalRef: text(
      record.participantExternalRef,
      "customer-ref-unavailable"
    ),
    quoteRef: text(record.quoteRef),
    slaPolicyRef: text(record.slaPolicyRef),
    slaRisk: bool(record.slaRisk),
    slaText: text(record.slaText),
    status: ["closed", "handoff", "open", "pending_handoff"].includes(status)
      ? status
      : "open",
    subject: text(record.subject),
    tags: stringArray(record.tags),
    tenantId: text(record.tenantId, "tenant-unavailable"),
    ticketRef: text(record.ticketRef),
    timeLabel: text(record.timeLabel, text(record.relativeTime)),
    unreadCount: numberValue(record.unreadCount)
  };
}

function readMessage(value: unknown): MessageRow {
  const record = isRecord(value) ? value : {};
  return {
    content: isRecord(record.content) ? record.content : {},
    contentKind: text(record.contentKind, "text"),
    direction:
      record.direction === "internal" || record.direction === "outbound"
        ? record.direction
        : "inbound",
    id: text(record.id, "message-unavailable"),
    occurredAt: text(record.occurredAt)
  };
}

async function readJson(
  fetcher: ApiFetcher,
  path: string,
  init: Parameters<ApiFetcher>[1] = { method: "GET" }
) {
  const response = await fetcher(path, init);
  if (path === "/conversation-ticket/conversations" && response.status === 404) {
    throw new PreviewRuntimeUnavailableError(
      "conversation-ticket list endpoint returned 404 in local preview"
    );
  }
  if (!response.ok)
    throw new Error(
      `conversation-ticket request failed with status ${response.status}`
    );
  let payload: unknown;
  try {
    payload = await response.json();
  } catch (error) {
    throw new PreviewRuntimeUnavailableError(
      error instanceof Error
        ? `conversation-ticket response was not JSON: ${error.message}`
        : "conversation-ticket response was not JSON"
    );
  }
  if (!isRecord(payload))
    throw new Error("conversation-ticket response must be an object");
  return payload;
}

export function createConversationClient(fetcher: ApiFetcher) {
  return {
    async detail(conversationId: string): Promise<ConversationDetail> {
      const payload = await readJson(
        fetcher,
        `/conversation-ticket/conversations/${encodeURIComponent(conversationId)}`
      );
      return {
        conversation: readConversation(payload.conversation),
        messages: Array.isArray(payload.messages)
          ? payload.messages.map(readMessage)
          : []
      };
    },
    async handoff(conversationId: string, slaPolicyRef: string) {
      const payload = await readJson(
        fetcher,
        `/conversation-ticket/conversations/${encodeURIComponent(conversationId)}/handoff`,
        {
          body: JSON.stringify({
            reason: "M7 conversation workbench operator takeover",
            slaPolicyRef
          }),
          headers: { "content-type": "application/json" },
          method: "POST"
        }
      );
      return readConversation(payload.conversation);
    },
    async list() {
      const payload = await readJson(fetcher, "/conversation-ticket/conversations");
      return Array.isArray(payload.items) ? payload.items.map(readConversation) : [];
    }
  };
}

export function statusForError(error: unknown): RuntimeStatus {
  return error instanceof Error && /status (401|403)/.test(error.message)
    ? "permission"
    : "error";
}

export function canUseSyntheticFallback(error: unknown, config: AdminRuntimeConfig) {
  if (config.strictRuntime) return false;
  if (error instanceof PreviewRuntimeUnavailableError) return true;
  return (
    error instanceof TypeError &&
    /failed to fetch|load failed|networkerror|network request failed/i.test(
      error.message
    )
  );
}
