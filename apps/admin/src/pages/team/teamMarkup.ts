import {
  initialRoles,
  stateCopy,
  teamMemberColumns,
  teamRoleColumns,
  teamRuntimeLabels,
  toneForMember,
  type InviteDraft,
  type TeamMember,
  type TeamTab,
  type TeamViewState
} from "./teamFallback";

export function renderTeam(input: {
  counts: Record<string, number>;
  filtered: TeamMember[];
  invite: InviteDraft;
  inviteOpen: boolean;
  member: TeamMember | null;
  roleName: (id: string) => string;
  search: string;
  selectedTenantId: string;
  tab: TeamTab;
  toast: string;
  viewState: TeamViewState;
}) {
  const {
    counts,
    filtered,
    invite,
    inviteOpen,
    member,
    roleName,
    search,
    selectedTenantId,
    tab,
    toast,
    viewState
  } = input;
  const labels = teamRuntimeLabels.map((item) => `<span>${esc(item)}</span>`).join("");
  const tabs = ["members", "roles"]
    .map(
      (id) =>
        `<button aria-selected="${tab === id}" class="uz-team-tab" data-action="tab-${id}" data-testid="m7-team-tab-${id}" role="tab" type="button">${id === "members" ? "成员" : "角色摘要"}</button>`
    )
    .join("");
  const searchBox =
    tab === "members"
      ? `<label class="uz-team-search"><span>搜索</span><input aria-label="搜索成员" data-field="search" data-testid="m7-team-search" placeholder="搜索姓名 / 账号 / 分组" type="search" value="${esc(search)}"></label>`
      : "";
  const header = `<header class="uz-team-head" data-testid="m7-team-header"><div class="uz-team-head-main"><h1 class="uz-team-title">团队</h1><span class="uz-team-tenant">tenant layer · ${esc(selectedTenantId)}</span><button class="uz-team-primary" data-action="open-invite" data-testid="m7-team-primary" type="button">邀请成员</button></div><div class="uz-team-note" data-testid="m7-team-runtime-note">${labels}</div><div class="uz-team-tools">${searchBox}<div aria-label="团队标签页" class="uz-team-tabs" role="tablist">${tabs}</div></div></header>`;
  const body =
    viewState === "degraded"
      ? `<main class="uz-team-scroll">${tab === "members" ? membersHtml(filtered, roleName) : rolesHtml(counts)}</main>`
      : `<main class="uz-team-state" data-testid="m7-team-state-${esc(viewState)}"><p>${esc(stateCopy(viewState))}</p></main>`;
  const overlay = `${inviteOpen ? inviteHtml(invite) : ""}${member ? memberHtml(member, roleName(member.roleId)) : ""}`;
  return `${header}${toast ? `<div aria-live="polite" class="uz-team-toast" data-testid="m7-team-toast" role="status">${esc(toast)}</div>` : ""}${body}${overlay}`;
}

function membersHtml(members: TeamMember[], roleName: (id: string) => string) {
  const head = teamMemberColumns.map((column) => `<th>${esc(column)}</th>`).join("");
  const rows = members
    .map(
      (m) =>
        `<tr class="uz-team-row" data-action="select-member" data-id="${esc(m.id)}" data-testid="m7-team-member-row-${esc(m.id)}" role="button" tabindex="0"><td>${person(m)}</td><td>${esc(roleName(m.roleId))}</td><td>${typeBadge(m)}</td><td>${esc(m.group)}</td><td><span class="uz-team-badge uz-team-badge--${toneForMember(m)}">${esc(m.disabled ? "权限拒绝 / 已停用" : m.status)}</span></td><td class="uz-team-mono">${esc(m.disabled ? "0" : m.active)}</td><td class="uz-team-mono">${esc(m.today)}</td><td class="uz-team-mono">${esc(m.login)}</td></tr>`
    )
    .join("");
  const cards = members
    .map(
      (m) =>
        `<button class="uz-team-card" data-action="select-member" data-id="${esc(m.id)}" data-testid="m7-team-member-card-${esc(m.id)}" type="button">${person(m)}<span>角色：${esc(roleName(m.roleId))}</span><span>${esc(m.disabled ? "权限拒绝 / 已停用" : m.status)}</span></button>`
    )
    .join("");
  return `<section data-testid="m7-team-members-panel"><div class="uz-team-table-wrap" data-testid="m7-team-members-table"><table class="uz-team-table"><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table></div>${members.length === 0 ? `<p class="uz-team-empty" data-testid="m7-team-empty">无匹配成员；当前仅使用 browser-local mock 数据。</p>` : ""}<div class="uz-team-card-list" data-testid="m7-team-mobile-member-list">${cards}</div></section>`;
}

