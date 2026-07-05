# M7-UI-78 Logs Source Parity Refresh

## Goal

Refresh the existing visible UI-first `tenant.logs` / `日志` page on top of `origin/codex/m7-ui-77-analytics-source-parity-refresh` so the primary visible geometry, copy and source-shaped rows better match the current owner-rendered prototype and unpacked logs source, without expanding this slice into real logs/audit runtime.

This is a source-parity UI evidence slice. It does not implement logs DB/API/runtime, production audit logs, export jobs, file writes, audit writes, real record navigation, owner visual acceptance, merge closure, runtime closure, GA-0 or 1.0 release approval.

## Owner Confirmation Points And AI Agent Responsibility

Owner/coordinator:

- Confirm this branch is stacked on `origin/codex/m7-ui-77-analytics-source-parity-refresh`.
- Confirm `tenant.logs` remains TENANT layer only: `/design` opens group shell, tenant selection enters tenant shell, active page `tenant.logs`, tenant categories only `运营/数据/智能/管理/洞察`.
- Decide later whether real logs/audit DB/API/runtime, export jobs, audit writes or production record navigation proceeds through separate approved specs.
- Keep production/staging, real customer/order data, LLM key, cost/compliance, GA-0 and release decisions owner-only.

AI agent:

- Work only in `/Users/atilla/.codex/worktrees/m7-ui-78-logs-source-parity-refresh` on branch `codex/m7-ui-78-logs-source-parity-refresh`.
- Keep `/Users/atilla/Applications/UZMAX智能运营` root/main read-only.
- Start by recording `pwd`, `git status --short --branch` and `git branch --show-current`.
- Read `AGENTS.md`, current M7 design docs, M7-UI-56 spec/evidence, current logs source/tests, owner unpacked logs page/fixture and owner HTML before claiming evidence.
- Preserve centralized synthetic/mock/degraded/browser-local rows and local-only logs controls.

## Timebox

0.5 workday. If the page requires shared shell/router/PageOutlet/registry/API/DB/package/lock/global config/CI guard edits, real logs/audit runtime, production log data, export jobs, audit writes or broad UI redesign, stop and report `BLOCKED`.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-UI-78-logs-source-parity-refresh.md`
  - `docs/evidence/M7/M7-UI-78-logs-source-parity-refresh.md`
  - `docs/evidence/M7/README.md`
  - `docs/admin-ui-page-migration-ledger.md`
  - `apps/admin/tests/m7-ui-logs-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-logs-page.spec.ts`
- Conditional source scope, only where owner/source/browser comparison proves current React mismatch:
  - `apps/admin/src/pages/logs/LogsPage.tsx`
  - `apps/admin/src/pages/logs/logsFallback.ts`
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source changed files: <= 2 conditional only
- source net LOC: <= 160 conditional only
- new source files: 0
- test files changed/added: <= 2 focused Playwright specs
- docs changed/added: <= 4
- package/lock/generated/config/backend/API/DB/worker/cron/CI/global config/shared shell/sidebar/topbar/router/registry/PageOutlet: 0
- external API/SDK/provider/connector/adapter basis: none; only browser evidence and local UI fallback state are in scope.

```yaml
source:
  - apps/admin/src/pages/logs/LogsPage.tsx
  - apps/admin/src/pages/logs/logsFallback.ts
test:
  - apps/admin/tests/m7-ui-logs-source-parity.spec.ts
  - apps/admin/tests/m7-ui-logs-page.spec.ts
docs:
  - docs/specs/M7-UI-78-logs-source-parity-refresh.md
  - docs/evidence/M7/M7-UI-78-logs-source-parity-refresh.md
  - docs/evidence/M7/README.md
  - docs/admin-ui-page-migration-ledger.md
