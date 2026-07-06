# M7-UI-96C jscpd Regression Guard Evidence

## Status

`ci_guard_unblock_candidate_pending_pr_review`

This slice adds a PR-level jscpd regression guard for the M7 stack. It does not claim whole-repo duplicate cleanup, owner acceptance, runtime closure, GA-0 or 1.0 release approval.

## Scope

- Spec: `docs/specs/M7-UI-96C-jscpd-regression-guard.md`
- Base: `origin/codex/m7-ui-96a-stack-typecheck-cleanup`
- Branch/worktree: `codex/m7-ui-96c-jscpd-regression-guard` / `/Users/atilla/.codex/worktrees/m7-ui-96c-jscpd-regression-guard`
- Primary guard: `scripts/guards/jscpd-regression.mjs`
- Focused tests: `scripts/tests/jscpd-regression.test.mjs`
- CI changes: `.github/workflows/ci.yml`
- Package manifest boundary: `package.json` is unchanged in the final 96C diff.
- Docs/spec/evidence changes: `docs/specs/M7-UI-96C-jscpd-regression-guard.md`, `docs/evidence/M7/M7-UI-96C-jscpd-regression-guard.md`, `docs/evidence/M7/README.md`

## Startup Evidence

- `pwd`: `/Users/atilla/.codex/worktrees/m7-ui-96c-jscpd-regression-guard`
- `git status --short --branch` before rebase: `## codex/m7-ui-96c-jscpd-regression-guard...origin/codex/m7-ui-96c-jscpd-regression-guard`
- `git branch --show-current`: `codex/m7-ui-96c-jscpd-regression-guard`
- Fetched origin before rebase.
- `origin/codex/m7-ui-96a-stack-typecheck-cleanup`: `fc30eb3b5559e9366a8ae62f04fa1223840b6c9a`
- Previous `origin/codex/m7-ui-96c-jscpd-regression-guard` / #240 head before rebase: `6e4ce891b50f7c5ae461ba8d6e83417f4710724e`
- Rebased local 96C onto the current #239 head without conflicts and without any `apps/admin/**` diff.
- Root/main checkout at `/Users/atilla/Applications/UZMAX智能运营` was not used for file edits.
- Forbidden dirty worktree `/Users/atilla/.codex/worktrees/m7-ui-96a-stack-typecheck-cleanup` was not entered or modified.

## Source Review

- Read `AGENTS.md`.
- Read current `package.json`, `.github/workflows/ci.yml` and `jscpd.config.json`.
- Ran `rg -n "jscpd|duplicate|clone|threshold" scripts .github package.json docs/specs docs/evidence`.
- Reviewed existing guard/test patterns:
  - `scripts/guards/prettier-ignore-boundary.mjs`
  - `scripts/guards/eval-trigger-paths.mjs`
  - `scripts/tests/prettier-ignore-boundary.test.mjs`
  - `scripts/tests/eval-gate.test.mjs`
- Reviewed adjacent M7 evidence index and M7-UI-95 spec/evidence.

## Implementation Summary

- Did not add a `guard:jscpd-regression` npm script; `package.json` remains unchanged.
- Replaced the PR CI core jscpd step with `node scripts/guards/jscpd-regression.mjs --base "$JSCPD_REGRESSION_BASE"`.
- Keeping `package.json` out of the diff avoids package-manifest path-scope triggering `run_true_db_smoke=true` solely to add a helper alias in this narrow CI guard PR.
- Kept `npm run jscpd` and `jscpd.config.json` unchanged for absolute whole-repo duplicate debt checks.
- Added a fail-closed guard that:
  - resolves the base ref to a commit;
  - creates a temporary detached base worktree;
  - runs jscpd for base and head over `apps packages scripts`;
  - reads JSON `statistics.total`;
  - compares clones, duplicated lines, duplicated line percentage, duplicated tokens and duplicated token percentage;
  - fails if any head metric is greater than base;
  - removes temporary worktrees and reports.
- Added focused parser/comparator tests, including a controlled worsening-metric failure path.
- This rebuilt #240 is stacked on #239 and intentionally contains no `apps/admin/**` diff. #239 already handles the inherited prettier-ignore, typecheck and max-lines cleanup surface.

## Current jscpd Boundary

- Current base has existing duplicate-code debt and can fail absolute `npm run jscpd`.
- This guard does not declare that debt acceptable for release; it only prevents unrelated M7 UI cleanup PRs from absorbing historical repository-wide duplicate cleanup.
- Future whole-repo duplicate cleanup should remain a separate cleanup spec/PR.

## Validation

Validation status: `PASS`.

Environment note:

- The default shell could not find `npm` or `node`; validation used `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH`.
- `node_modules` was an existing local directory in this 96C worktree, not a symlink and not created during this rebuild.

Final validation against `origin/codex/m7-ui-96a-stack-typecheck-cleanup`:

- PASS: `npm run format:check`
  - Result: `All matched files use Prettier code style!`.
- PASS: `npm run guard:prettier-ignore -- --base origin/codex/m7-ui-96a-stack-typecheck-cleanup`
  - Result: `8 baseline file(s), 89/89 marker(s)` and diff check ok.
- PASS: `npm run typecheck`
- PASS: `npm run lint`
- PASS: `npm run depcruise`
  - Result: `312 modules, 386 dependencies cruised`.
- PASS: `node --test scripts/tests/jscpd-regression.test.mjs`
  - Result: `4/4` tests passed, including the controlled worsening-metric failure path.
- PASS: `node scripts/guards/jscpd-regression.mjs --base origin/codex/m7-ui-96a-stack-typecheck-cleanup`
  - Base `fc30eb3b5559e9366a8ae62f04fa1223840b6c9a`: `141` clones, `2538` duplicated lines, `2.79%`, `17547` duplicated tokens, `3.31%`.
  - Head: `141` clones, `2538` duplicated lines, `2.78%`, `17547` duplicated tokens, `3.30%`.
  - Result: head did not worsen duplicate metrics.
- PASS: `npm run guard:pr-shape -- --base origin/codex/m7-ui-96a-stack-typecheck-cleanup --spec docs/specs/M7-UI-96C-jscpd-regression-guard.md --include-worktree`
  - `changedFiles`: `6`
  - categories: config `1`, docs `3`, source `1`, test `1`
  - source budget: changed files `1`, net LOC `317`, new source files `1`
- PASS: `git diff --check origin/codex/m7-ui-96a-stack-typecheck-cleanup...HEAD`
- PASS: `npm run build:admin`
  - Existing Vite warning: bundle chunk larger than 500 kB after minification.

## Cleanup Status

- Guard temp worktrees/reports created by the jscpd regression run were removed by the guard.
- No build/test/report residue was left by validation.
- `node_modules` must remain local to this 96C worktree if present; no symlink should be created.
- Final `git status --short --branch` must be clean after commit/push.

## Remaining Deltas

- Whole-repo jscpd debt cleanup remains future work.
- #239 remains the stack cleanup slice for prettier-ignore, typecheck and max-lines blockers.
- This PR intentionally does not absorb app/admin page source or broad UI/test cleanup scope.
- This PR intentionally does not touch `package.json`; the direct-node CI command keeps 96C from triggering true DB runtime smoke solely through a helper npm alias.
- Draft PR review and GitHub Actions result are required before this unblock is accepted.
