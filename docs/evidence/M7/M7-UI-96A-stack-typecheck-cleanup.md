# M7-UI-96A Stack CI Cleanup Evidence

## Status

`shape_metadata_synced_ready_for_ci`

PR #239 / branch `codex/m7-ui-96a-stack-typecheck-cleanup` received a 2026-07-06 shape/spec metadata sync on top of remote head `31a25cafb7a583bed0634b577c3819b1f7d06581`. #240 / M7-UI-96C was already squash-merged into this #239 branch as a stack-integration dependency, so the #239 spec and PR body now declare the real 44-file stack diff relative to `origin/codex/m7-ui-95-group-logs-default-visual-parity-refresh`.

This evidence sync changes metadata only. It does not edit `.github/workflows/ci.yml`, `scripts/guards/**`, `scripts/tests/**`, `apps/admin/**`, package/lock/DB/runtime files, does not weaken guards, does not delete tests, and does not claim UI migration completion, owner visual acceptance, runtime closure, GA-0, production readiness or 1.0 release approval.

The prior clean-room `jscpd` finding remains recorded below as boundary evidence. The current #239 CI path now uses the already-merged 96C jscpd regression guard; this shape sync only aligns spec/PR metadata with that real stack diff.

## Scope

- Spec: `docs/specs/M7-UI-96A-stack-typecheck-cleanup.md`
- PR: <https://github.com/Atilla0105/uzmax-ai-ops/pull/239>
- PR base: `codex/m7-ui-95-group-logs-default-visual-parity-refresh` / `9dc45e89dfa0a6ee724d03cffd6d498c690ef8a6`
- PR head before this worker: `31a25cafb7a583bed0634b577c3819b1f7d06581`
- Shape-sync worktree: `/Users/atilla/.codex/worktrees/m7-ui-96a-shape-sync`
- Shape-sync branch: `codex/m7-ui-96a-shape-sync`
- Forbidden worktree not edited: `/Users/atilla/.codex/worktrees/m7-ui-96a-stack-typecheck-cleanup`
- Root/main checkout: `/Users/atilla/Applications/UZMAX智能运营` was read only and was not used for edits.

## Startup Evidence

- GitHub PR #239 head check returned `31a25cafb7a583bed0634b577c3819b1f7d06581`.
- `pwd`: `/Users/atilla/.codex/worktrees/m7-ui-96a-shape-sync`
- `git status --short --branch`: `## codex/m7-ui-96a-shape-sync...origin/codex/m7-ui-96a-stack-typecheck-cleanup`
- `git branch --show-current`: `codex/m7-ui-96a-shape-sync`

## Required Reads

Read before edits:

- `/Users/atilla/Applications/UZMAX智能运营/AGENTS.md`
- `docs/specs/M7-UI-96A-stack-typecheck-cleanup.md`
- `docs/specs/M7-UI-96C-jscpd-regression-guard.md`
- this evidence file
- `docs/evidence/M7/M7-UI-96C-jscpd-regression-guard.md`
- current PR #239 body

The shape-sync worker did not modify `package.json`, `.github/workflows/ci.yml`, `scripts/guards/**`, `scripts/tests/**`, `apps/admin/**`, package/lock/DB/runtime files or 96C implementation files.

## Current PR Shape

GitHub PR #239 currently reports 44 changed files relative to `codex/m7-ui-95-group-logs-default-visual-parity-refresh` after #240 / 96C was squash-merged into the #239 branch. The count increased from the prior 39-file knip shape because 96C adds the CI workflow integration, jscpd regression guard, focused guard test, 96C spec and 96C evidence while reusing the existing M7 evidence index path.

- config: 1
- source: 26
- test: 12
- docs: 5
- generated/lock/package/backend/API/DB/worker/cron: 0

The PR body is updated after validation to reflect this 44-file stack shape and the 96C stack-integration dependency. It still uses `large_change_exception` for the formatter/max-lines extraction churn and stack guard integration, and it does not claim UI/runtime acceptance.

## knip Reproduction And Cleanup

Baseline reproduction on PR head `2542d7728e4675654d4a7e1b6b001ab22f831c19`:

```sh
npm run knip
```

