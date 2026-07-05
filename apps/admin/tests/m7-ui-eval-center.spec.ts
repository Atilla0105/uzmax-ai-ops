import { mkdirSync, writeFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

const artifactDir = "/tmp/uzmax-m7-ui-40-eval-center-visible-ui";
const tenantLabels =
  "对话|工单|确认队列|客户资产|订单|知识与资源|评测中心|AI 成员|团队|配置|分析|日志".split(
    "|"
  );
const tenantSections = ["运营", "数据", "智能", "管理", "洞察"];
const runtimeLabels = [
  "degraded",
  "mock",
  "read-only",
  "not production eval data",
  "no production publish",
  "manual review local only"
];

mkdirSync(artifactDir, { recursive: true });

test.beforeEach(async ({ page }) => {
  await page.route("**/conversation-ticket/conversations", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
});

test("renders tenant.eval with tenant-only nav runtime labels and desktop metrics", async ({
  page
}) => {
  await openEval(page);
  await expect(page.getByTestId("page-outlet")).toHaveAttribute(
    "data-page-id",
    "tenant.eval"
  );
  await expect(page.getByTestId("m7-eval-page")).toHaveAttribute(
    "data-runtime-state",
    "degraded"
  );
  await expect(page.getByTestId("m7-eval-runtime-note")).toBeHidden();
  const runtimeBoundary =
    (await page.getByTestId("m7-eval-page").getAttribute("data-runtime-boundary")) ??
    "";
  for (const label of runtimeLabels) expect(runtimeBoundary).toContain(label);
  for (const label of runtimeLabels)
    expect(await page.evaluate(() => document.body.innerText)).not.toContain(label);
  await expect(page.getByTestId("m7-eval-gate")).toContainText("Production Gate：阻断");
  await expect(page.getByTestId("m7-eval-publish")).toBeDisabled();
  await expect(page.getByTestId("m7-eval-detail")).toContainText("Expected");
  await expect(page.getByTestId("m7-eval-detail")).toContainText("Actual");
  await expectTenantOnlyNav(page);

  const metrics = await collectMetrics(page);
  expect(metrics.topbarHeight).toBeGreaterThanOrEqual(52);
  expect(metrics.topbarHeight).toBeLessThanOrEqual(53);
  expect(metrics.sidebarExpandedWidth).toBe(232);
  expect(metrics.leftListWidth).toBe(300);
  expect(metrics.activePageId).toBe("tenant.eval");
  expect(metrics.shellLevel).toBe("tenant");
  writeFileSync(
    `${artifactDir}/react-eval-center-metrics.json`,
    JSON.stringify(metrics, null, 2)
  );
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-eval-center-desktop.png`
  });
});

test("supports run state blind review toggle and forced URL states", async ({
  page
}) => {
  await openEval(page);
  await page.getByTestId("m7-eval-run").click();
  await expect(page.getByTestId("m7-eval-gate")).toContainText("运行中");
  await expect(page.getByTestId("m7-eval-run")).toBeDisabled();
  await page.getByTestId("m7-eval-set-SYN-EVAL-SET-REDLINE").click();
  await expect(page.getByTestId("m7-eval-run")).toBeDisabled();
  await expect(page.getByTestId("m7-eval-gate")).toContainText("阻断", {
    timeout: 1600
  });

  await page.getByTestId("m7-eval-set-SYN-EVAL-SET-QUOTE").click();
  await expect(page.getByTestId("m7-eval-blind-toggle")).toContainText("盲评进行中");
  await page.getByTestId("m7-eval-blind-toggle").click();
  await expect(page.getByTestId("m7-eval-blind-toggle")).toContainText("盲评已完成");

  await openEval(page, "?m7EvalState=running");
  await expect(page.getByTestId("m7-eval-gate")).toContainText("运行中");
  await openEval(page, "?m7EvalState=pass");
  await expect(page.getByTestId("m7-eval-gate")).toContainText("通过");
  await expect(page.getByTestId("m7-eval-publish")).toBeEnabled();
  for (const state of ["loading", "empty", "error", "permission"]) {
    await openEval(page, `?m7EvalState=${state}`);
    await expect(page.getByTestId(`m7-eval-state-${state}`)).toBeVisible();
    await expect(page.getByTestId(`m7-eval-state-${state}`)).toContainText(
      "no production publish"
    );
  }
});

test("requires reasons for manual override and local publish preview", async ({
  page
}) => {
  await openEval(page);
  await page.getByTestId("m7-eval-first-blocked").click();
  await page
    .getByTestId("m7-eval-case-SYN-EVAL-CASE-102")
    .getByRole("button", { name: "人工复核为通过" })
    .click();
  await expect(page.getByTestId("m7-confirm-modal")).toBeVisible();
  await expect(
    page.getByTestId("m7-confirm-modal").getByRole("button", { name: "人工复核为通过" })
  ).toBeDisabled();
  await page.getByLabel("Override reason").fill("local manual review reason");
  await page
    .getByTestId("m7-confirm-modal")
    .getByRole("button", { name: "人工复核为通过" })
    .click();
  await expect(page.getByTestId("m7-eval-toast")).toContainText(
    "manual review local only"
  );
  await expect(page.getByTestId("m7-eval-case-SYN-EVAL-CASE-102")).toContainText(
    "local manual review reason"
  );
  await expect(page.getByTestId("m7-eval-publish")).toBeDisabled();

  await page.getByTestId("m7-eval-set-SYN-EVAL-SET-REDLINE").click();
  for (const id of ["SYN-EVAL-CASE-201", "SYN-EVAL-CASE-202"]) {
    await page
      .getByTestId(`m7-eval-case-${id}`)
      .getByRole("button", { name: "人工复核为通过" })
      .click();
    await page.getByLabel("Override reason").fill(`reason for ${id}`);
    await page
      .getByTestId("m7-confirm-modal")
      .getByRole("button", { name: "人工复核为通过" })
      .click();
  }
  await expect(page.getByTestId("m7-eval-gate")).toContainText("通过");
  await expect(page.getByTestId("m7-eval-publish")).toBeEnabled();

  await page.getByTestId("m7-eval-publish").click();
  await expect(page.getByRole("button", { name: "确认本地发布预览" })).toBeDisabled();
  await page.getByLabel("Publish reason").fill("local publish review only");
  await page.getByRole("button", { name: "确认本地发布预览" }).click();
  await expect(page.getByTestId("m7-eval-toast")).toContainText(
    "no production publish"
  );
  await expect(page.getByTestId("m7-eval-toast")).toContainText(
    "local publish review only"
  );
});

test("resets local eval state when switching tenants", async ({ page }) => {
  await openEval(page);
  await page
    .getByTestId("m7-eval-case-SYN-EVAL-CASE-102")
    .getByRole("button", { name: "人工复核为通过" })
    .click();
  await page.getByLabel("Override reason").fill("tenant-b local override");
  await page
    .getByTestId("m7-confirm-modal")
    .getByRole("button", { name: "人工复核为通过" })
    .click();
  await expect(page.getByTestId("m7-eval-case-SYN-EVAL-CASE-102")).toContainText(
    "manual review local only"
  );

  await page.getByTestId("tenant-switcher").selectOption("tenant-c");
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.eval"
  );
  await expect(page.getByTestId("m7-eval-page")).toHaveAttribute(
    "data-tenant-id",
    "tenant-c"
  );
  await expect(page.getByTestId("m7-eval-case-SYN-EVAL-CASE-102")).toContainText(
    "失败"
  );
  await expect(page.getByTestId("m7-eval-case-SYN-EVAL-CASE-102")).not.toContainText(
    "tenant-b local override"
  );
});

test("supports collapse and mobile 320 fallback without body overflow", async ({
  page
}) => {
  await openEval(page);
  await page.getByRole("button", { name: "Collapse navigation" }).click();
  await expect(page.getByTestId("app-shell-nav")).toHaveJSProperty("offsetWidth", 68);
  await expectTenantOnlyNav(page);

  await page.setViewportSize({ width: 320, height: 900 });
  await openEval(page);
  await expect(page.getByTestId("m7-eval-set-list")).toBeVisible();
  await expect(page.getByTestId("m7-eval-detail")).toBeVisible();
  expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(320);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-eval-center-mobile-320.png`
  });
});

