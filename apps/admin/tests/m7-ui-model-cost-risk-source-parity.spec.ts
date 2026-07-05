import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { expect, test, type Page } from "@playwright/test";

const artifactDir = "/tmp/uzmax-m7-ui-70-model-cost-risk-source-parity-refresh";
const ownerHtml = "/Users/atilla/Downloads/运营塔台1.0.html";
const sourceFiles = {
  fixtures: "/Users/atilla/源码/unpacked 6/fixtures/groupModel.ts",
  page: "/Users/atilla/源码/unpacked 6/pages/group/GroupModelPage.tsx"
};
const groupSections = ["总览", "平台", "治理"];
const tenantSections = ["运营", "数据", "智能", "管理", "洞察"];
const tenantLabels =
  "对话|工单|确认队列|客户资产|订单|知识与资源|评测中心|AI 成员|团队|配置|分析|日志".split(
    "|"
  );
const runtimeLabels = [
  "degraded",
  "mock",
  "read-only",
  "not production cost metrics",
  "no production model routing",
  "local action only"
];
const sourceTaskLabels = "意图识别|教程问答|报价计算|截图理解|乌语翻译|红线检查".split(
  "|"
);

interface RawModelMetrics {
  activePageId?: string | null;
  hiddenBoundary?: string | null;
  bodyText: string;
  bodyScrollWidth: number;
  costHeight: number;
  costTop: number;
  costWidth: number;
  documentScrollWidth: number;
  kpiCount: number;
  kpiGridHeight: number;
  kpiGridTop: number;
  kpiGridWidth: number;
  matrixHeight: number;
  matrixTop: number;
  matrixWidth: number;
  navButtonLabels: string[];
  navWidth: number;
  pageHeight: number;
  pageWidth: number;
  riskHeight: number;
  riskTop: number;
  riskWidth: number;
  shellLevel?: string | null;
  tenantCategories: string[];
  topbarHeight: number;
  viewportWidth: number;
}

mkdirSync(artifactDir, { recursive: true });

