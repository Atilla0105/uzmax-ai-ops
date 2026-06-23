import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  importWorkerBullmqRuntimeEntrypoint,
  readRepoText
} from "./m4-worker-test-loader.mjs";

const ORG_ID = "11111111-1111-4111-8111-111111111145";
const TENANT_ID = "22222222-2222-4222-8222-222222222145";
const USER_ID = "33333333-3333-4333-8333-333333333145";
const JOB_ID = "44444444-4444-4444-8444-444444444145";
const IMPORT_JOB_ID = "55555555-5555-4555-8555-555555555145";
const SNAPSHOT_ID = "66666666-6666-4666-8666-666666666145";
const ROW_ERROR_ID = "77777777-7777-4777-8777-777777777145";

const runtimeSource = readRepoText("apps/worker/src/order-import-bullmq-runtime.ts");
const workerSource = readRepoText("apps/worker/src/main.ts");
const smokeSource = readRepoText(
  "apps/worker/scripts/run-m4-order-import-bullmq-redis-smoke.mjs"
);
const packageJson = readRepoText("apps/worker/package.json");
const spec = readRepoText("docs/specs/M4-45-order-import-queue-security-closeout.md");
const evidence = readRepoText(
  "docs/evidence/M4/M4-45-order-import-queue-security-closeout.md"
);
const m4Index = readRepoText("docs/evidence/M4/README.md");
const runtime = await importWorkerBullmqRuntimeEntrypoint();

