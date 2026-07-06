import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { expect, test, type Page } from "@playwright/test";

const artifactDir = "/tmp/uzmax-m7-ui-54-config-page-cleanstack";
const ownerHtml = "/Users/atilla/Downloads/运营塔台1.0.html";
const sourcePaths = {
  fixture: "/Users/atilla/源码/unpacked 6/fixtures/config.ts",
  page: "/Users/atilla/源码/unpacked 6/pages/config/ConfigPage.tsx"
} as const;
const configGroups = ["业务配置", "SLA", "渠道配置", "订单 connector"] as const;
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

mkdirSync(artifactDir, { recursive: true });

test.beforeEach(async ({ page }) => {
  await stubRoutes(page);
});

test("samples owner source and renders tenant config page", async ({ page }) => {
  recordSourceSampling();
  await sampleOwnerHtml(page);
  await openConfig(page);

  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "tenant"
  );
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.config"
  );
  await expect(page.getByTestId("page-outlet")).toHaveAttribute(
    "data-tenant-id",
    "tenant-b"
  );
  await expect(page.getByTestId("m7-config-page")).toContainText("配置");
  await expectTenantNavOnly(page);
  for (const label of configGroups) {
    await expect(
      page.getByTestId("m7-config-internal-nav").getByRole("button", { name: label })
    ).toBeVisible();
  }
  for (const label of [
    "degraded",
    "mock",
    "read-only",
    "browser-local only",
    "no production config write",
    "no dangerous action execution",
    "no connector switch",
    "no audit write",
    "no DB/API/authz/RLS"
  ]) {
    await expect(page.getByTestId("m7-config-runtime-note")).toContainText(label);
  }
  await expect(page.getByText("默认语言")).toBeVisible();
  await expect(page.getByText("P0 · 红线 / 投诉")).toHaveCount(0);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-config-desktop.png`
  });
  writeJson("react-config-desktop-metrics.json", await metrics(page));
});

test("config is hidden from group nav until tenant selection", async ({ page }) => {
  await page.goto("/design");
  for (const label of groupLabels)
    await expect(page.getByRole("button", { exact: true, name: label })).toBeVisible();
  for (const label of tenantLabels)
    await expect(page.getByRole("button", { exact: true, name: label })).toHaveCount(0);
  await page.getByTestId("tenant-switcher").selectOption("tenant-b");
  await expectTenantNavOnly(page);
});

test("save rollback and connector switch remain browser-local", async ({ page }) => {
  await openConfig(page);
  await expect(page.getByTestId("m7-config-save")).toBeDisabled();
  await page.locator(".uz-config-field select").first().selectOption("俄语");
  await expect(page.getByTestId("m7-config-page")).toContainText("未保存的修改");
  await page.getByTestId("m7-config-save").click();
  await expect(page.getByTestId("m7-config-toast")).toContainText(
    "no production config write"
  );
  await page.getByRole("button", { name: /版本历史/ }).click();
  await expect(page.getByTestId("m7-config-history")).toContainText("no audit write");
  await page.getByRole("button", { name: "回滚到此版本" }).first().click();
  await expect(page.getByTestId("m7-confirm-modal")).toContainText("回滚到 v");
  await expect(page.getByTestId("m7-confirm-modal")).toContainText(
    "no production config write"
  );
  await page.getByLabel("原因").fill("local rollback only");
  await page
    .getByTestId("m7-confirm-modal")
    .getByRole("button", { name: "回滚" })
    .click();
  await expect(page.getByTestId("m7-config-toast")).toContainText("no audit write");

  await page
    .getByTestId("m7-config-internal-nav")
    .getByRole("button", { exact: true, name: "订单 connector" })
    .click();
  await page.getByRole("button", { name: "测试连接" }).click();
  await expect(page.getByTestId("m7-config-toast")).toContainText("no API call");
  await page.getByRole("button", { name: "切换为导入快照主路径" }).click();
  await expect(page.getByTestId("m7-confirm-modal")).toContainText(
    "no dangerous action execution"
  );
  await page.getByLabel("原因").fill("local connector switch");
  await page.getByRole("button", { name: "确认本地切换" }).click();
  await expect(page.getByTestId("m7-config-page")).toContainText("导入快照");
});

test("forced states collapsed sidebar and 320px fallback stay bounded", async ({
  page
}) => {
  for (const state of ["loading", "empty", "error", "permission", "degraded"]) {
    await openConfig(page, `?m7ConfigState=${state}`);
    const target =
      state === "degraded"
        ? page.getByTestId("m7-config-runtime-note")
        : page.getByTestId(`m7-config-state-${state}`);
    await expect(target).toContainText("browser-local");
    await expect(target).toContainText(
      state === "error" ? "no DB/API/authz/RLS" : "no production config write"
    );
  }
  await openConfig(page);
  await page.getByRole("button", { name: "Collapse navigation" }).click();
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-config-collapsed.png`
  });
  writeJson("react-config-collapsed-metrics.json", await metrics(page));

  await page.setViewportSize({ width: 320, height: 900 });
  await openConfig(page);
  const mobile = await metrics(page);
  expect(mobile.bodyScrollWidth).toBeLessThanOrEqual(320);
  expect(mobile.documentScrollWidth).toBeLessThanOrEqual(320);
  expect(mobile.pageWidth).toBeLessThanOrEqual(320);
  writeJson("react-config-mobile-320-metrics.json", mobile);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-config-mobile-320.png`
  });
});

async function openConfig(page: Page, query = "") {
  await page.goto(`/design${query}`);
  await page.getByTestId("tenant-switcher").selectOption("tenant-b");
  await page.getByTestId("app-shell-nav").getByRole("button", { name: "配置" }).click();
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.config"
  );
}

async function expectTenantNavOnly(page: Page) {
  const nav = page.getByTestId("app-shell-nav");
  const visibleTenantItems = tenantLabels.map((label) =>
    expect(nav.getByRole("button", { exact: true, name: label })).toBeVisible()
  );
  const hiddenGroupItems = groupLabels.map((label) =>
    expect(nav.getByRole("button", { exact: true, name: label })).toHaveCount(0)
  );
  await Promise.all([...visibleTenantItems, ...hiddenGroupItems]);
}

async function metrics(page: Page) {
  const widths = await page.evaluate(() => ({
    bodyScrollWidth: document.body.scrollWidth,
    documentScrollWidth: document.documentElement.scrollWidth
  }));
  return {
    ...widths,
    activePageId: await page
      .getByTestId("admin-shell")
      .getAttribute("data-active-page-id"),
    groupCount: await page
      .getByTestId("m7-config-internal-nav")
      .getByRole("button")
      .count(),
    navWidth: await width(page.getByTestId("app-shell-nav")),
    pageWidth: await width(page.getByTestId("m7-config-page")),
    shellLevel: await page.getByTestId("admin-shell").getAttribute("data-shell-level")
  };
}

async function width(locator: ReturnType<Page["getByTestId"]>) {
  return locator.evaluate((node) =>
    Math.round((node as HTMLElement).getBoundingClientRect().width)
  );
}

async function stubRoutes(page: Page) {
  await Promise.all(
    [
      "**/conversation-ticket/conversations",
      "**/confirmation-queue/items?status=pending"
    ].map((pattern) =>
      page.route(pattern, (route) => route.fulfill({ json: { items: [] } }))
    )
  );
}

async function sampleOwnerHtml(page: Page) {
  if (!existsSync(ownerHtml))
    return writeJson("owner-html-config-source-dom-sample.json", missing(ownerHtml));
  await page.goto(pathToFileURL(ownerHtml).toString());
  await page.waitForLoadState("domcontentloaded");
  await page
    .getByText("配置", { exact: true })
    .first()
    .click({ timeout: 3000 })
    .catch(() => undefined);
  const text = await page.locator("body").innerText();
  const sample = {
    markers: markerMap(text, ["配置", "业务配置", "SLA", "订单 connector"]),
    sample: text.replace(/\s+/g, " ").trim().slice(0, 1000)
  };
  expect(sample.markers["配置"]).toBe(true);
  writeJson("owner-html-config-source-dom-sample.json", sample);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/owner-html-config-source-sample.png`
  });
}

function recordSourceSampling() {
  const sources = [
    source("ownerHtml", ownerHtml),
    source("page", sourcePaths.page),
    source("fixture", sourcePaths.fixture)
  ];
  const sampling = Object.fromEntries(
    sources.map((item) => [
      item.kind,
      item.ok
        ? markerMap(readFileSync(item.path, "utf8"), [
            "ConfigPage",
            "CONFIG_NAV",
            "业务配置",
            "订单 connector"
          ])
        : missing(item.path)
    ])
  );
  for (const item of sources.filter((sourceItem) => !sourceItem.ok))
    writeFileSync(`${artifactDir}/${item.kind}-unavailable.txt`, item.path);
  writeJson("source-sampling.json", { sampling, sources });
}

function source(kind: string, path: string) {
  return { kind, ok: existsSync(path), path };
}

function missing(path: string) {
  return { missingPath: path, status: "local-source-unavailable" };
}

function markerMap(text: string, markers: readonly string[]) {
  return Object.fromEntries(markers.map((marker) => [marker, text.includes(marker)]));
}

function writeJson(name: string, value: unknown) {
  writeFileSync(`${artifactDir}/${name}`, JSON.stringify(value, null, 2));
}
