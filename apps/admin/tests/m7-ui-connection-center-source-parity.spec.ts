import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { expect, test, type Page } from "@playwright/test";

const artifactDir = "/tmp/uzmax-m7-ui-72-connection-center-source-parity-refresh";
const ownerHtml = "/Users/atilla/Downloads/运营塔台1.0.html";
const sourceFiles = {
  fixtures: "/Users/atilla/源码/unpacked 6/fixtures/groupPlatform.ts",
  navigation: "/Users/atilla/源码/unpacked 6/shell/navigation.ts",
  page: "/Users/atilla/源码/unpacked 6/pages/group/GroupConnectionPage.tsx",
  shell: "/Users/atilla/源码/unpacked 6/shell/AppShell.tsx"
};
const groupLabels =
  "集团总览|模型/成本/风险|模板中心|连接中心|发布与验收|租户管理|集团日志".split("|");
const tenantLabels =
  "对话|工单|确认队列|客户资产|订单|知识与资源|评测中心|AI 成员|团队|配置|分析|日志".split(
    "|"
  );
const groupSections = ["总览", "平台", "治理"];
const tenantSections = ["运营", "数据", "智能", "管理", "洞察"];
const connectorNames = ["Telegram Bot", "Telegram Business", "订单 API", "导入兜底"];
const runtimeLabels =
  "degraded|mock|read-only|browser-local only|synthetic health|no production connector change|no real connection test|no audit write".split(
    "|"
  );
const tenantChips = ["玉珠跨境美妆", "丝路数码", "天净家居", "白桦母婴"];

// prettier-ignore
type RawConnectionMetrics = { activePageId?: string | null; actionButtonCount: number; actionButtonWidth: number; bodyText: string; bodyScrollWidth: number; cardCount: number; controlsWidth: number; documentScrollWidth: number; firstCardHeight: number; firstCardWidth: number; firstIconHeight: number; firstIconWidth: number; headerHeight: number; headerWidth: number; healthBadges: string[]; listWidth: number; navButtonLabels: string[]; navWidth: number; shellLevel?: string | null; sidebarCategories: string[]; toggleCount: number; topbarHeight: number; viewportWidth: number };

mkdirSync(artifactDir, { recursive: true });

