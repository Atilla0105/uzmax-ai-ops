import type { AccessContext } from "../../../packages/authz/src/index.ts";
import {
  createRlsTransactionContext,
  type RlsTenantContext
} from "../../../packages/db/src/index.ts";
import {
  createUzmaxPrismaClientFromEnv,
  type UzmaxPrismaRuntimeEnv
} from "../../../packages/db/src/prisma-runtime.ts";

import { toPrismaAuditLogCreateData } from "./audit-log.prisma-sink.ts";
import {
  assertConflictDiffBeforeFormalWrite,
  createFormalWriteContracts,
  prismaDomainByContract,
  readConfigTarget,
  readPreviousConfigVersion,
  toPrismaConfigVersionCreateData,
  type ConfigTarget,
  type PreviousConfigVersion
} from "./confirmation-queue.formal-write-contracts.ts";
import {
  confirmationQueuePrismaStatusByApi,
  mapConfirmationItemRow
} from "./confirmation-queue.prisma-mapper.ts";
import type {
  ConfirmationDecisionInput,
  ConfirmationQueueItem
} from "./confirmation-queue.types.ts";

type MaybePromise<T> = T | Promise<T>;
type PrismaBatchOperation<T = unknown> = MaybePromise<T>;
type PrismaDelegate = Record<
  string,
  (...args: readonly unknown[]) => PrismaBatchOperation
>;

type ConfirmationFormalWritePrismaClientPort = {
  auditLog: PrismaDelegate;
  configVersion: PrismaDelegate;
  confirmationItem: PrismaDelegate;
  $executeRawUnsafe(sql: string): PrismaBatchOperation;
  $queryRaw(
    strings: TemplateStringsArray,
    ...values: readonly unknown[]
  ): PrismaBatchOperation;
  $transaction<T extends readonly PrismaBatchOperation[]>(
    operations: T
  ): Promise<{ [K in keyof T]: Awaited<T[K]> }>;
};
type ConfirmationFormalWriteRlsTransactionInput<T> = {
  mapResult(result: readonly unknown[]): T;
  operations(
    client: ConfirmationFormalWritePrismaClientPort
  ): readonly PrismaBatchOperation[];
  scope: RlsTenantContext;
};
type ConfirmationFormalWriteRlsTransactionRunner = <T>(
  input: ConfirmationFormalWriteRlsTransactionInput<T>
) => Promise<T>;
type ConfirmationFormalWriteRuntimeEnv = UzmaxPrismaRuntimeEnv &
  Partial<Record<"UZMAX_CONFIRMATION_FORMAL_WRITE_MODE", string>>;
type ConfirmationFormalWriteRuntimeMode =
  (typeof confirmationFormalWriteRuntimeModes)[keyof typeof confirmationFormalWriteRuntimeModes];
type ConfirmationFormalWriteProviderInput = {
  disabledPipeline?: ConfirmationFormalWritePipelinePort;
  env?: ConfirmationFormalWriteRuntimeEnv;
  mode?: ConfirmationFormalWriteRuntimeMode;
  prismaClient?: ConfirmationFormalWritePrismaClientPort;
  rlsTransactionRunner?: ConfirmationFormalWriteRlsTransactionRunner;
};

export type ConfirmationFormalWriteInput = {
  accessContext: AccessContext;
  auditDraft: Record<string, unknown>;
  decision: ConfirmationDecisionInput;
  item: ConfirmationQueueItem;
};
type ConfirmationFormalWriteResult = {
  auditDraft: Record<string, unknown>;
  formalWrite: boolean;
  item: ConfirmationQueueItem;
};
export type ConfirmationFormalWritePipelinePort = {
  apply(
    input: ConfirmationFormalWriteInput
  ): MaybePromise<ConfirmationFormalWriteResult>;
};

