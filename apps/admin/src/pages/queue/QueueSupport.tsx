import { createElement as h, useCallback, useEffect, useMemo, useState } from "react";
import { Ban, Check, Pencil, RefreshCw, Trash2, type LucideIcon } from "lucide-react";
import {
  createConfirmationQueueApiClient,
  type ConfirmationDecisionRequest,
  type ConfirmationQueueApiFetcher
} from "../../confirmationQueueApiClient";
import { Button, IconSlot, type ButtonProps } from "../../primitives";
import { PageState } from "../../patterns";

type QueueClient = ReturnType<typeof createConfirmationQueueApiClient>;
export type ConfirmationQueueItem = Awaited<
  ReturnType<QueueClient["listItems"]>
>[number];
export type LoadStatus = "empty" | "error" | "loading" | "permission" | "ready";
export type SubmitAction = "approve" | "block" | "discard";
export type QueueHandlers = Record<
  "onApprove" | "onBlock" | "onDiscard" | "onEdit" | "onFocus",
  () => void
>;
type Act = Pick<ButtonProps, "className" | "disabled" | "kbd" | "variant"> & {
  icon?: LucideIcon;
  label: string;
  loading?: boolean;
  onRun?: () => void;
};

const browserFetcher: ConfirmationQueueApiFetcher = (input, init) =>
  window.fetch(input, init as RequestInit);

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "confirmation queue request failed";
}

export function useQueueRuntime() {
  const client = useMemo(
    () => createConfirmationQueueApiClient({ fetcher: browserFetcher }),
    []
  );
  const [items, setItems] = useState<ConfirmationQueueItem[]>([]);
  const [lastError, setLastError] = useState("");
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setStatus("loading");
    setLastError("");
    try {
      const next = await client.listItems({ status: "pending" });
      setItems(next);
      setStatus(next.length === 0 ? "empty" : "ready");
    } catch (error) {
      const message = errorMessage(error);
      setItems([]);
      setLastError(message);
      setStatus(message.includes("status 403") ? "permission" : "error");
    }
  }, [client]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const submit = useCallback(
    async (itemId: string, decision: ConfirmationDecisionRequest) => {
      setSubmittingId(itemId);
      setLastError("");
      try {
        const result = await client.submitDecision(itemId, decision);
        setItems((current) =>
          current.map((item) => (item.id === itemId ? result.item : item))
        );
        return result;
      } catch (error) {
        setLastError(errorMessage(error));
        throw error;
      } finally {
        setSubmittingId(null);
      }
    },
    [client]
  );

  return { items, lastError, reload, status, submit, submittingId };
}

function click(action?: () => void): ButtonProps["onClick"] {
  return action
    ? (event) => {
        event.stopPropagation();
        action();
      }
    : undefined;
}

export function ActionButton({ icon, label, loading, onRun, ...props }: Act) {
  return h(
    Button,
    {
      ...props,
      icon: icon ? h(IconSlot, { icon }) : undefined,
      isLoading: loading,
      onClick: click(onRun)
    },
    label
  );
}

export function cardActions(
  conflict: boolean,
  submitting: boolean,
  handlers: QueueHandlers
): Act[] {
  if (conflict) {
    return [
      {
        icon: Check,
        label: "采纳候选值",
        loading: submitting,
        onRun: handlers.onApprove,
        variant: "success"
      },
      { disabled: true, label: "保留当前值", variant: "secondary" }
    ];
  }
  return [
    {
      icon: Check,
      kbd: "A",
      label: "通过",
      loading: submitting,
      onRun: handlers.onApprove,
      variant: "success"
    },
    {
      className: "uz-queue-desktop-only",
      icon: Pencil,
      kbd: "E",
      label: "编辑",
      onRun: handlers.onEdit
    },
    { className: "uz-queue-mobile-only", disabled: true, label: "桌面编辑" },
    { icon: Trash2, kbd: "D", label: "丢弃", onRun: handlers.onDiscard },
    { icon: Ban, label: "拦截", onRun: handlers.onBlock, variant: "danger" }
  ];
}

