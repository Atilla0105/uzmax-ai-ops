import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const read = (path) => readFileSync(path, "utf8");

const files = {
  acceptance: "UZMAX智能运营系统-1.0验收矩阵-v1.1.md",
  spec: "docs/specs/M6-08-backup-restore-asset-safety.md",
  evidence: "docs/evidence/M6/M6-08-backup-restore-asset-safety.md",
  m6Readme: "docs/evidence/M6/README.md",
  release: "docs/release.md",
  runbook: "docs/runbooks/backup-restore.md",
  runbookIndex: "docs/runbooks/README.md",
  supabaseManifest: "docs/evidence/M0/infra/supabase-env-manifest.md",
  m602Evidence: "docs/evidence/M6/M6-02-runtime-deploy-baseline.md",
  m607Evidence: "docs/evidence/M6/M6-07-core-ops-synthetic-e2e.md",
  m301Evidence: "docs/evidence/M3/M3-01-ai-capability-data-contracts-foundation.md",
  m304Evidence: "docs/evidence/M3/M3-04-kb-journey-capability-foundation.md",
  m316Evidence: "docs/evidence/M3/M3-16-kb-material-candidates.md",
  m320Evidence: "docs/evidence/M3/M3-20-vision-screenshot-samples.md",
  m507Evidence: "docs/evidence/M5/M5-07-template-center.md",
  m5r02Evidence: "docs/evidence/M5R/M5R-02-formal-write-pipeline.md",
  m5r06Evidence: "docs/evidence/M5R/M5R-06-template-copy-runtime.md",
  m5r08Evidence: "docs/evidence/M5R/M5R-08-true-integration-closeout.md",
  dbContracts: "packages/db/src/m3-ai-contracts.ts",
  visionSource: "packages/capabilities/vision/src/index.ts",
  channelsSource: "packages/channels/src/index.ts",
  formalWriteSource: "apps/api/src/confirmation-queue.formal-write.ts",
  templateContracts: "apps/api/src/template-copy-runtime.contracts.ts"
};

const contents = Object.fromEntries(
  Object.entries(files).map(([key, path]) => [key, read(path)])
);

const escaped = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

test("M6-08 maps backup restore and asset safety acceptance items", () => {
  for (const token of [
    "A-03",
    "H-01",
    "H-02",
    "H-03",
    "H-04",
    "H-05",
    "H-06",
    "J-03",
    "J-04",
    "L-01"
  ]) {
    assert.match(contents.acceptance, new RegExp(token));
    assert.match(contents.evidence, new RegExp(token));
  }

  for (const path of [
    files.runbook,
    files.supabaseManifest,
    files.m602Evidence,
    files.m607Evidence,
    files.m301Evidence,
    files.m304Evidence,
    files.m316Evidence,
    files.m320Evidence,
    files.m507Evidence,
    files.m5r02Evidence,
    files.m5r06Evidence,
    files.m5r08Evidence,
    files.dbContracts,
    files.visionSource,
    files.channelsSource
  ]) {
    assert.match(contents.evidence, new RegExp(escaped(path)));
  }
});

test("J-03 is blocked by missing safe restore target instead of overclaimed", () => {
  assert.match(contents.supabaseManifest, /staging.*pending/s);
  assert.match(contents.supabaseManifest, /prod.*pending/s);
  assert.match(contents.evidence, /external_blocker_safe_restore_target_missing/);
  assert.match(contents.evidence, /safe restore target.*missing/i);
  assert.match(contents.evidence, /backup snapshot.*missing/i);
  assert.match(contents.evidence, /restore command.*not_run/i);
  assert.doesNotMatch(contents.evidence, /J-03.*closed/i);
  assert.doesNotMatch(contents.evidence, /restore.*passed_true_db/i);
});

test("Backup restore runbook forbids production overwrite and records validation requirements", () => {
  for (const token of [
    "禁止直接覆盖生产库",
    "safe restore target",
    "backup snapshot",
    "RLS",
    "audit_log",
    "config_version",
    "storageRef",
    "Telegram `file_id`",
    "J-03 不通过"
  ]) {
    assert.match(contents.runbook, new RegExp(escaped(token)));
  }
  assert.match(contents.runbookIndex, /backup-restore\.md/);
});

test("Asset source of truth is storageRef while provider file IDs remain cache metadata", () => {
  assert.match(contents.dbContracts, /createMediaAssetContract/);
  assert.match(contents.dbContracts, /storageRef/);
  assert.match(contents.visionSource, /controlledRef\(input\.storageRef/);
  assert.match(contents.visionSource, /manifestRef/);
  assert.match(contents.visionSource, /redactionRef/);
  assert.match(contents.channelsSource, /file_id/);
  assert.match(contents.evidence, /Telegram `file_id` as cache\/provider metadata/);
  assert.match(contents.evidence, /storageRef.*durable material body/);
});

test("Formal writes stay behind confirmation or named draft template paths", () => {
  assert.match(contents.m5r02Evidence, /Pending\/discarded\/blocked.*never call/s);
  assert.match(contents.m5r02Evidence, /Approved\/edited decisions write only/s);
  assert.match(contents.formalWriteSource, /targetKind: "config_version"/);
  assert.match(contents.m5r06Evidence, /status = DRAFT/);
  assert.match(contents.m5r06Evidence, /formalTenantWrite: false/);
  assert.match(contents.m5r06Evidence, /templateAutoOverwrite: false/);
  assert.match(contents.templateContracts, /quick_reply/);
  assert.match(contents.m316Evidence, /not_published|not official KB publish/i);
  assert.match(contents.evidence, /No formal knowledge write occurs without/);
});

test("M6 index and release boundary reflect M6-08 without opening GA or production", () => {
  for (const doc of [contents.m6Readme, contents.release]) {
    assert.match(doc, /M6-08/);
    assert.match(doc, /m6_backup_restore_asset_safety_recorded/);
    assert.match(doc, /GA-0 is not open|GA-0 remains locked/);
    assert.match(doc, /J-03/);
    assert.match(doc, /H-05/);
    assert.match(doc, /H-06/);
  }

  for (const doc of [contents.spec, contents.evidence, contents.runbook]) {
    assert.match(
      doc,
      /not approve|not approved|not open|not granted|does not approve|不得进入正式发布/i
    );
    assert.doesNotMatch(doc, /GA-0 (is )?(approved|opened)\b/i);
    assert.doesNotMatch(doc, /production (is )?(approved|ready)\b/i);
    assert.doesNotMatch(doc, /real customer\/order data (is )?approved\b/i);
  }
});

test("M6-08 remains docs/test-only and records remaining gaps explicitly", () => {
  assert.match(contents.spec, /Source files: 0 changed, 0 new, 0 net LOC/);
  assert.match(
    contents.spec,
    /Generated, lockfile, migration, schema, CI\/config changes: none/
  );
  assert.match(contents.spec, /Do not modify runtime source/);
  assert.match(contents.spec, /Production destructive restore/);
  assert.doesNotMatch(
    contents.spec,
    /large_change_exception|external_dependency_exception/
  );

  for (const token of [
    "H-01 full facts/journeys/stages/materials authoring",
    "H-05 real storage rebuild/token-rotation drill",
    "H-06 full quick-reply public/private library workflow",
    "J-03 cannot close"
  ]) {
    assert.match(contents.evidence, new RegExp(escaped(token)));
  }
});
