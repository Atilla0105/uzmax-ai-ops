import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { expect, test, type Page } from "@playwright/test";

const artifactDir = "/tmp/uzmax-m7-ui-53-team-page-cleanstack";
const ownerHtml = "/Users/atilla/Downloads/运营塔台1.0.html";
const sourcePaths = {
  fixture: "/Users/atilla/源码/unpacked 6/fixtures/team.ts",
  page: "/Users/atilla/源码/unpacked 6/pages/team/TeamPage.tsx"
} as const;
const groupLabels = [
  "集团总览",
  "模型/成本/风险",
  "模板中心",
  "连接中心",
  "发布与验收",
  "租户管理",
  "集团日志"
] as const;
const tenantLabels = [
  "对话",
  "工单",
  "确认队列",
  "客户资产",
  "订单",
  "知识与资源",
  "评测中心",
  "AI 成员",
  "团队",
  "配置",
  "分析",
  "日志"
] as const;
const teamPageEmptyApiRoutes = [
  "**/conversation-ticket/conversations",
  "**/confirmation-queue/items?status=pending"
] as const;

mkdirSync(artifactDir, { recursive: true });

test.beforeEach(async ({ page }) => {
  for (const apiRoute of teamPageEmptyApiRoutes) {
    await page.route(apiRoute, async (route) => {
      await route.fulfill({ json: { items: [] } });
    });
  }
});

