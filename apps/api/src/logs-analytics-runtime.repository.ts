import { randomUUID } from "node:crypto";

import type { AccessContext } from "../../../packages/authz/src/index.ts";
import { createRlsTransactionContext } from "../../../packages/db/src/index.ts";
import { createUzmaxPrismaClientFromEnv } from "../../../packages/db/src/prisma-runtime.ts";
import * as c from "./logs-analytics-runtime.contracts.ts";

type Op = (p: c.PrismaPort) => c.Operation;
const off = async () => {
  throw new c.LogsAnalyticsRuntimeError(
    503,
    "logs analytics runtime is not configured"
  );
};

export function createLogsAnalyticsRuntimeRepositoryProviderFromEnv(
  options: {
    env?: c.RuntimeEnv;
    mode?: c.RuntimeMode;
    prismaClient?: c.PrismaPort;
    repository?: c.LogsAnalyticsRuntimeRepositoryPort;
    rlsTransactionRunner?: c.RlsTxRunner;
  } = {}
): c.LogsAnalyticsRuntimeRepositoryPort {
  const mode = options.mode ?? c.readRuntimeMode(options.env ?? process.env);
  if (mode === c.logsAnalyticsRuntimeModes.disabled)
    return (
      options.repository ?? {
        createExportDraft: off,
        getBoard: off,
        listLoginLogs: off,
        listOperationLogs: off,
        listPresenceLogs: off
      }
    );
  if (mode !== c.logsAnalyticsRuntimeModes.rlsPrismaGateway)
    throw new Error(`unsupported logs analytics runtime mode: ${mode}`);
  const prisma =
    options.prismaClient ??
    (createUzmaxPrismaClientFromEnv(options.env) as unknown as c.PrismaPort);
  return repo(options.rlsTransactionRunner ?? rlsRunner(prisma));
}

function repo(tx: c.RlsTxRunner): c.LogsAnalyticsRuntimeRepositoryPort {
  const list = async (ctx: AccessContext, filters: c.ListFilters, op: Op) =>
    tx<c.Row[]>({
      map: ([rows]) =>
        (Array.isArray(rows) ? rows : [])
          .map((item) => c.row(item, "log row"))
          .map(cleanLogRow),
      ops: (p) => [op(p)],
      scope: c.scope(ctx)
    });
  const where = (
    ctx: AccessContext,
    filters: c.ListFilters,
    timeField: string,
    includeMember = true
  ) =>
    clean({
      memberUserId: includeMember ? filters.memberUserId : undefined,
      orgId: ctx.orgId,
      tenantId: ctx.selectedTenantId,
      ...(filters.from || filters.to
        ? {
            [timeField]: clean({
              gte: filters.from ? new Date(filters.from) : undefined,
              lte: filters.to ? new Date(filters.to) : undefined
            })
          }
        : {})
    });
  const orderBy = (field: string) => ({ [field]: "desc" });
  return {
    listLoginLogs: (ctx, filters) =>
      list(ctx, filters, (p) =>
        call(p.loginLog.findMany, {
          orderBy: orderBy("occurredAt"),
          take: filters.limit,
          where: clean({
            ...where(ctx, filters, "occurredAt"),
            loginType: filters.type
          })
        })
      ),
    listPresenceLogs: (ctx, filters) =>
      list(ctx, filters, (p) =>
        call(p.presenceLog.findMany, {
          orderBy: orderBy("startedAt"),
          take: filters.limit,
          where: clean({
            ...where(ctx, filters, "startedAt"),
            status: filters.status
          })
        })
      ),
    listOperationLogs: (ctx, filters) =>
      list(ctx, filters, (p) =>
        call(p.auditLog.findMany, {
          orderBy: orderBy("occurredAt"),
          take: filters.limit,
          where: clean({
            ...where(ctx, filters, "occurredAt", false),
            module: filters.module,
            eventType: filters.type
          })
        })
      ),
    getBoard: async (ctx) => board(ctx, tx),
    createExportDraft: (ctx, input) =>
      tx<c.Row>({
        map: ([row]) => exportDraft(c.row(row, "export job row")),
        ops: (p) => [
          call(p.exportJob.create, {
            data: {
              createdByUserId: ctx.userId,
              filters: input.filters,
              fileRef: null,
              metadata: {
                formalExportWrite: false,
                logKinds: input.logKinds,
                metricRefs: input.metricRefs,
                reasonRef: input.reasonRef,
                requiresOwnerConfirmation: true,
                traceId: input.traceId
              },
              orgId: ctx.orgId,
              scope: input.scope,
              status: "DRAFT",
              tenantId: ctx.selectedTenantId
            }
          })
        ],
        scope: c.scope(ctx)
      })
  };
}