Result before edits: FAIL.

- Unused exports: `analyticsDimDefs`, `configStateCopy`, `BlindToggle`, `CaseCard`, `ScoreBadge`, `templateRuntimeLabels`, `ownerHtmlTenantColumns`, `tenantLogRuntimeLabels`, `tenantLogRows`, `allPermissions`, `tenantSections`.
- Unused exported types: `ConfigChannel`, `TemplateTone`, `QueueField`, `QueueDisplay`, `TeamMemberType`.

`rg` checks confirmed no cross-file references for those exported names. Local-only values/types kept their declarations and lost only the unnecessary `export` keyword. `ownerHtmlTenantColumns` had no internal or external references and was removed. No references were invented to silence `knip`.

Post-cleanup result:

```text
> uzmax-ai-ops@0.0.0 knip
> node node_modules/knip/bin/knip.js -c package.json#knip --no-progress --duration --no-config-hints --no-tag-hints

Total running time: 364ms
```

## Prior jscpd Reproduction

Bare `node`/`npm` are not available on this local shell. The clean-room worker used the existing Codex runtime `node` and a temporary worktree-local `node_modules` symlink to the previously installed dependency tree, then ran the exact `package.json` jscpd entrypoint:

```sh
node node_modules/jscpd/run-jscpd.js apps packages scripts --config jscpd.config.json --workers 1 --no-tips
```

Result on PR head `065c4e9d8a0bf63dcd38c33469d7cd6f366f67c4`: FAIL.

- files analyzed: 404
- clones found: 141
- duplicated lines: `2538 (2.79%)`
- duplicated tokens: `17547 (3.31%)`
- final error: `jscpd found too many duplicates (2.8%) over threshold (0.0%)`

Representative clone blocks involving PR #239 changed files:

- `apps/admin/src/pages/analytics/analyticsFallback.ts` vs `apps/admin/src/pages/config/configFallback.ts`
- `apps/admin/src/pages/group/GroupLogsPage.tsx` vs `apps/admin/src/pages/group/GroupTenantPage.tsx`
- `apps/admin/src/pages/group/GroupTemplateViews.tsx` vs `apps/admin/src/pages/group/GroupTenantViews.tsx`
- `apps/admin/tests/m7-ui-connection-center-source-parity.helpers.ts` vs `apps/admin/tests/m7-ui-tenant-management-source-parity.helpers.ts`
- `apps/admin/tests/m7-ui-connection-center-source-parity.helpers.ts` vs `apps/admin/tests/m7-ui-knowledge-resources-source-parity.helpers.ts`
- `apps/admin/tests/m7-ui-connection-center-source-parity.spec.ts` vs `apps/admin/tests/m7-ui-template-center-source-parity.spec.ts`
- `apps/admin/tests/m7-ui-group-logs-default-visual-parity.spec.ts` vs `apps/admin/tests/m7-ui-group-logs.spec.ts`

Representative clone blocks outside the approved #239 touch set:

- `apps/admin/tests/m7-ui-ai-members-default-visual-parity.spec.ts` vs `apps/admin/tests/m7-ui-ai-members.spec.ts`
- `apps/admin/tests/m7-ui-analytics-default-visual-parity.spec.ts` vs `apps/admin/tests/m7-ui-logs-default-visual-parity.spec.ts`
- `apps/admin/tests/m7-ui-ticket-default-visual-parity.spec.ts` vs `apps/admin/tests/m7-ui-ticket-source-parity.spec.ts`
- `apps/admin/tests/m7-ui-page-router.spec.ts` vs `apps/admin/tests/m7-ui-tenant-entry-visible-proof.spec.ts`

## Base Control

To distinguish PR-local duplication from pre-existing clone debt, the worker created a temporary read-only detached worktree at `/tmp/uzmax-m7-95-jscpd-base` for `origin/codex/m7-ui-95-group-logs-default-visual-parity-refresh`, used the same dependency symlink, and ran the same jscpd entrypoint.

Result on PR base `9dc45e89dfa0a6ee724d03cffd6d498c690ef8a6`: FAIL.

