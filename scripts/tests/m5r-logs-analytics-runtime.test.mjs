import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { describe, it } from "node:test";

import { compileApiRuntime } from "../../apps/api/scripts/runtime-compiler.mjs";
import { runM5rLogsAnalyticsTrueDbSmoke } from "../../packages/db/scripts/run-m5r-logs-analytics-true-db-smoke.mjs";

const ORG_ID = "11111111-1111-4111-8111-111111111505";
const TENANT_ID = "22222222-2222-4222-8222-222222222505";
const USER_ID = "44444444-4444-4444-8444-444444444505";
const MEMBER_ID = "55555555-5555-4555-8555-555555555505";
const runtime = await importLogsAnalyticsRuntime();
const source = {
  appModule: read("apps/api/src/app.module.ts"),
  compiler: read("apps/api/scripts/runtime-compiler.mjs"),
  contracts: read("apps/api/src/logs-analytics-runtime.contracts.ts"),
  evidence: read("docs/evidence/M5R/M5R-05-logs-analytics-runtime.md"),
  m5rIndex: read("docs/evidence/M5R/README.md"),
  migration: read("packages/db/migrations/0008_m5r05_logs_analytics_runtime.sql"),
  repository: read("apps/api/src/logs-analytics-runtime.repository.ts"),
  schema: read("packages/db/prisma/schema.prisma"),
  smoke: read("packages/db/scripts/tests/run-m5r-logs-analytics-true-db-smoke.mjs"),
  spec: read("docs/specs/M5R-05-logs-analytics-runtime.md")
};

describe("M5R-05 logs analytics runtime", () => {
  it("adds only minimal missing log/export schema with RLS and no metric_daily", () => {
    for (const table of ["login_log", "presence_log", "export_job"]) {
      assert.match(source.schema, new RegExp(`@@map\\("${table}"\\)`));
      assert.match(source.migration, /force row level security/);
      assert.match(
        source.migration,
        new RegExp(`grant select, insert on table ${table}`)
      );
      assert.doesNotMatch(
        source.migration,
        new RegExp(`grant delete on table ${table}`)
      );
    }
    assert.doesNotMatch(source.schema, /model MetricDaily/);
    assert.doesNotMatch(source.migration, /metric_daily/);
  });

  it("wires disabled-by-default API runtime and rejects non-RLS mode", async () => {
    assert.match(source.appModule, /LogsAnalyticsRuntimeController/);
    assert.match(
      source.appModule,
      /createLogsAnalyticsRuntimeRepositoryProviderFromEnv/
    );
    assert.match(source.compiler, /importApiLogsAnalyticsRuntimeModules/);
    assert.match(source.repository, /createRlsTransactionContext/);
    assert.match(
      source.contracts,
      /logs analytics runtime env must use RLS Prisma gateway/
    );

    const disabled = runtime.createLogsAnalyticsRuntimeRepositoryProviderFromEnv({
      env: {}
    });
    await assert.rejects(() => disabled.getBoard(context()), /not configured/);
    assert.throws(
      () =>
        runtime.createLogsAnalyticsRuntimeRepositoryProviderFromEnv({
          env: { UZMAX_LOGS_ANALYTICS_RUNTIME_MODE: "rls_prisma_gateway" }
        }),
      /UZMAX_RLS_DATABASE_URL is required/
    );
    assert.throws(
      () =>
        runtime.createLogsAnalyticsRuntimeRepositoryProviderFromEnv({
          env: { UZMAX_LOGS_ANALYTICS_RUNTIME_MODE: "prisma_gateway" }
        }),
      /must use RLS Prisma gateway/
    );
  });

  it("reads logs, derives fixed board values and creates controlled export drafts", async () => {
    const fake = fakePrisma();
    const repository = runtime.createLogsAnalyticsRuntimeRepositoryProviderFromEnv({
      mode: "rls_prisma_gateway",
      prismaClient: fake
    });

    const login = await repository.listLoginLogs(context(), {
      limit: 10,
      memberUserId: MEMBER_ID,
      type: "password"
    });
    const presence = await repository.listPresenceLogs(context(), {
      limit: 10,
      status: "online"
    });
    const operation = await repository.listOperationLogs(context(), {
      limit: 10,
      memberUserId: MEMBER_ID,
      module: "config"
    });
    assert.equal(login[0].loginType, "password");
    assert.equal(presence[0].status, "online");
    assert.equal(operation[0].highRisk, true);
    assert.equal("objectId" in operation[0], false);
    assert.equal("memberUserId" in fake.auditFindManyArgs.where, false);

    const board = await repository.getBoard(context());
    assert.equal(board.confirmationQueuePassRateBps, 5000);
    assert.equal(board.distillFrequency, "weekly");
    assert.equal(board.distillPassRateBps, 5000);
    assert.equal(board.aiMemberStatusCounts.online, 1);

    const draft = await repository.createExportDraft(context(), {
      filters: { module: "config" },
      logKinds: ["login", "presence", "operation"],
      metricRefs: ["controlled://metric/confirmation-pass-rate"],
      reasonRef: "controlled://export/m5r-05/reason",
      scope: { tenantId: TENANT_ID }
    });
    assert.equal(draft.formalExportWrite, false);
    assert.equal(draft.requiresOwnerConfirmation, true);
    assert.equal(draft.fileRef, null);
    assert.equal(fake.exports[0].fileRef, null);
    assert.deepEqual(fake.exports[0].metadata.logKinds, [
      "login",
      "presence",
      "operation"
    ]);
    assert.deepEqual(fake.transactions.at(-1).slice(0, 3), [
      { kind: "role", sql: 'set local role "uzmax_app_runtime"' },
      { key: "app.org_id", kind: "set_config", value: ORG_ID },
      { key: "app.tenant_id", kind: "set_config", value: TENANT_ID }
    ]);
  });

  it("fails closed for unsafe export draft inputs and missing true DB env", async () => {
    assert.throws(
      () =>
        runtime.exportDraftInput({
          filters: { rawPayload: "do-not-export" },
          logKinds: ["login"],
          metricRefs: ["controlled://metric/confirmation-pass-rate"],
          reasonRef: "controlled://export/m5r-05/reason",
          scope: { tenantId: TENANT_ID }
        }),
      /forbidden/
    );
    assert.throws(
      () =>
        runtime.exportDraftInput({
          filters: {},
          logKinds: ["message"],
          metricRefs: ["controlled://metric/confirmation-pass-rate"],
          reasonRef: "controlled://export/m5r-05/reason",
          scope: { tenantId: TENANT_ID }
        }),
      /unsupported log kind/
    );
    const previous = process.env.UZMAX_RLS_DATABASE_URL;
    delete process.env.UZMAX_RLS_DATABASE_URL;
    await assert.rejects(
      () => runM5rLogsAnalyticsTrueDbSmoke(),
      /UZMAX_RLS_DATABASE_URL is required/
    );
    restoreEnv("UZMAX_RLS_DATABASE_URL", previous);
  });

  it("documents status, no sensitive exports and DB/RLS smoke boundaries", () => {
    assert.match(source.smoke, /same-tenant|wrong-tenant|missing-context/s);
    assert.match(source.smoke, /readRlsDatabaseUrl/);
    assert.match(
      `${source.spec}\n${source.evidence}\n${source.m5rIndex}`,
      /(?=.*M5R-05 Logs \+ Analytics Runtime)(?=.*No Sensitive Data Statement)(?=.*login_presence_operation_logs_runtime_supported_not_full_logs_center_closed)(?=.*runtime_contract_passed_true_db_blocked_missing_env_not_owner_accepted)/s
    );
  });
});

