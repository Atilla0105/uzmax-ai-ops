import type { AccessContext } from "../../../packages/authz/src/index.ts";
import {
  createRlsTransactionContext,
  type RlsTenantContext
} from "../../../packages/db/src/index.ts";
import {
  createUzmaxPrismaClientFromEnv,
  type UzmaxPrismaRuntimeEnv
} from "../../../packages/db/src/prisma-runtime.ts";

import {
  InMemoryConfirmationQueueRepository,
  type ConfirmationQueueRepositoryPort
} from "./confirmation-queue.repository.ts";
import {
  confirmationQueuePrismaKindByApi,
  confirmationQueuePrismaStatusByApi,
  mapConfirmationItemRow,
  toPrismaCreateData,
  toPrismaUpdateData
} from "./confirmation-queue.prisma-mapper.ts";
import type {
  ConfirmationQueueItem,
  ConfirmationQueueListFilters
} from "./confirmation-queue.types.ts";

type MaybePromise<T> = T | Promise<T>;
type PrismaBatchOperation<T = unknown> = MaybePromise<T>;
type PrismaRawTag = (
  strings: TemplateStringsArray,
  ...values: readonly unknown[]
) => PrismaBatchOperation;
type ConfirmationQueuePersistenceScope = RlsTenantContext;
type ConfirmationQueuePrismaFindArgs = {
  orderBy?: Record<string, unknown> | readonly Record<string, unknown>[];
  take?: number;
  where: Record<string, unknown>;
};
type ConfirmationQueuePrismaItemDelegate = {
  findFirst(
    args: ConfirmationQueuePrismaFindArgs
  ): PrismaBatchOperation<unknown | null>;
  findMany(
    args: ConfirmationQueuePrismaFindArgs
  ): PrismaBatchOperation<readonly unknown[]>;
  update(args: {
    data: Record<string, unknown>;
    where: Record<string, unknown>;
  }): PrismaBatchOperation<unknown>;
  upsert(args: {
    create: Record<string, unknown>;
    update: Record<string, unknown>;
    where: Record<string, unknown>;
  }): PrismaBatchOperation<unknown>;
};

type ConfirmationQueuePrismaClientPort = {
  confirmationItem: ConfirmationQueuePrismaItemDelegate;
};
type ConfirmationQueueRlsBatchPrismaClientPort = ConfirmationQueuePrismaClientPort & {
  $executeRawUnsafe(sql: string): PrismaBatchOperation;
  $queryRaw: PrismaRawTag;
  $transaction<T extends readonly PrismaBatchOperation[]>(
    operations: T
  ): Promise<{ [K in keyof T]: Awaited<T[K]> }>;
};
type ConfirmationQueueRlsTransactionInput<T, Operation = PrismaBatchOperation<T>> = {
  mapResult?(result: Awaited<Operation>): T;
  query(client: ConfirmationQueuePrismaClientPort): Operation;
  scope: ConfirmationQueuePersistenceScope;
};
type ConfirmationQueueRlsTransactionRunner = <T, Operation = PrismaBatchOperation<T>>(
  input: ConfirmationQueueRlsTransactionInput<T, Operation>
) => Promise<T>;

const confirmationQueueRepositoryRuntimeModes = {
  inMemory: "in_memory",
  rlsPrismaGateway: "rls_prisma_gateway"
} as const;
type ConfirmationQueueRepositoryRuntimeMode =
  (typeof confirmationQueueRepositoryRuntimeModes)[keyof typeof confirmationQueueRepositoryRuntimeModes];
type ConfirmationQueueRuntimeEnv = UzmaxPrismaRuntimeEnv &
  Partial<Record<"UZMAX_CONFIRMATION_QUEUE_REPOSITORY_MODE", string>>;
type ConfirmationQueueRepositoryProviderInput = {
  env?: ConfirmationQueueRuntimeEnv;
  inMemoryRepository?: ConfirmationQueueRepositoryPort;
  mode?: ConfirmationQueueRepositoryRuntimeMode;
  prismaClient?: ConfirmationQueueRlsBatchPrismaClientPort;
  rlsTransactionRunner?: ConfirmationQueueRlsTransactionRunner;
};

