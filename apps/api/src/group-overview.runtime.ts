import { createUzmaxPrismaClientFromEnv } from "../../../packages/db/src/prisma-runtime.ts";

import {
  GroupOverviewApiError,
  readGroupOverviewRuntimeMode,
  type GroupOverviewRuntimeMode
} from "./group-overview.contracts.ts";
import {
  RlsPrismaGroupOverviewRepository,
  createGroupOverviewRlsTransactionRunner,
  type GroupOverviewPrismaClientPort,
  type GroupOverviewRepositoryPort,
  type GroupOverviewRlsTransactionRunner
} from "./group-overview.repository.ts";

type Env = Partial<
  Record<"UZMAX_GROUP_OVERVIEW_RUNTIME_MODE" | "UZMAX_RLS_DATABASE_URL", string>
>;

class DisabledGroupOverviewRepository implements GroupOverviewRepositoryPort {
  runtimeStatus() {
    return "disabled" as const;
  }

  async listTenantAggregates(): Promise<never> {
    throw new GroupOverviewApiError(503, "group overview runtime is disabled");
  }
}

export function createGroupOverviewRepositoryProviderFromEnv(
  options: {
    env?: Env;
    mode?: GroupOverviewRuntimeMode;
    prismaClient?: GroupOverviewPrismaClientPort;
    repository?: GroupOverviewRepositoryPort;
    rlsTransactionRunner?: GroupOverviewRlsTransactionRunner;
  } = {}
) {
  const env = options.env ?? process.env;
  const mode = options.mode ?? readGroupOverviewRuntimeMode(env);
  if (mode === "disabled")
    return options.repository ?? new DisabledGroupOverviewRepository();
  const prisma =
    options.prismaClient ??
    (createUzmaxPrismaClientFromEnv(env) as unknown as GroupOverviewPrismaClientPort);
  return new RlsPrismaGroupOverviewRepository(
    options.rlsTransactionRunner ?? createGroupOverviewRlsTransactionRunner(prisma)
  );
}
