import { expect, test, type Page } from "@playwright/test";

test("renders the M5-05 AI member console desktop flow", async ({ page }) => {
  await openLegacyEvidence(page);
  const shell = page.getByTestId("m5-ai-member-console-shell");
  await expect(shell).toBeVisible();
  await expect(page.getByTestId("m5-ai-member-summary")).toContainText(
    /Operations AI[\s\S]*breaker_offline[\s\S]*controlled:\/\/ai-member\/version\/v1[\s\S]*controlled:\/\/ai-member\/persona\/v1/
  );
  await expect(page.getByTestId("m5-ai-breaker-reason")).toContainText(
    "controlled://ai-member/breaker-low-pass-rate"
  );
  await page.getByRole("button", { name: "View breaker reason" }).click();
  await expect(page.getByTestId("m5-ai-breaker-reason")).toContainText(
    "3-day pass rate below recovery floor"
  );

  await page.getByRole("button", { name: "Manual offline local" }).click();
  await expect(page.getByTestId("m5-ai-member-status")).toContainText("manual_offline");
  await expect(page.getByTestId("m5-ai-action-draft")).toContainText(
    /manual_offline[\s\S]*formal runtime write false/
  );

  await page.getByRole("button", { name: "Emergency stop local" }).click();
  await expect(page.getByTestId("m5-ai-member-status")).toContainText("disabled");
  await expect(page.getByTestId("m5-ai-action-draft")).toContainText(
    /emergency_stop[\s\S]*owner confirmation true/
  );

  await shell.getByRole("button", { exact: true, name: "Draft recovery" }).click();
  await expect(page.getByTestId("m5-ai-action-draft")).toContainText(
    /recover_online[\s\S]*target online[\s\S]*owner confirmation true/
  );
  await expect(
    page.getByRole("button", { name: "Confirm AI recovery disabled" })
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Production action disabled" })
  ).toBeDisabled();

  await page.getByTestId("m5-ai-capability-quote").click();
  await expect(page.getByTestId("m5-ai-capability-quote")).toContainText("enabled");
  await expect(page.getByTestId("m5-ai-action-draft")).toContainText(
    /toggle_capability[\s\S]*quote enabled/
  );
  await expect(shell).not.toContainText(
    /raw payload|jsonl|telegram payload|csv export|xlsx|ORD-|PAY-|TG-|phone|address|payment|secret|@[\w_]+|\+?\d[\d\s-]{6,}/i
  );
});

test("keeps the M5-05 AI member console usable on mobile fallback", async ({
  page
}) => {
  await page.setViewportSize({ width: 320, height: 860 });
  await openLegacyEvidence(page);
  const shell = page.getByTestId("m5-ai-member-console-shell");
  const fallback = page.getByTestId("m5-ai-mobile-fallback");
  await expect(shell).toBeVisible();
  await expect(fallback).toBeVisible();
  await expect(
    fallback.getByRole("button", { name: "Emergency stop fallback" })
  ).toBeVisible();
  await expect(
    fallback.getByRole("button", { name: "Draft recovery fallback" })
  ).toBeVisible();
  await expect(page.getByTestId("m5-ai-capabilities")).toBeHidden();
  await fallback.getByRole("button", { name: "Emergency stop fallback" }).click();
  await expect(page.getByTestId("m5-ai-member-status")).toContainText("disabled");
  await fallback.getByRole("button", { name: "Draft recovery fallback" }).click();
  await expect(page.getByTestId("m5-ai-action-draft")).toContainText("recover_online");
  const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
  expect(scrollWidth).toBeLessThanOrEqual(320);
});

async function openLegacyEvidence(page: Page) {
  await page.goto("/design");
  await page.getByRole("button", { name: "Open legacy evidence route" }).click();
  await expect(page.getByTestId("legacy-evidence-route")).toBeVisible();
}
