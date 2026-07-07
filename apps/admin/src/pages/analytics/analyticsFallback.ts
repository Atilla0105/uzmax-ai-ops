export type AnalyticsViewState =
  | "degraded"
  | "delayed"
  | "empty"
  | "error"
  | "loading"
  | "permission";
export type AnalyticsRange = "today" | "7d" | "30d";
export type AnalyticsDimension =
  | "agent"
  | "channel"
  | "handoffReason"
  | "intent"
  | "language"
  | "member"
  | "orderStatus"
  | "time";
export type AnalyticsTone = "ai" | "data" | "human" | "off" | "ok" | "warn";
export type AnalyticsFilters = Record<"channel" | "language", string>;

export const analyticsRuntimeLabels = [
  "degraded",
  "mock",
  "read-only",
  "browser-local only",
  "no production analytics metrics",
  "no export file write",
  "no analytics runtime",
  "no audit write",
  "no DB/API/authz/RLS"
] as const;
export const analyticsSourceSummary =
  "owner HTML / unpacked 6 analytics source; centralized synthetic fallback";
const rangeFactors = [
  { factor: 0.15, id: "today", label: "今日" },
  { factor: 1, id: "7d", label: "近 7 日" },
  { factor: 4.2, id: "30d", label: "近 30 日" }
] as const;
export const analyticsFilterOptions = {
  channel: ["全部渠道", "Telegram Bot", "Telegram Business", "导入兜底"],
  language: ["全部语言", "乌兹别克语（拉丁）", "乌兹别克语（西里尔）", "俄语", "中文"]
} as const;
export const analyticsDimDefs: Record<
  AnalyticsDimension,
  { label: string; values: string[] }
> = {
  agent: { label: "AI 成员", values: ["玉珠客服 · 主理", "夜间值守 AI"] },
  channel: { label: "渠道", values: ["Telegram Bot", "Telegram Business", "导入兜底"] },
  handoffReason: {
    label: "转人工原因",
    values: ["红线拦截", "报价复杂", "物流异常", "知识缺失", "其他"]
  },
  intent: {
    label: "意图",
    values: ["教程咨询", "报价咨询", "订单查询", "退款/投诉", "其他"]
  },
  language: {
    label: "语言",
    values: ["乌兹别克语（拉丁）", "乌兹别克语（西里尔）", "俄语", "中文"]
  },
  member: { label: "成员", values: ["韩雪", "李航", "王敏"] },
  orderStatus: { label: "订单状态", values: ["待发货", "运输中", "已签收", "异常"] },
  time: { label: "时间粒度", values: ["06-25", "06-26", "06-27", "06-28", "06-29"] }
};

const handoffSeed = [
  ["红线拦截（退款/投诉）", 38, "human"],
  ["报价/价格复杂", 24, "warn"],
  ["物流异常", 18, "warn"],
  ["知识缺失", 12, "ai"],
  ["其他", 8, "off"]
] as const;
const topIssueSeed = [
  ["订单物流进度查询", 412],
  ["退款 / 退货流程", 238],
  ["套装报价咨询", 196],
  ["产品使用方法", 154],
  ["孕期 / 敏感肌适用性", 88]
] as const;
export const trendRows = [
  ["06-25", "318", "84%", "2.4m", "w64"],
  ["06-26", "342", "86%", "2.1m", "w70"],
  ["06-27", "371", "87%", "2.0m", "w76"],
  ["06-28", "408", "88%", "2.7m delayed", "w84"],
  ["06-29", "390", "87%", "2.3m", "w80"]
] as const;
export const queueHints = [
  ["确认队列 7 日通过", "32%", "warn"],
  ["冲突候选", "4", "human"],
  ["蒸馏频率", "5/日 · 降频", "warn"]
] as const;
export const latencyHints = [
  ["订单 connector", "12 分钟延迟", "warn"],
  ["Business 草稿采纳", "5 分钟内", "ok"],
  ["日志回填", "browser-local mock", "off"]
] as const;

export function readAnalyticsViewState(): AnalyticsViewState {
  const value = new URLSearchParams(location.search).get("m7AnalyticsState");
  return ["degraded", "delayed", "empty", "error", "loading", "permission"].includes(
    value ?? ""
  )
    ? (value as AnalyticsViewState)
    : "degraded";
}