generated: []
lock: []
config: []
```

## Required Reads And Source Mapping

Required reads:

- `AGENTS.md`
- `docs/admin-design-system.md`
- `docs/admin-ui-page-migration-ledger.md`
- `docs/specs/M7-UI-56-logs-page.md`
- `docs/evidence/M7/M7-UI-56-logs-page.md`
- `docs/evidence/M7/README.md`
- `apps/admin/src/pages/logs/LogsPage.tsx`
- `apps/admin/src/pages/logs/logsFallback.ts`
- `apps/admin/tests/m7-ui-logs-page.spec.ts`
- `/Users/atilla/Downloads/运营塔台1.0.html`
- `/Users/atilla/源码/unpacked 6/pages/logs/LogsPage.tsx`
- `/Users/atilla/源码/unpacked 6/fixtures/analytics.ts`

| Source | Required use |
|---|---|
| Owner HTML rendered state | Browser-comparable source for the logs shell context, title, search placeholder and tab labels. |
| Unpacked logs page | Structured source for the header/search/tabs/table anatomy and default `操作日志` tab. |
| Unpacked `fixtures/analytics.ts` | Structured source for `LOG_TAB_DEFS`, `LOGIN_LOG`, `ONLINE_LOG`, `OP_LOG`, `LOG_COLS`, exact detail arrows and source-shaped row values. |
| v1.1/docs/admin-design-system | Product/runtime boundary: logs are real product scope, but this slice is UI evidence only and does not imply logs/audit runtime, export or audit closure. |

## Source Parity Decision

React follows the rendered owner HTML first, then unpacked logs source where rendered HTML is malformed or insufficient:

- Owner-rendered logs currently shows `日志`, search placeholder `搜索本页记录…`, and tabs `登录日志/在线日志/操作日志`.
- Owner-rendered logs table header/cells are blank/malformed in browser capture. React therefore keeps unpacked/source-shaped structured columns and rows from `LOG_*`.
- Header primary visual hierarchy is source-like: `日志`, search control and three tabs. Visible engineering/runtime badges such as `租户级 · mock/degraded · read-only` are removed from the default body visual.
- Default tab remains `操作日志`; operation table columns are `时间/操作人/模块/动作/对象/详情`.
- Detail cell labels follow unpacked source exactly, including `查看版本 →`, `跳转会话 →`, `跳转工单 →`, `跳转评测 →`, `查看 diff →`, `查看记录 →`.
- Logs page root owns its tenant-content width calibration because ordinary tenant outlets do not add a page class: desktop expanded follows `calc(100vw - var(--nav-expanded-width))`, collapsed follows `calc(100vw - var(--nav-collapsed-width))`, and mobile stays bounded to the viewport.
- Runtime/local-only labels remain present in DOM/data attributes/tests/metrics/state copy/toasts, but the default runtime note is hidden from the primary visual hierarchy so the page resembles the owner/source logs surface.
- Search and detail interactions remain browser-local only.

## Impeccable / Design Decision Record

Adopted by default: restrained dense product UI, source-like compact header/search/tabs, table anatomy, semantic status colors only for operational meaning, hidden-but-present runtime boundary evidence, readable 320px fallback and explicit local-only copy for detail behavior.

Rejected: old shell visual vocabulary, visible tenant-layer/runtime badge in the page header, old `--uzmax-*` as visual source, broad dashboard redesign, production-looking audit logs, real export jobs/file writes, logs runtime, audit-write claims, real record navigation and owner-acceptance/runtime/release claims.

## Pass Conditions

- `tenant.logs` renders inside tenant shell after selecting a tenant from `/design`.
- Browser evidence includes owner/source mapping, React desktop default logs, search empty, local detail/toast, collapsed nav and 320px mobile screenshots/metrics under `/tmp/uzmax-m7-ui-78-logs-source-parity-refresh/`.
- Metrics include `shellLevel=tenant`, `activePageId=tenant.logs`, tenant nav categories present, group nav labels absent, outer nav width `232/68`, topbar height `52-53`, logs root/header/body width near `1208/1372` for expanded/collapsed at 1440px, table panel filling the inner content area, runtime labels present but not visible in the default body visual (`runtimeLabelsVisibleInBody=false` for default/search/collapsed/mobile evidence), visible runtime badge false, tab labels, table rows/columns and mobile body/document/root width <= `320`.
- Focused Playwright covers source parity basics, owner rendered conflict, search empty state, local-only detail toast, forced states through the existing logs spec, collapsed nav and mobile fallback.
- Source corrections stay small and limited to `apps/admin/src/pages/logs/**`.
- No disallowed files are changed.

## Validation Plan

- `git diff --check`
- `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-77-analytics-source-parity-refresh --spec docs/specs/M7-UI-78-logs-source-parity-refresh.md --include-worktree`
- Touched admin ESLint:
  - `node node_modules/eslint/bin/eslint.js apps/admin/src/pages/logs/LogsPage.tsx apps/admin/src/pages/logs/logsFallback.ts apps/admin/tests/m7-ui-logs-source-parity.spec.ts apps/admin/tests/m7-ui-logs-page.spec.ts`
- Focused Playwright:
  - `apps/admin/tests/m7-ui-logs-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-logs-page.spec.ts`
- Admin build:
  - `node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir`
- `git merge-tree --write-tree origin/codex/m7-ui-77-analytics-source-parity-refresh HEAD`

## Failure Branches

- If owner HTML cannot be captured in browser, record the failure/degraded capture in evidence and rely on unpacked source mapping plus React browser screenshots.
- If Playwright cannot start because dependencies are unavailable after cleanup, record exact dependency failure and do not fake evidence.
- If source geometry requires shared shell/router/PageOutlet/registry/API/DB edits, stop and report the dependency instead of editing forbidden files.

## Not Doing

- No shared shell/topbar/sidebar/router/PageOutlet/registry/API/DB/schema/migration/generated/package/lock/global config/CI guard changes.
- No raw prototype fixture import.
- No logs DB/API/runtime, production audit logs, export jobs, file writes, audit writes, production authz integration, real record navigation, trace closure, runtime close, owner visual acceptance, merge closure, GA-0, production readiness or 1.0 release approval.
- No real customer, order, Telegram, address, phone or production data.
