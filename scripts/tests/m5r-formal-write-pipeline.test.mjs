import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { describe, it } from "node:test";

import { compileApiRuntime } from "../../apps/api/scripts/runtime-compiler.mjs";
import { runM5rFormalWriteTrueDbSmoke } from "../../packages/db/scripts/run-m5r-formal-write-true-db-smoke.mjs";

const repoRoot = process.cwd();
const ORG_ID = "11111111-1111-4111-8111-111111111502";
const TENANT_ID = "22222222-2222-4222-8222-222222222502";
const USER_ID = "44444444-4444-4444-8444-444444444502";
const ITEM_APPROVE = "55555555-5555-4555-8555-555555555502";
const ITEM_DISCARD = "55555555-5555-4555-8555-555555555512";
const PREVIOUS_CONFIG = "66666666-6666-4666-8666-666666666502";
const TARGET_REF = "controlled://config-version/business_config/m5r-02-approved";

const runtime = await importConfirmationQueueModules();
const source = {
  appModule: read("apps/api/src/app.module.ts"),
  compiler: read("apps/api/scripts/runtime-compiler.mjs"),
  contracts: read("apps/api/src/confirmation-queue.formal-write-contracts.ts"),
  formalWrite: read("apps/api/src/confirmation-queue.formal-write.ts"),
  mapper: read("apps/api/src/confirmation-queue.prisma-mapper.ts"),
  service: read("apps/api/src/confirmation-queue.service.ts"),
  smoke: read("packages/db/scripts/tests/run-m5r-formal-write-true-db-smoke.mjs"),
  wrapper: read("packages/db/scripts/run-m5r-formal-write-true-db-smoke.mjs")
};
const docs = [
  read("docs/specs/M5R-02-formal-write-pipeline.md"),
  read("docs/evidence/M5R/M5R-02-formal-write-pipeline.md"),
  read("docs/evidence/M5R/README.md")
].join("\n");

