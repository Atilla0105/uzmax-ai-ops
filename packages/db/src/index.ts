export const packageName = "@uzmax/db";

const ROLE_IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_.-]*$/;

export const platformTableNames = {
  org: "org",
  tenant: "tenant",
  orgMember: "org_member",
  tenantMember: "tenant_member",
  permissionGrant: "permission_grant"
} as const;

export const rlsContextKeys = {
  orgId: "app.org_id",
  tenantId: "app.tenant_id"
} as const;

export const platformRuntimeRole = "uzmax_app_runtime";

export type RlsTenantContext = {
  orgId: string;
  tenantId: string;
};

export type RlsContextSetting = {
  key: (typeof rlsContextKeys)[keyof typeof rlsContextKeys];
  value: string;
};

export type RlsTransactionContext = {
  roleSql: string;
  settings: readonly RlsContextSetting[];
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
