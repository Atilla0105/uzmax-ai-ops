import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import ts from "typescript";

const ORG_ID = "11111111-1111-4111-8111-111111111503";
const TENANT_A_ID = "22222222-2222-4222-8222-222222222503";
const TENANT_B_ID = "33333333-3333-4333-8333-333333333503";
const USER_ID = "44444444-4444-4444-8444-444444444503";
const RUN_ID = "55555555-5555-4555-8555-555555555503";
const BUSINESS_DATE = "2026-06-25";

export async function runM5rDistillSchedulerHealthTrueDbSmoke() {
  const databaseUrl = readRlsDatabaseUrl();
  const prisma = await createSmokePrismaClient(databaseUrl);
  try {
    await cleanupSyntheticRows(prisma);
    await seedSyntheticTenants(prisma);
    const runtime = await importDistillRuntimeModules();
    const persistence = runtime.worker.createDistillRuntimePersistenceProviderFromEnv({
      env: {
        UZMAX_DISTILL_RUNTIME_MODE: "rls_prisma_gateway",
        UZMAX_RLS_DATABASE_URL: databaseUrl
      },
      prismaClient: prisma
    });
    const job = runtime.cron.createDailyDistillSchedulerJobPlan({
      payload: createM5rDistillDailyInput(),
      scheduleRef: "controlled://distill-schedule/m5r-03/daily"
    });
    const result = await runtime.worker.runDistillDailyHealthRuntime(
      job.payload,
      persistence
    );
    assert.equal(result.persisted.confirmationItemIds.length, 10);

    const evidence = await assertSameTenantReadback(prisma, result);
    await assertRlsNegatives(prisma, evidence.healthDailyId);
    const recovery = await persistence.recoverDailyFrequency({
      actorUserId: USER_ID,
      businessDate: BUSINESS_DATE,
      healthSummaryRef: "controlled://distill-health/m5r-03/recovery",
      orgId: ORG_ID,
      reasonRef: "controlled://distill-recovery/m5r-03/reason",
      recoveryRef: "controlled://distill-recovery/m5r-03/manual",
      tenantId: TENANT_A_ID
    });
    assert.equal(recovery.toFrequency, "daily");
    await assertRecoveryReadback(prisma, evidence.healthDailyId, recovery.auditLogId);
    await cleanupSyntheticRows(prisma);
    assert.equal(await syntheticResidueCount(prisma), 0);
    console.log(
      "m5r-distill-scheduler-health-true-db-smoke: passed candidate cap, distill_run, confirmation_item, distill_health_daily, downshift owner alert, manual recovery and RLS negatives; residue=0"
    );
  } finally {
    await cleanupSyntheticRows(prisma).catch((error) => {
      console.error(
        `m5r-distill-scheduler-health-true-db-smoke: cleanup failed: ${error.message}`
      );
    });
    await prisma.$disconnect();
  }
}

export async function importDistillRuntimeModules() {
  const outDir = path.join(
    process.cwd(),
    "node_modules/.cache/uzmax-distill-runtime-m5r-03"
  );
  mkdirSync(outDir, { recursive: true });
  const files = [
    ["packages-distill-index", "packages/distill/src/index.ts", {}],
    ["packages-db-index", "packages/db/src/index.ts", {}],
    ["packages-db-prisma-runtime", "packages/db/src/prisma-runtime.ts", {}],
    [
      "worker-distill-runtime-contracts",
      "apps/worker/src/distill-runtime-contracts.ts",
      { "../../../packages/distill/src/index.ts": "./packages-distill-index.mjs" }
    ],
    [
      "worker-distill-runtime",
      "apps/worker/src/distill-runtime.ts",
      {
        "../../../packages/db/src/index.ts": "./packages-db-index.mjs",
        "../../../packages/db/src/prisma-runtime.ts":
          "./packages-db-prisma-runtime.mjs",
        "../../../packages/distill/src/index.ts": "./packages-distill-index.mjs",
        "./distill-runtime-contracts.ts": "./worker-distill-runtime-contracts.mjs"
      }
    ],
    [
      "cron-distill-scheduler",
      "apps/cron/src/distill-scheduler.ts",
      {
        "../../worker/src/distill-runtime-contracts.ts":
          "./worker-distill-runtime-contracts.mjs",
        "../../worker/src/distill-runtime.ts": "./worker-distill-runtime.mjs"
      }
    ]
  ];
  for (const [name, relativePath, replacements] of files) {
    writeFileSync(
      path.join(outDir, `${name}.mjs`),
      transpileSource(relativePath, replacements)
    );
  }
  const base = `${pathToFileURL(outDir).href}/`;
  const [cron, worker, contracts] = await Promise.all([
    import(`${base}cron-distill-scheduler.mjs`),
    import(`${base}worker-distill-runtime.mjs`),
    import(`${base}worker-distill-runtime-contracts.mjs`)
  ]);
  return { contracts, cron, worker };
}

