import type {
  ConversationDetail,
  ConversationRow,
  RuntimeStatus
} from "./conversationWorkbenchRuntime";

type HandoffTarget =
  { id: string; policyRef: string; ref: string } | { reason: string };

const statusBlockers: Record<ConversationRow["status"], string> = {
  closed: "已解决会话不可重复接管；如需重开需要 approved runtime。",
  handoff: "会话已由人工接管；重复接管/转派 runtime 未接入。",
  open: "",
  pending_handoff: "会话已在等待人工接管/分配；重复接管保持禁用。"
};

export function degradedReason(
  status: RuntimeStatus,
  lastError: string,
  detail: ConversationDetail | null,
  handoffDisabledReason: string
) {
  if (status === "error")
    return "conversation-ticket API 不可用；页面保持只读，不回退到 fixture。";
  if (status === "permission")
    return "缺少 conversation:read 或 ticket:write；后端权限仍是最终边界。";
  if (lastError) return lastError;
  if (!detail) return "详情/客户上下文未返回，操作降级。";
  if (handoffDisabledReason) return handoffDisabledReason;
  return "发送、客户聚合和实时 WS 未接入，保持只读确认。";
}

export function handoffBlocker(
  status: RuntimeStatus,
  detail: ConversationDetail | null,
  handoffPending: boolean
) {
  if (status !== "ready") return "conversation-ticket runtime 未就绪。";
  if (!detail) return "选择会话详情未同步；接管保持禁用。";
  if (handoffPending) return "接管请求提交中，等待 runtime 返回。";
  const conversation = detail.conversation;
  if (!conversation.slaPolicyRef) return "接管需要 runtime 返回 SLA policyRef。";
  if (conversation.status === "open" && conversation.aiState === "suspended")
    return "AI 已暂停但 runtime 未返回可接管动作；保持禁用。";
  return statusBlockers[conversation.status];
}

export function syntheticHandoffBlocker(
  detail: ConversationDetail | null,
  handoffPending: boolean
) {
  if (!detail) return "synthetic fallback detail 未同步；本地接管预览保持禁用。";
  if (handoffPending) return "本地接管状态切换中。";
  const conversation = detail.conversation;
  if (conversation.status === "handoff")
    return "synthetic fallback 已显示人工接管状态。";
  if (conversation.status === "closed") return "已解决 synthetic 会话不可本地接管。";
  if (
    conversation.status === "pending_handoff" ||
    conversation.aiState === "suspended" ||
    conversation.slaRisk
  )
    return "";
  return "synthetic fallback 只允许 pending handoff、AI 暂停或 SLA-risk 会话做本地接管预览。";
}

export function handoffTarget(
  status: RuntimeStatus,
  detail: ConversationDetail | null,
  handoffPending: boolean
): HandoffTarget {
  const reason = handoffBlocker(status, detail, handoffPending);
  if (reason) return { reason };
  const conversation = detail!.conversation;
  return {
    id: conversation.id,
    policyRef: conversation.slaPolicyRef!,
    ref: conversation.displayRef || conversation.id
  };
}
