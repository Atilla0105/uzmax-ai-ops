import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import ts from "typescript";

const repoRoot = process.cwd();
const ORG_ID = "11111111-1111-4111-8111-111111111111";
const TENANT_ID = "22222222-2222-4222-8222-222222222222";
const DATABASE_URL = "synthetic-db-url-m4-33";
const dbRuntimeSource = read("packages/db/src/prisma-runtime.ts");
const apiRuntimeSource = read("apps/api/src/order-import.runtime.ts");
const appModuleSource = read("apps/api/src/app.module.ts");
const spec = read("docs/specs/M4-33-order-import-rls-runtime-readiness.md");
const evidence = read("docs/evidence/M4/M4-33-order-import-rls-runtime-readiness.md");
const m4Index = read("docs/evidence/M4/README.md");

const fakePrisma = dataModule(`
export class PrismaClient {
  constructor(options) {
    globalThis.__m4_33_prisma_options = options;
    this.importJob = {
      findFirst: async () => null,
      findMany: async (args) => {
        globalThis.__m4_33_business_args = args;
        return [{
          failedRows: 1,
          fileRef: "storage://order-imports/m4-33.csv",
          id: "job-a",
          orgId: "${ORG_ID}",
          status: "completed_with_errors",
          successfulRows: 1,
          tenantId: "${TENANT_ID}",
          totalRows: 2
        }];
      }
    };
    this.importRowError = { findMany: async () => [] };
    this.orderSnapshot = { findFirst: async () => null };
  }

  $executeRawUnsafe(sql) {
    return Promise.resolve({ kind: "role", sql });
  }

  $queryRaw(strings, ...values) {
    return Promise.resolve({ kind: "set_config", key: values[0], value: values[1] });
  }

  async $transaction(operations) {
    const result = await Promise.all(operations);
    globalThis.__m4_33_transaction = result;
    return result;
  }
}
`);
const dbIndex = await importTypescriptSource("packages/db/src/index.ts");
const dbRuntime = await importTypescriptSource("packages/db/src/prisma-runtime.ts", {
  "@prisma/client": fakePrisma
});
const defaults = await importTypescriptSource("apps/api/src/order-import.defaults.ts");
const persistenceGateway = await importTypescriptSource(
  "apps/api/src/order-import.persistence-gateway.ts",
  {
    "../../../packages/db/src/index.ts": dbIndex.moduleUrl
  }
);
const repository = await importTypescriptSource(
  "apps/api/src/order-import.repository.ts",
  {
    "../../../packages/db/src/index.ts": dbIndex.moduleUrl,
    "./order-import.defaults.ts": defaults.moduleUrl,
    "./order-import.persistence-gateway.ts": persistenceGateway.moduleUrl
  }
);
const runner = await importTypescriptSource("apps/api/src/order-import.rls-runner.ts");
const runtime = await importTypescriptSource("apps/api/src/order-import.runtime.ts", {
  "../../../packages/db/src/prisma-runtime.ts": dbRuntime.moduleUrl,
  "./order-import.repository.ts": repository.moduleUrl,
  "./order-import.rls-runner.ts": runner.moduleUrl
});

