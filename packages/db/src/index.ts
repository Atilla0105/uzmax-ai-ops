export const packageName = "@uzmax/db";
// prettier-ignore
export type { M3AiContractInput, createEvalCaseContract as M3CreateEvalCaseContract, createEvalGateContract as M3CreateEvalGateContract, createEvalResultContract as M3CreateEvalResultContract, createEvalRunContract as M3CreateEvalRunContract, createKbEntryContract as M3CreateKbEntryContract, createKbStageContract as M3CreateKbStageContract, createLlmCallLogContract as M3CreateLlmCallLogContract, createMediaAssetContract as M3CreateMediaAssetContract, createQuoteRecordContract as M3CreateQuoteRecordContract, evalCategories as M3EvalCategories, evalGateStatuses as M3EvalGateStatuses, evalResultStatuses as M3EvalResultStatuses, evalRunStatuses as M3EvalRunStatuses, llmCallStatuses as M3LlmCallStatuses, llmTasks as M3LlmTasks, m3AiTableNames as M3AiTableNames, m3RecordStatuses as M3RecordStatuses, quoteRecordStatuses as M3QuoteRecordStatuses, quoteSources as M3QuoteSources } from "./m3-ai-contracts";
export type {
  M4CustomerAssetContractInput,
  m4CustomerAssetContracts as M4CustomerAssetContracts
} from "./m4-customer-asset-contracts";
export type {
  M4OrderImportContractInput,
  m4OrderImportContracts as M4OrderImportContracts
} from "./m4-order-import-contracts";
export type {
  M5OperationsContractInput,
  m5OperationsContracts as M5OperationsContracts
} from "./m5-operations-contracts";

const ROLE_IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_.-]*$/;
const UUID_TEXT =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// prettier-ignore
export const platformTableNames = values("org", "permission_grant", "org_member", "tenant", "tenant_member");
export const governanceTableNames = values("audit_log", "config_version");
// prettier-ignore
export const channelConversationTableNames = values("channel_connection", "conversation", "message", "telegram_update_dedupe", "ticket", "ticket_event");
// prettier-ignore
export const auditEventTypes = { accessContextDenied: "access_context.denied", configVersionRollbackRequested: "config_version.rollback_requested", configVersionSaved: "config_version.saved", customerFlagsRestored: "customer.flags_restored", permissionGrantChanged: "permission_grant.changed", tenantSwitchAllowed: "tenant_switch.allowed", tenantSwitchDenied: "tenant_switch.denied" } as const;
// prettier-ignore
export const configVersionDomains = values("business_config", "feature_flag", "template_copy");
// prettier-ignore
export const configVersionStatuses = { active: "active", archived: "archived", draft: "draft", rolledBack: "rolled_back" } as const;
// prettier-ignore
export const channelConnectionStatuses = values("active", "archived", "degraded", "disabled");
// prettier-ignore
export const conversationStatuses = values("closed", "handoff", "open", "pending_handoff");
export const messageDirections = values("inbound", "internal", "outbound");
// prettier-ignore
export const messageContentKinds = values("callback", "image", "system", "text", "unsupported", "voice");
// prettier-ignore
export const messageDeliveryStatuses = values("cancelled", "failed", "queued", "received", "sent");
// prettier-ignore
export const ticketStatuses = values("claimed", "closed", "escalated", "locked", "open", "reopened");
// prettier-ignore
export const ticketEventTypes = values("claimed", "closed", "created", "escalated", "locked", "note_added", "reopened", "status_changed");
// M3 compatibility bridge; canonical implementation lives in ./m3-ai-contracts.ts.
// prettier-ignore
export const m3AiTableNames = values("eval_case", "eval_gate", "eval_result", "eval_run", "kb_entry", "kb_stage", "llm_call_log", "media_asset", "quote_record"), m3RecordStatuses = values("active", "archived", "draft"), quoteRecordStatuses = values("created", "expired", "voided"), quoteSources = values("code"), evalCategories = values("business_draft", "degradation", "intent", "language", "quote", "redline_attack", "redline_false_positive", "speech", "tutorial", "vision"), evalRunStatuses = values("blocked", "failed", "passed", "queued", "running"), evalResultStatuses = values("failed", "passed", "skipped"), evalGateStatuses = values("blocked", "failed", "passed", "pending"), llmTasks = values("distill_daily", "draft_reply", "eval_judge", "intent_classify", "journey_import", "kb_answer", "profile_update", "speech_postprocess", "summarize", "vision_diag"), llmCallStatuses = values("failed", "fallback", "succeeded");

