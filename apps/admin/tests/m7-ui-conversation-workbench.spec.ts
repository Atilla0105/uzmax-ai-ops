import { expect, test, type Page } from "@playwright/test";

const groupLabels =
  "集团总览|模型/成本/风险|模板中心|连接中心|发布与验收|租户管理|集团日志".split("|");
const tenantLabels =
  "对话|工单|确认队列|客户资产|订单|知识与资源|评测中心|AI 成员|团队|配置|分析|日志".split("|");
const handoffs: unknown[] = [];
const handoffTargets: string[] = [];
type RouteOptions = { slaPolicyRef?: string; tenantId?: string };
type Trace = Record<string, string>;
const composer = (page: Page) => page.getByLabel("Conversation composer");
const degraded = (page: Page) => page.getByTestId("m7-conversation-degraded");
const rail = (page: Page) => page.getByTestId("m7-conversation-context-rail");
const row = (page: Page, id: string) => page.getByTestId(`m7-conversation-row-${id}`);
const takeover = (page: Page) => page.getByRole("button", { name: "接管会话 T" });

test.beforeEach(async ({ page }) => {
  handoffs.length = 0;
  handoffTargets.length = 0;
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
  await expect(page.getByTestId("m7-conversation-workbench-page")).toHaveAttribute(
    "data-runtime-state",
    "degraded"
  );
  for (const text of ["发送", "WS", "SLA policyRef", "degraded"])
    await expect(degraded(page)).toContainText(text);
  await expect(takeover(page)).toBeDisabled();
  await expect(page.getByTestId("m7-conversation-query-degraded")).toContainText(
    "查询降级"
  );
  await expect(page.getByTestId("m7-conversation-search-disabled")).toBeDisabled();
  await expect(page.getByTestId("m7-conversation-search-disabled")).toHaveAttribute(
    "title",
    /runtime 查询参数未接入/
  );
  await expect(page.getByTestId("m7-conversation-sort-disabled")).toBeDisabled();
  await expect(page.getByTestId("m7-conversation-sort-disabled")).toHaveAttribute(
    "aria-label",
    /排序菜单未接入/
  );
  await expect(page.getByText("SLA 即将超时")).toBeVisible();
  await expect(page.getByText("AI 已暂停", { exact: true })).toBeVisible();
  await expect(page.getByText("已撤回")).toBeVisible();
  await expect(page.getByText("取消中")).toBeVisible();
  await expect(page.getByTestId("m7-conversation-list")).toContainText(
    "Nodira Karimova"
  );
  await expect(rail(page)).toContainText("ORD-REF-20413");
  await expect(rail(page).getByRole("tablist")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "档案", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true"
  );
  await expect(page.getByTestId("m7-conversation-ai-trace")).toContainText(
    "物流时效-中亚 v4"
  );
  await page.getByRole("button", { name: "收起轨迹" }).click();
  await expect(page.getByTestId("m7-conversation-ai-trace")).toHaveCount(0);
  await row(page, "conv-calm").click();
  await expect(page.getByTestId("m7-conversation-thread")).toContainText("WB-20419");
  await expect(composer(page)).toHaveValue(/ORD-REF-20419/);
  await expect(composer(page)).not.toHaveValue(/ORD-REF-20413/);
});

test("requires actionable takeover status with runtime policy", async ({ page }) => {
  await routeConversationReady(page, { slaPolicyRef: "tenant-b-sla-policy" });
  await openConversations(page);
  await expect(takeover(page)).toBeDisabled();
  await expect(degraded(page)).toContainText("等待人工接管/分配");
  await page.keyboard.press("t");
  expect(handoffTargets).toEqual([]);

  await row(page, "conv-calm").click();
  await expect(composer(page)).toHaveValue(/ORD-REF-20419/);
  await expect(takeover(page)).toBeEnabled();
  await takeover(page).click();
  await expect.poll(() => handoffTargets).toEqual(["conv-calm"]);

  await row(page, "conv-closed").click();
  await expect(composer(page)).toHaveValue(/ORD-REF-20429/);
  await expect(takeover(page)).toBeDisabled();
  await expect(degraded(page)).toContainText("已解决会话不可重复接管");
  await page.keyboard.press("t");

  await row(page, "conv-human").click();
  await expect(composer(page)).toHaveValue(/ORD-REF-20425/);
  await expect(takeover(page)).toBeDisabled();
  await expect(degraded(page)).toContainText("会话已由人工接管");
  await page.keyboard.press("t");
  expect(handoffTargets).toEqual(["conv-calm"]);
});