test.beforeEach(async ({ page }) => {
  await page.route("**/conversation-ticket/conversations", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
  await page.route("**/confirmation-queue/items?status=pending", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
});

test("captures group.connections source parity evidence on latest visible stack", async ({
  page
}) => {
  const sourceMapping = writeSourceMappingSummary();
  expect(Object.values(sourceMapping.anatomy)).not.toContain(false);

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(pathToFileURL(ownerHtml).toString());
  await page.waitForLoadState("domcontentloaded");
  await clickFirstVisibleText(page, "集团");
  await clickFirstVisibleText(page, "连接中心");
  const ownerSource = await collectOwnerSourceSample(page);
  expect(ownerSource.bodyTextLength).toBeGreaterThan(100);
  expect(ownerSource.contains.connectionCenter).toBe(true);
  await saveShot(page, "owner-html-connection-center-source-sample.png");
  writeJson("owner-html-connection-center-source-dom-sample.json", ownerSource);

  await page.goto("/design");
  await openConnection(page);
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "group"
  );
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "group.connections"
  );
  await expect(page.getByTestId("page-outlet")).not.toHaveAttribute("data-tenant-id");
  await expect(page.getByRole("heading", { name: "连接中心" })).toBeVisible();
  await expect(page.getByText("集团级连接类型 · 启停/测试本地预览")).toBeVisible();
  for (const label of runtimeLabels)
    await expect(page.getByTestId("m7-connection-runtime-note")).toContainText(label);
  await expect(page.locator(".uz-connection-card")).toHaveCount(4);
  for (const name of connectorNames)
    await expect(page.locator(".uz-connection-list")).toContainText(name);
  const bot = page.getByTestId("m7-connection-card-SYN-CONN-tgbot");
  await expect(bot.locator(".uz-status-badge").first()).toHaveText("正常");
  await expect(bot).toContainText("Bot webhook 接入 · 自动/草稿双模");
  await expect(bot).toContainText("4 个租户");
  await expect(bot).toContainText("接入定级：标准接入");
  await expect(bot).toContainText("最近错误：无");
  await expect(bot).toContainText("已启用");
  const business = page.getByTestId("m7-connection-card-SYN-CONN-tgbiz");
  await expect(business.locator(".uz-status-badge").first()).toHaveText("部分可行");
  await expect(business).toContainText("ADR-B01 · 部分可行");
  const order = page.getByTestId("m7-connection-card-SYN-CONN-orderapi");
  await expect(order.locator(".uz-status-badge").first()).toHaveText("不可用");
  await expect(order).toContainText("ADR-B02 · 无可用 API");
  await expect(order).toContainText("已停用");
  for (const name of connectorNames)
    await expect(
      page.getByRole("switch", {
        exact: true,
        name: `${name} browser-local enabled preview`
      })
    ).toHaveCount(1);
  await expect(page.locator("[data-testid^='m7-connection-test-']")).toHaveCount(4);
  await expect(page.locator(".uz-connection-icon").first()).toHaveJSProperty(
    "offsetWidth",
    40
  );

  const desktopMetrics = await collectConnectionMetrics(page);
  expect(desktopMetrics.shellLevel).toBe("group");
  expect(desktopMetrics.activePageId).toBe("group.connections");
  expect(desktopMetrics.navWidth).toBe(232);
  expect(desktopMetrics.topbarHeight).toBeGreaterThanOrEqual(52);
  expect(desktopMetrics.topbarHeight).toBeLessThanOrEqual(53);
  expect(desktopMetrics.sidebarCategories).toEqual(groupSections);
  expect(desktopMetrics.groupButtonCount).toBe(groupLabels.length);
  expect(desktopMetrics.tenantButtonCount).toBe(0);
  expect(desktopMetrics.tenantCategoryCount).toBe(0);
  expect(desktopMetrics.runtimeLabelsVisible).toBe(true);
  expect(desktopMetrics.sourceLikeDefaultVisible).toBe(true);
  expect(desktopMetrics.bodyScrollWidth).toBeLessThanOrEqual(1440);
  expect(desktopMetrics.documentScrollWidth).toBeLessThanOrEqual(1440);
  await saveShot(page, "react-connection-center-desktop.png", true);

  await page.getByTestId("m7-connection-toggle-SYN-CONN-orderapi").click();
  await expect(order).toContainText("已启用");
  await expect(page.getByTestId("m7-connection-toast")).toContainText(
    "browser-local only"
  );
  await expect(page.getByTestId("m7-connection-toast")).toContainText(
    "no production connector change"
  );
  await page.getByTestId("m7-connection-test-SYN-CONN-tgbiz").click();
  await expect(page.getByTestId("m7-connection-test-SYN-CONN-tgbiz")).toContainText(
    "测试中"
  );
  await expect(page.getByTestId("m7-connection-toast")).toContainText("复测完成");
  await expect(page.getByTestId("m7-connection-toast")).toContainText(
    "synthetic test finished"
  );
  await expect(page.getByTestId("m7-connection-toast")).toContainText(
    "no real connection test"
  );
  await expect(page.getByTestId("m7-connection-toast")).toContainText("no audit write");
  const actionMetrics = await collectConnectionMetrics(page);
  expect(actionMetrics.sourceLikeLocalActionVisible).toBe(true);
  await saveShot(page, "react-connection-center-local-actions.png", true);

  await page.getByRole("button", { name: "Collapse navigation" }).click();
  await expect(page.getByTestId("admin-shell")).toHaveClass(/is-nav-collapsed/);
  const collapsedMetrics = await collectConnectionMetrics(page);
  expect(collapsedMetrics.navWidth).toBe(68);
  expect(collapsedMetrics.sidebarCategories).toEqual(groupSections);
  expect(collapsedMetrics.tenantButtonCount).toBe(0);
  expect(collapsedMetrics.tenantCategoryCount).toBe(0);
  expect(collapsedMetrics.bodyScrollWidth).toBeLessThanOrEqual(1440);
  expect(collapsedMetrics.documentScrollWidth).toBeLessThanOrEqual(1440);
  await saveShot(page, "react-connection-center-collapsed.png", true);

  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/design");
  await openConnection(page);
  const mobileMetrics = await collectConnectionMetrics(page);
  expect(mobileMetrics.shellLevel).toBe("group");
  expect(mobileMetrics.activePageId).toBe("group.connections");
  expect(mobileMetrics.bodyScrollWidth).toBeLessThanOrEqual(320);
  expect(mobileMetrics.documentScrollWidth).toBeLessThanOrEqual(320);
  expect(mobileMetrics.mobileReadable).toBe(true);
  expect(mobileMetrics.sidebarCategories).toEqual(groupSections);
  expect(mobileMetrics.tenantButtonCount).toBe(0);
  expect(mobileMetrics.tenantCategoryCount).toBe(0);
  await saveShot(page, "react-connection-center-mobile-320.png", true);

  writeJson("metrics.json", {
    actions: actionMetrics,
    collapsed: collapsedMetrics,
    desktop: desktopMetrics,
    mobile: mobileMetrics
  });
});

