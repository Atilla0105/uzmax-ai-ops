const CONTROLLED_REF_PATTERN = /^controlled:\/\/[a-z0-9][a-z0-9/_-]*$/i;
const BASE64ISH_SEGMENT_PATTERN = /(?:^|\/)[A-Za-z0-9+_-]{40,}={0,2}(?:$|\/)/;
const FORBIDDEN_KEY_PATTERN = /raw|prompt|customer|order|phone|payment|secret|url/i;
const FORBIDDEN_REF_TERMS = "raw prompt customer order phone payment secret url".split(
  " "
);

export const logsAnalyticsDimensions = [
  "tenant",
  "member",
  "ai_member",
  "channel",
  "intent",
  "time_grain",
  "order_status",
  "handoff_reason"
] as const;

export type LogsAnalyticsDimension = (typeof logsAnalyticsDimensions)[number];

export const logsAnalyticsDimensionLabels = {
  ai_member: "AI member",
  channel: "Channel",
  handoff_reason: "Handoff reason",
  intent: "Intent",
  member: "Member",
  order_status: "Order status",
  tenant: "Tenant",
  time_grain: "Time grain"
} satisfies Record<LogsAnalyticsDimension, string>;

const metric = (key: string, label: string, value: string, detail: string) => ({
  detail,
  key,
  label,
  value
});

export const fixedAnalyticsBoardItems = [
  metric(
    "resolution_rate",
    "Resolution rate",
    "74%",
    "auto handled / closed conversations"
  ),
  metric("handoff_rate", "Handoff rate", "18%", "manual transfer share"),
  metric("sla", "SLA", "04m", "median first useful reply"),
  metric("cost", "Cost", "$42", "synthetic daily model spend"),
  metric("top_questions", "Top questions", "3", "tutorial, route, price"),
  metric("order_query", "Order query", "91%", "snapshot lookup success"),
  metric("draft_adoption", "Draft adoption", "67%", "Business drafts sent by humans"),
  metric(
    "knowledge_health",
    "Knowledge health",
    "green",
    "eval gate and negative feedback"
  ),
  metric(
    "confirmation_pass_rate",
    "Confirmation queue 7-day pass rate",
    "63%",
    "confirmation queue outcome"
  ),
  metric("distill_frequency", "Distill frequency", "daily", "current distill cadence"),
  metric(
    "real_traffic_baseline",
    "Real traffic baseline",
    "pending",
    "synthetic baseline only"
  )
] as const;

export type LogsAnalyticsLogType = "login" | "presence" | "operation";
export type LogsAnalyticsLogRow = { highRisk?: boolean; values: string[] };

type LogsAnalyticsLogTable = {
  columns: { label: string; code?: true }[];
  rows: LogsAnalyticsLogRow[];
};

const columns = (...labels: string[]) => labels.map((label) => ({ label }));
const row = (...values: string[]): LogsAnalyticsLogRow => ({ values });
const highRiskRow = (...values: string[]): LogsAnalyticsLogRow => ({
  highRisk: true,
  values
});

export const logsAnalyticsLogTables: Record<
  LogsAnalyticsLogType,
  LogsAnalyticsLogTable
> = {
  login: {
    columns: columns("Type", "Member", "Location/IP", "Device", "Time"),
    rows: [
      row(
        "password",
        "Member Alpha",
        "Tashkent / 192.0.2.10",
        "Chrome desktop",
        "today 09:10"
      ),
      highRiskRow(
        "re-auth",
        "Member Beta",
        "Samarkand / 198.51.100.12",
        "Mobile browser",
        "today 09:42"
      )
    ]
  },
  operation: {
    columns: [
      ...columns("Time", "Operator", "Module", "Function", "Object", "Content"),
      { code: true, label: "Jump ref" }
    ],
    rows: [
      highRiskRow(
        "today 10:05",
        "Owner",
        "AI member",
        "emergency stop",
        "Operations AI",
        "AI member emergency stop draft",
        "controlled://conversation/high-risk-a"
      ),
      highRiskRow(
        "today 10:12",
        "Owner",
        "Config",
        "rollback",
        "Version A",
        "Configuration rollback review",
        "controlled://config/version-a"
      ),
      row(
        "today 10:20",
        "Member Alpha",
        "Eval",
        "review",
        "Run A",
        "Eval run reviewed",
        "controlled://eval/run-a"
      )
    ]
  },
  presence: {
    columns: columns(
      "Member",
      "Account status",
      "Update method",
      "Update time",
      "Duration"
    ),
    rows: [
      row("Member Alpha", "online", "manual", "today 09:15", "2h 15m"),
      highRiskRow("AI member Ops", "offline", "breaker", "today 10:02", "18m")
    ]
  }
};

