# M7-UI-84 Orders Default Visual Parity Refresh Evidence

## Status

Visible UI refresh candidate evidence for `tenant.orders` / 订单 on stacked branch `codex/m7-ui-84-orders-default-visual-parity-refresh`, based on `origin/codex/m7-ui-83-confirmation-queue-default-visual-parity-refresh`.

This slice removes visible engineering/runtime labels from the default orders fallback body while preserving degraded/mock/read-only/no runtime/no write evidence in hidden DOM, `data-runtime-boundary`, `title`/ARIA and focused Playwright metrics. It does not claim order DB/API/runtime, real CSV/XLSX parsing, external order API, owner visual acceptance, merge, GA/1.0, production deployment, real customer/order-data use, real import writes or release approval.

## Entry Evidence

| Fact | Evidence |
|---|---|
| worker path | `/Users/atilla/.codex/worktrees/m7-ui-84-orders-default-visual-parity-refresh` |
| worker branch | `codex/m7-ui-84-orders-default-visual-parity-refresh` |
| worker status at entry | `## codex/m7-ui-84-orders-default-visual-parity-refresh` |
| entry HEAD | `f04a491` |
| base | `origin/codex/m7-ui-83-confirmation-queue-default-visual-parity-refresh` / current #225 stack top at entry |
| root/main checkout | Root checkout was not used for writes. |

## Required Reads / Mapping

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

| Source | Mapping summary |
|---|---|
| Owner HTML | Bundled interactive source contains orders labels and is used by focused Playwright source mapping. |
| Unpacked orders page | Source anatomy: header, 320-ish search, import snapshot action/modal, amber snapshot bar, dense 8-column list, detail stale warning, package identity card, logistics timeline and linked customer/conversation/ticket panels. |
| Unpacked `useOrders.ts` | Local state source for query, row select, import upload/progress/result/history/rollback. |
| Unpacked `fixtures/orders.ts` | Field-shape source only; React keeps centralized sanitized fallback records and moves runtime caveats out of visible body. |

## Implementation Summary

| Path | Summary |
|---|---|
| `apps/admin/src/pages/orders/OrdersPage.tsx` | Adds page-level `data-runtime-boundary`; changes local import file/time visible labels away from engineering terms. |
| `apps/admin/src/pages/orders/orderFallback.ts` | Rewrites visible fallback list/detail/stale/import/progress/result/state labels to source-like operational copy; keeps degraded/mock/read-only/no runtime/no write boundary in hidden note and data/title/ARIA attributes. |
| `apps/admin/tests/m7-ui-orders.spec.ts` | Updates existing focused interaction coverage to assert hidden runtime boundary and no forbidden terms in visible orders body. |
| `apps/admin/tests/m7-ui-orders-source-parity.spec.ts` | Updates source-parity metrics so runtime labels are hidden/data evidence, not visible body copy. |
| `apps/admin/tests/m7-ui-orders-default-visual-parity.spec.ts` | Adds focused default visual parity evidence for list, stale detail, import modal/progress/result/rollback and 320px no-overflow. |
| `docs/specs/M7-UI-84-orders-default-visual-parity-refresh.md` | Adds scoped spec for the refresh. |
| `docs/evidence/M7/README.md` and `docs/admin-ui-page-migration-ledger.md` | Records M7-UI-84 as a visible refresh candidate, not runtime or owner acceptance. |

## Browser Evidence

Artifacts target: `/tmp/uzmax-m7-ui-84-orders-default-visual-parity-refresh/`

- React desktop list screenshot: `/tmp/uzmax-m7-ui-84-orders-default-visual-parity-refresh/react-orders-desktop-list-default.png`
- React detail screenshot: `/tmp/uzmax-m7-ui-84-orders-default-visual-parity-refresh/react-orders-detail-default.png`
- React import result screenshot: `/tmp/uzmax-m7-ui-84-orders-default-visual-parity-refresh/react-orders-import-result-default.png`
- React mobile 320 screenshot: `/tmp/uzmax-m7-ui-84-orders-default-visual-parity-refresh/react-orders-mobile-320-default.png`
- Metrics JSON: `/tmp/uzmax-m7-ui-84-orders-default-visual-parity-refresh/metrics.json`
- Source mapping JSON: `/tmp/uzmax-m7-ui-84-orders-default-visual-parity-refresh/unpacked-orders-default-source-mapping.json`

