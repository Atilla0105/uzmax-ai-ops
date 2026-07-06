type AdminPageLayer = "group" | "tenant" | "legacy";
type AdminPageNavSection = "group" | "tenant";
type AdminPageStatus =
  | "legacy_evidence"
  | "not_started"
  | "implemented_in_worker_pending_pr";
interface AdminPageRegistryEntry {
  evidenceStatus: string;
  iaPage: string;
  id: string;
  label: string;
  layer: AdminPageLayer;
  navId?: string;
  navSection?: AdminPageNavSection;
  order: number;
  requiredStates: readonly string[];
  sourcePath: string;
  status: AdminPageStatus;
  targetPath: string;
  targetSpecId: string;
}
const stateMatrix = ["loading", "empty", "error", "permission", "degraded"] as const;

const adminPageRegistry = [
  {
    evidenceStatus: "legacy_evidence_route",
    iaPage: "M2-M6 legacy evidence",
    id: "legacy.evidence",
    label: "Legacy evidence",
    layer: "legacy",
    order: 0,
    requiredStates: ["existing milestone evidence anchors"],
    sourcePath: "apps/admin/src/App.tsx legacy M2-M6 shells",
    status: "legacy_evidence",
    targetPath: "apps/admin/src/App.tsx",
    targetSpecId: "M7-UI-03-page-migration-ledger-and-router"
  },
  {
    evidenceStatus: "implementation_candidate_pending_pr_review",
    iaPage: "集团总览",
    id: "group.overview",
    label: "集团总览",
    layer: "group",
    navId: "overview",
    navSection: "group",
    order: 1,
    requiredStates: stateMatrix,
    sourcePath: "/Users/atilla/源码/unpacked 6/pages/group/GroupOverviewPage.tsx",
    status: "implemented_in_worker_pending_pr",
    targetPath: "apps/admin/src/pages/group/GroupOverviewPage.tsx",
    targetSpecId: "M7-UI-12-group-overview-page"
  },
  {
    evidenceStatus:
      "implementation_evidence_pending_pr_review_not_accepted_not_runtime_closed",
    iaPage: "模型/成本/风险",
    id: "group.modelRisk",
    label: "模型/成本/风险",
    layer: "group",
    navId: "model-risk",
    navSection: "group",
    order: 2,
    requiredStates: stateMatrix,
    sourcePath: "/Users/atilla/源码/unpacked 6/pages/group/GroupModelPage.tsx",
    status: "implemented_in_worker_pending_pr",
    targetPath: "apps/admin/src/pages/group/GroupModelRiskPage.tsx",
    targetSpecId: "M7-UI-42-model-cost-risk-page"
  },
  {
    evidenceStatus:
      "implementation_candidate_pending_pr_review_not_accepted_not_runtime_closed",
    iaPage: "模板中心",
    id: "group.templates",
    label: "模板中心",
    layer: "group",
    navId: "templates",
    navSection: "group",
    order: 3,
    requiredStates: stateMatrix,
    sourcePath: "/Users/atilla/源码/unpacked 6/pages/group/GroupTemplatePage.tsx",
    status: "implemented_in_worker_pending_pr",
    targetPath: "apps/admin/src/pages/group/GroupTemplatePage.tsx",
    targetSpecId: "M7-UI-50-template-center-page"
  },
  {
    evidenceStatus:
      "implementation_candidate_pending_pr_review_not_accepted_not_runtime_closed",
    iaPage: "连接中心",
    id: "group.connections",
    label: "连接中心",
    layer: "group",
    navId: "connections",
    navSection: "group",
    order: 4,
    requiredStates: stateMatrix,
    sourcePath: "/Users/atilla/源码/unpacked 6/pages/group/GroupConnectionPage.tsx",
    status: "implemented_in_worker_pending_pr",
    targetPath: "apps/admin/src/pages/group/GroupConnectionPage.tsx",
    targetSpecId: "M7-UI-51-connection-center-page"
  },
  {
    evidenceStatus: "not_started",
    iaPage: "发布与验收",
    id: "group.release",
    label: "发布与验收",
    layer: "group",
    navId: "release",
    navSection: "group",
    order: 5,
    requiredStates: [...stateMatrix, "owner-decision-required"],
    sourcePath: "/Users/atilla/源码/unpacked 6/pages/group/GroupReleasePage.tsx",
    status: "not_started",
    targetPath: "apps/admin/src/pages/group/GroupReleasePage.tsx",
    targetSpecId: "M7-UI-11-release-acceptance-page"
  },
  {
    evidenceStatus:
      "implementation_candidate_pending_pr_review_not_accepted_not_runtime_closed",
    iaPage: "租户管理",
    id: "group.tenants",
    label: "租户管理",
    layer: "group",
    navId: "tenants",
    navSection: "group",
    order: 6,
    requiredStates: stateMatrix,
    sourcePath: "/Users/atilla/源码/unpacked 6/pages/group/GroupTenantPage.tsx",
    status: "implemented_in_worker_pending_pr",
    targetPath: "apps/admin/src/pages/group/GroupTenantPage.tsx",
    targetSpecId: "M7-UI-52-tenant-management-page"
  },
  {
    evidenceStatus:
      "implementation_candidate_pending_pr_review_not_accepted_not_runtime_closed",
    iaPage: "集团日志",
    id: "group.logs",
    label: "集团日志",
    layer: "group",
    navId: "group-logs",
    navSection: "group",
    order: 7,
    requiredStates: stateMatrix,
    sourcePath: "/Users/atilla/源码/unpacked 6/pages/group/GroupLogsPage.tsx",
    status: "implemented_in_worker_pending_pr",
    targetPath: "apps/admin/src/pages/group/GroupLogsPage.tsx",
    targetSpecId: "M7-UI-57-group-logs-page"
  },
  {
    evidenceStatus: "implementation_evidence_pending_pr_review",
    iaPage: "对话",
    id: "tenant.conversations",
    label: "对话",
    layer: "tenant",
    navId: "conversations",
    navSection: "tenant",
    order: 8,
    requiredStates: [
      ...stateMatrix,
      "mobile fallback",
      "SLA risk",
      "handoff/takeover",
      "AI suspended",
      "withdrawn/pending_cancel",
      "customer context unavailable"
    ],
    sourcePath:
      "/Users/atilla/源码/unpacked 6/pages/conversations/ConversationsPage.tsx",
    status: "implemented_in_worker_pending_pr",
    targetPath: "apps/admin/src/pages/conversations/ConversationsPage.tsx",
    targetSpecId: "M7-UI-20-conversation-workbench-page"
  },
  {
    evidenceStatus: "implementation_evidence_pending_pr_review",
    iaPage: "工单",
    id: "tenant.tickets",
    label: "工单",
    layer: "tenant",
    navId: "tickets",
    navSection: "tenant",
    order: 9,
    requiredStates: [...stateMatrix, "close-result-required"],
    sourcePath: "/Users/atilla/源码/unpacked 6/pages/tickets/TicketsPage.tsx",
    status: "implemented_in_worker_pending_pr",
    targetPath: "apps/admin/src/pages/tickets/TicketsPage.tsx",
    targetSpecId: "M7-UI-21-ticket-page"
  },
  {
    evidenceStatus: "implementation_evidence_pending_pr_review",
    iaPage: "客户资产",
    id: "tenant.customers",
    label: "客户资产",
    layer: "tenant",
    navId: "customers",
    navSection: "tenant",
    order: 11,
    requiredStates: [...stateMatrix, "privacy boundary"],
    sourcePath: "/Users/atilla/源码/unpacked 6/pages/customers/CustomersPage.tsx",
    status: "implemented_in_worker_pending_pr",
    targetPath: "apps/admin/src/pages/customers/CustomersPage.tsx",
    targetSpecId: "M7-UI-30-customer-assets-page"
  },
  {
    evidenceStatus: "implementation_evidence_pending_pr_review",
    iaPage: "订单",
    id: "tenant.orders",
    label: "订单",
    layer: "tenant",
    navId: "orders",
    navSection: "tenant",
    order: 12,
    requiredStates: [...stateMatrix, "stale snapshot"],
    sourcePath: "/Users/atilla/源码/unpacked 6/pages/orders/OrdersPage.tsx",
    status: "implemented_in_worker_pending_pr",
    targetPath: "apps/admin/src/pages/orders/OrdersPage.tsx",
    targetSpecId: "M7-UI-31-orders-page"
  },
  {
    evidenceStatus:
      "implementation_evidence_pending_pr_review_not_accepted_not_runtime_closed",
    iaPage: "知识与资源",
    id: "tenant.knowledge",
    label: "知识与资源",
    layer: "tenant",
    navId: "knowledge",
    navSection: "tenant",
    order: 13,
    requiredStates: [...stateMatrix, "eval-gated publish", "no formal knowledge write"],
    sourcePath: "/Users/atilla/源码/unpacked 6/pages/knowledge/KnowledgePage.tsx",
    status: "implemented_in_worker_pending_pr",
    targetPath: "apps/admin/src/pages/knowledge/KnowledgePage.tsx",
    targetSpecId: "M7-UI-32-knowledge-resources-page"
  },
  {
    evidenceStatus: "implementation_evidence_pending_pr_review",
    iaPage: "确认队列",
    id: "tenant.queue",
    label: "确认队列",
    layer: "tenant",
    navId: "queue",
    navSection: "tenant",
    order: 10,
    requiredStates: [...stateMatrix, "conflict diff"],
    sourcePath: "/Users/atilla/源码/unpacked 6/pages/queue/QueuePage.tsx",
    status: "implemented_in_worker_pending_pr",
    targetPath: "apps/admin/src/pages/queue/QueuePage.tsx",
    targetSpecId: "M7-UI-10-confirmation-queue-page"
  },
  {
    evidenceStatus:
      "implementation_evidence_pending_pr_review_not_accepted_not_runtime_closed",
    iaPage: "评测中心",
    id: "tenant.eval",
    label: "评测中心",
    layer: "tenant",
    navId: "eval",
    navSection: "tenant",
    order: 14,
    requiredStates: [
      ...stateMatrix,
      "gate blocked",
      "manual review",
      "publish disabled-enabled",
      "mobile fallback"
    ],
    sourcePath: "/Users/atilla/源码/unpacked 6/pages/evals/EvalPage.tsx",
    status: "implemented_in_worker_pending_pr",
    targetPath: "apps/admin/src/pages/evals/EvalPage.tsx",
    targetSpecId: "M7-UI-40-eval-center-page"
  },
  {
    evidenceStatus:
      "implementation_evidence_pending_pr_review_not_accepted_not_runtime_closed",
    iaPage: "AI 成员",
    id: "tenant.aiMembers",
    label: "AI 成员",
    layer: "tenant",
    navId: "ai-members",
    navSection: "tenant",
    order: 15,
    requiredStates: [
      ...stateMatrix,
      "emergency stop/recovery",
      "persona eval gate",
      "mobile fallback"
    ],
    sourcePath: "/Users/atilla/源码/unpacked 6/pages/agents/AgentsPage.tsx",
    status: "implemented_in_worker_pending_pr",
    targetPath: "apps/admin/src/pages/agents/AgentsPage.tsx",
    targetSpecId: "M7-UI-41-ai-members-page"
  },
  {
    evidenceStatus:
      "implementation_candidate_pending_pr_review_not_accepted_not_runtime_closed",
    iaPage: "团队",
    id: "tenant.team",
    label: "团队",
    layer: "tenant",
    navId: "team",
    navSection: "tenant",
    order: 16,
    requiredStates: [
      ...stateMatrix,
      "invite local-only",
      "disable/restore reason",
      "permission denied"
    ],
    sourcePath: "/Users/atilla/源码/unpacked 6/pages/team/TeamPage.tsx",
    status: "implemented_in_worker_pending_pr",
    targetPath: "apps/admin/src/pages/team/TeamPage.tsx",
    targetSpecId: "M7-UI-53-team-page"
  },
  {
    evidenceStatus:
      "implementation_candidate_pending_pr_review_not_accepted_not_runtime_closed",
    iaPage: "配置",
    id: "tenant.config",
    label: "配置",
    layer: "tenant",
    navId: "config",
    navSection: "tenant",
    order: 17,
    requiredStates: [...stateMatrix, "rollback confirmation"],
    sourcePath: "/Users/atilla/源码/unpacked 6/pages/config/ConfigPage.tsx",
    status: "implemented_in_worker_pending_pr",
    targetPath: "apps/admin/src/pages/config/ConfigPage.tsx",
    targetSpecId: "M7-UI-54-config-page"
  },
  {
    evidenceStatus:
      "implementation_candidate_pending_pr_review_not_accepted_not_runtime_closed",
    iaPage: "分析",
    id: "tenant.analytics",
    label: "分析",
    layer: "tenant",
    navId: "analytics",
    navSection: "tenant",
    order: 18,
    requiredStates: [
      ...stateMatrix,
      "delayed data",
      "time/channel/language filters",
      "mobile fallback"
    ],
    sourcePath: "/Users/atilla/源码/unpacked 6/pages/analytics/AnalyticsPage.tsx",
    status: "implemented_in_worker_pending_pr",
    targetPath: "apps/admin/src/pages/analytics/AnalyticsPage.tsx",
    targetSpecId: "M7-UI-55-analytics-page"
  },
  {
    evidenceStatus: "not_started",
    iaPage: "日志",
    id: "tenant.logs",
    label: "日志",
    layer: "tenant",
    navId: "logs",
    navSection: "tenant",
    order: 19,
    requiredStates: [...stateMatrix, "high-risk refs"],
    sourcePath: "/Users/atilla/源码/unpacked 6/pages/logs/LogsPage.tsx",
    status: "not_started",
    targetPath: "apps/admin/src/pages/logs/LogsPage.tsx",
    targetSpecId: "M7-UI-04S-tenant-logs"
  }
] as const satisfies readonly AdminPageRegistryEntry[];

