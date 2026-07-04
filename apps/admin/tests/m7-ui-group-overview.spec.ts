import { expect, test, type Page } from "@playwright/test";

const groupLabels =
  "集团总览|模型/成本/风险|模板中心|连接中心|发布与验收|租户管理|集团日志".split("|");
const tenantLabels =
  "对话|工单|确认队列|客户资产|订单|知识与资源|评测中心|AI 成员|团队|配置|分析|日志".split(
    "|"
  );
const groupSections = ["总览", "平台", "治理"];
const tenantSections = ["运营", "数据", "智能", "管理", "洞察"];
const tableHeaders =
  "租户|会话量|待人工|SLA风险|转人工率|AI成本/日|评测状态|订单状态|最后异常".split("|");

test.beforeEach(async ({ page }) => {
  await page.route("**/conversation-ticket/conversations", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
});

test("renders group overview with group-only shell and degraded mock data", async ({
  page
}) => {
  await page.goto("/design");

  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "group"
  );
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "group.overview"
  );
  await expect(page.getByTestId("page-outlet")).toHaveAttribute(
    "data-page-id",
    "group.overview"
  );
  await expect(page.getByTestId("m7-group-overview-page")).toBeVisible();
  await expect(page.getByRole("heading", { name: "集团总览" })).toBeVisible();
  await expect(page.getByTestId("m7-group-overview-degraded-label")).toContainText(
    "mock"
  );
  await expect(page.getByTestId("m7-group-overview-runtime-note")).toContainText(
    "aggregate runtime unavailable"
  );
  await expect(page.getByTestId("m7-group-overview-runtime-note")).toContainText(
    "not production metrics"
  );
  await expect(page.getByTestId("m7-group-overview-search")).toHaveAttribute(
    "placeholder",
    "搜索租户 / 业务线"
  );

  await expectLayerNav(page, groupSections, tenantSections, groupLabels, tenantLabels);
  await expect(page.locator(".uz-group-health__card")).toHaveCount(6);
  for (const label of [
    "租户总数",
    "异常租户",
    "AI 熔断",
    "模型故障",
    "订单 connector 故障",
    "红线事件 / 今日"
  ]) {
    await expect(page.getByTestId("m7-group-overview-health-cards")).toContainText(
      label
    );
  }
  for (const header of tableHeaders) {
    await expect(
      page.getByTestId("m7-group-overview-table").getByRole("columnheader", {
        name: new RegExp(header)
      })
    ).toBeVisible();
  }

  await expect(page.getByTestId("app-shell-nav")).toHaveJSProperty("offsetWidth", 232);
  const topbarHeight = await page.locator(".uz-topbar").evaluate((node) => {
    return (node as HTMLElement).offsetHeight;
  });
  expect(topbarHeight).toBeGreaterThanOrEqual(52);
  expect(topbarHeight).toBeLessThanOrEqual(53);
});

test("supports search filters clear and sort without claiming runtime truth", async ({
  page
}) => {
  await page.goto("/design");
  const table = page.getByTestId("m7-group-overview-table");

  await page.getByTestId("m7-group-overview-search").fill("租户 C");
  await expect(page.getByTestId("m7-group-overview-result-label")).toContainText(
    "mock rows"
  );
  await expect(table.getByText("Mock 租户 C")).toBeVisible();
  await expect(table.getByText("Mock 租户 A")).toHaveCount(0);

  await page.getByTestId("m7-group-health-card-orderFault").click();
  await expect(page.getByTestId("m7-group-overview-result-label")).toContainText(
    "订单 connector 故障"
  );
  await expect(table.getByText("Mock 租户 C")).toBeVisible();

  await page.getByTestId("m7-group-overview-clear-filter").click();
  await expect(table.getByText("Mock 租户 A")).toBeVisible();
  await expect(table.getByText("Mock 租户 D")).toBeVisible();

  await page.getByTestId("m7-group-sort-human").click();
  await expectTenantOrder(page, [
    "Mock 租户 C",
    "Mock 租户 A",
    "Mock 租户 B",
    "Mock 租户 D"
  ]);
  await page.getByTestId("m7-group-sort-human").click();
  await expectTenantOrder(page, [
    "Mock 租户 D",
    "Mock 租户 B",
    "Mock 租户 A",
    "Mock 租户 C"
  ]);
  await expect(page.getByTestId("m7-group-overview-page")).toContainText("mock");
});

test("tenant entry button click enters tenant conversations and tenant-only navigation", async ({
  page
}) => {
  await page.goto("/design");

  await page.getByTestId("m7-group-enter-tenant-tenant-b").click();
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "tenant"
  );
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.conversations"
  );
  await expect(page.getByTestId("page-outlet")).toHaveAttribute(
    "data-tenant-id",
    "tenant-b"
  );
  await expect(page.getByTestId("m7-conversation-workbench-page")).toBeVisible();
  await expectLayerNav(page, tenantSections, groupSections, tenantLabels, groupLabels);
});

test("tenant entry supports keyboard Enter and Space", async ({ page }) => {
  await page.goto("/design");

  await page.getByTestId("m7-group-enter-tenant-tenant-b").focus();
  await page.keyboard.press("Enter");
  await expectTenantRoute(page, "tenant-b");

  await page.goto("/design");
  await page.getByTestId("m7-group-enter-tenant-tenant-c").focus();
  await page.keyboard.press("Space");
  await expectTenantRoute(page, "tenant-c");
});

test("sidebar collapse and 320px mobile fallback avoid body overflow", async ({
  page
}) => {
  await page.goto("/design");
  await page.getByRole("button", { name: "Collapse navigation" }).click();
  await expect(page.getByTestId("app-shell-nav")).toHaveJSProperty("offsetWidth", 68);
  await expect(page.getByTestId("admin-shell")).toHaveClass(/is-nav-collapsed/);

  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/design");
  await expect(page.getByTestId("m7-group-overview-page")).toBeVisible();
  await expect(page.getByTestId("m7-group-overview-table")).toBeVisible();
  expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(320);
});

async function expectLayerNav(
  page: Page,
  visibleSectionLabels: readonly string[],
  hiddenSectionLabels: readonly string[],
  visibleLabels: readonly string[],
  hiddenLabels: readonly string[]
) {
  const nav = page.getByTestId("app-shell-nav");
  await expect
    .poll(() => nav.locator(".uz-nav-group p").allTextContents())
    .toEqual(visibleSectionLabels);
  for (const label of hiddenSectionLabels)
    await expect(nav.locator(".uz-nav-group p", { hasText: label })).toHaveCount(0);
  for (const label of visibleLabels)
    await expect(nav.getByRole("button", { name: label, exact: true })).toBeVisible();
  for (const label of hiddenLabels)
    await expect(nav.getByRole("button", { name: label, exact: true })).toHaveCount(0);
}

async function expectTenantRoute(page: Page, tenantId: string) {
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "tenant"
  );
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.conversations"
  );
  await expect(page.getByTestId("page-outlet")).toHaveAttribute(
    "data-tenant-id",
    tenantId
  );
}

async function expectTenantOrder(page: Page, expected: string[]) {
  await expect
    .poll(() =>
      page
        .locator("[data-testid^='m7-group-overview-row-']")
        .locator("strong")
        .allTextContents()
    )
    .toEqual(expected);
}
