import { Download, Plus } from "lucide-react";
import {
  analyticsRuntimeBoundary,
  analyticsRanges,
  analyticsRuntimeLabels,
  analyticsStyles,
  useAnalyticsPageState
} from "./analyticsFallback";

export function AnalyticsPage({ selectedTenantId }: { selectedTenantId: string }) {
  const state = useAnalyticsPageState();
  return (
    <section
      className="uz-analytics-page"
      aria-description={analyticsRuntimeBoundary}
      data-runtime-boundary={analyticsRuntimeBoundary}
      data-runtime-state={state.viewState}
      data-selected-tenant-id={selectedTenantId}
      data-testid="m7-analytics-page"
      title={analyticsRuntimeBoundary}
    >
      <style>{analyticsStyles}</style>
      <header className="uz-analytics-head">
        <h2 className="uz-analytics-title">分析</h2>
        <nav aria-label="分析时间范围" className="uz-analytics-range">
          {analyticsRanges.map((range) => (
            <button
              aria-pressed={state.range === range.id}
              key={range.id}
              onClick={() => state.setRange(range.id)}
              type="button"
            >
              {range.label}
            </button>
          ))}
        </nav>
        <div className="uz-analytics-tools">
          <button
            className="uz-analytics-tool"
            onClick={() => state.setMenuOpen(!state.menuOpen)}
            type="button"
          >
            <Plus aria-hidden size={14} />
            添加维度
          </button>
          <button
            className="uz-analytics-tool"
            data-testid="m7-analytics-export"
            onClick={state.exportLocal}
            type="button"
          >
            <Download aria-hidden size={14} />
            导出
          </button>
          {state.menuOpen ? <DimMenu state={state} /> : null}
        </div>
      </header>
      {state.toast ? (
        <div
          aria-description={analyticsRuntimeBoundary}
          aria-atomic="true"
          aria-live="polite"
          className="uz-analytics-toast"
          data-runtime-boundary={analyticsRuntimeBoundary}
          data-testid="m7-analytics-toast"
          role="status"
          title={analyticsRuntimeBoundary}
        >
          {state.toast}
          <span hidden>{analyticsRuntimeBoundary}</span>
        </div>
      ) : null}
      {state.isDegraded ? (
        <main className="uz-analytics-body">
          <RuntimeNote />
          <KpiGrid state={state} />
          <section className="uz-analytics-split">
            <HandoffPanel state={state} />
            <TopIssues state={state} />
          </section>
          <DimensionChips state={state} />
          <AnalyticsTable state={state} />
        </main>
      ) : (
        <main
          aria-description={analyticsRuntimeBoundary}
          className="uz-analytics-state"
          data-runtime-boundary={analyticsRuntimeBoundary}
          data-testid={`m7-analytics-state-${state.viewState}`}
          title={analyticsRuntimeBoundary}
        >
          <div>
            <h2>{state.stateCopy.title}</h2>
            <p>{state.stateCopy.body}</p>
            <span hidden>{analyticsRuntimeBoundary}</span>
          </div>
        </main>
      )}
    </section>
  );
}

type AnalyticsState = ReturnType<typeof useAnalyticsPageState>;

function RuntimeNote() {
  return (
    <div
      className="uz-analytics-note"
      data-runtime-boundary={analyticsRuntimeBoundary}
      data-testid="m7-analytics-runtime-note"
      hidden
      title={analyticsRuntimeBoundary}
    >
      <strong>{analyticsRuntimeLabels.slice(0, 3).join(" · ")}</strong>
      <span>{analyticsRuntimeLabels.slice(3).join(" · ")}</span>
    </div>
  );
}

function DimMenu({ state }: { state: AnalyticsState }) {
  return (
    <div className="uz-analytics-menu" data-testid="m7-analytics-dim-menu">
      <div className="uz-analytics-menu-note">选择维度（最多 2 个）</div>
      {state.dimOptions.map((option) => {
        const active = state.dims.includes(option.id);
        const disabled = !active && state.dims.length >= 2;
        return (
          <button
            aria-disabled={disabled}
            aria-pressed={active}
            key={option.id}
            onClick={() => state.toggleDim(option.id)}
            type="button"
          >
            <span className="uz-analytics-check">{active ? "✓" : ""}</span>
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function KpiGrid({ state }: { state: AnalyticsState }) {
  return (
    <section
      className="uz-analytics-kpis"
      data-runtime-boundary={analyticsRuntimeBoundary}
      data-testid="m7-analytics-kpis"
    >
      {state.kpis.map(([label, value, delta, tone]) => (
        <article className="uz-analytics-kpi" key={label}>
          <span>{label}</span>
          <strong className={`tone-${tone}`}>{value}</strong>
          <small className={`tone-${tone}`}>{delta}</small>
        </article>
      ))}
    </section>
  );
}

function HandoffPanel({ state }: { state: AnalyticsState }) {
  return (
    <section className="uz-analytics-panel" data-testid="m7-analytics-handoff">
      <h3>转人工原因分布</h3>
      {state.handoffReasons.map(([label, pct, tone]) => (
        <div className="uz-analytics-bar" key={label}>
          <div className="uz-analytics-bar-row">
            <span>{label}</span>
            <strong>{pct}%</strong>
          </div>
          <div className="uz-analytics-meter">
            <span className={`tone-${tone}`} data-pct={pct} />
          </div>
        </div>
      ))}
    </section>
  );
}

function TopIssues({ state }: { state: AnalyticsState }) {
  return (
    <section className="uz-analytics-panel" data-testid="m7-analytics-top-issues">
      <h3>Top 问题</h3>
      {state.topIssues.map((issue) => (
        <div className="uz-analytics-issue" key={issue.rank}>
          <span className="uz-analytics-rank">{issue.rank}</span>
          <strong>{issue.label}</strong>
          <span className="uz-analytics-count">{issue.count}</span>
        </div>
      ))}
    </section>
  );
}

function DimensionChips({ state }: { state: AnalyticsState }) {
  if (!state.dims.length) return null;
  return (
    <div className="uz-analytics-chips" data-testid="m7-analytics-active-dims">
      <span>按维度拆分：</span>
      {state.dims.map((dim) => (
        <span className="uz-analytics-chip" key={dim}>
          {state.dimOptions.find((option) => option.id === dim)?.label}
          <button
            aria-label={`移除${dim}`}
            onClick={() => state.toggleDim(dim)}
            type="button"
          >
            ×
          </button>
        </span>
      ))}
    </div>
  );
}

function AnalyticsTable({ state }: { state: AnalyticsState }) {
  return (
    <section
      className="uz-analytics-panel uz-analytics-table-panel"
      data-testid="m7-analytics-table"
    >
      <div className="uz-analytics-table-head">
        分析表
        {state.table.capped ? <span>组合过多，仅显示前 20 行</span> : null}
      </div>
      <div className="uz-analytics-table-wrap">
        <table className="uz-analytics-table">
          <thead>
            <tr>
              {state.table.cols.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {state.table.rows.map((row) => (
              <tr key={row.combo.join("|")}>
                {row.combo.map((value) => (
                  <td className="is-strong" key={value}>
                    {value}
                  </td>
                ))}
                <td className="is-mono">{row.sessions}</td>
                <td className="is-mono">{row.resolved}%</td>
                <td className="is-mono">{row.handoff}%</td>
                <td className="is-mono">¥{row.cost}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
