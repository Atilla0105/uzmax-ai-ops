import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { expect, test, type Page } from "@playwright/test";

const artifactDir = "/tmp/uzmax-m7-ui-77-analytics-source-parity-refresh";
const ownerHtml = "/Users/atilla/Downloads/运营塔台1.0.html";
const sourceFiles = {
  fixtures: "/Users/atilla/源码/unpacked 6/fixtures/analytics.ts",
  page: "/Users/atilla/源码/unpacked 6/pages/analytics/AnalyticsPage.tsx"
};
const tenantSections = ["运营", "数据", "智能", "管理", "洞察"];
const groupSections = ["总览", "平台", "治理"];
const tenantLabels =
  "对话|工单|确认队列|客户资产|订单|知识与资源|评测中心|AI 成员|团队|配置|分析|日志".split(
    "|"
  );
const groupLabels =
  "集团总览|模型/成本/风险|模板中心|连接中心|发布与验收|租户管理|集团日志".split("|");
const analyticsSections = ["解决率", "转人工原因分布", "Top 问题", "分析表"];
const kpiLabels =
  "解决率|转人工率|SLA 达标|AI 成本/日|草稿采纳|订单查询|知识健康|队列7日通过|蒸馏频率|真实流量基线".split("|");
const dimensionLabels = "成员|AI 成员|渠道|意图|时间粒度|订单状态|转人工原因".split("|");
const runtimeLabels =
  "degraded|mock|browser-local only|no production analytics metrics|no export file write|no analytics runtime|no audit write".split("|");

mkdirSync(artifactDir, { recursive: true });

