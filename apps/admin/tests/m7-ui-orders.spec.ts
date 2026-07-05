import { mkdirSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

const ordersArtifactsDir = "/tmp/uzmax-m7-ui-31-orders-visible-ui";

mkdirSync(ordersArtifactsDir, { recursive: true });

const ordersNavContract = {
  groupButtons: [
    "集团总览",
    "模型/成本/风险",
    "模板中心",
    "连接中心",
    "发布与验收",
    "租户管理",
    "集团日志"
  ],
  groupSections: ["总览", "平台", "治理"],
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
const runtimeLabels = [
  "mock/degraded",
  "mock",
  "read-only",
  "order runtime unavailable",
  "not production order data",
  "no real read",
  "no write",
  "DB/API"
];
const forbiddenVisibleTerms = [
  "mock/degraded",
  "mock",
  "read-only",
  "runtime unavailable",
  "not production",
  "synthetic",
  "local-only",
  "browser-local only",
  "no real read",
  "No real",
  "DB",
  "API",
  "no write",
  "order runtime unavailable"
];

test.beforeEach(({ page }) => stubConversationTicket(page));

async function stubConversationTicket(page: Page) {
  await page.route("**/conversation-ticket/conversations", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
}

test("renders tenant.orders with tenant-only nav hidden boundary and list geometry", async ({
  page
}) => {
  await openOrders(page);

  await expect(page.getByTestId("page-outlet")).toHaveAttribute(
    "data-page-id",
    "tenant.orders"
  );
  await expect(page.getByTestId("m7-orders-page")).toHaveAttribute(
    "data-runtime-state",
    "degraded"
  );
  const boundary =
    (await page.getByTestId("m7-orders-page").getAttribute("data-runtime-boundary")) ??
    "";
  for (const label of runtimeLabels) expect(boundary).toContain(label);
  await expect(page.getByTestId("m7-orders-runtime-note")).toBeHidden();
  await expect(page.getByTestId("m7-orders-runtime-note")).toContainText(
    "order runtime unavailable"
  );
  await expect(page.getByTestId("m7-orders-snapshot-bar")).toContainText(
    "订单数据主路径"
  );
  await expect(page.getByTestId("m7-orders-snapshot-bar")).toContainText("导入快照");
  await expectNoForbiddenVisibleOrdersText(page);
  await expect(page.locator(".uz-topbar")).toBeVisible();
  const topbarHeight = await page.locator(".uz-topbar").evaluate((node) => {
    return (node as HTMLElement).offsetHeight;
  });
  expect(topbarHeight).toBeGreaterThanOrEqual(52);
  expect(topbarHeight).toBeLessThanOrEqual(53);
  await expect(page.getByTestId("environment-marker")).toContainText("PRODUCTION");
  await expect(page.getByTestId("route-breadcrumb")).toContainText("丝路数码");
  await expect(page.getByTestId("m7-orders-runtime-icon").locator("svg")).toBeVisible();
  for (const label of [
    "订单号",
    "客户",
    "金额",
    "状态",
    "批次",
    "物流节点",
    "来源",
    "更新时间"
  ])
    await expect(page.getByTestId("m7-orders-table")).toContainText(label);
  await expect(page.getByTestId("m7-orders-list-count")).toContainText("4 个订单");
  await expect(page.getByTestId("m7-orders-table")).toContainText("268.00");
  await expect(page.getByTestId("m7-orders-table")).toContainText("客户 A");
  const searchWidth = await page
    .getByTestId("m7-orders-search")
    .evaluate((node) =>
      Math.round((node as HTMLElement).getBoundingClientRect().width)
    );
  expect(searchWidth).toBeGreaterThanOrEqual(300);
  expect(searchWidth).toBeLessThanOrEqual(340);
  await expect(page.getByTestId("m7-orders-search-icon").locator("svg")).toBeVisible();
  await expect(page.getByTestId("m7-orders-upload-icon").locator("svg")).toBeVisible();
  await expectTenantOnlyNav(page);
  await page.screenshot({
    fullPage: true,
    path: `${ordersArtifactsDir}/react-orders-list-desktop.png`
  });
});

test("opens detail by click and keyboard with stale warning timeline and links", async ({
  page
}) => {
  await openOrders(page);

  await page.getByTestId("m7-order-row-SYN-ORD-001").click();
  await expect(page.getByTestId("m7-orders-detail")).toContainText("SYN-ORD-001");
  await expect(page.getByTestId("m7-orders-package-icon").locator("svg")).toBeVisible();
  await expect(page.getByTestId("m7-orders-timeline")).toContainText("物流节点");
  await expect(page.getByTestId("m7-orders-linked-affordances")).toContainText(
    "关联客户"
  );
  await expect(page.getByTestId("m7-orders-linked-affordances")).toContainText(
    "关联客户与会话"
  );
  await expect(page.getByTestId("m7-orders-linked-affordances")).toContainText(
    "关联工单"
  );
  await expect(page.getByTestId("m7-orders-linked-affordances")).toContainText("查看");

  await page.getByTestId("m7-orders-back").click();
  const staleRow = page.getByRole("button", { name: "打开订单 SYN-ORD-004" });
  await staleRow.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("m7-orders-detail")).toContainText("SYN-ORD-004");
  await expect(page.getByTestId("m7-orders-stale-warning")).toContainText("过期提示");
  await expect(page.getByTestId("m7-orders-stale-warning")).toContainText("重新导入");
  expect(
    (await page
      .getByTestId("m7-orders-stale-warning")
      .getAttribute("data-runtime-boundary")) ?? ""
  ).toContain("not production order data");
  await expect(page.getByTestId("m7-orders-stale-icon").locator("svg")).toBeVisible();
  await expectNoForbiddenVisibleOrdersText(page);
  await page.screenshot({
    fullPage: true,
    path: `${ordersArtifactsDir}/react-orders-detail-desktop.png`
  });
});

test("supports local import modal upload progress result history and rollback", async ({
  page
}) => {
  await openOrders(page);

  await page.getByTestId("m7-orders-import").click();
  await expect(page.getByTestId("m7-orders-import-modal")).toContainText(
    "导入订单快照"
  );
  await expect(page.getByTestId("m7-orders-import-modal")).toContainText(
    "选择订单快照"
  );
  expect(
    (await page.locator(".uz-orders-dialog").getAttribute("data-runtime-boundary")) ??
      ""
  ).toContain("no write");
  expect(
    (await page.getByTestId("m7-orders-file-drop").getAttribute("title")) ?? ""
  ).toContain("no real read");
  await expect(
    page.getByTestId("m7-orders-modal-runtime-icon").locator("svg")
  ).toBeVisible();
  await expect(page.getByTestId("m7-orders-close-icon").locator("svg")).toBeVisible();
  await expect(page.getByTestId("m7-orders-import-history")).toContainText(
    "SYN-IMP-001"
  );
  await expect(page.getByTestId("m7-orders-start-import")).toBeDisabled();
  await page.getByTestId("m7-orders-file-drop").click();
  await expect(page.getByTestId("m7-orders-drop-icon").locator("svg")).toBeVisible();
  await expect(page.getByTestId("m7-orders-file-drop")).toContainText(
    "orders-snapshot.csv"
  );
  await expect(page.getByTestId("m7-orders-start-import")).toBeEnabled();
  await page.getByTestId("m7-orders-start-import").click();
  await expect(page.getByTestId("m7-orders-import-progress")).toContainText("100%");
  await page.getByTestId("m7-orders-show-result").click();
  await expect(page.getByTestId("m7-orders-import-result")).toContainText(
    "导入完成，部分行失败"
  );
  await page.getByTestId("m7-orders-rollback-import").click();
  await expect(page.getByTestId("m7-orders-import-result")).toContainText(
    "本次导入已回滚"
  );
  await expectNoForbiddenVisibleOrdersText(page);
});

test("covers deterministic loading empty error and permission states", async ({
  page
}) => {
  for (const state of ["loading", "empty", "error", "permission"]) {
    await openOrders(page, `?m7OrderState=${state}`);
    if (state === "empty")
      await expect(page.getByTestId("m7-orders-empty")).toContainText("当前没有订单");
    else await expect(page.getByTestId(`m7-orders-state-${state}`)).toBeVisible();
    await expectNoForbiddenVisibleOrdersText(page);
  }
});

test("resets local order detail and import state when switching tenants", async ({
  page
}) => {
  await openOrders(page);

  await page.getByTestId("m7-order-row-SYN-ORD-004").click();
  await page.getByTestId("m7-orders-import").click();
  await expect(page.getByTestId("m7-orders-import-modal")).toBeVisible();

  await page.getByTestId("tenant-switcher").selectOption("tenant-c");
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.orders"
  );
  await expect(page.getByTestId("page-outlet")).toHaveAttribute(
    "data-tenant-id",
    "tenant-c"
  );
  await expect(page.getByTestId("m7-orders-page")).toHaveAttribute(
    "data-tenant-id",
    "tenant-c"
  );
  await expect(page.getByTestId("m7-orders-table")).toBeVisible();
  await expect(page.getByTestId("m7-orders-detail")).toHaveCount(0);
  await expect(page.getByTestId("m7-orders-import-modal")).toHaveCount(0);
});

test("supports sidebar collapse and 320px readable fallback", async ({ page }) => {
  await openOrders(page);
  await page.getByRole("button", { name: "Collapse navigation" }).click();
  await expect(page.getByTestId("app-shell-nav")).toHaveJSProperty("offsetWidth", 68);
  await expectTenantOnlyNav(page);

  await page.setViewportSize({ width: 320, height: 900 });
  await openOrders(page);
  await expect(page.getByTestId("m7-orders-page")).toBeVisible();
  await expect(page.getByTestId("m7-orders-table")).toBeVisible();
  await page.getByTestId("m7-order-row-SYN-ORD-001").click();
  await expect(page.getByTestId("m7-orders-detail")).toBeVisible();
  expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(320);
  await expectTenantOnlyNav(page);
  await page.screenshot({
    fullPage: true,
    path: `${ordersArtifactsDir}/react-orders-mobile-320.png`
  });
});

async function openOrders(page: Page, query = "") {
  await page.goto(`/design${query}`);
  await page.getByTestId("tenant-switcher").selectOption("tenant-b");
  await page
    .getByTestId("app-shell-nav")
    .getByRole("button", { name: "订单", exact: true })
    .click();
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "tenant"
  );
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.orders"
  );
}

async function expectTenantOnlyNav(page: Page) {
  const nav = page.getByTestId("app-shell-nav");
  const sectionLabels = nav.locator(".uz-nav-group p");
  await expect
    .poll(() => sectionLabels.allTextContents())
    .toEqual(ordersNavContract.tenantSections);
  for (const label of ordersNavContract.tenantButtons)
    await expect(nav.getByRole("button", { exact: true, name: label })).toBeVisible();
  for (const label of ordersNavContract.groupButtons)
    await expect(nav.getByRole("button", { exact: true, name: label })).toHaveCount(0);
  for (const label of ordersNavContract.groupSections)
    await expect(sectionLabels.filter({ hasText: label })).toHaveCount(0);
}

async function expectNoForbiddenVisibleOrdersText(page: Page) {
  const visibleText = await page
    .getByTestId("m7-orders-page")
    .evaluate((node) => (node as HTMLElement).innerText);
  for (const label of forbiddenVisibleTerms) expect(visibleText).not.toContain(label);
}
