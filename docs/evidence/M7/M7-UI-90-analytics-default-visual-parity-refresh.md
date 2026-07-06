# M7-UI-90 Analytics Default Visual Parity Refresh Evidence

## Status

`visible_ui_refresh_candidate_pending_pr_review_not_accepted_not_runtime_closed`

This branch refreshes default-visible copy for `tenant.analytics` / `分析` on top of `codex/m7-ui-89-config-default-visual-parity-refresh`. It keeps analytics runtime downgraded: no analytics DB/API/runtime, production metric source, export job, export file write, audit write, owner visual acceptance, merge, runtime closure, GA-0 or 1.0 release approval is claimed.

## Scope

- Spec: `docs/specs/M7-UI-90-analytics-default-visual-parity-refresh.md`
- Route: `tenant.analytics`
- Base: `codex/m7-ui-89-config-default-visual-parity-refresh`
- Branch/worktree: `codex/m7-ui-90-analytics-default-visual-parity-refresh` / `/Users/atilla/.codex/worktrees/m7-ui-90-analytics-default-visual-parity-refresh`
- Source targets:
  - `apps/admin/src/pages/analytics/AnalyticsPage.tsx`
  - `apps/admin/src/pages/analytics/analyticsFallback.ts`
- Test targets:
  - `apps/admin/tests/m7-ui-analytics-page.spec.ts`
  - `apps/admin/tests/m7-ui-analytics-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-analytics-default-visual-parity.spec.ts`

## Startup Evidence

- `pwd`: `/Users/atilla/.codex/worktrees/m7-ui-90-analytics-default-visual-parity-refresh`
- `git status --short --branch`: `## codex/m7-ui-90-analytics-default-visual-parity-refresh`
- `git branch --show-current`: `codex/m7-ui-90-analytics-default-visual-parity-refresh`
- Root/main checkout at `/Users/atilla/Applications/UZMAX智能运营` was not used for code edits.

## Source Review

- Read `AGENTS.md`.
- Ran Impeccable context for `apps/admin/src/pages/analytics/AnalyticsPage.tsx` with the Codex runtime `node`; read the product-register guidance.
- Read `PRODUCT.md`, `DESIGN.md`, `docs/admin-design-system.md`, `docs/admin-ui-page-migration-ledger.md` and `docs/evidence/M7/README.md`.
- Read prior/default-refresh inputs:
  - `docs/specs/M7-UI-77-analytics-source-parity-refresh.md`
  - `docs/evidence/M7/M7-UI-77-analytics-source-parity-refresh.md`
  - `docs/specs/M7-UI-89-config-default-visual-parity-refresh.md`
  - `docs/evidence/M7/M7-UI-89-config-default-visual-parity-refresh.md`
  - `apps/admin/tests/m7-ui-config-default-visual-parity.spec.ts`
- Inspected owner/prototype sources:
  - `/Users/atilla/Downloads/运营塔台1.0.html`
  - `/Users/atilla/源码/unpacked 6/pages/analytics/AnalyticsPage.tsx`
  - `/Users/atilla/源码/unpacked 6/fixtures/analytics.ts`

## Default Visual Refresh Changes

- Replaced visible dimension-limit toast copy with operational Chinese: `最多只能同时查看 2 个维度，请先移除一个维度。`
- Replaced visible export feedback with operational Chinese: `导出预览已生成，正式任务将在接入后写入审计记录。`
- Replaced forced loading/empty/error/permission copy with business-readable state copy.
- Added `analyticsRuntimeBoundary` so `degraded`, `mock`, `browser-local only`, `no production analytics metrics`, `no export file write`, `no analytics runtime` and `no audit write` remain present through hidden DOM, `data-runtime-boundary`, `title` and `aria-description`.
- Kept default runtime note hidden and added boundary metadata to page root, KPI grid, toast and forced state containers.
- Switched dimension limit controls from native `disabled` to `aria-disabled` so the user can trigger the clean limit feedback while the page still refuses the third dimension.
- Added focused default visual parity Playwright coverage for clean default body, dimension limit/export interactions, forced states, collapsed nav and mobile 320.
- Updated existing analytics page/source-parity tests so they assert hidden/data/title/ARIA boundary evidence instead of requiring visible engineering labels.

## Data And Runtime Boundary

- All analytics data remains synthetic/local fallback state in `analyticsFallback.ts`.
- Time range switching only changes browser-local display factors.
- Dimension add/remove only changes browser-local table combinations and remains capped at two active dimensions.
- Export only shows page-local feedback.
- No analytics API request, DB read/write, production metric source, export job, file write or audit write is implemented.
- Runtime labels remain present in hidden DOM/data/title/ARIA evidence: `degraded`, `mock`, `browser-local only`, `no production analytics metrics`, `no export file write`, `no analytics runtime`, `no audit write`.

## Browser Evidence

Artifact directory target:

- `/tmp/uzmax-m7-ui-90-analytics-default-visual-parity-refresh/`

Captured artifacts from focused Playwright:

- React default clean screenshot: `/tmp/uzmax-m7-ui-90-analytics-default-visual-parity-refresh/react-analytics-default-clean.png`
- React dimension-limit clean screenshot: `/tmp/uzmax-m7-ui-90-analytics-default-visual-parity-refresh/react-analytics-dimension-limit-clean.png`
- React export clean screenshot: `/tmp/uzmax-m7-ui-90-analytics-default-visual-parity-refresh/react-analytics-export-clean.png`
- React collapsed nav clean screenshot: `/tmp/uzmax-m7-ui-90-analytics-default-visual-parity-refresh/react-analytics-collapsed-clean.png`
- React mobile 320 clean screenshot: `/tmp/uzmax-m7-ui-90-analytics-default-visual-parity-refresh/react-analytics-mobile-320-default-clean.png`
- Metrics JSON: `/tmp/uzmax-m7-ui-90-analytics-default-visual-parity-refresh/metrics.json`

Metrics highlights:

- Desktop: `activePageId=tenant.analytics`, `runtimeLabelsPresent=true`, `runtimeLabelsVisibleInBody=false`, `visibleBodyClean=true`, `kpiCount=10`.
- Collapsed: `navWidth=68`, `runtimeLabelsPresent=true`, `runtimeLabelsVisibleInBody=false`, `visibleBodyClean=true`.
- Mobile 320: `bodyScrollWidth<=320`, `documentScrollWidth<=320`, `runtimeLabelsPresent=true`, `runtimeLabelsVisibleInBody=false`, `visibleBodyClean=true`.

## Validation

Validation status: `PASS`.

Environment notes:

- Default shell had `node` unavailable until Codex runtime PATH was used.
- Worktree had no local `node_modules`.
- Validation used a temporary worktree-local symlink: `node_modules -> /Users/atilla/.codex/worktrees/m7-ui-85-customer-assets-default-visual-parity-refresh/node_modules`.
- Playwright config webServer calls `npm`, which is unavailable in this runtime PATH; validation used the already successful build plus manual `vite preview` on `127.0.0.1:4173`, then Playwright reused the existing server.

Completed validation:

- PASS: `git diff --check codex/m7-ui-89-config-default-visual-parity-refresh...HEAD`
- PASS: `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node scripts/guards/pr-shape.mjs --base codex/m7-ui-89-config-default-visual-parity-refresh --spec docs/specs/M7-UI-90-analytics-default-visual-parity-refresh.md --include-worktree`
  - changedFiles `9`
  - categories: `source=2`, `test=3`, `docs=4`
  - source changedFiles `2`, source netLoc `41`, new source files `0`
- PASS: touched Prettier:
  - `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node node_modules/prettier/bin/prettier.cjs --check apps/admin/src/pages/analytics/AnalyticsPage.tsx apps/admin/src/pages/analytics/analyticsFallback.ts apps/admin/tests/m7-ui-analytics-page.spec.ts apps/admin/tests/m7-ui-analytics-source-parity.spec.ts apps/admin/tests/m7-ui-analytics-default-visual-parity.spec.ts docs/specs/M7-UI-90-analytics-default-visual-parity-refresh.md`
- PASS: touched ESLint:
  - `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node node_modules/eslint/bin/eslint.js apps/admin/src/pages/analytics/AnalyticsPage.tsx apps/admin/src/pages/analytics/analyticsFallback.ts apps/admin/tests/m7-ui-analytics-page.spec.ts apps/admin/tests/m7-ui-analytics-source-parity.spec.ts apps/admin/tests/m7-ui-analytics-default-visual-parity.spec.ts`
- PASS: admin build:
  - `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir`
  - Existing Vite warning: bundle chunk larger than 500 kB after minification.
- PASS: focused Playwright:
  - Server: `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node node_modules/vite/bin/vite.js preview apps/admin --host 127.0.0.1 --port 4173`
  - `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node node_modules/@playwright/test/cli.js test apps/admin/tests/m7-ui-analytics-page.spec.ts apps/admin/tests/m7-ui-analytics-source-parity.spec.ts apps/admin/tests/m7-ui-analytics-default-visual-parity.spec.ts`
  - Result: `7 passed`

Cleanup status:

- COMPLETE after validation: temporary `node_modules` symlink, `apps/admin/dist`, `test-results` and `playwright-report` removed before final commit.

## Remaining Deltas

- This branch is default visual parity/evidence refresh only; it does not claim owner visual acceptance.
- Analytics DB/API/runtime, production metric sourcing, export jobs/file writes and audit writes remain intentionally not implemented.
- Real tenant analytics data, production permission enforcement and release approval remain future runtime specs, not this UI slice.
- Merge, runtime closure, GA-0 and 1.0 release approval are still required later and are not claimed here.
