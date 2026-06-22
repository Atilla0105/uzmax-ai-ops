import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { importWorkerEntrypoint, readRepoText } from "./m4-worker-test-loader.mjs";

const ORG_ID = "11111111-1111-4111-8111-111111111111";
const TENANT_ID = "22222222-2222-4222-8222-222222222222";
const USER_ID = "33333333-3333-4333-8333-333333333333";
const IMPORT_JOB_ID = "44444444-4444-4444-8444-444444444444";
const SNAPSHOT_ID = "55555555-5555-4555-8555-555555555555";
const ROW_ERROR_ID = "66666666-6666-4666-8666-666666666666";
const SOURCE_REF = "storage://order-imports/persistence-batch-a";
const workerSource = readRepoText("apps/worker/src/main.ts");
const spec = readRepoText(
  "docs/specs/M4-12-order-import-worker-persistence-contract.md"
);
const evidence = readRepoText(
  "docs/evidence/M4/M4-12-order-import-worker-persistence-contract.md"
);
const m4Index = readRepoText("docs/evidence/M4/README.md");
const worker = await importWorkerEntrypoint();

describe("M4-12 order import worker persistence contract", () => {
  it("runs parser drafts and persistence gateway in deterministic order", async () => {
    const calls = [];
    const result = await worker.module.runOrderImportCsvTextPersistenceJob(
      {
        ...baseJobInput(),
        csvText: controlledCsv([
          "external_order_ref,order_status_ref,source_updated_at,expires_at,external_batch_ref",
          "controlled://order/ref-a,status://order/in-transit,2026-06-22T00:00:00.000Z,2026-06-23T00:00:00.000Z,controlled://batch/ref-a",
          "controlled://order/ref-b,,2026-06-22T00:00:00.000Z,2026-06-23T00:00:00.000Z,"
        ]),
        rowErrorIds: [ROW_ERROR_ID],
        snapshotIds: [SNAPSHOT_ID]
      },
      persistenceRecorder(calls)
    );

    assert.equal(result.parsed.rows.length, 2);
    assert.deepEqual(result.persisted, {
      importJobs: 1,
      rowErrors: 1,
      snapshots: 1
    });
    assert.deepEqual(calls, [
      {
        kind: "importJob",
        status: "completed_with_errors",
        totalRows: 2
      },
      {
        count: 1,
        firstExternalOrderRef: "controlled://order/ref-a",
        kind: "snapshots"
      },
      {
        count: 1,
        firstRowNumber: 2,
        kind: "rowErrors"
      }
    ]);
  });

  it("validates the whole batch before persistence starts", async () => {
    const calls = [];
    await assert.rejects(
      () =>
        worker.module.runOrderImportCsvTextPersistenceJob(
          {
            ...baseJobInput(),
            csvText: controlledCsv([
              "external_order_ref,order_status_ref,source_updated_at,expires_at",
              "controlled://order/ref-a,status://order/in-transit,2026-06-22T00:00:00.000Z,2026-06-23T00:00:00.000Z"
            ]),
            snapshotIds: []
          },
          persistenceRecorder(calls)
        ),
      /snapshotIds must match generated draft count/
    );
    assert.deepEqual(calls, []);
  });

  it("records M4-12 scope without adding DB, queue, file or network runtime", () => {
    assert.match(workerSource, /type OrderImportWorkerPersistenceGateway/);
    assert.match(workerSource, /runOrderImportCsvTextPersistenceJob/);
    assert.doesNotMatch(
      workerSource,
      /readFileSync|node:fs|PrismaClient|@prisma\/client|BullMQ|Queue|Redis|process\.env|fetch\(|https?:\/\/|order_connector/i
    );
    assert.doesNotMatch(
      workerSource,
      /raw payload|csv export|xlsx export|phone|address|payment|secret/i
    );
    assert.match(spec, /worker-persistence-contract foundation/);
    assert.match(evidence, /no raw customer\/order data/);
    assert.match(m4Index, /M4-12 order import worker persistence contract/);
    assert.match(m4Index, /worker import queue runtime/);
  });
});

function baseJobInput() {
  return {
    createdByUserId: USER_ID,
    importJobId: IMPORT_JOB_ID,
    importedAt: "2026-06-22T12:00:00.000Z",
    orgId: ORG_ID,
    rowErrorIds: [],
    snapshotIds: [],
    sourceRef: SOURCE_REF,
    tenantId: TENANT_ID
  };
}

function controlledCsv(lines) {
  return lines.join("\r\n");
}

function persistenceRecorder(calls) {
  return {
    persistImportJob(draft) {
      calls.push({
        kind: "importJob",
        status: draft.status,
        totalRows: draft.totalRows
      });
    },
    persistImportRowErrors(drafts) {
      calls.push({
        count: drafts.length,
        firstRowNumber: drafts[0]?.rowNumber,
        kind: "rowErrors"
      });
    },
    persistOrderSnapshots(drafts) {
      calls.push({
        count: drafts.length,
        firstExternalOrderRef: drafts[0]?.externalOrderRef,
        kind: "snapshots"
      });
    }
  };
}
