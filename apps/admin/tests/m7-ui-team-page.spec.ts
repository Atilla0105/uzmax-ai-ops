import { mkdirSync, writeFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

const artifactDir = "/tmp/uzmax-m7-ui-53-team-page-visible-ui";
const groupLabels = [
  "集团总览",
  "模型/成本/风险",
  "模板中心",
  "连接中心",
  "发布与验收",
  "租户管理",
  "集团日志"
];
const tenantLabels = [
  "对话",
  "工单",
  "确认队列",
  "客户资产",
  "订单",
  "知识与资源",
  "评测中心",
  "AI 成员",
  "团队",
  "配置",
  "分析",
  "日志"
];
const groupSections = ["总览", "平台", "治理"];
const tenantSections = ["运营", "数据", "智能", "管理", "洞察"];

mkdirSync(artifactDir, { recursive: true });

test.beforeEach(async ({ page }) => {
  await page.route("**/conversation-ticket/conversations", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
  await page.route("**/confirmation-queue/items?status=pending", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
});

test("renders tenant team page in tenant shell with boundary note", async ({
  page
}) => {
  await openTeam(page);
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "tenant"
  );
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.team"
  );
  await expect(page.getByTestId("page-outlet")).toHaveAttribute("data-tenant-id");
  await expect(page.getByRole("heading", { name: "团队" })).toBeVisible();
  await expect(page.getByTestId("m7-team-runtime-note")).toContainText("degraded");
  for (const label of [
    "degraded",
    "mock",
    "read-only",
    "browser-local only",
    "no production authz write",
    "no audit write"
  ]) {
    await expect(page.getByTestId("m7-team-runtime-note")).toContainText(label);
  }
  await expectLayerNav(page, tenantSections, groupSections, tenantLabels, groupLabels);
  await expect(page.locator(".uz-team-row")).toHaveCount(4);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-team-desktop.png`
  });
  const metrics = await collectMetrics(page);
  writeFileSync(
    `${artifactDir}/react-team-metrics.json`,
    JSON.stringify(metrics, null, 2)
  );
});

test("search empty state stays deterministic", async ({ page }) => {
  await openTeam(page);
  await page.getByTestId("m7-team-search").fill("no matching local row");
  await expect(page.getByTestId("m7-team-empty")).toContainText("无匹配成员");
  await expect(page.locator(".uz-team-row")).toHaveCount(0);
});

test("roles tab role editor save and delete local-only", async ({ page }) => {
  await openTeam(page);
  await page.getByTestId("m7-team-tab-roles").click();
  await expect(page.getByRole("button", { name: "新建角色" })).toBeVisible();
  await page.getByRole("button", { name: "新建角色" }).click();
  await expect(page.getByTestId("m7-team-role-editor")).toBeVisible();
  await page.getByTestId("m7-team-role-name").fill("本地角色-测试");
  await page.getByTestId("m7-team-role-desc").fill("本地专用角色");
  await page.getByTestId("m7-team-role-save").click();
  await expect(page.locator("tr", { hasText: "本地角色-测试" })).toHaveCount(1);
  await expect(page.getByTestId("m7-team-toast")).toContainText(
    "created role 本地角色-测试"
  );

  const row = page.locator("tr", { hasText: "本地角色-测试" });
  await row.getByRole("button", { name: "删除" }).click();
  const modal = page.getByTestId("m7-confirm-modal");
  await expect(modal).toContainText("删除角色");
  await modal.getByRole("button", { name: "删除" }).click();
  await expect(row).toHaveCount(0);
  await expect(page.getByTestId("m7-team-toast")).toContainText(
    "deleted role 本地角色-测试"
  );
});

test("invite modal requires name+email and adds local member", async ({ page }) => {
  await openTeam(page);
  await page.getByTestId("m7-team-primary").click();
  await expect(page.getByTestId("m7-team-invite-modal")).toBeVisible();
  await expect(page.getByTestId("m7-team-invite-send")).toBeDisabled();
  await page.getByTestId("m7-team-invite-name").fill("白玉");
  await page.getByTestId("m7-team-invite-email").fill("baiyu@local.io");
  await page.getByTestId("m7-team-invite-send").click();
  await expect(page.getByTestId("m7-team-page")).toContainText("白玉");
  await expect(page.getByTestId("m7-team-toast")).toContainText(
    "invite added locally: 白玉"
  );
});

test("member drawer notification, telegram toggle, disable/restore local controls", async ({
  page
}) => {
  await openTeam(page);
  await page.locator(".uz-team-row").first().click();
  const drawer = page.getByTestId("m7-team-member-drawer");
  await expect(drawer).toBeVisible();
  await expect(drawer).toHaveAttribute("role", "dialog");
  await drawer.getByRole("button", { name: "仅@提及" }).click();
  await expect(page.getByTestId("m7-team-toast")).toContainText(
    "notification preference updated"
  );

  const tgButton = drawer.getByRole("button", { name: "Telegram 绑定" });
  await tgButton.click();
  await expect(page.getByTestId("m7-team-toast")).toContainText("telegram");

  const disableButton = drawer.getByTestId("m7-team-member-toggle-disable");
  await disableButton.click();
  await expect(disableButton).toHaveText("恢复账号");
  await disableButton.click();
  await expect(disableButton).toHaveText("停用账号");
});

test("forced URL states are deterministic", async ({ page }) => {
  for (const state of ["loading", "empty", "error", "permission", "degraded"]) {
    await openTeam(page, `?m7TeamState=${state}`);
    const target =
      state === "degraded"
        ? page.getByTestId("m7-team-runtime-note")
        : page.getByTestId(`m7-team-state-${state}`);
    await expect(target).toContainText("browser-local only");
    await expect(target).toContainText("no production authz write");
  }
});

test("collapsed sidebar + mobile 320 screenshot stays bounded", async ({ page }) => {
  await openTeam(page);
  await page.getByRole("button", { name: "Collapse navigation" }).click();
  await expect(page.getByTestId("app-shell-nav")).toHaveJSProperty("offsetWidth", 68);
  await expect(page.getByTestId("admin-shell")).toHaveClass(/is-nav-collapsed/);
  await page.setViewportSize({ width: 320, height: 900 });
  await openTeam(page);
  await expect(page.locator(".uz-team-card-list")).toBeVisible();
  expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(320);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-team-mobile-320.png`
  });
});

async function openTeam(page: Page, query = "") {
  await page.goto(`/design${query}`);
  await page.getByTestId("tenant-switcher").selectOption("tenant-b");
  await page
    .getByTestId("app-shell-nav")
    .getByRole("button", { exact: true, name: "团队" })
    .click();
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.team"
  );
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
  for (const label of visibleLabels) {
    await expect(nav.getByRole("button", { exact: true, name: label })).toBeVisible();
  }
  for (const label of hiddenLabels) {
    await expect(nav.getByRole("button", { exact: true, name: label })).toHaveCount(0);
  }
  for (const label of hiddenSections) {
    await expect(nav.locator(".uz-nav-group p").filter({ hasText: label })).toHaveCount(
      0
    );
  }
}

async function collectMetrics(page: Page) {
  return {
    activePageId: await page
      .getByTestId("admin-shell")
      .getAttribute("data-active-page-id"),
    shellLevel: await page.getByTestId("admin-shell").getAttribute("data-shell-level"),
    bodyScrollWidth: await page.evaluate(() => document.body.scrollWidth),
    memberCount: await page.locator(".uz-team-row").count(),
    cardCount: await page.locator(".uz-team-card").count(),
    navWidth: await page
      .getByTestId("app-shell-nav")
      .evaluate((node) => node.clientWidth)
  };
}
