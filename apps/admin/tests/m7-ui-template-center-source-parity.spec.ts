import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { expect, test, type Locator, type Page } from "@playwright/test";

const artifactDir = "/tmp/uzmax-m7-ui-71-template-center-source-parity-refresh";
const ownerHtml = "/Users/atilla/Downloads/运营塔台1.0.html";
const sourceFiles = {
  app: "/Users/atilla/源码/unpacked 6/App.tsx",
  fixtures: "/Users/atilla/源码/unpacked 6/fixtures/groupPlatform.ts",
  navigation: "/Users/atilla/源码/unpacked 6/shell/navigation.ts",
  page: "/Users/atilla/源码/unpacked 6/pages/group/GroupTemplatePage.tsx"
};
const groupLabels =
  "集团总览|模型/成本/风险|模板中心|连接中心|发布与验收|租户管理|集团日志".split("|");
const tenantLabels =
  "对话|工单|确认队列|客户资产|订单|知识与资源|评测中心|AI 成员|团队|配置|分析|日志".split(
    "|"
  );
const groupSections = ["总览", "平台", "治理"];
const tenantSections = ["运营", "数据", "智能", "管理", "洞察"];
const tabLabels = ["知识包", "人设", "配置", "评测集", "话术包"];
const tabIds = ["knowledge", "agent", "config", "eval", "quick_reply"] as const;
const runtimeLabels = [
  "degraded",
  "mock",
  "read-only",
  "browser-local only",
  "no production template copy",
  "no audit write",
  "no config write"
];
const tenantTargets = ["玉珠跨境美妆", "丝路数码", "天净家居", "白桦母婴"];
type RawTemplateMetrics = {
  activePageId?: string | null;
  bodyText: string;
  bodyScrollWidth: number;
  cardGridHeight: number;
  cardGridWidth: number;
  documentScrollWidth: number;
  firstCardWidth: number;
  headerHeight: number;
  headerWidth: number;
  modalHeight: number;
  modalWidth: number;
  navButtonLabels: string[];
  navText: string;
  navWidth: number;
  pageHeight: number;
  pageWidth: number;
  shellLevel?: string | null;
  sidebarCategories: string[];
  tabListHeight: number;
  tabListWidth: number;
  topbarHeight: number;
  viewportWidth: number;
};

mkdirSync(artifactDir, { recursive: true });

