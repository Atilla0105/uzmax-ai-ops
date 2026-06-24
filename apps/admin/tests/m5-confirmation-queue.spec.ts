import { expect, test } from "@playwright/test";

test("renders the M5-04 confirmation queue desktop flow", async ({ page }) => {
  await page.goto("/design");
  const shell = page.getByTestId("m5-confirmation-queue-shell");
  await expect(shell).toBeVisible();
  await expect(page.getByTestId("m5-queue-health")).toContainText(
    /Today candidates[\s\S]*8\/10[\s\S]*Daily cap[\s\S]*7-day pass rate[\s\S]*weekly until owner recovery/
  );
  await expect(page.getByTestId("m5-amber-banner")).toContainText("Amber");
  await page.getByRole("button", { name: "View reason" }).click();
  await expect(page.getByTestId("m5-amber-banner")).toContainText(
    "3-day pass rate below 40%"
  );
  await page.getByRole("button", { name: "Draft recover daily" }).click();
  await expect(page.getByTestId("m5-recovery-draft")).toContainText("Local draft");
  await expect(
    page.getByRole("button", { name: "Confirm recovery disabled" })
  ).toBeDisabled();

  await expect(page.getByTestId("m5-card-knowledge")).toContainText("Knowledge fact");
  await expect(page.getByTestId("m5-card-profile")).toContainText("Profile field");
  await expect(page.getByTestId("m5-card-eval")).toContainText("Eval sample");
  await expect(page.getByTestId("m5-card-conflict")).toContainText("Conflict diff");
  await expect(page.getByTestId("m5-conflict-diff")).toContainText(
    /Current[\s\S]*Candidate/
  );

  await page.keyboard.press("j");
  await expect(page.getByTestId("m5-state-profile")).toContainText("selected");
  await page.keyboard.press("a");
  await expect(page.getByTestId("m5-state-profile")).toContainText("approved");
  await page.keyboard.press("k");
  await expect(page.getByTestId("m5-state-knowledge")).toContainText("selected");
  await page.keyboard.press("e");
  await expect(page.getByTestId("m5-details-knowledge")).toContainText(
    "Edit draft ref"
  );
  await page.keyboard.press("d");
  await expect(page.getByTestId("m5-state-knowledge")).toContainText("discarded");
  await expect(shell).not.toContainText(
    /raw payload|jsonl|telegram payload|csv export|xlsx|ORD-|PAY-|TG-|phone|address|payment|secret|@[\w_]+|\+?\d[\d\s-]{6,}/i
  );
});

test("keeps the M5-04 confirmation queue usable on mobile fallback", async ({
  page
}) => {
  await page.setViewportSize({ width: 320, height: 860 });
  await page.goto("/design");
  await expect(page.getByTestId("m5-confirmation-queue-shell")).toBeVisible();
  await expect(page.getByRole("button", { name: "Approve" }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Discard" }).first()).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Edit on desktop" }).first()
  ).toBeDisabled();
  await expect(page.getByRole("button", { exact: true, name: "Edit" })).toHaveCount(0);
  await page.getByRole("button", { name: "Approve" }).first().click();
  await expect(page.getByTestId("m5-state-knowledge")).toContainText("approved");
  await page.getByRole("button", { name: "Discard" }).first().click();
  await expect(page.getByTestId("m5-state-knowledge")).toContainText("discarded");
  const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
  expect(scrollWidth).toBeLessThanOrEqual(320);
});
