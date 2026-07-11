import assert from "node:assert/strict";
import path from "node:path";
import { describe, it } from "node:test";
import { pathToFileURL } from "node:url";

import { compileApiRuntime } from "../../apps/api/scripts/runtime-compiler.mjs";
import {
  compileM8ActiveAnswerRuntimeModules,
  createM11MemoryFenceSeed,
  deferredM11Barrier as deferred
} from "../../packages/db/scripts/tests/m8-active-answer-worker-smoke-support.mjs";
import {
  ORG_ID,
  TENANT_A,
  USER_A,
  contextFor,
  fakePrisma,
  m11SyntheticSendResult as sent
} from "./m8-conversation-ticket-api-fixture.mjs";

const CHANNEL_ID = "66666666-6666-4666-8666-666666666666";
const uuid = (suffix) => `42000000-0000-4000-8000-${String(suffix).padStart(12, "0")}`;
const worker = await compileM8ActiveAnswerRuntimeModules({
  repoRoot: process.cwd(),
  tempDir: path.join(process.cwd(), "node_modules/.cache/m11-04a-worker-focused")
});
const apiOutDir = await compileApiRuntime({
  outDir: path.join(process.cwd(), "node_modules/.cache/m11-04a-api-focused")
});
const apiModule = (name) =>
  import(`${pathToFileURL(path.join(apiOutDir, `${name}.mjs`)).href}?m11=04a`);
const [repositoryModule, serviceModule] = await Promise.all([
  apiModule("conversation-ticket.repository"),
  apiModule("conversation-ticket.service")
]);

