import { useEffect, useMemo, useState } from "react";
import { MessageSquare } from "lucide-react";
import { Avatar, Button, IconSlot, StatusBadge } from "../../primitives";
import {
  ContextRail,
  renderConversationState,
  type RailTab
} from "./conversationWorkbenchPanels";
import {
  displayName,
  type ConversationRow,
  useConversationWorkbenchRuntime
} from "./conversationWorkbenchRuntime";
import {
  Composer,
  ConversationWorkbenchStyles,
  MessageBody,
  ThreadHeader
} from "./conversationWorkbenchStyles";

type FilterId = "all" | "unread" | "awaiting" | "needs" | "sla" | "closed";
const filters: Array<{ id: FilterId; label: string }> = [
  { id: "all", label: "全部" },
  { id: "unread", label: "未读" },
  { id: "awaiting", label: "未回" },
  { id: "needs", label: "待人工" },
  { id: "sla", label: "SLA" },
  { id: "closed", label: "已解决" }
];

export function ConversationsPage() {
  const runtime = useConversationWorkbenchRuntime();
  const [filter, setFilter] = useState<FilterId>("all");
  const [railTab, setRailTab] = useState<RailTab>("profile");
  const active = runtime.detail?.conversation ?? runtime.conversations[0];
  const rows = useMemo(
    () => runtime.conversations.filter((row) => matchesFilter(row, filter)),
    [filter, runtime.conversations]
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || isEditableTarget(event.target)) return;
      if (event.key.toLowerCase() !== "t" || runtime.status !== "ready") return;
      event.preventDefault();
      void runtime.requestHandoff();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [runtime]);

  return (
    <section
      className="uz-page-conversations"
      data-testid="m7-conversation-workbench-page"
    >
      <ConversationWorkbenchStyles />
      <ConversationList
        activeId={runtime.activeId}
        counts={countFilters(runtime.conversations)}
        filter={filter}
        rows={rows}
        select={runtime.select}
        setFilter={setFilter}
      />
      <section className="uz-conv-thread" data-testid="m7-conversation-thread">
        <ThreadHeader
          active={active}
          disabled={runtime.status !== "ready"}
          handoffPending={runtime.handoffPending}
          requestHandoff={() => void runtime.requestHandoff()}
        />
        {runtime.status === "ready" ? (
          <>
            <MessageBody
              messages={runtime.detail?.messages ?? []}
              toggleTrace={runtime.toggleTrace}
              traceOpen={runtime.traceOpen}
            />
            <Composer active={active} degradedReason={runtime.degradedReason} />
          </>
        ) : null}
      </section>
      <ContextRail active={active} railTab={railTab} setRailTab={setRailTab} />
      <div className="uz-conv-overlay" hidden={runtime.status === "ready"}>
        {renderConversationState(runtime.status, runtime.lastError, runtime.reload)}
      </div>
    </section>
  );
}

function ConversationList({
  activeId,
  counts,
  filter,
  rows,
  select,
  setFilter
}: {
  activeId: string;
  counts: Record<FilterId, number>;
  filter: FilterId;
  rows: ConversationRow[];
  select: (id: string) => void;
  setFilter: (filter: FilterId) => void;
}) {
  return (
    <aside className="uz-conv-list" data-testid="m7-conversation-list">
      <header className="uz-conv-list__head">
        <h2>会话</h2>
        <StatusBadge>
          {rows.length} / {counts.all}
        </StatusBadge>
        <IconSlot icon={MessageSquare} />
      </header>
      <nav aria-label="Conversation filters" className="uz-conv-filters">
        {filters.map((item) => (
          <Button
            className="uz-conv-filter"
            key={item.id}
            onClick={() => setFilter(item.id)}
            variant={filter === item.id ? "primary" : "secondary"}
          >
            {item.label} {counts[item.id]}
          </Button>
        ))}
      </nav>
      <div className="uz-conv-rows">
        {rows.map((row) => (
          <ConversationListRow
            active={row.id === activeId}
            key={row.id}
            row={row}
            select={select}
          />
        ))}
      </div>
    </aside>
  );
}

