import type { AccessContext } from "../../../packages/authz/src/index.ts";
import {
  createRlsTransactionContext,
  type M4OrderImportContractInput,
  type RlsTransactionContext
} from "../../../packages/db/src/index.ts";

import type {
  OrderImportJobSummary,
  OrderImportQueryKind,
  OrderImportRowErrorItem,
  OrderImportSeed,
  OrderSnapshotRecord
} from "./order-import.types.ts";
import {
  defaultOrderImportJobs,
  defaultOrderImportRowErrors,
  defaultOrderImportSnapshots
} from "./order-import.defaults.ts";

export const ORDER_IMPORT_REPOSITORY = Symbol("ORDER_IMPORT_REPOSITORY");

export type OrderSnapshotLookup = {
  queryKind: OrderImportQueryKind;
  queryRef: string;
};

type MaybePromise<T> = T | Promise<T>;

export type OrderImportRepositoryPort = {
  findSnapshot(
    accessContext: AccessContext,
    lookup: OrderSnapshotLookup
  ): MaybePromise<OrderSnapshotRecord | undefined>;
  getJob(
    accessContext: AccessContext,
    jobId: string
  ): MaybePromise<OrderImportJobSummary | undefined>;
  listJobs(accessContext: AccessContext): MaybePromise<OrderImportJobSummary[]>;
  listRowErrors(
    accessContext: AccessContext,
    jobId: string
  ): MaybePromise<OrderImportRowErrorItem[]>;
};

export type OrderImportPersistenceScope = {
  orgId: string;
  tenantId: string;
};

export type OrderImportPersistenceGateway = {
  findOrderSnapshot(
    scope: OrderImportPersistenceScope,
    lookup: OrderSnapshotLookup
  ): MaybePromise<M4OrderImportContractInput | undefined>;
  getImportJob(
    scope: OrderImportPersistenceScope,
    jobId: string
  ): MaybePromise<M4OrderImportContractInput | undefined>;
  listImportJobs(
    scope: OrderImportPersistenceScope
  ): MaybePromise<readonly M4OrderImportContractInput[]>;
  listImportRowErrors(
    scope: OrderImportPersistenceScope,
    jobId: string
  ): MaybePromise<readonly M4OrderImportContractInput[]>;
};

type OrderImportPersistenceRow = M4OrderImportContractInput;
type PrismaOrderImportFindManyDelegate = {
  findMany(args: {
    orderBy?: Record<string, unknown> | readonly Record<string, unknown>[];
    take?: number;
    where: Record<string, unknown>;
  }): Promise<readonly unknown[]>;
};
type PrismaOrderImportFindFirstDelegate = {
  findFirst(args: {
    orderBy?: Record<string, unknown>;
    where: Record<string, unknown>;
  }): Promise<unknown | null>;
};
export type OrderImportPrismaClientPort = {
  importJob: PrismaOrderImportFindManyDelegate & PrismaOrderImportFindFirstDelegate;
  importRowError: PrismaOrderImportFindManyDelegate;
  orderSnapshot: PrismaOrderImportFindFirstDelegate;
};
type OrderImportRlsTransactionInput<T> = {
  context: RlsTransactionContext;
  query(client: OrderImportPrismaClientPort): MaybePromise<T>;
  scope: OrderImportPersistenceScope;
};
export type OrderImportRlsTransactionRunner = <T>(
  input: OrderImportRlsTransactionInput<T>
) => MaybePromise<T>;

export const ORDER_IMPORT_PRISMA_CLIENT = Symbol("ORDER_IMPORT_PRISMA_CLIENT");
export const ORDER_IMPORT_RLS_TRANSACTION_RUNNER = Symbol(
  "ORDER_IMPORT_RLS_TRANSACTION_RUNNER"
);
export const orderImportRepositoryRuntimeModes = {
  inMemory: "in_memory",
  prismaGateway: "prisma_gateway",
  rlsPrismaGateway: "rls_prisma_gateway"
} as const;
export type OrderImportRepositoryRuntimeMode =
  | "in_memory"
  | "prisma_gateway"
  | "rls_prisma_gateway";
export type OrderImportRepositoryProviderInput = {
  inMemoryRepository?: OrderImportRepositoryPort;
  mode?: OrderImportRepositoryRuntimeMode;
  prismaClient?: OrderImportPrismaClientPort;
  rlsTransactionRunner?: OrderImportRlsTransactionRunner;
};

export function createOrderImportRepositoryProvider(
  input: OrderImportRepositoryProviderInput = {}
): OrderImportRepositoryPort {
  const mode = input.mode ?? orderImportRepositoryRuntimeModes.inMemory;
  if (mode === orderImportRepositoryRuntimeModes.inMemory) {
    return input.inMemoryRepository ?? new InMemoryOrderImportRepository();
  }
  if (mode === orderImportRepositoryRuntimeModes.prismaGateway) {
    if (!isOrderImportPrismaClientPort(input.prismaClient)) {
      throw new Error("order import Prisma client port is required");
    }
    return new PersistenceOrderImportRepository(
      new PrismaOrderImportPersistenceGateway(input.prismaClient)
    );
  }
  if (mode === orderImportRepositoryRuntimeModes.rlsPrismaGateway) {
    if (!isOrderImportRlsTransactionRunner(input.rlsTransactionRunner)) {
      throw new Error("order import RLS transaction runner is required");
    }
    return new PersistenceOrderImportRepository(
      new RlsOrderImportPersistenceGateway(input.rlsTransactionRunner)
    );
  }
  throw new Error(`unsupported order import repository runtime mode: ${String(mode)}`);
}

