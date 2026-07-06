import { mkdirSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { expect, test, type Page } from "@playwright/test";

const artifactDir =
  "/tmp/uzmax-m7-ui-96-conversation-workbench-default-visual-parity-refresh";
const ownerHtml = "/Users/atilla/Downloads/运营塔台1.0.html";
const groupLabels =
  "集团总览|模型/成本/风险|模板中心|连接中心|发布与验收|租户管理|集团日志".split("|");
const tenantLabels =
  "对话|工单|确认队列|客户资产|订单|知识与资源|评测中心|AI 成员|团队|配置|分析|日志".split(
    "|"
  );
const forbiddenVisibleTerms = [
  "mock",
  "fixture",
  "synthetic",
  "degraded",
  "runtime-unavailable",
  "not production metrics",
  "fallback",
  "read-only",
  "prototype",
  "conversation-ticket",
  "customer context runtime",
  "runtime action contract",
  "unavailable"
];

mkdirSync(artifactDir, { recursive: true });

test("refreshes default tenant conversation workbench visible body", async ({
  page
}) => {
  await page.setViewportSize({ width: 1280, height: 840 });
  await page.goto(pathToFileURL(ownerHtml).toString());
  await page.waitForFunction(() => document.body.innerText.includes("Dilnoza R."));
  const owner = await collectOwnerMetrics(page);
  expect(owner.bodyScrollWidth).toBeLessThanOrEqual(1280);
  expect(owner.bodyScrollHeight).toBeLessThanOrEqual(840);
  expect(owner.list.width).toBe(316);
  expect(owner.rail.width).toBe(340);
  expect(owner.visibleRows).toBeGreaterThanOrEqual(8);
  await page.screenshot({
    fullPage: false,
    path: `${artifactDir}/owner-html-conversation-default-1280x840.png`
  });

  await routeNoApiFallback(page);
  await openConversations(page, "tenant-c");
  await expectTenantOnlyNav(page);
  const workbench = page.getByTestId("m7-conversation-workbench-page");
  await expect(workbench).toHaveAttribute("data-tenant-id", "tenant-c");
  await expect(workbench).toHaveAttribute("data-runtime-source", "synthetic");
  await expect(workbench).toHaveAttribute("data-runtime-state", "degraded");

  const visibleText = (await collectVisibleText(page)).toLowerCase();
  for (const term of forbiddenVisibleTerms)
    expect(visibleText).not.toContain(term.toLowerCase());

  const boundary = await workbench.getAttribute("data-runtime-boundary");
  expect(boundary ?? "").toContain("synthetic");
  expect(boundary ?? "").toContain("runtime-unavailable");
  expect(boundary ?? "").toContain("not production metrics");
  await expect(page.getByTestId("m7-conversation-degraded")).toHaveAttribute(
    "title",
    /runtime-unavailable/
  );
  await expect(page.getByTestId("m7-conversation-degraded")).toContainText("只读预览");

  const react = await collectReactMetrics(page);
  expect(react.activePageId).toBe("tenant.conversations");
  expect(react.shellLevel).toBe("tenant");
  expect(react.bodyScrollWidth).toBeLessThanOrEqual(1280);
  expect(react.bodyScrollHeight).toBeLessThanOrEqual(840);
  expect(react.nav.width).toBe(232);
  expect(react.topbar.height).toBe(53);
  expect(react.list.width).toBe(316);
  expect(react.thread.width).toBeGreaterThanOrEqual(390);
  expect(react.rail.width).toBe(340);
  expect(react.rail.right).toBeLessThanOrEqual(1280);
  expect(react.visibleRows).toBeGreaterThanOrEqual(8);
  expect(react.mobileBodyWidth).toBe(1280);
  await page.screenshot({
    fullPage: false,
    path: `${artifactDir}/react-conversation-default-1280x840.png`
  });
  writeFileSync(
    `${artifactDir}/conversation-default-metrics.json`,
    `${JSON.stringify({ owner, react }, null, 2)}\n`
  );
});

test("keeps default tenant conversation mobile fallback within 320px", async ({
  page
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await routeNoApiFallback(page);
  await openConversations(page, "tenant-c");
  await expectTenantOnlyNav(page);
  const mobile = await page.evaluate(() => ({
    bodyScrollWidth: document.body.scrollWidth,
    listWidth:
      document
        .querySelector('[data-testid="m7-conversation-list"]')
        ?.getBoundingClientRect().width ?? 0,
    pageWidth:
      document
        .querySelector('[data-testid="m7-conversation-workbench-page"]')
        ?.getBoundingClientRect().width ?? 0,
    railWidth:
      document
        .querySelector('[data-testid="m7-conversation-context-rail"]')
        ?.getBoundingClientRect().width ?? 0
  }));
  expect(mobile.bodyScrollWidth).toBeLessThanOrEqual(320);
  expect(mobile.pageWidth).toBeLessThanOrEqual(320);
  expect(mobile.listWidth).toBeLessThanOrEqual(320);
  expect(mobile.railWidth).toBeLessThanOrEqual(320);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-conversation-default-mobile-320.png`
  });
  writeFileSync(
    `${artifactDir}/conversation-default-mobile-metrics.json`,
    `${JSON.stringify(mobile, null, 2)}\n`
  );
});

async function openConversations(page: Page, tenantId: string) {
  await page.goto("/design");
  await page.getByTestId("tenant-switcher").selectOption(tenantId);
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "tenant"
  );
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.conversations"
  );
}

async function routeNoApiFallback(page: Page) {
  await page.route("**/conversation-ticket/conversations", async (route) => {
    await route.fulfill({
      body: "<!doctype html><html><body>preview shell</body></html>",
      contentType: "text/html",
      status: 200
    });
  });
}

async function expectTenantOnlyNav(page: Page) {
  const nav = page.getByTestId("app-shell-nav");
  for (const label of tenantLabels)
    await expect(nav.getByRole("button", { name: label, exact: true })).toBeVisible();
  for (const label of groupLabels)
    await expect(nav.getByRole("button", { name: label, exact: true })).toHaveCount(0);
}

async function collectVisibleText(page: Page) {
  return page.evaluate(() => {
    const skipSelector = ".uz-conv-sr-only,[aria-hidden='true'],[hidden]";
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const chunks: string[] = [];
    let node = walker.nextNode();
    while (node) {
      const parent = node.parentElement;
      if (parent && !parent.closest(skipSelector) && isVisible(parent)) {
        const text = node.textContent?.trim();
        if (text) chunks.push(text);
      }
      node = walker.nextNode();
    }
    return chunks.join(" ");

    function isVisible(element: Element) {
      let current: Element | null = element;
      while (current && current !== document.body) {
        const style = window.getComputedStyle(current);
        if (
          style.display === "none" ||
          style.visibility === "hidden" ||
          current.hasAttribute("hidden")
        )
          return false;
        current = current.parentElement;
      }
      return true;
    }
  });
}

async function collectOwnerMetrics(page: Page) {
  return page.evaluate(() => {
    const names = [
      "Dilnoza R.",
      "Иван Петров",
      "Азиз К.",
      "Madina S.",
      "Сергей Л.",
      "Nodira A.",
      "Олег В.",
      "Gulnora T."
    ];
    const workbench = document.querySelector('[data-screen-label="对话工作台"]');
    const columns = Array.from(workbench?.children ?? []);
    const list = columns.find(
      (child) => Math.round(child.getBoundingClientRect().width) === 316
    );
    const rail = columns.find(
      (child) => Math.round(child.getBoundingClientRect().width) === 340
    );
    const thread = columns.find((child) => {
      const width = Math.round(child.getBoundingClientRect().width);
      return width > 340 && width < 500;
    });
    return {
      bodyScrollHeight: document.body.scrollHeight,
      bodyScrollWidth: document.body.scrollWidth,
      list: rectFor(list),
      rail: rectFor(rail),
      thread: rectFor(thread),
      visibleRows: names.filter((name) => document.body.innerText.includes(name))
        .length,
      workbench: rectFor(workbench)
    };

    function rectFor(target: Element | null | undefined) {
      if (!target) return { bottom: 0, height: 0, right: 0, width: 0, x: 0, y: 0 };
      const rect = target.getBoundingClientRect();
      return {
        bottom: Math.round(rect.bottom),
        height: Math.round(rect.height),
        right: Math.round(rect.right),
        width: Math.round(rect.width),
        x: Math.round(rect.x),
        y: Math.round(rect.y)
      };
    }
  });
}

async function collectReactMetrics(page: Page) {
  return page.evaluate(() => {
    const list = document.querySelector('[data-testid="m7-conversation-list"]');
    const listRect = list?.getBoundingClientRect();
    const rows = Array.from(
      document.querySelectorAll('[data-testid^="m7-conversation-row-"]')
    );
    const visibleRows = rows.filter((row) => {
      const rect = row.getBoundingClientRect();
      return listRect
        ? rect.bottom > listRect.top && rect.top < listRect.bottom
        : false;
    }).length;
    return {
      activePageId: document
        .querySelector('[data-testid="admin-shell"]')
        ?.getAttribute("data-active-page-id"),
      bodyScrollHeight: document.body.scrollHeight,
      bodyScrollWidth: document.body.scrollWidth,
      list: rectFor(list),
      mobileBodyWidth: document.body.scrollWidth,
      nav: rectFor('[data-testid="app-shell-nav"]'),
      rail: rectFor('[data-testid="m7-conversation-context-rail"]'),
      shellLevel: document
        .querySelector('[data-testid="admin-shell"]')
        ?.getAttribute("data-shell-level"),
      thread: rectFor('[data-testid="m7-conversation-thread"]'),
      topbar: rectFor(".uz-topbar"),
      visibleRows,
      workbench: rectFor('[data-testid="m7-conversation-workbench-page"]')
    };

    function rectFor(target: Element | string | null | undefined) {
      const element =
        typeof target === "string" ? document.querySelector(target) : target;
      if (!element) return { bottom: 0, height: 0, right: 0, width: 0, x: 0, y: 0 };
      const rect = element.getBoundingClientRect();
      return {
        bottom: Math.round(rect.bottom),
        height: Math.round(rect.height),
        right: Math.round(rect.right),
        width: Math.round(rect.width),
        x: Math.round(rect.x),
        y: Math.round(rect.y)
      };
    }
  });
}