test.beforeEach(async ({ page }) => {
  await page.route("**/conversation-ticket/conversations", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
});

test("captures group.modelRisk source parity evidence on latest visible stack", async ({
  page
}) => {
  const sourceMapping = writeSourceMappingSummary();
  expect(sourceMapping.anatomy.title).toBe(true);
  expect(sourceMapping.anatomy.exportCost).toBe(true);
  expect(sourceMapping.anatomy.kpiGrid).toBe(true);
  expect(sourceMapping.anatomy.fullWidthMatrixBeforeLowerPanels).toBe(true);
  expect(sourceMapping.anatomy.costByTenant).toBe(true);
  expect(sourceMapping.anatomy.riskQueue).toBe(true);
  expect(sourceMapping.anatomy.localModelSwitch).toBe(true);
  expect(sourceMapping.anatomy.localRiskResolve).toBe(true);

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(pathToFileURL(ownerHtml).toString());
  await page.waitForLoadState("domcontentloaded");
  await clickFirstVisibleText(page, "集团");
  await clickFirstVisibleText(page, "模型/成本/风险");
  const ownerSource = await collectOwnerSourceSample(page);
  expect(ownerSource.bodyTextLength).toBeGreaterThan(100);
  expect(ownerSource.contains.modelCostRisk).toBe(true);
  await saveShot(page, "owner-html-model-cost-risk-source-sample.png");
  writeJson("owner-html-model-cost-risk-source-dom-sample.json", ownerSource);

  await page.goto("/design");
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

  await expect(page.getByText("模型 / 成本 / 风险")).toBeVisible();
  await expect(page.getByText("集团级 · 实时")).toBeVisible();
  await expect(page.getByTestId("m7-model-export")).toContainText("导出成本");
  await expect(page.getByTestId("m7-model-runtime-note")).toHaveAttribute(
    "data-boundary",
    runtimeLabels.join("|")
  );
  for (const label of sourceTaskLabels)
    await expect(page.getByTestId("m7-model-matrix")).toContainText(label);
  await expect(page.getByTestId("m7-model-matrix")).toContainText("gpt-4o-mini");
  await expect(page.getByTestId("m7-model-matrix")).toContainText("qwen2.5-7b");
  await expect(page.getByTestId("m7-model-cost")).toContainText(
    "成本构成 · 按租户（今日 ¥418）"
  );
  await expect(page.getByTestId("m7-model-risk")).toContainText("恢复确认");
  await expect(page.getByTestId("m7-model-risk")).toContainText("查看明细");
  await expect(page.getByTestId("m7-model-risk")).toContainText("查看会话");
  await expect(
    page.getByTestId("m7-model-risk-SYN-MODEL-RISK-abnormal-cost")
  ).not.toContainText("范围 ·");
  await expect(
    page.getByTestId("m7-model-risk-SYN-MODEL-RISK-false-positive")
  ).not.toContainText("范围 ·");

  const desktopMetrics = await collectModelMetrics(page);
  expect(desktopMetrics.shellLevel).toBe("group");
  expect(desktopMetrics.activePageId).toBe("group.modelRisk");
  expect(desktopMetrics.navWidth).toBe(232);
  expect(desktopMetrics.topbarHeight).toBeGreaterThanOrEqual(52);
  expect(desktopMetrics.topbarHeight).toBeLessThanOrEqual(53);
  expect(desktopMetrics.kpiCount).toBe(5);
  expect(desktopMetrics.tenantCategories).toEqual(groupSections);
  expect(desktopMetrics.tenantCategoryCount).toBe(0);
  expect(desktopMetrics.tenantButtonCount).toBe(0);
  expect(desktopMetrics.runtimeLabelsHidden).toBe(true);
  expect(desktopMetrics.sourceLikeDefaultVisible).toBe(true);
  expect(desktopMetrics.fullWidthMatrixAnatomy).toBe(true);
  expect(desktopMetrics.bodyScrollWidth).toBeLessThanOrEqual(1440);
  expect(desktopMetrics.documentScrollWidth).toBeLessThanOrEqual(1440);
  await saveShot(page, "react-model-cost-risk-desktop.png", true);

  await page.getByTestId("m7-model-export").click();
  await expect(page.getByTestId("m7-model-toast")).toContainText("local-only");
  await expect(page.getByTestId("m7-model-toast")).toContainText(
    "no production CSV export"
  );

  const intentRow = page.getByTestId("m7-model-task-SYN-MODEL-TASK-intent");
  const switchButton = page.getByTestId("m7-model-task-switch-SYN-MODEL-TASK-intent");
  await expect(intentRow.locator("td").nth(1)).toContainText("gpt-4o-mini");
  await expect(switchButton).toHaveAttribute("aria-pressed", "false");
  await switchButton.focus();
  await page.keyboard.press("Enter");
  await expect(switchButton).toHaveAttribute("aria-pressed", "true");
  await expect(intentRow.locator("td").nth(1)).toContainText("qwen2.5-7b");
  await expect(page.getByTestId("m7-model-toast")).toContainText(
    "no production model routing"
  );

  const downKpi = page.getByTestId("m7-model-kpi-SYN-MODEL-KPI-down");
  await expect(downKpi).toContainText("1");
  await page.getByTestId("m7-model-resolve-SYN-MODEL-RISK-all-providers-down").click();
  await expect(
    page.getByTestId("m7-model-risk-SYN-MODEL-RISK-all-providers-down")
  ).toHaveCount(0);
  await expect(downKpi).toContainText("0");
  await expect(page.getByTestId("m7-model-toast")).toContainText(
    "no production provider health"
  );
  await expect(page.getByTestId("m7-model-toast")).toContainText("audit closure");
  const actionMetrics = await collectModelMetrics(page);
  expect(actionMetrics.sourceLikeLocalSwitchVisible).toBe(true);
  expect(actionMetrics.sourceLikeLocalResolveVisible).toBe(true);
  await saveShot(page, "react-model-cost-risk-local-actions.png", true);

  await page.getByRole("button", { name: "Collapse navigation" }).click();
  await expect(page.getByTestId("admin-shell")).toHaveClass(/is-nav-collapsed/);
  const collapsedMetrics = await collectModelMetrics(page);
  expect(collapsedMetrics.navWidth).toBe(68);
  expect(collapsedMetrics.tenantCategories).toEqual(groupSections);
  expect(collapsedMetrics.tenantCategoryCount).toBe(0);
  expect(collapsedMetrics.tenantButtonCount).toBe(0);
  expect(collapsedMetrics.bodyScrollWidth).toBeLessThanOrEqual(1440);
  expect(collapsedMetrics.documentScrollWidth).toBeLessThanOrEqual(1440);
  await saveShot(page, "react-model-cost-risk-collapsed.png", true);

  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/design");
  await openModel(page);
  const mobileMetrics = await collectModelMetrics(page);
  expect(mobileMetrics.shellLevel).toBe("group");
  expect(mobileMetrics.activePageId).toBe("group.modelRisk");
  expect(mobileMetrics.bodyScrollWidth).toBeLessThanOrEqual(320);
  expect(mobileMetrics.documentScrollWidth).toBeLessThanOrEqual(320);
  expect(mobileMetrics.mobileReadable).toBe(true);
  expect(mobileMetrics.tenantCategories).toEqual(groupSections);
  expect(mobileMetrics.tenantCategoryCount).toBe(0);
  expect(mobileMetrics.tenantButtonCount).toBe(0);
  await saveShot(page, "react-model-cost-risk-mobile-320.png", true);

  writeJson("metrics.json", {
    actions: actionMetrics,
    collapsed: collapsedMetrics,
    desktop: desktopMetrics,
    mobile: mobileMetrics
  });
});

async function saveShot(page: Page, name: string, fullPage = false) {
  await page.screenshot({ fullPage, path: `${artifactDir}/${name}` });
}

function writeJson(name: string, value: unknown) {
  writeFileSync(`${artifactDir}/${name}`, `${JSON.stringify(value, null, 2)}\n`);
}

async function openModel(page: Page) {
  await page
    .getByTestId("app-shell-nav")
    .getByRole("button", { exact: true, name: "模型/成本/风险" })
    .click();
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "group.modelRisk"
  );
  await expect(page.getByTestId("m7-model-page")).toBeVisible();
}

