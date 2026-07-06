import { expect, test, type Page } from "@playwright/test";
import {
  assetColumns,
  clickFirstVisibleText,
  collectKnowledgeMetrics,
  collectOwnerSourceSample,
  factsColumns,
  knowledgeTabs,
  ownerHtmlUrl,
  saveShot,
  templateColumns,
  tenantSections,
  writeJson,
  writeSourceMappingSummary
} from "./m7-ui-knowledge-resources-source-parity.helpers";

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
  await page.goto(ownerHtmlUrl);
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
