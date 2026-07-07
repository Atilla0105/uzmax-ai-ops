import { mkdirSync, writeFileSync } from "node:fs";
import { expect, test, type Locator, type Page } from "@playwright/test";

const artifactDir = "/tmp/uzmax-m7-ui-103-conversation-composer-source-parity";
const layoutSelectors = {
  composer: '[data-testid="m7-conversation-composer"]',
  list: '[data-testid="m7-conversation-list"]',
  nav: '[data-testid="app-shell-nav"]',
  rail: '[data-testid="m7-conversation-context-rail"]',
  thread: '[data-testid="m7-conversation-thread"]',
  topbar: ".uz-topbar",
  workbench: '[data-testid="m7-conversation-workbench-page"]'
} as const;

mkdirSync(artifactDir, { recursive: true });

test("aligns synthetic conversation composer to owner source", async ({ page }) => {
  await routeSyntheticFallback(page);
  await page.setViewportSize({ width: 1280, height: 800 });
  await enterTenantAConversationsFromGroup(page);

  const workbench = page.getByTestId("m7-conversation-workbench-page");
  const composer = page.getByTestId("m7-conversation-composer");
  await expect(workbench).toHaveAttribute("data-runtime-source", "synthetic");
  await expect(workbench).toHaveAttribute("data-runtime-state", "degraded");
  await expect(page.getByTestId("m7-conversation-degraded")).toHaveAttribute(
    "title",
    /runtime-unavailable/
  );

  await expect(composer.locator(".uz-conv-composer__state svg")).toBeVisible();
  await expect(composer.locator(".uz-conv-composer__state")).toContainText(
    "Business 草稿 · 待确认"
  );
  await expect(page.getByTestId("m7-conversation-composer-caveat")).toHaveText(
    "由 AI 生成，确认后才会发送给客户"
  );
  await expect(page.getByLabel("Conversation composer")).toHaveValue(
    /Hurmatli Dilnoza|Pulni qaytarish/
  );
  await expect(composer).toContainText("乌兹别克语（拉丁） · 红线检查通过");
  await expect(composer.getByRole("button", { name: "编辑草稿" })).toBeVisible();
  await expect(composer.getByRole("button", { name: /确认发送/ })).toContainText("⌘↵");

  const visibleText = await innerText(composer);
  expect(visibleText).not.toContain("附件");
  expect(visibleText).not.toContain("话术片段");

  const tools = composer.locator(".uz-conv-tool-button");
  await expect(tools).toHaveCount(2);
  await expect(composer.getByRole("button", { name: "附件" })).toHaveAttribute(
    "title",
    "附件"
  );
  await expect(composer.getByRole("button", { name: "话术片段" })).toHaveAttribute(
    "title",
    "话术片段"
  );

  const desktop = await collectMetrics(page);
  expect(desktop.nav.width).toBe(232);
  expect(desktop.topbar.height).toBeGreaterThanOrEqual(52);
  expect(desktop.topbar.height).toBeLessThanOrEqual(53);
  expect(desktop.list.width).toBe(316);
  expect(desktop.rail.width).toBe(340);
  expect(desktop.bodyScrollWidth).toBeLessThanOrEqual(1280);
  expect(desktop.composer.height).toBeGreaterThanOrEqual(135);
  expect(desktop.composer.height).toBeLessThanOrEqual(240);
  expect(desktop.composer.bottom).toBeLessThanOrEqual(800);
  expect(desktop.toolButtons).toHaveLength(2);
  for (const button of desktop.toolButtons) {
    expect(button.width).toBeGreaterThanOrEqual(30);
    expect(button.width).toBeLessThanOrEqual(32);
    expect(button.height).toBeGreaterThanOrEqual(30);
    expect(button.height).toBeLessThanOrEqual(32);
  }
  await page.screenshot({
    fullPage: false,
    path: `${artifactDir}/react-composer-source-parity-1280x800.png`
  });

  await page.setViewportSize({ width: 320, height: 800 });
  await composer.scrollIntoViewIfNeeded();
  const mobile = await collectMetrics(page);
  expect(mobile.bodyScrollWidth).toBeLessThanOrEqual(320);
  expect(mobile.composer.width).toBeLessThanOrEqual(320);
  await page.screenshot({
    fullPage: false,
    path: `${artifactDir}/react-composer-source-parity-mobile-320x800.png`
  });

  writeFileSync(
    `${artifactDir}/react-composer-source-parity-metrics.json`,
    `${JSON.stringify({ desktop, mobile, visibleText }, null, 2)}\n`
  );
});