describe("M5R-02 formal write pipeline", () => {
  it("wires a disabled-by-default formal write pipeline into confirmation decisions", () => {
    assert.match(source.appModule, /CONFIRMATION_FORMAL_WRITE_PIPELINE/);
    assert.match(
      source.appModule,
      /createConfirmationFormalWritePipelineProviderFromEnv/
    );
    assert.doesNotMatch(source.appModule, /process\.env/);
    assert.match(source.compiler, /confirmation-queue\.formal-write/);
    assert.match(source.compiler, /confirmation-queue\.formal-write-contracts/);
    assert.match(source.service, /formalWritePipeline\.apply/);
    assert.match(source.mapper, /auditLogId/);
    assert.match(
      source.formalWrite,
      /formal write env runtime must use RLS Prisma gateway/
    );
    assert.match(source.formalWrite, /createRlsTransactionContext/);
    assert.match(source.contracts, /createConfigVersionContract/);
    assert.match(source.contracts, /createAuditLogContract/);
    assert.match(source.smoke, /readRlsDatabaseUrl/);
    assert.match(source.smoke, /UZMAX_RLS_DATABASE_URL/);
    assert.match(source.wrapper, /runM5rFormalWriteTrueDbSmoke/);
    assert.match(
      docs,
      /(?=.*M5R-02 Formal Write Pipeline)(?=.*config_version)(?=.*audit_log)(?=.*formal_write_contract_passed_true_db_blocked_missing_env_not_owner_accepted)/s
    );
  });

  it("keeps default in-memory decisions as no formal write", async () => {
    const repository = new runtime.repository.InMemoryConfirmationQueueRepository({
      items: [queueItem(ITEM_APPROVE, "knowledge_candidate")]
    });
    const service = new runtime.service.ConfirmationQueueService(repository);

    const result = await service.applyDecision(context(), {
      action: "approve",
      itemId: ITEM_APPROVE,
      reasonRef: "controlled://confirmation/m5r-02/default"
    });

    assert.equal(result.formalWrite, false);
    assert.equal(result.auditDraft.formalWrite, false);
    assert.equal(result.item.status, "approved");
    assert.equal(result.item.auditLogId, undefined);
  });

  it("creates config version, audit log and confirmation metadata inside RLS transactions", async () => {
    const fake = fakePrisma();
    const repository = new runtime.repository.InMemoryConfirmationQueueRepository({
      items: [
        queueItem(ITEM_APPROVE, "conflict_candidate", {
          diffPayload: sideBySideDiff()
        })
      ]
    });
    seedPrismaConfirmationRow(
      fake,
      queueItem(ITEM_APPROVE, "conflict_candidate", {
        diffPayload: sideBySideDiff()
      })
    );
    fake.configRows.push({
      id: PREVIOUS_CONFIG,
      key: "m5r-02-approved",
      orgId: ORG_ID,
      tenantId: TENANT_ID,
      version: 1
    });
    const formalWrite =
      runtime.formalWrite.createConfirmationFormalWritePipelineProviderFromEnv({
        mode: "rls_prisma_gateway",
        prismaClient: fake
      });
    const service = new runtime.service.ConfirmationQueueService(
      repository,
      formalWrite
    );

    const result = await service.applyDecision(context(), {
      action: "approve",
      itemId: ITEM_APPROVE,
      reasonRef: "controlled://confirmation/m5r-02/approve"
    });

    assert.equal(result.formalWrite, true);
    assert.equal(result.auditDraft.targetRef, TARGET_REF);
    assert.equal(result.item.auditLogId, result.auditDraft.auditLogId);
    assert.equal(fake.createdConfigs[0].version, 2);
    assert.equal(fake.createdConfigs[0].previousVersionId, PREVIOUS_CONFIG);
    assert.equal(fake.createdAudits[0].content.after.confirmerUserId, USER_ID);
    assert.equal(fake.createdAudits[0].content.after.targetRef, TARGET_REF);
    assert.deepEqual(fake.transactions[0].slice(0, 3), [
      { kind: "role", sql: 'set local role "uzmax_app_runtime"' },
      { key: "app.org_id", kind: "set_config", value: ORG_ID },
      { key: "app.tenant_id", kind: "set_config", value: TENANT_ID }
    ]);
    assert.equal(fake.updatedItems[0].metadata.formalWrite.status, "written");
  });

  it("does not write for pending/discarded/blocked and rechecks conflict diff", async () => {
    const fake = fakePrisma();
    const repository = new runtime.repository.InMemoryConfirmationQueueRepository({
      items: [
        queueItem(ITEM_DISCARD, "knowledge_candidate"),
        queueItem(ITEM_APPROVE, "conflict_candidate")
      ]
    });
    seedPrismaConfirmationRow(fake, queueItem(ITEM_DISCARD, "knowledge_candidate"));
    const formalWrite =
      runtime.formalWrite.createConfirmationFormalWritePipelineProviderFromEnv({
        mode: "rls_prisma_gateway",
        prismaClient: fake
      });
    const service = new runtime.service.ConfirmationQueueService(
      repository,
      formalWrite
    );

    const discarded = await service.applyDecision(context(), {
      action: "discard",
      itemId: ITEM_DISCARD
    });
    assert.equal(discarded.formalWrite, false);
    assert.equal(fake.createdConfigs.length, 0);
    await assert.rejects(
      () =>
        service.applyDecision(context(), {
          action: "approve",
          itemId: ITEM_APPROVE,
          reasonRef: "controlled://confirmation/m5r-02/no-diff"
        }),
      /conflict candidate requires side-by-side diff payload/
    );
    await assert.rejects(
      () =>
        formalWrite.apply({
          accessContext: context(),
          auditDraft: { formalWrite: false },
          decision: {
            action: "approve",
            itemId: ITEM_APPROVE,
            reasonRef: "controlled://confirmation/m5r-02/recheck"
          },
          item: { ...queueItem(ITEM_APPROVE, "conflict_candidate"), status: "approved" }
        }),
      /formal write requires side-by-side diff payload/
    );
    assert.equal(fake.createdAudits.length, 0);
  });

  it("fails closed without RLS env and rejects bare Prisma bypass mode", async () => {
    assert.throws(
      () =>
        runtime.formalWrite.createConfirmationFormalWritePipelineProviderFromEnv({
          env: { UZMAX_CONFIRMATION_FORMAL_WRITE_MODE: "rls_prisma_gateway" }
        }),
      /UZMAX_RLS_DATABASE_URL is required for Prisma runtime/
    );
    assert.throws(
      () =>
        runtime.formalWrite.createConfirmationFormalWritePipelineProviderFromEnv({
          env: { UZMAX_CONFIRMATION_FORMAL_WRITE_MODE: "prisma_gateway" }
        }),
      /must use RLS Prisma gateway/
    );
    const previous = process.env.UZMAX_RLS_DATABASE_URL;
    delete process.env.UZMAX_RLS_DATABASE_URL;
    await assert.rejects(
      () => runM5rFormalWriteTrueDbSmoke(),
      /UZMAX_RLS_DATABASE_URL is required/
    );
    restoreEnv("UZMAX_RLS_DATABASE_URL", previous);
  });
});

