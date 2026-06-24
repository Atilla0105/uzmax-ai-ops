import { expect, test } from "@playwright/test";

test("spans the M5 operations loop closeout on desktop", async ({ page }) => {
  await page.goto("/design");

  await expect(page.getByTestId("m5-confirmation-queue-shell")).toBeVisible();
  await expect(page.getByTestId("m5-queue-health")).toContainText(
    /Daily cap[\s\S]*10[\s\S]*7-day pass rate[\s\S]*36%/
  );
  await page.getByRole("button", { name: "View reason" }).click();
  await expect(page.getByTestId("m5-amber-banner")).toContainText(
    /3-day pass rate below 40%[\s\S]*owner confirmation/
  );
  await page.getByRole("button", { name: "Draft recover daily" }).click();
  await expect(page.getByTestId("m5-recovery-draft")).toContainText(
    "controlled://confirmation/recovery-draft"
  );
  await expect(page.getByTestId("m5-conflict-diff")).toContainText(
    /Current[\s\S]*Candidate/
  );

  const aiShell = page.getByTestId("m5-ai-member-console-shell");
  await expect(aiShell).toBeVisible();
  await aiShell.getByRole("button", { name: "Emergency stop local" }).click();
  await expect(page.getByTestId("m5-ai-action-draft")).toContainText(
    /emergency_stop[\s\S]*formal runtime write false[\s\S]*owner confirmation true/
  );
  await aiShell.getByRole("button", { exact: true, name: "Draft recovery" }).click();
  await expect(page.getByTestId("m5-ai-action-draft")).toContainText(
    /recover_online[\s\S]*target online/
  );

  const logsShell = page.getByTestId("m5-logs-analytics-shell");
  await expect(logsShell).toBeVisible();
  await logsShell.getByRole("button", { name: "Draft export review" }).click();
  await expect(page.getByTestId("m5-export-draft")).toContainText(
    /formal export write false[\s\S]*owner confirmation true/
  );
  await page
    .getByTestId("m5-log-filters")
    .getByRole("button", { name: "operation" })
    .click();
  await expect(page.getByTestId("m5-log-table")).toContainText(
    "controlled://conversation/high-risk-a"
  );

  const templateShell = page.getByTestId("m5-template-center-shell");
  await expect(templateShell).toBeVisible();
  await page
    .getByTestId("m5-template-tabs")
    .locator('[data-template-kind="config"]')
    .click();
  await templateShell.getByRole("button", { name: "Draft tenant copy" }).click();
  await expect(page.getByTestId("m5-template-copy-draft")).toContainText(
    /config[\s\S]*formal tenant write false[\s\S]*auto overwrite false/
  );
  await expect(
    templateShell.getByRole("button", { name: "Production apply disabled" })
  ).toBeDisabled();
});

test("keeps M5 closeout essentials usable at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 980 });
  await page.goto("/design");

  await expect(page.getByTestId("m5-confirmation-queue-shell")).toBeVisible();
  await expect(page.getByTestId("m5-ai-mobile-fallback")).toBeVisible();
  await page
    .getByTestId("m5-ai-mobile-fallback")
    .getByRole("button", { name: "Emergency stop fallback" })
    .click();
  await expect(page.getByTestId("m5-ai-action-draft")).toContainText("emergency_stop");
  await page.getByLabel("Log filter").fill("Alpha");
  await expect(page.getByTestId("m5-log-table")).toContainText("Member Alpha");
  await page
    .getByTestId("m5-template-tabs")
    .locator('[data-template-kind="quick_reply"]')
    .click();
  await expect(page.getByTestId("m5-template-cards")).toContainText(
    "Human handoff replies"
  );

  const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
  expect(scrollWidth).toBeLessThanOrEqual(320);
});
