# M7-UI-96A Stack CI Cleanup Evidence

## Status

`playwright_ci_boundary_ready_for_ci`

PR #239 / branch `codex/m7-ui-96a-stack-typecheck-cleanup` received a 2026-07-06 Playwright CI/test-boundary fix on top of remote head `97be8acac635e912de6fdf07c70077b12f473781`. #240 / M7-UI-96C was already squash-merged into this #239 branch as a stack-integration dependency, and the #239 spec/PR body now declare the real 46-file stack diff relative to `origin/codex/m7-ui-95-group-logs-default-visual-parity-refresh`.

This worker adds a CI-only Playwright split for tests that require owner-local paths and a one-line AppShell legacy selector containment for the tablet `openLegacyEvidence()` failure. It does not edit `.github/workflows/ci.yml`, `scripts/guards/**`, `scripts/tests/**`, package/lock/DB/runtime files, does not weaken guards, does not delete tests, does not add `.skip`/`.only`/`xit`/`xfail`, does not fake owner source fixtures, and does not claim UI migration completion, owner visual acceptance, runtime closure, GA-0, production readiness or 1.0 release approval.

The prior clean-room `jscpd` finding remains recorded below as boundary evidence. The current #239 CI path now uses the already-merged 96C jscpd regression guard; this worker only adds the Playwright CI/local-owner-source boundary and the proven tablet shell compatibility containment.

## Scope

- Spec: `docs/specs/M7-UI-96A-stack-typecheck-cleanup.md`
- PR: <https://github.com/Atilla0105/uzmax-ai-ops/pull/239>
- PR base: `codex/m7-ui-95-group-logs-default-visual-parity-refresh` / `9dc45e89dfa0a6ee724d03cffd6d498c690ef8a6`
- PR head before this worker: `97be8acac635e912de6fdf07c70077b12f473781`
- Playwright CI boundary worktree: `/Users/atilla/.codex/worktrees/m7-ui-96a-playwright-ci-boundary`
- Playwright CI boundary branch: `codex/m7-ui-96a-playwright-ci-boundary`
- Push target: `origin/codex/m7-ui-96a-stack-typecheck-cleanup`
- Root/main checkout: `/Users/atilla/Applications/UZMAX智能运营` was read only and was not used for edits.

## Startup Evidence

- GitHub PR #239 head check returned `97be8acac635e912de6fdf07c70077b12f473781`.
- `pwd`: `/Users/atilla/.codex/worktrees/m7-ui-96a-playwright-ci-boundary`
- `git status --short --branch`: `## codex/m7-ui-96a-playwright-ci-boundary...origin/codex/m7-ui-96a-stack-typecheck-cleanup`
- `git branch --show-current`: `codex/m7-ui-96a-playwright-ci-boundary`

## Required Reads

Read before edits:

- `/Users/atilla/Applications/UZMAX智能运营/AGENTS.md`
- `docs/specs/M7-UI-96A-stack-typecheck-cleanup.md`
- this evidence file
- current PR #239 body
- `playwright.config.ts`
- `apps/admin/tests/helpers/openLegacyEvidence.ts`
- `apps/admin/tests/design.spec.ts`
- `apps/admin/src/App.tsx`
- `apps/admin/src/pages/PageOutlet.tsx`
- `apps/admin/src/pages/group/GroupOverviewPage.tsx`
- `apps/admin/src/shell/AppShell.tsx`
- `apps/admin/src/shell/AppShell.css`
- `apps/admin/src/styles.css`

This worker did not modify `package.json`, `.github/workflows/ci.yml`, `scripts/guards/**`, `scripts/tests/**`, package/lock/DB/runtime files or owner-source artifacts.

## Current PR Shape

GitHub PR #239 currently reports 46 changed files relative to `codex/m7-ui-95-group-logs-default-visual-parity-refresh` after #240 / 96C was squash-merged into the #239 branch and this Playwright CI boundary worker added `playwright.config.ts` plus `apps/admin/src/shell/AppShell.css`.

- config: 2
- source: 27
- test: 12
- docs: 5
- generated/lock/package/backend/API/DB/worker/cron: 0

The PR body is updated after validation to reflect this 46-file stack shape, the 96C stack-integration dependency and the CI/local-owner-source Playwright boundary. It still uses `large_change_exception` for the formatter/max-lines extraction churn and stack guard integration, and it does not claim UI/runtime acceptance.

## Playwright CI Boundary

Failure mode on GitHub Actions run `28776575984`: `npm run playwright` listed and ran local-owner-source evidence tests whose hard source paths do not exist on GitHub runners:

- `/Users/atilla/Downloads/运营塔台1.0.html`
- `/Users/atilla/源码/unpacked 6`

The tests are retained for local owner-source evidence and local full `npm run playwright`. `playwright.config.ts` now applies `testIgnore` only when `CI=true` for:

- `**/*source-parity.spec.ts`
- `**/*default-visual-parity.spec.ts`
- `**/m7-ui-conversation-detail-parity.spec.ts`
- `**/m7-ui-tenant-entry-visible-proof.spec.ts`

Evidence:

- local full Playwright list: `170` tests.
- `CI=true` Playwright list: `135` tests.
- CI excluded: `35` tests.
- CI list matches for `source-parity`: `0`.
- CI list matches for `default-visual-parity`: `0`.
- CI list matches for `m7-ui-conversation-detail-parity`: `0`.
- CI list matches for `m7-ui-tenant-entry-visible-proof`: `0`.

Boundary: this is not test deletion, skip/only, assertion weakening, owner fixture forgery or owner visual acceptance. Local-owner-source parity remains required before visual acceptance can be claimed.

## Tablet Legacy Evidence Compatibility

Focused reproduction before the AppShell CSS containment:

```sh
npx playwright test apps/admin/tests/design.spec.ts --project desktop-chromium
```

Result before fix: `10 passed`, `1 failed`.

- Failed test: `apps/admin/tests/design.spec.ts:402` / `keeps the M1 shell usable at the tablet breakpoint`.
- Failure: `expect(page.getByTestId("legacy-evidence-route")).toBeVisible()`.
- The helper had already clicked the bridge and entered the route: locator resolved to `<section data-page-id="legacy.evidence" data-testid="legacy-evidence-route">`.

Why helper-only routing/waiting could not fix it:

- DOM geometry at `900x900` after `openLegacyEvidence()` showed `active: "legacy.evidence"`.
- The legacy global selector from `apps/admin/src/styles.css` applied at `max-width: 1100px` to the new shell because `AppShell` intentionally carries both `admin-shell` and `uz-app-shell` classes.
- The old rule changed the shell to column layout:
  - shell: `display: flex`, `flexDirection: "column"`, `height: 900`.
  - nav: `height: 900`.
  - main: `height: 0`, `y: 900`.
  - workspace: `height: 0`, `y: 937`.
  - legacy route: `height: 0`, `y: 937`.
- Because the new shell main/workspace were height `0`, later tablet assertions for visible topbar/workspace content would still be unsafe even if the helper waited longer or asserted attachment instead of visibility.

Fix: `apps/admin/src/shell/AppShell.css` now explicitly sets `.uz-app-shell { flex-direction: row; }`, containing the legacy `.admin-shell` media selector without changing page copy, routes, data, runtime behavior or owner-source evidence.

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

- PASS: PR #239 head matched expected `97be8acac635e912de6fdf07c70077b12f473781` before worktree creation.
- PASS: Playwright CI boundary startup identity was recorded.
- PASS: focused reproduction before fix failed at tablet legacy route visibility exactly as reported: `10 passed`, `1 failed`.
- PASS after fix: `npx playwright test apps/admin/tests/design.spec.ts --project desktop-chromium`:
  - Result: `11 passed`.
- PASS: `CI=true npx playwright test --list`:
  - local listed tests: `170`.
  - CI listed tests: `135`.
  - excluded in CI: `35`.
  - owner-source representative patterns in CI list: `0`.
- PASS: `CI=true npm run playwright`:
  - Result: `135 passed`.
- PASS: `npm run format:check`.
- PASS: `npm run typecheck`.
- PASS: `npm run lint`.
- PASS: `npm run guard:pr-shape -- --base origin/codex/m7-ui-95-group-logs-default-visual-parity-refresh --pr-body-file tmp/pr239-playwright-ci-boundary-body.md --include-worktree`:
  - Output: `changedFiles: 46`, `categories: { config: 2, source: 27, test: 12, docs: 5 }`, `source.netLoc: 1887`, `source.newFiles: 9`.
- PASS: `git diff --check origin/codex/m7-ui-95-group-logs-default-visual-parity-refresh...HEAD`.
- PASS: worktree whitespace check `git diff --check`.

Environment notes:

- Literal `npm` is available in this worktree by adding `/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin` to `PATH`.
- This worker ran `npm ci` inside the isolated worktree because it had no local `node_modules`; no package/lockfile changes were made.

## Cleanup Status

Removed before final status:

- Playwright CI boundary local `node_modules` directory
- ignored temp PR body `tmp/pr239-playwright-ci-boundary-body.md`
- Playwright `test-results` and `playwright-report` artifacts if present
- any package-manager side effects if present

No generated build artifacts, Playwright reports, test-results, lockfile changes or temp PR body files are kept in the final commit.

## Required Next Step

Validate PR #239 CI after this Playwright CI boundary lands. Any remaining full-repo duplicate-debt policy question stays outside this worker unless the owner/coordinator explicitly opens a separate cleanup/baseline decision.

## Remaining Non-Claims

- No whole-repo duplicate-debt cleanup is claimed by this worker.
- No full CI pass is claimed until PR #239 CI reports it.
- No #238/#96 merge closure is claimed.
- No UI migration completion, owner visual acceptance, runtime closure, GA-0, production readiness or 1.0 release approval is claimed.
