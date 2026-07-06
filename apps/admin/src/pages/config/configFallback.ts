import { useEffect, useMemo, useRef, useState } from "react";

export type ConfigViewState = "degraded" | "empty" | "error" | "loading" | "permission";
export type ConfigSection =
  | "biz"
  | "sla"
  | "tmpl"
  | "model"
  | "cost"
  | "breaker"
  | "channel"
  | "connector";
export type ConfigVersion = { at: string; by: string; note?: string; ver: number };
export type ConfigChannel = {
  desc: string;
  enabled: boolean;
  id: string;
  lastTest: string;
  name: string;
  status: string;
};
export type ConfigConnector = {
  apiHealth: string;
  lastError: string;
  lastSync: string;
  mode: "api" | "import";
};
export type ConfigDraft = {
  biz: Record<"cap" | "handoffChannel" | "lang" | "timezone", string>;
  breakers: { k: string; v: string }[];
  channels: ConfigChannel[];
  connector: ConfigConnector;
  guardrails: { cap: string; editable: boolean; k: string; v: string }[];
  sla: { first: string; id: string; label: string; resolve: string }[];
};

// prettier-ignore
export const configSections = ([["biz", "业务配置"], ["sla", "SLA"], ["tmpl", "模板"], ["model", "模型路由"], ["cost", "成本护栏"], ["breaker", "熔断阈值"], ["channel", "渠道配置"], ["connector", "订单 connector"]] as const).map(([id, label]) => ({ id, label }));
export const configSectionLabels = Object.fromEntries(
  configSections.map((item) => [item.id, item.label])
) as Record<ConfigSection, string>;
export const configRuntimeLabels =
  "degraded|mock|browser-local only|no production config write|no audit write|no connector switch|no eval-gated publish|no API call".split(
    "|"
  );
export const configRuntimeBoundary = configRuntimeLabels.join(" | ");
export const configMeta = {
  source: "unpacked config source + sanitized local fallback",
  subtitle: configRuntimeLabels.join(" · ")
} as const;
export const configStateCopy: Record<ConfigViewState, { body: string; title: string }> =
  {
    degraded: {
      body: "配置项正在按当前租户策略展示，保存、回滚和切换动作会先进入变更预览。",
      title: "配置已载入"
    },
    empty: {
      body: "当前租户还没有可展示的配置项。可以先从业务配置或模板来源开始补齐。",
      title: "暂无配置项"
    },
    error: {
      body: "配置暂时无法加载，请稍后重试或联系管理员确认权限与服务状态。",
      title: "配置暂时无法加载"
    },
    loading: {
      body: "正在加载业务配置、SLA、渠道和订单主路径设置…",
      title: "正在加载配置"
    },
    permission: {
      body: "当前账号没有查看配置页的权限，请联系管理员调整角色。",
      title: "无权查看配置"
    }
  };
export const selectOptions = {
  handoff: ["Telegram 人工组", "WhatsApp 值班组", "邮件工单组"],
  lang: ["乌兹别克语（拉丁）", "乌兹别克语（西里尔）", "俄语", "中文", "英语"],
  timezone: ["UTC+5 塔什干", "UTC+3 莫斯科", "UTC+8 北京"]
} as const;
export const routeColumns = "任务|主模型|兜底|成本/千次|延迟 p50|失败率".split("|");
// prettier-ignore
export const routeRows = [["意图识别", "gpt-4o-mini", "qwen-2.5", "¥1.2", "218ms", "0.4%"], ["对话生成", "gpt-4o", "claude-haiku", "¥9.6", "612ms", "0.9%"], ["报价", "gpt-4o", "gpt-4o-mini", "¥8.1", "540ms", "4.2%"], ["截图理解", "gpt-4o-vision", "—", "¥14.0", "1.1s", "2.1%"], ["红线检查", "内置分类器", "gpt-4o-mini", "¥0.3", "42ms", "0.1%"]];
// prettier-ignore
export const templateRows = [["售后知识包", "v4.2", "v4.2", "06-26", "已同步"], ["默认配置", "v2.3", "v2.4", "05-30", "有更新"], ["红线评测集", "v5.0", "v5.0", "06-10", "已同步"], ["客服人设", "v3.0", "v3.1", "04-22", "本地修改"]];

