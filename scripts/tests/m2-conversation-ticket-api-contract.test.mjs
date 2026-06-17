import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL, URL } from "node:url";
import { describe, it } from "node:test";

import ts from "typescript";

const repoRoot = process.cwd();
const tmpRoot = mkdtempSync(path.join(tmpdir(), "uzmax-m2-03-"));
const testTranspileOptions = {
  compilerOptions: {
    emitDecoratorMetadata: false,
    experimentalDecorators: true,
    module: ts.ModuleKind.ES2022,
    target: ts.ScriptTarget.ES2023
  }
};
const handoff = await importSource("packages/capabilities/handoff/src/index.ts");
const nestCommon = createNestCommonStub();
const accessContext = createAccessContextStub();
const contracts = read("docs/contracts/README.md");
const appModule = read("apps/api/src/app.module.ts");

const ORG_ID = "11111111-1111-4111-8111-111111111111";
const TENANT_A = "22222222-2222-4222-8222-222222222222";
const TENANT_B = "33333333-3333-4333-8333-333333333333";
const USER_A = "44444444-4444-4444-8444-444444444444";
const USER_B = "55555555-5555-4555-8555-555555555555";
const CHANNEL_ID = "66666666-6666-4666-8666-666666666666";
const CONVERSATION_A_OPEN = "77777777-7777-4777-8777-777777777777";
const CONVERSATION_A_HANDOFF = "88888888-8888-4888-8888-888888888888";
const CONVERSATION_B = "99999999-9999-4999-8999-999999999999";
const TICKET_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const NOW = "2026-06-17T00:00:00.000Z";

