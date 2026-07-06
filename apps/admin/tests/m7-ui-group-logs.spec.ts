import { mkdirSync, writeFileSync } from "node:fs";
import { expect, test, type Locator, type Page } from "@playwright/test";

const artifactDir = "/tmp/uzmax-m7-ui-95-group-logs-default-visual-parity-refresh";
const groupLabels =
  "集团总览|模型/成本/风险|模板中心|连接中心|发布与验收|租户管理|集团日志".split("|");
const tenantLabels =
  "对话|工单|确认队列|客户资产|订单|知识与资源|评测中心|AI 成员|团队|配置|分析|日志".split(
    "|"
  );
const groupSections = ["总览", "平台", "治理"];
const tenantSections = ["运营", "数据", "智能", "管理", "洞察"];
const runtimeLabels =
  "degraded|mock|read-only|browser-local only|synthetic audit rows|no production audit export|no file written|no audit runtime call|no real tenant/action navigation".split(
    "|"
  );
const forbiddenVisibleTerms = [...runtimeLabels, "Synthetic", "synthetic"];

mkdirSync(artifactDir, { recursive: true });

test.beforeEach(async ({ page }) => {
  await page.route("**/conversation-ticket/conversations", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
  await page.route("**/confirmation-queue/items?status=pending", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
});

test("renders group logs with group shell and hidden audit boundary", async ({
  page
}) => {
  await openGroupLogs(page);
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "group"
  );
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "group.logs"
  );
  await expect(page.getByTestId("page-outlet")).not.toHaveAttribute("data-tenant-id");
  await expect(page.getByRole("heading", { name: "集团日志" })).toBeVisible();
  await expect(page.getByTestId("m7-group-logs-subtitle")).toContainText(
    "操作日志 · 跨租户 · 7 条"
  );
  await expectLayerNav(page, groupSections, tenantSections, groupLabels, tenantLabels);
  await expectRuntimeBoundary(page.getByTestId("m7-group-logs-page"));
  await expectRuntimeBoundary(page.getByTestId("m7-group-logs-runtime-note"));
  await expectVisibleBodyClean(page);

  const logPage = page.getByTestId("m7-group-logs-page");
  for (const label of [
    "全部模块",
    "AI 成员",
    "连接中心",
    "配置",
    "租户管理",
    "对话",
    "工单"
  ])
    await expect(
      logPage.getByRole("button", { exact: true, name: label })
    ).toBeVisible();
  await expect(page.locator(".uz-glog-row")).toHaveCount(7);
  await expect(page.locator(".uz-glog-row").first()).toContainText("恢复白桦母婴 AI");
  await expectVisibleBodyClean(page);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-group-logs-desktop.png`
  });
  const metrics = await collectMetrics(page);
  writeFileSync(
    `${artifactDir}/react-group-logs-metrics.json`,
    JSON.stringify(metrics, null, 2)
  );
});

test("module chips and search filter rows with empty state", async ({ page }) => {
  await openGroupLogs(page);
  const logPage = page.getByTestId("m7-group-logs-page");
  const connectionChip = logPage.getByRole("button", {
    exact: true,
    name: "连接中心"
  });
  await connectionChip.click();
  await expect(page.getByTestId("m7-group-logs-active-module")).toHaveText("连接中心");
  await expect(connectionChip).toHaveAttribute("aria-pressed", "true");
  await expectPressedChipReadable(connectionChip);
  await connectionChip.hover();
  await expectPressedChipReadable(connectionChip);
  await connectionChip.focus();
  await expectPressedChipReadable(connectionChip);
  await expect(page.locator(".uz-glog-row")).toHaveCount(1);
  await expect(page.locator(".uz-glog-row")).toContainText("order-api");

  await page.getByTestId("m7-group-logs-search").fill("ADR-B02");
  await expect(page.locator(".uz-glog-row")).toHaveCount(1);
  await page.getByTestId("m7-group-logs-search").fill("no matching local row");
  await expect(page.locator(".uz-glog-row")).toHaveCount(0);
  await expect(page.getByTestId("m7-group-logs-empty")).toContainText(
    "没有匹配「no matching local row」的记录"
  );
  await expect(page.getByTestId("m7-group-logs-empty")).toContainText(
    "调整模块或搜索词后继续核对集团操作记录。"
  );
  await expectVisibleBodyClean(page);
  await expect(page.getByTestId("m7-group-logs-subtitle")).toContainText(
    "操作日志 · 跨租户 · 显示 0 / 7 条"
  );
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-group-logs-filter-empty.png`
  });
});

test("export and detail actions keep clean feedback with hidden boundaries", async ({
  page
}) => {
  await openGroupLogs(page);
  await expect(page.getByTestId("m7-group-logs-export")).toHaveAttribute(
    "aria-label",
    "导出集团日志"
  );
  await expectRuntimeBoundary(page.getByTestId("m7-group-logs-export"));
  await page.getByTestId("m7-group-logs-export").click();
  await expectLocalToast(page, ["已准备导出范围", "7 条记录", "本页可继续筛选核对"]);

  const detail = page.getByRole("button", { name: /查看日志详情 AI 成员 agent-02/ });
  await expectRuntimeBoundary(detail);
  await detail.click();
  await expectLocalToast(page, ["详情预览已打开", "AI 成员 / agent-02"]);
  await expectVisibleBodyClean(page);
});

test("forced URL states stay deterministic", async ({ page }) => {
  const stateCopy: Record<string, string> = {
    empty: "暂无集团日志",
    error: "集团日志暂不可用",
    loading: "正在载入集团日志",
    permission: "需要集团日志权限"
  };
  for (const state of ["loading", "empty", "error", "permission", "degraded"]) {
    await openGroupLogs(page, `?state=${state}`);
    const target =
      state === "degraded"
        ? page.getByTestId("m7-group-logs-runtime-note")
        : page.getByTestId(`m7-group-logs-state-${state}`);
    await expectRuntimeBoundary(target);
    if (state !== "degraded") await expect(target).toContainText(stateCopy[state]);
    await expectVisibleBodyClean(page);
  }
});

