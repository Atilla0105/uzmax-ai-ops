import {
  InviteModal,
  MemberDrawer,
  RoleDeleteConfirm,
  RoleEditorModal
} from "./TeamDialogs";
import { TeamHeader, TeamMembersTab, TeamRolesTab, TeamStatePanel } from "./TeamViews";
import {
  TEAM_RUNTIME_BOUNDARY,
  teamMeta,
  teamStyles,
  useTeamPageState
} from "./teamFallback";

export function TeamPage({ selectedTenantId }: { selectedTenantId: string }) {
  const s = useTeamPageState();
  return (
    <section
      className="uz-team-page"
      data-runtime-boundary={TEAM_RUNTIME_BOUNDARY}
      data-runtime-source={teamMeta.source}
      data-runtime-state={s.viewState}
      data-selected-tenant-id={selectedTenantId}
      data-testid="m7-team-page"
    >
      <style>{teamStyles}</style>
      <TeamHeader
        onChangeTab={s.onSelectTab}
        onPrimaryAction={
          s.tab === "roles" ? s.onRoleDraftCreate : s.onInviteOpenMembers
        }
        tab={s.tab}
      />
      {s.toast ? (
        <div
          aria-atomic="true"
          aria-live="polite"
          className="uz-team-toast"
          data-runtime-boundary={TEAM_RUNTIME_BOUNDARY}
          data-testid="m7-team-toast"
          role="status"
          title={TEAM_RUNTIME_BOUNDARY}
        >
          {s.toast}
        </div>
      ) : null}
      {s.isDegraded ? (
        <main className="uz-team-scroll">
          {s.tab === "members" ? (
            <TeamMembersTab
              members={s.filteredMembers}
              onSelect={s.onSetMember}
              roleById={s.roleById}
              search={s.search}
              setSearch={s.onSetSearch}
            />
          ) : (
            <TeamRolesTab
              memberRoleMap={s.membersByRole}
              onDelete={s.onDeleteRole}
              onEdit={s.onRoleDraftEdit}
              roles={s.roles}
            />
          )}
        </main>
      ) : (
        <TeamStatePanel state={s.viewState}>{s.stateCopy}</TeamStatePanel>
      )}
      <InviteModal
        draft={s.inviteDraft}
        onClose={s.onInviteClose}
        onSubmit={s.onInviteSubmit}
        onUpdate={s.onInviteUpdate}
        open={s.inviteOpen}
        roles={s.roles}
      />
      <RoleEditorModal
        draft={s.roleDraft}
        onClose={s.onRoleDraftClose}
        onSave={s.onRoleDraftSave}
        onUpdate={s.onRoleDraftUpdate}
        open={Boolean(s.roleDraft)}
      />
      <MemberDrawer
        member={s.member}
        onClose={s.onMemberClose}
        onSetNotify={s.onNotify}
        onToggleDisable={s.onSetState}
        onToggleTelegram={s.onTelegram}
        roleName={s.member ? s.roleById(s.member.roleId)?.name : undefined}
      />
      <RoleDeleteConfirm
        name={s.roleToDelete}
        onCancel={s.onDismissDeleteRole}
        onConfirm={s.onRoleDeleteConfirm}
        open={Boolean(s.roleToDelete)}
      />
    </section>
  );
}
