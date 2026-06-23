import type { OrderImportWorkerPersistenceGateway } from "./main.ts";

type MaybePromise<T> = Promise<T> | T;
type AnyRecord = Record<string, unknown>;

type OrderImportWorkerPrismaCreateDelegate = {
  create(args: { data: AnyRecord }): MaybePromise<unknown>;
};

type OrderImportWorkerPrismaCreateManyDelegate = {
  createMany(args: { data: AnyRecord[]; skipDuplicates: true }): MaybePromise<unknown>;
};

export type OrderImportWorkerPrismaPersistenceClientPort = {
  importJob: OrderImportWorkerPrismaCreateDelegate;
  importRowError: OrderImportWorkerPrismaCreateManyDelegate;
  orderSnapshot: OrderImportWorkerPrismaCreateManyDelegate;
};

export class PrismaOrderImportWorkerPersistenceGateway implements OrderImportWorkerPersistenceGateway {
  constructor(private readonly prisma: OrderImportWorkerPrismaPersistenceClientPort) {
    assertOrderImportWorkerPrismaPersistenceClientPort(prisma);
  }

  async persistImportJob(draft: Record<string, unknown>) {
    assertOrderImportWorkerPrismaPersistenceClientPort(this.prisma);
    await this.prisma.importJob.create({
      data: toPrismaImportJobCreateData(draft)
    });
  }

  async persistImportRowErrors(drafts: readonly Record<string, unknown>[]) {
    assertOrderImportWorkerPrismaPersistenceClientPort(this.prisma);
    const data = recordList(drafts, "import row error draft");
    if (data.length === 0) return;

    await this.prisma.importRowError.createMany({
      data: toPrismaImportRowErrorCreateManyData(data),
      skipDuplicates: true
    });
  }

  async persistOrderSnapshots(drafts: readonly Record<string, unknown>[]) {
    assertOrderImportWorkerPrismaPersistenceClientPort(this.prisma);
    const data = recordList(drafts, "order snapshot draft");
    if (data.length === 0) return;

    await this.prisma.orderSnapshot.createMany({
      data: toPrismaOrderSnapshotCreateManyData(data),
      skipDuplicates: true
    });
  }
}

export function createOrderImportWorkerPrismaPersistenceGateway(
  prisma: OrderImportWorkerPrismaPersistenceClientPort
) {
  return new PrismaOrderImportWorkerPersistenceGateway(prisma);
}

export function toPrismaImportJobCreateData(draft: Record<string, unknown>) {
  const data = recordValue(draft, "import job draft");
  return {
    ...data,
    status: prismaEnum(data.status, importJobStatusMap, "import job status")
  };
}

export function toPrismaOrderSnapshotCreateManyData(
  drafts: readonly Record<string, unknown>[]
) {
  return recordList(drafts, "order snapshot draft").map((data) => ({
    ...data,
    sourceKind: prismaEnum(
      data.sourceKind,
      orderSnapshotSourceKindMap,
      "order snapshot sourceKind"
    ),
    status: prismaEnum(data.status, orderSnapshotStatusMap, "order snapshot status")
  }));
}

export function toPrismaImportRowErrorCreateManyData(
  drafts: readonly Record<string, unknown>[]
) {
  return recordList(drafts, "import row error draft").map((data) => ({
    ...data,
    severity: prismaEnum(data.severity, importRowErrorSeverityMap, "row error severity")
  }));
}

function assertOrderImportWorkerPrismaPersistenceClientPort(
  value: unknown
): asserts value is OrderImportWorkerPrismaPersistenceClientPort {
  if (
    !value ||
    typeof value !== "object" ||
    typeof (value as OrderImportWorkerPrismaPersistenceClientPort).importJob?.create !==
      "function" ||
    typeof (value as OrderImportWorkerPrismaPersistenceClientPort).importRowError
      ?.createMany !== "function" ||
    typeof (value as OrderImportWorkerPrismaPersistenceClientPort).orderSnapshot
      ?.createMany !== "function"
  ) {
    throw new Error("order import worker Prisma persistence client port is required");
  }
}

function recordList(value: unknown, name: string): AnyRecord[] {
  if (!Array.isArray(value)) throw new Error(`${name}s must be an array`);
  return value.map((item, index) => recordValue(item, `${name} ${index + 1}`));
}

function recordValue(value: unknown, name: string): AnyRecord {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as AnyRecord;
  }
  throw new Error(`${name} must be a record`);
}

const importJobStatusMap = {
  completed: "COMPLETED",
  completed_with_errors: "COMPLETED_WITH_ERRORS",
  failed: "FAILED",
  queued: "QUEUED",
  rolled_back: "ROLLED_BACK",
  running: "RUNNING"
} as const;

const orderSnapshotSourceKindMap = {
  import_snapshot: "IMPORT_SNAPSHOT"
} as const;

const orderSnapshotStatusMap = {
  active: "ACTIVE",
  archived: "ARCHIVED"
} as const;

const importRowErrorSeverityMap = {
  error: "ERROR",
  warning: "WARNING"
} as const;

function prismaEnum<T extends Record<string, string>>(
  value: unknown,
  mapping: T,
  name: string
): T[keyof T] {
  if (typeof value !== "string") throw new Error(`${name} is required`);
  const mapped = mapping[value.trim().toLowerCase() as keyof T];
  if (!mapped) throw new Error(`${name} is invalid for Prisma`);
  return mapped;
}
