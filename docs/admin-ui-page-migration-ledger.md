# UZMAX Admin UI Page Migration Ledger

> Status: M7-UI-03 router ledger.
> Scope: permanent page migration ledger and route registry contract.
> Non-scope: migrated page implementation, fixture copy, backend/API changes, release approval.

## Source Boundary

M7+ page migration uses `/Users/atilla/Downloads/运营塔台1.0.html` and `/Users/atilla/源码/unpacked 6` as visual/structure sources, normalized by `docs/admin-design-system.md`, `DESIGN.md`, `docs/admin-ui-prototype-migration-index.md`, `docs/admin-ui-fixture-sanitization-map.md` and `docs/admin-ui-token-foundation-contract.md`.

The current route registry is admin-internal. It is not a backend API, public DTO, permission contract or release gate.

## Group/Tenant Layer Separation Boundary

Owner rule: group-level pages and tenant-level pages must not share one combined
sidebar. Admin entry/home starts in the group layer; selecting a tenant
transitions into the tenant layer.

Group-level pages include group overview, model/cost/risk, templates,
connections, release/acceptance, tenant management and group logs. Tenant-level
pages include conversations, tickets, confirmation queue, customers, orders,
knowledge, evals, AI members, and tenant-scoped team/config/analytics/logs.

M7-UI-05 is merged to `main` via PR #180 / commit `8804414`: the active
AppShell renders either group navigation or tenant navigation, never a combined
group+tenant sidebar. Later page workers must preserve this layered route model
and must not reintroduce mixed accessible navigation while migrating page bodies.

## Router/Foundation State

| Order | Spec id | IA page | Prototype source path | Target route/page id | Target repo path | Current runtime/API/hook status | Required states | Evidence status |
|---:|---|---|---|---|---|---|---|---|
| 0 | M7-UI-03-page-migration-ledger-and-router | Foundation/router scaffold | `unpacked 6/App.tsx`, `shell/navigation.ts`, `shell/AppShell.tsx` | `legacy.evidence` plus all registry IDs | `apps/admin/src/pages/PageOutlet.tsx`, `apps/admin/src/pages/registry.ts`, `apps/admin/src/App.tsx`, `apps/admin/src/shell/AppShell.tsx` | App-owned route state and page outlet only; no migrated page runtime | Planned-page scaffold, legacy evidence route, shell anchors | `implemented_by_this_slice` |
| 0.5 | M7-UI-05-layered-navigation-shell | Layered AppShell/navigation foundation | `shell/AppShell.tsx`, `shell/navigation.ts`, `shell/NavSidebar.tsx`, `shell/TopBar.tsx`, owner HTML shell | `level: group \| tenant`; admin/home -> `group.overview`; tenant selection -> tenant route | `apps/admin/src/shell/AppShell.tsx`, `apps/admin/src/shell/AppShellIcons.ts`, `apps/admin/src/shell/AppShell.css`, `apps/admin/src/pages/registry.ts`, `apps/admin/src/pages/PageOutlet.tsx`, `apps/admin/src/App.tsx` | `merged_to_main`; AppShell renders only the active layer nav and legacy evidence tests explicitly open the legacy route; merged via PR #180 / commit `8804414` | group-only nav, tenant-only nav, tenant selection transition, back-to-group, explicit legacy evidence route, 320px fallback, no mixed accessible nav | `implementation_merged_to_main_pr_180` |

## Planned Page Ledger

Current ledger state: M7-UI-05 and M7-UI-10 are merged to `main`, M7-UI-11 is implementation-pending PR review on the layered AppShell, and the remaining planned pages are not implemented. Any later page worker must update this ledger or a page-specific evidence file before claiming implementation.