async function clickFirstVisibleText(page: Page, text: string) {
  const target = page.getByText(text, { exact: true }).first();
  try {
    await target.click({ timeout: 3000 });
  } catch {
    // The bundled owner HTML may already expose the target text without route click.
  }
}

async function collectOwnerSourceSample(page: Page) {
  return page.evaluate(() => {
    const text = document.body.innerText;
    const contains = (needle: string) => text.includes(needle);
    return {
      bodyTextLength: text.length,
      contains: {
        costByTenant: contains("成本构成"),
        exportCost: contains("导出成本"),
        modelCostRisk: contains("模型/成本/风险") || contains("模型 / 成本 / 风险"),
        riskQueue: contains("风险队列")
      },
      sample: text.replace(/\s+/g, " ").trim().slice(0, 900),
      title: document.title
    };
  });
}

async function collectModelMetrics(page: Page) {
  const raw = await page.evaluate<RawModelMetrics>(() => {
    const rectFor = (selector: string) => {
      const element = document.querySelector(selector);
      if (!element) return { height: 0, top: 0, width: 0 };
      const rect = element.getBoundingClientRect();
      return {
        height: Math.round(rect.height),
        top: Math.round(rect.top),
        width: Math.round(rect.width)
      };
    };
    const nav = document.querySelector('[data-testid="app-shell-nav"]');
    const bodyText = document.body.innerText;
    const navButtonLabels = Array.from(nav?.querySelectorAll("button") ?? []).map(
      (node) => (node.textContent ?? "").trim()
    );
    const tenantCategories = Array.from(
      nav?.querySelectorAll(".uz-nav-group p") ?? []
    ).map((node) => (node.textContent ?? "").trim());
    const cost = rectFor('[data-testid="m7-model-cost"]');
    const kpis = rectFor(".uz-model-kpis");
    const matrix = rectFor('[data-testid="m7-model-matrix"]');
    const pageBox = rectFor('[data-testid="m7-model-page"]');
    const risk = rectFor('[data-testid="m7-model-risk"]');
    const topbar = rectFor(".uz-topbar");
    return {
      activePageId: document
        .querySelector('[data-testid="admin-shell"]')
        ?.getAttribute("data-active-page-id"),
      bodyText,
      bodyScrollWidth: document.body.scrollWidth,
      costHeight: cost.height,
      costTop: cost.top,
      costWidth: cost.width,
      documentScrollWidth: document.documentElement.scrollWidth,
      hiddenBoundary: document
        .querySelector('[data-testid="m7-model-runtime-note"]')
        ?.getAttribute("data-boundary"),
      kpiCount: document.querySelectorAll(".uz-model-kpi").length,
      kpiGridHeight: kpis.height,
      kpiGridTop: kpis.top,
      kpiGridWidth: kpis.width,
      matrixHeight: matrix.height,
      matrixTop: matrix.top,
      matrixWidth: matrix.width,
      navButtonLabels,
      navWidth: rectFor('[data-testid="app-shell-nav"]').width,
      pageHeight: pageBox.height,
      pageWidth: pageBox.width,
      riskHeight: risk.height,
      riskTop: risk.top,
      riskWidth: risk.width,
      shellLevel: document
        .querySelector('[data-testid="admin-shell"]')
        ?.getAttribute("data-shell-level"),
      tenantCategories,
      topbarHeight: topbar.height,
      viewportWidth: window.innerWidth
    };
  });
  return buildModelMetrics(raw);
}

