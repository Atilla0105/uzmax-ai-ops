import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { expect, test, type Page } from "@playwright/test";

const artifactDir = "/tmp/uzmax-m7-ui-68-eval-center-source-parity-refresh";
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
const evalSourceTabs =
  "意图识别|教程|报价|截图理解|乌语拉丁|乌语西里尔|俄语|红线攻击|红线误报|Business 草稿".split(
    "|"
  );

interface RawEvalMetrics {
  activePageId?: string | null;
  bodyText: string;
  bodyScrollWidth: number;
  detailHeight: number;
  detailWidth: number;
  documentScrollWidth: number;
  gateText: string;
  listHeight: number;
  listWidth: number;
  navText: string;
  navWidth: number;
  pageHeight: number;
  pageWidth: number;
  publishDisabled: boolean;
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

test("captures tenant.eval source parity evidence on latest shell stack", async ({
  page
}) => {
  const sourceMapping = writeSourceMappingSummary();
  expect(sourceMapping.anatomy.title).toBe(true);
  expect(sourceMapping.anatomy.productionGate).toBe(true);
  expect(sourceMapping.anatomy.blockedRunningPassStates).toBe(true);
  expect(sourceMapping.anatomy.firstBlockedAction).toBe(true);
  expect(sourceMapping.anatomy.left300EvalSetList).toBe(true);
  expect(sourceMapping.anatomy.failedCaseDiff).toBe(true);
  expect(sourceMapping.anatomy.manualOverrideConfirm).toBe(true);
  expect(sourceMapping.anatomy.publishConfirm).toBe(true);

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(pathToFileURL(ownerHtml).toString());
  await page.waitForLoadState("domcontentloaded");
  await clickFirstVisibleText(page, "评测中心");
  const ownerSource = await collectOwnerSourceSample(page);
  expect(ownerSource.bodyTextLength).toBeGreaterThan(100);
  expect(ownerSource.contains.eval).toBe(true);
  await saveShot(page, "owner-html-eval-source-sample.png");
  writeJson("owner-html-eval-source-dom-sample.json", ownerSource);

  await page.goto("/design");
  await openEval(page);

  const blockedMetrics = await collectEvalMetrics(page);
  expect(blockedMetrics.shellLevel).toBe("tenant");
  expect(blockedMetrics.activePageId).toBe("tenant.eval");
  expect(blockedMetrics.navWidth).toBe(232);
  expect(blockedMetrics.topbarHeight).toBeGreaterThanOrEqual(52);
  expect(blockedMetrics.topbarHeight).toBeLessThanOrEqual(53);
  expect(blockedMetrics.listWidth).toBe(300);
  expect(blockedMetrics.tenantCategories).toEqual(tenantSections);
  expect(blockedMetrics.groupCategoryCount).toBe(0);
  expect(blockedMetrics.groupButtonCount).toBe(0);
  expect(blockedMetrics.runtimeLabelsVisible).toBe(true);
  expect(blockedMetrics.gateBlocked).toBe(true);
  expect(blockedMetrics.publishDisabled).toBe(true);
  expect(blockedMetrics.sourceLikeBlockedVisible).toBe(true);
  expect(blockedMetrics.bodyScrollWidth).toBeLessThanOrEqual(1440);
  expect(blockedMetrics.documentScrollWidth).toBeLessThanOrEqual(1440);
  await saveShot(page, "react-eval-blocked-desktop.png");

  await page.getByTestId("m7-eval-run").click();
  await expect(page.getByTestId("m7-eval-gate")).toContainText("运行中");
  const runningMetrics = await collectEvalMetrics(page);
  expect(runningMetrics.gateRunning).toBe(true);
  expect(runningMetrics.sourceLikeRunningVisible).toBe(true);
  await saveShot(page, "react-eval-running.png");
  await expect(page.getByTestId("m7-eval-gate")).toContainText("阻断", {
    timeout: 1600
  });

  await page.getByTestId("m7-eval-first-blocked").click();
  await expect(page.getByTestId("m7-eval-detail")).toContainText("Expected");
  await expect(page.getByTestId("m7-eval-detail")).toContainText("Actual");
  await expect(page.getByTestId("m7-eval-blind-toggle")).toBeVisible();
  await page
    .getByTestId("m7-eval-case-SYN-EVAL-CASE-102")
    .getByRole("button", { name: "人工复核为通过" })
    .click();
  await expect(page.getByTestId("m7-confirm-modal")).toBeVisible();
  const manualMetrics = await collectEvalMetrics(page);
  expect(manualMetrics.sourceLikeManualOverrideVisible).toBe(true);
  await saveShot(page, "react-eval-manual-override-modal.png");
  await page.keyboard.press("Escape");

  await page.goto("/design?m7EvalState=pass");
  await openEval(page, false);
  await expect(page.getByTestId("m7-eval-gate")).toContainText("通过");
  await expect(page.getByTestId("m7-eval-publish")).toBeEnabled();
  await page.getByTestId("m7-eval-publish").click();
  await expect(page.getByTestId("m7-confirm-modal")).toBeVisible();
  const passMetrics = await collectEvalMetrics(page);
  expect(passMetrics.gatePass).toBe(true);
  expect(passMetrics.publishEnabled).toBe(true);
  expect(passMetrics.sourceLikePublishModalVisible).toBe(true);
  await saveShot(page, "react-eval-pass-publish-modal.png");

  await page.goto("/design");
  await openEval(page);
  await page.getByRole("button", { name: "Collapse navigation" }).click();
  await expect(page.getByTestId("admin-shell")).toHaveClass(/is-nav-collapsed/);
  const collapsedMetrics = await collectEvalMetrics(page);
  expect(collapsedMetrics.navWidth).toBe(68);
  expect(collapsedMetrics.tenantCategories).toEqual(tenantSections);
  expect(collapsedMetrics.groupCategoryCount).toBe(0);
  expect(collapsedMetrics.groupButtonCount).toBe(0);
  expect(collapsedMetrics.bodyScrollWidth).toBeLessThanOrEqual(1440);
  expect(collapsedMetrics.documentScrollWidth).toBeLessThanOrEqual(1440);
  await saveShot(page, "react-eval-collapsed.png");

  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/design");
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
  await saveShot(page, "react-eval-mobile-320.png", true);

  writeJson("metrics.json", {
    blocked: blockedMetrics,
    collapsed: collapsedMetrics,
    manualOverride: manualMetrics,
    mobile: mobileMetrics,
    pass: passMetrics,
    running: runningMetrics
  });
});

async function saveShot(page: Page, name: string, fullPage = false) {
  await page.screenshot({ fullPage, path: `${artifactDir}/${name}` });
}

function writeJson(name: string, value: unknown) {
  writeFileSync(`${artifactDir}/${name}`, `${JSON.stringify(value, null, 2)}\n`);
}

async function openEval(page: Page, expectBlocked = true) {
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
  if (expectBlocked)
    await expect(page.getByTestId("m7-eval-gate")).toContainText("阻断");
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
        eval: contains("评测中心"),
        productionGate: contains("Production Gate")
      },
      sample: text.replace(/\s+/g, " ").trim().slice(0, 900),
      title: document.title
    };
  });
}

