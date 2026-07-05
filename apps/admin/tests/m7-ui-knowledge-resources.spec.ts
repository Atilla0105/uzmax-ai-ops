import { mkdirSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

const artifactDir = "/tmp/uzmax-m7-ui-32-knowledge-resources-visible-ui-v2";
const groupLabels =
  "集团总览|模型/成本/风险|模板中心|连接中心|发布与验收|租户管理|集团日志".split("|");
const tenantLabels =
  "对话|工单|确认队列|客户资产|订单|知识与资源|评测中心|AI 成员|团队|配置|分析|日志".split(
    "|"
  );
const tenantSections = ["运营", "数据", "智能", "管理", "洞察"];

mkdirSync(artifactDir, { recursive: true });

test.beforeEach(async ({ page }) => {
  await page.route("**/conversation-ticket/conversations", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
});

test("renders tenant.knowledge with tenant-only nav runtime labels and tabs", async ({
  page
}) => {
  await openKnowledge(page);
  await expect(page.getByTestId("page-outlet")).toHaveAttribute(
    "data-page-id",
    "tenant.knowledge"
  );
  await expect(page.getByTestId("m7-knowledge-page")).toHaveAttribute(
    "data-runtime-state",
    "degraded"
  );
  await expect(page.getByTestId("m7-knowledge-page")).toHaveAttribute(
    "data-runtime-boundary",
    /knowledge runtime unavailable/
  );
  for (const label of [
    "degraded",
    "mock",
    "read-only",
    "not production knowledge data",
    "no formal knowledge write",
    "no automatic publish"
  ])
    await expect(page.getByTestId("m7-knowledge-runtime-note")).toHaveAttribute(
      "data-runtime-boundary",
      new RegExp(label)
    );
  await expectVisibleBodyClean(page);
  for (const id of ["journey", "facts", "public", "private", "assets", "templates"])
    await expect(page.getByTestId(`m7-knowledge-tab-${id}`)).toBeVisible();
  await expect(page.getByTestId("m7-knowledge-tab-journey")).toHaveAttribute(
    "aria-pressed",
    "true"
  );
  const topbarHeight = await page.locator(".uz-topbar").evaluate((node) => {
    return (node as HTMLElement).offsetHeight;
  });
  expect(topbarHeight).toBeGreaterThanOrEqual(52);
  expect(topbarHeight).toBeLessThanOrEqual(53);
  await expectTenantOnlyNav(page);
});

test("covers journey default and desktop screenshot", async ({ page }) => {
  await openKnowledge(page);
  await expect(page.getByTestId("m7-knowledge-journey-stages")).toContainText("触达");
  await page.getByRole("button", { name: /3\. 下单/ }).click();
  await expect(page.getByTestId("m7-knowledge-stage-detail")).toContainText(
    "物流时效图"
  );
  await expect(page.getByTestId("m7-knowledge-journey-warning")).toHaveAttribute(
    "data-runtime-boundary",
    /no formal knowledge write/
  );
  await expectVisibleBodyClean(page);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-knowledge-journey-desktop.png`
  });
});

test("opens facts by keyboard and toggles redline", async ({ page }) => {
  await openKnowledge(page);
  await page.getByTestId("m7-knowledge-tab-facts").click();
  await expect(page.getByTestId("m7-knowledge-toolbar")).toBeVisible();
  await page.getByTestId("m7-knowledge-search").fill("售后");
  await expect(page.getByTestId("m7-knowledge-facts-table")).toContainText(
    "退款流程说明"
  );
  await page.getByTestId("m7-knowledge-search").fill("");
  await page.getByTestId("m7-knowledge-fact-row-SYN-KB-FACT-001").focus();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("m7-knowledge-fact-detail")).toContainText(
    "套装报价口径"
  );
  await expect(
    page.getByTestId("m7-knowledge-fact-detail").locator("[data-source-ref]")
  ).toHaveAttribute("data-source-ref", "controlled://mock/knowledge/facts/001");
  await expect(page.getByTestId("m7-knowledge-redline-toggle")).toHaveAttribute(
    "aria-pressed",
    "false"
  );
  await page.getByTestId("m7-knowledge-redline-toggle").click();
  await expect(page.getByTestId("m7-knowledge-redline-toggle")).toHaveAttribute(
    "aria-pressed",
    "true"
  );
});

test("renders public and private snippets", async ({ page }) => {
  await openKnowledge(page);
  await page.getByTestId("m7-knowledge-tab-public").click();
  await expect(page.getByTestId("m7-knowledge-public-snippets")).toContainText(
    "物流延迟标准安抚"
  );
  await page.getByTestId("m7-knowledge-tab-private").click();
  await expect(page.getByTestId("m7-knowledge-private-snippets")).toContainText(
    "我的快捷 · 催付款"
  );
});

test("supports assets detail edit save cancel delete and screenshot", async ({
  page
}) => {
  await openKnowledge(page);
  await page.getByTestId("m7-knowledge-tab-assets").click();
  await page.getByTestId("m7-knowledge-asset-row-SYN-KB-ASSET-001").click();
  await expect(page.getByTestId("m7-knowledge-asset-detail")).not.toContainText(
    "controlled://mock/assets/onboarding-a"
  );
  await expect(
    page.getByTestId("m7-knowledge-asset-detail").locator("[data-source-ref]")
  ).toHaveAttribute("data-source-ref", "controlled://mock/assets/onboarding-a");
  await page.getByTestId("m7-knowledge-asset-edit").click();
  await page.getByLabel("编辑素材内容").fill("已保存的素材内容");
  await page.getByTestId("m7-knowledge-asset-save").click();
  await expect(page.getByTestId("m7-knowledge-asset-detail")).toContainText(
    "已保存的素材内容"
  );
  await page.getByTestId("m7-knowledge-asset-edit").click();
  await page.getByLabel("编辑素材内容").fill("取消保存的素材内容");
  await page.getByTestId("m7-knowledge-asset-cancel").click();
  await expect(page.getByTestId("m7-knowledge-asset-detail")).not.toContainText(
    "取消保存的素材内容"
  );
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-knowledge-assets-detail-desktop.png`
  });
  await page.getByTestId("m7-knowledge-asset-delete").click();
  await expect(page.getByTestId("m7-knowledge-assets-table")).toBeVisible();
  await expect(page.getByTestId("m7-knowledge-asset-row-SYN-KB-ASSET-001")).toHaveCount(
    0
  );
});

