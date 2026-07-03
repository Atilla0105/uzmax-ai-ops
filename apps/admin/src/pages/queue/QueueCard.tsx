import type { MouseEvent } from "react";
import {
  Ban,
  Check,
  GitCompare,
  Pencil,
  RefreshCw,
  Trash2,
  type LucideIcon
} from "lucide-react";
import { Button, IconSlot, Kbd, StatusBadge, type ButtonProps } from "../../primitives";
import { PageState } from "../../patterns";
import type { ConfirmationQueueItem } from "./QueuePage";

export const controlledRefPattern = /^(controlled|manifest|storage):\/\/[^\s]+$/i;

const kindCopy: Record<ConfirmationQueueItem["kind"], string> = {
  conflict_candidate: "冲突候选",
  eval_candidate: "评测候选",
  knowledge_candidate: "知识候选",
  profile_candidate: "档案候选"
};
const statusCopy: Record<
  ConfirmationQueueItem["status"],
  { label: string; tone: "danger" | "neutral" | "ok" | "warn" }
> = {
  approved: { label: "已通过", tone: "ok" },
  blocked: { label: "已拦截", tone: "danger" },
  discarded: { label: "已丢弃", tone: "neutral" },
  edited: { label: "已编辑通过", tone: "ok" },
  pending: { label: "待确认", tone: "warn" }
};
// prettier-ignore
const stateCopy = { empty: { message: "当前运行时返回 0 条待处理候选。页面不会回退到 fixture 或原型样例。", title: "没有待处理候选" }, loading: { message: "正在读取确认队列运行时，不加载本地示例卡片。", title: "确认队列加载中" }, permission: { message: "当前账号缺少 confirmation:read 或 confirmation:write。后端权限仍是最终边界。", title: "无确认队列权限" } };
type QueueState = keyof typeof stateCopy | "error" | "ready";
// prettier-ignore
type ActionButtonProps = { className?: string; disabled?: boolean; icon?: LucideIcon; kbd?: string; label: string; loading?: boolean; onRun?: () => void; variant?: ButtonProps["variant"] };
type QueueStatsProps = {
  stats: Array<{ label: string; tone?: string; value: string }>;
};
type EditActionsProps = { canSave: boolean; onCancel: () => void; onSave: () => void };
// prettier-ignore
type QueueCardProps = { focused: boolean; item: ConfirmationQueueItem; onApprove: () => void; onBlock: () => void; onDiscard: () => void; onEdit: () => void; onFocus: () => void; submitting: boolean };

export function collectRefs(value: unknown, refs: string[] = []): string[] {
  if (refs.length >= 4) return refs;
  if (typeof value === "string" && controlledRefPattern.test(value)) {
    refs.push(value);
    return refs;
  }
  if (!value || typeof value !== "object") return refs;
  if (Array.isArray(value)) value.forEach((entry) => collectRefs(entry, refs));
  else
    Object.values(value as Record<string, unknown>).forEach((entry) =>
      collectRefs(entry, refs)
    );
  return refs;
}

export function firstRef(value: unknown): string {
  return collectRefs(value)[0] ?? "controlled://m7-ui-10/unavailable-ref";
}

export function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return (
    tag === "input" ||
    tag === "select" ||
    tag === "textarea" ||
    target.isContentEditable
  );
}

export function nextPending(items: ConfirmationQueueItem[], from: number) {
  const after = items.findIndex(
    (item, index) => index > from && item.status === "pending"
  );
  const any = items.findIndex((item) => item.status === "pending");
  return after >= 0
    ? after
    : any >= 0
      ? any
      : Math.max(0, Math.min(from, items.length - 1));
}

export function reasonRef(action: "approve" | "block" | "discard" | "edit") {
  return `controlled://m7-ui-10/confirmation/${action}`;
}

export function queueStats(items: ConfirmationQueueItem[]) {
  return [
    { label: "今日候选", value: `${items.length}/10` },
    { label: "7日通过率", tone: "warn", value: "健康 API 未接入" },
    { label: "蒸馏频率", value: "只读阻断" },
    {
      label: "冲突待处理",
      tone: "danger",
      value: String(items.filter((item) => item.kind === "conflict_candidate").length)
    },
    { label: "最近降频", tone: "muted", value: "需运行时合约" }
  ];
}

function diffSides(item: ConfirmationQueueItem) {
  const record = (item.diffPayload ?? {}) as Record<string, unknown>;
  return {
    left: firstRef(record.left ?? record.current ?? record.before),
    right: firstRef(record.right ?? record.candidate ?? record.after)
  };
}

function click(action?: () => void) {
  // prettier-ignore
  return action ? (event: MouseEvent<HTMLButtonElement>) => { event.stopPropagation(); action(); } : undefined;
}

