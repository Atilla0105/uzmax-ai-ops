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
const forbiddenVisibleTerms = [
  "mock/degraded",
  "mock",
  "read-only",
  "runtime unavailable",
  "not production metrics",
  "centralized mock/degraded fallback only",
  "aggregate runtime unavailable",
  "synthetic"
];

test.beforeEach(async ({ page }) => {
  await page.route("**/conversation-ticket/conversations", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
});

test("renders group overview with group-only shell and hidden runtime boundary", async ({
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
  await expect(page.getByTestId("m7-group-overview-result-label")).toContainText(
    "4 个租户"
  );
  await expect(page.getByTestId("m7-group-overview-result-label")).not.toContainText(
    "mock"
  );
  await expect(page.getByTestId("m7-group-overview-page")).toHaveAttribute(
    "data-runtime-state",
    "degraded"
  );
  await expect(page.getByTestId("m7-group-overview-page")).toHaveAttribute(
    "data-runtime-source",
    "centralized-mock-degraded"
  );
  const runtimeBoundary =
    (await page
      .getByTestId("m7-group-overview-page")
      .getAttribute("data-runtime-boundary")) ?? "";
  expect(runtimeBoundary).toContain("mock");
  expect(runtimeBoundary).toContain("read-only");
  expect(runtimeBoundary).toContain("not production metrics");
  await expect(page.getByTestId("m7-group-overview-runtime-note")).toBeHidden();
  await expect(page.getByTestId("m7-group-overview-runtime-note")).toContainText(
    "aggregate runtime unavailable"
  );
  await expectVisibleBodyClean(page);
  await expect(page.getByTestId("m7-group-overview-search")).toHaveAttribute(
    "placeholder",
    "搜索租户 / 业务线"
  );

  await expectLayerNav(page, groupSections, tenantSections, groupLabels, tenantLabels);
  await expect(page.locator(".uz-group-health__card")).toHaveCount(6);
  for (const [filter, label, value] of [
    ["total", "租户总数", "4"],
    ["abnormal", "异常租户", "2"],
    ["aiTrip", "AI 熔断", "1"],
    ["modelFault", "模型故障", "0"],
    ["orderFault", "订单 connector 故障", "1"],
    ["redline", "红线事件 / 今日", "7"]
  ] as const) {
    const card = page.getByTestId(`m7-group-health-card-${filter}`);
    await expect(card).toContainText(label);
    await expect(card.locator("strong")).toHaveText(value);
  }
  for (const header of tableHeaders) {
    await expect(
      page.getByTestId("m7-group-overview-table").getByRole("columnheader", {
        name: new RegExp(header)
      })
    ).toBeVisible();
  }
  await expect(page.getByTestId("m7-group-overview-empty")).toHaveCount(0);
  await expect(page.locator("[data-testid^='m7-group-overview-row-']")).toHaveCount(4);
  for (const tenantName of ["玉珠跨境美妆", "丝路数码", "天净家居", "白桦母婴"]) {
    await expect(page.getByTestId("m7-group-overview-table")).toContainText(tenantName);
  }
  for (const sourceLikeText of [
    "美妆 · 中亚",
    "阻断",
    "通过",
    "运行中",
    "降级",
    "故障",
    "正常",
    "红线 · 9分钟前"
  ]) {
    await expect(page.getByTestId("m7-group-overview-table")).toContainText(
      sourceLikeText
    );
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

  await page.getByTestId("m7-group-overview-search").fill("天净");
  await expect(page.getByTestId("m7-group-overview-result-label")).toContainText(
    "显示 1 / 4 家租户"
  );
  await expect(table.getByText("天净家居")).toBeVisible();
  await expect(table.getByText("玉珠跨境美妆")).toHaveCount(0);

  await page.getByTestId("m7-group-health-card-orderFault").click();
  await expect(page.getByTestId("m7-group-overview-result-label")).toContainText(
    "订单 connector 故障"
  );
  await expect(table.getByText("天净家居")).toBeVisible();

  await page.getByTestId("m7-group-overview-clear-filter").click();
  await expect(table.getByText("玉珠跨境美妆")).toBeVisible();
  await expect(table.getByText("白桦母婴")).toBeVisible();

  await page.getByTestId("m7-group-overview-search").fill("不存在的租户");
  await expect(page.getByTestId("m7-group-overview-empty")).toContainText(
    "没有匹配的租户"
  );
  await page.getByTestId("m7-group-overview-clear-filter").click();

  await page.getByTestId("m7-group-sort-human").click();
  await expectTenantOrder(page, ["天净家居", "玉珠跨境美妆", "丝路数码", "白桦母婴"]);
  await page.getByTestId("m7-group-sort-human").click();
  await expectTenantOrder(page, ["白桦母婴", "丝路数码", "玉珠跨境美妆", "天净家居"]);
  await expectVisibleBodyClean(page);
});

test("tenant entry button click enters tenant conversations and tenant-only navigation", async ({
  page
}) => {
  await page.goto("/design");

  await page.getByTestId("m7-group-health-card-total").click();
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

  await page.getByTestId("m7-group-health-card-total").click();
  await page.getByTestId("m7-group-enter-tenant-tenant-b").focus();
  await page.keyboard.press("Enter");
  await expectTenantRoute(page, "tenant-b");

  await page.goto("/design");
  await page.getByTestId("m7-group-health-card-total").click();
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
  await expectVisibleBodyClean(page);
  expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(320);
});

async function expectVisibleBodyClean(page: Page) {
  const text = await page.evaluate(() => document.body.innerText.toLowerCase());
  for (const term of forbiddenVisibleTerms) {
    expect(text, `visible body should not include ${term}`).not.toContain(term);
  }
}

async function expectLayerNav(
  page: Page,
  visibleSectionLabels: readonly string[],
  hiddenSectionLabels: readonly string[],
  visibleLabels: readonly string[],
  hiddenLabels: readonly string[]
) {
  const nav = page.getByTestId("app-shell-nav");
  const sectionText = await nav.locator(".uz-nav-group p").allTextContents();
  expect(sectionText).toEqual([...visibleSectionLabels]);

  const hiddenSectionCounts = await Promise.all(
    hiddenSectionLabels.map((label) =>
      nav.locator(".uz-nav-group p").filter({ hasText: label }).count()
    )
  );
  expect(hiddenSectionCounts).toEqual(hiddenSectionLabels.map(() => 0));

  const visibleButtonStates = await Promise.all(
    visibleLabels.map((label) =>
      nav.getByRole("button", { exact: true, name: label }).isVisible()
    )
  );
  expect(visibleButtonStates).toEqual(visibleLabels.map(() => true));

  const hiddenButtonCounts = await Promise.all(
    hiddenLabels.map((label) =>
      nav.getByRole("button", { exact: true, name: label }).count()
    )
  );
  expect(hiddenButtonCounts).toEqual(hiddenLabels.map(() => 0));
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
