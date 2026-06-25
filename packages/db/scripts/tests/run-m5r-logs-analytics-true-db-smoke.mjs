import assert from "node:assert/strict";
import { pathToFileURL, URL } from "node:url";

import { PrismaClient } from "@prisma/client";

import { compileApiRuntime } from "../../../../apps/api/scripts/runtime-compiler.mjs";

const SPEC = "M5R-05";
const ORG_ID = "11111111-1111-4111-8111-111111111505";
const TENANT_A_ID = "22222222-2222-4222-8222-222222222505";
const TENANT_B_ID = "33333333-3333-4333-8333-333333333505";
const USER_ID = "44444444-4444-4444-8444-444444444505";
const MEMBER_ID = "55555555-5555-4555-8555-555555555505";
const LOGIN_ID = "66666666-6666-4666-8666-666666666505";
const PRESENCE_ID = "77777777-7777-4777-8777-777777777505";
const AUDIT_ID = "88888888-8888-4888-8888-888888888505";
const HEALTH_ID = "99999999-9999-4999-8999-999999999505";
const CONFIRM_APPROVED_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaa505";
const CONFIRM_DISCARDED_ID = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbb505";

export async function runM5rLogsAnalyticsTrueDbSmoke() {
  const databaseUrl = readRlsDatabaseUrl();
  const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });

  try {
    await cleanup(prisma);
    await seedTenants(prisma);
    const api = await importRuntime();
    const repository =
      api.logsAnalyticsRuntime.createLogsAnalyticsRuntimeRepositoryProviderFromEnv({
        env: {
          UZMAX_LOGS_ANALYTICS_RUNTIME_MODE: "rls_prisma_gateway",
          UZMAX_RLS_DATABASE_URL: databaseUrl
        },
        prismaClient: prisma
      });
    await seedScopedRows(prisma);

    const tenantA = accessContext(TENANT_A_ID, ["logs:read", "logs:export"]);
    const tenantB = accessContext(TENANT_B_ID, ["logs:read", "logs:export"]);

    assert.equal(
      (await repository.listLoginLogs(tenantA, { limit: 10, type: "password" })).length,
      1
    );
    assert.equal(
      (await repository.listPresenceLogs(tenantA, { limit: 10, status: "online" }))
        .length,
      1
    );
    assert.equal(
      (await repository.listOperationLogs(tenantA, { limit: 10, module: "config" }))
        .length,
      1
    );
    assert.equal(
      (await repository.listLoginLogs(tenantB, { limit: 10, type: "password" })).length,
      0
    );

    const board = await repository.getBoard(tenantA);
    assert.equal(board.confirmationQueuePassRateBps, 5000);
    assert.equal(board.distillFrequency, "weekly");
    assert.equal(board.aiMemberStatusCounts.online, 1);

    const exportDraft = await repository.createExportDraft(tenantA, {
      filters: { module: "config" },
      logKinds: ["login", "presence", "operation"],
      metricRefs: ["controlled://metric/confirmation-pass-rate"],
      reasonRef: "controlled://export/m5r-05/reason",
      scope: { tenantId: TENANT_A_ID }
    });
    assert.equal(exportDraft.fileRef, null);
    assert.equal(exportDraft.formalExportWrite, false);

    await assertMissingContext(prisma);
    await cleanup(prisma);
    assert.equal(await residue(prisma), 0);
    console.log(
      "m5r-logs-analytics-true-db-smoke: passed same-tenant login/presence/operation/export/board readback, wrong-tenant and missing-context RLS negatives; residue=0"
    );
  } finally {
    await cleanup(prisma).catch((error) => {
      console.error(
        `m5r-logs-analytics-true-db-smoke: cleanup failed: ${error.message}`
      );
    });
    await prisma.$disconnect();
  }
}

function readRlsDatabaseUrl() {
  const value = process.env.UZMAX_RLS_DATABASE_URL?.trim();
  if (!value) throw new Error("UZMAX_RLS_DATABASE_URL is required");
  return value;
}

async function importRuntime() {
  const outDir = await compileApiRuntime();
  return {
    logsAnalyticsRuntime: await import(
      new URL("logs-analytics-runtime.mjs", `${pathToFileURL(outDir).href}/`).href
    )
  };
}

async function seedTenants(prisma) {
  await prisma.org.create({
    data: { id: ORG_ID, name: "M5R-05 Synthetic Org", slug: "m5r-05-org" }
  });
  await prisma.tenant.createMany({
    data: [
      { id: TENANT_A_ID, name: "M5R-05 Tenant A", orgId: ORG_ID, slug: "m5r-05-a" },
      { id: TENANT_B_ID, name: "M5R-05 Tenant B", orgId: ORG_ID, slug: "m5r-05-b" }
    ]
  });
}

