import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

import { PrismaClient } from "@prisma/client";

const repoRoot = path.resolve(import.meta.dirname, "../../../..");
const ORG_ID = "11111111-1111-4111-8111-111111111711";
const TENANT_A_ID = "22222222-2222-4222-8222-222222222711";
const TENANT_B_ID = "33333333-3333-4333-8333-333333333711";
const TENANT_C_ID = "44444444-4444-4444-8444-444444444711";
const USER_ID = "55555555-5555-4555-8555-555555555711";
const CHANNEL_A_ID = "66666666-6666-4666-8666-666666666711";
const CHANNEL_B_ID = "77777777-7777-4777-8777-777777777711";
const CHANNEL_C_ID = "88888888-8888-4888-8888-888888888711";
const CONVERSATION_A1_ID = "99999999-9999-4999-8999-999999999711";
const CONVERSATION_A2_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaa711";
const CONVERSATION_B_ID = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbb711";
const CONVERSATION_C_ID = "cccccccc-cccc-4ccc-8ccc-ccccccccc711";
const TICKET_A1_ID = "dddddddd-dddd-4ddd-8ddd-ddddddddd711";
const TICKET_A2_ID = "eeeeeeee-eeee-4eee-8eee-eeeeeeeee711";
const TICKET_B_ID = "ffffffff-ffff-4fff-8fff-fffffffff711";
const TICKET_C_ID = "12121212-1212-4212-8212-121212121711";
const AI_MEMBER_A_ID = "13131313-1313-4313-8313-131313131711";
const AI_MEMBER_C_ID = "14141414-1414-4414-8414-141414141711";
const EVAL_A_ID = "15151515-1515-4515-8515-151515151711";
const EVAL_B_ID = "16161616-1616-4616-8616-161616161711";
const EVAL_C_ID = "17171717-1717-4717-8717-171717171711";
const WINDOW = {
  end: "2026-07-04T12:00:00.000Z",
  start: "2026-07-03T12:00:00.000Z"
};
const CREATED_AT = new Date("2026-07-04T08:00:00.000Z");

export async function runReqG01aCode01GroupOverviewDbApiFoundationSmoke() {
  const databaseUrl = readRlsDatabaseUrl();
  const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });

  try {
    await cleanup(prisma);
    await seed(prisma);
    const api = await importGroupOverviewRuntimeModules();
    const disabled = api.runtime.createGroupOverviewRepositoryProviderFromEnv({
      env: {}
    });
    assert.equal(disabled.runtimeStatus(), "disabled");
    await assert.rejects(
      () => disabled.listTenantAggregates(accessContext([TENANT_A_ID]), WINDOW),
      /group overview runtime is disabled/
    );

    const repository = api.runtime.createGroupOverviewRepositoryProviderFromEnv({
      env: {
        UZMAX_GROUP_OVERVIEW_RUNTIME_MODE: "rls_prisma_gateway",
        UZMAX_RLS_DATABASE_URL: databaseUrl
      },
      prismaClient: prisma
    });
    assert.equal(repository.runtimeStatus(), "configured");

    const rows = await repository.listTenantAggregates(
      accessContext([TENANT_A_ID, TENANT_B_ID]),
      WINDOW
    );
    assert.deepEqual(
      rows.map((row) => row.tenantId),
      [TENANT_A_ID, TENANT_B_ID]
    );
    assert.equal(JSON.stringify(rows).includes(TENANT_C_ID), false);

    const tenantA = rows.find((row) => row.tenantId === TENANT_A_ID);
    const tenantB = rows.find((row) => row.tenantId === TENANT_B_ID);
    assert.equal(tenantA.sessions, 2);
    assert.equal(tenantA.humanNeeded, 2);
    assert.equal(tenantA.slaRisk, 1);
    assert.equal(tenantA.handoffRateBps, 10000);
    assert.equal(tenantA.aiBreakerCount, 1);
    assert.equal(tenantA.evalStatus, "pass");
    assert.equal(tenantA.healthCategory, "breaker");
    assert.equal(tenantA.aiCostMicros, null);
    assert.equal(tenantA.businessLine, null);
    assert.equal(tenantA.lastAbnormalAggregateEvent, null);
    assert.equal(tenantB.sessions, 1);
    assert.equal(tenantB.humanNeeded, 0);
    assert.equal(tenantB.slaRisk, 0);
    assert.equal(tenantB.evalStatus, "failed");
    assert.equal(tenantB.healthCategory, "degraded");

    for (const row of rows) {
      assert.deepEqual(row.partialSources, [
        "business_line_source_unavailable",
        "channel_source_unavailable",
        "connector_health_unavailable",
        "cost_source_unavailable",
        "model_fault_source_unavailable",
        "order_source_unavailable",
        "redline_source_unavailable",
        "source_partial"
      ]);
      api.contracts.assertNoForbiddenPayload(row, "groupOverview.smoke.row");
    }
    assert.doesNotMatch(
      JSON.stringify(rows),
      /customer|phone|telegram|externalConversationRef|participantExternalRef|messageText|prompt|completion|providerResponse|storageUrl|secret|token|cookie|raw/i
    );

    await assertRlsIsolation(prisma);
    await cleanup(prisma);
    assert.equal(await residue(prisma), 0);
    console.log(
      "req-g01a-code-01-group-overview-db-api-foundation-smoke: passed rls_prisma_gateway tenant A/B aggregate readback, unauthorized tenant omission, missing-context RLS negative, disabled default, partial-source/no-raw assertions; residue=0"
    );
  } finally {
    await cleanup(prisma).catch((error) => {
      console.error(
        `req-g01a-code-01-group-overview-db-api-foundation-smoke: cleanup failed: ${error.message}`
      );
    });
    await prisma.$disconnect();
  }
}

