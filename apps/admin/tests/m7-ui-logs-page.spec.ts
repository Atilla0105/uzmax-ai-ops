import { mkdirSync, writeFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

const artifactDir = "/tmp/uzmax-m7-ui-56-logs-page-minimal";
mkdirSync(artifactDir, { recursive: true });

test.beforeEach(async ({ page }) => {
  await makeRuntimeQuiet(page);
});

test("renders tenant logs minimal visible page", async ({ page }) => {
  await openLogs(page);

  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "tenant"
  );
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.logs"
  );
  await expect(page.getByTestId("page-outlet")).toHaveAttribute(
    "data-tenant-id",
    "tenant-b"
  );
  await expect(page.getByTestId("m7-logs-page")).toHaveAttribute(
    "data-tenant-id",
    "tenant-b"
  );
  await expect(page.getByRole("heading", { exact: true, name: "日志" })).toBeVisible();
  await expect(page.getByPlaceholder("搜索本页记录…")).toBeVisible();
  await expect(page.getByTestId("m7-logs-active-tab")).toHaveText("操作日志");
  for (const label of ["登录日志", "在线日志", "操作日志"]) {
    await expect(page.getByRole("button", { exact: true, name: label })).toBeVisible();
  }
  for (const label of ["时间", "操作人", "模块", "动作", "对象", "详情"]) {
    await expect(
      page.getByRole("columnheader", { exact: true, name: label })
    ).toBeVisible();
  }
  await expect(page.locator(".uz-logs-row")).toHaveCount(6);
  await expect(page.getByRole("button", { name: "跳转会话 ->" })).toBeVisible();
  for (const label of [
    "degraded",
    "mock",
    "read-only",
    "browser-local only",
    "no logs runtime",
    "no DB/API/authz/RLS",
    "no audit write",
    "no real navigation"
  ]) {
    await expect(page.getByTestId("m7-logs-runtime-note")).toContainText(label);
  }
  writeJson("react-logs-desktop-metrics.json", await metrics(page));
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-logs-desktop.png`
  });
});

test("tabs and search empty state follow source behavior", async ({ page }) => {
  await openLogs(page);
  await page.getByRole("button", { exact: true, name: "登录日志" }).click();
  await expect(page.getByTestId("m7-logs-active-tab")).toHaveText("登录日志");
  await expect(
    page.getByRole("columnheader", { exact: true, name: "IP" })
  ).toBeVisible();
  await expect(page.locator(".uz-logs-row")).toHaveCount(4);

  await page.getByRole("button", { exact: true, name: "在线日志" }).click();
  await expect(page.getByTestId("m7-logs-active-tab")).toHaveText("在线日志");
  await expect(
    page.getByRole("columnheader", { exact: true, name: "前值" })
  ).toBeVisible();
  await expect(page.locator(".uz-logs-row")).toHaveCount(4);

  await page.getByTestId("m7-logs-search").fill("no matching tenant log row");
  await expect(page.locator(".uz-logs-row")).toHaveCount(0);
  await expect(page.getByTestId("m7-logs-empty")).toContainText(
    "没有匹配「no matching tenant log row」的记录"
  );
});

test("forced state variants are query driven", async ({ page }) => {
  for (const state of ["loading", "empty", "error", "permission", "degraded"]) {
    await openLogs(page, `?m7LogsState=${state}`);
    const target =
      state === "degraded"
        ? page.getByTestId("m7-logs-runtime-note")
        : page.getByTestId(`m7-logs-state-${state}`);
    await expect(target).toContainText("browser-local only");
    await expect(target).toContainText("no logs runtime");
  }
});

test("tenant logs are tenant-layer only and mobile stays bounded", async ({ page }) => {
  await page.goto("/design");
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "group"
  );
  await expect(
    page.getByTestId("app-shell-nav").getByRole("button", { exact: true, name: "日志" })
  ).toHaveCount(0);

  await page.setViewportSize({ width: 320, height: 900 });
  await openLogs(page);
  await expect(page.getByTestId("m7-logs-page")).toBeVisible();
  await expect(page.locator(".uz-logs-card").first()).toBeVisible();
  const mobile = await metrics(page);
  expect(mobile.bodyScrollWidth).toBeLessThanOrEqual(320);
  expect(mobile.documentScrollWidth).toBeLessThanOrEqual(320);
  expect(mobile.pageWidth).toBeLessThanOrEqual(320);
  expect(mobile.noteTop - mobile.tabsBottom).toBeLessThan(24);
  expect(mobile.noteBottom - mobile.noteTop).toBeLessThan(140);
  expect(mobile.firstCardTop - mobile.noteBottom).toBeLessThan(32);
  writeJson("react-logs-mobile-320-metrics.json", mobile);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-logs-mobile-320.png`
  });
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

async function makeRuntimeQuiet(page: Page) {
  for (const pattern of [
    "**/conversation-ticket/conversations",
    "**/confirmation-queue/items?status=pending"
  ]) {
    await page.route(pattern, (route) => route.fulfill({ json: { items: [] } }));
  }
}

async function metrics(page: Page) {
  return {
    activePageId: await page
      .getByTestId("admin-shell")
      .getAttribute("data-active-page-id"),
    bodyScrollWidth: await page.evaluate(() => document.body.scrollWidth),
    documentScrollWidth: await page.evaluate(
      () => document.documentElement.scrollWidth
    ),
    firstCardTop: await top(page, ".uz-logs-card"),
    noteBottom: await bottom(page, '[data-testid="m7-logs-runtime-note"]'),
    noteTop: await top(page, '[data-testid="m7-logs-runtime-note"]'),
    pageWidth: await page
      .getByTestId("m7-logs-page")
      .evaluate((node) => Math.round((node as HTMLElement).offsetWidth)),
    rowCount: await page.locator(".uz-logs-row").count(),
    shellLevel: await page.getByTestId("admin-shell").getAttribute("data-shell-level"),
    tabsBottom: await bottom(page, ".uz-logs-tabs")
  };
}

function writeJson(name: string, value: unknown) {
  writeFileSync(`${artifactDir}/${name}`, JSON.stringify(value, null, 2));
}

async function bottom(page: Page, selector: string) {
  return page
    .locator(selector)
    .first()
    .evaluate((node) =>
      Math.round((node as HTMLElement).getBoundingClientRect().bottom)
    );
}

async function top(page: Page, selector: string) {
  return page
    .locator(selector)
    .first()
    .evaluate((node) => Math.round((node as HTMLElement).getBoundingClientRect().top));
}
