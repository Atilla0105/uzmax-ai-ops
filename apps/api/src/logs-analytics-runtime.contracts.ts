import type { AccessContext } from "../../../packages/authz/src/index.ts";
import type { RlsTenantContext } from "../../../packages/db/src/index.ts";
import type { UzmaxPrismaRuntimeEnv } from "../../../packages/db/src/prisma-runtime.ts";

export type Operation<T = unknown> = T | Promise<T>;
export type Row = Record<string, unknown>;
type Delegate = Partial<
  Record<"count" | "create" | "findFirst" | "findMany", (args: Row) => Operation>
>;
type Model =
  | "aiMember"
  | "auditLog"
  | "confirmationItem"
  | "distillHealthDaily"
  | "exportJob"
  | "loginLog"
  | "presenceLog";
export interface PrismaPort extends Record<Model, Delegate> {
  $executeRawUnsafe(sql: string): Operation;
  $queryRaw(...args: readonly unknown[]): Operation;
  $transaction<T extends readonly Operation[]>(
    ops: T
  ): Promise<{ [K in keyof T]: Awaited<T[K]> }>;
}
type RlsWork<T> = {
  map?(rows: readonly unknown[]): T;
  ops(client: PrismaPort): readonly Operation[];
  scope: RlsTenantContext;
};
export type RlsTxRunner = <T>(input: RlsWork<T>) => Promise<T>;
export type RuntimeEnv = UzmaxPrismaRuntimeEnv & {
  UZMAX_LOGS_ANALYTICS_RUNTIME_MODE?: string;
};
export type RuntimeMode = "disabled" | "rls_prisma_gateway";
export type RuntimeRequest = { accessContext?: AccessContext };
type LogKind = "login" | "operation" | "presence";
export type ListFilters = {
  from?: string;
  limit: number;
  memberUserId?: string;
  module?: string;
  status?: string;
  to?: string;
  type?: string;
};
export type ExportDraftInput = {
  filters: Record<string, unknown>;
  logKinds: readonly LogKind[];
  metricRefs: readonly string[];
  reasonRef: string;
  scope: Record<string, unknown>;
  traceId?: string;
};
export type LogsAnalyticsRuntimeRepositoryPort = {
  createExportDraft(ctx: AccessContext, input: ExportDraftInput): Promise<Row>;
  getBoard(ctx: AccessContext): Promise<Row>;
  listLoginLogs(ctx: AccessContext, filters: ListFilters): Promise<Row[]>;
  listOperationLogs(ctx: AccessContext, filters: ListFilters): Promise<Row[]>;
  listPresenceLogs(ctx: AccessContext, filters: ListFilters): Promise<Row[]>;
};

export const LOGS_ANALYTICS_RUNTIME_REPOSITORY = Symbol(
  "LOGS_ANALYTICS_RUNTIME_REPOSITORY"
);
export const logsAnalyticsRuntimeModes = {
  disabled: "disabled",
  rlsPrismaGateway: "rls_prisma_gateway"
} as const;
const LOG_KINDS = ["login", "operation", "presence"] as const;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i;
const REF = /^(controlled|manifest|redaction|storage):\/\/[a-z0-9][\w:/.-]{0,160}$/i;
const INLINE_REF = /^[A-Za-z0-9+/_-]{40,}={0,2}$/;
const BAD_KEY =
  /raw|prompt|completion|customer|telegram|order|phone|payment|secret|url|body|content|file/i;

export class LogsAnalyticsRuntimeError extends Error {
  constructor(
    readonly statusCode: 400 | 404 | 503,
    message: string
  ) {
    super(message);
    this.name = "LogsAnalyticsRuntimeError";
  }
}

