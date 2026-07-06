# M7-UI-96A Stack CI Cleanup Evidence

## Status

`cleanup_candidate_pending_pr_review_stack_ci_unblock_only`

This branch fixes PR #239 stack CI blockers on top of `origin/codex/m7-ui-95-group-logs-default-visual-parity-refresh`: the existing #239 Playwright TypeScript fixes, the full-repo Prettier cleanup, and the new `guard:prettier-ignore` failure caused by baseline-external M7 page/source-parity files. It removes the M7 `prettier-ignore` markers and lets repo Prettier format those structures normally.

This does not add visible UI, does not change runtime semantics/data/visible copy, and does not claim UI migration completion, owner visual acceptance, runtime closure, GA-0, production readiness or 1.0 release approval.

## Scope

- Spec: `docs/specs/M7-UI-96A-stack-typecheck-cleanup.md`
- PR: <https://github.com/Atilla0105/uzmax-ai-ops/pull/239>
- Base: `origin/codex/m7-ui-95-group-logs-default-visual-parity-refresh`
- Branch/worktree: `codex/m7-ui-96a-stack-typecheck-cleanup` / `/Users/atilla/.codex/worktrees/m7-ui-96a-stack-typecheck-cleanup`
- Current head before this worker's edits: `4aeea5b8ba1d36b3e1650ae4ad5f5c028f621074`

## Startup Evidence

- `pwd`: `/Users/atilla/.codex/worktrees/m7-ui-96a-stack-typecheck-cleanup`
- `git status --short --branch`: `## codex/m7-ui-96a-stack-typecheck-cleanup...origin/codex/m7-ui-96a-stack-typecheck-cleanup`
- `git branch --show-current`: `codex/m7-ui-96a-stack-typecheck-cleanup`
- `git rev-parse HEAD` before this worker's edits: `4aeea5b8ba1d36b3e1650ae4ad5f5c028f621074`
- Root/main checkout at `/Users/atilla/Applications/UZMAX智能运营` was read for `AGENTS.md` only and was not used for code edits.

## Source Review

Read before edits:

- `/Users/atilla/Applications/UZMAX智能运营/AGENTS.md`
- `docs/specs/M7-UI-96A-stack-typecheck-cleanup.md`
- this evidence file
- `PRODUCT.md`
- `DESIGN.md`
- `docs/admin-design-system.md`
- `docs/specs/M7-UI-95-group-logs-default-visual-parity-refresh.md`
- `docs/specs/M7-UI-66-orders-source-parity-refresh.md`
- `docs/evidence/M7/M7-UI-95-group-logs-default-visual-parity-refresh.md`
- `docs/evidence/M7/README.md`
- v1.1 product/admin/architecture/acceptance boundary excerpts for release non-claims.

Reviewed the current baseline-external prettier-ignore targets:

- `apps/admin/src/pages/config/ConfigPage.tsx`
- `apps/admin/src/pages/config/configFallback.ts`
- `apps/admin/src/pages/group/GroupTenantViews.tsx`
- `apps/admin/src/pages/group/groupTenantFallback.ts`
- `apps/admin/src/pages/knowledge/KnowledgeViews.tsx`
- `apps/admin/src/pages/knowledge/knowledgeFallback.ts`
- `apps/admin/src/pages/team/TeamDialogs.tsx`
- `apps/admin/src/pages/team/TeamViews.tsx`
- `apps/admin/src/pages/team/teamFallback.ts`
- `apps/admin/tests/m7-ui-config-source-parity.spec.ts`
- `apps/admin/tests/m7-ui-connection-center-source-parity.spec.ts`
- `apps/admin/tests/m7-ui-knowledge-resources-source-parity.spec.ts`
- `apps/admin/tests/m7-ui-template-center-source-parity.spec.ts`
- `apps/admin/tests/m7-ui-tenant-management-source-parity.spec.ts`

## Reproduction

Command:

```sh
env PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node scripts/guards/prettier-ignore-boundary.mjs --base origin/codex/m7-ui-95-group-logs-default-visual-parity-refresh
```

