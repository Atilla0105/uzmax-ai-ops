import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { expect, test, type Page } from "@playwright/test";

const artifactDir = "/tmp/uzmax-m7-ui-99-group-overview-source-copy-parity";
const ownerHtml = "/Users/atilla/Downloads/运营塔台1.0.html";
const sourceFiles = {
  fixture: "/Users/atilla/源码/unpacked 6/fixtures/group.ts",
  page: "/Users/atilla/源码/unpacked 6/pages/group/GroupOverviewPage.tsx"
};
type SourceRow = {
  businessLine: string;
  evalLabel: string;
  id: string;
  last: string;
  orderLabel: string;
  tenant: string;
};
const sourceRows: readonly SourceRow[] = [
  {
    businessLine: "美妆 · 中亚",
    evalLabel: "阻断",
    id: "tenant-a",
    last: "退款红线 · 9分钟前",
    orderLabel: "降级",
    tenant: "玉珠跨境美妆"
  },
  {
    businessLine: "3C · 俄语区",
    evalLabel: "通过",
    id: "tenant-b",
    last: "成本超预算 · 1小时前",
    orderLabel: "正常",
    tenant: "丝路数码"
  },
  {
    businessLine: "家居 · 哈萨克",
    evalLabel: "运行中",
    id: "tenant-c",
    last: "connector 故障 · 22分钟前",
    orderLabel: "故障",
    tenant: "天净家居"
  },
  {
    businessLine: "母婴 · 俄语区",
    evalLabel: "通过",
    id: "tenant-d",
    last: "AI 熔断 · 3小时前",
    orderLabel: "正常",
    tenant: "白桦母婴"
  }
];

mkdirSync(artifactDir, { recursive: true });

