import { useCallback, useEffect, useMemo, useState } from "react";

export type RuntimeStatus = "empty" | "error" | "loading" | "permission" | "ready";
type ConversationStatus = "closed" | "handoff" | "open" | "pending_handoff";
type MessageDirection = "inbound" | "internal" | "outbound";

export type ConversationRow = {
  aiState?: "active" | "suspended";
  awaitingReply?: boolean;
  externalConversationRef: string;
  id: string;
  inFlightAiMessages?: Array<{ id: string; status: string }>;
  lastMessageAt?: string;
  participantExternalRef: string;
  slaRisk?: boolean;
  status: ConversationStatus;
  subject?: string;
  tenantId: string;
  unreadCount: number;
};

export type MessageRow = {
  content: Record<string, unknown>;
  contentKind: string;
  direction: MessageDirection;
  id: string;
  occurredAt: string;
};

export type ConversationDetail = {
  conversation: ConversationRow;
  messages: MessageRow[];
};

type ApiFetcher = (
  input: string,
  init?: { body?: string; headers?: Record<string, string>; method?: "GET" | "POST" }
) => Promise<{ json(): Promise<unknown>; ok: boolean; status: number }>;

const browserFetcher: ApiFetcher = (input, init) => window.fetch(input, init);

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

function readConversation(value: unknown): ConversationRow {
  const record = isRecord(value) ? value : {};
  const status = text(record.status, "open") as ConversationStatus;
  return {
    aiState: record.aiState === "suspended" ? "suspended" : "active",
    awaitingReply: bool(record.awaitingReply),
    externalConversationRef: text(record.externalConversationRef, "external-ref-unavailable"),
    id: text(record.id, "conversation-unavailable"),
    inFlightAiMessages: Array.isArray(record.inFlightAiMessages)
      ? record.inFlightAiMessages.filter(isRecord).map((message) => ({
          id: text(message.id, "ai-message"),
          status: text(message.status, "pending_cancel")
        }))
      : [],
    lastMessageAt: text(record.lastMessageAt),
    participantExternalRef: text(record.participantExternalRef, "customer-ref-unavailable"),
    slaRisk: bool(record.slaRisk),
    status: ["closed", "handoff", "open", "pending_handoff"].includes(status)
      ? status
      : "open",
    subject: text(record.subject),
    tenantId: text(record.tenantId, "tenant-unavailable"),
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

async function readJson(fetcher: ApiFetcher, path: string, init: Parameters<ApiFetcher>[1] = { method: "GET" }) {
  const response = await fetcher(path, init);
  if (!response.ok) throw new Error(`conversation-ticket request failed with status ${response.status}`);
  const payload = await response.json();
  if (!isRecord(payload)) throw new Error("conversation-ticket response must be an object");
  return payload;
}

function createConversationClient(fetcher: ApiFetcher = browserFetcher) {
  return {
    async detail(conversationId: string) {
      const payload = await readJson(
        fetcher,
        `/conversation-ticket/conversations/${encodeURIComponent(conversationId)}`
      );
      return {
        conversation: readConversation(payload.conversation),
        messages: Array.isArray(payload.messages) ? payload.messages.map(readMessage) : []
      };
    },
    async handoff(conversationId: string) {
      const payload = await readJson(
        fetcher,
        `/conversation-ticket/conversations/${encodeURIComponent(conversationId)}/handoff`,
        {
          body: JSON.stringify({
            reason: "M7 conversation workbench operator takeover",
            slaPolicyRef: "controlled://m7-ui-20/sla/default"
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

function statusForError(error: unknown): RuntimeStatus {
  return error instanceof Error && error.message.includes("status 403")
    ? "permission"
    : "error";
}

export function useConversationWorkbenchRuntime() {
  const client = useMemo(() => createConversationClient(), []);
  const [activeId, setActiveId] = useState("");
  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [detail, setDetail] = useState<ConversationDetail | null>(null);
  const [lastError, setLastError] = useState("");
  const [status, setStatus] = useState<RuntimeStatus>("loading");
  const [traceOpen, setTraceOpen] = useState<Record<string, boolean>>({});
  const [handoffPending, setHandoffPending] = useState(false);

  const loadList = useCallback(async () => {
    setStatus("loading");
    setLastError("");
    try {
      const rows = await client.list();
      const ordered = rows.sort((left, right) => riskRank(left) - riskRank(right));
      setConversations(ordered);
      setActiveId((current) => current || ordered[0]?.id || "");
      setStatus(ordered.length === 0 ? "empty" : "ready");
    } catch (error) {
      setLastError(error instanceof Error ? error.message : "conversation workbench failed");
      setConversations([]);
      setStatus(statusForError(error));
    }
  }, [client]);

  const loadDetail = useCallback(async () => {
    if (!activeId || status !== "ready") return;
    try {
      setDetail(await client.detail(activeId));
    } catch (error) {
      setLastError(error instanceof Error ? error.message : "conversation detail failed");
      setDetail(null);
    }
  }, [activeId, client, status]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  const requestHandoff = useCallback(async () => {
    if (!activeId) return;
    setHandoffPending(true);
    setLastError("");
    try {
      const conversation = await client.handoff(activeId);
      setConversations((rows) =>
        rows.map((row) => (row.id === conversation.id ? conversation : row))
      );
      setDetail((current) => current && { ...current, conversation });
    } catch (error) {
      setLastError(error instanceof Error ? error.message : "handoff runtime unavailable");
    } finally {
      setHandoffPending(false);
    }
  }, [activeId, client]);

  return {
    activeId,
    conversations,
    degradedReason: degradedReason(status, lastError, detail),
    detail,
    handoffPending,
    lastError,
    reload: loadList,
    requestHandoff,
    select: setActiveId,
    status,
    toggleTrace: (id: string) =>
      setTraceOpen((current) => ({ ...current, [id]: !current[id] })),
    traceOpen
  };
}

function riskRank(conversation: ConversationRow) {
  if (conversation.status === "pending_handoff") return 0;
  if (conversation.slaRisk) return 1;
  if (conversation.awaitingReply) return 2;
  return 3;
}

function degradedReason(
  status: RuntimeStatus,
  lastError: string,
  detail: ConversationDetail | null
) {
  if (status === "error") return "conversation-ticket API 不可用；页面保持只读，不回退到 fixture。";
  if (status === "permission") return "缺少 conversation:read 或 ticket:write；后端权限仍是最终边界。";
  if (lastError) return lastError;
  if (!detail) return "详情、AI 轨迹或客户上下文运行时尚未返回；操作保持降级。";
  return "Business draft、human send、customer context 聚合和 WS 尚无已批准 M7 合约。";
}

export function contentText(message: MessageRow) {
  return text(message.content.text, text(message.content.preview, "[unsupported content]"));
}

export function displayName(conversation: ConversationRow) {
  return text(conversation.subject, conversation.participantExternalRef);
}
