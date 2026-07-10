import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";

import { compileApiRuntime } from "../../../../apps/api/scripts/runtime-compiler.mjs";

const SPEC = "M11-03B";
const ORG_ID = "11111111-1111-4111-8111-111111111931";
const TENANT_A = "22222222-2222-4222-8222-222222222931";
const TENANT_B = "33333333-3333-4333-8333-333333333931";
const USER_A = "44444444-4444-4444-8444-444444444931";
const USER_B = "55555555-5555-4555-8555-555555555931";
const CHANNEL_ID = "66666666-6666-4666-8666-666666666931";
const raceWinner = (results) => (results[0].status === "fulfilled" ? USER_A : USER_B);
const conversations = {
  closed: "77777777-7777-4777-8777-777777777931",
  create: "77777777-7777-4777-8777-777777777932",
  differentClaim: "77777777-7777-4777-8777-777777777933",
  differentRace: "77777777-7777-4777-8777-777777777934",
  multiple: "77777777-7777-4777-8777-777777777935",
  pending: "77777777-7777-4777-8777-777777777936",
  reuse: "77777777-7777-4777-8777-777777777937",
  sameClaim: "77777777-7777-4777-8777-777777777938",
  sameRace: "77777777-7777-4777-8777-777777777939"
};
const tickets = {
  differentClaim: "88888888-8888-4888-8888-888888888931",
  multipleA: "88888888-8888-4888-8888-888888888932",
  multipleB: "88888888-8888-4888-8888-888888888933",
  reuse: "88888888-8888-4888-8888-888888888934",
  sameClaim: "88888888-8888-4888-8888-888888888935"
};

export async function runM11AtomicTakeoverTrueDbSmoke() {
  try {
    await runSmoke();
  } catch {
    throw new Error("conversation-ticket-atomic-takeover-true-db-smoke-failed");
  }
}

async function runSmoke() {
  const prisma = await smokePrisma(readDatabaseUrl());
  try {
    await cleanup(prisma);
    await seed(prisma);
    const { repositoryModule, serviceModule } = await runtimeModules();
    const repository =
      await repositoryModule.createConversationTicketRepositoryProviderFromEnv({
        mode: "rls_prisma_gateway",
        prismaClient: prisma
      });
    const service = new serviceModule.ConversationTicketService(repository);
    const actorA = context(TENANT_A, USER_A);
    const actorB = context(TENANT_A, USER_B);

    const created = await takeover(service, actorA, "create");
    assert.equal(created.result, "created");
    assert.equal(created.conversation.status, "handoff");
    assert.equal(created.ticket.status, "locked");
    assert.equal(created.ticket.sla.policyRef, "value0-staging-support-default-v1");
    assert.deepEqual(eventTypes(created.ticket), ["created", "claimed", "locked"]);
    assertServerEvents(created.ticket, USER_A);
    const createRetry = await takeover(service, actorA, "create");
    assert.equal(createRetry.result, "already_owned");
    assert.equal(createRetry.ticket.id, created.ticket.id);

    const reused = await takeover(service, actorA, "reuse");
    assert.equal(reused.result, "reused");
    assert.equal(reused.ticket.id, tickets.reuse);
    assert.deepEqual(eventTypes(reused.ticket), ["claimed", "locked"]);
    assert.equal((await takeover(service, actorA, "reuse")).result, "already_owned");

    const sameRace = await synchronized([
      () => takeover(service, actorA, "sameRace"),
      () => takeover(service, actorA, "sameRace")
    ]);
    assert.deepEqual(sameRace.map((result) => result.value?.result).sort(), [
      "already_owned",
      "created"
    ]);
    assert.deepEqual(eventTypes(await onlyTicket(repository, actorA, "sameRace")), [
      "created",
      "claimed",
      "locked"
    ]);

    const differentRace = await synchronized([
      () => takeover(service, actorA, "differentRace"),
      () => takeover(service, actorB, "differentRace")
    ]);
    assertOneWinner(differentRace);
    const differentRaceTicket = await onlyTicket(repository, actorA, "differentRace");
    assert.equal(differentRaceTicket.assignedUserId, raceWinner(differentRace));
    assert.equal(differentRaceTicket.lockedByUserId, raceWinner(differentRace));
    assert.deepEqual(eventTypes(differentRaceTicket), ["created", "claimed", "locked"]);

    const sameClaim = await synchronized([
      () => takeover(service, actorA, "sameClaim"),
      () => claim(service, actorA, tickets.sameClaim)
    ]);
    assert.ok([1, 2].includes(count(sameClaim, "fulfilled")));
    assertStateConflictFailures(sameClaim);
    const sameClaimTicket = await onlyTicket(repository, actorA, "sameClaim");
    assert.equal(sameClaimTicket.status, "locked");
    assert.equal(sameClaimTicket.assignedUserId, USER_A);
    assert.deepEqual(eventTypes(sameClaimTicket), ["claimed", "locked"]);

    const differentClaim = await synchronized([
      () => takeover(service, actorA, "differentClaim"),
      () => claim(service, actorB, tickets.differentClaim)
    ]);
    assertOneWinner(differentClaim);
    const differentClaimTicket = await onlyTicket(repository, actorA, "differentClaim");
    const claimWinner = raceWinner(differentClaim);
    assert.equal(differentClaimTicket.assignedUserId, claimWinner);
    if (claimWinner === USER_A) {
      assert.equal(differentClaimTicket.status, "locked");
      assert.equal(differentClaimTicket.lockedByUserId, USER_A);
      assert.deepEqual(eventTypes(differentClaimTicket), ["claimed", "locked"]);
    } else {
      assert.equal(differentClaimTicket.assignedUserId, USER_B);
      assert.equal(differentClaimTicket.status, "claimed");
      assert.equal(differentClaimTicket.lockedByUserId, undefined);
      assert.deepEqual(eventTypes(differentClaimTicket), ["claimed"]);
    }

    for (const label of ["closed", "multiple", "pending"]) {
      await expectConflictWithoutWrite(prisma, service, actorA, label);
    }
    const beforeWrongTenant = await snapshot(prisma, conversations.create);
    await assert.rejects(
      () => takeover(service, context(TENANT_B, USER_A), "create"),
      /conversation not found/
    );
    assert.deepEqual(await snapshot(prisma, conversations.create), beforeWrongTenant);
    assert.equal(
      await prisma.supportTicket.count({
        where: { orgId: ORG_ID, tenantId: TENANT_A }
      }),
      8
    );

    await cleanup(prisma);
    assert.equal(await residue(prisma), 0);
    console.log(
      "conversation-ticket-atomic-takeover-true-db-smoke: passed races, RLS, exact events and residue=0"
    );
  } finally {
    await cleanup(prisma).catch(() => {
      console.error(
        "conversation-ticket-atomic-takeover-true-db-smoke: cleanup_failed"
      );
    });
    await prisma.$disconnect();
  }
}