async function seedScopedRows(prisma) {
  await rlsTransaction(prisma, TENANT_A_ID, [
    prisma.loginLog.create({
      data: {
        device: "desktop",
        id: LOGIN_ID,
        loginType: "password",
        memberUserId: USER_ID,
        metadata: { synthetic_spec: SPEC },
        orgId: ORG_ID,
        tenantId: TENANT_A_ID
      }
    }),
    prisma.presenceLog.create({
      data: {
        durationSeconds: 180,
        id: PRESENCE_ID,
        memberUserId: USER_ID,
        metadata: { synthetic_spec: SPEC },
        orgId: ORG_ID,
        startedAt: new Date("2026-06-25T08:00:00.000Z"),
        status: "online",
        tenantId: TENANT_A_ID,
        updateMethod: "manual"
      }
    }),
    prisma.auditLog.create({
      data: {
        action: "updated",
        actorUserId: USER_ID,
        content: {
          after: { ref: "controlled://config/m5r-05/after" },
          before: { ref: "controlled://config/m5r-05/before" }
        },
        eventType: "config_version.saved",
        id: AUDIT_ID,
        module: "config",
        objectId: "controlled://config/m5r-05",
        objectType: "config_version",
        orgId: ORG_ID,
        tenantId: TENANT_A_ID
      }
    }),
    prisma.confirmationItem.createMany({
      data: [
        confirmation(CONFIRM_APPROVED_ID, "APPROVED"),
        confirmation(CONFIRM_DISCARDED_ID, "DISCARDED")
      ]
    }),
    prisma.distillHealthDaily.create({
      data: {
        approvedCount: 1,
        businessDate: new Date("2026-06-25T00:00:00.000Z"),
        candidateCount: 2,
        discardedCount: 1,
        frequency: "WEEKLY",
        id: HEALTH_ID,
        metadata: { synthetic_spec: SPEC },
        orgId: ORG_ID,
        sevenDayPassRateBps: 5000,
        tenantId: TENANT_A_ID
      }
    }),
    prisma.aiMember.create({
      data: {
        displayName: "M5R-05 Synthetic AI",
        id: MEMBER_ID,
        memberKey: "m5r-05-ai",
        metadata: { synthetic_spec: SPEC },
        orgId: ORG_ID,
        status: "ONLINE",
        tenantId: TENANT_A_ID
      }
    })
  ]);
}

function confirmation(id, status) {
  return {
    candidatePayload: { ref: `controlled://confirmation/${id}` },
    diffPayload: {},
    id,
    kind: "KNOWLEDGE_CANDIDATE",
    metadata: { synthetic_spec: SPEC },
    orgId: ORG_ID,
    sourceRef: `controlled://source/${id}`,
    status,
    tenantId: TENANT_A_ID
  };
}

async function rlsTransaction(prisma, tenantId, ops) {
  return prisma.$transaction([
    prisma.$executeRawUnsafe('set local role "uzmax_app_runtime"'),
    prisma.$queryRaw`select set_config(${"app.org_id"}, ${ORG_ID}, true)`,
    prisma.$queryRaw`select set_config(${"app.tenant_id"}, ${tenantId}, true)`,
    ...ops
  ]);
}

async function assertMissingContext(prisma) {
  const rows = await prisma.$transaction([
    prisma.$executeRawUnsafe('set local role "uzmax_app_runtime"'),
    prisma.loginLog.findMany({ where: { orgId: ORG_ID, tenantId: TENANT_A_ID } }),
    prisma.exportJob.findMany({ where: { orgId: ORG_ID, tenantId: TENANT_A_ID } })
  ]);
  assert.equal(rows[1].length, 0);
  assert.equal(rows[2].length, 0);
}

function accessContext(selectedTenantId, permissions) {
  return {
    membershipVersion: 1,
    orgId: ORG_ID,
    permissions,
    selectedTenantId,
    tenantIds: [TENANT_A_ID, TENANT_B_ID],
    userId: USER_ID
  };
}

async function cleanup(prisma) {
  await prisma.exportJob.deleteMany({ where: { orgId: ORG_ID } });
  await prisma.loginLog.deleteMany({ where: { orgId: ORG_ID } });
  await prisma.presenceLog.deleteMany({ where: { orgId: ORG_ID } });
  await prisma.aiMember.deleteMany({ where: { orgId: ORG_ID } });
  await prisma.distillHealthDaily.deleteMany({ where: { orgId: ORG_ID } });
  await prisma.confirmationItem.deleteMany({ where: { orgId: ORG_ID } });
  await prisma.auditLog.deleteMany({ where: { orgId: ORG_ID } });
  await prisma.tenant.deleteMany({ where: { orgId: ORG_ID } });
  await prisma.org.deleteMany({ where: { id: ORG_ID } });
}

async function residue(prisma) {
  const counts = await Promise.all([
    prisma.exportJob.count({ where: { orgId: ORG_ID } }),
    prisma.loginLog.count({ where: { orgId: ORG_ID } }),
    prisma.presenceLog.count({ where: { orgId: ORG_ID } }),
    prisma.auditLog.count({ where: { orgId: ORG_ID } })
  ]);
  return counts.reduce((sum, count) => sum + count, 0);
}
