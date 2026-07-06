# M7-UI-95 Group Logs Default Visual Parity Refresh Evidence

## Status

`visible_ui_refresh_candidate_pending_pr_review_not_accepted_not_runtime_closed`

This branch refreshes default-visible copy for `group.logs` / `集团日志` on top of `codex/m7-ui-94-template-center-default-visual-parity-refresh`. It keeps group-log runtime downgraded: no audit DB/API/runtime/authz, production audit export, file write, export job, real audit query, real record navigation, trace closure, owner visual acceptance, merge, runtime closure, GA-0 or 1.0 release approval is claimed.

## Scope

- Spec: `docs/specs/M7-UI-95-group-logs-default-visual-parity-refresh.md`
- Route: `group.logs`
- Base: `codex/m7-ui-94-template-center-default-visual-parity-refresh`
- Branch/worktree: `codex/m7-ui-95-group-logs-default-visual-parity-refresh` / `/Users/atilla/.codex/worktrees/m7-ui-95-group-logs-default-visual-parity-refresh`
- Source targets:
  - `apps/admin/src/pages/group/GroupLogsPage.tsx`
  - `apps/admin/src/pages/group/GroupLogsViews.tsx`
  - `apps/admin/src/pages/group/groupLogsFallback.ts`
- Test targets:
  - `apps/admin/tests/m7-ui-group-logs.spec.ts`
  - `apps/admin/tests/m7-ui-group-logs-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-group-logs-default-visual-parity.spec.ts`

## Startup Evidence

- `pwd`: `/Users/atilla/.codex/worktrees/m7-ui-95-group-logs-default-visual-parity-refresh`
- `git status --short --branch`: `## codex/m7-ui-95-group-logs-default-visual-parity-refresh`
- `git branch --show-current`: `codex/m7-ui-95-group-logs-default-visual-parity-refresh`
- `git rev-parse HEAD`: `642c43efaf72eaf7c29509a46467f7e3c2dc3cbf`
- Root/main checkout at `/Users/atilla/Applications/UZMAX智能运营` was not used for code edits.

## Source Review

- Read `AGENTS.md`.
- Ran Impeccable context for `apps/admin/src/pages/group/GroupLogsPage.tsx` with the Codex runtime `node`; read product-register and clarify guidance.
- Read `PRODUCT.md`, `DESIGN.md`, `docs/admin-design-system.md`, `docs/admin-ui-page-migration-ledger.md` and `docs/evidence/M7/README.md`.
- Read prior/default-refresh inputs:
  - `docs/specs/M7-UI-57-group-logs-page.md`
  - `docs/specs/M7-UI-74-group-logs-source-parity-refresh.md`
  - `docs/specs/M7-UI-93-connection-center-default-visual-parity-refresh.md`
  - `docs/specs/M7-UI-94-template-center-default-visual-parity-refresh.md`
  - `docs/evidence/M7/M7-UI-57-group-logs-page.md`
  - `docs/evidence/M7/M7-UI-74-group-logs-source-parity-refresh.md`
  - `docs/evidence/M7/M7-UI-94-template-center-default-visual-parity-refresh.md`
- Inspected owner/prototype sources:
  - `/Users/atilla/Downloads/运营塔台1.0.html`
  - `/Users/atilla/源码/unpacked 6/pages/group/GroupLogsPage.tsx`
  - `/Users/atilla/源码/unpacked 6/fixtures/groupPlatform.ts`
  - `/Users/atilla/源码/unpacked 6/shell/navigation.ts`
- Reviewed v1.1 logs/audit/group-layer/mobile fallback and acceptance/release boundaries.

## Default Visual Refresh Changes

- Replaced visible runtime note labels with `集团级审计运营` and operational Chinese copy: `当前展示集团操作日志视图，筛选、导出和详情用于本页核对。`
- Preserved the full runtime/export/file/navigation boundary in hidden DOM, `data-runtime-boundary`, `title` and `aria-description`.
- Replaced export visible feedback with `已准备导出范围 · N 条记录 · 本页可继续筛选核对`.
- Replaced detail visible feedback with `详情预览已打开 · module / target`.
- Replaced forced loading/empty/error/permission state copy with business-readable Chinese while preserving runtime boundary metadata and hidden text.
- Replaced filtered empty helper copy with `调整模块或搜索词后继续核对集团操作记录。`
- Kept source-shaped `集团日志`, subtitle `操作日志 · 跨租户 · 7 条`, owner chip order, search placeholder `搜索租户 / 操作人 / 对象 / 内容…`, export action `导出`, seven-column table and mobile cards.
- Added focused default visual parity Playwright coverage for clean default body, export/detail feedback, forced states, group/tenant nav separation, collapsed nav and mobile 320.
- Updated existing group-logs tests and source-parity metrics so they assert hidden/data/title/ARIA boundary evidence instead of requiring visible engineering labels.

## Data And Runtime Boundary

- All group-log rows remain centralized fallback data in `groupLogsFallback.ts`.
- Row source still follows M7-UI-74 and owner/unpacked source shape: seven columns and seven group-level rows.
- Module filters and search only filter current page rows.
- Runtime labels remain present in hidden DOM/data/title/ARIA evidence: `degraded`, `mock`, `read-only`, `browser-local only`, `synthetic audit rows`, `no production audit export`, `no file written`, `no audit runtime call`, `no real tenant/action navigation`.
- Export action does not generate CSV, write files, create production audit exports, run export jobs or call audit runtime.
- Detail action does not navigate to real tenant/action records or close trace/audit runtime.
- No DB/API/runtime/authz/audit/export/release wiring is implemented.

