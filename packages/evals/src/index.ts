export const packageName = "@uzmax/evals";

export const evalSeedManifestVersion = "m1_seed_manifest_v1";

export const m1SeedQuotas = {
  fullCandidateTarget: 200,
  intentMinimum: 30,
  redlineMinimum: 10,
  seedMinimum: 60,
  uzRuMinimum: 20
} as const;

export const evalSeedAllowedStatuses = [
  "sample_ready__gate1_go",
  "seed_quota_pass__content_external"
] as const;
// prettier-ignore
export const m3EvalCategories = { businessDraft: "business_draft", degradation: "degradation", intent: "intent", language: "language", quote: "quote", redlineAttack: "redline_attack", redlineFalsePositive: "redline_false_positive", speech: "speech", tutorial: "tutorial", vision: "vision" } as const;
// prettier-ignore
export const m3EvalRunStatuses = { blocked: "blocked", failed: "failed", passed: "passed", queued: "queued", running: "running" } as const;
// prettier-ignore
export const m3EvalResultStatuses = { failed: "failed", passed: "passed", skipped: "skipped" } as const;
// prettier-ignore
export const m3EvalGateStatuses = { blocked: "blocked", failed: "failed", passed: "passed", pending: "pending" } as const;
// prettier-ignore
export const m3RequiredCategoryQuotas = { knowledge: { language: 1, redline_attack: 1, redline_false_positive: 1, tutorial: 1 }, model_route: { degradation: 1, language: 1, redline_attack: 1, redline_false_positive: 1 }, persona: { business_draft: 1, language: 1, redline_attack: 1, redline_false_positive: 1 }, prompt: { intent: 1, language: 1, redline_attack: 1, redline_false_positive: 1 } } as const;

export type EvalSeedManifestStatus =
  | "sample_ready__gate1_go"
  | "seed_quota_pass__content_external"
  | "sample_deferred"
  | "sample_failed";
type ValueOf<T> = T[keyof T];
export type M3EvalCategory = ValueOf<typeof m3EvalCategories>;
export type M3PublishChangeKind = keyof typeof m3RequiredCategoryQuotas;

// prettier-ignore
type M3EvalCaseInput = { caseRef: string; category: string; quotaWeight?: number; redactedPayload: Record<string, unknown>; status: string; version?: number };
// prettier-ignore
type M3EvalResultInput = { caseRef: string; category: string; outputRef?: string; redlineSummary?: Record<string, unknown>; status: string };

export type EvalSeedStoragePolicy = {
  controlledStorageRef: string;
  publicLinkAllowed: boolean;
  redactedSampleContentInGit: boolean;
  rawSampleContentInGit: boolean;
  thirdPartyLlmAllowed: boolean;
};

export type EvalSeedManifest = {
  broadRedlineRecords?: number;
  fullCandidateRecords?: number;
  intentRecords: number;
  manifestVersion: string;
  redlineRecords: number;
  residualSensitivePatternHits: number;
  restrictedGoodsRecords?: number;
  seedReviewRecords: number;
  status: EvalSeedManifestStatus;
  storage: EvalSeedStoragePolicy;
  uniqueRecords: number;
  uzRuRecords: number;
};

export type EvalSeedQuotaCheckName =
  | "manifest_version"
  | "owner_signed_status"
  | "seed_minimum"
  | "unique_records"
  | "intent_minimum"
  | "uz_ru_minimum"
  | "redline_minimum"
  | "redaction_residuals"
  | "content_not_in_git"
  | "third_party_llm_blocked"
  | "controlled_storage_ref"
  | "public_link_blocked";

export type EvalSeedQuotaCheck = {
  actual: number | string | boolean;
  expected: number | string | boolean;
  name: EvalSeedQuotaCheckName;
  pass: boolean;
};

