import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { expect, test, type Page } from "@playwright/test";

const artifactDir = "/tmp/uzmax-m7-ui-55-analytics-page-cleanstack";
const ownerHtml = "/Users/atilla/Downloads/运营塔台1.0.html";
const sourcePaths = {
  fixture: "/Users/atilla/源码/unpacked 6/fixtures/analytics.ts",
  page: "/Users/atilla/源码/unpacked 6/pages/analytics/AnalyticsPage.tsx"
} as const;

mkdirSync(artifactDir, { recursive: true });

test.beforeEach(async ({ page }) => {
  await makeRuntimeQuiet(page);
});

test("samples owner source and renders tenant analytics page", async ({ page }) => {
  writeSourceSampling();
  await captureOwnerAnalyticsSample(page);
  await openAnalytics(page);

  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "tenant"
  );
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.analytics"
  );
  await expect(page.getByTestId("page-outlet")).toHaveAttribute(
    "data-tenant-id",
    "tenant-b"
  );
  await expect(page.getByTestId("m7-analytics-page")).toHaveAttribute(
    "data-tenant-id",
    "tenant-b"
  );
  await expect(page.getByRole("heading", { exact: true, name: "分析" })).toBeVisible();
  await expectTenantAnalyticsNav(page);
  for (const label of [
    "degraded",
    "mock",
    "read-only",
    "browser-local only",
    "no production analytics metrics",
    "no export file write",
    "no analytics runtime",
    "no audit write",
    "no DB/API/authz/RLS"
  ]) {
    await expect(page.getByTestId("m7-analytics-runtime-note")).toContainText(label);
  }
  for (const text of [
    "解决率",
    "转人工原因分布",
    "Top 问题",
    "趋势提示",
    "队列提示",
    "延迟提示",
    "分析表"
  ]) {
    await expect(page.getByTestId("m7-analytics-page")).toContainText(text);
  }
  const desktop = await collectAnalyticsMetrics(page);
  expect(desktop.bodyScrollWidth).toBeLessThanOrEqual(1280);
  expect(desktop.documentScrollWidth).toBeLessThanOrEqual(1280);
  expect(desktop.kpiCount).toBe(10);
  expect(desktop.hintsGap).toBeLessThanOrEqual(24);
  expect(desktop.firstPanelTop).toBeLessThanOrEqual(330);
  writeJson("react-analytics-desktop-metrics.json", desktop);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-analytics-desktop.png`
  });
});

test("analytics is tenant-only and hidden in group layer", async ({ page }) => {
  await page.goto("/design");
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "group"
  );
  await expect(
    page.getByRole("button", { exact: true, name: "集团总览" })
  ).toBeVisible();
  await expect(page.getByRole("button", { exact: true, name: "分析" })).toHaveCount(0);
  await page.getByTestId("tenant-switcher").selectOption("tenant-b");
  await expectTenantAnalyticsNav(page);
});

test("range filters dimensions and export stay browser-local", async ({ page }) => {
  await openAnalytics(page);
  const header = page.getByTestId("m7-analytics-header");
  await header.getByRole("button", { exact: true, name: "今日" }).click();
  await expect(page.getByTestId("m7-analytics-kpis")).toContainText("180");
  await page.getByLabel("分析渠道筛选").selectOption("Telegram Business");
  await page.getByLabel("分析语言筛选").selectOption("俄语");
  await expect(page.getByTestId("m7-analytics-filter-summary")).toContainText(
    "Telegram Business"
  );
  await expect(page.getByTestId("m7-analytics-filter-summary")).toContainText("俄语");

  await page.getByTestId("m7-analytics-add-dim").click();
  await page
    .getByTestId("m7-analytics-dim-menu")
    .getByRole("button", { exact: true, name: "成员" })
    .click();
  await page
    .getByTestId("m7-analytics-dim-menu")
    .getByRole("button", { exact: true, name: "渠道" })
    .click();
  await expect(page.getByTestId("m7-analytics-active-dims")).toContainText("成员");
  await expect(page.getByTestId("m7-analytics-active-dims")).toContainText("渠道");
  await expect(
    page.getByTestId("m7-analytics-dim-menu").getByRole("button", {
      exact: true,
      name: "AI 成员"
    })
  ).toBeDisabled();
  await expect(page.getByTestId("m7-analytics-table")).toContainText("Telegram Bot");
  await page.getByRole("button", { name: "移除成员维度" }).click();
  await expect(page.getByTestId("m7-analytics-active-dims")).not.toContainText("成员");

  await page.getByTestId("m7-analytics-export").click();
  await expect(page.getByTestId("m7-analytics-toast")).toContainText(
    "no export file write"
  );
  await expect(page.getByTestId("m7-analytics-toast")).toContainText("no audit write");
});

test("forced states cover empty delayed loading error permission degraded", async ({
  page
}) => {
  for (const state of ["loading", "empty", "error", "permission"]) {
    await openAnalytics(page, `?m7AnalyticsState=${state}`);
    const target = page.getByTestId(`m7-analytics-state-${state}`);
    await expect(target).toContainText("browser-local");
    await expect(target).toContainText(
      state === "permission" ? "backend authz" : "analytics"
    );
  }
  await openAnalytics(page, "?m7AnalyticsState=delayed");
  await expect(page.getByTestId("m7-analytics-delayed-data")).toContainText(
    "delayed data state"
  );
  await expect(page.getByTestId("m7-analytics-delayed-data")).toContainText(
    "no production analytics metrics"
  );
  await openAnalytics(page, "?m7AnalyticsState=degraded");
  await expect(page.getByTestId("m7-analytics-runtime-note")).toContainText(
    "no analytics runtime"
  );
});

test("collapsed sidebar and 320px mobile fallback stay compact", async ({ page }) => {
  await openAnalytics(page);
  await page.getByRole("button", { name: "Collapse navigation" }).click();
  const collapsed = await collectAnalyticsMetrics(page);
  expect(collapsed.navWidth).toBeLessThanOrEqual(70);
  writeJson("react-analytics-collapsed-metrics.json", collapsed);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-analytics-collapsed.png`
  });

  await page.setViewportSize({ width: 320, height: 900 });
  await openAnalytics(page);
  const mobile = await collectAnalyticsMetrics(page);
  expect(mobile.bodyScrollWidth).toBeLessThanOrEqual(320);
  expect(mobile.documentScrollWidth).toBeLessThanOrEqual(320);
  expect(mobile.pageWidth).toBeLessThanOrEqual(320);
  expect(mobile.headerHeight).toBeLessThanOrEqual(230);
  expect(mobile.noteHeight).toBeLessThanOrEqual(180);
  expect(mobile.delayedTop - mobile.noteBottom).toBeLessThanOrEqual(16);
  expect(mobile.firstPanelTop).toBeLessThanOrEqual(760);
  writeJson("react-analytics-mobile-320-metrics.json", mobile);
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

