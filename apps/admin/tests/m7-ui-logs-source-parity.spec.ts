import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { expect, test, type Page } from "@playwright/test";

const artifactDir = "/tmp/uzmax-m7-ui-78-logs-source-parity-refresh";
const ownerHtml = "/Users/atilla/Downloads/运营塔台1.0.html";
const sourceFiles = {
  fixtures: "/Users/atilla/源码/unpacked 6/fixtures/analytics.ts",
  page: "/Users/atilla/源码/unpacked 6/pages/logs/LogsPage.tsx"
};
const tenantSections = ["运营", "数据", "智能", "管理", "洞察"];
const groupSections = ["总览", "平台", "治理"];
const tenantLabels =
  "对话|工单|确认队列|客户资产|订单|知识与资源|评测中心|AI 成员|团队|配置|分析|日志".split(
    "|"
  );
const groupLabels =
  "集团总览|模型/成本/风险|模板中心|连接中心|发布与验收|租户管理|集团日志".split("|");
const runtimeLabels =
  "degraded|mock|read-only|browser-local only|synthetic tenant log rows|no production audit/log export|no file written|no audit/log runtime call|no real tenant/action navigation".split(
    "|"
  );
const tabLabels = ["登录日志", "在线日志", "操作日志"];
const logColumns = {
  login: ["时间", "成员", "IP", "设备", "结果"],
  online: ["时间", "成员", "事件", "前值", "后值"],
  op: ["时间", "操作人", "模块", "动作", "对象", "详情"]
};
const sourceDetailLabels = [
  "查看版本 →",
  "跳转会话 →",
  "跳转工单 →",
  "跳转评测 →",
  "查看 diff →",
  "查看记录 →"
];

mkdirSync(artifactDir, { recursive: true });

