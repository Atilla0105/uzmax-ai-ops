import { expect, test } from "@playwright/test";

test("switches AppShell nav into the M7 page outlet without losing legacy evidence", async ({
  page
}) => {
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
  await expect(page.getByTestId("planned-page-state")).toContainText(
    "Page migration not started"
  );
  await expect(page.getByTestId("page-scaffold")).toContainText(
    "M7-UI-04M-tenant-queue"
  );
  await expect(page.getByTestId("page-scaffold")).toContainText(
    "docs/admin-ui-page-migration-ledger.md"
  );
  await expect(page.getByTestId("group-layer")).toHaveCount(0);

  await page.getByRole("button", { name: "发布与验收" }).click();
  await expect(page.getByTestId("page-outlet")).toHaveAttribute(
    "data-page-id",
    "group.release"
  );
  await expect(page.getByTestId("page-scaffold")).toContainText(
    "M7-UI-04E-group-release"
  );

  await page.getByRole("button", { name: "Open legacy evidence route" }).click();
  await expect(page.getByTestId("legacy-evidence-route")).toHaveAttribute(
    "data-page-id",
    "legacy.evidence"
  );
  await expect(page.getByTestId("group-layer")).toBeVisible();
  await expect(page.getByTestId("tenant-layer")).toBeVisible();
  await expect(page.getByTestId("release-readiness")).toBeVisible();
});
