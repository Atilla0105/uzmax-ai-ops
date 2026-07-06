import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { expect, test, type Page } from "@playwright/test";

const artifactDir = "/tmp/uzmax-m7-ui-41-ai-members-page-cleanstack";
const ownerHtml = "/Users/atilla/Downloads/运营塔台1.0.html";
const sourceFiles = {
  fixtures: "/Users/atilla/源码/unpacked 6/fixtures/agents.ts",
  hook: "/Users/atilla/源码/unpacked 6/hooks/useAgents.ts",
  page: "/Users/atilla/源码/unpacked 6/pages/agents/AgentsPage.tsx"
};
const runtimeLabels = [
  "degraded",
  "mock",
  "read-only",
  "not production member metrics",
  "no production persona publish",
  "local action only"
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
const tenantSections = ["运营", "数据", "智能", "管理", "洞察"] as const;

mkdirSync(artifactDir, { recursive: true });

test.beforeEach(async ({ page }) => {
  await page.route("**/conversation-ticket/conversations", (route) =>
    route.fulfill({ json: { items: [] } })
  );
});

test("captures tenant.aiMembers source mapping and visible desktop shell", async ({
  page
}) => {
  const sourceMapping = writeSourceMappingSummary();
  if (sourceMapping) {
    expect(sourceMapping.anatomy.title).toBe(true);
    expect(sourceMapping.anatomy.capabilities).toBe(true);
    expect(sourceMapping.anatomy.emergency).toBe(true);
    expect(sourceMapping.anatomy.personaGate).toBe(true);
    expect(sourceMapping.fixture.agentCount).toBeGreaterThanOrEqual(3);
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  if (existsSync(ownerHtml)) {
    await page.goto(pathToFileURL(ownerHtml).toString());
    await page.waitForLoadState("domcontentloaded");
    await clickFirstVisibleText(page, "AI 成员");
    const sample = await collectOwnerSourceSample(page);
    expect(sample.bodyTextLength).toBeGreaterThan(100);
    expect(sample.markers["AI 成员"]).toBe(true);
    await saveShot(page, "owner-html-ai-members-source-sample.png");
    writeJson("owner-html-ai-members-source-dom-sample.json", sample);
  } else {
    writeUnavailableArtifact("owner-html-ai-members-source-dom-sample.json", [
      ownerHtml
    ]);
  }

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
    "data-runtime-state",
    "degraded"
  );
  for (const label of runtimeLabels)
    await expect(page.getByTestId("m7-agent-runtime-note")).toContainText(label);
  await expect(page.getByRole("heading", { level: 2, name: "AI 成员" })).toBeVisible();
  await expect(page.getByTestId("m7-agent-alert")).toContainText("local action only");
  await expect(page.getByTestId("m7-agent-card-grid")).toBeVisible();
  await expect(page.getByTestId("m7-agent-human-table")).toBeVisible();
  await expect(page.getByTestId("m7-agent-card-SYN-AI-MEMBER-PRIMARY")).toContainText(
    "今日处理"
  );
  await expect(page.getByTestId("m7-agent-card-SYN-AI-MEMBER-PRIMARY")).toContainText(
    "成本"
  );
  await expect(page.getByTestId("m7-agent-card-SYN-AI-MEMBER-PRIMARY")).toContainText(
    "负反馈"
  );
  await page.getByTestId("m7-agent-filter-ai").click();
  await expect(page.getByTestId("m7-agent-human-table")).toHaveCount(0);
  await page.getByTestId("m7-agent-filter-human").click();
  await expect(page.getByTestId("m7-agent-card-grid")).toHaveCount(0);
  await page.getByTestId("m7-agent-filter-all").click();
  await expectTenantOnlyNav(page);

  const metrics = await collectMetrics(page);
  expect(metrics.activePageId).toBe("tenant.aiMembers");
  expect(metrics.shellLevel).toBe("tenant");
  expect(metrics.sidebarExpandedWidth).toBe(232);
  expect(metrics.topbarHeight).toBeGreaterThanOrEqual(52);
  expect(metrics.topbarHeight).toBeLessThanOrEqual(53);
  expect(metrics.firstCardWidth).toBeGreaterThanOrEqual(300);
  expect(metrics.bodyScrollWidth).toBeLessThanOrEqual(1440);
  expect(metrics.documentScrollWidth).toBeLessThanOrEqual(1440);
  expect(metrics.aiCardCount).toBe(3);
  writeJson("react-ai-members-metrics.json", { desktop: metrics });
  await saveShot(page, "react-ai-members-desktop.png");
});

test("keeps capability, stop/recovery, persona eval and publish local-only", async ({
  page
}) => {
  await openAgents(page);
  const primary = page.getByTestId("m7-agent-card-SYN-AI-MEMBER-PRIMARY");
  const cap = page.getByTestId("m7-agent-cap-SYN-AI-MEMBER-PRIMARY-vision");
  await expect(cap).toHaveAttribute("aria-pressed", "true");
  await cap.click();
  await expect(cap).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByTestId("m7-agent-toast")).toContainText("local action only");

  await page.getByTestId("m7-agent-estop-SYN-AI-MEMBER-PRIMARY").click();
  await expect(page.getByTestId("m7-confirm-modal")).toBeVisible();
  await expect(page.getByRole("button", { name: "确认紧急停止" })).toBeDisabled();
  await page.getByLabel("Reason").fill("local emergency stop");
  await page.getByRole("button", { name: "确认紧急停止" }).click();
  await expect(page.getByTestId("m7-agent-toast")).toContainText("local action only");
  await expect(primary).toContainText("已急停");
  await primary.getByRole("button", { name: "解除急停" }).click();
  await page.getByLabel("Reason").fill("local recovery");
  await page.getByRole("button", { name: "确认解除" }).click();
  await expect(primary).toContainText("在线");

  await page
    .getByTestId("m7-agent-card-SYN-AI-MEMBER-NIGHT")
    .getByRole("button", { name: "熔断恢复" })
    .click();
  await page.getByLabel("Reason").fill("local breaker recovery");
  await page.getByRole("button", { name: "确认恢复" }).click();
  await expect(page.getByTestId("m7-agent-card-SYN-AI-MEMBER-NIGHT")).toContainText(
    "在线"
  );

  await page.getByTestId("m7-agent-persona-SYN-AI-MEMBER-PRIMARY").click();
  await expect(page.getByTestId("m7-agent-persona-drawer")).toContainText("v8");
  await expect(page.getByTestId("m7-agent-persona-drawer")).toContainText(
    "发布本地预览"
  );
  await page.getByTestId("m7-agent-persona-textarea").fill("local edited persona");
  await expect(page.getByTestId("m7-agent-persona-gate")).toContainText("需运行评测");
  await expect(page.getByTestId("m7-agent-persona-publish")).toBeDisabled();
  await page.getByRole("button", { name: "运行评测" }).click();
  await expect(page.getByTestId("m7-agent-persona-gate")).toContainText("评测通过", {
    timeout: 1200
  });
  await page.getByTestId("m7-agent-persona-publish").click();
  await expect(page.getByTestId("m7-agent-toast")).toContainText(
    "no production persona publish"
  );

  for (const state of ["loading", "empty", "error", "permission"]) {
    await openAgents(page, `?m7AgentState=${state}`);
    await expect(page.getByTestId(`m7-agent-state-${state}`)).toContainText(
      "not production member metrics"
    );
  }
});

