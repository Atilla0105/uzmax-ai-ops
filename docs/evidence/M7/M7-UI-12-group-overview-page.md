# M7-UI-12 Group Overview Page Evidence

## Status

Spec-only evidence for `group.overview` / 集团总览.

This PR creates the page-migration contract that replaces the older `M7-UI-04A-group-overview` placeholder for planning. It updates the M7 queue and page ledger, but does not implement React pages, route rendering, API hooks, tests, CSS, backend/API/runtime contracts, DB changes, package/lock changes, CI/global config, screenshots or fixture imports.

This is not page implementation, M7 closeout, owner acceptance, GA-0 opening, production deployment, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release approval.

## Entry Evidence

| Fact | Evidence |
|---|---|
| worker path | `/Users/atilla/.codex/worktrees/m7-ui-12-group-overview-page-spec` |
| worker branch | `codex/m7-ui-12-group-overview-page-spec` |
| worker status at entry | `## codex/m7-ui-12-group-overview-page-spec...origin/main` |
| worker HEAD | `2193a51` / `M7-UI-06 shared shell topbar calibration (#183)` |
| root/main checkout | `/Users/atilla/Applications/UZMAX智能运营` |
| root/main status/head before edits | `## main...origin/main`; `2193a51` |
| root `git branch --no-merged main` before edits | `codex/m7-ui-07-page-visual-acceptance-notes`; `codex/m7-ui-11-release-acceptance-page-impl`; `codex/m7-ui-20-conversation-workbench-page-impl` |
| open PR audit | #178 Draft/Paused (`codex/m7-ui-11-release-acceptance-page-impl`, CI success); #182 Draft conversation implementation candidate (`codex/m7-ui-20-conversation-workbench-page-impl`, CI success); #184 Draft docs PR (`codex/m7-ui-07-page-visual-acceptance-notes`, CI success, not merged). |
| Codex Node/npm PATH note | Plain `node`, `npm` and `gh` were not initially on shell PATH. Validation uses Codex Node/npm and bundled `gh` paths. |

## Required Reads / Mapping

- Required reads completed before drafting: `AGENTS.md`, the four v1.1 source-of-truth docs, `docs/admin-design-system.md`, `docs/admin-ui-page-migration-ledger.md`, `docs/admin-ui-prototype-migration-index.md`, `docs/evidence/M7/README.md`, current `apps/admin/src/pages/registry.ts`, current `apps/admin/src/pages/PageOutlet.tsx`, and owner prototype group overview sources.
- Owner prototype files read: `/Users/atilla/源码/unpacked 6/pages/group/GroupOverviewPage.tsx`, `/Users/atilla/源码/unpacked 6/fixtures/group.ts`, `/Users/atilla/源码/unpacked 6/App.tsx`, `/Users/atilla/源码/unpacked 6/shell/navigation.ts`, and `/Users/atilla/Downloads/运营塔台1.0.html` as visual reference only.
- #184 read-only acceptance notes were inspected from `/Users/atilla/.codex/worktrees/m7-ui-07-page-visual-acceptance-notes`; no #184 files were edited.
- Adopted Impeccable/product-register guidance: dense operational admin UI, status-first hierarchy, visible permission/degraded states, desktop primary, mobile fallback only and no decorative/legacy-shell visual language.
- Rejected prototype/runtime behavior: raw inline styling as repo target, raw fixtures as runtime truth, local demo state, old shell visuals, old `--uzmax-*` visual target and any group-layer customer plaintext.

## Spec Summary

| Path | Summary |
|---|---|
| `docs/specs/M7-UI-12-group-overview-page.md` | Defines source mapping, page matrix, runtime contract, state coverage, visual acceptance, evidence plan and boundaries for `group.overview`. |
| `docs/evidence/M7/M7-UI-12-group-overview-page.md` | Records this spec-only evidence stub. |
| `docs/admin-ui-page-migration-ledger.md` | Updates `group.overview` from `M7-UI-04A-group-overview` placeholder to `M7-UI-12-group-overview-page` spec-ready/docs-only state without claiming implementation. |
| `docs/evidence/M7/README.md` | Adds UI-12 to the M7 execution queue and current boundary. |

## Runtime / Contract Notes

- Current repo has a `group.overview` registry row, but it still renders the planned-page scaffold through `PageOutlet`.
- Current repo does not have a M7 group overview page, group aggregate ApiClient, group aggregate hook, or approved runtime contract for REQ-G01 metrics.
- Future implementation must wire an approved real aggregate API/hook or render an honest read-only/degraded state. It must not import or copy `unpacked 6` fixtures as runtime truth.
- Group layer can show authorized aggregate data only. It must not expose customer plaintext, conversation content, phone, Telegram username, raw order payload or cross-tenant private data.

## Review Fix Notes

- PR #185 remains Draft after the touch-list correction.
- Do not mark PR #185 ready or merge it before #184 is resolved/merged, because #184 carries shared page visual acceptance notes that this spec depends on conceptually. This note does not claim #184 is merged.
- The spec machine-readable touch list is docs-only. Future implementation candidate paths are recorded in a separate non-guard section, and a future implementation PR must add or confirm its own implementation touch list before code changes.

## Page Contract Highlights

- Objects: group health summary, tenant row, tenant health category, eval state, order connector state, last abnormal event and tenant navigation target.
- Fields: tenant count, abnormal tenant count, AI tripped, model fault, order connector fault, redline today, sessions, human-needed, SLA risk, handoff rate, AI cost/day, eval status, order status and last abnormal event.
- Filters/actions: search tenant/business line, health card filter, clear filter, sort columns and authorized row click into tenant layer.
- States: loading, empty, filtered empty, error, permission denied, degraded/stale aggregate and mobile fallback/read-only.
- Visual acceptance: owner HTML and unpacked source are hard baseline; desktop pixel/detail comparison is required before visual acceptance can be claimed; sidebar category grouping and bottom collapse control must be checked if visible.

## Validation

| Command | Result | Notes |
|---|---|---|
| `git add -N docs/specs/M7-UI-12-group-overview-page.md docs/evidence/M7/M7-UI-12-group-overview-page.md && git diff --check` | pass | Covered the two new docs plus modified tracked docs; no whitespace output. |
| `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:/Applications/Codex.app/Contents/Resources/cua_node/bin:$PATH npm run guard:doc-triggers` | pass | `doc-trigger-paths: ok`. |
| `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:/Applications/Codex.app/Contents/Resources/cua_node/bin:$PATH node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M7-UI-12-group-overview-page.md --include-worktree` | pass | Reported `changedFiles: 4`, category `docs: 4`, source changed files `0`, source net LOC `0`, new source files `0`. |

PR body must include `Spec ID` and `Spec file` metadata for CI `guard:pr-shape`.

## Boundary

This evidence does not approve page implementation, page migration, runtime closure, M7 closeout, owner acceptance, GA-0, production, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release.
