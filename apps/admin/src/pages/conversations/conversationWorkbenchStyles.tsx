import { createElement as h } from "react";
import { Bot, ClipboardList, Hand, Paperclip, RefreshCw, SendHorizontal, Ticket } from "lucide-react";
import { Avatar, Button, IconSlot, Kbd, StatusBadge } from "../../primitives";
import { PageState } from "../../patterns";
import { contentText, displayName, type ConversationRow, type MessageRow, type RuntimeStatus } from "./conversationWorkbenchRuntime";

const css = `.uz-page-conversations{position:relative;display:grid;grid-template-columns:316px minmax(420px,1fr) 340px;height:100%;min-height:0;background:var(--paper);color:var(--ink-900);font:var(--text-base)/1.45 var(--font-body)}.uz-conv-list,.uz-conv-thread,.uz-conv-rail{min-width:0;min-height:0;background:var(--card)}.uz-conv-list{display:flex;flex-direction:column;border-right:1px solid var(--ink-150)}.uz-conv-list__head,.uz-conv-thread__head{height:46px;display:flex;align-items:center;gap:var(--s-5);padding:0 var(--s-8);border-bottom:1px solid var(--ink-150)}.uz-conv-list__head h2,.uz-conv-thread__title strong{margin:0;font:700 var(--text-title)/1.2 var(--font-display)}.uz-conv-filters{display:flex;gap:var(--s-3);padding:var(--s-4) var(--s-6);overflow-x:auto;border-bottom:1px solid var(--ink-075)}.uz-conv-filter{white-space:nowrap}.uz-conv-rows{overflow:auto}.uz-conv-row{width:100%;display:grid;gap:var(--s-3);padding:var(--s-6) var(--s-7);border:0;border-bottom:1px solid var(--ink-075);background:var(--card);color:inherit;text-align:left;cursor:pointer}.uz-conv-row:hover,.uz-conv-row.is-selected{background:var(--paper)}.uz-conv-row.is-selected{box-shadow:inset 0 0 0 1px var(--ink-900)}.uz-conv-row__top,.uz-conv-row__meta,.uz-conv-message__meta,.uz-conv-actions,.uz-conv-rail__head,.uz-conv-rail__tabs,.uz-conv-composer__bar{display:flex;align-items:center;gap:var(--s-4)}.uz-conv-row__top strong{min-width:0;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:var(--text-base)}.uz-conv-row__preview{padding-left:30px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--ink-500);font-size:var(--text-sm)}.uz-conv-row__meta{padding-left:30px}.uz-conv-row__meta .mono,.uz-conv-thread__head .mono,.uz-conv-message__meta,.uz-conv-kv dd{font-family:var(--font-data)}.uz-conv-dot{width:8px;height:8px;border-radius:var(--radius-pill);background:var(--ink-300)}.uz-conv-dot.is-risk{background:var(--state-human)}.uz-conv-dot.is-warn{background:var(--state-warn)}.uz-conv-thread{display:flex;flex-direction:column;background:var(--paper)}.uz-conv-thread__head{background:var(--card);flex-wrap:wrap;overflow:hidden}.uz-conv-thread__title{display:grid;gap:var(--s-1);min-width:0}.uz-conv-thread__title span{color:var(--ink-500);font-size:var(--text-xs)}.uz-conv-actions{margin-left:auto}.uz-conv-body{flex:1;min-height:0;overflow:auto;padding:var(--s-9) var(--s-10);display:flex;flex-direction:column;gap:var(--s-7)}.uz-conv-message{max-width:78%;display:grid;gap:var(--s-2)}.uz-conv-message.is-inbound{align-self:flex-start}.uz-conv-message.is-outbound,.uz-conv-message.is-internal{align-self:flex-end}.uz-conv-bubble{padding:var(--s-5) var(--s-6);border:1px solid var(--ink-150);border-radius:var(--radius-xl) var(--radius-sm) var(--radius-xl) var(--radius-xl);background:var(--card);color:var(--ink-900);overflow-wrap:anywhere}.uz-conv-message.is-inbound .uz-conv-bubble{border-radius:var(--radius-sm) var(--radius-xl) var(--radius-xl) var(--radius-xl)}.uz-conv-message.is-outbound .uz-conv-bubble{background:var(--state-ai-bg);border-color:var(--state-ai-border)}.uz-conv-message.is-internal .uz-conv-bubble{background:var(--state-human-bg);border-color:var(--state-human-border)}.uz-conv-trace{margin-top:var(--s-3);padding:var(--s-5);border:1px solid var(--state-ai-border);border-radius:var(--radius-lg);background:var(--card)}.uz-conv-trace dl{display:grid;grid-template-columns:72px minmax(0,1fr);gap:var(--s-3);margin:var(--s-4) 0 0}.uz-conv-trace dt{color:var(--ink-500)}.uz-conv-trace dd{margin:0;font-family:var(--font-data);overflow-wrap:anywhere}.uz-conv-composer{flex:none;border-top:1px solid var(--ink-150);padding:var(--s-6) var(--s-8);background:var(--card)}.uz-conv-composer textarea{box-sizing:border-box;width:100%;min-height:66px;resize:vertical;border:1px solid var(--ink-150);border-radius:var(--radius-lg);padding:var(--s-5) var(--s-6);background:var(--paper);color:var(--ink-700);font:inherit}.uz-conv-composer textarea:disabled{opacity:1}.uz-conv-composer__bar{margin-top:var(--s-5)}.uz-conv-rail{display:flex;flex-direction:column;border-left:1px solid var(--ink-150);overflow:hidden}.uz-conv-rail__head{padding:var(--s-8);border-bottom:1px solid var(--ink-150)}.uz-conv-rail__head strong{display:block;font-size:var(--text-title)}.uz-conv-rail__head span{color:var(--ink-500);font-size:var(--text-xs)}.uz-conv-rail__tabs{padding:0 var(--s-7);border-bottom:1px solid var(--ink-150)}.uz-conv-rail__tabs button{border:0;border-bottom:2px solid transparent;background:transparent;padding:var(--s-5);font-weight:600;color:var(--ink-500);cursor:pointer}.uz-conv-rail__tabs button.is-active{border-color:var(--ink-900);color:var(--ink-900)}.uz-conv-rail__body{flex:1;min-height:0;overflow:auto}.uz-conv-section{padding:var(--s-7) var(--s-8);border-bottom:1px solid var(--ink-075)}.uz-conv-section h3{margin:0 0 var(--s-5);font:700 var(--text-sm)/1.2 var(--font-display);color:var(--ink-700)}.uz-conv-kv{display:grid;gap:var(--s-3)}.uz-conv-kv div{display:grid;grid-template-columns:86px minmax(0,1fr);gap:var(--s-4)}.uz-conv-kv dt{color:var(--ink-500)}.uz-conv-kv dd{margin:0;overflow-wrap:anywhere}.uz-conv-quick{display:grid;grid-template-columns:1fr 1fr;gap:var(--s-4)}.uz-conv-blocked{opacity:var(--opacity-muted)}.uz-conv-overlay{position:absolute;inset:0;z-index:var(--z-sticky);display:grid;place-items:center;background:var(--paper)}.uz-conv-overlay[hidden]{display:none}@media(max-width:960px){.uz-page-conversations{grid-template-columns:1fr;height:auto;min-height:100%}.uz-conv-list,.uz-conv-rail{border:0}.uz-conv-thread{min-height:560px}.uz-conv-rail{display:block}.uz-conv-row{min-height:76px}.uz-conv-actions{width:100%;justify-content:flex-start;margin-left:0}.uz-conv-thread__head{height:auto;min-height:46px;align-items:flex-start;flex-wrap:wrap;padding:var(--s-6)}.uz-conv-body{padding:var(--s-6)}.uz-conv-message{max-width:100%}.uz-conv-composer__bar{align-items:stretch;flex-direction:column}.uz-conv-quick{grid-template-columns:1fr}}`;
export const ConversationWorkbenchStyles = () => h("style", null, css);
type RailTab = "profile" | "tickets" | "orders" | "quotes";

