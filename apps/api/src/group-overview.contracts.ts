import type { AccessContext } from "../../../packages/authz/src/index.ts";

export const GROUP_OVERVIEW_PERMISSION = "group:overview:read";
export const GROUP_OVERVIEW_REPOSITORY = Symbol("GROUP_OVERVIEW_REPOSITORY");
const GROUP_OVERVIEW_READ_MODEL_VERSION = "group_overview_tenant_aggregate_v1";

export type GroupOverviewRuntimeMode = "disabled" | "rls_prisma_gateway";
export type GroupOverviewRuntimeStatus = "configured" | "disabled";
export type GroupOverviewStateKind =
  | "ready"
  | "empty"
  | "disabled"
  | "degraded"
  | "stale"
  | "error"
  | `permission_${"denied"}`
  | `partial_${"source"}`;
export type GroupOverviewSourceGap =
  | `${"business_line" | "channel" | "cost" | "model_fault" | "order" | "redline"}_source_unavailable`
  | "connector_health_unavailable"
  | "eval_state_unavailable"
  | "permission_scope_partial"
  | `read_model_${"refresh_not_configured" | "unavailable"}`
  | `source_${"partial" | "stale" | "unavailable"}`;
type GroupOverviewHealthCategory =
  | "attention"
  | "breaker"
  | "degraded"
  | "healthy"
  | "offline"
  | "unknown";
export type GroupOverviewEvalStatus =
  | "blocked"
  | "failed"
  | "pass"
  | "running"
  | "stale"
  | "unavailable";
type GroupOverviewSourceStatus =
  | "degraded"
  | "fault"
  | "normal"
  | "partial"
  | "stale"
  | "unavailable";
export type GroupOverviewWindow = { end: string; start: string };
export type GroupOverviewQuery = { windowHours: number };
export type GroupOverviewState = {
  degraded: boolean;
  kind: GroupOverviewStateKind;
  message: string;
  partialSources: GroupOverviewSourceGap[];
  reasons: GroupOverviewSourceGap[];
};
export type GroupOverviewSourceWatermark = {
  maxSourceUpdatedAt: string | null;
  partialSources: GroupOverviewSourceGap[];
  readModelVersion: typeof GROUP_OVERVIEW_READ_MODEL_VERSION;
};
type GroupOverviewTenantRow = {
  channelConnectorStatus: GroupOverviewSourceStatus;
  degraded: GroupOverviewSourceGap[];
  evalStatus: GroupOverviewEvalStatus;
  healthCategory: GroupOverviewHealthCategory;
  lastAbnormalAggregateEvent: null;
  orderConnectorStatus: GroupOverviewSourceStatus;
  partialSources: GroupOverviewSourceGap[];
  sourceWatermark: GroupOverviewSourceWatermark;
} & Record<
  "aiBreakerCount" | "handoffRateBps" | "humanNeeded" | "sessions" | "slaRisk",
  number
> &
  Record<"aiCostMicros" | "modelFaultCount" | "redlineEventCountToday", number | null> &
  Record<
    "generatedAt" | "tenantId" | "tenantRef" | "tenantStatus" | "title",
    string
  > & { businessLine: string | null };
export type GroupOverviewTenantAggregate = GroupOverviewTenantRow;
type GroupOverviewHealthSummary = {
  abnormalTenantCount: number;
  aiBreakerCount: number;
  channelConnectorFaultCount: null;
  modelFaultCount: null;
  orderConnectorFaultCount: null;
  redlineEventCountToday: null;
  tenantCount: number;
};
export type GroupOverviewRuntimeResponse = {
  access: ReturnType<typeof accessSummary>;
  generatedAt: string;
  healthSummary: GroupOverviewHealthSummary;
  sourceWatermark: GroupOverviewSourceWatermark;
  state: GroupOverviewState;
  tenants: GroupOverviewTenantAggregate[];
  window: GroupOverviewWindow;
};

