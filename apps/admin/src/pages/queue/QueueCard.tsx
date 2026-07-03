import { createElement as h } from "react";
import { GitCompare } from "lucide-react";
import { IconSlot, StatusBadge } from "../../primitives";
import {
  ActionButton,
  cardActions,
  type ConfirmationQueueItem,
  type QueueHandlers
} from "./QueueSupport";

type Item = ConfirmationQueueItem;
type Props = QueueHandlers & { focused: boolean; item: Item; submitting: boolean };

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

export function queueStats(items: Item[]) {
  const pending = items.filter((item) => item.status === "pending").length;
  const conflicts = items.filter((item) => item.kind === "conflict_candidate").length;
  return [
    { label: "待确认候选", value: String(pending) },
    { label: "冲突待处理", tone: "danger", value: String(conflicts) },
    { label: "蒸馏健康", tone: "warn", value: "健康 API 未接入" }
  ];
}

export function QueueCard({ focused, item, submitting, ...handlers }: Props) {
  const isConflict = item.kind === "conflict_candidate";
  const pending = item.status === "pending";
  const classes = [
    "uz-queue-card",
    focused && "is-focused",
    statusCopy[item.status].className,
    isConflict && "is-conflict"
  ]
    .filter(Boolean)
    .join(" ");
  const fields = [
    ["sourceRef", item.sourceRef],
    ["createdAt", item.createdAt],
    ["candidate refs", collectRefs(item.candidatePayload).join(" · ") || "无可展示引用"]
  ];
  return h(
    "article",
    {
      "aria-current": focused ? "true" : undefined,
      className: classes,
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
      h("h3", null, item.id),
      h(
        StatusBadge,
        { tone: statusCopy[item.status].tone },
        statusCopy[item.status].label
      )
    ),
    h(
      "dl",
      { className: "uz-queue-kv" },
      fields.map(([label, value]) =>
        h("div", { key: label }, h("dt", null, label), h("dd", null, value))
      )
    ),
    isConflict ? h(ConflictDiff, { item }) : null,
    pending && focused
      ? h(
          "footer",
          { className: "uz-queue-actions" },
          cardActions(isConflict, submitting, handlers).map((action) =>
            h(ActionButton, { ...action, key: action.label })
          )
        )
      : null
  );
}

function ConflictDiff({ item }: { item: Item }) {
  const record = (item.diffPayload ?? {}) as Record<string, unknown>;
  const left = firstRef(record.left ?? record.current ?? record.before);
  const right = firstRef(record.right ?? record.candidate ?? record.after);
  return h(
    "section",
    { className: "uz-queue-diff", "data-testid": `m7-queue-diff-${item.id}` },
    h("div", null, h("span", null, "当前值引用"), h("strong", null, left)),
    h(IconSlot, { icon: GitCompare, label: "diff" }),
    h("div", null, h("span", null, "候选值引用"), h("strong", null, right)),
    h("p", null, "冲突候选需显式查看并排 diff；键盘 A/D 不会直接处理。")
  );
}
