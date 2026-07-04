export type GroupHealthFilter =
  | "total"
  | "abnormal"
  | "aiTrip"
  | "modelFault"
  | "orderFault"
  | "redline";

export type GroupOverviewSortKey = "sessions" | "human" | "sla" | "handoff" | "cost";

export interface GroupHealthCard {
  filter: GroupHealthFilter;
  label: string;
  tone: "neutral" | "warn" | "danger" | "ok";
  value: string;
}

export interface GroupOverviewRow {
  businessLine: string;
  cost: string;
  costSort: number;
  evalState: "blocked" | "pass" | "running" | "unavailable";
  handoff: string;
  handoffSort: number;
  health: "healthy" | "degraded" | "attention" | "tripped";
  human: string;
  humanSort: number;
  id: string;
  last: string;
  orderState: "normal" | "degraded" | "fault" | "unavailable";
  redline: boolean;
  sessions: string;
  sessionsSort: number;
  sla: string;
  slaSort: number;
  tenantName: string;
}

export const groupOverviewFallbackMeta = {
  label: "4 个租户 · fallback",
  reason:
    "aggregate runtime unavailable: source-shaped mock/degraded fallback only, not production metrics.",
  source: "centralized-mock-degraded"
} as const;

export const groupHealthCards: GroupHealthCard[] = [
  { filter: "total", label: "租户总数", tone: "neutral", value: "4" },
  { filter: "abnormal", label: "异常租户", tone: "warn", value: "2" },
  { filter: "aiTrip", label: "AI 熔断", tone: "danger", value: "1" },
  { filter: "modelFault", label: "模型故障", tone: "ok", value: "0" },
  { filter: "orderFault", label: "订单 connector 故障", tone: "warn", value: "1" },
  { filter: "redline", label: "红线事件 / 今日", tone: "danger", value: "7" }
];

export const groupOverviewRows: GroupOverviewRow[] = [
  row("tenant-a", "Mock 租户 A", "业务线 A · mock", "attention", {
    costSort: 30,
    evalState: "blocked",
    handoffSort: 30,
    humanSort: 30,
    last: "mock redline event",
    orderState: "degraded",
    redline: true,
    sessionsSort: 40,
    slaSort: 30
  }),
  row("tenant-b", "Mock 租户 B", "业务线 B · mock", "degraded", {
    costSort: 40,
    evalState: "pass",
    handoffSort: 20,
    humanSort: 20,
    last: "mock connector degraded",
    orderState: "normal",
    redline: false,
    sessionsSort: 30,
    slaSort: 20
  }),
  row("tenant-c", "Mock 租户 C", "业务线 C · mock", "attention", {
    costSort: 20,
    evalState: "running",
    handoffSort: 40,
    humanSort: 40,
    last: "mock connector fault",
    orderState: "fault",
    redline: false,
    sessionsSort: 20,
    slaSort: 40
  }),
  row("tenant-d", "Mock 租户 D", "业务线 D · mock", "tripped", {
    costSort: 10,
    evalState: "unavailable",
    handoffSort: 10,
    humanSort: 10,
    last: "mock AI breaker",
    orderState: "unavailable",
    redline: false,
    sessionsSort: 10,
    slaSort: 10
  })
];

export const groupOverviewColumns = [
  { label: "租户" },
  { label: "会话量", sortKey: "sessions" },
  { label: "待人工", sortKey: "human" },
  { label: "SLA风险", sortKey: "sla" },
  { label: "转人工率", sortKey: "handoff" },
  { label: "AI成本/日", sortKey: "cost" },
  { label: "评测状态" },
  { label: "订单状态" },
  { label: "最后异常" }
] as const satisfies readonly {
  label: string;
  sortKey?: GroupOverviewSortKey;
}[];

export function matchesGroupFilter(row: GroupOverviewRow, filter: GroupHealthFilter) {
  if (filter === "total") return true;
  if (filter === "abnormal")
    return row.health === "degraded" || row.health === "attention";
  if (filter === "aiTrip") return row.health === "tripped";
  if (filter === "modelFault") return false;
  if (filter === "orderFault") return row.orderState === "fault";
  if (filter === "redline") return row.redline;
  return true;
}

function row(
  id: string,
  tenantName: string,
  businessLine: string,
  health: GroupOverviewRow["health"],
  patch: Pick<
    GroupOverviewRow,
    | "costSort"
    | "evalState"
    | "handoffSort"
    | "humanSort"
    | "last"
    | "orderState"
    | "redline"
    | "sessionsSort"
    | "slaSort"
  >
): GroupOverviewRow {
  return {
    ...patch,
    businessLine,
    cost: "mock",
    handoff: "mock",
    health,
    human: "mock",
    id,
    sessions: "mock",
    sla: "mock",
    tenantName
  };
}
