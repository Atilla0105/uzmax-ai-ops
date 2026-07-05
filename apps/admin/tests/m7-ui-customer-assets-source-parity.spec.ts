import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { expect, test, type Page } from "@playwright/test";

const artifactDir = "/tmp/uzmax-m7-ui-65-customer-assets-source-parity-refresh";
const ownerHtml = "/Users/atilla/Downloads/运营塔台1.0.html";
const sourceFiles = {
  convSearch: "/Users/atilla/源码/unpacked 6/pages/customers/ConvSearchTab.tsx",
  detail: "/Users/atilla/源码/unpacked 6/pages/customers/CustomerDetail.tsx",
  editor: "/Users/atilla/源码/unpacked 6/pages/customers/TagFieldEditorModal.tsx",
  fixtures: "/Users/atilla/源码/unpacked 6/fixtures/customers.ts",
  hook: "/Users/atilla/源码/unpacked 6/hooks/useCustomers.ts",
  list: "/Users/atilla/源码/unpacked 6/pages/customers/CustomerListTab.tsx",
  page: "/Users/atilla/源码/unpacked 6/pages/customers/CustomersPage.tsx",
  tagFields: "/Users/atilla/源码/unpacked 6/pages/customers/TagFieldTabs.tsx"
};
const tenantSections = ["运营", "数据", "智能", "管理", "洞察"];
const groupSections = ["总览", "平台", "治理"];
const groupLabels =
  "集团总览|模型/成本/风险|模板中心|连接中心|发布与验收|租户管理|集团日志".split("|");
const customerAnatomyText =
  "客户资产|客户|语言 / 文字|最近会话|历史会话|订单快照|报价记录|双轨引导记录|客户标签|自定义字段".split(
    "|"
  );
const runtimeBoundaryTerms =
  "mock/degraded|mock|read-only|customer assets runtime unavailable|no production customer data|no runtime write|no DB/API closure".split(
    "|"
  );
const forbiddenVisibleTerms =
  "mock|degraded|read-only|runtime unavailable|not production|synthetic|local-only|browser-local only|no production|MOCK-|disabled|fixture".split(
    "|"
  );

mkdirSync(artifactDir, { recursive: true });

