import { mkdirSync, writeFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

const artifactDir = "/tmp/uzmax-m7-ui-56-logs-page-visible-ui";
const baseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL ?? "http://127.0.0.1:4173";
const tenantSections = ["运营", "数据", "智能", "管理", "洞察"];
const groupSections = ["总览", "平台", "治理"];
const tenantLabels =
  "对话|工单|确认队列|客户资产|订单|知识与资源|评测中心|AI 成员|团队|配置|分析|日志".split(
    "|"
  );
const groupLabels =
  "集团总览|模型/成本/风险|模板中心|连接中心|发布与验收|租户管理|集团日志".split("|");

mkdirSync(artifactDir, { recursive: true });

test.beforeEach(async ({ page }) => {
  await page.route("**/conversation-ticket/conversations", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
  await page.route("**/confirmation-queue/items?status=pending", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
});

test("renders tenant logs with tenant shell and local-only boundary", async ({
  page
}) => {
  await openLogs(page);
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "tenant"
  );
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.logs"
  );
  await expect(page.getByTestId("page-outlet")).toHaveAttribute("data-tenant-id");
  await expect(page.getByTestId("m7-logs-page")).toHaveAttribute("data-tenant-id");
  await expectLayerNav(page, tenantSections, groupSections, tenantLabels, groupLabels);
  await expect(page.getByRole("heading", { name: "日志" })).toBeVisible();
  await expect(page.getByTestId("m7-logs-subtitle")).toContainText(
    "6 条 mock · 操作日志预览"
  );
  for (const label of [
    "degraded",
    "mock",
    "read-only",
    "browser-local only",
    "synthetic tenant log rows",
    "no production audit/log export",
    "no file written",
    "no audit/log runtime call",
    "no real tenant/action navigation"
  ])
    await expect(page.getByTestId("m7-logs-runtime-note")).toContainText(label);

  const logPage = page.getByTestId("m7-logs-page");
  for (const label of ["登录日志", "在线日志", "操作日志"])
    await expect(
      logPage.getByRole("button", { exact: true, name: label })
    ).toBeVisible();
  await expect(page.getByTestId("m7-logs-active-tab")).toHaveText("操作日志");
  await expect(page.locator(".uz-tlog-row")).toHaveCount(6);
  await expect(page.locator(".uz-tlog-row").first()).toContainText("模型路由");
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-logs-desktop.png`
  });
  writeFileSync(
    `${artifactDir}/react-logs-metrics.json`,
    JSON.stringify(await collectMetrics(page), null, 2)
  );
});

test("tabs and search filter rows with deterministic empty state", async ({ page }) => {
  await openLogs(page);
  const logPage = page.getByTestId("m7-logs-page");
  await logPage.getByRole("button", { exact: true, name: "登录日志" }).click();
  await expect(page.getByTestId("m7-logs-active-tab")).toHaveText("登录日志");
  await expect(page.locator(".uz-tlog-row")).toHaveCount(4);
  await expect(page.getByTestId("m7-logs-subtitle")).toContainText(
    "4 条 mock · 登录日志预览"
  );

  await page.getByTestId("m7-logs-search").fill("密码错误");
  await expect(page.locator(".uz-tlog-row")).toHaveCount(1);
  await expect(page.locator(".uz-tlog-row")).toContainText("失败 · 密码错误");
  await page.getByTestId("m7-logs-search").fill("no matching local row");
  await expect(page.locator(".uz-tlog-row")).toHaveCount(0);
  await expect(page.getByTestId("m7-logs-empty")).toContainText(
    "没有匹配「no matching local row」的记录"
  );
  await expect(page.getByTestId("m7-logs-subtitle")).toContainText("0 条 mock");
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-logs-search-empty.png`
  });
});

test("operation detail affordances stay browser-local only", async ({ page }) => {
  await openLogs(page);
  await page.getByRole("button", { name: /本地预览日志详情 配置 route v17/ }).click();
  const toast = page.getByTestId("m7-logs-toast");
  await expect(toast).toHaveAttribute("role", "status");
  await expect(toast).toHaveAttribute("aria-live", "polite");
  await expect(toast).toContainText("browser-local only");
  await expect(toast).toContainText("route v17 detail preview");
  await expect(toast).toContainText("no real tenant/action navigation");
  await expect(toast).toContainText("no audit/log runtime call");
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.logs"
  );
});

test("forced URL states stay deterministic", async ({ page }) => {
  for (const state of ["loading", "empty", "error", "permission", "degraded"]) {
    await openLogs(page, `?m7LogsState=${state}`);
    const target =
      state === "degraded"
        ? page.getByTestId("m7-logs-runtime-note")
        : page.getByTestId(`m7-logs-state-${state}`);
    await expect(target).toContainText("browser-local only");
    await expect(target).toContainText("no production audit/log export");
    await expect(target).toContainText("no audit/log runtime call");
  }
});

test("collapsed sidebar and mobile 320 fallback stay bounded", async ({ page }) => {
  await openLogs(page);
  await page.getByRole("button", { name: "Collapse navigation" }).click();
  await expect(page.getByTestId("app-shell-nav")).toHaveJSProperty("offsetWidth", 68);
  await expect(page.getByTestId("admin-shell")).toHaveClass(/is-nav-collapsed/);

  await page.setViewportSize({ width: 320, height: 900 });
  await openLogs(page);
  await expect(page.getByTestId("m7-logs-page")).toBeVisible();
  await expect(page.locator(".uz-tlog-card").first()).toBeVisible();
  expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(320);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-logs-mobile-320.png`
  });
});

async function openLogs(page: Page, query = "") {
  await page.goto(`${baseUrl}/design${query}`);
  await page.getByTestId("tenant-switcher").selectOption("tenant-b");
  await page
    .getByTestId("app-shell-nav")
    .getByRole("button", { exact: true, name: "日志" })
    .click();
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.logs"
  );
}

async function expectLayerNav(
  page: Page,
  visibleSections: readonly string[],
  hiddenSections: readonly string[],
  visibleLabels: readonly string[],
  hiddenLabels: readonly string[]
) {
  const nav = page.getByTestId("app-shell-nav");
  await expect
    .poll(() => nav.locator(".uz-nav-group p").allTextContents())
    .toEqual(visibleSections);
  for (const label of visibleLabels)
    await expect(nav.getByRole("button", { exact: true, name: label })).toBeVisible();
  for (const label of hiddenLabels)
    await expect(nav.getByRole("button", { exact: true, name: label })).toHaveCount(0);
  for (const label of hiddenSections)
    await expect(nav.locator(".uz-nav-group p").filter({ hasText: label })).toHaveCount(
      0
    );
}

async function collectMetrics(page: Page) {
  return {
    activePageId: await page
      .getByTestId("admin-shell")
      .getAttribute("data-active-page-id"),
    activeTab: await page.getByTestId("m7-logs-active-tab").textContent(),
    bodyScrollWidth: await page.evaluate(() => document.body.scrollWidth),
    cardRowCount: await page.locator(".uz-tlog-card").count(),
    shellLevel: await page.getByTestId("admin-shell").getAttribute("data-shell-level"),
    sidebarExpandedWidth: await page
      .getByTestId("app-shell-nav")
      .evaluate((node) => (node as HTMLElement).offsetWidth),
    tableRowCount: await page.locator(".uz-tlog-row").count(),
    tableWrapperWidth: await page
      .locator(".uz-tlog-table-wrap")
      .evaluate((node) => Math.round((node as HTMLElement).offsetWidth)),
    topbarHeight: await page
      .locator(".uz-topbar")
      .evaluate((node) => (node as HTMLElement).offsetHeight)
  };
}
