# M7-UI-82 Group Overview Default Visual Parity Refresh

## Goal

Refresh the existing `group.overview` / `集团总览` default homepage on top of
`origin/codex/m7-ui-81-eval-default-visual-parity-refresh` so the default
visible `/design` group body reads like the owner HTML operations homepage
instead of an engineering boundary report.

The page must still preserve truthful degraded/mock/read-only runtime boundary
evidence in DOM/data attributes or hidden DOM. This slice does not implement
group aggregate DB/API/runtime, production authorization/cache invalidation,
real operational metrics, owner visual acceptance, merge closure, GA-0,
production readiness or 1.0 release approval.

## Owner / Agent Boundary

Owner/coordinator:

- Confirm this branch is stacked on `origin/codex/m7-ui-81-eval-default-visual-parity-refresh`.
- Confirm `group.overview` remains GROUP layer only and visible-parity-first.
- Decide later whether real group aggregate DB/API/runtime proceeds through the
  existing REQ-G01/REQ-G01A/code-01 lane.
- Keep production/staging, real customer/order data, LLM key, cost/compliance,
  GA-0 and release decisions owner-only.

AI agent:

- Work only in `/Users/atilla/.codex/worktrees/m7-ui-82-group-overview-default-visual-parity-refresh`
  on branch `codex/m7-ui-82-group-overview-default-visual-parity-refresh`.
- Keep `/Users/atilla/Applications/UZMAX智能运营` root/main read-only.
- Start by recording `pwd`, `git status --short --branch` and
  `git branch --show-current`.
- Read `AGENTS.md`, M7-UI-12, M7-UI-61 spec/evidence, current group overview
  source/tests, owner HTML, unpacked group overview page/fixture and
  Impeccable product-register context before claiming evidence.
- Preserve the existing controlled UI-only tenant entry into
  `tenant.conversations`.

## Timebox

0.5 workday. If the page requires shared shell/topbar/sidebar/router/PageOutlet,
registry, API/DB, package/lock, global config, CI guard changes, real group
runtime, production data, broad redesign or edits outside the allowed paths,
stop and report `BLOCKED`.

## Spec 类型

fix

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-UI-82-group-overview-default-visual-parity-refresh.md`
  - `docs/evidence/M7/M7-UI-82-group-overview-default-visual-parity-refresh.md`
  - `docs/evidence/M7/README.md`
  - `docs/admin-ui-page-migration-ledger.md`
  - `apps/admin/src/pages/group/GroupOverviewPage.tsx`
  - `apps/admin/src/pages/group/groupOverviewFallback.ts`
  - `apps/admin/tests/m7-ui-group-overview.spec.ts`
  - `apps/admin/tests/m7-ui-group-overview-default-visual-parity.spec.ts`
- 未列出的模块默认不可改。

## Change Budget And Path Classification

- source changed files: <= 2
- source net LOC: <= 120
- new source files: 0
- test files changed/added: <= 2 focused Playwright specs
- docs changed/added: <= 4
- package/lock/generated/config/backend/API/DB/worker/cron/CI/global
  config/shared shell/sidebar/topbar/router/registry/PageOutlet: 0
- external API/SDK/provider/connector/adapter basis: none; only local UI
  fallback state and browser evidence are in scope.

```yaml
source:
  - apps/admin/src/pages/group/GroupOverviewPage.tsx
  - apps/admin/src/pages/group/groupOverviewFallback.ts
test:
  - apps/admin/tests/m7-ui-group-overview.spec.ts
  - apps/admin/tests/m7-ui-group-overview-default-visual-parity.spec.ts
docs:
  - docs/specs/M7-UI-82-group-overview-default-visual-parity-refresh.md
  - docs/evidence/M7/M7-UI-82-group-overview-default-visual-parity-refresh.md
  - docs/evidence/M7/README.md
  - docs/admin-ui-page-migration-ledger.md
