export type QueueCard = {
  confidence: string;
  detail: string;
  diff?: { left: string; right: string };
  id: string;
  kind: string;
  summary: string;
  target: string;
  urgency: string;
};

export const queueItems: readonly QueueCard[] = [
  {
    confidence: "92%",
    detail:
      "Candidate ref controlled://candidate/knowledge-a; source ref controlled://distill/source-a.",
    id: "knowledge-a",
    kind: "knowledge",
    summary: "Update one fact card after repeated owner review.",
    target: "Knowledge fact",
    urgency: "high"
  },
  {
    confidence: "88%",
    detail:
      "Candidate ref controlled://candidate/profile-a; target ref controlled://profile/field-a.",
    id: "profile-a",
    kind: "profile",
    summary: "Adjust profile field from confirmed journey signal.",
    target: "Profile field",
    urgency: "medium"
  },
  {
    confidence: "83%",
    detail:
      "Candidate ref controlled://candidate/eval-a; payload ref controlled://eval/case-a.",
    id: "eval-a",
    kind: "eval",
    summary: "Promote review case into eval coverage.",
    target: "Eval sample",
    urgency: "medium"
  },
  {
    confidence: "79%",
    detail: "Conflict cannot skip into formal storage; owner must compare both refs.",
    diff: {
      left: "Current controlled://kb/current-stage",
      right: "Candidate controlled://candidate/stage-rewrite"
    },
    id: "conflict-a",
    kind: "conflict",
    summary: "Resolve two competing stage-card refs.",
    target: "Conflict diff",
    urgency: "blocked"
  }
] as const;

export const health = {
  reason: "3-day pass rate below 40%",
  risk: "downshift risk active"
} as const;

export const healthRows = [
  ["Today candidates", "8/10", ""],
  ["Daily cap", "10", ""],
  ["7-day pass rate", "36%", "warn"],
  ["Distill frequency", "weekly until owner recovery", ""],
  ["Latest downshift reason", health.reason, "warn"]
] as const;

export function queueCardFromApi(item: unknown): QueueCard {
  const row = record(item);
  const kind = String(row.kind ?? "knowledge_candidate").replace("_candidate", "");
  return {
    confidence: "runtime",
    detail: String(row.sourceRef ?? "controlled://m5r-07/confirmation/source"),
    diff: diffFromApi(row.diffPayload),
    id: String(row.id),
    kind,
    summary: String(
      record(row.candidatePayload).summaryRef ??
        record(row.candidatePayload).candidateRef ??
        "controlled://m5r-07/confirmation/candidate"
    ),
    target: String(row.targetRef ?? kind),
    urgency: String(row.status ?? "pending")
  };
}

function diffFromApi(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const row = value as Record<string, unknown>;
  const left = diffRef(row.left ?? row.current ?? row.before);
  const right = diffRef(row.right ?? row.candidate ?? row.after);
  return left && right ? { left, right } : undefined;
}

function diffRef(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const row = value as Record<string, unknown>;
  return typeof row.ref === "string" ? row.ref : undefined;
}

function record(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
