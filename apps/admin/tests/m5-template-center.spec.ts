import { expect, test, type Page } from "@playwright/test";

test("renders the M5-07 template center desktop flow", async ({ page }) => {
  await openLegacyEvidence(page);
  const shell = page.getByTestId("m5-template-center-shell");
  const tabs = page.getByTestId("m5-template-tabs");
  await expect(shell).toBeVisible();
  await expect(tabs).toContainText(
    /Knowledge[\s\S]*AI member[\s\S]*Config[\s\S]*Eval[\s\S]*Quick reply/
  );
  await expect(page.getByTestId("m5-template-cards")).toContainText(
    /Transit starter pack[\s\S]*Version v3[\s\S]*Last copied Tenant A[\s\S]*Eval passed[\s\S]*controlled:\/\/template\/knowledge/
  );

  await tabs.locator('[data-template-kind="ai_member"]').click();
  await expect(page.getByTestId("m5-template-cards")).toContainText(
    /Operations AI baseline[\s\S]*AI member operations/
  );
  await page.getByRole("button", { name: "Draft tenant copy" }).click();
  await expect(page.getByTestId("m5-template-copy-draft")).toContainText(
    /copy_to_tenant[\s\S]*ai_member[\s\S]*controlled:\/\/tenant-version\/ai_member[\s\S]*formal tenant write false[\s\S]*auto overwrite false[\s\S]*owner confirmation true/
  );
  await expect(
    page.getByRole("button", { name: "Sync suggestion disabled" })
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Production apply disabled" })
  ).toBeDisabled();

  await tabs.locator('[data-template-kind="quick_reply"]').click();
  await expect(page.getByTestId("m5-template-cards")).toContainText(
    /Human handoff replies[\s\S]*Quick reply operations/
  );
  await expect(shell).not.toContainText(
    /raw payload|jsonl|telegram payload|xlsx|ORD-|PAY-|TG-|phone|address|payment|secret|@[\w_]+/i
  );
});

test("keeps M5-07 template copy usable on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await openLegacyEvidence(page);
  const shell = page.getByTestId("m5-template-center-shell");
  const tabs = page.getByTestId("m5-template-tabs");
  await expect(shell).toBeVisible();
  await tabs.locator('[data-template-kind="config"]').click();
  await expect(page.getByTestId("m5-template-cards")).toContainText(
    "SLA and fuse defaults"
  );
  await page.getByRole("button", { name: "Draft tenant copy" }).click();
  await expect(page.getByTestId("m5-template-copy-draft")).toContainText(
    /config[\s\S]*controlled:\/\/tenant-version\/config/
  );
  const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
  expect(scrollWidth).toBeLessThanOrEqual(320);
});

async function openLegacyEvidence(page: Page) {
  await page.goto("/design");
  await page.getByRole("button", { name: "Open legacy evidence route" }).click();
  await expect(page.getByTestId("legacy-evidence-route")).toBeVisible();
}
