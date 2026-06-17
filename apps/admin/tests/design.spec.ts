import { expect, test } from "@playwright/test";

test("loads the M1 admin group and tenant shell", async ({ page }) => {
  await page.goto("/design");
  await expect(page.getByTestId("admin-shell")).toBeVisible();
  await expect(page.getByTestId("tenant-switcher")).toBeVisible();
  await expect(page.getByLabel("Search")).toBeVisible();
  await expect(page.getByRole("button", { name: "Notifications" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "User menu" })).toBeDisabled();
  await expect(page.getByTestId("group-layer")).toContainText("Tenant health");
  await expect(page.getByTestId("tenant-layer")).toContainText("Authorized workspace");
  await expect(page.getByTestId("authz-entry")).toContainText(
    "Authorization workbench"
  );
  await page.getByTestId("tenant-switcher").selectOption("tenant-b");
  await expect(page.getByText("Group / Tenant B")).toBeVisible();
  await expect(page.getByTestId("tenant-health-entry")).toContainText(
    "Connector degraded"
  );
  await expect(page.getByTestId("audit-config-entry")).toContainText(
    "config save and rollback"
  );
  await expect(page.getByTestId("release-readiness")).toContainText("Gate status");
  await expect(page.getByTestId("release-readiness")).toContainText("Owner:");
  await expect(page.getByTestId("release-readiness")).toContainText("Blocker:");
  await expect(page.getByTestId("release-readiness")).toContainText("ADR-001");
  await expect(
    page.getByRole("button", { name: "GA-0 open action locked" })
  ).toBeDisabled();
  await expect(page.getByTestId("group-layer")).not.toContainText(
    /phone|transcript|@/i
  );
});

test("renders the M2-04 conversation and ticket shell on desktop", async ({ page }) => {
  await page.goto("/design");
  await expect(page.getByTestId("m2-conversation-ticket-shell")).toBeVisible();
  await page.getByTestId("tenant-switcher").selectOption("tenant-b");
  await expect(page.getByTestId("m2-shell-tenant")).toContainText("Tenant B");

  await expect(page.getByTestId("conversation-filters")).toContainText("Unread");
  await expect(page.getByTestId("conversation-filters")).toContainText(
    "Awaiting reply"
  );
  await expect(page.getByTestId("conversation-filters")).toContainText("Needs human");
  await expect(page.getByTestId("conversation-filters")).toContainText("Handoff");
  await expect(page.getByTestId("conversation-filters")).toContainText("Closed");
  await expect(page.getByTestId("conversation-filters")).toContainText("SLA risk");
  await expect(page.getByTestId("conversation-priority-list")).toContainText(
    /Needs human[\s\S]*SLA risk/
  );
  await page
    .getByTestId("conversation-filters")
    .getByRole("button", { name: "Closed" })
    .click();
  await expect(page.getByTestId("conversation-priority-list")).toContainText(
    "Synthetic archive lane"
  );
  await expect(page.getByTestId("conversation-priority-list")).not.toContainText(
    "Synthetic priority lane"
  );
  await page
    .getByTestId("conversation-filters")
    .getByRole("button", { name: "All" })
    .click();
  await expect(page.getByTestId("conversation-detail")).toContainText("AI suspended");
  await expect(page.getByTestId("conversation-detail")).toContainText("withdrawn");
  await expect(page.getByTestId("conversation-detail")).toContainText("pending_cancel");
  await expect(
    page.getByRole("button", { name: "Business disabled by ADR-B01" })
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: /confirm business draft/i })
  ).toHaveCount(0);
  await expect(page.locator("body")).not.toContainText(
    /@[\w_]+|\+?\d[\d\s-]{6,}|ORD-|PAY-|TG-|telegram handle|raw payload/i
  );
});

test("covers M2-04 ticket queues, actions, and close result UI", async ({ page }) => {
  await page.goto("/design");
  await expect(page.getByTestId("ticket-queue-tabs")).toContainText("Unclaimed");
  await expect(page.getByTestId("ticket-queue-tabs")).toContainText("Mine");
  await expect(page.getByTestId("ticket-queue-tabs")).toContainText("SLA soon");
  await expect(page.getByTestId("ticket-queue-tabs")).toContainText("Reopened");
  await expect(page.getByTestId("ticket-queue-tabs")).toContainText(
    "Morning follow-up"
  );

  await expect(page.getByTestId("ticket-detail")).toContainText("Summary");
  await expect(page.getByTestId("ticket-detail")).toContainText("Suggested action");
  await expect(page.getByTestId("ticket-detail")).toContainText("SLA policy ref");
  await expect(page.getByTestId("ticket-detail")).toContainText("Notes");
  await expect(page.getByTestId("ticket-detail")).toContainText("Event timeline");
  await expect(page.getByRole("button", { name: "Claim local shell" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Lock local shell" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Add note locally" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Escalate local shell" })
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Reopen local shell" })).toBeDisabled();
  await expect(page.getByLabel("Close result")).toBeVisible();
  await expect(page.getByLabel("Close destination")).toBeVisible();
  await expect(page.getByLabel("Close explanation")).toBeVisible();
  await expect(page.getByRole("button", { name: "Close ticket shell" })).toBeDisabled();
  await page.getByRole("button", { name: "Claim local shell" }).click();
  await expect(page.getByTestId("ticket-action-state")).toContainText("Claimed");
  await page.getByRole("button", { name: "Lock local shell" }).click();
  await expect(page.getByTestId("ticket-action-state")).toContainText("Locked");
  await page.getByLabel("Close result").selectOption("resolved");
  await page.getByLabel("Close destination").fill("Follow-up lane");
  await page.getByLabel("Close explanation").fill("Synthetic local close only");
  await page.getByRole("button", { name: "Close ticket shell" }).click();
  await expect(page.getByTestId("ticket-action-state")).toContainText(
    "Closed: resolved"
  );
  await expect(page.getByRole("button", { name: "Reopen local shell" })).toBeEnabled();
  await page.getByRole("button", { name: "Reopen local shell" }).click();
  await expect(page.getByTestId("ticket-action-state")).toContainText("Reopened");
});

test("shows M2-04 loading empty error permission and degraded states", async ({
  page
}) => {
  await page.goto("/design");
  await expect(page.getByTestId("m2-state-loading")).toContainText("Loading");
  await expect(page.getByTestId("m2-state-empty")).toContainText("Empty");
  await expect(page.getByTestId("m2-state-error")).toContainText("Error");
  await expect(page.getByTestId("m2-state-permission")).toContainText(
    "Permission denied"
  );
  await expect(page.getByTestId("m2-state-degraded")).toContainText("Degraded");
});

test("keeps the M1 shell usable at the narrow mobile floor", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 860 });
  await page.goto("/design");
  await expect(page.getByTestId("admin-shell")).toBeVisible();
  await expect(page.getByTestId("release-readiness")).toBeVisible();
  await expect(page.getByTestId("m2-conversation-ticket-shell")).toBeVisible();
  await expect(page.getByTestId("conversation-filters")).toContainText("Needs human");
  const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
  expect(scrollWidth).toBeLessThanOrEqual(320);
  await expect(
    page.getByRole("button", { name: "GA-0 open action locked" })
  ).toBeVisible();
});

test("keeps the M1 shell usable at the tablet breakpoint", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 900 });
  await page.goto("/design");
  await expect(page.getByTestId("tenant-switcher")).toBeVisible();
  await expect(page.getByLabel("Search")).toBeVisible();
  await expect(page.getByTestId("release-readiness")).toContainText("Owner:");
  await expect(page.getByTestId("ticket-detail")).toContainText("SLA policy ref");
});
