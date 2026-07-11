import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
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

const MARKER = "m11-conversation-close-reopen-true-db-smoke-failed";
const ORG = "11111111-1111-4111-8111-111111111951",
  TENANT_A = "22222222-2222-4222-8222-222222222951",
  TENANT_B = "33333333-3333-4333-8333-333333333951",
  USER = "44444444-4444-4444-8444-444444444951",
  CHANNEL = "55555555-5555-4555-8555-555555555951";
const tempDir = path.resolve(".tmp", `m11-04b1-${process.pid}`);
const FOLLOW_UP = {
  answerText: "bounded answer",
  followUp: { reasonCode: "kb_not_found" },
  status: "answered"
};
const id = (suffix) => `95000000-0000-4000-8000-${String(suffix).padStart(12, "0")}`;
let prisma, worker, gateway, service, api;
const failure = { fatalRowsSeeded: false, stage: "bootstrap" };
const staged = (name, action) => ((failure.stage = name), action());

export function runM11ConversationCloseReopenTrueDbSmoke() {
  return runSmoke().catch(() => {
    throw new Error(MARKER);
  });
}

async function runSmoke() {
  if (process.env.UZMAX_M11_CLOSE_REOPEN_FATAL_TEST === "1") return runFatalChild();
  prisma = client();
  try {
    await cleanup();
    await staged("sanitizer", assertSanitizedFailure);
    assert.equal(await residue(), 0);
    await staged("setup", seed);
    worker = await compileM8ActiveAnswerRuntimeModules({
      repoRoot: process.cwd(),
      tempDir: path.join(tempDir, "worker")
    });
    gateway = new worker.persistence.PrismaTelegramBotConversationPersistenceGateway(
      prisma
    );
    api = await apiModules();
    service = await supportService(prisma);
    const closeFirst = await staged("close_first", assertCloseFirst);
    const claimFirst = await staged("claim_first", assertClaimFirst);
    const reclosed = await assertClosedInboundReopen(closeFirst);
    await staged("isolation", () => assertIsolation(claimFirst, reclosed));
    await staged("cleanup", cleanup);
    assert.equal(await residue(), 0);
  } finally {
    await cleanup().catch(() => undefined);
    await prisma.$disconnect();
    await rm(tempDir, { force: true, recursive: true }).catch(() => undefined);
  }
  console.log("m11-conversation-close-reopen-true-db-smoke: passed");
}

async function runFatalChild() {
  prisma = client();
  try {
    await cleanup();
    await seed();
    failure.fatalRowsSeeded = true;
    throw new Error(`reason-sentinel message-sentinel token-sentinel ${databaseUrl()}`);
  } finally {
    await cleanup().catch(() => undefined);
    await prisma.$disconnect();
  }
}

async function assertCloseFirst() {
  const calls = { answer: 0, send: 0 };
  const [entered, release] = [deferred(), deferred()];
  const job = runJob("9511", "9511", calls, answer(calls, { entered, release }));
  await entered.promise;
  const conversation = await conversationFor("9511");
  const handoff = await takeover(conversation.id);
  assert.equal((await intentFor(conversation.id)).deliveryStatus, "CANCELLED");
  await seedQueued(id(11), conversation.id);
  await seedQueued(id(13), conversation.id, "operator");
  const closed = await applyClose(handoff.ticket, id(12));
  assert.equal(await messageStatus(id(11)), "CANCELLED");
  assert.equal(await messageStatus(id(13)), "QUEUED");
  release.resolve();
  await job;
  assert.deepEqual(calls, { answer: 1, send: 0 });
  await assertClosedPair(conversation.id, closed.ticket.id);
  return { ...closed, threadId: "9511" };
}

async function assertClaimFirst() {
  const calls = { answer: 0, send: 0 };
  const [entered, release] = [deferred(), deferred()];
  const job = runJob("9521", "9521", calls, answer(calls), {
    async sendMessage(request) {
      calls.send += 1;
      entered.resolve();
      await release.promise;
      return sent(request);
    }
  });
  await entered.promise;
  const conversation = await conversationFor("9521");
  const closed = await applyClose((await takeover(conversation.id)).ticket, id(21));
  assert.equal((await intentFor(conversation.id)).deliveryStatus, "QUEUED");
  release.resolve();
  await job;
  assert.deepEqual(calls, { answer: 1, send: 1 });
  assert.equal((await intentFor(conversation.id)).deliveryStatus, "SENT");
  assert.equal(
    await prisma.channelMessage.count({
      where: { conversationId: conversation.id, direction: "OUTBOUND" }
    }),
    1
  );
  await assertClosedPair(conversation.id, closed.ticket.id);
  return closed;
}

