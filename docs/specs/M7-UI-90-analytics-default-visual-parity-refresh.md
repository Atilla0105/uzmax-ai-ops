# M7-UI-90 Analytics Default Visual Parity Refresh

## Goal

Refresh the default `tenant.analytics` / `分析` fallback on top of `codex/m7-ui-89-config-default-visual-parity-refresh` so the default visible body and triggered feedback read like an operational analytics page instead of an engineering/runtime note surface.

This is default visual parity only. It does not implement analytics DB/API/runtime, production metrics, export jobs, export file writes, audit writes, owner visual acceptance, GA/1.0, production deployment, real customer/order data or release approval.

Default visible `tenant.analytics` body, dimension limit feedback, export feedback, forced URL states and mobile body must not contain `degraded`, `mock`, `browser-local only`, `no production analytics metrics`, `no export file write`, `no analytics runtime`, `no audit write`, `local-only` or `Synthetic`. Runtime/write boundaries must remain available in hidden DOM, `data-runtime-boundary`, `title`, `aria-description` and focused Playwright metrics.

## Owner Confirmation Points And AI Agent Responsibility

Owner/coordinator:

- Confirm this is a default visual parity refresh only, not analytics runtime or release closure.
- Confirm `tenant.analytics` remains TENANT layer only after selecting a tenant from `/design`.
- Keep final owner visual acceptance, production/staging, real customer/order data, LLM key, cost, compliance, GA/1.0 and release decisions owner-only.
- Decide any future analytics DB/API/runtime/export/audit work through separate approved specs.

AI agent:

- Work only in `/Users/atilla/.codex/worktrees/m7-ui-90-analytics-default-visual-parity-refresh` on branch `codex/m7-ui-90-analytics-default-visual-parity-refresh`.
- Keep `/Users/atilla/Applications/UZMAX智能运营` root/main read-only.
- Read `AGENTS.md`, Impeccable context/product register, current analytics source/tests/evidence, owner HTML and unpacked analytics page/fixtures before edits.
- Modify only the allowed analytics page/test/doc paths.
- Preserve time range controls, KPI grid, dimension menu/chips/table, handoff/top issues panels, export action, loading/empty/error/permission/degraded URL states, collapsed sidebar and mobile 320 fallback.

## Timebox

0.5 workday. If API client, backend/API, DB, package/lock, shared shell/topbar/sidebar/router/PageOutlet/registry, global config, CI, production/staging, real analytics runtime, export job, export file write or audit write changes are required, stop and report `BLOCKED`.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `apps/admin/src/pages/analytics/AnalyticsPage.tsx`
  - `apps/admin/src/pages/analytics/analyticsFallback.ts`
  - `apps/admin/tests/m7-ui-analytics-page.spec.ts`
  - `apps/admin/tests/m7-ui-analytics-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-analytics-default-visual-parity.spec.ts`
  - `docs/specs/M7-UI-90-analytics-default-visual-parity-refresh.md`
  - `docs/evidence/M7/M7-UI-90-analytics-default-visual-parity-refresh.md`
  - `docs/evidence/M7/README.md`
  - `docs/admin-ui-page-migration-ledger.md`
- Unlisted modules are out of scope.

## Change Budget And Path Classification

- source changed files: <= 2
- source net LOC: <= 160
- new source files: 0
- test files changed/added: <= 3
- docs changed/added: <= 4
- package/lock/generated/config/backend/API/DB/worker/cron/CI/global config/shared shell/sidebar/topbar/router/PageOutlet/registry: 0
- external API/SDK/provider/connector/adapter basis: none; local browser evidence only.
- exceptions: none.

```yaml
source:
  - apps/admin/src/pages/analytics/AnalyticsPage.tsx
  - apps/admin/src/pages/analytics/analyticsFallback.ts
test:
  - apps/admin/tests/m7-ui-analytics-page.spec.ts
  - apps/admin/tests/m7-ui-analytics-source-parity.spec.ts
  - apps/admin/tests/m7-ui-analytics-default-visual-parity.spec.ts
docs:
  - docs/specs/M7-UI-90-analytics-default-visual-parity-refresh.md
  - docs/evidence/M7/M7-UI-90-analytics-default-visual-parity-refresh.md
  - docs/evidence/M7/README.md
  - docs/admin-ui-page-migration-ledger.md
generated: []
lock: []
config: []
```

## Required Reads And Source Mapping

Required reads before edits:

- `AGENTS.md`
- `PRODUCT.md`
- `DESIGN.md`
- Impeccable project context and product register
- `docs/admin-design-system.md`
- `docs/specs/M7-UI-55-analytics-page.md`
- `docs/specs/M7-UI-77-analytics-source-parity-refresh.md`
- `docs/specs/M7-UI-89-config-default-visual-parity-refresh.md`
- `docs/evidence/M7/M7-UI-77-analytics-source-parity-refresh.md`
- `docs/evidence/M7/M7-UI-89-config-default-visual-parity-refresh.md`
- `docs/evidence/M7/README.md`
- `docs/admin-ui-page-migration-ledger.md`
- `apps/admin/src/pages/analytics/AnalyticsPage.tsx`
- `apps/admin/src/pages/analytics/analyticsFallback.ts`
- `apps/admin/tests/m7-ui-analytics-page.spec.ts`
- `apps/admin/tests/m7-ui-analytics-source-parity.spec.ts`
- `apps/admin/tests/m7-ui-config-default-visual-parity.spec.ts`
- `/Users/atilla/Downloads/运营塔台1.0.html`
- `/Users/atilla/源码/unpacked 6/pages/analytics/AnalyticsPage.tsx`
- `/Users/atilla/源码/unpacked 6/fixtures/analytics.ts`

