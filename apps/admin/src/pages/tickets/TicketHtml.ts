import {
  ticketCloseOptions,
  ticketFallbackMeta,
  ticketPageStyles,
  ticketTabs,
  ticketTeamMembers,
  type TicketRecord,
  type TicketTabId
} from "./ticketFallback";

type CloseDraft = { id: string; note: string; result: string } | null;

export function renderTicketPage(
  filtered: TicketRecord[],
  active: TicketRecord,
  counts: Record<TicketTabId, number>,
  tab: TicketTabId,
  noteDraft: string,
  closeDraft: CloseDraft
) {
  return `<style>${ticketPageStyles}</style>${ticketList(filtered, active.id, counts, tab)}${ticketDetail(active, noteDraft, closeDraft)}`;
}

function ticketList(
  filtered: TicketRecord[],
  activeId: string,
  counts: Record<TicketTabId, number>,
  tab: TicketTabId
) {
  return `<aside class="uz-ticket-list" data-testid="m7-ticket-list"><header class="uz-ticket-list__head"><h2>工单</h2><span class="uz-ticket-list__count">${esc(ticketFallbackMeta.label)}</span></header><nav aria-label="Ticket tabs" class="uz-ticket-tabs">${ticketTabs.map((item) => tabButton(item, counts, tab)).join("")}</nav><div class="uz-ticket-rows">${filtered.map((ticket) => row(ticket, ticket.id === activeId)).join("")}</div></aside>`;
}

function ticketDetail(active: TicketRecord, noteDraft: string, closeDraft: CloseDraft) {
  const closed = Boolean(active.closeResult);
  return `<section class="uz-ticket-detail" data-testid="m7-ticket-detail"><header class="uz-ticket-detail__head"><div class="uz-ticket-detail__meta"><strong class="uz-ticket-mono">${esc(active.id)}</strong>${badge(closed ? "ok" : "danger", active.status)}${badge("warn", `SLA ${active.sla}`)}${ticketActions(active)}</div><div class="uz-ticket-detail__title">${esc(active.title)}</div></header><div class="uz-ticket-runtime" data-testid="m7-ticket-runtime-note"><span>${esc(ticketFallbackMeta.reason)}</span></div><div class="uz-ticket-body"><main class="uz-ticket-main">${card("摘要", `<p>${esc(active.summary)}</p>`)}${card("AI 建议处理", `<p>${esc(active.suggestion)}</p>`, "uz-ticket-ai", `<span class="uz-icon-slot" aria-hidden="true">AI</span>`)}${snippet(active)}${quotes(active)}${timeline(active)}${notes(active, noteDraft)}</main>${side(active, closeDraft)}</div></section>`;
}

function tabButton(
  item: (typeof ticketTabs)[number],
  counts: Record<TicketTabId, number>,
  tab: TicketTabId
) {
  const active = tab === item.id;
  return `<button aria-pressed="${active}" class="uz-ticket-tab ${active ? "is-active" : ""}" data-ticket-command data-tab-id="${item.id}" data-testid="m7-ticket-tab-${item.id}" type="button">${esc(item.label)} <span class="mono">${counts[item.id]}</span></button>`;
}

function row(ticket: TicketRecord, active: boolean) {
  return `<button aria-pressed="${active}" class="uz-ticket-row tone-${ticket.tone} ${active ? "is-active" : ""}" data-ticket-command data-row-id="${esc(ticket.id)}" data-testid="m7-ticket-row-${esc(ticket.id)}" type="button"><span aria-hidden="true" class="uz-ticket-row__rail"></span><span class="uz-ticket-row__top"><strong>${esc(ticket.id)}</strong>${badge(priorityTone(ticket.priority), ticket.priority)}<span class="mono uz-ticket-row__sla">${esc(ticket.sla)}</span></span><span class="uz-ticket-row__title">${esc(ticket.title)}</span><span class="uz-ticket-row__meta"><span>${esc(ticket.customer)}</span><span>·</span><span>${esc(ticket.channel)}</span><span>${esc(ticket.assignee)}</span></span></button>`;
}

function ticketActions(active: TicketRecord) {
  const claimed = active.assignee !== "未认领";
  return `<div class="uz-ticket-actions"><button class="uz-button uz-button--${claimed ? "secondary" : "primary"} uz-ticket-claim" data-ticket-command="claim" data-testid="m7-ticket-claim" ${claimed ? "disabled" : ""} type="button"><span>${claimed ? `已认领 · ${esc(active.assignee)}` : "认领"}</span></button><select aria-label="转派给" class="uz-ticket-select" data-ticket-command="transfer" data-testid="m7-ticket-transfer" value=""><option value="">转派给…</option>${ticketTeamMembers.map((member) => `<option value="${esc(member)}">${esc(member)}</option>`).join("")}</select></div>`;
}

