import { mkdirSync, writeFileSync } from "node:fs";
import { expect, test, type Locator, type Page } from "@playwright/test";

import { conversationTakeover as takeover } from "./conversationWorkbenchLocators";

const artifactDir = "/tmp/uzmax-m7-ui-100-conversation-handoff-default-visual-parity";

mkdirSync(artifactDir, { recursive: true });

test("keeps synthetic handoff default owner-like without runtime POST", async ({
  page
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const handoffPosts = await routeSyntheticFallback(page);

  await openTenantAConversationsFromGroup(page);

  const workbench = page.getByTestId("m7-conversation-workbench-page");
  const header = page.locator(".uz-conv-thread__head");
  const composerState = page.locator(".uz-conv-composer__state");
  await expect(workbench).toHaveAttribute("data-runtime-source", "synthetic");
  await expect(workbench).toHaveAttribute("data-runtime-state", "degraded");
  await expect(page.getByTestId("m7-conversation-degraded")).toHaveAttribute(
    "title",
    /runtime-unavailable/
  );

  const defaultText = {
    composer: await primaryText(composerState),
    header: await primaryText(header)
  };
  expect(defaultText.header).toContain("待人工");
  expect(defaultText.header).toContain("SLA 04:12");
  expect(defaultText.header).toContain("接管会话");
  expect(defaultText.header).not.toContain("放回 AI");
  expect(defaultText.header).not.toContain("只读预览");
  expect(defaultText.header).not.toContain("runtime-unavailable");
  expect(defaultText.composer).toContain("Business 草稿 · 待确认");
  expect(defaultText.composer).not.toContain("人工外部回复 · 待确认");
  expect(defaultText.composer).toContain("由 AI 生成，确认后才会发送给客户");
  expect(defaultText.composer).not.toContain("runtime-unavailable");
  await expect(
    header.getByRole("button", { name: "更多会话动作暂未接入" })
  ).toBeVisible();

  await expect(takeover(page)).toBeEnabled();
  const takeoverChrome = await takeover(page).evaluate((node) => {
    const style = getComputedStyle(node);
    return {
      background: style.backgroundColor,
      color: style.color,
      cursor: style.cursor
    };
  });
  expect(takeoverChrome).toEqual({
    background: "rgb(212, 80, 43)",
    color: "rgb(255, 255, 255)",
    cursor: "pointer"
  });

  const geometry = await collectGeometry(page);
  expect(geometry.nav.width).toBe(232);
  expect(geometry.topbar.height).toBeGreaterThanOrEqual(52);
  expect(geometry.topbar.height).toBeLessThanOrEqual(53);
  expect(geometry.list.width).toBe(316);
  expect(geometry.rail.width).toBe(340);
  expect(geometry.thread.width).toBe(
    geometry.workbench.width - geometry.list.width - geometry.rail.width
  );
  expect(geometry.thread.width).toBeGreaterThanOrEqual(391);
  expect(geometry.thread.width).toBeLessThanOrEqual(393);
  expect(geometry.bodyScrollWidth).toBeLessThanOrEqual(1280);
  await page.screenshot({
    fullPage: false,
    path: `${artifactDir}/react-synthetic-default-1280x800.png`
  });

  await page.keyboard.press("t");
  expect(handoffPosts()).toBe(0);
  await expect(header).toContainText("人工处理中");
  await expect(composerState).toContainText("Business 草稿 · 待确认");
  await expect(takeover(page)).toBeDisabled();

  await openTenantAConversationsFromGroup(page);
  await expect(takeover(page)).toBeEnabled();
  await takeover(page).click();
  expect(handoffPosts()).toBe(0);
  await expect(header).toContainText("人工处理中");
  await expect(composerState).toContainText("Business 草稿 · 待确认");
  await page.screenshot({
    fullPage: false,
    path: `${artifactDir}/react-synthetic-local-handoff-1280x800.png`
  });

  writeFileSync(
    `${artifactDir}/react-synthetic-handoff-metrics.json`,
    `${JSON.stringify(
      {
        defaultText,
        geometry,
        handoffPosts: handoffPosts()
      },
      null,
      2
    )}\n`
  );
});

async function routeSyntheticFallback(page: Page) {
  let handoffPostCount = 0;
  await page.route("**/conversation-ticket/conversations", async (route) => {
    await route.fulfill({
      body: "<!doctype html><html><body>M7-UI-100 synthetic fallback</body></html>",
      contentType: "text/html",
      status: 200
    });
  });
  await page.route("**/conversation-ticket/conversations/*/handoff", async (route) => {
    if (route.request().method() === "POST") handoffPostCount += 1;
    await route.fulfill({
      json: { error: "M7-UI-100 synthetic fallback must not post handoff" },
      status: 599
    });
  });
  return () => handoffPostCount;
}

async function openTenantAConversationsFromGroup(page: Page) {
  await page.goto("/design");
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "group"
  );
  await page.getByTestId("m7-group-enter-tenant-tenant-a").click();
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "tenant"
  );
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.conversations"
  );
  await expect(page.getByTestId("page-outlet")).toHaveAttribute(
    "data-tenant-id",
    "tenant-a"
  );
  await expect(page.getByTestId("m7-conversation-workbench-page")).toBeVisible();
}

async function primaryText(locator: Locator) {
  return locator.evaluate((node) =>
    Array.from(node.children)
      .filter((child) => !child.classList.contains("uz-conv-sr-only"))
      .map((child) => (child as HTMLElement).innerText)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

async function collectGeometry(page: Page) {
  return page.evaluate(() => {
    const rectFor = (selector: string) => {
      const rect = document.querySelector(selector)?.getBoundingClientRect();
      return rect
        ? {
            height: Math.round(rect.height),
            right: Math.round(rect.right),
            width: Math.round(rect.width),
            x: Math.round(rect.x),
            y: Math.round(rect.y)
          }
        : { height: 0, right: 0, width: 0, x: 0, y: 0 };
    };
    return {
      bodyScrollWidth: document.body.scrollWidth,
      list: rectFor('[data-testid="m7-conversation-list"]'),
      nav: rectFor('[data-testid="app-shell-nav"]'),
      rail: rectFor('[data-testid="m7-conversation-context-rail"]'),
      thread: rectFor('[data-testid="m7-conversation-thread"]'),
      topbar: rectFor(".uz-topbar"),
      workbench: rectFor('[data-testid="m7-conversation-workbench-page"]')
    };
  });
}
