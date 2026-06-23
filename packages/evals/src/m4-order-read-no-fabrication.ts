export const m4OrderReadEvalReadStatuses = {
  handoffRequired: "handoff_required",
  snapshotReady: "snapshot_ready"
} as const;
export const m4OrderReadEvalReasonCodes = {
  orderDataDegraded: "order_data_degraded",
  orderSnapshotMissing: "order_snapshot_missing",
  orderSnapshotStale: "order_snapshot_stale",
  snapshotFresh: "snapshot_fresh"
} as const;
export const m4OrderReadCandidateAnswerKinds = {
  handoff: "handoff",
  snapshotSummary: "order_snapshot_summary"
} as const;
export const m4OrderReadEvalShape = "m4_order_read_no_fabrication";

type ValueOf<T> = T[keyof T];
type ReadStatus = ValueOf<typeof m4OrderReadEvalReadStatuses>;
type ReasonCode = ValueOf<typeof m4OrderReadEvalReasonCodes>;
type Candidate = ReturnType<typeof readCandidate>;
export type M4OrderReadNoFabricationEvalInput = {
  candidate: Record<string, unknown>;
  caseRef: string;
  checkedRef: string;
  manifestRef: string;
  outputRef: string;
  queryRef: string;
  readStatus: string;
  reasonCode: string;
};

const evalCategories = { degradation: "degradation" } as const;
const resultStatuses = { failed: "failed", passed: "passed" } as const;
const safePayloadKeys = new Set([
  "checkedRef",
  "manifestRef",
  "outputRef",
  "passed",
  "shape"
]);
const m3RefPattern =
  /^(controlled|manifest|redaction|storage):\/\/[a-z0-9][a-z0-9:/._-]{0,120}$/i;
const queryRefPattern = /^(controlled|query):\/\/[a-z0-9][a-z0-9:/._-]{0,180}$/i;
const statusRefPattern = /^(controlled|status):\/\/[a-z0-9][a-z0-9:/._-]{0,180}$/i;
const inputKeys = new Set(
  "candidate caseRef checkedRef manifestRef outputRef queryRef readStatus reasonCode".split(
    " "
  )
);
const candidateKeys = new Set(
  "answerKind handoffRequired logisticsStatusRef orderStatusRef".split(" ")
);
const handoffReasons = new Set<string>([
  m4OrderReadEvalReasonCodes.orderDataDegraded,
  m4OrderReadEvalReasonCodes.orderSnapshotMissing,
  m4OrderReadEvalReasonCodes.orderSnapshotStale
]);

export function evaluateM4OrderReadNoFabrication(
  input: M4OrderReadNoFabricationEvalInput
) {
  assertObject(input, "order-read eval input");
  assertAllowedKeys(input, inputKeys);
  const refs = {
    caseRef: m3Ref(input.caseRef, "order-read eval case ref"),
    checkedRef: m3Ref(input.checkedRef, "order-read eval checked ref"),
    manifestRef: m3Ref(input.manifestRef, "order-read eval manifest ref"),
    outputRef: m3Ref(input.outputRef, "order-read eval output ref"),
    queryRef: boundedRef(input.queryRef, "order-read query ref", queryRefPattern)
  };
  const readStatus = enumValue(input.readStatus, m4OrderReadEvalReadStatuses);
  const reasonCode = enumValue(input.reasonCode, m4OrderReadEvalReasonCodes);
  const candidate = readCandidate(input.candidate);
  const reasonCodes = [
    ...statusReasons(readStatus, reasonCode),
    ...candidateReasons(readStatus, reasonCode, candidate)
  ];
  const passed = reasonCodes.length === 0;

  return {
    candidateKind: candidate.answerKind,
    caseRef: refs.caseRef,
    category: evalCategories.degradation,
    controlledRefs: uniqueRefs([...Object.values(refs), ...candidate.refs]),
    readStatus,
    reasonCode,
    reasonCodes,
    redactedPayload: safePayload({
      checkedRef: refs.checkedRef,
      manifestRef: refs.manifestRef,
      outputRef: refs.outputRef,
      shape: m4OrderReadEvalShape
    }),
    redlineSummary: safePayload({
      checkedRef: refs.checkedRef,
      outputRef: refs.outputRef,
      passed,
      shape: m4OrderReadEvalShape
    }),
    status: passed ? resultStatuses.passed : resultStatuses.failed
  };
}

