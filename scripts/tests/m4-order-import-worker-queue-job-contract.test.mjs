import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  importWorkerDispatchEntrypoint,
  importWorkerEntrypoint,
  readRepoText
} from "./m4-worker-test-loader.mjs";

const ORG_ID = "11111111-1111-4111-8111-111111111111";
const TENANT_ID = "22222222-2222-4222-8222-222222222222";
const USER_ID = "33333333-3333-4333-8333-333333333333";
const JOB_ID = "44444444-4444-4444-8444-444444444444";
const IMPORT_JOB_ID = "55555555-5555-4555-8555-555555555555";
const SNAPSHOT_ID = "66666666-6666-4666-8666-666666666666";
const ROW_ERROR_ID = "77777777-7777-4777-8777-777777777777";
const dispatchSource = readRepoText("apps/worker/src/order-import-dispatch.ts");
const spec = readRepoText("docs/specs/M4-24-order-import-worker-queue-job-contract.md");
const evidence = readRepoText(
  "docs/evidence/M4/M4-24-order-import-worker-queue-job-contract.md"
);
const m4Index = readRepoText("docs/evidence/M4/README.md");
const worker = await importWorkerEntrypoint();
const dispatch = await importWorkerDispatchEntrypoint();

describe("M4-24 order import worker queue job contract", () => {
  it("normalizes a controlled CSV text job into a retry/idempotency contract", () => {
    const contract = dispatch.module.createOrderImportCsvTextDispatchContract({
      ...jobInput(),
      snapshotIds: [SNAPSHOT_ID]
    });

    assert.equal(contract.jobName, "order_import_csv_text");
    assert.equal(contract.jobId, JOB_ID);
    assert.equal(contract.idempotencyKey, "import://order-import/idempotency/batch-a");
    assert.deepEqual(contract.retry, { attempts: 3, backoffMs: 30000 });
    assert.equal(contract.payload.attempt, 1);
    assert.equal(contract.payload.maxAttempts, 3);
    assert.equal(contract.payload.backoffMs, 30000);
    assert.equal(contract.payload.importJobId, IMPORT_JOB_ID);
  });

  it("runs the existing parser and persistence path only after job validation", async () => {
    const calls = [];
    const result = await dispatch.module.runOrderImportCsvTextDispatchContract(
      {
        ...jobInput(),
        attempt: 2,
        backoffMs: 45000,
        maxAttempts: 5,
        rowErrorIds: [ROW_ERROR_ID],
        snapshotIds: [SNAPSHOT_ID]
      },
      persistenceRecorder(calls),
      worker.module.runOrderImportCsvTextPersistenceJob
    );

    assert.deepEqual(calls, [
      "importJob:completed_with_errors",
      "snapshots:1",
      "rowErrors:1"
    ]);
    assert.deepEqual(result.dispatch, {
      attempt: 2,
      enqueuedAt: "2026-06-22T12:01:00.000Z",
      idempotencyKey: "import://order-import/idempotency/batch-a",
      jobId: JOB_ID,
      jobName: "order_import_csv_text",
      maxAttempts: 5
    });
    assert.deepEqual(result.persisted, { importJobs: 1, rowErrors: 1, snapshots: 1 });
  });

  it("fails closed before persistence for malformed job metadata", async () => {
    const calls = [];
    assert.throws(
      () =>
        dispatch.module.createOrderImportCsvTextDispatchContract({
          ...jobInput(),
          attempt: 4,
          maxAttempts: 3,
          snapshotIds: [SNAPSHOT_ID]
        }),
      /attempt must be an integer from 1 to 3/
    );

    await assert.rejects(
      () =>
        dispatch.module.runOrderImportCsvTextDispatchContract(
          {
            ...jobInput(),
            idempotencyKey: "https://example.invalid/raw",
            snapshotIds: [SNAPSHOT_ID]
          },
          persistenceRecorder(calls),
          worker.module.runOrderImportCsvTextPersistenceJob
        ),
      /idempotencyKey must be a controlled ref/
    );
    assert.deepEqual(calls, []);
  });

  it("records M4-24 scope without adding real queue, DB, env or network runtime", () => {
    assert.match(dispatchSource, /orderImportWorkerJobNames/);
    assert.match(dispatchSource, /createOrderImportCsvTextDispatchContract/);
    assert.match(dispatchSource, /runOrderImportCsvTextDispatchContract/);
    assert.doesNotMatch(
      dispatchSource,
      /BullMQ|ioredis|Redis|PrismaClient|@prisma\/client|process\.env|fetch\(|https?:\/\/|order_connector/i
    );
    assert.match(spec, /queue-job-contract foundation/);
    assert.match(evidence, /no raw customer\/order data/);
    assert.match(m4Index, /M4-24 order import worker queue job contract/);
    assert.match(m4Index, /real BullMQ\/Redis runtime/);
  });
});

function jobInput() {
  return {
    createdByUserId: USER_ID,
    csvText: controlledCsv([
      "external_order_ref,order_status_ref,source_updated_at,expires_at,external_batch_ref",
      "controlled://order/ref-a,status://order/in-transit,2026-06-22T00:00:00.000Z,2026-06-23T00:00:00.000Z,controlled://batch/ref-a",
      "controlled://order/ref-b,,2026-06-22T00:00:00.000Z,2026-06-23T00:00:00.000Z,"
    ]),
    enqueuedAt: "2026-06-22T12:01:00.000Z",
    idempotencyKey: "import://order-import/idempotency/batch-a",
    importJobId: IMPORT_JOB_ID,
    importedAt: "2026-06-22T12:02:00.000Z",
    jobId: JOB_ID,
    orgId: ORG_ID,
    rowErrorIds: [],
    snapshotIds: [],
    sourceRef: "storage://order-imports/dispatch-batch-a",
    tenantId: TENANT_ID
  };
}

function controlledCsv(lines) {
  return lines.join("\n");
}

function persistenceRecorder(calls) {
  return {
    persistImportJob(draft) {
      calls.push(`importJob:${draft.status}`);
    },
    persistImportRowErrors(drafts) {
      calls.push(`rowErrors:${drafts.length}`);
    },
    persistOrderSnapshots(drafts) {
      calls.push(`snapshots:${drafts.length}`);
    }
  };
}