export function readRuntimeMode(env: RuntimeEnv): RuntimeMode {
  const mode = env.UZMAX_LOGS_ANALYTICS_RUNTIME_MODE?.trim() || "disabled";
  if (mode === "prisma_gateway")
    throw new Error("logs analytics runtime env must use RLS Prisma gateway");
  if (mode === "disabled" || mode === "rls_prisma_gateway") return mode;
  throw new Error(`unsupported logs analytics runtime mode: ${mode}`);
}
export const scope = (ctx: AccessContext): RlsTenantContext => ({
  orgId: ctx.orgId,
  tenantId: ctx.selectedTenantId
});
export const setConfig = (
  prisma: Pick<PrismaPort, "$queryRaw">,
  { key, value }: { key: string; value: string }
) => {
  if (key !== "app.org_id" && key !== "app.tenant_id")
    throw new Error("logs analytics RLS setting is required");
  return prisma.$queryRaw`select set_config(${key}, ${value}, true)`;
};
export function listFilters(query: Row): ListFilters {
  safe(query);
  return {
    from: optionalDate(query.from, "from"),
    limit: limit(query.limit),
    memberUserId:
      query.memberUserId === undefined
        ? undefined
        : uuid(query.memberUserId, "memberUserId"),
    module: optionalText(query.module, "module"),
    status: optionalText(query.status, "status"),
    to: optionalDate(query.to, "to"),
    type: optionalText(query.type, "type")
  };
}
export function exportDraftInput(body: unknown): ExportDraftInput {
  const input = record(body, "export draft request");
  safe(input);
  const logKinds = array(input.logKinds, "logKinds").map(logKind);
  if (!logKinds.length) throw bad("logKinds must include at least one log kind");
  const metricRefs = array(input.metricRefs, "metricRefs").map((value, index) =>
    ref(value, `metricRefs[${index}]`)
  );
  return {
    filters: record(input.filters, "filters"),
    logKinds,
    metricRefs,
    reasonRef: ref(input.reasonRef, "reasonRef"),
    scope: record(input.scope, "scope"),
    traceId: input.traceId === undefined ? undefined : trace(input.traceId, "traceId")
  };
}
export function row(value: unknown, name: string): Row {
  return record(value, name);
}
export const text = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;
export const date = (value: unknown) =>
  value instanceof Date ? value.toISOString() : text(value);
const uuid = (value: unknown, name: string) => {
  const out = requiredText(value, name);
  if (!UUID.test(out)) throw bad(`${name} must be a UUID`);
  return out;
};
const bad = (message: string) => new LogsAnalyticsRuntimeError(400, message);

function safe(value: unknown, path = "request"): void {
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1)
      safe(value[index], `${path}[${index}]`);
    return;
  }
  if (value && typeof value === "object") return safeObject(value, path);
  if (typeof value === "string") safeString(value, path);
}
function safeObject(value: object, path: string): void {
  for (const [key, child] of Object.entries(value)) {
    if (BAD_KEY.test(key)) throw bad(`${path}.${key} is forbidden`);
    safe(child, `${path}.${key}`);
  }
}
function safeString(value: string, path: string): void {
  if (/^(https?|data|blob|file):/i.test(value) || INLINE_REF.test(value))
    throw bad(`${path} must be a controlled ref`);
}
function record(value: unknown, name: string): Row {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw bad(`${name} must be an object`);
  return value as Row;
}
function array(value: unknown, name: string): readonly unknown[] {
  if (!Array.isArray(value)) throw bad(`${name} must be an array`);
  return value;
}
function requiredText(value: unknown, name: string) {
  const out = typeof value === "string" ? value.trim() : "";
  if (!out) throw bad(`${name} is required`);
  return out;
}
function optionalText(value: unknown, name: string) {
  if (value === undefined) return undefined;
  const out = requiredText(value, name);
  if (!/^[a-z0-9:._-]{1,140}$/i.test(out)) throw bad(`${name} is invalid`);
  return out;
}
function optionalDate(value: unknown, name: string) {
  if (value === undefined) return undefined;
  const out = requiredText(value, name);
  if (Number.isNaN(Date.parse(out))) throw bad(`${name} must be an ISO date`);
  return out;
}
function limit(value: unknown) {
  if (value === undefined) return 50;
  const out = Number(value);
  if (!Number.isInteger(out) || out < 1 || out > 100)
    throw bad("limit must be an integer from 1 to 100");
  return out;
}
function logKind(value: unknown): LogKind {
  if (typeof value !== "string" || !LOG_KINDS.includes(value as LogKind))
    throw bad("logKinds contains an unsupported log kind");
  return value as LogKind;
}
function ref(value: unknown, name: string) {
  const out = requiredText(value, name);
  if (!REF.test(out) || INLINE_REF.test(out))
    throw bad(`${name} must be a controlled ref`);
  return out;
}
function trace(value: unknown, name: string) {
  const out = requiredText(value, name);
  if (!/^[a-z0-9:._-]{1,140}$/i.test(out)) throw bad(`${name} is invalid`);
  return out;
}
