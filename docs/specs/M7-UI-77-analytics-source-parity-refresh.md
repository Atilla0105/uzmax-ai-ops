# M7-UI-77 Analytics Source Parity Refresh

## Goal

Refresh the existing visible UI-first `tenant.analytics` / `分析` page on top of `origin/codex/m7-ui-76-config-source-parity-refresh` so its primary visible geometry and copy better match the current owner-rendered prototype and unpacked analytics source, without expanding this slice into real analytics runtime.

This is a source-parity UI evidence slice. It does not implement analytics DB/API/runtime, production metrics, export jobs, file writes, audit writes, owner visual acceptance, merge closure, runtime closure, GA-0 or 1.0 release approval.

## Owner Confirmation Points And AI Agent Responsibility

Owner/coordinator:

- Confirm this branch is stacked on `origin/codex/m7-ui-76-config-source-parity-refresh`.
- Confirm `tenant.analytics` remains TENANT layer only: `/design` opens group shell, tenant selection enters tenant shell, active page `tenant.analytics`, tenant categories only `运营/数据/智能/管理/洞察`.
- Decide later whether real analytics DB/API/runtime, export jobs, audit writes or production metric population proceeds through separate approved specs.
- Keep production/staging, real customer/order data, LLM key, cost/compliance, GA-0 and release decisions owner-only.

AI agent:

- Work only in `/Users/atilla/.codex/worktrees/m7-ui-77-analytics-source-parity-refresh` on branch `codex/m7-ui-77-analytics-source-parity-refresh`.
- Keep `/Users/atilla/Applications/UZMAX智能运营` root/main read-only.
- Start by recording `pwd`, `git status --short --branch` and `git branch --show-current`.
- Read `AGENTS.md`, current M7 design docs, M7-UI-55 spec/evidence, current analytics source/tests, owner unpacked analytics page/fixture and owner HTML before claiming evidence.
- Preserve centralized synthetic/mock/degraded/browser-local rows and local-only analytics controls.

## Timebox

0.5 workday. If the page requires shared shell/router/PageOutlet/registry/API/DB/package/lock/global config/CI guard edits, real analytics runtime, production metrics, export jobs, audit writes or broad UI redesign, stop and report `BLOCKED`.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-UI-77-analytics-source-parity-refresh.md`
  - `docs/evidence/M7/M7-UI-77-analytics-source-parity-refresh.md`
  - `docs/evidence/M7/README.md`
  - `docs/admin-ui-page-migration-ledger.md`
  - `apps/admin/tests/m7-ui-analytics-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-analytics-page.spec.ts`
- Conditional source scope, only where owner/source/browser comparison proves current React mismatch:
  - `apps/admin/src/pages/analytics/AnalyticsPage.tsx`
  - `apps/admin/src/pages/analytics/analyticsFallback.ts`
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source changed files: <= 2 conditional only
- source net LOC: <= 140 conditional only
- new source files: 0
- test files changed/added: <= 2 focused Playwright specs
- docs changed/added: <= 4
- package/lock/generated/config/backend/API/DB/worker/cron/CI/global config/shared shell/sidebar/topbar/router/registry/PageOutlet: 0
- external API/SDK/provider/connector/adapter basis: none; only browser evidence and local UI fallback state are in scope.

```yaml
source:
  - apps/admin/src/pages/analytics/AnalyticsPage.tsx
  - apps/admin/src/pages/analytics/analyticsFallback.ts
test:
  - apps/admin/tests/m7-ui-analytics-source-parity.spec.ts
  - apps/admin/tests/m7-ui-analytics-page.spec.ts
docs:
  - docs/specs/M7-UI-77-analytics-source-parity-refresh.md
  - docs/evidence/M7/M7-UI-77-analytics-source-parity-refresh.md
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
- `docs/specs/M7-UI-55-analytics-page.md`
- `docs/evidence/M7/M7-UI-55-analytics-page.md`
- `docs/evidence/M7/README.md`
- `apps/admin/src/pages/analytics/AnalyticsPage.tsx`
- `apps/admin/src/pages/analytics/analyticsFallback.ts`
- `apps/admin/tests/m7-ui-analytics-page.spec.ts`
- `/Users/atilla/Downloads/运营塔台1.0.html`
- `/Users/atilla/源码/unpacked 6/pages/analytics/AnalyticsPage.tsx`
- `/Users/atilla/源码/unpacked 6/fixtures/analytics.ts`

| Source | Required use |
|---|---|
| Owner HTML rendered state | Browser-comparable source for the analytics header, range controls, add-dimension/export controls, KPI grid, handoff bars, Top issues, table and shell/sidebar context. |
| Unpacked analytics page | Structured source for source-like panel anatomy, dimensions menu, dimension chips and table behavior where owner HTML is not enough. |
| Unpacked `fixtures/analytics.ts` | Structured source for range labels, KPI labels, handoff reasons, Top issue labels, dimension definitions and stable synthetic table values. |
| v1.1/docs/admin-design-system | Product/runtime boundary: analytics/logs are real product scope, but this slice is UI evidence only and does not imply analytics runtime, export or audit closure. |