async function seed(prisma) {
  await prisma.org.create({
    data: { id: ORG_ID, name: "M11-03B Synthetic Org", slug: "m11-03b-synthetic" }
  });
  await prisma.tenant.createMany({
    data: [tenant(TENANT_A, "a"), tenant(TENANT_B, "b")]
  });
  await prisma.channelConnection.create({
    data: {
      capabilities: { atomicTakeoverSmoke: true },
      externalAccountRef: "controlled://channel/m11-03b",
      id: CHANNEL_ID,
      metadata: { synthetic_spec: SPEC },
      orgId: ORG_ID,
      provider: "telegram_bot",
      tenantId: TENANT_A
    }
  });
  await prisma.channelConversation.createMany({
    data: Object.entries(conversations).map(([label, id]) => ({
      channelConnectionId: CHANNEL_ID,
      externalConversationRef: `controlled://conversation/m11-03b/${label}`,
      id,
      orgId: ORG_ID,
      participantExternalRef: `controlled:${label}`,
      status:
        label === "closed"
          ? "CLOSED"
          : label === "pending"
            ? "PENDING_HANDOFF"
            : "OPEN",
      tenantId: TENANT_A,
      unreadCount: 1
    }))
  });
  await prisma.supportTicket.createMany({
    data: [
      seedTicket(tickets.reuse, conversations.reuse),
      seedTicket(tickets.sameClaim, conversations.sameClaim),
      seedTicket(tickets.differentClaim, conversations.differentClaim),
      seedTicket(tickets.multipleA, conversations.multiple),
      seedTicket(tickets.multipleB, conversations.multiple)
    ]
  });
}

function seedTicket(id, conversationId) {
  return {
    conversationId,
    id,
    orgId: ORG_ID,
    priority: 3,
    status: "OPEN",
    summary: "controlled atomic takeover smoke",
    tenantId: TENANT_A
  };
}

function tenant(id, suffix) {
  return {
    id,
    name: `M11-03B Tenant ${suffix}`,
    orgId: ORG_ID,
    slug: `m11-03b-${suffix}`
  };
}

