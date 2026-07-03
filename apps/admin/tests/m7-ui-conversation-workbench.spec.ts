import { expect, test, type Page } from "@playwright/test";

const groupLabels = [
  "集团总览",
  "模型/成本/风险",
  "模板中心",
  "连接中心",
  "发布与验收",
  "租户管理",
  "集团日志"
];
const tenantLabels = [
  "对话",
  "工单",
  "确认队列",
  "客户资产",
  "订单",
  "知识与资源",
  "评测中心",
  "AI 成员",
  "团队",
  "配置",
  "分析",
  "日志"
];
const handoffs: unknown[] = [];

test.beforeEach(async ({ page }) => {
  handoffs.length = 0;
  await routeConversationReady(page);
});

test("renders tenant.conversations as the M7 conversation workbench", async ({
  page
}) => {
  await openConversations(page);
  await expect(page.getByTestId("page-outlet")).toHaveAttribute(
    "data-page-id",
    "tenant.conversations"
  );
  await expect(page.getByTestId("m7-conversation-workbench-page")).toBeVisible();
  await expect(page.getByTestId("page-scaffold")).toHaveCount(0);
  await expectTenantOnlyNav(page);
  await expect(page.getByTestId("m7-conversation-list")).toBeVisible();
  await expect(page.getByTestId("m7-conversation-thread")).toBeVisible();
  await expect(page.getByTestId("m7-conversation-context-rail")).toBeVisible();
  await expect(page.getByTestId("m7-conversation-degraded")).toContainText("发送");
  await expect(page.getByText("SLA 即将超时")).toBeVisible();
  await expect(page.getByText("AI 已暂停", { exact: true })).toBeVisible();
  await expect(page.getByText("已撤回")).toBeVisible();
  await expect(page.getByText("取消中")).toBeVisible();
  await expect(page.getByTestId("m7-conversation-list")).toContainText(
    "Nodira Karimova"
  );
  await expect(page.getByTestId("m7-conversation-context-rail")).toContainText(
    "ORD-REF-20413"
  );
  await expect(page.getByRole("button", { name: "展开 AI 轨迹" })).toBeVisible();
  await page.getByRole("button", { name: "展开 AI 轨迹" }).click();
  await expect(page.getByTestId("m7-conversation-ai-trace")).toContainText(
    "物流时效-中亚 v4"
  );
  await page.getByTestId("m7-conversation-row-conv-calm").click();
  await expect(page.getByTestId("m7-conversation-thread")).toContainText("WB-20419");
  await expect(page.getByLabel("Conversation composer")).toBeDisabled();
});

test("uses conversation-ticket runtime for takeover and reports missing runtime honestly", async ({
  page
}) => {
  await openConversations(page);
  await page.getByRole("button", { name: "接管会话 T" }).click();
  expect(handoffs).toContainEqual(
    expect.objectContaining({ reason: expect.stringContaining("M7 conversation") })
  );
  await expect(page.getByText("待人工").first()).toBeVisible();

  await page.unroute("**/conversation-ticket/conversations/*/handoff");
  await page.route("**/conversation-ticket/conversations/*/handoff", async (route) => {
    await route.fulfill({
      json: { error: "handoff-runtime-missing" },
      status: 500
    });
  });
  await page.keyboard.press("t");
  await expect(page.getByTestId("m7-conversation-degraded")).toContainText(
    "status 500"
  );
});