async function openEval(page: Page, query = "") {
  await page.goto(`/design${query}`);
  await page.getByTestId("tenant-switcher").selectOption("tenant-b");
  await page
    .getByTestId("app-shell-nav")
    .getByRole("button", { exact: true, name: "评测中心" })
    .click();
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.eval"
  );
}

async function expectTenantOnlyNav(page: Page) {
  const nav = page.getByTestId("app-shell-nav");
  await expect
    .poll(() => nav.locator(".uz-nav-group p").allTextContents())
    .toEqual(tenantSections);
  for (const label of tenantLabels)
    await expect(nav.getByRole("button", { exact: true, name: label })).toBeVisible();
}

async function collectMetrics(page: Page) {
  const topbarHeight = await page.locator(".uz-topbar").evaluate((node) => {
    return (node as HTMLElement).offsetHeight;
  });
  const sidebarExpandedWidth = await page
    .getByTestId("app-shell-nav")
    .evaluate((node) => {
      return (node as HTMLElement).offsetWidth;
    });
  const leftListWidth = await page.getByTestId("m7-eval-set-list").evaluate((node) => {
    return (node as HTMLElement).offsetWidth;
  });
  return {
    activePageId: await page
      .getByTestId("admin-shell")
      .getAttribute("data-active-page-id"),
    bodyScrollWidth: await page.evaluate(() => document.body.scrollWidth),
    leftListWidth,
    shellLevel: await page.getByTestId("admin-shell").getAttribute("data-shell-level"),
    sidebarExpandedWidth,
    topbarHeight
  };
}
