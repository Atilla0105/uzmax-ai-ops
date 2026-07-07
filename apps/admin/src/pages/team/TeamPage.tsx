import {
  useMemo,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent
} from "react";
import { ConfirmModal } from "../../patterns";
import {
  emptyInvite,
  initialMembers,
  initialRoles,
  localBoundary,
  readTeamViewState,
  teamStyles,
  type InviteDraft,
  type TeamMember,
  type TeamTab
} from "./teamFallback";
import { renderTeam } from "./teamMarkup";

export function TeamPage({ selectedTenantId }: { selectedTenantId: string }) {
  const viewState = readTeamViewState();
  const [members, setMembers] = useState(initialMembers);
  const [tab, setTab] = useState<TeamTab>("members");
  const [search, setSearch] = useState("");
  const [invite, setInvite] = useState<InviteDraft>(() => emptyInvite(firstRoleId()));
  const [inviteOpen, setInviteOpen] = useState(false);
  const [memberId, setMemberId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<TeamMember | null>(null);
  const [reason, setReason] = useState("");
  const [toast, setToast] = useState("");
  const roleById = useMemo(
    () => new Map(initialRoles.map((role) => [role.id, role])),
    []
  );
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q
      ? members.filter((m) =>
          `${m.name} ${m.account} ${m.group}`.toLowerCase().includes(q)
        )
      : members;
  }, [members, search]);
  const counts = useMemo(() => {
    const next: Record<string, number> = {};
    for (const item of members) next[item.roleId] = (next[item.roleId] ?? 0) + 1;
    return next;
  }, [members]);
  const member = members.find((item) => item.id === memberId) ?? null;
  const roleName = (id: string) => roleById.get(id)?.name ?? "—";
  const submitInvite = () => {
    const name = invite.name.trim();
    const email = invite.email.trim();
    if (!name || !email) return;
    setMembers((current) => [
      ...current,
      {
        account: email,
        active: "0",
        cap: 4,
        disabled: false,
        group: invite.group.trim() || "未分组",
        id: `m-local-${current.length + 1}`,
        initial: name.charAt(0) || "M",
        login: "刚添加",
        name,
        roleId: invite.roleId,
        status: "离线",
        today: "0",
        type: invite.type
      }
    ]);
    setInviteOpen(false);
    setToast(`browser-local only: invite preview added ${name}; ${localBoundary}`);
  };
  const confirmToggle = () => {
    if (!confirm) return;
    setMembers((current) =>
      current.map((item) =>
        item.id === confirm.id
          ? {
              ...item,
              disabled: !item.disabled,
              status: item.disabled ? "在线" : "已停用"
            }
          : item
      )
    );
    setToast(
      `browser-local only: ${confirm.disabled ? "restored" : "disabled"} member ${confirm.name}; ${localBoundary}`
    );
    setConfirm(null);
  };
  const simpleActions: Record<string, () => void> = {
    "close-invite": () => setInviteOpen(false),
    "close-member": () => setMemberId(null),
    "open-invite": () => setInviteOpen(true),
    "submit-invite": submitInvite,
    "tab-members": () => setTab("members"),
    "tab-roles": () => setTab("roles")
  };
  const runAction = (action?: string, id?: string) => {
    if (!action) return;
    if (simpleActions[action]) return simpleActions[action]();
    if (action === "select-member") return setMemberId(id ?? null);
    if (action === "ask-toggle" && member) {
      setReason("");
      return setConfirm(member);
    }
    if (action === "invite-type" && (id === "ai" || id === "human"))
      return setInvite((current) => ({ ...current, type: id }));
  };
  const onClick = (event: MouseEvent<HTMLElement>) => {
    const node = actionNode(event.target);
    runAction(node?.dataset.action, node?.dataset.id);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Enter") return;
    const node = actionNode(event.target);
    runAction(node?.dataset.action, node?.dataset.id);
  };
  const onInput = (event: FormEvent<HTMLElement>) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) && !(target instanceof HTMLSelectElement))
      return;
    const field = target.dataset.field as keyof InviteDraft | "search" | undefined;
    if (field === "search") setSearch(target.value);
    else if (field) setInvite((current) => ({ ...current, [field]: target.value }));
  };
  const html = renderTeam({
    counts,
    filtered,
    invite,
    inviteOpen,
    member,
    roleName,
    search,
    selectedTenantId,
    tab,
    toast,
    viewState
  });
  return (
    <section
      className="uz-team-page"
      data-runtime-state={viewState}
      data-tenant-id={selectedTenantId}
      data-testid="m7-team-page"
    >
      <style>{teamStyles}</style>
      <div
        dangerouslySetInnerHTML={{ __html: html }}
        onClick={onClick}
        onInput={onInput}
        onKeyDown={onKeyDown}
      />
      <TeamMemberConfirmModal
        confirm={confirm}
        onCancel={() => setConfirm(null)}
        onConfirm={confirmToggle}
        reason={reason}
        setReason={setReason}
      />
    </section>
  );
}

function TeamMemberConfirmModal({
  confirm,
  onCancel,
  onConfirm,
  reason,
  setReason
}: {
  confirm: TeamMember | null;
  onCancel: () => void;
  onConfirm: () => void;
  reason: string;
  setReason: (value: string) => void;
}) {
  const isRestore = Boolean(confirm?.disabled);
  const actionLabel = isRestore ? "恢复账号" : "停用账号";
  return (
    <ConfirmModal
      confirmLabel={actionLabel}
      danger={!isRestore}
      description={
        confirm
          ? `${actionLabel}「${confirm.name}」仅更新浏览器 local mock；后端 authz 与审计未接入。`
          : ""
      }
      onCancel={onCancel}
      onConfirm={onConfirm}
      open={Boolean(confirm)}
      reason={{
        label: "原因",
        onChange: setReason,
        placeholder: "必填；仅 local preview",
        required: true,
        value: reason
      }}
      title={actionLabel}
    />
  );
}

function actionNode(target: EventTarget | null) {
  return target instanceof HTMLElement
    ? target.closest<HTMLElement>("[data-action]")
    : null;
}

function firstRoleId() {
  return initialRoles[1]?.id ?? initialRoles[0]?.id ?? "";
}
