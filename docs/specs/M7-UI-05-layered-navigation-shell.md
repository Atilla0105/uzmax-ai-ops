# M7-UI-05 Layered Navigation Shell

## Goal

Implement the admin AppShell foundation that separates group navigation from tenant navigation, following the owner prototype and current owner hard rule:

- `/design` and admin/home start in the group layer as `{ level: "group", pageId: "group.overview" }`.
- Group pages render only the group sidebar: 集团总览、模型/成本/风险、模板中心、连接中心、发布与验收、租户管理、集团日志.
- Selecting a tenant enters the tenant layer and defaults to `tenant.conversations`.
- Tenant pages render only the tenant sidebar: 对话、工单、确认队列、客户资产、订单、知识与资源、评测中心、AI 成员、团队、配置、分析、日志.
- The rendered and accessible navigation tree must contain only the active layer. This may not be faked with CSS hiding.

This implementation is the foundation blocker for later broad page migration and for full `M7-UI-11` / PR #178 owner-shell visual/IA parity. PR #178 remains a separate page-body candidate and is not changed by this spec.

## Owner Confirmation Points And AI Agent Responsibilities

Owner/coordinator:

- Confirm this implementation satisfies the hard split between group and tenant navigation layers.
- Confirm admin/home defaults to group overview rather than `legacy.evidence` or a tenant page.
- Confirm `legacy.evidence`, if preserved, remains legacy-only and not parity evidence.
- Keep final scope, production/staging, real customer/order data, customer LLM, cost/compliance, GA-0, production and 1.0 release decisions as owner-only.

AI agent:

- Work only in `/Users/atilla/.codex/worktrees/m7-ui-05-layered-navigation-shell-impl` on branch `codex/m7-ui-05-layered-navigation-shell-impl`.
- Keep `/Users/atilla/Applications/UZMAX智能运营` root/main read-only and clean.
- Do not touch the PR #178 worktree/branch.
- Read AGENTS, the four v1.1 source-of-truth docs, admin design system, M7 ledgers/evidence, current AppShell/router/tests and owner prototype sources before implementation.
- Record source mapping, current blocker state, screenshots, detector/audit result and validation honestly.

## Timebox

0.5 workday for focused frontend shell implementation, tests, evidence and PR. If implementation requires backend/API/authz/DB changes, package/lock updates, raw fixture copying, CI/global config changes, release/production action or PR #178 edits, stop and report `BLOCKED`.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-UI-05-layered-navigation-shell.md`
  - `apps/admin/src/shell/AppShell.tsx`
  - `apps/admin/src/shell/AppShellIcons.ts`
  - `apps/admin/src/shell/AppShell.css`
  - `apps/admin/src/pages/registry.ts`
  - `apps/admin/src/pages/PageOutlet.tsx`
  - `apps/admin/src/App.tsx`
  - `apps/admin/tests/design.spec.ts`
  - `apps/admin/tests/m5-ai-member-console.spec.ts`
  - `apps/admin/tests/m5-confirmation-queue.spec.ts`
  - `apps/admin/tests/m5-integration-smoke-closeout.spec.ts`
  - `apps/admin/tests/m5-logs-analytics.spec.ts`
  - `apps/admin/tests/m5-template-center.spec.ts`
  - `apps/admin/tests/m5r-admin-runtime-wiring.spec.ts`
  - `apps/admin/tests/m6-release-gate-console.spec.ts`
  - `apps/admin/tests/m7-ui-confirmation-queue.spec.ts`
  - `apps/admin/tests/m7-ui-patterns.spec.ts`
  - `apps/admin/tests/m7-ui-page-router.spec.ts`
  - `apps/admin/tests/m7-ui-foundation.spec.ts`
  - `docs/evidence/M7/M7-UI-05-layered-navigation-shell.md`
  - `docs/evidence/M7/README.md`
  - `docs/admin-ui-page-migration-ledger.md`
- 未列出的模块默认不可改。

## 变更预算与路径分类

Implementation PR budget:

- source changed files: <= 6
- source net LOC: <= 600
- new source files: <= 1
- test files changed: <= 12 Playwright specs
- docs changed: <= 4
- package/lock/generated/config/backend/API/DB/worker/cron/CI/global config: 0
- binary screenshots/artifacts committed: 0
- external API/SDK/provider/connector/adapter basis: none; frontend route state only.
- new source file ownership: `apps/admin/src/shell/AppShellIcons.ts` is a shell-local helper for tree-shakeable lucide icon mapping; it avoids bloating `AppShell.tsx` past the React file-length lint limit and avoids namespace-import bundle growth.
- exceptions: `apps/admin/src/pages/PageOutlet.tsx` is included only to decouple the legacy evidence route from `initialAdminPageId` after admin/home changes to `group.overview`.

## 文档触发检查

- 结果：`updated`。
- 判断依据：this PR changes frontend shell behavior, focused Playwright tests, legacy `/design` Playwright entry routing and M7 evidence/ledger for the layered navigation foundation.

## Required Reads / Source Mapping

Required reads before implementation:

- `AGENTS.md`
- `UZMAX智能运营系统-PRD-v1.1.md`
- `UZMAX智能运营系统-技术架构-v1.1.md`
- `UZMAX智能运营系统-后台设计与前端架构-v1.1.md`
- `UZMAX智能运营系统-1.0验收矩阵-v1.1.md`
- `docs/admin-design-system.md`
- `docs/admin-ui-page-migration-ledger.md`
- `docs/evidence/M7/README.md`
- `docs/evidence/M7/M7-UI-05-layered-navigation-shell.md`
- `/Users/atilla/Downloads/运营塔台1.0.html`
- `/Users/atilla/源码/unpacked 6/shell/AppShell.tsx`
- `/Users/atilla/源码/unpacked 6/shell/navigation.ts`
- `/Users/atilla/源码/unpacked 6/shell/NavSidebar.tsx`
- `/Users/atilla/源码/unpacked 6/shell/TopBar.tsx`
- `/Users/atilla/源码/unpacked 6/App.tsx`
- current `apps/admin/src/shell/AppShell.tsx`
- current `apps/admin/src/shell/AppShell.css`
- current `apps/admin/src/pages/registry.ts`
- current `apps/admin/src/App.tsx`
- focused admin Playwright tests.

Source mapping:

| Source | Required use |
|---|---|
| AGENTS and v1.1 docs | Product scope, group/tenant IA, admin pure-frontend boundary, release/acceptance and owner-decision boundaries. |
| `docs/admin-design-system.md` | Prototype-derived shell dimensions, topbar/sidebar visual language, product register rules, mobile fallback and no-overclaim wording. |
| Owner prototype `shell/AppShell.tsx` | Defines `UzRoute { level: "group" \| "tenant"; page; tenantId }` and chooses the current nav set based on `route.level`. |
| Owner prototype `shell/navigation.ts` | Defines distinct `GROUP_NAV` and `TENANT_NAV` arrays. |
| Owner prototype `shell/NavSidebar.tsx` | Renders only the groups passed by the current layer. |
| Owner prototype `shell/TopBar.tsx` | Defines breadcrumb/back-to-group and tenant switcher affordances. |
| Owner prototype `App.tsx` | Dispatches group pages only under group level and tenant pages only under tenant level. |
| Owner HTML `/Users/atilla/Downloads/运营塔台1.0.html` | Visual baseline for shell density, route/nav vocabulary and release/queue layer behavior. |
| Current `apps/admin/src/shell/AppShell.tsx` | Current blocker: group and tenant nav arrays exist but both are rendered in one sidebar. |
| Current `apps/admin/src/pages/registry.ts` | Existing layer/nav metadata is used to validate and derive layer behavior. |
| Current focused tests | Must move from legacy mixed-nav expectations to layer-specific assertions. |

## Route Model Contract

Implementation must introduce an explicit shell route model equivalent to:

```ts
type AdminShellLevel = "group" | "tenant";

interface AdminShellRoute {
  level: AdminShellLevel;
  pageId: AdminPageId;
  tenantId?: string;
}
```

Rules:

- `level` is the shell discriminator for nav/sidebar behavior.
- Admin entry/home defaults to `{ level: "group", pageId: "group.overview" }`.
- Group routes may retain the last selected tenant id only as switcher state, not as tenant nav activation.
- Selecting a tenant from group layer enters `{ level: "tenant", pageId: "tenant.conversations", tenantId }`.
- Switching tenant while already in tenant layer keeps `level: "tenant"` and preserves the current tenant page when safe.
- Back-to-group/breadcrumb action sets `{ level: "group", pageId: "group.overview" }`.
- `legacy.evidence`, if retained, is legacy-only and not a reason to render a mixed production sidebar.

