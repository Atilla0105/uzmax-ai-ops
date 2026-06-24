import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { URL } from "node:url";

import {
  createM5rDistillDailyInput as input,
  importDistillRuntimeModules,
  runM5rDistillSchedulerHealthTrueDbSmoke
} from "../../packages/db/scripts/run-m5r-distill-scheduler-health-true-db-smoke.mjs";

const ORG_ID = "11111111-1111-4111-8111-111111111503";
const TENANT_ID = "22222222-2222-4222-8222-222222222503";
const USER_ID = "44444444-4444-4444-8444-444444444503";
const RUN_ID = "55555555-5555-4555-8555-555555555503";
const BUSINESS_DATE = "2026-06-25";
const repoRootUrl = new URL("../../", import.meta.url);
const source = {
  contracts: loadText("apps/worker/src/distill-runtime-contracts.ts"),
  cron: loadText("apps/cron/src/distill-scheduler.ts"),
  runtime: loadText("apps/worker/src/distill-runtime.ts"),
  smoke: loadText(
    "packages/db/scripts/tests/run-m5r-distill-scheduler-health-true-db-smoke.mjs"
  ),
  wrapper: loadText(
    "packages/db/scripts/run-m5r-distill-scheduler-health-true-db-smoke.mjs"
  )
};
const docs = [
  loadText("docs/specs/M5R-03-distill-scheduler-health-runtime.md"),
  loadText("docs/evidence/M5R/M5R-03-distill-scheduler-health-runtime.md"),
  loadText("docs/evidence/M5R/README.md")
].join("\n");
const modules = await importDistillRuntimeModules();

