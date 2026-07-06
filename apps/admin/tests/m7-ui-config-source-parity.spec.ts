import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { expect, type Locator, test, type Page } from "@playwright/test";

const artifactDir = "/tmp/uzmax-m7-ui-76-config-source-parity-refresh";
const ownerHtml = "/Users/atilla/Downloads/运营塔台1.0.html";
const sourceFiles = {
  fixtures: "/Users/atilla/源码/unpacked 6/fixtures/config.ts",
  hook: "/Users/atilla/源码/unpacked 6/hooks/useConfig.ts",
  page: "/Users/atilla/源码/unpacked 6/pages/config/ConfigPage.tsx"
};
const tenantSections = ["运营", "数据", "智能", "管理", "洞察"];
const groupSections = ["总览", "平台", "治理"];
const tenantLabels =
  "对话|工单|确认队列|客户资产|订单|知识与资源|评测中心|AI 成员|团队|配置|分析|日志".split(
    "|"
  );
const groupLabels =
  "集团总览|模型/成本/风险|模板中心|连接中心|发布与验收|租户管理|集团日志".split("|");
const configSections =
  "业务配置|SLA|模板|模型路由|成本护栏|熔断阈值|渠道配置|订单 connector".split("|");
const runtimeLabels =
  "degraded|mock|browser-local only|no production config write|no audit write|no connector switch|no eval-gated publish|no API call".split(
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

test("captures owner source and React tenant config source parity refresh", async ({
  page
}) => {
  const mapping = writeSourceMappingSummary();
  expect(mapping.unpacked.navLabels).toEqual(configSections);
  expect(mapping.unpacked.pageHasIconNav).toBe(true);
  expect(mapping.unpacked.pageHasSourceGeometry).toBe(true);

  const ownerDefault = await captureOwnerConfig(page);
  expect(ownerDefault.contains.title).toBe(true);
  expect(ownerDefault.contains.sectionLabels).toBe(true);

  await page.setViewportSize({ width: 1440, height: 900 });
  await openConfig(page);
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "tenant"
  );
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.config"
  );
  await expect(page.getByTestId("m7-config-page")).toHaveAttribute(
    "data-selected-tenant-id",
    "tenant-b"
  );
  await expect(page.getByTestId("m7-config-page")).not.toContainText(
    "tenant-b · tenant layer"
  );
  await expect(page.getByTestId("m7-config-version-head")).toContainText("业务配置");
  await expect(page.getByTestId("m7-config-version-meta")).toContainText("当前版本 v3");
  await expect(page.getByTestId("m7-config-runtime-note")).toHaveAttribute(
    "hidden",
    ""
  );
  for (const label of runtimeLabels) {
    await expect(page.getByTestId("m7-config-runtime-note")).toHaveAttribute(
      "data-runtime-boundary",
      new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    );
  }
  await expectConfigInternalNav(page);
  await expectLayerNav(page);
  const desktopMetrics = await collectConfigMetrics(page);
  expect(desktopMetrics.shellLevel).toBe("tenant");
  expect(desktopMetrics.activePageId).toBe("tenant.config");
  expect(desktopMetrics.navWidth).toBe(232);
  expect(desktopMetrics.topbarHeight).toBeGreaterThanOrEqual(52);
  expect(desktopMetrics.topbarHeight).toBeLessThanOrEqual(53);
  expect(desktopMetrics.internalNavWidth).toBe(236);
  expect(desktopMetrics.internalNavCount).toBe(8);
  expect(desktopMetrics.internalNavIconCount).toBe(8);
  expect(desktopMetrics.configMainPadding).toEqual({
    bottom: 20,
    left: 24,
    right: 24,
    top: 20
  });
  expect(desktopMetrics.bizGridMaxWidth).toBe(640);
  expect(desktopMetrics.runtimeLabelsPresent).toBe(true);
  expect(desktopMetrics.runtimeNoteVisible).toBe(false);
  await saveShot(page, "react-config-desktop-biz.png", true);

  await page.locator(".uz-config-field select").first().selectOption("俄语");
  await expect(page.getByTestId("m7-config-version-head")).toContainText(
    "未保存的修改"
  );
  const dirtyMetrics = await collectConfigMetrics(page);
  expect(dirtyMetrics.dirtyBadgeVisible).toBe(true);
  await saveShot(page, "react-config-dirty-state.png", true);
  await page.getByTestId("m7-config-save").click();
  await expectLocalToast(page, "配置变更已暂存，并生成新的版本预览");

  await page.getByRole("button", { name: /版本历史/ }).click();
  await expect(page.getByTestId("m7-config-history")).toContainText(
    "版本历史 · 回滚需二次确认并写审计"
  );
  await expect(page.getByTestId("m7-config-history")).not.toContainText(
    "browser-local only"
  );
  const historyMetrics = await collectConfigMetrics(page);
  expect(historyMetrics.historyVisible).toBe(true);
  await saveShot(page, "react-config-version-history.png", true);
  await page.getByRole("button", { name: "回滚到此版本" }).first().click();
  const rollbackModal = page.getByTestId("m7-confirm-modal");
  await expect(rollbackModal).toContainText("回滚预览");
  await expectRuntimeBoundary(rollbackModal.locator("[data-runtime-boundary]"));
  await expectLocalizedConfirm(rollbackModal, "回滚原因");
  await expect(rollbackModal.getByRole("button", { name: "回滚" })).toBeDisabled();
  await rollbackModal.getByRole("textbox").fill("回滚预览原因");
  await rollbackModal.getByRole("button", { name: "回滚" }).click();
  await expectLocalToast(page, /回滚到 v\d+ 的预览已排队/);

  const internal = page.getByTestId("m7-config-internal-nav");
  await internal.getByRole("button", { exact: true, name: "渠道配置" }).click();
  await page.getByRole("button", { name: "测试连接" }).first().click();
  await expectLocalToast(page, "渠道连通性检查已更新");
  await page.locator(".uz-config-switch").first().click();
  await expect(page.getByTestId("m7-config-version-head")).toContainText(
    "未保存的修改"
  );

  await internal.getByRole("button", { exact: true, name: "订单 connector" }).click();
  await expect(page.getByTestId("m7-config-page")).toContainText("订单 API（主路径）");
  await page.getByRole("button", { name: "测试连接" }).click();
  await expectLocalToast(page, "订单连接健康状态已刷新");
  await page.getByRole("button", { name: "切换为导入快照主路径" }).click();
  const switchModal = page.getByTestId("m7-confirm-modal");
  await expect(switchModal).toContainText("订单主路径将切换为");
  await expectRuntimeBoundary(switchModal.locator("[data-runtime-boundary]"));
  await expectLocalizedConfirm(switchModal, "切换原因");
  await saveShot(page, "react-config-connector-confirm-modal.png", true);
  await switchModal.getByRole("textbox").fill("切换预览原因");
  await switchModal.getByRole("button", { name: "确认本地切换" }).click();
  await expectLocalToast(page, "订单数据主路径预览已切换");
  const connectorMetrics = await collectConfigMetrics(page);
  expect(connectorMetrics.connectorSectionVisible).toBe(true);
  await saveShot(page, "react-config-connector-section.png", true);

  await page.getByRole("button", { name: "Collapse navigation" }).click();
  const collapsedMetrics = await collectConfigMetrics(page);
  expect(collapsedMetrics.navWidth).toBe(68);
  await saveShot(page, "react-config-collapsed-nav.png", true);

  await page.setViewportSize({ width: 320, height: 900 });
  await openConfig(page);
  await expect(page.getByTestId("m7-config-internal-nav")).toBeVisible();
  const mobileMetrics = await collectConfigMetrics(page);
  expect(mobileMetrics.bodyScrollWidth).toBeLessThanOrEqual(320);
  expect(mobileMetrics.documentScrollWidth).toBeLessThanOrEqual(320);
  await saveShot(page, "react-config-mobile-320.png", true);

  writeJson("metrics.json", {
    collapsed: collapsedMetrics,
    connector: connectorMetrics,
    desktop: desktopMetrics,
    dirty: dirtyMetrics,
    history: historyMetrics,
    mobile: mobileMetrics,
    ownerDefault,
    sourceMapping: mapping
  });
});

