import {
  createRlsTransactionContext,
  type M4OrderImportContractInput
} from "../../../packages/db/src/index.ts";

import type {
  OrderImportPersistenceGateway,
  OrderImportPersistenceScope,
  OrderImportPrismaClientPort,
  OrderImportRlsTransactionRunner,
  OrderSnapshotLookup
} from "./order-import.repository.ts";

type MaybePromise<T> = T | Promise<T>;

export class PrismaOrderImportPersistenceGateway implements OrderImportPersistenceGateway {
  constructor(private readonly prisma: OrderImportPrismaClientPort) {}

  listImportJobs(scope: OrderImportPersistenceScope) {
    return this.listImportJobsOperation(scope);
  }

  listImportJobsOperation(scope: OrderImportPersistenceScope) {
    return this.prisma.importJob.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      where: scope
    }) as Promise<readonly M4OrderImportContractInput[]>;
  }

  async getImportJob(scope: OrderImportPersistenceScope, jobId: string) {
    return nullableRow(await this.getImportJobOperation(scope, jobId));
  }

  getImportJobOperation(scope: OrderImportPersistenceScope, jobId: string) {
    return this.prisma.importJob.findFirst({
      where: { ...scope, id: jobId }
    }) as Promise<M4OrderImportContractInput | null>;
  }

  listImportRowErrors(scope: OrderImportPersistenceScope, jobId: string) {
    return this.listImportRowErrorsOperation(scope, jobId);
  }

  listImportRowErrorsOperation(scope: OrderImportPersistenceScope, jobId: string) {
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
    const operation = this.findOrderSnapshotOperation(scope, lookup);
    return operation ? nullableRow(await operation) : undefined;
  }

  findOrderSnapshotOperation(
    scope: OrderImportPersistenceScope,
    lookup: OrderSnapshotLookup
  ) {
    const where = snapshotWhere(scope, lookup);
    if (!where) return undefined;
    return this.prisma.orderSnapshot.findFirst({
      orderBy: { sourceUpdatedAt: "desc" },
      where
    }) as Promise<M4OrderImportContractInput | null>;
  }
}

export class RlsOrderImportPersistenceGateway implements OrderImportPersistenceGateway {
  constructor(private readonly runInRlsTransaction: OrderImportRlsTransactionRunner) {}

  listImportJobs(
    scope: OrderImportPersistenceScope
  ): MaybePromise<readonly M4OrderImportContractInput[]> {
    return this.query<
      readonly M4OrderImportContractInput[],
      Promise<readonly M4OrderImportContractInput[]>
    >(scope, (gateway) => gateway.listImportJobsOperation(scope));
  }

  getImportJob(
    scope: OrderImportPersistenceScope,
    jobId: string
  ): MaybePromise<M4OrderImportContractInput | undefined> {
    return this.query<
      M4OrderImportContractInput | undefined,
      Promise<M4OrderImportContractInput | null>
    >(scope, (gateway) => gateway.getImportJobOperation(scope, jobId), nullableRow);
  }

  listImportRowErrors(
    scope: OrderImportPersistenceScope,
    jobId: string
  ): MaybePromise<readonly M4OrderImportContractInput[]> {
    return this.query<
      readonly M4OrderImportContractInput[],
      Promise<readonly M4OrderImportContractInput[]>
    >(scope, (gateway) => gateway.listImportRowErrorsOperation(scope, jobId));
  }

  findOrderSnapshot(
    scope: OrderImportPersistenceScope,
    lookup: OrderSnapshotLookup
  ): MaybePromise<M4OrderImportContractInput | undefined> {
    const where = snapshotWhere(scope, lookup);
    if (!where) return undefined;
    return this.query<
      M4OrderImportContractInput | undefined,
      Promise<M4OrderImportContractInput | null>
    >(
      scope,
      (gateway) =>
        gateway.findOrderSnapshotOperation(
          scope,
          lookup
        ) as Promise<M4OrderImportContractInput | null>,
      nullableRow
    );
  }

  private query<T, Operation>(
    scope: OrderImportPersistenceScope,
    operation: (gateway: PrismaOrderImportPersistenceGateway) => Operation,
    mapResult?: (result: Awaited<Operation>) => T
  ) {
    return this.runInRlsTransaction({
      context: createRlsTransactionContext(scope),
      mapResult,
      query: (client) => operation(new PrismaOrderImportPersistenceGateway(client)),
      scope
    });
  }
}

function nullableRow(
  row: M4OrderImportContractInput | null
): M4OrderImportContractInput | undefined {
  return row ?? undefined;
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