test("resets local state on tenant switch and keeps 320px mobile readable", async ({
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
  const collapsedMetrics = await collectMetrics(page);
  expect(collapsedMetrics.sidebarExpandedWidth).toBe(68);
  expect(collapsedMetrics.tenantCategories).toEqual(tenantSections);
  expect(collapsedMetrics.groupButtonCount).toBe(0);

  await page.setViewportSize({ width: 320, height: 900 });
  await openAgents(page);
  await expect(page.getByTestId("m7-agent-card-grid")).toBeVisible();
  const mobileMetrics = await collectMetrics(page);
  expect(mobileMetrics.bodyScrollWidth).toBeLessThanOrEqual(320);
  expect(mobileMetrics.documentScrollWidth).toBeLessThanOrEqual(320);
  expect(mobileMetrics.firstCardWidth).toBeLessThanOrEqual(
    Math.min(320, mobileMetrics.viewportWidth)
  );
  expect(mobileMetrics.mobileReadable).toBe(true);
  writeJson("react-ai-members-mobile-metrics.json", {
    collapsed: collapsedMetrics,
    mobile: mobileMetrics
  });
  await saveShot(page, "react-ai-members-collapsed.png");
  await saveShot(page, "react-ai-members-mobile-320.png", true);
});

async function openAgents(page: Page, query = "") {
  await page.goto(`/design${query}`);
  await page.getByTestId("tenant-switcher").selectOption("tenant-b");
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "tenant"
  );
  await page
    .getByTestId("app-shell-nav")
    .getByRole("button", { exact: true, name: "AI 成员" })
    .click();
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.aiMembers"
  );
}

async function clickFirstVisibleText(page: Page, text: string) {
  await page
    .getByText(text, { exact: true })
    .first()
    .click({ timeout: 3000 })
    .catch(() => undefined);
}

async function collectOwnerSourceSample(page: Page) {
  const [text, title] = await Promise.all([
    page.locator("body").innerText(),
    page.title()
  ]);
  return {
    bodyTextLength: text.length,
    markers: buildMarkerMap(text, ["AI 成员", "紧急停止", "人类成员", "编辑人设"]),
    sample: compactText(text),
    title
  };
}

