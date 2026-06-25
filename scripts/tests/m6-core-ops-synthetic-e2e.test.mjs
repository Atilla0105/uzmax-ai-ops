import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const read = (path) => readFileSync(path, "utf8");

const files = {
  acceptance: "UZMAX智能运营系统-1.0验收矩阵-v1.1.md",
  spec: "docs/specs/M6-07-core-ops-synthetic-e2e.md",
  evidence: "docs/evidence/M6/M6-07-core-ops-synthetic-e2e.md",
  m6Readme: "docs/evidence/M6/README.md",
  release: "docs/release.md",
  runbook: "docs/runbooks/core-ops-synthetic-e2e.md",
  runbookIndex: "docs/runbooks/README.md",
  m601Evidence: "docs/evidence/M6/M6-01-release-gate-console.md",
  m604Evidence: "docs/evidence/M6/M6-04-rls-authz-release-matrix.md",
  m605Evidence: "docs/evidence/M6/M6-05-ai-safety-eval-gates.md",
  m606Evidence: "docs/evidence/M6/M6-06-telegram-bot-ga0-main-path.md",
  m203Evidence: "docs/evidence/M2/M2-03-conversation-handoff-ticket-api-contract.md",
  m204Evidence: "docs/evidence/M2/M2-04-admin-conversation-ticket-shell.md",
  m207Evidence: "docs/evidence/M2/M2-07-conversation-ticket-api-http-hardening.md",
  m437Evidence: "docs/evidence/M4/M4-37-order-import-admin-true-db-http-smoke.md",
  m442Evidence: "docs/evidence/M4/M4-42-order-import-operator-workflow.md",
  m443Evidence: "docs/evidence/M4/M4-43-customer-asset-runtime-workflow.md",
  m444Evidence: "docs/evidence/M4/M4-44-order-read-runtime-eval-gate.md",
  m503Evidence: "docs/evidence/M5/M5-03-confirmation-queue-api.md",
  m504Evidence: "docs/evidence/M5/M5-04-confirmation-queue-admin.md",
  m506Evidence: "docs/evidence/M5/M5-06-logs-analytics.md",
  m508Evidence: "docs/evidence/M5/M5-08-integration-smoke-closeout.md",
  m5r01Evidence: "docs/evidence/M5R/M5R-01-confirmation-queue-persistence.md",
  m5r02Evidence: "docs/evidence/M5R/M5R-02-formal-write-pipeline.md",
  m5r05Evidence: "docs/evidence/M5R/M5R-05-logs-analytics-runtime.md",
  m5r07Evidence: "docs/evidence/M5R/M5R-07-admin-runtime-wiring.md",
  m5r08Evidence: "docs/evidence/M5R/M5R-08-true-integration-closeout.md",
  conversationTest: "scripts/tests/m2-conversation-ticket-api-contract.test.mjs",
  customerAssetTest: "scripts/tests/m4-customer-asset-runtime-workflow.test.mjs",
  orderWorkflowTest: "scripts/tests/m4-order-import-operator-workflow.test.mjs",
  orderEvalTest: "scripts/tests/m4-order-read-runtime-eval-gate.test.mjs",
  confirmationTest: "scripts/tests/m5-confirmation-queue-api.test.mjs",
  formalWriteTest: "scripts/tests/m5r-formal-write-pipeline.test.mjs",
  logsTest: "scripts/tests/m5r-logs-analytics-runtime.test.mjs",
  adminRuntimeTest: "scripts/tests/m5r-admin-runtime-wiring.test.mjs"
};

const contents = Object.fromEntries(
  Object.entries(files).map(([key, path]) => [key, read(path)])
);

const escaped = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

test("M6-07 maps the core operations path to repo evidence", () => {
  for (const token of [
    "A-01",
    "A-02",
    "A-04",
    "A-05",
    "D-01",
    "D-02",
    "D-03",
    "D-04",
    "D-05",
    "D-06",
    "D-07",
    "E-01",
    "E-02",
    "E-03",
    "E-04",
    "H-01",
    "H-02",
    "H-03",
    "H-04",
    "H-05",
    "H-06",
    "H-07",
    "I-01",
    "I-02",
    "I-03",
    "I-04",
    "I-05",
    "I-06",
    "I-07"
  ]) {
    assert.match(contents.acceptance, new RegExp(token));
    assert.match(contents.evidence, new RegExp(token));
  }

  for (const path of [
    files.m601Evidence,
    files.m604Evidence,
    files.m605Evidence,
    files.m606Evidence,
    files.m203Evidence,
    files.m204Evidence,
    files.m207Evidence,
    files.m437Evidence,
    files.m442Evidence,
    files.m443Evidence,
    files.m444Evidence,
    files.m503Evidence,
    files.m504Evidence,
    files.m506Evidence,
    files.m508Evidence,
    files.m5r01Evidence,
    files.m5r02Evidence,
    files.m5r05Evidence,
    files.m5r07Evidence,
    files.m5r08Evidence,
    files.runbook
  ]) {
    assert.match(contents.evidence, new RegExp(escaped(path)));
  }
});

