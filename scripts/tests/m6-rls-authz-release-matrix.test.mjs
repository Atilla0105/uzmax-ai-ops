import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const read = (path) => readFileSync(path, "utf8");

const files = {
  acceptance: "UZMAX智能运营系统-1.0验收矩阵-v1.1.md",
  spec: "docs/specs/M6-04-rls-authz-release-matrix.md",
  evidence: "docs/evidence/M6/M6-04-rls-authz-release-matrix.md",
  m6Readme: "docs/evidence/M6/README.md",
  release: "docs/release.md",
  runbook: "docs/runbooks/rls-misconfig.md",
  adr001: "docs/adr/ADR-001-rls-prisma-pool.md",
  adr002: "docs/adr/ADR-002-dual-auth-access-context.md",
  spk03: "docs/evidence/M0/spikes/SPK-03-rls-prisma-pool/manifest.md",
  authz: "packages/authz/src/index.ts",
  accessContext: "apps/api/src/access-context.ts",
  rlsRunner: "apps/api/src/order-import.rls-runner.ts",
  m1AccessTest: "scripts/tests/m1-02-api-access-context.test.mjs",
  m1PlatformTest: "scripts/tests/m1-platform-foundation.test.mjs",
  m4BatchTest: "scripts/tests/m4-order-import-rls-batch-runner-contract.test.mjs",
  m4GatewayTest:
    "scripts/tests/m4-order-import-rls-transaction-gateway-contract.test.mjs",
  m5rEvidence: "docs/evidence/M5R/M5R-08-true-integration-closeout.md"
};

const contents = Object.fromEntries(
  Object.entries(files).map(([key, path]) => [key, read(path)])
);

test("M6-04 maps release RLS/authz acceptance items to repo evidence", () => {
  for (const token of [
    "B-01",
    "B-02",
    "B-03",
    "B-04",
    "B-05",
    "J-04",
    "J-06",
    "L-01"
  ]) {
    assert.match(contents.acceptance, new RegExp(token));
    assert.match(contents.evidence, new RegExp(token));
  }

  for (const path of [
    files.adr001,
    files.adr002,
    files.spk03,
    files.authz,
    files.accessContext,
    files.rlsRunner,
    files.m1AccessTest,
    files.m1PlatformTest,
    files.m4BatchTest,
    files.m4GatewayTest,
    files.m5rEvidence,
    files.runbook
  ]) {
    assert.match(
      contents.evidence,
      new RegExp(path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    );
  }
});

test("M6-04 evidence records fail-closed forged-context and backend-permission behavior", () => {
  assert.match(contents.authz, /tenant_access_denied/);
  assert.match(contents.authz, /permission_facts_mismatch/);
  assert.match(contents.authz, /assertPermission/);

  assert.match(contents.accessContext, /auth\.getUser\(token\)/);
  assert.doesNotMatch(contents.accessContext, /user_metadata[\s\S]{0,160}permissions/i);
  assert.match(contents.accessContext, /ApiAccessContextGuard/);
  assert.match(contents.accessContext, /RequirePermission/);

  for (const token of [
    "revoked/wrong tenant",
    "no JWT permission trust",
    "frontend hiding is not counted as authorization",
    "server-side context loader rejects non-member or revoked tenant"
  ]) {
    assert.match(contents.evidence, new RegExp(token));
  }
});

test("M6-04 evidence records RLS transaction guardrails and true-DB boundary", () => {
  assert.match(contents.rlsRunner, /set local role/i);
  assert.match(contents.rlsRunner, /app\.org_id/);
  assert.match(contents.rlsRunner, /app\.tenant_id/);
  assert.match(contents.m4BatchTest, /role.*set_config.*set_config.*business/s);
  assert.match(contents.m4GatewayTest, /ADR-001/);

  assert.match(contents.spk03, /accepted/);
  assert.match(contents.m5rEvidence, /passed_true_db/);
  assert.match(contents.evidence, /dev\/staging/);
  assert.match(contents.evidence, /Production DB\/RLS approval is not granted/);
});

test("M6-04 records group plaintext and audit boundaries without overclaiming release", () => {
  for (const token of [
    "aggregate-only",
    "production customer-plaintext review remains",
    "permission_grant.changed",
    "config_version.saved",
    "actor/time/before/after",
    "Full production audit review remains a release gate"
  ]) {
    assert.match(contents.evidence, new RegExp(token));
  }

  assert.match(contents.m1AccessTest, /permission_grant\.changed/);
  assert.match(contents.m1PlatformTest, /audit_log_content_before_after/);
});

test("RLS misconfiguration runbook exposes M6 release drill and failure branches", () => {
  for (const token of [
    "M6-04 release drill",
    "m6-rls-authz-release-matrix.test.mjs",
    "UZMAX_RLS_DATABASE_URL",
    "UZMAX_RLS_SET_ROLE=uzmax_spk03_ci",
    "forged tenant",
    "frontend-only",
    "关闭相关发布/GA-0 授权"
  ]) {
    assert.match(contents.runbook, new RegExp(token));
  }
});

test("M6 index and release boundary reflect M6-04 without approving GA or production", () => {
  for (const doc of [contents.m6Readme, contents.release]) {
    assert.match(doc, /M6-04/);
    assert.match(doc, /GA-0 is not open|GA-0 remains locked/);
    assert.match(
      doc,
      /Production readiness is not approved|production DB\/RLS approval is not granted/i
    );
  }

  for (const doc of [
    contents.spec,
    contents.evidence,
    contents.m6Readme,
    contents.release
  ]) {
    assert.match(doc, /not approve|not_approved|still_closed|not granted|not open/i);
    assert.doesNotMatch(doc, /GA-0 (is )?(approved|opened)\b/i);
    assert.doesNotMatch(doc, /GA-0: `?(open|approved)`?/i);
    assert.doesNotMatch(doc, /production (is )?(approved|ready)\b/i);
    assert.doesNotMatch(doc, /production: `?(approved|ready)`?/i);
  }
});

test("M6-04 remains docs/test-only and forbids source/schema edits", () => {
  assert.match(contents.spec, /Source files: 0 changed, 0 new, 0 net LOC/);
  assert.match(
    contents.spec,
    /Generated, lockfile, migration, schema, CI\/config changes: none/
  );

  for (const forbiddenPath of [
    "packages/db/",
    "packages/authz/",
    "apps/api/",
    "apps/admin/"
  ]) {
    assert.match(contents.spec, new RegExp(forbiddenPath.replace("/", "\\/")));
    assert.match(
      contents.spec,
      /Verify no `packages\/db\/\*\*`, `packages\/authz\/\*\*`, `apps\/api\/\*\*`, `apps\/admin\/\*\*`/
    );
  }
});
