import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

const artifactDir = "/tmp/uzmax-m7-ui-85-customer-assets-default-visual-parity-refresh";
const ownerHtml = "/Users/atilla/Downloads/运营塔台1.0.html";
const sourceFiles = {
  detail: "/Users/atilla/源码/unpacked 6/pages/customers/CustomerDetail.tsx",
  fixtures: "/Users/atilla/源码/unpacked 6/fixtures/customers.ts",
  hook: "/Users/atilla/源码/unpacked 6/hooks/useCustomers.ts",
  list: "/Users/atilla/源码/unpacked 6/pages/customers/CustomerListTab.tsx",
  page: "/Users/atilla/源码/unpacked 6/pages/customers/CustomersPage.tsx",
  search: "/Users/atilla/源码/unpacked 6/pages/customers/ConvSearchTab.tsx",
  tagFields: "/Users/atilla/源码/unpacked 6/pages/customers/TagFieldTabs.tsx"
};
const runtimeBoundaryTerms =
  "mock/degraded|mock|read-only|customer assets runtime unavailable|no production customer data|no runtime write|no DB/API closure".split(
    "|"
  );
const forbiddenVisibleTerms =
  "mock|degraded|read-only|runtime unavailable|not production|synthetic|local-only|browser-local only|no production|MOCK-|disabled|fixture".split(
    "|"
  );
const tenantSections = ["运营", "数据", "智能", "管理", "洞察"];

mkdirSync(artifactDir, { recursive: true });

