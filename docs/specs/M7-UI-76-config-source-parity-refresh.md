# M7-UI-76 Config Source Parity Refresh

## Goal

Refresh the existing visible UI-first `tenant.config` / `配置` page on top of `origin/codex/m7-ui-75-team-source-parity-refresh` so its primary visible geometry and copy better match the current owner-rendered prototype and unpacked config source, without expanding this slice into runtime config persistence.

This is a source-parity UI evidence slice. It does not implement config DB/API writes, audit writes, connector runtime switching, eval-gated publish, order import runtime, owner visual acceptance, merge closure, runtime closure, GA-0 or 1.0 release approval.

## Owner Confirmation Points And AI Agent Responsibility

Owner/coordinator:

- Confirm this branch is stacked on `origin/codex/m7-ui-75-team-source-parity-refresh`.
- Confirm `tenant.config` remains TENANT layer only: `/design` opens group shell, tenant selection enters tenant shell, active page `tenant.config`, tenant categories only `运营/数据/智能/管理/洞察`.
- Decide later whether real config persistence, audit writing, connector switching, eval-gated publish or order import runtime proceeds through separate approved specs.
- Keep production/staging, real customer/order data, LLM key, cost/compliance, GA-0 and release decisions owner-only.

AI agent:

- Work only in `/Users/atilla/.codex/worktrees/m7-ui-76-config-source-parity-refresh` on branch `codex/m7-ui-76-config-source-parity-refresh`.
- Keep `/Users/atilla/Applications/UZMAX智能运营` root/main read-only.
- Start by recording `pwd`, `git status --short --branch` and `git branch --show-current`.
- Read `AGENTS.md`, current diff, M7-UI-54 spec/evidence, current config source/tests, owner unpacked config page/fixtures/hook and owner HTML before claiming evidence.
- Preserve centralized synthetic/mock/degraded/browser-local rows and local-only risky actions.

## Timebox

0.5 workday. If the page requires shared shell/router/PageOutlet/registry/API/DB/package/lock/global config/CI guard edits, real config runtime, production config write, connector switch, order import runtime, audit writes or broad UI redesign, stop and report `BLOCKED`.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-UI-76-config-source-parity-refresh.md`
  - `docs/evidence/M7/M7-UI-76-config-source-parity-refresh.md`
  - `docs/evidence/M7/README.md`
  - `docs/admin-ui-page-migration-ledger.md`
  - `apps/admin/tests/m7-ui-config-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-config-page.spec.ts`
- Conditional source scope, only where owner/source/browser comparison proves current React mismatch:
  - `apps/admin/src/pages/config/ConfigPage.tsx`
  - `apps/admin/src/pages/config/configFallback.ts`
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
  - apps/admin/src/pages/config/ConfigPage.tsx
  - apps/admin/src/pages/config/configFallback.ts
test:
  - apps/admin/tests/m7-ui-config-source-parity.spec.ts
  - apps/admin/tests/m7-ui-config-page.spec.ts
docs:
  - docs/specs/M7-UI-76-config-source-parity-refresh.md
  - docs/evidence/M7/M7-UI-76-config-source-parity-refresh.md
  - docs/evidence/M7/README.md
  - docs/admin-ui-page-migration-ledger.md
generated: []
lock: []
config: []
```

## Required Reads And Source Mapping

Required reads:

- `AGENTS.md`
- `PRODUCT.md`
- `DESIGN.md`
- `docs/admin-design-system.md`
- `docs/admin-ui-page-migration-ledger.md`
- `docs/specs/M7-UI-54-config-page.md`
- `docs/evidence/M7/M7-UI-54-config-page.md`
- `docs/evidence/M7/README.md`
- `apps/admin/src/pages/config/ConfigPage.tsx`
- `apps/admin/src/pages/config/configFallback.ts`
- `apps/admin/tests/m7-ui-config-page.spec.ts`
- `/Users/atilla/Downloads/运营塔台1.0.html`
- `/Users/atilla/源码/unpacked 6/pages/config/ConfigPage.tsx`
- `/Users/atilla/源码/unpacked 6/fixtures/config.ts`
- `/Users/atilla/源码/unpacked 6/hooks/useConfig.ts`
- v1.1 tenant-layer, config/audit/connector/eval, mobile fallback and release-boundary sections.

| Source | Required use |
|---|---|
| Owner HTML rendered state | Browser-comparable source for internal 236px config nav, section labels, version head, history/save controls, visible configured section and shell/sidebar context. |
| Unpacked config page | Structured source for icon+label nav, right content padding, version head, history row copy, business grid width, connector confirmation and section anatomy. |
| Unpacked `fixtures/config.ts` and `hooks/useConfig.ts` | Structured source for 8 section labels, versions/history and local state transitions. |
| v1.1 docs | Product/runtime boundary: config management is real product scope, but this slice is UI evidence only and does not imply config/audit/connector/eval runtime closure. |

