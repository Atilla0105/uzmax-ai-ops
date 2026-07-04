# M7-UI-31 Orders Page

## 目标

Implement the UI-first visible `tenant.orders` / 订单 page in `apps/admin`, stacked on PR #197 / `origin/codex/m7-ui-30-customer-assets-visible-ui`.

This slice renders real visible browser UI for the tenant orders page using centralized sanitized synthetic mock/degraded/read-only state. It does not implement order DB/API/runtime, does not import raw prototype fixtures, does not read or parse real CSV/XLSX files, does not call an external order API, does not render real customer/order data and does not claim owner visual acceptance, runtime closure, GA-0, production deployment, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release approval.

Owner HTML `/Users/atilla/Downloads/运营塔台1.0.html` and frozen unpacked source `/Users/atilla/源码/unpacked 6/pages/orders/OrdersPage.tsx` are the hard visual/anatomy baseline. Existing M4 order import/status evidence and old shell visuals remain legacy evidence only.

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner/coordinator:

- Confirm this PR is a UI-first visible implementation candidate, not runtime closure.
- Confirm this branch remains stacked on PR #197 / `origin/codex/m7-ui-30-customer-assets-visible-ui`.
- Decide later whether order DB/API/runtime contracts proceed through a separate runtime lane; AI agents must not invent runtime truth.
- Keep final scope, production/staging, real customer/order data, customer LLM, LLM key, cost/compliance, GA-0, production and 1.0 release decisions as owner-only.

AI agent:

- Work only in `/Users/atilla/.codex/worktrees/m7-ui-31-orders-visible-ui` on branch `codex/m7-ui-31-orders-visible-ui`.
- Keep `/Users/atilla/Applications/UZMAX智能运营` root/main read-only.
- Read AGENTS, this spec, M7 ledger/evidence, registry/page outlet state, owner HTML, unpacked orders source and current stacked group/customer/ticket examples before editing source.
- Implement only the visible tenant orders page with centralized sanitized synthetic degraded/mock/read-only fallback data and focused Playwright coverage.

## 时间盒

0.5 workday. If implementation requires backend/API changes, package/lock updates, raw fixture copying, DB/schema changes, shared shell changes, CI/global config changes, release/production action or edits outside the allowed paths, stop and report `BLOCKED`.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-UI-31-orders-page.md`
  - `docs/evidence/M7/M7-UI-31-orders-page.md`
  - `docs/admin-ui-page-migration-ledger.md`
  - `docs/evidence/M7/README.md`
  - `apps/admin/src/pages/PageOutlet.tsx`
  - `apps/admin/src/pages/registry.ts`
  - `apps/admin/src/pages/orders/OrdersPage.tsx`
  - `apps/admin/src/pages/orders/orderFallback.ts`
  - `apps/admin/tests/m7-ui-orders.spec.ts`
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source changed files: <= 5
- source net LOC: <= 600 if possible; report `DONE_WITH_CONCERNS` if exceeded.
- new source files: <= 3
- test files changed: <= 1 focused Playwright spec
- docs changed: <= 4 evidence/ledger/spec updates
- package/lock/generated/backend/API/DB/worker/cron/CI/global config: 0
- external API/SDK/provider/connector/adapter basis: none; render truthful degraded/read-only mock state only.
- 新增 source 文件前的 `rg` 搜索结论和归属理由：searched `tenant.orders`, `OrdersPage`, `订单`, `orderFallback`, `m7-order` under `apps/admin/src`, `apps/admin/tests`, `docs/specs`, `docs/evidence/M7`. Current branch has only registry/ledger placeholders, shell navigation labels, old M4 order-import evidence and cross-page related-order references; no M7 tenant orders page exists. New files are page-local under `apps/admin/src/pages/orders/` to match the existing group/ticket/customer page ownership pattern and avoid a parallel shared runtime.

## 文档触发检查

updated

## 前置条件与读取记录

Required reads completed for this implementation PR:

- `AGENTS.md`
- `docs/admin-design-system.md`
- `docs/admin-ui-page-migration-ledger.md`
- `docs/evidence/M7/README.md`
- `apps/admin/src/pages/registry.ts`
- `apps/admin/src/pages/PageOutlet.tsx`
- Current stacked examples: customer assets, tickets and group overview source/tests enough to preserve page-local degraded/mock pattern and tenant switching isolation style.
- `/Users/atilla/Downloads/运营塔台1.0.html`
- `/Users/atilla/源码/unpacked 6/pages/orders/OrdersPage.tsx`
- `/Users/atilla/源码/unpacked 6/hooks/useOrders.ts`
- `/Users/atilla/源码/unpacked 6/fixtures/orders.ts`
- Impeccable context/product register: dense product UI, status-first hierarchy, complete degraded/mock/read-only labels, desktop control-room primary, mobile fallback only, no legacy-shell visual drift.

Worktree / branch entry evidence:

| Fact | Evidence |
|---|---|
| worker `pwd` | `/Users/atilla/.codex/worktrees/m7-ui-31-orders-visible-ui` |
| worker `git status --short --branch` | `## codex/m7-ui-31-orders-visible-ui...origin/codex/m7-ui-30-customer-assets-visible-ui [ahead 1]` |
| worker `git branch --show-current` | `codex/m7-ui-31-orders-visible-ui` |
| worker HEAD | `da28a8f2445daf159bc6adc392843523de41fe58` |
| stacked base | `origin/codex/m7-ui-30-customer-assets-visible-ui` |