test("samples owner source and renders tenant-only team page", async ({ page }) => {
  writeSourceSampling();
  await captureOwnerHtmlTeamSample(page);
  await openTeam(page);

  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "tenant"
  );
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.team"
  );
  await expect(page.getByTestId("page-outlet")).toHaveAttribute(
    "data-tenant-id",
    "tenant-b"
  );
  await expect(page.getByRole("heading", { name: "团队" })).toBeVisible();
  for (const label of [
    "degraded",
    "mock",
    "read-only",
    "browser-local only",
    "no production authz write",
    "no team mutation",
    "no invite email",
    "no Telegram binding change",
    "no audit write"
  ]) {
    await expect(page.getByTestId("m7-team-runtime-note")).toContainText(label);
  }
  await expectTenantOnlyNav(page);
  await expect(page.locator(".uz-team-row")).toHaveCount(3);
  for (const column of [
    "成员",
    "角色",
    "成员类型",
    "分组",
    "在线状态",
    "接待中",
    "今日累计",
    "最近登录"
  ]) {
    await expect(page.getByTestId("m7-team-members-table")).toContainText(column);
  }
  await expect(page.getByTestId("m7-team-member-row-m3")).toContainText("AI");
  await expect(page.getByTestId("m7-team-member-row-m2")).toContainText("权限拒绝");
  writeJson("react-team-desktop-metrics.json", await collectMetrics(page));
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-team-desktop.png`
  });
});

test("team is hidden from group nav until tenant selection", async ({ page }) => {
  await page.goto("/design");
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "group"
  );
  for (const label of groupLabels)
    await expect(page.getByRole("button", { exact: true, name: label })).toBeVisible();
  for (const label of tenantLabels)
    await expect(page.getByRole("button", { exact: true, name: label })).toHaveCount(0);
  await page.getByTestId("tenant-switcher").selectOption("tenant-b");
  await expectTenantOnlyNav(page);
});

test("search invite roles and member detail stay browser-local", async ({ page }) => {
  await openTeam(page);
  await page.getByTestId("m7-team-search").fill("no local row");
  await expect(page.getByTestId("m7-team-empty")).toContainText("无匹配成员");
  await page.getByTestId("m7-team-search").fill("");

  await page.getByTestId("m7-team-primary").click();
  await expect(page.getByTestId("m7-team-invite-modal")).toContainText("不发送邮件");
  await expect(page.getByTestId("m7-team-invite-send")).toBeDisabled();
  await page.getByTestId("m7-team-invite-name").fill("白玉");
  await page.getByTestId("m7-team-invite-email").fill("baiyu@local.io");
  await page.getByTestId("m7-team-invite-send").click();
  await expect(page.getByTestId("m7-team-toast")).toContainText(
    "invite preview added 白玉"
  );
  await expect(page.locator(".uz-team-row")).toHaveCount(4);

  await page.getByTestId("m7-team-tab-roles").click();
  await expect(page.getByTestId("m7-team-roles-table")).toContainText("权限拒绝");
  await page.getByTestId("m7-team-tab-members").click();
  await page.getByTestId("m7-team-member-row-m2").click();
  const drawer = page.getByTestId("m7-team-member-drawer");
  await expect(drawer).toContainText("权限拒绝 / 已停用");
  await page.getByTestId("m7-team-member-toggle-disable").click();
  await expect(page.getByTestId("m7-confirm-modal")).toContainText("恢复账号");
  await page.getByLabel("原因").fill("local restore reason");
  await page
    .getByTestId("m7-confirm-modal")
    .getByRole("button", { name: "恢复账号" })
    .click();
  await expect(page.getByTestId("m7-team-toast")).toContainText("restored member 李航");
});

test("forced states collapsed sidebar and 320px fallback stay bounded", async ({
  page
}) => {
  for (const state of ["loading", "empty", "error", "permission", "degraded"]) {
    await openTeam(page, `?m7TeamState=${state}`);
    const target =
      state === "degraded"
        ? page.getByTestId("m7-team-runtime-note")
        : page.getByTestId(`m7-team-state-${state}`);
    await expect(target).toContainText("browser-local only");
    await expect(target).toContainText("no production authz write");
  }

  await openTeam(page);
  await page.getByRole("button", { name: "Collapse navigation" }).click();
  writeJson("react-team-collapsed-metrics.json", await collectMetrics(page));
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-team-collapsed.png`
  });

  await page.setViewportSize({ width: 320, height: 900 });
  await openTeam(page);
  await expect(page.getByTestId("m7-team-mobile-member-list")).toBeVisible();
  await page.getByTestId("m7-team-member-card-m1").click();
  const mobile = await collectMetrics(page);
  expect(mobile.bodyScrollWidth).toBeLessThanOrEqual(320);
  expect(mobile.documentScrollWidth).toBeLessThanOrEqual(320);
  expect(mobile.pageWidth).toBeLessThanOrEqual(320);
  expect(mobile.drawerWidth).toBeLessThanOrEqual(320);
  writeJson("react-team-mobile-320-metrics.json", mobile);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-team-mobile-320.png`
  });
});

async function openTeam(page: Page, query = "") {
  await page.goto(`/design${query}`);
  await page.getByTestId("tenant-switcher").selectOption("tenant-b");
  await page
    .getByTestId("app-shell-nav")
    .getByRole("button", { exact: true, name: "团队" })
    .click();
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.team"
  );
}

async function expectTenantOnlyNav(page: Page) {
  const nav = page.getByTestId("app-shell-nav");
  for (const label of tenantLabels)
    await expect(nav.getByRole("button", { exact: true, name: label })).toBeVisible();
  for (const label of groupLabels)
    await expect(nav.getByRole("button", { exact: true, name: label })).toHaveCount(0);
}

async function collectMetrics(page: Page) {
  const drawer = page.getByTestId("m7-team-member-drawer");
  const [bodyScrollWidth, documentScrollWidth] = await page.evaluate(() => [
    document.body.scrollWidth,
    document.documentElement.scrollWidth
  ]);
  return {
    activePageId: await page
      .getByTestId("admin-shell")
      .getAttribute("data-active-page-id"),
    bodyScrollWidth,
    documentScrollWidth,
    drawerWidth: (await drawer.count()) ? await width(drawer) : 0,
    memberRows: await page.locator(".uz-team-row").count(),
    navWidth: await width(page.getByTestId("app-shell-nav")),
    pageWidth: await width(page.getByTestId("m7-team-page")),
    shellLevel: await page.getByTestId("admin-shell").getAttribute("data-shell-level")
  };
}

async function width(locator: ReturnType<Page["getByTestId"]>) {
  return locator.evaluate((node) =>
    Math.round((node as HTMLElement).getBoundingClientRect().width)
  );
}

async function captureOwnerHtmlTeamSample(page: Page) {
  if (!existsSync(ownerHtml)) {
    return writeJson("owner-html-team-source-dom-sample.json", {
      missingPath: ownerHtml,
      status: "local-source-unavailable"
    });
  }
  await page.goto(pathToFileURL(ownerHtml).toString());
  await page.waitForLoadState("domcontentloaded");
  await page
    .getByText("团队", { exact: true })
    .first()
    .click({ timeout: 3000 })
    .catch(() => undefined);
  const text = await page.locator("body").innerText();
  const sample = {
    markers: markerMap(text, ["团队", "成员", "角色管理", "邀请成员"]),
    sample: text.replace(/\s+/g, " ").trim().slice(0, 1000)
  };
  expect(sample.markers["团队"]).toBe(true);
  writeJson("owner-html-team-source-dom-sample.json", sample);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/owner-html-team-source-sample.png`
  });
}

