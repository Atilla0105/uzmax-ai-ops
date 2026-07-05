import { Input } from "../../primitives";
import { ConfirmModal, SidePanel } from "../../patterns";
import { EditActions } from "./QueueSupport";
import { queueRuntimeBoundary, type DisplayQueueItem } from "./queueFallback";

export function QueueEditPanel({
  canWrite,
  editRef,
  onCancel,
  onEditRefChange,
  onSave,
  open
}: {
  canWrite: boolean;
  editRef: string;
  onCancel: () => void;
  onEditRefChange: (value: string) => void;
  onSave: () => void;
  open: boolean;
}) {
  return (
    <SidePanel
      actions={
        <EditActions
          canSave={canWrite}
          onCancel={onCancel}
          onSave={onSave}
          readOnly={!canWrite}
        />
      }
      meta={
        canWrite
          ? "仅接受 controlled/manifest/storage 引用；不提交 raw 内容。"
          : "待连接：仅展示受控引用，连接完成后才能保存。"
      }
      onClose={onCancel}
      open={open}
      title="编辑候选引用"
    >
      <label className="uz-queue-edit-ref">
        <span>editedPayloadRef</span>
        <Input
          aria-label="edited payload ref"
          aria-description={canWrite ? undefined : queueRuntimeBoundary}
          data-runtime-boundary={canWrite ? undefined : queueRuntimeBoundary}
          onChange={(event) => onEditRefChange(event.currentTarget.value)}
          value={editRef}
        />
      </label>
    </SidePanel>
  );
}

export function QueueBlockModal({
  blockItem,
  blockReason,
  onCancel,
  onConfirm,
  onReasonChange
}: {
  blockItem: DisplayQueueItem | undefined;
  blockReason: string;
  onCancel: () => void;
  onConfirm: () => void;
  onReasonChange: (value: string) => void;
}) {
  return (
    <ConfirmModal
      confirmLabel="确认拦截并写审计"
      danger
      description="拦截会调用现有 block 决策，并只提交受控 reasonRef；原因文本不作为 raw payload 写入 API。"
      onCancel={onCancel}
      onConfirm={onConfirm}
      open={Boolean(blockItem)}
      reason={{
        label: "拦截原因",
        onChange: onReasonChange,
        required: true,
        value: blockReason
      }}
      title="拦截该候选？"
    />
  );
}
