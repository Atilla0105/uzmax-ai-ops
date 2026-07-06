import { mkdirSync, writeFileSync } from "node:fs";
import { expect, test, type Locator, type Page } from "@playwright/test";

const artifactDir = "/tmp/uzmax-m7-ui-55-analytics-page-visible-ui";
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
const runtimeLabels = [
  "degraded",
  "mock",
  "browser-local only",
  "no production analytics metrics",
  "no export file write",
  "no analytics runtime",
  "no audit write"
];
const forbiddenVisibleTerms = [
  ...runtimeLabels,
  "local-only",
  "local only",
  "Synthetic"
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

test("renders tenant analytics page with source-like structure", async ({ page }) => {
  await openAnalytics(page);
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "tenant"
  );
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.analytics"
  );
  await expect(page.getByTestId("page-outlet")).toHaveAttribute("data-tenant-id");
  await expectLayerNav(page, tenantSections, groupSections, tenantLabels, groupLabels);
  await expect(page.getByTestId("m7-analytics-page")).toContainText("分析");
  await expect(page.getByTestId("m7-analytics-runtime-note")).toHaveAttribute(
    "hidden",
    ""
  );
  await expectRuntimeBoundary(page.getByTestId("m7-analytics-runtime-note"));
  await expect(page.getByTestId("m7-analytics-kpis")).toContainText("解决率");
  await expect(page.getByTestId("m7-analytics-handoff")).toContainText(
    "转人工原因分布"
  );
  await expect(page.getByTestId("m7-analytics-top-issues")).toContainText("Top 问题");
  await expect(page.getByTestId("m7-analytics-table")).toContainText("分析表");
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-analytics-desktop.png`
  });
  writeFileSync(
    `${artifactDir}/react-analytics-metrics.json`,
    JSON.stringify(await collectMetrics(page), null, 2)
  );
});

test("range switch and dimensions update browser-local table", async ({ page }) => {
  await openAnalytics(page);
  await page.getByRole("button", { exact: true, name: "今日" }).click();
  await expect(page.getByTestId("m7-analytics-kpis")).toContainText("180");
  await page.getByRole("button", { name: "添加维度" }).click();
  await page
    .getByTestId("m7-analytics-dim-menu")
    .getByRole("button", { exact: true, name: "成员" })
    .click();
  await page
    .getByTestId("m7-analytics-dim-menu")
    .getByRole("button", { name: "渠道" })
    .click();
  await expect(page.getByTestId("m7-analytics-active-dims")).toContainText("成员");
  await expect(page.getByTestId("m7-analytics-active-dims")).toContainText("渠道");
  await expect(
    page.getByTestId("m7-analytics-dim-menu").getByRole("button", { name: "意图" })
  ).toHaveAttribute("aria-disabled", "true");
  await expect(page.getByTestId("m7-analytics-table")).toContainText("Telegram Bot");
  await page.getByRole("button", { name: /移除member/ }).click();
  await expect(page.getByTestId("m7-analytics-active-dims")).not.toContainText("成员");
});

test("export keeps production write boundary hidden", async ({ page }) => {
  await openAnalytics(page);
  await page.getByTestId("m7-analytics-export").click();
  await expect(page.getByTestId("m7-analytics-toast")).toContainText("导出预览已生成");
  await expectRuntimeBoundary(page.getByTestId("m7-analytics-toast"));
  await expectVisibleBodyClean(page);
});

test("forced URL states are deterministic", async ({ page }) => {
  for (const state of ["loading", "empty", "error", "permission", "degraded"]) {
    await openAnalytics(page, `?m7AnalyticsState=${state}`);
    const target =
      state === "degraded"
        ? page.getByTestId("m7-analytics-runtime-note")
        : page.getByTestId(`m7-analytics-state-${state}`);
    await expectRuntimeBoundary(target);
    await expectVisibleBodyClean(page);
  }
});

test("collapsed sidebar and 320 mobile fallback stay bounded", async ({ page }) => {
  await openAnalytics(page);
  await page.getByRole("button", { name: "Collapse navigation" }).click();
  await expect(page.getByTestId("app-shell-nav")).toHaveJSProperty("offsetWidth", 68);
  await page.setViewportSize({ width: 320, height: 900 });
  await openAnalytics(page);
  await expect(page.getByTestId("m7-analytics-page")).toBeVisible();
  expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(320);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-analytics-mobile-320.png`
  });
});

async function openAnalytics(page: Page, query = "") {
  await page.goto(`/design${query}`);
  await page.getByTestId("tenant-switcher").selectOption("tenant-b");
  await page
    .getByTestId("app-shell-nav")
    .getByRole("button", { exact: true, name: "分析" })
    .click();
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.analytics"
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
    kpiCount: await page.locator(".uz-analytics-kpi").count(),
    shellLevel: await page.getByTestId("admin-shell").getAttribute("data-shell-level"),
    tableWidth: await page
      .getByTestId("m7-analytics-table")
      .evaluate((node) => node.clientWidth)
  };
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