function writeSourceSampling() {
  const availability = {
    fixture: sourceAvailability("fixture", sourcePaths.fixture),
    ownerHtml: sourceAvailability("ownerHtml", ownerHtml),
    page: sourceAvailability("page", sourcePaths.page)
  };
  const pageSource = readAvailableSource(availability.page);
  const fixtureSource = readAvailableSource(availability.fixture);
  const ownerSource = readAvailableSource(availability.ownerHtml);
  const sampling = {
    fixture: markerMap(fixtureSource, ["PERM_GROUPS", "TEAM_MEMBERS", "TEAM_COLS"]),
    owner: markerMap(ownerSource, [
      "isTeam: page==='team'",
      "teamHeaderBtnLabel",
      "团队"
    ]),
    page: markerMap(pageSource, [
      "TeamPage",
      "成员",
      "角色管理",
      "邀请成员",
      "MemberDrawer"
    ]),
    availability: Object.values(availability),
    sourcePaths: { ...sourcePaths, ownerHtml }
  };
  expectMarkerWhenAvailable(availability.page, sampling.page, "TeamPage");
  expectMarkerWhenAvailable(availability.fixture, sampling.fixture, "TEAM_MEMBERS");
  expectMarkerWhenAvailable(availability.ownerHtml, sampling.owner, "团队");
  writeUnavailableSources(Object.values(availability));
  writeJson("source-sampling.json", sampling);
}

function sourceAvailability(kind: string, path: string) {
  return { kind, ok: existsSync(path), path };
}

function readAvailableSource(source: ReturnType<typeof sourceAvailability>) {
  return source.ok ? readFileSync(source.path, "utf8") : "";
}

function expectMarkerWhenAvailable(
  source: ReturnType<typeof sourceAvailability>,
  markers: Record<string, boolean>,
  marker: string
) {
  if (source.ok) expect(markers[marker]).toBe(true);
}

function writeUnavailableSources(sources: Array<ReturnType<typeof sourceAvailability>>) {
  const unavailable = sources.filter((source) => !source.ok);
  if (unavailable.length)
    writeFileSync(
      `${artifactDir}/source-unavailable.md`,
      unavailable.map((source) => `${source.kind}: ${source.path}`).join("\n")
    );
}

function markerMap(text: string, markers: string[]) {
  return Object.fromEntries(markers.map((marker) => [marker, text.includes(marker)]));
}

function writeJson(name: string, value: unknown) {
  writeFileSync(`${artifactDir}/${name}`, JSON.stringify(value, null, 2));
}
