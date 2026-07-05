import { useEffect, useMemo, useRef, useState } from "react";

export type AnalyticsViewState =
  | "degraded"
  | "empty"
  | "error"
  | "loading"
  | "permission";
export type AnalyticsRange = "today" | "7d" | "30d";
export type AnalyticsDimension =
  | "member"
  | "agent"
  | "channel"
  | "intent"
  | "orderStatus"
  | "time"
  | "handoffReason";

export const analyticsRuntimeLabels = [
  "degraded",
  "mock",
  "browser-local only",
  "no production analytics metrics",
  "no export file write",
  "no analytics runtime",
  "no audit write"
] as const;
export const analyticsRanges = [
  { factor: 0.15, id: "today", label: "今日" },
  { factor: 1, id: "7d", label: "近 7 日" },
  { factor: 4.2, id: "30d", label: "近 30 日" }
] as const;
export const analyticsDimDefs: Record<
  AnalyticsDimension,
  { label: string; values: string[] }
> = {
  agent: { label: "AI 成员", values: ["玉珠客服·主理", "夜间值守 AI"] },
  channel: { label: "渠道", values: ["Telegram Bot", "Telegram Business", "导入兜底"] },
  handoffReason: {
    label: "转人工原因",
    values: ["红线拦截", "报价复杂", "物流异常", "知识缺失"]
  },
  intent: {
    label: "意图",
    values: ["教程咨询", "报价咨询", "订单查询", "退款/投诉", "其他"]
  },
  member: { label: "成员", values: ["韩雪", "李航", "王敏"] },
  orderStatus: { label: "订单状态", values: ["待发货", "运输中", "已签收", "异常"] },
  time: {
    label: "时间粒度",
    values: ["06-25", "06-26", "06-27", "06-28", "06-29", "06-30", "07-01"]
  }
};

