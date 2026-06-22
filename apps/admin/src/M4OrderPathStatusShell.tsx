import "./m4-order-path-status-shell.css";

const pathSignals = [
  ["ADR-B02", "no_api_for_m4", "API not configured"],
  ["E-01", "not current blocker", "No connector claim"],
  ["E-02", "P0 main path", "Import snapshots"],
  ["E-03", "P0 gate", "Stale warning required"],
  ["E-04", "P0 gate", "Hand off on missing data"]
] as const;

const futureGates = [
  ["Import jobs", "later M4 spec", "progress, success rows, errors"],
  ["Order search", "later M4 spec", "snapshot-backed lookup only"],
  ["Customer linkage", "later M4 spec", "snapshot refs, no plaintext here"]
] as const;

export function M4OrderPathStatusShell({ tenantName }: { tenantName: string }) {
  return (
    <section className="panel m4-shell" data-testid="m4-order-path-status-shell">
      <div className="m4-shell-heading">
        <div>
          <p className="eyebrow">Tenant order operations</p>
          <h2>Order path status</h2>
        </div>
        <div className="m4-mode" data-testid="m4-shell-mode">
          <strong>{tenantName}</strong>
          <span>ADR-B02 current branch</span>
        </div>
      </div>

      <div className="m4-primary-path" data-testid="m4-primary-path">
        <span>订单数据主路径：导入快照</span>
        <strong>No direct order API configured</strong>
        <small>Project decision, not live API degradation</small>
      </div>

      <div className="m4-layout">
        <section className="m4-column" data-testid="m4-order-path-state">
          <div className="m4-section-heading">
            <h3>Current branch</h3>
            <span>no API calls</span>
          </div>
          <div
            className="m4-signal-table"
            role="table"
            aria-label="M4 order path states"
          >
            <div className="m4-signal-row header" role="row">
              <span role="columnheader">Gate</span>
              <span role="columnheader">State</span>
              <span role="columnheader">Operator meaning</span>
            </div>
            {pathSignals.map(([gate, state, meaning]) => (
              <div className="m4-signal-row" role="row" key={gate}>
                <strong role="cell">{gate}</strong>
                <span role="cell">{state}</span>
                <span role="cell">{meaning}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="m4-column" data-testid="m4-future-gates">
          <div className="m4-section-heading">
            <h3>Next gated surfaces</h3>
            <span>M4 specs required</span>
          </div>
          <div className="m4-gate-list">
            {futureGates.map(([title, state, scope]) => (
              <article className="m4-gate" key={title}>
                <strong>{title}</strong>
                <span>{state}</span>
                <small>{scope}</small>
              </article>
            ))}
          </div>
          <div className="m4-action-row" aria-label="M4 unavailable order actions">
            <button type="button" disabled>
              Import job gated
            </button>
            <button type="button" disabled>
              Order search gated
            </button>
            <button type="button" disabled>
              Customer linkage gated
            </button>
          </div>
        </section>
      </div>
    </section>
  );
}
