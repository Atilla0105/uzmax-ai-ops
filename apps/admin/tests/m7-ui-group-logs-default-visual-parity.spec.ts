import { writeFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

import {
  collectGroupLogBoundaryState,
  ensureGroupLogArtifactDir,
  expectGroupLogLayerNav,
  expectGroupLogRuntimeBoundary,
  expectGroupLogVisibleBodyClean,
  groupLogArtifactDir,
  openGroupLogs,
  stubGroupLogNetwork
} from "./m7-ui-group-logs.helpers";

ensureGroupLogArtifactDir();

test.beforeEach(async ({ page }) => {
  await stubGroupLogNetwork(page);
});

test("keeps group.logs default visible body operational while retaining hidden runtime boundaries", async ({
  page
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openGroupLogs(page);

  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "group"
  );
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "group.logs"
  );
  await expect(page.getByTestId("page-outlet")).not.toHaveAttribute("data-tenant-id");
  await expect(page.getByTestId("m7-group-logs-page")).toHaveAttribute(
    "data-runtime-boundary",
    /no production audit export/
  );
  await expectGroupLogRuntimeBoundary(page.getByTestId("m7-group-logs-runtime-note"));
  await expect(page.getByRole("heading", { name: "集团日志" })).toBeVisible();
  await expect(page.getByTestId("m7-group-logs-subtitle")).toHaveText(
    "操作日志 · 跨租户 · 7 条"
  );
  await expect(page.getByTestId("m7-group-logs-runtime-note")).toContainText(
    "集团级审计运营"
  );
  await expect(page.getByTestId("m7-group-logs-runtime-note")).toContainText(
    "当前展示集团操作日志视图，筛选、导出和详情用于本页核对。"
  );
  await expect(page.locator(".uz-glog-row")).toHaveCount(7);
  await expectGroupLogLayerNav(page);
  await expectGroupLogVisibleBodyClean(page);

  const desktop = await collectMetrics(page);
  expect(desktop.activePageId).toBe("group.logs");
  expect(desktop.shellLevel).toBe("group");
  expect(desktop.runtimeLabelsPresent).toBe(true);
  expect(desktop.runtimeLabelsVisibleInBody).toBe(false);
  expect(desktop.visibleBodyClean).toBe(true);
  expect(desktop.tableRowCount).toBe(7);
  await page.screenshot({
    fullPage: true,
    path: `${groupLogArtifactDir}/react-group-logs-default-clean.png`
  });

  await page.getByTestId("m7-group-logs-search").fill("不存在的记录");
  await expect(page.locator(".uz-glog-row")).toHaveCount(0);
  await expect(page.getByTestId("m7-group-logs-empty")).toContainText(
    "没有匹配「不存在的记录」的记录"
  );
  await expect(page.getByTestId("m7-group-logs-empty")).toContainText(
    "调整模块或搜索词后继续核对集团操作记录。"
  );
  await expectGroupLogVisibleBodyClean(page);
  await page.screenshot({
    fullPage: true,
    path: `${groupLogArtifactDir}/react-group-logs-search-empty-clean.png`
  });

  await page.getByTestId("m7-group-logs-search").fill("");
  const exportButton = page.getByTestId("m7-group-logs-export");
  await expect(exportButton).toHaveAttribute("aria-label", "导出集团日志");
  await expectGroupLogRuntimeBoundary(exportButton);
  await exportButton.click();
  const exportToast = page.getByTestId("m7-group-logs-toast");
  await expect(exportToast).toContainText("已准备导出范围");
  await expect(exportToast).toContainText("7 条记录");
  await expectGroupLogRuntimeBoundary(exportToast);
  await expectGroupLogVisibleBodyClean(page);

  const detail = page.getByRole("button", {
    name: /查看日志详情 AI 成员 agent-02/
  });
  await expectGroupLogRuntimeBoundary(detail);
  await detail.click();
  const detailToast = page.getByTestId("m7-group-logs-toast");
  await expect(detailToast).toContainText("详情预览已打开");
  await expect(detailToast).toContainText("AI 成员 / agent-02");
  await expectGroupLogRuntimeBoundary(detailToast);
  await expectGroupLogVisibleBodyClean(page);
  await page.screenshot({
    fullPage: true,
    path: `${groupLogArtifactDir}/react-group-logs-detail-toast-clean.png`
  });

  const forcedStates: Record<string, string> = {
    empty: "暂无集团日志",
    error: "集团日志暂不可用",
    loading: "正在载入集团日志",
    permission: "需要集团日志权限"
  };
  for (const [state, label] of Object.entries(forcedStates)) {
    await openGroupLogs(page, `?m7GroupLogsState=${state}`);
    const target = page.getByTestId(`m7-group-logs-state-${state}`);
    await expect(target).toContainText(label);
    await expectGroupLogRuntimeBoundary(target);
    await expectGroupLogVisibleBodyClean(page);
  }
  await openGroupLogs(page, "?m7GroupLogsState=degraded");
  await expectGroupLogRuntimeBoundary(page.getByTestId("m7-group-logs-runtime-note"));
  await expectGroupLogVisibleBodyClean(page);

  await openGroupLogs(page);
  await page.getByRole("button", { name: "Collapse navigation" }).click();
  const collapsed = await collectMetrics(page);
  expect(collapsed.navWidth).toBe(68);
  expect(collapsed.runtimeLabelsPresent).toBe(true);
  expect(collapsed.runtimeLabelsVisibleInBody).toBe(false);
  expect(collapsed.visibleBodyClean).toBe(true);
  await page.screenshot({
    fullPage: true,
    path: `${groupLogArtifactDir}/react-group-logs-collapsed-clean.png`
  });

  await page.setViewportSize({ width: 320, height: 900 });
  await openGroupLogs(page);
  await expect(page.locator(".uz-glog-card").first()).toBeVisible();
  const mobile = await collectMetrics(page);
  expect(mobile.bodyScrollWidth).toBeLessThanOrEqual(320);
  expect(mobile.documentScrollWidth).toBeLessThanOrEqual(320);
  expect(mobile.panelWidth).toBeLessThanOrEqual(296);
  expect(mobile.runtimeLabelsPresent).toBe(true);
  expect(mobile.runtimeLabelsVisibleInBody).toBe(false);
  expect(mobile.visibleBodyClean).toBe(true);
  await page.screenshot({
    fullPage: true,
    path: `${groupLogArtifactDir}/react-group-logs-mobile-320-clean.png`
  });

  writeFileSync(
    `${groupLogArtifactDir}/metrics.json`,
    `${JSON.stringify({ collapsed, desktop, mobile }, null, 2)}\n`
  );
});

async function collectMetrics(page: Page) {
  const boundary = await collectGroupLogBoundaryState(page);
  return page.evaluate(
    ({ boundary }) => {
      const panel = document.querySelector(".uz-glog-panel") as HTMLElement;
      return {
        activePageId: document
          .querySelector('[data-testid="admin-shell"]')
          ?.getAttribute("data-active-page-id"),
        bodyScrollWidth: document.body.scrollWidth,
        documentScrollWidth: document.documentElement.scrollWidth,
        navWidth: Math.round(
          document
            .querySelector('[data-testid="app-shell-nav"]')
            ?.getBoundingClientRect().width ?? 0
        ),
        panelWidth: Math.round(panel?.offsetWidth ?? 0),
        runtimeLabelsPresent: boundary.runtimeLabelsPresent,
        runtimeLabelsVisibleInBody: boundary.runtimeLabelsVisibleInBody,
        shellLevel: document
          .querySelector('[data-testid="admin-shell"]')
          ?.getAttribute("data-shell-level"),
        tableRowCount: document.querySelectorAll(".uz-glog-row").length,
        visibleBodyClean: boundary.visibleBodyClean
      };
    },
    { boundary }
  );
}
