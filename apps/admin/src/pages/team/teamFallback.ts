export type TeamMemberType = "ai" | "human";
export type TeamTab = "members" | "roles";
export type TeamViewState = "degraded" | "empty" | "error" | "loading" | "permission";

export interface TeamMember {
  account: string;
  active: string;
  avBg: string;
  avColor: string;
  cap: number;
  disabled: boolean;
  group: string;
  id: string;
  initial: string;
  langPref: string;
  login: string;
  name: string;
  notifyPref: string;
  roleId: string;
  status: string;
  telegram: boolean;
  today: string;
  type: TeamMemberType;
}

export interface TeamRole {
  builtin: boolean;
  created: string;
  desc: string;
  id: string;
  name: string;
  perms: Record<string, boolean>;
  type: string;
}

export interface PermissionItem {
  k: string;
  label: string;
}

export interface PermissionGroup {
  id: string;
  items: PermissionItem[];
  label: string;
}

export interface InviteDraft {
  email: string;
  group: string;
  name: string;
  roleId: string;
  type: TeamMemberType;
}

export interface RoleEditorDraft {
  desc: string;
  id: string | null;
  mode: "edit" | "new";
  name: string;
  perms: Record<string, boolean>;
}

export const TEAM_MEMBER_TYPES = [
  { label: "人类", value: "human" as const },
  { label: "AI", value: "ai" as const }
] as const;
export const TEAM_NOTIFICATION_PREFS = ["全部", "仅@提及", "免打扰"] as const;

export const TEAM_MEMBER_COLUMNS = [
  "成员",
  "角色",
  "成员类型",
  "分组",
  "在线状态",
  "接待中",
  "今日累计",
  "最近登录"
] as const;

export const TEAM_ROLE_COLUMNS = ["角色", "类型", "说明", "成员数", "创建时间", "操作"] as const;

export const TEAM_PERSISTENCE_WARNING = [
  "degraded",
  "mock",
  "read-only",
  "browser-local only",
  "no production authz write",
  "no team mutation",
  "no invite email send",
  "no Telegram binding change",
  "no audit write"
] as const;

export const PERM_GROUPS: PermissionGroup[] = [
  { id: "conv", label: "对话", items: [{ k: "conv_view", label: "查看会话" }, { k: "conv_reply", label: "人工回复" }, { k: "conv_close", label: "结单 / 转接" }] },
  { id: "cust", label: "客户", items: [{ k: "cust_view", label: "查看客户档案" }, { k: "cust_edit", label: "编辑客户信息 / 标签" }, { k: "cust_export", label: "导出客户数据" }] },
  { id: "order", label: "订单", items: [{ k: "order_view", label: "查看订单" }, { k: "order_import", label: "导入订单快照" }, { k: "order_rollback", label: "回滚导入" }] },
  { id: "kb", label: "知识库", items: [{ k: "kb_view", label: "查看话术 / 知识" }, { k: "kb_edit", label: "编辑话术 / 知识" }, { k: "kb_asset", label: "管理素材库" }] },
  { id: "ai", label: "AI 配置", items: [{ k: "ai_persona", label: "编辑 AI 人设" }, { k: "ai_model", label: "调整模型路由" }, { k: "ai_eval", label: "发起评测" }] },
  { id: "sys", label: "系统配置", items: [{ k: "sys_config", label: "业务 / SLA / 渠道配置" }, { k: "sys_team", label: "成员与角色管理" }, { k: "sys_tenant", label: "租户设置" }] },
  { id: "log", label: "日志", items: [{ k: "log_view", label: "查看操作 / 审计日志" }, { k: "log_export", label: "导出日志" }] }
];

const allPermissionKeys = PERM_GROUPS.flatMap((group) => group.items.map((item) => item.k));
export const allPermissions = (selected: readonly string[] = []) =>
  Object.fromEntries(allPermissionKeys.map((key) => [key, selected.includes(key)])) as Record<string, boolean>;

