import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import ts from "typescript";

const root = process.cwd();
const visionSource = workspaceText("packages/capabilities/vision/src/index.ts");
const contracts = workspaceText("docs/contracts/README.md");
const m3Index = workspaceText("docs/evidence/M3/README.md");
const m3Evidence = workspaceText(
  "docs/evidence/M3/M3-06-vision-screenshot-diagnostics-foundation.md",
  "optional"
);
const vision = await importTsSource("packages/capabilities/vision/src/index.ts");

describe("M3-06 vision screenshot diagnostics foundation", () => {
  it("exports a pure vision contract without DB, LLM, provider, or sibling capability imports", () => {
    assert.equal(vision.packageName, "@uzmax/capability-vision");
    assert.equal(typeof vision.createScreenshotDiagnosisInput, "function");
    assert.equal(typeof vision.evaluateScreenshotDiagnosis, "function");
    assert.equal(typeof vision.createScreenshotSampleManifest, "function");
    assert.deepEqual(vision.visionScreenshotKinds, {
      merchantChat: "merchant_chat",
      orderPage: "order_page",
      paymentPage: "payment_page"
    });
    assert.deepEqual(vision.visionDiagnosisStatuses, {
      diagnosisCard: "diagnosis_card",
      handoffRequired: "handoff_required",
      uncertain: "uncertain"
    });
    assert.doesNotMatch(visionSource, /@uzmax\/db|@uzmax\/llm-gateway|process\.env/i);
    assert.doesNotMatch(
      visionSource,
      /from ["'][^"']*capabilities\/(?!vision)|@uzmax\/capability-(?!vision)/
    );
  });

  it("accepts only controlled screenshot and media refs", () => {
    const input = vision.createScreenshotDiagnosisInput(controlledInput());

    assert.deepEqual(input, {
      manifestRef: "manifest://vision/screenshot-case-001",
      redactionRef: "redaction://vision/screenshot-case-001",
      screenshotKind: "order_page",
      storageRef: "storage://vision/screenshots/case-001"
    });

    for (const unsafe of [
      { storageRef: "data:image/png;base64,AAAA" },
      { storageRef: "https://example.test/case.png" },
      { storageRef: "/tmp/case.png" },
      { storageRef: "iVBORw0KGgoAAAANSUhEUgAAAAUA" },
      { rawScreenshot: "bytes" },
      { rawOcrText: "customer message text" },
      { customerPlaintext: "customer asked about payment" }
    ]) {
      assert.throws(
        () =>
          vision.createScreenshotDiagnosisInput({ ...controlledInput(), ...unsafe }),
        /raw screenshot input is not allowed|must use .* refs|must be a controlled ref/
      );
    }

    for (const swapped of [
      { storageRef: "manifest://vision/screenshot-case-001" },
      { manifestRef: "storage://vision/screenshots/case-001" },
      { redactionRef: "storage://vision/screenshots/case-001" }
    ]) {
      assert.throws(
        () =>
          vision.createScreenshotDiagnosisInput({
            ...controlledInput(),
            ...swapped
          }),
        /must use .* refs|must be a controlled ref/
      );
    }
  });

  it("returns a bounded high-confidence diagnosis card for synthetic controlled candidates", () => {
    const result = vision.evaluateScreenshotDiagnosis({
      candidate: highConfidenceCandidate(),
      input: vision.createScreenshotDiagnosisInput(controlledInput())
    });

    assert.equal(result.status, "diagnosis_card");
    assert.equal(result.reasonCode, "high_confidence_controlled");
    assert.deepEqual(result.card.diagnosis, {
      code: "order_page_payment_blocked",
      title: "Payment step blocked"
    });
    assert.deepEqual(result.card.observations, [
      {
        code: "payment_button_missing",
        evidenceRef: "controlled://vision/evidence/payment-button",
        title: "Payment button is not visible"
      },
      {
        code: "redaction_confirmed",
        evidenceRef: "redaction://vision/screenshot-case-001",
        title: "Screenshot is redacted"
      }
    ]);
    assert.deepEqual(result.card.actions, [
      {
        code: "request_order_page_check",
        title: "Ask operator to verify the payment step"
      }
    ]);
    assert.deepEqual(result.refs, {
      evidenceRefs: [
        "storage://vision/screenshots/case-001",
        "manifest://vision/screenshot-case-001",
        "redaction://vision/screenshot-case-001",
        "controlled://vision/evidence/payment-button"
      ],
      manifestRef: "manifest://vision/screenshot-case-001",
      modelResultRef: "controlled://vision/model-result/case-001",
      providerResultRef: "controlled://vision/provider-result/case-001",
      redactionRef: "redaction://vision/screenshot-case-001",
      storageRef: "storage://vision/screenshots/case-001"
    });

    const serialized = JSON.stringify(result);
    assert.doesNotMatch(
      serialized,
      /rawScreenshot|rawOcr|customerPlaintext|data:image|base64/i
    );
    assert.equal(result.card.observations.length <= 4, true);
    assert.equal(result.card.actions.length <= 3, true);
  });

  it("fails closed for low confidence, missing signals, ambiguous, unsupported, and uncertain candidates", () => {
    const input = vision.createScreenshotDiagnosisInput(controlledInput());

    const lowConfidence = vision.evaluateScreenshotDiagnosis({
      candidate: { ...highConfidenceCandidate(), confidence: 0.61 },
      input
    });
    assert.equal(lowConfidence.status, "handoff_required");
    assert.equal(lowConfidence.reasonCode, "low_confidence");
    assert.equal(lowConfidence.card, undefined);

    const missingSignals = vision.evaluateScreenshotDiagnosis({
      candidate: {
        ...highConfidenceCandidate(),
        requiredSignals: {
          keyUiPresent: false,
          pageKindMatched: true,
          redactionConfirmed: true
        }
      },
      input
    });
    assert.equal(missingSignals.status, "handoff_required");
    assert.equal(missingSignals.reasonCode, "required_signals_missing");

    const ambiguous = vision.evaluateScreenshotDiagnosis({
      candidate: { ...highConfidenceCandidate(), ambiguous: true },
      input
    });
    assert.equal(ambiguous.status, "uncertain");
    assert.equal(ambiguous.reasonCode, "diagnosis_ambiguous");

    const uncertain = vision.evaluateScreenshotDiagnosis({
      candidate: { ...highConfidenceCandidate(), uncertain: true },
      input
    });
    assert.equal(uncertain.status, "uncertain");
    assert.equal(uncertain.reasonCode, "candidate_uncertain");

    for (const pageKind of ["receipt_photo", "x", "receipt photo", ""]) {
      const unsupported = vision.evaluateScreenshotDiagnosis({
        candidate: { ...highConfidenceCandidate(), pageKind },
        input
      });
      assert.equal(unsupported.status, "handoff_required");
      assert.equal(unsupported.reasonCode, "unsupported_screenshot_kind");
      assert.equal(unsupported.card, undefined);
    }
  });

  it("rejects raw candidate fields and unsafe evidence refs", () => {
    const input = vision.createScreenshotDiagnosisInput(controlledInput());

    assert.throws(
      () =>
        vision.evaluateScreenshotDiagnosis({
          candidate: {
            ...highConfidenceCandidate(),
            observations: [
              {
                code: "raw",
                evidenceRef: "https://example.test/raw.png",
                title: "raw link"
              }
            ]
          },
          input
        }),
      /must use .* refs|must be a controlled ref/
    );

    assert.throws(
      () =>
        vision.evaluateScreenshotDiagnosis({
          candidate: { ...highConfidenceCandidate(), rawOcrText: "raw OCR text" },
          input
        }),
      /raw screenshot input is not allowed/
    );

    for (const rawField of ["messageText", "customerMessage", "caption"]) {
      assert.throws(
        () =>
          vision.evaluateScreenshotDiagnosis({
            candidate: {
              ...highConfidenceCandidate(),
              [rawField]: "customer typed a payment problem"
            },
            input
          }),
        /raw screenshot input is not allowed|unsupported field/
      );
    }
  });

  it("builds a safe sample manifest while preserving the >=20 owner sample blocker", () => {
    const missing = vision.createScreenshotSampleManifest({
      accessScope: "owner_controlled_storage",
      cases: [],
      manifestRef: "manifest://vision/screenshot-cases",
      ownerConfirmationStatus: "missing",
      redactionMethod: "manual_redaction_v1"
    });
    assert.equal(missing.status, "owner_samples_missing");
    assert.equal(missing.f02Closeout, "blocked");
    assert.equal(missing.requiredCount, 20);
    assert.equal(missing.actualCount, 0);

    const insufficient = vision.createScreenshotSampleManifest({
      accessScope: "owner_controlled_storage",
      cases: Array.from({ length: 19 }, (_, index) =>
        manifestCase(`case-${String(index + 1).padStart(2, "0")}`)
      ),
      manifestRef: "manifest://vision/screenshot-cases",
      ownerConfirmationStatus: "confirmed",
      redactionMethod: "manual_redaction_v1"
    });
    assert.equal(insufficient.status, "insufficient_owner_samples");
    assert.equal(insufficient.f02Closeout, "blocked");
    assert.equal(insufficient.actualCount, 19);

    const readyForFutureEval = vision.createScreenshotSampleManifest({
      accessScope: "owner_controlled_storage",
      cases: Array.from({ length: 20 }, (_, index) =>
        manifestCase(`case-${String(index + 1).padStart(2, "0")}`)
      ),
      manifestRef: "manifest://vision/screenshot-cases",
      ownerConfirmationStatus: "confirmed",
      redactionMethod: "manual_redaction_v1"
    });
    assert.equal(readyForFutureEval.status, "sample_manifest_ready_for_future_eval");
    assert.equal(readyForFutureEval.f02Closeout, "not_closed_foundation_only");
    assert.equal(readyForFutureEval.categoryCounts.order_page, 20);
    assert.doesNotMatch(
      JSON.stringify(readyForFutureEval),
      /rawScreenshot|customerText|data:image/i
    );

    assert.throws(
      () =>
        vision.createScreenshotSampleManifest({
          accessScope: "owner_controlled_storage",
          cases: [{ ...manifestCase("raw-case"), rawScreenshot: "bytes" }],
          manifestRef: "manifest://vision/screenshot-cases",
          ownerConfirmationStatus: "confirmed",
          redactionMethod: "manual_redaction_v1"
        }),
      /raw screenshot input is not allowed/
    );

    assert.throws(
      () =>
        vision.createScreenshotSampleManifest({
          accessScope: "owner_controlled_storage",
          cases: [
            {
              ...manifestCase("notes-case"),
              notes: "customer text copied from screenshot"
            }
          ],
          manifestRef: "manifest://vision/screenshot-cases",
          ownerConfirmationStatus: "confirmed",
          redactionMethod: "manual_redaction_v1"
        }),
      /raw screenshot input is not allowed|unsupported field/
    );
  });

  it("documents M3-06 as foundation-only with owner screenshot blockers preserved", () => {
    assert.match(contracts, /M3 Vision Screenshot Diagnostics Foundation/);
    assert.match(contracts, /controlled screenshot refs/);
    assert.match(contracts, /diagnosis_card/);
    assert.match(m3Index, /M3-06-vision-screenshot-diagnostics-foundation/);
    assert.match(m3Index, />=20 owner screenshot samples/);
    assert.match(m3Evidence, /F-02/);
    assert.match(m3Evidence, /foundation-only/i);
    assert.match(m3Evidence, /owner screenshot samples/i);
    assert.match(m3Evidence, /No raw screenshots/i);
    assert.doesNotMatch(m3Evidence, /F-02\s*\|\s*closed/i);
  });
});

function controlledInput() {
  return {
    manifestRef: "manifest://vision/screenshot-case-001",
    redactionRef: "redaction://vision/screenshot-case-001",
    screenshotKind: "order_page",
    storageRef: "storage://vision/screenshots/case-001"
  };
}

function highConfidenceCandidate() {
  return {
    actions: [
      {
        code: "request_order_page_check",
        title: "Ask operator to verify the payment step"
      }
    ],
    confidence: 0.92,
    diagnosisCode: "order_page_payment_blocked",
    diagnosisTitle: "Payment step blocked",
    evidenceRefs: [
      "storage://vision/screenshots/case-001",
      "manifest://vision/screenshot-case-001",
      "redaction://vision/screenshot-case-001"
    ],
    modelResultRef: "controlled://vision/model-result/case-001",
    observations: [
      {
        code: "payment_button_missing",
        evidenceRef: "controlled://vision/evidence/payment-button",
        title: "Payment button is not visible"
      },
      {
        code: "redaction_confirmed",
        evidenceRef: "redaction://vision/screenshot-case-001",
        title: "Screenshot is redacted"
      }
    ],
    pageKind: "order_page",
    providerResultRef: "controlled://vision/provider-result/case-001",
    requiredSignals: {
      keyUiPresent: true,
      pageKindMatched: true,
      redactionConfirmed: true
    }
  };
}

function manifestCase(caseId) {
  return {
    caseId,
    category: "order_page",
    expectedOutcomeRef: `controlled://vision/expected/${caseId}`,
    redactionRef: `redaction://vision/${caseId}`,
    storageRef: `storage://vision/screenshots/${caseId}`
  };
}

function workspaceText(relativePath, mode = "required") {
  const filePath = path.join(root, relativePath);
  if (!existsSync(filePath)) {
    if (mode === "optional") return "";
    throw new Error(`missing workspace file: ${relativePath}`);
  }
  return readFileSync(filePath, "utf8");
}

async function importTsSource(relativePath) {
  const transpiled = ts.transpileModule(workspaceText(relativePath), {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2023
    },
    fileName: relativePath
  }).outputText;
  const moduleUrl = `data:text/javascript;base64,${Buffer.from(transpiled).toString(
    "base64"
  )}`;
  return import(moduleUrl);
}