describe("M5R-03 distill scheduler health runtime", () => {
  it("plans an injected cron job and caps candidates with M5-02 helpers", () => {
    const job = modules.cron.createDailyDistillSchedulerJobPlan({
      payload: input(),
      scheduleRef: "controlled://distill-schedule/m5r-03/daily"
    });
    const plan = modules.contracts.createDistillRuntimePlan(job.payload);

    assert.equal(job.jobName, "distill_daily_health_runtime");
    assert.equal(job.queue, "distill");
    assert.equal(plan.distillRun.candidateCount, 10);
    assert.equal(plan.distillRun.truncatedCount, 2);
    assert.equal(plan.confirmationItems.length, 10);
    assert.ok(plan.confirmationItems.every((item) => item.distillRunId === RUN_ID));
    assert.ok(
      plan.confirmationItems.every((item) => item.metadata.formalWrite === false)
    );
    assert.equal(plan.healthDaily.frequency, "weekly");
    assert.equal(plan.healthDaily.downshifted, true);
    assert.equal(plan.ownerAlertAudit.eventType, "distill.owner_alert_draft");
    assert.match(source.cron, /createDailyDistillSchedulerJobPlan/);
    assert.doesNotMatch(
      `${source.cron}\n${source.runtime}`,
      /llm-gateway|draftReply|packages\/llm/i
    );
  });

  it("persists daily run, health, owner alert and manual recovery through RLS transactions", async () => {
    const fake = fakePrisma();
    const persistence = modules.worker.createDistillRuntimePersistenceProviderFromEnv({
      mode: "rls_prisma_gateway",
      prismaClient: fake
    });

    const result = await modules.worker.runDistillDailyHealthRuntime(
      input(),
      persistence
    );
    assert.equal(result.persisted.confirmationItemIds.length, 10);
    assert.equal(fake.createdRuns[0].candidateCount, 10);
    assert.equal(fake.createdRuns[0].truncatedCount, 2);
    assert.equal(fake.createdItems.length, 10);
    assert.equal(fake.createdItems[0].distillRunId, RUN_ID);
    assert.equal(fake.createdAudits[0].eventType, "distill.owner_alert_draft");
    assert.equal(fake.upsertedHealth[0].update.frequency, "WEEKLY");
    assert.deepEqual(fake.transactions[0].slice(0, 3), [
      { kind: "role", sql: 'set local role "uzmax_app_runtime"' },
      { key: "app.org_id", kind: "set_config", value: ORG_ID },
      { key: "app.tenant_id", kind: "set_config", value: TENANT_ID }
    ]);

    fake.healthRows = [
      {
        id: result.healthDaily.id,
        frequency: "WEEKLY",
        metadata: result.healthDaily.metadata
      }
    ];
    const recovery = await persistence.recoverDailyFrequency({
      actorUserId: USER_ID,
      businessDate: BUSINESS_DATE,
      healthSummaryRef: "controlled://distill-health/m5r-03/recovery",
      orgId: ORG_ID,
      reasonRef: "controlled://distill-recovery/m5r-03/reason",
      recoveryRef: "controlled://distill-recovery/m5r-03/manual",
      tenantId: TENANT_ID
    });
    assert.equal(recovery.toFrequency, "daily");
    assert.equal(fake.createdAudits.at(-1).eventType, "distill.manual_recovery");
    assert.equal(fake.updatedHealth[0].data.frequency, "DAILY");
    assert.equal(fake.updatedHealth[0].data.recoveryAuditLogId, recovery.auditLogId);
  });

  it("fails closed without RLS env and rejects bare Prisma bypass mode", async () => {
    assert.throws(
      () =>
        modules.worker.createDistillRuntimePersistenceProviderFromEnv({
          env: { UZMAX_DISTILL_RUNTIME_MODE: "rls_prisma_gateway" }
        }),
      /UZMAX_RLS_DATABASE_URL is required for Prisma runtime/
    );
    assert.throws(
      () =>
        modules.worker.createDistillRuntimePersistenceProviderFromEnv({
          env: { UZMAX_DISTILL_RUNTIME_MODE: "prisma_gateway" }
        }),
      /must use RLS Prisma gateway/
    );
    const previous = process.env.UZMAX_RLS_DATABASE_URL;
    delete process.env.UZMAX_RLS_DATABASE_URL;
    await assert.rejects(
      () => runM5rDistillSchedulerHealthTrueDbSmoke(),
      /UZMAX_RLS_DATABASE_URL is required/
    );
    restoreEnv("UZMAX_RLS_DATABASE_URL", previous);
  });

  it("documents DB/RLS boundaries and M5R-03 status", () => {
    assert.match(source.runtime, /createRlsTransactionContext/);
    assert.match(source.runtime, /distill runtime env must use RLS Prisma gateway/);
    assert.match(source.contracts, /createDailyDistillCandidateSelection/);
    assert.match(source.contracts, /summarizeSevenDayDistillPassRate/);
    assert.match(source.contracts, /createDistillOwnerAlertDraft/);
    assert.match(source.runtime, /createManualDistillRecoveryAuditContract/);
    assert.match(source.smoke, /readRlsDatabaseUrl/);
    assert.match(source.smoke, /runRlsProbeWithoutContext/);
    assert.match(source.wrapper, /runM5rDistillSchedulerHealthTrueDbSmoke/);
    assert.match(
      docs,
      /(?=.*M5R-03 Distill Scheduler \+ Health Runtime)(?=.*changed source files <= 10, net source LOC <= 650)(?=.*distill_runtime_contract_passed_true_db_blocked_missing_env_not_owner_accepted)(?=.*No Sensitive Data Statement)(?=.*distill_scheduler_health_runtime_supported_not_owner_accepted)/s
    );
  });
});

function fakePrisma() {
  const fake = {
    createdAudits: [],
    createdItems: [],
    createdRuns: [],
    healthRows: [],
    transactions: [],
    updatedHealth: [],
    upsertedHealth: []
  };
  fake.auditLog = { create: async ({ data }) => (fake.createdAudits.push(data), data) };
  fake.confirmationItem = {
    create: async ({ data }) => (fake.createdItems.push(data), data)
  };
  fake.distillRun = { create: async ({ data }) => (fake.createdRuns.push(data), data) };
  fake.distillHealthDaily = {
    findFirst: async () => fake.healthRows[0] ?? null,
    update: async (args) => (
      fake.updatedHealth.push(args),
      { ...fake.healthRows[0], ...args.data }
    ),
    upsert: async (args) => (fake.upsertedHealth.push(args), args.create)
  };
  fake.$executeRawUnsafe = async (sql) => {
    return { kind: "role", sql };
  };
  fake.$queryRaw = async (_strings, key, value) => {
    return { key, kind: "set_config", value };
  };
  fake.$transaction = async (steps) => {
    const completedSteps = [];
    for (const step of steps) {
      completedSteps.push(await step);
    }
    fake.transactions.push(completedSteps);
    return completedSteps;
  };
  return fake;
}

function loadText(relativePath) {
  return readFileSync(new URL(relativePath, repoRootUrl), "utf8");
}

function restoreEnv(name, value) {
  if (typeof value === "string") {
    process.env[name] = value;
    return;
  }
  Reflect.deleteProperty(process.env, name);
}
