import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { expect, test, type Locator, type Page } from "@playwright/test";

const outDir = "/tmp/uzmax-m7-ui-57-group-logs-visible-ui";
const sourcePaths = {
  fixture: "/Users/atilla/源码/unpacked 6/fixtures/groupPlatform.ts",
  owner: "/Users/atilla/Downloads/运营塔台1.0.html",
  page: "/Users/atilla/源码/unpacked 6/pages/group/GroupLogsPage.tsx"
} as const;
const groupNav =
  "集团总览|模型/成本/风险|模板中心|连接中心|发布与验收|租户管理|集团日志".split("|");
const tenantNav =
  "对话|工单|确认队列|客户资产|订单|知识与资源|评测中心|AI 成员|团队|配置|分析|日志".split(
    "|"
  );
const sourceMarkers = {
  fixture: ["GLOG_COLS", "GLOG_BASE", "GLOG_MODULES", "操作内容"],
  owner: ["集团日志", "gLogRows", "gLogResultLabel"],
  page: ["集团日志", "搜索本页记录", "导出", "没有匹配的记录"]
} as const;

mkdirSync(outDir, { recursive: true });

test("samples owner and unpacked group logs source when present", async () => {
  const availability = Object.entries(sourcePaths).map(([kind, path]) => ({
    kind,
    ok: existsSync(path),
    path
  }));
  writeJson("source-availability.json", { availability });
  const missing = availability.filter((item) => !item.ok);
  if (missing.length > 0) return writeMissingSources(missing);

  const sourceText = {
    fixture: readFileSync(sourcePaths.fixture, "utf8"),
    owner: readFileSync(sourcePaths.owner, "utf8"),
    page: readFileSync(sourcePaths.page, "utf8")
  };
  for (const [source, markers] of Object.entries(sourceMarkers))
    for (const marker of markers)
      expect(sourceText[source as keyof typeof sourceText]).toContain(marker);
  writeJson("source-sampling.json", {
    markers: sourceMarkers,
    sourcePaths
  });
});

test("renders group logs inside group shell only", async ({ page }) => {
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
    "7 条 mock · 全集团操作与审计预览"
  );
  await assertLayerNavigation(page);
  for (const label of [
    "degraded",
    "mock",
    "read-only",
    "browser-local only",
    "synthetic audit rows",
    "no production audit export",
    "no file written",
    "no audit runtime call",
    "no real tenant/action navigation"
  ])
    await expect(page.getByTestId("m7-group-logs-runtime-note")).toContainText(label);

  const logPage = page.getByTestId("m7-group-logs-page");
  for (const label of [
    "全部模块",
    "AI 成员",
    "连接中心",
    "配置",
    "对话",
    "模板中心",
    "工单",
    "租户管理"
  ])
    await expect(
      logPage.getByRole("button", { exact: true, name: label })
    ).toBeVisible();
  await expect(page.locator(".uz-glog-row")).toHaveCount(7);
  await expect(page.locator(".uz-glog-row").first()).toContainText("恢复白桦母婴 AI");

  writeJson("react-group-logs-metrics.json", await desktopMetrics(page));
  await page.screenshot({
    fullPage: true,
    path: `${outDir}/react-group-logs-desktop.png`
  });
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
  await expect(page.getByTestId("m7-group-logs-empty")).toContainText("没有匹配的记录");
  await expect(page.getByTestId("m7-group-logs-subtitle")).toContainText("0 条 mock");
  await page.screenshot({
    fullPage: true,
    path: `${outDir}/react-group-logs-filter-empty.png`
  });
});

test("export and detail actions stay browser-local only", async ({ page }) => {
  await openGroupLogs(page);
  await page.getByTestId("m7-group-logs-export").click();
  await expectLocalToast(page, [
    "browser-local only",
    "7 synthetic audit rows",
    "no production audit export",
    "no file written",
    "no audit runtime call"
  ]);

  await page.getByRole("button", { name: /本地预览日志详情 AI 成员 agent-02/ }).click();
  await expectLocalToast(page, [
    "AI 成员 / agent-02 detail preview",
    "no real tenant/action navigation",
    "no audit runtime call"
  ]);
});