test.beforeEach(async ({ page }) => {
  await page.route("**/conversation-ticket/conversations", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
  await page.route("**/confirmation-queue/items?status=pending", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
});

test("captures owner source and React tenant analytics source parity refresh", async ({
  page
}) => {
  const mapping = writeSourceMappingSummary();
  expect(mapping.unpacked.rangeLabels).toEqual(["今日", "近 7 日", "近 30 日"]);
  expect(mapping.unpacked.dimensionLabels).toEqual(dimensionLabels);
  expect(mapping.unpacked.pageHasStructuredPanels).toBe(true);

  const ownerDefault = await captureOwnerAnalytics(page);
  expect(ownerDefault.contains.title).toBe(true);
  expect(ownerDefault.contains.analyticsSections).toBe(true);

  await page.setViewportSize({ width: 1440, height: 900 });
  await openAnalytics(page);
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "tenant"
  );
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.analytics"
  );
  await expect(page.getByTestId("m7-analytics-page")).toHaveAttribute(
    "data-selected-tenant-id",
    "tenant-b"
  );
  await expect(page.getByTestId("m7-analytics-page")).not.toContainText(
    "tenant-b · tenant layer"
  );
  await expect(
    page.getByRole("button", { exact: true, name: "近 7 日" })
  ).toBeVisible();
  await expect(
    page.getByRole("button", { exact: true, name: "近 30 日" })
  ).toBeVisible();
  await expectLayerNav(page);
  const runtimeNoteText =
    (await page.getByTestId("m7-analytics-runtime-note").textContent()) ?? "";
  for (const label of runtimeLabels) {
    expect(runtimeNoteText).toContain(label);
  }
  for (const label of analyticsSections) {
    await expect(page.getByTestId("m7-analytics-page")).toContainText(label);
  }
  await expectKpiLabelsPure(page);
  await expectDefaultRuntimeLabelsHidden(page);
  const desktopMetrics = await collectAnalyticsMetrics(page);
  expect(desktopMetrics.shellLevel).toBe("tenant");
  expect(desktopMetrics.activePageId).toBe("tenant.analytics");
  expect(desktopMetrics.viewportWidth).toBe(1440);
  expect(desktopMetrics.navWidth).toBe(232);
  expect(desktopMetrics.expectedContentWidth).toBe(1208);
  expectWidthNear(
    desktopMetrics.analyticsRootWidth,
    desktopMetrics.expectedContentWidth
  );
  expectWidthNear(
    desktopMetrics.analyticsHeaderWidth,
    desktopMetrics.analyticsRootWidth
  );
  expectWidthNear(
    desktopMetrics.analyticsBodyWidth,
    desktopMetrics.analyticsRootWidth
  );
  expect(desktopMetrics.kpiGridWidth).toBeGreaterThanOrEqual(1150);
  expect(desktopMetrics.kpiFirstRowCount).toBeGreaterThanOrEqual(7);
  expect(desktopMetrics.topbarHeight).toBeGreaterThanOrEqual(52);
  expect(desktopMetrics.topbarHeight).toBeLessThanOrEqual(53);
  expect(desktopMetrics.kpiCount).toBe(10);
  expect(desktopMetrics.runtimeLabelsPresent).toBe(true);
  expect(desktopMetrics.runtimeLabelsVisibleInBody).toBe(false);
  expect(desktopMetrics.runtimeNoteVisible).toBe(false);
  expect(desktopMetrics.tenantCategories).toEqual(tenantSections);
  expect(desktopMetrics.groupLabelsPresent).toBe(false);
  await saveShot(page, "react-analytics-desktop-default.png", true);

  await page.getByRole("button", { name: "添加维度" }).click();
  await expectDimensionMenu(page);
  await page
    .getByTestId("m7-analytics-dim-menu")
    .getByRole("button", { exact: true, name: "AI 成员" })
    .click();
  await page
    .getByTestId("m7-analytics-dim-menu")
    .getByRole("button", { exact: true, name: "订单状态" })
    .click();
  await expect(page.getByTestId("m7-analytics-active-dims")).toContainText("AI 成员");
  await expect(page.getByTestId("m7-analytics-active-dims")).toContainText("订单状态");
  await expect(page.getByTestId("m7-analytics-table")).toContainText("玉珠客服·主理");
  await expect(page.getByTestId("m7-analytics-table")).toContainText("待发货");
  const localStateMetrics = await collectAnalyticsMetrics(page);
  expect(localStateMetrics.dimensionMenuCount).toBe(7);
  expect(localStateMetrics.activeDimensionLabels).toEqual(["AI 成员", "订单状态"]);
  expect(localStateMetrics.runtimeLabelsVisibleInBody).toBe(false);
  await saveShot(page, "react-analytics-local-dimensions.png", true);

  await page.getByRole("button", { name: "Collapse navigation" }).click();
  const collapsedMetrics = await collectAnalyticsMetrics(page);
  expect(collapsedMetrics.navWidth).toBe(68);
  expect(collapsedMetrics.expectedContentWidth).toBe(1372);
  expectWidthNear(
    collapsedMetrics.analyticsRootWidth,
    collapsedMetrics.expectedContentWidth
  );
  expect(collapsedMetrics.kpiFirstRowCount).toBeGreaterThanOrEqual(7);
  expect(collapsedMetrics.runtimeLabelsVisibleInBody).toBe(false);
  await saveShot(page, "react-analytics-collapsed-sidebar.png", true);

  await page.getByTestId("m7-analytics-export").click();
  await expect(page.getByTestId("m7-analytics-toast")).toContainText(
    "no export file write"
  );
  await expect(page.getByTestId("m7-analytics-toast")).toContainText("no audit write");

  await page.setViewportSize({ width: 320, height: 900 });
  await openAnalytics(page);
  await expect(page.getByTestId("m7-analytics-page")).toBeVisible();
  await expectKpiLabelsPure(page);
  await expectDefaultRuntimeLabelsHidden(page);
  const mobileMetrics = await collectAnalyticsMetrics(page);
  expect(mobileMetrics.bodyScrollWidth).toBeLessThanOrEqual(320);
  expect(mobileMetrics.documentScrollWidth).toBeLessThanOrEqual(320);
  expect(mobileMetrics.analyticsRootWidth).toBeLessThanOrEqual(320);
  expect(mobileMetrics.kpiFirstRowCount).toBe(1);
  expect(mobileMetrics.runtimeLabelsVisibleInBody).toBe(false);
  await saveShot(page, "react-analytics-mobile-320.png", true);

  writeJson("metrics.json", {
    collapsed: collapsedMetrics,
    desktop: desktopMetrics,
    localState: localStateMetrics,
    mobile: mobileMetrics,
    ownerDefault,
    sourceMapping: mapping
  });
});

async function captureOwnerAnalytics(page: Page) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(pathToFileURL(ownerHtml).toString());
  await page.waitForLoadState("domcontentloaded");
  await clickFirstVisibleText(page, "分析");
  await page.waitForTimeout(500);
  await saveShot(page, "owner-html-analytics-desktop.png", true);
  const sample = await collectOwnerAnalyticsSample(page);
  writeJson("owner-html-analytics-rendered-sample.json", sample);
  return sample;
}

