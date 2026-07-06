import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { expect, test, type Page } from "@playwright/test";

const artifactDir = "/tmp/uzmax-m7-ui-67-knowledge-resources-source-parity-refresh";
const ownerHtml = "/Users/atilla/Downloads/运营塔台1.0.html";
const sourceFiles = {
  fixtures: "/Users/atilla/源码/unpacked 6/fixtures/knowledge.ts",
  hook: "/Users/atilla/源码/unpacked 6/hooks/useKnowledge.ts",
  page: "/Users/atilla/源码/unpacked 6/pages/knowledge/KnowledgePage.tsx"
};
const tenantSections = ["运营", "数据", "智能", "管理", "洞察"];
const groupSections = ["总览", "平台", "治理"];
const groupLabels =
  "集团总览|模型/成本/风险|模板中心|连接中心|发布与验收|租户管理|集团日志".split("|");
const knowledgeTabs = "教程旅程|事实条目|公共话术|私人话术|素材库|模板来源".split("|");
const factsColumns = "条目|分类|命中|负反馈|版本|评测".split("|");
const assetColumns = "名称|类型|格式 / 大小|storageRef|缓存|阶段|引用".split("|");
const templateColumns = "模板名|本地版本|来源版本|复制时间|状态|来源".split("|");
const sourceAnatomyFlags =
  "title|journeyPipeline|factsRedlineToggle|assetsLocalEditDelete|templateSourceTable";
const journeyVisibleFlags =
  "journeyPipelineVisible|journeyDetailVisible|runtimeLabelsVisible|sourceLikeTitleAndTabsVisible";
const factsVisibleFlags =
  "tableVisible|factDetailVisible|sideDetailVisible|redlineToggleVisible|sourceLikeFactsVisible";
mkdirSync(artifactDir, { recursive: true });

test.beforeEach(async ({ page }) => {
  await page.route("**/conversation-ticket/conversations", (route) =>
    route.fulfill({ json: { items: [] } })
  );
});

