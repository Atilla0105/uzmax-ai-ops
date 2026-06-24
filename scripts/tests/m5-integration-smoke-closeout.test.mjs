import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import ts from "typescript";

const repoRoot = process.cwd();
const docs = {
  evidence: text("docs/evidence/M5/M5-08-integration-smoke-closeout.md"),
  index: text("docs/evidence/M5/README.md"),
  spec: text("docs/specs/M5-08-integration-smoke-closeout.md")
};
const sources = {
  ai: text("apps/admin/src/aiMemberConsoleContracts.ts"),
  logs: text("apps/admin/src/logsAnalyticsContracts.ts"),
  template: text("apps/admin/src/templateCenterContracts.ts")
};
const distill = await tsModule("packages/distill/src/index.ts");
const ai = await tsModule("apps/admin/src/aiMemberConsoleContracts.ts");
const logs = await tsModule("apps/admin/src/logsAnalyticsContracts.ts");
const template = await tsModule("apps/admin/src/templateCenterContracts.ts");
const db = await tsModule("packages/db/src/m5-operations-contracts.ts");

describe("M5-08 integration smoke closeout", () => {
  it("re-runs focused API and DB smoke suites for closeout", () => {
    runNodeTest("scripts/tests/m5-confirmation-queue-api.test.mjs");
    runNodeTest("scripts/tests/m5-operations-db-contracts-foundation.test.mjs");
  });

  it("proves the M5 operations-loop contracts without formal writes", () => {
    const candidates = Array.from({ length: 12 }, (_item, index) => ({
      candidateRef: `controlled://candidate/${String(index).padStart(2, "0")}`,
      confidenceBps: 9000 - index,
      kind: "knowledge_candidate",
      sourceRef: `controlled://distill/source/${String(index).padStart(2, "0")}`,
      tieBreaker: `candidate-${String(index).padStart(2, "0")}`
    }));
    const selection = distill.createDailyDistillCandidateSelection({
      auditRef: "controlled://audit/distill/closeout",
      businessDate: "2026-06-24",
      candidates,
      runRef: "controlled://distill/run/closeout"
    });
    assert.equal(selection.acceptedCandidates.length, 10);
    assert.equal(selection.truncatedCount, 2);

    const health = distill.summarizeSevenDayDistillPassRate({
      currentFrequency: "daily",
      days: [
        day("2026-06-18", 10, 3, 7),
        day("2026-06-19", 10, 3, 7),
        day("2026-06-20", 10, 3, 7),
        day("2026-06-21", 10, 3, 7),
        day("2026-06-22", 10, 3, 7),
        day("2026-06-23", 10, 3, 7),
        day("2026-06-24", 10, 3, 7)
      ],
      summaryRef: "controlled://distill/health/closeout"
    });
    assert.equal(health.downshiftRecommended, true);
    assert.equal(health.recommendedFrequency, "weekly");
    const alert = distill.createDistillOwnerAlertDraft({
      alertRef: "controlled://alert/distill/closeout",
      auditRequirementRef: "controlled://audit/requirement/closeout",
      downshiftReasonRef: "controlled://distill/reason/low-pass-rate",
      healthSummaryRef: health.summaryRef,
      recommendedFrequency: health.recommendedFrequency,
      tenantRef: "controlled://tenant/current"
    });
    assert.equal(alert.deliveryStatus, "draft_only");
    const recovery = distill.createManualDistillRecoveryAuditContract({
      actorRef: "controlled://actor/owner",
      auditRef: "controlled://audit/distill/recovery-closeout",
      fromFrequency: "weekly",
      healthSummaryRef: health.summaryRef,
      reasonRef: "controlled://distill/recovery/reason-closeout",
      recoveryRef: "controlled://distill/recovery-closeout",
      toFrequency: "daily"
    });
    assert.equal(recovery.writesRuntimeState, false);

    const stop = ai.createAiMemberActionDraft({
      action: "emergency_stop",
      auditRef: "controlled://ai-member/audit/closeout-stop",
      currentStatus: "breaker_offline",
      reasonRef: "controlled://ai-member/reason/closeout-stop"
    });
    assert.equal(stop.targetStatus, "disabled");
    assert.equal(stop.formalRuntimeWrite, false);
    const recover = ai.createAiMemberActionDraft({
      action: "recover_online",
      auditRef: "controlled://ai-member/audit/closeout-recover",
      currentStatus: "disabled",
      reasonRef: "controlled://ai-member/reason/closeout-recover"
    });
    assert.equal(recover.targetStatus, "online");

    assert.ok(logs.logsAnalyticsLogTables.operation.rows.some((row) => row.highRisk));
    const exportDraft = logs.createLogsAnalyticsExportDraft({
      actorRef: "controlled://analytics/actor/owner",
      dimensions: ["tenant", "ai_member", "time_grain"],
      filterRefs: ["controlled://analytics/filter/closeout"],
      metricRefs: ["controlled://metric/confirmation-pass-rate"],
      viewRef: "controlled://analytics/view/closeout"
    });
    assert.equal(exportDraft.formalExportWrite, false);
    assert.equal(exportDraft.requiresOwnerConfirmation, true);

    const tenantACopy = template.createTemplateCopyDraft({
      sourceTemplateRef: "controlled://template/config",
      targetTenantRef: "controlled://tenant/a",
      templateKind: "config",
      tenantVersionRef: "controlled://tenant-version/a/config"
    });
    const tenantBCopy = template.createTemplateCopyDraft({
      sourceTemplateRef: "controlled://template/config",
      targetTenantRef: "controlled://tenant/b",
      templateKind: "config",
      tenantVersionRef: "controlled://tenant-version/b/config"
    });
    assert.equal(tenantACopy.templateAutoOverwrite, false);
    assert.notEqual(tenantACopy.tenantVersionRef, tenantBCopy.tenantVersionRef);
  });

  it("smokes the M5 DB contract vocabulary used by closeout", () => {
    const contracts = db.m5OperationsContracts;
    assert.deepEqual(Object.values(contracts.tableNames), [
      "ai_capability_toggle",
      "ai_member",
      "ai_member_version",
      "confirmation_item",
      "distill_health_daily",
      "distill_run"
    ]);
    const scoped = scope();
    const run = contracts.createDistillRunContract({
      ...scoped,
      candidateCount: 10,
      candidateLimit: 10,
      frequency: "daily",
      id: "11111111-1111-4111-8111-111111111108",
      sourceWindowEnd: "2026-06-24T23:59:59.000Z",
      sourceWindowStart: "2026-06-24T00:00:00.000Z",
      status: "completed"
    });
    assert.equal(run.candidateLimit, 10);
    const confirmation = contracts.createConfirmationItemContract({
      ...scoped,
      candidatePayload: { summaryRef: "controlled://candidate/summary" },
      id: "22222222-2222-4222-8222-222222222208",
      kind: "conflict_candidate",
      sourceRef: "controlled://distill/source/closeout",
      status: "pending",
      targetKind: "template",
      targetRef: "controlled://template/config"
    });
    assert.equal(confirmation.status, "pending");
    const member = contracts.createAiMemberContract({
      ...scoped,
      breakerReasonRef: "controlled://ai-member/breaker/closeout",
      displayName: "Operations AI",
      id: "33333333-3333-4333-8333-333333333308",
      memberKey: "operations-ai",
      status: "breaker_offline"
    });
    assert.equal(member.status, "breaker_offline");
  });

  it("records closeout docs, incidents and boundaries without sensitive samples", () => {
    assert.match(docs.spec, /M5-08 Integration Smoke Closeout/);
    assert.match(docs.evidence, /m5_08_integration_closeout_ready__not_owner_accepted/);
    assert.match(docs.index, /Current closeout evidence/);
    for (const incident of [
      "INC-2026-06-24-m5-04-root-patch-target",
      "INC-2026-06-24-m5-05-root-patch-target",
      "INC-2026-06-24-m5-07-root-patch-target"
    ]) {
      assert.match(docs.evidence, new RegExp(incident));
    }
    assert.doesNotMatch(
      `${docs.spec}\n${docs.evidence}\n${docs.index}`,
      /owner_accepted_m5|GA-0 opened|production-ready|1\.0 release approved/i
    );
    assert.doesNotMatch(
      `${sources.ai}\n${sources.logs}\n${sources.template}`,
      /from\s+["'].*(?:apps\/api|apps\/worker|apps\/cron|packages\/db|packages\/distill|packages\/capabilities|packages\/engine|packages\/llm-gateway|packages\/evals|@uzmax\/api|@uzmax\/db)["']|process\.env|globalThis\.fetch|\bfetch\(|\bWebSocket\b|\bEventSource\b|\bXMLHttpRequest\b|navigator\.sendBeacon/i
    );
  });
});

function day(businessDate, candidateCount, approvedCount, discardedCount) {
  return { approvedCount, businessDate, candidateCount, discardedCount };
}

function scope() {
  return {
    orgId: "44444444-4444-4444-8444-444444444408",
    tenantId: "55555555-5555-4555-8555-555555555508"
  };
}

function runNodeTest(relativePath) {
  const result = spawnSync(process.execPath, ["--test", relativePath], {
    cwd: repoRoot,
    encoding: "utf8"
  });
  assert.equal(
    result.status,
    0,
    `${relativePath} failed\nSTDOUT:\n${result.stdout}\nSTDERR:\n${result.stderr}`
  );
}

function text(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

async function tsModule(relativePath) {
  const input = text(relativePath);
  const js = ts.transpileModule(input, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2023
    }
  }).outputText;
  const encoded = Buffer.from(js, "utf8").toString("base64");
  return import(`data:text/javascript;base64,${encoded}`);
}