## Page Id Mapping

| Layer | Registry page id | Prototype page id | Label |
|---|---|---|---|
| group | `group.overview` | `overview` | 集团总览 |
| group | `group.modelRisk` | `g_model` | 模型/成本/风险 |
| group | `group.templates` | `g_tmpl` | 模板中心 |
| group | `group.connections` | `g_conn` | 连接中心 |
| group | `group.release` | `g_release` | 发布与验收 |
| group | `group.tenants` | `g_tenant` | 租户管理 |
| group | `group.logs` | `g_logs` | 集团日志 |
| tenant | `tenant.conversations` | `conversations` | 对话 |
| tenant | `tenant.tickets` | `tickets` | 工单 |
| tenant | `tenant.queue` | `queue` | 确认队列 |
| tenant | `tenant.customers` | `customers` | 客户资产 |
| tenant | `tenant.orders` | `orders` | 订单 |
| tenant | `tenant.knowledge` | `knowledge` | 知识与资源 |
| tenant | `tenant.eval` | `eval` | 评测中心 |
| tenant | `tenant.aiMembers` | `agents` | AI 成员 |
| tenant | `tenant.team` | `team` | 团队 |
| tenant | `tenant.config` | `config` | 配置 |
| tenant | `tenant.analytics` | `analytics` | 分析 |
| tenant | `tenant.logs` | `logs` | 日志 |

## Navigation Rules

Required behavior:

- Group layer sidebar contains only the seven group pages listed above.
- Tenant layer sidebar contains only the twelve tenant pages listed above.
- AppShell renders exactly one nav group for the active layer.
- `group.*` pages must not show tenant nav labels in the rendered or accessible navigation tree.
- `tenant.*` pages must not show group nav labels in the rendered or accessible navigation tree.
- Tenant switcher may appear in group layer as a transition affordance.
- Tenant layer must include a clear breadcrumb/back-to-group affordance.
- No runtime state may render both group and tenant nav groups at the same time.
- CSS hiding is insufficient; tests must query roles/accessible nav content.

## Owner HTML Visual Parity Contract

Implementation must stay close to `/Users/atilla/Downloads/运营塔台1.0.html` and `/Users/atilla/源码/unpacked 6` for shell behavior and visual structure:

- sidebar width remains 232px expanded and 68px collapsed;
- dense sidebar/topbar, staging strip, breadcrumb/layer label, tenant switcher, environment marker, heartbeat, search, notification and user affordances remain shell anchors;
- `group.release` displays inside the group shell with group-only nav;
- `tenant.queue` displays inside the tenant shell with tenant-only nav;
- 320px mobile fallback must not overflow and must not expose mixed nav.

Adopted Impeccable/product-register guidance:

- Dense operational control-room UI, not marketing layout.
- Status and current layer recognition first.
- Navigation is a standard product affordance; consistency and trust beat novelty.
- Detector warnings for changed shell files must be recorded honestly.

Rejected behaviors:

- mixed group+tenant sidebar;
- old `--uzmax-*` visual target as the design source;
- decorative motion/gradients/glass/colored shadows;
- any copy claiming owner acceptance, GA-0, production or 1.0 release from shell visual parity.

## Runtime / API / Authz Boundaries

This is a frontend foundation slice:

- no backend/API implementation;
- no DB/schema/RLS/authz changes;
- no package/lock/dependency changes;
- no CI/global guard changes;
- no production/staging actions;
- no GA-0 or 1.0 release action;
- no real customer/order data;
- no customer LLM or Telegram Business automatic reply behavior.

Implementation must use frontend route state and existing registry metadata. If the split requires new backend/authz/API contracts, stop and create a separate spec.

## Tests / Evidence Requirements

Implementation evidence must include:

