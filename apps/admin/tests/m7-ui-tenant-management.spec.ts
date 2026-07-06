import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

const outDir = "/tmp/uzmax-m7-ui-52-tenant-management-visible-ui";
const sourcePaths = {
  fixture: "/Users/atilla/源码/unpacked 6/fixtures/groupPlatform.ts",
  owner: "/Users/atilla/Downloads/运营塔台1.0.html",
  page: "/Users/atilla/源码/unpacked 6/pages/group/GroupTenantPage.tsx"
} as const;
const groupNav = [
  "集团总览",
  "模型/成本/风险",
  "模板中心",
  "连接中心",
  "发布与验收",
  "租户管理",
  "集团日志"
];
const tenantNav = [
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
const tenantIds = ["SYN-TENANT-t1", "SYN-TENANT-t2", "SYN-TENANT-t3", "SYN-TENANT-t4"];

mkdirSync(outDir, { recursive: true });

test.beforeEach(async ({ page }) => {
  await page.route("**/conversation-ticket/conversations", (route) =>
    route.fulfill({ json: { items: [] } })
  );
  await page.route("**/confirmation-queue/items?status=pending", (route) =>
    route.fulfill({ json: { items: [] } })
  );
});

test("samples owner and unpacked tenant-management source when present", async () => {
  const availability = Object.entries(sourcePaths).map(([kind, path]) => ({
    kind,
    ok: existsSync(path),
    path
  }));
  writeJson("source-availability.json", { availability });
  if (availability.some((item) => !item.ok)) {
    writeFileSync(
      `${outDir}/source-unavailable.md`,
      availability
        .filter((item) => !item.ok)
        .map((item) => `${item.kind}: ${item.path}`)
        .join("\n")
    );
    return;
  }

  const sourceText = {
    fixture: readFileSync(sourcePaths.fixture, "utf8"),
    owner: readFileSync(sourcePaths.owner, "utf8"),
    page: readFileSync(sourcePaths.page, "utf8")
  };
  for (const marker of ["租户管理", "默认语言", "渠道能力", "停用租户"])
    expect(sourceText.page).toContain(marker);
  for (const marker of ["GROUP_TENANTS", "TENANT_STATUS_COLORS", "白桦母婴"])
    expect(sourceText.fixture).toContain(marker);
  for (const marker of ["租户管理", "玉珠跨境美妆", "Telegram Business"])
    expect(sourceText.owner).toContain(marker);
  writeJson("source-sampling.json", {
    markers: ["租户管理", "GROUP_TENANTS", "TENANT_STATUS_COLORS"],
    sourcePaths
  });
});

test("renders group tenant management inside group shell only", async ({ page }) => {
  await visitTenantManagement(page);
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "group"
  );
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "group.tenants"
  );
  await expect(page.getByTestId("page-outlet")).not.toHaveAttribute("data-tenant-id");
  await expect(page.getByRole("heading", { name: "租户管理" })).toBeVisible();
  await expect(page.getByTestId("m7-tenant-runtime-note")).toContainText("read-only");
  await expect(page.getByTestId("m7-tenant-runtime-note")).toContainText(
    "browser-local only"
  );
  await expect(page.getByTestId("m7-tenant-runtime-note")).toContainText(
    "no production tenant change"
  );
  await expect(page.getByTestId("m7-tenant-runtime-note")).toContainText(
    "no tenant config persistence"
  );
  await expect(page.getByTestId("m7-tenant-runtime-note")).toContainText(
    "no connector or feature flag change"
  );
  await expect(page.getByTestId("m7-tenant-runtime-note")).toContainText(
    "no audit write"
  );
  await assertLayerNavigation(page);

  for (const id of tenantIds)
    await expect(page.getByTestId(`m7-tenant-card-${id}`)).toBeVisible();
  await expect(page.locator(".uz-tenant-card")).toHaveCount(4);
  await expect(page.getByTestId("m7-tenant-card-SYN-TENANT-t1")).toContainText(
    "美妆 · 中亚"
  );
  await expect(page.getByTestId("m7-tenant-card-SYN-TENANT-t1")).toContainText(
    "美妆标准包"
  );
  await expect(page.getByTestId("m7-tenant-card-SYN-TENANT-t1")).toContainText(
    "mock 成员 8"
  );
  await expect(page.getByTestId("m7-tenant-card-SYN-TENANT-t1")).toContainText(
    "mock AI 3"
  );
  await expect(page.getByTestId("m7-tenant-card-SYN-TENANT-t1")).toContainText(
    "mock 连接 降级"
  );
  await expect(page.getByTestId("m7-tenant-card-SYN-TENANT-t4")).toContainText(
    "mock 已停用"
  );

  writeJson("react-tenant-management-desktop-metrics.json", await desktopMetrics(page));
  await page.screenshot({
    fullPage: true,
    path: `${outDir}/react-tenant-management-desktop.png`
  });
});