async function clickFirstVisibleText(page: Page, text: string) {
  const target = page.getByText(text, { exact: true }).first();
  try {
    await target.click({ timeout: 3000 });
  } catch {
    // Owner HTML may already be on the target page when this helper is reused.
  }
}

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

async function expectLayerNav(page: Page) {
  const nav = page.getByTestId("app-shell-nav");
  await expect
    .poll(() => nav.locator(".uz-nav-group p").allTextContents())
    .toEqual(tenantSections);
  for (const label of tenantLabels) {
    await expect(nav.getByRole("button", { exact: true, name: label })).toBeVisible();
  }
  for (const label of groupLabels) {
    await expect(nav.getByRole("button", { exact: true, name: label })).toHaveCount(0);
  }
  for (const label of groupSections) {
    await expect(nav.locator(".uz-nav-group p").filter({ hasText: label })).toHaveCount(
      0
    );
  }
}

async function expectDimensionMenu(page: Page) {
  const menu = page.getByTestId("m7-analytics-dim-menu");
  for (const label of dimensionLabels) {
    await expect(menu.getByRole("button", { exact: true, name: label })).toBeVisible();
  }
}

async function expectKpiLabelsPure(page: Page) {
  await expect(page.getByTestId("m7-analytics-kpis")).toHaveAttribute(
    "data-runtime-boundary",
    /no production analytics metrics/
  );
  expect(
    await page.locator(".uz-analytics-kpi span").evaluateAll((nodes) =>
      nodes.map((node) => node.textContent?.trim() ?? "")
    )
  ).toEqual(kpiLabels);
  const visibleKpiText = await page.getByTestId("m7-analytics-kpis").innerText();
  expect(visibleKpiText).not.toContain("mock/degraded");
  expect(visibleKpiText).not.toContain("no production analytics metrics");
}

async function expectDefaultRuntimeLabelsHidden(page: Page) {
  const visibleText = await page.getByTestId("m7-analytics-page").innerText();
  expect(visibleText).not.toContain(
    "mock/degraded · no production analytics metrics"
  );
  expect(visibleText).not.toContain("no production analytics metrics");
}

function expectWidthNear(actual: number, expected: number, delta = 2) {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(delta);
}

async function collectOwnerAnalyticsSample(page: Page) {
  return page.evaluate((sections) => {
    const text = document.body.innerText.replace(/\s+/g, " ").trim();
    const panelTerms = ["今日", "近 7 日", "近 30 日", "添加维度", "导出"];
    const tableHeaders = Array.from(document.querySelectorAll("th")).map((node) =>
      (node.textContent ?? "").trim()
    );
    const tableCells = Array.from(document.querySelectorAll("td")).map((node) =>
      (node.textContent ?? "").trim()
    );
    return {
      bodyTextLength: text.length,
      contains: {
        analyticsSections: sections.every((label: string) => text.includes(label)),
        blankRenderedTable:
          tableHeaders.length > 0 &&
          tableCells.length > 0 &&
          tableHeaders.every((value) => value === "") &&
          tableCells.every((value) => value === ""),
        panelTerms: panelTerms.every((label) => text.includes(label)),
        title: text.includes("分析")
      },
      sample: text.slice(0, 1600),
      tableCellTexts: tableCells.slice(0, 40),
      tableHeaderTexts: tableHeaders
    };
  }, analyticsSections);
}

