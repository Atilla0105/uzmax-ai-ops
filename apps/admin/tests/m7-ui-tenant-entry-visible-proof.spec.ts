import { mkdirSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { expect, test, type Page } from "@playwright/test";

const artifactDir = "/tmp/uzmax-m7-ui-62b-tenant-entry-visible-proof";
const ownerHtml = "/Users/atilla/Downloads/运营塔台1.0.html";
const groupSections = ["总览", "平台", "治理"];
const tenantSections = ["运营", "数据", "智能", "管理", "洞察"];
const groupLabels =
  "集团总览|模型/成本/风险|模板中心|连接中心|发布与验收|租户管理|集团日志".split("|");
const tenantLabels =
  "对话|工单|确认队列|客户资产|订单|知识与资源|评测中心|AI 成员|团队|配置|分析|日志".split(
    "|"
  );

mkdirSync(artifactDir, { recursive: true });

test.beforeEach(async ({ page }) => {
  await page.route("**/conversation-ticket/conversations", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
});

test("proves group overview to tenant conversation visible loop", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 840 });
  await page.goto(pathToFileURL(ownerHtml).toString());
  await page.waitForLoadState("domcontentloaded");
  const ownerSource = await collectOwnerSourceSample(page);
  expect(ownerSource.bodyTextLength).toBeGreaterThan(100);
  await page.screenshot({
    fullPage: false,
    path: `${artifactDir}/owner-html-source-sample.png`
  });
  writeFileSync(
    `${artifactDir}/owner-html-source-dom-sample.json`,
    `${JSON.stringify(ownerSource, null, 2)}\n`
  );

  await page.goto("/design");

  await expectRoute(page, "group", "group.overview");
  await expect(page.getByTestId("page-outlet")).toHaveAttribute(
    "data-page-id",
    "group.overview"
  );
  await expect(page.getByTestId("m7-group-overview-page")).toBeVisible();
  await expectLayerNav(page, groupSections, tenantSections, groupLabels, tenantLabels);
  await expectTopbar(page, "玉珠跨境美妆");

  const groupMetrics = await collectMetrics(page);
  expect(groupMetrics.shellLevel).toBe("group");
  expect(groupMetrics.activePageId).toBe("group.overview");
  expect(groupMetrics.navWidth).toBe(232);
  expect(groupMetrics.bodyScrollWidth).toBeLessThanOrEqual(1280);
  await page.screenshot({
    fullPage: false,
    path: `${artifactDir}/react-group-overview.png`
  });

  await page.getByTestId("m7-group-enter-tenant-tenant-a").click();
  await expectRoute(page, "tenant", "tenant.conversations");
  await expect(page.getByTestId("page-outlet")).toHaveAttribute(
    "data-tenant-id",
    "tenant-a"
  );
  await expect(page.getByTestId("m7-conversation-workbench-page")).toBeVisible();
  await expectLayerNav(page, tenantSections, groupSections, tenantLabels, groupLabels);
  await expectTopbar(page, "玉珠跨境美妆");

  const tenantMetrics = await collectMetrics(page);
  expect(tenantMetrics.shellLevel).toBe("tenant");
  expect(tenantMetrics.activePageId).toBe("tenant.conversations");
  expect(tenantMetrics.navWidth).toBe(232);
  expect(tenantMetrics.conversationVisible).toBe(true);
  expect(tenantMetrics.bodyScrollWidth).toBeLessThanOrEqual(1280);
  await page.screenshot({
    fullPage: false,
    path: `${artifactDir}/react-tenant-conversations.png`
  });

  await page.getByRole("button", { name: "Collapse navigation" }).click();
  await expect(page.getByTestId("admin-shell")).toHaveClass(/is-nav-collapsed/);
  const collapsedMetrics = await collectMetrics(page);
  expect(collapsedMetrics.navWidth).toBe(68);
  expect(collapsedMetrics.navIconCount).toBe(12);
  expect(collapsedMetrics.collapsedLabelsHidden).toBe(true);
  await page.screenshot({
    fullPage: false,
    path: `${artifactDir}/react-tenant-collapsed.png`
  });

  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/design");
  await page.getByTestId("m7-group-enter-tenant-tenant-a").click();
  await expectRoute(page, "tenant", "tenant.conversations");
  await expect(page.getByTestId("m7-conversation-workbench-page")).toBeVisible();
  await expectTopbar(page, "玉珠跨境美妆");
  const mobileMetrics = await collectMetrics(page);
  expect(mobileMetrics.bodyScrollWidth).toBeLessThanOrEqual(320);
  expect(mobileMetrics.shellWidth).toBeLessThanOrEqual(320);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-tenant-mobile-320.png`
  });

  writeFileSync(
    `${artifactDir}/react-tenant-entry-visible-proof-metrics.json`,
    `${JSON.stringify(
      {
        collapsed: collapsedMetrics,
        group: groupMetrics,
        mobile: mobileMetrics,
        tenant: tenantMetrics
      },
      null,
      2
    )}\n`
  );
});

async function expectRoute(page: Page, level: "group" | "tenant", pageId: string) {
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    level
  );
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    pageId
  );
}

async function expectTopbar(page: Page, tenantName: string) {
  const topbar = page.locator(".uz-topbar");
  await expect(page.getByTestId("route-breadcrumb")).toContainText("集团");
  await expect(page.getByTestId("route-breadcrumb")).toContainText(tenantName);
  await expect(topbar.getByLabel("Search")).toHaveAttribute(
    "placeholder",
    "搜索会话、客户、订单、工单、知识..."
  );
  await expect(page.getByTestId("environment-marker")).toContainText("PRODUCTION");
  await expect(page.getByTestId("system-heartbeat")).toContainText("68ms");
  await expect(page.getByRole("button", { name: "User menu" })).toContainText("韩雪");
}

async function expectLayerNav(
  page: Page,
  visibleSectionLabels: readonly string[],
  hiddenSectionLabels: readonly string[],
  visibleLabels: readonly string[],
  hiddenLabels: readonly string[]
) {
  const nav = page.getByTestId("app-shell-nav");
  await expect
    .poll(() => nav.locator(".uz-nav-group p").allTextContents())
    .toEqual(visibleSectionLabels);

  for (const label of hiddenSectionLabels) {
    await expect(nav.locator(".uz-nav-group p", { hasText: label })).toHaveCount(0);
  }
  for (const label of visibleLabels) {
    await expect(nav.getByRole("button", { name: label, exact: true })).toBeVisible();
  }
  for (const label of hiddenLabels) {
    await expect(nav.getByRole("button", { name: label, exact: true })).toHaveCount(0);
  }
}

async function collectOwnerSourceSample(page: Page) {
  return page.evaluate(() => {
    const text = document.body.innerText;
    const contains = (needle: string) => text.includes(needle);
    return {
      bodyTextLength: text.length,
      contains: {
        group: contains("集团"),
        production: contains("PRODUCTION"),
        tenant: contains("玉珠跨境美妆")
      },
      sample: text.replace(/\s+/g, " ").trim().slice(0, 600),
      title: document.title
    };
  });
}

async function collectMetrics(page: Page) {
  return page.evaluate(() => {
    const roundWidth = (selector: string) => {
      const element = document.querySelector(selector);
      return element ? Math.round(element.getBoundingClientRect().width) : 0;
    };
    const roundHeight = (selector: string) => {
      const element = document.querySelector(selector);
      return element ? Math.round(element.getBoundingClientRect().height) : 0;
    };
    const nav = document.querySelector('[data-testid="app-shell-nav"]');
    return {
      activePageId: document
        .querySelector('[data-testid="admin-shell"]')
        ?.getAttribute("data-active-page-id"),
      bodyScrollWidth: document.body.scrollWidth,
      collapsedLabelsHidden:
        nav?.querySelectorAll(".uz-nav-item__label").length === 0 &&
        Array.from(nav?.querySelectorAll(".uz-nav-group p") ?? []).every(
          (label) => getComputedStyle(label).opacity === "0"
        ),
      conversationVisible:
        document.querySelector('[data-testid="m7-conversation-workbench-page"]') !==
        null,
      navIconCount: nav?.querySelectorAll(".uz-nav-item svg").length ?? 0,
      navWidth: roundWidth('[data-testid="app-shell-nav"]'),
      searchVisible: document.querySelector(".uz-global-search input") !== null,
      shellLevel: document
        .querySelector('[data-testid="admin-shell"]')
        ?.getAttribute("data-shell-level"),
      shellWidth: roundWidth('[data-testid="admin-shell"]'),
      topbarHeight: roundHeight(".uz-topbar")
    };
  });
}