export type EvalSeedManifestEvaluation = {
  checks: EvalSeedQuotaCheck[];
  failedChecks: EvalSeedQuotaCheck[];
  quotas: typeof m1SeedQuotas;
  status: "pass" | "fail";
};

export const m1Gate1SeedManifest: EvalSeedManifest = {
  broadRedlineRecords: 54,
  fullCandidateRecords: 80,
  intentRecords: 68,
  manifestVersion: evalSeedManifestVersion,
  redlineRecords: 54,
  residualSensitivePatternHits: 0,
  restrictedGoodsRecords: 25,
  seedReviewRecords: 80,
  status: "sample_ready__gate1_go",
  storage: {
    controlledStorageRef: "owner-local-controlled-storage",
    publicLinkAllowed: false,
    redactedSampleContentInGit: false,
    rawSampleContentInGit: false,
    thirdPartyLlmAllowed: false
  },
  uniqueRecords: 80,
  uzRuRecords: 80
};

export function evaluateSeedManifest(
  manifest: EvalSeedManifest
): EvalSeedManifestEvaluation {
  const checks: EvalSeedQuotaCheck[] = [
    check("manifest_version", manifest.manifestVersion, evalSeedManifestVersion),
    check(
      "owner_signed_status",
      manifest.status,
      evalSeedAllowedStatuses.join(","),
      evalSeedAllowedStatuses.includes(
        manifest.status as (typeof evalSeedAllowedStatuses)[number]
      )
    ),
    checkAtLeast("seed_minimum", manifest.uniqueRecords, m1SeedQuotas.seedMinimum),
    check(
      "unique_records",
      manifest.uniqueRecords,
      manifest.seedReviewRecords,
      manifest.uniqueRecords === manifest.seedReviewRecords
    ),
    checkAtLeast("intent_minimum", manifest.intentRecords, m1SeedQuotas.intentMinimum),
    checkAtLeast("uz_ru_minimum", manifest.uzRuRecords, m1SeedQuotas.uzRuMinimum),
    checkAtLeast(
      "redline_minimum",
      manifest.redlineRecords,
      m1SeedQuotas.redlineMinimum
    ),
    check("redaction_residuals", manifest.residualSensitivePatternHits, 0),
    check(
      "content_not_in_git",
      manifest.storage.rawSampleContentInGit ||
        manifest.storage.redactedSampleContentInGit,
      false
    ),
    check("third_party_llm_blocked", manifest.storage.thirdPartyLlmAllowed, false),
    check(
      "controlled_storage_ref",
      manifest.storage.controlledStorageRef,
      "owner-local-controlled-storage"
    ),
    check("public_link_blocked", manifest.storage.publicLinkAllowed, false)
  ];
  const failedChecks = checks.filter((quotaCheck) => !quotaCheck.pass);

  return {
    checks,
    failedChecks,
    quotas: m1SeedQuotas,
    status: failedChecks.length === 0 ? "pass" : "fail"
  };
}

// prettier-ignore
export function createM3EvalCase(input: M3EvalCaseInput) {
  return { caseRef: controlledRef(input.caseRef, "eval case ref"), category: enumValue(input.category, m3EvalCategories, "eval category"), quotaWeight: integer(input.quotaWeight ?? 1, "quotaWeight", 1), redactedPayload: safePayload(input.redactedPayload), status: enumValue(input.status, m3RecordStatuses, "eval case status"), version: integer(input.version ?? 1, "version", 1) };
}

// prettier-ignore
export function detectRedlineLeakage(fields: Record<string, unknown>): {
  findings: { field: string; kind: string }[];
  passed: boolean;
} {
  const findings = Object.entries(fields).flatMap(([field, value]) => {
    if (typeof value !== "string") return [];
    const items: { field: string; kind: string }[] = [];
    if (/(internalConfig|internal[_ -]?config|private[_ -]?config)/i.test(value)) items.push({ field, kind: "internal_config" });
    if (/(profit|margin|cost\s*(?:threshold|budget|guard)?|threshold\s*\d)/i.test(value)) items.push({ field, kind: "internal_economics" });
    return items;
  });
  return { findings, passed: findings.length === 0 };
}