async function collectAnalyticsMetrics(page: Page) {
  const nav = page.getByTestId("app-shell-nav");
  const sidebarCategories = await nav.locator(".uz-nav-group p").allTextContents();
  const navButtons = await nav.getByRole("button").allTextContents();
  const navWidth = await nav.evaluate((node) =>
    Math.round(node.getBoundingClientRect().width)
  );
  const fullText = await page
    .locator("body")
    .evaluate((node) => node.textContent ?? "");
  const visibleText = await page.locator("body").innerText();
  const geometry = await page.evaluate(() => {
    const widthOf = (selector: string) => {
      const node = document.querySelector(selector);
      return node ? Math.round(node.getBoundingClientRect().width) : 0;
    };
    const cards = Array.from(document.querySelectorAll(".uz-analytics-kpi")).map(
      (node) => Math.round(node.getBoundingClientRect().top)
    );
    const firstTop = cards[0] ?? 0;
    return {
      analyticsBodyWidth: widthOf(".uz-analytics-body"),
      analyticsHeaderWidth: widthOf(".uz-analytics-head"),
      analyticsRootWidth: widthOf(".uz-analytics-page"),
      kpiFirstRowCount: cards.filter((top) => Math.abs(top - firstTop) <= 1)
        .length,
      kpiGridWidth: widthOf(".uz-analytics-kpis"),
      viewportWidth: window.innerWidth
    };
  });
  const runtimeNote = page.getByTestId("m7-analytics-runtime-note");
  const dimensionMenu = page.getByTestId("m7-analytics-dim-menu");
  const activeDimensionLabels =
    (await page.getByTestId("m7-analytics-active-dims").count()) > 0
      ? (
          await page
            .getByTestId("m7-analytics-active-dims")
            .locator(".uz-analytics-chip")
            .allTextContents()
        ).map((value) => value.replace("×", "").trim())
      : [];
  return {
    activeDimensionLabels,
    activePageId: await page
      .getByTestId("admin-shell")
      .getAttribute("data-active-page-id"),
    ...geometry,
    bodyScrollWidth: await page.evaluate(() => document.body.scrollWidth),
    documentScrollWidth: await page.evaluate(
      () => document.documentElement.scrollWidth
    ),
    expectedContentWidth: geometry.viewportWidth - navWidth,
    groupLabelsPresent: groupLabels.some((label) => navButtons.includes(label)),
    hasAnalyticsTable: (await page.getByTestId("m7-analytics-table").count()) > 0,
    hasHandoffPanel: (await page.getByTestId("m7-analytics-handoff").count()) > 0,
    hasTopIssues: (await page.getByTestId("m7-analytics-top-issues").count()) > 0,
    kpiCount: await page.locator(".uz-analytics-kpi").count(),
    navWidth,
    runtimeLabelsPresent: runtimeLabels.every((label) => fullText.includes(label)),
    runtimeLabelsVisibleInBody: runtimeLabels.some((label) =>
      visibleText.includes(label)
    ),
    runtimeNoteVisible: await runtimeNote.evaluate((node) => {
      const rect = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      return (
        style.visibility !== "hidden" &&
        style.display !== "none" &&
        Math.round(rect.width) > 1 &&
        Math.round(rect.height) > 1
      );
    }),
    shellLevel: await page.getByTestId("admin-shell").getAttribute("data-shell-level"),
    tenantCategories: sidebarCategories,
    topbarHeight: await page
      .locator(".uz-topbar")
      .evaluate((node) => Math.round(node.getBoundingClientRect().height)),
    visibleHasTenantBadge: visibleText.includes("tenant-b · tenant layer"),
    dimensionMenuCount:
      (await dimensionMenu.count()) > 0
        ? await dimensionMenu.getByRole("button").count()
        : 0
  };
}

async function saveShot(page: Page, name: string, fullPage = false) {
  await page.screenshot({ fullPage, path: `${artifactDir}/${name}` });
}

function writeJson(name: string, value: unknown) {
  writeFileSync(`${artifactDir}/${name}`, `${JSON.stringify(value, null, 2)}\n`);
}

function writeSourceMappingSummary() {
  const pageSource = readFileSync(sourceFiles.page, "utf8");
  const fixtureSource = readFileSync(sourceFiles.fixtures, "utf8");
  const mapping = {
    files: sourceFiles,
    reactFollows:
      "rendered-owner-html-first-then-unpacked-analytics-source-for-structured-details",
    unpacked: {
      dimensionLabels,
      fixtureHasOrderStatus: fixtureSource.includes("orderStatus"),
      fixtureHasSourceAgentName: fixtureSource.includes("玉珠客服·主理"),
      pageHasDimensionLimit: pageSource.includes("最多 2"),
      pageHasStructuredPanels:
        pageSource.includes("转人工原因分布") &&
        pageSource.includes("Top 问题") &&
        pageSource.includes("分析表"),
      rangeLabels: ["今日", "近 7 日", "近 30 日"]
    }
  };
  writeJson("unpacked-analytics-source-mapping.json", mapping);
  return mapping;
}