async function importConfirmationQueueModules() {
  const outDir = await compileApiRuntime();
  const baseUrl = `${pathToFileURL(outDir).href}/`;
  const importModule = (fileName) => import(`${baseUrl}${fileName}.mjs`);
  const [formalWrite, repository, service] = await Promise.all([
    importModule("confirmation-queue.formal-write"),
    importModule("confirmation-queue.repository"),
    importModule("confirmation-queue.service")
  ]);
  return { formalWrite, repository, service };
}

function queueItem(id, kind, overrides = {}) {
  return {
    candidatePayload: {
      candidateRef: `controlled://candidate/${id}`,
      summaryRef: `controlled://candidate-summary/${id}`
    },
    createdAt: "2026-06-24T12:00:00.000Z",
    diffPayload: {},
    id,
    kind,
    metadata: { synthetic_spec: "M5R-02" },
    orgId: ORG_ID,
    sourceRef: `controlled://distill/source/${id}`,
    status: "pending",
    targetKind: "config_version",
    targetRef: TARGET_REF,
    tenantId: TENANT_ID,
    ...overrides
  };
}

function context() {
  return {
    membershipVersion: 1,
    orgId: ORG_ID,
    permissions: ["confirmation:read", "confirmation:write"],
    selectedTenantId: TENANT_ID,
    tenantIds: [TENANT_ID],
    userId: USER_ID
  };
}

function fakePrisma() {
  const fake = {
    configRows: [],
    createdAudits: [],
    createdConfigs: [],
    rows: [],
    transactions: [],
    updatedItems: []
  };
  fake.configVersion = {
    create: async ({ data }) => {
      fake.createdConfigs.push(data);
      fake.configRows.push(data);
      return data;
    },
    findFirst: async ({ where }) =>
      fake.configRows
        .filter((row) => row.key === where.key && row.orgId === where.orgId)
        .sort((left, right) => right.version - left.version)[0] ?? null
  };
  fake.auditLog = {
    create: async ({ data }) => {
      fake.createdAudits.push(data);
      return data;
    }
  };
  fake.confirmationItem = {
    update: async ({ data, where }) => {
      const row = fake.rows.find((entry) => entry.id === where.id);
      Object.assign(row, data, { updatedAt: new Date("2026-06-24T12:01:00Z") });
      fake.updatedItems.push(row);
      return row;
    }
  };
  fake.$executeRawUnsafe = (sql) => Promise.resolve({ kind: "role", sql });
  fake.$queryRaw = (_strings, key, value) =>
    Promise.resolve({ key, kind: "set_config", value });
  fake.$transaction = async (operations) => {
    const result = await Promise.all(operations);
    fake.transactions.push(result);
    return result;
  };
  return fake;
}

function seedPrismaConfirmationRow(fake, item) {
  fake.rows.push({
    auditLogId: null,
    candidatePayload: item.candidatePayload,
    createdAt: new Date(item.createdAt),
    diffPayload: item.diffPayload,
    id: item.id,
    kind: item.kind.toUpperCase(),
    metadata: item.metadata,
    orgId: item.orgId,
    reviewedAt: null,
    reviewedByUserId: null,
    sourceRef: item.sourceRef,
    status: "PENDING",
    targetKind: item.targetKind,
    targetRef: item.targetRef,
    tenantId: item.tenantId
  });
}

function sideBySideDiff() {
  return {
    left: { ref: "controlled://config/current" },
    right: { ref: "controlled://candidate/new" },
    summaryRef: "controlled://diff/m5r-02"
  };
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function restoreEnv(name, value) {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}
