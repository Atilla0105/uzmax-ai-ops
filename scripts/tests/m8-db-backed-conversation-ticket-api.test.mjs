import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { pathToFileURL, URL } from "node:url";

const repoRoot = process.cwd();
const { compileApiRuntime } = await import(
  new URL("../../apps/api/scripts/runtime-compiler.mjs", import.meta.url)
);
const runtimeOutDir = await compileApiRuntime({
  outDir: path.join(repoRoot, "node_modules/.cache/uzmax-api-runtime-m8-02")
});
const repositoryModule = await import(
  `${
    pathToFileURL(path.join(runtimeOutDir, "conversation-ticket.repository.mjs")).href
  }?t=${Date.now()}`
);
const ORG_ID = "11111111-1111-4111-8111-111111111111";
const TENANT_A = "22222222-2222-4222-8222-222222222222";
const TENANT_B = "33333333-3333-4333-8333-333333333333";
const USER_A = "44444444-4444-4444-8444-444444444444";
const CHANNEL_ID = "66666666-6666-4666-8666-666666666666";
const CONVERSATION_A_OPEN = "77777777-7777-4777-8777-777777777777";
const CONVERSATION_A_HANDOFF = "88888888-8888-4888-8888-888888888888";
const CONVERSATION_B = "99999999-9999-4999-8999-999999999999";
const TICKET_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const MESSAGE_INBOUND = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const MESSAGE_OUTBOUND = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const EVENT_CREATED = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
const EVENT_NOTE = "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee";
const SYSTEM_ACTOR = "00000000-0000-4000-8000-000000000005";
const NOW = "2026-06-17T00:00:00.000Z";
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
    assert.equal(
      (
        await factoryProvider.listConversations(
          contextFor(TENANT_A, ["conversation:read"]),
          {}
        )
      ).length,
      2
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

    assert.deepEqual(
      list.map((item) => item.id),
      [CONVERSATION_A_HANDOFF]
    );
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
    const ticket = await repository.getTicket(accessContext, TICKET_ID);

    assert.equal(conversation?.participantExternalRef, "telegram:user:handoff");
    assert.deepEqual(
      messages.map((message) => message.id),
      [MESSAGE_INBOUND, MESSAGE_OUTBOUND]
    );
    assert.deepEqual(
      messages.map((message) => message.direction),
      ["inbound", "outbound"]
    );
    assert.equal(messages[0].content.textLength, 12);
    assert.equal(tickets[0].id, TICKET_ID);
    assert.equal(tickets[0].status, "open");
    assert.equal(tickets[0].sla.dueAt, "2026-06-17T01:05:00.000Z");
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

  it("declares Render API/worker DB-backed live closed-loop config", () => {
    assert.match(
      renderConfig,
      /UZMAX_CONVERSATION_TICKET_REPOSITORY_MODE\s*\n\s*value: rls_prisma_gateway/
    );
    assert.match(renderConfig, /UZMAX_RLS_DATABASE_URL\s*\n\s*sync: false/);
    assert.match(
      renderConfig,
      /UZMAX_WORKER_TELEGRAM_BOT_PERSISTENCE_MODE\s*\n\s*value: rls_prisma_gateway/
    );
    assert.match(
      renderConfig,
      /UZMAX_WORKER_TELEGRAM_BOT_ANSWER_MODE\s*\n\s*value: live/
    );
    assert.match(
      renderConfig,
      /UZMAX_WORKER_TELEGRAM_BOT_LLM_PROVIDER\s*\n\s*value: deepseek/
    );
    assert.match(
      renderConfig,
      /UZMAX_WORKER_DEEPSEEK_MODEL\s*\n\s*value: deepseek-v4-flash/
    );
    assert.match(renderConfig, /UZMAXADMIN_DEEPSEEK_KEY\s*\n\s*sync: false/);
    assert.match(
      renderConfig,
      /UZMAX_WORKER_TELEGRAM_BOT_AI_MEMBER_KEY\s*\n\s*value: support_bot/
    );
    assert.match(
      renderConfig,
      /UZMAX_WORKER_TELEGRAM_BOT_KB_ENTRY_KEY\s*\n\s*value: setup/
    );
    assert.match(
      renderConfig,
      /UZMAX_WORKER_TELEGRAM_BOT_REQUIRED_CAPABILITY_KEY\s*\n\s*value: TUTORIAL/
    );
    assert.match(renderConfig, /UZMAX_TELEGRAM_BOT_TOKEN\s*\n\s*sync: false/);
    assert.doesNotMatch(
      renderConfig,
      /UZMAX_WORKER_TELEGRAM_BOT_ANSWER_MODE\s*\n\s*value: dry_run/
    );
  });
});