test.beforeEach(async ({ page }) => {
  await page.route("**/conversation-ticket/conversations", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
});

test("keeps tenant.customers default body clean while runtime boundary stays hidden", async ({
  page
}) => {
  const sourceMapping = writeSourceMappingSummary();
  expect(sourceMapping.ownerHtml.hasCustomersLabel).toBe(true);
  expect(sourceMapping.page.fiveTabs).toBe(true);
  expect(sourceMapping.hook.localActions).toEqual([
    "addNote",
    "restore",
    "tag",
    "field"
  ]);

  await page.setViewportSize({ width: 1440, height: 900 });
  await openCustomers(page);
  await expect(page.getByTestId("m7-customer-runtime-note")).toBeHidden();
  await expect(page.getByTestId("m7-customer-list-count")).toContainText("5 位客户");
  await expect(page.getByTestId("m7-customer-export")).toHaveText("导出");

  const list = await collectCustomerDefaultMetrics(page);
  expect(list.shellLevel).toBe("tenant");
  expect(list.activePageId).toBe("tenant.customers");
  expect(list.navWidth).toBe(232);
  expect(list.tenantCategories).toEqual(tenantSections);
  expect(list.sourceLikeListVisible).toBe(true);
  expect(list.runtimeLabelsPresent).toBe(true);
  expect(list.runtimeLabelsVisibleInBody).toBe(false);
  expect(list.bodyScrollWidth).toBeLessThanOrEqual(1440);
  await page.screenshot({
    fullPage: false,
    path: `${artifactDir}/react-customer-assets-desktop-list-default.png`
  });

  await page.getByTestId("m7-customer-flag-blocked").click();
  await page.getByTestId("m7-customer-row-cu-mock-d").click();
  await expect(page.getByTestId("m7-customer-detail")).toContainText("客户 D");
  await expect(page.getByTestId("m7-customer-detail")).toContainText("归并身份");
  await expect(page.getByTestId("m7-customer-detail")).toContainText("匿名化删除");
  await page.getByTestId("m7-customer-restore").click();
  await expect(page.getByTestId("m7-customer-detail")).toContainText("已解除接待限制");
  await page.getByTestId("m7-customer-add-tag").click();
  await page
    .getByTestId("m7-customer-tag-picker")
    .getByRole("button", { name: "VIP" })
    .click();
  await page.getByTestId("m7-customer-field-cf-mock-source").fill("广告投放复核");
  const detail = await collectCustomerDefaultMetrics(page);
  expect(detail.sourceLikeDetailVisible).toBe(true);
  expect(detail.guardedActionBoundaryPresent).toBe(true);
  expect(detail.runtimeLabelsPresent).toBe(true);
  expect(detail.runtimeLabelsVisibleInBody).toBe(false);
  await page.screenshot({
    fullPage: false,
    path: `${artifactDir}/react-customer-assets-detail-default.png`
  });

  await page.getByTestId("m7-customer-back").click();
  await page.getByTestId("m7-customer-tab-search").click();
  await expect(page.getByTestId("m7-customer-search-tab")).toContainText("CV-A1");
  let tabMetrics = await collectCustomerDefaultMetrics(page);
  expect(tabMetrics.runtimeLabelsPresent).toBe(true);
  expect(tabMetrics.runtimeLabelsVisibleInBody).toBe(false);

  await page.getByTestId("m7-customer-tab-ctag").click();
  await expect(page.getByTestId("m7-customer-tags-tab")).toContainText("标签配置");
  tabMetrics = await collectCustomerDefaultMetrics(page);
  expect(tabMetrics.runtimeLabelsPresent).toBe(true);
  expect(tabMetrics.runtimeLabelsVisibleInBody).toBe(false);

  await page.getByTestId("m7-customer-tab-stag").click();
  await expect(page.getByTestId("m7-customer-tags-tab")).toContainText("退款");
  tabMetrics = await collectCustomerDefaultMetrics(page);
  expect(tabMetrics.runtimeLabelsPresent).toBe(true);
  expect(tabMetrics.runtimeLabelsVisibleInBody).toBe(false);

  await page.getByTestId("m7-customer-tab-field").click();
  await expect(page.getByTestId("m7-customer-fields-tab")).toContainText(
    "本页展示租户字段"
  );
  tabMetrics = await collectCustomerDefaultMetrics(page);
  expect(tabMetrics.runtimeLabelsPresent).toBe(true);
  expect(tabMetrics.runtimeLabelsVisibleInBody).toBe(false);
  await page.screenshot({
    fullPage: false,
    path: `${artifactDir}/react-customer-assets-tabs-default.png`
  });

  await page.setViewportSize({ width: 320, height: 900 });
  await openCustomers(page);
  await page.getByTestId("m7-customer-row-cu-mock-a").click();
  const mobile = await collectCustomerDefaultMetrics(page);
  expect(mobile.mobileReadable).toBe(true);
  expect(mobile.runtimeLabelsPresent).toBe(true);
  expect(mobile.runtimeLabelsVisibleInBody).toBe(false);
  expect(mobile.bodyScrollWidth).toBeLessThanOrEqual(320);
  expect(mobile.documentScrollWidth).toBeLessThanOrEqual(320);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-customer-assets-mobile-320-default.png`
  });

  writeFileSync(
    `${artifactDir}/metrics.json`,
    `${JSON.stringify({ detail, list, mobile, sourceMapping }, null, 2)}\n`
  );
});

async function openCustomers(page: Page) {
  await page.goto("/design");
  await page.getByTestId("tenant-switcher").selectOption("tenant-b");
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "tenant"
  );
  await page
    .getByTestId("app-shell-nav")
    .getByRole("button", { exact: true, name: "客户资产" })
    .click();
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.customers"
  );
}

async function collectCustomerDefaultMetrics(page: Page) {
  const raw = await page.evaluate(() => {
    const attr = (selector: string, name: string) =>
      document.querySelector(selector)?.getAttribute(name) ?? "";
    const attrs = (selector: string, name: string) =>
      Array.from(document.querySelectorAll(selector)).map(
        (node) => node.getAttribute(name) ?? ""
      );
    const rect = (selector: string) => {
      const element = document.querySelector(selector);
      if (!element) return { height: 0, width: 0 };
      const box = element.getBoundingClientRect();
      return { height: Math.round(box.height), width: Math.round(box.width) };
    };
    const nav = document.querySelector('[data-testid="app-shell-nav"]');
    const pageRoot = document.querySelector('[data-testid="m7-customer-page"]');
    const bodyText = pageRoot instanceof HTMLElement ? pageRoot.innerText : "";
    const tenantCategories = Array.from(
      nav?.querySelectorAll(".uz-nav-group p") ?? []
    ).map((node) => (node.textContent ?? "").trim());
    const runtimeBoundaryText = [
      attr('[data-testid="m7-customer-page"]', "data-runtime-boundary"),
      document.querySelector('[data-testid="m7-customer-runtime-note"]')?.textContent ??
        "",
      ...attrs("[data-runtime-boundary]", "data-runtime-boundary"),
      ...attrs("[title]", "title")
    ].join(" ");
    return {
      activePageId: attr('[data-testid="admin-shell"]', "data-active-page-id"),
      bodyText,
      bodyScrollWidth: document.body.scrollWidth,
      documentScrollWidth: document.documentElement.scrollWidth,
      navWidth: rect('[data-testid="app-shell-nav"]').width,
      runtimeBoundaryText,
      shellLevel: attr('[data-testid="admin-shell"]', "data-shell-level"),
      tenantCategories
    };
  });
  return {
    ...raw,
    bodyText: undefined,
    guardedActionBoundaryPresent: runtimeBoundaryTerms.every((label) =>
      raw.runtimeBoundaryText.includes(label)
    ),
    mobileReadable: includesAll(raw.bodyText, [
      "历史会话",
      "订单快照",
      "客户标签",
      "自定义字段"
    ]),
    runtimeBoundaryText: undefined,
    runtimeLabelsPresent: runtimeBoundaryTerms.every((label) =>
      raw.runtimeBoundaryText.includes(label)
    ),
    runtimeLabelsVisibleInBody: forbiddenVisibleTerms.some((label) =>
      raw.bodyText.includes(label)
    ),
    sourceLikeDetailVisible: includesAll(raw.bodyText, [
      "档案",
      "历史会话",
      "订单快照",
      "报价记录",
      "双轨引导记录",
      "客户标签",
      "自定义字段"
    ]),
    sourceLikeListVisible: includesAll(raw.bodyText, [
      "客户资产",
      "客户列表",
      "会话搜索",
      "客户",
      "语言 / 文字",
      "最近会话"
    ])
  };
}

function includesAll(text: string, labels: string[]) {
  return labels.every((label) => text.includes(label));
}

function writeSourceMappingSummary() {
  const owner = readFileSync(ownerHtml, "utf8");
  const sources: Record<keyof typeof sourceFiles, string> = {
    detail: readFileSync(sourceFiles.detail, "utf8"),
    fixtures: readFileSync(sourceFiles.fixtures, "utf8"),
    hook: readFileSync(sourceFiles.hook, "utf8"),
    list: readFileSync(sourceFiles.list, "utf8"),
    page: readFileSync(sourceFiles.page, "utf8"),
    search: readFileSync(sourceFiles.search, "utf8"),
    tagFields: readFileSync(sourceFiles.tagFields, "utf8")
  };
  const mapping = {
    hook: {
      localActions: ["addNote", "restore", "tag", "field"].filter((term) =>
        sources.hook.includes(term)
      )
    },
    ownerHtml: {
      hasCustomersLabel: owner.includes("客户资产")
    },
    page: {
      detailActions: ["归并身份", "匿名化删除", "解除拉黑"].filter((label) =>
        sources.detail.includes(label)
      ),
      fiveTabs: "客户列表|会话搜索|客户标签|会话标签|自定义字段"
        .split("|")
        .every((label) => `${sources.page}\n${sources.hook}`.includes(label)),
      listColumns: ["客户", "语言 / 文字", "旅程阶段", "最近会话"].filter((label) =>
        sources.list.includes(label)
      ),
      nonListTabs: ["跳回会话", "客户标签用于分群", "自定义字段"].filter((label) =>
        `${sources.search}\n${sources.tagFields}`.includes(label)
      )
    }
  };
  writeFileSync(
    `${artifactDir}/unpacked-customer-assets-default-source-mapping.json`,
    `${JSON.stringify(mapping, null, 2)}\n`
  );
  return mapping;
}
