export type GroupHealthFilter =
  "total" | "abnormal" | "aiTrip" | "modelFault" | "orderFault" | "redline";

export type GroupOverviewSortKey = "sessions" | "human" | "sla" | "handoff" | "cost";
export type StatusTone = "danger" | "info" | "neutral" | "ok" | "warn";

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

export const evalMeta = {
  blocked: ["阻断", "danger"],
  pass: ["通过", "ok"],
  running: ["运行中", "info"],
  unavailable: ["—", "neutral"]
} as const satisfies Record<
  GroupOverviewRow["evalState"],
  readonly [string, StatusTone]
>;
export const orderMeta = {
  degraded: ["降级", "warn"],
  fault: ["故障", "danger"],
  normal: ["正常", "ok"],
  unavailable: ["—", "neutral"]
} as const satisfies Record<
  GroupOverviewRow["orderState"],
  readonly [string, StatusTone]
>;
export const healthDot = (health: GroupOverviewRow["health"]) =>
  health === "tripped" ? "breaker" : health;

export const groupOverviewFallbackMeta = {
  label: "4 个租户 · mock/degraded",
  reason:
    "centralized mock/degraded fallback only; aggregate runtime unavailable, not production metrics.",
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
  row("tenant-a", "玉珠跨境美妆", "美妆 · 中亚", "healthy", {
    cost: "¥118",
    costSort: 118,
    evalState: "blocked",
    handoff: "14%",
    handoffSort: 14,
    human: "7",
    humanSort: 7,
    last: "退款红线 · 9分钟前",
    orderState: "degraded",
    redline: true,
    sessions: "1,204",
    sessionsSort: 1204,
    sla: "92%",
    slaSort: 92
  }),
  row("tenant-b", "丝路数码", "3C · 俄语区", "degraded", {
    cost: "¥204",
    costSort: 204,
    evalState: "pass",
    handoff: "19%",
    handoffSort: 19,
    human: "3",
    humanSort: 3,
    last: "成本超预算 · 1小时前",
    orderState: "normal",
    redline: false,
    sessions: "862",
    sessionsSort: 862,
    sla: "88%",
    slaSort: 88
  }),
  row("tenant-c", "天净家居", "家居 · 哈萨克", "attention", {
    cost: "¥96",
    costSort: 96,
    evalState: "running",
    handoff: "28%",
    handoffSort: 28,
    human: "11",
    humanSort: 11,
    last: "connector 故障 · 22分钟前",
    orderState: "fault",
    redline: false,
    sessions: "430",
    sessionsSort: 430,
    sla: "79%",
    slaSort: 79
  }),
  row("tenant-d", "白桦母婴", "母婴 · 俄语区", "tripped", {
    cost: "¥0",
    costSort: 0,
    evalState: "pass",
    handoff: "—",
    handoffSort: 0,
    human: "0",
    humanSort: 0,
    last: "AI 熔断 · 3小时前",
    orderState: "normal",
    redline: false,
    sessions: "0",
    sessionsSort: 0,
    sla: "—",
    slaSort: 0
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
    | "cost"
    | "handoff"
    | "evalState"
    | "handoffSort"
    | "human"
    | "humanSort"
    | "last"
    | "orderState"
    | "redline"
    | "sessions"
    | "sessionsSort"
    | "sla"
    | "slaSort"
  >
): GroupOverviewRow {
  return {
    ...patch,
    businessLine,
    health,
    id,
    tenantName
  };
}
