import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createAdminRuntimeFetcher,
  readAdminRuntimeConfig
} from "../../adminRuntimeConfig";
import {
  inTab,
  ticketRecords,
  ticketTabs,
  type TicketRecord,
  type TicketTabId
} from "./ticketFallback";

export type RuntimeStatus = "empty" | "error" | "loading" | "permission" | "ready";
export type TicketCloseDraft = { id: string; note: string; result: string } | null;
type RuntimeFetcher = ReturnType<typeof createAdminRuntimeFetcher>;
const cKeys = "customerName participantExternalRef externalConversationRef".split(" ");
const metaKeys = "status externalConversationRef lastMessageAt".split(" ");

export function useTicketRuntime(selectedTenantId: string) {
  const config = useMemo(() => readAdminRuntimeConfig(), []);
  const fetcher = useMemo(
    () => createAdminRuntimeFetcher(config, { selectedTenantId }),
    [config, selectedTenantId]
  );
  const [records, setRecords] = useState<TicketRecord[]>(() =>
    config.strictRuntime ? [] : ticketRecords
  );
  const [runtimeStatus, setRuntimeStatus] = useState<RuntimeStatus>(
    config.strictRuntime ? "loading" : "ready"
  );
  const [lastError, setLastError] = useState("");

  const loadRuntimeTickets = useCallback(async () => {
    if (!config.strictRuntime) return;
    setRuntimeStatus("loading");
    setRecords([]);
    setLastError("");
    try {
      const list = await readRuntimeJson(fetcher, "/conversation-ticket/conversations");
      const details = await Promise.all(
        array(list.items).map(async (item) => {
          const conversation = object(item);
          const id = text(conversation.id);
          return id
            ? await readRuntimeJson(
                fetcher,
                `/conversation-ticket/conversations/${encodeURIComponent(id)}`
              )
            : { conversation, tickets: [] };
        })
      );
      const next = runtimeTicketRecordsFromDetails(details);
      setRecords(next);
      setRuntimeStatus(next.length === 0 ? "empty" : "ready");
    } catch (error) {
      const message = errorMessage(error);
      setLastError(message);
      setRuntimeStatus(/status (401|403)/.test(message) ? "permission" : "error");
    }
  }, [config.strictRuntime, fetcher]);

  useEffect(() => {
    if (!config.strictRuntime) {
      setRecords(ticketRecords);
      setRuntimeStatus("ready");
      setLastError("");
      return;
    }
    void loadRuntimeTickets();
  }, [config.strictRuntime, loadRuntimeTickets]);

  const runRuntimeAction = useCallback(
    async (
      kind: "claim" | "close" | "note",
      active: TicketRecord,
      closeDraft: TicketCloseDraft,
      noteDrafts: Record<string, string>
    ) => {
      if (!config.strictRuntime) return false;
      const body = runtimeActionBody(kind, active, closeDraft, noteDrafts);
      if (!body) return false;
      setLastError("");
      try {
        await readRuntimeJson(
          fetcher,
          `/conversation-ticket/tickets/${encodeURIComponent(active.id)}/actions`,
          {
            body: JSON.stringify(body),
            headers: { "content-type": "application/json" },
            method: "POST"
          }
        );
        await loadRuntimeTickets();
        return true;
      } catch (error) {
        setLastError(errorMessage(error));
        return false;
      }
    },
    [config.strictRuntime, fetcher, loadRuntimeTickets]
  );

  return {
    lastError,
    loadRuntimeTickets,
    records,
    runRuntimeAction,
    runtimeStatus,
    setLastError,
    setRecords,
    strictRuntime: config.strictRuntime
  };
}

export function firstNonEmptyTicketTab(records: readonly TicketRecord[]) {
  return ticketTabs.find((item) => records.some((ticket) => inTab(ticket, item.id)))
    ?.id;
}

