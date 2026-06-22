import { useState } from "react";
import "@uzmax/ui-tokens/tokens.css";
import "./styles.css";
import { M2ConversationTicketShell } from "./M2ConversationTicketShell";
import { M3KnowledgeEvalShell } from "./M3KnowledgeEvalShell";
import { M4OrderPathStatusShell } from "./M4OrderPathStatusShell";

const tenants = [
  {
    health: "healthy",
    id: "tenant-a",
    name: "Tenant A",
    risk: "aggregate only",
    status: "Healthy"
  },
  {
    health: "degraded",
    id: "tenant-b",
    name: "Tenant B",
    risk: "connector degraded",
    status: "Connector degraded"
  },
  {
    health: "attention",
    id: "tenant-c",
    name: "Tenant C",
    risk: "manual review",
    status: "Manual review"
  }
] as const;

const navItems = ["Group", "Tenants", "Access", "Release"] as const;
const releaseGates = [
  {
    adr: "ADR-001/002/003",
    blocker: "none",
    evidence: "CI + spikes",
    gate: "M0",
    owner: "accepted",
    state: "Accepted"
  },
  {
    adr: "M1 specs",
    blocker: "M1-05 open",
    evidence: "M1-01 to M1-04 rolling evidence",
    gate: "M1",
    owner: "pending",
    state: "In progress"
  },
  {
    adr: "release checklist",
    blocker: "checklist locked",
    evidence: "Blocked until checklist green",
    gate: "GA-0",
    owner: "not requested",
    state: "Locked"
  }
] as const;

export function App() {
  const [selectedTenantId, setSelectedTenantId] =
    useState<(typeof tenants)[number]["id"]>("tenant-a");
  const selectedTenant =
    tenants.find((tenant) => tenant.id === selectedTenantId) ?? tenants[0];

  return (
    <main className="admin-shell m2-admin-shell" data-testid="admin-shell">
      <aside className="rail" aria-label="Primary navigation">
        <div className="rail-mark">UZ</div>
        {navItems.map((item) => (
          <button className="rail-button" key={item} type="button" aria-label={item}>
            {item.slice(0, 1)}
          </button>
        ))}
      </aside>

      <section className="workspace" aria-labelledby="admin-title">
        <header className="topbar">
          <div>
            <p className="eyebrow">Group / {selectedTenant.name}</p>
            <h1 id="admin-title">UZMAX Operations Tower</h1>
          </div>
          <label className="tenant-switcher" htmlFor="tenant-switcher">
            <span>Tenant</span>
            <select
              id="tenant-switcher"
              data-testid="tenant-switcher"
              value={selectedTenantId}
              onChange={(event) =>
                setSelectedTenantId(
                  event.currentTarget.value as typeof selectedTenantId
                )
              }
            >
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.name} - {tenant.status}
                </option>
              ))}
            </select>
          </label>
          <div className="topbar-tools" aria-label="Operator tools">
            <input aria-label="Search" readOnly value="Search shell" />
            <button type="button" disabled>
              Notifications
            </button>
            <button type="button" disabled>
              User menu
            </button>
          </div>
          <div className="topbar-status" aria-label="System status">
            <span className="pill">staging</span>
            <span className="heartbeat">API shell not production ready</span>
          </div>
        </header>

        <section className="page-grid">
          <section className="panel group-panel" data-testid="group-layer">
            <div className="section-heading">
              <p className="eyebrow">Group layer</p>
              <h2>Tenant health and risk</h2>
            </div>
            <div className="metric-grid" aria-label="Group health metrics">
              <Metric label="Tenants" value="3" />
              <Metric label="Needs attention" value="2" tone="warn" />
              <Metric label="AI fuse" value="off" />
              <Metric label="Connector issues" value="1" tone="warn" />
            </div>
            <table className="tenant-table">
              <thead>
                <tr>
                  <th>Tenant</th>
                  <th>Health</th>
                  <th>Gate</th>
                  <th>Last risk</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((tenant) => (
                  <tr key={tenant.id}>
                    <td>{tenant.name}</td>
                    <td>
                      <span className={`status-dot ${tenant.health}`} />
                      {tenant.status}
                    </td>
                    <td>M1 shell</td>
                    <td>{tenant.risk}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="panel tenant-panel" data-testid="tenant-layer">
            <div className="section-heading">
              <p className="eyebrow">Tenant layer</p>
              <h2>Authorized workspace shell</h2>
            </div>
            <div className="notice">
              <strong>Permission boundary</strong>
              <span>No real customer identifiers or message bodies are rendered.</span>
            </div>
            <div className="entry-grid">
              <Entry
                title="Authorization workbench"
                value="roles, permissions, tenant access"
                testId="authz-entry"
              />
              <Entry
                title="Tenant degraded state"
                value={`${selectedTenant.name}: ${selectedTenant.status}`}
                testId="tenant-health-entry"
              />
              <Entry
                title="Audit and config versions"
                value="permission changes, tenant switches, config save and rollback"
                testId="audit-config-entry"
              />
              <Entry
                title="Permission denied state"
                value="visible frontend state; backend guard remains authoritative"
              />
            </div>
          </section>

          <M2ConversationTicketShell tenantName={selectedTenant.name} />

          <M3KnowledgeEvalShell tenantName={selectedTenant.name} />

          <M4OrderPathStatusShell tenantName={selectedTenant.name} />

          <section className="panel release-panel" data-testid="release-readiness">
            <div className="section-heading">
              <p className="eyebrow">Release and acceptance</p>
              <h2>Gate status</h2>
            </div>
            <div className="gate-list">
              {releaseGates.map((gate) => (
                <div className="gate-row" key={gate.gate}>
                  <span className="gate-code">{gate.gate}</span>
                  <span>{gate.state}</span>
                  <span>{gate.evidence}</span>
                  <span>Owner: {gate.owner}</span>
                  <span>Blocker: {gate.blocker}</span>
                  <span>{gate.adr}</span>
                </div>
              ))}
            </div>
            <button className="release-button" type="button" disabled>
              GA-0 open action locked
            </button>
          </section>
        </section>
      </section>
    </main>
  );
}

function Metric({
  label,
  tone = "neutral",
  value
}: {
  label: string;
  tone?: "neutral" | "warn";
  value: string;
}) {
  return (
    <div className={`metric ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Entry({
  testId,
  title,
  value
}: {
  testId?: string;
  title: string;
  value: string;
}) {
  return (
    <article className="entry" data-testid={testId}>
      <h3>{title}</h3>
      <p>{value}</p>
    </article>
  );
}