## Source Parity Decision

React follows the rendered owner HTML first, then unpacked analytics source where rendered HTML is malformed or insufficient:

- Header primary visual hierarchy is source-like: `分析`, range segmented control, `添加维度`, `导出`; visible `selectedTenantId · tenant layer` engineering badge is removed from the header and retained only as DOM evidence.
- Range labels follow source spacing: `今日`, `近 7 日`, `近 30 日`.
- Dimension definitions follow unpacked fixture labels and values, including `订单状态`, seven `时间粒度` values and `玉珠客服·主理`.
- KPI cards show only owner/source labels such as `解决率`, `转人工率`, `SLA 达标` and `AI 成本/日`; runtime/local-only boundary text must not be appended to the visible KPI label area.
- Analytics page root owns its tenant-content width calibration because ordinary tenant outlets do not add a page class: desktop expanded follows `calc(100vw - var(--nav-expanded-width))`, collapsed follows `calc(100vw - var(--nav-collapsed-width))`, and mobile stays bounded to the viewport.
- Runtime/local-only labels remain present in DOM/data attributes/tests/metrics/state copy/toasts, but the default runtime note is hidden from the primary visual hierarchy so the page resembles the owner/source analytics surface.
- KPI grid, handoff reason bars, Top issue list, dimension chips and analysis table remain source-shaped, centralized synthetic/mock/degraded/browser-local only.

## Impeccable / Design Decision Record

Adopted by default: restrained dense product UI, source-like compact header, table/chart-panel anatomy, semantic status colors only for operational meaning, hidden-but-present runtime boundary evidence, readable 320px fallback and explicit local-only copy for export/dimension behavior.

Rejected: old shell visual vocabulary, visible tenant-layer engineering badge in the page header, old `--uzmax-*` as visual source, broad dashboard redesign, production-looking analytics metrics, real export jobs/file writes, analytics runtime, audit-write claims and owner-acceptance/runtime/release claims.

## Pass Conditions

- `tenant.analytics` renders inside tenant shell after selecting a tenant from `/design`.
- Browser evidence includes owner/source mapping, React desktop default analytics, local dimension state, collapsed nav and 320px mobile screenshots/metrics under `/tmp/uzmax-m7-ui-77-analytics-source-parity-refresh/`.
- Metrics include `shellLevel=tenant`, `activePageId=tenant.analytics`, tenant nav categories present, group nav labels absent, outer nav width `232/68`, analytics root/header/body width near `1208/1372` for expanded/collapsed at 1440px, KPI first row count at least `7` on desktop expanded, topbar height `52-53`, key analytics cards/charts/tables/source sections, runtime labels present but not visible in the default body visual (`runtimeLabelsVisibleInBody=false` for default/local/collapsed/mobile evidence), and mobile body/document/root width <= `320`.
- Focused Playwright covers source parity basics, all dimension labels, local dimension state, local-only export boundary, forced states through the existing analytics spec, collapsed nav and mobile fallback.
- Source corrections stay small and limited to `apps/admin/src/pages/analytics/**`.
- No disallowed files are changed.

## Validation Plan

- `git diff --check`
- `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-76-config-source-parity-refresh --spec docs/specs/M7-UI-77-analytics-source-parity-refresh.md --include-worktree`
- Touched admin ESLint:
  - `node node_modules/eslint/bin/eslint.js apps/admin/src/pages/analytics/AnalyticsPage.tsx apps/admin/src/pages/analytics/analyticsFallback.ts apps/admin/tests/m7-ui-analytics-source-parity.spec.ts apps/admin/tests/m7-ui-analytics-page.spec.ts`
- Focused Playwright:
  - `apps/admin/tests/m7-ui-analytics-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-analytics-page.spec.ts`
- Admin build:
  - `node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir`
- `git merge-tree --write-tree origin/codex/m7-ui-76-config-source-parity-refresh HEAD`

## Failure Branches

- If owner HTML cannot be captured in browser, record the failure/degraded capture in evidence and rely on unpacked source mapping plus React browser screenshots.
- If Playwright cannot start because dependencies are unavailable after cleanup, record exact dependency failure and do not fake evidence.
- If source geometry requires shared shell/router/PageOutlet/registry/API/DB edits, stop and report the dependency instead of editing forbidden files.

## Not Doing

- No shared shell/topbar/sidebar/router/PageOutlet/registry/API/DB/schema/migration/generated/package/lock/global config/CI guard changes.
- No raw prototype fixture import.
- No analytics DB/API/runtime, production metrics, export jobs, file writes, audit writes, production authz integration, runtime close, owner visual acceptance, merge closure, GA-0, production readiness or 1.0 release approval.
- No real customer, order, Telegram, address, phone or production data.
