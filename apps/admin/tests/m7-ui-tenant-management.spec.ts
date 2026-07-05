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

test("renders group tenant management as owner HTML table/new-tenant shape", async ({
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
  await expect(page.getByText("4 个租户")).toBeVisible();
  await expect(page.getByTestId("m7-tenant-new-button")).toContainText("新建租户");
  await expect(page.getByTestId("m7-tenant-table-panel")).toBeVisible();
  await expect(page.getByTestId("m7-tenant-manage-placeholder")).toContainText("管理");
  await expect(page.locator(".uz-tenant-card")).toHaveCount(0);
  await expect(page.getByTestId("m7-tenant-drawer")).toHaveCount(0);
  const tenantPage = page.getByTestId("m7-tenant-page");
  for (const name of ["玉珠跨境美妆", "丝路数码", "天净家居", "白桦母婴"])
    await expect(tenantPage.getByText(name)).toHaveCount(0);
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

  const metrics = await collectMetrics(page);
  writeFileSync(
    `${artifactDir}/react-tenant-management-metrics.json`,
    JSON.stringify(metrics, null, 2)
  );
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-tenant-management-desktop.png`
  });
});

test("new tenant modal stays browser-local only", async ({ page }) => {
  await openTenants(page);
  await page.getByTestId("m7-tenant-manage-placeholder").click();
  await expectLocalToast(page, ["owner HTML table row data is not rendered"]);

  await page.getByTestId("m7-tenant-new-button").click();
  const modal = page.getByTestId("m7-tenant-new-modal");
  await expect(modal).toHaveAttribute("role", "dialog");
  for (const label of [
    "创建新租户",
    "租户名称",
    "业务线",
    "默认语言",
    "默认时区",
    "渠道能力",
    "初始模板"
  ])
    await expect(modal).toContainText(label);
  await expect(page.getByTestId("m7-tenant-new-create")).toBeDisabled();
  await page.getByTestId("m7-tenant-new-name").fill("胡杨跨境百货");
  await page.getByTestId("m7-tenant-new-line").fill("百货 · 中亚");
  await page.getByTestId("m7-tenant-new-cap-business").click();
  await page.getByTestId("m7-tenant-new-template").selectOption("家居通用包");
  await expect(page.getByTestId("m7-tenant-new-create")).toBeEnabled();
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-tenant-management-new-tenant-modal.png`
  });
  await page.getByTestId("m7-tenant-new-create").click();
  await expect(page.getByTestId("m7-tenant-new-modal")).toHaveCount(0);
  await expect(page.getByText("5 个租户")).toBeVisible();
  await expectLocalToast(page, [
    "created in browser preview",
    "no production tenant change",
    "no tenant config persistence",
    "no connector or feature flag change",
    "no audit write"
  ]);
});

test("new tenant modal traps focus and closes without persistence", async ({
  page
}) => {
  await openTenants(page);
  await page.getByTestId("m7-tenant-new-button").click();
  await expect(page.getByTestId("m7-tenant-new-name")).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(page.getByTestId("m7-tenant-new-cancel")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("m7-tenant-new-modal")).toHaveCount(0);
  await expect(page.getByText("4 个租户")).toBeVisible();
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

test("sidebar collapse and mobile 320 table/modal remain bounded", async ({ page }) => {
  await openTenants(page);
  await page.getByRole("button", { name: "Collapse navigation" }).click();
  await expect(page.getByTestId("app-shell-nav")).toHaveJSProperty("offsetWidth", 68);
  await expect(page.getByTestId("admin-shell")).toHaveClass(/is-nav-collapsed/);

  await page.setViewportSize({ width: 320, height: 900 });
  await openTenants(page);
  await expect(page.getByTestId("m7-tenant-table-panel")).toBeVisible();
  expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(320);
  await page.getByTestId("m7-tenant-new-button").click();
  await expect(page.getByTestId("m7-tenant-new-modal")).toBeVisible();
  expect(
    await page
      .getByTestId("m7-tenant-new-modal")
      .evaluate((node) => Math.round((node as HTMLElement).offsetWidth))
  ).toBeLessThanOrEqual(296);
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
    modalCount: await page.getByTestId("m7-tenant-new-modal").count(),
    panelWidth: await page
      .getByTestId("m7-tenant-table-panel")
      .evaluate((node) => Math.round((node as HTMLElement).offsetWidth)),
    shellLevel: await page.getByTestId("admin-shell").getAttribute("data-shell-level"),
    sidebarExpandedWidth: await page
      .getByTestId("app-shell-nav")
      .evaluate((node) => (node as HTMLElement).offsetWidth),
    tableScrollWidth: await page
      .locator(".uz-tenant-table")
      .evaluate((node) => Math.round((node as HTMLElement).scrollWidth)),
    topbarHeight: await page
      .locator(".uz-topbar")
      .evaluate((node) => (node as HTMLElement).offsetHeight)
  };
}