async function routeSyntheticFallback(page: Page) {
  await page.route("**/conversation-ticket/conversations", async (route) => {
    await route.fulfill({
      body: "<!doctype html><html><body>M7-UI-103 synthetic fallback</body></html>",
      contentType: "text/html",
      status: 200
    });
  });
}

async function enterTenantAConversationsFromGroup(page: Page) {
  await page.goto("/design");
  expect(await shellSnapshot(page)).toMatchObject({ level: "group" });
  await page
    .getByRole("button", { name: /进入 .* 对话/ })
    .first()
    .click();
  await page.waitForFunction(() => {
    const shell = document.querySelector('[data-testid="admin-shell"]');
    const outlet = document.querySelector('[data-testid="page-outlet"]');
    return (
      shell?.getAttribute("data-shell-level") === "tenant" &&
      shell?.getAttribute("data-active-page-id") === "tenant.conversations" &&
      outlet?.getAttribute("data-tenant-id") === "tenant-a" &&
      Boolean(document.querySelector('[data-testid="m7-conversation-workbench-page"]'))
    );
  });
  expect(await shellSnapshot(page)).toEqual({
    level: "tenant",
    page: "tenant.conversations",
    tenant: "tenant-a",
    workbench: true
  });
}

async function shellSnapshot(page: Page) {
  return page.evaluate(() => {
    const shell = document.querySelector('[data-testid="admin-shell"]');
    const outlet = document.querySelector('[data-testid="page-outlet"]');
    return {
      level: shell?.getAttribute("data-shell-level") ?? null,
      page: shell?.getAttribute("data-active-page-id") ?? null,
      tenant: outlet?.getAttribute("data-tenant-id") ?? null,
      workbench: Boolean(
        document.querySelector('[data-testid="m7-conversation-workbench-page"]')
      )
    };
  });
}

async function innerText(locator: Locator) {
  return locator.evaluate((node) =>
    ((node as HTMLElement).innerText || "").replace(/\s+/g, " ").trim()
  );
}

async function collectMetrics(page: Page) {
  return page.evaluate((selectors) => {
    const rectFor = (selector: string) => {
      const rect = document.querySelector(selector)?.getBoundingClientRect();
      return rect
        ? {
            bottom: Math.round(rect.bottom),
            height: Math.round(rect.height),
            width: Math.round(rect.width),
            x: Math.round(rect.x),
            y: Math.round(rect.y)
          }
        : { bottom: 0, height: 0, width: 0, x: 0, y: 0 };
    };
    const toolButtons = Array.from(
      document.querySelectorAll(".uz-conv-tool-button")
    ).map((node) => {
      const rect = node.getBoundingClientRect();
      return {
        ariaLabel: node.getAttribute("aria-label"),
        height: Math.round(rect.height),
        title: node.getAttribute("title"),
        width: Math.round(rect.width)
      };
    });
    return {
      bodyScrollWidth: document.body.scrollWidth,
      composer: rectFor(selectors.composer),
      list: rectFor(selectors.list),
      nav: rectFor(selectors.nav),
      rail: rectFor(selectors.rail),
      thread: rectFor(selectors.thread),
      toolButtons,
      topbar: rectFor(selectors.topbar),
      workbench: rectFor(selectors.workbench)
    };
  }, layoutSelectors);
}
