import { mkdirSync, writeFileSync } from "node:fs";
import { expect, test, type Locator, type Page } from "@playwright/test";

const artifactDir = "/tmp/uzmax-m7-ui-50-template-center-visible-ui";
const groupLabels =
  "集团总览|模型/成本/风险|模板中心|连接中心|发布与验收|租户管理|集团日志".split("|");
const tenantLabels =
  "对话|工单|确认队列|客户资产|订单|知识与资源|评测中心|AI 成员|团队|配置|分析|日志".split(
    "|"
  );
const groupSections = ["总览", "平台", "治理"];
const tenantSections = ["运营", "数据", "智能", "管理", "洞察"];
const tabIds = ["knowledge", "agent", "config", "eval", "quick_reply"] as const;
const runtimeLabels =
  "degraded|mock|read-only|browser-local only|no production template copy|no audit write|no config write".split(
    "|"
  );
const forbiddenVisibleTerms = [
  ...runtimeLabels,
  "synthetic",
  "Synthetic",
  "mock/local history",
  "synthetic read-only"
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

test("renders group template center with boundaries and desktop evidence", async ({
  page
}) => {
  await openTemplate(page);
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "group"
  );
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "group.templates"
  );
  await expect(page.getByTestId("page-outlet")).not.toHaveAttribute("data-tenant-id");
  await expect(page.getByRole("heading", { name: "模板中心" })).toBeVisible();
  await expect(page.getByText("复制到租户将生成独立版本")).toBeVisible();
  await expectLayerNav(page, groupSections, tenantSections, groupLabels, tenantLabels);
  await expect(page.getByText("集团级模板运营")).toBeVisible();
  await expect(page.getByTestId("m7-template-runtime-note")).toHaveAttribute(
    "hidden",
    ""
  );
  await expectRuntimeBoundary(page.getByTestId("m7-template-runtime-note"));
  await expectRuntimeBoundary(page.getByTestId("m7-template-page"));
  await expectVisibleBodyClean(page);
  for (const id of tabIds)
    await expect(page.getByTestId(`m7-template-tab-${id}`)).toBeVisible();
  await expect(page.getByTestId("m7-template-tab-knowledge")).toHaveAttribute(
    "aria-selected",
    "true"
  );
  await expect(page.locator(".uz-template-card")).toHaveCount(3);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-template-center-desktop.png`
  });
});

test("copy modal requires selected target and confirms local-only toast", async ({
  page
}) => {
  await openTemplate(page);
  const trigger = page.getByTestId("m7-template-copy-SYN-TMPL-tk1");
  await trigger.click();
  const modal = page.getByTestId("m7-template-copy-modal");
  const close = page.getByRole("button", { name: "关闭复制弹窗" });
  await expect(close).toBeFocused();
  await expect(modal).toHaveAttribute("role", "dialog");
  await expect(modal).toContainText("复制「美妆售后知识包 v4.2」");
  await page.keyboard.press("Escape");
  await expect(modal).toHaveCount(0);
  await expect(trigger).toBeFocused();

  await trigger.click();
  await expect(close).toBeFocused();
  await expect(
    page.locator("[data-testid^='m7-template-tenant-SYN-COPY-']")
  ).toHaveCount(4);
  const confirm = page.getByTestId("m7-template-confirm-copy");
  const target = page.getByTestId("m7-template-tenant-SYN-COPY-t1");
  await expect(confirm).toBeDisabled();
  await expect(target).toHaveAttribute("role", "checkbox");
  await expect(target).toHaveAttribute("aria-checked", "false");
  await target.click();
  await expect(target).toHaveAttribute("aria-checked", "true");
  await expect(confirm).toBeEnabled();
  await close.focus();
  await page.keyboard.press("Shift+Tab");
  await expect(confirm).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();
  const metrics = await collectMetrics(page);
  writeFileSync(
    `${artifactDir}/react-template-center-metrics.json`,
    JSON.stringify(metrics, null, 2)
  );
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-template-center-modal.png`
  });
  await confirm.click();
  const toast = page.getByTestId("m7-template-toast");
  await expect(toast).toHaveAttribute("role", "status");
  await expect(toast).toHaveAttribute("aria-live", "polite");
  await expect(toast).toContainText(
    "已复制「美妆售后知识包 v4.2」到 1 个租户 · 知识包"
  );
  await expect(toast).toContainText("租户将生成独立版本");
  await expectRuntimeBoundary(toast);
  await expectVisibleBodyClean(page);
  await expect(modal).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "group.templates"
  );
});

