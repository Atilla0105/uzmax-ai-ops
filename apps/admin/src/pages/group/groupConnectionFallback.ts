export type ConnectionViewState =
  | "degraded"
  | "empty"
  | "error"
  | "loading"
  | "permission";
export type ConnectionTone = "danger" | "info" | "neutral" | "ok" | "warn";
export type ConnectionIconKey = "bot" | "briefcase" | "plugZap" | "upload";

export interface ConnectionCard {
  adr: string;
  adrVerdict: string;
  desc: string;
  enabled: boolean;
  health: string;
  healthTone: ConnectionTone;
  icon: ConnectionIconKey;
  id: string;
  recentError: string;
  spike: string;
  tenantCount: string;
  tenantList: string[];
  title: string;
}

export const connectionRuntimeLabels =
  "degraded|mock|read-only|browser-local only|synthetic health|no production connector change|no real connection test|no audit write".split(
    "|"
  );

export const connectionMeta = {
  descriptor: "集团级 · mock/degraded · read-only",
  runtime: connectionRuntimeLabels.join(" · "),
  source: "centralized-synthetic-owner-fixture",
  subtitle: "集团级连接类型 · 启停/测试本地预览 · browser-local only",
  title: "连接中心"
} as const;

export const connectionCards: ConnectionCard[] = [
  card(
    "tgbot",
    "Telegram Bot",
    "bot",
    "正常",
    "ok",
    "无",
    "标准接入",
    "",
    "",
    true,
    "Bot webhook 接入 · 自动/草稿双模"
  ),
  card(
    "tgbiz",
    "Telegram Business",
    "briefcase",
    "部分可行",
    "warn",
    "账号 B 绑定失败 · 2小时前",
    "ADR-B01：部分可行",
    "ADR-B01",
    "部分可行",
    true,
    "Business 账号 · 人工外部回复同步",
    ["玉珠跨境美妆", "丝路数码"]
  ),
  card(
    "orderapi",
    "订单 API",
    "plugZap",
    "不可用",
    "danger",
    "AllProvidersDown · 22分钟前",
    "ADR-B02：无可用 API",
    "ADR-B02",
    "无可用 API",
    false,
    "实时订单查询 · 主路径已降级为导入兜底",
    ["玉珠跨境美妆"]
  ),
  card(
    "import",
    "导入兜底",
    "upload",
    "正常",
    "ok",
    "无",
    "主路径（无 API 时）",
    "",
    "",
    true,
    "CSV / Excel 批量导入 · 快照查询"
  )
];

export function readConnectionViewState(): ConnectionViewState {
  const params = new URLSearchParams(location.search);
  const state = params.get("m7ConnectionState") ?? params.get("state");
  return ["degraded", "empty", "error", "loading", "permission"].includes(state ?? "")
    ? (state as ConnectionViewState)
    : "degraded";
}

export function connectionToggleToast(card: ConnectionCard, enabled: boolean) {
  const state = enabled ? "mock enabled" : "mock disabled";
  return `browser-local only: ${card.title} 本地预览已切换（${state}）; no production connector change, no real connection test, no audit write.`;
}

export function connectionTestToast(card: ConnectionCard) {
  return `browser-local only: ${card.title} 复测完成（synthetic test finished）; no production connector change, no real connection test, no audit write.`;
}

export function toneLabel(tone: ConnectionTone) {
  if (tone === "danger") return "danger";
  if (tone === "warn") return "warn";
  if (tone === "ok") return "ok";
  if (tone === "info") return "info";
  return "neutral";
}

function card(
  key: string,
  title: string,
  icon: ConnectionIconKey,
  health: string,
  healthTone: ConnectionTone,
  recentError: string,
  spike: string,
  adr: string,
  adrVerdict: string,
  enabled: boolean,
  desc: string,
  tenantList = ["玉珠跨境美妆", "丝路数码", "天净家居", "白桦母婴"]
): ConnectionCard {
  return {
    adr,
    adrVerdict,
    desc,
    enabled,
    health,
    healthTone,
    icon,
    id: `SYN-CONN-${key}`,
    recentError,
    spike,
    tenantCount: `${tenantList.length} 个租户`,
    tenantList,
    title
  };
}

