import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { expect, test, type Page } from "@playwright/test";

const artifactDir = "/tmp/uzmax-m7-ui-73-tenant-management-source-parity-refresh";
const ownerHtml = "/Users/atilla/Downloads/运营塔台1.0.html";
const sourceFiles = {
  fixtures: "/Users/atilla/源码/unpacked 6/fixtures/groupPlatform.ts",
  navigation: "/Users/atilla/源码/unpacked 6/shell/navigation.ts",
  page: "/Users/atilla/源码/unpacked 6/pages/group/GroupTenantPage.tsx"
};
const groupLabels =
  "集团总览|模型/成本/风险|模板中心|连接中心|发布与验收|租户管理|集团日志".split("|");
const tenantLabels =
  "对话|工单|确认队列|客户资产|订单|知识与资源|评测中心|AI 成员|团队|配置|分析|日志".split(
    "|"
  );
const groupSections = ["总览", "平台", "治理"];
const tenantSections = ["运营", "数据", "智能", "管理", "洞察"];
const tenantNames = ["玉珠跨境美妆", "丝路数码", "天净家居", "白桦母婴"];
const runtimeLabels =
  "degraded|mock|read-only|browser-local only|synthetic tenant metrics|no production tenant change|no tenant config persistence|no connector or feature flag change|no audit write".split(
    "|"
  );
const visibleMockPollution = [
  "mock 运行中",
  "mock 降级",
  "mock 需人工",
  "mock 已停用",
  "mock 成员",
  "mock AI",
  "mock 连接",
  "mock 已启用"
];

// prettier-ignore
type RawTenantMetrics = { activePageId?: string | null; actionWidth: number; bodyScrollWidth: number; bodyText: string; capabilityRows: number; cardCount: number; confirmModalHeight: number; confirmModalWidth: number; documentScrollWidth: number; drawerHeight: number; drawerWidth: number; firstCardHeight: number; firstCardWidth: number; gridWidth: number; hasTenantId: boolean; headerHeight: number; headerWidth: number; languageSelectWidth: number; navButtonLabels: string[]; navWidth: number; shellLevel?: string | null; sidebarCategories: string[]; statusBadges: string[]; timezoneSelectWidth: number; toastText: string; topbarHeight: number; viewportWidth: number; visibleText: string };

mkdirSync(artifactDir, { recursive: true });