export const TEAM_DEFAULT_ROLE_EDITOR: Omit<RoleEditorDraft, "id" | "mode"> = {
  desc: "",
  name: "",
  perms: allPermissions()
};

export const teamMembers: TeamMember[] = [
  { id: "m1", initial: "韩", avBg: "#EBF0F9", avColor: "#30518C", name: "韩雪", account: "hanxue@yz.com", roleId: "op_lead", type: "human", group: "运营组", status: "在线", active: "3", today: "47", login: "今天 08:12", disabled: false, telegram: true, notifyPref: "全部", langPref: "系统跟随", cap: 8 },
  { id: "m2", initial: "李", avBg: "#F2F3F4", avColor: "#3F454D", name: "李航", account: "lihang@yz.com", roleId: "cs", type: "human", group: "客服一组", status: "在线", active: "5", today: "82", login: "今天 09:00", disabled: false, telegram: true, notifyPref: "仅@提及", langPref: "系统跟随", cap: 6 },
  { id: "m3", initial: "王", avBg: "#F2F3F4", avColor: "#3F454D", name: "王敏", account: "wangmin@yz.com", roleId: "kb_maint", type: "human", group: "内容组", status: "离开", active: "0", today: "12", login: "今天 10:30", disabled: false, telegram: false, notifyPref: "全部", langPref: "中文", cap: 4 },
  { id: "m4", initial: "玉", avBg: "#EBF0F9", avColor: "#30518C", name: "玉珠客服 · 主理", account: "agent-main", roleId: "ai_role", type: "ai", group: "AI组", status: "在线", active: "18", today: "412", login: "—", disabled: false, telegram: false, notifyPref: "免打扰", langPref: "系统跟随", cap: 50 }
];

export const teamRoles: TeamRole[] = [
  { id: "op_lead", name: "运营负责人", type: "内置", builtin: true, desc: "全部权限，含成员与角色管理、配置与日志", created: "2025-01-10", perms: allPermissions(allPermissionKeys) },
  { id: "cs", name: "客服", type: "内置", builtin: true, desc: "处理会话与客户资料，无配置与团队管理权限", created: "2025-01-10", perms: allPermissions(["conv_view", "conv_reply", "conv_close", "cust_view", "cust_edit", "order_view", "kb_view", "log_view"]) },
  { id: "kb_maint", name: "知识维护", type: "内置", builtin: true, desc: "维护知识库、话术与素材，不处理会话", created: "2025-01-10", perms: allPermissions(["conv_view", "cust_view", "kb_view", "kb_edit", "kb_asset", "log_view"]) },
  { id: "ai_role", name: "AI 主理", type: "内置", builtin: true, desc: "AI 成员默认角色，权限由后台策略统一控制", created: "2025-01-10", perms: allPermissions(["conv_view", "conv_reply", "cust_view", "order_view", "kb_view"]) },
  { id: "viewer", name: "只读观察员", type: "自定义", builtin: false, desc: "仅查看会话、客户与订单，不可操作", created: "2026-05-02", perms: allPermissions(["conv_view", "cust_view", "order_view", "kb_view", "log_view"]) }
];

export const teamMeta = {
  header: "团队",
  source: "local fixture + unpacked team source",
  subtitle: "degraded / mock / read-only / browser-local only"
} as const;

export const teamStateCopy = {
  degraded: { body: "Interactive synthetic team rows only; all role/member actions are browser-local." },
  empty: { body: "browser-local only: empty synthetic fallback. no production authz write, no team mutation, no invite email." },
  error: { body: "browser-local only: team runtime unavailable; local synthetic preview only, no production authz write / no team mutation / no audit write." },
  loading: { body: "browser-local only: loading synthetic team state; no real team mutation or invite email." },
  permission: { body: "browser-local only: permission denied; local synthetic preview only, no authz/write-audit bindings." }
} as const;