export function ThreadHeader({ active, disabled, handoffPending, requestHandoff }: { active?: ConversationRow; disabled: boolean; handoffPending: boolean; requestHandoff: () => void }) {
  const badges = threadBadges(active), inFlight = active ? active.inFlightAiMessages?.slice(0, 2) ?? [] : [];
  return <header className="uz-conv-thread__head"><div className="uz-conv-thread__title"><strong>{active ? displayName(active) : "未选择会话"}</strong><span>{active?.externalConversationRef ?? "conversation-ticket runtime"}</span></div>{badges.map((badge) => <StatusBadge key={badge.label} tone={badge.tone}>{badge.label}</StatusBadge>)}{inFlight.map((message) => <StatusBadge key={message.id} tone="warn">{message.status}</StatusBadge>)}<div className="uz-conv-actions"><Button disabled={disabled || handoffPending} icon={<IconSlot icon={Hand} />} isLoading={handoffPending} kbd="T" onClick={requestHandoff} variant="danger">接管会话</Button><Button disabled icon={<IconSlot icon={Bot} />}>放回 AI</Button></div></header>;
}

function threadBadges(active?: ConversationRow) {
  if (!active) return [];
  const badges: Array<{ label: string; tone: "danger" }> = [];
  if (active.slaRisk) badges.push({ label: "SLA 即将超时", tone: "danger" });
  if (active.aiState === "suspended") badges.push({ label: "AI suspended", tone: "danger" });
  return badges;
}

