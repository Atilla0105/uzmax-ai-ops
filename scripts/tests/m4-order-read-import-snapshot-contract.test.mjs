import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import ts from "typescript";

const repoRoot = process.cwd();
const source = read("packages/capabilities/order-read/src/index.ts");
const spec = read("docs/specs/M4-05-order-read-import-snapshot-contract.md");
const evidence = read("docs/evidence/M4/M4-05-order-read-import-snapshot-contract.md");
const m4Index = read("docs/evidence/M4/README.md");
const orderRead = await importTypescriptSource(
  "packages/capabilities/order-read/src/index.ts"
);

describe("M4-05 order-read import snapshot contract", () => {
  it("exports a pure order-read contract without DB, LLM, apps, or sibling imports", () => {
    assert.equal(orderRead.packageName, "@uzmax/capability-order-read");
    assert.equal(typeof orderRead.createOrderImportRowContract, "function");
    assert.equal(typeof orderRead.createOrderImportBatchContract, "function");
    assert.equal(typeof orderRead.evaluateOrderSnapshotForRead, "function");
    assert.equal(orderRead.orderSnapshotSourceKinds.importSnapshot, "import_snapshot");
    assert.equal(orderRead.orderQueryOutcomes.stale, "stale");
    assert.doesNotMatch(source, /@uzmax\/db|packages\/db|llm-gateway|process\.env/i);
    assert.doesNotMatch(source, /from ["'][^"']*apps\//);
    assert.doesNotMatch(
      source,
      /from ["'][^"']*capabilities\/(?!order-read)|@uzmax\/capability-(?!order-read)/
    );
  });

  it("validates controlled import rows into snapshot drafts and row errors", () => {
    const accepted = orderRead.createOrderImportRowContract(validRow());
    assert.equal(accepted.status, "accepted");
    assert.equal(accepted.rowNumber, 1);
    assert.deepEqual(accepted.snapshotDraft, {
      customerRef: "controlled://customer/ref-a",
      expiresAt: "2026-06-23T00:00:00.000Z",
      externalBatchRef: "controlled://batch/ref-a",
      externalOrderRef: "controlled://order/ref-a",
      orderStatusRef: "status://order/in-transit",
      payloadSummary: { statusRef: "status://order/in-transit" },
      sourceKind: "import_snapshot",
      sourceRef: "storage://order-imports/batch-a",
      sourceUpdatedAt: "2026-06-22T00:00:00.000Z"
    });

    const missingStatus = orderRead.createOrderImportRowContract({
      ...validRow({ rowNumber: 2 }),
      orderStatusRef: ""
    });
    assert.equal(missingStatus.status, "row_error");
    assert.equal(missingStatus.error.errorCode, "order_status_ref_required");
    assert.equal(missingStatus.error.columnKey, "orderStatusRef");

    const batch = orderRead.createOrderImportBatchContract({
      importedAt: "2026-06-22T01:00:00.000Z",
      rows: [validRow(), { ...validRow({ rowNumber: 2 }), externalOrderRef: "" }],
      sourceRef: "storage://order-imports/batch-a"
    });
    assert.deepEqual(batch.summary, {
      failedRows: 1,
      status: "completed_with_errors",
      successfulRows: 1,
      totalRows: 2
    });
    assert.equal(batch.errorRows[0].errorCode, "external_order_ref_required");
  });

  it("rejects raw carriers, unsafe values, and invalid timestamps", () => {
    assert.throws(
      () =>
        orderRead.createOrderImportRowContract({
          ...validRow(),
          phoneNumber: "+998901234567"
        }),
      /raw order\/customer field is not allowed: phoneNumber/
    );
    assert.throws(
      () =>
        orderRead.createOrderImportRowContract({
          ...validRow(),
          payloadSummary: { publicUrl: "https://example.test/order" }
        }),
      /raw order\/customer field is not allowed: publicUrl/
    );
    assert.throws(
      () =>
        orderRead.createOrderImportRowContract({
          ...validRow(),
          expiresAt: "not-a-date"
        }),
      /expiresAt must be a parseable timestamp/
    );

    const expiredBeforeSource = orderRead.createOrderImportRowContract({
      ...validRow(),
      expiresAt: "2026-06-21T00:00:00.000Z"
    });
    assert.equal(
      expiredBeforeSource.error.errorCode,
      "snapshot_expiry_not_after_source_update"
    );
  });

  it("returns fresh snapshot results with source and status refs only", () => {
    const fresh = orderRead.evaluateOrderSnapshotForRead({
      now: "2026-06-22T12:00:00.000Z",
      queryKind: "order_ref",
      queryRef: "query://order/ref-a",
      snapshot: orderRead.createOrderImportRowContract(validRow()).snapshotDraft
    });

    assert.equal(fresh.status, "snapshot_ready");
    assert.equal(fresh.reasonCode, "snapshot_fresh");
    assert.equal(fresh.handoff.required, false);
    assert.deepEqual(fresh.queryLogDraft, {
      handoffRequired: false,
      outcome: "hit",
      queryKind: "order_ref",
      queryRef: "query://order/ref-a",
      staleSnapshotUsed: false
    });
    assert.equal(fresh.customerVisible.orderStatusRef, "status://order/in-transit");
    assert.equal(fresh.customerVisible.sourceKind, "import_snapshot");
  });

  it("hands off missing, stale, and degraded reads without fabricating status", () => {
    const missing = orderRead.evaluateOrderSnapshotForRead({
      now: "2026-06-22T12:00:00.000Z",
      queryKind: "order_ref",
      queryRef: "query://order/missing"
    });
    assert.equal(missing.status, "handoff_required");
    assert.equal(missing.queryLogDraft.outcome, "miss");
    assert.equal(missing.handoff.required, true);

    const stale = orderRead.evaluateOrderSnapshotForRead({
      now: "2026-06-24T00:00:00.000Z",
      queryKind: "order_ref",
      queryRef: "query://order/ref-a",
      snapshot: orderRead.createOrderImportRowContract(validRow()).snapshotDraft
    });
    assert.equal(stale.reasonCode, "order_snapshot_stale");
    assert.equal(stale.queryLogDraft.outcome, "stale");
    assert.equal(stale.queryLogDraft.staleSnapshotUsed, true);
    assert.equal(stale.handoff.required, true);
    assert.doesNotMatch(JSON.stringify(stale.customerVisible), /orderStatusRef/);

    const degraded = orderRead.evaluateOrderSnapshotForRead({
      degradedReasonRef: "reason://order-read/import-main-path-degraded",
      now: "2026-06-22T12:00:00.000Z",
      queryKind: "search_ref",
      queryRef: "query://order/search-a"
    });
    assert.equal(degraded.reasonCode, "order_data_degraded");
    assert.equal(degraded.queryLogDraft.outcome, "degraded");
    assert.equal(degraded.queryLogDraft.handoffRequired, true);
    assert.doesNotMatch(JSON.stringify(degraded), /invented|generated|llm/i);
  });

  it("records M4-05 scope and keeps no-API evidence boundaries visible", () => {
    assert.match(spec, /no-API 分支/);
    assert.match(spec, /不新增 `order_connector`/);
    assert.match(evidence, /no raw customer\/order data/);
    assert.match(evidence, /no `order_connector`/);
    assert.match(m4Index, /M4-04 order import snapshot DB contracts foundation/);
    assert.match(m4Index, /M4-05 order-read import snapshot contract/);
    assert.match(m4Index, /runtime\/admin\/E2E blockers/);
  });
});

function validRow(overrides = {}) {
  return {
    customerRef: "controlled://customer/ref-a",
    expiresAt: "2026-06-23T00:00:00.000Z",
    externalBatchRef: "controlled://batch/ref-a",
    externalOrderRef: "controlled://order/ref-a",
    orderStatusRef: "status://order/in-transit",
    payloadSummary: { statusRef: "status://order/in-transit" },
    rowNumber: 1,
    sourceRef: "storage://order-imports/batch-a",
    sourceUpdatedAt: "2026-06-22T00:00:00.000Z",
    ...overrides
  };
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

async function importTypescriptSource(relativePath) {
  const compilerOptions = {
    module: ts.ModuleKind.ES2022,
    target: ts.ScriptTarget.ES2023
  };
  const { outputText } = ts.transpileModule(read(relativePath), {
    compilerOptions: {
      ...compilerOptions
    },
    fileName: relativePath
  });
  const specifier = `data:text/javascript;base64,${Buffer.from(outputText).toString(
    "base64"
  )}`;
  return import(specifier);
}
