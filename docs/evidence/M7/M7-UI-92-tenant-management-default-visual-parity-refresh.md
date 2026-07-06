# M7-UI-92 Tenant Management Default Visual Parity Refresh Evidence

## Status

`visible_ui_refresh_candidate_pending_pr_review_not_accepted_not_runtime_closed`

This branch refreshes default-visible copy for `group.tenants` / `租户管理` on top of `codex/m7-ui-91-logs-default-visual-parity-refresh`. It keeps tenant-management runtime downgraded: no tenant DB/API/runtime/authz, production tenant change, tenant config persistence, connector or feature flag persistence, audit write, owner visual acceptance, merge, runtime closure, GA-0 or 1.0 release approval is claimed.

## Scope

- Spec: `docs/specs/M7-UI-92-tenant-management-default-visual-parity-refresh.md`
- Route: `group.tenants`
- Base: `codex/m7-ui-91-logs-default-visual-parity-refresh`
- Branch/worktree: `codex/m7-ui-92-tenant-management-default-visual-parity-refresh` / `/Users/atilla/.codex/worktrees/m7-ui-92-tenant-management-default-visual-parity-refresh`
- Source targets:
  - `apps/admin/src/pages/group/GroupTenantPage.tsx`
  - `apps/admin/src/pages/group/GroupTenantViews.tsx`
  - `apps/admin/src/pages/group/groupTenantFallback.ts`
- Test targets:
  - `apps/admin/tests/m7-ui-tenant-management.spec.ts`
  - `apps/admin/tests/m7-ui-tenant-management-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-tenant-management-default-visual-parity.spec.ts`

## Startup Evidence

- `pwd`: `/Users/atilla/.codex/worktrees/m7-ui-92-tenant-management-default-visual-parity-refresh`
- `git status --short --branch`: `## codex/m7-ui-92-tenant-management-default-visual-parity-refresh`
- `git branch --show-current`: `codex/m7-ui-92-tenant-management-default-visual-parity-refresh`
- Root/main checkout at `/Users/atilla/Applications/UZMAX智能运营` was not used for code edits.

## Source Review

- Read `AGENTS.md`.
- Ran Impeccable context for `apps/admin/src/pages/group/GroupTenantPage.tsx` with the Codex runtime `node`; read product-register and clarify guidance.
- Read `PRODUCT.md`, `DESIGN.md`, `docs/admin-design-system.md`, `docs/admin-ui-page-migration-ledger.md` and `docs/evidence/M7/README.md`.
- Read prior/default-refresh inputs:
  - `docs/specs/M7-UI-52-tenant-management-page.md`
  - `docs/specs/M7-UI-73-tenant-management-source-parity-refresh.md`
  - `docs/specs/M7-UI-90-analytics-default-visual-parity-refresh.md`
  - `docs/specs/M7-UI-91-logs-default-visual-parity-refresh.md`
  - `docs/evidence/M7/M7-UI-52-tenant-management-page.md`
  - `docs/evidence/M7/M7-UI-73-tenant-management-source-parity-refresh.md`
  - `docs/evidence/M7/M7-UI-91-logs-default-visual-parity-refresh.md`
  - `apps/admin/tests/m7-ui-logs-default-visual-parity.spec.ts`
- Inspected owner/prototype sources:
  - `/Users/atilla/Downloads/运营塔台1.0.html`
  - `/Users/atilla/源码/unpacked 6/pages/group/GroupTenantPage.tsx`
  - `/Users/atilla/源码/unpacked 6/fixtures/groupPlatform.ts`
  - `/Users/atilla/源码/unpacked 6/shell/navigation.ts`
- Reviewed v1.1 tenant-management/group-layer boundaries: PRD REQ-G02, admin IA `租户管理`, technical architecture multi-tenant/authz/RLS rules and acceptance matrix tenant isolation/audit gates.

## Default Visual Refresh Changes