export function MessageBody({ messages, toggleTrace, traceOpen }: { messages: MessageRow[]; toggleTrace: (id: string) => void; traceOpen: Record<string, boolean> }) {
  if (messages.length === 0) return <div className="uz-conv-body"><PageState data-testid="m7-conversation-customer-context-unavailable" kind="degraded" message="详情消息、AI 轨迹和客户上下文未从 runtime 返回。" title="客户上下文不可用" /></div>;
  return <div className="uz-conv-body">{messages.map((message) => <MessageItem key={message.id} message={message} open={Boolean(traceOpen[`trace-${message.id}`])} toggleTrace={toggleTrace} />)}</div>;
}

function MessageItem({ message, open, toggleTrace }: { message: MessageRow; open: boolean; toggleTrace: (id: string) => void }) {
  const traceId = `trace-${message.id}`;
  return <article className={`uz-conv-message is-${message.direction}`} data-testid={`m7-conversation-message-${message.id}`}><div className="uz-conv-bubble">{contentText(message)}</div><div className="uz-conv-message__meta"><span>{timeLabel(message.occurredAt)}</span><StatusBadge tone={message.direction === "inbound" ? "neutral" : "info"}>{roleLabel(message)}</StatusBadge>{message.content.trace ? <Button onClick={() => toggleTrace(traceId)}>{open ? "收起轨迹" : "展开 AI 轨迹"}</Button> : null}</div>{message.content.trace && open ? <AiTrace trace={message.content.trace} /> : null}</article>;
}

function AiTrace({ trace }: { trace: unknown }) {
  const entries = Object.entries(isRecord(trace) ? trace : {}).slice(0, 6);
  return <section className="uz-conv-trace" data-testid="m7-conversation-ai-trace"><StatusBadge tone="info">AI 决策痕迹</StatusBadge><dl>{entries.map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{String(value)}</dd></div>)}</dl></section>;
}

