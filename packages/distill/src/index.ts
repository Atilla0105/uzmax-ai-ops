export const packageName = "@uzmax/distill";

const REF_PATTERN = /^(controlled|manifest|storage):\/\/[^\s]+$/i;
const BASE64_INLINE_REF_PATTERN = /^[A-Za-z0-9+/_-]{40,}={0,2}$/;
const DAILY_CANDIDATE_LIMIT = 10;
const LOW_PASS_RATE_BPS = 4000;
const DOWNSHIFT_LOW_DAYS = 3;
const FORBIDDEN_KEYS = new Set(
  "address body completion content customerplaintext orderid payment phone prompt raw secret telegrampayload".split(
    " "
  )
);

type Dict = Record<string, unknown>;
export function createDailyDistillCandidateSelection(input: Dict) {
  rejectForbiddenKeys(input);
  const candidateLimit =
    input.candidateLimit === undefined
      ? DAILY_CANDIDATE_LIMIT
      : readInteger(input.candidateLimit, "candidateLimit", 0, DAILY_CANDIDATE_LIMIT);
  const candidates = readArray(input.candidates, "candidates").map((item, index) =>
    normalizeCandidate(readRecord(item, `candidates[${index}]`), index)
  );
  const sorted = candidates.toSorted(
    (left, right) =>
      right.candidate.confidenceBps - left.candidate.confidenceBps ||
      left.sortKey.localeCompare(right.sortKey)
  );
  const acceptedCandidates = sorted
    .slice(0, candidateLimit)
    .map(({ candidate }) => candidate);
  const truncatedCandidateRefs = sorted
    .slice(candidateLimit)
    .map(({ candidate }) => candidate.candidateRef);

  return {
    acceptedCandidates,
    auditRef: readRef(input.auditRef, "auditRef"),
    businessDate: readBusinessDate(input.businessDate, "businessDate"),
    candidateCount: candidates.length,
    candidateLimit,
    truncatedCandidateRefs,
    truncatedCount: truncatedCandidateRefs.length
  };
}

export function summarizeSevenDayDistillPassRate(input: Dict) {
  rejectForbiddenKeys(input);
  const daysInput = readArray(input.days, "days");
  if (daysInput.length === 0 || daysInput.length > 7) {
    throw new Error("days must contain 1 to 7 daily count records");
  }
  const days = daysInput
    .map((item) => normalizeDailyCount(readRecord(item, "days[]")))
    .toSorted((left, right) => left.businessDate.localeCompare(right.businessDate));
  const totals = days.reduce(
    (total, day) => ({
      approvedCount: total.approvedCount + day.approvedCount,
      candidateCount: total.candidateCount + day.candidateCount,
      discardedCount: total.discardedCount + day.discardedCount
    }),
    { approvedCount: 0, candidateCount: 0, discardedCount: 0 }
  );
  const currentFrequency = String(input.currentFrequency ?? "daily");
  if (!/^(daily|weekly|paused)$/.test(currentFrequency)) {
    throw new Error("currentFrequency must be daily, weekly, or paused");
  }
  const consecutiveLowPassDays = countConsecutiveLowDays(days);
  const downshiftRecommended =
    currentFrequency === "daily" && consecutiveLowPassDays >= DOWNSHIFT_LOW_DAYS;

  return {
    consecutiveLowPassDays,
    currentFrequency,
    dailyRates: days,
    downshiftRecommended,
    lowPassRateThresholdBps: LOW_PASS_RATE_BPS,
    recommendedFrequency:
      currentFrequency === "daily"
        ? downshiftRecommended
          ? "weekly"
          : "daily"
        : currentFrequency,
    sevenDayPassRateBps: passRateBps(totals.approvedCount, totals.candidateCount),
    summaryRef: readRef(input.summaryRef, "summaryRef"),
    totals
  };
}

export function createDistillOwnerAlertDraft(input: Dict) {
  rejectForbiddenKeys(input);
  if (input.recommendedFrequency !== "weekly") {
    throw new Error("owner alert recommendedFrequency must be weekly");
  }
  return {
    alertRef: readRef(input.alertRef, "alertRef"),
    auditRequirementRef: readRef(input.auditRequirementRef, "auditRequirementRef"),
    deliveryStatus: "draft_only",
    downshiftReasonRef: readRef(input.downshiftReasonRef, "downshiftReasonRef"),
    healthSummaryRef: readRef(input.healthSummaryRef, "healthSummaryRef"),
    payloadPolicy: "controlled_refs_only",
    recommendedFrequency: "weekly",
    requiresOwnerReview: true,
    severity: "amber",
    tenantRef: readRef(input.tenantRef, "tenantRef")
  };
}

