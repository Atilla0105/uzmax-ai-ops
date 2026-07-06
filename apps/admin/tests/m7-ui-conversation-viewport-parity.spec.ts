import { mkdirSync, writeFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

const artifactDir = "/tmp/uzmax-m7-ui-58-conversation-viewport-parity-v2";

mkdirSync(artifactDir, { recursive: true });

test("keeps tenant conversation workbench viewport locked on desktop", async ({
  page
}) => {
  await page.setViewportSize({ width: 1280, height: 840 });
  await openConversations(page);
  await expect(page.getByTestId("m7-conversation-workbench-page")).toBeVisible();
  await expect(page.getByTestId("m7-conversation-row-mock-dilnoza-risk")).toBeVisible();
  await expect(page.getByTestId("m7-conversation-thread")).toContainText("AI 决策痕迹");

  const desktop = await collectConversationViewportMetrics(page);
  expect(desktop.activePageId).toBe("tenant.conversations");
  expect(desktop.shellLevel).toBe("tenant");
  expect(desktop.bodyScrollWidth).toBeLessThanOrEqual(1280);
  expect(desktop.bodyScrollHeight).toBeLessThanOrEqual(840);
  expect(desktop.nav.y).toBe(0);
  expect(desktop.nav.width).toBe(232);
  expect(desktop.topbar.y).toBe(0);
  expect(desktop.workbench.height).toBeGreaterThanOrEqual(780);
  expect(desktop.workbench.height).toBeLessThanOrEqual(788);
  expect(desktop.workbench.width).toBeLessThanOrEqual(desktop.workspace.width);
  expect(desktop.list.width).toBe(316);
  expect(desktop.rail.width).toBe(340);
  expect(desktop.rail.right).toBeLessThanOrEqual(1280);
  expect(desktop.rows).toBeGreaterThanOrEqual(8);
  expect(desktop.messages).toBeGreaterThanOrEqual(1);

  await page.screenshot({
    fullPage: false,
    path: `${artifactDir}/react-conversation-viewport-desktop.png`
  });

  await page.getByRole("button", { name: "Collapse navigation" }).click();
  await expect(page.getByTestId("app-shell-nav")).toHaveJSProperty("offsetWidth", 68);
  const collapsed = await collectConversationViewportMetrics(page);
  expect(collapsed.bodyScrollHeight).toBeLessThanOrEqual(840);
  expect(collapsed.bodyScrollWidth).toBeLessThanOrEqual(1280);
  expect(collapsed.nav.y).toBe(0);
  expect(collapsed.nav.width).toBe(68);
  expect(collapsed.topbar.y).toBe(0);
  expect(collapsed.workbench.width).toBeLessThanOrEqual(collapsed.workspace.width);
  expect(collapsed.rail.right).toBeLessThanOrEqual(1280);
  expect(collapsed.rows).toBeGreaterThanOrEqual(8);
  await page.screenshot({
    fullPage: false,
    path: `${artifactDir}/react-conversation-viewport-collapsed.png`
  });

  writeFileSync(
    `${artifactDir}/react-conversation-viewport-metrics.json`,
    `${JSON.stringify({ collapsed, desktop }, null, 2)}\n`
  );
});

test("keeps tenant conversation mobile fallback readable at 320px", async ({
  page
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await openConversations(page);
  await expect(page.getByTestId("m7-conversation-workbench-page")).toBeVisible();
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "tenant"
  );
  const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
  expect(bodyScrollWidth).toBeLessThanOrEqual(320);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-conversation-viewport-mobile-320.png`
  });
});

async function openConversations(page: Page) {
  await page.route("**/conversation-ticket/conversations", async (route) => {
    await route.fulfill({
      body: "<!doctype html><html><body>Vite preview fallback</body></html>",
      contentType: "text/html",
      status: 200
    });
  });
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

async function collectConversationViewportMetrics(page: Page) {
  return page.evaluate(() => {
    const rectFor = (selector: string) => {
      const element = document.querySelector(selector);
      if (!element) return { height: 0, right: 0, width: 0, x: 0, y: 0 };
      const rect = element.getBoundingClientRect();
      return {
        height: Math.round(rect.height),
        right: Math.round(rect.right),
        width: Math.round(rect.width),
        x: Math.round(rect.x),
        y: Math.round(rect.y)
      };
    };
    return {
      activePageId: document
        .querySelector('[data-testid="admin-shell"]')
        ?.getAttribute("data-active-page-id"),
      bodyScrollHeight: document.body.scrollHeight,
      bodyScrollWidth: document.body.scrollWidth,
      list: rectFor('[data-testid="m7-conversation-list"]'),
      messages: document.querySelectorAll('[data-testid^="m7-conversation-message-"]')
        .length,
      nav: rectFor('[data-testid="app-shell-nav"]'),
      rail: rectFor('[data-testid="m7-conversation-context-rail"]'),
      rows: document.querySelectorAll('[data-testid^="m7-conversation-row-"]').length,
      shellLevel: document
        .querySelector('[data-testid="admin-shell"]')
        ?.getAttribute("data-shell-level"),
      thread: rectFor('[data-testid="m7-conversation-thread"]'),
      topbar: rectFor(".uz-topbar"),
      workbench: rectFor('[data-testid="m7-conversation-workbench-page"]'),
      workspace: rectFor(".uz-shell-workspace")
    };
  });
}
