import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { expect, test, type Page } from "@playwright/test";

const artifactDir = "/tmp/uzmax-m7-ui-69-ai-members-source-parity-refresh";
const ownerHtml = "/Users/atilla/Downloads/运营塔台1.0.html";
const sourceFiles = {
  fixtures: "/Users/atilla/源码/unpacked 6/fixtures/agents.ts",
  hook: "/Users/atilla/源码/unpacked 6/hooks/useAgents.ts",
  page: "/Users/atilla/源码/unpacked 6/pages/agents/AgentsPage.tsx"
};
const tenantSections = ["运营", "数据", "智能", "管理", "洞察"];
const groupSections = ["总览", "平台", "治理"];
const groupLabels =
  "集团总览|模型/成本/风险|模板中心|连接中心|发布与验收|租户管理|集团日志".split("|");
const runtimeLabels =
  "degraded|mock|read-only|not production member metrics|no production persona publish|local action only".split(
    "|"
  );

mkdirSync(artifactDir, { recursive: true });

test.beforeEach(async ({ page }) => {
  await page.route("**/conversation-ticket/conversations", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
});

test("captures tenant.aiMembers source parity evidence on latest shell stack", async ({
  page
}) => {
  writeSourceMappingSummary();

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(pathToFileURL(ownerHtml).toString());
  await page.waitForLoadState("domcontentloaded");
  await clickFirstVisibleText(page, "AI 成员");
  const ownerSource = await collectOwnerSourceSample(page);
  expect(ownerSource.bodyTextLength).toBeGreaterThan(100);
  expect(ownerSource.contains.aiMembers).toBe(true);
  await saveShot(page, "owner-html-ai-members-source-sample.png");
  writeJson("owner-html-ai-members-source-dom-sample.json", ownerSource);

  await page.goto("/design");
  await openAgents(page);

  const desktopMetrics = await collectAgentMetrics(page);
  expect(desktopMetrics.shellLevel).toBe("tenant");
  expect(desktopMetrics.activePageId).toBe("tenant.aiMembers");
  expect(desktopMetrics.navWidth).toBe(232);
  expect(desktopMetrics.topbarHeight).toBeGreaterThanOrEqual(52);
  expect(desktopMetrics.topbarHeight).toBeLessThanOrEqual(53);
  expect(desktopMetrics.pageVisible).toBe(true);
  expect(desktopMetrics.cardGridVisible).toBe(true);
  expect(desktopMetrics.humanTableVisible).toBe(true);
  expect(desktopMetrics.tenantCategories).toEqual(tenantSections);
  expect(desktopMetrics.groupCategoryCount).toBe(0);
  expect(desktopMetrics.groupButtonCount).toBe(0);
  expect(desktopMetrics.runtimeLabelsPresent).toBe(true);
  expect(desktopMetrics.runtimeLabelsVisibleInBody).toBe(false);
  expect(desktopMetrics.sourceLikeDefaultVisible).toBe(true);
  expect(desktopMetrics.bodyScrollWidth).toBeLessThanOrEqual(1440);
  expect(desktopMetrics.documentScrollWidth).toBeLessThanOrEqual(1440);
  await saveShot(page, "react-ai-members-desktop.png", true);

  await expect(page.getByTestId("m7-agent-runtime-note")).toHaveAttribute("hidden", "");
  for (const label of runtimeLabels)
    await expect(page.getByTestId("m7-agent-runtime-note")).toContainText(label);
  await expect(page.getByTestId("m7-agent-page")).toHaveAttribute(
    "data-runtime-boundary",
    /AI member runtime unavailable/
  );
  await expect(page.getByTestId("m7-agent-alert")).toContainText("熔断或急停状态");

  await page.getByTestId("m7-agent-filter-ai").click();
  await expect(page.getByTestId("m7-agent-human-table")).toHaveCount(0);
  await page.getByTestId("m7-agent-filter-human").click();
  await expect(page.getByTestId("m7-agent-card-grid")).toHaveCount(0);
  await page.getByTestId("m7-agent-filter-all").click();

  const cap = page.getByTestId("m7-agent-cap-SYN-AI-MEMBER-PRIMARY-vision");
  await expect(cap).toHaveAttribute("aria-pressed", "true");
  await cap.click();
  await expect(cap).toHaveAttribute("aria-pressed", "false");

  await page.getByTestId("m7-agent-estop-SYN-AI-MEMBER-PRIMARY").click();
  await expect(page.getByTestId("m7-confirm-modal")).toBeVisible();
  await expect(page.getByRole("button", { name: "确认紧急停止" })).toBeDisabled();
  const confirmMetrics = await collectAgentMetrics(page);
  expect(confirmMetrics.sourceLikeEmergencyConfirmVisible).toBe(true);
  await saveShot(page, "react-ai-members-emergency-confirm.png");
  await page.getByLabel("操作原因").fill("紧急停止演练");
  await page.getByRole("button", { name: "确认紧急停止" }).click();
  await expect(page.getByTestId("m7-agent-toast")).toContainText("状态已更新");

  await page
    .getByTestId("m7-agent-card-SYN-AI-MEMBER-NIGHT")
    .getByRole("button", { name: "熔断恢复" })
    .click();
  await expect(page.getByTestId("m7-confirm-modal")).toBeVisible();
  await expect(page.getByRole("button", { name: "确认恢复" })).toBeDisabled();
  const recoveryMetrics = await collectAgentMetrics(page);
  expect(recoveryMetrics.sourceLikeRecoveryConfirmVisible).toBe(true);
  await page.getByLabel("操作原因").fill("熔断原因已处理");
  await page.getByRole("button", { name: "确认恢复" }).click();
  await expect(page.getByTestId("m7-agent-toast")).toContainText("状态已更新");

  await page.getByTestId("m7-agent-persona-SYN-AI-MEMBER-PRIMARY").click();
  await expect(page.getByTestId("m7-agent-persona-drawer")).toBeVisible();
  await page.getByTestId("m7-agent-persona-textarea").fill("local edited persona");
  await expect(page.getByTestId("m7-agent-persona-gate")).toContainText("需运行评测");
  const personaMetrics = await collectAgentMetrics(page);
  expect(personaMetrics.personaDrawerVisible).toBe(true);
  expect(personaMetrics.sourceLikePersonaDrawerVisible).toBe(true);
  expect(personaMetrics.sourceLikePersonaEvalGateVisible).toBe(true);
  await saveShot(page, "react-ai-members-persona-drawer.png");
  await page.getByRole("button", { name: "运行评测" }).click();
  await expect(page.getByTestId("m7-agent-persona-gate")).toContainText("评测通过", {
    timeout: 1200
  });
  await page.getByTestId("m7-agent-persona-publish").click();
  await expect(page.getByTestId("m7-agent-toast")).toContainText("发布预览已生成");
  const publishMetrics = await collectAgentMetrics(page);
  expect(publishMetrics.sourceLikeLocalPublishVisible).toBe(true);

  await page.getByRole("button", { name: "Collapse navigation" }).click();
  await expect(page.getByTestId("admin-shell")).toHaveClass(/is-nav-collapsed/);
  const collapsedMetrics = await collectAgentMetrics(page);
  expect(collapsedMetrics.navWidth).toBe(68);
  expect(collapsedMetrics.tenantCategories).toEqual(tenantSections);
  expect(collapsedMetrics.groupCategoryCount).toBe(0);
  expect(collapsedMetrics.groupButtonCount).toBe(0);
  expect(collapsedMetrics.bodyScrollWidth).toBeLessThanOrEqual(1440);
  expect(collapsedMetrics.documentScrollWidth).toBeLessThanOrEqual(1440);
  await saveShot(page, "react-ai-members-collapsed.png", true);

  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/design");
  await openAgents(page);
  const mobileMetrics = await collectAgentMetrics(page);
  expect(mobileMetrics.shellLevel).toBe("tenant");
  expect(mobileMetrics.activePageId).toBe("tenant.aiMembers");
  expect(mobileMetrics.bodyScrollWidth).toBeLessThanOrEqual(320);
  expect(mobileMetrics.documentScrollWidth).toBeLessThanOrEqual(320);
  expect(mobileMetrics.mobileReadable).toBe(true);
  expect(mobileMetrics.tenantCategories).toEqual(tenantSections);
  expect(mobileMetrics.groupCategoryCount).toBe(0);
  expect(mobileMetrics.groupButtonCount).toBe(0);
  await saveShot(page, "react-ai-members-mobile-320.png", true);

  writeJson("metrics.json", {
    collapsed: collapsedMetrics,
    confirm: confirmMetrics,
    desktop: desktopMetrics,
    mobile: mobileMetrics,
    persona: personaMetrics,
    publish: publishMetrics,
    recovery: recoveryMetrics
  });
});

async function saveShot(page: Page, name: string, fullPage = false) {
  await page.screenshot({ fullPage, path: `${artifactDir}/${name}` });
}

function writeJson(name: string, value: unknown) {
  writeFileSync(`${artifactDir}/${name}`, `${JSON.stringify(value, null, 2)}\n`);
}

async function openAgents(page: Page) {
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
  await expect(page.getByTestId("m7-agent-page")).toBeVisible();
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
        aiMembers: contains("AI 成员"),
        capability: contains("能力开关"),
        persona: contains("编辑人设")
      },
      sample: text.replace(/\s+/g, " ").trim().slice(0, 900),
      title: document.title
    };
  });
}

