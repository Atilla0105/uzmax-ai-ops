import { createElement as h } from "react";
import { Bot, Hand, Paperclip, SendHorizontal } from "lucide-react";
import { Button, IconSlot, StatusBadge } from "../../primitives";
import { PageState } from "../../patterns";
import {
  contentText,
  displayName,
  type ConversationRow,
  type MessageRow
} from "./conversationWorkbenchRuntime";

const css = `.uz-page-conversations{position:relative;display:grid;grid-template-columns:316px minmax(420px,1fr) 340px;height:100%;min-height:0;background:var(--paper);color:var(--ink-900);font:var(--text-base)/1.45 var(--font-body)}.uz-conv-list,.uz-conv-thread,.uz-conv-rail{min-width:0;min-height:0;background:var(--card)}.uz-conv-list{display:flex;flex-direction:column;border-right:1px solid var(--ink-150)}.uz-conv-list__head,.uz-conv-thread__head{height:46px;display:flex;align-items:center;gap:var(--s-5);padding:0 var(--s-8);border-bottom:1px solid var(--ink-150)}.uz-conv-list__head h2,.uz-conv-thread__title strong{margin:0;font:700 var(--text-title)/1.2 var(--font-display)}.uz-conv-thread__title strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.uz-conv-filters{display:flex;gap:var(--s-3);padding:var(--s-4) var(--s-6);overflow-x:auto;border-bottom:1px solid var(--ink-075)}.uz-conv-filter{white-space:nowrap}.uz-conv-rows{overflow:auto}.uz-conv-row{width:100%;display:grid;gap:var(--s-2);padding:11px 14px 11px 16px;border:0;border-bottom:1px solid var(--ink-075);background:var(--card);color:inherit;text-align:left;cursor:pointer}.uz-conv-row:hover,.uz-conv-row.is-selected{background:var(--paper)}.uz-conv-row.is-selected{box-shadow:inset 0 0 0 1px var(--ink-900)}.uz-conv-row__top,.uz-conv-row__meta,.uz-conv-message__meta,.uz-conv-actions,.uz-conv-rail__head,.uz-conv-rail__tabs,.uz-conv-composer__bar,.uz-conv-composer__state{display:flex;align-items:center;gap:var(--s-4)}.uz-conv-row__top strong{min-width:0;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:var(--text-base)}.uz-conv-row__preview{padding-left:30px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--ink-500);font-size:var(--text-sm)}.uz-conv-row__meta{padding-left:30px}.uz-conv-row__meta .mono,.uz-conv-thread__head .mono,.uz-conv-message__meta,.uz-conv-kv dd{font-family:var(--font-data)}.uz-conv-row__lang{font-size:var(--text-xs);color:var(--ink-300)}.uz-conv-dot{width:8px;height:8px;border-radius:var(--radius-pill);background:var(--ink-300)}.uz-conv-dot.is-risk{background:var(--state-human)}.uz-conv-dot.is-warn{background:var(--state-warn)}.uz-conv-thread{display:flex;flex-direction:column;background:var(--paper)}.uz-conv-thread__head{background:var(--card);flex-wrap:nowrap;overflow:hidden}.uz-conv-thread__title{display:grid;gap:var(--s-1);min-width:0;flex:0 0 172px}.uz-conv-thread__title span{color:var(--ink-500);font-size:var(--text-xs);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.uz-conv-caveat{max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--ink-500);font-size:var(--text-xs)}.uz-conv-actions{margin-left:auto;flex:none}.uz-conv-body{flex:1;min-height:0;overflow:auto;padding:var(--s-9) var(--s-10);display:flex;flex-direction:column;gap:var(--s-7)}.uz-conv-message{max-width:78%;display:grid;gap:var(--s-2)}.uz-conv-message.is-inbound{align-self:flex-start}.uz-conv-message.is-outbound,.uz-conv-message.is-internal{align-self:flex-end}.uz-conv-bubble{padding:var(--s-5) var(--s-6);border:1px solid var(--ink-150);border-radius:var(--radius-xl) var(--radius-sm) var(--radius-xl) var(--radius-xl);background:var(--card);color:var(--ink-900);overflow-wrap:anywhere}.uz-conv-message.is-inbound .uz-conv-bubble{border-radius:var(--radius-sm) var(--radius-xl) var(--radius-xl) var(--radius-xl)}.uz-conv-message.is-outbound .uz-conv-bubble{background:var(--state-ai-bg);border-color:var(--state-ai-border)}.uz-conv-message.is-internal .uz-conv-bubble{background:var(--state-human-bg);border-color:var(--state-human-border)}.uz-conv-trace{margin-top:var(--s-3);padding:var(--s-5);border:1px solid var(--state-ai-border);border-radius:var(--radius-lg);background:var(--card)}.uz-conv-trace dl{display:grid;grid-template-columns:60px minmax(0,1fr);gap:var(--s-2) var(--s-4);margin:var(--s-4) 0 0}.uz-conv-trace dt{color:var(--ink-500)}.uz-conv-trace dd{margin:0;font-family:var(--font-data);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.uz-conv-composer{flex:none;border-top:1px solid var(--ink-150);padding:var(--s-6) var(--s-8);background:var(--card)}.uz-conv-composer textarea{box-sizing:border-box;width:100%;min-height:66px;resize:vertical;border:1px solid var(--ink-150);border-radius:var(--radius-lg);padding:var(--s-5) var(--s-6);background:var(--paper);color:var(--ink-700);font:inherit}.uz-conv-composer textarea:disabled{opacity:1}.uz-conv-composer__state{margin-bottom:var(--s-4)}.uz-conv-composer__bar{margin-top:var(--s-5);flex-wrap:wrap}.uz-conv-rail{display:flex;flex-direction:column;border-left:1px solid var(--ink-150);overflow:hidden}.uz-conv-rail__head{padding:var(--s-8);border-bottom:1px solid var(--ink-150)}.uz-conv-rail__head strong{display:block;font-size:var(--text-title)}.uz-conv-rail__head span{color:var(--ink-500);font-size:var(--text-xs)}.uz-conv-rail__tabs{padding:0 var(--s-7);border-bottom:1px solid var(--ink-150)}.uz-conv-rail__tabs button{border:0;border-bottom:2px solid transparent;background:transparent;padding:var(--s-5);font-weight:600;color:var(--ink-500);cursor:pointer}.uz-conv-rail__tabs button.is-active{border-color:var(--ink-900);color:var(--ink-900)}.uz-conv-rail__body{flex:1;min-height:0;overflow:auto}.uz-conv-section{padding:var(--s-7) var(--s-8);border-bottom:1px solid var(--ink-075)}.uz-conv-section h3{margin:0 0 var(--s-5);font:700 var(--text-sm)/1.2 var(--font-display);color:var(--ink-700)}.uz-conv-kv{display:grid;gap:var(--s-3)}.uz-conv-kv div{display:grid;grid-template-columns:76px minmax(0,1fr);gap:var(--s-4)}.uz-conv-kv dt{color:var(--ink-500)}.uz-conv-kv dd{margin:0;overflow-wrap:anywhere}.uz-conv-tags{display:flex;flex-wrap:wrap;gap:var(--s-3)}.uz-conv-rail-list{display:grid;gap:var(--s-4)}.uz-conv-rail-list div{display:grid;gap:var(--s-1);padding:var(--s-4);border:1px solid var(--ink-150);border-radius:var(--radius-md);background:var(--paper)}.uz-conv-rail-list strong{font-size:var(--text-sm)}.uz-conv-rail-list span{color:var(--ink-500);font-size:var(--text-xs)}.uz-conv-quick{display:grid;grid-template-columns:1fr 1fr;gap:var(--s-4)}.uz-conv-blocked{opacity:var(--opacity-muted);font-size:var(--text-xs);white-space:nowrap;flex:none}.uz-conv-overlay{position:absolute;inset:0;z-index:var(--z-sticky);display:grid;place-items:center;background:var(--paper)}.uz-conv-overlay[hidden]{display:none}@media(max-width:960px){.uz-page-conversations{grid-template-columns:1fr;height:auto;min-height:100%}.uz-conv-list,.uz-conv-rail{border:0}.uz-conv-thread{min-height:560px}.uz-conv-rail{display:block}.uz-conv-row{min-height:76px}.uz-conv-actions{width:100%;justify-content:flex-start;margin-left:0}.uz-conv-thread__head{height:auto;min-height:46px;align-items:flex-start;flex-wrap:wrap;padding:var(--s-6)}.uz-conv-caveat{max-width:100%;order:3}.uz-conv-body{padding:var(--s-6)}.uz-conv-message{max-width:100%}.uz-conv-composer__bar{align-items:stretch;flex-direction:column}.uz-conv-quick{grid-template-columns:1fr}}`;
export const ConversationWorkbenchStyles = () => h("style", null, css);

