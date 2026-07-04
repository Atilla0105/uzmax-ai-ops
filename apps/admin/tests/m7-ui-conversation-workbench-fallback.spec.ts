import { expect, test, type Page } from "@playwright/test";

const composer = (page: Page) => page.getByLabel("Conversation composer");
const degraded = (page: Page) => page.getByTestId("m7-conversation-degraded");
const rail = (page: Page) => page.getByTestId("m7-conversation-context-rail");
const takeover = (page: Page) => page.getByRole("button", { name: "接管会话 T" });

test("falls back to centralized synthetic degraded workbench when no API returns Vite HTML", async ({
  page
}) => {
  await page.route("**/conversation-ticket/conversations", async (route) => {
    await route.fulfill({
      body: "<!doctype html><html><body>Vite preview fallback</body></html>",
      contentType: "text/html",
      status: 200
    });
  });

  await openConversations(page);

  const workbench = page.getByTestId("m7-conversation-workbench-page");
  await expect(workbench).toBeVisible();
  await expect(workbench).toHaveAttribute("data-runtime-source", "synthetic");
  await expect(workbench).toHaveAttribute("data-runtime-state", "degraded");
  await expect(page.getByTestId("m7-conversation-error")).toHaveCount(0);
  await expect(page.getByTestId("m7-conversation-list")).toContainText(
    "Synthetic Dilnoza R."
  );
  await expect(page.getByTestId("m7-conversation-thread")).toContainText(
    "Business draft generated"
  );
  await expect(rail(page)).toContainText("synthetic/mock");
  await expect(degraded(page)).toContainText("runtime-unavailable");
  await expect(degraded(page)).toContainText("synthetic/mock");
  await expect(degraded(page)).toContainText("not production metrics");
  await expect(takeover(page)).toBeDisabled();
  await expect(composer(page)).toBeDisabled();
});

test("covers loading empty error permission and customer-context unavailable states", async ({
  page
}) => {
  let release: (() => void) | undefined;
  await page.route("**/conversation-ticket/conversations", async (route) => {
    await new Promise<void>((resolve) => {
      release = resolve;
    });
    await route.fulfill({ json: { items: [] } });
  });
  await openConversations(page);
  await expect(page.getByTestId("m7-conversation-loading")).toBeVisible();
  release?.();
  await expect(page.getByTestId("m7-conversation-empty")).toContainText(
    "不会回退到 prototype fixture"
  );

  await routeList(page, 500, { error: "conversation-runtime-error" });
  await openConversations(page);
  await expect(page.getByTestId("m7-conversation-error")).toContainText("status 500");

  await routeList(page, 403, { error: "conversation-permission-denied" });
  await openConversations(page);
  await expect(page.getByTestId("m7-conversation-permission")).toContainText(
    "conversation:read"
  );

  const row = conversation("conv-empty");
  await routeList(page, 200, { items: [row] });
  await page.route("**/conversation-ticket/conversations/conv-empty", async (route) => {
    await route.fulfill({ json: { conversation: row, messages: [] } });
  });
  await openConversations(page);
  await expect(
    page.getByTestId("m7-conversation-customer-context-unavailable")
  ).toBeVisible();
});

async function openConversations(page: Page) {
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
}

async function routeList(page: Page, status: number, json: unknown) {
  await page.unroute("**/conversation-ticket/conversations").catch(() => {});
  await page.route("**/conversation-ticket/conversations", async (route) => {
    await route.fulfill({ json, status });
  });
}

function conversation(id: string) {
  return {
    aiState: "active",
    awaitingReply: false,
    channel: "Business",
    customerRef: "",
    customFields: [],
    displayRef: "WB-EMPTY",
    dualTracks: [],
    externalConversationRef: "WB-EMPTY",
    id,
    inFlightAiMessages: [],
    journeyStage: "",
    language: "",
    lastMessageAt: "2026-07-03T12:24:00.000Z",
    lastPreview: "Context unavailable state",
    memberLabel: "AI Samarkand",
    notes: [],
    orderRef: "",
    participantExternalRef: "CU-EMPTY",
    quoteRef: "",
    slaRisk: false,
    slaText: "",
    status: "open",
    subject: "Context Empty",
    tags: [],
    tenantId: "tenant-b",
    ticketRef: "",
    timeLabel: "刚刚",
    unreadCount: 0
  };
}
