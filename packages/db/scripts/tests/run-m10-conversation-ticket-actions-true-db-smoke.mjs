import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";

import { compileApiRuntime } from "../../../../apps/api/scripts/runtime-compiler.mjs";

const SYNTHETIC_SPEC = "M10-01";
const ORG_ID = "11111111-1111-4111-8111-111111111901";
const TENANT_A_ID = "22222222-2222-4222-8222-222222222901";
const TENANT_B_ID = "33333333-3333-4333-8333-333333333901";
const USER_ID = "44444444-4444-4444-8444-444444444901";
const CHANNEL_CONNECTION_ID = "55555555-5555-4555-8555-555555555901";
const LATEST_CHANNEL_CONNECTION_ID = "55555555-5555-4555-8555-555555555902";
const CONVERSATION_ID = "66666666-6666-4666-8666-666666666901";
const CUSTOMER_ID = "77777777-7777-4777-8777-777777777901";
const IDENTITY_ID = "88888888-8888-4888-8888-888888888901";
const MESSAGE_ID = "99999999-9999-4999-8999-999999999901";
const PARTICIPANT_REF = "telegram:user:9901";
const READ_TEXT = "controlled-m11-03a-read";

export async function runM10ConversationTicketActionsTrueDbSmoke() {
  let failureStage = "bootstrap";
  try {
    await runConversationTicketTrueDbSmoke((stage) => {
      failureStage = stage;
    });
  } catch {
    console.error(`conversation-ticket-true-db-smoke-diagnostic:${failureStage}`);
    throw new Error("conversation-ticket-true-db-smoke-failed");
  }
}

