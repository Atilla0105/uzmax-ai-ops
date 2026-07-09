import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { expect, test, type Page } from "@playwright/test";

const artifactDir = "/tmp/uzmax-m7-ui-98-sidebar-category-collapse-parity";
const ownerHtml = "/Users/atilla/Downloads/运营塔台1.0.html";

const sourceValues = {
  brandHeight: 52,
  collapseHeight: 40,
  collapsedWidth: 68,
  expandedWidth: 232,
  iconSizeMin: 18,
  iconSizeMax: 20,
  itemHeight: 36
} as const;

const groupNav = [
  { label: "总览", items: ["集团总览", "模型/成本/风险"] },
  { label: "平台", items: ["模板中心", "连接中心", "发布与验收"] },
  { label: "治理", items: ["租户管理", "集团日志"] }
] as const;

const tenantNav = [
  { label: "运营", items: ["对话", "工单", "确认队列"] },
  { label: "数据", items: ["客户资产", "订单", "知识与资源"] },
  { label: "智能", items: ["评测中心", "AI 成员"] },
  { label: "管理", items: ["团队", "配置"] },
  { label: "洞察", items: ["分析", "日志"] }
] as const;

mkdirSync(artifactDir, { recursive: true });

test.beforeEach(async ({ page }) => {
  await page.route("**/conversation-ticket/conversations", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
});

test("matches owner sidebar category and collapse source behavior", async ({
  page
}) => {
  await page.setViewportSize({ width: 1280, height: 840 });
  await sampleOwnerSidebarReference(page);

  await page.goto("/design");
  await requireShellState(page, { level: "group", pageId: "group.overview" });
  await expectNavStructure(page, groupNav);
  await expectNavDoesNotContain(page, tenantNav);
  await expect(page.getByTestId("app-shell-nav-collapse")).toContainText("收起导航");

  const groupExpanded = await collectSidebarMetrics(page);
  expectExpandedMetrics(groupExpanded, groupNav);
  await page.screenshot({
    fullPage: false,
    path: `${artifactDir}/react-desktop-group-expanded.png`
  });

  await page.getByTestId("m7-group-enter-tenant-tenant-a").click();
  await requireShellState(page, { level: "tenant", pageId: "tenant.conversations" });
  await expect(page.getByTestId("page-outlet")).toHaveAttribute(
    "data-tenant-id",
    "tenant-a"
  );
  await expect(page.getByTestId("m7-conversation-workbench-page")).toBeVisible();
  await expectNavStructure(page, tenantNav);
  await expectNavDoesNotContain(page, groupNav);

  const tenantExpanded = await collectSidebarMetrics(page);
  expectExpandedMetrics(tenantExpanded, tenantNav);
  await page.screenshot({
    fullPage: false,
    path: `${artifactDir}/react-desktop-tenant-expanded.png`
  });

  await page.getByTestId("app-shell-nav-collapse").click();
  await expect(page.getByTestId("admin-shell")).toHaveClass(/is-nav-collapsed/);
  await expect(page.getByTestId("app-shell-nav")).toHaveAttribute(
    "data-nav-state",
    "collapsed"
  );
  await expect(page.getByTestId("app-shell-nav-collapse")).toHaveAttribute(
    "aria-expanded",
    "false"
  );
  await expect
    .poll(async () => (await collectSidebarMetrics(page)).navWidth)
    .toBe(sourceValues.collapsedWidth);

  const tenantCollapsed = await collectSidebarMetrics(page);
  expectCollapsedMetrics(tenantCollapsed, tenantNav);
  await expect(page.getByText("收起导航", { exact: true })).toHaveCount(0);
  await page.screenshot({
    fullPage: false,
    path: `${artifactDir}/react-desktop-tenant-collapsed.png`
  });

  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/design");
  await page.getByTestId("m7-group-enter-tenant-tenant-a").click();
  await requireShellState(page, { level: "tenant", pageId: "tenant.conversations" });
  const mobile = await collectSidebarMetrics(page);
  expect(mobile.bodyScrollWidth).toBeLessThanOrEqual(320);
  expect(mobile.documentScrollWidth).toBeLessThanOrEqual(320);
  expect(mobile.shellWidth).toBeLessThanOrEqual(320);
  expect(mobile.navWidth).toBe(320);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-mobile-tenant-320.png`
  });

  writeFileSync(
    `${artifactDir}/sidebar-category-collapse-metrics.json`,
    `${JSON.stringify(
      {
        groupExpanded,
        mobile,
        sourceComparison: sourceValues,
        tenantCollapsed,
        tenantExpanded
      },
      null,
      2
    )}\n`
  );
});

async function sampleOwnerSidebarReference(page: Page) {
  const ownerSample = existsSync(ownerHtml)
    ? await inspectMountedOwnerSidebar(page)
    : missingOwnerSidebarReference();

  writeJsonArtifact("owner-html-source-dom-sample.json", ownerSample);
  if (!ownerSample.available) {
    return;
  }

  await page.screenshot({
    fullPage: false,
    path: `${artifactDir}/owner-html-source-sample.png`
  });
}

async function inspectMountedOwnerSidebar(page: Page) {
  await page.goto(pathToFileURL(ownerHtml).toString());
  await page.waitForLoadState("domcontentloaded");
  return page.evaluate(() => {
    const text = document.body.innerText;
    const hasEvery = (labels: string[]) =>
      labels.every((label) => text.includes(label));

    return {
      available: true,
      bodyTextLength: text.length,
      contains: {
        collapseCopy: text.includes("收起导航"),
        groupCategories: hasEvery(["总览", "平台", "治理"]),
        tenantCategories: hasEvery(["运营", "数据", "智能", "管理", "洞察"])
      },
      path: window.location.href,
      title: document.title
    };
  });
}

function missingOwnerSidebarReference() {
  return {
    available: false,
    path: ownerHtml,
    reason: "owner HTML source is not mounted in this environment"
  };
}

function writeJsonArtifact(fileName: string, payload: unknown) {
  writeFileSync(`${artifactDir}/${fileName}`, `${JSON.stringify(payload, null, 2)}\n`);
}

async function requireShellState(
  page: Page,
  expected: { level: "group" | "tenant"; pageId: string }
) {
  const shell = page.getByTestId("admin-shell");
  await expect(shell).toHaveAttribute("data-shell-level", expected.level);
  await expect(shell).toHaveAttribute("data-active-page-id", expected.pageId);
}

async function expectNavStructure(
  page: Page,
  expected: readonly { label: string; items: readonly string[] }[]
) {
  await expect.poll(() => readNavStructure(page)).toEqual(expected);
}

async function expectNavDoesNotContain(
  page: Page,
  excluded: readonly { items: readonly string[] }[]
) {
  const snapshot = await readNavStructure(page);
  const visibleItems = snapshot.flatMap((group) => group.items);
  for (const label of excluded.flatMap((group) => group.items)) {
    expect(visibleItems).not.toContain(label);
  }
}

async function readNavStructure(page: Page) {
  return page.getByTestId("app-shell-nav").evaluate((nav) =>
    Array.from(nav.querySelectorAll<HTMLElement>(".uz-nav-group")).map((group) => ({
      items: Array.from(group.querySelectorAll<HTMLElement>(".uz-nav-item__label"))
        .map((item) => item.innerText.trim())
        .filter(Boolean),
      label:
        group.getAttribute("data-nav-group-label") ??
        group.querySelector("p")?.textContent?.trim() ??
        ""
    }))
  );
}

function expectExpandedMetrics(
  metrics: Awaited<ReturnType<typeof collectSidebarMetrics>>,
  expected: readonly { label: string; items: readonly string[] }[]
) {
  expect(metrics.navState).toBe("expanded");
  expect(metrics.navWidth).toBe(sourceValues.expandedWidth);
  expect(metrics.brandHeight).toBe(sourceValues.brandHeight);
  expect(metrics.collapseHeight).toBe(sourceValues.collapseHeight);
  expect(metrics.collapseBottomDelta).toBe(0);
  expect(metrics.collapseText).toContain("收起导航");
  expect(metrics.categoryLabels).toEqual(expected.map((group) => group.label));
  expect(metrics.navItemLabels).toEqual(expected.flatMap((group) => [...group.items]));
  expect(metrics.labelsPresent).toBe(true);
  expect(metrics.badgesPresent).toBe(false);
  expectIconMetrics(metrics, expected.flatMap((group) => group.items).length);
}

function expectCollapsedMetrics(
  metrics: Awaited<ReturnType<typeof collectSidebarMetrics>>,
  expected: readonly { label: string; items: readonly string[] }[]
) {
  expect(metrics.navState).toBe("collapsed");
  expect(metrics.navWidth).toBe(sourceValues.collapsedWidth);
  expect(metrics.brandHeight).toBe(sourceValues.brandHeight);
  expect(metrics.collapseHeight).toBe(sourceValues.collapseHeight);
  expect(metrics.collapseBottomDelta).toBe(0);
  expect(metrics.collapseText.trim()).toBe("");
  expect(metrics.collapseIconTransform).not.toBe("none");
  expect(metrics.labelsPresent).toBe(false);
  expect(metrics.badgesPresent).toBe(false);
  expect(metrics.allCategoryHeadingsSuppressed).toBe(true);
  expect(metrics.navScrollWidth).toBeLessThanOrEqual(metrics.navClientWidth);
  expect(metrics.bodyScrollWidth).toBeLessThanOrEqual(metrics.viewportWidth);
  expectIconMetrics(metrics, expected.flatMap((group) => group.items).length);
}

function expectIconMetrics(
  metrics: Awaited<ReturnType<typeof collectSidebarMetrics>>,
  expectedCount: number
) {
  expect(metrics.iconMetrics).toHaveLength(expectedCount);
  for (const icon of metrics.iconMetrics) {
    expect(icon).toMatchObject({
      iconSlotText: "",
      itemHeight: sourceValues.itemHeight,
      strokeWidth: "1.75",
      svgCount: 1,
      viewBox: "0 0 24 24"
    });
    expect(icon.svgWidth).toBeGreaterThanOrEqual(sourceValues.iconSizeMin);
    expect(icon.svgWidth).toBeLessThanOrEqual(sourceValues.iconSizeMax);
    expect(icon.svgHeight).toBeGreaterThanOrEqual(sourceValues.iconSizeMin);
    expect(icon.svgHeight).toBeLessThanOrEqual(sourceValues.iconSizeMax);
  }
}

async function collectSidebarMetrics(page: Page) {
  const [dimensions, collapse, headings, labels, iconMetrics] = await Promise.all([
    collectDimensionMetrics(page),
    collectCollapseMetrics(page),
    collectHeadingMetrics(page),
    collectLabelMetrics(page),
    collectIconMetrics(page)
  ]);

  return {
    ...dimensions,
    ...collapse,
    ...headings,
    ...labels,
    iconMetrics
  };
}

async function collectDimensionMetrics(page: Page) {
  return page.evaluate(() => {
    const nav = document.querySelector<HTMLElement>('[data-testid="app-shell-nav"]');
    const shell = document.querySelector<HTMLElement>('[data-testid="admin-shell"]');
    const roundRect = (selector: string, axis: "height" | "width") => {
      const element = document.querySelector<HTMLElement>(selector);
      return element ? Math.round(element.getBoundingClientRect()[axis]) : 0;
    };

    return {
      bodyScrollWidth: document.body.scrollWidth,
      brandHeight: roundRect(".uz-nav-brand", "height"),
      documentScrollWidth: document.documentElement.scrollWidth,
      navClientWidth: nav?.clientWidth ?? 0,
      navScrollWidth: nav?.scrollWidth ?? 0,
      navState: nav?.getAttribute("data-nav-state"),
      navWidth: roundRect('[data-testid="app-shell-nav"]', "width"),
      shellWidth: shell ? Math.round(shell.getBoundingClientRect().width) : 0,
      viewportWidth: window.innerWidth
    };
  });
}

async function collectCollapseMetrics(page: Page) {
  return page.evaluate(() => {
    const nav = document.querySelector<HTMLElement>('[data-testid="app-shell-nav"]');
    const collapse = document.querySelector<HTMLElement>(
      '[data-testid="app-shell-nav-collapse"]'
    );
    const collapseIcon = collapse?.querySelector<HTMLElement>(".uz-icon-slot");
    const navRect = nav?.getBoundingClientRect();
    const collapseRect = collapse?.getBoundingClientRect();

    return {
      collapseBottomDelta:
        navRect && collapseRect ? Math.round(navRect.bottom - collapseRect.bottom) : -1,
      collapseHeight: collapseRect ? Math.round(collapseRect.height) : 0,
      collapseIconTransform: collapseIcon
        ? getComputedStyle(collapseIcon).transform
        : "missing",
      collapseText: collapse?.innerText ?? ""
    };
  });
}

async function collectHeadingMetrics(page: Page) {
  return page.evaluate(() => {
    const nav = document.querySelector<HTMLElement>('[data-testid="app-shell-nav"]');
    const headingStates = Array.from(
      nav?.querySelectorAll<HTMLElement>(".uz-nav-group p") ?? []
    ).map((heading) => {
      const style = getComputedStyle(heading);
      return {
        opacity: style.opacity,
        text: heading.innerText.trim(),
        visibility: style.visibility
      };
    });

    return {
      allCategoryHeadingsSuppressed: headingStates.every(
        (heading) => heading.opacity === "0" && heading.visibility === "hidden"
      ),
      headingStates
    };
  });
}

async function collectLabelMetrics(page: Page) {
  return page.evaluate(() => {
    const nav = document.querySelector<HTMLElement>('[data-testid="app-shell-nav"]');
    const texts = (selector: string) =>
      Array.from(nav?.querySelectorAll<HTMLElement>(selector) ?? [])
        .map((element) => element.innerText.trim())
        .filter(Boolean);

    return {
      badgeTexts: texts(".uz-count-badge"),
      badgesPresent: (nav?.querySelectorAll(".uz-count-badge").length ?? 0) > 0,
      categoryLabels: Array.from(
        nav?.querySelectorAll<HTMLElement>(".uz-nav-group") ?? []
      )
        .map((group) => group.getAttribute("data-nav-group-label") ?? "")
        .filter(Boolean),
      labelsPresent: (nav?.querySelectorAll(".uz-nav-item__label").length ?? 0) > 0,
      navItemLabels: texts(".uz-nav-item__label")
    };
  });
}

async function collectIconMetrics(page: Page) {
  return page.evaluate(() => {
    const readRequired = <T extends Element>(root: ParentNode, selector: string) => {
      const element = root.querySelector<T>(selector);
      if (!element) {
        throw new Error(`Missing required sidebar metric element: ${selector}`);
      }
      return element;
    };

    return Array.from(
      document.querySelectorAll<HTMLElement>(
        '[data-testid="app-shell-nav"] .uz-nav-item'
      )
    ).map((item) => {
      const slot = readRequired<HTMLElement>(item, "[data-icon-slot]");
      const svg = readRequired<SVGSVGElement>(slot, "svg");
      const itemRect = item.getBoundingClientRect();
      const svgRect = svg.getBoundingClientRect();

      return {
        iconSlotText: slot.textContent?.trim() ?? "",
        itemHeight: Math.round(itemRect.height),
        strokeWidth: svg.getAttribute("stroke-width") ?? "",
        svgCount: item.querySelectorAll("svg").length,
        svgHeight: Math.round(svgRect.height),
        svgWidth: Math.round(svgRect.width),
        viewBox: svg.getAttribute("viewBox") ?? ""
      };
    });
  });
}
