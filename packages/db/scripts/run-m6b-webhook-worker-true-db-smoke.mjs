import assert from "node:assert/strict";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath, pathToFileURL } from "node:url";

import { Queue } from "bullmq";
import { PrismaClient } from "@prisma/client";
import ts from "typescript";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "../../..");
const tempDir = path.join(repoRoot, ".tmp", `m6b-06b-${process.pid}`);
const ORG_ID = "11111111-1111-4111-8111-111111111606";
const TENANT_A_ID = "22222222-2222-4222-8222-222222222606";
const TENANT_B_ID = "33333333-3333-4333-8333-333333333606";
const CHANNEL_CONNECTION_ID = "44444444-4444-4444-8444-444444444606";
const SECRET = "controlled-m6b-06b-secret";

const redisUrl = requireEnv("UZMAX_REDIS_URL");
const prisma = new PrismaClient({
  datasources: { db: { url: requireEnv("UZMAX_RLS_DATABASE_URL") } }
});
const queue = new Queue("telegram-bot-conversation", {
  connection: { maxRetriesPerRequest: null, url: redisUrl }
});
const logs = [];
let service;

try {
  await cleanupSyntheticRows();
  await queue.obliterate({ force: true }).catch(() => undefined);
  await seedSyntheticTenant();

  const runtime = await compileRuntimeModules();
  service = await runtime.worker.startWorkerServiceShell({
    env: {
      UZMAX_REDIS_URL: redisUrl,
      UZMAX_RLS_DATABASE_URL: requireEnv("UZMAX_RLS_DATABASE_URL"),
      UZMAX_WORKER_QUEUES: "telegram-bot-conversation",
      UZMAX_WORKER_TELEGRAM_BOT_PERSISTENCE_MODE: "rls_prisma_gateway"
    },
    log(entry) {
      logs.push(entry);
    }
  });

  const queueProvider = runtime.api.createTelegramBotIngressQueueProviderFromEnv({
    env: telegramEnv(),
    queue
  });
  const webhook = runtime.api.createTelegramBotWebhookServiceFromEnv(
    queueProvider,
    telegramEnv()
  );
  const accepted = await webhook.handleWebhook({
    body: syntheticTelegramUpdate(),
    headers: { [runtime.api.TELEGRAM_BOT_SECRET_HEADER]: SECRET }
  });
  assert.equal(accepted.ok, true);
  assert.equal(accepted.status, "accepted");

  await waitForCompletedJob();
  await waitForLog("worker.telegram_bot.completed");

  const tenantA = await countVisibleRows(TENANT_A_ID);
  const tenantB = await countVisibleRows(TENANT_B_ID);
  assert.deepEqual(tenantA, {
    conversations: 1,
    dedupes: 1,
    messages: 1,
    rawTextMatches: 0,
    tickets: 1
  });
  assert.deepEqual(tenantB, {
    conversations: 0,
    dedupes: 0,
    messages: 0,
    rawTextMatches: 0,
    tickets: 0
  });

  await service.close("true-db-smoke");
  service = undefined;
  await cleanupSyntheticRows();
  assert.equal(await syntheticResidueCount(), 0);

  console.log(
    "m6b-webhook-worker-true-db-smoke: passed synthetic webhook->BullMQ Redis->worker service shell->DB/RLS ticket readback, tenant isolation and residue=0"
  );
} finally {
  await service?.close("true-db-smoke-cleanup").catch(() => undefined);
  await queue.obliterate({ force: true }).catch(() => undefined);
  await queue.close().catch(() => undefined);
  await cleanupSyntheticRows().catch((error) => {
    console.error(`m6b-webhook-worker-true-db-smoke: cleanup failed: ${error.message}`);
  });
  await prisma.$disconnect();
  await rm(tempDir, { force: true, recursive: true }).catch(() => undefined);
}

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function telegramEnv() {
  return {
    TELEGRAM_BOT_WEBHOOK_SECRET: SECRET,
    UZMAX_REDIS_URL: redisUrl,
    UZMAX_TELEGRAM_BOT_CHANNEL_CONNECTION_ID: CHANNEL_CONNECTION_ID,
    UZMAX_TELEGRAM_BOT_INGRESS_QUEUE_MODE: "bullmq",
    UZMAX_TELEGRAM_BOT_ORG_ID: ORG_ID,
    UZMAX_TELEGRAM_BOT_TENANT_ID: TENANT_A_ID
  };
}