if (
  process.argv[1]?.endsWith(
    "packages/db/scripts/tests/run-req-g01a-code-01-group-overview-db-api-foundation-smoke.mjs"
  )
) {
  await runReqG01aCode01GroupOverviewDbApiFoundationSmoke();
}

function readRlsDatabaseUrl() {
  const value = process.env.UZMAX_RLS_DATABASE_URL?.trim();
  if (!value) throw new Error("UZMAX_RLS_DATABASE_URL is required");
  return value;
}

async function importGroupOverviewRuntimeModules() {
  const ts = await loadTypescript();
  const authz = transpile(ts, "packages/authz/src/index.ts");
  const db = transpile(ts, "packages/db/src/index.ts");
  const prismaRuntime = dataModule(`
export function createUzmaxPrismaClientFromEnv() {
  throw new Error("smoke passes an explicit Prisma client");
}
`);
  const contracts = transpile(ts, "apps/api/src/group-overview.contracts.ts", {
    "../../../packages/authz/src/index.ts": authz
  });
  const repository = transpile(ts, "apps/api/src/group-overview.repository.ts", {
    "../../../packages/authz/src/index.ts": authz,
    "../../../packages/db/src/index.ts": db,
    "./group-overview.contracts.ts": contracts
  });
  const runtime = transpile(ts, "apps/api/src/group-overview.runtime.ts", {
    "../../../packages/db/src/prisma-runtime.ts": prismaRuntime,
    "./group-overview.contracts.ts": contracts,
    "./group-overview.repository.ts": repository
  });
  return {
    contracts: await import(contracts),
    runtime: await import(runtime)
  };
}

export async function loadTypescript() {
  try {
    const tsModule = await import("typescript");
    return tsModule.default ?? tsModule;
  } catch (error) {
    if (error?.code !== "ERR_MODULE_NOT_FOUND") throw error;
  }
  for (const root of dependencyRoots()) {
    if (!existsSync(path.join(root, "node_modules/typescript/package.json"))) continue;
    const requireFromRoot = createRequire(path.join(root, "package.json"));
    return requireFromRoot("typescript");
  }
  throw new Error("typescript package not found in this repo worktree set");
}

function dependencyRoots() {
  const roots = new Set([repoRoot]);
  try {
    const output = execFileSync("git", ["worktree", "list", "--porcelain"], {
      cwd: repoRoot,
      encoding: "utf8"
    });
    for (const line of output.split("\n")) {
      if (line.startsWith("worktree ")) roots.add(line.slice("worktree ".length));
    }
  } catch {
    // Smoke can still run from a checkout with local node_modules.
  }
  return roots;
}

export function transpile(ts, sourcePath, replacements = {}) {
  return dataModule(transpileText(ts, sourcePath, replacements));
}

