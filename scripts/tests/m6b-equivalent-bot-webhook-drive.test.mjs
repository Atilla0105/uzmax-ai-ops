import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import ts from "typescript";

const repoRoot = process.cwd();
const channels = await importChannelsSource();
const workerRuntime = await importWorkerConversationRuntime(
  channels.moduleUrl,
  channels.inboundModuleUrl
);
const telegramApi = await importTelegramApiSource(
  channels.moduleUrl,
  channels.inboundModuleUrl
);
const spec = read("docs/specs/M6B-05b-equivalent-bot-webhook-drive.md");

describe("M6B-05b equivalent Bot webhook drive", () => {
  it("drives synthetic webhook-equivalent input through BullMQ queue payload and worker dedupe contract", async () => {
    const queued = [];
    const queue = {
      add: async (...args) => {
        queued.push(args);
        return { id: args[2].jobId };
      },
      name: channels.module.telegramBotConversationQueueDefaults.queueName
    };
    const ingressQueue =
      telegramApi.module.createTelegramBotIngressQueueProviderFromEnv({
        env: {
          UZMAX_REDIS_URL: "redis://127.0.0.1:6379",
          UZMAX_TELEGRAM_BOT_ALLOWED_CHAT_REFS: "telegram:chat:7606",
          UZMAX_TELEGRAM_BOT_ALLOWED_PARTICIPANT_REFS: "telegram:user:8606",
          UZMAX_TELEGRAM_BOT_CHANNEL_CONNECTION_ID:
            "44444444-4444-4444-8444-444444444506",
          UZMAX_TELEGRAM_BOT_INGRESS_QUEUE_MODE: "bullmq",
          UZMAX_TELEGRAM_BOT_ORG_ID: "11111111-1111-4111-8111-111111111506",
          UZMAX_TELEGRAM_BOT_TENANT_ID: "22222222-2222-4222-8222-222222222506"
        },
        queue
      });
    const core = new telegramApi.module.TelegramBotWebhookCore({
      queue: ingressQueue,
      secretToken: "synthetic-m6b-05b-secret"
    });
    const webhookInput = {
      body: syntheticWebhookBody(),
      headers: {
        "x-telegram-bot-api-secret-token": "synthetic-m6b-05b-secret"
      }
    };

    const firstWebhook = await core.handleWebhook(webhookInput);
    const duplicateWebhook = await core.handleWebhook(webhookInput);

    assert.equal(firstWebhook.status, "accepted");
    assert.equal(duplicateWebhook.status, "accepted");
    assert.equal(queued.length, 2);
    assert.equal(
      queued[0][0],
      channels.module.telegramBotConversationQueueDefaults.jobName
    );
    assert.equal(queued[0][2].jobId, queued[1][2].jobId);
    assert.equal(queued[0][2].jobId.includes(":"), false);
    assert.equal(queued[0][1].providerUpdateId, "6506");
    assert.equal(queued[0][1].text, "synthetic text must not be stored raw");

    const gateway = fakePersistenceGateway();
    const firstResult = await workerRuntime.module.processTelegramBotConversationJob(
      queued[0][1],
      gateway,
      admissionPolicy()
    );
    const duplicateResult =
      await workerRuntime.module.processTelegramBotConversationJob(
        queued[1][1],
        gateway,
        admissionPolicy()
      );

    assert.equal(firstResult.status, "accepted");
    assert.equal(duplicateResult.status, "deduped");
    assert.equal(
      gateway.visibleRowsFor("22222222-2222-4222-8222-222222222506").tickets,
      1
    );
    assert.equal(
      gateway.visibleRowsFor("33333333-3333-4333-8333-333333333506").tickets,
      0
    );
    assert.equal(gateway.readableTextStored, true);
  });

  it("keeps the slice narrow and records true DB/RLS as a separate evidence boundary", () => {
    assert.match(spec, /Spec ID: M6B-05b/);
    assert.match(spec, /createTelegramBotIngressQueueProviderFromEnv/);
    assert.match(spec, /processTelegramBotConversationJob/);
    assert.match(spec, /No real Telegram webhook\/setWebhook/);
    assert.match(spec, /does not claim a local true DB\/RLS webhook-driven pass/);
    assert.equal(
      existsSync("packages/db/scripts/run-m6b-conversation-runtime-true-db-smoke.mjs"),
      true
    );
  });
});

