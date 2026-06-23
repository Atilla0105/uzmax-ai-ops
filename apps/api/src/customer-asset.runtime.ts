import { createRlsTransactionContext } from "../../../packages/db/src/index.ts";

import type { ApiAuditEvent, AuditSink } from "./access-context-core.ts";
import {
  toPrismaAuditLogCreateData,
  type AuditLogPrismaClientPort
} from "./audit-log.prisma-sink.ts";
import {
  InMemoryCustomerAssetRepository,
  type CustomerAssetRepositoryPort
} from "./customer-asset.repository.ts";
import {
  PrismaCustomerAssetPersistenceGateway,
  type CustomerAssetPrismaClientPort
} from "./customer-asset.prisma-gateway.ts";
import {
  PersistenceCustomerAssetRepository,
  type CustomerAssetPersistenceScope
} from "./customer-asset.persistence.ts";

type MaybePromise<T> = T | Promise<T>;
type PrismaBatchOperation<T = unknown> = MaybePromise<T>;
type PrismaRawTag = (
  strings: TemplateStringsArray,
  ...values: readonly unknown[]
) => PrismaBatchOperation;
type PrismaDelegateName = keyof CustomerAssetPrismaClientPort;
type PrismaDelegateMethod = "findFirst" | "findMany" | "update";

export type CustomerAssetRuntimePrismaClientPort = CustomerAssetPrismaClientPort &
  AuditLogPrismaClientPort & {
    $executeRawUnsafe(sql: string): PrismaBatchOperation;
    $queryRaw: PrismaRawTag;
    $transaction<T extends readonly PrismaBatchOperation[]>(
      operations: T
    ): Promise<{ [K in keyof T]: Awaited<T[K]> }>;
  };

type CustomerAssetRlsTransactionInput<T, Operation = PrismaBatchOperation<T>> = {
  mapResult?(result: Awaited<Operation>): T;
  query(client: CustomerAssetRuntimePrismaClientPort): Operation;
  scope: CustomerAssetPersistenceScope;
};

export type CustomerAssetRlsTransactionRunner = <
  T,
  Operation = PrismaBatchOperation<T>
>(
  input: CustomerAssetRlsTransactionInput<T, Operation>
) => Promise<T>;

export const customerAssetRuntimeModes = {
  inMemory: "in_memory",
  rlsPrismaGateway: "rls_prisma_gateway"
} as const;
type CustomerAssetRuntimeMode =
  (typeof customerAssetRuntimeModes)[keyof typeof customerAssetRuntimeModes];

export type CustomerAssetRuntimeProviderInput = {
  inMemoryRepository?: CustomerAssetRepositoryPort;
  mode?: CustomerAssetRuntimeMode;
  prismaClient?: CustomerAssetRuntimePrismaClientPort;
  rlsTransactionRunner?: CustomerAssetRlsTransactionRunner;
};

export function createCustomerAssetRepositoryProvider(
  input: CustomerAssetRuntimeProviderInput = {}
): CustomerAssetRepositoryPort {
  const mode = input.mode ?? customerAssetRuntimeModes.inMemory;
  if (mode === customerAssetRuntimeModes.inMemory) {
    return input.inMemoryRepository ?? new InMemoryCustomerAssetRepository();
  }
  if (mode === customerAssetRuntimeModes.rlsPrismaGateway) {
    const runner =
      input.rlsTransactionRunner ??
      createCustomerAssetRlsBatchTransactionRunner(
        requireRuntimePrismaClient(input.prismaClient)
      );
    return new PersistenceCustomerAssetRepository(
      new RlsCustomerAssetPersistenceGateway(runner)
    );
  }
  throw new Error(`unsupported customer asset runtime mode: ${String(mode)}`);
}

export function createCustomerAssetAuditSinkProvider(
  input: CustomerAssetRuntimeProviderInput = {}
): AuditSink {
  const runner =
    input.rlsTransactionRunner ??
    createCustomerAssetRlsBatchTransactionRunner(
      requireRuntimePrismaClient(input.prismaClient)
    );
  return new RlsPrismaAuditSink(runner);
}

export function createCustomerAssetRlsBatchTransactionRunner(
  prisma: CustomerAssetRuntimePrismaClientPort
): CustomerAssetRlsTransactionRunner {
  assertCustomerAssetRuntimePrismaClientPort(prisma);
  return async function runCustomerAssetRlsBatchTransaction<
    T,
    Operation = PrismaBatchOperation<T>
  >(input: CustomerAssetRlsTransactionInput<T, Operation>): Promise<T> {
    assertCustomerAssetRuntimePrismaClientPort(prisma);
    const context = createRlsTransactionContext(input.scope);
    const [org, tenant] = context.settings;
    const businessOperation = input.query(prisma);
    if (!businessOperation) {
      throw new Error("customer asset RLS batch query operation is required");
    }

    const result = await prisma.$transaction([
      prisma.$executeRawUnsafe(context.roleSql),
      createSetConfigOperation(prisma, requireRlsSetting(org, "app.org_id")),
      createSetConfigOperation(prisma, requireRlsSetting(tenant, "app.tenant_id")),
      businessOperation as PrismaBatchOperation
    ]);

    const businessResult = result.at(-1) as Awaited<Operation>;
    return input.mapResult ? input.mapResult(businessResult) : (businessResult as T);
  };
}

