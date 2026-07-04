type OrderStateKey = "done" | "paid" | "refund" | "ship";
type OrderViewState = "degraded" | "empty" | "error" | "loading" | "permission";
export type ImportStep = "progress" | "result" | "upload";

interface OrderTimelineStep {
  done: boolean;
  label: string;
  time: string;
}

export interface OrderRecord {
  amount: string;
  batch: string;
  conversationId: string;
  customer: string;
  customerId: string;
  id: string;
  logistics: string;
  source: string;
  stale: boolean;
  status: string;
  statusKey: OrderStateKey;
  ticketId: string;
  timeline: OrderTimelineStep[];
  updated: string;
}

export interface ImportTask {
  batch: string;
  fail: number;
  id: string;
  rolledBack: boolean;
  success: number;
  time: string;
  total: number;
}

export const orderFallbackMeta = {
  label: "degraded · mock · read-only",
  reason:
    "order runtime unavailable: centralized synthetic degraded rows only, no DB/API/import runtime and not production order data.",
  source: "centralized-synthetic-order-mock"
} as const;

const orderColumns = [
  "订单号",
  "客户",
  "金额",
  "状态",
  "批次",
  "物流节点",
  "来源",
  "更新时间"
] as const;

const orderStatusTone: Record<OrderStateKey, "danger" | "info" | "ok" | "warn"> = {
  done: "ok",
  paid: "info",
  refund: "danger",
  ship: "warn"
};

export const orderRecords: OrderRecord[] = [
  {
    amount: "mock 268.00",
    batch: "SYN-BATCH-07",
    conversationId: "SYN-CONV-A",
    customer: "Mock 客户 A",
    customerId: "SYN-CUST-A",
    id: "SYN-ORD-001",
    logistics: "mock 分拣中心",
    source: "导入快照 mock",
    stale: false,
    status: "运输中",
    statusKey: "ship",
    ticketId: "SYN-TICKET-1042",
    timeline: [
      { done: true, label: "订单创建", time: "mock 07-01 09:02" },
      { done: true, label: "已发货", time: "mock 07-01 14:30" },
      { done: true, label: "mock 分拣中心", time: "mock 今天 09:40" },
      { done: false, label: "派送中（预计 mock 1-2 天）", time: "—" },
      { done: false, label: "已签收", time: "—" }
    ],
    updated: "mock 11:20"
  },
  {
    amount: "mock 320.00",
    batch: "SYN-BATCH-06",
    conversationId: "SYN-CONV-B",
    customer: "Mock 客户 B",
    customerId: "SYN-CUST-B",
    id: "SYN-ORD-002",
    logistics: "已签收 · 申请退货 mock",
    source: "导入快照 mock",
    stale: false,
    status: "退款中",
    statusKey: "refund",
    ticketId: "SYN-TICKET-1039",
    timeline: [
      { done: true, label: "订单创建", time: "mock 07-01 10:15" },
      { done: true, label: "已发货", time: "mock 07-01 16:00" },
      { done: true, label: "已签收", time: "mock 07-03 11:20" },
      { done: true, label: "申请退货退款", time: "mock 07-04 09:00" },
      { done: false, label: "退款处理中", time: "mock today" }
    ],
    updated: "mock 11:20"
  },
  {
    amount: "mock 198.00",
    batch: "SYN-BATCH-08",
    conversationId: "SYN-CONV-C",
    customer: "Mock 客户 C",
    customerId: "SYN-CUST-C",
    id: "SYN-ORD-003",
    logistics: "等待支付 mock",
    source: "导入快照 mock",
    stale: false,
    status: "待支付",
    statusKey: "paid",
    ticketId: "—",
    timeline: [
      { done: true, label: "订单创建", time: "mock 07-02 15:44" },
      { done: false, label: "等待支付", time: "—" }
    ],
    updated: "mock 10:10"
  },
  {
    amount: "mock 396.00",
    batch: "SYN-BATCH-05",
    conversationId: "SYN-CONV-D",
    customer: "Mock 客户 D",
    customerId: "SYN-CUST-D",
    id: "SYN-ORD-004",
    logistics: "已签收 mock",
    source: "导入快照 mock",
    stale: true,
    status: "已完成",
    statusKey: "done",
    ticketId: "SYN-TICKET-1019",
    timeline: [
      { done: true, label: "订单创建", time: "mock 06-28 08:20" },
      { done: true, label: "已发货", time: "mock 06-28 15:00" },
      { done: true, label: "已签收", time: "mock 06-30 11:30" }
    ],
    updated: "mock 3天前"
  }
];

