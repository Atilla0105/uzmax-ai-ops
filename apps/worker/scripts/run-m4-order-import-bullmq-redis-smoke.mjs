/* global Buffer, console, process, setTimeout */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { randomUUID } from "node:crypto";

import Redis from "ioredis";
import ts from "typescript";

const redisUrl = process.env.UZMAX_REDIS_URL;
if (!redisUrl) {
  console.error("UZMAX_REDIS_URL is required");
  process.exit(1);
}

const queuePrefix = "uzmax-m4-45";
const queueName = `order-import-${Date.now()}-${randomUUID().slice(0, 8)}`;
const connection = { maxRetriesPerRequest: null, url: redisUrl };

await runSmoke();

async function runSmoke() {
  const runtime = await importWorkerBullmqRuntime();
  const { enqueueOrderImportBullmqCsvTextJob: enqueueJob } = runtime;
  const redis = new Redis(redisUrl, { maxRetriesPerRequest: null });
  const queue = runtime.createOrderImportBullmqQueue({
    connection,
    prefix: queuePrefix,
    queueName
  });
  let worker;

  try {
    await queue.obliterate({ force: true }).catch(() => undefined);
    const attempts = new Map();
    let successes = 0;
    const handler = async (input) => {
      attempts.set(input.jobId, (attempts.get(input.jobId) ?? 0) + 1);
      if (input.sourceRef.includes("permanent-fail")) {
        throw new Error("m4-45 permanent health failure");
      }
      if (input.sourceRef.includes("main") && attempts.get(input.jobId) === 1) {
        throw new Error("m4-45 first-attempt fault injection");
      }
      successes += 1;
      return {
        importJobDraft: { id: input.importJobId },
        persisted: { importJobs: 1, rowErrors: 0, snapshots: 1 }
      };
    };
    const mainInput = jobInput({
      backoffMs: 50,
      jobId: "44444444-4444-4444-8444-444444444145",
      maxAttempts: 2,
      sourceRef: "storage://order-imports/m4-45-main.csv"
    });
    const first = await enqueueJob(queue, mainInput);
    const duplicate = await enqueueJob(queue, mainInput);
    assert.equal(first.job.id, duplicate.job.id);
    assert.equal((await queue.getJobCounts("waiting")).waiting, 1);

    const lockInput = { sourceRef: mainInput.sourceRef, ttlMs: 30000 };
    const lock = await runtime.acquireOrderImportStorageSourceLock(redis, {
      lockPrefix: `${queuePrefix}:locks:${queueName}`,
      ...lockInput,
      token: "m4-45-lock-token-main"
    });
    await assert.rejects(
      () =>
        runtime.acquireOrderImportStorageSourceLock(redis, {
          lockPrefix: `${queuePrefix}:locks:${queueName}`,
          ...lockInput,
          token: "m4-45-lock-token-dupe"
        }),
      /storage source is already locked/
    );
    assert.equal(await lock.release(), true);

    worker = runtime.createOrderImportCsvTextBullmqWorker({
      connection,
      gateway: {
        persistImportJob() {},
        persistImportRowErrors() {},
        persistOrderSnapshots() {}
      },
      handler,
      prefix: queuePrefix,
      queueName
    });
    await worker.waitUntilReady();
    await waitForJobState(queue, mainInput.jobId, "completed");
    assert.equal(attempts.get(mainInput.jobId), 2);
    assert.equal(successes, 1);

    const failedInput = jobInput({
      jobId: "44444444-4444-4444-8444-444444444245",
      maxAttempts: 1,
      sourceRef: "storage://order-imports/m4-45-permanent-fail.csv"
    });
    await enqueueJob(queue, failedInput);
    await waitForJobState(queue, failedInput.jobId, "failed");
    await worker.close();
    worker = undefined;

    for (const [jobId, sourceRef] of [
      [
        "44444444-4444-4444-8444-444444444345",
        "storage://order-imports/m4-45-backlog-a.csv"
      ],
      [
        "44444444-4444-4444-8444-444444444445",
        "storage://order-imports/m4-45-backlog-b.csv"
      ]
    ]) {
      await enqueueJob(queue, jobInput({ jobId, sourceRef }));
    }
    const health = await runtime.getOrderImportBullmqQueueHealthSnapshot(queue, {
      backlog: 2,
      failed: 1,
      waiting: 3
    });
    assert.equal(health.status, "alert");
    assert.deepEqual(health.alerts.map((alert) => alert.code).sort(), [
      "order_import_queue_backlog_high",
      "order_import_queue_failed_high"
    ]);

    await queue.obliterate({ force: true });
    await queue.close();
    const residue = await redis.keys(`${queuePrefix}:*${queueName}*`);
    assert.deepEqual(residue, []);
    console.log(
      `m4-order-import-bullmq-redis-smoke: passed duplicate enqueue, retry, run-scoped lock and health checks; run residue 0`
    );
  } finally {
    if (worker) await worker.close().catch(() => undefined);
    await queue.obliterate({ force: true }).catch(() => undefined);
    await queue.close().catch(() => undefined);
    const keys = await redis.keys(`${queuePrefix}:*${queueName}*`);
    if (keys.length > 0) await redis.del(...keys);
    await redis.quit();
  }
}