test("Conversation, ticket and admin visibility stages stay grounded in existing evidence", () => {
  assert.match(contents.m203Evidence, /pending_handoff/);
  assert.match(contents.m203Evidence, /AI suspended/);
  assert.match(contents.m203Evidence, /withdrawn.*pending_cancel/s);
  assert.match(contents.m204Evidence, /conversation \/ ticket UI shell/);
  assert.match(contents.m207Evidence, /lock ownership conflicts map to 409/);
  assert.match(contents.conversationTest, /creates a handoff ticket draft/);
  assert.match(contents.evidence, /Real multi-support-account production drill/);
});

test("Customer and order stages include runtime evidence and no-fabrication behavior", () => {
  assert.match(contents.m443Evidence, /Customer readback/);
  assert.match(contents.m443Evidence, /Tenant isolation/);
  assert.match(contents.customerAssetTest, /restore/i);
  assert.match(
    contents.m442Evidence,
    /Storage TSV download->worker dispatch->DB\/RLS readback/
  );
  assert.match(contents.m437Evidence, /Admin client -> Nest HTTP -> API -> DB\/RLS/);
  assert.match(contents.orderWorkflowTest, /stale\/missing handoff|stale.*missing/s);
  assert.match(contents.m444Evidence, /no-fabrication/i);
  assert.match(contents.orderEvalTest, /handoff_required/);
  assert.match(contents.evidence, /External order API branch remains out/);
});

test("Confirmation, formal-write, logs and runtime admin wiring remain bounded", () => {
  assert.match(contents.m503Evidence, /formalWrite: false/);
  assert.match(contents.m504Evidence, /side-by-side diff/);
  assert.match(contents.confirmationTest, /formalWrite/);
  assert.match(contents.m5r01Evidence, /rls_prisma_gateway/);
  assert.match(contents.m5r02Evidence, /config_version.*audit_log/s);
  assert.match(contents.formalWriteTest, /formal write/i);
  assert.match(contents.m506Evidence, /formalExportWrite: false/);
  assert.match(contents.m5r05Evidence, /fileRef: null/);
  assert.match(contents.logsTest, /export draft/i);
  assert.match(contents.m5r07Evidence, /__UZMAX_M5R_ADMIN_RUNTIME__/);
  assert.match(contents.m5r07Evidence, /\/logs-analytics\/board/);
});

test("Runbook covers the complete synthetic replay and failure branches", () => {
  for (const token of [
    "Conversation and ticket",
    "Customer asset",
    "Order snapshot",
    "No-fabrication",
    "Confirmation and formal write",
    "Logs and admin visibility",
    "m6-core-ops-synthetic-e2e.test.mjs",
    "m5r-admin-runtime-wiring.test.mjs",
    "GA-0/1.0 closed"
  ]) {
    assert.match(contents.runbook, new RegExp(escaped(token)));
  }
  assert.match(contents.runbookIndex, /core-ops-synthetic-e2e\.md/);
});

test("M6 index and release boundary reflect M6-07 without opening GA or production", () => {
  for (const doc of [contents.m6Readme, contents.release]) {
    assert.match(doc, /M6-07/);
    assert.match(doc, /m6_core_ops_synthetic_e2e_recorded/);
    assert.match(doc, /GA-0 is not open|GA-0 remains locked/);
    assert.match(doc, /real customer/i);
    assert.match(doc, /1\.0 release/i);
  }

  for (const doc of [contents.spec, contents.evidence, contents.runbook]) {
    assert.match(
      doc,
      /not approve|not approved|not open|not granted|does not approve|remains not approved/i
    );
    assert.doesNotMatch(doc, /GA-0 (is )?(approved|opened)\b/i);
    assert.doesNotMatch(doc, /production (is )?(approved|ready)\b/i);
    assert.doesNotMatch(doc, /real customer\/order data (is )?approved\b/i);
  }
});

test("M6-07 remains docs/test-only and records remaining gaps explicitly", () => {
  assert.match(contents.spec, /Source files: 0 changed, 0 new, 0 net LOC/);
  assert.match(
    contents.spec,
    /Generated, lockfile, migration, schema, CI\/config changes: none/
  );
  assert.match(contents.spec, /Do not modify runtime source/);
  assert.match(contents.spec, /New DB schema, migration, generated Prisma client/);
  assert.doesNotMatch(
    contents.spec,
    /large_change_exception|external_dependency_exception/
  );

  for (const token of [
    "D-06 anonymization",
    "I-03 performance",
    "I-04 realtime",
    "I-05 final visual",
    "H-01 broad authoring",
    "H-05 asset recovery",
    "H-06 full quick-reply"
  ]) {
    assert.match(contents.evidence, new RegExp(escaped(token)));
  }
});
