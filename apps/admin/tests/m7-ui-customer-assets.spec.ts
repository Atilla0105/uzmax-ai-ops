import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

const customerShellExpectations = {
  hiddenGroupButtons: [
    "集团总览",
    "模型/成本/风险",
    "模板中心",
    "连接中心",
    "发布与验收",
    "租户管理",
    "集团日志"
  ],
  hiddenGroupSections: ["总览", "平台", "治理"],
  tenantButtons: [
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
  ],
  tenantSections: ["运营", "数据", "智能", "管理", "洞察"]
};
const runtimeBoundaryTerms =
  "mock/degraded|mock|read-only|customer assets runtime unavailable|no production customer data|no runtime write|no DB/API closure".split(
    "|"
  );
const forbiddenVisibleTerms =
  "mock|degraded|read-only|runtime unavailable|not production|synthetic|local-only|browser-local only|no production|MOCK-|disabled|fixture".split(
    "|"
  );

test.beforeEach(({ page }) => stubConversationTicketList(page));

async function stubConversationTicketList(page: Page) {
  await page.route("**/conversation-ticket/conversations", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
}

test("renders tenant.customers with tenant-only navigation and hidden runtime boundary", async ({
  page
}) => {
  await openCustomers(page);

  await expect(page.getByTestId("page-outlet")).toHaveAttribute(
    "data-page-id",
    "tenant.customers"
  );
  await expect(page.getByTestId("page-outlet")).toHaveAttribute(
    "data-tenant-id",
    "tenant-b"
  );
  await expect(page.getByTestId("m7-customer-page")).toBeVisible();
  await expect(page.getByTestId("m7-customer-page")).toHaveAttribute(
    "data-runtime-state",
    "degraded"
  );
  await expect(page.getByTestId("m7-customer-runtime-note")).toBeHidden();
  await expectRuntimeBoundary(page);
  await expect(page.getByTestId("m7-customer-page")).toContainText("客户资产");
  await expect(page.getByTestId("m7-customer-snapshot-bar")).toContainText(
    "客户资产快照"
  );
  for (const id of ["list", "search", "ctag", "stag", "field"])
    await expect(page.getByTestId(`m7-customer-tab-${id}`)).toBeVisible();
  await expect(page.getByTestId("m7-customer-tab-list")).toHaveAttribute(
    "aria-pressed",
    "true"
  );
  await expect(page.getByTestId("m7-customer-filter-bar")).toContainText("有未决问题");
  await expect(page.getByTestId("m7-customer-table")).toContainText("客户");
  await expect(page.getByTestId("m7-customer-table")).toContainText("语言 / 文字");
  await expect(page.getByTestId("m7-customer-table")).toContainText("最近会话");
  await expect(page.getByTestId("m7-customer-list-count")).toContainText("5 位客户");
  await expectVisibleCustomerBodyClean(page);
  await expectTenantOnlyNav(page);

  const searchWidth = await page.getByTestId("m7-customer-search").evaluate((node) => {
    return Math.round((node as HTMLElement).getBoundingClientRect().width);
  });
  expect(searchWidth).toBeGreaterThanOrEqual(299);
  expect(searchWidth).toBeLessThanOrEqual(301);
});

test("supports filters search row open detail back and local guarded actions", async ({
  page
}) => {
  await openCustomers(page);

  await page.getByTestId("m7-customer-search").fill("cu-mock-b");
  await expect(page.getByTestId("m7-customer-list-count")).toContainText("1 位客户");
  await expect(page.getByTestId("m7-customer-row-cu-mock-b")).toBeVisible();
  await expect(page.getByTestId("m7-customer-row-cu-mock-a")).toHaveCount(0);

  await page.getByTestId("m7-customer-search").fill("");
  await page.getByTestId("m7-customer-select-lang").selectOption("俄语");
  await expect(page.getByTestId("m7-customer-row-cu-mock-b")).toBeVisible();
  await expect(page.getByTestId("m7-customer-row-cu-mock-d")).toBeVisible();
  await expect(page.getByTestId("m7-customer-row-cu-mock-a")).toHaveCount(0);

  await page.getByTestId("m7-customer-select-lang").selectOption("all");
  await page.getByTestId("m7-customer-flag-blocked").click();
  await expect(page.getByTestId("m7-customer-list-count")).toContainText("1 位客户");
  const blockedRow = page.getByRole("button", {
    name: "打开客户资产 客户 D"
  });
  await expect(blockedRow).toHaveAttribute("data-testid", "m7-customer-row-cu-mock-d");
  await blockedRow.focus();
  await page.keyboard.press("Space");
  await expect(page.getByTestId("m7-customer-detail")).toContainText("客户 D");
  await expect(page.getByTestId("m7-customer-detail")).toContainText("档案");
  await expect(page.getByTestId("m7-customer-detail")).toContainText("历史会话");
  await expect(page.getByTestId("m7-customer-detail")).toContainText("订单快照");
  await expect(page.getByTestId("m7-customer-detail")).toContainText("双轨引导记录");
  await expect(page.getByTestId("m7-customer-side-column")).toContainText("客户标签");
  await expect(page.getByTestId("m7-customer-side-column")).toContainText("自定义字段");

  await page.getByTestId("m7-customer-restore").click();
  await expect(page.getByTestId("m7-customer-restore")).toHaveCount(0);
  await expect(page.getByTestId("m7-customer-identity")).not.toContainText("拉黑");
  await expect(page.getByTestId("m7-customer-detail")).toContainText("已解除接待限制");

  await page.getByTestId("m7-customer-note-input").fill("tenant-b local customer note");
  await page.getByTestId("m7-customer-add-note").click();
  await expect(page.getByTestId("m7-customer-detail")).toContainText(
    "tenant-b local customer note"
  );

  await page.getByTestId("m7-customer-add-tag").click();
  await page
    .getByTestId("m7-customer-tag-picker")
    .getByRole("button", {
      name: "VIP"
    })
    .click();
  await expect(page.getByTestId("m7-customer-detail-tags")).toContainText("VIP");
  await page.getByRole("button", { name: "移除 VIP" }).click();
  await expect(page.getByTestId("m7-customer-detail-tags")).not.toContainText("VIP");

  await page
    .getByTestId("m7-customer-field-cf-mock-source")
    .fill("tenant-b local source");
  await expect(page.getByTestId("m7-customer-field-cf-mock-source")).toHaveValue(
    "tenant-b local source"
  );

  await page.getByTestId("m7-customer-back").click();
  await expect(page.getByTestId("m7-customer-table")).toBeVisible();
  await expectRuntimeBoundary(page);
});

test("shows non-list tabs as business configuration surfaces", async ({ page }) => {
  await openCustomers(page);

  await page.getByTestId("m7-customer-tab-search").click();
  await expect(page.getByTestId("m7-customer-search-tab")).toContainText("CV-A1");
  await expect(page.getByTestId("m7-customer-search-tab")).toContainText("跳回会话");
  await expectVisibleCustomerBodyClean(page);

  await page.getByTestId("m7-customer-tab-ctag").click();
  await expect(page.getByTestId("m7-customer-tags-tab")).toContainText(
    "标签配置用于分群"
  );
  await expect(page.getByTestId("m7-customer-tags-tab")).toContainText("VIP");
  await expectVisibleCustomerBodyClean(page);

  await page.getByTestId("m7-customer-tab-stag").click();
  await expect(page.getByTestId("m7-customer-tags-tab")).toContainText("退款");
  await expectVisibleCustomerBodyClean(page);

  await page.getByTestId("m7-customer-tab-field").click();
  await expect(page.getByTestId("m7-customer-fields-tab")).toContainText(
    "本页展示租户字段"
  );
  await expect(page.getByTestId("m7-customer-fields-tab")).toContainText("客户来源");
  await expectVisibleCustomerBodyClean(page);
  await expectRuntimeBoundary(page);
});

test("resets local customer edits when switching tenants in place", async ({
  page
}) => {
  await openCustomers(page);

  await page.getByTestId("m7-customer-row-cu-mock-d").click();
  await page
    .getByTestId("m7-customer-note-input")
    .fill("tenant-b customer note must not leak");
  await page.getByTestId("m7-customer-add-note").click();
  await page
    .getByTestId("m7-customer-field-cf-mock-source")
    .fill("tenant-b source must not leak");
  await page.getByTestId("m7-customer-restore").click();

  await page.getByTestId("tenant-switcher").selectOption("tenant-c");
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.customers"
  );
  await expect(page.getByTestId("page-outlet")).toHaveAttribute(
    "data-tenant-id",
    "tenant-c"
  );
  await expect(page.getByTestId("m7-customer-page")).toHaveAttribute(
    "data-tenant-id",
    "tenant-c"
  );
  await expect(page.getByTestId("m7-customer-table")).toBeVisible();
  await page.getByTestId("m7-customer-row-cu-mock-d").click();
  await expect(page.getByTestId("m7-customer-detail")).not.toContainText(
    "tenant-b customer note must not leak"
  );
  await expect(page.getByTestId("m7-customer-field-cf-mock-source")).not.toHaveValue(
    "tenant-b source must not leak"
  );
  await expect(page.getByTestId("m7-customer-restore")).toBeVisible();
});

