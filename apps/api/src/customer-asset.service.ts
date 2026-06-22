import { Inject, Injectable } from "@nestjs/common";

import {
  assertPermission,
  type AccessContext
} from "../../../packages/authz/src/index.ts";

import {
  CUSTOMER_ASSET_REPOSITORY,
  type CustomerAssetRepositoryPort
} from "./customer-asset.repository.ts";
import {
  CustomerAssetApiError,
  type CustomerAssetCustomer,
  type CustomerAssetListFilters,
  type CustomerAssetRestoreInput
} from "./customer-asset.types.ts";

@Injectable()
export class CustomerAssetService {
  constructor(
    @Inject(CUSTOMER_ASSET_REPOSITORY)
    private readonly repository: CustomerAssetRepositoryPort
  ) {}

  listCustomers(accessContext: AccessContext, filters: CustomerAssetListFilters) {
    assertPermission(accessContext, "customer:read");
    return {
      items: this.repository.listCustomers(accessContext, filters).map(customerSummary)
    };
  }

  getCustomerDetail(accessContext: AccessContext, customerId: string) {
    assertPermission(accessContext, "customer:read");
    const customer = this.requireCustomer(accessContext, customerId);
    return { item: this.buildDetail(accessContext, customer) };
  }

  listFieldDefinitions(accessContext: AccessContext) {
    assertPermission(accessContext, "customer:read");
    return { items: this.repository.listFieldDefinitions(accessContext) };
  }

  listTagDefinitions(accessContext: AccessContext) {
    assertPermission(accessContext, "customer:read");
    return { items: this.repository.listTagDefinitions(accessContext) };
  }

  restoreCustomerFlags(
    accessContext: AccessContext,
    customerId: string,
    input: CustomerAssetRestoreInput
  ) {
    assertPermission(accessContext, "customer:write");
    const customer = this.requireCustomer(accessContext, customerId);
    const restoredFlags = restoreFlags(input, customer);
    if (restoredFlags.length === 0) {
      throw new CustomerAssetApiError(400, "restore flag is required");
    }
    const updated = this.repository.saveCustomer({
      ...customer,
      blacklistedAt: restoredFlags.includes("blacklisted")
        ? undefined
        : customer.blacklistedAt,
      isBlacklisted: restoredFlags.includes("blacklisted")
        ? false
        : customer.isBlacklisted,
      isUnreachable: restoredFlags.includes("unreachable")
        ? false
        : customer.isUnreachable,
      unreachableAt: restoredFlags.includes("unreachable")
        ? undefined
        : customer.unreachableAt
    });
    return {
      auditDraft: auditDraft(accessContext, updated.id, input.reasonRef, restoredFlags),
      item: customerSummary(updated)
    };
  }

  private requireCustomer(accessContext: AccessContext, customerId: string) {
    const customer = this.repository.getCustomer(accessContext, customerId);
    if (!customer) throw new CustomerAssetApiError(404, "customer not found");
    return customer;
  }

  private buildDetail(accessContext: AccessContext, customer: CustomerAssetCustomer) {
    const fieldDefinitions = this.repository.listFieldDefinitions(accessContext);
    const tagDefinitions = this.repository.listTagDefinitions(accessContext);
    return {
      customer,
      fields: this.repository
        .listFieldValues(accessContext, customer.id)
        .map((value) => ({
          ...value,
          definition: requireRelated(
            fieldDefinitions.find(
              (definition) => definition.id === value.fieldDefinitionId
            ),
            "field definition not found"
          )
        })),
      identities: this.repository.listIdentities(accessContext, customer.id),
      relatedRefs: customer.relatedRefs ?? {},
      tags: this.repository
        .listTagAssignments(accessContext, customer.id)
        .map((tag) => ({
          ...tag,
          definition: requireRelated(
            tagDefinitions.find((definition) => definition.id === tag.tagDefinitionId),
            "tag definition not found"
          )
        }))
    };
  }
}

function customerSummary(customer: CustomerAssetCustomer) {
  return {
    displayLabelRef: customer.displayLabelRef,
    id: customer.id,
    isBlacklisted: customer.isBlacklisted,
    isUnreachable: customer.isUnreachable,
    journeyStage: customer.journeyStage,
    preferredLanguage: customer.preferredLanguage,
    preferredScript: customer.preferredScript,
    relatedRefs: customer.relatedRefs ?? {},
    status: customer.status,
    unresolvedIssueCount: customer.unresolvedIssueCount
  };
}

function restoreFlags(
  input: CustomerAssetRestoreInput,
  customer: CustomerAssetCustomer
): ("blacklisted" | "unreachable")[] {
  return [
    input.restoreBlacklisted && customer.isBlacklisted ? "blacklisted" : undefined,
    input.restoreUnreachable && customer.isUnreachable ? "unreachable" : undefined
  ].filter((value): value is "blacklisted" | "unreachable" => value !== undefined);
}

function auditDraft(
  accessContext: AccessContext,
  customerId: string,
  reasonRef: string,
  restoredFlags: readonly ("blacklisted" | "unreachable")[]
) {
  return {
    action: "customer_restore_flags",
    actorUserId: accessContext.userId,
    customerId,
    reasonRef,
    restoredFlags
  };
}

function requireRelated<T>(value: T | undefined, message: string): T {
  if (!value) throw new CustomerAssetApiError(404, message);
  return value;
}