test("tenant queue wrapper keeps prior tenant-id-free contract", async ({ page }) => {
  await page.goto("/design");
  await page.getByTestId("tenant-switcher").selectOption("tenant-b");
  await page.getByRole("button", { name: "确认队列" }).click();
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.queue"
  );
  await expect(page.getByTestId("page-outlet")).toHaveAttribute(
    "data-page-id",
    "tenant.queue"
  );
  await expect(page.getByTestId("page-outlet")).not.toHaveAttribute("data-tenant-id");
  await expect(page.getByTestId("m7-confirmation-queue-page")).toBeVisible();
});

test("tabs and forced URL states stay deterministic", async ({ page }) => {
  await openTemplate(page);
  const expectedCounts = {
    agent: 2,
    config: 2,
    eval: 2,
    knowledge: 3,
    quick_reply: 2
  } as const;
  for (const id of tabIds) {
    await page.getByTestId(`m7-template-tab-${id}`).click();
    await expect(page.getByTestId(`m7-template-tab-${id}`)).toHaveAttribute(
      "aria-selected",
      "true"
    );
    await expect(page.locator(".uz-template-card")).toHaveCount(expectedCounts[id]);
  }
  for (const state of ["loading", "empty", "error", "permission", "degraded"]) {
    await openTemplate(page, `?state=${state}`);
    const target =
      state === "degraded"
        ? page.getByTestId("m7-template-runtime-note")
        : page.getByTestId(`m7-template-state-${state}`);
    await expectRuntimeBoundary(target);
    await expectVisibleBodyClean(page);
  }
});

test("sidebar collapse and mobile 320 fallback remain bounded", async ({ page }) => {
  await openTemplate(page);
  await page.getByRole("button", { name: "Collapse navigation" }).click();
  await expect(page.getByTestId("app-shell-nav")).toHaveJSProperty("offsetWidth", 68);
  await expect(page.getByTestId("admin-shell")).toHaveClass(/is-nav-collapsed/);

  await page.setViewportSize({ width: 320, height: 900 });
  await openTemplate(page);
  await expect(page.getByTestId("m7-template-page")).toBeVisible();
  await expect(page.locator(".uz-template-card").first()).toBeVisible();
  expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(320);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-template-center-mobile-320.png`
  });
});

async function openTemplate(page: Page, query = "") {
  await page.goto(`/design${query}`);
  await page
    .getByTestId("app-shell-nav")
    .getByRole("button", { exact: true, name: "模板中心" })
    .click();
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "group.templates"
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

async function expectLayerNav(
  page: Page,
  visibleSections: readonly string[],
  hiddenSections: readonly string[],
  visibleLabels: readonly string[],
  hiddenLabels: readonly string[]
) {
  const nav = page.getByTestId("app-shell-nav");
  await expect
    .poll(() => nav.locator(".uz-nav-group p").allTextContents())
    .toEqual(visibleSections);
  for (const label of visibleLabels)
    await expect(nav.getByRole("button", { exact: true, name: label })).toBeVisible();
  for (const label of hiddenLabels)
    await expect(nav.getByRole("button", { exact: true, name: label })).toHaveCount(0);
  for (const label of hiddenSections)
    await expect(nav.locator(".uz-nav-group p").filter({ hasText: label })).toHaveCount(
      0
    );
}

async function collectMetrics(page: Page) {
  return {
    activePageId: await page
      .getByTestId("admin-shell")
      .getAttribute("data-active-page-id"),
    activeTab: await page
      .locator(".uz-template-tab[aria-selected='true']")
      .textContent(),
    bodyScrollWidth: await page.evaluate(() => document.body.scrollWidth),
    cardCount: await page.locator(".uz-template-card").count(),
    modalWidth: await page
      .getByTestId("m7-template-copy-modal")
      .evaluate((node) => Math.round((node as HTMLElement).offsetWidth)),
    shellLevel: await page.getByTestId("admin-shell").getAttribute("data-shell-level"),
    sidebarExpandedWidth: await page
      .getByTestId("app-shell-nav")
      .evaluate((node) => (node as HTMLElement).offsetWidth),
    topbarHeight: await page
      .locator(".uz-topbar")
      .evaluate((node) => (node as HTMLElement).offsetHeight)
  };
}
