# M7-UI-84 Orders Default Visual Parity Refresh

## 目标

Refresh the `tenant.orders` / 订单 default degraded fallback so the visible orders body uses owner/source-like operations copy and no longer exposes engineering/runtime caveats in the main visual surface.

This slice keeps the orders page UI-only and downgraded. It does not implement order DB/API/runtime, does not read or parse real CSV/XLSX files, does not call an external order API, does not write order data and does not claim owner visual acceptance, runtime closure, GA/1.0, production deployment or release approval.

Visible default UI must not contain `mock/degraded`, `mock`, `read-only`, `runtime unavailable`, `not production`, `synthetic`, `local-only`, `browser-local only`, `no real read`, `No real`, `DB`, `API`, `no write` or `order runtime unavailable`. Those boundaries must remain in hidden DOM, `data-runtime-boundary`, `title`/ARIA attributes and Playwright metrics.

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner/coordinator:

- Confirm this is a default visual parity refresh only, not runtime/DB/API/import closure.
- Keep final owner visual acceptance, production/staging, real customer/order data, LLM key, cost, compliance, release and GA/1.0 decisions owner-only.
- Decide future order runtime/API/import work through separate approved specs.

AI agent:

- Work only in `/Users/atilla/.codex/worktrees/m7-ui-84-orders-default-visual-parity-refresh` on branch `codex/m7-ui-84-orders-default-visual-parity-refresh`.
- Keep `/Users/atilla/Applications/UZMAX智能运营` root/main read-only.
- Read AGENTS, M7-UI-31, M7-UI-66, M7-UI-66 evidence, current orders files/tests and owner orders source before edits.
- Modify only the allowed orders page/test/doc paths.
- Preserve tenant-only nav, search width, table columns, detail timeline, linked affordances, import modal upload/progress/result/history/rollback, tenant switch reset, collapsed sidebar and 320px no-overflow.

## 时间盒

0.5 workday. If API client, backend/API, DB, packages, lockfile, shared shell/topbar/sidebar/router/PageOutlet/registry, global config, CI or release changes are required, stop and report `BLOCKED`.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `apps/admin/src/pages/orders/OrdersPage.tsx`
  - `apps/admin/src/pages/orders/orderFallback.ts`
  - `apps/admin/tests/m7-ui-orders.spec.ts`
  - `apps/admin/tests/m7-ui-orders-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-orders-default-visual-parity.spec.ts`
  - `docs/specs/M7-UI-84-orders-default-visual-parity-refresh.md`
  - `docs/evidence/M7/M7-UI-84-orders-default-visual-parity-refresh.md`
  - `docs/evidence/M7/README.md`
  - `docs/admin-ui-page-migration-ledger.md`
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source changed files: <= 2
- source net LOC: <= 120
- new source files: 0
- test files changed/added: <= 3
- docs changed/added: <= 4
- package/lock/generated/config/backend/API/DB/worker/cron/CI/global config/shared shell/sidebar/topbar/router/PageOutlet/registry: 0
- external API/SDK/provider/connector/adapter basis: none; local browser evidence only.
- exceptions: none.

## 前置读取与 source mapping

Required reads completed before edits:

- `AGENTS.md`
- `docs/specs/M7-UI-31-orders-page.md`
- `docs/specs/M7-UI-66-orders-source-parity-refresh.md`
- `docs/evidence/M7/M7-UI-66-orders-source-parity-refresh.md`
- `apps/admin/src/pages/orders/OrdersPage.tsx`
- `apps/admin/src/pages/orders/orderFallback.ts`
- `apps/admin/tests/m7-ui-orders.spec.ts`
- `apps/admin/tests/m7-ui-orders-source-parity.spec.ts`
- `/Users/atilla/Downloads/运营塔台1.0.html`
- `/Users/atilla/源码/unpacked 6/pages/orders/OrdersPage.tsx`
- `/Users/atilla/源码/unpacked 6/hooks/useOrders.ts`
- `/Users/atilla/源码/unpacked 6/fixtures/orders.ts`
- Impeccable project context and product register.

