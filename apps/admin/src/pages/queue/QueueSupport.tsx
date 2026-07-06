import { createElement as h, useCallback, useEffect, useMemo, useState } from "react";
import { Ban, Check, Pencil, Trash2, type LucideIcon } from "lucide-react";
import {
  createConfirmationQueueApiClient,
  type ConfirmationDecisionRequest,
  type ConfirmationQueueApiFetcher
} from "../../confirmationQueueApiClient";
import { Button, IconSlot, type ButtonProps } from "../../primitives";
import { PageState } from "../../patterns";
import {
  fallbackItems,
  fallbackUnavailableCopy,
  runtimeDisplayItem,
  type DisplayQueueItem,
  type QueueMetric,
  type QueueMode
} from "./queueFallback";

export type LoadStatus = "loading" | "ready";
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
  const [items, setItems] = useState<DisplayQueueItem[]>([]);
  const [lastError, setLastError] = useState("");
  const [mode, setMode] = useState<QueueMode>("degraded");
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setStatus("loading");
    setLastError("");
    try {
      const next = await client.listItems({ status: "pending" });
      if (next.length === 0) {
        setMode("degraded");
        setItems(fallbackItems);
        setLastError(fallbackUnavailableCopy.empty);
      } else {
        setMode("runtime");
        setItems(next.map(runtimeDisplayItem));
      }
      setStatus("ready");
    } catch (error) {
      const message = errorMessage(error);
      const reason = message.includes("status 403") ? "permission" : "error";
      setMode("degraded");
      setItems(fallbackItems);
      setLastError(`${fallbackUnavailableCopy[reason]} (${message})`);
      setStatus("ready");
    }
  }, [client]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const submit = useCallback(
    async (itemId: string, decision: ConfirmationDecisionRequest) => {
      if (mode !== "runtime") {
        throw new Error("runtime unavailable: degraded/read-only queue cannot write");
      }
      setSubmittingId(itemId);
      setLastError("");
      try {
        const result = await client.submitDecision(itemId, decision);
        setItems((current) =>
          current.map((item) =>
            item.id === itemId ? runtimeDisplayItem(result.item) : item
          )
        );
        return result;
      } catch (error) {
        setLastError(errorMessage(error));
        throw error;
      } finally {
        setSubmittingId(null);
      }
    },
    [client, mode]
  );

  return {
    canWrite: mode === "runtime",
    items,
    lastError,
    mode,
    reload,
    status,
    submit,
    submittingId
  };
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
  readOnly: boolean,
  submitting: boolean,
  handlers: QueueHandlers
): Act[] {
  if (conflict) {
    return [
      {
        disabled: readOnly,
        icon: Check,
        label: readOnly ? "采纳候选值 · runtime unavailable" : "采纳候选值",
        loading: submitting,
        onRun: handlers.onApprove,
        variant: "success"
      },
      {
        disabled: true,
        label: readOnly ? "保留当前值 · no runtime contract" : "保留当前值",
        variant: "secondary"
      }
    ];
  }
  return [
    {
      disabled: readOnly,
      icon: Check,
      kbd: "A",
      label: readOnly ? "通过 · read-only" : "通过",
      loading: submitting,
      onRun: handlers.onApprove,
      variant: "success"
    },
    {
      className: "uz-queue-desktop-only",
      disabled: readOnly,
      icon: Pencil,
      kbd: "E",
      label: readOnly ? "编辑 · local-only" : "编辑",
      onRun: handlers.onEdit
    },
    {
      className: "uz-queue-mobile-only",
      disabled: true,
      label: readOnly ? "桌面编辑 · read-only" : "桌面编辑"
    },
    {
      disabled: readOnly,
      icon: Trash2,
      kbd: "D",
      label: readOnly ? "丢弃 · read-only" : "丢弃",
      onRun: handlers.onDiscard
    },
    {
      disabled: readOnly,
      icon: Ban,
      label: readOnly ? "拦截 · read-only" : "拦截",
      onRun: handlers.onBlock,
      variant: "danger"
    }
  ];
}

export function QueueStats({ stats }: { stats: QueueMetric[] }) {
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
  readOnly,
  onCancel,
  onSave
}: {
  canSave: boolean;
  readOnly: boolean;
  onCancel: () => void;
  onSave: () => void;
}) {
  return [
    h(Button, { key: "cancel", onClick: onCancel, variant: "secondary" }, "取消编辑"),
    h(
      Button,
      { disabled: !canSave, key: "save", onClick: onSave, variant: "success" },
      readOnly ? "runtime unavailable · read-only" : "保存并通过"
    )
  ];
}

export function renderQueueState(status: LoadStatus) {
  if (status === "ready") return null;
  return h(PageState, {
    "data-testid": "m7-queue-loading",
    kind: status,
    message: "正在读取确认队列运行时；若不可用将进入 mock/degraded read-only 可见壳。",
    title: "确认队列加载中"
  } as unknown as Parameters<typeof PageState>[0]);
}

