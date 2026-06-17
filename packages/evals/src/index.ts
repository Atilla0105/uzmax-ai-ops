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

export type EvalSeedManifestStatus =
  | "sample_ready__gate1_go"
  | "seed_quota_pass__content_external"
  | "sample_deferred"
  | "sample_failed";

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
