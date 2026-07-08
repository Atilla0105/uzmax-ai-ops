import assert from "node:assert/strict";
import { rm } from "node:fs/promises";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath, pathToFileURL } from "node:url";

import { Queue } from "bullmq";
import { PrismaClient } from "@prisma/client";

import { compileApiRuntime } from "../../../../apps/api/scripts/runtime-compiler.mjs";
import { compileM8ActiveAnswerRuntimeModules } from "./m8-active-answer-worker-smoke-support.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "../../../..");
const tempDir = path.join(repoRoot, ".tmp", `m8-03-${process.pid}`);
const ORG_ID = "11111111-1111-4111-8111-111111111803";
const TENANT_A_ID = "22222222-2222-4222-8222-222222222803";
const TENANT_B_ID = "33333333-3333-4333-8333-333333333803";
const CHANNEL_CONNECTION_ID = "44444444-4444-4444-8444-444444444803";
const MEMBER_ID = "55555555-5555-4555-8555-555555555803";
const VERSION_ID = "66666666-6666-4666-8666-666666666803";
const GATE_ID = "77777777-7777-4777-8777-777777777803";
const KB_ID = "88888888-8888-4888-8888-888888888803";
const STAGE_ID = "99999999-9999-4999-8999-999999999803";
const USER_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaa803";
const SECRET = "controlled-m8-03-secret";

const redisUrl = requireEnv("UZMAX_REDIS_URL");
const rlsDatabaseUrl = requireEnv("UZMAX_RLS_DATABASE_URL");
const prisma = new PrismaClient({ datasources: { db: { url: rlsDatabaseUrl } } });
const queue = new Queue("telegram-bot-conversation", {
  connection: { maxRetriesPerRequest: null, url: redisUrl }
});
const logs = [];
let service;

try {
  await resetSyntheticState();
  const runtime = await compileM8ActiveAnswerRuntimeModules({ repoRoot, tempDir });
  service = await startAnswerWorker(runtime);
  const webhook = createWebhookService(runtime);

  await acceptWebhook(webhook, syntheticTelegramUpdate(5607, 9607, 7803, "setup help"));
  await acceptWebhook(webhook, syntheticTelegramUpdate(5608, 9608, 7804, "unknown"));
  await waitForCompletedJobs(2);
  await waitForDryRunOutboundLog();

  assert.deepEqual(await countVisibleRows(TENANT_A_ID), {
    conversations: 2,
    dedupes: 2,
    messages: 4,
    outboundMessages: 2,
    rawTextMatches: 0,
    tickets: 1
  });
  assert.deepEqual(await countVisibleRows(TENANT_B_ID), {
    conversations: 0,
    dedupes: 0,
    messages: 0,
    outboundMessages: 0,
    rawTextMatches: 0,
    tickets: 0
  });
  await assertApiReadback();

  await service.close("true-db-smoke");
  service = undefined;
  await cleanupSyntheticRows();
  assert.equal(await syntheticResidueCount(), 0);
  console.log(
    "m8-active-answer-worker-true-db-smoke: passed webhook->Redis->worker active KB answer dry-run outbound, KB miss ticket, API readback, tenant isolation and residue=0"
  );
} finally {
  await cleanupRuntimeResources();
}

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

async function resetSyntheticState() {
  await cleanupSyntheticRows();
  await queue.obliterate({ force: true }).catch(() => undefined);
  await seedSyntheticTenant();
}

async function startAnswerWorker(runtime) {
  return runtime.worker.startWorkerServiceShell({
    env: workerEnv(),
    log(entry) {
      logs.push(entry);
    }
  });
}

function createWebhookService(runtime) {
  const env = telegramEnv();
  const queueProvider = runtime.api.createTelegramBotIngressQueueProviderFromEnv({
    env,
    queue
  });
  return runtime.api.createTelegramBotWebhookServiceFromEnv(queueProvider, env);
}

async function cleanupRuntimeResources() {
  await service?.close("true-db-smoke-cleanup").catch(() => undefined);
  await queue.obliterate({ force: true }).catch(() => undefined);
  await queue.close().catch(() => undefined);
  await cleanupSyntheticRows().catch(logCleanupFailure);
  await prisma.$disconnect();
  await rm(tempDir, { force: true, recursive: true }).catch(() => undefined);
}

function logCleanupFailure(error) {
  console.error(
    `m8-active-answer-worker-true-db-smoke: cleanup failed: ${error.message}`
  );
}

