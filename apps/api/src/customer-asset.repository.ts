import type { AccessContext } from "../../../packages/authz/src/index.ts";

import type {
  CustomerAssetCustomer,
  CustomerAssetFieldDefinition,
  CustomerAssetFieldValue,
  CustomerAssetIdentity,
  CustomerAssetListFilters,
  CustomerAssetSeed,
  CustomerAssetTagAssignment,
  CustomerAssetTagDefinition
} from "./customer-asset.types.ts";

export const CUSTOMER_ASSET_REPOSITORY = Symbol("CUSTOMER_ASSET_REPOSITORY");

export type CustomerAssetRepositoryPort = {
  getCustomer(
    accessContext: AccessContext,
    customerId: string
  ): CustomerAssetCustomer | undefined;
  listCustomers(
    accessContext: AccessContext,
    filters: CustomerAssetListFilters
  ): CustomerAssetCustomer[];
  listFieldDefinitions(accessContext: AccessContext): CustomerAssetFieldDefinition[];
  listFieldValues(
    accessContext: AccessContext,
    customerId: string
  ): CustomerAssetFieldValue[];
  listIdentities(
    accessContext: AccessContext,
    customerId: string
  ): CustomerAssetIdentity[];
  listTagAssignments(
    accessContext: AccessContext,
    customerId: string
  ): CustomerAssetTagAssignment[];
  listTagDefinitions(accessContext: AccessContext): CustomerAssetTagDefinition[];
  saveCustomer(customer: CustomerAssetCustomer): CustomerAssetCustomer;
};

export class InMemoryCustomerAssetRepository implements CustomerAssetRepositoryPort {
  private customers: CustomerAssetCustomer[];
  private fieldDefinitions: CustomerAssetFieldDefinition[];
  private fieldValues: CustomerAssetFieldValue[];
  private identities: CustomerAssetIdentity[];
  private tagAssignments: CustomerAssetTagAssignment[];
  private tagDefinitions: CustomerAssetTagDefinition[];

  constructor(seed: CustomerAssetSeed = {}) {
    this.customers = [...(seed.customers ?? [])];
    this.fieldDefinitions = [...(seed.fieldDefinitions ?? [])];
    this.fieldValues = [...(seed.fieldValues ?? [])];
    this.identities = [...(seed.identities ?? [])];
    this.tagAssignments = [...(seed.tagAssignments ?? [])];
    this.tagDefinitions = [...(seed.tagDefinitions ?? [])];
  }

  getCustomer(accessContext: AccessContext, customerId: string) {
    return clone(
      scoped(this.customers, accessContext).find(
        (customer) => customer.id === customerId
      )
    );
  }

  listCustomers(accessContext: AccessContext, filters: CustomerAssetListFilters) {
    return scoped(this.customers, accessContext)
      .filter((customer) =>
        matchesFilters(customer, filters, this.tagAssignments, this.tagDefinitions)
      )
      .sort((left, right) => right.id.localeCompare(left.id))
      .map(clone);
  }

  listFieldDefinitions(accessContext: AccessContext) {
    return scoped(this.fieldDefinitions, accessContext).map(clone);
  }

  listFieldValues(accessContext: AccessContext, customerId: string) {
    return scoped(this.fieldValues, accessContext)
      .filter((value) => value.customerId === customerId)
      .map(clone);
  }

  listIdentities(accessContext: AccessContext, customerId: string) {
    return scoped(this.identities, accessContext)
      .filter((identity) => identity.customerId === customerId)
      .map(clone);
  }

  listTagAssignments(accessContext: AccessContext, customerId: string) {
    return scoped(this.tagAssignments, accessContext)
      .filter((assignment) => assignment.customerId === customerId)
      .map(clone);
  }

  listTagDefinitions(accessContext: AccessContext) {
    return scoped(this.tagDefinitions, accessContext).map(clone);
  }

  saveCustomer(customer: CustomerAssetCustomer) {
    this.customers = this.customers.map((candidate) =>
      candidate.id === customer.id &&
      candidate.orgId === customer.orgId &&
      candidate.tenantId === customer.tenantId
        ? clone(customer)
        : candidate
    );
    return clone(customer);
  }
}

function matchesFilters(
  customer: CustomerAssetCustomer,
  filters: CustomerAssetListFilters,
  assignments: readonly CustomerAssetTagAssignment[],
  definitions: readonly CustomerAssetTagDefinition[]
) {
  if (filters.flag === "blacklisted" && !customer.isBlacklisted) return false;
  if (filters.flag === "unreachable" && !customer.isUnreachable) return false;
  if (!filters.tagKey) return true;
  const definition = definitions.find((tag) => tag.tagKey === filters.tagKey);
  return assignments.some(
    (assignment) =>
      assignment.customerId === customer.id &&
      assignment.tagDefinitionId === definition?.id
  );
}

function scoped<T extends { orgId: string; tenantId: string }>(
  items: readonly T[],
  accessContext: AccessContext
): T[] {
  return items.filter(
    (item) =>
      item.orgId === accessContext.orgId &&
      item.tenantId === accessContext.selectedTenantId
  );
}

function clone<T>(value: T): T {
  return structuredClone(value);
}
