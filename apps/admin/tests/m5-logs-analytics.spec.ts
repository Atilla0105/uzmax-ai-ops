import { expect, test } from "@playwright/test";

test("renders the M5-06 logs analytics desktop flow", async ({ page }) => {
  await page.goto("/design");
  const shell = page.getByTestId("m5-logs-analytics-shell");
  const filters = page.getByTestId("m5-log-filters");
  await expect(shell).toBeVisible();
  await expect(page.getByTestId("m5-analytics-board")).toContainText(
    /Resolution rate[\s\S]*Handoff rate[\s\S]*SLA[\s\S]*Cost[\s\S]*Top questions[\s\S]*Order query[\s\S]*Draft adoption[\s\S]*Knowledge health[\s\S]*Confirmation queue 7-day pass rate[\s\S]*Distill frequency[\s\S]*Real traffic baseline/
  );

  await expect(page.getByTestId("m5-dimension-export-controls")).toContainText(
    /Tenant[\s\S]*Member[\s\S]*AI member[\s\S]*Channel[\s\S]*Intent[\s\S]*Time grain[\s\S]*Order status[\s\S]*Handoff reason/
  );
  await page.getByRole("button", { name: /AI member/ }).click();
  await expect(page.getByRole("button", { name: /AI member/ })).toHaveAttribute(
    "aria-pressed",
    "true"
  );
  await page.getByRole("button", { name: "Draft export review" }).click();
  await expect(page.getByTestId("m5-export-draft")).toContainText(
    /draft_requires_owner_confirmation[\s\S]*formal export write false[\s\S]*owner confirmation true[\s\S]*controlled:\/\/analytics\/view\/m5-06/
  );
  await expect(
    page.getByRole("button", { name: "Confirm export disabled" })
  ).toBeDisabled();

  await expect(page.getByTestId("m5-log-table")).toContainText(
    /password[\s\S]*Member Alpha[\s\S]*Tashkent \/ 192\.0\.2\.10[\s\S]*Chrome desktop/
  );
  await page.getByLabel("Log filter").fill("Beta");
  await expect(page.getByTestId("m5-log-table")).toContainText("Member Beta");
  await expect(page.getByTestId("m5-log-table")).not.toContainText("Member Alpha");

  await filters.getByRole("button", { name: "presence" }).click();
  await expect(page.getByTestId("m5-log-table")).toContainText(
    /Member[\s\S]*Account status[\s\S]*Update method[\s\S]*Update time[\s\S]*Duration/
  );
  await page.getByLabel("Log filter").fill("");
  await page.getByLabel("High-risk only").check();
  await expect(page.getByTestId("m5-log-table")).toContainText(
    /AI member Ops[\s\S]*breaker/
  );

  await filters.getByRole("button", { name: "operation" }).click();
  await expect(page.getByTestId("m5-log-table")).toContainText(
    /Time[\s\S]*Operator[\s\S]*Module[\s\S]*Function[\s\S]*Object[\s\S]*Content/
  );
  await expect(page.getByTestId("m5-log-table")).toContainText(
    "controlled://conversation/high-risk-a"
  );
  await expect(shell).not.toContainText(
    /raw payload|jsonl|telegram payload|xlsx|ORD-|PAY-|TG-|phone|address|payment|secret|@[\w_]+/i
  );
});

test("keeps M5-06 logs and essential metrics usable on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/design");
  const shell = page.getByTestId("m5-logs-analytics-shell");
  const filters = page.getByTestId("m5-log-filters");
  await expect(shell).toBeVisible();
  await expect(page.getByTestId("m5-mobile-metrics")).toContainText(
    /Resolution rate[\s\S]*74%[\s\S]*Confirmation queue 7-day pass rate[\s\S]*63%/
  );
  await expect(page.getByTestId("m5-dimension-export-controls")).toBeHidden();
  await page.getByLabel("Log filter").fill("Alpha");
  await expect(page.getByTestId("m5-log-table")).toContainText("Member Alpha");
  await page.getByLabel("Log filter").fill("");
  await filters.getByRole("button", { name: "operation" }).click();
  await expect(page.getByTestId("m5-log-table")).toContainText("Jump ref");
  await expect(page.getByTestId("m5-log-table")).toContainText(
    "controlled://config/version-a"
  );
  const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
  expect(scrollWidth).toBeLessThanOrEqual(320);
});