export class InMemoryOrderImportRepository implements OrderImportRepositoryPort {
  private jobs: OrderImportJobSummary[];
  private rowErrors: OrderImportRowErrorItem[];
  private snapshots: OrderSnapshotRecord[];

  constructor(seed: OrderImportSeed = {}) {
    this.jobs = [...(seed.jobs ?? defaultOrderImportJobs)];
    this.rowErrors = [...(seed.rowErrors ?? defaultOrderImportRowErrors)];
    this.snapshots = [...(seed.snapshots ?? defaultOrderImportSnapshots)];
  }

  listJobs(accessContext: AccessContext) {
    return scoped(this.jobs, accessContext).map((job) => structuredClone(job));
  }

  getJob(accessContext: AccessContext, jobId: string) {
    return structuredClone(
      scoped(this.jobs, accessContext).find((job) => job.id === jobId)
    );
  }

  listRowErrors(accessContext: AccessContext, jobId: string) {
    return scoped(this.rowErrors, accessContext)
      .filter((rowError) => rowError.importJobId === jobId)
      .map((rowError) => structuredClone(rowError));
  }

  findSnapshot(accessContext: AccessContext, lookup: OrderSnapshotLookup) {
    return structuredClone(
      scoped(this.snapshots, accessContext).find((snapshot) =>
        snapshot.queryRefs.includes(lookup.queryRef)
      )
    );
  }
}

export class PersistenceOrderImportRepository implements OrderImportRepositoryPort {
  constructor(private readonly gateway: OrderImportPersistenceGateway) {}

  async listJobs(accessContext: AccessContext) {
    const rows = await this.gateway.listImportJobs(scopeFor(accessContext));
    return rows.flatMap((row) => mapJob(row, accessContext));
  }

  async getJob(accessContext: AccessContext, jobId: string) {
    const row = await this.gateway.getImportJob(scopeFor(accessContext), jobId);
    return row ? mapJob(row, accessContext)[0] : undefined;
  }

  async listRowErrors(accessContext: AccessContext, jobId: string) {
    const rows = await this.gateway.listImportRowErrors(scopeFor(accessContext), jobId);
    return rows.flatMap((row) => mapRowError(row, accessContext));
  }

  async findSnapshot(accessContext: AccessContext, lookup: OrderSnapshotLookup) {
    const row = await this.gateway.findOrderSnapshot(scopeFor(accessContext), lookup);
    return row ? mapSnapshot(row, accessContext, lookup.queryRef)[0] : undefined;
  }
}

export class PrismaOrderImportPersistenceGateway implements OrderImportPersistenceGateway {
  constructor(private readonly prisma: OrderImportPrismaClientPort) {}

  listImportJobs(scope: OrderImportPersistenceScope) {
    return this.prisma.importJob.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      where: scope
    }) as Promise<readonly M4OrderImportContractInput[]>;
  }

  async getImportJob(scope: OrderImportPersistenceScope, jobId: string) {
    return nullableRow(
      (await this.prisma.importJob.findFirst({
        where: { ...scope, id: jobId }
      })) as M4OrderImportContractInput | null
    );
  }

  listImportRowErrors(scope: OrderImportPersistenceScope, jobId: string) {
    return this.prisma.importRowError.findMany({
      orderBy: [{ rowNumber: "asc" }, { createdAt: "asc" }],
      take: 500,
      where: { ...scope, importJobId: jobId }
    }) as Promise<readonly M4OrderImportContractInput[]>;
  }

  async findOrderSnapshot(
    scope: OrderImportPersistenceScope,
    lookup: OrderSnapshotLookup
  ) {
    const where = snapshotWhere(scope, lookup);
    if (!where) return undefined;
    return nullableRow(
      (await this.prisma.orderSnapshot.findFirst({
        orderBy: { sourceUpdatedAt: "desc" },
        where
      })) as M4OrderImportContractInput | null
    );
  }
}

export class RlsOrderImportPersistenceGateway implements OrderImportPersistenceGateway {
  constructor(private readonly runInRlsTransaction: OrderImportRlsTransactionRunner) {}

  listImportJobs(scope: OrderImportPersistenceScope) {
    return this.query(scope, (gateway) => gateway.listImportJobs(scope));
  }

  getImportJob(scope: OrderImportPersistenceScope, jobId: string) {
    return this.query(scope, (gateway) => gateway.getImportJob(scope, jobId));
  }