function syntheticTelegramUpdate() {
  return {
    message: {
      chat: { id: 7606 },
      date: 1782475200,
      from: { id: 8606 },
      message_id: 9606,
      text: "synthetic webhook text must not be stored raw"
    },
    update_id: 5606
  };
}

async function seedSyntheticTenant() {
  await prisma.org.create({
    data: {
      id: ORG_ID,
      name: "M6B-06b Synthetic Org",
      slug: "m6b-06b-synthetic-org"
    }
  });
  await prisma.tenant.createMany({
    data: [
      { id: TENANT_A_ID, name: "M6B-06b Tenant A", orgId: ORG_ID, slug: "a" },
      { id: TENANT_B_ID, name: "M6B-06b Tenant B", orgId: ORG_ID, slug: "b" }
    ]
  });
  await prisma.channelConnection.create({
    data: {
      capabilities: { botConversationRuntime: true },
      externalAccountRef: "controlled://telegram-bot/m6b-06b",
      id: CHANNEL_CONNECTION_ID,
      metadata: { synthetic_spec: "M6B-06b" },
      orgId: ORG_ID,
      provider: "telegram_bot",
      tenantId: TENANT_A_ID
    }
  });
}

async function cleanupSyntheticRows() {
  await prisma.org.deleteMany({ where: { id: ORG_ID } });
}

async function syntheticResidueCount() {
  const rows = await prisma.$queryRaw`
    select (
      (select count(*) from org where id::text = ${ORG_ID})
      + (select count(*) from channel_connection where metadata->>'synthetic_spec' = 'M6B-06b')
    )::int as residue
  `;
  return Number(rows[0]?.residue ?? -1);
}

async function countVisibleRows(tenantId) {
  const results = await prisma.$transaction([
    prisma.$executeRawUnsafe('set local role "uzmax_app_runtime"'),
    prisma.$queryRaw`select set_config('app.org_id', ${ORG_ID}, true)`,
    prisma.$queryRaw`select set_config('app.tenant_id', ${tenantId}, true)`,
    prisma.$queryRaw`
      select
        (select count(*) from conversation where org_id::text = ${ORG_ID})::int as conversations,
        (select count(*) from message where org_id::text = ${ORG_ID})::int as messages,
        (select count(*) from ticket where org_id::text = ${ORG_ID})::int as tickets,
        (select count(*) from telegram_update_dedupe where org_id::text = ${ORG_ID})::int as dedupes,
        (
          select count(*)
          from message
          where org_id::text = ${ORG_ID}
            and content::text like '%synthetic webhook text must not be stored raw%'
        )::int as "rawTextMatches"
    `
  ]);
  const row = results.at(-1)?.[0] ?? {};
  return Object.fromEntries(
    ["conversations", "dedupes", "messages", "rawTextMatches", "tickets"].map((key) => [
      key,
      Number(row[key] ?? -1)
    ])
  );
}

async function waitForCompletedJob() {
  let counts;
  for (let remaining = 150; remaining > 0; remaining -= 1) {
    counts = await queue.getJobCounts("waiting", "active", "completed", "failed");
    if (counts.completed === 1 && counts.waiting === 0 && counts.active === 0) {
      return;
    }
    if (counts.failed > 0) {
      const failed = await queue.getFailed(0, 0);
      throw new Error(`webhook worker job failed: ${failed[0]?.failedReason}`);
    }
    await delay(100);
  }
  throw new Error(`queue did not complete one job: ${JSON.stringify(counts)}`);
}