test.beforeEach(async ({ page }) => {
  await page.route("**/conversation-ticket/conversations", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
});

test("captures tenant.customers source parity evidence on latest shell stack", async ({
  page
}) => {
  writeSourceMappingSummary();

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(pathToFileURL(ownerHtml).toString());
  await page.waitForLoadState("domcontentloaded");
  await clickFirstVisibleText(page, "客户资产");
  const ownerSource = await collectOwnerSourceSample(page);
  expect(ownerSource.bodyTextLength).toBeGreaterThan(100);
  expect(ownerSource.contains.customers).toBe(true);
  await page.screenshot({
    fullPage: false,
    path: `${artifactDir}/owner-html-customer-assets-source-sample.png`
  });
  writeFileSync(
    `${artifactDir}/owner-html-customer-assets-source-dom-sample.json`,
    `${JSON.stringify(ownerSource, null, 2)}\n`
  );

  await page.goto("/design");
  await openCustomers(page);

  const desktopListMetrics = await collectCustomerMetrics(page);
  expect(desktopListMetrics.shellLevel).toBe("tenant");
  expect(desktopListMetrics.activePageId).toBe("tenant.customers");
  expect(desktopListMetrics.navWidth).toBe(232);
  expect(desktopListMetrics.topbarHeight).toBeGreaterThanOrEqual(52);
  expect(desktopListMetrics.topbarHeight).toBeLessThanOrEqual(53);
  expect(desktopListMetrics.tabCount).toBe(5);
  expect(desktopListMetrics.searchWidth).toBeGreaterThanOrEqual(299);
  expect(desktopListMetrics.searchWidth).toBeLessThanOrEqual(301);
  expect(desktopListMetrics.tableVisible).toBe(true);
  expect(desktopListMetrics.bodyScrollWidth).toBeLessThanOrEqual(1440);
  expect(desktopListMetrics.documentScrollWidth).toBeLessThanOrEqual(1440);
  expect(desktopListMetrics.tenantCategories).toEqual(tenantSections);
  expect(desktopListMetrics.groupCategoryCount).toBe(0);
  expect(desktopListMetrics.groupButtonCount).toBe(0);
  expect(desktopListMetrics.runtimeLabelsPresent).toBe(true);
  expect(desktopListMetrics.runtimeLabelsVisibleInBody).toBe(false);
  expect(desktopListMetrics.sourceLikeListVisible).toBe(true);
  await page.screenshot({
    fullPage: false,
    path: `${artifactDir}/react-customer-assets-desktop-list.png`
  });

  await page.getByTestId("m7-customer-row-cu-mock-a").click();
  const detailMetrics = await collectCustomerMetrics(page);
  expect(detailMetrics.detailVisible).toBe(true);
  expect(detailMetrics.identityVisible).toBe(true);
  expect(detailMetrics.sideColumnVisible).toBe(true);
  expect(detailMetrics.sideColumnWidth).toBeGreaterThanOrEqual(300);
  expect(detailMetrics.sideColumnWidth).toBeLessThanOrEqual(340);
  expect(detailMetrics.sourceLikeDetailVisible).toBe(true);
  expect(detailMetrics.runtimeLabelsPresent).toBe(true);
  expect(detailMetrics.runtimeLabelsVisibleInBody).toBe(false);
  await page.screenshot({
    fullPage: false,
    path: `${artifactDir}/react-customer-assets-detail.png`
  });

  await page.getByRole("button", { name: "Collapse navigation" }).click();
  await expect(page.getByTestId("admin-shell")).toHaveClass(/is-nav-collapsed/);
  const collapsedMetrics = await collectCustomerMetrics(page);
  expect(collapsedMetrics.navWidth).toBe(68);
  expect(collapsedMetrics.bodyScrollWidth).toBeLessThanOrEqual(1440);
  expect(collapsedMetrics.documentScrollWidth).toBeLessThanOrEqual(1440);
  expect(collapsedMetrics.tenantCategories).toEqual(tenantSections);
  expect(collapsedMetrics.groupCategoryCount).toBe(0);
  expect(collapsedMetrics.groupButtonCount).toBe(0);
  await page.screenshot({
    fullPage: false,
    path: `${artifactDir}/react-customer-assets-collapsed.png`
  });

  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/design");
  await openCustomers(page);
  await page.getByTestId("m7-customer-row-cu-mock-a").click();
  const mobileMetrics = await collectCustomerMetrics(page);
  expect(mobileMetrics.shellLevel).toBe("tenant");
  expect(mobileMetrics.activePageId).toBe("tenant.customers");
  expect(mobileMetrics.bodyScrollWidth).toBeLessThanOrEqual(320);
  expect(mobileMetrics.documentScrollWidth).toBeLessThanOrEqual(320);
  expect(mobileMetrics.detailVisible).toBe(true);
  expect(mobileMetrics.identityVisible).toBe(true);
  expect(mobileMetrics.sideColumnVisible).toBe(true);
  expect(mobileMetrics.mobileReadable).toBe(true);
  expect(mobileMetrics.runtimeLabelsPresent).toBe(true);
  expect(mobileMetrics.runtimeLabelsVisibleInBody).toBe(false);
  expect(mobileMetrics.tenantCategories).toEqual(tenantSections);
  expect(mobileMetrics.groupCategoryCount).toBe(0);
  expect(mobileMetrics.groupButtonCount).toBe(0);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-customer-assets-mobile-320.png`
  });

  writeFileSync(
    `${artifactDir}/metrics.json`,
    `${JSON.stringify(
      {
        collapsed: collapsedMetrics,
        desktopDetail: detailMetrics,
        desktopList: desktopListMetrics,
        mobile: mobileMetrics
      },
      null,
      2
    )}\n`
  );
});

async function openCustomers(page: Page) {
  await page.getByTestId("tenant-switcher").selectOption("tenant-b");
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "tenant"
  );
  await page
    .getByTestId("app-shell-nav")
    .getByRole("button", { name: "客户资产", exact: true })
    .click();
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.customers"
  );
  await expect(page.getByTestId("m7-customer-page")).toBeVisible();
}

async function clickFirstVisibleText(page: Page, text: string) {
  const target = page.getByText(text, { exact: true }).first();
  try {
    await target.click({ timeout: 3000 });
  } catch {
    // The bundled owner HTML may already expose the customer text without a route click.
  }
}

async function collectOwnerSourceSample(page: Page) {
  return page.evaluate(() => {
    const text = document.body.innerText;
    const contains = (needle: string) => text.includes(needle);
    return {
      bodyTextLength: text.length,
      contains: {
        customers: contains("客户资产"),
        customFields: contains("自定义字段"),
        list: contains("客户"),
        orders: contains("订单快照"),
        tags: contains("客户标签")
      },
      sample: text.replace(/\s+/g, " ").trim().slice(0, 900),
      title: document.title
    };
  });
}

async function collectCustomerMetrics(page: Page) {
  const raw = await page.evaluate(() => {
    const attr = (selector: string, name: string) => {
      const element = document.querySelector(selector);
      return element?.getAttribute(name) ?? "";
    };
    const attrs = (selector: string, name: string) =>
      Array.from(document.querySelectorAll(selector)).map(
        (node) => node.getAttribute(name) ?? ""
      );
    const roundRect = (selector: string) => {
      const element = document.querySelector(selector);
      if (!element) return { height: 0, width: 0, x: 0, y: 0 };
      const rect = element.getBoundingClientRect();
      return {
        height: Math.round(rect.height),
        width: Math.round(rect.width),
        x: Math.round(rect.x),
        y: Math.round(rect.y)
      };
    };
    const nav = document.querySelector('[data-testid="app-shell-nav"]');
    const pageRoot = document.querySelector('[data-testid="m7-customer-page"]');
    const bodyText = pageRoot instanceof HTMLElement ? pageRoot.innerText : "";
    const tenantCategories = Array.from(
      nav?.querySelectorAll(".uz-nav-group p") ?? []
    ).map((node) => (node.textContent ?? "").trim());
    const detail = roundRect('[data-testid="m7-customer-detail"]');
    const identity = roundRect('[data-testid="m7-customer-identity"]');
    const list = roundRect(".uz-customer-list");
    const search = roundRect('[data-testid="m7-customer-search"]');
    const side = roundRect('[data-testid="m7-customer-side-column"]');
    const table = roundRect('[data-testid="m7-customer-table"]');
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
      identityHeight: identity.height,
      identityWidth: identity.width,
      listHeight: list.height,
      listWidth: list.width,
      navText: nav?.textContent ?? "",
      navWidth: roundRect('[data-testid="app-shell-nav"]').width,
      runtimeBoundaryText: [
        attr('[data-testid="m7-customer-page"]', "data-runtime-boundary"),
        document.querySelector('[data-testid="m7-customer-runtime-note"]')
          ?.textContent ?? "",
        ...attrs("[data-runtime-boundary]", "data-runtime-boundary"),
        ...attrs("[title]", "title")
      ].join(" "),
      searchWidth: search.width,
      shellLevel: document
        .querySelector('[data-testid="admin-shell"]')
        ?.getAttribute("data-shell-level"),
      sideColumnHeight: side.height,
      sideColumnWidth: side.width,
      tabCount: document.querySelectorAll('[data-testid^="m7-customer-tab-"]').length,
      tableHeight: table.height,
      tableWidth: table.width,
      tenantCategories,
      topbarHeight: topbar.height,
      viewportWidth: window.innerWidth
    };
  });
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
    identityVisible: hasBox(raw.identityWidth, raw.identityHeight),
    listVisible: hasBox(raw.listWidth, raw.listHeight),
    mobileReadable:
      hasBox(raw.detailWidth, raw.detailHeight) &&
      hasBox(raw.identityWidth, raw.identityHeight) &&
      bodyText.includes("历史会话") &&
      bodyText.includes("客户标签") &&
      bodyText.includes("自定义字段"),
    navText: undefined,
    runtimeBoundaryText: undefined,
    runtimeLabelsPresent: runtimeBoundaryTerms.every((label) =>
      raw.runtimeBoundaryText.includes(label)
    ),
    runtimeLabelsVisibleInBody: forbiddenVisibleTerms.some((label) =>
      bodyText.includes(label)
    ),
    sourceLikeDetailVisible:
      "历史会话|订单快照|报价记录|双轨引导记录|客户标签|自定义字段"
        .split("|")
        .every((label) => bodyText.includes(label)),
    sideColumnVisible: hasBox(raw.sideColumnWidth, raw.sideColumnHeight),
    sourceLikeListVisible: "客户资产|客户|语言 / 文字|最近会话"
      .split("|")
      .every((label) => bodyText.includes(label)),
    tableVisible: hasBox(raw.tableWidth, raw.tableHeight)
  };
}

function hasBox(width: number, height: number) {
  return width > 0 && height > 0;
}

function writeSourceMappingSummary() {
  const sources: Record<keyof typeof sourceFiles, string> = {
    convSearch: readFileSync(sourceFiles.convSearch, "utf8"),
    detail: readFileSync(sourceFiles.detail, "utf8"),
    editor: readFileSync(sourceFiles.editor, "utf8"),
    fixtures: readFileSync(sourceFiles.fixtures, "utf8"),
    hook: readFileSync(sourceFiles.hook, "utf8"),
    list: readFileSync(sourceFiles.list, "utf8"),
    page: readFileSync(sourceFiles.page, "utf8"),
    tagFields: readFileSync(sourceFiles.tagFields, "utf8")
  };
  writeFileSync(
    `${artifactDir}/unpacked-customer-assets-source-mapping.json`,
    `${JSON.stringify(
      {
        anatomy: {
          detailIdentity: sources.detail.includes("CustomerDetail"),
          detailSections: customerAnatomyText.filter((label) =>
            `${sources.detail}\n${sources.list}\n${sources.page}`.includes(label)
          ),
          fiveTabs:
            sources.page.includes("CUST_TAB_DEFS.map") &&
            "客户列表|会话搜索|客户标签|会话标签|自定义字段"
              .split("|")
              .every((label) => `${sources.page}\n${sources.hook}`.includes(label)),
          listFilters: ["search", "language", "script", "stage"].filter((key) =>
            sources.list.includes(key)
          ),
          sideColumn320:
            sources.detail.includes("320") || sources.detail.includes("w-[320px]")
        },
        fixtures: {
          lineCount: sources.fixtures.split("\n").length,
          mockShapeTerms: "custTags|custFields|convSearch|custRecords"
            .split("|")
            .filter((term) => sources.fixtures.includes(term))
        },
        hook: {
          lineCount: sources.hook.split("\n").length,
          localActions: ["addNote", "restore", "tag", "field"].filter((name) =>
            sources.hook.includes(name)
          )
        },
        filesRead: Object.values(sourceFiles)
      },
      null,
      2
    )}\n`
  );
}
