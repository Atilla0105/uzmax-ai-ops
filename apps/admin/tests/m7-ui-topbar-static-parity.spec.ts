import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { expect, test, type Page } from "@playwright/test";

const artifactDir = "/tmp/uzmax-m7-ui-62a-topbar-static-parity-v2";
const ownerHtmlPath = "/Users/atilla/Downloads/运营塔台1.0.html";

mkdirSync(artifactDir, { recursive: true });

test.beforeEach(async ({ page }) => {
  await page.route("**/conversation-ticket/conversations", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
});

test("captures owner and React topbar static parity screenshots", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  if (existsSync(ownerHtmlPath)) {
    await openOwnerTopbarPreview(page);
    const ownerMetrics = await collectTopbarMetrics(page, "owner");
    writeFileSync(
      `${artifactDir}/owner-html-desktop-metrics.json`,
      `${JSON.stringify(ownerMetrics, null, 2)}\n`
    );
  } else {
    writeFileSync(
      `${artifactDir}/owner-html-desktop-metrics.json`,
      `${JSON.stringify(
        {
          unavailable: true,
          ownerHtmlPath,
          reason: "Owner HTML is not available in this environment"
        },
        null,
        2
      )}\n`
    );
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/design");
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "group"
  );
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "group.overview"
  );
  await expect(page.locator(".uz-kbd")).toContainText("⌘K");

  const groupMetrics = await collectTopbarMetrics(page, "group");
  writeFileSync(
    `${artifactDir}/react-topbar-group-desktop-metrics.json`,
    `${JSON.stringify(groupMetrics, null, 2)}\n`
  );
  await page.screenshot({
    path: `${artifactDir}/react-topbar-group-desktop.png`
  });

  await page.getByTestId("tenant-switcher").selectOption("tenant-b");
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "tenant"
  );
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.conversations"
  );
  await expect(page.getByTestId("tenant-switcher")).toHaveValue("tenant-b");

  const tenantMetrics = await collectTopbarMetrics(page, "tenant");
  writeFileSync(
    `${artifactDir}/react-topbar-tenant-desktop-metrics.json`,
    `${JSON.stringify(tenantMetrics, null, 2)}\n`
  );
  await page.screenshot({
    path: `${artifactDir}/react-topbar-tenant-desktop.png`
  });
});

test("captures React mobile topbar 320px fallback with no overflow", async ({
  page
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/design");
  await page.getByTestId("tenant-switcher").selectOption("tenant-b");
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "tenant"
  );
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.conversations"
  );

  const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
  expect(bodyScrollWidth).toBeLessThanOrEqual(320);

  const mobileMetrics = await collectTopbarMetrics(page, "tenant-mobile");
  writeFileSync(
    `${artifactDir}/react-topbar-mobile-320-metrics.json`,
    `${JSON.stringify(mobileMetrics, null, 2)}\n`
  );
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-topbar-mobile-320.png`
  });
});

async function openOwnerTopbarPreview(page: Page) {
  await page.goto(pathToFileURL(ownerHtmlPath).toString(), {
    waitUntil: "domcontentloaded"
  });
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${artifactDir}/owner-html-desktop.png` });
}

async function collectTopbarMetrics(page: Page, state: string) {
  return page.evaluate((traceState) => {
    type Rect = {
      height: number;
      width: number;
      x: number;
      y: number;
      right: number;
      bottom: number;
    } | null;
    const rectFor = (element: Element | null): Rect => {
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      return {
        height: Math.round(rect.height),
        width: Math.round(rect.width),
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        right: Math.round(rect.right),
        bottom: Math.round(rect.bottom)
      };
    };

    if (traceState === "owner") {
      return collectOwnerTopbarMetricsForPage(rectFor);
    }

    return collectReactTopbarMetricsForPage(traceState, rectFor);

    function collectOwnerTopbarMetricsForPage(
      rectForFn: (element: Element | null) => Rect
    ) {
      const topbar = document.querySelector("header");
      if (!topbar) {
        return {
          topbar: null,
          body: {
            height: document.body.scrollHeight,
            width: document.body.scrollWidth
          }
        };
      }
      const text = topbar.textContent?.trim() ?? "";
      return {
        topbar: rectForFn(topbar),
        body: { height: document.body.scrollHeight, width: document.body.scrollWidth },
        hasSearchHint: text.includes("搜索会话、客户、订单、工单、知识"),
        hasProductionMarker: text.includes("PRODUCTION"),
        hasHeartbeat: text.includes("68ms"),
        hasNotifyBadge: text.includes("5"),
        hasOperator: text.includes("韩") && text.includes("运营负责人")
      };
    }

    function collectReactTopbarMetricsForPage(
      traceState: string,
      rectForFn: (element: Element | null) => Rect
    ) {
      const topbar = document.querySelector(".uz-topbar");
      const search = document.querySelector(".uz-global-search");
      const envMarker = document.querySelector('[data-testid="environment-marker"]');
      const breadcrumb = document.querySelector(".uz-breadcrumb");
      const user = document.querySelector(".uz-user-button");
      const heartbeat = document.querySelector(".uz-heartbeat-label");
      const nav = document.querySelector('[data-testid="app-shell-nav"]');
      const routeBadge = document.querySelector('[data-testid="active-layer-badge"]');
      const tenantSelect = document.querySelector(".uz-tenant-select");
      const shell = document.querySelector('[data-testid="admin-shell"]');

      return {
        state: traceState,
        shellLevel: shell?.getAttribute("data-shell-level") ?? null,
        activePageId: shell?.getAttribute("data-active-page-id") ?? null,
        topbar: rectForFn(topbar),
        breadcrumb: rectForFn(breadcrumb),
        search: rectForFn(search),
        layerBadge: routeBadge ? routeBadge.textContent?.trim() : null,
        tenantSelect: rectForFn(tenantSelect),
        envMarker: rectForFn(envMarker),
        heartbeat: rectForFn(heartbeat),
        user: rectForFn(user),
        nav: rectForFn(nav),
        body: {
          scrollHeight: document.body.scrollHeight,
          scrollWidth: document.body.scrollWidth
        }
      };
    }
  }, state);
}
