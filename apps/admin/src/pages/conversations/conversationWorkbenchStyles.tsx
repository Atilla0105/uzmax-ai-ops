import { createElement as h } from "react";
import * as Icons from "lucide-react";
import { Button, IconSlot, StatusBadge } from "../../primitives";
import { PageState } from "../../patterns";
import * as Runtime from "./conversationWorkbenchRuntime";

const css = `.uz-page-conversations{position:relative;display:grid;grid-template-columns:316px minmax(0,1fr) 340px;height:100%;min-height:0;background:var(--paper);color:var(--ink-900);font:var(--text-base)/1.45 var(--font-body)}.uz-conv-list,.uz-conv-thread,.uz-conv-rail{min-width:0;min-height:0;background:var(--card)}.uz-conv-list{display:flex;flex-direction:column;border-right:1px solid var(--ink-150)}.uz-conv-list__head,.uz-conv-thread__head{height:46px;display:flex;align-items:center;gap:var(--s-5);padding:0 var(--s-8);border-bottom:1px solid var(--ink-150)}.uz-conv-list__head h2,.uz-conv-thread__title strong{margin:0;font:700 var(--text-title)/1.2 var(--font-display)}.uz-conv-list__icons{margin-left:auto;display:flex;align-items:center;gap:var(--s-1);color:var(--ink-500)}.uz-conv-thread__title strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.uz-conv-list__tools{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:var(--s-3);padding:var(--s-4) var(--s-6);border-bottom:1px solid var(--ink-075)}.uz-conv-list__tools .uz-input{min-width:0}.uz-conv-list__tools .uz-button{min-width:72px;padding-inline:var(--s-5)}.uz-conv-query-copy{grid-column:1/-1;display:flex;align-items:center;gap:var(--s-3);min-width:0;color:var(--ink-500);font-size:var(--text-xs)}.uz-conv-filters{display:flex;gap:var(--s-3);padding:var(--s-4) var(--s-6);overflow-x:auto;border-bottom:1px solid var(--ink-075)}.uz-conv-filter{white-space:nowrap}.uz-conv-rows{overflow:auto}.uz-conv-row{position:relative;width:100%;display:grid;gap:var(--s-2);padding:11px 14px 11px 16px;border:0;border-bottom:1px solid var(--ink-075);background:var(--card);color:inherit;text-align:left;cursor:pointer}.uz-conv-row::before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:transparent}.uz-conv-row.is-human::before{background:var(--state-human)}.uz-conv-row.is-sla::before{background:var(--state-warn)}.uz-conv-row.is-ai::before{background:var(--state-ai)}.uz-conv-row.is-manual::before{background:var(--state-off)}.uz-conv-row.is-done::before{background:var(--state-ok)}.uz-conv-row:hover,.uz-conv-row.is-selected{background:var(--paper)}.uz-conv-row__top,.uz-conv-row__meta,.uz-conv-message__meta,.uz-conv-actions,.uz-conv-rail__head,.uz-conv-rail__tabs,.uz-conv-composer__bar,.uz-conv-composer__state{display:flex;align-items:center;gap:var(--s-4)}.uz-conv-row__top strong{min-width:0;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:var(--text-base)}.uz-conv-row__preview{padding-left:30px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--ink-500);font-size:var(--text-sm)}.uz-conv-row__meta{padding-left:30px}.uz-conv-row__meta .mono,.uz-conv-thread__head .mono,.uz-conv-message__meta,.uz-conv-kv dd{font-family:var(--font-data)}.uz-conv-row__lang{font-size:var(--text-xs);color:var(--ink-300)}.uz-conv-dot{width:8px;height:8px;border-radius:var(--radius-pill);background:var(--ink-300)}.uz-conv-dot.is-risk{background:var(--state-human)}.uz-conv-dot.is-warn{background:var(--state-warn)}.uz-conv-thread{display:flex;flex-direction:column;background:var(--paper)}.uz-conv-thread__head{background:var(--card);flex-wrap:nowrap;overflow:hidden}.uz-conv-thread__title{display:grid;gap:var(--s-1);min-width:0;flex:0 0 172px}.uz-conv-thread__title span{color:var(--ink-500);font-size:var(--text-xs);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.uz-conv-caveat{max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--ink-500);font-size:var(--text-xs)}.uz-conv-header-caveat{flex:none;max-width:88px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--ink-500);font-size:var(--text-xs)}.uz-conv-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}.uz-conv-actions{margin-left:auto;flex:none}.uz-conv-runtime-bar{margin:var(--s-5) var(--s-6) 0}.uz-conv-body{flex:1;min-height:0;overflow:auto;padding:var(--s-9) var(--s-10);display:flex;flex-direction:column;gap:var(--s-7)}.uz-conv-message{max-width:78%;display:grid;gap:var(--s-2)}.uz-conv-message.is-inbound{align-self:flex-start}.uz-conv-message.is-outbound,.uz-conv-message.is-internal{align-self:flex-end}.uz-conv-bubble{padding:var(--s-5) var(--s-6);border:1px solid var(--ink-150);border-radius:var(--radius-xl) var(--radius-sm) var(--radius-xl) var(--radius-xl);background:var(--card);color:var(--ink-900);overflow-wrap:anywhere}.uz-conv-message.is-inbound .uz-conv-bubble{border-radius:var(--radius-sm) var(--radius-xl) var(--radius-xl) var(--radius-xl)}.uz-conv-message.is-outbound .uz-conv-bubble{background:var(--state-ai-bg);border-color:var(--state-ai-border)}.uz-conv-message.is-internal .uz-conv-bubble{background:var(--state-human-bg);border-color:var(--state-human-border)}.uz-conv-trace{margin-top:var(--s-3);padding:var(--s-5);border:1px solid var(--state-ai-border);border-radius:var(--radius-lg);background:var(--card)}.uz-conv-trace dl{display:grid;grid-template-columns:60px minmax(0,1fr);gap:var(--s-2) var(--s-4);margin:var(--s-4) 0 0}.uz-conv-trace dt{color:var(--ink-500)}.uz-conv-trace dd{margin:0;font-family:var(--font-data);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.uz-conv-composer{flex:none;border-top:1px solid var(--ink-150);padding:var(--s-6) var(--s-8);background:var(--card)}.uz-conv-composer textarea{box-sizing:border-box;width:100%;min-height:66px;resize:vertical;border:1px solid var(--ink-150);border-radius:var(--radius-lg);padding:var(--s-5) var(--s-6);background:var(--paper);color:var(--ink-700);font:inherit}.uz-conv-composer textarea:disabled{opacity:1}.uz-conv-composer__state{margin-bottom:var(--s-4)}.uz-conv-composer__bar{margin-top:var(--s-5);flex-wrap:wrap}.uz-conv-language{margin-left:auto;color:var(--ink-500);font-size:var(--text-xs)}.uz-conv-redline{color:var(--ink-500);font-size:var(--text-xs)}.uz-conv-rail{display:flex;flex-direction:column;border-left:1px solid var(--ink-150);overflow:hidden}.uz-conv-rail__head{padding:var(--s-8);border-bottom:1px solid var(--ink-150)}.uz-conv-rail__head strong{display:block;font-size:var(--text-title)}.uz-conv-rail__head span{color:var(--ink-500);font-size:var(--text-xs)}.uz-conv-rail__tabs{padding:0 var(--s-7);border-bottom:1px solid var(--ink-150)}.uz-conv-rail__tabs button{border:0;border-bottom:2px solid transparent;background:transparent;padding:var(--s-5);font-weight:600;color:var(--ink-500);cursor:pointer}.uz-conv-rail__tabs button.is-active{border-color:var(--ink-900);color:var(--ink-900)}.uz-conv-rail__body{flex:1;min-height:0;overflow:auto}.uz-conv-section{padding:var(--s-7) var(--s-8);border-bottom:1px solid var(--ink-075)}.uz-conv-section h3{margin:0 0 var(--s-5);font:700 var(--text-sm)/1.2 var(--font-display);color:var(--ink-700)}.uz-conv-kv{display:grid;gap:var(--s-3)}.uz-conv-kv div{display:grid;grid-template-columns:76px minmax(0,1fr);gap:var(--s-4)}.uz-conv-kv dt{color:var(--ink-500)}.uz-conv-kv dd{margin:0;overflow-wrap:anywhere}.uz-conv-tags{display:flex;flex-wrap:wrap;gap:var(--s-3)}.uz-conv-rail-list{display:grid;gap:var(--s-4)}.uz-conv-rail-list div{display:grid;gap:var(--s-1);padding:var(--s-4);border:1px solid var(--ink-150);border-radius:var(--radius-md);background:var(--paper)}.uz-conv-rail-list strong{font-size:var(--text-sm)}.uz-conv-rail-list span{color:var(--ink-500);font-size:var(--text-xs)}.uz-conv-quick{display:grid;grid-template-columns:1fr 1fr;gap:var(--s-4)}.uz-conv-blocked{opacity:var(--opacity-muted);font-size:var(--text-xs);white-space:nowrap;flex:none}.uz-conv-overlay{position:absolute;inset:0;z-index:var(--z-sticky);display:grid;place-items:center;background:var(--paper)}.uz-conv-overlay[hidden]{display:none}@media(max-width:960px){.uz-page-conversations{grid-template-columns:1fr;height:auto;min-height:100%}.uz-conv-list,.uz-conv-rail{border:0}.uz-conv-thread{min-height:560px}.uz-conv-rail{display:block}.uz-conv-row{min-height:76px}.uz-conv-actions{width:100%;justify-content:flex-start;margin-left:0}.uz-conv-thread__head{height:auto;min-height:46px;align-items:flex-start;flex-wrap:wrap;padding:var(--s-6)}.uz-conv-caveat{max-width:100%;order:3}.uz-conv-body{padding:var(--s-6)}.uz-conv-message{max-width:100%}.uz-conv-composer__bar{align-items:stretch;flex-direction:column}.uz-conv-language{margin-left:0}.uz-conv-quick{grid-template-columns:1fr}}`;
const vCss = `.uz-conv-list__head,.uz-conv-thread__head{gap:8px;padding:0 14px}.uz-conv-list__icons .uz-icon-slot{padding:5px}.uz-conv-list__tools{grid-template-columns:minmax(0,1fr) 74px;gap:6px;padding:6px 12px 5px}.uz-conv-list__tools .uz-button{min-width:0;padding-inline:10px}.uz-conv-query-copy{gap:6px;font-size:10px;line-height:1.2}.uz-conv-filters{gap:5px;padding:8px 12px}.uz-conv-row{gap:5px;min-height:88px;padding:10px 14px 10px 16px}.uz-conv-row__preview,.uz-conv-row__meta{padding-left:29px}.uz-conv-row__meta{gap:6px}.uz-conv-thread__head{padding:0 18px}.uz-conv-actions .uz-button:disabled,.uz-conv-composer__bar .uz-button:disabled:not(.uz-button--success),.uz-conv-quick .uz-button:disabled{border:1px solid var(--ink-150);background:var(--card);color:var(--ink-500);cursor:not-allowed;opacity:.78}.uz-conv-composer__bar .uz-button--success:disabled{border-color:var(--state-ok);background:var(--state-ok);color:#fff;cursor:not-allowed;opacity:.72}.uz-conv-runtime-bar{display:flex;align-items:center;gap:8px;margin:10px 18px 0;padding:7px 10px;border:1px solid var(--state-warn-border);border-radius:8px;background:var(--state-warn-bg);color:var(--ink-700);font-size:11px;font-weight:500}.uz-conv-runtime-bar>span:last-child{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.uz-conv-body{padding:16px 22px;gap:12px}.uz-conv-message{gap:4px}.uz-conv-message.is-internal{align-self:center;max-width:90%}.uz-conv-message.is-internal .uz-conv-bubble{padding:4px 12px;border-radius:var(--radius-pill);font-size:11px;font-weight:600}.uz-conv-message.is-internal .uz-conv-message__meta{display:none}.uz-conv-bubble{padding:10px 13px;border-radius:12px 4px 12px 12px;line-height:1.55}.uz-conv-message.is-inbound .uz-conv-bubble{border-radius:4px 12px 12px 12px}.uz-conv-trace{margin-top:8px;padding:10px 13px;border-radius:8px}.uz-conv-trace__table{display:grid;grid-template-columns:1fr;gap:0;margin-top:8px}.uz-conv-trace__row{display:grid;grid-template-columns:60px minmax(0,1fr);gap:10px;padding:4px 0;border-bottom:1px solid var(--ink-075);font-size:11px}.uz-conv-trace__row:last-child{border-bottom:0}.uz-conv-trace__row span:first-child{color:var(--ink-500)}.uz-conv-trace__row span:last-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--ink-900);font-family:var(--font-data)}.uz-conv-composer{padding:12px 18px 14px}.uz-conv-composer textarea{min-height:62px;border-radius:9px;padding:11px 13px;line-height:1.55}.uz-conv-composer__state{gap:8px;margin-bottom:9px}.uz-conv-composer__bar{gap:8px;margin-top:10px}.uz-conv-rail__head{gap:12px;padding:16px}.uz-conv-rail__head strong{font-size:15px}.uz-conv-rail__tabs{padding:0 14px}.uz-conv-rail__tabs button{padding:9px 11px;font-size:12px}.uz-conv-section{padding:14px 16px}.uz-conv-section h3{margin:0 0 9px;font:700 10px/1.2 var(--font-body);letter-spacing:.08em;color:var(--ink-300)}.uz-conv-kv{gap:0}.uz-conv-kv div{display:flex;gap:8px;padding:5px 0}.uz-conv-kv dt{flex:none;width:80px}.uz-conv-tags{gap:6px}.uz-conv-rail-list{gap:8px}.uz-conv-rail-list div{position:relative;display:grid;gap:2px;padding:0 0 0 15px;border:0;border-radius:0;background:transparent}.uz-conv-rail-list div::before{content:"";position:absolute;left:0;top:6px;width:7px;height:7px;border-radius:var(--radius-pill);background:var(--accent-data)}.uz-conv-quick{gap:6px}.uz-conv-quick .uz-button{height:34px;justify-content:flex-start}@media(max-width:960px){.uz-conv-list__tools{grid-template-columns:minmax(0,1fr) 62px;padding:6px 8px}.uz-conv-runtime-bar{align-items:flex-start;margin:10px 8px 0}.uz-conv-runtime-bar>span:last-child{white-space:normal}.uz-conv-thread__title{flex:1 1 160px}.uz-conv-composer{padding:10px 8px}.uz-conv-rail__head,.uz-conv-section{padding:12px 8px}.uz-conv-kv div{display:grid;grid-template-columns:72px minmax(0,1fr)}.uz-conv-quick .uz-button{width:100%;justify-content:center}}`;
const detailCss = `.uz-conv-list__head h2{font-size:15px}.uz-conv-list__head .uz-status-badge{border-radius:5px;padding:1px 7px;color:var(--ink-500);background:var(--ink-075);font:500 11px/1.45 var(--font-data)}.uz-conv-filter.uz-button{min-height:24px;border-radius:14px;padding:4px 10px;font-size:12px;font-weight:500}.uz-conv-filter.uz-button--primary{border-color:var(--ink-900);background:var(--ink-900);color:var(--card)}.uz-conv-filter.uz-button--secondary{border-color:var(--ink-150);background:var(--card);color:var(--ink-700)}.uz-conv-row{min-height:86px}.uz-conv-row .uz-avatar{width:22px;height:22px;font-size:10px}.uz-conv-row__top{gap:7px}.uz-conv-row__top strong{font-size:13px;font-weight:600}.uz-conv-row__top .mono{flex:none;color:var(--ink-500);font-size:10px}.uz-conv-row__preview{font-size:12px;line-height:1.4}.uz-conv-row__meta .uz-status-badge{border-radius:5px;padding:1px 7px;font-size:10px;line-height:1.45}.uz-conv-row__lang{font-size:10px}.uz-conv-thread__head{gap:6px}.uz-conv-thread__title{flex:1 1 96px;line-height:1.2}.uz-conv-thread__title strong{font:600 14px/1.2 var(--font-body)}.uz-conv-thread__title span{font-size:11px}.uz-conv-thread__head .uz-status-badge{border-radius:6px;padding:2px 7px;font-size:10px}.uz-conv-header-caveat{max-width:54px;font-size:10px}.uz-conv-actions{gap:6px}.uz-conv-actions .uz-button{min-height:30px;border-radius:7px;padding:7px 10px;gap:6px;font-size:12px}.uz-conv-actions .uz-button:nth-child(n+2){width:30px;padding:0}.uz-conv-actions .uz-button:nth-child(n+2)>span:not(.uz-icon-slot){display:none}.uz-conv-actions .uz-kbd{padding:1px 5px;font-size:10px}.uz-conv-actions .uz-conv-takeover.uz-button--danger:not(:disabled){border-color:var(--state-human);background:var(--state-human);color:var(--card);transition:none}.uz-conv-actions .uz-conv-takeover.uz-button--danger:not(:disabled):hover{background:var(--state-human-hover)}.uz-conv-actions .uz-conv-takeover.uz-button--danger:not(:disabled) .uz-kbd{border-color:rgb(255 255 255 / 40%);color:var(--card);background:rgb(255 255 255 / 16%)}.uz-conv-message__meta{gap:8px;margin-top:4px;font-size:10px}.uz-conv-message__meta .uz-button{min-height:24px;border-color:var(--state-ai-border);border-radius:5px;padding:2px 8px;color:var(--state-ai);background:var(--card);font-size:10px}.uz-conv-trace .uz-status-badge{padding:0;color:var(--state-ai);background:transparent;font-size:10px;letter-spacing:.06em;text-transform:uppercase}.uz-conv-composer .uz-status-badge{padding:3px 9px;font-size:11px}.uz-conv-composer__bar .uz-icon-slot{width:15px;height:15px}.uz-conv-rail .uz-avatar--lg{width:42px;height:42px;font-size:16px}.uz-conv-rail__head{min-height:75px}.uz-conv-rail__head>div{min-width:0;flex:1}.uz-conv-rail__head strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:600}.uz-conv-rail__head .uz-status-badge{padding:2px 9px;font-size:11px}.uz-conv-rail__tabs button{font-weight:500}.uz-conv-rail__tabs button.is-active{font-weight:600}.uz-conv-section:last-child{border-bottom:0}.uz-conv-kv dt,.uz-conv-kv dd{font-size:12px}.uz-conv-kv dd{color:var(--ink-900)}.uz-conv-tags .uz-status-badge{border-radius:13px;padding:3px 9px;font-size:11px}.uz-conv-rail-list strong{font-size:12px}.uz-conv-rail-list span{font-size:11px}.uz-conv-rail__quick-actions{flex:none;border-top:1px solid var(--ink-150);padding:12px 16px;background:var(--card)}.uz-conv-rail__quick-actions h3{margin:0 0 8px;font:700 10px/1.2 var(--font-body);letter-spacing:.08em;color:var(--ink-300)}.uz-conv-quick .uz-button{min-height:32px;border-radius:7px;padding:7px 9px;font-size:12px;font-weight:500}.uz-conv-quick .uz-icon-slot{width:15px;height:15px}.uz-conv-notes{flex:none;padding:0;border-top:1px solid var(--ink-075);border-bottom:0}.uz-conv-notes summary{display:block;padding:10px 16px;color:var(--ink-500);font:700 10px/1.2 var(--font-body);letter-spacing:.08em;cursor:pointer}.uz-conv-notes[open]{padding-bottom:12px}.uz-conv-notes[open] .uz-conv-rail-list{padding:0 16px}@media(max-width:960px){.uz-conv-actions .uz-button:nth-child(n+2){width:auto;padding:7px 10px}.uz-conv-actions .uz-button:nth-child(n+2)>span:not(.uz-icon-slot){display:inline}.uz-conv-row{min-height:76px}.uz-conv-rail__quick-actions{padding:12px 8px}.uz-conv-notes summary{padding:10px 8px}.uz-conv-notes[open] .uz-conv-rail-list{padding:0 8px}}`;
export const ConversationWorkbenchStyles = () =>
  h("style", null, css + vCss + detailCss);

