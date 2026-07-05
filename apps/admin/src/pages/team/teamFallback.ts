import { useEffect, useMemo, useRef, useState } from "react";

export type TeamMemberType = "ai" | "human";
export type TeamTab = "members" | "roles";
export type TeamViewState = "degraded" | "empty" | "error" | "loading" | "permission";
type MemberTextKey =
  | "account"
  | "active"
  | "group"
  | "id"
  | "initial"
  | "langPref"
  | "login"
  | "name"
  | "notifyPref"
  | "roleId"
  | "status"
  | "today";
export type TeamMember = Record<MemberTextKey, string> & {
  cap: number;
  disabled: boolean;
  telegram: boolean;
  type: TeamMemberType;
};
export type TeamRole = Record<"created" | "desc" | "id" | "name" | "type", string> & {
  builtin: boolean;
  perms: Record<string, boolean>;
};
export type InviteDraft = Record<"email" | "group" | "name" | "roleId", string> & {
  type: TeamMemberType;
};
export type RoleEditorDraft = Record<"desc" | "name", string> & {
  id: string | null;
  mode: "edit" | "new";
  perms: Record<string, boolean>;
};
export type PermissionGroup = {
  id: string;
  items: { k: string; label: string }[];
  label: string;
};

export const TEAM_MEMBER_TYPES = [
  { label: "人类", value: "human" as const },
  { label: "AI", value: "ai" as const }
] as const;
export const TEAM_NOTIFICATION_PREFS = ["全部", "仅@提及", "免打扰"] as const;
// prettier-ignore
export const TEAM_MEMBER_COLUMNS = ["成员", "角色", "成员类型", "分组", "在线状态", "接待中", "今日累计", "最近登录"] as const;
// prettier-ignore
export const TEAM_ROLE_COLUMNS = ["角色", "类型", "说明", "成员数", "创建时间", "操作"] as const;
// prettier-ignore
export const TEAM_PERSISTENCE_WARNING = ["degraded", "mock", "read-only", "browser-local only", "no production authz write", "no team mutation", "no invite email send", "no Telegram binding change", "no audit write"] as const;

// prettier-ignore
const permSeeds = [
  ["conv", "对话", [["conv_view", "查看会话"], ["conv_reply", "人工回复"], ["conv_close", "结单 / 转接"]]],
  ["cust", "客户", [["cust_view", "查看客户档案"], ["cust_edit", "编辑客户信息 / 标签"], ["cust_export", "导出客户数据"]]],
  ["order", "订单", [["order_view", "查看订单"], ["order_import", "导入订单快照"], ["order_rollback", "回滚导入"]]],
  ["kb", "知识库", [["kb_view", "查看话术 / 知识"], ["kb_edit", "编辑话术 / 知识"], ["kb_asset", "管理素材库"]]],
  ["ai", "AI 配置", [["ai_persona", "编辑 AI 人设"], ["ai_model", "调整模型路由"], ["ai_eval", "发起评测"]]],
  ["sys", "系统配置", [["sys_config", "业务 / SLA / 渠道配置"], ["sys_team", "成员与角色管理"], ["sys_tenant", "租户设置"]]],
  ["log", "日志", [["log_view", "查看操作 / 审计日志"], ["log_export", "导出日志"]]]
] as const;
export const PERM_GROUPS: PermissionGroup[] = permSeeds.map(([id, label, items]) => ({
  id,
  items: items.map(([k, itemLabel]) => ({ k, label: itemLabel })),
  label
}));
const allPermissionKeys = PERM_GROUPS.flatMap((group) =>
  group.items.map((item) => item.k)
);
export const allPermissions = (selected: readonly string[] = []) =>
  Object.fromEntries(
    allPermissionKeys.map((key) => [key, selected.includes(key)])
  ) as Record<string, boolean>;
export const TEAM_DEFAULT_ROLE_EDITOR: Omit<RoleEditorDraft, "id" | "mode"> = {
  desc: "",
  name: "",
  perms: allPermissions()
};

