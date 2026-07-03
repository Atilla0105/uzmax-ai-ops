# M7-UI-05 Layered Navigation Shell Evidence

## Status

Implementation evidence for `M7-UI-05-layered-navigation-shell`.

This branch implements the frontend shell split between group and tenant navigation layers. It updates route state, AppShell layer rendering, registry defaults/order, focused Playwright coverage and M7 evidence/ledger records.

This is not M7 closeout, owner acceptance, GA-0 opening, production deployment, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release approval.

## Entry Evidence

| Fact | Evidence |
|---|---|
| worker path | `/Users/atilla/.codex/worktrees/m7-ui-05-layered-navigation-shell-impl` |
| worker branch | `codex/m7-ui-05-layered-navigation-shell-impl` |
| worker status before implementation resume | `## codex/m7-ui-05-layered-navigation-shell-impl`; source/test changes only in assigned worktree |
| worker base | `origin/main` at `9d1e015 Create M7 UI layered navigation shell spec` |
| root/main checkout | `/Users/atilla/Applications/UZMAX智能运营` |
| root/main status during implementation | `## main...origin/main` |
| root/main branch | `main` |
| PR #178 boundary | PR #178 worktree/branch is separate and was not edited by this worker. |

## Required Reads / Mapping

Required reads completed before and during implementation:

- `AGENTS.md`
- `UZMAX智能运营系统-PRD-v1.1.md`
- `UZMAX智能运营系统-技术架构-v1.1.md`
- `UZMAX智能运营系统-后台设计与前端架构-v1.1.md`
- `UZMAX智能运营系统-1.0验收矩阵-v1.1.md`
- `docs/admin-design-system.md`
- `docs/admin-ui-page-migration-ledger.md`
- `docs/evidence/M7/README.md`
- `docs/specs/M7-UI-05-layered-navigation-shell.md`
- this evidence file
- owner prototype shell sources under `/Users/atilla/源码/unpacked 6`
- owner HTML `/Users/atilla/Downloads/运营塔台1.0.html`
- current AppShell, CSS, registry, App, PageOutlet and focused admin tests under `apps/admin`
- Impeccable project context, product register and detector.

Owner-rule summary:

- Admin/home starts in group layer.
- Selecting a tenant enters tenant layer.
- Group sidebar contains only group pages.
- Tenant sidebar contains only tenant pages.
- Group release page is a group page and must not show tenant nav.
- Tenant pages such as confirmation queue must not show group nav as primary sidebar.

Source mapping:

| Source | Finding / implementation use |
|---|---|
| `/Users/atilla/源码/unpacked 6/shell/AppShell.tsx` | Uses route `level: "group" \| "tenant"` and chooses `GROUP_NAV` or `TENANT_NAV` based on that level. |
| `/Users/atilla/源码/unpacked 6/shell/navigation.ts` | Defines separate group and tenant nav arrays and the expected owner label order. |
| `/Users/atilla/源码/unpacked 6/shell/TopBar.tsx` | Topbar supports breadcrumb/back-to-group and tenant switcher as transition affordance. |
| `/Users/atilla/源码/unpacked 6/App.tsx` | Dispatches group pages only under group level and tenant pages only under tenant level. |
| `/Users/atilla/Downloads/运营塔台1.0.html` | Packaged owner HTML contains the same `level`, group/tenant nav, `g_release` and queue vocabulary. |
| `apps/admin/src/shell/AppShell.tsx` | Existing blocker rendered both `groupNav` and `tenantNav` in one sidebar; implementation now renders one active layer nav. |
| `apps/admin/src/pages/registry.ts` | Existing page `layer`/`navSection` metadata now drives navigation filtering; `initialAdminPageId` is `group.overview`. |
| `apps/admin/src/pages/PageOutlet.tsx` | Minimal legacy-route decoupling keeps `legacy.evidence` reachable as legacy-only after initial route changes. |
| focused Playwright tests | Rewritten to assert active-layer route state, accessible nav separation, tenant transition, collapse icon counts and 320px fallback. |

## Implementation Summary