async function collectEvalMetrics(page: Page) {
  // eslint-disable-next-line complexity -- DOM geometry collection keeps the source-parity artifact single-pass.
  const raw = await page.evaluate<RawEvalMetrics>(() => {
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
    const page = roundRect('[data-testid="m7-eval-page"]');
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
      gateText:
        document.querySelector('[data-testid="m7-eval-gate"]')?.textContent ?? "",
      listHeight: list.height,
      listWidth: list.width,
      navText: nav?.textContent ?? "",
      navWidth: roundRect('[data-testid="app-shell-nav"]').width,
      pageHeight: page.height,
      pageWidth: page.width,
      publishDisabled:
        document.querySelector<HTMLButtonElement>('[data-testid="m7-eval-publish"]')
          ?.disabled ?? false,
      shellLevel: document
        .querySelector('[data-testid="admin-shell"]')
        ?.getAttribute("data-shell-level"),
      tenantCategories,
      topbarHeight: topbar.height,
      viewportWidth: window.innerWidth
    };
  });
  return buildEvalMetrics(raw);
}

function buildEvalMetrics(raw: RawEvalMetrics) {
  const bodyText = raw.bodyText;
  const navText = raw.navText;
  return {
    ...raw,
    bodyText: undefined,
    detailVisible: hasBox(raw.detailWidth, raw.detailHeight),
    gateBlocked: raw.gateText.includes("阻断"),
    gatePass: raw.gateText.includes("通过"),
    gateRunning: raw.gateText.includes("运行中"),
    groupButtonCount: groupLabels.filter((label) => navText.includes(label)).length,
    groupCategoryCount: groupSections.filter((label) =>
      raw.tenantCategories.includes(label)
    ).length,
    listVisible: hasBox(raw.listWidth, raw.listHeight),
    mobileReadable:
      includesAll(bodyText, ["评测中心", "Production Gate", "Expected", "Actual"]) &&
      hasBox(raw.listWidth, raw.listHeight) &&
      hasBox(raw.detailWidth, raw.detailHeight),
    navText: undefined,
    pageVisible: hasBox(raw.pageWidth, raw.pageHeight),
    publishEnabled: !raw.publishDisabled,
    runtimeLabelsVisible: includesAll(bodyText, runtimeLabels),
    sourceLikeBlockedVisible: includesAll(bodyText, [
      "评测中心",
      "Production Gate",
      "查看未通过项",
      "发布配置",
      "Expected",
      "Actual",
      "盲评"
    ]),
    sourceLikeManualOverrideVisible: includesAll(bodyText, [
      "复核 SYN-EVAL-CASE-102",
      "Manual review is local only",
      "Override reason"
    ]),
    sourceLikePublishModalVisible: includesAll(bodyText, [
      "发布配置预览",
      "local-only mock publish preview",
      "Publish reason"
    ]),
    sourceLikeRunningVisible: includesAll(bodyText, [
      "Production Gate",
      "运行中",
      "评测运行中"
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
    anatomy: {
      blindReviewStatusToggle: includesAll(sources.page, ["人工盲评", "api.setBlind"]),
      blockedRunningPassStates: includesAll(sources.fixtures, [
        "blocked",
        "running",
        "pass"
      ]),
      detailMeta: includesAll(sources.page, ["prompt", "知识", "模型", "cases"]),
      failedCaseDiff: includesAll(sources.page, ["期望", "实际输出"]),
      firstBlockedAction: sources.hook.includes("gotoFirstBlocked"),
      left300EvalSetList: sources.page.includes("width: 300"),
      manualOverrideConfirm: includesAll(sources.page, [
        "人工复核判定为通过",
        "overrideCase"
      ]),
      productionGate: sources.page.includes("Production Gate"),
      publishConfirm: includesAll(sources.page, ["发布评测配置到生产环境", "publish"]),
      publishDisabledEnabledByGate: sources.page.includes("publishEnabled"),
      title: sources.page.includes("评测中心")
    },
    evalSetNames: evalSourceTabs.filter((label) => sources.fixtures.includes(label)),
    filesRead: Object.values(sourceFiles),
    hook: {
      localStateMachine:
        "sets|selId|running|publishedVer|publishedAt|publishToast|setBlind|overrideCase|runSet|publish|gotoFirstBlocked"
          .split("|")
          .filter((term) => sources.hook.includes(term))
    }
  };
  writeFileSync(
    `${artifactDir}/unpacked-eval-source-mapping.json`,
    `${JSON.stringify(mapping, null, 2)}\n`
  );
  return mapping;
}