function readRlsDatabaseUrl() {
  const value = process.env.UZMAX_RLS_DATABASE_URL?.trim();
  if (!value) throw new Error("UZMAX_RLS_DATABASE_URL is required");
  return value;
}

async function createSmokePrismaClient(databaseUrl) {
  const { PrismaClient } = await import("@prisma/client");
  return new PrismaClient({ datasources: { db: { url: databaseUrl } } });
}

async function seedSyntheticTenants(prisma) {
  await prisma.org.create({
    data: { id: ORG_ID, name: "M5R-03 Synthetic Org", slug: "m5r-03-synthetic-org" }
  });
  await prisma.tenant.createMany({
    data: [
      { id: TENANT_A_ID, name: "M5R-03 Tenant A", orgId: ORG_ID, slug: "tenant-a" },
      { id: TENANT_B_ID, name: "M5R-03 Tenant B", orgId: ORG_ID, slug: "tenant-b" }
    ]
  });
}

export function createM5rDistillDailyInput() {
  return {
    actorUserId: USER_ID,
    auditRef: "controlled://distill-audit/m5r-03/run",
    businessDate: BUSINESS_DATE,
    candidates: Array.from({ length: 12 }, (_, index) => ({
      candidateRef: `controlled://candidate/m5r-03/${index}`,
      confidenceBps: 9000 - index * 100,
      confirmationItemId: `66666666-6666-4666-8666-${String(666666666500 + index).padStart(12, "0")}`,
      kind: index % 3 === 0 ? "eval_candidate" : "knowledge_candidate",
      payloadRefs: { summaryRef: `controlled://candidate-summary/m5r-03/${index}` },
      sourceRef: `controlled://distill-source/m5r-03/${index}`,
      tieBreaker: `candidate-${String(index).padStart(2, "0")}`
    })),
    currentFrequency: "daily",
    dailyCounts: [
      day("2026-06-19", 10, 6, 1),
      day("2026-06-20", 10, 6, 1),
      day("2026-06-21", 10, 6, 1),
      day("2026-06-22", 10, 6, 1),
      day("2026-06-23", 10, 3, 4),
      day("2026-06-24", 10, 3, 4),
      day(BUSINESS_DATE, 10, 3, 4)
    ],
    downshiftReasonRef: "controlled://distill-health/m5r-03/downshift",
    healthSummaryRef: "controlled://distill-health/m5r-03/summary",
    orgId: ORG_ID,
    ownerAlertRef: "controlled://owner-alert/m5r-03/downshift",
    runId: RUN_ID,
    sourceWindowEnd: "2026-06-25T23:59:59.000Z",
    sourceWindowStart: "2026-06-25T00:00:00.000Z",
    summaryRef: "controlled://distill-summary/m5r-03/weekly",
    tenantId: TENANT_A_ID
  };
}

function day(businessDate, candidateCount, approvedCount, discardedCount) {
  return { approvedCount, businessDate, candidateCount, discardedCount };
}

async function assertSameTenantReadback(prisma, result) {
  const [run] = await runRlsProbe(prisma, TENANT_A_ID, (client) =>
    client.distillRun.findMany({ where: { id: RUN_ID } })
  );
  assert.equal(run.candidateCount, 10);
  assert.equal(run.truncatedCount, 2);
  const items = await runRlsProbe(prisma, TENANT_A_ID, (client) =>
    client.confirmationItem.findMany({ where: { distillRunId: RUN_ID } })
  );
  assert.equal(items.length, 10);
  assert.ok(items.every((item) => item.status === "PENDING"));
  assert.ok(items.every((item) => item.auditLogId === null));
  assert.ok(items.every((item) => item.metadata.formalWrite === false));
  const [health] = await runRlsProbe(prisma, TENANT_A_ID, (client) =>
    client.distillHealthDaily.findMany({
      where: { businessDate: dateAtUtc(BUSINESS_DATE) }
    })
  );
  assert.equal(health.frequency, "WEEKLY");
  assert.equal(health.downshifted, true);
  assert.equal(health.consecutiveLowPassDays, 3);
  assert.equal(health.sevenDayPassRateBps, result.summary.sevenDayPassRateBps);
  const audits = await runRlsProbe(prisma, TENANT_A_ID, (client) =>
    client.auditLog.findMany({ where: { eventType: "distill.owner_alert_draft" } })
  );
  assert.equal(audits.length, 1);
  assert.equal(audits[0].content.after.payloadPolicy, "controlled_refs_only");
  assert.equal(health.metadata.ownerAlertDraft.auditLogId, audits[0].id);
  return { healthDailyId: health.id };
}

