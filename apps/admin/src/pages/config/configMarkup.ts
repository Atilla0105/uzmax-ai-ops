import {
  configRuntimeLabels,
  configSectionLabels,
  configSections,
  configSourceSummary,
  configStateCopy,
  selectOptions,
  type ConfigDraft,
  type ConfigSection,
  type ConfigVersion,
  type ConfigViewState
} from "./configFallback";

export function renderConfig(input: {
  dirty: boolean;
  draft: ConfigDraft;
  history: readonly ConfigVersion[];
  historyOpen: boolean;
  isDirtyable: boolean;
  section: ConfigSection;
  selectedTenantId: string;
  toast: string;
  version: ConfigVersion;
  viewState: ConfigViewState;
}) {
  return `${sideNav(input.section)}${mainPanel(input)}`;
}

function sideNav(section: ConfigSection) {
  const buttons = configSections
    .map(
      ([id, label]) =>
        `<button aria-pressed="${section === id}" data-action="set-section" data-id="${id}" type="button">${label}</button>`
    )
    .join("");
  return `<aside class="uz-config-side" data-testid="m7-config-internal-nav"><h2>配置</h2><nav aria-label="配置段" class="uz-config-nav">${buttons}</nav></aside>`;
}

function mainPanel(input: Parameters<typeof renderConfig>[0]) {
  const body =
    input.viewState === "degraded"
      ? activeBody(input)
      : `<main class="uz-config-state" data-testid="m7-config-state-${input.viewState}"><div><h2>${input.viewState === "permission" ? "permission denied / locked" : input.viewState}</h2><p>${esc(configStateCopy(input.viewState))}</p></div></main>`;
  return `<section class="uz-config-main">${header(input)}${runtimeNote()}${toast(input.toast)}${body}</section>`;
}

function header(input: Parameters<typeof renderConfig>[0]) {
  const label = configSectionLabels[input.section];
  const historyButton = input.history.length
    ? `<button class="uz-config-mini" data-action="toggle-history" type="button">${input.historyOpen ? "收起版本历史" : `版本历史（${input.history.length}）`}</button>`
    : "";
  const saveButton = input.isDirtyable
    ? `<button class="uz-config-btn is-primary" data-action="save" data-testid="m7-config-save" ${input.dirty ? "" : "disabled"} type="button">保存并生成版本</button>`
    : "";
  return `<header class="uz-config-head"><div class="uz-config-head-row"><div><h1 class="uz-config-title">配置</h1><div class="uz-config-current">${label}</div></div><span class="uz-config-meta" data-testid="m7-config-version-meta">当前版本 v${input.version.ver} · ${versionCopy(input.version)}</span><span class="uz-status-badge uz-status-badge--warn">${esc(input.selectedTenantId)} · tenant layer</span>${input.dirty ? '<span class="uz-status-badge uz-status-badge--warn">未保存的修改</span>' : ""}<div class="uz-config-tools">${historyButton}${saveButton}</div></div></header>`;
}

function activeBody(input: Parameters<typeof renderConfig>[0]) {
  return `<main class="uz-config-body"><p class="uz-config-muted" data-testid="m7-config-source-mark">${configSourceSummary} · ${configRuntimeLabels.join(" · ")}</p>${input.historyOpen ? history(input.history) : ""}${sectionBody(input.section, input.draft)}</main>`;
}

function sectionBody(section: ConfigSection, draft: ConfigDraft) {
  if (section === "biz") return business(draft);
  if (section === "sla") return sla(draft);
  if (section === "channel") return channels(draft);
  return connector(draft);
}

function business(draft: ConfigDraft) {
  return `<section class="uz-config-panel uz-config-grid">${field("默认语言", "biz.lang", select("biz.lang", draft.biz.lang, selectOptions.lang))}${field("默认时区", "biz.timezone", select("biz.timezone", draft.biz.timezone, selectOptions.timezone))}${field("转人工兜底渠道", "biz.handoffChannel", select("biz.handoffChannel", draft.biz.handoffChannel, selectOptions.handoff))}${field("单成员接待上限", "biz.cap", numberInput("biz.cap", draft.biz.cap))}</section>`;
}

function sla(draft: ConfigDraft) {
  const rowsHtml = draft.sla
    .map(
      (row) =>
        `<tr><td class="is-strong">${esc(row.label)}</td><td>${numberInput("sla.first", row.first, row.id)}</td><td>${numberInput("sla.resolve", row.resolve, row.id)}</td></tr>`
    )
    .join("");
  return table(["优先级", "首次响应（分钟）", "解决时限（分钟）"], rowsHtml);
}

