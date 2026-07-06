import { ConfirmModal } from "../../patterns";
import {
  configRuntimeBoundary,
  configRuntimeLabels,
  configSectionLabels,
  type ConfigConnector,
  type ConfigVersion
} from "./configFallback";
import type { ConfigPageState } from "./ConfigSections";

export function LocalConfirm({
  kind,
  onClose,
  reason,
  rollbackTarget,
  state,
  setReason,
  switchTarget
}: {
  kind: "rollback" | "switch";
  onClose: () => void;
  reason: string;
  rollbackTarget?: ConfigVersion | null;
  state: ConfigPageState;
  setReason: (reason: string) => void;
  switchTarget?: ConfigConnector["mode"] | null;
}) {
  const isRollback = kind === "rollback";
  const open = isRollback ? Boolean(rollbackTarget) : Boolean(switchTarget);
  const targetLabel = switchTarget === "api" ? "订单 API" : "导入快照";
  const confirm = () => {
    if (rollbackTarget) state.rollback(rollbackTarget);
    if (switchTarget) state.update.connectorSwitch(switchTarget);
    onClose();
  };
  return (
    <ConfirmModal
      cancelLabel="取消"
      confirmLabel={isRollback ? "回滚" : "确认本地切换"}
      danger
      description={
        isRollback
          ? `${configSectionLabels[state.section]}将显示为 v${rollbackTarget?.ver} 的回滚预览，确认后进入版本变更队列。`
          : `订单主路径将切换为 ${targetLabel} 的预览状态，确认后进入变更队列。`
      }
      onCancel={onClose}
      onConfirm={confirm}
      open={open}
      reason={{
        label: isRollback ? "回滚原因" : "切换原因",
        onChange: setReason,
        placeholder: isRollback ? "填写回滚原因（必填）" : "填写切换原因（必填）",
        required: true,
        value: reason
      }}
      title={isRollback ? `回滚到 v${rollbackTarget?.ver}？` : "切换订单数据主路径？"}
    >
      <span
        data-runtime-boundary={configRuntimeBoundary}
        hidden
        title={configRuntimeBoundary}
      >
        {configRuntimeBoundary}
      </span>
    </ConfirmModal>
  );
}

export function RuntimeNote() {
  return (
    <div
      className="uz-config-note"
      data-runtime-boundary={configRuntimeBoundary}
      data-testid="m7-config-runtime-note"
      hidden
      title={configRuntimeBoundary}
    >
      <strong>{configRuntimeLabels.slice(0, 3).join(" · ")}</strong>
      <span>{configRuntimeLabels.slice(3).join(" · ")}</span>
    </div>
  );
}

export function Toast({ message }: { message: string }) {
  return message ? (
    <div
      aria-atomic="true"
      aria-live="polite"
      className="uz-config-toast"
      data-runtime-boundary={configRuntimeBoundary}
      data-testid="m7-config-toast"
      role="status"
      title={configRuntimeBoundary}
    >
      {message}
      <span hidden>{configRuntimeBoundary}</span>
    </div>
  ) : null;
}
