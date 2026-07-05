import { useEffect, useMemo, useState } from "react";
import { ArrowDownUp, ListFilter } from "lucide-react";
import { Avatar, Button, IconSlot, StatusBadge } from "../../primitives";
import {
  ContextRail,
  renderConversationState,
  type RailTab
} from "./conversationWorkbenchPanels";
import {
  conversationFilters,
  countConversationFilters,
  displayName,
  isEditableTarget,
  matchesConversationFilter,
  type ConversationFilterId,
  type ConversationRow,
  useConversationWorkbenchRuntime
} from "./conversationWorkbenchRuntime";
import {
  Composer,
  ConversationWorkbenchStyles,
  MessageBody,
  ThreadHeader
} from "./conversationWorkbenchStyles";

export function ConversationsPage({ selectedTenantId }: { selectedTenantId: string }) {
  const runtime = useConversationWorkbenchRuntime(selectedTenantId);
  const [filter, setFilter] = useState<ConversationFilterId>("all");
  const [railTab, setRailTab] = useState<RailTab>("profile");
  const active = runtime.activeConversation;
  const rows = useMemo(
    () => runtime.conversations.filter((row) => matchesConversationFilter(row, filter)),
    [filter, runtime.conversations]
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || isEditableTarget(event.target)) return;
      if (event.key.toLowerCase() !== "t" || !runtime.canRequestHandoff) return;
      event.preventDefault();
      void runtime.requestHandoff();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [runtime]);

  return (
    <section
      className="uz-page-conversations"
      data-runtime-source={runtime.runtimeSource}
      data-runtime-state={runtime.status === "ready" ? "degraded" : runtime.status}
      data-tenant-id={selectedTenantId}
      data-testid="m7-conversation-workbench-page"
    >
      <ConversationWorkbenchStyles />
      <ConversationList
        activeId={runtime.activeId}
        counts={countConversationFilters(runtime.conversations)}
        filter={filter}
        rows={rows}
        select={runtime.select}
        setFilter={setFilter}
      />
      <section className="uz-conv-thread" data-testid="m7-conversation-thread">
        <ThreadHeader
          active={active}
          disabled={!runtime.canRequestHandoff}
          disabledReason={runtime.handoffDisabledReason}
          degradedReason={runtime.degradedReason}
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
  counts: Record<ConversationFilterId, number>;
  filter: ConversationFilterId;
  rows: ConversationRow[];
  select: (id: string) => void;
  setFilter: (filter: ConversationFilterId) => void;
}) {
  return (
    <aside className="uz-conv-list" data-testid="m7-conversation-list">
      <header className="uz-conv-list__head">
        <h2>会话</h2>
        <StatusBadge>
          {rows.length} / {counts.all}
        </StatusBadge>
        <span className="uz-conv-list__icons" aria-hidden="true">
          <IconSlot icon={ListFilter} />
          <IconSlot icon={ArrowDownUp} />
        </span>
      </header>
      <nav aria-label="Conversation filters" className="uz-conv-filters">
        {conversationFilters.map((item) => (
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
      className={rowClassName(active, row)}
      data-tenant-id={row.tenantId}
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
        <ConversationStatusBadge row={row} />
        <OptionalLanguage row={row} />
        <OptionalSla row={row} />
        <OptionalAwaiting row={row} />
      </span>
    </button>
  );
}

function rowClassName(active: boolean, row: ConversationRow) {
  return `uz-conv-row ${rowToneClass(row)} ${active ? "is-selected" : ""}`;
}

function avatarTone(row: ConversationRow) {
  return row.aiState === "suspended" ? "human" : "ai";
}

function previewLabel(row: ConversationRow) {
  return (
    row.lastPreview || `${row.channel ?? "Business"} · ${row.displayRef || row.id}`
  );
}

function rowToneClass(row: ConversationRow) {
  if (row.status === "pending_handoff") return "is-human";
  if (row.slaRisk) return "is-sla";
  if (row.status === "handoff") return "is-manual";
  if (row.status === "closed") return "is-done";
  return "is-ai";
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
