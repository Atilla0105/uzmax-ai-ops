import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";

import { compileApiRuntime } from "../../../../apps/api/scripts/runtime-compiler.mjs";

const SYNTHETIC_SPEC = "M10-01";
const ORG_ID = "11111111-1111-4111-8111-111111111901";
const TENANT_A_ID = "22222222-2222-4222-8222-222222222901";
const TENANT_B_ID = "33333333-3333-4333-8333-333333333901";
const USER_ID = "44444444-4444-4444-8444-444444444901";
const CHANNEL_CONNECTION_ID = "55555555-5555-4555-8555-555555555901";
const CONVERSATION_ID = "66666666-6666-4666-8666-666666666901";

export async function runM10ConversationTicketActionsTrueDbSmoke() {
  const databaseUrl = readRlsDatabaseUrl();
  const prisma = await createSmokePrismaClient(databaseUrl);

  try {
    await cleanupSyntheticRows(prisma);
    await seedSyntheticRows(prisma);
    const api = await importApiConversationTicketRuntimeModules();
    const repository =
      await api.repository.createConversationTicketRepositoryProviderFromEnv({
        env: {
          UZMAX_CONVERSATION_TICKET_REPOSITORY_MODE: "rls_prisma_gateway",
          UZMAX_RLS_DATABASE_URL: databaseUrl
        },
        prismaClient: prisma
      });
    const service = new api.service.ConversationTicketService(repository);
    const tenantA = accessContext(TENANT_A_ID, ["conversation:read", "ticket:write"]);
    const tenantB = accessContext(TENANT_B_ID, ["conversation:read", "ticket:write"]);

    await assert.rejects(
      () =>
        service.createHandoffTicket(tenantB, {
          conversationId: CONVERSATION_ID,
          reason: "controlled wrong tenant handoff",
          slaPolicyRef: "controlled://sla/m10-01"
        }),
      /conversation not found/
    );
    const handoff = await service.createHandoffTicket(tenantA, {
      conversationId: CONVERSATION_ID,
      reason: "controlled handoff request",
      slaPolicyRef: "controlled://sla/m10-01"
    });
    const ticketId = handoff.ticket.id;
    assert.equal(handoff.conversation.status, "pending_handoff");
    assert.equal(handoff.ticket.status, "open");
    const [claimAt, lockAt, noteAt, closeAt, reopenAt, wrongTenantAt] =
      futureActionTimes();

    await service.applyTicketAction(tenantA, {
      now: claimAt,
      ticketId,
      type: "claim"
    });
    await service.applyTicketAction(tenantA, {
      now: lockAt,
      ticketId,
      type: "lock"
    });
    await service.applyTicketAction(tenantA, {
      note: "controlled operator note",
      now: noteAt,
      ticketId,
      type: "note"
    });
    await service.applyTicketAction(tenantA, {
      destination: "handled_in_admin",
      now: closeAt,
      result: "resolved",
      ticketId,
      type: "close"
    });
    const reopened = await service.applyTicketAction(tenantA, {
      now: reopenAt,
      reason: "controlled reopen",
      ticketId,
      type: "reopen"
    });
    assert.equal(reopened.ticket.status, "reopened");
    assert.deepEqual(
      reopened.ticket.events.map((event) => event.type),
      ["created", "claimed", "locked", "note_added", "closed", "reopened"]
    );

    const detail = await service.getConversationDetail(tenantA, CONVERSATION_ID);
    assert.equal(detail.tickets[0].id, ticketId);
    assert.equal(detail.tickets[0].events.length, 6);
    await assert.rejects(
      () => service.getConversationDetail(tenantB, CONVERSATION_ID),
      /conversation not found/
    );
    await assert.rejects(
      () =>
        service.applyTicketAction(tenantB, {
          now: wrongTenantAt,
          ticketId,
          type: "claim"
        }),
      /ticket not found/
    );

    assert.deepEqual(await countVisibleRows(prisma, TENANT_A_ID), {
      conversations: 1,
      events: 6,
      tickets: 1
    });
    assert.deepEqual(await countVisibleRows(prisma, TENANT_B_ID), {
      conversations: 0,
      events: 0,
      tickets: 0
    });
    await cleanupSyntheticRows(prisma);
    assert.equal(await syntheticResidueCount(prisma), 0);
    console.log(
      "m10-conversation-ticket-actions-true-db-smoke: passed synthetic handoff/actions, tenant isolation and residue=0"
    );
  } finally {
    await cleanupSyntheticRows(prisma).catch((error) => {
      console.error(
        `m10-conversation-ticket-actions-true-db-smoke: cleanup failed: ${error.message}`
      );
    });
    await prisma.$disconnect();
  }
}