test("supports sidebar collapse and 320px readable fallback without mixed group nav", async ({
  page
}) => {
  await openCustomers(page);
  await page.getByRole("button", { name: "Collapse navigation" }).click();
  await expect(page.getByTestId("app-shell-nav")).toHaveJSProperty("offsetWidth", 68);
  await expectTenantOnlyNav(page);

  await page.setViewportSize({ width: 320, height: 900 });
  await openCustomers(page);
  await expect(page.getByTestId("m7-customer-page")).toBeVisible();
  await expect(page.getByTestId("m7-customer-table")).toBeVisible();
  await page.getByTestId("m7-customer-row-cu-mock-a").click();
  await expect(page.getByTestId("m7-customer-detail")).toBeVisible();
  expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(320);
  await expectTenantOnlyNav(page);
});

async function openCustomers(page: Page) {
  await page.goto("/design");
  await page.getByTestId("tenant-switcher").selectOption("tenant-b");
  await page
    .getByTestId("app-shell-nav")
    .getByRole("button", { name: "客户资产", exact: true })
    .click();
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "tenant"
  );
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.customers"
  );
}

async function expectTenantOnlyNav(page: Page) {
  const nav = page.getByTestId("app-shell-nav");
  const sectionLabels = nav.locator(".uz-nav-group p");
  await expect
    .poll(() => sectionLabels.allTextContents())
    .toEqual(customerShellExpectations.tenantSections);
  await Promise.all(
    customerShellExpectations.tenantButtons.map((name) =>
      expect(nav.getByRole("button", { exact: true, name })).toBeVisible()
    )
  );
  await Promise.all([
    ...customerShellExpectations.hiddenGroupButtons.map((name) =>
      expect(nav.getByRole("button", { exact: true, name })).toHaveCount(0)
    ),
    ...customerShellExpectations.hiddenGroupSections.map((section) =>
      expect(sectionLabels.filter({ hasText: section })).toHaveCount(0)
    )
  ]);
}

async function expectRuntimeBoundary(page: Page) {
  const boundary =
    (await page
      .getByTestId("m7-customer-page")
      .getAttribute("data-runtime-boundary")) ?? "";
  for (const label of runtimeBoundaryTerms) expect(boundary).toContain(label);
  await expect(page.getByTestId("m7-customer-runtime-note")).toContainText(
    "customer assets runtime unavailable"
  );
}

async function expectVisibleCustomerBodyClean(page: Page) {
  const visibleText = await page
    .getByTestId("m7-customer-page")
    .evaluate((node) => (node as HTMLElement).innerText);
  for (const label of forbiddenVisibleTerms) expect(visibleText).not.toContain(label);
}
