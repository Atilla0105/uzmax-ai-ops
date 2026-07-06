import {
  TEAM_ROLE_COLUMNS,
  TEAM_RUNTIME_BOUNDARY,
  type TeamRole
} from "./teamFallback";

type RoleMap = Record<string, number>;
type RoleActionProps = {
  memberCount: number;
  onDelete: (role: TeamRole) => void;
  onEdit: (role: TeamRole) => void;
  role: TeamRole;
};

export function TeamRolesTab({
  memberRoleMap,
  onDelete,
  onEdit,
  roles
}: {
  memberRoleMap: RoleMap;
  onDelete: (role: TeamRole) => void;
  onEdit: (role: TeamRole) => void;
  roles: TeamRole[];
}) {
  return (
    <section className="uz-team-tab-panel">
      <div className="uz-team-table-wrap">
        <table className="uz-team-table">
          <thead>
            <tr>
              {TEAM_ROLE_COLUMNS.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => {
              const memberCount = memberRoleMap[role.id] ?? 0;
              return (
                <tr key={role.id}>
                  <td>{role.name}</td>
                  <td>
                    <span className="uz-team-tag">{role.type}</span>
                  </td>
                  <td>{role.desc}</td>
                  <td className="uz-team-mono">{memberCount}</td>
                  <td>{role.created}</td>
                  <td>
                    <RoleActions
                      memberCount={memberCount}
                      onDelete={onDelete}
                      onEdit={onEdit}
                      role={role}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="uz-team-card-list">
        {roles.map((role) => (
          <RoleCard
            key={role.id}
            memberCount={memberRoleMap[role.id] ?? 0}
            onDelete={onDelete}
            onEdit={onEdit}
            role={role}
          />
        ))}
      </div>
    </section>
  );
}

export function TeamStatePanel({
  state,
  children
}: {
  state: string;
  children: string;
}) {
  return (
    <main
      aria-description={TEAM_RUNTIME_BOUNDARY}
      className="uz-team-state"
      data-runtime-boundary={TEAM_RUNTIME_BOUNDARY}
      data-testid={`m7-team-state-${state}`}
      title={TEAM_RUNTIME_BOUNDARY}
    >
      <p>{children}</p>
      <span hidden>{TEAM_RUNTIME_BOUNDARY}</span>
    </main>
  );
}

function RoleActions({ memberCount, onDelete, onEdit, role }: RoleActionProps) {
  return (
    <div className="uz-team-row-actions">
      <button
        className="uz-team-link-btn"
        data-testid={`m7-team-role-edit-${role.id}`}
        onClick={() => onEdit(role)}
        type="button"
      >
        编辑
      </button>
      <button
        className="uz-team-link-btn uz-team-link-btn--danger"
        data-testid={`m7-team-role-delete-${role.id}`}
        disabled={role.builtin || memberCount > 0}
        onClick={() => onDelete(role)}
        type="button"
      >
        删除
      </button>
    </div>
  );
}

function RoleCard(props: RoleActionProps) {
  return (
    <article className="uz-team-role-card">
      <strong>{props.role.name}</strong>
      <span>{props.role.type}</span>
      <span className="uz-team-mono">成员数：{props.memberCount}</span>
      <span className="uz-team-muted">{props.role.desc}</span>
      <RoleActions {...props} />
    </article>
  );
}
