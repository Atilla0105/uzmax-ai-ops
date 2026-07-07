# M7-UI-30 Customer Assets Page

## 目标

Implement the visible UI-first `tenant.customers` / 客户资产 page in `apps/admin`, stacked on `origin/codex/m7-ui-21-ticket-page-visible-ui`.

This slice renders real visible customer-assets UI using centralized sanitized synthetic degraded/mock fallback state. It does not implement customer DB/API/runtime, does not import raw prototype fixtures, does not render real customer names, handles, phones, order ids or production-looking metrics, and does not claim owner visual acceptance, runtime closure, GA-0, production deployment, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release approval.

Owner HTML `/Users/atilla/Downloads/运营塔台1.0.html` and frozen source `/Users/atilla/源码/unpacked 6` are the visible UI baseline. Existing M4 customer asset evidence and old shell visuals remain legacy evidence only.

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner/coordinator:

- Confirm this PR is a UI-first implementation candidate, not runtime closure.
- Confirm this branch remains stacked on PR #196 / `origin/codex/m7-ui-21-ticket-page-visible-ui`.
- Decide later whether customer asset DB/API/runtime contracts proceed through a separate runtime lane; AI agents must not invent runtime truth.
- Keep final scope, production/staging, real customer/order data, customer LLM, LLM key, cost/compliance, GA-0, production and 1.0 release decisions as owner-only.

AI agent:

- Work only in `/Users/atilla/.codex/worktrees/m7-ui-30-customer-assets-visible-ui` on branch `codex/m7-ui-30-customer-assets-visible-ui`.
- Keep `/Users/atilla/Applications/UZMAX智能运营` root/main read-only.
- Read AGENTS, this spec, M7 ledger/evidence, registry/page outlet state, owner HTML, unpacked customer source and current stacked group/conversation/ticket examples before editing source.
- Implement only the visible tenant customer assets page with centralized sanitized synthetic degraded/mock fallback data and focused Playwright coverage.

## 时间盒

0.5 workday. If implementation requires backend/API changes, package/lock updates, raw fixture copying, DB/schema changes, shared shell changes, CI/global config changes, release/production action or edits outside the allowed paths, stop and report `BLOCKED`.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-UI-30-customer-assets-page.md`
  - `docs/evidence/M7/M7-UI-30-customer-assets-page.md`
  - `docs/admin-ui-page-migration-ledger.md`
  - `docs/evidence/M7/README.md`
  - `apps/admin/src/pages/PageOutlet.tsx`
  - `apps/admin/src/pages/registry.ts`
  - `apps/admin/src/pages/customers/CustomerHtml.ts`
  - `apps/admin/src/pages/customers/CustomersPage.tsx`
  - `apps/admin/src/pages/customers/customerFallback.json`
  - `apps/admin/src/pages/customers/customerFallback.ts`
  - `apps/admin/tests/m7-ui-customer-assets.spec.ts`
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source changed files: <= 5
- source net LOC: <= 600
- new source files: <= 3
- test files changed: <= 1 focused Playwright spec
- docs changed: <= 4 evidence/ledger/spec updates
- package/lock/generated/backend/API/DB/worker/cron/CI/global config: 0
- page-local config/data asset: `apps/admin/src/pages/customers/customerFallback.json` only.
- external API/SDK/provider/connector/adapter basis: none; render truthful degraded/read-only mock state only.
- 新增 source 文件前的 `rg` 搜索结论和归属理由：searched `CustomersPage`, `tenant.customers`, `客户资产`, `customerFallback`, `m7-customer` under `apps/admin/src`, `apps/admin/tests`, `docs/specs`, `docs/evidence/M7` and the page ledger. Current branch has only registry/ledger placeholders and legacy M4 customer asset evidence; no M7 tenant customer-assets page exists. New files are page-local under `apps/admin/src/pages/customers/` to match the existing group/conversation/ticket page ownership pattern and avoid a parallel shared runtime.

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
- Current stacked examples: group overview, conversations and tickets page/source/tests/evidence enough to preserve route behavior and mock/degraded evidence style.
- `/Users/atilla/Downloads/运营塔台1.0.html`
- `/Users/atilla/源码/unpacked 6/pages/customers/CustomersPage.tsx`
- `/Users/atilla/源码/unpacked 6/pages/customers/CustomerListTab.tsx`
- `/Users/atilla/源码/unpacked 6/pages/customers/CustomerDetail.tsx`
- `/Users/atilla/源码/unpacked 6/pages/customers/ConvSearchTab.tsx`
- `/Users/atilla/源码/unpacked 6/pages/customers/TagFieldTabs.tsx`
- `/Users/atilla/源码/unpacked 6/pages/customers/TagFieldEditorModal.tsx`
- `/Users/atilla/源码/unpacked 6/fixtures/customers.ts`
- `/Users/atilla/源码/unpacked 6/hooks/useCustomers.ts`
- Impeccable context/product register: dense product UI, status-first hierarchy, complete degraded/mock/read-only labels, desktop control-room primary, mobile fallback only, no legacy-shell visual drift.

Worktree / branch entry evidence:

| Fact | Evidence |
|---|---|
| worker `pwd` | `/Users/atilla/.codex/worktrees/m7-ui-30-customer-assets-visible-ui` |
| worker `git status --short --branch` | `## codex/m7-ui-30-customer-assets-visible-ui...origin/codex/m7-ui-21-ticket-page-visible-ui` |
| worker `git branch --show-current` | `codex/m7-ui-30-customer-assets-visible-ui` |
| worker HEAD | `2c2836ec37f3c6e4be4891b220bff9257b0ee4b5` |
| stacked base | `origin/codex/m7-ui-21-ticket-page-visible-ui` |

