/* global console, process */

import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const npmCommand = process.env.M6B_CRON_SMOKE_NPM ?? "npm";
const tempDir = await mkdtemp(path.join(os.tmpdir(), "uzmax-m6b-03-cron-"));
const statePath = path.join(tempDir, "distill-daily-state.json");

try {
  const first = await runCronProcess({
    payload: distillPayload(),
    statePath
  });
  assert.equal(first.exitCode, 0, first.stderr);
  const completed = findLog(first.stdout, "cron.distill_daily.completed");
  assert.equal(completed.status, "completed");
  assert.equal(completed.confirmationItemCount, 10);

  const second = await runCronProcess({
    payload: distillPayload(),
    statePath
  });
  assert.equal(second.exitCode, 0, second.stderr);
  const skipped = findLog(second.stdout, "cron.distill_daily.skipped");
  assert.equal(skipped.status, "skipped");
  assert.equal(skipped.reason, "daily_unit_already_completed");

  const state = JSON.parse(await readFile(statePath, "utf8"));
  assert.equal(state.distillRuns.length, 1);
  assert.equal(Object.keys(state.completedDailyRuns).length, 1);

  const failed = await runCronProcess({
    payloadText: "",
    statePath
  });
  assert.notEqual(failed.exitCode, 0);
  const failure = findLog(failed.stdout, "cron.distill_daily.failed");
  assert.match(failure.error, /UZMAX_CRON_DISTILL_PAYLOAD_JSON is required/);

  console.log(
    JSON.stringify({
      completedDistillRuns: state.distillRuns.length,
      dailyRunKeys: Object.keys(state.completedDailyRuns).length,
      event: "m6b_03_cron_artifact_smoke",
      failureExitCode: failed.exitCode,
      firstExitCode: first.exitCode,
      secondExitCode: second.exitCode,
      startCommand: "npm --workspace @uzmax/cron run start",
      status: "pass"
    })
  );
} finally {
  await rm(tempDir, { force: true, recursive: true });
}

async function runCronProcess({ payload, payloadText, statePath }) {
  const child = spawn(npmCommand, ["--workspace", "@uzmax/cron", "run", "start"], {
    env: {
      ...process.env,
      NODE_ENV: "production",
      UZMAX_CRON_DISTILL_PAYLOAD_JSON:
        payloadText === undefined ? JSON.stringify(payload) : payloadText,
      UZMAX_CRON_DISTILL_PERSISTENCE_MODE: "artifact_smoke_file",
      UZMAX_CRON_DISTILL_SCHEDULE_REF: "controlled://distill-schedule/m6b-03/daily",
      UZMAX_CRON_DISTILL_STATE_PATH: statePath
    },
    stdio: ["ignore", "pipe", "pipe"]
  });
  const [stdout, stderr, exit] = await Promise.all([
    readStream(child.stdout),
    readStream(child.stderr),
    waitForExit(child)
  ]);
  return { exitCode: exit.code, signal: exit.signal, stderr, stdout };
}

function findLog(output, event) {
  const entry = output
    .split(/\r?\n/)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return undefined;
      }
    })
    .find((item) => item?.event === event);
  assert(entry, `missing ${event} in stdout:\n${output}`);
  return entry;
}

function readStream(stream) {
  return new Promise((resolve, reject) => {
    let output = "";
    stream.setEncoding("utf8");
    stream.on("data", (chunk) => {
      output += chunk;
    });
    stream.on("error", reject);
    stream.on("end", () => resolve(output));
  });
}

function waitForExit(child) {
  return new Promise((resolve) => {
    child.on("exit", (code, signal) => resolve({ code, signal }));
  });
}

function distillPayload() {
  const businessDate = "2026-06-26";
  return {
    actorUserId: "44444444-4444-4444-8444-444444446203",
    auditRef: "controlled://distill-audit/m6b-03/run",
    businessDate,
    candidates: Array.from({ length: 12 }, (_, index) => ({
      candidateRef: `controlled://candidate/m6b-03/${index}`,
      confidenceBps: 9000 - index * 100,
      confirmationItemId: `66666666-6666-4666-8666-${String(666666666300 + index).padStart(12, "0")}`,
      kind: index % 3 === 0 ? "eval_candidate" : "knowledge_candidate",
      payloadRefs: { summaryRef: `controlled://candidate-summary/m6b-03/${index}` },
      sourceRef: `controlled://distill-source/m6b-03/${index}`,
      tieBreaker: `candidate-${String(index).padStart(2, "0")}`
    })),
    currentFrequency: "daily",
    dailyCounts: [
      day("2026-06-20", 10, 6, 1),
      day("2026-06-21", 10, 6, 1),
      day("2026-06-22", 10, 6, 1),
      day("2026-06-23", 10, 6, 1),
      day("2026-06-24", 10, 3, 4),
      day("2026-06-25", 10, 3, 4),
      day(businessDate, 10, 3, 4)
    ],
    downshiftReasonRef: "controlled://distill-health/m6b-03/downshift",
    healthSummaryRef: "controlled://distill-health/m6b-03/summary",
    orgId: "11111111-1111-4111-8111-111111116203",
    ownerAlertRef: "controlled://owner-alert/m6b-03/downshift",
    runId: "55555555-5555-4555-8555-555555556203",
    sourceWindowEnd: "2026-06-26T23:59:59.000Z",
    sourceWindowStart: "2026-06-26T00:00:00.000Z",
    summaryRef: "controlled://distill-summary/m6b-03/weekly",
    tenantId: "22222222-2222-4222-8222-222222226203"
  };
}

function day(businessDate, candidateCount, approvedCount, discardedCount) {
  return { approvedCount, businessDate, candidateCount, discardedCount };
}
