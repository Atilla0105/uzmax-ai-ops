import assert from "node:assert/strict";
import { rm } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { PrismaClient } from "@prisma/client";

import { compileApiRuntime } from "../../../../apps/api/scripts/runtime-compiler.mjs";
import { m11SyntheticSendResult as sent } from "../../../../scripts/tests/m8-conversation-ticket-api-fixture.mjs";
import {
  compileM8ActiveAnswerRuntimeModules,
  createM11AnswerRuntime,
  deferredM11Barrier as deferred
} from "./m8-active-answer-worker-smoke-support.mjs";

const ORG_ID = "11111111-1111-4111-8111-111111111941";
const TENANT_A = "22222222-2222-4222-8222-222222222941";
const TENANT_B = "33333333-3333-4333-8333-333333333941";
const USER_ID = "44444444-4444-4444-8444-444444444941";
const CHANNEL_ID = "55555555-5555-4555-8555-555555555941";
const HUMAN_CONVERSATION_ID = "66666666-6666-4666-8666-666666666941";
const ANSWER = { answerText: "bounded answer", status: "answered" };
const FOLLOW_UP = { ...ANSWER, followUp: { reasonCode: "kb_not_found" } };
const HANDOFF = {
  reasonCode: "requires_operator_review",
  status: "handoff_required",
  suppressOutbound: true
};
const answer = (calls, result = ANSWER, barrier) =>
  createM11AnswerRuntime(calls, result, barrier);
const tempDir = path.resolve(".tmp", `m11-04a-${process.pid}`);
let prisma, runtime, gateway, service;

export function runM11WorkerOwnershipFenceTrueDbSmoke() {
  return runSmoke().catch(() => {
    throw new Error("m11-worker-ownership-fence-true-db-smoke-failed");
  });
}

async function runSmoke() {
  prisma = new PrismaClient({ datasources: { db: { url: databaseUrl() } } });
  try {
    await cleanup();
    await seed();
    runtime = await compileM8ActiveAnswerRuntimeModules({
      repoRoot: process.cwd(),
      tempDir: path.join(tempDir, "worker")
    });
    gateway = new runtime.persistence.PrismaTelegramBotConversationPersistenceGateway(
      prisma
    );
    service = await supportService();
    await assertExistingHumanState();
    await assertTakeoverFirst();
    await assertClaimFirst();
    await assertAutomaticHandoffFirst();
    await assertCrashRecovery();
    await assertUncertainSend();
    await assertTenantIsolation();
    await cleanup();
    assert.equal(await residue(), 0);
  } finally {
    await cleanup();
    await prisma.$disconnect();
    await rm(tempDir, { force: true, recursive: true }).catch(() => undefined);
  }
  console.log("m11-worker-ownership-fence-true-db-smoke: passed");
}

async function assertExistingHumanState() {
  const calls = { answer: 0, send: 0 };
  await runJob("9411", calls);
  assert.equal((await runJob("9411", calls)).status, "deduped");
  assert.deepEqual(calls, { answer: 0, send: 0 });
  assert.equal(await messageCount(HUMAN_CONVERSATION_ID, "OUTBOUND"), 0);
  assert.equal(await messageCount(HUMAN_CONVERSATION_ID, "INBOUND"), 1);
  assert.equal(await ticketCount(HUMAN_CONVERSATION_ID), 1);
  const conversation = await prisma.channelConversation.findUnique({
    where: { id: HUMAN_CONVERSATION_ID }
  });
  assert.equal(conversation.status, "PENDING_HANDOFF");
  assert.equal(conversation.unreadCount, 1);
}

async function assertTakeoverFirst() {
  const calls = { answer: 0, send: 0 },
    [entered, release] = [deferred(), deferred()];
  const job = runJob("9421", calls, answer(calls, FOLLOW_UP, { entered, release }));
  await entered.promise;
  const conversation = await conversationFor("9421");
  assert.equal(await pendingDedupe("9421"), 1);
  assert.equal(
    (await intentFor(conversation.id)).content.runtimeOrigin,
    "telegram_bot_ai"
  );
  await takeover(conversation.id, "takeover first");
  assert.equal((await intentFor(conversation.id)).deliveryStatus, "CANCELLED");
  assert.equal((await runJob("9421", calls)).status, "deduped");
  release.resolve();
  await job;
  assert.deepEqual(calls, { answer: 1, send: 0 });
  await assertHumanOwner(conversation.id, 1);
}

