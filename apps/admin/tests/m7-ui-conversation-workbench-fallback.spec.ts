import { expect, test, type Page } from "@playwright/test";
import {
  conversationComposer as composer,
  conversationDegraded as degraded,
  conversationRail as rail,
  conversationRow as row,
  conversationTakeover as takeover
} from "./conversationWorkbenchLocators";

test("scopes synthetic fallback to the selected tenant when no API returns Vite HTML", async ({
  page
}) => {
  await page.route("**/conversation-ticket/conversations", async (route) => {
    await route.fulfill({
      body: "<!doctype html><html><body>Vite preview fallback</body></html>",
      contentType: "text/html",
      status: 200
    });
  });

  await openConversations(page, "tenant-c");

  const workbench = page.getByTestId("m7-conversation-workbench-page");
  await expect(workbench).toBeVisible();
  await expect(workbench).toHaveAttribute("data-runtime-source", "synthetic");
  await expect(workbench).toHaveAttribute("data-runtime-state", "degraded");
  await expect(workbench).toHaveAttribute("data-tenant-id", "tenant-c");
  await expect(page.getByTestId("m7-conversation-error")).toHaveCount(0);
  await expect(page.getByTestId("page-outlet")).toHaveAttribute(
    "data-page-id",
    "tenant.conversations"
  );
  await expect(page.getByTestId("page-outlet")).toHaveAttribute(
    "data-tenant-id",
    "tenant-c"
  );
  await expect(page.getByTestId("m7-conversation-list")).toContainText("Dilnoza R.");
  await expect(
    page.getByTestId("m7-conversation-row-mock-dilnoza-risk")
  ).toHaveAttribute("data-tenant-id", "tenant-c");
  await expect(page.getByTestId("m7-conversation-thread")).toContainText(
    "Pulni qaytarib bering"
  );
  await expect(page.getByTestId("m7-conversation-thread")).toContainText("AI 决策痕迹");
  await expect(composer(page)).toHaveValue(/Hurmatli Dilnoza/);
  await expect(rail(page)).toContainText("Dilnoza Rashidova");
  await expect(rail(page)).toContainText("退款敏感");
  await expect(rail(page)).not.toContainText("mock");
  await expect(page.getByTestId("m7-conversation-list")).not.toContainText("mock");
  await expect(composer(page)).not.toHaveValue(/mock\/read-only/);
  await expect(degraded(page)).toContainText("只读预览");
  await expect(degraded(page)).toHaveAttribute("title", /runtime-unavailable/);
  await expect(degraded(page)).toHaveAttribute("title", /owner-source-like/);
  await expect(degraded(page)).toHaveAttribute("title", /not production metrics/);
  await expect(takeover(page)).toBeDisabled();
  await expect(composer(page)).toBeDisabled();
  await expect
    .poll(() => workbench.evaluate((node) => node.outerHTML))
    .not.toContain("tenant-b");
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
    "当前筛选下没有会话"
  );
  await expect(page.getByTestId("m7-conversation-empty")).toHaveAttribute(
    "data-runtime-boundary",
    /prototype fixture fallback/
  );

  await routeList(page, 500, { error: "conversation-runtime-error" });
  await openConversations(page);
  await expect(page.getByTestId("m7-conversation-error")).toContainText(
    "对话数据暂时无法读取"
  );
  await expect(page.getByTestId("m7-conversation-error")).toHaveAttribute(
    "data-runtime-boundary",
    /status 500/
  );

  await routeList(page, 403, { error: "conversation-permission-denied" });
  await openConversations(page);
  await expect(page.getByTestId("m7-conversation-permission")).toContainText(
    "当前角色暂无查看或接管权限"
  );
  await expect(page.getByTestId("m7-conversation-permission")).toHaveAttribute(
    "data-runtime-boundary",
    /conversation:read/
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

test("does not render API rows from another tenant as selected tenant data", async ({
  page
}) => {
  await routeList(page, 200, { items: [conversation("conv-foreign")] });
  await openConversations(page, "tenant-c");
  const workbench = page.getByTestId("m7-conversation-workbench-page");
  await expect(workbench).toHaveAttribute("data-tenant-id", "tenant-c");
  await expect(workbench).toHaveAttribute("data-runtime-source", "api");
  await expect(workbench).toHaveAttribute("data-runtime-state", "empty");
  await expect(page.getByTestId("m7-conversation-error")).toHaveCount(0);
  await expect(page.getByTestId("m7-conversation-list")).not.toContainText(
    "Context Empty"
  );
  await expect(page.getByTestId("m7-conversation-empty")).toBeVisible();
});

test("ignores delayed handoff after tenant switch with duplicate conversation id", async ({
  page
}) => {
  let activeTenant = "tenant-b";
  let release: (() => void) | undefined;
  let staleFulfilled = false;
  const tenantB = conversation("conv-calm", {
    displayRef: "WB-B-STALE",
    lastPreview: "tenant-b stale handoff preview",
    orderRef: "ORD-B-STALE",
    slaPolicyRef: "tenant-b-sla-policy",
    subject: "Tenant B stale customer",
    tenantId: "tenant-b"
  });
  const tenantC = conversation("conv-calm", {
    displayRef: "WB-C-CURRENT",
    lastPreview: "tenant-c current preview",
    orderRef: "ORD-C-CURRENT",
    slaPolicyRef: "tenant-c-sla-policy",
    subject: "Tenant C current customer",
    tenantId: "tenant-c"
  });
  const activeConversation = () => (activeTenant === "tenant-b" ? tenantB : tenantC);

  await page.route("**/conversation-ticket/conversations", async (route) => {
    await route.fulfill({ json: { items: [activeConversation()] } });
  });
  await page.route(
    /\/conversation-ticket\/conversations\/conv-calm$/,
    async (route) => {
      await route.fulfill({
        json: {
          conversation: activeConversation(),
          messages: [message(`${activeTenant}-message`, `${activeTenant} detail text`)]
        }
      });
    }
  );
  await page.route("**/conversation-ticket/conversations/*/handoff", async (route) => {
    await new Promise<void>((resolve) => {
      release = resolve;
    });
    staleFulfilled = true;
    await route.fulfill({
      json: {
        conversation: {
          ...tenantB,
          aiState: "suspended",
          status: "pending_handoff"
        }
      }
    });
  });

  await openConversations(page, "tenant-b");
  await expect(takeover(page)).toBeEnabled();
  await takeover(page).click();
  await expect.poll(() => Boolean(release)).toBe(true);
  activeTenant = "tenant-c";
  await page.getByTestId("tenant-switcher").selectOption("tenant-c");
  await expect(page.getByTestId("m7-conversation-workbench-page")).toHaveAttribute(
    "data-tenant-id",
    "tenant-c"
  );
  await expect(row(page, "conv-calm")).toHaveAttribute("data-tenant-id", "tenant-c");
  await expect(rail(page)).toContainText("ORD-C-CURRENT");
  release?.();
  await expect.poll(() => staleFulfilled).toBe(true);
  await expect(row(page, "conv-calm")).toHaveAttribute("data-tenant-id", "tenant-c");
  await expect(row(page, "conv-calm")).not.toContainText("待人工");
  await expect(page.getByTestId("m7-conversation-list")).not.toContainText(
    "WB-B-STALE"
  );
  await expect(rail(page)).toContainText("ORD-C-CURRENT");
  await expect(rail(page)).not.toContainText("ORD-B-STALE");
  await expect(page.getByTestId("m7-conversation-thread")).not.toContainText(
    "tenant-b detail text"
  );
});

async function openConversations(page: Page, tenantId = "tenant-b") {
  await page.goto("/design");
  await page.getByTestId("tenant-switcher").selectOption(tenantId);
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

function conversation(id: string, overrides: Record<string, unknown> = {}) {
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
    unreadCount: 0,
    ...overrides
  };
}

function message(id: string, text: string) {
  return {
    content: { text },
    contentKind: "text",
    direction: "inbound",
    id,
    occurredAt: "2026-07-03T12:25:00.000Z"
  };
}
