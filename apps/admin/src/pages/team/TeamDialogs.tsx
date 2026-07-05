import { ConfirmModal } from "../../patterns";
import {
  PERM_GROUPS,
  TEAM_MEMBER_TYPES,
  TEAM_NOTIFICATION_PREFS,
  type InviteDraft,
  type RoleEditorDraft,
  type TeamMember,
  type TeamRole
} from "./teamFallback";

type FieldProps = {
  label: string;
  onChange: (value: string) => void;
  testId: string;
  value: string;
};
type RoleEditorProps = {
  draft: RoleEditorDraft | null;
  onClose: () => void;
  onSave: () => void;
  onUpdate: (next: RoleEditorDraft) => void;
  open: boolean;
};

// prettier-ignore
export function InviteModal({ draft, onClose, onSubmit, onUpdate, open, roles }: { draft: InviteDraft; onClose: () => void; onSubmit: () => void; onUpdate: (next: InviteDraft) => void; open: boolean; roles: TeamRole[] }) {
  if (!open) return null;
  return <section className="uz-team-modal" role="dialog" data-testid="m7-team-invite-modal"><article className="uz-team-modal-card"><h2>邀请成员</h2><label>成员类型</label><div className="uz-team-switch-row">{TEAM_MEMBER_TYPES.map((type) => <button aria-pressed={draft.type === type.value} className="uz-team-btn" key={type.value} onClick={() => onUpdate({ ...draft, type: type.value })} type="button">{type.label}</button>)}</div><Field label="姓名" testId="m7-team-invite-name" value={draft.name} onChange={(name) => onUpdate({ ...draft, name })} /><Field label="邮箱 / 账号" testId="m7-team-invite-email" value={draft.email} onChange={(email) => onUpdate({ ...draft, email })} /><label>角色</label><select data-testid="m7-team-invite-role" onChange={(event) => onUpdate({ ...draft, roleId: event.currentTarget.value })} value={draft.roleId}>{roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}</select><Field label="分组" testId="m7-team-invite-group" value={draft.group} onChange={(group) => onUpdate({ ...draft, group })} /><div className="uz-team-row-actions"><button className="uz-team-btn" onClick={onClose} type="button">取消</button><button className="uz-team-btn uz-team-btn--primary" data-testid="m7-team-invite-send" disabled={!draft.name.trim() || !draft.email.trim()} onClick={onSubmit} type="button">发送邀请</button></div></article></section>;
}

// prettier-ignore
export function RoleEditorModal({ draft, onClose, onSave, onUpdate, open }: RoleEditorProps) {
  if (!open || !draft) return null;
  return <section className="uz-team-modal" role="dialog" data-testid="m7-team-role-editor"><article className="uz-team-modal-card"><h2>{draft.mode === "new" ? "新建角色" : "编辑角色"}</h2><Field label="角色名" testId="m7-team-role-name" value={draft.name} onChange={(name) => onUpdate({ ...draft, name })} /><Field label="说明" testId="m7-team-role-desc" value={draft.desc} onChange={(desc) => onUpdate({ ...draft, desc })} /><div className="uz-team-modal-body-scroll">{PERM_GROUPS.map((group) => <fieldset className="uz-team-chips-wrap" key={group.id}><legend>{group.label}</legend><div className="uz-team-switch-row">{group.items.map((perm) => <PermButton draft={draft} key={perm.k} onUpdate={onUpdate} perm={perm} />)}</div></fieldset>)}</div><div className="uz-team-row-actions"><button className="uz-team-btn" onClick={onClose} type="button">取消</button><button className="uz-team-btn uz-team-btn--primary" data-testid="m7-team-role-save" disabled={!draft.name.trim()} onClick={onSave} type="button">保存</button></div></article></section>;
}

// prettier-ignore
export function MemberDrawer({ member, onClose, onSetNotify, onToggleDisable, onToggleTelegram, roleName }: { member: TeamMember | null; onClose: () => void; onSetNotify: (id: string, value: string) => void; onToggleDisable: (id: string) => void; onToggleTelegram: (id: string) => void; roleName?: string }) {
  if (!member) return null;
  const facts = ["角色：" + (roleName ?? "—"), "分组：" + member.group, "成员类型：" + (member.type === "ai" ? "AI" : "人类"), "语言偏好：" + member.langPref, "接待上限：" + member.cap];
  return <section className="uz-team-drawer-scrim" data-testid="m7-team-member-drawer" onClick={onClose} role="dialog"><article aria-label="成员详情" className="uz-team-drawer" onClick={(event) => event.stopPropagation()} role="dialog"><header className="uz-team-drawer-head"><span className={`uz-team-avatar uz-team-avatar--${member.type}`}>{member.initial}</span><div><strong>{member.name}</strong><span className="uz-team-mono">{member.account}</span></div><button className="uz-team-btn" onClick={onClose} type="button">×</button></header><div className="uz-team-drawer-body">{facts.map((line) => <p key={line}>{line}</p>)}<label>通知偏好</label><div className="uz-team-switch-row">{TEAM_NOTIFICATION_PREFS.map((pref) => <button aria-pressed={member.notifyPref === pref} className="uz-team-btn" key={pref} onClick={() => onSetNotify(member.id, pref)} type="button">{pref}</button>)}</div><div className="uz-team-toggle"><button aria-label="Telegram 绑定" aria-pressed={member.telegram} className={`uz-toggle${member.telegram ? " is-checked" : ""}`} onClick={() => onToggleTelegram(member.id)} type="button"><span aria-hidden /></button><span>Telegram 绑定 · {member.telegram ? "已绑定" : "未绑定"}</span></div><button className="uz-team-btn uz-team-btn--primary" data-testid="m7-team-member-toggle-disable" onClick={() => onToggleDisable(member.id)} type="button">{member.disabled ? "恢复账号" : "停用账号"}</button></div></article></section>;
}

// prettier-ignore
export function RoleDeleteConfirm({ name, onCancel, onConfirm, open }: { name: string; onCancel: () => void; onConfirm: () => void; open: boolean }) {
  return <ConfirmModal danger confirmLabel="删除角色" description={`本地仅：删除角色「${name}」，不写生产成员/审计`} onCancel={onCancel} onConfirm={onConfirm} open={open} title="删除角色" />;
}

// prettier-ignore
function Field({ label, onChange, testId, value }: FieldProps) {
  return <><label>{label}</label><input data-testid={testId} onChange={(event) => onChange(event.currentTarget.value)} value={value} /></>;
}

// prettier-ignore
function PermButton({ draft, onUpdate, perm }: { draft: RoleEditorDraft; onUpdate: (next: RoleEditorDraft) => void; perm: { k: string; label: string } }) {
  const checked = !!draft.perms[perm.k];
  return <button aria-pressed={checked} className="uz-team-btn uz-team-chip" data-testid={`m7-team-perm-${perm.k}`} onClick={() => onUpdate({ ...draft, perms: { ...draft.perms, [perm.k]: !checked } })} type="button">{perm.label}</button>;
}