  listImportRowErrors(scope: OrderImportPersistenceScope, jobId: string) {
    return this.query(scope, (gateway) => gateway.listImportRowErrors(scope, jobId));
  }

  findOrderSnapshot(scope: OrderImportPersistenceScope, lookup: OrderSnapshotLookup) {
    return this.query(scope, (gateway) => gateway.findOrderSnapshot(scope, lookup));
  }

  private query<T>(
    scope: OrderImportPersistenceScope,
    operation: (gateway: PrismaOrderImportPersistenceGateway) => MaybePromise<T>
  ) {
    return this.runInRlsTransaction({
      context: createRlsTransactionContext(scope),
      query: (client) => operation(new PrismaOrderImportPersistenceGateway(client)),
      scope
    });
  }
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

function scopeFor(accessContext: AccessContext): OrderImportPersistenceScope {
  return {
    orgId: accessContext.orgId,
    tenantId: accessContext.selectedTenantId
  };
}

function mapJob(
  row: OrderImportPersistenceRow,
  accessContext: AccessContext
): OrderImportJobSummary[] {
  if (!matchesScope(row, accessContext)) return [];
  return [
    {
      completedAt: optionalString(row.completedAt),
      failedRows: numberValue(row.failedRows),
      id: stringValue(row.id),
      orgId: stringValue(row.orgId),
      sourceRef: stringValue(row.fileRef),
      status: enumStringValue(row.status),
      successfulRows: numberValue(row.successfulRows),
      tenantId: stringValue(row.tenantId),
      totalRows: numberValue(row.totalRows)
    }
  ];
}

function mapRowError(
  row: OrderImportPersistenceRow,
  accessContext: AccessContext
): OrderImportRowErrorItem[] {
  if (!matchesScope(row, accessContext)) return [];
  return [
    {
      columnKey: optionalString(row.columnKey),
      errorCode: stringValue(row.errorCode),
      id: stringValue(row.id),
      importJobId: stringValue(row.importJobId),
      messageRef: stringValue(row.messageRef),
      orgId: stringValue(row.orgId),
      rowNumber: numberValue(row.rowNumber),
      severity: "error",
      tenantId: stringValue(row.tenantId)
    }
  ];
}

function mapSnapshot(
  row: OrderImportPersistenceRow,
  accessContext: AccessContext,
  queryRef: string
): OrderSnapshotRecord[] {
  if (!matchesScope(row, accessContext) || enumStringValue(row.status) === "archived") {
    return [];
  }
  return [
    {
      customerRef: optionalString(row.customerRef),
      expiresAt: stringValue(row.expiresAt),
      externalBatchRef: optionalString(row.externalBatchRef),
      externalOrderRef: stringValue(row.externalOrderRef),
      orderStatusRef: stringValue(row.orderStatusRef),
      orgId: stringValue(row.orgId),
      payloadSummary: recordValue(row.payloadSummary),
      queryRefs: [queryRef],
      sourceKind: "import_snapshot",
      sourceRef: stringValue(row.sourceRef),
      sourceUpdatedAt: stringValue(row.sourceUpdatedAt),
      tenantId: stringValue(row.tenantId)
    }
  ];
}

function matchesScope(row: OrderImportPersistenceRow, accessContext: AccessContext) {
  return (
    row.orgId === accessContext.orgId && row.tenantId === accessContext.selectedTenantId
  );
}

function optionalString(value: unknown): string | undefined {
  return value == null ? undefined : stringValue(value);
}

function stringValue(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value !== "string" || !value.trim()) throw new Error("row value required");
  return value.trim();
}

function enumStringValue(value: unknown): string {
  return stringValue(value).toLowerCase();
}

function numberValue(value: unknown): number {
  if (!Number.isInteger(value)) throw new Error("row number value required");
  return value as number;
}

function recordValue(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  throw new Error("row record value required");
}

function nullableRow(
  row: M4OrderImportContractInput | null
): M4OrderImportContractInput | undefined {
  return row ?? undefined;
}

function isOrderImportPrismaClientPort(
  value?: OrderImportPrismaClientPort
): value is OrderImportPrismaClientPort {
  return Boolean(
    value &&
    typeof value.importJob?.findFirst === "function" &&
    typeof value.importJob?.findMany === "function" &&
    typeof value.importRowError?.findMany === "function" &&
    typeof value.orderSnapshot?.findFirst === "function"
  );
}

function isOrderImportRlsTransactionRunner(
  value?: OrderImportRlsTransactionRunner
): value is OrderImportRlsTransactionRunner {
  return typeof value === "function";
}

function snapshotWhere(
  scope: OrderImportPersistenceScope,
  lookup: OrderSnapshotLookup
): Record<string, unknown> | undefined {
  const activeScope = { ...scope, status: "ACTIVE" };
  if (lookup.queryKind === "batch_ref") {
    return { ...activeScope, externalBatchRef: lookup.queryRef };
  }
  if (lookup.queryKind === "external_ref" || lookup.queryKind === "order_ref") {
    return { ...activeScope, externalOrderRef: lookup.queryRef };
  }
  return undefined;
}
