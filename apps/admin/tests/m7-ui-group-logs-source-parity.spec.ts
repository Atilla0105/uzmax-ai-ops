import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { expect, type Locator, test, type Page } from "@playwright/test";

const artifactDir = "/tmp/uzmax-m7-ui-74-group-logs-source-parity-refresh";
const ownerHtml = "/Users/atilla/Downloads/运营塔台1.0.html";
const sourceFiles = {
  fixtures: "/Users/atilla/源码/unpacked 6/fixtures/groupPlatform.ts",
  navigation: "/Users/atilla/源码/unpacked 6/shell/navigation.ts",
  page: "/Users/atilla/源码/unpacked 6/pages/group/GroupLogsPage.tsx"
};
const tenantLabels =
  "对话|工单|确认队列|客户资产|订单|知识与资源|评测中心|AI 成员|团队|配置|分析|日志".split(
    "|"
  );
const groupSections = ["总览", "平台", "治理"];
const tenantSections = ["运营", "数据", "智能", "管理", "洞察"];
const ownerChipLabels = "全部模块|AI 成员|连接中心|配置|租户管理|对话|工单".split("|");
const unpackedChipLabels =
  "全部模块|AI 成员|连接中心|配置|对话|模板中心|工单|租户管理".split("|");
const tableColumns = "操作时间|租户|操作人|操作模块|操作功能|操作对象|操作内容".split(
  "|"
);
const runtimeLabels =
  "degraded|mock|read-only|browser-local only|synthetic audit rows|no production audit export|no file written|no audit runtime call|no real tenant/action navigation".split(
    "|"
  );

mkdirSync(artifactDir, { recursive: true });

