import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { pathToFileURL, URL } from "node:url";

import {
  CONVERSATION_A_HANDOFF,
  CONVERSATION_A_OPEN,
  MESSAGE_INBOUND,
  MESSAGE_OUTBOUND,
  ORG_ID,
  SYSTEM_ACTOR,
  TENANT_A,
  TENANT_B,
  TICKET_ID,
  USER_A,
  contextFor,
  fakePrisma,
  ids,
  renderConfigPatterns,
  ticketEventTypes
} from "./m8-conversation-ticket-api-fixture.mjs";

const repoRoot = process.cwd();
const { compileApiRuntime } = await import(
  new URL("../../apps/api/scripts/runtime-compiler.mjs", import.meta.url)
);
const runtimeOutDir = await compileApiRuntime({
  outDir: path.join(repoRoot, "node_modules/.cache/uzmax-api-runtime-m8-02")
});
const runtimeModuleUrl = (file) =>
  `${pathToFileURL(path.join(runtimeOutDir, file)).href}?t=${Date.now()}`;
const repositoryModule = await import(
  runtimeModuleUrl("conversation-ticket.repository.mjs")
);
const serviceModule = await import(runtimeModuleUrl("conversation-ticket.service.mjs"));
const appModuleSource = read("apps/api/src/app.module.ts");
const renderConfig = read("render.yaml");
const serviceSource = read("apps/api/src/conversation-ticket.service.ts");