generated: []
lock: []
config: []
```

## Required Reads And Source Mapping

Required reads:

- `AGENTS.md`
- Impeccable context for `apps/admin/src/pages/group/GroupOverviewPage.tsx`
  and `.agents/skills/impeccable/reference/product.md`
- `docs/specs/M7-UI-12-group-overview-page.md`
- `docs/specs/M7-UI-61-group-overview-first-viewport-parity.md`
- `docs/evidence/M7/M7-UI-61-group-overview-first-viewport-parity.md`
- `docs/admin-ui-page-migration-ledger.md`
- `docs/evidence/M7/README.md`
- `apps/admin/src/pages/group/GroupOverviewPage.tsx`
- `apps/admin/src/pages/group/groupOverviewFallback.ts`
- `apps/admin/tests/m7-ui-group-overview.spec.ts`
- `/Users/atilla/Downloads/运营塔台1.0.html`
- `/Users/atilla/源码/unpacked 6/pages/group/GroupOverviewPage.tsx`
- `/Users/atilla/源码/unpacked 6/fixtures/group.ts`

| Source | Required use |
|---|---|
| Owner HTML rendered state | Visual baseline for source-like `集团总览`, result label, health strip and tenant table default body. |
| Unpacked `GroupOverviewPage.tsx` | Structured source for clean visible result label, search/clear, six cards, sortable table and tenant entry. |
| Unpacked `fixtures/group.ts` | Source-shaped row labels and values: `美妆 · 中亚`, `阻断/通过/运行中`, `降级/故障/正常`, source-like last abnormal labels. Do not import fixture. |
| M7-UI-61 evidence | Runtime caveat baseline to refresh: default visible caveats become hidden/data evidence. |

## Source Parity Decision

- Default visible body follows owner/unpacked operations-home anatomy: `4 个租户`,
  source-like business lines, eval/order/last-abnormal labels and visible rows.
- Visible engineering/runtime labels are removed from the default body.
- Runtime labels remain present in `data-runtime-state`, `data-runtime-source`,
  `data-runtime-boundary` and hidden `m7-group-overview-runtime-note`.
- Search/filter/clear/sort and controlled UI-only tenant entry remain unchanged.
- Browser-local fallback rows remain centralized in `groupOverviewFallback.ts`.

## Impeccable / Design Decision Record

Adopted: product-register guidance for dense, restrained admin UI; owner/source
default body text; hidden-but-present runtime boundary evidence; group-only shell
parity; controlled tenant-entry boundary; 320px no-overflow fallback.

Rejected: visible default runtime caveat strip, visible `mock` prefixes in
business lines/statuses/last abnormal, old shell visual vocabulary, old
`--uzmax-*` as visual source, broad group-overview redesign, production-looking
runtime claims, real group aggregate API/DB/runtime wiring and
owner-acceptance/runtime/release claims.

## Pass Conditions

- `/design` default `group.overview` visible body does not contain:
  `mock/degraded`, `mock`, `read-only`, `runtime unavailable`,
  `not production metrics`, `centralized mock/degraded fallback only`,
  `aggregate runtime unavailable` or `synthetic`.
- Runtime boundary remains inspectable through data attributes and hidden DOM.
- Default page still shows `集团总览`, `4 个租户`, six health cards, source-like
  table rows and the existing nine columns.
- Eval statuses are visible as `阻断/通过/运行中`; order statuses are visible as
  `降级/故障/正常`; last abnormal labels are source-like, for example
  `红线 · 9分钟前`.
- Row click/keyboard still enters `tenant.conversations` with tenant layer nav.
- Sidebar collapse and 320px mobile fallback remain readable/no-overflow.
- No disallowed files are changed.

## Validation Plan

- `git diff --check`
- `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-81-eval-default-visual-parity-refresh --spec docs/specs/M7-UI-82-group-overview-default-visual-parity-refresh.md --include-worktree`
- Touched Prettier.
- Touched ESLint.
- Admin build.
- Focused Playwright:
  - `apps/admin/tests/m7-ui-group-overview.spec.ts`
  - `apps/admin/tests/m7-ui-group-overview-default-visual-parity.spec.ts`

## Failure Branches

- If hidden runtime evidence cannot be preserved without visible body pollution,
  keep the boundary visible and report the owner-source conflict.
- If dependencies are unavailable after cleanup, record exact dependency failure
  and do not fake evidence.
- If source geometry requires shared shell/router/PageOutlet/registry/API/DB
  edits, stop and report the dependency instead of editing forbidden files.

## Not Doing

- No shared shell/topbar/sidebar/router/PageOutlet/registry/API/DB/schema/
  migration/generated/package/lock/global config/CI guard changes.
- No raw prototype fixture import.
- No group aggregate DB/API/runtime, real authorization/cache invalidation,
  production metrics, real customer/order-data use, owner visual acceptance,
  merge closure, runtime closure, GA-0, production readiness or 1.0 release
  approval.