function context(selectedTenantId, userId) {
  return {
    membershipVersion: 1,
    orgId: ORG_ID,
    permissions: ["conversation:read", "ticket:write"],
    selectedTenantId,
    tenantIds: [TENANT_A, TENANT_B],
    userId
  };
}

function takeover(service, accessContext, label) {
  return service.createHandoffTicket(accessContext, {
    conversationId: conversations[label],
    reason: `controlled ${label}`
  });
}

function claim(service, accessContext, ticketId) {
  return service.applyTicketAction(accessContext, { ticketId, type: "claim" });
}

async function onlyTicket(repository, accessContext, label) {
  const items = await repository.listTickets(accessContext, conversations[label]);
  assert.equal(items.length, 1);
  return items[0];
}

async function expectConflictWithoutWrite(prisma, service, actor, label) {
  const before = await snapshot(prisma, conversations[label]);
  await assert.rejects(() => takeover(service, actor, label), /support state conflict/);
  assert.deepEqual(await snapshot(prisma, conversations[label]), before);
}

async function snapshot(prisma, conversationId) {
  const [conversation, ticketRows] = await Promise.all([
    prisma.channelConversation.findUnique({ where: { id: conversationId } }),
    prisma.supportTicket.findMany({
      orderBy: { id: "asc" },
      where: { conversationId, orgId: ORG_ID, tenantId: TENANT_A }
    })
  ]);
  const events = await prisma.supportTicketEvent.findMany({
    orderBy: [{ occurredAt: "asc" }, { id: "asc" }],
    where: {
      orgId: ORG_ID,
      tenantId: TENANT_A,
      ticketId: { in: ticketRows.map((ticket) => ticket.id) }
    }
  });
  return { conversation, events, tickets: ticketRows };
}

async function synchronized(actions) {
  let ready = 0;
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  return Promise.allSettled(
    actions.map((action) =>
      (async () => {
        ready += 1;
        if (ready === actions.length) release();
        await gate;
        return action();
      })()
    )
  );
}

function assertOneWinner(results) {
  assert.equal(count(results, "fulfilled"), 1);
  assert.equal(count(results, "rejected"), 1);
  assertStateConflictFailures(results);
}

function assertStateConflictFailures(results) {
  for (const result of results.filter((item) => item.status === "rejected")) {
    assert.equal(result.reason?.message, "support state conflict");
  }
}

function assertServerEvents(ticket, actorUserId) {
  assert.equal(new Set(ticket.events.map((event) => event.id)).size, 3);
  assert.ok(ticket.events.every((event) => event.actorUserId === actorUserId));
  const times = ticket.events.map((event) => Date.parse(event.occurredAt));
  assert.ok(times[0] < times[1] && times[1] < times[2]);
}

function eventTypes(ticket) {
  return ticket.events.map((event) => event.type);
}

function count(results, status) {
  return results.filter((result) => result.status === status).length;
}

function readDatabaseUrl() {
  const value = process.env.UZMAX_RLS_DATABASE_URL?.trim();
  if (!value) throw new Error("UZMAX_RLS_DATABASE_URL is required");
  return value;
}

async function smokePrisma(databaseUrl) {
  const { PrismaClient } = await import("@prisma/client");
  return new PrismaClient({ datasources: { db: { url: databaseUrl } } });
}

async function runtimeModules() {
  const outDir = await compileApiRuntime();
  const baseUrl = `${pathToFileURL(outDir).href}/`;
  const [repositoryModule, serviceModule] = await Promise.all([
    import(`${baseUrl}conversation-ticket.repository.mjs`),
    import(`${baseUrl}conversation-ticket.service.mjs`)
  ]);
  return { repositoryModule, serviceModule };
}

async function cleanup(prisma) {
  await prisma.org.deleteMany({ where: { id: ORG_ID } });
}

async function residue(prisma) {
  const rows = await prisma.$queryRaw`
    select (
      (select count(*) from org where id::text = ${ORG_ID})
      + (select count(*) from channel_connection where metadata->>'synthetic_spec' = ${SPEC})
      + (select count(*) from conversation where external_conversation_ref like 'controlled://conversation/m11-03b/%')
    )::int as residue
  `;
  return Number(rows[0]?.residue ?? -1);
}

if (process.argv[1]?.endsWith("run-m11-atomic-takeover-true-db-smoke.mjs")) {
  await runM11AtomicTakeoverTrueDbSmoke();
}