function ConversationListRow({
  active,
  row,
  select
}: {
  active: boolean;
  row: ConversationRow;
  select: (id: string) => void;
}) {
  return (
    <button
      className={rowClassName(active)}
      data-testid={`m7-conversation-row-${row.id}`}
      onClick={() => select(row.id)}
      type="button"
    >
      <span className="uz-conv-row__top">
        <Avatar initial={displayName(row)} tone={avatarTone(row)} />
        <strong>{displayName(row)}</strong>
        <span className="mono">{row.timeLabel || timeLabel(row.lastMessageAt)}</span>
      </span>
      <span className="uz-conv-row__preview">{previewLabel(row)}</span>
      <span className="uz-conv-row__meta">
        <span className={dotClassName(row)} />
        <ConversationStatusBadge row={row} />
        <OptionalLanguage row={row} />
        <OptionalSla row={row} />
        <OptionalAwaiting row={row} />
      </span>
    </button>
  );
}

function rowClassName(active: boolean) {
  return `uz-conv-row ${active ? "is-selected" : ""}`;
}

function avatarTone(row: ConversationRow) {
  return row.aiState === "suspended" ? "human" : "ai";
}

function previewLabel(row: ConversationRow) {
  return (
    row.lastPreview || `${row.channel ?? "Business"} · ${row.displayRef || row.id}`
  );
}

function dotClassName(row: ConversationRow) {
  return `uz-conv-dot ${row.slaRisk ? "is-risk" : ""}`;
}

function OptionalLanguage({ row }: { row: ConversationRow }) {
  return row.language ? (
    <span className="uz-conv-row__lang">{row.language}</span>
  ) : null;
}

function OptionalSla({ row }: { row: ConversationRow }) {
  return row.slaRisk ? (
    <StatusBadge tone="danger">{row.slaText || "SLA 16m"}</StatusBadge>
  ) : null;
}

function OptionalAwaiting({ row }: { row: ConversationRow }) {
  return row.awaitingReply ? <StatusBadge tone="warn">待回复</StatusBadge> : null;
}

function matchesFilter(row: ConversationRow, filter: FilterId) {
  if (filter === "unread") return row.unreadCount > 0;
  if (filter === "awaiting") return row.awaitingReply;
  if (filter === "needs")
    return row.status === "pending_handoff" || row.aiState === "suspended";
  if (filter === "sla") return row.slaRisk;
  if (filter === "closed") return row.status === "closed";
  return true;
}

function countFilters(rows: ConversationRow[]): Record<FilterId, number> {
  return filters.reduce(
    (acc, filter) => ({
      ...acc,
      [filter.id]: rows.filter((row) => matchesFilter(row, filter.id)).length
    }),
    {} as Record<FilterId, number>
  );
}

function ConversationStatusBadge({ row }: { row: ConversationRow }) {
  if (row.status === "pending_handoff")
    return <StatusBadge tone="danger">待人工</StatusBadge>;
  if (row.status === "handoff") return <StatusBadge tone="warn">人工中</StatusBadge>;
  if (row.status === "closed") return <StatusBadge tone="ok">已解决</StatusBadge>;
  return <StatusBadge tone="info">AI 处理中</StatusBadge>;
}

function timeLabel(value?: string) {
  if (!value) return "—";
  const minutes = Math.max(1, Math.round((Date.now() - Date.parse(value)) / 60000));
  if (!Number.isFinite(minutes) || minutes > 1440)
    return value.replace("T", " ").slice(5, 16);
  if (minutes >= 60) return `${Math.round(minutes / 60)}h`;
  return `${minutes}m`;
}

function isEditableTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    ["input", "select", "textarea"].includes(target.tagName.toLowerCase())
  );
}
