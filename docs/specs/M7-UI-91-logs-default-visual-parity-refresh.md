# M7-UI-91 Logs Default Visual Parity Refresh

## Goal

Refresh the default `tenant.logs` / `日志` fallback on top of `codex/m7-ui-90-analytics-default-visual-parity-refresh` so the default visible body, triggered operation feedback and accessibility labels read like an operational logs page instead of an engineering/runtime note surface.

This is default visual parity only. It does not implement logs DB/API/runtime, production audit logs, export jobs, export file writes, audit writes, real record navigation, owner visual acceptance, GA/1.0, production deployment, real customer/order data or release approval.

Default visible `tenant.logs` body, detail feedback, search/detail accessible names, forced URL states and mobile body must not contain `degraded`, `mock`, `read-only`, `browser-local only`, `synthetic tenant log rows`, `no production audit/log export`, `no file written`, `no audit/log runtime call`, `no real tenant/action navigation`, `local-only` or `Synthetic`. Runtime/write/navigation boundaries must remain available in hidden DOM, `data-runtime-boundary`, `title`, `aria-description` and focused Playwright metrics.

## Owner Confirmation Points And AI Agent Responsibility

Owner/coordinator:

- Confirm this is a default visual parity refresh only, not logs/audit runtime or release closure.
- Confirm `tenant.logs` remains TENANT layer only after selecting a tenant from `/design`.
- Keep final owner visual acceptance, production/staging, real customer/order data, LLM key, cost, compliance, GA/1.0 and release decisions owner-only.
- Decide any future logs DB/API/runtime/export/audit/record-navigation work through separate approved specs.

AI agent:

- Work only in `/Users/atilla/.codex/worktrees/m7-ui-91-logs-default-visual-parity-refresh` on branch `codex/m7-ui-91-logs-default-visual-parity-refresh`.
- Keep `/Users/atilla/Applications/UZMAX智能运营` root/main read-only.
- Read `AGENTS.md`, Impeccable context/product register, current logs source/tests/evidence, owner HTML and unpacked logs page/fixtures before edits.
- Modify only the allowed logs page/test/doc paths.
- Preserve header/search/tabs, login/online/operation tables, search empty, operation detail action, loading/empty/error/permission/degraded URL states, collapsed sidebar and mobile 320 fallback.

## Timebox

0.5 workday. If API client, backend/API, DB, package/lock, shared shell/topbar/sidebar/router/PageOutlet/registry, global config, CI, production/staging, real logs runtime, export job, export file write, audit write or real record navigation changes are required, stop and report `BLOCKED`.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `apps/admin/src/pages/logs/LogsPage.tsx`
  - `apps/admin/src/pages/logs/logsFallback.ts`
  - `apps/admin/tests/m7-ui-logs-page.spec.ts`
  - `apps/admin/tests/m7-ui-logs-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-logs-default-visual-parity.spec.ts`
  - `docs/specs/M7-UI-91-logs-default-visual-parity-refresh.md`
  - `docs/evidence/M7/M7-UI-91-logs-default-visual-parity-refresh.md`
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
  - apps/admin/src/pages/logs/LogsPage.tsx
  - apps/admin/src/pages/logs/logsFallback.ts
test:
  - apps/admin/tests/m7-ui-logs-page.spec.ts
  - apps/admin/tests/m7-ui-logs-source-parity.spec.ts
  - apps/admin/tests/m7-ui-logs-default-visual-parity.spec.ts
docs:
  - docs/specs/M7-UI-91-logs-default-visual-parity-refresh.md
  - docs/evidence/M7/M7-UI-91-logs-default-visual-parity-refresh.md
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
- `docs/specs/M7-UI-56-logs-page.md`
- `docs/specs/M7-UI-78-logs-source-parity-refresh.md`
- `docs/specs/M7-UI-90-analytics-default-visual-parity-refresh.md`
- `docs/evidence/M7/M7-UI-78-logs-source-parity-refresh.md`
- `docs/evidence/M7/M7-UI-90-analytics-default-visual-parity-refresh.md`
- `docs/evidence/M7/README.md`
- `docs/admin-ui-page-migration-ledger.md`
- `apps/admin/src/pages/logs/LogsPage.tsx`
- `apps/admin/src/pages/logs/logsFallback.ts`
- `apps/admin/tests/m7-ui-logs-page.spec.ts`
- `apps/admin/tests/m7-ui-logs-source-parity.spec.ts`
- `apps/admin/tests/m7-ui-analytics-default-visual-parity.spec.ts`
- `/Users/atilla/Downloads/运营塔台1.0.html`
- `/Users/atilla/源码/unpacked 6/pages/logs/LogsPage.tsx`
- `/Users/atilla/源码/unpacked 6/fixtures/analytics.ts`

Source mapping:

| Source | Required use |
|---|---|
| Owner HTML | Browser/source oracle for the `日志` surface and shell context. |
| Unpacked logs page | Source anatomy: header title, search placeholder, tabs, default operation tab, table structure and empty state shape. |
| Unpacked `fixtures/analytics.ts` | Wording and field-shape reference for `LOG_TAB_DEFS`, `LOGIN_LOG`, `ONLINE_LOG`, `OP_LOG`, `LOG_COLS` and operation detail-arrow labels; do not treat as production logs. |
| M7-UI-78 logs source refresh | Preserve source-parity geometry, source row values and hidden runtime evidence while cleaning default visible copy. |
| M7-UI-90 analytics default refresh | Test/evidence pattern for clean visible default body with hidden/data/title/ARIA runtime boundaries. |
| Existing React logs page | Preserve page-local fallback, focused test ids and local interactions; move engineering/runtime caveats out of default visible body, triggered feedback and accessible names into hidden/data/title/ARIA evidence. |

`rg` conclusions:

- `rg -n "degraded|mock|read-only|browser-local only|synthetic tenant log rows|no production audit/log export|no file written|no audit/log runtime call|no real tenant/action navigation|local-only|Synthetic" apps/admin/src/pages/logs apps/admin/tests/m7-ui-logs*.spec.ts` found visible leaks in detail toast, forced state copy, search/detail accessible labels and stale focused tests.
- `rg --files apps/admin/src/pages/logs apps/admin/tests docs/specs docs/evidence/M7 | rg 'logs|M7-UI-91|M7-UI-78|M7-UI-90'` found the existing page-local logs implementation and focused tests; this slice extends them in place and adds one focused default visual parity test.

## Worktree / Branch Preconditions

| Fact | Evidence |
|---|---|
| worker `pwd` | `/Users/atilla/.codex/worktrees/m7-ui-91-logs-default-visual-parity-refresh` |
| worker `git status --short --branch` | `## codex/m7-ui-91-logs-default-visual-parity-refresh` |
| worker `git branch --show-current` | `codex/m7-ui-91-logs-default-visual-parity-refresh` |
| base | `codex/m7-ui-90-analytics-default-visual-parity-refresh` |
| forbidden checkout | `/Users/atilla/Applications/UZMAX智能运营` for writes |

## Functional Contract

- Default `tenant.logs` visible body, detail toast, search/detail accessible labels and URL states use business-readable Chinese operations copy.
- Hidden/data/title/ARIA evidence retains `degraded`, `mock`, `read-only`, `browser-local only`, `synthetic tenant log rows`, `no production audit/log export`, `no file written`, `no audit/log runtime call` and `no real tenant/action navigation`.
- Page root exposes `data-runtime-boundary`; hidden runtime note exposes the same boundary; detail buttons, toast and forced state surfaces expose boundary metadata.
- Search remains page-local filtering over source-shaped fallback rows.
- Operation detail remains page-local feedback only and does not imply real production record navigation, trace opening, logs runtime or audit write.
- The default group layer and tenant entry boundary remain unchanged: `/design` opens group layer, tenant selection enters tenant layer, and `日志` maps to `tenant.logs`.

## Design Skill Layer

Adopted Impeccable/product-register guidance: restrained product UI, dense operational logs copy, owner/source-like logs workflow vocabulary, hidden-but-present runtime boundaries, familiar status/action controls and mobile no-overflow fallback.

Rejected: visible engineering labels in default body/feedback/accessibility labels, old shell visual vocabulary, old `--uzmax-*` as visual source, broad redesign, production-looking audit logs, real export/audit/navigation claims and owner-acceptance/runtime/release claims.

## Pass Conditions

- Default `tenant.logs` visible body contains no forbidden engineering terms.
- Search/detail visible feedback and accessible names contain no forbidden engineering terms.
- Forced URL states show business-readable loading/empty/error/permission copy while hidden/data/title/ARIA evidence still contains runtime/write/navigation boundary labels.
- Existing logs interaction coverage and source-parity coverage pass after updated boundary expectations.
- Focused default visual parity Playwright covers clean default body, search/detail interactions with clean visible copy, forced states, collapsed nav and mobile 320 body plus hidden boundary metrics.
- `git diff --check`, direct `pr-shape`, touched Prettier/ESLint if practical, admin build and focused Playwright pass or failures are recorded honestly.

## Non-Goals

- No API client, backend/API, DB, package/lock, shared shell/topbar/sidebar/router/PageOutlet/registry or global config changes.
- No real logs persistence, production audit log sourcing, export job, export file write, audit write, production authz integration, real record navigation, trace closure, runtime close, owner visual acceptance, merge closure, GA-0, production readiness or 1.0 release approval.
- No broad redesign, raw production fixture import or real customer/order/Telegram/address/phone/production data.