- `/design` initial route is group layer/group overview and nav contains group labels only.
- Selecting a tenant transitions into tenant layer/default `tenant.conversations`, tenant nav only.
- `group.release` route shows group-only nav.
- `tenant.queue` route shows tenant-only nav.
- No accessible nav tree contains both group and tenant labels at the same time.
- Collapse width remains 232 -> 68 and icon count matches active layer: 7 group, 12 tenant.
- 320px mobile fallback has no horizontal overflow.
- Existing legacy evidence Playwright tests explicitly open `legacy.evidence` after `/design` instead of assuming legacy panels are present in the initial group overview DOM.
- Screenshot artifacts generated under `/tmp/uzmax-m7-ui-05-layered-navigation-shell/`: group release desktop, tenant queue desktop, 320 mobile.
- Impeccable detector or equivalent design audit result for changed shell files.
- No source/test/config/binary changes outside the approved touch list.

Focused validation:

- `npx playwright test apps/admin/tests/m7-ui-page-router.spec.ts apps/admin/tests/m7-ui-foundation.spec.ts`
- `npx playwright test apps/admin/tests/m7-ui-confirmation-queue.spec.ts apps/admin/tests/m7-ui-patterns.spec.ts apps/admin/tests/design.spec.ts apps/admin/tests/m5-ai-member-console.spec.ts apps/admin/tests/m5-confirmation-queue.spec.ts apps/admin/tests/m5-integration-smoke-closeout.spec.ts apps/admin/tests/m5-logs-analytics.spec.ts apps/admin/tests/m5-template-center.spec.ts apps/admin/tests/m5r-admin-runtime-wiring.spec.ts apps/admin/tests/m6-release-gate-console.spec.ts`

Full validation before PR:

- `git diff --check`
- `npm run guard:doc-triggers`
- `node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M7-UI-05-layered-navigation-shell.md --include-worktree`
- `npm run knip`
- `npm run lint`
- `npm run typecheck -- --pretty false`
- `npm run build:admin`
- focused Playwright tests
- `npm run playwright`
- forbidden path and binary-media checks
- root/main clean check

## Relationship To PR #178 / M7-UI-11

PR #178 implements or proposes the `group.release` page body on branch `codex/m7-ui-11-release-acceptance-page-impl`. This implementation must not edit that worktree/branch.

M7-UI-05 is the shared shell prerequisite:

- UI-11 full visual/IA parity stays blocked until this layered shell foundation lands on `main`.
- PR #178 can remain a scoped page-body candidate.
- This PR may update `group.release` registry metadata to point at `M7-UI-11-release-acceptance-page`, but does not migrate the release page body.

## Pass Conditions

- `initialAdminPageId` no longer opens `legacy.evidence`; admin/home opens `group.overview`.
- App state uses an explicit `{ level, pageId, tenantId? }` shell route.
- AppShell renders exactly one nav tree based on `route.level`.
- Tenant switcher enters tenant layer and defaults to `tenant.conversations`; tenant-to-tenant switching preserves the current tenant page when safe.
- Tenant layer exposes back-to-group and returns to group overview/group-only nav.
- Legacy evidence remains legacy-only and not parity evidence.
- Focused Playwright tests cover initial group nav, tenant transition, group release, tenant queue, accessible nav separation, collapse icon counts and 320px no overflow.
- Evidence/ledger are updated with validation, detector result and screenshot paths.
- Branch is committed, pushed and opened as a non-draft PR against `main` without merging.

## Failure Branch

- If the assigned worktree/branch has unexpected state, stop and report `BLOCKED`.
- If root/main or PR #178 worktree is modified, stop and report the impact; record an incident if the repo policy threshold is met.
- If implementation requires backend/API/authz/DB/package/lock/CI/global config changes, stop and split a separate spec.
- If `guard:doc-triggers`, `guard:pr-shape`, focused Playwright, lint, typecheck or build fails, fix within this scope or report the exact blocker.
- If push/PR creation is unavailable, leave the branch committed locally, report the head SHA and exact blocker.

## Out Of Scope

- No backend/API/authz/DB/worker/cron/package/lock/CI/global config changes.
- No shared primitives/patterns migration.
- No group overview or release page-body migration.
- No PR #178 worktree/branch edits.
- No raw prototype fixture import or copied customer/order/contact samples.
- No committed binary screenshots.
- No GA-0 opening, production/staging action, real customer/order-data use, customer LLM, Telegram Business automatic reply, owner signoff fabrication or 1.0 release approval.
