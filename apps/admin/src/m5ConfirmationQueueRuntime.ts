import { createElement } from "react";
import { createConfirmationQueueApiClient } from "./confirmationQueueApiClient";
import { createM5AdminRuntimeFetcher } from "./m5AdminRuntimeMode";
export type QueueCard = Record<
  "confidence" | "detail" | "id" | "kind" | "summary" | "target" | "urgency",
  string
> & {
  diff?: { left: string; right: string };
};
export const queueItems: readonly QueueCard[] = [
  {
    confidence: "92%",
    detail: "controlled://candidate/knowledge-a; controlled://distill/source-a.",
    id: "knowledge-a",
    kind: "knowledge",
    summary: "Update one fact card after repeated owner review.",
    target: "Knowledge fact",
    urgency: "high"
  },
  {
    confidence: "88%",
    detail: "controlled://candidate/profile-a; controlled://profile/field-a.",
    id: "profile-a",
    kind: "profile",
    summary: "Adjust profile field from confirmed journey signal.",
    target: "Profile field",
    urgency: "medium"
  },
  {
    confidence: "83%",
    detail: "controlled://candidate/eval-a; controlled://eval/case-a.",
    id: "eval-a",
    kind: "eval",
    summary: "Promote review case into eval coverage.",
    target: "Eval sample",
    urgency: "medium"
  },
  {
    confidence: "79%",
    detail: "Conflict needs owner side-by-side review.",
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
const healthReason = "3-day pass rate below 40%";
export const health = { reason: healthReason, risk: "downshift risk active" } as const;
export const healthRows = [
  ["Today candidates", "8/10", ""],
  ["Daily cap", "10", ""],
  ["7-day pass rate", "36%", "warn"],
  ["Distill frequency", "weekly until owner recovery", ""],
  ["Latest downshift reason", health.reason, "warn"]
] as const;
function queueCardFromApi(item: unknown): QueueCard {
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
export async function listRuntimeQueueCards() {
  const itemsFromApi = await createRuntimeQueueClient().listItems({
    status: "pending"
  });
  return {
    cards: itemsFromApi.map(queueCardFromApi),
    result: `API loaded ${itemsFromApi.length} confirmation items`
  };
}
export async function loadRuntimeQueueDetail(itemId: string) {
  const detail = queueCardFromApi(await createRuntimeQueueClient().getItem(itemId));
  return { detail, result: `API detail loaded ${detail.id}` };
}
export async function submitRuntimeQueueDecision(
  itemId: string,
  decision: "approved" | "discarded"
) {
  const result = await createRuntimeQueueClient().submitDecision(itemId, {
    action: decision === "approved" ? "approve" : "discard",
    reasonRef: `controlled://m5r-07/confirmation/${decision}`
  });
  const status = String(result.item.status);
  return {
    result: `API decision ${status}; formalWrite ${String(result.formalWrite)}`,
    status
  };
}
export function confirmationQueueErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "runtime API request failed";
}
export function confirmationQueueRuntimeLabel(enabled: boolean) {
  return enabled ? "runtime API client" : "synthetic local shell";
}
export function ConflictDiff({ diff }: { diff: NonNullable<QueueCard["diff"]> }) {
  return createElement(
    "div",
    { className: "m5-conflict-diff", "data-testid": "m5-conflict-diff" },
    createElement("div", null, [
      createElement("span", { key: "label" }, "Current"),
      createElement("strong", { key: "value" }, diff.left)
    ]),
    createElement("div", null, [
      createElement("span", { key: "label" }, "Candidate"),
      createElement("strong", { key: "value" }, diff.right)
    ])
  );
}
function createRuntimeQueueClient() {
  return createConfirmationQueueApiClient({ fetcher: createM5AdminRuntimeFetcher() });
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
