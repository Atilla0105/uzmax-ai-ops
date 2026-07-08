import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import ts from "typescript";

const repoRoot = process.cwd();

const channels = await importChannelsSource();
const telegramApi = await importTelegramApiSource(channels.moduleUrl);
const workerRuntime = await importWorkerConversationRuntime(channels.moduleUrl);
const appModule = read("apps/api/src/app.module.ts");
const spec = read("docs/specs/M6B-05a-conversation-runtime-build.md");

describe("M6B-05a conversation runtime", () => {
  it("creates stable Bot conversation job payloads and job ids without raw payloads", () => {
    const update = channels.module.normalizeTelegramBotUpdate({
      message: {
        chat: { id: 7001 },
        date: 1781654400,
        from: { id: 8001 },
        message_id: 9001,
        text: "hello from a synthetic smoke"
      },
      update_id: 5001
    });
    const payload = channels.module.createTelegramBotConversationJobPayload({
      channelConnectionId: "44444444-4444-4444-8444-444444444405",
      enqueuedAt: "2026-06-26T09:00:00.000Z",
      orgId: "11111111-1111-4111-8111-111111111405",
      tenantId: "22222222-2222-4222-8222-222222222405",
      traceId: "trace:m6b-05a",
      update
    });

    assert.equal(payload.providerUpdateId, "5001");
    assert.equal(
      channels.module.createTelegramBotConversationJobId(payload),
      "telegram-bot__11111111-1111-4111-8111-111111111405__22222222-2222-4222-8222-222222222405__44444444-4444-4444-8444-444444444405__5001"
    );
    assert.equal(
      channels.module.createTelegramBotConversationJobId(payload).includes(":"),
      false
    );
    assert.equal(JSON.stringify(payload).includes("raw"), false);
  });

  it("keeps API queue disabled by default and supports explicit BullMQ enqueue", async () => {
    const disabled = telegramApi.module.createTelegramBotIngressQueueProviderFromEnv({
      env: {}
    });
    await assert.rejects(
      () => disabled.enqueue({ contentKind: "text", provider: "telegram_bot" }),
      /queue is not configured/
    );

    const added = [];
    const queue = {
      add: async (...args) => {
        added.push(args);
        return { id: "job-1" };
      },
      name: "telegram-bot-conversation"
    };
    const bullmq = telegramApi.module.createTelegramBotIngressQueueProviderFromEnv({
      env: {
        UZMAX_REDIS_URL: "redis://127.0.0.1:6379",
        UZMAX_TELEGRAM_BOT_CHANNEL_CONNECTION_ID:
          "44444444-4444-4444-8444-444444444405",
        UZMAX_TELEGRAM_BOT_INGRESS_QUEUE_MODE: "bullmq",
        UZMAX_TELEGRAM_BOT_ORG_ID: "11111111-1111-4111-8111-111111111405",
        UZMAX_TELEGRAM_BOT_TENANT_ID: "22222222-2222-4222-8222-222222222405"
      },
      queue
    });
    const result = await bullmq.enqueue({
      chatExternalRef: "telegram:chat:7001",
      contentKind: "text",
      messageExternalRef: "telegram:message:9001",
      participantExternalRef: "telegram:user:8001",
      provider: "telegram_bot",
      providerUpdateId: "5001",
      text: "synthetic only",
      updateKind: "message"
    });

    assert.equal(result.status, "accepted");
    assert.equal(added.length, 1);
    assert.equal(
      added[0][0],
      channels.module.telegramBotConversationQueueDefaults.jobName
    );
    assert.equal(added[0][2].jobId.endsWith("__5001"), true);
    assert.equal(added[0][2].jobId.includes(":"), false);
  });

  it("worker processor turns one accepted Bot update into controlled persistence input", async () => {
    const calls = [];
    const gateway = {
      async persistAcceptedUpdate(input) {
        calls.push(input);
        return {
          conversationId: input.conversation.id,
          messageId: input.message.id,
          providerUpdateId: input.dedupe.providerUpdateId,
          status: calls.length === 1 ? "accepted" : "deduped",
          ticketId: input.ticket.id,
          traceId: input.ticketEvent.traceId
        };
      }
    };
    const payload = channels.module.createTelegramBotConversationJobPayload({
      channelConnectionId: "44444444-4444-4444-8444-444444444405",
      enqueuedAt: "2026-06-26T09:00:00.000Z",
      orgId: "11111111-1111-4111-8111-111111111405",
      tenantId: "22222222-2222-4222-8222-222222222405",
      traceId: "trace:m6b-05a",
      update: {
        chatExternalRef: "telegram:chat:7001",
        contentKind: "text",
        messageExternalRef: "telegram:message:9001",
        participantExternalRef: "telegram:user:8001",
        provider: "telegram_bot",
        providerUpdateId: "5001",
        text: "synthetic text must not be stored raw",
        updateKind: "message"
      }
    });

    const result = await workerRuntime.module.processTelegramBotConversationJob(
      payload,
      gateway
    );

    assert.equal(result.status, "accepted");
    assert.equal(calls.length, 1);
    assert.equal(calls[0].message.content.textLength, 37);
    assert.equal(
      JSON.stringify(calls[0].message.content).includes("synthetic text"),
      false
    );
    assert.equal(calls[0].ticket.summary.includes("telegram_bot_text"), true);
  });

  it("wires AppModule and documents the true DB/RLS smoke boundary", () => {
    assert.match(appModule, /createTelegramBotIngressQueueProviderFromEnv/);
    assert.match(appModule, /TELEGRAM_BOT_INGRESS_QUEUE/);
    assert.match(appModule, /@Headers\(\)/);
    assert.match(spec, /True DB\/RLS smoke/);
    assert.equal(
      existsSync("packages/db/scripts/run-m6b-conversation-runtime-true-db-smoke.mjs"),
      true
    );
  });
});

