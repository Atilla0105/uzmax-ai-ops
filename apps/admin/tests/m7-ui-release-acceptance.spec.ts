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

test("renders group.release as the M7 release acceptance console", async ({ page }) => {
  await openRelease(page);

  await expect(page.getByTestId("page-outlet")).toHaveAttribute(
    "data-page-id",
    "group.release"
  );
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "group"
  );
  await expectLayerNav(page, groupLabels, tenantLabels);
  await expect(page.getByTestId("m7-release-acceptance-page")).toBeVisible();
  await expect(page.getByTestId("page-scaffold")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "发布与验收" })).toBeVisible();
  await expect(page.getByText("已验收里程碑")).toBeVisible();
  await expect(page.getByTestId("m7-release-summary")).toContainText("GA-0 与");
  await expect(page.getByTestId("m7-release-degraded")).toContainText("runtime API");
  await expect(page.getByTestId("m7-release-gate-M0")).toContainText("M0 · 骨架与登录");
  await expect(page.getByTestId("m7-release-gate-GA-0")).toContainText(
    "L-01 checklist not green"
  );
  await expect(page.getByTestId("m7-release-gate-1.0")).toContainText(
    "Full P0/P1/P2 rollup not closed"
  );
  await expect(page.getByTestId("m7-release-ga0")).toContainText("GA-0 Checklist");
  await expect(page.getByTestId("m7-release-ga0")).toContainText("本页不写审计");
  await expect(page.getByTestId("m7-release-severity")).toContainText("P0 阻断");
  await expect(page.getByTestId("m7-release-high-risk-actions")).toContainText(
    "Only the project owner"
  );
  await expect(page.getByRole("button", { name: "确认开闸 GA-0" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "确认 1.0 正式发布" })).toBeDisabled();
});

test("covers loading empty error permission and owner decision states", async ({
  page
}) => {
  await openRelease(page, "loading");
  await expect(page.getByTestId("m7-release-loading")).toContainText(
    "不回退到 fixture"
  );

  await openRelease(page, "empty");
  await expect(page.getByTestId("m7-release-empty")).toContainText(
    "acceptance_evidence"
  );

  await openRelease(page, "error");
  await expect(page.getByTestId("m7-release-error")).toContainText(
    "no green state is inferred"
  );

  await openRelease(page, "permission");
  await expect(page.getByTestId("m7-release-permission")).toContainText("release:read");

  await openRelease(page, "owner-decision-required");
  await expect(page.getByTestId("m7-release-ga0")).toContainText(
    "controlled owner-decision-required state"
  );
  await expect(page.getByRole("button", { name: "确认开闸 GA-0" })).toBeDisabled();
});

test("keeps the 320px mobile release fallback read-only", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await openRelease(page);

  await expect(page.getByTestId("m7-release-mobile-fallback")).toBeVisible();
  await expect(page.getByTestId("m7-release-mobile-fallback")).toContainText(
    "不开闸、不发布、不写审计"
  );
  await expect(page.getByRole("button", { name: "确认开闸 GA-0" })).toBeDisabled();
  await expect(
    await page.evaluate(() => document.body.scrollWidth)
  ).toBeLessThanOrEqual(320);
});

async function openRelease(page: Page, state?: string) {
  const suffix = state ? `?m7ReleaseState=${state}` : "";
  await page.goto(`/design${suffix}`);
  await page.getByRole("button", { name: "发布与验收" }).click();
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
