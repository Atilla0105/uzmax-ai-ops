import { mkdirSync, writeFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

const artifactDir = "/tmp/uzmax-m7-ui-63-confirmation-queue-visible-parity";
mkdirSync(artifactDir, { recursive: true });

test.beforeEach(async ({ page }) => {
  await page.route("**/confirmation-queue/items?status=pending", async (route) => {
    await route.fulfill({
      json: { error: "controlled://m7-ui-63/runtime-unavailable" },
      status: 500
    });
  });
});

test("renders degraded visible queue when API is unavailable", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 840 });
  await openQueue(page);

  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "tenant"
  );
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.queue"
  );
  await expect(page.getByTestId("route-breadcrumb")).toContainText("玉珠跨境美妆");
  await expect(page.locator(".uz-topbar")).toBeVisible();

  await expect(page.getByTestId("m7-queue-stats")).toContainText("今日候选");
  await expect(page.getByTestId("m7-queue-stats")).toContainText("mock 6 / 5");
  await expect(page.getByTestId("m7-queue-degraded")).toContainText(
    "mock/degraded visible structure"
  );
  await expect(page.getByTestId("m7-queue-flow")).toBeVisible();
  await expect(page.getByTestId("m7-queue-card-mock-degraded-normal")).toContainText(
    "mock/degraded"
  );
  await expect(page.getByTestId("m7-queue-diff-mock-degraded-conflict")).toContainText(
    "controlled://m7-ui-63/mock/current/conflict-primary"
  );
  await expect(page.getByRole("button", { name: /通过 · read-only/ })).toBeDisabled();
  await expect(
    page.getByRole("button", { name: /采纳候选值 · runtime unavailable/ })
  ).toHaveCount(0);
  await page.getByTestId("m7-queue-card-mock-degraded-conflict").click();
  await expect(
    page.getByRole("button", { name: /采纳候选值 · runtime unavailable/ })
  ).toBeDisabled();

  const desktopMetrics = await collectMetrics(page);
  expect(desktopMetrics.navWidth).toBe(232);
  expect(desktopMetrics.topbarHeight).toBe(53);
  expect(desktopMetrics.queueFlowWidth).toBeGreaterThanOrEqual(650);
  expect(desktopMetrics.queueFlowWidth).toBeLessThanOrEqual(680);
  expect(desktopMetrics.bodyScrollWidth).toBeLessThanOrEqual(1280);
  expect(desktopMetrics.degradedLabelsPresent).toBe(true);
  expect(desktopMetrics.cardCount).toBeGreaterThanOrEqual(2);
  expect(desktopMetrics.conflictDiffPresent).toBe(true);
  await page.screenshot({
    fullPage: false,
    path: `${artifactDir}/react-queue-desktop.png`
  });

  await page.getByRole("button", { name: "Collapse navigation" }).click();
  await expect(page.getByTestId("admin-shell")).toHaveClass(/is-nav-collapsed/);
  const collapsedMetrics = await collectMetrics(page);
  expect(collapsedMetrics.navWidth).toBe(68);
  expect(collapsedMetrics.bodyScrollWidth).toBeLessThanOrEqual(1280);
  await page.screenshot({
    fullPage: false,
    path: `${artifactDir}/react-queue-collapsed.png`
  });

  await page.setViewportSize({ width: 320, height: 900 });
  await openQueue(page);
  const mobileMetrics = await collectMetrics(page);
  expect(mobileMetrics.bodyScrollWidth).toBeLessThanOrEqual(320);
  expect(mobileMetrics.cardCount).toBeGreaterThanOrEqual(2);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-queue-mobile-320.png`
  });

  writeFileSync(
    `${artifactDir}/metrics.json`,
    `${JSON.stringify(
      { collapsed: collapsedMetrics, desktop: desktopMetrics, mobile: mobileMetrics },
      null,
      2
    )}\n`
  );
});

async function openQueue(page: Page) {
  await page.goto("/design");
  await page.getByTestId("tenant-switcher").selectOption("tenant-b");
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "tenant"
  );
  await page.getByRole("button", { name: "确认队列" }).click();
  await expect(page.getByTestId("m7-confirmation-queue-page")).toBeVisible();
  await expect(page.getByTestId("m7-queue-loading")).toHaveCount(0);
}

async function collectMetrics(page: Page) {
  return page.evaluate(() => {
    const roundWidth = (selector: string) => {
      const element = document.querySelector(selector);
      return element ? Math.round(element.getBoundingClientRect().width) : 0;
    };
    const roundHeight = (selector: string) => {
      const element = document.querySelector(selector);
      return element ? Math.round(element.getBoundingClientRect().height) : 0;
    };
    const text = document.body.innerText;
    return {
      bodyScrollWidth: document.body.scrollWidth,
      cardCount: document.querySelectorAll(".uz-queue-card").length,
      conflictDiffPresent:
        document.querySelector(
          '[data-testid="m7-queue-diff-mock-degraded-conflict"]'
        ) !== null,
      degradedLabelsPresent:
        text.includes("mock/degraded") &&
        text.includes("read-only") &&
        text.includes("runtime unavailable"),
      navWidth: roundWidth('[data-testid="app-shell-nav"]'),
      queueFlowWidth: roundWidth('[data-testid="m7-queue-flow"]'),
      shellLevel: document
        .querySelector('[data-testid="admin-shell"]')
        ?.getAttribute("data-shell-level"),
      topbarHeight: roundHeight(".uz-topbar")
    };
  });
}
