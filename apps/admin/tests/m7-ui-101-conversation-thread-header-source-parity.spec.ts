import { mkdirSync, writeFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

const artifactDir = "/tmp/uzmax-m7-ui-101-conversation-thread-header-source-parity";
const layoutSelectors = {
  list: '[data-testid="m7-conversation-list"]',
  nav: '[data-testid="app-shell-nav"]',
  rail: '[data-testid="m7-conversation-context-rail"]',
  thread: '[data-testid="m7-conversation-thread"]',
  topbar: ".uz-topbar",
  workbench: '[data-testid="m7-conversation-workbench-page"]'
} as const;

mkdirSync(artifactDir, { recursive: true });

type LayoutKey = keyof typeof layoutSelectors;
type BoxMetrics = {
  height: number;
  right: number;
  width: number;
  x: number;
  y: number;
};
type ConversationLayout = Record<LayoutKey, BoxMetrics> & {
  bodyScrollWidth: number;
};

test("keeps synthetic conversation thread header identity readable", async ({
  page
}) => {
  let handoffPostCount = 0;
  await page.route("**/conversation-ticket/conversations", async (route) => {
    await route.fulfill({
      body: [
        "<!doctype html>",
        "<html><body>M7-UI-101 synthetic fallback</body></html>"
      ].join(""),
      contentType: "text/html",
      status: 200
    });
  });
  await page.route("**/conversation-ticket/conversations/*/handoff", async (route) => {
    if (route.request().method() === "POST") handoffPostCount += 1;
    await route.fulfill({
      json: { error: "M7-UI-101 synthetic fallback must not post handoff" },
      status: 599
    });
  });

  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/design");

  const shell = page.getByTestId("admin-shell");
  await expect(shell).toHaveAttribute("data-shell-level", "group");
  await page.getByTestId("m7-group-enter-tenant-tenant-a").click();
  await expect(shell).toHaveAttribute("data-shell-level", "tenant");
  await expect(shell).toHaveAttribute("data-active-page-id", "tenant.conversations");
  await expect(page.getByTestId("page-outlet")).toHaveAttribute(
    "data-tenant-id",
    "tenant-a"
  );

  const workbench = page.getByTestId("m7-conversation-workbench-page");
  const header = page.locator(".uz-conv-thread__head");
  await expect(workbench).toBeVisible();
  await expect(workbench).toHaveAttribute("data-runtime-source", "synthetic");
  await expect(workbench).toHaveAttribute("data-runtime-state", "degraded");
  await expect(page.getByTestId("m7-conversation-degraded")).toHaveAttribute(
    "title",
    /runtime-unavailable/
  );

  const headerText = await header.evaluate((node) =>
    Array.from(node.querySelectorAll(":scope > :not(.uz-conv-sr-only)"), (element) =>
      ((element as HTMLElement).innerText || "").replace(/\s+/g, " ").trim()
    )
      .filter(Boolean)
      .join(" ")
  );
  for (const expected of [
    "Dilnoza R.",
    "待人工",
    "SLA 04:12",
    "AI 已暂停",
    "接管会话",
    "T"
  ]) {
    expect(headerText).toContain(expected);
  }
  expect(headerText).toMatch(/Telegram Bot|Telegram/);
  for (const forbidden of ["只读预览", "runtime-unavailable", "放回 AI"]) {
    expect(headerText).not.toContain(forbidden);
  }

  const headerMetrics800 = await measureThreadHeader(page);
  expect(headerMetrics800.header.height).toBeGreaterThanOrEqual(46);
  expect(headerMetrics800.header.height).toBeLessThanOrEqual(47);
  expect(headerMetrics800.title.width).toBeGreaterThanOrEqual(
    headerMetrics800.name.textWidth + 2
  );
  expect(headerMetrics800.title.width).toBeGreaterThanOrEqual(
    headerMetrics800.subtitle.telegramReadableTextWidth + 2
  );
  expect(headerMetrics800.name.scrollWidth).toBeLessThanOrEqual(
    headerMetrics800.name.clientWidth + 1
  );
  expect(headerMetrics800.title.width).toBeGreaterThanOrEqual(82);
  expect(headerMetrics800.takeover.width).toBeLessThanOrEqual(102);
  await expect(
    header.getByRole("button", { name: "更多会话动作暂未接入" })
  ).toBeVisible();

  const geometry800 = await readConversationLayout(page);
  expectDesktopLayout(geometry800);
  await page.screenshot({
    fullPage: false,
    path: `${artifactDir}/react-thread-header-1280x800.png`
  });

  await page.setViewportSize({ width: 1280, height: 840 });
  const geometry840 = await readConversationLayout(page);
  const headerMetrics840 = await measureThreadHeader(page);
  expectDesktopLayout(geometry840);
  expect(headerMetrics840.title.width).toBeGreaterThanOrEqual(
    headerMetrics840.subtitle.telegramReadableTextWidth + 2
  );
  await page.screenshot({
    fullPage: false,
    path: `${artifactDir}/react-thread-header-1280x840.png`
  });

  await page.setViewportSize({ width: 320, height: 800 });
  const mobileGeometry = await readConversationLayout(page);
  expect(mobileGeometry.bodyScrollWidth).toBeLessThanOrEqual(320);
  await page.screenshot({
    fullPage: false,
    path: `${artifactDir}/react-thread-header-mobile-320.png`
  });

  expect(handoffPostCount).toBe(0);
  writeFileSync(
    `${artifactDir}/react-thread-header-metrics.json`,
    `${JSON.stringify(
      {
        geometry800,
        geometry840,
        headerMetrics800,
        headerMetrics840,
        headerText,
        handoffPosts: handoffPostCount,
        mobileGeometry
      },
      null,
      2
    )}\n`
  );
});

async function measureThreadHeader(page: Page) {
  return page.evaluate(() => {
    const header = document.querySelector(".uz-conv-thread__head") as HTMLElement;
    const title = document.querySelector(".uz-conv-thread__title") as HTMLElement;
    const name = title.querySelector("strong") as HTMLElement;
    const subtitle = title.querySelector("span") as HTMLElement;
    const takeover = document.querySelector(".uz-conv-takeover") as HTMLElement;
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const box = (node: Element) => {
      const rect = node.getBoundingClientRect();
      return {
        height: Math.round(rect.height),
        width: Math.round(rect.width),
        x: Math.round(rect.x),
        y: Math.round(rect.y)
      };
    };
    const textWidth = (node: HTMLElement, text: string) => {
      if (!context) return text.length * 8;
      context.font = getComputedStyle(node).font;
      return Math.ceil(context.measureText(text).width);
    };
    return {
      header: box(header),
      name: {
        ...box(name),
        clientWidth: name.clientWidth,
        scrollWidth: name.scrollWidth,
        text: name.innerText,
        textWidth: textWidth(name, "Dilnoza R.")
      },
      subtitle: {
        ...box(subtitle),
        clientWidth: subtitle.clientWidth,
        scrollWidth: subtitle.scrollWidth,
        telegramBotTextWidth: textWidth(subtitle, "Telegram Bot"),
        telegramReadableTextWidth: textWidth(subtitle, "Telegram"),
        text: subtitle.innerText
      },
      takeover: box(takeover),
      title: box(title)
    };
  });
}

async function readConversationLayout(page: Page): Promise<ConversationLayout> {
  return page.evaluate((selectors) => {
    const emptyBox = { height: 0, right: 0, width: 0, x: 0, y: 0 };
    const roundedBox = (selector: string) => {
      const rect = document.querySelector(selector)?.getBoundingClientRect();
      if (!rect) return emptyBox;
      return {
        height: Math.round(rect.height),
        right: Math.round(rect.right),
        width: Math.round(rect.width),
        x: Math.round(rect.x),
        y: Math.round(rect.y)
      };
    };
    const metrics: Record<string, unknown> = {
      bodyScrollWidth: document.body.scrollWidth
    };
    for (const [key, selector] of Object.entries(selectors)) {
      metrics[key] = roundedBox(selector);
    }
    return metrics as ConversationLayout;
  }, layoutSelectors);
}

function expectDesktopLayout(layout: ConversationLayout) {
  const fixedWidths: Partial<Record<LayoutKey, number>> = {
    list: 316,
    nav: 232,
    rail: 340
  };
  for (const [key, expectedWidth] of Object.entries(fixedWidths)) {
    expect(layout[key as LayoutKey].width).toBe(expectedWidth);
  }
  expect(layout.topbar.height).toBeGreaterThanOrEqual(52);
  expect(layout.topbar.height).toBeLessThanOrEqual(53);
  expect(layout.thread.width).toBe(
    layout.workbench.width - layout.list.width - layout.rail.width
  );
  expect(layout.thread.width).toBeGreaterThanOrEqual(391);
  expect(layout.thread.width).toBeLessThanOrEqual(393);
  expect(layout.bodyScrollWidth).toBeLessThanOrEqual(1280);
}
