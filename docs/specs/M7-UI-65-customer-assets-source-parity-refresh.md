# M7-UI-65 Customer Assets Source Parity Refresh

## 目标

Refresh the existing visible UI-first `tenant.customers` / 客户资产 page on top of `origin/codex/m7-ui-31-orders-visible-ui` (#251/current visible UI trunk) so the customer-assets page remains aligned with the latest calibrated tenant shell, sidebar, topbar, group/tenant separation, conversation, queue, ticket and order visible UI stack.

This is a browser evidence/test-only source parity refresh, not a rewrite. Source changes are not expected and are outside this slice. This slice does not implement customer DB/API/runtime, does not touch shared shell/topbar/sidebar, and does not claim owner visual acceptance, runtime closure, GA-0, production deployment, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release approval.

Owner HTML `/Users/atilla/Downloads/运营塔台1.0.html`, unpacked source `/Users/atilla/源码/unpacked 6`, and `docs/admin-design-system.md` remain the visible UI source set. Customer data must stay centralized synthetic `mock/degraded/read-only` fallback and visibly `not production customer data`.

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner/coordinator:

- Confirm the current M7 lane remains visible-UI-first while customer runtime/API/DB are downgraded.
- Confirm this branch is stacked on `origin/codex/m7-ui-31-orders-visible-ui`.
- Decide later whether customer runtime work proceeds through a separate approved spec.
- Keep final production/staging, real customer/order data, LLM key, cost/compliance, GA-0, production and release decisions owner-only.

AI agent:

- Work only in `/Users/atilla/.codex/worktrees/m7-ui-65-customer-assets-source-parity-refresh-cleanstack` on branch `codex/m7-ui-65-customer-assets-source-parity-refresh-cleanstack`.
- Keep `/Users/atilla/Applications/UZMAX智能运营` root/main read-only.
- Read AGENTS, M7-UI-30 spec/evidence, current customer source/tests, owner unpacked customer page/components/hook/fixtures and owner HTML before edits.
- Record browser evidence comparing owner HTML/source sample, unpacked source mapping and React desktop list/detail/collapsed/mobile metrics.
- Preserve tenant-only routing, five customer tabs, local-only note/tag/field/restore interactions and tenant switch reset.

## 时间盒

0.5 workday. If the page requires backend/API/DB/packages/package/lock/CI/global config/shared AppShell/topbar/sidebar edits, a broad page rewrite, raw owner fixture import, production data, external API behavior or release action, stop and report `BLOCKED`.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-UI-65-customer-assets-source-parity-refresh.md`
  - `docs/evidence/M7/M7-UI-65-customer-assets-source-parity-refresh.md`
  - `docs/evidence/M7/README.md`
  - `docs/admin-ui-page-migration-ledger.md`
  - `apps/admin/tests/m7-ui-customer-assets-source-parity.spec.ts`
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source changed files: 0
- source net LOC: 0
- new source files: 0
- test files changed/added: <= 1 focused Playwright spec
- docs changed/added: <= 4
- package/lock/generated/config/backend/API/DB/worker/cron/CI/global config/shared shell/sidebar/topbar/registry/PageOutlet/tickets/orders/knowledge: 0
- external API/SDK/provider/connector/adapter basis: none; only browser evidence and local UI fallback state are in scope.

## 文档触发检查

updated

## 前置读取与 source mapping

Required reads:

- `AGENTS.md`
- `docs/specs/M7-UI-30-customer-assets-page.md`
- `docs/evidence/M7/M7-UI-30-customer-assets-page.md`
- `docs/admin-design-system.md`
- `docs/admin-ui-page-migration-ledger.md`
- `docs/evidence/M7/README.md`
- `apps/admin/src/pages/customers/**`
- `apps/admin/tests/m7-ui-customer-assets.spec.ts`
- `/Users/atilla/源码/unpacked 6/pages/customers/CustomersPage.tsx`
- `/Users/atilla/源码/unpacked 6/pages/customers/CustomerListTab.tsx`
- `/Users/atilla/源码/unpacked 6/pages/customers/CustomerDetail.tsx`
- `/Users/atilla/源码/unpacked 6/pages/customers/ConvSearchTab.tsx`
- `/Users/atilla/源码/unpacked 6/pages/customers/TagFieldTabs.tsx`
- `/Users/atilla/源码/unpacked 6/pages/customers/TagFieldEditorModal.tsx`
- `/Users/atilla/源码/unpacked 6/hooks/useCustomers.ts`
- `/Users/atilla/源码/unpacked 6/fixtures/customers.ts`
- `/Users/atilla/Downloads/运营塔台1.0.html`

| Source | Required use |
|---|---|
| Owner HTML | Browser screenshot or DOM sample for customer-assets/source shell terms. The HTML is a bundled executable oracle, not source to copy. |
| Unpacked customer page/components | Primary structured source for header, 5 tabs, filter/table, detail identity, history/orders/quotes/dual-rail cards, tags/fields and `320px` side column. |
| Unpacked `useCustomers.ts` | Interaction source for tab switching, row selection, local note/tag/field/restore behavior. |
| Unpacked `fixtures/customers.ts` | Field-shape reference only. React must continue using centralized sanitized synthetic fallback data with visible degraded/mock/read-only labels. |
| `docs/admin-design-system.md` | Normalize shell geometry: `232/68` nav, `52/53` topbar, desktop primary and 320px readable fallback. |

## Required Evidence

- Owner/source screenshot and DOM/text sample for customer-assets-related owner HTML region when local owner HTML exists; otherwise write an unavailable artifact and continue hard React assertions.
- Unpacked source mapping summary for customer page/components/hook/fixtures when local unpacked source exists; otherwise write an unavailable artifact and continue hard React assertions.
- React desktop list screenshot.
- React detail screenshot.
- React collapsed-sidebar screenshot.
- React mobile `320px` screenshot.
- Metrics JSON with at least:
  - shell level `tenant`
  - active page `tenant.customers`
  - nav width `232` expanded / `68` collapsed
  - topbar height about `53`
  - customer list/detail/side-column widths
  - body/document scrollWidth <= viewport desktop/mobile
  - tab count `5`
  - runtime labels `mock/degraded/read-only/not production customer data`
  - tenant sidebar categories only: `运营/数据/智能/管理/洞察`; group categories absent.

## Impeccable / Design Decision Record

Adopted by default: dense product UI, source-derived customer list/detail anatomy, separated tenant layer, restrained runtime caveat, local-only interaction states, tenant-only sidebar parity and mobile readable/no-overflow fallback.

Rejected: free redesign, old shell visual language, old `--uzmax-*` as visual target, raw prototype fixture imports, production-looking unlabeled customer data, backend/API invention and any owner-acceptance/runtime/release claim.

If Design Skill Layer suggests a visual correction that conflicts with AGENTS, v1.1 docs, data boundary, permissions, release gates or owner source boundaries, record the rejection in evidence instead of implementing it.

## Pass Conditions

- `tenant.customers` renders inside tenant shell after selecting tenant `tenant-b` on `origin/codex/m7-ui-31-orders-visible-ui`.
- Focused browser evidence proves owner/source/React comparison, desktop list/detail geometry, collapsed nav, tenant-only sidebar categories and 320px no-overflow fallback.
- Existing customer interaction coverage remains intact.
- Synthetic/degraded/mock/read-only label remains visible and states `not production customer data`.
- No disallowed files are changed.

## Validation Plan

- `git diff --name-only origin/codex/m7-ui-31-orders-visible-ui...HEAD`
- `git diff --check origin/codex/m7-ui-31-orders-visible-ui...HEAD`
- `npm run format:check`
- `npm run jscpd`
- `npm run knip`
- `npm run guard:pr-shape -- --base origin/codex/m7-ui-31-orders-visible-ui --spec docs/specs/M7-UI-65-customer-assets-source-parity-refresh.md --include-worktree`
- `npx playwright test apps/admin/tests/m7-ui-customer-assets-source-parity.spec.ts apps/admin/tests/m7-ui-customer-assets.spec.ts`
- `npm run typecheck`
- `npm run lint`

## Failure Branches

- If source geometry cannot be kept without source or shared shell/topbar/sidebar edits, stop and report the dependency instead of editing outside this slice.
- If customer data labels cannot stay honest without visually overwhelming the page, keep the label and record the remaining visual delta.
- If Playwright cannot open owner HTML directly, record the owner HTML as bundled executable source and use the unpacked source files plus React browser evidence as the stable mapping; do not copy compressed bundle content.

## 不做什么

- No backend/API/DB/runtime implementation.
- No package, lockfile, generated, CI/global config, shared AppShell/topbar/sidebar, registry, PageOutlet, ticket, order or knowledge edits.
- No raw owner fixture import or production-looking unlabeled customer data.
- No fake writes, production/staging action, real customer/order-data use, owner visual acceptance, runtime closure, GA-0 or 1.0 release claim.
