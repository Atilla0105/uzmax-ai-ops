import type { AccessContext } from "../../../packages/authz/src/index.ts";
import {
  createRlsTransactionContext,
  type RlsTenantContext
} from "../../../packages/db/src/index.ts";

import * as c from "./group-overview.contracts.ts";

type Op<T = unknown> = T | Promise<T>;
type Row = Record<string, unknown>;
type Delegate = Partial<Record<"count" | "findFirst", (args: Row) => Op>>;
export type GroupOverviewPrismaClientPort = Record<string, Delegate> & {
  $executeRawUnsafe(sql: string): Op;
  $queryRaw(strings: TemplateStringsArray, ...values: readonly unknown[]): Op;
  $transaction<T extends readonly Op[]>(
    ops: T
  ): Promise<{ [K in keyof T]: Awaited<T[K]> }>;
};
type RlsWork<T> = {
  map(rows: readonly unknown[]): T;
  ops(client: GroupOverviewPrismaClientPort): readonly Op[];
  scope: RlsTenantContext;
};
export type GroupOverviewRlsTransactionRunner = <T>(work: RlsWork<T>) => Promise<T>;
export type GroupOverviewRepositoryPort = {
  listTenantAggregates(
    access: AccessContext,
    window: c.GroupOverviewWindow
  ): Promise<c.GroupOverviewTenantAggregate[]>;
  runtimeStatus(): c.GroupOverviewRuntimeStatus;
};

const SOURCE_GAPS =
  "business_line_source_unavailable channel_source_unavailable connector_health_unavailable cost_source_unavailable model_fault_source_unavailable order_source_unavailable redline_source_unavailable source_partial".split(
    " "
  ) as c.GroupOverviewSourceGap[];

export class RlsPrismaGroupOverviewRepository implements GroupOverviewRepositoryPort {
  constructor(private readonly tx: GroupOverviewRlsTransactionRunner) {}

  runtimeStatus() {
    return "configured" as const;
  }

  async listTenantAggregates(access: AccessContext, window: c.GroupOverviewWindow) {
    const rows: c.GroupOverviewTenantAggregate[] = [];
    for (const tenantId of [...new Set(access.tenantIds)].sort()) {
      const scope = { orgId: access.orgId, tenantId };
      const row = await this.tx<c.GroupOverviewTenantAggregate | undefined>({
        map: (loaded) => mapTenantAggregate(scope, loaded),
        ops: (client) => tenantAggregateOps(client, scope, window),
        scope
      });
      if (row) rows.push(row);
    }
    return rows;
  }
}

export function createGroupOverviewRlsTransactionRunner(
  prisma: GroupOverviewPrismaClientPort
): GroupOverviewRlsTransactionRunner {
  assertPrisma(prisma);
  return async ({ map, ops, scope }) => {
    const context = createRlsTransactionContext(scope);
    const setup: Op[] = [prisma.$executeRawUnsafe(context.roleSql)];
    for (const setting of context.settings) setup.push(setConfig(prisma, setting));
    const results = await prisma.$transaction([...setup, ...ops(prisma)]);
    return map(results.slice(setup.length));
  };
}

function tenantAggregateOps(
  p: GroupOverviewPrismaClientPort,
  scope: RlsTenantContext,
  window: c.GroupOverviewWindow
) {
  const w = { gte: new Date(window.start), lte: new Date(window.end) };
  const where = { orgId: scope.orgId, tenantId: scope.tenantId };
  return [
    call(p.tenant!.findFirst, {
      select: { id: true, name: true, slug: true, status: true, updatedAt: true },
      where: { id: scope.tenantId, orgId: scope.orgId }
    }),
    call(p.channelConversation!.count, { where: { ...where, createdAt: w } }),
    call(p.supportTicket!.count, {
      where: { ...where, status: { in: ["OPEN", "ESCALATED", "REOPENED"] } }
    }),
    call(p.supportTicket!.count, {
      where: {
        ...where,
        slaDueAt: { lte: new Date(window.end) },
        status: { not: "CLOSED" }
      }
    }),
    call(p.aiMember!.count, { where: { ...where, status: "BREAKER_OFFLINE" } }),
    call(p.evalGate!.findFirst, { orderBy: { updatedAt: "desc" }, where })
  ];
}

function mapTenantAggregate(
  scope: RlsTenantContext,
  rows: readonly unknown[]
): c.GroupOverviewTenantAggregate | undefined {
  const tenant = rec(rows[0]);
  if (!tenant.id) return undefined;
  const sessions = num(rows[1]);
  const humanNeeded = num(rows[2]);
  const aiBreakerCount = num(rows[4]);
  const partialSources = c.unique(SOURCE_GAPS);
  const degraded = c.unique(
    rows[5] ? partialSources : [...partialSources, "eval_state_unavailable"]
  );
  return {
    aiBreakerCount,
    aiCostMicros: null,
    businessLine: null,
    channelConnectorStatus: "partial",
    degraded,
    evalStatus: evalStatus(rec(rows[5]).status),
    generatedAt: new Date().toISOString(),
    handoffRateBps: sessions ? Math.round((humanNeeded / sessions) * 10000) : 0,
    healthCategory: aiBreakerCount
      ? "breaker"
      : degraded.length
        ? "degraded"
        : "healthy",
    humanNeeded,
    lastAbnormalAggregateEvent: null,
    modelFaultCount: null,
    orderConnectorStatus: "partial",
    partialSources,
    redlineEventCountToday: null,
    sessions,
    slaRisk: num(rows[3]),
    sourceWatermark: c.watermark(partialSources, maxDate([tenant.updatedAt])),
    tenantId: String(tenant.id ?? scope.tenantId),
    tenantRef: String(tenant.slug),
    tenantStatus: String(tenant.status).toLowerCase(),
    title: String(tenant.name)
  };
}

function evalStatus(value: unknown): c.GroupOverviewEvalStatus {
  return (
    (
      {
        BLOCKED: "blocked",
        FAILED: "failed",
        PASSED: "pass",
        PENDING: "running"
      } as const
    )[String(value)] ?? "unavailable"
  );
}
function maxDate(values: readonly unknown[]) {
  const dates = values
    .map((v) => Date.parse(v instanceof Date ? v.toISOString() : String(v ?? "")))
    .filter(Number.isFinite);
  return dates.length ? new Date(Math.max(...dates)).toISOString() : null;
}
function num(value: unknown) {
  return Number(value ?? 0);
}
function rec(value: unknown): Row {
  return value && typeof value === "object" ? (value as Row) : {};
}
function call(fn: unknown, args: Row) {
  if (typeof fn !== "function")
    throw new c.GroupOverviewApiError(
      503,
      "group overview Prisma delegate is incomplete"
    );
  return fn(args) as Op;
}
function assertPrisma(value: GroupOverviewPrismaClientPort) {
  for (const method of ["$executeRawUnsafe", "$queryRaw", "$transaction"]) {
    if (typeof value?.[method as keyof GroupOverviewPrismaClientPort] !== "function")
      throw new Error(`group overview runtime Prisma client requires ${method}`);
  }
}
function setConfig(
  prisma: Pick<GroupOverviewPrismaClientPort, "$queryRaw">,
  setting: { key: string; value: string }
) {
  if (setting.key !== "app.org_id" && setting.key !== "app.tenant_id")
    throw new Error("group overview RLS setting is required");
  return prisma.$queryRaw`select set_config(${setting.key}, ${setting.value}, true)`;
}