async function assertClosedInboundReopen(closed) {
  const calls = { answer: 0, send: 0 };
  await assertInbound(closed, "9512", calls, 1, "ci1");
  const closedEvent = ((failure.stage = "reopen"), closed.ticket.events.at(-1));
  const command = reopenInput(closed.ticket.id, closedEvent.id, id(31));
  const reopened = await service.applyTicketAction(context(TENANT_A), command);
  assert.equal(reopened.ticket.status, "reopened");
  assert.equal(reopened.ticket.closedAt, undefined);
  assert.equal(reopened.ticket.closeResult, undefined);
  const prior = reopened.ticket.events.find((event) => event.id === closedEvent.id);
  assert.equal(prior.destination, closed.input.destination);
  const replay = await service.applyTicketAction(context(TENANT_A), command);
  assert.equal(replay.result, "already_applied");
  assert.equal(eventCount(replay.ticket, "reopened"), 1);
  await assertInbound(closed, "9513", calls, 2, "ci2");
  assert.deepEqual(calls, { answer: 0, send: 0 });
  const locked = await service.applyTicketAction(context(TENANT_A), {
    ticketId: reopened.ticket.id,
    type: "lock"
  });
  const reclosed = await applyClose(locked.ticket, id(32), "duplicate");
  assert.equal((await conversationById(closed.conversation.id)).unreadCount, 0);
  const beforeReplay = await snapshot(closed.conversation.id);
  assert.equal(
    (await service.applyTicketAction(context(TENANT_A), command)).result,
    "already_applied"
  );
  assert.deepEqual(await snapshot(closed.conversation.id), beforeReplay);
  return { ...reclosed, reopenInput: command };
}

async function assertInbound(closed, updateId, calls, unread, stage) {
  const cid = ((failure.stage = stage), closed.conversation.id);
  const before = await inboundProof(((failure.stage += "b"), cid), updateId);
  failure.stage += "j";
  const first = await runJob(updateId, closed.threadId, calls, answer(calls));
  assert.equal(((failure.stage += "s"), first.status), "accepted");
  const after = await inboundProof(((failure.stage += "a"), cid), updateId);
  failure.stage += "p";
  assert.equal(((failure.stage += "d"), after.dedupes), 1);
  assert.equal(((failure.stage += "i"), after.inbound), before.inbound + 1);
  assert.equal(((failure.stage += "m"), after.messages), 1);
  assert.equal(((failure.stage += "o"), after.outbound), before.outbound);
  assert.equal(((failure.stage += "u"), after.unread), unread);
  failure.stage += "t";
  const retry = await runJob(updateId, closed.threadId, calls, answer(calls));
  assert.equal(((failure.stage += "q"), retry.status), "deduped");
  assert.deepEqual(await inboundProof(((failure.stage += "r"), cid), updateId), after);
}

async function assertIsolation(claimFirst, reclosed) {
  await assertWrongTenantUnchanged(claimFirst.conversation.id, claimFirst.input);
  await assertWrongTenantUnchanged(
    reclosed.conversation.id,
    reopenInput(reclosed.ticket.id, reclosed.ticket.events.at(-1).id, id(41))
  );
  assert.ok(Object.values(await visibleCounts(TENANT_B)).every((count) => count === 0));
  assert.equal(await prisma.auditLog.count({ where: { orgId: ORG } }), 0);
}

async function assertWrongTenantUnchanged(conversationId, input) {
  const before = await snapshot(conversationId);
  await assert.rejects(
    () => service.applyTicketAction(context(TENANT_B), input),
    /ticket not found/
  );
  assert.deepEqual(await snapshot(conversationId), before);
}

async function applyClose(ticket, requestId, result = "resolved") {
  const priorClosed = eventCount(ticket, "closed");
  const input = {
    destination: `controlled ${result}`,
    expectedLifecycleEventId: ticket.events.at(-1).id,
    requestId,
    result,
    ticketId: ticket.id,
    type: "close"
  };
  const closed = await service.applyTicketAction(context(TENANT_A), input);
  assert.equal(closed.result, "applied");
  assert.equal(closed.ticket.closeResult, result);
  assert.equal(closed.ticket.closeDestination, input.destination);
  assert.equal(closed.ticket.closedAt, closed.ticket.events.at(-1).occurredAt);
  const replay = await service.applyTicketAction(context(TENANT_A), input);
  assert.equal(replay.result, "already_applied");
  assert.equal(eventCount(replay.ticket, "closed"), priorClosed + 1);
  return { ...closed, input };
}