test("drawer controls, focus, and local-only updates behave safely", async ({
  page
}) => {
  await visitTenantManagement(page);
  const card = page.getByTestId("m7-tenant-card-SYN-TENANT-t1");
  await card.focus();
  await page.keyboard.press("Enter");
  const drawer = page.getByTestId("m7-tenant-drawer");
  const close = page.getByRole("button", { name: "关闭租户管理抽屉" });
  await expect(drawer).toHaveAttribute("role", "dialog");
  await expect(drawer).toHaveAttribute("aria-modal", "true");
  await expect(close).toBeFocused();
  await expect(page.locator('[aria-modal="true"]')).toHaveCount(1);
  await expect(page.getByTestId("m7-tenant-language")).toHaveValue(
    "乌兹别克语（拉丁）"
  );
  await expect(page.getByTestId("m7-tenant-timezone")).toHaveValue("UTC+5 塔什干");
  await expect(page.getByTestId("m7-tenant-cap-bot")).toHaveAttribute("role", "switch");
  await expect(page.getByTestId("m7-tenant-cap-business")).toHaveAttribute(
    "aria-checked",
    "true"
  );
  await expect(page.getByTestId("m7-tenant-cap-orderApi")).toHaveAttribute(
    "aria-checked",
    "false"
  );

  await page.keyboard.press("Shift+Tab");
  await expect(page.getByTestId("m7-tenant-disable")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();
  await page.screenshot({
    fullPage: true,
    path: `${outDir}/react-tenant-management-drawer.png`
  });
  await page.keyboard.press("Escape");
  await expect(drawer).toHaveCount(0);
  await expect(card).toBeFocused();

  await card.click();
  await page.getByTestId("m7-tenant-language").selectOption("中文");
  await expectToast(page, [
    "默认语言 -> 中文",
    "no tenant config persistence",
    "no audit write"
  ]);
  await page.getByTestId("m7-tenant-timezone").selectOption("UTC+8 北京");
  await expectToast(page, ["默认时区 -> UTC+8 北京", "no production tenant change"]);
  await page.getByTestId("m7-tenant-cap-orderApi").click();
  await expect(page.getByTestId("m7-tenant-cap-orderApi")).toHaveAttribute(
    "aria-checked",
    "true"
  );
  await expectToast(page, ["订单 API enabled", "no connector or feature flag change"]);
});

test("disable reason is required and restore remains browser-local", async ({
  page
}) => {
  await visitTenantManagement(page);
  await page.getByTestId("m7-tenant-card-SYN-TENANT-t1").click();
  await page.getByTestId("m7-tenant-disable").click();
  await expect(page.getByTestId("m7-tenant-drawer")).toHaveCount(0);
  await expect(page.locator('[aria-modal="true"]')).toHaveCount(1);
  const modal = page.getByTestId("m7-confirm-modal");
  await expect(modal).toContainText("停用租户");
  await expect(modal.getByRole("button", { name: "确认停用" })).toBeDisabled();
  await modal
    .getByPlaceholder("必填；仅用于 browser-local 预览，不写生产审计")
    .fill("local reason only");
  await expect(modal.getByRole("button", { name: "确认停用" })).toBeEnabled();
  await modal.getByRole("button", { name: "确认停用" }).click();
  await expect(page.locator('[aria-modal="true"]')).toHaveCount(1);
  await expect(page.getByTestId("m7-tenant-disabled-note")).toContainText(
    "local reason only"
  );
  await expectToast(page, [
    "disabled in browser state",
    "no production tenant change",
    "no audit write"
  ]);

  await page.getByTestId("m7-tenant-restore").click();
  await expect(page.getByTestId("m7-tenant-disabled-note")).toHaveCount(0);
  await expectToast(page, [
    "restored in browser state",
    "no tenant config persistence",
    "no connector or feature flag change"
  ]);
});

test("forced states, collapsed rail, and 320px mobile drawer stay bounded", async ({
  page
}) => {
  for (const key of ["state", "m7TenantState"]) {
    for (const state of ["loading", "empty", "error", "permission", "degraded"]) {
      await visitTenantManagement(page, `?${key}=${state}`);
      const target =
        state === "degraded"
          ? page.getByTestId("m7-tenant-runtime-note")
          : page.getByTestId(`m7-tenant-state-${state}`);
      await expect(target).toContainText("browser-local only");
      await expect(target).toContainText("no production tenant change");
      await expect(target).toContainText("no audit write");
    }
  }

  await visitTenantManagement(page);
  await page.getByRole("button", { name: "Collapse navigation" }).click();
  await expect(page.getByTestId("app-shell-nav")).toHaveJSProperty("offsetWidth", 68);
  writeJson("react-tenant-management-collapsed-metrics.json", {
    navWidth: await width(page, "app-shell-nav"),
    pageWidth: await width(page, "m7-tenant-page")
  });

  await page.setViewportSize({ width: 320, height: 900 });
  await visitTenantManagement(page);
  await page.getByTestId("m7-tenant-card-SYN-TENANT-t1").click();
  const metrics = await mobileMetrics(page);
  expect(metrics.bodyScrollWidth).toBeLessThanOrEqual(320);
  expect(metrics.documentScrollWidth).toBeLessThanOrEqual(320);
  expect(metrics.drawerWidth).toBeLessThanOrEqual(320);
  expect(metrics.pageWidth).toBeLessThanOrEqual(320);
  writeJson("react-tenant-management-mobile-320-metrics.json", metrics);
  await page.screenshot({
    fullPage: true,
    path: `${outDir}/react-tenant-management-mobile-320.png`
  });
});

async function visitTenantManagement(page: Page, query = "") {
  await page.goto(`/design${query}`);
  await page
    .getByTestId("app-shell-nav")
    .getByRole("button", { exact: true, name: "租户管理" })
    .click();
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "group.tenants"
  );
}

