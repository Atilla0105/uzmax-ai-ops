export type TenantViewState = "degraded" | "empty" | "error" | "loading" | "permission";
export type TenantTone = "danger" | "neutral" | "ok" | "warn";
export type TenantCapabilityKey = "bot" | "business" | "orderApi";

export type TenantCapability = { key: TenantCapabilityKey; label: string };

export interface TenantCard {
  ai: number;
  capabilities: Record<TenantCapabilityKey, boolean>;
  connection: string;
  connectionTone: TenantTone;
  disabled: boolean;
  disabledAt: string;
  disableReason: string;
  dotTone: TenantTone;
  id: string;
  language: string;
  line: string;
  members: number;
  name: string;
  status: string;
  statusTone: TenantTone;
  template: string;
  timezone: string;
}

export const tenantRuntimeLabels =
  "degraded|mock|read-only|browser-local only|synthetic tenant metrics|no production tenant change|no tenant config persistence|no connector or feature flag change|no audit write".split(
    "|"
  );

export const tenantMeta = {
  descriptor: "集团级 · mock/degraded · read-only",
  runtime: tenantRuntimeLabels.join(" · "),
  source: "centralized-synthetic-owner-fixture",
  subtitle: "4 个租户 · 创建 / 停用仅本地预览 · no audit write",
  title: "租户管理"
} as const;

export const tenantCapabilities: TenantCapability[] = [
  { key: "bot", label: "Telegram Bot" },
  { key: "business", label: "Telegram Business" },
  { key: "orderApi", label: "订单 API" }
];

// prettier-ignore
export const tenantLanguages = ["乌兹别克语（拉丁）", "乌兹别克语（西里尔）", "俄语", "中文"];

export const tenantTimezones = ["UTC+5 塔什干", "UTC+3 莫斯科", "UTC+8 北京"];

// prettier-ignore
type TenantSeed = [string, string, string, TenantTone, number, number, string, TenantTone, boolean, boolean, string, string, string, string, TenantTone, boolean?];
// prettier-ignore
const tenantSeeds: TenantSeed[] = [
  ["t1", "玉珠跨境美妆", "美妆 · 中亚", "ok", 8, 3, "降级", "warn", true, false, "乌兹别克语（拉丁）", "UTC+5 塔什干", "美妆标准包", "运行中", "ok"],
  ["t2", "丝路数码", "3C · 俄语区", "warn", 12, 4, "正常", "ok", true, false, "俄语", "UTC+3 莫斯科", "3C 标准包", "降级", "warn"],
  ["t3", "天净家居", "家居 · 哈萨克", "danger", 5, 2, "故障", "danger", false, false, "俄语", "UTC+5 塔什干", "家居通用包", "需人工", "danger"],
  ["t4", "白桦母婴", "母婴 · 俄语区", "neutral", 6, 2, "正常", "ok", false, false, "俄语", "UTC+3 莫斯科", "母婴标准包", "已停用", "neutral", true]
];

export const initialTenantCards: TenantCard[] = tenantSeeds.map((seed) =>
  tenant(...seed)
);

export function readTenantViewState(): TenantViewState {
  const params = new URLSearchParams(location.search);
  const state = params.get("m7TenantState") ?? params.get("state");
  return ["degraded", "empty", "error", "loading", "permission"].includes(state ?? "")
    ? (state as TenantViewState)
    : "degraded";
}

export function tenantFieldToast(tenant: TenantCard, label: string, value: string) {
  return `browser-local only: ${tenant.name} ${label} -> ${value}; no production tenant change, no tenant config persistence, no audit write.`;
}

export function tenantCapabilityToast(
  tenant: TenantCard,
  capability: TenantCapability,
  enabled: boolean
) {
  const state = enabled ? "enabled" : "disabled";
  return `browser-local only: ${tenant.name} ${capability.label} ${state}; no production tenant change, no connector or feature flag change, no audit write.`;
}

export function tenantDisableToast(tenant: TenantCard, reason: string) {
  return `browser-local only: ${tenant.name} disabled in browser state. reason: ${reason}; no production tenant change, no audit write.`;
}

