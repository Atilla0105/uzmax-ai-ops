/* eslint-disable @typescript-eslint/no-explicit-any */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { createRlsTransactionContext } from "../../../packages/db/src/index.ts";
import {
  createUzmaxPrismaClientFromEnv,
  type UzmaxPrismaRuntimeEnv
} from "../../../packages/db/src/prisma-runtime.ts";
import {
  createDistillRuntimePersistenceProviderFromEnv,
  runDistillDailyHealthRuntime
} from "../../worker/src/distill-runtime.ts";
import { dateAtUtc, stringValue } from "../../worker/src/distill-runtime-contracts.ts";
import { createDailyDistillSchedulerJobPlan } from "./distill-scheduler.ts";

type Env = NodeJS.ProcessEnv &
  Partial<
    Record<
      | "UZMAX_CRON_DISTILL_PAYLOAD_JSON"
      | "UZMAX_CRON_DISTILL_PERSISTENCE_MODE"
      | "UZMAX_CRON_DISTILL_SCHEDULE_REF"
      | "UZMAX_CRON_DISTILL_STATE_PATH"
      | "UZMAX_DISTILL_RUNTIME_MODE",
      string
    >
  > &
  Partial<Record<"UZMAX_RLS_DATABASE_URL", string>>;
type CronRunStatus = "completed" | "failed" | "skipped";
type DailyRunKeyInput = {
  businessDate: string;
  jobName: string;
  orgId: string;
  tenantId: string;
};
type DailyRunStore = {
  close?(): Promise<void>;
  hasCompletedDailyRun(input: DailyRunKeyInput): Promise<boolean>;
  markCompleted(input: DailyRunKeyInput, result: any): Promise<void>;
};
type PersistenceMode = "artifact_smoke_file" | "rls_prisma_gateway";
type StateDocument = {
  completedDailyRuns?: Record<string, unknown>;
  distillRuns?: unknown[];
};

const defaultScheduleRef = "controlled://distill-schedule/m6b-03/daily";

export async function runCronServiceShellFromCli(env: Env = process.env) {
  const result = await runCronServiceShell(env);
  if (result.status === "failed") process.exitCode = 1;
}

export async function runCronServiceShell(env: Env = process.env) {
  const startedAt = new Date().toISOString();
  try {
    return await runCheckedCronServiceShell({ env, startedAt });
  } catch (error) {
    const result = {
      error: error instanceof Error ? error.message : String(error),
      service: "cron",
      startedAt,
      status: "failed" as CronRunStatus
    };
    log({ event: "cron.distill_daily.failed", ...result });
    return result;
  }
}

async function runCheckedCronServiceShell(input: { env: Env; startedAt: string }) {
  const payload = readPayload(input.env);
  const scheduleRef = input.env.UZMAX_CRON_DISTILL_SCHEDULE_REF ?? defaultScheduleRef;
  const job = createDailyDistillSchedulerJobPlan({ payload, scheduleRef });
  const keyInput = dailyRunKeyInput(job.jobName, job.payload);
  const persistenceMode = readPersistenceMode(input.env);
  const statePath = input.env.UZMAX_CRON_DISTILL_STATE_PATH;
  const store = createDailyRunStore({
    env: input.env,
    persistenceMode,
    statePath
  });
  try {
    logStart({
      keyInput,
      persistenceMode,
      scheduleRef,
      startedAt: input.startedAt
    });
    if (await store.hasCompletedDailyRun(keyInput)) {
      return logSkippedDailyRun(keyInput);
    }
    return await runAndLogCompletedDailyRun({
      env: input.env,
      jobPayload: job.payload,
      keyInput,
      persistenceMode,
      statePath,
      store
    });
  } finally {
    await store.close?.();
  }
}

function logStart(input: {
  keyInput: DailyRunKeyInput;
  persistenceMode: PersistenceMode;
  scheduleRef: string;
  startedAt: string;
}) {
  log({
    businessDate: input.keyInput.businessDate,
    event: "cron.distill_daily.start",
    jobName: input.keyInput.jobName,
    persistenceMode: input.persistenceMode,
    scheduleRef: input.scheduleRef,
    service: "cron",
    startedAt: input.startedAt
  });
}