async function assertLayerNavigation(page: Page) {
  const nav = page.getByTestId("app-shell-nav");
  await expect
    .poll(async () => nav.locator(".uz-nav-group p").allTextContents())
    .toEqual(["总览", "平台", "治理"]);
  for (const label of groupNav)
    await expect(nav.getByRole("button", { exact: true, name: label })).toBeVisible();
  for (const label of tenantNav)
    await expect(nav.getByRole("button", { exact: true, name: label })).toHaveCount(0);
  for (const section of ["运营", "数据", "智能", "管理", "洞察"])
    await expect(
      nav.locator(".uz-nav-group p").filter({ hasText: section })
    ).toHaveCount(0);
}

async function expectToast(page: Page, fragments: readonly string[]) {
  const toast = page.getByTestId("m7-tenant-toast");
  await expect(toast).toHaveAttribute("role", "status");
  await expect(toast).toHaveAttribute("aria-live", "polite");
  for (const fragment of fragments) await expect(toast).toContainText(fragment);
}

async function desktopMetrics(page: Page) {
  return {
    activePageId: await page
      .getByTestId("admin-shell")
      .getAttribute("data-active-page-id"),
    cardCount: await page.locator(".uz-tenant-card").count(),
    cardWidths: await page
      .locator(".uz-tenant-card")
      .evaluateAll((nodes) =>
        nodes.map((node) => Math.round((node as HTMLElement).offsetWidth))
      ),
    headerWidth: await width(page, "m7-tenant-page"),
    shellLevel: await page.getByTestId("admin-shell").getAttribute("data-shell-level"),
    sidebarExpandedWidth: await width(page, "app-shell-nav"),
    topbarHeight: await page
      .locator(".uz-topbar")
      .evaluate((node) => (node as HTMLElement).offsetHeight)
  };
}

async function mobileMetrics(page: Page) {
  return {
    bodyScrollWidth: await page.evaluate(() => document.body.scrollWidth),
    documentScrollWidth: await page.evaluate(
      () => document.documentElement.scrollWidth
    ),
    drawerWidth: await width(page, "m7-tenant-drawer"),
    pageWidth: await width(page, "m7-tenant-page")
  };
}

async function width(page: Page, testId: string) {
  return page
    .getByTestId(testId)
    .evaluate((node) => Math.round((node as HTMLElement).offsetWidth));
}

function writeJson(name: string, value: unknown) {
  writeFileSync(`${outDir}/${name}`, JSON.stringify(value, null, 2));
}
