type TeamMemberType = "ai" | "human";
export type TeamTab = "members" | "roles";
export type TeamViewState = "degraded" | "empty" | "error" | "loading" | "permission";
export type InviteDraft = Record<"email" | "group" | "name" | "roleId", string> & {
  type: TeamMemberType;
};

const roleSeed = [
  "op_lead|运营负责人|内置|全部权限，含成员与角色管理、配置与日志",
  "cs|客服|内置|处理会话与客户资料，无配置与团队管理权限"
];
const memberSeed = [
  "m1|韩|韩雪|hanxue@yz.com|op_lead|human|运营组|在线|3|47|今天 08:12|false|8",
  "m2|李|李航|lihang@yz.com|cs|human|客服一组|已停用|0|82|昨天 18:40|true|6",
  "m3|玉|玉珠客服 · 主理|agent-main|cs|ai|AI组|在线|18|412|—|false|50"
];

export const initialRoles = roleSeed.map((row) => {
  const cells = row.split("|");
  return {
    builtin: true,
    desc: cell(cells, 3),
    id: cell(cells, 0),
    name: cell(cells, 1),
    type: cell(cells, 2)
  };
});
export const initialMembers = memberSeed.map((row) => {
  const cells = row.split("|");
  return {
    account: cell(cells, 3),
    active: cell(cells, 8),
    cap: Number(cell(cells, 12)),
    disabled: cell(cells, 11) === "true",
    group: cell(cells, 6),
    id: cell(cells, 0),
    initial: cell(cells, 1),
    login: cell(cells, 10),
    name: cell(cells, 2),
    roleId: cell(cells, 4),
    status: cell(cells, 7),
    today: cell(cells, 9),
    type: cell(cells, 5)
  };
});
export type TeamMember = (typeof initialMembers)[number];

export const teamRuntimeLabels = [
  "degraded",
  "mock",
  "read-only",
  "browser-local only",
  "no production authz write",
  "no team mutation",
  "no invite email",
  "no Telegram binding change",
  "no audit write"
] as const;
export const teamMemberColumns = [
  "成员",
  "角色",
  "成员类型",
  "分组",
  "在线状态",
  "接待中",
  "今日累计",
  "最近登录"
] as const;
export const teamRoleColumns = ["角色", "类型", "说明", "成员数", "权限状态"] as const;
export const localBoundary =
  "browser-local only; no production authz write; no team mutation; no invite email; no audit write.";

export const emptyInvite = (roleId: string): InviteDraft => ({
  email: "",
  group: "",
  name: "",
  roleId,
  type: "human"
});

export function readTeamViewState(): TeamViewState {
  const params = new URLSearchParams(location.search);
  const state = params.get("m7TeamState") ?? params.get("state");
  return ["loading", "empty", "error", "permission"].includes(state ?? "")
    ? (state as TeamViewState)
    : "degraded";
}

export function stateCopy(state: TeamViewState) {
  return {
    degraded:
      "degraded / mock / read-only: local synthetic team rows; " + localBoundary,
    empty: "empty synthetic fallback: no production team data; " + localBoundary,
    error: "team runtime unavailable: " + localBoundary,
    loading: "loading synthetic team state: visible fallback only; " + localBoundary,
    permission: "permission denied: backend remains authoritative; " + localBoundary
  }[state];
}

export function toneForMember(member: TeamMember) {
  if (member.disabled) return "neutral";
  return member.type === "ai" ? "ai" : "ok";
}

function cell(cells: string[], index: number) {
  return cells[index] ?? "";
}

