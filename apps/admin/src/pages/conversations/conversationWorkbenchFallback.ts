import type {
  ConversationDetail,
  ConversationRow,
  MessageRow
} from "./conversationWorkbenchRuntime";

export const syntheticRuntimeUnavailableReason =
  "runtime-unavailable: conversation-ticket API absent/non-JSON in local preview; showing owner-source-like degraded/mock workbench data, not production metrics.";

const syntheticConversationRowsTemplate: ConversationRow[] = [
  {
    aiState: "suspended",
    awaitingReply: true,
    channel: "Telegram Bot",
    customerName: "Dilnoza Rashidova",
    customerRef: "CU-59284013",
    customFields: [
      { label: "客户来源", value: "广告投放" },
      { label: "偏好品类", value: "面部护理" },
      { label: "累计积分", value: "1280" },
      { label: "mock 边界", value: "runtime unavailable / read-only" }
    ],
    displayRef: "UZ-20413",
    draftText:
      "Hurmatli Dilnoza, tushunamiz. Pulni qaytarish uchun buyurtmani bekor qilishim mumkin yoki 2 kun kutishni so‘raymiz — qaysi birini tanlaysiz?",
    dualTracks: [
      {
        stage: "报价",
        time: "06-25",
        via: "教程旅程自动定位"
      },
      {
        stage: "售后",
        time: "06-26",
        via: "红线转人工"
      }
    ],
    externalConversationRef: "telegram-c1-owner-like",
    id: "mock-dilnoza-risk",
    inFlightAiMessages: [
      { id: "mock-ai-withdrawn", status: "withdrawn" },
      { id: "mock-ai-cancel", status: "pending_cancel" }
    ],
    journeyStage: "售后",
    language: "乌兹别克语（拉丁）/ mock",
    lastPreview: "Juda uzoq-ku! Pulni qaytarib bering, men kutmoqchi emasman.",
    memberLabel: "AI → 韩雪 · mock",
    notes: [
      {
        text: "已安抚，赠 ¥20 优惠券，客户同意继续等待物流。mock 只读预览，不写正式备注。",
        time: "06-26 11:24",
        who: "韩雪"
      }
    ],
    orderRef: "UZ-20413",
    participantExternalRef: "@dilnoza_r",
    quoteRef: "护肤入门套装 ¥268 · mock",
    slaRisk: true,
    slaText: "04:12",
    status: "pending_handoff",
    subject: "Dilnoza R.",
    tags: ["VIP", "退款敏感", "mock"],
    tenantId: "",
    ticketRef: "T-1042 · mock",
    timeLabel: "2分钟",
    unreadCount: 2
  },
  {
    aiState: "active",
    awaitingReply: true,
    channel: "Telegram Bot",
    customerName: "Иван Петров",
    customerRef: "CU-47120938",
    customFields: [
      { label: "客户来源", value: "自然" },
      { label: "偏好品类", value: "身体护理" },
      { label: "累计积分", value: "420" }
    ],
    displayRef: "UZ-20408",
    dualTracks: [{ stage: "售后", time: "今天 11:06", via: "红线转人工" }],
    externalConversationRef: "telegram-c2-owner-like",
    id: "mock-ivan-sla",
    inFlightAiMessages: [],
    journeyStage: "售后",
    language: "俄语 / mock",
    lastPreview: "Да, крем вытек прямо в коробке, все запачкано.",
    memberLabel: "AI → 李航 · mock",
    notes: [
      { text: "真实退货动作未接入；mock 仅展示风险密度。", time: "mock", who: "system" }
    ],
    orderRef: "UZ-20408",
    participantExternalRef: "@ivan_p",
    quoteRef: "—",
    slaRisk: true,
    slaText: "01:48",
    status: "open",
    subject: "Иван Петров",
    tags: ["退款敏感", "mock"],
    tenantId: "",
    ticketRef: "T-1039 · mock",
    timeLabel: "6分钟",
    unreadCount: 1
  },
  {
    aiState: "suspended",
    awaitingReply: false,
    channel: "Telegram Bot",
    customerName: "Азиз Каримов",
    customerRef: "CU-60923847",
    customFields: [
      { label: "客户来源", value: "广告投放" },
      { label: "偏好品类", value: "面部护理" },
      { label: "累计积分", value: "60" }
    ],
    displayRef: "UZ-20401",
    dualTracks: [{ stage: "报价", time: "06-28", via: "教程旅程自动定位" }],
    externalConversationRef: "telegram-c3-owner-like",
    id: "mock-aziz-human",
    inFlightAiMessages: [],
    journeyStage: "购买中",
    language: "乌兹别克语（西里尔）/ mock",
    lastPreview: "Салом! Буюртма қачон етиб келади?",
    memberLabel: "李航 · mock",
    notes: [
      {
        text: "确认无叠加折扣，已发放新人券引导下单。",
        time: "06-22 15:02",
        who: "李航"
      }
    ],
    orderRef: "UZ-20401",
    participantExternalRef: "@aziz_k",
    quoteRef: "护肤入门套装 ¥268 · mock",
    slaRisk: true,
    slaText: "08:30",
    status: "handoff",
    subject: "Азиз К.",
    tags: ["价格敏感", "mock"],
    tenantId: "",
    ticketRef: "T-1051 · mock",
    timeLabel: "11分钟",
    unreadCount: 0
  },
  {
    aiState: "active",
    awaitingReply: false,
    channel: "Telegram Bot",
    customerName: "Madina Saidova",
    customerRef: "CU-51038472",
    customFields: [{ label: "偏好品类", value: "面部护理" }],
    displayRef: "UZ-20421",
    dualTracks: [{ stage: "教程", time: "今天 11:09", via: "asset.fetch" }],
    externalConversationRef: "telegram-c4-owner-like",
    id: "mock-madina-ai",
    inFlightAiMessages: [],
    journeyStage: "复购",
    language: "乌兹别克语（拉丁）/ mock",
    lastPreview: "Rahmat! Kremni qanday ishlataman?",
    memberLabel: "AI · mock",
    notes: [],
    orderRef: "UZ-20421",
    participantExternalRef: "@madina_s",
    quoteRef: "教程候选 · mock",
    slaRisk: false,
    slaText: "",
    status: "open",
    subject: "Madina S.",
    tags: ["复购老客", "mock"],
    tenantId: "",
    ticketRef: "—",
    timeLabel: "14分钟",
    unreadCount: 0
  }
];

