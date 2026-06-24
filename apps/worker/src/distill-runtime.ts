/* eslint-disable @typescript-eslint/no-explicit-any */
import { randomUUID } from "node:crypto";

import {
  createRlsTransactionContext,
  type RlsTenantContext
} from "../../../packages/db/src/index.ts";
import {
  createUzmaxPrismaClientFromEnv,
  type UzmaxPrismaRuntimeEnv
} from "../../../packages/db/src/prisma-runtime.ts";
import { createManualDistillRecoveryAuditContract } from "../../../packages/distill/src/index.ts";

export * from "./distill-runtime-contracts.ts";
import {
  businessDate,
  controlledRef,
  createDistillRuntimePlan,
  dateAtUtc,
  distillRuntimeModes,
  healthDailyScope,
  stringValue,
  toPrismaConfirmationItem,
  toPrismaDistillRun,
  toPrismaHealthDaily,
  toPrismaHealthDailyUpdate,
  uuidText,
  type DistillRuntimePlan
} from "./distill-runtime-contracts.ts";

type PrismaClientPort = any;
type PrismaOperation<T = unknown> = T | Promise<T>;
type RlsTxInput<T> = {
  mapResult?(result: readonly unknown[]): T;
  operations(client: PrismaClientPort): readonly PrismaOperation[];
  scope: RlsTenantContext;
};
type RlsTxRunner = <T>(input: RlsTxInput<T>) => Promise<T>;
type RuntimeMode = (typeof distillRuntimeModes)[keyof typeof distillRuntimeModes];
type RuntimeEnv = UzmaxPrismaRuntimeEnv &
  Partial<Record<"UZMAX_DISTILL_RUNTIME_MODE", string>>;
type ProviderInput = {
  disabledPersistence?: any;
  env?: RuntimeEnv;
  mode?: RuntimeMode;
  prismaClient?: PrismaClientPort;
  rlsTransactionRunner?: RlsTxRunner;
};

export class DisabledDistillRuntimePersistence {
  async persistDailyRun() {
    throw new Error("distill runtime persistence is disabled");
  }

  async recoverDailyFrequency() {
    throw new Error("distill runtime persistence is disabled");
  }
}

export async function runDistillDailyHealthRuntime(input: any, persistence: any) {
  return persistence.persistDailyRun(createDistillRuntimePlan(input));
}

export function createDistillRuntimePersistenceProviderFromEnv(
  options: ProviderInput = {}
) {
  const env = options.env ?? process.env;
  const mode = options.mode ?? readDistillRuntimeMode(env);
  if (mode === distillRuntimeModes.disabled) {
    return options.disabledPersistence ?? new DisabledDistillRuntimePersistence();
  }
  const prisma = (options.prismaClient ??
    createUzmaxPrismaClientFromEnv(env)) as unknown as PrismaClientPort;
  return new RlsPrismaDistillRuntimePersistence(
    options.rlsTransactionRunner ?? createDistillRlsTransactionRunner(prisma)
  );
}

class RlsPrismaDistillRuntimePersistence {
  constructor(private readonly runInRlsTransaction: RlsTxRunner) {}

  async persistDailyRun(plan: DistillRuntimePlan) {
    await this.runInRlsTransaction({
      operations: (client) => [
        client.distillRun.create({ data: toPrismaDistillRun(plan.distillRun) }),
        ...plan.confirmationItems.map((item) =>
          client.confirmationItem.create({ data: toPrismaConfirmationItem(item) })
        ),
        ...(plan.ownerAlertAudit
          ? [client.auditLog.create({ data: plan.ownerAlertAudit })]
          : []),
        client.distillHealthDaily.upsert({
          create: toPrismaHealthDaily(plan.healthDaily, plan.businessDate),
          update: toPrismaHealthDailyUpdate(plan.healthDaily),
          where: healthDailyScope(plan.healthDaily, plan.businessDate)
        })
      ],
      scope: { orgId: plan.distillRun.orgId, tenantId: plan.distillRun.tenantId }
    });
    return {
      ...plan,
      persisted: {
        confirmationItemIds: plan.confirmationItems.map((item) => item.id),
        distillRunId: plan.distillRun.id,
        healthDailyId: plan.healthDaily.id,
        ownerAlertAuditLogId: plan.ownerAlertAudit?.id
      }
    };
  }

  async recoverDailyFrequency(input: any) {
    const current = await this.readHealthDaily(input);
    const fromFrequency = runtimeFrequency(current.frequency);
    if (fromFrequency !== "weekly" && fromFrequency !== "paused") {
      throw new Error("manual recovery requires current weekly or paused frequency");
    }
    const auditLogId = randomUUID();
    const contract = recoveryContract(input, auditLogId, fromFrequency);
    await this.runInRlsTransaction({
      operations: (client) => [
        client.auditLog.create({
          data: recoveryAuditFor(input, auditLogId, current, contract)
        }),
        client.distillHealthDaily.update({
          data: {
            downshifted: false,
            frequency: "DAILY",
            metadata: recoveryMetadata(current.metadata, auditLogId, contract),
            recoveryAuditLogId: auditLogId
          },
          where: { id: stringValue(current.id, "healthDailyId") }
        })
      ],
      scope: { orgId: input.orgId, tenantId: input.tenantId }
    });
    return {
      auditLogId,
      businessDate: input.businessDate,
      fromFrequency,
      healthDailyId: stringValue(current.id, "healthDailyId"),
      toFrequency: "daily"
    };
  }

