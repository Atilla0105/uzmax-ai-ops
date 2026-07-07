import { expect, test, type Page } from "@playwright/test";

const groupLabels =
  "集团总览|模型/成本/风险|模板中心|连接中心|发布与验收|租户管理|集团日志".split("|");
const tenantLabels =
  "对话|工单|确认队列|客户资产|订单|知识与资源|评测中心|AI 成员|团队|配置|分析|日志".split(
    "|"
  );
const tenantSections = ["运营", "数据", "智能", "管理", "洞察"];
const groupSections = ["总览", "平台", "治理"];

test.beforeEach(async ({ page }) => {
  await page.route("**/conversation-ticket/conversations", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
});

test("renders tenant.tickets with tenant-only navigation and degraded mock labels", async ({
  page
}) => {
  await openTickets(page);

  await expect(page.getByTestId("page-outlet")).toHaveAttribute(
    "data-page-id",
    "tenant.tickets"
  );
  await expect(page.getByTestId("m7-ticket-page")).toBeVisible();
  await expect(page.getByTestId("m7-ticket-page")).toHaveAttribute(
    "data-runtime-state",
    "degraded"
  );
  await expect(page.getByTestId("m7-ticket-runtime-note")).toContainText("degraded");
  await expect(page.getByTestId("m7-ticket-runtime-note")).toContainText("mock");
  await expect(page.getByTestId("m7-ticket-runtime-note")).toContainText(
    "not production ticket data"
  );
  await expect(page.getByTestId("m7-ticket-list")).toContainText("工单");
  await expect(page.getByTestId("m7-ticket-list")).toContainText("6 tickets");
  for (const id of ["unclaimed", "mine", "sla", "reopened", "follow"]) {
    await expect(page.getByTestId(`m7-ticket-tab-${id}`)).not.toContainText("mock");
  }
  await expect(page.getByTestId("m7-ticket-tab-sla")).toHaveAttribute(
    "aria-pressed",
    "true"
  );
  await expect(page.getByTestId("m7-ticket-tab-mine")).toHaveAttribute(
    "aria-pressed",
    "false"
  );
  await expect(page.getByTestId("m7-ticket-row-T-1042")).toHaveAttribute(
    "aria-pressed",
    "true"
  );
  await expect(page.getByTestId("m7-ticket-detail")).toContainText("Dilnoza");
  await expect(page.getByTestId("m7-ticket-detail")).toContainText("UZ-20413");
  await expect(page.getByTestId("m7-ticket-detail")).not.toContainText("T-MOCK");
  await expect(page.getByTestId("m7-ticket-detail")).not.toContainText("Mock 客户");
  await expect(page.getByTestId("m7-ticket-detail")).not.toContainText("MOCK-ORDER");
  await expect(page.getByTestId("m7-ticket-detail")).not.toContainText(
    "ticket runtime unavailable"
  );
  await expect(page.getByTestId("m7-ticket-detail")).toContainText("摘要");
  await expect(page.getByTestId("m7-ticket-detail")).toContainText("AI 建议处理");
  await expect(page.getByTestId("m7-ticket-detail")).toContainText("会话片段");
  await expect(page.getByTestId("m7-ticket-detail")).toContainText("报价记录");
  await expect(page.getByTestId("m7-ticket-detail")).toContainText("事件时间线");
  await expect(page.getByTestId("m7-ticket-detail")).toContainText("备注");
  await expect(page.getByTestId("m7-ticket-side-column")).toContainText("客户");
  await expect(page.getByTestId("m7-ticket-side-column")).toContainText("相关订单");
  await expect(page.getByTestId("m7-ticket-side-column")).toContainText("关闭工单");
  await expectTenantOnlyNav(page);

  const listWidth = await page.getByTestId("m7-ticket-list").evaluate((node) => {
    return (node as HTMLElement).offsetWidth;
  });
  expect(listWidth).toBeGreaterThanOrEqual(380);
  expect(listWidth).toBeLessThanOrEqual(381);
  await expect(page.getByTestId("m7-ticket-side-column")).toHaveJSProperty(
    "offsetWidth",
    248
  );
  const topbarHeight = await page.locator(".uz-topbar").evaluate((node) => {
    return (node as HTMLElement).offsetHeight;
  });
  expect(topbarHeight).toBeGreaterThanOrEqual(52);
  expect(topbarHeight).toBeLessThanOrEqual(53);
});

test("supports tab switching row selection claim transfer notes and close required note", async ({
  page
}) => {
  await openTickets(page);

  await page.getByTestId("m7-ticket-tab-mine").click();
  await expect(page.getByTestId("m7-ticket-tab-mine")).toHaveAttribute(
    "aria-pressed",
    "true"
  );
  await expect(page.getByTestId("m7-ticket-tab-sla")).toHaveAttribute(
    "aria-pressed",
    "false"
  );
  await expect(page.getByTestId("m7-ticket-list")).toContainText("T-1051");
  await page.getByTestId("m7-ticket-row-T-1051").click();
  await expect(page.getByTestId("m7-ticket-row-T-1051")).toHaveAttribute(
    "aria-pressed",
    "true"
  );
  await expect(page.getByTestId("m7-ticket-detail")).toContainText(
    "套装报价咨询转人工"
  );

  await page.getByTestId("m7-ticket-tab-sla").click();
  await page.getByTestId("m7-ticket-row-T-1042").click();
  await expect(page.getByTestId("m7-ticket-claim")).toBeEnabled();
  await page.getByTestId("m7-ticket-claim").click();
  await expect(page.getByTestId("m7-ticket-claim")).toContainText("已认领 · 韩雪");

  await page.getByTestId("m7-ticket-transfer").selectOption("王敏");
  await expect(page.getByTestId("m7-ticket-claim")).toContainText("已认领 · 王敏");

  await page.getByTestId("m7-ticket-note-input").fill("内部备注：等待 runtime 接入。");
  await page.getByTestId("m7-ticket-add-note").click();
  await expect(page.getByTestId("m7-ticket-detail")).toContainText(
    "内部备注：等待 runtime 接入。"
  );

  await page.getByRole("button", { name: "无响应" }).click();
  await expect(page.getByRole("button", { name: "无响应" })).toHaveAttribute(
    "aria-pressed",
    "true"
  );
  await expect(page.getByRole("button", { name: "无效" })).toHaveAttribute(
    "aria-pressed",
    "false"
  );
  await expect(page.getByTestId("m7-ticket-confirm-close")).toBeDisabled();
  await page.getByTestId("m7-ticket-close-note").fill("close note required");
  await expect(page.getByTestId("m7-ticket-confirm-close")).toBeEnabled();
  await page.getByTestId("m7-ticket-confirm-close").click();
  await expect(page.getByTestId("m7-ticket-side-column")).toContainText("工单已关闭");
  await expect(page.getByTestId("m7-ticket-side-column")).toContainText(
    "close note required"
  );
});

test("resets local ticket state when switching tenants in place", async ({ page }) => {
  await openTickets(page);

  await page.getByTestId("m7-ticket-row-T-1042").click();
  await page.getByTestId("m7-ticket-claim").click();
  await page.getByTestId("m7-ticket-transfer").selectOption("王敏");
  await page
    .getByTestId("m7-ticket-note-input")
    .fill("tenant-b local note must not leak");
  await page.getByTestId("m7-ticket-add-note").click();
  await page.getByRole("button", { name: "无响应" }).click();
  await page.getByTestId("m7-ticket-close-note").fill("tenant-b local close result");
  await page.getByTestId("m7-ticket-confirm-close").click();
  await expect(page.getByTestId("m7-ticket-side-column")).toContainText("工单已关闭");

  await page.getByTestId("tenant-switcher").selectOption("tenant-c");
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.tickets"
  );
  await expect(page.getByTestId("page-outlet")).toHaveAttribute(
    "data-tenant-id",
    "tenant-c"
  );
  await expect(page.getByTestId("m7-ticket-page")).toHaveAttribute(
    "data-tenant-id",
    "tenant-c"
  );
  await expect(page.getByTestId("m7-ticket-row-T-1042")).toBeVisible();
  await expect(page.getByTestId("m7-ticket-row-T-1042")).toHaveAttribute(
    "aria-pressed",
    "true"
  );
  await expect(page.getByTestId("m7-ticket-claim")).toBeEnabled();
  await expect(page.getByTestId("m7-ticket-claim")).toContainText("认领");
  await expect(page.getByTestId("m7-ticket-detail")).not.toContainText(
    "tenant-b local note must not leak"
  );
  await expect(page.getByTestId("m7-ticket-side-column")).not.toContainText(
    "tenant-b local close result"
  );
  await expect(page.getByTestId("m7-ticket-side-column")).not.toContainText(
    "工单已关闭"
  );
  await expect(page.getByTestId("m7-ticket-close-note")).toHaveCount(0);
});