async function waitForJobState(queue, jobId, expectedState) {
  const deadline = Date.now() + 10000;
  let lastState = "missing";
  while (Date.now() < deadline) {
    const job = await queue.getJob(jobId);
    if (job) {
      lastState = await job.getState();
      if (lastState === expectedState) return job;
      if (lastState === "failed" && expectedState !== "failed") {
        throw new Error(`job ${jobId} failed: ${job.failedReason}`);
      }
    }
    await delay(100);
  }
  throw new Error(`job ${jobId} did not reach ${expectedState}; last=${lastState}`);
}

function jobInput(overrides) {
  return {
    backoffMs: 10,
    createdByUserId: "33333333-3333-4333-8333-333333333145",
    csvText: [
      "external_order_ref,order_status_ref,source_updated_at,expires_at",
      "controlled://order/m4-45,status://order/ready,2026-06-23T00:00:00.000Z,2026-06-24T00:00:00.000Z"
    ].join("\n"),
    enqueuedAt: "2026-06-23T12:00:00.000Z",
    idempotencyKey: "import://order-import/idempotency/m4-45",
    importJobId: "55555555-5555-4555-8555-555555555145",
    importedAt: "2026-06-23T12:01:00.000Z",
    jobId: overrides.jobId,
    maxAttempts: 1,
    orgId: "11111111-1111-4111-8111-111111111145",
    rowErrorIds: ["77777777-7777-4777-8777-777777777145"],
    snapshotIds: ["66666666-6666-4666-8666-666666666145"],
    sourceRef: overrides.sourceRef,
    tenantId: "22222222-2222-4222-8222-222222222145",
    ...overrides
  };
}

async function importWorkerBullmqRuntime() {
  const dispatchUrl = compileTsModuleUrl(
    readRepoText("apps/worker/src/order-import-dispatch.ts")
  );
  const runtimeUrl = compileTsModuleUrl(
    readRepoText("apps/worker/src/order-import-bullmq-runtime.ts")
      .replaceAll("./order-import-dispatch.ts", dispatchUrl)
      .replaceAll('"bullmq"', JSON.stringify(bullmqModuleUrl()))
  );
  return import(runtimeUrl);
}

function bullmqModuleUrl() {
  return pathToFileURL(
    path.join(process.cwd(), "node_modules/bullmq/dist/cjs/index.js")
  ).href;
}

function readRepoText(relativePath) {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

function compileTsModuleUrl(sourceText) {
  const { outputText } = ts.transpileModule(sourceText, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2023
    }
  });
  return `data:text/javascript;base64,${Buffer.from(outputText, "utf8").toString("base64")}`;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
