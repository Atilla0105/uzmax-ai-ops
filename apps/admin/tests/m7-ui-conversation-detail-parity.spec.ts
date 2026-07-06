import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { expect, test, type Page } from "@playwright/test";

const artifactDir = "/tmp/uzmax-m7-ui-60-conversation-detail-parity";
const ownerHtml = "/Users/atilla/Downloads/运营塔台1.0.html";
const tenantSections = "运营|数据|智能|管理|洞察".split("|");

mkdirSync(artifactDir, { recursive: true });

test("captures source and React conversation detail parity at 1280x840", async ({
  page
}) => {
  await page.setViewportSize({ width: 1280, height: 840 });
  const owner = await maybeCaptureOwnerMetrics(page);

  await openConversations(page);
  const react = await collectReactMetrics(page);
  expect(react.activePageId).toBe("tenant.conversations");
  expect(react.shellLevel).toBe("tenant");
  expect(react.bodyScrollWidth).toBeLessThanOrEqual(1280);
  expect(react.bodyScrollHeight).toBeLessThanOrEqual(840);
  expect(react.nav.width).toBe(232);
  expect(react.topbar.height).toBe(53);
  expect(react.list.width).toBe(316);
  expect(react.rail.width).toBe(340);
  expect(react.rail.right).toBeLessThanOrEqual(1280);
  expect(react.visibleRows).toBeGreaterThanOrEqual(8);
  expect(react.rowAvatar.width).toBe(22);
  expect(react.rowStripeWidth).toBe("3px");
  expect(react.activeFilterBackground).toBe("rgb(26, 29, 33)");
  expect(react.composer.bottom).toBeLessThanOrEqual(840);
  expect(react.quickActions.bottom).toBeLessThanOrEqual(840);
  expect(react.railBodyScrollable).toBe(true);
  expect(react.sidebarSections).toEqual(tenantSections);
  await expect(page.getByTestId("m7-conversation-ai-trace").first()).toContainText(
    "物流时效·中亚 v4"
  );
  await expect(page.getByTestId("m7-conversation-composer-caveat")).toContainText(
    "由 AI 生成，确认后才会发送给客户"
  );
  await expect(page.getByTestId("m7-conversation-degraded")).toHaveAttribute(
    "title",
    /runtime-unavailable/
  );
  await page.screenshot({
    fullPage: false,
    path: `${artifactDir}/react-conversation-detail-1280x840.png`
  });

  writeFileSync(
    `${artifactDir}/conversation-detail-metrics.json`,
    `${JSON.stringify({ owner, react }, null, 2)}\n`
  );
});