describe("M11-04A worker ownership and send fence", () => {
  it("stores human and closed-state inbound without LLM, send or new tickets", async () => {
    const cases = [
      { status: "PENDING_HANDOFF", ticket: ticketRow(uuid(1), "OPEN") },
      { status: "HANDOFF", ticket: ticketRow(uuid(2), "LOCKED", USER_A, USER_A) },
      { status: "CLOSED" }
    ];
    for (const [index, item] of cases.entries()) {
      const db = emptyPrisma();
      const input = payload(`91${index + 1}1`);
      const conversation = conversationRow(input, item.status);
      db.conversations.push(conversation);
      if (item.ticket)
        db.tickets.push({ ...item.ticket, conversationId: conversation.id });
      const calls = { answer: 0, send: 0 };
      const gateway = productionGateway(db);
      const result = await run(input, gateway, calls);
      const duplicate = await run(input, gateway, calls);

      assert.equal(result.runtimeBranch, "handoff", item.status);
      assert.equal(duplicate.status, "deduped", item.status);
      assert.deepEqual(calls, { answer: 0, send: 0 }, item.status);
      assert.equal(db.messages.filter((row) => row.direction === "INBOUND").length, 1);
      assert.equal(db.messages.filter((row) => row.direction === "OUTBOUND").length, 0);
      assert.equal(db.tickets.length, item.ticket ? 1 : 0);
      assert.equal(db.conversations[0].status, item.status);
      assert.equal(db.conversations[0].unreadCount, 1);
      assert.ok(db.dedupes[0].processedAt instanceof Date);
    }
  });

  it("keeps a newer human takeover or close authoritative during LLM", async () => {
    const decisions = "answered handoff closed_answered closed_handoff closed_recovery";
    for (const [index, decision] of decisions.split(" ").entries()) {
      const db = emptyPrisma();
      const input = payload(`920${index + 1}`);
      const gateway = productionGateway(db);
      const [answerEntered, answerRelease] = [deferred(), deferred()];
      const calls = { answer: 0, send: 0 };
      const job = run(input, gateway, calls, {
        async answer() {
          calls.answer += 1;
          answerEntered.resolve();
          await answerRelease.promise;
          if (decision.endsWith("handoff"))
            return {
              reasonCode: "requires_operator_review",
              status: "handoff_required",
              suppressOutbound: true
            };
          return {
            answerText: "bounded answer",
            followUp: { reasonCode: "kb_not_found" },
            status: "answered"
          };
        }
      });
      await answerEntered.promise;
      const closed = decision.startsWith("closed");
      if (closed) await closeCurrent(db, uuid(20 + index));
      else await takeControl(db);
      assert.equal(aiIntent(db).deliveryStatus, "CANCELLED");
      if (!closed || decision.endsWith("recovery"))
        assert.equal((await run(input, gateway, calls)).status, "deduped");
      answerRelease.resolve();
      const result = await job;

      assert.equal(result.runtimeBranch, "handoff");
      assert.deepEqual(calls, { answer: 1, send: 0 });
      assert.equal(db.conversations[0].status, closed ? "CLOSED" : "HANDOFF");
      assert.equal(db.tickets.length, 1);
      if (!closed) assert.equal(db.tickets[0].lockedByUserId, USER_A);
      assert.equal(db.conversations[0].unreadCount, closed ? 0 : 1);
      assert.ok(db.dedupes[0].processedAt instanceof Date);
    }
  });

  it("keeps claimed send outcomes behind a newer human state", async () => {
    for (const [index, outcome] of ["SENT", "FAILED"].entries()) {
      const db = emptyPrisma();
      const input = payload(`921${index + 1}`);
      const [entered, release] = [deferred(), deferred()];
      const calls = { answer: 0, send: 0 };
      const job = run(
        input,
        productionGateway(db),
        calls,
        answeredRuntime(calls, true),
        blockedSend(calls, entered, release, outcome)
      );
      await entered.promise;
      assert.equal(aiIntent(db).content.dispatchPhase, "claimed");
      if (outcome === "FAILED") await closeCurrent(db, uuid(30 + index));
      else await takeControl(db);
      assert.equal(aiIntent(db).deliveryStatus, "QUEUED");
      release.resolve();
      const result = await job;

      assert.equal(result.runtimeBranch, outcome === "SENT" ? "answer" : "handoff");
      assert.deepEqual(calls, { answer: 1, send: 1 });
      assert.equal(aiIntent(db).deliveryStatus, outcome);
      assert.equal(
        db.conversations[0].status,
        outcome === "SENT" ? "HANDOFF" : "CLOSED"
      );
      assert.equal(db.conversations[0].unreadCount, 0);
      assert.equal(db.tickets.length, 1);
      assert.equal(db.tickets[0].lockedByUserId, outcome === "SENT" ? USER_A : null);
    }
  });

  it("recovers a generating crash without repeating LLM or send", async () => {
    const db = emptyPrisma();
    const input = payload("9301");
    const gateway = productionGateway(db);
    const calls = { answer: 0, send: 0 };
    await assert.rejects(
      () => run(input, crashAfterPrepare(gateway), calls, answeredRuntime(calls)),
      /synthetic crash/
    );
    await run(input, gateway, calls, answeredRuntime(calls));

    assert.deepEqual(calls, { answer: 0, send: 0 });
    assert.equal(db.tickets.length, 1);
    assert.equal(aiIntent(db).deliveryStatus, "CANCELLED");
    assert.equal(aiIntent(db).content.dispatchPhase, "cancelled");
    assert.ok(db.dedupes[0].processedAt instanceof Date);
  });

  it("persists a late SENT acknowledgement after claimed recovery", async () => {
    for (const [index, closed] of [false, true].entries()) {
      const db = emptyPrisma();
      const input = payload(`930${index + 2}`);
      const gateway = productionGateway(db);
      const calls = { answer: 0, send: 0 };
      const [entered, release] = [deferred(), deferred()];
      const job = run(
        input,
        gateway,
        calls,
        answeredRuntime(calls),
        blockedSend(calls, entered, release)
      );
      await entered.promise;
      if (closed) await closeCurrent(db, uuid(40 + index));
      await run(input, gateway, calls, answeredRuntime(calls));
      assert.equal(aiIntent(db).content.dispatchPhase, "uncertain");
      release.resolve();
      await job;

      assert.deepEqual(calls, { answer: 1, send: 1 });
      assert.equal(aiIntent(db).deliveryStatus, "SENT");
      assert.equal(aiIntent(db).content.dispatchPhase, "terminal");
      assert.equal(Boolean(aiIntent(db).content.deliveryUncertain), false);
      assert.equal(db.conversations[0].status, closed ? "CLOSED" : "PENDING_HANDOFF");
      assert.equal(db.conversations[0].unreadCount, closed ? 0 : 1);
      assert.equal(db.tickets.length, 1);
    }
  });

  it("reuses one automatic-handoff ticket when takeover follows", async () => {
    const db = emptyPrisma();
    const input = payload("9351");
    const calls = { answer: 0, send: 0 };
    await run(input, productionGateway(db), calls, {
      async answer() {
        calls.answer += 1;
        return {
          reasonCode: "requires_operator_review",
          status: "handoff_required",
          suppressOutbound: true
        };
      }
    });
    assert.equal(db.conversations[0].status, "PENDING_HANDOFF");
    assert.equal(db.tickets.length, 1);
    await takeControl(db);
    assert.equal(db.conversations[0].status, "HANDOFF");
    assert.equal(db.tickets.length, 1);
    assert.equal(db.tickets[0].lockedByUserId, USER_A);
  });

  it("keeps in-memory takeover cancellation equal to Prisma", async () => {
    const seed = createM11MemoryFenceSeed(CHANNEL_ID, ORG_ID, TENANT_A);
    const conversationId = seed.conversations[0].id;
    const repository = new repositoryModule.InMemoryConversationTicketRepository(seed);
    await repository.takeoverConversation(operatorContext(), {
      conversationId,
      reason: "memory parity"
    });
    const messages = await repository.listMessages(operatorContext(), conversationId);
    assert.deepEqual(
      messages.map((item) => item.deliveryStatus),
      ["cancelled", "queued", "queued"]
    );
  });

  it("terminalizes Telegram failed and ambiguous outcomes without retry", async () => {
    for (const [index, outcome] of ["throw", "QUEUED", "FAILED"].entries()) {
      const db = emptyPrisma();
      const input = payload(`940${index + 1}`);
      const gateway = productionGateway(db);
      const calls = { answer: 0, send: 0 };
      const sendPort = {
        async sendMessage(request) {
          calls.send += 1;
          if (outcome === "throw") throw new Error("synthetic ambiguity");
          return sent(request, outcome);
        }
      };
      const first = await run(input, gateway, calls, answeredRuntime(calls), sendPort);
      const retry = await run(input, gateway, calls, answeredRuntime(calls), sendPort);
      const uncertain = outcome !== "FAILED";

      assert.equal(first.runtimeBranch, "handoff", outcome);
      assert.equal(retry.status, "deduped", outcome);
      assert.deepEqual(calls, { answer: 1, send: 1 }, outcome);
      assert.equal(aiIntent(db).deliveryStatus, uncertain ? "QUEUED" : "FAILED");
      assert.equal(
        aiIntent(db).content.dispatchPhase,
        uncertain ? "uncertain" : "terminal"
      );
      assert.equal(Boolean(aiIntent(db).content.deliveryUncertain), uncertain);
      assert.equal(db.tickets.length, 1, outcome);
      assert.equal(db.conversations[0].status, "PENDING_HANDOFF", outcome);
      assert.ok(db.dedupes[0].processedAt instanceof Date, outcome);
    }
  });
});

