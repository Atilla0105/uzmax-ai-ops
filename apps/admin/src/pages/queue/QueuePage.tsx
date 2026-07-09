import { useEffect, useMemo, useState } from "react";
import { Keyboard, Server } from "lucide-react";
import { Button, IconSlot, Kbd, StatusBadge } from "../../primitives";
import { DegradedBar, ToastHost, useToast } from "../../patterns";
import {
  QueueCard,
  controlledRefPattern,
  firstRef,
  isEditableTarget,
  nextPending,
  queueStats,
  reasonRef
} from "./QueueCard";
import { QueueStats, QueueStyles, type SubmitAction } from "./QueueSupport";
import { renderQueueState, useQueueRuntime } from "./QueueRuntime";
import { QueueBlockModal, QueueEditPanel } from "./QueueOverlays";
import { type DisplayQueueItem } from "./queueFallback";

const focusMove: Record<string, number> = { arrowdown: 1, arrowup: -1, j: 1, k: -1 };

function moveForKey(key: string) {
  return focusMove[key] ?? 0;
}

function actionForKey(key: string): SubmitAction | undefined {
  return key === "a" ? "approve" : key === "d" ? "discard" : undefined;
}

function canShortcut(
  item: DisplayQueueItem | undefined,
  editingId: string | null,
  blockId: string | null
): item is DisplayQueueItem {
  return Boolean(item && !editingId && !blockId && item.status === "pending");
}

