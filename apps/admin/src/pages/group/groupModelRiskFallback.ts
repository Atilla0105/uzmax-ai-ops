export type ModelRiskViewState =
  | "degraded"
  | "empty"
  | "error"
  | "loading"
  | "permission";
export type ModelTone = "danger" | "info" | "neutral" | "ok" | "warn" | "accent";

export const modelRuntimeLabels =
  "degraded|mock|read-only|not production cost metrics|no production model routing|local action only".split(
    "|"
  );

export const modelRiskMeta = {
  descriptor: "集团级 · mock/degraded · read-only",
  exportToast: "local-only mock export prepared; no production CSV export.",
  runtime: modelRuntimeLabels.join(" · "),
  source: "centralized-mock-degraded"
} as const;

export interface ModelKpi {
  delta: string;
  id: string;
  label: string;
  tone: ModelTone;
  value: string;
}

export const modelColumns = [
  "任务",
  "Primary",
  "Fallback",
  "成本/次",
  "延迟",
  "失败率",
  "最近评测"
] as const;

export interface ModelTask {
  cost: string;
  evalState: string;
  evalTone: ModelTone;
  failure: string;
  failureTone: ModelTone;
  fallback: string;
  id: string;
  latency: string;
  primary: string;
  task: string;
}

export interface TenantCostRow {
  id: "tenant-a" | "tenant-b" | "tenant-c" | "tenant-d";
  label: string;
  pct: string;
  tone: ModelTone;
  width: string;
}

export interface ModelRiskRow {
  action: string;
  code: string;
  id: string;
  scope: string;
  severity: string;
  tenant: string;
  text: string;
  time: string;
  tone: ModelTone;
}

export function readModelRiskViewState(): ModelRiskViewState {
  const state = new URLSearchParams(location.search).get("m7ModelState");
  return ["degraded", "empty", "error", "loading", "permission"].includes(state ?? "")
    ? (state as ModelRiskViewState)
    : "degraded";
}

export function modelStats(allProvidersResolved: boolean): ModelKpi[] {
  return [
    kpi("SYN-MODEL-KPI-cost", "集团总成本 / 今日", "mock ¥418", "+12% mock", "warn"),
    kpi("SYN-MODEL-KPI-base", "7 日均 / 日", "mock ¥372", "read-only", "neutral"),
    kpi("SYN-MODEL-KPI-latency", "平均延迟", "mock 498ms", "no runtime", "ok"),
    kpi("SYN-MODEL-KPI-failure", "整体失败率", "mock 0.9%", "+0.2% mock", "warn"),
    allProvidersResolved
      ? kpi("SYN-MODEL-KPI-down", "AllProvidersDown", "mock 0", "local resolved", "ok")
      : kpi("SYN-MODEL-KPI-down", "AllProvidersDown", "mock 1", "local only", "danger")
  ];
}

export const modelTasks: ModelTask[] = [
  task("intent", "意图识别", "SYN-MODEL-PRIMARY-A", "SYN-MODEL-FALLBACK-A", "0.004"),
  task("tutorial", "教程问答", "SYN-MODEL-PRIMARY-B", "SYN-MODEL-FALLBACK-B", "0.018"),
  task(
    "quote",
    "报价抽参",
    "SYN-MODEL-PRIMARY-C",
    "SYN-MODEL-FALLBACK-C",
    "0.021",
    "运行中",
    "info"
  ),
  task(
    "screenshot",
    "截图理解",
    "SYN-MODEL-PRIMARY-D",
    "SYN-MODEL-FALLBACK-D",
    "0.046",
    "阻断",
    "danger",
    "2.4%",
    "danger"
  ),
  task("translate", "多语翻译", "SYN-MODEL-PRIMARY-E", "SYN-MODEL-FALLBACK-E", "0.006"),
  task("redline", "红线检查", "SYN-MODEL-PRIMARY-F", "SYN-MODEL-FALLBACK-F", "0.001")
];

export const costByTenant: TenantCostRow[] = [
  {
    id: "tenant-a",
    label: "Mock 租户 A",
    pct: "mock ¥204 · 49%",
    tone: "warn",
    width: "49%"
  },
  {
    id: "tenant-b",
    label: "Mock 租户 B",
    pct: "mock ¥118 · 28%",
    tone: "accent",
    width: "28%"
  },
  {
    id: "tenant-c",
    label: "Mock 租户 C",
    pct: "mock ¥96 · 23%",
    tone: "info",
    width: "23%"
  },
  {
    id: "tenant-d",
    label: "Mock 租户 D",
    pct: "mock ¥0 · 0%",
    tone: "neutral",
    width: "2%"
  }
];