const queueCss = `.uz-page-queue{display:flex;min-height:0;flex:1;flex-direction:column;background:var(--paper);color:var(--ink-900);font-family:var(--font-body)}.uz-page-queue *{box-sizing:border-box}.uz-queue-strip{display:flex;flex:none;align-items:center;gap:16px;border-bottom:1px solid var(--ink-150);background:var(--card);padding:13px 24px}.uz-queue-title{margin:0;font:800 16px/1.3 var(--font-display);white-space:nowrap}.uz-queue-stats{display:flex;min-width:0;align-items:stretch}.uz-queue-stats>div{display:flex;min-width:86px;flex-direction:column;gap:2px;border-left:1px solid var(--ink-075);padding:0 18px}.uz-queue-stats span{color:var(--ink-500);font-size:10px;line-height:1.2}.uz-queue-stats strong{overflow:hidden;color:var(--ink-900);font:800 14px/1.25 var(--font-data);text-overflow:ellipsis;white-space:nowrap}.uz-queue-stats .is-danger strong{color:var(--state-human)}.uz-queue-stats .is-warn strong{color:var(--state-warn)}.uz-queue-stats .is-off strong{color:var(--state-off)}.uz-queue-keyboard{margin-left:auto;display:flex;align-items:center;gap:6px;border-radius:6px;background:var(--ink-075);color:var(--ink-500);font-size:11px;padding:5px 10px;white-space:nowrap}.uz-queue-keyboard>span{display:flex;align-items:center;gap:5px}.uz-queue-mode{white-space:nowrap}.uz-queue-banner{margin:14px 24px 0}.uz-queue-banner-actions{display:flex;gap:8px}.uz-queue-reason{margin:0 24px;border:1px solid var(--state-warn-border);border-top:0;border-radius:0 0 8px 8px;background:var(--state-warn-bg);color:var(--ink-700);font-size:12px;line-height:1.6;padding:0 14px 12px 40px}.uz-queue-body{min-height:0;flex:1;overflow:auto;padding:18px 0 40px}.uz-queue-flow{display:grid;width:min(100%,680px);margin:0 auto;gap:12px;padding:0 24px}.uz-queue-kv,.uz-queue-diff{display:grid;gap:var(--s-4)}.uz-queue-card{overflow:hidden;border:1px solid var(--ink-150);border-radius:10px;background:var(--card);cursor:pointer;transition:border-color .12s ease}.uz-queue-card.is-focused{border-color:var(--ink-900);box-shadow:0 4px 12px rgb(26 29 33 / 10%)}.uz-queue-card.is-conflict:not(.is-focused){border-color:var(--state-human-border)}.uz-queue-card.is-decided{border-color:var(--ink-150);color:var(--ink-500);background:color-mix(in srgb,var(--ink-075) 72%,var(--card));opacity:.72}.uz-queue-card.is-decided h3,.uz-queue-card.is-decided dd{color:var(--ink-500)}.uz-queue-card header{display:flex;align-items:center;gap:9px;border-bottom:1px solid var(--ink-075);padding:12px 16px}.uz-queue-card h3{min-width:0;flex:1;margin:0;overflow-wrap:anywhere;color:var(--ink-900);font:800 14px/1.35 var(--font-body)}.uz-queue-score{font:700 11px/1 var(--font-data);color:var(--ink-500)}.uz-queue-kv{padding:13px 16px}.uz-queue-kv>div{display:grid;grid-template-columns:64px minmax(0,1fr);gap:12px;padding:4px 0;font-size:12px}.uz-queue-kv dt{color:var(--ink-500)}.uz-queue-kv dd{margin:0;color:var(--ink-900);line-height:1.5;overflow-wrap:anywhere}.uz-queue-kv .is-mono,.uz-queue-diff strong{font-family:var(--font-data);font-weight:700}.uz-queue-diff{grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);gap:1px;background:var(--ink-150)}.uz-queue-diff>div{display:grid;gap:7px;background:var(--card);padding:13px 16px}.uz-queue-diff span{color:var(--ink-500);font-size:10px;font-weight:800}.uz-queue-diff strong{display:block;border:1px solid var(--ink-150);border-radius:6px;background:var(--paper);color:var(--ink-900);font-size:12px;line-height:1.55;padding:7px 10px;overflow-wrap:anywhere}.uz-queue-diff .uz-icon-slot{align-self:center;background:var(--card)}.uz-queue-diff p{grid-column:1/-1;margin:0;border-top:1px solid var(--ink-075);background:var(--paper);color:var(--ink-500);font-size:11px;padding:9px 16px}.uz-queue-actions{display:flex;align-items:center;gap:8px;border-top:1px solid var(--ink-075);background:var(--paper);padding:11px 16px}.uz-queue-mobile-only{display:none}.uz-queue-edit-ref{display:grid;gap:6px}.uz-queue-edit-ref span{color:var(--ink-500);font-size:12px;font-weight:800}@media(max-width:920px){.uz-queue-strip{align-items:flex-start;flex-wrap:wrap}.uz-queue-keyboard{margin-left:0}.uz-queue-stats{order:3;width:100%;overflow:auto}.uz-queue-stats>div{min-width:118px}}@media(max-width:720px){.uz-queue-strip{padding:12px}.uz-queue-title{width:100%}.uz-queue-keyboard{white-space:normal}.uz-queue-keyboard>span{flex-wrap:wrap}.uz-queue-banner,.uz-queue-reason{margin-left:12px;margin-right:12px}.uz-queue-body{padding-top:12px}.uz-queue-flow{padding:0 12px}.uz-queue-diff,.uz-queue-kv>div{grid-template-columns:1fr}.uz-queue-diff .uz-icon-slot{display:none}.uz-queue-card header,.uz-queue-actions{align-items:stretch;flex-direction:column}.uz-queue-card header{gap:7px}.uz-queue-desktop-only{display:none}.uz-queue-mobile-only{display:inline-flex}}`;

export const QueueStyles = () => h("style", null, queueCss);