export function analyticsStateCopy(state: AnalyticsViewState) {
  return {
    degraded: `degraded / mock analytics view; ${analyticsRuntimeLabels.slice(3).join("; ")}.`,
    delayed:
      "delayed data state: trend, queue and latency hints are stale synthetic rows; browser-local only; no production analytics metrics.",
    empty:
      "empty data state: no tenant analytics rows from runtime; browser-local only; no production analytics metrics.",
    error:
      "analytics runtime unavailable: synthetic fallback only; browser-local only; no DB/API/authz/RLS call was made.",
    loading:
      "loading analytics skeleton: layout remains stable; browser-local only; no analytics runtime.",
    permission:
      "permission denied: backend authz remains authoritative; browser-local only; this page does not unlock analytics data."
  }[state];
}

export function buildKpis(range: AnalyticsRange, filters: AnalyticsFilters) {
  const factor = rangeFactor(range) * filterFactor(filters);
  return [
    ["解决率", "87%", "+2.1", "ok"],
    ["转人工率", "14%", "-1.3", "ok"],
    ["SLA 达标", "92%", "-0.8", "human"],
    ["AI 成本/日", "¥118", "+6%", "warn"],
    ["草稿采纳", "81%", "+3.0", "ok"],
    ["订单查询", Math.round(1200 * factor).toLocaleString(), "+9%", "off"],
    ["知识健康", "94%", "+1.2", "ok"],
    ["队列7日通过", "32%", "-11", "human"],
    ["蒸馏频率", "5/日", "降频", "warn"],
    ["真实流量基线", Math.round(2496 * factor).toLocaleString(), "+4%", "off"]
  ] as const;
}

export function buildHandoffReasons() {
  return handoffSeed;
}

export function buildTopIssues(range: AnalyticsRange, filters: AnalyticsFilters) {
  const factor = rangeFactor(range) * filterFactor(filters);
  return topIssueSeed.map(([label, count], index) => ({
    count: Math.round(count * factor).toLocaleString(),
    label,
    rank: index + 1
  }));
}

function rangeFactor(range: AnalyticsRange) {
  return rangeFactors.find((item) => item.id === range)?.factor ?? 1;
}

function filterFactor(filters: AnalyticsFilters) {
  return (
    (filters.channel === "全部渠道" ? 1 : 0.42) *
    (filters.language === "全部语言" ? 1 : 0.58)
  );
}

