import type {
  ConversationDetail,
  ConversationRow,
  MessageRow
} from "./conversationWorkbenchRuntime";

export const syntheticRuntimeUnavailableReason =
  "runtime-unavailable: conversation-ticket API absent/non-JSON in local preview; showing centralized synthetic/mock workbench data, not production metrics.";

export const syntheticConversationRows: ConversationRow[] = [
  {
    aiState: "suspended",
    awaitingReply: true,
    channel: "Telegram Business",
    customerRef: "SYN-CU-001",
    customFields: [
      { label: "数据源", value: "synthetic/mock" },
      { label: "runtime", value: "conversation-ticket unavailable" },
      { label: "可写动作", value: "disabled" }
    ],
    displayRef: "SYN-WB-001",
    dualTracks: [
      {
        stage: "synthetic 售后复核",
        time: "mock",
        via: "runtime-unavailable fallback"
      }
    ],
    externalConversationRef: "synthetic-business-thread-001",
    id: "synthetic-risk",
    inFlightAiMessages: [
      { id: "synthetic-ai-withdrawn", status: "withdrawn" },
      { id: "synthetic-ai-cancel", status: "pending_cancel" }
    ],
    journeyStage: "synthetic 售后",
    language: "乌·拉丁 / mock",
    lastPreview:
      "【synthetic/mock】退款诉求触发人工复核；API 未连接，数字和状态不可当作生产证据。",
    memberLabel: "AI Samarkand · synthetic",
    notes: [
      {
        text: "本行来自集中 fallback，仅用于本地无后端预览。",
        time: "mock",
        who: "system"
      }
    ],
    orderRef: "SYN-ORDER-001",
    participantExternalRef: "SYN-CU-001",
    quoteRef: "SYN-QUOTE-disabled",
    slaRisk: true,
    slaText: "SLA mock",
    status: "pending_handoff",
    subject: "Synthetic Dilnoza R.",
    tags: ["synthetic", "mock", "runtime-unavailable"],
    tenantId: "tenant-b",
    ticketRef: "SYN-TICKET-disabled",
    timeLabel: "mock",
    unreadCount: 2
  },
  {
    aiState: "active",
    awaitingReply: true,
    channel: "Telegram Bot",
    customerRef: "SYN-CU-002",
    customFields: [
      { label: "数据源", value: "synthetic/mock" },
      { label: "runtime", value: "read-only preview" }
    ],
    displayRef: "SYN-WB-002",
    dualTracks: [
      { stage: "synthetic 物流说明", time: "mock", via: "Telegram Bot" }
    ],
    externalConversationRef: "synthetic-bot-thread-002",
    id: "synthetic-awaiting",
    inFlightAiMessages: [],
    journeyStage: "synthetic 物流",
    language: "俄语 / mock",
    lastPreview:
      "【synthetic/mock】物流节点说明待确认；真实 conversation-ticket runtime 未返回。",
    memberLabel: "AI Bukhara · synthetic",
    notes: [
      { text: "筛选计数来自 mock rows。", time: "mock", who: "system" }
    ],
    orderRef: "SYN-ORDER-002",
    participantExternalRef: "SYN-CU-002",
    quoteRef: "SYN-QUOTE-disabled",
    slaRisk: false,
    slaText: "",
    status: "open",
    subject: "Synthetic Ivan P.",
    tags: ["synthetic", "awaiting", "mock"],
    tenantId: "tenant-b",
    ticketRef: "SYN-TICKET-disabled",
    timeLabel: "mock",
    unreadCount: 1
  },
  {
    aiState: "suspended",
    awaitingReply: false,
    channel: "Telegram Business",
    customerRef: "SYN-CU-003",
    customFields: [
      { label: "数据源", value: "synthetic/mock" },
      { label: "handoff", value: "already human-owned preview" }
    ],
    displayRef: "SYN-WB-003",
    dualTracks: [
      { stage: "synthetic 人工接管", time: "mock", via: "Business" }
    ],
    externalConversationRef: "synthetic-business-thread-003",
    id: "synthetic-human",
    inFlightAiMessages: [],
    journeyStage: "synthetic 人工处理中",
    language: "乌·西里尔 / mock",
    lastPreview:
      "【synthetic/mock】人工外部回复区域可见，但所有发送动作保持禁用。",
    memberLabel: "Ops Han · synthetic",
    notes: [
      { text: "真实外发、备注、标签写入均未启用。", time: "mock", who: "system" }
    ],
    orderRef: "SYN-ORDER-003",
    participantExternalRef: "SYN-CU-003",
    quoteRef: "SYN-QUOTE-disabled",
    slaRisk: false,
    slaText: "",
    status: "handoff",
    subject: "Synthetic Aziz K.",
    tags: ["synthetic", "human", "mock"],
    tenantId: "tenant-b",
    ticketRef: "SYN-TICKET-disabled",
    timeLabel: "mock",
    unreadCount: 0
  }
];

const syntheticMessages: Record<string, MessageRow[]> = {
  "synthetic-risk": [
    message(
      "synthetic-risk-in",
      "inbound",
      "【synthetic/mock】Customer asks for refund after delayed delivery."
    ),
    message(
      "synthetic-risk-ai",
      "outbound",
      "【synthetic/mock】Business draft generated for review; API is unavailable.",
      {
        intent: "synthetic refund / SLA risk",
        knowledge: "prototype-like fallback, not runtime KB",
        model: "runtime-unavailable",
        redline: "mock review only",
        token: "synthetic, no billing",
        tool: "order.lookup(SYN-ORDER-001)"
      }
    ),
    message(
      "synthetic-risk-system",
      "internal",
      "runtime-unavailable fallback: AI send, handoff mutation and WS sync are disabled."
    )
  ],
  "synthetic-awaiting": [
    message(
      "synthetic-awaiting-in",
      "inbound",
      "【synthetic/mock】Customer asks where the parcel is now."
    ),
    message(
      "synthetic-awaiting-ai",
      "outbound",
      "【synthetic/mock】Draft explains that real logistics data is unavailable in preview.",
      {
        intent: "synthetic logistics status",
        knowledge: "prototype-like fallback",
        model: "runtime-unavailable",
        redline: "mock review only",
        token: "synthetic, no billing",
        tool: "order.tracking(SYN-ORDER-002)"
      }
    )
  ],
  "synthetic-human": [
    message(
      "synthetic-human-in",
      "inbound",
      "【synthetic/mock】Customer asks for manual follow-up."
    ),
    message(
      "synthetic-human-system",
      "internal",
      "Synthetic operator owns the conversation; external reply remains disabled."
    )
  ]
};

export function firstSyntheticConversationId() {
  return syntheticConversationRows[0]?.id ?? "";
}

export function syntheticConversationDetail(
  conversationId: string
): ConversationDetail | null {
  const conversation = syntheticConversationRows.find((row) => row.id === conversationId);
  if (!conversation) return null;
  return {
    conversation,
    messages: syntheticMessages[conversationId] ?? []
  };
}

function message(
  id: string,
  direction: MessageRow["direction"],
  text: string,
  trace?: Record<string, string>
): MessageRow {
  return {
    content: {
      channel: direction === "outbound" ? "business" : "telegram",
      text,
      trace
    },
    contentKind: "text",
    direction,
    id,
    occurredAt: "2026-07-04T00:00:00.000Z"
  };
}
