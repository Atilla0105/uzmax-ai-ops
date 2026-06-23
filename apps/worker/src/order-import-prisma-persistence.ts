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
      data: recordValue(draft, "import job draft")
    });
  }

  async persistImportRowErrors(drafts: readonly Record<string, unknown>[]) {
    assertOrderImportWorkerPrismaPersistenceClientPort(this.prisma);
    const data = recordList(drafts, "import row error draft");
    if (data.length === 0) return;

    await this.prisma.importRowError.createMany({
      data,
      skipDuplicates: true
    });
  }

  async persistOrderSnapshots(drafts: readonly Record<string, unknown>[]) {
    assertOrderImportWorkerPrismaPersistenceClientPort(this.prisma);
    const data = recordList(drafts, "order snapshot draft");
    if (data.length === 0) return;

    await this.prisma.orderSnapshot.createMany({
      data,
      skipDuplicates: true
    });
  }
}

export function createOrderImportWorkerPrismaPersistenceGateway(
  prisma: OrderImportWorkerPrismaPersistenceClientPort
) {
  return new PrismaOrderImportWorkerPersistenceGateway(prisma);
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
