/* global console, process */

import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath, pathToFileURL } from "node:url";

import Redis from "ioredis";

const redisUrl = process.env.UZMAX_REDIS_URL;
if (!redisUrl) {
  console.error("UZMAX_REDIS_URL is required");
  process.exit(1);
}

const queuePrefix = `uzmax-m6b-02-${process.pid}`;
const queueName = `order-import-m6b-02-${Date.now()}-${randomUUID().slice(0, 8)}`;
const npmCommand = process.env.M6B_WORKER_SMOKE_NPM ?? "npm";
const connection = { maxRetriesPerRequest: null, url: redisUrl };
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

const runtime = await import(
  pathToFileURL(
    path.join(
      repoRoot,
      "apps/worker/dist/apps/worker/src/order-import-bullmq-runtime.js"
    )
  ).href
);

const redis = new Redis(redisUrl, { maxRetriesPerRequest: null });
const queue = runtime.createOrderImportBullmqQueue({
  connection,
  prefix: queuePrefix,
  queueName
});
let child;
let stdout = "";
let stderr = "";
let exit;

try {
  await queue.obliterate({ force: true }).catch(() => undefined);
  const input = jobInput({
    jobId: "44444444-4444-4444-8444-444444446202",
    sourceRef: "storage://order-imports/m6b-02-artifact-smoke.csv"
  });
  const first = await runtime.enqueueOrderImportBullmqCsvTextJob(queue, input, {
    removeOnComplete: 1000,
    removeOnFail: 1000
  });
  const duplicate = await runtime.enqueueOrderImportBullmqCsvTextJob(queue, input, {
    removeOnComplete: 1000,
    removeOnFail: 1000
  });
  assert.equal(first.job.id, duplicate.job.id);

  const before = await queue.getJobCounts("waiting", "active", "completed", "failed");
  assert.equal(before.waiting, 1);
  console.log(
    JSON.stringify({
      event: "m6b_02_worker_queue_depth_after_enqueue",
      jobId: first.job.id,
      queueName,
      waiting: before.waiting
    })
  );

  child = startWorkerProcess();
  await waitForWorkerLog("worker.ready");
  await waitForCompletedJob(input.jobId);
  await waitForWorkerLog("worker.order_import.completed");

  const after = await waitForQueueDepth({ completed: 1, waiting: 0 });
  const completedLogs = findWorkerLogs("worker.order_import.completed");
  assert.equal(completedLogs.length, 1);
  assert.equal(completedLogs[0].jobId, input.jobId);

  await stopWorkerProcess();
  assert(findWorkerLogs("worker.shutdown.complete").length >= 1);

  console.log(
    JSON.stringify({
      completed: after.completed,
      duplicateSameJobIdProcessedCount: completedLogs.length,
      event: "m6b_02_worker_artifact_smoke",
      jobId: input.jobId,
      queueDepthAfterConsume: after.waiting,
      queueDepthAfterDuplicateEnqueue: before.waiting,
      queueName,
      shutdown: "graceful",
      startCommand: "npm --workspace @uzmax/worker run start",
      status: "pass"
    })
  );
} finally {
  if (child) await stopWorkerProcess().catch(() => undefined);
  await queue.obliterate({ force: true }).catch(() => undefined);
  await queue.close().catch(() => undefined);
  const keys = await redis.keys(`${queuePrefix}:*${queueName}*`);
  if (keys.length > 0) await redis.del(...keys);
  await redis.quit();
}

function startWorkerProcess() {
  const spawned = spawn(npmCommand, ["--workspace", "@uzmax/worker", "run", "start"], {
    env: {
      ...process.env,
      NODE_ENV: "production",
      UZMAX_REDIS_URL: redisUrl,
      UZMAX_WORKER_BULLMQ_PREFIX: queuePrefix,
      UZMAX_WORKER_ORDER_IMPORT_QUEUE_NAME: queueName
    },
    stdio: ["ignore", "pipe", "pipe"]
  });
  spawned.stdout.setEncoding("utf8");
  spawned.stderr.setEncoding("utf8");
  spawned.stdout.on("data", (chunk) => {
    stdout += chunk;
  });
  spawned.stderr.on("data", (chunk) => {
    stderr += chunk;
  });
  spawned.on("exit", (code, signal) => {
    exit = { code, signal };
  });
  return spawned;
}

async function waitForWorkerLog(event) {
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    const [entry] = findWorkerLogs(event);
    if (entry) return entry;
    if (exit) throw new Error(`worker exited before ${event}: ${formatExit()}`);
    await delay(100);
  }
  throw new Error(
    `timed out waiting for ${event}\nstdout:\n${stdout}\nstderr:\n${stderr}`
  );
}

async function waitForCompletedJob(jobId) {
  let observedState = "missing";
  for (let remaining = 150; remaining > 0; remaining -= 1) {
    const job = await queue.getJob(jobId);
    const state = job ? await job.getState() : "missing";
    observedState = state;
    if (state === "completed") return job;
    if (state === "failed") throw new Error(`job ${jobId} failed: ${job.failedReason}`);
    await delay(100);
  }
  throw new Error(`job ${jobId} stayed ${observedState} instead of completing`);
}

async function waitForQueueDepth(expected) {
  const deadline = Date.now() + 10_000;
  let counts;
  while (Date.now() < deadline) {
    counts = await queue.getJobCounts("waiting", "active", "completed", "failed");
    if (
      counts.waiting === expected.waiting &&
      counts.completed === expected.completed
    ) {
      return counts;
    }
    await delay(100);
  }
  throw new Error(`queue depth did not settle: ${JSON.stringify(counts)}`);
}

function findWorkerLogs(event) {
  return stdout
    .split(/\r?\n/)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return undefined;
      }
    })
    .filter((entry) => entry?.event === event);
}

async function stopWorkerProcess() {
  if (!child || exit) return;
  child.kill("SIGTERM");
  const deadline = Date.now() + 5_000;
  while (!exit && Date.now() < deadline) {
    await delay(50);
  }
  if (!exit) child.kill("SIGKILL");
  if (exit?.code !== 0) throw new Error(`worker did not exit cleanly: ${formatExit()}`);
}

function formatExit() {
  return `code=${exit?.code ?? "null"} signal=${exit?.signal ?? "null"}`;
}

function jobInput(overrides) {
  return {
    backoffMs: 10,
    createdByUserId: "33333333-3333-4333-8333-333333336202",
    csvText: [
      "external_order_ref,order_status_ref,source_updated_at,expires_at",
      "controlled://order/m6b-02,status://order/ready,2026-06-26T00:00:00.000Z,2026-06-27T00:00:00.000Z"
    ].join("\n"),
    enqueuedAt: "2026-06-26T12:00:00.000Z",
    idempotencyKey: "import://order-import/idempotency/m6b-02",
    importJobId: "55555555-5555-4555-8555-555555556202",
    importedAt: "2026-06-26T12:01:00.000Z",
    jobId: overrides.jobId,
    maxAttempts: 1,
    orgId: "11111111-1111-4111-8111-111111116202",
    rowErrorIds: [],
    snapshotIds: ["66666666-6666-4666-8666-666666666202"],
    sourceRef: overrides.sourceRef,
    tenantId: "22222222-2222-4222-8222-222222226202",
    ...overrides
  };
}