// prettier-ignore
const initialDraft: ConfigDraft = {
  biz: { cap: "8", handoffChannel: "Telegram 人工组", lang: "乌兹别克语（拉丁）", timezone: "UTC+5 塔什干" },
  breakers: [{ k: "失败率阈值（%）", v: "15" }, { k: "连续失败次数", v: "5" }],
  channels: [{ desc: "标准机器人渠道 · AI 自动发送", enabled: true, id: "tg_bot", lastTest: "06-29 09:00", name: "Telegram Bot", status: "正常" }, { desc: "人工号双轨 · AI 生成草稿，需人工确认发送", enabled: true, id: "tg_biz", lastTest: "06-28 17:20", name: "Telegram Business", status: "正常" }],
  connector: { apiHealth: "正常", lastError: "无", lastSync: "2 分钟前", mode: "api" },
  guardrails: [{ cap: "1,000", editable: false, k: "集团日预算", v: "800" }, { cap: "200", editable: true, k: "本租户日预算", v: "120" }, { cap: "", editable: true, k: "单会话上限", v: "1.5" }],
  sla: [{ first: "5", id: "p0", label: "P0 · 红线 / 投诉", resolve: "60" }, { first: "15", id: "p1", label: "P1 · 一般转人工", resolve: "240" }, { first: "60", id: "p2", label: "P2 · 低优先级咨询", resolve: "1440" }]
};
// prettier-ignore
const initialVersions: Record<ConfigSection, ConfigVersion> = {
  biz: { at: "06-20 14:10", by: "韩雪", ver: 3 }, sla: { at: "06-18 09:30", by: "李伟", ver: 5 }, tmpl: { at: "来自集团模板中心", by: "模板来源", ver: 1 }, model: { at: "今天 10:42", by: "韩雪", ver: 17 },
  cost: { at: "06-29 09:58", by: "李伟", ver: 12 }, breaker: { at: "06-15 11:20", by: "韩雪", ver: 4 }, channel: { at: "06-25 16:00", by: "李伟", ver: 8 }, connector: { at: "06-22 08:40", by: "韩雪", ver: 6 }
};
// prettier-ignore
const initialHistory: Partial<Record<ConfigSection, ConfigVersion[]>> = {
  biz: [{ at: "06-01 10:00", by: "韩雪", note: "调整默认时区为塔什干", ver: 2 }, { at: "05-10 09:00", by: "韩雪", note: "初始业务配置", ver: 1 }],
  cost: [{ at: "06-20 10:00", by: "李伟", note: "本租户日预算上调到 120", ver: 11 }], model: [{ at: "06-28 14:00", by: "韩雪", note: "报价任务主模型切到 gpt-4o", ver: 16 }], sla: [{ at: "05-20 09:00", by: "李伟", note: "P0 首次响应收紧到 5 分钟", ver: 4 }]
};
const dirtyable: readonly ConfigSection[] = [
  "biz",
  "sla",
  "cost",
  "breaker",
  "channel"
];

function readConfigViewState(): ConfigViewState {
  const params = new URLSearchParams(location.search);
  const state = params.get("m7ConfigState") ?? params.get("state");
  return ["degraded", "empty", "error", "loading", "permission"].includes(state ?? "")
    ? (state as ConfigViewState)
    : "degraded";
}

// prettier-ignore
export function useConfigPageState() {
  const viewState = readConfigViewState();
  const [section, setSection] = useState<ConfigSection>("biz");
  const [draft, setDraft] = useState<ConfigDraft>(initialDraft);
  const [versions, setVersions] = useState(initialVersions);
  const [history, setHistory] = useState(initialHistory);
  const [dirty, setDirty] = useState<Partial<Record<ConfigSection, boolean>>>({});
  const [historyOpen, setHistoryOpen] = useState<ConfigSection | null>(null);
  const [toast, setToast] = useState("");
  const timer = useRef<number | null>(null);
  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);
  const showToast = (message: string) => { if (timer.current) window.clearTimeout(timer.current); setToast(message); timer.current = window.setTimeout(() => setToast(""), 3200); };
  const markDirty = (target: ConfigSection) => setDirty((value) => ({ ...value, [target]: true }));
  const save = () => { if (!dirty[section]) return; const current = versions[section]; setHistory((value) => ({ ...value, [section]: [{ ...current, note: `${configSectionLabels[section]}变更预览` }, ...(value[section] ?? [])] })); setVersions((value) => ({ ...value, [section]: { at: "刚刚", by: "当前操作员", ver: current.ver + 1 } })); setDirty((value) => ({ ...value, [section]: false })); showToast("配置变更已暂存，并生成新的版本预览"); };
  const rollback = (target: ConfigVersion) => { setVersions((value) => ({ ...value, [section]: { at: "刚刚", by: "当前操作员", ver: value[section].ver + 1 } })); setDirty((value) => ({ ...value, [section]: false })); showToast(`回滚到 v${target.ver} 的预览已排队`); };
  const update = {
    biz: (key: keyof ConfigDraft["biz"], value: string) => { setDraft((d) => ({ ...d, biz: { ...d.biz, [key]: value } })); markDirty("biz"); },
    breaker: (index: number, value: string) => { setDraft((d) => ({ ...d, breakers: d.breakers.map((row, i) => (i === index ? { ...row, v: value } : row)) })); markDirty("breaker"); },
    channelTest: (id: string) => { setDraft((d) => ({ ...d, channels: d.channels.map((row) => (row.id === id ? { ...row, lastTest: "刚刚", status: "检查通过" } : row)) })); showToast("渠道连通性检查已更新"); },
    channelToggle: (id: string) => { setDraft((d) => ({ ...d, channels: d.channels.map((row) => (row.id === id ? { ...row, enabled: !row.enabled } : row)) })); markDirty("channel"); },
    connectorSwitch: (mode: ConfigConnector["mode"]) => { setDraft((d) => ({ ...d, connector: { ...d.connector, mode } })); showToast("订单数据主路径预览已切换"); },
    connectorTest: () => { setDraft((d) => ({ ...d, connector: { ...d.connector, lastSync: "刚刚" } })); showToast("订单连接健康状态已刷新"); },
    guard: (index: number, value: string) => { setDraft((d) => ({ ...d, guardrails: d.guardrails.map((row, i) => (i === index ? { ...row, v: value } : row)) })); markDirty("cost"); },
    sla: (id: string, key: "first" | "resolve", value: string) => { setDraft((d) => ({ ...d, sla: d.sla.map((row) => (row.id === id ? { ...row, [key]: value } : row)) })); markDirty("sla"); }
  };
  const sectionHistory = useMemo(() => history[section] ?? [], [history, section]);
  return { dirty, draft, historyOpen, isDegraded: viewState === "degraded", isDirtyable: dirtyable.includes(section), rollback, save, section, sectionHistory, setHistoryOpen, setSection, stateCopy: configStateCopy[viewState], toast, update, version: versions[section], viewState };
}

