import { useState } from "react";

import { M4CustomerAssetRuntimeState } from "./M4CustomerAssetRuntimeState";
import "./m4-order-path-status-shell.css";

const filters = [
  ["all", "All customers"],
  ["language", "Language"],
  ["script", "Script"],
  ["stage", "Journey stage"],
  ["unresolved", "Unresolved issues"],
  ["blacklisted", "Blacklist"],
  ["unreachable", "Unreachable"],
  ["hasOrder", "Has order"],
  ["hasQuote", "Has quote"]
] as const;

const customerRows = [
  [
    "customer://alpha",
    "label://customer-alpha",
    "uz",
    "latin",
    "pre-check",
    "review_required",
    2,
    true,
    true,
    true,
    true
  ],
  [
    "customer://beta",
    "label://customer-beta",
    "ru",
    "cyrillic",
    "handoff-ready",
    "active",
    1,
    false,
    false,
    true,
    false
  ]
] as const;

const fieldTagRows = [
  ["field://journey-stage", "Journey stage", "pre-check"],
  ["field://preferred-script", "Preferred script", "latin"],
  ["tag://customer-review", "Customer tag", "needs_review"],
  ["tag://conversation-issue", "Conversation tag", "issue_ref_required"],
  ["tag://custom-field-owner", "Custom field", "operator_owned"]
] as const;

const relatedRefs = [
  ["History conversations", "conversation://alpha-history"],
  ["Tickets", "ticket://alpha-open"],
  ["Order snapshots", "snapshot://order-alpha"],
  ["Quote records", "quote://alpha-draft"],
  ["Dual-track guide records", "guide://dual-track-alpha"],
  ["Human notes", "note://alpha-local"]
] as const;

const secondaryCards = [
  ["Customer list", "filters stay local", "visible in shell"],
  ["Conversation search", "controlled refs only", "visible in shell"],
  ["Customer tags", "definition reuse visible", "visible in shell"],
  ["Conversation tags", "analysis reuse pending", "visible in shell"],
  ["Custom fields", "config save pending", "visible in shell"],
  ["API runtime", "future M4 spec", "no default network call"],
  ["Audit persistence", "future M4 spec", "restore draft only"],
  ["History aggregation", "future M4 spec", "refs are not runtime joins"]
] as const;

type FilterKey = (typeof filters)[number][0];
type CustomerRow = (typeof customerRows)[number];