| Order | Spec id | IA page | Prototype source path | Target route/page id | Target repo path | Current runtime/API/hook status | Required states | Evidence status |
|---:|---|---|---|---|---|---|---|---|
| 1 | M7-UI-04A-group-overview | 集团总览 | `/Users/atilla/源码/unpacked 6/pages/group/GroupOverviewPage.tsx` | `group.overview` | `apps/admin/src/pages/group/GroupOverviewPage.tsx` | `not_started`; no group aggregate API/hook wired in M7 pages | loading, empty, error, permission, degraded | `not_started` |
| 2 | M7-UI-04B-group-model-risk | 模型/成本/风险 | `/Users/atilla/源码/unpacked 6/pages/group/GroupModelPage.tsx` | `group.modelRisk` | `apps/admin/src/pages/group/GroupModelRiskPage.tsx` | `not_started`; no model/cost/risk runtime wiring; no LLM cost judgment | loading, empty, error, permission, degraded | `not_started` |
| 3 | M7-UI-04C-group-template | 模板中心 | `/Users/atilla/源码/unpacked 6/pages/group/GroupTemplatePage.tsx` | `group.templates` | `apps/admin/src/pages/group/GroupTemplatePage.tsx` | `not_started`; existing M5 template evidence remains legacy-only | loading, empty, error, permission, degraded | `not_started` |
| 4 | M7-UI-04D-group-connection | 连接中心 | `/Users/atilla/源码/unpacked 6/pages/group/GroupConnectionPage.tsx` | `group.connections` | `apps/admin/src/pages/group/GroupConnectionPage.tsx` | `not_started`; connector feature flags/ADR-B states not wired | loading, empty, error, permission, degraded | `not_started` |
| 5 | M7-UI-11-release-acceptance-page | 发布与验收 | `/Users/atilla/源码/unpacked 6/pages/group/GroupReleasePage.tsx`; `/Users/atilla/源码/unpacked 6/fixtures/groupPlatform.ts`; owner HTML 发布与验收 region | `group.release` | `apps/admin/src/pages/group/GroupReleasePage.tsx` | `implementation_pending_pr_review`; group-layer page surface renders through `PageOutlet` on the merged UI-05 layered AppShell using existing `releaseGateContracts.ts` as legacy evidence input; no release/acceptance runtime API, owner signoff source, GA-0 checklist runtime truth or audit-write path is added; GA-0/1.0 actions remain disabled | loading, empty, error, permission, degraded, owner-decision-required, GA-0 locked, release blocked, mobile read-only fallback, owner HTML visual parity candidate, group-only nav under UI-05 shell | `implementation_evidence_pending_pr_review` |
| 6 | M7-UI-04F-group-tenant | 租户管理 | `/Users/atilla/源码/unpacked 6/pages/group/GroupTenantPage.tsx` | `group.tenants` | `apps/admin/src/pages/group/GroupTenantPage.tsx` | `not_started`; tenant create/disable audit path not wired | loading, empty, error, permission, degraded | `not_started` |
| 7 | M7-UI-04G-group-logs | 集团日志 | `/Users/atilla/源码/unpacked 6/pages/group/GroupLogsPage.tsx` | `group.logs` | `apps/admin/src/pages/group/GroupLogsPage.tsx` | `not_started`; group audit/export jobs not wired | loading, empty, error, permission, degraded | `not_started` |
| 8 | M7-UI-04H-tenant-conversations | 对话 | `/Users/atilla/源码/unpacked 6/pages/conversations/ConversationsPage.tsx` | `tenant.conversations` | `apps/admin/src/pages/conversations/ConversationsPage.tsx` | `not_started`; existing M2 conversation shell remains legacy evidence route | loading, empty, error, permission, degraded, SLA risk | `not_started` |
| 9 | M7-UI-04I-tenant-tickets | 工单 | `/Users/atilla/源码/unpacked 6/pages/tickets/TicketsPage.tsx` | `tenant.tickets` | `apps/admin/src/pages/tickets/TicketsPage.tsx` | `not_started`; existing M2 ticket shell remains legacy evidence route | loading, empty, error, permission, degraded, close-result-required | `not_started` |
| 10 | M7-UI-04J-tenant-customers | 客户资产 | `/Users/atilla/源码/unpacked 6/pages/customers/CustomersPage.tsx` and children | `tenant.customers` | `apps/admin/src/pages/customers/CustomersPage.tsx` | `not_started`; existing customer asset ApiClient/evidence remain legacy-only | loading, empty, error, permission, degraded, privacy boundary | `not_started` |
| 11 | M7-UI-04K-tenant-orders | 订单 | `/Users/atilla/源码/unpacked 6/pages/orders/OrdersPage.tsx` | `tenant.orders` | `apps/admin/src/pages/orders/OrdersPage.tsx` | `not_started`; existing order import/status evidence remains legacy-only | loading, empty, error, permission, degraded, stale snapshot | `not_started` |
| 12 | M7-UI-04L-tenant-knowledge | 知识与资源 | `/Users/atilla/源码/unpacked 6/pages/knowledge/KnowledgePage.tsx` | `tenant.knowledge` | `apps/admin/src/pages/knowledge/KnowledgePage.tsx` | `not_started`; KB capability APIs/eval gates not wired to M7 page | loading, empty, error, permission, degraded, eval-gated publish | `not_started` |
| 13 | M7-UI-10-confirmation-queue-page | 确认队列 | `/Users/atilla/源码/unpacked 6/pages/queue/QueuePage.tsx` | `tenant.queue` | `apps/admin/src/pages/queue/QueuePage.tsx` | `merged_to_main`; renders M7 page via existing `createConfirmationQueueApiClient`; merged via PR #175 / commit `c82fa4d`; distill health summary, daily cap, pass-rate, recovery and keep-current remain follow-up runtime/API contract blockers | loading, empty, error, permission, degraded, conflict diff | `implementation_merged_to_main_pr_175` |
| 14 | M7-UI-04N-tenant-eval | 评测中心 | `/Users/atilla/源码/unpacked 6/pages/evals/EvalPage.tsx` | `tenant.eval` | `apps/admin/src/pages/evals/EvalPage.tsx` | `not_started`; eval runner/gate evidence not wired to M7 page | loading, empty, error, permission, degraded, gate blocked | `not_started` |
| 15 | M7-UI-04O-tenant-ai-members | AI 成员 | `/Users/atilla/源码/unpacked 6/pages/agents/AgentsPage.tsx` | `tenant.aiMembers` | `apps/admin/src/pages/agents/AgentsPage.tsx` | `not_started`; existing AI member runtime evidence remains legacy-only | loading, empty, error, permission, degraded, emergency stop/recovery | `not_started` |
| 16 | M7-UI-04P-tenant-team | 团队 | `/Users/atilla/源码/unpacked 6/pages/team/TeamPage.tsx` | `tenant.team` | `apps/admin/src/pages/team/TeamPage.tsx` | `not_started`; authz/team role editor not wired | loading, empty, error, permission, degraded | `not_started` |
| 17 | M7-UI-04Q-tenant-config | 配置 | `/Users/atilla/源码/unpacked 6/pages/config/ConfigPage.tsx` | `tenant.config` | `apps/admin/src/pages/config/ConfigPage.tsx` | `not_started`; versioned save/rollback/eval-gated publishing not wired | loading, empty, error, permission, degraded, rollback confirmation | `not_started` |
| 18 | M7-UI-04R-tenant-analytics | 分析 | `/Users/atilla/源码/unpacked 6/pages/analytics/AnalyticsPage.tsx` | `tenant.analytics` | `apps/admin/src/pages/analytics/AnalyticsPage.tsx` | `not_started`; analytics board/export jobs not wired | loading, empty, error, permission, degraded | `not_started` |
| 19 | M7-UI-04S-tenant-logs | 日志 | `/Users/atilla/源码/unpacked 6/pages/logs/LogsPage.tsx` | `tenant.logs` | `apps/admin/src/pages/logs/LogsPage.tsx` | `not_started`; tenant operation/security logs not wired | loading, empty, error, permission, degraded, high-risk refs | `not_started` |

## Update Rule

Later page workers must update status only with matching spec/evidence. A planned page is not migrated until it has a page-specific spec, real ApiClient/hook or documented read-only runtime contract, full state matrix, synthetic tests, validation evidence and no copied raw prototype fixture values.