Source mapping:

| Source | Required use |
|---|---|
| Owner orders page source | Header/search/import action, amber snapshot bar, 8-column list, stale warning, detail timeline, linked panels and import modal flow. |
| Owner hook/fixtures | State-machine shape and field labels only. Do not copy raw customer/order/contact/payment/external IDs. |
| Owner HTML | Browser/source oracle for orders labels and layout vocabulary. |
| Existing M7 orders page | Keep page-local fallback, tenant-only routing, icon roles and local import state; move engineering boundary from visible copy into hidden/data evidence. |

`rg` conclusions:

- `rg -n "mock/degraded|local mock only|synthetic mock|No real CSV|local-only|stale snapshot|not production order data|no real read|order runtime unavailable|DB|API" apps/admin/src/pages/orders apps/admin/tests/m7-ui-orders*.spec.ts` found visible leaks in list count, fallback values, stale warning, linked buttons, modal note, file drop, progress copy, state panels and tests.
- `rg --files apps/admin/src/pages/orders apps/admin/tests | rg 'orders|m7-ui-orders'` found the existing orders page and focused orders tests; this slice extends them in place and adds one focused default visual parity test.
- `rg -n "订单|导入快照|物流节点|关联客户|回滚本次导入|过期提示|点击选择文件|按订单号去重" /Users/atilla/源码/unpacked\ 6/...` confirmed the owner/source-like labels to preserve.

## Worktree / branch 前置条件

| Fact | Evidence |
|---|---|
| worker `pwd` | `/Users/atilla/.codex/worktrees/m7-ui-84-orders-default-visual-parity-refresh` |
| worker `git status --short --branch` | `## codex/m7-ui-84-orders-default-visual-parity-refresh` |
| worker `git branch --show-current` | `codex/m7-ui-84-orders-default-visual-parity-refresh` |
| base | `origin/codex/m7-ui-83-confirmation-queue-default-visual-parity-refresh` |
| forbidden checkout | `/Users/atilla/Applications/UZMAX智能运营` for writes |

## Functional Contract

- Default `tenant.orders` visible list, detail, stale warning, linked affordances, import modal, file selection, progress and result use business Chinese labels only.
- Hidden/data evidence retains `mock/degraded`, `mock`, `read-only`, `order runtime unavailable`, `not production order data`, `no real read`, `no write` and `DB/API`.
- Page root exposes `data-runtime-boundary`; hidden runtime note exposes the same boundary; modal/drop/start/result/rollback/disabled linked controls expose `data-runtime-boundary`/title/ARIA.
- Disabled fallback affordances show labels such as `查看` or `待连接`, not local-only labels.
- `data-testid` compatibility stays intact for existing focused orders tests.

## Design Skill Layer

Adopted Impeccable/product-register guidance: dense operational layout, owner/source-like wording, task-first status hierarchy, familiar disabled controls, hidden-but-present runtime boundaries and mobile fallback. No design suggestions were rejected except where governance requires hidden runtime caveats instead of visible engineering labels.

## 通过条件

- Default `tenant.orders` visible body contains no forbidden engineering terms.
- Hidden DOM/data/title/ARIA evidence still contains runtime boundary labels.
- Existing orders interaction coverage and source-parity coverage pass after updated boundary expectations.
- Focused default visual parity Playwright covers list, stale detail, import upload/progress/result/rollback, hidden boundary and 320px no-overflow.
- `git diff --check`, `pr-shape`, touched Prettier, touched ESLint, admin build and focused Playwright pass or failures are recorded honestly.

## 不做什么

- No API client, backend/API, DB, package/lock, shared shell/topbar/sidebar/router/PageOutlet/registry or global config changes.
- No production/staging action, owner visual acceptance, runtime closure, GA/1.0, real customer/order data, real import/CSV/XLSX parsing or release approval claim.
- No fake writes, no raw prototype fixture copy, no release acceptance changes.
