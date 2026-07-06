import type { ReactNode } from "react";
import { Button } from "../primitives";
import { PageState } from "../patterns";
import { AgentsPage } from "./agents/AgentsPage";
import { ConfigPage } from "./config/ConfigPage";
import { ConversationsPage } from "./conversations/ConversationsPage";
import { CustomersPage } from "./customers/CustomersPage";
import { EvalPage } from "./evals/EvalPage";
import { GroupConnectionPage } from "./group/GroupConnectionPage";
import { GroupLogsPage } from "./group/GroupLogsPage";
import { GroupModelRiskPage } from "./group/GroupModelRiskPage";
import { GroupOverviewPage } from "./group/GroupOverviewPage";
import { GroupTemplatePage } from "./group/GroupTemplatePage";
import { GroupTenantPage } from "./group/GroupTenantPage";
import { KnowledgePage } from "./knowledge/KnowledgePage";
import { OrdersPage } from "./orders/OrdersPage";
import { QueuePage } from "./queue/QueuePage";
import { getAdminPage, legacyEvidencePageId, type AdminPageId } from "./registry";
import { TeamPage } from "./team/TeamPage";
import { TicketsPage } from "./tickets/TicketsPage";

export interface PageOutletProps {
  activePageId: AdminPageId;
  legacyEvidence: ReactNode;
  onEnterTenant: (tenantId: string) => void;
  onPageChange: (pageId: AdminPageId) => void;
  selectedTenantId: string;
}

interface ImplementedPageContext {
  onEnterTenant: (tenantId: string) => void;
  onPageChange: (pageId: AdminPageId) => void;
  selectedTenantId: string;
}

interface ImplementedPage {
  className?: string;
  content: ReactNode;
}

type ImplementedPageRenderer = (context: ImplementedPageContext) => ImplementedPage;

const implementedPageRenderers: Partial<Record<AdminPageId, ImplementedPageRenderer>> =
  {
    "group.overview": ({ onEnterTenant, onPageChange }) => ({
      content: (
        <GroupOverviewPage
          onEnterTenant={onEnterTenant}
          onOpenLegacyEvidence={() => onPageChange(legacyEvidencePageId)}
        />
      )
    }),
    "group.modelRisk": ({ onEnterTenant }) => ({
      content: <GroupModelRiskPage onEnterTenant={onEnterTenant} />
    }),
    "group.templates": () => ({
      content: <GroupTemplatePage />
    }),
    "group.connections": () => ({
      content: <GroupConnectionPage />
    }),
    "group.tenants": () => ({
      content: <GroupTenantPage />
    }),
    "group.logs": () => ({
      content: <GroupLogsPage />
    }),
    "tenant.aiMembers": ({ selectedTenantId }) => ({
      content: <AgentsPage key={selectedTenantId} selectedTenantId={selectedTenantId} />
    }),
    "tenant.conversations": ({ selectedTenantId }) => ({
      className: "uz-conversation-outlet",
      content: <ConversationsPage selectedTenantId={selectedTenantId} />
    }),
    "tenant.config": ({ selectedTenantId }) => ({
      content: <ConfigPage key={selectedTenantId} selectedTenantId={selectedTenantId} />
    }),
    "tenant.customers": ({ selectedTenantId }) => ({
      content: (
        <CustomersPage key={selectedTenantId} selectedTenantId={selectedTenantId} />
      )
    }),
    "tenant.eval": ({ selectedTenantId }) => ({
      content: <EvalPage key={selectedTenantId} selectedTenantId={selectedTenantId} />
    }),
    "tenant.knowledge": ({ selectedTenantId }) => ({
      content: (
        <KnowledgePage key={selectedTenantId} selectedTenantId={selectedTenantId} />
      )
    }),
    "tenant.orders": ({ selectedTenantId }) => ({
      content: <OrdersPage key={selectedTenantId} selectedTenantId={selectedTenantId} />
    }),
    "tenant.queue": () => ({ content: <QueuePage /> }),
    "tenant.team": ({ selectedTenantId }) => ({
      content: <TeamPage key={selectedTenantId} selectedTenantId={selectedTenantId} />
    }),
    "tenant.tickets": ({ selectedTenantId }) => ({
      content: (
        <TicketsPage key={selectedTenantId} selectedTenantId={selectedTenantId} />
      )
    })
  };

export function PageOutlet({
  activePageId,
  legacyEvidence,
  onEnterTenant,
  onPageChange,
  selectedTenantId
}: PageOutletProps) {
  const page = getAdminPage(activePageId);

  if (page.id === legacyEvidencePageId) {
    return (
      <section data-page-id={page.id} data-testid="legacy-evidence-route">
        {legacyEvidence}
      </section>
    );
  }

  const renderedPage = implementedPageRenderers[activePageId]?.({
    onEnterTenant,
    onPageChange,
    selectedTenantId
  });
  if (renderedPage) {
    return (
      <section
        className={renderedPage.className}
        data-page-id={page.id}
        data-tenant-id={page.layer === "tenant" ? selectedTenantId : undefined}
        data-testid="page-outlet"
      >
        {renderedPage.content}
      </section>
    );
  }

  return (
    <section className="page-grid" data-page-id={page.id} data-testid="page-outlet">
      <section className="panel release-panel" data-testid="page-scaffold">
        <div className="section-heading">
          <p className="eyebrow">M7-UI page route</p>
          <h2>{page.label}</h2>
        </div>
        <PageState
          action={
            <Button
              onClick={() => onPageChange(legacyEvidencePageId)}
              variant="secondary"
            >
              Open legacy evidence route
            </Button>
          }
          data-testid="planned-page-state"
          kind="empty"
          message={
            <>
              Migration is not started. Use{" "}
              <a href="docs/admin-ui-page-migration-ledger.md">
                docs/admin-ui-page-migration-ledger.md
              </a>{" "}
              and{" "}
              <a href="docs/specs/M7-UI-03-page-migration-ledger-and-router.md">
                M7-UI-03
              </a>{" "}
              before dispatching the target page spec.
            </>
          }
          title="Page migration not started"
        />
        <div className="entry-grid" aria-label="Page migration contract">
          <RegistryFact label="Page ID" value={page.id} />
          <RegistryFact label="Layer" value={page.layer} />
          <RegistryFact label="Target spec" value={page.targetSpecId} />
          <RegistryFact label="Status" value={page.status} />
          <RegistryFact label="Prototype source" value={page.sourcePath} />
          <RegistryFact label="Target repo path" value={page.targetPath} />
          <RegistryFact
            label="Required states"
            value={page.requiredStates.join(", ")}
          />
          <RegistryFact label="Evidence" value={page.evidenceStatus} />
        </div>
        <div className="notice">
          <strong>Start gate</strong>
          <span>
            This route is a registry scaffold only. It does not import prototype
            fixtures, migrate page content or claim runtime/API closure.
          </span>
        </div>
      </section>
    </section>
  );
}

function RegistryFact({ label, value }: { label: string; value: ReactNode }) {
  return (
    <article className="entry">
      <h3>{label}</h3>
      <p>{value}</p>
    </article>
  );
}
