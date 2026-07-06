import { useEffect, useMemo, useRef, useState } from "react";
import {
  TEAM_DEFAULT_ROLE_EDITOR,
  teamMembers,
  teamRoles,
  teamStateCopy,
  type InviteDraft,
  type RoleEditorDraft,
  type TeamMember,
  type TeamRole,
  type TeamViewState
} from "./teamFallback";

function readTeamViewState(): TeamViewState {
  const state =
    new URLSearchParams(location.search).get("m7TeamState") ??
    new URLSearchParams(location.search).get("state");
  return state === "loading" ||
    state === "empty" ||
    state === "error" ||
    state === "permission"
    ? state
    : "degraded";
}

const makeInviteInitialDraft = (roleId: string): InviteDraft => ({
  email: "",
  group: "",
  name: "",
  roleId,
  type: "human"
});

const memberDefaults = {
  disabled: false,
  langPref: "系统跟随",
  notifyPref: "全部"
};

const invitedMember = (
  draft: InviteDraft,
  name: string,
  email: string
): TeamMember => ({
  ...memberDefaults,
  account: email,
  active: "0",
  cap: 6,
  group: draft.group || "未分组",
  id: `m-${Date.now()}`,
  initial: name.at(0) ?? "M",
  login: "刚添加",
  name,
  roleId: draft.roleId,
  status: "离线",
  telegram: false,
  today: "0",
  type: draft.type
});

function draftFromRole(
  mode: RoleEditorDraft["mode"],
  roleItem: TeamRole | null = null
): RoleEditorDraft {
  if (mode === "new" || !roleItem)
    return { ...TEAM_DEFAULT_ROLE_EDITOR, id: null, mode };
  return {
    desc: roleItem.desc,
    id: roleItem.id,
    mode,
    name: roleItem.name,
    perms: { ...roleItem.perms }
  };
}

const roleCounts = (members: TeamMember[], roles: TeamRole[]) =>
  members.reduce(
    (acc, member) => ({ ...acc, [member.roleId]: (acc[member.roleId] ?? 0) + 1 }),
    Object.fromEntries(roles.map((item) => [item.id, 0])) as Record<string, number>
  );

export function useTeamPageState() {
  const viewState = readTeamViewState();
  const [members, setMembers] = useState(teamMembers);
  const [roles, setRoles] = useState(teamRoles);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [inviteDraft, setInviteDraft] = useState(
    makeInviteInitialDraft(teamRoles[0]?.id ?? "")
  );
  const [tab, setTab] = useState<"members" | "roles">("members");
  const [search, setSearch] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [roleDraft, setRoleDraft] = useState<RoleEditorDraft | null>(null);
  const [roleToDelete, setRoleToDelete] = useState("");
  const [toast, setToast] = useState("");
  const toastTimer = useRef<number | null>(null);
  const member = useMemo(
    () => members.find((entry) => entry.id === selectedMemberId) ?? null,
    [members, selectedMemberId]
  );
  const roleById = (roleId: string) => roles.find((entry) => entry.id === roleId);
  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q
      ? members.filter((entry) =>
          `${entry.name} ${entry.account} ${entry.group}`.toLowerCase().includes(q)
        )
      : members;
  }, [members, search]);
  const membersByRole = useMemo(() => roleCounts(members, roles), [members, roles]);
  useEffect(
    () => () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    },
    []
  );
  const showToast = (message: string) => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(""), 2400);
  };
  const patchMember = (id: string, update: (entry: TeamMember) => TeamMember) =>
    setMembers((current) =>
      current.map((entry) => (entry.id === id ? update(entry) : entry))
    );
  const saveRole = () => {
    if (!roleDraft?.name.trim()) return;
    const savedRole = {
      builtin: false,
      created: "今天",
      desc: roleDraft.desc,
      id: `r-${Date.now()}`,
      name: roleDraft.name,
      perms: { ...roleDraft.perms },
      type: "自定义"
    };
    setRoles((current) =>
      roleDraft.id
        ? current.map((entry) =>
            entry.id === roleDraft.id
              ? {
                  ...entry,
                  desc: roleDraft.desc,
                  name: roleDraft.name,
                  perms: roleDraft.perms
                }
              : entry
          )
        : [...current, savedRole]
    );
    showToast(
      `${roleDraft.mode === "edit" ? "角色已更新" : "角色已创建"}：${roleDraft.name}`
    );
    setRoleDraft(null);
  };
  const onInviteSubmit = () => {
    const name = inviteDraft.name.trim();
    const email = inviteDraft.email.trim();
    if (!name || !email) return;
    setMembers((current) => [...current, invitedMember(inviteDraft, name, email)]);
    setInviteOpen(false);
    showToast(`邀请已暂存：${name}`);
  };
  return {
    filteredMembers,
    inviteDraft,
    inviteOpen,
    isDegraded: viewState === "degraded",
    member,
    membersByRole,
    roleById,
    roleDraft,
    roleToDelete,
    roles,
    search,
    stateCopy: teamStateCopy[viewState].body,
    tab,
    toast,
    viewState,
    onDeleteRole: (item: TeamRole) =>
      !item.builtin &&
      (membersByRole[item.id] ?? 0) === 0 &&
      setRoleToDelete(item.name),
    onDismissDeleteRole: () => setRoleToDelete(""),
    onInviteClose: () => setInviteOpen(false),
    onInviteOpenMembers: () => {
      setInviteDraft(makeInviteInitialDraft(roles[1]?.id ?? roles[0]?.id ?? ""));
      setInviteOpen(true);
    },
    onInviteSubmit,
    onInviteUpdate: setInviteDraft,
    onMemberClose: () => setSelectedMemberId(null),
    onNotify: (id: string, pref: string) => {
      const target = members.find((entry) => entry.id === id);
      patchMember(id, (entry) => ({ ...entry, notifyPref: pref }));
      showToast(`通知偏好已更新：${target?.name ?? "成员"}`);
    },
    onRoleDeleteConfirm: () => {
      setRoles((current) => current.filter((entry) => entry.name !== roleToDelete));
      showToast(`角色已删除：${roleToDelete}`);
      setRoleToDelete("");
    },
    onRoleDraftClose: () => setRoleDraft(null),
    onRoleDraftCreate: () => setRoleDraft(draftFromRole("new")),
    onRoleDraftEdit: (item: TeamRole) => setRoleDraft(draftFromRole("edit", item)),
    onRoleDraftSave: saveRole,
    onRoleDraftUpdate: setRoleDraft,
    onSelectTab: setTab,
    onSetMember: setSelectedMemberId,
    onSetSearch: setSearch,
    onSetState: (id: string) => {
      const target = members.find((entry) => entry.id === id);
      patchMember(id, (entry) => ({ ...entry, disabled: !entry.disabled }));
      showToast(
        target?.disabled
          ? `账号已恢复：${target.name}`
          : `账号已停用：${target?.name ?? id}`
      );
    },
    onTelegram: (id: string) => {
      const target = members.find((entry) => entry.id === id);
      patchMember(id, (entry) => ({ ...entry, telegram: !entry.telegram }));
      showToast(`Telegram 绑定预览已更新：${target?.name ?? id}`);
    }
  };
}
