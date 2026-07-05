# M7-UI-85 Customer Assets Default Visual Parity Refresh

## 目标

Refresh the `tenant.customers` / 客户资产 default degraded fallback so the visible customer-assets body uses owner/source-like operations copy and no longer exposes engineering/runtime labels in the main visual surface.

This slice keeps the customer-assets page UI-only and downgraded. It does not implement customer DB/API/runtime, does not write customer data and does not claim owner visual acceptance, runtime closure, GA/1.0, production deployment, real customer/order-data use, customer LLM, Telegram Business automatic reply or release approval.

Visible default UI must not contain `mock/degraded`, `mock`, `read-only`, `runtime unavailable`, `not production`, `synthetic`, `local-only`, `browser-local only`, `no production`, `disabled` or `MOCK-`. Those boundaries must remain in hidden DOM, `data-runtime-boundary`, `title`/ARIA attributes and Playwright metrics.

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner/coordinator:

- Confirm this is a default visual parity refresh only, not runtime/DB/API/customer-data closure.
- Keep final owner visual acceptance, production/staging, real customer/order data, LLM key, cost, compliance, release and GA/1.0 decisions owner-only.
- Decide future customer runtime/API work through separate approved specs.

AI agent:

- Work only in `/Users/atilla/.codex/worktrees/m7-ui-85-customer-assets-default-visual-parity-refresh` on branch `codex/m7-ui-85-customer-assets-default-visual-parity-refresh`.
- Keep `/Users/atilla/Applications/UZMAX智能运营` root/main read-only.
- Read AGENTS, M7-UI-30, M7-UI-65, M7-UI-65 evidence, current customer files/tests and owner customer-assets source before edits.
- Modify only the allowed customer page/test/doc paths.
- Preserve tenant-only nav, search/filter, row click/detail, tag add/remove, field edit, restore blocked/unreachable, non-list tabs, tenant switch reset, collapsed sidebar and 320px no-overflow.

## 时间盒

0.5 workday. If API client, backend/API, DB, packages, lockfile, shared shell/topbar/sidebar/router/PageOutlet/registry, global config, CI or release changes are required, stop and report `BLOCKED`.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `apps/admin/src/pages/customers/CustomersPage.tsx`
  - `apps/admin/src/pages/customers/CustomerHtml.ts`
  - `apps/admin/src/pages/customers/customerFallback.ts`
  - `apps/admin/src/pages/customers/customerFallback.json`
  - `apps/admin/tests/m7-ui-customer-assets.spec.ts`
  - `apps/admin/tests/m7-ui-customer-assets-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-customer-assets-default-visual-parity.spec.ts`
  - `docs/specs/M7-UI-85-customer-assets-default-visual-parity-refresh.md`
  - `docs/evidence/M7/M7-UI-85-customer-assets-default-visual-parity-refresh.md`
  - `docs/evidence/M7/README.md`
  - `docs/admin-ui-page-migration-ledger.md`
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source changed files: <= 4
- source net LOC: <= 180
- new source files: 0
- test files changed/added: <= 3
- docs changed/added: <= 4
- package/lock/generated/config/backend/API/DB/worker/cron/CI/global config/shared shell/sidebar/topbar/router/PageOutlet/registry: 0
- external API/SDK/provider/connector/adapter basis: none; local browser evidence only.
- exceptions: none.

## 前置读取与 source mapping

Required reads completed before edits:

- `AGENTS.md`
- `docs/specs/M7-UI-30-customer-assets-page.md`
- `docs/specs/M7-UI-65-customer-assets-source-parity-refresh.md`
- `docs/evidence/M7/M7-UI-65-customer-assets-source-parity-refresh.md`
- `docs/admin-design-system.md`
- `docs/evidence/M7/README.md`
- `docs/admin-ui-page-migration-ledger.md`
- `apps/admin/src/pages/customers/CustomersPage.tsx`
- `apps/admin/src/pages/customers/CustomerHtml.ts`
- `apps/admin/src/pages/customers/customerFallback.ts`
- `apps/admin/src/pages/customers/customerFallback.json`
- `apps/admin/tests/m7-ui-customer-assets.spec.ts`
- `apps/admin/tests/m7-ui-customer-assets-source-parity.spec.ts`
- `/Users/atilla/Downloads/运营塔台1.0.html`
- `/Users/atilla/源码/unpacked 6/pages/customers/CustomersPage.tsx`
- `/Users/atilla/源码/unpacked 6/pages/customers/CustomerListTab.tsx`
- `/Users/atilla/源码/unpacked 6/pages/customers/CustomerDetail.tsx`
- `/Users/atilla/源码/unpacked 6/pages/customers/ConvSearchTab.tsx`
- `/Users/atilla/源码/unpacked 6/pages/customers/TagFieldTabs.tsx`
- `/Users/atilla/源码/unpacked 6/pages/customers/TagFieldEditorModal.tsx`
- `/Users/atilla/源码/unpacked 6/hooks/useCustomers.ts`
- `/Users/atilla/源码/unpacked 6/fixtures/customers.ts`
- Impeccable project context and product register.

