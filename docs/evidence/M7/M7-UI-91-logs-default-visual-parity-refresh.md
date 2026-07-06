# M7-UI-91 Logs Default Visual Parity Refresh Evidence

## Status

`visible_ui_refresh_candidate_pending_pr_review_not_accepted_not_runtime_closed`

This branch refreshes default-visible copy for `tenant.logs` / `日志` on top of `codex/m7-ui-90-analytics-default-visual-parity-refresh`. It keeps logs/audit runtime downgraded: no logs DB/API/runtime, production audit log source, export job, export file write, audit write, real record navigation, owner visual acceptance, merge, runtime closure, GA-0 or 1.0 release approval is claimed.

## Scope

- Spec: `docs/specs/M7-UI-91-logs-default-visual-parity-refresh.md`
- Route: `tenant.logs`
- Base: `codex/m7-ui-90-analytics-default-visual-parity-refresh`
- Branch/worktree: `codex/m7-ui-91-logs-default-visual-parity-refresh` / `/Users/atilla/.codex/worktrees/m7-ui-91-logs-default-visual-parity-refresh`
- Source targets:
  - `apps/admin/src/pages/logs/LogsPage.tsx`
  - `apps/admin/src/pages/logs/logsFallback.ts`
- Test targets:
  - `apps/admin/tests/m7-ui-logs-page.spec.ts`
  - `apps/admin/tests/m7-ui-logs-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-logs-default-visual-parity.spec.ts`

## Startup Evidence

- `pwd`: `/Users/atilla/.codex/worktrees/m7-ui-91-logs-default-visual-parity-refresh`
- `git status --short --branch`: `## codex/m7-ui-91-logs-default-visual-parity-refresh`
- `git branch --show-current`: `codex/m7-ui-91-logs-default-visual-parity-refresh`
- Root/main checkout at `/Users/atilla/Applications/UZMAX智能运营` was not used for code edits.

## Source Review

- Read `AGENTS.md`.
- Ran Impeccable context for `apps/admin/src/pages/logs/LogsPage.tsx` with the Codex runtime `node`; read product-register guidance.
- Read `PRODUCT.md`, `DESIGN.md`, `docs/admin-design-system.md`, `docs/admin-ui-page-migration-ledger.md` and `docs/evidence/M7/README.md`.
- Read prior/default-refresh inputs:
  - `docs/specs/M7-UI-78-logs-source-parity-refresh.md`
  - `docs/evidence/M7/M7-UI-78-logs-source-parity-refresh.md`
  - `docs/specs/M7-UI-90-analytics-default-visual-parity-refresh.md`
  - `docs/evidence/M7/M7-UI-90-analytics-default-visual-parity-refresh.md`
  - `apps/admin/tests/m7-ui-analytics-default-visual-parity.spec.ts`
- Inspected owner/prototype sources:
  - `/Users/atilla/Downloads/运营塔台1.0.html`
  - `/Users/atilla/源码/unpacked 6/pages/logs/LogsPage.tsx`
  - `/Users/atilla/源码/unpacked 6/fixtures/analytics.ts`

## Default Visual Refresh Changes

- Replaced visible detail feedback with operational Chinese: `详情预览已打开：...。轨迹面板接入后可继续查看完整记录。`
- Replaced visible forced loading/empty/error/permission copy with business-readable state copy.
- Replaced search input accessible name from engineering/mock wording to `搜索租户日志记录`.
- Replaced operation detail button accessible names from local-preview wording to `查看日志详情 ...`.
- Added `tenantLogRuntimeBoundary` so `degraded`, `mock`, `read-only`, `browser-local only`, `synthetic tenant log rows`, `no production audit/log export`, `no file written`, `no audit/log runtime call` and `no real tenant/action navigation` remain present through hidden DOM, `data-runtime-boundary`, `title` and `aria-description`.
- Kept default runtime note hidden and added boundary metadata to page root, table panel, detail buttons, toast and forced state containers.
- Added focused default visual parity Playwright coverage for clean default body, search/detail interactions, forced states, collapsed nav and mobile 320.
- Updated existing logs page/source-parity tests so they assert hidden/data/title/ARIA boundary evidence instead of requiring visible engineering labels in detail feedback or forced states.

## Data And Runtime Boundary

- All logs data remains synthetic/local fallback state in `logsFallback.ts`.
- Search only filters browser-local fallback rows.
- Operation detail only shows page-local feedback.
- No logs API request, DB read/write, production audit log source, export job, file write, audit write, production record navigation or trace panel runtime is implemented.
- Runtime labels remain present in hidden DOM/data/title/ARIA evidence: `degraded`, `mock`, `read-only`, `browser-local only`, `synthetic tenant log rows`, `no production audit/log export`, `no file written`, `no audit/log runtime call`, `no real tenant/action navigation`.

## Browser Evidence

Artifact directory target:

- `/tmp/uzmax-m7-ui-91-logs-default-visual-parity-refresh/`

Captured artifacts from focused Playwright:

