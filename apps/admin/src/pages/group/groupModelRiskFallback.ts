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
  descriptor: "集团级 · 实时",
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
  legacyFallback: string;
  legacyPrimary: string;
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
  scope: string | null;
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
    kpi("SYN-MODEL-KPI-latency", "平均延迟", "mock 498ms", "-30ms mock", "ok"),
    kpi("SYN-MODEL-KPI-failure", "整体失败率", "mock 0.9%", "+0.2% mock", "warn"),
    allProvidersResolved
      ? kpi("SYN-MODEL-KPI-down", "AllProvidersDown", "mock 0", "已恢复 local", "ok")
      : kpi(
          "SYN-MODEL-KPI-down",
          "AllProvidersDown",
          "mock 1",
          "白桦母婴 local",
          "danger"
        )
  ];
}

export const modelTasks: ModelTask[] = [
  task(
    "intent",
    "意图识别",
    "gpt-4o-mini",
    "qwen2.5-7b",
    "0.004",
    "A",
    "通过",
    "ok",
    "0.3%",
    "ok",
    "218ms"
  ),
  task(
    "tutorial",
    "教程问答",
    "gpt-4o",
    "gpt-4o-mini",
    "0.018",
    "B",
    "通过",
    "ok",
    "1.1%",
    "warn",
    "612ms"
  ),
  task(
    "quote",
    "报价计算",
    "gpt-4o",
    "—",
    "0.021",
    "C",
    "运行中",
    "info",
    "0.6%",
    "ok",
    "540ms"
  ),
  task(
    "screenshot",
    "截图理解",
    "gpt-4o-vision",
    "qwen-vl",
    "0.046",
    "D",
    "阻断",
    "danger",
    "2.4%",
    "danger",
    "1.21s"
  ),
  task(
    "translate",
    "乌语翻译",
    "gpt-4o-mini",
    "nllb-200",
    "0.006",
    "E",
    "通过",
    "ok",
    "0.4%",
    "ok",
    "310ms"
  ),
  task(
    "redline",
    "红线检查",
    "guard-cls-v3",
    "规则引擎",
    "0.001",
    "F",
    "通过",
    "ok",
    "0.1%",
    "ok",
    "88ms"
  )
];

export const costByTenant: TenantCostRow[] = [
  {
    id: "tenant-a",
    label: "丝路数码",
    pct: "¥204 · 49%",
    tone: "warn",
    width: "49%"
  },
  {
    id: "tenant-b",
    label: "玉珠跨境美妆",
    pct: "¥118 · 28%",
    tone: "accent",
    width: "28%"
  },
  {
    id: "tenant-c",
    label: "天净家居",
    pct: "¥96 · 23%",
    tone: "info",
    width: "23%"
  },
  {
    id: "tenant-d",
    label: "白桦母婴",
    pct: "¥0 · 0%",
    tone: "neutral",
    width: "2%"
  }
];