- Replaced visible header badge `集团级 · mock/degraded · read-only` with `集团级租户管理`.
- Hid the runtime note while preserving the full boundary in hidden DOM, `data-runtime-boundary`, `title` and `aria-description`.
- Replaced the visible source note with operational copy: `停用租户须填写原因 · 停用后保留只读审计与数据导出入口`; boundary metadata remains present on the same surface.
- Replaced manage feedback with `管理动作需等待租户明细接入。`
- Replaced create feedback with `租户创建已加入预览队列：...。租户明细接入后可继续配置渠道与模板。`
- Replaced forced loading/empty/error/permission state copy with business-readable Chinese while preserving runtime boundary metadata and hidden text.
- Added focused default visual parity Playwright coverage for clean default body, manage/create feedback, forced states, group/tenant nav separation, collapsed nav and mobile 320.
- Updated existing tenant-management tests and source-parity metrics so they assert hidden/data/title/ARIA boundary evidence instead of requiring visible engineering labels.

## Data And Runtime Boundary

- All tenant seed refs remain centralized fallback data in `groupTenantFallback.ts`.
- Default React still follows the M7-UI-73 owner-rendered table/new-tenant shape; it does not expose tenant card grid/right drawer/tenant rows by default.
- New-tenant modal field, capability and create actions mutate browser-local state only.
- Manage remains a no-op feedback action and does not navigate to real tenant management.
- Runtime labels remain present in hidden DOM/data/title/ARIA evidence: `degraded`, `mock`, `read-only`, `browser-local only`, `synthetic tenant metrics`, `no production tenant change`, `no tenant config persistence`, `no connector or feature flag change`, `no audit write`.
- No DB/API/runtime/authz/connector/feature-flag/audit/export/release wiring is implemented.

## Browser Evidence

Artifact directory target:

- `/tmp/uzmax-m7-ui-92-tenant-management-default-visual-parity-refresh/`

Captured artifacts from focused Playwright:

- React default clean screenshot: `/tmp/uzmax-m7-ui-92-tenant-management-default-visual-parity-refresh/react-tenant-management-default-clean.png`
- React manage feedback clean screenshot: `/tmp/uzmax-m7-ui-92-tenant-management-default-visual-parity-refresh/react-tenant-management-manage-toast-clean.png`
- React new modal clean screenshot: `/tmp/uzmax-m7-ui-92-tenant-management-default-visual-parity-refresh/react-tenant-management-new-modal-clean.png`
- React create feedback clean screenshot: `/tmp/uzmax-m7-ui-92-tenant-management-default-visual-parity-refresh/react-tenant-management-create-toast-clean.png`
- React collapsed nav clean screenshot: `/tmp/uzmax-m7-ui-92-tenant-management-default-visual-parity-refresh/react-tenant-management-collapsed-clean.png`
- React mobile 320 clean screenshot: `/tmp/uzmax-m7-ui-92-tenant-management-default-visual-parity-refresh/react-tenant-management-mobile-320-clean.png`
- Metrics JSON: `/tmp/uzmax-m7-ui-92-tenant-management-default-visual-parity-refresh/metrics.json`

Metrics highlights:

- Desktop: `activePageId=group.tenants`, `bodyScrollWidth=1440`, `documentScrollWidth=1440`, `navWidth=232`, `runtimeLabelsPresent=true`, `runtimeLabelsVisibleInBody=false`, `visibleBodyClean=true`.
- Collapsed: `navWidth=68`, `runtimeLabelsPresent=true`, `runtimeLabelsVisibleInBody=false`, `visibleBodyClean=true`.
- Mobile 320: `bodyScrollWidth=320`, `documentScrollWidth=320`, `runtimeLabelsPresent=true`, `runtimeLabelsVisibleInBody=false`, `visibleBodyClean=true`.

## Validation

Validation status: `PASS`.

Environment notes:

- Default shell had `node` and `gh` unavailable until the Codex runtime PATH was used for Node commands; `gh` remained unavailable locally.
- Worktree had no local `node_modules`.
- Validation used a temporary worktree-local symlink: `node_modules -> /Users/atilla/.codex/worktrees/m7-ui-64-ticket-source-parity-refresh/node_modules`.
- `pr-shape --include-worktree` was run after removing the symlink so dependency plumbing was not counted as an out-of-scope worktree file.
- Playwright config webServer calls `npm`, which is unavailable in this runtime PATH; validation used the successful build plus manual `vite preview` on `127.0.0.1:4173`, then Playwright reused the existing server.

Completed validation:

- PASS: `git diff --check codex/m7-ui-91-logs-default-visual-parity-refresh...HEAD`
- PASS: `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node scripts/guards/pr-shape.mjs --base codex/m7-ui-91-logs-default-visual-parity-refresh --spec docs/specs/M7-UI-92-tenant-management-default-visual-parity-refresh.md --include-worktree`
  - `changedFiles: 10`
  - `categories: { source: 3, test: 3, docs: 4 }`
  - `source: { changedFiles: 3, netLoc: 0, newFiles: 0 }`
- PASS: touched Prettier:
  - `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node node_modules/prettier/bin/prettier.cjs --check apps/admin/src/pages/group/GroupTenantPage.tsx apps/admin/src/pages/group/GroupTenantViews.tsx apps/admin/src/pages/group/groupTenantFallback.ts apps/admin/tests/m7-ui-tenant-management.spec.ts apps/admin/tests/m7-ui-tenant-management-source-parity.spec.ts apps/admin/tests/m7-ui-tenant-management-default-visual-parity.spec.ts docs/specs/M7-UI-92-tenant-management-default-visual-parity-refresh.md docs/evidence/M7/M7-UI-92-tenant-management-default-visual-parity-refresh.md docs/evidence/M7/README.md docs/admin-ui-page-migration-ledger.md`
- PASS: touched ESLint:
  - `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node node_modules/eslint/bin/eslint.js apps/admin/src/pages/group/GroupTenantPage.tsx apps/admin/src/pages/group/GroupTenantViews.tsx apps/admin/src/pages/group/groupTenantFallback.ts apps/admin/tests/m7-ui-tenant-management.spec.ts apps/admin/tests/m7-ui-tenant-management-source-parity.spec.ts apps/admin/tests/m7-ui-tenant-management-default-visual-parity.spec.ts`
- PASS: Admin build with existing Vite warning:
  - `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir`
  - Existing warning: bundle chunk larger than 500 kB after minification.
- Initial Playwright attempt hit the known local webServer issue:
  - `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node node_modules/@playwright/test/cli.js test apps/admin/tests/m7-ui-tenant-management.spec.ts apps/admin/tests/m7-ui-tenant-management-source-parity.spec.ts apps/admin/tests/m7-ui-tenant-management-default-visual-parity.spec.ts`
  - Result: `/bin/sh: npm: command not found`; config webServer could not start.
- PASS: focused Playwright with manual preview:
  - Server: `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node node_modules/vite/bin/vite.js preview apps/admin --host 127.0.0.1 --port 4173`
  - `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node node_modules/@playwright/test/cli.js test apps/admin/tests/m7-ui-tenant-management.spec.ts apps/admin/tests/m7-ui-tenant-management-source-parity.spec.ts apps/admin/tests/m7-ui-tenant-management-default-visual-parity.spec.ts`
  - Result: `7 passed`

Cleanup status:

- COMPLETE after validation: temporary `node_modules` symlink, `apps/admin/dist`, `test-results` and `playwright-report` removed before final commit.

## Remaining Deltas

- This branch is default visual parity/evidence refresh only; it does not claim owner visual acceptance.
- Tenant DB/API/runtime/authz, production tenant creation/disable/restore, tenant config persistence, connector or feature flag mutation and audit writes are intentionally not implemented.
- Real tenant data, production permission enforcement and release approval remain future runtime specs, not this UI slice.
- Merge, runtime closure, GA-0 and 1.0 release approval are still required later and are not claimed here.