export const rlsContextKeys = {
  orgId: "app.org_id",
  tenantId: "app.tenant_id"
} as const;
export const platformRuntimeRole = "uzmax_app_runtime";

type ValueOf<T> = T[keyof T];
type IdScoped = RlsTenantContext & { id: string };
// prettier-ignore
type OptionalVersionRefs = { afterVersionId?: string; beforeVersionId?: string };

export type RlsTenantContext = { orgId: string; tenantId: string };
// prettier-ignore
export type RlsContextSetting = { key: (typeof rlsContextKeys)[keyof typeof rlsContextKeys]; value: string };
// prettier-ignore
export type RlsTransactionContext = { roleSql: string; settings: readonly RlsContextSetting[] };
export type AuditEventType = ValueOf<typeof auditEventTypes>;
export type ConfigVersionDomain = ValueOf<typeof configVersionDomains>;
export type ConfigVersionStatus = ValueOf<typeof configVersionStatuses>;
// prettier-ignore
export type AuditLogContent = { after: Record<string, unknown> | null; before: Record<string, unknown> | null };
export type AuditLogContract = RlsTenantContext &
  OptionalVersionRefs &
  Record<"action" | "actorUserId" | "module" | "objectType" | "occurredAt", string> & {
    content: AuditLogContent;
    eventType: AuditEventType;
    objectId?: string;
    traceId?: string;
  };
export type ConfigVersionContract = IdScoped & {
  activatedAt?: string;
  domain: ConfigVersionDomain;
  payload: Record<string, unknown>;
  previousVersionId?: string;
  reason?: string;
  rollbackOfVersionId?: string;
  status: ConfigVersionStatus;
  version: number;
} & Record<"createdAt" | "createdByUserId" | "key", string>;
export type ConfigVersionAuditInput = RlsTenantContext & {
  beforeVersionId?: string;
  configVersion: ConfigVersionContract;
  eventType:
    | typeof auditEventTypes.configVersionRollbackRequested
    | typeof auditEventTypes.configVersionSaved;
  traceId?: string;
} & Record<"action" | "actorUserId", string>;
export type ConfigVersionDraftInput = Omit<
  ConfigVersionContract,
  "createdAt" | "createdByUserId" | "id" | "orgId" | "tenantId"
> & { versionId: string };
export type CustomerAssetRestoreFlag = "blacklisted" | "unreachable";
export type CustomerAssetRestoreFlagSnapshot = Record<
  "isBlacklisted" | "isUnreachable",
  boolean
>;
export type CustomerAssetRestoreAuditInput = RlsTenantContext & {
  after: CustomerAssetRestoreFlagSnapshot;
  before: CustomerAssetRestoreFlagSnapshot;
  customerId: string;
  reasonRef: string;
  restoredFlags: readonly CustomerAssetRestoreFlag[];
  traceId?: string;
} & { actorUserId: string };
// prettier-ignore
export type PermissionGrantAuditInput = RlsTenantContext & { after: Record<string, unknown>; before: Record<string, unknown>; traceId?: string } & Record<"actorUserId" | "permission" | "targetUserId", string>;
// prettier-ignore
export type TenantSwitchAuditInput = RlsTenantContext & { membershipVersion?: number; reason?: string; targetTenantId?: string } & { actorUserId: string };
// prettier-ignore
export type ConversationContract = IdScoped & Record<"channelConnectionId" | "externalConversationRef" | "participantExternalRef", string> & { lastMessageAt?: string; status: ValueOf<typeof conversationStatuses>; unreadCount: number };
// prettier-ignore
export type MessageContract = IdScoped & Record<"channelConnectionId" | "conversationId" | "occurredAt", string> & { content: Record<string, unknown>; contentKind: ValueOf<typeof messageContentKinds>; deliveryStatus: ValueOf<typeof messageDeliveryStatuses>; direction: ValueOf<typeof messageDirections>; externalMessageRef?: string };
// prettier-ignore
export type TicketContract = IdScoped & { assignedUserId?: string; closedAt?: string; conversationId: string; lockedByUserId?: string; priority: number; slaDueAt?: string; status: ValueOf<typeof ticketStatuses>; summary?: string };

