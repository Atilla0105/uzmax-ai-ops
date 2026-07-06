import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { expect, test, type Page } from "@playwright/test";

const artifactDir = "/tmp/uzmax-m7-ui-40-eval-center-page-cleanstack";
const ownerHtml = "/Users/atilla/Downloads/运营塔台1.0.html";
const sourceFiles = {
  constants: "/Users/atilla/源码/unpacked 6/pages/evals/evalConstants.ts",
  fixtures: "/Users/atilla/源码/unpacked 6/fixtures/evals.ts",
  hook: "/Users/atilla/源码/unpacked 6/hooks/useEvals.ts",
  page: "/Users/atilla/源码/unpacked 6/pages/evals/EvalPage.tsx"
};
const tenantLabels =
  "对话|工单|确认队列|客户资产|订单|知识与资源|评测中心|AI 成员|团队|配置|分析|日志".split(
    "|"
  );
const tenantSections = ["运营", "数据", "智能", "管理", "洞察"];
const groupLabels =
  "集团总览|模型/成本/风险|模板中心|连接中心|发布与验收|租户管理|集团日志".split("|");
const groupSections = ["总览", "平台", "治理"];
const runtimeLabels =
  "degraded|mock|read-only|not production eval data|no production publish|manual review local only".split(
    "|"
  );

mkdirSync(artifactDir, { recursive: true });

test.beforeEach(async ({ page }) => {
  await page.route("**/conversation-ticket/conversations", (route) =>
    route.fulfill({ json: { items: [] } })
  );
});

