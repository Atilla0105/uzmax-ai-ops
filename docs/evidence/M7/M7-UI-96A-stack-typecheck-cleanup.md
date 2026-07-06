# M7-UI-96A Stack CI Cleanup Evidence

## Status

`cleanup_candidate_pending_pr_review_stack_ci_unblock_only`

This branch fixes PR #239 stack CI blockers on top of `origin/codex/m7-ui-95-group-logs-default-visual-parity-refresh`: the existing #239 Playwright TypeScript fixes, the full-repo Prettier cleanup, the `guard:prettier-ignore` failure caused by baseline-external M7 page/source-parity files, and the follow-up CI `npm run lint` `max-lines` failure. It removes the M7 `prettier-ignore` markers, lets repo Prettier format those structures normally, and splits oversized files into adjacent semantic-preserving helpers.

This does not add visible UI, does not change runtime semantics/data/visible copy, and does not claim UI migration completion, owner visual acceptance, runtime closure, GA-0, production readiness or 1.0 release approval.

## Scope

- Spec: `docs/specs/M7-UI-96A-stack-typecheck-cleanup.md`
- PR: <https://github.com/Atilla0105/uzmax-ai-ops/pull/239>
- Base: `origin/codex/m7-ui-95-group-logs-default-visual-parity-refresh`
- Branch/worktree: `codex/m7-ui-96a-stack-typecheck-cleanup` / `/Users/atilla/.codex/worktrees/m7-ui-96a-stack-typecheck-cleanup`
- Current head before this worker's max-lines edits: `2da8fcde13c576d874cd4ea36413e2c1753f723b`

## Startup Evidence

- `pwd`: `/Users/atilla/.codex/worktrees/m7-ui-96a-stack-typecheck-cleanup`
- `git status --short --branch`: `## codex/m7-ui-96a-stack-typecheck-cleanup...origin/codex/m7-ui-96a-stack-typecheck-cleanup`
- `git branch --show-current`: `codex/m7-ui-96a-stack-typecheck-cleanup`
- `git rev-parse HEAD` before this worker's max-lines edits: `2da8fcde13c576d874cd4ea36413e2c1753f723b`
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

Reviewed the current CI `max-lines` targets and adjacent extraction ownership:

- `apps/admin/src/pages/config/ConfigPage.tsx`
- `apps/admin/src/pages/group/GroupTenantViews.tsx`
- `apps/admin/src/pages/knowledge/KnowledgeViews.tsx`
- `apps/admin/src/pages/knowledge/knowledgeFallback.ts`
- `apps/admin/src/pages/team/TeamDialogs.tsx`
- `apps/admin/src/pages/team/TeamViews.tsx`
- `apps/admin/src/pages/team/teamFallback.ts`
- `apps/admin/tests/m7-ui-config-source-parity.spec.ts`
- `apps/admin/tests/m7-ui-connection-center-source-parity.spec.ts`
- `apps/admin/tests/m7-ui-knowledge-resources-source-parity.spec.ts`
- `apps/admin/tests/m7-ui-tenant-management-source-parity.spec.ts`

`rg --files apps/admin/src/pages/config apps/admin/src/pages/team apps/admin/src/pages/knowledge apps/admin/src/pages/group` confirmed the extraction belongs beside the existing page/view/fallback files. `rg -n "MemberDrawer|RoleDeleteConfirm|TeamRolesTab|TeamStatePanel|TenantHtmlTable|KnowledgeToolbar|KnowledgeAssetDetail|sectionViews|LocalConfirm|RuntimeNote|Toast"` confirmed the moved helpers have single local page-stack ownership and are not shared cross-feature primitives.

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
- Split oversized config/group/knowledge/team page files into adjacent helper/component/state files without changing route IDs, visible copy, fallback data, tokens, local-only behavior, hidden runtime-boundary evidence or test assertion intent.
- Split oversized source-parity Playwright files into adjacent `.helpers.ts` files while preserving the same locators, metric extraction and assertion coverage.
- Updated this spec/evidence and the M7 README entry so #239 accurately describes stack `prettier-ignore` cleanup, formatter-only churn, changed files, validation commands and non-claims.