test("captures tenant.knowledge source parity evidence on latest shell stack", async ({
  page
}) => {
  const sourceMapping = writeSourceMappingSummary();
  if (sourceMapping !== undefined) {
    expectTrueTerms(sourceMapping.anatomy, sourceAnatomyFlags);
    expect(sourceMapping.anatomy.tabCount).toBe(6);
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  if (existsSync(ownerHtml)) {
    await page.goto(pathToFileURL(ownerHtml).toString());
    await page.waitForLoadState("domcontentloaded");
    await clickFirstVisibleText(page, "知识与资源");
    const ownerSource = await collectOwnerSourceSample(page);
    expect(ownerSource.bodyTextLength).toBeGreaterThan(100);
    expect(ownerSource.contains.knowledge).toBe(true);
    await saveShot(page, "owner-html-knowledge-source-sample.png");
    writeJson("owner-html-knowledge-source-dom-sample.json", ownerSource);
  } else {
    writeUnavailableArtifact("owner-html-knowledge-source-dom-sample.json", [
      ownerHtml
    ]);
  }

  await openKnowledge(page);

  const journeyMetrics = await collectKnowledgeMetrics(page);
  expect(journeyMetrics.shellLevel).toBe("tenant");
  expect(journeyMetrics.activePageId).toBe("tenant.knowledge");
  expect(journeyMetrics.navWidth).toBe(232);
  expect(journeyMetrics.topbarHeight).toBeGreaterThanOrEqual(52);
  expect(journeyMetrics.topbarHeight).toBeLessThanOrEqual(53);
  expect(journeyMetrics.tabCount).toBe(6);
  expect(journeyMetrics.tabs).toEqual(knowledgeTabs);
  expectTrueTerms(journeyMetrics, journeyVisibleFlags);
  expect(journeyMetrics.tenantCategories).toEqual(tenantSections);
  expect(journeyMetrics.groupCategoryCount).toBe(0);
  expect(journeyMetrics.groupButtonCount).toBe(0);
  expect(journeyMetrics.bodyScrollWidth).toBeLessThanOrEqual(1440);
  expect(journeyMetrics.documentScrollWidth).toBeLessThanOrEqual(1440);
  await page.getByRole("button", { name: /3\. Mock 下单/ }).click();
  await expect(page.getByTestId("m7-knowledge-journey-warning")).toContainText(
    "no formal knowledge write"
  );
  await saveShot(page, "react-knowledge-journey-desktop.png");

  await page.getByTestId("m7-knowledge-tab-facts").click();
  await page.getByTestId("m7-knowledge-search").fill("流程");
  await expect(page.getByTestId("m7-knowledge-facts-table")).toContainText("SYN-KB-V2");
  await page.getByTestId("m7-knowledge-search").fill("");
  await page.getByTestId("m7-knowledge-fact-row-SYN-KB-FACT-002").click();
  await page.getByTestId("m7-knowledge-redline-toggle").click();
  const factsMetrics = await collectKnowledgeMetrics(page);
  expect(factsMetrics.searchWidth).toBeGreaterThanOrEqual(300);
  expect(factsMetrics.searchWidth).toBeLessThanOrEqual(340);
  expect(factsMetrics.tableColumns).toEqual(factsColumns);
  expectTrueTerms(factsMetrics, factsVisibleFlags);
  await saveShot(page, "react-knowledge-facts-detail.png");

  await page.getByTestId("m7-knowledge-tab-public").click();
  await expect(page.getByTestId("m7-knowledge-public-snippets")).toContainText(
    "Mock 公共欢迎话术"
  );
  await page.getByTestId("m7-knowledge-tab-private").click();
  await expect(page.getByTestId("m7-knowledge-private-snippets")).toContainText(
    "Mock 私人备注话术"
  );
  const snippetsMetrics = await collectKnowledgeMetrics(page);
  expect(snippetsMetrics.publicPrivateSnippetsVisible).toBe(true);

  await page.getByTestId("m7-knowledge-tab-assets").click();
  const assetListMetrics = await collectKnowledgeMetrics(page);
  expect(assetListMetrics.tableColumns).toEqual(assetColumns);
  expect(assetListMetrics.sourceLikeAssetsTableVisible).toBe(true);
  await page.getByTestId("m7-knowledge-asset-row-SYN-KB-ASSET-001").click();
  await page.getByTestId("m7-knowledge-asset-edit").click();
  await page.getByLabel("Edit mock asset content").fill("M7-UI-67 local-only asset");
  await page.getByTestId("m7-knowledge-asset-save").click();
  await expect(page.getByTestId("m7-knowledge-asset-detail")).toContainText(
    "M7-UI-67 local-only asset"
  );
  const assetsMetrics = await collectKnowledgeMetrics(page);
  expectTrueTerms(assetsMetrics, "assetDetailVisible|localAssetControlsVisible");
  await saveShot(page, "react-knowledge-assets-detail.png");

  await page.getByTestId("m7-knowledge-tab-templates").click();
  const templatesMetrics = await collectKnowledgeMetrics(page);
  expect(templatesMetrics.tableColumns).toEqual(templateColumns);
  expectTrueTerms(templatesMetrics, "templateSourceVisible|sourceLikeTemplateVisible");
  await saveShot(page, "react-knowledge-templates.png");

  await page.getByRole("button", { name: "Collapse navigation" }).click();
  await expect(page.getByTestId("admin-shell")).toHaveClass(/is-nav-collapsed/);
  const collapsedMetrics = await collectKnowledgeMetrics(page);
  expect(collapsedMetrics.navWidth).toBe(68);
  expect(collapsedMetrics.tenantCategories).toEqual(tenantSections);
  expect(collapsedMetrics.groupCategoryCount).toBe(0);
  expect(collapsedMetrics.groupButtonCount).toBe(0);
  expect(collapsedMetrics.bodyScrollWidth).toBeLessThanOrEqual(1440);
  expect(collapsedMetrics.documentScrollWidth).toBeLessThanOrEqual(1440);
  await saveShot(page, "react-knowledge-collapsed.png");

  await page.setViewportSize({ width: 320, height: 900 });
  await openKnowledge(page);
  await page.getByTestId("m7-knowledge-tab-assets").click();
  await page.getByTestId("m7-knowledge-asset-row-SYN-KB-ASSET-001").click();
  const mobileMetrics = await collectKnowledgeMetrics(page);
  expect(mobileMetrics.shellLevel).toBe("tenant");
  expect(mobileMetrics.activePageId).toBe("tenant.knowledge");
  expect(mobileMetrics.bodyScrollWidth).toBeLessThanOrEqual(320);
  expect(mobileMetrics.documentScrollWidth).toBeLessThanOrEqual(320);
  expect(mobileMetrics.mobileReadable).toBe(true);
  expect(mobileMetrics.tenantCategories).toEqual(tenantSections);
  expect(mobileMetrics.groupCategoryCount).toBe(0);
  expect(mobileMetrics.groupButtonCount).toBe(0);
  await saveShot(page, "react-knowledge-mobile-320.png", true);

  writeJson("metrics.json", {
    assets: assetsMetrics,
    collapsed: collapsedMetrics,
    desktopJourney: journeyMetrics,
    facts: factsMetrics,
    mobile: mobileMetrics,
    snippets: snippetsMetrics,
    templates: templatesMetrics
  });
});

async function saveShot(page: Page, name: string, fullPage = false) {
  await page.screenshot({ fullPage, path: `${artifactDir}/${name}` });
}

function writeJson(name: string, value: unknown) {
  writeFileSync(`${artifactDir}/${name}`, `${JSON.stringify(value, null, 2)}\n`);
}

async function openKnowledge(page: Page) {
  await page.goto("/design");
  await page.getByTestId("tenant-switcher").selectOption("tenant-b");
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "tenant"
  );
  await page
    .getByTestId("app-shell-nav")
    .getByRole("button", { exact: true, name: "知识与资源" })
    .click();
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.knowledge"
  );
  await expect(page.getByTestId("m7-knowledge-page")).toBeVisible();
}

