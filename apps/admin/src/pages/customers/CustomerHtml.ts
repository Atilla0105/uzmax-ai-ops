import {
  conversationRows,
  conversationTags,
  customerFallbackMeta,
  customerFlagDefs,
  customerPageStyles,
  customerTabs,
  type CustomerField,
  type CustomerFlagKey,
  type CustomerRecord,
  type CustomerTabId,
  type CustomerTag
} from "./customerFallback";

export interface CustomerRenderState {
  active: CustomerRecord | null;
  customers: CustomerRecord[];
  customerTags: CustomerTag[];
  fields: CustomerField[];
  filters: {
    flags: Partial<Record<CustomerFlagKey, boolean>>;
    lang: string;
    query: string;
    script: string;
    stage: string;
  };
  noteDraft: string;
  tab: CustomerTabId;
  tagPickerOpen: boolean;
}

export function renderCustomerPage(state: CustomerRenderState) {
  return `<style>${customerPageStyles}</style>${header(state)}${runtimeNote()}${state.active ? detail(state) : tabBody(state)}`;
}

function header(state: CustomerRenderState) {
  const active = state.active;
  const tabs = active
    ? ""
    : `<nav aria-label="Customer assets tabs" class="uz-customer-tabs">${customerTabs.map((tab) => tabButton(tab, state.tab)).join("")}</nav>`;
  const tools =
    !active && state.tab === "list"
      ? `<div class="uz-customer-tools"><input aria-label="搜索客户" class="uz-customer-input uz-customer-search" data-customer-input="query" data-testid="m7-customer-search" placeholder="姓名 / @用户名 / Telegram ID" value="${esc(state.filters.query)}"><button class="uz-button uz-button--secondary" data-customer-command="export" data-testid="m7-customer-export" type="button"><span>导出 mock</span></button></div>`
      : "";
  return `<header class="uz-customer-head"><div class="uz-customer-head__row"><div class="uz-customer-title">${active ? `<button class="uz-customer-back" data-customer-command="back" data-testid="m7-customer-back" type="button">返回</button>` : ""}<h2>客户资产</h2>${active ? `<span class="uz-customer-title__crumb">/</span><span class="uz-customer-title__crumb">${esc(active.initial)} · ${esc(active.id)}</span>` : ""}</div>${tools}</div>${tabs}</header>`;
}

function runtimeNote() {
  return `<div class="uz-customer-runtime" data-testid="m7-customer-runtime-note">${badge("warn", "degraded · mock · read-only")}<span>${esc(customerFallbackMeta.reason)} not production customer data.</span></div>`;
}

function tabBody(state: CustomerRenderState) {
  if (state.tab === "list") return listTab(state);
  if (state.tab === "search") return searchTab();
  if (state.tab === "field") return fieldsTab(state.fields);
  return tagsTab(state.tab === "ctag" ? state.customerTags : conversationTags);
}

function listTab(state: CustomerRenderState) {
  return `<section class="uz-customer-filter" data-testid="m7-customer-filter-bar">${select("lang", state.filters.lang, ["all", "乌兹别克语 mock", "俄语 mock"], "全部语言")}${select("script", state.filters.script, ["all", "拉丁 mock", "西里尔 mock"], "全部文字")}${select("stage", state.filters.stage, ["all", "售后", "购买中", "复购", "咨询", "已购"], "全部阶段")}<span class="uz-customer-divider"></span>${customerFlagDefs.map((flag) => flagButton(flag, state.filters.flags)).join("")}</section><main class="uz-customer-list"><div class="uz-customer-count" data-testid="m7-customer-list-count">${state.customers.length} 位 mock 客户 · 点击查看完整资产档案</div><div class="uz-customer-table" data-testid="m7-customer-table"><table><thead><tr>${["客户", "语言 / 文字", "旅程阶段", "订单", "累计消费", "未决问题", "标签", "最近会话"].map((label) => `<th>${esc(label)}</th>`).join("")}</tr></thead><tbody>${state.customers.map(customerRow).join("")}</tbody></table>${state.customers.length === 0 ? `<div class="uz-customer-empty" data-testid="m7-customer-empty">当前筛选没有 mock 客户。</div>` : ""}</div></main>`;
}

