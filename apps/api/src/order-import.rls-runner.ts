import type {
  OrderImportPrismaClientPort,
  OrderImportRlsTransactionInput
} from "./order-import.repository.ts";

type MaybePromise<T> = T | Promise<T>;
type PrismaBatchOperation<T = unknown> = MaybePromise<T>;
type PrismaRawTag = (
  strings: TemplateStringsArray,
  ...values: readonly unknown[]
) => PrismaBatchOperation;

export type OrderImportRlsBatchPrismaClientPort = OrderImportPrismaClientPort & {
  $executeRawUnsafe(sql: string): PrismaBatchOperation;
  $queryRaw: PrismaRawTag;
  $transaction<T extends readonly PrismaBatchOperation[]>(
    operations: T
  ): Promise<{ [K in keyof T]: Awaited<T[K]> }>;
};

export function createOrderImportRlsBatchTransactionRunner(
  prisma: OrderImportRlsBatchPrismaClientPort
) {
  assertOrderImportRlsBatchPrismaClientPort(prisma);
  return async function runOrderImportRlsBatchTransaction<
    T,
    Operation extends PrismaBatchOperation = PrismaBatchOperation<T>
  >(input: OrderImportRlsTransactionInput<T, Operation>): Promise<T> {
    assertOrderImportRlsBatchPrismaClientPort(prisma);
    const context = requireRlsBatchContext(input);
    const businessOperation = input.query(prisma);
    if (!businessOperation) {
      throw new Error("order import RLS batch query operation is required");
    }

    const result = await prisma.$transaction([
      prisma.$executeRawUnsafe(context.roleSql),
      createSetConfigOperation(prisma, context.org),
      createSetConfigOperation(prisma, context.tenant),
      businessOperation
    ]);

    const businessResult = result.at(-1) as Awaited<Operation>;
    return input.mapResult ? input.mapResult(businessResult) : (businessResult as T);
  };
}

type RequiredRlsBatchContext = {
  org: { key: "app.org_id"; value: string };
  roleSql: string;
  tenant: { key: "app.tenant_id"; value: string };
};

function assertOrderImportRlsBatchPrismaClientPort(
  value: OrderImportRlsBatchPrismaClientPort
): asserts value is OrderImportRlsBatchPrismaClientPort {
  if (!value || typeof value !== "object") {
    throw new Error("order import RLS batch Prisma client port is required");
  }
  if (typeof value.$executeRawUnsafe !== "function") {
    throw new Error("order import RLS batch Prisma client requires $executeRawUnsafe");
  }
  if (typeof value.$queryRaw !== "function") {
    throw new Error("order import RLS batch Prisma client requires $queryRaw");
  }
  if (typeof value.$transaction !== "function") {
    throw new Error("order import RLS batch Prisma client requires $transaction");
  }
}

function requireRlsBatchContext<T, Operation>(
  input: OrderImportRlsTransactionInput<T, Operation>
): RequiredRlsBatchContext {
  const validInput = requireRlsBatchInput(input);
  const [org, tenant] = validInput.context.settings;
  return {
    roleSql: requireRlsBatchRoleSql(validInput.context.roleSql),
    org: requireRlsBatchSetting(org, "app.org_id"),
    tenant: requireRlsBatchSetting(tenant, "app.tenant_id")
  };
}

function requireRlsBatchInput<T, Operation>(
  input: OrderImportRlsTransactionInput<T, Operation>
): OrderImportRlsTransactionInput<T, Operation> {
  if (!input || typeof input !== "object") {
    throw new Error("order import RLS batch input is required");
  }
  if (typeof input.query !== "function") {
    throw new Error("order import RLS batch query function is required");
  }
  if (!Array.isArray(input.context?.settings)) {
    throw new Error("order import RLS batch context settings are required");
  }
  return input;
}

function requireRlsBatchRoleSql(roleSql: unknown): string {
  if (typeof roleSql !== "string") {
    throw new Error("order import RLS batch role SQL is required");
  }
  const normalized = roleSql.trim();
  if (!/^set local role "[A-Za-z_][A-Za-z0-9_.-]*"$/.test(normalized)) {
    throw new Error("order import RLS batch role SQL must use safe set local role");
  }
  return normalized;
}

function requireRlsBatchSetting<Key extends "app.org_id" | "app.tenant_id">(
  setting: { key?: unknown; value?: unknown } | undefined,
  key: Key
): { key: Key; value: string } {
  if (setting?.key !== key || !isNonEmptyText(setting.value)) {
    throw new Error(`order import RLS batch ${key} setting is required`);
  }
  return {
    key,
    value: setting.value.trim()
  };
}

function isNonEmptyText(value: unknown): value is string {
  return typeof value === "string" && Boolean(value.trim());
}

function createSetConfigOperation(
  prisma: Pick<OrderImportRlsBatchPrismaClientPort, "$queryRaw">,
  setting: RequiredRlsBatchContext["org"] | RequiredRlsBatchContext["tenant"]
) {
  return prisma.$queryRaw`select set_config(${setting.key}, ${setting.value}, true)`;
}