async function expectTenantAnalyticsNav(page: Page) {
  const nav = page.getByTestId("app-shell-nav");
  await expect(nav.getByRole("button", { exact: true, name: "分析" })).toBeVisible();
  await expect(nav.getByRole("button", { exact: true, name: "配置" })).toBeVisible();
  await expect(nav.getByRole("button", { exact: true, name: "集团总览" })).toHaveCount(
    0
  );
  await expect(nav.getByRole("button", { exact: true, name: "集团日志" })).toHaveCount(
    0
  );
}

async function makeRuntimeQuiet(page: Page) {
  for (const pattern of [
    "**/conversation-ticket/conversations",
    "**/confirmation-queue/items?status=pending"
  ]) {
    await page.route(pattern, (route) => route.fulfill({ json: { items: [] } }));
  }
}

async function collectAnalyticsMetrics(page: Page) {
  const [widths, boxes] = await Promise.all([
    page.evaluate(() => ({
      bodyScrollWidth: document.body.scrollWidth,
      documentScrollWidth: document.documentElement.scrollWidth
    })),
    page.evaluate((selectors) => {
      const entries = Object.entries(selectors).map(([name, selector]) => {
        const node = document.querySelector(selector);
        if (!(node instanceof HTMLElement))
          return [name, { bottom: -1, height: 0, top: -1, width: 0 }];
        const { bottom, height, top, width } = node.getBoundingClientRect();
        return [
          name,
          {
            bottom: Math.round(bottom),
            height: Math.round(height),
            top: Math.round(top),
            width: Math.round(width)
          }
        ];
      });
      return Object.fromEntries(entries) as Record<
        keyof typeof selectors,
        { bottom: number; height: number; top: number; width: number }
      >;
    }, analyticsMetricSelectors)
  ]);
  return {
    ...widths,
    delayedTop: boxes.delayed.top,
    firstPanelTop: boxes.kpis.top,
    headerHeight: boxes.header.height,
    hintsGap: boxes.hints.top - boxes.split.bottom,
    noteBottom: boxes.note.bottom,
    noteHeight: boxes.note.height,
    activePageId: await page
      .getByTestId("admin-shell")
      .getAttribute("data-active-page-id"),
    kpiCount: await page.locator(".uz-analytics-kpi").count(),
    navWidth: await width(page.getByTestId("app-shell-nav")),
    pageWidth: await width(page.getByTestId("m7-analytics-page")),
    shellLevel: await page.getByTestId("admin-shell").getAttribute("data-shell-level")
  };
}

