import { expect, test } from "@playwright/test";

test("loads the M0 design harness", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("design-harness")).toBeVisible();
});