const syntheticMessages: Record<string, MessageRow[]> = {
  "mock-dilnoza-risk": [
    message(
      "mock-dilnoza-system",
      "internal",
      "会话由 Telegram Bot 接入 · 今天 09:14 · mock/read-only",
      undefined,
      { time: "09:14" }
    ),
    message(
      "mock-dilnoza-in",
      "inbound",
      "Salom! Yuz kremini buyurtma qilgandim (UZ-20413), 5 kun bo‘ldi hali yetib kelmadi.",
      undefined,
      { time: "09:14" }
    ),
    message(
      "mock-dilnoza-ai-check",
      "outbound",
      "Assalomu alaykum, Dilnoza! Buyurtmangizni tekshiryapman, bir daqiqa kuting.",
      {
        intent: "订单物流查询",
        knowledge: "物流时效·中亚 v4",
        model: "gpt-4o-mini · 218ms",
        redline: "通过",
        token: "in 412 / out 96 · ¥0.004",
        tool: "order.lookup(UZ-20413)"
      },
      {
        channel: "bot",
        time: "09:14"
      }
    ),
    message(
      "mock-dilnoza-ai-track",
      "outbound",
      "Buyurtmangiz hozir Toshkent saralash markazida, 1-2 kun ichida yetkaziladi. Iltimos, sabr qiling.",
      {
        intent: "物流节点说明",
        knowledge: "物流时效·中亚 v4 #3",
        model: "gpt-4o · 612ms",
        redline: "通过",
        token: "in 706 / out 142 · ¥0.018",
        tool: "order.tracking(UZ-20413)"
      },
      {
        channel: "bot",
        time: "09:15"
      }
    ),
    message(
      "mock-dilnoza-refund",
      "inbound",
      "Juda uzoq-ku! Pulni qaytarib bering, men kutmoqchi emasman.",
      undefined,
      { time: "09:21" }
    ),
    message(
      "mock-dilnoza-redline",
      "internal",
      "触发红线：退款诉求 · AI 已暂停自动回复，转人工确认 · mock/read-only",
      undefined,
      { time: "09:22" }
    )
  ],
  "mock-ivan-sla": [
    message(
      "mock-ivan-in",
      "inbound",
      "Здравствуйте! Заказ UZ-20408 пришёл повреждённым, коробка раздавлена."
    ),
    message(
      "mock-ivan-ai",
      "outbound",
      "Здравствуйте! Сожалею о повреждении. Пришлите, пожалуйста, фото товара для оформления возврата.",
      {
        intent: "退货/破损",
        knowledge: "退款流程说明 v3",
        model: "gpt-4o · 604ms",
        redline: "通过",
        token: "in 388 / out 88 · ¥0.016",
        tool: "order.lookup(UZ-20408)"
      },
      {
        channel: "bot",
        time: "11:02"
      }
    )
  ],
  "mock-aziz-human": [
    message("mock-aziz-in", "inbound", "Салом! Буюртма қачон етиб келади? (UZ-20401)"),
    message(
      "mock-aziz-system",
      "internal",
      "语音语言不在支持范围（乌语拉丁/西里尔、俄语）内，已转人工处理。mock/read-only"
    )
  ],
  "mock-madina-ai": [
    message("mock-madina-in", "inbound", "Rahmat! Kremni qanday ishlataman?"),
    message(
      "mock-madina-ai",
      "outbound",
      "Kremni kechqurun, yuzni tozalagandan so‘ng surting. Mana video qo‘llanma.",
      {
        intent: "教程问答",
        knowledge: "维C精华使用方法 v5",
        model: "gpt-4o · 588ms",
        redline: "通过",
        token: "in 302 / out 110 · ¥0.014",
        tool: "asset.fetch(面霜使用教程)"
      },
      {
        channel: "bot",
        time: "11:09"
      }
    )
  ]
};

export function syntheticConversationRows(selectedTenantId: string) {
  return syntheticConversationRowsTemplate.map((row) => ({
    ...row,
    tenantId: selectedTenantId
  }));
}

export function firstSyntheticConversationId(selectedTenantId: string) {
  return syntheticConversationRows(selectedTenantId)[0]?.id ?? "";
}

export function syntheticConversationDetail(
  conversationId: string,
  selectedTenantId: string
): ConversationDetail | null {
  const conversation = syntheticConversationRows(selectedTenantId).find(
    (row) => row.id === conversationId
  );
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
  trace?: Record<string, string>,
  options: { channel?: string; time?: string } = {}
): MessageRow {
  return {
    content: {
      channel: options.channel ?? (direction === "outbound" ? "business" : "telegram"),
      text,
      trace
    },
    contentKind: "text",
    direction,
    id,
    occurredAt: options.time ?? "2026-07-04T00:00:00.000Z"
  };
}
