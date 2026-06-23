import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const repoRoot = process.cwd();
const smokeSource = read(
  "packages/db/scripts/run-m4-order-import-admin-true-db-http-smoke.mjs"
);
const fixtureSource = read(
  "packages/db/scripts/order-import-true-db-http-smoke-fixture.mjs"
);
const adminClientSource = read("apps/admin/src/orderImportApiClient.ts");
const m4Index = read("docs/evidence/M4/README.md");
const spec = read("docs/specs/M4-37-order-import-admin-true-db-http-smoke.md");

describe("M4-37 order import admin true DB HTTP smoke", () => {
  it("routes the admin order import client through real Nest HTTP smoke", () => {
    assert.match(smokeSource, /importAdminOrderImportApiClient/);
    assert.match(smokeSource, /createOrderImportApiClient/);
    assert.match(smokeSource, /createOrderImportHttpFetcher/);
    assert.match(smokeSource, /startOrderImportHttpSmoke/);
    assert.match(smokeSource, /listImportJobs/);
    assert.match(smokeSource, /listImportRowErrors/);
    assert.match(smokeSource, /searchSnapshot/);
    assert.match(smokeSource, /tenantAId/);
    assert.match(smokeSource, /tenantBId/);
    assert.match(smokeSource, /status 403/);
    assert.match(smokeSource, /status 404/);
    assert.match(adminClientSource, /createOrderImportApiClient/);
  });

  it("keeps true DB seed, cleanup and fail-closed secret handling shared", () => {
    assert.match(smokeSource, /requireSmokeEnv\("UZMAX_RLS_DATABASE_URL"\)/);
    assert.match(smokeSource, /seedSyntheticTenant/);
    assert.match(smokeSource, /seedOrderImportRowsInRlsTransaction/);
    assert.match(smokeSource, /cleanupSyntheticRows/);
    assert.match(smokeSource, /syntheticResidueCount/);
    assert.match(smokeSource, /residue=0/);
    assert.match(fixtureSource, /set local role "uzmax_app_runtime"/);
    assert.match(
      fixtureSource,
      /metadata: \{ synthetic_spec: fixture\.syntheticSpec \}/
    );
  });

  it("records the vertical admin scope without claiming full E-02 closure", () => {
    assert.match(spec, /Admin client/);
    assert.match(spec, /不启动 admin browser E2E/);
    assert.match(spec, /不关闭完整 E-02/);
    assert.match(m4Index, /M4-37 order import admin true DB HTTP smoke/);
    assert.doesNotMatch(
      `${smokeSource}\n${fixtureSource}`,
      /SUPABASE_SECRET_KEY|service_role|customer.*phone|payment|address|sk-/
    );
  });
});

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}
