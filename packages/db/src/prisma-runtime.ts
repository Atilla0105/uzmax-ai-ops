import { PrismaClient } from "@prisma/client";

export type UzmaxPrismaRuntimeEnv = Partial<Record<"UZMAX_RLS_DATABASE_URL", string>>;
export type UzmaxPrismaClient = PrismaClient;

function readUzmaxRlsDatabaseUrl(
  env: UzmaxPrismaRuntimeEnv = process.env
): string | undefined {
  const value = env.UZMAX_RLS_DATABASE_URL?.trim();
  return value ? value : undefined;
}

export function createUzmaxPrismaClientFromEnv(
  env: UzmaxPrismaRuntimeEnv = process.env
): UzmaxPrismaClient {
  const databaseUrl = readUzmaxRlsDatabaseUrl(env);
  if (!databaseUrl) {
    throw new Error("UZMAX_RLS_DATABASE_URL is required for Prisma runtime");
  }

  return new PrismaClient({
    datasources: {
      db: { url: databaseUrl }
    }
  });
}
