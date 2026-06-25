import {
  fixedAnalyticsBoardItems,
  logsAnalyticsLogTables,
  type LogsAnalyticsLogRow,
  type LogsAnalyticsLogType
} from "./logsAnalyticsContracts";

type LogTableData = {
  columns: { label: string; code?: true }[];
  rows: LogsAnalyticsLogRow[];
};
export type RuntimeTables = Record<LogsAnalyticsLogType, LogTableData>;

export function runtimeBoardItems(board: Record<string, unknown>) {
  return fixedAnalyticsBoardItems.map((item) => {
    if (item.key === "confirmation_pass_rate")
      return {
        ...item,
        detail: "runtime confirmation outcome",
        value: `${bpsPercent(board.confirmationQueuePassRateBps)}%`
      };
    if (item.key === "distill_frequency")
      return {
        ...item,
        detail: `${bpsPercent(board.distillPassRateBps)}% 7-day pass rate`,
        value: String(board.distillFrequency ?? "unknown")
      };
    if (item.key === "real_traffic_baseline")
      return { ...item, detail: String(board.source ?? "API"), value: "runtime" };
    return item;
  });
}

export function runtimeLoginTable(rows: Record<string, unknown>[]): LogTableData {
  return {
    columns: logsAnalyticsLogTables.login.columns,
    rows: rows.map((row) => ({
      values: [
        String(row.loginType ?? "runtime"),
        String(row.memberUserId ?? "member"),
        "runtime scoped",
        String(row.device ?? "device"),
        String(row.occurredAt ?? "")
      ]
    }))
  };
}

export function runtimePresenceTable(rows: Record<string, unknown>[]): LogTableData {
  return {
    columns: logsAnalyticsLogTables.presence.columns,
    rows: rows.map((row) => ({
      highRisk: row.highRisk === true,
      values: [
        String(row.memberUserId ?? "member"),
        String(row.status ?? "status"),
        String(row.updateMethod ?? "runtime"),
        String(row.occurredAt ?? ""),
        `${String(row.durationSeconds ?? "0")}s`
      ]
    }))
  };
}

export function runtimeOperationTable(rows: Record<string, unknown>[]): LogTableData {
  return {
    columns: logsAnalyticsLogTables.operation.columns,
    rows: rows.map((row) => ({
      highRisk: row.highRisk === true,
      values: [
        String(row.occurredAt ?? ""),
        "runtime actor",
        String(row.module ?? "module"),
        String(row.eventType ?? row.action ?? "action"),
        String(row.objectType ?? "object"),
        String(row.action ?? "controlled://runtime/log")
      ]
    }))
  };
}

export function LogTable({
  columns,
  rows
}: {
  columns: { label: string; code?: true }[];
  rows: LogsAnalyticsLogRow[];
}) {
  return (
    <div className="m5-log-table-wrap">
      <table className="m5-log-table" data-testid="m5-log-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.label}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${row.values[0] ?? "row"}-${index}`}>
              {columns.map((column, columnIndex) => (
                <Cell
                  code={column.code}
                  key={column.label}
                  label={column.label}
                  value={row.values[columnIndex]}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Cell(props: { code?: true; label: string; value: boolean | string | undefined }) {
  const { code, label, value } = props;
  const text = String(value ?? "");
  return <td data-label={label}>{code ? <code>{text}</code> : text}</td>;
}

function bpsPercent(value: unknown) {
  return Math.round(Number(value ?? 0) / 100);
}
