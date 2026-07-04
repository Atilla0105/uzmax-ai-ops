# M7-UI-09 M4 Visible Smoke Legacy Route Compat Evidence

## Status

Implementation evidence for `M7-UI-09-m4-visible-smoke-legacy-route-compat`.

Status: `DONE_WITH_CONCERNS`.

This branch repairs the M4 visible smoke harnesses after M7-UI-05 made `/design` open the group overview route. The order-import and customer-asset harnesses now open `/design`, click the existing `Open legacy evidence route` button, wait for `legacy-evidence-route`, and then wait for their legacy M4 runtime state test ids.

This is not a page migration, PR #191 fix, PR #182 page change, M4 runtime closeout, owner acceptance, GA-0 opening, production deployment, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release approval.

## Entry Evidence

| Fact | Evidence |
|---|---|
| worker path | `/Users/atilla/.codex/worktrees/m7-ui-09-m4-visible-smoke-legacy-route-compat` |
| worker branch | `codex/m7-ui-09-m4-visible-smoke-legacy-route-compat` |
| worker pre-edit `pwd` | `/Users/atilla/.codex/worktrees/m7-ui-09-m4-visible-smoke-legacy-route-compat` |
| worker pre-edit status | `## codex/m7-ui-09-m4-visible-smoke-legacy-route-compat...origin/codex/m7-ui-09-m4-visible-smoke-legacy-route-compat` |
| worker pre-edit branch | `codex/m7-ui-09-m4-visible-smoke-legacy-route-compat` |
| `git branch --no-merged main` | `codex/m7-ui-07b-visual-plan-hard-rules`; `codex/m7-ui-09-m4-visible-smoke-legacy-route-compat`; `codex/m7-ui-11-release-acceptance-page-impl`; `codex/m7-ui-20-conversation-workbench-page-impl`; `codex/req-g01a-code-01-db-api-foundation-impl` |
| open PR check | `gh` unavailable in shell; command returned `zsh:1: command not found: gh`. |
| root/main boundary | `/Users/atilla/Applications/UZMAX智能运营` is forbidden for edits and was not used for writes by this worker. |
| local runtime tools | shell PATH lacks `node`, `npm`, `npx` and `gh`; bundled Codex `node` and `pnpm` are available and used for validation. |

## Required Reads / Source Mapping

Required reads completed before implementation edits:

- `AGENTS.md`
- `PRODUCT.md`
- `DESIGN.md`
- v1.1 source-of-truth docs relevant customer asset, order, RLS, `/design`, admin quality and acceptance sections
- `docs/admin-ui-page-migration-ledger.md`
- `docs/specs/M7-UI-05-layered-navigation-shell.md`
- `docs/evidence/M7/M7-UI-05-layered-navigation-shell.md`
- `docs/specs/M4-38-order-import-admin-visible-true-db-smoke.md`
- `docs/specs/M4-39-order-import-admin-visible-stale-missing-true-db-smoke.md`
- `docs/specs/M4-43-customer-asset-runtime-workflow.md`
- `docs/evidence/M4/README.md`
- `packages/db/scripts/order-import-admin-visible-smoke-harness.mjs`
- `packages/db/scripts/customer-asset-admin-visible-smoke-harness.mjs`
- `packages/db/scripts/run-m4-order-import-admin-visible-true-db-smoke.mjs`
- `packages/db/scripts/run-m4-order-import-admin-visible-stale-missing-true-db-smoke.mjs`
- `packages/db/scripts/run-m4-customer-asset-runtime-workflow-smoke.mjs`
- `scripts/tests/m4-order-import-admin-visible-true-db-smoke.test.mjs`
- `scripts/tests/m4-order-import-admin-visible-stale-missing-true-db-smoke.test.mjs`
- `scripts/tests/m4-customer-asset-runtime-workflow.test.mjs`
- `apps/admin/src/pages/PageOutlet.tsx`
- `apps/admin/tests/helpers/openLegacyEvidence.ts`
- `docs/evidence/M7/README.md`

Source mapping:

