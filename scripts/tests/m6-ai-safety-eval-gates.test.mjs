import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const read = (path) => readFileSync(path, "utf8");

const files = {
  acceptance: "UZMAX智能运营系统-1.0验收矩阵-v1.1.md",
  architecture: "UZMAX智能运营系统-技术架构-v1.1.md",
  spec: "docs/specs/M6-05-ai-safety-eval-gates.md",
  evidence: "docs/evidence/M6/M6-05-ai-safety-eval-gates.md",
  m6Readme: "docs/evidence/M6/README.md",
  release: "docs/release.md",
  runbook: "docs/runbooks/ai-safety-fuse.md",
  runbookIndex: "docs/runbooks/README.md",
  adr003: "docs/adr/ADR-003-llm-data-processing.md",
  evals: "packages/evals/src/index.ts",
  orderEval: "packages/evals/src/m4-order-read-no-fabrication.ts",
  llmGateway: "packages/llm-gateway/src/index.ts",
  engine: "packages/engine/src/index.ts",
  aiRuntime: "apps/api/src/ai-member-runtime.ts",
  m3Readme: "docs/evidence/M3/README.md",
  m303Evidence: "docs/evidence/M3/M3-03-eval-gate-redline-runner.md",
  m308Evidence: "docs/evidence/M3/M3-08-breaker-radius-and-redline-output-guard.md",
  m5r04Evidence: "docs/evidence/M5R/M5R-04-ai-member-runtime-control.md",
  llmTest: "scripts/tests/m3-llm-gateway-routing-accounting-foundation.test.mjs",
  evalGateTest: "scripts/tests/m3-eval-gate-redline-runner.test.mjs",
  breakerTest: "scripts/tests/m3-breaker-radius-redline-output-guard.test.mjs",
  orderEvalTest: "scripts/tests/m4-order-read-no-fabrication-eval-contract.test.mjs",
  runtimeEvalTest: "scripts/tests/m4-order-read-runtime-eval-gate.test.mjs",
  aiRuntimeTest: "scripts/tests/m5r-ai-member-runtime-control.test.mjs",
  seedTest: "scripts/tests/eval-gate.test.mjs"
};

const contents = Object.fromEntries(
  Object.entries(files).map(([key, path]) => [key, read(path)])
);