export const riskRows: ModelRiskRow[] = [
  risk(
    "all-providers-down",
    "熔断",
    "danger",
    "白桦母婴",
    "AllProvidersDown",
    "全局熔断",
    "primary 与 fallback 同时不可用，AI 已熔断离线",
    "3小时前",
    "恢复确认"
  ),
  risk(
    "abnormal-cost",
    "异常成本",
    "warn",
    "丝路数码",
    "今日成本 ¥204",
    null,
    "超预算 +63%，截图任务占 71%",
    "1小时前",
    "查看明细"
  ),
  risk(
    "redline",
    "红线拦截",
    "danger",
    "玉珠跨境美妆",
    "退款诉求触发红线",
    "用户级",
    "AI 暂停自动回复，已转人工",
    "9分钟前",
    "查看会话"
  ),
  risk(
    "false-positive",
    "误报",
    "info",
    "天净家居",
    "红线误报复核",
    null,
    "guard-cls-v3 置信 0.51，疑似拦截正常对话",
    "25分钟前",
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
  legacyKey: string,
  evalState = "通过",
  evalTone: ModelTone = "ok",
  failure = "0.3%",
  failureTone: ModelTone = "ok",
  latency = "310ms"
): ModelTask {
  return {
    cost: `¥${unitCost}`,
    evalState,
    evalTone,
    failure,
    failureTone,
    fallback,
    id: `SYN-MODEL-TASK-${key}`,
    latency,
    legacyFallback: `SYN-MODEL-FALLBACK-${legacyKey}`,
    legacyPrimary: `SYN-MODEL-PRIMARY-${legacyKey}`,
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
  scope: string | null,
  detail: string,
  time: string,
  action: string
): ModelRiskRow {
  return {
    action,
    code,
    id: `SYN-MODEL-RISK-${key}`,
    scope,
    severity,
    tenant,
    text: `${code} · ${detail}`,
    time,
    tone
  };
}

export const modelRiskStyles = `.uz-model-page{display:flex;height:100%;min-height:0;flex-direction:column;overflow:hidden;background:var(--paper);color:var(--ink-900);font-family:var(--font-body)}.uz-model-page *{box-sizing:border-box}.uz-model-head{display:flex;flex:none;align-items:center;gap:12px;flex-wrap:wrap;border-bottom:1px solid var(--ink-150);background:var(--card);padding:14px 24px}.uz-model-title{margin:0;font:800 16px/1.35 var(--font-display)}.uz-model-desc,.uz-model-muted{color:var(--ink-500);font-size:12px}.uz-model-action,.uz-model-risk-action,.uz-model-row-button{border:1px solid var(--ink-150);border-radius:7px;background:var(--card);color:var(--ink-700);cursor:pointer;font:800 12px/1 var(--font-body);padding:7px 11px}.uz-model-action{display:inline-flex;align-items:center;gap:6px;margin-left:auto}.uz-model-action:hover,.uz-model-action:focus-visible,.uz-model-row-button:hover,.uz-model-row-button:focus-visible,.uz-model-risk-action:hover,.uz-model-risk-action:focus-visible{outline:0;box-shadow:var(--shadow-focus)}.uz-model-note,.uz-model-toast{display:flex;align-items:center;gap:8px;border-bottom:1px solid var(--ink-150);background:var(--card);padding:10px 24px;color:var(--ink-700);font-size:12px}.uz-model-note strong,.uz-model-badge{border-radius:5px;padding:2px 8px;font-weight:800}.uz-model-note strong,.uz-model-badge--warn{background:var(--state-warn-bg);color:var(--state-warn)}.uz-model-toast{border-bottom-color:var(--state-ok-border);background:var(--state-ok-bg);color:var(--state-ok);font-weight:800}.uz-model-scroll{flex:1;min-height:0;overflow:auto;padding:16px 24px 24px}.uz-model-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:14px}.uz-model-kpi,.uz-model-panel{border:1px solid var(--ink-150);border-radius:10px;background:var(--card)}.uz-model-kpi{display:grid;gap:6px;padding:14px}.uz-model-kpi span:first-child{color:var(--ink-500);font-size:11px}.uz-model-kpi strong{font:800 22px/1 var(--font-data)}.uz-model-kpi small,.uz-model-panel-sub{color:var(--ink-500);font-size:11px}.uz-model-panel{overflow:hidden}.uz-model-matrix{margin-bottom:14px}.uz-model-panel-head{display:flex;align-items:center;gap:8px;border-bottom:1px solid var(--ink-075);padding:13px 16px}.uz-model-panel-head h3{margin:0;font:800 13px/1.3 var(--font-body)}.uz-model-table-wrap{overflow:auto}.uz-model-table{width:100%;min-width:760px;border-collapse:collapse;font-size:13px}.uz-model-table th{border-bottom:1px solid var(--ink-150);background:var(--paper);color:var(--ink-500);font:800 11px/1.2 var(--font-body);padding:10px 14px;text-align:left;white-space:nowrap}.uz-model-table td{border-bottom:1px solid var(--ink-075);padding:11px 14px;white-space:nowrap}.uz-model-table tr.is-switched{background:var(--state-ai-bg)}.uz-model-row-button{padding:4px 8px}.uz-model-mono{font-family:var(--font-data)}.uz-model-compat-ref{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}.uz-model-split{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.2fr);gap:14px;align-items:start}.uz-model-cost-list,.uz-model-risk-list{display:grid;gap:10px;padding:14px 16px}.uz-model-cost-row{display:grid;gap:5px;border:0;border-radius:7px;background:transparent;color:var(--ink-700);cursor:pointer;padding:6px;text-align:left}.uz-model-cost-row:hover{background:var(--paper)}.uz-model-cost-row:focus-visible{outline:0;background:var(--paper);box-shadow:var(--shadow-focus)}.uz-model-cost-meta{display:flex;justify-content:space-between;gap:10px;font-size:12px}.uz-model-bar{height:7px;overflow:hidden;border-radius:999px;background:var(--ink-075)}.uz-model-bar span{display:block;height:100%;border-radius:999px}.uz-model-risk{display:flex;gap:10px;border-bottom:1px solid var(--ink-075);padding:0 0 10px}.uz-model-risk-body{min-width:0;flex:1}.uz-model-risk-body p{margin:0;color:var(--ink-900);font-size:12px;line-height:1.5}.uz-model-risk-body small{display:block;margin-top:4px;color:var(--ink-500);font-family:var(--font-data);font-size:11px}.uz-model-risk-action{align-self:flex-start;white-space:nowrap}.uz-model-empty-risk{padding:14px 16px;color:var(--ink-500);font-size:12px}.uz-model-state{display:grid;flex:1;min-height:260px;place-items:center;padding:24px;text-align:center}.uz-model-state div{max-width:580px;border:1px solid var(--ink-150);border-radius:8px;background:var(--card);padding:20px}.uz-model-state h2{margin:0 0 8px;font-size:16px}.uz-model-state p{margin:0;color:var(--ink-700);font-size:13px;line-height:1.55}.uz-model-badge--danger,.uz-model-tone--danger{background:var(--state-human-bg);color:var(--state-human)}.uz-model-badge--ok,.uz-model-tone--ok{background:var(--state-ok-bg);color:var(--state-ok)}.uz-model-badge--info,.uz-model-tone--info{background:var(--state-ai-bg);color:var(--state-ai)}.uz-model-badge--accent,.uz-model-tone--accent{background:var(--accent-data-bg);color:var(--accent-data)}.uz-model-badge--neutral,.uz-model-tone--neutral{background:var(--ink-075);color:var(--ink-700)}.uz-model-fill--danger{background:var(--state-human)}.uz-model-fill--warn{background:var(--state-warn)}.uz-model-fill--info{background:var(--state-ai)}.uz-model-fill--accent{background:var(--accent-data)}.uz-model-fill--neutral{background:var(--ink-300)}@media(max-width:980px){.uz-model-split{grid-template-columns:1fr}.uz-model-head,.uz-model-note,.uz-model-toast,.uz-model-scroll{padding-left:12px;padding-right:12px}.uz-model-action{margin-left:0}.uz-model-table{min-width:0}.uz-model-table thead{display:none}.uz-model-table tbody,.uz-model-table tr,.uz-model-table td{display:block}.uz-model-table tr{border-bottom:1px solid var(--ink-150);padding:10px}.uz-model-table td{border:0;padding:4px 0;white-space:normal}.uz-model-table td::before{display:inline-block;width:82px;color:var(--ink-500);font:800 11px/1.2 var(--font-body)}.uz-model-table td:nth-child(1)::before{content:"任务"}.uz-model-table td:nth-child(2)::before{content:"Primary"}.uz-model-table td:nth-child(3)::before{content:"Fallback"}.uz-model-table td:nth-child(4)::before{content:"成本/次"}.uz-model-table td:nth-child(5)::before{content:"延迟"}.uz-model-table td:nth-child(6)::before{content:"失败率"}.uz-model-table td:nth-child(7)::before{content:"最近评测"}}@media(max-width:360px){.uz-model-head{align-items:flex-start;flex-direction:column}.uz-model-action{width:100%;justify-content:center}.uz-model-kpis{grid-template-columns:1fr}.uz-model-risk{display:grid}.uz-model-risk-action{width:100%}}`;