async function collectAgentMetrics(page: Page) {
  return buildAgentMetrics(await collectRawAgentMetrics(page));
}

async function collectRawAgentMetrics(page: Page) {
  return page.evaluate(() => {
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
    const tenantCategories = Array.from(
      nav?.querySelectorAll(".uz-nav-group p") ?? []
    ).map((node) => (node.textContent ?? "").trim());
    const cardGrid = roundRect('[data-testid="m7-agent-card-grid"]');
    const firstCard = roundRect('[data-testid="m7-agent-card-grid"] .uz-agent-card');
    const humanTable = roundRect('[data-testid="m7-agent-human-table"]');
    const page = roundRect('[data-testid="m7-agent-page"]');
    const personaDrawer = roundRect(".uz-agent-drawer");
    const topbar = roundRect(".uz-topbar");
    return {
      activePageId: document
        .querySelector('[data-testid="admin-shell"]')
        ?.getAttribute("data-active-page-id"),
      bodyText,
      bodyScrollWidth: document.body.scrollWidth,
      cardGridHeight: cardGrid.height,
      cardGridWidth: cardGrid.width,
      documentScrollWidth: document.documentElement.scrollWidth,
      firstCardWidth: firstCard.width,
      humanTableHeight: humanTable.height,
      humanTableWidth: humanTable.width,
      navText: nav?.textContent ?? "",
      navWidth: roundRect('[data-testid="app-shell-nav"]').width,
      pageHeight: page.height,
      pageBoundary: document
        .querySelector('[data-testid="m7-agent-page"]')
        ?.getAttribute("data-runtime-boundary"),
      pageWidth: page.width,
      hiddenBoundaryText: Array.from(
        document.querySelectorAll("[data-runtime-boundary]")
      )
        .map(
          (node) => (node as HTMLElement).getAttribute("data-runtime-boundary") ?? ""
        )
        .join(" "),
      personaDrawerHeight: personaDrawer.height,
      personaDrawerWidth: personaDrawer.width,
      shellLevel: document
        .querySelector('[data-testid="admin-shell"]')
        ?.getAttribute("data-shell-level"),
      tenantCategories,
      titleBoundaryText: Array.from(document.querySelectorAll("[title]"))
        .map((node) => (node as HTMLElement).getAttribute("title") ?? "")
        .join(" "),
      topbarHeight: topbar.height,
      viewportWidth: window.innerWidth
    };
  });
}

