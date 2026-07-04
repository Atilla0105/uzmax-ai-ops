import {
  createElement as h,
  useMemo,
  useState,
  type ChangeEvent,
  type Dispatch,
  type ReactNode,
  type SetStateAction
} from "react";
import { Bot, Hand, Plus } from "lucide-react";
import { Button, IconSlot, StatusBadge, type ButtonProps } from "../../primitives";
import {
  inTab,
  nowHM,
  tabCounts,
  ticketCloseOptions,
  ticketCloseStatus,
  ticketFallbackMeta,
  ticketPageStyles,
  ticketRecords,
  ticketTabs,
  ticketTeamMembers,
  type TicketRecord,
  type TicketTabId
} from "./ticketFallback";

const me = "韩雪";
const initialTicket = ticketRecords[0] as TicketRecord;
type CloseDraft = { id: string; note: string; result: string } | null;
type Actions = {
  addNote: () => void;
  claim: () => void;
  close: () => void;
  reassign: (to: string) => void;
};
type Patch = (id: string, fn: (ticket: TicketRecord) => TicketRecord) => void;
type TestButtonProps = ButtonProps & { "data-testid"?: string };

// prettier-ignore
export function TicketsPage({ selectedTenantId }: { selectedTenantId: string }) {
  const [records, setRecords] = useState<TicketRecord[]>(ticketRecords);
  const [tab, setTab] = useState<TicketTabId>("sla");
  const [activeId, setActiveId] = useState(initialTicket.id);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [closeDraft, setCloseDraft] = useState<CloseDraft>(null);
  const counts = useMemo(() => tabCounts(records), [records]);
  const filtered = records.filter((ticket) => inTab(ticket, tab));
  const active = records.find((ticket) => ticket.id === activeId) ?? filtered[0] ?? records[0] ?? initialTicket;
  const patch: Patch = (id, fn) => setRecords((current) => current.map((ticket) => (ticket.id === id ? fn(ticket) : ticket)));
  const actions = makeActions(active, closeDraft, noteDrafts, patch, setCloseDraft, setNoteDrafts);
  return h("section", { className: "uz-ticket-page", "data-runtime-source": ticketFallbackMeta.source, "data-runtime-state": "degraded", "data-tenant-id": selectedTenantId, "data-testid": "m7-ticket-page" },
    h("style", null, ticketPageStyles),
    h(TicketList, { activeId: active.id, counts, filtered, select: setActiveId, setTab, tab }),
    h(TicketDetail, { active, actions, closeDraft: closeDraft?.id === active.id ? closeDraft : null, noteDraft: noteDrafts[active.id] ?? "", setCloseDraft, setNoteDraft: (value: string) => setNoteDrafts((drafts) => ({ ...drafts, [active.id]: value })) })
  );
}

// prettier-ignore
function makeActions(active: TicketRecord, closeDraft: CloseDraft, noteDrafts: Record<string, string>, patch: Patch, setCloseDraft: (draft: CloseDraft) => void, setNoteDrafts: Dispatch<SetStateAction<Record<string, string>>>): Actions {
  const append = (ticket: TicketRecord, text: string, dot: "ai" | "ok" = "ai") => [...ticket.timeline, { dot, text, time: nowHM(), who: me }];
  return {
    addNote: () => {
      const text = (noteDrafts[active.id] ?? "").trim();
      if (!text) return;
      patch(active.id, (ticket) => ({ ...ticket, notes: [...ticket.notes, { text, time: nowHM(), who: me }] }));
      setNoteDrafts((drafts) => ({ ...drafts, [active.id]: "" }));
    },
    claim: () => patch(active.id, (ticket) => ({ ...ticket, assignee: me, status: ticket.status === "待处理" ? "处理中" : ticket.status, tabs: [...new Set(ticket.tabs.filter((item) => item !== "unclaimed").concat("mine"))], timeline: append(ticket, `${me} 认领 mock 工单`) })),
    close: () => {
      if (!closeDraft?.note.trim()) return;
      patch(closeDraft.id, (ticket) => ({ ...ticket, closeNote: closeDraft.note, closeResult: closeDraft.result, status: ticketCloseStatus[closeDraft.result] ?? "已关闭", tabs: [], timeline: append(ticket, `工单关闭 · ${closeDraft.result}`, "ok") }));
      setCloseDraft(null);
    },
    reassign: (to: string) => {
      if (!to) return;
      patch(active.id, (ticket) => ({ ...ticket, assignee: to, tabs: [...new Set(ticket.tabs.filter((item) => item !== "unclaimed").concat(to === me ? ["mine"] : []))], timeline: append(ticket, `转派给 ${to}`) }));
    }
  };
}

