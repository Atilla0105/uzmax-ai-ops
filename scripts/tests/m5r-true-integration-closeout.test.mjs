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
  ci: text(".github/workflows/ci.yml"),
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

  it("resolves true DB wrapper modules and exports without invoking DB runners", async () => {
    const previous = process.env.UZMAX_RLS_DATABASE_URL;
    delete process.env.UZMAX_RLS_DATABASE_URL;

    const result = await runM5rTrueIntegrationCloseout();

    restoreEnv("UZMAX_RLS_DATABASE_URL", previous);
    assert.equal(result.status, "blocked_missing_env");
    assert.equal(result.wrapperExports.length, closeoutSteps.length);
    for (const resolved of result.wrapperExports) {
      assert.equal(resolved.exportType, "function");
      assert.equal(resolved.moduleResolved, true);
    }
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

  it("wires CI through a separate M5R flag and fails closed on missing secret", () => {
    const m4TrueDbClassifier = docs.ci.match(
      /case "\$file" in\s+apps\/api\/\*[\s\S]*?true_db_smoke_changed=true/
    )?.[0];

    assert.ok(m4TrueDbClassifier);
    assert.doesNotMatch(
      m4TrueDbClassifier,
      /\.github\/workflows\/ci\.yml|m5r-true-integration-closeout|M5R-08/
    );
    assert.match(docs.ci, /m5r_true_db_closeout_changed=false/);
    assert.match(docs.ci, /run_m5r_true_db_closeout=false/);
    assert.match(
      docs.ci,
      /scripts\/tests\/m5r-true-integration-closeout\.test\.mjs[\s\S]*?m5r_true_db_closeout_changed=true/
    );
    assert.match(docs.ci, /UZMAX_RLS_DATABASE_URL_BASE/);
    assert.match(docs.ci, /UZMAX_RLS_DATABASE_URL secret is required/);
    assert.match(docs.ci, /Apply M5R dev smoke migrations/);
    assert.match(docs.ci, /migration_url/);
    assert.match(docs.ci, /"pgbouncer", "connection_limit", "pool_timeout"/);
    assert.match(
      docs.ci,
      /0007_m5_operations_contracts_foundation\.sql[\s\S]*0008_m5r05_logs_analytics_runtime\.sql/
    );
    assert.match(
      docs.ci,
      /run_core == 'true'[\s\S]*run_true_db_smoke == 'true'[\s\S]*run_m5r_true_db_closeout == 'true'/
    );
  });

  it("records closeout status without owner acceptance or production/release claims", () => {
    assert.match(docs.spec, /M5R-08 True Integration Closeout/);
    assert.match(docs.spec, /scripts\/tests\/m5r-true-integration-closeout\.test\.mjs/);
    assert.match(docs.evidence, /Current CI true DB closeout status: `passed_true_db`/);
    assert.match(docs.evidence, /28183737387/);
    assert.match(docs.evidence, /M5R true integration closeout/);
    assert.match(docs.m5rIndex, /M5R-08 True Integration Closeout/);
    assert.match(
      docs.m5rIndex,
      /M5R-07 Admin Runtime Wiring \| `admin_runtime_wiring_supported/
    );
    assert.match(docs.m5Index, /m5_runtime_evidence_ready_not_owner_accepted/);
    assert.match(
      docs.m5rIndex,
      /m5r_08_true_integration_closeout_passed_true_db_not_owner_accepted/
    );
    assert.doesNotMatch(
      `${docs.spec}\n${docs.evidence}\n${docs.m5Index}\n${docs.m5rIndex}`,
      /owner_accepted_m5|owner_accepted_m5r|GA-0 opened|production-ready|1\.0 release approved/i
    );
  });
});

export async function runM5rTrueIntegrationCloseout() {
  const resolvedSteps = await resolveCloseoutWrapperExports();
  const plannedSteps = resolvedSteps.map(({ id, proves }) => ({ id, proves }));
  const wrapperExports = resolvedSteps.map(
    ({ exportName, exportType, id, moduleResolved }) => ({
      exportName,
      exportType,
      id,
      moduleResolved
    })
  );

  if (!process.env.UZMAX_RLS_DATABASE_URL?.trim()) {
    return {
      blocker: "UZMAX_RLS_DATABASE_URL is required",
      executedSteps: [],
      plannedSteps,
      status: "blocked_missing_env",
      trueDbStatus: "blocked_missing_env",
      wrapperExports
    };
  }

  const executedSteps = [];
  for (const step of resolvedSteps) {
    await step.runner();
    executedSteps.push({ id: step.id, status: "passed" });
  }
  return {
    executedSteps,
    plannedSteps,
    status: "passed_true_db",
    trueDbStatus: "passed_true_db",
    wrapperExports
  };
}

async function resolveCloseoutWrapperExports() {
  const resolvedSteps = [];
  for (const step of closeoutSteps) {
    const module = await import(step.modulePath);
    const runner = module[step.exportName];
    assert.equal(
      typeof runner,
      "function",
      `${step.modulePath} must export ${step.exportName}`
    );
    resolvedSteps.push({
      ...step,
      exportType: typeof runner,
      moduleResolved: true,
      runner
    });
  }
  return resolvedSteps;
}

function text(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function restoreEnv(name, value) {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}
