import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  degradedReason,
  handoffBlocker,
  handoffTarget
} from "./conversationWorkbenchHandoff";
import {
  firstSyntheticConversationId,
  syntheticConversationDetail,
  syntheticConversationRows,
  syntheticRuntimeUnavailableReason
} from "./conversationWorkbenchFallback";
import {
  canUseSyntheticFallback,
  createConversationClient,
  statusForError
} from "./conversationWorkbenchClient";

export type RuntimeStatus = "empty" | "error" | "loading" | "permission" | "ready";
type RuntimeSource = "api" | "synthetic";
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

function text(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

export function useConversationWorkbenchRuntime() {
  const client = useMemo(() => createConversationClient(), []);
  const [activeId, setActiveId] = useState("");
  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [detail, setDetail] = useState<ConversationDetail | null>(null);
  const [lastError, setLastError] = useState("");
  const [runtimeSource, setRuntimeSource] = useState<RuntimeSource>("api");
  const [status, setStatus] = useState<RuntimeStatus>("loading");
  const [traceOpen, setTraceOpen] = useState<Record<string, boolean>>({});
  const [handoffPending, setHandoffPending] = useState(false);
  const activeIdRef = useRef(activeId);

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  const loadList = useCallback(async () => {
    setStatus("loading");
    setRuntimeSource("api");
    setDetail(null);
    setLastError("");
    try {
      const rows = await client.list();
      const ordered = rows.sort((left, right) => riskRank(left) - riskRank(right));
      setConversations(ordered);
      setActiveId((current) => current || ordered[0]?.id || "");
      setStatus(ordered.length === 0 ? "empty" : "ready");
    } catch (error) {
      if (canUseSyntheticFallback(error)) {
        const fallbackActiveId = firstSyntheticConversationId();
        setRuntimeSource("synthetic");
        setLastError(syntheticRuntimeUnavailableReason);
        setConversations(syntheticConversationRows);
        setActiveId(fallbackActiveId);
        setDetail(syntheticConversationDetail(fallbackActiveId));
        setStatus("ready");
        return;
      }
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
    if (runtimeSource === "synthetic") {
      setDetail(syntheticConversationDetail(activeId));
      setLastError(syntheticRuntimeUnavailableReason);
      return;
    }
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
  }, [activeId, client, runtimeSource, status]);

  const activeDetail = detail?.conversation.id === activeId ? detail : null;
  const activeConversation =
    activeDetail?.conversation ?? conversations.find((row) => row.id === activeId);
  const handoffDisabledReason = handoffBlocker(status, activeDetail, handoffPending);
  const canRequestHandoff = !handoffDisabledReason;

  const select = useCallback(
    (conversationId: string) => {
      setActiveId(conversationId);
      setDetail(null);
      setLastError(
        runtimeSource === "synthetic" ? syntheticRuntimeUnavailableReason : ""
      );
    },
    [runtimeSource]
  );

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
    runtimeSource,
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