test("keeps detail parity mobile fallback readable at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await openConversations(page);
  const mobile = await page.evaluate(() => ({
    bodyScrollWidth: document.body.scrollWidth,
    quickActionsWidth:
      document.querySelector(".uz-conv-rail__quick-actions")?.getBoundingClientRect()
        .width ?? 0,
    workbenchWidth:
      document
        .querySelector('[data-testid="m7-conversation-workbench-page"]')
        ?.getBoundingClientRect().width ?? 0
  }));
  expect(mobile.bodyScrollWidth).toBeLessThanOrEqual(320);
  expect(mobile.workbenchWidth).toBeLessThanOrEqual(320);
  expect(mobile.quickActionsWidth).toBeLessThanOrEqual(320);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-conversation-detail-mobile-320.png`
  });
  writeFileSync(
    `${artifactDir}/conversation-detail-mobile-metrics.json`,
    `${JSON.stringify(mobile, null, 2)}\n`
  );
});

async function openConversations(page: Page) {
  await page.route("**/conversation-ticket/conversations", async (route) =>
    route.fulfill({
      body: "<!doctype html><html><body>M7 UI-60 detail fallback</body></html>",
      contentType: "text/html",
      status: 200
    })
  );
  await page.goto("/design");
  await page.getByTestId("tenant-switcher").selectOption("tenant-c");
  const shell = page.getByTestId("admin-shell");
  await expect(shell).toHaveAttribute("data-shell-level", "tenant");
  await expect(shell).toHaveAttribute("data-active-page-id", "tenant.conversations");
}

async function maybeCaptureOwnerMetrics(page: Page) {
  if (!existsSync(ownerHtml)) {
    const unavailable = {
      captured: false,
      reason: `Owner HTML unavailable at ${ownerHtml}; React geometry assertions still ran.`
    };
    writeFileSync(
      `${artifactDir}/owner-html-conversation-detail-unavailable.json`,
      `${JSON.stringify(unavailable, null, 2)}\n`
    );
    return unavailable;
  }
  await page.goto(pathToFileURL(ownerHtml).toString());
  await page.waitForFunction(() => document.body.innerText.includes("Dilnoza R."));
  const owner = { ...(await collectOwnerMetrics(page)), captured: true };
  expect(owner.bodyScrollWidth).toBeLessThanOrEqual(1280);
  expect(owner.bodyScrollHeight).toBeLessThanOrEqual(840);
  expect(owner.workbench.width).toBeGreaterThan(900);
  expect(owner.list.width).toBe(316);
  expect(owner.rail.width).toBe(340);
  expect(owner.visibleRows).toBeGreaterThanOrEqual(8);
  await page.screenshot({
    fullPage: false,
    path: `${artifactDir}/owner-html-conversation-detail-1280x840.png`
  });
  return owner;
}

async function collectOwnerMetrics(page: Page) {
  return page.evaluate(() => {
    const rectFor = (target: Element | null | undefined) => {
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
    };
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
      textIncludesQuickActions: document.body.innerText.includes("快捷动作"),
      thread: rectFor(thread),
      visibleRows: names.filter((name) => document.body.innerText.includes(name))
        .length,
      workbench: rectFor(workbench)
    };
  });
}

async function collectReactMetrics(page: Page) {
  return page.evaluate(() => {
    const rectFor = (target: Element | string | null | undefined) => {
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
    };
    const rows = Array.from(
      document.querySelectorAll('[data-testid^="m7-conversation-row-"]')
    );
    const list = document.querySelector('[data-testid="m7-conversation-list"]');
    const listRect = list?.getBoundingClientRect();
    const visibleRows = rows.filter((row) => {
      const rect = row.getBoundingClientRect();
      return listRect
        ? rect.bottom > listRect.top && rect.top < listRect.bottom
        : false;
    }).length;
    const selectedRow = document.querySelector(
      '[data-testid="m7-conversation-row-mock-dilnoza-risk"]'
    );
    const railBody = document.querySelector(".uz-conv-rail__body");
    return {
      activeFilterBackground: getComputedStyle(
        document.querySelector(".uz-conv-filter.uz-button--primary") as Element
      ).backgroundColor,
      activePageId: document
        .querySelector('[data-testid="admin-shell"]')
        ?.getAttribute("data-active-page-id"),
      bodyScrollHeight: document.body.scrollHeight,
      bodyScrollWidth: document.body.scrollWidth,
      composer: rectFor('[data-testid="m7-conversation-composer"]'),
      list: rectFor(list),
      nav: rectFor('[data-testid="app-shell-nav"]'),
      quickActions: rectFor(".uz-conv-rail__quick-actions"),
      rail: rectFor('[data-testid="m7-conversation-context-rail"]'),
      railBodyScrollable: railBody
        ? railBody.scrollHeight > railBody.clientHeight
        : false,
      rowAvatar: rectFor(
        '[data-testid="m7-conversation-row-mock-dilnoza-risk"] .uz-avatar'
      ),
      rowStripeWidth: selectedRow
        ? getComputedStyle(selectedRow, "::before").width
        : "",
      shellLevel: document
        .querySelector('[data-testid="admin-shell"]')
        ?.getAttribute("data-shell-level"),
      sidebarSections: Array.from(
        document.querySelectorAll('[data-testid="app-shell-nav"] .uz-nav-group p')
      ).map((node) => node.textContent?.trim() ?? ""),
      thread: rectFor('[data-testid="m7-conversation-thread"]'),
      topbar: rectFor(".uz-topbar"),
      visibleRows,
      workbench: rectFor('[data-testid="m7-conversation-workbench-page"]')
    };
  });
}