test("collapsed sidebar and mobile 320 fallback stay bounded", async ({ page }) => {
  await openGroupLogs(page);
  await page.getByRole("button", { name: "Collapse navigation" }).click();
  await expect(page.getByTestId("app-shell-nav")).toHaveJSProperty("offsetWidth", 68);
  await expect(page.getByTestId("admin-shell")).toHaveClass(/is-nav-collapsed/);

  await page.setViewportSize({ width: 320, height: 900 });
  await openGroupLogs(page);
  await expect(page.getByTestId("m7-group-logs-page")).toBeVisible();
  await expect(page.locator(".uz-glog-card").first()).toBeVisible();
  await expectVisibleBodyClean(page);
  expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(320);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-group-logs-mobile-320.png`
  });
});

async function openGroupLogs(page: Page, query = "") {
  await page.goto(`/design${query}`);
  await page
    .getByTestId("app-shell-nav")
    .getByRole("button", { exact: true, name: "集团日志" })
    .click();
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "group.logs"
  );
}

async function expectLocalToast(page: Page, labels: readonly string[]) {
  const toast = page.getByTestId("m7-group-logs-toast");
  await expect(toast).toHaveAttribute("role", "status");
  await expect(toast).toHaveAttribute("aria-live", "polite");
  for (const label of labels) await expect(toast).toContainText(label);
  await expectRuntimeBoundary(toast);
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

async function expectPressedChipReadable(chip: Locator) {
  const colors = await chip.evaluate((node) => {
    const style = getComputedStyle(node);
    return {
      backgroundColor: style.backgroundColor,
      color: style.color
    };
  });
  expect(colors.color).not.toBe(colors.backgroundColor);
  expect(contrastRatio(colors.color, colors.backgroundColor)).toBeGreaterThanOrEqual(
    4.5
  );
}

function contrastRatio(foreground: string, background: string) {
  const fg = relativeLuminance(parseRgbColor(foreground));
  const bg = relativeLuminance(parseRgbColor(background));
  const lighter = Math.max(fg, bg);
  const darker = Math.min(fg, bg);
  return (lighter + 0.05) / (darker + 0.05);
}

function parseRgbColor(value: string): [number, number, number] {
  const match = value.match(/rgba?\(([^)]+)\)/);
  if (!match) throw new Error(`Unsupported CSS color format: ${value}`);
  const colorBody = match[1];
  if (!colorBody) throw new Error(`Unsupported CSS color format: ${value}`);

  const channels = colorBody
    .split(/[\s,/]+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((part) => Number.parseFloat(part));
  const [red, green, blue] = channels;
  if (
    red === undefined ||
    green === undefined ||
    blue === undefined ||
    channels.some((channel) => Number.isNaN(channel))
  )
    throw new Error(`Unsupported CSS color format: ${value}`);
  return [red, green, blue];
}

function relativeLuminance([red, green, blue]: [number, number, number]) {
  const r = toLinearRgb(red);
  const g = toLinearRgb(green);
  const b = toLinearRgb(blue);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function toLinearRgb(channel: number) {
  const normalized = channel / 255;
  return normalized <= 0.03928
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
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
  for (const label of visibleLabels)
    await expect(nav.getByRole("button", { exact: true, name: label })).toBeVisible();
  for (const label of hiddenLabels)
    await expect(nav.getByRole("button", { exact: true, name: label })).toHaveCount(0);
  for (const label of hiddenSections)
    await expect(nav.locator(".uz-nav-group p").filter({ hasText: label })).toHaveCount(
      0
    );
}

async function collectMetrics(page: Page) {
  const visibleText = await page.evaluate(() => document.body.innerText);
  const boundaryText = await page.evaluate(() =>
    Array.from(document.querySelectorAll("[data-runtime-boundary]"))
      .map((node) => {
        const element = node as HTMLElement;
        return [
          element.getAttribute("data-runtime-boundary") ?? "",
          element.getAttribute("title") ?? "",
          element.getAttribute("aria-description") ?? "",
          element.textContent ?? ""
        ].join(" ");
      })
      .join(" ")
  );
  return {
    activeModule: await page.getByTestId("m7-group-logs-active-module").textContent(),
    activePageId: await page
      .getByTestId("admin-shell")
      .getAttribute("data-active-page-id"),
    bodyScrollWidth: await page.evaluate(() => document.body.scrollWidth),
    cardRowCount: await page.locator(".uz-glog-card").count(),
    shellLevel: await page.getByTestId("admin-shell").getAttribute("data-shell-level"),
    sidebarExpandedWidth: await page
      .getByTestId("app-shell-nav")
      .evaluate((node) => (node as HTMLElement).offsetWidth),
    tableRowCount: await page.locator(".uz-glog-row").count(),
    tableWrapperWidth: await page
      .locator(".uz-glog-table-wrap")
      .evaluate((node) => Math.round((node as HTMLElement).offsetWidth)),
    topbarHeight: await page
      .locator(".uz-topbar")
      .evaluate((node) => (node as HTMLElement).offsetHeight),
    runtimeLabelsPresent: runtimeLabels.every((label) => boundaryText.includes(label)),
    runtimeLabelsVisibleInBody: runtimeLabels.some((label) =>
      visibleText.toLowerCase().includes(label.toLowerCase())
    ),
    visibleBodyClean: forbiddenVisibleTerms.every(
      (term) => !visibleText.toLowerCase().includes(term.toLowerCase())
    )
  };
}
