import { expect, test } from "@playwright/test";

test("switches AppShell nav into the M7 page outlet without losing legacy evidence", async ({
  page
}) => {
  await page.route("**/confirmation-queue/items?status=pending", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
  await page.goto("/design");

  await expect(page.getByTestId("admin-shell")).toBeVisible();
  await expect(page.getByTestId("app-shell-nav")).toBeVisible();
  await expect(page.getByTestId("tenant-switcher")).toBeVisible();
  await expect(page.getByTestId("environment-marker")).toContainText("STAGING");
  await expect(page.getByTestId("system-heartbeat")).toContainText("68ms");
  await expect(page.getByTestId("legacy-evidence-route")).toBeVisible();
  await expect(page.getByTestId("group-layer")).toContainText("Tenant health");
  await expect(page.getByTestId("release-readiness")).toContainText("Gate status");

  await page.getByRole("button", { name: "确认队列" }).click();
  await expect(page.getByTestId("page-outlet")).toHaveAttribute(
    "data-page-id",
    "tenant.queue"
  );
  await expect(page.getByTestId("m7-confirmation-queue-page")).toBeVisible();
  await expect(page.getByTestId("page-scaffold")).toHaveCount(0);
  await expect(page.getByTestId("planned-page-state")).toHaveCount(0);
  await expect(page.getByTestId("group-layer")).toHaveCount(0);

  await page.getByRole("button", { name: "发布与验收" }).click();
  await expect(page.getByTestId("page-outlet")).toHaveAttribute(
    "data-page-id",
    "group.release"
  );
  await expect(page.getByTestId("m7-release-acceptance-page")).toBeVisible();
  await expect(page.getByTestId("page-scaffold")).toHaveCount(0);
  await expect(page.getByTestId("m7-release-high-risk-actions")).toContainText(
    "Only the project owner"
  );

  await page.goto("/design");
  await expect(page.getByTestId("legacy-evidence-route")).toHaveAttribute(
    "data-page-id",
    "legacy.evidence"
  );
  await expect(page.getByTestId("release-readiness")).toBeVisible();
});