function detail(state: CustomerRenderState) {
  const active = state.active;
  if (!active) return "";
  const availableTags = state.customerTags.filter(
    (tag) => !active.tags.includes(tag.name)
  );
  return `<main class="uz-customer-detail" data-testid="m7-customer-detail">${identity(active)}<div class="uz-customer-detail-grid"><section class="uz-customer-main">${card("档案", `<p>${esc(active.profile)}</p><div class="uz-customer-stats">${stat("语言 / 文字", `${active.language} · ${active.script}`)}${stat("订单数", active.orders)}${stat("累计消费", active.spend)}${stat("首触渠道", active.channel)}</div>`)}${card("历史会话", stack(active.history.map((item) => itemBox(`<div class="uz-customer-item__row"><strong>${esc(item.title)}</strong><button class="uz-customer-table-action" type="button">跳回会话 -></button></div><div class="uz-customer-muted">${esc(item.channel)} · ${esc(item.member)} · ${esc(item.time)}</div>${tags(item.tags)}`))))}<div class="uz-customer-two">${card("订单快照", stack(active.orderSnapshots.map((item) => itemBox(`<div class="uz-customer-item__row"><strong class="uz-customer-mono">${esc(item.id)}</strong>${badge(item.tone, item.status)}</div><div class="uz-customer-muted">${esc(item.item)} · ${esc(item.amount)}</div>`))))}${card("报价记录", stack(active.quotes.map((item) => itemBox(`<div class="uz-customer-item__row"><strong>${esc(item.item)}</strong>${badge("neutral", item.result)}</div><div class="uz-customer-muted">${esc(item.time)} · ${esc(item.via)} · ${esc(item.price)}</div>`))))}</div>${active.tickets.length ? card("工单", stack(active.tickets.map((item) => itemBox(`<div class="uz-customer-item__row"><strong class="uz-customer-mono">${esc(item.id)}</strong>${badge(item.tone, item.status)}</div><div>${esc(item.title)}</div>`)))) : ""}${card("双轨引导记录", stack(active.dual.map((item) => itemBox(`<div class="uz-customer-item__row"><strong>${esc(item.stage)}</strong><span class="uz-customer-muted">${esc(item.time)}</span></div><div class="uz-customer-muted">${esc(item.via)}</div><div>${esc(item.note)}</div>`))))}${notes(active, state.noteDraft)}</section><aside class="uz-customer-side" data-testid="m7-customer-side-column">${customerTagsPanel(active, availableTags, state.tagPickerOpen)}${customFields(active, state.fields)}</aside></div></main>`;
}

function identity(active: CustomerRecord) {
  const restore =
    active.blocked || active.unreachable
      ? `<button class="uz-button uz-button--success" data-customer-command="restore" data-testid="m7-customer-restore" type="button"><span>解除拉黑/不可达 mock</span></button>`
      : "";
  return `<section class="uz-customer-identity" data-testid="m7-customer-identity"><span class="uz-customer-avatar">${esc(active.initial)}</span><div class="uz-customer-identity__main"><div class="uz-customer-identity__top"><strong>${esc(active.initial)} · ${esc(active.id)}</strong>${badge("info", active.stage)}${active.openIssue !== "—" ? badge(openIssueTone(active.openTone), `未决：${active.openIssue}`) : ""}${active.blocked ? badge("danger", "拉黑") : ""}${active.unreachable ? badge("warn", "不可达") : ""}</div><div class="uz-customer-muted uz-customer-mono">${esc(active.handle)} · ID MOCK-${esc(active.initial)} · synthetic phone hidden · 建档 ${esc(active.created)}</div></div><div class="uz-customer-actions">${restore}<button class="uz-button uz-button--secondary" disabled type="button"><span>归并身份 · read-only</span></button><button class="uz-button uz-button--danger" disabled type="button"><span>匿名化删除 · disabled</span></button></div></section>`;
}

