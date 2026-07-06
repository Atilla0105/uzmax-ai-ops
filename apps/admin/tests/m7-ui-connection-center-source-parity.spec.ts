import { expect, test } from "@playwright/test";
import {
  clickFirstVisibleText,
  collectConnectionMetrics,
  collectOwnerSourceSample,
  connectorNames,
  expectRuntimeBoundary,
  groupLabels,
  groupSections,
  openConnection,
  ownerHtmlUrl,
  saveShot,
  writeJson,
  writeSourceMappingSummary
} from "./m7-ui-connection-center-source-parity.helpers";

test.beforeEach(async ({ page }) => {
  await page.route("**/conversation-ticket/conversations", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
  await page.route("**/confirmation-queue/items?status=pending", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
});

test("captures group.connections source parity evidence on latest visible stack", async ({
  page
}) => {
  const sourceMapping = writeSourceMappingSummary();
  expect(Object.values(sourceMapping.anatomy)).not.toContain(false);

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(ownerHtmlUrl);
  await page.waitForLoadState("domcontentloaded");
  await clickFirstVisibleText(page, "集团");
  await clickFirstVisibleText(page, "连接中心");
  const ownerSource = await collectOwnerSourceSample(page);
  expect(ownerSource.bodyTextLength).toBeGreaterThan(100);
  expect(ownerSource.contains.connectionCenter).toBe(true);
  await saveShot(page, "owner-html-connection-center-source-sample.png");
  writeJson("owner-html-connection-center-source-dom-sample.json", ownerSource);

  await page.goto("/design");
  await openConnection(page);
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "group"
  );
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "group.connections"
  );
  await expect(page.getByTestId("page-outlet")).not.toHaveAttribute("data-tenant-id");
  await expect(page.getByRole("heading", { name: "连接中心" })).toBeVisible();
  await expect(page.getByText("集团级连接类型 · 启停/测试")).toBeVisible();
  await expect(page.getByText("集团级连接管理")).toBeVisible();
  await expect(page.getByTestId("m7-connection-runtime-note")).toHaveAttribute(
    "hidden",
    ""
  );
  await expectRuntimeBoundary(page.getByTestId("m7-connection-runtime-note"));
  await expect(page.locator(".uz-connection-card")).toHaveCount(4);
  for (const name of connectorNames)
    await expect(page.locator(".uz-connection-list")).toContainText(name);
  const bot = page.getByTestId("m7-connection-card-SYN-CONN-tgbot");
  await expect(bot.locator(".uz-status-badge").first()).toHaveText("正常");
  await expect(bot).toContainText("Bot webhook 接入 · 自动/草稿双模");
  await expect(bot).toContainText("4 个租户");
  await expect(bot).toContainText("接入定级：标准接入");
  await expect(bot).toContainText("最近错误：无");
  await expect(bot).toContainText("已启用");
  const business = page.getByTestId("m7-connection-card-SYN-CONN-tgbiz");
  await expect(business.locator(".uz-status-badge").first()).toHaveText("部分可行");
  await expect(business).toContainText("ADR-B01 · 部分可行");
  const order = page.getByTestId("m7-connection-card-SYN-CONN-orderapi");
  await expect(order.locator(".uz-status-badge").first()).toHaveText("不可用");
  await expect(order).toContainText("ADR-B02 · 无可用 API");
  await expect(order).toContainText("已停用");
  for (const name of connectorNames)
    await expect(
      page.getByRole("switch", {
        exact: true,
        name: `${name} 启停预览`
      })
    ).toHaveCount(1);
  await expectRuntimeBoundary(page.getByRole("switch", { name: "订单 API 启停预览" }));
  await expect(page.locator("[data-testid^='m7-connection-test-']")).toHaveCount(4);
  await expect(page.locator(".uz-connection-icon").first()).toHaveJSProperty(
    "offsetWidth",
    40
  );

  const desktopMetrics = await collectConnectionMetrics(page);
  expect(desktopMetrics.shellLevel).toBe("group");
  expect(desktopMetrics.activePageId).toBe("group.connections");
  expect(desktopMetrics.navWidth).toBe(232);
  expect(desktopMetrics.topbarHeight).toBeGreaterThanOrEqual(52);
  expect(desktopMetrics.topbarHeight).toBeLessThanOrEqual(53);
  expect(desktopMetrics.sidebarCategories).toEqual(groupSections);
  expect(desktopMetrics.groupButtonCount).toBe(groupLabels.length);
  expect(desktopMetrics.tenantButtonCount).toBe(0);
  expect(desktopMetrics.tenantCategoryCount).toBe(0);
  expect(desktopMetrics.runtimeLabelsPresent).toBe(true);
  expect(desktopMetrics.runtimeLabelsVisibleInBody).toBe(false);
  expect(desktopMetrics.visibleBodyClean).toBe(true);
  expect(desktopMetrics.sourceLikeDefaultVisible).toBe(true);
  expect(desktopMetrics.bodyScrollWidth).toBeLessThanOrEqual(1440);
  expect(desktopMetrics.documentScrollWidth).toBeLessThanOrEqual(1440);
  await saveShot(page, "react-connection-center-desktop.png", true);

  await page.getByTestId("m7-connection-toggle-SYN-CONN-orderapi").click();
  await expect(order).toContainText("已启用");
  await expect(page.getByTestId("m7-connection-toast")).toContainText(
    "订单 API 已在本页启用"
  );
  await expectRuntimeBoundary(page.getByTestId("m7-connection-toast"));
  await page.getByTestId("m7-connection-test-SYN-CONN-tgbiz").click();
  await expect(page.getByTestId("m7-connection-test-SYN-CONN-tgbiz")).toContainText(
    "测试中"
  );
  await expect(page.getByTestId("m7-connection-toast")).toContainText("复测已完成");
  await expectRuntimeBoundary(page.getByTestId("m7-connection-toast"));
  const actionMetrics = await collectConnectionMetrics(page);
  expect(actionMetrics.runtimeLabelsPresent).toBe(true);
  expect(actionMetrics.runtimeLabelsVisibleInBody).toBe(false);
  expect(actionMetrics.visibleBodyClean).toBe(true);
  expect(actionMetrics.sourceLikeLocalActionVisible).toBe(true);
  await saveShot(page, "react-connection-center-local-actions.png", true);

  await page.getByRole("button", { name: "Collapse navigation" }).click();
  await expect(page.getByTestId("admin-shell")).toHaveClass(/is-nav-collapsed/);
  const collapsedMetrics = await collectConnectionMetrics(page);
  expect(collapsedMetrics.navWidth).toBe(68);
  expect(collapsedMetrics.sidebarCategories).toEqual(groupSections);
  expect(collapsedMetrics.tenantButtonCount).toBe(0);
  expect(collapsedMetrics.tenantCategoryCount).toBe(0);
  expect(collapsedMetrics.runtimeLabelsPresent).toBe(true);
  expect(collapsedMetrics.runtimeLabelsVisibleInBody).toBe(false);
  expect(collapsedMetrics.visibleBodyClean).toBe(true);
  expect(collapsedMetrics.bodyScrollWidth).toBeLessThanOrEqual(1440);
  expect(collapsedMetrics.documentScrollWidth).toBeLessThanOrEqual(1440);
  await saveShot(page, "react-connection-center-collapsed.png", true);

  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/design");
  await openConnection(page);
  const mobileMetrics = await collectConnectionMetrics(page);
  expect(mobileMetrics.shellLevel).toBe("group");
  expect(mobileMetrics.activePageId).toBe("group.connections");
  expect(mobileMetrics.bodyScrollWidth).toBeLessThanOrEqual(320);
  expect(mobileMetrics.documentScrollWidth).toBeLessThanOrEqual(320);
  expect(mobileMetrics.mobileReadable).toBe(true);
  expect(mobileMetrics.sidebarCategories).toEqual(groupSections);
  expect(mobileMetrics.tenantButtonCount).toBe(0);
  expect(mobileMetrics.tenantCategoryCount).toBe(0);
  expect(mobileMetrics.runtimeLabelsPresent).toBe(true);
  expect(mobileMetrics.runtimeLabelsVisibleInBody).toBe(false);
  expect(mobileMetrics.visibleBodyClean).toBe(true);
  await saveShot(page, "react-connection-center-mobile-320.png", true);

  writeJson("metrics.json", {
    actions: actionMetrics,
    collapsed: collapsedMetrics,
    desktop: desktopMetrics,
    mobile: mobileMetrics
  });
});
