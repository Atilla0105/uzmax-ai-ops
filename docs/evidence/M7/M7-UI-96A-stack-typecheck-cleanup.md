# M7-UI-96A Stack CI Cleanup Evidence

## Status

`knip_cleanup_ready_for_ci`

PR #239 / branch `codex/m7-ui-96a-stack-typecheck-cleanup` received a 2026-07-06 clean-room `knip` cleanup on top of remote head `2542d7728e4675654d4a7e1b6b001ab22f831c19`. The worker reproduced the exact `npm run knip` unused export/type blocker, confirmed every symbol with `rg`, then removed unnecessary `export` keywords for local-only values/types and deleted one truly unused tenant-column constant.

This evidence sync does not add visible UI, does not change runtime semantics/data/visible copy, does not weaken `knip`, does not delete tests, and does not claim UI migration completion, owner visual acceptance, runtime closure, GA-0, production readiness or 1.0 release approval.

The prior clean-room `jscpd` finding remains recorded below as boundary evidence: full-repo jscpd was base-wide clone debt at that time and is not claimed green by this knip-only cleanup. The current validation set for this worker follows the coordinator instruction and excludes full Playwright/jscpd because this change is export-only cleanup.

## Scope

- Spec: `docs/specs/M7-UI-96A-stack-typecheck-cleanup.md`
- PR: <https://github.com/Atilla0105/uzmax-ai-ops/pull/239>
- PR base: `codex/m7-ui-95-group-logs-default-visual-parity-refresh` / `9dc45e89dfa0a6ee724d03cffd6d498c690ef8a6`
- PR head before this worker: `2542d7728e4675654d4a7e1b6b001ab22f831c19`
- Clean-room worktree: `/Users/atilla/.codex/worktrees/m7-ui-96a-knip-cleanroom`
- Clean-room branch: `codex/m7-ui-96a-knip-cleanroom`
- Forbidden worktree not edited: `/Users/atilla/.codex/worktrees/m7-ui-96a-stack-typecheck-cleanup`
- Root/main checkout: `/Users/atilla/Applications/UZMAX智能运营` was read for `AGENTS.md` only.

## Startup Evidence

- Remote head check: `git ls-remote origin refs/heads/codex/m7-ui-96a-stack-typecheck-cleanup` returned `2542d7728e4675654d4a7e1b6b001ab22f831c19`.
- `pwd`: `/Users/atilla/.codex/worktrees/m7-ui-96a-knip-cleanroom`
- `git status --short --branch`: `## codex/m7-ui-96a-knip-cleanroom...origin/codex/m7-ui-96a-stack-typecheck-cleanup`
- `git branch --show-current`: `codex/m7-ui-96a-knip-cleanroom`

## Required Reads

Read before edits:

- `/Users/atilla/Applications/UZMAX智能运营/AGENTS.md`
- `docs/specs/M7-UI-96A-stack-typecheck-cleanup.md`
- this evidence file
- `package.json#knip`

`package.json#knip` was read-only and was not modified. It keeps the same entry/project/workspace configuration and ignores only `apps/admin/dist/**`.

## Current PR Shape

GitHub PR #239 currently reports 39 changed files relative to `codex/m7-ui-95-group-logs-default-visual-parity-refresh` after this knip cleanup. The count increased from 34 because `knip` exposed five local-only source files outside the prior #239 diff: analytics fallback, eval views, group template fallback, logs fallback and queue fallback.

- source: 25
- test: 11
- docs: 3
- generated/lock/config/package/CI/backend/API/DB/worker/cron: 0

The PR body is updated after validation to reflect this 39-file shape and the knip cleanup. It still uses `large_change_exception` for the pre-existing formatter/max-lines extraction churn and does not claim UI/runtime acceptance.

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

- PASS: remote head matched expected `2542d7728e4675654d4a7e1b6b001ab22f831c19` before worktree creation.
- PASS: clean-room startup identity was recorded.
- PASS: `npm run knip` reproduced the unused export/type blocker before edits.
- PASS: `rg` confirmed every reported symbol before edits.
- PASS: `npm run knip` passed after local-only de-export cleanup.
- PASS: `npm run format:check`
  - Output: `All matched files use Prettier code style!`
- PASS: prettier-ignore boundary:
  - `npm run guard:prettier-ignore -- --base origin/codex/m7-ui-95-group-logs-default-visual-parity-refresh`
  - Output: `prettier-ignore-boundary: ok (8 baseline file(s), 89/89 marker(s))`.
- PASS: `npm run typecheck`
- PASS: `npm run lint`
- PASS: `npm run depcruise`
  - Output: `no dependency violations found (312 modules, 386 dependencies cruised)`.
- PASS: committed `guard:pr-shape` with `.pr239-body.tmp.md`:
  - `npm run guard:pr-shape -- --base origin/codex/m7-ui-95-group-logs-default-visual-parity-refresh --pr-body-file .pr239-body.tmp.md`
  - Output: `changedFiles: 39`, `categories: { source: 25, test: 11, docs: 3 }`, `source.netLoc: 1570`, `source.newFiles: 8`.
- PASS: `npm run build:admin`
  - Existing warning only: Vite reported one chunk larger than 500 kB after minification.
- PASS: `git diff --check origin/codex/m7-ui-95-group-logs-default-visual-parity-refresh...HEAD` plus worktree whitespace check before commit.
- NOT RUN: full Playwright and jscpd. Full Playwright was skipped because the edits only remove unused exports/types and one unused local declaration; no rendered behavior, visible copy, interaction, data shape, route or test assertion changed. jscpd remains the prior boundary evidence above and is not claimed green by this worker.

Literal `npm` is available in this clean-room run by adding `/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin` to `PATH`; no package manager or lockfile changes were committed.

## Cleanup Status

Removed before final status:

- clean-room local `node_modules` directory
- clean-room `apps/admin/dist`
- clean-room `.pr239-body.tmp.md`
- any Playwright/test output folders if present
- any lockfile/package-manager side effects if present

No generated build artifacts, Playwright reports, test-results, lockfile changes or temp PR body files are kept in the final commit.

## Required Next Step

Validate PR #239 CI after the knip cleanup lands. Any remaining full-repo jscpd policy question stays outside this knip-only worker unless the owner/coordinator explicitly opens a separate cleanup/baseline decision.

## Remaining Non-Claims

- No jscpd pass is claimed by this knip worker.
- No full CI pass is claimed until PR #239 CI reports it.
- No #238/#96 merge closure is claimed.
- No UI migration completion, owner visual acceptance, runtime closure, GA-0, production readiness or 1.0 release approval is claimed.