async function runConversationTicketTrueDbSmoke(markStage) {
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

    markStage("read_contract");
    const initialDetail = await service.getConversationDetail(tenantA, CONVERSATION_ID);
    assert.equal(initialDetail.slaPolicyRef, "value0-staging-support-default-v1");
    assert.equal(initialDetail.takeoverReadiness, "atomic_ready");
    assert.notEqual(initialDetail.takeoverReadiness, "blocked_pending_m11_03b");
    assert.equal(initialDetail.customerContext.state, "linked");
    assert.equal(initialDetail.customerContext.customer.id, CUSTOMER_ID);
    assert.equal(initialDetail.customerContext.customer.preferredLanguage.length, 64);
    assert.equal(initialDetail.customerContext.identity.id, IDENTITY_ID);
    assert.equal(initialDetail.customerContext.profile.displayName, "Controlled");
    assert.equal("unknown" in initialDetail.customerContext.profile, false);
    assert.equal(initialDetail.messages[0].content.text, READ_TEXT);
    assert.equal(initialDetail.messages[0].deliveryStatus, "received");
    assert.equal(initialDetail.messages[0].externalMessageRef.length, 256);
    assert.equal(initialDetail.operatorState.canTakeover, true);

    markStage("wrong_tenant");
    await assert.rejects(
      () =>
        service.createHandoffTicket(tenantB, {
          conversationId: CONVERSATION_ID,
          reason: "controlled wrong tenant handoff"
        }),
      /conversation not found/
    );
    markStage("takeover_create");
    const handoff = await service.createHandoffTicket(tenantA, {
      conversationId: CONVERSATION_ID,
      reason: "controlled handoff request"
    });
    const ticketId = handoff.ticket.id;
    assert.equal(handoff.result, "created");
    assert.equal(handoff.conversation.status, "handoff");
    assert.equal(handoff.ticket.status, "locked");
    assert.equal(handoff.ticket.sla.policyRef, "value0-staging-support-default-v1");
    assert.deepEqual(
      handoff.ticket.events.map((event) => event.type),
      ["created", "claimed", "locked"]
    );
    markStage("ticket_actions");
    const retry = await service.createHandoffTicket(tenantA, {
      conversationId: CONVERSATION_ID,
      reason: "controlled same actor retry"
    });
    assert.equal(retry.result, "already_owned");
    assert.equal(retry.ticket.id, ticketId);
    await assert.rejects(
      () => service.applyTicketAction(tenantA, { ticketId, type: "claim" }),
      /support state conflict/
    );

    await service.applyTicketAction(tenantA, {
      note: "controlled operator note",
      ticketId,
      type: "note"
    });
    const escalated = await service.applyTicketAction(tenantA, {
      reason: "controlled senior review",
      ticketId,
      type: "escalate"
    });
    assert.equal(escalated.ticket.status, "escalated");
    assert.deepEqual(
      escalated.ticket.events.map((event) => event.type),
      ["created", "claimed", "locked", "note_added", "escalated"]
    );
    await assert.rejects(
      () => service.applyTicketAction(tenantA, { ticketId, type: "close" }),
      /support state conflict/
    );
    await assert.rejects(
      () => service.applyTicketAction(tenantA, { ticketId, type: "reopen" }),
      /support state conflict/
    );

    markStage("isolation");
    const detail = await service.getConversationDetail(tenantA, CONVERSATION_ID);
    assert.equal(detail.tickets[0].id, ticketId);
    assert.equal(detail.tickets[0].events.length, 5);
    await assert.rejects(
      () => service.getConversationDetail(tenantB, CONVERSATION_ID),
      /conversation not found/
    );
    await assert.rejects(
      () =>
        service.applyTicketAction(tenantB, {
          ticketId,
          type: "close"
        }),
      /ticket not found/
    );

    markStage("rls_counts");
    assert.deepEqual(await countVisibleRows(prisma, TENANT_A_ID), {
      conversations: 1,
      customers: 1,
      events: 5,
      identities: 1,
      messages: 1,
      tickets: 1
    });
    assert.deepEqual(await countVisibleRows(prisma, TENANT_B_ID), {
      conversations: 0,
      customers: 0,
      events: 0,
      identities: 0,
      messages: 0,
      tickets: 0
    });
    markStage("cleanup");
    await cleanupSyntheticRows(prisma);
    assert.equal(await syntheticResidueCount(prisma), 0);
    console.log(
      "conversation-ticket-true-db-smoke: passed read truth, legacy actions, tenant isolation and residue=0"
    );
  } finally {
    await cleanupSyntheticRows(prisma).catch(() => {
      console.error("conversation-ticket-true-db-smoke: cleanup_failed");
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
  await prisma.channelConnection.create({
    data: {
      capabilities: { conversationCustomerReadSmoke: true },
      externalAccountRef: "controlled://channel/m11-03a-latest",
      id: LATEST_CHANNEL_CONNECTION_ID,
      metadata: { synthetic_spec: SYNTHETIC_SPEC },
      orgId: ORG_ID,
      provider: "telegram_bot",
      tenantId: TENANT_A_ID
    }
  });
  await prisma.customer.create({
    data: {
      id: CUSTOMER_ID,
      orgId: ORG_ID,
      preferredLanguage: "p".repeat(80),
      tenantId: TENANT_A_ID
    }
  });
  await prisma.customerIdentity.create({
    data: {
      channelConnectionId: LATEST_CHANNEL_CONNECTION_ID,
      customerId: CUSTOMER_ID,
      externalSubjectRef: PARTICIPANT_REF,
      id: IDENTITY_ID,
      identityKind: "channel_subject",
      metadata: {
        profile: {
          displayName: "untrusted",
          firstName: "Controlled",
          languageCode: "en",
          unknown: "drop"
        }
      },
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
      participantExternalRef: PARTICIPANT_REF,
      status: "OPEN",
      tenantId: TENANT_A_ID,
      unreadCount: 1
    }
  });
  await prisma.channelMessage.create({
    data: {
      channelConnectionId: CHANNEL_CONNECTION_ID,
      content: { contentKind: "text", text: READ_TEXT },
      contentKind: "TEXT",
      conversationId: CONVERSATION_ID,
      deliveryStatus: "RECEIVED",
      direction: "INBOUND",
      externalMessageRef: `controlled:${"r".repeat(280)}`,
      id: MESSAGE_ID,
      occurredAt: new Date("2026-07-09T10:00:00.000Z"),
      orgId: ORG_ID,
      tenantId: TENANT_A_ID
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

async function countVisibleRows(prisma, tenantId) {
  const results = await prisma.$transaction([
    prisma.$executeRawUnsafe('set local role "uzmax_app_runtime"'),
    prisma.$queryRaw`select set_config('app.org_id', ${ORG_ID}, true)`,
    prisma.$queryRaw`select set_config('app.tenant_id', ${tenantId}, true)`,
    prisma.$queryRaw`
      select
        (select count(*) from conversation where id::text = ${CONVERSATION_ID})::int as conversations,
        (select count(*) from customer where id::text = ${CUSTOMER_ID})::int as customers,
        (select count(*) from customer_identity where id::text = ${IDENTITY_ID})::int as identities,
        (select count(*) from message where id::text = ${MESSAGE_ID})::int as messages,
        (select count(*) from ticket where conversation_id::text = ${CONVERSATION_ID})::int as tickets,
        (select count(*) from ticket_event where org_id::text = ${ORG_ID})::int as events
    `
  ]);
  const row = results.at(-1)?.[0] ?? {};
  return {
    conversations: Number(row.conversations ?? -1),
    customers: Number(row.customers ?? -1),
    events: Number(row.events ?? -1),
    identities: Number(row.identities ?? -1),
    messages: Number(row.messages ?? -1),
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