test("covers loading empty error permission and customer-context unavailable states", async ({
  page
}) => {
  let release: (() => void) | undefined;
  await page.unroute("**/conversation-ticket/conversations");
  await page.route("**/conversation-ticket/conversations", async (route) => {
    await new Promise<void>((resolve) => {
      release = resolve;
    });
    await route.fulfill({ json: { items: [] } });
  });
  await openConversations(page);
  await expect(page.getByTestId("m7-conversation-loading")).toBeVisible();
  release?.();
  await expect(page.getByTestId("m7-conversation-empty")).toContainText(
    "不会回退到 prototype fixture"
  );

  await routeList(page, 500, { error: "conversation-runtime-error" });
  await openConversations(page);
  await expect(page.getByTestId("m7-conversation-error")).toContainText("status 500");

  await routeList(page, 403, { error: "conversation-permission-denied" });
  await openConversations(page);
  await expect(page.getByTestId("m7-conversation-permission")).toContainText(
    "conversation:read"
  );

  await routeList(page, 200, { items: [conversation("conv-empty", "open", false)] });
  await page.route("**/conversation-ticket/conversations/conv-empty", async (route) => {
    await route.fulfill({
      json: { conversation: conversation("conv-empty", "open", false), messages: [] }
    });
  });
  await openConversations(page);
  await expect(
    page.getByTestId("m7-conversation-customer-context-unavailable")
  ).toBeVisible();
});

test("keeps mobile fallback within 320px without mixed group nav", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await openConversations(page);
  await expectTenantOnlyNav(page);
  await expect(page.getByRole("button", { name: "接管会话 T" })).toBeVisible();
  await expect(page.getByLabel("Conversation composer")).toBeDisabled();
  expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(320);
});

async function openConversations(page: Page) {
  await page.goto("/design");
  await page.getByTestId("tenant-switcher").selectOption("tenant-b");
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "tenant"
  );
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.conversations"
  );
}

async function expectTenantOnlyNav(page: Page) {
  const nav = page.getByTestId("app-shell-nav");
  for (const label of tenantLabels)
    await expect(nav.getByRole("button", { name: label, exact: true })).toBeVisible();
  for (const label of groupLabels)
    await expect(nav.getByRole("button", { name: label, exact: true })).toHaveCount(0);
}

async function routeConversationReady(page: Page) {
  await routeList(page, 200, {
    items: [
      conversation("conv-risk", "pending_handoff", true),
      conversation("conv-calm", "open", false),
      conversation("conv-awaiting", "open", false),
      conversation("conv-human", "handoff", false),
      conversation("conv-ai", "open", false),
      conversation("conv-closed", "closed", false),
      conversation("conv-late", "open", true)
    ]
  });
  await page.route(/\/conversation-ticket\/conversations\/[^/]+$/, async (route) => {
    const id = route.request().url().split("/").pop() ?? "conv-risk";
    await route.fulfill({ json: detail(id) });
  });
  await page.route("**/conversation-ticket/conversations/*/handoff", async (route) => {
    const body = JSON.parse(route.request().postData() ?? "{}") as Record<
      string,
      unknown
    >;
    handoffs.push(body);
    await route.fulfill({
      json: { conversation: conversation("conv-risk", "pending_handoff", true) }
    });
  });
}

async function routeList(page: Page, status: number, json: unknown) {
  await page.unroute("**/conversation-ticket/conversations").catch(() => {});
  await page.route("**/conversation-ticket/conversations", async (route) => {
    await route.fulfill({ json, status });
  });
}

function conversation(id: string, status: string, risk: boolean) {
  const data = conversationData[id] ?? conversationData["conv-risk"]!;
  return {
    aiState: risk || status === "handoff" ? "suspended" : "active",
    awaitingReply: risk || id === "conv-awaiting",
    channel: data.channel,
    customerRef: data.customerRef,
    customFields: data.customFields,
    displayRef: data.displayRef,
    dualTracks: data.dualTracks,
    externalConversationRef: data.displayRef,
    id,
    inFlightAiMessages: risk
      ? [
          { id: "ai-1", status: "withdrawn" },
          { id: "ai-2", status: "pending_cancel" }
        ]
      : [],
    journeyStage: data.stage,
    language: data.language,
    lastMessageAt: data.lastMessageAt,
    lastPreview: data.preview,
    memberLabel: data.member,
    notes: data.notes,
    orderRef: data.orderRef,
    participantExternalRef: data.customerRef,
    quoteRef: data.quoteRef,
    slaRisk: risk,
    slaText: risk ? data.slaText : "",
    status,
    subject: data.name,
    tags: data.tags,
    tenantId: "tenant-b",
    ticketRef: data.ticketRef,
    unreadCount: risk ? 2 : 0
  };
}

