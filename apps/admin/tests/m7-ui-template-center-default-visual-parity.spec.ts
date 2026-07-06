import { mkdirSync, writeFileSync } from "node:fs";
import { expect, test, type Locator, type Page } from "@playwright/test";

const artifactDir = "/tmp/uzmax-m7-ui-94-template-center-default-visual-parity-refresh";
const groupLabels =
  "集团总览|模型/成本/风险|模板中心|连接中心|发布与验收|租户管理|集团日志".split("|");
const tenantLabels =
  "对话|工单|确认队列|客户资产|订单|知识与资源|评测中心|AI 成员|团队|配置|分析|日志".split(
    "|"
  );
const groupSections = ["总览", "平台", "治理"];
const tenantSections = ["运营", "数据", "智能", "管理", "洞察"];
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

test("keeps group.templates default visible body operational while retaining hidden runtime boundaries", async ({
  page
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
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
  await expect(page.getByTestId("m7-template-page")).toHaveAttribute(
    "data-runtime-boundary",
    /no production template copy/
  );
  await expect(page.getByTestId("m7-template-runtime-note")).toHaveAttribute(
    "hidden",
    ""
  );
  await expectRuntimeBoundary(page.getByTestId("m7-template-runtime-note"));
  await expect(page.getByRole("heading", { name: "模板中心" })).toBeVisible();
  await expect(page.getByText("复制到租户将生成独立版本")).toBeVisible();
  await expect(page.getByText("集团级模板运营")).toBeVisible();
  await expect(page.locator(".uz-template-card")).toHaveCount(3);
  await expect(page.locator(".uz-template-card").first()).toContainText("通过");
  await expect(page.locator(".uz-template-card").first()).toContainText("最近复制");
  await expectLayerNav(page);
  await expectVisibleBodyClean(page);

  const desktop = await collectMetrics(page);
  expect(desktop.activePageId).toBe("group.templates");
  expect(desktop.shellLevel).toBe("group");
  expect(desktop.runtimeLabelsPresent).toBe(true);
  expect(desktop.runtimeLabelsVisibleInBody).toBe(false);
  expect(desktop.visibleBodyClean).toBe(true);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-template-center-default-clean.png`
  });

  const trigger = page.getByTestId("m7-template-copy-SYN-TMPL-tk1");
  await expectRuntimeBoundary(trigger);
  await trigger.click();
  const modal = page.getByTestId("m7-template-copy-modal");
  await expect(modal).toContainText("复制「美妆售后知识包 v4.2」");
  await expect(modal).toContainText("复制后生成独立版本，可各自演进");
  await expectRuntimeBoundary(modal);
  await expectVisibleBodyClean(page);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-template-center-modal-clean.png`
  });

  const confirm = page.getByTestId("m7-template-confirm-copy");
  await expect(confirm).toBeDisabled();
  await page.getByTestId("m7-template-tenant-SYN-COPY-t1").click();
  await expect(confirm).toBeEnabled();
  await confirm.click();
  const toast = page.getByTestId("m7-template-toast");
  await expect(toast).toContainText(
    "已复制「美妆售后知识包 v4.2」到 1 个租户 · 知识包"
  );
  await expect(toast).toContainText("租户将生成独立版本");
  await expectRuntimeBoundary(toast);
  await expectVisibleBodyClean(page);
  const action = await collectMetrics(page);
  expect(action.runtimeLabelsPresent).toBe(true);
  expect(action.runtimeLabelsVisibleInBody).toBe(false);
  expect(action.visibleBodyClean).toBe(true);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-template-center-toast-clean.png`
  });

  const forcedStates: Record<string, string> = {
    empty: "暂无可用模板",
    error: "模板中心暂不可用",
    loading: "正在载入模板",
    permission: "需要集团管理员权限"
  };
  for (const [state, label] of Object.entries(forcedStates)) {
    await openTemplate(page, `?m7TemplateState=${state}`);
    const target = page.getByTestId(`m7-template-state-${state}`);
    await expect(target).toContainText(label);
    await expectRuntimeBoundary(target);
    await expectVisibleBodyClean(page);
  }
  await openTemplate(page, "?m7TemplateState=degraded");
  await expectRuntimeBoundary(page.getByTestId("m7-template-runtime-note"));
  await expectVisibleBodyClean(page);

  await openTemplate(page);
  await page.getByRole("button", { name: "Collapse navigation" }).click();
  const collapsed = await collectMetrics(page);
  expect(collapsed.navWidth).toBe(68);
  expect(collapsed.runtimeLabelsPresent).toBe(true);
  expect(collapsed.runtimeLabelsVisibleInBody).toBe(false);
  expect(collapsed.visibleBodyClean).toBe(true);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-template-center-collapsed-clean.png`
  });

  await page.setViewportSize({ width: 320, height: 900 });
  await openTemplate(page);
  const mobile = await collectMetrics(page);
  expect(mobile.bodyScrollWidth).toBeLessThanOrEqual(320);
  expect(mobile.documentScrollWidth).toBeLessThanOrEqual(320);
  expect(mobile.firstCardWidth).toBeLessThanOrEqual(296);
  expect(mobile.runtimeLabelsPresent).toBe(true);
  expect(mobile.runtimeLabelsVisibleInBody).toBe(false);
  expect(mobile.visibleBodyClean).toBe(true);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-template-center-mobile-320-clean.png`
  });

  writeFileSync(
    `${artifactDir}/metrics.json`,
    `${JSON.stringify({ action, collapsed, desktop, mobile }, null, 2)}\n`
  );
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
    ({ forbidden, labels, hiddenTenantLabels }) => {
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
      const navLabels = Array.from(
        document.querySelectorAll('[data-testid="app-shell-nav"] button')
      ).map((node) => (node.textContent ?? "").trim());
      const firstCard = document.querySelector(".uz-template-card") as HTMLElement;
      return {
        activePageId: document
          .querySelector('[data-testid="admin-shell"]')
          ?.getAttribute("data-active-page-id"),
        bodyScrollWidth: document.body.scrollWidth,
        documentScrollWidth: document.documentElement.scrollWidth,
        firstCardWidth: Math.round(firstCard?.offsetWidth ?? 0),
        navWidth: Math.round(
          document
            .querySelector('[data-testid="app-shell-nav"]')
            ?.getBoundingClientRect().width ?? 0
        ),
        runtimeLabelsPresent: labels.every((label) => boundaryText.includes(label)),
        runtimeLabelsVisibleInBody: labels.some((label) =>
          visibleText.toLowerCase().includes(label.toLowerCase())
        ),
        shellLevel: document
          .querySelector('[data-testid="admin-shell"]')
          ?.getAttribute("data-shell-level"),
        tenantButtonCount: hiddenTenantLabels.filter((label) =>
          navLabels.includes(label)
        ).length,
        visibleBodyClean: forbidden.every(
          (term) => !visibleText.toLowerCase().includes(term.toLowerCase())
        )
      };
    },
    {
      forbidden: forbiddenVisibleTerms,
      hiddenTenantLabels: tenantLabels,
      labels: runtimeLabels
    }
  );
}
