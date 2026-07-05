import type { ReactNode } from "react";
import { Button } from "../primitives";
import { PageState } from "../patterns";
import { AgentsPage } from "./agents/AgentsPage";
import { ConversationsPage } from "./conversations/ConversationsPage";
import { CustomersPage } from "./customers/CustomersPage";
import { EvalPage } from "./evals/EvalPage";
import { GroupConnectionPage } from "./group/GroupConnectionPage";
import { GroupLogsPage } from "./group/GroupLogsPage";
import { GroupModelRiskPage } from "./group/GroupModelRiskPage";
import { GroupOverviewPage } from "./group/GroupOverviewPage";
import { GroupTenantPage } from "./group/GroupTenantPage";
import { GroupTemplatePage } from "./group/GroupTemplatePage";
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

type PageRenderContext = Pick<
  PageOutletProps,
  "onEnterTenant" | "onPageChange" | "selectedTenantId"
>;
type PageRenderer = (context: PageRenderContext) => ReactNode;

const groupPageRenderers: Partial<Record<AdminPageId, PageRenderer>> = {
  "group.connections": () => <GroupConnectionPage />,
  "group.logs": () => <GroupLogsPage />,
  "group.modelRisk": ({ onEnterTenant }) => (
    <GroupModelRiskPage onEnterTenant={onEnterTenant} />
  ),
  "group.overview": ({ onEnterTenant, onPageChange }) => (
    <GroupOverviewPage
      onEnterTenant={onEnterTenant}
      onOpenLegacyEvidence={() => onPageChange(legacyEvidencePageId)}
    />
  ),
  "group.tenants": () => <GroupTenantPage />,
  "group.templates": () => <GroupTemplatePage />
};

const tenantPageRenderers: Partial<Record<AdminPageId, PageRenderer>> = {
  "tenant.aiMembers": ({ selectedTenantId }) => (
    <AgentsPage key={selectedTenantId} selectedTenantId={selectedTenantId} />
  ),
  "tenant.conversations": ({ selectedTenantId }) => (
    <ConversationsPage selectedTenantId={selectedTenantId} />
  ),
  "tenant.customers": ({ selectedTenantId }) => (
    <CustomersPage key={selectedTenantId} selectedTenantId={selectedTenantId} />
  ),
  "tenant.eval": ({ selectedTenantId }) => (
    <EvalPage key={selectedTenantId} selectedTenantId={selectedTenantId} />
  ),
  "tenant.knowledge": ({ selectedTenantId }) => (
    <KnowledgePage key={selectedTenantId} selectedTenantId={selectedTenantId} />
  ),
  "tenant.orders": ({ selectedTenantId }) => (
    <OrdersPage key={selectedTenantId} selectedTenantId={selectedTenantId} />
  ),
  "tenant.queue": () => <QueuePage />,
  "tenant.tickets": ({ selectedTenantId }) => (
    <TicketsPage key={selectedTenantId} selectedTenantId={selectedTenantId} />
  ),
  "tenant.team": ({ selectedTenantId }) => (
    <TeamPage key={selectedTenantId} selectedTenantId={selectedTenantId} />
  )
};

export function PageOutlet({
  activePageId,
  legacyEvidence,
  onEnterTenant,
  onPageChange,
  selectedTenantId
}: PageOutletProps) {
  const page = getAdminPage(activePageId);
  const pageId = activePageId;
  const context = { onEnterTenant, onPageChange, selectedTenantId };

  if (pageId === legacyEvidencePageId) {
    return (
      <section data-page-id={pageId} data-testid="legacy-evidence-route">
        {legacyEvidence}
      </section>
    );
  }

  const groupPage = groupPageRenderers[pageId];
  if (groupPage) return renderPlainOutlet(pageId, groupPage(context));

  const tenantPage = tenantPageRenderers[pageId];
  if (tenantPage) {
    const tenantContent = tenantPage(context);
    if (pageId === "tenant.queue") return renderPlainOutlet(pageId, tenantContent);
    return renderTenantOutlet(
      pageId,
      tenantContent,
      selectedTenantId,
      pageId === "tenant.conversations"
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

function renderPlainOutlet(pageId: AdminPageId, children: ReactNode) {
  return (
    <section data-page-id={pageId} data-testid="page-outlet">
      {children}
    </section>
  );
}

function renderTenantOutlet(
  pageId: AdminPageId,
  children: ReactNode,
  selectedTenantId: string,
  isConversation: boolean
) {
  return (
    <section
      className={isConversation ? "uz-conversation-outlet" : undefined}
      data-page-id={pageId}
      data-tenant-id={selectedTenantId}
      data-testid="page-outlet"
    >
      {children}
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
