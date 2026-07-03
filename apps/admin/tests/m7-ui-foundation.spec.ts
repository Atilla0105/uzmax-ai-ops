import { expect, test, type Page } from "@playwright/test";

const navWidth = async (page: Page) =>
  Math.round(
    await page
      .getByTestId("app-shell-nav")
      .evaluate((node) => node.getBoundingClientRect().width)
  );

const navIconCount = async (page: Page) =>
  page.getByTestId("app-shell-nav").locator(".uz-nav-item svg").count();

test("renders the group-layer M7 foundation AppShell frame", async ({ page }) => {
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

  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "group"
  );
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "group.overview"
  );
  await expect(page.getByRole("button", { name: "集团总览" })).toBeVisible();
  await expect(page.getByRole("button", { name: "发布与验收" })).toBeVisible();
  await expect(page.getByRole("button", { name: "确认队列" })).toHaveCount(0);

  await expect(
    page.getByRole("button", { name: "Collapse navigation" }).locator("svg")
  ).toBeVisible();
  await expect.poll(async () => navIconCount(page)).toBe(7);
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
  await expect.poll(async () => navIconCount(page)).toBe(7);
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
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "tenant"
  );
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.conversations"
  );
  await expect.poll(async () => navIconCount(page)).toBe(12);
  await expect(page.getByTestId("route-breadcrumb")).toContainText("Tenant B");
  await expect(page.getByRole("button", { name: "确认队列" })).toBeVisible();
  await expect(page.getByRole("button", { name: "集团总览" })).toHaveCount(0);
  await expect(page.getByTestId("environment-marker")).toContainText("STAGING");
  await expect(page.getByTestId("page-scaffold")).toContainText(
    "M7-UI-04H-tenant-conversations"
  );
});

test("keeps the M7 foundation shell within the 320px fallback width", async ({
  page
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/design");

  await expect(page.getByTestId("admin-shell")).toBeVisible();
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "group"
  );

  const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
  expect(scrollWidth).toBeLessThanOrEqual(320);
});