function buildModelMetrics(raw: RawModelMetrics) {
  const bodyText = raw.bodyText;
  const navButtonLabels = raw.navButtonLabels;
  return {
    ...raw,
    bodyText: undefined,
    fullWidthMatrixAnatomy:
      raw.kpiGridTop < raw.matrixTop &&
      raw.matrixTop < raw.costTop &&
      raw.matrixTop < raw.riskTop &&
      raw.matrixWidth > raw.costWidth * 1.7 &&
      raw.matrixWidth > raw.riskWidth * 1.45,
    mobileReadable:
      includesAll(bodyText, [
        "模型 / 成本 / 风险",
        "模型任务矩阵",
        "成本构成",
        "风险队列"
      ]) &&
      hasBox(raw.matrixWidth, raw.matrixHeight) &&
      raw.matrixWidth <= raw.viewportWidth,
    navButtonLabels: undefined,
    pageVisible: hasBox(raw.pageWidth, raw.pageHeight),
    runtimeLabelsHidden: raw.hiddenBoundary === runtimeLabels.join("|"),
    sourceLikeDefaultVisible: includesAll(bodyText, [
      "集团级 · 实时",
      "导出成本",
      "模型任务矩阵",
      "成本构成 · 按租户（今日 ¥418）",
      "风险队列",
      "意图识别",
      "报价计算",
      "乌语翻译"
    ]),
    sourceLikeLocalResolveVisible: includesAll(bodyText, [
      "resolved locally",
      "no production provider health",
      "audit closure"
    ]),
    sourceLikeLocalSwitchVisible: includesAll(bodyText, ["已切换", "qwen2.5-7b"]),
    tenantButtonCount: tenantLabels.filter((label) => navButtonLabels.includes(label))
      .length,
    tenantCategoryCount: tenantSections.filter((label) =>
      raw.tenantCategories.includes(label)
    ).length
  };
}

function includesAll(text: string, labels: string[]) {
  return labels.every((label) => text.includes(label));
}

function hasBox(width: number, height: number) {
  return width > 0 && height > 0;
}

function writeSourceMappingSummary() {
  const sources: Record<keyof typeof sourceFiles, string> = {
    fixtures: readFileSync(sourceFiles.fixtures, "utf8"),
    page: readFileSync(sourceFiles.page, "utf8")
  };
  const pageIndex = (needle: string) => sources.page.indexOf(needle);
  const matrixIndex = pageIndex("模型任务矩阵");
  const costIndex = pageIndex("成本构成 · 按租户");
  const riskIndex = pageIndex("风险队列");
  const mapping = {
    anatomy: {
      costByTenant: includesAll(sources.fixtures, [
        "COST_BY_TENANT",
        "丝路数码",
        "玉珠跨境美妆",
        "天净家居",
        "白桦母婴"
      ]),
      exportCost: includesAll(sources.page, ["Download", "导出成本", "doExport"]),
      fullWidthMatrixBeforeLowerPanels:
        matrixIndex > -1 &&
        costIndex > -1 &&
        riskIndex > -1 &&
        matrixIndex < costIndex &&
        matrixIndex < riskIndex,
      kpiGrid:
        sources.page.includes("modelStats") &&
        sources.fixtures.includes("集团总成本 / 今日"),
      localModelSwitch: includesAll(sources.page, ["setSwap", "已切换"]),
      localRiskResolve:
        sources.page.includes("setResolved") && sources.fixtures.includes("恢复确认"),
      riskQueue: includesAll(sources.fixtures, ["RISK_DEFS", "恢复确认", "查看明细"]),
      title: sources.page.includes("模型 / 成本 / 风险")
    },
    filesRead: Object.values(sourceFiles),
    sourceTaskLabels: sourceTaskLabels.filter((label) =>
      sources.fixtures.includes(label)
    )
  };
  writeFileSync(
    `${artifactDir}/unpacked-model-cost-risk-source-mapping.json`,
    `${JSON.stringify(mapping, null, 2)}\n`
  );
  return mapping;
}