async function board(ctx: AccessContext, tx: c.RlsTxRunner) {
  const rls = c.scope(ctx);
  const rows = await tx<readonly unknown[]>({
    ops: (p) => [
      call(p.confirmationItem.count, {
        where: { ...rls, status: { in: ["APPROVED", "EDITED"] } }
      }),
      call(p.confirmationItem.count, {
        where: {
          ...rls,
          status: { in: ["APPROVED", "EDITED", "DISCARDED", "BLOCKED"] }
        }
      }),
      call(p.distillHealthDaily.findFirst, {
        orderBy: { businessDate: "desc" },
        where: rls
      }),
      call(p.aiMember.findMany, { where: rls })
    ],
    scope: rls
  });
  const approved = Number(rows[0] ?? 0);
  const reviewed = Number(rows[1] ?? 0);
  const health = rows[2] ? c.row(rows[2], "distill health row") : {};
  const members = Array.isArray(rows[3])
    ? rows[3].map((row) => c.row(row, "AI row"))
    : [];
  return {
    aiMemberStatusCounts: statusCounts(members),
    confirmationQueuePassRateBps: reviewed
      ? Math.round((approved / reviewed) * 10000)
      : 0,
    distillFrequency: String(health.frequency ?? "unknown").toLowerCase(),
    distillPassRateBps: Number(health.sevenDayPassRateBps ?? 0),
    generatedAt: new Date().toISOString(),
    source: "runtime_db_rls"
  };
}

function rlsRunner(prisma: c.PrismaPort): c.RlsTxRunner {
  return async ({ map, ops, scope }) => {
    const context = createRlsTransactionContext(scope);
    const setup: c.Operation[] = [prisma.$executeRawUnsafe(context.roleSql)];
    for (const setting of context.settings) setup.push(c.setConfig(prisma, setting));
    const rows = await prisma.$transaction([...setup, ...ops(prisma)]);
    const payloadRows = rows.slice(setup.length);
    return map ? map(payloadRows) : (payloadRows as never);
  };
}

function exportDraft(row: c.Row) {
  return {
    createdAt: c.date(row.createdAt),
    exportJobId: String(row.id),
    exportRef: `controlled://export-job/${row.id ?? randomUUID()}`,
    fileRef: null,
    formalExportWrite: false,
    requiresOwnerConfirmation: true,
    status: "draft_requires_owner_confirmation"
  };
}
function cleanLogRow(row: c.Row) {
  return clean({
    action: c.text(row.action),
    device: c.text(row.device),
    durationSeconds: row.durationSeconds,
    eventType: c.text(row.eventType),
    highRisk: /emergency|breaker|permission|config|export/i.test(
      String(row.eventType ?? row.action ?? "")
    ),
    id: row.id,
    loginType: c.text(row.loginType),
    memberUserId: row.memberUserId,
    module: c.text(row.module),
    objectType: row.objectType,
    occurredAt: c.date(row.occurredAt ?? row.startedAt ?? row.createdAt),
    status: c.text(row.status),
    updateMethod: c.text(row.updateMethod)
  });
}
function statusCounts(rows: readonly c.Row[]) {
  return rows.reduce<Record<string, number>>((acc, row) => {
    const key = String(row.status ?? "unknown").toLowerCase();
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}
function call(fn: unknown, args: c.Row) {
  if (typeof fn !== "function")
    throw new c.LogsAnalyticsRuntimeError(503, "Prisma delegate is incomplete");
  return fn(args) as c.Operation;
}
function clean<T extends c.Row>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined)
  ) as T;
}