export type AdminPageId = (typeof adminPageRegistry)[number]["id"];
type PlannedAdminPageId = Exclude<AdminPageId, "legacy.evidence">;

export const initialAdminPageId: AdminPageId = "group.overview";
export const legacyEvidencePageId: AdminPageId = "legacy.evidence";

type AdminPageNavigationEntry = AdminPageRegistryEntry & {
  readonly id: PlannedAdminPageId;
  readonly navId: string;
  readonly navSection: AdminPageNavSection;
};

function isNavigableAdminPage(
  page: AdminPageRegistryEntry
): page is AdminPageNavigationEntry {
  return (
    page.layer !== "legacy" &&
    typeof page.navId === "string" &&
    (page.navSection === "group" || page.navSection === "tenant")
  );
}

const navigableAdminPages = (adminPageRegistry as readonly AdminPageRegistryEntry[])
  .filter(isNavigableAdminPage)
  .sort((left, right) => left.order - right.order);

export const adminPageNavigation = {
  group: navigableAdminPages.filter((page) => page.navSection === "group"),
  tenant: navigableAdminPages.filter((page) => page.navSection === "tenant")
};

const legacyEvidencePage = adminPageRegistry[0] as AdminPageRegistryEntry;

export function getAdminPage(pageId: AdminPageId) {
  return adminPageRegistry.find((page) => page.id === pageId) ?? legacyEvidencePage;
}