describe("M8-02 DB-backed conversation-ticket API", () => {
  it("keeps in-memory default and wires explicit RLS Prisma gateway mode", async () => {
    const memory = new repositoryModule.InMemoryConversationTicketRepository();
    const defaultProvider =
      await repositoryModule.createConversationTicketRepositoryProviderFromEnv({
        env: {},
        inMemoryRepository: memory
      });

    assert.equal(defaultProvider, memory);
    assert.throws(
      () =>
        repositoryModule.createConversationTicketRepositoryProviderFromEnv({
          env: {
            UZMAX_CONVERSATION_TICKET_REPOSITORY_MODE: "prisma_gateway"
          }
        }),
      /RLS Prisma gateway/
    );
    await assert.rejects(
      () =>
        repositoryModule.createConversationTicketRepositoryProviderFromEnv({
          env: {
            UZMAX_CONVERSATION_TICKET_REPOSITORY_MODE: "rls_prisma_gateway"
          }
        }),
      /UZMAX_RLS_DATABASE_URL is required/
    );
    const factoryCalls = [];
    const factoryProvider =
      await repositoryModule.createConversationTicketRepositoryProviderFromEnv({
        env: {
          UZMAX_CONVERSATION_TICKET_REPOSITORY_MODE: "rls_prisma_gateway",
          UZMAX_RLS_DATABASE_URL: "postgres://controlled.example/uzmax"
        },
        prismaClientFactory(databaseUrl) {
          factoryCalls.push(databaseUrl);
          return fakePrisma();
        }
      });
    assert.deepEqual(factoryCalls, ["postgres://controlled.example/uzmax"]);
    const conversations = await factoryProvider.listConversations(
      contextFor(TENANT_A, ["conversation:read"]),
      {}
    );
    assert.equal(conversations.length, 2);
    const strictFake = fakePrisma();
    await assert.rejects(
      () =>
        strictFake.$queryRaw`select id from ticket where id = ${TICKET_ID}::uuid for update`,
      /unsupported fake ticket lock query/
    );
    assert.match(appModuleSource, /CONVERSATION_TICKET_REPOSITORY/);
    assert.match(appModuleSource, /createConversationTicketRepositoryProviderFromEnv/);
    assert.match(
      serviceSource,
      /assertPermission\(accessContext, "conversation:read"\)/
    );
    assert.match(serviceSource, /repository\.listTickets/);
  });

  it("lists DB conversations and maps detail messages, tickets and events", async () => {
    const fake = fakePrisma();
    const repository =
      await repositoryModule.createConversationTicketRepositoryProviderFromEnv({
        env: {
          UZMAX_CONVERSATION_TICKET_REPOSITORY_MODE: "rls_prisma_gateway",
          UZMAX_RLS_DATABASE_URL: "synthetic-m8-02-db-url"
        },
        prismaClient: fake
      });
    const accessContext = contextFor(TENANT_A, ["conversation:read", "ticket:write"]);

    const list = await repository.listConversations(accessContext, {
      awaitingReply: true,
      slaRiskOnly: true,
      status: "pending_handoff",
      unreadOnly: true
    });

    assert.deepEqual(ids(list), [CONVERSATION_A_HANDOFF]);
    assert.equal(list[0].status, "pending_handoff");
    assert.equal(list[0].aiState, "suspended");
    assert.equal(list[0].lastMessageAt, "2026-06-17T00:05:00.000Z");

    const conversation = await repository.getConversation(
      accessContext,
      CONVERSATION_A_HANDOFF
    );
    const messages = await repository.listMessages(
      accessContext,
      CONVERSATION_A_HANDOFF
    );
    const tickets = await repository.listTickets(accessContext, CONVERSATION_A_HANDOFF);
    const ticket = tickets.find((item) => item.id === TICKET_ID);

    assert.equal(conversation?.participantExternalRef, "telegram:user:handoff");
    assert.deepEqual(ids(messages), [MESSAGE_INBOUND, MESSAGE_OUTBOUND]);
    assert.deepEqual(
      messages.map((message) => message.direction),
      ["inbound", "outbound"]
    );
    assert.deepEqual(
      messages.map((message) => message.deliveryStatus),
      ["received", "sent"]
    );
    assert.match(messages[0].externalMessageRef, /^telegram:message:/);
    assert.equal(messages[0].content.textLength, 12);
    assert.equal(tickets[0].id, TICKET_ID);
    assert.equal(tickets[0].status, "open");
    assert.equal(tickets[0].sla.dueAt, "2026-06-17T01:05:00.000Z");
    assert.equal(tickets[0].sla.policyRef, "value0-staging-support-default-v1");
    assert.deepEqual(
      tickets[0].events.map((event) => event.type),
      ["created", "note_added"]
    );
    assert.equal(tickets[0].events[0].actorUserId, SYSTEM_ACTOR);
    assert.equal(tickets[0].events[1].note, "operator note");
    assert.equal(ticket?.conversationId, CONVERSATION_A_HANDOFF);
    assert.equal(
      await repository.getConversation(contextFor(TENANT_B), CONVERSATION_A_HANDOFF),
      undefined
    );
    assert.deepEqual(fake.transactions.at(0).slice(0, 3), [
      { kind: "role", sql: 'set local role "uzmax_app_runtime"' },
      { key: "app.org_id", kind: "set_config", value: ORG_ID },
      { key: "app.tenant_id", kind: "set_config", value: TENANT_A }
    ]);
  });

  it("persists handoff and ticket actions through DB-backed service writes", async () => {
    const fake = fakePrisma();
    const repository =
      await repositoryModule.createConversationTicketRepositoryProviderFromEnv({
        env: {
          UZMAX_CONVERSATION_TICKET_REPOSITORY_MODE: "rls_prisma_gateway"
        },
        prismaClient: fake
      });
    const service = new serviceModule.ConversationTicketService(repository);
    const accessContext = contextFor(TENANT_A, ["conversation:read", "ticket:write"]);

    const handoff = await service.createHandoffTicket(accessContext, {
      conversationId: CONVERSATION_A_OPEN,
      reason: "customer asked for a human",
      slaPolicyRef: "client value must be ignored"
    });
    const handoffTicketId = handoff.ticket.id;

    assert.equal(handoff.result, "created");
    assert.equal(handoff.conversation.status, "handoff");
    assert.equal(handoff.conversation.aiState, "suspended");
    assert.equal(handoff.ticket.status, "locked");
    assert.equal(handoff.ticket.assignedUserId, USER_A);
    assert.equal(handoff.ticket.lockedByUserId, USER_A);
    assert.equal(handoff.ticket.sla.policyRef, "value0-staging-support-default-v1");
    assert.equal(
      fake.conversations.find((row) => row.id === CONVERSATION_A_OPEN).status,
      "HANDOFF"
    );
    assert.equal(
      fake.tickets.find((row) => row.id === handoffTicketId).conversationId,
      CONVERSATION_A_OPEN
    );
    assert.deepEqual(ticketEventTypes(fake, handoffTicketId), [
      "CREATED",
      "CLAIMED",
      "LOCKED"
    ]);
    assert.deepEqual(
      fake.transactions[0].slice(0, 5).map((entry) => entry.kind),
      ["role", "set_config", "set_config", "conversation_lock", "ticket_lock"]
    );
    const retry = await service.createHandoffTicket(accessContext, {
      conversationId: CONVERSATION_A_OPEN,
      reason: "same actor retry"
    });
    assert.equal(retry.result, "already_owned");
    assert.equal(retry.ticket.id, handoffTicketId);
    assert.equal(
      fake.tickets.filter((row) => row.conversationId === CONVERSATION_A_OPEN).length,
      1
    );
    assert.deepEqual(ticketEventTypes(fake, handoffTicketId), [
      "CREATED",
      "CLAIMED",
      "LOCKED"
    ]);

    const spoofedAt = new Date(Date.now() + 60_000).toISOString();
    await assert.rejects(
      () =>
        service.createHandoffTicket(
          contextFor(TENANT_B, ["conversation:read", "ticket:write"]),
          {
            conversationId: CONVERSATION_A_OPEN,
            reason: "wrong tenant should not write"
          }
        ),
      /conversation not found/
    );

    fake.failNextEventCreate = true;
    const beforeRollback = globalThis.structuredClone(
      fake.tickets.find((row) => row.id === handoffTicketId)
    );
    const beforeEventCount = fake.events.length;
    await assert.rejects(
      () =>
        service.applyTicketAction(accessContext, {
          note: "must roll back with the synthetic event failure",
          ticketId: handoffTicketId,
          type: "note"
        }),
      /synthetic event write failure/
    );
    assert.equal(fake.failNextEventCreate, false);
    assert.deepEqual(
      fake.tickets.find((row) => row.id === handoffTicketId),
      beforeRollback
    );
    assert.equal(fake.events.length, beforeEventCount);

    let result = await service.applyTicketAction(accessContext, {
      actorUserId: "client actor must be ignored",
      note: "  Checked the synthetic conversation fragment.  ",
      now: spoofedAt,
      ticketId: handoffTicketId,
      type: "note"
    });
    const note = result.ticket.events.at(-1);
    assert.equal(note.type, "note_added");
    assert.equal(note.note, "Checked the synthetic conversation fragment.");
    assert.equal(note.actorUserId, USER_A);
    assert.notEqual(note.occurredAt, spoofedAt);

    result = await service.applyTicketAction(accessContext, {
      reason: "needs senior support",
      ticketId: handoffTicketId,
      type: "escalate"
    });
    assert.equal(result.ticket.status, "escalated");
    const beforeBlockedEvents = fake.events.length;
    result = await service.applyTicketAction(accessContext, {
      destination: "resolved in controlled DB fixture",
      expectedLifecycleEventId: result.ticket.events.at(-1).id,
      requestId: "15151515-1515-4515-8515-151515151515",
      result: "resolved",
      ticketId: handoffTicketId,
      type: "close"
    });
    assert.equal(result.result, "applied");
    assert.equal(result.conversation.status, "closed");
    assert.equal(result.ticket.status, "closed");
    assert.equal(result.ticket.closeResult, "resolved");
    assert.equal(fake.events.length, beforeBlockedEvents + 1);
    assert.deepEqual(ticketEventTypes(fake, handoffTicketId), [
      "CREATED",
      "CLAIMED",
      "LOCKED",
      "NOTE_ADDED",
      "ESCALATED",
      "CLOSED"
    ]);
    assert.equal(
      new Set(result.ticket.events.map((event) => event.id)).size,
      result.ticket.events.length
    );
    const reopenTransaction = fake.transactions.length;
    result = await service.applyTicketAction(accessContext, {
      expectedClosedEventId: result.ticket.events.at(-1).id,
      reason: "controlled fake closed-ticket lock proof",
      requestId: "16161616-1616-4616-8616-161616161616",
      ticketId: handoffTicketId,
      type: "reopen"
    });
    assert.equal(result.ticket.status, "reopened");
    assert.deepEqual(
      fake.transactions[reopenTransaction].find(({ kind }) => kind === "ticket_lock")
        .ids,
      [handoffTicketId]
    );
    assert.ok(fake.transactionOptions.length >= 5);
    for (const options of fake.transactionOptions) {
      assert.deepEqual(options, { maxWait: 60_000, timeout: 60_000 });
    }

    await assert.rejects(
      () =>
        service.applyTicketAction(contextFor(TENANT_B, ["ticket:write"]), {
          ticketId: handoffTicketId,
          type: "close"
        }),
      /ticket not found/
    );
  });

  it("declares Render API/worker DB-backed live closed-loop config", () => {
    for (const pattern of renderConfigPatterns()) assert.match(renderConfig, pattern);
    assert.match(renderConfig, /UZMAX_TELEGRAM_BOT_TOKEN\s*\n\s*sync: false/);
    assert.doesNotMatch(
      renderConfig,
      /UZMAX_WORKER_TELEGRAM_BOT_ANSWER_MODE\s*\n\s*value: dry_run/
    );
  });
});

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}