export const connectionStyles = `.uz-connection-page{display:flex;height:100%;min-height:0;flex-direction:column;overflow:hidden;background:var(--paper);color:var(--ink-900);font-family:var(--font-body)}.uz-connection-page *{box-sizing:border-box}.uz-connection-head{display:flex;flex:none;align-items:center;gap:12px;flex-wrap:wrap;border-bottom:1px solid var(--ink-150);background:var(--card);padding:14px 24px}.uz-connection-title{margin:0;font:800 16px/1.35 var(--font-display)}.uz-connection-subtitle,.uz-connection-muted{color:var(--ink-500);font-size:12px}.uz-connection-note,.uz-connection-toast{display:flex;align-items:center;gap:8px;border-bottom:1px solid var(--ink-150);background:var(--card);padding:10px 24px;color:var(--ink-700);font-size:12px;line-height:1.45}.uz-connection-note span,.uz-connection-toast span{min-width:0;overflow-wrap:anywhere}.uz-connection-note strong{border-radius:5px;background:var(--state-warn-bg);color:var(--state-warn);font-weight:800;padding:2px 8px}.uz-connection-toast{border-bottom-color:var(--state-ok-border);background:var(--state-ok-bg);color:var(--state-ok);font-weight:800}.uz-connection-scroll{flex:1;min-height:0;overflow:auto;padding:18px 24px 24px}.uz-connection-list{display:flex;max-width:820px;flex-direction:column;gap:12px}.uz-connection-card{display:flex;align-items:flex-start;gap:14px;border:1px solid var(--ink-150);border-radius:10px;background:var(--card);padding:16px 18px}.uz-connection-icon{display:grid;place-items:center;width:40px;height:40px;flex:none;border-radius:10px;background:var(--ink-075);color:var(--ink-700)}.uz-connection-body{min-width:0;flex:1}.uz-connection-card-head{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:4px}.uz-connection-card-head strong{font-size:14px}.uz-connection-adr{border-radius:5px;background:var(--ink-075);color:var(--ink-500);font:800 10px/1.45 var(--font-data);padding:2px 7px}.uz-connection-desc{margin:0 0 7px;color:var(--ink-500);font-size:12px;line-height:1.45}.uz-connection-meta{display:flex;gap:14px;flex-wrap:wrap;color:var(--ink-500);font-size:11px}.uz-connection-meta strong{color:var(--ink-700);font-weight:800}.uz-connection-mono{font-family:var(--font-data)}.uz-connection-error{color:var(--state-human)}.uz-connection-error.is-clear{color:var(--ink-500)}.uz-connection-tenants{display:flex;gap:6px;flex-wrap:wrap;margin-top:9px}.uz-connection-chip{border-radius:var(--radius-pill);background:var(--ink-075);color:var(--ink-700);font-size:10px;font-weight:700;line-height:1.4;padding:2px 8px}.uz-connection-controls{display:flex;flex:none;flex-direction:column;align-items:flex-end;gap:10px}.uz-connection-switch-row{display:flex;align-items:center;gap:8px}.uz-connection-state-label{font-size:11px;font-weight:800;white-space:nowrap}.uz-connection-state-label.is-on{color:var(--state-ok)}.uz-connection-state-label.is-off{color:var(--ink-500)}.uz-connection-action{display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--ink-150);border-radius:7px;background:var(--card);color:var(--ink-700);cursor:pointer;font:800 12px/1 var(--font-body);padding:7px 12px}.uz-connection-action:hover,.uz-connection-action:focus-visible,.uz-connection-controls .uz-toggle:focus-visible{outline:0;box-shadow:var(--shadow-focus)}.uz-connection-action:disabled{cursor:not-allowed;opacity:var(--opacity-disabled)}.uz-connection-state{display:grid;flex:1;min-height:260px;place-items:center;padding:24px;text-align:center}.uz-connection-state div{max-width:580px;border:1px solid var(--ink-150);border-radius:8px;background:var(--card);padding:20px}.uz-connection-state h2{margin:0 0 8px;font-size:16px}.uz-connection-state p{margin:0;color:var(--ink-700);font-size:13px;line-height:1.55}.uz-connection-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}@media(max-width:720px){.uz-connection-head,.uz-connection-note,.uz-connection-toast,.uz-connection-scroll{padding-left:12px;padding-right:12px}.uz-connection-head{align-items:flex-start;flex-direction:column;gap:6px}.uz-connection-note,.uz-connection-toast{align-items:flex-start;flex-wrap:wrap}.uz-connection-card{display:grid;grid-template-columns:40px minmax(0,1fr);padding:14px}.uz-connection-controls{grid-column:1/-1;align-items:stretch}.uz-connection-switch-row{justify-content:space-between}.uz-connection-action{width:100%;min-height:40px}.uz-connection-meta{gap:7px}.uz-connection-meta>span{width:100%}}`;
