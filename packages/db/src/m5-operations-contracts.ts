const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const REF_PATTERN = /^(controlled|manifest|storage):\/\/[^\s]+$/i;
const BASE64_INLINE_REF_PATTERN = /^[A-Za-z0-9+/_-]{40,}={0,2}$/;
const FORBIDDEN_KEYS = new Set(
  "address body completion content customerplaintext orderid payment phone prompt raw secret telegrampayload".split(
    " "
  )
);

export type M5OperationsContractInput = {
  orgId: string;
  tenantId: string;
} & Record<string, unknown>;

const tableNames = {
  aiCapabilityToggle: "ai_capability_toggle",
  aiMember: "ai_member",
  aiMemberVersion: "ai_member_version",
  confirmationItem: "confirmation_item",
  distillHealthDaily: "distill_health_daily",
  distillRun: "distill_run"
} as const;
const confirmationItemKinds = {
  conflictCandidate: "conflict_candidate",
  evalCandidate: "eval_candidate",
  knowledgeCandidate: "knowledge_candidate",
  profileCandidate: "profile_candidate"
} as const;
const confirmationItemStatuses = {
  approved: "approved",
  blocked: "blocked",
  discarded: "discarded",
  edited: "edited",
  pending: "pending"
} as const;
const distillRunStatuses = {
  completed: "completed",
  failed: "failed",
  queued: "queued",
  running: "running",
  skipped: "skipped"
} as const;
const distillFrequencies = {
  daily: "daily",
  paused: "paused",
  weekly: "weekly"
} as const;
const aiMemberStatuses = {
  breakerOffline: "breaker_offline",
  disabled: "disabled",
  manualOffline: "manual_offline",
  online: "online"
} as const;
const aiMemberVersionStatuses = {
  active: "active",
  archived: "archived",
  draft: "draft",
  rolledBack: "rolled_back"
} as const;
const aiCapabilityKeys = {
  businessDraft: "business_draft",
  orderRead: "order_read",
  quote: "quote",
  tutorial: "tutorial",
  vision: "vision"
} as const;

function createConfirmationItemContract(
  input: M5OperationsContractInput
): Record<string, unknown> {
  rejectForbiddenKeys(input);
  const targetKind = optionalText(input, "targetKind");
  const targetRef = optionalRef(input, "targetRef");
  if (Boolean(targetKind) !== Boolean(targetRef)) {
    throw new Error("confirmation target requires both targetKind and targetRef");
  }
  return clean({
    ...tenantScope(input, "confirmation item"),
    auditLogId: optionalUuid(input, "auditLogId"),
    candidatePayload: readRecord(input.candidatePayload, "candidatePayload"),
    diffPayload: optionalRecord(input, "diffPayload") ?? {},
    distillRunId: optionalUuid(input, "distillRunId"),
    id: readUuid(input.id, "confirmation item id"),
    kind: enumValue(input.kind, confirmationItemKinds, "confirmation item kind"),
    metadata: optionalRecord(input, "metadata") ?? {},
    reviewedAt: optionalDateText(input, "reviewedAt"),
    reviewedByUserId: optionalUuid(input, "reviewedByUserId"),
    sourceRef: readRef(input.sourceRef, "confirmation item sourceRef"),
    status: enumValue(
      input.status,
      confirmationItemStatuses,
      "confirmation item status"
    ),
    targetKind,
    targetRef
  });
}

function createDistillRunContract(
  input: M5OperationsContractInput
): Record<string, unknown> {
  rejectForbiddenKeys(input);
  const sourceWindowStart = readDateText(input.sourceWindowStart, "sourceWindowStart");
  const sourceWindowEnd = readDateText(input.sourceWindowEnd, "sourceWindowEnd");
  assertDateOrder(sourceWindowStart, sourceWindowEnd, "sourceWindowEnd");
  const startedAt = optionalDateText(input, "startedAt");
  const completedAt = optionalDateText(input, "completedAt");
  if (startedAt && completedAt) assertDateOrder(startedAt, completedAt, "completedAt");
  const candidateCount = optionalInteger(input, "candidateCount", 0) ?? 0;
  const candidateLimit = optionalInteger(input, "candidateLimit", 0, 10) ?? 10;
  if (candidateCount > candidateLimit) throw new Error("candidateCount > limit");
  return clean({
    ...tenantScope(input, "distill run"),
    candidateCount,
    candidateLimit,
    completedAt,
    failureReasonRef: optionalRef(input, "failureReasonRef"),
    frequency: enumValue(input.frequency, distillFrequencies, "distill frequency"),
    id: readUuid(input.id, "distill run id"),
    metadata: optionalRecord(input, "metadata") ?? {},
    sourceWindowEnd,
    sourceWindowStart,
    startedAt,
    status: enumValue(input.status, distillRunStatuses, "distill run status"),
    truncatedCount: optionalInteger(input, "truncatedCount", 0) ?? 0
  });
}

