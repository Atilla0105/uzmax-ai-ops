import { expect, test } from "@playwright/test";

test("loads the M1 admin group and tenant shell", async ({ page }) => {
  await page.goto("/design");
  await expect(page.getByTestId("admin-shell")).toBeVisible();
  await expect(page.getByTestId("tenant-switcher")).toBeVisible();
  await expect(page.getByLabel("Search")).toBeVisible();
  await expect(page.getByRole("button", { name: "Notifications" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "User menu" })).toBeDisabled();
  await expect(page.getByTestId("group-layer")).toContainText("Tenant health");
  await expect(page.getByTestId("tenant-layer")).toContainText("Authorized workspace");
  await expect(page.getByTestId("authz-entry")).toContainText(
    "Authorization workbench"
  );
  await page.getByTestId("tenant-switcher").selectOption("tenant-b");
  await expect(page.getByText("Group / Tenant B")).toBeVisible();
  await expect(page.getByTestId("tenant-health-entry")).toContainText(
    "Connector degraded"
  );
  await expect(page.getByTestId("release-readiness")).toContainText("Gate status");
  await expect(page.getByTestId("release-readiness")).toContainText("Owner:");
  await expect(page.getByTestId("release-readiness")).toContainText("Blocker:");
  await expect(page.getByTestId("release-readiness")).toContainText("ADR-001");
  await expect(
    page.getByRole("button", { name: "GA-0 open action locked" })
  ).toBeDisabled();
  await expect(page.getByTestId("group-layer")).not.toContainText(
    /phone|transcript|@/i
  );
});

test("keeps the M1 shell usable at the narrow mobile floor", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 860 });
  await page.goto("/design");
  await expect(page.getByTestId("admin-shell")).toBeVisible();
  await expect(page.getByTestId("release-readiness")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "GA-0 open action locked" })
  ).toBeVisible();
});

test("keeps the M1 shell usable at the tablet breakpoint", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 900 });
  await page.goto("/design");
  await expect(page.getByTestId("tenant-switcher")).toBeVisible();
  await expect(page.getByLabel("Search")).toBeVisible();
  await expect(page.getByTestId("release-readiness")).toContainText("Owner:");
});
