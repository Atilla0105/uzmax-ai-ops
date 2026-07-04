import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const repoRoot = process.cwd();
const spec = read("docs/specs/M4-43-customer-asset-runtime-workflow.md");
const evidence = read("docs/evidence/M4/M4-43-customer-asset-runtime-workflow.md");
const m4Index = read("docs/evidence/M4/README.md");
const ciSource = read(".github/workflows/ci.yml");
const appModule = read("apps/api/src/app.module.ts");
const runtimeCompiler = read("apps/api/scripts/runtime-compiler.mjs");
const apiHarness = read("apps/api/scripts/customer-asset-http-smoke-harness.mjs");
const runtimeSource = read("apps/api/src/customer-asset.runtime.ts");
const prismaGateway = read("apps/api/src/customer-asset.prisma-gateway.ts");
const auditSink = read("apps/api/src/audit-log.prisma-sink.ts");
const adminRuntimeState = read("apps/admin/src/M4CustomerAssetRuntimeState.tsx");
const adminShell = read("apps/admin/src/M4CustomerAssetShell.tsx");
const adminClient = read("apps/admin/src/customerAssetApiClient.ts");
const dbFixture = read(
  "packages/db/scripts/customer-asset-true-db-http-smoke-fixture.mjs"
);
const visibleHarness = read(
  "packages/db/scripts/customer-asset-admin-visible-smoke-harness.mjs"
);
const smokeRunner = read(
  "packages/db/scripts/run-m4-customer-asset-runtime-workflow-smoke.mjs"
);
const designSpec = read("apps/admin/tests/design.spec.ts");

