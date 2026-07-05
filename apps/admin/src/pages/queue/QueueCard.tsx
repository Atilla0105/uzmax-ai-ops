import { createElement as h } from "react";
import { GitCompare } from "lucide-react";
import { IconSlot, StatusBadge } from "../../primitives";
import { ActionButton, cardActions, type QueueHandlers } from "./QueueSupport";
import {
  queueRuntimeBoundary,
  type DisplayQueueItem,
  type QueueMode
} from "./queueFallback";

type Item = DisplayQueueItem;
type Props = QueueHandlers & {
  focused: boolean;
  item: Item;
  readOnly: boolean;
  submitting: boolean;
};

export const controlledRefPattern = /^(controlled|manifest|storage):\/\/[^\s]+$/i;

const kindCopy: Record<Item["kind"], string> = {
  conflict_candidate: "冲突候选",
  eval_candidate: "评测候选",
  knowledge_candidate: "知识候选",
  profile_candidate: "档案候选"
};
const statusCopy = {
  approved: { className: "is-decided", label: "已通过", tone: "ok" },
  blocked: { className: "is-decided", label: "已拦截", tone: "danger" },
  discarded: { className: "is-decided", label: "已丢弃", tone: "neutral" },
  edited: { className: "is-decided", label: "已编辑通过", tone: "ok" },
  pending: { className: undefined, label: "待确认", tone: "warn" }
} as const;

function collectRefs(value: unknown, refs: string[] = []): string[] {
  if (refs.length >= 4) return refs;
  if (typeof value === "string" && controlledRefPattern.test(value)) refs.push(value);
  else if (value && typeof value === "object") {
    const entries = Array.isArray(value) ? value : Object.values(value);
    entries.forEach((entry) => collectRefs(entry, refs));
  }
  return refs;
}

export function firstRef(value: unknown): string {
  return collectRefs(value)[0] ?? "controlled://m7-ui-10/unavailable-ref";
}

export function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return (
    ["input", "select", "textarea"].includes(target.tagName.toLowerCase()) ||
    target.isContentEditable
  );
}

export function nextPending(items: Item[], from: number) {
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

export function queueStats(items: Item[], mode: QueueMode) {
  const pending = items.filter((item) => item.status === "pending").length;
  const conflicts = items.filter((item) => item.kind === "conflict_candidate").length;
  if (mode === "degraded") {
    return [
      { label: "今日候选", tone: "warn", value: "6 / 5" },
      { label: "7日通过率", tone: "warn", value: "32%" },
      { label: "蒸馏频率", value: "每日 5" },
      { label: "冲突待处理", tone: "danger", value: `${conflicts}` },
      { label: "最近降频", tone: "neutral", value: "通过率低" }
    ];
  }
  return [
    { label: "今日候选", value: `${pending}` },
    { label: "7日通过率", tone: "warn", value: "待连接" },
    { label: "蒸馏频率", tone: "warn", value: "待连接" },
    { label: "冲突待处理", tone: "danger", value: `${conflicts}` },
    { label: "最近降频", tone: "neutral", value: "待确认" }
  ];
}

function queueCardClass(focused: boolean, status: Item["status"], isConflict: boolean) {
  return [
    "uz-queue-card",
    focused && "is-focused",
    statusCopy[status].className,
    isConflict && "is-conflict"
  ]
    .filter(Boolean)
    .join(" ");
}

function renderScore(score: string | undefined) {
  return score ? h("span", { className: "uz-queue-score" }, `置信 ${score}`) : null;
}

function renderModeBadge(mode: Item["displayMode"]) {
  return mode === "degraded" ? h(StatusBadge, { tone: "warn" }, "待连接") : null;
}

function renderActionFooter({
  focused,
  handlers,
  isConflict,
  pending,
  readOnly,
  submitting
}: {
  focused: boolean;
  handlers: QueueHandlers;
  isConflict: boolean;
  pending: boolean;
  readOnly: boolean;
  submitting: boolean;
}) {
  if (!pending || !focused) return null;
  return h(
    "footer",
    { className: "uz-queue-actions" },
    cardActions(isConflict, readOnly, submitting, handlers).map((action) =>
      h(ActionButton, { ...action, key: action.label })
    )
  );
}

export function QueueCard({ focused, item, readOnly, submitting, ...handlers }: Props) {
  const isConflict = item.kind === "conflict_candidate";
  const pending = item.status === "pending";
  const display = item.display;
  const classes = queueCardClass(focused, item.status, isConflict);
  return h(
    "article",
    {
      "aria-current": focused ? "true" : undefined,
      "aria-description":
        item.displayMode === "degraded" ? queueRuntimeBoundary : undefined,
      className: classes,
      "data-runtime-boundary":
        item.displayMode === "degraded" ? queueRuntimeBoundary : undefined,
      "data-kind": item.kind,
      "data-testid": `m7-queue-card-${item.id}`,
      onClick: handlers.onFocus,
      tabIndex: pending ? 0 : undefined
    },
    h(
      "header",
      null,
      h(
        StatusBadge,
        { dot: true, tone: isConflict ? "danger" : "info" },
        kindCopy[item.kind]
      ),
      h("h3", null, display.title),
      renderScore(display.score),
      renderModeBadge(item.displayMode),
      h(
        StatusBadge,
        { tone: statusCopy[item.status].tone },
        statusCopy[item.status].label
      )
    ),
    h(
      "dl",
      { className: "uz-queue-kv" },
      display.fields.map((field) =>
        h(
          "div",
          { key: field.label },
          h("dt", null, field.label),
          h("dd", { className: field.mono ? "is-mono" : undefined }, field.value)
        )
      )
    ),
    isConflict ? h(ConflictDiff, { item }) : null,
    renderActionFooter({
      focused,
      handlers,
      isConflict,
      pending,
      readOnly,
      submitting
    })
  );
}

function ConflictDiff({ item }: { item: Item }) {
  const record = (item.diffPayload ?? {}) as Record<string, unknown>;
  const left = item.display.current ?? {
    label: "当前值引用",
    value: firstRef(record.left ?? record.current ?? record.before)
  };
  const right = item.display.candidate ?? {
    label: "候选值引用",
    value: firstRef(record.right ?? record.candidate ?? record.after)
  };
  return h(
    "section",
    { className: "uz-queue-diff", "data-testid": `m7-queue-diff-${item.id}` },
    h("div", null, h("span", null, left.label), h("strong", null, left.value)),
    h(IconSlot, { icon: GitCompare, label: "diff" }),
    h("div", null, h("span", null, right.label), h("strong", null, right.value)),
    h(
      "p",
      null,
      item.display.conflictNote ??
        "冲突候选需显式查看并排 diff；键盘 A/D 不会直接处理。"
    )
  );
}