- files analyzed: 392
- clones found: 142
- duplicated lines: `2595 (2.92%)`
- duplicated tokens: `17808 (3.37%)`
- final error: `jscpd found too many duplicates (2.9%) over threshold (0.0%)`

Conclusion: full `npm run jscpd` / package-equivalent jscpd cannot be made pass by only consolidating the #239 helper/spec files. Even if all clone blocks involving PR #239 files were eliminated, the base branch still has many threshold-violating clone blocks outside this spec's touch modules.

## Prior jscpd Boundary

The previous worker stopped before jscpd code refactoring because a true full-repo `jscpd` pass would require one of the following out-of-scope actions:

- editing unrelated historic page/test files not listed in this spec's touch set;
- creating a broader shared test-helper cleanup across many existing M7 tests;
- changing `jscpd.config.json`, thresholds, ignore patterns or package scripts;
- adding jscpd ignore comments or equivalent disable mechanics.

All of those would violate the owner instruction, AGENTS/spec touch boundaries, or the explicit "do not change config/guard/CI/lock" constraint. This knip cleanup does not alter that jscpd boundary and does not claim full-repo jscpd green.

## Validation And Environment Notes

- PASS: PR #239 head matched expected `31a25cafb7a583bed0634b577c3819b1f7d06581` before worktree creation.
- PASS: shape-sync startup identity was recorded.
- PASS: committed plus worktree `guard:pr-shape` with ignored temp PR body `tmp/pr239-shape-sync-body.md`:
  - `npm run guard:pr-shape -- --base origin/codex/m7-ui-95-group-logs-default-visual-parity-refresh --pr-body-file tmp/pr239-shape-sync-body.md --include-worktree`
  - Output: `changedFiles: 44`, `categories: { config: 1, source: 26, test: 12, docs: 5 }`, `source.netLoc: 1887`, `source.newFiles: 9`.
- PASS: `npm run format:check`
  - Output: `All matched files use Prettier code style!`
- PASS: `git diff --check origin/codex/m7-ui-95-group-logs-default-visual-parity-refresh...HEAD`.
- PASS: worktree whitespace check: `git diff --check`.
- PASS: prettier-ignore boundary:
  - `npm run guard:prettier-ignore -- --base origin/codex/m7-ui-95-group-logs-default-visual-parity-refresh`
  - Output: `prettier-ignore-boundary: ok (8 baseline file(s), 89/89 marker(s))`.
- NOT RUN: implementation/runtime/UI tests, full Playwright, typecheck, lint, depcruise, knip or full jscpd in this shape-sync worker. This worker changes only spec/evidence/PR body metadata and does not edit implementation, workflow, guard, tests, app/admin, package/lock, DB or runtime files.

Environment notes:

- Literal `npm` is available in this shape-sync worktree by adding `/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin` to `PATH`.
- The first `npm run format:check` attempt failed before dependency setup because the new worktree had no `node_modules/.bin/prettier`; `npm ci` was run inside the isolated worktree, then `format:check` passed. No package/lockfile changes were made.
- The first `guard:pr-shape` attempt with absolute `/tmp/pr239-shape-sync-body.md` failed because the guard reads `--pr-body-file` via `path.join(process.cwd(), value)`. The same body was then copied to ignored worktree temp path `tmp/pr239-shape-sync-body.md`, and the required guard command passed with `--include-worktree`.

## Cleanup Status

Removed before final status:

- shape-sync local `node_modules` directory
- shape-sync ignored temp PR body `tmp/pr239-shape-sync-body.md`
- git-dir temp PR body copy
- any package-manager side effects if present

No generated build artifacts, Playwright reports, test-results, lockfile changes or temp PR body files are kept in the final commit.

## Required Next Step

Validate PR #239 CI after this shape metadata sync lands. Any remaining full-repo duplicate-debt policy question stays outside this shape-sync worker unless the owner/coordinator explicitly opens a separate cleanup/baseline decision.

## Remaining Non-Claims

- No whole-repo duplicate-debt cleanup is claimed by this shape-sync worker.
- No full CI pass is claimed until PR #239 CI reports it.
- No #238/#96 merge closure is claimed.
- No UI migration completion, owner visual acceptance, runtime closure, GA-0, production readiness or 1.0 release approval is claimed.