function createConfirmationQueueRepositoryProvider(
  input: ConfirmationQueueRepositoryProviderInput = {}
): ConfirmationQueueRepositoryPort {
  const mode = input.mode ?? confirmationQueueRepositoryRuntimeModes.inMemory;
  if (mode === confirmationQueueRepositoryRuntimeModes.inMemory) {
    return input.inMemoryRepository ?? new InMemoryConfirmationQueueRepository();
  }
  if (mode === confirmationQueueRepositoryRuntimeModes.rlsPrismaGateway) {
    return new RlsPrismaConfirmationQueueRepository(resolveRunner(input));
  }
  throw new Error(`unsupported confirmation queue runtime mode: ${String(mode)}`);
}

export function createConfirmationQueueRepositoryProviderFromEnv(
  options: ConfirmationQueueRepositoryProviderInput = {}
): ConfirmationQueueRepositoryPort {
  const env = options.env ?? process.env;
  const mode = readConfirmationQueueRuntimeMode(env);
  if (mode === confirmationQueueRepositoryRuntimeModes.inMemory) {
    return createConfirmationQueueRepositoryProvider({
      inMemoryRepository: options.inMemoryRepository,
      mode
    });
  }
  return createConfirmationQueueRepositoryProvider({
    mode,
    rlsTransactionRunner:
      options.rlsTransactionRunner ??
      createConfirmationQueueRlsBatchTransactionRunner(
        options.prismaClient ??
          (createUzmaxPrismaClientFromEnv(
            env
          ) as unknown as ConfirmationQueueRlsBatchPrismaClientPort)
      )
  });
}

function createConfirmationQueueRlsBatchTransactionRunner(
  prisma: ConfirmationQueueRlsBatchPrismaClientPort
): ConfirmationQueueRlsTransactionRunner {
  assertConfirmationQueueRuntimePrismaClientPort(prisma);
  return async function runConfirmationQueueRlsBatchTransaction<
    T,
    Operation = PrismaBatchOperation<T>
  >(input: ConfirmationQueueRlsTransactionInput<T, Operation>): Promise<T> {
    assertConfirmationQueueRuntimePrismaClientPort(prisma);
    const context = createRlsTransactionContext(input.scope);
    const settings = context.settings.map((setting) =>
      createSetConfigOperation(prisma, requireRlsSetting(setting))
    );
    const businessOperation = input.query(prisma);
    if (!businessOperation) {
      throw new Error("confirmation queue RLS batch query operation is required");
    }

    const result = await prisma.$transaction([
      prisma.$executeRawUnsafe(context.roleSql),
      ...settings,
      businessOperation as PrismaBatchOperation
    ]);
    const businessResult = result.at(-1) as Awaited<Operation>;
    return input.mapResult ? input.mapResult(businessResult) : (businessResult as T);
  };
}

class RlsPrismaConfirmationQueueRepository implements ConfirmationQueueRepositoryPort {
  constructor(
    private readonly runInRlsTransaction: ConfirmationQueueRlsTransactionRunner
  ) {}

  listItems(accessContext: AccessContext, filters: ConfirmationQueueListFilters) {
    const scope = scopeFor(accessContext);
    return this.query<ConfirmationQueueItem[], readonly unknown[]>(
      scope,
      (client) =>
        client.confirmationItem.findMany({
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
          take: 100,
          where: { ...scope, ...filterWhere(filters) }
        }),
      (rows) => rows.map((row) => mapConfirmationItemRow(row))
    );
  }

  getItem(accessContext: AccessContext, itemId: string) {
    const scope = scopeFor(accessContext);
    return this.query<ConfirmationQueueItem | undefined, unknown | null>(
      scope,
      (client) =>
        client.confirmationItem.findFirst({
          where: { ...scope, id: itemId }
        }),
      (row) => (row ? mapConfirmationItemRow(row) : undefined)
    );
  }