function ActionButton({
  className,
  disabled,
  icon,
  kbd,
  label,
  loading,
  onRun,
  variant
}: ActionButtonProps) {
  return (
    // prettier-ignore
    <Button className={className} disabled={disabled} icon={icon ? <IconSlot icon={icon} /> : undefined} isLoading={loading} kbd={kbd} onClick={click(onRun)} variant={variant}>{label}</Button>
  );
}

export function QueueStats({ stats }: QueueStatsProps) {
  return (
    // prettier-ignore
    <div className="uz-queue-stats" data-testid="m7-queue-stats">
      {stats.map((stat) => <div className={stat.tone ? `is-${stat.tone}` : undefined} key={stat.label}><span>{stat.label}</span><strong>{stat.value}</strong></div>)}
    </div>
  );
}

export function EditActions({ canSave, onCancel, onSave }: EditActionsProps) {
  return (
    // prettier-ignore
    <>
      <Button onClick={onCancel} variant="secondary">取消编辑</Button>
      <Button disabled={!canSave} onClick={onSave} variant="success">保存并通过</Button>
    </>
  );
}

export function QueueCard({
  focused,
  item,
  onApprove,
  onBlock,
  onDiscard,
  onEdit,
  onFocus,
  submitting
}: QueueCardProps) {
  const isConflict = item.kind === "conflict_candidate";
  const pending = item.status === "pending";
  // prettier-ignore
  const classes = ["uz-queue-card", focused && "is-focused", !pending && "is-decided", isConflict && "is-conflict"].filter(Boolean).join(" ");
  return (
    // prettier-ignore
    <article aria-current={focused ? "true" : undefined} className={classes} data-kind={item.kind} data-testid={`m7-queue-card-${item.id}`} onClick={onFocus}>
      <header><StatusBadge dot tone={isConflict ? "danger" : "info"}>{kindCopy[item.kind]}</StatusBadge>
        <h3>{item.id}</h3>
        <StatusBadge tone={statusCopy[item.status].tone}>{statusCopy[item.status].label}</StatusBadge>
      </header>
      <dl className="uz-queue-kv">
        <div><dt>sourceRef</dt><dd>{item.sourceRef}</dd></div>
        <div><dt>createdAt</dt><dd>{item.createdAt}</dd></div>
        <div><dt>candidate refs</dt><dd>{collectRefs(item.candidatePayload).join(" · ") || "无可展示引用"}</dd></div>
      </dl>
      {isConflict ? <ConflictDiff item={item} /> : null}
      {pending ? (
        <footer className="uz-queue-actions">
          {isConflict ? (
            <>
              <ActionButton icon={Check} label="采纳候选值" loading={submitting} onRun={onApprove} variant="success" />
              <ActionButton disabled label="保留当前值" variant="secondary" />
            </>
          ) : (
            <>
              <ActionButton icon={Check} kbd="A" label="通过" loading={submitting} onRun={onApprove} variant="success" />
              <ActionButton className="uz-queue-desktop-only" icon={Pencil} kbd="E" label="编辑" onRun={onEdit} />
              <ActionButton className="uz-queue-mobile-only" disabled label="桌面编辑" />
              <ActionButton icon={Trash2} kbd="D" label="丢弃" onRun={onDiscard} />
            </>
          )}
          <ActionButton icon={Ban} label="拦截" onRun={onBlock} variant="danger" />
        </footer>
      ) : null}
    </article>
  );
}

export function renderQueueState(
  status: QueueState,
  message: string,
  reload: () => void
) {
  if (status === "ready") return null;
  if (status !== "error") {
    return (
      // prettier-ignore
      <PageState data-testid={`m7-queue-${status}`} kind={status} {...stateCopy[status]} />
    );
  }
  return (
    // prettier-ignore
    <PageState action={<ActionButton icon={RefreshCw} label="重试" onRun={reload} />} data-testid="m7-queue-error" kind="error" message={message} title="确认队列运行时不可用" />
  );
}

function ConflictDiff({ item }: { item: ConfirmationQueueItem }) {
  const sides = diffSides(item);
  return (
    // prettier-ignore
    <section className="uz-queue-diff" data-testid={`m7-queue-diff-${item.id}`}>
      <div><span>当前值引用</span><strong>{sides.left}</strong></div>
      <IconSlot icon={GitCompare} label="diff" />
      <div><span>候选值引用</span><strong>{sides.right}</strong></div>
      <p>冲突候选需显式查看并排 diff；键盘 <Kbd>A</Kbd>/<Kbd>D</Kbd> 不会直接处理。</p>
    </section>
  );
}