No prettier-ignore guard baseline was changed. No tests were deleted, skipped, marked only, weakened or broadened through mocks.

New adjacent helper files for max-lines cleanup:

- `apps/admin/src/pages/config/ConfigConfirm.tsx`
- `apps/admin/src/pages/config/ConfigInputs.tsx`
- `apps/admin/src/pages/config/ConfigSections.tsx`
- `apps/admin/src/pages/group/GroupTenantTable.tsx`
- `apps/admin/src/pages/knowledge/KnowledgeControls.tsx`
- `apps/admin/src/pages/team/TeamMemberDrawer.tsx`
- `apps/admin/src/pages/team/TeamRoleViews.tsx`
- `apps/admin/src/pages/team/useTeamPageState.ts`
- `apps/admin/tests/m7-ui-config-source-parity.helpers.ts`
- `apps/admin/tests/m7-ui-connection-center-source-parity.helpers.ts`
- `apps/admin/tests/m7-ui-knowledge-resources-source-parity.helpers.ts`
- `apps/admin/tests/m7-ui-tenant-management-source-parity.helpers.ts`

## Formatter Churn Note

Removing `prettier-ignore` from compressed page/test structures creates a large formatter diff, and the follow-up max-lines cleanup adds adjacent helper files so lint can pass without disabling rules. This is expected for the requested cleanup. It is not a semantic source expansion and does not add runtime behavior, data, visible copy or UI acceptance claims.

PR #239 must record `large_change_exception` in PR Hygiene metadata if committed source net LOC, changed source file count or new source file count exceeds the default `guard:pr-shape` source budget. That exception is formatter/max-lines-extraction-only and still requires owner review.

## Validation

Validation status: `PASS_LOCAL_VALIDATION_BEFORE_PUSH`.

Environment notes:

- Default shell has no bare `node`; validation used the Codex runtime PATH prefix.
- Bare `npm run lint` is unavailable in this local runtime because `npm` is not installed on PATH; validation therefore ran the exact `package.json` find/xargs ESLint entrypoint.
- A temporary worktree-local `node_modules` symlink to `/Users/atilla/.codex/worktrees/m7-ui-64-ticket-source-parity-refresh/node_modules` was used for direct Node validation and removed before final status.

Completed validation:

- PASS: max-lines cleanup line counts after Prettier:
  - `wc -l` on the former failing files and new helpers.
  - Results include `ConfigPage.tsx` 227, `GroupTenantViews.tsx` 230, `KnowledgeViews.tsx` 221, `knowledgeFallback.ts` 330, `TeamDialogs.tsx` 244, `TeamViews.tsx` 182, `teamFallback.ts` 331, and all edited Playwright spec/helper files under 400.
- PASS: full-repo Prettier with repo dependency version:
  - `node node_modules/prettier/bin/prettier.cjs --check .`
  - Output: `All matched files use Prettier code style!`
- PASS: prettier-ignore boundary:
  - `node scripts/guards/prettier-ignore-boundary.mjs --base origin/codex/m7-ui-95-group-logs-default-visual-parity-refresh`
  - Output: `prettier-ignore-boundary: ok (8 baseline file(s), 89/89 marker(s))` and monitored diff check ok.
- FAIL / unavailable: requested local lint command:
  - `npm run lint`
  - Result: `env: npm: No such file or directory`.
- PASS: repo `npm run lint` equivalent from `package.json`:
  - `find apps packages scripts -path '*/node_modules' -prune -o -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.mjs" -o -name "*.cjs" \) -print0 | xargs -0 node node_modules/eslint/bin/eslint.js eslint.config.mjs dependency-cruiser.config.cjs playwright.config.ts`
- PASS: repo-equivalent TypeScript check after max-lines extraction:
  - `node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json --pretty false`
- PASS: whitespace diff check:
  - `git diff --check origin/codex/m7-ui-95-group-logs-default-visual-parity-refresh`
