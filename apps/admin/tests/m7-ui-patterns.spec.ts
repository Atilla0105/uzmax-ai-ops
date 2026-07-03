import { expect, test } from "@playwright/test";

test("renders shared operational patterns in the design preview", async ({ page }) => {
  await page.goto("/design");

  await expect(page.getByTestId("m7-operational-patterns")).toBeVisible();
  await expect(page.getByTestId("m7-page-toolbar")).toContainText(
    "Operational patterns"
  );
  await expect(page.getByTestId("m7-filter-bar")).toBeVisible();
  await expect(page.getByTestId("m7-data-table")).toContainText("Queue review");
  await expect(page.getByRole("checkbox", { name: "Select all rows" })).toBeVisible();
  await expect(page.getByTestId("m7-batch-action-bar")).toContainText(
    "Selected rows"
  );
  await expect(page.getByTestId("m7-side-panel")).toContainText("Supporting panel");
  await expect(page.getByTestId("m7-operational-degraded-bar")).toContainText(
    "Shared degraded"
  );

  for (const id of [
    "m7-message-system",
    "m7-message-customer",
    "m7-message-ai",
    "m7-message-human"
  ]) {
    await expect(page.getByTestId(id)).toBeVisible();
  }
});

test("supports confirmation cancel, confirm reason and toast feedback", async ({
  page
}) => {
  await page.goto("/design");

  await page.getByRole("button", { name: "Open confirmation" }).click();
  await expect(page.getByTestId("m7-confirm-modal")).toBeVisible();
  await expect(page.getByRole("button", { name: "Confirm hold" })).toBeDisabled();
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(page.getByTestId("m7-confirm-modal")).toHaveCount(0);

  await page.getByRole("button", { name: "Open confirmation" }).click();
  await page.getByPlaceholder("Record the operational reason").fill("Pattern gate");
  await page.getByRole("button", { name: "Confirm hold" }).click();
  await expect(page.getByTestId("m7-confirm-modal")).toHaveCount(0);
  await expect(page.getByTestId("m7-toast-host")).toContainText(
    "Confirmation preview recorded"
  );
});

test("keeps shared operational patterns within the 320px fallback width", async ({
  page
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/design");

  await expect(page.getByTestId("m7-operational-patterns")).toBeVisible();
  await expect(page.getByTestId("m7-data-table")).toBeVisible();
  await expect(page.getByTestId("m7-message-human")).toBeVisible();

  const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
  expect(scrollWidth).toBeLessThanOrEqual(320);
});
