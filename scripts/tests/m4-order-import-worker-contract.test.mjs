import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import ts from "typescript";

const repoRoot = process.cwd();
const ORG_ID = "11111111-1111-4111-8111-111111111111";
const TENANT_ID = "22222222-2222-4222-8222-222222222222";
const USER_ID = "33333333-3333-4333-8333-333333333333";
const IMPORT_JOB_ID = "44444444-4444-4444-8444-444444444444";
const SNAPSHOT_ID = "55555555-5555-4555-8555-555555555555";
const ROW_ERROR_ID = "66666666-6666-4666-8666-666666666666";
const workerSource = read("apps/worker/src/main.ts");
const spec = read("docs/specs/M4-09-order-import-worker-contract.md");
const evidence = read("docs/evidence/M4/M4-09-order-import-worker-contract.md");
const m4Index = read("docs/evidence/M4/README.md");
const worker = await importWorkerSource();

describe("M4-09 order import worker contract", () => {
  it("creates import job, snapshot and row error drafts from controlled rows", () => {
    const result = worker.module.createOrderImportWorkerDrafts({
      ...baseInput(),
      rowErrorIds: [ROW_ERROR_ID],
      rows: [validRow(1), { ...validRow(2), orderStatusRef: undefined }],
      snapshotIds: [SNAPSHOT_ID]
    });

    assert.equal(result.batch.summary.status, "completed_with_errors");
    assert.deepEqual(result.batch.summary, {
      failedRows: 1,
      status: "completed_with_errors",
      successfulRows: 1,
      totalRows: 2
    });
    assert.deepEqual(
      pick(result.importJobDraft, [
        "failedRows",
        "status",
        "successfulRows",
        "totalRows"
      ]),
      {
        failedRows: 1,
        status: "completed_with_errors",
        successfulRows: 1,
        totalRows: 2
      }
    );
    assert.equal(result.importJobDraft.fileRef, "storage://order-imports/batch-a");
    assert.equal(result.snapshotDrafts[0].id, SNAPSHOT_ID);
    assert.equal(result.snapshotDrafts[0].importJobId, IMPORT_JOB_ID);
    assert.equal(result.snapshotDrafts[0].orderStatusRef, "status://order/in-transit");
    assert.equal(result.rowErrorDrafts[0].id, ROW_ERROR_ID);
    assert.equal(result.rowErrorDrafts[0].importJobId, IMPORT_JOB_ID);
    assert.equal(result.rowErrorDrafts[0].errorCode, "order_status_ref_required");
  });

  it("marks all-error batches as failed while keeping errors visible", () => {
    const result = worker.module.createOrderImportWorkerDrafts({
      ...baseInput(),
      rowErrorIds: [ROW_ERROR_ID],
      rows: [{ ...validRow(1), orderStatusRef: undefined }],
      snapshotIds: []
    });

    assert.equal(result.importJobDraft.status, "failed");
    assert.equal(result.snapshotDrafts.length, 0);
    assert.equal(result.rowErrorDrafts.length, 1);
    assert.equal(result.rowErrorDrafts[0].rowNumber, 1);
  });

  it("fails closed when scope, user or deterministic IDs are missing", () => {
    assert.throws(
      () =>
        worker.module.createOrderImportWorkerDrafts({
          ...baseInput(),
          rows: [validRow(1)],
          snapshotIds: []
        }),
      /snapshotIds must match generated draft count/
    );
    assert.throws(
      () =>
        worker.module.createOrderImportWorkerDrafts({
          ...baseInput(),
          createdByUserId: "missing-user",
          rows: [validRow(1)],
          snapshotIds: [SNAPSHOT_ID]
        }),
      /createdByUserId must be a UUID/
    );
    assert.throws(
      () =>
        worker.module.createOrderImportWorkerDrafts({
          ...baseInput(),
          orgId: "",
          rows: [validRow(1)],
          snapshotIds: [SNAPSHOT_ID]
        }),
      /import job orgId is required/
    );
  });

  it("rejects raw carriers and does not read runtime systems", () => {
    assert.throws(
      () =>
        worker.module.createOrderImportWorkerDrafts({
          ...baseInput(),
          rows: [{ ...validRow(1), phone: "raw phone" }],
          snapshotIds: [SNAPSHOT_ID]
        }),
      /raw order\/customer field is not allowed: phone/
    );

    assert.doesNotMatch(
      workerSource,
      /PrismaClient|@prisma\/client|BullMQ|Queue|Redis|process\.env|fetch\(|https?:\/\/|order_connector/i
    );
    assert.doesNotMatch(
      workerSource,
      /raw payload|csv export|xlsx export|phone|address|payment|secret/i
    );
  });

  it("records M4-09 scope and keeps runtime blockers visible", () => {
    assert.match(spec, /worker-contract foundation/);
    assert.match(evidence, /no raw customer\/order data/);
    assert.match(m4Index, /M4-09 order import worker contract/);
    assert.match(m4Index, /real parser, DB client wiring, queue runtime/);
  });
});

function baseInput() {
  return {
    createdByUserId: USER_ID,
    importJobId: IMPORT_JOB_ID,
    importedAt: "2026-06-22T12:00:00.000Z",
    orgId: ORG_ID,
    rowErrorIds: [],
    rows: [],
    snapshotIds: [],
    sourceRef: "storage://order-imports/batch-a",
    tenantId: TENANT_ID
  };
}

function validRow(rowNumber) {
  return {
    expiresAt: "2026-06-23T00:00:00.000Z",
    externalBatchRef: "controlled://batch/ref-a",
    externalOrderRef: "controlled://order/ref-a",
    orderStatusRef: "status://order/in-transit",
    payloadSummary: { statusRef: "status://order/in-transit" },
    rowNumber,
    sourceRef: "storage://order-imports/batch-a",
    sourceUpdatedAt: "2026-06-22T00:00:00.000Z"
  };
}

function pick(record, keys) {
  return Object.fromEntries(keys.map((key) => [key, record[key]]));
}

async function importWorkerSource() {
  const orderReadUrl = compileTsModuleUrl(
    read("packages/capabilities/order-read/src/index.ts")
  );
  const dbUrl = compileTsModuleUrl(
    read("packages/db/src/m4-order-import-contracts.ts")
  );
  const moduleUrl = compileTsModuleUrl(
    workerSource
      .replaceAll(
        "../../../packages/capabilities/order-read/src/index.ts",
        orderReadUrl
      )
      .replaceAll("../../../packages/db/src/m4-order-import-contracts.ts", dbUrl)
  );
  return { module: await import(moduleUrl), moduleUrl };
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), {
    encoding: "utf8"
  });
}

function compileTsModuleUrl(sourceText) {
  const compiled = ts.transpileModule(sourceText, {
    compilerOptions: {
      emitDecoratorMetadata: false,
      experimentalDecorators: true,
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2023
    }
  }).outputText;
  return `data:text/javascript;base64,${Buffer.from(compiled, "utf8").toString(
    "base64"
  )}`;
}