async function assertClaimFirst() {
  const calls = { answer: 0, send: 0 };
  const [entered, release] = [deferred(), deferred()];
  const job = runJob("9431", calls, answer(calls, FOLLOW_UP), {
    async sendMessage(request) {
      calls.send += 1;
      entered.resolve();
      await release.promise;
      return sent(request);
    }
  });
  await entered.promise;
  const conversation = await conversationFor("9431");
  assert.equal(await pendingDedupe("9431"), 1);
  assert.equal((await intentFor(conversation.id)).content.dispatchPhase, "claimed");
  await takeover(conversation.id, "claim first");
  assert.equal((await intentFor(conversation.id)).deliveryStatus, "QUEUED");
  release.resolve();
  await job;
  const intent = await intentFor(conversation.id);
  assert.equal(intent.deliveryStatus, "SENT");
  assert.equal(intent.content.dispatchPhase, "terminal");
  await assertHumanOwner(conversation.id, 0);
}

async function assertAutomaticHandoffFirst() {
  const calls = { answer: 0, send: 0 };
  await runJob("9441", calls, answer(calls, HANDOFF));
  const conversation = await conversationFor("9441");
  assert.equal(await ticketCount(conversation.id), 1);
  assert.equal(await createdEventCount(conversation.id), 1);
  await takeover(conversation.id, "automatic first");
  assert.equal(await createdEventCount(conversation.id), 1);
  await assertHumanOwner(conversation.id, 1);
}

async function assertCrashRecovery() {
  for (const phase of ["generating", "claimed"]) {
    const id = phase === "generating" ? "9451" : "9452";
    const calls = { answer: 0, send: 0 };
    const crashGateway = crashAfter(phase);
    await assert.rejects(
      () => runJob(id, calls, answer(calls), undefined, crashGateway),
      /synthetic crash/
    );
    await runJob(id, calls, answer(calls));
    const conversation = await conversationFor(id);
    const intent = await intentFor(conversation.id);
    assert.equal(calls.answer, phase === "claimed" ? 1 : 0);
    assert.equal(calls.send, 0);
    assert.equal(intent.deliveryStatus, phase === "claimed" ? "QUEUED" : "CANCELLED");
    assert.equal(
      intent.content.dispatchPhase,
      phase === "claimed" ? "uncertain" : "cancelled"
    );
    assert.equal(conversation.unreadCount, 1);
    assert.equal(await ticketCount(conversation.id), 1);
  }
}

async function assertUncertainSend() {
  const calls = { answer: 0, send: 0 };
  const throwing = {
    async sendMessage() {
      calls.send += 1;
      throw new Error("synthetic ambiguity");
    }
  };
  await runJob("9461", calls, answer(calls), throwing);
  const retry = await runJob("9461", calls, answer(calls), throwing);
  const conversation = await conversationFor("9461");
  const intent = await intentFor(conversation.id);
  assert.equal(retry.status, "deduped");
  assert.deepEqual(calls, { answer: 1, send: 1 });
  assert.equal(intent.deliveryStatus, "QUEUED");
  assert.equal(intent.content.dispatchPhase, "uncertain");
  assert.equal(intent.content.deliveryUncertain, true);
  assert.equal(conversation.unreadCount, 1);
}

async function assertTenantIsolation() {
  const dedupes = await prisma.telegramUpdateDedupe.findMany({
    where: { orgId: ORG_ID, tenantId: TENANT_A }
  });
  assert.equal(dedupes.length, 7);
  assert.ok(dedupes.every(({ processedAt }) => processedAt instanceof Date));
  assert.ok((await visibleResidue(TENANT_A)) > 0);
  assert.equal(await visibleResidue(TENANT_B), 0);
  const conversation = await conversationFor("9421");
  const before = await snapshot(conversation.id);
  await assert.rejects(
    () =>
      service.createHandoffTicket(context(TENANT_B), {
        conversationId: conversation.id,
        reason: "wrong tenant"
      }),
    /conversation not found/
  );
  assert.deepEqual(await snapshot(conversation.id), before);
}