function fakePersistenceGateway() {
  const seen = new Set();
  const rowsByTenant = new Map();
  return {
    readableTextStored: false,
    async persistAcceptedUpdate(input) {
      if (seen.has(input.dedupe.providerUpdateId)) {
        return {
          providerUpdateId: input.dedupe.providerUpdateId,
          status: "deduped",
          traceId: input.ticketEvent.traceId
        };
      }
      seen.add(input.dedupe.providerUpdateId);
      const tenantRows = rowsByTenant.get(input.dedupe.tenantId) ?? {
        conversations: 0,
        dedupes: 0,
        messages: 0,
        tickets: 0
      };
      tenantRows.conversations += 1;
      tenantRows.dedupes += 1;
      tenantRows.messages += 1;
      tenantRows.tickets += 1;
      rowsByTenant.set(input.dedupe.tenantId, tenantRows);
      this.readableTextStored =
        JSON.stringify(input.message.content).includes(
          "synthetic text must not be stored raw"
        ) || this.readableTextStored;
      return {
        conversationId: input.conversation.id,
        messageId: input.message.id,
        providerUpdateId: input.dedupe.providerUpdateId,
        status: "accepted",
        ticketId: input.ticket.id,
        traceId: input.ticketEvent.traceId
      };
    },
    visibleRowsFor(tenantId) {
      return (
        rowsByTenant.get(tenantId) ?? {
          conversations: 0,
          dedupes: 0,
          messages: 0,
          tickets: 0
        }
      );
    }
  };
}

function syntheticWebhookBody() {
  return {
    message: {
      chat: { id: 7606, type: "private" },
      date: 1781654400,
      from: { id: 8606 },
      message_id: 9606,
      text: "synthetic text must not be stored raw"
    },
    update_id: 6506
  };
}

async function importChannelsSource() {
  const inbound = await loadModuleFromRepo(
    "packages/channels/src/telegram-bot-inbound-contract.ts"
  );
  const channelsModule = await loadModuleFromRepo("packages/channels/src/index.ts", [
    ["./telegram-bot-inbound-contract.ts", inbound.moduleUrl]
  ]);
  return { ...channelsModule, inboundModuleUrl: inbound.moduleUrl };
}

async function importTelegramApiSource(channelsModuleUrl, inboundModuleUrl) {
  return loadModuleFromRepo("apps/api/src/telegram-bot.ts", [
    ["../../../packages/channels/src/index.ts", channelsModuleUrl],
    [
      "../../../packages/channels/src/telegram-bot-inbound-contract.ts",
      inboundModuleUrl
    ]
  ]);
}

async function importWorkerConversationRuntime(channelsModuleUrl, inboundModuleUrl) {
  const handoffModule = await loadModuleFromRepo(
    "packages/capabilities/handoff/src/index.ts"
  );
  const ticketFollowUpModule = await loadModuleFromRepo(
    "apps/worker/src/telegram-bot-ticket-follow-up.ts",
    [["../../../packages/capabilities/handoff/src/index.ts", handoffModule.moduleUrl]]
  );
  return loadModuleFromRepo("apps/worker/src/conversation-runtime.ts", [
    ["../../../packages/channels/src/index.ts", channelsModuleUrl],
    [
      "../../../packages/channels/src/telegram-bot-inbound-contract.ts",
      inboundModuleUrl
    ],
    ["../../../packages/capabilities/handoff/src/index.ts", handoffModule.moduleUrl],
    ["./telegram-bot-ticket-follow-up.ts", ticketFollowUpModule.moduleUrl],
    [
      "../../../packages/db/src/index.ts",
      (await loadModuleFromRepo("packages/db/src/index.ts")).moduleUrl
    ],
    ['import { Worker, type Job, type QueueOptions } from "bullmq";', ""]
  ]);
}

function admissionPolicy() {
  return {
    admissionPolicy: {
      allowedChatExternalRefs: new Set(["telegram:chat:7606"]),
      allowedParticipantExternalRefs: new Set(["telegram:user:8606"])
    }
  };
}

async function loadModuleFromRepo(relativePath, replacements = []) {
  const source = replacements.reduce(
    (current, [pattern, replacement]) => current.replaceAll(pattern, replacement),
    read(relativePath)
  );
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      emitDecoratorMetadata: false,
      experimentalDecorators: true,
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2023
    }
  }).outputText;
  const moduleUrl = `data:text/javascript;base64,${Buffer.from(
    compiled,
    "utf8"
  ).toString("base64")}`;
  return { module: await import(moduleUrl), moduleUrl };
}

function read(relativePath) {
  const absolutePath = path.join(repoRoot, relativePath);
  assert.equal(existsSync(absolutePath), true, `missing ${relativePath}`);
  return readFileSync(absolutePath, "utf8");
}
