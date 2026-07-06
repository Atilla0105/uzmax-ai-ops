import { mkdirSync, writeFileSync } from "node:fs";
import { expect, test, type Locator, type Page } from "@playwright/test";

const artifactDir = "/tmp/uzmax-m7-ui-95-group-logs-default-visual-parity-refresh";
const groupLabels =
  "集团总览|模型/成本/风险|模板中心|连接中心|发布与验收|租户管理|集团日志".split("|");
const tenantLabels =
  "对话|工单|确认队列|客户资产|订单|知识与资源|评测中心|AI 成员|团队|配置|分析|日志".split(
    "|"
  );
const groupSections = ["总览", "平台", "治理"];
const tenantSections = ["运营", "数据", "智能", "管理", "洞察"];
const runtimeLabels =
  "degraded|mock|read-only|browser-local only|synthetic audit rows|no production audit export|no file written|no audit runtime call|no real tenant/action navigation".split(
    "|"
  );
const forbiddenVisibleTerms = [...runtimeLabels, "Synthetic", "synthetic"];

mkdirSync(artifactDir, { recursive: true });

test.beforeEach(async ({ page }) => {
  await page.route("**/conversation-ticket/conversations", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
  await page.route("**/confirmation-queue/items?status=pending", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
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
  await expectRuntimeBoundary(page.getByTestId("m7-group-logs-runtime-note"));
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
  await expectLayerNav(page);
  await expectVisibleBodyClean(page);

  const desktop = await collectMetrics(page);
  expect(desktop.activePageId).toBe("group.logs");
  expect(desktop.shellLevel).toBe("group");
  expect(desktop.runtimeLabelsPresent).toBe(true);
  expect(desktop.runtimeLabelsVisibleInBody).toBe(false);
  expect(desktop.visibleBodyClean).toBe(true);
  expect(desktop.tableRowCount).toBe(7);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-group-logs-default-clean.png`
  });

  await page.getByTestId("m7-group-logs-search").fill("不存在的记录");
  await expect(page.locator(".uz-glog-row")).toHaveCount(0);
  await expect(page.getByTestId("m7-group-logs-empty")).toContainText(
    "没有匹配「不存在的记录」的记录"
  );
  await expect(page.getByTestId("m7-group-logs-empty")).toContainText(
    "调整模块或搜索词后继续核对集团操作记录。"
  );
  await expectVisibleBodyClean(page);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-group-logs-search-empty-clean.png`
  });

  await page.getByTestId("m7-group-logs-search").fill("");
  const exportButton = page.getByTestId("m7-group-logs-export");
  await expect(exportButton).toHaveAttribute("aria-label", "导出集团日志");
  await expectRuntimeBoundary(exportButton);
  await exportButton.click();
  const exportToast = page.getByTestId("m7-group-logs-toast");
  await expect(exportToast).toContainText("已准备导出范围");
  await expect(exportToast).toContainText("7 条记录");
  await expectRuntimeBoundary(exportToast);
  await expectVisibleBodyClean(page);

  const detail = page.getByRole("button", {
    name: /查看日志详情 AI 成员 agent-02/
  });
  await expectRuntimeBoundary(detail);
  await detail.click();
  const detailToast = page.getByTestId("m7-group-logs-toast");
  await expect(detailToast).toContainText("详情预览已打开");
  await expect(detailToast).toContainText("AI 成员 / agent-02");
  await expectRuntimeBoundary(detailToast);
  await expectVisibleBodyClean(page);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-group-logs-detail-toast-clean.png`
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
    await expectRuntimeBoundary(target);
    await expectVisibleBodyClean(page);
  }
  await openGroupLogs(page, "?m7GroupLogsState=degraded");
  await expectRuntimeBoundary(page.getByTestId("m7-group-logs-runtime-note"));
  await expectVisibleBodyClean(page);

  await openGroupLogs(page);
  await page.getByRole("button", { name: "Collapse navigation" }).click();
  const collapsed = await collectMetrics(page);
  expect(collapsed.navWidth).toBe(68);
  expect(collapsed.runtimeLabelsPresent).toBe(true);
  expect(collapsed.runtimeLabelsVisibleInBody).toBe(false);
  expect(collapsed.visibleBodyClean).toBe(true);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-group-logs-collapsed-clean.png`
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
    path: `${artifactDir}/react-group-logs-mobile-320-clean.png`
  });

  writeFileSync(
    `${artifactDir}/metrics.json`,
    `${JSON.stringify({ collapsed, desktop, mobile }, null, 2)}\n`
  );
});

async function openGroupLogs(page: Page, query = "") {
  await page.goto(`/design${query}`);
  await page
    .getByTestId("app-shell-nav")
    .getByRole("button", { exact: true, name: "集团日志" })
    .click();
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "group.logs"
  );
}

async function expectVisibleBodyClean(page: Page) {
  const visibleBody = await page.evaluate(() => document.body.innerText);
  for (const term of forbiddenVisibleTerms) {
    expect(visibleBody.toLowerCase()).not.toContain(term.toLowerCase());
  }
}

async function expectRuntimeBoundary(locator: Locator) {
  const text = await locator.evaluate((node) =>
    [
      node.getAttribute("data-runtime-boundary") ?? "",
      node.getAttribute("title") ?? "",
      node.getAttribute("aria-description") ?? "",
      node.textContent ?? ""
    ].join(" ")
  );
  for (const label of runtimeLabels) expect(text).toContain(label);
}

async function expectLayerNav(page: Page) {
  const nav = page.getByTestId("app-shell-nav");
  await expect
    .poll(() => nav.locator(".uz-nav-group p").allTextContents())
    .toEqual(groupSections);
  for (const label of groupLabels)
    await expect(nav.getByRole("button", { exact: true, name: label })).toBeVisible();
  for (const label of tenantLabels)
    await expect(nav.getByRole("button", { exact: true, name: label })).toHaveCount(0);
  for (const section of tenantSections)
    await expect(
      nav.locator(".uz-nav-group p").filter({ hasText: section })
    ).toHaveCount(0);
}

async function collectMetrics(page: Page) {
  return page.evaluate(
    ({ forbidden, labels }) => {
      const visibleText = document.body.innerText;
      const fullText = document.body.textContent ?? "";
      const boundaryText = Array.from(
        document.querySelectorAll("[data-runtime-boundary]")
      )
        .map((node) => {
          const element = node as HTMLElement;
          return [
            element.getAttribute("data-runtime-boundary") ?? "",
            element.getAttribute("title") ?? "",
            element.getAttribute("aria-description") ?? "",
            element.textContent ?? ""
          ].join(" ");
        })
        .join(" ");
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
        runtimeLabelsPresent: labels.every((label) =>
          `${boundaryText} ${fullText}`.includes(label)
        ),
        runtimeLabelsVisibleInBody: labels.some((label) =>
          visibleText.toLowerCase().includes(label.toLowerCase())
        ),
        shellLevel: document
          .querySelector('[data-testid="admin-shell"]')
          ?.getAttribute("data-shell-level"),
        tableRowCount: document.querySelectorAll(".uz-glog-row").length,
        visibleBodyClean: forbidden.every(
          (term) => !visibleText.toLowerCase().includes(term.toLowerCase())
        )
      };
    },
    { forbidden: forbiddenVisibleTerms, labels: runtimeLabels }
  );
}