export function ThreadHeader({
  active,
  disabled,
  disabledReason,
  degradedReason,
  handoffPending,
  requestHandoff
}: {
  active?: Runtime.ConversationRow;
  disabled: boolean;
  disabledReason: string;
  degradedReason: string;
  handoffPending: boolean;
  requestHandoff: () => void;
}) {
  return (
    <header className="uz-conv-thread__head">
      <div className="uz-conv-thread__title">
        <strong>{active ? Runtime.displayName(active) : "未选择会话"}</strong>
        <span>
          {active
            ? `${active.channel ?? "Business"} · ${active.displayRef || active.id} · ${
                active.language ?? "语言待识别"
              }`
            : "conversation-ticket runtime"}
        </span>
      </div>
      {threadBadges(active).map((badge) => (
        <StatusBadge key={badge.label} tone={badge.tone}>
          {badge.label}
        </StatusBadge>
      ))}
      <span
        className="uz-conv-sr-only"
        data-testid="m7-conversation-degraded"
        title={degradedReason}
      >
        synthetic/degraded/not-production 只读预览 {degradedReason}{" "}
        发送、人工作业外发、客户聚合和 WS 实时同步保持禁用。
      </span>
      <div className="uz-conv-actions">
        <Button
          className="uz-conv-takeover"
          disabled={disabled || handoffPending}
          icon={<IconSlot icon={Icons.Hand} />}
          isLoading={handoffPending}
          kbd="T"
          onClick={requestHandoff}
          title={disabled ? disabledReason : undefined}
          variant="danger"
        >
          接管会话
        </Button>
        <Button
          aria-label="更多会话动作暂未接入"
          disabled
          icon={<IconSlot icon={Icons.MoreHorizontal} />}
          title="更多会话动作需 runtime action contract"
        />
      </div>
    </header>
  );
}