| Source | Finding / implementation use |
|---|---|
| M7-UI-05 spec/evidence | `/design` now opens group layer/group overview; older legacy evidence tests must open the explicit legacy route. |
| `PageOutlet.tsx` | The app already exposes `Open legacy evidence route` and `legacy-evidence-route`; no admin source change is required. |
| `openLegacyEvidence.ts` | Confirms the intended test-side sequence: go to `/design`, click the button, wait for `legacy-evidence-route`. |
| `order-import-admin-visible-smoke-harness.mjs` | Shared M4 visible smoke harness had the stale assumption: after `/design`, it immediately called `page.getByTestId("m4-order-runtime-state")`. |
| M4-38/M4-39 smoke entrypoints | Both call `withVisibleSmokePage()`, so the shared harness fix covers fresh and stale/missing visible true DB smokes. |
| `customer-asset-admin-visible-smoke-harness.mjs` | Customer asset visible smoke had the same stale route assumption: after `/design`, it immediately called `page.getByTestId("m4-customer-runtime-state")`. |
| M4-43 smoke entrypoint | `run-m4-customer-asset-runtime-workflow-smoke.mjs` calls `withCustomerAssetVisibleSmokePage()`, so the analogous harness fix covers the CI failure without admin source changes. |

## CI Failure Root Cause

After PR #193's order-import compatibility fix, GitHub CI progressed past `m4-order-import-admin-visible-true-db-smoke` and `m4-order-import-admin-visible-stale-missing-true-db-smoke`, then failed in `run-m4-customer-asset-runtime-workflow-smoke.mjs`.

Root cause: `packages/db/scripts/customer-asset-admin-visible-smoke-harness.mjs` still navigated to `/design` and immediately waited for `getByTestId("m4-customer-runtime-state")`. Since M7-UI-05 changed `/design` to render the group overview scaffold, that locator is only available after clicking the explicit `Open legacy evidence route` button and waiting for `legacy-evidence-route`.

Fix: mirror the already-validated order-import harness sequence in the customer asset harness: preserve init script and route proxy setup, navigate to `/design`, open the explicit legacy evidence route, wait for `legacy-evidence-route`, then assert `m4-customer-runtime-state` as before.

## Implementation Summary

| Path | Summary |
|---|---|
| `packages/db/scripts/order-import-admin-visible-smoke-harness.mjs` | Adds a local `openLegacyEvidenceRoute(page)` helper and calls it after `/design` navigation, before passing `m4-order-runtime-state` to the smoke callback. Smoke global injection and `**/order-import/**` route proxy remain unchanged. |
| `packages/db/scripts/customer-asset-admin-visible-smoke-harness.mjs` | Adds the same local legacy route helper and calls it after `/design` navigation, before passing `m4-customer-runtime-state` to the smoke callback. Smoke global injection and `**/customer-assets/**` route proxy remain unchanged. |
| `scripts/tests/m4-order-import-admin-visible-true-db-smoke.test.mjs` | Adds structure assertions for the legacy button, marker and `/design -> legacy route -> m4-order-runtime-state` ordering. |
| `scripts/tests/m4-order-import-admin-visible-stale-missing-true-db-smoke.test.mjs` | Adds the same shared-harness ordering assertions for the stale/missing smoke path. |
| `scripts/tests/m4-customer-asset-runtime-workflow.test.mjs` | Adds structure assertions for the legacy button, marker and `/design -> legacy route -> m4-customer-runtime-state` ordering. |
| `docs/specs/M7-UI-09-m4-visible-smoke-legacy-route-compat.md` | Adds the narrow compatibility-fix spec and touch boundary. |
| `docs/evidence/M7/M7-UI-09-m4-visible-smoke-legacy-route-compat.md` | Records preflight, source mapping, implementation, validation and boundaries. |
| `docs/evidence/M7/README.md` | Adds UI-09 to the M7 execution queue so the compatibility repair is discoverable. |

## Compatibility Behavior

