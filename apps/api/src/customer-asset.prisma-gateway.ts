import type { M4CustomerAssetContractInput } from "../../../packages/db/src/m4-customer-asset-contracts.ts";

import type {
  CustomerAssetPersistenceGateway,
  CustomerAssetPersistenceScope
} from "./customer-asset.persistence.ts";

type CustomerAssetPrismaFindManyDelegate = {
  findMany(args: {
    orderBy?: Record<string, unknown> | readonly Record<string, unknown>[];
    take?: number;
    where: Record<string, unknown>;
  }): Promise<readonly unknown[]>;
};
type CustomerAssetPrismaFindFirstDelegate = {
  findFirst(args: {
    orderBy?: Record<string, unknown>;
    where: Record<string, unknown>;
  }): Promise<unknown | null>;
};
type CustomerAssetPrismaUpdateDelegate = {
  update(args: {
    data: Record<string, unknown>;
    where: Record<string, unknown>;
  }): Promise<unknown>;
};

export type CustomerAssetPrismaClientPort = {
  customer: CustomerAssetPrismaFindManyDelegate &
    CustomerAssetPrismaFindFirstDelegate &
    CustomerAssetPrismaUpdateDelegate;
  customerFieldValue: CustomerAssetPrismaFindManyDelegate;
  customerIdentity: CustomerAssetPrismaFindManyDelegate;
  customFieldDefinition: CustomerAssetPrismaFindManyDelegate;
  tagAssignment: CustomerAssetPrismaFindManyDelegate;
  tagDefinition: CustomerAssetPrismaFindManyDelegate;
};

export class PrismaCustomerAssetPersistenceGateway implements CustomerAssetPersistenceGateway {
  constructor(private readonly prisma: CustomerAssetPrismaClientPort) {}

  listCustomers(scope: CustomerAssetPersistenceScope) {
    return this.prisma.customer.findMany({
      orderBy: { updatedAt: "desc" },
      take: 100,
      where: scope
    }) as Promise<readonly M4CustomerAssetContractInput[]>;
  }

  async getCustomer(scope: CustomerAssetPersistenceScope, customerId: string) {
    return nullableRow(
      (await this.prisma.customer.findFirst({
        where: { ...scope, id: customerId }
      })) as M4CustomerAssetContractInput | null
    );
  }

  listFieldDefinitions(scope: CustomerAssetPersistenceScope) {
    return this.prisma.customFieldDefinition.findMany({
      orderBy: { fieldKey: "asc" },
      where: scope
    }) as Promise<readonly M4CustomerAssetContractInput[]>;
  }

  listFieldValues(scope: CustomerAssetPersistenceScope, customerId: string) {
    return this.prisma.customerFieldValue.findMany({
      orderBy: { updatedAt: "desc" },
      where: { ...scope, customerId }
    }) as Promise<readonly M4CustomerAssetContractInput[]>;
  }

  listIdentities(scope: CustomerAssetPersistenceScope, customerId: string) {
    return this.prisma.customerIdentity.findMany({
      orderBy: { lastSeenAt: "desc" },
      where: { ...scope, customerId }
    }) as Promise<readonly M4CustomerAssetContractInput[]>;
  }

  listTagAssignments(scope: CustomerAssetPersistenceScope, customerId: string) {
    return this.prisma.tagAssignment.findMany({
      orderBy: { assignedAt: "desc" },
      where: { ...scope, customerId }
    }) as Promise<readonly M4CustomerAssetContractInput[]>;
  }

  listTagDefinitions(scope: CustomerAssetPersistenceScope) {
    return this.prisma.tagDefinition.findMany({
      orderBy: { tagKey: "asc" },
      where: { ...scope, targetKind: "CUSTOMER" }
    }) as Promise<readonly M4CustomerAssetContractInput[]>;
  }

  saveCustomer(
    scope: CustomerAssetPersistenceScope,
    customer: M4CustomerAssetContractInput
  ) {
    return this.prisma.customer.update({
      data: {
        blacklistedAt: nullable(customer.blacklistedAt),
        isBlacklisted: customer.isBlacklisted,
        isUnreachable: customer.isUnreachable,
        unreachableAt: nullable(customer.unreachableAt)
      },
      where: {
        id_orgId_tenantId: {
          id: requiredString(customer.id),
          orgId: scope.orgId,
          tenantId: scope.tenantId
        }
      }
    }) as Promise<M4CustomerAssetContractInput>;
  }
}

function nullableRow(
  row: M4CustomerAssetContractInput | null
): M4CustomerAssetContractInput | undefined {
  return row ?? undefined;
}

function nullable(value: unknown) {
  return value === undefined ? null : value;
}

function requiredString(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("customer persistence id is required");
  }
  return value;
}
