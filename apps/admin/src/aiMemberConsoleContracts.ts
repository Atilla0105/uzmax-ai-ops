const CONTROLLED_REF_PATTERN = /^controlled:\/\/[a-z0-9][a-z0-9/_-]*$/i;
const BASE64ISH_SEGMENT_PATTERN = /(?:^|\/)[A-Za-z0-9+_-]{40,}={0,2}(?:$|\/)/;
const FORBIDDEN_REF_TEXT_PATTERN =
  /(^|[-_/])(raw|prompt|customer|order|phone|payment|secret|url)([-_/]|$)/i;
const FORBIDDEN_KEY_PATTERN = /raw|prompt|customer|order|phone|payment|secret|url/i;
const aiMemberStatuses = [
  "online",
  "manual_offline",
  "breaker_offline",
  "disabled"
] as const;
export const aiMemberCapabilityKeys = [
  "business_draft",
  "order_read",
  "quote",
  "tutorial",
  "vision"
] as const;
const aiMemberActionKinds = [
  "emergency_stop",
  "manual_offline",
  "recover_online",
  "toggle_capability"
] as const;
export type AiMemberStatus = (typeof aiMemberStatuses)[number];
export type AiMemberCapabilityKey = (typeof aiMemberCapabilityKeys)[number];
type AiMemberActionKind = (typeof aiMemberActionKinds)[number];
export type AiMemberActionDraft = {
  action: AiMemberActionKind;
  auditRef: string;
  formalRuntimeWrite: false;
  reasonRef: string;
  requiresOwnerConfirmation: boolean;
  targetStatus: AiMemberStatus;
  capabilityKey?: AiMemberCapabilityKey;
  nextEnabled?: boolean;
};
export type AiMemberActionDraftInput = {
  action: AiMemberActionKind;
  auditRef: string;
  currentStatus: AiMemberStatus;
  reasonRef: string;
  capabilityKey?: AiMemberCapabilityKey;
  nextEnabled?: boolean;
} & Record<string, unknown>;
export const aiMemberCapabilityLabels: Record<AiMemberCapabilityKey, string> = {
  business_draft: "Business draft",
  order_read: "Order read",
  quote: "Quote",
  tutorial: "Tutorial",
  vision: "Vision"
};
export const initialAiMemberCapabilities = {
  business_draft: true,
  order_read: true,
  quote: false,
  tutorial: true,
  vision: false
} satisfies Record<AiMemberCapabilityKey, boolean>;
export const aiMemberConsoleMember = {
  activeVersionRef: "controlled://ai-member/version/v1",
  breakerReasonRef: "controlled://ai-member/breaker-low-pass-rate",
  displayName: "Operations AI",
  personaRef: "controlled://ai-member/persona/v1"
} as const;
export function aiMemberRuntimeActionInput(action: AiMemberActionKind) {
  return {
    breakerResolvedRef: "controlled://m5r-07/ai-member/breaker-resolved",
    controlRef: `controlled://m5r-07/ai-member/${action}`,
    reasonRef: `controlled://m5r-07/ai-member/${action}`,
    traceId: `m5r-07:${action}`
  };
}
export function aiMemberRuntimeLabel(enabled: boolean) {
  return enabled ? "runtime API client" : "synthetic local shell";
}
export function aiMemberActionLabel(enabled: boolean, runtime: string, local: string) {
  return enabled ? runtime : local;
}
export function aiMemberEmergencyStopLabel(enabled: boolean) {
  return aiMemberActionLabel(enabled, "Emergency stop API", "Emergency stop local");
}
export function aiMemberSummaryRows(status: AiMemberStatus) {
  return [
    ["Member", aiMemberConsoleMember.displayName, undefined],
    ["Status", status, "m5-ai-member-status"],
    ["Active version", aiMemberConsoleMember.activeVersionRef, undefined],
    ["Persona", aiMemberConsoleMember.personaRef, undefined]
  ] as const;
}
export function aiMemberDraftLines(draft: AiMemberActionDraft) {
  return [
    draft.action,
    `target ${draft.targetStatus}`,
    `formal runtime write ${draft.formalRuntimeWrite}`,
    `owner confirmation ${draft.requiresOwnerConfirmation}`,
    draft.auditRef,
    draft.reasonRef,
    ...(draft.capabilityKey
      ? [`${draft.capabilityKey} ${draft.nextEnabled ? "enabled" : "disabled"}`]
      : [])
  ];
}
export function aiMemberErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "AI runtime API request failed";
}
export function aiMemberRuntimeRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
const allowedDraftKeys = new Set([
  "action",
  "auditRef",
  "capabilityKey",
  "currentStatus",
  "nextEnabled",
  "reasonRef"
]);
function readAiMemberStatus(value: unknown): AiMemberStatus {
  return readChoice(value, aiMemberStatuses, "AI member status");
}
function readAiMemberCapabilityKey(value: unknown): AiMemberCapabilityKey {
  return readChoice(value, aiMemberCapabilityKeys, "AI member capability key");
}
export function createAiMemberActionDraft(
  input: AiMemberActionDraftInput
): AiMemberActionDraft {
  rejectUnsafeDraftInput(input);
  const action = readChoice(input.action, aiMemberActionKinds, "AI member action");
  const currentStatus = readAiMemberStatus(input.currentStatus);
  const auditRef = readControlledRef(input.auditRef, "auditRef");
  const reasonRef = readControlledRef(input.reasonRef, "reasonRef");
  const targetStatus = targetStatusForAction(action, currentStatus);
  const draft: AiMemberActionDraft = {
    action,
    auditRef,
    formalRuntimeWrite: false,
    reasonRef,
    requiresOwnerConfirmation:
      action === "emergency_stop" || action === "recover_online",
    targetStatus
  };
  if (action === "toggle_capability") {
    draft.capabilityKey = readAiMemberCapabilityKey(input.capabilityKey);
    if (typeof input.nextEnabled !== "boolean") {
      throw new Error("nextEnabled must be boolean for toggle_capability");
    }
    draft.nextEnabled = input.nextEnabled;
  } else if (input.capabilityKey !== undefined || input.nextEnabled !== undefined) {
    throw new Error("capability toggle fields are only allowed for toggle_capability");
  }
  return draft;
}
function targetStatusForAction(
  action: AiMemberActionKind,
  currentStatus: AiMemberStatus
): AiMemberStatus {
  switch (action) {
    case "emergency_stop":
      return "disabled";
    case "manual_offline":
      return "manual_offline";
    case "recover_online":
      return "online";
    default:
      return currentStatus;
  }
}
function readChoice<T extends string>(
  value: unknown,
  allowed: readonly T[],
  name: string
): T {
  if (typeof value !== "string" || !allowed.includes(value as T)) {
    throw new Error(`${name} is invalid`);
  }
  return value as T;
}
function readControlledRef(value: unknown, name: string): string {
  if (typeof value !== "string") throw new Error(`${name} must be a controlled ref`);
  const ref = value.trim();
  const refBody = ref.replace(/^controlled:\/\//i, "");
  if (
    !CONTROLLED_REF_PATTERN.test(ref) ||
    BASE64ISH_SEGMENT_PATTERN.test(refBody) ||
    FORBIDDEN_REF_TEXT_PATTERN.test(refBody)
  ) {
    throw new Error(`${name} must be a safe controlled ref`);
  }
  return ref;
}
function rejectUnsafeDraftInput(input: Record<string, unknown>) {
  for (const [key, value] of Object.entries(input)) {
    if (FORBIDDEN_KEY_PATTERN.test(key)) {
      throw new Error(`${key} is a forbidden raw payload key`);
    }
    if (!allowedDraftKeys.has(key)) {
      throw new Error(`${key} is not allowed in AI member local action draft`);
    }
    if (typeof value === "string" && /^(https?:|data:|blob:|file:)/i.test(value)) {
      throw new Error(`${key} must not be a URL or inline payload`);
    }
  }
}
