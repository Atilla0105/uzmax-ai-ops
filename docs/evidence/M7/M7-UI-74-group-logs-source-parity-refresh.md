# M7-UI-74 Group Logs Source Parity Refresh Evidence

## Status

`visible_ui_refresh_candidate_pending_pr_review_not_accepted_not_runtime_closed`

This branch refreshes browser-comparable source-parity evidence for `group.logs` / `集团日志` on top of the latest #215 visible UI stack. It keeps group-logs runtime downgraded: no audit DB/API/runtime/authz, production audit export, file write, export job, real audit query, real record navigation, trace closure, owner visual acceptance, merge, runtime closure, GA-0 or 1.0 release approval is claimed.

## Scope

- Spec: `docs/specs/M7-UI-74-group-logs-source-parity-refresh.md`
- Route: `group.logs`
- Base: `origin/codex/m7-ui-73-tenant-management-source-parity-refresh`
- Branch/worktree: `codex/m7-ui-74-group-logs-source-parity-refresh` / `/Users/atilla/.codex/worktrees/m7-ui-74-group-logs-source-parity-refresh`
- Source target:
  - `apps/admin/src/pages/group/GroupLogsPage.tsx`
  - `apps/admin/src/pages/group/GroupLogsViews.tsx`
  - `apps/admin/src/pages/group/groupLogsFallback.ts`
- Test targets:
  - `apps/admin/tests/m7-ui-group-logs-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-group-logs.spec.ts`

## Source Review

- Read `AGENTS.md`.
- Ran Impeccable context for `apps/admin/src/pages/group/GroupLogsPage.tsx` and read the product-register guidance.
- Read `PRODUCT.md`, `DESIGN.md`, `docs/admin-design-system.md`, `docs/admin-ui-page-migration-ledger.md` and `docs/evidence/M7/README.md`.
- Read v1.1 PRD, technical architecture, admin design/frontend architecture and acceptance matrix log/audit, group-layer, permission/RLS, mobile fallback and release-boundary sections.
- Read prior M7 group-logs spec/evidence:
  - `docs/specs/M7-UI-57-group-logs-page.md`
  - `docs/evidence/M7/M7-UI-57-group-logs-page.md`
- Inspected owner/prototype sources:
  - `/Users/atilla/Downloads/运营塔台1.0.html`
  - `/Users/atilla/源码/unpacked 6/pages/group/GroupLogsPage.tsx`
  - `/Users/atilla/源码/unpacked 6/fixtures/groupPlatform.ts`
  - `/Users/atilla/源码/unpacked 6/shell/navigation.ts`
- Inspected current implementation/test:
  - `apps/admin/src/pages/group/GroupLogsPage.tsx`
  - `apps/admin/src/pages/group/GroupLogsViews.tsx`
  - `apps/admin/src/pages/group/groupLogsFallback.ts`
  - `apps/admin/tests/m7-ui-group-logs.spec.ts`

## Source Parity Findings

### Owner HTML Reinspection

Browser inspection of `/Users/atilla/Downloads/运营塔台1.0.html` on `集团日志` showed the current visible owner truth:

- Header: `集团日志`, `操作日志 · 跨租户 · 7 条`.
- Search: 240px control with placeholder `搜索租户 / 操作人 / 对象 / 内容…`.
- Action: `导出`.
- Chips: `全部模块`, `AI 成员`, `连接中心`, `配置`, `租户管理`, `对话`, `工单`.
- Empty state after search: `没有匹配「not-matching-owner-row」的记录`.
- Group shell only: group categories `总览/平台/治理`; tenant categories absent.

The owner HTML also renders a bordered table panel, but browser DOM inspection shows the current rendered table header/cells are blank even after waiting. The embedded owner bundle still contains `gLogCols`, `gLogRows`, seven source rows and the empty-state template. The generated `sc-for` column/row loops are outside the table cell templates, which explains the blank rendered table. `/Users/atilla/源码/unpacked 6/pages/group/GroupLogsPage.tsx` and `/Users/atilla/源码/unpacked 6/fixtures/groupPlatform.ts` both contain the seven-column/seven-row group-log table source.

### React Changes

- Removed primary header `mock` pollution: subtitle now uses `操作日志 · 跨租户 · 7 条` and filtered states use `操作日志 · 跨租户 · 显示 N / 7 条`.
- Replaced stale search placeholder `搜索本页记录...` with owner text `搜索租户 / 操作人 / 对象 / 内容…` and set the desktop control width to 240px.
- Aligned visible chip order to owner `gLogChipDefs`; the stale visible `模板中心` chip is removed, while the source row with module `模板中心` remains visible under `全部模块` because both embedded owner data and unpacked source include that row.
- Updated empty state to interpolate the query: `没有匹配「query」的记录`.
- Kept seven-column/seven-row source-shaped React table and local-only detail buttons, with the owner-rendered blank-table conflict recorded in spec/evidence/metrics.
- Kept runtime boundary copy in `GroupLogRuntimeNote`, local toasts, evidence and tests: `degraded`, `mock`, `read-only`, `browser-local only`, `synthetic audit rows`, `no production audit export`, `no file written`, `no audit runtime call`, `no real tenant/action navigation`.

## Data And Runtime Boundary

