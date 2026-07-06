# M7-UI-93 Connection Center Default Visual Parity Refresh

## Goal

Refresh the default visible `group.connections` / `连接中心` page on top of `codex/m7-ui-92-tenant-management-default-visual-parity-refresh` so the default body, header, runtime/source note, local toggle/test feedback, forced URL states and mobile fallback read like a real group-level operations page instead of a fixture/runtime explanation surface.

This is default visual parity only. It preserves the M7-UI-72 source-shaped connector rows and does not implement connector DB/API/runtime, production connector mutation, real Telegram/order/import tests, feature-flag persistence, audit writes, owner visual acceptance, GA/1.0, production deployment, real customer/order data, customer LLM, Telegram Business automatic reply or release approval.

Default visible `group.connections` body, header, subtitle, runtime/source note, toast, toggle/test feedback, forced URL states and mobile body must not contain `degraded`, `mock`, `read-only`, `browser-local only`, `synthetic health`, `synthetic test finished`, `no production connector change`, `no real connection test`, `no audit write`, `Synthetic`, `mock enabled` or `mock disabled`. Runtime/write/test/audit boundaries must remain available in hidden DOM, `data-runtime-boundary`, `title`, `aria-description` and focused Playwright metrics.

## Owner Confirmation Points And AI Agent Responsibility

Owner/coordinator:

- Confirm this is a default visual parity refresh only, not connector runtime or release closure.
- Confirm `group.connections` remains GROUP layer only: `/design` opens group shell, active page `group.connections`, no `data-tenant-id`, group categories only, and tenant nav does not mix into group nav.
- Keep final owner visual acceptance, production/staging, real customer/order data, LLM key, cost, compliance, GA/1.0 and release decisions owner-only.
- Decide any future connector DB/API/runtime, feature flags, real tests, audit writes or production connector changes through separate approved specs.

AI agent:

- Work only in `/Users/atilla/.codex/worktrees/m7-ui-93-connection-center-default-visual-parity-refresh` on branch `codex/m7-ui-93-connection-center-default-visual-parity-refresh`.
- Keep `/Users/atilla/Applications/UZMAX智能运营` root/main read-only.
- Read `AGENTS.md`, Impeccable context/product register/clarify guidance, M7-UI-51/72 connection-center spec/evidence, M7-UI-91/92 default-refresh pattern, current connection-center source/tests/evidence, owner HTML and unpacked connection-center source before edits.
- Modify only the allowed connection-center page/test/doc paths.
- Preserve group shell, active page `group.connections`, no `data-tenant-id`, group-only nav, owner/source-shaped connector rows, local toggle/test interactions, loading/empty/error/permission/degraded URL states, collapsed sidebar and mobile 320 fallback.

## Timebox

0.5 workday. If API client, backend/API, DB, package/lock, shared shell/topbar/sidebar/router/PageOutlet/registry, global config, CI, production/staging, real connector runtime, feature-flag persistence, production connector mutation, real Telegram/order/import tests or audit writes are required, stop and report `BLOCKED`.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `apps/admin/src/pages/group/GroupConnectionPage.tsx`
  - `apps/admin/src/pages/group/GroupConnectionViews.tsx`
  - `apps/admin/src/pages/group/groupConnectionFallback.ts`
  - `apps/admin/tests/m7-ui-connection-center.spec.ts`
  - `apps/admin/tests/m7-ui-connection-center-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-connection-center-default-visual-parity.spec.ts`
  - `docs/specs/M7-UI-93-connection-center-default-visual-parity-refresh.md`
  - `docs/evidence/M7/M7-UI-93-connection-center-default-visual-parity-refresh.md`
  - `docs/evidence/M7/README.md`
  - `docs/admin-ui-page-migration-ledger.md`
- Unlisted modules are out of scope.

## Change Budget And Path Classification

- source changed files: <= 3
- source net LOC: <= 180
- new source files: 0
- test files changed/added: <= 3
- docs changed/added: <= 4
- package/lock/generated/config/backend/API/DB/worker/cron/CI/global config/shared shell/sidebar/topbar/router/PageOutlet/registry/API: 0
- external API/SDK/provider/connector/adapter basis: none; local browser evidence only.
- exceptions: none.