export function transpileText(ts, sourcePath, replacements = {}) {
  let text = readFileSync(path.join(repoRoot, sourcePath), "utf8");
  for (const [from, to] of Object.entries(replacements)) {
    text = text.replaceAll(from, to);
  }
  const { outputText } = ts.transpileModule(text, {
    compilerOptions: {
      emitDecoratorMetadata: true,
      experimentalDecorators: true,
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2023
    },
    fileName: sourcePath
  });
  return outputText;
}

export function dataModule(text) {
  return `data:text/javascript;base64,${Buffer.from(text).toString("base64")}`;
}

async function seed(prisma) {
  await prisma.org.create({
    data: {
      id: ORG_ID,
      name: "REQ-G01A-code-01 Synthetic Org",
      slug: "req-g01a-code-01-org"
    }
  });
  await prisma.tenant.createMany({
    data: [
      tenant(TENANT_A_ID, "req-g01a-code-01-a", "REQ-G01A Tenant A"),
      tenant(TENANT_B_ID, "req-g01a-code-01-b", "REQ-G01A Tenant B"),
      tenant(TENANT_C_ID, "req-g01a-code-01-c", "REQ-G01A Tenant C")
    ]
  });
  await prisma.channelConnection.createMany({
    data: [
      channel(CHANNEL_A_ID, TENANT_A_ID, "a"),
      channel(CHANNEL_B_ID, TENANT_B_ID, "b"),
      channel(CHANNEL_C_ID, TENANT_C_ID, "c")
    ]
  });
  await prisma.channelConversation.createMany({
    data: [
      conversation(CONVERSATION_A1_ID, TENANT_A_ID, CHANNEL_A_ID, "a1", "HANDOFF"),
      conversation(CONVERSATION_A2_ID, TENANT_A_ID, CHANNEL_A_ID, "a2", "OPEN"),
      conversation(CONVERSATION_B_ID, TENANT_B_ID, CHANNEL_B_ID, "b1", "CLOSED"),
      conversation(CONVERSATION_C_ID, TENANT_C_ID, CHANNEL_C_ID, "c1", "HANDOFF")
    ]
  });
  await prisma.supportTicket.createMany({
    data: [
      ticket(TICKET_A1_ID, TENANT_A_ID, CONVERSATION_A1_ID, "OPEN", WINDOW.end),
      ticket(TICKET_A2_ID, TENANT_A_ID, CONVERSATION_A2_ID, "ESCALATED", null),
      ticket(TICKET_B_ID, TENANT_B_ID, CONVERSATION_B_ID, "CLOSED", WINDOW.end),
      ticket(TICKET_C_ID, TENANT_C_ID, CONVERSATION_C_ID, "OPEN", WINDOW.end)
    ]
  });
  await prisma.aiMember.createMany({
    data: [
      aiMember(AI_MEMBER_A_ID, TENANT_A_ID, "BREAKER_OFFLINE"),
      aiMember(AI_MEMBER_C_ID, TENANT_C_ID, "BREAKER_OFFLINE")
    ]
  });
  await prisma.evalGate.createMany({
    data: [
      evalGate(EVAL_A_ID, TENANT_A_ID, "PASSED"),
      evalGate(EVAL_B_ID, TENANT_B_ID, "FAILED"),
      evalGate(EVAL_C_ID, TENANT_C_ID, "BLOCKED")
    ]
  });
}

function tenant(id, slug, name) {
  return { id, name, orgId: ORG_ID, slug };
}

function channel(id, tenantId, suffix) {
  return {
    capabilities: { synthetic_spec: "REQ-G01A-code-01" },
    displayName: `REQ-G01A Channel ${suffix}`,
    externalAccountRef: `controlled://channel/req-g01a/${suffix}`,
    id,
    metadata: { synthetic_spec: "REQ-G01A-code-01" },
    orgId: ORG_ID,
    provider: "synthetic",
    status: "ACTIVE",
    tenantId
  };
}

function conversation(id, tenantId, channelConnectionId, suffix, status) {
  return {
    channelConnectionId,
    createdAt: CREATED_AT,
    externalConversationRef: `controlled://conversation/req-g01a/${suffix}`,
    id,
    lastMessageAt: CREATED_AT,
    orgId: ORG_ID,
    participantExternalRef: `controlled://participant/req-g01a/${suffix}`,
    status,
    tenantId,
    unreadCount: status === "CLOSED" ? 0 : 1
  };
}

