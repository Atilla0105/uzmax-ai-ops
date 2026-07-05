# M7-UI-56 Tenant Logs Page

## 目标

Implement a UI-first `tenant.logs` / `日志` visible page on top of `origin/codex/m7-ui-55-analytics-visible-ui`.

## Owner

- Owner visual/source truth: `/Users/atilla/Downloads/运营塔台1.0.html`, `/Users/atilla/源码/unpacked 6/pages/logs/LogsPage.tsx`, `/Users/atilla/源码/unpacked 6/fixtures/analytics.ts`, and `docs/admin-design-system.md`.
- This supersedes the old ledger placeholder `M7-UI-04S-tenant-logs`.
- This is a TENANT layer page. It renders tenant-only navigation and carries the selected tenant id for page reset/context only.
- Log rows are centralized synthetic/mock/degraded data derived from owner fixture shape.
- Search, tabs and operation detail affordances are browser-local only. They do not query production audit logs, write files, call audit/log runtime, export logs, or navigate to real tenant/action records.
- No owner visual acceptance, audit/log runtime closure, export job readiness, real audit-log readiness, GA-0, or 1.0 release approval is claimed.

## 时间盒

One focused worker slice. If the page cannot render with visible UI plus state/test/evidence coverage inside this branch, stop and mark `blocked_by_visual_or_validation_failure`.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-UI-56-logs-page.md`
  - `docs/evidence/M7/M7-UI-56-logs-page.md`
  - `docs/admin-ui-page-migration-ledger.md`
  - `docs/evidence/M7/README.md`
  - `apps/admin/src/pages/PageOutlet.tsx`
  - `apps/admin/src/pages/registry.ts`
  - `apps/admin/src/pages/logs/LogsPage.tsx`
  - `apps/admin/src/pages/logs/logsFallback.ts`
  - `apps/admin/tests/m7-ui-logs-page.spec.ts`
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source 预算：changed source files <= 4、net source LOC <= 520、new source files <= 2。
- test/generated/lock/config/docs 预计变更：

```yaml
source:
  - apps/admin/src/pages/PageOutlet.tsx
  - apps/admin/src/pages/registry.ts
  - apps/admin/src/pages/logs/LogsPage.tsx
  - apps/admin/src/pages/logs/logsFallback.ts
test:
  - apps/admin/tests/m7-ui-logs-page.spec.ts
docs:
  - docs/specs/M7-UI-56-logs-page.md
  - docs/evidence/M7/M7-UI-56-logs-page.md
  - docs/admin-ui-page-migration-ledger.md
  - docs/evidence/M7/README.md
generated: []
lock: []
config: []
```

- 新增 source 文件前的 `rg` 搜索结论和归属理由：searched `tenant.logs`, `LogsPage`, `M5LogsAnalyticsShell`, `登录日志`, `在线日志`, `操作日志`, current registry/router entries, existing M7 analytics/group logs pages and tests. Current tenant logs route was registry/scaffold-only; existing `M5LogsAnalyticsShell` is legacy evidence and not reused. New tenant logs page source belongs under `apps/admin/src/pages/logs/**` to match current M7 page workers.
- 外部 API/SDK/provider/connector/adapter 依据：无。This page intentionally does not call API/DB/runtime/audit/log/export jobs or external providers.
- 是否需要例外：无。

## 文档触发检查

- 结果：`updated`.
- 判断依据：page migration ledger and M7 evidence index are owned outputs for this UI page slice.

## 前置条件

- Worktree: `/Users/atilla/.codex/worktrees/m7-ui-56-logs-visible-ui`.
- Branch: `codex/m7-ui-56-logs-visible-ui`.
- Base: `origin/codex/m7-ui-55-analytics-visible-ui`.
- Root/main checkout is read-only coordination; all edits stay in the assigned worktree.
- Startup recorded `pwd`, `git status --short --branch`, and `git branch --show-current`.
- If writing outside this worktree, stop, clean only accidental files, and create an incident if `docs/incidents/README.md` triggers apply.

## 实施步骤

1. Add centralized tenant logs fallback data, URL state parser, filtering and local-only toast copy.
2. Add the tenant logs page preserving owner source structure: title `日志`, search, tabs `登录日志 / 在线日志 / 操作日志`, dense table, deterministic search empty and mobile cards.
3. Wire `tenant.logs` in `PageOutlet.tsx` with `selectedTenantId` key/context and update `registry.ts`.
4. Add focused Playwright coverage and evidence docs.
5. Run required validation and collect browser screenshots/metrics.

## 通过条件

- Focused Playwright coverage for `activePageId=tenant.logs`, `shellLevel=tenant`, tenant-only nav, group labels absent, title/search/tabs/runtime note, search empty state, operation detail local-only action, forced URL states, collapsed sidebar width and mobile 320 no-overflow fallback.
- Browser evidence under `/tmp/uzmax-m7-ui-56-logs-page-visible-ui/` with desktop, search-empty, mobile 320 screenshots and metrics JSON.
- Evidence doc records owner HTML/unpacked/React comparison, mock/degraded boundary, screenshot paths, metrics and validation command results.

## 失败分支

- If source parity cannot be achieved without runtime data, keep the UI visibly degraded/mock/local-only and record the visual/runtime delta.
- If validation blocks on baseline environment/runtime issues, record exact command/output and do not claim closure.

## 不做什么

- No API/DB/runtime/authz/audit/log/export job calls.
- No real audit/log query, CSV generation, file write, tenant/action navigation, trace closure, audit-write closure, release gate change, owner visual acceptance, merge closure, runtime closure, GA-0, production readiness, or 1.0 release approval.
- No changes to lockfiles, DB/API/backend, global config, old release pages, or unrelated pages.

## 验收映射

- M7 visible UI migration for tenant `日志`.
- PRD/v1.1 log visibility remains runtime-follow-up; this spec closes only visible UI candidate evidence.

## Impeccable / Design Skill Layer

- Adopted: dense, restrained, status-first product UI; owner prototype layout and copy shape; visible degraded/mock/read-only/browser-local boundaries; tenant-only nav separation; keyboard-operable tabs/search/detail actions; readable desktop table and mobile 320 no-overflow card fallback.
- Rejected: old shell visuals, old `--uzmax-*` visual source, M5 logs shell as implementation, production-looking audit data, real audit/log export, CSV/file writing, audit/log runtime calls, navigation to real tenant/action records, trace/runtime/release closure copy, and owner-acceptance claims because this slice is UI-first and local-only.

## Closeout / Incident 记录

- Incident: none planned.
