import { expect, test, type Page } from "@playwright/test";

const groupLabels = ["集团总览", "模型/成本/风险", "模板中心", "连接中心", "发布与验收", "租户管理", "集团日志"];
const tenantLabels = ["对话", "工单", "确认队列", "客户资产", "订单", "知识与资源", "评测中心", "AI 成员", "团队", "配置", "分析", "日志"];
const handoffs: unknown[] = [];

test.beforeEach(async ({ page }) => {
  handoffs.length = 0;
  await routeConversationReady(page);
});

test("renders tenant.conversations as the M7 conversation workbench", async ({ page }) => {
  await openConversations(page);
  await expect(page.getByTestId("page-outlet")).toHaveAttribute("data-page-id", "tenant.conversations");
  await expect(page.getByTestId("m7-conversation-workbench-page")).toBeVisible();
  await expect(page.getByTestId("page-scaffold")).toHaveCount(0);
  await expectTenantOnlyNav(page);
  await expect(page.getByTestId("m7-conversation-list")).toBeVisible();
  await expect(page.getByTestId("m7-conversation-thread")).toBeVisible();
  await expect(page.getByTestId("m7-conversation-context-rail")).toBeVisible();
  await expect(page.getByTestId("m7-conversation-degraded")).toContainText("Business draft");
  await expect(page.getByText("SLA 即将超时")).toBeVisible();
  await expect(page.getByText("AI suspended")).toBeVisible();
  await expect(page.getByText("withdrawn")).toBeVisible();
  await expect(page.getByText("pending_cancel")).toBeVisible();
  await expect(page.getByRole("button", { name: "展开 AI 轨迹" })).toBeVisible();
  await page.getByRole("button", { name: "展开 AI 轨迹" }).click();
  await expect(page.getByTestId("m7-conversation-ai-trace")).toContainText("controlled://m7-ui-20/kb/ref");
  await page.getByTestId("m7-conversation-row-conv-calm").click();
  await expect(page.getByTestId("m7-conversation-thread")).toContainText("conv-calm");
  await expect(page.getByLabel("Conversation composer")).toBeDisabled();
});

test("uses conversation-ticket runtime for takeover and reports missing runtime honestly", async ({ page }) => {
  await openConversations(page);
  await page.getByRole("button", { name: "接管会话 T" }).click();
  expect(handoffs).toContainEqual(expect.objectContaining({ reason: expect.stringContaining("M7 conversation") }));
  await expect(page.getByText("待人工").first()).toBeVisible();

  await page.unroute("**/conversation-ticket/conversations/*/handoff");
  await page.route("**/conversation-ticket/conversations/*/handoff", async (route) => {
    await route.fulfill({ json: { error: "controlled://m7-ui-20/handoff-missing" }, status: 500 });
  });
  await page.keyboard.press("t");
  await expect(page.getByTestId("m7-conversation-degraded")).toContainText("status 500");
});

test("covers loading empty error permission and customer-context unavailable states", async ({ page }) => {
  let release: (() => void) | undefined;
  await page.unroute("**/conversation-ticket/conversations");
  await page.route("**/conversation-ticket/conversations", async (route) => {
    await new Promise<void>((resolve) => { release = resolve; });
    await route.fulfill({ json: { items: [] } });
  });
  await openConversations(page);
  await expect(page.getByTestId("m7-conversation-loading")).toBeVisible();
  release?.();
  await expect(page.getByTestId("m7-conversation-empty")).toContainText("不会回退到 prototype fixture");

  await routeList(page, 500, { error: "controlled://m7-ui-20/error" });
  await openConversations(page);
  await expect(page.getByTestId("m7-conversation-error")).toContainText("status 500");

  await routeList(page, 403, { error: "controlled://m7-ui-20/permission" });
  await openConversations(page);
  await expect(page.getByTestId("m7-conversation-permission")).toContainText("conversation:read");

  await routeList(page, 200, { items: [conversation("conv-empty", "open", false)] });
  await page.route("**/conversation-ticket/conversations/conv-empty", async (route) => {
    await route.fulfill({ json: { conversation: conversation("conv-empty", "open", false), messages: [] } });
  });
  await openConversations(page);
  await expect(page.getByTestId("m7-conversation-customer-context-unavailable")).toBeVisible();
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
  await expect(page.getByTestId("admin-shell")).toHaveAttribute("data-shell-level", "tenant");
  await expect(page.getByTestId("admin-shell")).toHaveAttribute("data-active-page-id", "tenant.conversations");
}

async function expectTenantOnlyNav(page: Page) {
  const nav = page.getByTestId("app-shell-nav");
  for (const label of tenantLabels) await expect(nav.getByRole("button", { name: label, exact: true })).toBeVisible();
  for (const label of groupLabels) await expect(nav.getByRole("button", { name: label, exact: true })).toHaveCount(0);
}

async function routeConversationReady(page: Page) {
  await routeList(page, 200, { items: [conversation("conv-risk", "pending_handoff", true), conversation("conv-calm", "open", false)] });
  await page.route(/\/conversation-ticket\/conversations\/[^/]+$/, async (route) => {
    const id = route.request().url().split("/").pop() ?? "conv-risk";
    await route.fulfill({ json: detail(id) });
  });
  await page.route("**/conversation-ticket/conversations/*/handoff", async (route) => {
    const body = JSON.parse(route.request().postData() ?? "{}") as Record<string, unknown>;
    handoffs.push(body);
    await route.fulfill({ json: { conversation: conversation("conv-risk", "pending_handoff", true) } });
  });
}

async function routeList(page: Page, status: number, json: unknown) {
  await page.unroute("**/conversation-ticket/conversations").catch(() => {});
  await page.route("**/conversation-ticket/conversations", async (route) => {
    await route.fulfill({ json, status });
  });
}

function conversation(id: string, status: string, risk: boolean) {
  return {
    aiState: risk ? "suspended" : "active",
    awaitingReply: risk,
    externalConversationRef: `controlled://m7-ui-20/${id}`,
    id,
    inFlightAiMessages: risk ? [{ id: "ai-1", status: "withdrawn" }, { id: "ai-2", status: "pending_cancel" }] : [],
    lastMessageAt: "2026-07-03T12:24:00.000Z",
    participantExternalRef: `controlled://m7-ui-20/customer/${id}`,
    slaRisk: risk,
    status,
    subject: risk ? "SLA 风险会话" : "普通会话",
    tenantId: "tenant-b",
    unreadCount: risk ? 2 : 0
  };
}

function detail(id: string) {
  return {
    conversation: conversation(id, id === "conv-risk" ? "pending_handoff" : "open", id === "conv-risk"),
    messages: [
      message(`${id}-in`, "inbound", "客户询问售后进度。"),
      message(`${id}-ai`, "outbound", "建议答复草稿已生成，等待人工确认。", {
        intent: "controlled://m7-ui-20/intent/support",
        knowledge: "controlled://m7-ui-20/kb/ref",
        model: "controlled://m7-ui-20/model/route",
        redline: "pass"
      }),
      message(`${id}-sys`, "internal", "AI 已暂停，等待人工接管。")
    ]
  };
}

function message(id: string, direction: string, text: string, trace?: Record<string, string>) {
  return {
    content: { channel: direction === "outbound" ? "business" : "telegram", text, trace },
    contentKind: "text",
    direction,
    id,
    occurredAt: "2026-07-03T12:25:00.000Z"
  };
}
