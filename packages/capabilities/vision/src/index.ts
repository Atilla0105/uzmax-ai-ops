export const packageName = "@uzmax/capability-vision";

// prettier-ignore
export const visionScreenshotKinds = { merchantChat: "merchant_chat", orderPage: "order_page", paymentPage: "payment_page" } as const;
// prettier-ignore
export const visionDiagnosisStatuses = { diagnosisCard: "diagnosis_card", handoffRequired: "handoff_required", uncertain: "uncertain" } as const;

type ValueOf<T> = T[keyof T];
type ScreenshotKind = ValueOf<typeof visionScreenshotKinds>;
type DiagnosisStatus = ValueOf<typeof visionDiagnosisStatuses>;
type AnyRecord = Record<string, unknown>;

type ScreenshotDiagnosisInput = {
  manifestRef: string;
  redactionRef: string;
  screenshotKind: ScreenshotKind;
  storageRef: string;
};

type DiagnosisCandidateItem = {
  code: string;
  evidenceRef?: string;
  title: string;
};

type DiagnosisCandidate = {
  actions?: DiagnosisCandidateItem[];
  ambiguous?: boolean;
  confidence: number;
  diagnosisCode: string;
  diagnosisTitle: string;
  evidenceRefs?: string[];
  modelResultRef?: string;
  observations?: DiagnosisCandidateItem[];
  pageKind: string;
  providerResultRef?: string;
  requiredSignals?: Record<string, unknown>;
  uncertain?: boolean;
} & AnyRecord;

export function createScreenshotDiagnosisInput(
  input: AnyRecord
): ScreenshotDiagnosisInput {
  assertNoRawScreenshotInput(input);
  return {
    manifestRef: controlledRef(input.manifestRef, "manifestRef"),
    redactionRef: controlledRef(input.redactionRef, "redactionRef"),
    screenshotKind: enumValue(
      input.screenshotKind,
      visionScreenshotKinds,
      "screenshot kind"
    ),
    storageRef: controlledRef(input.storageRef, "storageRef")
  };
}

export function evaluateScreenshotDiagnosis(input: {
  candidate: DiagnosisCandidate;
  input: ScreenshotDiagnosisInput;
}): AnyRecord {
  const screenshotInput = createScreenshotDiagnosisInput(input.input);
  const candidate = validateCandidate(input.candidate);

  if (candidate.pageKind !== screenshotInput.screenshotKind) {
    return failClosed("handoff_required", "screenshot_kind_mismatch", screenshotInput);
  }
  if (candidate.uncertain) {
    return failClosed("uncertain", "candidate_uncertain", screenshotInput);
  }
  if (candidate.ambiguous) {
    return failClosed("uncertain", "diagnosis_ambiguous", screenshotInput);
  }
  if (candidate.confidence < 0.75) {
    return failClosed("handoff_required", "low_confidence", screenshotInput);
  }
  if (!hasRequiredSignals(candidate.requiredSignals)) {
    return failClosed("handoff_required", "required_signals_missing", screenshotInput);
  }

  const observations = (candidate.observations ?? []).slice(0, 4).map(item);
  const actions = (candidate.actions ?? []).slice(0, 3).map(action);

  return {
    card: {
      actions,
      confidence: candidate.confidence,
      diagnosis: {
        code: token(candidate.diagnosisCode, "diagnosis code"),
        title: boundedText(candidate.diagnosisTitle, "diagnosis title")
      },
      observations,
      screenshotKind: screenshotInput.screenshotKind
    },
    reasonCode: "high_confidence_controlled",
    refs: diagnosisRefs(screenshotInput, candidate, observations),
    status: visionDiagnosisStatuses.diagnosisCard
  };
}

export function createScreenshotSampleManifest(input: {
  accessScope: string;
  cases: AnyRecord[];
  manifestRef: string;
  ownerConfirmationStatus: string;
  redactionMethod: string;
}): AnyRecord {
  assertNoRawScreenshotInput(input);
  const cases = input.cases.map((manifestCase) => ({
    caseId: token(manifestCase.caseId, "caseId"),
    category: enumValue(manifestCase.category, visionScreenshotKinds, "case category"),
    expectedOutcomeRef: controlledRef(
      manifestCase.expectedOutcomeRef,
      "expectedOutcomeRef"
    ),
    redactionRef: controlledRef(manifestCase.redactionRef, "case redactionRef"),
    storageRef: controlledRef(manifestCase.storageRef, "case storageRef")
  }));
  const ownerConfirmationStatus = enumValue(
    input.ownerConfirmationStatus,
    ownerConfirmationStatuses,
    "owner confirmation status"
  );
  const categoryCounts = countBy(cases.map((manifestCase) => manifestCase.category));
  const confirmed = ownerConfirmationStatus === "confirmed";
  const actualCount = cases.length;
  const status = sampleManifestStatus(confirmed, actualCount);

  return {
    accessScope: token(input.accessScope, "accessScope"),
    actualCount,
    cases,
    categoryCounts,
    f02Closeout:
      confirmed && actualCount >= 20 ? "not_closed_foundation_only" : "blocked",
    manifestRef: controlledRef(input.manifestRef, "manifestRef"),
    ownerConfirmationStatus,
    redactionMethod: token(input.redactionMethod, "redactionMethod"),
    requiredCount: 20,
    status
  };
}

const ownerConfirmationStatuses = {
  confirmed: "confirmed",
  missing: "missing",
  pending: "pending"
} as const;

const controlledRefPattern =
  /^(controlled|manifest|redaction|storage):\/\/[a-z0-9][a-z0-9:/._-]{0,160}$/i;