## Source Mapping

| Source | Required use |
|---|---|
| `/Users/atilla/Downloads/运营塔台1.0.html` | Hard visual baseline for customer-assets header, tabs, list/detail density and tenant shell relationship. |
| `/Users/atilla/源码/unpacked 6/pages/customers/CustomersPage.tsx` | Header contract: title `客户资产`, detail breadcrumb/back state, 300px-ish list search, export action and underline tabs. |
| `/Users/atilla/源码/unpacked 6/pages/customers/CustomerListTab.tsx` | Customer list anatomy: language/script/stage filters, flag pills, dense table with avatar/badges/language/stage/orders/spend/open issue/tags/recent conversation. |
| `/Users/atilla/源码/unpacked 6/pages/customers/CustomerDetail.tsx` | Detail anatomy: identity strip, profile/stat cards, history, order snapshot, quote records, tickets, dual-track timeline, notes and right column tags/custom fields. |
| `/Users/atilla/源码/unpacked 6/pages/customers/ConvSearchTab.tsx` | Secondary tab anatomy: search/filter toolbar and conversation-search table with jump-back affordance. |
| `/Users/atilla/源码/unpacked 6/pages/customers/TagFieldTabs.tsx` and `TagFieldEditorModal.tsx` | Tag/field management anatomy; this slice may render simplified read-only/local-editing versions without backend persistence. |
| `/Users/atilla/源码/unpacked 6/fixtures/customers.ts` and `hooks/useCustomers.ts` | Field-shape and interaction references only. Production page code must use sanitized centralized synthetic fallback data and visible mock/degraded labels. |
| `docs/admin-design-system.md` | Normalization layer: customer assets page header + tabs + data table/detail, tokenized product UI, mobile readable fallback and honest degraded state. |

## Page Matrix

| Object | Required fields / behavior |
|---|---|
| Header | title `客户资产`; detail state shows back/breadcrumb; list state shows about 300px search and export action; underline tabs. |
| Tabs | 客户列表 / 会话搜索 / 客户标签 / 会话标签 / 自定义字段. |
| Customer list | filter bar, flag pills, dense table, row open into detail. |
| Detail | identity strip, profile/stat cards, history, order snapshot, quote records, tickets, dual-track timeline, notes, right column tags/custom fields. |
| Local interactions | filters/search, tab switching, row open/detail back, add note, add/remove tag, field edit and restore blocked/unreachable are local-only state. |
| State labels | Visible `degraded`, `mock`, `read-only`, `not production customer data`. |
| Mobile fallback | 320px readable; no body overflow; table/detail may scroll structurally where needed. |

## Runtime Contract

Current implementation is local UI only:

- `tenant.customers` renders centralized sanitized synthetic mock/degraded data from `customerFallback.ts`.
- Search/filter/tab/detail/note/tag/field/restore flows mutate only local React state.
- No backend/API/DB/customer runtime is implemented or implied.
- Customer/order snippets are synthetic/prototype-shaped and safe; they are not real customer or order data.

Future runtime must be split into an approved customer-assets API/client/hook spec before this page can render production customer data or claim runtime closure.

## Impeccable / Design Decision Record

- Adopted: dense product layout, tokenized status palette, fixed typography, visible degraded/mock/read-only state, complete interaction states and 320px no-overflow fallback.
- Adapted: owner prototype raw inline styles and raw fixture values are converted into scoped page CSS/classes plus sanitized fallback records.
- Rejected: raw prototype fixture import, real-looking names/handles/phones/order ids, old M4 shell visuals, old `--uzmax-*` visual target and production-looking metrics.

## Evidence / Validation Plan

Implementation must record:

- `npm run guard:prettier-ignore -- --base origin/codex/m7-ui-21-ticket-page-visible-ui`
- `npm run format:check`
- `git diff --check origin/codex/m7-ui-21-ticket-page-visible-ui...HEAD`
- `npm run guard:doc-triggers`
- `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-21-ticket-page-visible-ui --spec docs/specs/M7-UI-30-customer-assets-page.md --include-worktree`
- `npm run knip`
- `npm run lint`
- `npm run typecheck`
- `npm run build:admin`
- focused Playwright for customer route plus required stacked router/group/conversation/ticket specs
- desktop/list/detail/mobile/source screenshots and metrics under `/tmp/uzmax-m7-ui-30-customer-assets-visible-ui/`

## Pass Conditions

- Only allowed files change.
- `tenant.customers` renders a visible page, not scaffold.
- Registry, ledger and M7 README mark this as implementation candidate pending PR review, not merged, owner accepted or runtime closed.
- Focused Playwright covers tenant entry, tenant-only nav, visible degraded/mock/read-only labels, tabs, filters/search, row open/detail/back, local note/tag/field/restore behavior, tenant switching isolation, sidebar collapse, 320px no overflow and no mixed group nav.

## 失败分支

- If visible customer assets UI requires backend/API/DB/runtime truth to avoid misleading operators, stop and report `BLOCKED`; do not fake production data.
- If local validation is blocked by dependency/tooling gaps, record exact commands and blockers in evidence.
- If source comparison screenshots cannot be captured from owner HTML, record the exact caveat and do not claim visual acceptance.

## 不做什么

- No backend/API/DB/schema/migration/generated/package/lock/global config/CI changes.
- No raw prototype fixture import.
- No real customer names, handles, phones, order ids, addresses, payment information or production-like metrics.
- No customer-assets runtime closure, owner visual acceptance, M7 closeout, GA-0, production/staging action, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release approval.