export function assertSafeDatabaseRole(role: string): string {
  if (!ROLE_IDENTIFIER.test(role)) {
    throw new Error(`Unsafe database role identifier: ${role}`);
  }
  return role;
}

export function quoteDatabaseIdentifier(identifier: string): string {
  return `"${assertSafeDatabaseRole(identifier).replaceAll('"', '""')}"`;
}

export function createSetLocalRoleSql(role = platformRuntimeRole): string {
  return `set local role ${quoteDatabaseIdentifier(role)}`;
}

export function hasCompleteRlsTenantContext(
  context: Partial<RlsTenantContext>
): context is RlsTenantContext {
  return Boolean(context.orgId?.trim() && context.tenantId?.trim());
}

export function createRlsTransactionContext(
  context: RlsTenantContext,
  role = platformRuntimeRole
): RlsTransactionContext {
  if (!hasCompleteRlsTenantContext(context)) {
    throw new Error("RLS tenant context requires orgId and tenantId");
  }
  return {
    roleSql: createSetLocalRoleSql(role),
    settings: [
      { key: rlsContextKeys.orgId, value: context.orgId.trim() },
      { key: rlsContextKeys.tenantId, value: context.tenantId.trim() }
    ]
  };
}

export function createAuditLogContract(input: AuditLogContract): AuditLogContract {
  return {
    ...scoped(input, "audit"),
    action: requireText(input.action, "audit action"),
    actorUserId: requireUuid(input.actorUserId, "audit actorUserId"),
    ...optionalUuidFields(input, ["afterVersionId", "beforeVersionId"]),
    content: requireAuditContent(input.content),
    eventType: requireEnumValue(input.eventType, auditEventTypes, "audit eventType"),
    module: requireText(input.module, "audit module"),
    ...optionalTextFields(input, ["objectId", "traceId"]),
    objectType: requireText(input.objectType, "audit objectType"),
    occurredAt: input.occurredAt || new Date().toISOString()
  };
}

export function createConfigVersionContract(
  input: ConfigVersionContract
): ConfigVersionContract {
  return {
    ...scoped(input, "config"),
    ...optionalTextFields(input, ["activatedAt", "reason"]),
    ...optionalUuidFields(input, ["previousVersionId", "rollbackOfVersionId"]),
    createdAt: input.createdAt || new Date().toISOString(),
    createdByUserId: requireUuid(input.createdByUserId, "createdByUserId"),
    domain: requireEnumValue(
      input.domain,
      configVersionDomains,
      "config version domain"
    ),
    id: requireUuid(input.id, "config version id"),
    key: requireText(input.key, "config key"),
    payload: requireRecord(input.payload, "config payload"),
    status: requireEnumValue(
      input.status,
      configVersionStatuses,
      "config version status"
    ),
    version: requireInteger(input.version, "config version", 1)
  };
}

export function createConfigVersionAuditContract(
  input: ConfigVersionAuditInput
): AuditLogContract {
  return createAuditLogContract({
    action: input.action,
    actorUserId: input.actorUserId,
    ...optionalUuidFields(input, ["beforeVersionId"]),
    afterVersionId: input.configVersion.id,
    content: {
      after: {
        domain: input.configVersion.domain,
        key: input.configVersion.key,
        status: input.configVersion.status,
        version: input.configVersion.version,
        versionId: input.configVersion.id
      },
      before: input.beforeVersionId ? { versionId: input.beforeVersionId } : null
    },
    eventType: input.eventType,
    module: "config",
    objectId: input.configVersion.id,
    objectType: "config_version",
    occurredAt: new Date().toISOString(),
    orgId: input.orgId,
    tenantId: input.tenantId,
    ...optionalTextFields(input, ["traceId"])
  });
}

