import { mkdirSync, writeFileSync } from "node:fs";
import { expect, test, type Locator, type Page } from "@playwright/test";

const artifactDir =
  "/tmp/uzmax-m7-ui-92-tenant-management-default-visual-parity-refresh";
const groupLabels =
  "集团总览|模型/成本/风险|模板中心|连接中心|发布与验收|租户管理|集团日志".split("|");
const tenantLabels =
  "对话|工单|确认队列|客户资产|订单|知识与资源|评测中心|AI 成员|团队|配置|分析|日志".split(
    "|"
  );
const groupSections = ["总览", "平台", "治理"];
const tenantSections = ["运营", "数据", "智能", "管理", "洞察"];
const runtimeLabels =
  "degraded|mock|read-only|browser-local only|synthetic tenant metrics|no production tenant change|no tenant config persistence|no connector or feature flag change|no audit write".split(
    "|"
  );
const forbiddenVisibleTerms = [
  ...runtimeLabels,
  "Synthetic",
  "created in browser preview"
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

test("keeps group.tenants default visible body operational while retaining hidden runtime boundaries", async ({
  page
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openTenants(page);

  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "group"
  );
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "group.tenants"
  );
  await expect(page.getByTestId("page-outlet")).not.toHaveAttribute("data-tenant-id");
  await expect(page.getByTestId("m7-tenant-page")).toHaveAttribute(
    "data-runtime-boundary",
    /no production tenant change/
  );
  await expect(page.getByTestId("m7-tenant-runtime-note")).toHaveAttribute(
    "hidden",
    ""
  );
  await expectRuntimeBoundary(page.getByTestId("m7-tenant-runtime-note"));
  await expect(page.getByRole("heading", { name: "租户管理" })).toBeVisible();
  await expect(page.getByText("集团级租户管理")).toBeVisible();
  await expect(page.getByText("4 个租户")).toBeVisible();
  await expect(page.getByTestId("m7-tenant-new-button")).toContainText("新建租户");
  await expect(page.getByTestId("m7-tenant-table-panel")).toBeVisible();
  await expect(page.getByTestId("m7-tenant-source-note")).toContainText(
    "停用租户须填写原因"
  );
  await expectRuntimeBoundary(page.getByTestId("m7-tenant-source-note"));
  await expectLayerNav(page);
  await expectVisibleBodyClean(page);
  const desktop = await collectMetrics(page);
  expect(desktop.activePageId).toBe("group.tenants");
  expect(desktop.runtimeLabelsPresent).toBe(true);
  expect(desktop.runtimeLabelsVisibleInBody).toBe(false);
  expect(desktop.visibleBodyClean).toBe(true);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-tenant-management-default-clean.png`
  });

  await page.getByTestId("m7-tenant-manage-placeholder").click();
  await expect(page.getByTestId("m7-tenant-toast")).toContainText(
    "管理动作需等待租户明细接入"
  );
  await expectRuntimeBoundary(page.getByTestId("m7-tenant-toast"));
  await expectVisibleBodyClean(page);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-tenant-management-manage-toast-clean.png`
  });

  await page.getByTestId("m7-tenant-new-button").click();
  const modal = page.getByTestId("m7-tenant-new-modal");
  await expect(modal).toContainText("创建新租户");
  await expect(page.getByTestId("m7-tenant-new-create")).toBeDisabled();
  await page.getByTestId("m7-tenant-new-name").fill("胡杨跨境百货");
  await page.getByTestId("m7-tenant-new-line").fill("百货 · 中亚");
  await page.getByTestId("m7-tenant-new-cap-business").click();
  await expect(page.getByTestId("m7-tenant-new-create")).toBeEnabled();
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-tenant-management-new-modal-clean.png`
  });
  await page.getByTestId("m7-tenant-new-create").click();
  await expect(page.getByTestId("m7-tenant-toast")).toContainText(
    "租户创建已加入预览队列"
  );
  await expect(page.getByTestId("m7-tenant-toast")).toContainText("胡杨跨境百货");
  await expectRuntimeBoundary(page.getByTestId("m7-tenant-toast"));
  await expectVisibleBodyClean(page);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-tenant-management-create-toast-clean.png`
  });

  const forcedStates: Record<string, string> = {
    empty: "暂无租户记录",
    error: "租户管理暂不可用",
    loading: "正在载入租户",
    permission: "需要集团管理员权限"
  };
  for (const [state, label] of Object.entries(forcedStates)) {
    await openTenants(page, `?m7TenantState=${state}`);
    const target = page.getByTestId(`m7-tenant-state-${state}`);
    await expect(target).toContainText(label);
    await expectRuntimeBoundary(target);
    await expectVisibleBodyClean(page);
  }
  await openTenants(page, "?m7TenantState=degraded");
  await expectRuntimeBoundary(page.getByTestId("m7-tenant-runtime-note"));
  await expectVisibleBodyClean(page);

  await openTenants(page);
  await page.getByRole("button", { name: "Collapse navigation" }).click();
  const collapsed = await collectMetrics(page);
  expect(collapsed.navWidth).toBe(68);
  expect(collapsed.runtimeLabelsPresent).toBe(true);
  expect(collapsed.runtimeLabelsVisibleInBody).toBe(false);
  expect(collapsed.visibleBodyClean).toBe(true);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-tenant-management-collapsed-clean.png`
  });

  await page.setViewportSize({ width: 320, height: 900 });
  await openTenants(page);
  const mobile = await collectMetrics(page);
  expect(mobile.bodyScrollWidth).toBeLessThanOrEqual(320);
  expect(mobile.documentScrollWidth).toBeLessThanOrEqual(320);
  expect(mobile.runtimeLabelsPresent).toBe(true);
  expect(mobile.runtimeLabelsVisibleInBody).toBe(false);
  expect(mobile.visibleBodyClean).toBe(true);
  await page.getByTestId("m7-tenant-new-button").click();
  await expect(page.getByTestId("m7-tenant-new-modal")).toBeVisible();
  expect(
    await page
      .getByTestId("m7-tenant-new-modal")
      .evaluate((node) => Math.round((node as HTMLElement).offsetWidth))
  ).toBeLessThanOrEqual(296);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-tenant-management-mobile-320-clean.png`
  });

  writeFileSync(
    `${artifactDir}/metrics.json`,
    `${JSON.stringify({ collapsed, desktop, mobile }, null, 2)}\n`
  );
});

async function openTenants(page: Page, query = "") {
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

async function expectLayerNav(page: Page) {
  const nav = page.getByTestId("app-shell-nav");
  await expect
    .poll(() => nav.locator(".uz-nav-group p").allTextContents())
    .toEqual(groupSections);
  for (const label of groupLabels)
    await expect(nav.getByRole("button", { exact: true, name: label })).toBeVisible();
  for (const label of tenantLabels)
    await expect(nav.getByRole("button", { exact: true, name: label })).toHaveCount(0);
  for (const section of tenantSections)
    await expect(
      nav.locator(".uz-nav-group p").filter({ hasText: section })
    ).toHaveCount(0);
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
            element.getAttribute("aria-description") ?? "",
            element.textContent ?? ""
          ].join(" ");
        })
        .join(" ");
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
        runtimeLabelsPresent: labels.every((label) => boundaryText.includes(label)),
        runtimeLabelsVisibleInBody: labels.some((label) =>
          visibleText.toLowerCase().includes(label.toLowerCase())
        ),
        visibleBodyClean: forbidden.every(
          (term) => !visibleText.toLowerCase().includes(term.toLowerCase())
        )
      };
    },
    { forbidden: forbiddenVisibleTerms, labels: runtimeLabels }
  );
}