describe("M4-33 order import RLS runtime readiness", () => {
  it("keeps the default AppModule path on in-memory without requiring DB env", () => {
    const seededRepository = new repository.module.InMemoryOrderImportRepository();
    const provider = runtime.module.createOrderImportRepositoryProviderFromEnv({
      env: {},
      inMemoryRepository: seededRepository
    });

    assert.equal(provider, seededRepository);
  });

  it("fails closed for explicit DB runtime without an RLS database URL", () => {
    assert.throws(
      () =>
        runtime.module.createOrderImportRepositoryProviderFromEnv({
          env: { UZMAX_ORDER_IMPORT_REPOSITORY_MODE: "rls_prisma_gateway" }
        }),
      /UZMAX_RLS_DATABASE_URL is required for Prisma runtime/
    );
  });

  it("rejects bare Prisma env mode so runtime cannot bypass RLS", () => {
    assert.throws(
      () =>
        runtime.module.createOrderImportRepositoryProviderFromEnv({
          env: { UZMAX_ORDER_IMPORT_REPOSITORY_MODE: "prisma_gateway" }
        }),
      /must use RLS Prisma gateway/
    );
  });

  it("creates a Prisma-backed RLS provider only when explicitly configured", async () => {
    globalThis.__m4_33_prisma_options = undefined;
    globalThis.__m4_33_transaction = undefined;
    const provider = runtime.module.createOrderImportRepositoryProviderFromEnv({
      env: {
        UZMAX_ORDER_IMPORT_REPOSITORY_MODE: "rls_prisma_gateway",
        UZMAX_RLS_DATABASE_URL: DATABASE_URL
      }
    });

    const jobs = await provider.listJobs(contextFor(TENANT_ID));

    assert.deepEqual(
      jobs.map((job) => job.id),
      ["job-a"]
    );
    assert.equal(globalThis.__m4_33_prisma_options.datasources.db.url, DATABASE_URL);
    assert.deepEqual(
      globalThis.__m4_33_transaction.map((operation) => operation.kind),
      ["role", "set_config", "set_config", undefined]
    );
    assert.deepEqual(globalThis.__m4_33_transaction[0], {
      kind: "role",
      sql: 'set local role "uzmax_app_runtime"'
    });
    assert.deepEqual(globalThis.__m4_33_transaction[1], {
      key: "app.org_id",
      kind: "set_config",
      value: ORG_ID
    });
    assert.deepEqual(globalThis.__m4_33_transaction[2], {
      key: "app.tenant_id",
      kind: "set_config",
      value: TENANT_ID
    });
    assert.deepEqual(globalThis.__m4_33_business_args, {
      orderBy: { createdAt: "desc" },
      take: 50,
      where: { orgId: ORG_ID, tenantId: TENANT_ID }
    });
  });

  it("documents the runtime boundary and true-DB validation result", () => {
    assert.match(dbRuntimeSource, /createUzmaxPrismaClientFromEnv/);
    assert.match(apiRuntimeSource, /createOrderImportRepositoryProviderFromEnv/);
    assert.match(apiRuntimeSource, /rlsPrismaGateway/);
    assert.match(apiRuntimeSource, /process\.env/);
    assert.match(appModuleSource, /createOrderImportRepositoryProviderFromEnv/);
    assert.doesNotMatch(appModuleSource, /process\.env/);
    assert.match(spec, /RLS runtime readiness/);
    assert.match(evidence, /Supabase branch/);
    assert.match(evidence, /tenant A/);
    assert.match(m4Index, /M4-33 order import RLS runtime readiness/);
    assert.doesNotMatch(
      `${apiRuntimeSource}\n${appModuleSource}`,
      /order_connector|fetch\(|https?:\/\//i
    );
  });
});

function contextFor(selectedTenantId) {
  return {
    membershipVersion: 1,
    orgId: ORG_ID,
    permissions: ["order:read"],
    selectedTenantId,
    tenantIds: [selectedTenantId],
    userId: "44444444-4444-4444-8444-444444444444"
  };
}

async function importTypescriptSource(relativePath, replacements = {}) {
  let source = read(relativePath);
  for (const [from, to] of Object.entries(replacements)) {
    source = source.replaceAll(from, to);
  }
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2023
    },
    fileName: relativePath
  });
  const moduleUrl = `data:text/javascript;base64,${Buffer.from(
    outputText,
    "utf8"
  ).toString("base64")}`;
  return { module: await import(moduleUrl), moduleUrl };
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function dataModule(sourceText) {
  return `data:text/javascript;base64,${Buffer.from(sourceText, "utf8").toString(
    "base64"
  )}`;
}
