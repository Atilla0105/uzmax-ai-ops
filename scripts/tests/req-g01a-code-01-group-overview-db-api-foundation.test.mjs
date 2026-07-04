import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import {
  dataModule,
  loadTypescript,
  runReqG01aCode01GroupOverviewDbApiFoundationSmoke,
  transpile,
  transpileText
} from "../../packages/db/scripts/tests/run-req-g01a-code-01-group-overview-db-api-foundation-smoke.mjs";

const repoRoot = process.cwd();
const ORG_ID = "11111111-1111-4111-8111-111111111701";
const TENANT_A = "22222222-2222-4222-8222-222222222701";
const TENANT_B = "33333333-3333-4333-8333-333333333701";
const TENANT_C = "44444444-4444-4444-8444-444444444701";
const USER_ID = "55555555-5555-4555-8555-555555555701";
const source = {
  appModule: read("apps/api/src/app.module.ts"),
  contracts: read("apps/api/src/group-overview.contracts.ts"),
  controller: read("apps/api/src/group-overview.controller.ts"),
  evidence: read("docs/evidence/M7/REQ-G01A-code-01-group-overview-db-api-foundation.md"),
  ledger: read("docs/admin-ui-page-migration-ledger.md"),
  readme: read("docs/evidence/M7/README.md"),
  repository: read("apps/api/src/group-overview.repository.ts"),
  runtime: read("apps/api/src/group-overview.runtime.ts"),
  service: read("apps/api/src/group-overview.service.ts"),
  smoke: read("packages/db/scripts/tests/run-req-g01a-code-01-group-overview-db-api-foundation-smoke.mjs"),
  spec: read("docs/specs/REQ-G01A-code-01-group-overview-db-api-foundation.md")
};
const api = await importGroupOverviewModules();

