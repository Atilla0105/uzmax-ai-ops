import type { ReactNode } from "react";
import { Button } from "../primitives";
import { PageState } from "../patterns";
import { AgentsPage } from "./agents/AgentsPage";
import { ConversationsPage } from "./conversations/ConversationsPage";
import { CustomersPage } from "./customers/CustomersPage";
import { EvalPage } from "./evals/EvalPage";
import { GroupModelRiskPage } from "./group/GroupModelRiskPage";
import { GroupOverviewPage } from "./group/GroupOverviewPage";
import { KnowledgePage } from "./knowledge/KnowledgePage";
import { OrdersPage } from "./orders/OrdersPage";
import { QueuePage } from "./queue/QueuePage";
import { getAdminPage, legacyEvidencePageId, type AdminPageId } from "./registry";
import { TicketsPage } from "./tickets/TicketsPage";

export interface PageOutletProps {
  activePageId: AdminPageId;
  legacyEvidence: ReactNode;
  onEnterTenant: (tenantId: string) => void;
  onPageChange: (pageId: AdminPageId) => void;
  selectedTenantId: string;
}

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

  if (page.id === "tenant.queue") {
    return (
      <section data-page-id={page.id} data-testid="page-outlet">
        <QueuePage />
      </section>
    );
  }

  if (page.id === "group.overview") {
    return (
      <section data-page-id={page.id} data-testid="page-outlet">
        <GroupOverviewPage
          onEnterTenant={onEnterTenant}
          onOpenLegacyEvidence={() => onPageChange(legacyEvidencePageId)}
        />
      </section>
    );
  }

  if (page.id === "group.modelRisk") {
    return (
      <section data-page-id={page.id} data-testid="page-outlet">
        <GroupModelRiskPage onEnterTenant={onEnterTenant} />
      </section>
    );
  }

  if (page.id === "tenant.conversations") {
    return (
      <section
        className="uz-conversation-outlet"
        data-page-id={page.id}
        data-tenant-id={selectedTenantId}
        data-testid="page-outlet"
      >
        <ConversationsPage selectedTenantId={selectedTenantId} />
      </section>
    );
  }

  if (page.id === "tenant.tickets") {
    return (
      <section
        data-page-id={page.id}
        data-tenant-id={selectedTenantId}
        data-testid="page-outlet"
      >
        <TicketsPage key={selectedTenantId} selectedTenantId={selectedTenantId} />
      </section>
    );
  }

  if (page.id === "tenant.customers") {
    return (
      <section
        data-page-id={page.id}
        data-tenant-id={selectedTenantId}
        data-testid="page-outlet"
      >
        <CustomersPage key={selectedTenantId} selectedTenantId={selectedTenantId} />
      </section>
    );
  }

  if (page.id === "tenant.orders") {
    return (
      <section
        data-page-id={page.id}
        data-tenant-id={selectedTenantId}
        data-testid="page-outlet"
      >
        <OrdersPage key={selectedTenantId} selectedTenantId={selectedTenantId} />
      </section>
    );
  }

  if (page.id === "tenant.knowledge") {
    return (
      <section
        data-page-id={page.id}
        data-tenant-id={selectedTenantId}
        data-testid="page-outlet"
      >
        <KnowledgePage key={selectedTenantId} selectedTenantId={selectedTenantId} />
      </section>
    );
  }

  if (page.id === "tenant.eval") {
    return (
      <section
        data-page-id={page.id}
        data-tenant-id={selectedTenantId}
        data-testid="page-outlet"
      >
        <EvalPage key={selectedTenantId} selectedTenantId={selectedTenantId} />
      </section>
    );
  }

  if (page.id === "tenant.aiMembers")
    return (
      <section
        data-page-id={page.id}
        data-tenant-id={selectedTenantId}
        data-testid="page-outlet"
      >
        <AgentsPage key={selectedTenantId} selectedTenantId={selectedTenantId} />
      </section>
    );

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