test.beforeEach(async ({ page }) => {
  await page.route("**/conversation-ticket/conversations", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
});

test("captures group.templates source parity evidence on latest visible stack", async ({
  page
}) => {
  const sourceMapping = writeSourceMappingSummary();
  expect(Object.values(sourceMapping.anatomy)).not.toContain(false);

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(pathToFileURL(ownerHtml).toString());
  await page.waitForLoadState("domcontentloaded");
  await clickFirstVisibleText(page, "集团");
  await clickFirstVisibleText(page, "模板中心");
  const ownerSource = await collectOwnerSourceSample(page);
  expect(ownerSource.bodyTextLength).toBeGreaterThan(100);
  expect(ownerSource.contains.templateCenter).toBe(true);
  await saveShot(page, "owner-html-template-center-source-sample.png");
  writeJson("owner-html-template-center-source-dom-sample.json", ownerSource);

  await page.goto("/design");
  await openTemplate(page);
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "group"
  );
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "group.templates"
  );
  await expect(page.getByTestId("page-outlet")).not.toHaveAttribute("data-tenant-id");
  await expect(page.getByRole("heading", { name: "模板中心" })).toBeVisible();
  await expect(page.getByText("复制到租户将生成独立版本")).toBeVisible();
  await expect(page.getByText("集团级模板运营")).toBeVisible();
  await expect(page.getByTestId("m7-template-runtime-note")).toHaveAttribute(
    "hidden",
    ""
  );
  await expectRuntimeBoundary(page.getByTestId("m7-template-runtime-note"));
  for (const id of tabIds)
    await expect(page.getByTestId(`m7-template-tab-${id}`)).toBeVisible();
  await expect(page.getByTestId("m7-template-tab-knowledge")).toHaveAttribute(
    "aria-selected",
    "true"
  );
  await expect(page.locator(".uz-template-card")).toHaveCount(3);
  await expect(page.locator(".uz-template-card").first()).toContainText("通过");
  await expect(page.locator(".uz-template-card").first()).toContainText("版本");
  await expect(page.locator(".uz-template-card").first()).toContainText("最近复制");
  await expect(page.getByTestId("m7-template-copy-SYN-TMPL-tk1")).toContainText(
    "复制到租户"
  );

  const desktopMetrics = await collectTemplateMetrics(page);
  expect(desktopMetrics.shellLevel).toBe("group");
  expect(desktopMetrics.activePageId).toBe("group.templates");
  expect(desktopMetrics.navWidth).toBe(232);
  expect(desktopMetrics.topbarHeight).toBeGreaterThanOrEqual(52);
  expect(desktopMetrics.topbarHeight).toBeLessThanOrEqual(53);
  expect(desktopMetrics.sidebarCategories).toEqual(groupSections);
  expect(desktopMetrics.groupButtonCount).toBe(groupLabels.length);
  expect(desktopMetrics.tenantButtonCount).toBe(0);
  expect(desktopMetrics.tenantCategoryCount).toBe(0);
  expect(desktopMetrics.sourceLikeDefaultVisible).toBe(true);
  expect(desktopMetrics.bodyScrollWidth).toBeLessThanOrEqual(1440);
  expect(desktopMetrics.documentScrollWidth).toBeLessThanOrEqual(1440);
  await saveShot(page, "react-template-center-desktop.png", true);

  const trigger = page.getByTestId("m7-template-copy-SYN-TMPL-tk1");
  await trigger.click();
  const modal = page.getByTestId("m7-template-copy-modal");
  await expect(modal).toHaveAttribute("role", "dialog");
  await expect(modal).toContainText("复制「美妆售后知识包 v4.2」");
  await expect(modal).toContainText("选择目标租户");
  await expect(modal).toContainText("复制后生成独立版本，可各自演进");
  await expectRuntimeBoundary(modal);
  await expect(
    page.locator("[data-testid^='m7-template-tenant-SYN-COPY-']")
  ).toHaveCount(4);
  const confirm = page.getByTestId("m7-template-confirm-copy");
  await expect(confirm).toBeDisabled();
  const modalMetrics = await collectTemplateMetrics(page);
  expect(modalMetrics.modalWidth).toBeGreaterThanOrEqual(418);
  expect(modalMetrics.modalWidth).toBeLessThanOrEqual(420);
  expect(modalMetrics.sourceLikeModalVisible).toBe(true);
  await saveShot(page, "react-template-center-copy-modal.png");

  const target = page.getByTestId("m7-template-tenant-SYN-COPY-t1");
  await expect(target).toHaveAttribute("role", "checkbox");
  await expect(target).toHaveAttribute("aria-checked", "false");
  await target.click();
  await expect(target).toHaveAttribute("aria-checked", "true");
  await expect(confirm).toBeEnabled();
  await confirm.click();
  const toast = page.getByTestId("m7-template-toast");
  await expect(toast).toHaveAttribute("role", "status");
  await expect(toast).toHaveAttribute("aria-live", "polite");
  await expect(toast).toContainText(
    "已复制「美妆售后知识包 v4.2」到 1 个租户 · 知识包"
  );
  await expect(toast).toContainText("租户将生成独立版本");
  await expectRuntimeBoundary(toast);
  const toastMetrics = await collectTemplateMetrics(page);
  expect(toastMetrics.sourceLikeToastVisible).toBe(true);

  await page.getByRole("button", { name: "Collapse navigation" }).click();
  await expect(page.getByTestId("admin-shell")).toHaveClass(/is-nav-collapsed/);
  const collapsedMetrics = await collectTemplateMetrics(page);
  expect(collapsedMetrics.navWidth).toBe(68);
  expect(collapsedMetrics.sidebarCategories).toEqual(groupSections);
  expect(collapsedMetrics.tenantButtonCount).toBe(0);
  expect(collapsedMetrics.tenantCategoryCount).toBe(0);
  expect(collapsedMetrics.bodyScrollWidth).toBeLessThanOrEqual(1440);
  expect(collapsedMetrics.documentScrollWidth).toBeLessThanOrEqual(1440);
  await saveShot(page, "react-template-center-collapsed.png", true);

  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/design");
  await openTemplate(page);
  const mobileMetrics = await collectTemplateMetrics(page);
  expect(mobileMetrics.shellLevel).toBe("group");
  expect(mobileMetrics.activePageId).toBe("group.templates");
  expect(mobileMetrics.bodyScrollWidth).toBeLessThanOrEqual(320);
  expect(mobileMetrics.documentScrollWidth).toBeLessThanOrEqual(320);
  expect(mobileMetrics.mobileReadable).toBe(true);
  expect(mobileMetrics.sidebarCategories).toEqual(groupSections);
  expect(mobileMetrics.tenantButtonCount).toBe(0);
  expect(mobileMetrics.tenantCategoryCount).toBe(0);
  await saveShot(page, "react-template-center-mobile-320.png", true);

  writeJson("metrics.json", {
    collapsed: collapsedMetrics,
    desktop: desktopMetrics,
    mobile: mobileMetrics,
    modal: modalMetrics,
    toast: toastMetrics
  });
});

