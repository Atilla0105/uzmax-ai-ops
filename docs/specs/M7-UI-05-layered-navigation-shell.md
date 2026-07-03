# M7-UI-05 Layered Navigation Shell

## Goal

Define the foundation slice needed to split the admin AppShell and navigation into a true group layer and tenant layer, following the owner prototype and current owner rule:

- opening admin/home starts in the group layer;
- selecting a tenant enters the tenant layer;
- group and tenant pages must no longer share one mixed sidebar.

This PR is spec-only. It creates the future implementation contract and evidence stub, but does not implement React, route rendering, tests, CSS, backend/API/runtime changes, authz changes, package or lockfile changes, CI/global config changes, screenshots or fixture imports.

The future implementation must land before broad page migration can claim full owner HTML visual/information-architecture parity, and before `M7-UI-11` / PR #178 can pass full release page visual/IA parity. Until then, PR #178 can only be reviewed as a scoped release page-body candidate.

## Owner Confirmation Points And AI Agent Responsibilities

Owner/coordinator:

- Confirm this docs-only spec establishes the required shell foundation before broad page migration.
- Confirm the hard rule that group and tenant layers must not share one sidebar.
- Confirm admin/home default starts at group layer, not legacy evidence and not a tenant page.
- Confirm whether the future implementation should retire or preserve `legacy.evidence`; if preserved, it must be marked legacy-only and not used as parity evidence.
- Keep final scope, production/staging, real customer/order data, customer LLM, cost/compliance, GA-0, production and 1.0 release decisions as owner-only.

AI agent:

- Work only in `/Users/atilla/.codex/worktrees/m7-ui-05-layered-navigation-shell-spec` on branch `codex/m7-ui-05-layered-navigation-shell-spec`.
- Keep `/Users/atilla/Applications/UZMAX智能运营` root/main read-only.
- Read AGENTS, the four v1.1 source-of-truth docs, admin design system, M7 ledgers/evidence, M7-UI-03, M7-UI-11, current AppShell/router/tests and owner prototype sources before drafting.
- Record source mapping, current blocker state, entry evidence and validation honestly.
- Do not implement the future shell split in this spec-only PR.

## Timebox

