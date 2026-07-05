import { mkdirSync, writeFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

const artifactDir = "/tmp/uzmax-m7-ui-42-model-cost-risk-visible-ui";
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
});

test("renders group model cost risk with boundaries and desktop evidence", async ({
  page
}) => {
  await openModel(page);
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "group"
  );
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "group.modelRisk"
  );
  await expect(page.getByTestId("page-outlet")).not.toHaveAttribute("data-tenant-id");
  for (const label of [
    "degraded",
    "mock",
    "read-only",
    "not production cost metrics",
    "no production model routing",
    "local action only"
  ])
    await expect(page.getByTestId("m7-model-runtime-note")).toContainText(label);

  await expectLayerNav(page, groupSections, tenantSections, groupLabels, tenantLabels);
  await expect(page.getByTestId("m7-model-matrix")).toContainText(
    "no production model routing"
  );
  await expect(page.getByTestId("m7-model-cost")).toContainText(
    "not production cost metrics"
  );
  await expect(page.getByTestId("m7-model-risk")).toContainText("local action only");

  const metrics = await collectMetrics(page);
  expect(metrics.activePageId).toBe("group.modelRisk");
  expect(metrics.shellLevel).toBe("group");
  expect(metrics.sidebarExpandedWidth).toBe(232);
  expect(metrics.kpiCount).toBe(5);
  expect(metrics.matrixWidth).toBeGreaterThan(500);
  writeFileSync(
    `${artifactDir}/react-model-cost-risk-metrics.json`,
    JSON.stringify(metrics, null, 2)
  );
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-model-cost-risk-desktop.png`
  });
});

test("supports local export model switch and AllProvidersDown resolve", async ({
  page
}) => {
  await openModel(page);
  await page.getByTestId("m7-model-export").click();
  const toast = page.getByTestId("m7-model-toast");
  await expect(toast).toHaveAttribute("role", "status");
  await expect(toast).toHaveAttribute("aria-live", "polite");
  await expect(toast).toContainText("local-only");
  await expect(toast).toContainText("no production CSV export");

  const row = page.getByTestId("m7-model-task-SYN-MODEL-TASK-intent");
  const switchButton = page.getByTestId("m7-model-task-switch-SYN-MODEL-TASK-intent");
  await expect(row).toContainText("SYN-MODEL-PRIMARY-A");
  await expect(switchButton).toHaveAttribute("aria-pressed", "false");
  await expect(switchButton).toHaveAttribute("aria-label", /未切换/);
  await switchButton.focus();
  await page.keyboard.press("Enter");
  await expect(switchButton).toHaveAttribute("aria-pressed", "true");
  await expect(switchButton).toHaveAttribute("aria-label", /已切换/);
  await expect(row).toContainText("已切换");
  await expect(row).toContainText("SYN-MODEL-FALLBACK-A");

  const kpi = page.getByTestId("m7-model-kpi-SYN-MODEL-KPI-down");
  await expect(kpi).toContainText("mock 1");
  await page.getByTestId("m7-model-resolve-SYN-MODEL-RISK-all-providers-down").click();
  await expect(
    page.getByTestId("m7-model-risk-SYN-MODEL-RISK-all-providers-down")
  ).toHaveCount(0);
  await expect(kpi).toContainText("mock 0");
  await expect(page.getByTestId("m7-model-toast")).toContainText(
    "no production provider health"
  );
});

test("cost tenant row enters tenant conversations with tenant-only nav", async ({
  page
}) => {
  await openModel(page);
  await page.getByTestId("m7-model-cost-tenant-tenant-b").click();
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "tenant"
  );
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.conversations"
  );
  await expect(page.getByTestId("page-outlet")).toHaveAttribute(
    "data-tenant-id",
    "tenant-b"
  );
  await expectLayerNav(page, tenantSections, groupSections, tenantLabels, groupLabels);
});

test("URL states collapse nav and mobile 320 remain bounded", async ({ page }) => {
  for (const state of ["loading", "empty", "error", "permission", "degraded"]) {
    await openModel(page, `?m7ModelState=${state}`);
    const target =
      state === "degraded"
        ? page.getByTestId("m7-model-runtime-note")
        : page.getByTestId(`m7-model-state-${state}`);
    await expect(target).toContainText("not production cost metrics");
    await expect(target).toContainText("no production model routing");
  }

  await page.getByRole("button", { name: "Collapse navigation" }).click();
  await expect(page.getByTestId("app-shell-nav")).toHaveJSProperty("offsetWidth", 68);
  await page.setViewportSize({ width: 320, height: 900 });
  await openModel(page);
  await expect(page.getByTestId("m7-model-page")).toBeVisible();
  expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(320);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-model-cost-risk-mobile-320.png`
  });
});

async function openModel(page: Page, query = "") {
  await page.goto(`/design${query}`);
  await page
    .getByTestId("app-shell-nav")
    .getByRole("button", { exact: true, name: "模型/成本/风险" })
    .click();
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "group.modelRisk"
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
    kpiCount: await page.locator(".uz-model-kpi").count(),
    matrixWidth: await page
      .getByTestId("m7-model-matrix")
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