function customerTagsPanel(
  active: CustomerRecord,
  availableTags: CustomerTag[],
  pickerOpen: boolean
) {
  return card(
    "客户标签",
    `<div class="uz-customer-tags" data-testid="m7-customer-detail-tags">${active.tags.map((tag) => `<span class="uz-customer-tag is-solid ${tagTone(tag)}">${esc(tag)} <button aria-label="移除 ${esc(tag)}" class="uz-customer-close" data-customer-command="remove-tag" data-tag="${esc(tag)}" type="button">×</button></span>`).join("")}<button class="uz-customer-tag-button" data-customer-command="toggle-tag-picker" data-testid="m7-customer-add-tag" type="button">+ 添加标签</button></div>${pickerOpen ? `<div class="uz-customer-tag-picker" data-testid="m7-customer-tag-picker">${availableTags.map((tag) => `<button class="uz-customer-tag-button" data-customer-command="add-tag" data-tag="${esc(tag.name)}" type="button">${esc(tag.name)}</button>`).join("")}</div>` : ""}`
  );
}

function customFields(active: CustomerRecord, fields: CustomerField[]) {
  return card(
    "自定义字段",
    `<div class="uz-customer-stack">${fields.map((field) => `<div class="uz-customer-field"><label for="field-${esc(field.id)}">${esc(field.name)} <span class="uz-customer-muted">${esc(field.type)}</span></label><input data-customer-field="${esc(field.name)}" data-testid="m7-customer-field-${esc(field.id)}" id="field-${esc(field.id)}" value="${esc(active.fields[field.name] ?? "")}" placeholder="mock empty"></div>`).join("")}</div>`
  );
}

function notes(active: CustomerRecord, noteDraft: string) {
  return card(
    `人工备注 ${active.notes.length}`,
    `<div class="uz-customer-note"><input aria-label="添加客户备注" data-customer-input="note" data-testid="m7-customer-note-input" placeholder="添加备注…local only" value="${esc(noteDraft)}"><button class="uz-button uz-button--primary" data-customer-command="add-note" data-testid="m7-customer-add-note" type="button"><span>添加</span></button></div><div class="uz-customer-stack">${active.notes.map((note) => itemBox(`<div class="uz-customer-item__row"><strong>${esc(note.who)}</strong><span class="uz-customer-muted">${esc(note.time)}</span></div><div>${esc(note.text)}</div>`)).join("")}</div>`
  );
}

function searchTab() {
  return `<main class="uz-customer-tabpane" data-testid="m7-customer-search-tab"><section class="uz-customer-filter"><input class="uz-customer-input uz-customer-search" placeholder="关键词 / 客户 / 会话 ID" value=""><select class="uz-customer-select"><option>全部客户</option></select><select class="uz-customer-select"><option>全部渠道</option></select><select class="uz-customer-select"><option>全部成员</option></select><select class="uz-customer-select"><option>全部时间</option></select></section><div class="uz-customer-count">${conversationRows.length} 条 mock 会话 · 跳回会话为只读</div><div class="uz-customer-table"><table><thead><tr>${["会话 ID", "客户", "摘要", "渠道", "成员", "时间", ""].map((label) => `<th>${esc(label)}</th>`).join("")}</tr></thead><tbody>${conversationRows.map((row) => `<tr><td class="uz-customer-mono">${esc(row.id)}</td><td>${esc(row.customer)}</td><td>${esc(row.summary)}${tags(row.tags)}</td><td>${esc(row.channel)}</td><td>${esc(row.member)}</td><td>${esc(row.time)}</td><td><button class="uz-customer-table-action" type="button">跳回会话 -></button></td></tr>`).join("")}</tbody></table></div></main>`;
}

function tagsTab(rows: CustomerTag[]) {
  return `<main class="uz-customer-tabpane" data-testid="m7-customer-tags-tab"><div class="uz-customer-count">标签配置为 mock/read-only，本页仅展示本地 UI。</div><div class="uz-customer-table"><table><thead><tr><th>标签</th><th>说明</th><th>数量</th><th></th></tr></thead><tbody>${rows.map((tag) => `<tr><td><span class="uz-customer-tag is-solid ${tagTone(tag.name)}">${esc(tag.name)}</span></td><td>${esc(tag.desc)}</td><td class="uz-customer-mono">${esc(tag.count)}</td><td><button class="uz-customer-table-action" type="button">编辑 mock</button></td></tr>`).join("")}</tbody></table></div></main>`;
}

