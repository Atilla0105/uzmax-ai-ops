# M7-UI-55 Analytics Page Evidence

## Status

`implementation_candidate_pending_pr_review_not_accepted_not_runtime_closed`

This cleanstack worker implements the visible tenant-layer `tenant.analytics` page only. It does not claim owner visual acceptance, analytics runtime closure, production metrics, export job/file write, audit write, GA, or release closure.

## Worktree Boundary

- `pwd`: `/Users/atilla/.codex/worktrees/m7-ui-55-analytics-page-cleanstack`
- `git branch --show-current`: `codex/m7-ui-55-analytics-page-cleanstack`
- Base: `origin/codex/m7-ui-31-orders-visible-ui` at `d29266e`
- PR base: `codex/m7-ui-31-orders-visible-ui`
- Root/main checkout was not used for code edits.

## Source Truth

- `/Users/atilla/Applications/UZMAX智能运营/AGENTS.md`
- `docs/admin-design-system.md`
- `/Users/atilla/Downloads/运营塔台1.0.html`
- `/Users/atilla/源码/unpacked 6/pages/analytics/AnalyticsPage.tsx`
- `/Users/atilla/源码/unpacked 6/fixtures/analytics.ts`

Source sampling artifacts:

- `/tmp/uzmax-m7-ui-55-analytics-page-cleanstack/source-sampling.json`
- `/tmp/uzmax-m7-ui-55-analytics-page-cleanstack/owner-html-analytics-source-dom-sample.json`
- `/tmp/uzmax-m7-ui-55-analytics-page-cleanstack/owner-html-analytics-source-sample.png`

Sampling markers confirmed: `分析`, `转人工原因分布`, `Top 问题`, `添加维度`, `ANALYTICS_RANGES`, `HANDOFF_REASONS`.

## Implemented Scope

- Added `apps/admin/src/pages/analytics/AnalyticsPage.tsx`
- Added `apps/admin/src/pages/analytics/analyticsFallback.ts`
- Added `apps/admin/src/pages/analytics/analyticsMarkup.ts`
- Added `apps/admin/tests/m7-ui-analytics-page.spec.ts`
- Added `docs/specs/M7-UI-55-analytics-page.md`
- Added this evidence file
- Updated `apps/admin/src/pages/registry.ts`
- Updated `apps/admin/src/pages/PageOutlet.tsx`

Visible page coverage:

- Core metrics/KPI grid
- Time range switch
- Channel and language filters
- Dimension picker, chips, and capped dimension table
- Handoff distribution and Top issues
- Trend, queue, and latency hints
- `loading`, `empty`, `error`, `permission`, `degraded`, and `delayed` states
- Collapsed sidebar and 320px mobile fallback geometry

## Runtime Boundary

All analytics data is centralized synthetic fallback/mock data in `apps/admin/src/pages/analytics/analyticsFallback.ts`.

The page is explicitly browser-local/read-only:

- no production analytics metrics
- no export file write
- no analytics runtime
- no DB/API/authz/RLS
- no audit write

Export only shows a local toast. Filters and dimensions only mutate browser-local UI state.

## Visual Evidence

Artifact directory:

- `/tmp/uzmax-m7-ui-55-analytics-page-cleanstack/react-analytics-desktop.png`
- `/tmp/uzmax-m7-ui-55-analytics-page-cleanstack/react-analytics-desktop-metrics.json`
- `/tmp/uzmax-m7-ui-55-analytics-page-cleanstack/react-analytics-collapsed.png`
- `/tmp/uzmax-m7-ui-55-analytics-page-cleanstack/react-analytics-collapsed-metrics.json`
- `/tmp/uzmax-m7-ui-55-analytics-page-cleanstack/react-analytics-mobile-320.png`
- `/tmp/uzmax-m7-ui-55-analytics-page-cleanstack/react-analytics-mobile-320-metrics.json`

Desktop metrics:

- `activePageId`: `tenant.analytics`
- `shellLevel`: `tenant`
- `bodyScrollWidth`: `1280`
- `documentScrollWidth`: `1280`
- `navWidth`: `232`
- `pageWidth`: `1048`
- `kpiCount`: `10`
- `headerHeight`: `61`
- `noteHeight`: `39`
- `firstPanelTop`: `268`
- `hintsGap`: `14`

Collapsed metrics:

- `navWidth`: `68`
- `pageWidth`: `1212`
- `bodyScrollWidth`: `1280`
- `documentScrollWidth`: `1280`

Mobile 320 metrics:

- `bodyScrollWidth`: `320`
- `documentScrollWidth`: `320`
- `pageWidth`: `320`
- `navWidth`: `320`
- `headerHeight`: `200`
- `noteHeight`: `117`
- `noteBottom`: `624`
- `delayedTop`: `634`
- `firstPanelTop`: `744`
- `kpiCount`: `10`

Mobile geometry guards in `apps/admin/tests/m7-ui-analytics-page.spec.ts` assert document/body/page width <= 320, header <= 230, note <= 180, delayed banner <= 16px after note, and first KPI panel top <= 760. This prevents the mobile fallback from passing with a large blank gap.

## Validation

Fresh local validation:

- `npm run format:check`: pass
- `npm run guard:prettier-ignore`: pass
- `npm run typecheck`: pass
- `npm run lint`: pass
- `npm run jscpd`: pass, 0 clones
- `npm run knip`: pass
- `npm run build:admin`: pass, with existing Vite chunk-size warning
- `npx playwright test apps/admin/tests/m7-ui-analytics-page.spec.ts`: pass, 5/5
- `npm run playwright`: pass, 133/133
- `git diff --check`: pass

`npm run guard:pr-shape -- --base origin/codex/m7-ui-31-orders-visible-ui --spec docs/specs/M7-UI-55-analytics-page.md --include-worktree` was attempted before PR creation and correctly reported no pull request found for the branch. The spec touch-module section has been corrected; the command must be rerun after PR creation so it can read the PR body.

## Remaining Risk

- This is visible UI and browser-local evidence only.
- Exact pixel-level owner acceptance remains pending PR/owner review.
- Real analytics runtime, export jobs, audit writes, and permission-backed server enforcement require future specs.