Source mapping:

| Source | Required use |
|---|---|
| Owner HTML | Browser/source oracle for the `分析` surface and shell context. |
| Unpacked analytics page | Source anatomy: header, range controls, add-dimension menu, export control, KPI grid, handoff panel, Top issues, dimension chips and analysis table. |
| Unpacked `fixtures/analytics.ts` | Wording and field-shape reference for analytics ranges, KPI labels, dimensions, handoff reasons and issue labels; do not treat as production data. |
| M7-UI-77 analytics source refresh | Preserve source-parity geometry, source dimension definitions and hidden runtime evidence while cleaning default visible copy. |
| M7-UI-87/88/89 default refreshes | Test and evidence pattern for clean visible default body with hidden/data/title/ARIA runtime boundaries. |
| Existing React analytics page | Preserve page-local fallback, focused test ids and local interactions; move engineering/runtime caveats out of default visible body into hidden/data/title/ARIA evidence. |

`rg` conclusions:

- `rg -n "degraded|mock|browser-local only|no production analytics metrics|no export file write|no analytics runtime|no audit write|local-only|Synthetic" apps/admin/src/pages/analytics apps/admin/tests/m7-ui-analytics*.spec.ts` found visible leaks in toast copy, forced state copy and stale tests.
- `rg --files apps/admin/src/pages/analytics apps/admin/tests docs/specs docs/evidence/M7 | rg 'analytics|M7-UI-90|M7-UI-77|M7-UI-89'` found the existing page-local analytics implementation and focused tests; this slice extends them in place and adds one focused default visual parity test.
- `rg -n "分析|添加维度|导出|转人工原因分布|Top 问题|分析表|订单状态" /Users/atilla/源码/unpacked\ 6/pages/analytics/AnalyticsPage.tsx /Users/atilla/源码/unpacked\ 6/fixtures/analytics.ts` confirmed the owner/source-like labels and anatomy to preserve.

## Worktree / Branch Preconditions

| Fact | Evidence |
|---|---|
| worker `pwd` | `/Users/atilla/.codex/worktrees/m7-ui-90-analytics-default-visual-parity-refresh` |
| worker `git status --short --branch` | `## codex/m7-ui-90-analytics-default-visual-parity-refresh` |
| worker `git branch --show-current` | `codex/m7-ui-90-analytics-default-visual-parity-refresh` |
| base | `codex/m7-ui-89-config-default-visual-parity-refresh` |
| forbidden checkout | `/Users/atilla/Applications/UZMAX智能运营` for writes |

## Functional Contract

- Default `tenant.analytics` visible body, dimension-limit toast, export toast and URL states use business Chinese operations copy.
- Hidden/data/title/ARIA evidence retains `degraded`, `mock`, `browser-local only`, `no production analytics metrics`, `no export file write`, `no analytics runtime` and `no audit write`.
- Page root exposes `data-runtime-boundary`; hidden runtime note exposes the same boundary; toast and forced state surfaces expose boundary metadata.
- Dimension add/remove remains page-local fallback, capped at two active dimensions.
- Export remains page-local feedback only and does not imply a real export job, file write or audit write.
- The default group layer and tenant entry boundary remain unchanged: `/design` opens group layer, tenant selection enters tenant layer, and `分析` maps to `tenant.analytics`.

## Design Skill Layer

Adopted Impeccable/product-register guidance: restrained product UI, dense operational analytics copy, owner/source-like analytics workflow vocabulary, hidden-but-present runtime boundaries, familiar status/action controls and mobile no-overflow fallback.

Rejected: visible engineering labels in default body, old shell visual vocabulary, old `--uzmax-*` as visual source, broad redesign, production-looking analytics metrics, real export/audit claims and owner-acceptance/runtime/release claims.

## Pass Conditions

- Default `tenant.analytics` visible body contains no forbidden engineering terms.
- Hidden DOM/data/title/ARIA evidence still contains runtime/write boundary labels.
- Existing analytics interaction coverage and source-parity coverage pass after updated boundary expectations.
- Focused default visual parity Playwright covers clean default body, dimension limit/export interactions with clean visible copy, forced states, collapsed nav and mobile 320 body plus hidden boundary metrics.
- `git diff --check`, direct `pr-shape`, touched Prettier/ESLint if practical, admin build and focused Playwright pass or failures are recorded honestly.

## Non-Goals

- No API client, backend/API, DB, package/lock, shared shell/topbar/sidebar/router/PageOutlet/registry or global config changes.
- No real analytics persistence, production metric sourcing, export job, export file write, audit write, production authz integration, runtime close, owner visual acceptance, merge closure, GA-0, production readiness or 1.0 release approval.
- No broad redesign, raw production fixture import or real customer/order/Telegram/address/phone/production data.
