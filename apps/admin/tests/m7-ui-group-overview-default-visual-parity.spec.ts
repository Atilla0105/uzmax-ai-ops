import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

const ownerHtml = "/Users/atilla/Downloads/运营塔台1.0.html";
const sourceFiles = {
  fixtures: "/Users/atilla/源码/unpacked 6/fixtures/group.ts",
  page: "/Users/atilla/源码/unpacked 6/pages/group/GroupOverviewPage.tsx"
};
const forbiddenVisibleTerms = [
  "mock/degraded",
  "mock",
  "read-only",
  "runtime unavailable",
  "not production metrics",
  "centralized mock/degraded fallback only",
  "aggregate runtime unavailable",
  "synthetic"
];
const sourceLikeTexts = [
  "集团总览",
  "4 个租户",
  "美妆 · 中亚",
  "阻断",
  "通过",
  "运行中",
  "降级",
  "故障",
  "正常",
  "红线 · 9分钟前"
];

test.beforeEach(async ({ page }) => {
  await page.route("**/conversation-ticket/conversations", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
});

test("keeps default group overview body source-like while runtime boundary stays hidden", async ({
  page
}) => {
  const source = readSourceMapping();
  expect(source.ownerHasGroupOverview).toBe(true);
  expect(source.fixtureHasSourceRows).toBe(true);
  expect(source.pageHasRealtimeLabel).toBe(true);

  await page.setViewportSize({ width: 1280, height: 840 });
  await page.goto("/design");
  const desktop = await collectDefaultMetrics(page);
  expect(desktop.shellLevel).toBe("group");
  expect(desktop.activePageId).toBe("group.overview");
  expect(desktop.navWidth).toBe(232);
  expect(desktop.topbarHeight).toBeGreaterThanOrEqual(52);
  expect(desktop.topbarHeight).toBeLessThanOrEqual(53);
  expect(desktop.rowCount).toBe(4);
  expect(desktop.bodyScrollWidth).toBeLessThanOrEqual(1280);
  expect(desktop.sourceLikeDefaultVisible).toBe(true);
  expect(desktop.runtimeLabelsPresent).toBe(true);
  expect(desktop.runtimeLabelsVisibleInBody).toBe(false);

  await page.getByRole("button", { name: "Collapse navigation" }).click();
  const collapsed = await collectDefaultMetrics(page);
  expect(collapsed.navWidth).toBe(68);
  expect(collapsed.bodyScrollWidth).toBeLessThanOrEqual(1280);
  expect(collapsed.sourceLikeDefaultVisible).toBe(true);
  expect(collapsed.runtimeLabelsVisibleInBody).toBe(false);

  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/design");
  const mobile = await collectDefaultMetrics(page);
  expect(mobile.shellLevel).toBe("group");
  expect(mobile.activePageId).toBe("group.overview");
  expect(mobile.rowCount).toBe(4);
  expect(mobile.bodyScrollWidth).toBeLessThanOrEqual(320);
  expect(mobile.documentScrollWidth).toBeLessThanOrEqual(320);
  expect(mobile.sourceLikeDefaultVisible).toBe(true);
  expect(mobile.runtimeLabelsPresent).toBe(true);
  expect(mobile.runtimeLabelsVisibleInBody).toBe(false);
});

function readSourceMapping() {
  const owner = readFileSync(ownerHtml, "utf8");
  const fixtures = readFileSync(sourceFiles.fixtures, "utf8");
  const page = readFileSync(sourceFiles.page, "utf8");
  return {
    fixtureHasSourceRows:
      fixtures.includes("美妆 · 中亚") &&
      fixtures.includes("阻断") &&
      fixtures.includes("降级") &&
      fixtures.includes("红线"),
    ownerHasGroupOverview: owner.includes("集团总览"),
    pageHasRealtimeLabel: page.includes("实时")
  };
}

async function collectDefaultMetrics(page: Page) {
  const raw = await page.evaluate(() => {
    const rect = (selector: string) => {
      const element = document.querySelector(selector);
      if (!element) return { height: 0, width: 0 };
      const box = element.getBoundingClientRect();
      return { height: Math.round(box.height), width: Math.round(box.width) };
    };
    return {
      activePageId: document
        .querySelector('[data-testid="admin-shell"]')
        ?.getAttribute("data-active-page-id"),
      bodyScrollWidth: document.body.scrollWidth,
      bodyText: document.body.innerText,
      documentScrollWidth: document.documentElement.scrollWidth,
      navWidth: rect('[data-testid="app-shell-nav"]').width,
      rowCount: document.querySelectorAll('[data-testid^="m7-group-overview-row-"]')
        .length,
      shellLevel: document
        .querySelector('[data-testid="admin-shell"]')
        ?.getAttribute("data-shell-level"),
      topbarHeight: rect(".uz-topbar").height
    };
  });
  const boundary =
    (await page
      .getByTestId("m7-group-overview-page")
      .getAttribute("data-runtime-boundary")) ?? "";
  const runtimeNote =
    (await page.getByTestId("m7-group-overview-runtime-note").textContent()) ?? "";
  const bodyText = raw.bodyText;
  return {
    ...raw,
    bodyText: undefined,
    runtimeLabelsPresent:
      boundary.includes("degraded") &&
      boundary.includes("mock") &&
      boundary.includes("read-only") &&
      runtimeNote.includes("not production metrics"),
    runtimeLabelsVisibleInBody: forbiddenVisibleTerms.some((term) =>
      bodyText.toLowerCase().includes(term)
    ),
    sourceLikeDefaultVisible: sourceLikeTexts.every((text) => bodyText.includes(text))
  };
}