type RawAgentMetrics = Awaited<ReturnType<typeof collectRawAgentMetrics>>;

function buildAgentMetrics(raw: RawAgentMetrics) {
  const bodyText = raw.bodyText;
  const navText = raw.navText;
  const boundaryText = [
    raw.pageBoundary ?? "",
    raw.hiddenBoundaryText ?? "",
    raw.titleBoundaryText ?? ""
  ].join(" ");
  return {
    ...raw,
    bodyText: undefined,
    cardGridVisible: hasBox(raw.cardGridWidth, raw.cardGridHeight),
    groupButtonCount: groupLabels.filter((label) => navText.includes(label)).length,
    groupCategoryCount: groupSections.filter((label) =>
      raw.tenantCategories.includes(label)
    ).length,
    humanTableVisible: hasBox(raw.humanTableWidth, raw.humanTableHeight),
    mobileReadable:
      includesAll(bodyText, ["AI 成员", "能力开关", "人类成员", "紧急停止"]) &&
      hasBox(raw.cardGridWidth, raw.cardGridHeight) &&
      raw.firstCardWidth >= 280,
    navText: undefined,
    pageVisible: hasBox(raw.pageWidth, raw.pageHeight),
    personaDrawerVisible: hasBox(raw.personaDrawerWidth, raw.personaDrawerHeight),
    hiddenBoundaryText: undefined,
    pageBoundary: undefined,
    runtimeLabelsPresent: includesAll(boundaryText, runtimeLabels),
    runtimeLabelsVisibleInBody: runtimeLabels.some((label) =>
      bodyText.toLowerCase().includes(label.toLowerCase())
    ),
    sourceLikeDefaultVisible: includesAll(bodyText, [
      "AI 成员",
      "能力开关",
      "Business 草稿",
      "今日处理",
      "人类成员",
      "熔断离线"
    ]),
    sourceLikeEmergencyConfirmVisible: includesAll(bodyText, [
      "紧急停止",
      "请填写本次操作原因",
      "操作原因"
    ]),
    sourceLikeLocalPublishVisible: includesAll(bodyText, [
      "人设发布预览已生成",
      "正式发布仍需评测"
    ]),
    sourceLikePersonaDrawerVisible: includesAll(bodyText, [
      "编辑人设",
      "运行评测",
      "发布预览"
    ]),
    sourceLikePersonaEvalGateVisible: includesAll(bodyText, ["需运行评测", "运行评测"]),
    sourceLikeRecoveryConfirmVisible: includesAll(bodyText, [
      "恢复熔断",
      "请填写本次操作原因",
      "操作原因"
    ])
  };
}

