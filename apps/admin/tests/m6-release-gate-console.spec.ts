import { expect, test } from "@playwright/test";
import { openLegacyEvidence } from "./helpers/openLegacyEvidence";

test("renders the M6-01 evidence-driven release gate console", async ({ page }) => {
  await openLegacyEvidence(page);

  const release = page.getByTestId("release-readiness");
  await expect(release).toContainText("M5 evidence is owner accepted");
  await expect(release).toContainText(
    "M6 is closed as an evidence/runtime-hardening no-go package"
  );
  await expect(release).toContainText("external-input blockers are cleared");
  await expect(release).toContainText("GA-0 and 1.0 remain locked");

  await expect(page.getByTestId("release-gate-M1")).toContainText("Accepted");
  await expect(page.getByTestId("release-gate-M5")).toContainText(
    "accepted for milestone evidence"
  );
  await expect(page.getByTestId("release-gate-M6")).toContainText("Closed");
  await expect(page.getByTestId("release-gate-M6")).toContainText(
    "GA-0 remains locked"
  );
  await expect(page.getByTestId("release-gate-GA-0")).toContainText(
    "L-01 checklist not green"
  );
  await expect(page.getByTestId("release-gate-1.0")).toContainText(
    "Full P0/P1/P2 rollup not closed"
  );

  await expect(release.getByRole("link", { name: "M6-00 signoff" })).toHaveAttribute(
    "href",
    "docs/evidence/M6/M6-00-m5-signoff-and-m6-readiness-pack.md"
  );
  await expect(release.getByRole("link", { name: "M6B-17 closure" })).toHaveAttribute(
    "href",
    "docs/evidence/M6B/M6B-17-ga0-external-blocker-rollup.md"
  );

  await expect(release).not.toContainText("M6 release hardening is in progress");
  await expect(release).not.toContainText("M1-05 open");
  await expect(release).not.toContainText("Owner: pending");
  await expect(
    page.getByRole("button", { name: "GA-0 open action locked" })
  ).toBeDisabled();
});