test("posts takeover only when runtime SLA policy exists", async ({ page }) => {
  await openConversations(page);
  await expect(takeover(page)).toBeDisabled();
  await page.keyboard.press("t");
  expect(handoffs).toHaveLength(0);

  await routeConversationReady(page, { slaPolicyRef: "tenant-b-sla-policy" });
  await openConversations(page);
  await expect(takeover(page)).toBeDisabled();
  await row(page, "conv-calm").click();
  await takeover(page).click();
  expect(handoffs).toContainEqual(
    expect.objectContaining({
      reason: expect.stringContaining("M7 conversation"),
      slaPolicyRef: "tenant-b-sla-policy"
    })
  );
  expect(JSON.stringify(handoffs)).not.toContain("controlled://m7-ui-20/sla/default");
  await expect(page.getByText("待人工").first()).toBeVisible();
  await expect(takeover(page)).toBeDisabled();
  await page.keyboard.press("t");
  expect(handoffTargets).toEqual(["conv-calm"]);

  await row(page, "conv-ai").click();
  await page.unroute("**/conversation-ticket/conversations/*/handoff");
  await page.route("**/conversation-ticket/conversations/*/handoff", async (route) => {
    await route.fulfill({
      json: { error: "handoff-runtime-missing" },
      status: 500
    });
  });
  await expect(takeover(page)).toBeEnabled();
  await takeover(page).click();
  await expect(degraded(page)).toContainText("status 500");
});

test("ignores stale handoff response detail", async ({ page }) => {
  let release: (() => void) | undefined;
  const policyRoute = { slaPolicyRef: "tenant-b-sla-policy" };
  await routeConversationReady(page, policyRoute);
  await page.unroute("**/conversation-ticket/conversations/*/handoff");
  await page.route("**/conversation-ticket/conversations/*/handoff", async (route) => {
    const targetId = handoffTargetFromUrl(route.request().url());
    handoffs.push(JSON.parse(route.request().postData() ?? "{}"));
    handoffTargets.push(targetId);
    await new Promise<void>((resolve) => {
      release = resolve;
    });
    await route.fulfill({
      json: {
        conversation: conversation(targetId, "pending_handoff", true, policyRoute)
      }
    });
  });

  await openConversations(page);
  await row(page, "conv-calm").click();
  await takeover(page).click();
  await expect.poll(() => handoffTargets).toEqual(["conv-calm"]);
  await row(page, "conv-ai").click();
  await expect(composer(page)).toHaveValue(/ORD-REF-20427/);
  release?.();
  await expect(takeover(page)).toBeEnabled();
  await expect(composer(page)).toHaveValue(/ORD-REF-20427/);
  await expect(composer(page)).not.toHaveValue(/ORD-REF-20419/);
  await expect(rail(page)).toContainText("ORD-REF-20427");
});

test("rejects handoff responses from another tenant", async ({ page }) => {
  const policyRoute = { slaPolicyRef: "tenant-b-sla-policy" };
  await routeConversationReady(page, policyRoute);
  await page.unroute("**/conversation-ticket/conversations/*/handoff");
  await page.route("**/conversation-ticket/conversations/*/handoff", async (route) => {
    const targetId = handoffTargetFromUrl(route.request().url());
    handoffs.push(JSON.parse(route.request().postData() ?? "{}"));
    handoffTargets.push(targetId);
    await route.fulfill({
      json: {
        conversation: conversation(targetId, "pending_handoff", true, {
          ...policyRoute,
          tenantId: "tenant-c"
        })
      }
    });
  });

  await openConversations(page);
  await row(page, "conv-calm").click();
  await takeover(page).click();
  await expect.poll(() => handoffTargets).toEqual(["conv-calm"]);
  await expect(degraded(page)).toContainText(
    "handoff response did not match selected tenant tenant-b"
  );
  await expect(row(page, "conv-calm")).not.toContainText("待人工");
});

test("keeps selected target safe when detail fails", async ({ page }) => {
  await page.unroute(/\/conversation-ticket\/conversations\/[^/]+$/).catch(() => {});
  await page.route(/\/conversation-ticket\/conversations\/[^/]+$/, async (route) => {
    const id = route.request().url().split("/").pop() ?? "conv-risk";
    if (id === "conv-calm")
      return route.fulfill({ json: { error: "detail-failed" }, status: 500 });
    return route.fulfill({ json: detail(id) });
  });
  await openConversations(page);
  await row(page, "conv-calm").click();
  await expect(page.getByTestId("m7-conversation-thread")).toContainText("WB-20419");
  await expect(rail(page)).toContainText("ORD-REF-20419");
  await expect(takeover(page)).toBeDisabled();
  await page.keyboard.press("t");
  expect(handoffs).toHaveLength(0);
  await expect(degraded(page)).toContainText("status 500");
});

test("keeps mobile fallback within 320px without mixed group nav", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await openConversations(page);
  await expectTenantOnlyNav(page);
  await expect(takeover(page)).toBeDisabled();
  await expect(composer(page)).toBeDisabled();
  expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(320);
});

