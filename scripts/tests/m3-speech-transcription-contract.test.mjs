import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import ts from "typescript";

const root = process.cwd();
const speechSource = workspaceText("packages/capabilities/speech/src/index.ts");
const spec = workspaceText("docs/specs/M3-07-speech-transcription-contract.md");
const contracts = workspaceText("docs/contracts/README.md");
const m3Index = workspaceText("docs/evidence/M3/README.md");
const m3Evidence = workspaceText(
  "docs/evidence/M3/M3-07-speech-transcription-contract.md",
  "optional"
);
const speech = await importTsSource("packages/capabilities/speech/src/index.ts");

describe("M3-07 speech transcription contract", () => {
  it("exports a pure speech contract without DB, LLM, provider, env, or sibling capability imports", () => {
    assert.equal(speech.packageName, "@uzmax/capability-speech");
    assert.equal(typeof speech.createSpeechTranscriptionInput, "function");
    assert.equal(typeof speech.evaluateSpeechTranscription, "function");
    assert.equal(typeof speech.createSpeechSampleManifest, "function");
    assert.deepEqual(speech.speechLanguages, {
      russian: "ru",
      uzbekCyrillic: "uz-Cyrl",
      uzbekLatin: "uz-Latn"
    });
    assert.deepEqual(speech.speechTranscriptionStatuses, {
      handoffRequired: "handoff_required",
      transcriptReady: "transcript_ready",
      uncertain: "uncertain",
      unsupportedLanguage: "unsupported_language"
    });
    assert.doesNotMatch(
      speechSource,
      /@uzmax\/db|@uzmax\/llm-gateway|@uzmax\/evals|process\.env|openai|whisper|assemblyai|deepgram|speechmatics/i
    );
    assert.doesNotMatch(
      speechSource,
      /from ["'][^"']*capabilities\/(?!speech)|@uzmax\/capability-(?!speech)/
    );
  });

  it("accepts only field-specific controlled speech refs", () => {
    const input = speech.createSpeechTranscriptionInput(controlledInput());

    assert.deepEqual(input, controlledInput());

    for (const unsafe of [
      { audioStorageRef: "data:audio/ogg;base64,AAAA" },
      { audioStorageRef: "https://example.test/audio.ogg" },
      { audioStorageRef: "/tmp/audio.ogg" },
      { audioStorageRef: "TWFuIGlzIGRpc3Rpbmd1aXNoZWQ=" },
      { rawAudioBytes: "bytes" },
      { telegramPayload: { voice: { file_id: "raw-file-id" } } },
      { rawTranscript: "raw transcript" },
      { messageText: "customer text" }
    ]) {
      assert.throws(
        () =>
          speech.createSpeechTranscriptionInput({ ...controlledInput(), ...unsafe }),
        /raw speech input is not allowed|must use .* refs/
      );
    }

    for (const swapped of [
      { audioStorageRef: "manifest://speech/case-001" },
      { manifestRef: "storage://speech/audio/case-001" },
      { redactionRef: "controlled://speech/redaction/case-001" }
    ]) {
      assert.throws(
        () =>
          speech.createSpeechTranscriptionInput({
            ...controlledInput(),
            ...swapped
          }),
        /must use .* refs/
      );
    }
  });

  it("returns bounded transcript_ready results for Uzbek Latin, Uzbek Cyrillic, and Russian synthetic candidates", () => {
    const cases = [
      {
        language: "uz-Latn",
        script: "Latn",
        text: "salom test ovoz"
      },
      {
        language: "uz-Cyrl",
        script: "Cyrl",
        text: "салом тест овоз"
      },
      {
        language: "ru",
        script: "Cyrl",
        text: "тестовая речь готова"
      }
    ];

    for (const item of cases) {
      const result = speech.evaluateSpeechTranscription({
        candidate: highConfidenceCandidate({
          language: item.language,
          transcriptText: item.text
        }),
        input: controlledInput({ language: item.language })
      });

      assert.equal(result.status, "transcript_ready");
      assert.equal(result.language, item.language);
      assert.equal(result.script, item.script);
      assert.equal(result.confidence, 0.91);
      assert.equal(result.transcript.text, item.text);
      assert.equal(result.refs.audioStorageRef, "storage://speech/audio/case-001");
      assert.equal(result.refs.manifestRef, "manifest://speech/case-001");
      assert.equal(result.refs.redactionRef, "redaction://speech/case-001");
      assert.equal(
        result.refs.modelResultRef,
        "controlled://speech/model-result/case-001"
      );
      assert.equal(
        result.refs.providerResultRef,
        "controlled://speech/provider-result/case-001"
      );
      assert.deepEqual(result.refs.evidenceRefs, [
        "storage://speech/audio/case-001",
        "manifest://speech/case-001",
        "redaction://speech/case-001",
        "controlled://speech/evidence/language-signal"
      ]);
      assert.doesNotMatch(
        JSON.stringify(result),
        /rawAudio|rawTranscript|telegramPayload|customerPlaintext|data:audio/i
      );
    }
  });

  it("fails closed for low confidence, missing signals, uncertainty, ambiguity, unsupported language, and script mismatch", () => {
    const input = speech.createSpeechTranscriptionInput(controlledInput());

    const lowConfidence = speech.evaluateSpeechTranscription({
      candidate: highConfidenceCandidate({ confidence: 0.6 }),
      input
    });
    assert.equal(lowConfidence.status, "handoff_required");
    assert.equal(lowConfidence.reasonCode, "low_confidence");
    assert.equal(lowConfidence.transcript, undefined);

    const missingSignals = speech.evaluateSpeechTranscription({
      candidate: highConfidenceCandidate({
        requiredSignals: {
          audioRefMatched: true,
          languageDetected: false,
          redactionConfirmed: true,
          syntheticControlled: true
        }
      }),
      input
    });
    assert.equal(missingSignals.status, "handoff_required");
    assert.equal(missingSignals.reasonCode, "required_signals_missing");

    const uncertain = speech.evaluateSpeechTranscription({
      candidate: highConfidenceCandidate({ uncertain: true }),
      input
    });
    assert.equal(uncertain.status, "uncertain");
    assert.equal(uncertain.reasonCode, "candidate_uncertain");

    const ambiguous = speech.evaluateSpeechTranscription({
      candidate: highConfidenceCandidate({ ambiguous: true }),
      input
    });
    assert.equal(ambiguous.status, "uncertain");
    assert.equal(ambiguous.reasonCode, "transcript_ambiguous");

    const unsupported = speech.evaluateSpeechTranscription({
      candidate: highConfidenceCandidate({ language: "en" }),
      input
    });
    assert.equal(unsupported.status, "unsupported_language");
    assert.equal(unsupported.reasonCode, "unsupported_language");

    const scriptMismatch = speech.evaluateSpeechTranscription({
      candidate: highConfidenceCandidate({ transcriptText: "салом тест" }),
      input
    });
    assert.equal(scriptMismatch.status, "handoff_required");
    assert.equal(scriptMismatch.reasonCode, "language_script_mismatch");
  });

  it("rejects raw candidate fields, unsupported provider claims, and unsafe result refs", () => {
    const input = speech.createSpeechTranscriptionInput(controlledInput());

    assert.throws(
      () =>
        speech.evaluateSpeechTranscription({
          candidate: {
            ...highConfidenceCandidate(),
            providerResultRef: "https://example.test/provider-result"
          },
          input
        }),
      /providerResultRef must use controlled refs/
    );
    assert.throws(
      () =>
        speech.evaluateSpeechTranscription({
          candidate: {
            ...highConfidenceCandidate(),
            providerClaim: "real_asr_supported"
          },
          input
        }),
      /speech transcription candidate unsupported field/
    );
    assert.throws(
      () =>
        speech.evaluateSpeechTranscription({
          candidate: {
            ...highConfidenceCandidate(),
            rawTranscript: "raw transcript"
          },
          input
        }),
      /raw speech input is not allowed/
    );
    assert.throws(
      () =>
        speech.evaluateSpeechTranscription({
          candidate: {
            ...highConfidenceCandidate(),
            transcriptText: "storage://speech/raw/transcript"
          },
          input
        }),
      /transcript text must be bounded synthetic text/
    );
  });

  it("builds a safe sample manifest without closing F-03", () => {
    const missing = speech.createSpeechSampleManifest({
      accessScope: "owner_controlled_storage",
      cases: [],
      manifestRef: "manifest://speech/sample-cases",
      ownerConfirmationStatus: "missing",
      redactionMethod: "manual_redaction_v1"
    });
    assert.equal(missing.status, "owner_samples_or_language_coverage_missing");
    assert.equal(missing.f03Closeout, "blocked_foundation_only");

    const futureReady = speech.createSpeechSampleManifest({
      accessScope: "owner_controlled_storage",
      cases: [
        manifestCase("latn", "uz-Latn"),
        manifestCase("cyrl", "uz-Cyrl"),
        manifestCase("ru", "ru")
      ],
      manifestRef: "manifest://speech/sample-cases",
      ownerConfirmationStatus: "confirmed",
      redactionMethod: "manual_redaction_v1"
    });
    assert.equal(futureReady.status, "ready_for_future_eval_not_closed");
    assert.equal(futureReady.f03Closeout, "blocked_foundation_only");
    assert.deepEqual(futureReady.languageCounts, {
      ru: 1,
      "uz-Cyrl": 1,
      "uz-Latn": 1
    });

    assert.throws(
      () =>
        speech.createSpeechSampleManifest({
          accessScope: "owner_controlled_storage",
          cases: [
            {
              ...manifestCase("bad", "uz-Latn"),
              expectedTranscriptRef: "redaction://speech/transcript/bad"
            }
          ],
          manifestRef: "manifest://speech/sample-cases",
          ownerConfirmationStatus: "confirmed",
          redactionMethod: "manual_redaction_v1"
        }),
      /expectedTranscriptRef must use controlled refs/
    );
    assert.throws(
      () =>
        speech.createSpeechSampleManifest({
          accessScope: "owner_controlled_storage",
          cases: [
            {
              ...manifestCase("raw", "uz-Latn"),
              rawTranscript: "raw text"
            }
          ],
          manifestRef: "manifest://speech/sample-cases",
          ownerConfirmationStatus: "confirmed",
          redactionMethod: "manual_redaction_v1"
        }),
      /raw speech input is not allowed/
    );
  });

  it("records M3-07 scope, blockers, and no-provider/no-raw-data wording in docs and evidence", () => {
    const combined = [spec, contracts, m3Index, m3Evidence].join("\n");

    assert.match(spec, /M3-07 Speech Transcription Contract/);
    assert.match(spec, /packages\/capabilities\/speech\/src\/index\.ts/);
    assert.match(spec, /package-lock\.json/);
    assert.match(spec, /rg.*speech\|transcription\|voice\|audio\|speech_postprocess/i);
    assert.match(contracts, /M3 Speech Transcription Contract/);
    assert.match(m3Index, /Current speech transcription contract foundation/);
    assert.match(m3Evidence, /redaction_status: no raw voice\/audio\/transcripts/);
    assert.match(m3Evidence, /F-03.*foundation-only/i);
    assert.match(combined, /no real provider|No real ASR|不接入真实 ASR/i);
    assert.match(combined, /blind review|盲评/i);
    assert.doesNotMatch(
      combined,
      /production ASR ready|F-03 closed|real customer traffic approved/i
    );
  });
});

function controlledInput(overrides = {}) {
  return {
    audioStorageRef: "storage://speech/audio/case-001",
    language: "uz-Latn",
    manifestRef: "manifest://speech/case-001",
    redactionRef: "redaction://speech/case-001",
    ...overrides
  };
}

function highConfidenceCandidate(overrides = {}) {
  return {
    confidence: 0.91,
    evidenceRefs: ["controlled://speech/evidence/language-signal"],
    language: "uz-Latn",
    modelResultRef: "controlled://speech/model-result/case-001",
    postprocessResultRef: "controlled://speech/postprocess/case-001",
    providerResultRef: "controlled://speech/provider-result/case-001",
    requiredSignals: {
      audioRefMatched: true,
      languageDetected: true,
      redactionConfirmed: true,
      syntheticControlled: true
    },
    transcriptText: "salom test ovoz",
    ...overrides
  };
}

function manifestCase(caseId, language) {
  return {
    audioStorageRef: `storage://speech/audio/${caseId}`,
    caseId,
    expectedTranscriptRef: `controlled://speech/transcript/${caseId}`,
    language,
    redactionRef: `redaction://speech/${caseId}`
  };
}

function workspaceText(relativePath, mode = "required") {
  const filePath = path.join(root, relativePath);
  if (!existsSync(filePath)) {
    if (mode === "optional") return "";
    throw new Error(`${relativePath} is missing`);
  }
  return readFileSync(filePath, "utf8");
}

async function importTsSource(relativePath) {
  const source = workspaceText(relativePath);
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022
    },
    fileName: relativePath
  }).outputText;
  const encoded = Buffer.from(transpiled).toString("base64");
  return import(`data:text/javascript;base64,${encoded}`);
}