export function ticketStateTitle(status: RuntimeStatus) {
  if (status === "empty") return "暂无真实工单";
  if (status === "permission") return "没有工单权限";
  if (status === "error") return "工单运行时不可用";
  return "工单加载中";
}

export function ticketStateMessage(status: RuntimeStatus, lastError: string) {
  if (status === "empty")
    return "当前租户没有返回工单；严格 runtime 不填充 mock 工单。";
  if (status === "permission") return lastError || "缺少 ticket/conversation 权限。";
  if (status === "error") return lastError || "conversation-ticket API 读取失败。";
  return "正在读取 conversation-ticket 运行时。";
}

export function runtimeTicketLabel(count: number, lastError: string) {
  const label = `conversation-ticket runtime · ${count} tickets`;
  return lastError ? `${label} · last action: ${lastError}` : label;
}

function runtimeTicketRecordsFromDetails(details: readonly unknown[]): TicketRecord[] {
  return details.flatMap((detailValue) => {
    const detail = object(detailValue);
    const conversation = object(detail.conversation);
    const messages = array(detail.messages);
    return array(detail.tickets).map((ticketValue) =>
      runtimeTicketRecord(object(ticketValue), conversation, messages)
    );
  });
}

function runtimeTicketRecord(
  ticketData: Record<string, unknown>,
  conversation: Record<string, unknown>,
  messages: unknown[]
) {
  const events = array(ticketData.events).map(object);
  const status = runtimeStatusText(text(ticketData.status));
  const assigned = text(ticketData.assignedUserId);
  const ticketId = text(ticketData.id) ?? "ticket-unavailable";
  const customer = runtimeCustomer(conversation);
  const orderRef = text(conversation.orderRef);
  const summary = text(ticketData.summary);
  return {
    assignee: runtimeAssignee(assigned),
    channel: firstText(conversation, "channel", "channelConnectionId") ?? "runtime",
    closeNote: text(ticketData.closeDestination) ?? "",
    closeResult: text(ticketData.closeResult) ?? null,
    customer,
    customerFull: text(conversation.customerName) ?? customer,
    customerMeta: metaKeys
      .map((key) => text(conversation[key]))
      .filter(Boolean)
      .join(" · "),
    customerRef:
      firstText(conversation, "customerRef", "participantExternalRef") ?? "—",
    id: ticketId,
    notes: ticketNotes(events),
    order: runtimeOrder(orderRef),
    priority: priorityText(numberValue(ticketData.priority)),
    quotes: [],
    sla: slaLabel(object(ticketData.sla)),
    snippet: runtimeSnippet(messages),
    status,
    summary: summary ?? "Runtime support ticket",
    suggestion:
      text(ticketData.suggestedAction) ??
      "Review the runtime conversation detail before replying.",
    tabs: runtimeTabs(ticketData, assigned, status),
    timeline: events.map(runtimeTimelineEvent),
    title: runtimeTicketTitle(summary, conversation, ticketId),
    tone: runtimeTicketTone(status, assigned)
  } satisfies TicketRecord;
}

const runtimeAssignee = (assigned: string | undefined) =>
  assigned ? `用户 ${assigned.slice(0, 8)}` : "未认领";

const runtimeCustomer = (conversation: Record<string, unknown>) =>
  firstText(conversation, ...cKeys) ?? "Runtime customer";

const runtimeOrder = (orderRef: string | undefined) =>
  orderRef ? { id: orderRef, meta: "runtime order snapshot" } : null;

const runtimeTicketTitle = (
  summary: string | undefined,
  conversation: Record<string, unknown>,
  ticketId: string
) =>
  summary ?? firstText(conversation, "subject", "externalConversationRef") ?? ticketId;

const runtimeTicketTone = (
  status: string,
  assigned: string | undefined
): TicketRecord["tone"] => (status === "已关闭" ? "ok" : assigned ? "ai" : "human");

function runtimeTimelineEvent(event: Record<string, unknown>) {
  return {
    dot: eventTone(text(event.type)),
    text: eventText(event),
    time: shortTime(text(event.occurredAt)),
    who: text(event.actorUserId) ?? "runtime"
  };
}