export const CONFIRMATION_FORMAL_WRITE_PIPELINE = Symbol(
  "CONFIRMATION_FORMAL_WRITE_PIPELINE"
);
const confirmationFormalWriteRuntimeModes = {
  disabled: "disabled",
  rlsPrismaGateway: "rls_prisma_gateway"
} as const;

export class DisabledConfirmationFormalWritePipeline implements ConfirmationFormalWritePipelinePort {
  async apply(input: ConfirmationFormalWriteInput) {
    return { auditDraft: input.auditDraft, formalWrite: false, item: input.item };
  }
}

export function createConfirmationFormalWritePipelineProviderFromEnv(
  options: ConfirmationFormalWriteProviderInput = {}
): ConfirmationFormalWritePipelinePort {
  const env = options.env ?? process.env;
  const mode = options.mode ?? readFormalWriteRuntimeMode(env);
  if (mode === confirmationFormalWriteRuntimeModes.disabled) {
    return options.disabledPipeline ?? new DisabledConfirmationFormalWritePipeline();
  }
  if (mode === confirmationFormalWriteRuntimeModes.rlsPrismaGateway) {
    return new RlsPrismaConfirmationFormalWritePipeline(
      options.rlsTransactionRunner ??
        createConfirmationFormalWriteRlsTransactionRunner(
          options.prismaClient ??
            (createUzmaxPrismaClientFromEnv(
              env
            ) as unknown as ConfirmationFormalWritePrismaClientPort)
        )
    );
  }
  throw new Error(`unsupported formal write runtime mode: ${String(mode)}`);
}

function createConfirmationFormalWriteRlsTransactionRunner(
  prisma: ConfirmationFormalWritePrismaClientPort
): ConfirmationFormalWriteRlsTransactionRunner {
  assertFormalWritePrismaClientPort(prisma);
  return async function runFormalWriteRlsTransaction<T>(
    input: ConfirmationFormalWriteRlsTransactionInput<T>
  ): Promise<T> {
    assertFormalWritePrismaClientPort(prisma);
    const context = createRlsTransactionContext(input.scope);
    const operations = input.operations(prisma);
    if (operations.length === 0) {
      throw new Error("formal write RLS transaction requires operations");
    }
    const result = await prisma.$transaction([
      prisma.$executeRawUnsafe(context.roleSql),
      ...context.settings.map((setting) => createSetConfigOperation(prisma, setting)),
      ...operations
    ]);
    return input.mapResult(result.slice(3));
  };
}

class RlsPrismaConfirmationFormalWritePipeline implements ConfirmationFormalWritePipelinePort {
  constructor(
    private readonly runInRlsTransaction: ConfirmationFormalWriteRlsTransactionRunner
  ) {}

  async apply(input: ConfirmationFormalWriteInput) {
    if (!isFormalWriteDecision(input)) {
      return { auditDraft: input.auditDraft, formalWrite: false, item: input.item };
    }

    assertConflictDiffBeforeFormalWrite(input.item);
    const target = readConfigTarget(input);
    const previous = await this.findPreviousConfig(input.item, target);
    const contracts = createFormalWriteContracts(input, target, previous);
    const updatedItem = await this.runInRlsTransaction({
      mapResult: (result) => mapConfirmationItemRow(result.at(-1)),
      operations: (client) => [
        client.configVersion.create!({
          data: toPrismaConfigVersionCreateData(contracts.configContract)
        }),
        client.auditLog.create!({
          data: {
            id: contracts.auditLogId,
            ...toPrismaAuditLogCreateData(contracts.auditContract)
          }
        }),
        client.confirmationItem.update!({
          data: {
            auditLogId: contracts.auditLogId,
            metadata: contracts.metadata,
            reviewedAt: input.item.reviewedAt
              ? new Date(input.item.reviewedAt)
              : new Date(contracts.writtenAt),
            reviewedByUserId: input.accessContext.userId,
            status: confirmationQueuePrismaStatusByApi[input.item.status],
            targetKind: "config_version",
            targetRef: target.targetRef
          },
          where: { id: input.item.id }
        })
      ],
      scope: { orgId: input.item.orgId, tenantId: input.item.tenantId }
    });

    return {
      auditDraft: {
        ...input.auditDraft,
        auditLogId: contracts.auditLogId,
        auditRef: `controlled://audit-log/${contracts.auditLogId}`,
        configVersionId: contracts.configContract.id,
        formalWrite: true,
        targetKind: "config_version",
        targetRef: target.targetRef
      },
      formalWrite: true,
      item: updatedItem
    };
  }

