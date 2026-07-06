import { expect, test } from "@playwright/test";
import {
  clickFirstVisibleText,
  collectOwnerNewTenantSample,
  collectOwnerSourceSample,
  collectTenantMetrics,
  expectLocalToast,
  groupSections,
  openTenants,
  ownerHtmlUrl,
  saveShot,
  tenantNames,
  writeJson,
  writeSourceMappingSummary
} from "./m7-ui-tenant-management-source-parity.helpers";

test.beforeEach(async ({ page }) => {
  await page.route("**/conversation-ticket/conversations", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
  await page.route("**/confirmation-queue/items?status=pending", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
});

test("captures owner HTML table truth and React source-parity refresh", async ({
  page
}) => {
  const mapping = writeSourceMappingSummary();
  expect(mapping.decision.reactFollows).toBe("owner-html-visible-table-state");
  expect(mapping.conflict.unpackedCardGridConflictsWithOwnerHtml).toBe(true);

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(ownerHtmlUrl);
  await page.waitForLoadState("domcontentloaded");
  await clickFirstVisibleText(page, "集团");
  await clickFirstVisibleText(page, "租户管理");

  const ownerDefault = await collectOwnerSourceSample(page);
  expect(ownerDefault.contains.tenantManagement).toBe(true);
  expect(ownerDefault.contains.newTenant).toBe(true);
  expect(ownerDefault.contains.blankManagementAction).toBe(true);
  expect(ownerDefault.contains.disableNote).toBe(true);
  expect(ownerDefault.contains.tenantNames).toBe(false);
  expect(ownerDefault.contains.tableColumns).toBe(false);
  expect(ownerDefault.contains.capabilityRows).toBe(false);
  await saveShot(page, "owner-html-tenant-management-table.png", true);
  writeJson("owner-html-tenant-management-table-dom-sample.json", ownerDefault);

  await page.getByRole("button", { name: "新建租户" }).click();
  const ownerNew = await collectOwnerNewTenantSample(page);
  expect(Object.values(ownerNew.contains)).not.toContain(false);
  await saveShot(page, "owner-html-tenant-management-new-tenant-modal.png", true);
  writeJson("owner-html-tenant-management-new-tenant-modal-dom-sample.json", ownerNew);
  await page.getByRole("button", { name: "取消" }).click();
  await page.getByText("管理", { exact: true }).last().click();
  const ownerManage = await collectOwnerSourceSample(page);
  expect(ownerManage.contains.drawerFields).toBe(false);
  await saveShot(page, "owner-html-tenant-management-manage-click-noop.png", true);

  await page.goto("/design");
  await openTenants(page);
  await expect(page.getByTestId("m7-tenant-table-panel")).toBeVisible();
  await expect(page.getByTestId("m7-tenant-new-button")).toBeVisible();
  await expect(page.getByTestId("m7-tenant-source-note")).toContainText(
    "停用租户须填写原因"
  );
  await expect(page.locator(".uz-tenant-card")).toHaveCount(0);
  await expect(page.getByTestId("m7-tenant-drawer")).toHaveCount(0);
  const tenantPage = page.getByTestId("m7-tenant-page");
  for (const name of tenantNames)
    await expect(tenantPage.getByText(name)).toHaveCount(0);
  const desktopMetrics = await collectTenantMetrics(page);
  expect(desktopMetrics.shellLevel).toBe("group");
  expect(desktopMetrics.activePageId).toBe("group.tenants");
  expect(desktopMetrics.hasTenantId).toBe(false);
  expect(desktopMetrics.navWidth).toBe(232);
  expect(desktopMetrics.topbarHeight).toBeGreaterThanOrEqual(52);
  expect(desktopMetrics.topbarHeight).toBeLessThanOrEqual(53);
  expect(desktopMetrics.sidebarCategories).toEqual(groupSections);
  expect(desktopMetrics.tenantButtonCount).toBe(0);
  expect(desktopMetrics.tenantCategoryCount).toBe(0);
  expect(desktopMetrics.runtimeLabelsPresent).toBe(true);
  expect(desktopMetrics.runtimeLabelsVisibleInBody).toBe(false);
  expect(desktopMetrics.sourceLikeDefaultVisible).toBe(true);
  expect(desktopMetrics.visiblePrimaryValuesClean).toBe(true);
  await saveShot(page, "react-tenant-management-desktop-table.png", true);

  await page.getByTestId("m7-tenant-manage-placeholder").click();
  await expectLocalToast(page, ["管理动作需等待租户明细接入"]);
  const manageMetrics = await collectTenantMetrics(page);
  expect(manageMetrics.sourceLikeManageNoopVisible).toBe(true);
  expect(manageMetrics.runtimeLabelsPresent).toBe(true);
  expect(manageMetrics.runtimeLabelsVisibleInBody).toBe(false);

  await page.getByTestId("m7-tenant-new-button").click();
  await expect(page.getByTestId("m7-tenant-new-modal")).toContainText("创建新租户");
  await expect(page.getByTestId("m7-tenant-new-create")).toBeDisabled();
  await page.getByTestId("m7-tenant-new-name").fill("胡杨跨境百货");
  await page.getByTestId("m7-tenant-new-line").fill("百货 · 中亚");
  await page.getByTestId("m7-tenant-new-cap-orderApi").click();
  await page.getByTestId("m7-tenant-new-template").selectOption("家居通用包");
  await expect(page.getByTestId("m7-tenant-new-create")).toBeEnabled();
  const newModalMetrics = await collectTenantMetrics(page);
  expect(newModalMetrics.sourceLikeNewModalVisible).toBe(true);
  await saveShot(page, "react-tenant-management-new-tenant-modal.png", true);
  await page.getByTestId("m7-tenant-new-create").click();
  await expect(page.getByText("5 个租户")).toBeVisible();
  await expectLocalToast(page, [
    "租户创建已加入预览队列",
    "胡杨跨境百货",
    "租户明细接入后可继续配置渠道与模板"
  ]);
  const createMetrics = await collectTenantMetrics(page);
  expect(createMetrics.sourceLikeLocalCreateVisible).toBe(true);
  expect(createMetrics.runtimeLabelsPresent).toBe(true);
  expect(createMetrics.runtimeLabelsVisibleInBody).toBe(false);

  await page.getByRole("button", { name: "Collapse navigation" }).click();
  const collapsedMetrics = await collectTenantMetrics(page);
  expect(collapsedMetrics.navWidth).toBe(68);
  expect(collapsedMetrics.tenantButtonCount).toBe(0);
  expect(collapsedMetrics.tenantCategoryCount).toBe(0);
  expect(collapsedMetrics.runtimeLabelsVisibleInBody).toBe(false);
  await saveShot(page, "react-tenant-management-collapsed-sidebar.png", true);

  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/design");
  await openTenants(page);
  const mobileMetrics = await collectTenantMetrics(page);
  expect(mobileMetrics.bodyScrollWidth).toBeLessThanOrEqual(320);
  expect(mobileMetrics.documentScrollWidth).toBeLessThanOrEqual(320);
  expect(mobileMetrics.panelWidth).toBeLessThanOrEqual(296);
  expect(mobileMetrics.tableScrollWidth).toBeGreaterThanOrEqual(880);
  await page.getByTestId("m7-tenant-new-button").click();
  await expect(page.getByTestId("m7-tenant-new-modal")).toContainText("创建新租户");
  const mobileModalMetrics = await collectTenantMetrics(page);
  expect(mobileModalMetrics.modalWidth).toBeLessThanOrEqual(296);
  expect(mobileModalMetrics.bodyScrollWidth).toBeLessThanOrEqual(320);
  expect(mobileModalMetrics.runtimeLabelsVisibleInBody).toBe(false);
  await saveShot(page, "react-tenant-management-mobile-320.png", true);

  writeJson("metrics.json", {
    collapsed: collapsedMetrics,
    desktop: desktopMetrics,
    localCreate: createMetrics,
    manageNoop: manageMetrics,
    mobile: mobileMetrics,
    mobileModal: mobileModalMetrics,
    newModal: newModalMetrics,
    ownerDefault: ownerDefault.contains,
    ownerManageAfterClick: ownerManage.contains,
    ownerNewModal: ownerNew.contains,
    sourceMapping: mapping
  });
});