export const riskRows: ModelRiskRow[] = [
  risk(
    "all-providers-down",
    "熔断",
    "danger",
    "Mock 租户 D",
    "AllProvidersDown",
    "全局熔断"
  ),
  risk(
    "abnormal-cost",
    "异常成本",
    "warn",
    "Mock 租户 A",
    "mock cost spike; not production cost metrics",
    "预算"
  ),
  risk(
    "redline",
    "红线拦截",
    "danger",
    "Mock 租户 B",
    "mock redline pause; read-only risk queue",
    "用户级"
  ),
  risk(
    "false-positive",
    "误报",
    "info",
    "Mock 租户 C",
    "mock false-positive review; local action only",
    "复核"
  )
];

export function toneLabel(tone: ModelTone) {
  if (tone === "danger") return "danger";
  if (tone === "warn") return "warn";
  if (tone === "ok") return "ok";
  if (tone === "info") return "info";
  if (tone === "accent") return "accent";
  return "neutral";
}

function kpi(
  id: string,
  label: string,
  value: string,
  delta: string,
  tone: ModelTone
): ModelKpi {
  return { delta, id, label, tone, value };
}

function task(
  key: string,
  label: string,
  primary: string,
  fallback: string,
  unitCost: string,
  evalState = "通过",
  evalTone: ModelTone = "ok",
  failure = "0.3%",
  failureTone: ModelTone = "ok"
): ModelTask {
  return {
    cost: `mock ¥${unitCost}`,
    evalState: `mock ${evalState}`,
    evalTone,
    failure: `mock ${failure}`,
    failureTone,
    fallback,
    id: `SYN-MODEL-TASK-${key}`,
    latency: key === "screenshot" ? "mock 1.21s" : "mock 310ms",
    primary,
    task: label
  };
}

function risk(
  key: string,
  severity: string,
  tone: ModelTone,
  tenant: string,
  code: string,
  scope: string
): ModelRiskRow {
  return {
    action: key === "all-providers-down" ? "本地恢复" : "本地标记",
    code,
    id: `SYN-MODEL-RISK-${key}`,
    scope,
    severity,
    tenant,
    text: `${code} · degraded mock/read-only risk item; no production model routing.`,
    time: "mock now",
    tone
  };
}

