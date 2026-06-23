import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const repoRoot = process.cwd();
const smokeSource = read(
  "packages/db/scripts/run-m4-order-import-admin-visible-true-db-smoke.mjs"
);
const visibleHarnessSource = read(
  "packages/db/scripts/order-import-admin-visible-smoke-harness.mjs"
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
    assert.match(visibleSmokeSource, /Promise\.all/);
    assert.match(shellSource, /M4OrderImportVisibleSmokeState/);
  });

  it("runs browser-visible true DB smoke through Vite, Playwright and HTTP proxy", () => {
    assert.match(smokeSource, /requireSmokeEnv\("UZMAX_RLS_DATABASE_URL"\)/);
    assert.match(smokeSource, /createOrderImportHttpSmokeFixture/);
    assert.match(smokeSource, /runAdminVisibleOrderImportSmoke/);
    assert.match(visibleHarnessSource, /startOrderImportHttpSmoke/);
    assert.match(visibleHarnessSource, /seedOrderImportRowsInRlsTransaction/);
    assert.match(visibleHarnessSource, /import\("@playwright\/test"\)/);
    assert.match(visibleHarnessSource, /import\("vite"\)/);
    assert.match(visibleHarnessSource, /page\.route\("\*\*\/order-import\/\*\*"/);
    assert.match(visibleHarnessSource, /route\.fetch/);
    assert.match(visibleHarnessSource, /visibleStateTimeoutMs = 65_000/);
    assert.match(visibleHarnessSource, /x-tenant-id/);
    assert.match(smokeSource, /residue=0/);
    assert.match(smokeSource, /storage:\/\/order-imports\/m4-38-admin-visible/);
  });

  it("keeps CI and evidence conservative about acceptance closure", () => {
    assert.match(ciSource, /npx playwright install --with-deps chromium/);
    assert.match(ciSource, /run-m4-order-import-admin-visible-true-db-smoke\.mjs/);
    assert.match(m4Index, /M4-38 order import admin visible true DB smoke/);
    assert.ok(
      /pending CI results/.test(evidence) ||
        (/GitHub Actions CI `\d+`/.test(evidence) &&
          /m4-order-import-admin-visible-true-db-smoke: passed browser admin visible true DB synthetic path; residue=0/.test(
            evidence
          ))
    );
    assert.match(evidence, /does not close full E-02/);
    assert.doesNotMatch(
      `${smokeSource}\n${visibleHarnessSource}\n${visibleSmokeSource}`,
      /SUPABASE_SECRET_KEY|service_role|customer.*phone|sk-/
    );
  });
});

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}