  private findPreviousConfig(item: ConfirmationQueueItem, target: ConfigTarget) {
    return this.runInRlsTransaction<PreviousConfigVersion | undefined>({
      mapResult: ([row]) => (row ? readPreviousConfigVersion(row) : undefined),
      operations: (client) => [
        client.configVersion.findFirst!({
          orderBy: { version: "desc" },
          where: {
            domain: prismaDomainByContract[target.domain],
            key: target.key,
            orgId: item.orgId,
            tenantId: item.tenantId
          }
        })
      ],
      scope: { orgId: item.orgId, tenantId: item.tenantId }
    });
  }
}

function readFormalWriteRuntimeMode(
  env: ConfirmationFormalWriteRuntimeEnv = process.env
): ConfirmationFormalWriteRuntimeMode {
  const mode =
    env.UZMAX_CONFIRMATION_FORMAL_WRITE_MODE?.trim() ??
    confirmationFormalWriteRuntimeModes.disabled;
  if (mode === confirmationFormalWriteRuntimeModes.disabled) return mode;
  if (mode === confirmationFormalWriteRuntimeModes.rlsPrismaGateway) return mode;
  if (mode === "prisma_gateway") {
    throw new Error("formal write env runtime must use RLS Prisma gateway");
  }
  throw new Error(`unsupported formal write runtime mode: ${mode}`);
}

function isFormalWriteDecision(input: ConfirmationFormalWriteInput) {
  return (
    (input.decision.action === "approve" && input.item.status === "approved") ||
    (input.decision.action === "edit" && input.item.status === "edited")
  );
}

function assertFormalWritePrismaClientPort(
  value: ConfirmationFormalWritePrismaClientPort
): asserts value is ConfirmationFormalWritePrismaClientPort {
  if (!value || typeof value !== "object") {
    throw new Error("formal write runtime Prisma client port is required");
  }
  const requiredMethods = {
    $executeRawUnsafe: value.$executeRawUnsafe,
    $queryRaw: value.$queryRaw,
    $transaction: value.$transaction,
    "auditLog.create": value.auditLog?.create,
    "configVersion.create": value.configVersion?.create,
    "configVersion.findFirst": value.configVersion?.findFirst,
    "confirmationItem.update": value.confirmationItem?.update
  };
  for (const name of Object.keys(requiredMethods)) {
    const method = requiredMethods[name as keyof typeof requiredMethods];
    if (typeof method !== "function") {
      throw new Error(`formal write runtime Prisma client requires ${name}`);
    }
  }
}

function readFormalWriteRlsSetting(
  setting: { key?: unknown; value?: unknown } | undefined
): {
  key: "app.org_id" | "app.tenant_id";
  value: string;
} {
  const key =
    setting?.key === "app.org_id" || setting?.key === "app.tenant_id"
      ? setting.key
      : undefined;
  const value = typeof setting?.value === "string" ? setting.value.trim() : "";
  if (!key || !value) {
    throw new Error("formal write RLS batch setting is required");
  }
  return { key, value };
}

function createSetConfigOperation(
  prisma: Pick<ConfirmationFormalWritePrismaClientPort, "$queryRaw">,
  rawSetting: { key?: unknown; value?: unknown } | undefined
) {
  const setting = readFormalWriteRlsSetting(rawSetting);
  return prisma.$queryRaw`select set_config(${setting.key}, ${setting.value}, true)`;
}