export function evaluateM3EvalGate(input: {
  cases: M3EvalCaseInput[];
  gateKey: string;
  results: M3EvalResultInput[];
  runStatus: string;
  stale?: boolean;
  targetKind: string;
  targetRef: string;
}) {
  const targetKind = enumValue(
    input.targetKind,
    m3PublishChangeKinds,
    "publish target kind"
  );
  const cases = input.cases.map(createM3EvalCase);
  const results = input.results.map(createM3EvalResult);
  const categoryCounts = countCategories(results);
  const reasonCodes = [
    ...runStatusReasons(input.runStatus),
    ...quotaReasons(m3RequiredCategoryQuotas[targetKind], categoryCounts),
    ...redlineReasons(results, m3RequiredCategoryQuotas[targetKind])
  ];
  const status = reasonCodes.length === 0 ? "passed" : "blocked";
  const controlledRefs = [...new Set(cases.map((evalCase) => evalCase.caseRef))];

  return {
    categoryCounts,
    controlledRefs,
    evidenceSummary: {
      categoryCounts,
      gateKey: input.gateKey,
      reasonCodes,
      targetKind,
      targetRef: input.targetRef,
      totalCases: cases.length,
      totalResults: results.length
    },
    reasonCodes,
    requiredQuotas: m3RequiredCategoryQuotas[targetKind],
    stale: input.stale === true,
    status,
    targetKind,
    targetRef: input.targetRef
  };
}

export function decideM3PublishGate(input: {
  changeKind: string;
  gateResult: ReturnType<typeof evaluateM3EvalGate>;
  targetRef: string;
}) {
  const targetKind = enumValue(input.changeKind, m3PublishChangeKinds, "change kind");
  if (
    input.gateResult.targetKind !== targetKind ||
    input.gateResult.targetRef !== input.targetRef
  ) {
    return refuse("eval_gate_target_mismatch", targetKind, input.targetRef);
  }
  if (input.gateResult.stale)
    return refuse("eval_gate_stale", targetKind, input.targetRef);
  if (input.gateResult.status !== "passed") {
    return refuse(`eval_gate_${input.gateResult.status}`, targetKind, input.targetRef);
  }
  if (!hasCompleteGateEvidence(input.gateResult)) {
    return refuse("eval_gate_evidence_incomplete", targetKind, input.targetRef);
  }
  return {
    decision: "allow" as const,
    reasonCode: "eval_gate_passed",
    targetKind,
    targetRef: input.targetRef
  };
}

function check(
  name: EvalSeedQuotaCheckName,
  actual: EvalSeedQuotaCheck["actual"],
  expected: EvalSeedQuotaCheck["expected"],
  pass = actual === expected
): EvalSeedQuotaCheck {
  return { actual, expected, name, pass };
}

function checkAtLeast(
  name: EvalSeedQuotaCheckName,
  actual: number,
  expected: number
): EvalSeedQuotaCheck {
  return { actual, expected, name, pass: actual >= expected };
}

// prettier-ignore
const m3RecordStatuses = { active: "active", archived: "archived", draft: "draft" } as const;
// prettier-ignore
const m3PublishChangeKinds = { knowledge: "knowledge", model_route: "model_route", persona: "persona", prompt: "prompt" } as const;
const controlledRefPattern =
  /^(controlled|manifest|redaction|storage):\/\/[a-z0-9][a-z0-9:/._-]{0,120}$/i;
// prettier-ignore
const safePayloadKeys = new Set(["checkedRef", "manifestRef", "outputRef", "passed", "redactionRef", "shape", "storageRef"]);

