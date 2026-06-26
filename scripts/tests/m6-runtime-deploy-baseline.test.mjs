import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { buildRuntimeBaseline } from "../guards/m6-runtime-baseline-check.mjs";

const repoRoot = process.cwd();
const files = {
  evidence: read("docs/evidence/M6/M6-02-runtime-deploy-baseline.md"),
  m6Index: read("docs/evidence/M6/README.md"),
  releaseDoc: read("docs/release.md"),
  runbook: read("docs/runbooks/deploy-rollback.md"),
  spec: read("docs/specs/M6-02-runtime-deploy-baseline.md")
};

test("M6-02 runtime baseline reports partial J-01/J-04 status from repo files", () => {
  const baseline = buildRuntimeBaseline(repoRoot);

  assert.equal(baseline.status, "baseline_recorded_j01_j04_partial_blockers_open");
  assert.equal(
    baseline.acceptance["J-01"],
    "baseline_recorded_not_closed_real_rollback_drills_pending"
  );
  assert.equal(
    baseline.acceptance["J-04"],
    "deploy_rollback_runbook_updated_partial_drills_pending"
  );

  assert.equal(baseline.surfaces.api.healthChecks.healthz, true);
  assert.equal(baseline.surfaces.api.healthChecks.readyz, true);
  assert.equal(baseline.surfaces.worker.packageStartPlaceholder, false);
  assert.equal(
    baseline.surfaces.worker.status,
    "worker_baseline_supported_real_rollback_drill_pending"
  );
  assert.equal(baseline.surfaces.cron.packageStartPlaceholder, false);
  assert.equal(
    baseline.surfaces.cron.status,
    "cron_baseline_supported_real_rollback_drill_pending"
  );
  assert.equal(baseline.surfaces.admin.deploymentPendingOwner, true);

  assert.deepEqual(baseline.runbook.coverage, {
    admin: true,
    api: true,
    cron: true,
    worker: true
  });
  assert.equal(
    baseline.blockers.includes("worker_start_command_m0_placeholder"),
    false
  );
  assert.equal(baseline.blockers.includes("cron_start_command_m0_placeholder"), false);
  assert.ok(
    baseline.blockers.includes(
      "real_deploy_and_rollback_drills_not_executed_in_this_pr"
    )
  );
});

test("M6-02 docs keep runtime baseline evidence visible without release approval", () => {
  assert.match(files.spec, /M6-02 Runtime Deploy And Rollback Baseline/);
  assert.match(files.spec, /scripts\/guards\/m6-runtime-baseline-check\.mjs/);
  assert.match(files.evidence, /baseline_recorded_j01_j04_partial_blockers_open/);
  assert.match(files.evidence, /worker_baseline_supported_real_rollback_drill_pending/);
  assert.match(files.evidence, /cron_baseline_supported_real_rollback_drill_pending/);
  assert.doesNotMatch(files.evidence, /cron_start_command_m0_placeholder/);
  assert.match(files.m6Index, /M6-02 Runtime deploy and rollback baseline/);
  assert.match(files.releaseDoc, /M6-02 Runtime Baseline/);
  assert.match(files.runbook, /Surface Matrix/);
  assert.match(files.runbook, /api[\s\S]*worker[\s\S]*cron[\s\S]*admin/);

  assert.doesNotMatch(
    `${files.evidence}\n${files.m6Index}\n${files.releaseDoc}`,
    /GA-0 opened|production-ready|1\.0 release approved|real customer data approved/i
  );
});

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}
