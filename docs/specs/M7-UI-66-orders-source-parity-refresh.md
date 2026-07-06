# M7-UI-66 Orders Source Parity Refresh

## 目标

Refresh the existing visible UI-first `tenant.orders` / 订单 page on top of `origin/codex/m7-ui-31-orders-visible-ui` (current clean visible UI trunk after #252, commit `a2f102cf406585cbe8e0057c77b68e245b31b79b`) so the orders page remains browser-comparable against the owner HTML, frozen unpacked orders source and current tenant shell.

This is a source parity refresh, not a rewrite. Scope is evidence/test/docs only. This slice does not implement order DB/API/runtime, does not read or parse real CSV/XLSX files, does not call an external order API, and does not claim owner visual acceptance, runtime closure, GA-0, production deployment, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release approval.

Owner HTML `/Users/atilla/Downloads/运营塔台1.0.html`, frozen unpacked source `/Users/atilla/源码/unpacked 6`, and `docs/admin-design-system.md` remain the visible UI source set. Order data must stay centralized synthetic `mock/degraded/read-only` fallback and visibly `not production order data`.

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner/coordinator:

- Confirm the current M7 lane remains visible-UI-first while order runtime/API/DB are downgraded.
- Confirm this branch is cleanstacked on `origin/codex/m7-ui-31-orders-visible-ui`, the current clean visible UI trunk after #252.
- Decide later whether order runtime work proceeds through a separate approved spec.
- Keep final production/staging, real customer/order data, LLM key, cost/compliance, GA-0, production and release decisions owner-only.

AI agent:

- Work only in `/Users/atilla/.codex/worktrees/m7-ui-66-orders-source-parity-refresh-cleanstack` on branch `codex/m7-ui-66-orders-source-parity-refresh-cleanstack`.
- Keep `/Users/atilla/Applications/UZMAX智能运营` root/main read-only.
- Read AGENTS, M7-UI-31 spec/evidence, current orders source/tests, owner unpacked orders page/hook/fixtures and owner HTML before edits.
- Record browser evidence comparing owner HTML/source sample, unpacked source mapping and React desktop list/detail/import/collapsed/mobile metrics.
- Preserve tenant-only routing, local-only import state, stale snapshot warning, linked local-only affordances and tenant switch isolation.

## 时间盒

0.5 workday. If the page requires backend/API/DB/packages/package/lock/CI/global config/shared AppShell/topbar/sidebar/registry/PageOutlet/source edits, a broad page rewrite, raw owner fixture import, production data, external API behavior or release action, stop and report `BLOCKED`.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-UI-66-orders-source-parity-refresh.md`
  - `docs/evidence/M7/M7-UI-66-orders-source-parity-refresh.md`
  - `docs/evidence/M7/README.md`
  - `docs/admin-ui-page-migration-ledger.md`
  - `apps/admin/tests/m7-ui-orders-source-parity.spec.ts`
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source changed files: 0
- source net LOC: 0
- new source files: 0
- test files changed/added: <= 1 focused Playwright spec
- docs changed/added: <= 4
- package/lock/generated/config/backend/API/DB/worker/cron/CI/global config/shared shell/sidebar/topbar/registry/PageOutlet/apps/admin/src: 0
- external API/SDK/provider/connector/adapter basis: none; only browser evidence and local UI fallback state are in scope.

## 文档触发检查

updated

## 前置读取与 source mapping

Required reads:

- `AGENTS.md`
- `docs/specs/M7-UI-31-orders-page.md`
- `docs/evidence/M7/M7-UI-31-orders-page.md`
- `docs/admin-design-system.md`
- `docs/admin-ui-page-migration-ledger.md`
- `docs/evidence/M7/README.md`
- `apps/admin/src/pages/orders/OrdersPage.tsx`
- `apps/admin/src/pages/orders/orderFallback.ts`
- `apps/admin/tests/m7-ui-orders.spec.ts`
- `/Users/atilla/源码/unpacked 6/pages/orders/OrdersPage.tsx`
- `/Users/atilla/源码/unpacked 6/hooks/useOrders.ts`
- `/Users/atilla/源码/unpacked 6/fixtures/orders.ts`
- `/Users/atilla/Downloads/运营塔台1.0.html`
- v1.1 product/admin/architecture/acceptance order boundaries: REQ-T04, admin §4.4, architecture §8, acceptance E-01..E-04/I-01.

| Source | Required use |
|---|---|
| Owner HTML | Browser screenshot or DOM sample for orders/source shell terms. The HTML is a bundled executable oracle, not source to copy. |
| Unpacked orders page | Primary structured source for header, 320-ish search, import snapshot action/modal, amber runtime bar, dense 8-column list, detail stale warning, package identity card, timeline and linked panels. |
| Unpacked `useOrders.ts` | Interaction source for search, row selection, upload/progress/result/history/rollback state. |
| Unpacked `fixtures/orders.ts` | Field-shape reference only. React must continue using centralized sanitized synthetic fallback data with visible degraded/mock/read-only labels. |
| v1.1 docs | Product/runtime boundary: order center is tenant-layer read-only; import snapshot is fallback/main path when ADR-B02 has no API; stale data must avoid misleading operators. |

## Required Evidence

- Owner/source screenshot and DOM/text sample for orders-related owner HTML region when the local owner HTML exists; otherwise write `owner-html-orders-source-dom-sample.json` unavailable artifact and continue React assertions.
- Unpacked source mapping summary for orders page/hook/fixtures when local unpacked files exist; otherwise write `unpacked-orders-source-mapping-unavailable.json` unavailable artifact and continue React assertions.
- React desktop list screenshot.
- React detail screenshot.
- React import modal/result screenshot.
- React collapsed-sidebar screenshot.
- React mobile `320px` screenshot.
- Metrics JSON with at least:
  - shell level `tenant`
  - active page `tenant.orders`
  - nav width `232` expanded / `68` collapsed
  - topbar height about `53`
  - list/table/detail/search widths
  - body/document scrollWidth <= viewport desktop/mobile
  - import modal visibility/width
  - runtime labels `mock/degraded/read-only/not production order data`
  - tenant sidebar categories only: `运营/数据/智能/管理/洞察`; group categories absent.

## Impeccable / Design Decision Record

Adopted by default: dense product UI, source-derived orders list/detail/import anatomy, separated tenant layer, restrained runtime caveat, local-only import state, tenant-only sidebar parity and mobile readable/no-overflow fallback.

Rejected: free redesign, old shell visual language, old `--uzmax-*` as visual target, raw prototype fixture imports, production-looking unlabeled order data, backend/API invention, real CSV/XLSX parsing and any owner-acceptance/runtime/release claim.

If Design Skill Layer suggests a visual correction that conflicts with AGENTS, v1.1 docs, data boundary, permissions, release gates or owner source boundaries, record the rejection in evidence instead of implementing it.

## Pass Conditions

- `tenant.orders` renders inside tenant shell after selecting tenant `tenant-b` on `origin/codex/m7-ui-31-orders-visible-ui`.
- Focused browser evidence proves owner/source/React comparison, desktop list/detail/import geometry, collapsed nav, tenant-only sidebar categories and 320px no-overflow fallback.
- Existing orders interaction coverage remains intact.
- Synthetic/degraded/mock/read-only label remains visible and states `not production order data`.
- No disallowed files are changed.

## Validation Plan

- `git diff --name-only origin/codex/m7-ui-31-orders-visible-ui...HEAD`
- `git diff --check origin/codex/m7-ui-31-orders-visible-ui...HEAD`
- `npm run format:check`
- `npm run jscpd`
- `npm run knip`
- `npm run guard:pr-shape -- --base origin/codex/m7-ui-31-orders-visible-ui --spec docs/specs/M7-UI-66-orders-source-parity-refresh.md --include-worktree`
- `npx playwright test apps/admin/tests/m7-ui-orders-source-parity.spec.ts apps/admin/tests/m7-ui-orders.spec.ts`
- `npm run typecheck`
- `npm run lint`

## Failure Branches

- If source geometry cannot be kept without shared shell/topbar/sidebar edits, stop and report the shell dependency instead of editing shared shell.
- If order data labels cannot stay honest without visually overwhelming the page, keep the label and record the remaining visual delta.
- If Playwright cannot open owner HTML directly, record the owner HTML as bundled executable source and use the unpacked source files plus React browser evidence as the stable mapping; do not copy compressed bundle content.

## 不做什么

- No backend/API/DB/schema/migration/generated/package/lock/global config/CI/shared AppShell/topbar/sidebar/registry/PageOutlet changes.
- No raw prototype fixture import.
- No real CSV/XLSX file read or parse.
- No external order API, `order_connector` or provider/adapter.
- No real customer names, phones, Telegram handles, order ids, external ids, addresses, payment information or production-like metrics.
- No order runtime closure, owner visual acceptance, M7 closeout, GA-0, production/staging action, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release approval.
