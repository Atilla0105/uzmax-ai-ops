export const packageName = "@uzmax/capability-speech";

// prettier-ignore
export const speechLanguages = { russian: "ru", uzbekCyrillic: "uz-Cyrl", uzbekLatin: "uz-Latn" } as const;
// prettier-ignore
export const speechTranscriptionStatuses = { handoffRequired: "handoff_required", transcriptReady: "transcript_ready", uncertain: "uncertain", unsupportedLanguage: "unsupported_language" } as const;

type ValueOf<T> = T[keyof T];
type SpeechLanguage = ValueOf<typeof speechLanguages>;
type SpeechTranscriptionStatus = ValueOf<typeof speechTranscriptionStatuses>;
type AnyRecord = Record<string, unknown>;

type SpeechTranscriptionInput = {
  audioStorageRef: string;
  language: SpeechLanguage;
  manifestRef: string;
  redactionRef: string;
};

type SpeechTranscriptionCandidate = {
  ambiguous?: boolean;
  confidence: number;
  evidenceRefs?: string[];
  language: string;
  modelResultRef?: string;
  postprocessResultRef?: string;
  providerResultRef?: string;
  requiredSignals?: Record<string, unknown>;
  transcriptText: string;
  uncertain?: boolean;
} & AnyRecord;

type TranscriptReadyResult = {
  confidence: number;
  language: SpeechLanguage;
  reasonCode: "high_confidence_controlled";
  refs: Record<string, unknown>;
  script: "Cyrl" | "Latn";
  status: typeof speechTranscriptionStatuses.transcriptReady;
  transcript: {
    text: string;
  };
};

type FailClosedResult = {
  handoff: { required: boolean };
  reasonCode: string;
  refs: {
    audioStorageRef: string;
    manifestRef: string;
    redactionRef: string;
  };
  status: Exclude<SpeechTranscriptionStatus, "transcript_ready">;
};

export function createSpeechTranscriptionInput(
  input: AnyRecord
): SpeechTranscriptionInput {
  assertNoRawSpeechCarrier(input);
  assertAllowedKeys(input, transcriptionInputKeys, "speech input");
  return {
    audioStorageRef: controlledRef(input.audioStorageRef, "audioStorageRef", [
      "storage"
    ]),
    language: enumValue(input.language, speechLanguages, "speech language"),
    manifestRef: controlledRef(input.manifestRef, "manifestRef", ["manifest"]),
    redactionRef: controlledRef(input.redactionRef, "redactionRef", ["redaction"])
  };
}

export function evaluateSpeechTranscription(input: {
  candidate: SpeechTranscriptionCandidate;
  input: SpeechTranscriptionInput;
}): FailClosedResult | TranscriptReadyResult {
  const speechInput = createSpeechTranscriptionInput(input.input);
  const candidate = validateCandidate(input.candidate);

  if (!isSpeechLanguage(candidate.language)) {
    return failClosed("unsupported_language", "unsupported_language", speechInput);
  }
  if (candidate.language !== speechInput.language) {
    return failClosed("handoff_required", "language_mismatch", speechInput);
  }
  if (candidate.uncertain) {
    return failClosed("uncertain", "candidate_uncertain", speechInput);
  }
  if (candidate.ambiguous) {
    return failClosed("uncertain", "transcript_ambiguous", speechInput);
  }
  if (candidate.confidence < 0.82) {
    return failClosed("handoff_required", "low_confidence", speechInput);
  }
  if (!hasRequiredSignals(candidate.requiredSignals)) {
    return failClosed("handoff_required", "required_signals_missing", speechInput);
  }

  const text = boundedSyntheticTranscript(candidate.transcriptText);
  const script = expectedScript(speechInput.language);
  if (!textMatchesScript(text, script)) {
    return failClosed("handoff_required", "language_script_mismatch", speechInput);
  }

  return {
    confidence: candidate.confidence,
    language: speechInput.language,
    reasonCode: "high_confidence_controlled",
    refs: transcriptionRefs(speechInput, candidate),
    script,
    status: speechTranscriptionStatuses.transcriptReady,
    transcript: { text }
  };
}