function threadBadges(active?: Runtime.ConversationRow) {
  if (!active) return [];
  const badges: Array<{ label: string; tone: "danger" | "info" | "ok" | "warn" }> = [];
  if (active.status === "pending_handoff")
    badges.push({ label: "待人工", tone: "danger" });
  if (active.status === "handoff") badges.push({ label: "人工处理中", tone: "warn" });
  if (active.status === "closed") badges.push({ label: "已解决", tone: "ok" });
  if (active.status === "open") badges.push({ label: "AI 处理中", tone: "info" });
  if (active.slaRisk) badges.push({ label: slaBadgeLabel(active), tone: "danger" });
  if (active.aiState === "suspended")
    badges.push({ label: "AI 已暂停", tone: "danger" });
  return badges;
}

function slaBadgeLabel(active: Runtime.ConversationRow) {
  if (!active.slaText) return "SLA 即将超时";
  return active.slaText.toLowerCase().startsWith("sla")
    ? active.slaText
    : `SLA ${active.slaText}`;
}

export function MessageBody({
  messages,
  toggleTrace,
  traceOpen
}: {
  messages: Runtime.MessageRow[];
  toggleTrace: (id: string) => void;
  traceOpen: Record<string, boolean>;
}) {
  return (
    <div className="uz-conv-body">
      {messages.length === 0 ? (
        <PageState
          data-testid="m7-conversation-customer-context-unavailable"
          kind="degraded"
          message="详情消息、AI 轨迹和客户上下文未从 runtime 返回。"
          title="客户上下文不可用"
        />
      ) : (
        messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            open={traceOpen[`trace-${message.id}`] ?? Boolean(message.content.trace)}
            toggleTrace={toggleTrace}
          />
        ))
      )}
    </div>
  );
}