function ticket(id, tenantId, conversationId, status, slaDueAt) {
  return {
    conversationId,
    id,
    orgId: ORG_ID,
    priority: 2,
    slaDueAt: slaDueAt ? new Date(slaDueAt) : null,
    status,
    summary: "controlled://ticket-summary/req-g01a",
    tenantId
  };
}

function aiMember(id, tenantId, status) {
  return {
    displayName: "REQ-G01A Synthetic AI",
    id,
    memberKey: `req-g01a-${tenantId.slice(0, 8)}`,
    metadata: { synthetic_spec: "REQ-G01A-code-01" },
    orgId: ORG_ID,
    status,
    tenantId
  };
}

function evalGate(id, tenantId, status) {
  return {
    categoryQuotas: { synthetic_spec: "REQ-G01A-code-01" },
    gateKey: `req-g01a-${tenantId.slice(0, 8)}`,
    id,
    orgId: ORG_ID,
    status,
    targetKind: "group_overview_smoke",
    targetRef: `controlled://group-overview/${tenantId}`,
    tenantId
  };
}

function accessContext(tenantIds) {
  return {
    membershipVersion: 1,
    orgId: ORG_ID,
    permissions: ["group:overview:read"],
    selectedTenantId: tenantIds[0],
    tenantIds,
    userId: USER_ID
  };
}

async function assertRlsIsolation(prisma) {
  assert.deepEqual(await visibleTenantIds(prisma, TENANT_A_ID), [TENANT_A_ID]);
  assert.deepEqual(await visibleTenantIds(prisma, TENANT_B_ID), [TENANT_B_ID]);
  assert.deepEqual(await visibleTenantIdsWithoutContext(prisma), []);
}

async function visibleTenantIds(prisma, tenantId) {
  const rows = await prisma
    .$transaction([
      prisma.$executeRawUnsafe('set local role "uzmax_app_runtime"'),
      prisma.$queryRaw`select set_config(${"app.org_id"}, ${ORG_ID}, true)`,
      prisma.$queryRaw`select set_config(${"app.tenant_id"}, ${tenantId}, true)`,
      prisma.tenant.findMany({
        orderBy: { id: "asc" },
        select: { id: true },
        where: { orgId: ORG_ID }
      })
    ])
    .then((result) => result.at(-1));
  return rows.map((row) => row.id);
}

async function visibleTenantIdsWithoutContext(prisma) {
  const rows = await prisma
    .$transaction([
      prisma.$executeRawUnsafe('set local role "uzmax_app_runtime"'),
      prisma.tenant.findMany({
        orderBy: { id: "asc" },
        select: { id: true },
        where: { orgId: ORG_ID }
      })
    ])
    .then((result) => result.at(-1));
  return rows.map((row) => row.id);
}

async function cleanup(prisma) {
  await prisma.supportTicket.deleteMany({ where: { orgId: ORG_ID } });
  await prisma.channelConversation.deleteMany({ where: { orgId: ORG_ID } });
  await prisma.channelConnection.deleteMany({ where: { orgId: ORG_ID } });
  await prisma.aiMember.deleteMany({ where: { orgId: ORG_ID } });
  await prisma.evalGate.deleteMany({ where: { orgId: ORG_ID } });
  await prisma.tenant.deleteMany({ where: { orgId: ORG_ID } });
  await prisma.org.deleteMany({ where: { id: ORG_ID } });
}

async function residue(prisma) {
  const counts = await Promise.all([
    prisma.supportTicket.count({ where: { orgId: ORG_ID } }),
    prisma.channelConversation.count({ where: { orgId: ORG_ID } }),
    prisma.channelConnection.count({ where: { orgId: ORG_ID } }),
    prisma.aiMember.count({ where: { orgId: ORG_ID } }),
    prisma.evalGate.count({ where: { orgId: ORG_ID } }),
    prisma.tenant.count({ where: { orgId: ORG_ID } }),
    prisma.org.count({ where: { id: ORG_ID } })
  ]);
  return counts.reduce((sum, count) => sum + count, 0);
}