- All rows are synthetic and centralized in `groupLogsFallback.ts`.
- Module filters and search only filter in-memory synthetic rows.
- Export action only shows a toast; no CSV is generated, no file is written, no export job or audit runtime call occurs.
- Detail action only shows a toast; no route or navigation into real tenant/action records occurs.
- No DB/API/runtime/authz/audit/export/release wiring is implemented.

## Browser Evidence

Artifact directory:

- `/tmp/uzmax-m7-ui-74-group-logs-source-parity-refresh/`

Captured/expected artifacts:

- Owner HTML desktop screenshot: `/tmp/uzmax-m7-ui-74-group-logs-source-parity-refresh/owner-html-group-logs-desktop.png`
- Owner HTML rendered sample: `/tmp/uzmax-m7-ui-74-group-logs-source-parity-refresh/owner-html-group-logs-rendered-sample.json`
- Owner HTML filter empty screenshot: `/tmp/uzmax-m7-ui-74-group-logs-source-parity-refresh/owner-html-group-logs-filter-empty.png`
- Owner HTML empty sample: `/tmp/uzmax-m7-ui-74-group-logs-source-parity-refresh/owner-html-group-logs-empty-sample.json`
- Unpacked/source mapping: `/tmp/uzmax-m7-ui-74-group-logs-source-parity-refresh/unpacked-group-logs-source-mapping.json`
- React desktop screenshot: `/tmp/uzmax-m7-ui-74-group-logs-source-parity-refresh/react-group-logs-desktop-default.png`
- React filter empty screenshot: `/tmp/uzmax-m7-ui-74-group-logs-source-parity-refresh/react-group-logs-filter-empty.png`
- React local action screenshot: `/tmp/uzmax-m7-ui-74-group-logs-source-parity-refresh/react-group-logs-local-action.png`
- React collapsed sidebar screenshot: `/tmp/uzmax-m7-ui-74-group-logs-source-parity-refresh/react-group-logs-collapsed-sidebar.png`
- React mobile 320 screenshot: `/tmp/uzmax-m7-ui-74-group-logs-source-parity-refresh/react-group-logs-mobile-320.png`
- Metrics JSON: `/tmp/uzmax-m7-ui-74-group-logs-source-parity-refresh/metrics.json`

## Validation

- PASS: `git diff --check origin/codex/m7-ui-73-tenant-management-source-parity-refresh...HEAD`
- PASS: touched Prettier check for group-logs source/tests and docs.
- PASS: ESLint for touched group-logs source/tests.
- PASS: `node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json --pretty false`
- PASS: `node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir`
- PASS: `node node_modules/@playwright/test/cli.js test apps/admin/tests/m7-ui-group-logs-source-parity.spec.ts apps/admin/tests/m7-ui-group-logs.spec.ts --config=playwright.config.ts`
- PASS: `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-73-tenant-management-source-parity-refresh --spec docs/specs/M7-UI-74-group-logs-source-parity-refresh.md --include-worktree`

## Metrics Highlights

- Desktop React metrics: `shellLevel=group`, `activePageId=group.logs`, `hasTenantId=false`, `navWidth=232`, `topbarHeight=53`, `header=1067x99`, `searchWidth=240`, `panel=1019x305`, `rowHeight=39`, `bodyScrollWidth=1440`, `documentScrollWidth=1440`.
- Sidebar metrics: group categories `总览/平台/治理`; `tenantButtonCount=0`; `tenantCategoryCount=0`; collapsed `navWidth=68`.
- Mobile 320 metrics: `panelWidth=296`, `bodyScrollWidth=320`, `documentScrollWidth=320`; table switches to card fallback and `rowHeight=0`.
- Source-like booleans: desktop default primary values/table/chips/search/title/subtitle/rows/panel/detail action are true; empty state is true for `没有匹配「not-matching-react-row」的记录`; local action toast is true.
- Runtime labels visible: `degraded`, `mock`, `read-only`, `browser-local only`, `synthetic audit rows`, `no production audit export`, `no file written`, `no audit runtime call`, `no real tenant/action navigation`.
- Owner HTML rendered findings in metrics: chips `全部模块/AI 成员/连接中心/配置/租户管理/对话/工单`, search placeholder `搜索租户 / 操作人 / 对象 / 内容…`, rendered table columns false, rendered table rows false, blank rendered cells true.
- Owner/unpacked conflict status: `ownerBundleAndUnpackedRowsPresent=true`, `ownerBundleTableTemplateMalformed=true`, `ownerChipTemplateExcludesTemplateCenter=true`, `unpackedChipsIncludeTemplateCenter=true`, `ownerRenderedTableConflictStatus=rendered_table_blank_due_malformed_sc_for`.

## Remaining Deltas

- Owner HTML rendered table cells are blank because of malformed `sc-for` placement in the bundle. React keeps the required source-shaped seven-column/seven-row table, so this branch does not claim owner table visual acceptance.
- Runtime audit DB/API/authz/export paths remain intentionally not implemented.
- Real audit-log query, CSV generation, file writing, export jobs, trace closure and navigation to real tenant/action records are not implemented.
- Owner visual acceptance, merge, runtime closure, GA-0 and 1.0 release approval are still required later and are not claimed here.
