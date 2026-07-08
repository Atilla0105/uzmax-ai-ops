import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { PrismaClient } from "@prisma/client";
import ts from "typescript";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "../../..");
const ORG_ID = "11111111-1111-4111-8111-111111111405";
const TENANT_A_ID = "22222222-2222-4222-8222-222222222405";
const TENANT_B_ID = "33333333-3333-4333-8333-333333333405";
const CHANNEL_CONNECTION_ID = "44444444-4444-4444-8444-444444444405";

const prisma = new PrismaClient({
  datasources: { db: { url: requireEnv("UZMAX_RLS_DATABASE_URL") } }
});

try {
  await cleanupSyntheticRows();
  await seedSyntheticTenant();

  const channels = await importChannelsSource();
  const worker = await importWorkerRuntime(channels.moduleUrl);
  const gateway = new worker.module.PrismaTelegramBotConversationPersistenceGateway(
    prisma
  );
  const payload = channels.module.createTelegramBotConversationJobPayload({
    channelConnectionId: CHANNEL_CONNECTION_ID,
    enqueuedAt: "2026-06-26T09:00:00.000Z",
    orgId: ORG_ID,
    tenantId: TENANT_A_ID,
    traceId: "trace:m6b-05a-true-db",
    update: channels.module.normalizeTelegramBotUpdate({
      message: {
        chat: { id: 7001 },
        date: 1781654400,
        from: { id: 8001 },
        message_id: 9001,
        text: "synthetic text must not be stored raw"
      },
      update_id: 5001
    })
  });

  const accepted = await worker.module.processTelegramBotConversationJob(
    payload,
    gateway
  );
  const duplicate = await worker.module.processTelegramBotConversationJob(
    { ...payload, traceId: "trace:m6b-05a-duplicate" },
    gateway
  );
  assert.equal(accepted.status, "accepted");
  assert.equal(duplicate.status, "deduped");

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

  await cleanupSyntheticRows();
  assert.equal(await syntheticResidueCount(), 0);
  console.log(
    "m6b-conversation-runtime-true-db-smoke: passed Bot update->worker->DB/RLS ticket readback, duplicate dedupe, tenant isolation and residue=0"
  );
} finally {
  await cleanupSyntheticRows().catch((error) => {
    console.error(
      `m6b-conversation-runtime-true-db-smoke: cleanup failed: ${error.message}`
    );
  });
  await prisma.$disconnect();
}

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

async function seedSyntheticTenant() {
  await prisma.org.create({
    data: {
      id: ORG_ID,
      name: "M6B-05a Synthetic Org",
      slug: "m6b-05a-synthetic-org"
    }
  });
  await prisma.tenant.createMany({
    data: [
      { id: TENANT_A_ID, name: "M6B-05a Tenant A", orgId: ORG_ID, slug: "a" },
      { id: TENANT_B_ID, name: "M6B-05a Tenant B", orgId: ORG_ID, slug: "b" }
    ]
  });
  await prisma.channelConnection.create({
    data: {
      capabilities: { botConversationRuntime: true },
      externalAccountRef: "controlled://telegram-bot/m6b-05a",
      id: CHANNEL_CONNECTION_ID,
      metadata: { synthetic_spec: "M6B-05a" },
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
      + (select count(*) from channel_connection where metadata->>'synthetic_spec' = 'M6B-05a')
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
            and content::text like '%synthetic text must not be stored raw%'
        )::int as "rawTextMatches"
    `
  ]);
  const row = results.at(-1)?.[0] ?? {};
  return {
    conversations: Number(row.conversations ?? -1),
    dedupes: Number(row.dedupes ?? -1),
    messages: Number(row.messages ?? -1),
    rawTextMatches: Number(row.rawTextMatches ?? -1),
    tickets: Number(row.tickets ?? -1)
  };
}

async function importChannelsSource() {
  const moduleUrl = compileTsModuleUrl(readRepoText("packages/channels/src/index.ts"));
  return { module: await import(moduleUrl), moduleUrl };
}

async function importWorkerRuntime(channelsModuleUrl) {
  const handoffUrl = compileTsModuleUrl(
    readRepoText("packages/capabilities/handoff/src/index.ts")
  );
  const ticketFollowUpUrl = compileTsModuleUrl(
    readRepoText("apps/worker/src/telegram-bot-ticket-follow-up.ts").replaceAll(
      "../../../packages/capabilities/handoff/src/index.ts",
      handoffUrl
    )
  );
  const dbUrl = compileTsModuleUrl(`
    export function createRlsTransactionContext(context) {
      return {
        roleSql: 'set local role "uzmax_app_runtime"',
        settings: [
          { key: "app.org_id", value: context.orgId },
          { key: "app.tenant_id", value: context.tenantId }
        ]
      };
    }
  `);
  const source = readRepoText("apps/worker/src/conversation-runtime.ts")
    .replaceAll("../../../packages/channels/src/index.ts", channelsModuleUrl)
    .replaceAll("../../../packages/capabilities/handoff/src/index.ts", handoffUrl)
    .replaceAll("../../../packages/db/src/index.ts", dbUrl)
    .replaceAll("./telegram-bot-ticket-follow-up.ts", ticketFollowUpUrl)
    .replace('import { Worker, type Job, type QueueOptions } from "bullmq";', "");
  const moduleUrl = compileTsModuleUrl(source);
  const persistenceSource = readRepoText(
    "apps/worker/src/telegram-bot-conversation-persistence.ts"
  ).replaceAll("../../../packages/db/src/index.ts", dbUrl);
  return {
    module: {
      ...(await import(moduleUrl)),
      ...(await import(compileTsModuleUrl(persistenceSource)))
    }
  };
}

function readRepoText(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function compileTsModuleUrl(sourceText) {
  const compiled = ts.transpileModule(sourceText, {
    compilerOptions: runtimeTsOptions()
  });
  return asJavaScriptDataUrl(compiled.outputText);
}

function runtimeTsOptions() {
  return {
    emitDecoratorMetadata: false,
    experimentalDecorators: true,
    module: ts.ModuleKind.ES2022,
    target: ts.ScriptTarget.ES2023
  };
}

function asJavaScriptDataUrl(sourceText) {
  const encoded = Buffer.from(sourceText, "utf8").toString("base64");
  return `data:text/javascript;base64,${encoded}`;
}