async function waitForLog(event) {
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    const entry = logs.find((candidate) => candidate.event === event);
    if (entry) return entry;
    await delay(100);
  }
  throw new Error(`timed out waiting for ${event}: ${JSON.stringify(logs)}`);
}

async function compileRuntimeModules() {
  await mkdir(tempDir, { recursive: true });
  await writeModule("channels.mjs", readRepoText("packages/channels/src/index.ts"));
  await writeModule(
    "handoff.mjs",
    readRepoText("packages/capabilities/handoff/src/index.ts")
  );
  await writeFile(
    path.join(tempDir, "db.mjs"),
    `
      export function createRlsTransactionContext(context) {
        return {
          roleSql: 'set local role "uzmax_app_runtime"',
          settings: [
            { key: "app.org_id", value: context.orgId },
            { key: "app.tenant_id", value: context.tenantId }
          ]
        };
      }
    `
  );
  await writeModule(
    "conversation-runtime.mjs",
    readRepoText("apps/worker/src/conversation-runtime.ts")
      .replaceAll("../../../packages/channels/src/index.ts", "./channels.mjs")
      .replaceAll(
        "../../../packages/capabilities/handoff/src/index.ts",
        "./handoff.mjs"
      )
      .replaceAll("../../../packages/db/src/index.ts", "./db.mjs")
  );
  await writeModule(
    "bot-persistence.mjs",
    readRepoText("apps/worker/src/telegram-bot-conversation-persistence.ts").replaceAll(
      "../../../packages/db/src/index.ts",
      "./db.mjs"
    )
  );
  await writeModule(
    "bot-answer-runtime.mjs",
    readRepoText("apps/worker/src/telegram-bot-answer-runtime.ts")
  );
  await writeFile(
    path.join(tempDir, "order-import-bullmq-runtime.mjs"),
    `
      export const orderImportBullmqQueueDefaults = { queueName: "unused-order-import" };
      export function createOrderImportCsvTextBullmqWorker() {
        throw new Error("order import worker is outside M6B-06b smoke scope");
      }
    `
  );
  await writeFile(
    path.join(tempDir, "main.mjs"),
    `
      export function runOrderImportCsvTextPersistenceJob() {
        throw new Error("order import job is outside M6B-06b smoke scope");
      }
    `
  );
  await writeModule(
    "worker-service-shell.mjs",
    readRepoText("apps/worker/src/worker-service-shell.ts")
      .replaceAll(
        "./order-import-bullmq-runtime.ts",
        "./order-import-bullmq-runtime.mjs"
      )
      .replaceAll("./conversation-runtime.ts", "./conversation-runtime.mjs")
      .replaceAll("./telegram-bot-answer-runtime.ts", "./bot-answer-runtime.mjs")
      .replaceAll("./telegram-bot-conversation-persistence.ts", "./bot-persistence.mjs")
      .replaceAll("./main.ts", "./main.mjs")
      .replaceAll("../../../packages/channels/src/index.ts", "./channels.mjs")
  );
  await writeModule(
    "telegram-bot.mjs",
    readRepoText("apps/api/src/telegram-bot.ts").replaceAll(
      "../../../packages/channels/src/index.ts",
      "./channels.mjs"
    )
  );

  return {
    api: await import(pathToFileURL(path.join(tempDir, "telegram-bot.mjs")).href),
    worker: await import(
      pathToFileURL(path.join(tempDir, "worker-service-shell.mjs")).href
    )
  };
}

async function writeModule(fileName, sourceText) {
  const compiled = ts.transpileModule(sourceText, {
    compilerOptions: {
      emitDecoratorMetadata: false,
      experimentalDecorators: true,
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2023
    }
  });
  await writeFile(path.join(tempDir, fileName), compiled.outputText);
}

function readRepoText(relativePath) {
  return Buffer.from(
    ts.sys.readFile(path.join(repoRoot, relativePath)) ?? "",
    "utf8"
  ).toString();
}
