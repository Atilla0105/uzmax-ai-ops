# M7-UI-73 Tenant Management Source Parity Refresh Evidence

## Status

`visible_ui_refresh_candidate_pending_pr_review_not_accepted_not_runtime_closed`

This branch refreshes browser-comparable source-parity evidence for `group.tenants` / `租户管理` on top of the latest #214 visible UI stack. The返修 decision is to follow the actual rendered owner HTML table/new-tenant shape, not the conflicting unpacked 6 card-grid source. It keeps tenant-management runtime downgraded: no tenant DB/API/runtime/authz, production tenant change, tenant config persistence, connector or feature flag persistence, audit write, owner visual acceptance, merge, runtime closure, GA-0 or 1.0 release approval is claimed.

## Scope

- Spec: `docs/specs/M7-UI-73-tenant-management-source-parity-refresh.md`
- Route: `group.tenants`
- Base: `origin/codex/m7-ui-72-connection-center-source-parity-refresh`
- Branch/worktree: `codex/m7-ui-73-tenant-management-source-parity-refresh` / `/Users/atilla/.codex/worktrees/m7-ui-73-tenant-management-source-parity-refresh`
- Source target:
  - `apps/admin/src/pages/group/GroupTenantPage.tsx`
  - `apps/admin/src/pages/group/GroupTenantViews.tsx`
  - `apps/admin/src/pages/group/groupTenantFallback.ts`
- Test targets:
  - `apps/admin/tests/m7-ui-tenant-management-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-tenant-management.spec.ts`

## Source Review

- Read `AGENTS.md`.
- Read `PRODUCT.md`, `DESIGN.md`, Impeccable product register and `docs/admin-design-system.md`.
- Read v1.1 PRD, technical architecture, admin design/frontend architecture and acceptance matrix tenant-management, group-layer, multi-tenant/authz/RLS, audit, mobile fallback and release-boundary sections.
- Read prior M7 tenant-management spec/evidence:
  - `docs/specs/M7-UI-52-tenant-management-page.md`
  - `docs/evidence/M7/M7-UI-52-tenant-management-page.md`
- Inspected owner/prototype sources:
  - `/Users/atilla/Downloads/运营塔台1.0.html`
  - `/Users/atilla/源码/unpacked 6/pages/group/GroupTenantPage.tsx`
  - `/Users/atilla/源码/unpacked 6/fixtures/groupPlatform.ts`
  - `/Users/atilla/源码/unpacked 6/shell/navigation.ts`
- Inspected current implementation/test:
  - `apps/admin/src/pages/group/GroupTenantPage.tsx`
  - `apps/admin/src/pages/group/GroupTenantViews.tsx`
  - `apps/admin/src/pages/group/groupTenantFallback.ts`
  - `apps/admin/tests/m7-ui-tenant-management.spec.ts`

## Source Parity Changes

### Owner HTML Reinspection

Browser inspection of `/Users/atilla/Downloads/运营塔台1.0.html` on `租户管理` showed the current visible owner truth:

- Header: `租户管理`, `4 个租户`, and a `新建租户` button.
- Default body: bordered table/panel, but no visible tenant names, no four-card grid, no visible table column labels, no card stats, no default capability rows.
- The only rendered row/action text inside the panel is `管理`; clicking it does not open a drawer in the rendered owner HTML.
- Note: `停用租户须填写原因 · 停用后保留只读审计与数据导出入口`.
- `新建租户` opens a modal with `租户名称`, `业务线`, `默认语言`, `默认时区`, `渠道能力`, `初始模板`, helper copy about copying selected template material, `取消` and `创建租户`.

The owner HTML embedded bundle still contains table column definitions, management drawer and disable modal templates (`tenantCols`, `tenantManageOpen`, `tenantDisableOpen`), but the rendered default page does not materialize rows/columns and the visible `管理` action is inert. `/Users/atilla/源码/unpacked 6/pages/group/GroupTenantPage.tsx` still describes the older four-card grid/right-drawer flow, so it is recorded as conflicting/stale secondary source for this page.

### React Changes

- Replaced the React card-grid/right-drawer surface with the actual owner HTML rendered shape: compact header, `新建租户` button, bordered horizontally scrollable table/panel, visible `管理` action and disable-reason note.
- Added a browser-local `创建新租户` modal matching the owner HTML modal fields and chip/select anatomy.
- Kept visible governance/safety copy in the runtime note, source note and local toasts: `degraded`, `mock`, `read-only`, `browser-local only`, `synthetic tenant metrics`, `no production tenant change`, `no tenant config persistence`, `no connector or feature flag change`, `no audit write`.
- Kept tenant seeds centralized in `groupTenantFallback.ts` for synthetic count/source accounting, but default React no longer exposes production-looking tenant rows because the rendered owner HTML does not expose them.
- Updated the existing tenant-management Playwright coverage to stop asserting the stale card/drawer flow.

## Data And Runtime Boundary

- All tenant seed refs remain centralized synthetic fallback data in `groupTenantFallback.ts`.
- Tenant refs remain `SYN-TENANT-*`, but default React does not expose the four tenant names/rows because owner HTML does not render them in the current visible state.
- Persistent UI copy states: `degraded`, `mock`, `read-only`, `browser-local only`, `synthetic tenant metrics`, `no production tenant change`, `no tenant config persistence`, `no connector or feature flag change`, `no audit write`.
- New-tenant modal field, capability and create actions mutate browser-local state only.
- No DB/API/runtime/authz/connector/feature-flag/audit/export/release wiring is implemented.

