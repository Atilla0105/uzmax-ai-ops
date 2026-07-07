import { ClipboardList, RefreshCw, Ticket } from "lucide-react";
import { Avatar, Button, IconSlot, StatusBadge } from "../../primitives";
import { PageState } from "../../patterns";
import {
  displayName,
  type ConversationRow,
  type RuntimeStatus
} from "./conversationWorkbenchRuntime";

export type RailTab = "profile" | "tickets" | "orders" | "quotes";
type RailListProps = { collapsed?: boolean; items: string[][]; title: string };

const railTabs: Array<{ id: RailTab; label: string }> = [
  { id: "profile", label: "档案" },
  { id: "tickets", label: "工单" },
  { id: "orders", label: "订单" },
  { id: "quotes", label: "报价" }
];
const stateCopy = {
  empty: ["暂无会话", "没有会话，不会回退到 prototype fixture。"],
  loading: ["对话工作台加载中", "正在读取 conversation-ticket 运行时。"],
  permission: ["无对话工作台权限", "缺少 conversation:read 或 ticket:write。"]
} as const;

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
  const railLabel = railTabs.find((tab) => tab.id === railTab)?.label ?? "档案";
  const sectionTitle = railTab === "profile" ? "客户档案" : `${railLabel}上下文`;
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
        <KeyValueSection rows={data.rows} title={sectionTitle} />
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
      </div>
      <QuickActions />
      <RailList
        collapsed
        items={data.notes.map((note) => [`${note.who} · ${note.time}`, note.text])}
        title="人工备注"
      />
    </aside>
  );
}

export function renderConversationState(
  status: RuntimeStatus,
  message: string,
  reload: () => void
) {
  if (status === "ready") return null;
  if (status in stateCopy) {
    const copy = stateCopy[status as keyof typeof stateCopy];
    return (
      <PageState
        data-testid={`m7-conversation-${status}`}
        kind={status}
        message={copy[1]}
        title={copy[0]}
      />
    );
  }
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
  const name = active ? displayName(active) : "";
  const { customerName, customerRef, journeyStage, participantExternalRef } =
    active ?? {};
  const primaryName = customerName || name || "客户上下文不可用";
  return {
    initial: sourceInitial(primaryName),
    name: primaryName,
    ref:
      usableRef(participantExternalRef) ||
      usableRef(customerRef) ||
      "customer context runtime missing",
    stage: journeyStage || "—"
  };
}

function contextRows(active?: ConversationRow) {
  return sourceProfileRows(active?.profileRows) ?? operationalContextRows(active);
}

function sourceProfileRows(profileRows: ConversationRow["profileRows"]) {
  if (!profileRows?.length) return null;
  return profileRows.map((row) => [row.label, row.value]);
}

function operationalContextRows(active?: ConversationRow) {
  return [
    ["客户ID", customerIdentity(active)],
    ["语言", fieldOr(active?.language, "unavailable")],
    ["旅程阶段", fieldOr(active?.journeyStage, "客户上下文待接入")],
    ["未决工单", fieldOr(active?.ticketRef, "—")],
    ["订单快照", fieldOr(active?.orderRef, "—")],
    ["报价记录", fieldOr(active?.quoteRef, "—")]
  ];
}

function customerIdentity(active?: ConversationRow) {
  return active?.customerRef || active?.participantExternalRef || "unavailable";
}

function fieldOr(value: string | undefined, fallback: string) {
  return value || fallback;
}

function sourceInitial(value: string) {
  return Array.from(value.trim())[0] || "?";
}

function usableRef(value: string | undefined) {
  const trimmed = value?.trim() ?? "";
  return trimmed && trimmed !== "customer-ref-unavailable" ? trimmed : "";
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
        {[...tags, "+ 添加"].map((tag) => (
          <StatusBadge key={tag} tone="neutral">
            {tag}
          </StatusBadge>
        ))}
      </div>
    </section>
  );
}

function RailList({ collapsed = false, items, title }: RailListProps) {
  const list = (
    <div className="uz-conv-rail-list">
      {items.map(([head, body]) => (
        <div key={`${title}-${head}`}>
          <strong>{head}</strong>
          <span>{body}</span>
        </div>
      ))}
    </div>
  );
  if (collapsed)
    return (
      <details
        className="uz-conv-section uz-conv-notes"
        data-testid="m7-conversation-notes"
      >
        <summary>{title}</summary>
        {list}
      </details>
    );
  return (
    <section className="uz-conv-section">
      <h3>{title}</h3>
      {list}
    </section>
  );
}

function QuickActions() {
  return (
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
  );
}