test.beforeEach(async ({ page }) => {
  await page.route("**/conversation-ticket/conversations", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
  await page.route("**/confirmation-queue/items?status=pending", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
});

test("captures group.tenants source parity evidence on latest visible stack", async ({
  page
}) => {
  const sourceMapping = writeSourceMappingSummary();
  expect(Object.values(sourceMapping.anatomy)).not.toContain(false);

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(pathToFileURL(ownerHtml).toString());
  await page.waitForLoadState("domcontentloaded");
  await clickFirstVisibleText(page, "集团");
  await clickFirstVisibleText(page, "租户管理");
  const ownerSource = await collectOwnerSourceSample(page);
  expect(ownerSource.contains.tenantManagement).toBe(true);
  await saveShot(page, "owner-html-tenant-management-source-sample.png");
  writeJson("owner-html-tenant-management-source-dom-sample.json", ownerSource);

  await page.goto("/design");
  await openTenants(page);
  const firstCard = page.getByTestId("m7-tenant-card-SYN-TENANT-t1");

  const desktopMetrics = await collectTenantMetrics(page);
  expect(desktopMetrics.shellLevel).toBe("group");
  expect(desktopMetrics.activePageId).toBe("group.tenants");
  expect(desktopMetrics.hasTenantId).toBe(false);
  expect(desktopMetrics.navWidth).toBe(232);
  expect(desktopMetrics.topbarHeight).toBeGreaterThanOrEqual(52);
  expect(desktopMetrics.topbarHeight).toBeLessThanOrEqual(53);
  expect(desktopMetrics.sidebarCategories).toEqual(groupSections);
  expect(desktopMetrics.groupButtonCount).toBe(groupLabels.length);
  expect(desktopMetrics.tenantButtonCount).toBe(0);
  expect(desktopMetrics.tenantCategoryCount).toBe(0);
  expect(desktopMetrics.runtimeLabelsVisible).toBe(true);
  expect(desktopMetrics.sourceLikeDefaultVisible).toBe(true);
  expect(desktopMetrics.visiblePrimaryValuesClean).toBe(true);
  expect(desktopMetrics.bodyScrollWidth).toBeLessThanOrEqual(1440);
  expect(desktopMetrics.documentScrollWidth).toBeLessThanOrEqual(1440);
  await saveShot(page, "react-tenant-management-desktop.png", true);

  await firstCard.click();
  const drawer = page.getByTestId("m7-tenant-drawer");
  await expect(drawer).toBeVisible();
  const drawerMetrics = await collectTenantMetrics(page);
  expect(drawerMetrics.sourceLikeDrawerVisible).toBe(true);
  expect(drawerMetrics.visiblePrimaryValuesClean).toBe(true);
  await saveShot(page, "react-tenant-management-drawer.png", true);

  await page.getByTestId("m7-tenant-language").selectOption("中文");
  await expectLocalToast(page, [
    "默认语言 -> 中文",
    "no production tenant change",
    "no tenant config persistence",
    "no audit write"
  ]);
  await page.getByTestId("m7-tenant-timezone").selectOption("UTC+8 北京");
  await expectLocalToast(page, ["默认时区 -> UTC+8 北京", "no audit write"]);
  await page.getByTestId("m7-tenant-cap-orderApi").click();
  await expectLocalToast(page, [
    "订单 API enabled",
    "no connector or feature flag change",
    "no audit write"
  ]);

  await page.getByTestId("m7-tenant-disable").click();
  await expect(page.getByTestId("m7-tenant-drawer")).toHaveCount(0);
  const modal = page.getByTestId("m7-confirm-modal");
  await expect(modal).toContainText("停用租户");
  await expect(modal.getByRole("button", { name: "确认停用" })).toBeDisabled();
  await modal
    .getByPlaceholder("必填；仅用于 browser-local 预览，不写生产审计")
    .fill("source parity local reason");
  await expect(modal.getByRole("button", { name: "确认停用" })).toBeEnabled();
  const confirmMetrics = await collectTenantMetrics(page);
  expect(confirmMetrics.sourceLikeConfirmVisible).toBe(true);
  await saveShot(page, "react-tenant-management-local-action-confirm.png", true);

  await modal.getByRole("button", { name: "确认停用" }).click();
  await expect(page.getByTestId("m7-tenant-disabled-note")).toContainText(
    "source parity local reason"
  );
  await expectLocalToast(page, [
    "disabled in browser state",
    "no production tenant change",
    "no audit write"
  ]);
  await page.getByTestId("m7-tenant-restore").click();
  await expect(page.getByTestId("m7-tenant-disabled-note")).toHaveCount(0);
  await expectLocalToast(page, [
    "restored in browser state",
    "no production tenant change",
    "no audit write"
  ]);
  const actionMetrics = await collectTenantMetrics(page);
  expect(actionMetrics.sourceLikeLocalActionVisible).toBe(true);

  await page.getByRole("button", { name: "关闭租户管理抽屉" }).click();
  await page.getByRole("button", { name: "Collapse navigation" }).click();
  const collapsedMetrics = await collectTenantMetrics(page);
  expect(collapsedMetrics.navWidth).toBe(68);
  expect(collapsedMetrics.sidebarCategories).toEqual(groupSections);
  expect(collapsedMetrics.tenantButtonCount).toBe(0);
  expect(collapsedMetrics.tenantCategoryCount).toBe(0);
  expect(collapsedMetrics.bodyScrollWidth).toBeLessThanOrEqual(1440);
  expect(collapsedMetrics.documentScrollWidth).toBeLessThanOrEqual(1440);
  await saveShot(page, "react-tenant-management-collapsed-sidebar.png", true);

  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/design");
  await openTenants(page);
  await page.getByTestId("m7-tenant-card-SYN-TENANT-t1").click();
  const mobileMetrics = await collectTenantMetrics(page);
  expect(mobileMetrics.drawerWidth).toBeLessThanOrEqual(320);
  expect(mobileMetrics.bodyScrollWidth).toBeLessThanOrEqual(320);
  expect(mobileMetrics.documentScrollWidth).toBeLessThanOrEqual(320);
  expect(mobileMetrics.sidebarCategories).toEqual(groupSections);
  expect(mobileMetrics.tenantButtonCount).toBe(0);
  expect(mobileMetrics.tenantCategoryCount).toBe(0);
  await saveShot(page, "react-tenant-management-mobile-320.png", true);

  writeJson("metrics.json", {
    actions: actionMetrics,
    collapsed: collapsedMetrics,
    confirm: confirmMetrics,
    desktop: desktopMetrics,
    drawer: drawerMetrics,
    mobile: mobileMetrics
  });
});

test("keeps group.tenants forced URL states source-boundary deterministic", async ({
  page
}) => {
  for (const state of ["loading", "empty", "error", "permission", "degraded"]) {
    await page.setViewportSize({ width: 1280, height: 820 });
    await openTenants(page, `?state=${state}`);
    const target =
      state === "degraded"
        ? page.getByTestId("m7-tenant-runtime-note")
        : page.getByTestId(`m7-tenant-state-${state}`);
    await expect(target).toContainText("browser-local only");
    await expect(target).toContainText("no production tenant change");
    await expect(target).toContainText("no audit write");
    await expect(page.getByTestId("admin-shell")).toHaveAttribute(
      "data-shell-level",
      "group"
    );
    await expect(page.getByTestId("page-outlet")).not.toHaveAttribute("data-tenant-id");
  }
});

async function saveShot(page: Page, name: string, fullPage = false) {
  await page.screenshot({ fullPage, path: `${artifactDir}/${name}` });
}

function writeJson(name: string, value: unknown) {
  writeFileSync(`${artifactDir}/${name}`, `${JSON.stringify(value, null, 2)}\n`);
}

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
  await expect(page.getByTestId("m7-tenant-page")).toBeVisible();
}

async function clickFirstVisibleText(page: Page, text: string) {
  const target = page.getByText(text, { exact: true }).first();
  try {
    await target.click({ timeout: 3000 });
  } catch {
    // The bundled owner HTML may already expose the target text without route click.
  }
}

async function expectLocalToast(page: Page, labels: readonly string[]) {
  const toast = page.getByTestId("m7-tenant-toast");
  await expect(toast).toHaveAttribute("role", "status");
  for (const label of labels) await expect(toast).toContainText(label);
}

async function collectOwnerSourceSample(page: Page) {
  return page.evaluate(() => {
    const text = document.body.innerText;
    const contains = (needle: string) => text.includes(needle);
    // prettier-ignore
    return {
      bodyTextLength: text.length,
      contains: {
        capabilityRows: ["Telegram Bot", "Telegram Business", "订单 API"].every((label) => contains(label)),
        drawerFields: contains("默认语言") && contains("默认时区"),
        tenantManagement: contains("租户管理"),
        tenantNames: ["玉珠跨境美妆", "丝路数码", "天净家居", "白桦母婴"].every((label) => contains(label))
      },
      sample: text.replace(/\s+/g, " ").trim().slice(0, 900),
      title: document.title
    };
  });
}

async function collectTenantMetrics(page: Page) {
  const raw = await page.evaluate<RawTenantMetrics>(() => {
    const one = (selector: string) => document.querySelector(selector);
    const attr = (selector: string, name: string) => one(selector)?.getAttribute(name);
    const box = (selector: string) => {
      const rect = (one(selector) as HTMLElement | null)?.getBoundingClientRect();
      return {
        height: Math.round(rect?.height ?? 0),
        width: Math.round(rect?.width ?? 0)
      };
    };
    const texts = (selector: string) =>
      Array.from(document.querySelectorAll(selector)).map((node) =>
        (node.textContent ?? "").trim()
      );
    const clone = document.body.cloneNode(true) as HTMLElement;
    clone.querySelectorAll(".uz-tenant-sr-only").forEach((node) => node.remove());
    const header = box(".uz-tenant-head");
    const grid = box(".uz-tenant-grid");
    const firstCard = box(".uz-tenant-card");
    const drawer = box(".uz-tenant-drawer");
    const action = box(".uz-tenant-action");
    const language = box('[data-testid="m7-tenant-language"]');
    const timezone = box('[data-testid="m7-tenant-timezone"]');
    const confirm = box('[data-testid="m7-confirm-modal"] > div');
    const topbar = box(".uz-topbar");
    return {
      activePageId: attr('[data-testid="admin-shell"]', "data-active-page-id"),
      actionWidth: action.width,
      bodyScrollWidth: document.body.scrollWidth,
      bodyText: document.body.innerText,
      capabilityRows: document.querySelectorAll(".uz-tenant-cap").length,
      cardCount: document.querySelectorAll(".uz-tenant-card").length,
      confirmModalHeight: confirm.height,
      confirmModalWidth: confirm.width,
      documentScrollWidth: document.documentElement.scrollWidth,
      drawerHeight: drawer.height,
      drawerWidth: drawer.width,
      firstCardHeight: firstCard.height,
      firstCardWidth: firstCard.width,
      gridWidth: grid.width,
      hasTenantId: !!one('[data-testid="page-outlet"]')?.hasAttribute("data-tenant-id"),
      headerHeight: header.height,
      headerWidth: header.width,
      languageSelectWidth: language.width,
      navButtonLabels: texts('[data-testid="app-shell-nav"] button'),
      navWidth: box('[data-testid="app-shell-nav"]').width,
      shellLevel: attr('[data-testid="admin-shell"]', "data-shell-level"),
      sidebarCategories: texts('[data-testid="app-shell-nav"] .uz-nav-group p'),
      statusBadges: texts(".uz-tenant-card .uz-status-badge"),
      timezoneSelectWidth: timezone.width,
      toastText: one('[data-testid="m7-tenant-toast"]')?.textContent ?? "",
      topbarHeight: topbar.height,
      viewportWidth: window.innerWidth,
      visibleText: clone.textContent ?? ""
    };
  });
  return buildTenantMetrics(raw);
}

function buildTenantMetrics(raw: RawTenantMetrics) {
  const bodyText = raw.bodyText;
  const visibleText = raw.visibleText;
  const navButtonLabels = raw.navButtonLabels;
  // prettier-ignore
  const sourceLike = {
    capabilityRows: includesAll(visibleText, ["Telegram Bot", "Telegram Business", "订单 API", "已启用", "已停用"]),
    cardGrid: raw.cardCount === 4 && hasBox(raw.gridWidth, raw.firstCardHeight),
    disabledNote: includesAll(bodyText, ["已停用", "连续熔断超 24h"]),
    dotNameStatus: raw.statusBadges.some((badge) => badge.includes("运行中")) && includesAll(visibleText, tenantNames),
    drawer: raw.drawerWidth > 0 && includesAll(visibleText, ["默认语言", "默认时区", "来源模板：美妆标准包"]),
    lineTemplate: includesAll(visibleText, ["美妆 · 中亚", "美妆标准包", "3C · 俄语区", "3C 标准包"]),
    selects: raw.languageSelectWidth > 0 && raw.timezoneSelectWidth > 0,
    stats: includesAll(visibleText, ["成员 8", "AI 3", "连接 降级"]),
    subtitle: visibleText.includes("4 个租户 · 创建 / 停用仅本地预览"),
    title: visibleText.includes("租户管理")
  };
  return {
    ...raw,
    bodyText: undefined,
    groupButtonCount: groupLabels.filter((label) => navButtonLabels.includes(label))
      .length,
    mobileReadable:
      includesAll(visibleText, ["租户管理", "玉珠跨境美妆", "成员 8"]) &&
      hasBox(raw.firstCardWidth, raw.firstCardHeight) &&
      raw.firstCardWidth <= raw.viewportWidth,
    navButtonLabels: undefined,
    pageVisible: hasBox(raw.headerWidth, raw.headerHeight),
    runtimeLabelsVisible: includesAll(bodyText, runtimeLabels),
    sourceLike,
    sourceLikeConfirmVisible:
      raw.confirmModalWidth > 0 &&
      raw.confirmModalHeight > 0 &&
      includesAll(visibleText, ["停用租户", "停用原因", "确认停用"]),
    sourceLikeDefaultVisible: Object.values({
      cardGrid: sourceLike.cardGrid,
      dotNameStatus: sourceLike.dotNameStatus,
      lineTemplate: sourceLike.lineTemplate,
      stats: sourceLike.stats,
      subtitle: sourceLike.subtitle,
      title: sourceLike.title
    }).every(Boolean),
    sourceLikeDrawerVisible: Object.values({
      capabilityRows: sourceLike.capabilityRows,
      drawer: sourceLike.drawer,
      selects: sourceLike.selects
    }).every(Boolean),
    sourceLikeLocalActionVisible: includesAll(bodyText, [
      "restored in browser state",
      "no production tenant change",
      "no audit write"
    ]),
    tenantButtonCount: tenantLabels.filter((label) => navButtonLabels.includes(label))
      .length,
    tenantCategoryCount: tenantSections.filter((label) =>
      raw.sidebarCategories.includes(label)
    ).length,
    visiblePrimaryValuesClean: !visibleMockPollution.some((label) =>
      visibleText.includes(label)
    ),
    visibleText: undefined
  };
}

const includesAll = (text: string, labels: readonly string[]) =>
  labels.every((label) => text.includes(label));

const hasBox = (width: number, height: number) => width > 0 && height > 0;

function writeSourceMappingSummary() {
  const sources: Record<keyof typeof sourceFiles, string> = {
    fixtures: readFileSync(sourceFiles.fixtures, "utf8"),
    navigation: readFileSync(sourceFiles.navigation, "utf8"),
    page: readFileSync(sourceFiles.page, "utf8")
  };
  const page = sources.page;
  const fixtures = sources.fixtures;
  const sourceText = `${page}\n${fixtures}`;
  // prettier-ignore
  const anatomy = {
    capabilityRows: includesAll(page, ["CAP_LABELS", "Telegram Bot", "Telegram Business", "订单 API"]),
    cardGrid: includesAll(page, ["gridTemplateColumns", "repeat(auto-fill"]),
    confirmModal: includesAll(page, ["ConfirmModal", "停用租户", "确认停用"]),
    disabledNote: includesAll(page, ["managed.disabled", "已停用"]),
    drawer: includesAll(page, ["managed", "默认语言", "默认时区", "渠道能力"]),
    groupRoute: includesAll(sources.navigation, ["GROUP_NAV", "g_tenant", "租户管理"]) && !sources.navigation.includes("tenant.tenants"),
    lineTemplate: includesAll(page, ["t.line", "t.template"]),
    localActions: includesAll(page, ["showToast", "setTenants", "setDisableFor"]),
    selects: includesAll(page, ["managed.lang", "managed.tz"]),
    stats: includesAll(page, ["t.members", "t.ai", "t.conn"]),
    statusBadge: includesAll(page, ["TENANT_STATUS_COLORS", "t.status"]),
    titleSubtitle: includesAll(page, ["租户管理", "创建 / 停用写审计"])
  };
  const mapping = {
    anatomy,
    boundaryAdaptation: {
      disable:
        "Source audit-writing copy is adapted to browser-local/no-audit wording.",
      labels:
        "Primary row values are source-shaped; runtime note/toasts carry mock/degraded boundaries.",
      restore: "React restore mutates browser-local state only."
    },
    filesRead: Object.values(sourceFiles),
    fixtureTerms: ["GROUP_TENANTS", "TENANT_STATUS_COLORS", "GroupTenant"].filter(
      (term) => fixtures.includes(term)
    ),
    sourceValues: {
      capabilityLabels: ["Telegram Bot", "Telegram Business", "订单 API"].filter(
        (label) => sourceText.includes(label)
      ),
      statuses: ["运行中", "降级", "需人工", "已停用"].filter((label) =>
        sourceText.includes(label)
      ),
      tenants: tenantNames.filter((label) => sourceText.includes(label))
    }
  };
  writeJson("unpacked-tenant-management-source-mapping.json", mapping);
  return mapping;
}
