import { mkdirSync, writeFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

const artifactDir = "/tmp/uzmax-m7-ui-41-ai-members-visible-ui-v2";
const tenantLabels =
  "对话|工单|确认队列|客户资产|订单|知识与资源|评测中心|AI 成员|团队|配置|分析|日志".split(
    "|"
  );
const tenantSections = ["运营", "数据", "智能", "管理", "洞察"];
const runtimeLabels = [
  "degraded",
  "mock",
  "read-only",
  "not production member metrics",
  "no production persona publish",
  "local action only"
];
const forbiddenVisibleTerms = [
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
  "controlled://mock",
  "local action only"
];

mkdirSync(artifactDir, { recursive: true });

test.beforeEach(async ({ page }) => {
  await page.route("**/conversation-ticket/conversations", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
});

test("renders tenant.aiMembers with hidden runtime labels filters and desktop metrics", async ({
  page
}) => {
  await openAgents(page);
  await expect(page.getByTestId("page-outlet")).toHaveAttribute(
    "data-page-id",
    "tenant.aiMembers"
  );
  await expect(page.getByTestId("page-outlet")).toHaveAttribute(
    "data-tenant-id",
    "tenant-b"
  );
  await expect(page.getByTestId("m7-agent-page")).toHaveAttribute(
    "data-tenant-id",
    "tenant-b"
  );
  await expect(page.getByTestId("m7-agent-page")).toHaveAttribute(
    "data-runtime-boundary",
    /AI member runtime unavailable/
  );
  await expect(page.getByTestId("m7-agent-runtime-note")).toHaveAttribute("hidden", "");
  for (const label of runtimeLabels)
    await expect(page.getByTestId("m7-agent-runtime-note")).toContainText(label);
  await expect(page.getByTestId("m7-agent-alert")).toContainText("熔断或急停状态");
  await expectVisibleBodyClean(page);
  await expect(page.getByTestId("m7-agent-card-grid")).toBeVisible();
  await expect(page.getByTestId("m7-agent-human-table")).toBeVisible();
  await page.getByTestId("m7-agent-filter-ai").click();
  await expect(page.getByTestId("m7-agent-human-table")).toHaveCount(0);
  await page.getByTestId("m7-agent-filter-human").click();
  await expect(page.getByTestId("m7-agent-card-grid")).toHaveCount(0);
  await expectTenantOnlyNav(page);
  await page.getByTestId("m7-agent-filter-all").click();

  const metrics = await collectMetrics(page);
  expect(metrics.activePageId).toBe("tenant.aiMembers");
  expect(metrics.shellLevel).toBe("tenant");
  expect(metrics.runtimeLabelsPresent).toBe(true);
  expect(metrics.runtimeLabelsVisibleInBody).toBe(false);
  expect(metrics.sidebarExpandedWidth).toBe(232);
  expect(metrics.topbarHeight).toBeGreaterThanOrEqual(52);
  expect(metrics.firstCardWidth).toBeGreaterThanOrEqual(300);
  writeFileSync(
    `${artifactDir}/react-ai-members-metrics.json`,
    JSON.stringify(metrics, null, 2)
  );
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-ai-members-desktop.png`
  });
});

test("supports local capability emergency recovery persona and URL states", async ({
  page
}) => {
  await openAgents(page);
  const cap = page.getByTestId("m7-agent-cap-SYN-AI-MEMBER-PRIMARY-vision");
  await expect(cap).toHaveAttribute("aria-pressed", "true");
  await cap.click();
  await expect(cap).toHaveAttribute("aria-pressed", "false");

  await page.getByTestId("m7-agent-estop-SYN-AI-MEMBER-PRIMARY").click();
  await expect(page.getByTestId("m7-confirm-modal")).toBeVisible();
  await expect(page.getByRole("button", { name: "确认紧急停止" })).toBeDisabled();
  await expectVisibleBodyClean(page);
  await page.getByLabel("操作原因").fill("紧急停止演练");
  await page.getByRole("button", { name: "确认紧急停止" }).click();
  await expect(page.getByTestId("m7-agent-toast")).toContainText("状态已更新");
  await expect(page.getByTestId("m7-agent-card-SYN-AI-MEMBER-PRIMARY")).toContainText(
    "已急停"
  );

  await page.getByRole("button", { name: "解除急停" }).first().click();
  await page.getByLabel("操作原因").fill("问题已处理");
  await page.getByRole("button", { name: "确认解除" }).click();
  await expect(page.getByTestId("m7-agent-card-SYN-AI-MEMBER-PRIMARY")).toContainText(
    "在线"
  );

  await page.getByTestId("m7-agent-persona-SYN-AI-MEMBER-PRIMARY").click();
  await page.getByTestId("m7-agent-persona-textarea").fill("local edited persona");
  await expect(page.getByTestId("m7-agent-persona-gate")).toContainText("需运行评测");
  await page.getByRole("button", { name: "运行评测" }).click();
  await expect(page.getByTestId("m7-agent-persona-gate")).toContainText("评测通过", {
    timeout: 1200
  });
  await page.getByTestId("m7-agent-persona-publish").click();
  await expect(page.getByTestId("m7-agent-toast")).toContainText("发布预览已生成");
  await expectVisibleBodyClean(page);

  for (const state of ["loading", "empty", "error", "permission"]) {
    await openAgents(page, `?m7AgentState=${state}`);
    await expect(page.getByTestId(`m7-agent-state-${state}`)).toBeVisible();
    await expect(page.getByTestId(`m7-agent-state-${state}`)).toHaveAttribute(
      "data-runtime-boundary",
      /not production member metrics/
    );
    await expectVisibleBodyClean(page);
  }
});

test("resets local state on tenant switch and supports mobile 320 fallback", async ({
  page
}) => {
  await openAgents(page);
  await page.getByTestId("m7-agent-cap-SYN-AI-MEMBER-PRIMARY-vision").click();
  await expect(
    page.getByTestId("m7-agent-cap-SYN-AI-MEMBER-PRIMARY-vision")
  ).toHaveAttribute("aria-pressed", "false");
  await page.getByTestId("tenant-switcher").selectOption("tenant-c");
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.aiMembers"
  );
  await expect(page.getByTestId("page-outlet")).toHaveAttribute(
    "data-tenant-id",
    "tenant-c"
  );
  await expect(page.getByTestId("m7-agent-page")).toHaveAttribute(
    "data-tenant-id",
    "tenant-c"
  );
  await expect(
    page.getByTestId("m7-agent-cap-SYN-AI-MEMBER-PRIMARY-vision")
  ).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("button", { name: "Collapse navigation" }).click();
  await expect(page.getByTestId("app-shell-nav")).toHaveJSProperty("offsetWidth", 68);
  await page.setViewportSize({ width: 320, height: 900 });
  await openAgents(page);
  await expect(page.getByTestId("m7-agent-card-grid")).toBeVisible();
  await expectVisibleBodyClean(page);
  expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(320);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-ai-members-mobile-320.png`
  });
});