async function assertRecoveryReadback(prisma, healthDailyId, auditLogId) {
  const [health] = await runRlsProbe(prisma, TENANT_A_ID, (client) =>
    client.distillHealthDaily.findMany({ where: { id: healthDailyId } })
  );
  assert.equal(health.frequency, "DAILY");
  assert.equal(health.downshifted, false);
  assert.equal(health.recoveryAuditLogId, auditLogId);
  const [audit] = await runRlsProbe(prisma, TENANT_A_ID, (client) =>
    client.auditLog.findMany({ where: { id: auditLogId } })
  );
  assert.equal(audit.eventType, "distill.manual_recovery");
  assert.equal(audit.content.after.toFrequency, "daily");
}

async function assertRlsNegatives(prisma, healthDailyId) {
  assert.equal(
    (
      await runRlsProbe(prisma, TENANT_B_ID, (client) =>
        client.distillRun.findMany({ where: { id: RUN_ID } })
      )
    ).length,
    0
  );
  await assert.rejects(
    () =>
      runRlsProbe(prisma, TENANT_B_ID, (client) =>
        client.distillHealthDaily.update({
          data: { frequency: "DAILY" },
          where: { id: healthDailyId }
        })
      ),
    /Record to update not found|No .* found|P2025|not found/i
  );
  assert.equal(
    (
      await runRlsProbeWithoutContext(prisma, (client) =>
        client.confirmationItem.findMany({ where: { distillRunId: RUN_ID } })
      )
    ).length,
    0
  );
  await assert.rejects(
    () =>
      runRlsProbeWithoutContext(prisma, (client) =>
        client.distillHealthDaily.update({
          data: { frequency: "DAILY" },
          where: { id: healthDailyId }
        })
      ),
    /Record to update not found|No .* found|P2025|not found/i
  );
}

async function runRlsProbe(prisma, tenantId, operation) {
  return runAppRuntimeProbe(prisma, operation, tenantId);
}

async function runRlsProbeWithoutContext(prisma, operation) {
  return runAppRuntimeProbe(prisma, operation);
}

async function runAppRuntimeProbe(prisma, operation, tenantId) {
  const batch = [prisma.$executeRawUnsafe('set local role "uzmax_app_runtime"')];
  if (tenantId) {
    batch.push(
      prisma.$queryRaw`select set_config('app.org_id', ${ORG_ID}, true)`,
      prisma.$queryRaw`select set_config('app.tenant_id', ${tenantId}, true)`
    );
  }
  batch.push(operation(prisma));
  return (await prisma.$transaction(batch)).at(-1);
}

async function cleanupSyntheticRows(prisma) {
  await prisma.distillHealthDaily.deleteMany({ where: { orgId: ORG_ID } });
  await prisma.confirmationItem.deleteMany({ where: { orgId: ORG_ID } });
  await prisma.auditLog.deleteMany({ where: { orgId: ORG_ID } });
  await prisma.distillRun.deleteMany({ where: { orgId: ORG_ID } });
  await prisma.tenant.deleteMany({ where: { orgId: ORG_ID } });
  await prisma.org.deleteMany({ where: { id: ORG_ID } });
}

async function syntheticResidueCount(prisma) {
  const rows = await prisma.$queryRaw`
    select (
      (select count(*) from org where id::text = ${ORG_ID})
      + (select count(*) from tenant where org_id::text = ${ORG_ID})
      + (select count(*) from distill_health_daily where org_id::text = ${ORG_ID})
      + (select count(*) from distill_run where org_id::text = ${ORG_ID} and (id::text = ${RUN_ID} or metadata->>'auditRef' = 'controlled://distill-audit/m5r-03/run'))
      + (select count(*) from confirmation_item where org_id::text = ${ORG_ID} and (distill_run_id::text = ${RUN_ID} or metadata->>'distillRunId' = ${RUN_ID}))
      + (select count(*) from audit_log where org_id::text = ${ORG_ID} and module = 'distill' and trace_id like 'distill%')
    )::int as residue
  `;
  return Number(rows[0]?.residue ?? -1);
}

function transpileSource(relativePath, replacements) {
  const source = Object.entries(replacements).reduce(
    (text, [from, to]) => text.replaceAll(from, to),
    readFileSync(path.join(process.cwd(), relativePath), "utf8")
  );
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2023
    },
    fileName: relativePath
  });
  return outputText;
}

function dateAtUtc(value) {
  return new Date(`${value}T00:00:00.000Z`);
}
