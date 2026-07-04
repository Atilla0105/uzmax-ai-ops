# M7-UI-08 Shared Sidebar Calibration Evidence

## Status

Implementation evidence for `M7-UI-08-shared-sidebar-calibration`.

This branch calibrates only the shared `AppShell` sidebar grouping and collapse affordance to the owner prototype and `/Users/atilla/源码/unpacked 6` shell sources. It does not change page-local conversation files, PR #182, backend/API/DB/authz behavior, package/lock files, CI/global config, owner HTML, unpacked source, production state, GA-0, owner acceptance or 1.0 release approval.

## Entry Evidence

| Fact | Evidence |
|---|---|
| worker path | `/Users/atilla/.codex/worktrees/m7-ui-08-shared-sidebar-calibration` |
| worker branch | `codex/m7-ui-08-shared-sidebar-calibration` |
| worker pre-edit `pwd` | `/Users/atilla/.codex/worktrees/m7-ui-08-shared-sidebar-calibration` |
| worker pre-edit status | `## codex/m7-ui-08-shared-sidebar-calibration...origin/main` |
| worker pre-edit branch | `codex/m7-ui-08-shared-sidebar-calibration` |
| `git branch --no-merged main` | `codex/m7-ui-11-release-acceptance-page-impl`; `codex/m7-ui-20-conversation-workbench-page-impl`; `codex/req-g01a-code-01-db-api-foundation-impl` |
| open PR check | `gh` unavailable in shell; command returned `gh unavailable`. |
| root/main boundary | `/Users/atilla/Applications/UZMAX智能运营` remained read-only for this worker. |

## Required Reads / Source Mapping

Required reads completed before implementation edits:

- `AGENTS.md`
- `PRODUCT.md`
- `DESIGN.md`
- `UZMAX智能运营系统-PRD-v1.1.md`
- `UZMAX智能运营系统-技术架构-v1.1.md`
- `UZMAX智能运营系统-后台设计与前端架构-v1.1.md`
- `UZMAX智能运营系统-1.0验收矩阵-v1.1.md`
- `docs/admin-design-system.md`
- `docs/admin-ui-page-migration-ledger.md`
- `docs/admin-ui-prototype-migration-index.md`
- `docs/evidence/M7/README.md`
- `docs/specs/M7-UI-05-layered-navigation-shell.md`
- `docs/specs/M7-UI-06-shared-shell-topbar-calibration.md`
- `docs/evidence/M7/M7-UI-05-layered-navigation-shell.md`
- `docs/evidence/M7/M7-UI-06-shared-shell-topbar-calibration.md`
- `/Users/atilla/源码/unpacked 6/shell/navigation.ts`
- `/Users/atilla/源码/unpacked 6/shell/NavSidebar.tsx`
- `/Users/atilla/源码/unpacked 6/patterns/NavItem.tsx`
- `/Users/atilla/源码/unpacked 6/primitives/Icon.tsx`
- `apps/admin/src/shell/AppShell.tsx`
- `apps/admin/src/shell/AppShell.css`
- `apps/admin/src/shell/AppShellIcons.ts`
- `apps/admin/src/pages/registry.ts`
- `apps/admin/tests/m7-ui-foundation.spec.ts`
- `apps/admin/tests/m7-ui-page-router.spec.ts`
- Impeccable context for `apps/admin/src/shell/AppShell.tsx` and `.agents/skills/impeccable/reference/product.md`.

Source mapping:

| Source | Finding / implementation use |
|---|---|
| `unpacked 6/shell/navigation.ts` | Adopted exact sidebar group labels and membership: group `总览/平台/治理`; tenant `运营/数据/智能/管理/洞察`. |
| `unpacked 6/shell/NavSidebar.tsx` | Preserved 232px expanded rail, 68px collapsed rail, 52px brand header, scrollable grouped nav body and 40px bottom collapse control. |
| `unpacked 6/patterns/NavItem.tsx` | Preserved 36px nav item height, collapsed label hiding and active/hover muted background behavior through existing `NavItem`. |
| `unpacked 6/primitives/Icon.tsx` | Preserved Lucide-only icon path; no custom SVG or new icon source added. |
| Current `AppShell.tsx` | Preserved M7-UI-05 route model and M7-UI-06 topbar; changed only active-layer sidebar grouping hookup and collapsed visible text. |
| New `AppShellNavigation.tsx` | Owns owner-style sidebar group metadata and group rendering only; introduced to keep `AppShell.tsx` under the React 250-line lint limit without using `AppShellIcons.ts` as a dumping ground. |
| Current `AppShell.css` | Preserved tokenized dimensions; tuned group heading letter spacing/overflow and bottom control stability. |

## Implementation Summary

| Path | Summary |
|---|---|
| `docs/specs/M7-UI-08-shared-sidebar-calibration.md` | Adds the narrow shared sidebar calibration spec, touch list, budgets, source mapping and validation contract. |
| `apps/admin/src/shell/AppShell.tsx` | Uses active-layer owner-style sidebar groups while preserving the existing route model and topbar. |
| `apps/admin/src/shell/AppShellNavigation.tsx` | Adds the shell-local owner sidebar group metadata and focused sidebar group renderer. |
| `apps/admin/src/shell/AppShell.css` | Tunes grouped sidebar spacing/labels and bottom collapse button dimensions using existing tokens. |
| `apps/admin/tests/m7-ui-foundation.spec.ts` | Adds assertions for owner sidebar group labels, no generic `GROUP`/`TENANT` labels, expanded collapse text and collapsed label hiding. |
| `apps/admin/tests/m7-ui-page-router.spec.ts` | Adds active-layer group heading assertions and hidden opposite-layer heading assertions. |
| `docs/evidence/M7/README.md` | Records UI-08 as shared sidebar calibration evidence. |
| `docs/admin-ui-page-migration-ledger.md` | Records UI-08 as shared sidebar calibration, not page migration completion. |

