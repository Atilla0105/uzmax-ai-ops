import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import ts from "typescript";

import { runM5rConfirmationQueueTrueDbSmoke } from "../../packages/db/scripts/run-m5r-confirmation-queue-true-db-smoke.mjs";

const repoRoot = process.cwd();
const ORG_ID = "11111111-1111-4111-8111-111111111501";
const TENANT_ID = "22222222-2222-4222-8222-222222222501";
const USER_ID = "44444444-4444-4444-8444-444444444501";
const ITEM_ID = "55555555-5555-4555-8555-555555555501";
const DATABASE_URL = "synthetic-db-url-m5r-01";

const appModuleSource = read("apps/api/src/app.module.ts");
const prismaMapperSource = read("apps/api/src/confirmation-queue.prisma-mapper.ts");
const repositorySource = read("apps/api/src/confirmation-queue.repository.ts");
const runtimeSource = read("apps/api/src/confirmation-queue.runtime.ts");
const serviceSource = read("apps/api/src/confirmation-queue.service.ts");
const runtimeCompilerSource = read("apps/api/scripts/runtime-compiler.mjs");
const smokeRunnerSource = read(
  "packages/db/scripts/run-m5r-confirmation-queue-true-db-smoke.mjs"
);
const smokeRunnerSupportSource = read(
  "packages/db/scripts/tests/run-m5r-confirmation-queue-true-db-smoke.mjs"
);
const spec = read("docs/specs/M5R-01-confirmation-queue-persistence.md");
const evidence = read("docs/evidence/M5R/M5R-01-confirmation-queue-persistence.md");
const m5rIndex = read("docs/evidence/M5R/README.md");

const fakePrisma = dataModule(`
globalThis.__m5r01_rows = [];
globalThis.__m5r01_transactions = [];
export class PrismaClient {
  constructor(options) {
    globalThis.__m5r01_prisma_options = options;
    this.confirmationItem = {
      findFirst: async (args) => {
        globalThis.__m5r01_find_first_args = args;
        return selectRows(args.where)[0] ?? null;
      },
      findMany: async (args) => {
        globalThis.__m5r01_find_many_args = args;
        return selectRows(args.where);
      },
      update: async (args) => {
        globalThis.__m5r01_update_args = args;
        const index = globalThis.__m5r01_rows.findIndex((row) => row.id === args.where.id);
        if (index === -1) throw new Error("Record to update not found");
        globalThis.__m5r01_rows[index] = { ...globalThis.__m5r01_rows[index], ...args.data };
        return globalThis.__m5r01_rows[index];
      },
      upsert: async (args) => {
        globalThis.__m5r01_upsert_args = args;
        const index = globalThis.__m5r01_rows.findIndex((row) => row.id === args.where.id);
        const next = {
          ...(index === -1 ? args.create : globalThis.__m5r01_rows[index]),
          ...(index === -1 ? {} : args.update),
          updatedAt: new Date("2026-06-24T12:01:00.000Z")
        };
        if (index === -1) globalThis.__m5r01_rows.push(next);
        else globalThis.__m5r01_rows[index] = next;
        return next;
      }
    };
  }
  $executeRawUnsafe(sql) {
    return Promise.resolve({ kind: "role", sql });
  }
  $queryRaw(strings, ...values) {
    return Promise.resolve({ key: values[0], kind: "set_config", value: values[1] });
  }
  async $transaction(operations) {
    const result = await Promise.all(operations);
    globalThis.__m5r01_transactions.push(result);
    return result;
  }
}
function selectRows(where = {}) {
  return globalThis.__m5r01_rows.filter((row) =>
    Object.entries(where).every(([key, value]) => row[key] === value)
  );
}
`);