function side(active: TicketRecord, closeDraft: CloseDraft) {
  return `<aside class="uz-ticket-side" data-testid="m7-ticket-side-column">${card("客户", `<strong>${esc(active.customerFull)}</strong><div class="uz-ticket-muted mono">${esc(active.customerRef)}</div><p>${esc(active.customerMeta)}</p>`)}${card("相关订单", `<strong class="mono">${esc(active.order?.id ?? "—")}</strong><p>${esc(active.order?.meta ?? "暂无关联订单")}</p>`)}${closePanel(active, closeDraft)}</aside>`;
}

function snippet(active: TicketRecord) {
  return card(
    "会话片段",
    active.snippet
      .map(
        (item) =>
          `<div class="uz-ticket-snippet"><strong class="tone-${item.color}">${esc(item.who)}</strong><span>${esc(item.text)}</span></div>`
      )
      .join("")
  );
}

function quotes(active: TicketRecord) {
  return card(
    "报价记录",
    active.quotes
      .map(
        (quote) =>
          `<div class="uz-ticket-quote"><div><strong>${esc(quote.item)}</strong><div class="uz-ticket-muted mono">${esc(quote.time)} · ${esc(quote.via)}</div></div><span class="mono">${esc(quote.price)}</span>${badge("neutral", quote.result)}</div>`
      )
      .join("")
  );
}

function timeline(active: TicketRecord) {
  return card(
    "事件时间线",
    active.timeline
      .map(
        (event) =>
          `<div class="uz-ticket-timeline tone-${event.dot}"><span class="uz-ticket-dot"></span><div><span>${esc(event.text)}</span><div class="uz-ticket-muted mono">${esc(event.time)} · ${esc(event.who)}</div></div></div>`
      )
      .join("")
  );
}

function notes(active: TicketRecord, noteDraft: string) {
  return card(
    `备注 ${active.notes.length}`,
    `${active.notes.map((note) => `<div class="uz-ticket-noteitem"><span>${esc(note.text)}</span><span class="uz-ticket-muted mono">${esc(note.time)} · ${esc(note.who)}</span></div>`).join("")}<div class="uz-ticket-note"><input aria-label="添加内部备注" data-note-for="${esc(active.id)}" data-testid="m7-ticket-note-input" placeholder="添加内部备注…" value="${esc(noteDraft)}"><button class="uz-button uz-button--primary" data-ticket-command="add-note" data-testid="m7-ticket-add-note" type="button"><span>添加</span></button></div>`
  );
}

function closePanel(active: TicketRecord, closeDraft: CloseDraft) {
  if (active.closeResult)
    return `<section class="uz-ticket-card uz-ticket-closed"><h3>工单已关闭</h3><strong>结果：${esc(active.closeResult)}</strong><p>${esc(active.closeNote)}</p></section>`;
  return `<section class="uz-ticket-card uz-ticket-close" data-testid="m7-ticket-close-panel"><h3>关闭工单</h3><div class="uz-ticket-muted">必须选择结果：</div><div class="uz-ticket-close-options">${ticketCloseOptions.map((option) => closeOption(active.id, option, closeDraft)).join("")}</div>${closeDraft ? closeEditor(closeDraft) : ""}</section>`;
}

function closeOption(id: string, option: string, closeDraft: CloseDraft) {
  const active = closeDraft?.result === option;
  return `<button aria-pressed="${active}" class="uz-ticket-close-option ${active ? "is-picked" : ""}" data-close-result="${esc(option)}" data-ticket-command type="button">${esc(option)}</button>`;
}

function closeEditor(closeDraft: Exclude<CloseDraft, null>) {
  return `<div><label class="uz-ticket-muted" for="ticket-close-note">去向 / 说明（必填）</label><textarea data-ticket-command="close-note" data-testid="m7-ticket-close-note" id="ticket-close-note" placeholder="说明处理结果、去向或原因…">${esc(closeDraft.note)}</textarea><div class="uz-ticket-note"><button class="uz-button uz-button--primary" data-ticket-command="confirm-close" data-testid="m7-ticket-confirm-close" ${closeDraft.note.trim() ? "" : "disabled"} type="button"><span>确认关闭</span></button><button class="uz-button uz-button--secondary" data-ticket-command="cancel-close" data-testid="m7-ticket-cancel-close" type="button"><span>取消</span></button></div></div>`;
}

function card(title: string, body: string, className = "", icon = "") {
  return `<section class="uz-ticket-card ${className}"><h3>${icon}${esc(title)}</h3>${body}</section>`;
}

function badge(tone: "danger" | "neutral" | "ok" | "warn", text: string) {
  return `<span class="uz-status-badge uz-status-badge--${tone}">${esc(text)}</span>`;
}

function priorityTone(priority: TicketRecord["priority"]) {
  if (priority === "高") return "danger";
  if (priority === "中") return "warn";
  return "neutral";
}

function esc(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
