import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { expect, type Locator, type Page } from "@playwright/test";

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
export const configSections =
  "业务配置|SLA|模板|模型路由|成本护栏|熔断阈值|渠道配置|订单 connector".split("|");
export const runtimeLabels =
  "degraded|mock|browser-local only|no production config write|no audit write|no connector switch|no eval-gated publish|no API call".split(
    "|"
  );

mkdirSync(artifactDir, { recursive: true });

export async function captureOwnerConfig(page: Page) {
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

export async function openConfig(page: Page, query = "") {
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

export async function expectConfigInternalNav(page: Page) {
  const internal = page.getByTestId("m7-config-internal-nav");
  await expect(internal.getByRole("heading", { name: "配置" })).toBeVisible();
  for (const label of configSections) {
    await expect(
      internal.getByRole("button", { exact: true, name: label })
    ).toBeVisible();
  }
}

export async function expectLayerNav(page: Page) {
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

export async function expectLocalToast(page: Page, message: string | RegExp) {
  const toast = page.getByTestId("m7-config-toast");
  await expect(toast).toHaveAttribute("role", "status");
  await expect(toast).toContainText(message);
  await expectRuntimeBoundary(toast);
}

export async function expectLocalizedConfirm(modal: Locator, reasonLabel: string) {
  await expect(modal.getByRole("button", { name: "取消" })).toBeVisible();
  await expect(modal.getByText(reasonLabel, { exact: true })).toBeVisible();
  await expect(modal.getByRole("button", { name: "Cancel" })).toHaveCount(0);
  await expect(modal.getByText("Reason", { exact: true })).toHaveCount(0);
}

export async function expectRuntimeBoundary(locator: Locator) {
  const text = await locator.evaluate((node) =>
    [
      node.getAttribute("data-runtime-boundary") ?? "",
      node.getAttribute("title") ?? "",
      node.textContent ?? ""
    ].join(" ")
  );
  for (const label of runtimeLabels) expect(text).toContain(label);
}

export async function collectConfigMetrics(page: Page) {
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

export async function saveShot(page: Page, name: string, fullPage = false) {
  await page.screenshot({ fullPage, path: `${artifactDir}/${name}` });
}

export function writeJson(name: string, value: unknown) {
  writeFileSync(`${artifactDir}/${name}`, `${JSON.stringify(value, null, 2)}\n`);
}

export function writeSourceMappingSummary() {
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

async function clickFirstVisibleText(page: Page, text: string) {
  const target = page.getByText(text, { exact: true }).first();
  try {
    await target.click({ timeout: 3000 });
  } catch {
    // Owner HTML may already be on the target layer/page when this helper is reused.
  }
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