function MessageItem({
  message,
  open,
  toggleTrace
}: {
  message: Runtime.MessageRow;
  open: boolean;
  toggleTrace: (id: string) => void;
}) {
  const traceId = `trace-${message.id}`;
  return (
    <article
      className={`uz-conv-message is-${message.direction}`}
      data-testid={`m7-conversation-message-${message.id}`}
    >
      <div className="uz-conv-bubble">{Runtime.contentText(message)}</div>
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
      <div className="uz-conv-trace__table">
        {entries.map(([key, value]) => (
          <div className="uz-conv-trace__row" key={key}>
            <span>{key}</span>
            <span>{typeof value === "string" && value ? value : "未返回"}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Composer({
  active,
  degradedReason
}: {
  active?: Runtime.ConversationRow;
  degradedReason: string;
}) {
  const state = composerState(active);
  return (
    <footer
      className="uz-conv-composer"
      data-runtime-boundary={degradedReason}
      data-testid="m7-conversation-composer"
    >
      <div className="uz-conv-composer__state">
        <StatusBadge tone="warn">{state.badge}</StatusBadge>
        <span className="uz-conv-caveat" data-testid="m7-conversation-composer-caveat">
          由 AI 生成，确认后才会发送给客户
        </span>
      </div>
      <textarea aria-label="Conversation composer" disabled value={state.draft} />
      <div className="uz-conv-composer__bar">
        <Button disabled icon={<IconSlot icon={Icons.Paperclip} />}>
          附件
        </Button>
        <Button disabled icon={<IconSlot icon={Icons.MessageSquareQuote} />}>
          话术片段
        </Button>
        <span className="uz-conv-language">{state.language}</span>
        <span className="uz-conv-redline">红线检查通过</span>
        <Button disabled>编辑草稿</Button>
        <Button
          disabled
          icon={<IconSlot icon={Icons.SendHorizontal} />}
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

function roleLabel(message: Runtime.MessageRow) {
  if (message.direction === "inbound") return "客户";
  if (message.direction === "internal") return "系统/人工";
  return message.content.channel === "business" ? "Business · 待确认" : "AI 自动发送";
}

function timeLabel(value?: string) {
  return value ? value.replace("T", " ").slice(0, 16) : "—";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