function rolesHtml(counts: Record<string, number>) {
  const head = teamRoleColumns.map((column) => `<th>${esc(column)}</th>`).join("");
  const rows = initialRoles
    .map(
      (r) =>
        `<tr><td><strong>${esc(r.name)}</strong></td><td><span class="uz-team-badge">${esc(r.type)}</span></td><td>${esc(r.desc)}</td><td class="uz-team-mono">${counts[r.id] ?? 0}</td><td><span class="uz-team-badge uz-team-badge--deny">权限拒绝：生产 authz 未接入</span></td></tr>`
    )
    .join("");
  const cards = initialRoles
    .map(
      (r) =>
        `<article class="uz-team-role-card"><strong>${esc(r.name)}</strong><span>${esc(r.desc)}</span><span>权限拒绝：生产 authz 未接入</span></article>`
    )
    .join("");
  return `<section data-testid="m7-team-roles-panel"><div class="uz-team-table-wrap" data-testid="m7-team-roles-table"><table class="uz-team-table"><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table></div><div class="uz-team-card-list" data-testid="m7-team-mobile-role-list">${cards}</div></section>`;
}

function inviteHtml(draft: InviteDraft) {
  const options = initialRoles
    .map(
      (role) =>
        `<option ${draft.roleId === role.id ? "selected" : ""} value="${esc(role.id)}">${esc(role.name)}</option>`
    )
    .join("");
  return `<div class="uz-team-modal" data-testid="m7-team-invite-modal"><section aria-modal="true" class="uz-team-modal-card" role="dialog"><h2>邀请成员</h2><span class="uz-team-muted">local-only preview；不发送邮件，不写生产成员、权限或审计。</span><div class="uz-team-actions">${["human", "ai"].map((type) => `<button aria-pressed="${draft.type === type}" class="uz-team-btn" data-action="invite-type" data-id="${type}" type="button">${type === "ai" ? "AI" : "人类"}</button>`).join("")}</div>${field("姓名", "name", draft.name, "m7-team-invite-name")}${field("邮箱 / 账号", "email", draft.email, "m7-team-invite-email", "email")}<label class="uz-team-field"><span>角色</span><select data-field="roleId" data-testid="m7-team-invite-role">${options}</select></label>${field("分组", "group", draft.group, "m7-team-invite-group")}<div class="uz-team-actions"><button class="uz-team-btn" data-action="close-invite" type="button">取消</button><button class="uz-team-btn uz-team-btn--primary" data-action="submit-invite" data-testid="m7-team-invite-send" ${draft.name.trim() && draft.email.trim() ? "" : "disabled"} type="button">发送邀请</button></div></section></div>`;
}

function memberHtml(member: TeamMember, role: string) {
  const facts: Array<[string, string]> = [
    ["角色", role],
    ["分组", member.group],
    ["成员类型", member.type === "ai" ? "AI" : "人类"],
    ["接待上限", String(member.cap)],
    ["权限状态", member.disabled ? "权限拒绝 / 已停用" : "后端 authz authoritative"]
  ];
  const factRows = facts
    .map(
      ([k, v]) =>
        `<p class="uz-team-fact"><span>${esc(k)}</span><strong>${esc(v)}</strong></p>`
    )
    .join("");
  return `<div class="uz-team-drawer-scrim" data-testid="m7-team-member-drawer"><aside aria-modal="true" class="uz-team-drawer" role="dialog"><header class="uz-team-drawer-head">${person(member)}<button aria-label="关闭成员详情" class="uz-team-btn" data-action="close-member" type="button">×</button></header><div class="uz-team-drawer-body">${factRows}<span class="uz-team-muted">停用/恢复需要原因；仅浏览器状态，不写生产成员、权限或审计。</span></div><footer class="uz-team-drawer-foot"><button class="uz-team-btn ${member.disabled ? "uz-team-btn--primary" : "uz-team-btn--danger"}" data-action="ask-toggle" data-testid="m7-team-member-toggle-disable" type="button">${member.disabled ? "恢复账号" : "停用账号"}</button></footer></aside></div>`;
}

function person(member: TeamMember) {
  return `<span class="uz-team-person"><span class="uz-team-avatar uz-team-avatar--${esc(member.type)}">${esc(member.initial)}</span><span class="uz-team-person-copy"><strong>${esc(member.name)}</strong><span class="uz-team-mono">${esc(member.account)}</span></span></span>`;
}

function typeBadge(member: TeamMember) {
  return `<span class="uz-team-badge${member.type === "ai" ? " uz-team-badge--ai" : ""}">${member.type === "ai" ? "AI" : "人类"}</span>`;
}

function field(
  label: string,
  key: keyof InviteDraft,
  value: string,
  testId: string,
  type = "text"
) {
  return `<label class="uz-team-field"><span>${esc(label)}</span><input data-field="${key}" data-testid="${testId}" type="${type}" value="${esc(value)}"></label>`;
}

function esc(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