test("M6-05 maps AI safety acceptance items to repo evidence", () => {
  for (const token of [
    "F-01",
    "F-02",
    "F-03",
    "F-04",
    "F-05",
    "F-06",
    "G-01",
    "G-02",
    "G-03",
    "G-04",
    "G-05",
    "G-06",
    "J-04",
    "L-02"
  ]) {
    assert.match(contents.acceptance, new RegExp(token));
    assert.match(contents.evidence, new RegExp(token));
  }

  for (const path of [
    files.adr003,
    files.llmGateway,
    files.evals,
    files.engine,
    files.aiRuntime,
    files.m303Evidence,
    files.m308Evidence,
    files.m5r04Evidence,
    files.runbook
  ]) {
    assert.match(
      contents.evidence,
      new RegExp(path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    );
  }
});

test("M6-05 records eval gate non-bypass and no-fabrication behavior", () => {
  assert.match(contents.evals, /decideM3PublishGate/);
  assert.match(contents.evals, /prompt.*knowledge.*model_route.*persona/s);
  assert.match(contents.evals, /redline_missing/);
  assert.match(contents.evals, /redline_failed/);
  assert.match(contents.evalGateTest, /refuses publish unless a matching gate passed/);
  assert.match(contents.evalGateTest, /failed.*blocked.*pending/s);
  assert.match(contents.orderEval, /handoff_required/);
  assert.match(contents.orderEvalTest, /fabricated\.status, "failed"/);
  assert.match(contents.runtimeEvalTest, /fabricated.*failed/s);

  for (const token of [
    "Eval-gate bypass attempt",
    "Prompt, knowledge, model route and persona",
    "Order answer fabrication attempt"
  ]) {
    assert.match(contents.evidence, new RegExp(token));
  }
});

test("M6-05 records model-all-down, redaction, accounting and no real-provider boundary", () => {
  assert.match(contents.llmGateway, /fallbackProviderRefs/);
  assert.match(contents.llmGateway, /requiresRedactionMetadata/);
  assert.match(
    contents.llmGateway,
    /customer-facing tasks must not receive internalConfig/
  );
  assert.match(contents.llmTest, /records failed accounting when all providers fail/);
  assert.match(contents.llmTest, /costMicros, 0/);
  assert.match(contents.llmTest, /assertNoRawPromptOrCompletion/);
  assert.match(contents.adr003, /accepted_dev_only__customer_llm_blocked/);
  assert.match(contents.evidence, /mock_model_all_down_drill_not_real_provider/);
  assert.match(contents.evidence, /No real provider is added/);
});

test("M6-05 records redline output suppression and AI fuse radius without overclaiming", () => {
  assert.match(contents.engine, /evaluateBreakerRadius/);
  assert.match(contents.engine, /guardRedlineOutput/);
  assert.match(contents.engine, /decideEngineSafetyAction/);
  assert.match(
    contents.breakerTest,
    /single user attack scoped to user and never global/
  );
  assert.match(
    contents.breakerTest,
    /suppresses unsafe redline output without echoing/
  );
  assert.match(contents.breakerTest, /global_breaker_active/);
  assert.match(contents.breakerTest, /ticketRequired/);
  assert.match(
    contents.m308Evidence,
    /foundation-only|foundation_implemented_not_closed/
  );
  assert.match(contents.evidence, /Real GA Bot leave-ticket drill remains/);
});

test("M6-05 records AI member emergency and recovery gate evidence", () => {
  assert.match(contents.aiRuntime, /emergencyStop/);
  assert.match(contents.aiRuntime, /recoverOnline/);
  assert.match(contents.aiRuntime, /toggleCapability/);
  assert.match(contents.aiRuntimeTest, /passed eval gate/);
  assert.match(contents.aiRuntimeTest, /ai_member\.emergency_stop/);
  assert.match(contents.m5r04Evidence, /M3 Eval Gate \/ Breaker Non-Bypass Rule/);
  assert.match(contents.evidence, /AI fuse and recovery/);
});

test("AI safety runbook covers drills, commands and failure branches", () => {
  for (const token of [
    "Model All Down",
    "Redline Bad Send",
    "AI Fuse And Recovery",
    "m6-ai-safety-eval-gates.test.mjs",
    "m3-llm-gateway-routing-accounting-foundation.test.mjs",
    "m3-eval-gate-redline-runner.test.mjs",
    "m3-breaker-radius-redline-output-guard.test.mjs",
    "m5r-ai-member-runtime-control.test.mjs",
    "Close GA-0/release authorization"
  ]) {
    assert.match(contents.runbook, new RegExp(token));
  }
  assert.match(contents.runbookIndex, /ai-safety-fuse\.md/);
});

test("M6 index and release boundary reflect M6-05 without approving GA or customer LLM", () => {
  for (const doc of [contents.m6Readme, contents.release]) {
    assert.match(doc, /M6-05/);
    assert.match(doc, /GA-0 is not open|GA-0 remains locked/);
    assert.match(doc, /customer LLM.*not approved|Customer LLM/i);
    assert.match(doc, /real provider calls.*not approved|real provider/i);
  }

  for (const doc of [contents.spec, contents.evidence, contents.runbook]) {
    assert.match(
      doc,
      /not approve|not approved|not open|not granted|remain not approved/i
    );
    assert.doesNotMatch(doc, /GA-0 (is )?(approved|opened)\b/i);
    assert.doesNotMatch(doc, /customer LLM (is )?(approved|enabled)\b/i);
    assert.doesNotMatch(doc, /real provider calls? (are|is) approved\b/i);
  }
});

test("M6-05 remains docs/test-only and forbids source/schema/provider edits", () => {
  assert.match(contents.spec, /Source files: 0 changed, 0 new, 0 net LOC/);
  assert.match(
    contents.spec,
    /Generated, lockfile, migration, schema, CI\/config changes: none/
  );
  assert.match(contents.spec, /New LLM provider integration/);
  assert.match(contents.spec, /Do not modify app runtime source/);
  assert.doesNotMatch(
    contents.spec,
    /large_change_exception|external_dependency_exception/
  );
});