export function Composer({ active }: { active?: ConversationRow }) {
  const suspended = active?.aiState === "suspended";
  const copy = suspended ? "human send API 尚未批准；此处只读，不能伪造外部发送。" : "Business 草稿确认、human send 和 WS 状态尚未接入；可接管但不能自动发送。";
  return <footer className="uz-conv-composer" data-testid="m7-conversation-composer"><StatusBadge tone={suspended ? "danger" : "info"}>{suspended ? "人工外部回复 · 你已接管" : "AI 正在自动处理"}</StatusBadge><textarea aria-label="Conversation composer" disabled value={copy} /><div className="uz-conv-composer__bar"><Button disabled icon={<IconSlot icon={Paperclip} />}>附件</Button><Button disabled>话术片段</Button><span className="uz-conv-blocked">确认发送不可用 <Kbd>⌘↵</Kbd></span><Button disabled icon={<IconSlot icon={SendHorizontal} />} variant="success">确认发送</Button></div></footer>;
}

export function ContextRail({ active, railTab, setRailTab }: { active?: ConversationRow; railTab: RailTab; setRailTab: (tab: RailTab) => void }) {
  const tabs: Array<{ id: RailTab; label: string }> = [{ id: "profile", label: "档案" }, { id: "tickets", label: "工单" }, { id: "orders", label: "订单" }, { id: "quotes", label: "报价" }];
  const header = contextHeader(active), rows = contextRows(active), title = tabTitle(tabs, railTab);
  return <aside className="uz-conv-rail" data-testid="m7-conversation-context-rail"><header className="uz-conv-rail__head"><Avatar initial={header.initial} size="lg" /><div><strong>{header.name}</strong><span>{header.ref}</span></div></header><div className="uz-conv-rail__tabs" role="tablist">{tabs.map((tab) => <button className={tab.id === railTab ? "is-active" : undefined} key={tab.id} onClick={() => setRailTab(tab.id)} type="button">{tab.label}</button>)}</div><div className="uz-conv-rail__body"><section className="uz-conv-section"><h3>{railTab === "profile" ? "客户档案" : `${title}上下文`}</h3><dl className="uz-conv-kv">{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section><section className="uz-conv-section"><h3>快捷动作</h3><div className="uz-conv-quick"><Button disabled icon={<IconSlot icon={Ticket} />}>创建工单</Button><Button disabled icon={<IconSlot icon={ClipboardList} />}>完整档案</Button><Button disabled>订单快照</Button><Button disabled>生成报价</Button></div></section></div></aside>;
}

function contextHeader(active?: ConversationRow) {
  if (!active) return { initial: "?", name: "客户上下文不可用", ref: "customer context runtime missing" };
  return { initial: displayName(active), name: displayName(active), ref: active.participantExternalRef };
}

function contextRows(active?: ConversationRow): Array<[string, string]> {
  return [["客户 ref", active?.participantExternalRef ?? "unavailable"], ["会话 ref", active?.externalConversationRef ?? "unavailable"], ["租户", active?.tenantId ?? "unavailable"], ["上下文", "客户资产、订单、报价聚合 API 未接入"]];
}

function tabTitle(tabs: Array<{ id: RailTab; label: string }>, railTab: RailTab) {
  return tabs.find((tab) => tab.id === railTab)?.label ?? "档案";
}

export function renderConversationState(status: RuntimeStatus, message: string, reload: () => void) {
  if (status === "ready") return null;
  if (status === "loading") return <PageState data-testid="m7-conversation-loading" kind="loading" message="正在读取 conversation-ticket 运行时。" title="对话工作台加载中" />;
  if (status === "empty") return <PageState data-testid="m7-conversation-empty" kind="empty" message="没有会话，不会回退到 prototype fixture。" title="暂无会话" />;
  if (status === "permission") return <PageState data-testid="m7-conversation-permission" kind="permission" message="缺少 conversation:read 或 ticket:write。" title="无对话工作台权限" />;
  return <PageState action={<Button icon={<IconSlot icon={RefreshCw} />} onClick={reload}>重试</Button>} data-testid="m7-conversation-error" kind="error" message={message} title="对话运行时不可用" />;
}

function roleLabel(message: MessageRow) {
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