export function createScopedConfigVersionContract(
  input: ConfigVersionDraftInput & RlsTenantContext & { createdByUserId: string }
): ConfigVersionContract {
  return createConfigVersionContract({
    ...input,
    createdAt: new Date().toISOString(),
    id: input.versionId,
    status: input.status ?? configVersionStatuses.draft
  });
}

export function createCustomerAssetRestoreAuditContract(
  input: CustomerAssetRestoreAuditInput
): AuditLogContract {
  const restoredFlags = requireCustomerRestoreFlags(input.restoredFlags);
  return createAuditLogContract({
    action: "customer_restore_flags",
    actorUserId: input.actorUserId,
    content: {
      after: {
        ...customerRestoreFlagSnapshot(input.after, "customer restore after"),
        reasonRef: requireText(input.reasonRef, "customer restore reasonRef"),
        restoredFlags
      },
      before: customerRestoreFlagSnapshot(input.before, "customer restore before")
    },
    eventType: auditEventTypes.customerFlagsRestored,
    module: "customer_asset",
    objectId: requireUuid(input.customerId, "customer restore customerId"),
    objectType: "customer",
    occurredAt: new Date().toISOString(),
    orgId: input.orgId,
    tenantId: input.tenantId,
    ...optionalTextFields(input, ["traceId"])
  });
}

export function createPermissionGrantAuditContract(
  input: PermissionGrantAuditInput
): AuditLogContract {
  return createAuditLogContract({
    action: "permission_change",
    actorUserId: input.actorUserId,
    content: { after: input.after, before: input.before },
    eventType: auditEventTypes.permissionGrantChanged,
    module: "authz",
    objectId: `${requireUuid(input.targetUserId, "targetUserId")}:${input.permission}`,
    objectType: "permission_grant",
    occurredAt: new Date().toISOString(),
    orgId: input.orgId,
    tenantId: input.tenantId,
    ...optionalTextFields(input, ["traceId"])
  });
}

export function createTenantSwitchAuditContract(
  input: TenantSwitchAuditInput
): AuditLogContract {
  const denied = Boolean(input.targetTenantId);
  return createAuditLogContract({
    action: denied ? "tenant_switch_denied" : "tenant_switch",
    actorUserId: input.actorUserId,
    content: denied
      ? {
          after: null,
          before: {
            reason: input.reason ?? "tenant switch denied",
            targetTenantId: input.targetTenantId
          }
        }
      : {
          after: {
            membershipVersion: input.membershipVersion,
            tenantId: input.tenantId
          },
          before: null
        },
    eventType: denied
      ? auditEventTypes.tenantSwitchDenied
      : auditEventTypes.tenantSwitchAllowed,
    module: "access",
    objectId: input.targetTenantId ?? input.tenantId,
    objectType: "tenant",
    occurredAt: new Date().toISOString(),
    orgId: input.orgId,
    tenantId: input.tenantId
  });
}

// prettier-ignore
export function createConversationContract(input: ConversationContract): ConversationContract { return { ...scoped(input, "conversation"), channelConnectionId: requireUuid(input.channelConnectionId, "conversation channelConnectionId"), externalConversationRef: requireText(input.externalConversationRef, "externalConversationRef"), id: requireUuid(input.id, "conversation id"), ...optionalTextFields(input, ["lastMessageAt"]), participantExternalRef: requireText(input.participantExternalRef, "participantExternalRef"), status: requireEnumValue(input.status, conversationStatuses, "conversation status"), unreadCount: requireInteger(input.unreadCount, "unreadCount", 0) }; }

