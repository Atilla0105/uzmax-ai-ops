import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { type Page } from "@playwright/test";

const artifactDir = "/tmp/uzmax-m7-ui-67-knowledge-resources-source-parity-refresh";
const ownerHtml = "/Users/atilla/Downloads/运营塔台1.0.html";
export const ownerHtmlUrl = pathToFileURL(ownerHtml).toString();
const sourceFiles = {
  fixtures: "/Users/atilla/源码/unpacked 6/fixtures/knowledge.ts",
  hook: "/Users/atilla/源码/unpacked 6/hooks/useKnowledge.ts",
  page: "/Users/atilla/源码/unpacked 6/pages/knowledge/KnowledgePage.tsx"
};
export const tenantSections = ["运营", "数据", "智能", "管理", "洞察"];
const groupSections = ["总览", "平台", "治理"];
const groupLabels =
  "集团总览|模型/成本/风险|模板中心|连接中心|发布与验收|租户管理|集团日志".split("|");
export const knowledgeTabs =
  "教程旅程|事实条目|公共话术|私人话术|素材库|模板来源".split("|");
export const factsColumns = "条目|分类|命中|负反馈|版本|评测".split("|");
export const assetColumns = "名称|类型|格式 / 大小|storageRef|缓存|阶段|引用".split(
  "|"
);
export const templateColumns = "模板名|本地版本|来源版本|复制时间|状态|来源".split("|");

interface RawKnowledgeMetrics {
  activePageId?: string | null;
  bodyText: string;
  navText: string;
  runtimeBoundaryText: string;
  shellLevel?: string | null;
  tableColumns: string[];
  tabs: string[];
  tenantCategories: string[];
  assetDetailHeight: number;
  assetDetailWidth: number;
  bodyScrollWidth: number;
  documentScrollWidth: number;
  factDetailHeight: number;
  factDetailWidth: number;
  journeyDetailHeight: number;
  journeyDetailWidth: number;
  journeyPipelineHeight: number;
  journeyPipelineWidth: number;
  navWidth: number;
  pageHeight: number;
  pageWidth: number;
  searchWidth: number;
  sideDetailHeight: number;
  sideDetailWidth: number;
  tabCount: number;
  tableHeight: number;
  tableWidth: number;
  templateSourceHeight: number;
  templateSourceWidth: number;
  topbarHeight: number;
  viewportWidth: number;
}

mkdirSync(artifactDir, { recursive: true });

export async function saveShot(page: Page, name: string, fullPage = false) {
  await page.screenshot({ fullPage, path: `${artifactDir}/${name}` });
}

export function writeJson(name: string, value: unknown) {
  writeFileSync(`${artifactDir}/${name}`, `${JSON.stringify(value, null, 2)}\n`);
}

export async function clickFirstVisibleText(page: Page, text: string) {
  const target = page.getByText(text, { exact: true }).first();
  try {
    await target.click({ timeout: 3000 });
  } catch {
    // The bundled owner HTML may already expose the target text without route click.
  }
}

export async function collectOwnerSourceSample(page: Page) {
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

export async function collectKnowledgeMetrics(page: Page) {
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

export function writeSourceMappingSummary() {
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
