import { expect, test } from "@playwright/test";
import { expectGroupOnlyNav, expectTenantOnlyNav } from "./helpers/layerNavAssertions";

test("starts at group overview with group-only navigation", async ({ page }) => {
  await page.goto("/design");

  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "group"
  );
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "group.overview"
  );
  await expect(page.getByTestId("active-layer-badge")).toContainText("集团层");
  await expect(page.getByTestId("page-outlet")).toHaveAttribute(
    "data-page-id",
    "group.overview"
  );
  await expect(page.getByTestId("legacy-evidence-route")).toHaveCount(0);
  await expectGroupOnlyNav(page);
});

test("tenant selection enters tenant conversations with tenant-only navigation", async ({
  page
}) => {
  await page.goto("/design");

  await page.getByTestId("tenant-switcher").selectOption("tenant-b");
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "tenant"
  );
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.conversations"
  );
  await expect(page.getByTestId("active-layer-badge")).toContainText("租户层");
  await expect(page.getByTestId("route-breadcrumb")).toContainText("Tenant B");
  await expectTenantOnlyNav(page);
});

test("group release and tenant queue never expose the opposite nav tree", async ({
  page
}) => {
  await page.route("**/confirmation-queue/items?status=pending", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
  await page.goto("/design");

  await page.getByRole("button", { name: "发布与验收" }).click();
  await expect(page.getByTestId("page-outlet")).toHaveAttribute(
    "data-page-id",
    "group.release"
  );
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "group"
  );
  await expect(page.getByTestId("m7-release-acceptance-page")).toBeVisible();
  await expect(page.getByTestId("page-scaffold")).toHaveCount(0);
  await expect(page.getByTestId("m7-release-high-risk-actions")).toContainText(
    "Only the project owner"
  );
  await expectGroupOnlyNav(page);

  await page.getByTestId("tenant-switcher").selectOption("tenant-b");
  await page.getByRole("button", { name: "确认队列" }).click();
  await expect(page.getByTestId("page-outlet")).toHaveAttribute(
    "data-page-id",
    "tenant.queue"
  );
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "tenant"
  );
  await expect(page.getByTestId("m7-confirmation-queue-page")).toBeVisible();
  await expectTenantOnlyNav(page);

  await page.getByRole("button", { name: "Back to group overview" }).click();
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "group"
  );
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "group.overview"
  );
  await expectGroupOnlyNav(page);
});