test.beforeEach(async ({ page }) => {
  await page.route("**/conversation-ticket/conversations", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
});

test("keeps source-like group overview row copy with disclosure only in global labels", async ({
  page
}) => {
  writeSourceMappingSummary();
  await captureOwnerHtmlSample(page);

  await page.setViewportSize({ width: 1280, height: 840 });
  await page.goto("/design");
  await expect(page.getByTestId("m7-group-overview-page")).toBeVisible();

  await expect(page.getByTestId("m7-group-overview-result-label")).toContainText(
    "mock/degraded"
  );
  await expect(page.getByTestId("m7-group-overview-runtime-note")).toContainText(
    "mock/degraded"
  );
  await expect(page.getByTestId("m7-group-overview-runtime-note")).toContainText(
    "aggregate runtime unavailable"
  );
  await expect(page.getByTestId("m7-group-overview-runtime-note")).toContainText(
    "not production metrics"
  );

  const rows = page.locator("[data-testid^='m7-group-overview-row-']");
  await expect(rows).toHaveCount(sourceRows.length);
  for (const sourceRow of sourceRows) {
    const row = page.getByTestId(`m7-group-overview-row-${sourceRow.id}`);
    await expect(row).toContainText(sourceRow.tenant);
    await expect(row).toContainText(sourceRow.businessLine);
    await expect(row).toContainText(sourceRow.evalLabel);
    await expect(row).toContainText(sourceRow.orderLabel);
    await expect(row).toContainText(sourceRow.last);
    await expect(row).not.toContainText(/mock|degraded/i);
  }

  const desktopMetrics = await collectMetrics(page);
  expect(desktopMetrics.shellLevel).toBe("group");
  expect(desktopMetrics.activePageId).toBe("group.overview");
  expect(desktopMetrics.rowCount).toBe(4);
  expect(desktopMetrics.rowLocalMockOrDegraded).toBe(false);
  expect(desktopMetrics.globalResultHasMockDisclosure).toBe(true);
  expect(desktopMetrics.runtimeHasNotProductionDisclosure).toBe(true);
  expect(desktopMetrics.bodyScrollWidth).toBeLessThanOrEqual(1280);
  await page.screenshot({
    fullPage: false,
    path: `${artifactDir}/react-group-overview-source-copy-1280x840.png`
  });

  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/design");
  await expect(page.getByTestId("m7-group-overview-page")).toBeVisible();
  const mobileMetrics = await collectMetrics(page);
  expect(mobileMetrics.rowCount).toBe(4);
  expect(mobileMetrics.rowLocalMockOrDegraded).toBe(false);
  expect(mobileMetrics.bodyScrollWidth).toBeLessThanOrEqual(320);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-group-overview-source-copy-mobile-320.png`
  });

  writeFileSync(
    `${artifactDir}/metrics.json`,
    `${JSON.stringify({ desktop: desktopMetrics, mobile: mobileMetrics }, null, 2)}\n`
  );
});

async function captureOwnerHtmlSample(page: Page) {
  if (!existsSync(ownerHtml)) {
    writeFileSync(
      `${artifactDir}/owner-html-source-sample.json`,
      `${JSON.stringify(
        { available: false, path: ownerHtml, reason: "owner HTML is unavailable" },
        null,
        2
      )}\n`
    );
    return;
  }

  await page.goto(pathToFileURL(ownerHtml).toString());
  await page.waitForLoadState("domcontentloaded");
  const ownerSource = await page.evaluate((rows: readonly SourceRow[]) => {
    const text = document.body.innerText;
    return {
      bodyTextLength: text.length,
      contains: Object.fromEntries(
        rows.flatMap((row) => [
          [`businessLine:${row.id}`, text.includes(row.businessLine)],
          [`last:${row.id}`, text.includes(row.last)]
        ])
      ),
      sample: text.replace(/\s+/g, " ").trim().slice(0, 900),
      title: document.title
    };
  }, sourceRows);
  expect(ownerSource.bodyTextLength).toBeGreaterThan(100);
  await page.screenshot({
    fullPage: false,
    path: `${artifactDir}/owner-html-group-overview-source-sample.png`
  });
  writeFileSync(
    `${artifactDir}/owner-html-source-sample.json`,
    `${JSON.stringify(ownerSource, null, 2)}\n`
  );
}

async function collectMetrics(page: Page) {
  const raw = await page.evaluate(() => {
    const rowTexts = Array.from(
      document.querySelectorAll<HTMLElement>("[data-testid^='m7-group-overview-row-']")
    ).map((row) => row.innerText.replace(/\s+/g, " ").trim());
    const result =
      document.querySelector<HTMLElement>(
        "[data-testid='m7-group-overview-result-label']"
      )?.innerText ?? "";
    const runtime =
      document.querySelector<HTMLElement>(
        "[data-testid='m7-group-overview-runtime-note']"
      )?.innerText ?? "";
    const shell = document.querySelector<HTMLElement>("[data-testid='admin-shell']");
    return {
      activePageId: shell?.dataset.activePageId ?? "",
      bodyScrollWidth: document.body.scrollWidth,
      result,
      rowCount: rowTexts.length,
      rowTexts,
      runtime,
      shellLevel: shell?.dataset.shellLevel ?? ""
    };
  });
  return {
    ...raw,
    globalResultHasMockDisclosure: raw.result.includes("mock/degraded"),
    rowLocalMockOrDegraded: raw.rowTexts.some((text) => /mock|degraded/i.test(text)),
    runtimeHasNotProductionDisclosure:
      raw.runtime.includes("mock/degraded") &&
      raw.runtime.includes("aggregate runtime unavailable") &&
      raw.runtime.includes("not production metrics")
  };
}

function writeSourceMappingSummary() {
  const needles = sourceRows.flatMap((row) => [
    row.businessLine,
    row.evalLabel,
    row.orderLabel,
    row.last
  ]);
  const summary = Object.fromEntries(
    Object.entries(sourceFiles).map(([key, sourcePath]) => {
      if (!existsSync(sourcePath)) {
        return [key, { available: false, path: sourcePath }];
      }
      const text = readFileSync(sourcePath, "utf8");
      return [
        key,
        {
          available: true,
          contains: Object.fromEntries(
            Array.from(new Set(needles)).map((needle) => [
              needle,
              text.includes(needle)
            ])
          ),
          path: sourcePath
        }
      ];
    })
  );
  writeFileSync(
    `${artifactDir}/source-copy-mapping.json`,
    `${JSON.stringify({ sourceFiles: summary, sourceRows }, null, 2)}\n`
  );
}
