# M7-UI-07 Page Visual Acceptance Notes Evidence

## Status

Docs-only evidence for moving owner page-migration acceptance notes into the durable M7 migration plan.

This slice does not implement UI, claim owner visual acceptance, make Draft PR #182 merge-ready, close runtime gaps, approve release/acceptance, or create new page implementation tasks.

## Entry State

| Fact | Evidence |
|---|---|
| worker worktree | `/Users/atilla/.codex/worktrees/m7-ui-07-page-visual-acceptance-notes` |
| worker branch | `codex/m7-ui-07-page-visual-acceptance-notes` |
| entry `pwd` | `/Users/atilla/.codex/worktrees/m7-ui-07-page-visual-acceptance-notes` |
| entry `git status --short --branch` | `## codex/m7-ui-07-page-visual-acceptance-notes` |
| entry `git branch --show-current` | `codex/m7-ui-07-page-visual-acceptance-notes` |
| root/main checkout | `/Users/atilla/Applications/UZMAX智能运营` |
| root/main status/head | `## main...origin/main`; `2193a51` |
| root `git branch --no-merged main` | `codex/m7-ui-11-release-acceptance-page-impl`; `codex/m7-ui-20-conversation-workbench-page-impl` |
| #178 worktree status | `## codex/m7-ui-11-release-acceptance-page-impl...origin/codex/m7-ui-11-release-acceptance-page-impl` |
| #182 worktree status | `## codex/m7-ui-20-conversation-workbench-page-impl...origin/codex/m7-ui-20-conversation-workbench-page-impl` |

Confirmation: #178 and #182 were inspected read-only and were not edited by this worker.

## Required Reads

| Source | Use |
|---|---|
| `AGENTS.md` | Source-of-truth priority, Design Skill Layer boundary, docs/spec requirement, workspace isolation and touch-list governance. |
| `docs/admin-ui-page-migration-ledger.md` | Durable page ledger target for the owner acceptance notes. |
| `docs/admin-ui-prototype-migration-index.md` | Worker handoff and page-worker hard-rule target for the same acceptance notes. |
| `docs/admin-design-system.md` | Prototype/source baseline, global frame, navigation components and layer/sidebar requirements. |
| `docs/evidence/M7/README.md` | Existing M7 index convention and current M7 UI queue boundary. |
| `#182 docs/admin-ui-page-migration-ledger.md` | Source material for the acceptance-note language, used read-only. |
| `#182 docs/admin-ui-prototype-migration-index.md` | Source material for page-worker and sidebar acceptance rules, used read-only. |
| `#182 docs/evidence/M7/M7-UI-20-conversation-workbench-page.md` | Source material for the owner feedback boundary: broadly aligned, not accepted, not merge-ready. |

Impeccable setup note: `.agents/skills/impeccable/SKILL.md` and `reference/product.md` were read. The mandatory `context.mjs` command could not run with plain `node` because `node` is not in PATH in this shell. Product-register guidance was still applied as a wording constraint: dense operational admin UI, clear states, restrained claims and no decorative/invented page layout language.

## Acceptance Notes Added

- Owner HTML `/Users/atilla/Downloads/运营塔台1.0.html` and frozen `/Users/atilla/源码/unpacked 6` are the hard visual/source baseline.
- Current #182 visual direction is broadly aligned but not one-to-one visual acceptance and not merge readiness.
- Desktop page acceptance requires detailed pixel/detail-level adjustment against owner HTML and exact unpacked page source before acceptance is claimed.
- Every page worker must inspect exact target `/Users/atilla/源码/unpacked 6/pages/**` files and the relevant owner HTML region. Workers must not invent layouts, freely rearrange UI or carry old shell visuals.
- Shared shell/sidebar acceptance must verify owner sidebar category grouping and the bottom collapse-sidebar control when the sidebar is visible.
- Mobile remains an acceptable/readable fallback in this phase; pixel-level mobile redesign/polish is deferred.
- Group and tenant layers remain separate: `/design` or admin/home opens group layer/group overview, and selecting a tenant enters tenant layer.
- Release/acceptance remains transitional/low business value and must not displace high-value real admin pages.

## Deliverables

| File | Result |
|---|---|
| `docs/specs/M7-UI-07-page-visual-acceptance-notes.md` | Added docs-only worker spec. |
| `docs/evidence/M7/M7-UI-07-page-visual-acceptance-notes.md` | Added this evidence file. |
| `docs/admin-ui-page-migration-ledger.md` | Updated durable page migration acceptance notes. |
| `docs/admin-ui-prototype-migration-index.md` | Updated page-worker hard rules and handoff checklist. |
| `docs/evidence/M7/README.md` | Added this docs-only slice to the M7 queue and current boundary. |

## Validation

| Command | Result | Notes |
|---|---|---|
| `git diff --check` | pass | First pass covered tracked files; after `git add -N` for the two new docs, the standard command covered all five changed files with no output. |
| `git diff --check --no-index /dev/null docs/specs/M7-UI-07-page-visual-acceptance-notes.md` | pass_with_expected_diff_exit | No whitespace output; `--no-index` returned 1 because the new file differs from `/dev/null`. |
| `git diff --check --no-index /dev/null docs/evidence/M7/M7-UI-07-page-visual-acceptance-notes.md` | pass_with_expected_diff_exit | No whitespace output; `--no-index` returned 1 because the new file differs from `/dev/null`. |
| `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:/Applications/Codex.app/Contents/Resources/cua_node/bin:$PATH npm run guard:doc-triggers` | pass | `doc-trigger-paths: ok`. Plain `npm` is not in PATH in this shell, so Codex Node/npm was used. |
| `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:/Applications/Codex.app/Contents/Resources/cua_node/bin:$PATH node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M7-UI-07-page-visual-acceptance-notes.md --include-worktree` | pass | Reported `changedFiles: 5`, category `docs: 5`, source changed files `0`, source net LOC `0`, new source files `0`. |

## Boundary

This slice does not modify `apps/**`, `packages/**`, tests, generated files, package files, lockfiles, CI/guard scripts, DB/schema, backend/API, worker/cron or raw prototype inputs.

This evidence does not approve owner visual acceptance, page implementation, merge readiness, M7 closeout, GA-0, production, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release.