function includesAll(text: string, labels: string[]) {
  return labels.every((label) => text.includes(label));
}

function hasBox(width: number, height: number) {
  return width > 0 && height > 0;
}

function writeSourceMappingSummary() {
  const sources: Record<keyof typeof sourceFiles, string> = {
    fixtures: readFileSync(sourceFiles.fixtures, "utf8"),
    hook: readFileSync(sourceFiles.hook, "utf8"),
    page: readFileSync(sourceFiles.page, "utf8")
  };
  const mapping = {
    anatomy: {
      aiMemberCards: includesAll(sources.page, ["AgentCard", "api.agents", "今日处理"]),
      capabilityToggles: includesAll(sources.page, [
        "CAP_DEFS",
        "toggleCap",
        "能力开关"
      ]),
      emergencyStopConfirm: includesAll(sources.page, ["确认紧急停止", "openConfirm"]),
      filterSegmentedControls:
        sources.page.includes("AGENT_MEMBER_FILTERS") &&
        includesAll(sources.fixtures, ["全部", "AI 成员", "人类成员"]),
      humanTable: includesAll(sources.page, ["AGENT_HUMANS", "人类成员"]),
      localPublishPreview:
        sources.hook.includes("publishPersona") && sources.page.includes("发布新版本"),
      personaDrawer: includesAll(sources.page, ["PersonaEditor", "编辑人设"]),
      personaEvalGate:
        sources.hook.includes("runPersonaEval") &&
        includesAll(sources.page, ["运行评测", "评测通过"]),
      recoveryConfirm: includesAll(sources.page, ["熔断恢复", "确认恢复"]),
      runtimeAlert:
        sources.hook.includes("breakerNote") &&
        includesAll(sources.page, ["hasBreaker", "TriangleAlert"]),
      title: sources.page.includes("AI 成员")
    },
    capabilityLabels: ["教程", "截图", "报价", "订单查询", "Business 草稿"].filter(
      (label) => sources.fixtures.includes(label)
    ),
    filesRead: Object.values(sourceFiles),
    hook: {
      localStateMachine:
        "agents|sel|setSel|setStatus|toggleCap|persona|openPersona|editPersona|runPersonaEval|publishPersona|rollbackPersona|closePersona"
          .split("|")
          .filter((term) => sources.hook.includes(term))
    }
  };
  writeFileSync(
    `${artifactDir}/unpacked-ai-members-source-mapping.json`,
    `${JSON.stringify(mapping, null, 2)}\n`
  );
  return mapping;
}
