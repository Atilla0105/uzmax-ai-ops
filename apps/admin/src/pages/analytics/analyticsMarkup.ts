import {
  analyticsDimDefs,
  analyticsFilterOptions,
  analyticsRuntimeLabels,
  analyticsSourceSummary,
  analyticsStateCopy,
  buildHandoffReasons,
  buildKpis,
  buildTopIssues,
  latencyHints,
  queueHints,
  trendRows,
  type AnalyticsDimension,
  type AnalyticsFilters,
  type AnalyticsRange,
  type AnalyticsTone,
  type AnalyticsViewState
} from "./analyticsFallback";

export function renderAnalytics(input: {
  dims: readonly AnalyticsDimension[];
  filters: AnalyticsFilters;
  menuOpen: boolean;
  range: AnalyticsRange;
  selectedTenantId: string;
  toast: string;
  viewState: AnalyticsViewState;
}) {
  const header = pageHeader(input);
  if (!["degraded", "delayed"].includes(input.viewState)) {
    return `${header}${statePanel(input.viewState)}`;
  }
  return `${header}${toast(input.toast)}<main class="uz-analytics-body">${runtimeNote()}${delayedBanner(input.viewState)}${filterSummary(input)}${kpiGrid(input)}${splitPanels(input)}${hintPanels()}${chips(input.dims)}${analyticsTable(input.dims)}</main>`;
}

function pageHeader(input: Parameters<typeof renderAnalytics>[0]) {
  return `<header class="uz-analytics-head" data-testid="m7-analytics-header"><h1 class="uz-analytics-title">分析</h1>${rangeNav(input.range)}${filter("channel", "渠道", input.filters.channel)}${filter("language", "语言", input.filters.language)}<span class="uz-status-badge uz-status-badge--warn">${esc(input.selectedTenantId)} · tenant layer</span><div class="uz-analytics-tools"><button class="uz-analytics-tool" data-action="toggle-menu" data-testid="m7-analytics-add-dim" type="button">＋ 添加维度</button><button class="uz-analytics-tool" data-action="export" data-testid="m7-analytics-export" type="button">⇩ 导出</button>${input.menuOpen ? dimMenu(input.dims) : ""}</div></header>`;
}

function rangeNav(active: AnalyticsRange) {
  return `<nav aria-label="分析时间范围" class="uz-analytics-range">${(["today", "7d", "30d"] as const).map((id) => `<button aria-pressed="${active === id}" data-action="range" data-id="${id}" type="button">${id === "today" ? "今日" : id === "7d" ? "近 7 日" : "近 30 日"}</button>`).join("")}</nav>`;
}

function filter(field: keyof AnalyticsFilters, label: string, value: string) {
  const options = analyticsFilterOptions[field]
    .map((item) => `<option ${item === value ? "selected" : ""}>${esc(item)}</option>`)
    .join("");
  return `<label class="uz-analytics-filter"><span>${label}</span><select aria-label="分析${label}筛选" data-field="${field}">${options}</select></label>`;
}

function dimMenu(dims: readonly AnalyticsDimension[]) {
  const buttons = (Object.keys(analyticsDimDefs) as AnalyticsDimension[])
    .map((id) => {
      const active = dims.includes(id);
      const disabled = !active && dims.length >= 2;
      return `<button aria-pressed="${active}" ${disabled ? "disabled" : ""} data-action="toggle-dim" data-id="${id}" type="button"><span class="uz-analytics-check">${active ? "✓" : ""}</span>${esc(analyticsDimDefs[id].label)}</button>`;
    })
    .join("");
  return `<div class="uz-analytics-menu" data-testid="m7-analytics-dim-menu"><div class="uz-analytics-menu-note">选择维度（最多 2 个）</div>${buttons}</div>`;
}

function runtimeNote() {
  return `<div class="uz-analytics-note" data-testid="m7-analytics-runtime-note"><strong>${analyticsRuntimeLabels.slice(0, 4).join(" · ")}</strong><span>${analyticsRuntimeLabels.slice(4).join(" · ")}</span></div>`;
}

function delayedBanner(state: AnalyticsViewState) {
  return `<div class="uz-analytics-delayed" data-testid="m7-analytics-delayed-data"><strong>${state === "delayed" ? "delayed data state" : "延迟数据提示"}</strong><span>趋势、队列与延迟数据均为 centralized synthetic fallback；订单 connector 延迟 12 分钟；no production analytics metrics。</span></div>`;
}

function filterSummary(input: Parameters<typeof renderAnalytics>[0]) {
  return `<p class="uz-analytics-filter-summary" data-testid="m7-analytics-filter-summary">${analyticsSourceSummary} · ${input.filters.channel} · ${input.filters.language}</p>`;
}

function kpiGrid(input: Parameters<typeof renderAnalytics>[0]) {
  return `<section class="uz-analytics-kpis" data-testid="m7-analytics-kpis">${buildKpis(
    input.range,
    input.filters
  )
    .map(
      ([label, value, delta, tone]) =>
        `<article class="uz-analytics-kpi"><span>${esc(label)} · mock/degraded · no production analytics metrics</span><strong class="tone-${tone}">${esc(value)}</strong><small class="tone-${tone}">${esc(delta)}</small></article>`
    )
    .join("")}</section>`;
}

