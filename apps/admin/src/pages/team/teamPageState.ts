import { useEffect, useMemo, useRef, useState } from "react";
import {
  TEAM_DEFAULT_ROLE_EDITOR,
  localTeamToast,
  makeInviteInitialDraft,
  readTeamViewState,
  teamMembers,
  teamRoles,
  teamStateCopy,
  type InviteDraft,
  type RoleEditorDraft,
  type TeamMember,
  type TeamRole,
  type TeamTab
} from "./teamFallback";

export function useTeamPageState() {
  const viewState = readTeamViewState();
  const isDegraded = viewState === "degraded";
  const [members, setMembers] = useState(teamMembers);
  const [roles, setRoles] = useState(teamRoles);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [inviteDraft, setInviteDraft] = useState<InviteDraft>(
    makeInviteInitialDraft(teamRoles[0]?.id ?? "")
  );
  const [tab, setTab] = useState<TeamTab>("members");
  const [search, setSearch] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [roleDraft, setRoleDraft] = useState<RoleEditorDraft | null>(null);
  const [roleToDelete, setRoleToDelete] = useState("");
  const [toast, setToast] = useState("");
  const toastTimer = useRef<number | null>(null);

  const member = useMemo(
    () =>
      selectedMemberId
        ? (members.find((entry) => entry.id === selectedMemberId) ?? null)
        : null,
    [members, selectedMemberId]
  );

  useEffect(() => {
    return () => {
      if (toastTimer.current) {
        window.clearTimeout(toastTimer.current);
      }
    };
  }, []);

  const roleById = (roleId: string) => roles.find((role) => role.id === roleId);
  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q
      ? members.filter((m) =>
          `${m.name} ${m.account} ${m.group}`.toLowerCase().includes(q)
        )
      : members;
  }, [members, search]);

  const membersByRole = useMemo<Record<string, number>>(
    () =>
      members.reduce(
        (acc, m) => {
          acc[m.roleId] = (acc[m.roleId] ?? 0) + 1;
          return acc;
        },
        Object.fromEntries(roles.map((role) => [role.id, 0])) as Record<
          string,
          number
        >
      ),
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

  const openRoleEditor = (
    mode: RoleEditorDraft["mode"],
    role: TeamRole | null = null
  ) =>
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

  const onInviteSubmit = () => {
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
      }
    ]);
    setInviteOpen(false);
    showToast(`invite added locally: ${name}`);
  };

  const saveRole = () => {
    if (!roleDraft || !roleDraft.name.trim()) return;
    if (roleDraft.mode === "edit" && roleDraft.id)
      setRoles((current) =>
        current.map((r) =>
          r.id === roleDraft.id
            ? {
                ...r,
                desc: roleDraft.desc,
                name: roleDraft.name,
                perms: roleDraft.perms
              }
            : r
        )
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
    showToast(
      `${roleDraft.mode === "edit" ? "updated" : "created"} role ${roleDraft.name}`
    );
    setRoleDraft(null);
  };

  const onDeleteRole = (role: TeamRole) => {
    if (!role.builtin && (membersByRole[role.id] ?? 0) === 0)
      setRoleToDelete(role.name);
  };

  const onRoleDeleteConfirm = () => {
    setRoles((current) => current.filter((r) => r.name !== roleToDelete));
    showToast(`deleted role ${roleToDelete}`);
    setRoleToDelete("");
  };

  const onNotify = (id: string, preference: string) => {
    setMembers((current) =>
      current.map((entry) =>
        entry.id === id ? { ...entry, notifyPref: preference } : entry
      )
    );
    showToast(
      `notification preference updated for ${members.find((entry) => entry.id === id)?.name ?? "member"}`
    );
  };

  const onSetState = (id: string) => {
    setMembers((current) =>
      current.map((entry) =>
        entry.id === id ? { ...entry, disabled: !entry.disabled } : entry
      )
    );
    const target = members.find((entry) => entry.id === id);
    showToast(
      target?.disabled
        ? `restored member ${target.name}`
        : `disabled member ${target?.name ?? id}`
    );
  };

  const onTelegram = (id: string) => {
    setMembers((current) =>
      current.map((entry) =>
        entry.id === id ? { ...entry, telegram: !entry.telegram } : entry
      )
    );
    const target = members.find((entry) => entry.id === id);
    showToast(
      `telegram ${target?.telegram ? "unbound" : "bound"} for ${target?.name ?? id}`
    );
  };

  const stateCopy = teamStateCopy[viewState].body;

  return {
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
    selectedMemberId,
    stateCopy,
    tab,
    toast,
    viewState,
    onDeleteRole,
    onDismissDeleteRole: () => setRoleToDelete(""),
    onInviteUpdate: setInviteDraft,
    onInviteClose: () => setInviteOpen(false),
    onInviteOpenMembers: () => {
      setInviteDraft(makeInviteInitialDraft(roles[0]?.id ?? ""));
      setInviteOpen(true);
    },
    onInviteSubmit,
    onMemberClose: () => setSelectedMemberId(null),
    onNotify,
    onRoleDraftClose: () => setRoleDraft(null),
    onRoleDraftCreate: () => openRoleEditor("new"),
    onRoleDraftEdit: (role) => openRoleEditor("edit", role),
    onRoleDraftSave: saveRole,
    onRoleDraftUpdate: setRoleDraft,
    onRoleDeleteConfirm,
    onSelectTab: (next) => setTab(next),
    onSetMember: (id) => setSelectedMemberId(id),
    onSetSearch: setSearch,
    onSetState,
    onTelegram
  };
}