const takeover = (conversationId) =>
  service.createHandoffTicket(context(TENANT_A), {
    conversationId,
    reason: "controlled takeover before close"
  });

async function runJob(updateId, threadId, calls, answerRuntime, sendPort) {
  return worker.conversationRuntime.processTelegramBotConversationJob(
    payload(updateId, threadId),
    gateway,
    {
      admissionPolicy: {
        allowedChatExternalRefs: new Set([external("chat", threadId)]),
        allowedParticipantExternalRefs: new Set([external("user", threadId)])
      },
      answerRuntime,
      sendPort: sendPort ?? {
        async sendMessage(request) {
          calls.send += 1;
          return sent(request);
        }
      }
    }
  );
}

const answer = (calls, barrier) => createM11AnswerRuntime(calls, FOLLOW_UP, barrier);
const external = (kind, value) => `telegram:${kind}:${value}`;
const reopenInput = (ticketId, expectedClosedEventId, requestId) => ({
  expectedClosedEventId,
  reason: "controlled human reopen",
  requestId,
  ticketId,
  type: "reopen"
});

function payload(updateId, threadId) {
  return worker.channels.createTelegramBotConversationJobPayload({
    channelConnectionId: CHANNEL,
    enqueuedAt: "2026-07-10T00:00:00.000Z",
    orgId: ORG,
    tenantId: TENANT_A,
    traceId: `trace:m11-04b1:${updateId}`,
    update: {
      chatExternalRef: external("chat", threadId),
      chatType: "private",
      contentKind: "text",
      messageExternalRef: `telegram:message:${updateId}`,
      participantExternalRef: external("user", threadId),
      provider: "telegram_bot",
      providerUpdateId: updateId,
      text: "synthetic bounded request",
      updateKind: "message"
    }
  });
}

async function supportService(prismaClient) {
  const repository =
    await api.repository.createConversationTicketRepositoryProviderFromEnv({
      mode: "rls_prisma_gateway",
      prismaClient
    });
  return new api.service.ConversationTicketService(repository);
}

async function apiModules() {
  const outDir = await compileApiRuntime({ outDir: path.join(tempDir, "api") });
  const base = `${pathToFileURL(outDir).href}/`;
  const [repository, serviceModule] = await Promise.all([
    import(`${base}conversation-ticket.repository.mjs`),
    import(`${base}conversation-ticket.service.mjs`)
  ]);
  return { repository, service: serviceModule };
}

const seed = async () => {
  await prisma.org.create({
    data: { id: ORG, name: "M11-04B1 Synthetic Org", slug: "m11-04b1" }
  });
  await prisma.tenant.createMany({
    data: [
      { id: TENANT_A, name: "a", orgId: ORG, slug: "a" },
      { id: TENANT_B, name: "b", orgId: ORG, slug: "b" }
    ]
  });
  await prisma.channelConnection.create({
    data: {
      capabilities: { lifecycle: true },
      externalAccountRef: "controlled://channel/m11-04b1",
      id: CHANNEL,
      metadata: { synthetic_spec: "M11-04B1" },
      orgId: ORG,
      provider: "telegram_bot",
      tenantId: TENANT_A
    }
  });
};

const seedQueued = (messageId, conversationId, runtimeOrigin = "telegram_bot_ai") =>
  prisma.channelMessage.create({
    data: {
      channelConnectionId: CHANNEL,
      content: { dispatchPhase: "generating", runtimeOrigin },
      contentKind: "TEXT",
      conversationId,
      deliveryStatus: "QUEUED",
      direction: "OUTBOUND",
      id: messageId,
      occurredAt: new Date(),
      orgId: ORG,
      tenantId: TENANT_A
    }
  });

async function assertClosedPair(conversationId, ticketId) {
  assert.equal((await conversationById(conversationId)).status, "CLOSED");
  assert.equal(
    (await prisma.supportTicket.findUnique({ where: { id: ticketId } })).status,
    "CLOSED"
  );
}

async function visibleCounts(tenantId) {
  const rows = await prisma.$transaction([
    prisma.$executeRawUnsafe('set local role "uzmax_app_runtime"'),
    prisma.$queryRaw`select set_config('app.org_id', ${ORG}, true)`,
    prisma.$queryRaw`select set_config('app.tenant_id', ${tenantId}, true)`,
    prisma.$queryRaw`select (select count(*) from conversation)::int conversations, (select count(*) from message)::int messages, (select count(*) from ticket)::int tickets, (select count(*) from ticket_event)::int events, (select count(*) from audit_log)::int audits, (select count(*) from telegram_update_dedupe)::int dedupes, (select count(*) from customer)::int customers, (select count(*) from customer_identity)::int identities`
  ]);
  return rows.at(-1)[0];
}

