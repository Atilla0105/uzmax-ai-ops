import type { AccessContext } from "../../../packages/authz/src/index.ts";
import type { M4CustomerAssetContractInput } from "../../../packages/db/src/m4-customer-asset-contracts.ts";

import {
  matchesCustomerAssetFilters,
  type CustomerAssetRepositoryPort
} from "./customer-asset.repository.ts";
import type {
  CustomerAssetCustomer,
  CustomerAssetFieldDefinition,
  CustomerAssetFieldValue,
  CustomerAssetIdentity,
  CustomerAssetListFilters,
  CustomerAssetTagAssignment,
  CustomerAssetTagDefinition
} from "./customer-asset.types.ts";

type MaybePromise<T> = T | Promise<T>;
type CustomerAssetPersistenceRow = M4CustomerAssetContractInput;

export type CustomerAssetPersistenceScope = {
  orgId: string;
  tenantId: string;
};

export type CustomerAssetPersistenceGateway = {
  getCustomer(
    scope: CustomerAssetPersistenceScope,
    customerId: string
  ): MaybePromise<CustomerAssetPersistenceRow | undefined>;
  listCustomers(
    scope: CustomerAssetPersistenceScope
  ): MaybePromise<readonly CustomerAssetPersistenceRow[]>;
  listFieldDefinitions(
    scope: CustomerAssetPersistenceScope
  ): MaybePromise<readonly CustomerAssetPersistenceRow[]>;
  listFieldValues(
    scope: CustomerAssetPersistenceScope,
    customerId: string
  ): MaybePromise<readonly CustomerAssetPersistenceRow[]>;
  listIdentities(
    scope: CustomerAssetPersistenceScope,
    customerId: string
  ): MaybePromise<readonly CustomerAssetPersistenceRow[]>;
  listTagAssignments(
    scope: CustomerAssetPersistenceScope,
    customerId: string
  ): MaybePromise<readonly CustomerAssetPersistenceRow[]>;
  listTagDefinitions(
    scope: CustomerAssetPersistenceScope
  ): MaybePromise<readonly CustomerAssetPersistenceRow[]>;
  saveCustomer(
    scope: CustomerAssetPersistenceScope,
    customer: CustomerAssetPersistenceRow
  ): MaybePromise<CustomerAssetPersistenceRow>;
};

export class PersistenceCustomerAssetRepository implements CustomerAssetRepositoryPort {
  constructor(private readonly gateway: CustomerAssetPersistenceGateway) {}

  async getCustomer(accessContext: AccessContext, customerId: string) {
    const scope = scopeFor(accessContext);
    const row = await this.gateway.getCustomer(scope, customerId);
    return row ? mapCustomer(row, scope)[0] : undefined;
  }

  async listCustomers(accessContext: AccessContext, filters: CustomerAssetListFilters) {
    const scope = scopeFor(accessContext);
    const rows = await this.gateway.listCustomers(scope);
    const customers = rows
      .flatMap((row) => mapCustomer(row, scope))
      .sort((left, right) => right.id.localeCompare(left.id));
    if (!filters.tagKey) {
      return customers.filter((customer) =>
        matchesCustomerAssetFilters(customer, filters, [], [])
      );
    }

    const [tagDefinitions, tagAssignments] = await Promise.all([
      this.listTagDefinitions(accessContext),
      listAssignmentsForCustomers(this.gateway, scope, customers)
    ]);
    return customers.filter((customer) =>
      matchesCustomerAssetFilters(customer, filters, tagAssignments, tagDefinitions)
    );
  }

  async listFieldDefinitions(accessContext: AccessContext) {
    const scope = scopeFor(accessContext);
    const rows = await this.gateway.listFieldDefinitions(scope);
    return rows.flatMap((row) => mapFieldDefinition(row, scope));
  }

  async listFieldValues(accessContext: AccessContext, customerId: string) {
    const scope = scopeFor(accessContext);
    const rows = await this.gateway.listFieldValues(scope, customerId);
    return rows.flatMap((row) => mapFieldValue(row, scope));
  }

  async listIdentities(accessContext: AccessContext, customerId: string) {
    const scope = scopeFor(accessContext);
    const rows = await this.gateway.listIdentities(scope, customerId);
    return rows.flatMap((row) => mapIdentity(row, scope));
  }

  async listTagAssignments(accessContext: AccessContext, customerId: string) {
    const scope = scopeFor(accessContext);
    const rows = await this.gateway.listTagAssignments(scope, customerId);
    return rows.flatMap((row) => mapTagAssignment(row, scope));
  }

  async listTagDefinitions(accessContext: AccessContext) {
    const scope = scopeFor(accessContext);
    const rows = await this.gateway.listTagDefinitions(scope);
    return rows.flatMap((row) => mapTagDefinition(row, scope));
  }