describe("REQ-G01A-code-01 group overview DB/API foundation", () => {
  it("wires the guarded endpoint and disabled-by-default runtime provider", () => {
    assert.match(source.controller, /@(?:nest\.)?Controller\("group-overview"\)/);
    assert.match(source.controller, /@(?:nest\.)?UseGuards\(ApiAccessContextGuard\)/);
    assert.match(source.controller, /@(?:nest\.)?Get\(\)/);
    assert.match(source.contracts, /GROUP_OVERVIEW_PERMISSION = "group:overview:read"/);
    assert.match(
      source.service,
      /assertPermission\(access, GROUP_OVERVIEW_PERMISSION\)/
    );
    assert.match(api.serviceOutput, /design:paramtypes/);
    assert.doesNotMatch(api.serviceOutput, /design:paramtypes.*Function/);
    assert.match(source.runtime, /UZMAX_GROUP_OVERVIEW_RUNTIME_MODE/);
    assert.match(source.contracts, /"rls_prisma_gateway"/);
    assert.match(source.runtime, /readGroupOverviewRuntimeMode\(env\)/);
    assert.match(source.appModule, /GroupOverviewController/);
    assert.match(source.appModule, /GroupOverviewService/);
    assert.match(source.appModule, /GROUP_OVERVIEW_REPOSITORY/);
    assert.doesNotMatch(
      `${source.controller}\n${source.service}`,
      /apps\/admin|GroupOverviewPage|fixture|local tenant/i
    );
  });

  it("validates query/runtime contracts and forbidden raw fields", () => {
    assert.deepEqual(api.contracts.parseGroupOverviewQuery({ window_hours: "48" }), {
      windowHours: 48
    });
    assert.throws(
      () => api.contracts.parseGroupOverviewQuery({ org_id: ORG_ID }),
      /org_id is not a supported group overview query field/
    );
    assert.throws(
      () => api.contracts.parseGroupOverviewQuery({ tenant_id: TENANT_A }),
      /tenant_id is not a supported group overview query field/
    );
    assert.throws(
      () => api.contracts.parseGroupOverviewQuery({ customerName: "plaintext" }),
      /forbidden raw field/
    );
    assert.throws(() => api.contracts.assertNoForbiddenPayload({ tenants: [{ prompt: "x" }] }), /forbidden raw field/);
    assert.equal(api.contracts.readGroupOverviewRuntimeMode({}), "disabled");
    assert.throws(
      () =>
        api.contracts.readGroupOverviewRuntimeMode({
          UZMAX_GROUP_OVERVIEW_RUNTIME_MODE: "prisma_gateway"
        }),
      /must use RLS Prisma gateway/
    );
    const disabled = api.runtime.createGroupOverviewRepositoryProviderFromEnv({
      env: {}
    });
    assert.equal(disabled.runtimeStatus(), "disabled");
  });

  it("rejects separator variants of forbidden raw field keys", () => {
    for (const key of [
      "external_user_id",
      "customer_display_name",
      "provider_response",
      "storage_url"
    ]) {
      assert.throws(
        () => api.contracts.assertNoForbiddenPayload({ [key]: "safe-ref" }),
        /forbidden raw field/
      );
    }
  });

  it("references the true DB smoke harness without running it", () => {
    assert.equal(typeof runReqG01aCode01GroupOverviewDbApiFoundationSmoke, "function");
    assert.match(source.smoke, /UZMAX_RLS_DATABASE_URL is required/);
    assert.match(source.smoke, /createGroupOverviewRepositoryProviderFromEnv/);
    assert.match(source.smoke, /assertNoForbiddenPayload/);
    assert.match(source.evidence, /not_run_missing_UZMAX_RLS_DATABASE_URL/);
  });

  it("returns an honest disabled state only after permission assertion", async () => {
    const service = new api.service.GroupOverviewService(
      api.runtime.createGroupOverviewRepositoryProviderFromEnv({ env: {} })
    );
    const response = await service.getOverview(context([TENANT_A]), {
      windowHours: 24
    });
    assert.equal(response.state.kind, "disabled");
    assert.deepEqual(response.tenants, []);
    assert.deepEqual(response.sourceWatermark.partialSources, [
      "read_model_refresh_not_configured",
      "read_model_unavailable"
    ]);
    await assert.rejects(
      () => service.getOverview({ ...context([TENANT_A]), permissions: [] }, { windowHours: 24 }),
      /permission is not granted/
    );
  });

  it("runs one RLS transaction per authorized tenant and omits unauthorized tenants", async () => {
    const fake = fakePrisma();
    const repository = api.runtime.createGroupOverviewRepositoryProviderFromEnv({
      mode: "rls_prisma_gateway",
      prismaClient: fake
    });
    const service = new api.service.GroupOverviewService(repository);

    const response = await service.getOverview(context([TENANT_A, TENANT_B]), {
      windowHours: 24
    });

    assert.equal(response.state.kind, "partial_source");
    assert.deepEqual(response.tenants.map((row) => row.tenantId), [
      TENANT_A,
      TENANT_B
    ]);
    assert.equal(JSON.stringify(response).includes(TENANT_C), false);
    assert.equal(response.tenants[0].healthCategory, "breaker");
    assert.equal(response.tenants[0].sessions, 10);
    assert.equal(response.tenants[0].humanNeeded, 12);
    assert.equal(response.tenants[0].handoffRateBps, 10000);
    assert.equal(response.tenants[0].evalStatus, "failed");
    assert.equal(response.sourceWatermark.maxSourceUpdatedAt, null);
    assert.equal(response.tenants[0].sourceWatermark.maxSourceUpdatedAt, null);
    assert.equal(response.tenants[1].sourceWatermark.maxSourceUpdatedAt, null);
    assert.equal(response.tenants[0].redlineEventCountToday, null);
    assert.equal(response.tenants[0].businessLine, null);
    assert.equal(response.tenants[0].lastAbnormalAggregateEvent, null);
    assert.match(
      response.tenants[0].sourceWatermark.partialSources.join(","),
      /business_line_source_unavailable/
    );
    assert.match(
      response.tenants[0].sourceWatermark.partialSources.join(","),
      /redline_source_unavailable/
    );
    assert.match(
      response.tenants[0].sourceWatermark.partialSources.join(","),
      /source_partial/
    );
    assert.deepEqual(fake.transactions.map((tx) => tx.slice(0, 3)), [
      rlsSetup(TENANT_A),
      rlsSetup(TENANT_B)
    ]);
    const tenantAOps = fake.transactions[0].slice(3);
    const handoffOp = tenantAOps.find(
      (op) => op.delegate === "channelConversation" && op.args.where.status
    );
    assert.deepEqual(handoffOp.args.where.status, {
      in: ["HANDOFF", "PENDING_HANDOFF"]
    });
    const evalGateOp = tenantAOps.find((op) => op.delegate === "evalGate");
    assert.equal(evalGateOp.args.where.targetKind, "group_overview");
    assert.equal(
      evalGateOp.args.where.targetRef,
      `controlled://group-overview/${TENANT_A}`
    );
    assert.equal(
      tenantAOps.some(
        (op) => op.delegate === "supportTicket" && !("slaDueAt" in op.args.where)
      ),
      false
    );
    assert.doesNotMatch(
      JSON.stringify(response),
      /customerName|phone|telegramUsername|prompt|completion|providerId|queryRef|externalAccountRef/
    );
  });

  it("reports incomplete Prisma delegates as the intended unavailable runtime", async () => {
    const fake = fakePrisma();
    delete fake.tenant;
    const repository = api.runtime.createGroupOverviewRepositoryProviderFromEnv({
      mode: "rls_prisma_gateway",
      prismaClient: fake
    });

    await assert.rejects(
      () => repository.listTenantAggregates(context([TENANT_A]), windowFixture()),
      /group overview Prisma delegate is incomplete/
    );
  });

  it("documents no schema/admin wiring and the remaining runtime blockers", () => {
    assert.doesNotMatch(source.appModule, /apps\/admin/);
    assert.match(source.repository, /createRlsTransactionContext/);
    assert.match(source.repository, /for \(const tenantId of/);
    assert.doesNotMatch(
      source.repository,
      /service[_-]?role|bypass|set local role public/i
    );
    assert.match(
      `${source.evidence}\n${source.readme}\n${source.ledger}`,
      /code_01_db_api_foundation_implemented/
    );
    assert.match(source.evidence, /schema\.prisma.*not touched/s);
    assert.match(source.evidence, /admin wiring remains out of scope/i);
  });
});

async function importGroupOverviewModules() {
  const ts = await loadTypescript();
  const nestCommon = dataModule(`
export function Inject() { return () => undefined; }
export function Injectable() { return () => undefined; }
`);
  const prismaRuntime = dataModule(`
export function createUzmaxPrismaClientFromEnv() {
  throw new Error("UZMAX_RLS_DATABASE_URL is required for Prisma runtime");
}
`);
  const authz = transpile(ts, "packages/authz/src/index.ts");
  const db = transpile(ts, "packages/db/src/index.ts");
  const contracts = transpile(ts, "apps/api/src/group-overview.contracts.ts");
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
  const serviceReplacements = {
    "@nestjs/common": nestCommon,
    "../../../packages/authz/src/index.ts": authz,
    "./group-overview.contracts.ts": contracts,
    "./group-overview.repository.ts": repository
  };
  const serviceOutput = transpileText(
    ts,
    "apps/api/src/group-overview.service.ts",
    serviceReplacements
  );
  const service = dataModule(serviceOutput);
  return {
    contracts: await import(contracts),
    repository: await import(repository),
    runtime: await import(runtime),
    service: await import(service),
    serviceOutput
  };
}

function context(tenantIds) {
  return {
    membershipVersion: 1,
    orgId: ORG_ID,
    permissions: ["group:overview:read"],
    selectedTenantId: tenantIds[0],
    tenantIds,
    userId: USER_ID
  };
}

function fakePrisma() {
  const fake = { transactions: [] };
  const delegate = (name) => ({
    count: (args) => op(name, "count", args, countResult(name, args)),
    findFirst: (args) => op(name, "findFirst", args, findFirstResult(name, args))
  });
  for (const name of [
    "aiMember",
    "channelConversation",
    "evalGate",
    "supportTicket",
    "tenant"
  ]) {
    fake[name] = delegate(name);
  }
  fake.$executeRawUnsafe = (sql) => ({ kind: "role", sql });
  fake.$queryRaw = (_strings, key, value) => ({ key, kind: "set_config", value });
  fake.$transaction = async (steps) => {
    fake.transactions.push(steps);
    return steps.map((step) => step.result ?? step);
  };
  return fake;
}

function op(delegate, method, args, result) {
  return { args, delegate, kind: `${delegate}.${method}`, result };
}

function rlsSetup(tenantId) {
  return [
    { kind: "role", sql: 'set local role "uzmax_app_runtime"' },
    { key: "app.org_id", kind: "set_config", value: ORG_ID },
    { key: "app.tenant_id", kind: "set_config", value: tenantId }
  ];
}

function countResult(name, { where }) {
  if (where.tenantId === TENANT_B) return 0;
  if (name === "channelConversation") return where.status ? 12 : 10;
  if (name === "supportTicket") return where.slaDueAt ? 1 : 99;
  if (name === "aiMember") return 1;
  return 0;
}

function findFirstResult(name, { where }) {
  const tenantId = where.tenantId ?? where.id;
  if (tenantUnavailable(tenantId, name)) return null;
  const updatedAt = new Date("2026-07-04T09:00:00.000Z");
  return (
    {
      aiMember: () => ({ id: "ai-breaker", memberKey: "ai", updatedAt }),
      channelConversation: () => ({
        id: "conversation-handoff",
        updatedAt: new Date("2026-07-04T10:00:00.000Z")
      }),
      evalGate: () => evalGateResult(where, updatedAt),
      tenant: () => tenantResult(where.id, updatedAt)
    }[name]?.() ?? null
  );
}

function tenantUnavailable(tenantId, name) {
  return tenantId === TENANT_C || (tenantId === TENANT_B && name !== "tenant");
}

function tenantResult(id, updatedAt) {
  return {
    id,
    name: id === TENANT_A ? "Tenant A" : "Tenant B",
    slug: id === TENANT_A ? "tenant-a" : "tenant-b",
    status: "ACTIVE",
    updatedAt
  };
}

function evalGateResult(where, updatedAt) {
  if (
    where.targetKind === "group_overview" &&
    where.targetRef === `controlled://group-overview/${where.tenantId}`
  ) {
    return { id: "eval", status: "FAILED", updatedAt };
  }
  return { id: "unrelated-eval", status: "BLOCKED", updatedAt };
}

function windowFixture() {
  return {
    end: "2026-07-04T12:00:00.000Z",
    start: "2026-07-03T12:00:00.000Z"
  };
}

function read(filePath) {
  return readFileSync(path.join(repoRoot, filePath), "utf8");
}