## Browser Evidence

Artifact directory:

- `/tmp/uzmax-m7-ui-73-tenant-management-source-parity-refresh/`

Captured/expected artifacts:

- Owner HTML table screenshot: `/tmp/uzmax-m7-ui-73-tenant-management-source-parity-refresh/owner-html-tenant-management-table.png`
- Owner HTML table DOM/text sample: `/tmp/uzmax-m7-ui-73-tenant-management-source-parity-refresh/owner-html-tenant-management-table-dom-sample.json`
- Owner HTML new-tenant modal screenshot: `/tmp/uzmax-m7-ui-73-tenant-management-source-parity-refresh/owner-html-tenant-management-new-tenant-modal.png`
- Owner HTML new-tenant modal DOM/text sample: `/tmp/uzmax-m7-ui-73-tenant-management-source-parity-refresh/owner-html-tenant-management-new-tenant-modal-dom-sample.json`
- Owner HTML manage-click no-op screenshot: `/tmp/uzmax-m7-ui-73-tenant-management-source-parity-refresh/owner-html-tenant-management-manage-click-noop.png`
- Unpacked source mapping: `/tmp/uzmax-m7-ui-73-tenant-management-source-parity-refresh/unpacked-tenant-management-source-mapping.json`
- React desktop table screenshot: `/tmp/uzmax-m7-ui-73-tenant-management-source-parity-refresh/react-tenant-management-desktop-table.png`
- React new-tenant modal/local-create screenshot: `/tmp/uzmax-m7-ui-73-tenant-management-source-parity-refresh/react-tenant-management-new-tenant-modal.png`
- React collapsed-sidebar screenshot: `/tmp/uzmax-m7-ui-73-tenant-management-source-parity-refresh/react-tenant-management-collapsed-sidebar.png`
- React mobile 320 screenshot: `/tmp/uzmax-m7-ui-73-tenant-management-source-parity-refresh/react-tenant-management-mobile-320.png`
- Metrics JSON: `/tmp/uzmax-m7-ui-73-tenant-management-source-parity-refresh/metrics.json`

## Validation

- PASS `git diff --check origin/codex/m7-ui-72-connection-center-source-parity-refresh...HEAD`
- PASS `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-72-connection-center-source-parity-refresh --spec docs/specs/M7-UI-73-tenant-management-source-parity-refresh.md --include-worktree`
  - `changedFiles: 9`
  - `categories: { source: 3, test: 2, docs: 4 }`
  - `source: { changedFiles: 3, netLoc: -81, newFiles: 0 }`
- PASS `node /Users/atilla/.codex/worktrees/m7-ui-64-ticket-source-parity-refresh/node_modules/prettier/bin/prettier.cjs --check ...`
- PASS `node node_modules/eslint/bin/eslint.js apps/admin/src/pages/group/GroupTenantPage.tsx apps/admin/src/pages/group/GroupTenantViews.tsx apps/admin/src/pages/group/groupTenantFallback.ts apps/admin/tests/m7-ui-tenant-management-source-parity.spec.ts apps/admin/tests/m7-ui-tenant-management.spec.ts`
- PASS `node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json --pretty false`
- PASS `node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir`
  - Existing Vite warning only: chunk larger than `500 kB`.
- PASS `PLAYWRIGHT_BASE_URL=http://127.0.0.1:4173 node node_modules/@playwright/test/cli.js test apps/admin/tests/m7-ui-tenant-management-source-parity.spec.ts apps/admin/tests/m7-ui-tenant-management.spec.ts --config=playwright.config.ts`
  - `6 passed`

Metrics highlights from `/tmp/uzmax-m7-ui-73-tenant-management-source-parity-refresh/metrics.json`:

- Owner default: `tenantManagement=true`, `newTenant=true`, `blankManagementAction=true`, `disableNote=true`, `tenantNames=false`, `tableColumns=false`, `capabilityRows=false`, `drawerFields=false`.
- Owner new modal: `fields=true`.
- Owner manage click: remains `blankManagementAction=true`, `drawerFields=false`, `tenantNames=false`, `capabilityRows=false`.
- React desktop: `shellLevel=group`, `activePageId=group.tenants`, `hasTenantId=false`, `navWidth=232`, `topbarHeight=53`, `sourceLikeDefaultVisible=true`, `tenantButtonCount=0`, `tenantCategoryCount=0`, `visiblePrimaryValuesClean=true`.
- React collapsed: `navWidth=68`.
- React mobile 320: `bodyScrollWidth=320`, `documentScrollWidth=320`, `panelWidth=296`, `tableScrollWidth=880`.
- React mobile modal: `modalWidth=296`.
- Source mapping: `reactFollows=owner-html-visible-table-state`, `unpackedCardGridConflictsWithOwnerHtml=true`.

## Remaining Deltas

- Runtime tenant DB/API/authz/audit paths remain intentionally not implemented.
- Real tenant creation, disable, restore, tenant config persistence, connector mutation, feature-flag mutation and audit writes are not implemented.
- The unpacked 6 card-grid/right-drawer source remains conflicting/stale relative to the current owner HTML rendered page.
- Owner visual acceptance, merge, runtime closure, GA-0 and 1.0 release approval are still required later and are not claimed here.