async function saveShot(page: Page, name: string, fullPage = false) {
  await page.screenshot({ fullPage, path: `${artifactDir}/${name}` });
}

function writeJson(name: string, value: unknown) {
  writeFileSync(`${artifactDir}/${name}`, `${JSON.stringify(value, null, 2)}\n`);
}

async function openTemplate(page: Page) {
  await page
    .getByTestId("app-shell-nav")
    .getByRole("button", { exact: true, name: "模板中心" })
    .click();
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "group.templates"
  );
  await expect(page.getByTestId("m7-template-page")).toBeVisible();
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
    const tabs = ["知识包", "人设", "配置", "评测集", "话术包"];
    return {
      bodyTextLength: text.length,
      contains: {
        copyAction: contains("复制到租户"),
        subtitle: contains("复制到租户将生成独立版本"),
        tabs: tabs.every((label) => contains(label)),
        templateCenter: contains("模板中心")
      },
      sample: text.replace(/\s+/g, " ").trim().slice(0, 900),
      title: document.title
    };
  });
}

async function collectTemplateMetrics(page: Page) {
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
    const sidebarCategories = Array.from(
      nav?.querySelectorAll(".uz-nav-group p") ?? []
    ).map((node) => (node.textContent ?? "").trim());
    const navButtonLabels = Array.from(nav?.querySelectorAll("button") ?? []).map(
      (node) => (node.textContent ?? "").trim()
    );
    const cardGrid = roundRect(".uz-template-grid");
    const firstCard = roundRect(".uz-template-card");
    const header = roundRect(".uz-template-head");
    const modal = roundRect('[data-testid="m7-template-copy-modal"]');
    const pageBox = roundRect('[data-testid="m7-template-page"]');
    const tabs = roundRect(".uz-template-tabs");
    const topbar = roundRect(".uz-topbar");
    return {
      activePageId: document
        .querySelector('[data-testid="admin-shell"]')
        ?.getAttribute("data-active-page-id"),
      bodyText,
      bodyScrollWidth: document.body.scrollWidth,
      cardGridHeight: cardGrid.height,
      cardGridWidth: cardGrid.width,
      documentScrollWidth: document.documentElement.scrollWidth,
      firstCardWidth: firstCard.width,
      headerHeight: header.height,
      headerWidth: header.width,
      modalHeight: modal.height,
      modalWidth: modal.width,
      navButtonLabels,
      navText: nav?.textContent ?? "",
      navWidth: roundRect('[data-testid="app-shell-nav"]').width,
      pageHeight: pageBox.height,
      pageWidth: pageBox.width,
      shellLevel: document
        .querySelector('[data-testid="admin-shell"]')
        ?.getAttribute("data-shell-level"),
      sidebarCategories,
      tabListHeight: tabs.height,
      tabListWidth: tabs.width,
      topbarHeight: topbar.height,
      viewportWidth: window.innerWidth
    };
  });
  return buildTemplateMetrics(raw);
}

