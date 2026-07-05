# M7-UI-57 Group Logs Page

## Goal

Implement a UI-first `group.logs` / `集团日志` visible page on top of `origin/codex/m7-ui-52-tenant-management-visible-ui`.

## Owner Confirmation Points

- Owner visual/source truth: `/Users/atilla/Downloads/运营塔台1.0.html`, `/Users/atilla/源码/unpacked 6/pages/group/GroupLogsPage.tsx`, `/Users/atilla/源码/unpacked 6/fixtures/groupPlatform.ts`, and `docs/admin-design-system.md`.
- This supersedes the old ledger placeholder `M7-UI-04G-group-logs`.
- This is a GROUP layer page. It renders group-only navigation and never carries a tenant id.
- Log rows are centralized synthetic/mock/degraded data derived from owner fixture values.
- Module filters, search, export and detail actions are browser-local only. They do not query production audit logs, write files, call audit runtime/export jobs, route to real tenant/action records, or claim trace closure.
- No owner visual acceptance, audit runtime closure, export job readiness, real audit-log readiness, GA-0, or 1.0 release approval is claimed.

## 时间盒

One focused worker slice. If the page cannot render with visible UI plus state/test/evidence coverage inside this branch, stop and mark `blocked_by_visual_or_validation_failure`.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-UI-57-group-logs-page.md`
  - `docs/evidence/M7/M7-UI-57-group-logs-page.md`
  - `docs/admin-ui-page-migration-ledger.md`
  - `docs/evidence/M7/README.md`
  - `apps/admin/src/pages/PageOutlet.tsx`
  - `apps/admin/src/pages/registry.ts`
  - `apps/admin/src/pages/group/GroupLogsPage.tsx`
  - `apps/admin/src/pages/group/GroupLogsViews.tsx`
  - `apps/admin/src/pages/group/groupLogsFallback.ts`
  - `apps/admin/tests/m7-ui-group-logs.spec.ts`
- 未列出的模块默认不可改。

## Path Classification

```yaml
source:
  - apps/admin/src/pages/PageOutlet.tsx
  - apps/admin/src/pages/registry.ts
  - apps/admin/src/pages/group/GroupLogsPage.tsx
  - apps/admin/src/pages/group/GroupLogsViews.tsx
  - apps/admin/src/pages/group/groupLogsFallback.ts
test:
  - apps/admin/tests/m7-ui-group-logs.spec.ts
docs:
  - docs/specs/M7-UI-57-group-logs-page.md
  - docs/evidence/M7/M7-UI-57-group-logs-page.md
  - docs/admin-ui-page-migration-ledger.md
  - docs/evidence/M7/README.md
generated: []
lock: []
config: []
```

## Change Budget

- Changed source files <= 5.
- New source files <= 3.
- Net source LOC <= 600.
- Each React component file <= 250 lines.
- No `large_change_exception` planned.

## PR Hygiene Notes

- New source `rg` conclusion: searched `GroupLogsPage`, `group.logs`, `集团日志`, `M7-UI-04G`, current registry/router entries, existing M7 group pages and tests. The current route was registry/scaffold-only; no existing M7 group-logs page implementation existed in `apps/admin/src/pages/group/**`. New page source belongs under `apps/admin/src/pages/group/**` to match current M7 page workers.
- External API/SDK/provider/connector/adapter basis: none. This page intentionally does not call API/DB/runtime/audit jobs/export jobs or external providers.
- Exceptions: none.

## 文档触发检查

- 结果：`updated`.
- 判断依据：page migration ledger and M7 evidence index are owned outputs for this UI page slice.

## Preconditions

- Worktree: `/Users/atilla/.codex/worktrees/m7-ui-57-group-logs-visible-ui`.
- Branch: `codex/m7-ui-57-group-logs-visible-ui`.
- Base: `origin/codex/m7-ui-52-tenant-management-visible-ui`.
- Root/main checkout is read-only coordination; all edits stay in the assigned worktree.
- Startup recorded `pwd`, `git status --short --branch`, and `git branch --show-current`.

## Implementation Contract

- Update `registry.ts` so `group.logs` targets `M7-UI-57-group-logs-page`, implemented pending PR, evidence pending not accepted/not runtime closed.
- Update `PageOutlet.tsx` to render `<GroupLogsPage />` for `group.logs`; it must not carry `data-tenant-id`.
- Preserve owner source structure: group-layer header, title `集团日志`, local-only subtitle adapted from `N 条 · 全集团操作与审计`, module filter chips, search box, export button, dense seven-column table (`操作时间/租户/操作人/操作模块/操作功能/操作对象/操作内容`), link-style detail rows with arrow, and empty state when filters/search produce no rows.
- Centralize synthetic data and styles in `groupLogsFallback.ts`.
- URL query `?state=loading|empty|error|permission|degraded` and `?m7GroupLogsState=...` render deterministic states. Default is degraded/interactive mock.
- Local interactions only: export and detail actions emit local-only toast copy; no CSV/file write, production audit export, audit runtime call, or real record navigation occurs.

## Impeccable / Design Skill Layer

- Adopted: dense, restrained, status-first product UI; owner prototype layout and copy shape; visible degraded/mock/read-only/browser-local boundaries; group-only nav separation; keyboard-operable module chips/search/export/detail actions; readable desktop table and mobile 320 no-overflow card fallback.
- Rejected: old shell visuals, old `--uzmax-*` visual source, production-looking audit data, real audit export, CSV/file writing, audit runtime calls, navigation to real tenant/action records, trace/runtime/release closure copy, and owner-acceptance claims because this slice is UI-first and local-only.

## Not Doing

- No API/DB/runtime/authz/audit/export job calls.
- No real audit-log query, CSV generation, file write, tenant/action navigation, trace closure, audit-write closure, release gate change, owner visual acceptance, merge closure, runtime closure, GA-0, production readiness, or 1.0 release approval.
- No changes to lockfiles, DB/API/backend, global config, old release pages, or unrelated pages.

## Acceptance

- Focused Playwright coverage for `activePageId=group.logs`, `shellLevel=group`, group-only nav, no tenant id, title/subtitle/runtime note, module chips, search filtering, filtered empty state, export local-only toast, detail local-only action, forced URL states, collapsed sidebar width and mobile 320 no-overflow fallback.
- Browser evidence under `/tmp/uzmax-m7-ui-57-group-logs-visible-ui/` with desktop/table screenshot, mobile 320 screenshot and metrics JSON.
- Evidence doc records source HTML/unpacked/React three-way comparison summary, mock/degraded boundary, screenshot paths, metrics and validation commands/results.

## 失败分支

- If source parity cannot be achieved without runtime data, keep the UI visibly degraded/mock/local-only and record the visual/runtime delta.
- If validation blocks on baseline environment/runtime issues, record exact command/output and do not claim closure.

## Closeout / Incident 记录

- Incident: none planned.