describe("M2-03 conversation handoff ticket API contract", () => {
  it("creates a handoff ticket draft and suspends in-flight AI without sending", () => {
    assert.equal(typeof handoff.module.createHumanHandoff, "function");

    const result = handoff.module.createHumanHandoff({
      conversation: conversation(CONVERSATION_A_OPEN, TENANT_A, "open"),
      now: NOW,
      reason: "latest customer question needs human review",
      requestedByUserId: USER_A,
      slaPolicyRef: "sla-policy:tenant-default"
    });

    assert.equal(result.conversation.status, "pending_handoff");
    assert.equal(result.conversation.aiState, "suspended");
    assert.equal(result.ticketDraft.conversationId, CONVERSATION_A_OPEN);
    assert.match(
      result.ticketDraft.summary,
      /latest customer question needs human review/
    );
    assert.match(result.ticketDraft.suggestedAction, /Review conversation/);
    assert.deepEqual(result.ticketDraft.sla, {
      policyRef: "sla-policy:tenant-default",
      source: "config_placeholder"
    });
    assert.deepEqual(
      result.inFlightAiMessages.map((message) => message.status),
      ["withdrawn", "pending_cancel"]
    );
    assert.equal(
      result.inFlightAiMessages.some((message) => message.status === "sent"),
      false
    );
  });

  it("applies ticket actions with lock ownership and close/reopen state", () => {
    assert.equal(typeof handoff.module.createTicketState, "function");
    assert.equal(typeof handoff.module.applyTicketAction, "function");

    let ticket = handoff.module.createTicketState({
      conversationId: CONVERSATION_A_OPEN,
      events: [],
      id: TICKET_ID,
      orgId: ORG_ID,
      priority: 3,
      sla: { policyRef: "sla-policy:tenant-default", source: "config_placeholder" },
      status: "open",
      suggestedAction: "Review conversation and respond from approved data.",
      summary: "Customer requested human support.",
      tenantId: TENANT_A
    });

    ticket = handoff.module.applyTicketAction(ticket, {
      actorUserId: USER_A,
      now: NOW,
      type: "claim"
    });
    assert.equal(ticket.status, "claimed");
    assert.equal(ticket.assignedUserId, USER_A);

    ticket = handoff.module.applyTicketAction(ticket, {
      actorUserId: USER_A,
      now: NOW,
      type: "lock"
    });
    assert.equal(ticket.status, "locked");
    assert.equal(ticket.lockedByUserId, USER_A);
    assert.throws(
      () =>
        handoff.module.applyTicketAction(ticket, {
          actorUserId: USER_B,
          now: NOW,
          type: "lock"
        }),
      /ticket is locked by another user/
    );

    ticket = handoff.module.applyTicketAction(ticket, {
      actorUserId: USER_A,
      note: "Checked the latest conversation fragment.",
      now: NOW,
      type: "note"
    });
    assert.equal(ticket.events.at(-1).type, "note_added");

    ticket = handoff.module.applyTicketAction(ticket, {
      actorUserId: USER_A,
      now: NOW,
      reason: "needs senior support",
      type: "escalate"
    });
    assert.equal(ticket.status, "escalated");

    ticket = handoff.module.applyTicketAction(ticket, {
      actorUserId: USER_A,
      destination: "handled_in_admin",
      now: NOW,
      result: "resolved",
      type: "close"
    });
    assert.equal(ticket.status, "closed");
    assert.equal(ticket.closedAt, NOW);
    assert.equal(ticket.closeResult, "resolved");

    ticket = handoff.module.applyTicketAction(ticket, {
      actorUserId: USER_B,
      now: NOW,
      reason: "customer replied again",
      type: "reopen"
    });
    assert.equal(ticket.status, "reopened");
    assert.equal(ticket.closedAt, undefined);
  });

  it("lists and updates conversations only inside the selected tenant context", async () => {
    const api = await importConversationTicketApiSource();
    assert.equal(typeof api.module.InMemoryConversationTicketRepository, "function");
    assert.equal(typeof api.module.ConversationTicketService, "function");

    const repository = new api.module.InMemoryConversationTicketRepository({
      conversations: [
        conversation(CONVERSATION_A_OPEN, TENANT_A, "open"),
        {
          ...conversation(CONVERSATION_A_HANDOFF, TENANT_A, "pending_handoff"),
          aiState: "suspended",
          slaRisk: true
        },
        conversation(CONVERSATION_B, TENANT_B, "open")
      ],
      messages: [
        message("message-a-1", CONVERSATION_A_OPEN, TENANT_A, "inbound"),
        message("message-a-2", CONVERSATION_A_OPEN, TENANT_A, "outbound"),
        message("message-b-1", CONVERSATION_B, TENANT_B, "inbound")
      ],
      tickets: []
    });
    const service = new api.module.ConversationTicketService(repository);
    const accessContext = contextFor(USER_A, TENANT_A, [
      "conversation:read",
      "ticket:write"
    ]);

    const filtered = await service.listConversations(accessContext, {
      awaitingReply: true,
      slaRiskOnly: true,
      status: "pending_handoff",
      unreadOnly: true
    });
    assert.deepEqual(
      filtered.items.map((item) => item.id),
      [CONVERSATION_A_HANDOFF]
    );
    assert.equal(filtered.items[0].tenantId, TENANT_A);

    const detail = await service.getConversationDetail(
      accessContext,
      CONVERSATION_A_OPEN
    );
    assert.equal(detail.conversation.id, CONVERSATION_A_OPEN);
    assert.equal(detail.messages.length, 2);
    assert.equal(
      JSON.stringify(detail).includes(CONVERSATION_B),
      false,
      "detail must not include another tenant conversation"
    );
    await assert.rejects(
      () => service.getConversationDetail(accessContext, CONVERSATION_B),
      /conversation not found/
    );

    const handoffResult = await service.createHandoffTicket(accessContext, {
      conversationId: CONVERSATION_A_OPEN,
      reason: "customer asked for a human",
      slaPolicyRef: "sla-policy:tenant-default"
    });
    assert.equal(handoffResult.conversation.status, "pending_handoff");
    assert.equal(handoffResult.conversation.aiState, "suspended");
    assert.equal(handoffResult.ticket.status, "open");
    assert.equal(handoffResult.ticket.sla.policyRef, "sla-policy:tenant-default");

    const locked = await service.applyTicketAction(accessContext, {
      actorUserId: USER_A,
      now: NOW,
      ticketId: handoffResult.ticket.id,
      type: "lock"
    });
    assert.equal(locked.ticket.lockedByUserId, USER_A);
    await assert.rejects(
      () =>
        service.applyTicketAction(contextFor(USER_B, TENANT_A, ["ticket:write"]), {
          actorUserId: USER_B,
          now: NOW,
          ticketId: handoffResult.ticket.id,
          type: "lock"
        }),
      /ticket is locked by another user/
    );

    await assert.rejects(
      () =>
        service.listConversations(contextFor(USER_A, TENANT_A, ["ticket:write"]), {}),
      /permission is not granted/
    );
  });

  it("registers the API shell and documents the contract boundary", async () => {
    const api = await importConversationTicketApiSource();
    assert.match(api.source, /@Controller\("conversation-ticket"\)/);
    assert.match(api.source, /@Get\("conversations"\)/);
    assert.match(api.source, /@Post\("conversations\/:conversationId\/handoff"\)/);
    assert.match(api.source, /@Post\("tickets\/:ticketId\/actions"\)/);
    assert.match(appModule, /ConversationTicketController/);
    assert.match(appModule, /InMemoryConversationTicketRepository/);
    assert.match(contracts, /M2 Conversation Handoff Ticket API Contract/);
    assert.match(contracts, /AI suspended/);
    assert.match(contracts, /no new external API\/SDK/);
  });
});

