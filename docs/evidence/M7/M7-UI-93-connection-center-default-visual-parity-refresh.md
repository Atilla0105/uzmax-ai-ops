# M7-UI-93 Connection Center Default Visual Parity Refresh Evidence

## Status

`visible_ui_refresh_candidate_pending_pr_review_not_accepted_not_runtime_closed`

This branch refreshes default-visible copy for `group.connections` / `连接中心` on top of `codex/m7-ui-92-tenant-management-default-visual-parity-refresh`. It keeps connector runtime downgraded: no connector DB/API/runtime, production connector mutation, real Telegram/order/import test, feature-flag persistence, audit write, owner visual acceptance, merge, runtime closure, GA-0 or 1.0 release approval is claimed.

## Scope

- Spec: `docs/specs/M7-UI-93-connection-center-default-visual-parity-refresh.md`
- Route: `group.connections`
- Base: `codex/m7-ui-92-tenant-management-default-visual-parity-refresh`
- Branch/worktree: `codex/m7-ui-93-connection-center-default-visual-parity-refresh` / `/Users/atilla/.codex/worktrees/m7-ui-93-connection-center-default-visual-parity-refresh`
- Source targets:
  - `apps/admin/src/pages/group/GroupConnectionPage.tsx`
  - `apps/admin/src/pages/group/GroupConnectionViews.tsx`
  - `apps/admin/src/pages/group/groupConnectionFallback.ts`
- Test targets:
  - `apps/admin/tests/m7-ui-connection-center.spec.ts`
  - `apps/admin/tests/m7-ui-connection-center-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-connection-center-default-visual-parity.spec.ts`

## Startup Evidence

- `pwd`: `/Users/atilla/.codex/worktrees/m7-ui-93-connection-center-default-visual-parity-refresh`
- `git status --short --branch`: `## codex/m7-ui-93-connection-center-default-visual-parity-refresh`
- `git branch --show-current`: `codex/m7-ui-93-connection-center-default-visual-parity-refresh`
- `git rev-parse HEAD`: `4d202c2404d3a7c0fea041514fefaf91b4c1c2eb`
- Root/main checkout at `/Users/atilla/Applications/UZMAX智能运营` was not used for code edits.

## Source Review

- Read `AGENTS.md`.
- Ran Impeccable context for `apps/admin/src/pages/group/GroupConnectionPage.tsx` with the Codex runtime `node`; read product-register and clarify guidance.
- Read `PRODUCT.md`, `DESIGN.md`, `docs/admin-design-system.md`, `docs/admin-ui-page-migration-ledger.md` and `docs/evidence/M7/README.md`.
- Read prior/default-refresh inputs:
  - `docs/specs/M7-UI-51-connection-center-page.md`
  - `docs/specs/M7-UI-72-connection-center-source-parity-refresh.md`
  - `docs/specs/M7-UI-91-logs-default-visual-parity-refresh.md`
  - `docs/specs/M7-UI-92-tenant-management-default-visual-parity-refresh.md`
  - `docs/evidence/M7/M7-UI-51-connection-center-page.md`
  - `docs/evidence/M7/M7-UI-72-connection-center-source-parity-refresh.md`
  - `docs/evidence/M7/M7-UI-92-tenant-management-default-visual-parity-refresh.md`
- Inspected owner/prototype sources:
  - `/Users/atilla/Downloads/运营塔台1.0.html`
  - `/Users/atilla/源码/unpacked 6/pages/group/GroupConnectionPage.tsx`
  - `/Users/atilla/源码/unpacked 6/fixtures/groupPlatform.ts`
  - `/Users/atilla/源码/unpacked 6/shell/navigation.ts`
- Reviewed v1.1 connector/group-layer boundaries: group IA `连接中心`, connector/order-import runtime boundaries, mobile fallback and acceptance/release gate rules.

## Default Visual Refresh Changes

