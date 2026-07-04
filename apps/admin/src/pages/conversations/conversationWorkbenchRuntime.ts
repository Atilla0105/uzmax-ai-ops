import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  degradedReason,
  handoffBlocker,
  handoffTarget
} from "./conversationWorkbenchHandoff";

export type RuntimeStatus = "empty" | "error" | "loading" | "permission" | "ready";
type ConversationStatus = "closed" | "handoff" | "open" | "pending_handoff";
type MessageDirection = "inbound" | "internal" | "outbound";

export type ConversationRow = {
  aiState?: "active" | "suspended";
  awaitingReply?: boolean;
  channel?: string;
  customerRef?: string;
  customFields?: Array<{ label: string; value: string }>;
  displayRef?: string;
  dualTracks?: Array<{ stage: string; time: string; via: string }>;
  externalConversationRef: string;
  journeyStage?: string;
  language?: string;
  id: string;
  inFlightAiMessages?: Array<{ id: string; status: string }>;
  lastMessageAt?: string;
  lastPreview?: string;
  memberLabel?: string;
  notes?: Array<{ text: string; time: string; who: string }>;
  orderRef?: string;
  participantExternalRef: string;
  quoteRef?: string;
  slaPolicyRef?: string;
  slaRisk?: boolean;
  slaText?: string;
  status: ConversationStatus;
  subject?: string;
  tags?: string[];
  tenantId: string;
  ticketRef?: string;
  timeLabel?: string;
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

export const conversationFilters = [
  { id: "all", label: "全部" },
  { id: "unread", label: "未读" },
  { id: "awaiting", label: "未回" },
  { id: "needs", label: "待人工" },
  { id: "sla", label: "SLA" },
  { id: "closed", label: "已解决" }
] as const;
export type ConversationFilterId = (typeof conversationFilters)[number]["id"];

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
  const status = text(record.status, "open") as ConversationStatus;
  return {
    aiState: record.aiState === "suspended" ? "suspended" : "active",
    awaitingReply: bool(record.awaitingReply),
    channel: text(record.channel, "Business"),
    customerRef: text(record.customerRef),
    customFields: pairArray(record.customFields),
    displayRef: text(record.displayRef),
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
  if (!response.ok)
    throw new Error(
      `conversation-ticket request failed with status ${response.status}`
    );
  const payload = await response.json();
  if (!isRecord(payload))
    throw new Error("conversation-ticket response must be an object");
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
  const activeIdRef = useRef(activeId);

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  const loadList = useCallback(async () => {
    setStatus("loading");
    setDetail(null);
    setLastError("");
    try {
      const rows = await client.list();
      const ordered = rows.sort((left, right) => riskRank(left) - riskRank(right));
      setConversations(ordered);
      setActiveId((current) => current || ordered[0]?.id || "");
      setStatus(ordered.length === 0 ? "empty" : "ready");
    } catch (error) {
      setLastError(
        error instanceof Error ? error.message : "conversation workbench failed"
      );
      setConversations([]);
      setStatus(statusForError(error));
    }
  }, [client]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  useEffect(() => {
    if (!activeId || status !== "ready") return;
    let cancelled = false;
    setDetail(null);
    void client
      .detail(activeId)
      .then((next) => {
        if (cancelled) return;
        if (next.conversation.id !== activeId) {
          setLastError("conversation detail response did not match selection");
          setDetail(null);
          return;
        }
        setDetail(next);
      })
      .catch((error) => {
        if (cancelled) return;
        setLastError(
          error instanceof Error ? error.message : "conversation detail failed"
        );
        setDetail(null);
      });
    return () => {
      cancelled = true;
    };
  }, [activeId, client, status]);

  const activeDetail = detail?.conversation.id === activeId ? detail : null;
  const activeConversation =
    activeDetail?.conversation ?? conversations.find((row) => row.id === activeId);
  const handoffDisabledReason = handoffBlocker(status, activeDetail, handoffPending);
  const canRequestHandoff = !handoffDisabledReason;

  const select = useCallback((conversationId: string) => {
    setActiveId(conversationId);
    setDetail(null);
    setLastError("");
  }, []);

  const requestHandoff = useCallback(async () => {
    const target = handoffTarget(status, activeDetail, handoffPending);
    if ("reason" in target) {
      setLastError(target.reason);
      return;
    }
    setHandoffPending(true);
    setLastError("");
    try {
      const conversation = await client.handoff(target.id, target.policyRef);
      if (conversation.id !== target.id) {
        if (activeIdRef.current === target.id)
          setLastError(`handoff response did not match ${target.ref}`);
        return;
      }
      setConversations((rows) =>
        rows.map((row) => (row.id === conversation.id ? conversation : row))
      );
      setDetail((current) =>
        current?.conversation.id === target.id && activeIdRef.current === target.id
          ? { ...current, conversation }
          : current
      );
    } catch (error) {
      if (activeIdRef.current === target.id)
        setLastError(
          error instanceof Error ? error.message : "handoff runtime unavailable"
        );
    } finally {
      setHandoffPending(false);
    }
  }, [activeDetail, client, handoffPending, status]);

  return {
    activeId,
    activeConversation,
    canRequestHandoff,
    conversations,
    degradedReason: degradedReason(
      status,
      lastError,
      activeDetail,
      handoffDisabledReason
    ),
    detail,
    handoffDisabledReason,
    handoffPending,
    lastError,
    reload: loadList,
    requestHandoff,
    select,
    status,
    toggleTrace: (id: string) =>
      setTraceOpen((current) => ({
        ...current,
        [id]: !(current[id] ?? true)
      })),
    traceOpen
  };
}

function riskRank(conversation: ConversationRow) {
  if (conversation.status === "pending_handoff") return 0;
  if (conversation.slaRisk) return 1;
  if (conversation.awaitingReply) return 2;
  return 3;
}

export function matchesConversationFilter(
  row: ConversationRow,
  filter: ConversationFilterId
) {
  if (filter === "unread") return row.unreadCount > 0;
  if (filter === "awaiting") return row.awaitingReply;
  if (filter === "needs")
    return row.status === "pending_handoff" || row.aiState === "suspended";
  if (filter === "sla") return row.slaRisk;
  if (filter === "closed") return row.status === "closed";
  return true;
}

export function countConversationFilters(
  rows: ConversationRow[]
): Record<ConversationFilterId, number> {
  return conversationFilters.reduce(
    (acc, filter) => ({
      ...acc,
      [filter.id]: rows.filter((row) => matchesConversationFilter(row, filter.id))
        .length
    }),
    {} as Record<ConversationFilterId, number>
  );
}

export function isEditableTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    ["input", "select", "textarea"].includes(target.tagName.toLowerCase())
  );
}

export function contentText(message: MessageRow) {
  return text(
    message.content.text,
    text(message.content.preview, "[unsupported content]")
  );
}

export function displayName(conversation: ConversationRow) {
  return text(conversation.subject, conversation.participantExternalRef);
}
