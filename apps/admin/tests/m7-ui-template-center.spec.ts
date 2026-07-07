import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

const artifactDir = "/tmp/uzmax-m7-ui-50-template-center-page-cleanstack";
const ownerHtmlPath = "/Users/atilla/Downloads/运营塔台1.0.html";
const unpackedPagePath =
  "/Users/atilla/源码/unpacked 6/pages/group/GroupTemplatePage.tsx";
const unpackedFixturePath = "/Users/atilla/源码/unpacked 6/fixtures/groupPlatform.ts";
const groupLabels =
  "集团总览|模型/成本/风险|模板中心|连接中心|发布与验收|租户管理|集团日志".split("|");
const tenantLabels =
  "对话|工单|确认队列|客户资产|订单|知识与资源|评测中心|AI 成员|团队|配置|分析|日志".split(
    "|"
  );
const groupSections = ["总览", "平台", "治理"];
const tenantSections = ["运营", "数据", "智能", "管理", "洞察"];
const tabIds = ["knowledge", "agent", "config", "eval", "quick_reply"] as const;

mkdirSync(artifactDir, { recursive: true });

test.beforeEach(async ({ page }) => {
  await page.route("**/conversation-ticket/conversations", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
  await page.route("**/confirmation-queue/items?status=pending", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
});

test("records source availability without weakening React assertions", async () => {
  const sources = [
    { available: existsSync(ownerHtmlPath), kind: "owner-html", path: ownerHtmlPath },
    {
      available: existsSync(unpackedPagePath),
      kind: "unpacked-page",
      path: unpackedPagePath
    },
    {
      available: existsSync(unpackedFixturePath),
      kind: "unpacked-fixture",
      path: unpackedFixturePath
    }
  ];
  writeJson("source-availability.json", { sources });

  const unavailablePaths: string[] = [];
  for (const source of sources) {
    if (!source.available) unavailablePaths.push(`${source.kind}: ${source.path}`);
  }
  if (unavailablePaths.length > 0) {
    writeFileSync(
      `${artifactDir}/source-unavailable.md`,
      unavailablePaths.map((path) => `unavailable: ${path}`).join("\n")
    );
    return;
  }

  const pageSource = readFileSync(unpackedPagePath, "utf8");
  const fixtureSource = readFileSync(unpackedFixturePath, "utf8");
  const ownerHtml = readFileSync(ownerHtmlPath, "utf8");
  for (const text of ["模板中心", "复制到租户将生成独立版本", "确认复制"])
    expect(pageSource).toContain(text);
  for (const text of ["TMPL_TABS", "TMPL_LIB", "GROUP_TENANTS"])
    expect(fixtureSource).toContain(text);
  for (const text of ["模板中心", "知识包", "话术包"])
    expect(ownerHtml).toContain(text);
  writeJson("source-sampling.json", {
    ownerHtmlPath,
    sampledStrings: ["模板中心", "知识包", "话术包", "确认复制"],
    unpackedFixturePath,
    unpackedPagePath
  });
});

test("renders group template center with boundaries and desktop evidence", async ({
  page
}) => {
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
  await expectTemplateLayerNav(page);
  for (const label of [
    "degraded",
    "mock",
    "read-only",
    "browser-local only",
    "no production template copy",
    "no audit write",
    "no config write",
    "no knowledge/eval/persona/quick-reply write",
    "no ops-assets write"
  ])
    await expect(page.getByTestId("m7-template-runtime-note")).toContainText(label);
  for (const id of tabIds)
    await expect(page.getByTestId(`m7-template-tab-${id}`)).toBeVisible();
  await expect(page.getByTestId("m7-template-tab-knowledge")).toHaveAttribute(
    "aria-selected",
    "true"
  );
  await expect(page.locator(".uz-template-card")).toHaveCount(3);

  const metrics = await collectDesktopMetrics(page);
  expect(metrics.activePageId).toBe("group.templates");
  expect(metrics.shellLevel).toBe("group");
  expect(metrics.sidebarExpandedWidth).toBe(232);
  expect(metrics.headerWidth).toBeGreaterThan(680);
  expect(metrics.tabsWidth).toBeGreaterThan(320);
  expect(Math.min(...metrics.cardWidths)).toBeGreaterThanOrEqual(300);
  writeJson("react-template-center-desktop-metrics.json", metrics);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-template-center-desktop.png`
  });
});

test("copy modal requires selected target and confirms local-only toast", async ({
  page
}) => {
  await openTemplate(page);
  const trigger = page.getByTestId("m7-template-copy-SYN-TMPL-tk1");
  await trigger.click();
  const modal = page.getByTestId("m7-template-copy-modal");
  const close = page.getByRole("button", { name: "关闭复制弹窗" });
  await expect(close).toBeFocused();
  await expect(modal).toHaveAttribute("role", "dialog");
  await expect(modal).toContainText("复制「美妆售后知识包 v4.2」");
  await page.keyboard.press("Escape");
  await expect(modal).toHaveCount(0);
  await expect(trigger).toBeFocused();

  await trigger.click();
  await expect(close).toBeFocused();
  await expect(
    page.locator("[data-testid^='m7-template-tenant-SYN-COPY-']")
  ).toHaveCount(4);
  const confirm = page.getByTestId("m7-template-confirm-copy");
  const target = page.getByTestId("m7-template-tenant-SYN-COPY-t1");
  await expect(confirm).toBeDisabled();
  await expect(target).toHaveAttribute("role", "checkbox");
  await expect(target).toHaveAttribute("aria-checked", "false");
  await target.click();
  await expect(target).toHaveAttribute("aria-checked", "true");
  await expect(confirm).toBeEnabled();
  await close.focus();
  await page.keyboard.press("Shift+Tab");
  await expect(confirm).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-template-center-modal.png`
  });
  await confirm.click();
  const toast = page.getByTestId("m7-template-toast");
  await expect(toast).toHaveAttribute("role", "status");
  await expect(toast).toHaveAttribute("aria-live", "polite");
  await expect(toast).toContainText("browser-local only");
  await expect(toast).toContainText("no production template copy");
  await expect(toast).toContainText("no audit write");
  await expect(toast).toContainText("no config write");
  await expect(toast).toContainText("no knowledge/eval/persona/quick-reply write");
  await expect(toast).toContainText("no ops-assets write");
  await expect(modal).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "group.templates"
  );
});