export const modelRiskStyles = `.uz-model-page{display:flex;height:100%;min-height:0;flex-direction:column;overflow:hidden;background:var(--paper);color:var(--ink-900);font-family:var(--font-body)}.uz-model-page *{box-sizing:border-box}.uz-model-head{display:flex;flex:none;align-items:center;gap:12px;flex-wrap:wrap;border-bottom:1px solid var(--ink-150);background:var(--card);padding:14px 24px}.uz-model-title{margin:0;font:800 16px/1.35 var(--font-display)}.uz-model-desc,.uz-model-muted{color:var(--ink-500);font-size:12px}.uz-model-action,.uz-model-risk-action,.uz-model-row-button{border:1px solid var(--ink-150);border-radius:7px;background:var(--card);color:var(--ink-700);cursor:pointer;font:800 12px/1 var(--font-body);padding:7px 11px}.uz-model-action{display:inline-flex;align-items:center;gap:6px;margin-left:auto}.uz-model-action:hover,.uz-model-action:focus-visible,.uz-model-row-button:hover,.uz-model-row-button:focus-visible,.uz-model-risk-action:hover,.uz-model-risk-action:focus-visible{outline:0;box-shadow:var(--shadow-focus)}.uz-model-note,.uz-model-toast{display:flex;align-items:center;gap:8px;border-bottom:1px solid var(--ink-150);background:var(--card);padding:10px 24px;color:var(--ink-700);font-size:12px}.uz-model-note strong,.uz-model-badge{border-radius:5px;padding:2px 8px;font-weight:800}.uz-model-note strong,.uz-model-badge--warn{background:var(--state-warn-bg);color:var(--state-warn)}.uz-model-toast{border-bottom-color:var(--state-ok-border);background:var(--state-ok-bg);color:var(--state-ok);font-weight:800}.uz-model-scroll{flex:1;min-height:0;overflow:auto;padding:16px 24px 24px}.uz-model-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:14px}.uz-model-kpi,.uz-model-panel{border:1px solid var(--ink-150);border-radius:10px;background:var(--card)}.uz-model-kpi{display:grid;gap:6px;padding:14px}.uz-model-kpi span:first-child{color:var(--ink-500);font-size:11px}.uz-model-kpi strong{font:800 22px/1 var(--font-data)}.uz-model-kpi small,.uz-model-panel-sub{color:var(--ink-500);font-size:11px}.uz-model-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(320px,.78fr);gap:14px;align-items:start}.uz-model-panel{overflow:hidden}.uz-model-panel-head{display:flex;align-items:center;gap:8px;border-bottom:1px solid var(--ink-075);padding:13px 16px}.uz-model-panel-head h3{margin:0;font:800 13px/1.3 var(--font-body)}.uz-model-table-wrap{overflow:auto}.uz-model-table{width:100%;min-width:760px;border-collapse:collapse;font-size:13px}.uz-model-table th{border-bottom:1px solid var(--ink-150);background:var(--paper);color:var(--ink-500);font:800 11px/1.2 var(--font-body);padding:10px 14px;text-align:left;white-space:nowrap}.uz-model-table td{border-bottom:1px solid var(--ink-075);padding:11px 14px;white-space:nowrap}.uz-model-table tr.is-switched{background:var(--state-ai-bg)}.uz-model-row-button{padding:4px 8px}.uz-model-mono{font-family:var(--font-data)}.uz-model-split{display:grid;grid-template-columns:minmax(0,1fr);gap:14px}.uz-model-cost-list,.uz-model-risk-list{display:grid;gap:10px;padding:14px 16px}.uz-model-cost-row{display:grid;gap:5px;border:0;border-radius:7px;background:transparent;color:var(--ink-700);cursor:pointer;padding:6px;text-align:left}.uz-model-cost-row:hover,.uz-model-cost-row:focus-visible{outline:0;background:var(--paper)}.uz-model-cost-meta{display:flex;justify-content:space-between;gap:10px;font-size:12px}.uz-model-bar{height:7px;overflow:hidden;border-radius:999px;background:var(--ink-075)}.uz-model-bar span{display:block;height:100%;border-radius:999px}.uz-model-risk{display:flex;gap:10px;border-bottom:1px solid var(--ink-075);padding:0 0 10px}.uz-model-risk-body{min-width:0;flex:1}.uz-model-risk-body p{margin:0;color:var(--ink-900);font-size:12px;line-height:1.5}.uz-model-risk-body small{display:block;margin-top:4px;color:var(--ink-500);font-family:var(--font-data);font-size:11px}.uz-model-risk-action{align-self:flex-start;white-space:nowrap}.uz-model-empty-risk{padding:14px 16px;color:var(--ink-500);font-size:12px}.uz-model-state{display:grid;flex:1;min-height:260px;place-items:center;padding:24px;text-align:center}.uz-model-state div{max-width:580px;border:1px solid var(--ink-150);border-radius:8px;background:var(--card);padding:20px}.uz-model-state h2{margin:0 0 8px;font-size:16px}.uz-model-state p{margin:0;color:var(--ink-700);font-size:13px;line-height:1.55}.uz-model-badge--danger,.uz-model-tone--danger{background:var(--state-human-bg);color:var(--state-human)}.uz-model-badge--ok,.uz-model-tone--ok{background:var(--state-ok-bg);color:var(--state-ok)}.uz-model-badge--info,.uz-model-tone--info{background:var(--state-ai-bg);color:var(--state-ai)}.uz-model-badge--accent,.uz-model-tone--accent{background:var(--accent-data-bg);color:var(--accent-data)}.uz-model-badge--neutral,.uz-model-tone--neutral{background:var(--ink-075);color:var(--ink-700)}.uz-model-fill--danger{background:var(--state-human)}.uz-model-fill--warn{background:var(--state-warn)}.uz-model-fill--info{background:var(--state-ai)}.uz-model-fill--accent{background:var(--accent-data)}.uz-model-fill--neutral{background:var(--ink-300)}@media(max-width:980px){.uz-model-grid{grid-template-columns:1fr}.uz-model-head,.uz-model-note,.uz-model-toast,.uz-model-scroll{padding-left:12px;padding-right:12px}.uz-model-action{margin-left:0}.uz-model-table{min-width:0}.uz-model-table thead{display:none}.uz-model-table tbody,.uz-model-table tr,.uz-model-table td{display:block}.uz-model-table tr{border-bottom:1px solid var(--ink-150);padding:10px}.uz-model-table td{border:0;padding:4px 0;white-space:normal}.uz-model-table td::before{display:inline-block;width:82px;color:var(--ink-500);font:800 11px/1.2 var(--font-body)}.uz-model-table td:nth-child(1)::before{content:"任务"}.uz-model-table td:nth-child(2)::before{content:"Primary"}.uz-model-table td:nth-child(3)::before{content:"Fallback"}.uz-model-table td:nth-child(4)::before{content:"成本/次"}.uz-model-table td:nth-child(5)::before{content:"延迟"}.uz-model-table td:nth-child(6)::before{content:"失败率"}.uz-model-table td:nth-child(7)::before{content:"最近评测"}}@media(max-width:360px){.uz-model-head{align-items:flex-start;flex-direction:column}.uz-model-action{width:100%;justify-content:center}.uz-model-kpis{grid-template-columns:1fr}.uz-model-risk{display:grid}.uz-model-risk-action{width:100%}}`;