// prettier-ignore
export function createMessageContract(input: MessageContract): MessageContract { return { ...scoped(input, "message"), channelConnectionId: requireUuid(input.channelConnectionId, "message channelConnectionId"), content: requireRecord(input.content, "message content"), contentKind: requireEnumValue(input.contentKind, messageContentKinds, "message contentKind"), conversationId: requireUuid(input.conversationId, "message conversationId"), deliveryStatus: requireEnumValue(input.deliveryStatus, messageDeliveryStatuses, "message deliveryStatus"), direction: requireEnumValue(input.direction, messageDirections, "message direction"), ...optionalTextFields(input, ["externalMessageRef"]), id: requireUuid(input.id, "message id"), occurredAt: requireText(input.occurredAt, "occurredAt") }; }

// prettier-ignore
export function createTicketContract(input: TicketContract): TicketContract { return { ...scoped(input, "ticket"), ...optionalUuidFields(input, ["assignedUserId", "lockedByUserId"]), ...optionalTextFields(input, ["closedAt", "slaDueAt", "summary"]), conversationId: requireUuid(input.conversationId, "ticket conversationId"), id: requireUuid(input.id, "ticket id"), priority: requireInteger(input.priority, "ticket priority", 1, 5), status: requireEnumValue(input.status, ticketStatuses, "ticket status") }; }

type M3Input = RlsTenantContext & { id: string } & Record<string, unknown>;

// prettier-ignore
export function createKbEntryContract(input: M3Input): Record<string, unknown> { return { ...scoped(input, "kb entry"), ...m3OptionalRecords(input, ["metadata"]), ...m3OptionalText(input, ["contentHash", "sourceRef"]), category: m3Text(input, "category", "kb entry category"), entryKey: m3Text(input, "entryKey", "kb entry key"), id: requireUuid(input.id, "kb entry id"), status: m3Enum(input, "status", m3RecordStatuses, "kb entry status"), title: m3Text(input, "title", "kb entry title"), version: m3Int(input, "version", 1) }; }
// prettier-ignore
export function createKbStageContract(input: M3Input): Record<string, unknown> { return { ...scoped(input, "kb stage"), id: requireUuid(input.id, "kb stage id"), kbEntryId: m3Uuid(input, "kbEntryId", "kb stage kbEntryId"), materialRefs: m3Record(input, "materialRefs", "kb stage materialRefs"), sequence: m3Int(input, "sequence", 0), stageKey: m3Text(input, "stageKey", "kb stage key"), status: m3Enum(input, "status", m3RecordStatuses, "kb stage status"), title: m3Text(input, "title", "kb stage title") }; }
// prettier-ignore
export function createMediaAssetContract(input: M3Input): Record<string, unknown> { return { ...scoped(input, "media asset"), ...m3OptionalRecords(input, ["metadata"]), ...m3OptionalText(input, ["contentHash", "mimeType"]), assetKind: m3Text(input, "assetKind", "media asset kind"), id: requireUuid(input.id, "media asset id"), status: m3Enum(input, "status", m3RecordStatuses, "media asset status"), storageRef: m3Text(input, "storageRef", "media asset storageRef") }; }
// prettier-ignore
export function createQuoteRecordContract(input: M3Input): Record<string, unknown> { return { ...scoped(input, "quote"), ...m3OptionalText(input, ["currency", "validUntil"]), ...m3OptionalUuid(input, ["conversationId"]), ...m3OptionalInt(input, "totalMinorUnits", 0), ...m3QuoteConfigProvenance(input), id: requireUuid(input.id, "quote id"), inputRef: m3Record(input, "inputRef", "quote inputRef"), result: m3Record(input, "result", "quote result"), source: m3Enum(input, "source", quoteSources, "quote source"), status: m3Enum(input, "status", quoteRecordStatuses, "quote status") }; }
// prettier-ignore
export function createEvalCaseContract(input: M3Input): Record<string, unknown> { return { ...scoped(input, "eval case"), caseRef: m3Text(input, "caseRef", "eval case ref"), category: m3Enum(input, "category", evalCategories, "eval category"), id: requireUuid(input.id, "eval case id"), quotaWeight: m3Int(input, "quotaWeight", 1), redactedPayload: m3Record(input, "redactedPayload", "eval redactedPayload"), status: m3Enum(input, "status", m3RecordStatuses, "eval case status"), version: m3Int(input, "version", 1) }; }
// prettier-ignore
export function createEvalRunContract(input: M3Input): Record<string, unknown> { return { ...scoped(input, "eval run"), ...m3OptionalText(input, ["endedAt", "startedAt", "triggerRef"]), categoryQuotas: m3Record(input, "categoryQuotas", "eval categoryQuotas"), gateKey: m3Text(input, "gateKey", "eval gateKey"), id: requireUuid(input.id, "eval run id"), status: m3Enum(input, "status", evalRunStatuses, "eval run status") }; }
// prettier-ignore
export function createEvalResultContract(input: M3Input): Record<string, unknown> { return { ...scoped(input, "eval result"), ...m3OptionalRecords(input, ["redlineSummary"]), ...m3OptionalText(input, ["outputRef"]), ...m3OptionalInt(input, "score", 0, 100), category: m3Enum(input, "category", evalCategories, "eval category"), evalCaseId: m3Uuid(input, "evalCaseId", "eval result evalCaseId"), evalRunId: m3Uuid(input, "evalRunId", "eval result evalRunId"), id: requireUuid(input.id, "eval result id"), status: m3Enum(input, "status", evalResultStatuses, "eval result status") }; }
// prettier-ignore
export function createEvalGateContract(input: M3Input): Record<string, unknown> { return { ...scoped(input, "eval gate"), ...m3OptionalUuid(input, ["lastEvalRunId"]), categoryQuotas: m3Record(input, "categoryQuotas", "eval categoryQuotas"), gateKey: m3Text(input, "gateKey", "eval gateKey"), id: requireUuid(input.id, "eval gate id"), status: m3Enum(input, "status", evalGateStatuses, "eval gate status"), targetKind: m3Text(input, "targetKind", "eval gate targetKind"), targetRef: m3Text(input, "targetRef", "eval gate targetRef") }; }
// prettier-ignore
export function createLlmCallLogContract(input: M3Input): Record<string, unknown> { return { ...scoped(input, "llm call"), ...m3OptionalRecords(input, ["evalSummary", "fallbackSummary", "redactionMetadata", "redlineSummary"]), ...m3OptionalText(input, ["completionHash", "promptHash", "routeRef", "routeVersion", "traceId"]), costMicros: m3Int(input, "costMicros", 0), id: requireUuid(input.id, "llm call id"), inputTokenCount: m3Int(input, "inputTokenCount", 0), latencyMs: m3Int(input, "latencyMs", 0), modelId: m3Text(input, "modelId", "modelId"), outputTokenCount: m3Int(input, "outputTokenCount", 0), providerId: m3Text(input, "providerId", "providerId"), status: m3Enum(input, "status", llmCallStatuses, "llm call status"), task: m3Enum(input, "task", llmTasks, "llm task"), totalTokenCount: m3Int(input, "totalTokenCount", 0) }; }