async function importLogsAnalyticsRuntime() {
  const outDir = await compileApiRuntime({
    outDir: path.join(process.cwd(), "node_modules/.cache/uzmax-api-runtime-m5r-05")
  });
  const [contracts, api] = await Promise.all([
    import(
      `${pathToFileURL(path.join(outDir, "logs-analytics-runtime.contracts.mjs")).href}`
    ),
    import(`${pathToFileURL(path.join(outDir, "logs-analytics-runtime.mjs")).href}`)
  ]);
  return { ...contracts, ...api };
}

function fakePrisma() {
  const fake = {
    auditFindManyArgs: undefined,
    exports: [],
    transactions: []
  };
  fake.loginLog = {
    findMany: async () => [
      { id: "login-1", loginType: "password", memberUserId: MEMBER_ID }
    ]
  };
  fake.presenceLog = {
    findMany: async () => [
      { id: "presence-1", memberUserId: MEMBER_ID, status: "online" }
    ]
  };
  fake.auditLog = {
    findMany: async (args) => {
      fake.auditFindManyArgs = args;
      return [
        {
          action: "saved",
          eventType: "config_version.saved",
          id: "audit-1",
          module: "config",
          objectId: "customer-plain-123",
          objectType: "config_version"
        }
      ];
    }
  };
  fake.confirmationItem = {
    count: async ({ where }) => (where.status.in.length === 2 ? 1 : 2)
  };
  fake.distillHealthDaily = {
    findFirst: async () => ({
      frequency: "WEEKLY",
      sevenDayPassRateBps: 5000
    })
  };
  fake.aiMember = {
    findMany: async () => [{ status: "ONLINE" }, { status: "DISABLED" }]
  };
  fake.exportJob = {
    create: async ({ data }) => {
      const row = {
        ...data,
        createdAt: new Date("2026-06-25T00:00:00.000Z"),
        id: "99999999-9999-4999-8999-999999999505"
      };
      fake.exports.push(row);
      return row;
    }
  };
  fake.$executeRawUnsafe = async (sql) => ({ kind: "role", sql });
  fake.$queryRaw = async (_strings, key, value) => ({ key, kind: "set_config", value });
  fake.$transaction = async (steps) => {
    const completed = [];
    for (const step of steps) completed.push(await step);
    fake.transactions.push(completed);
    return completed;
  };
  return fake;
}

function context() {
  return {
    membershipVersion: 1,
    orgId: ORG_ID,
    permissions: ["logs:read", "logs:export"],
    selectedTenantId: TENANT_ID,
    tenantIds: [TENANT_ID],
    userId: USER_ID
  };
}

function read(file) {
  return readFileSync(file, "utf8");
}

function restoreEnv(name, value) {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}
