export type TenantViewState = "degraded" | "empty" | "error" | "loading" | "permission";
export type TenantCapabilityKey = "bot" | "business" | "orderApi";

export type TenantCapability = {
  key: TenantCapabilityKey;
  label: string;
};

export interface TenantSeed {
  id: string;
  name: string;
}

export interface NewTenantForm {
  capabilities: Record<TenantCapabilityKey, boolean>;
  language: string;
  line: string;
  name: string;
  template: string;
  timezone: string;
}

export const tenantRuntimeLabels =
  "degraded|mock|read-only|browser-local only|synthetic tenant metrics|no production tenant change|no tenant config persistence|no connector or feature flag change|no audit write".split(
    "|"
  );

export const tenantRuntimeBoundary = tenantRuntimeLabels.join(" · ");

export const tenantMeta = {
  descriptor: "集团级租户管理",
  htmlTruth:
    "owner HTML visible state: table panel renders no tenant names/columns and only an inert 管理 action; 新建租户 modal is reachable.",
  runtime: tenantRuntimeBoundary,
  source: "centralized-synthetic-owner-html-visible-fallback",
  subtitle: "4 个租户",
  title: "租户管理"
} as const;

export const tenantStateCopy: Record<
  Exclude<TenantViewState, "degraded">,
  { body: string; title: string }
> = {
  empty: {
    body: "创建首个租户后，这里会显示租户列表和管理入口。",
    title: "暂无租户记录"
  },
  error: {
    body: "租户列表暂时无法展示，请稍后刷新或联系平台管理员。",
    title: "租户管理暂不可用"
  },
  loading: {
    body: "正在同步集团租户列表和管理入口。",
    title: "正在载入租户"
  },
  permission: {
    body: "当前账号需要集团管理员权限后才能查看租户管理。",
    title: "需要集团管理员权限"
  }
};

export const initialTenantSeeds: TenantSeed[] = [
  { id: "SYN-TENANT-t1", name: "玉珠跨境美妆" },
  { id: "SYN-TENANT-t2", name: "丝路数码" },
  { id: "SYN-TENANT-t3", name: "天净家居" },
  { id: "SYN-TENANT-t4", name: "白桦母婴" }
];

export const tenantCapabilities: TenantCapability[] = [
  { key: "bot", label: "Telegram Bot" },
  { key: "business", label: "Telegram Business" },
  { key: "orderApi", label: "订单 API" }
];

export const ownerHtmlTenantColumns = [
  "租户",
  "成员",
  "AI 成员",
  "渠道连接",
  "订单 connector",
  "默认语言",
  "状态",
  "操作"
];

export const tenantLanguages = [
  "乌兹别克语（拉丁）",
  "乌兹别克语（西里尔）",
  "俄语",
  "中文",
  "英语"
];

export const tenantTimezones = ["UTC+5 塔什干", "UTC+3 莫斯科", "UTC+8 北京"];

export const tenantTemplates = [
  "美妆标准包",
  "3C 标准包",
  "家居通用包",
  "母婴标准包",
  "空白模板"
];

export function createInitialTenantForm(): NewTenantForm {
  return {
    capabilities: { bot: true, business: false, orderApi: false },
    language: "乌兹别克语（拉丁）",
    line: "",
    name: "",
    template: "空白模板",
    timezone: "UTC+5 塔什干"
  };
}

export function readTenantViewState(): TenantViewState {
  const params = new URLSearchParams(location.search);
  const state = params.get("m7TenantState") ?? params.get("state");
  return ["degraded", "empty", "error", "permission", "loading"].includes(state ?? "")
    ? (state as TenantViewState)
    : "degraded";
}

export function isTenantCreateReady(form: NewTenantForm) {
  return form.name.trim().length > 0;
}

export function tenantCreateToast(form: NewTenantForm) {
  const name = form.name.trim();
  return `租户创建已加入预览队列：${name}。租户明细接入后可继续配置渠道与模板。`;
}

export function tenantManageUnavailableToast() {
  return "管理动作需等待租户明细接入。";
}

