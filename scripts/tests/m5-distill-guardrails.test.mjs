import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import ts from "typescript";

const repoRoot = process.cwd();
const source = read("packages/distill/src/index.ts");
const spec = read("docs/specs/M5-02-distill-guardrails.md");
const evidence = read("docs/evidence/M5/M5-02-distill-guardrails.md");
const m5Readme = read("docs/evidence/M5/README.md");
const contractsReadme = read("docs/contracts/README.md");
const distill = await importTypescriptSource("packages/distill/src/index.ts");

describe("M5-02 distill guardrails", () => {
  it("caps daily candidates at 10 with confidence sort and deterministic tie-breaker", () => {
    const candidates = [
      candidate("z", 9100),
      candidate("a", 9100),
      candidate("b", 9000),
      candidate("c", 8900),
      candidate("d", 8800),
      candidate("e", 8700),
      candidate("f", 8600),
      candidate("g", 8500),
      candidate("h", 8400),
      candidate("i", 8300),
      candidate("j", 8200),
      candidate("k", 8100)
    ];

    const selection = distill.createDailyDistillCandidateSelection({
      auditRef: "controlled://audit/distill/run-1",
      businessDate: "2026-06-24",
      candidates,
      runRef: "controlled://distill/run-1"
    });

    assert.equal(selection.candidateLimit, 10);
    assert.equal(selection.candidateCount, 12);
    assert.equal(selection.truncatedCount, 2);
    assert.deepEqual(
      selection.acceptedCandidates.map((item) => item.candidateRef),
      [
        "controlled://candidate/a",
        "controlled://candidate/z",
        "controlled://candidate/b",
        "controlled://candidate/c",
        "controlled://candidate/d",
        "controlled://candidate/e",
        "controlled://candidate/f",
        "controlled://candidate/g",
        "controlled://candidate/h",
        "controlled://candidate/i"
      ]
    );
    assert.deepEqual(selection.truncatedCandidateRefs, [
      "controlled://candidate/j",
      "controlled://candidate/k"
    ]);
    assert.throws(
      () =>
        distill.createDailyDistillCandidateSelection({
          auditRef: "controlled://audit/distill/run-1",
          businessDate: "2026-06-24",
          candidates,
          candidateLimit: 11
        }),
      /candidateLimit must be an integer from 0 to 10/
    );
    assert.throws(
      () =>
        distill.createDailyDistillCandidateSelection({
          auditRef: "controlled://audit/distill/run-1",
          businessDate: "2026-06-24",
          candidates: [{ ...candidate("raw", 5000), prompt: "raw prompt" }]
        }),
      /candidates\[0\]\.prompt is a forbidden raw payload key/
    );
  });

  it("computes seven-day pass rate and recommends weekly after three low days", () => {
    const summary = distill.summarizeSevenDayDistillPassRate({
      days: [
        day("2026-06-18", 10, 8, 1),
        day("2026-06-19", 10, 7, 2),
        day("2026-06-20", 10, 6, 3),
        day("2026-06-21", 10, 5, 3),
        day("2026-06-22", 10, 3, 5),
        day("2026-06-23", 10, 2, 6),
        day("2026-06-24", 10, 1, 7)
      ],
      summaryRef: "controlled://distill/health/summary-1"
    });

    assert.equal(summary.sevenDayPassRateBps, 4571);
    assert.equal(summary.consecutiveLowPassDays, 3);
    assert.equal(summary.downshiftRecommended, true);
    assert.equal(summary.recommendedFrequency, "weekly");
    assert.deepEqual(summary.totals, {
      approvedCount: 32,
      candidateCount: 70,
      discardedCount: 27
    });

    const paused = distill.summarizeSevenDayDistillPassRate({
      currentFrequency: "paused",
      days: [day("2026-06-24", 10, 1, 7)],
      summaryRef: "controlled://distill/health/summary-2"
    });
    assert.equal(paused.recommendedFrequency, "paused");
    assert.equal(paused.downshiftRecommended, false);

    const weekly = distill.summarizeSevenDayDistillPassRate({
      currentFrequency: "weekly",
      days: [day("2026-06-24", 10, 1, 7)],
      summaryRef: "controlled://distill/health/summary-weekly"
    });
    assert.equal(weekly.recommendedFrequency, "weekly");
    assert.equal(weekly.downshiftRecommended, false);

    assert.throws(
      () =>
        distill.summarizeSevenDayDistillPassRate({
          days: [day("2026-06-24", 5, 4, 2)],
          summaryRef: "controlled://distill/health/summary-3"
        }),
      /approvedCount \+ discardedCount must not exceed candidateCount/
    );
    assert.throws(
      () =>
        distill.summarizeSevenDayDistillPassRate({
          days: [day("2026-06-24", -1, 0, 0)],
          summaryRef: "controlled://distill/health/summary-4"
        }),
      /candidateCount must be an integer from 0/
    );
  });

  it("creates owner alert and manual recovery audit contracts with controlled refs only", () => {
    const alert = distill.createDistillOwnerAlertDraft({
      alertRef: "controlled://alert/distill/downshift-1",
      auditRequirementRef: "controlled://audit/requirement/downshift-1",
      downshiftReasonRef: "controlled://distill/reason/low-pass-rate",
      generatedAt: "2026-06-24T00:00:00.000Z",
      healthSummaryRef: "controlled://distill/health/summary-1",
      ownerRef: "controlled://owner/project-owner",
      recommendedFrequency: "weekly",
      tenantRef: "controlled://tenant/internal-ops"
    });
    assert.equal(alert.deliveryStatus, "draft_only");
    assert.equal(alert.payloadPolicy, "controlled_refs_only");
    assert.equal(alert.requiresOwnerReview, true);

    const recovery = distill.createManualDistillRecoveryAuditContract({
      actorRef: "controlled://actor/project-owner",
      auditRef: "controlled://audit/distill/recovery-1",
      confirmedAt: "2026-06-24T01:00:00.000Z",
      fromFrequency: "weekly",
      healthSummaryRef: "controlled://distill/health/summary-1",
      reasonRef: "controlled://distill/recovery/reason-1",
      recoveryRef: "controlled://distill/recovery-1",
      toFrequency: "daily"
    });
    assert.equal(recovery.writesRuntimeState, false);
    assert.equal(recovery.requiresControlledAuditRef, true);
    assert.equal(recovery.action, "distill_frequency_manual_recovery");

    for (const unsafeRef of [
      "http://example.test/ref",
      "https://example.test/ref",
      "data:text/plain;base64,SGVsbG8=",
      "blob://local/ref",
      "file:///tmp/ref",
      "QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVo1234567890abcd"
    ]) {
      assert.throws(
        () =>
          distill.createManualDistillRecoveryAuditContract({
            ...recovery,
            actorRef: unsafeRef
          }),
        /actorRef must be a controlled ref/
      );
    }
    assert.throws(
      () =>
        distill.createDistillOwnerAlertDraft({
          ...alert,
          raw: "raw payload"
        }),
      /input\.raw is a forbidden raw payload key/
    );
  });

  it("records M5-02 scope, docs and foundation-only acceptance status", () => {
    assert.match(source, /createDailyDistillCandidateSelection/);
    assert.match(source, /createManualDistillRecoveryAuditContract/);
    assert.match(spec, /M5-02 Distill Guardrails/);
    assert.match(spec, /changed source files <= 1, net source LOC <= 250/);
    assert.match(spec, /behavior_contract_supported_not_closed/);
    assert.match(evidence, /M5-02 Distill Guardrails Evidence/);
    assert.match(evidence, /No Sensitive Data Statement/);
    assert.match(evidence, /behavior_contract_supported_not_closed/);
    assert.match(evidence, /does not implement API\/admin\/worker\/runtime scheduler/);
    assert.match(m5Readme, /M5-02 distill guardrails/);
    assert.match(contractsReadme, /M5 Distill Guardrails Contract/);
  });
});

function candidate(key, confidenceBps) {
  return {
    candidateRef: `controlled://candidate/${key}`,
    confidenceBps,
    kind: "knowledge_candidate",
    sourceRef: `controlled://source/${key}`
  };
}

function day(businessDate, candidateCount, approvedCount, discardedCount) {
  return { approvedCount, businessDate, candidateCount, discardedCount };
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

async function importTypescriptSource(relativePath) {
  const transpiled = ts.transpileModule(read(relativePath), {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2023
    },
    fileName: relativePath
  });
  const encoded = Buffer.from(transpiled.outputText).toString("base64");
  return import(`data:text/javascript;base64,${encoded}`);
}