function buildTemplateMetrics(raw: RawTemplateMetrics) {
  const bodyText = raw.bodyText;
  const navButtonLabels = raw.navButtonLabels;
  return {
    ...raw,
    bodyText: undefined,
    cardGridVisible: hasBox(raw.cardGridWidth, raw.cardGridHeight),
    groupButtonCount: groupLabels.filter((label) => navButtonLabels.includes(label))
      .length,
    mobileReadable:
      includesAll(bodyText, ["模板中心", "知识包", "复制到租户"]) &&
      hasBox(raw.firstCardWidth, raw.cardGridHeight) &&
      raw.firstCardWidth <= raw.viewportWidth,
    navButtonLabels: undefined,
    navText: undefined,
    pageVisible: hasBox(raw.pageWidth, raw.pageHeight),
    sourceLikeDefaultVisible:
      includesAll(bodyText, [
        "模板中心",
        "复制到租户将生成独立版本",
        "知识包",
        "人设",
        "配置",
        "评测集",
        "话术包",
        "美妆售后知识包",
        "通过",
        "版本",
        "最近复制",
        "复制到租户"
      ]) &&
      hasBox(raw.headerWidth, raw.headerHeight) &&
      hasBox(raw.tabListWidth, raw.tabListHeight),
    sourceLikeModalVisible:
      includesAll(bodyText, [
        "复制「美妆售后知识包 v4.2」",
        "选择目标租户",
        "复制后生成独立版本，可各自演进",
        "确认复制"
      ]) && tenantTargets.every((label) => bodyText.includes(label)),
    sourceLikeToastVisible: includesAll(bodyText, [
      "已复制「美妆售后知识包 v4.2」到 1 个租户 · 知识包",
      "租户将生成独立版本"
    ]),
    tenantButtonCount: tenantLabels.filter((label) => navButtonLabels.includes(label))
      .length,
    tenantCategoryCount: tenantSections.filter((label) =>
      raw.sidebarCategories.includes(label)
    ).length
  };
}

function includesAll(text: string, labels: readonly string[]) {
  return labels.every((label) => text.includes(label));
}

function hasBox(width: number, height: number) {
  return width > 0 && height > 0;
}

function writeSourceMappingSummary() {
  const sources: Record<keyof typeof sourceFiles, string> = {
    app: readFileSync(sourceFiles.app, "utf8"),
    fixtures: readFileSync(sourceFiles.fixtures, "utf8"),
    navigation: readFileSync(sourceFiles.navigation, "utf8"),
    page: readFileSync(sourceFiles.page, "utf8")
  };
  const page = sources.page;
  const fixtures = sources.fixtures;
  const mapping = {
    anatomy: {
      cardGrid: includesAll(page, ["cards.map", "repeat(auto-fill,minmax(300px,1fr))"]),
      copyAction: includesAll(page, ["复制到租户", "openCopy"]),
      evalBadge: includesAll(page, ["TMPL_EVAL", "c.ev"]),
      groupRoute:
        includesAll(sources.app, ["case 'g_tmpl'", "GroupTemplatePage"]) &&
        includesAll(sources.navigation, ["GROUP_NAV", "g_tmpl", "模板中心"]),
      localToast: includesAll(page, ["已复制", "到 ${n} 个租户", "setToast"]),
      modal: includesAll(page, ["width: 420", "选择目标租户", "确认复制"]),
      subtitle: page.includes("复制到租户将生成独立版本"),
      tabs: tabLabels.every((label) => `${page}\n${fixtures}`.includes(label)),
      tenantTargets:
        fixtures.includes("GROUP_TENANTS") &&
        tenantTargets.every((label) => fixtures.includes(label)),
      title: page.includes("模板中心"),
      versionMetaRecentCopy: includesAll(page, [
        "版本",
        "c.meta",
        "最近复制",
        "尚未复制到任何租户"
      ])
    }
  };
  writeFileSync(
    `${artifactDir}/unpacked-template-center-source-mapping.json`,
    `${JSON.stringify(mapping, null, 2)}\n`
  );
  return mapping;
}
