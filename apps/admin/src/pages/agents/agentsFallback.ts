export const capabilityDefs = [
  ["tutorial", "教程"],
  ["vision", "截图"],
  ["quote", "报价"],
  ["order_read", "订单查询"],
  ["business_draft", "Business 草稿"]
] as const;

export const runtimeLabels =
  "degraded|mock|read-only|not production member metrics|no production persona publish|local action only".split(
    "|"
  );

export type AgentFilter = "ai" | "all" | "human";
export type AgentStatus = "breaker" | "estop" | "manual" | "online";
export type AgentViewState = "degraded" | "empty" | "error" | "loading" | "permission";
export type CapabilityKey = (typeof capabilityDefs)[number][0];
export type PersonaGate = "idle" | "pass" | "running";

type VersionSeed = [string, string, string];

export const initialAgents = [
  member(
    "SYN-AI-MEMBER-PRIMARY",
    "玉珠客服 · 主理",
    "报价 / 售后 / 教程",
    "online",
    "412",
    "¥18.4",
    "2.1%",
    "v8",
    ["tutorial", "vision", "quote", "order_read", "business_draft"],
    [
      ["v8", "06-20", "增强乌语拉丁报价口径"],
      ["v7", "05-30", "补充孕期禁忌引导"],
      ["v6", "05-02", "评测未通过 · 未发布"]
    ]
  ),
  member(
    "SYN-AI-MEMBER-QUOTE",
    "报价助手",
    "报价专用",
    "manual",
    "0",
    "¥0",
    "—",
    "v3",
    ["quote", "order_read"],
    [
      ["v3", "06-10", "报价精度优化"],
      ["v2", "05-15", "初版"]
    ]
  ),
  member(
    "SYN-AI-MEMBER-NIGHT",
    "夜间值守",
    "兜底 · 教程/订单",
    "breaker",
    "63",
    "¥2.7",
    "8.4%",
    "v2",
    ["tutorial", "order_read"],
    [
      ["v2", "04-28", "夜间兜底话术"],
      ["v1", "03-20", "初版"]
    ]
  )
];

export const humanMembers = [
  ["韩", "韩雪", "运营负责人", "在线", "ok", "3", "47"],
  ["李", "李航", "客服", "在线", "ok", "5", "82"],
  ["王", "王敏", "知识维护", "离开", "warn", "0", "12"]
] as const;

export function readAgentViewState(): AgentViewState {
  const state = new URLSearchParams(location.search).get("m7AgentState");
  return ["empty", "error", "loading", "permission"].includes(state ?? "")
    ? (state as AgentViewState)
    : "degraded";
}

export function statusTone(status: AgentStatus) {
  if (status === "online") return ["在线", "ok"] as const;
  if (status === "manual") return ["手动离线", "neutral"] as const;
  if (status === "estop") return ["已急停", "off"] as const;
  return ["熔断离线", "danger"] as const;
}

export function gateTone(gate: PersonaGate) {
  if (gate === "running") return ["评测运行中", "info"] as const;
  if (gate === "pass") return ["评测通过 · 可本地预览发布", "ok"] as const;
  return ["草稿已修改 · 需运行评测", "warn"] as const;
}

function member(
  id: string,
  name: string,
  role: string,
  status: AgentStatus,
  today: string,
  cost: string,
  feedback: string,
  current: string,
  enabled: CapabilityKey[],
  versions: VersionSeed[]
) {
  return {
    capabilities: Object.fromEntries(
      capabilityDefs.map(([key]) => [key, enabled.includes(key)])
    ) as Record<CapabilityKey, boolean>,
    cost,
    feedback,
    id,
    name,
    role,
    status,
    today,
    version: current,
    versions: versions.map(([version, date, note]) => ({
      date,
      note,
      text: `Synthetic persona ${version}: ${note}. degraded mock read-only local preview only.`,
      version
    }))
  };
}

