import { ConfirmModal } from "../../patterns";
import {
  TEAM_NOTIFICATION_PREFS,
  TEAM_RUNTIME_BOUNDARY,
  type TeamMember
} from "./teamFallback";

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