export function createManualDistillRecoveryAuditContract(input: Dict) {
  rejectForbiddenKeys(input);
  if (input.toFrequency !== "daily") throw new Error("toFrequency must be daily");
  if (input.fromFrequency !== "weekly" && input.fromFrequency !== "paused") {
    throw new Error("fromFrequency must be weekly or paused");
  }
  return {
    action: "distill_frequency_manual_recovery",
    actorRef: readRef(input.actorRef, "actorRef"),
    auditRef: readRef(input.auditRef, "auditRef"),
    fromFrequency: input.fromFrequency,
    healthSummaryRef: readRef(input.healthSummaryRef, "healthSummaryRef"),
    reasonRef: readRef(input.reasonRef, "reasonRef"),
    recoveryRef: readRef(input.recoveryRef, "recoveryRef"),
    requiresControlledAuditRef: true,
    toFrequency: "daily",
    writesRuntimeState: false
  };
}

function normalizeCandidate(row: Dict, index: number) {
  return {
    candidate: {
      candidateRef: readRef(row.candidateRef, `candidates[${index}].candidateRef`),
      confidenceBps: readInteger(
        row.confidenceBps,
        `candidates[${index}].confidenceBps`,
        0,
        10000
      ),
      kind: readText(row.kind, `candidates[${index}].kind`),
      sourceRef: readRef(row.sourceRef, `candidates[${index}].sourceRef`)
    },
    sortKey: readText(
      row.tieBreaker ?? row.candidateRef,
      `candidates[${index}].tieBreaker`
    )
  };
}

function normalizeDailyCount(row: Dict) {
  const candidateCount = readInteger(row.candidateCount, "candidateCount", 0);
  const approvedCount = readInteger(row.approvedCount, "approvedCount", 0);
  const discardedCount = readInteger(row.discardedCount, "discardedCount", 0);
  if (approvedCount + discardedCount > candidateCount) {
    throw new Error("approvedCount + discardedCount must not exceed candidateCount");
  }
  const passRate = passRateBps(approvedCount, candidateCount);
  return {
    approvedCount,
    businessDate: readBusinessDate(row.businessDate, "businessDate"),
    candidateCount,
    discardedCount,
    isLowPassRate: candidateCount > 0 && passRate < LOW_PASS_RATE_BPS,
    passRateBps: passRate
  };
}

function countConsecutiveLowDays(
  days: readonly ReturnType<typeof normalizeDailyCount>[]
) {
  let count = 0;
  for (let index = days.length - 1; index >= 0; index -= 1) {
    const day = days[index];
    if (!day) break;
    if (!day.isLowPassRate) break;
    count += 1;
  }
  return count;
}

function passRateBps(approvedCount: number, candidateCount: number) {
  return candidateCount === 0
    ? 0
    : Math.round((approvedCount * 10000) / candidateCount);
}

function readArray(value: unknown, name: string) {
  if (!Array.isArray(value)) throw new Error(`${name} must be an array`);
  return value;
}

function readBusinessDate(value: unknown, name: string) {
  const text = readText(value, name);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text) || !Number.isFinite(Date.parse(text))) {
    throw new Error(`${name} must be a YYYY-MM-DD date`);
  }
  return text;
}

function readInteger(
  value: unknown,
  name: string,
  minimum: number,
  maximum = Number.MAX_SAFE_INTEGER
) {
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < minimum ||
    value > maximum
  ) {
    throw new Error(`${name} must be an integer from ${minimum} to ${maximum}`);
  }
  return value;
}

function readRecord(value: unknown, name: string): Dict {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${name} must be an object`);
  }
  rejectForbiddenKeys(value, name);
  return value as Dict;
}

function readRef(value: unknown, name: string) {
  const text = readText(value, name);
  if (BASE64_INLINE_REF_PATTERN.test(text) || !REF_PATTERN.test(text)) {
    throw new Error(`${name} must be a controlled ref`);
  }
  return text;
}

function readText(value: unknown, name: string) {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new Error(`${name} is required`);
  return text;
}

function rejectForbiddenKeys(value: unknown, path = "input") {
  const queue = [{ path, value }];
  for (const item of queue) {
    if (!item.value || typeof item.value !== "object") continue;
    const fromArray = Array.isArray(item.value);
    for (const [key, child] of Object.entries(item.value)) {
      const nextPath = fromArray ? `${item.path}[${key}]` : `${item.path}.${key}`;
      if (!fromArray && FORBIDDEN_KEYS.has(key.toLowerCase())) {
        throw new Error(`${nextPath} is a forbidden raw payload key`);
      }
      queue.push({ path: nextPath, value: child });
    }
  }
}