  private readHealthDaily(input: any) {
    return this.runInRlsTransaction<Record<string, unknown>>({
      mapResult: ([row]) => {
        if (!row) throw new Error("distill health daily row not found");
        return recordValue(row, "distill health daily row");
      },
      operations: (client) => [
        client.distillHealthDaily.findFirst({
          where: {
            businessDate: dateAtUtc(businessDate(input.businessDate)),
            orgId: uuidText(input.orgId, "orgId"),
            tenantId: uuidText(input.tenantId, "tenantId")
          }
        })
      ],
      scope: { orgId: input.orgId, tenantId: input.tenantId }
    });
  }
}

function createDistillRlsTransactionRunner(prisma: PrismaClientPort): RlsTxRunner {
  return async (input) => {
    const context = createRlsTransactionContext(input.scope);
    const operations = input.operations(prisma);
    if (operations.length === 0) throw new Error("distill RLS transaction is empty");
    const result = await prisma.$transaction([
      prisma.$executeRawUnsafe(context.roleSql),
      ...context.settings.map((setting) => createSetConfigOperation(prisma, setting)),
      ...operations
    ]);
    const business = result.slice(3);
    return input.mapResult ? input.mapResult(business) : (business as never);
  };
}

const runtimeFrequencyByPrisma = {
  DAILY: "daily",
  PAUSED: "paused",
  WEEKLY: "weekly"
} as const;

function recoveryAuditFor(input: any, auditLogId: string, current: any, contract: any) {
  return {
    action: "distill_frequency_manual_recovery",
    actorUserId: uuidText(input.actorUserId, "actorUserId"),
    content: {
      after: contract,
      before: {
        frequency: runtimeFrequency(current.frequency),
        healthDailyId: current.id
      }
    },
    eventType: "distill.manual_recovery",
    id: auditLogId,
    module: "distill",
    objectId: stringValue(current.id, "healthDailyId"),
    objectType: "distill_health_daily",
    orgId: input.orgId,
    tenantId: input.tenantId,
    traceId: `distill-recovery:${input.businessDate}`
  };
}

function recoveryMetadata(value: unknown, auditLogId: string, contract: any) {
  return {
    ...recordValue(value ?? {}, "metadata"),
    manualRecovery: {
      auditLogId,
      auditRef: `controlled://audit-log/${auditLogId}`,
      contract
    }
  };
}

function runtimeFrequency(value: unknown): "daily" | "paused" | "weekly" {
  if (typeof value === "string" && value in runtimeFrequencyByPrisma) {
    return runtimeFrequencyByPrisma[value as keyof typeof runtimeFrequencyByPrisma];
  }
  if (value === "daily" || value === "paused" || value === "weekly") return value;
  throw new Error("distill frequency is invalid");
}

function recoveryContract(
  input: any,
  auditLogId: string,
  fromFrequency: "paused" | "weekly"
) {
  return createManualDistillRecoveryAuditContract({
    actorRef: `controlled://user/${uuidText(input.actorUserId, "actorUserId")}`,
    auditRef: `controlled://audit-log/${auditLogId}`,
    fromFrequency,
    healthSummaryRef: controlledRef(input.healthSummaryRef, "healthSummaryRef"),
    reasonRef: controlledRef(input.reasonRef, "reasonRef"),
    recoveryRef: controlledRef(input.recoveryRef, "recoveryRef"),
    toFrequency: "daily"
  });
}

function recordValue(value: unknown, name: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${name} must be an object`);
  }
  return value as Record<string, unknown>;
}

function readDistillRuntimeMode(env: RuntimeEnv): RuntimeMode {
  const mode = env.UZMAX_DISTILL_RUNTIME_MODE?.trim() ?? distillRuntimeModes.disabled;
  if (mode === distillRuntimeModes.disabled) return mode;
  if (mode === distillRuntimeModes.rlsPrismaGateway) return mode;
  if (mode === "prisma_gateway") {
    throw new Error("distill runtime env must use RLS Prisma gateway");
  }
  throw new Error(`unsupported distill runtime mode: ${mode}`);
}

function createSetConfigOperation(
  prisma: Pick<PrismaClientPort, "$queryRaw">,
  setting: { key: "app.org_id" | "app.tenant_id"; value: string }
) {
  return prisma.$queryRaw`select set_config(${setting.key}, ${setting.value}, true)`;
}
