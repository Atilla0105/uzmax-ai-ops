export const packageName = "@uzmax/db";

const ROLE_IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_.-]*$/;
const UUID_TEXT =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const platformTableNames = {
  org: "org",
  tenant: "tenant",
  orgMember: "org_member",
  tenantMember: "tenant_member",
  permissionGrant: "permission_grant"
} as const;

export const governanceTableNames = {
  auditLog: "audit_log",
  configVersion: "config_version"
} as const;

export const auditEventTypes = {
  accessContextDenied: "access_context.denied",
  configVersionRollbackRequested: "config_version.rollback_requested",
  configVersionSaved: "config_version.saved",
  permissionGrantChanged: "permission_grant.changed",
  tenantSwitchAllowed: "tenant_switch.allowed",
  tenantSwitchDenied: "tenant_switch.denied"
} as const;

export const configVersionDomains = {
  businessConfig: "business_config",
  featureFlag: "feature_flag",
  templateCopy: "template_copy"
} as const;

export const configVersionStatuses = {
  active: "active",
  archived: "archived",
  draft: "draft",
  rolledBack: "rolled_back"
} as const;

export const rlsContextKeys = {
  orgId: "app.org_id",
  tenantId: "app.tenant_id"
} as const;

export const platformRuntimeRole = "uzmax_app_runtime";

export type RlsTenantContext = { orgId: string; tenantId: string };

export type RlsContextSetting = {
  key: (typeof rlsContextKeys)[keyof typeof rlsContextKeys];
  value: string;
};

export type RlsTransactionContext = {
  roleSql: string;
  settings: readonly RlsContextSetting[];
};

export type AuditEventType = (typeof auditEventTypes)[keyof typeof auditEventTypes];

export type ConfigVersionDomain =
  (typeof configVersionDomains)[keyof typeof configVersionDomains];

export type ConfigVersionStatus =
  (typeof configVersionStatuses)[keyof typeof configVersionStatuses];

export type AuditLogContent = {
  after: Record<string, unknown> | null;
  before: Record<string, unknown> | null;
};

export type AuditLogContract = {
  action: string;
  actorUserId: string;
  afterVersionId?: string;
  beforeVersionId?: string;
  content: AuditLogContent;
  eventType: AuditEventType;
  module: string;
  objectId?: string;
  objectType: string;
  occurredAt: string;
  orgId: string;
  tenantId: string;
  traceId?: string;
};

export type ConfigVersionContract = {
  activatedAt?: string;
  createdAt: string;
  createdByUserId: string;
  domain: ConfigVersionDomain;
  id: string;
  key: string;
  orgId: string;
  payload: Record<string, unknown>;
  previousVersionId?: string;
  reason?: string;
  rollbackOfVersionId?: string;
  status: ConfigVersionStatus;
  tenantId: string;
  version: number;
};

export type ConfigVersionAuditInput = {
  action: "rollback_requested" | "save";
  actorUserId: string;
  beforeVersionId?: string;
  configVersion: ConfigVersionContract;
  eventType:
    | typeof auditEventTypes.configVersionRollbackRequested
    | typeof auditEventTypes.configVersionSaved;
  orgId: string;
  tenantId: string;
  traceId?: string;
};

export type ConfigVersionDraftInput = Omit<
  ConfigVersionContract,
  "createdAt" | "createdByUserId" | "id" | "orgId" | "tenantId"
> & {
  versionId: string;
};

export type PermissionGrantAuditInput = {
  actorUserId: string;
  after: Record<string, unknown>;
  before: Record<string, unknown>;
  orgId: string;
  permission: string;
  targetUserId: string;
  tenantId: string;
  traceId?: string;
};

export type TenantSwitchAuditInput = {
  actorUserId: string;
  membershipVersion?: number;
  orgId: string;
  reason?: string;
  targetTenantId?: string;
  tenantId: string;
};

export function assertSafeDatabaseRole(role: string): string {
  if (!ROLE_IDENTIFIER.test(role)) {
    throw new Error(`Unsafe database role identifier: ${role}`);
  }

  return role;
}

