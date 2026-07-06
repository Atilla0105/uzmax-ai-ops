import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { expect, test, type Page } from "@playwright/test";

const artifactDir = "/tmp/uzmax-m7-ui-66-orders-source-parity-refresh";
const ownerHtml = "/Users/atilla/Downloads/运营塔台1.0.html";
const sourceFiles = {
  fixtures: "/Users/atilla/源码/unpacked 6/fixtures/orders.ts",
  hook: "/Users/atilla/源码/unpacked 6/hooks/useOrders.ts",
  page: "/Users/atilla/源码/unpacked 6/pages/orders/OrdersPage.tsx"
};
const tenantSections = ["运营", "数据", "智能", "管理", "洞察"];
const groupSections = ["总览", "平台", "治理"];
const groupLabels =
  "集团总览|模型/成本/风险|模板中心|连接中心|发布与验收|租户管理|集团日志".split("|");
const orderColumns = "订单号|客户|金额|状态|批次|物流节点|来源|更新时间".split("|");
const orderAnatomyText =
  "订单|导入快照|物流节点|关联客户|关联客户与会话|关联工单|导入历史|回滚本次导入".split(
    "|"
  );

mkdirSync(artifactDir, { recursive: true });

test.beforeEach(async ({ page }) => {
  await page.route("**/conversation-ticket/conversations", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
});

test("captures tenant.orders source parity evidence on latest shell stack", async ({
  page
}) => {
  writeSourceMappingSummary();

  await page.setViewportSize({ width: 1440, height: 900 });
  if (existsSync(ownerHtml)) {
    await page.goto(pathToFileURL(ownerHtml).toString());
    await page.waitForLoadState("domcontentloaded");
    await clickFirstVisibleText(page, "订单");
    const ownerSource = await collectOwnerSourceSample(page);
    expect(ownerSource.bodyTextLength).toBeGreaterThan(100);
    expect(ownerSource.contains.orders).toBe(true);
    await page.screenshot({
      fullPage: false,
      path: `${artifactDir}/owner-html-orders-source-sample.png`
    });
    writeFileSync(
      `${artifactDir}/owner-html-orders-source-dom-sample.json`,
      `${JSON.stringify(ownerSource, null, 2)}\n`
    );
  } else {
    writeUnavailableArtifact("owner-html-orders-source-dom-sample.json", [ownerHtml]);
  }

  await page.goto("/design");
  await openOrders(page);

  const desktopListMetrics = await collectOrdersMetrics(page);
  expect(desktopListMetrics.shellLevel).toBe("tenant");
  expect(desktopListMetrics.activePageId).toBe("tenant.orders");
  expect(desktopListMetrics.navWidth).toBe(232);
  expect(desktopListMetrics.topbarHeight).toBeGreaterThanOrEqual(52);
  expect(desktopListMetrics.topbarHeight).toBeLessThanOrEqual(53);
  expect(desktopListMetrics.searchWidth).toBeGreaterThanOrEqual(300);
  expect(desktopListMetrics.searchWidth).toBeLessThanOrEqual(340);
  expect(desktopListMetrics.tableColumnCount).toBe(8);
  expect(desktopListMetrics.tableVisible).toBe(true);
  expect(desktopListMetrics.bodyScrollWidth).toBeLessThanOrEqual(1440);
  expect(desktopListMetrics.documentScrollWidth).toBeLessThanOrEqual(1440);
  expect(desktopListMetrics.runtimeLabelsVisible).toBe(true);
  expect(desktopListMetrics.tenantCategories).toEqual(tenantSections);
  expect(desktopListMetrics.groupCategoryCount).toBe(0);
  expect(desktopListMetrics.groupButtonCount).toBe(0);
  expect(desktopListMetrics.sourceLikeListVisible).toBe(true);
  await page.screenshot({
    fullPage: false,
    path: `${artifactDir}/react-orders-desktop-list.png`
  });

  await page.getByTestId("m7-order-row-SYN-ORD-004").click();
  const detailMetrics = await collectOrdersMetrics(page);
  expect(detailMetrics.detailVisible).toBe(true);
  expect(detailMetrics.detailCardVisible).toBe(true);
  expect(detailMetrics.staleWarningVisible).toBe(true);
  expect(detailMetrics.timelineVisible).toBe(true);
  expect(detailMetrics.linkedPanelsVisible).toBe(true);
  expect(detailMetrics.sourceLikeDetailVisible).toBe(true);
  await page.screenshot({
    fullPage: false,
    path: `${artifactDir}/react-orders-detail.png`
  });

  await page.getByTestId("m7-orders-import").click();
  await expect(page.getByTestId("m7-orders-import-modal")).toContainText(
    "local mock only"
  );
  await expect(page.getByTestId("m7-orders-import-history")).toContainText(
    "SYN-IMP-001"
  );
  await driveLocalImportEvidenceFlow(page);
  const importMetrics = await collectOrdersMetrics(page);
  expect(importMetrics.importModalVisible).toBe(true);
  expect(importMetrics.importModalWidth).toBeGreaterThanOrEqual(440);
  expect(importMetrics.importModalWidth).toBeLessThanOrEqual(500);
  expect(importMetrics.importFlowVisible).toBe(true);
  await page.screenshot({
    fullPage: false,
    path: `${artifactDir}/react-orders-import-result.png`
  });

  await page.getByTestId("m7-orders-close-icon").click();
  await page.getByRole("button", { name: "Collapse navigation" }).click();
  await expect(page.getByTestId("admin-shell")).toHaveClass(/is-nav-collapsed/);
  const collapsedMetrics = await collectOrdersMetrics(page);
  expect(collapsedMetrics.navWidth).toBe(68);
  expect(collapsedMetrics.tenantCategories).toEqual(tenantSections);
  expect(collapsedMetrics.groupCategoryCount).toBe(0);
  expect(collapsedMetrics.groupButtonCount).toBe(0);
  expect(collapsedMetrics.bodyScrollWidth).toBeLessThanOrEqual(1440);
  expect(collapsedMetrics.documentScrollWidth).toBeLessThanOrEqual(1440);
  await page.screenshot({
    fullPage: false,
    path: `${artifactDir}/react-orders-collapsed.png`
  });

  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/design");
  await openOrders(page);
  await page.getByTestId("m7-order-row-SYN-ORD-001").click();
  const mobileMetrics = await collectOrdersMetrics(page);
  expect(mobileMetrics.shellLevel).toBe("tenant");
  expect(mobileMetrics.activePageId).toBe("tenant.orders");
  expect(mobileMetrics.bodyScrollWidth).toBeLessThanOrEqual(320);
  expect(mobileMetrics.documentScrollWidth).toBeLessThanOrEqual(320);
  expect(mobileMetrics.detailVisible).toBe(true);
  expect(mobileMetrics.detailCardVisible).toBe(true);
  expect(mobileMetrics.timelineVisible).toBe(true);
  expect(mobileMetrics.linkedPanelsVisible).toBe(true);
  expect(mobileMetrics.mobileReadable).toBe(true);
  expect(mobileMetrics.tenantCategories).toEqual(tenantSections);
  expect(mobileMetrics.groupCategoryCount).toBe(0);
  expect(mobileMetrics.groupButtonCount).toBe(0);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-orders-mobile-320.png`
  });

  writeFileSync(
    `${artifactDir}/metrics.json`,
    `${JSON.stringify(
      {
        collapsed: collapsedMetrics,
        desktopDetail: detailMetrics,
        desktopImport: importMetrics,
        desktopList: desktopListMetrics,
        mobile: mobileMetrics
      },
      null,
      2
    )}\n`
  );
});

async function openOrders(page: Page) {
  await page.getByTestId("tenant-switcher").selectOption("tenant-b");
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "tenant"
  );
  await page
    .getByTestId("app-shell-nav")
    .getByRole("button", { name: "订单", exact: true })
    .click();
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.orders"
  );
  await expect(page.getByTestId("m7-orders-page")).toBeVisible();
}

async function clickFirstVisibleText(page: Page, text: string) {
  await page
    .getByText(text, { exact: true })
    .first()
    .click({ timeout: 3000 })
    .catch(() => undefined);
}

async function collectOwnerSourceSample(page: Page) {
  const text = await page.locator("body").innerText();
  return {
    bodyTextLength: text.length,
    contains: {
      importSnapshot: text.includes("导入快照"),
      orders: text.includes("订单")
    },
    sample: text.replace(/\s+/g, " ").trim().slice(0, 900),
    title: await page.title()
  };
}

async function collectOrdersMetrics(page: Page) {
  const raw = await collectRawOrdersMetrics(page);
  return buildOrdersMetrics(raw);
}

async function collectRawOrdersMetrics(page: Page) {
  return page.evaluate(() => {
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
      document.querySelectorAll('[data-testid="m7-orders-table"] th')
    ).map((node) => (node.textContent ?? "").trim());
    const detail = roundRect('[data-testid="m7-orders-detail"]');
    const detailCard = roundRect('[data-testid="m7-orders-detail-card"]');
    const dialog = roundRect(".uz-orders-dialog");
    const list = roundRect(".uz-orders-list");
    const search = roundRect('[data-testid="m7-orders-search"]');
    const stale = roundRect('[data-testid="m7-orders-stale-warning"]');
    const table = roundRect('[data-testid="m7-orders-table"]');
    const timeline = roundRect('[data-testid="m7-orders-timeline"]');
    const linked = roundRect('[data-testid="m7-orders-linked-affordances"]');
    const topbar = roundRect(".uz-topbar");
    return {
      activePageId: document
        .querySelector('[data-testid="admin-shell"]')
        ?.getAttribute("data-active-page-id"),
      bodyText,
      bodyScrollWidth: document.body.scrollWidth,
      detailCardHeight: detailCard.height,
      detailCardWidth: detailCard.width,
      detailHeight: detail.height,
      detailWidth: detail.width,
      documentScrollWidth: document.documentElement.scrollWidth,
      importModalHeight: dialog.height,
      importModalWidth: dialog.width,
      linkedHeight: linked.height,
      linkedWidth: linked.width,
      listHeight: list.height,
      listWidth: list.width,
      navText: nav?.textContent ?? "",
      navWidth: roundRect('[data-testid="app-shell-nav"]').width,
      searchWidth: search.width,
      shellLevel: document
        .querySelector('[data-testid="admin-shell"]')
        ?.getAttribute("data-shell-level"),
      staleHeight: stale.height,
      staleWidth: stale.width,
      tableColumnCount: tableColumns.length,
      tableColumns,
      tableHeight: table.height,
      tableWidth: table.width,
      tenantCategories,
      timelineHeight: timeline.height,
      timelineWidth: timeline.width,
      topbarHeight: topbar.height,
      viewportWidth: window.innerWidth
    };
  });
}

function buildOrdersMetrics(raw: Awaited<ReturnType<typeof collectRawOrdersMetrics>>) {
  const bodyText = raw.bodyText;
  const navText = raw.navText;
  return {
    ...raw,
    bodyText: undefined,
    detailCardVisible: hasBox(raw.detailCardWidth, raw.detailCardHeight),
    detailVisible: hasBox(raw.detailWidth, raw.detailHeight),
    groupButtonCount: groupLabels.filter((label) => navText.includes(label)).length,
    groupCategoryCount: groupSections.filter((label) =>
      raw.tenantCategories.includes(label)
    ).length,
    importFlowVisible: includesAll(bodyText, ["导入订单快照", "本次导入已回滚"]),
    importModalVisible: hasBox(raw.importModalWidth, raw.importModalHeight),
    linkedPanelsVisible: hasBox(raw.linkedWidth, raw.linkedHeight),
    listVisible: hasBox(raw.listWidth, raw.listHeight),
    mobileReadable:
      hasBox(raw.detailWidth, raw.detailHeight) &&
      hasBox(raw.detailCardWidth, raw.detailCardHeight) &&
      includesAll(bodyText, ["物流节点", "关联客户", "关联客户与会话"]),
    navText: undefined,
    runtimeLabelsVisible: includesAll(bodyText, [
      "degraded",
      "mock",
      "read-only",
      "not production order data"
    ]),
    sourceLikeDetailVisible: includesAll(bodyText, [
      "stale snapshot",
      "物流节点",
      "关联客户",
      "关联客户与会话",
      "关联工单"
    ]),
    sourceLikeListVisible:
      orderColumns.every((label) => raw.tableColumns.includes(label)) &&
      orderAnatomyText.slice(0, 2).every((label) => bodyText.includes(label)),
    staleWarningVisible: hasBox(raw.staleWidth, raw.staleHeight),
    tableVisible: hasBox(raw.tableWidth, raw.tableHeight),
    timelineVisible: hasBox(raw.timelineWidth, raw.timelineHeight)
  };
}

function includesAll(text: string, labels: string[]) {
  return labels.every((label) => text.includes(label));
}

function hasBox(width: number, height: number) {
  return width > 0 && height > 0;
}

async function driveLocalImportEvidenceFlow(page: Page) {
  for (const control of ["m7-orders-file-drop", "m7-orders-start-import"]) {
    await page.getByTestId(control).click();
  }
  await expect(page.getByTestId("m7-orders-import-progress")).toContainText("100%");

  for (const [control, expectedResult] of [
    ["m7-orders-show-result", "导入完成，部分行失败"],
    ["m7-orders-rollback-import", "本次导入已回滚"]
  ] as const) {
    await page.getByTestId(control).click();
    await expect(page.getByTestId("m7-orders-import-result")).toContainText(
      expectedResult
    );
  }
}

function writeSourceMappingSummary() {
  const missingFiles = Object.values(sourceFiles).filter((file) => !existsSync(file));
  if (missingFiles.length > 0) {
    writeUnavailableArtifact(
      "unpacked-orders-source-mapping-unavailable.json",
      missingFiles
    );
    return;
  }

  const sources: Record<keyof typeof sourceFiles, string> = {
    fixtures: readFileSync(sourceFiles.fixtures, "utf8"),
    hook: readFileSync(sourceFiles.hook, "utf8"),
    page: readFileSync(sourceFiles.page, "utf8")
  };
  const page = sources.page;
  const fixtures = sources.fixtures;
  const hook = sources.hook;
  writeFileSync(
    `${artifactDir}/unpacked-orders-source-mapping.json`,
    `${JSON.stringify(
      {
        anatomy: {
          amberRuntimeBar: includesAll(page, ["常驻琥珀条", "订单数据主路径"]),
          denseEightColumnList: orderColumns.every((label) => fixtures.includes(label)),
          detailStaleWarning: includesAll(page, ["过期提示", "stale"]),
          header: includesAll(page, ["订单", "返回", "导入快照"]),
          importSnapshotButtonAndModal: includesAll(page, [
            "导入订单快照",
            "ImportModal"
          ]),
          linkedPanels: ["关联客户", "关联客户与会话", "关联工单"].filter((label) =>
            page.includes(label)
          ),
          packageIdentityCard: includesAll(page, ["Package", "外部ID"]),
          search320: page.includes("width: 320"),
          timeline: includesAll(page, ["timeline", "物流节点"])
        },
        fixtures: {
          lineCount: fixtures.split("\n").length,
          orderColumnCount: orderColumns.filter((label) => fixtures.includes(label))
            .length,
          terms: ["ORDER_DEFS", "ORDER_STATUS", "IMPORT_HISTORY"].filter((term) =>
            fixtures.includes(term)
          )
        },
        hook: {
          lineCount: hook.split("\n").length,
          localStateMachine: "query|openId|importOpen|step|fileName|progress|rollback"
            .split("|")
            .filter((term) => hook.includes(term))
        },
        importFlow: {
          history: page.includes("导入历史"),
          progress: page.includes("progress"),
          result: page.includes("导入完成"),
          rollback: page.includes("回滚本次导入"),
          upload: page.includes("点击选择文件")
        },
        filesRead: Object.values(sourceFiles)
      },
      null,
      2
    )}\n`
  );
}

function writeUnavailableArtifact(fileName: string, missingFiles: string[]) {
  writeFileSync(
    `${artifactDir}/${fileName}`,
    `${JSON.stringify(
      {
        missingFiles,
        note: "Local owner HTML/unpacked source is unavailable in this environment; React assertions remain hard."
      },
      null,
      2
    )}\n`
  );
}