```yaml
source:
  - apps/admin/src/pages/group/GroupConnectionPage.tsx
  - apps/admin/src/pages/group/GroupConnectionViews.tsx
  - apps/admin/src/pages/group/groupConnectionFallback.ts
test:
  - apps/admin/tests/m7-ui-connection-center.spec.ts
  - apps/admin/tests/m7-ui-connection-center-source-parity.spec.ts
  - apps/admin/tests/m7-ui-connection-center-default-visual-parity.spec.ts
docs:
  - docs/specs/M7-UI-93-connection-center-default-visual-parity-refresh.md
  - docs/evidence/M7/M7-UI-93-connection-center-default-visual-parity-refresh.md
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
- Impeccable project context, product register and clarify guidance
- `docs/admin-design-system.md`
- `docs/specs/M7-UI-51-connection-center-page.md`
- `docs/specs/M7-UI-72-connection-center-source-parity-refresh.md`
- `docs/specs/M7-UI-91-logs-default-visual-parity-refresh.md`
- `docs/specs/M7-UI-92-tenant-management-default-visual-parity-refresh.md`
- `docs/evidence/M7/M7-UI-51-connection-center-page.md`
- `docs/evidence/M7/M7-UI-72-connection-center-source-parity-refresh.md`
- `docs/evidence/M7/M7-UI-92-tenant-management-default-visual-parity-refresh.md`
- `docs/evidence/M7/README.md`
- `docs/admin-ui-page-migration-ledger.md`
- `apps/admin/src/pages/group/GroupConnectionPage.tsx`
- `apps/admin/src/pages/group/GroupConnectionViews.tsx`
- `apps/admin/src/pages/group/groupConnectionFallback.ts`
- `apps/admin/tests/m7-ui-connection-center.spec.ts`
- `apps/admin/tests/m7-ui-connection-center-source-parity.spec.ts`
- `/Users/atilla/Downloads/运营塔台1.0.html`
- `/Users/atilla/源码/unpacked 6/pages/group/GroupConnectionPage.tsx`
- `/Users/atilla/源码/unpacked 6/fixtures/groupPlatform.ts`
- `/Users/atilla/源码/unpacked 6/shell/navigation.ts`
- v1.1 connector/group-layer/mobile fallback and acceptance/release boundaries.

Source mapping:

| Source | Required use |
|---|---|
| Owner HTML | Primary visual/source oracle for `连接中心` and group shell context. |
| Unpacked group connection page | Source anatomy: title `连接中心`, subtitle shape, connector rows, 40px icon blocks, health/ADR badges, description, tenant count, spike classification, recent error, tenant chips, toggle, test action and toast shape. |
| Unpacked `fixtures/groupPlatform.ts` | Field-shape reference for `CONN_HEALTH`, `ConnDef` and `CONN_DEFS`; React keeps centralized synthetic fallback data and `SYN-CONN-*` refs. |
| Unpacked `navigation.ts` | Group-only category and `g_conn` shell mapping reference. |
| M7-UI-72 connection source refresh | Preserve source-shaped connector values and mobile overflow fix while moving visible engineering/runtime labels into hidden/data/title/ARIA evidence. |
| M7-UI-91/92 default refreshes | Test/evidence pattern for clean visible default body with hidden/data/title/ARIA runtime boundaries. |
| Existing React connection page | Preserve page-local fallback, focused test ids and local interactions; move engineering/runtime caveats out of default visible body and feedback into hidden/data/title/ARIA evidence. |

`rg` conclusions:

- `rg -n "degraded|mock|read-only|browser-local only|synthetic health|synthetic test finished|no production connector change|no real connection test|no audit write|Synthetic|mock enabled|mock disabled" apps/admin/src/pages/group apps/admin/tests/m7-ui-connection-center*.spec.ts` found visible leaks in header descriptor, subtitle, runtime note, forced state copy, toggle accessible label, toggle/test toasts and stale focused tests.
- `rg --files apps/admin/src/pages/group apps/admin/tests docs/specs docs/evidence/M7 | rg 'GroupConnection|groupConnection|connection-center|M7-UI-93|admin-ui-page-migration-ledger|M7/README'` found the existing page-local connection implementation and focused tests; this slice extends them in place and adds one focused default visual parity test.
- `rg -n "连接中心|Telegram Bot|Telegram Business|订单 API|导入兜底|测试连接|接入定级|最近错误" /Users/atilla/Downloads/运营塔台1.0.html "/Users/atilla/源码/unpacked 6/pages/group/GroupConnectionPage.tsx" "/Users/atilla/源码/unpacked 6/fixtures/groupPlatform.ts" "/Users/atilla/源码/unpacked 6/shell/navigation.ts"` confirmed the owner/source mapping to preserve.

## Worktree / Branch Preconditions

| Fact | Evidence |
|---|---|
| worker `pwd` | `/Users/atilla/.codex/worktrees/m7-ui-93-connection-center-default-visual-parity-refresh` |
| worker `git status --short --branch` | `## codex/m7-ui-93-connection-center-default-visual-parity-refresh` |
| worker `git branch --show-current` | `codex/m7-ui-93-connection-center-default-visual-parity-refresh` |
| worker `git rev-parse HEAD` | `4d202c2404d3a7c0fea041514fefaf91b4c1c2eb` |
| base | `codex/m7-ui-92-tenant-management-default-visual-parity-refresh` |
| forbidden checkout | `/Users/atilla/Applications/UZMAX智能运营` for writes |