const productionGateway = (db) =>
  new worker.persistence.PrismaTelegramBotConversationPersistenceGateway(db);

async function run(input, gateway, calls, answerRuntime, sendPort) {
  return worker.conversationRuntime.processTelegramBotConversationJob(
    input,
    gateway,
    runtimeOptions(
      input,
      answerRuntime ?? answeredRuntime(calls),
      sendPort ?? {
        async sendMessage(request) {
          calls.send += 1;
          return sent(request);
        }
      }
    )
  );
}

function runtimeOptions(input, answerRuntime, sendPort) {
  return {
    admissionPolicy: {
      allowedChatExternalRefs: new Set([input.chatExternalRef]),
      allowedParticipantExternalRefs: new Set([input.participantExternalRef])
    },
    answerRuntime,
    sendPort
  };
}

function answeredRuntime(calls, followUp = false) {
  return {
    async answer() {
      calls.answer += 1;
      return {
        answerText: "bounded answer",
        ...(followUp ? { followUp: { reasonCode: "kb_not_found" } } : {}),
        status: "answered"
      };
    }
  };
}

function blockedSend(calls, entered, release, outcome = "SENT") {
  return {
    async sendMessage(request) {
      calls.send += 1;
      entered.resolve();
      await release.promise;
      return sent(request, outcome);
    }
  };
}