0.25 workday for the spec-only PR. If drafting requires source implementation, backend/API/authz/DB changes, package/lock updates, raw fixture copying, CI/global config changes or release/production action, stop and report `BLOCKED`.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-UI-05-layered-navigation-shell.md`
  - `docs/evidence/M7/M7-UI-05-layered-navigation-shell.md`
  - `docs/evidence/M7/README.md`
  - `docs/admin-ui-page-migration-ledger.md`
  - `docs/incidents/INC-2026-07-03-m7-ui-05-root-patch-target.md`
- 未列出的模块默认不可改。

## 变更预算与路径分类

Spec-only PR budget:

- source changed files: 0
- source net LOC: 0
- new source files: 0
- test files changed: 0
- docs changed: <= 5
- package/lock/generated/config/backend/API/DB/worker/cron/CI/global config: 0
- binary screenshots/artifacts: 0

Future implementation budget after coordinator approval:

- source changed files: <= 4
- source net LOC: <= 600
- new source files: <= 2
- test files changed: <= 3 focused Playwright specs
- docs changed: <= 3 evidence/ledger updates
- package/lock/generated/config/backend/API/DB/worker/cron/CI/global config: 0
- external API/SDK/provider/connector/adapter basis: none; frontend route state only unless an existing approved API contract already provides tenant selection/permission state.
- exceptions: none expected. If runtime/authz/API expansion is needed, split to a separate approved spec.

## 文档触发检查

- 结果：`updated`。
- 判断依据：this PR creates a docs-only UI foundation spec/evidence and records a required incident for a write outside the assigned worktree.

## Required Reads / Source Mapping

Required reads completed before drafting:

- `AGENTS.md`
- `UZMAX智能运营系统-PRD-v1.1.md`
- `UZMAX智能运营系统-技术架构-v1.1.md`
- `UZMAX智能运营系统-后台设计与前端架构-v1.1.md`
- `UZMAX智能运营系统-1.0验收矩阵-v1.1.md`
- `docs/admin-design-system.md`
- `docs/admin-ui-page-migration-ledger.md`
- `docs/evidence/M7/README.md`
- `docs/specs/M7-UI-03-page-migration-ledger-and-router.md`
- `docs/specs/M7-UI-11-release-acceptance-page.md`
- `docs/evidence/M7/M7-UI-11-release-acceptance-page.md`
- `/Users/atilla/源码/unpacked 6/shell/AppShell.tsx`
- `/Users/atilla/源码/unpacked 6/shell/navigation.ts`
- `/Users/atilla/源码/unpacked 6/shell/TopBar.tsx`
- `/Users/atilla/源码/unpacked 6/shell/NavSidebar.tsx`
- `/Users/atilla/源码/unpacked 6/App.tsx`
- `/Users/atilla/源码/unpacked 6/pages/group/GroupReleasePage.tsx`
- `/Users/atilla/Downloads/运营塔台1.0.html`
- `apps/admin/src/shell/AppShell.tsx`
- `apps/admin/src/shell/AppShell.css`
- `apps/admin/src/pages/registry.ts`
- `apps/admin/src/App.tsx`
- `apps/admin/tests/m7-ui-page-router.spec.ts`
- `apps/admin/tests/m7-ui-foundation.spec.ts`
- `apps/admin/tests/design.spec.ts`

Source mapping:

| Source | Required use |
|---|---|
| AGENTS and v1.1 docs | Product scope, group/tenant IA, admin pure-frontend boundary, release/acceptance and owner-decision boundaries. |
| `docs/admin-design-system.md` | Prototype-derived shell dimensions, topbar/sidebar visual language, product register rules, mobile fallback and no-overclaim wording. |
| Owner prototype `shell/AppShell.tsx` | Defines `UzRoute { level: "group" \| "tenant"; page; tenantId }`; selects `GROUP_NAV` or `TENANT_NAV` based on `route.level`; tenant selection enters tenant layer. |
| Owner prototype `shell/navigation.ts` | Defines distinct `GROUP_NAV` and `TENANT_NAV` arrays; no mixed sidebar. |
| Owner prototype `shell/TopBar.tsx` | Defines group breadcrumb/back-to-group and tenant switcher affordance without making tenant pages group nav. |
| Owner prototype `shell/NavSidebar.tsx` | Renders only the `groups` passed by current layer. |
| Owner prototype `App.tsx` | Dispatches group pages only when `route.level === "group"` and tenant pages otherwise. |
| Owner HTML `/Users/atilla/Downloads/运营塔台1.0.html` | Visual baseline for the complete shell and release page region; packaged one-line HTML confirms the same route/nav vocabulary. |
| Current `apps/admin/src/shell/AppShell.tsx` | Current blocker: it builds `groupNav` and `tenantNav` separately but renders both nav groups in the same sidebar. |
| Current `apps/admin/src/pages/registry.ts` | Has page ids and `layer`/`navSection` metadata, but current shell does not use active layer to choose exactly one nav set. |
| Current tests | Current page-router/foundation tests still protect mixed legacy evidence or total mixed nav counts; future implementation must replace these with layer-specific assertions. |

## Current Blocker Summary

Current `origin/main` has a page registry with group and tenant page ids, but the shell still renders both `GROUP` and `TENANT` navigation sections together. This violates the owner rule and the prototype route model. It also makes full `M7-UI-11` release page visual/IA parity impossible because the owner release page is group-level and must show only group nav.

Open PR #178 (`codex/m7-ui-11-release-acceptance-page-impl`) is therefore not the correct place to solve the AppShell foundation. PR #178 may remain a scoped page-body candidate, but full UI-11 visual/IA parity must stay blocked until this layered navigation shell foundation is implemented and validated.

## Route Model Contract

Future implementation must introduce an admin shell route model equivalent to the owner prototype:

```ts
type AdminLayer = "group" | "tenant";