function requireText(value: string | undefined, name: string): string {
  const trimmed = value?.trim();
  if (!trimmed) throw new Error(`${name} is required`);
  return trimmed;
}

function requireUuid(value: string | undefined, name: string): string {
  const text = requireText(value, name);
  if (!UUID_TEXT.test(text)) throw new Error(`${name} must be a UUID`);
  return text;
}

function requireEnumValue<T extends string>(
  value: string,
  source: Record<string, T>,
  name: string
): T {
  if (!Object.values(source).includes(value as T))
    throw new Error(`${name} is invalid`);
  return value as T;
}

function scoped(input: RlsTenantContext, name: string): RlsTenantContext {
  return {
    orgId: requireUuid(input.orgId, `${name} orgId`),
    tenantId: requireUuid(input.tenantId, `${name} tenantId`)
  };
}

function requireInteger(
  value: number,
  name: string,
  minimum: number,
  maximum = Number.MAX_SAFE_INTEGER
): number {
  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new Error(`${name} must be an integer from ${minimum} to ${maximum}`);
  }
  return value;
}

function requireBoolean(value: boolean, name: string): boolean {
  if (typeof value !== "boolean") throw new Error(`${name} must be a boolean`);
  return value;
}

function requireAuditContent(content: AuditLogContent): AuditLogContent {
  return {
    after: content.after === null ? null : requireRecord(content.after, "audit after"),
    before:
      content.before === null ? null : requireRecord(content.before, "audit before")
  };
}