async function saveShot(page: Page, name: string, fullPage = false) {
  await page.screenshot({ fullPage, path: `${artifactDir}/${name}` });
}

function writeJson(name: string, value: unknown) {
  writeFileSync(`${artifactDir}/${name}`, `${JSON.stringify(value, null, 2)}\n`);
}

async function openConnection(page: Page) {
  await page
    .getByTestId("app-shell-nav")
    .getByRole("button", { exact: true, name: "连接中心" })
    .click();
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "group.connections"
  );
  await expect(page.getByTestId("m7-connection-page")).toBeVisible();
}

async function clickFirstVisibleText(page: Page, text: string) {
  const target = page.getByText(text, { exact: true }).first();
  try {
    await target.click({ timeout: 3000 });
  } catch {
    // The bundled owner HTML may already expose the target text without route click.
  }
}

async function collectOwnerSourceSample(page: Page) {
  return page.evaluate(() => {
    const text = document.body.innerText;
    const contains = (needle: string) => text.includes(needle);
    return {
      bodyTextLength: text.length,
      contains: {
        connectionCenter: contains("连接中心"),
        connectors: ["Telegram Bot", "Telegram Business", "订单 API", "导入兜底"].every(
          (label) => contains(label)
        ),
        subtitle: contains("集团级连接类型"),
        testAction: contains("测试连接")
      },
      sample: text.replace(/\s+/g, " ").trim().slice(0, 900),
      title: document.title
    };
  });
}