async function expectTenantOnlyNav(page: Page) {
  const nav = page.getByTestId("app-shell-nav");
  await expect
    .poll(() => nav.locator(".uz-nav-group p").allTextContents())
    .toEqual(tenantSections);
  for (const label of tenantLabels)
    await expect(nav.getByRole("button", { exact: true, name: label })).toBeVisible();
  await expect(nav.getByRole("button", { exact: true, name: "集团总览" })).toHaveCount(
    0
  );
}

async function collectMetrics(page: Page) {
  const nav = page.getByTestId("app-shell-nav");
  const adminShell = page.getByTestId("admin-shell");
  const firstCardWidth = await page
    .locator(".uz-agent-card")
    .first()
    .evaluate((node) =>
      Math.round((node as HTMLElement).getBoundingClientRect().width)
    );
  const [bodyScrollWidth, documentScrollWidth, viewportWidth] = await page.evaluate(
    () => [
      document.body.scrollWidth,
      document.documentElement.scrollWidth,
      window.innerWidth
    ]
  );
  const navTexts = await nav.locator(".uz-nav-group p").allTextContents();
  const pageText = await page.locator("body").innerText();
  const isMobileViewport = viewportWidth <= 320;
  return {
    activePageId: await adminShell.getAttribute("data-active-page-id"),
    aiCardCount: await page.locator(".uz-agent-card").count(),
    bodyScrollWidth,
    documentScrollWidth,
    firstCardWidth,
    groupButtonCount: await nav
      .getByRole("button", { exact: true, name: "集团总览" })
      .count(),
    mobileReadable: isMobileViewport
      ? isReadableMobileAiPage(pageText, firstCardWidth)
      : undefined,
    shellLevel: await adminShell.getAttribute("data-shell-level"),
    sidebarExpandedWidth: await nav.evaluate(
      (node) => (node as HTMLElement).offsetWidth
    ),
    tenantCategories: navTexts.filter((label) =>
      tenantSections.includes(label as (typeof tenantSections)[number])
    ),
    topbarHeight: await page
      .locator(".uz-topbar")
      .evaluate((node) => (node as HTMLElement).offsetHeight),
    viewportWidth
  };
}

function writeSourceMappingSummary() {
  const missing = Object.entries(sourceFiles).flatMap(([kind, source]) =>
    existsSync(source) ? [] : [`${kind}:${source}`]
  );
  if (missing.length) {
    writeUnavailableArtifact("unpacked-ai-members-source-mapping.json", missing);
    return null;
  }
  const pageSource = readFileSync(sourceFiles.page, "utf8");
  const hookSource = readFileSync(sourceFiles.hook, "utf8");
  const fixtureSource = readFileSync(sourceFiles.fixtures, "utf8");
  const summary = {
    anatomy: {
      capabilities:
        hasAll(pageSource, ["能力开关"]) && fixtureSource.includes("CAP_DEFS"),
      emergency: hasAll(pageSource, ["紧急停止"]) && hookSource.includes("setStatus"),
      personaGate:
        hasAll(pageSource, ["运行评测"]) && hookSource.includes("runPersonaEval"),
      title: pageSource.includes("AI 成员")
    },
    fixture: {
      agentCount: (fixtureSource.match(/id: 'ag/g) ?? []).length,
      hasHumanMembers: fixtureSource.includes("AGENT_HUMANS")
    },
    sourceFiles
  };
  writeJson("unpacked-ai-members-source-mapping.json", summary);
  return summary;
}

async function saveShot(page: Page, name: string, fullPage = false) {
  await page.screenshot({ fullPage, path: `${artifactDir}/${name}` });
}

function writeJson(name: string, value: unknown) {
  writeFileSync(`${artifactDir}/${name}`, JSON.stringify(value, null, 2));
}

function writeUnavailableArtifact(name: string, missingPaths: string[]) {
  writeJson(name, {
    missingPaths,
    status: "unavailable",
    note: "Source artifact unavailable in this environment; React route assertions remain hard checks."
  });
}

function buildMarkerMap(text: string, markers: string[]) {
  return Object.fromEntries(markers.map((marker) => [marker, text.includes(marker)]));
}

function compactText(text: string) {
  return text.replace(/\s+/g, " ").trim().slice(0, 900);
}

function hasAll(text: string, markers: string[]) {
  return markers.every((marker) => text.includes(marker));
}

function isReadableMobileAiPage(text: string, firstCardWidth: number) {
  return (
    firstCardWidth > 0 &&
    firstCardWidth <= 320 &&
    ["AI 成员", "not production member metrics"].every((marker) =>
      text.includes(marker)
    )
  );
}