export function quoteDatabaseIdentifier(identifier: string): string {
  const safeIdentifier = assertSafeDatabaseRole(identifier);
  return `"${safeIdentifier.replaceAll('"', '""')}"`;
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
    action: requireText(input.action, "audit action"),
    actorUserId: requireUuid(input.actorUserId, "audit actorUserId"),
    ...(input.afterVersionId
      ? { afterVersionId: requireUuid(input.afterVersionId, "afterVersionId") }
      : {}),
    ...(input.beforeVersionId
      ? { beforeVersionId: requireUuid(input.beforeVersionId, "beforeVersionId") }
      : {}),
    content: requireAuditContent(input.content),
    eventType: requireAllowedValue<AuditEventType>(
      input.eventType,
      Object.values(auditEventTypes),
      "audit eventType"
    ),
    module: requireText(input.module, "audit module"),
    ...(input.objectId ? { objectId: requireText(input.objectId, "objectId") } : {}),
    objectType: requireText(input.objectType, "audit objectType"),
    occurredAt: input.occurredAt || new Date().toISOString(),
    orgId: requireUuid(input.orgId, "audit orgId"),
    tenantId: requireUuid(input.tenantId, "audit tenantId"),
    ...(input.traceId ? { traceId: requireText(input.traceId, "traceId") } : {})
  };
}

export function createConfigVersionContract(
  input: ConfigVersionContract
): ConfigVersionContract {
  return {
    ...(input.activatedAt ? { activatedAt: input.activatedAt } : {}),
    createdAt: input.createdAt || new Date().toISOString(),
    createdByUserId: requireUuid(input.createdByUserId, "createdByUserId"),
    domain: requireAllowedValue<ConfigVersionDomain>(
      input.domain,
      Object.values(configVersionDomains),
      "config version domain"
    ),
    id: requireUuid(input.id, "config version id"),
    key: requireText(input.key, "config key"),
    orgId: requireUuid(input.orgId, "config orgId"),
    payload: requireRecord(input.payload, "config payload"),
    ...(input.previousVersionId
      ? { previousVersionId: requireUuid(input.previousVersionId, "previousVersionId") }
      : {}),
    ...(input.reason ? { reason: requireText(input.reason, "reason") } : {}),
    ...(input.rollbackOfVersionId
      ? {
          rollbackOfVersionId: requireUuid(
            input.rollbackOfVersionId,
            "rollbackOfVersionId"
          )
        }
      : {}),
    status: requireAllowedValue<ConfigVersionStatus>(
      input.status,
      Object.values(configVersionStatuses),
      "config version status"
    ),
    tenantId: requireUuid(input.tenantId, "config tenantId"),
    version: requirePositiveInteger(input.version, "config version")
  };
}

export function createConfigVersionAuditContract(
  input: ConfigVersionAuditInput
): AuditLogContract {
  return createAuditLogContract({
    action: input.action,
    actorUserId: input.actorUserId,
    ...(input.beforeVersionId ? { beforeVersionId: input.beforeVersionId } : {}),
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
    ...(input.traceId ? { traceId: input.traceId } : {})
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
    ...(input.traceId ? { traceId: input.traceId } : {})
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

function requireText(value: string | undefined, name: string): string {
  const trimmed = value?.trim();
  if (!trimmed) {
    throw new Error(`${name} is required`);
  }

  return trimmed;
}

function requireUuid(value: string | undefined, name: string): string {
  const text = requireText(value, name);
  if (!UUID_TEXT.test(text)) {
    throw new Error(`${name} must be a UUID`);
  }

  return text;
}

function requireAllowedValue<T extends string>(
  value: string,
  allowed: readonly T[],
  name: string
): T {
  if (!allowed.includes(value as T)) {
    throw new Error(`${name} is invalid`);
  }

  return value as T;
}

function requirePositiveInteger(value: number, name: string): number {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }

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