| Path | Summary |
|---|---|
| `apps/admin/src/pages/registry.ts` | Keeps explicit page layer metadata, changes `initialAdminPageId` to `group.overview`, adds `legacyEvidencePageId`, excludes legacy pages from navigable pages by layer, sorts navigation by `order`, aligns tenant queue order and maps `group.release` to `M7-UI-11-release-acceptance-page`. |
| `apps/admin/src/pages/PageOutlet.tsx` | Uses `legacyEvidencePageId` instead of `initialAdminPageId` for the legacy evidence route so `/design` can open group overview. |
| `apps/admin/src/App.tsx` | Owns an explicit `AdminShellRoute { level, pageId, tenantId? }`, normalizes route transitions by registry layer, and passes route state into AppShell/PageOutlet. |
| `apps/admin/src/shell/AppShell.tsx` | Exports route types, derives active nav from `route.level`, renders exactly one `NavGroup`, implements tenant selection behavior, and adds breadcrumb/back-to-group plus active layer badge. |
| `apps/admin/src/shell/AppShellIcons.ts` | Provides shell-local tree-shakeable lucide icon mapping for all registry page ids without bloating `AppShell.tsx`. |
| `apps/admin/src/shell/AppShell.css` | Removes the existing `transition: width` layout animation so Impeccable no longer reports the prior `layout-transition` shell warning; existing 232px/68px dimensions remain. |
| `apps/admin/tests/m7-ui-page-router.spec.ts` | Covers `/design` initial group-only route, tenant transition, group release with group-only nav, tenant queue with tenant-only nav, and back-to-group. |
| `apps/admin/tests/m7-ui-foundation.spec.ts` | Covers shell anchors, collapse width 232 -> 68, active-layer icon counts 7/12, tenant default page and 320px no-overflow fallback. |
| `apps/admin/tests/helpers/openLegacyEvidence.ts` | Centralizes the explicit legacy evidence route helper used by older M2/M5/M6/M7 pattern specs, avoiding duplicated local Playwright setup blocks. |
| legacy evidence Playwright specs | Import the shared helper and explicitly click `Open legacy evidence route` after `/design` instead of assuming legacy panels are initial DOM. |
| `apps/admin/tests/m7-ui-confirmation-queue.spec.ts` | Updates `openQueue` to enter the tenant layer via the tenant switcher before clicking the tenant-only 确认队列 nav item. |
| `docs/specs/M7-UI-05-layered-navigation-shell.md` | Updates the previously docs-only contract to the actual focused implementation scope and validation contract. |
| `docs/evidence/M7/README.md` | Records UI-05 as implementation pending PR review. |
| `docs/admin-ui-page-migration-ledger.md` | Records the layered shell foundation as implemented in this branch and still pending merge/review. |

## Layer Behavior Evidence

| Requirement | Evidence |
|---|---|
| `/design` starts as group overview | Focused Playwright asserts `data-shell-level="group"`, `data-active-page-id="group.overview"`, and `page-outlet[data-page-id="group.overview"]`. |
| Group nav only | Focused Playwright asserts all seven group labels are visible in `app-shell-nav` and all tenant labels have count 0. |
| Tenant selection enters tenant layer | Focused Playwright selects `tenant-b` and asserts `data-shell-level="tenant"` plus `data-active-page-id="tenant.conversations"`. |
| Tenant nav only | Focused Playwright asserts all twelve tenant labels are visible and all group labels have count 0. |
| `group.release` stays group layer | Focused Playwright clicks 发布与验收 and asserts `data-page-id="group.release"` with group-only nav. |
| `tenant.queue` stays tenant layer | Focused Playwright selects a tenant, clicks 确认队列 and asserts `data-page-id="tenant.queue"` with tenant-only nav and queue page visible. |
| Back-to-group | Focused Playwright clicks `Back to group overview` and asserts group overview/group-only nav. |
| Collapse counts | Foundation Playwright asserts expanded/collapsed widths 232 -> 68 and active-layer icon counts 7 group / 12 tenant. |
| 320px fallback | Foundation Playwright asserts no horizontal overflow at 320px viewport. |
| Legacy evidence route | Full Playwright compatibility tests now open `/design`, click `Open legacy evidence route`, and keep their existing legacy content assertions on the explicit legacy route. |

