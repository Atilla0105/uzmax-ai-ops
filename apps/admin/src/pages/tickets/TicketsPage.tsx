import {
  useMemo,
  useState,
  type Dispatch,
  type FormEvent,
  type MouseEvent,
  type SetStateAction
} from "react";
import {
  inTab,
  nowHM,
  tabCounts,
  ticketCloseStatus,
  ticketFallbackMeta,
  ticketRecords,
  type TicketRecord,
  type TicketTabId
} from "./ticketFallback";
import { renderTicketPage } from "./TicketHtml";

const me = "韩雪";
const initialTicket = ticketRecords[0] as TicketRecord;
type CloseDraft = { id: string; note: string; result: string } | null;
type Patch = (id: string, fn: (ticket: TicketRecord) => TicketRecord) => void;

export function TicketsPage({ selectedTenantId }: { selectedTenantId: string }) {
  const [records, setRecords] = useState<TicketRecord[]>(ticketRecords);
  const [tab, setTab] = useState<TicketTabId>("sla");
  const [activeId, setActiveId] = useState(initialTicket.id);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [closeDraft, setCloseDraft] = useState<CloseDraft>(null);
  const counts = useMemo(() => tabCounts(records), [records]);
  const filtered = records.filter((ticket) => inTab(ticket, tab));
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
  const actions = makeActions(
    active,
    closeDraft,
    noteDrafts,
    patch,
    setCloseDraft,
    setNoteDrafts
  );

  function onClick(event: MouseEvent<HTMLElement>) {
    const target = event.target as HTMLElement;
    const command = target.closest<HTMLElement>("[data-ticket-command]");
    if (!command) return;
    const { closeResult, rowId, tabId, ticketCommand } = command.dataset;
    if (tabId) setTab(tabId as TicketTabId);
    if (rowId) setActiveId(rowId);
    if (closeResult) setCloseDraft({ id: active.id, note: "", result: closeResult });
    if (ticketCommand === "claim") actions.claim();
    if (ticketCommand === "add-note") actions.addNote();
    if (ticketCommand === "confirm-close") actions.close();
    if (ticketCommand === "cancel-close") setCloseDraft(null);
  }

  function onInput(event: FormEvent<HTMLElement>) {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    if (target.dataset.noteFor) {
      setNoteDrafts((drafts) => ({
        ...drafts,
        [target.dataset.noteFor ?? ""]: target.value
      }));
    }
    if (target.dataset.ticketCommand === "close-note" && scopedCloseDraft) {
      setCloseDraft({ ...scopedCloseDraft, note: target.value });
    }
    if (target.dataset.ticketCommand === "transfer") actions.reassign(target.value);
  }

  function onChange(event: FormEvent<HTMLElement>) {
    const target = event.target as HTMLSelectElement;
    if (target.dataset.ticketCommand === "transfer") actions.reassign(target.value);
  }

  return (
    <section
      className="uz-ticket-page"
      data-runtime-source={ticketFallbackMeta.source}
      data-runtime-state="degraded"
      data-tenant-id={selectedTenantId}
      data-testid="m7-ticket-page"
      dangerouslySetInnerHTML={{
        __html: renderTicketPage(
          filtered,
          active,
          counts,
          tab,
          noteDrafts[active.id] ?? "",
          scopedCloseDraft
        )
      }}
      onChange={onChange}
      onClick={onClick}
      onInput={onInput}
    />
  );
}

function makeActions(
  active: TicketRecord,
  closeDraft: CloseDraft,
  noteDrafts: Record<string, string>,
  patch: Patch,
  setCloseDraft: (draft: CloseDraft) => void,
  setNoteDrafts: Dispatch<SetStateAction<Record<string, string>>>
) {
  const append = (ticket: TicketRecord, text: string, dot: "ai" | "ok" = "ai") => [
    ...ticket.timeline,
    { dot, text, time: nowHM(), who: me }
  ];
  return {
    addNote: () => {
      const text = (noteDrafts[active.id] ?? "").trim();
      if (!text) return;
      patch(active.id, (ticket) => ({
        ...ticket,
        notes: [...ticket.notes, { text, time: nowHM(), who: me }]
      }));
      setNoteDrafts((drafts) => ({ ...drafts, [active.id]: "" }));
    },
    claim: () =>
      patch(active.id, (ticket) => ({
        ...ticket,
        assignee: me,
        status: ticket.status === "待处理" ? "处理中" : ticket.status,
        tabs: [
          ...new Set(ticket.tabs.filter((item) => item !== "unclaimed").concat("mine"))
        ],
        timeline: append(ticket, `${me} 认领工单`)
      })),
    close: () => {
      if (!closeDraft?.note.trim()) return;
      patch(closeDraft.id, (ticket) => ({
        ...ticket,
        closeNote: closeDraft.note,
        closeResult: closeDraft.result,
        status: ticketCloseStatus[closeDraft.result] ?? "已关闭",
        tabs: [],
        timeline: append(ticket, `工单关闭 · ${closeDraft.result}`, "ok")
      }));
      setCloseDraft(null);
    },
    reassign: (to: string) => {
      if (!to) return;
      patch(active.id, (ticket) => ({
        ...ticket,
        assignee: to,
        tabs: [
          ...new Set(
            ticket.tabs
              .filter((item) => item !== "unclaimed")
              .concat(to === me ? ["mine"] : [])
          )
        ],
        timeline: append(ticket, `转派给 ${to}`)
      }));
    }
  };
}
