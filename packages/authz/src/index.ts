export type MembershipStatus = "active" | "revoked";

export type TenantMembership = {
  cacheVersion: number;
  orgId: string;
  role: string;
  status: MembershipStatus;
  tenantId: string;
  userId: string;
};

export type PermissionGrant = {
  orgId: string;
  permission: string;
  tenantId: string;
  userId: string;
};

export type AccessContext = {
  membershipVersion: number;
  orgId: string;
  permissions: string[];
  selectedTenantId: string;
  tenantIds: string[];
  userId: string;
};

export type AccessContextRequest = {
  selectedTenantId: string;
  userId: string;
};

export type AccessContextFacts = {
  permissionGrants: readonly PermissionGrant[];
  tenantMemberships: readonly TenantMembership[];
};

export type AuthzRepository = {
  /** Implementations must read memberships and grants in one consistent snapshot. */
  loadAccessContextFacts(request: AccessContextRequest): Promise<AccessContextFacts>;
};

export type AuthzErrorCode = "permission_facts_mismatch" | "tenant_access_denied";

export class AuthzError extends Error {
  constructor(
    readonly code: AuthzErrorCode,
    message: string
  ) {
    super(message);
    this.name = "AuthzError";
  }
}

export async function resolveAccessContext(
  repository: AuthzRepository,
  request: AccessContextRequest
): Promise<AccessContext> {
  const facts = await repository.loadAccessContextFacts(request);
  return buildAccessContext(request, facts);
}

export function buildAccessContext(
  request: AccessContextRequest,
  facts: AccessContextFacts
): AccessContext {
  const activeMemberships = facts.tenantMemberships
    .filter((membership) => isActiveMembershipForUser(membership, request.userId))
    .sort(compareMemberships);
  const selected = activeMemberships.find((membership) => {
    return membership.tenantId === request.selectedTenantId;
  });

  if (!selected) {
    throw new AuthzError("tenant_access_denied", "tenant membership is not active");
  }

  return {
    membershipVersion: selected.cacheVersion,
    orgId: selected.orgId,
    permissions: permissionsForSelection(request, selected, facts.permissionGrants),
    selectedTenantId: selected.tenantId,
    tenantIds: tenantIdsForOrg(activeMemberships, selected.orgId),
    userId: request.userId
  };
}

export function hasPermission(context: AccessContext, permission: string): boolean {
  return context.permissions.includes(permission);
}

export function assertTenantSelected(
  context: AccessContext,
  tenantId: string
): AccessContext {
  if (context.selectedTenantId !== tenantId) {
    throw new AuthzError("tenant_access_denied", "tenant is outside access context");
  }

  return context;
}

function isActiveMembershipForUser(
  membership: TenantMembership,
  userId: string
): boolean {
  return membership.userId === userId && membership.status === "active";
}

function permissionsForSelection(
  request: AccessContextRequest,
  selected: TenantMembership,
  grants: readonly PermissionGrant[]
): string[] {
  const selectedGrants = grants.filter((grant) => {
    return (
      grant.userId === request.userId &&
      grant.orgId === selected.orgId &&
      grant.tenantId === selected.tenantId
    );
  });

  if (selectedGrants.length !== grants.length) {
    throw new AuthzError(
      "permission_facts_mismatch",
      "permission grants must match selected tenant membership"
    );
  }

  return [...new Set(selectedGrants.map((grant) => grant.permission))].sort();
}

function tenantIdsForOrg(
  memberships: readonly TenantMembership[],
  selectedOrgId: string
): string[] {
  return [
    ...new Set(
      memberships
        .filter((membership) => membership.orgId === selectedOrgId)
        .map((membership) => membership.tenantId)
    )
  ].sort();
}

function compareMemberships(left: TenantMembership, right: TenantMembership): number {
  return left.tenantId.localeCompare(right.tenantId);
}