test.beforeEach(async ({ page }) => {
  await page.route("**/conversation-ticket/conversations", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
  await page.route("**/confirmation-queue/items?status=pending", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
});

test("captures owner conflict and React tenant.logs source parity refresh", async ({
  page
}) => {
  const mapping = writeSourceMappingSummary();
  expect(mapping.unpacked.tabLabels).toEqual(tabLabels);
  expect(mapping.unpacked.columns.op).toEqual(logColumns.op);
  expect(mapping.unpacked.detailLabels).toEqual(sourceDetailLabels);

  const ownerDefault = await captureOwnerLogs(page);
  expect(ownerDefault.contains.title).toBe(true);
  expect(ownerDefault.contains.tabs).toBe(true);
  expect(ownerDefault.contains.searchPlaceholder).toBe(true);
  expect(ownerDefault.contains.blankRenderedTable).toBe(true);

  await page.setViewportSize({ width: 1440, height: 900 });
  await openLogs(page);
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "tenant"
  );
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.logs"
  );
  await expect(page.getByTestId("m7-logs-page")).toHaveAttribute(
    "data-tenant-id",
    "tenant-b"
  );
  await expectLayerNav(page);
  await expect(page.getByRole("heading", { name: "日志" })).toBeVisible();
  await expect(page.getByTestId("m7-logs-search")).toHaveAttribute(
    "placeholder",
    "搜索本页记录…"
  );
  await expect(page.getByTestId("m7-logs-runtime-note")).toBeHidden();
  await expect(page.getByTestId("m7-logs-page")).not.toContainText("mock/degraded");
  await expect(page.getByTestId("m7-logs-active-tab")).toHaveText("操作日志");
  for (const label of tabLabels) {
    await expect(
      page.getByTestId("m7-logs-page").getByRole("button", {
        exact: true,
        name: label
      })
    ).toBeVisible();
  }
  await expect(page.locator(".uz-tlog-row")).toHaveCount(6);
  await expect(page.locator(".uz-tlog-row").first()).toContainText("查看版本 →");
  const desktopMetrics = await collectLogsMetrics(page);
  expect(desktopMetrics.shellLevel).toBe("tenant");
  expect(desktopMetrics.activePageId).toBe("tenant.logs");
  expect(desktopMetrics.navWidth).toBe(232);
  expect(desktopMetrics.expectedContentWidth).toBe(1208);
  expectWidthNear(desktopMetrics.logsRootWidth, desktopMetrics.expectedContentWidth);
  expectWidthNear(desktopMetrics.logsHeaderWidth, desktopMetrics.logsRootWidth);
  expectWidthNear(desktopMetrics.logsBodyWidth, desktopMetrics.logsRootWidth);
  expectWidthNear(
    desktopMetrics.tablePanelWidth,
    desktopMetrics.expectedContentWidth - 48
  );
  expect(desktopMetrics.topbarHeight).toBeGreaterThanOrEqual(52);
  expect(desktopMetrics.topbarHeight).toBeLessThanOrEqual(53);
  expect(desktopMetrics.tenantCategories).toEqual(tenantSections);
  expect(desktopMetrics.groupLabelsPresent).toBe(false);
  expect(desktopMetrics.runtimeLabelsPresent).toBe(true);
  expect(desktopMetrics.runtimeLabelsVisibleInBody).toBe(false);
  expect(desktopMetrics.runtimeNoteVisible).toBe(false);
  expect(desktopMetrics.visibleRuntimeBadge).toBe(false);
  expect(desktopMetrics.activeTab).toBe("操作日志");
  expect(desktopMetrics.tabLabels).toEqual(tabLabels);
  expect(desktopMetrics.tableHeaderTexts).toEqual(logColumns.op);
  expect(desktopMetrics.tableRowCount).toBe(6);
  await saveShot(page, "react-logs-desktop-default.png", true);

  await page.getByTestId("m7-logs-search").fill("no matching local row");
  await expect(page.locator(".uz-tlog-row")).toHaveCount(0);
  await expect(page.getByTestId("m7-logs-empty")).toHaveText(
    "没有匹配「no matching local row」的记录"
  );
  const searchEmptyMetrics = await collectLogsMetrics(page);
  expect(searchEmptyMetrics.runtimeLabelsVisibleInBody).toBe(false);
  expect(searchEmptyMetrics.emptyText).toBe("没有匹配「no matching local row」的记录");
  await saveShot(page, "react-logs-search-empty.png", true);

  await page.getByTestId("m7-logs-search").fill("");
  await page.getByRole("button", { name: /本地预览日志详情 配置 route v17/ }).click();
  await expect(page.getByTestId("m7-logs-toast")).toContainText("browser-local only");
  await expect(page.getByTestId("m7-logs-toast")).toContainText(
    "no audit/log runtime call"
  );
  const detailToastMetrics = await collectLogsMetrics(page);
  await saveShot(page, "react-logs-local-detail-toast.png", true);

  await openLogs(page);
  await page.getByRole("button", { name: "Collapse navigation" }).click();
  const collapsedMetrics = await collectLogsMetrics(page);
  expect(collapsedMetrics.navWidth).toBe(68);
  expect(collapsedMetrics.expectedContentWidth).toBe(1372);
  expectWidthNear(
    collapsedMetrics.logsRootWidth,
    collapsedMetrics.expectedContentWidth
  );
  expectWidthNear(
    collapsedMetrics.tablePanelWidth,
    collapsedMetrics.expectedContentWidth - 48
  );
  expect(collapsedMetrics.runtimeLabelsVisibleInBody).toBe(false);
  await saveShot(page, "react-logs-collapsed-sidebar.png", true);

  await page.setViewportSize({ width: 320, height: 900 });
  await openLogs(page);
  await expect(page.getByTestId("m7-logs-page")).toBeVisible();
  await expect(page.locator(".uz-tlog-card").first()).toBeVisible();
  const mobileMetrics = await collectLogsMetrics(page);
  expect(mobileMetrics.bodyScrollWidth).toBeLessThanOrEqual(320);
  expect(mobileMetrics.documentScrollWidth).toBeLessThanOrEqual(320);
  expect(mobileMetrics.logsRootWidth).toBeLessThanOrEqual(320);
  expect(mobileMetrics.runtimeLabelsVisibleInBody).toBe(false);
  await saveShot(page, "react-logs-mobile-320.png", true);

  writeJson("metrics.json", {
    collapsed: collapsedMetrics,
    desktop: desktopMetrics,
    detailToast: detailToastMetrics,
    mobile: mobileMetrics,
    ownerDefault,
    searchEmpty: searchEmptyMetrics,
    sourceMapping: mapping
  });
});