export class RlsCustomerAssetPersistenceGateway extends PrismaCustomerAssetPersistenceGateway {
  constructor(runner: CustomerAssetRlsTransactionRunner) {
    super(createRlsCustomerAssetPrismaClient(runner));
  }
}

function createRlsCustomerAssetPrismaClient(
  runner: CustomerAssetRlsTransactionRunner
): CustomerAssetPrismaClientPort {
  const delegate = (name: PrismaDelegateName) => ({
    findFirst: (args: Record<string, unknown>) =>
      runRlsDelegate(runner, name, "findFirst", args),
    findMany: (args: Record<string, unknown>) =>
      runRlsDelegate(runner, name, "findMany", args),
    update: (args: Record<string, unknown>) =>
      runRlsDelegate(runner, name, "update", args)
  });
  return {
    customer: delegate("customer"),
    customerFieldValue: delegate("customerFieldValue"),
    customerIdentity: delegate("customerIdentity"),
    customFieldDefinition: delegate("customFieldDefinition"),
    tagAssignment: delegate("tagAssignment"),
    tagDefinition: delegate("tagDefinition")
  } as CustomerAssetPrismaClientPort;
}

function runRlsDelegate(
  runner: CustomerAssetRlsTransactionRunner,
  name: PrismaDelegateName,
  method: PrismaDelegateMethod,
  args: Record<string, unknown>
) {
  return runner({
    query: (client) =>
      (
        client[name] as unknown as Record<
          PrismaDelegateMethod,
          (input: Record<string, unknown>) => PrismaBatchOperation
        >
      )[method](args),
    scope: scopeFromDelegateArgs(args)
  });
}

function scopeFromDelegateArgs(args: Record<string, unknown>) {
  const where = objectRecord(args.where);
  const compound = objectRecord(where.id_orgId_tenantId);
  return {
    orgId: requiredRuntimeText(where.orgId ?? compound.orgId, "orgId"),
    tenantId: requiredRuntimeText(where.tenantId ?? compound.tenantId, "tenantId")
  };
}

function objectRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function requiredRuntimeText(value: unknown, name: "orgId" | "tenantId") {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`customer asset runtime ${name} is required`);
  }
  return value;
}

export class RlsPrismaAuditSink implements AuditSink {
  constructor(private readonly runner: CustomerAssetRlsTransactionRunner) {}

  async record(event: ApiAuditEvent): Promise<void> {
    const data = toPrismaAuditLogCreateData(event);
    await this.runner({
      mapResult: () => undefined,
      query: (client) => client.auditLog.create({ data }),
      scope: { orgId: data.orgId, tenantId: data.tenantId }
    });
  }
}

function requireRuntimePrismaClient(
  prisma: CustomerAssetRuntimePrismaClientPort | undefined
) {
  if (!prisma) throw new Error("customer asset runtime Prisma client is required");
  return prisma;
}

function assertCustomerAssetRuntimePrismaClientPort(
  value: CustomerAssetRuntimePrismaClientPort
): asserts value is CustomerAssetRuntimePrismaClientPort {
  if (!value || typeof value !== "object") {
    throw new Error("customer asset runtime Prisma client port is required");
  }
  for (const method of ["$executeRawUnsafe", "$queryRaw", "$transaction"]) {
    if (
      typeof value[method as keyof CustomerAssetRuntimePrismaClientPort] !== "function"
    ) {
      throw new Error(`customer asset runtime Prisma client requires ${method}`);
    }
  }
}

function requireRlsSetting(
  setting: { key?: unknown; value?: unknown } | undefined,
  key: "app.org_id" | "app.tenant_id"
) {
  if (
    setting?.key !== key ||
    typeof setting.value !== "string" ||
    !setting.value.trim()
  ) {
    throw new Error(`customer asset RLS batch ${key} setting is required`);
  }
  return { key, value: setting.value.trim() };
}

function createSetConfigOperation(
  prisma: Pick<CustomerAssetRuntimePrismaClientPort, "$queryRaw">,
  setting: { key: "app.org_id" | "app.tenant_id"; value: string }
) {
  return prisma.$queryRaw`select set_config(${setting.key}, ${setting.value}, true)`;
}