## Design Decisions

Accepted:

- Use owner `shell/navigation.ts` as the exact grouping source.
- Keep existing repo `AdminShellRoute` and registry page ids; grouping is a view-layer calibration, not a router rewrite.
- Keep the native/shared `NavItem` and `IconSlot`/Lucide path already landed by prior M7 UI slices.
- Keep collapsed sidebar labels hidden and preserve accessible expand/collapse labels.

Rejected:

- Generic visible `GROUP` / `TENANT` sidebar buckets.
- Rendering both group and tenant nav trees and hiding one with CSS.
- Moving shared shell fixes into the page-local conversations slice.
- Importing raw owner HTML/runtime or editing `/Users/atilla/源码/unpacked 6`.

## Impeccable / Design Audit

| Command | Result | Notes |
|---|---|---|
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node .agents/skills/impeccable/scripts/context.mjs --target apps/admin/src/shell/AppShell.tsx` | pass | Product/admin context loaded; prototype source hierarchy confirmed. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node .agents/skills/impeccable/scripts/detect.mjs --json apps/admin/src/shell/AppShell.tsx apps/admin/src/shell/AppShellNavigation.tsx apps/admin/src/shell/AppShell.css` | pass | Final result `[]`. |

## Validation

The shell PATH does not expose `node`, `npm`, `npx` or `gh` directly. Validation uses the bundled Codex runtime:

- node: `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node`
- pnpm: `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/pnpm`

| Command | Result | Notes |
|---|---|---|
| `git diff --check` | pass | No whitespace errors. |
| `PATH=/tmp/uzmax-m7-ui-08-shared-sidebar-calibration/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH /Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/pnpm exec prettier --check apps/admin/src/shell/AppShell.tsx apps/admin/src/shell/AppShellNavigation.tsx apps/admin/src/shell/AppShell.css apps/admin/tests/m7-ui-foundation.spec.ts apps/admin/tests/m7-ui-page-router.spec.ts docs/specs/M7-UI-08-shared-sidebar-calibration.md docs/evidence/M7/M7-UI-08-shared-sidebar-calibration.md docs/evidence/M7/README.md docs/admin-ui-page-migration-ledger.md` | pass | All touched files use Prettier style. |
| `PATH=/tmp/uzmax-m7-ui-08-shared-sidebar-calibration/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH npm run format:check` | fail, pre-existing unrelated formatting debt | Reports 11 untouched files: `apps/admin/src/M4CustomerAssetRuntimeState.tsx`, `apps/admin/src/orderImportApiClient.ts`, `apps/admin/src/pages/registry.ts`, `apps/api/src/ai-member-runtime.contracts.ts`, `apps/api/src/confirmation-queue.types.ts`, `apps/api/src/conversation-ticket.types.ts`, `apps/api/src/order-import.repository.ts`, `apps/api/src/order-import.types.ts`, `packages/capabilities/kb/src/index.ts`, `packages/capabilities/order-read/src/index.ts`, `packages/channels/src/index.ts`. This slice did not format unrelated files. |
| `PATH=/tmp/uzmax-m7-ui-08-shared-sidebar-calibration/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH npm run guard:doc-triggers` | pass | `doc-trigger-paths: ok`. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M7-UI-08-shared-sidebar-calibration.md --include-worktree` | pass | 9 changed files: source 3, test 2, docs 4; source net LOC 87; new source files 1; within UI-08 budget. |
| `PATH=/tmp/uzmax-m7-ui-08-shared-sidebar-calibration/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH npm run lint` | pass | ESLint passed after extracting sidebar grouping/rendering to `AppShellNavigation.tsx`; `AppShell.tsx` is 211 lines. |
| `PATH=/tmp/uzmax-m7-ui-08-shared-sidebar-calibration/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH npm run typecheck` | fail, environment dependency gap | `tsc` runs but local install lacks workspace/backend dependencies: `@nestjs/common`, `@nestjs/core`, `@supabase/supabase-js`, `reflect-metadata`, `bullmq`, `@prisma/client`. No UI-08 shell-specific type error was reported before those missing-module blockers. |
| `PATH=/tmp/uzmax-m7-ui-08-shared-sidebar-calibration/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH npm run build:admin` | pass | Vite admin build succeeded; output JS gzip about 99.97 kB. |
| `PATH=/tmp/uzmax-m7-ui-08-shared-sidebar-calibration/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH npx playwright test apps/admin/tests/m7-ui-foundation.spec.ts apps/admin/tests/m7-ui-page-router.spec.ts` | pass | 5 focused tests passed. |

## Boundary

This evidence does not approve M7 closeout, owner acceptance, GA-0, production deployment, real customer/order-data use, customer LLM, Telegram Business automatic reply, PR #182 merge, page-local visual acceptance, production/release state or 1.0 release.
