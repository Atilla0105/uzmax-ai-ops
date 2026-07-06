import { expect, test } from "@playwright/test";
import {
  captureOwnerConfig,
  collectConfigMetrics,
  configSections,
  expectConfigInternalNav,
  expectLayerNav,
  expectLocalizedConfirm,
  expectLocalToast,
  expectRuntimeBoundary,
  openConfig,
  runtimeLabels,
  saveShot,
  writeJson,
  writeSourceMappingSummary
} from "./m7-ui-config-source-parity.helpers";

test.beforeEach(async ({ page }) => {
  await page.route("**/conversation-ticket/conversations", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
  await page.route("**/confirmation-queue/items?status=pending", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
});

test("captures owner source and React tenant config source parity refresh", async ({
  page
}) => {
  const mapping = writeSourceMappingSummary();
  expect(mapping.unpacked.navLabels).toEqual(configSections);
  expect(mapping.unpacked.pageHasIconNav).toBe(true);
  expect(mapping.unpacked.pageHasSourceGeometry).toBe(true);

  const ownerDefault = await captureOwnerConfig(page);
  expect(ownerDefault.contains.title).toBe(true);
  expect(ownerDefault.contains.sectionLabels).toBe(true);

  await page.setViewportSize({ width: 1440, height: 900 });
  await openConfig(page);
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "tenant"
  );
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.config"
  );
  await expect(page.getByTestId("m7-config-page")).toHaveAttribute(
    "data-selected-tenant-id",
    "tenant-b"
  );
  await expect(page.getByTestId("m7-config-page")).not.toContainText(
    "tenant-b · tenant layer"
  );
  await expect(page.getByTestId("m7-config-version-head")).toContainText("业务配置");
  await expect(page.getByTestId("m7-config-version-meta")).toContainText("当前版本 v3");
  await expect(page.getByTestId("m7-config-runtime-note")).toHaveAttribute(
    "hidden",
    ""
  );
  for (const label of runtimeLabels) {
    await expect(page.getByTestId("m7-config-runtime-note")).toHaveAttribute(
      "data-runtime-boundary",
      new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    );
  }
  await expectConfigInternalNav(page);
  await expectLayerNav(page);
  const desktopMetrics = await collectConfigMetrics(page);
  expect(desktopMetrics.shellLevel).toBe("tenant");
  expect(desktopMetrics.activePageId).toBe("tenant.config");
  expect(desktopMetrics.navWidth).toBe(232);
  expect(desktopMetrics.topbarHeight).toBeGreaterThanOrEqual(52);
  expect(desktopMetrics.topbarHeight).toBeLessThanOrEqual(53);
  expect(desktopMetrics.internalNavWidth).toBe(236);
  expect(desktopMetrics.internalNavCount).toBe(8);
  expect(desktopMetrics.internalNavIconCount).toBe(8);
  expect(desktopMetrics.configMainPadding).toEqual({
    bottom: 20,
    left: 24,
    right: 24,
    top: 20
  });
  expect(desktopMetrics.bizGridMaxWidth).toBe(640);
  expect(desktopMetrics.runtimeLabelsPresent).toBe(true);
  expect(desktopMetrics.runtimeNoteVisible).toBe(false);
  await saveShot(page, "react-config-desktop-biz.png", true);

  await page.locator(".uz-config-field select").first().selectOption("俄语");
  await expect(page.getByTestId("m7-config-version-head")).toContainText(
    "未保存的修改"
  );
  const dirtyMetrics = await collectConfigMetrics(page);
  expect(dirtyMetrics.dirtyBadgeVisible).toBe(true);
  await saveShot(page, "react-config-dirty-state.png", true);
  await page.getByTestId("m7-config-save").click();
  await expectLocalToast(page, "配置变更已暂存，并生成新的版本预览");

  await page.getByRole("button", { name: /版本历史/ }).click();
  await expect(page.getByTestId("m7-config-history")).toContainText(
    "版本历史 · 回滚需二次确认并写审计"
  );
  await expect(page.getByTestId("m7-config-history")).not.toContainText(
    "browser-local only"
  );
  const historyMetrics = await collectConfigMetrics(page);
  expect(historyMetrics.historyVisible).toBe(true);
  await saveShot(page, "react-config-version-history.png", true);
  await page.getByRole("button", { name: "回滚到此版本" }).first().click();
  const rollbackModal = page.getByTestId("m7-confirm-modal");
  await expect(rollbackModal).toContainText("回滚预览");
  await expectRuntimeBoundary(rollbackModal.locator("[data-runtime-boundary]"));
  await expectLocalizedConfirm(rollbackModal, "回滚原因");
  await expect(rollbackModal.getByRole("button", { name: "回滚" })).toBeDisabled();
  await rollbackModal.getByRole("textbox").fill("回滚预览原因");
  await rollbackModal.getByRole("button", { name: "回滚" }).click();
  await expectLocalToast(page, /回滚到 v\d+ 的预览已排队/);

  const internal = page.getByTestId("m7-config-internal-nav");
  await internal.getByRole("button", { exact: true, name: "渠道配置" }).click();
  await page.getByRole("button", { name: "测试连接" }).first().click();
  await expectLocalToast(page, "渠道连通性检查已更新");
  await page.locator(".uz-config-switch").first().click();
  await expect(page.getByTestId("m7-config-version-head")).toContainText(
    "未保存的修改"
  );

  await internal.getByRole("button", { exact: true, name: "订单 connector" }).click();
  await expect(page.getByTestId("m7-config-page")).toContainText("订单 API（主路径）");
  await page.getByRole("button", { name: "测试连接" }).click();
  await expectLocalToast(page, "订单连接健康状态已刷新");
  await page.getByRole("button", { name: "切换为导入快照主路径" }).click();
  const switchModal = page.getByTestId("m7-confirm-modal");
  await expect(switchModal).toContainText("订单主路径将切换为");
  await expectRuntimeBoundary(switchModal.locator("[data-runtime-boundary]"));
  await expectLocalizedConfirm(switchModal, "切换原因");
  await saveShot(page, "react-config-connector-confirm-modal.png", true);
  await switchModal.getByRole("textbox").fill("切换预览原因");
  await switchModal.getByRole("button", { name: "确认本地切换" }).click();
  await expectLocalToast(page, "订单数据主路径预览已切换");
  const connectorMetrics = await collectConfigMetrics(page);
  expect(connectorMetrics.connectorSectionVisible).toBe(true);
  await saveShot(page, "react-config-connector-section.png", true);

  await page.getByRole("button", { name: "Collapse navigation" }).click();
  const collapsedMetrics = await collectConfigMetrics(page);
  expect(collapsedMetrics.navWidth).toBe(68);
  await saveShot(page, "react-config-collapsed-nav.png", true);

  await page.setViewportSize({ width: 320, height: 900 });
  await openConfig(page);
  await expect(page.getByTestId("m7-config-internal-nav")).toBeVisible();
  const mobileMetrics = await collectConfigMetrics(page);
  expect(mobileMetrics.bodyScrollWidth).toBeLessThanOrEqual(320);
  expect(mobileMetrics.documentScrollWidth).toBeLessThanOrEqual(320);
  await saveShot(page, "react-config-mobile-320.png", true);

  writeJson("metrics.json", {
    collapsed: collapsedMetrics,
    connector: connectorMetrics,
    desktop: desktopMetrics,
    dirty: dirtyMetrics,
    history: historyMetrics,
    mobile: mobileMetrics,
    ownerDefault,
    sourceMapping: mapping
  });
});
