import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const read = (path) => readFileSync(path, "utf8");

const files = {
  acceptance: "UZMAX智能运营系统-1.0验收矩阵-v1.1.md",
  prd: "UZMAX智能运营系统-PRD-v1.1.md",
  architecture: "UZMAX智能运营系统-技术架构-v1.1.md",
  spec: "docs/specs/M6-09-final-acceptance-rollup.md",
  evidence: "docs/evidence/M6/M6-09-final-acceptance-rollup.md",
  m6Readme: "docs/evidence/M6/README.md",
  release: "docs/release.md",
  runbookIndex: "docs/runbooks/README.md",
  m600: "docs/evidence/M6/M6-00-m5-signoff-and-m6-readiness-pack.md",
  m601: "docs/evidence/M6/M6-01-release-gate-console.md",
  m602: "docs/evidence/M6/M6-02-runtime-deploy-baseline.md",
  m603: "docs/evidence/M6/M6-03-queue-failure-injection-drills.md",
  m604: "docs/evidence/M6/M6-04-rls-authz-release-matrix.md",
  m605: "docs/evidence/M6/M6-05-ai-safety-eval-gates.md",
  m606: "docs/evidence/M6/M6-06-telegram-bot-ga0-main-path.md",
  m607: "docs/evidence/M6/M6-07-core-ops-synthetic-e2e.md",
  m608: "docs/evidence/M6/M6-08-backup-restore-asset-safety.md"
};

const contents = Object.fromEntries(
  Object.entries(files).map(([key, path]) => [key, read(path)])
);

const escaped = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

test("M6-09 links all source-of-truth and M6 evidence files", () => {
  for (const source of [
    "AGENTS.md",
    files.acceptance,
    files.prd,
    files.architecture,
    files.m600,
    files.m601,
    files.m602,
    files.m603,
    files.m604,
    files.m605,
    files.m606,
    files.m607,
    files.m608,
    files.runbookIndex
  ]) {
    assert.match(contents.spec, new RegExp(escaped(source)));
    assert.match(contents.evidence, new RegExp(escaped(source)));
  }
});

test("GA-0 and 1.0 remain closed from repo evidence", () => {
  for (const doc of [
    contents.spec,
    contents.evidence,
    contents.m6Readme,
    contents.release
  ]) {
    assert.match(doc, /M6-09/);
    assert.match(doc, /m6_final_acceptance_rollup_recorded/);
    assert.match(doc, /no_go_recommended_owner_decision_pending/);
    assert.match(doc, /GA-0.*closed|GA-0 remains locked|GA-0 is not open/i);
    assert.match(doc, /1\.0.*blocked|1\.0 approval is not granted/i);
    assert.doesNotMatch(doc, /GA-0 (is )?(approved|opened)\b/i);
    assert.doesNotMatch(doc, /production (is )?(approved|ready)\b/i);
    assert.doesNotMatch(doc, /1\.0 (is )?(approved|released)\b/i);
  }
});

test("No-go blockers cover current open M6 release gaps", () => {
  for (const token of [
    "J-01",
    "J-03",
    "L-01",
    "L-02",
    "C-01/C-02",
    "G-04",
    "G-06",
    "H-01",
    "H-05",
    "H-06",
    "D-06",
    "I-03",
    "I-04",
    "I-05",
    "alert channel",
    "bilingual guidance"
  ]) {
    assert.match(contents.evidence, new RegExp(escaped(token), "i"));
  }
});

test("P1 and P2 decisions are not fabricated", () => {
  assert.match(contents.acceptance, /P1 .*owner.*签字|P1.*owner/s);
  assert.match(contents.acceptance, /P2 .*修复池|P2.*修复池/s);
  assert.match(contents.evidence, /P1 risk signoffs\s*\|\s*`none_recorded`/);
  assert.match(contents.evidence, /P2 backlog items\s*\|\s*`none_recorded`/);
  assert.match(
    contents.evidence,
    /No M6-09 evidence downgrades open blockers to P1 or P2/
  );
  assert.doesNotMatch(contents.evidence, /P1 risk signoffs\s*\|\s*`accepted`/);
  assert.doesNotMatch(contents.evidence, /P2 backlog items\s*\|\s*`accepted`/);
});

test("M6 index and release boundary reflect final rollup", () => {
  for (const doc of [contents.m6Readme, contents.release]) {
    assert.match(doc, /M6-09 Final Acceptance/);
    assert.match(doc, /m6_final_acceptance_rollup_recorded_no_go_recommended/);
    assert.match(doc, /M6-08/);
    assert.match(doc, /M6-09 validation/);
  }
});

test("M6-09 remains docs/test-only", () => {
  assert.match(contents.spec, /Source files: 0 changed, 0 new, 0 net LOC/);
  assert.match(
    contents.spec,
    /Generated, lockfile, migration, schema, CI\/config changes: none/
  );
  assert.match(contents.spec, /Do not modify runtime source/);
  assert.doesNotMatch(
    contents.spec,
    /large_change_exception|external_dependency_exception/
  );
});
