# M7-UI-57 Group Logs Page Evidence

## Status

`implementation_candidate_pending_pr_review_not_accepted_not_runtime_closed`

This branch implements a visible UI-first `group.logs` / `集团日志` candidate with synthetic mock/degraded audit rows. It does not claim owner visual acceptance, audit runtime closure, production audit export, file export, trace closure, GA-0, or 1.0 release approval.

## Scope

- Spec: `docs/specs/M7-UI-57-group-logs-page.md`
- Route: `group.logs`
- Source target: `apps/admin/src/pages/group/GroupLogsPage.tsx`, `apps/admin/src/pages/group/GroupLogsViews.tsx`, `apps/admin/src/pages/group/groupLogsFallback.ts`
- Test target: `apps/admin/tests/m7-ui-group-logs.spec.ts`

## Source Review

- Read `AGENTS.md`.
- Read `docs/admin-design-system.md`.
- Ran Impeccable context for `apps/admin/src/pages/group` and read product-register guidance.
- Inspected current group page examples:
  - `apps/admin/src/pages/group/GroupTenantPage.tsx`
  - `apps/admin/src/pages/group/GroupTenantViews.tsx`
  - `apps/admin/src/pages/group/groupTenantFallback.ts`
  - `apps/admin/tests/m7-ui-tenant-management.spec.ts`
- Inspected owner/prototype sources:
  - `/Users/atilla/源码/unpacked 6/pages/group/GroupLogsPage.tsx`
  - `/Users/atilla/源码/unpacked 6/fixtures/groupPlatform.ts` group logs section (`GLOG_COLS`, `GLOG_BASE`, `GLOG_MODULES`)
  - `/Users/atilla/Downloads/运营塔台1.0.html` located by packed HTML text search for `集团日志`, `全集团操作与审计`, `操作时间`, and `没有匹配的记录`.
- Inspected old reference branch files from `origin/codex/m7-ui-57-group-logs-visible-ui` for learnings only; this branch did not merge or cherry-pick that branch.

## Three-Way Comparison

| Surface | Owner / unpacked source | React candidate | Result |
|---|---|---|---|
| Header | `集团日志`; source copy uses `N 条 · 全集团操作与审计` | React uses `N 条 mock · 全集团操作与审计预览 · browser-local only` plus degraded/mock badge | Aligned with local-only boundary; avoids production audit claim |
| Filters/search/export | Source has module chips, search input and `导出` button | React preserves module chips as buttons with `aria-pressed`, labeled search and a real export button | Aligned; export only emits local toast |
| Log table | Source has seven columns: 操作时间/租户/操作人/操作模块/操作功能/操作对象/操作内容 | React renders the same dense seven-column desktop table with internal horizontal scroll | Aligned for desktop source structure |
| Detail links | Source renders link-style rows with arrow and optional navigation callback | React renders link-style real buttons with arrow and local-only toast | Aligned visually; runtime navigation intentionally rejected |
| Empty/mobile | Source empty text says `没有匹配的记录`; prototype is desktop-first | React preserves empty state and adds mobile card fallback at 320px with no body overflow | Required M7 state/mobile coverage |
| Runtime states | Prototype shows default page | React adds deterministic loading/empty/error/permission/degraded states | Required M7 state coverage |

## Data Boundary

- All rows are synthetic and centralized in `groupLogsFallback.ts`.
- Persistent UI copy states: `degraded`, `mock`, `read-only`, `browser-local only`, `synthetic audit rows`, `no production audit export`, `no file written`, `no audit runtime call`, `no real tenant/action navigation`.
- Module filters and search only filter in-memory synthetic rows.
- Export action only shows a toast; no CSV is generated, no file is written, no export job or audit runtime call occurs.
- Detail action only shows a toast; no route or navigation into real tenant/action records occurs.
- No DB/API/runtime/authz/audit/export/release wiring is implemented.

## Validation

Passed locally on this cleanstack branch:

- `npm run format:check`
- `npm run guard:prettier-ignore -- --base origin/codex/m7-ui-31-orders-visible-ui`
- `npm run jscpd`
- `npm run knip`
- `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-31-orders-visible-ui --spec docs/specs/M7-UI-57-group-logs-page.md --include-worktree`
- `npm --workspace @uzmax/db run prisma:generate && npm run typecheck`
- `npm run lint`
- `npx playwright test apps/admin/tests/m7-ui-group-logs.spec.ts`

Validation notes:

- `npm ci` was run inside the assigned worktree so this worker does not share root `node_modules`.
- `npm run jscpd` and `npm run knip` initially failed before `npm ci` because the newly created assigned worktree had no `node_modules`; both passed after the worktree-local install.
- `pnpm` commands were blocked by Corepack/project configuration because this repo declares `packageManager: npm@11.9.0`; equivalent npm/direct-node commands above were used. No `pnpm-lock.yaml` was generated.
- `npm run guard:pr-shape -- --base origin/codex/m7-ui-31-orders-visible-ui --head HEAD` ran before PR creation and reported no PR context, so the local spec/include-worktree guard command was also run.
- Prisma emitted the existing available-update notice for `6.19.3 -> 7.8.0` and exited 0.
- Playwright webServer emitted the existing Vite chunk-size warning and exited 0.
- Focused group logs Playwright: `5 passed`.

## Browser Evidence

Expected artifacts under `/tmp/uzmax-m7-ui-57-group-logs-visible-ui/`:

- Desktop screenshot: `/tmp/uzmax-m7-ui-57-group-logs-visible-ui/react-group-logs-desktop.png`
- Filter empty screenshot: `/tmp/uzmax-m7-ui-57-group-logs-visible-ui/react-group-logs-filter-empty.png`
- Mobile 320 screenshot: `/tmp/uzmax-m7-ui-57-group-logs-visible-ui/react-group-logs-mobile-320.png`
- Desktop metrics JSON: `/tmp/uzmax-m7-ui-57-group-logs-visible-ui/react-group-logs-metrics.json`
- Collapsed metrics JSON: `/tmp/uzmax-m7-ui-57-group-logs-visible-ui/react-group-logs-collapsed-metrics.json`
- Mobile metrics JSON: `/tmp/uzmax-m7-ui-57-group-logs-visible-ui/react-group-logs-mobile-320-metrics.json`
- Source sampling JSON: `/tmp/uzmax-m7-ui-57-group-logs-visible-ui/source-sampling.json`

Metrics summary:

- `activePageId`: `group.logs`
- `shellLevel`: `group`
- `activeModule`: `全部模块`
- `sidebarExpandedWidth`: `232`
- `collapsed navWidth`: `68`
- `topbarHeight`: `53`
- `tableRowCount`: `7`
- `cardRowCount`: `7`
- `tableWrapperWidth`: `998`
- `mobile bodyScrollWidth`: `320`
- `mobile documentScrollWidth`: `320`
- `mobile pageWidth`: `320`

## Remaining Deltas

- Runtime audit DB/API/authz/export paths remain intentionally not implemented.
- Real audit-log query, CSV generation, file writing, export jobs, trace closure and navigation to real tenant/action records are not implemented.
- Owner visual acceptance is still required after PR review/browser comparison.
