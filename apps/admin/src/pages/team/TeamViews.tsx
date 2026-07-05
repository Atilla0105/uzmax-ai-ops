import { Search } from "lucide-react";
import { ConfirmModal, IconSlot, Toggle } from "../../patterns";
import {
  TEAM_MEMBER_COLUMNS,
  TEAM_MEMBER_TYPES,
  TEAM_NOTIFICATION_PREFS,
  TEAM_PERSISTENCE_WARNING,
  TEAM_ROLE_COLUMNS,
  PERM_GROUPS,
  type InviteDraft,
  type RoleEditorDraft,
  type TeamMember,
  type TeamRole,
  type TeamTab
} from "./teamFallback";

type RowClick = (id: string) => void;
type RoleMap = Record<string, number>;

export function TeamHeader({ onChangeTab, onPrimaryAction, search, setSearch, selectedTenantId, tab }: {
  onChangeTab: (tab: TeamTab) => void;
  onPrimaryAction: () => void;
  search: string;
  setSearch: (next: string) => void;
  selectedTenantId: string;
  tab: TeamTab;
}) {
  return (
    <header className="uz-team-head" data-testid="m7-team-header">
      <div className="uz-team-head-row">
        <h1 className="uz-team-title">团队</h1>
        <span className="uz-team-sub">tenant: {selectedTenantId}</span>
        <button className="uz-team-cta" data-testid="m7-team-primary" onClick={onPrimaryAction} type="button">{tab === "roles" ? "新建角色" : "邀请成员"}</button>
      </div>
      <div className="uz-team-note" data-testid="m7-team-runtime-note">{TEAM_PERSISTENCE_WARNING.map((item) => <span key={item}>{item}</span>)}</div>
      {tab === "members" ? (
        <label className="uz-team-search-wrap">
          <IconSlot icon={Search} size="sm" />
          <input aria-label="搜索成员" data-testid="m7-team-search" onChange={(event) => setSearch(event.currentTarget.value)} placeholder="搜索姓名 / 账号 / 分组" type="search" value={search} />
        </label>
      ) : null}
      <div className="uz-team-tabs" role="tablist" aria-label="团队标签页">
        {[
          { id: "members", label: "成员" },
          { id: "roles", label: "角色管理" }
        ].map(({ id, label }) => (
          <button aria-pressed={tab === id} className="uz-team-tab" data-testid={`m7-team-tab-${id}`} key={id} onClick={() => onChangeTab(id as TeamTab)} type="button">{label}</button>
        ))}
      </div>
    </header>
  );
}

