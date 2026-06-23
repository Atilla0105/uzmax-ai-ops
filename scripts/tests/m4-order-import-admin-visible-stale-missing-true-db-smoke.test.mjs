import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const repoRoot = process.cwd();
const smokeSource = read(
  "packages/db/scripts/run-m4-order-import-admin-visible-stale-missing-true-db-smoke.mjs"
);
const visibleHarnessSource = read(
  "packages/db/scripts/order-import-admin-visible-smoke-harness.mjs"
);
const visibleSmokeSource = read("apps/admin/src/M4OrderImportVisibleSmokeState.tsx");
const ciSource = read(".github/workflows/ci.yml");
const spec = read(
  "docs/specs/M4-39-order-import-admin-visible-stale-missing-true-db-smoke.md"
);
const m4Index = read("docs/evidence/M4/README.md");
const evidence = read(
  "docs/evidence/M4/M4-39-order-import-admin-visible-stale-missing-true-db-smoke.md"
);

describe("M4-39 order import admin visible stale/missing true DB smoke", () => {
  it("renders handoff-required smoke results without exposing status refs", () => {
    assert.match(visibleSmokeSource, /__UZMAX_M4_ORDER_IMPORT_VISIBLE_SMOKE__/);
    assert.match(visibleSmokeSource, /createOrderImportApiClient/);
    assert.match(
      visibleSmokeSource,
      /fetcher: \(input, init\) => fetch\(input, init\)/
    );
    assert.match(visibleSmokeSource, /snapshot\.status !== "snapshot_ready"/);
    assert.match(visibleSmokeSource, /reasonCode: snapshot\.reasonCode/);
    assert.match(visibleSmokeSource, /snapshot\.runtimeWarning\?\.code/);
    assert.match(visibleSmokeSource, /runtimeWarningCode,/);
    assert.match(visibleSmokeSource, /order import smoke runtime warning missing/);
    assert.match(visibleSmokeSource, /Reason code: \{state\.reasonCode\}/);
    assert.match(visibleSmokeSource, /Runtime warning: \{state\.runtimeWarningCode\}/);
    assert.match(visibleSmokeSource, /state\.statusRef \? <span>Status ref:/);
    assert.doesNotMatch(visibleSmokeSource, /unexpected smoke snapshot status/);
    assert.doesNotMatch(visibleSmokeSource, /Status ref hidden/);
  });

  it("runs stale and missing browser-visible true DB smoke through HTTP proxy", () => {
    assert.match(smokeSource, /requireSmokeEnv\("UZMAX_RLS_DATABASE_URL"\)/);
    assert.match(smokeSource, /createOrderImportHttpSmokeFixture/);
    assert.match(smokeSource, /runAdminVisibleOrderImportSmoke/);
    assert.match(visibleHarnessSource, /startOrderImportHttpSmoke/);
    assert.match(visibleHarnessSource, /seedOrderImportRowsInRlsTransaction/);
    assert.match(smokeSource, /syntheticSpec: "M4-39"/);
    assert.match(smokeSource, /suffix: "139"/);
    assert.match(smokeSource, /missingOrderRef/);
    assert.match(smokeSource, /staleNow = "2026-07-01T08:30:00\.000Z"/);
    assert.match(visibleHarnessSource, /import\("@playwright\/test"\)/);
    assert.match(visibleHarnessSource, /import\("vite"\)/);
    assert.match(visibleHarnessSource, /page\.route\("\*\*\/order-import\/\*\*"/);
    assert.match(visibleHarnessSource, /route\.fetch/);
    assert.match(visibleHarnessSource, /x-tenant-id/);
    assert.match(smokeSource, /order_snapshot_stale/);
    assert.match(smokeSource, /order_snapshot_missing/);
    assert.ok(
      smokeSource.includes("Status ref|orderStatusRef|status:\\/\\/order\\/ready")
    );
    assert.match(visibleHarnessSource, /cleanupSyntheticRows/);
    assert.match(visibleHarnessSource, /syntheticResidueCount/);
    assert.match(smokeSource, /residue=0/);
  });

  it("keeps CI, spec and evidence conservative about acceptance closure", () => {
    assert.match(
      ciSource,
      /run-m4-order-import-admin-visible-stale-missing-true-db-smoke\.mjs/
    );
    assert.match(m4Index, /M4-39 order import admin visible stale\/missing/);
    assert.match(evidence, /pending/);
    assert.match(evidence, /does not close full E-02\/E-03\/E-04\/I-01\/J-02\/B-01/);
    assert.match(spec, /does not close full E-02\/E-03\/E-04\/I-01\/J-02\/B-01/);
    assert.match(
      spec,
      /docs\/specs\/M4-39-order-import-admin-visible-stale-missing-true-db-smoke\.md/
    );
    assert.match(evidence, /No raw order\/customer data/);
    assert.doesNotMatch(
      `${smokeSource}\n${visibleHarnessSource}\n${visibleSmokeSource}\n${evidence}`,
      /SUPABASE_SECRET_KEY|service_role|customer_phone|phone_number|\+998|sk-/i
    );
  });
});

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}