test("supports sidebar collapse and 320px readable fallback without mixed group nav", async ({
  page
}) => {
  await openTickets(page);
  await page.getByRole("button", { name: "Collapse navigation" }).click();
  await expect(page.getByTestId("app-shell-nav")).toHaveJSProperty("offsetWidth", 68);
  await expectTenantOnlyNav(page);

  await page.setViewportSize({ width: 320, height: 900 });
  await openTickets(page);
  await expect(page.getByTestId("m7-ticket-page")).toBeVisible();
  await expect(page.getByTestId("m7-ticket-list")).toBeVisible();
  await expect(page.getByTestId("m7-ticket-detail")).toBeVisible();
  expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(320);
  await expectTenantOnlyNav(page);
});

async function openTickets(page: Page) {
  await page.goto("/design");
  await page.getByTestId("tenant-switcher").selectOption("tenant-b");
  await page
    .getByTestId("app-shell-nav")
    .getByRole("button", { name: "工单", exact: true })
    .click();
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "tenant"
  );
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.tickets"
  );
}

async function expectTenantOnlyNav(page: Page) {
  const nav = page.getByTestId("app-shell-nav");
  await expect
    .poll(() => nav.locator(".uz-nav-group p").allTextContents())
    .toEqual(tenantSections);
  for (const label of tenantLabels)
    await expect(nav.getByRole("button", { name: label, exact: true })).toBeVisible();
  for (const label of groupLabels)
    await expect(nav.getByRole("button", { name: label, exact: true })).toHaveCount(0);
  for (const label of groupSections)
    await expect(nav.locator(".uz-nav-group p", { hasText: label })).toHaveCount(0);
}
