import { mkdirSync, writeFileSync } from "node:fs";
import { expect, test, type Locator, type Page } from "@playwright/test";

const artifactDir = "/tmp/uzmax-m7-ui-90-analytics-default-visual-parity-refresh";
const runtimeLabels = [
  "degraded",
  "mock",
  "browser-local only",
  "no production analytics metrics",
  "no export file write",
  "no analytics runtime",
  "no audit write"
];
const forbiddenVisibleTerms = [
  ...runtimeLabels,
  "local-only",
  "local only",
  "Synthetic"
];

mkdirSync(artifactDir, { recursive: true });

test.beforeEach(async ({ page }) => {
  await page.route("**/conversation-ticket/conversations", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
  await page.route("**/confirmation-queue/items?status=pending", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
});

test("keeps tenant.analytics default body operational while retaining hidden runtime boundaries", async ({
  page
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openAnalytics(page);

  await expect(page.getByTestId("m7-analytics-page")).toHaveAttribute(
    "data-runtime-boundary",
    /no production analytics metrics/
  );
  await expect(page.getByTestId("m7-analytics-runtime-note")).toHaveAttribute(
    "hidden",
    ""
  );
  await expectRuntimeBoundary(page.getByTestId("m7-analytics-runtime-note"));
  await expect(page.getByTestId("m7-analytics-page")).toContainText("分析");
  await expect(page.getByTestId("m7-analytics-kpis")).toContainText("解决率");
  await expect(page.getByTestId("m7-analytics-handoff")).toContainText(
    "转人工原因分布"
  );
  await expect(page.getByTestId("m7-analytics-top-issues")).toContainText("Top 问题");
  await expect(page.getByTestId("m7-analytics-table")).toContainText("分析表");
  await expectVisibleBodyClean(page);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-analytics-default-clean.png`
  });

  await page.getByRole("button", { name: "添加维度" }).click();
  await page
    .getByTestId("m7-analytics-dim-menu")
    .getByRole("button", { exact: true, name: "AI 成员" })
    .click();
  await page
    .getByTestId("m7-analytics-dim-menu")
    .getByRole("button", { exact: true, name: "订单状态" })
    .click();
  await page
    .getByTestId("m7-analytics-dim-menu")
    .getByRole("button", { exact: true, name: "渠道" })
    .click({ force: true });
  await expect(page.getByTestId("m7-analytics-toast")).toContainText(
    "最多只能同时查看 2 个维度"
  );
  await expectRuntimeBoundary(page.getByTestId("m7-analytics-toast"));
  await expectVisibleBodyClean(page);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-analytics-dimension-limit-clean.png`
  });

  await page.getByTestId("m7-analytics-export").click();
  await expect(page.getByTestId("m7-analytics-toast")).toContainText("导出预览已生成");
  await expectRuntimeBoundary(page.getByTestId("m7-analytics-toast"));
  await expectVisibleBodyClean(page);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-analytics-export-clean.png`
  });

  const desktop = await collectMetrics(page);
  expect(desktop.activePageId).toBe("tenant.analytics");
  expect(desktop.runtimeLabelsPresent).toBe(true);
  expect(desktop.runtimeLabelsVisibleInBody).toBe(false);
  expect(desktop.visibleBodyClean).toBe(true);
  expect(desktop.kpiCount).toBe(10);

  for (const state of ["loading", "empty", "error", "permission", "degraded"]) {
    await openAnalytics(page, `?m7AnalyticsState=${state}`);
    const target =
      state === "degraded"
        ? page.getByTestId("m7-analytics-runtime-note")
        : page.getByTestId(`m7-analytics-state-${state}`);
    await expectRuntimeBoundary(target);
    await expectVisibleBodyClean(page);
  }

  await openAnalytics(page);
  await page.getByRole("button", { name: "Collapse navigation" }).click();
  const collapsed = await collectMetrics(page);
  expect(collapsed.navWidth).toBe(68);
  expect(collapsed.runtimeLabelsVisibleInBody).toBe(false);
  expect(collapsed.visibleBodyClean).toBe(true);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-analytics-collapsed-clean.png`
  });

  await page.setViewportSize({ width: 320, height: 900 });
  await openAnalytics(page);
  const mobile = await collectMetrics(page);
  expect(mobile.bodyScrollWidth).toBeLessThanOrEqual(320);
  expect(mobile.documentScrollWidth).toBeLessThanOrEqual(320);
  expect(mobile.visibleBodyClean).toBe(true);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-analytics-mobile-320-default-clean.png`
  });

  writeFileSync(
    `${artifactDir}/metrics.json`,
    `${JSON.stringify({ collapsed, desktop, mobile }, null, 2)}\n`
  );
});

async function openAnalytics(page: Page, query = "") {
  await page.goto(`/design${query}`);
  await page.getByTestId("tenant-switcher").selectOption("tenant-b");
  await page
    .getByTestId("app-shell-nav")
    .getByRole("button", { exact: true, name: "分析" })
    .click();
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.analytics"
  );
}

async function expectVisibleBodyClean(page: Page) {
  const visibleBody = await page.evaluate(() => document.body.innerText);
  for (const term of forbiddenVisibleTerms) {
    expect(visibleBody.toLowerCase()).not.toContain(term.toLowerCase());
  }
}

async function expectRuntimeBoundary(locator: Locator) {
  const text = await locator.evaluate((node) =>
    [
      node.getAttribute("data-runtime-boundary") ?? "",
      node.getAttribute("title") ?? "",
      node.getAttribute("aria-description") ?? "",
      node.textContent ?? ""
    ].join(" ")
  );
  for (const label of runtimeLabels) expect(text).toContain(label);
}

async function collectMetrics(page: Page) {
  return page.evaluate(
    ({ forbidden, labels }) => {
      const visibleText = document.body.innerText;
      const boundaryText = Array.from(
        document.querySelectorAll("[data-runtime-boundary]")
      )
        .map((node) => {
          const element = node as HTMLElement;
          return [
            element.getAttribute("data-runtime-boundary") ?? "",
            element.getAttribute("title") ?? "",
            element.getAttribute("aria-description") ?? ""
          ].join(" ");
        })
        .join(" ");
      const fullText = document.body.textContent ?? "";
      return {
        activePageId: document
          .querySelector('[data-testid="admin-shell"]')
          ?.getAttribute("data-active-page-id"),
        bodyScrollWidth: document.body.scrollWidth,
        boundaryText,
        documentScrollWidth: document.documentElement.scrollWidth,
        kpiCount: document.querySelectorAll(".uz-analytics-kpi").length,
        navWidth: Math.round(
          document
            .querySelector('[data-testid="app-shell-nav"]')
            ?.getBoundingClientRect().width ?? 0
        ),
        runtimeLabelsPresent: labels.every((label) =>
          `${boundaryText} ${fullText}`.includes(label)
        ),
        runtimeLabelsVisibleInBody: labels.some((label) =>
          visibleText.toLowerCase().includes(label.toLowerCase())
        ),
        visibleBodyClean: forbidden.every(
          (term) => !visibleText.toLowerCase().includes(term.toLowerCase())
        )
      };
    },
    { forbidden: forbiddenVisibleTerms, labels: runtimeLabels }
  );
}