const QUERY_KEYS = new Set(["windowHours", "window_hours"]);
const FORBIDDEN_KEY =
  /raw|prompt|completion|customerplaintext|customerdisplayname|customername|phone|telegramusername|externaluserid|messagetext|transcript|screenshot|voicetranscript|raworder|address|payment|secret|token|cookie|storageurl|providerresponse|toolpayload|blob|base64/;

export class GroupOverviewApiError extends Error {
  constructor(
    readonly statusCode: 400 | 403 | 503,
    message: string,
    readonly response?: GroupOverviewRuntimeResponse
  ) {
    super(message);
    this.name = "GroupOverviewApiError";
  }
}

export function readGroupOverviewRuntimeMode(env: {
  UZMAX_GROUP_OVERVIEW_RUNTIME_MODE?: string;
}): GroupOverviewRuntimeMode {
  const mode = env.UZMAX_GROUP_OVERVIEW_RUNTIME_MODE?.trim() || "disabled";
  if (mode === "prisma_gateway")
    throw new Error("group overview runtime env must use RLS Prisma gateway");
  if (mode === "disabled" || mode === "rls_prisma_gateway") return mode;
  throw new Error(`unsupported group overview runtime mode: ${mode}`);
}

export function parseGroupOverviewQuery(
  query: Record<string, unknown>
): GroupOverviewQuery {
  assertNoForbiddenPayload(query, "groupOverview.query");
  for (const key of Object.keys(query)) {
    if (!QUERY_KEYS.has(key))
      throw bad(`${key} is not a supported group overview query field`);
  }
  const raw = query.windowHours ?? query.window_hours ?? 24;
  const windowHours = Number(Array.isArray(raw) ? raw[0] : raw);
  if (!Number.isInteger(windowHours) || windowHours < 1 || windowHours > 168) {
    throw bad("windowHours must be an integer from 1 to 168");
  }
  return { windowHours };
}

export function accessSummary(access: AccessContext) {
  return {
    authorizedTenantIds: [...new Set(access.tenantIds)].sort(),
    orgId: access.orgId,
    permission: GROUP_OVERVIEW_PERMISSION,
    selectedTenantId: access.selectedTenantId
  };
}

export function watermark(
  partialSources: readonly GroupOverviewSourceGap[],
  maxSourceUpdatedAt: string | null
): GroupOverviewSourceWatermark {
  return {
    maxSourceUpdatedAt,
    partialSources: unique(partialSources),
    readModelVersion: GROUP_OVERVIEW_READ_MODEL_VERSION
  };
}

export function state(
  kind: GroupOverviewStateKind,
  message: string,
  reasons: readonly GroupOverviewSourceGap[] = []
): GroupOverviewState {
  const values = unique(reasons);
  return {
    degraded: kind !== "ready" && kind !== "empty",
    kind,
    message,
    partialSources: values,
    reasons: values
  };
}

export function assertNoForbiddenPayload(value: unknown, path = "payload"): void {
  if (typeof value === "string") return assertSafeString(value, path);
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value))
    return void value.forEach((item, index) =>
      assertNoForbiddenPayload(item, `${path}[${index}]`)
    );
  for (const [key, child] of Object.entries(value)) {
    if (isForbiddenKey(key)) throw bad(`${path}.${key} is a forbidden raw field`);
    assertNoForbiddenPayload(child, `${path}.${key}`);
  }
}

export function unique<T extends string>(items: readonly T[]): T[] {
  return [...new Set(items)].sort();
}

function isForbiddenKey(key: string) {
  return FORBIDDEN_KEY.test(key.replace(/[^a-zA-Z0-9]/g, "").toLowerCase());
}
function assertSafeString(value: string, path: string) {
  if (
    /^(https?|data|blob|file):/i.test(value) ||
    /^[A-Za-z0-9+/_-]{80,}={0,2}$/.test(value)
  ) {
    throw bad(`${path} must be a controlled ref`);
  }
}
function bad(message: string) {
  return new GroupOverviewApiError(400, message);
}