## Screenshots

Screenshot artifacts are generated under `/tmp/uzmax-m7-ui-05-layered-navigation-shell/` and are not committed.

| Artifact | Path | Status |
|---|---|---|
| Group release desktop | `/tmp/uzmax-m7-ui-05-layered-navigation-shell/group-release-desktop.png` | captured, 1440x900 PNG |
| Tenant queue desktop | `/tmp/uzmax-m7-ui-05-layered-navigation-shell/tenant-queue-desktop.png` | captured, 1440x900 PNG |
| 320 mobile fallback | `/tmp/uzmax-m7-ui-05-layered-navigation-shell/mobile-320.png` | captured, 320px viewport, no horizontal overflow assertion passed |

## Impeccable / Design Audit

| Command | Result | Notes |
|---|---|---|
| `node .agents/skills/impeccable/scripts/context.mjs --target apps/admin/src/shell/AppShell.tsx` | pass | Project context and product register loaded. |
| `node .agents/skills/impeccable/scripts/detect.mjs --json apps/admin/src/shell/AppShell.tsx apps/admin/src/shell/AppShell.css` | pass | Final result `[]`; the previous `layout-transition` warning is fixed by removing `transition: width` from `AppShell.css`. |

## Validation

| Command | Result | Notes |
|---|---|---|
| `git diff --check` | pass | No whitespace errors. |
| `npm run guard:doc-triggers` | pass | `doc-trigger-paths: ok`. |
| `node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M7-UI-05-layered-navigation-shell.md --include-worktree` | pass | 23 changed files: source 6, test 13, docs 4; source net LOC 53; new source files 1. |
| `npm run knip` | pass | No findings. |
| `npm run jscpd` | pass | No duplicate blocks reported after shared legacy evidence helper extraction. |
| `npm run lint` | pass | AppShell line count/complexity blocker fixed. |
| `npm run typecheck -- --pretty false` | pass | TypeScript no emit check passed. |
| `npm run build:admin` | pass | Vite admin build succeeded; JS gzip about 99.44 kB after tree-shakeable shell icon helper extraction. |
| `npx playwright test apps/admin/tests/m7-ui-page-router.spec.ts apps/admin/tests/m7-ui-foundation.spec.ts` | pass | 5 focused tests passed. |
| `npx playwright test apps/admin/tests/m7-ui-confirmation-queue.spec.ts apps/admin/tests/m7-ui-patterns.spec.ts apps/admin/tests/design.spec.ts apps/admin/tests/m5-ai-member-console.spec.ts apps/admin/tests/m5-confirmation-queue.spec.ts apps/admin/tests/m5-integration-smoke-closeout.spec.ts apps/admin/tests/m5-logs-analytics.spec.ts apps/admin/tests/m5-template-center.spec.ts apps/admin/tests/m5r-admin-runtime-wiring.spec.ts apps/admin/tests/m6-release-gate-console.spec.ts` | pass | 34 focused legacy-entry and tenant-queue regression tests passed after migrating old `/design` assumptions. |
| `npm run playwright` | pass | Full admin Playwright suite passed after legacy route migration. |
| screenshot capture | pass | Three screenshots captured under `/tmp/uzmax-m7-ui-05-layered-navigation-shell/`; screenshots are not committed. |
| forbidden path check | pass | Changed files are limited to spec touch list; no backend/package/lock/CI/global config drift. |
| binary media check | pass | No committed PNG/JPG/GIF/WebP/video/PDF/ZIP artifacts. |
| root/main status clean | pass | `/Users/atilla/Applications/UZMAX智能运营` returned `## main...origin/main`. |

## Boundary

This evidence does not approve M7 closeout, owner acceptance, GA-0, production, real customer/order-data use, customer LLM, Telegram Business automatic reply, PR #178 merge, UI-11 full owner visual/IA parity or 1.0 release.