export function TeamMembersTab({ members, onSelect, roleById }: { members: TeamMember[]; onSelect: RowClick; roleById: (id: string) => TeamRole | undefined; }) {
  return (
    <section className="uz-team-tab-panel">
      {members.length === 0 ? <div className="uz-team-empty" data-testid="m7-team-empty"><strong>无匹配成员</strong><span>search empty · local only</span></div> : null}
      <div className="uz-team-table-wrap">
        <table className="uz-team-table">
          <thead><tr>{TEAM_MEMBER_COLUMNS.map((column) => <th key={column}>{column}</th>)}</tr></thead>
          <tbody>
            {members.map((member) => {
              const role = roleById(member.roleId);
              return (
                <tr aria-label={`成员 ${member.name}`} className="uz-team-row" data-testid={`m7-team-member-row-${member.id}`} key={member.id} onClick={() => onSelect(member.id)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelect(member.id); } }} role="button" tabIndex={0}>
                  <td><span className="uz-team-inline"><span className="uz-team-avatar" style={{ background: member.avBg, color: member.avColor }}>{member.initial}</span><span><strong>{member.name}</strong><span className="uz-team-mono">{member.account}</span></span></span></td>
                  <td>{role?.name ?? "—"}</td>
                  <td><span className={`uz-team-tag${member.type === "ai" ? " uz-team-tag--ai" : ""}`}>{member.type === "ai" ? "AI" : "人类"}</span></td>
                  <td>{member.group}</td>
                  <td>{member.disabled ? "已停用" : member.status}</td>
                  <td className="uz-team-mono">{member.disabled ? "0" : member.active}</td>
                  <td className="uz-team-mono">{member.today}</td>
                  <td className="uz-team-mono">{member.login}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="uz-team-card-list">
        {members.map((member) => (
          <button className="uz-team-card" key={member.id} onClick={() => onSelect(member.id)} type="button">
            <span className="uz-team-inline"><span className="uz-team-avatar" style={{ background: member.avBg, color: member.avColor }}>{member.initial}</span><span><strong>{member.name}</strong><span className="uz-team-mono">{member.account}</span></span></span>
            <span>角色：{roleById(member.roleId)?.name ?? "—"}</span><span>分组：{member.group}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export function TeamRolesTab({ memberRoleMap, onDelete, onEdit, roles }: { memberRoleMap: RoleMap; onDelete: (role: TeamRole) => void; onEdit: (role: TeamRole) => void; roles: TeamRole[]; }) {
  return (
    <section className="uz-team-tab-panel">
      <div className="uz-team-table-wrap">
        <table className="uz-team-table">
          <thead><tr>{TEAM_ROLE_COLUMNS.map((column) => <th key={column}>{column}</th>)}</tr></thead>
          <tbody>
            {roles.map((role) => {
              const memberCount = memberRoleMap[role.id] ?? 0;
              return (
                <tr key={role.id}>
                  <td>{role.name}</td>
                  <td><span className="uz-team-tag">{role.type}</span></td>
                  <td>{role.desc}</td>
                  <td className="uz-team-mono">{memberCount}</td>
                  <td>{role.created}</td>
                  <td><div className="uz-team-row-actions"><button className="uz-team-btn" data-testid={`m7-team-role-edit-${role.id}`} onClick={() => onEdit(role)} type="button">编辑</button><button className="uz-team-btn uz-team-btn--danger" data-testid={`m7-team-role-delete-${role.id}`} disabled={role.builtin || memberCount > 0} onClick={() => onDelete(role)} type="button">删除</button></div></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="uz-team-card-list">
        {roles.map((role) => {
          const memberCount = memberRoleMap[role.id] ?? 0;
          return (
            <article className="uz-team-role-card" key={role.id}>
              <strong>{role.name}</strong>
              <span>{role.type}</span>
              <span className="uz-team-mono">成员数：{memberCount}</span>
              <span className="uz-team-muted">{role.desc}</span>
              <div className="uz-team-row-actions"><button className="uz-team-btn" onClick={() => onEdit(role)} type="button">编辑</button><button className="uz-team-btn uz-team-btn--danger" disabled={role.builtin || memberCount > 0} onClick={() => onDelete(role)} type="button">删除</button></div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function TeamStatePanel({ state, children }: { state: string; children: string }) {
  return <main className="uz-team-state" data-testid={`m7-team-state-${state}`}><p>{children}</p></main>;
}

export function InviteModal({ draft, onClose, onSubmit, onUpdate, open, roles }: { draft: InviteDraft; onClose: () => void; onSubmit: () => void; onUpdate: (next: InviteDraft) => void; open: boolean; roles: TeamRole[]; }) {
  if (!open) return null;
  const canSubmit = Boolean(draft.name.trim() && draft.email.trim());
  return (
    <section className="uz-team-modal" role="dialog" data-testid="m7-team-invite-modal"><article className="uz-team-modal-card">
      <h2>邀请成员</h2>
      <label>成员类型</label>
      <div className="uz-team-switch-row">{TEAM_MEMBER_TYPES.map((type) => <button aria-pressed={draft.type === type.value} className="uz-team-btn" key={type.value} onClick={() => onUpdate({ ...draft, type: type.value })} type="button">{type.label}</button>)}</div>
      <label>姓名</label><input data-testid="m7-team-invite-name" onChange={(event) => onUpdate({ ...draft, name: event.currentTarget.value })} value={draft.name} />
      <label>邮箱 / 账号</label><input data-testid="m7-team-invite-email" onChange={(event) => onUpdate({ ...draft, email: event.currentTarget.value })} value={draft.email} />
      <label>角色</label><select data-testid="m7-team-invite-role" onChange={(event) => onUpdate({ ...draft, roleId: event.currentTarget.value })} value={draft.roleId}>{roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}</select>
      <label>分组</label><input data-testid="m7-team-invite-group" onChange={(event) => onUpdate({ ...draft, group: event.currentTarget.value })} value={draft.group} />
      <div className="uz-team-row-actions"><button className="uz-team-btn" onClick={onClose} type="button">取消</button><button className="uz-team-btn uz-team-btn--primary" data-testid="m7-team-invite-send" disabled={!canSubmit} onClick={onSubmit} type="button">发送邀请</button></div>
    </article></section>
  );
}

export function RoleEditorModal({ draft, onClose, onSave, onUpdate, open }: { draft: RoleEditorDraft | null; onClose: () => void; onSave: () => void; onUpdate: (next: RoleEditorDraft) => void; open: boolean; }) {
  if (!open || !draft) return null;
  return (
    <section className="uz-team-modal" role="dialog" data-testid="m7-team-role-editor"><article className="uz-team-modal-card">
      <h2>{draft.mode === "new" ? "新建角色" : "编辑角色"}</h2>
      <label>角色名</label><input data-testid="m7-team-role-name" onChange={(event) => onUpdate({ ...draft, name: event.currentTarget.value })} value={draft.name} />
      <label>说明</label><input data-testid="m7-team-role-desc" onChange={(event) => onUpdate({ ...draft, desc: event.currentTarget.value })} value={draft.desc} />
      <div className="uz-team-modal-body-scroll">{PERM_GROUPS.map((group) => <fieldset className="uz-team-chips-wrap" key={group.id}><legend>{group.label}</legend><div className="uz-team-switch-row">{group.items.map((perm) => { const checked = !!draft.perms[perm.k]; return <button aria-pressed={checked} className="uz-team-btn uz-team-chip" data-testid={`m7-team-perm-${perm.k}`} key={perm.k} onClick={() => onUpdate({ ...draft, perms: { ...draft.perms, [perm.k]: !checked } })} type="button">{perm.label}</button>; })}</div></fieldset>)}</div>
      <div className="uz-team-row-actions"><button className="uz-team-btn" onClick={onClose} type="button">取消</button><button className="uz-team-btn uz-team-btn--primary" data-testid="m7-team-role-save" disabled={!draft.name.trim()} onClick={onSave} type="button">保存</button></div>
    </article></section>
  );
}

export function MemberDrawer({ member, onClose, onSetNotify, onToggleDisable, onToggleTelegram, roleName }: { member: TeamMember | null; onClose: () => void; onSetNotify: (id: string, value: string) => void; onToggleDisable: (id: string) => void; onToggleTelegram: (id: string) => void; roleName?: string; }) {
  if (!member) return null;
  return (
    <section className="uz-team-drawer-scrim" onClick={onClose} data-testid="m7-team-member-drawer">
      <article aria-label="成员详情" className="uz-team-drawer" onClick={(event) => event.stopPropagation()} role="dialog">
        <header className="uz-team-drawer-head"><span className="uz-team-avatar" style={{ background: member.avBg, color: member.avColor }}>{member.initial}</span><div><strong>{member.name}</strong><span className="uz-team-mono">{member.account}</span></div><button className="uz-team-btn" onClick={onClose} type="button">×</button></header>
        <div className="uz-team-drawer-body">
          <p>角色：{roleName ?? "—"}</p><p>分组：{member.group}</p><p>成员类型：{member.type === "ai" ? "AI" : "人类"}</p><p>语言偏好：{member.langPref}</p><p>接待上限：{member.cap}</p>
          <label>通知偏好</label><div className="uz-team-switch-row">{TEAM_NOTIFICATION_PREFS.map((pref) => <button aria-pressed={member.notifyPref === pref} className="uz-team-btn" key={pref} onClick={() => onSetNotify(member.id, pref)} type="button">{pref}</button>)}</div>
          <div className="uz-team-toggle"><Toggle checked={member.telegram} onClick={() => onToggleTelegram(member.id)} /><span>Telegram 绑定 · {member.telegram ? "已绑定" : "未绑定"}</span></div>
          <button className="uz-team-btn uz-team-btn--primary" data-testid="m7-team-member-toggle-disable" onClick={() => onToggleDisable(member.id)} type="button">{member.disabled ? "恢复账号" : "停用账号"}</button>
        </div>
      </article>
    </section>
  );
}

export function RoleDeleteConfirm({ name, onCancel, onConfirm, open }: { name: string; onCancel: () => void; onConfirm: () => void; open: boolean; }) {
  return <ConfirmModal danger confirmLabel="删除角色" description={`本地仅：删除角色「${name}」，不写生产成员/审计`} onCancel={onCancel} onConfirm={onConfirm} open={open} title="删除角色" />;
}

