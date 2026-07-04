# M7-UI-07B Page Visual Acceptance Hard Rules Evidence

## Status

Docs-only evidence for moving the owner's latest page-migration visual feedback into hard rules and review checklists.

This slice does not implement UI, claim owner visual acceptance, make Draft PR #182 merge-ready, close runtime gaps, approve release/acceptance, or create new page implementation tasks.

## Entry State

| Fact | Evidence |
|---|---|
| worker worktree | `/Users/atilla/.codex/worktrees/m7-ui-07b-visual-plan-hard-rules` |
| worker branch | `codex/m7-ui-07b-visual-plan-hard-rules` |
| worker base | `origin/main` at `22d9ba2` / M7-UI-08 shared sidebar calibration |
| entry `pwd` | `/Users/atilla/.codex/worktrees/m7-ui-07b-visual-plan-hard-rules` |
| entry `git status --short --branch` | `## codex/m7-ui-07b-visual-plan-hard-rules...origin/main` |
| root/main checkout | `/Users/atilla/Applications/UZMAX智能运营` |
| root/main status/head | `## main...origin/main`; `22d9ba2` |

## Required Reads

| Source | Use |
|---|---|
| `AGENTS.md` | Source-of-truth priority, owner HTML/unpacked source boundary, docs/spec requirement and workspace isolation rules. |
| `docs/admin-ui-page-migration-ledger.md` | Durable page migration plan and current hard-rule target. |
| `docs/admin-ui-prototype-migration-index.md` | Page-worker hard rules and evidence checklist target. |
| `docs/evidence/M7/README.md` | M7 evidence index and current UI queue wording. |
| `docs/specs/M7-UI-07-page-visual-acceptance-notes.md` | Existing owner visual acceptance note baseline. |
| `docs/specs/M7-UI-08-shared-sidebar-calibration.md` | Owner sidebar category/collapse contract. |
| `docs/evidence/M7/M7-UI-08-shared-sidebar-calibration.md` | Validation evidence for merged shared sidebar calibration. |

## Hard Rules Added

- Owner HTML and frozen unpacked source are the visual/structural baseline, not loose inspiration.
- "Overall direction is close" is not visual acceptance; unresolved desktop visual deltas must be listed and accepted.
- Visible sidebar acceptance includes owner category grouping, item order, icon treatment, expanded/collapsed dimensions and bottom collapse control.
- Mobile remains readable/no-overflow fallback; pixel-level mobile redesign is deferred.
- Page workers must inspect exact target `unpacked 6/pages/**` files and relevant source components before implementation and acceptance.
- Page evidence must record owner HTML/source comparison, inspected source files/components, sidebar parity when visible, mobile fallback status and remaining visual deltas.

## Deliverables

| File | Result |
|---|---|
| `docs/specs/M7-UI-07B-page-visual-acceptance-hard-rules.md` | Adds this docs-only follow-up spec. |
| `docs/evidence/M7/M7-UI-07B-page-visual-acceptance-hard-rules.md` | Adds this evidence file. |
| `docs/admin-ui-page-migration-ledger.md` | Strengthens acceptance notes into hard rules and updates UI-08 merged status. |
| `docs/admin-ui-prototype-migration-index.md` | Strengthens page-worker hard rules and evidence checklist. |
| `docs/evidence/M7/README.md` | Records this docs-only slice and UI-08 merge status. |

## Validation

| Command | Result | Notes |
|---|---|---|
| `git add -N docs/specs/M7-UI-07B-page-visual-acceptance-hard-rules.md docs/evidence/M7/M7-UI-07B-page-visual-acceptance-hard-rules.md && git diff --check` | pass | Covers tracked docs and the two new docs with no whitespace output. |
| `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:/Applications/Codex.app/Contents/Resources/cua_node/bin:$PATH npm run guard:doc-triggers` | pass | `doc-trigger-paths: ok`. |
| `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:/Applications/Codex.app/Contents/Resources/cua_node/bin:$PATH node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M7-UI-07B-page-visual-acceptance-hard-rules.md --include-worktree` | pass | Reported `changedFiles: 5`, category `docs: 5`, source changed files `0`, source net LOC `0`, new source files `0`. |

## Boundary

This slice does not modify `apps/**`, `packages/**`, tests, generated files, package files, lockfiles, CI/guard scripts, DB/schema, backend/API, worker/cron or raw prototype inputs.

This evidence does not approve owner visual acceptance, page implementation, merge readiness, M7 closeout, GA-0, production, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release.