function createDistillHealthDailyContract(
  input: M5OperationsContractInput
): Record<string, unknown> {
  rejectForbiddenKeys(input);
  const approvedCount = optionalInteger(input, "approvedCount", 0) ?? 0;
  const candidateCount = optionalInteger(input, "candidateCount", 0) ?? 0;
  const discardedCount = optionalInteger(input, "discardedCount", 0) ?? 0;
  if (approvedCount + discardedCount > candidateCount)
    throw new Error("reviewed counts > candidates");
  return clean({
    ...tenantScope(input, "distill health daily"),
    approvedCount,
    businessDate: readDateText(input.businessDate, "businessDate"),
    candidateCount,
    consecutiveLowPassDays: optionalInteger(input, "consecutiveLowPassDays", 0) ?? 0,
    discardedCount,
    downshiftReasonRef: optionalRef(input, "downshiftReasonRef"),
    downshifted: optionalBoolean(input, "downshifted") ?? false,
    frequency: enumValue(input.frequency, distillFrequencies, "distill frequency"),
    id: readUuid(input.id, "distill health daily id"),
    metadata: optionalRecord(input, "metadata") ?? {},
    recoveryAuditLogId: optionalUuid(input, "recoveryAuditLogId"),
    sevenDayPassRateBps: optionalInteger(input, "sevenDayPassRateBps", 0, 10000) ?? 0
  });
}

function createAiMemberContract(
  input: M5OperationsContractInput
): Record<string, unknown> {
  rejectForbiddenKeys(input);
  return clean({
    ...tenantScope(input, "ai member"),
    activeVersionId: optionalUuid(input, "activeVersionId"),
    breakerReasonRef: optionalRef(input, "breakerReasonRef"),
    displayName: readText(input.displayName, "ai member displayName"),
    emergencyStoppedAt: optionalDateText(input, "emergencyStoppedAt"),
    id: readUuid(input.id, "ai member id"),
    memberKey: readText(input.memberKey, "ai member memberKey"),
    metadata: optionalRecord(input, "metadata") ?? {},
    status: enumValue(input.status, aiMemberStatuses, "ai member status")
  });
}

function createAiMemberVersionContract(
  input: M5OperationsContractInput
): Record<string, unknown> {
  rejectForbiddenKeys(input);
  return clean({
    ...tenantScope(input, "ai member version"),
    activatedAt: optionalDateText(input, "activatedAt"),
    aiMemberId: readUuid(input.aiMemberId, "ai member version aiMemberId"),
    configVersionId: optionalUuid(input, "configVersionId"),
    createdByUserId: readUuid(
      input.createdByUserId,
      "ai member version createdByUserId"
    ),
    evalGateId: optionalUuid(input, "evalGateId"),
    id: readUuid(input.id, "ai member version id"),
    metadata: optionalRecord(input, "metadata") ?? {},
    personaRef: readRef(input.personaRef, "ai member version personaRef"),
    status: enumValue(
      input.status,
      aiMemberVersionStatuses,
      "ai member version status"
    ),
    version: readInteger(input.version, "ai member version", 1)
  });
}

function createAiCapabilityToggleContract(
  input: M5OperationsContractInput
): Record<string, unknown> {
  rejectForbiddenKeys(input);
  return clean({
    ...tenantScope(input, "ai capability toggle"),
    aiMemberId: readUuid(input.aiMemberId, "ai capability toggle aiMemberId"),
    capabilityKey: enumValue(
      input.capabilityKey,
      aiCapabilityKeys,
      "ai capability key"
    ),
    configVersionId: optionalUuid(input, "configVersionId"),
    enabled: optionalBoolean(input, "enabled") ?? false,
    id: readUuid(input.id, "ai capability toggle id"),
    metadata: optionalRecord(input, "metadata") ?? {},
    updatedAt: optionalDateText(input, "updatedAt"),
    updatedByUserId: optionalUuid(input, "updatedByUserId")
  });
}