function detail(id: string) {
  return {
    conversation: conversation(
      id,
      id === "conv-risk" ? "pending_handoff" : "open",
      id === "conv-risk"
    ),
    messages: [
      message(`${id}-in`, "inbound", "你好，我想确认包裹现在卡在哪个节点？"),
      message(
        `${id}-ai`,
        "outbound",
        "已生成 Business 草稿，建议先说明复核节点并保留人工接管。",
        {
          intent: "售后进度 / SLA 风险",
          knowledge: "物流时效-中亚 v4",
          model: "gpt-4.1-mini / tenant policy",
          redline: "通过",
          token: "1.2k / ￥0.06",
          tool: "order.lookup(ORD-REF-20413)"
        }
      ),
      message(`${id}-sys`, "internal", "AI 已暂停，等待人工接管。")
    ]
  };
}

function message(
  id: string,
  direction: string,
  text: string,
  trace?: Record<string, string>
) {
  return {
    content: {
      channel: direction === "outbound" ? "business" : "telegram",
      text,
      trace
    },
    contentKind: "text",
    direction,
    id,
    occurredAt: "2026-07-03T12:25:00.000Z"
  };
}

const conversationData: Record<
  string,
  {
    channel: string;
    customerRef: string;
    customFields: Array<{ label: string; value: string }>;
    displayRef: string;
    dualTracks: Array<{ stage: string; time: string; via: string }>;
    language: string;
    lastMessageAt: string;
    member: string;
    name: string;
    notes: Array<{ text: string; time: string; who: string }>;
    orderRef: string;
    preview: string;
    quoteRef: string;
    slaText: string;
    stage: string;
    tags: string[];
    ticketRef: string;
  }
> = {
  "conv-risk": rowData("Nodira Karimova", "WB-20413", "ORD-REF-20413", "SLA 16m"),
  "conv-calm": rowData("Aziz Bek", "WB-20419", "ORD-REF-20419", ""),
  "conv-awaiting": rowData("Madina S.", "WB-20421", "ORD-REF-20421", ""),
  "conv-human": rowData("Timur Aliyev", "WB-20425", "ORD-REF-20425", ""),
  "conv-ai": rowData("Dilnoza M.", "WB-20427", "ORD-REF-20427", ""),
  "conv-closed": rowData("Rustam K.", "WB-20429", "ORD-REF-20429", ""),
  "conv-late": rowData("Malika R.", "WB-20431", "ORD-REF-20431", "SLA 29m")
};

function rowData(name: string, displayRef: string, orderRef: string, slaText: string) {
  return {
    channel: "Business",
    customerRef: `CU-${displayRef.slice(3)}`,
    customFields: [
      { label: "国家/城市", value: "UZ · Tashkent" },
      { label: "偏好语言", value: "中文 / ru" },
      { label: "最近渠道", value: "Telegram Business" }
    ],
    displayRef,
    dualTracks: [
      { stage: "物流说明已触达", time: "今天 12:18", via: "Business" },
      { stage: "售后复核待确认", time: "今天 12:22", via: "AI 草稿" }
    ],
    language: "中文 / ru",
    lastMessageAt: "2026-07-03T12:24:00.000Z",
    member: "AI Samarkand",
    name,
    notes: [
      { text: "偏好先给预计节点，再解释异常原因。", time: "12:10", who: "Ops Lin" }
    ],
    orderRef,
    preview: `${orderRef} 节点复核中，建议给客户确认口径。`,
    quoteRef: "QT-REF-1907",
    slaText,
    stage: "售后跟进",
    tags: ["高频客户", "售后", "Business"],
    ticketRef: "TK-REF-3842"
  };
}