test("tabs and forced URL states stay deterministic", async ({ page }) => {
  await openTemplate(page);
  const expectedCounts = {
    agent: 2,
    config: 2,
    eval: 2,
    knowledge: 3,
    quick_reply: 2
  } as const;
  for (const id of tabIds) {
    await page.getByTestId(`m7-template-tab-${id}`).click();
    await expect(page.getByTestId(`m7-template-tab-${id}`)).toHaveAttribute(
      "aria-selected",
      "true"
    );
    await expect(page.locator(".uz-template-card")).toHaveCount(expectedCounts[id]);
  }
  for (const queryKey of ["m7TemplateState", "state"]) {
    for (const state of ["loading", "empty", "error", "permission", "degraded"]) {
      await openTemplate(page, `?${queryKey}=${state}`);
      const target =
        state === "degraded"
          ? page.getByTestId("m7-template-runtime-note")
          : page.getByTestId(`m7-template-state-${state}`);
      await expect(target).toContainText("no production template copy");
      await expect(target).toContainText("no audit write");
      await expect(target).toContainText("no config write");
    }
  }
});

test("sidebar collapse and mobile 320 card/modal fallback remain bounded", async ({
  page
}) => {
  await openTemplate(page);
  await page.getByRole("button", { name: "Collapse navigation" }).click();
  await expect(page.getByTestId("app-shell-nav")).toHaveJSProperty("offsetWidth", 68);
  await expect(page.getByTestId("admin-shell")).toHaveClass(/is-nav-collapsed/);

  await page.setViewportSize({ width: 320, height: 900 });
  await openTemplate(page);
  await expect(page.getByTestId("m7-template-page")).toBeVisible();
  await expect(page.locator(".uz-template-card").first()).toBeVisible();
  await page.getByTestId("m7-template-copy-SYN-TMPL-tk1").click();
  await expect(page.getByTestId("m7-template-copy-modal")).toBeVisible();

  const metrics = await collectMobileMetrics(page);
  expect(metrics.bodyScrollWidth).toBeLessThanOrEqual(320);
  expect(metrics.documentScrollWidth).toBeLessThanOrEqual(320);
  expect(metrics.headerWidth).toBeLessThanOrEqual(320);
  expect(metrics.tabsWidth).toBeLessThanOrEqual(296);
  expect(metrics.cardWidth).toBeLessThanOrEqual(296);
  expect(metrics.modalWidth).toBeLessThanOrEqual(296);
  writeJson("react-template-center-mobile-320-metrics.json", metrics);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-template-center-mobile-320.png`
  });
});

async function openTemplate(page: Page, query = "") {
  await page.goto(`/design${query}`);
  const templateNavButton = page
    .getByTestId("app-shell-nav")
    .getByRole("button", { exact: true, name: "模板中心" });
  await templateNavButton.click();
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "group.templates"
  );
}

async function expectTemplateLayerNav(page: Page) {
  const nav = page.getByTestId("app-shell-nav");
  const renderedSections = await nav.locator(".uz-nav-group p").allTextContents();
  expect(renderedSections).toEqual(groupSections);
  for (const label of groupLabels) {
    const groupItem = nav.getByRole("button", { exact: true, name: label });
    await expect(groupItem).toBeVisible();
  }
  for (const label of tenantLabels) {
    const tenantItem = nav.getByRole("button", { exact: true, name: label });
    await expect(tenantItem).toHaveCount(0);
  }
  const sectionLabels = nav.locator(".uz-nav-group p");
  for (const section of tenantSections) {
    await expect(sectionLabels.filter({ hasText: section })).toHaveCount(0);
  }
}

async function collectDesktopMetrics(page: Page) {
  return {
    activePageId: await page
      .getByTestId("admin-shell")
      .getAttribute("data-active-page-id"),
    activeTab: await page
      .locator(".uz-template-tab[aria-selected='true']")
      .textContent(),
    bodyScrollWidth: await page.evaluate(() => document.body.scrollWidth),
    cardCount: await page.locator(".uz-template-card").count(),
    cardWidths: await page
      .locator(".uz-template-card")
      .evaluateAll((nodes) =>
        nodes.map((node) => Math.round((node as HTMLElement).offsetWidth))
      ),
    documentScrollWidth: await page.evaluate(
      () => document.documentElement.scrollWidth
    ),
    headerWidth: await page
      .getByTestId("m7-template-header")
      .evaluate((node) => Math.round((node as HTMLElement).offsetWidth)),
    shellLevel: await page.getByTestId("admin-shell").getAttribute("data-shell-level"),
    sidebarExpandedWidth: await page
      .getByTestId("app-shell-nav")
      .evaluate((node) => (node as HTMLElement).offsetWidth),
    tabsWidth: await page
      .getByTestId("m7-template-tabs")
      .evaluate((node) => Math.round((node as HTMLElement).offsetWidth)),
    topbarHeight: await page
      .locator(".uz-topbar")
      .evaluate((node) => (node as HTMLElement).offsetHeight)
  };
}

async function collectMobileMetrics(page: Page) {
  return {
    bodyScrollWidth: await page.evaluate(() => document.body.scrollWidth),
    cardWidth: await page
      .locator(".uz-template-card")
      .first()
      .evaluate((node) => Math.round((node as HTMLElement).offsetWidth)),
    documentScrollWidth: await page.evaluate(
      () => document.documentElement.scrollWidth
    ),
    headerWidth: await page
      .getByTestId("m7-template-header")
      .evaluate((node) => Math.round((node as HTMLElement).offsetWidth)),
    modalWidth: await page
      .getByTestId("m7-template-copy-modal")
      .evaluate((node) => Math.round((node as HTMLElement).offsetWidth)),
    tabsWidth: await page
      .getByTestId("m7-template-tabs")
      .evaluate((node) => Math.round((node as HTMLElement).offsetWidth))
  };
}

function writeJson(fileName: string, value: unknown) {
  writeFileSync(`${artifactDir}/${fileName}`, JSON.stringify(value, null, 2));
}