async function captureOwnerLogs(page: Page) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(pathToFileURL(ownerHtml).toString());
  await page.waitForLoadState("domcontentloaded");
  await clickFirstVisibleText(page, "日志");
  await page.waitForTimeout(500);
  await saveShot(page, "owner-html-logs-desktop.png", true);
  const sample = await collectOwnerLogsSample(page);
  writeJson("owner-html-logs-rendered-sample.json", sample);
  return sample;
}

async function clickFirstVisibleText(page: Page, text: string) {
  const target = page.getByText(text, { exact: true }).first();
  try {
    await target.click({ timeout: 3000 });
  } catch {
    // Owner HTML may already be on the target page if the first text target is inert.
  }
}

async function openLogs(page: Page, query = "") {
  await page.goto(`/design${query}`);
  await page.getByTestId("tenant-switcher").selectOption("tenant-b");
  await page
    .getByTestId("app-shell-nav")
    .getByRole("button", { exact: true, name: "日志" })
    .click();
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.logs"
  );
}

async function expectLayerNav(page: Page) {
  const nav = page.getByTestId("app-shell-nav");
  await expect
    .poll(() => nav.locator(".uz-nav-group p").allTextContents())
    .toEqual(tenantSections);
  for (const label of tenantLabels) {
    await expect(nav.getByRole("button", { exact: true, name: label })).toBeVisible();
  }
  for (const label of groupLabels) {
    await expect(nav.getByRole("button", { exact: true, name: label })).toHaveCount(0);
  }
  for (const label of groupSections) {
    await expect(nav.locator(".uz-nav-group p").filter({ hasText: label })).toHaveCount(
      0
    );
  }
}

async function collectOwnerLogsSample(page: Page) {
  return page.evaluate((tabs) => {
    const text = document.body.innerText.replace(/\s+/g, " ").trim();
    const tableHeaders = Array.from(document.querySelectorAll("th")).map((node) =>
      (node.textContent ?? "").trim()
    );
    const tableCells = Array.from(document.querySelectorAll("td")).map((node) =>
      (node.textContent ?? "").trim()
    );
    const inputPlaceholders = Array.from(document.querySelectorAll("input")).map(
      (node) => node.getAttribute("placeholder") ?? ""
    );
    return {
      bodyTextLength: text.length,
      contains: {
        blankRenderedTable:
          tableHeaders.length > 0 &&
          tableCells.length > 0 &&
          tableHeaders.every((value) => value === "") &&
          tableCells.every((value) => value === ""),
        searchPlaceholder: inputPlaceholders.includes("搜索本页记录…"),
        tabs: tabs.every((label: string) => text.includes(label)),
        title: text.includes("日志")
      },
      inputPlaceholders,
      sample: text.slice(0, 1200),
      tableCellTexts: tableCells.slice(0, 24),
      tableHeaderTexts: tableHeaders
    };
  }, tabLabels);
}

