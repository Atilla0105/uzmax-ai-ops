import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
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

// prettier-ignore
interface RawKnowledgeMetrics {
  activePageId?: string | null; bodyText: string; navText: string; runtimeBoundaryText: string; shellLevel?: string | null;
  tableColumns: string[]; tabs: string[]; tenantCategories: string[];
  assetDetailHeight: number; assetDetailWidth: number; bodyScrollWidth: number; documentScrollWidth: number; factDetailHeight: number; factDetailWidth: number;
  journeyDetailHeight: number; journeyDetailWidth: number; journeyPipelineHeight: number; journeyPipelineWidth: number; navWidth: number; pageHeight: number; pageWidth: number;
  searchWidth: number; sideDetailHeight: number; sideDetailWidth: number; tabCount: number; tableHeight: number; tableWidth: number; templateSourceHeight: number;
  templateSourceWidth: number; topbarHeight: number; viewportWidth: number;
}

mkdirSync(artifactDir, { recursive: true });

test.beforeEach(async ({ page }) => {
  await page.route("**/conversation-ticket/conversations", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
});

test("captures tenant.knowledge source parity evidence on latest shell stack", async ({
  page
}) => {
  const sourceMapping = writeSourceMappingSummary();
  expect(sourceMapping.anatomy.title).toBe(true);
  expect(sourceMapping.anatomy.tabCount).toBe(6);
  expect(sourceMapping.anatomy.journeyPipeline).toBe(true);
  expect(sourceMapping.anatomy.factsRedlineToggle).toBe(true);
  expect(sourceMapping.anatomy.assetsLocalEditDelete).toBe(true);
  expect(sourceMapping.anatomy.templateSourceTable).toBe(true);

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(pathToFileURL(ownerHtml).toString());
  await page.waitForLoadState("domcontentloaded");
  await clickFirstVisibleText(page, "知识与资源");
  const ownerSource = await collectOwnerSourceSample(page);
  expect(ownerSource.bodyTextLength).toBeGreaterThan(100);
  expect(ownerSource.contains.knowledge).toBe(true);
  await saveShot(page, "owner-html-knowledge-source-sample.png");
  writeJson("owner-html-knowledge-source-dom-sample.json", ownerSource);

  await page.goto("/design");
  await openKnowledge(page);

  const journeyMetrics = await collectKnowledgeMetrics(page);
  expect(journeyMetrics.shellLevel).toBe("tenant");
  expect(journeyMetrics.activePageId).toBe("tenant.knowledge");
  expect(journeyMetrics.navWidth).toBe(232);
  expect(journeyMetrics.topbarHeight).toBeGreaterThanOrEqual(52);
  expect(journeyMetrics.topbarHeight).toBeLessThanOrEqual(53);
  expect(journeyMetrics.tabCount).toBe(6);
  expect(journeyMetrics.tabs).toEqual(knowledgeTabs);
  expect(journeyMetrics.journeyPipelineVisible).toBe(true);
  expect(journeyMetrics.journeyDetailVisible).toBe(true);
  expect(journeyMetrics.runtimeLabelsVisible).toBe(true);
  expect(journeyMetrics.tenantCategories).toEqual(tenantSections);
  expect(journeyMetrics.groupCategoryCount).toBe(0);
  expect(journeyMetrics.groupButtonCount).toBe(0);
  expect(journeyMetrics.sourceLikeTitleAndTabsVisible).toBe(true);
  expect(journeyMetrics.bodyScrollWidth).toBeLessThanOrEqual(1440);
  expect(journeyMetrics.documentScrollWidth).toBeLessThanOrEqual(1440);
  await page.getByRole("button", { name: /3\. 下单/ }).click();
  await expect(page.getByTestId("m7-knowledge-journey-warning")).toHaveAttribute(
    "data-runtime-boundary",
    /no formal knowledge write/
  );
  await saveShot(page, "react-knowledge-journey-desktop.png");

  await page.getByTestId("m7-knowledge-tab-facts").click();
  await page.getByTestId("m7-knowledge-search").fill("售后");
  await expect(page.getByTestId("m7-knowledge-facts-table")).toContainText(
    "退款流程说明"
  );
  await page.getByTestId("m7-knowledge-search").fill("");
  await page.getByTestId("m7-knowledge-fact-row-SYN-KB-FACT-002").click();
  await page.getByTestId("m7-knowledge-redline-toggle").click();
  const factsMetrics = await collectKnowledgeMetrics(page);
  expect(factsMetrics.searchWidth).toBeGreaterThanOrEqual(300);
  expect(factsMetrics.searchWidth).toBeLessThanOrEqual(340);
  expect(factsMetrics.tableColumns).toEqual(factsColumns);
  expect(factsMetrics.tableVisible).toBe(true);
  expect(factsMetrics.factDetailVisible).toBe(true);
  expect(factsMetrics.sideDetailVisible).toBe(true);
  expect(factsMetrics.redlineToggleVisible).toBe(true);
  expect(factsMetrics.sourceLikeFactsVisible).toBe(true);
  await saveShot(page, "react-knowledge-facts-detail.png");

  await page.getByTestId("m7-knowledge-tab-public").click();
  await expect(page.getByTestId("m7-knowledge-public-snippets")).toContainText(
    "物流延迟标准安抚"
  );
  await page.getByTestId("m7-knowledge-tab-private").click();
  await expect(page.getByTestId("m7-knowledge-private-snippets")).toContainText(
    "我的快捷 · 催付款"
  );
  const snippetsMetrics = await collectKnowledgeMetrics(page);
  expect(snippetsMetrics.publicPrivateSnippetsVisible).toBe(true);

  await page.getByTestId("m7-knowledge-tab-assets").click();
  const assetListMetrics = await collectKnowledgeMetrics(page);
  expect(assetListMetrics.tableColumns).toEqual(assetColumns);
  expect(assetListMetrics.sourceLikeAssetsTableVisible).toBe(true);
  await page.getByTestId("m7-knowledge-asset-row-SYN-KB-ASSET-001").click();
  await page.getByTestId("m7-knowledge-asset-edit").click();
  await page.getByLabel("编辑素材内容").fill("M7-UI-86 素材草稿");
  await page.getByTestId("m7-knowledge-asset-save").click();
  await expect(page.getByTestId("m7-knowledge-asset-detail")).toContainText(
    "M7-UI-86 素材草稿"
  );
  const assetsMetrics = await collectKnowledgeMetrics(page);
  expect(assetsMetrics.assetDetailVisible).toBe(true);
  expect(assetsMetrics.localAssetControlsVisible).toBe(true);
  await saveShot(page, "react-knowledge-assets-detail.png");

  await page.getByTestId("m7-knowledge-tab-templates").click();
  const templatesMetrics = await collectKnowledgeMetrics(page);
  expect(templatesMetrics.tableColumns).toEqual(templateColumns);
  expect(templatesMetrics.templateSourceVisible).toBe(true);
  expect(templatesMetrics.sourceLikeTemplateVisible).toBe(true);
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
  await page.goto("/design");
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
        knowledge: contains("知识与资源")
      },
      sample: text.replace(/\s+/g, " ").trim().slice(0, 900),
      title: document.title
    };
  });
}