export function tenantRestoreToast(tenant: TenantCard) {
  return `browser-local only: ${tenant.name} restored in browser state; no production tenant change, no audit write.`;
}

export function toneClass(tone: TenantTone) {
  return `is-${tone}`;
}

export function badgeTone(tone: TenantTone) {
  if (tone === "danger") return "danger";
  if (tone === "warn") return "warn";
  if (tone === "ok") return "ok";
  return "neutral";
}

function tenant(
  key: string,
  name: string,
  line: string,
  dotTone: TenantTone,
  members: number,
  ai: number,
  connection: string,
  connectionTone: TenantTone,
  business: boolean,
  orderApi: boolean,
  language: string,
  timezone: string,
  template: string,
  status: string,
  statusTone: TenantTone,
  disabled = false
): TenantCard {
  const disabledAt = disabled ? "06-28 18:20" : "";
  const disableReason = disabled ? "连续熔断超 24h，待排障" : "";
  return {
    ai,
    capabilities: { bot: true, business, orderApi },
    connection,
    connectionTone,
    disabled,
    disabledAt,
    disableReason,
    dotTone,
    id: `SYN-TENANT-${key}`,
    language,
    line,
    members,
    name,
    status,
    statusTone,
    template,
    timezone
  };
}

export const tenantStyles = `.uz-tenant-page{display:flex;height:100%;min-height:0;flex-direction:column;overflow:hidden;background:var(--paper);color:var(--ink-900);font-family:var(--font-body)}.uz-tenant-page *{box-sizing:border-box}.uz-tenant-head{display:flex;flex:none;align-items:center;gap:12px;flex-wrap:wrap;border-bottom:1px solid var(--ink-150);background:var(--card);padding:14px 24px}.uz-tenant-title{margin:0;font:800 16px/1.35 var(--font-display)}.uz-tenant-subtitle,.uz-tenant-muted{color:var(--ink-500);font-size:12px}.uz-tenant-note,.uz-tenant-toast{display:flex;align-items:center;gap:8px;border-bottom:1px solid var(--ink-150);background:var(--card);padding:10px 24px;color:var(--ink-700);font-size:12px;line-height:1.45}.uz-tenant-note span,.uz-tenant-toast span{min-width:0;overflow-wrap:anywhere}.uz-tenant-note strong{border-radius:5px;background:var(--state-warn-bg);color:var(--state-warn);font-weight:800;padding:2px 8px}.uz-tenant-toast{position:relative;z-index:var(--z-toast);border-bottom-color:var(--state-ok-border);background:var(--state-ok-bg);color:var(--state-ok);font-weight:800}.uz-tenant-scroll{flex:1;min-height:0;overflow:auto;padding:18px 24px 24px}.uz-tenant-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:14px;max-width:1120px}.uz-tenant-card{display:flex;width:100%;min-width:0;flex-direction:column;gap:11px;border:1px solid var(--ink-150);border-radius:10px;background:var(--card);color:var(--ink-900);cursor:pointer;padding:16px;text-align:left}.uz-tenant-card:hover,.uz-tenant-card:focus-visible,.uz-tenant-drawer button:focus-visible,.uz-tenant-drawer select:focus-visible{outline:0;box-shadow:var(--shadow-focus)}.uz-tenant-card.is-disabled{opacity:var(--opacity-muted)}.uz-tenant-card-head{display:flex;align-items:center;gap:9px;min-width:0}.uz-tenant-dot{width:8px;height:8px;flex:none;border-radius:var(--radius-pill);background:var(--state-off)}.uz-tenant-dot.is-ok{background:var(--state-ok)}.uz-tenant-dot.is-warn{background:var(--state-warn)}.uz-tenant-dot.is-danger{background:var(--state-human)}.uz-tenant-card-name{min-width:0;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:15px;font-weight:800}.uz-tenant-line{color:var(--ink-500);font-size:11px;line-height:1.45}.uz-tenant-stats{display:flex;gap:18px;flex-wrap:wrap;color:var(--ink-700);font-size:12px}.uz-tenant-stats span span:first-child{color:var(--ink-500)}.uz-tenant-mono{font-family:var(--font-data);font-weight:800}.uz-tenant-conn.is-ok{color:var(--state-ok)}.uz-tenant-conn.is-warn{color:var(--state-warn)}.uz-tenant-conn.is-danger{color:var(--state-human)}.uz-tenant-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}.uz-tenant-scrim{position:fixed;inset:0;z-index:var(--z-modal);display:flex;justify-content:flex-end;background:color-mix(in srgb,var(--ink-900) 36%,transparent)}.uz-tenant-drawer{display:flex;width:min(440px,100vw);height:100%;min-height:0;flex-direction:column;background:var(--card);box-shadow:var(--shadow-overlay)}.uz-tenant-drawer-head{display:flex;align-items:center;gap:10px;border-bottom:1px solid var(--ink-150);padding:18px 20px}.uz-tenant-drawer-title{display:grid;gap:2px;min-width:0;flex:1}.uz-tenant-drawer-title h3{margin:0;font:800 16px/1.3 var(--font-display)}.uz-tenant-close{display:grid;place-items:center;width:30px;height:30px;border:0;border-radius:7px;background:transparent;color:var(--ink-500);cursor:pointer}.uz-tenant-drawer-body{display:flex;min-height:0;flex:1;flex-direction:column;gap:16px;overflow:auto;padding:18px 20px}.uz-tenant-field-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.uz-tenant-field{display:grid;gap:6px}.uz-tenant-field span,.uz-tenant-section-label{color:var(--ink-500);font-size:11px;font-weight:800}.uz-tenant-field select{width:100%;border:1px solid var(--ink-150);border-radius:8px;background:var(--card);color:var(--ink-900);font:500 13px/1.2 var(--font-body);padding:9px 10px}.uz-tenant-cap-list{display:grid;gap:8px}.uz-tenant-cap{display:flex;align-items:center;gap:10px;border:1px solid var(--ink-150);border-radius:8px;padding:9px 10px}.uz-tenant-cap strong{flex:1;font-size:13px}.uz-tenant-cap span{color:var(--ink-500);font-size:11px}.uz-tenant-disabled-note{border:1px solid var(--state-human-border);border-radius:8px;background:var(--state-human-bg);color:var(--state-human);font-size:12px;line-height:1.55;padding:10px 12px}.uz-tenant-drawer-foot{flex:none;border-top:1px solid var(--ink-150);background:var(--paper);padding:12px 20px}.uz-tenant-action{display:inline-flex;align-items:center;justify-content:center;gap:6px;width:100%;border:1px solid var(--state-human-border);border-radius:8px;background:var(--card);color:var(--state-human);cursor:pointer;font:800 13px/1 var(--font-body);padding:10px 14px}.uz-tenant-action--restore{border-color:var(--state-ok-border);background:var(--state-ok-bg);color:var(--state-ok)}.uz-tenant-state{display:grid;flex:1;min-height:260px;place-items:center;padding:24px;text-align:center}.uz-tenant-state div{max-width:580px;border:1px solid var(--ink-150);border-radius:8px;background:var(--card);padding:20px}.uz-tenant-state h2{margin:0 0 8px;font-size:16px}.uz-tenant-state p{margin:0;color:var(--ink-700);font-size:13px;line-height:1.55}@media(max-width:720px){.uz-tenant-head,.uz-tenant-note,.uz-tenant-toast,.uz-tenant-scroll{padding-left:12px;padding-right:12px}.uz-tenant-head{align-items:flex-start;flex-direction:column;gap:6px}.uz-tenant-grid{grid-template-columns:1fr}.uz-tenant-card-name{white-space:normal}.uz-tenant-stats{gap:8px}.uz-tenant-stats>span{width:100%}.uz-tenant-scrim{align-items:stretch}.uz-tenant-drawer{width:100vw}.uz-tenant-field-grid{grid-template-columns:1fr}.uz-tenant-drawer-head,.uz-tenant-drawer-body,.uz-tenant-drawer-foot{padding-left:12px;padding-right:12px}}`;
