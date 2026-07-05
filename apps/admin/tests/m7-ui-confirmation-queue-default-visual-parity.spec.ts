import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

const artifactDir =
  "/tmp/uzmax-m7-ui-83-confirmation-queue-default-visual-parity-refresh";
const ownerHtml = "/Users/atilla/Downloads/运营塔台1.0.html";
const sourceFiles = {
  fixtures: "/Users/atilla/源码/unpacked 6/fixtures/queue.ts",
  hook: "/Users/atilla/源码/unpacked 6/hooks/useConfirmationQueue.ts",
  page: "/Users/atilla/源码/unpacked 6/pages/queue/QueuePage.tsx"
};
const tenantSections = ["运营", "数据", "智能", "管理", "洞察"];
const groupSections = ["总览", "平台", "治理"];
const groupLabels =
  "集团总览|模型/成本/风险|模板中心|连接中心|发布与验收|租户管理|集团日志".split("|");
const runtimeLabels = [
  "mock/degraded",
  "mock",
  "read-only",
  "runtime unavailable",
  "no runtime contract",
  "no production truth",
  "no write"
];
const forbiddenVisibleTerms = [
  ...runtimeLabels,
  "not production",
  "synthetic",
  "local-only",
  "API unavailable/empty/error"
];
const sourceLikeTexts = [
  "确认队列",
  "今日候选",
  "7日通过率",
  "蒸馏频率",
  "冲突待处理",
  "最近降频",
  "知识候选",
  "冲突候选",
  "候选内容",
  "待连接",
  "受控引用",
  "人工确认后生效",
  "采纳候选值",
  "保留当前值"
];

mkdirSync(artifactDir, { recursive: true });

test.beforeEach(async ({ page }) => {
  await page.route("**/confirmation-queue/items?status=pending", async (route) => {
    await route.fulfill({
      json: { error: "controlled://m7-ui-83/runtime-boundary" },
      status: 500
    });
  });
});

