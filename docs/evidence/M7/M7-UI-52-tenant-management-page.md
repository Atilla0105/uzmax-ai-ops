# M7-UI-52 Tenant Management Page Evidence

## Status

`implementation_candidate_pending_pr_review_not_accepted_not_runtime_closed`

This branch implements a visible UI-first `group.tenants` / `租户管理` candidate with synthetic mock/degraded data. It does not claim owner visual acceptance, runtime closure, production tenant changes, tenant config persistence, connector or feature-flag changes, audit writes, GA-0, or 1.0 release approval.

## Scope

- Spec: `docs/specs/M7-UI-52-tenant-management-page.md`
- Route: `group.tenants`
- Source target: `apps/admin/src/pages/group/GroupTenantPage.tsx`, `apps/admin/src/pages/group/GroupTenantViews.tsx`, `apps/admin/src/pages/group/groupTenantFallback.ts`
- Test target: `apps/admin/tests/m7-ui-tenant-management.spec.ts`

## Source Review

- Read `AGENTS.md`.
- Read `docs/admin-design-system.md`.
- Read `docs/specs/SPEC-template.md`.
- Ran Impeccable context for `apps/admin/src/pages/group/GroupTenantPage.tsx` and read product-register guidance.
- Inspected current group page examples:
  - `apps/admin/src/pages/group/GroupConnectionPage.tsx`
  - `apps/admin/src/pages/group/GroupConnectionViews.tsx`
  - `apps/admin/src/pages/group/groupConnectionFallback.ts`
  - `apps/admin/tests/m7-ui-connection-center.spec.ts`
- Inspected worker-boundary caution: `docs/incidents/INC-2026-07-05-m7-ui-51-root-patch-target.md`; remaining writes used absolute assigned-worktree patch paths.
- Inspected owner/prototype sources:
  - `/Users/atilla/源码/unpacked 6/pages/group/GroupTenantPage.tsx`
  - `/Users/atilla/源码/unpacked 6/fixtures/groupPlatform.ts` tenant section (`GROUP_TENANTS`, `TENANT_STATUS_COLORS`)
  - `/Users/atilla/Downloads/运营塔台1.0.html` 租户管理 region around header/table/drawer/disable modal.

## Three-Way Comparison

| Surface | Owner / unpacked source | React candidate | Result |
|---|---|---|---|
| Header | `租户管理`; source copy includes tenant count and create/disable audit language | React uses `4 个租户 · 创建 / 停用仅本地预览 · no audit write` plus degraded/mock badge | Aligned with local-only boundary; avoids audit-write claim |
| Tenant list | Unpacked React source and worker visual contract require tenant card grid; packed HTML region still has a table/new tenant path | React renders four button cards with status dot/name/status badge, line/template, synthetic member/AI/connection stats | Aligned to this slice contract; packed HTML table/new-tenant path remains a recorded visual delta |
| Management drawer | Source drawer has title/status, language/timezone fields, channel capabilities, disabled notice, restore/disable actions and audit-related copy | React drawer preserves those controls with accessible dialog behavior, Escape/Tab handling and local-only boundary copy | Aligned for UI-first local preview |
| Disable modal | Source requires disable reason | React uses shared `ConfirmModal` with required reason; disabled confirm until reason is entered | Aligned; local-only copy prevents audit/runtime overclaim |
| Runtime states | Prototype shows default page | React adds deterministic loading/empty/error/permission/degraded states | Required M7 state coverage |

## Data Boundary

- All tenant rows are synthetic and centralized in `groupTenantFallback.ts`.
- Tenant refs use `SYN-TENANT-*`.
- Persistent UI copy states: `degraded`, `mock`, `read-only`, `browser-local only`, `synthetic tenant metrics`, `no production tenant change`, `no tenant config persistence`, `no connector or feature flag change`, `no audit write`.
- Language, timezone, capability, disable and restore actions mutate browser-local UI state only. Toast copy explicitly says no production tenant change and no audit write; capability copy also says no connector or feature-flag change.
- No DB/API/runtime/authz/connector/feature-flag/audit/export/release wiring is implemented.

## Review Fix

- P1 nested-modal fix: the tenant drawer is unmounted before the shared disable `ConfirmModal` opens, then restored after cancel or confirm. During reason confirmation there is only one active `role="dialog" aria-modal="true"` context.
- P2 keyboard coverage: focused Playwright now asserts initial focus lands on the drawer close button, Tab/Shift+Tab wrap inside the drawer, Escape closes the drawer, and focus returns to the originating tenant card.

## Validation

Passed locally on this branch:

- `git diff --check origin/codex/m7-ui-51-connection-center-visible-ui`
- `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-51-connection-center-visible-ui --spec docs/specs/M7-UI-52-tenant-management-page.md --include-worktree`
- `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/prettier/bin/prettier.cjs --check docs/specs/M7-UI-52-tenant-management-page.md docs/evidence/M7/M7-UI-52-tenant-management-page.md docs/admin-ui-page-migration-ledger.md docs/evidence/M7/README.md apps/admin/src/pages/PageOutlet.tsx apps/admin/src/pages/registry.ts apps/admin/src/pages/group/GroupTenantPage.tsx apps/admin/src/pages/group/GroupTenantViews.tsx apps/admin/src/pages/group/groupTenantFallback.ts apps/admin/tests/m7-ui-tenant-management.spec.ts`
- `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/eslint/bin/eslint.js apps/admin/src/pages/PageOutlet.tsx apps/admin/src/pages/registry.ts apps/admin/src/pages/group/GroupTenantPage.tsx apps/admin/src/pages/group/GroupTenantViews.tsx apps/admin/src/pages/group/groupTenantFallback.ts apps/admin/tests/m7-ui-tenant-management.spec.ts`
- `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json --pretty false`
- `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir`
- `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/vite/bin/vite.js preview apps/admin --host 127.0.0.1 --port 4173`
- `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/@playwright/test/cli.js test apps/admin/tests/m7-ui-tenant-management.spec.ts`
- `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/@playwright/test/cli.js test apps/admin/tests/m7-ui-group-overview.spec.ts apps/admin/tests/m7-ui-conversation-workbench.spec.ts apps/admin/tests/m7-ui-conversation-workbench-fallback.spec.ts apps/admin/tests/m7-ui-ticket-page.spec.ts apps/admin/tests/m7-ui-knowledge-resources.spec.ts apps/admin/tests/m7-ui-eval-center.spec.ts apps/admin/tests/m7-ui-ai-members.spec.ts apps/admin/tests/m7-ui-model-cost-risk.spec.ts apps/admin/tests/m7-ui-template-center.spec.ts apps/admin/tests/m7-ui-connection-center.spec.ts apps/admin/tests/m7-ui-tenant-management.spec.ts`

Validation notes:

- The shell does not expose `node`, `npm` or `npx` by default. Commands used the existing Node runtime at `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node`.
- Because `playwright.config.ts` webServer uses `npm`/`npx`, preview was started manually with direct Node and Playwright reused `http://127.0.0.1:4173`.
- `.prettierignore` ignores `*.md` and `docs/**`; the Prettier command validates matched source/test files and skips docs by repo rule.
- `guard:pr-shape` output before commit: `changedFiles=10`, categories source `5`, docs `4`, test `1`.
- Tenant source line counts after review fix: `GroupTenantPage.tsx` 206, `GroupTenantViews.tsx` 245, `groupTenantFallback.ts` 146.
- Vite emitted the existing large chunk warning and exited 0.
- Focused tenant management Playwright: `5 passed`.
- Stacked visible UI regression: `54 passed`.

## Browser Evidence

Expected artifacts under `/tmp/uzmax-m7-ui-52-tenant-management-visible-ui/`:

- Desktop screenshot: `/tmp/uzmax-m7-ui-52-tenant-management-visible-ui/react-tenant-management-desktop.png`
- Drawer screenshot: `/tmp/uzmax-m7-ui-52-tenant-management-visible-ui/react-tenant-management-drawer.png`
- Mobile 320 screenshot: `/tmp/uzmax-m7-ui-52-tenant-management-visible-ui/react-tenant-management-mobile-320.png`
- Metrics JSON: `/tmp/uzmax-m7-ui-52-tenant-management-visible-ui/react-tenant-management-metrics.json`

Metrics summary:

- `activePageId`: `group.tenants`
- `shellLevel`: `group`
- `sidebarExpandedWidth`: `232`
- `topbarHeight`: `53`
- `cardCount`: `4`
- `firstCardWidth`: `324`
- `drawerWidth`: `440`
- `bodyScrollWidth`: `1280` on desktop capture; mobile test asserted `document.body.scrollWidth <= 320` and drawer width `<= 320`.

## Remaining Deltas

- Runtime tenant DB/API/authz/audit paths remain intentionally not implemented.
- Real tenant creation, disable, restore, tenant config persistence, connector mutation, feature-flag mutation and audit writes are not implemented.
- Packed owner HTML still includes a table/new-tenant/export/audit-row expression that is outside this task's explicit card-grid/local-only contract.
- Owner visual acceptance is still required after PR review/browser comparison.