export const teamStyles = `.uz-team-page{display:flex;width:100%;height:100%;min-width:0;min-height:0;flex-direction:column;overflow:hidden;background:var(--paper);color:var(--ink-900);font-family:var(--font-body)}.uz-team-page *{box-sizing:border-box}.uz-team-head{display:flex;flex:none;flex-direction:column;gap:10px;border-bottom:1px solid var(--ink-150);background:var(--card);padding:14px 24px 0}.uz-team-head-main,.uz-team-tools,.uz-team-person,.uz-team-actions{display:flex;align-items:center;gap:10px;min-width:0}.uz-team-title{margin:0;font:800 16px/1.35 var(--font-display)}.uz-team-muted,.uz-team-tenant{color:var(--ink-500);font-size:12px;line-height:1.45}.uz-team-primary,.uz-team-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:30px;border:1px solid var(--ink-150);border-radius:7px;background:var(--card);color:var(--ink-700);cursor:pointer;font:800 12px/1 var(--font-body);padding:0 11px}.uz-team-primary{margin-left:auto;border-color:var(--ink-900);background:var(--ink-900);color:var(--card)}.uz-team-btn--danger{border-color:var(--state-human-border);background:var(--state-human-bg);color:var(--state-human)}.uz-team-btn--primary,.uz-team-btn[aria-pressed=true]{border-color:var(--ink-900);background:var(--ink-900);color:var(--card)}.uz-team-note{display:flex;flex-wrap:wrap;gap:5px}.uz-team-note span,.uz-team-badge{border-radius:var(--radius-pill);background:var(--state-warn-bg);color:var(--state-warn);font:800 11px/1.35 var(--font-body);padding:2px 8px}.uz-team-search{display:flex;align-items:center;gap:8px;width:320px;max-width:100%;height:32px;border:1px solid var(--ink-150);border-radius:8px;background:var(--paper);padding:0 10px;color:var(--ink-500)}.uz-team-search input{width:100%;min-width:0;border:0;outline:0;background:transparent;color:var(--ink-900);font:500 12px/1 var(--font-body)}.uz-team-tabs{display:flex;gap:2px}.uz-team-tab{border:0;border-bottom:2px solid transparent;background:transparent;color:var(--ink-500);cursor:pointer;font:700 13px/1 var(--font-body);padding:9px 13px}.uz-team-tab[aria-selected=true]{border-bottom-color:var(--ink-900);color:var(--ink-900)}.uz-team-toast{border-bottom:1px solid var(--state-ok-border);background:var(--state-ok-bg);color:var(--state-ok);font:800 12px/1.45 var(--font-body);padding:9px 24px}.uz-team-scroll{flex:1;min-height:0;overflow:auto;padding:18px 24px 24px}.uz-team-table-wrap{max-width:100%;overflow:auto;border:1px solid var(--ink-150);border-radius:10px;background:var(--card)}.uz-team-table{width:100%;min-width:760px;border-collapse:collapse;font-size:13px}.uz-team-table th{border-bottom:1px solid var(--ink-150);background:var(--paper);color:var(--ink-500);font:800 11px/1.25 var(--font-body);padding:10px 14px;text-align:left}.uz-team-table td{border-bottom:1px solid var(--ink-075);color:var(--ink-700);padding:11px 14px;vertical-align:middle}.uz-team-row{cursor:pointer}.uz-team-row:hover,.uz-team-row:focus-visible,.uz-team-btn:focus-visible,.uz-team-primary:focus-visible,.uz-team-search:focus-within,.uz-team-field input:focus-visible,.uz-team-field select:focus-visible{outline:0;box-shadow:var(--shadow-focus)}.uz-team-person-copy{display:grid;gap:2px;min-width:0}.uz-team-person-copy strong,.uz-team-person-copy span{overflow-wrap:anywhere}.uz-team-avatar{display:grid;place-items:center;flex:none;width:26px;height:26px;border-radius:var(--radius-pill);background:var(--ink-075);color:var(--ink-700);font:800 11px/1 var(--font-body)}.uz-team-avatar--ai,.uz-team-badge--ai{background:var(--state-ai-bg);color:var(--state-ai)}.uz-team-badge--ok{background:var(--state-ok-bg);color:var(--state-ok)}.uz-team-badge--neutral{background:var(--ink-075);color:var(--ink-500)}.uz-team-badge--deny,.uz-team-badge--warn{background:var(--state-human-bg);color:var(--state-human)}.uz-team-mono{font-family:var(--font-data)}.uz-team-card-list{display:none;gap:8px}.uz-team-card,.uz-team-role-card{display:grid;width:100%;gap:7px;border:1px solid var(--ink-150);border-radius:8px;background:var(--card);color:var(--ink-900);padding:11px;text-align:left}.uz-team-empty,.uz-team-state{display:grid;place-items:center;min-height:112px;border:1px solid var(--ink-150);border-radius:8px;background:var(--card);color:var(--ink-700);padding:18px;text-align:center}.uz-team-state{min-height:220px;margin:18px 24px}.uz-team-modal,.uz-team-drawer-scrim{position:fixed;inset:0;z-index:var(--z-modal);display:flex;background:color-mix(in srgb,var(--ink-900) 36%,transparent)}.uz-team-modal{align-items:center;justify-content:center}.uz-team-modal-card{display:grid;width:min(420px,calc(100vw - 40px));max-height:88vh;gap:10px;overflow:auto;border:1px solid var(--ink-150);border-radius:10px;background:var(--card);padding:18px}.uz-team-field{display:grid;gap:6px}.uz-team-field span{color:var(--ink-500);font-size:11px;font-weight:800}.uz-team-field input,.uz-team-field select{width:100%;border:1px solid var(--ink-150);border-radius:8px;background:var(--paper);color:var(--ink-900);font:500 13px/1.2 var(--font-body);padding:9px 10px}.uz-team-drawer-scrim{justify-content:flex-end}.uz-team-drawer{display:flex;width:min(360px,100vw);height:100%;min-height:0;flex-direction:column;background:var(--card);box-shadow:var(--shadow-overlay)}.uz-team-drawer-head,.uz-team-drawer-body,.uz-team-drawer-foot{padding:16px 18px}.uz-team-drawer-head{display:flex;gap:11px;border-bottom:1px solid var(--ink-150)}.uz-team-drawer-body{display:flex;min-height:0;flex:1;flex-direction:column;gap:12px;overflow:auto}.uz-team-fact{display:flex;gap:12px;border-bottom:1px solid var(--ink-075);padding:7px 0;font-size:13px}.uz-team-fact span:first-child{width:88px;flex:none;color:var(--ink-500)}.uz-team-drawer-foot{border-top:1px solid var(--ink-150);background:var(--paper)}@media(min-width:901px){.uz-team-page{width:calc(100vw - var(--nav-expanded-width));max-width:calc(100vw - var(--nav-expanded-width))}.uz-app-shell.is-nav-collapsed .uz-team-page{width:calc(100vw - var(--nav-collapsed-width));max-width:calc(100vw - var(--nav-collapsed-width))}}@media(max-width:760px){.uz-team-page,.uz-team-head,.uz-team-toast,.uz-team-scroll{width:100vw;max-width:100vw}.uz-team-head,.uz-team-toast,.uz-team-scroll{padding-left:12px;padding-right:12px}.uz-team-head-main,.uz-team-tools{align-items:flex-start;flex-wrap:wrap}.uz-team-primary{margin-left:0}.uz-team-tools{flex-direction:column}.uz-team-search{width:100%}.uz-team-table-wrap{display:none}.uz-team-card-list{display:grid}.uz-team-modal{align-items:flex-end}.uz-team-modal-card{width:100%;max-height:94vh;border-radius:10px 10px 0 0}.uz-team-drawer{width:100vw}.uz-team-fact{display:grid;gap:3px}.uz-team-fact span:first-child{width:auto}.uz-team-btn,.uz-team-primary{min-height:40px}}`;