export type LogsAnalyticsExportDraft = {
  actorRef: string;
  dimensions: LogsAnalyticsDimension[];
  fileRef: null;
  filterRefs: string[];
  formalExportWrite: false;
  metricRefs: string[];
  requiresOwnerConfirmation: true;
  status: "draft_requires_owner_confirmation";
  viewRef: string;
};

export type LogsAnalyticsExportDraftInput = {
  actorRef: string;
  dimensions: readonly unknown[];
  metricRefs: readonly unknown[];
  viewRef: string;
  filterRefs?: readonly unknown[];
} & Record<string, unknown>;

const allowedExportDraftKeys = new Set([
  "actorRef",
  "dimensions",
  "filterRefs",
  "metricRefs",
  "viewRef"
]);

function isLogsAnalyticsDimension(value: unknown): value is LogsAnalyticsDimension {
  return (
    typeof value === "string" &&
    logsAnalyticsDimensions.includes(value as LogsAnalyticsDimension)
  );
}

function readLogsAnalyticsDimensions(
  values: readonly unknown[]
): LogsAnalyticsDimension[] {
  if (!Array.isArray(values) || values.length === 0) {
    throw new Error("dimensions must be a non-empty array");
  }
  return values.map((value) => {
    if (!isLogsAnalyticsDimension(value)) {
      throw new Error("analytics dimension is not whitelisted");
    }
    return value;
  });
}

export function createLogsAnalyticsExportDraft(
  input: LogsAnalyticsExportDraftInput
): LogsAnalyticsExportDraft {
  rejectUnsafeDraftInput(input);
  return {
    actorRef: readControlledRef(input.actorRef, "actorRef"),
    dimensions: readLogsAnalyticsDimensions(input.dimensions),
    fileRef: null,
    filterRefs: readControlledRefList(input.filterRefs ?? [], "filterRefs"),
    formalExportWrite: false,
    metricRefs: readControlledRefList(input.metricRefs, "metricRefs"),
    requiresOwnerConfirmation: true,
    status: "draft_requires_owner_confirmation",
    viewRef: readControlledRef(input.viewRef, "viewRef")
  };
}

function readControlledRefList(values: readonly unknown[], name: string): string[] {
  if (!Array.isArray(values)) throw new Error(`${name} must be an array`);
  return values.map((value, index) => readControlledRef(value, `${name}.${index}`));
}

function readControlledRef(value: unknown, name: string): string {
  if (typeof value !== "string") throw new Error(`${name} must be a controlled ref`);
  const ref = value.trim();
  const refBody = ref.replace(/^controlled:\/\//i, "");
  const failedSafeRefCheck = [
    CONTROLLED_REF_PATTERN.test(ref) ? "" : "scheme",
    BASE64ISH_SEGMENT_PATTERN.test(refBody) ? "encoded" : "",
    hasForbiddenRefTerm(refBody) ? "forbidden" : ""
  ].some(Boolean);
  if (failedSafeRefCheck) {
    throw new Error(`${name} must be a safe controlled ref`);
  }
  return ref;
}

function hasForbiddenRefTerm(refBody: string): boolean {
  const searchable = refBody
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_/]+/g, " ")
    .toLowerCase();
  return FORBIDDEN_REF_TERMS.some((term) => searchable.includes(term));
}

function rejectUnsafeDraftInput(input: Record<string, unknown>) {
  const draftEntries = Object.entries(input);
  for (const [key, value] of draftEntries) {
    const keyIsForbidden = FORBIDDEN_KEY_PATTERN.test(key);
    const keyIsAllowed = allowedExportDraftKeys.has(key);
    const valueIsInlinePayload =
      typeof value === "string" && /^(https?:|data:|blob:|file:)/i.test(value);
    if (keyIsForbidden) {
      throw new Error(`${key} is a forbidden raw payload key`);
    }
    if (!keyIsAllowed) {
      throw new Error(`${key} is not allowed in export draft`);
    }
    if (valueIsInlinePayload) {
      throw new Error(`${key} must not be a URL or inline payload`);
    }
  }
}