function readRlsDatabaseUrl() {
  const name = "UZMAX_RLS_DATABASE_URL";
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

async function createSmokePrismaClient(databaseUrl) {
  const { PrismaClient } = await import("@prisma/client");
  return new PrismaClient({ datasources: { db: { url: databaseUrl } } });
}

async function importApiConversationTicketRuntimeModules() {
  const outDir = await compileApiRuntime();
  const baseUrl = `${pathToFileURL(outDir).href}/`;
  const [repository, service] = await Promise.all([
    import(`${baseUrl}conversation-ticket.repository.mjs`),
    import(`${baseUrl}conversation-ticket.service.mjs`)
  ]);
  return { repository, service };
}

async function seedSyntheticRows(prisma) {
  await prisma.org.create({
    data: {
      id: ORG_ID,
      name: "M10-01 Synthetic Org",
      slug: "m10-01-synthetic-org"
    }
  });
  await prisma.tenant.createMany({
    data: [
      tenant(TENANT_A_ID, "m10-01-tenant-a", "M10-01 Tenant A"),
      tenant(TENANT_B_ID, "m10-01-tenant-b", "M10-01 Tenant B")
    ]
  });
  await prisma.channelConnection.create({
    data: {
      capabilities: { conversationTicketSmoke: true },
      externalAccountRef: "controlled://channel/m10-01",
      id: CHANNEL_CONNECTION_ID,
      metadata: { synthetic_spec: SYNTHETIC_SPEC },
      orgId: ORG_ID,
      provider: "telegram_bot",
      tenantId: TENANT_A_ID
    }
  });
  await prisma.channelConversation.create({
    data: {
      channelConnectionId: CHANNEL_CONNECTION_ID,
      externalConversationRef: "controlled://conversation/m10-01",
      id: CONVERSATION_ID,
      lastMessageAt: new Date("2026-07-09T10:00:00.000Z"),
      orgId: ORG_ID,
      participantExternalRef: "controlled://participant/m10-01",
      status: "OPEN",
      tenantId: TENANT_A_ID,
      unreadCount: 1
    }
  });
}

function tenant(id, slug, name) {
  return { id, name, orgId: ORG_ID, slug };
}

function accessContext(selectedTenantId, permissions) {
  return {
    membershipVersion: 1,
    orgId: ORG_ID,
    permissions,
    selectedTenantId,
    tenantIds: [TENANT_A_ID, TENANT_B_ID],
    userId: USER_ID
  };
}

function futureActionTimes() {
  const base = Date.now() + 60_000;
  return Array.from({ length: 6 }, (_, index) =>
    new Date(base + index * 60_000).toISOString()
  );
}

async function countVisibleRows(prisma, tenantId) {
  const results = await prisma.$transaction([
    prisma.$executeRawUnsafe('set local role "uzmax_app_runtime"'),
    prisma.$queryRaw`select set_config('app.org_id', ${ORG_ID}, true)`,
    prisma.$queryRaw`select set_config('app.tenant_id', ${tenantId}, true)`,
    prisma.$queryRaw`
      select
        (select count(*) from conversation where id::text = ${CONVERSATION_ID})::int as conversations,
        (select count(*) from ticket where conversation_id::text = ${CONVERSATION_ID})::int as tickets,
        (select count(*) from ticket_event where org_id::text = ${ORG_ID})::int as events
    `
  ]);
  const row = results.at(-1)?.[0] ?? {};
  return {
    conversations: Number(row.conversations ?? -1),
    events: Number(row.events ?? -1),
    tickets: Number(row.tickets ?? -1)
  };
}

async function cleanupSyntheticRows(prisma) {
  await prisma.org.deleteMany({ where: { id: ORG_ID } });
}

async function syntheticResidueCount(prisma) {
  const rows = await prisma.$queryRaw`
    select (
      (select count(*) from org where id::text = ${ORG_ID})
      + (select count(*) from channel_connection where metadata->>'synthetic_spec' = ${SYNTHETIC_SPEC})
      + (select count(*) from conversation where external_conversation_ref = 'controlled://conversation/m10-01')
    )::int as residue
  `;
  return Number(rows[0]?.residue ?? -1);
}
