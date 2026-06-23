import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import ts from "typescript";

const repoRoot = process.cwd();
const orderReadSource = read("packages/capabilities/order-read/src/index.ts");
const apiServiceSource = read("apps/api/src/order-import.service.ts");
const spec = read("docs/specs/M4-44-order-read-runtime-eval-gate.md");
const evidence = read("docs/evidence/M4/M4-44-order-read-runtime-eval-gate.md");
const m4Index = read("docs/evidence/M4/README.md");
const evalsReadme = read("docs/evals/README.md");
const orderRead = await importTypescriptSource(
  "packages/capabilities/order-read/src/index.ts"
);
const evals = await importEvalsSource();

describe("M4-44 order-read runtime eval gate", () => {
  it("exports a bounded runtime eval candidate builder without importing evals", () => {
    assert.equal(typeof orderRead.evaluateOrderSnapshotForRead, "function");
    assert.equal(typeof orderRead.createOrderReadRuntimeEvalCandidate, "function");
    assert.doesNotMatch(runtimeSources(), /packages\/evals|@uzmax\/evals/);
    assert.doesNotMatch(
      runtimeSources(),
      /evaluateM4OrderReadNoFabrication|m4-order-read-no-fabrication/
    );
    assert.doesNotMatch(runtimeSources(), /process\.env|globalThis\.fetch|\bfetch\(/i);
  });

  it("converts fresh runtime output into a snapshot summary candidate that passes", () => {
    const fresh = orderRead.evaluateOrderSnapshotForRead({
      now: "2026-06-22T12:00:00.000Z",
      queryKind: "order_ref",
      queryRef: "query://m4-44/fresh",
      snapshot: snapshot()
    });
    const candidate = orderRead.createOrderReadRuntimeEvalCandidate(fresh);
    const result = evaluateRuntime(fresh, "fresh");

    assert.deepEqual(candidate, {
      answerKind: "order_snapshot_summary",
      handoffRequired: false,
      orderStatusRef: "status://order/in-transit"
    });
    assert.equal(result.status, "passed");
    assert.deepEqual(result.reasonCodes, []);
    assert.ok(result.controlledRefs.includes("status://order/in-transit"));
  });

  it("converts stale, missing, and degraded runtime outputs into handoff candidates", () => {
    const cases = {
      degraded: orderRead.evaluateOrderSnapshotForRead({
        degradedReasonRef: "reason://order-read/import-main-path-degraded",
        now: "2026-06-22T12:00:00.000Z",
        queryKind: "search_ref",
        queryRef: "query://m4-44/degraded"
      }),
      missing: orderRead.evaluateOrderSnapshotForRead({
        now: "2026-06-22T12:00:00.000Z",
        queryKind: "order_ref",
        queryRef: "query://m4-44/missing"
      }),
      stale: orderRead.evaluateOrderSnapshotForRead({
        now: "2026-06-24T00:00:00.000Z",
        queryKind: "order_ref",
        queryRef: "query://m4-44/stale",
        snapshot: snapshot()
      })
    };

    for (const [name, runtime] of Object.entries(cases)) {
      const candidate = orderRead.createOrderReadRuntimeEvalCandidate(runtime);
      const result = evaluateRuntime(runtime, name);

      assert.equal(runtime.status, "handoff_required");
      assert.deepEqual(candidate, { answerKind: "handoff", handoffRequired: true });
      assert.doesNotMatch(
        JSON.stringify(candidate),
        /orderStatusRef|logisticsStatusRef/
      );
      assert.equal(result.status, "passed");
      assert.deepEqual(result.reasonCodes, []);
    }
  });

  it("keeps fabricated handoff candidates failed in the M4-22 evaluator", () => {
    const stale = orderRead.evaluateOrderSnapshotForRead({
      now: "2026-06-24T00:00:00.000Z",
      queryKind: "order_ref",
      queryRef: "query://m4-44/fabricated",
      snapshot: snapshot()
    });
    const fabricated = evals.evaluateM4OrderReadNoFabrication(
      evalInput(stale, "fabricated", {
        answerKind: "order_snapshot_summary",
        handoffRequired: false,
        logisticsStatusRef: "status://logistics/in-transit",
        orderStatusRef: "status://order/in-transit"
      })
    );

    assert.equal(fabricated.status, "failed");
    assert.ok(fabricated.reasonCodes.includes("handoff_required_missing"));
    assert.ok(fabricated.reasonCodes.includes("handoff_answer_kind_required"));
    assert.ok(fabricated.reasonCodes.includes("order_status_ref_exposed_on_handoff"));
    assert.ok(
      fabricated.reasonCodes.includes("logistics_status_ref_exposed_on_handoff")
    );
  });

  it("records controlled runtime-to-eval bridge evidence without production claims", () => {
    assert.match(spec, /controlled runtime-to-eval bridge/);
    assert.match(evidence, /controlled runtime-to-eval bridge/);
    assert.match(evidence, /No raw customer\/order data/);
    assert.match(m4Index, /M4-44 order-read runtime eval gate/);
    assert.match(evalsReadme, /M4 Order-Read Runtime Eval Bridge/);
    assert.match(evalsReadme, /production eval gate.*remain future scope/);
  });
});

function evaluateRuntime(runtime, suffix) {
  return evals.evaluateM4OrderReadNoFabrication(
    evalInput(runtime, suffix, orderRead.createOrderReadRuntimeEvalCandidate(runtime))
  );
}

function evalInput(runtime, suffix, candidate) {
  return {
    candidate,
    caseRef: `manifest://m4-44/case-${suffix}`,
    checkedRef: `controlled://m4-44/check-${suffix}`,
    manifestRef: "manifest://m4-44/runtime-eval-bridge",
    outputRef: `storage://m4-44/output-${suffix}`,
    queryRef: runtime.queryLogDraft.queryRef,
    readStatus: runtime.status,
    reasonCode: runtime.reasonCode
  };
}

function snapshot() {
  return orderRead.createOrderImportRowContract({
    customerRef: "controlled://customer/m4-44",
    expiresAt: "2026-06-23T00:00:00.000Z",
    externalBatchRef: "controlled://batch/m4-44",
    externalOrderRef: "controlled://order/m4-44",
    orderStatusRef: "status://order/in-transit",
    payloadSummary: { statusRef: "status://order/in-transit" },
    rowNumber: 1,
    sourceRef: "storage://order-imports/m4-44",
    sourceUpdatedAt: "2026-06-22T00:00:00.000Z"
  }).snapshotDraft;
}

function runtimeSources() {
  return `${apiServiceSource}\n${orderReadSource}`;
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

async function importTypescriptSource(relativePath) {
  const { outputText } = ts.transpileModule(read(relativePath), {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2023
    },
    fileName: relativePath
  });
  return import(dataUrl(outputText));
}

async function importEvalsSource() {
  const sourceText = read("packages/evals/src/index.ts");
  const { outputText } = ts.transpileModule(sourceText, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2023
    },
    fileName: "packages/evals/src/index.ts"
  });
  const resolvedOutput = outputText.replaceAll(
    '"./m4-order-read-no-fabrication.ts"',
    JSON.stringify(
      transpiledLeafUrl("packages/evals/src/m4-order-read-no-fabrication.ts")
    )
  );
  return import(dataUrl(resolvedOutput));
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
  return `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;
}
