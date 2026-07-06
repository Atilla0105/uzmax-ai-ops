import { ConfirmModal } from "../../patterns";
import {
  PERM_GROUPS,
  TEAM_MEMBER_TYPES,
  TEAM_NOTIFICATION_PREFS,
  TEAM_RUNTIME_BOUNDARY,
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

export function InviteModal({
  draft,
  onClose,
  onSubmit,
  onUpdate,
  open,
  roles
}: {
  draft: InviteDraft;
  onClose: () => void;
  onSubmit: () => void;
  onUpdate: (next: InviteDraft) => void;
  open: boolean;
  roles: TeamRole[];
}) {
  if (!open) return null;
  return (
    <section
      aria-description={TEAM_RUNTIME_BOUNDARY}
      aria-modal="true"
      className="uz-team-modal"
      role="dialog"
      data-runtime-boundary={TEAM_RUNTIME_BOUNDARY}
      data-testid="m7-team-invite-modal"
      title={TEAM_RUNTIME_BOUNDARY}
    >
      <article className="uz-team-modal-card uz-team-modal-card--invite">
        <h2>邀请成员</h2>
        <Field
          label="昵称"
          placeholder="成员昵称"
          testId="m7-team-invite-name"
          value={draft.name}
          onChange={(name) => onUpdate({ ...draft, name })}
        />
        <Field
          label="邮箱"
          placeholder="name@company.com"
          testId="m7-team-invite-email"
          value={draft.email}
          onChange={(email) => onUpdate({ ...draft, email })}
        />
        <label>成员类型</label>
        <div className="uz-team-switch-row">
          {TEAM_MEMBER_TYPES.map((type) => (
            <button
              aria-pressed={draft.type === type.value}
              className="uz-team-btn"
              key={type.value}
              onClick={() => onUpdate({ ...draft, type: type.value })}
              type="button"
            >
              {type.label}
            </button>
          ))}
        </div>
        <label>角色</label>
        <select
          data-testid="m7-team-invite-role"
          onChange={(event) =>
            onUpdate({ ...draft, roleId: event.currentTarget.value })
          }
          value={draft.roleId}
        >
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
        <Field
          label="分组"
          placeholder="如「客服一组」"
          testId="m7-team-invite-group"
          value={draft.group}
          onChange={(group) => onUpdate({ ...draft, group })}
        />
        <p
          className="uz-team-local-note"
          data-runtime-boundary={TEAM_RUNTIME_BOUNDARY}
          title={TEAM_RUNTIME_BOUNDARY}
        >
          邀请会先进入待发送队列，提交前请确认角色与分组。
        </p>
        <span hidden>{TEAM_RUNTIME_BOUNDARY}</span>
        <div className="uz-team-modal-actions">
          <button className="uz-team-btn" onClick={onClose} type="button">
            取消
          </button>
          <button
            className="uz-team-btn uz-team-btn--primary"
            data-testid="m7-team-invite-send"
            disabled={!draft.name.trim() || !draft.email.trim()}
            onClick={onSubmit}
            type="button"
          >
            发送邀请
          </button>
        </div>
      </article>
    </section>
  );
}

export function RoleEditorModal({
  draft,
  onClose,
  onSave,
  onUpdate,
  open
}: RoleEditorProps) {
  if (!open || !draft) return null;
  return (
    <section
      aria-description={TEAM_RUNTIME_BOUNDARY}
      aria-modal="true"
      className="uz-team-modal"
      role="dialog"
      data-runtime-boundary={TEAM_RUNTIME_BOUNDARY}
      data-testid="m7-team-role-editor"
      title={TEAM_RUNTIME_BOUNDARY}
    >
      <article className="uz-team-modal-card uz-team-modal-card--role">
        <h2>{draft.mode === "new" ? "新建角色" : "编辑角色"}</h2>
        <Field
          label="角色名称"
          placeholder="如「客服主管」"
          testId="m7-team-role-name"
          value={draft.name}
          onChange={(name) => onUpdate({ ...draft, name })}
        />
        <Field
          label="说明"
          placeholder="角色说明（可选）"
          testId="m7-team-role-desc"
          value={draft.desc}
          onChange={(desc) => onUpdate({ ...draft, desc })}
        />
        <label>权限</label>
        <div className="uz-team-modal-body-scroll uz-team-perm-grid">
          {PERM_GROUPS.map((group) => (
            <fieldset className="uz-team-perm-group" key={group.id}>
              <legend>{group.label}</legend>
              <div>
                {group.items.map((perm) => (
                  <PermButton
                    draft={draft}
                    key={perm.k}
                    onUpdate={onUpdate}
                    perm={perm}
                  />
                ))}
              </div>
            </fieldset>
          ))}
        </div>
        <span hidden>{TEAM_RUNTIME_BOUNDARY}</span>
        <div className="uz-team-modal-actions">
          <button className="uz-team-btn" onClick={onClose} type="button">
            取消
          </button>
          <button
            className="uz-team-btn uz-team-btn--primary"
            data-testid="m7-team-role-save"
            disabled={!draft.name.trim()}
            onClick={onSave}
            type="button"
          >
            保存
          </button>
        </div>
      </article>
    </section>
  );
}

export function MemberDrawer({
  member,
  onClose,
  onSetNotify,
  onToggleDisable,
  onToggleTelegram,
  roleName
}: {
  member: TeamMember | null;
  onClose: () => void;
  onSetNotify: (id: string, value: string) => void;
  onToggleDisable: (id: string) => void;
  onToggleTelegram: (id: string) => void;
  roleName?: string;
}) {
  if (!member) return null;
  const facts = [
    ["角色", roleName ?? "—"],
    ["分组", member.group],
    ["接待上限", String(member.cap)],
    ["语言偏好", member.langPref]
  ];
  return (
    <section
      aria-description={TEAM_RUNTIME_BOUNDARY}
      aria-modal="true"
      className="uz-team-drawer-scrim"
      data-runtime-boundary={TEAM_RUNTIME_BOUNDARY}
      data-testid="m7-team-member-drawer"
      onClick={onClose}
      role="dialog"
      title={TEAM_RUNTIME_BOUNDARY}
    >
      <article
        aria-label="成员详情"
        className="uz-team-drawer"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header className="uz-team-drawer-head">
          <span className={`uz-team-avatar uz-team-avatar--${member.type}`}>
            {member.initial}
          </span>
          <div>
            <strong>{member.name}</strong>
            <span className="uz-team-mono">{member.account}</span>
          </div>
          <button
            aria-label="关闭成员详情"
            className="uz-team-close"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </header>
        <div className="uz-team-drawer-body">
          {facts.map(([label, value]) => (
            <div className="uz-team-kv" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
          <div className="uz-team-field-block">
            <label>通知偏好</label>
            <div className="uz-team-switch-row">
              {TEAM_NOTIFICATION_PREFS.map((pref) => (
                <button
                  aria-pressed={member.notifyPref === pref}
                  className="uz-team-btn"
                  data-runtime-boundary={TEAM_RUNTIME_BOUNDARY}
                  key={pref}
                  onClick={() => onSetNotify(member.id, pref)}
                  title={TEAM_RUNTIME_BOUNDARY}
                  type="button"
                >
                  {pref}
                </button>
              ))}
            </div>
          </div>
          <div className="uz-team-toggle">
            <button
              aria-label="Telegram 绑定"
              aria-pressed={member.telegram}
              className={`uz-toggle${member.telegram ? " is-checked" : ""}`}
              data-runtime-boundary={TEAM_RUNTIME_BOUNDARY}
              onClick={() => onToggleTelegram(member.id)}
              title={TEAM_RUNTIME_BOUNDARY}
              type="button"
            >
              <span aria-hidden />
            </button>
            <span>Telegram 绑定 · {member.telegram ? "已绑定" : "未绑定"}</span>
          </div>
          <p
            className="uz-team-local-note"
            data-runtime-boundary={TEAM_RUNTIME_BOUNDARY}
            title={TEAM_RUNTIME_BOUNDARY}
          >
            这里展示账号偏好与绑定预览，提交前请确认权限影响。
          </p>
          <span hidden>{TEAM_RUNTIME_BOUNDARY}</span>
        </div>
        <footer className="uz-team-drawer-foot">
          <button
            className={`uz-team-btn ${member.disabled ? "uz-team-btn--safe" : "uz-team-btn--danger-fill"}`}
            data-runtime-boundary={TEAM_RUNTIME_BOUNDARY}
            data-testid="m7-team-member-toggle-disable"
            onClick={() => onToggleDisable(member.id)}
            title={TEAM_RUNTIME_BOUNDARY}
            type="button"
          >
            {member.disabled ? "恢复账号" : "停用账号"}
          </button>
        </footer>
      </article>
    </section>
  );
}

export function RoleDeleteConfirm({
  name,
  onCancel,
  onConfirm,
  open
}: {
  name: string;
  onCancel: () => void;
  onConfirm: () => void;
  open: boolean;
}) {
  return (
    <ConfirmModal
      danger
      cancelLabel="取消"
      confirmLabel="删除"
      description={`将删除角色「${name}」。该角色当前无成员，删除后不可恢复。`}
      onCancel={onCancel}
      onConfirm={onConfirm}
      open={open}
      title="删除角色？"
    />
  );
}

function Field({
  label,
  onChange,
  placeholder,
  testId,
  value
}: FieldProps & { placeholder?: string }) {
  return (
    <>
      <label>{label}</label>
      <input
        data-testid={testId}
        onChange={(event) => onChange(event.currentTarget.value)}
        placeholder={placeholder}
        value={value}
      />
    </>
  );
}

function PermButton({
  draft,
  onUpdate,
  perm
}: {
  draft: RoleEditorDraft;
  onUpdate: (next: RoleEditorDraft) => void;
  perm: { k: string; label: string };
}) {
  const checked = !!draft.perms[perm.k];
  return (
    <button
      aria-pressed={checked}
      className="uz-team-btn uz-team-chip"
      data-testid={`m7-team-perm-${perm.k}`}
      onClick={() =>
        onUpdate({ ...draft, perms: { ...draft.perms, [perm.k]: !checked } })
      }
      type="button"
    >
      {checked ? "✓ " : ""}
      {perm.label}
    </button>
  );
}
