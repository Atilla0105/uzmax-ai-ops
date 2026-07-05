import { mkdirSync, writeFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

const artifactDir =
  "/tmp/uzmax-m7-ui-86-knowledge-resources-default-visual-parity-refresh";
const forbiddenVisibleTerms = [
  "mock",
  "degraded",
  "read-only",
  "runtime unavailable",
  "not production",
  "synthetic",
  "local-only",
  "browser-local only",
  "no production",
  "MOCK-",
  "disabled",
  "fixture",
  "controlled://mock"
];

mkdirSync(artifactDir, { recursive: true });

test.beforeEach(async ({ page }) => {
  await page.route("**/conversation-ticket/conversations", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
});

test("keeps tenant.knowledge default body business-like while retaining hidden runtime boundaries", async ({
  page
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openKnowledge(page);

  await expect(page.getByTestId("m7-knowledge-page")).toHaveAttribute(
    "data-runtime-boundary",
    /knowledge runtime unavailable/
  );
  await expect(page.getByTestId("m7-knowledge-runtime-note")).toHaveAttribute(
    "hidden",
    ""
  );
  await expect(page.getByTestId("m7-knowledge-runtime-note")).toHaveAttribute(
    "data-runtime-boundary",
    /no automatic publish/
  );
  await expect(page.getByTestId("m7-knowledge-page")).toContainText("阶段管线");
  await page.getByRole("button", { name: /3\. 下单/ }).click();
  await expect(page.getByTestId("m7-knowledge-stage-detail")).toContainText(
    "物流时效图"
  );
  await expect(page.getByTestId("m7-knowledge-journey-warning")).toContainText(
    "未关联素材"
  );
  await expectVisibleBodyClean(page);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-knowledge-journey-default-clean.png`
  });

  await page.getByTestId("m7-knowledge-tab-facts").click();
  await page.getByTestId("m7-knowledge-search").fill("报价");
  await expect(page.getByTestId("m7-knowledge-facts-table")).toContainText(
    "套装报价口径"
  );
  await page.getByTestId("m7-knowledge-fact-row-SYN-KB-FACT-001").click();
  await expect(page.getByTestId("m7-knowledge-fact-detail")).toContainText("确认队列");
  await expect(page.getByTestId("m7-knowledge-redline-toggle")).toContainText(
    "红线标记"
  );
  await expectVisibleBodyClean(page);

  await page.getByTestId("m7-knowledge-tab-public").click();
  await page.getByTestId("m7-knowledge-search").fill("");
  await expect(page.getByTestId("m7-knowledge-public-snippets")).toContainText(
    "物流延迟标准安抚"
  );
  await page.getByTestId("m7-knowledge-tab-private").click();
  await expect(page.getByTestId("m7-knowledge-private-snippets")).toContainText(
    "我的快捷 · 催付款"
  );

  await page.getByTestId("m7-knowledge-tab-assets").click();
  await expect(page.getByTestId("m7-knowledge-assets-table")).toContainText(
    "面霜使用教程"
  );
  await page.getByTestId("m7-knowledge-asset-row-SYN-KB-ASSET-001").click();
  await expect(page.getByTestId("m7-knowledge-asset-detail")).toContainText("素材内容");
  await expect(
    page.getByTestId("m7-knowledge-asset-detail").locator("[data-source-ref]")
  ).toHaveAttribute("data-source-ref", "controlled://mock/assets/onboarding-a");
  await page.getByTestId("m7-knowledge-asset-edit").click();
  await page.getByLabel("编辑素材内容").fill("已校对的素材草稿");
  await page.getByTestId("m7-knowledge-asset-save").click();
  await expect(page.getByTestId("m7-knowledge-asset-detail")).toContainText(
    "已校对的素材草稿"
  );
  await expectVisibleBodyClean(page);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-knowledge-assets-default-clean.png`
  });

  await page.getByTestId("m7-knowledge-tab-templates").click();
  await expect(page.getByTestId("m7-knowledge-template-source")).toContainText(
    "美妆售后知识包"
  );
  await expect(page.getByTestId("m7-knowledge-template-source")).toContainText(
    "红线攻击评测集"
  );
  await expectVisibleBodyClean(page);

  const metrics = await collectMetrics(page);
  expect(metrics.visibleBodyClean).toBe(true);
  expect(metrics.hiddenBoundaryText).toContain("mock");
  expect(metrics.hiddenBoundaryText).toContain("no formal knowledge write");
  expect(metrics.templateRows).toBeGreaterThanOrEqual(3);
  writeFileSync(`${artifactDir}/metrics.json`, `${JSON.stringify(metrics, null, 2)}\n`);
});

test("keeps URL state fallbacks and 320px mobile clean", async ({ page }) => {
  for (const state of ["loading", "empty", "error", "permission", "gate"]) {
    await openKnowledge(page, `?m7KnowledgeState=${state}`);
    await expect(page.getByTestId(`m7-knowledge-state-${state}`)).toBeVisible();
    await expectVisibleBodyClean(page);
  }

  await page.setViewportSize({ width: 320, height: 900 });
  await openKnowledge(page);
  await page.getByTestId("m7-knowledge-tab-assets").click();
  await expect(page.getByTestId("m7-knowledge-assets-table")).toBeVisible();
  expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(320);
  await expectVisibleBodyClean(page);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-knowledge-mobile-320-default-clean.png`
  });
});

async function openKnowledge(page: Page, query = "") {
  await page.goto(`/design${query}`);
  await page.getByTestId("tenant-switcher").selectOption("tenant-b");
  await page
    .getByTestId("app-shell-nav")
    .getByRole("button", { exact: true, name: "知识与资源" })
    .click();
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.knowledge"
  );
}

async function expectVisibleBodyClean(page: Page) {
  const visibleBody = await page.evaluate(() => document.body.innerText);
  for (const term of forbiddenVisibleTerms)
    expect(visibleBody.toLowerCase()).not.toContain(term.toLowerCase());
}

async function collectMetrics(page: Page) {
  return page.evaluate((forbidden) => {
    const visibleText = document.body.innerText;
    const hiddenBoundaryText = Array.from(
      document.querySelectorAll("[data-runtime-boundary]")
    )
      .map((node) => {
        const element = node as HTMLElement;
        return [
          element.getAttribute("data-runtime-boundary") ?? "",
          element.getAttribute("title") ?? "",
          element.getAttribute("aria-label") ?? ""
        ].join(" ");
      })
      .join(" ");
    return {
      assetRows: document.querySelectorAll('[data-testid^="m7-knowledge-asset-row-"]')
        .length,
      bodyScrollWidth: document.body.scrollWidth,
      hiddenBoundaryText,
      pageId: document
        .querySelector('[data-testid="admin-shell"]')
        ?.getAttribute("data-active-page-id"),
      templateRows: document.querySelectorAll(
        '[data-testid="m7-knowledge-template-source"] tbody tr'
      ).length,
      visibleBodyClean: forbidden.every(
        (term) => !visibleText.toLowerCase().includes(term.toLowerCase())
      )
    };
  }, forbiddenVisibleTerms);
}
