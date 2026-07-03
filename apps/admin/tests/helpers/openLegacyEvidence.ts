import { expect, type Page } from "@playwright/test";

export async function openLegacyEvidence(page: Page) {
  await page.goto("/design");
  await openLegacyEvidenceFromCurrentPage(page);
}

export async function openLegacyEvidenceFromCurrentPage(page: Page) {
  await page.getByRole("button", { name: "Open legacy evidence route" }).click();
  await expect(page.getByTestId("legacy-evidence-route")).toBeVisible();
}
