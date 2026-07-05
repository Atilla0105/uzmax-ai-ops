import { mkdirSync, writeFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

const artifactDir = "/tmp/uzmax-m7-ui-54-config-page-visible-ui";
const tenantSections = ["运营", "数据", "智能", "管理", "洞察"];
const groupSections = ["总览", "平台", "治理"];
const tenantLabels = [
  "对话",
  "工单",
  "确认队列",
  "客户资产",
  "订单",
  "知识与资源",
  "评测中心",
  "AI 成员",
  "团队",
  "配置",
  "分析",
  "日志"
];
const groupLabels = [
  "集团总览",
  "模型/成本/风险",
  "模板中心",
  "连接中心",
  "发布与验收",
  "租户管理",
  "集团日志"
];
const configSections = [
  "业务配置",
  "SLA",
  "模板",
  "模型路由",
  "成本护栏",
  "熔断阈值",
  "渠道配置",
  "订单 connector"
];

mkdirSync(artifactDir, { recursive: true });

test.beforeEach(async ({ page }) => {
  await page.route("**/conversation-ticket/conversations", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
  await page.route("**/confirmation-queue/items?status=pending", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
});

test("renders tenant config page with source-like internal navigation", async ({
  page
}) => {
  await openConfig(page);
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "tenant"
  );
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.config"
  );
  await expect(page.getByTestId("page-outlet")).toHaveAttribute("data-tenant-id");
  await expectLayerNav(page, tenantSections, groupSections, tenantLabels, groupLabels);
  await expect(page.getByTestId("m7-config-page")).toContainText("配置");
  await expect(page.getByTestId("m7-config-runtime-note")).toContainText("degraded");
  for (const label of [
    "mock",
    "browser-local only",
    "no production config write",
    "no audit write",
    "no connector switch",
    "no eval-gated publish"
  ]) {
    await expect(page.getByTestId("m7-config-runtime-note")).toContainText(label);
  }
  const internal = page.getByTestId("m7-config-internal-nav");
  for (const label of configSections) {
    await expect(
      internal.getByRole("button", { exact: true, name: label })
    ).toBeVisible();
  }
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-config-desktop.png`
  });
  writeFileSync(
    `${artifactDir}/react-config-metrics.json`,
    JSON.stringify(await collectMetrics(page), null, 2)
  );
});

test("all eight config sections switch visibly", async ({ page }) => {
  await openConfig(page);
  const internal = page.getByTestId("m7-config-internal-nav");
  for (const label of configSections) {
    await internal.getByRole("button", { exact: true, name: label }).click();
    await expect(page.getByRole("heading", { name: label })).toBeVisible();
  }
});

test("dirty save and version history rollback are browser-local only", async ({
  page
}) => {
  await openConfig(page);
  await expect(page.getByTestId("m7-config-save")).toBeDisabled();
  await page.locator(".uz-config-field select").first().selectOption("俄语");
  await expect(page.getByTestId("m7-config-page")).toContainText("未保存的修改");
  await page.getByTestId("m7-config-save").click();
  await expect(page.getByTestId("m7-config-toast")).toContainText(
    "no production config write"
  );
  await page.getByRole("button", { name: /版本历史/ }).click();
  await expect(page.getByTestId("m7-config-history")).toContainText("no audit write");
  await page.getByRole("button", { name: "回滚到此版本" }).first().click();
  const modal = page.getByTestId("m7-confirm-modal");
  await expect(modal).toContainText("no production config write");
  await expect(modal.getByRole("button", { name: "回滚" })).toBeDisabled();
  await modal.getByRole("textbox").fill("local visual rollback check");
  await modal.getByRole("button", { name: "回滚" }).click();
  await expect(page.getByTestId("m7-config-toast")).toContainText("no audit write");
});

test("channel and connector actions stay local", async ({ page }) => {
  await openConfig(page);
  const internal = page.getByTestId("m7-config-internal-nav");
  await internal.getByRole("button", { exact: true, name: "渠道配置" }).click();
  await page.getByRole("button", { name: "测试连接" }).first().click();
  await expect(page.getByTestId("m7-config-toast")).toContainText("仅本地通过");
  await page.locator(".uz-config-switch").first().click();
  await expect(page.getByTestId("m7-config-page")).toContainText("未保存的修改");

  await internal.getByRole("button", { exact: true, name: "订单 connector" }).click();
  await page.getByRole("button", { name: "测试连接" }).click();
  await expect(page.getByTestId("m7-config-toast")).toContainText("no API call");
  await page.getByRole("button", { name: "切换为导入快照主路径" }).click();
  const modal = page.getByTestId("m7-confirm-modal");
  await expect(modal).toContainText("no connector switch");
  await modal.getByRole("textbox").fill("local switch reason");
  await modal.getByRole("button", { name: "确认本地切换" }).click();
  await expect(page.getByTestId("m7-config-toast")).toContainText(
    "no connector switch"
  );
});

test("forced URL states are deterministic", async ({ page }) => {
  for (const state of ["loading", "empty", "error", "permission", "degraded"]) {
    await openConfig(page, `?m7ConfigState=${state}`);
    const target =
      state === "degraded"
        ? page.getByTestId("m7-config-runtime-note")
        : page.getByTestId(`m7-config-state-${state}`);
    await expect(target).toContainText("browser-local only");
    await expect(target).toContainText("no production config write");
  }
});

test("collapsed sidebar and 320 mobile fallback stay bounded", async ({ page }) => {
  await openConfig(page);
  await page.getByRole("button", { name: "Collapse navigation" }).click();
  await expect(page.getByTestId("app-shell-nav")).toHaveJSProperty("offsetWidth", 68);
  await page.setViewportSize({ width: 320, height: 900 });
  await openConfig(page);
  await expect(page.getByTestId("m7-config-internal-nav")).toBeVisible();
  expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(320);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-config-mobile-320.png`
  });
});

async function openConfig(page: Page, query = "") {
  await page.goto(`/design${query}`);
  await page.getByTestId("tenant-switcher").selectOption("tenant-b");
  await page
    .getByTestId("app-shell-nav")
    .getByRole("button", { exact: true, name: "配置" })
    .click();
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.config"
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
  for (const label of visibleLabels) {
    await expect(nav.getByRole("button", { exact: true, name: label })).toBeVisible();
  }
  for (const label of hiddenLabels) {
    await expect(nav.getByRole("button", { exact: true, name: label })).toHaveCount(0);
  }
  for (const label of hiddenSections) {
    await expect(nav.locator(".uz-nav-group p").filter({ hasText: label })).toHaveCount(
      0
    );
  }
}

async function collectMetrics(page: Page) {
  return {
    activePageId: await page
      .getByTestId("admin-shell")
      .getAttribute("data-active-page-id"),
    bodyScrollWidth: await page.evaluate(() => document.body.scrollWidth),
    internalNavWidth: await page
      .getByTestId("m7-config-internal-nav")
      .evaluate((node) => node.clientWidth),
    sectionCount: await page
      .getByTestId("m7-config-internal-nav")
      .getByRole("button")
      .count(),
    shellLevel: await page.getByTestId("admin-shell").getAttribute("data-shell-level")
  };
}
