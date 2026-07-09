import { useEffect, useMemo, useState } from "react";
import { Button } from "../../primitives";
import { PageState } from "../../patterns";
import {
  inTab,
  tabCounts,
  ticketFallbackMeta,
  ticketPageStyles,
  ticketRecords,
  type TicketRecord,
  type TicketTabId
} from "./ticketFallback";
import {
  firstNonEmptyTicketTab,
  runtimeTicketLabel,
  ticketStateMessage,
  ticketStateTitle,
  useTicketRuntime,
  type TicketCloseDraft
} from "./ticketRuntime";
import {
  handleTicketChange,
  handleTicketClick,
  handleTicketInput,
  makeLocalTicketActions,
  type TicketInteractionContext
} from "./ticketLocalActions";
import { renderTicketPage } from "./TicketHtml";

const initialTicket = ticketRecords[0] as TicketRecord;
type CloseDraft = TicketCloseDraft;
type Patch = (id: string, fn: (ticket: TicketRecord) => TicketRecord) => void;
type TicketRuntime = ReturnType<typeof useTicketRuntime>;

export function TicketsPage({ selectedTenantId }: { selectedTenantId: string }) {
  const runtime = useTicketRuntime(selectedTenantId);
  const { records, setRecords } = runtime;
  const [tab, setTab] = useState<TicketTabId>("sla");
  const [activeId, setActiveId] = useState(initialTicket.id);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [closeDraft, setCloseDraft] = useState<CloseDraft>(null);

  useEffect(() => {
    setActiveId((current) =>
      records.some((ticket) => ticket.id === current) ? current : records[0]?.id || ""
    );
  }, [records]);

  const counts = useMemo(() => tabCounts(records), [records]);
  const filtered = records.filter((ticket) => inTab(ticket, tab));

  useEffect(() => {
    if (!runtime.strictRuntime || records.length === 0 || filtered.length > 0) return;
    const nextTab = firstNonEmptyTicketTab(records);
    if (nextTab) setTab(nextTab);
  }, [filtered.length, records, runtime.strictRuntime]);

  const active =
    records.find((ticket) => ticket.id === activeId) ??
    filtered[0] ??
    records[0] ??
    initialTicket;
  const scopedCloseDraft = closeDraft?.id === active.id ? closeDraft : null;
  const patch: Patch = (id, fn) =>
    setRecords((current) =>
      current.map((ticket) => (ticket.id === id ? fn(ticket) : ticket))
    );
  const actions = makeLocalTicketActions(
    active,
    closeDraft,
    noteDrafts,
    patch,
    setCloseDraft,
    setNoteDrafts
  );
  const interaction: TicketInteractionContext = {
    actions,
    active,
    closeDraft,
    noteDrafts,
    runtime,
    scopedCloseDraft,
    setActiveId,
    setCloseDraft,
    setNoteDrafts,
    setTab
  };
  const stateView = renderTicketRuntimeState(runtime, selectedTenantId);
  if (stateView) return stateView;

  return (
    <section
      className="uz-ticket-page"
      data-runtime-source={ticketRuntimeSource(runtime)}
      data-runtime-state={ticketRuntimeState(runtime)}
      data-tenant-id={selectedTenantId}
      data-testid="m7-ticket-page"
      dangerouslySetInnerHTML={{
        __html: renderTicketPage(
          filtered,
          active,
          counts,
          tab,
          noteDrafts[active.id] ?? "",
          scopedCloseDraft,
          ticketRenderOptions(runtime, records.length)
        )
      }}
      onChange={(event) => handleTicketChange(event, interaction)}
      onClick={(event) => handleTicketClick(event, interaction)}
      onInput={(event) => handleTicketInput(event, interaction)}
    />
  );
}

function renderTicketRuntimeState(runtime: TicketRuntime, selectedTenantId: string) {
  if (!runtime.strictRuntime || runtime.runtimeStatus === "ready") return null;
  return (
    <section
      className="uz-ticket-page uz-ticket-page-state"
      data-runtime-source="api"
      data-runtime-state={runtime.runtimeStatus}
      data-tenant-id={selectedTenantId}
      data-testid="m7-ticket-page"
    >
      <style>{ticketPageStyles}</style>
      <PageState
        action={ticketStateAction(runtime)}
        data-testid={`m7-ticket-${runtime.runtimeStatus}`}
        kind={runtime.runtimeStatus}
        message={ticketStateMessage(runtime.runtimeStatus, runtime.lastError)}
        title={ticketStateTitle(runtime.runtimeStatus)}
      />
    </section>
  );
}

function ticketStateAction(runtime: TicketRuntime) {
  if (runtime.runtimeStatus !== "error" && runtime.runtimeStatus !== "permission") {
    return undefined;
  }
  return (
    <Button onClick={() => void runtime.loadRuntimeTickets()} variant="secondary">
      重试
    </Button>
  );
}

function ticketRuntimeSource(runtime: TicketRuntime) {
  return runtime.strictRuntime ? "api" : ticketFallbackMeta.source;
}

function ticketRuntimeState(runtime: TicketRuntime) {
  return runtime.strictRuntime ? runtime.runtimeStatus : "degraded";
}

function ticketRenderOptions(runtime: TicketRuntime, count: number) {
  return {
    runtimeLabel: runtime.strictRuntime
      ? runtimeTicketLabel(count, runtime.lastError)
      : ticketFallbackMeta.reason,
    transferDisabled: runtime.strictRuntime
  };
}
