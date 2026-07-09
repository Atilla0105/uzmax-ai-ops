import { expect, test } from "@playwright/test";
import { openLegacyEvidence } from "./helpers/openLegacyEvidence";

test("renders the current release gate console while preserving M6 closure", async ({
  page
}) => {
  await openLegacyEvidence(page);

  const release = page.getByTestId("release-readiness");
  await expect(release).toContainText(
    "Minimal Bot-only GA-0 signoff path is in progress"
  );
  await expect(release).toContainText("G-04/G-06 are owner-deferred");
  await expect(release).toContainText("not passed");
  await expect(release).toContainText("GA-0 action and 1.0 remain locked");

  await expect(page.getByTestId("release-gate-M1")).toContainText("Accepted");
  await expect(page.getByTestId("release-gate-M5")).toContainText(
    "accepted for milestone evidence"
  );
  await expect(page.getByTestId("release-gate-M6")).toContainText("Closed");
  await expect(page.getByTestId("release-gate-M6")).toContainText(
    "GA-0 remains locked"
  );
  await expect(page.getByTestId("release-gate-GA-0")).toContainText(
    "M9-04 employee admin read"
  );
  await expect(page.getByTestId("release-gate-GA-0")).toContainText(
    "M9-05 Bot redline/fuse leave-ticket drill"
  );
  await expect(page.getByTestId("release-gate-GA-0")).toContainText(
    "M9-06 owner open record"
  );
  await expect(page.getByTestId("release-gate-GA-0")).toContainText(
    "minimal Bot-only path selected"
  );
  await expect(page.getByTestId("release-gate-GA-0")).toContainText(
    "deferred not passed"
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
  await expect(
    release.getByRole("link", { name: "GA-0 minimal boundary" })
  ).toHaveAttribute("href", "docs/evidence/GA-0/GA0-00-minimal-boundary.md");

  await expect(release).not.toContainText("M6 release hardening is in progress");
  await expect(release).not.toContainText("M1-05 open");
  await expect(release).not.toContainText("Owner: pending");
  await expect(release).not.toContainText("GA-0 opened");
  await expect(release).not.toContainText("1.0 release approved");
  await expect(
    page.getByRole("button", { name: "GA-0 open action locked" })
  ).toBeDisabled();
});
