import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { URL } from "node:url";

const repoRoot = process.cwd();
const runtimeCompiler = await import(
  new URL("../../apps/api/scripts/runtime-compiler.mjs", import.meta.url)
);
const smokeSource = read(
  "packages/db/scripts/run-m4-order-import-api-true-db-http-smoke.mjs"
);
const fixtureSource = read(
  "packages/db/scripts/order-import-true-db-http-smoke-fixture.mjs"
);
const harnessSource = read("apps/api/scripts/order-import-http-smoke-harness.mjs");
const spec = read("docs/specs/M4-36-order-import-api-true-db-http-smoke.md");

describe("M4-36 order import API true DB HTTP smoke", () => {
  it("imports the real order-import API runtime modules for the smoke harness", async () => {
    const cacheRoot = path.join(repoRoot, "node_modules/.cache");
    mkdirSync(cacheRoot, { recursive: true });
    const outDir = mkdtempSync(path.join(cacheRoot, "uzmax-m4-36-api-runtime-"));
    const runtime = await runtimeCompiler.importApiOrderImportRuntimeModules({
      outDir
    });

    assert.equal(typeof runtime.accessContext.ApiAccessContextGuard, "function");
    assert.equal(typeof runtime.orderImport.OrderImportController, "function");
    assert.equal(typeof runtime.orderImport.OrderImportService, "function");
    assert.equal(typeof runtime.orderImport.ORDER_IMPORT_REPOSITORY, "symbol");
    assert.equal(
      typeof runtime.orderImport.createOrderImportRlsBatchTransactionRunner,
      "function"
    );
    assert.equal(
      typeof runtime.orderImportRuntime.createOrderImportRepositoryProviderFromEnv,
      "function"
    );
  });

  it("boots a Nest HTTP smoke module over the RLS Prisma order-import repository", () => {
    assert.match(harnessSource, /NestFactory\.create/);
    assert.match(harnessSource, /Module\(\{/);
    assert.match(harnessSource, /OrderImportController/);
    assert.match(harnessSource, /OrderImportService/);
    assert.match(harnessSource, /ApiAccessContextGuard/);
    assert.match(harnessSource, /ApiAccessContextService/);
    assert.match(harnessSource, /createOrderImportRlsBatchTransactionRunner\(prisma\)/);
    assert.match(harnessSource, /orderImportRepositoryRuntimeModes\.rlsPrismaGateway/);
    assert.match(smokeSource, /startOrderImportHttpSmoke/);
    assert.match(smokeSource, /createOrderImportHttpFetcher/);
    assert.match(fixtureSource, /"x-tenant-id": tenantId/);
    assert.match(fixtureSource, /globalThis\.fetch\(`\$\{baseUrl\}\$\{apiPath\}`/);
    assert.doesNotMatch(
      `${harnessSource}\n${smokeSource}`,
      /new OrderImportController|new OrderImportService/
    );
    assert.doesNotMatch(smokeSource, /@nestjs\/common|@nestjs\/core/);
  });

  it("fails closed on missing DB secret and keeps synthetic cleanup explicit", () => {
    assert.match(smokeSource, /requireSmokeEnv\("UZMAX_RLS_DATABASE_URL"\)/);
    assert.match(
      fixtureSource,
      /metadata: \{ synthetic_spec: fixture\.syntheticSpec \}/
    );
    assert.match(smokeSource, /cleanupSyntheticRows/);
    assert.match(fixtureSource, /syntheticResidueCount/);
    assert.match(smokeSource, /residue=0/);
    assert.doesNotMatch(
      `${fixtureSource}\n${smokeSource}`,
      /SUPABASE_SECRET_KEY|service_role|customer.*phone|payment|address|sk-/
    );
  });

  it("records the vertical scope without claiming full E-02 closure", () => {
    assert.match(spec, /按能力竖切/);
    assert.match(spec, /不新增正式身份鉴权/);
    assert.match(spec, /不关闭完整 E-02/);
    assert.match(spec, /api_http_true_db_smoke_supported_not_closed/);
  });
});

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}
