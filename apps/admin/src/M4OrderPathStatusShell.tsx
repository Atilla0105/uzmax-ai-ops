import { useState } from "react";

import "./m4-order-path-status-shell.css";
import { M4OrderImportOperatorWorkflow } from "./M4OrderImportOperatorWorkflow";
import { M4OrderImportVisibleSmokeState } from "./M4OrderImportVisibleSmokeState";
import { createOrderImportApiClient } from "./orderImportApiClient";

void createOrderImportApiClient;

const pathSignals = [
  ["ADR-B02", "no_api_for_m4", "API not configured"],
  ["E-01", "not current blocker", "No connector claim"],
  ["E-02", "P0 main path", "Import snapshots"],
  ["E-03", "P0 gate", "Stale warning required"],
  ["E-04", "P0 gate", "Hand off on missing data"]
] as const;

const importJob = {
  errorRows: 1,
  expiresAt: "next review window",
  jobRef: "import://jobs/snapshot-a",
  sourceRef: "storage://order-imports/snapshot-a",
  sourceUpdatedAt: "current import window",
  status: "completed_with_errors",
  successfulRows: 2,
  totalRows: 3
} as const;

const rowErrors = [
  ["Row 3", "order_status_ref_required", "status ref missing"],
  ["Row 7", "snapshot_expiry_not_after_source_update", "expiry before update"]
] as const;

const snapshotResults = [
  {
    badge: "Fresh",
    detail: "source current import window, expires next review window",
    handoff: "not required",
    label: "Fresh snapshot",
    queryRef: "query://order/fresh-a",
    statusRef: "status://order/in-transit",
    warning: "snapshot_ready"
  },
  {
    badge: "Stale",
    detail: "source previous import window, expired before review window",
    handoff: "required",
    label: "Expired snapshot",
    queryRef: "query://order/stale-a",
    statusRef: undefined,
    warning: "order_snapshot_stale"
  },
  {
    badge: "Missing",
    detail: "no matching controlled snapshot ref",
    handoff: "required",
    label: "Missing snapshot",
    queryRef: "query://order/missing-a",
    statusRef: undefined,
    warning: "order_snapshot_missing"
  }
] as const;

const remainingGates = [
  ["Runtime parser", "future M4 spec", "table upload parsing and persistence"],
  ["Customer linkage", "future M4 spec", "snapshot refs, no plaintext here"],
  ["AI runtime/eval", "future M4 spec", "handoff gate and redline evidence"]
] as const;

export function M4OrderPathStatusShell({ tenantName }: { tenantName: string }) {
  const [selectedQueryRef, setSelectedQueryRef] = useState<
    (typeof snapshotResults)[number]["queryRef"]
  >(snapshotResults[0].queryRef);
  const selectedSnapshot =
    snapshotResults.find((result) => result.queryRef === selectedQueryRef) ??
    snapshotResults[0];

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

        <section className="m4-column" data-testid="m4-import-snapshot-jobs">
          <div className="m4-section-heading">
            <h3>Import snapshot batch</h3>
            <span>{importJob.status}</span>
          </div>

          <div className="m4-import-summary" aria-label="M4 import job summary">
            <Metric label="Successful rows" value={importJob.successfulRows} />
            <Metric label="Failed rows" value={importJob.errorRows} tone="warn" />
            <Metric label="Total rows" value={importJob.totalRows} />
          </div>

          <dl className="m4-ref-list">
            <div>
              <dt>Job ref</dt>
              <dd>{importJob.jobRef}</dd>
            </div>
            <div>
              <dt>Source ref</dt>
              <dd>{importJob.sourceRef}</dd>
            </div>
            <div>
              <dt>Updated</dt>
              <dd>{importJob.sourceUpdatedAt}</dd>
            </div>
            <div>
              <dt>Expires</dt>
              <dd>{importJob.expiresAt}</dd>
            </div>
          </dl>

          <div
            className="m4-row-error-table"
            role="table"
            aria-label="M4 import row errors"
          >
            <div className="m4-row-error header" role="row">
              <span role="columnheader">Row</span>
              <span role="columnheader">Code</span>
              <span role="columnheader">Operator note</span>
            </div>
            {rowErrors.map(([row, code, note]) => (
              <div className="m4-row-error" role="row" key={`${row}-${code}`}>
                <strong role="cell">{row}</strong>
                <span role="cell">{code}</span>
                <span role="cell">{note}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="m4-query-shell" data-testid="m4-order-snapshot-search">
        <div className="m4-section-heading">
          <h3>Snapshot-backed order search</h3>
          <span>synthetic local states</span>
        </div>
        <div className="m4-query-tabs" aria-label="M4 order snapshot states">
          {snapshotResults.map((result) => (
            <button
              className={result.queryRef === selectedQueryRef ? "selected" : ""}
              key={result.queryRef}
              type="button"
              onClick={() => setSelectedQueryRef(result.queryRef)}
            >
              {result.label}
            </button>
          ))}
        </div>
        <div className="m4-snapshot-detail" data-testid="m4-snapshot-detail">
          <span className={`m4-snapshot-badge ${selectedSnapshot.badge.toLowerCase()}`}>
            {selectedSnapshot.badge}
          </span>
          <strong>{selectedSnapshot.warning}</strong>
          <span>{selectedSnapshot.queryRef}</span>
          <span>{selectedSnapshot.detail}</span>
          <span>Handoff: {selectedSnapshot.handoff}</span>
          {selectedSnapshot.statusRef ? (
            <span>Status ref: {selectedSnapshot.statusRef}</span>
          ) : (
            <span>Status ref hidden until fresh snapshot exists</span>
          )}
        </div>
      </section>

      <M4OrderImportOperatorWorkflow />

      <M4OrderImportVisibleSmokeState />

      <section className="m4-remaining-gates" data-testid="m4-remaining-gates">
        {remainingGates.map(([title, state, scope]) => (
          <article className="m4-gate" key={title}>
            <strong>{title}</strong>
            <span>{state}</span>
            <small>{scope}</small>
          </article>
        ))}
      </section>
    </section>
  );
}

function Metric({
  label,
  tone,
  value
}: {
  label: string;
  tone?: "warn";
  value: number;
}) {
  return (
    <div className={`m4-mini-metric ${tone ?? ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