function workerEnv() {
  return {
    UZMAX_REDIS_URL: redisUrl,
    UZMAX_RLS_DATABASE_URL: rlsDatabaseUrl,
    UZMAX_WORKER_QUEUES: "telegram-bot-conversation",
    UZMAX_WORKER_TELEGRAM_BOT_AI_MEMBER_KEY: "support_bot",
    UZMAX_WORKER_TELEGRAM_BOT_ANSWER_MODE: "dry_run",
    UZMAX_WORKER_TELEGRAM_BOT_KB_ENTRY_KEY: "setup",
    UZMAX_WORKER_TELEGRAM_BOT_LOCALE: "en",
    UZMAX_WORKER_TELEGRAM_BOT_PERSISTENCE_MODE: "rls_prisma_gateway"
  };
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

function syntheticTelegramUpdate(updateId, messageId, chatId, text) {
  return {
    message: {
      chat: { id: chatId },
      date: 1782475200,
      from: { id: 8603 },
      message_id: messageId,
      text
    },
    update_id: updateId
  };
}

async function acceptWebhook(webhook, body) {
  const accepted = await webhook.handleWebhook({
    body,
    headers: { [webhookSecretHeader()]: SECRET }
  });
  assert.equal(accepted.ok, true);
  assert.equal(accepted.status, "accepted");
}

function webhookSecretHeader() {
  return "x-telegram-bot-api-secret-token";
}

async function seedSyntheticTenant() {
  await prisma.org.create({
    data: { id: ORG_ID, name: "M8-03 Synthetic Org", slug: "m8-03-synthetic-org" }
  });
  await prisma.tenant.createMany({
    data: [
      { id: TENANT_A_ID, name: "M8-03 Tenant A", orgId: ORG_ID, slug: "a" },
      { id: TENANT_B_ID, name: "M8-03 Tenant B", orgId: ORG_ID, slug: "b" }
    ]
  });
  await prisma.channelConnection.create({
    data: {
      capabilities: { activeAnswerRuntime: true },
      externalAccountRef: "controlled://telegram-bot/m8-03",
      id: CHANNEL_CONNECTION_ID,
      metadata: { synthetic_spec: "M8-03" },
      orgId: ORG_ID,
      provider: "telegram_bot",
      tenantId: TENANT_A_ID
    }
  });
  await seedAiMemberAndKnowledge();
}

async function seedAiMemberAndKnowledge() {
  await prisma.evalGate.create({
    data: {
      categoryQuotas: {},
      gateKey: "m8_03_support_bot",
      id: GATE_ID,
      orgId: ORG_ID,
      passedAt: new Date("2026-07-07T10:00:00.000Z"),
      status: "PASSED",
      targetKind: "ai_member_version",
      targetRef: `controlled://ai-member-version/${VERSION_ID}`,
      tenantId: TENANT_A_ID
    }
  });
  await prisma.aiMember.create({
    data: {
      displayName: "Support Bot",
      id: MEMBER_ID,
      memberKey: "support_bot",
      metadata: { synthetic_spec: "M8-03" },
      orgId: ORG_ID,
      status: "ONLINE",
      tenantId: TENANT_A_ID
    }
  });
  await prisma.aiMemberVersion.create({
    data: {
      activatedAt: new Date("2026-07-07T10:00:00.000Z"),
      aiMemberId: MEMBER_ID,
      createdByUserId: USER_ID,
      evalGateId: GATE_ID,
      id: VERSION_ID,
      metadata: { synthetic_spec: "M8-03" },
      orgId: ORG_ID,
      personaRef: "manifest://ai-member/support-bot/persona",
      status: "ACTIVE",
      tenantId: TENANT_A_ID,
      version: 1
    }
  });
  await prisma.aiMember.update({
    data: { activeVersionId: VERSION_ID },
    where: { id: MEMBER_ID }
  });
  await prisma.aiCapabilityToggle.create({
    data: {
      aiMemberId: MEMBER_ID,
      capabilityKey: "TUTORIAL",
      enabled: true,
      id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbb803",
      metadata: { synthetic_spec: "M8-03" },
      orgId: ORG_ID,
      tenantId: TENANT_A_ID,
      updatedByUserId: USER_ID
    }
  });
  await seedKnowledge();
}

async function seedKnowledge() {
  await prisma.kbRecord.create({
    data: {
      category: "tutorial",
      contentHash: `sha256:${"1".repeat(64)}`,
      entryKey: "setup",
      id: KB_ID,
      metadata: { defaultLocale: "en", journeyKey: "internal_setup" },
      orgId: ORG_ID,
      sourceRef: "controlled://kb/source/m8-03",
      status: "ACTIVE",
      tenantId: TENANT_A_ID,
      title: "Internal setup",
      version: 1
    }
  });
  await prisma.kbStage.create({
    data: {
      id: STAGE_ID,
      kbEntryId: KB_ID,
      materialRefs: {
        answer: "Use active KB answer.",
        materialRefs: [{ kind: "guide", ref: "controlled://kb/material/setup" }],
        steps: ["Open runtime setup.", "Follow the bounded checklist."],
        triggers: ["setup help", "setup"]
      },
      orgId: ORG_ID,
      sequence: 1,
      stageKey: "setup",
      status: "ACTIVE",
      tenantId: TENANT_A_ID,
      title: "Setup"
    }
  });
}

async function cleanupSyntheticRows() {
  await detachSyntheticActiveVersion();
  for (const model of [
    "aiCapabilityToggle",
    "aiMemberVersion",
    "aiMember",
    "evalGate",
    "kbStage",
    "kbRecord"
  ]) {
    await prisma[model].deleteMany({ where: { orgId: ORG_ID } });
  }
  await prisma.org.deleteMany({ where: { id: ORG_ID } });
}

async function detachSyntheticActiveVersion() {
  await prisma.aiMember.updateMany({
    data: { activeVersionId: null },
    where: { orgId: ORG_ID }
  });
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
        (select count(*) from message where org_id::text = ${ORG_ID} and direction = 'outbound')::int as "outboundMessages",
        (select count(*) from ticket where org_id::text = ${ORG_ID})::int as tickets,
        (select count(*) from telegram_update_dedupe where org_id::text = ${ORG_ID})::int as dedupes,
        (
          select count(*) from message where org_id::text = ${ORG_ID}
            and (content::text like '%setup help%' or content::text like '%unknown%')
        )::int as "rawTextMatches"
    `
  ]);
  const row = results.at(-1)?.[0] ?? {};
  return Object.fromEntries(
    [
      "conversations",
      "dedupes",
      "messages",
      "outboundMessages",
      "rawTextMatches",
      "tickets"
    ].map((key) => [key, Number(row[key] ?? -1)])
  );
}

async function assertApiReadback() {
  const outDir = await compileApiRuntime({
    outDir: path.join(repoRoot, "node_modules/.cache/uzmax-api-runtime-m8-03")
  });
  const repoModule = await import(
    pathToFileURL(path.join(outDir, "conversation-ticket.repository.mjs")).href
  );
  const serviceModule = await import(
    pathToFileURL(path.join(outDir, "conversation-ticket.service.mjs")).href
  );
  const repository = await repoModule.createConversationTicketRepositoryProviderFromEnv(
    {
      env: {
        UZMAX_CONVERSATION_TICKET_REPOSITORY_MODE: "rls_prisma_gateway",
        UZMAX_RLS_DATABASE_URL: rlsDatabaseUrl
      },
      prismaClient: prisma
    }
  );
  const service = new serviceModule.ConversationTicketService(repository);
  const list = await service.listConversations(accessContext(), {});
  assert.equal(list.items.length, 2);
  const details = await Promise.all(
    list.items.map((conversation) =>
      service.getConversationDetail(accessContext(), conversation.id)
    )
  );
  assert.equal(
    details.filter((detail) =>
      detail.messages.some((message) => message.direction === "outbound")
    ).length,
    2
  );
  assert.equal(details.filter((detail) => detail.tickets.length === 1).length, 1);
  assert.equal(JSON.stringify(details).includes("setup help"), false);
  assert.equal(JSON.stringify(details).includes("unknown"), false);
}

function accessContext() {
  return {
    membershipVersion: 1,
    orgId: ORG_ID,
    permissions: ["conversation:read"],
    selectedTenantId: TENANT_A_ID,
    tenantIds: [TENANT_A_ID],
    userId: USER_ID
  };
}

async function syntheticResidueCount() {
  const rows = await prisma.$queryRaw`
    select (
      (select count(*) from org where id::text = ${ORG_ID})
      + (select count(*) from ai_member where org_id::text = ${ORG_ID})
      + (select count(*) from kb_entry where org_id::text = ${ORG_ID})
      + (select count(*) from channel_connection where metadata->>'synthetic_spec' = 'M8-03')
    )::int as residue
  `;
  return Number(rows[0]?.residue ?? -1);
}

async function waitForCompletedJobs(expected) {
  let counts;
  for (let remaining = 900; remaining > 0; remaining -= 1) {
    counts = await queue.getJobCounts("waiting", "active", "completed", "failed");
    if (counts.completed === expected && counts.waiting === 0 && counts.active === 0)
      return;
    if (counts.failed > 0) {
      const failed = await queue.getFailed(0, 0);
      throw new Error(`active answer worker job failed: ${failed[0]?.failedReason}`);
    }
    await delay(100);
  }
  throw new Error(`queue did not complete ${expected} jobs: ${JSON.stringify(counts)}`);
}

async function waitForDryRunOutboundLog() {
  for (let remaining = 900; remaining > 0; remaining -= 1) {
    const dryRun = logs.find(
      (entry) => entry.event === "worker.telegram_bot.outbound.dry_run"
    );
    if (dryRun) return dryRun;
    await delay(100);
  }
  throw new Error(`dry-run outbound log missing: ${JSON.stringify(logs)}`);
}