Result before cleanup: FAIL.

Reported files:

- `apps/admin/src/pages/config/ConfigPage.tsx` (11)
- `apps/admin/src/pages/config/configFallback.ts` (7)
- `apps/admin/src/pages/group/GroupTenantViews.tsx` (3)
- `apps/admin/src/pages/group/groupTenantFallback.ts` (1)
- `apps/admin/src/pages/knowledge/KnowledgeViews.tsx` (1)
- `apps/admin/src/pages/knowledge/knowledgeFallback.ts` (5)
- `apps/admin/src/pages/team/TeamDialogs.tsx` (6)
- `apps/admin/src/pages/team/TeamViews.tsx` (7)
- `apps/admin/src/pages/team/teamFallback.ts` (6)
- `apps/admin/tests/m7-ui-config-source-parity.spec.ts` (9)
- `apps/admin/tests/m7-ui-connection-center-source-parity.spec.ts` (3)
- `apps/admin/tests/m7-ui-knowledge-resources-source-parity.spec.ts` (1)
- `apps/admin/tests/m7-ui-template-center-source-parity.spec.ts` (1)
- `apps/admin/tests/m7-ui-tenant-management-source-parity.spec.ts` (3)
- total count `153`, allowed `89`

## Cleanup Changes

- Removed only `// prettier-ignore` markers from the listed baseline-external M7 source/test files.
- Ran Prettier on those files so arrays, object literals, type aliases, JSX helpers and Playwright metrics are formatted by the repo formatter.
- Kept existing #239 group-logs/orders TypeScript fixes intact.
- Updated this spec/evidence and the M7 README entry so #239 accurately describes stack `prettier-ignore` cleanup, formatter-only churn, changed files, validation commands and non-claims.

No prettier-ignore guard baseline was changed. No tests were deleted, skipped, marked only, weakened or broadened through mocks.

## Formatter Churn Note

Removing `prettier-ignore` from compressed page/test structures creates a large formatter-only diff. This is expected for the requested cleanup. It is not a semantic source expansion and does not add runtime behavior, data, visible copy or UI acceptance claims.

PR #239 must record `large_change_exception` in PR Hygiene metadata if committed source net LOC exceeds the default `guard:pr-shape` source budget. That exception is formatter-churn-only and still requires owner review.

## Validation

Validation status: `PASS_WITH_NOTED_PNPM_WORKSPACE_MISMATCH`.

Environment notes:

- Default shell has no bare `node`; validation used the Codex runtime PATH prefix.
- This repo declares npm workspaces in `package.json`, not `pnpm-workspace.yaml`. `pnpm exec` / `pnpm --filter` attempted to auto-install pnpm dependencies and is not the stable project-equivalent path in this checkout.
- A temporary worktree-local `node_modules` symlink to `/Users/atilla/.codex/worktrees/m7-ui-64-ticket-source-parity-refresh/node_modules` was used for direct Node validation, then removed before final status.
- The brief pnpm auto-install side effect against the symlink target was restored: dependency entry versions returned to Prettier `3.8.4`, TypeScript `6.0.3`, Vite `8.0.16` and Playwright `1.60.0`; generated pnpm files were removed.

Completed validation:

- PASS: whitespace diff check:
  - `git diff --check origin/codex/m7-ui-95-group-logs-default-visual-parity-refresh`
- FAIL / not project-equivalent: requested pnpm format command:
  - `pnpm exec prettier --check .`
  - Result: pnpm warned that npm `workspaces` are unsupported without `pnpm-workspace.yaml`, auto-installed Prettier `3.9.4`, then reported 22 unrelated baseline format warnings including `apps/admin/src/M4CustomerAssetRuntimeState.tsx`, `apps/api/src/*`, `packages/*` and `pnpm-lock.yaml`.
  - Action: restored dependency side effects and used the repo-equivalent locked Prettier command below.
- PASS: full-repo Prettier with repo dependency version:
  - `node node_modules/prettier/bin/prettier.cjs --check .`
  - Output: `All matched files use Prettier code style!`