export const m5OperationsContracts = {
  aiCapabilityKeys,
  aiMemberStatuses,
  aiMemberVersionStatuses,
  confirmationItemKinds,
  confirmationItemStatuses,
  createAiCapabilityToggleContract,
  createAiMemberContract,
  createAiMemberVersionContract,
  createConfirmationItemContract,
  createDistillHealthDailyContract,
  createDistillRunContract,
  distillFrequencies,
  distillRunStatuses,
  tableNames
} as const;

function tenantScope(input: M5OperationsContractInput, name: string) {
  const orgId = readUuid(input.orgId, `${name} orgId`);
  const tenantId = readUuid(input.tenantId, `${name} tenantId`);
  return Object.assign({}, { orgId }, { tenantId });
}

function clean(record: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(record)) {
    if (record[key] !== undefined) result[key] = record[key];
  }
  return result;
}

function enumValue<T extends string>(
  value: unknown,
  allowed: Record<string, T>,
  name: string
): T {
  const choices = new Set(Object.values(allowed));
  if (typeof value !== "string" || !choices.has(value as T)) {
    throw new Error(`${name} is invalid`);
  }
  return value as T;
}

function optionalBoolean(
  source: M5OperationsContractInput,
  key: string
): boolean | undefined {
  if (source[key] === undefined) return undefined;
  if (typeof source[key] !== "boolean") throw new Error(`${key} must be boolean`);
  return source[key];
}

function optionalDateText(
  source: M5OperationsContractInput,
  key: string
): string | undefined {
  return source[key] === undefined ? undefined : readDateText(source[key], key);
}

function optionalInteger(
  source: M5OperationsContractInput,
  key: string,
  minimum: number,
  maximum = Number.MAX_SAFE_INTEGER
): number | undefined {
  return source[key] === undefined
    ? undefined
    : readInteger(source[key], key, minimum, maximum);
}

function optionalRecord(
  source: M5OperationsContractInput,
  key: string
): Record<string, unknown> | undefined {
  return source[key] === undefined ? undefined : readRecord(source[key], key);
}

function optionalRef(
  source: M5OperationsContractInput,
  key: string
): string | undefined {
  return source[key] === undefined ? undefined : readRef(source[key], key);
}

function optionalText(
  source: M5OperationsContractInput,
  key: string
): string | undefined {
  return source[key] === undefined ? undefined : readText(source[key], key);
}

function optionalUuid(
  source: M5OperationsContractInput,
  key: string
): string | undefined {
  return source[key] === undefined ? undefined : readUuid(source[key], key);
}

function readDateText(value: unknown, name: string): string {
  const text = readText(value, name);
  if (!Number.isFinite(Date.parse(text))) throw new Error(`${name} must be a date`);
  return text;
}

function readInteger(
  value: unknown,
  name: string,
  minimum: number,
  maximum = Number.MAX_SAFE_INTEGER
): number {
  if (
    !Number.isInteger(value) ||
    (value as number) < minimum ||
    (value as number) > maximum
  ) {
    throw new Error(`${name} must be an integer from ${minimum} to ${maximum}`);
  }
  return value as number;
}

function readRecord(value: unknown, name: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${name} must be an object`);
  }
  rejectForbiddenKeys(value, name);
  return value as Record<string, unknown>;
}

function readRef(value: unknown, name: string): string {
  const text = readText(value, name);
  if (BASE64_INLINE_REF_PATTERN.test(text) || !REF_PATTERN.test(text))
    throw new Error(`${name} must be a controlled ref`);
  return text;
}

function readText(value: unknown, name: string): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new Error(`${name} is required`);
  return text;
}

function readUuid(value: unknown, name: string): string {
  const uuid = readText(value, name);
  if (!UUID_PATTERN.test(uuid)) throw new Error(`${name} must be a UUID`);
  return uuid;
}

function assertDateOrder(start: string, end: string, endName: string) {
  if (Date.parse(end) < Date.parse(start)) {
    throw new Error(`${endName} must be after or equal to start`);
  }
}

function rejectForbiddenKeys(value: unknown, path = "input") {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    value.forEach((item, index) => rejectForbiddenKeys(item, `${path}[${index}]`));
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_KEYS.has(key.toLowerCase())) {
      throw new Error(`${path}.${key} is a forbidden raw payload key`);
    }
    rejectForbiddenKeys(child, `${path}.${key}`);
  }
}