## Functional Contract

- Default `group.connections` visible body, header badge, subtitle, runtime/source note, toggle/test feedback and URL states use business-readable Chinese operations copy.
- Hidden/data/title/ARIA evidence retains `degraded`, `mock`, `read-only`, `browser-local only`, `synthetic health`, `no production connector change`, `no real connection test` and `no audit write`.
- Page root exposes `data-runtime-boundary`; hidden runtime note exposes the same boundary; toasts, forced states, toggles and test buttons expose boundary metadata.
- Connector rows remain centralized synthetic fallback data, source-shaped from M7-UI-72 and owner/unpacked source.
- Toggle remains page-local state only and does not persist feature flags or production connector state.
- Test action remains page-local feedback only and does not run Telegram/order/import connection tests or write audit.
- The default group layer remains unchanged: `/design` opens group layer and `连接中心` maps to `group.connections`.

## Design Skill Layer

Adopted Impeccable/product-register/clarify guidance: restrained product UI, dense operational connector copy, owner/source-like row vocabulary, hidden-but-present runtime boundaries, familiar status/action controls and mobile no-overflow fallback.

Rejected: visible engineering labels in default body/feedback/accessibility labels, old shell visual vocabulary, old `--uzmax-*` as visual source, broad redesign, production-looking connector runtime, real connector tests, audit writes and owner-acceptance/runtime/release claims.

## Pass Conditions

- Default `group.connections` visible body contains no forbidden engineering terms.
- Toggle/test visible feedback and accessible names contain no forbidden engineering terms.
- Forced URL states show business-readable loading/empty/error/permission copy while hidden/data/title/ARIA evidence still contains runtime/write/test/audit boundary labels.
- Existing connection-center interaction coverage and source-parity coverage pass after updated boundary expectations.
- Focused default visual parity Playwright covers clean default body, local toggle/test feedback with clean visible copy, forced states, group/tenant nav separation, collapsed nav and mobile 320 body plus hidden boundary metrics.
- `git diff --check`, direct `pr-shape`, touched Prettier/ESLint, admin build and focused Playwright pass or failures are recorded honestly.

## Non-Goals

- No API client, backend/API, DB, package/lock, shared shell/topbar/sidebar/router/PageOutlet/registry or global config changes.
- No connector DB/API/runtime, production connector mutation, feature-flag persistence, real Telegram Bot/Business/order/import connection test or audit write.
- No real eval gate, LLM/provider call, production prompt/model/persona change or production audit write.
- No real customer, order, Telegram, address, phone or production data.
- No owner visual acceptance, M7 closeout, merge closure, GA-0, production readiness or 1.0 release approval.
