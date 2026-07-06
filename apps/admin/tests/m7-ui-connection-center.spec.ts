import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

const artifactDir = "/tmp/uzmax-m7-ui-51-connection-center-visible-ui";
const ownerHtmlPath = "/Users/atilla/Downloads/运营塔台1.0.html";
const unpackedPagePath =
  "/Users/atilla/源码/unpacked 6/pages/group/GroupConnectionPage.tsx";
const unpackedFixturePath = "/Users/atilla/源码/unpacked 6/fixtures/groupPlatform.ts";
const groupLabels =
  "集团总览|模型/成本/风险|模板中心|连接中心|发布与验收|租户管理|集团日志".split("|");
const tenantLabels =
  "对话|工单|确认队列|客户资产|订单|知识与资源|评测中心|AI 成员|团队|配置|分析|日志".split(
    "|"
  );
const groupSections = ["总览", "平台", "治理"];
const tenantSections = ["运营", "数据", "智能", "管理", "洞察"];
const cardIds = ["tgbot", "tgbiz", "orderapi", "import"] as const;
const fixtureRoutes = [
  "**/conversation-ticket/conversations",
  "**/confirmation-queue/items?status=pending"
] as const;

ensureArtifactDirectory();

test.beforeEach(({ page }) =>
  Promise.all(
    fixtureRoutes.map((url) =>
      page.route(url, (route) => route.fulfill({ json: { items: [] } }))
    )
  ).then(() => undefined)
);

test("records source availability without weakening React assertions", async () => {
  const sourceManifest = {
    ownerHtml: ownerHtmlPath,
    prototypeFixture: unpackedFixturePath,
    prototypePage: unpackedPagePath
  } as const;
  const availability = Object.entries(sourceManifest).map(([kind, path]) => ({
    kind,
    ok: existsSync(path),
    path
  }));
  writeJson("source-availability.json", { availability });

  const missing = availability.flatMap(({ kind, ok, path }) =>
    ok ? [] : [`${kind} missing at ${path}`]
  );
  if (missing.length > 0) {
    writeFileSync(`${artifactDir}/source-unavailable.md`, missing.join("\n"));
    return;
  }

  const sourceTexts = {
    ownerHtml: readFileSync(sourceManifest.ownerHtml, "utf8"),
    prototypeFixture: readFileSync(sourceManifest.prototypeFixture, "utf8"),
    prototypePage: readFileSync(sourceManifest.prototypePage, "utf8")
  };
  const requiredMarkers = [
    {
      body: sourceTexts.prototypePage,
      label: "prototype page",
      markers: ["连接中心", "测试连接", "最近错误"]
    },
    {
      body: sourceTexts.prototypeFixture,
      label: "prototype fixture",
      markers: ["CONN_DEFS", "CONN_HEALTH", "Telegram Business", "订单 API"]
    },
    {
      body: sourceTexts.ownerHtml,
      label: "owner html",
      markers: ["连接中心", "Telegram Bot", "导入兜底"]
    }
  ];
  for (const group of requiredMarkers)
    for (const marker of group.markers)
      expect(group.body, `${group.label} contains ${marker}`).toContain(marker);
  writeJson("source-sampling.json", {
    markerGroups: requiredMarkers.map(({ label, markers }) => ({ label, markers })),
    ownerHtmlPath,
    unpackedFixturePath,
    unpackedPagePath
  });
});