function conversation(id, tenantId, status) {
  return {
    aiState: "active",
    awaitingReply: true,
    channelConnectionId: CHANNEL_ID,
    externalConversationRef: `telegram:chat:${id}`,
    id,
    inFlightAiMessages: [
      { id: `${id}:ai-queued`, status: "queued" },
      { id: `${id}:ai-generating`, status: "generating" }
    ],
    lastMessageAt: NOW,
    orgId: ORG_ID,
    participantExternalRef: `telegram:user:${id}`,
    slaRisk: status === "pending_handoff",
    status,
    subject: "Support request",
    tenantId,
    unreadCount: status === "closed" ? 0 : 2
  };
}

function message(id, conversationId, tenantId, direction) {
  return {
    content: { text: "bounded internal message" },
    contentKind: "text",
    conversationId,
    direction,
    id,
    occurredAt: NOW,
    orgId: ORG_ID,
    tenantId
  };
}

function contextFor(userId, selectedTenantId, permissions) {
  return {
    membershipVersion: 1,
    orgId: ORG_ID,
    permissions,
    selectedTenantId,
    tenantIds: [selectedTenantId],
    userId
  };
}

async function importConversationTicketApiSource() {
  const authz = await importSource("packages/authz/src/index.ts");
  const source = read("apps/api/src/conversation-ticket.ts")
    .replace("@nestjs/common", nestCommon.moduleUrl)
    .replace("../../../packages/authz/src/index.ts", authz.moduleUrl)
    .replace("../../../packages/capabilities/handoff/src/index.ts", handoff.moduleUrl);
  const moduleUrl = writeTempModule(
    "conversation-ticket.mjs",
    transpileSource(source).replace("./access-context.ts", accessContext.moduleUrl)
  );
  return { module: await import(moduleUrl), moduleUrl, source };
}

function createNestCommonStub() {
  const moduleUrl = writeTempModule(
    "nestjs-common-stub.mjs",
    [
      "const decorator = () => () => undefined;",
      "export const Body = decorator;",
      "export const Controller = decorator;",
      "export const Get = decorator;",
      "export const Injectable = decorator;",
      "export const Param = decorator;",
      "export const Post = decorator;",
      "export const Query = decorator;",
      "export const Req = decorator;",
      "export const UseGuards = decorator;"
    ].join("\n")
  );
  return { moduleUrl };
}

function createAccessContextStub() {
  const moduleUrl = writeTempModule(
    "access-context-stub.mjs",
    "export class ApiAccessContextGuard {}"
  );
  return { moduleUrl };
}

async function importSource(relativePath) {
  const moduleUrl = inlineModuleUrl(transpileSource(read(relativePath)));
  return { module: await import(moduleUrl), moduleUrl };
}

function transpileSource(sourceText) {
  const result = ts.transpileModule(sourceText, testTranspileOptions);
  return result.outputText;
}

function writeTempModule(fileName, sourceText) {
  const destination = new URL(fileName, pathToFileURL(`${tmpRoot}/`));
  writeFileSync(destination, sourceText, "utf8");
  return destination.href;
}

function inlineModuleUrl(sourceText) {
  const encoded = Buffer.from(sourceText, "utf8").toString("base64");
  return `data:text/javascript;base64,${encoded}`;
}

function read(relativePath) {
  const sourcePath = path.resolve(repoRoot, relativePath);
  assert.ok(existsSync(sourcePath), `missing ${relativePath}`);
  return readFileSync(sourcePath, { encoding: "utf8" });
}