export const analyticsStyles = `.uz-analytics-page{display:flex;width:100%;height:100%;min-width:0;min-height:0;flex-direction:column;overflow:hidden;background:var(--paper);color:var(--ink-900);font-family:var(--font-body)}.uz-analytics-page *{box-sizing:border-box}.uz-analytics-head{display:flex;align-items:center;gap:12px;flex-wrap:wrap;border-bottom:1px solid var(--ink-150);background:var(--card);padding:14px 24px}.uz-analytics-title{margin:0;font:800 16px/1.35 var(--font-display)}.uz-analytics-range{display:flex;gap:2px;border-radius:7px;background:var(--ink-075);padding:2px}.uz-analytics-range button,.uz-analytics-tool,.uz-analytics-menu button,.uz-analytics-chip button{border:0;background:transparent;color:inherit;font-family:var(--font-body);cursor:pointer}.uz-analytics-range button{min-height:28px;border-radius:5px;color:var(--ink-500);font-size:12px;font-weight:800;padding:0 10px}.uz-analytics-range button[aria-pressed=true]{background:var(--card);color:var(--ink-900)}.uz-analytics-filter{display:flex;align-items:center;gap:6px;color:var(--ink-500);font-size:11px;font-weight:800}.uz-analytics-filter select{height:30px;border:1px solid var(--ink-150);border-radius:7px;background:var(--card);color:var(--ink-900);font:700 12px/1 var(--font-body);padding:0 8px}.uz-analytics-tools{position:relative;margin-left:auto;display:flex;gap:8px}.uz-analytics-tool{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:32px;border:1px solid var(--ink-150);border-radius:7px;background:var(--card);color:var(--ink-700);font-size:12px;font-weight:800;padding:0 12px}.uz-analytics-tool:hover{border-color:var(--ink-300);color:var(--ink-900)}.uz-analytics-tool:focus-visible,.uz-analytics-range button:focus-visible,.uz-analytics-menu button:focus-visible,.uz-analytics-chip button:focus-visible,.uz-analytics-filter select:focus-visible{outline:0;box-shadow:var(--shadow-focus)}.uz-analytics-menu{position:absolute;right:88px;top:38px;z-index:var(--z-dropdown);width:210px;border:1px solid var(--ink-150);border-radius:9px;background:var(--card);box-shadow:var(--shadow-overlay);padding:6px}.uz-analytics-menu-note{padding:6px 8px 4px;color:var(--ink-500);font-size:11px;font-weight:800}.uz-analytics-menu button{display:flex;width:100%;align-items:center;gap:8px;border-radius:6px;color:var(--ink-900);font-size:12px;font-weight:800;padding:8px;text-align:left}.uz-analytics-menu button:disabled{cursor:not-allowed;opacity:var(--opacity-disabled)}.uz-analytics-check{display:grid;width:14px;height:14px;place-items:center;border:1.5px solid var(--ink-300);border-radius:4px;color:var(--card);font-size:10px}.uz-analytics-menu button[aria-pressed=true] .uz-analytics-check{border-color:var(--ink-900);background:var(--ink-900)}.uz-analytics-body{min-height:0;flex:1;overflow:auto;padding:18px 24px 24px}.uz-analytics-note,.uz-analytics-delayed,.uz-analytics-toast{display:flex;align-items:center;gap:8px;border:1px solid var(--state-warn-border);border-radius:8px;background:var(--state-warn-bg);color:var(--ink-700);font-size:12px;line-height:1.45;margin-bottom:14px;padding:10px 12px}.uz-analytics-note strong,.uz-analytics-delayed strong{color:var(--state-warn)}.uz-analytics-toast{border-color:var(--state-ok-border);background:var(--state-ok-bg);color:var(--state-ok);font-weight:800}.uz-analytics-filter-summary{margin:0 0 14px;color:var(--ink-500);font-size:12px}.uz-analytics-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(146px,1fr));gap:12px;margin-bottom:16px}.uz-analytics-kpi,.uz-analytics-panel{border:1px solid var(--ink-150);border-radius:10px;background:var(--card)}.uz-analytics-kpi{min-height:92px;padding:14px}.uz-analytics-kpi span{display:block;margin-bottom:7px;color:var(--ink-500);font-size:11px;font-weight:800}.uz-analytics-kpi strong{font:800 22px/1.1 var(--font-data)}.uz-analytics-kpi small{margin-left:7px;font:800 11px/1 var(--font-body)}.tone-ok{color:var(--state-ok)}.tone-human{color:var(--state-human)}.tone-warn{color:var(--state-warn)}.tone-ai{color:var(--state-ai)}.tone-off{color:var(--state-off)}.tone-data{color:var(--accent-data)}.uz-analytics-split,.uz-analytics-hints{display:grid;gap:14px}.uz-analytics-split{grid-template-columns:minmax(0,1.35fr) minmax(280px,.9fr);margin-bottom:14px}.uz-analytics-hints{grid-template-columns:repeat(3,minmax(0,1fr));margin-bottom:14px}.uz-analytics-panel{padding:16px}.uz-analytics-panel h3{margin:0 0 14px;font-size:13px}.uz-analytics-bar{margin-bottom:11px}.uz-analytics-bar-row,.uz-analytics-issue,.uz-analytics-trend,.uz-analytics-hint{display:flex;align-items:center;justify-content:space-between;gap:10px}.uz-analytics-bar-row{margin-bottom:4px;color:var(--ink-700);font-size:12px}.uz-analytics-meter{height:7px;overflow:hidden;border-radius:4px;background:var(--ink-075)}.uz-analytics-fill{display:block;height:100%;border-radius:4px;background:var(--state-ai)}.uz-analytics-fill.tone-human{background:var(--state-human)}.uz-analytics-fill.tone-warn{background:var(--state-warn)}.uz-analytics-fill.tone-ai{background:var(--state-ai)}.uz-analytics-fill.tone-off{background:var(--state-off)}.uz-analytics-fill.tone-data{background:var(--accent-data)}.w8{width:8%}.w12{width:12%}.w18{width:18%}.w24{width:24%}.w38{width:38%}.w64{width:64%}.w70{width:70%}.w76{width:76%}.w80{width:80%}.w84{width:84%}.uz-analytics-issue,.uz-analytics-trend,.uz-analytics-hint{border-bottom:1px solid var(--ink-075);padding:7px 0}.uz-analytics-rank,.uz-analytics-count,.uz-analytics-trend strong,.uz-analytics-hint strong{font-family:var(--font-data);font-size:12px;color:var(--ink-500)}.uz-analytics-rank{width:16px;color:var(--ink-300)}.uz-analytics-issue strong,.uz-analytics-trend span,.uz-analytics-hint span{min-width:0;flex:1;font-size:13px}.uz-analytics-trend-meter{width:86px;flex:none}.uz-analytics-chips{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:16px 0 10px;color:var(--ink-500);font-size:11px;font-weight:800}.uz-analytics-chip{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--state-ai-border);border-radius:var(--radius-pill);background:var(--state-ai-bg);color:var(--state-ai);font-size:12px;padding:4px 6px 4px 10px}.uz-analytics-chip button{color:var(--state-ai);font-weight:900}.uz-analytics-table-panel{margin-top:14px;overflow:hidden;padding:0}.uz-analytics-table-head{display:flex;align-items:center;gap:10px;border-bottom:1px solid var(--ink-075);padding:13px 16px;font-size:13px;font-weight:800}.uz-analytics-table-head span{color:var(--state-warn);font-size:11px;font-weight:700}.uz-analytics-table-wrap{overflow:auto}.uz-analytics-table{width:100%;min-width:640px;border-collapse:collapse;font-size:13px}.uz-analytics-table th{background:var(--paper);border-bottom:1px solid var(--ink-150);color:var(--ink-500);font-size:11px;font-weight:800;padding:10px 16px;text-align:left;white-space:nowrap}.uz-analytics-table td{border-bottom:1px solid var(--ink-075);color:var(--ink-700);padding:10px 16px;white-space:nowrap}.uz-analytics-table td.is-strong{color:var(--ink-900);font-weight:800}.uz-analytics-table td.is-mono{font-family:var(--font-data)}.uz-analytics-state{display:grid;min-height:280px;place-items:center;padding:24px;text-align:center}.uz-analytics-state div{max-width:600px;border:1px solid var(--ink-150);border-radius:8px;background:var(--card);padding:20px}.uz-analytics-state h2{margin:0 0 8px;font-size:16px}.uz-analytics-state p{margin:0;color:var(--ink-700);font-size:13px;line-height:1.55}@media(min-width:901px){.uz-analytics-page{width:calc(100vw - var(--nav-expanded-width));max-width:calc(100vw - var(--nav-expanded-width))}.uz-app-shell.is-nav-collapsed .uz-analytics-page{width:calc(100vw - var(--nav-collapsed-width));max-width:calc(100vw - var(--nav-collapsed-width))}}@media(max-width:820px){.uz-analytics-page{width:100vw;max-width:100vw;overflow:auto}.uz-analytics-head{align-items:flex-start;flex-direction:column;padding:12px}.uz-analytics-tools,.uz-analytics-filter{width:100%;margin-left:0}.uz-analytics-filter select{min-width:0;flex:1}.uz-analytics-tool{flex:1;min-height:40px}.uz-analytics-menu{left:0;right:auto;top:42px}.uz-analytics-body{overflow:visible;padding:12px}.uz-analytics-split,.uz-analytics-hints{grid-template-columns:1fr}.uz-analytics-note,.uz-analytics-delayed,.uz-analytics-toast{align-items:flex-start;flex-direction:column;margin-bottom:10px}.uz-analytics-table{min-width:560px}}@media(max-width:420px){.uz-analytics-kpis{grid-template-columns:1fr;gap:8px}.uz-analytics-range{width:100%;overflow:auto}.uz-analytics-range button{min-height:24px;flex:1 0 auto}.uz-analytics-filter select{height:28px}.uz-analytics-tool{min-height:34px}.uz-analytics-title{font-size:15px}.uz-analytics-panel{padding:12px}.uz-analytics-filter-summary{display:none}.uz-analytics-table{min-width:520px}.uz-analytics-head{gap:5px;padding-top:8px;padding-bottom:8px}.uz-analytics-body{display:block}}`;