const memberDefaults = { disabled: false, langPref: "系统跟随", notifyPref: "全部" };
// prettier-ignore
export const teamMembers: TeamMember[] = [
  ["m1", "韩", "韩雪", "hanxue@yz.com", "op_lead", "human", "运营组", "在线", "3", "47", "今天 08:12", true, 8],
  ["m2", "李", "李航", "lihang@yz.com", "cs", "human", "客服一组", "在线", "5", "82", "今天 09:00", true, 6],
  ["m3", "王", "王敏", "wangmin@yz.com", "kb_maint", "human", "内容组", "离开", "0", "12", "今天 10:30", false, 4],
  ["m4", "玉", "玉珠客服 · 主理", "agent-main", "ai_role", "ai", "AI组", "在线", "18", "412", "—", false, 50]
].map(
  ([
    id,
    initial,
    name,
    account,
    roleId,
    type,
    group,
    status,
    active,
    today,
    login,
    telegram,
    cap
  ]) => ({
    ...memberDefaults,
    account,
    active,
  cap,
    group,
    id,
    initial,
    login,
    name,
    roleId,
    status,
    telegram,
    today,
    type
  })
) as TeamMember[];
const role = (
  id: string,
  name: string,
  type: string,
  builtin: boolean,
  desc: string,
  keys: readonly string[] = []
) => ({
  builtin,
  created: id === "viewer" ? "2026-05-02" : "2025-01-10",
  desc,
  id,
  name,
  perms: allPermissions(keys.length ? keys : allPermissionKeys),
  type
});
const keys = (value: string) => value.split(" ");
export const teamRoles: TeamRole[] = [
  role("op_lead", "运营负责人", "内置", true, "全部权限，含成员与角色管理、配置与日志"),
  role(
    "cs",
    "客服",
    "内置",
    true,
    "处理会话与客户资料，无配置与团队管理权限",
    keys(
      "conv_view conv_reply conv_close cust_view cust_edit order_view kb_view log_view"
    )
  ),
  role(
    "kb_maint",
    "知识维护",
    "内置",
    true,
    "维护知识库、话术与素材，不处理会话",
    keys("conv_view cust_view kb_view kb_edit kb_asset log_view")
  ),
  role(
    "ai_role",
    "AI 主理",
    "内置",
    true,
    "AI 成员默认角色，权限由后台策略统一控制",
    keys("conv_view conv_reply cust_view order_view kb_view")
  ),
  role(
    "viewer",
    "只读观察员",
    "自定义",
    false,
    "仅查看会话、客户与订单，不可操作",
    keys("conv_view cust_view order_view kb_view log_view")
  )
];

export const teamMeta = {
  header: "团队",
  source: "local fixture + unpacked team source",
  subtitle: "degraded / mock / read-only / browser-local only"
} as const;
export const teamStateCopy = {
  degraded: {
    body: "degraded / mock / read-only / browser-local only: local synthetic team rows; no production authz write / no audit write / no team mutation / no invite email."
  },
  empty: {
    body: "degraded / mock / read-only / browser-local only: empty synthetic fallback; no production authz write / no audit write / no team mutation / no invite email."
  },
  error: {
    body: "degraded / mock / read-only / browser-local only: team runtime unavailable; no production authz write / no audit write / no team mutation / no invite email."
  },
  loading: {
    body: "degraded / mock / read-only / browser-local only: loading synthetic team state; no production authz write / no audit write / no team mutation / no invite email."
  },
  permission: {
    body: "degraded / mock / read-only / browser-local only: permission denied; no production authz write / no audit write / no team mutation / no invite email."
  }
} as const;

export function readTeamViewState(): TeamViewState {
  const state =
    new URLSearchParams(location.search).get("m7TeamState") ??
    new URLSearchParams(location.search).get("state");
  return state === "loading" ||
    state === "empty" ||
    state === "error" ||
    state === "permission"
    ? state
    : "degraded";
}
export const makeInviteInitialDraft = (roleId: string): InviteDraft => ({
  email: "",
  group: "",
  name: "",
  roleId,
  type: "human"
});
export const localTeamToast = (message: string) =>
  `browser-local only: ${message} · no production authz write / no team mutation / no invite email / no audit write / no Telegram binding change`;