async function collectKnowledgeMetrics(page: Page) {
  const raw = await page.evaluate<RawKnowledgeMetrics>(() => {
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
    const tableColumns = Array.from(
      document.querySelectorAll(".uz-knowledge-table th")
    ).map((node) => (node.textContent ?? "").trim());
    const tabs = Array.from(
      document.querySelectorAll('[data-testid^="m7-knowledge-tab-"]')
    ).map((node) => (node.textContent ?? "").trim());
    const assetDetail = roundRect('[data-testid="m7-knowledge-asset-detail"]');
    const factDetail = roundRect('[data-testid="m7-knowledge-fact-detail"]');
    const journeyDetail = roundRect('[data-testid="m7-knowledge-stage-detail"]');
    const journeyPipeline = roundRect('[data-testid="m7-knowledge-journey-stages"]');
    const page = roundRect('[data-testid="m7-knowledge-page"]');
    const search = roundRect('[data-testid="m7-knowledge-search"]');
    const sideDetail = roundRect(".uz-knowledge-side");
    const table = roundRect(".uz-knowledge-table");
    const templateSource = roundRect('[data-testid="m7-knowledge-template-source"]');
    const topbar = roundRect(".uz-topbar");
    return {
      activePageId: document
        .querySelector('[data-testid="admin-shell"]')
        ?.getAttribute("data-active-page-id"),
      assetDetailHeight: assetDetail.height,
      assetDetailWidth: assetDetail.width,
      bodyText,
      bodyScrollWidth: document.body.scrollWidth,
      documentScrollWidth: document.documentElement.scrollWidth,
      factDetailHeight: factDetail.height,
      factDetailWidth: factDetail.width,
      journeyDetailHeight: journeyDetail.height,
      journeyDetailWidth: journeyDetail.width,
      journeyPipelineHeight: journeyPipeline.height,
      journeyPipelineWidth: journeyPipeline.width,
      navText: nav?.textContent ?? "",
      navWidth: roundRect('[data-testid="app-shell-nav"]').width,
      pageHeight: page.height,
      pageWidth: page.width,
      runtimeBoundaryText: Array.from(
        document.querySelectorAll("[data-runtime-boundary]")
      )
        .map((node) => {
          const element = node as HTMLElement;
          return [
            element.getAttribute("data-runtime-boundary") ?? "",
            element.getAttribute("title") ?? "",
            element.getAttribute("aria-label") ?? ""
          ].join(" ");
        })
        .join(" "),
      searchWidth: search.width,
      shellLevel: document
        .querySelector('[data-testid="admin-shell"]')
        ?.getAttribute("data-shell-level"),
      sideDetailHeight: sideDetail.height,
      sideDetailWidth: sideDetail.width,
      tabCount: tabs.length,
      tableColumns,
      tableHeight: table.height,
      tableWidth: table.width,
      tabs,
      templateSourceHeight: templateSource.height,
      templateSourceWidth: templateSource.width,
      tenantCategories,
      topbarHeight: topbar.height,
      viewportWidth: window.innerWidth
    };
  });
  return buildKnowledgeMetrics(raw);
}

