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
  await expect(page.getByRole("button", { name: "Open Queue review" })).toBeVisible();
  await expect(page.getByTestId("m7-batch-action-bar")).toContainText("Selected rows");
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

test("supports confirmation accessibility, focus trap and reason flow", async ({
  page
}) => {
  await page.goto("/design");

  const opener = page.getByRole("button", { name: "Open confirmation" });
  await opener.click();

  const dialog = page.getByRole("dialog", { name: "Confirm gate-bound action" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute("aria-describedby", /.+/);
  const descriptionId = await dialog.getAttribute("aria-describedby");
  expect(descriptionId).toBeTruthy();
  await expect(page.locator(`[id="${descriptionId}"]`)).toHaveText(
    "Reason is required for gate-bound or destructive operations."
  );

  const reason = page.getByPlaceholder("Record the operational reason");
  await expect(reason).toHaveJSProperty("required", true);
  await expect(reason).toHaveAttribute("aria-required", "true");
  await expect(reason).toBeFocused();
  await expect(page.getByRole("button", { name: "Confirm hold" })).toBeDisabled();

  await page.keyboard.press("Shift+Tab");
  await expect(page.getByRole("button", { name: "Cancel" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(reason).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(page.getByTestId("m7-confirm-modal")).toHaveCount(0);
  await expect(opener).toBeFocused();

  await opener.click();
  await page.getByPlaceholder("Record the operational reason").fill("Pattern gate");
  await page.getByRole("button", { name: "Confirm hold" }).click();
  await expect(page.getByTestId("m7-confirm-modal")).toHaveCount(0);
  await expect(page.getByTestId("m7-toast-host")).toContainText(
    "Confirmation preview recorded"
  );
});

test("supports table selection, keyboard row action and stacked toasts", async ({
  page
}) => {
  await page.goto("/design");

  const toastHost = page.getByTestId("m7-toast-host");
  await expect(page.getByTestId("m7-batch-action-bar")).toContainText("2");

  await page.getByRole("checkbox", { name: "Select Queue review" }).click();
  await expect(toastHost).not.toContainText("Row action preview");
  await expect(page.getByTestId("m7-batch-action-bar")).toContainText("1");

  await page.getByRole("checkbox", { name: "Select all rows" }).click();
  await expect(page.getByTestId("m7-batch-action-bar")).toContainText("4");
  await page.getByRole("checkbox", { name: "Select all rows" }).click();
  await expect(page.getByTestId("m7-batch-action-bar")).toHaveCount(0);

  await page.getByRole("button", { name: "Open Queue review" }).focus();
  await page.keyboard.press("Enter");
  await expect(toastHost).toContainText("Row action preview: Queue review");

  await page.getByRole("button", { name: "Apply" }).click();
  await expect(toastHost).toContainText("Filter preview updated");
  await expect(toastHost).toContainText("Filter preview saved");

  const toastIds = await toastHost
    .locator(".uz-toast")
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-toast-id")));
  expect(new Set(toastIds).size).toBe(toastIds.length);
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