function logSkippedDailyRun(keyInput: DailyRunKeyInput) {
  const result = resultFor("skipped", keyInput, {
    reason: "daily_unit_already_completed"
  });
  log({ event: "cron.distill_daily.skipped", ...result });
  return result;
}

async function runAndLogCompletedDailyRun(input: {
  env: Env;
  jobPayload: unknown;
  keyInput: DailyRunKeyInput;
  persistenceMode: PersistenceMode;
  statePath?: string;
  store: DailyRunStore;
}) {
  const persistence = createPersistence({
    env: input.env,
    persistenceMode: input.persistenceMode,
    statePath: input.statePath,
    store: input.store
  });
  const persisted = await runDistillDailyHealthRuntime(input.jobPayload, persistence);
  await input.store.markCompleted(input.keyInput, persisted);
  const result = resultFor("completed", input.keyInput, {
    confirmationItemCount: persisted.confirmationItems.length,
    distillRunId: persisted.persisted?.distillRunId ?? persisted.distillRun.id,
    healthDailyId: persisted.persisted?.healthDailyId ?? persisted.healthDaily.id,
    ownerAlertAuditLogId: persisted.persisted?.ownerAlertAuditLogId
  });
  log({ event: "cron.distill_daily.completed", ...result });
  return result;
}

function readPayload(env: Env) {
  const text = env.UZMAX_CRON_DISTILL_PAYLOAD_JSON?.trim();
  if (!text) throw new Error("UZMAX_CRON_DISTILL_PAYLOAD_JSON is required");
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("UZMAX_CRON_DISTILL_PAYLOAD_JSON must decode to an object");
  }
  return parsed;
}

function readPersistenceMode(env: Env): PersistenceMode {
  const mode =
    env.UZMAX_CRON_DISTILL_PERSISTENCE_MODE?.trim() ??
    env.UZMAX_DISTILL_RUNTIME_MODE?.trim();
  if (mode === "artifact_smoke_file") return mode;
  if (mode === "rls_prisma_gateway") return mode;
  throw new Error(
    "UZMAX_CRON_DISTILL_PERSISTENCE_MODE must be artifact_smoke_file or rls_prisma_gateway"
  );
}

function createPersistence(input: {
  env: Env;
  persistenceMode: PersistenceMode;
  store: DailyRunStore;
  statePath?: string;
}) {
  if (input.persistenceMode === "artifact_smoke_file") {
    return new FileBackedArtifactSmokePersistence(requiredStatePath(input.statePath));
  }
  return createDistillRuntimePersistenceProviderFromEnv({
    env: input.env as UzmaxPrismaRuntimeEnv &
      Partial<Record<"UZMAX_DISTILL_RUNTIME_MODE", string>>,
    mode: "rls_prisma_gateway",
    prismaClient:
      input.store instanceof RlsPrismaDailyRunStore
        ? input.store.prismaClient
        : undefined
  });
}

function createDailyRunStore(input: {
  env: Env;
  persistenceMode: PersistenceMode;
  statePath?: string;
}): DailyRunStore {
  if (input.persistenceMode === "artifact_smoke_file") {
    return new FileDailyRunStore(requiredStatePath(input.statePath));
  }
  return RlsPrismaDailyRunStore.create(input.env);
}

function requiredStatePath(value: string | undefined) {
  if (!value?.trim()) {
    throw new Error(
      "UZMAX_CRON_DISTILL_STATE_PATH is required for artifact smoke mode"
    );
  }
  return value.trim();
}

function dailyRunKeyInput(jobName: string, payload: any): DailyRunKeyInput {
  return {
    businessDate: stringValue(payload.businessDate, "businessDate"),
    jobName,
    orgId: stringValue(payload.orgId, "orgId"),
    tenantId: stringValue(payload.tenantId, "tenantId")
  };
}