const analyticsMetricSelectors = {
  delayed: ".uz-analytics-delayed",
  header: ".uz-analytics-head",
  hints: ".uz-analytics-hints",
  kpis: ".uz-analytics-kpis",
  note: ".uz-analytics-note",
  split: ".uz-analytics-split"
} as const;

async function captureOwnerAnalyticsSample(page: Page) {
  if (!existsSync(ownerHtml)) {
    return writeJson(
      "owner-html-analytics-source-dom-sample.json",
      unavailable(ownerHtml)
    );
  }
  await page.goto(pathToFileURL(ownerHtml).toString());
  await page.waitForLoadState("domcontentloaded");
  await page
    .getByText("分析", { exact: true })
    .first()
    .click({ timeout: 3000 })
    .catch(() => undefined);
  const text = await page.locator("body").innerText();
  writeJson("owner-html-analytics-source-dom-sample.json", {
    markers: markerMap(text, ["分析", "转人工原因分布", "Top 问题", "添加维度"]),
    sample: text.replace(/\s+/g, " ").trim().slice(0, 1000)
  });
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/owner-html-analytics-source-sample.png`
  });
}

function writeSourceSampling() {
  const sources = [
    { kind: "ownerHtml", markers: ["分析", "转人工原因分布"], path: ownerHtml },
    { kind: "page", markers: ["AnalyticsPage", "添加维度"], path: sourcePaths.page },
    {
      kind: "fixture",
      markers: ["ANALYTICS_RANGES", "HANDOFF_REASONS"],
      path: sourcePaths.fixture
    }
  ];
  const sampling = Object.fromEntries(
    sources.map((source) => [
      source.kind,
      existsSync(source.path)
        ? markerMap(readFileSync(source.path, "utf8"), source.markers)
        : unavailable(source.path)
    ])
  );
  const missing = sources.filter((source) => !existsSync(source.path));
  if (missing.length) {
    writeFileSync(
      `${artifactDir}/source-unavailable.md`,
      missing.map((source) => `unavailable: ${source.kind}: ${source.path}`).join("\n")
    );
  }
  writeJson("source-sampling.json", sampling);
}

async function width(locator: ReturnType<Page["getByTestId"]>) {
  return locator.evaluate((node) =>
    Math.round((node as HTMLElement).getBoundingClientRect().width)
  );
}

function markerMap(text: string, markers: readonly string[]) {
  return Object.fromEntries(markers.map((marker) => [marker, text.includes(marker)]));
}

function unavailable(path: string) {
  return { missingPath: path, status: "local-source-unavailable" };
}

function writeJson(name: string, value: unknown) {
  writeFileSync(`${artifactDir}/${name}`, JSON.stringify(value, null, 2));
}