function crashAfterPrepare(gateway) {
  return {
    claimPreparedAnswer: gateway.claimPreparedAnswer.bind(gateway),
    finalizePreparedAnswer: gateway.finalizePreparedAnswer.bind(gateway),
    handoffPreparedAnswer: gateway.handoffPreparedAnswer.bind(gateway),
    persistAcceptedUpdate: gateway.persistAcceptedUpdate.bind(gateway),
    prepareAcceptedUpdate: async (input) => {
      await gateway.prepareAcceptedUpdate(input);
      throw new Error("synthetic crash after prepare");
    }
  };
}

async function supportService(db) {
  const repository =
    await repositoryModule.createConversationTicketRepositoryProviderFromEnv({
      env: { UZMAX_CONVERSATION_TICKET_REPOSITORY_MODE: "rls_prisma_gateway" },
      prismaClient: db
    });
  return new serviceModule.ConversationTicketService(repository);
}

async function takeControl(db) {
  const support = await supportService(db);
  const input = { conversationId: db.conversations[0].id, reason: "operator takeover" };
  const takeover = await support.createHandoffTicket(operatorContext(), input);
  return { support, takeover };
}

async function closeCurrent(db, requestId) {
  const { support, takeover } = await takeControl(db);
  return support.applyTicketAction(operatorContext(), {
    destination: "controlled resolution",
    expectedLifecycleEventId: takeover.ticket.events.at(-1).id,
    requestId,
    result: "resolved",
    ticketId: takeover.ticket.id,
    type: "close"
  });
}

function emptyPrisma() {
  const db = fakePrisma();
  for (const key of "conversations customerIdentities customers dedupes events messages tickets".split(
    " "
  ))
    db[key].splice(0);
  return db;
}

function payload(providerUpdateId) {
  return worker.channels.createTelegramBotConversationJobPayload({
    channelConnectionId: CHANNEL_ID,
    enqueuedAt: "2026-07-10T00:00:00.000Z",
    orgId: ORG_ID,
    tenantId: TENANT_A,
    traceId: `trace:m11-04a:${providerUpdateId}`,
    update: {
      chatExternalRef: `telegram:chat:${providerUpdateId}`,
      chatType: "private",
      contentKind: "text",
      messageExternalRef: `telegram:message:${providerUpdateId}`,
      participantExternalRef: `telegram:user:${providerUpdateId}`,
      provider: "telegram_bot",
      providerUpdateId,
      text: "synthetic bounded request",
      updateKind: "message"
    }
  });
}

function conversationRow(input, status) {
  return {
    channelConnectionId: CHANNEL_ID,
    externalConversationRef: input.chatExternalRef,
    id: `51000000-0000-4000-8000-${input.providerUpdateId.padStart(12, "0")}`,
    lastMessageAt: new Date("2026-07-09T00:00:00.000Z"),
    orgId: ORG_ID,
    participantExternalRef: input.participantExternalRef,
    status,
    tenantId: TENANT_A,
    unreadCount: 0
  };
}

function ticketRow(id, status, assignedUserId, lockedByUserId) {
  return {
    assignedUserId: assignedUserId ?? null,
    id,
    lockedByUserId: lockedByUserId ?? null,
    orgId: ORG_ID,
    priority: 3,
    status,
    summary: "controlled existing ticket",
    tenantId: TENANT_A
  };
}

const operatorContext = () =>
  contextFor(TENANT_A, ["conversation:read", "ticket:write"]);

const aiIntent = (db) =>
  db.messages.find(
    (row) =>
      row.direction === "OUTBOUND" && row.content.runtimeOrigin === "telegram_bot_ai"
  );