function dailyRunKey(input: DailyRunKeyInput) {
  return `${input.jobName}:${input.orgId}:${input.tenantId}:${input.businessDate}`;
}

function resultFor(
  status: Exclude<CronRunStatus, "failed">,
  keyInput: DailyRunKeyInput,
  extra: Record<string, unknown>
) {
  return {
    businessDate: keyInput.businessDate,
    dailyRunKey: dailyRunKey(keyInput),
    jobName: keyInput.jobName,
    orgId: keyInput.orgId,
    service: "cron",
    status,
    tenantId: keyInput.tenantId,
    ...extra
  };
}

class FileBackedArtifactSmokePersistence {
  constructor(private readonly statePath: string) {}

  async persistDailyRun(plan: any) {
    const doc = await readState(this.statePath);
    const result = {
      ...plan,
      artifactSmokeOnly: true,
      persisted: {
        confirmationItemIds: plan.confirmationItems.map((item: any) => item.id),
        distillRunId: plan.distillRun.id,
        healthDailyId: plan.healthDaily.id,
        ownerAlertAuditLogId: plan.ownerAlertAudit?.id
      }
    };
    doc.distillRuns = [...(doc.distillRuns ?? []), result];
    await writeState(this.statePath, doc);
    return result;
  }
}

class FileDailyRunStore implements DailyRunStore {
  constructor(private readonly statePath: string) {}

  async hasCompletedDailyRun(input: DailyRunKeyInput) {
    const doc = await readState(this.statePath);
    return Boolean(doc.completedDailyRuns?.[dailyRunKey(input)]);
  }

  async markCompleted(input: DailyRunKeyInput, result: any) {
    const doc = await readState(this.statePath);
    doc.completedDailyRuns = {
      ...(doc.completedDailyRuns ?? {}),
      [dailyRunKey(input)]: {
        completedAt: new Date().toISOString(),
        distillRunId: result.persisted?.distillRunId ?? result.distillRun?.id,
        healthDailyId: result.persisted?.healthDailyId ?? result.healthDaily?.id
      }
    };
    await writeState(this.statePath, doc);
  }
}

class RlsPrismaDailyRunStore implements DailyRunStore {
  private constructor(readonly prismaClient: any) {}

  static create(env: Env) {
    return new RlsPrismaDailyRunStore(createUzmaxPrismaClientFromEnv(env));
  }

  async hasCompletedDailyRun(input: DailyRunKeyInput) {
    const [row] = await this.runInRls(input, (client) =>
      client.distillHealthDaily.findMany({
        where: {
          businessDate: dateAtUtc(input.businessDate),
          orgId: input.orgId,
          tenantId: input.tenantId
        }
      })
    );
    return Boolean(row);
  }

  async markCompleted() {
    // The RLS runtime writes distill_health_daily in the same daily unit.
  }

  async close() {
    await this.prismaClient.$disconnect();
  }

  private async runInRls(input: DailyRunKeyInput, operation: (client: any) => any) {
    const context = createRlsTransactionContext({
      orgId: input.orgId,
      tenantId: input.tenantId
    });
    const result = await this.prismaClient.$transaction([
      this.prismaClient.$executeRawUnsafe(context.roleSql),
      ...context.settings.map(
        (setting) =>
          this.prismaClient
            .$queryRaw`select set_config(${setting.key}, ${setting.value}, true)`
      ),
      operation(this.prismaClient)
    ]);
    return result.at(-1);
  }
}

async function readState(statePath: string): Promise<StateDocument> {
  try {
    return JSON.parse(await readFile(statePath, "utf8")) as StateDocument;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return {};
    throw error;
  }
}

async function writeState(statePath: string, doc: StateDocument) {
  await mkdir(path.dirname(statePath), { recursive: true });
  await writeFile(statePath, `${JSON.stringify(doc, null, 2)}\n`);
}

function log(event: Record<string, unknown>) {
  console.log(JSON.stringify(event));
}