| Requirement | Evidence |
|---|---|
| Start from `/design` | Both harnesses still call `page.goto(`${runtime.adminBaseUrl}/design`)`. |
| Enter explicit legacy route | Both harnesses click `getByRole("button", { name: "Open legacy evidence route" })`. |
| Wait for route marker | Both harnesses wait for `getByTestId("legacy-evidence-route")` visible. |
| Preserve M4 runtime lookup | The order harness then passes `page.getByTestId("m4-order-runtime-state")`; the customer harness then passes `page.getByTestId("m4-customer-runtime-state")`. |
| Preserve smoke global injection | Existing `page.addInitScript` calls remain before routing/navigation. |
| Preserve API proxies | Existing `page.route("**/order-import/**", route.fetch(...))` and `page.route("**/customer-assets/**", forwardCustomerAssetBrowserRequest(...))` remain unchanged. |
| Cover M4-38, M4-39 and M4-43 | The smoke scripts reuse their existing harness entrypoints. Focused structure tests cover both order-import entrypoint test files and the customer asset runtime workflow test file. |

## Validation

Validation uses:

- node: `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node`
- pnpm: `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/pnpm`

| Command | Result | Notes |
|---|---|---|
| `git diff --check` | pass | No whitespace errors. |
| touched-file Prettier check | pass | `pnpm exec prettier --check` passed for both harnesses, all three focused test files, this spec/evidence and M7 README. |
| `pnpm run format:check` | fail, pre-existing unrelated formatting debt | Reports 11 untouched files: `apps/admin/src/M4CustomerAssetRuntimeState.tsx`, `apps/admin/src/orderImportApiClient.ts`, `apps/admin/src/pages/registry.ts`, `apps/api/src/ai-member-runtime.contracts.ts`, `apps/api/src/confirmation-queue.types.ts`, `apps/api/src/conversation-ticket.types.ts`, `apps/api/src/order-import.repository.ts`, `apps/api/src/order-import.types.ts`, `packages/capabilities/kb/src/index.ts`, `packages/capabilities/order-read/src/index.ts`, `packages/channels/src/index.ts`. This slice did not format unrelated files. |
| `pnpm run guard:doc-triggers` | pass | Plain `npm` is unavailable in this shell, so this used bundled Codex `pnpm`; `doc-trigger-paths: ok`. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M7-UI-09-m4-visible-smoke-legacy-route-compat.md --include-worktree` | pass | 8 changed files: docs 3, source 2, test 3; source changed files 2; source net LOC 20; new source files 0. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test scripts/tests/m4-order-import-admin-visible-true-db-smoke.test.mjs scripts/tests/m4-order-import-admin-visible-stale-missing-true-db-smoke.test.mjs scripts/tests/m4-customer-asset-runtime-workflow.test.mjs` | pass | 14 tests passed. |
| `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH /Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/pnpm run lint` | pass | ESLint completed with no findings. Bundled `pnpm` installed local dev dependencies into ignored `node_modules`; no package/lock files changed. |
| `pnpm run typecheck` | fail, local dependency blocker | `tsc` starts but local install lacks workspace/backend dependencies: `@nestjs/common`, `@nestjs/core`, `@supabase/supabase-js`, `reflect-metadata`, `bullmq`, `@prisma/client`. No M7-UI-09-specific TypeScript error was reported before these missing-module blockers. |
| `env -u UZMAX_RLS_DATABASE_URL node packages/db/scripts/run-m4-order-import-admin-visible-true-db-smoke.mjs` | blocked locally before env check | Local install lacks `@prisma/client`, so the script fails during ESM import before reaching `requireSmokeEnv`. |
| `env -u UZMAX_RLS_DATABASE_URL node packages/db/scripts/run-m4-order-import-admin-visible-stale-missing-true-db-smoke.mjs` | blocked locally before env check | Same missing `@prisma/client` blocker. |
| customer asset true DB visible smoke | CI-only / pending | Local `UZMAX_RLS_DATABASE_URL` is absent, and local dependencies still lack `@prisma/client`; no local true DB smoke pass is claimed. |
| true DB visible smokes | CI-only / pending | Local `UZMAX_RLS_DATABASE_URL` is absent, and local dependencies block script startup; no true DB smoke pass is claimed locally. |

## Boundary

- No `.github/workflows/ci.yml` change.
- No admin source change.
- No backend/API/worker/cron/authz/DB schema/migration/package/lock/generated change.
- No group overview or PR #191 code touched.
- No PR #182 page work touched.
- No true DB assertion skip, fake pass, mock expansion or acceptance weakening.
- No raw order/customer data, screenshots, secrets, env files or external connector calls.

This evidence records only the M7 route compatibility repair for existing M4 visible smokes.