export function createSpeechSampleManifest(input: {
  accessScope: string;
  cases: AnyRecord[];
  manifestRef: string;
  ownerConfirmationStatus: string;
  redactionMethod: string;
}): AnyRecord {
  assertNoRawSpeechCarrier(input);
  assertAllowedKeys(input, sampleManifestKeys, "speech sample manifest");
  const cases = input.cases.map(sampleManifestCase);
  const ownerConfirmationStatus = enumValue(
    input.ownerConfirmationStatus,
    ownerConfirmationStatuses,
    "owner confirmation status"
  );
  const languageCounts = countBy(cases.map((manifestCase) => manifestCase.language));
  const hasAllLanguages = Object.values(speechLanguages).every(
    (language) => (languageCounts[language] ?? 0) > 0
  );
  const confirmed = ownerConfirmationStatus === ownerConfirmationStatuses.confirmed;

  return {
    accessScope: token(input.accessScope, "accessScope"),
    actualCount: cases.length,
    cases,
    f03Closeout: "blocked_foundation_only",
    languageCounts,
    manifestRef: controlledRef(input.manifestRef, "manifestRef", ["manifest"]),
    ownerConfirmationStatus,
    redactionMethod: token(input.redactionMethod, "redactionMethod"),
    status:
      confirmed && hasAllLanguages
        ? "ready_for_future_eval_not_closed"
        : "owner_samples_or_language_coverage_missing"
  };
}

const ownerConfirmationStatuses = {
  confirmed: "confirmed",
  missing: "missing",
  pending: "pending"
} as const;

const controlledRefPattern =
  /^(controlled|manifest|redaction|storage):\/\/[a-z0-9][a-z0-9:/._-]{0,160}$/i;
const unsafeRefPatterns = [
  /^data:/i,
  /^https?:\/\//i,
  /^(?:\/|\.\/|\.\.\/|[a-z]:\\)/i,
  /^blob:/i,
  /^[a-z0-9+/]{24,}={0,2}$/i
];
const rawFieldPattern =
  /^(raw.*|.*audio.*bytes.*|.*base64.*|.*blob.*|.*bytes.*|dataUrl|filePath|telegramPayload|telegramUpdate|rawTranscript|customerPlaintext|customerText|messageText|messageBody|caption|body|notes|order.*|phone.*|address.*|payment.*|secret.*|prompt|completion|jsonl|csv|export)$/i;
const transcriptInputKeys = keySet("audioStorageRef language manifestRef redactionRef");
const transcriptionInputKeys = transcriptInputKeys;
const candidateKeys = keySet(
  "ambiguous confidence evidenceRefs language modelResultRef postprocessResultRef " +
    "providerResultRef requiredSignals transcriptText uncertain"
);
const requiredSignalKeys = keySet(
  "audioRefMatched languageDetected redactionConfirmed syntheticControlled"
);
const sampleManifestKeys = keySet(
  "accessScope cases manifestRef ownerConfirmationStatus redactionMethod"
);
const sampleManifestCaseKeys = keySet(
  "audioStorageRef caseId expectedTranscriptRef language redactionRef"
);

function validateCandidate(
  candidate: SpeechTranscriptionCandidate
): SpeechTranscriptionCandidate {
  assertNoRawSpeechCarrier(candidate);
  assertAllowedKeys(candidate, candidateKeys, "speech transcription candidate");
  confidence(candidate.confidence);
  boundedSyntheticTranscript(candidate.transcriptText);
  controlledRefList(candidate.evidenceRefs ?? [], "evidenceRefs");
  optionalControlledRef(candidate.modelResultRef, "modelResultRef");
  optionalControlledRef(candidate.providerResultRef, "providerResultRef");
  optionalControlledRef(candidate.postprocessResultRef, "postprocessResultRef");
  if (candidate.requiredSignals) {
    assertAllowedKeys(
      candidate.requiredSignals,
      requiredSignalKeys,
      "required signals"
    );
  }
  return candidate;
}

function sampleManifestCase(manifestCase: AnyRecord) {
  assertNoRawSpeechCarrier(manifestCase);
  assertAllowedKeys(manifestCase, sampleManifestCaseKeys, "speech manifest case");
  return {
    audioStorageRef: controlledRef(manifestCase.audioStorageRef, "audioStorageRef", [
      "storage"
    ]),
    caseId: token(manifestCase.caseId, "caseId"),
    expectedTranscriptRef: controlledRef(
      manifestCase.expectedTranscriptRef,
      "expectedTranscriptRef",
      ["controlled"]
    ),
    language: enumValue(manifestCase.language, speechLanguages, "case language"),
    redactionRef: controlledRef(manifestCase.redactionRef, "redactionRef", [
      "redaction"
    ])
  };
}

function failClosed(
  status: Exclude<SpeechTranscriptionStatus, "transcript_ready">,
  reasonCode: string,
  input: SpeechTranscriptionInput
): FailClosedResult {
  return {
    handoff: { required: status === speechTranscriptionStatuses.handoffRequired },
    reasonCode,
    refs: {
      audioStorageRef: input.audioStorageRef,
      manifestRef: input.manifestRef,
      redactionRef: input.redactionRef
    },
    status
  };
}

