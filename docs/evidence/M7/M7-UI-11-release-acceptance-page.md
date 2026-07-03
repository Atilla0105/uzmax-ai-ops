# M7-UI-11 Release Acceptance Page Evidence

## Status

Spec-only evidence stub for `group.release` / 发布与验收.

This PR creates the page-migration contract for the owner-facing release and acceptance console. It updates the M7 queue and page ledger, but does not implement the React page, route rendering, API hooks, tests, CSS, backend/API/runtime contracts, DB changes, package/lock changes, CI/global config, screenshots or fixture imports.

This is not M7 closeout, owner acceptance, GA-0 opening, production deployment, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release approval.

## Entry Evidence

| Fact | Evidence |
|---|---|
| worker path | `/Users/atilla/.codex/worktrees/m7-ui-11-release-acceptance-page` |
| worker branch | `codex/m7-ui-11-release-acceptance-page` |
| worker status at entry | `## codex/m7-ui-11-release-acceptance-page...origin/main` |
| worker HEAD / origin main | `c82fa4d3496807286dc512af32f215b30c3a64fa` / `c82fa4d3496807286dc512af32f215b30c3a64fa` |
| root/main checkout | `/Users/atilla/Applications/UZMAX智能运营` |
| root/main status | `## main...origin/main` |
| `git branch --no-merged main` at entry | no output |
| open PR audit | `gh` unavailable; equivalent GitHub REST audit completed. Current open PR list returned only PR #176 (`codex/m7-ui-11-release-acceptance-page` -> `main`, open, non-draft, head `6124b421937f0fefd154af11aedf3fedaf8905e3` at audit time). PR #176 detail returned open, non-draft, mergeable true, base `main`, base sha `c82fa4d3496807286dc512af32f215b30c3a64fa`. GitHub CI for `6124b421937f0fefd154af11aedf3fedaf8905e3` returned run `28661037540` with conclusion `success`. Root/main `git branch --no-merged main` returned only `codex/m7-ui-11-release-acceptance-page`; root/main status remained `## main...origin/main`. |

## Required Reads / Mapping

- Required reads completed before drafting: `AGENTS.md`, the four v1.1 source-of-truth docs, `docs/admin-design-system.md`, M7 README, page migration ledger, M7-UI-03 spec/evidence, M7-UI-04 spec/evidence, M7-UI-10 spec/evidence, `apps/admin/src/releaseGateContracts.ts`, legacy release-readiness section in `apps/admin/src/App.tsx`, `apps/admin/src/pages/registry.ts`, `apps/admin/src/pages/PageOutlet.tsx`, `/Users/atilla/源码/unpacked 6/pages/group/GroupReleasePage.tsx`, `/Users/atilla/源码/unpacked 6/fixtures/groupPlatform.ts`, `/Users/atilla/源码/unpacked 6/App.tsx`, `/Users/atilla/源码/unpacked 6/shell/navigation.ts`, and `/Users/atilla/Downloads/运营塔台1.0.html` as visual/interaction reference only.
- Adopted Impeccable/product-register guidance: dense operational page, status-first hierarchy, evidence-over-impression copy, release actions treated as high-risk actions, mobile release-blocker review as read-only fallback, no decorative visuals.
- Rejected prototype-local behavior: raw inline styling, raw fixture values as runtime truth, local checkbox state enabling GA-0, and any wording that implies owner signoff or release approval without source evidence.

## Spec Summary

| Path | Summary |
|---|---|
| `docs/specs/M7-UI-11-release-acceptance-page.md` | Defines the page contract, source mapping, runtime/API plan, state/action matrix, visual rules, evidence plan, sequence gate and validation list. |
| `docs/evidence/M7/M7-UI-11-release-acceptance-page.md` | Records this spec-only evidence stub. |
| `docs/evidence/M7/README.md` | Adds UI-11 to the execution queue as spec-ready/pending PR review only. |
| `docs/admin-ui-page-migration-ledger.md` | Updates `group.release` target spec/status/runtime blockers without claiming implementation. |

## Runtime / Contract Notes

- Current repo has `apps/admin/src/releaseGateContracts.ts` and legacy `release-readiness` evidence-route UI. They may inform the future page only where truthful.
- Current `group.release` route remains unimplemented in M7 page migration after this PR; the ledger status is spec-ready only.
- Future implementation must not use local checkbox state as GA-0 truth. Checklist state must come from approved runtime/evidence contracts or render read-only/degraded.
- GA-0 open and 1.0 release actions remain disabled unless a separate approved runtime/API/audit/owner-permission path exists.

## Validation

| Command | Result | Notes |
|---|---|---|
| `git diff --check` | pass | No whitespace errors. |
| `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH npm run guard:doc-triggers` | pass | `doc-trigger-paths: ok`. |
| `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M7-UI-11-release-acceptance-page.md --include-worktree` | pass | Reports 4 changed docs files and source changed files/net LOC/new files all 0. |
| `git status --porcelain` | pass | Only 4 docs paths changed: spec, evidence stub, M7 README and page ledger. |
| focused source/test/config/binary checks | pass | No `apps/admin`, `packages`, package/lock, `.github`, `scripts` or binary media changes/untracked files. |

## Boundary

This evidence does not approve page implementation, M7 closeout, owner acceptance, GA-0, production, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release.
