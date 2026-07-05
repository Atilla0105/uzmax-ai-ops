import { useEffect, useMemo, useRef, useState } from "react";
import { InviteModal, MemberDrawer, RoleDeleteConfirm, RoleEditorModal, TeamHeader, TeamMembersTab, TeamRolesTab, TeamStatePanel } from "./TeamViews";
import { TEAM_DEFAULT_ROLE_EDITOR, localTeamToast, makeInviteInitialDraft, readTeamViewState, teamMembers, teamMeta, teamRoles, teamStateCopy, teamStyles, type InviteDraft, type RoleEditorDraft, type TeamMember, type TeamRole, type TeamTab, type TeamViewState } from "./teamFallback";

export function TeamPage({ selectedTenantId }: { selectedTenantId: string }) {
  const viewState = readTeamViewState();
  const isDegraded = viewState === "degraded";
  const [members, setMembers] = useState(teamMembers);
  const [roles, setRoles] = useState(teamRoles);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [inviteDraft, setInviteDraft] = useState<InviteDraft>(makeInviteInitialDraft(teamRoles[0]?.id ?? ""));
  const [tab, setTab] = useState<TeamTab>("members");
  const [search, setSearch] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [roleDraft, setRoleDraft] = useState<RoleEditorDraft | null>(null);
  const [roleToDelete, setRoleToDelete] = useState("");
  const [toast, setToast] = useState("");
  const toastTimer = useRef<number | null>(null);

  const member = useMemo(
    () => (selectedMemberId ? members.find((entry) => entry.id === selectedMemberId) ?? null : null),
    [members, selectedMemberId]
  );

  useEffect(() => () => toastTimer.current && window.clearTimeout(toastTimer.current), []);

  const roleById = (roleId: string) => roles.find((role) => role.id === roleId);
  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? members.filter((m) => `${m.name} ${m.account} ${m.group}`.toLowerCase().includes(q)) : members;
  }, [members, search]);

  const membersByRole = useMemo<Record<string, number>>(
    () => members.reduce((acc, m) => {
      acc[m.roleId] = (acc[m.roleId] ?? 0) + 1;
      return acc;
    }, Object.fromEntries(roles.map((role) => [role.id, 0])) as Record<string, number>),
    [members, roles]
  );

  const showToast = (message: string) => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    setToast(localTeamToast(message));
    toastTimer.current = window.setTimeout(() => {
      setToast("");
      toastTimer.current = null;
    }, 2400);
  };

  const submitInvite = () => {
    const name = inviteDraft.name.trim();
    const email = inviteDraft.email.trim();
    if (!name || !email) return;
    const isAi = inviteDraft.type === "ai";
    setMembers((current) => [
      ...current,
      {
        account: email,
        active: "0",
        avBg: isAi ? "#EBF0F9" : "#F2F3F4",
        avColor: isAi ? "#30518C" : "#3F454D",
        cap: 6,
        disabled: false,
        group: inviteDraft.group || "未分组",
        id: `m-${Date.now()}`,
        initial: name.at(0) ?? "M",
        langPref: "系统跟随",
        login: "刚添加",
        name,
        notifyPref: "全部",
        roleId: inviteDraft.roleId,
        status: "离线",
        telegram: false,
        today: "0",
        type: inviteDraft.type
      } as TeamMember
    ]);
    setInviteOpen(false);
    showToast(`invite added locally: ${name}`);
  };

  const openRoleEditor = (mode: RoleEditorDraft["mode"], role: TeamRole | null = null) =>
    setRoleDraft(
      mode === "new"
        ? { ...TEAM_DEFAULT_ROLE_EDITOR, id: null, mode }
        : {
            desc: role?.desc ?? "",
            id: role?.id ?? null,
            mode,
            name: role?.name ?? "",
            perms: { ...role?.perms }
          }
    );

  const saveRole = () => {
    if (!roleDraft || !roleDraft.name.trim()) return;
    if (roleDraft.mode === "edit" && roleDraft.id)
      setRoles((current) =>
        current.map((r) => (r.id === roleDraft.id ? { ...r, desc: roleDraft.desc, name: roleDraft.name, perms: roleDraft.perms } : r))
      );
    else
      setRoles((current) => [
        ...current,
        {
          builtin: false,
          created: "今天",
          desc: roleDraft.desc,
          id: `r-${Date.now()}`,
          name: roleDraft.name,
          perms: { ...roleDraft.perms },
          type: "自定义"
        }
      ]);
    showToast(`${roleDraft.mode === "edit" ? "updated" : "created"} role ${roleDraft.name}`);
    setRoleDraft(null);
  };

  const confirmDeleteRole = () => {
    setRoles((current) => current.filter((r) => r.name !== roleToDelete));
    showToast(`deleted role ${roleToDelete}`);
    setRoleToDelete("");
  };

  const setNotify = (id: string, preference: string) => {
    setMembers((current) => current.map((entry) => (entry.id === id ? { ...entry, notifyPref: preference } : entry)));
    showToast(`notification preference updated for ${members.find((entry) => entry.id === id)?.name ?? "member"}`);
  };

  const setDisable = (id: string) => {
    setMembers((current) => current.map((entry) => (entry.id === id ? { ...entry, disabled: !entry.disabled } : entry)));
    const target = members.find((entry) => entry.id === id);
    showToast(target?.disabled ? `restored member ${target.name}` : `disabled member ${target?.name ?? id}`);
  };

  const setTelegram = (id: string) => {
    setMembers((current) => current.map((entry) => (entry.id === id ? { ...entry, telegram: !entry.telegram } : entry)));
    const target = members.find((entry) => entry.id === id);
    showToast(`telegram ${target?.telegram ? "unbound" : "bound"} for ${target?.name ?? id}`);
  };

  return (
    <section className="uz-team-page" data-runtime-source={teamMeta.source} data-runtime-state={viewState} data-testid="m7-team-page">
      <style>{teamStyles}</style>
      <TeamHeader onChangeTab={setTab} onPrimaryAction={tab === "roles" ? () => openRoleEditor("new") : () => {
        setInviteDraft(makeInviteInitialDraft(roles[0]?.id ?? ""));
        setInviteOpen(true);
      }} search={search} selectedTenantId={selectedTenantId} setSearch={setSearch} tab={tab} />
      {toast ? <div aria-atomic="true" aria-live="polite" className="uz-team-toast" data-testid="m7-team-toast" role="status">{toast}</div> : null}
      {isDegraded ? <main className="uz-team-scroll">{tab === "members" ? <TeamMembersTab members={filteredMembers} onSelect={setSelectedMemberId} roleById={roleById} /> : <TeamRolesTab memberRoleMap={membersByRole} onDelete={(role) => {
        if (!role.builtin && (membersByRole[role.id] ?? 0) === 0) setRoleToDelete(role.name);
      }} onEdit={(role) => openRoleEditor("edit", role)} roles={roles} />}</main> : <TeamStatePanel state={viewState as TeamViewState}>{teamStateCopy[viewState === "degraded" ? "degraded" : viewState].body}</TeamStatePanel>}
      <InviteModal draft={inviteDraft} onClose={() => setInviteOpen(false)} onSubmit={submitInvite} onUpdate={setInviteDraft} open={inviteOpen} roles={roles} />
      <RoleEditorModal draft={roleDraft} onClose={() => setRoleDraft(null)} onSave={saveRole} onUpdate={setRoleDraft} open={Boolean(roleDraft)} />
      <MemberDrawer member={member} onClose={() => setSelectedMemberId(null)} onSetNotify={setNotify} onToggleDisable={setDisable} onToggleTelegram={setTelegram} roleName={member ? roleById(member.roleId)?.name : undefined} />
      <RoleDeleteConfirm name={roleToDelete} onCancel={() => setRoleToDelete("") } onConfirm={confirmDeleteRole} open={Boolean(roleToDelete)} />
    </section>
  );
}