export const configStyles = `.uz-config-page{display:flex;height:100%;min-height:0;overflow:hidden;background:var(--paper);color:var(--ink-900);font-family:var(--font-body)}.uz-config-page *{box-sizing:border-box}.uz-config-side{width:236px;flex:none;overflow:auto;border-right:1px solid var(--ink-150);background:var(--card);padding:14px 10px}.uz-config-side h2{margin:0 8px 12px;font:800 15px/1.3 var(--font-display)}.uz-config-nav{display:grid;gap:2px}.uz-config-nav button{display:flex;height:36px;align-items:center;border:0;border-radius:7px;background:transparent;color:var(--ink-500);cursor:pointer;font:700 13px/1 var(--font-body);padding:0 10px;text-align:left}.uz-config-nav button[aria-pressed=true],.uz-config-nav button:hover{background:var(--ink-075);color:var(--ink-900)}.uz-config-main{min-width:0;flex:1;overflow:auto}.uz-config-head{border-bottom:1px solid var(--ink-150);background:var(--card);padding:14px 24px}.uz-config-head-row{display:flex;align-items:center;gap:12px;min-width:0}.uz-config-title{margin:0;font:800 16px/1.35 var(--font-display)}.uz-config-meta,.uz-config-muted{color:var(--ink-500);font-size:12px;line-height:1.45}.uz-config-tools{margin-left:auto;display:flex;gap:8px;align-items:center}.uz-config-btn,.uz-config-mini,.uz-config-danger,.uz-config-link{display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--ink-150);border-radius:7px;background:var(--card);color:var(--ink-700);cursor:pointer;font:800 12px/1 var(--font-body);min-height:32px;padding:0 12px}.uz-config-btn.is-primary{border-color:var(--ink-900);background:var(--ink-900);color:var(--card)}.uz-config-btn:disabled{cursor:not-allowed;opacity:var(--opacity-disabled)}.uz-config-danger{border-color:var(--state-human-border);color:var(--state-human)}.uz-config-link{border:0;background:transparent;color:var(--state-ai);padding:0}.uz-config-btn:focus-visible,.uz-config-mini:focus-visible,.uz-config-danger:focus-visible,.uz-config-link:focus-visible,.uz-config-nav button:focus-visible,.uz-config-field input:focus-visible,.uz-config-field select:focus-visible,.uz-config-switch:focus-visible{outline:0;box-shadow:var(--shadow-focus)}.uz-config-note,.uz-config-toast{display:flex;align-items:center;gap:8px;border-bottom:1px solid var(--ink-150);background:var(--card);padding:10px 24px;color:var(--ink-700);font-size:12px}.uz-config-note strong{border-radius:5px;background:var(--state-warn-bg);color:var(--state-warn);padding:2px 8px}.uz-config-toast{border-bottom-color:var(--state-ok-border);background:var(--state-ok-bg);color:var(--state-ok);font-weight:800}.uz-config-body{display:grid;gap:16px;padding:18px 24px 24px}.uz-config-history,.uz-config-panel{overflow:hidden;border:1px solid var(--ink-150);border-radius:10px;background:var(--card)}.uz-config-history-head{border-bottom:1px solid var(--ink-075);padding:11px 15px;color:var(--ink-500);font-size:12px;font-weight:800}.uz-config-history-row,.uz-config-row{display:flex;align-items:center;gap:12px;border-bottom:1px solid var(--ink-075);padding:10px 15px}.uz-config-history-row:last-child,.uz-config-row:last-child{border-bottom:0}.uz-config-version{width:44px;flex:none;color:var(--ink-700);font:800 12px/1 var(--font-data)}.uz-config-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;padding:18px;max-width:680px}.uz-config-field{display:grid;gap:6px}.uz-config-field label,.uz-config-table th{color:var(--ink-500);font-size:11px;font-weight:800}.uz-config-field input,.uz-config-field select{width:100%;min-height:34px;border:1px solid var(--ink-150);border-radius:7px;background:var(--card);color:var(--ink-900);font:700 13px/1 var(--font-body);padding:0 10px}.uz-config-field input{font-family:var(--font-data)}.uz-config-table-wrap{overflow:auto}.uz-config-table{width:100%;min-width:680px;border-collapse:collapse;font-size:13px}.uz-config-table th{background:var(--paper);border-bottom:1px solid var(--ink-150);padding:10px 14px;text-align:left}.uz-config-table td{border-bottom:1px solid var(--ink-075);padding:10px 14px;color:var(--ink-700);vertical-align:middle}.is-mono{font-family:var(--font-data)}.is-strong{color:var(--ink-900);font-weight:800}.uz-config-stack{display:grid;max-width:720px}.uz-config-row-main{min-width:0;flex:1}.uz-config-row-title{font-weight:800;font-size:13px}.uz-config-row-sub{margin-top:3px;color:var(--ink-500);font-size:12px;line-height:1.4}.uz-config-switch{width:40px;height:22px;border:1px solid var(--ink-150);border-radius:var(--radius-pill);background:var(--ink-075);padding:2px;cursor:pointer}.uz-config-switch span{display:block;width:16px;height:16px;border-radius:var(--radius-pill);background:var(--ink-500);transition:transform var(--duration-fast) var(--ease-out)}.uz-config-switch[aria-pressed=true]{background:var(--state-ok-bg);border-color:var(--state-ok-border)}.uz-config-switch[aria-pressed=true] span{background:var(--state-ok);transform:translateX(16px)}.uz-config-connector{display:grid;max-width:580px;gap:12px;padding:18px}.uz-config-kv{display:flex;justify-content:space-between;gap:16px;font-size:13px}.uz-config-kv span:first-child{color:var(--ink-500)}.uz-config-kv strong{font-family:var(--font-data)}.uz-config-actions{display:flex;gap:8px;flex-wrap:wrap;border-top:1px solid var(--ink-075);padding-top:12px}.uz-config-state{display:grid;min-height:260px;place-items:center;padding:24px;text-align:center}.uz-config-state div{max-width:580px;border:1px solid var(--ink-150);border-radius:8px;background:var(--card);padding:20px}.uz-config-state h2{margin:0 0 8px;font-size:16px}.uz-config-state p{margin:0;color:var(--ink-700);font-size:13px;line-height:1.55}@media(max-width:820px){.uz-config-page{display:block;overflow:auto}.uz-config-side{width:auto;border-right:0;border-bottom:1px solid var(--ink-150);padding:10px 12px}.uz-config-side h2{margin:0 0 8px}.uz-config-nav{display:flex;overflow-x:auto;padding-bottom:2px}.uz-config-nav button{flex:0 0 auto}.uz-config-main{overflow:visible}.uz-config-head,.uz-config-note,.uz-config-toast,.uz-config-body{padding-left:12px;padding-right:12px}.uz-config-head-row{align-items:flex-start;flex-direction:column;gap:6px}.uz-config-tools{width:100%;margin-left:0;flex-wrap:wrap}.uz-config-grid{grid-template-columns:1fr;padding:14px}.uz-config-table{min-width:560px}.uz-config-row{align-items:flex-start;flex-direction:column}.uz-config-actions,.uz-config-btn,.uz-config-danger,.uz-config-mini{width:100%}.uz-config-kv{display:grid}.uz-config-history-row{align-items:flex-start;display:grid}.uz-config-version{width:auto}}@media(max-width:420px){.uz-config-body{gap:12px;padding-top:12px}.uz-config-table{min-width:520px}.uz-config-title{font-size:15px}.uz-config-meta{overflow-wrap:anywhere}.uz-config-nav button{height:34px}}`;
