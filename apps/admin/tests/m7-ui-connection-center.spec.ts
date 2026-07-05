import { mkdirSync, writeFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

const artifactDir = "/tmp/uzmax-m7-ui-51-connection-center-visible-ui";
const groupLabels =
  "集团总览|模型/成本/风险|模板中心|连接中心|发布与验收|租户管理|集团日志".split("|");
const tenantLabels =
  "对话|工单|确认队列|客户资产|订单|知识与资源|评测中心|AI 成员|团队|配置|分析|日志".split(
    "|"
  );
const groupSections = ["总览", "平台", "治理"];
const tenantSections = ["运营", "数据", "智能", "管理", "洞察"];

mkdirSync(artifactDir, { recursive: true });

test.beforeEach(async ({ page }) => {
  await page.route("**/conversation-ticket/conversations", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
  await page.route("**/confirmation-queue/items?status=pending", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
});

test("renders group connection center with boundaries and desktop evidence", async ({
  page
}) => {
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
  await expect(page.getByText("集团级连接类型 · 启停/测试本地预览")).toBeVisible();
  await expectLayerNav(page, groupSections, tenantSections, groupLabels, tenantLabels);
  for (const label of [
    "degraded",
    "mock",
    "read-only",
    "browser-local only",
    "synthetic health",
    "no production connector change",
    "no real connection test",
    "no audit write"
  ])
    await expect(page.getByTestId("m7-connection-runtime-note")).toContainText(label);
  await expect(page.locator(".uz-connection-card")).toHaveCount(4);
  const bot = page.getByTestId("m7-connection-card-SYN-CONN-tgbot");
  await expect(bot).toContainText("Telegram Bot");
  await expect(bot).toContainText("mock 正常");
  await expect(bot).toContainText("mock 4 个租户");
  await expect(bot).toContainText("接入定级：mock 标准接入");
  await expect(bot).toContainText("最近错误：mock 无");
  await expect(bot).toContainText("玉珠跨境美妆");
  const business = page.getByTestId("m7-connection-card-SYN-CONN-tgbiz");
  await expect(business).toContainText("ADR-B01 · 部分可行");
  await expect(business).toContainText("mock 账号 B 绑定失败");
  const order = page.getByTestId("m7-connection-card-SYN-CONN-orderapi");
  await expect(order).toContainText("ADR-B02 · 无可用 API");
  await expect(order).toContainText("AllProvidersDown");
  const metrics = await collectMetrics(page);
  writeFileSync(
    `${artifactDir}/react-connection-center-metrics.json`,
    JSON.stringify(metrics, null, 2)
  );
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-connection-center-desktop.png`
  });
});

test("local toggle and synthetic test only change browser state", async ({ page }) => {
  await openConnection(page);
  const orderToggle = page.getByTestId("m7-connection-toggle-SYN-CONN-orderapi");
  const orderCard = page.getByTestId("m7-connection-card-SYN-CONN-orderapi");
  await expect(orderToggle).toHaveAttribute("role", "switch");
  await expect(orderToggle).toHaveAttribute("aria-checked", "false");
  await expect(orderCard).toContainText("mock 已停用");
  await orderToggle.click();
  await expect(orderToggle).toHaveAttribute("aria-checked", "true");
  await expect(orderCard).toContainText("mock 已启用");
  const toggleToast = page.getByTestId("m7-connection-toast");
  await expect(toggleToast).toHaveAttribute("role", "status");
  await expect(toggleToast).toHaveAttribute("aria-live", "polite");
  await expect(toggleToast).toContainText("no production connector change");
  await expect(toggleToast).toContainText("no real connection test");
  await expect(toggleToast).toContainText("no audit write");

  const testButton = page.getByTestId("m7-connection-test-SYN-CONN-tgbiz");
  await testButton.click();
  await expect(testButton).toContainText("测试中");
  await expect(page.getByTestId("m7-connection-toast")).toContainText(
    "synthetic test finished"
  );
  await expect(page.getByTestId("m7-connection-toast")).toContainText(
    "no production connector change"
  );
  await expect(page.getByTestId("m7-connection-toast")).toContainText(
    "no real connection test"
  );
  await expect(page.getByTestId("m7-connection-toast")).toContainText("no audit write");
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-connection-center-local-toast.png`
  });
});

test("forced URL states stay deterministic", async ({ page }) => {
  for (const state of ["loading", "empty", "error", "permission", "degraded"]) {
    await openConnection(page, `?state=${state}`);
    const target =
      state === "degraded"
        ? page.getByTestId("m7-connection-runtime-note")
        : page.getByTestId(`m7-connection-state-${state}`);
    await expect(target).toContainText("browser-local only");
    await expect(target).toContainText("no production connector change");
    await expect(target).toContainText("no real connection test");
    await expect(target).toContainText("no audit write");
  }
});

test("sidebar collapse and mobile 320 fallback remain bounded", async ({ page }) => {
  await openConnection(page);
  await page.getByRole("button", { name: "Collapse navigation" }).click();
  await expect(page.getByTestId("app-shell-nav")).toHaveJSProperty("offsetWidth", 68);
  await expect(page.getByTestId("admin-shell")).toHaveClass(/is-nav-collapsed/);

  await page.setViewportSize({ width: 320, height: 900 });
  await openConnection(page);
  await expect(page.getByTestId("m7-connection-page")).toBeVisible();
  await expect(page.locator(".uz-connection-card").first()).toBeVisible();
  expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(320);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-connection-center-mobile-320.png`
  });
});

async function openConnection(page: Page, query = "") {
  await page.goto(`/design${query}`);
  await page
    .getByTestId("app-shell-nav")
    .getByRole("button", { exact: true, name: "连接中心" })
    .click();
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "group.connections"
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
    bodyScrollWidth: await page.evaluate(() => document.body.scrollWidth),
    cardCount: await page.locator(".uz-connection-card").count(),
    firstCardWidth: await page
      .locator(".uz-connection-card")
      .first()
      .evaluate((node) => Math.round((node as HTMLElement).offsetWidth)),
    listMaxWidth: await page
      .locator(".uz-connection-list")
      .evaluate((node) => getComputedStyle(node as HTMLElement).maxWidth),
    shellLevel: await page.getByTestId("admin-shell").getAttribute("data-shell-level"),
    sidebarExpandedWidth: await page
      .getByTestId("app-shell-nav")
      .evaluate((node) => (node as HTMLElement).offsetWidth),
    topbarHeight: await page
      .locator(".uz-topbar")
      .evaluate((node) => (node as HTMLElement).offsetHeight)
  };
}
