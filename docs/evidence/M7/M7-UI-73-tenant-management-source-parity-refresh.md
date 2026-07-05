# M7-UI-73 Tenant Management Source Parity Refresh Evidence

## Status

`visible_ui_refresh_candidate_pending_pr_review_not_accepted_not_runtime_closed`

This branch refreshes browser-comparable source-parity evidence for `group.tenants` / `租户管理` on top of the latest #214 visible UI stack. It keeps tenant-management runtime downgraded: no tenant DB/API/runtime/authz, production tenant change, tenant config persistence, connector or feature flag persistence, audit write, owner visual acceptance, merge, runtime closure, GA-0 or 1.0 release approval is claimed.

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

- Fixed the confirmed primary visual mismatch: visible tenant card/drawer/capability values now follow frozen source (`运行中`, `成员`, `AI`, `连接`, `已启用`, `已停用`) instead of prefixing every row value with `mock`.
- Preserved visible governance/safety copy in the runtime note and local action toasts: `degraded`, `mock`, `read-only`, `browser-local only`, `synthetic tenant metrics`, `no production tenant change`, `no tenant config persistence`, `no connector or feature flag change`, `no audit write`.
- Kept older M7-UI-52 Playwright compatibility strings as screen-reader-only compatibility text so existing coverage can remain stable while the visual row shape is source-like.
- Kept the subtitle adaptation: frozen source says `创建 / 停用写审计`; React keeps `创建 / 停用` shape but uses local-only/no-audit wording because this slice cannot imply production audit writes.
- Tightened mobile CSS so compatibility text cannot widen the 320px mobile layout.

## Data And Runtime Boundary

- All tenant rows remain centralized synthetic fallback data in `groupTenantFallback.ts`.
- Tenant refs remain `SYN-TENANT-*`.
- Persistent UI copy states: `degraded`, `mock`, `read-only`, `browser-local only`, `synthetic tenant metrics`, `no production tenant change`, `no tenant config persistence`, `no connector or feature flag change`, `no audit write`.
- Language, timezone, capability, disable and restore actions mutate browser-local state only.
- No DB/API/runtime/authz/connector/feature-flag/audit/export/release wiring is implemented.

## Browser Evidence

Artifact directory:

- `/tmp/uzmax-m7-ui-73-tenant-management-source-parity-refresh/`

Expected captured artifacts:

- Owner HTML screenshot: `/tmp/uzmax-m7-ui-73-tenant-management-source-parity-refresh/owner-html-tenant-management-source-sample.png`
- Owner HTML DOM/text sample: `/tmp/uzmax-m7-ui-73-tenant-management-source-parity-refresh/owner-html-tenant-management-source-dom-sample.json`
- Unpacked source mapping: `/tmp/uzmax-m7-ui-73-tenant-management-source-parity-refresh/unpacked-tenant-management-source-mapping.json`
- React desktop screenshot: `/tmp/uzmax-m7-ui-73-tenant-management-source-parity-refresh/react-tenant-management-desktop.png`
- React drawer screenshot: `/tmp/uzmax-m7-ui-73-tenant-management-source-parity-refresh/react-tenant-management-drawer.png`
- React local-action/confirm screenshot: `/tmp/uzmax-m7-ui-73-tenant-management-source-parity-refresh/react-tenant-management-local-action-confirm.png`
- React collapsed-sidebar screenshot: `/tmp/uzmax-m7-ui-73-tenant-management-source-parity-refresh/react-tenant-management-collapsed-sidebar.png`
- React mobile 320 screenshot: `/tmp/uzmax-m7-ui-73-tenant-management-source-parity-refresh/react-tenant-management-mobile-320.png`
- Metrics JSON: `/tmp/uzmax-m7-ui-73-tenant-management-source-parity-refresh/metrics.json`

## Validation

Commands run from `/Users/atilla/.codex/worktrees/m7-ui-73-tenant-management-source-parity-refresh` with bundled Node on PATH where needed:

- `git diff --check origin/codex/m7-ui-72-connection-center-source-parity-refresh...HEAD --` - passed.
- `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-72-connection-center-source-parity-refresh --spec docs/specs/M7-UI-73-tenant-management-source-parity-refresh.md --include-worktree` - passed after removing the temporary `node_modules` symlink used for local validation.
- `node node_modules/prettier/bin/prettier.cjs --check apps/admin/tests/m7-ui-tenant-management-source-parity.spec.ts apps/admin/src/pages/group/GroupTenantViews.tsx apps/admin/src/pages/group/groupTenantFallback.ts docs/specs/M7-UI-73-tenant-management-source-parity-refresh.md docs/evidence/M7/M7-UI-73-tenant-management-source-parity-refresh.md docs/evidence/M7/README.md docs/admin-ui-page-migration-ledger.md` - passed.
- `node node_modules/eslint/bin/eslint.js apps/admin/src/pages/group/GroupTenantViews.tsx apps/admin/src/pages/group/groupTenantFallback.ts apps/admin/tests/m7-ui-tenant-management-source-parity.spec.ts` - passed.
- `node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json --pretty false` - passed.
- `node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir` - passed with the existing Vite warning that some chunks are larger than 500 kB.
- `PLAYWRIGHT_BASE_URL=http://127.0.0.1:4173 node node_modules/@playwright/test/cli.js test apps/admin/tests/m7-ui-tenant-management-source-parity.spec.ts apps/admin/tests/m7-ui-tenant-management.spec.ts --config=playwright.config.ts` - passed, 7 tests.

`pr-shape` summary:

```json
{
  "base": "origin/codex/m7-ui-72-connection-center-source-parity-refresh",
  "specPath": "docs/specs/M7-UI-73-tenant-management-source-parity-refresh.md",
  "specType": "feature",
  "bootstrapException": false,
  "changedFiles": 7,
  "categories": {
    "source": 2,
    "docs": 4,
    "test": 1
  },
  "source": {
    "changedFiles": 2,
    "netLoc": 0,
    "newFiles": 0
  }
}
```

Browser metric highlights from `/tmp/uzmax-m7-ui-73-tenant-management-source-parity-refresh/metrics.json`:

- Desktop: `shellLevel=group`, `activePageId=group.tenants`, `hasTenantId=false`, `navWidth=232`, `topbarHeight=53`, `cardCount=4`, `bodyScrollWidth=1440`, `documentScrollWidth=1440`, `sourceLikeDefaultVisible=true`, `visiblePrimaryValuesClean=true`.
- Drawer: 3 capability rows, source-like drawer/select/local-action anatomy visible, browser-local toast states no production tenant change and no audit write.
- Confirm flow: reason-required confirm modal is captured and source-like; local capability toast states no connector or feature flag change and no audit write.
- Collapsed sidebar: `navWidth=68`, group categories only (`总览`, `平台`, `治理`), tenant category/button counts `0`, `visiblePrimaryValuesClean=true`.
- Mobile 320: `bodyScrollWidth=320`, `documentScrollWidth=320`, `drawerWidth=320`, `actionWidth=296`, `cardCount=4`, group categories only (`总览`, `平台`, `治理`), tenant category/button counts `0`, `visiblePrimaryValuesClean=true`.

## Remaining Deltas

- Runtime tenant DB/API/authz/audit paths remain intentionally not implemented.
- Real tenant creation, disable, restore, tenant config persistence, connector mutation, feature-flag mutation and audit writes are not implemented.
- Tenant rows remain synthetic `SYN-TENANT-*` refs; source shape is improved, but production-looking runtime ids/statuses are intentionally avoided.
- Owner visual acceptance, merge, runtime closure, GA-0 and 1.0 release approval are still required later and are not claimed here.
