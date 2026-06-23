import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import ts from "typescript";

const repoRoot = process.cwd();
const source = read("packages/evals/src/index.ts");
const m4EvalSource = read("packages/evals/src/m4-order-read-no-fabrication.ts");
const spec = read("docs/specs/M4-22-order-read-no-fabrication-eval-contract.md");
const evidence = read(
  "docs/evidence/M4/M4-22-order-read-no-fabrication-eval-contract.md"
);
const m4Index = read("docs/evidence/M4/README.md");
const evalsReadme = read("docs/evals/README.md");
const evals = await importTypescriptSource("packages/evals/src/index.ts");

describe("M4-22 order-read no-fabrication eval contract", () => {
  it("exports a pure eval contract without runtime, provider, DB, or capability imports", () => {
    assert.equal(evals.packageName, "@uzmax/evals");
    assert.equal(typeof evals.evaluateM4OrderReadNoFabrication, "function");
    assert.equal(evals.m4OrderReadEvalShape, "m4_order_read_no_fabrication");
    assert.equal(
      evals.m4OrderReadEvalReasonCodes.orderSnapshotStale,
      "order_snapshot_stale"
    );
    assert.equal(evals.m4OrderReadCandidateAnswerKinds.handoff, "handoff");
    assert.doesNotMatch(evalSources(), /@uzmax\/db|packages\/db|@prisma\/client/i);
    assert.doesNotMatch(evalSources(), /from ["'][^"']*apps\//);
    assert.doesNotMatch(
      evalSources(),
      /from ["'][^"']*(?:packages\/capabilities|capabilities\/order-read)|@uzmax\/capability-order-read/
    );
    assert.doesNotMatch(evalSources(), /process\.env|globalThis\.fetch|\bfetch\(/i);
  });

  it("passes missing, stale, and degraded cases only when the candidate hands off without status refs", () => {
    for (const reasonCode of [
      "order_snapshot_missing",
      "order_snapshot_stale",
      "order_data_degraded"
    ]) {
      const result = evals.evaluateM4OrderReadNoFabrication(evalInput({ reasonCode }));

      assert.equal(result.status, "passed");
      assert.equal(result.category, evals.m3EvalCategories.degradation);
      assert.deepEqual(result.reasonCodes, []);
      assert.equal(result.redlineSummary.passed, true);
      assert.equal(result.redactedPayload.shape, "m4_order_read_no_fabrication");
      assert.ok(result.controlledRefs.includes("query://order/read-a"));
      assert.doesNotMatch(JSON.stringify(result), /rawPrompt|rawCompletion|plaintext/);
    }

    const fabricated = evals.evaluateM4OrderReadNoFabrication(
      evalInput({
        candidate: {
          answerKind: "order_snapshot_summary",
          handoffRequired: false,
          logisticsStatusRef: "status://logistics/in-transit",
          orderStatusRef: "status://order/in-transit"
        },
        reasonCode: "order_snapshot_stale"
      })
    );

    assert.equal(fabricated.status, "failed");
    assert.ok(fabricated.reasonCodes.includes("handoff_required_missing"));
    assert.ok(fabricated.reasonCodes.includes("handoff_answer_kind_required"));
    assert.ok(fabricated.reasonCodes.includes("order_status_ref_exposed_on_handoff"));
    assert.ok(
      fabricated.reasonCodes.includes("logistics_status_ref_exposed_on_handoff")
    );
    assert.equal(fabricated.redlineSummary.passed, false);
  });

  it("passes fresh snapshot cases only with a controlled status ref and no handoff", () => {
    const fresh = evals.evaluateM4OrderReadNoFabrication(
      evalInput({
        candidate: {
          answerKind: "order_snapshot_summary",
          handoffRequired: false,
          orderStatusRef: "status://order/in-transit"
        },
        reasonCode: "snapshot_fresh",
        readStatus: "snapshot_ready"
      })
    );

    assert.equal(fresh.status, "passed");
    assert.deepEqual(fresh.reasonCodes, []);
    assert.ok(fresh.controlledRefs.includes("status://order/in-transit"));

    const malformedFresh = evals.evaluateM4OrderReadNoFabrication(
      evalInput({
        candidate: {
          answerKind: "order_snapshot_summary",
          handoffRequired: true
        },
        reasonCode: "snapshot_fresh",
        readStatus: "snapshot_ready"
      })
    );

    assert.equal(malformedFresh.status, "failed");
    assert.ok(malformedFresh.reasonCodes.includes("fresh_handoff_forbidden"));
    assert.ok(malformedFresh.reasonCodes.includes("fresh_status_ref_required"));

    const staleMarkedFresh = evals.evaluateM4OrderReadNoFabrication(
      evalInput({
        candidate: {
          answerKind: "order_snapshot_summary",
          handoffRequired: false,
          orderStatusRef: "status://order/in-transit"
        },
        reasonCode: "order_snapshot_stale",
        readStatus: "snapshot_ready"
      })
    );
    const freshMarkedHandoff = evals.evaluateM4OrderReadNoFabrication(
      evalInput({
        reasonCode: "snapshot_fresh",
        readStatus: "handoff_required"
      })
    );

    assert.equal(staleMarkedFresh.status, "failed");
    assert.ok(
      staleMarkedFresh.reasonCodes.includes("order_read_status_reason_mismatch")
    );
    assert.equal(freshMarkedHandoff.status, "failed");
    assert.ok(
      freshMarkedHandoff.reasonCodes.includes("order_read_status_reason_mismatch")
    );
  });

  it("returns M3-compatible safe payload summaries and rejects raw fields", () => {
    const result = evals.evaluateM4OrderReadNoFabrication(
      evalInput({
        candidate: {
          answerKind: "order_snapshot_summary",
          handoffRequired: false,
          orderStatusRef: "status://order/in-transit"
        },
        reasonCode: "snapshot_fresh",
        readStatus: "snapshot_ready"
      })
    );
    const evalCase = evals.createM3EvalCase({
      caseRef: result.caseRef,
      category: result.category,
      redactedPayload: result.redactedPayload,
      status: "active"
    });

    assert.equal(evalCase.redactedPayload.shape, "m4_order_read_no_fabrication");
    assert.deepEqual(Object.keys(result.redactedPayload).sort(), [
      "checkedRef",
      "manifestRef",
      "outputRef",
      "shape"
    ]);
    assert.deepEqual(Object.keys(result.redlineSummary).sort(), [
      "checkedRef",
      "outputRef",
      "passed",
      "shape"
    ]);

    assert.throws(
      () => evals.evaluateM4OrderReadNoFabrication({ ...evalInput(), rawPrompt: "x" }),
      /raw order-read eval field is not allowed: rawPrompt/
    );
    assert.throws(
      () =>
        evals.evaluateM4OrderReadNoFabrication(
          evalInput({ candidate: { ...evalInput().candidate, rawCompletion: "x" } })
        ),
      /raw order-read eval field is not allowed: rawCompletion/
    );
    assert.throws(
      () =>
        evals.evaluateM4OrderReadNoFabrication(
          evalInput({
            candidate: {
              answerKind: "order_snapshot_summary",
              handoffRequired: false,
              orderStatusRef: "https://example.test/status"
            },
            reasonCode: "snapshot_fresh",
            readStatus: "snapshot_ready"
          })
        ),
      /order status ref must be a controlled ref/
    );
    assert.throws(
      () =>
        evals.evaluateM4OrderReadNoFabrication(
          evalInput({
            candidate: {
              answerKind: "order_snapshot_summary",
              handoffRequired: false,
              orderStatusRef: "storage://order/status-ref"
            },
            reasonCode: "snapshot_fresh",
            readStatus: "snapshot_ready"
          })
        ),
      /order status ref must be a controlled ref/
    );
  });

  it("records M4-22 scope without API, raw-data, runtime, or release claims", () => {
    assert.match(spec, /E-04/);
    assert.match(spec, /不新增 `order_connector`/);
    assert.match(evidence, /no raw customer\/order data/);
    assert.match(evidence, /no external order API/i);
    assert.match(m4Index, /M4-22 order-read no-fabrication eval contract/);
    assert.match(evalsReadme, /M4 Order-Read No-Fabrication Eval Contract/);
  });
});

function evalInput(overrides = {}) {
  const base = {
    candidate: {
      answerKind: "handoff",
      handoffRequired: true
    },
    caseRef: "manifest://m4-order-read/case-a",
    checkedRef: "controlled://m4-order-read/check-a",
    manifestRef: "manifest://m4-order-read/no-fabrication",
    outputRef: "storage://m4-order-read/output-a",
    queryRef: "query://order/read-a",
    readStatus: "handoff_required",
    reasonCode: "order_snapshot_stale"
  };
  return {
    ...base,
    ...overrides,
    candidate: {
      ...base.candidate,
      ...(overrides.candidate ?? {})
    }
  };
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function evalSources() {
  return `${source}\n${m4EvalSource}`;
}

async function importTypescriptSource(relativePath) {
  return import(transpiledModuleUrl(relativePath));
}

function transpiledModuleUrl(relativePath) {
  const sourceText = read(relativePath);
  const compilerOptions = {
    module: ts.ModuleKind.ES2022,
    target: ts.ScriptTarget.ES2023
  };
  const { outputText } = ts.transpileModule(sourceText, {
    compilerOptions,
    fileName: relativePath
  });
  const localM4Url = transpiledLeafUrl(
    "packages/evals/src/m4-order-read-no-fabrication.ts"
  );
  const resolvedOutput = outputText.replaceAll(
    '"./m4-order-read-no-fabrication.ts"',
    JSON.stringify(localM4Url)
  );
  return dataUrl(resolvedOutput);
}

function transpiledLeafUrl(relativePath) {
  const { outputText } = ts.transpileModule(read(relativePath), {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2023
    },
    fileName: relativePath
  });
  return dataUrl(outputText);
}

function dataUrl(outputText) {
  const specifier = `data:text/javascript;base64,${Buffer.from(outputText).toString(
    "base64"
  )}`;
  return specifier;
}