interface AdminShellRoute {
  level: AdminLayer;
  pageId: AdminPageId;
  tenantId?: string;
}
```

Rules:

- `level` is the primary routing discriminator for shell/nav behavior.
- Group layer routes may not require a selected tenant to render their primary nav.
- Tenant layer routes require an authorized `tenantId` before showing tenant-scoped pages.
- Admin entry/home defaults to `{ level: "group", pageId: "group.overview" }`.
- Selecting a tenant from group overview, tenant management, topbar tenant switcher or an equivalent transition affordance enters `{ level: "tenant", pageId: "tenant.conversations", tenantId }` unless the caller is an approved tenant deep-link.
- Switching tenant while already in tenant layer keeps `level: "tenant"` and should either preserve the current tenant page when safe or fall back to `tenant.conversations`.
- Back-to-group/breadcrumb action sets `{ level: "group", pageId: "group.overview" }` and clears tenant-scoped page rendering. It may retain the last tenant id as a switcher default, but not as active group nav.
- `legacy.evidence`, if retained, is a legacy-only route outside parity. It may not justify a mixed group+tenant production sidebar.

### Page Id Mapping

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

Group layer sidebar:

- 集团总览
- 模型/成本/风险
- 模板中心
- 连接中心
- 发布与验收
- 租户管理
- 集团日志

Tenant layer sidebar:

- 对话
- 工单
- 确认队列
- 客户资产
- 订单
- 知识与资源
- 评测中心
- AI 成员
- 团队
- 配置
- 分析
- 日志

Required behavior:

- Group layer may show a tenant switcher/selector, tenant health rows or "enter tenant" buttons as transition affordances.
- Tenant pages must not appear in the group sidebar.
- Tenant layer may show breadcrumb/back-to-group, current tenant identity and tenant switcher.
- Group pages must not appear as primary tenant nav.
- A page in `group.*` must render with group nav only.
- A page in `tenant.*` must render with tenant nav only.
- No runtime state may render both group and tenant nav groups simultaneously, except an explicitly labeled legacy route outside parity if the coordinator keeps it.
- Hiding tenant pages with CSS while leaving them in group nav is forbidden. The rendered navigation tree, accessible roles and route state must all reflect the active layer.

## Owner HTML Visual Parity Contract

Future implementation must match `/Users/atilla/Downloads/运营塔台1.0.html` and `/Users/atilla/源码/unpacked 6` for shell behavior and visual structure:

- sidebar width: 232px expanded, 68px collapsed;
- topbar height, staging strip, breadcrumb/layer label, tenant switcher, environment marker, heartbeat, search, notification and user affordances follow the owner prototype/design-system contract;
- `group.release` displays the release page inside group shell with group-only nav;
- `tenant.queue` and other tenant pages display inside tenant shell with tenant-only nav;
- mobile fallback at 320px must not overflow and must not expose mixed nav.

Adopted Impeccable/product-register guidance:

- Dense operational control-room UI, not marketing layout.
- Status and current layer recognition first.
- Navigation is a standard product affordance; consistency and trust beat novelty.
- Existing detector baseline found a current `layout-transition` warning in `AppShell.css` line 20 (`transition: width`). The future implementation should avoid adding motion debt and should record whether this baseline is fixed or explicitly left unchanged.

Rejected behaviors:

- mixed group+tenant sidebar;
- old `--uzmax-*` visual target as the design source;
- decorative motion/gradients/glass/colored shadows;
- red/human state as decoration;
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

Future implementation should use frontend route state and existing registry metadata. If existing APIs already provide authorized tenants, tenant health or permission state, they may be read through existing approved clients. If the split requires new backend/authz/API contracts, stop and create a separate spec.

## Expected Future Implementation Touch List

The later implementation PR is expected to touch only a focused frontend/docs/test set such as:

- `apps/admin/src/shell/AppShell.tsx`
- `apps/admin/src/shell/AppShell.css`
- `apps/admin/src/pages/registry.ts`
- `apps/admin/src/App.tsx`
- `apps/admin/tests/m7-ui-page-router.spec.ts`
- `apps/admin/tests/m7-ui-foundation.spec.ts`
- optional focused new shell/layer test if the coordinator approves it
- `docs/evidence/M7/M7-UI-05-layered-navigation-shell.md`
- `docs/admin-ui-page-migration-ledger.md`

If implementation needs shared primitives/patterns, package/lock, backend/API/authz/DB, global CSS outside shell, CI/guard scripts, release contracts or raw prototype fixture imports, stop and split the work.

## Future Tests / Evidence Requirements

Future implementation evidence must include:

- spec compliance review against this file;
- code quality review after implementation;
- desktop screenshot of owner release page route with group-only nav;
- desktop screenshot of tenant confirmation queue route with tenant-only nav;
- 320px mobile fallback screenshot/no-overflow evidence;
- route assertions that group nav and tenant nav are not simultaneous;
- assertion that admin entry/home starts at `group.overview`;
- tenant selection transition assertion from group layer into tenant layer;
- breadcrumb/back-to-group assertion from tenant layer into group layer;
- accessibility/role assertion that hidden CSS does not leave tenant pages reachable as group nav;
- removal or rewrite of legacy mixed assertions from current tests;
- no source/test/config/binary changes outside the approved implementation touch list;
- no claim of UI-11 full visual/IA parity until screenshots prove owner-shell parity.

Suggested focused validation for implementation:

- `npx playwright test apps/admin/tests/m7-ui-page-router.spec.ts apps/admin/tests/m7-ui-foundation.spec.ts`
- screenshot capture for group release, tenant queue and 320px fallback;
- no source/test forbidden-path drift beyond the approved touch list;
- detector/visual debt check for changed shell files.

## Relationship To PR #178 / M7-UI-11

PR #178 implements or proposes a release acceptance page body on branch `codex/m7-ui-11-release-acceptance-page-impl`, but current `origin/main` still has a mixed AppShell/sidebar. Because the owner prototype shows `group.release` in group layer only, PR #178 cannot pass full visual/IA parity while the shared shell renders group and tenant nav together.

This spec therefore defines the prerequisite foundation:

- UI-11 can remain a scoped page-body candidate.
- UI-11 full visual/IA parity, broad page migration, and owner HTML parity claims remain blocked until M7-UI-05 implementation lands.
- If PR #178 merges before UI-05 implementation, its evidence/ledger must continue to mark the shell/layer blocker clearly.

## Incident Record

During this docs-only spec worker, one `apply_patch` invocation initially targeted root/main `/Users/atilla/Applications/UZMAX智能运营` instead of the assigned worktree. The accidental root edits were limited to the same intended docs paths, were detected before validation/commit, and were cleaned from root/main after recreating the work in the assigned worktree. Because `docs/incidents/README.md` requires recording writes outside the assigned worktree, this PR also includes `docs/incidents/INC-2026-07-03-m7-ui-05-root-patch-target.md`.

## Pass Conditions

- `docs/specs/M7-UI-05-layered-navigation-shell.md` exists and defines route model, page mapping, nav rules, visual parity, runtime boundaries, future touch list, tests/evidence and PR #178 relationship.
- `docs/evidence/M7/M7-UI-05-layered-navigation-shell.md` exists as a spec-only evidence stub and does not claim implementation.
- `docs/evidence/M7/README.md` records UI-05 as spec-ready/pending PR review and notes the queue boundary.
- `docs/admin-ui-page-migration-ledger.md` records layered navigation shell as a foundation blocker before broad page migration.
- `docs/incidents/INC-2026-07-03-m7-ui-05-root-patch-target.md` records the root patch-target incident and cleanup.
- No `apps/admin/**`, `packages/**`, package/lock, `.github`, `scripts`, backend/API/DB/worker/cron/CI/global config, tests or binary media paths are changed.
- Validation commands are run and recorded honestly.

## Failure Branch

- If the assigned worktree/branch has unexpected state, stop and report `BLOCKED`.
- If docs-only edits require changing source/test/runtime paths, stop and ask coordinator to split or expand the spec.
- If PR #178 or another branch changes the same M7 README/ledger lines first, rebase or record the exact conflict; do not silently overwrite newer evidence.
- If `guard:doc-triggers` or `guard:pr-shape` fails, fix docs within this touch list or report the exact blocker.
- If push/PR creation is unavailable, leave the branch committed locally, report the head SHA and exact blocker.

## Out Of Scope

- No React source implementation.
- No route rendering change.
- No API hook/client implementation.
- No tests.
- No CSS/token/shared-pattern changes.
- No backend/API/authz/DB/worker/cron/package/lock/CI/global config changes.
- No raw prototype fixture import or copied customer/order/contact samples.
- No binary screenshots.
- No GA-0 opening, production/staging action, real customer/order-data use, customer LLM, Telegram Business automatic reply, owner signoff fabrication or 1.0 release approval.

## Validation List

- `git diff --check`
- `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH npm run guard:doc-triggers`
- `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M7-UI-05-layered-navigation-shell.md --include-worktree`
- `git diff --name-only origin/main...HEAD`
- `git diff --name-only origin/main...HEAD -- apps/admin packages package.json package-lock.json pnpm-lock.yaml yarn.lock .github scripts`
- `git diff --name-only origin/main...HEAD -- '*.png' '*.jpg' '*.jpeg' '*.webp' '*.gif' '*.mp4' '*.mov'`
- root/main status clean check from `/Users/atilla/Applications/UZMAX智能运营`