const conversationFor = (threadId) =>
  prisma.channelConversation.findFirstOrThrow({
    where: {
      externalConversationRef: external("chat", threadId),
      orgId: ORG,
      tenantId: TENANT_A
    }
  });
const conversationById = (conversationId) =>
  prisma.channelConversation.findUniqueOrThrow({ where: { id: conversationId } });
const intentFor = (conversationId) =>
  prisma.channelMessage.findFirstOrThrow({
    where: { conversationId, direction: "OUTBOUND", orgId: ORG, tenantId: TENANT_A }
  });
const messageStatus = (messageId) =>
  prisma.channelMessage
    .findUniqueOrThrow({ where: { id: messageId } })
    .then(({ deliveryStatus }) => deliveryStatus);
const eventCount = (ticket, type) =>
  ticket.events.filter((event) => event.type === type).length;
const context = (selectedTenantId) => ({
  membershipVersion: 1,
  orgId: ORG,
  permissions: ["conversation:read", "ticket:write"],
  selectedTenantId,
  tenantIds: [TENANT_A, TENANT_B],
  userId: USER
});
const cleanup = () => prisma?.org.deleteMany({ where: { id: ORG } });
const client = () => new PrismaClient({ datasources: { db: { url: databaseUrl() } } });

async function inboundProof(conversationId, updateId) {
  const rows =
    await prisma.$queryRaw`select (select count(*) from message where conversation_id::text = ${conversationId} and direction = 'inbound')::int inbound, (select count(*) from message where conversation_id::text = ${conversationId} and direction = 'outbound')::int outbound, (select count(*) from message where conversation_id::text = ${conversationId} and direction = 'inbound' and external_message_ref = ${external("message", updateId)})::int messages, (select count(*) from telegram_update_dedupe where org_id::text = ${ORG} and tenant_id::text = ${TENANT_A} and channel_connection_id::text = ${CHANNEL} and provider_update_id = ${updateId} and processed_at is not null)::int dedupes, (select unread_count from conversation where id::text = ${conversationId})::int unread`;
  return rows[0];
}

const snapshot = (conversationId) =>
  Promise.all([
    prisma.channelConversation.findUnique({ where: { id: conversationId } }),
    sorted(prisma.channelMessage, { conversationId }),
    sorted(prisma.supportTicket, { conversationId }),
    sorted(prisma.supportTicketEvent, { ticket: { conversationId } }),
    sorted(prisma.auditLog, { objectId: conversationId })
  ]);
const sorted = (model, where) => model.findMany({ orderBy: { id: "asc" }, where });

async function residue() {
  const rows =
    await prisma.$queryRaw`select ((select count(*) from org where id::text = ${ORG}) + (select count(*) from tenant where org_id::text = ${ORG}) + (select count(*) from channel_connection where org_id::text = ${ORG}) + (select count(*) from conversation where org_id::text = ${ORG}) + (select count(*) from message where org_id::text = ${ORG}) + (select count(*) from ticket where org_id::text = ${ORG}) + (select count(*) from ticket_event where org_id::text = ${ORG}) + (select count(*) from audit_log where org_id::text = ${ORG}) + (select count(*) from telegram_update_dedupe where org_id::text = ${ORG}) + (select count(*) from customer where org_id::text = ${ORG}) + (select count(*) from customer_identity where org_id::text = ${ORG}))::int residue`;
  return Number(rows[0]?.residue ?? -1);
}

function assertSanitizedFailure() {
  const child = spawnSync(process.execPath, [process.argv[1]], {
    encoding: "utf8",
    env: { ...process.env, UZMAX_M11_CLOSE_REOPEN_FATAL_TEST: "1" }
  });
  assert.equal(child.status, 17);
  assert.equal(child.stdout, "");
  assert.equal(child.stderr, `${MARKER}\n`);
}

function databaseUrl() {
  const value = process.env.UZMAX_RLS_DATABASE_URL?.trim();
  if (!value) throw new Error("UZMAX_RLS_DATABASE_URL is required");
  return value;
}

if (process.argv[1]?.endsWith("run-m11-conversation-close-reopen-true-db-smoke.mjs")) {
  await runM11ConversationCloseReopenTrueDbSmoke().catch(() => {
    console.error(failure.fatalRowsSeeded ? MARKER : `${MARKER}:${failure.stage}`);
    process.exitCode = failure.fatalRowsSeeded ? 17 : 1;
  });
}