const dbIndex = await importTypescriptSource("packages/db/src/index.ts");
const dbRuntime = await importTypescriptSource("packages/db/src/prisma-runtime.ts", {
  "@prisma/client": fakePrisma
});
const repository = await importTypescriptSource(
  "apps/api/src/confirmation-queue.repository.ts"
);
const prismaMapper = await importTypescriptSource(
  "apps/api/src/confirmation-queue.prisma-mapper.ts"
);
const runtime = await importTypescriptSource(
  "apps/api/src/confirmation-queue.runtime.ts",
  {
    "../../../packages/db/src/index.ts": dbIndex.moduleUrl,
    "../../../packages/db/src/prisma-runtime.ts": dbRuntime.moduleUrl,
    "./confirmation-queue.prisma-mapper.ts": prismaMapper.moduleUrl,
    "./confirmation-queue.repository.ts": repository.moduleUrl
  }
);

describe("M5R-01 confirmation queue persistence", () => {
  it("adds explicit RLS runtime wiring while preserving default in-memory mode", () => {
    assert.match(repositorySource, /CONFIRMATION_QUEUE_REPOSITORY/);
    assert.match(runtimeSource, /createConfirmationQueueRlsBatchTransactionRunner/);
    assert.match(runtimeSource, /createRlsTransactionContext/);
    assert.match(runtimeSource, /createUzmaxPrismaClientFromEnv/);
    assert.match(runtimeSource, /RlsPrismaConfirmationQueueRepository/);
    assert.match(prismaMapperSource, /confirmationQueuePrismaKindByApi/);
    assert.match(appModuleSource, /createConfirmationQueueRepositoryProviderFromEnv/);
    assert.match(appModuleSource, /CONFIRMATION_QUEUE_REPOSITORY/);
    assert.doesNotMatch(appModuleSource, /process\.env/);
    assert.match(runtimeCompilerSource, /confirmationQueueRuntimeModules/);
    assert.match(runtimeCompilerSource, /prisma-runtime\.mjs/);
    assert.match(serviceSource, /formalWrite: false/);
    assert.doesNotMatch(
      `${repositorySource}\n${serviceSource}`,
      /kbEntry|kbStage|configVersion|evalCase|evalGate|templateCopy|customer\.update/i
    );
  });

  it("requires explicit RLS Prisma env mode and rejects bypasses", () => {
    const seeded = new repository.module.InMemoryConfirmationQueueRepository({
      items: [item()]
    });
    assert.equal(
      runtime.module.createConfirmationQueueRepositoryProviderFromEnv({
        env: {},
        inMemoryRepository: seeded
      }),
      seeded
    );
    assert.throws(
      () =>
        runtime.module.createConfirmationQueueRepositoryProviderFromEnv({
          env: { UZMAX_CONFIRMATION_QUEUE_REPOSITORY_MODE: "rls_prisma_gateway" }
        }),
      /UZMAX_RLS_DATABASE_URL is required for Prisma runtime/
    );
    assert.throws(
      () =>
        runtime.module.createConfirmationQueueRepositoryProviderFromEnv({
          env: { UZMAX_CONFIRMATION_QUEUE_REPOSITORY_MODE: "prisma_gateway" }
        }),
      /must use RLS Prisma gateway/
    );
  });

  it("runs repository operations inside restricted RLS transaction context", async () => {
    globalThis.__m5r01_rows = [];
    globalThis.__m5r01_transactions = [];
    const provider = runtime.module.createConfirmationQueueRepositoryProviderFromEnv({
      env: {
        UZMAX_CONFIRMATION_QUEUE_REPOSITORY_MODE: "rls_prisma_gateway",
        UZMAX_RLS_DATABASE_URL: DATABASE_URL
      }
    });

    const saved = await provider.saveItem(item());
    const listed = await provider.listItems(contextFor(TENANT_ID), {
      status: "pending"
    });

    assert.equal(saved.kind, "knowledge_candidate");
    assert.equal(saved.status, "pending");
    assert.deepEqual(
      listed.map((entry) => entry.id),
      [ITEM_ID]
    );
    assert.equal(globalThis.__m5r01_prisma_options.datasources.db.url, DATABASE_URL);
    assert.deepEqual(globalThis.__m5r01_transactions[0].slice(0, 3), [
      { kind: "role", sql: 'set local role "uzmax_app_runtime"' },
      { key: "app.org_id", kind: "set_config", value: ORG_ID },
      { key: "app.tenant_id", kind: "set_config", value: TENANT_ID }
    ]);
    assert.deepEqual(globalThis.__m5r01_upsert_args.create, {
      candidatePayload: {
        candidateRef: "controlled://candidate/m5r-01",
        summaryRef: "controlled://candidate-summary/m5r-01"
      },
      createdAt: new Date("2026-06-24T12:00:00.000Z"),
      diffPayload: {},
      id: ITEM_ID,
      kind: "KNOWLEDGE_CANDIDATE",
      metadata: { confidenceBps: 8100, synthetic_spec: "M5R-01" },
      orgId: ORG_ID,
      sourceRef: "controlled://distill/source/m5r-01",
      status: "PENDING",
      tenantId: TENANT_ID
    });
    assert.deepEqual(globalThis.__m5r01_find_many_args.where, {
      orgId: ORG_ID,
      status: "PENDING",
      tenantId: TENANT_ID
    });
  });

  it("documents true DB smoke boundaries and M5R-01 status", () => {
    assert.match(smokeRunnerSource, /runM5rConfirmationQueueTrueDbSmoke/);
    assert.match(
      smokeRunnerSupportSource,
      /requireSmokeEnv\("UZMAX_RLS_DATABASE_URL"\)/
    );
    assert.match(
      smokeRunnerSupportSource,
      /createConfirmationQueueRepositoryProviderFromEnv/
    );
    assert.match(smokeRunnerSupportSource, /same-tenant/);
    assert.match(smokeRunnerSupportSource, /wrong-tenant/);
    assert.match(smokeRunnerSupportSource, /runDirectRlsProbeWithoutContext/);
    assert.doesNotMatch(smokeRunnerSupportSource, /runDirectRlsProbe\(prisma, "",/);
    assert.match(smokeRunnerSupportSource, /formalWrite/);
    assert.equal(typeof runM5rConfirmationQueueTrueDbSmoke, "function");
    assert.match(
      `${spec}\n${evidence}\n${m5rIndex}`,
      /(?=.*M5R-01 Confirmation Queue Persistence)(?=.*changed source files <= 8, net source LOC <= 600)(?=.*m5r_01_runtime_evidence_added_not_owner_accepted)(?=.*No Sensitive Data Statement)(?=.*runtime_contract_passed_true_db_blocked_missing_env_not_owner_accepted)/s
    );
  });
});

function item(overrides = {}) {
  return {
    candidatePayload: {
      candidateRef: "controlled://candidate/m5r-01",
      summaryRef: "controlled://candidate-summary/m5r-01"
    },
    confidenceBps: 8100,
    createdAt: "2026-06-24T12:00:00.000Z",
    id: ITEM_ID,
    kind: "knowledge_candidate",
    metadata: { synthetic_spec: "M5R-01" },
    orgId: ORG_ID,
    sourceRef: "controlled://distill/source/m5r-01",
    status: "pending",
    tenantId: TENANT_ID,
    ...overrides
  };
}

function contextFor(selectedTenantId) {
  return {
    membershipVersion: 1,
    orgId: ORG_ID,
    permissions: ["confirmation:read", "confirmation:write"],
    selectedTenantId,
    tenantIds: [selectedTenantId],
    userId: USER_ID
  };
}

async function importTypescriptSource(relativePath, replacements = {}) {
  const source = applyReplacements(read(relativePath), replacements);
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2023
    },
    fileName: relativePath
  });
  const moduleUrl = dataModule(outputText);
  return { module: await import(moduleUrl), moduleUrl };
}

function applyReplacements(sourceText, replacements) {
  return Object.entries(replacements).reduce(
    (source, [from, to]) => source.replaceAll(from, to),
    sourceText
  );
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function dataModule(sourceText) {
  return `data:text/javascript;base64,${Buffer.from(sourceText, "utf8").toString(
    "base64"
  )}`;
}