## Source Mapping

| Source | Required use |
|---|---|
| `/Users/atilla/Downloads/运营塔台1.0.html` | Hard visual baseline for owner shell relationship and orders page anatomy where `file://` exposes the region. |
| `/Users/atilla/源码/unpacked 6/pages/orders/OrdersPage.tsx` | Header, list, degraded snapshot bar, detail and import modal anatomy. |
| `/Users/atilla/源码/unpacked 6/hooks/useOrders.ts` | Local UI state-machine reference only: search, detail open, import upload/progress/result/history/rollback. |
| `/Users/atilla/源码/unpacked 6/fixtures/orders.ts` | Field-shape reference only. Production page code must use sanitized centralized synthetic fallback data with ids such as `SYN-ORD-001`; no raw prototype fixture values, phone numbers, Telegram handles or external IDs are copied. |
| `docs/admin-design-system.md` | Normalization layer: tokenized product UI, status-first degraded state, table/detail density, mobile readable fallback and honest runtime boundaries. |

## Page Matrix

| Object | Required fields / behavior |
|---|---|
| Header | title `订单`; detail state shows back/breadcrumb; list state shows 300-340px search and `导入快照` action. |
| Runtime/snapshot bar | Persistent amber/degraded/snapshot bar truthfully states synthetic mock/degraded/read-only state and not production order data. |
| Prototype icon expression | Preserve source Lucide Search, Upload, TriangleAlert, Package and X roles through `IconSlot`/Lucide rendering; no text glyphs or square placeholders for these source icons. |
| Orders table | Dense columns equivalent to order id, customer, amount, status, batch, logistics, source, updated; sanitized ids such as `SYN-ORD-001`. |
| Row open/detail | Click and keyboard activation open detail; detail has stale warning for stale item, header card, logistics timeline and linked customer/conversation/ticket affordances. |
| Linked affordances | Customer, conversation and ticket affordances remain visible but disabled/local-only/degraded and truthful. |
| Import modal | Local-only upload/progress/result/history/rollback flow shaped like source; no real file read, no CSV/XLSX parse, no backend and visible mock/degraded/read-only wording. |
| Required states | loading, empty, error, permission denied, degraded, stale snapshot and mobile fallback must be accessible through deterministic test hooks/query state. |
| Group/tenant separation | `tenant.orders` is tenant-only. `/design` and default app home remain group layer; tenant switch enters tenant layer without exposing group sections. |
| Mobile fallback | 320px readable; no body horizontal overflow; table/detail may scroll in contained regions. |