## Source Parity Decision

React follows the rendered owner HTML first, then unpacked config source where rendered HTML is malformed or insufficient:

- Internal config navigation is `236px`, title `配置`, 8 icon+label rows in order: `业务配置/SLA/模板/模型路由/成本护栏/熔断阈值/渠道配置/订单 connector`.
- Right main content is `#FAFAF8`, scroll-owned and padded `20px 24px`.
- Version head lives inside the content area, not as a separate page-level toolbar.
- Header visible structure is section label, `当前版本 v* · meta`, optional `未保存的修改`, and right tools `版本历史(...)` plus `保存并生成版本`.
- Visible `selectedTenantId · tenant layer` and dominant runtime-note rows are removed from primary visual hierarchy. Runtime/local-only labels remain in DOM, metrics, state copy, modal descriptions and toasts.
- Business config grid uses `max-width: 640px`, two columns, `18px` padding and `16px` gap.
- Version history visible copy follows owner shape `版本历史 · 回滚需二次确认并写审计`; this branch does not claim real audit writes, so local-only boundaries are recorded in confirmation/toast/evidence instead of polluting the card head.
- Connector visible copy follows owner-like `主路径` wording; confirmation and toast preserve `no connector switch / no audit write / no API call`.

## Impeccable / Design Decision Record

Adopted by default: restrained dense product UI, source-like compact internal nav and content padding, icon+label affordances, version head inside the content area, hidden-but-present runtime boundary evidence, readable mobile fallback and explicit local-only copy on risky confirmations/toasts.

Rejected: old shell visual vocabulary, visible tenant-layer engineering badge in the page header, old `--uzmax-*` as visual source, broad redesign, production-looking config mutations, real audit-write claims in runtime behavior, connector switching, eval-gated publish, runtime closure copy and owner-acceptance claims.

## Pass Conditions

- `tenant.config` renders inside tenant shell after selecting a tenant from `/design`.
- Browser evidence includes owner/source mapping, React desktop business config, dirty state, version history, connector section plus confirm modal, collapsed nav and 320px mobile screenshots/metrics under `/tmp/uzmax-m7-ui-76-config-source-parity-refresh/`.
- Metrics include `shellLevel=tenant`, `activePageId=tenant.config`, tenant nav categories present, group nav labels absent, outer nav width `232/68`, topbar height `52-53`, internal nav width `236`, internal nav count `8`, section labels, config main padding/side width, business grid max width about `640`, runtime note hidden/not dominant, and mobile body/document width <= `320`.
- Focused Playwright covers source parity basics, all 8 sections, dirty/save/history/rollback local boundary, channel/connector local boundary, forced states, collapsed nav and mobile fallback.
- Existing config page regression spec still passes after stale assertion repair.
- Source corrections stay small and limited to `apps/admin/src/pages/config/**`.
- No disallowed files are changed.

## Validation Plan

- `git diff --check`
- `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-75-team-source-parity-refresh --spec docs/specs/M7-UI-76-config-source-parity-refresh.md --include-worktree`
- Focused Playwright: `apps/admin/tests/m7-ui-config-source-parity.spec.ts` and `apps/admin/tests/m7-ui-config-page.spec.ts`
- Touched admin ESLint:
  - `node node_modules/eslint/bin/eslint.js apps/admin/src/pages/config/ConfigPage.tsx apps/admin/src/pages/config/configFallback.ts apps/admin/tests/m7-ui-config-source-parity.spec.ts apps/admin/tests/m7-ui-config-page.spec.ts`
- Admin build:
  - `node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir`
- `git merge-tree --write-tree origin/codex/m7-ui-75-team-source-parity-refresh HEAD`

## Failure Branches

- If owner HTML cannot be captured in browser, record the failure/degraded capture in evidence and rely on unpacked source mapping plus React browser screenshots.
- If Playwright cannot start because dependencies are unavailable after cleanup, record exact dependency failure and do not fake evidence.
- If source geometry requires shared shell/router/PageOutlet/registry/API/DB edits, stop and report the dependency instead of editing forbidden files.

## Not Doing

- No shared shell/topbar/sidebar/router/PageOutlet/registry/API/DB/schema/migration/generated/package/lock/global config/CI guard changes.
- No raw prototype fixture import.
- No real config persistence, audit write, connector runtime switch, connector test, order import runtime, eval-gated publish, production authz integration, runtime close, owner visual acceptance, merge closure, GA-0, production readiness or 1.0 release approval.
- No real customer, order, Telegram, address, phone or production data.
