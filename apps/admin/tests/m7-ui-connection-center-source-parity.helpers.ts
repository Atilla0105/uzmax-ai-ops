import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { expect, type Locator, type Page } from "@playwright/test";

const artifactDir = "/tmp/uzmax-m7-ui-72-connection-center-source-parity-refresh";
const ownerHtml = "/Users/atilla/Downloads/运营塔台1.0.html";
export const ownerHtmlUrl = pathToFileURL(ownerHtml).toString();
const sourceFiles = {
  fixtures: "/Users/atilla/源码/unpacked 6/fixtures/groupPlatform.ts",
  navigation: "/Users/atilla/源码/unpacked 6/shell/navigation.ts",
  page: "/Users/atilla/源码/unpacked 6/pages/group/GroupConnectionPage.tsx",
  shell: "/Users/atilla/源码/unpacked 6/shell/AppShell.tsx"
};
export const groupLabels =
  "集团总览|模型/成本/风险|模板中心|连接中心|发布与验收|租户管理|集团日志".split("|");
const tenantLabels =
  "对话|工单|确认队列|客户资产|订单|知识与资源|评测中心|AI 成员|团队|配置|分析|日志".split(
    "|"
  );
export const groupSections = ["总览", "平台", "治理"];
const tenantSections = ["运营", "数据", "智能", "管理", "洞察"];
export const connectorNames = [
  "Telegram Bot",
  "Telegram Business",
  "订单 API",
  "导入兜底"
];
const runtimeLabels =
  "degraded|mock|read-only|browser-local only|synthetic health|no production connector change|no real connection test|no audit write".split(
    "|"
  );
const forbiddenVisibleTerms = [
  ...runtimeLabels,
  "synthetic test finished",
  "Synthetic",
  "mock enabled",
  "mock disabled"
];
const tenantChips = ["玉珠跨境美妆", "丝路数码", "天净家居", "白桦母婴"];

type RawConnectionMetrics = {
  activePageId?: string | null;
  actionButtonCount: number;
  actionButtonWidth: number;
  bodyText: string;
  bodyScrollWidth: number;
  boundaryText: string;
  cardCount: number;
  controlsWidth: number;
  documentScrollWidth: number;
  firstCardHeight: number;
  firstCardWidth: number;
  firstIconHeight: number;
  firstIconWidth: number;
  headerHeight: number;
  headerWidth: number;
  healthBadges: string[];
  listWidth: number;
  navButtonLabels: string[];
  navWidth: number;
  shellLevel?: string | null;
  sidebarCategories: string[];
  toggleCount: number;
  topbarHeight: number;
  viewportWidth: number;
};

mkdirSync(artifactDir, { recursive: true });

export async function saveShot(page: Page, name: string, fullPage = false) {
  await page.screenshot({ fullPage, path: `${artifactDir}/${name}` });
}

export function writeJson(name: string, value: unknown) {
  writeFileSync(`${artifactDir}/${name}`, `${JSON.stringify(value, null, 2)}\n`);
}

export async function openConnection(page: Page) {
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

export async function expectRuntimeBoundary(locator: Locator) {
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

export async function clickFirstVisibleText(page: Page, text: string) {
  const target = page.getByText(text, { exact: true }).first();
  try {
    await target.click({ timeout: 3000 });
  } catch {
    // The bundled owner HTML may already expose the target text without route click.
  }
}

export async function collectOwnerSourceSample(page: Page) {
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

export async function collectConnectionMetrics(page: Page) {
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
      boundaryText,
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

export function writeSourceMappingSummary() {
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
      labels:
        "Rows and local action feedback are source-shaped; runtime/write/test/audit boundaries are retained in hidden DOM/data/title/ARIA evidence.",
      subtitle: "Source 写审计 is adapted to operational 启停/测试 wording.",
      toggle: "React uses role=switch and page-local state."
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
    subtitle: bodyText.includes("集团级连接类型 · 启停/测试"),
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
    runtimeLabelsPresent: includesAll(raw.boundaryText, runtimeLabels),
    runtimeLabelsVisibleInBody: runtimeLabels.some((label) =>
      bodyText.toLowerCase().includes(label.toLowerCase())
    ),
    sourceLike,
    sourceLikeDefaultVisible: Object.values(sourceLike).every(Boolean),
    sourceLikeLocalActionVisible: includesAll(bodyText, [
      "复测已完成",
      "请查看最近错误与接入定级"
    ]),
    visibleBodyClean: forbiddenVisibleTerms.every(
      (term) => !bodyText.toLowerCase().includes(term.toLowerCase())
    ),
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
