import { mkdirSync } from "node:fs";
import { expect, type Locator, type Page } from "@playwright/test";

export const groupLogArtifactDir =
  "/tmp/uzmax-m7-ui-95-group-logs-default-visual-parity-refresh";
export const groupLogGroupLabels =
  "集团总览|模型/成本/风险|模板中心|连接中心|发布与验收|租户管理|集团日志".split("|");
export const groupLogTenantLabels =
  "对话|工单|确认队列|客户资产|订单|知识与资源|评测中心|AI 成员|团队|配置|分析|日志".split(
    "|"
  );
export const groupLogGroupSections = ["总览", "平台", "治理"];
export const groupLogTenantSections = ["运营", "数据", "智能", "管理", "洞察"];
export const groupLogOwnerChipLabels =
  "全部模块|AI 成员|连接中心|配置|租户管理|对话|工单".split("|");
export const groupLogTableColumns =
  "操作时间|租户|操作人|操作模块|操作功能|操作对象|操作内容".split("|");
export const groupLogRuntimeLabels = [
  "degraded",
  "mock",
  "read-only",
  "browser-local only",
  "synthetic audit rows",
  "no production audit export",
  "no file written",
  "no audit runtime call",
  "no real tenant/action navigation"
];
export const groupLogForbiddenVisibleTerms = [
  ...groupLogRuntimeLabels,
  "Synthetic",
  "synthetic"
];

export function ensureGroupLogArtifactDir(path = groupLogArtifactDir) {
  mkdirSync(path, { recursive: true });
}

export async function stubGroupLogNetwork(page: Page) {
  for (const url of [
    "**/conversation-ticket/conversations",
    "**/confirmation-queue/items?status=pending"
  ]) {
    await page.route(url, async (route) => {
      await route.fulfill({ json: { items: [] } });
    });
  }
}

export async function openGroupLogs(
  page: Page,
  query = "",
  options: { expectPageVisible?: boolean } = {}
) {
  await page.goto(`/design${query}`);
  await page
    .getByTestId("app-shell-nav")
    .getByRole("button", { exact: true, name: "集团日志" })
    .click();
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "group.logs"
  );
  if (options.expectPageVisible) {
    await expect(page.getByTestId("m7-group-logs-page")).toBeVisible();
  }
}

export async function expectGroupLogRuntimeBoundary(locator: Locator) {
  const text = await runtimeBoundaryText(locator);
  for (const label of groupLogRuntimeLabels) expect(text).toContain(label);
}

export async function expectGroupLogVisibleBodyClean(page: Page) {
  const body = (await page.locator("body").innerText()).toLowerCase();
  const leaked = groupLogForbiddenVisibleTerms.filter((term) =>
    body.includes(term.toLowerCase())
  );
  expect(leaked).toEqual([]);
}

export async function expectGroupLogLayerNav(page: Page) {
  const nav = page.getByTestId("app-shell-nav");
  await expect
    .poll(() => nav.locator(".uz-nav-group p").allTextContents())
    .toEqual(groupLogGroupSections);
  for (const label of groupLogGroupLabels) {
    await expect(nav.getByRole("button", { exact: true, name: label })).toBeVisible();
  }
  for (const label of groupLogTenantLabels) {
    await expect(nav.getByRole("button", { exact: true, name: label })).toHaveCount(0);
  }
  for (const section of groupLogTenantSections) {
    await expect(
      nav.locator(".uz-nav-group p").filter({ hasText: section })
    ).toHaveCount(0);
  }
}

export async function expectGroupLogToast(page: Page, labels: readonly string[]) {
  const toast = page.getByTestId("m7-group-logs-toast");
  await expect(toast).toHaveAttribute("role", "status");
  await expect(toast).toHaveAttribute("aria-live", "polite");
  for (const label of labels) await expect(toast).toContainText(label);
  await expectGroupLogRuntimeBoundary(toast);
}

export async function collectGroupLogBoundaryState(page: Page) {
  return page.evaluate(
    ({ forbidden, labels }) => {
      const visibleText = document.body.innerText;
      const visibleLower = visibleText.toLowerCase();
      const fullText = document.body.textContent ?? "";
      const boundaryText = Array.from(
        document.querySelectorAll("[data-runtime-boundary]")
      )
        .flatMap((node) => {
          const element = node as HTMLElement;
          return [
            element.getAttribute("data-runtime-boundary") ?? "",
            element.getAttribute("title") ?? "",
            element.getAttribute("aria-description") ?? "",
            element.textContent ?? ""
          ];
        })
        .join(" ");
      return {
        runtimeLabelsPresent: labels.every((label) =>
          `${boundaryText} ${fullText}`.includes(label)
        ),
        runtimeLabelsVisibleInBody: labels.some((label) =>
          visibleLower.includes(label.toLowerCase())
        ),
        visibleBodyClean: forbidden.every(
          (term) => !visibleLower.includes(term.toLowerCase())
        )
      };
    },
    {
      forbidden: groupLogForbiddenVisibleTerms,
      labels: groupLogRuntimeLabels
    }
  );
}

async function runtimeBoundaryText(locator: Locator) {
  return locator.evaluate((node) =>
    [
      node.getAttribute("data-runtime-boundary") ?? "",
      node.getAttribute("title") ?? "",
      node.getAttribute("aria-description") ?? "",
      node.textContent ?? ""
    ].join(" ")
  );
}