export function QueuePage({ selectedTenantId }: { selectedTenantId: string }) {
  const queue = useQueueRuntime(selectedTenantId);
  const toast = useToast();
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRef, setEditRef] = useState("controlled://m7-ui-10/edit/draft");
  const [blockId, setBlockId] = useState<string | null>(null);
  const [blockReason, setBlockReason] = useState("");
  const focusedItem = queue.items[focusedIndex];
  const editingItem = queue.items.find((item) => item.id === editingId);
  const blockItem = queue.items.find((item) => item.id === blockId);
  const stats = useMemo(
    () => queueStats(queue.items, queue.mode),
    [queue.items, queue.mode]
  );

  useEffect(() => {
    setFocusedIndex((current) =>
      queue.items.length === 0 ? 0 : Math.min(current, queue.items.length - 1)
    );
  }, [queue.items.length]);

  async function decide(item: DisplayQueueItem, action: SubmitAction) {
    if (!queue.canWrite) {
      toast.show(
        "runtime unavailable: mock/degraded read-only mode cannot write",
        "warning"
      );
      return;
    }
    try {
      await queue.submit(item.id, { action, reasonRef: reasonRef(action) });
      toast.show("确认队列决策已提交。", "success");
      setFocusedIndex(nextPending(queue.items, focusedIndex));
    } catch {
      toast.show(queue.lastError || "确认队列操作失败", "error");
    }
  }

  function startEdit(item: DisplayQueueItem) {
    if (!queue.canWrite) {
      toast.show(
        "runtime unavailable: edit is read-only in mock/degraded mode",
        "warning"
      );
      return;
    }
    setEditingId(item.id);
    setEditRef(firstRef(item.candidatePayload));
  }

  async function saveEdit() {
    if (!queue.canWrite || !editingItem || !controlledRefPattern.test(editRef)) return;
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

  function moveFocusedIndex(key: string, event: KeyboardEvent) {
    const move = moveForKey(key);
    if (move === 0) return false;
    event.preventDefault();
    setFocusedIndex((current) =>
      Math.max(0, Math.min(queue.items.length - 1, current + move))
    );
    return true;
  }

  function runShortcut(event: KeyboardEvent, key: string, item: DisplayQueueItem) {
    const action = actionForKey(key);
    if (item.kind === "conflict_candidate" && action) {
      event.preventDefault();
      toast.show("冲突候选必须用并排 diff 的显式按钮裁决。", "warning");
      return;
    }
    if (action) {
      event.preventDefault();
      void decide(item, action);
      return;
    }
    if (key === "e" && item.kind !== "conflict_candidate") {
      event.preventDefault();
      startEdit(item);
    }
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || isEditableTarget(event.target)) return;
      const key = event.key.toLowerCase();
      if (moveFocusedIndex(key, event)) return;
      if (canShortcut(focusedItem, editingId, blockId)) {
        runShortcut(event, key, focusedItem);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const state = renderQueueState(queue.status, queue.lastError, queue.reload);
  const isDegraded = queue.mode === "degraded";

  return (
    <section className="uz-page-queue" data-testid="m7-confirmation-queue-page">
      <QueueStyles />
      <div className="uz-queue-strip" data-testid="m7-queue-header-strip">
        <h2 className="uz-queue-title">确认队列</h2>
        <QueueStats stats={stats} />
        <div className="uz-queue-keyboard" data-testid="m7-queue-keyboard">
          <IconSlot icon={Keyboard} />
          <span>
            <Kbd>J</Kbd>/<Kbd>K</Kbd> 移动 <Kbd>A</Kbd> 通过 <Kbd>E</Kbd> 编辑{" "}
            <Kbd>D</Kbd> 丢弃
          </span>
        </div>
        <StatusBadge className="uz-queue-mode" tone={isDegraded ? "warn" : "ok"}>
          {isDegraded ? "mock/degraded read-only" : "runtime API"}
        </StatusBadge>
      </div>
      {isDegraded ? (
        <DegradedBar
          action={
            <div className="uz-queue-banner-actions">
              <Button disabled variant="secondary">
                查看原因 · read-only
              </Button>
              <Button disabled>恢复每日 · runtime unavailable</Button>
            </div>
          }
          className="uz-queue-banner"
          data-testid="m7-queue-degraded"
        >
          {`API unavailable/empty/error -> mock/degraded visible structure; read-only; runtime unavailable. ${queue.lastError}`}
        </DegradedBar>
      ) : (
        <div
          className="uz-queue-runtime-source"
          data-runtime-status={queue.status}
          data-testid="m10-queue-runtime-source"
          role="status"
        >
          <IconSlot icon={Server} />
          <span>
            {runtimeSourceCopy(queue.status, queue.lastError, selectedTenantId)}
          </span>
        </div>
      )}
      <div className="uz-queue-body">
        {state ??
          (queue.items.length === 0 ? null : (
            <div className="uz-queue-flow" data-testid="m7-queue-flow">
              {queue.items.map((item, index) => (
                <QueueCard
                  focused={index === focusedIndex}
                  item={item}
                  key={item.id}
                  onApprove={() => void decide(item, "approve")}
                  onBlock={() => {
                    setBlockId(item.id);
                    setBlockReason("");
                  }}
                  onDiscard={() => void decide(item, "discard")}
                  onEdit={() => startEdit(item)}
                  onFocus={() => setFocusedIndex(index)}
                  readOnly={!queue.canWrite}
                  submitting={queue.submittingId === item.id}
                />
              ))}
            </div>
          ))}
      </div>
      <QueueEditPanel
        canWrite={queue.canWrite && controlledRefPattern.test(editRef)}
        editRef={editRef}
        onCancel={() => setEditingId(null)}
        onEditRefChange={setEditRef}
        onSave={() => void saveEdit()}
        open={Boolean(editingItem)}
      />
      <QueueBlockModal
        blockItem={blockItem}
        blockReason={blockReason}
        onCancel={() => setBlockId(null)}
        onConfirm={() => {
          if (blockItem) void decide(blockItem, "block");
          setBlockId(null);
        }}
        onReasonChange={setBlockReason}
      />
      <ToastHost toasts={toast.toasts} />
    </section>
  );
}

function runtimeSourceCopy(
  status: string,
  lastError: string,
  selectedTenantId: string
) {
  const detail = lastError && status !== "loading" ? ` · detail: ${lastError}` : "";
  return `runtime API source /confirmation-queue/items?status=pending · tenant ${selectedTenantId} · state ${status}${detail}`;
}