async function runJob(id, calls, answerRuntime, sendPort, selectedGateway = gateway) {
  return runtime.conversationRuntime.processTelegramBotConversationJob(
    payload(id),
    selectedGateway,
    {
      admissionPolicy: {
        allowedChatExternalRefs: new Set([externalRef("chat", id)]),
        allowedParticipantExternalRefs: new Set([externalRef("user", id)])
      },
      answerRuntime: answerRuntime ?? answer(calls),
      sendPort: sendPort ?? {
        async sendMessage(request) {
          calls.send += 1;
          return sent(request);
        }
      }
    }
  );
}

function crashAfter(phase) {
  const failAfter = async (at, promise) => {
    const result = await promise;
    if (phase === at) throw new Error(`synthetic crash after ${at}`);
    return result;
  };
  return {
    claimPreparedAnswer: (input) =>
      failAfter("claimed", gateway.claimPreparedAnswer(input)),
    finalizePreparedAnswer: gateway.finalizePreparedAnswer.bind(gateway),
    handoffPreparedAnswer: gateway.handoffPreparedAnswer.bind(gateway),
    persistAcceptedUpdate: gateway.persistAcceptedUpdate.bind(gateway),
    prepareAcceptedUpdate: (input) =>
      failAfter("generating", gateway.prepareAcceptedUpdate(input))
  };
}

function payload(id) {
  return runtime.channels.createTelegramBotConversationJobPayload({
    channelConnectionId: CHANNEL_ID,
    enqueuedAt: "2026-07-10T00:00:00.000Z",
    orgId: ORG_ID,
    tenantId: TENANT_A,
    traceId: `trace:m11-04a:${id}`,
    update: {
      chatExternalRef: externalRef("chat", id),
      chatType: "private",
      contentKind: "text",
      messageExternalRef: `telegram:message:${id}`,
      participantExternalRef: externalRef("user", id),
      provider: "telegram_bot",
      providerUpdateId: id,
      text: "synthetic bounded request",
      updateKind: "message"
    }
  });
}

async function supportService() {
  const outDir = await compileApiRuntime({ outDir: path.join(tempDir, "api") });
  const base = `${pathToFileURL(outDir).href}/`;
  const [repositoryModule, serviceModule] = await Promise.all([
    import(`${base}conversation-ticket.repository.mjs`),
    import(`${base}conversation-ticket.service.mjs`)
  ]);
  const repository =
    await repositoryModule.createConversationTicketRepositoryProviderFromEnv({
      mode: "rls_prisma_gateway",
      prismaClient: prisma
    });
  return new serviceModule.ConversationTicketService(repository);
}

async function seed() {
  await prisma.org.create({
    data: { id: ORG_ID, name: "M11-04A Synthetic Org", slug: "m11-04a" }
  });
  await prisma.tenant.createMany({
    data: [tenant(TENANT_A, "a"), tenant(TENANT_B, "b")]
  });
  await prisma.channelConnection.create({
    data: {
      capabilities: { workerOwnershipFence: true },
      externalAccountRef: "controlled://channel/m11-04a",
      id: CHANNEL_ID,
      metadata: { synthetic_spec: "M11-04A" },
      orgId: ORG_ID,
      provider: "telegram_bot",
      tenantId: TENANT_A
    }
  });
  await prisma.channelConversation.create({
    data: {
      channelConnectionId: CHANNEL_ID,
      externalConversationRef: externalRef("chat", "9411"),
      id: HUMAN_CONVERSATION_ID,
      orgId: ORG_ID,
      participantExternalRef: externalRef("user", "9411"),
      status: "PENDING_HANDOFF",
      tenantId: TENANT_A,
      unreadCount: 0
    }
  });
  await prisma.supportTicket.create({
    data: {
      conversationId: HUMAN_CONVERSATION_ID,
      id: "77777777-7777-4777-8777-777777777941",
      orgId: ORG_ID,
      priority: 3,
      status: "OPEN",
      summary: "controlled existing human ticket",
      tenantId: TENANT_A
    }
  });
}

async function conversationFor(id) {
  const row = await prisma.channelConversation.findFirst({
    where: {
      orgId: ORG_ID,
      tenantId: TENANT_A,
      externalConversationRef: externalRef("chat", id)
    }
  });
  assert.ok(row);
  return row;
}

async function intentFor(conversationId) {
  const row = await prisma.channelMessage.findFirst({
    where: { conversationId, direction: "OUTBOUND", orgId: ORG_ID, tenantId: TENANT_A }
  });
  assert.ok(row);
  return row;
}