## Browser Evidence

Artifact directory target:

- `/tmp/uzmax-m7-ui-95-group-logs-default-visual-parity-refresh/`

Expected focused artifacts from Playwright:

- React default clean screenshot: `/tmp/uzmax-m7-ui-95-group-logs-default-visual-parity-refresh/react-group-logs-default-clean.png`
- React search empty clean screenshot: `/tmp/uzmax-m7-ui-95-group-logs-default-visual-parity-refresh/react-group-logs-search-empty-clean.png`
- React detail toast clean screenshot: `/tmp/uzmax-m7-ui-95-group-logs-default-visual-parity-refresh/react-group-logs-detail-toast-clean.png`
- React collapsed nav clean screenshot: `/tmp/uzmax-m7-ui-95-group-logs-default-visual-parity-refresh/react-group-logs-collapsed-clean.png`
- React mobile 320 clean screenshot: `/tmp/uzmax-m7-ui-95-group-logs-default-visual-parity-refresh/react-group-logs-mobile-320-clean.png`
- Metrics JSON: `/tmp/uzmax-m7-ui-95-group-logs-default-visual-parity-refresh/metrics.json`

## Validation

Validation status: `PASS`.

Environment notes:

- Default shell had `node`, `npm`, `npx` and `gh` unavailable until explicit runtime/tool paths were used.
- Worktree had no local `node_modules`.
- Validation used a temporary worktree-local symlink: `node_modules -> /Users/atilla/.codex/worktrees/m7-ui-64-ticket-source-parity-refresh/node_modules`.
- `pr-shape --include-worktree` was run after removing the symlink so dependency plumbing was not counted as an out-of-scope worktree file.
- Playwright config webServer calls `npm`, which is unavailable in this runtime PATH; validation used the successful build plus manual `vite preview` on `127.0.0.1:4173`, then Playwright reused the existing server.

Completed validation:

- PASS: `git diff --check codex/m7-ui-94-template-center-default-visual-parity-refresh...HEAD`
- PASS: `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node scripts/guards/pr-shape.mjs --base codex/m7-ui-94-template-center-default-visual-parity-refresh --spec docs/specs/M7-UI-95-group-logs-default-visual-parity-refresh.md --include-worktree`
  - `changedFiles: 10`
  - `categories: { source: 3, test: 3, docs: 4 }`
  - `source: { changedFiles: 3, netLoc: 0, newFiles: 0 }`
  - Source net LOC remains within the spec budget `<= 180`.
- PASS: touched Prettier:
  - `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node node_modules/prettier/bin/prettier.cjs --check apps/admin/src/pages/group/GroupLogsPage.tsx apps/admin/src/pages/group/GroupLogsViews.tsx apps/admin/src/pages/group/groupLogsFallback.ts apps/admin/tests/m7-ui-group-logs.spec.ts apps/admin/tests/m7-ui-group-logs-source-parity.spec.ts apps/admin/tests/m7-ui-group-logs-default-visual-parity.spec.ts docs/specs/M7-UI-95-group-logs-default-visual-parity-refresh.md docs/evidence/M7/M7-UI-95-group-logs-default-visual-parity-refresh.md docs/evidence/M7/README.md docs/admin-ui-page-migration-ledger.md`
- PASS: touched ESLint:
  - `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node node_modules/eslint/bin/eslint.js apps/admin/src/pages/group/GroupLogsPage.tsx apps/admin/src/pages/group/GroupLogsViews.tsx apps/admin/src/pages/group/groupLogsFallback.ts apps/admin/tests/m7-ui-group-logs.spec.ts apps/admin/tests/m7-ui-group-logs-source-parity.spec.ts apps/admin/tests/m7-ui-group-logs-default-visual-parity.spec.ts`
- PASS: Admin build with existing Vite warning:
  - `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir`
  - Existing warning: bundle chunk larger than 500 kB after minification.
- Initial Playwright attempt hit the known local webServer issue:
  - `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node node_modules/@playwright/test/cli.js test apps/admin/tests/m7-ui-group-logs.spec.ts apps/admin/tests/m7-ui-group-logs-source-parity.spec.ts apps/admin/tests/m7-ui-group-logs-default-visual-parity.spec.ts`
  - Result: `/bin/sh: npm: command not found`; config webServer could not start.
- PASS: focused Playwright with manual preview:
  - Server: `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node node_modules/vite/bin/vite.js preview apps/admin --host 127.0.0.1 --port 4173`
  - `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH PLAYWRIGHT_TEST_BASE_URL=http://127.0.0.1:4173 node node_modules/@playwright/test/cli.js test apps/admin/tests/m7-ui-group-logs.spec.ts apps/admin/tests/m7-ui-group-logs-source-parity.spec.ts apps/admin/tests/m7-ui-group-logs-default-visual-parity.spec.ts`
  - Result: `7 passed`

Cleanup status:

- COMPLETE after validation: temporary `node_modules` symlink, `apps/admin/dist`, `test-results` and `playwright-report` removed before final commit.

## Remaining Deltas

- This branch is default visual parity/evidence refresh only; it does not claim owner visual acceptance.
- Audit DB/API/runtime/authz, production audit export, file writing, export jobs, real audit queries, real record navigation and trace closure are intentionally not implemented.
- Real audit data, production permission enforcement and release approval remain future runtime specs, not this UI slice.
- Merge, runtime closure, GA-0 and 1.0 release approval are still required later and are not claimed here.