export type AiMember = ReturnType<typeof member>;

export const agentStyles = `.uz-agent-page{display:flex;height:100%;min-height:0;flex-direction:column;overflow:hidden;background:var(--paper);color:var(--ink-900);font-family:var(--font-body)}.uz-agent-page *{box-sizing:border-box}.uz-agent-head{display:flex;flex:none;align-items:center;gap:12px;flex-wrap:wrap;border-bottom:1px solid var(--ink-150);background:var(--card);padding:14px 24px}.uz-agent-title{margin:0;font:800 16px/1.35 var(--font-display)}.uz-agent-desc,.uz-agent-muted{color:var(--ink-500);font-size:12px}.uz-agent-filters{display:flex;gap:6px;margin-left:auto}.uz-agent-filter,.uz-agent-btn,.uz-agent-chip{border:1px solid var(--ink-150);border-radius:7px;background:var(--card);color:var(--ink-700);cursor:pointer;font:700 12px/1 var(--font-body);padding:7px 11px}.uz-agent-filter[aria-pressed=true],.uz-agent-btn--primary{border-color:var(--ink-900);background:var(--ink-900);color:var(--card)}.uz-agent-btn--danger{border-color:var(--state-human);background:var(--state-human);color:var(--card)}.uz-agent-btn:disabled{cursor:not-allowed;opacity:.45}.uz-agent-scroll{flex:1;min-height:0;overflow:auto;padding:16px 24px 24px}.uz-agent-note,.uz-agent-toast{display:flex;align-items:center;gap:8px;border-bottom:1px solid var(--ink-150);background:var(--card);padding:10px 24px;color:var(--ink-700);font-size:12px}.uz-agent-note span:first-child,.uz-agent-badge{border-radius:5px;padding:2px 8px;font-weight:800}.uz-agent-note span:first-child,.uz-agent-badge--warn{background:var(--state-warn-bg);color:var(--state-warn)}.uz-agent-alert{display:flex;align-items:center;gap:8px;border:1px solid var(--state-human-border);border-radius:8px;margin-bottom:14px;background:var(--state-human-bg);color:var(--state-human);font-size:12px;font-weight:800;padding:10px 12px}.uz-agent-toast{border-bottom-color:var(--state-ok-border);background:var(--state-ok-bg);color:var(--state-ok);font-weight:800}.uz-agent-section-title{margin:0 0 10px;color:var(--ink-300);font-size:11px;font-weight:800;letter-spacing:.08em}.uz-agent-card-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:14px;margin-bottom:22px}.uz-agent-card{display:grid;gap:12px;border:1px solid var(--ink-150);border-radius:10px;background:var(--card);padding:15px}.uz-agent-card-head,.uz-agent-actions,.uz-agent-stats,.uz-agent-caps,.uz-agent-person,.uz-agent-version-head{display:flex;align-items:center;gap:9px}.uz-agent-avatar{display:grid;place-items:center;flex:none;width:38px;height:38px;border-radius:9px;background:var(--state-ai-bg);color:var(--state-ai)}.uz-agent-card-title{display:grid;gap:2px;min-width:0;flex:1}.uz-agent-card-title strong{font-size:14px}.uz-agent-card-title span{color:var(--ink-500);font-size:11px}.uz-agent-badge--ok{background:var(--state-ok-bg);color:var(--state-ok)}.uz-agent-badge--danger{background:var(--state-human-bg);color:var(--state-human)}.uz-agent-badge--info{background:var(--state-ai-bg);color:var(--state-ai)}.uz-agent-badge--neutral,.uz-agent-badge--off{background:var(--ink-075);color:var(--ink-700)}.uz-agent-caps{flex-wrap:wrap}.uz-agent-chip{display:inline-flex;align-items:center;gap:5px;padding:5px 9px}.uz-agent-chip[aria-pressed=true]{border-color:var(--state-ok-border);background:var(--state-ok-bg);color:var(--state-ok)}.uz-agent-chip-dot{width:6px;height:6px;border-radius:999px;background:currentColor}.uz-agent-stats{border-block:1px solid var(--ink-075);padding:10px 0}.uz-agent-stat{flex:1;min-width:0}.uz-agent-stat span{display:block;color:var(--ink-500);font-size:10px}.uz-agent-stat strong,.uz-agent-mono{font-family:var(--font-data)}.uz-agent-actions{flex-wrap:wrap}.uz-agent-actions .uz-agent-btn:last-child{margin-left:auto}.uz-agent-table-wrap{overflow:auto;border:1px solid var(--ink-150);border-radius:10px;background:var(--card)}.uz-agent-table{width:100%;min-width:560px;border-collapse:collapse}.uz-agent-table th{border-bottom:1px solid var(--ink-150);background:var(--paper);color:var(--ink-500);font:800 11px/1.2 var(--font-body);padding:10px 14px;text-align:left}.uz-agent-table td{border-bottom:1px solid var(--ink-075);padding:11px 14px;font-size:13px}.uz-agent-person{font-weight:800}.uz-agent-person span{display:grid;place-items:center;width:26px;height:26px;border-radius:999px;background:var(--ink-075);color:var(--ink-700);font-size:11px}.uz-agent-state{display:grid;flex:1;min-height:260px;place-items:center;padding:24px;text-align:center}.uz-agent-state div{max-width:540px;border:1px solid var(--ink-150);border-radius:8px;background:var(--card);padding:20px}.uz-agent-state h2{margin:0 0 8px;font-size:16px}.uz-agent-state p{margin:0;color:var(--ink-700);font-size:13px;line-height:1.55}.uz-agent-scrim{position:fixed;inset:0;z-index:var(--z-modal);display:flex;justify-content:flex-end;background:rgb(26 29 33 / 36%)}.uz-agent-drawer{display:flex;width:560px;max-width:92vw;min-height:0;flex-direction:column;background:var(--card);box-shadow:var(--shadow-overlay)}.uz-agent-drawer-head,.uz-agent-drawer-foot{display:flex;flex:none;align-items:center;gap:8px;border-bottom:1px solid var(--ink-150);padding:15px 18px}.uz-agent-drawer-foot{justify-content:flex-end;border-top:1px solid var(--ink-150);border-bottom:0}.uz-agent-drawer-body{display:grid;gap:12px;flex:1;min-height:0;overflow:auto;padding:16px 18px}.uz-agent-drawer h3{margin:0;font:800 15px/1.3 var(--font-display)}.uz-agent-close{margin-left:auto;border:0;background:transparent;color:var(--ink-500);cursor:pointer;font-size:20px}.uz-agent-textarea{width:100%;min-height:150px;resize:vertical;border:1px solid var(--ink-150);border-radius:8px;background:var(--paper);color:var(--ink-900);font:500 13px/1.6 var(--font-body);padding:10px 12px}.uz-agent-version{display:grid;gap:6px;border:1px solid var(--ink-150);border-radius:8px;padding:10px 12px}.uz-agent-version-head{flex-wrap:wrap}.uz-agent-version-head time{margin-left:auto;color:var(--ink-500);font-family:var(--font-data);font-size:11px}@media(max-width:720px){.uz-agent-head,.uz-agent-note,.uz-agent-toast,.uz-agent-scroll{padding-left:12px;padding-right:12px}.uz-agent-filters{width:100%;margin-left:0}.uz-agent-filter{flex:1}.uz-agent-card-grid{grid-template-columns:1fr}.uz-agent-actions{align-items:stretch;flex-direction:column}.uz-agent-actions .uz-agent-btn:last-child{margin-left:0}.uz-agent-drawer{width:100%;max-width:100%}.uz-agent-drawer-foot{align-items:stretch;flex-direction:column}.uz-agent-drawer-foot .uz-agent-btn{width:100%}}`;