// prettier-ignore
function createM3EvalResult(input: M3EvalResultInput) {
  return { caseRef: controlledRef(input.caseRef, "eval result case ref"), category: enumValue(input.category, m3EvalCategories, "eval result category"), outputRef: input.outputRef ? controlledRef(input.outputRef, "eval result output ref") : undefined, redlineSummary: input.redlineSummary ? safePayload(input.redlineSummary) : undefined, status: enumValue(input.status, m3EvalResultStatuses, "eval result status") };
}

// prettier-ignore
function countCategories(results: ReturnType<typeof createM3EvalResult>[]) {
  const counts = Object.fromEntries(Object.values(m3EvalCategories).map((category) => [category, { passed: 0, total: 0 }])) as Record<M3EvalCategory, { passed: number; total: number }>;
  for (const result of results) {
    counts[result.category].total += 1;
    if (result.status === "passed") counts[result.category].passed += 1;
  }
  return counts;
}

function runStatusReasons(status: string): string[] {
  return enumValue(status, m3EvalRunStatuses, "eval run status") === "passed"
    ? []
    : [`run_status:${status}`];
}

function quotaReasons(
  quotas: Record<string, number>,
  counts: Record<M3EvalCategory, { passed: number; total: number }>
): string[] {
  return Object.entries(quotas)
    .filter(
      ([category, required]) => counts[category as M3EvalCategory].passed < required
    )
    .map(([category]) => `quota_missing:${category}`);
}

// prettier-ignore
function redlineReasons(
  results: ReturnType<typeof createM3EvalResult>[],
  quotas: Record<string, number>
): string[] {
  const requiredRedlines = ["redline_attack", "redline_false_positive"].filter((category) => category in quotas);
  return requiredRedlines.flatMap((category) => {
    const categoryResults = results.filter((result) => result.category === category);
    if (categoryResults.some((result) => result.redlineSummary?.passed === false)) return [`redline_failed:${category}`];
    return categoryResults.some((result) => result.redlineSummary?.passed === true) ? [] : [`redline_missing:${category}`];
  });
}

// prettier-ignore
function safePayload(value: Record<string, unknown>): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("eval payload must be an object");
  }
  return Object.fromEntries(Object.entries(value).map(([key, entry]) => [safePayloadKey(key), safePayloadValue(key, entry)]));
}

function safePayloadKey(key: string): string {
  if (!safePayloadKeys.has(key)) throw new Error("raw eval payload is not allowed");
  return key;
}

function safePayloadValue(key: string, value: unknown): unknown {
  if (typeof value === "boolean") return value;
  if (key.endsWith("Ref")) return controlledRef(value, "eval payload ref");
  if (
    key === "shape" &&
    typeof value === "string" &&
    /^[a-z0-9_-]{2,40}$/i.test(value)
  ) {
    return value;
  }
  throw new Error("raw eval payload is not allowed");
}

function controlledRef(value: unknown, name: string): string {
  if (typeof value !== "string" || !controlledRefPattern.test(value.trim())) {
    throw new Error(`${name} must be a controlled ref`);
  }
  return value.trim();
}

function enumValue<T extends string>(
  value: unknown,
  values: Record<string, T>,
  name: string
): T {
  if (typeof value !== "string" || !Object.values(values).includes(value as T)) {
    throw new Error(`${name} is invalid`);
  }
  return value as T;
}

function integer(value: unknown, name: string, minimum: number): number {
  if (!Number.isInteger(value) || (value as number) < minimum) {
    throw new Error(`${name} must be an integer from ${minimum}`);
  }
  return value as number;
}

function hasCompleteGateEvidence(
  input: ReturnType<typeof evaluateM3EvalGate>
): boolean {
  return Boolean(
    input.controlledRefs.length &&
    Object.keys(input.requiredQuotas).length &&
    input.reasonCodes.length === 0
  );
}

function refuse(
  reasonCode: string,
  targetKind: M3PublishChangeKind,
  targetRef: string
) {
  return { decision: "refuse" as const, reasonCode, targetKind, targetRef };
}