function buildKnowledgeMetrics(raw: RawKnowledgeMetrics) {
  const bodyText = raw.bodyText;
  const navText = raw.navText;
  return {
    ...raw,
    assetDetailVisible: hasBox(raw.assetDetailWidth, raw.assetDetailHeight),
    bodyText: undefined,
    factDetailVisible: hasBox(raw.factDetailWidth, raw.factDetailHeight),
    groupButtonCount: groupLabels.filter((label) => navText.includes(label)).length,
    groupCategoryCount: groupSections.filter((label) =>
      raw.tenantCategories.includes(label)
    ).length,
    journeyDetailVisible: hasBox(raw.journeyDetailWidth, raw.journeyDetailHeight),
    journeyPipelineVisible: hasBox(raw.journeyPipelineWidth, raw.journeyPipelineHeight),
    localAssetControlsVisible:
      includesAll(bodyText, ["删除素材", "编辑内容"]) &&
      raw.runtimeBoundaryText.includes("local-only"),
    mobileReadable:
      includesAll(bodyText, ["知识与资源", "素材库", "素材内容"]) &&
      hasBox(raw.assetDetailWidth, raw.assetDetailHeight),
    navText: undefined,
    pageVisible: hasBox(raw.pageWidth, raw.pageHeight),
    publicPrivateSnippetsVisible:
      bodyText.includes("物流延迟标准安抚") || bodyText.includes("我的快捷 · 催付款"),
    redlineToggleVisible: bodyText.includes("红线"),
    runtimeLabelsVisible: includesAll(raw.runtimeBoundaryText, [
      "degraded",
      "mock",
      "read-only",
      "not production knowledge data",
      "no formal knowledge write",
      "no automatic publish"
    ]),
    sideDetailVisible: hasBox(raw.sideDetailWidth, raw.sideDetailHeight),
    sourceLikeAssetsTableVisible:
      assetColumns.every((label) => raw.tableColumns.includes(label)) &&
      includesAll(bodyText, ["storageRef", "素材对象"]),
    sourceLikeFactsVisible:
      factsColumns.every((label) => raw.tableColumns.includes(label)) &&
      includesAll(bodyText, ["来源已归档", "红线"]),
    sourceLikeTemplateVisible:
      templateColumns.every((label) => raw.tableColumns.includes(label)) &&
      includesAll(bodyText, ["美妆售后知识包", "模板库"]),
    sourceLikeTitleAndTabsVisible:
      bodyText.includes("知识与资源") &&
      knowledgeTabs.every((label) => raw.tabs.includes(label)),
    tableVisible: hasBox(raw.tableWidth, raw.tableHeight),
    templateSourceVisible: hasBox(raw.templateSourceWidth, raw.templateSourceHeight)
  };
}

function includesAll(text: string, labels: string[]) {
  return labels.every((label) => text.includes(label));
}

function hasBox(width: number, height: number) {
  return width > 0 && height > 0;
}

function writeSourceMappingSummary() {
  const sources = Object.fromEntries(
    Object.entries(sourceFiles).map(([key, file]) => [key, readFileSync(file, "utf8")])
  ) as Record<keyof typeof sourceFiles, string>;
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
  writeFileSync(
    `${artifactDir}/unpacked-knowledge-source-mapping.json`,
    `${JSON.stringify(mapping, null, 2)}\n`
  );
  return mapping;
}
