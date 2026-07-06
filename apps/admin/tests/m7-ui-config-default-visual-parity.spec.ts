import { mkdirSync, writeFileSync } from "node:fs";
import { expect, test, type Locator, type Page } from "@playwright/test";

const artifactDir = "/tmp/uzmax-m7-ui-89-config-default-visual-parity-refresh";
const runtimeLabels = [
  "degraded",
  "mock",
  "browser-local only",
  "no production config write",
  "no audit write",
  "no connector switch",
  "no eval-gated publish",
  "no API call"
];
const forbiddenVisibleTerms = [
  ...runtimeLabels,
  "local-only",
  "local only",
  "no production",
  "Synthetic"
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

test("keeps tenant.config default body operational while retaining hidden runtime boundaries", async ({
  page
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openConfig(page);

  await expect(page.getByTestId("m7-config-page")).toHaveAttribute(
    "data-runtime-boundary",
    /no production config write/
  );
  await expect(page.getByTestId("m7-config-runtime-note")).toHaveAttribute(
    "hidden",
    ""
  );
  await expectRuntimeBoundary(page.getByTestId("m7-config-runtime-note"));
  await expect(page.getByTestId("m7-config-page")).toContainText("配置");
  await expect(page.getByTestId("m7-config-page")).toContainText("业务配置");
  await expect(page.getByTestId("m7-config-page")).toContainText("当前版本 v3");
  await expectVisibleBodyClean(page);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-config-default-clean.png`
  });

  await page.locator(".uz-config-field select").first().selectOption("俄语");
  await expect(page.getByTestId("m7-config-version-head")).toContainText(
    "未保存的修改"
  );
  await page.getByTestId("m7-config-save").click();
  await expect(page.getByTestId("m7-config-toast")).toContainText(
    "配置变更已暂存，并生成新的版本预览"
  );
  await expectRuntimeBoundary(page.getByTestId("m7-config-toast"));
  await expectVisibleBodyClean(page);

  await page.getByRole("button", { name: /版本历史/ }).click();
  await expect(page.getByTestId("m7-config-history")).toContainText(
    "版本历史 · 回滚需二次确认并写审计"
  );
  await page.getByRole("button", { name: "回滚到此版本" }).first().click();
  const rollbackModal = page.getByTestId("m7-confirm-modal");
  await expect(rollbackModal).toContainText("回滚预览");
  await expectRuntimeBoundary(rollbackModal.locator("[data-runtime-boundary]"));
  await expectVisibleBodyClean(page);
  await rollbackModal.getByRole("textbox").fill("回滚预览原因");
  await rollbackModal.getByRole("button", { name: "回滚" }).click();
  await expect(page.getByTestId("m7-config-toast")).toContainText("回滚到 v");
  await expectVisibleBodyClean(page);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-config-version-history-clean.png`
  });

  const internal = page.getByTestId("m7-config-internal-nav");
  await internal.getByRole("button", { exact: true, name: "渠道配置" }).click();
  await page.getByRole("button", { name: "测试连接" }).first().click();
  await expect(page.getByTestId("m7-config-toast")).toContainText(
    "渠道连通性检查已更新"
  );
  await expectRuntimeBoundary(page.getByTestId("m7-config-toast"));
  await expectVisibleBodyClean(page);

  await internal.getByRole("button", { exact: true, name: "订单 connector" }).click();
  await page.getByRole("button", { name: "测试连接" }).click();
  await expect(page.getByTestId("m7-config-toast")).toContainText(
    "订单连接健康状态已刷新"
  );
  await page.getByRole("button", { name: "切换为导入快照主路径" }).click();
  const switchModal = page.getByTestId("m7-confirm-modal");
  await expect(switchModal).toContainText("订单主路径将切换为");
  await expectRuntimeBoundary(switchModal.locator("[data-runtime-boundary]"));
  await expectVisibleBodyClean(page);
  await switchModal.getByRole("textbox").fill("切换预览原因");
  await switchModal.getByRole("button", { name: "确认本地切换" }).click();
  await expect(page.getByTestId("m7-config-toast")).toContainText(
    "订单数据主路径预览已切换"
  );
  await expectVisibleBodyClean(page);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-config-connector-clean.png`
  });

  const desktop = await collectMetrics(page);
  expect(desktop.activePageId).toBe("tenant.config");
  expect(desktop.runtimeLabelsPresent).toBe(true);
  expect(desktop.runtimeLabelsVisibleInBody).toBe(false);
  expect(desktop.visibleBodyClean).toBe(true);

  for (const state of ["loading", "empty", "error", "permission", "degraded"]) {
    await openConfig(page, `?m7ConfigState=${state}`);
    const target =
      state === "degraded"
        ? page.getByTestId("m7-config-runtime-note")
        : page.getByTestId(`m7-config-state-${state}`);
    await expectRuntimeBoundary(target);
    await expectVisibleBodyClean(page);
  }

  await openConfig(page);
  await page.getByRole("button", { name: "Collapse navigation" }).click();
  const collapsed = await collectMetrics(page);
  expect(collapsed.navWidth).toBe(68);
  expect(collapsed.visibleBodyClean).toBe(true);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-config-collapsed-clean.png`
  });

  await page.setViewportSize({ width: 320, height: 900 });
  await openConfig(page);
  const mobile = await collectMetrics(page);
  expect(mobile.bodyScrollWidth).toBeLessThanOrEqual(320);
  expect(mobile.documentScrollWidth).toBeLessThanOrEqual(320);
  expect(mobile.visibleBodyClean).toBe(true);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-config-mobile-320-default-clean.png`
  });

  writeFileSync(
    `${artifactDir}/metrics.json`,
    `${JSON.stringify({ collapsed, desktop, mobile }, null, 2)}\n`
  );
});

async function openConfig(page: Page, query = "") {
  await page.goto(`/design${query}`);
  await page.getByTestId("tenant-switcher").selectOption("tenant-b");
  await page
    .getByTestId("app-shell-nav")
    .getByRole("button", { exact: true, name: "配置" })
    .click();
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.config"
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
  for (const label of runtimeLabels) {
    expect(text).toContain(label);
  }
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
            element.getAttribute("aria-description") ?? ""
          ].join(" ");
        })
        .join(" ");
      const fullText = document.body.textContent ?? "";
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
        runtimeLabelsPresent: labels.every((label) =>
          `${boundaryText} ${fullText}`.includes(label)
        ),
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
