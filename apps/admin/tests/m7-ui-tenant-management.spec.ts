import { mkdirSync, writeFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

const artifactDir = "/tmp/uzmax-m7-ui-52-tenant-management-visible-ui";
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

test("renders group tenant management with local-only boundaries and drawer", async ({
  page
}) => {
  await openTenants(page);
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "group"
  );
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "group.tenants"
  );
  await expect(page.getByTestId("page-outlet")).not.toHaveAttribute("data-tenant-id");
  await expect(page.getByRole("heading", { name: "租户管理" })).toBeVisible();
  await expect(page.getByText("4 个租户 · 创建 / 停用仅本地预览")).toBeVisible();
  await expectLayerNav(page, groupSections, tenantSections, groupLabels, tenantLabels);
  for (const label of [
    "degraded",
    "mock",
    "read-only",
    "browser-local only",
    "synthetic tenant metrics",
    "no production tenant change",
    "no tenant config persistence",
    "no connector or feature flag change",
    "no audit write"
  ])
    await expect(page.getByTestId("m7-tenant-runtime-note")).toContainText(label);

  await expect(page.locator(".uz-tenant-card")).toHaveCount(4);
  const firstCard = page.getByRole("button", { name: /管理租户 玉珠跨境美妆/ });
  await expect(firstCard).toContainText("mock 运行中");
  await expect(firstCard).toContainText("美妆 · 中亚");
  await expect(firstCard).toContainText("美妆标准包");
  await expect(firstCard).toContainText("mock 成员 8");
  await expect(firstCard).toContainText("mock AI 3");
  await expect(firstCard).toContainText("mock 连接 降级");
  await expect(page.getByTestId("m7-tenant-card-SYN-TENANT-t4")).toContainText(
    "mock 已停用"
  );
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-tenant-management-desktop.png`
  });

  await firstCard.click();
  const drawer = page.getByTestId("m7-tenant-drawer");
  await expect(drawer).toHaveAttribute("role", "dialog");
  await expect(drawer).toContainText("玉珠跨境美妆");
  await expect(drawer).toContainText("来源模板：美妆标准包");
  await expect(page.getByTestId("m7-tenant-language")).toHaveValue(
    "乌兹别克语（拉丁）"
  );
  await expect(page.getByTestId("m7-tenant-timezone")).toHaveValue("UTC+5 塔什干");
  await expect(page.getByTestId("m7-tenant-cap-bot")).toHaveAttribute("role", "switch");
  await expect(page.getByTestId("m7-tenant-cap-orderApi")).toHaveAttribute(
    "aria-checked",
    "false"
  );
  const metrics = await collectMetrics(page);
  writeFileSync(
    `${artifactDir}/react-tenant-management-metrics.json`,
    JSON.stringify(metrics, null, 2)
  );
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-tenant-management-drawer.png`
  });
});

test("drawer edits and disable restore stay browser-local only", async ({ page }) => {
  await openTenants(page);
  await page.getByTestId("m7-tenant-card-SYN-TENANT-t1").click();
  await page.getByTestId("m7-tenant-language").selectOption("中文");
  await expectLocalToast(page, [
    "默认语言 -> 中文",
    "no production tenant change",
    "no tenant config persistence",
    "no audit write"
  ]);
  await page.getByTestId("m7-tenant-timezone").selectOption("UTC+8 北京");
  await expectLocalToast(page, ["默认时区 -> UTC+8 北京", "no audit write"]);

  const orderSwitch = page.getByTestId("m7-tenant-cap-orderApi");
  await expect(orderSwitch).toHaveAttribute("aria-checked", "false");
  await orderSwitch.click();
  await expect(orderSwitch).toHaveAttribute("aria-checked", "true");
  await expectLocalToast(page, [
    "订单 API enabled",
    "no connector or feature flag change",
    "no audit write"
  ]);

  await page.getByTestId("m7-tenant-disable").click();
  const modal = page.getByTestId("m7-confirm-modal");
  await expect(modal).toContainText("停用租户");
  await expect(modal.getByRole("button", { name: "确认停用" })).toBeDisabled();
  await modal
    .getByPlaceholder("必填；仅用于 browser-local 预览，不写生产审计")
    .fill("local UI test reason");
  await expect(modal.getByRole("button", { name: "确认停用" })).toBeEnabled();
  await modal.getByRole("button", { name: "确认停用" }).click();
  await expect(page.getByTestId("m7-tenant-disabled-note")).toContainText(
    "local UI test reason"
  );
  await expectLocalToast(page, [
    "disabled in browser state",
    "no production tenant change",
    "no audit write"
  ]);

  await page.getByTestId("m7-tenant-restore").click();
  await expect(page.getByTestId("m7-tenant-disabled-note")).toHaveCount(0);
  await expectLocalToast(page, [
    "restored in browser state",
    "no production tenant change",
    "no audit write"
  ]);
});

