import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const repoRoot = process.cwd();

const closeoutSteps = [
  {
    exportName: "runM5rDistillSchedulerHealthTrueDbSmoke",
    id: "m5r-03-distill-candidate-health",
    modulePath:
      "../../packages/db/scripts/run-m5r-distill-scheduler-health-true-db-smoke.mjs",
    proves:
      "distill generates capped candidates, persists health/downshift/manual recovery evidence"
  },
  {
    exportName: "runM5rConfirmationQueueTrueDbSmoke",
    id: "m5r-01-confirmation-queue-persistence",
    modulePath:
      "../../packages/db/scripts/run-m5r-confirmation-queue-true-db-smoke.mjs",
    proves:
      "confirmation queue persistence, decisions, conflict diff and formalWrite=false"
  },
  {
    exportName: "runM5rFormalWriteTrueDbSmoke",
    id: "m5r-02-formal-write-pipeline",
    modulePath: "../../packages/db/scripts/run-m5r-formal-write-true-db-smoke.mjs",
    proves:
      "approved/edited decisions write config_version+audit_log while pending/discarded/blocked do not write"
  },
  {
    exportName: "runM5rLogsAnalyticsTrueDbSmoke",
    id: "m5r-05-logs-analytics-readback",
    modulePath: "../../packages/db/scripts/run-m5r-logs-analytics-true-db-smoke.mjs",
    proves: "audit/log readback, fixed analytics board and controlled export draft"
  },
  {
    exportName: "runM5rTemplateCopyTrueDbSmoke",
    id: "m5r-06-template-copy-independence",
    modulePath: "../../packages/db/scripts/run-m5r-template-copy-true-db-smoke.mjs",
    proves: "template copy creates independent tenant-owned config_version snapshot"
  },
  {
    exportName: "runM5rAiMemberRuntimeTrueDbSmoke",
    id: "m5r-04-ai-member-emergency-recovery",
    modulePath:
      "../../packages/db/scripts/tests/run-m5r-ai-member-runtime-true-db-smoke.mjs",
    proves: "AI emergency stop/recovery/toggle runtime path and audit writes"
  }
];

const docs = {
  evidence: text("docs/evidence/M5R/M5R-08-true-integration-closeout.md"),
  m5Index: text("docs/evidence/M5/README.md"),
  m5rIndex: text("docs/evidence/M5R/README.md"),
  spec: text("docs/specs/M5R-08-true-integration-closeout.md")
};

describe("M5R-08 true integration closeout", () => {
  it("aggregates the existing M5R true DB smoke wrappers without parallel runtime logic", () => {
    const source = text("scripts/tests/m5r-true-integration-closeout.test.mjs");

    for (const marker of [
      "runM5rDistillSchedulerHealthTrueDbSmoke",
      "runM5rConfirmationQueueTrueDbSmoke",
      "runM5rFormalWriteTrueDbSmoke",
      "runM5rLogsAnalyticsTrueDbSmoke",
      "runM5rTemplateCopyTrueDbSmoke",
      "runM5rAiMemberRuntimeTrueDbSmoke"
    ]) {
      assert.match(source, new RegExp(marker));
    }
    assert.deepEqual(
      closeoutSteps.map((step) => step.id),
      [
        "m5r-03-distill-candidate-health",
        "m5r-01-confirmation-queue-persistence",
        "m5r-02-formal-write-pipeline",
        "m5r-05-logs-analytics-readback",
        "m5r-06-template-copy-independence",
        "m5r-04-ai-member-emergency-recovery"
      ]
    );
  });

  it("reports blocked_missing_env before any true DB runner executes when env is absent", async () => {
    const previous = process.env.UZMAX_RLS_DATABASE_URL;
    delete process.env.UZMAX_RLS_DATABASE_URL;

    const result = await runM5rTrueIntegrationCloseout();

    restoreEnv("UZMAX_RLS_DATABASE_URL", previous);
    assert.equal(result.status, "blocked_missing_env");
    assert.equal(result.trueDbStatus, "blocked_missing_env");
    assert.equal(result.blocker, "UZMAX_RLS_DATABASE_URL is required");
    assert.deepEqual(result.executedSteps, []);
    assert.equal(result.plannedSteps.length, closeoutSteps.length);
  });

  it("runs the true DB closeout chain only when UZMAX_RLS_DATABASE_URL is present", async () => {
    const result = await runM5rTrueIntegrationCloseout();

    if (!process.env.UZMAX_RLS_DATABASE_URL?.trim()) {
      assert.equal(result.status, "blocked_missing_env");
      assert.deepEqual(result.executedSteps, []);
      return;
    }

    assert.equal(result.status, "passed_true_db");
    assert.deepEqual(
      result.executedSteps.map((step) => step.id),
      closeoutSteps.map((step) => step.id)
    );
  });

  it("records closeout status without owner acceptance or production/release claims", () => {
    assert.match(docs.spec, /M5R-08 True Integration Closeout/);
    assert.match(docs.spec, /scripts\/tests\/m5r-true-integration-closeout\.test\.mjs/);
    assert.match(docs.evidence, /runtime-evidence-ready for owner review/);
    assert.match(docs.evidence, /blocked_missing_env/);
    assert.match(docs.m5rIndex, /M5R-08 True Integration Closeout/);
    assert.match(
      docs.m5rIndex,
      /M5R-07 Admin Runtime Wiring \| `admin_runtime_wiring_supported/
    );
    assert.match(
      docs.m5Index,
      /m5_runtime_evidence_ready_for_owner_review__true_db_closeout_blocked_missing_env__not_owner_accepted/
    );
    assert.doesNotMatch(
      `${docs.spec}\n${docs.evidence}\n${docs.m5Index}\n${docs.m5rIndex}`,
      /owner_accepted_m5|owner_accepted_m5r|GA-0 opened|production-ready|1\.0 release approved/i
    );
  });
});

export async function runM5rTrueIntegrationCloseout() {
  const plannedSteps = closeoutSteps.map(({ id, proves }) => ({ id, proves }));
  if (!process.env.UZMAX_RLS_DATABASE_URL?.trim()) {
    return {
      blocker: "UZMAX_RLS_DATABASE_URL is required",
      executedSteps: [],
      plannedSteps,
      status: "blocked_missing_env",
      trueDbStatus: "blocked_missing_env"
    };
  }

  const executedSteps = [];
  for (const step of closeoutSteps) {
    const module = await import(step.modulePath);
    await module[step.exportName]();
    executedSteps.push({ id: step.id, status: "passed" });
  }
  return {
    executedSteps,
    plannedSteps,
    status: "passed_true_db",
    trueDbStatus: "passed_true_db"
  };
}

function text(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function restoreEnv(name, value) {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}