test("renders group connection center with group shell and source labels", async ({
  page
}) => {
  await openConnection(page);
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "group"
  );
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "group.connections"
  );
  await expect(page.getByTestId("page-outlet")).not.toHaveAttribute("data-tenant-id");
  await expect(page.getByRole("heading", { name: "连接中心" })).toBeVisible();
  await expectLayerNav(page);

  const runtimeNote = page.getByTestId("m7-connection-runtime-note");
  for (const label of [
    "degraded",
    "mock",
    "read-only",
    "browser-local only",
    "no production connector change",
    "no real connection test",
    "no external API/Telegram/order API call",
    "no audit write",
    "no feature flag write"
  ])
    await expect(runtimeNote).toContainText(label);

  for (const id of cardIds) await expect(connectionCard(page, id)).toBeVisible();
  await expect(connectionCard(page, "tgbot")).toContainText("Telegram Bot");
  await expect(connectionCard(page, "tgbot")).toContainText("mock 标准接入");
  await expect(connectionCard(page, "tgbiz")).toContainText("Telegram Business");
  await expect(connectionCard(page, "tgbiz")).toContainText("ADR-B01 · 部分可行");
  await expect(connectionCard(page, "orderapi")).toContainText("订单 API");
  await expect(connectionCard(page, "orderapi")).toContainText("ADR-B02 · 无可用 API");
  await expect(connectionCard(page, "import")).toContainText("导入兜底");
  await expect(connectionCard(page, "import")).toContainText(
    "mock 主路径（无 API 时）"
  );

  const metrics = await collectDesktopMetrics(page);
  expect(metrics.activePageId).toBe("group.connections");
  expect(metrics.shellLevel).toBe("group");
  expect(metrics.sidebarExpandedWidth).toBe(232);
  expect(metrics.cardCount).toBe(4);
  expect(Math.min(...metrics.cardWidths)).toBeGreaterThanOrEqual(600);
  writeJson("react-connection-center-desktop-metrics.json", metrics);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-connection-center-desktop.png`
  });
});

test("toggle and test connection stay browser-local only", async ({ page }) => {
  await openConnection(page);
  const toggle = page.getByTestId("m7-connection-toggle-SYN-CONN-orderapi");
  await expect(toggle).toHaveAttribute("aria-checked", "false");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-checked", "true");
  await expect(page.getByTestId("m7-connection-toast")).toContainText(
    "browser-local only"
  );
  await expect(page.getByTestId("m7-connection-toast")).toContainText(
    "no production connector change"
  );
  await expect(page.getByTestId("m7-connection-toast")).toContainText(
    "no external API/Telegram/order API call"
  );
  await expect(page.getByTestId("m7-connection-toast")).toContainText("no audit write");
  await expect(page.getByTestId("m7-connection-toast")).toContainText(
    "no feature flag write"
  );

  const testButton = page.getByTestId("m7-connection-test-SYN-CONN-tgbiz");
  await testButton.click();
  await expect(testButton).toBeDisabled();
  await expect(page.getByTestId("m7-connection-toast")).toContainText(
    "Telegram Business synthetic test finished"
  );
  await expect(page.getByTestId("m7-connection-toast")).toContainText(
    "no real connection test"
  );
});

test("forced URL states render deterministic runtime disclaimers", async ({ page }) => {
  for (const queryKey of ["m7ConnectionState", "state"]) {
    for (const state of ["loading", "empty", "error", "permission", "degraded"]) {
      await openConnection(page, `?${queryKey}=${state}`);
      const target =
        state === "degraded"
          ? page.getByTestId("m7-connection-runtime-note")
          : page.getByTestId(`m7-connection-state-${state}`);
      await expect(target).toContainText("browser-local only");
      await expect(target).toContainText("no production connector change");
      await expect(target).toContainText("no real connection test");
      await expect(target).toContainText("no external API/Telegram/order API call");
      await expect(target).toContainText("no audit write");
      await expect(target).toContainText("no feature flag write");
    }
  }
});

test("sidebar collapse and mobile 320 fallback remain bounded", async ({ page }) => {
  await openConnection(page);
  await page.getByRole("button", { name: "Collapse navigation" }).click();
  await expect(page.getByTestId("app-shell-nav")).toHaveJSProperty("offsetWidth", 68);
  await expect(page.getByTestId("admin-shell")).toHaveClass(/is-nav-collapsed/);
  const collapsedMetrics = {
    navWidth: await elementWidth(page, "app-shell-nav"),
    pageWidth: await elementWidth(page, "m7-connection-page")
  };
  writeJson("react-connection-center-collapsed-metrics.json", collapsedMetrics);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-connection-center-collapsed.png`
  });

  await page.setViewportSize({ width: 320, height: 900 });
  await openConnection(page);
  await expect(page.getByTestId("m7-connection-page")).toBeVisible();
  await expect(connectionCard(page, "tgbot")).toBeVisible();

  const metrics = await collectMobileMetrics(page);
  expect(metrics.bodyScrollWidth).toBeLessThanOrEqual(320);
  expect(metrics.documentScrollWidth).toBeLessThanOrEqual(320);
  expect(metrics.headerWidth).toBeLessThanOrEqual(320);
  expect(metrics.noteWidth).toBeLessThanOrEqual(320);
  expect(metrics.cardWidth).toBeLessThanOrEqual(296);
  writeJson("react-connection-center-mobile-320-metrics.json", metrics);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-connection-center-mobile-320.png`
  });
});

async function openConnection(page: Page, query = "") {
  await page.goto(`/design${query}`);
  await page
    .getByTestId("app-shell-nav")
    .getByRole("button", { exact: true, name: "连接中心" })
    .click();
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "group.connections"
  );
}

async function expectLayerNav(page: Page) {
  const nav = page.getByTestId("app-shell-nav");
  await expect
    .poll(() => nav.locator(".uz-nav-group p").allTextContents())
    .toEqual(groupSections);
  for (const label of groupLabels)
    await expect(nav.getByRole("button", { exact: true, name: label })).toBeVisible();
  for (const label of tenantLabels)
    await expect(nav.getByRole("button", { exact: true, name: label })).toHaveCount(0);
  for (const section of tenantSections)
    await expect(
      nav.locator(".uz-nav-group p").filter({ hasText: section })
    ).toHaveCount(0);
}

function connectionCard(page: Page, id: (typeof cardIds)[number]) {
  return page.getByTestId(`m7-connection-card-SYN-CONN-${id}`);
}

async function collectDesktopMetrics(page: Page) {
  return {
    activePageId: await page
      .getByTestId("admin-shell")
      .getAttribute("data-active-page-id"),
    bodyScrollWidth: await page.evaluate(() => document.body.scrollWidth),
    cardCount: await page.locator(".uz-connection-card").count(),
    cardWidths: await page
      .locator(".uz-connection-card")
      .evaluateAll((nodes) =>
        nodes.map((node) => Math.round((node as HTMLElement).offsetWidth))
      ),
    documentScrollWidth: await page.evaluate(
      () => document.documentElement.scrollWidth
    ),
    headerWidth: await elementWidth(page, "m7-connection-header"),
    shellLevel: await page.getByTestId("admin-shell").getAttribute("data-shell-level"),
    sidebarExpandedWidth: await elementWidth(page, "app-shell-nav"),
    topbarHeight: await page
      .locator(".uz-topbar")
      .evaluate((node) => (node as HTMLElement).offsetHeight)
  };
}

async function collectMobileMetrics(page: Page) {
  const [scrollWidths, cardWidth, headerWidth, noteWidth] = await Promise.all([
    page.evaluate(() => ({
      bodyScrollWidth: document.body.scrollWidth,
      documentScrollWidth: document.documentElement.scrollWidth
    })),
    page
      .locator(".uz-connection-card")
      .first()
      .evaluate((node) => Math.round((node as HTMLElement).offsetWidth)),
    elementWidth(page, "m7-connection-header"),
    elementWidth(page, "m7-connection-runtime-note")
  ]);
  return {
    ...scrollWidths,
    cardWidth,
    headerWidth,
    noteWidth
  };
}

async function elementWidth(page: Page, testId: string) {
  return page
    .getByTestId(testId)
    .evaluate((node) => Math.round((node as HTMLElement).offsetWidth));
}

function writeJson(fileName: string, value: unknown) {
  writeFileSync(`${artifactDir}/${fileName}`, JSON.stringify(value, null, 2));
}

function ensureArtifactDirectory() {
  mkdirSync(artifactDir, { recursive: true });
}
