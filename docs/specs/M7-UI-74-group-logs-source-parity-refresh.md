# M7-UI-74 Group Logs Source Parity Refresh

## Goal

Refresh the existing visible UI-first `group.logs` / `集团日志` page on top of `origin/codex/m7-ui-73-tenant-management-source-parity-refresh` (#215 stack) so the primary visible copy, controls and evidence align with the actual rendered owner HTML and the frozen structured sources.

This is a source-parity UI evidence slice, not an audit/log runtime implementation. It does not implement DB/API/runtime/authz/audit export/file write/real audit query/real record navigation/trace closure/GA/release/owner acceptance.

## Owner Confirmation Points And AI Agent Responsibility

Owner/coordinator:

- Confirm this branch is stacked on `origin/codex/m7-ui-73-tenant-management-source-parity-refresh`.
- Confirm `group.logs` remains GROUP layer only: `/design` opens group shell, active page `group.logs`, no `data-tenant-id`, group categories only `总览/平台/治理`.
- Decide later whether real audit-log runtime, export jobs, record navigation and authz/audit-write paths proceed through separate approved specs.
- Keep production/staging, real customer/order data, LLM key, cost/compliance, GA-0 and release decisions owner-only.

AI agent:

- Work only in `/Users/atilla/.codex/worktrees/m7-ui-74-group-logs-source-parity-refresh` on branch `codex/m7-ui-74-group-logs-source-parity-refresh`.
- Keep `/Users/atilla/Applications/UZMAX智能运营` root/main read-only except worktree creation.
- Read AGENTS, M7-UI-57 spec/evidence, current group-logs source/tests, owner unpacked group-logs page/fixtures/navigation and owner HTML before edits.
- Verify actual rendered owner HTML, not just packed template text.
- Preserve centralized synthetic/mock/degraded/read-only/browser-local rows and local-only actions.

## Timebox

0.5 workday. If the page requires backend/API/DB/packages/package/lock/global config/shared shell/sidebar/topbar/registry/PageOutlet edits, real audit/log runtime, production audit export, file write or broad shell rewrite, stop and report `BLOCKED`.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-UI-74-group-logs-source-parity-refresh.md`
  - `docs/evidence/M7/M7-UI-74-group-logs-source-parity-refresh.md`
  - `docs/evidence/M7/README.md`
  - `docs/admin-ui-page-migration-ledger.md`
  - `apps/admin/tests/m7-ui-group-logs-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-group-logs.spec.ts`
- Conditional source scope, only where owner/source/browser comparison proves current React mismatch:
  - `apps/admin/src/pages/group/GroupLogsPage.tsx`
  - `apps/admin/src/pages/group/GroupLogsViews.tsx`
  - `apps/admin/src/pages/group/groupLogsFallback.ts`
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source changed files: <= 3 conditional only
- source net LOC: <= 90 conditional only
- new source files: 0
- test files changed/added: <= 2 focused Playwright specs
- docs changed/added: <= 4
- package/lock/generated/config/backend/API/DB/worker/cron/CI/global config/shared shell/sidebar/topbar/registry/PageOutlet: 0
- external API/SDK/provider/connector/adapter basis: none; only browser evidence and local UI fallback state are in scope.

```yaml
source:
  - apps/admin/src/pages/group/GroupLogsPage.tsx
  - apps/admin/src/pages/group/GroupLogsViews.tsx
  - apps/admin/src/pages/group/groupLogsFallback.ts
test:
  - apps/admin/tests/m7-ui-group-logs-source-parity.spec.ts
  - apps/admin/tests/m7-ui-group-logs.spec.ts
docs:
  - docs/specs/M7-UI-74-group-logs-source-parity-refresh.md
  - docs/evidence/M7/M7-UI-74-group-logs-source-parity-refresh.md
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
- `docs/specs/M7-UI-57-group-logs-page.md`
- `docs/evidence/M7/M7-UI-57-group-logs-page.md`
- `docs/evidence/M7/README.md`
- `apps/admin/src/pages/group/GroupLogsPage.tsx`
- `apps/admin/src/pages/group/GroupLogsViews.tsx`
- `apps/admin/src/pages/group/groupLogsFallback.ts`
- `apps/admin/tests/m7-ui-group-logs.spec.ts`
- `/Users/atilla/Downloads/运营塔台1.0.html`
- `/Users/atilla/源码/unpacked 6/pages/group/GroupLogsPage.tsx`
- `/Users/atilla/源码/unpacked 6/fixtures/groupPlatform.ts`
- `/Users/atilla/源码/unpacked 6/shell/navigation.ts`
- v1.1 group-layer, logs/audit, permission/RLS, mobile fallback and release-boundary sections.

| Source | Required use |
|---|---|
| Owner HTML rendered state | Primary visual baseline for visible header, subtitle, search placeholder, search width, export button, chip order and empty text. Browser evidence must capture rendered owner truth. |
| Owner HTML embedded bundle | Secondary explanation of structured intent: `gLogCols`, `gLogRows`, `gLogChipDefs`, `gLogResultLabel`, search, export and empty template. It also explains why the rendered table is blank: the generated `sc-for` loops for columns/rows are outside the table cells. |
| Unpacked group logs page | Structured source for seven-column table, seven source rows, row padding/density and link-style detail cells. |
| Unpacked `fixtures/groupPlatform.ts` | Secondary field/row mapping for `GLOG_COLS`, `GLOG_BASE` and `GLOG_MODULES`. |
| Unpacked `navigation.ts` | Group-only navigation category and `g_logs` mapping reference. |
| v1.1 docs | Product/runtime boundary: logs are real product scope, but this slice is UI evidence only and does not imply real audit runtime, export or trace closure. |

## Source Parity Decision

Rendered owner HTML for `集团日志` shows:

- title `集团日志`
- subtitle `操作日志 · 跨租户 · 7 条`
- search placeholder `搜索租户 / 操作人 / 对象 / 内容…`
- export button `导出`
- chip row `全部模块 / AI 成员 / 连接中心 / 配置 / 租户管理 / 对话 / 工单`
- empty text `没有匹配「search」的记录`

Rendered owner HTML also shows a bordered table panel, but the table header/cells render blank even after waiting. The embedded owner bundle and unpacked 6 both contain seven columns and seven rows. This branch records that as `rendered_table_blank_due_malformed_sc_for`.

React follows the owner rendered primary values and chip order. For the table, React keeps the source-shaped seven-column/seven-row table required by this task and v1.1 log anatomy, while evidence explicitly marks the owner-rendered table conflict. This branch therefore does not claim owner visual acceptance for the table bug.

## Impeccable / Design Decision Record

Adopted by default: restrained dense product UI, owner-rendered compact page header, exact subtitle/search/export/chip shape, source-shaped bordered white table panel, row density, link-style detail actions, runtime boundary in note/toasts/evidence/tests rather than primary table/header values, group-only sidebar parity and mobile 320 no-overflow fallback.

Rejected: old shell visuals, old `--uzmax-*` as visual target, free redesign, production-looking audit data, primary header `mock` pollution, wrong search placeholder, stale `模板中心` chip in visible chip row, real CSV/file writing, production audit export, audit runtime calls, real tenant/action navigation, trace/runtime/release closure copy and owner-acceptance claims.

## Pass Conditions

- `group.logs` renders inside group shell after opening `/design` on the latest #215 stack.
- Browser evidence proves owner HTML rendered primary truth, owner rendered blank-table conflict, unpacked/embedded table source mapping, React desktop/filter-empty/local-action/collapsed/mobile geometry, group-only sidebar categories and 320px no-overflow fallback.
- React header title/subtitle, search placeholder, export and chip order match owner-rendered values.
- React table keeps seven columns `操作时间/租户/操作人/操作模块/操作功能/操作对象/操作内容` and seven synthetic source rows.
- Search empty state uses `没有匹配「query」的记录`.
- Export/detail actions stay browser-local only and show no-production/no-file/no-runtime/no-navigation toast copy.
- Existing forced-state coverage remains intact.
- Any source corrections are small and limited to `apps/admin/src/pages/group/**`.
- No disallowed files are changed.

## Validation Plan

- `git diff --check origin/codex/m7-ui-73-tenant-management-source-parity-refresh...HEAD`
- `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-73-tenant-management-source-parity-refresh --spec docs/specs/M7-UI-74-group-logs-source-parity-refresh.md --include-worktree`
- touched Prettier check/write
- ESLint on touched group-logs source/tests
- `node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json --pretty false`
- `node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir`
- Focused Playwright for `apps/admin/tests/m7-ui-group-logs-source-parity.spec.ts` and existing `apps/admin/tests/m7-ui-group-logs.spec.ts`.

## Failure Branches

- If source geometry cannot be kept without shared shell/topbar/sidebar edits, stop and report the shell dependency instead of editing shared shell.
- If source-shaped rows create production ambiguity, keep visible boundary labels in runtime note/toasts/evidence/tests and record the remaining visual delta.
- If Playwright cannot open owner HTML directly, record the owner HTML as bundled executable source and use unpacked source plus React browser evidence as the stable mapping.

## Not Doing

- No backend/API/DB/schema/migration/generated/package/lock/global config/CI/shared AppShell/topbar/sidebar/registry/PageOutlet changes.
- No raw prototype fixture import.
- No real audit-log query, production audit export, CSV generation, file write, export job, audit runtime call, trace closure, real record navigation, production audit write, release gate change, owner visual acceptance, merge closure, runtime closure, GA-0, production readiness or 1.0 release approval.
- No real customer, order, Telegram, address, phone or production data.