async function collectConnectionMetrics(page: Page) {
  const raw = await page.evaluate<RawConnectionMetrics>(() => {
    const roundRect = (selector: string) => {
      const element = document.querySelector(selector);
      if (!element) return { height: 0, width: 0 };
      const rect = element.getBoundingClientRect();
      return {
        height: Math.round(rect.height),
        width: Math.round(rect.width)
      };
    };
    const nav = document.querySelector('[data-testid="app-shell-nav"]');
    const bodyText = document.body.innerText;
    const sidebarCategories = Array.from(
      nav?.querySelectorAll(".uz-nav-group p") ?? []
    ).map((node) => (node.textContent ?? "").trim());
    const navButtonLabels = Array.from(nav?.querySelectorAll("button") ?? []).map(
      (node) => (node.textContent ?? "").trim()
    );
    const header = roundRect(".uz-connection-head");
    const list = roundRect(".uz-connection-list");
    const firstCard = roundRect(".uz-connection-card");
    const firstIcon = roundRect(".uz-connection-icon");
    const controls = roundRect(".uz-connection-controls");
    const action = roundRect(".uz-connection-action");
    const topbar = roundRect(".uz-topbar");
    return {
      activePageId: document
        .querySelector('[data-testid="admin-shell"]')
        ?.getAttribute("data-active-page-id"),
      actionButtonCount: document.querySelectorAll(".uz-connection-action").length,
      actionButtonWidth: action.width,
      bodyText,
      bodyScrollWidth: document.body.scrollWidth,
      cardCount: document.querySelectorAll(".uz-connection-card").length,
      controlsWidth: controls.width,
      documentScrollWidth: document.documentElement.scrollWidth,
      firstCardHeight: firstCard.height,
      firstCardWidth: firstCard.width,
      firstIconHeight: firstIcon.height,
      firstIconWidth: firstIcon.width,
      headerHeight: header.height,
      headerWidth: header.width,
      healthBadges: Array.from(
        document.querySelectorAll(".uz-connection-card .uz-status-badge")
      ).map((node) => (node.textContent ?? "").trim()),
      listWidth: list.width,
      navButtonLabels,
      navWidth: roundRect('[data-testid="app-shell-nav"]').width,
      shellLevel: document
        .querySelector('[data-testid="admin-shell"]')
        ?.getAttribute("data-shell-level"),
      sidebarCategories,
      toggleCount: document.querySelectorAll("[data-testid^='m7-connection-toggle-']")
        .length,
      topbarHeight: topbar.height,
      viewportWidth: window.innerWidth
    };
  });
  return buildConnectionMetrics(raw);
}

function buildConnectionMetrics(raw: RawConnectionMetrics) {
  const bodyText = raw.bodyText;
  const navButtonLabels = raw.navButtonLabels;
  const sourceLike = {
    adrBadge: includesAll(bodyText, ["ADR-B01 · 部分可行", "ADR-B02 · 无可用 API"]),
    description: includesAll(bodyText, [
      "Bot webhook 接入 · 自动/草稿双模",
      "Business 账号 · 人工外部回复同步",
      "实时订单查询 · 主路径已降级为导入兜底",
      "CSV / Excel 批量导入 · 快照查询"
    ]),
    healthBadge: includesAll(raw.healthBadges.join("|"), [
      "正常",
      "部分可行",
      "不可用"
    ]),
    iconBlock: hasExactBox(raw.firstIconWidth, raw.firstIconHeight, 40, 40),
    recentError: includesAll(bodyText, [
      "最近错误：无",
      "最近错误：账号 B 绑定失败 · 2小时前",
      "最近错误：AllProvidersDown · 22分钟前"
    ]),
    rowCount: raw.cardCount === 4,
    spikeClassification: includesAll(bodyText, [
      "接入定级：标准接入",
      "接入定级：ADR-B01：部分可行",
      "接入定级：ADR-B02：无可用 API"
    ]),
    subtitle: bodyText.includes("集团级连接类型 · 启停/测试本地预览"),
    tenantChips: tenantChips.every((label) => bodyText.includes(label)),
    tenantCount: includesAll(bodyText, ["4 个租户", "2 个租户", "1 个租户"]),
    testAction: raw.actionButtonCount === 4,
    title: bodyText.includes("连接中心"),
    toggle: raw.toggleCount === 4
  };
  return {
    ...raw,
    bodyText: undefined,
    groupButtonCount: groupLabels.filter((label) => navButtonLabels.includes(label))
      .length,
    mobileReadable:
      includesAll(bodyText, ["连接中心", "Telegram Bot", "测试连接"]) &&
      hasBox(raw.firstCardWidth, raw.firstCardHeight) &&
      raw.firstCardWidth <= raw.viewportWidth,
    navButtonLabels: undefined,
    pageVisible: hasBox(raw.headerWidth, raw.headerHeight),
    runtimeLabelsVisible: includesAll(bodyText, runtimeLabels),
    sourceLike,
    sourceLikeDefaultVisible: Object.values(sourceLike).every(Boolean),
    sourceLikeLocalActionVisible: includesAll(bodyText, [
      "复测完成",
      "synthetic test finished",
      "no production connector change",
      "no real connection test",
      "no audit write"
    ]),
    tenantButtonCount: tenantLabels.filter((label) => navButtonLabels.includes(label))
      .length,
    tenantCategoryCount: tenantSections.filter((label) =>
      raw.sidebarCategories.includes(label)
    ).length
  };
}

