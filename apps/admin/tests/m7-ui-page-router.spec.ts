import { expect, test, type Page } from "@playwright/test";

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

async function expectLayerNav(
  page: Page,
  visibleLabels: readonly string[],
  hiddenLabels: readonly string[]
) {
  const nav = page.getByTestId("app-shell-nav");

  for (const label of visibleLabels) {
    await expect(nav.getByRole("button", { name: label, exact: true })).toBeVisible();
  }

  for (const label of hiddenLabels) {
    await expect(nav.getByRole("button", { name: label, exact: true })).toHaveCount(0);
  }
}

test("starts at group overview with group-only navigation", async ({ page }) => {
  await page.goto("/design");

  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "group"
  );
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "group.overview"
  );
  await expect(page.getByTestId("active-layer-badge")).toContainText("集团层");
  await expect(page.getByTestId("page-outlet")).toHaveAttribute(
    "data-page-id",
    "group.overview"
  );
  await expect(page.getByTestId("legacy-evidence-route")).toHaveCount(0);
  await expectLayerNav(page, groupLabels, tenantLabels);
});

test("tenant selection enters tenant conversations with tenant-only navigation", async ({
  page
}) => {
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
  await expect(page.getByTestId("active-layer-badge")).toContainText("租户层");
  await expect(page.getByTestId("route-breadcrumb")).toContainText("Tenant B");
  await expectLayerNav(page, tenantLabels, groupLabels);
});

test("group release and tenant queue never expose the opposite nav tree", async ({
  page
}) => {
  await page.route("**/confirmation-queue/items?status=pending", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
  await page.goto("/design");

  await page.getByRole("button", { name: "发布与验收" }).click();
  await expect(page.getByTestId("page-outlet")).toHaveAttribute(
    "data-page-id",
    "group.release"
  );
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "group"
  );
  await expectLayerNav(page, groupLabels, tenantLabels);

  await page.getByTestId("tenant-switcher").selectOption("tenant-b");
  await page.getByRole("button", { name: "确认队列" }).click();
  await expect(page.getByTestId("page-outlet")).toHaveAttribute(
    "data-page-id",
    "tenant.queue"
  );
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "tenant"
  );
  await expect(page.getByTestId("m7-confirmation-queue-page")).toBeVisible();
  await expectLayerNav(page, tenantLabels, groupLabels);

  await page.getByRole("button", { name: "Back to group overview" }).click();
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "group"
  );
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "group.overview"
  );
  await expectLayerNav(page, groupLabels, tenantLabels);
});