// prettier-ignore
function TicketList(props: { activeId: string; counts: Record<TicketTabId, number>; filtered: TicketRecord[]; select: (id: string) => void; setTab: (tab: TicketTabId) => void; tab: TicketTabId }) {
  return h("aside", { className: "uz-ticket-list", "data-testid": "m7-ticket-list" },
    h("header", { className: "uz-ticket-list__head" }, h("h2", null, "工单"), h(StatusBadge, { tone: "warn" }, ticketFallbackMeta.label)),
    h("nav", { "aria-label": "Ticket tabs", className: "uz-ticket-tabs" }, ticketTabs.map((item) => h("button", { "aria-pressed": props.tab === item.id, className: `uz-ticket-tab ${props.tab === item.id ? "is-active" : ""}`, "data-testid": `m7-ticket-tab-${item.id}`, key: item.id, onClick: () => props.setTab(item.id), type: "button" }, item.label, " ", h("span", { className: "mono" }, `${props.counts[item.id]} mock`)))),
    h("div", { className: "uz-ticket-rows" }, props.filtered.map((ticket) => h(TicketRow, { active: ticket.id === props.activeId, key: ticket.id, select: props.select, ticket })))
  );
}

// prettier-ignore
function TicketRow({ active, select, ticket }: { active: boolean; select: (id: string) => void; ticket: TicketRecord }) {
  return h("button", { "aria-pressed": active, className: `uz-ticket-row tone-${ticket.tone} ${active ? "is-active" : ""}`, "data-testid": `m7-ticket-row-${ticket.id}`, onClick: () => select(ticket.id), type: "button" },
    h("span", { "aria-hidden": true, className: "uz-ticket-row__rail" }),
    h("span", { className: "uz-ticket-row__top" }, h("strong", null, ticket.id), h(StatusBadge, { tone: priorityTone(ticket.priority) }, ticket.priority), h("span", { className: "mono uz-ticket-row__sla" }, ticket.sla)),
    h("span", { className: "uz-ticket-row__title" }, ticket.title),
    h("span", { className: "uz-ticket-row__meta" }, h("span", null, ticket.customer), h("span", null, "·"), h("span", null, ticket.channel), h("span", null, ticket.assignee))
  );
}

// prettier-ignore
function TicketDetail(props: { active: TicketRecord; actions: Actions; closeDraft: CloseDraft; noteDraft: string; setCloseDraft: (draft: CloseDraft) => void; setNoteDraft: (value: string) => void }) {
  const { active } = props;
  const closed = Boolean(active.closeResult);
  return h("section", { className: "uz-ticket-detail", "data-testid": "m7-ticket-detail" },
    h("header", { className: "uz-ticket-detail__head" }, h("div", { className: "uz-ticket-detail__meta" }, h("strong", { className: "uz-ticket-mono" }, active.id), h(StatusBadge, { tone: closed ? "ok" : "danger" }, active.status), h(StatusBadge, { tone: "warn" }, `SLA ${active.sla}`), h(TicketActions, props)), h("div", { className: "uz-ticket-detail__title" }, active.title)),
    h("div", { className: "uz-ticket-runtime", "data-testid": "m7-ticket-runtime-note" }, h(StatusBadge, { tone: "warn" }, "degraded · mock · read-only"), h("span", null, ticketFallbackMeta.reason)),
    h("div", { className: "uz-ticket-body" }, h("main", { className: "uz-ticket-main" }, h(Card, { title: "摘要" }, h("p", null, active.summary)), h(Card, { className: "uz-ticket-ai", icon: h(IconSlot, { icon: Bot }), title: "AI 建议处理" }, h("p", null, active.suggestion)), h(TicketSnippet, { active }), h(TicketQuotes, { active }), h(TicketTimeline, { active }), h(TicketNotes, props)), h(TicketSide, props))
  );
}

// prettier-ignore
function TicketActions({ active, actions }: { active: TicketRecord; actions: Actions }) {
  return h("div", { className: "uz-ticket-actions" },
    h(TestButton, { "data-testid": "m7-ticket-claim", disabled: active.assignee !== "未认领", icon: h(IconSlot, { icon: Hand }), onClick: actions.claim, variant: active.assignee === "未认领" ? "primary" : "secondary" }, active.assignee === "未认领" ? "认领" : `已认领 · ${active.assignee}`),
    h("select", { "aria-label": "转派给", className: "uz-ticket-select", "data-testid": "m7-ticket-transfer", onChange: (event: ChangeEvent<HTMLSelectElement>) => actions.reassign(event.currentTarget.value), value: "" }, h("option", { value: "" }, "转派给…"), ticketTeamMembers.map((member) => h("option", { key: member, value: member }, member)))
  );
}

// prettier-ignore
function TicketSide(props: { active: TicketRecord; actions: Actions; closeDraft: CloseDraft; setCloseDraft: (draft: CloseDraft) => void }) {
  const { active } = props;
  return h("aside", { className: "uz-ticket-side", "data-testid": "m7-ticket-side-column" },
    h(Card, { title: "客户" }, h("strong", null, active.customer), h("div", { className: "uz-ticket-muted mono" }, active.customerRef), h("p", null, active.customerMeta)),
    h(Card, { title: "相关订单" }, h("strong", { className: "mono" }, active.order?.id ?? "—"), h("p", null, active.order?.meta ?? "暂无关联订单")),
    h(TicketClose, props)
  );
}