export function M4CustomerAssetShell({ tenantName }: { tenantName: string }) {
  const [selectedFilter, setSelectedFilter] = useState<FilterKey>("all");
  const [selectedCustomerRef, setSelectedCustomerRef] = useState<CustomerRow[0]>(
    customerRows[0][0]
  );
  const [restoreDraftVisible, setRestoreDraftVisible] = useState(false);
  const selectedCustomer =
    customerRows.find((customer) => customer[0] === selectedCustomerRef) ??
    customerRows[0];
  const visibleCustomers = customerRows.filter((customer) =>
    customerMatchesFilter(customer, selectedFilter)
  );
  const filterLabel =
    filters.find(([key]) => key === selectedFilter)?.[1] ?? "All customers";

  return (
    <section className="panel m4-shell" data-testid="m4-customer-asset-shell">
      <div className="m4-shell-heading">
        <div>
          <p className="eyebrow">Tenant customer assets</p>
          <h2>Customer asset center</h2>
        </div>
        <div className="m4-mode" data-testid="m4-customer-shell-mode">
          <strong>{tenantName}</strong>
          <span>synthetic local shell</span>
        </div>
      </div>

      <div className="m4-primary-path" data-testid="m4-customer-asset-boundary">
        <span>Customer asset admin shell</span>
        <strong>No real customer data rendered</strong>
        <small>API client contract exists; runtime fetch remains future scope</small>
      </div>
      <M4CustomerAssetRuntimeState />

      <section className="m4-query-shell" data-testid="m4-customer-filters">
        <div className="m4-section-heading">
          <h3>Customer list filters</h3>
          <span>{filterLabel}</span>
        </div>
        <div className="m4-query-tabs" aria-label="M4 customer asset filters">
          {filters.map(([key, label]) => (
            <button
              className={key === selectedFilter ? "selected" : ""}
              key={key}
              type="button"
              onClick={() => setSelectedFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <div className="m4-layout">
        <section className="m4-column" data-testid="m4-customer-list">
          <div className="m4-section-heading">
            <h3>Selected tenant list</h3>
            <span>{visibleCustomers.length} controlled refs</span>
          </div>
          <div className="m4-signal-table" aria-label="Customer refs">
            <div className="m4-signal-row header">
              <span>Customer ref</span>
              <span>Flags</span>
              <span>Stage</span>
            </div>
            {visibleCustomers.map((customer) => (
              <button
                className="m4-signal-row"
                key={customer[0]}
                type="button"
                onClick={() => {
                  setSelectedCustomerRef(customer[0]);
                  setRestoreDraftVisible(false);
                }}
              >
                <strong>{customer[0]}</strong>
                <span>{flagSummary(customer)}</span>
                <span>{customer[4]}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="m4-column" data-testid="m4-customer-detail">
          <div className="m4-section-heading">
            <h3>Customer detail</h3>
            <span>{selectedCustomer[5]}</span>
          </div>
          <dl className="m4-ref-list">
            <Ref label="Display ref" value={selectedCustomer[1]} />
            <Ref label="Identity" value="identity://alpha-primary" />
            <Ref label="Language" value={selectedCustomer[2]} />
            <Ref label="Script" value={selectedCustomer[3]} />
            <Ref label="Unresolved issues" value={`${selectedCustomer[6]}`} />
            <Ref
              label="Restore state"
              value={restoreDraftVisible ? "drafted" : "none"}
            />
          </dl>
          <div className="m4-action-row">
            <button type="button" onClick={() => setRestoreDraftVisible(true)}>
              Restore flags locally
            </button>
            <button type="button" disabled>
              Merge identity blocked
            </button>
            <button type="button" disabled>
              Anonymized delete locked
            </button>
          </div>
          <div data-testid="m4-customer-restore-state">
            {restoreDraftVisible ? (
              <p>
                Audit draft: customer_restore_flags, reason://owner-review, restored
                blacklisted and unreachable flags.
              </p>
            ) : (
              <p>Restore draft not created.</p>
            )}
          </div>
        </section>
      </div>

      <div className="m4-layout">
        <section className="m4-column" data-testid="m4-customer-field-tags">
          <div className="m4-section-heading">
            <h3>Fields and tags</h3>
            <span>definitions visible</span>
          </div>
          <dl className="m4-ref-list">
            {fieldTagRows.map(([ref, label, value]) => (
              <Ref key={ref} label={label} value={`${ref} / ${value}`} />
            ))}
          </dl>
        </section>

        <section className="m4-column" data-testid="m4-customer-related-refs">
          <div className="m4-section-heading">
            <h3>Related refs</h3>
            <span>controlled only</span>
          </div>
          <dl className="m4-ref-list">
            {relatedRefs.map(([label, value]) => (
              <Ref key={value} label={label} value={value} />
            ))}
          </dl>
        </section>
      </div>

      <section className="m4-remaining-gates" data-testid="m4-customer-secondary">
        {secondaryCards.map(([title, state, scope]) => (
          <article className="m4-gate" key={title}>
            <div>
              <strong>{title}</strong>
              <span>{state}</span>
            </div>
            <small>{scope}</small>
          </article>
        ))}
      </section>
    </section>
  );
}

function Ref({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function customerMatchesFilter(customer: CustomerRow, selectedFilter: FilterKey) {
  if (selectedFilter === "blacklisted") return customer[7];
  if (selectedFilter === "unreachable") return customer[8];
  if (selectedFilter === "hasOrder") return customer[9];
  if (selectedFilter === "hasQuote") return customer[10];
  if (selectedFilter === "unresolved") return customer[6] > 0;
  return true;
}

function flagSummary(customer: CustomerRow) {
  return [
    customer[7] ? "blacklisted" : "not blacklisted",
    customer[8] ? "unreachable" : "reachable",
    customer[9] ? "has order" : "no order",
    customer[10] ? "has quote" : "no quote"
  ].join(" / ");
}