function transcriptionRefs(
  input: SpeechTranscriptionInput,
  candidate: SpeechTranscriptionCandidate
): Record<string, unknown> {
  return removeUndefined({
    audioStorageRef: input.audioStorageRef,
    evidenceRefs: uniqueRefs([
      input.audioStorageRef,
      input.manifestRef,
      input.redactionRef,
      ...controlledRefList(candidate.evidenceRefs ?? [], "evidenceRefs")
    ]),
    manifestRef: input.manifestRef,
    modelResultRef: optionalControlledRef(candidate.modelResultRef, "modelResultRef"),
    postprocessResultRef: optionalControlledRef(
      candidate.postprocessResultRef,
      "postprocessResultRef"
    ),
    providerResultRef: optionalControlledRef(
      candidate.providerResultRef,
      "providerResultRef"
    ),
    redactionRef: input.redactionRef
  });
}

function hasRequiredSignals(signals: Record<string, unknown> | undefined): boolean {
  return Boolean(
    signals?.audioRefMatched &&
    signals.languageDetected &&
    signals.redactionConfirmed &&
    signals.syntheticControlled
  );
}

function assertNoRawSpeechCarrier(value: unknown): void {
  if (!value || typeof value !== "object") return;
  for (const [key, entry] of Object.entries(value as AnyRecord)) {
    if (rawFieldPattern.test(key)) throw new Error("raw speech input is not allowed");
    if (Array.isArray(entry)) entry.forEach(assertNoRawSpeechCarrier);
    else if (entry && typeof entry === "object") assertNoRawSpeechCarrier(entry);
  }
}

function assertAllowedKeys(
  value: AnyRecord,
  allowedKeys: ReadonlySet<string>,
  name: string
): void {
  for (const key of Object.keys(value)) {
    if (!allowedKeys.has(key)) throw new Error(`${name} unsupported field: ${key}`);
  }
}

function controlledRef(
  value: unknown,
  name: string,
  allowedSchemes = ["controlled", "manifest", "redaction", "storage"]
): string {
  const trimmed = typeof value === "string" ? value.trim() : "";
  const scheme = trimmed.split("://")[0] ?? "";
  if (
    !trimmed ||
    unsafeRefPatterns.some((pattern) => pattern.test(trimmed)) ||
    !controlledRefPattern.test(trimmed) ||
    !allowedSchemes.includes(scheme)
  ) {
    throw new Error(`${name} must use ${allowedSchemes.join("/")} refs`);
  }
  return trimmed;
}

function optionalControlledRef(value: unknown, name: string): string | undefined {
  return value ? controlledRef(value, name, ["controlled"]) : undefined;
}

function controlledRefList(values: unknown[], name: string): string[] {
  return values.map((value, index) =>
    controlledRef(value, `${name}[${index}]`, ["controlled"])
  );
}

function enumValue<T extends string>(
  value: unknown,
  source: Record<string, T>,
  name: string
): T {
  if (typeof value !== "string" || !Object.values(source).includes(value as T)) {
    throw new Error(`${name} is unsupported`);
  }
  return value as T;
}

function isSpeechLanguage(value: string): value is SpeechLanguage {
  return Object.values(speechLanguages).includes(value as SpeechLanguage);
}

function confidence(value: unknown): number {
  if (typeof value !== "number" || value < 0 || value > 1) {
    throw new Error("confidence must be a number from 0 to 1");
  }
  return value;
}

function boundedSyntheticTranscript(value: unknown): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text || text.length > 160) throw new Error("transcript text is required");
  if (
    /https?:|data:|storage:\/\/|manifest:\/\/|redaction:\/\/|controlled:\/\//i.test(
      text
    )
  ) {
    throw new Error("transcript text must be bounded synthetic text");
  }
  return text;
}

function expectedScript(language: SpeechLanguage): "Cyrl" | "Latn" {
  return language === speechLanguages.uzbekLatin ? "Latn" : "Cyrl";
}

function textMatchesScript(text: string, script: "Cyrl" | "Latn"): boolean {
  const hasCyrillic = /[\u0400-\u04ff]/u.test(text);
  const hasLatin = /[a-z]/i.test(text);
  return script === "Latn" ? hasLatin && !hasCyrillic : hasCyrillic;
}

function token(value: unknown, name: string): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (!/^[a-z0-9][a-z0-9_-]{1,64}$/i.test(text)) {
    throw new Error(`${name} must be a token`);
  }
  return text;
}

function keySet(keys: string): ReadonlySet<string> {
  return new Set(keys.split(" "));
}

function uniqueRefs(refs: string[]): string[] {
  return [...new Set(refs)];
}

function countBy(values: string[]): Record<string, number> {
  return values.reduce<Record<string, number>>((counts, value) => {
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}

function removeUndefined(input: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined)
  );
}
