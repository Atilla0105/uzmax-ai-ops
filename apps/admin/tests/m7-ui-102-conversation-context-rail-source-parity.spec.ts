import { mkdirSync, writeFileSync } from "node:fs";
import { expect, test, type Locator, type Page } from "@playwright/test";

import {
  conversationDegraded,
  conversationRail
} from "./conversationWorkbenchLocators";

const outDir = "/tmp/uzmax-m7-ui-102-conversation-context-rail-source-parity";
const frameSelectors = {
  list: '[data-testid="m7-conversation-list"]',
  nav: '[data-testid="app-shell-nav"]',
  rail: '[data-testid="m7-conversation-context-rail"]',
  topbar: ".uz-topbar"
} as const;

mkdirSync(outDir, { recursive: true });

test("aligns synthetic conversation context rail to owner source", async ({ page }) => {
  await serveSyntheticConversationFallback(page);
  await page.setViewportSize({ width: 1280, height: 800 });
  await enterTenantConversationWorkbench(page);

  const workbench = page.getByTestId("m7-conversation-workbench-page");
  const rail = conversationRail(page);
  await expect(workbench).toHaveAttribute("data-runtime-source", "synthetic");
  await expect(workbench).toHaveAttribute("data-runtime-state", "degraded");
  await expect(conversationDegraded(page)).toHaveAttribute(
    "title",
    /runtime-unavailable/
  );
  await expect(rail).toBeVisible();

  const header = rail.locator(".uz-conv-rail__head");
  await expect(header.locator(".uz-avatar")).toHaveText("D");
  await expect(header.locator(":scope > div > strong")).toHaveText("Dilnoza Rashidova");
  await expect(header.locator(":scope > div > span")).toHaveText("@dilnoza_r");
  await expect(header.locator(".uz-status-badge")).toHaveText("售后");

  const profile = sectionByHeading(rail, "客户档案");
  expect(await keyValues(profile)).toEqual([
    ["客户ID", "CU-59284013"],
    ["语言", "乌兹别克语（拉丁）"],
    ["旅程阶段", "售后"],
    ["累计订单", "4 单 · ¥1,026"],
    ["未决问题", "退款"],
    ["建档时间", "2026-03-02"]
  ]);
  for (const hidden of ["未决工单", "订单快照", "报价记录"]) {
    await expect(profile).not.toContainText(hidden);
  }

  await expect(
    sectionByHeading(rail, "客户标签").locator(".uz-status-badge")
  ).toHaveText(["VIP", "退款敏感", "+ 添加"]);
  expect(await keyValues(sectionByHeading(rail, "自定义字段"))).toEqual([
    ["客户来源", "广告投放"],
    ["偏好品类", "面部护理"],
    ["累计积分", "1280"],
    ["生日", "—"]
  ]);
  expect(await railListItems(sectionByHeading(rail, "双轨引导"))).toEqual([
    ["报价", "06-25 · 教程旅程自动定位"],
    ["售后", "06-26 · 红线转人工"]
  ]);
  await expect(rail.locator(".uz-conv-rail__quick-actions button")).toHaveText([
    "创建工单",
    "生成报价",
    "身份归并",
    "完整档案"
  ]);

  const desktop = await readFrame(page);
  expect(desktop.rail.width).toBe(340);
  expect(desktop.nav.width).toBe(232);
  expect(desktop.topbar.height).toBeGreaterThanOrEqual(52);
  expect(desktop.topbar.height).toBeLessThanOrEqual(53);
  expect(desktop.list.width).toBe(316);
  expect(desktop.bodyScrollWidth).toBeLessThanOrEqual(1280);
  await page.screenshot({
    fullPage: false,
    path: `${outDir}/react-context-rail-1280x800.png`
  });

  await page.setViewportSize({ width: 320, height: 800 });
  const mobile = await readFrame(page);
  expect(mobile.bodyScrollWidth).toBeLessThanOrEqual(320);
  await page.screenshot({
    fullPage: false,
    path: `${outDir}/react-context-rail-mobile-320x800.png`
  });

  writeFileSync(
    `${outDir}/react-context-rail-metrics.json`,
    `${JSON.stringify({ desktop, mobile }, null, 2)}\n`
  );
});

async function serveSyntheticConversationFallback(page: Page) {
  await page.route("**/conversation-ticket/conversations", async (route) => {
    await route.fulfill({
      body: "<!doctype html><html><body>M7-UI-102 synthetic fallback</body></html>",
      contentType: "text/html",
      status: 200
    });
  });
}

async function enterTenantConversationWorkbench(page: Page) {
  await page.goto("/design");
  await expect(
    page.locator('[data-testid="admin-shell"][data-shell-level="group"]')
  ).toBeVisible();
  await page.locator('[data-testid="m7-group-enter-tenant-tenant-a"]').click();
  await expect(
    page.locator(
      [
        '[data-testid="admin-shell"]',
        '[data-shell-level="tenant"]',
        '[data-active-page-id="tenant.conversations"]'
      ].join("")
    )
  ).toBeVisible();
  await expect(
    page.locator('[data-testid="page-outlet"][data-tenant-id="tenant-a"]')
  ).toBeVisible();
}

function sectionByHeading(rail: Locator, heading: string) {
  return rail.locator(".uz-conv-section", { hasText: heading }).first();
}

async function keyValues(section: Locator) {
  return section
    .locator(".uz-conv-kv div")
    .evaluateAll((rows) =>
      rows.map((row) => [
        row.querySelector("dt")?.textContent?.trim() ?? "",
        row.querySelector("dd")?.textContent?.trim() ?? ""
      ])
    );
}

async function railListItems(section: Locator) {
  return section
    .locator(".uz-conv-rail-list div")
    .evaluateAll((items) =>
      items.map((item) => [
        item.querySelector("strong")?.textContent?.trim() ?? "",
        item.querySelector("span")?.textContent?.trim() ?? ""
      ])
    );
}

async function readFrame(page: Page) {
  return page.evaluate((selectors) => {
    const rect = (selector: string) => {
      const box = document.querySelector(selector)?.getBoundingClientRect();
      return box
        ? {
            height: Math.round(box.height),
            width: Math.round(box.width),
            x: Math.round(box.x),
            y: Math.round(box.y)
          }
        : { height: 0, width: 0, x: 0, y: 0 };
    };
    return {
      bodyScrollWidth: document.body.scrollWidth,
      list: rect(selectors.list),
      nav: rect(selectors.nav),
      rail: rect(selectors.rail),
      topbar: rect(selectors.topbar)
    };
  }, frameSelectors);
}
