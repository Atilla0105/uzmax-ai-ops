import { useState } from "react";

import {
  createLogsAnalyticsExportDraft,
  fixedAnalyticsBoardItems,
  logsAnalyticsDimensionLabels,
  logsAnalyticsDimensions,
  logsAnalyticsLogTables,
  type LogsAnalyticsDimension,
  type LogsAnalyticsExportDraft,
  type LogsAnalyticsLogRow,
  type LogsAnalyticsLogType
} from "./logsAnalyticsContracts";
import "./m5-logs-analytics-shell.css";

export function M5LogsAnalyticsShell({ tenantName }: { tenantName: string }) {
  const [selectedDimensions, setSelectedDimensions] = useState<
    LogsAnalyticsDimension[]
  >(["tenant", "member", "channel", "time_grain"]);
  const [draft, setDraft] = useState<LogsAnalyticsExportDraft | undefined>();
  const [logType, setLogType] = useState<LogsAnalyticsLogType>("login");
  const [query, setQuery] = useState("");
  const [highRiskOnly, setHighRiskOnly] = useState(false);
  const table = logsAnalyticsLogTables[logType];
  const rows = table.rows.filter((row) => rowMatches(row, query, highRiskOnly));

  const toggleDimension = (dimension: LogsAnalyticsDimension) => {
    setSelectedDimensions((current) =>
      current.includes(dimension)
        ? current.filter((item) => item !== dimension)
        : [...current, dimension]
    );
  };

  const draftExport = () => {
    setDraft(
      createLogsAnalyticsExportDraft({
        actorRef: "controlled://analytics/actor/owner",
        dimensions: selectedDimensions,
        filterRefs: [`controlled://analytics/filter/${logType}`],
        metricRefs: fixedAnalyticsBoardItems.map(
          (_item, index) => `controlled://metric/board-${index + 1}`
        ),
        viewRef: "controlled://analytics/view/m5-06"
      })
    );
  };

  return (
    <section className="panel m5-logs-shell" data-testid="m5-logs-analytics-shell">
      <div className="m5-logs-heading">
        <div>
          <p className="eyebrow">Tenant analytics and logs</p>
          <h2>Logs and analytics center</h2>
        </div>
        <div className="m5-logs-mode">
          <strong>{tenantName}</strong>
          <span>synthetic local shell</span>
        </div>
      </div>

      <div className="m5-logs-board" data-testid="m5-analytics-board">
        {fixedAnalyticsBoardItems.map((item) => (
          <article className="m5-logs-metric" key={item.key}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <small>{item.detail}</small>
          </article>
        ))}
      </div>

      <div className="m5-logs-mobile-summary" data-testid="m5-mobile-metrics">
        <strong>{fixedAnalyticsBoardItems[0].label}</strong>
        <span>{fixedAnalyticsBoardItems[0].value}</span>
        <strong>{fixedAnalyticsBoardItems[8].label}</strong>
        <span>{fixedAnalyticsBoardItems[8].value}</span>
      </div>

      <div
        className="m5-logs-desktop-controls"
        data-testid="m5-dimension-export-controls"
      >
        <div className="m5-dimension-grid" aria-label="Analytics dimensions">
          {logsAnalyticsDimensions.map((dimension) => (
            <button
              aria-pressed={selectedDimensions.includes(dimension)}
              key={dimension}
              type="button"
              onClick={() => toggleDimension(dimension)}
            >
              <span>{logsAnalyticsDimensionLabels[dimension]}</span>
              <strong>
                {selectedDimensions.includes(dimension) ? "selected" : "available"}
              </strong>
            </button>
          ))}
        </div>
        <div className="m5-export-draft" data-testid="m5-export-draft">
          <button
            disabled={selectedDimensions.length === 0}
            type="button"
            onClick={draftExport}
          >
            Draft export review
          </button>
          <button type="button" disabled>
            Confirm export disabled
          </button>
          {draft ? (
            <p>
              {draft.status}; formal export write {String(draft.formalExportWrite)};
              owner confirmation {String(draft.requiresOwnerConfirmation)};{" "}
              {draft.viewRef}
            </p>
          ) : (
            <p>No export file exists; draft requires owner confirmation.</p>
          )}
        </div>
      </div>

      <div className="m5-log-center" data-testid="m5-log-center">
        <div className="m5-log-filters" data-testid="m5-log-filters">
          <div className="m5-log-type-tabs" aria-label="Log type">
            {(Object.keys(logsAnalyticsLogTables) as LogsAnalyticsLogType[]).map(
              (type) => (
                <button
                  aria-pressed={logType === type}
                  key={type}
                  type="button"
                  onClick={() => setLogType(type)}
                >
                  {type}
                </button>
              )
            )}
          </div>
          <label>
            Filter
            <input
              aria-label="Log filter"
              value={query}
              onChange={(event) => setQuery(event.currentTarget.value)}
            />
          </label>
          <label className="m5-risk-toggle">
            <input
              checked={highRiskOnly}
              type="checkbox"
              onChange={(event) => setHighRiskOnly(event.currentTarget.checked)}
            />
            High-risk only
          </label>
        </div>
        <LogTable columns={table.columns} rows={rows} />
      </div>
    </section>
  );
}

function LogTable({
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

function Cell({
  code,
  label,
  value
}: {
  code?: true;
  label: string;
  value: boolean | string | undefined;
}) {
  const text = String(value ?? "");
  return <td data-label={label}>{code ? <code>{text}</code> : text}</td>;
}

function rowMatches(row: LogsAnalyticsLogRow, query: string, highRiskOnly: boolean) {
  if (highRiskOnly && row.highRisk !== true) return false;
  return row.values.join(" ").toLowerCase().includes(query.trim().toLowerCase());
}
