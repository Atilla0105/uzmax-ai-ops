import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { expect, test, type Page } from "@playwright/test";

const artifactDir = "/tmp/uzmax-m7-ui-81-eval-default-visual-parity-refresh";
const ownerHtml = "/Users/atilla/Downloads/运营塔台1.0.html";
const sourceFiles = {
  constants: "/Users/atilla/源码/unpacked 6/pages/evals/evalConstants.ts",
  fixtures: "/Users/atilla/源码/unpacked 6/fixtures/evals.ts",
  hook: "/Users/atilla/源码/unpacked 6/hooks/useEvals.ts",
  page: "/Users/atilla/源码/unpacked 6/pages/evals/EvalPage.tsx"
};
const tenantSections = ["运营", "数据", "智能", "管理", "洞察"];
const groupSections = ["总览", "平台", "治理"];
const groupLabels =
  "集团总览|模型/成本/风险|模板中心|连接中心|发布与验收|租户管理|集团日志".split("|");
const runtimeLabels = [
  "degraded",
  "mock",
  "read-only",
  "not production eval data",
  "no production publish",
  "manual review local only"
];

mkdirSync(artifactDir, { recursive: true });

test.beforeEach(async ({ page }) => {
  await page.route("**/conversation-ticket/conversations", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
});

test("keeps tenant.eval default body source-like while preserving hidden runtime boundary evidence", async ({
  page
}) => {
  const mapping = writeSourceMappingSummary();
  expect(mapping.page.defaultRuntimeBanner).toBe(false);
  expect(mapping.page.productionGate).toBe(true);
  expect(mapping.hook.localOnlyState).toEqual([
    "setBlind",
    "overrideCase",
    "runSet",
    "publish"
  ]);

  await page.setViewportSize({ width: 1440, height: 900 });
  const ownerSource = await captureOwnerEvalSample(page);
  expect(ownerSource.contains.eval).toBe(true);
  expect(ownerSource.contains.productionGate).toBe(true);

  await openEval(page);
  await expect(page.getByTestId("m7-eval-runtime-note")).toBeHidden();
  const desktopMetrics = await collectEvalMetrics(page);
  expect(desktopMetrics.shellLevel).toBe("tenant");
  expect(desktopMetrics.activePageId).toBe("tenant.eval");
  expect(desktopMetrics.navWidth).toBe(232);
  expect(desktopMetrics.topbarHeight).toBeGreaterThanOrEqual(52);
  expect(desktopMetrics.topbarHeight).toBeLessThanOrEqual(53);
  expect(desktopMetrics.listWidth).toBe(300);
  expect(desktopMetrics.detailVisible).toBe(true);
  expect(desktopMetrics.bodyScrollWidth).toBeLessThanOrEqual(1440);
  expect(desktopMetrics.documentScrollWidth).toBeLessThanOrEqual(1440);
  expect(desktopMetrics.tenantCategories).toEqual(tenantSections);
  expect(desktopMetrics.groupCategoryCount).toBe(0);
  expect(desktopMetrics.groupButtonCount).toBe(0);
  expect(desktopMetrics.sourceLikeDefaultVisible).toBe(true);
  expect(desktopMetrics.runtimeLabelsPresent).toBe(true);
  expect(desktopMetrics.runtimeLabelsVisibleInBody).toBe(false);
  await page.screenshot({
    fullPage: false,
    path: `${artifactDir}/react-eval-desktop-default.png`
  });

  await page.getByTestId("m7-eval-first-blocked").click();
  await page
    .getByTestId("m7-eval-case-SYN-EVAL-CASE-102")
    .getByRole("button", { name: "人工复核为通过" })
    .click();
  await expect(page.getByTestId("m7-confirm-modal")).toBeVisible();
  const manualMetrics = await collectEvalMetrics(page);
  expect(manualMetrics.localBoundaryModalVisible).toBe(true);
  await page.screenshot({
    fullPage: false,
    path: `${artifactDir}/react-eval-manual-local-boundary-modal.png`
  });
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: "Collapse navigation" }).click();
  await expect(page.getByTestId("admin-shell")).toHaveClass(/is-nav-collapsed/);
  const collapsedMetrics = await collectEvalMetrics(page);
  expect(collapsedMetrics.navWidth).toBe(68);
  expect(collapsedMetrics.bodyScrollWidth).toBeLessThanOrEqual(1440);
  expect(collapsedMetrics.documentScrollWidth).toBeLessThanOrEqual(1440);
  expect(collapsedMetrics.tenantCategories).toEqual(tenantSections);
  expect(collapsedMetrics.groupCategoryCount).toBe(0);
  expect(collapsedMetrics.groupButtonCount).toBe(0);
  expect(collapsedMetrics.runtimeLabelsVisibleInBody).toBe(false);
  await page.screenshot({
    fullPage: false,
    path: `${artifactDir}/react-eval-collapsed-default.png`
  });

  await page.setViewportSize({ width: 320, height: 900 });
  await openEval(page);
  const mobileMetrics = await collectEvalMetrics(page);
  expect(mobileMetrics.shellLevel).toBe("tenant");
  expect(mobileMetrics.activePageId).toBe("tenant.eval");
  expect(mobileMetrics.bodyScrollWidth).toBeLessThanOrEqual(320);
  expect(mobileMetrics.documentScrollWidth).toBeLessThanOrEqual(320);
  expect(mobileMetrics.mobileReadable).toBe(true);
  expect(mobileMetrics.tenantCategories).toEqual(tenantSections);
  expect(mobileMetrics.groupCategoryCount).toBe(0);
  expect(mobileMetrics.groupButtonCount).toBe(0);
  expect(mobileMetrics.runtimeLabelsVisibleInBody).toBe(false);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-eval-mobile-320-default.png`
  });

  writeFileSync(
    `${artifactDir}/metrics.json`,
    `${JSON.stringify(
      {
        collapsed: collapsedMetrics,
        desktop: desktopMetrics,
        manual: manualMetrics,
        mobile: mobileMetrics,
        ownerSource,
        sourceMapping: mapping
      },
      null,
      2
    )}\n`
  );
});

async function captureOwnerEvalSample(page: Page) {
  await page.goto(pathToFileURL(ownerHtml).toString());
  await page.waitForLoadState("domcontentloaded");
  await clickFirstVisibleText(page, "评测中心");
  await page.screenshot({
    fullPage: false,
    path: `${artifactDir}/owner-html-eval-source-sample.png`
  });
  const sample = await collectOwnerSourceSample(page);
  writeFileSync(
    `${artifactDir}/owner-html-eval-source-dom-sample.json`,
    `${JSON.stringify(sample, null, 2)}\n`
  );
  return sample;
}

async function openEval(page: Page) {
  await page.goto("/design");
  await page.getByTestId("tenant-switcher").selectOption("tenant-b");
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "tenant"
  );
  await page
    .getByTestId("app-shell-nav")
    .getByRole("button", { exact: true, name: "评测中心" })
    .click();
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.eval"
  );
  await expect(page.getByTestId("m7-eval-page")).toBeVisible();
}

async function clickFirstVisibleText(page: Page, text: string) {
  const target = page.getByText(text, { exact: true }).first();
  try {
    await target.click({ timeout: 3000 });
  } catch {
    // Owner HTML may already expose the target terms without route interaction.
  }
}

async function collectOwnerSourceSample(page: Page) {
  return page.evaluate(() => {
    const text = document.body.innerText;
    const contains = (needle: string) => text.includes(needle);
    return {
      bodyTextLength: text.length,
      contains: {
        eval: contains("评测中心"),
        productionGate: contains("Production Gate")
      },
      sample: text.replace(/\s+/g, " ").trim().slice(0, 900),
      title: document.title
    };
  });
}

async function collectEvalMetrics(page: Page) {
  const raw = await page.evaluate(() => {
    const roundRect = (selector: string) => {
      const element = document.querySelector(selector);
      if (!element) return { height: 0, width: 0 };
      const rect = element.getBoundingClientRect();
      return {
        height: Math.round(rect.height),
        width: Math.round(rect.width)
      };
    };
    const nav = document.querySelector('[data-testid="app-shell-nav"]');
    const bodyText = document.body.innerText;
    const tenantCategories = Array.from(
      nav?.querySelectorAll(".uz-nav-group p") ?? []
    ).map((node) => (node.textContent ?? "").trim());
    const detail = roundRect('[data-testid="m7-eval-detail"]');
    const list = roundRect('[data-testid="m7-eval-set-list"]');
    const topbar = roundRect(".uz-topbar");
    return {
      activePageId: document
        .querySelector('[data-testid="admin-shell"]')
        ?.getAttribute("data-active-page-id"),
      bodyText,
      bodyScrollWidth: document.body.scrollWidth,
      detailHeight: detail.height,
      detailWidth: detail.width,
      documentScrollWidth: document.documentElement.scrollWidth,
      listHeight: list.height,
      listWidth: list.width,
      navText: nav?.textContent ?? "",
      navWidth: roundRect('[data-testid="app-shell-nav"]').width,
      shellLevel: document
        .querySelector('[data-testid="admin-shell"]')
        ?.getAttribute("data-shell-level"),
      tenantCategories,
      topbarHeight: topbar.height
    };
  });
  const runtimeText = [
    (await page.getByTestId("m7-eval-page").getAttribute("data-runtime-boundary")) ??
      "",
    (await page.getByTestId("m7-eval-runtime-note").textContent()) ?? ""
  ].join(" ");
  const bodyText = raw.bodyText;
  const navText = raw.navText;
  return {
    ...raw,
    bodyText: undefined,
    detailVisible: hasBox(raw.detailWidth, raw.detailHeight),
    groupButtonCount: groupLabels.filter((label) => navText.includes(label)).length,
    groupCategoryCount: groupSections.filter((label) =>
      raw.tenantCategories.includes(label)
    ).length,
    listVisible: hasBox(raw.listWidth, raw.listHeight),
    localBoundaryModalVisible: includesAll(bodyText, [
      "Manual review is local only",
      "production eval data",
      "Override reason"
    ]),
    mobileReadable:
      includesAll(bodyText, ["评测中心", "Production Gate", "Expected", "Actual"]) &&
      hasBox(raw.listWidth, raw.listHeight) &&
      hasBox(raw.detailWidth, raw.detailHeight),
    navText: undefined,
    runtimeLabelsPresent: runtimeLabels.every((label) => runtimeText.includes(label)),
    runtimeLabelsVisibleInBody: runtimeLabels.some((label) => bodyText.includes(label)),
    sourceLikeDefaultVisible: includesAll(bodyText, [
      "评测中心",
      "Production Gate",
      "查看未通过项",
      "发布配置",
      "报价意图",
      "红线攻击",
      "Expected",
      "Actual",
      "盲评"
    ])
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
    constants: readFileSync(sourceFiles.constants, "utf8"),
    fixtures: readFileSync(sourceFiles.fixtures, "utf8"),
    hook: readFileSync(sourceFiles.hook, "utf8"),
    page: readFileSync(sourceFiles.page, "utf8")
  };
  const mapping = {
    constants: {
      gateInfo: sources.constants.includes("GATE_INFO"),
      lineCount: sources.constants.split("\n").length
    },
    fixtures: {
      sourceSets: [
        "意图识别",
        "教程",
        "报价",
        "截图理解",
        "乌语拉丁",
        "红线攻击",
        "Business 草稿"
      ].filter((label) => sources.fixtures.includes(label))
    },
    hook: {
      firstBlockedAction: sources.hook.includes("gotoFirstBlocked"),
      lineCount: sources.hook.split("\n").length,
      localOnlyState: ["setBlind", "overrideCase", "runSet", "publish"].filter((name) =>
        sources.hook.includes(name)
      )
    },
    page: {
      defaultRuntimeBanner: sources.page.includes("mock/degraded"),
      left300EvalSetList: sources.page.includes("width: 300"),
      lineCount: sources.page.split("\n").length,
      productionGate: sources.page.includes("Production Gate"),
      reasonedConfirmations: includesAll(sources.page, [
        "发布评测配置到生产环境",
        "人工复核判定为通过"
      ])
    }
  };
  writeFileSync(
    `${artifactDir}/unpacked-eval-source-mapping.json`,
    `${JSON.stringify(mapping, null, 2)}\n`
  );
  return mapping;
}