function splitPanels(input: Parameters<typeof renderAnalytics>[0]) {
  const handoff = buildHandoffReasons()
    .map(
      ([label, pct, tone]) =>
        `<div class="uz-analytics-bar"><div class="uz-analytics-bar-row"><span>${esc(label)}</span><strong>${pct}%</strong></div><div class="uz-analytics-meter"><span class="uz-analytics-fill tone-${tone} w${pct}"></span></div></div>`
    )
    .join("");
  const issues = buildTopIssues(input.range, input.filters)
    .map(
      (issue) =>
        `<div class="uz-analytics-issue"><span class="uz-analytics-rank">${issue.rank}</span><strong>${esc(issue.label)}</strong><span class="uz-analytics-count">${esc(issue.count)}</span></div>`
    )
    .join("");
  return `<section class="uz-analytics-split"><article class="uz-analytics-panel" data-testid="m7-analytics-handoff"><h3>转人工原因分布</h3>${handoff}</article><article class="uz-analytics-panel" data-testid="m7-analytics-top-issues"><h3>Top 问题</h3>${issues}</article></section>`;
}

function hintPanels() {
  const trend = trendRows
    .map(
      ([day, volume, resolved, latency, width]) =>
        `<div class="uz-analytics-trend"><span>${day} · ${volume} 会话 · ${resolved}</span><div class="uz-analytics-meter uz-analytics-trend-meter"><span class="uz-analytics-fill tone-data ${width}"></span></div><strong>${latency}</strong></div>`
    )
    .join("");
  return `<section class="uz-analytics-hints" data-testid="m7-analytics-hints"><article class="uz-analytics-panel"><h3>趋势提示</h3>${trend}</article>${hintPanel("队列提示", queueHints)}${hintPanel("延迟提示", latencyHints)}</section>`;
}

function hintPanel(
  title: string,
  rows: readonly (readonly [string, string, AnalyticsTone])[]
) {
  return `<article class="uz-analytics-panel"><h3>${title}</h3>${rows.map(([label, value, tone]) => `<div class="uz-analytics-hint"><span>${esc(label)}</span><strong class="tone-${tone}">${esc(value)}</strong></div>`).join("")}</article>`;
}

function chips(dims: readonly AnalyticsDimension[]) {
  if (!dims.length) return "";
  return `<div class="uz-analytics-chips" data-testid="m7-analytics-active-dims"><span>按维度拆分：</span>${dims.map((id) => `<span class="uz-analytics-chip">${esc(analyticsDimDefs[id].label)}<button aria-label="移除${esc(analyticsDimDefs[id].label)}维度" data-action="remove-dim" data-id="${id}" type="button">×</button></span>`).join("")}</div>`;
}

function analyticsTable(dims: readonly AnalyticsDimension[]) {
  const table = buildAnalyticsTable(dims);
  const head = table.cols.map((col) => `<th>${esc(col)}</th>`).join("");
  const body = table.rows
    .map(
      (row) =>
        `<tr>${row.combo.map((value) => `<td class="is-strong">${esc(value)}</td>`).join("")}<td class="is-mono">${row.sessions}</td><td class="is-mono">${row.resolved}%</td><td class="is-mono">${row.handoff}%</td><td class="is-mono">¥${row.cost}</td></tr>`
    )
    .join("");
  return `<section class="uz-analytics-panel uz-analytics-table-panel" data-testid="m7-analytics-table"><div class="uz-analytics-table-head">分析表${table.capped ? "<span>组合过多，仅显示前 20 行</span>" : ""}</div><div class="uz-analytics-table-wrap"><table class="uz-analytics-table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div></section>`;
}

function buildAnalyticsTable(dims: readonly AnalyticsDimension[]) {
  const active = dims.filter((dim) => analyticsDimDefs[dim]);
  if (!active.length) {
    return {
      capped: false,
      cols: ["维度", "会话量", "解决率", "转人工率", "AI 成本"],
      rows: [{ combo: ["总计"], cost: 418, handoff: 14, resolved: 87, sessions: 2496 }]
    };
  }
  let combos: string[][] = [[]];
  for (const dim of active) {
    combos = combos.flatMap((combo) =>
      analyticsDimDefs[dim].values.map((value) => [...combo, value])
    );
  }
  return {
    capped: combos.length > 20,
    cols: [
      ...active.map((dim) => analyticsDimDefs[dim].label),
      "会话量",
      "解决率",
      "转人工率",
      "AI 成本"
    ],
    rows: combos.slice(0, 20).map((combo) => {
      const key = combo.join("|");
      const sessions = 40 + (hashNum(key) % 180);
      return {
        combo,
        cost: Math.round(sessions * 1.8) / 10,
        handoff: 6 + (hashNum(`${key}h`) % 20),
        resolved: 70 + (hashNum(`${key}r`) % 25),
        sessions
      };
    })
  };
}

function hashNum(value: string) {
  let hash = 0;
  for (const char of value) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash;
}

function statePanel(state: AnalyticsViewState) {
  return `<main class="uz-analytics-state" data-testid="m7-analytics-state-${state}"><div><h2>${state === "permission" ? "permission denied" : state}</h2><p>${esc(analyticsStateCopy(state))}</p></div></main>`;
}

function toast(message: string) {
  return message
    ? `<div aria-live="polite" class="uz-analytics-toast" data-testid="m7-analytics-toast" role="status">${esc(message)}</div>`
    : "";
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