test("forced URL states stay deterministic", async ({ page }) => {
  for (const state of ["loading", "empty", "error", "permission", "degraded"]) {
    await openTenants(page, `?state=${state}`);
    const target =
      state === "degraded"
        ? page.getByTestId("m7-tenant-runtime-note")
        : page.getByTestId(`m7-tenant-state-${state}`);
    await expect(target).toContainText("browser-local only");
    await expect(target).toContainText("no production tenant change");
    await expect(target).toContainText("no audit write");
  }
});

test("sidebar collapse and mobile 320 drawer remain bounded", async ({ page }) => {
  await openTenants(page);
  await page.getByRole("button", { name: "Collapse navigation" }).click();
  await expect(page.getByTestId("app-shell-nav")).toHaveJSProperty("offsetWidth", 68);
  await expect(page.getByTestId("admin-shell")).toHaveClass(/is-nav-collapsed/);

  await page.setViewportSize({ width: 320, height: 900 });
  await openTenants(page);
  await expect(page.getByTestId("m7-tenant-page")).toBeVisible();
  await expect(page.locator(".uz-tenant-card").first()).toBeVisible();
  expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(320);
  await page.getByTestId("m7-tenant-card-SYN-TENANT-t1").click();
  await expect(page.getByTestId("m7-tenant-drawer")).toBeVisible();
  expect(
    await page
      .getByTestId("m7-tenant-drawer")
      .evaluate((node) => Math.round((node as HTMLElement).offsetWidth))
  ).toBeLessThanOrEqual(320);
  expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(320);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-tenant-management-mobile-320.png`
  });
});

async function openTenants(page: Page, query = "") {
  await page.goto(`/design${query}`);
  await page
    .getByTestId("app-shell-nav")
    .getByRole("button", { exact: true, name: "租户管理" })
    .click();
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "group.tenants"
  );
}

async function expectLocalToast(page: Page, labels: readonly string[]) {
  const toast = page.getByTestId("m7-tenant-toast");
  await expect(toast).toHaveAttribute("role", "status");
  await expect(toast).toHaveAttribute("aria-live", "polite");
  for (const label of labels) await expect(toast).toContainText(label);
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
    cardCount: await page.locator(".uz-tenant-card").count(),
    drawerWidth: await page
      .getByTestId("m7-tenant-drawer")
      .evaluate((node) => Math.round((node as HTMLElement).offsetWidth)),
    firstCardWidth: await page
      .locator(".uz-tenant-card")
      .first()
      .evaluate((node) => Math.round((node as HTMLElement).offsetWidth)),
    shellLevel: await page.getByTestId("admin-shell").getAttribute("data-shell-level"),
    sidebarExpandedWidth: await page
      .getByTestId("app-shell-nav")
      .evaluate((node) => (node as HTMLElement).offsetWidth),
    topbarHeight: await page
      .locator(".uz-topbar")
      .evaluate((node) => (node as HTMLElement).offsetHeight)
  };
}