test("captures tenant.eval visible eval-center evidence on cleanstack shell", async ({
  page
}) => {
  const sourceMapping = writeSourceMappingSummary();
  if (sourceMapping) {
    expect(sourceMapping.anatomy.evalTitle).toBe(true);
    expect(sourceMapping.anatomy.productionGate).toBe(true);
    expect(sourceMapping.anatomy.reasonModals).toBe(true);
    expect(sourceMapping.fixture.setNames.length).toBeGreaterThanOrEqual(9);
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  if (existsSync(ownerHtml)) {
    await page.goto(pathToFileURL(ownerHtml).toString());
    await page.waitForLoadState("domcontentloaded");
    await clickFirstVisibleText(page, "评测中心");
    const sample = await collectOwnerSourceSample(page);
    expect(sample.bodyTextLength).toBeGreaterThan(100);
    expect(sample.contains.eval).toBe(true);
    await saveShot(page, "owner-html-eval-source-sample.png");
    writeJson("owner-html-eval-source-dom-sample.json", sample);
  } else {
    writeUnavailableArtifact("owner-html-eval-source-dom-sample.json", [ownerHtml]);
  }

  await openEval(page);
  await expect(page.getByTestId("page-outlet")).toHaveAttribute(
    "data-page-id",
    "tenant.eval"
  );
  await expect(page.getByTestId("m7-eval-page")).toHaveAttribute(
    "data-runtime-state",
    "degraded"
  );
  await expect(page.getByTestId("m7-eval-gate")).toContainText("Production Gate：阻断");
  await expect(page.getByTestId("m7-eval-publish")).toBeDisabled();
  await expect(page.getByTestId("m7-eval-detail")).toContainText("prompt");
  await expect(page.getByTestId("m7-eval-detail")).toContainText("knowledge");
  await expect(page.getByTestId("m7-eval-detail")).toContainText("model");
  await expect(page.getByTestId("m7-eval-detail")).toContainText("cases");
  await expect(page.getByTestId("m7-eval-detail")).toContainText("Expected");
  await expect(page.getByTestId("m7-eval-detail")).toContainText("Actual");
  await expectTenantOnlyNav(page);
  for (const label of runtimeLabels)
    await expect(page.getByTestId("m7-eval-runtime-note")).toContainText(label);

  const desktopMetrics = await collectEvalMetrics(page);
  expect(desktopMetrics.activePageId).toBe("tenant.eval");
  expect(desktopMetrics.shellLevel).toBe("tenant");
  expect(desktopMetrics.navWidth).toBe(232);
  expect(desktopMetrics.topbarHeight).toBeGreaterThanOrEqual(52);
  expect(desktopMetrics.topbarHeight).toBeLessThanOrEqual(53);
  expect(desktopMetrics.leftListWidth).toBe(300);
  expect(desktopMetrics.runtimeLabelsVisible).toBe(true);
  expect(desktopMetrics.diffVisible).toBe(true);
  expect(desktopMetrics.bodyScrollWidth).toBeLessThanOrEqual(1440);
  expect(desktopMetrics.documentScrollWidth).toBeLessThanOrEqual(1440);
  await saveShot(page, "react-eval-center-desktop.png");

  await page.getByTestId("m7-eval-run").click();
  await expect(page.getByTestId("m7-eval-gate")).toContainText("运行中");
  await expect(page.getByTestId("m7-eval-run")).toBeDisabled();
  await saveShot(page, "react-eval-center-running.png");
  await expect(page.getByTestId("m7-eval-gate")).toContainText("阻断", {
    timeout: 1600
  });

  await page.getByTestId("m7-eval-first-blocked").click();
  await page
    .getByTestId("m7-eval-case-SYN-EVAL-CASE-202")
    .getByRole("button", { name: "人工复核为通过" })
    .click();
  await expect(page.getByTestId("m7-confirm-modal")).toBeVisible();
  await expect(
    page.getByTestId("m7-confirm-modal").getByRole("button", {
      name: "人工复核为通过"
    })
  ).toBeDisabled();
  await saveShot(page, "react-eval-center-manual-override-modal.png");
  await page.getByLabel("Override reason").fill("local manual review reason");
  await page
    .getByTestId("m7-confirm-modal")
    .getByRole("button", { name: "人工复核为通过" })
    .click();
  await expect(page.getByTestId("m7-eval-toast")).toContainText(
    "manual review local only"
  );

  await openEval(page, "?m7EvalState=pass");
  await expect(page.getByTestId("m7-eval-gate")).toContainText("通过");
  await expect(page.getByTestId("m7-eval-publish")).toBeEnabled();
  await page.getByTestId("m7-eval-publish").click();
  await expect(page.getByRole("button", { name: "确认本地发布预览" })).toBeDisabled();
  await saveShot(page, "react-eval-center-publish-modal.png");
  await page.getByLabel("Publish reason").fill("local publish review only");
  await page.getByRole("button", { name: "确认本地发布预览" }).click();
  await expect(page.getByTestId("m7-eval-toast")).toContainText(
    "no production publish"
  );

  await page.getByRole("button", { name: "Collapse navigation" }).click();
  await expect(page.getByTestId("app-shell-nav")).toHaveJSProperty("offsetWidth", 68);
  const collapsedMetrics = await collectEvalMetrics(page);
  expect(collapsedMetrics.navWidth).toBe(68);
  expect(collapsedMetrics.tenantCategories).toEqual(tenantSections);
  expect(collapsedMetrics.groupCategoryCount).toBe(0);
  expect(collapsedMetrics.groupButtonCount).toBe(0);
  await saveShot(page, "react-eval-center-collapsed.png");

  await page.setViewportSize({ width: 320, height: 900 });
  await openEval(page);
  await expect(page.getByTestId("m7-eval-set-list")).toBeVisible();
  await expect(page.getByTestId("m7-eval-detail")).toBeVisible();
  const mobileMetrics = await collectEvalMetrics(page);
  expect(mobileMetrics.bodyScrollWidth).toBeLessThanOrEqual(320);
  expect(mobileMetrics.documentScrollWidth).toBeLessThanOrEqual(320);
  expect(mobileMetrics.mobileReadable).toBe(true);
  await saveShot(page, "react-eval-center-mobile-320.png", true);

  writeJson("metrics.json", {
    collapsed: collapsedMetrics,
    desktop: desktopMetrics,
    mobile: mobileMetrics
  });
});

test("supports forced URL states and tenant-local reset", async ({ page }) => {
  for (const state of ["loading", "empty", "error", "permission"] as const) {
    await openEval(page, `?m7EvalState=${state}`);
    await expect(page.getByTestId(`m7-eval-state-${state}`)).toBeVisible();
    await expect(page.getByTestId(`m7-eval-state-${state}`)).toContainText(
      "no production publish"
    );
  }

  await openEval(page);
  await page.getByTestId("m7-eval-first-blocked").click();
  await page
    .getByTestId("m7-eval-case-SYN-EVAL-CASE-202")
    .getByRole("button", { name: "人工复核为通过" })
    .click();
  await page.getByLabel("Override reason").fill("tenant-b local override");
  await page
    .getByTestId("m7-confirm-modal")
    .getByRole("button", { name: "人工复核为通过" })
    .click();
  await expect(page.getByTestId("m7-eval-case-SYN-EVAL-CASE-202")).toContainText(
    "tenant-b local override"
  );
  await page.getByTestId("tenant-switcher").selectOption("tenant-c");
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.eval"
  );
  await expect(page.getByTestId("m7-eval-page")).toHaveAttribute(
    "data-tenant-id",
    "tenant-c"
  );
  await expect(page.getByTestId("m7-eval-case-SYN-EVAL-CASE-202")).toContainText(
    "失败"
  );
  await expect(page.getByTestId("m7-eval-case-SYN-EVAL-CASE-202")).not.toContainText(
    "tenant-b local override"
  );
});

