import * as Icons from "lucide-react";
import { Button, IconSlot, StatusBadge } from "../../primitives";
import * as Runtime from "./conversationWorkbenchRuntime";

type ComposerProps = {
  active?: Runtime.ConversationRow;
  degradedReason: string;
};

const composerTools = [
  ["附件", Icons.Paperclip],
  ["话术片段", Icons.MessageSquareQuote]
] as const;

export function Composer({ active, degradedReason }: ComposerProps) {
  const state = composerState(active);
  return (
    <footer
      className="uz-conv-composer"
      data-runtime-boundary={degradedReason}
      data-testid="m7-conversation-composer"
    >
      <div className="uz-conv-composer__state">
        <StatusBadge tone="warn">
          <IconSlot icon={Icons.PencilLine} size="sm" />
          {state.badge}
        </StatusBadge>
        <span className="uz-conv-caveat" data-testid="m7-conversation-composer-caveat">
          由 AI 生成，确认后才会发送给客户
        </span>
      </div>
      <textarea aria-label="Conversation composer" disabled value={state.draft} />
      <div className="uz-conv-composer__bar">
        <span className="uz-conv-composer__tools">
          {composerTools.map(([label, icon]) => (
            <Button
              aria-label={label}
              className="uz-conv-tool-button"
              disabled
              icon={<IconSlot icon={icon} />}
              key={label}
              title={label}
            />
          ))}
        </span>
        <span className="uz-conv-language">{state.language} · 红线检查通过</span>
        <Button disabled>编辑草稿</Button>
        <Button
          className="uz-conv-confirm"
          disabled
          icon={<IconSlot icon={Icons.SendHorizontal} />}
          kbd="⌘↵"
          variant="success"
        >
          确认发送
        </Button>
      </div>
    </footer>
  );
}

function composerState(active?: Runtime.ConversationRow) {
  const suspended = active?.aiState === "suspended";
  const hasDraft = Boolean(active?.draftText);
  return {
    badge: hasDraft || !suspended ? "Business 草稿 · 待确认" : "人工外部回复 · 待确认",
    draft: active?.draftText || fallbackDraft(active, suspended),
    language: active?.language?.replace(" / mock", "") ?? "语言待识别"
  };
}

function fallbackDraft(active?: Runtime.ConversationRow, suspended = false) {
  return suspended
    ? `收到，我先为你核对${draftSubject(active)}和可选处理方案。当前由人工接管，外部发送仍需已批准的发送合约。`
    : `您好，${draftSubject(active)}已进入复核。预计下一节点更新后我会继续同步，如需人工处理可直接接管。`;
}

function draftSubject(active?: Runtime.ConversationRow) {
  if (active?.orderRef) return `订单 ${active.orderRef} 的节点`;
  if (active?.displayRef) return `会话 ${active.displayRef}`;
  return "当前会话";
}
