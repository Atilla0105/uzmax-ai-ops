# M7-UI-12 Group Overview Page Evidence

## Status

Implementation candidate evidence for `group.overview` / 集团总览 on stacked branch `codex/m7-ui-12-group-overview-visible-ui`.

This PR renders the visible UI-first group overview page in `apps/admin` using centralized degraded/mock fallback state. DB/API/runtime foundation is intentionally downgraded for this slice, so the page marks aggregate data as `mock`, `degraded` and `aggregate runtime unavailable`; it does not claim production metrics, real group aggregate runtime, owner visual acceptance, merge, GA-0, production deployment, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release approval.

## Entry Evidence

| Fact | Evidence |
|---|---|
| worker path | `/Users/atilla/.codex/worktrees/m7-ui-12-group-overview-visible-ui` |
| worker branch | `codex/m7-ui-12-group-overview-visible-ui` |
| worker status at entry | `## codex/m7-ui-12-group-overview-visible-ui...origin/codex/m7-ui-20-conversation-workbench-page-impl` |
| stacked base | PR #182 head/base branch `origin/codex/m7-ui-20-conversation-workbench-page-impl` |
| root/main checkout | `/Users/atilla/Applications/UZMAX智能运营` must remain read-only/clean |
| Node/npm path | Plain `node` was missing on initial PATH; validation uses `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH`. |

## Required Reads / Mapping

- Required reads completed before editing: `AGENTS.md`, `docs/specs/M7-UI-12-group-overview-page.md`, `docs/admin-design-system.md`, `docs/admin-ui-page-migration-ledger.md`, `apps/admin/src/App.tsx`, `apps/admin/src/pages/PageOutlet.tsx`, `apps/admin/src/pages/registry.ts`, `apps/admin/src/shell/AppShell.tsx`, `apps/admin/src/shell/AppShellNavigation.tsx`, `apps/admin/src/shell/AppShell.css` and `apps/admin/src/pages/conversations/*`.
- Owner prototype files read: `/Users/atilla/Downloads/运营塔台1.0.html`, `/Users/atilla/源码/unpacked 6/pages/group/GroupOverviewPage.tsx`, `/Users/atilla/源码/unpacked 6/fixtures/group.ts`, `/Users/atilla/源码/unpacked 6/App.tsx` and `/Users/atilla/源码/unpacked 6/shell/navigation.ts`.
- Adopted Impeccable/product-register guidance: dense operational admin UI, status-first hierarchy, complete degraded/mock labeling, desktop control-room primary, 320px readable fallback, no decorative/legacy-shell visual drift.
- Rejected/adapted prototype runtime behavior: raw fixture imports, inline style system, prototype metric values as runtime facts and group-layer customer plaintext.

## Implementation Summary

| Path | Summary |
|---|---|
| `apps/admin/src/pages/group/GroupOverviewPage.tsx` | Adds visible group overview page with title, result/degraded labels, clear filter, search, six health cards, sortable table and row click into tenant conversations. |
| `apps/admin/src/pages/group/groupOverviewFallback.ts` | Centralizes safe degraded/mock cards, rows, columns and filter matching; no prototype fixtures imported. |
| `apps/admin/src/pages/PageOutlet.tsx` | Renders `GroupOverviewPage` for `group.overview`. |
| `apps/admin/src/App.tsx` | Passes tenant-entry callback that routes clicked rows to `tenant.conversations`. |
| `apps/admin/src/pages/registry.ts` | Marks `group.overview` as implementation evidence pending PR review under this spec. |
| `apps/admin/tests/m7-ui-group-overview.spec.ts` | Covers default group layer, group-only nav, topbar/sidebar geometry, cards/table labels, degraded/mock labeling, search/filter/clear/sort, tenant-entry button click/keyboard activation, tenant-only nav, collapse width and 320px no overflow. |

## Runtime / Data Boundary

- All group overview table/card values are centralized mock/degraded fallback values and are visibly labeled as `mock`, `degraded`, `aggregate runtime unavailable` and `not production metrics`.
- The prohibited prototype metric values are not used as group overview runtime facts.
- No backend/API/DB/schema/package/lock/global CI files are touched.
- Tenant-entry button activation enters `tenant.conversations` with the row tenant id; real authorization/cache invalidation remains a future runtime responsibility.

## Browser Evidence

Artifacts captured under `/tmp/uzmax-m7-ui-12-group-overview-visible-ui/`:

- React desktop screenshot: `/tmp/uzmax-m7-ui-12-group-overview-visible-ui/react-group-overview-desktop.png`
- React mobile screenshot: `/tmp/uzmax-m7-ui-12-group-overview-visible-ui/react-group-overview-mobile-320.png`
- Source HTML screenshot after clicking the source breadcrumb/group affordance: `/tmp/uzmax-m7-ui-12-group-overview-visible-ui/source-html-after-group-click-desktop.png`
- Metrics JSON: `/tmp/uzmax-m7-ui-12-group-overview-visible-ui/metrics.json`
- Source-click metrics JSON: `/tmp/uzmax-m7-ui-12-group-overview-visible-ui/source-click-metrics.json`

Measured React metrics:

| Metric | Value |
|---|---|
| desktop page id | `group.overview` |
| desktop runtime state | `degraded` |
| desktop nav width | `232` |
| desktop topbar height | `53` |
| health cards | `6` |
| mobile viewport/body scroll width | `320 / 320` |
| mobile overflow | `false` |

Source HTML note: direct file open defaulted to the tenant conversation view; clicking `集团` produced the group overview source screenshot. The source prototype still contains the original numeric demo values and is used only as visual/source mapping, not as runtime truth for this implementation.

## Validation

| Command | Result | Notes |
|---|---|---|
| `git diff --check` | pass | No whitespace output. |
| `npm run guard:doc-triggers` | pass | `doc-trigger-paths: ok`. |
| `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-20-conversation-workbench-page-impl --spec docs/specs/M7-UI-12-group-overview-page.md --include-worktree` | pass | `changedFiles: 11`; categories `source: 6`, `docs: 4`, `test: 1`; spec type `feature`. |
| `npm run lint` | pass | ESLint completed cleanly. |
| `npm run typecheck -- --pretty false` | pass after `npm ci` | Initial run failed because backend/runtime deps were absent from `node_modules`; `npm ci` from existing `package-lock.json` installed dependencies without package/lock changes, then typecheck passed. |
| `npm run build:admin` | pass | Vite admin build produced `apps/admin/dist`. |
| `npm run playwright -- apps/admin/tests/m7-ui-group-overview.spec.ts` | pass | 5/5 tests passed; covers tenant-entry button click plus Enter/Space keyboard activation. |
| `npm run playwright -- apps/admin/tests/m7-ui-page-router.spec.ts apps/admin/tests/m7-ui-conversation-workbench.spec.ts apps/admin/tests/m7-ui-conversation-workbench-fallback.spec.ts` | pass | 14/14 tests passed; validates router/sidebar grouping and #182 conversation workbench after restoring shared sidebar badges to the base values. |

## Boundary

This evidence does not approve page migration final acceptance, runtime closure, M7 closeout, owner acceptance, GA-0, production, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release.
