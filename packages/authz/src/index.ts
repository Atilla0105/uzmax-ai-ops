export type MembershipStatus = "active" | "revoked";

export type TenantMembership = {
  cacheVersion: number;
  orgId: string;
  status: MembershipStatus;
  tenantId: string;
};

export type PermissionGrant = {
  permission: string;
  tenantId: string;
};

export type AccessContext = {
  membershipVersion: number;
  orgId: string;
  permissions: string[];
  selectedTenantId: string;
  tenantIds: string[];
  userId: string;
};