async function captureOwnerConfig(page: Page) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(pathToFileURL(ownerHtml).toString());
  await page.waitForLoadState("domcontentloaded");
  await clickFirstVisibleText(page, "配置");
  await page.waitForTimeout(500);
  await saveShot(page, "owner-html-config-desktop.png", true);
  const sample = await collectOwnerConfigSample(page);
  writeJson("owner-html-config-rendered-sample.json", sample);
  return sample;
}

async function clickFirstVisibleText(page: Page, text: string) {
  const target = page.getByText(text, { exact: true }).first();
  try {
    await target.click({ timeout: 3000 });
  } catch {
    // Owner HTML may already be on the target layer/page when this helper is reused.
  }
}

async function openConfig(page: Page, query = "") {
  await page.goto(`/design${query}`);
  await page.getByTestId("tenant-switcher").selectOption("tenant-b");
  await page
    .getByTestId("app-shell-nav")
    .getByRole("button", { exact: true, name: "配置" })
    .click();
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.config"
  );
}

async function expectConfigInternalNav(page: Page) {
  const internal = page.getByTestId("m7-config-internal-nav");
  await expect(internal.getByRole("heading", { name: "配置" })).toBeVisible();
  for (const label of configSections) {
    await expect(
      internal.getByRole("button", { exact: true, name: label })
    ).toBeVisible();
  }
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

async function expectLocalToast(page: Page, message: string | RegExp) {
  const toast = page.getByTestId("m7-config-toast");
  await expect(toast).toHaveAttribute("role", "status");
  await expect(toast).toContainText(message);
  await expectRuntimeBoundary(toast);
}

async function expectLocalizedConfirm(modal: Locator, reasonLabel: string) {
  await expect(modal.getByRole("button", { name: "取消" })).toBeVisible();
  await expect(modal.getByText(reasonLabel, { exact: true })).toBeVisible();
  await expect(modal.getByRole("button", { name: "Cancel" })).toHaveCount(0);
  await expect(modal.getByText("Reason", { exact: true })).toHaveCount(0);
}

async function expectRuntimeBoundary(locator: Locator) {
  const text = await locator.evaluate((node) =>
    [
      node.getAttribute("data-runtime-boundary") ?? "",
      node.getAttribute("title") ?? "",
      node.textContent ?? ""
    ].join(" ")
  );
  for (const label of runtimeLabels) expect(text).toContain(label);
}

async function collectOwnerConfigSample(page: Page) {
  return page.evaluate((sections) => {
    const text = document.body.innerText.replace(/\s+/g, " ").trim();
    const navCandidates = sections.map((label: string) => {
      const boxes = Array.from(document.querySelectorAll("*"))
        .filter((node) => (node.textContent ?? "").trim() === label)
        .map((node) => {
          const rect = (node as HTMLElement).getBoundingClientRect();
          return {
            height: Math.round(rect.height),
            text: label,
            width: Math.round(rect.width),
            x: Math.round(rect.x),
            y: Math.round(rect.y)
          };
        });
      return { boxes, label };
    });
    const headers = Array.from(document.querySelectorAll("th")).map((node) =>
      (node.textContent ?? "").trim()
    );
    const cells = Array.from(document.querySelectorAll("td")).map((node) =>
      (node.textContent ?? "").trim()
    );
    return {
      bodyTextLength: text.length,
      contains: {
        blankRenderedTable:
          headers.length > 0 &&
          cells.length > 0 &&
          headers.every((value) => value === "") &&
          cells.every((value) => value === ""),
        dirtyBadge: text.includes("未保存的修改"),
        history: text.includes("版本历史"),
        save: text.includes("保存并生成版本"),
        sectionLabels: sections.every((label: string) => text.includes(label)),
        title: text.includes("配置"),
        versionHead: text.includes("当前版本")
      },
      navCandidates,
      sample: text.slice(0, 1600),
      tableCellTexts: cells,
      tableHeaderTexts: headers
    };
  }, configSections);
}

async function collectConfigMetrics(page: Page) {
  const navButtons = await page
    .locator('[data-testid="app-shell-nav"] button')
    .allTextContents();
  const sidebarCategories = await page
    .locator('[data-testid="app-shell-nav"] .uz-nav-group p')
    .allTextContents();
  const internalLabels = await page
    .getByTestId("m7-config-internal-nav")
    .getByRole("button")
    .allTextContents();
  const visibleText = await page.locator("body").innerText();
  const fullText = await page
    .locator("body")
    .evaluate((node) => node.textContent ?? "");
  const configMainPadding = await page.locator(".uz-config-main").evaluate((node) => {
    const style = getComputedStyle(node);
    return {
      bottom: Number.parseFloat(style.paddingBottom),
      left: Number.parseFloat(style.paddingLeft),
      right: Number.parseFloat(style.paddingRight),
      top: Number.parseFloat(style.paddingTop)
    };
  });
  const bizGrid = page.locator(".uz-config-grid");
  const bizGridMaxWidth = (await bizGrid.count())
    ? await bizGrid.evaluate((node) => {
        const maxWidth = getComputedStyle(node).maxWidth;
        return Number.parseFloat(maxWidth);
      })
    : 0;
  const runtimeNote = page.getByTestId("m7-config-runtime-note");
  return {
    activePageId: await page
      .getByTestId("admin-shell")
      .getAttribute("data-active-page-id"),
    bizGridMaxWidth,
    bodyScrollWidth: await page.evaluate(() => document.body.scrollWidth),
    configMainPadding,
    connectorSectionVisible: visibleText.includes("当前主路径"),
    dirtyBadgeVisible: await page.locator(".uz-config-dirty-badge").isVisible(),
    documentScrollWidth: await page.evaluate(
      () => document.documentElement.scrollWidth
    ),
    groupNavLabelsAbsent: groupLabels.every((label) => !navButtons.includes(label)),
    historyVisible: await isVisible(page.getByTestId("m7-config-history")),
    internalNavCount: internalLabels.length,
    internalNavIconCount: await page
      .getByTestId("m7-config-internal-nav")
      .locator("[data-icon-slot] svg")
      .count(),
    internalNavLabels: internalLabels,
    internalNavWidth: await width(page.getByTestId("m7-config-internal-nav")),
    navWidth: await width(page.getByTestId("app-shell-nav")),
    runtimeLabelsPresent: runtimeLabels.every((label) => fullText.includes(label)),
    runtimeNoteVisible: await isVisible(runtimeNote),
    sectionLabels: configSections,
    shellLevel: await page.getByTestId("admin-shell").getAttribute("data-shell-level"),
    sidebarCategories,
    tenantCategoryLabelsPresent: tenantSections.every((label) =>
      sidebarCategories.includes(label)
    ),
    topbarHeight: await height(page.locator(".uz-topbar")),
    versionHeadText: await page.getByTestId("m7-config-version-head").textContent()
  };
}

async function saveShot(page: Page, name: string, fullPage = false) {
  await page.screenshot({ fullPage, path: `${artifactDir}/${name}` });
}

function writeJson(name: string, value: unknown) {
  writeFileSync(`${artifactDir}/${name}`, `${JSON.stringify(value, null, 2)}\n`);
}

async function isVisible(locator: Locator) {
  if ((await locator.count()) === 0) return false;
  const box = await locator.boundingBox();
  return Boolean(box && box.width > 1 && box.height > 1);
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
    hook: readFileSync(sourceFiles.hook, "utf8"),
    page: readFileSync(sourceFiles.page, "utf8")
  };
  const owner = readFileSync(ownerHtml, "utf8");
  const joined = `${sources.page}\n${sources.fixtures}\n${sources.hook}`;
  const mapping = {
    decision: {
      reactFollows:
        "rendered-owner-html-first-then-unpacked-config-source-for-structured-details"
    },
    files: sourceFiles,
    ownerBundle: {
      configStateKeysPresent: "cfgSecLabel|cfgVerBadge|cfgVerMeta|cfgConnSwitchLabel"
        .split("|")
        .filter((term) => owner.includes(term)),
      sectionLabels: configSections.filter((label) => owner.includes(label))
    },
    unpacked: {
      fixturesHaveNavIcons: "Briefcase|Timer|Copy|Route|Shield|ZapOff|Radio|Plug"
        .split("|")
        .every((term) => sources.fixtures.includes(term)),
      hookHasLocalState:
        sources.hook.includes("dirty") &&
        sources.hook.includes("switchConnector") &&
        sources.hook.includes("rollback"),
      navLabels: configSections.filter((label) => joined.includes(label)),
      pageHasIconNav:
        sources.page.includes("NAV_ICONS") &&
        sources.page.includes("Icon icon={NAV_ICONS[c.id]}"),
      pageHasSourceGeometry:
        sources.page.includes("padding: '20px 24px'") &&
        sources.page.includes("maxWidth: 640") &&
        sources.page.includes("width: 236")
    }
  };
  writeJson("unpacked-config-source-mapping.json", mapping);
  return mapping;
}