describe("M4-43 customer asset runtime workflow", () => {
  it("roots execution in the approved M4-43 vertical slice", () => {
    assert.match(spec, /M4-43 Customer Asset Runtime Workflow/);
    assert.match(spec, /M4-44：AI order-read runtime/);
    assert.match(spec, /M4-45：队列\/安全\/closeout/);
    assert.match(
      spec,
      /packages\/db\/scripts\/run-m4-customer-asset-runtime-workflow-smoke\.mjs/
    );
    assert.match(evidence, /M4-43 Customer Asset Runtime Workflow Evidence/);
    assert.match(m4Index, /M4-43 customer asset runtime workflow evidence/);
  });

  it("adds an explicit RLS-backed runtime provider without changing defaults", () => {
    assert.match(runtimeSource, /createCustomerAssetRepositoryProvider/);
    assert.match(runtimeSource, /customerAssetRuntimeModes/);
    assert.match(runtimeSource, /rls_prisma_gateway/);
    assert.match(runtimeSource, /createCustomerAssetRlsBatchTransactionRunner/);
    assert.match(runtimeSource, /RlsCustomerAssetPersistenceGateway/);
    assert.match(runtimeSource, /RlsPrismaAuditSink/);
    assert.match(runtimeSource, /toPrismaAuditLogCreateData/);
    assert.match(runtimeSource, /createRlsTransactionContext/);
    assert.match(appModule, /InMemoryCustomerAssetRepository/);
    assert.match(
      appModule,
      /provide: CUSTOMER_ASSET_REPOSITORY,\s+useExisting: InMemoryCustomerAssetRepository/s
    );
    assert.match(
      appModule,
      /provide: api\.API_AUDIT_SINK, useClass: api\.InMemoryAuditSink/
    );
    assert.doesNotMatch(
      appModule,
      /useClass: RlsPrismaAuditSink|useClass: RlsCustomerAssetPersistenceGateway|new PrismaClient|process\.env/
    );
    assert.doesNotMatch(
      runtimeSource,
      /@prisma\/client|new PrismaClient|process\.env|https?:\/\//i
    );
  });

  it("boots smoke-only HTTP through existing customer asset controller and service", () => {
    assert.match(runtimeCompiler, /importApiCustomerAssetRuntimeModules/);
    assert.match(runtimeCompiler, /customer-asset\.runtime\.ts/);
    assert.match(runtimeCompiler, /audit-log\.prisma-sink\.ts/);
    assert.match(apiHarness, /startCustomerAssetHttpSmoke/);
    assert.match(apiHarness, /CustomerAssetController/);
    assert.match(apiHarness, /CustomerAssetService/);
    assert.match(apiHarness, /ApiAccessContextGuard/);
    assert.match(apiHarness, /createCustomerAssetRepositoryProvider/);
    assert.match(apiHarness, /createCustomerAssetAuditSinkProvider/);
    assert.match(apiHarness, /x-uzmax-smoke-permissions/);
  });

  it("uses true DB fixtures and runner without schema or connector scope creep", () => {
    assert.match(dbFixture, /set local role "uzmax_app_runtime"/);
    assert.match(dbFixture, /customer\.create/);
    assert.match(dbFixture, /customerIdentity\.create/);
    assert.match(dbFixture, /customFieldDefinition\.create/);
    assert.match(dbFixture, /customerFieldValue\.create/);
    assert.match(dbFixture, /tagDefinition\.create/);
    assert.match(dbFixture, /tagAssignment\.create/);
    assert.match(dbFixture, /auditLog\.findMany/);
    assert.match(smokeRunner, /requireSmokeEnv\("UZMAX_RLS_DATABASE_URL"\)/);
    assert.match(smokeRunner, /PrismaClient/);
    assert.match(smokeRunner, /createCustomerAssetApiClient/);
    assert.match(smokeRunner, /withCustomerAssetVisibleSmokePage/);
    assert.match(smokeRunner, /customer\.flags_restored/);
    assert.match(smokeRunner, /residue=0/);
    assert.doesNotMatch(
      `${dbFixture}\n${visibleHarness}\n${smokeRunner}`,
      /order API|llm|telegram|bullmq|redis|production|schema\.prisma|migrations\/000/i
    );
  });

  it("opens the explicit legacy evidence route before customer runtime lookup", () => {
    assert.match(visibleHarness, /Open legacy evidence route/);
    assert.match(visibleHarness, /legacy-evidence-route/);
    assert.match(
      visibleHarness,
      /page\.goto\(`\$\{runtime\.adminBaseUrl\}\/design`\);\s+await openLegacyEvidenceRoute\(page\);\s+await callback\(page\.getByTestId\("m4-customer-runtime-state"\), page\);/
    );
  });

  it("keeps admin runtime readback smoke-only and default design synthetic", () => {
    assert.match(adminRuntimeState, /__UZMAX_M4_CUSTOMER_ASSET_RUNTIME_SMOKE__/);
    assert.match(adminRuntimeState, /createCustomerAssetApiClient/);
    assert.match(adminRuntimeState, /autoRestore/);
    assert.match(adminRuntimeState, /customer\.flags_restored/);
    assert.match(adminShell, /<M4CustomerAssetRuntimeState \/>/);
    assert.match(adminShell, /synthetic local shell/);
    assert.match(adminShell, /runtime fetch remains future scope/);
    assert.match(adminClient, /customer\.flags_restored/);
    assert.match(designSpec, /m4-order-runtime-state/);
    assert.match(designSpec, /m4-customer-runtime-state/);
  });

  it("wires CI and evidence while leaving later M4 slices open", () => {
    assert.match(ciSource, /run-m4-customer-asset-runtime-workflow-smoke\.mjs/);
    assert.match(evidence, /CI true DB smoke/);
    assert.match(evidence, /28043835289/);
    assert.match(evidence, /residue=0/);
    assert.match(evidence, /M4-44/);
    assert.match(evidence, /M4-45/);
    assert.match(m4Index, /customer_asset_runtime_workflow_supported_not_full/);
    assert.match(m4Index, /still_requires_m4_44_ai_order_read_runtime/);
    assert.match(m4Index, /still_requires_m4_45_queue_security_closeout/);
  });

  it("does not modify forbidden DB schema generated client or release scope", () => {
    for (const forbiddenPath of [
      "packages/db/prisma/schema.prisma",
      "packages/db/migrations/",
      "packages/db/src/generated",
      "apps/worker/",
      "packages/capabilities/",
      "docs/release.md"
    ]) {
      assert.doesNotMatch(spec, new RegExp(escapeRegExp(forbiddenPath)));
    }
    assert.doesNotMatch(
      `${runtimeSource}\n${apiHarness}\n${adminRuntimeState}\n${dbFixture}\n${smokeRunner}`,
      /raw payload|csv export|xlsx|phone|address|payment|telegram username|credentials|secret|real customer/i
    );
    assert.doesNotMatch(
      `${prismaGateway}\n${auditSink}\n${runtimeSource}`,
      /external connector|order connector|LLM provider|queue runtime|release gate/i
    );
  });
});

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
