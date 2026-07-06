# M7-UI-96A Stack CI Cleanup Evidence

## Status

`blocked_base_wide_jscpd_clone_debt`

PR #239 / branch `codex/m7-ui-96a-stack-typecheck-cleanup` is no longer accurately described as a jscpd-clean CI unblock. A 2026-07-06 clean-room worker reproduced `jscpd` on the current remote head and proved the full-repo jscpd threshold cannot be made green inside this spec's approved #239 touch set: the PR base branch itself fails the same jscpd scan, and many remaining clone blocks do not involve PR #239 changed files.

This evidence sync does not add visible UI, does not change runtime semantics/data/visible copy, and does not claim UI migration completion, owner visual acceptance, runtime closure, GA-0, production readiness or 1.0 release approval.

## Scope

- Spec: `docs/specs/M7-UI-96A-stack-typecheck-cleanup.md`
- PR: <https://github.com/Atilla0105/uzmax-ai-ops/pull/239>
- PR base: `codex/m7-ui-95-group-logs-default-visual-parity-refresh` / `9dc45e89dfa0a6ee724d03cffd6d498c690ef8a6`
- PR head before this worker: `065c4e9d8a0bf63dcd38c33469d7cd6f366f67c4`
- Clean-room worktree: `/Users/atilla/.codex/worktrees/m7-ui-96a-jscpd-cleanroom`
- Clean-room branch: `codex/m7-ui-96a-jscpd-cleanroom`
- Forbidden worktree not edited: `/Users/atilla/.codex/worktrees/m7-ui-96a-stack-typecheck-cleanup`
- Root/main checkout: `/Users/atilla/Applications/UZMAX智能运营` was read for `AGENTS.md` only.

## Startup Evidence

- Remote head check: `git ls-remote origin refs/heads/codex/m7-ui-96a-stack-typecheck-cleanup` returned `065c4e9d8a0bf63dcd38c33469d7cd6f366f67c4`.
- `pwd`: `/Users/atilla/.codex/worktrees/m7-ui-96a-jscpd-cleanroom`
- `git status --short --branch`: `## codex/m7-ui-96a-jscpd-cleanroom...origin/codex/m7-ui-96a-stack-typecheck-cleanup`
- `git branch --show-current`: `codex/m7-ui-96a-jscpd-cleanroom`

## Required Reads

Read before edits:

- `/Users/atilla/Applications/UZMAX智能运营/AGENTS.md`
- `docs/specs/M7-UI-96A-stack-typecheck-cleanup.md`
- this evidence file
- `jscpd.config.json`

`jscpd.config.json` was read-only and was not modified. It keeps `threshold: 0`, ignores `docs/**` and Markdown, and scans `apps packages scripts` through the package script.

## Current PR Shape

GitHub PR #239 currently reports 34 changed files relative to `codex/m7-ui-95-group-logs-default-visual-parity-refresh`, not the stale 19-file count still present in the older PR body.

- source: 20
- test: 11
- docs: 3
- generated/lock/config/package/CI/backend/API/DB/worker/cron: 0

The current PR body before this worker still described the older 19-file shape and did not include the jscpd reproduction/base-wide blocker.

## jscpd Reproduction

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

## Blocker Decision

The worker stopped before code refactoring because a true full-repo `jscpd` pass would require one of the following out-of-scope actions:

- editing unrelated historic page/test files not listed in this spec's touch set;
- creating a broader shared test-helper cleanup across many existing M7 tests;
- changing `jscpd.config.json`, thresholds, ignore patterns or package scripts;
- adding jscpd ignore comments or equivalent disable mechanics.

All of those would violate the current owner instruction, AGENTS/spec touch boundaries, or the explicit "do not change config/guard/CI/lock" constraint. The accurate status is therefore `BLOCKED`, not `DONE`.

## Validation And Environment Notes

- PASS: remote head matched expected `065c4e9d8a0bf63dcd38c33469d7cd6f366f67c4` before worktree creation.
- PASS: clean-room startup identity was recorded.
- PASS: direct format check with locked dependency:
  - `node node_modules/prettier/bin/prettier.cjs --check .`
  - Output: `All matched files use Prettier code style!`
- PASS: prettier-ignore boundary:
  - `node scripts/guards/prettier-ignore-boundary.mjs --base origin/codex/m7-ui-95-group-logs-default-visual-parity-refresh`
  - Output: `prettier-ignore-boundary: ok (8 baseline file(s), 89/89 marker(s))`.
- PASS: PR-shape using the updated PR #239 body metadata:
  - `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-95-group-logs-default-visual-parity-refresh --pr-body-file .pr239-body.tmp.md`
  - Output: `changedFiles: 34`, `categories: { source: 20, test: 11, docs: 3 }`, `source.netLoc: 1582`, `source.newFiles: 8`.
- PASS: direct repo typecheck:
  - `node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json`
- PASS: direct repo lint entrypoint:
  - `find apps packages scripts ... | xargs -0 node node_modules/eslint/bin/eslint.js eslint.config.mjs dependency-cruiser.config.cjs playwright.config.ts`
- PASS: direct depcruise:
  - `node node_modules/dependency-cruiser/bin/dependency-cruise.mjs apps packages --config dependency-cruiser.config.cjs`
  - Output: `no dependency violations found (312 modules, 386 dependencies cruised)`.
- PASS: direct admin build:
  - `node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir`
  - Existing warning only: Vite reported one chunk larger than 500 kB after minification.
- FAIL: PR-head jscpd exact package entrypoint, with `141` clones / `2.79%` duplicated lines.
- FAIL: PR-base jscpd exact package entrypoint, with `142` clones / `2.92%` duplicated lines.
- FAIL / unavailable: local `npm run jscpd` cannot run literally because `npm` is not present on PATH.
- FAIL / not project-equivalent: `pnpm run jscpd` invokes the same script but auto-installs pnpm-managed dependencies and is not a valid npm-workspace validation path here. Its dependency side effects were removed/restored.

Because the blocker occurs before a legitimate in-scope code fix exists, Playwright was not rerun for this docs-only blocker sync. The already-known CI state for `065c4e9` remains: format, prettier-ignore guard, typecheck, lint and depcruise passed on GitHub Actions; jscpd failed.

## Cleanup Status

Removed before final status:

- clean-room `node_modules` symlink
- clean-room `pnpm-lock.yaml`
- temporary base worktree `/tmp/uzmax-m7-95-jscpd-base`
- temporary base worktree `node_modules` symlink
- pnpm dependency side effects in the borrowed dependency tree, including `.ignored`, `.pnpm`, `.modules.yaml` and `.pnpm-workspace-state-v1.json`

No source/test/runtime files were edited by this clean-room worker.

## Required Next Step

Owner/coordinator needs to choose one of:

- open a separate jscpd cleanup spec that explicitly covers the existing M7 test/page clone families; or
- approve a jscpd baseline/config strategy; or
- accept that PR #239 cannot pass full `npm run jscpd` under the current threshold and scope.

This #96A worker must not silently expand into a global jscpd rewrite.

## Remaining Non-Claims

- No jscpd pass is claimed.
- No full CI pass is claimed.
- No #238/#96 merge closure is claimed.
- No UI migration completion, owner visual acceptance, runtime closure, GA-0, production readiness or 1.0 release approval is claimed.