async function clickFirstVisibleText(page: Page, text: string) {
  await page
    .getByText(text, { exact: true })
    .first()
    .click({ timeout: 3000 })
    .catch(() => undefined);
}

async function collectOwnerSourceSample(page: Page) {
  return page.evaluate((knowledgeLabel) => {
    const text = document.body.innerText;
    const normalizedSample = text.replace(/\s+/g, " ").trim();
    return {
      bodyTextLength: text.length,
      contains: {
        knowledge: text.includes(knowledgeLabel)
      },
      sample: normalizedSample.slice(0, 900),
      title: document.title
    };
  }, "知识与资源");
}

async function collectKnowledgeMetrics(page: Page) {
  const raw = await collectRawKnowledgeMetrics(page);
  return buildKnowledgeMetrics(raw);
}

async function collectRawKnowledgeMetrics(page: Page) {
  return page.evaluate(() => {
    const measureBox = (selector: string) => {
      const element = document.querySelector(selector);
      if (!element) return { width: 0, height: 0 };
      const rect = element.getBoundingClientRect();
      return {
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      };
    };
    const nav = document.querySelector('[data-testid="app-shell-nav"]');
    const bodyText = document.body.innerText;
    const tenantCategories = Array.from(
      nav?.querySelectorAll(".uz-nav-group p") ?? []
    ).map((node) => (node.textContent ?? "").trim());
    const tableColumns = Array.from(
      document.querySelectorAll(".uz-knowledge-table th")
    ).map((node) => (node.textContent ?? "").trim());
    const tabs = Array.from(
      document.querySelectorAll('[data-testid^="m7-knowledge-tab-"]')
    ).map((node) => (node.textContent ?? "").trim());
    const boxSelectors = {
      assetDetail: '[data-testid="m7-knowledge-asset-detail"]',
      factDetail: '[data-testid="m7-knowledge-fact-detail"]',
      journeyDetail: '[data-testid="m7-knowledge-stage-detail"]',
      journeyPipeline: '[data-testid="m7-knowledge-journey-stages"]',
      nav: '[data-testid="app-shell-nav"]',
      search: '[data-testid="m7-knowledge-search"]',
      sideDetail: ".uz-knowledge-side",
      table: ".uz-knowledge-table",
      templateSource: '[data-testid="m7-knowledge-template-source"]',
      topbar: ".uz-topbar"
    };
    const boxes = Object.fromEntries(
      Object.entries(boxSelectors).map(([key, selector]) => [key, measureBox(selector)])
    ) as Record<keyof typeof boxSelectors, ReturnType<typeof measureBox>>;
    return {
      activePageId: document
        .querySelector('[data-testid="admin-shell"]')
        ?.getAttribute("data-active-page-id"),
      bodyText,
      bodyScrollWidth: document.body.scrollWidth,
      boxes,
      documentScrollWidth: document.documentElement.scrollWidth,
      navText: nav?.textContent ?? "",
      shellLevel: document
        .querySelector('[data-testid="admin-shell"]')
        ?.getAttribute("data-shell-level"),
      tabCount: tabs.length,
      tableColumns,
      tabs,
      tenantCategories
    };
  });
}