- PASS: prettier-ignore boundary:
  - `node scripts/guards/prettier-ignore-boundary.mjs --base origin/codex/m7-ui-95-group-logs-default-visual-parity-refresh`
  - Output: `prettier-ignore-boundary: ok (8 baseline file(s), 89/89 marker(s))`
- PASS: pre-commit scope guard with expanded spec and worktree included:
  - `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-95-group-logs-default-visual-parity-refresh --spec docs/specs/M7-UI-96A-stack-typecheck-cleanup.md --include-worktree`
  - Output: `changedFiles: 19`, `categories: { source: 9, test: 7, docs: 3 }`, `source.changedFiles: 9`, `source.newFiles: 0`
- PASS: post-commit CI-equivalent scope guard using PR #239 body metadata:
  - `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-95-group-logs-default-visual-parity-refresh --pr-body-file .pr239-body.tmp.md`
  - Output: `changedFiles: 19`, `categories: { source: 9, test: 7, docs: 3 }`, `source.netLoc: 1538`, `source.newFiles: 0`
- FAIL / unavailable: requested admin package typecheck command:
  - `pnpm --filter @uzmax/admin typecheck`
  - Result: `ERR_PNPM_RECURSIVE_RUN_NO_SCRIPT`; `apps/admin/package.json` has no `typecheck` script. The pnpm workspace mismatch also triggered auto-install side effects, which were restored.
- PASS: repo-equivalent TypeScript check:
  - `node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json`
- PASS: admin build:
  - `node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir`
  - Existing warning only: Vite reported one chunk larger than 500 kB after minification.
- PASS: focused Playwright with manual preview on `127.0.0.1:4173`:
  - Server: `node node_modules/vite/bin/vite.js preview apps/admin --host 127.0.0.1 --port 4173`
  - Command: `PLAYWRIGHT_TEST_BASE_URL=http://127.0.0.1:4173 node node_modules/@playwright/test/cli.js test apps/admin/tests/m7-ui-group-logs.spec.ts apps/admin/tests/m7-ui-group-logs-source-parity.spec.ts apps/admin/tests/m7-ui-group-logs-default-visual-parity.spec.ts apps/admin/tests/m7-ui-orders-source-parity.spec.ts apps/admin/tests/m7-ui-config-source-parity.spec.ts apps/admin/tests/m7-ui-config-default-visual-parity.spec.ts apps/admin/tests/m7-ui-connection-center-source-parity.spec.ts apps/admin/tests/m7-ui-connection-center-default-visual-parity.spec.ts apps/admin/tests/m7-ui-knowledge-resources-default-visual-parity.spec.ts apps/admin/tests/m7-ui-knowledge-resources-source-parity.spec.ts apps/admin/tests/m7-ui-template-center-source-parity.spec.ts apps/admin/tests/m7-ui-template-center-default-visual-parity.spec.ts apps/admin/tests/m7-ui-tenant-management-source-parity.spec.ts apps/admin/tests/m7-ui-tenant-management-default-visual-parity.spec.ts apps/admin/tests/m7-ui-team-source-parity.spec.ts apps/admin/tests/m7-ui-team-default-visual-parity.spec.ts`
  - Result: `21 passed (4.8s)`

Final diff summary before commit:

- Changed files: 19
- Path classification: source 9, test 7, docs 3
- Source net LOC: 1538 formatter-only
- Gross churn: 2571
- New source files: 0

Because committed source net LOC exceeds the default `guard:pr-shape` 600 LOC budget, PR #239 metadata was updated from `Exception: none` to `Exception: large_change_exception` with a formatter-only rationale before CI re-runs.

## Cleanup Status

Before final commit/status, remove temporary validation artifacts:

- `node_modules` symlink if created
- `apps/admin/dist`
- `test-results`
- `playwright-report`

## Remaining Non-Claims

- This is a stack CI unblock cleanup only.
- It does not create a #96B PR or evidence entry.
- It does not claim #238/#96 merge closure.
- It does not claim UI migration completion, owner visual acceptance, runtime closure, GA-0, production readiness or 1.0 release approval.
