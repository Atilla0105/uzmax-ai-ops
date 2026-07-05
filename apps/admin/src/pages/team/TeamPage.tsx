import {
  InviteModal,
  MemberDrawer,
  RoleDeleteConfirm,
  RoleEditorModal,
  TeamHeader,
  TeamMembersTab,
  TeamRolesTab,
  TeamStatePanel
} from "./TeamViews";
import {
  teamMeta,
  teamStyles
} from "./teamFallback";
import { useTeamPageState } from "./teamPageState";

export function TeamPage({ selectedTenantId }: { selectedTenantId: string }) {
  const {
    filteredMembers,
    isDegraded,
    inviteDraft,
    inviteOpen,
    member,
    membersByRole,
    roleById,
    roleDraft,
    roleToDelete,
    roles,
    search,
    stateCopy,
    tab,
    toast,
    viewState,
    onDeleteRole,
    onDismissDeleteRole,
    onInviteClose,
    onInviteOpenMembers,
    onInviteSubmit,
    onInviteUpdate,
    onMemberClose,
    onNotify,
    onRoleDraftClose,
    onRoleDraftCreate,
    onRoleDraftEdit,
    onRoleDraftSave,
    onRoleDraftUpdate,
    onRoleDeleteConfirm,
    onSelectTab,
    onSetMember,
    onSetSearch,
    onSetState,
    onTelegram
  } = useTeamPageState();

  return (
    <section
      className="uz-team-page"
      data-runtime-source={teamMeta.source}
      data-runtime-state={viewState}
      data-testid="m7-team-page"
    >
      <style>{teamStyles}</style>
      <TeamHeader
        onChangeTab={onSelectTab}
        onPrimaryAction={
          tab === "roles" ? onRoleDraftCreate : onInviteOpenMembers
        }
        search={search}
        selectedTenantId={selectedTenantId}
        setSearch={onSetSearch}
        tab={tab}
      />
      {toast ? (
        <div
          aria-atomic="true"
          aria-live="polite"
          className="uz-team-toast"
          data-testid="m7-team-toast"
          role="status"
        >
          {toast}
        </div>
      ) : null}
      {isDegraded ? (
        <main className="uz-team-scroll">
          {tab === "members" ? (
            <TeamMembersTab
              members={filteredMembers}
              onSelect={onSetMember}
              roleById={roleById}
            />
          ) : (
            <TeamRolesTab
              memberRoleMap={membersByRole}
              onDelete={onDeleteRole}
              onEdit={onRoleDraftEdit}
              roles={roles}
            />
          )}
        </main>
      ) : (
        <TeamStatePanel state={viewState}>{stateCopy}</TeamStatePanel>
      )}
      <InviteModal
        draft={inviteDraft}
        onClose={onInviteClose}
        onSubmit={onInviteSubmit}
        onUpdate={onInviteUpdate}
        open={inviteOpen}
        roles={roles}
      />
      <RoleEditorModal
        draft={roleDraft}
        onClose={onRoleDraftClose}
        onSave={onRoleDraftSave}
        onUpdate={onRoleDraftUpdate}
        open={Boolean(roleDraft)}
      />
      <MemberDrawer
        member={member}
        onClose={onMemberClose}
        onSetNotify={onNotify}
        onToggleDisable={onSetState}
        onToggleTelegram={onTelegram}
        roleName={member ? roleById(member.roleId)?.name : undefined}
      />
      <RoleDeleteConfirm
        name={roleToDelete}
        onCancel={onDismissDeleteRole}
        onConfirm={onRoleDeleteConfirm}
        open={Boolean(roleToDelete)}
      />
    </section>
  );
}