  async saveCustomer(customer: CustomerAssetCustomer) {
    const scope = scopeFromCustomer(customer);
    const row = await this.gateway.saveCustomer(scope, toCustomerRow(customer));
    return requireMappedCustomer(row, scope);
  }
}

function scopeFor(accessContext: AccessContext): CustomerAssetPersistenceScope {
  return {
    orgId: accessContext.orgId,
    tenantId: accessContext.selectedTenantId
  };
}

function scopeFromCustomer(
  customer: CustomerAssetCustomer
): CustomerAssetPersistenceScope {
  return {
    orgId: customer.orgId,
    tenantId: customer.tenantId
  };
}

async function listAssignmentsForCustomers(
  gateway: CustomerAssetPersistenceGateway,
  scope: CustomerAssetPersistenceScope,
  customers: readonly CustomerAssetCustomer[]
) {
  const rows = await Promise.all(
    customers.map((customer) => gateway.listTagAssignments(scope, customer.id))
  );
  return rows.flat().flatMap((row) => mapTagAssignment(row, scope));
}

function mapCustomer(
  row: CustomerAssetPersistenceRow,
  scope: CustomerAssetPersistenceScope
): CustomerAssetCustomer[] {
  if (!matchesPersistenceScope(row, scope)) return [];
  return [
    {
      blacklistedAt: textOrUndefined(row.blacklistedAt),
      displayLabelRef: textOrUndefined(row.displayLabelRef),
      id: requiredText(row.id),
      isBlacklisted: booleanValue(row.isBlacklisted),
      isUnreachable: booleanValue(row.isUnreachable),
      journeyStage: textOrUndefined(row.journeyStage),
      orgId: requiredText(row.orgId),
      preferredLanguage: textOrUndefined(row.preferredLanguage),
      preferredScript: textOrUndefined(row.preferredScript),
      relatedRefs: relatedRefsValue(row.metadata),
      status: recordStatusValue(row.status),
      tenantId: requiredText(row.tenantId),
      unreachableAt: textOrUndefined(row.unreachableAt),
      unresolvedIssueCount: integerValue(row.unresolvedIssueCount)
    }
  ];
}

function mapFieldDefinition(
  row: CustomerAssetPersistenceRow,
  scope: CustomerAssetPersistenceScope
): CustomerAssetFieldDefinition[] {
  if (!matchesPersistenceScope(row, scope)) return [];
  return [
    {
      fieldKey: requiredText(row.fieldKey),
      id: requiredText(row.id),
      label: requiredText(row.label),
      orgId: requiredText(row.orgId),
      status: recordStatusValue(row.status),
      tenantId: requiredText(row.tenantId),
      valueType: fieldValueTypeValue(row.valueType)
    }
  ];
}

function mapFieldValue(
  row: CustomerAssetPersistenceRow,
  scope: CustomerAssetPersistenceScope
): CustomerAssetFieldValue[] {
  if (!matchesPersistenceScope(row, scope)) return [];
  return [
    {
      customerId: requiredText(row.customerId),
      fieldDefinitionId: requiredText(row.fieldDefinitionId),
      id: requiredText(row.id),
      orgId: requiredText(row.orgId),
      tenantId: requiredText(row.tenantId),
      value: objectRecord(row.value)
    }
  ];
}

function mapIdentity(
  row: CustomerAssetPersistenceRow,
  scope: CustomerAssetPersistenceScope
): CustomerAssetIdentity[] {
  if (!matchesPersistenceScope(row, scope)) return [];
  return [
    {
      channelConnectionId: textOrUndefined(row.channelConnectionId),
      customerId: requiredText(row.customerId),
      externalSubjectRef: requiredText(row.externalSubjectRef),
      id: requiredText(row.id),
      identityKind: requiredText(row.identityKind),
      orgId: requiredText(row.orgId),
      provider: requiredText(row.provider),
      status: identityStatusValue(row.status),
      tenantId: requiredText(row.tenantId)
    }
  ];
}

function mapTagDefinition(
  row: CustomerAssetPersistenceRow,
  scope: CustomerAssetPersistenceScope
): CustomerAssetTagDefinition[] {
  if (!matchesPersistenceScope(row, scope)) return [];
  return [
    {
      colorToken: textOrUndefined(row.colorToken),
      id: requiredText(row.id),
      label: requiredText(row.label),
      orgId: requiredText(row.orgId),
      status: recordStatusValue(row.status),
      tagKey: requiredText(row.tagKey),
      targetKind: tagTargetKindValue(row.targetKind),
      tenantId: requiredText(row.tenantId)
    }
  ];
}