- React default clean screenshot: `/tmp/uzmax-m7-ui-91-logs-default-visual-parity-refresh/react-logs-default-clean.png`
- React search empty clean screenshot: `/tmp/uzmax-m7-ui-91-logs-default-visual-parity-refresh/react-logs-search-empty-clean.png`
- React detail toast clean screenshot: `/tmp/uzmax-m7-ui-91-logs-default-visual-parity-refresh/react-logs-detail-toast-clean.png`
- React collapsed nav clean screenshot: `/tmp/uzmax-m7-ui-91-logs-default-visual-parity-refresh/react-logs-collapsed-clean.png`
- React mobile 320 clean screenshot: `/tmp/uzmax-m7-ui-91-logs-default-visual-parity-refresh/react-logs-mobile-320-default-clean.png`
- Metrics JSON: `/tmp/uzmax-m7-ui-91-logs-default-visual-parity-refresh/metrics.json`

Metrics highlights:

- Desktop: `activePageId=tenant.logs`, `runtimeLabelsPresent=true`, `runtimeLabelsVisibleInBody=false`, `visibleBodyClean=true`, `tableRowCount=6`.
- Collapsed: `navWidth=68`, `runtimeLabelsPresent=true`, `runtimeLabelsVisibleInBody=false`, `visibleBodyClean=true`.
- Mobile 320: `bodyScrollWidth<=320`, `documentScrollWidth<=320`, `runtimeLabelsPresent=true`, `runtimeLabelsVisibleInBody=false`, `visibleBodyClean=true`.

## Validation

Validation status: `PASS`.

Environment notes:

- Default shell had `node` unavailable until Codex runtime PATH was used.
- Worktree had no local `node_modules`.
- Validation used a temporary worktree-local symlink: `node_modules -> /Users/atilla/.codex/worktrees/m7-ui-85-customer-assets-default-visual-parity-refresh/node_modules`.
- `pr-shape --include-worktree` was run after temporarily removing the symlink so dependency plumbing was not counted as an out-of-scope worktree file.
- Playwright config webServer calls `npm`, which is unavailable in this runtime PATH; validation used the already successful build plus manual `vite preview` on `127.0.0.1:4173`, then Playwright reused the existing server.

Completed validation:

- PASS: `git diff --check codex/m7-ui-90-analytics-default-visual-parity-refresh...HEAD`
- PASS: `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node scripts/guards/pr-shape.mjs --base codex/m7-ui-90-analytics-default-visual-parity-refresh --spec docs/specs/M7-UI-91-logs-default-visual-parity-refresh.md --include-worktree`
  - changedFiles `9`
  - categories: `source=2`, `test=3`, `docs=4`
  - source changedFiles `2`, source netLoc `0`, new source files `0`
- PASS: touched Prettier:
  - `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node node_modules/prettier/bin/prettier.cjs --check apps/admin/src/pages/logs/LogsPage.tsx apps/admin/src/pages/logs/logsFallback.ts apps/admin/tests/m7-ui-logs-page.spec.ts apps/admin/tests/m7-ui-logs-source-parity.spec.ts apps/admin/tests/m7-ui-logs-default-visual-parity.spec.ts docs/specs/M7-UI-91-logs-default-visual-parity-refresh.md docs/evidence/M7/M7-UI-91-logs-default-visual-parity-refresh.md`
- PASS: touched ESLint:
  - `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node node_modules/eslint/bin/eslint.js apps/admin/src/pages/logs/LogsPage.tsx apps/admin/src/pages/logs/logsFallback.ts apps/admin/tests/m7-ui-logs-page.spec.ts apps/admin/tests/m7-ui-logs-source-parity.spec.ts apps/admin/tests/m7-ui-logs-default-visual-parity.spec.ts`
- PASS: Admin build with existing Vite warning:
  - `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir`
  - Existing warning: bundle chunk larger than 500 kB after minification.
- Initial Playwright attempt hit the known local webServer issue:
  - `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node node_modules/@playwright/test/cli.js test apps/admin/tests/m7-ui-logs-page.spec.ts apps/admin/tests/m7-ui-logs-source-parity.spec.ts apps/admin/tests/m7-ui-logs-default-visual-parity.spec.ts`
  - Result: `/bin/sh: npm: command not found`; config webServer could not start.
- PASS: focused Playwright with manual preview:
  - Server: `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node node_modules/vite/bin/vite.js preview apps/admin --host 127.0.0.1 --port 4173`
  - `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH PLAYWRIGHT_TEST_BASE_URL=http://127.0.0.1:4173 node node_modules/@playwright/test/cli.js test apps/admin/tests/m7-ui-logs-page.spec.ts apps/admin/tests/m7-ui-logs-source-parity.spec.ts apps/admin/tests/m7-ui-logs-default-visual-parity.spec.ts`
  - `apps/admin/tests/m7-ui-logs-page.spec.ts`
  - `apps/admin/tests/m7-ui-logs-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-logs-default-visual-parity.spec.ts`
  - Result: `7 passed`

Cleanup status:

- COMPLETE after validation: temporary `node_modules` symlink, `apps/admin/dist`, `test-results` and `playwright-report` removed before final commit.

## Remaining Deltas

- This branch is default visual parity/evidence refresh only; it does not claim owner visual acceptance.
- Logs DB/API/runtime, production audit log sourcing, export jobs/file writes, audit writes, real record navigation and trace runtime remain intentionally not implemented.
- Real tenant logs data, production permission enforcement and release approval remain future runtime specs, not this UI slice.
- Merge, runtime closure, GA-0 and 1.0 release approval are still required later and are not claimed here.