function fakePrisma() {
  const fake = {
    conversations: [
      conversationRow({
        id: CONVERSATION_A_HANDOFF,
        lastMessageAt: "2026-06-17T00:05:00.000Z",
        participantExternalRef: "telegram:user:handoff",
        status: "PENDING_HANDOFF",
        tenantId: TENANT_A,
        unreadCount: 2
      }),
      conversationRow({
        id: CONVERSATION_A_OPEN,
        lastMessageAt: NOW,
        participantExternalRef: "telegram:user:open",
        status: "OPEN",
        tenantId: TENANT_A,
        unreadCount: 0
      }),
      conversationRow({
        id: CONVERSATION_B,
        lastMessageAt: NOW,
        participantExternalRef: "telegram:user:tenant-b",
        status: "PENDING_HANDOFF",
        tenantId: TENANT_B,
        unreadCount: 3
      })
    ],
    events: [
      {
        actorUserId: null,
        eventType: "CREATED",
        id: EVENT_CREATED,
        occurredAt: new Date("2026-06-17T00:06:00.000Z"),
        orgId: ORG_ID,
        payload: { traceId: "m8-02:created" },
        tenantId: TENANT_A,
        ticketId: TICKET_ID
      },
      {
        actorUserId: USER_A,
        eventType: "NOTE_ADDED",
        id: EVENT_NOTE,
        occurredAt: new Date("2026-06-17T00:07:00.000Z"),
        orgId: ORG_ID,
        payload: { note: "operator note" },
        tenantId: TENANT_A,
        ticketId: TICKET_ID
      }
    ],
    messages: [
      messageRow({
        direction: "OUTBOUND",
        id: MESSAGE_OUTBOUND,
        occurredAt: "2026-06-17T00:05:30.000Z"
      }),
      messageRow({
        direction: "INBOUND",
        id: MESSAGE_INBOUND,
        occurredAt: "2026-06-17T00:05:00.000Z"
      }),
      messageRow({
        conversationId: CONVERSATION_B,
        direction: "INBOUND",
        id: "ffffffff-ffff-4fff-8fff-ffffffffffff",
        occurredAt: NOW,
        tenantId: TENANT_B
      })
    ],
    tickets: [
      {
        assignedUserId: null,
        closedAt: null,
        conversationId: CONVERSATION_A_HANDOFF,
        id: TICKET_ID,
        lockedByUserId: null,
        orgId: ORG_ID,
        priority: 3,
        slaDueAt: new Date("2026-06-17T01:05:00.000Z"),
        status: "OPEN",
        summary: "telegram_bot_text_requires_operator_review",
        tenantId: TENANT_A
      }
    ],
    transactions: []
  };
  Object.assign(fake, {
    $executeRawUnsafe: async (sql) => ({ kind: "role", sql }),
    $queryRaw: async (_strings, key, value) => ({ key, kind: "set_config", value }),
    $transaction: async (operations) => {
      const result = await Promise.all(operations);
      fake.transactions.push(result);
      return result;
    },
    channelConversation: delegate(fake.conversations),
    channelMessage: delegate(fake.messages),
    supportTicket: delegate(fake.tickets),
    supportTicketEvent: delegate(fake.events)
  });
  return fake;
}

function conversationRow(patch) {
  return {
    channelConnectionId: CHANNEL_ID,
    externalConversationRef: `telegram:chat:${patch.id}`,
    id: patch.id,
    lastMessageAt: new Date(patch.lastMessageAt),
    orgId: ORG_ID,
    participantExternalRef: patch.participantExternalRef,
    status: patch.status,
    tenantId: patch.tenantId,
    unreadCount: patch.unreadCount
  };
}

function messageRow(patch) {
  return {
    channelConnectionId: CHANNEL_ID,
    content: { contentKind: "text", textLength: 12, traceId: "m8-02:message" },
    contentKind: "TEXT",
    conversationId: patch.conversationId ?? CONVERSATION_A_HANDOFF,
    direction: patch.direction,
    id: patch.id,
    occurredAt: new Date(patch.occurredAt),
    orgId: ORG_ID,
    tenantId: patch.tenantId ?? TENANT_A
  };
}

function delegate(rows) {
  return {
    findFirst: async ({ where = {} }) =>
      rows.find((row) => matchesWhere(row, where)) ?? null,
    findMany: async ({ orderBy, where = {} }) => {
      const selected = rows.filter((row) => matchesWhere(row, where));
      return orderBy ? sortRows(selected, orderBy) : selected;
    }
  };
}

function matchesWhere(row, where) {
  return Object.entries(where).every(([key, value]) => {
    if (isRecord(value) && Array.isArray(value.in)) return value.in.includes(row[key]);
    return row[key] === value;
  });
}

function sortRows(rows, orderBy) {
  const [[key, direction]] = Object.entries(orderBy);
  return [...rows].sort((left, right) => {
    const leftValue = sortableValue(left[key]);
    const rightValue = sortableValue(right[key]);
    const comparison = leftValue < rightValue ? -1 : leftValue > rightValue ? 1 : 0;
    return direction === "desc" ? -comparison : comparison;
  });
}

function sortableValue(value) {
  return value instanceof Date ? value.getTime() : value;
}

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function contextFor(selectedTenantId, permissions = ["conversation:read"]) {
  return {
    membershipVersion: 1,
    orgId: ORG_ID,
    permissions,
    selectedTenantId,
    tenantIds: [selectedTenantId],
    userId: USER_A
  };
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}