- Replaced visible header badge `集团级 · mock/degraded · read-only` with `集团级连接管理`.
- Replaced visible subtitle `集团级连接类型 · 启停/测试本地预览 · browser-local only` with `集团级连接类型 · 启停/测试`.
- Hid the runtime note while preserving the full boundary in hidden DOM, `data-runtime-boundary`, `title` and `aria-description`.
- Replaced toggle feedback with `... 已在本页启用/停用。连接规则接入后可同步到正式配置。`
- Replaced test feedback with `... 复测已完成，请查看最近错误与接入定级。`
- Replaced forced loading/empty/error/permission state copy with business-readable Chinese while preserving runtime boundary metadata and hidden text.
- Added focused default visual parity Playwright coverage for clean default body, toggle/test feedback, forced states, group/tenant nav separation, collapsed nav and mobile 320.
- Updated existing connection-center tests and source-parity metrics so they assert hidden/data/title/ARIA boundary evidence instead of requiring visible engineering labels.

## Data And Runtime Boundary

- All connector rows remain centralized synthetic fallback data in `groupConnectionFallback.ts`.
- Connector IDs remain `SYN-CONN-*`.
- Default React keeps M7-UI-72 source-shaped connector values: `正常`, `部分可行`, `不可用`, `4 个租户`, `标准接入`, `无`, `已启用`/`已停用`.
- Toggle/test actions mutate page-local state only.
- Runtime labels remain present in hidden DOM/data/title/ARIA evidence: `degraded`, `mock`, `read-only`, `browser-local only`, `synthetic health`, `no production connector change`, `no real connection test`, `no audit write`.
- No DB/API/runtime/connector/feature-flag/audit/export/release wiring is implemented.

## Browser Evidence

Artifact directory target:

- `/tmp/uzmax-m7-ui-93-connection-center-default-visual-parity-refresh/`

Expected focused artifacts from Playwright:

- React default clean screenshot: `/tmp/uzmax-m7-ui-93-connection-center-default-visual-parity-refresh/react-connection-center-default-clean.png`
- React toggle feedback clean screenshot: `/tmp/uzmax-m7-ui-93-connection-center-default-visual-parity-refresh/react-connection-center-toggle-toast-clean.png`
- React test feedback clean screenshot: `/tmp/uzmax-m7-ui-93-connection-center-default-visual-parity-refresh/react-connection-center-test-toast-clean.png`
- React collapsed nav clean screenshot: `/tmp/uzmax-m7-ui-93-connection-center-default-visual-parity-refresh/react-connection-center-collapsed-clean.png`
- React mobile 320 clean screenshot: `/tmp/uzmax-m7-ui-93-connection-center-default-visual-parity-refresh/react-connection-center-mobile-320-clean.png`
- Metrics JSON: `/tmp/uzmax-m7-ui-93-connection-center-default-visual-parity-refresh/metrics.json`

Metrics highlights:

- Desktop: `activePageId=group.connections`, `shellLevel=group`, `bodyScrollWidth=1440`, `documentScrollWidth=1440`, `navWidth=232`, `runtimeLabelsPresent=true`, `runtimeLabelsVisibleInBody=false`, `visibleBodyClean=true`.
- Local action: `activePageId=group.connections`, `runtimeLabelsPresent=true`, `runtimeLabelsVisibleInBody=false`, `visibleBodyClean=true`.
- Collapsed: `navWidth=68`, `runtimeLabelsPresent=true`, `runtimeLabelsVisibleInBody=false`, `visibleBodyClean=true`.
- Mobile 320: `bodyScrollWidth=320`, `documentScrollWidth=320`, `firstCardWidth=296`, `runtimeLabelsPresent=true`, `runtimeLabelsVisibleInBody=false`, `visibleBodyClean=true`.

## Validation

Validation status: `PASS`.

Environment notes:

- Default shell had `node`, `npm` and `npx` unavailable until the Codex runtime PATH was used for Node commands.
- Worktree had no local `node_modules`.
- Validation used a temporary worktree-local symlink: `node_modules -> /Users/atilla/.codex/worktrees/m7-ui-64-ticket-source-parity-refresh/node_modules`.
- `pr-shape --include-worktree` was run after removing the symlink so dependency plumbing was not counted as an out-of-scope worktree file.
- Playwright config webServer calls `npm`, which is unavailable in this runtime PATH; validation used the successful build plus manual `vite preview` on `127.0.0.1:4173`, then Playwright reused the existing server.

Completed validation:

- PASS: `git diff --check codex/m7-ui-92-tenant-management-default-visual-parity-refresh...HEAD`
- PASS: `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node scripts/guards/pr-shape.mjs --base codex/m7-ui-92-tenant-management-default-visual-parity-refresh --spec docs/specs/M7-UI-93-connection-center-default-visual-parity-refresh.md --include-worktree`
  - `changedFiles: 10`
  - `categories: { source: 3, test: 3, docs: 4 }`
  - `source: { changedFiles: 3, netLoc: 0, newFiles: 0 }`
- PASS: touched Prettier:
  - `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node node_modules/prettier/bin/prettier.cjs --check apps/admin/src/pages/group/GroupConnectionPage.tsx apps/admin/src/pages/group/GroupConnectionViews.tsx apps/admin/src/pages/group/groupConnectionFallback.ts apps/admin/tests/m7-ui-connection-center.spec.ts apps/admin/tests/m7-ui-connection-center-source-parity.spec.ts apps/admin/tests/m7-ui-connection-center-default-visual-parity.spec.ts docs/specs/M7-UI-93-connection-center-default-visual-parity-refresh.md docs/evidence/M7/M7-UI-93-connection-center-default-visual-parity-refresh.md docs/evidence/M7/README.md docs/admin-ui-page-migration-ledger.md`
- PASS: touched ESLint:
  - `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node node_modules/eslint/bin/eslint.js apps/admin/src/pages/group/GroupConnectionPage.tsx apps/admin/src/pages/group/GroupConnectionViews.tsx apps/admin/src/pages/group/groupConnectionFallback.ts apps/admin/tests/m7-ui-connection-center.spec.ts apps/admin/tests/m7-ui-connection-center-source-parity.spec.ts apps/admin/tests/m7-ui-connection-center-default-visual-parity.spec.ts`
- PASS: Admin build with existing Vite warning:
  - `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir`
  - Existing warning: bundle chunk larger than 500 kB after minification.
- Initial Playwright attempt hit the known local webServer issue:
  - `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node node_modules/@playwright/test/cli.js test apps/admin/tests/m7-ui-connection-center.spec.ts apps/admin/tests/m7-ui-connection-center-source-parity.spec.ts apps/admin/tests/m7-ui-connection-center-default-visual-parity.spec.ts`
  - Result: `/bin/sh: npm: command not found`; config webServer could not start.
- PASS: focused Playwright with manual preview:
  - Server: `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node node_modules/vite/bin/vite.js preview apps/admin --host 127.0.0.1 --port 4173`
  - `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node node_modules/@playwright/test/cli.js test apps/admin/tests/m7-ui-connection-center.spec.ts apps/admin/tests/m7-ui-connection-center-source-parity.spec.ts apps/admin/tests/m7-ui-connection-center-default-visual-parity.spec.ts`
  - Result: `6 passed`

Cleanup status:

- COMPLETE after validation: temporary `node_modules` symlink, `apps/admin/dist`, `test-results` and `playwright-report` removed before final commit.

## Remaining Deltas

- This branch is default visual parity/evidence refresh only; it does not claim owner visual acceptance.
- Connector DB/API/runtime, production connector mutation, feature-flag persistence, real Telegram Bot/Business/order/import connection tests and audit writes are intentionally not implemented.
- Real connector data, production permission enforcement and release approval remain future runtime specs, not this UI slice.
- Merge, runtime closure, GA-0 and 1.0 release approval are still required later and are not claimed here.