test.beforeEach(async ({ page }) => {
  await page.route("**/conversation-ticket/conversations", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
  await page.route("**/confirmation-queue/items?status=pending", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
});

test("captures owner HTML conflict and React source-parity page", async ({ page }) => {
  const mapping = writeSourceMappingSummary();
  expect(mapping.conflict.ownerRenderedTableConflictStatus).toBe(
    "rendered_table_blank_due_malformed_sc_for"
  );
  expect(mapping.decision.reactFollows).toBe(
    "owner-html-visible-primary-values-and-source-shaped-table-requirement"
  );

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(pathToFileURL(ownerHtml).toString());
  await page.waitForLoadState("domcontentloaded");
  await clickFirstVisibleText(page, "集团");
  await clickFirstVisibleText(page, "集团日志");
  const ownerDefault = await collectOwnerGroupLogsSample(page);
  expect(ownerDefault.contains.title).toBe(true);
  expect(ownerDefault.contains.subtitle).toBe(true);
  expect(ownerDefault.searchPlaceholder).toBe("搜索租户 / 操作人 / 对象 / 内容…");
  expect(ownerDefault.chipLabels).toEqual(ownerChipLabels);
  expect(ownerDefault.contains.templateCenterChip).toBe(false);
  expect(ownerDefault.contains.tableColumns).toBe(false);
  expect(ownerDefault.contains.tableRows).toBe(false);
  expect(ownerDefault.contains.blankRenderedCells).toBe(true);
  await saveShot(page, "owner-html-group-logs-desktop.png", true);
  writeJson("owner-html-group-logs-rendered-sample.json", ownerDefault);

  await page
    .locator('input[placeholder="搜索租户 / 操作人 / 对象 / 内容…"]')
    .fill("not-matching-owner-row");
  await expect(
    page.getByText("没有匹配「not-matching-owner-row」的记录")
  ).toBeVisible();
  await saveShot(page, "owner-html-group-logs-filter-empty.png", true);
  const ownerEmpty = await collectOwnerGroupLogsSample(page);
  writeJson("owner-html-group-logs-empty-sample.json", ownerEmpty);

  await page.goto("/design");
  await openGroupLogs(page);
  await expect(page.getByRole("heading", { name: "集团日志" })).toBeVisible();
  await expect(page.getByTestId("m7-group-logs-subtitle")).toHaveText(
    "操作日志 · 跨租户 · 7 条"
  );
  await expect(page.getByTestId("m7-group-logs-search")).toHaveAttribute(
    "placeholder",
    "搜索租户 / 操作人 / 对象 / 内容…"
  );
  expect(await page.locator(".uz-glog-chip").allTextContents()).toEqual(
    ownerChipLabels
  );
  await expect(
    page.getByTestId("m7-group-logs-page").getByRole("button", {
      exact: true,
      name: "模板中心"
    })
  ).toHaveCount(0);
  await expectTableShape(page);
  const desktopMetrics = await collectGroupLogMetrics(page);
  expect(desktopMetrics.shellLevel).toBe("group");
  expect(desktopMetrics.activePageId).toBe("group.logs");
  expect(desktopMetrics.hasTenantId).toBe(false);
  expect(desktopMetrics.navWidth).toBe(232);
  expect(desktopMetrics.topbarHeight).toBeGreaterThanOrEqual(52);
  expect(desktopMetrics.topbarHeight).toBeLessThanOrEqual(53);
  expect(desktopMetrics.sourceLikeDefaultVisible).toBe(true);
  expect(desktopMetrics.runtimeLabelsVisible).toBe(true);
  expect(desktopMetrics.sidebarCategories).toEqual(groupSections);
  expect(desktopMetrics.tenantButtonCount).toBe(0);
  expect(desktopMetrics.tenantCategoryCount).toBe(0);
  await saveShot(page, "react-group-logs-desktop-default.png", true);

  await page.getByTestId("m7-group-logs-search").fill("not-matching-react-row");
  await expect(page.getByTestId("m7-group-logs-empty")).toContainText(
    "没有匹配「not-matching-react-row」的记录"
  );
  await expect(page.getByTestId("m7-group-logs-subtitle")).toHaveText(
    "操作日志 · 跨租户 · 显示 0 / 7 条"
  );
  const emptyMetrics = await collectGroupLogMetrics(page);
  expect(emptyMetrics.sourceLikeEmptyVisible).toBe(true);
  await saveShot(page, "react-group-logs-filter-empty.png", true);

  await page.getByTestId("m7-group-logs-search").fill("");
  await page.getByTestId("m7-group-logs-export").click();
  await expectLocalToast(page, [
    "browser-local only",
    "7 synthetic audit rows",
    "no production audit export",
    "no file written",
    "no audit runtime call"
  ]);
  await page.getByRole("button", { name: /本地预览日志详情 AI 成员 agent-02/ }).click();
  await expectLocalToast(page, [
    "AI 成员 / agent-02 detail preview",
    "no real tenant/action navigation",
    "no audit runtime call"
  ]);
  const actionMetrics = await collectGroupLogMetrics(page);
  expect(actionMetrics.sourceLikeLocalToastVisible).toBe(true);
  await saveShot(page, "react-group-logs-local-action.png", true);

  await page.getByRole("button", { name: "Collapse navigation" }).click();
  const collapsedMetrics = await collectGroupLogMetrics(page);
  expect(collapsedMetrics.navWidth).toBe(68);
  await saveShot(page, "react-group-logs-collapsed-sidebar.png", true);

  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/design");
  await openGroupLogs(page);
  await expect(page.locator(".uz-glog-card").first()).toBeVisible();
  const mobileMetrics = await collectGroupLogMetrics(page);
  expect(mobileMetrics.bodyScrollWidth).toBeLessThanOrEqual(320);
  expect(mobileMetrics.documentScrollWidth).toBeLessThanOrEqual(320);
  expect(mobileMetrics.panelWidth).toBeLessThanOrEqual(296);
  await saveShot(page, "react-group-logs-mobile-320.png", true);

  writeJson("metrics.json", {
    collapsed: collapsedMetrics,
    desktop: desktopMetrics,
    empty: emptyMetrics,
    localAction: actionMetrics,
    mobile: mobileMetrics,
    ownerDefault,
    ownerEmpty,
    sourceMapping: mapping
  });
});

async function openGroupLogs(page: Page, query = "") {
  await page.goto(`/design${query}`);
  await page
    .getByTestId("app-shell-nav")
    .getByRole("button", { exact: true, name: "集团日志" })
    .click();
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "group.logs"
  );
  await expect(page.getByTestId("m7-group-logs-page")).toBeVisible();
}

async function clickFirstVisibleText(page: Page, text: string) {
  const target = page.getByText(text, { exact: true }).first();
  try {
    await target.click({ timeout: 3000 });
  } catch {
    // Owner HTML may already be on the target layer/page when this helper is reused.
  }
}

async function expectTableShape(page: Page) {
  await expect(page.locator(".uz-glog-table th")).toHaveText(tableColumns);
  await expect(page.locator(".uz-glog-row")).toHaveCount(7);
  await expect(page.locator(".uz-glog-row").first()).toContainText("恢复白桦母婴 AI");
  await expect(page.locator(".uz-glog-row", { hasText: "复制模板" })).toHaveCount(1);
}

async function expectLocalToast(page: Page, labels: readonly string[]) {
  const toast = page.getByTestId("m7-group-logs-toast");
  await expect(toast).toHaveAttribute("role", "status");
  await expect(toast).toHaveAttribute("aria-live", "polite");
  for (const label of labels) await expect(toast).toContainText(label);
}

async function saveShot(page: Page, name: string, fullPage = false) {
  await page.screenshot({ fullPage, path: `${artifactDir}/${name}` });
}

function writeJson(name: string, value: unknown) {
  writeFileSync(`${artifactDir}/${name}`, `${JSON.stringify(value, null, 2)}\n`);
}

async function collectOwnerGroupLogsSample(page: Page) {
  const sample = await page.evaluate((chips) => {
    const text = document.body.innerText.replace(/\s+/g, " ").trim();
    const inHeader = (label: string) =>
      Array.from(document.querySelectorAll("*")).some((node) => {
        const box = (node as HTMLElement).getBoundingClientRect();
        return (
          (node.textContent ?? "").trim() === label &&
          box.x > 232 &&
          box.y >= 52 &&
          box.y < 153
        );
      });
    return {
      bodyTextLength: text.length,
      chipLabels: chips.filter((label) => inHeader(label)),
      containsTemplateCenterChip: inHeader("模板中心"),
      sample: text.slice(0, 1400),
      searchPlaceholder:
        Array.from(document.querySelectorAll("input"))
          .find((input) =>
            (input.getAttribute("placeholder") ?? "").includes("搜索租户")
          )
          ?.getAttribute("placeholder") ?? "",
      tableCellTexts: Array.from(document.querySelectorAll("td")).map((node) =>
        (node.textContent ?? "").trim()
      ),
      tableHeaderTexts: Array.from(document.querySelectorAll("th")).map((node) =>
        (node.textContent ?? "").trim()
      ),
      titleInHeader: inHeader("集团日志")
    };
  }, ownerChipLabels);
  return {
    bodyTextLength: sample.bodyTextLength,
    chipLabels: sample.chipLabels,
    contains: {
      blankRenderedCells:
        sample.tableHeaderTexts.length > 0 &&
        sample.tableCellTexts.length > 0 &&
        sample.tableHeaderTexts.every((value) => value === "") &&
        sample.tableCellTexts.every((value) => value === ""),
      emptyText: sample.sample.includes("没有匹配「"),
      subtitle: sample.sample.includes("操作日志 · 跨租户 · 7 条"),
      tableColumns: includesAll(sample.tableHeaderTexts.join("|"), tableColumns),
      tableRows: sample.tableCellTexts.some((value) =>
        value.includes("恢复白桦母婴 AI")
      ),
      templateCenterChip: sample.containsTemplateCenterChip,
      title: sample.titleInHeader
    },
    sample: sample.sample,
    searchPlaceholder: sample.searchPlaceholder,
    tableCellTexts: sample.tableCellTexts,
    tableHeaderTexts: sample.tableHeaderTexts
  };
}

async function collectGroupLogMetrics(page: Page) {
  const navButtons = await page
    .locator('[data-testid="app-shell-nav"] button')
    .allTextContents();
  const sidebarCategories = await page
    .locator('[data-testid="app-shell-nav"] .uz-nav-group p')
    .allTextContents();
  const visibleText = await page.locator("body").innerText();
  const tableColumnTexts = await page.locator(".uz-glog-table th").allTextContents();
  const rowTexts = await page.locator(".uz-glog-row").allTextContents();
  const toastText = await optionalText(page.getByTestId("m7-group-logs-toast"));
  const subtitle = await page.getByTestId("m7-group-logs-subtitle").textContent();
  const visibleChipLabels = await page.locator(".uz-glog-chip").allTextContents();
  const sourceLike = {
    chips: visibleChipLabels.join("|") === ownerChipLabels.join("|"),
    detailAction: await page
      .locator(".uz-glog-detail")
      .count()
      .then((count) => count >= 5),
    export: (await width(page.getByTestId("m7-group-logs-export"))) > 0,
    localToast: toastText.includes("browser-local only"),
    panel: (await width(page.locator(".uz-glog-panel"))) > 0,
    rows: rowTexts.length === 7 && rowTexts.some((row) => row.includes("复制模板")),
    search:
      (await page.getByTestId("m7-group-logs-search").getAttribute("placeholder")) ===
      "搜索租户 / 操作人 / 对象 / 内容…",
    subtitle:
      subtitle === "操作日志 · 跨租户 · 7 条" ||
      subtitle === "操作日志 · 跨租户 · 显示 0 / 7 条",
    tableColumns: tableColumnTexts.join("|") === tableColumns.join("|"),
    title: visibleText.includes("集团日志")
  };
  return {
    activePageId: await page
      .getByTestId("admin-shell")
      .getAttribute("data-active-page-id"),
    bodyScrollWidth: await page.evaluate(() => document.body.scrollWidth),
    documentScrollWidth: await page.evaluate(
      () => document.documentElement.scrollWidth
    ),
    emptyText: await optionalText(page.getByTestId("m7-group-logs-empty")),
    hasTenantId:
      (await page.getByTestId("page-outlet").getAttribute("data-tenant-id")) !== null,
    headerHeight: await height(page.locator(".uz-glog-head")),
    headerWidth: await width(page.locator(".uz-glog-head")),
    navWidth: await width(page.getByTestId("app-shell-nav")),
    panelHeight: await height(page.locator(".uz-glog-panel")),
    panelWidth: await width(page.locator(".uz-glog-panel")),
    rowHeight: rowTexts.length ? await height(page.locator(".uz-glog-row").first()) : 0,
    rowTexts,
    runtimeLabelsVisible: includesAll(visibleText, runtimeLabels),
    searchWidth: await width(page.locator(".uz-glog-search")),
    shellLevel: await page.getByTestId("admin-shell").getAttribute("data-shell-level"),
    sidebarCategories,
    sourceLike,
    sourceLikeDefaultVisible: Object.values(sourceLike)
      .filter((_, index) => index !== 3)
      .every(Boolean),
    sourceLikeEmptyVisible: visibleText.includes(
      "没有匹配「not-matching-react-row」的记录"
    ),
    sourceLikeLocalToastVisible: sourceLike.localToast,
    tableScrollWidth: await page
      .locator(".uz-glog-table")
      .evaluate((node) => (node as HTMLElement).scrollWidth),
    tenantButtonCount: tenantLabels.filter((label) => navButtons.includes(label))
      .length,
    tenantCategoryCount: tenantSections.filter((label) =>
      sidebarCategories.includes(label)
    ).length,
    topbarHeight: await height(page.locator(".uz-topbar")),
    visibleChipLabels
  };
}

async function optionalText(locator: Locator) {
  return (await locator.count()) ? ((await locator.textContent()) ?? "") : "";
}

async function width(locator: Locator) {
  const box = await locator.boundingBox();
  return Math.round(box?.width ?? 0);
}

async function height(locator: Locator) {
  const box = await locator.boundingBox();
  return Math.round(box?.height ?? 0);
}

function writeSourceMappingSummary() {
  const sources: Record<keyof typeof sourceFiles, string> = {
    fixtures: readFileSync(sourceFiles.fixtures, "utf8"),
    navigation: readFileSync(sourceFiles.navigation, "utf8"),
    page: readFileSync(sourceFiles.page, "utf8")
  };
  const owner = readFileSync(ownerHtml, "utf8");
  const joined = `${sources.page}\n${sources.fixtures}\n${sources.navigation}`;
  const templateStart = owner.indexOf("<!-- ===== 集团日志 ===== -->");
  const tableStart = owner.indexOf("<table", templateStart);
  const malformedLoop =
    templateStart > -1 &&
    owner.indexOf("gLogRows", templateStart) > -1 &&
    owner.indexOf("gLogRows", templateStart) < tableStart;
  const mapping = {
    conflict: {
      ownerBundleAndUnpackedRowsPresent: includesAll(joined, [
        "GLOG_BASE",
        "恢复白桦母婴 AI",
        "订单 API 降级为导入兜底",
        "复制模板"
      ]),
      ownerBundleTableTemplateMalformed: malformedLoop,
      ownerChipTemplateExcludesTemplateCenter: owner.includes(
        "const gLogChipDefs=['全部模块','AI 成员','连接中心','配置','租户管理','对话','工单'];"
      ),
      ownerRenderedTableConflictStatus: "rendered_table_blank_due_malformed_sc_for",
      unpackedChipsIncludeTemplateCenter: sources.fixtures.includes("模板中心")
    },
    decision: {
      ownerHtmlRole:
        "primary for rendered header subtitle search export chip order and empty text",
      reactFollows:
        "owner-html-visible-primary-values-and-source-shaped-table-requirement",
      unpacked6Role:
        "secondary structured table/row source because owner rendered table cells are blank"
    },
    filesRead: [ownerHtml, ...Object.values(sourceFiles)],
    ownerHtmlBundle: {
      chips: ownerChipLabels.filter((label) => owner.includes(label)),
      emptyTextTemplatePresent: owner.includes("没有匹配「{{ gLogSearchVal }}」的记录"),
      searchPlaceholderPresent: owner.includes("搜索租户 / 操作人 / 对象 / 内容…"),
      tableColumns: tableColumns.filter((label) => owner.includes(label)),
      tableTemplatePresent: includesAll(owner, ["gLogCols", "gLogRows", "gLogBase"])
    },
    unpacked6: {
      columns: tableColumns.filter((label) => joined.includes(label)),
      moduleChips: unpackedChipLabels.filter((label) =>
        sources.fixtures.includes(label)
      ),
      navigationGroupLogs: includesAll(sources.navigation, ["治理", "集团日志"]),
      rows: [
        "恢复白桦母婴 AI",
        "订单 API 降级为导入兜底",
        "日成本上限 ¥180",
        "退款诉求",
        "复制模板",
        "关闭工单",
        "停用租户"
      ].filter((label) => joined.includes(label))
    }
  };
  writeJson("unpacked-group-logs-source-mapping.json", mapping);
  return mapping;
}

const includesAll = (text: string, labels: readonly string[]) =>
  labels.every((label) => text.includes(label));