describe("M4-45 order import BullMQ Redis runtime", () => {
  it("maps the existing dispatch contract to deterministic BullMQ job options", () => {
    const plan = runtime.module.createOrderImportBullmqCsvTextJobPlan(jobInput());

    assert.equal(plan.jobName, "order_import_csv_text");
    assert.equal(plan.contract.jobId, JOB_ID);
    assert.equal(plan.options.jobId, JOB_ID);
    assert.equal(plan.options.attempts, 3);
    assert.deepEqual(plan.options.backoff, { delay: 30000, type: "fixed" });
    assert.equal(plan.options.removeOnComplete, 1000);
    assert.equal(plan.options.removeOnFail, 1000);
    assert.equal(
      plan.payload.idempotencyKey,
      "import://order-import/idempotency/m4-45"
    );
    assert.equal(plan.payload.sourceRef, "storage://order-imports/m4-45-orders.csv");

    const customRetention = runtime.module.createOrderImportBullmqCsvTextJobPlan(
      jobInput(),
      {
        attempts: 1,
        backoff: { delay: 1, type: "fixed" },
        jobId: "99999999-9999-4999-8999-999999999999",
        removeOnComplete: { count: 5 },
        removeOnFail: { count: 10 }
      }
    );
    assert.equal(customRetention.options.jobId, JOB_ID);
    assert.equal(customRetention.options.attempts, 3);
    assert.deepEqual(customRetention.options.backoff, { delay: 30000, type: "fixed" });
    assert.deepEqual(customRetention.options.removeOnComplete, { count: 5 });
    assert.deepEqual(customRetention.options.removeOnFail, { count: 10 });
  });

  it("validates BullMQ jobs before calling the injected dispatch handler", async () => {
    const calls = [];
    const processor = runtime.module.createOrderImportCsvTextBullmqProcessor({
      gateway: persistenceRecorder(calls),
      handler: async (input) => {
        calls.push(`handler:${input.attempt}`);
        return persistenceResult(input);
      }
    });
    const plan = runtime.module.createOrderImportBullmqCsvTextJobPlan(jobInput());
    const result = await processor({
      attemptsMade: 1,
      data: plan.payload,
      name: "order_import_csv_text",
      opts: { attempts: 3 }
    });

    assert.equal(result.dispatch.attempt, 2);
    assert.deepEqual(calls, ["handler:2"]);
    await assert.rejects(
      () =>
        processor({
          attemptsMade: 0,
          data: plan.payload,
          name: "unsupported",
          opts: { attempts: 3 }
        }),
      /BullMQ jobName is unsupported/
    );
  });

  it("fails closed for malformed queued persistence payload before dispatch", async () => {
    const plan = runtime.module.createOrderImportBullmqCsvTextJobPlan(jobInput());
    for (const [field, value] of [
      ["createdByUserId", "bad-user-id"],
      ["csvText", ""],
      ["importJobId", "bad-import-job-id"],
      ["importedAt", "not-a-date"],
      ["maxRows", Number.NaN],
      ["orgId", "bad-org-id"],
      ["rowErrorIds", ["bad-row-error-id"]],
      ["snapshotIds", ["bad-snapshot-id"]],
      ["sourceRef", "https://example.invalid/raw.csv"],
      ["tenantId", "bad-tenant-id"]
    ]) {
      const calls = [];
      const processor = runtime.module.createOrderImportCsvTextBullmqProcessor({
        gateway: persistenceRecorder(calls),
        handler: async (input) => {
          calls.push(`handler:${input.jobId}`);
          return persistenceResult(input);
        }
      });
      await assert.rejects(
        () =>
          processor({
            attemptsMade: 0,
            data: { ...plan.payload, [field]: value },
            name: "order_import_csv_text",
            opts: { attempts: 3 }
          }),
        /required|controlled|UUID|parseable|array|integer/
      );
      assert.deepEqual(calls, []);
    }
  });

  it("fails closed for invalid BullMQ runtime numeric inputs", async () => {
    const calls = [];
    const plan = runtime.module.createOrderImportBullmqCsvTextJobPlan(jobInput());
    const processor = runtime.module.createOrderImportCsvTextBullmqProcessor({
      gateway: persistenceRecorder(calls),
      handler: async (input) => {
        calls.push(`handler:${input.jobId}`);
        return persistenceResult(input);
      }
    });

    await assert.rejects(
      () =>
        processor({
          attemptsMade: Number.NaN,
          data: plan.payload,
          name: "order_import_csv_text",
          opts: { attempts: 3 }
        }),
      /attempt must be an integer/
    );
    await assert.rejects(
      () =>
        processor({
          attemptsMade: 0,
          data: plan.payload,
          name: "order_import_csv_text",
          opts: { attempts: Number.NaN }
        }),
      /maxAttempts must be an integer/
    );
    await assert.rejects(
      () =>
        runtime.module.acquireOrderImportStorageSourceLock(fakeRedis(), {
          sourceRef: "storage://order-imports/m4-45-orders.csv",
          token: "m4-45-lock-token-a",
          ttlMs: Number.NaN
        }),
      /ttlMs must be an integer/
    );
    await assert.rejects(
      () =>
        runtime.module.getOrderImportBullmqQueueHealthSnapshot({
          async getJobCounts() {
            return { delayed: 0, failed: 0, waiting: Number.NaN };
          }
        }),
      /waiting must be an integer/
    );
    assert.deepEqual(calls, []);
  });

  it("uses token-checked Redis Storage source locks and blocks duplicates", async () => {
    const redis = fakeRedis();
    const lock = await runtime.module.acquireOrderImportStorageSourceLock(redis, {
      sourceRef: "storage://order-imports/m4-45-orders.csv",
      token: "m4-45-lock-token-a",
      ttlMs: 30000
    });

    assert.match(lock.key, /^uzmax:m4:order-import:storage-lock:/);
    await assert.rejects(
      () =>
        runtime.module.acquireOrderImportStorageSourceLock(redis, {
          sourceRef: "storage://order-imports/m4-45-orders.csv",
          token: "m4-45-lock-token-b",
          ttlMs: 30000
        }),
      /storage source is already locked/
    );
    assert.equal(
      await runtime.module.releaseOrderImportStorageSourceLock(redis, {
        key: lock.key,
        token: "m4-45-wrong-token"
      }),
      false
    );
    assert.equal(await lock.release(), true);
    assert.equal(await lock.release(), false);
    await assert.rejects(
      () =>
        runtime.module.acquireOrderImportStorageSourceLock(redis, {
          lockPrefix: "not controlled",
          sourceRef: "storage://order-imports/m4-45-other.csv",
          token: "m4-45-lock-token-c",
          ttlMs: 30000
        }),
      /lockPrefix must be controlled/
    );
  });

  it("reports backlog and failed queue health alerts from counts", async () => {
    const health = runtime.module.evaluateOrderImportBullmqQueueHealth(
      { delayed: 1, failed: 1, waiting: 2 },
      { backlog: 2, delayed: 2, failed: 1, waiting: 3 }
    );
    const fromQueue = await runtime.module.getOrderImportBullmqQueueHealthSnapshot(
      {
        async getJobCounts(...types) {
          assert.deepEqual(types, ["waiting", "delayed", "failed"]);
          return { delayed: 0, failed: 0, waiting: 0 };
        }
      },
      { backlog: 1, failed: 1 }
    );

    assert.equal(health.status, "alert");
    assert.deepEqual(
      health.alerts.map((alert) => alert.code),
      ["order_import_queue_failed_high", "order_import_queue_backlog_high"]
    );
    assert.equal(fromQueue.status, "ok");
  });

  it("keeps the runtime opt-in and records unresolved audit honestly", () => {
    assert.match(packageJson, /"bullmq": "\^5\.79\.1"/);
    assert.match(packageJson, /"ioredis": "\^5\.11\.1"/);
    assert.match(runtimeSource, /createOrderImportBullmqQueue/);
    assert.match(runtimeSource, /createOrderImportCsvTextBullmqWorker/);
    assert.match(runtimeSource, /acquireOrderImportStorageSourceLock/);
    assert.match(smokeSource, /UZMAX_REDIS_URL is required/);
    assert.match(smokeSource, /run residue 0/);
    assert.doesNotMatch(workerSource, /BullMQ|ioredis|Redis/i);
    assert.doesNotMatch(
      runtimeSource,
      /process\.env|new PrismaClient|@prisma\/client|fetch\(|download|order_connector|UZMAX_/i
    );
    assert.match(spec, /queue security closeout/i);
    assert.match(evidence, /unresolved_security_blocker/);
    assert.match(m4Index, /M4-45 order import queue security closeout/);
    assert.match(
      m4Index,
      /queue_security_closeout_supported_not_production_deployment/
    );
  });
});

function jobInput() {
  return {
    createdByUserId: USER_ID,
    csvText: [
      "external_order_ref,order_status_ref,source_updated_at,expires_at",
      "controlled://order/m4-45,status://order/ready,2026-06-23T00:00:00.000Z,2026-06-24T00:00:00.000Z"
    ].join("\n"),
    enqueuedAt: "2026-06-23T12:00:00.000Z",
    idempotencyKey: "import://order-import/idempotency/m4-45",
    importJobId: IMPORT_JOB_ID,
    importedAt: "2026-06-23T12:01:00.000Z",
    jobId: JOB_ID,
    orgId: ORG_ID,
    rowErrorIds: [ROW_ERROR_ID],
    snapshotIds: [SNAPSHOT_ID],
    sourceRef: "storage://order-imports/m4-45-orders.csv",
    tenantId: TENANT_ID
  };
}

function persistenceResult(input) {
  return {
    batch: {
      summary: { failedRows: 0, status: "completed", successfulRows: 1, totalRows: 1 }
    },
    importJobDraft: { id: input.importJobId },
    parsed: { headers: [], rows: [], sourceRef: input.sourceRef },
    persisted: { importJobs: 1, rowErrors: 0, snapshots: 1 },
    rowErrorDrafts: [],
    snapshotDrafts: [{ id: SNAPSHOT_ID }]
  };
}

function persistenceRecorder(calls) {
  return {
    persistImportJob() {
      calls.push("unexpected-import-job");
    },
    persistImportRowErrors() {
      calls.push("unexpected-row-errors");
    },
    persistOrderSnapshots() {
      calls.push("unexpected-snapshots");
    }
  };
}

function fakeRedis() {
  const store = new Map();
  return {
    del(key) {
      return store.delete(key) ? 1 : 0;
    },
    eval(_script, _keyCount, key, token) {
      if (store.get(key) !== token) return 0;
      store.delete(key);
      return 1;
    },
    get(key) {
      return store.get(key) ?? null;
    },
    set(key, token) {
      if (store.has(key)) return null;
      store.set(key, token);
      return "OK";
    }
  };
}