function includesAll(text: string, labels: readonly string[]) {
  return labels.every((label) => text.includes(label));
}

function hasBox(width: number, height: number) {
  return width > 0 && height > 0;
}

function hasExactBox(
  width: number,
  height: number,
  expectedWidth: number,
  expectedHeight: number
) {
  return width === expectedWidth && height === expectedHeight;
}

function writeSourceMappingSummary() {
  const sources: Record<keyof typeof sourceFiles, string> = {
    fixtures: readFileSync(sourceFiles.fixtures, "utf8"),
    navigation: readFileSync(sourceFiles.navigation, "utf8"),
    page: readFileSync(sourceFiles.page, "utf8"),
    shell: readFileSync(sourceFiles.shell, "utf8")
  };
  const page = sources.page;
  const fixtures = sources.fixtures;
  const sourceText = `${page}\n${fixtures}`;
  const mapping = {
    anatomy: {
      adrBadge: includesAll(page, ["c.adr", "c.adrVerdict"]),
      cards: includesAll(page, ["CONN_DEFS.map", "maxWidth: 820"]),
      description: page.includes("c.desc"),
      groupRoute:
        includesAll(sources.navigation, ["GROUP_NAV", "g_conn", "连接中心"]) &&
        sources.shell.includes("GROUP_NAV"),
      healthBadge: includesAll(page, ["CONN_HEALTH", "c.health"]),
      iconBlock: includesAll(page, ["width: 40", "height: 40", "ICONS[c.icon]"]),
      localToast: includesAll(page, ["复测完成", "setToast"]),
      recentError: page.includes("最近错误"),
      spikeClassification: page.includes("接入定级"),
      subtitle: page.includes("集团级连接类型 · 启停/测试写审计"),
      tenantChips: page.includes("tenantList.map"),
      tenantCount: page.includes("c.tenants"),
      testAction: page.includes("测试连接"),
      title: page.includes("连接中心"),
      toggle: page.includes("<Toggle")
    },
    boundaryAdaptation: {
      labels: "Rows are source-shaped; runtime note/toasts carry safety boundaries.",
      subtitle: "Source 写审计 is adapted to local-only/no-audit wording.",
      toggle: "React uses role=switch and browser-local state."
    },
    connectorNames: connectorNames.filter((label) => sourceText.includes(label)),
    filesRead: Object.values(sourceFiles),
    fixtureTerms: ["CONN_HEALTH", "ConnDef", "CONN_DEFS"].filter((term) =>
      fixtures.includes(term)
    ),
    sourceValues: {
      health: "正常|部分可行|不可用"
        .split("|")
        .filter((label) => sourceText.includes(label)),
      spike: "标准接入|ADR-B01：部分可行|ADR-B02：无可用 API"
        .split("|")
        .filter((label) => sourceText.includes(label)),
      tenants: "4 个租户|2 个租户|1 个租户"
        .split("|")
        .filter((label) => sourceText.includes(label))
    },
    tenantChips: tenantChips.filter((label) => fixtures.includes(label))
  };
  writeJson("unpacked-connection-center-source-mapping.json", mapping);
  return mapping;
}
