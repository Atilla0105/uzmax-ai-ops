import { expect, type Page } from "@playwright/test";

export async function openLegacyEvidence(page: Page) {
  await page.goto("/design");
  await openLegacyEvidenceFromCurrentPage(page);
}

export async function openLegacyEvidenceFromCurrentPage(page: Page) {
  const legacyButton = page.getByRole("button", {
    name: "Open legacy evidence route"
  });
  if ((await legacyButton.count()) === 0) {
    await page.getByRole("button", { name: "Back to group overview" }).click();
  }
  await page.getByRole("button", { name: "Open legacy evidence route" }).click();
  await expect(page.getByTestId("legacy-evidence-route")).toBeVisible();
}
