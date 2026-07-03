import { expect, type Page } from "@playwright/test";

const groupLayerNavLabels = [
  "集团总览",
  "模型/成本/风险",
  "模板中心",
  "连接中心",
  "发布与验收",
  "租户管理",
  "集团日志"
] as const;

const tenantLayerNavLabels = [
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
] as const;

export async function expectGroupOnlyNav(page: Page) {
  await expectLayerNav(page, groupLayerNavLabels, tenantLayerNavLabels);
}

export async function expectTenantOnlyNav(page: Page) {
  await expectLayerNav(page, tenantLayerNavLabels, groupLayerNavLabels);
}

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
