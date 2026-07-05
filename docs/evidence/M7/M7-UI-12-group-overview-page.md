# M7-UI-12 Group Overview Page Evidence

## Status

Implementation candidate evidence for `group.overview` / 集团总览 on stacked branch `codex/m7-ui-12-group-overview-visible-ui`.

This PR renders the visible UI-first group overview page in `apps/admin` using centralized degraded/mock fallback state. DB/API/runtime foundation is intentionally downgraded for this slice, so the page marks aggregate data as `degraded`, `aggregate runtime unavailable` and `not production metrics`; it does not claim production metrics, real group aggregate runtime, owner visual acceptance, merge, GA-0, production deployment, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release approval.

## Entry Evidence

| Fact | Evidence |
|---|---|
| worker path | `/Users/atilla/.codex/worktrees/m7-ui-12-group-overview-visible-ui` |
| worker branch | `codex/m7-ui-12-group-overview-visible-ui` |
| worker status at entry | `## codex/m7-ui-12-group-overview-visible-ui...origin/codex/m7-ui-12-group-overview-visible-ui` |
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
| `apps/admin/src/pages/group/GroupOverviewPage.tsx` | Calibrates first viewport toward the owner source: lightweight title result text, no first-viewport degraded banner, source-shaped health strip values, initial empty table frame, bottom runtime note and controlled reveal of sanitized rows for search/filter/tenant-entry coverage. |
| `apps/admin/src/pages/group/groupOverviewFallback.ts` | Centralizes safe degraded/mock cards, rows, columns and filter matching; card values now mirror the owner source shape `4/2/1/0/1/7` while the runtime note keeps the values outside production truth. |
| `apps/admin/src/pages/PageOutlet.tsx` | Renders `GroupOverviewPage` for `group.overview`. |
| `apps/admin/src/App.tsx` | Passes tenant-entry callback that routes clicked rows to `tenant.conversations`. |
| `apps/admin/src/pages/registry.ts` | Marks `group.overview` as implementation evidence pending PR review under this spec. |
| `apps/admin/tests/m7-ui-group-overview.spec.ts` | Covers default group layer, group-only nav, topbar/sidebar geometry, cards/table labels, degraded/mock labeling, search/filter/clear/sort, tenant-entry button click/keyboard activation, tenant-only nav, collapse width and 320px no overflow. |

## Runtime / Data Boundary

- All group overview table/card values are centralized mock/degraded fallback values and are visibly labeled via bottom runtime note as `aggregate runtime unavailable` and `not production metrics`.
- The default first viewport hides sanitized tenant rows and shows the source-like empty/filtered table state; search, clear-filter or selecting a health card reveals sanitized fallback rows for interaction tests.
- The prohibited prototype metric values are not used as group overview runtime facts.
- No backend/API/DB/schema/package/lock/global CI files are touched.
- Tenant-entry button activation enters `tenant.conversations` with the sanitized fallback row tenant id as a controlled UI-only degraded affordance. It demonstrates the group layer -> tenant layer boundary only; real authorization, RLS, permission reload and tenant-cache invalidation remain future runtime responsibilities before production use.

## Runtime State Coverage

| State / behavior | Evidence status |
|---|---|
| degraded/mock visual shell | covered by page runtime note, fallback metadata and focused Playwright |
| source-like initial / filtered empty table | covered by default first viewport and clear-filter empty-state assertions |
| mobile fallback and sidebar collapse | covered by 320px no-overflow and collapsed sidebar width assertions |
| shell separation | covered by group-only navigation, tenant-only navigation and `/design` group-layer assertions |
| tenant-entry visual boundary | covered by click, Enter and Space activation into `tenant.conversations`; UI-only, not production authorization |
| loading / error / permission denied runtime states | deferred/not claimed under the UI-first DB/API blocker exception for this slice |

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
| desktop result label | `4 个租户 · fallback` |
| desktop nav width | `232` |
| desktop topbar height | `53` |
| health cards | `6` |
| health card values | `4, 2, 1, 0, 1, 7` |
| initial tenant rows | `0` |
| runtime note placement | below table, not first-viewport banner |
| mobile viewport/body scroll width | `320 / 320` |
| mobile overflow | `false` |

Source HTML note: direct file open defaulted to the tenant conversation view; clicking `集团` produced the group overview source screenshot. The source prototype still contains the original numeric demo values and is used only as visual/source mapping, not as runtime truth for this implementation.

## Validation

| Command | Result | Notes |
|---|---|---|
| `git diff --check` | pass | Re-run in docs-only follow-up; no whitespace output. |
| `npm run guard:doc-triggers` | pass | `doc-trigger-paths: ok`. |
| `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-20-conversation-workbench-page-impl --spec docs/specs/M7-UI-12-group-overview-page.md --include-worktree` | pass | `changedFiles: 10`; categories `source: 5`, `test: 1`, `docs: 4`; source net LOC `458`; no package/lock/backend/DB/global config expansion. |
| `npm run format:check` | pass | Re-run in docs-only follow-up; repo Prettier check passed. |
| `npm run lint` | pass | ESLint passed after keeping `GroupOverviewPage.tsx` under the React max-lines budget by moving static mappings to the existing fallback module. |
| `npm run typecheck -- --pretty false` | pass | Ran with Codex Node PATH prefix. |
| `npm run build:admin` | pass | Vite admin build produced `apps/admin/dist`. |
| `npm run playwright -- apps/admin/tests/m7-ui-group-overview.spec.ts` | pass | 5/5 tests passed; covers tenant-entry button click plus Enter/Space keyboard activation. |

## Remaining Visual Deltas

- Header result text uses truthful `fallback` rather than the owner source's `实时`, so it does not imply production runtime closure.
- Sanitized tenant rows remain available only after user interaction; default visual intentionally follows the current source-like empty table screenshot.
- Controlled tenant-entry is visual-only and intentionally lacks production authorization/cache-invalidation runtime proof in this UI-first slice.
- Owner pixel/detail acceptance is still pending; this evidence is an implementation candidate, not final visual signoff.

## Boundary

This evidence does not approve page migration final acceptance, runtime closure, M7 closeout, owner acceptance, GA-0, production, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release.