test("forced states, collapsed rail, and mobile 320 fallback stay bounded", async ({
  page
}) => {
  for (const key of ["state", "m7GroupLogsState"]) {
    for (const state of ["loading", "empty", "error", "permission", "degraded"]) {
      await openGroupLogs(page, `?${key}=${state}`);
      const target =
        state === "degraded"
          ? page.getByTestId("m7-group-logs-runtime-note")
          : page.getByTestId(`m7-group-logs-state-${state}`);
      await expect(target).toContainText("browser-local only");
      await expect(target).toContainText("no production audit export");
      await expect(target).toContainText("no audit runtime call");
    }
  }

  await openGroupLogs(page);
  await page.getByRole("button", { name: "Collapse navigation" }).click();
  await expect(page.getByTestId("app-shell-nav")).toHaveJSProperty("offsetWidth", 68);
  await expect(page.getByTestId("admin-shell")).toHaveClass(/is-nav-collapsed/);
  writeJson("react-group-logs-collapsed-metrics.json", {
    navWidth: await width(page, "app-shell-nav"),
    pageWidth: await width(page, "m7-group-logs-page")
  });

  await page.setViewportSize({ width: 320, height: 900 });
  await openGroupLogs(page);
  await expect(page.getByTestId("m7-group-logs-page")).toBeVisible();
  await expect(page.locator(".uz-glog-card").first()).toBeVisible();
  const metrics = await mobileMetrics(page);
  expect(metrics.bodyScrollWidth).toBeLessThanOrEqual(320);
  expect(metrics.documentScrollWidth).toBeLessThanOrEqual(320);
  expect(metrics.pageWidth).toBeLessThanOrEqual(320);
  writeJson("react-group-logs-mobile-320-metrics.json", metrics);
  await page.screenshot({
    fullPage: true,
    path: `${outDir}/react-group-logs-mobile-320.png`
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

async function assertLayerNavigation(page: Page) {
  const nav = page.getByTestId("app-shell-nav");
  await expect
    .poll(async () => nav.locator(".uz-nav-group p").allTextContents())
    .toEqual(["总览", "平台", "治理"]);
  const visibleButtonLabels = await nav.locator("button").allTextContents();
  expect(visibleButtonLabels).toEqual(expect.arrayContaining(groupNav));
  expect(visibleButtonLabels.some((label) => tenantNav.includes(label))).toBe(false);
  const visibleSections = await nav.locator(".uz-nav-group p").allTextContents();
  expect(visibleSections).not.toEqual(
    expect.arrayContaining(["运营", "数据", "智能", "管理", "洞察"])
  );
}

async function expectLocalToast(page: Page, fragments: readonly string[]) {
  const toast = page.getByTestId("m7-group-logs-toast");
  await expect(toast).toHaveAttribute("role", "status");
  await expect(toast).toHaveAttribute("aria-live", "polite");
  for (const fragment of fragments) await expect(toast).toContainText(fragment);
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
  const colorBody = match?.[1];
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

async function desktopMetrics(page: Page) {
  return {
    activeModule: await page.getByTestId("m7-group-logs-active-module").textContent(),
    activePageId: await page
      .getByTestId("admin-shell")
      .getAttribute("data-active-page-id"),
    bodyScrollWidth: await page.evaluate(() => document.body.scrollWidth),
    cardRowCount: await page.locator(".uz-glog-card").count(),
    documentScrollWidth: await page.evaluate(
      () => document.documentElement.scrollWidth
    ),
    shellLevel: await page.getByTestId("admin-shell").getAttribute("data-shell-level"),
    sidebarExpandedWidth: await width(page, "app-shell-nav"),
    tableRowCount: await page.locator(".uz-glog-row").count(),
    tableWrapperWidth: await page
      .locator(".uz-glog-table-wrap")
      .evaluate((node) => Math.round((node as HTMLElement).offsetWidth)),
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
    pageWidth: await width(page, "m7-group-logs-page")
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

function writeMissingSources(missing: { kind: string; path: string }[]) {
  writeFileSync(
    `${outDir}/source-unavailable.md`,
    missing.map(({ kind, path }) => `${kind}: ${path}`).join("\n")
  );
}
