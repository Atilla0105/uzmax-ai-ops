import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

const artifactDir = "/tmp/uzmax-m7-ui-84-orders-default-visual-parity-refresh";
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
const runtimeLabels =
  "mock/degraded|mock|read-only|order runtime unavailable|not production order data|no real read|no write|DB/API".split(
    "|"
  );
const forbiddenVisibleTerms =
  "mock/degraded|mock|read-only|runtime unavailable|not production|synthetic|local-only|browser-local only|no real read|No real|DB|API|no write|order runtime unavailable".split(
    "|"
  );

mkdirSync(artifactDir, { recursive: true });

test.beforeEach(async ({ page }) => {
  await page.route("**/conversation-ticket/conversations", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
});

test("keeps tenant.orders default body source-like while runtime boundary stays hidden", async ({
  page
}) => {
  const mapping = writeSourceMappingSummary();
  expect(mapping.ownerHtml.hasOrdersLabel).toBe(true);
  expect(mapping.page.importSnapshotButtonAndModal).toBe(true);
  expect(mapping.page.detailStaleWarning).toBe(true);
  expect(mapping.hook.localStateMachine).toEqual([
    "query",
    "openId",
    "importOpen",
    "step",
    "fileName",
    "progress",
    "rollback"
  ]);

  await page.setViewportSize({ width: 1440, height: 900 });
  await openOrders(page);
  await expect(page.getByTestId("m7-orders-runtime-note")).toBeHidden();
  await expect(page.getByTestId("m7-orders-list-count")).toContainText("4 个订单");
  await expect(page.getByTestId("m7-orders-table")).toContainText("268.00");
  await expect(page.getByTestId("m7-orders-table")).toContainText("客户 A");
  const desktopList = await collectOrdersDefaultMetrics(page);
  expect(desktopList.shellLevel).toBe("tenant");
  expect(desktopList.activePageId).toBe("tenant.orders");
  expect(desktopList.navWidth).toBe(232);
  expect(desktopList.topbarHeight).toBeGreaterThanOrEqual(52);
  expect(desktopList.topbarHeight).toBeLessThanOrEqual(53);
  expect(desktopList.sourceLikeListVisible).toBe(true);
  expect(desktopList.runtimeLabelsPresent).toBe(true);
  expect(desktopList.runtimeLabelsVisibleInBody).toBe(false);
  expect(desktopList.tenantCategories).toEqual(tenantSections);
  expect(desktopList.groupCategoryCount).toBe(0);
  expect(desktopList.groupButtonCount).toBe(0);
  expect(desktopList.bodyScrollWidth).toBeLessThanOrEqual(1440);
  expect(desktopList.documentScrollWidth).toBeLessThanOrEqual(1440);
  await page.screenshot({
    fullPage: false,
    path: `${artifactDir}/react-orders-desktop-list-default.png`
  });

  await page.getByTestId("m7-order-row-SYN-ORD-004").click();
  await expect(page.getByTestId("m7-orders-stale-warning")).toContainText("过期提示");
  await expect(page.getByTestId("m7-orders-linked-affordances")).toContainText("查看");
  const detail = await collectOrdersDefaultMetrics(page);
  expect(detail.sourceLikeDetailVisible).toBe(true);
  expect(detail.runtimeLabelsPresent).toBe(true);
  expect(detail.runtimeLabelsVisibleInBody).toBe(false);
  expect(detail.disabledButtonBoundaryPresent).toBe(true);
  await page.screenshot({
    fullPage: false,
    path: `${artifactDir}/react-orders-detail-default.png`
  });

  await page.getByTestId("m7-orders-import").click();
  await expect(page.getByTestId("m7-orders-import-modal")).toContainText(
    "导入订单快照"
  );
  await expect(page.getByTestId("m7-orders-file-drop")).toContainText(
    "点击选择文件或拖拽到此处"
  );
  await page.getByTestId("m7-orders-file-drop").click();
  await expect(page.getByTestId("m7-orders-file-drop")).toContainText(
    "orders-snapshot.csv"
  );
  await page.getByTestId("m7-orders-start-import").click();
  await expect(page.getByTestId("m7-orders-import-progress")).toContainText("100%");
  await page.getByTestId("m7-orders-show-result").click();
  await expect(page.getByTestId("m7-orders-import-result")).toContainText(
    "导入完成，部分行失败"
  );
  const importResult = await collectOrdersDefaultMetrics(page);
  expect(importResult.sourceLikeImportVisible).toBe(true);
  expect(importResult.importBoundaryPresent).toBe(true);
  expect(importResult.runtimeLabelsPresent).toBe(true);
  expect(importResult.runtimeLabelsVisibleInBody).toBe(false);
  await page.getByTestId("m7-orders-rollback-import").click();
  await expect(page.getByTestId("m7-orders-import-result")).toContainText(
    "本次导入已回滚"
  );
  const importRollback = await collectOrdersDefaultMetrics(page);
  expect(importRollback.runtimeLabelsPresent).toBe(true);
  expect(importRollback.runtimeLabelsVisibleInBody).toBe(false);
  await page.screenshot({
    fullPage: false,
    path: `${artifactDir}/react-orders-import-result-default.png`
  });

  await page.setViewportSize({ width: 320, height: 900 });
  await openOrders(page);
  await page.getByTestId("m7-order-row-SYN-ORD-004").click();
  const mobile = await collectOrdersDefaultMetrics(page);
  expect(mobile.shellLevel).toBe("tenant");
  expect(mobile.activePageId).toBe("tenant.orders");
  expect(mobile.mobileReadable).toBe(true);
  expect(mobile.runtimeLabelsPresent).toBe(true);
  expect(mobile.runtimeLabelsVisibleInBody).toBe(false);
  expect(mobile.bodyScrollWidth).toBeLessThanOrEqual(320);
  expect(mobile.documentScrollWidth).toBeLessThanOrEqual(320);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-orders-mobile-320-default.png`
  });

  writeFileSync(
    `${artifactDir}/metrics.json`,
    `${JSON.stringify(
      { desktopList, detail, importResult, mobile, sourceMapping: mapping },
      null,
      2
    )}\n`
  );
});

async function openOrders(page: Page) {
  await page.goto("/design");
  await page.getByTestId("tenant-switcher").selectOption("tenant-b");
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "tenant"
  );
  await page
    .getByTestId("app-shell-nav")
    .getByRole("button", { exact: true, name: "订单" })
    .click();
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.orders"
  );
  await expect(page.getByTestId("m7-orders-page")).toBeVisible();
}

async function collectOrdersDefaultMetrics(page: Page) {
  const raw = await page.evaluate(() => {
    const attr = (selector: string, name: string) => {
      const element = document.querySelector(selector);
      return element?.getAttribute(name) ?? "";
    };
    const attrs = (selector: string, name: string) =>
      Array.from(document.querySelectorAll(selector)).map(
        (node) => node.getAttribute(name) ?? ""
      );
    const text = (selector: string) =>
      document.querySelector(selector)?.textContent ?? "";
    const rect = (selector: string) => {
      const element = document.querySelector(selector);
      if (!element) return { height: 0, width: 0 };
      const box = element.getBoundingClientRect();
      return { height: Math.round(box.height), width: Math.round(box.width) };
    };
    const nav = document.querySelector('[data-testid="app-shell-nav"]');
    const pageRoot = document.querySelector('[data-testid="m7-orders-page"]');
    const bodyText = pageRoot instanceof HTMLElement ? pageRoot.innerText : "";
    const tenantCategories = Array.from(
      nav?.querySelectorAll(".uz-nav-group p") ?? []
    ).map((node) => (node.textContent ?? "").trim());
    const runtimeBoundaryText = [
      attr('[data-testid="m7-orders-page"]', "data-runtime-boundary"),
      document.querySelector('[data-testid="m7-orders-runtime-note"]')?.textContent ??
        "",
      ...attrs("[data-runtime-boundary]", "data-runtime-boundary"),
      ...attrs("[title]", "title")
    ].join(" ");
    return {
      activePageId: document
        .querySelector('[data-testid="admin-shell"]')
        ?.getAttribute("data-active-page-id"),
      bodyText,
      bodyScrollWidth: document.body.scrollWidth,
      rollbackButtonVisible:
        document.querySelector('[data-testid="m7-orders-rollback-import"]') !== null,
      disabledButtonBoundaries: Array.from(
        document.querySelectorAll(".uz-orders-affordance button")
      ).map((button) => button.getAttribute("data-runtime-boundary") ?? ""),
      documentScrollWidth: document.documentElement.scrollWidth,
      importBoundaryText: [
        attr(".uz-orders-dialog", "data-runtime-boundary"),
        attr('[data-testid="m7-orders-file-drop"]', "data-runtime-boundary"),
        attr('[data-testid="m7-orders-start-import"]', "data-runtime-boundary"),
        attr('[data-testid="m7-orders-rollback-import"]', "data-runtime-boundary")
      ].join(" "),
      navText: text('[data-testid="app-shell-nav"]'),
      navWidth: rect('[data-testid="app-shell-nav"]').width,
      runtimeBoundaryText,
      shellLevel: attr('[data-testid="admin-shell"]', "data-shell-level"),
      tenantCategories,
      topbarHeight: rect(".uz-topbar").height
    };
  });
  const navText = raw.navText;
  const bodyText = raw.bodyText;
  return {
    ...raw,
    bodyText: undefined,
    disabledButtonBoundaryPresent: raw.disabledButtonBoundaries.some((value) =>
      runtimeLabels.every((label) => value.includes(label))
    ),
    disabledButtonBoundaries: undefined,
    groupButtonCount: groupLabels.filter((label) => navText.includes(label)).length,
    groupCategoryCount: groupSections.filter((label) =>
      raw.tenantCategories.includes(label)
    ).length,
    importBoundaryPresent: runtimeLabels.every((label) =>
      raw.importBoundaryText.includes(label)
    ),
    importBoundaryText: undefined,
    mobileReadable: includesAll(bodyText, ["订单", "过期提示", "物流节点", "关联客户"]),
    navText: undefined,
    runtimeBoundaryText: undefined,
    runtimeLabelsPresent: runtimeLabels.every((label) =>
      raw.runtimeBoundaryText.includes(label)
    ),
    runtimeLabelsVisibleInBody: forbiddenVisibleTerms.some((label) =>
      bodyText.includes(label)
    ),
    sourceLikeDetailVisible: includesAll(bodyText, [
      "过期提示",
      "物流节点",
      "关联客户",
      "关联客户与会话",
      "关联工单"
    ]),
    sourceLikeImportVisible:
      includesAll(bodyText, [
        "导入订单快照",
        "导入历史",
        "导入完成，部分行失败",
        "回滚本次导入"
      ]) && raw.rollbackButtonVisible,
    sourceLikeListVisible: includesAll(bodyText, [
      "订单",
      "导入快照",
      "4 个订单",
      "268.00",
      "客户 A"
    ])
  };
}

function includesAll(text: string, labels: string[]) {
  return labels.every((label) => text.includes(label));
}

function writeSourceMappingSummary() {
  const owner = readFileSync(ownerHtml, "utf8");
  const sources: Record<keyof typeof sourceFiles, string> = {
    fixtures: readFileSync(sourceFiles.fixtures, "utf8"),
    hook: readFileSync(sourceFiles.hook, "utf8"),
    page: readFileSync(sourceFiles.page, "utf8")
  };
  const mapping = {
    fixtures: {
      fields: [
        "订单号",
        "客户",
        "金额",
        "状态",
        "批次",
        "物流节点",
        "来源",
        "更新时间"
      ].filter((label) => sources.fixtures.includes(label))
    },
    hook: {
      localStateMachine: "query|openId|importOpen|step|fileName|progress|rollback"
        .split("|")
        .filter((term) => sources.hook.includes(term))
    },
    ownerHtml: {
      hasImportSnapshot: owner.includes("导入快照"),
      hasOrdersLabel: owner.includes("订单")
    },
    page: {
      detailStaleWarning: sources.page.includes("过期提示"),
      importSnapshotButtonAndModal:
        sources.page.includes("导入快照") && sources.page.includes("导入订单快照"),
      linkedPanels: ["关联客户", "关联客户与会话", "关联工单"].filter((label) =>
        sources.page.includes(label)
      ),
      listCount: sources.page.includes("个订单"),
      timeline: sources.page.includes("物流节点")
    }
  };
  writeFileSync(
    `${artifactDir}/unpacked-orders-default-source-mapping.json`,
    `${JSON.stringify(mapping, null, 2)}\n`
  );
  return mapping;
}
