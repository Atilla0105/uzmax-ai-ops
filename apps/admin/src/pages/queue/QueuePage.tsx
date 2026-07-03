import { useCallback, useEffect, useMemo, useState } from "react";
import { Keyboard } from "lucide-react";
import {
  createConfirmationQueueApiClient,
  type ConfirmationDecisionRequest,
  type ConfirmationQueueApiFetcher
} from "../../confirmationQueueApiClient";
import { Button, IconSlot, Input, Kbd, StatusBadge } from "../../primitives";
import {
  ConfirmModal,
  DegradedBar,
  PageToolbar,
  SidePanel,
  ToastHost,
  useToast
} from "../../patterns";
import {
  EditActions,
  QueueCard,
  QueueStats,
  controlledRefPattern,
  firstRef,
  isEditableTarget,
  nextPending,
  queueStats,
  reasonRef,
  renderQueueState
} from "./QueueCard";
import "./QueuePage.css";

type QueueClient = ReturnType<typeof createConfirmationQueueApiClient>;
export type ConfirmationQueueItem = Awaited<
  ReturnType<QueueClient["listItems"]>
>[number];
type LoadStatus = "empty" | "error" | "loading" | "permission" | "ready";
type SubmitAction = "approve" | "block" | "discard";

const browserFetcher: ConfirmationQueueApiFetcher = (input, init) =>
  window.fetch(input, init as RequestInit);

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "confirmation queue request failed";
}

function useQueueRuntime() {
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

function moveForKey(key: string) {
  // prettier-ignore
  return key === "j" || key === "arrowdown" ? 1 : key === "k" || key === "arrowup" ? -1 : 0;
}

function actionForKey(key: string): SubmitAction | undefined {
  return key === "a" ? "approve" : key === "d" ? "discard" : undefined;
}

function canShortcut(
  item: ConfirmationQueueItem | undefined,
  editingId: string | null,
  blockId: string | null
): item is ConfirmationQueueItem {
  return Boolean(item && !editingId && !blockId && item.status === "pending");
}

export function QueuePage() {
  const queue = useQueueRuntime();
  const toast = useToast();
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRef, setEditRef] = useState("controlled://m7-ui-10/edit/draft");
  const [blockId, setBlockId] = useState<string | null>(null);
  const [blockReason, setBlockReason] = useState("");
  const focusedItem = queue.items[focusedIndex];
  const editingItem = queue.items.find((item) => item.id === editingId);
  const blockItem = queue.items.find((item) => item.id === blockId);
  const stats = useMemo(() => queueStats(queue.items), [queue.items]);

  useEffect(() => {
    setFocusedIndex((current) =>
      queue.items.length === 0 ? 0 : Math.min(current, queue.items.length - 1)
    );
  }, [queue.items.length]);

  async function decide(item: ConfirmationQueueItem, action: SubmitAction) {
    try {
      await queue.submit(item.id, { action, reasonRef: reasonRef(action) });
      toast.show("确认队列决策已提交。", "success");
      setFocusedIndex(nextPending(queue.items, focusedIndex));
    } catch {
      toast.show(queue.lastError || "确认队列操作失败", "error");
    }
  }

  function startEdit(item: ConfirmationQueueItem) {
    setEditingId(item.id);
    setEditRef(firstRef(item.candidatePayload));
  }

  async function saveEdit() {
    if (!editingItem || !controlledRefPattern.test(editRef)) return;
    try {
      await queue.submit(editingItem.id, {
        action: "edit",
        editedPayloadRef: editRef,
        reasonRef: reasonRef("edit")
      });
      setEditingId(null);
      toast.show("编辑引用已提交并通过。", "success");
      setFocusedIndex(nextPending(queue.items, focusedIndex));
    } catch {
      toast.show(queue.lastError || "编辑提交失败", "error");
    }
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || isEditableTarget(event.target)) return;
      const key = event.key.toLowerCase();
      const move = moveForKey(key);
      if (move !== 0) {
        event.preventDefault();
        setFocusedIndex((current) =>
          Math.max(0, Math.min(queue.items.length - 1, current + move))
        );
        return;
      }
      if (!canShortcut(focusedItem, editingId, blockId)) return;
      const action = actionForKey(key);
      if (focusedItem.kind === "conflict_candidate" && action) {
        event.preventDefault();
        toast.show("冲突候选必须用并排 diff 的显式按钮裁决。", "warning");
        return;
      }
      if (action) {
        event.preventDefault();
        void decide(focusedItem, action);
      }
      if (key === "e" && focusedItem.kind !== "conflict_candidate") {
        event.preventDefault();
        startEdit(focusedItem);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const state = renderQueueState(queue.status, queue.lastError, queue.reload);

  return (
    // prettier-ignore
    <section className="uz-page-queue" data-testid="m7-confirmation-queue-page">
      <PageToolbar eyebrow="tenant.queue" meta="人工确认、编辑、丢弃和拦截候选；冲突候选必须查看并排 diff。" status={<StatusBadge tone="warn">M7-UI-10 runtime page</StatusBadge>} title="确认队列" />
      <QueueStats stats={stats} />
      <div className="uz-queue-keyboard" data-testid="m7-queue-keyboard">
        <IconSlot icon={Keyboard} />
        <span><Kbd>J</Kbd>/<Kbd>K</Kbd> 移动 <Kbd>A</Kbd> 通过 <Kbd>E</Kbd> 编辑 <Kbd>D</Kbd> 丢弃</span>
      </div>
      <DegradedBar action={<Button disabled>恢复每日不可用</Button>} data-testid="m7-queue-degraded">蒸馏健康摘要和人工恢复每日频率缺少已批准 API 合约；本页只读呈现阻断，不伪造恢复动作。</DegradedBar>
      {state ?? (
        <div className="uz-queue-flow" data-testid="m7-queue-flow">
          {queue.items.map((item, index) => (
            <QueueCard focused={index === focusedIndex} item={item} key={item.id} onApprove={() => void decide(item, "approve")} onBlock={() => { setBlockId(item.id); setBlockReason(""); }} onDiscard={() => void decide(item, "discard")} onEdit={() => startEdit(item)} onFocus={() => setFocusedIndex(index)} submitting={queue.submittingId === item.id} />
          ))}
        </div>
      )}
      <SidePanel actions={<EditActions canSave={controlledRefPattern.test(editRef)} onCancel={() => setEditingId(null)} onSave={() => void saveEdit()} />} meta="仅接受 controlled/manifest/storage 引用；不提交 raw 内容。" onClose={() => setEditingId(null)} open={Boolean(editingItem)} title="编辑候选引用">
        <label className="uz-queue-edit-ref">
          <span>editedPayloadRef</span>
          <Input aria-label="edited payload ref" onChange={(event) => setEditRef(event.currentTarget.value)} value={editRef} />
        </label>
      </SidePanel>
      <ConfirmModal confirmLabel="确认拦截并写审计" danger description="拦截会调用现有 block 决策，并只提交受控 reasonRef；原因文本不作为 raw payload 写入 API。" onCancel={() => setBlockId(null)} onConfirm={() => { if (blockItem) void decide(blockItem, "block"); setBlockId(null); }} open={Boolean(blockItem)} reason={{ label: "拦截原因", onChange: setBlockReason, required: true, value: blockReason }} title="拦截该候选？" />
      <ToastHost toasts={toast.toasts} />
    </section>
  );
}
