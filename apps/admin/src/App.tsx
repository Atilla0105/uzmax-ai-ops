import { useState } from "react";
import "@uzmax/ui-tokens/tokens.css";
import "./styles.css";
import { PageOutlet } from "./pages/PageOutlet";
import { getAdminPage, initialAdminPageId, type AdminPageId } from "./pages/registry";
import { AppShell, type AdminShellRoute } from "./shell/AppShell";
import { FoundationPreview } from "./shell/FoundationPreview";
import { M2ConversationTicketShell } from "./M2ConversationTicketShell";
import { M3KnowledgeEvalShell } from "./M3KnowledgeEvalShell";
import { M4CustomerAssetShell } from "./M4CustomerAssetShell";
import { M4OrderPathStatusShell } from "./M4OrderPathStatusShell";
import { M5AiMemberConsoleShell } from "./M5AiMemberConsoleShell";
import { M5ConfirmationQueueShell } from "./M5ConfirmationQueueShell";
import { M5LogsAnalyticsShell } from "./M5LogsAnalyticsShell";
import { M5TemplateCenterShell } from "./M5TemplateCenterShell";
import { releaseGateConsoleState } from "./releaseGateContracts";
const tenants = [
  {
    health: "healthy",
    id: "tenant-a",
    line: "美妆 · 中亚",
    name: "玉珠跨境美妆",
    risk: "aggregate only",
    status: "健康"
  },
  {
    health: "degraded",
    id: "tenant-b",
    line: "3C数码 · 俄语区",
    name: "丝路数码",
    risk: "connector degraded",
    status: "降级"
  },
  {
    health: "attention",
    id: "tenant-c",
    line: "家居 · 哈萨克",
    name: "天净家居",
    risk: "manual review",
    status: "需人工"
  },
  {
    health: "breaker",
    id: "tenant-d",
    line: "母婴 · 俄语区",
    name: "白桦母婴",
    risk: "breaker offline",
    status: "熔断"
  }
] as const;

export function App() {
  const [foundationTab, setFoundationTab] = useState("states");
  const [previewToggle, setPreviewToggle] = useState(true);
  const [previewChecked, setPreviewChecked] = useState(true);
  const [route, setRoute] = useState<AdminShellRoute>({
    level: "group",
    pageId: initialAdminPageId
  });
  const selectedTenantId = route.tenantId ?? tenants[0].id;
  const selectedTenant =
    tenants.find((tenant) => tenant.id === selectedTenantId) ?? tenants[0];

  const setAdminRoute = (nextRoute: AdminShellRoute) => {
    const page = getAdminPage(nextRoute.pageId);

    if (page.layer === "tenant") {
      setRoute({
        level: "tenant",
        pageId: nextRoute.pageId,
        tenantId: nextRoute.tenantId ?? selectedTenant.id
      });
      return;
    }

    setRoute({
      level: "group",
      pageId: page.layer === "group" ? nextRoute.pageId : "legacy.evidence",
      tenantId: nextRoute.tenantId ?? route.tenantId
    });
  };

  const setActivePageId = (pageId: AdminPageId) => {
    const page = getAdminPage(pageId);

    if (page.layer === "tenant") {
      setAdminRoute({ level: "tenant", pageId, tenantId: selectedTenant.id });
      return;
    }

    setAdminRoute({ level: "group", pageId, tenantId: route.tenantId });
  };

  const legacyEvidence = (
    <section className="page-grid">
      <section className="panel group-panel" data-testid="group-layer">
        <div className="section-heading">
          <p className="eyebrow">Group layer</p>
          <h2>Tenant health and risk</h2>
        </div>
        <div className="metric-grid" aria-label="Group health metrics">
          <Metric label="Tenants" value={String(tenants.length)} />
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
      <M4CustomerAssetShell tenantName={selectedTenant.name} />
      <M5ConfirmationQueueShell tenantName={selectedTenant.name} />
      <M5AiMemberConsoleShell tenantName={selectedTenant.name} />
      <M5LogsAnalyticsShell tenantName={selectedTenant.name} />
      <M5TemplateCenterShell tenantName={selectedTenant.name} />
      <FoundationPreview
        activeTab={foundationTab}
        checked={previewChecked}
        onCheckedChange={setPreviewChecked}
        onTabChange={setFoundationTab}
        onToggleChange={setPreviewToggle}
        toggleOn={previewToggle}
      />

      <section className="panel release-panel" data-testid="release-readiness">
        <div className="section-heading">
          <p className="eyebrow">Release and acceptance</p>
          <h2>Gate status</h2>
        </div>
        <div className="notice" data-testid="release-gate-summary">
          <strong>Current release gate</strong>
          <span>{releaseGateConsoleState.summary}</span>
        </div>
        <div className="gate-list">
          {releaseGateConsoleState.rows.map((gate) => (
            <div
              className="gate-row"
              data-testid={`release-gate-${gate.gate}`}
              key={gate.gate}
            >
              <span className="gate-code">{gate.gate}</span>
              <span>{gate.state}</span>
              <a href={gate.evidenceHref}>{gate.evidenceLabel}</a>
              <span>Owner: {gate.owner}</span>
              <span>Blocker: {gate.blocker}</span>
              <span>{gate.source}</span>
            </div>
          ))}
        </div>
        <button
          className="release-button"
          type="button"
          disabled={releaseGateConsoleState.ga0Action.disabled}
          title={releaseGateConsoleState.ga0Action.auditBoundary}
        >
          {releaseGateConsoleState.ga0Action.label}
        </button>
      </section>
    </section>
  );

  return (
    <AppShell
      onRouteChange={setAdminRoute}
      route={route}
      selectedTenantId={selectedTenant.id}
      tenants={tenants}
    >
      <PageOutlet
        activePageId={route.pageId}
        legacyEvidence={legacyEvidence}
        onPageChange={setActivePageId}
        selectedTenantId={selectedTenant.id}
      />
    </AppShell>
  );
}

const Metric = ({
  label,
  tone = "neutral",
  value
}: {
  label: string;
  tone?: "neutral" | "warn";
  value: string;
}) => (
  <div className={`metric ${tone}`}>
    <span>{label}</span>
    <strong>{value}</strong>
  </div>
);

const Entry = ({
  testId,
  title,
  value
}: {
  testId?: string;
  title: string;
  value: string;
}) => (
  <article className="entry" data-testid={testId}>
    <h3>{title}</h3>
    <p>{value}</p>
  </article>
);