const invitedMember = (
  draft: InviteDraft,
  name: string,
  email: string
): TeamMember => ({
  ...memberDefaults,
  account: email,
  active: "0",
  cap: 6,
  group: draft.group || "未分组",
  id: `m-${Date.now()}`,
  initial: name.at(0) ?? "M",
  login: "刚添加",
  name,
  roleId: draft.roleId,
  status: "离线",
  telegram: false,
  today: "0",
  type: draft.type
});
function draftFromRole(
  mode: RoleEditorDraft["mode"],
  roleItem: TeamRole | null = null
): RoleEditorDraft {
  if (mode === "new" || !roleItem)
    return { ...TEAM_DEFAULT_ROLE_EDITOR, id: null, mode };
  return {
    desc: roleItem.desc,
    id: roleItem.id,
    mode,
    name: roleItem.name,
    perms: { ...roleItem.perms }
  };
}
const roleCounts = (members: TeamMember[], roles: TeamRole[]) =>
  members.reduce(
    (acc, member) => ({ ...acc, [member.roleId]: (acc[member.roleId] ?? 0) + 1 }),
    Object.fromEntries(roles.map((item) => [item.id, 0])) as Record<string, number>
  );

// prettier-ignore
export function useTeamPageState() {
  const viewState = readTeamViewState();
  const [members, setMembers] = useState(teamMembers);
  const [roles, setRoles] = useState(teamRoles);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [inviteDraft, setInviteDraft] = useState(makeInviteInitialDraft(teamRoles[0]?.id ?? ""));
  const [tab, setTab] = useState<TeamTab>("members");
  const [search, setSearch] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [roleDraft, setRoleDraft] = useState<RoleEditorDraft | null>(null);
  const [roleToDelete, setRoleToDelete] = useState("");
  const [toast, setToast] = useState("");
  const toastTimer = useRef<number | null>(null);
  const member = useMemo(() => members.find((entry) => entry.id === selectedMemberId) ?? null, [members, selectedMemberId]);
  const roleById = (roleId: string) => roles.find((entry) => entry.id === roleId);
  const filteredMembers = useMemo(() => { const q = search.trim().toLowerCase(); return q ? members.filter((entry) => `${entry.name} ${entry.account} ${entry.group}`.toLowerCase().includes(q)) : members; }, [members, search]);
  const membersByRole = useMemo(() => roleCounts(members, roles), [members, roles]);
  useEffect(() => () => { if (toastTimer.current) window.clearTimeout(toastTimer.current); }, []);
  const showToast = (message: string) => { if (toastTimer.current) window.clearTimeout(toastTimer.current); setToast(localTeamToast(message)); toastTimer.current = window.setTimeout(() => setToast(""), 2400); };
  const patchMember = (id: string, update: (entry: TeamMember) => TeamMember) => setMembers((current) => current.map((entry) => (entry.id === id ? update(entry) : entry)));
  const saveRole = () => {
    if (!roleDraft?.name.trim()) return;
    const savedRole = { builtin: false, created: "今天", desc: roleDraft.desc, id: `r-${Date.now()}`, name: roleDraft.name, perms: { ...roleDraft.perms }, type: "自定义" };
    setRoles((current) => roleDraft.id ? current.map((entry) => (entry.id === roleDraft.id ? { ...entry, desc: roleDraft.desc, name: roleDraft.name, perms: roleDraft.perms } : entry)) : [...current, savedRole]);
    showToast(`${roleDraft.mode === "edit" ? "updated" : "created"} role ${roleDraft.name}`);
    setRoleDraft(null);
  };
  const onInviteSubmit = () => {
    const name = inviteDraft.name.trim();
    const email = inviteDraft.email.trim();
    if (!name || !email) return;
    setMembers((current) => [...current, invitedMember(inviteDraft, name, email)]);
    setInviteOpen(false);
    showToast(`invite added locally: ${name}`);
  };
  return { filteredMembers, inviteDraft, inviteOpen, isDegraded: viewState === "degraded", member, membersByRole, roleById, roleDraft, roleToDelete, roles, search, stateCopy: teamStateCopy[viewState].body, tab, toast, viewState,
    onDeleteRole: (item: TeamRole) => !item.builtin && (membersByRole[item.id] ?? 0) === 0 && setRoleToDelete(item.name),
    onDismissDeleteRole: () => setRoleToDelete(""), onInviteClose: () => setInviteOpen(false),
    onInviteOpenMembers: () => { setInviteDraft(makeInviteInitialDraft(roles[0]?.id ?? "")); setInviteOpen(true); },
    onInviteSubmit, onInviteUpdate: setInviteDraft, onMemberClose: () => setSelectedMemberId(null),
    onNotify: (id: string, pref: string) => { patchMember(id, (entry) => ({ ...entry, notifyPref: pref })); showToast(`notification preference updated for ${members.find((entry) => entry.id === id)?.name ?? "member"}`); },
    onRoleDeleteConfirm: () => { setRoles((current) => current.filter((entry) => entry.name !== roleToDelete)); showToast(`deleted role ${roleToDelete}`); setRoleToDelete(""); },
    onRoleDraftClose: () => setRoleDraft(null), onRoleDraftCreate: () => setRoleDraft(draftFromRole("new")), onRoleDraftEdit: (item: TeamRole) => setRoleDraft(draftFromRole("edit", item)),
    onRoleDraftSave: saveRole, onRoleDraftUpdate: setRoleDraft, onSelectTab: setTab, onSetMember: setSelectedMemberId, onSetSearch: setSearch,
    onSetState: (id: string) => { const target = members.find((entry) => entry.id === id); patchMember(id, (entry) => ({ ...entry, disabled: !entry.disabled })); showToast(target?.disabled ? `restored member ${target.name}` : `disabled member ${target?.name ?? id}`); },
    onTelegram: (id: string) => { const target = members.find((entry) => entry.id === id); patchMember(id, (entry) => ({ ...entry, telegram: !entry.telegram })); showToast(`telegram ${target?.telegram ? "unbound" : "bound"} for ${target?.name ?? id}`); }
  };
}