function runtimeActionBody(
  kind: "claim" | "close" | "note",
  active: TicketRecord,
  closeDraft: TicketCloseDraft,
  noteDrafts: Record<string, string>
) {
  if (kind === "claim") return { type: "claim" };
  if (kind === "note") {
    const note = (noteDrafts[active.id] ?? "").trim();
    return note ? { note, type: "note" } : null;
  }
  const note = closeDraft?.note.trim();
  return closeDraft && note
    ? { destination: note, result: closeDraft.result, type: "close" }
    : null;
}

async function readRuntimeJson(
  fetcher: RuntimeFetcher,
  path: string,
  init?: Parameters<RuntimeFetcher>[1]
) {
  const response = await fetcher(path, init);
  if (!response.ok) {
    throw new Error(
      `conversation-ticket request failed with status ${response.status}`
    );
  }
  const payload: unknown = await response.json();
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("conversation-ticket response must be an object");
  }
  return payload as Record<string, unknown>;
}

function runtimeTabs(
  ticketData: Record<string, unknown>,
  assigned: string | undefined,
  status: string
): TicketTabId[] {
  return [
    !assigned && status !== "已关闭" ? "unclaimed" : undefined,
    assigned && status !== "已关闭" ? "mine" : undefined,
    slaLabel(object(ticketData.sla)) !== "—" && status !== "已关闭" ? "sla" : undefined,
    status === "已重开" ? "reopened" : undefined,
    status !== "已关闭" ? "follow" : undefined
  ].filter(Boolean) as TicketTabId[];
}

const runtimeStatusLabels = Object.fromEntries(
  "claimed:已认领 closed:已关闭 escalated:已升级 locked:已锁定 reopened:已重开"
    .split(" ")
    .map((item) => item.split(":"))
) as Record<string, string>;

function runtimeStatusText(value: string | undefined) {
  return value ? (runtimeStatusLabels[value] ?? "待处理") : "待处理";
}

function ticketNotes(events: Record<string, unknown>[]) {
  return events
    .filter((event) => text(event.type) === "note_added")
    .map((event) => ({
      text: text(event.note) ?? "runtime note",
      time: shortTime(text(event.occurredAt)),
      who: text(event.actorUserId) ?? "runtime"
    }));
}

function priorityText(value: number | undefined): TicketRecord["priority"] {
  return value === undefined ? "低" : value <= 2 ? "高" : value <= 4 ? "中" : "低";
}

const slaLabel = (sla: Record<string, unknown>) => shortTime(text(sla.dueAt)) || "—";

function runtimeSnippet(messages: unknown[]): TicketRecord["snippet"] {
  return messages.slice(-2).map((messageValue) => {
    const messageData = object(messageValue);
    const content = object(messageData.content);
    return {
      color: text(messageData.direction) === "outbound" ? "ai" : "human",
      text: text(content.text) ?? text(content.preview) ?? "[runtime content]",
      who: text(messageData.direction) === "outbound" ? "AI" : "客户"
    };
  });
}

function eventText(event: Record<string, unknown>) {
  return [text(event.type) ?? "event", text(event.reason), text(event.note)]
    .filter(Boolean)
    .join(" · ");
}

function eventTone(value: string | undefined): TicketRecord["timeline"][number]["dot"] {
  if (value === "closed") return "ok";
  if (value === "created" || value === "reopened") return "warn";
  if (value === "claimed" || value === "locked") return "ai";
  return "off";
}

const shortTime = (value: string | undefined) =>
  value ? value.replace("T", " ").slice(5, 16) : "";

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "conversation-ticket request failed";
}

function object(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

const array = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

const text = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

function firstText(record: Record<string, unknown>, ...keys: string[]) {
  return keys.map((key) => text(record[key])).find(Boolean);
}

const numberValue = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;
