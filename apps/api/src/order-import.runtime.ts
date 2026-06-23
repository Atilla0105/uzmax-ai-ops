import {
  createUzmaxPrismaClientFromEnv,
  type UzmaxPrismaRuntimeEnv
} from "../../../packages/db/src/prisma-runtime.ts";

import {
  createOrderImportRepositoryProvider,
  orderImportRepositoryRuntimeModes,
  type OrderImportRepositoryPort,
  type OrderImportRepositoryRuntimeMode
} from "./order-import.repository.ts";
import {
  createOrderImportRlsBatchTransactionRunner,
  type OrderImportRlsBatchPrismaClientPort
} from "./order-import.rls-runner.ts";

type OrderImportRuntimeEnv = UzmaxPrismaRuntimeEnv &
  Partial<Record<"UZMAX_ORDER_IMPORT_REPOSITORY_MODE", string>>;

export type OrderImportRepositoryRuntimeOptions = {
  env?: OrderImportRuntimeEnv;
  inMemoryRepository?: OrderImportRepositoryPort;
  prismaClient?: OrderImportRlsBatchPrismaClientPort;
};

function readOrderImportRepositoryRuntimeMode(
  env: OrderImportRuntimeEnv = process.env
): OrderImportRepositoryRuntimeMode {
  const mode =
    env.UZMAX_ORDER_IMPORT_REPOSITORY_MODE?.trim() ??
    orderImportRepositoryRuntimeModes.inMemory;

  if (mode === orderImportRepositoryRuntimeModes.inMemory) return mode;
  if (mode === orderImportRepositoryRuntimeModes.rlsPrismaGateway) return mode;
  if (mode === orderImportRepositoryRuntimeModes.prismaGateway) {
    throw new Error("order import env runtime must use RLS Prisma gateway");
  }
  throw new Error(`unsupported order import repository runtime mode: ${mode}`);
}

export function createOrderImportRepositoryProviderFromEnv(
  options: OrderImportRepositoryRuntimeOptions = {}
): OrderImportRepositoryPort {
  const env = options.env ?? process.env;
  const mode = readOrderImportRepositoryRuntimeMode(env);

  if (mode === orderImportRepositoryRuntimeModes.inMemory) {
    return createOrderImportRepositoryProvider({
      inMemoryRepository: options.inMemoryRepository,
      mode
    });
  }

  const prismaClient =
    options.prismaClient ??
    (createUzmaxPrismaClientFromEnv(
      env
    ) as unknown as OrderImportRlsBatchPrismaClientPort);
  return createOrderImportRepositoryProvider({
    mode,
    rlsTransactionRunner: createOrderImportRlsBatchTransactionRunner(prismaClient)
  });
}