export function readTeamViewState(): TeamViewState {
  const params = new URLSearchParams(location.search);
  const state = params.get("m7TeamState") ?? params.get("state");
  return state === "loading" || state === "empty" || state === "error" || state === "permission"
    ? state
    : "degraded";
}

export function makeInviteInitialDraft(roleId: string): InviteDraft {
  return { email: "", group: "", name: "", roleId, type: "human" };
}

export function localTeamToast(message: string) {
  return `browser-local only: ${message} · no production authz write / no team mutation / no invite email / no audit write / no Telegram binding change`;
}

export const teamStyles = `
.uz-team-page{display:flex;min-height:0;height:100%;flex-direction:column;overflow:hidden;background:var(--paper);font-family:var(--font-body);color:var(--ink-900)}
.uz-team-page *{box-sizing:border-box}
.uz-team-head{display:flex;flex:none;flex-direction:column;gap:10px;padding:12px 24px;border-bottom:1px solid var(--ink-150);background:var(--card)}
.uz-team-head-row{display:flex;align-items:center;gap:10px}
.uz-team-title{margin:0;font:700 16px var(--font-display)}
.uz-team-sub{font:400 11px/1.45 var(--font-body);color:var(--ink-500)}
.uz-team-cta{margin-left:auto;padding:7px 11px;border:1px solid var(--ink-900);border-radius:8px;background:var(--ink-900);color:var(--card);font:700 12px}
.uz-team-note{display:flex;flex-wrap:wrap;gap:4px;padding:0 24px 10px;color:var(--state-warn);font-size:11px;line-height:1.45}
.uz-team-note span{border:1px solid var(--state-warn-border);background:var(--state-warn-bg);color:var(--state-warn);border-radius:999px;padding:2px 8px}
.uz-team-tabs{display:flex;gap:8px}
.uz-team-tab{padding:6px 10px;border:1px solid var(--ink-150);background:var(--card);border-radius:8px;font:700 12px;color:var(--ink-600)}
.uz-team-tab[aria-pressed="true"]{color:var(--ink-900);border-color:var(--ink-900);background:var(--paper)}
.uz-team-search-wrap{display:flex;align-items:center;gap:8px;border:1px solid var(--ink-150);border-radius:8px;height:32px;max-width:360px;padding:0 10px}
.uz-team-search-wrap input{border:0;background:transparent;outline:0;min-width:0;width:100%;font:500 12px/1 var(--font-body)}
.uz-team-runtime-note{padding:10px 24px;border-bottom:1px solid var(--ink-150);background:var(--paper);font-size:11px;color:var(--state-warn)}
.uz-team-runtime-note strong{color:var(--state-warn)}
.uz-team-toast{position:relative;z-index:var(--z-toast);margin:8px 24px;padding:8px 12px;border-radius:8px;border:1px solid var(--state-ok-border);background:var(--state-ok-bg);color:var(--state-ok);font:700 12px}
.uz-team-scroll{flex:1;min-height:0;overflow:auto;padding:14px 24px 16px}
.uz-team-table-wrap{overflow:auto;border:1px solid var(--ink-150);border-radius:10px;background:var(--card)}
.uz-team-table{width:100%;min-width:920px;border-collapse:collapse;font-size:13px}
.uz-team-table th,.uz-team-table td{padding:10px 12px;border-bottom:1px solid var(--ink-075)}
.uz-team-table th{font:700 11px var(--font-body);text-align:left;color:var(--ink-500);white-space:nowrap;border-bottom-color:var(--ink-150)}
.uz-team-table td{color:var(--ink-700)}
.uz-team-row{cursor:pointer}
.uz-team-row:hover,.uz-team-row:focus-visible{background:color-mix(in srgb,var(--ink-075) 24%,transparent)}
.uz-team-inline{display:flex;align-items:center;gap:8px}
.uz-team-avatar{display:inline-grid;place-items:center;min-width:24px;height:24px;border-radius:7px;font:700 11px}
.uz-team-tag{display:inline-flex;padding:2px 7px;border-radius:6px;background:var(--paper);font:500 11px}
.uz-team-tag--ai{color:var(--state-human);background:var(--state-human-bg)}
.uz-team-mono{font-family:var(--font-data)}
.uz-team-card-list{display:none;gap:8px}
.uz-team-card{display:grid;gap:6px;padding:10px;background:var(--card);border:1px solid var(--ink-150);border-radius:8px}
.uz-team-card-role{display:flex;justify-content:space-between}
.uz-team-empty{display:grid;place-items:center;min-height:150px;border-top:1px solid var(--ink-150);color:var(--ink-500);text-align:center}
.uz-team-empty strong{display:block;margin-bottom:4px;color:var(--ink-900);font:700 13px}
.uz-team-state{display:grid;place-items:center;min-height:260px;padding:24px;text-align:center}
.uz-team-state p{max-width:620px;margin:0;padding:20px;border:1px solid var(--ink-150);border-radius:8px;background:var(--card)}
.uz-team-btn{height:28px;border:1px solid var(--ink-150);background:var(--card);border-radius:7px;padding:0 10px;font:700 12px;color:var(--ink-700)}
.uz-team-btn[disabled]{opacity:.45}
.uz-team-btn--primary{border-color:var(--ink-900);background:var(--ink-900);color:var(--card)}
.uz-team-btn--danger{border-color:var(--state-human);color:var(--state-human)}
.uz-team-switch-row{display:flex;gap:8px;flex-wrap:wrap}
.uz-team-toggle{display:flex;align-items:center;gap:8px}
.uz-team-role-card{display:grid;gap:8px;padding:10px;background:var(--card);border:1px solid var(--ink-150);border-radius:8px}
.uz-team-muted{color:var(--ink-500)}
.uz-team-row-actions{display:flex;gap:8px;flex-wrap:wrap}
.uz-team-modal{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--ink-900) 36%,transparent);z-index:var(--z-modal)}
.uz-team-modal-card{width:min(560px,calc(100vw - 40px));max-height:88vh;overflow:auto;background:var(--card);border:1px solid var(--ink-150);border-radius:10px;padding:16px;display:grid;gap:10px}
.uz-team-modal-card label{font-size:11px;color:var(--ink-500);font-weight:700}
.uz-team-modal-card input,.uz-team-modal-card select{width:100%;border:1px solid var(--ink-150);border-radius:8px;padding:9px 10px;background:var(--paper)}
.uz-team-modal-scroll{max-height:250px;overflow:auto;display:grid;gap:10px;padding-right:2px}
.uz-team-chips-wrap legend{margin-bottom:4px;font-weight:700;color:var(--ink-500)}
.uz-team-chip{border-radius:999px;padding-inline:10px}
.uz-team-drawer-scrim{position:fixed;inset:0;display:flex;justify-content:flex-end;background:color-mix(in srgb,var(--ink-900) 36%,transparent)}
.uz-team-drawer-card{width:min(420px,100vw);height:100%;display:flex;flex-direction:column;background:var(--card);box-shadow:var(--shadow-overlay)}
.uz-team-drawer-head,.uz-team-drawer-body{display:grid;gap:10px;padding:14px}
.uz-team-drawer-head{border-bottom:1px solid var(--ink-150)}
.uz-team-drawer-row{display:grid;gap:2px;padding:6px 0;border-bottom:1px solid var(--ink-075)}
.uz-team-drawer-foot{padding:14px;border-top:1px solid var(--ink-150)}
@media (max-width:840px){.uz-team-table-wrap{display:none}.uz-team-card-list{display:grid}}
@media (max-width:420px){.uz-team-head{padding:10px}.uz-team-head-row{flex-wrap:wrap}.uz-team-runtime-note,.uz-team-toast,.uz-team-scroll{padding-left:10px;padding-right:10px}.uz-team-modal{align-items:flex-end}.uz-team-modal-card{width:100%;max-height:95vh;border-radius:10px 10px 0 0}}
`;
