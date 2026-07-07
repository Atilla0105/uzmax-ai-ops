import { mkdirSync, writeFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

const artifactDir = "/tmp/uzmax-m7-ui-97-conversation-source-filter-rail-parity";
const sourceFilterLabels = ["全部", "待人工", "SLA风险", "我接管", "AI处理"];
const sourceRailOrder = [
  "客户档案",
  "客户标签",
  "自定义字段",
  "双轨引导",
  "快捷动作",
  "人工备注"
];

mkdirSync(artifactDir, { recursive: true });

test("matches source conversation filters and right rail priority", async ({
  page
}) => {
  await page.setViewportSize({ width: 1280, height: 840 });
  await openConversations(page);

  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "tenant"
  );
  await expect(page.getByTestId("page-outlet")).toHaveAttribute(
    "data-page-id",
    "tenant.conversations"
  );
  await expect(page.getByTestId("m7-conversation-workbench-page")).toHaveAttribute(
    "data-runtime-source",
    "synthetic"
  );
  await expect(page.getByTestId("m7-conversation-degraded")).toContainText("只读预览");

  const filterRow = page.locator(".uz-conv-filters");
  const filters = filterRow.locator(".uz-conv-filter");
  await expect(filters).toHaveCount(sourceFilterLabels.length);
  const filterLabels = (await filters.allTextContents()).map(stripCount);
  expect(filterLabels).toEqual(sourceFilterLabels);
  const filterRowText = await filterRow.innerText();
  for (const removed of ["未读", "未回", "已解决"])
    expect(filterRowText).not.toContain(removed);

  await expect(page.getByTestId("m7-conversation-row-mock-dilnoza-risk")).toBeVisible();
  await expect(page.locator('[data-testid^="m7-conversation-row-"]')).toHaveCount(8);
  const countBadge = page.locator(".uz-conv-list__head .uz-status-badge");
  await expect(countBadge).toHaveText("8");
  await expect(countBadge).not.toHaveText("8 / 8");

  await page.getByRole("button", { name: /^待人工 1$/ }).click();
  await expect(page.locator('[data-testid^="m7-conversation-row-"]')).toHaveCount(1);
  await expect(countBadge).toHaveText("1 / 8");
  await page.getByRole("button", { name: /^SLA风险 3$/ }).click();
  await expect(page.locator('[data-testid^="m7-conversation-row-"]')).toHaveCount(3);
  await expect(countBadge).toHaveText("3 / 8");
  await page.getByRole("button", { name: /^我接管 1$/ }).click();
  await expect(page.locator('[data-testid^="m7-conversation-row-"]')).toHaveCount(1);
  await expect(countBadge).toHaveText("1 / 8");
  await page.getByRole("button", { name: /^AI处理 3$/ }).click();
  await expect(page.locator('[data-testid^="m7-conversation-row-"]')).toHaveCount(3);
  await expect(countBadge).toHaveText("3 / 8");
  await page.getByRole("button", { name: /^全部 8$/ }).click();
  await expect(countBadge).toHaveText("8");

  const rail = page.getByTestId("m7-conversation-context-rail");
  const railOrder = await rail
    .locator("h3, summary")
    .evaluateAll((nodes) => nodes.map((node) => node.textContent?.trim() ?? ""));
  expect(railOrder.slice(0, sourceRailOrder.length)).toEqual(sourceRailOrder);
  const railGeometry = await collectRailGeometry(page);
  expect(railGeometry.quickTop).toBeLessThan(railGeometry.notesTop);
  expect(railGeometry.notesOpen).toBe(false);

  const metrics = await collectMetrics(page);
  expect(metrics.list.width).toBe(316);
  expect(metrics.rail.width).toBe(340);
  expect(metrics.bodyScrollWidth).toBeLessThanOrEqual(1280);
  expect(metrics.badgeText).toBe("8");
  expect(metrics.filterLabels).toEqual(sourceFilterLabels);
  expect(metrics.railOrder.slice(0, sourceRailOrder.length)).toEqual(sourceRailOrder);

  await page.screenshot({
    fullPage: false,
    path: `${artifactDir}/react-conversation-source-filter-rail-desktop.png`
  });
  writeFileSync(
    `${artifactDir}/react-conversation-source-filter-rail-metrics.json`,
    `${JSON.stringify({ desktop: metrics, railGeometry }, null, 2)}\n`
  );
});

