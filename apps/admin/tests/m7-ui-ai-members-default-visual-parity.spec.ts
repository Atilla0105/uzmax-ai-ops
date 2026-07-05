import { mkdirSync, writeFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

const artifactDir = "/tmp/uzmax-m7-ui-87-ai-members-default-visual-parity-refresh";
const runtimeLabels = [
  "degraded",
  "mock",
  "read-only",
  "not production member metrics",
  "no production persona publish",
  "local action only"
];
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
  "controlled://mock",
  "local action only"
];

mkdirSync(artifactDir, { recursive: true });

test.beforeEach(async ({ page }) => {
  await page.route("**/conversation-ticket/conversations", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
});

test("keeps tenant.aiMembers default body operational while retaining hidden runtime boundaries", async ({
  page
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openAgents(page);

  await expect(page.getByTestId("m7-agent-page")).toHaveAttribute(
    "data-runtime-boundary",
    /AI member runtime unavailable/
  );
  await expect(page.getByTestId("m7-agent-runtime-note")).toHaveAttribute("hidden", "");
  await expect(page.getByTestId("m7-agent-runtime-note")).toContainText(
    "no production persona publish"
  );
  await expect(page.getByTestId("m7-agent-page")).toContainText("AI 成员");
  await expect(page.getByTestId("m7-agent-page")).toContainText("能力开关");
  await expect(page.getByTestId("m7-agent-page")).toContainText("人设版本");
  await expect(page.getByTestId("m7-agent-page")).toContainText("评测门禁");
  await expect(page.getByTestId("m7-agent-alert")).toContainText("熔断或急停状态");
  await expectVisibleBodyClean(page);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-ai-members-default-clean.png`
  });

  await page.getByTestId("m7-agent-estop-SYN-AI-MEMBER-PRIMARY").click();
  await expect(page.getByTestId("m7-confirm-modal")).toBeVisible();
  await expect(page.getByTestId("m7-confirm-modal")).toContainText("操作原因");
  await expectVisibleBodyClean(page);
  await page.getByLabel("操作原因").fill("紧急停止演练");
  await page.getByRole("button", { name: "确认紧急停止" }).click();
  await expect(page.getByTestId("m7-agent-toast")).toContainText("状态已更新");

  await page.getByTestId("m7-agent-persona-SYN-AI-MEMBER-PRIMARY").click();
  await page.getByTestId("m7-agent-persona-textarea").fill("更新后的运营人设草稿");
  await expect(page.getByTestId("m7-agent-persona-gate")).toContainText("需运行评测");
  await page.getByRole("button", { name: "运行评测" }).click();
  await expect(page.getByTestId("m7-agent-persona-gate")).toContainText("评测通过", {
    timeout: 1200
  });
  await page.getByTestId("m7-agent-persona-publish").click();
  await expect(page.getByTestId("m7-agent-toast")).toContainText("发布预览已生成");
  await expectVisibleBodyClean(page);

  const desktop = await collectMetrics(page);
  expect(desktop.activePageId).toBe("tenant.aiMembers");
  expect(desktop.runtimeLabelsPresent).toBe(true);
  expect(desktop.runtimeLabelsVisibleInBody).toBe(false);
  expect(desktop.visibleBodyClean).toBe(true);
  expect(desktop.cardCount).toBeGreaterThanOrEqual(3);

  for (const state of ["loading", "empty", "error", "permission"]) {
    await openAgents(page, `?m7AgentState=${state}`);
    await expect(page.getByTestId(`m7-agent-state-${state}`)).toBeVisible();
    await expectVisibleBodyClean(page);
  }

  await page.setViewportSize({ width: 320, height: 900 });
  await openAgents(page);
  const mobile = await collectMetrics(page);
  expect(mobile.bodyScrollWidth).toBeLessThanOrEqual(320);
  expect(mobile.visibleBodyClean).toBe(true);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-ai-members-mobile-320-default-clean.png`
  });

  writeFileSync(
    `${artifactDir}/metrics.json`,
    `${JSON.stringify({ desktop, mobile }, null, 2)}\n`
  );
});

async function openAgents(page: Page, query = "") {
  await page.goto(`/design${query}`);
  await page.getByTestId("tenant-switcher").selectOption("tenant-b");
  await page
    .getByTestId("app-shell-nav")
    .getByRole("button", { exact: true, name: "AI 成员" })
    .click();
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.aiMembers"
  );
}

async function expectVisibleBodyClean(page: Page) {
  const visibleBody = await page.evaluate(() => document.body.innerText);
  for (const term of forbiddenVisibleTerms)
    expect(visibleBody.toLowerCase()).not.toContain(term.toLowerCase());
}

async function collectMetrics(page: Page) {
  return page.evaluate(
    ({ forbidden, labels }) => {
      const visibleText = document.body.innerText;
      const boundaryText = Array.from(
        document.querySelectorAll("[data-runtime-boundary]")
      )
        .map((node) => {
          const element = node as HTMLElement;
          return [
            element.getAttribute("data-runtime-boundary") ?? "",
            element.getAttribute("title") ?? ""
          ].join(" ");
        })
        .join(" ");
      return {
        activePageId: document
          .querySelector('[data-testid="admin-shell"]')
          ?.getAttribute("data-active-page-id"),
        bodyScrollWidth: document.body.scrollWidth,
        boundaryText,
        cardCount: document.querySelectorAll(".uz-agent-card").length,
        runtimeLabelsPresent: labels.every((label) => boundaryText.includes(label)),
        runtimeLabelsVisibleInBody: labels.some((label) =>
          visibleText.toLowerCase().includes(label.toLowerCase())
        ),
        visibleBodyClean: forbidden.every(
          (term) => !visibleText.toLowerCase().includes(term.toLowerCase())
        )
      };
    },
    { forbidden: forbiddenVisibleTerms, labels: runtimeLabels }
  );
}