const dataUrlPattern = /^data:/i;
const publicUrlPattern = /^https?:\/\//i;
const filePathPattern = /^(?:\/|\.\/|\.\.\/|[a-z]:\\)/i;
const blobPattern = /^blob:/i;
const base64LikePattern = /^[a-z0-9+/]{24,}={0,2}$/i;
const rawFieldPattern =
  /^(raw.*|.*base64.*|.*blob.*|.*bytes.*|.*ocr.*|customerPlaintext|customerText|publicUrl|filePath)$/i;

function validateCandidate(candidate: DiagnosisCandidate): DiagnosisCandidate {
  assertNoRawScreenshotInput(candidate);
  enumValue(candidate.pageKind, visionScreenshotKinds, "screenshot kind");
  confidence(candidate.confidence);
  token(candidate.diagnosisCode, "diagnosis code");
  boundedText(candidate.diagnosisTitle, "diagnosis title");
  controlledRefList(candidate.evidenceRefs ?? [], "evidenceRefs");
  if (candidate.modelResultRef)
    controlledRef(candidate.modelResultRef, "modelResultRef");
  if (candidate.providerResultRef) {
    controlledRef(candidate.providerResultRef, "providerResultRef");
  }
  (candidate.observations ?? []).forEach(item);
  (candidate.actions ?? []).forEach(action);
  return candidate;
}

function failClosed(
  status: Extract<DiagnosisStatus, "handoff_required" | "uncertain">,
  reasonCode: string,
  input: ScreenshotDiagnosisInput
): AnyRecord {
  return {
    handoff: { required: status === visionDiagnosisStatuses.handoffRequired },
    reasonCode,
    refs: {
      manifestRef: input.manifestRef,
      redactionRef: input.redactionRef,
      storageRef: input.storageRef
    },
    status
  };
}

function diagnosisRefs(
  input: ScreenshotDiagnosisInput,
  candidate: DiagnosisCandidate,
  observations: DiagnosisCandidateItem[]
): AnyRecord {
  return {
    evidenceRefs: uniqueRefs([
      input.storageRef,
      input.manifestRef,
      input.redactionRef,
      ...controlledRefList(candidate.evidenceRefs ?? [], "evidenceRefs"),
      ...observations.flatMap((observation) =>
        observation.evidenceRef ? [observation.evidenceRef] : []
      )
    ]),
    manifestRef: input.manifestRef,
    ...optionalControlledRef(candidate.modelResultRef, "modelResultRef"),
    ...optionalControlledRef(candidate.providerResultRef, "providerResultRef"),
    redactionRef: input.redactionRef,
    storageRef: input.storageRef
  };
}

function optionalControlledRef(
  value: string | undefined,
  name: string
): Record<string, string> {
  return value ? { [name]: controlledRef(value, name) } : {};
}

function hasRequiredSignals(signals: Record<string, unknown> | undefined): boolean {
  return Boolean(
    signals?.pageKindMatched && signals.keyUiPresent && signals.redactionConfirmed
  );
}

function item(input: DiagnosisCandidateItem): DiagnosisCandidateItem {
  return {
    code: token(input.code, "observation code"),
    ...(input.evidenceRef
      ? { evidenceRef: controlledRef(input.evidenceRef, "evidenceRef") }
      : {}),
    title: boundedText(input.title, "observation title")
  };
}

function action(input: DiagnosisCandidateItem): DiagnosisCandidateItem {
  return {
    code: token(input.code, "action code"),
    title: boundedText(input.title, "action title")
  };
}

function assertNoRawScreenshotInput(value: unknown): void {
  if (!value || typeof value !== "object") return;
  for (const [key, entry] of Object.entries(value as AnyRecord)) {
    if (rawFieldPattern.test(key))
      throw new Error("raw screenshot input is not allowed");
    if (Array.isArray(entry)) entry.forEach(assertNoRawScreenshotInput);
    else if (entry && typeof entry === "object") assertNoRawScreenshotInput(entry);
  }
}

function controlledRef(value: unknown, name: string): string {
  if (
    typeof value !== "string" ||
    dataUrlPattern.test(value.trim()) ||
    publicUrlPattern.test(value.trim()) ||
    filePathPattern.test(value.trim()) ||
    blobPattern.test(value.trim()) ||
    base64LikePattern.test(value.trim()) ||
    !controlledRefPattern.test(value.trim())
  ) {
    throw new Error(`${name} must be a controlled ref`);
  }
  return value.trim();
}

function controlledRefList(values: unknown[], name: string): string[] {
  return values.map((value, index) => controlledRef(value, `${name}[${index}]`));
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

function confidence(value: unknown): number {
  if (typeof value !== "number" || value < 0 || value > 1) {
    throw new Error("confidence must be a number from 0 to 1");
  }
  return value;
}

function token(value: unknown, name: string): string {
  if (typeof value !== "string" || !/^[a-z0-9][a-z0-9_.:-]{1,80}$/i.test(value)) {
    throw new Error(`${name} is invalid`);
  }
  return value;
}

function boundedText(value: unknown, name: string): string {
  if (typeof value !== "string" || !value.trim() || value.length > 120) {
    throw new Error(`${name} is invalid`);
  }
  return value.trim();
}

function uniqueRefs(refs: string[]): string[] {
  return [...new Set(refs)];
}

function countBy(values: ScreenshotKind[]): Record<ScreenshotKind, number> {
  return Object.fromEntries(
    Object.values(visionScreenshotKinds).map((kind) => [
      kind,
      values.filter((value) => value === kind).length
    ])
  ) as Record<ScreenshotKind, number>;
}

function sampleManifestStatus(confirmed: boolean, count: number): string {
  if (!confirmed && count === 0) return "owner_samples_missing";
  if (!confirmed || count < 20) return "insufficient_owner_samples";
  return "sample_manifest_ready_for_future_eval";
}