Source mapping:

| Source | Required use |
|---|---|
| Owner customer-assets page source | Header/search/export action, five tabs, dense customer list, detail identity/actions, side tags/fields, conversation search and tag/field management vocabulary. |
| Owner hook/fixtures | State-machine shape and field labels only. Do not copy raw personal identifiers, phones, handles, order ids or production-like customer data. |
| Owner HTML | Browser/source oracle for customer-assets labels and layout vocabulary. |
| Existing M7 customer page | Keep page-local fallback, tenant-only routing and local interactions; move engineering boundary from visible copy into hidden/data evidence. |

`rg` conclusions:

- `rg -n "mock|degraded|read-only|runtime unavailable|not production|synthetic|local-only|browser-local|no production|disabled|MOCK-" apps/admin/src/pages/customers apps/admin/tests/m7-ui-customer-assets*.spec.ts` found visible leaks in runtime note, list count, fallback values, detail identity, restore/merge/delete labels, notes, placeholders, non-list tabs and tests.
- `rg --files apps/admin/src/pages/customers apps/admin/tests | rg 'customers|customer-assets'` found the existing page-local customer implementation and focused customer tests; this slice extends them in place and adds one focused default visual parity test.
- `rg -n "客户资产|客户列表|会话搜索|客户标签|会话标签|自定义字段|归并|匿名化|解除拉黑" /Users/atilla/源码/unpacked\ 6/...` confirmed the owner/source-like labels to preserve.

## Worktree / branch 前置条件

| Fact | Evidence |
|---|---|
| worker `pwd` | `/Users/atilla/.codex/worktrees/m7-ui-85-customer-assets-default-visual-parity-refresh` |
| worker `git status --short --branch` | `## codex/m7-ui-85-customer-assets-default-visual-parity-refresh` |
| worker `git branch --show-current` | `codex/m7-ui-85-customer-assets-default-visual-parity-refresh` |
| entry HEAD | `9ffcfd8` |
| base | `origin/codex/m7-ui-84-orders-default-visual-parity-refresh` / current #226 stack top at entry |
| forbidden checkout | `/Users/atilla/Applications/UZMAX智能运营` for writes |

## Functional Contract

- Default `tenant.customers` visible list, detail, tags tab, fields tab, conversation-search tab, restore/merge/delete/action labels use business Chinese labels only.
- Hidden/data evidence retains `mock/degraded`, `mock`, `read-only`, `customer assets runtime unavailable`, `no production customer data`, `no runtime write` and `no DB/API closure`.
- Page root exposes `data-runtime-boundary`; hidden runtime note exposes the same boundary; disabled/destructive/local-only controls expose `data-runtime-boundary`/title/ARIA.
- Disabled fallback affordances show labels such as `归并身份` and `匿名化删除`, not engineering labels.
- `data-testid` compatibility stays intact for existing focused customer tests.

## Design Skill Layer

Adopted Impeccable/product-register guidance: dense operational layout, source-like customer list/detail vocabulary, familiar disabled controls, hidden-but-present runtime boundaries and mobile fallback. No design suggestions were rejected except where governance requires hidden runtime caveats instead of visible engineering labels.

## 通过条件

- Default `tenant.customers` visible body contains no forbidden engineering terms.
- Hidden DOM/data/title/ARIA evidence still contains runtime boundary labels.
- Existing customer interaction coverage and source-parity coverage pass after updated boundary expectations.
- Focused default visual parity Playwright covers list, detail, non-list tabs, local restore/tag/field interactions, hidden boundary and 320px no-overflow.
- `git diff --check`, `pr-shape`, touched Prettier, touched ESLint, admin build and focused Playwright pass or failures are recorded honestly.

## 不做什么

- No API client, backend/API, DB, package/lock, shared shell/topbar/sidebar/router/PageOutlet/registry or global config changes.
- No production/staging action, owner visual acceptance, runtime closure, GA/1.0, real customer/order data, customer LLM, Telegram Business automatic reply or release approval claim.
- No fake writes, no raw prototype fixture copy, no release acceptance changes.