export const initialImportHistory: ImportTask[] = [
  {
    batch: "SYN-BATCH-08",
    fail: 0,
    id: "SYN-IMP-001",
    rolledBack: false,
    success: 84,
    time: "mock 今天 11:20",
    total: 84
  }
];

export function filterOrders(rows: OrderRecord[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return rows;
  return rows.filter((row) =>
    [row.id, row.customer, row.batch, row.logistics, row.status].some((value) =>
      value.toLowerCase().includes(q)
    )
  );
}

export function readOrderViewState() {
  const value = new URLSearchParams(location.search).get("m7OrderState");
  if (
    value === "empty" ||
    value === "error" ||
    value === "loading" ||
    value === "permission"
  )
    return value;
  return "degraded";
}

interface RenderState {
  active: OrderRecord | null;
  fileName: string;
  history: ImportTask[];
  importOpen: boolean;
  importStep: ImportStep;
  query: string;
  rows: OrderRecord[];
  task: ImportTask | null;
  viewState: OrderViewState;
}

export function renderOrdersPage(state: RenderState) {
  return `<style>${orderPageStyles}</style>${header(state)}${runtimeBar()}${body(state)}${state.importOpen ? modal(state) : ""}`;
}

function header(state: RenderState) {
  const active = state.active;
  const search = active
    ? ""
    : `<input aria-label="搜索订单" class="uz-orders-search" data-order-input="search" data-testid="m7-orders-search" placeholder="客户 / 批次 / 订单号 / 物流节点" value="${esc(state.query)}">`;
  return `<header class="uz-orders-head"><div class="uz-orders-title">${active ? `<button class="uz-orders-back" data-order-command="back" data-testid="m7-orders-back" type="button">返回</button>` : ""}<h2>订单</h2>${active ? `<span class="uz-orders-crumb">/</span><span class="uz-orders-crumb">${esc(active.id)}</span>` : ""}</div><div class="uz-orders-tools">${search}<button class="uz-orders-action" data-order-command="open-import" data-testid="m7-orders-import" type="button">导入快照</button></div></header>`;
}

function runtimeBar() {
  return `<div class="uz-orders-runtime" data-testid="m7-orders-runtime-note">${badge("warn", orderFallbackMeta.label)}<span>${esc(orderFallbackMeta.reason)} No real CSV/XLSX, order API or DB.</span><button class="uz-orders-link" data-order-command="open-import" type="button">查看导入任务</button></div>`;
}

function body(state: RenderState) {
  if (state.viewState === "loading") return statePanel("loading");
  if (state.viewState === "error") return statePanel("error");
  if (state.viewState === "permission") return statePanel("permission");
  return state.active ? detail(state.active) : list(state.rows, state.viewState);
}

function list(rows: OrderRecord[], viewState: OrderViewState) {
  return `<main class="uz-orders-list"><div class="uz-orders-count" data-testid="m7-orders-list-count">${rows.length} 个 synthetic mock 订单</div><div class="uz-orders-table" data-testid="m7-orders-table"><table><thead><tr>${orderColumns.map((col) => `<th>${esc(col)}</th>`).join("")}</tr></thead><tbody>${rows.map(rowHtml).join("")}</tbody></table>${rows.length === 0 ? `<div class="uz-orders-state" data-testid="m7-orders-empty"><span>${viewState === "empty" ? "empty state: 当前没有 synthetic mock 订单。" : "当前搜索没有匹配订单。"}</span></div>` : ""}</div></main>`;
}

function rowHtml(row: OrderRecord) {
  return `<tr aria-label="打开订单 ${esc(row.id)}" class="uz-orders-row" data-order-command="open" data-order-id="${esc(row.id)}" data-testid="m7-order-row-${esc(row.id)}" role="button" tabindex="0"><td class="uz-orders-mono">${esc(row.id)}</td><td>${esc(row.customer)}</td><td class="uz-orders-mono">${esc(row.amount)}</td><td>${badge(orderStatusTone[row.statusKey], row.status)}</td><td class="uz-orders-mono">${esc(row.batch)}</td><td>${esc(row.logistics)}</td><td><span class="uz-orders-muted">${esc(row.source)}</span></td><td class="uz-orders-mono uz-orders-muted">${esc(row.updated)}</td></tr>`;
}

function detail(active: OrderRecord) {
  return `<main class="uz-orders-detail" data-testid="m7-orders-detail">${active.stale ? staleWarning() : ""}<section class="uz-orders-hero" data-testid="m7-orders-detail-card"><span class="uz-orders-icon" aria-hidden="true">□</span><div class="uz-orders-hero-main"><div class="uz-orders-hero-top"><strong>${esc(active.id)}</strong>${badge(orderStatusTone[active.statusKey], active.status)}<span class="uz-orders-mono">${esc(active.amount)}</span></div><div class="uz-orders-hero-meta"><span>批次 ${esc(active.batch)}</span><span>来源 ${esc(active.source)}</span><span>更新 ${esc(active.updated)}</span></div></div></section><div class="uz-orders-detail-grid"><section class="uz-orders-card" data-testid="m7-orders-timeline"><h3>物流节点</h3>${active.timeline.map(timelineStep).join("")}</section><aside class="uz-orders-side" data-testid="m7-orders-linked-affordances">${linkedCard("关联客户", active.customer, active.customerId)}${linkedCard("关联客户与会话", "最近相关会话", active.conversationId)}${linkedCard("关联工单", "工单线索", active.ticketId)}</aside></div></main>`;
}

function staleWarning() {
  return `<div class="uz-orders-stale" data-testid="m7-orders-stale-warning">${badge("danger", "stale snapshot")}<span>过期提示：该 synthetic 订单来自本地导入快照，已超过 mock 24 小时未更新，不能作为生产订单状态。</span></div>`;
}

function timelineStep(
  step: OrderTimelineStep,
  index: number,
  steps: OrderTimelineStep[]
) {
  return `<div class="uz-orders-timeline"><span class="uz-orders-line"><span class="uz-orders-dot ${step.done ? "is-done" : ""}"></span>${index < steps.length - 1 ? `<span class="uz-orders-rail"></span>` : ""}</span><span class="uz-orders-step"><strong>${esc(step.label)}</strong><span class="uz-orders-muted uz-orders-mono">${esc(step.time)}</span></span></div>`;
}

function linkedCard(title: string, primary: string, refId: string) {
  return `<section class="uz-orders-card"><h3>${esc(title)}</h3><div class="uz-orders-affordance"><span><strong>${esc(primary)}</strong><div class="uz-orders-muted uz-orders-mono">${esc(refId)}</div></span><button class="uz-orders-link" disabled type="button">local-only</button></div></section>`;
}

function modal(state: RenderState) {
  return `<div class="uz-orders-modal" data-testid="m7-orders-import-modal"><section aria-modal="true" class="uz-orders-dialog" role="dialog"><div class="uz-orders-dialog-head"><strong>导入订单快照</strong><button aria-label="关闭导入快照" class="uz-orders-close" data-order-command="close-import" type="button">×</button></div><div class="uz-orders-runtime">${badge("warn", "local mock only")}<span>不读取真实文件，不解析 CSV/XLSX，不写入后端。</span></div>${state.importStep === "upload" ? uploadStep(state) : ""}${state.importStep === "progress" ? progressStep() : ""}${state.importStep === "result" && state.task ? resultStep(state.task) : ""}</section></div>`;
}

function uploadStep(state: RenderState) {
  return `<button class="uz-orders-drop" data-order-command="file" data-testid="m7-orders-file-drop" type="button"><strong>${esc(state.fileName || "选择 synthetic mock 快照")}</strong><span class="uz-orders-muted">CSV / Excel shape only · no real read</span></button><button class="uz-orders-action" data-order-command="start-import" data-testid="m7-orders-start-import" ${state.fileName ? "" : "disabled"} type="button">开始导入</button><div class="uz-orders-history" data-testid="m7-orders-import-history"><strong>导入历史</strong>${state.history.map(historyItem).join("")}</div>`;
}

function historyItem(item: ImportTask) {
  return `<button data-order-command="open-task" data-task-id="${esc(item.id)}" type="button"><span>${esc(item.id)} · ${esc(item.time)} · 成功 ${item.success} / 失败 ${item.fail}</span>${badge(item.rolledBack ? "neutral" : item.fail ? "warn" : "ok", item.rolledBack ? "已回滚" : item.fail ? "部分失败" : "成功")}</button>`;
}

function progressStep() {
  return `<div data-testid="m7-orders-import-progress"><p>正在导入 synthetic mock 快照… 100%</p><div class="uz-orders-progress"><span class="is-complete"></span></div><button class="uz-orders-action" data-order-command="show-result" data-testid="m7-orders-show-result" type="button">查看结果</button></div>`;
}

function resultStep(task: ImportTask) {
  return `<div data-testid="m7-orders-import-result"><h3>${task.rolledBack ? "本次导入已回滚" : "导入完成，部分行失败"}</h3><div class="uz-orders-stats">${stat("总行数", task.total)}${stat("成功", task.success)}${stat("失败", task.fail)}${stat("批次", task.batch)}</div>${task.rolledBack ? "" : `<button class="uz-orders-action" data-order-command="rollback" data-task-id="${esc(task.id)}" data-testid="m7-orders-rollback-import" type="button">回滚本次导入</button>`}<button class="uz-orders-link" data-order-command="close-import" type="button">关闭</button></div>`;
}

function stat(label: string, value: number | string) {
  return `<span class="uz-orders-stat"><span>${esc(label)}</span><strong>${esc(String(value))}</strong></span>`;
}

function statePanel(state: "error" | "loading" | "permission") {
  const copy =
    state === "error"
      ? ["error state", "订单 mock 页面加载失败；未连接后端。"]
      : state === "loading"
        ? ["loading state", "正在加载 synthetic mock 订单页面。"]
        : ["permission denied", "当前身份无权查看订单 mock 页面。"];
  return `<main class="uz-orders-state" data-testid="m7-orders-state-${state}"><span><strong>${copy[0]}</strong>${copy[1]}</span></main>`;
}

function badge(tone: "danger" | "info" | "neutral" | "ok" | "warn", text: string) {
  return `<span class="uz-orders-badge uz-orders-badge--${tone}">${esc(text)}</span>`;
}

function esc(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const orderPageStyles = `
.uz-orders-page{display:flex;flex:1;min-height:0;flex-direction:column;background:var(--paper);color:var(--ink-900);font:var(--text-base)/1.45 var(--font-body)}
.uz-orders-head{flex:none;display:flex;align-items:center;gap:12px;border-bottom:1px solid var(--ink-150);padding:14px 24px;background:var(--card)}
.uz-orders-title{display:flex;align-items:center;gap:10px;min-width:0}.uz-orders-title h2{margin:0;font:700 var(--text-title)/1.2 var(--font-display)}.uz-orders-crumb{color:var(--ink-500);font:var(--text-sm)/1.2 var(--font-data)}
.uz-orders-tools{display:flex;align-items:center;gap:8px;margin-left:auto}.uz-orders-search{box-sizing:border-box;width:320px;height:32px;border:1px solid var(--ink-150);border-radius:7px;padding:0 11px;color:var(--ink-900);background:var(--paper);font:var(--text-sm)/1.4 var(--font-body)}
.uz-orders-back,.uz-orders-action,.uz-orders-link,.uz-orders-row,.uz-orders-drop,.uz-orders-close{cursor:pointer}.uz-orders-back,.uz-orders-action,.uz-orders-link{border:1px solid var(--ink-150);border-radius:7px;background:var(--card);color:var(--ink-700);font:700 var(--text-sm)/1 var(--font-body)}.uz-orders-back{padding:5px 9px}.uz-orders-action{padding:8px 12px}.uz-orders-link{padding:6px 10px}.uz-orders-link[disabled],.uz-orders-action[disabled]{cursor:not-allowed;opacity:.55}
.uz-orders-runtime{display:flex;align-items:center;gap:10px;margin:14px 24px 0;border:1px solid var(--state-warn-border);border-radius:8px;padding:9px 13px;background:var(--state-warn-bg);color:var(--ink-700);font-size:var(--text-sm)}.uz-orders-runtime span:last-child{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.uz-orders-list,.uz-orders-detail{flex:1;min-height:0;overflow:auto;padding:14px 24px 24px}.uz-orders-count{margin-bottom:10px;color:var(--ink-500);font-size:var(--text-sm)}.uz-orders-table{overflow:auto;border:1px solid var(--ink-150);border-radius:10px;background:var(--card)}.uz-orders-table table{width:100%;min-width:980px;border-collapse:collapse}.uz-orders-table th{border-bottom:1px solid var(--ink-150);padding:10px 14px;background:var(--paper);color:var(--ink-500);font:700 11px/1.2 var(--font-body);text-align:left;white-space:nowrap}.uz-orders-table td{border-bottom:1px solid var(--ink-075);padding:11px 14px;font-size:13px;vertical-align:middle;white-space:nowrap}.uz-orders-row:hover,.uz-orders-row:focus-visible{outline:0;background:var(--paper)}.uz-orders-mono{font-family:var(--font-data)}.uz-orders-muted{color:var(--ink-500);font-size:var(--text-xs)}
.uz-orders-badge{border-radius:6px;padding:2px 8px;font:700 11px/1.2 var(--font-body)}.uz-orders-badge--warn{color:var(--state-warn);background:var(--state-warn-bg)}.uz-orders-badge--danger{color:var(--state-human);background:var(--state-human-bg)}.uz-orders-badge--ok{color:var(--state-ok);background:var(--state-ok-bg)}.uz-orders-badge--info{color:var(--state-ai);background:var(--state-ai-bg)}.uz-orders-badge--neutral{color:var(--ink-700);background:var(--ink-075)}
.uz-orders-state{display:grid;place-items:center;min-height:220px;border:1px solid var(--ink-150);border-radius:10px;margin:14px 24px 24px;background:var(--card);color:var(--ink-700);text-align:center}.uz-orders-state strong{display:block;margin-bottom:6px;color:var(--ink-900)}
.uz-orders-stale{display:flex;align-items:center;gap:10px;margin-bottom:14px;border:1px solid var(--state-human-border);border-radius:8px;padding:10px 14px;background:var(--state-human-bg);color:var(--ink-700);font-size:var(--text-sm)}.uz-orders-hero{display:flex;gap:16px;margin-bottom:16px;border:1px solid var(--ink-150);border-radius:12px;padding:18px 20px;background:var(--card)}.uz-orders-icon{display:grid;place-items:center;flex:none;width:44px;height:44px;border-radius:10px;background:var(--ink-075);font-size:22px}.uz-orders-hero-main{flex:1;min-width:0}.uz-orders-hero-top,.uz-orders-hero-meta{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.uz-orders-hero-top strong{font:800 19px/1.2 var(--font-data)}.uz-orders-hero-meta{margin-top:6px;color:var(--ink-500);font:var(--text-sm)/1.4 var(--font-data)}
.uz-orders-detail-grid{display:grid;grid-template-columns:1.1fr 1fr;gap:16px}.uz-orders-card{border:1px solid var(--ink-150);border-radius:12px;padding:16px 18px;background:var(--card)}.uz-orders-card h3{margin:0 0 12px;font:800 var(--text-sm)/1.2 var(--font-body)}.uz-orders-side{display:grid;gap:16px;align-content:start}.uz-orders-timeline{display:flex;gap:10px}.uz-orders-line{display:flex;align-items:center;flex-direction:column;flex:none}.uz-orders-dot{width:9px;height:9px;border-radius:50%;margin-top:4px;background:var(--ink-300)}.uz-orders-dot.is-done{background:var(--state-ok)}.uz-orders-rail{width:1px;min-height:24px;flex:1;background:var(--ink-150)}.uz-orders-step{padding-bottom:16px}.uz-orders-step strong{display:block;font-size:13px}.uz-orders-affordance{display:flex;align-items:center;gap:10px;border-top:1px solid var(--ink-075);padding:10px 0}.uz-orders-affordance:first-child{border-top:0;padding-top:0}.uz-orders-affordance span:first-child{flex:1;min-width:0}
.uz-orders-modal{position:fixed;inset:0;z-index:var(--z-modal);display:grid;place-items:center;background:rgb(26 29 33 / 36%)}.uz-orders-dialog{box-sizing:border-box;width:480px;max-width:calc(100vw - 32px);border-radius:12px;padding:20px 22px;background:var(--card);box-shadow:var(--shadow-overlay)}.uz-orders-dialog-head{display:flex;align-items:center;margin-bottom:14px}.uz-orders-dialog-head strong{font:800 var(--text-title)/1.2 var(--font-display)}.uz-orders-close{margin-left:auto;border:0;background:transparent;color:var(--ink-500);font-size:18px}.uz-orders-drop{display:grid;place-items:center;min-height:126px;border:1.5px dashed var(--ink-300);border-radius:10px;margin-bottom:14px;padding:18px;background:var(--paper);text-align:center}.uz-orders-progress{height:8px;border-radius:999px;background:var(--ink-075);overflow:hidden}.uz-orders-progress span{display:block;height:100%;background:var(--ink-900)}.uz-orders-progress .is-complete{width:100%}.uz-orders-stats{display:flex;gap:20px;margin:14px 0}.uz-orders-stat span{display:block;color:var(--ink-500);font-size:10px}.uz-orders-stat strong{font:800 18px/1.2 var(--font-data)}.uz-orders-history{margin-top:16px;border-top:1px solid var(--ink-075);padding-top:12px}.uz-orders-history button{display:flex;align-items:center;gap:8px;width:100%;border:1px solid var(--ink-150);border-radius:8px;margin-top:6px;padding:8px 10px;background:var(--card);color:var(--ink-700);font:var(--text-sm)/1.3 var(--font-body);text-align:left}
.uz-orders-page button:focus-visible,.uz-orders-page input:focus-visible,.uz-orders-row:focus-visible{outline:0;box-shadow:var(--shadow-focus)}
@media(max-width:900px){.uz-orders-head{align-items:stretch;flex-direction:column;padding:12px}.uz-orders-tools{width:100%;margin-left:0;flex-wrap:wrap}.uz-orders-search{width:100%}.uz-orders-runtime{align-items:flex-start;margin:10px 12px 0}.uz-orders-runtime span:last-child{white-space:normal}.uz-orders-list,.uz-orders-detail{padding:12px}.uz-orders-detail-grid{grid-template-columns:1fr}.uz-orders-table table{min-width:860px}}
@media(max-width:360px){.uz-orders-page{min-width:0}.uz-orders-tools .uz-orders-action,.uz-orders-link{width:100%}.uz-orders-list,.uz-orders-detail{overflow-x:hidden}.uz-orders-hero{flex-direction:column;padding:14px}.uz-orders-card{padding:14px}.uz-orders-stats{flex-wrap:wrap}.uz-orders-table{overflow-x:auto}}
`;