async function openAgents(page: Page, query = "") {
  await page.goto(`/design${query}`);
  await page.getByTestId("tenant-switcher").selectOption("tenant-b");
  await page
    .getByTestId("app-shell-nav")
    .getByRole("button", { exact: true, name: "AI 成员" })
    .click();
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.aiMembers"
  );
}

async function expectTenantOnlyNav(page: Page) {
  const nav = page.getByTestId("app-shell-nav");
  await expect
    .poll(() => nav.locator(".uz-nav-group p").allTextContents())
    .toEqual(tenantSections);
  for (const label of tenantLabels)
    await expect(nav.getByRole("button", { exact: true, name: label })).toBeVisible();
}

async function expectVisibleBodyClean(page: Page) {
  const visibleBody = await page.evaluate(() => document.body.innerText);
  for (const term of forbiddenVisibleTerms)
    expect(visibleBody.toLowerCase()).not.toContain(term.toLowerCase());
}

async function collectMetrics(page: Page) {
  const bodyText = await page.evaluate(() => document.body.innerText);
  const boundaryText =
    (await page.getByTestId("m7-agent-page").getAttribute("data-runtime-boundary")) ??
    "";
  const firstCardWidth = await page
    .getByTestId("m7-agent-card-grid")
    .locator(".uz-agent-card")
    .first()
    .evaluate((node) =>
      Math.round((node as HTMLElement).getBoundingClientRect().width)
    );
  return {
    activePageId: await page
      .getByTestId("admin-shell")
      .getAttribute("data-active-page-id"),
    bodyScrollWidth: await page.evaluate(() => document.body.scrollWidth),
    firstCardWidth,
    gridColumnCount: await page
      .getByTestId("m7-agent-card-grid")
      .locator(".uz-agent-card")
      .count(),
    runtimeLabelsPresent: runtimeLabels.every((label) => boundaryText.includes(label)),
    runtimeLabelsVisibleInBody: runtimeLabels.some((label) =>
      bodyText.toLowerCase().includes(label.toLowerCase())
    ),
    shellLevel: await page.getByTestId("admin-shell").getAttribute("data-shell-level"),
    sidebarExpandedWidth: await page
      .getByTestId("app-shell-nav")
      .evaluate((node) => (node as HTMLElement).offsetWidth),
    topbarHeight: await page
      .locator(".uz-topbar")
      .evaluate((node) => (node as HTMLElement).offsetHeight)
  };
}