test("covers template source table and URL states", async ({ page }) => {
  await openKnowledge(page);
  await page.getByTestId("m7-knowledge-tab-templates").click();
  await expect(page.getByTestId("m7-knowledge-template-source")).toContainText(
    "美妆售后知识包"
  );
  await expect(page.getByTestId("m7-knowledge-template-source")).not.toContainText(
    "controlled://mock"
  );
  await expect(
    page
      .getByTestId("m7-knowledge-template-source")
      .locator("[data-source-ref]")
      .first()
  ).toHaveAttribute("data-source-ref", "controlled://mock/templates/faq");
  for (const state of ["loading", "empty", "error", "permission", "gate"]) {
    await openKnowledge(page, `?m7KnowledgeState=${state}`);
    await expect(page.getByTestId(`m7-knowledge-state-${state}`)).toBeVisible();
  }
});

test("resets local asset state when switching tenants", async ({ page }) => {
  await openKnowledge(page);
  await page.getByTestId("m7-knowledge-tab-assets").click();
  await page.getByTestId("m7-knowledge-asset-row-SYN-KB-ASSET-001").click();
  await page.getByTestId("m7-knowledge-asset-edit").click();
  await page.getByLabel("编辑素材内容").fill("tenant-b local edit");
  await page.getByTestId("m7-knowledge-asset-save").click();

  await page.getByTestId("tenant-switcher").selectOption("tenant-c");
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.knowledge"
  );
  await expect(page.getByTestId("m7-knowledge-page")).toHaveAttribute(
    "data-tenant-id",
    "tenant-c"
  );
  await expect(page.getByTestId("m7-knowledge-tab-journey")).toHaveAttribute(
    "aria-pressed",
    "true"
  );
  await page.getByTestId("m7-knowledge-tab-assets").click();
  await page.getByTestId("m7-knowledge-asset-row-SYN-KB-ASSET-001").click();
  await expect(page.getByTestId("m7-knowledge-asset-detail")).not.toContainText(
    "tenant-b local edit"
  );
});

test("supports collapse and mobile 320 without body overflow", async ({ page }) => {
  await openKnowledge(page);
  await page.getByRole("button", { name: "Collapse navigation" }).click();
  await expect(page.getByTestId("app-shell-nav")).toHaveJSProperty("offsetWidth", 68);
  await expectTenantOnlyNav(page);

  await page.setViewportSize({ width: 320, height: 900 });
  await openKnowledge(page);
  await page.getByTestId("m7-knowledge-tab-assets").click();
  await expect(page.getByTestId("m7-knowledge-assets-table")).toBeVisible();
  expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(320);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-knowledge-mobile-320.png`
  });
});

async function openKnowledge(page: Page, query = "") {
  await page.goto(`/design${query}`);
  await page.getByTestId("tenant-switcher").selectOption("tenant-b");
  await page
    .getByTestId("app-shell-nav")
    .getByRole("button", { exact: true, name: "知识与资源" })
    .click();
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.knowledge"
  );
}

async function expectVisibleBodyClean(page: Page) {
  const visibleBody = await page.evaluate(() => document.body.innerText);
  for (const forbidden of [
    "mock",
    "degraded",
    "read-only",
    "runtime unavailable",
    "not production",
    "synthetic",
    "local-only",
    "browser-local only",
    "no production",
    "MOCK-",
    "disabled",
    "fixture",
    "controlled://mock"
  ])
    expect(visibleBody.toLowerCase()).not.toContain(forbidden.toLowerCase());
}

async function expectTenantOnlyNav(page: Page) {
  const nav = page.getByTestId("app-shell-nav");
  await expect
    .poll(() => nav.locator(".uz-nav-group p").allTextContents())
    .toEqual(tenantSections);
  for (const label of tenantLabels)
    await expect(nav.getByRole("button", { exact: true, name: label })).toBeVisible();
  for (const label of groupLabels)
    await expect(nav.getByRole("button", { exact: true, name: label })).toHaveCount(0);
}