export function ThreadHeader({
  active,
  disabled,
  handoffPending,
  requestHandoff
}: {
  active?: ConversationRow;
  disabled: boolean;
  handoffPending: boolean;
  requestHandoff: () => void;
}) {
  const badges = threadBadges(active);
  return (
    <header className="uz-conv-thread__head">
      <div className="uz-conv-thread__title">
        <strong>{active ? displayName(active) : "未选择会话"}</strong>
        <span>
          {active
            ? `${active.channel ?? "Business"} · ${active.displayRef || active.id} · ${
                active.language ?? "语言待识别"
              }`
            : "conversation-ticket runtime"}
        </span>
      </div>
      {badges.map((badge) => (
        <StatusBadge key={badge.label} tone={badge.tone}>
          {badge.label}
        </StatusBadge>
      ))}
      <div className="uz-conv-actions">
        <Button
          disabled={disabled || handoffPending}
          icon={<IconSlot icon={Hand} />}
          isLoading={handoffPending}
          kbd="T"
          onClick={requestHandoff}
          variant="danger"
        >
          接管会话
        </Button>
        <Button disabled icon={<IconSlot icon={Bot} />}>
          放回 AI
        </Button>
      </div>
    </header>
  );
}

function threadBadges(active?: ConversationRow) {
  if (!active) return [];
  const badges: Array<{ label: string; tone: "danger" }> = [];
  if (active.slaRisk) badges.push({ label: "SLA 即将超时", tone: "danger" });
  if (active.aiState === "suspended")
    badges.push({ label: "AI 已暂停", tone: "danger" });
  return badges;
}