function mapTagAssignment(
  row: CustomerAssetPersistenceRow,
  scope: CustomerAssetPersistenceScope
): CustomerAssetTagAssignment[] {
  if (!matchesPersistenceScope(row, scope)) return [];
  return [
    {
      customerId: requiredText(row.customerId),
      id: requiredText(row.id),
      orgId: requiredText(row.orgId),
      tagDefinitionId: requiredText(row.tagDefinitionId),
      tenantId: requiredText(row.tenantId)
    }
  ];
}

function requireMappedCustomer(
  row: CustomerAssetPersistenceRow,
  scope: CustomerAssetPersistenceScope
) {
  const customer = mapCustomer(row, scope)[0];
  if (!customer) throw new Error("saved customer persistence row is out of scope");
  return customer;
}

function toCustomerRow(customer: CustomerAssetCustomer): CustomerAssetPersistenceRow {
  return {
    blacklistedAt: customer.blacklistedAt,
    displayLabelRef: customer.displayLabelRef,
    id: customer.id,
    isBlacklisted: customer.isBlacklisted,
    isUnreachable: customer.isUnreachable,
    journeyStage: customer.journeyStage,
    metadata: { relatedRefs: customer.relatedRefs ?? {} },
    orgId: customer.orgId,
    preferredLanguage: customer.preferredLanguage,
    preferredScript: customer.preferredScript,
    status: customer.status,
    tenantId: customer.tenantId,
    unreachableAt: customer.unreachableAt,
    unresolvedIssueCount: customer.unresolvedIssueCount
  };
}

function matchesPersistenceScope(
  row: CustomerAssetPersistenceRow,
  scope: CustomerAssetPersistenceScope
) {
  return row.orgId === scope.orgId && row.tenantId === scope.tenantId;
}

function textOrUndefined(value: unknown): string | undefined {
  if (value == null) return undefined;
  return requiredText(value);
}

function requiredText(value: unknown): string {
  const text =
    value instanceof Date
      ? value.toISOString()
      : typeof value === "string"
        ? value.trim()
        : "";
  if (!text) throw new Error("row value required");
  return text;
}

function booleanValue(value: unknown): boolean {
  if (typeof value !== "boolean") throw new Error("row boolean value required");
  return value;
}

function integerValue(value: unknown): number {
  if (!Number.isInteger(value)) throw new Error("row number value required");
  return value as number;
}

function objectRecord(value: unknown): Record<string, unknown> {
  const isRecord = Boolean(value) && typeof value === "object" && !Array.isArray(value);
  if (isRecord) return value as Record<string, unknown>;
  throw new Error("row record value required");
}

function optionalRecord(value: unknown): Record<string, unknown> | undefined {
  if (value == null) return undefined;
  return objectRecord(value);
}

function recordStatusValue(value: unknown): "active" | "archived" {
  const status = requiredText(value).toLowerCase();
  if (status === "active" || status === "archived") return status;
  throw new Error("customer asset record status is invalid");
}

function identityStatusValue(value: unknown): "active" | "archived" | "merged" {
  const status = requiredText(value).toLowerCase();
  if (status === "active" || status === "archived" || status === "merged") {
    return status;
  }
  throw new Error("customer identity status is invalid");
}

function fieldValueTypeValue(
  value: unknown
): "boolean" | "date" | "json" | "number" | "text" {
  const valueType = requiredText(value).toLowerCase();
  if (
    valueType === "boolean" ||
    valueType === "date" ||
    valueType === "json" ||
    valueType === "number" ||
    valueType === "text"
  ) {
    return valueType;
  }
  throw new Error("customer field valueType is invalid");
}

function tagTargetKindValue(value: unknown): "customer" {
  const targetKind = requiredText(value).toLowerCase();
  if (targetKind === "customer") return targetKind;
  throw new Error("customer tag targetKind is invalid");
}

function relatedRefsValue(
  metadata: unknown
): CustomerAssetCustomer["relatedRefs"] | undefined {
  const relatedRefs = optionalRecord(metadata)?.relatedRefs;
  if (relatedRefs === undefined) return undefined;
  const record = objectRecord(relatedRefs);
  const output: Record<string, readonly string[]> = {};
  for (const key of [
    "conversationRefs",
    "orderSnapshotRefs",
    "quoteRecordRefs",
    "ticketRefs"
  ]) {
    const value = record[key];
    if (value === undefined) continue;
    if (!Array.isArray(value)) throw new Error(`${key} must be an array`);
    output[key] = value.map(requiredText);
  }
  return Object.keys(output).length
    ? (output as CustomerAssetCustomer["relatedRefs"])
    : undefined;
}
