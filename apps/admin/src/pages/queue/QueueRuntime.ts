import { createElement as h, useCallback, useEffect, useMemo, useState } from "react";
import {
  createConfirmationQueueApiClient,
  type ConfirmationDecisionRequest,
  type ConfirmationQueueApiFetcher
} from "../../confirmationQueueApiClient";
import {
  createAdminRuntimeFetcher,
  readAdminRuntimeConfig
} from "../../adminRuntimeConfig";
import { Button } from "../../primitives";
import { PageState } from "../../patterns";
import {
  fallbackItems,
  fallbackUnavailableCopy,
  runtimeDisplayItem,
  type DisplayQueueItem,
  type QueueMode
} from "./queueFallback";

export type QueueLoadStatus = "empty" | "error" | "loading" | "permission" | "ready";

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "confirmation queue request failed";
}

export function useQueueRuntime(selectedTenantId: string) {
  const config = useMemo(() => readAdminRuntimeConfig(), []);
  const fetcher = useMemo(
    () =>
      createAdminRuntimeFetcher(config, {
        selectedTenantId
      }) as ConfirmationQueueApiFetcher,
    [config, selectedTenantId]
  );
  const client = useMemo(
    () => createConfirmationQueueApiClient({ fetcher }),
    [fetcher]
  );
  const [items, setItems] = useState<DisplayQueueItem[]>([]);
  const [lastError, setLastError] = useState("");
  const [mode, setMode] = useState<QueueMode>("degraded");
  const [status, setStatus] = useState<QueueLoadStatus>("loading");
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const useSyntheticQueueFallback = useCallback(
    (reason: keyof typeof fallbackUnavailableCopy, detail = "") => {
      setMode("degraded");
      setItems(fallbackItems);
      setLastError(
        detail
          ? `${fallbackUnavailableCopy[reason]} (${detail})`
          : fallbackUnavailableCopy[reason]
      );
      setStatus("ready");
    },
    []
  );

  const reload = useCallback(async () => {
    setStatus("loading");
    setItems([]);
    setLastError("");
    setMode("runtime");
    try {
      const next = await client.listItems({ status: "pending" });
      if (next.length === 0) {
        if (!config.strictRuntime) {
          useSyntheticQueueFallback("empty");
          return;
        }
        setLastError("confirmation queue runtime returned no pending items");
        setStatus("empty");
      } else {
        setItems(next.map(runtimeDisplayItem));
        setStatus("ready");
      }
    } catch (error) {
      const message = errorMessage(error);
      const reason = message.includes("status 403") ? "permission" : "error";
      if (!config.strictRuntime) {
        useSyntheticQueueFallback(reason, message);
        return;
      }
      setItems([]);
      setLastError(message);
      setStatus(reason);
    }
  }, [client, config.strictRuntime, useSyntheticQueueFallback]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const submit = useCallback(
    async (itemId: string, decision: ConfirmationDecisionRequest) => {
      if (mode !== "runtime" || status !== "ready") {
        throw new Error("runtime unavailable: queue cannot write in current state");
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
    [client, mode, status]
  );

  return {
    canWrite: mode === "runtime" && status === "ready",
    items,
    lastError,
    mode,
    reload,
    status,
    submit,
    submittingId
  };
}

export function renderQueueState(
  status: QueueLoadStatus,
  lastError = "",
  reload?: () => void
) {
  if (status === "ready") return null;
  const copy = queueStateCopy(status, lastError);
  return h(PageState, {
    "data-testid": `m7-queue-${status}`,
    action:
      status === "error" || status === "permission"
        ? h(Button, { onClick: reload, variant: "secondary" }, "重试")
        : undefined,
    kind: status,
    message: copy.message,
    title: copy.title
  } as unknown as Parameters<typeof PageState>[0]);
}

function queueStateCopy(status: QueueLoadStatus, lastError: string) {
  const [title, fallback] = queueStateCopies[status];
  const message =
    lastError && (status === "error" || status === "permission") ? lastError : fallback;
  return { message, title };
}

const queueStateCopies = {
  empty: ["确认队列为空", "当前租户没有待确认候选；严格 runtime 不填充 mock 队列。"],
  error: ["确认队列读取失败", "确认队列 API 暂不可用；严格 runtime 不填充 mock 队列。"],
  loading: ["确认队列加载中", "正在读取确认队列运行时。"],
  permission: [
    "没有确认队列权限",
    "当前会话没有确认队列权限；严格 runtime 不展示 mock 队列。"
  ],
  ready: ["确认队列", ""]
} satisfies Record<QueueLoadStatus, readonly [string, string]>;