export const teamStyles = `.uz-team-page{display:flex;min-height:0;height:100%;flex-direction:column;overflow:hidden;background:var(--paper);font-family:var(--font-body);color:var(--ink-900)}.uz-team-page *{box-sizing:border-box}.uz-team-head{display:flex;flex:none;flex-direction:column;gap:10px;padding:12px 24px;border-bottom:1px solid var(--ink-150);background:var(--card)}.uz-team-head-row{display:flex;align-items:center;gap:10px}.uz-team-title{margin:0;font:700 16px var(--font-display)}.uz-team-sub{font:400 11px/1.45 var(--font-body);color:var(--ink-500)}.uz-team-cta{margin-left:auto;padding:7px 11px;border:1px solid var(--ink-900);border-radius:8px;background:var(--ink-900);color:var(--card);font:700 12px}.uz-team-note{display:flex;flex-wrap:wrap;gap:4px;color:var(--state-warn);font-size:11px;line-height:1.45}.uz-team-note span{border:1px solid var(--state-warn-border);background:var(--state-warn-bg);color:var(--state-warn);border-radius:999px;padding:2px 8px}.uz-team-tabs,.uz-team-switch-row,.uz-team-row-actions{display:flex;gap:8px;flex-wrap:wrap}.uz-team-tab,.uz-team-btn{height:28px;border:1px solid var(--ink-150);background:var(--card);border-radius:7px;padding:0 10px;font:700 12px;color:var(--ink-700)}.uz-team-tab[aria-pressed=true],.uz-team-btn--primary{color:var(--card);border-color:var(--ink-900);background:var(--ink-900)}.uz-team-btn--danger{border-color:var(--state-human);color:var(--state-human)}.uz-team-btn[disabled]{opacity:.45}.uz-team-search-wrap{display:flex;align-items:center;gap:8px;border:1px solid var(--ink-150);border-radius:8px;height:32px;max-width:360px;padding:0 10px}.uz-team-search-wrap input{border:0;background:transparent;outline:0;min-width:0;width:100%;font:500 12px/1 var(--font-body)}.uz-team-toast{z-index:var(--z-toast);margin:8px 24px;padding:8px 12px;border-radius:8px;border:1px solid var(--state-ok-border);background:var(--state-ok-bg);color:var(--state-ok);font:700 12px}.uz-team-scroll{flex:1;min-height:0;overflow:auto;padding:14px 24px 16px}.uz-team-table-wrap{overflow:auto;border:1px solid var(--ink-150);border-radius:10px;background:var(--card)}.uz-team-table{width:100%;min-width:920px;border-collapse:collapse;font-size:13px}.uz-team-table th,.uz-team-table td{padding:10px 12px;border-bottom:1px solid var(--ink-075);text-align:left}.uz-team-table th{font:700 11px var(--font-body);color:var(--ink-500);border-bottom-color:var(--ink-150)}.uz-team-table td{color:var(--ink-700)}.uz-team-row{cursor:pointer}.uz-team-row:hover,.uz-team-row:focus-visible{background:color-mix(in srgb,var(--ink-075) 24%,transparent)}.uz-team-inline{display:flex;align-items:center;gap:8px}.uz-team-inline>span:last-child{display:grid;gap:2px}.uz-team-avatar{display:inline-grid;place-items:center;min-width:24px;height:24px;border-radius:7px;font:700 11px}.uz-team-avatar--ai{background:var(--state-ai-bg);color:var(--state-ai)}.uz-team-avatar--human{background:var(--ink-075);color:var(--ink-700)}.uz-team-tag{display:inline-flex;padding:2px 7px;border-radius:6px;background:var(--paper);font:500 11px}.uz-team-tag--ai{color:var(--state-human);background:var(--state-human-bg)}.uz-team-mono{font-family:var(--font-data)}.uz-team-card-list{display:none;gap:8px}.uz-team-card,.uz-team-role-card{display:grid;gap:6px;padding:10px;background:var(--card);border:1px solid var(--ink-150);border-radius:8px;text-align:left}.uz-team-empty{display:grid;place-items:center;min-height:150px;border:1px solid var(--ink-150);background:var(--card);color:var(--ink-500);text-align:center}.uz-team-empty strong{display:block;margin-bottom:4px;color:var(--ink-900);font:700 13px}.uz-team-state{display:grid;place-items:center;min-height:260px;padding:24px;text-align:center}.uz-team-state p{max-width:620px;margin:0;padding:20px;border:1px solid var(--ink-150);border-radius:8px;background:var(--card)}.uz-team-muted{color:var(--ink-500)}.uz-team-toggle{display:flex;align-items:center;gap:8px}.uz-team-modal{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--ink-900) 36%,transparent);z-index:var(--z-modal)}.uz-team-modal-card{width:min(560px,calc(100vw - 40px));max-height:88vh;overflow:auto;background:var(--card);border:1px solid var(--ink-150);border-radius:10px;padding:16px;display:grid;gap:10px}.uz-team-modal-card label{font-size:11px;color:var(--ink-500);font-weight:700}.uz-team-modal-card input,.uz-team-modal-card select{width:100%;border:1px solid var(--ink-150);border-radius:8px;padding:9px 10px;background:var(--paper)}.uz-team-modal-body-scroll{max-height:250px;overflow:auto;display:grid;gap:10px;padding-right:2px}.uz-team-chips-wrap legend{margin-bottom:4px;font-weight:700;color:var(--ink-500)}.uz-team-chip{border-radius:999px;padding-inline:10px}.uz-team-drawer-scrim{position:fixed;inset:0;display:flex;justify-content:flex-end;background:color-mix(in srgb,var(--ink-900) 36%,transparent);z-index:var(--z-modal)}.uz-team-drawer{width:min(420px,100vw);height:100%;display:flex;flex-direction:column;background:var(--card);box-shadow:var(--shadow-overlay)}.uz-team-drawer-head,.uz-team-drawer-body{display:grid;gap:10px;padding:14px}.uz-team-drawer-head{grid-template-columns:auto 1fr auto;border-bottom:1px solid var(--ink-150)}@media (max-width:840px){.uz-team-table-wrap{display:none}.uz-team-card-list{display:grid}}@media (max-width:420px){.uz-team-head{padding:10px}.uz-team-head-row{flex-wrap:wrap}.uz-team-toast,.uz-team-scroll{padding-left:10px;padding-right:10px}.uz-team-modal{align-items:flex-end}.uz-team-modal-card{width:100%;max-height:95vh;border-radius:10px 10px 0 0}}`;