function requireRecord(
  value: Record<string, unknown> | null | undefined,
  name: string
): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${name} must be an object`);
  }
  return value;
}

function values<const T extends readonly string[]>(
  ...items: T
): Readonly<Record<string, T[number]>> {
  return Object.fromEntries(items.map((item) => [camelKey(item), item]));
}

function customerRestoreFlagSnapshot(
  snapshot: CustomerAssetRestoreFlagSnapshot,
  name: string
): CustomerAssetRestoreFlagSnapshot {
  return {
    isBlacklisted: requireBoolean(snapshot.isBlacklisted, `${name} isBlacklisted`),
    isUnreachable: requireBoolean(snapshot.isUnreachable, `${name} isUnreachable`)
  };
}

function requireCustomerRestoreFlags(
  flags: readonly CustomerAssetRestoreFlag[]
): CustomerAssetRestoreFlag[] {
  const unique = [...new Set(flags)];
  if (unique.length === 0) throw new Error("customer restored flags are required");
  for (const flag of unique) {
    if (flag !== "blacklisted" && flag !== "unreachable") {
      throw new Error("customer restored flag is invalid");
    }
  }
  return unique;
}

function camelKey(value: string): string {
  return value.replace(/[_.]([a-z])/g, (_match, letter: string) =>
    letter.toUpperCase()
  );
}

// prettier-ignore
function optionalTextFields(input: object, keys: readonly string[]): Record<string, string> { return optionalFields(input, keys, requireText); }
// prettier-ignore
function optionalUuidFields(input: object, keys: readonly string[]): Record<string, string> { return optionalFields(input, keys, requireUuid); }
// prettier-ignore
function optionalFields(input: object, keys: readonly string[], validate: (value: string | undefined, name: string) => string): Record<string, string> { const source = input as Record<string, string | undefined>; return Object.fromEntries(keys.flatMap((key) => (source[key] ? [[key, validate(source[key], key)]] : []))); }

// prettier-ignore
function m3Text(input: M3Input, key: string, name = key): string { return requireText(input[key] as string | undefined, name); }
// prettier-ignore
function m3Uuid(input: M3Input, key: string, name = key): string { return requireUuid(input[key] as string | undefined, name); }
// prettier-ignore
function m3Record(input: M3Input, key: string, name = key): Record<string, unknown> { return requireRecord(input[key] as Record<string, unknown> | undefined, name); }
// prettier-ignore
function m3Int(input: M3Input, key: string, min: number, max = Number.MAX_SAFE_INTEGER): number { return requireInteger(input[key] as number, key, min, max); }
// prettier-ignore
function m3Enum<T extends string>(input: M3Input, key: string, source: Record<string, T>, name: string): T { return requireEnumValue(input[key] as string, source, name); }
// prettier-ignore
function m3OptionalText(input: M3Input, keys: readonly string[]): Record<string, string> { return optionalFields(input, keys, requireText); }
// prettier-ignore
function m3OptionalUuid(input: M3Input, keys: readonly string[]): Record<string, string> { return optionalFields(input, keys, requireUuid); }
// prettier-ignore
function m3OptionalRecords(input: M3Input, keys: readonly string[]): Record<string, Record<string, unknown>> { return Object.fromEntries(keys.flatMap((key) => (input[key] ? [[key, m3Record(input, key)]] : []))); }
// prettier-ignore
function m3OptionalInt(input: M3Input, key: string, min: number, max = Number.MAX_SAFE_INTEGER): Record<string, number> { return input[key] === undefined ? {} : { [key]: m3Int(input, key, min, max) }; }
// prettier-ignore
function m3QuoteConfigProvenance(input: M3Input): Record<string, string> { const fields = { ...m3OptionalText(input, ["configVersionRef"]), ...m3OptionalUuid(input, ["configVersionId"]) }; if (!fields.configVersionId && !fields.configVersionRef) throw new Error("quote config provenance requires configVersionId or configVersionRef"); return fields; }
