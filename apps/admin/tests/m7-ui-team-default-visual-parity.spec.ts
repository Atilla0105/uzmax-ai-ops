import { mkdirSync, writeFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

const artifactDir = "/tmp/uzmax-m7-ui-88-team-default-visual-parity-refresh";
const runtimeLabels = [
  "degraded",
  "mock",
  "read-only",
  "browser-local only",
  "no production authz write",
  "no team mutation",
  "no invite email send",
  "no Telegram binding change",
  "no audit write"
];
const forbiddenVisibleTerms = [
  ...runtimeLabels,
  "local-only",
  "local only",
  "no production"
];

mkdirSync(artifactDir, { recursive: true });

test.beforeEach(async ({ page }) => {
  await page.route("**/conversation-ticket/conversations", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
  await page.route("**/confirmation-queue/items?status=pending", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
});

test("keeps tenant.team default body operational while retaining hidden runtime boundaries", async ({
  page
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openTeam(page);

  await expect(page.getByTestId("m7-team-page")).toHaveAttribute(
    "data-runtime-boundary",
    /no team mutation/
  );
  await expect(page.getByTestId("m7-team-runtime-note")).toHaveAttribute("hidden", "");
  await expect(page.getByTestId("m7-team-runtime-note")).toContainText(
    "no Telegram binding change"
  );
  await expect(page.getByTestId("m7-team-page")).toContainText("团队");
  await expect(page.getByTestId("m7-team-page")).toContainText("成员");
  await expect(page.getByTestId("m7-team-page")).toContainText("角色管理");
  await expectVisibleBodyClean(page);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-team-default-clean.png`
  });

  await page.getByTestId("m7-team-primary").click();
  const invite = page.getByTestId("m7-team-invite-modal");
  await expect(invite).toBeVisible();
  await expect(invite).toHaveAttribute("data-runtime-boundary", /no invite email send/);
  await expect(invite).toContainText("待发送队列");
  await expectVisibleBodyClean(page);
  await page.getByTestId("m7-team-invite-name").fill("白玉");
  await page.getByTestId("m7-team-invite-email").fill("baiyu@local.io");
  await page.getByTestId("m7-team-invite-send").click();
  await expect(page.getByTestId("m7-team-toast")).toContainText("邀请已暂存：白玉");
  await expect(page.getByTestId("m7-team-toast")).toHaveAttribute(
    "data-runtime-boundary",
    /no team mutation/
  );
  await expectVisibleBodyClean(page);

  await page.locator(".uz-team-row").first().click();
  const drawer = page.getByTestId("m7-team-member-drawer");
  await expect(drawer).toBeVisible();
  await expect(drawer).toHaveAttribute(
    "data-runtime-boundary",
    /no Telegram binding change/
  );
  await drawer.getByRole("button", { name: "仅@提及" }).click();
  await expect(page.getByTestId("m7-team-toast")).toContainText("通知偏好已更新");
  await drawer.getByRole("button", { name: "Telegram 绑定" }).click();
  await expect(page.getByTestId("m7-team-toast")).toContainText(
    "Telegram 绑定预览已更新"
  );
  await drawer.getByTestId("m7-team-member-toggle-disable").click();
  await expect(page.getByTestId("m7-team-toast")).toContainText("账号已停用");
  await expectVisibleBodyClean(page);

  await page.getByRole("button", { name: "关闭成员详情" }).click();
  await page.getByTestId("m7-team-tab-roles").click();
  await page.getByTestId("m7-team-primary").click();
  await page.getByTestId("m7-team-role-name").fill("排班主管");
  await page.getByTestId("m7-team-role-save").click();
  await expect(page.getByTestId("m7-team-toast")).toContainText("角色已创建：排班主管");
  await expectVisibleBodyClean(page);

  const desktop = await collectMetrics(page);
  expect(desktop.activePageId).toBe("tenant.team");
  expect(desktop.runtimeLabelsPresent).toBe(true);
  expect(desktop.runtimeLabelsVisibleInBody).toBe(false);
  expect(desktop.visibleBodyClean).toBe(true);

  for (const state of ["loading", "empty", "error", "permission"]) {
    await openTeam(page, `?m7TeamState=${state}`);
    await expect(page.getByTestId(`m7-team-state-${state}`)).toBeVisible();
    await expect(page.getByTestId(`m7-team-state-${state}`)).toHaveAttribute(
      "data-runtime-boundary",
      /browser-local only/
    );
    await expectVisibleBodyClean(page);
  }

  await openTeam(page);
  await page.getByRole("button", { name: "Collapse navigation" }).click();
  const collapsed = await collectMetrics(page);
  expect(collapsed.navWidth).toBe(68);
  expect(collapsed.visibleBodyClean).toBe(true);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-team-collapsed-clean.png`
  });

  await page.setViewportSize({ width: 320, height: 900 });
  await openTeam(page);
  const mobile = await collectMetrics(page);
  expect(mobile.bodyScrollWidth).toBeLessThanOrEqual(320);
  expect(mobile.documentScrollWidth).toBeLessThanOrEqual(320);
  expect(mobile.visibleBodyClean).toBe(true);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-team-mobile-320-default-clean.png`
  });

  writeFileSync(
    `${artifactDir}/metrics.json`,
    `${JSON.stringify({ collapsed, desktop, mobile }, null, 2)}\n`
  );
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

async function expectVisibleBodyClean(page: Page) {
  const body = await page.evaluate(() => document.body.innerText.toLowerCase());
  for (const term of forbiddenVisibleTerms)
    expect(body).not.toContain(term.toLowerCase());
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
      const fullText = document.body.textContent ?? "";
      return {
        activePageId: document
          .querySelector('[data-testid="admin-shell"]')
          ?.getAttribute("data-active-page-id"),
        bodyScrollWidth: document.body.scrollWidth,
        boundaryText,
        documentScrollWidth: document.documentElement.scrollWidth,
        navWidth: Math.round(
          document
            .querySelector('[data-testid="app-shell-nav"]')
            ?.getBoundingClientRect().width ?? 0
        ),
        runtimeLabelsPresent: labels.every((label) =>
          `${boundaryText} ${fullText}`.includes(label)
        ),
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