export function QueueStats({
  stats
}: {
  stats: Array<{ label: string; tone?: string; value: string }>;
}) {
  return h(
    "div",
    { className: "uz-queue-stats", "data-testid": "m7-queue-stats" },
    stats.map((stat) =>
      h(
        "div",
        { className: stat.tone ? `is-${stat.tone}` : undefined, key: stat.label },
        h("span", null, stat.label),
        h("strong", null, stat.value)
      )
    )
  );
}

export function EditActions({
  canSave,
  onCancel,
  onSave
}: {
  canSave: boolean;
  onCancel: () => void;
  onSave: () => void;
}) {
  return [
    h(Button, { key: "cancel", onClick: onCancel, variant: "secondary" }, "取消编辑"),
    h(
      Button,
      { disabled: !canSave, key: "save", onClick: onSave, variant: "success" },
      "保存并通过"
    )
  ];
}

export function renderQueueState(
  status: LoadStatus,
  message: string,
  reload: () => void
) {
  if (status === "ready") return null;
  const copy = {
    empty: { message: "不会回退到 fixture。", title: "没有待处理候选" },
    loading: { message: "正在读取确认队列运行时。", title: "确认队列加载中" },
    permission: {
      message: "缺少 confirmation:read 或 confirmation:write。",
      title: "无确认队列权限"
    }
  };
  const props =
    status === "error"
      ? {
          action: h(ActionButton, { icon: RefreshCw, label: "重试", onRun: reload }),
          message,
          title: "确认队列运行时不可用"
        }
      : copy[status];
  const pageStateProps = {
    "data-testid": `m7-queue-${status}`,
    kind: status,
    ...props
  } as unknown as Parameters<typeof PageState>[0];
  return h(PageState, pageStateProps);
}

const queueCss = `.uz-page-queue{display:grid;gap:var(--s-8);padding:var(--s-10);background:var(--paper)}.uz-queue-stats,.uz-queue-flow,.uz-queue-kv,.uz-queue-diff{display:grid;gap:var(--s-4)}.uz-queue-stats{grid-template-columns:repeat(3,minmax(0,1fr))}.uz-queue-flow{width:min(100%,680px);margin:0 auto}.uz-queue-stats>div,.uz-queue-card{border:1px solid var(--ink-150);border-radius:var(--radius-lg);background:var(--card)}.uz-queue-stats>div,.uz-queue-card header,.uz-queue-kv,.uz-queue-diff,.uz-queue-actions{padding:var(--s-6)}.uz-queue-kv dd,.uz-queue-diff strong{overflow-wrap:anywhere;font:700 var(--text-sm)/1.55 var(--font-data)}.uz-queue-card header,.uz-queue-actions,.uz-queue-keyboard,.uz-queue-keyboard>span{display:flex;flex-wrap:wrap;align-items:center;gap:var(--s-4)}.uz-queue-card{overflow:hidden}.uz-queue-card.is-focused{border-color:var(--ink-900);box-shadow:var(--shadow-focus)}.uz-queue-card.is-decided{border-color:var(--ink-150);color:var(--ink-500);background:color-mix(in srgb,var(--ink-075) 72%,var(--card))}.uz-queue-card.is-decided h3,.uz-queue-card.is-decided dd{color:var(--ink-500)}.uz-queue-kv>div,.uz-queue-diff{display:grid;grid-template-columns:calc(var(--s-10)*4) minmax(0,1fr);gap:var(--s-5)}.uz-queue-diff{grid-template-columns:minmax(0,1fr) auto minmax(0,1fr)}.uz-queue-kv,.uz-queue-kv dd,.uz-queue-diff p{margin:0}.uz-queue-mobile-only{display:none}@media(max-width:720px){.uz-page-queue{padding:var(--s-6) var(--s-4)}.uz-queue-stats,.uz-queue-diff,.uz-queue-kv>div{grid-template-columns:1fr}.uz-queue-card header,.uz-queue-actions{align-items:stretch;flex-direction:column}.uz-queue-desktop-only{display:none}.uz-queue-mobile-only{display:inline-flex}}`;

export const QueueStyles = () => h("style", null, queueCss);