async function openEval(page: Page, query = "") {
  await page.goto(`/design${query}`);
  await page.getByTestId("tenant-switcher").selectOption("tenant-b");
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "tenant"
  );
  await page
    .getByTestId("app-shell-nav")
    .getByRole("button", { exact: true, name: "评测中心" })
    .click();
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.eval"
  );
  await expect(page.getByTestId("m7-eval-page")).toBeVisible();
}

async function clickFirstVisibleText(page: Page, text: string) {
  await page
    .getByText(text, { exact: true })
    .first()
    .click({ timeout: 3000 })
    .catch(() => undefined);
}

async function collectOwnerSourceSample(page: Page) {
  return page.evaluate(() => {
    const text = document.body.innerText;
    return {
      bodyTextLength: text.length,
      contains: {
        eval: text.includes("评测中心"),
        gate: text.includes("Production Gate")
      },
      sample: text.replace(/\s+/g, " ").trim().slice(0, 900),
      title: document.title
    };
  });
}

async function expectTenantOnlyNav(page: Page) {
  const nav = page.getByTestId("app-shell-nav");
  await expect
    .poll(() => nav.locator(".uz-nav-group p").allTextContents())
    .toEqual(tenantSections);
  for (const label of tenantLabels)
    await expect(nav.getByRole("button", { exact: true, name: label })).toBeVisible();
}

