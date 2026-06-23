import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const repoRoot = process.cwd();
const smokeSource = read(
  "packages/db/scripts/run-m4-order-import-admin-visible-true-db-smoke.mjs"
);
const visibleSmokeSource = read("apps/admin/src/M4OrderImportVisibleSmokeState.tsx");
const shellSource = read("apps/admin/src/M4OrderPathStatusShell.tsx");
const ciSource = read(".github/workflows/ci.yml");
const m4Index = read("docs/evidence/M4/README.md");
const evidence = read(
  "docs/evidence/M4/M4-38-order-import-admin-visible-true-db-smoke.md"
);

describe("M4-38 order import admin visible true DB smoke", () => {
  it("gates visible runtime mode behind the smoke global and existing admin client", () => {
    assert.match(visibleSmokeSource, /__UZMAX_M4_ORDER_IMPORT_VISIBLE_SMOKE__/);
    assert.match(visibleSmokeSource, /createOrderImportApiClient/);
    assert.match(
      visibleSmokeSource,
      /fetcher: \(input, init\) => fetch\(input, init\)/
    );
    assert.match(visibleSmokeSource, /listImportJobs/);
    assert.match(visibleSmokeSource, /listImportRowErrors/);
    assert.match(visibleSmokeSource, /searchSnapshot/);
    assert.match(shellSource, /M4OrderImportVisibleSmokeState/);
  });

  it("runs browser-visible true DB smoke through Vite, Playwright and HTTP proxy", () => {
    assert.match(smokeSource, /requireSmokeEnv\("UZMAX_RLS_DATABASE_URL"\)/);
    assert.match(smokeSource, /startOrderImportHttpSmoke/);
    assert.match(smokeSource, /createOrderImportHttpSmokeFixture/);
    assert.match(smokeSource, /seedOrderImportRowsInRlsTransaction/);
    assert.match(smokeSource, /import\("@playwright\/test"\)/);
    assert.match(smokeSource, /import\("vite"\)/);
    assert.match(smokeSource, /page\.route\("\*\*\/order-import\/\*\*"/);
    assert.match(smokeSource, /route\.fetch/);
    assert.match(smokeSource, /x-tenant-id/);
    assert.match(smokeSource, /residue=0/);
    assert.match(smokeSource, /storage:\/\/order-imports\/m4-38-admin-visible/);
  });

  it("keeps CI and evidence conservative about acceptance closure", () => {
    assert.match(ciSource, /npx playwright install --with-deps chromium/);
    assert.match(ciSource, /run-m4-order-import-admin-visible-true-db-smoke\.mjs/);
    assert.match(m4Index, /M4-38 order import admin visible true DB smoke/);
    assert.match(evidence, /pending CI results/);
    assert.match(evidence, /does not close full E-02/);
    assert.doesNotMatch(
      `${smokeSource}\n${visibleSmokeSource}`,
      /SUPABASE_SECRET_KEY|service_role|customer.*phone|sk-/
    );
  });
});

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}