async function openConversations(page: Page, tenantId = "tenant-b") {
  await page.goto("/design");
  await page.getByTestId("tenant-switcher").selectOption(tenantId);
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

async function routeConversationReady(page: Page, options: RouteOptions = {}) {
  await routeList(page, 200, {
    items: conversationIds.map((id) =>
      conversation(id, statusForId(id), riskForId(id), options)
    )
  });
  await page.unroute(/\/conversation-ticket\/conversations\/[^/]+$/).catch(() => {});
  await page.route(/\/conversation-ticket\/conversations\/[^/]+$/, async (route) => {
    const id = route.request().url().split("/").pop() ?? "conv-risk";
    await route.fulfill({ json: detail(id, options) });
  });
  await page.unroute("**/conversation-ticket/conversations/*/handoff").catch(() => {});
  await page.route("**/conversation-ticket/conversations/*/handoff", async (route) => {
    const targetId = handoffTargetFromUrl(route.request().url());
    handoffs.push(JSON.parse(route.request().postData() ?? "{}"));
    handoffTargets.push(targetId);
    await route.fulfill({
      json: {
        conversation: conversation(targetId, "pending_handoff", true, options)
      }
    });
  });
}

async function routeList(page: Page, status: number, json: unknown) {
  await page.unroute("**/conversation-ticket/conversations").catch(() => {});
  await page.route("**/conversation-ticket/conversations", async (route) => {
    await route.fulfill({ json, status });
  });
}

function conversation(
  id: string,
  status: string,
  risk: boolean,
  options: RouteOptions = {}
) {
  const data = conversationData[id] ?? conversationData["conv-risk"]!;
  const [subject, displayRef, orderRef, slaText, timeLabel] = data;
  return {
    aiState: risk || status === "handoff" ? "suspended" : "active",
    awaitingReply: risk || id === "conv-awaiting",
    channel: "Business",
    customerRef: `CU-${displayRef.slice(3)}`,
    customFields: fieldPairs,
    displayRef,
    dualTracks: dualTracks,
    externalConversationRef: displayRef,
    id,
    inFlightAiMessages: risk ? inFlightAiMessages : [],
    journeyStage: "售后跟进",
    language: "中文 / ru",
    lastMessageAt: "2026-07-03T12:24:00.000Z",
    lastPreview: `${orderRef} 节点复核中，建议给客户确认口径。`,
    memberLabel: "AI Samarkand",
    notes,
    orderRef,
    participantExternalRef: `CU-${displayRef.slice(3)}`,
    quoteRef: "QT-REF-1907",
    slaPolicyRef: options.slaPolicyRef,
    slaRisk: risk,
    slaText: risk ? slaText : "",
    status,
    subject,
    tags: ["高频客户", "售后", "Business"],
    tenantId: options.tenantId ?? "tenant-b",
    ticketRef: "TK-REF-3842",
    timeLabel,
    unreadCount: risk ? 2 : 0
  };
}

function detail(id: string, options: RouteOptions = {}) {
  return {
    conversation: conversation(id, statusForId(id), riskForId(id), options),
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
      message(`${id}-sys`, "internal", "AI 已暂停，等待人工接管。"),
      message(
        `${id}-ai-brief`,
        "outbound",
        "补充草稿：先确认分拣复核，再给出下一节点预计更新时间。"
      ),
      message(`${id}-ops`, "internal", "运营状态：接管中，Business 外发待确认。")
    ]
  };
}

const statusById: Record<string, string> = {
  "conv-closed": "closed",
  "conv-human": "handoff",
  "conv-risk": "pending_handoff"
};
const statusForId = (id: string) => statusById[id] ?? "open";

const riskForId = (id: string) => id === "conv-risk" || id === "conv-late";

function handoffTargetFromUrl(url: string) {
  const parts = url.split("/");
  return parts[parts.length - 2] ?? "conv-risk";
}

function message(id: string, direction: string, text: string, trace?: Trace) {
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

const conversationIds = ["conv-risk", "conv-calm", "conv-awaiting", "conv-human", "conv-ai", "conv-closed", "conv-late"];
const fieldPairs = [{ label: "国家/城市", value: "UZ · Tashkent" }, { label: "偏好语言", value: "中文 / ru" }, { label: "最近渠道", value: "Telegram Business" }];
const dualTracks = [{ stage: "物流说明已触达", time: "今天 12:18", via: "Business" }, { stage: "售后复核待确认", time: "今天 12:22", via: "AI 草稿" }];
const inFlightAiMessages = [{ id: "ai-1", status: "withdrawn" }, { id: "ai-2", status: "pending_cancel" }];
const notes = [{ text: "偏好先给预计节点，再解释异常原因。", time: "12:10", who: "Ops Lin" }];
const conversationData: Record<string, readonly [string, string, string, string, string]> = {
  "conv-risk": ["Nodira Karimova", "WB-20413", "ORD-REF-20413", "SLA 16m", "2分钟"],
  "conv-calm": ["Aziz Bek", "WB-20419", "ORD-REF-20419", "", "14分钟"],
  "conv-awaiting": ["Madina S.", "WB-20421", "ORD-REF-20421", "", "11分钟"],
  "conv-human": ["Timur Aliyev", "WB-20425", "ORD-REF-20425", "", "20分钟"],
  "conv-ai": ["Dilnoza M.", "WB-20427", "ORD-REF-20427", "", "34分钟"],
  "conv-closed": ["Rustam K.", "WB-20429", "ORD-REF-20429", "", "1小时"],
  "conv-late": ["Malika R.", "WB-20431", "ORD-REF-20431", "SLA 29m", "6分钟"]
};
