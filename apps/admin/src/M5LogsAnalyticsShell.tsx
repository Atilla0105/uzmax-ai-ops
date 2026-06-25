import { useEffect, useState } from "react";

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
import { createLogsAnalyticsApiClient } from "./logsAnalyticsApiClient";
import {
  createM5AdminRuntimeFetcher,
  isM5AdminRuntimeEnabled
} from "./m5AdminRuntimeMode";
import {
  LogTable,
  runtimeBoardItems,
  runtimeLoginTable,
  runtimeOperationTable,
  runtimePresenceTable,
  type RuntimeTables
} from "./m5LogsAnalyticsRuntime";
import "./m5-logs-analytics-shell.css";

export function M5LogsAnalyticsShell({ tenantName }: { tenantName: string }) {
  const runtimeEnabled = isM5AdminRuntimeEnabled("logsAnalytics");
  const [runtimeResult, setRuntimeResult] = useState("");
  const [runtimeBoard, setRuntimeBoard] = useState<Record<string, unknown>>();
  const [runtimeTables, setRuntimeTables] = useState<RuntimeTables | undefined>();
  const [selectedDimensions, setSelectedDimensions] = useState<
    LogsAnalyticsDimension[]
  >(["tenant", "member", "channel", "time_grain"]);
  const [draft, setDraft] = useState<LogsAnalyticsExportDraft | undefined>();
  const [logType, setLogType] = useState<LogsAnalyticsLogType>("login");
  const [query, setQuery] = useState("");
  const [highRiskOnly, setHighRiskOnly] = useState(false);
  const boardItems = runtimeBoard
    ? runtimeBoardItems(runtimeBoard)
    : fixedAnalyticsBoardItems;
  const activeTables = runtimeTables ?? logsAnalyticsLogTables;
  const table = activeTables[logType];
  const rows = table.rows.filter((row) => rowMatches(row, query, highRiskOnly));

  const toggleDimension = (dimension: LogsAnalyticsDimension) => {
    setSelectedDimensions((current) =>
      current.includes(dimension)
        ? current.filter((item) => item !== dimension)
        : [...current, dimension]
    );
  };

  const draftExport = async () => {
    if (runtimeEnabled) {
      try {
        const client = createLogsAnalyticsApiClient({
          fetcher: createM5AdminRuntimeFetcher()
        });
        const result = await client.createExportJob({
          filters: { dimensionRefs: selectedDimensions },
          logKinds: ["login", "presence", "operation"],
          metricRefs: boardItems.map((item) => `controlled://metric/${item.key}`),
          reasonRef: "controlled://m5r-07/logs/export-reason",
          scope: { selectedDimensions },
          traceId: "m5r-07:logs-export"
        });
        setRuntimeResult(`Export job API ${String(result.exportRef)}`);
        setDraft({
          actorRef: "controlled://analytics/actor/owner",
          dimensions: selectedDimensions,
          fileRef: null,
          filterRefs: ["controlled://m5r-07/logs/filter"],
          formalExportWrite: false,
          metricRefs: boardItems.map((item) => `controlled://metric/${item.key}`),
          requiresOwnerConfirmation: true,
          status: "draft_requires_owner_confirmation",
          viewRef: String(result.exportRef)
        });
      } catch (error) {
        setRuntimeResult(errorMessage(error));
      }
      return;
    }
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

  useEffect(() => {
    if (!runtimeEnabled) {
      setRuntimeTables(undefined);
      setRuntimeBoard(undefined);
      return;
    }
    let active = true;
    const client = createLogsAnalyticsApiClient({
      fetcher: createM5AdminRuntimeFetcher()
    });
    void Promise.all([
      client.getBoard(),
      client.listLoginLogs({ limit: 20 }),
      client.listPresenceLogs({ limit: 20 }),
      client.listOperationLogs({ limit: 20 })
    ])
      .then(([board, login, presence, operation]) => {
        if (!active) return;
        setRuntimeBoard(board);
        setRuntimeTables({
          login: runtimeLoginTable(login),
          operation: runtimeOperationTable(operation),
          presence: runtimePresenceTable(presence)
        });
        setRuntimeResult("Runtime logs and board loaded through API");
      })
      .catch((error: unknown) => {
        if (!active) return;
        setRuntimeResult(errorMessage(error));
      });
    return () => {
      active = false;
    };
  }, [runtimeEnabled]);

  return (
    <section className="panel m5-logs-shell" data-testid="m5-logs-analytics-shell">
      <div className="m5-logs-heading">
        <div>
          <p className="eyebrow">Tenant analytics and logs</p>
          <h2>Logs and analytics center</h2>
        </div>
        <div className="m5-logs-mode">
          <strong>{tenantName}</strong>
          <span>
            {runtimeEnabled ? "runtime API client" : "synthetic local shell"}
          </span>
        </div>
      </div>
      {runtimeEnabled ? (
        <p className="m5-export-draft" data-testid="m5-logs-runtime-result">
          {runtimeResult || "Runtime API client mode waiting."}
        </p>
      ) : null}

      <div className="m5-logs-board" data-testid="m5-analytics-board">
        {boardItems.map((item) => (
          <article className="m5-logs-metric" key={item.key}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <small>{item.detail}</small>
          </article>
        ))}
      </div>

      <div className="m5-logs-mobile-summary" data-testid="m5-mobile-metrics">
        <strong>{fixedAnalyticsBoardItems[0].label}</strong>
        <span>{boardItems[0].value}</span>
        <strong>{fixedAnalyticsBoardItems[8].label}</strong>
        <span>{boardItems[8].value}</span>
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
            onClick={() => void draftExport()}
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

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "logs runtime API request failed";
}

function rowMatches(row: LogsAnalyticsLogRow, query: string, highRiskOnly: boolean) {
  if (highRiskOnly && row.highRisk !== true) return false;
  return row.values.join(" ").toLowerCase().includes(query.trim().toLowerCase());
}