export const tenantStyles = `.uz-tenant-page{display:flex;height:100%;min-width:0;min-height:0;flex-direction:column;overflow:hidden;background:var(--paper);color:var(--ink-900);font-family:var(--font-body)}.uz-tenant-page *{box-sizing:border-box}.uz-tenant-page [hidden]{display:none!important}.uz-tenant-head{display:flex;flex:none;align-items:center;gap:12px;border-bottom:1px solid var(--ink-150);background:var(--card);padding:14px 24px}.uz-tenant-title{margin:0;font:800 16px/1.35 var(--font-display)}.uz-tenant-subtitle,.uz-tenant-muted{color:var(--ink-500);font-size:12px}.uz-tenant-new-button{display:inline-flex;align-items:center;gap:6px;margin-left:auto;border:0;border-radius:7px;background:var(--ink-900);color:var(--card);cursor:pointer;font:800 12px/1 var(--font-body);padding:9px 13px}.uz-tenant-new-button:focus-visible,.uz-tenant-link-action:focus-visible,.uz-tenant-new-modal button:focus-visible,.uz-tenant-new-modal input:focus-visible,.uz-tenant-new-modal select:focus-visible{outline:0;box-shadow:var(--shadow-focus)}.uz-tenant-note,.uz-tenant-toast{display:flex;align-items:center;gap:8px;border-bottom:1px solid var(--ink-150);background:var(--card);padding:10px 24px;color:var(--ink-700);font-size:12px;line-height:1.45}.uz-tenant-note span,.uz-tenant-toast span{min-width:0;overflow-wrap:anywhere}.uz-tenant-note strong{border-radius:5px;background:var(--state-warn-bg);color:var(--state-warn);font-weight:800;padding:2px 8px}.uz-tenant-toast{position:relative;z-index:var(--z-toast);border-bottom-color:var(--state-ok-border);background:var(--state-ok-bg);color:var(--state-ok);font-weight:800}.uz-tenant-scroll{flex:1;min-width:0;min-height:0;overflow:auto;padding:18px 24px;background:var(--paper)}.uz-tenant-table-panel{width:100%;min-width:0;max-width:100%;overflow:auto;border:1px solid var(--ink-150);border-radius:10px;background:var(--card)}.uz-tenant-table{width:100%;min-width:880px;border-collapse:collapse;font-size:13px}.uz-tenant-table tr{border-bottom:1px solid var(--ink-075)}.uz-tenant-management-cell{height:67px;padding:12px 14px;text-align:right;vertical-align:middle}.uz-tenant-link-action{border:0;background:transparent;color:var(--state-ai);cursor:pointer;font:800 12px/1 var(--font-body);padding:3px 0}.uz-tenant-source-note{display:flex;align-items:center;gap:6px;margin-top:12px;color:var(--ink-500);font-size:11px;line-height:1.45}.uz-tenant-source-note span{min-width:0;overflow-wrap:anywhere}.uz-tenant-modal-scrim{position:fixed;inset:0;z-index:var(--z-modal);display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--ink-900) 32%,transparent);padding:24px}.uz-tenant-new-modal{width:460px;max-width:100%;overflow:hidden;border-radius:12px;background:var(--card);box-shadow:var(--shadow-overlay)}.uz-tenant-new-body{padding:18px 20px 14px}.uz-tenant-new-body h3{margin:0 0 14px;font:800 16px/1.3 var(--font-display)}.uz-tenant-new-stack{display:flex;flex-direction:column;gap:12px}.uz-tenant-new-two{display:grid;grid-template-columns:1fr 1fr;gap:12px}.uz-tenant-field{display:grid;gap:6px}.uz-tenant-field span,.uz-tenant-new-label{color:var(--ink-500);font-size:11px;font-weight:800}.uz-tenant-field input,.uz-tenant-field select{width:100%;border:1px solid var(--ink-150);border-radius:8px;background:var(--card);color:var(--ink-900);font:500 13px/1.2 var(--font-body);padding:9px 10px}.uz-tenant-field small{color:var(--ink-500);font-size:11px;line-height:1.45}.uz-tenant-new-section{display:grid;gap:6px}.uz-tenant-cap-chips{display:flex;gap:8px;flex-wrap:wrap}.uz-tenant-cap-chip{border:1px solid var(--ink-150);border-radius:7px;background:var(--ink-075);color:var(--ink-500);cursor:pointer;font:800 12px/1 var(--font-body);padding:7px 11px}.uz-tenant-cap-chip.is-on{border-color:var(--state-ok-border);background:var(--state-ok-bg);color:var(--state-ok)}.uz-tenant-new-foot{display:flex;justify-content:flex-end;gap:8px;border-top:1px solid var(--ink-075);background:var(--paper);padding:12px 20px}.uz-tenant-secondary,.uz-tenant-primary{border-radius:7px;cursor:pointer;font:800 13px/1 var(--font-body);padding:9px 16px}.uz-tenant-secondary{border:1px solid var(--ink-150);background:var(--card);color:var(--ink-700)}.uz-tenant-primary{border:0;background:var(--ink-900);color:var(--card)}.uz-tenant-primary:disabled{cursor:not-allowed;background:var(--ink-150);color:var(--ink-300)}.uz-tenant-state{display:grid;flex:1;min-height:260px;place-items:center;padding:24px;text-align:center}.uz-tenant-state div{max-width:580px;border:1px solid var(--ink-150);border-radius:8px;background:var(--card);padding:20px}.uz-tenant-state h2{margin:0 0 8px;font-size:16px}.uz-tenant-state p{margin:0;color:var(--ink-700);font-size:13px;line-height:1.55}@media(max-width:720px){.uz-tenant-page{width:100vw;max-width:100vw}.uz-tenant-head,.uz-tenant-note,.uz-tenant-toast,.uz-tenant-scroll{padding-left:12px;padding-right:12px}.uz-tenant-scroll{width:100%;max-width:100%}.uz-tenant-head{align-items:flex-start;flex-wrap:wrap;gap:8px}.uz-tenant-new-button{margin-left:0}.uz-tenant-management-cell{height:67px}.uz-tenant-source-note{align-items:flex-start}.uz-tenant-modal-scrim{align-items:flex-start;padding:12px}.uz-tenant-new-two{grid-template-columns:1fr}.uz-tenant-new-body,.uz-tenant-new-foot{padding-left:12px;padding-right:12px}}`;
