import assert from "node:assert/strict";
import { rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { PrismaClient } from "@prisma/client";

import { compileM8ActiveAnswerRuntimeModules } from "./tests/m8-active-answer-worker-smoke-support.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "../../..");
const tempDir = path.join(repoRoot, ".tmp", `m11-02-direct-${process.pid}`);
const ORG_ID = "11111111-1111-4111-8111-111111111405";
const TENANT_A_ID = "22222222-2222-4222-8222-222222222405";
const TENANT_B_ID = "33333333-3333-4333-8333-333333333405";
const CHANNEL_CONNECTION_ID = "44444444-4444-4444-8444-444444444405";
const CHANNEL_CONNECTION_B_ID = "55555555-5555-4555-8555-555555555405";
const PREEXISTING_CUSTOMER_ID = "66666666-6666-4666-8666-666666666405";

const prisma = new PrismaClient({
  datasources: { db: { url: requireEnv("UZMAX_RLS_DATABASE_URL") } }
});

try {
  await cleanupSyntheticRows();
  await seedSyntheticTenant();

  const runtime = await compileM8ActiveAnswerRuntimeModules({ repoRoot, tempDir });
  const gateway =
    new runtime.persistence.PrismaTelegramBotConversationPersistenceGateway(prisma);
  const firstPayload = payloadFor(runtime.channels, {
    enqueuedAt: "2026-06-26T10:00:00.000Z",
    firstName: "Ada",
    languageCode: "en",
    lastName: "Lovelace",
    messageId: 9001,
    providerUpdateId: 5001,
    tenantId: TENANT_A_ID,
    text: "synthetic readable support request one"
  });
  const secondPayload = payloadFor(runtime.channels, {
    enqueuedAt: "2026-06-26T09:00:00.000Z",
    messageId: 9002,
    providerUpdateId: 5002,
    tenantId: TENANT_A_ID,
    text: "synthetic readable support request two",
    username: "ada_updated"
  });
  const [accepted, secondAccepted] = await Promise.all([
    runtime.conversationRuntime.processTelegramBotConversationJob(
      firstPayload,
      gateway,
      admissionOptions()
    ),
    runtime.conversationRuntime.processTelegramBotConversationJob(
      secondPayload,
      gateway,
      admissionOptions()
    )
  ]);
  const identityAfterConcurrentUpdates = await readIdentity(TENANT_A_ID);
  const tenantBAccepted =
    await runtime.conversationRuntime.processTelegramBotConversationJob(
      payloadFor(runtime.channels, {
        channelConnectionId: CHANNEL_CONNECTION_B_ID,
        enqueuedAt: "2026-06-26T11:00:00.000Z",
        firstName: "Tenant B Ada",
        messageId: 9003,
        providerUpdateId: 5003,
        tenantId: TENANT_B_ID,
        text: "synthetic readable support request tenant b"
      }),
      gateway,
      admissionOptions()
    );
  const duplicate = await runtime.conversationRuntime.processTelegramBotConversationJob(
    { ...firstPayload, traceId: "trace:m6b-05a-duplicate" },
    gateway,
    admissionOptions()
  );
  assert.equal(accepted.status, "accepted");
  assert.equal(secondAccepted.status, "accepted");
  assert.equal(tenantBAccepted.status, "accepted");
  assert.equal(duplicate.status, "deduped");
  assert.equal(identityAfterConcurrentUpdates.customerId, PREEXISTING_CUSTOMER_ID);
  assert.equal(
    identityAfterConcurrentUpdates.firstSeenAt.toISOString(),
    "2026-06-26T08:00:00.000Z"
  );
  assert.equal(
    identityAfterConcurrentUpdates.lastSeenAt.toISOString(),
    "2026-06-26T10:00:00.000Z"
  );
  assert.deepEqual(identityAfterConcurrentUpdates.metadata.profile, {
    displayName: "Ada Lovelace",
    firstName: "Ada",
    languageCode: "en",
    lastName: "Lovelace",
    username: "ada_updated"
  });
  assert.notEqual(
    identityAfterConcurrentUpdates.customerId,
    (await readIdentity(TENANT_B_ID)).customerId
  );
  const preservedCustomer = await prisma.customer.findUnique({
    where: {
      id_orgId_tenantId: {
        id: PREEXISTING_CUSTOMER_ID,
        orgId: ORG_ID,
        tenantId: TENANT_A_ID
      }
    }
  });
  assert.equal(preservedCustomer?.preferredLanguage, "manual-uz");

  const tenantA = await countVisibleRows(TENANT_A_ID);
  const tenantB = await countVisibleRows(TENANT_B_ID);
  assert.deepEqual(tenantA, {
    conversations: 1,
    customerIdentities: 1,
    customers: 1,
    dedupes: 2,
    messages: 2,
    readableTextMatches: 2,
    tickets: 2
  });
  assert.deepEqual(tenantB, {
    conversations: 1,
    customerIdentities: 1,
    customers: 1,
    dedupes: 1,
    messages: 1,
    readableTextMatches: 1,
    tickets: 1
  });

  await cleanupSyntheticRows();
  assert.equal(await syntheticResidueCount(), 0);
  console.log(
    "m6b-conversation-runtime-true-db-smoke: passed readable inbound persistence, customer identity idempotency/no-relink, monotonic lastSeen, duplicate dedupe, tenant isolation and residue=0"
  );
} finally {
  await cleanupSyntheticRows().catch(logCleanupFailure);
  await prisma.$disconnect();
  await rm(tempDir, { force: true, recursive: true }).catch(() => undefined);
}

function logCleanupFailure(error) {
  console.error(
    `m6b-conversation-runtime-true-db-smoke: cleanup failed: ${error.message}`
  );
}

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function payloadFor(channels, input) {
  return channels.createTelegramBotConversationJobPayload({
    channelConnectionId: input.channelConnectionId ?? CHANNEL_CONNECTION_ID,
    enqueuedAt: input.enqueuedAt,
    orgId: ORG_ID,
    tenantId: input.tenantId,
    traceId: `trace:m6b-05a-${input.providerUpdateId}`,
    update: channels.normalizeTelegramBotUpdate({
      message: {
        chat: { id: 7001, type: "private" },
        date: 1781654400,
        from: {
          first_name: input.firstName,
          id: 8001,
          language_code: input.languageCode,
          last_name: input.lastName,
          username: input.username
        },
        message_id: input.messageId,
        text: input.text
      },
      update_id: input.providerUpdateId
    })
  });
}

function admissionOptions() {
  return {
    admissionPolicy: {
      allowedChatExternalRefs: new Set(["telegram:chat:7001"]),
      allowedParticipantExternalRefs: new Set(["telegram:user:8001"])
    }
  };
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
  await prisma.channelConnection.createMany({
    data: [
      {
        capabilities: { botConversationRuntime: true },
        externalAccountRef: "controlled://telegram-bot/m6b-05a",
        id: CHANNEL_CONNECTION_ID,
        metadata: { synthetic_spec: "M6B-05a" },
        orgId: ORG_ID,
        provider: "telegram_bot",
        tenantId: TENANT_A_ID
      },
      {
        capabilities: { botConversationRuntime: true },
        externalAccountRef: "controlled://telegram-bot/m6b-05a-tenant-b",
        id: CHANNEL_CONNECTION_B_ID,
        metadata: { synthetic_spec: "M6B-05a" },
        orgId: ORG_ID,
        provider: "telegram_bot",
        tenantId: TENANT_B_ID
      }
    ]
  });
  await prisma.customer.create({
    data: {
      displayLabelRef: "controlled://customer/m11-02-preexisting",
      id: PREEXISTING_CUSTOMER_ID,
      metadata: { source: "manual" },
      orgId: ORG_ID,
      preferredLanguage: "manual-uz",
      tenantId: TENANT_A_ID
    }
  });
  await prisma.customerIdentity.create({
    data: {
      channelConnectionId: CHANNEL_CONNECTION_ID,
      customerId: PREEXISTING_CUSTOMER_ID,
      externalSubjectRef: "telegram:user:8001",
      firstSeenAt: new Date("2026-06-26T08:00:00.000Z"),
      id: "77777777-7777-4777-8777-777777777405",
      identityKind: "channel_subject",
      lastSeenAt: new Date("2026-06-26T08:00:00.000Z"),
      metadata: { profile: { username: "legacy_ada" }, source: "manual" },
      orgId: ORG_ID,
      provider: "telegram_bot",
      tenantId: TENANT_A_ID
    }
  });
}

async function readIdentity(tenantId) {
  const identity = await prisma.customerIdentity.findUnique({
    where: {
      orgId_tenantId_provider_externalSubjectRef: {
        externalSubjectRef: "telegram:user:8001",
        orgId: ORG_ID,
        provider: "telegram_bot",
        tenantId
      }
    }
  });
  assert.ok(identity);
  return identity;
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
        (select count(*) from customer where org_id::text = ${ORG_ID})::int as customers,
        (select count(*) from customer_identity where org_id::text = ${ORG_ID})::int as "customerIdentities",
        (select count(*) from message where org_id::text = ${ORG_ID})::int as messages,
        (select count(*) from ticket where org_id::text = ${ORG_ID})::int as tickets,
        (select count(*) from telegram_update_dedupe where org_id::text = ${ORG_ID})::int as dedupes,
        (
          select count(*)
          from message
          where org_id::text = ${ORG_ID}
            and content->>'text' like 'synthetic readable support request%'
        )::int as "readableTextMatches"
    `
  ]);
  const row = results.at(-1)?.[0] ?? {};
  return {
    conversations: Number(row.conversations ?? -1),
    customerIdentities: Number(row.customerIdentities ?? -1),
    customers: Number(row.customers ?? -1),
    dedupes: Number(row.dedupes ?? -1),
    messages: Number(row.messages ?? -1),
    readableTextMatches: Number(row.readableTextMatches ?? -1),
    tickets: Number(row.tickets ?? -1)
  };
}