async function collectEvalMetrics(page: Page) {
  const raw = await page.evaluate(() => {
    const measure = (selector: string) => {
      const rect = document.querySelector(selector)?.getBoundingClientRect();
      return {
        height: rect ? Math.round(rect.height) : 0,
        width: rect ? Math.round(rect.width) : 0
      };
    };
    const nav = document.querySelector('[data-testid="app-shell-nav"]');
    const bodyText = document.body.innerText;
    const tenantCategories = Array.from(
      nav?.querySelectorAll(".uz-nav-group p") ?? [],
      (node) => (node.textContent ?? "").trim()
    );
    return {
      activePageId: document
        .querySelector('[data-testid="admin-shell"]')
        ?.getAttribute("data-active-page-id"),
      bodyText,
      bodyScrollWidth: document.body.scrollWidth,
      detail: measure('[data-testid="m7-eval-detail"]'),
      diff: measure('[data-testid^="m7-eval-diff-"]'),
      documentScrollWidth: document.documentElement.scrollWidth,
      gate: measure('[data-testid="m7-eval-gate"]'),
      leftList: measure('[data-testid="m7-eval-set-list"]'),
      nav: measure('[data-testid="app-shell-nav"]'),
      navText: nav?.textContent ?? "",
      shellLevel: document
        .querySelector('[data-testid="admin-shell"]')
        ?.getAttribute("data-shell-level"),
      tenantCategories,
      topbar: measure(".uz-topbar")
    };
  });
  const bodyText = raw.bodyText;
  const navText = raw.navText;
  return {
    ...raw,
    bodyText: undefined,
    detailVisible: hasBox(raw.detail),
    diffVisible: hasBox(raw.diff),
    gateVisible: hasBox(raw.gate),
    groupButtonCount: groupLabels.filter((label) => navText.includes(label)).length,
    groupCategoryCount: groupSections.filter((label) =>
      raw.tenantCategories.includes(label)
    ).length,
    leftListWidth: raw.leftList.width,
    mobileReadable: includesAll(bodyText, ["评测中心", "Expected", "Actual"]),
    navText: undefined,
    navWidth: raw.nav.width,
    runtimeLabelsVisible: includesAll(bodyText, runtimeLabels),
    topbarHeight: raw.topbar.height
  };
}

function writeSourceMappingSummary() {
  const missingFiles = Object.values(sourceFiles).filter((file) => !existsSync(file));
  if (missingFiles.length > 0) {
    writeUnavailableArtifact("unpacked-eval-source-mapping-unavailable.json", [
      ...missingFiles
    ]);
    return undefined;
  }

  const sources: Record<keyof typeof sourceFiles, string> = {
    constants: readFileSync(sourceFiles.constants, "utf8"),
    fixtures: readFileSync(sourceFiles.fixtures, "utf8"),
    hook: readFileSync(sourceFiles.hook, "utf8"),
    page: readFileSync(sourceFiles.page, "utf8")
  };
  const combined = `${sources.page}\n${sources.fixtures}\n${sources.hook}`;
  const mapping = {
    anatomy: {
      blindReview: includesAll(combined, ["人工盲评", "setBlind"]),
      evalList300: sources.page.includes("width: 300"),
      evalTitle: combined.includes("评测中心"),
      expectedActualDiff: includesAll(combined, ["expected", "actual"]),
      productionGate: combined.includes("Production Gate"),
      reasonModals: includesAll(sources.page, ["publishReason", "overrideReason"])
    },
    filesRead: Object.values(sourceFiles),
    fixture: {
      setNames:
        "意图识别|教程|报价|截图理解|乌语拉丁|乌语西里尔|俄语|红线攻击|红线误报|Business 草稿"
          .split("|")
          .filter((label) => sources.fixtures.includes(label))
    },
    hook: {
      localStateMachine:
        "gateStatus|blocked|runningSets|setBlind|overrideCase|runSet|publish"
          .split("|")
          .filter((term) => sources.hook.includes(term))
    }
  };
  writeJson("unpacked-eval-source-mapping.json", mapping);
  return mapping;
}

async function saveShot(page: Page, name: string, fullPage = false) {
  await page.screenshot({ fullPage, path: `${artifactDir}/${name}` });
}

function writeJson(name: string, value: unknown) {
  writeFileSync(`${artifactDir}/${name}`, `${JSON.stringify(value, null, 2)}\n`);
}

function writeUnavailableArtifact(fileName: string, missingFiles: string[]) {
  writeJson(fileName, {
    missingFiles,
    note: "Local owner HTML/unpacked source is unavailable in this environment; React assertions remain hard."
  });
}

function includesAll(text: string, labels: string[]) {
  return labels.every((label) => text.includes(label));
}

function hasBox(box: { height: number; width: number }) {
  return box.width > 0 && box.height > 0;
}