async function collectLogsMetrics(page: Page) {
  const nav = page.getByTestId("app-shell-nav");
  const sidebarCategories = await nav.locator(".uz-nav-group p").allTextContents();
  const navButtons = await nav.getByRole("button").allTextContents();
  const navWidth = await nav.evaluate((node) =>
    Math.round(node.getBoundingClientRect().width)
  );
  const fullText = await page
    .locator("body")
    .evaluate((node) => node.textContent ?? "");
  const visibleText = await page.locator("body").innerText();
  const geometry = await page.evaluate(() => {
    const widthOf = (selector: string) => {
      const node = document.querySelector(selector);
      return node ? Math.round(node.getBoundingClientRect().width) : 0;
    };
    return {
      logsBodyWidth: widthOf(".uz-tlog-scroll"),
      logsHeaderWidth: widthOf(".uz-tlog-head"),
      logsRootWidth: widthOf(".uz-tlog-page"),
      tablePanelWidth: widthOf(".uz-tlog-panel"),
      tableWrapperWidth: widthOf(".uz-tlog-table-wrap"),
      viewportWidth: window.innerWidth
    };
  });
  const runtimeNote = page.getByTestId("m7-logs-runtime-note");
  return {
    activePageId: await page
      .getByTestId("admin-shell")
      .getAttribute("data-active-page-id"),
    activeTab: (
      (await page.getByTestId("m7-logs-active-tab").textContent()) ?? ""
    ).trim(),
    ...geometry,
    bodyScrollWidth: await page.evaluate(() => document.body.scrollWidth),
    cardRowCount: await page.locator(".uz-tlog-card").count(),
    documentScrollWidth: await page.evaluate(
      () => document.documentElement.scrollWidth
    ),
    emptyText:
      (await page.getByTestId("m7-logs-empty").count()) > 0
        ? ((await page.getByTestId("m7-logs-empty").innerText()) ?? "").trim()
        : "",
    expectedContentWidth: geometry.viewportWidth - navWidth,
    groupLabelsPresent: groupLabels.some((label) => navButtons.includes(label)),
    navWidth,
    runtimeLabelsPresent: runtimeLabels.every((label) => fullText.includes(label)),
    runtimeLabelsVisibleInBody: runtimeLabels.some((label) =>
      visibleText.includes(label)
    ),
    runtimeNoteVisible: await runtimeNote.evaluate((node) => {
      const rect = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      return (
        style.visibility !== "hidden" &&
        style.display !== "none" &&
        Math.round(rect.width) > 1 &&
        Math.round(rect.height) > 1
      );
    }),
    shellLevel: await page.getByTestId("admin-shell").getAttribute("data-shell-level"),
    tabLabels: await page.locator(".uz-tlog-tab").allTextContents(),
    tableHeaderTexts: await page.locator(".uz-tlog-table th").allTextContents(),
    tableRowCount: await page.locator(".uz-tlog-row").count(),
    tenantCategories: sidebarCategories,
    topbarHeight: await page
      .locator(".uz-topbar")
      .evaluate((node) => Math.round(node.getBoundingClientRect().height)),
    visibleRuntimeBadge:
      visibleText.includes("mock/degraded") ||
      visibleText.includes("no production audit/log export") ||
      visibleText.includes("synthetic tenant log rows")
  };
}

function expectWidthNear(actual: number, expected: number, delta = 2) {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(delta);
}

async function saveShot(page: Page, name: string, fullPage = false) {
  await page.screenshot({ fullPage, path: `${artifactDir}/${name}` });
}

function writeJson(name: string, value: unknown) {
  writeFileSync(`${artifactDir}/${name}`, `${JSON.stringify(value, null, 2)}\n`);
}

function writeSourceMappingSummary() {
  const pageSource = readFileSync(sourceFiles.page, "utf8");
  const fixtureSource = readFileSync(sourceFiles.fixtures, "utf8");
  const mapping = {
    files: sourceFiles,
    reactFollows:
      "rendered-owner-html-first-then-unpacked-logs-source-for-structured-details",
    renderedOwnerConflict:
      "Owner HTML logs table renders blank/malformed th/td values, so structured tab columns and rows come from unpacked LOG_* fixtures.",
    unpacked: {
      columns: logColumns,
      defaultTab: "op",
      detailLabels: sourceDetailLabels,
      fixtureHasSourceIpValues:
        fixtureSource.includes("213.230.101.44") &&
        fixtureSource.includes("95.214.10.2"),
      pageHasDefaultOperationTab: pageSource.includes("useState<LogTabId>('op')"),
      pageHasSearchPlaceholder: pageSource.includes("搜索本页记录…"),
      tabLabels
    }
  };
  writeJson("unpacked-logs-source-mapping.json", mapping);
  return mapping;
}