function buildKnowledgeMetrics(
  raw: Awaited<ReturnType<typeof collectRawKnowledgeMetrics>>
) {
  const bodyText = raw.bodyText;
  const boxes = raw.boxes;
  const navText = raw.navText;
  return {
    ...raw,
    assetDetailVisible: hasBox(boxes.assetDetail),
    bodyText: undefined,
    factDetailVisible: hasBox(boxes.factDetail),
    groupButtonCount: groupLabels.filter((label) => navText.includes(label)).length,
    groupCategoryCount: groupSections.filter((label) =>
      raw.tenantCategories.includes(label)
    ).length,
    journeyDetailVisible: hasBox(boxes.journeyDetail),
    journeyPipelineVisible: hasBox(boxes.journeyPipeline),
    localAssetControlsVisible: includesAll(bodyText, [
      "delete local-only",
      "edit local-only"
    ]),
    mobileReadable:
      includesAll(bodyText, ["知识与资源", "素材库", "Mock asset content"]) &&
      hasBox(boxes.assetDetail),
    navWidth: boxes.nav.width,
    navText: undefined,
    publicPrivateSnippetsVisible:
      bodyText.includes("Mock 公共欢迎话术") || bodyText.includes("Mock 私人备注话术"),
    redlineToggleVisible: bodyText.includes("redline on"),
    runtimeLabelsVisible: includesAll(bodyText, [
      "degraded",
      "mock",
      "read-only",
      "not production knowledge data",
      "no formal knowledge write",
      "no automatic publish"
    ]),
    searchWidth: boxes.search.width,
    sideDetailVisible: hasBox(boxes.sideDetail),
    sourceLikeAssetsTableVisible:
      assetColumns.every((label) => raw.tableColumns.includes(label)) &&
      includesAll(bodyText, ["storageRef", "local-only"]),
    sourceLikeFactsVisible:
      factsColumns.every((label) => raw.tableColumns.includes(label)) &&
      includesAll(bodyText, ["controlled://mock/knowledge/facts/002", "redline"]),
    sourceLikeTemplateVisible:
      templateColumns.every((label) => raw.tableColumns.includes(label)) &&
      bodyText.includes("no automatic publish"),
    sourceLikeTitleAndTabsVisible:
      bodyText.includes("知识与资源") &&
      knowledgeTabs.every((label) => raw.tabs.includes(label)),
    tableVisible: hasBox(boxes.table),
    templateSourceVisible: hasBox(boxes.templateSource),
    topbarHeight: boxes.topbar.height
  };
}

function includesAll(text: string, labels: string[]) {
  return labels.every((label) => text.includes(label));
}

function hasBox(box: { width: number; height: number }) {
  return box.width > 0 && box.height > 0;
}

function expectTrueTerms(value: object, keys: string) {
  const record = value as Record<string, unknown>;
  for (const key of keys.split("|")) expect(record[key]).toBe(true);
}

function writeSourceMappingSummary() {
  const missingFiles = Object.values(sourceFiles).filter((file) => !existsSync(file));
  if (missingFiles.length > 0) {
    writeUnavailableArtifact(
      "unpacked-knowledge-source-mapping-unavailable.json",
      missingFiles
    );
    return undefined;
  }

  const sources: Record<keyof typeof sourceFiles, string> = {
    fixtures: readFileSync(sourceFiles.fixtures, "utf8"),
    hook: readFileSync(sourceFiles.hook, "utf8"),
    page: readFileSync(sourceFiles.page, "utf8")
  };
  const page = sources.page;
  const fixtures = sources.fixtures;
  const hook = sources.hook;
  const componentSource = `${page}\n${fixtures}`;
  const mapping = {
    anatomy: {
      assetsLocalEditDelete: includesAll(page, [
        "AssetsTab",
        "AssetDetail",
        "编辑内容 / 信息",
        "删除素材"
      ]),
      factsRedlineToggle: includesAll(page, ["FactsTab", "toggleRedline", "红线标记"]),
      journeyPipeline: includesAll(page, ["JourneyTab", "阶段管线", "未关联素材"]),
      publicPrivateSnippets: includesAll(page, ["SnippetsTab", "public", "private"]),
      tabCount: knowledgeTabs.filter((label) => componentSource.includes(label)).length,
      tabs: knowledgeTabs.filter((label) => componentSource.includes(label)),
      templateSourceTable: includesAll(page, ["TmplSrcTab", "模板名", "来源版本"]),
      title: page.includes("知识与资源"),
      toolbarSearchChipsActions: includesAll(page, ["搜索", "Chips", "ToolbarBtn"])
    },
    filesRead: Object.values(sourceFiles),
    fixturesTerms: ["FACTS", "KB_SNIPPETS", "ASSETS", "TMPL_SRC", "STAGE_DEFS"].filter(
      (term) => fixtures.includes(term)
    ),
    hook: {
      localStateMachine:
        "tab|search|cat|stage|factOpen|facts|snippets|assets|assetOpen|assetEditing|assetDraft"
          .split("|")
          .filter((term) => hook.includes(term))
    }
  };
  writeJson("unpacked-knowledge-source-mapping.json", mapping);
  return mapping;
}

function writeUnavailableArtifact(fileName: string, missingFiles: string[]) {
  writeJson(fileName, {
    missingFiles,
    note: "Local owner HTML/unpacked source is unavailable in this environment; React assertions remain hard."
  });
}