async function assertHumanOwner(conversationId, unreadCount) {
  const [conversation, tickets] = await Promise.all([
    prisma.channelConversation.findUnique({ where: { id: conversationId } }),
    prisma.supportTicket.findMany({ where: { conversationId } })
  ]);
  assert.equal(conversation.status, "HANDOFF");
  assert.equal(conversation.unreadCount, unreadCount);
  assert.equal(tickets.length, 1);
  assert.equal(tickets[0].assignedUserId, USER_ID);
  assert.equal(tickets[0].lockedByUserId, USER_ID);
}

const takeover = (conversationId, reason) =>
  service.createHandoffTicket(context(TENANT_A), { conversationId, reason });

function context(selectedTenantId) {
  return {
    membershipVersion: 1,
    orgId: ORG_ID,
    permissions: ["conversation:read", "ticket:write"],
    selectedTenantId,
    tenantIds: [TENANT_A, TENANT_B],
    userId: USER_ID
  };
}

const tenant = (id, slug) => ({ id, name: slug, orgId: ORG_ID, slug });
const externalRef = (kind, id) => `telegram:${kind}:${id}`;

const ticketCount = (conversationId) =>
  prisma.supportTicket.count({ where: { conversationId } });
const createdEventCount = (conversationId) =>
  prisma.supportTicketEvent.count({
    where: { eventType: "CREATED", ticket: { conversationId } }
  });
const messageCount = (conversationId, direction) =>
  prisma.channelMessage.count({ where: { conversationId, direction } });
const pendingDedupe = (providerUpdateId) =>
  prisma.telegramUpdateDedupe.count({
    where: { orgId: ORG_ID, processedAt: null, providerUpdateId, tenantId: TENANT_A }
  });
const snapshot = (conversationId) =>
  Promise.all([
    prisma.channelConversation.findUnique({ where: { id: conversationId } }),
    prisma.channelMessage.findMany({ where: { conversationId } }),
    prisma.supportTicket.findMany({ where: { conversationId } }),
    prisma.supportTicketEvent.findMany({ where: { ticket: { conversationId } } })
  ]);

async function visibleResidue(tenantId) {
  const result = await prisma.$transaction([
    prisma.$executeRawUnsafe('set local role "uzmax_app_runtime"'),
    prisma.$queryRaw`select set_config('app.org_id', ${ORG_ID}, true)`,
    prisma.$queryRaw`select set_config('app.tenant_id', ${tenantId}, true)`,
    prisma.$queryRaw`
      select ((select count(*) from channel_connection) + (select count(*) from conversation) + (select count(*) from customer)
        + (select count(*) from customer_identity) + (select count(*) from message) + (select count(*) from ticket)
        + (select count(*) from ticket_event) + (select count(*) from telegram_update_dedupe))::int as residue
    `
  ]);
  return Number(result.at(-1)?.[0]?.residue ?? -1);
}

const cleanup = () => prisma?.org.deleteMany({ where: { id: ORG_ID } });

async function residue() {
  const rows = await prisma.$queryRaw`
    select ((select count(*) from org where id::text = ${ORG_ID}) + (select count(*) from tenant where org_id::text = ${ORG_ID})
      + (select count(*) from channel_connection where org_id::text = ${ORG_ID}) + (select count(*) from conversation where org_id::text = ${ORG_ID})
      + (select count(*) from customer where org_id::text = ${ORG_ID}) + (select count(*) from customer_identity where org_id::text = ${ORG_ID})
      + (select count(*) from message where org_id::text = ${ORG_ID}) + (select count(*) from ticket where org_id::text = ${ORG_ID})
      + (select count(*) from ticket_event where org_id::text = ${ORG_ID}) + (select count(*) from telegram_update_dedupe where org_id::text = ${ORG_ID}))::int as residue
  `;
  return Number(rows[0]?.residue ?? -1);
}

function databaseUrl() {
  const value = process.env.UZMAX_RLS_DATABASE_URL?.trim();
  if (!value) throw new Error("UZMAX_RLS_DATABASE_URL is required");
  return value;
}

if (process.argv[1]?.endsWith("run-m11-worker-ownership-fence-true-db-smoke.mjs")) {
  await runM11WorkerOwnershipFenceTrueDbSmoke().catch(() => {
    console.error("m11-worker-ownership-fence-true-db-smoke-failed");
    process.exitCode = 1;
  });
}
