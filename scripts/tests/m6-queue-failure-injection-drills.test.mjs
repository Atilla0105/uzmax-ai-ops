import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const repoRoot = process.cwd();
const files = {
  ci: read(".github/workflows/ci.yml"),
  evidence: read("docs/evidence/M6/M6-03-queue-failure-injection-drills.md"),
  m4Evidence: read("docs/evidence/M4/M4-45-order-import-queue-security-closeout.md"),
  m6Index: read("docs/evidence/M6/README.md"),
  releaseDoc: read("docs/release.md"),
  runbook: read("docs/runbooks/queue-failure-injection.md"),
  runbooksIndex: read("docs/runbooks/README.md"),
  smoke: read("apps/worker/scripts/run-m4-order-import-bullmq-redis-smoke.mjs"),
  spec: read("docs/specs/M6-03-queue-failure-injection-drills.md")
};

test("M6-03 records J-02 queue failure drill evidence without source changes", () => {
  assert.match(files.spec, /M6-03 Queue Failure Injection Drills/);
  assert.match(files.spec, /source 预算：changed source files <= 0/);
  assert.match(files.spec, /Do not modify app runtime source/);

  assert.match(
    files.evidence,
    /m6_queue_failure_drill_recorded_j02_supported_not_production_deployment/
  );
  assert.match(
    files.evidence,
    /release_drill_supported_by_synthetic_bullmq_redis_smoke/
  );
  assert.match(files.evidence, /same deterministic `jobId`/);
  assert.match(files.evidence, /order_import_queue_backlog_high/);
  assert.match(files.evidence, /order_import_queue_failed_high/);
  assert.match(files.evidence, /run residue `?0`?/);

  assert.match(files.m6Index, /M6-03 Queue and failure injection drills/);
  assert.match(files.releaseDoc, /M6-03 Queue Failure Injection/);
});

test("M6-03 runbook captures retry, idempotency, alert and cleanup failure branches", () => {
  assert.match(files.runbooksIndex, /queue-failure-injection\.md/);
  assert.match(files.runbook, /env -u UZMAX_REDIS_URL/);
  assert.match(files.runbook, /UZMAX_REDIS_URL=redis:\/\/127\.0\.0\.1:6379/);
  assert.match(files.runbook, /first attempt fails/);
  assert.match(files.runbook, /duplicate deterministic `jobId`/);
  assert.match(files.runbook, /order_import_queue_backlog_high/);
  assert.match(files.runbook, /order_import_queue_failed_high/);
  assert.match(files.runbook, /run residue is `0`/);
  assert.match(files.runbook, /production Redis/);
});

test("M6-03 reuses the M4-45 Redis smoke and keeps CI replay wired", () => {
  assert.match(files.m4Evidence, /M6-03 Release Replay/);
  assert.match(files.m4Evidence, /28056312343/);
  assert.match(
    files.ci,
    /docs\/evidence\/M4\/M4-45-order-import-queue-security-closeout\.md/
  );
  assert.match(files.ci, /run-m4-order-import-bullmq-redis-smoke\.mjs/);

  assert.match(files.smoke, /UZMAX_REDIS_URL is required/);
  assert.match(files.smoke, /first-attempt fault injection/);
  assert.match(files.smoke, /assert\.equal\(successes, 1\)/);
  assert.match(files.smoke, /order_import_queue_backlog_high/);
  assert.match(files.smoke, /order_import_queue_failed_high/);
  assert.match(files.smoke, /run residue 0/);
});

test("M6-03 preserves release and sensitive-data boundaries", () => {
  const combined = [
    files.evidence,
    files.m6Index,
    files.releaseDoc,
    files.runbook
  ].join("\n");

  assert.doesNotMatch(
    combined,
    /GA-0 opened|production-ready|1\.0 release approved|real customer data approved|production Redis approved/i
  );
  assert.match(combined, /GA-0 remains locked|GA-0 remains closed|GA-0/);
  assert.match(
    combined,
    /No raw customer\/order exports|No raw\/export\/jsonl\/csv|raw customer\/order data/i
  );
});

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}