function fieldsTab(rows: CustomerField[]) {
  return `<main class="uz-customer-tabpane" data-testid="m7-customer-fields-tab"><div class="uz-customer-count">自定义字段为 mock/read-only；详情内字段可本地编辑。</div><div class="uz-customer-table"><table><thead><tr><th>字段名</th><th>类型</th><th>选项 / 格式</th><th>已填写</th><th>创建时间</th></tr></thead><tbody>${rows.map((field) => `<tr><td><strong>${esc(field.name)}</strong></td><td>${badge("info", field.type)}</td><td>${esc(field.spec)}</td><td class="uz-customer-mono">${esc(field.count)}</td><td class="uz-customer-mono">${esc(field.created)}</td></tr>`).join("")}</tbody></table></div></main>`;
}

function customerRow(record: CustomerRecord) {
  return `<tr aria-label="打开客户资产 ${esc(record.initial)} ${esc(record.id)}" class="uz-customer-row" data-customer-command="open" data-customer-id="${esc(record.id)}" data-testid="m7-customer-row-${esc(record.id)}" role="button" tabindex="0"><td><div class="uz-customer-person"><span class="uz-customer-avatar">${esc(record.initial)}</span><div><div class="uz-customer-name"><span>${esc(record.initial)} · ${esc(record.id)}</span>${record.blocked ? badge("danger", "拉黑") : ""}${record.unreachable ? badge("warn", "不可达") : ""}</div><div class="uz-customer-muted uz-customer-mono">${esc(record.handle)}</div></div></div></td><td>${esc(record.language)} · ${esc(record.script)}</td><td>${badge("info", record.stage)}</td><td class="uz-customer-mono">${esc(record.orders)}</td><td class="uz-customer-mono">${esc(record.spend)}</td><td>${record.openIssue === "—" ? `<span class="uz-customer-muted">—</span>` : badge(openIssueTone(record.openTone), record.openIssue)}</td><td>${tags(record.tags)}</td><td class="uz-customer-muted">${esc(record.conv)}</td></tr>`;
}

function tabButton(tab: (typeof customerTabs)[number], current: CustomerTabId) {
  const active = tab.id === current;
  return `<button aria-pressed="${active}" class="uz-customer-tab ${active ? "is-active" : ""}" data-customer-command="tab" data-tab-id="${tab.id}" data-testid="m7-customer-tab-${tab.id}" type="button">${esc(tab.label)}</button>`;
}

function flagButton(
  flag: (typeof customerFlagDefs)[number],
  flags: Partial<Record<CustomerFlagKey, boolean>>
) {
  return `<button aria-pressed="${Boolean(flags[flag.key])}" class="uz-customer-chip" data-customer-command="flag" data-flag-key="${flag.key}" data-testid="m7-customer-flag-${flag.key}" type="button">${esc(flag.label)}</button>`;
}

function select(name: string, value: string, options: string[], allLabel: string) {
  return `<select aria-label="${esc(allLabel)}" class="uz-customer-select" data-customer-select="${name}" data-testid="m7-customer-select-${name}">${options.map((option) => `<option ${option === value ? "selected" : ""} value="${esc(option)}">${esc(option === "all" ? allLabel : option)}</option>`).join("")}</select>`;
}

function card(title: string, body: string) {
  return `<section class="uz-customer-card"><h3>${esc(title)}</h3>${body}</section>`;
}

function stat(label: string, value: string) {
  return `<div class="uz-customer-stat"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`;
}

function stack(items: string[]) {
  return items.length
    ? `<div class="uz-customer-stack">${items.join("")}</div>`
    : `<div class="uz-customer-empty">暂无 mock 数据</div>`;
}

function itemBox(body: string) {
  return `<div class="uz-customer-item">${body}</div>`;
}

function tags(items: readonly string[]) {
  return `<div class="uz-customer-tags">${items.map((item) => `<span class="uz-customer-tag">${esc(item)}</span>`).join("")}</div>`;
}

function badge(tone: "danger" | "info" | "neutral" | "ok" | "warn", text: string) {
  return `<span class="uz-status-badge uz-status-badge--${tone}">${esc(text)}</span>`;
}

function openIssueTone(tone: CustomerRecord["openTone"]) {
  return tone === "none" ? "neutral" : tone;
}

function tagTone(tag: string) {
  if (tag.includes("退款")) return "is-danger";
  if (tag.includes("价格") || tag.includes("物流")) return "is-warn";
  if (tag.includes("复购") || tag.includes("教程")) return "is-ok";
  return "is-info";
}

function esc(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