- PASS with local pre-commit reporting limitation: PR-shape using PR #239 metadata:
  - Read-only GitHub API confirmed PR #239 body fields: `Spec ID: M7-UI-96A-stack-typecheck-cleanup`, `Spec file: docs/specs/M7-UI-96A-stack-typecheck-cleanup.md`, `Exception: large_change_exception`, `External API evidence: none`.
  - `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-95-group-logs-default-visual-parity-refresh --pr-body-file .pr239-body.tmp.md`
  - Output before commit: `changedFiles: 19`, `categories: { source: 9, test: 7, docs: 3 }`, `source.netLoc: 1538`, `source.newFiles: 0`.
  - Note: this guard reads `base...HEAD`; before commit it does not include the staged adjacent helper additions. The true staged PR shape below records the complete current diff and CI/post-commit guard will recalculate from HEAD.
- PASS: post-commit PR-shape using PR #239 metadata:
  - `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-95-group-logs-default-visual-parity-refresh --pr-body-file .pr239-body.tmp.md`
  - Output after commit: `changedFiles: 34`, `categories: { source: 20, test: 11, docs: 3 }`, `source.netLoc: 1582`, `source.newFiles: 8`.
- PASS: staged diff shape after max-lines helper extraction:
  - `git diff --cached --name-status origin/codex/m7-ui-95-group-logs-default-visual-parity-refresh`
  - Changed files: `34`; categories: source `20`, test `11`, docs `3`; source new files `8`; source net LOC `1582`; test new files `4`.
- PASS: admin build:
  - `node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir`
  - Existing warning only: Vite reported one chunk larger than 500 kB after minification.
- PASS: focused Playwright with manual preview on `127.0.0.1:4173`:
  - Server: `node node_modules/vite/bin/vite.js preview apps/admin --host 127.0.0.1 --port 4173`
  - Command: `PLAYWRIGHT_TEST_BASE_URL=http://127.0.0.1:4173 node node_modules/@playwright/test/cli.js test apps/admin/tests/m7-ui-group-logs.spec.ts apps/admin/tests/m7-ui-group-logs-source-parity.spec.ts apps/admin/tests/m7-ui-group-logs-default-visual-parity.spec.ts apps/admin/tests/m7-ui-orders-source-parity.spec.ts apps/admin/tests/m7-ui-config-source-parity.spec.ts apps/admin/tests/m7-ui-config-default-visual-parity.spec.ts apps/admin/tests/m7-ui-connection-center-source-parity.spec.ts apps/admin/tests/m7-ui-connection-center-default-visual-parity.spec.ts apps/admin/tests/m7-ui-knowledge-resources-default-visual-parity.spec.ts apps/admin/tests/m7-ui-knowledge-resources-source-parity.spec.ts apps/admin/tests/m7-ui-template-center-source-parity.spec.ts apps/admin/tests/m7-ui-template-center-default-visual-parity.spec.ts apps/admin/tests/m7-ui-tenant-management-source-parity.spec.ts apps/admin/tests/m7-ui-tenant-management-default-visual-parity.spec.ts apps/admin/tests/m7-ui-team-source-parity.spec.ts apps/admin/tests/m7-ui-team-default-visual-parity.spec.ts`
  - Result: `21 passed (5.2s)`.

Because committed source counts exceed default `guard:pr-shape` source budgets, PR #239 keeps `Exception: large_change_exception` in PR Hygiene metadata. This exception is limited to formatter/max-lines extraction churn and still requires owner review.

## Cleanup Status

Temporary validation artifacts removed before final commit/status:

- `node_modules` symlink if created
- `apps/admin/dist`
- `test-results`
- `playwright-report`
- `.pr239-body.tmp.md`

## Remaining Non-Claims

- This is a stack CI unblock cleanup only.
- It does not create a #96B PR or evidence entry.
- It does not claim #238/#96 merge closure.
- It does not claim UI migration completion, owner visual acceptance, runtime closure, GA-0, production readiness or 1.0 release approval.
