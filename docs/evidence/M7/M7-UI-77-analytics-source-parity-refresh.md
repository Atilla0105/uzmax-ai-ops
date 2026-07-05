# M7-UI-77 Analytics Source Parity Refresh Evidence

## Status

`visible_ui_refresh_candidate_pending_pr_review_not_accepted_not_runtime_closed`

This branch refreshes source-parity details for `tenant.analytics` / `分析` on top of `origin/codex/m7-ui-76-config-source-parity-refresh`. It keeps analytics runtime downgraded: no analytics DB/API/runtime, production metrics, export job, export file write, audit write, owner visual acceptance, merge, runtime closure, GA-0 or 1.0 release approval is claimed.

## Scope

- Spec: `docs/specs/M7-UI-77-analytics-source-parity-refresh.md`
- Route: `tenant.analytics`
- Base: `origin/codex/m7-ui-76-config-source-parity-refresh`
- Branch/worktree: `codex/m7-ui-77-analytics-source-parity-refresh` / `/Users/atilla/.codex/worktrees/m7-ui-77-analytics-source-parity-refresh`
- Source targets:
  - `apps/admin/src/pages/analytics/AnalyticsPage.tsx`
  - `apps/admin/src/pages/analytics/analyticsFallback.ts`
- Test targets:
  - `apps/admin/tests/m7-ui-analytics-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-analytics-page.spec.ts`

## Startup Evidence

- `pwd`: `/Users/atilla/.codex/worktrees/m7-ui-77-analytics-source-parity-refresh`
- `git status --short --branch`: `## codex/m7-ui-77-analytics-source-parity-refresh...origin/codex/m7-ui-76-config-source-parity-refresh`
- `git branch --show-current`: `codex/m7-ui-77-analytics-source-parity-refresh`
- Root/main checkout at `/Users/atilla/Applications/UZMAX智能运营` was not used for code edits. It had unrelated pre-existing untracked files and was treated as read-only.

## Source Review

- Read `AGENTS.md`.
- Ran Impeccable context for `apps/admin/src/pages/analytics/AnalyticsPage.tsx` with the Codex runtime `node`; read product-register guidance.
- Read `PRODUCT.md`, `DESIGN.md`, `docs/admin-design-system.md`, `docs/admin-ui-page-migration-ledger.md` and `docs/evidence/M7/README.md`.
- Read prior analytics spec/evidence:
  - `docs/specs/M7-UI-55-analytics-page.md`
  - `docs/evidence/M7/M7-UI-55-analytics-page.md`
- Read current analytics implementation and regression test:
  - `apps/admin/src/pages/analytics/AnalyticsPage.tsx`
  - `apps/admin/src/pages/analytics/analyticsFallback.ts`
  - `apps/admin/tests/m7-ui-analytics-page.spec.ts`
- Inspected owner/prototype sources:
  - `/Users/atilla/Downloads/运营塔台1.0.html`
  - `/Users/atilla/源码/unpacked 6/pages/analytics/AnalyticsPage.tsx`
  - `/Users/atilla/源码/unpacked 6/fixtures/analytics.ts`

## Source Parity Changes

- Removed visible `selectedTenantId · tenant layer` header badge from the primary analytics visual hierarchy while retaining `data-selected-tenant-id` on the page root for evidence.
- Synced time range labels to source spacing: `今日`, `近 7 日`, `近 30 日`.
- Synced dimension definitions to unpacked analytics fixtures:
  - added `订单状态`;
  - restored `玉珠客服·主理`;
  - restored seven `时间粒度` values;
  - kept source labels for `成员/AI 成员/渠道/意图/时间粒度/订单状态/转人工原因`.