function channels(draft: ConfigDraft) {
  const body = draft.channels
    .map(
      (channel) =>
        `<article class="uz-config-panel uz-config-row"><div class="uz-config-row-main"><div class="uz-config-row-title">${esc(channel.name)}</div><div class="uz-config-row-sub">${esc(channel.desc)} · 最近测试 ${esc(channel.lastTest)} · 状态 ${esc(channel.status)}</div></div><button class="uz-config-mini" data-action="test-channel" data-id="${esc(channel.id)}" type="button">测试连接</button><button aria-label="${esc(channel.name)} 启停" aria-pressed="${channel.enabled}" class="uz-config-switch" data-action="toggle-channel" data-id="${esc(channel.id)}" type="button"><span></span></button><span class="uz-status-badge uz-status-badge--${channel.enabled ? "ok" : "neutral"}">${channel.enabled ? "已启用" : "已停用"}</span></article>`
    )
    .join("");
  return `<section class="uz-config-stack">${body}</section>`;
}

function connector(draft: ConfigDraft) {
  const connectorState = draft.connector;
  const isApi = connectorState.mode === "api";
  const nextMode = isApi ? "import" : "api";
  return `<section class="uz-config-panel uz-config-connector">${kv("当前主路径", isApi ? "订单 API（本地主路径）" : "导入快照（本地主路径）")}${kv("订单 API 健康度", connectorState.apiHealth)}${kv("最近错误", connectorState.lastError)}${kv("最近同步", connectorState.lastSync)}<div class="uz-config-actions"><button class="uz-config-mini" data-action="test-connector" type="button">测试连接</button><button class="uz-config-danger" data-action="switch-connector" data-id="${nextMode}" type="button">${isApi ? "切换为导入快照主路径" : "切换回订单 API 主路径"}</button><button class="uz-config-link" type="button">查看导入历史（本地预览）</button></div></section>`;
}

function history(items: readonly ConfigVersion[]) {
  return `<section class="uz-config-history" data-testid="m7-config-history"><div class="uz-config-history-head">版本历史 · 回滚原因必填 · browser-local only</div>${items.map((item) => `<div class="uz-config-history-row"><span class="uz-config-version">v${item.ver}</span><div class="uz-config-row-main"><div class="uz-config-row-title">${esc(item.note ?? "版本记录")}</div><div class="uz-config-row-sub">${esc(item.by)} · ${esc(item.at)} · no audit write</div></div><button class="uz-config-danger" data-action="rollback" data-id="${item.ver}" type="button">回滚到此版本</button></div>`).join("")}</section>`;
}

function table(cols: readonly string[], rowsHtml: string) {
  return `<section class="uz-config-panel"><div class="uz-config-table-wrap"><table class="uz-config-table"><thead><tr>${cols.map((c) => `<th>${esc(c)}</th>`).join("")}</tr></thead><tbody>${rowsHtml}</tbody></table></div></section>`;
}

function field(label: string, id: string, control: string) {
  return `<div class="uz-config-field"><label for="${id}">${esc(label)}</label>${control}</div>`;
}

function select(id: string, value: string, opts: readonly string[]) {
  return `<select data-field="${id}" id="${id}">${opts.map((opt) => `<option ${opt === value ? "selected" : ""}>${esc(opt)}</option>`).join("")}</select>`;
}

function numberInput(id: string, value: string, rowId = "") {
  return `<input data-field="${id}" ${rowId ? `data-id="${esc(rowId)}"` : ""} type="number" value="${esc(value)}">`;
}

function kv(label: string, value: string) {
  return `<div class="uz-config-kv"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`;
}

function runtimeNote() {
  return `<div class="uz-config-note" data-testid="m7-config-runtime-note"><strong>${configRuntimeLabels.slice(0, 4).join(" · ")}</strong><span>${configRuntimeLabels.slice(4).join(" · ")}</span></div>`;
}

function toast(message: string) {
  return message
    ? `<div aria-live="polite" class="uz-config-toast" data-testid="m7-config-toast" role="status">${esc(message)}</div>`
    : "";
}

function versionCopy(version: ConfigVersion) {
  return `${version.by} 修改于 ${version.at}`;
}

function esc(value: string) {
  return value.replace(/[&<>"]/g, (match) => htmlEscapes[match] ?? match);
}

const htmlEscapes: Record<string, string> = {
  '"': "&quot;",
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;"
};