Expected assertions:

- default visible orders body contains `订单`, `导入快照`, `4 个订单`, `268.00`, customer names without `Mock`, `物流节点`, `过期提示`, `导入历史`, `导入完成，部分行失败` and `回滚本次导入`;
- default visible body does not contain forbidden engineering terms;
- page root, hidden runtime note, modal/drop/start/result/rollback/disabled linked controls contain runtime boundary evidence;
- tenant shell and active page `tenant.orders`;
- topbar height about `53`, nav `232` expanded, tenant nav sections exactly `运营/数据/智能/管理/洞察`, group sections absent;
- `320px` mobile body scrollWidth `<= 320`.

## Runtime / Data Boundary

- Order data remains centralized sanitized fallback data.
- Search, row selection, detail, import upload/progress/result/history/rollback remain local React state only.
- No backend/API/DB/package/lock/shared shell/topbar/sidebar/router files are touched.
- No real CSV/XLSX file is read or parsed.
- No real order API, production order runtime, production order status or write is claimed.

## Validation

| Command | Result | Notes |
|---|---|---|
| `git diff --check` | pass | No whitespace output. |
| `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-83-confirmation-queue-default-visual-parity-refresh --spec docs/specs/M7-UI-84-orders-default-visual-parity-refresh.md --include-worktree` | pass | `changedFiles: 9`; categories `source: 2`, `test: 3`, `docs: 4`; source `netLoc: 0`, `newFiles: 0`. |
| `node node_modules/prettier/bin/prettier.cjs --check ...touched files...` | pass | Touched orders source/tests/spec/evidence/README/ledger use Prettier style. |
| `node node_modules/eslint/bin/eslint.js ...touched source/tests...` | pass | Touched orders source and Playwright specs pass complexity/max-lines rules after helper compaction. |
| `node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir` | pass | Admin build completed; Vite emitted the existing large-chunk warning only. |
| `node node_modules/@playwright/test/cli.js test apps/admin/tests/m7-ui-orders.spec.ts apps/admin/tests/m7-ui-orders-source-parity.spec.ts apps/admin/tests/m7-ui-orders-default-visual-parity.spec.ts` | pass | 8/8 passed. Writes screenshots/source mapping/metrics under `/tmp/uzmax-m7-ui-84-orders-default-visual-parity-refresh/` and `/tmp/uzmax-m7-ui-66-orders-source-parity-refresh/`. |

Measured default visual parity metrics:

| Metric | Desktop list | Detail | Import result | Mobile 320 |
|---|---:|---:|---:|---:|
| shell level / active page | `tenant / tenant.orders` | `tenant / tenant.orders` | `tenant / tenant.orders` | `tenant / tenant.orders` |
| nav width | `232` | `232` | `232` | `320` |
| topbar height | `53` | `53` | `53` | `53` |
| body/document scrollWidth | `1440 / 1440` | `1440 / 1440` | `1440 / 1440` | `320 / 320` |
| runtime boundary present | true | true | true | true |
| runtime labels visible in body | false | false | false | false |
| source-like list/detail/import visible | list true | detail true | import true | detail readable true |
| tenant categories | `运营/数据/智能/管理/洞察` | `运营/数据/智能/管理/洞察` | `运营/数据/智能/管理/洞察` | `运营/数据/智能/管理/洞察` |
| group category/button count | `0 / 0` | `0 / 0` | `0 / 0` | `0 / 0` |

## Remaining Differences / Non-Claims

- This slice records a default visual parity refresh only; it does not claim owner visual acceptance.
- Runtime remains downgraded/local-only. A future approved runtime spec is required before production order data, real file parsing, real import jobs or order connector calls can appear.
- Mobile is a readable/no-overflow fallback, not pixel-level mobile redesign.

## Boundary

This evidence does not approve page migration final acceptance, runtime closure, M7 closeout, owner acceptance, GA/1.0, production, real customer/order-data use, real import/write, customer LLM, Telegram Business automatic reply or release.
