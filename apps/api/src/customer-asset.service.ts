import { Inject, Injectable } from "@nestjs/common";

import {
  assertPermission,
  type AccessContext
} from "../../../packages/authz/src/index.ts";
import {
  createCustomerAssetRestoreAuditContract,
  type CustomerAssetRestoreFlag
} from "../../../packages/db/src/index.ts";

import { API_AUDIT_SINK } from "./access-context.ts";
import type { AuditSink } from "./access-context-core.ts";
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
    private readonly repository: CustomerAssetRepositoryPort,
    @Inject(API_AUDIT_SINK)
    private readonly auditSink: AuditSink
  ) {}

  async listCustomers(accessContext: AccessContext, filters: CustomerAssetListFilters) {
    assertPermission(accessContext, "customer:read");
    return {
      items: (await this.repository.listCustomers(accessContext, filters)).map(
        customerSummary
      )
    };
  }

  async getCustomerDetail(accessContext: AccessContext, customerId: string) {
    assertPermission(accessContext, "customer:read");
    const customer = await this.requireCustomer(accessContext, customerId);
    return { item: await this.buildDetail(accessContext, customer) };
  }

  async listFieldDefinitions(accessContext: AccessContext) {
    assertPermission(accessContext, "customer:read");
    return { items: await this.repository.listFieldDefinitions(accessContext) };
  }

  async listTagDefinitions(accessContext: AccessContext) {
    assertPermission(accessContext, "customer:read");
    return { items: await this.repository.listTagDefinitions(accessContext) };
  }

  async restoreCustomerFlags(
    accessContext: AccessContext,
    customerId: string,
    input: CustomerAssetRestoreInput
  ) {
    assertPermission(accessContext, "customer:write");
    const customer = await this.requireCustomer(accessContext, customerId);
    const restoredFlags = restoreFlags(input, customer);
    if (restoredFlags.length === 0) {
      throw new CustomerAssetApiError(400, "restore flag is required");
    }
    const updated = await this.repository.saveCustomer({
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
    const auditEvent = createCustomerAssetRestoreAuditContract({
      actorUserId: accessContext.userId,
      after: customerFlagSnapshot(updated),
      before: customerFlagSnapshot(customer),
      customerId: updated.id,
      orgId: accessContext.orgId,
      reasonRef: input.reasonRef,
      restoredFlags,
      tenantId: accessContext.selectedTenantId
    });
    await this.auditSink.record(auditEvent);
    return {
      auditDraft: {
        ...auditEvent,
        customerId: updated.id,
        reasonRef: input.reasonRef,
        restoredFlags
      },
      item: customerSummary(updated)
    };
  }

  private async requireCustomer(accessContext: AccessContext, customerId: string) {
    const customer = await this.repository.getCustomer(accessContext, customerId);
    if (!customer) throw new CustomerAssetApiError(404, "customer not found");
    return customer;
  }

  private async buildDetail(
    accessContext: AccessContext,
    customer: CustomerAssetCustomer
  ) {
    const [fieldDefinitions, tagDefinitions, fieldValues, identities, tagAssignments] =
      await Promise.all([
        this.repository.listFieldDefinitions(accessContext),
        this.repository.listTagDefinitions(accessContext),
        this.repository.listFieldValues(accessContext, customer.id),
        this.repository.listIdentities(accessContext, customer.id),
        this.repository.listTagAssignments(accessContext, customer.id)
      ]);
    return {
      customer,
      fields: fieldValues.map((value) => ({
        ...value,
        definition: requireRelated(
          fieldDefinitions.find(
            (definition) => definition.id === value.fieldDefinitionId
          ),
          "field definition not found"
        )
      })),
      identities,
      relatedRefs: customer.relatedRefs ?? {},
      tags: tagAssignments.map((tag) => ({
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
): CustomerAssetRestoreFlag[] {
  return [
    input.restoreBlacklisted && customer.isBlacklisted ? "blacklisted" : undefined,
    input.restoreUnreachable && customer.isUnreachable ? "unreachable" : undefined
  ].filter((value): value is CustomerAssetRestoreFlag => value !== undefined);
}

function customerFlagSnapshot(customer: CustomerAssetCustomer) {
  return {
    isBlacklisted: customer.isBlacklisted,
    isUnreachable: customer.isUnreachable
  };
}

function requireRelated<T>(value: T | undefined, message: string): T {
  if (!value) throw new CustomerAssetApiError(404, message);
  return value;
}
