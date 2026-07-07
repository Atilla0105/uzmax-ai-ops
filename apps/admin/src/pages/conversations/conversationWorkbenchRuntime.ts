import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  degradedReason,
  handoffBlocker,
  handoffTarget,
  syntheticHandoffBlocker
} from "./conversationWorkbenchHandoff";
import {
  firstSyntheticConversationId,
  syntheticConversationDetail,
  syntheticLocalHandoffConversation,
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
  customerName?: string;
  customerRef?: string;
  customFields?: Array<{ label: string; value: string }>;
  displayRef?: string;
  draftText?: string;
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
  { id: "needs", label: "待人工" },
  { id: "sla", label: "SLA风险" },
  { id: "mine", label: "我接管" },
  { id: "ai", label: "AI处理" }
] as const;
export type ConversationFilterId = (typeof conversationFilters)[number]["id"];

const tenantMismatchError = (scope: string, selectedTenantId: string) =>
  `${scope} response did not match selected tenant ${selectedTenantId}`;

function text(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

export function useConversationWorkbenchRuntime(selectedTenantId: string) {
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
  const handoffRequestIdRef = useRef(0);
  const listRequestIdRef = useRef(0);
  const selectedTenantIdRef = useRef(selectedTenantId);

  selectedTenantIdRef.current = selectedTenantId;

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  const loadList = useCallback(async () => {
    const requestId = listRequestIdRef.current + 1;
    listRequestIdRef.current = requestId;
    setStatus("loading");
    setRuntimeSource("api");
    setDetail(null);
    setConversations([]);
    setLastError("");
    try {
      const rows = await client.list();
      if (requestId !== listRequestIdRef.current) return;
      const ordered = rows
        .filter((row) => isSelectedTenant(row, selectedTenantId))
        .sort((left, right) => riskRank(left) - riskRank(right));
      setConversations(ordered);
      setActiveId((current) =>
        ordered.some((row) => row.id === current) ? current : ordered[0]?.id || ""
      );
      setLastError(
        rows.length > 0 && ordered.length === 0
          ? tenantMismatchError("conversation list", selectedTenantId)
          : ""
      );
      setStatus(ordered.length === 0 ? "empty" : "ready");
    } catch (error) {
      if (requestId !== listRequestIdRef.current) return;
      if (canUseSyntheticFallback(error)) {
        const fallbackRows = syntheticConversationRows(selectedTenantId);
        const fallbackActiveId = firstSyntheticConversationId(selectedTenantId);
        setRuntimeSource("synthetic");
        setLastError(syntheticRuntimeUnavailableReason);
        setConversations(fallbackRows);
        setActiveId(fallbackActiveId);
        setDetail(syntheticConversationDetail(fallbackActiveId, selectedTenantId));
        setStatus("ready");
        return;
      }
      setLastError(
        error instanceof Error ? error.message : "conversation workbench failed"
      );
      setConversations([]);
      setActiveId("");
      setStatus(statusForError(error));
    }
  }, [client, selectedTenantId]);

  useEffect(() => {
    handoffRequestIdRef.current += 1;
    setActiveId("");
    setDetail(null);
    setTraceOpen({});
    setHandoffPending(false);
    void loadList();
  }, [loadList, selectedTenantId]);

  useEffect(() => {
    if (!activeId || status !== "ready") return;
    if (runtimeSource === "synthetic") {
      setDetail(syntheticConversationDetail(activeId, selectedTenantId));
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
        if (!isSelectedTenant(next.conversation, selectedTenantId)) {
          setLastError(tenantMismatchError("conversation detail", selectedTenantId));
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
  }, [activeId, client, runtimeSource, selectedTenantId, status]);

  const activeDetail =
    detail?.conversation.id === activeId &&
    isSelectedTenant(detail.conversation, selectedTenantId)
      ? detail
      : null;
  const activeConversation =
    activeDetail?.conversation ??
    conversations.find(
      (row) => row.id === activeId && isSelectedTenant(row, selectedTenantId)
    );
  const handoffDisabledReason =
    runtimeSource === "synthetic"
      ? syntheticHandoffBlocker(activeDetail, handoffPending)
      : handoffBlocker(status, activeDetail, handoffPending);
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
    if (runtimeSource === "synthetic") {
      const reason = syntheticHandoffBlocker(activeDetail, handoffPending);
      if (reason) {
        setLastError(reason);
        return;
      }
      const activeSynthetic = activeDetail!.conversation;
      const nextConversation = syntheticLocalHandoffConversation(activeSynthetic);
      setConversations((rows) =>
        replaceHandoffConversation(rows, nextConversation, selectedTenantId)
      );
      setDetail((current) =>
        replaceHandoffDetail(
          current,
          nextConversation,
          activeSynthetic.id,
          selectedTenantId,
          activeIdRef.current
        )
      );
      setLastError(syntheticRuntimeUnavailableReason);
      return;
    }
    const target = handoffTarget(status, activeDetail, handoffPending);
    if ("reason" in target) {
      setLastError(target.reason);
      return;
    }
    const requestId = handoffRequestIdRef.current + 1;
    handoffRequestIdRef.current = requestId;
    const requestTenantId = selectedTenantId;
    const isCurrentRequest = () =>
      handoffRequestIdRef.current === requestId &&
      selectedTenantIdRef.current === requestTenantId;
    setHandoffPending(true);
    setLastError("");
    try {
      const conversation = await client.handoff(target.id, target.policyRef);
      if (!isCurrentRequest()) return;
      const validationError = handoffResponseError(
        conversation,
        target.id,
        target.ref,
        requestTenantId
      );
      if (validationError) {
        if (activeIdRef.current === target.id) setLastError(validationError);
        return;
      }
      setConversations((rows) =>
        replaceHandoffConversation(rows, conversation, requestTenantId)
      );
      setDetail((current) =>
        replaceHandoffDetail(
          current,
          conversation,
          target.id,
          requestTenantId,
          activeIdRef.current
        )
      );
    } catch (error) {
      if (isCurrentRequest() && activeIdRef.current === target.id)
        setLastError(
          error instanceof Error ? error.message : "handoff runtime unavailable"
        );
    } finally {
      if (isCurrentRequest()) setHandoffPending(false);
    }
  }, [activeDetail, client, handoffPending, runtimeSource, selectedTenantId, status]);

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

function isSelectedTenant(conversation: ConversationRow, selectedTenantId: string) {
  return conversation.tenantId === selectedTenantId;
}

function handoffResponseError(
  conversation: ConversationRow,
  targetId: string,
  targetRef: string,
  requestTenantId: string
) {
  if (conversation.id !== targetId)
    return `handoff response did not match ${targetRef}`;
  if (!isSelectedTenant(conversation, requestTenantId))
    return tenantMismatchError("handoff", requestTenantId);
  return "";
}

function replaceHandoffConversation(
  rows: ConversationRow[],
  conversation: ConversationRow,
  requestTenantId: string
) {
  return rows.map((row) =>
    row.id === conversation.id && row.tenantId === requestTenantId ? conversation : row
  );
}

function replaceHandoffDetail(
  current: ConversationDetail | null,
  conversation: ConversationRow,
  targetId: string,
  requestTenantId: string,
  activeId: string
) {
  if (
    current?.conversation.id !== targetId ||
    current.conversation.tenantId !== requestTenantId ||
    activeId !== targetId
  )
    return current;
  return { ...current, conversation };
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
  if (filter === "needs") return row.status === "pending_handoff";
  if (filter === "sla") return row.status === "pending_handoff" || row.slaRisk;
  if (filter === "mine") return row.status === "handoff";
  if (filter === "ai") return row.status === "open" && row.aiState !== "suspended";
  return true;
}

export function countConversationFilters(
  rows: ConversationRow[]
): Record<ConversationFilterId, number> {
  const counts = {} as Record<ConversationFilterId, number>;
  for (const filter of conversationFilters)
    counts[filter.id] = rows.filter((row) =>
      matchesConversationFilter(row, filter.id)
    ).length;
  return counts;
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
