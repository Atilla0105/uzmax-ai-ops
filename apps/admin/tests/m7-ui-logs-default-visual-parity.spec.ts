import { mkdirSync, writeFileSync } from "node:fs";
import { expect, test, type Locator, type Page } from "@playwright/test";

const artifactDir = "/tmp/uzmax-m7-ui-91-logs-default-visual-parity-refresh";
const runtimeLabels = [
  "degraded",
  "mock",
  "read-only",
  "browser-local only",
  "synthetic tenant log rows",
  "no production audit/log export",
  "no file written",
  "no audit/log runtime call",
  "no real tenant/action navigation"
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

test("keeps tenant.logs default visible body operational while retaining hidden runtime boundaries", async ({
  page
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openLogs(page);

  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.logs"
  );
  await expect(page.getByTestId("m7-logs-page")).toHaveAttribute(
    "data-runtime-boundary",
    /no production audit\/log export/
  );
  await expect(page.getByTestId("m7-logs-runtime-note")).toHaveAttribute("hidden", "");
  await expectRuntimeBoundary(page.getByTestId("m7-logs-runtime-note"));
  await expect(page.getByRole("heading", { name: "日志" })).toBeVisible();
  await expect(page.getByTestId("m7-logs-search")).toHaveAttribute(
    "aria-label",
    "搜索租户日志记录"
  );
  await expect(page.getByTestId("m7-logs-active-tab")).toHaveText("操作日志");
  await expect(page.locator(".uz-tlog-row")).toHaveCount(6);
  await expectVisibleBodyClean(page);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-logs-default-clean.png`
  });

  await page.getByTestId("m7-logs-search").fill("不存在的日志");
  await expect(page.locator(".uz-tlog-row")).toHaveCount(0);
  await expect(page.getByTestId("m7-logs-empty")).toContainText(
    "没有匹配「不存在的日志」的记录"
  );
  await expectVisibleBodyClean(page);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-logs-search-empty-clean.png`
  });

  await page.getByTestId("m7-logs-search").fill("");
  const detail = page.getByRole("button", {
    name: /查看日志详情 配置 route v17/
  });
  await expectRuntimeBoundary(detail);
  await detail.click();
  await expect(page.getByTestId("m7-logs-toast")).toContainText("详情预览已打开");
  await expect(page.getByTestId("m7-logs-toast")).toContainText("route v17");
  await expectRuntimeBoundary(page.getByTestId("m7-logs-toast"));
  await expectVisibleBodyClean(page);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-logs-detail-toast-clean.png`
  });

  const desktop = await collectMetrics(page);
  expect(desktop.activePageId).toBe("tenant.logs");
  expect(desktop.runtimeLabelsPresent).toBe(true);
  expect(desktop.runtimeLabelsVisibleInBody).toBe(false);
  expect(desktop.visibleBodyClean).toBe(true);
  expect(desktop.tableRowCount).toBe(6);

  for (const state of ["loading", "empty", "error", "permission", "degraded"]) {
    await openLogs(page, `?m7LogsState=${state}`);
    const target =
      state === "degraded"
        ? page.getByTestId("m7-logs-runtime-note")
        : page.getByTestId(`m7-logs-state-${state}`);
    await expectRuntimeBoundary(target);
    if (state === "loading") await expect(target).toContainText("正在加载日志");
    if (state === "empty") await expect(target).toContainText("暂无日志记录");
    if (state === "error") await expect(target).toContainText("日志暂不可用");
    if (state === "permission") await expect(target).toContainText("需要日志权限");
    await expectVisibleBodyClean(page);
  }

  await openLogs(page);
  await page.getByRole("button", { name: "Collapse navigation" }).click();
  const collapsed = await collectMetrics(page);
  expect(collapsed.navWidth).toBe(68);
  expect(collapsed.runtimeLabelsVisibleInBody).toBe(false);
  expect(collapsed.visibleBodyClean).toBe(true);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-logs-collapsed-clean.png`
  });

  await page.setViewportSize({ width: 320, height: 900 });
  await openLogs(page);
  const mobile = await collectMetrics(page);
  expect(mobile.bodyScrollWidth).toBeLessThanOrEqual(320);
  expect(mobile.documentScrollWidth).toBeLessThanOrEqual(320);
  expect(mobile.visibleBodyClean).toBe(true);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-logs-mobile-320-default-clean.png`
  });

  writeFileSync(
    `${artifactDir}/metrics.json`,
    `${JSON.stringify({ collapsed, desktop, mobile }, null, 2)}\n`
  );
});

async function openLogs(page: Page, query = "") {
  await page.goto(`/design${query}`);
  await page.getByTestId("tenant-switcher").selectOption("tenant-b");
  await page
    .getByTestId("app-shell-nav")
    .getByRole("button", { exact: true, name: "日志" })
    .click();
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.logs"
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
        tableRowCount: document.querySelectorAll(".uz-tlog-row").length,
        visibleBodyClean: forbidden.every(
          (term) => !visibleText.toLowerCase().includes(term.toLowerCase())
        )
      };
    },
    { forbidden: forbiddenVisibleTerms, labels: runtimeLabels }
  );
}