  saveItem(item: ConfirmationQueueItem) {
    const scope = { orgId: item.orgId, tenantId: item.tenantId };
    return this.query<ConfirmationQueueItem, unknown>(
      scope,
      (client) =>
        client.confirmationItem.upsert({
          create: toPrismaCreateData(item),
          update: toPrismaUpdateData(item),
          where: { id: item.id }
        }),
      mapConfirmationItemRow
    );
  }

  private query<T, Operation>(
    scope: ConfirmationQueuePersistenceScope,
    operation: (client: ConfirmationQueuePrismaClientPort) => MaybePromise<Operation>,
    mapResult?: (result: Awaited<MaybePromise<Operation>>) => T
  ) {
    return this.runInRlsTransaction({
      mapResult,
      query: operation,
      scope
    });
  }
}

function readConfirmationQueueRuntimeMode(
  env: ConfirmationQueueRuntimeEnv = process.env
): ConfirmationQueueRepositoryRuntimeMode {
  const mode =
    env.UZMAX_CONFIRMATION_QUEUE_REPOSITORY_MODE?.trim() ??
    confirmationQueueRepositoryRuntimeModes.inMemory;
  if (mode === confirmationQueueRepositoryRuntimeModes.inMemory) return mode;
  if (mode === confirmationQueueRepositoryRuntimeModes.rlsPrismaGateway) return mode;
  if (mode === "prisma_gateway") {
    throw new Error("confirmation queue env runtime must use RLS Prisma gateway");
  }
  throw new Error(`unsupported confirmation queue runtime mode: ${mode}`);
}

function resolveRunner(input: ConfirmationQueueRepositoryProviderInput) {
  if (input.rlsTransactionRunner) return input.rlsTransactionRunner;
  const prisma = input.prismaClient;
  if (!prisma) throw new Error("confirmation queue runtime Prisma client is required");
  return createConfirmationQueueRlsBatchTransactionRunner(prisma);
}

function scopeFor(accessContext: AccessContext): ConfirmationQueuePersistenceScope {
  return {
    orgId: accessContext.orgId,
    tenantId: accessContext.selectedTenantId
  };
}

function filterWhere(filters: ConfirmationQueueListFilters) {
  return cleanRecord({
    kind: filters.kind ? confirmationQueuePrismaKindByApi[filters.kind] : undefined,
    status: filters.status
      ? confirmationQueuePrismaStatusByApi[filters.status]
      : undefined
  });
}

function cleanRecord<T extends Record<string, unknown>>(record: T): T {
  return Object.fromEntries(
    Object.entries(record).filter(([, value]) => value !== undefined)
  ) as T;
}

function assertConfirmationQueueRuntimePrismaClientPort(
  value: ConfirmationQueueRlsBatchPrismaClientPort
): asserts value is ConfirmationQueueRlsBatchPrismaClientPort {
  if (!value || typeof value !== "object") {
    throw new Error("confirmation queue runtime Prisma client port is required");
  }
  for (const [name, method] of [
    ["findFirst", value.confirmationItem?.findFirst],
    ["findMany", value.confirmationItem?.findMany],
    ["upsert", value.confirmationItem?.upsert],
    ["$executeRawUnsafe", value.$executeRawUnsafe],
    ["$queryRaw", value.$queryRaw],
    ["$transaction", value.$transaction]
  ] as const) {
    if (typeof method !== "function") {
      throw new Error(`confirmation queue runtime Prisma client requires ${name}`);
    }
  }
}

function requireRlsSetting(setting: { key?: unknown; value?: unknown } | undefined): {
  key: "app.org_id" | "app.tenant_id";
  value: string;
} {
  const key = setting?.key;
  const value = setting?.value;
  if (
    (key !== "app.org_id" && key !== "app.tenant_id") ||
    typeof value !== "string" ||
    !value.trim()
  ) {
    throw new Error("confirmation queue RLS batch setting is required");
  }
  return { key, value: value.trim() };
}

function createSetConfigOperation(
  prisma: Pick<ConfirmationQueueRlsBatchPrismaClientPort, "$queryRaw">,
  setting: { key: "app.org_id" | "app.tenant_id"; value: string }
) {
  return prisma.$queryRaw`select set_config(${setting.key}, ${setting.value}, true)`;
}