export function MessageBody({
  messages,
  toggleTrace,
  traceOpen
}: {
  messages: MessageRow[];
  toggleTrace: (id: string) => void;
  traceOpen: Record<string, boolean>;
}) {
  if (messages.length === 0)
    return (
      <div className="uz-conv-body">
        <PageState
          data-testid="m7-conversation-customer-context-unavailable"
          kind="degraded"
          message="详情消息、AI 轨迹和客户上下文未从 runtime 返回。"
          title="客户上下文不可用"
        />
      </div>
    );
  return (
    <div className="uz-conv-body">
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          open={Boolean(traceOpen[`trace-${message.id}`])}
          toggleTrace={toggleTrace}
        />
      ))}
    </div>
  );
}

function MessageItem({
  message,
  open,
  toggleTrace
}: {
  message: MessageRow;
  open: boolean;
  toggleTrace: (id: string) => void;
}) {
  const traceId = `trace-${message.id}`;
  return (
    <article
      className={`uz-conv-message is-${message.direction}`}
      data-testid={`m7-conversation-message-${message.id}`}
    >
      <div className="uz-conv-bubble">{contentText(message)}</div>
      <div className="uz-conv-message__meta">
        <span>{timeLabel(message.occurredAt)}</span>
        <StatusBadge tone={message.direction === "inbound" ? "neutral" : "info"}>
          {roleLabel(message)}
        </StatusBadge>
        {message.content.trace ? (
          <Button onClick={() => toggleTrace(traceId)}>
            {open ? "收起轨迹" : "展开 AI 轨迹"}
          </Button>
        ) : null}
      </div>
      {message.content.trace && open ? <AiTrace trace={message.content.trace} /> : null}
    </article>
  );
}

function AiTrace({ trace }: { trace: unknown }) {
  const record = isRecord(trace) ? trace : {};
  const entries = [
    ["意图", record.intent],
    ["工具", record.tool],
    ["知识", record.knowledge],
    ["模型", record.model],
    ["Token", record.token],
    ["红线", record.redline]
  ] as const;
  return (
    <section className="uz-conv-trace" data-testid="m7-conversation-ai-trace">
      <StatusBadge tone="info">AI 决策痕迹</StatusBadge>
      <dl>
        {entries.map(([key, value]) => (
          <div key={key}>
            <dt>{key}</dt>
            <dd>{typeof value === "string" && value ? value : "未返回"}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function Composer({
  active,
  degradedReason
}: {
  active?: ConversationRow;
  degradedReason: string;
}) {
  const suspended = active?.aiState === "suspended";
  const inFlight = active?.inFlightAiMessages?.slice(0, 2) ?? [];
  const draft = suspended
    ? "收到，我先为你核对订单节点和可选处理方案。当前由人工接管，外部发送仍需已批准的发送合约。"
    : "您好，订单 ORD-REF-20413 已进入分拣复核。预计下一节点更新后我会继续同步，如需人工处理可直接接管。";
  return (
    <footer className="uz-conv-composer" data-testid="m7-conversation-composer">
      <div className="uz-conv-composer__state">
        <StatusBadge tone={suspended ? "danger" : "info"}>
          {suspended ? "人工外部回复 · 你已接管" : "Business 草稿 · 待确认"}
        </StatusBadge>
        <span className="uz-conv-caveat" data-testid="m7-conversation-degraded">
          {degradedReason}
        </span>
      </div>
      <textarea aria-label="Conversation composer" disabled value={draft} />
      <div className="uz-conv-composer__bar">
        <Button disabled icon={<IconSlot icon={Paperclip} />}>
          附件
        </Button>
        <Button disabled>话术片段</Button>
        {inFlight.map((message) => (
          <StatusBadge key={message.id} tone="warn">
            {statusLabel(message.status)}
          </StatusBadge>
        ))}
        <span className="uz-conv-blocked">需人工确认</span>
        <Button disabled>编辑草稿</Button>
        <Button disabled variant="danger">
          拒绝
        </Button>
        <Button disabled icon={<IconSlot icon={SendHorizontal} />} variant="success">
          确认发送
        </Button>
      </div>
    </footer>
  );
}

function roleLabel(message: MessageRow) {
  if (message.direction === "inbound") return "客户";
  if (message.direction === "internal") return "系统/人工";
  return message.content.channel === "business" ? "Business · 待确认" : "AI 自动发送";
}

function statusLabel(status: string) {
  if (status === "withdrawn") return "已撤回";
  if (status === "pending_cancel") return "取消中";
  return status;
}

function timeLabel(value?: string) {
  return value ? value.replace("T", " ").slice(0, 16) : "—";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