const handoffReasons = [
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

function readViewState(): AnalyticsViewState {
  const params = new URLSearchParams(location.search);
  const value = params.get("m7AnalyticsState") ?? params.get("state");
  return ["degraded", "empty", "error", "loading", "permission"].includes(value ?? "")
    ? (value as AnalyticsViewState)
    : "degraded";
}

function hashNum(value: string) {
  let hash = 0;
  for (const char of value) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash;
}

function buildRows(dims: AnalyticsDimension[]) {
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
  const capped = combos.length > 20;
  return {
    capped,
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

export function useAnalyticsPageState() {
  const viewState = readViewState();
  const [range, setRange] = useState<AnalyticsRange>("7d");
  const [dims, setDims] = useState<AnalyticsDimension[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState("");
  const timer = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    []
  );
  const showToast = (message: string) => {
    if (timer.current) window.clearTimeout(timer.current);
    setToast(message);
    timer.current = window.setTimeout(() => setToast(""), 3200);
  };
  const rangeDef =
    analyticsRanges.find((item) => item.id === range) ?? analyticsRanges[1];
  const factor = rangeDef.factor;
  const kpis = [
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
  const table = useMemo(() => buildRows(dims), [dims]);
  const toggleDim = (dim: AnalyticsDimension) => {
    setDims((value) => {
      if (value.includes(dim)) return value.filter((item) => item !== dim);
      if (value.length >= 2) {
        showToast("最多添加 2 个维度；browser-local only / no analytics runtime");
        return value;
      }
      return [...value, dim];
    });
  };
  return {
    dimOptions: Object.entries(analyticsDimDefs).map(([id, def]) => ({
      id: id as AnalyticsDimension,
      label: def.label
    })),
    dims,
    exportLocal: () =>
      showToast("导出仅生成本地提示；no export file write / no audit write"),
    handoffReasons,
    isDegraded: viewState === "degraded",
    kpis,
    menuOpen,
    range,
    setMenuOpen,
    setRange,
    stateCopy: `Synthetic ${viewState} state. ${analyticsRuntimeLabels.join(" · ")}.`,
    table,
    toast,
    toggleDim,
    topIssues: topIssueSeed.map(([label, count], index) => ({
      count: Math.round(count * factor).toLocaleString(),
      label,
      rank: index + 1
    })),
    viewState
  };
}

export const analyticsStyles = `.uz-analytics-page{height:100%;min-height:0;min-width:0;width:100%;max-width:100%;display:flex;flex-direction:column;overflow:hidden;background:var(--paper);color:var(--ink-900);font-family:var(--font-body)}.uz-analytics-page *{box-sizing:border-box}.uz-analytics-head{display:flex;align-items:center;gap:12px;border-bottom:1px solid var(--ink-150);background:var(--card);padding:14px 24px}.uz-analytics-title{margin:0;font:800 16px/1.35 var(--font-display)}.uz-analytics-range{display:flex;gap:2px;border-radius:7px;background:var(--ink-075);padding:2px}.uz-analytics-range button,.uz-analytics-tool,.uz-analytics-menu button,.uz-analytics-chip button{border:0;background:transparent;font-family:var(--font-body);cursor:pointer}.uz-analytics-range button{border-radius:5px;color:var(--ink-500);font-size:12px;font-weight:800;min-height:28px;padding:0 10px}.uz-analytics-range button[aria-pressed=true]{background:var(--card);color:var(--ink-900)}.uz-analytics-tools{position:relative;margin-left:auto;display:flex;gap:8px}.uz-analytics-tool{display:inline-flex;align-items:center;gap:6px;min-height:32px;border:1px solid var(--ink-150);border-radius:7px;background:var(--card);color:var(--ink-700);font-size:12px;font-weight:800;padding:0 12px}.uz-analytics-tool:hover{border-color:var(--ink-300);color:var(--ink-900)}.uz-analytics-tool:focus-visible,.uz-analytics-range button:focus-visible,.uz-analytics-menu button:focus-visible,.uz-analytics-chip button:focus-visible{outline:0;box-shadow:var(--shadow-focus)}.uz-analytics-menu{position:absolute;right:88px;top:38px;z-index:var(--z-dropdown);width:204px;border:1px solid var(--ink-150);border-radius:9px;background:var(--card);box-shadow:var(--shadow-overlay);padding:6px}.uz-analytics-menu-note{padding:6px 8px 4px;color:var(--ink-500);font-size:11px;font-weight:800}.uz-analytics-menu button{display:flex;width:100%;align-items:center;gap:8px;border-radius:6px;color:var(--ink-900);font-size:12px;font-weight:800;padding:8px;text-align:left}.uz-analytics-menu button:disabled{cursor:not-allowed;opacity:var(--opacity-disabled)}.uz-analytics-check{display:grid;width:14px;height:14px;place-items:center;border:1.5px solid var(--ink-300);border-radius:4px;color:var(--card);font-size:10px}.uz-analytics-menu button[aria-pressed=true] .uz-analytics-check{border-color:var(--ink-900);background:var(--ink-900)}.uz-analytics-body{min-height:0;flex:1;overflow:auto;padding:18px 24px 24px}.uz-analytics-note,.uz-analytics-toast{display:flex;align-items:center;gap:8px;border:1px solid var(--state-warn-border);border-radius:8px;background:var(--state-warn-bg);color:var(--ink-700);font-size:12px;line-height:1.45;margin-bottom:14px;padding:10px 12px}.uz-analytics-note{display:none}.uz-analytics-note strong{color:var(--state-warn)}.uz-analytics-toast{border-color:var(--state-ok-border);background:var(--state-ok-bg);color:var(--state-ok);font-weight:800}.uz-analytics-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(146px,1fr));gap:12px;margin-bottom:16px}.uz-analytics-kpi,.uz-analytics-panel{border:1px solid var(--ink-150);border-radius:10px;background:var(--card)}.uz-analytics-kpi{padding:14px}.uz-analytics-kpi span{display:block;margin-bottom:7px;color:var(--ink-500);font-size:11px;font-weight:800}.uz-analytics-kpi strong{font:800 22px/1.1 var(--font-data)}.uz-analytics-kpi small{margin-left:7px;font:800 11px/1 var(--font-body)}.tone-ok{color:var(--state-ok)}.tone-human{color:var(--state-human)}.tone-warn{color:var(--state-warn)}.tone-ai{color:var(--state-ai)}.tone-off{color:var(--state-off)}.uz-analytics-meter .tone-ok{background:var(--state-ok)}.uz-analytics-meter .tone-human{background:var(--state-human)}.uz-analytics-meter .tone-warn{background:var(--state-warn)}.uz-analytics-meter .tone-ai{background:var(--state-ai)}.uz-analytics-meter .tone-off{background:var(--state-off)}.uz-analytics-meter [data-pct="38"]{width:38%}.uz-analytics-meter [data-pct="24"]{width:24%}.uz-analytics-meter [data-pct="18"]{width:18%}.uz-analytics-meter [data-pct="12"]{width:12%}.uz-analytics-meter [data-pct="8"]{width:8%}.uz-analytics-split{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(280px,.9fr);gap:14px}.uz-analytics-panel{padding:16px}.uz-analytics-panel h3{margin:0 0 14px;font-size:13px}.uz-analytics-bar{margin-bottom:11px}.uz-analytics-bar-row,.uz-analytics-issue{display:flex;align-items:center;justify-content:space-between;gap:10px}.uz-analytics-bar-row{margin-bottom:4px;color:var(--ink-700);font-size:12px}.uz-analytics-meter{height:7px;overflow:hidden;border-radius:4px;background:var(--ink-075)}.uz-analytics-meter span{display:block;height:100%;border-radius:4px;background:var(--state-ai)}.uz-analytics-issue{border-bottom:1px solid var(--ink-075);padding:7px 0}.uz-analytics-rank,.uz-analytics-count{font-family:var(--font-data);font-size:12px;color:var(--ink-500)}.uz-analytics-rank{width:16px;color:var(--ink-300)}.uz-analytics-issue strong{min-width:0;flex:1;font-size:13px}.uz-analytics-chips{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:16px 0 10px;color:var(--ink-500);font-size:11px;font-weight:800}.uz-analytics-chip{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--state-ai-border);border-radius:var(--radius-pill);background:var(--state-ai-bg);color:var(--state-ai);font-size:12px;padding:4px 6px 4px 10px}.uz-analytics-chip button{color:var(--state-ai);font-weight:900}.uz-analytics-table-panel{margin-top:14px;overflow:hidden;padding:0}.uz-analytics-table-head{display:flex;align-items:center;gap:10px;border-bottom:1px solid var(--ink-075);padding:13px 16px;font-size:13px;font-weight:800}.uz-analytics-table-head span{color:var(--state-warn);font-size:11px;font-weight:700}.uz-analytics-table-wrap{overflow:auto}.uz-analytics-table{width:100%;min-width:640px;border-collapse:collapse;font-size:13px}.uz-analytics-table th{background:var(--paper);border-bottom:1px solid var(--ink-150);color:var(--ink-500);font-size:11px;font-weight:800;padding:10px 16px;text-align:left;white-space:nowrap}.uz-analytics-table td{border-bottom:1px solid var(--ink-075);color:var(--ink-700);padding:10px 16px;white-space:nowrap}.uz-analytics-table td.is-strong{color:var(--ink-900);font-weight:800}.uz-analytics-table td.is-mono{font-family:var(--font-data)}.uz-analytics-state{display:grid;min-height:280px;place-items:center;padding:24px;text-align:center}.uz-analytics-state div{max-width:600px;border:1px solid var(--ink-150);border-radius:8px;background:var(--card);padding:20px}.uz-analytics-state h2{margin:0 0 8px;font-size:16px}.uz-analytics-state p{margin:0;color:var(--ink-700);font-size:13px;line-height:1.55}@media(min-width:901px){.uz-analytics-page{width:calc(100vw - var(--nav-expanded-width));max-width:calc(100vw - var(--nav-expanded-width))}.uz-app-shell.is-nav-collapsed .uz-analytics-page{width:calc(100vw - var(--nav-collapsed-width));max-width:calc(100vw - var(--nav-collapsed-width))}}@media(max-width:900px){.uz-analytics-page{width:100%;max-width:100%}}@media(max-width:820px){.uz-analytics-head{align-items:flex-start;flex-direction:column;padding:12px}.uz-analytics-tools{width:100%;margin-left:0;flex-wrap:wrap}.uz-analytics-tool{flex:1}.uz-analytics-menu{left:0;right:auto;top:72px}.uz-analytics-body{padding:12px}.uz-analytics-split{grid-template-columns:1fr}.uz-analytics-toast{align-items:flex-start;flex-direction:column}.uz-analytics-table{min-width:560px}}@media(max-width:720px){.uz-analytics-page{width:100vw;max-width:100vw}}@media(max-width:420px){.uz-analytics-kpis{grid-template-columns:1fr}.uz-analytics-range{width:100%;overflow:auto}.uz-analytics-range button{flex:1 0 auto}.uz-analytics-title{font-size:15px}.uz-analytics-table{min-width:520px}}`;
