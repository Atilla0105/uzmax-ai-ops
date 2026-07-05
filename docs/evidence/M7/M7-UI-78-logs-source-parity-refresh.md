# M7-UI-78 Logs Source Parity Refresh Evidence

## Status

`visible_ui_refresh_candidate_pending_pr_review_not_accepted_not_runtime_closed`

This branch refreshes source-parity details for `tenant.logs` / `日志` on top of `origin/codex/m7-ui-77-analytics-source-parity-refresh`. It keeps logs/audit runtime downgraded: no logs DB/API/runtime, production audit logs, export job, export file write, audit write, real record navigation, owner visual acceptance, merge, runtime closure, GA-0 or 1.0 release approval is claimed.

## Scope

- Spec: `docs/specs/M7-UI-78-logs-source-parity-refresh.md`
- Route: `tenant.logs`
- Base: `origin/codex/m7-ui-77-analytics-source-parity-refresh`
- Branch/worktree: `codex/m7-ui-78-logs-source-parity-refresh` / `/Users/atilla/.codex/worktrees/m7-ui-78-logs-source-parity-refresh`
- Source targets:
  - `apps/admin/src/pages/logs/LogsPage.tsx`
  - `apps/admin/src/pages/logs/logsFallback.ts`
- Test targets:
  - `apps/admin/tests/m7-ui-logs-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-logs-page.spec.ts`

## Startup Evidence

- `pwd`: `/Users/atilla/.codex/worktrees/m7-ui-78-logs-source-parity-refresh`
- `git status --short --branch`: `## codex/m7-ui-78-logs-source-parity-refresh...origin/codex/m7-ui-77-analytics-source-parity-refresh`
- `git branch --show-current`: `codex/m7-ui-78-logs-source-parity-refresh`
- Root/main checkout at `/Users/atilla/Applications/UZMAX智能运营` was not used for code edits. It had unrelated pre-existing untracked files and was treated as read-only.

## Source Review

- Read `AGENTS.md`.
- Ran Impeccable context for `apps/admin/src/pages/logs/LogsPage.tsx` with the Codex runtime `node`; read product-register guidance.
- Read `PRODUCT.md`, `DESIGN.md`, `docs/admin-design-system.md`, `docs/admin-ui-page-migration-ledger.md` and `docs/evidence/M7/README.md`.
- Read prior logs spec/evidence:
  - `docs/specs/M7-UI-56-logs-page.md`
  - `docs/evidence/M7/M7-UI-56-logs-page.md`
- Read current logs implementation and regression test:
  - `apps/admin/src/pages/logs/LogsPage.tsx`
  - `apps/admin/src/pages/logs/logsFallback.ts`
  - `apps/admin/tests/m7-ui-logs-page.spec.ts`
- Inspected owner/prototype sources:
  - `/Users/atilla/Downloads/运营塔台1.0.html`
  - `/Users/atilla/源码/unpacked 6/pages/logs/LogsPage.tsx`
  - `/Users/atilla/源码/unpacked 6/fixtures/analytics.ts`

## Source Parity Changes

- Removed visible runtime/engineering labels from the default logs header/body while retaining hidden DOM evidence and page data attributes.
- Synced search placeholder to source: `搜索本页记录…`.
- Synced operation detail labels to unpacked `OP_LOG` values with Unicode arrows: `查看版本 →`, `跳转会话 →`, `跳转工单 →`, `跳转评测 →`, `查看 diff →`, `查看记录 →`.
- Synced login row IP values to unpacked `LOGIN_LOG` values and documented them as prototype/source-shaped synthetic fixtures, not production audit data.
- Kept default tab `操作日志` and source columns `时间/操作人/模块/动作/对象/详情`.
- Removed the extra visible search-empty helper line so the empty state follows source copy: `没有匹配「search」的记录`.
- Added logs-root geometry calibration inside `logsFallback.ts` only: expanded desktop width follows `calc(100vw - var(--nav-expanded-width))`, collapsed desktop width follows `calc(100vw - var(--nav-collapsed-width))`, and mobile uses viewport width. No shell/router/PageOutlet/package changes were made.
- Added focused source-parity Playwright evidence for owner HTML, unpacked mapping, tenant-only shell, default logs page, search empty, local-only detail toast, collapsed sidebar and 320px mobile fallback.

## Data And Runtime Boundary

- All logs data remains synthetic/local fallback state in `logsFallback.ts`.
- Search only filters browser-local rows.
- Detail action only shows a local toast.
- No logs API request, DB read/write, production audit source, export job, file write, audit write or real record navigation is implemented.
- Runtime labels remain present in DOM/data attributes/test evidence: `degraded`, `mock`, `read-only`, `browser-local only`, `synthetic tenant log rows`, `no production audit/log export`, `no file written`, `no audit/log runtime call`, `no real tenant/action navigation`.
- Default desktop/search/collapsed/mobile evidence keeps `runtimeLabelsPresent=true` and `runtimeLabelsVisibleInBody=false`; local-only detail boundary text appears only when the toast is deliberately triggered.

## Browser Evidence

Artifact directory target:

- `/tmp/uzmax-m7-ui-78-logs-source-parity-refresh/`

Captured artifacts:

- Owner HTML desktop screenshot: `/tmp/uzmax-m7-ui-78-logs-source-parity-refresh/owner-html-logs-desktop.png`
- Owner HTML rendered sample: `/tmp/uzmax-m7-ui-78-logs-source-parity-refresh/owner-html-logs-rendered-sample.json`
- Unpacked/source mapping: `/tmp/uzmax-m7-ui-78-logs-source-parity-refresh/unpacked-logs-source-mapping.json`
- React desktop default screenshot: `/tmp/uzmax-m7-ui-78-logs-source-parity-refresh/react-logs-desktop-default.png`
- React search empty screenshot: `/tmp/uzmax-m7-ui-78-logs-source-parity-refresh/react-logs-search-empty.png`
- React local detail/toast screenshot: `/tmp/uzmax-m7-ui-78-logs-source-parity-refresh/react-logs-local-detail-toast.png`
- React collapsed sidebar screenshot: `/tmp/uzmax-m7-ui-78-logs-source-parity-refresh/react-logs-collapsed-sidebar.png`
- React mobile 320 screenshot: `/tmp/uzmax-m7-ui-78-logs-source-parity-refresh/react-logs-mobile-320.png`
- Metrics JSON: `/tmp/uzmax-m7-ui-78-logs-source-parity-refresh/metrics.json`

Owner HTML rendered sample highlights:

- `title=true`, `tabs=true`, `searchPlaceholder=true`.
- Rendered visible sample contains tenant shell categories `运营/数据/智能/管理/洞察`, `日志`, `登录日志`, `在线日志`, `操作日志`.
- Rendered owner HTML table header/cells are blank in the captured sample (`blankRenderedTable=true`), so React keeps structured unpacked/source table anatomy for headers and rows.

Unpacked/source mapping highlights:

- `reactFollows=rendered-owner-html-first-then-unpacked-logs-source-for-structured-details`
- Unpacked page carries default `操作日志`, search placeholder `搜索本页记录…`, source table anatomy and source empty copy.
- Unpacked fixtures carry `LOG_TAB_DEFS`, `LOGIN_LOG`, `ONLINE_LOG`, `OP_LOG`, `LOG_COLS`, exact detail-arrow labels and source-shaped row values.

React metrics highlights:

- Desktop default: `shellLevel=tenant`, `activePageId=tenant.logs`, outer nav `232`, expected content width `1208`, logs root/header/body width `1208`, table panel width `1160`, topbar height `53`, tenant categories `运营/数据/智能/管理/洞察`, group labels absent, active tab `操作日志`, tabs `登录日志/在线日志/操作日志`, table columns `时间/操作人/模块/动作/对象/详情`, row count `6`, runtime labels present, `runtimeLabelsVisibleInBody=false`, runtime note visible `false`, visible runtime badge `false`.
- Search empty: empty text `没有匹配「no matching local row」的记录`, `runtimeLabelsVisibleInBody=false`.
- Local detail toast: toast deliberately surfaces `browser-local only` and `no audit/log runtime call`; no real tenant/action navigation occurs.
- Collapsed sidebar: outer nav `68`, expected content width `1372`, logs root/body width `1372`, table panel width `1324`, active page remains `tenant.logs`, `runtimeLabelsVisibleInBody=false`.
- Mobile 320: logs root width `320`, body scroll width `320`, document scroll width `320`, mobile card rows `6`, `runtimeLabelsVisibleInBody=false`.

## Validation

Validation status: `PASS_WITH_EXISTING_BUILD_WARNING`.

Environment notes:

- Default shell initially had `node` unavailable. Validation uses `/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin` at the front of `PATH`.
- Worktree-local `npm ci` succeeded and created temporary `node_modules`; cleanup removed it before final response.

Completed validation:

- PASS: `git diff --check`
- PASS: `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-77-analytics-source-parity-refresh --spec docs/specs/M7-UI-78-logs-source-parity-refresh.md --include-worktree`
  - changedFiles `8`
  - categories: `source=2`, `test=2`, `docs=4`
  - source changedFiles `2`, source netLoc `0`, new source files `0`
- PASS: Touched admin ESLint:
  - `node node_modules/eslint/bin/eslint.js apps/admin/src/pages/logs/LogsPage.tsx apps/admin/src/pages/logs/logsFallback.ts apps/admin/tests/m7-ui-logs-source-parity.spec.ts apps/admin/tests/m7-ui-logs-page.spec.ts`
- PASS: Focused source-parity Playwright:
  - `apps/admin/tests/m7-ui-logs-source-parity.spec.ts`
  - Result: `1 passed`
  - Assertions: owner HTML rendered title/search/tabs plus blank table conflict; React default body does not visibly contain runtime labels; source detail arrows and `LOG_*` rows match; desktop root/header/body `1208`, collapsed root/body `1372`, mobile body/document/root `320`.
- PASS: Focused Playwright with existing regression spec:
  - `apps/admin/tests/m7-ui-logs-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-logs-page.spec.ts`
  - Result: `6 passed`
- PASS: Admin build:
  - `node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir`
  - Existing Vite warning: bundle chunk larger than 500 kB after minification.
- PASS: `git merge-tree --write-tree origin/codex/m7-ui-77-analytics-source-parity-refresh HEAD`
  - tree `a0e00febdd0958929412f979fb856255a7d59593`
- COMPLETE: cleanup removed `node_modules`, `apps/admin/node_modules`, `test-results`, `playwright-report`, `apps/admin/dist` and temporary lockfiles before final response.

## Remaining Deltas

- This branch is source-parity/evidence refresh only; it does not claim owner visual acceptance.
- Owner HTML renders logs table header/cells blank in the browser capture; React intentionally keeps unpacked/source-shaped structured table headers and rows.
- Logs DB/API/runtime, production audit log sourcing, export jobs/file writes, audit writes and real record navigation remain intentionally not implemented.
- Real tenant logs data, production permission enforcement and release approval remain future runtime specs, not this UI slice.
- Merge, runtime closure, GA-0 and 1.0 release approval are still required later and are not claimed here.
