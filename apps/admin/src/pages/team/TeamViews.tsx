import { Plus, Search } from "lucide-react";
import { IconSlot } from "../../primitives";
import {
  TEAM_MEMBER_COLUMNS,
  TEAM_PERSISTENCE_WARNING,
  TEAM_ROLE_COLUMNS,
  type TeamMember,
  type TeamRole,
  type TeamTab
} from "./teamFallback";

type RoleMap = Record<string, number>;
type HeaderProps = {
  onChangeTab: (tab: TeamTab) => void;
  onPrimaryAction: () => void;
  tab: TeamTab;
};
type MembersTabProps = {
  members: TeamMember[];
  onSelect: (id: string) => void;
  roleById: (id: string) => TeamRole | undefined;
  search: string;
  setSearch: (next: string) => void;
};
type RoleActionProps = {
  memberCount: number;
  onDelete: (role: TeamRole) => void;
  onEdit: (role: TeamRole) => void;
  role: TeamRole;
};

// prettier-ignore
function MemberIdentity({ member }: { member: TeamMember }) {
  return <span className="uz-team-inline"><span className={`uz-team-avatar uz-team-avatar--${member.type}`}>{member.initial}</span><span><strong>{member.name}</strong><span className="uz-team-mono">{member.account}</span></span></span>;
}

// prettier-ignore
export function TeamHeader({ onChangeTab, onPrimaryAction, tab }: HeaderProps) {
  return <header className="uz-team-head" data-testid="m7-team-header"><div className="uz-team-head-row"><h1 className="uz-team-title">团队</h1><button className="uz-team-cta" data-testid="m7-team-primary" onClick={onPrimaryAction} type="button"><IconSlot icon={Plus} size="sm" />{tab === "roles" ? "新建角色" : "邀请成员"}</button></div><div className="uz-team-tabs" role="tablist" aria-label="团队标签页">{(["members", "roles"] as TeamTab[]).map((id) => <button aria-pressed={tab === id} className="uz-team-tab" data-testid={`m7-team-tab-${id}`} key={id} onClick={() => onChangeTab(id)} role="tab" type="button">{id === "members" ? "成员" : "角色管理"}</button>)}</div><div className="uz-team-note" data-testid="m7-team-runtime-note">{TEAM_PERSISTENCE_WARNING.join(" · ")}</div></header>;
}

// prettier-ignore
export function TeamMembersTab({ members, onSelect, roleById, search, setSearch }: MembersTabProps) {
  return <section className="uz-team-tab-panel"><label className="uz-team-search-wrap"><IconSlot icon={Search} size="sm" /><input aria-label="搜索成员" data-testid="m7-team-search" onChange={(event) => setSearch(event.currentTarget.value)} placeholder="搜索姓名 / 邮箱 / 分组…" type="search" value={search} /></label>{members.length === 0 ? <div className="uz-team-empty" data-testid="m7-team-empty"><strong>无匹配成员</strong><span>{search ? `没有匹配「${search}」的本地成员` : "browser-local only"}</span></div> : null}<div className="uz-team-table-wrap"><table className="uz-team-table"><thead><tr>{TEAM_MEMBER_COLUMNS.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{members.map((member) => <tr className="uz-team-row" data-testid={`m7-team-member-row-${member.id}`} key={member.id} onClick={() => onSelect(member.id)} onKeyDown={(event) => event.key === "Enter" && onSelect(member.id)} role="button" tabIndex={0}><td><MemberIdentity member={member} /></td><td>{roleById(member.roleId)?.name ?? "—"}</td><td><span className={`uz-team-tag${member.type === "ai" ? " uz-team-tag--ai" : ""}`}>{member.type === "ai" ? "AI" : "人类"}</span></td><td>{member.group}</td><td><span className={`uz-team-status uz-team-status--${member.disabled ? "off" : member.status === "在线" ? "ok" : "warn"}`}><span aria-hidden />{member.disabled ? "已停用" : member.status}</span></td><td className="uz-team-mono">{member.disabled ? "0" : member.active}</td><td className="uz-team-mono uz-team-muted">{member.today}</td><td className="uz-team-mono uz-team-muted">{member.login}</td></tr>)}</tbody></table></div><div className="uz-team-card-list">{members.map((member) => <button className="uz-team-card" key={member.id} onClick={() => onSelect(member.id)} type="button"><MemberIdentity member={member} /><span>角色：{roleById(member.roleId)?.name ?? "—"}</span><span>分组：{member.group}</span><span>在线状态：{member.disabled ? "已停用" : member.status}</span></button>)}</div></section>;
}

// prettier-ignore
export function TeamRolesTab({ memberRoleMap, onDelete, onEdit, roles }: { memberRoleMap: RoleMap; onDelete: (role: TeamRole) => void; onEdit: (role: TeamRole) => void; roles: TeamRole[] }) {
  return <section className="uz-team-tab-panel"><div className="uz-team-table-wrap"><table className="uz-team-table"><thead><tr>{TEAM_ROLE_COLUMNS.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{roles.map((role) => { const memberCount = memberRoleMap[role.id] ?? 0; return <tr key={role.id}><td>{role.name}</td><td><span className="uz-team-tag">{role.type}</span></td><td>{role.desc}</td><td className="uz-team-mono">{memberCount}</td><td>{role.created}</td><td><RoleActions memberCount={memberCount} onDelete={onDelete} onEdit={onEdit} role={role} /></td></tr>; })}</tbody></table></div><div className="uz-team-card-list">{roles.map((role) => <RoleCard key={role.id} memberCount={memberRoleMap[role.id] ?? 0} onDelete={onDelete} onEdit={onEdit} role={role} />)}</div></section>;
}

// prettier-ignore
function RoleActions({ memberCount, onDelete, onEdit, role }: RoleActionProps) {
  return <div className="uz-team-row-actions"><button className="uz-team-link-btn" data-testid={`m7-team-role-edit-${role.id}`} onClick={() => onEdit(role)} type="button">编辑</button><button className="uz-team-link-btn uz-team-link-btn--danger" data-testid={`m7-team-role-delete-${role.id}`} disabled={role.builtin || memberCount > 0} onClick={() => onDelete(role)} type="button">删除</button></div>;
}

// prettier-ignore
function RoleCard(props: RoleActionProps) {
  return <article className="uz-team-role-card"><strong>{props.role.name}</strong><span>{props.role.type}</span><span className="uz-team-mono">成员数：{props.memberCount}</span><span className="uz-team-muted">{props.role.desc}</span><RoleActions {...props} /></article>;
}

// prettier-ignore
export function TeamStatePanel({ state, children }: { state: string; children: string }) {
  return <main className="uz-team-state" data-testid={`m7-team-state-${state}`}><p>{children}</p></main>;
}