test("keeps tenant.queue default body source-like while runtime boundary stays hidden", async ({
  page
}) => {
  const mapping = writeSourceMappingSummary();
  expect(mapping.ownerHtml.hasQueueLabel).toBe(true);
  expect(mapping.page.centeredFlow680).toBe(true);
  expect(mapping.hook.blocksConflictKeyboard).toBe(true);
  expect(mapping.fixtures.stats).toEqual([
    "今日候选",
    "7日通过率",
    "蒸馏频率",
    "冲突待处理",
    "最近降频"
  ]);

  await page.setViewportSize({ width: 1280, height: 840 });
  await openQueue(page);
  await expect(page.getByTestId("m7-queue-runtime-note")).toBeHidden();
  await page.getByTestId("m7-queue-card-mock-degraded-conflict").click();
  await expect(page.getByRole("button", { name: "采纳候选值" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "保留当前值" })).toBeDisabled();
  const desktop = await collectQueueMetrics(page);
  expect(desktop.shellLevel).toBe("tenant");
  expect(desktop.activePageId).toBe("tenant.queue");
  expect(desktop.navWidth).toBe(232);
  expect(desktop.topbarHeight).toBeGreaterThanOrEqual(52);
  expect(desktop.topbarHeight).toBeLessThanOrEqual(53);
  expect(desktop.queueFlowWidth).toBeGreaterThanOrEqual(650);
  expect(desktop.queueFlowWidth).toBeLessThanOrEqual(680);
  expect(desktop.cardCount).toBeGreaterThanOrEqual(2);
  expect(desktop.conflictDiffPresent).toBe(true);
  expect(desktop.sourceLikeDefaultVisible).toBe(true);
  expect(desktop.runtimeLabelsPresent).toBe(true);
  expect(desktop.runtimeLabelsVisibleInBody).toBe(false);
  expect(desktop.disabledButtonBoundaryPresent).toBe(true);
  expect(desktop.tenantCategories).toEqual(tenantSections);
  expect(desktop.groupCategoryCount).toBe(0);
  expect(desktop.groupButtonCount).toBe(0);
  expect(desktop.bodyScrollWidth).toBeLessThanOrEqual(1280);
  expect(desktop.documentScrollWidth).toBeLessThanOrEqual(1280);
  await page.screenshot({
    fullPage: false,
    path: `${artifactDir}/react-queue-desktop-default.png`
  });

  await page.getByRole("button", { name: "Collapse navigation" }).click();
  await expect(page.getByTestId("admin-shell")).toHaveClass(/is-nav-collapsed/);
  const collapsed = await collectQueueMetrics(page);
  expect(collapsed.navWidth).toBe(68);
  expect(collapsed.runtimeLabelsVisibleInBody).toBe(false);
  expect(collapsed.tenantCategories).toEqual(tenantSections);
  expect(collapsed.groupCategoryCount).toBe(0);
  expect(collapsed.groupButtonCount).toBe(0);
  expect(collapsed.bodyScrollWidth).toBeLessThanOrEqual(1280);
  expect(collapsed.documentScrollWidth).toBeLessThanOrEqual(1280);
  await page.screenshot({
    fullPage: false,
    path: `${artifactDir}/react-queue-collapsed-default.png`
  });

  await page.setViewportSize({ width: 320, height: 900 });
  await openQueue(page);
  const mobile = await collectQueueMetrics(page);
  expect(mobile.shellLevel).toBe("tenant");
  expect(mobile.activePageId).toBe("tenant.queue");
  expect(mobile.cardCount).toBeGreaterThanOrEqual(2);
  expect(mobile.mobileReadable).toBe(true);
  expect(mobile.runtimeLabelsPresent).toBe(true);
  expect(mobile.runtimeLabelsVisibleInBody).toBe(false);
  expect(mobile.tenantCategories).toEqual(tenantSections);
  expect(mobile.groupCategoryCount).toBe(0);
  expect(mobile.groupButtonCount).toBe(0);
  expect(mobile.bodyScrollWidth).toBeLessThanOrEqual(320);
  expect(mobile.documentScrollWidth).toBeLessThanOrEqual(320);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-queue-mobile-320-default.png`
  });

  writeFileSync(
    `${artifactDir}/metrics.json`,
    `${JSON.stringify(
      { collapsed, desktop, mobile, sourceMapping: mapping },
      null,
      2
    )}\n`
  );
});

async function openQueue(page: Page) {
  await page.goto("/design");
  await page.getByTestId("tenant-switcher").selectOption("tenant-b");
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "tenant"
  );
  await page
    .getByTestId("app-shell-nav")
    .getByRole("button", { exact: true, name: "确认队列" })
    .click();
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.queue"
  );
  await expect(page.getByTestId("m7-confirmation-queue-page")).toBeVisible();
  await expect(page.getByTestId("m7-queue-loading")).toHaveCount(0);
}

async function collectQueueMetrics(page: Page) {
  const raw = await page.evaluate(() => {
    const rect = (selector: string) => {
      const element = document.querySelector(selector);
      if (!element) return { height: 0, width: 0 };
      const box = element.getBoundingClientRect();
      return { height: Math.round(box.height), width: Math.round(box.width) };
    };
    const nav = document.querySelector('[data-testid="app-shell-nav"]');
    const bodyText = document.body.innerText;
    const tenantCategories = Array.from(
      nav?.querySelectorAll(".uz-nav-group p") ?? []
    ).map((node) => (node.textContent ?? "").trim());
    return {
      activePageId: document
        .querySelector('[data-testid="admin-shell"]')
        ?.getAttribute("data-active-page-id"),
      bodyText,
      bodyScrollWidth: document.body.scrollWidth,
      cardCount: document.querySelectorAll(".uz-queue-card").length,
      conflictDiffPresent:
        document.querySelector(
          '[data-testid="m7-queue-diff-mock-degraded-conflict"]'
        ) !== null,
      disabledButtonBoundaries: Array.from(
        document.querySelectorAll(".uz-queue-actions button")
      ).map((button) => button.getAttribute("data-runtime-boundary") ?? ""),
      documentScrollWidth: document.documentElement.scrollWidth,
      navText: nav?.textContent ?? "",
      navWidth: rect('[data-testid="app-shell-nav"]').width,
      queueFlowWidth: rect('[data-testid="m7-queue-flow"]').width,
      shellLevel: document
        .querySelector('[data-testid="admin-shell"]')
        ?.getAttribute("data-shell-level"),
      tenantCategories,
      topbarHeight: rect(".uz-topbar").height
    };
  });
  const runtimeText = [
    (await page
      .getByTestId("m7-confirmation-queue-page")
      .getAttribute("data-runtime-boundary")) ?? "",
    (await page.getByTestId("m7-queue-runtime-note").textContent()) ?? ""
  ].join(" ");
  const bodyText = raw.bodyText;
  const navText = raw.navText;
  return {
    ...raw,
    bodyText: undefined,
    disabledButtonBoundaries: undefined,
    disabledButtonBoundaryPresent: raw.disabledButtonBoundaries.some((value) =>
      runtimeLabels.every((label) => value.includes(label))
    ),
    groupButtonCount: groupLabels.filter((label) => navText.includes(label)).length,
    groupCategoryCount: groupSections.filter((label) =>
      raw.tenantCategories.includes(label)
    ).length,
    mobileReadable:
      bodyText.includes("确认队列") &&
      bodyText.includes("知识候选") &&
      bodyText.includes("冲突候选"),
    navText: undefined,
    runtimeLabelsPresent: runtimeLabels.every((label) => runtimeText.includes(label)),
    runtimeLabelsVisibleInBody: forbiddenVisibleTerms.some((label) =>
      bodyText.includes(label)
    ),
    sourceLikeDefaultVisible: sourceLikeTexts.every((label) => bodyText.includes(label))
  };
}

function writeSourceMappingSummary() {
  const owner = readFileSync(ownerHtml, "utf8");
  const sources: Record<keyof typeof sourceFiles, string> = {
    fixtures: readFileSync(sourceFiles.fixtures, "utf8"),
    hook: readFileSync(sourceFiles.hook, "utf8"),
    page: readFileSync(sourceFiles.page, "utf8")
  };
  const mapping = {
    fixtures: {
      stats: ["今日候选", "7日通过率", "蒸馏频率", "冲突待处理", "最近降频"].filter(
        (label) => sources.fixtures.includes(label)
      )
    },
    hook: {
      blocksConflictKeyboard: sources.hook.includes("冲突候选强制并排 diff"),
      localActions: ["mark", "resolveConflict", "startEdit", "confirmRecover"].filter(
        (name) => sources.hook.includes(name)
      )
    },
    ownerHtml: {
      hasQueueLabel: owner.includes("确认队列"),
      hasQueueStats: owner.includes("今日候选") && owner.includes("7日通过率")
    },
    page: {
      centeredFlow680: sources.page.includes("maxWidth: 680"),
      sourceButtons: ["通过", "编辑", "丢弃", "拦截", "采纳候选值"].filter((label) =>
        sources.page.includes(label)
      )
    }
  };
  writeFileSync(
    `${artifactDir}/unpacked-queue-source-mapping.json`,
    `${JSON.stringify(mapping, null, 2)}\n`
  );
  return mapping;
}
