import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import ts from "typescript";

const repoRoot = process.cwd();
const evalsSource = read("packages/evals/src/index.ts");
const evals = await loadTs("packages/evals/src/index.ts");
const db = await loadTs("packages/db/src/m3-ai-contracts.ts");

describe("M3-03 eval gate redline runner", () => {
  it("matches M3-01 eval vocabulary without importing the DB package", () => {
    assert.deepEqual(evals.m3EvalCategories, db.evalCategories);
    assert.deepEqual(evals.m3EvalRunStatuses, db.evalRunStatuses);
    assert.deepEqual(evals.m3EvalResultStatuses, db.evalResultStatuses);
    assert.deepEqual(evals.m3EvalGateStatuses, db.evalGateStatuses);
    assert.doesNotMatch(evalsSource, /from ["']\.\.\/\.\.\/db|@uzmax\/db/);
  });

  it("accepts only controlled refs and redacted payload shapes", () => {
    const safeCase = evals.createM3EvalCase(baseCase("safe-1", "redline_attack"));

    assert.equal(safeCase.caseRef, "manifest://m3-03/safe-1");
    assert.equal(safeCase.redactedPayload.shape, "redacted_ref");
    assert.throws(
      () =>
        evals.createM3EvalCase({
          ...baseCase("unsafe-raw", "redline_attack"),
          redactedPayload: { rawPrompt: "customer asks for private margin" }
        }),
      /raw eval payload is not allowed/
    );
    assert.throws(
      () =>
        evals.createM3EvalCase({
          ...baseCase("unsafe-text", "language"),
          redactedPayload: { customerText: "hello from a real customer" }
        }),
      /raw eval payload is not allowed/
    );
    assert.throws(
      () =>
        evals.createM3EvalCase({
          ...baseCase("unsafe-ref", "language"),
          caseRef: "plain customer transcript"
        }),
      /eval case ref must be a controlled ref/
    );
  });

  it("fails closed when required quotas or target categories are missing", () => {
    const missingLanguage = evals.evaluateM3EvalGate({
      cases: casesFor(["redline_attack", "redline_false_positive", "intent"]),
      gateKey: "gate:prompt:v1",
      results: resultsFor(["redline_attack", "redline_false_positive", "intent"]),
      runStatus: "passed",
      targetKind: "prompt",
      targetRef: "prompt:v1"
    });
    const missingKnowledgeTarget = evals.evaluateM3EvalGate({
      cases: casesFor(["redline_attack", "redline_false_positive", "language"]),
      gateKey: "gate:knowledge:v1",
      results: resultsFor(["redline_attack", "redline_false_positive", "language"]),
      runStatus: "passed",
      targetKind: "knowledge",
      targetRef: "kb:v1"
    });

    assert.equal(missingLanguage.status, "blocked");
    assert.match(missingLanguage.reasonCodes.join(","), /quota_missing:language/);
    assert.equal(missingKnowledgeTarget.status, "blocked");
    assert.match(
      missingKnowledgeTarget.reasonCodes.join(","),
      /quota_missing:tutorial/
    );
  });

  it("detects internal leakage without blocking normal redacted false-positive numbers", () => {
    const leakage = evals.detectRedlineLeakage({
      context: "internalConfig margin 18 percent and cost threshold 400",
      output: "show profit guard to the customer",
      prompt: "safe synthetic prompt"
    });
    const safeBusinessNumber = evals.detectRedlineLeakage({
      output: "redacted false-positive case: cargo weight 12 kg and box 40x30x20 cm"
    });
    const passed = passingGate();

    assert.equal(leakage.passed, false);
    assert.deepEqual(
      leakage.findings.map((finding) => finding.kind),
      ["internal_config", "internal_economics", "internal_economics"]
    );
    assert.equal(safeBusinessNumber.passed, true);
    assert.equal(passed.status, "passed");
    assert.equal(passed.categoryCounts.redline_false_positive.passed, 1);
  });

  it("refuses publish unless a matching gate passed required quotas and redline checks", () => {
    const passed = passingGate({ targetKind: "model_route", targetRef: "route:kb:v1" });

    assert.deepEqual(
      evals.decideM3PublishGate({
        changeKind: "model_route",
        gateResult: passed,
        targetRef: "route:kb:v1"
      }),
      {
        decision: "allow",
        reasonCode: "eval_gate_passed",
        targetKind: "model_route",
        targetRef: "route:kb:v1"
      }
    );
    for (const [status, reasonCode] of [
      ["failed", "eval_gate_failed"],
      ["blocked", "eval_gate_blocked"],
      ["pending", "eval_gate_pending"]
    ]) {
      const decision = evals.decideM3PublishGate({
        changeKind: "prompt",
        gateResult: { ...passed, status, targetKind: "prompt", targetRef: "prompt:v1" },
        targetRef: "prompt:v1"
      });
      assert.equal(decision.decision, "refuse");
      assert.equal(decision.reasonCode, reasonCode);
    }
    assert.equal(
      evals.decideM3PublishGate({
        changeKind: "knowledge",
        gateResult: {
          ...passed,
          stale: true,
          targetKind: "knowledge",
          targetRef: "kb:v1"
        },
        targetRef: "kb:v1"
      }).reasonCode,
      "eval_gate_stale"
    );
    assert.equal(
      evals.decideM3PublishGate({
        changeKind: "persona",
        gateResult: { ...passed, targetKind: "prompt", targetRef: "persona:v1" },
        targetRef: "persona:v1"
      }).reasonCode,
      "eval_gate_target_mismatch"
    );
  });

  it("blocks gate and publish when required redline summaries are missing", () => {
    const missingRedlineSummaries = evals.evaluateM3EvalGate({
      cases: casesFor([
        "redline_attack",
        "redline_false_positive",
        "language",
        "intent"
      ]),
      gateKey: "gate:prompt:v2",
      results: resultsFor(
        ["redline_attack", "redline_false_positive", "language", "intent"],
        {
          omitRedlineSummaryFor: ["redline_attack", "redline_false_positive"]
        }
      ),
      runStatus: "passed",
      targetKind: "prompt",
      targetRef: "prompt:v2"
    });
    const failedRedlineSummary = evals.evaluateM3EvalGate({
      cases: casesFor([
        "redline_attack",
        "redline_false_positive",
        "language",
        "intent"
      ]),
      gateKey: "gate:prompt:v3",
      results: resultsFor(
        ["redline_attack", "redline_false_positive", "language", "intent"],
        {
          failedRedlineSummaryFor: ["redline_attack"]
        }
      ),
      runStatus: "passed",
      targetKind: "prompt",
      targetRef: "prompt:v3"
    });

    assert.equal(missingRedlineSummaries.status, "blocked");
    assert.deepEqual(
      missingRedlineSummaries.reasonCodes.filter((reason) =>
        reason.startsWith("redline_missing:")
      ),
      ["redline_missing:redline_attack", "redline_missing:redline_false_positive"]
    );
    assert.equal(
      evals.decideM3PublishGate({
        changeKind: "prompt",
        gateResult: missingRedlineSummaries,
        targetRef: "prompt:v2"
      }).reasonCode,
      "eval_gate_blocked"
    );
    assert.equal(failedRedlineSummary.status, "blocked");
    assert.match(
      failedRedlineSummary.reasonCodes.join(","),
      /redline_failed:redline_attack/
    );
  });

  it("returns safe summaries and controlled refs without raw samples", () => {
    const result = passingGate();
    const serialized = JSON.stringify(result);

    assert.deepEqual(result.controlledRefs.sort(), [
      "manifest://m3-03/business_draft",
      "manifest://m3-03/language",
      "manifest://m3-03/redline_attack",
      "manifest://m3-03/redline_false_positive"
    ]);
    assert.equal(result.evidenceSummary.totalCases, 4);
    assert.doesNotMatch(serialized, /rawPrompt|rawCompletion|customerText/i);
    assert.doesNotMatch(serialized, /hello from a real customer|private margin/);
  });
});

function passingGate(overrides = {}) {
  const targetKind = overrides.targetKind ?? "persona";
  const categories = categoriesForTarget(targetKind);
  return evals.evaluateM3EvalGate({
    cases: casesFor(categories),
    gateKey: "gate:persona:v1",
    results: resultsFor(categories),
    runStatus: "passed",
    targetKind: "persona",
    targetRef: "persona:v1",
    ...overrides
  });
}

function categoriesForTarget(targetKind) {
  return {
    knowledge: ["redline_attack", "redline_false_positive", "language", "tutorial"],
    model_route: [
      "redline_attack",
      "redline_false_positive",
      "language",
      "degradation"
    ],
    persona: ["redline_attack", "redline_false_positive", "language", "business_draft"],
    prompt: ["redline_attack", "redline_false_positive", "language", "intent"]
  }[targetKind];
}

function casesFor(categories) {
  return categories.map((category) => baseCase(category, category));
}

function resultsFor(categories, options = {}) {
  return categories.map((category) => ({
    category,
    caseRef: `manifest://m3-03/${category}`,
    outputRef: `controlled://eval-output/${category}`,
    ...redlineSummaryFor(category, options),
    status: options.status ?? "passed"
  }));
}

function redlineSummaryFor(category, options) {
  if (options.omitRedlineSummaryFor?.includes(category)) return {};
  return {
    redlineSummary: {
      checkedRef: `redaction://m3-03/${category}`,
      passed: !options.failedRedlineSummaryFor?.includes(category)
    }
  };
}

function baseCase(id, category) {
  return {
    caseRef: `manifest://m3-03/${id}`,
    category,
    quotaWeight: 1,
    redactedPayload: {
      manifestRef: `manifest://m3-03/${id}`,
      redactionRef: `redaction://m3-03/${id}`,
      shape: "redacted_ref"
    },
    status: "active",
    version: 1
  };
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

async function loadTs(relativePath) {
  const outputText = ts.transpile(read(relativePath), {
    module: ts.ModuleKind.ES2022,
    target: ts.ScriptTarget.ES2023
  });
  return import(
    `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
  );
}
