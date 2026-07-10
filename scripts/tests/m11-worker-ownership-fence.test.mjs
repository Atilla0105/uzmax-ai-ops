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
      {
        status: "PENDING_HANDOFF",
        ticket: ticketRow("41000000-0000-4000-8000-000000000001", "OPEN")
      },
      {
        status: "HANDOFF",
        ticket: ticketRow(
          "41000000-0000-4000-8000-000000000002",
          "LOCKED",
          USER_A,
          USER_A
        )
      },
      { status: "CLOSED" }
    ];
    for (const [index, item] of cases.entries()) {
      const db = emptyPrisma();
      const input = payload(`91${index + 1}1`);
      const conversation = conversationRow(input, item.status);
      db.conversations.push(conversation);
      if (item.ticket) {
        db.tickets.push({ ...item.ticket, conversationId: conversation.id });
      }
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

  it("suppresses send when takeover commits during LLM and discards follow-up", async () => {
    for (const [index, decision] of ["answered", "handoff"].entries()) {
      const db = emptyPrisma();
      const input = payload(`920${index + 1}`);
      const answerEntered = deferred();
      const answerRelease = deferred();
      const calls = { answer: 0, send: 0 };
      const job = run(input, productionGateway(db), calls, {
        async answer() {
          calls.answer += 1;
          answerEntered.resolve();
          await answerRelease.promise;
          if (decision === "handoff")
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
      const conversationId = db.conversations[0].id;
      const support = await supportService(db);
      await support.createHandoffTicket(operatorContext(), {
        conversationId,
        reason: "operator takeover"
      });
      assert.equal(aiIntent(db).deliveryStatus, "CANCELLED");
      assert.equal((await run(input, productionGateway(db), calls)).status, "deduped");
      answerRelease.resolve();
      const result = await job;

      assert.equal(result.runtimeBranch, "handoff");
      assert.deepEqual(calls, { answer: 1, send: 0 });
      assert.equal(db.conversations[0].status, "HANDOFF");
      assert.equal(db.tickets.length, 1);
      assert.equal(db.tickets[0].lockedByUserId, USER_A);
      assert.equal(db.conversations[0].unreadCount, 1);
      assert.ok(db.dedupes[0].processedAt instanceof Date);
    }
  });

  it("allows one claimed send while later takeover remains authoritative", async () => {
    const db = emptyPrisma();
    const input = payload("9211");
    const sendEntered = deferred();
    const sendRelease = deferred();
    const calls = { answer: 0, send: 0 };
    const job = run(
      input,
      productionGateway(db),
      calls,
      answeredRuntime(calls, true),
      blockedSend(calls, sendEntered, sendRelease)
    );
    await sendEntered.promise;
    assert.equal(aiIntent(db).content.dispatchPhase, "claimed");
    const support = await supportService(db);
    await support.createHandoffTicket(operatorContext(), {
      conversationId: db.conversations[0].id,
      reason: "claim-first takeover"
    });
    assert.equal(aiIntent(db).deliveryStatus, "QUEUED");
    sendRelease.resolve();
    const result = await job;

    assert.equal(result.runtimeBranch, "answer");
    assert.deepEqual(calls, { answer: 1, send: 1 });
    assert.equal(aiIntent(db).deliveryStatus, "SENT");
    assert.equal(db.conversations[0].status, "HANDOFF");
    assert.equal(db.tickets.length, 1);
    assert.equal(db.tickets[0].lockedByUserId, USER_A);
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
    const db = emptyPrisma();
    const input = payload("9302");
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
    await run(input, gateway, calls, answeredRuntime(calls));
    assert.equal(aiIntent(db).content.dispatchPhase, "uncertain");
    release.resolve();
    await job;

    assert.deepEqual(calls, { answer: 1, send: 1 });
    assert.equal(aiIntent(db).deliveryStatus, "SENT");
    assert.equal(aiIntent(db).content.dispatchPhase, "terminal");
    assert.equal(Boolean(aiIntent(db).content.deliveryUncertain), false);
    assert.equal(db.conversations[0].unreadCount, 1);
    assert.equal(db.tickets.length, 1);
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
    const support = await supportService(db);
    await support.createHandoffTicket(operatorContext(), {
      conversationId: db.conversations[0].id,
      reason: "operator accepts handoff"
    });
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

function productionGateway(db) {
  return new worker.persistence.PrismaTelegramBotConversationPersistenceGateway(db);
}

async function run(input, gateway, calls, answerRuntime, sendPort) {
  return worker.conversationRuntime.processTelegramBotConversationJob(
    input,
    gateway,
    runtimeOptions(
      input,
      answerRuntime ?? {
        async answer() {
          calls.answer += 1;
          return { answerText: "bounded answer", status: "answered" };
        }
      },
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

function blockedSend(calls, entered, release) {
  return {
    async sendMessage(request) {
      calls.send += 1;
      entered.resolve();
      await release.promise;
      return sent(request);
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

function operatorContext() {
  return contextFor(TENANT_A, ["conversation:read", "ticket:write"]);
}

function aiIntent(db) {
  return db.messages.find(
    (row) =>
      row.direction === "OUTBOUND" && row.content.runtimeOrigin === "telegram_bot_ai"
  );
}