async function importChannelsSource() {
  const moduleUrl = transpileToTempModule("packages/channels/src/index.ts");
  return { module: await import(moduleUrl), moduleUrl };
}

async function importTelegramApiSource(channelsModuleUrl) {
  const source = read("apps/api/src/telegram-bot.ts")
    .replace("../../../packages/channels/src/index.ts", channelsModuleUrl)
    .replace('import { Queue, type QueueOptions } from "bullmq";', "")
    .replace(
      /new Queue\(telegramBotConversationQueueDefaults\.queueName,\s*\{[\s\S]*?\n\s*\}\),/,
      '(() => { throw new Error("queue option required in tests"); })(),'
    );
  const moduleUrl = moduleUrlFromSource(transpileSource(source));
  return { module: await import(moduleUrl), moduleUrl };
}

async function importWorkerConversationRuntime(channelsModuleUrl) {
  const handoffUrl = transpileToTempModule(
    "packages/capabilities/handoff/src/index.ts"
  );
  const ticketFollowUpUrl = moduleUrlFromSource(
    transpileSource(
      read("apps/worker/src/telegram-bot-ticket-follow-up.ts").replace(
        "../../../packages/capabilities/handoff/src/index.ts",
        handoffUrl
      )
    )
  );
  const dbUrl = transpileToTempModule("packages/db/src/index.ts");
  const source = read("apps/worker/src/conversation-runtime.ts")
    .replace("../../../packages/channels/src/index.ts", channelsModuleUrl)
    .replace("../../../packages/capabilities/handoff/src/index.ts", handoffUrl)
    .replace("../../../packages/db/src/index.ts", dbUrl)
    .replace("./telegram-bot-ticket-follow-up.ts", ticketFollowUpUrl)
    .replace('import { Worker, type Job, type QueueOptions } from "bullmq";', "");
  const moduleUrl = moduleUrlFromSource(transpileSource(source));
  return { module: await import(moduleUrl), moduleUrl };
}

function transpileToTempModule(relativePath) {
  return moduleUrlFromSource(transpileSource(read(relativePath)));
}

function transpileSource(sourceText) {
  return ts.transpileModule(sourceText, {
    compilerOptions: {
      emitDecoratorMetadata: false,
      experimentalDecorators: true,
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2023
    }
  }).outputText;
}

function moduleUrlFromSource(sourceText) {
  const encoded = Buffer.from(sourceText, "utf8").toString("base64");
  return `data:text/javascript;base64,${encoded}`;
}

function read(relativePath) {
  const absolutePath = path.join(repoRoot, relativePath);
  assert.equal(existsSync(absolutePath), true, `missing ${relativePath}`);
  return readFileSync(absolutePath, "utf8");
}
