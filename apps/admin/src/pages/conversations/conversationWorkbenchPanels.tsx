import { ClipboardList, RefreshCw, Ticket } from "lucide-react";
import { Avatar, Button, IconSlot, StatusBadge } from "../../primitives";
import { PageState } from "../../patterns";
import {
  displayName,
  type ConversationRow,
  type RuntimeStatus
} from "./conversationWorkbenchRuntime";

export type RailTab = "profile" | "tickets" | "orders" | "quotes";

const railTabs: Array<{ id: RailTab; label: string }> = [
  { id: "profile", label: "档案" },
  { id: "tickets", label: "工单" },
  { id: "orders", label: "订单" },
  { id: "quotes", label: "报价" }
];

export function ContextRail({
  active,
  railTab,
  setRailTab
}: {
  active?: ConversationRow;
  railTab: RailTab;
  setRailTab: (tab: RailTab) => void;
}) {
  const data = railData(active);
  const title = railTabs.find((tab) => tab.id === railTab)?.label ?? "档案";
  return (
    <aside className="uz-conv-rail" data-testid="m7-conversation-context-rail">
      <header className="uz-conv-rail__head">
        <Avatar initial={data.header.initial} size="lg" />
        <div>
          <strong>{data.header.name}</strong>
          <span>{data.header.ref}</span>
        </div>
        <StatusBadge tone="neutral">{data.header.stage}</StatusBadge>
      </header>
      <div aria-label="客户上下文视图" className="uz-conv-rail__tabs">
        {railTabs.map((tab) => (
          <button
            aria-pressed={tab.id === railTab}
            className={tab.id === railTab ? "is-active" : undefined}
            key={tab.id}
            onClick={() => setRailTab(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="uz-conv-rail__body">
        <KeyValueSection
          rows={data.rows}
          title={railTab === "profile" ? "客户档案" : `${title}上下文`}
        />
        <TagSection tags={data.tags} />
        <KeyValueSection
          rows={data.customFields.map((field) => [field.label, field.value])}
          title="自定义字段"
        />
        <RailList
          items={data.dualTracks.map((track) => [
            `${track.stage}`,
            `${track.time} · ${track.via}`
          ])}
          title="双轨引导"
        />
        <RailList
          items={data.notes.map((note) => [`${note.who} · ${note.time}`, note.text])}
          title="人工备注"
        />
      </div>
      <section className="uz-conv-rail__quick-actions">
        <h3>快捷动作</h3>
        <div className="uz-conv-quick">
          <Button disabled icon={<IconSlot icon={Ticket} />}>
            创建工单
          </Button>
          <Button disabled icon={<IconSlot icon={ClipboardList} />}>
            生成报价
          </Button>
          <Button disabled>身份归并</Button>
          <Button disabled>完整档案</Button>
        </div>
      </section>
    </aside>
  );
}

export function renderConversationState(
  status: RuntimeStatus,
  message: string,
  reload: () => void
) {
  if (status === "ready") return null;
  if (status === "loading")
    return (
      <PageState
        data-testid="m7-conversation-loading"
        kind="loading"
        message="正在读取 conversation-ticket 运行时。"
        title="对话工作台加载中"
      />
    );
  if (status === "empty")
    return (
      <PageState
        data-testid="m7-conversation-empty"
        kind="empty"
        message="没有会话，不会回退到 prototype fixture。"
        title="暂无会话"
      />
    );
  if (status === "permission")
    return (
      <PageState
        data-testid="m7-conversation-permission"
        kind="permission"
        message="缺少 conversation:read 或 ticket:write。"
        title="无对话工作台权限"
      />
    );
  return (
    <PageState
      action={
        <Button icon={<IconSlot icon={RefreshCw} />} onClick={reload}>
          重试
        </Button>
      }
      data-testid="m7-conversation-error"
      kind="error"
      message={message}
      title="对话运行时不可用"
    />
  );
}

function railData(active?: ConversationRow) {
  return {
    customFields: fallbackList(active?.customFields, [
      { label: "运行时", value: "客户资产聚合未接入" }
    ]),
    dualTracks: fallbackList(active?.dualTracks, [
      { stage: "双轨引导待接入", time: "—", via: "customer-context API" }
    ]),
    header: railHeader(active),
    notes: fallbackList(active?.notes, [
      { text: "只读预览：备注写入未接入。", time: "—", who: "系统" }
    ]),
    rows: contextRows(active),
    tags: fallbackList(active?.tags, ["上下文待接入"])
  };
}

function fallbackList<T>(value: T[] | undefined, fallback: T[]) {
  return value && value.length > 0 ? value : fallback;
}

function railHeader(active?: ConversationRow) {
  if (!active)
    return {
      initial: "?",
      name: "客户上下文不可用",
      ref: "customer context runtime missing",
      stage: "—"
    };
  return {
    initial: displayName(active),
    name: firstText(active.customerName, displayName(active)),
    ref: firstText(active.customerRef, active.participantExternalRef),
    stage: firstText(active.journeyStage, "—")
  };
}

function contextRows(active?: ConversationRow) {
  if (!active)
    return [
      ["客户ID", "unavailable"],
      ["语言", "unavailable"],
      ["旅程阶段", "客户上下文待接入"],
      ["未决工单", "—"],
      ["订单快照", "—"],
      ["报价记录", "—"]
    ];
  return [
    ["客户ID", firstText(active.customerRef, active.participantExternalRef)],
    ["语言", active.language ?? "unavailable"],
    ["旅程阶段", active.journeyStage ?? "客户上下文待接入"],
    ["未决工单", active.ticketRef ?? "—"],
    ["订单快照", active.orderRef ?? "—"],
    ["报价记录", active.quoteRef ?? "—"]
  ];
}

function firstText(primary?: string, fallback = "unavailable") {
  return primary || fallback;
}

function KeyValueSection({ rows, title }: { rows: string[][]; title: string }) {
  return (
    <section className="uz-conv-section">
      <h3>{title}</h3>
      <dl className="uz-conv-kv">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function TagSection({ tags }: { tags: string[] }) {
  return (
    <section className="uz-conv-section">
      <h3>客户标签</h3>
      <div className="uz-conv-tags">
        {tags.map((tag) => (
          <StatusBadge key={tag} tone="neutral">
            {tag}
          </StatusBadge>
        ))}
      </div>
    </section>
  );
}

function RailList({ items, title }: { items: string[][]; title: string }) {
  return (
    <section className="uz-conv-section">
      <h3>{title}</h3>
      <div className="uz-conv-rail-list">
        {items.map(([head, body]) => (
          <div key={`${title}-${head}`}>
            <strong>{head}</strong>
            <span>{body}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