function Card({
  children,
  className = "",
  icon,
  title
}: {
  children?: ReactNode;
  className?: string;
  icon?: ReactNode;
  title: string;
}) {
  return h(
    "section",
    { className: `uz-ticket-card ${className}` },
    h("h3", null, icon, title),
    children
  );
}

function TestButton(props: TestButtonProps) {
  return h(Button, props);
}

// prettier-ignore
function TicketSnippet({ active }: { active: TicketRecord }) {
  return h(Card, { title: "会话片段" }, active.snippet.map((item) => h("div", { className: "uz-ticket-snippet", key: `${item.who}-${item.text}` }, h("strong", { className: `tone-${item.color}` }, item.who), h("span", null, item.text))));
}

// prettier-ignore
function TicketQuotes({ active }: { active: TicketRecord }) {
  return h(Card, { title: "报价记录" }, active.quotes.map((quote) => h("div", { className: "uz-ticket-quote", key: `${quote.time}-${quote.item}` }, h("div", null, h("strong", null, quote.item), h("div", { className: "uz-ticket-muted mono" }, `${quote.time} · ${quote.via}`)), h("span", { className: "mono" }, quote.price), h(StatusBadge, null, quote.result))));
}

// prettier-ignore
function TicketTimeline({ active }: { active: TicketRecord }) {
  return h(Card, { title: "事件时间线" }, active.timeline.map((event) => h("div", { className: `uz-ticket-timeline tone-${event.dot}`, key: `${event.time}-${event.text}` }, h("span", { className: "uz-ticket-dot" }), h("div", null, h("span", null, event.text), h("div", { className: "uz-ticket-muted mono" }, `${event.time} · ${event.who}`)))));
}

// prettier-ignore
function TicketNotes({ active, actions, noteDraft, setNoteDraft }: { active: TicketRecord; actions: Actions; noteDraft: string; setNoteDraft: (value: string) => void }) {
  return h(Card, { title: `备注 ${active.notes.length}` }, active.notes.map((note) => h("div", { className: "uz-ticket-noteitem", key: `${note.time}-${note.text}` }, h("span", null, note.text), h("span", { className: "uz-ticket-muted mono" }, `${note.time} · ${note.who}`))), h("div", { className: "uz-ticket-note" }, h("input", { "aria-label": "添加内部备注", "data-testid": "m7-ticket-note-input", onChange: (event: ChangeEvent<HTMLInputElement>) => setNoteDraft(event.currentTarget.value), placeholder: "添加内部备注…", value: noteDraft }), h(TestButton, { "data-testid": "m7-ticket-add-note", icon: h(IconSlot, { icon: Plus }), onClick: actions.addNote, variant: "primary" }, "添加")));
}

// prettier-ignore
function TicketClose({ active, actions, closeDraft, setCloseDraft }: { active: TicketRecord; actions: Actions; closeDraft: CloseDraft; setCloseDraft: (draft: CloseDraft) => void }) {
  if (active.closeResult) return h("section", { className: "uz-ticket-card uz-ticket-closed" }, h("h3", null, "工单已关闭"), h("strong", null, `结果：${active.closeResult}`), h("p", null, active.closeNote));
  return h("section", { className: "uz-ticket-card uz-ticket-close", "data-testid": "m7-ticket-close-panel" }, h("h3", null, "关闭工单"), h("div", { className: "uz-ticket-muted" }, "必须选择结果："), h("div", { className: "uz-ticket-close-options" }, ticketCloseOptions.map((option) => h("button", { "aria-pressed": closeDraft?.result === option, className: `uz-ticket-close-option ${closeDraft?.result === option ? "is-picked" : ""}`, key: option, onClick: () => setCloseDraft({ id: active.id, note: "", result: option }), type: "button" }, option))), closeDraft ? h(CloseDraftEditor, { actions, closeDraft, setCloseDraft }) : null);
}

// prettier-ignore
function CloseDraftEditor({ actions, closeDraft, setCloseDraft }: { actions: Actions; closeDraft: Exclude<CloseDraft, null>; setCloseDraft: (draft: CloseDraft) => void }) {
  return h("div", null, h("label", { className: "uz-ticket-muted", htmlFor: "ticket-close-note" }, "去向 / 说明（必填）"), h("textarea", { "data-testid": "m7-ticket-close-note", id: "ticket-close-note", onChange: (event: ChangeEvent<HTMLTextAreaElement>) => setCloseDraft({ ...closeDraft, note: event.currentTarget.value }), placeholder: "说明处理结果、去向或原因…", value: closeDraft.note }), h("div", { className: "uz-ticket-note" }, h(TestButton, { "data-testid": "m7-ticket-confirm-close", disabled: !closeDraft.note.trim(), onClick: actions.close, variant: "primary" }, "确认关闭"), h(TestButton, { "data-testid": "m7-ticket-cancel-close", onClick: () => setCloseDraft(null) }, "取消")));
}

function priorityTone(priority: TicketRecord["priority"]) {
  if (priority === "高") return "danger";
  if (priority === "中") return "warn";
  return "neutral";
}