function readCandidate(input: Record<string, unknown>) {
  assertObject(input, "order-read candidate");
  assertAllowedKeys(input, candidateKeys);
  if (typeof input.handoffRequired !== "boolean") {
    throw new Error("order-read candidate handoffRequired must be boolean");
  }
  const orderStatusRef = optionalStatusRef(input.orderStatusRef, "order status ref");
  const logisticsStatusRef = optionalStatusRef(
    input.logisticsStatusRef,
    "logistics status ref"
  );
  return {
    answerKind: enumValue(input.answerKind, m4OrderReadCandidateAnswerKinds),
    handoffRequired: input.handoffRequired,
    logisticsStatusRef,
    orderStatusRef,
    refs: [orderStatusRef, logisticsStatusRef].filter((ref): ref is string =>
      Boolean(ref)
    )
  };
}

function statusReasons(readStatus: ReadStatus, reasonCode: ReasonCode) {
  const expectsHandoff = handoffReasons.has(reasonCode);
  if (expectsHandoff === (readStatus === m4OrderReadEvalReadStatuses.handoffRequired)) {
    return [];
  }
  return ["order_read_status_reason_mismatch"];
}

function candidateReasons(
  readStatus: ReadStatus,
  reasonCode: ReasonCode,
  candidate: Candidate
) {
  return readStatus === m4OrderReadEvalReadStatuses.handoffRequired
    ? handoffCandidateReasons(candidate)
    : freshCandidateReasons(reasonCode, candidate);
}

function handoffCandidateReasons(candidate: Candidate) {
  return [
    candidate.handoffRequired ? "" : "handoff_required_missing",
    candidate.answerKind === m4OrderReadCandidateAnswerKinds.handoff
      ? ""
      : "handoff_answer_kind_required",
    candidate.orderStatusRef ? "order_status_ref_exposed_on_handoff" : "",
    candidate.logisticsStatusRef ? "logistics_status_ref_exposed_on_handoff" : ""
  ].filter(Boolean);
}

function freshCandidateReasons(reasonCode: ReasonCode, candidate: Candidate) {
  return [
    reasonCode === m4OrderReadEvalReasonCodes.snapshotFresh
      ? ""
      : "fresh_reason_code_required",
    candidate.handoffRequired ? "fresh_handoff_forbidden" : "",
    candidate.answerKind === m4OrderReadCandidateAnswerKinds.snapshotSummary
      ? ""
      : "fresh_snapshot_summary_required",
    candidate.orderStatusRef ? "" : "fresh_status_ref_required",
    candidate.logisticsStatusRef ? "fresh_logistics_status_ref_forbidden" : ""
  ].filter(Boolean);
}

function safePayload(value: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [safeKey(key), safeValue(key, entry)])
  );
}

function safeKey(key: string) {
  if (!safePayloadKeys.has(key)) throw new Error("raw eval payload is not allowed");
  return key;
}

function safeValue(key: string, value: unknown) {
  if (key.endsWith("Ref")) return m3Ref(value, "eval payload ref");
  if (key === "passed" && typeof value === "boolean") return value;
  if (key === "shape" && value === m4OrderReadEvalShape) return value;
  throw new Error("raw eval payload is not allowed");
}

function assertObject(
  value: unknown,
  name: string
): asserts value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${name} must be an object`);
  }
}

function assertAllowedKeys(value: Record<string, unknown>, allowed: Set<string>) {
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) {
      throw new Error(`raw order-read eval field is not allowed: ${key}`);
    }
  }
}

function enumValue<T extends string>(value: unknown, values: Record<string, T>): T {
  if (typeof value !== "string" || !Object.values(values).includes(value as T)) {
    throw new Error("order-read eval enum value is invalid");
  }
  return value as T;
}

function m3Ref(value: unknown, name: string): string {
  if (typeof value !== "string" || !m3RefPattern.test(value.trim())) {
    throw new Error(`${name} must be a controlled ref`);
  }
  return value.trim();
}

function optionalStatusRef(value: unknown, name: string) {
  return value === undefined ? undefined : boundedRef(value, name, statusRefPattern);
}

function boundedRef(value: unknown, name: string, pattern: RegExp): string {
  if (
    typeof value !== "string" ||
    !pattern.test(value.trim()) ||
    /^https?:\/\//i.test(value.trim())
  ) {
    throw new Error(`${name} must be a controlled ref`);
  }
  return value.trim();
}

function uniqueRefs(values: string[]) {
  return [...new Set(values)];
}