- Kept KPI card labels visually pure and source-shaped: `解决率`, `转人工率`, `SLA 达标`, `AI 成本/日`, etc. No KPI card visibly appends `mock/degraded` or `no production analytics metrics`.
- Added analytics-root geometry calibration inside `analyticsStyles` only: expanded desktop width follows `calc(100vw - var(--nav-expanded-width))`, collapsed desktop width follows `calc(100vw - var(--nav-collapsed-width))`, and `max-width:720px` mobile uses viewport width. No shell/router/PageOutlet/package changes were made.
- Lowered the runtime note to hidden-but-present DOM/evidence text and added runtime boundary evidence on the KPI grid data attribute. Runtime boundary labels remain available to tests/metrics/state copy/toasts without appearing in the default desktop body visual.
- Added focused source-parity Playwright evidence for owner HTML, unpacked mapping, tenant-only shell, default analytics page, local dimension state, local-only export, collapsed sidebar and 320px mobile fallback.

## Data And Runtime Boundary

- All analytics data remains synthetic/local fallback state in `analyticsFallback.ts`.
- Time range switching only changes browser-local display factors.
- Dimension add/remove only changes browser-local table combinations and remains capped at two active dimensions.
- Export only shows a local toast.
- No analytics API request, DB read/write, production metric source, export job, file write or audit write is implemented.
- Runtime labels remain present in DOM/data attributes/test evidence: `degraded`, `mock`, `browser-local only`, `no production analytics metrics`, `no export file write`, `no analytics runtime`, `no audit write`.
- Default desktop/local/collapsed/mobile evidence keeps `runtimeLabelsPresent=true` and `runtimeLabelsVisibleInBody=false`; local-only export boundary text appears only when the export toast is deliberately triggered after screenshot/metrics capture.

## Browser Evidence

Artifact directory target:

- `/tmp/uzmax-m7-ui-77-analytics-source-parity-refresh/`

Captured artifacts:

- Owner HTML desktop screenshot: `/tmp/uzmax-m7-ui-77-analytics-source-parity-refresh/owner-html-analytics-desktop.png`
- Owner HTML rendered sample: `/tmp/uzmax-m7-ui-77-analytics-source-parity-refresh/owner-html-analytics-rendered-sample.json`
- Unpacked/source mapping: `/tmp/uzmax-m7-ui-77-analytics-source-parity-refresh/unpacked-analytics-source-mapping.json`
- React desktop default screenshot: `/tmp/uzmax-m7-ui-77-analytics-source-parity-refresh/react-analytics-desktop-default.png`
- React local dimension state screenshot: `/tmp/uzmax-m7-ui-77-analytics-source-parity-refresh/react-analytics-local-dimensions.png`
- React collapsed sidebar screenshot: `/tmp/uzmax-m7-ui-77-analytics-source-parity-refresh/react-analytics-collapsed-sidebar.png`
- React mobile 320 screenshot: `/tmp/uzmax-m7-ui-77-analytics-source-parity-refresh/react-analytics-mobile-320.png`
- Metrics JSON: `/tmp/uzmax-m7-ui-77-analytics-source-parity-refresh/metrics.json`

Owner HTML rendered sample highlights:

- `title=true`, `analyticsSections=true`, `panelTerms=true`.
- Rendered visible sample contains tenant shell categories `运营/数据/智能/管理/洞察`, `分析`, `今日/近 7 日/近 30 日`, `添加维度`, `导出`, 10 KPI labels, handoff reasons, Top issues and `分析表`.
- Rendered owner HTML table header/cells are blank in the captured sample (`blankRenderedTable=true`), so React keeps structured unpacked/source table anatomy for headers and rows.

Unpacked/source mapping highlights:

- `reactFollows=rendered-owner-html-first-then-unpacked-analytics-source-for-structured-details`
- Unpacked source carries source-like header/range/tools, KPI grid, handoff panel, Top issue panel, dimension chips and analysis table.
- Unpacked fixtures carry complete dimension labels including `订单状态`, source agent name `玉珠客服·主理`, source-spaced range labels and source table cap behavior.

React metrics highlights:

- Desktop default: `shellLevel=tenant`, `activePageId=tenant.analytics`, outer nav `232`, expected content width `1208`, analytics root/header/body width `1208`, KPI grid width `1160`, KPI first row count `7`, topbar height `53`, tenant categories `运营/数据/智能/管理/洞察`, group labels absent, KPI count `10`, handoff/top-issues/table present, runtime labels present, `runtimeLabelsVisibleInBody=false`, runtime note visible `false`, visible tenant badge `false`.
- Local dimension state: active labels `AI 成员/订单状态`, dimension menu count `7`, table contains source values `玉珠客服·主理` and `待发货`, `runtimeLabelsVisibleInBody=false`.
- Collapsed sidebar: outer nav `68`, expected content width `1372`, analytics root/header/body width `1372`, KPI grid width `1324`, KPI first row count `8`, active page remains `tenant.analytics`, `runtimeLabelsVisibleInBody=false`.
- Mobile 320: analytics root/header/body width `320`, KPI grid width `296`, KPI first row count `1`, body scroll width `320`, document scroll width `320`, analytics sections remain present, runtime note visible `false`, `runtimeLabelsVisibleInBody=false`.

## Validation

Validation status: `PASS_WITH_EXISTING_BUILD_WARNING`.

Environment notes:

- Default shell initially had `node` unavailable. Validation uses `/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin` at the front of `PATH`.
- Worktree-local `npm ci` succeeded and created temporary `node_modules`; cleanup removed it before final response.

Completed validation:

- PASS: `git diff --check`
- PASS: `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-76-config-source-parity-refresh --spec docs/specs/M7-UI-77-analytics-source-parity-refresh.md --include-worktree`
  - changedFiles `7`
  - categories: `source=2`, `docs=4`, `test=1`
  - source changedFiles `2`, source netLoc `0`, new source files `0`
- PASS: Touched admin ESLint:
  - `node node_modules/eslint/bin/eslint.js apps/admin/src/pages/analytics/AnalyticsPage.tsx apps/admin/src/pages/analytics/analyticsFallback.ts apps/admin/tests/m7-ui-analytics-source-parity.spec.ts apps/admin/tests/m7-ui-analytics-page.spec.ts`
- PASS: Focused Playwright:
  - `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH node node_modules/@playwright/test/cli.js test apps/admin/tests/m7-ui-analytics-source-parity.spec.ts --config=playwright.config.ts`
  - Result: `1 passed`
  - Return-fix assertions: KPI labels equal source labels only; default analytics visible body and KPI grid do not contain `mock/degraded · no production analytics metrics`; runtime labels remain present in hidden DOM/data-attribute evidence with `runtimeLabelsVisibleInBody=false`.
  - Geometry assertions: desktop root/header/body width `1208` at 1440 expanded, collapsed root/header/body width `1372`, KPI first row count `7/8`, mobile root/header/body width `320` and document/body scroll width `320`.
- PASS: Focused Playwright with existing regression spec:
  - `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH node node_modules/@playwright/test/cli.js test apps/admin/tests/m7-ui-analytics-source-parity.spec.ts apps/admin/tests/m7-ui-analytics-page.spec.ts --config=playwright.config.ts`
  - Result: `6 passed`
- PASS: Admin build:
  - `node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir`
  - Existing Vite warning: bundle chunk larger than 500 kB after minification.
- PASS: `git merge-tree --write-tree origin/codex/m7-ui-76-config-source-parity-refresh HEAD`
  - tree `94623f82794a614d57e2e6f727313da36f417251`
- COMPLETE: cleanup removed `node_modules`, `apps/admin/node_modules`, `test-results`, `playwright-report`, `apps/admin/dist` and temporary lockfiles before final response.

## Remaining Deltas

- This branch is source-parity/evidence refresh only; it does not claim owner visual acceptance.
- Owner HTML renders analytics table header/cells blank in the browser capture; React intentionally keeps unpacked/source-shaped structured table headers and rows.
- Analytics DB/API/runtime, production metric sourcing, export jobs/file writes and audit writes remain intentionally not implemented.
- Real tenant analytics data, production permission enforcement and release approval remain future runtime specs, not this UI slice.
- Merge, runtime closure, GA-0 and 1.0 release approval are still required later and are not claimed here.
