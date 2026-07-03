import { expect, test, type Page } from "@playwright/test";

const navWidth = async (page: Page) =>
  Math.round(
    await page
      .getByTestId("app-shell-nav")
      .evaluate((node) => node.getBoundingClientRect().width)
  );

const navIconCount = async (page: Page) =>
  page.getByTestId("app-shell-nav").locator(".uz-nav-item svg").count();

test("renders the M7 foundation AppShell frame and state matrix", async ({ page }) => {
  await page.goto("/design");

  await expect(page.getByTestId("admin-shell")).toBeVisible();
  await expect(page.getByTestId("app-shell-nav")).toBeVisible();
  await expect(page.getByTestId("tenant-switcher")).toBeVisible();
  await expect(page.getByLabel("Search")).toBeVisible();
  await expect(page.locator(".uz-topbar .uz-input svg")).toBeVisible();
  await expect(page.getByTestId("environment-marker")).toContainText("STAGING");
  await expect(page.getByTestId("system-heartbeat")).toContainText("68ms");
  await expect(page.getByRole("button", { name: "Notifications" })).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Notifications" }).locator("svg")
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "User menu" })).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "User menu" }).locator("svg")
  ).toBeVisible();

  await expect(page.getByRole("button", { name: "对话" })).toBeVisible();
  await expect(page.getByRole("button", { name: "工单" })).toBeVisible();
  await expect(page.getByRole("button", { name: "客户资产" })).toBeVisible();
  await expect(page.getByRole("button", { name: "订单" })).toBeVisible();
  await expect(page.getByRole("button", { name: "知识与资源" })).toBeVisible();
  await expect(page.getByRole("button", { name: "确认队列" })).toBeVisible();
  await expect(page.getByRole("button", { name: "评测中心" })).toBeVisible();
  await expect(page.getByRole("button", { name: "AI 成员" })).toBeVisible();
  await expect(page.getByRole("button", { name: "团队" })).toBeVisible();
  await expect(page.getByRole("button", { name: "配置" })).toBeVisible();
  await expect(page.getByRole("button", { name: "分析" })).toBeVisible();
  await expect(page.getByRole("button", { exact: true, name: "日志" })).toBeVisible();

  await expect(
    page.getByRole("button", { name: "Collapse navigation" }).locator("svg")
  ).toBeVisible();
  await expect.poll(async () => navIconCount(page)).toBe(19);
  await expect
    .poll(async () =>
      page
        .getByTestId("app-shell-nav")
        .locator(".uz-nav-item [data-icon-slot]")
        .evaluateAll((nodes) =>
          nodes.every((node) => (node.textContent ?? "").trim() === "")
        )
    )
    .toBe(true);
  await expect.poll(async () => navWidth(page)).toBe(232);

  await page.getByRole("button", { name: "Collapse navigation" }).click();
  await expect.poll(async () => navWidth(page)).toBe(68);
  await expect.poll(async () => navIconCount(page)).toBe(19);
  expect(
    await page.getByTestId("app-shell-nav").evaluate((nav) => {
      const navRect = nav.getBoundingClientRect();
      return Array.from(nav.querySelectorAll(".uz-nav-item svg")).every((icon) => {
        const rect = icon.getBoundingClientRect();
        return (
          rect.width > 0 && rect.left >= navRect.left && rect.right <= navRect.right
        );
      });
    })
  ).toBe(true);
  await page.getByRole("button", { name: "Expand navigation" }).click();

  await page.getByTestId("tenant-switcher").selectOption("tenant-b");
  await expect(page.getByText("Group / Tenant B")).toBeVisible();
  await expect(page.getByTestId("environment-marker")).toContainText("STAGING");
  await expect(page.getByTestId("m7-degraded-bar")).toContainText("Connector degraded");

  await expect(page.getByTestId("m7-state-loading")).toContainText("Loading");
  await expect(page.getByTestId("m7-state-empty")).toContainText("Empty");
  await expect(page.getByTestId("m7-state-error")).toContainText("Error");
  await expect(page.getByTestId("m7-state-permission")).toContainText(
    "Permission denied"
  );
  await expect(page.getByTestId("m7-state-degraded")).toContainText("Degraded");
});

test("keeps the M7 foundation shell within the 320px fallback width", async ({
  page
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/design");

  await expect(page.getByTestId("admin-shell")).toBeVisible();
  await expect(page.getByTestId("m7-foundation-preview")).toBeVisible();
  await expect(page.getByTestId("m7-state-permission")).toContainText(
    "Permission denied"
  );

  const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
  expect(scrollWidth).toBeLessThanOrEqual(320);
});