test("keeps source filter rail repair within 320px mobile body width", async ({
  page
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await openConversations(page);
  await expect(page.getByTestId("m7-conversation-workbench-page")).toBeVisible();
  const metrics = await collectMetrics(page);
  expect(metrics.activePageId).toBe("tenant.conversations");
  expect(metrics.shellLevel).toBe("tenant");
  expect(metrics.bodyScrollWidth).toBeLessThanOrEqual(320);
  expect(metrics.filterLabels).toEqual(sourceFilterLabels);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-conversation-source-filter-rail-mobile-320.png`
  });
  writeFileSync(
    `${artifactDir}/react-conversation-source-filter-rail-mobile-metrics.json`,
    `${JSON.stringify({ mobile: metrics }, null, 2)}\n`
  );
});

async function openConversations(page: Page) {
  await routeFallbackList(page);
  await enterTenantConversations(page);
}

async function routeFallbackList(page: Page) {
  await page.route("**/conversation-ticket/conversations", async (route) => {
    await route.fulfill({
      body: fallbackHtml(),
      contentType: "text/html",
      status: 200
    });
  });
}

async function enterTenantConversations(page: Page) {
  await page.goto("/design");
  await page.getByTestId("tenant-switcher").selectOption("tenant-c");
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "tenant"
  );
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.conversations"
  );
}

function fallbackHtml() {
  return "<!doctype html><html><body>Vite preview fallback</body></html>";
}

function stripCount(text: string) {
  return text.replace(/\s+\d+$/, "").trim();
}

async function collectRailGeometry(page: Page) {
  const quick = await page.locator(".uz-conv-rail__quick-actions").boundingBox();
  const notes = page.getByTestId("m7-conversation-notes");
  const notesBox = await notes.boundingBox();
  return {
    notesOpen: await notes.evaluate((node) => (node as HTMLDetailsElement).open),
    notesTop: Math.round(notesBox?.y ?? 0),
    quickTop: Math.round(quick?.y ?? 0)
  };
}

async function collectMetrics(page: Page) {
  const shell = page.getByTestId("admin-shell");
  const rail = page.getByTestId("m7-conversation-context-rail");
  return {
    activePageId: await shell.getAttribute("data-active-page-id"),
    badgeText: (
      await page.locator(".uz-conv-list__head .uz-status-badge").textContent()
    )?.trim(),
    bodyScrollWidth: await page.locator("body").evaluate((node) => node.scrollWidth),
    filterTexts: (await page.locator(".uz-conv-filter").allTextContents()).map((text) =>
      text.trim()
    ),
    filterLabels: (await page.locator(".uz-conv-filter").allTextContents()).map(
      stripCount
    ),
    list: await rectFor(page.getByTestId("m7-conversation-list")),
    rail: await rectFor(rail),
    railOrder: (await rail.locator("h3, summary").allTextContents()).map((text) =>
      text.trim()
    ),
    rows: await page.locator('[data-testid^="m7-conversation-row-"]').count(),
    shellLevel: await shell.getAttribute("data-shell-level")
  };
}

async function rectFor(locator: ReturnType<Page["locator"]>) {
  const rect = await locator.boundingBox();
  if (!rect) return { height: 0, right: 0, width: 0, x: 0, y: 0 };
  return {
    height: Math.round(rect.height),
    right: Math.round(rect.x + rect.width),
    width: Math.round(rect.width),
    x: Math.round(rect.x),
    y: Math.round(rect.y)
  };
}