## Runtime Contract

Current implementation is local UI only:

- `tenant.orders` renders centralized sanitized synthetic mock/degraded/read-only data from `orderFallback.ts`.
- Search, detail, import upload/progress/result/history/rollback and required state controls mutate only local React state.
- No backend/API/DB/order runtime is implemented or implied.
- No runtime import, no real file read, no CSV/XLSX parser, no external order API, no real customer/order data.
- UI copy must distinguish import snapshot as the current mock/degraded path and avoid implying a temporary API outage or production order status.

Future runtime must be split into an approved order API/client/hook spec before this page can render production order data or claim runtime closure.

## Impeccable / Design Decision Record

- Adopted: dense product layout, 16px operational title, 320px list search, tokenized warning/degraded states, visible degraded/mock/read-only state, keyboard-accessible table rows and 320px no-overflow fallback.
- Adapted: owner prototype raw inline styles and raw fixture values are converted into page-local React/CSS plus sanitized fallback records.
- Rejected: raw prototype fixture import, real-looking names/phones/Telegram/order refs, real CSV/XLSX handling, backend/API/DB runtime, old M4 order shell visuals, old `--uzmax-*` visual target and production-looking metrics.

## Evidence / Validation Plan

Implementation must record:

- `git diff --check origin/codex/m7-ui-30-customer-assets-visible-ui...HEAD`
- `npm run guard:doc-triggers`
- `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-30-customer-assets-visible-ui --spec docs/specs/M7-UI-31-orders-page.md --include-worktree`
- `npm run guard:prettier-ignore -- --base origin/codex/m7-ui-30-customer-assets-visible-ui`
- `npm run format:check`
- `npm run knip`
- `npm run jscpd`
- `npm run lint`
- `npm run typecheck`
- focused Playwright orders test and affected admin page router/nav test if necessary
- `npm run build:admin` or repo-equivalent admin build command
- React desktop list/detail/mobile screenshots under `/tmp/uzmax-m7-ui-31-orders-visible-ui/`; screenshots remain transient validation artifacts and are not committed.

Browser evidence must include source HTML/unpacked/React comparison, key geometry assertions, sidebar/topbar/category/collapse tenant-shell checks and mobile readable/no-overflow fallback. If owner HTML under `file://` does not expose all order regions, evidence must record that caveat and verify anatomy against unpacked source.

## Pass Conditions

- Only allowed files change.
- `tenant.orders` renders a visible page, not scaffold.
- Registry, ledger and M7 README mark this as implementation candidate pending PR review, not merged, owner accepted or runtime closed.
- Focused Playwright covers tenant entry, tenant-only nav, visible degraded/mock/read-only/not-production-order-data labels, Lucide icon SVG visibility for source icon roles, header/search/table/list count geometry, row click and keyboard open detail, stale warning/timeline/linked affordances, import local upload/progress/result/history/rollback, required states, tenant switching isolation, sidebar collapse, topbar height/environment/breadcrumb/category tenant-shell checks, 320px no body overflow and no mixed group nav.

## 失败分支

- If visible orders UI requires backend/API/DB/runtime truth to avoid misleading operators, stop and report `BLOCKED`; do not fake production data.
- If local validation is blocked by dependency/tooling gaps, record exact commands and blockers in evidence.
- If source comparison screenshots cannot be captured from owner HTML, record the exact caveat and do not claim visual acceptance.

## 不做什么

- No backend/API/DB/schema/migration/generated/package/lock/global config/CI changes.
- No raw prototype fixture import.
- No real CSV/XLSX file read or parse.
- No external order API, `order_connector` or provider/adapter.
- No real customer names, phones, Telegram handles, order ids, external ids, addresses, payment information or production-like metrics.
- No order runtime closure, owner visual acceptance, M7 closeout, GA-0, production/staging action, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release approval.
