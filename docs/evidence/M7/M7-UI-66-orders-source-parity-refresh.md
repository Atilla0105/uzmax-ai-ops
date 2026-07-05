# M7-UI-66 Orders Source Parity Refresh Evidence

## Status

Visible UI refresh candidate evidence for `tenant.orders` / 订单 on stacked branch `codex/m7-ui-66-orders-source-parity-refresh`, based on `origin/codex/m7-ui-65-customer-assets-source-parity-refresh` (#207 stack).

This slice adds a focused source-parity Playwright pass for the existing orders page on the latest tenant shell stack. It does not claim order DB/API/runtime, real CSV/XLSX parsing, external order API, owner visual acceptance, merge, GA-0, production deployment, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release approval.

## Entry Evidence

| Fact | Evidence |
|---|---|
| worker path | `/Users/atilla/.codex/worktrees/m7-ui-66-orders-source-parity-refresh` |
| worker branch | `codex/m7-ui-66-orders-source-parity-refresh` |
| worker status at entry | `## codex/m7-ui-66-orders-source-parity-refresh...origin/codex/m7-ui-65-customer-assets-source-parity-refresh` |
| entry HEAD | `e5b6ff2cc8d12df0e2f1816d575138d0ba1dfa64` |
| base | `origin/codex/m7-ui-65-customer-assets-source-parity-refresh` / #207 stack |
| root/main checkout | Root checkout was read-only for this worker. |

## Required Reads / Mapping

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
- v1.1 order boundaries: PRD REQ-T04/NG-04/NG-06, admin §4.4, architecture §8 and acceptance E-01..E-04/I-01.

| Source | Mapping summary |
|---|---|
| Owner HTML | Bundled interactive source opened by Playwright for orders owner/source sample. |
| Unpacked orders page | Source anatomy: header, 320-ish search, import snapshot action/modal, amber runtime bar, dense 8-column list, detail stale warning, package identity card, logistics timeline and linked customer/conversation/ticket panels. |
| Unpacked `useOrders.ts` | Local state source for query, row select, import upload/progress/result/history/rollback. |
| Unpacked `fixtures/orders.ts` | Field-shape source for prototype-like order entities; React keeps centralized synthetic/degraded fallback labeling. |

## Implementation Summary

| Path | Summary |
|---|---|
| `docs/specs/M7-UI-66-orders-source-parity-refresh.md` | Adds scoped source-parity refresh spec for orders on the latest #207 stack. |
| `apps/admin/tests/m7-ui-orders-source-parity.spec.ts` | Adds focused Playwright evidence for owner/source sample, unpacked mapping, tenant shell, active page, nav/topbar geometry, tenant-only categories, orders source anatomy, degraded caveat, desktop list/detail/import result, collapsed sidebar and mobile fallback artifacts. |
| `docs/evidence/M7/README.md` | Records M7-UI-66 as visible refresh candidate, not runtime or owner acceptance. |
| `docs/admin-ui-page-migration-ledger.md` | Updates the `tenant.orders` row/status to include this source-parity refresh. |

No UI source changes are included.

## Browser Evidence

Artifacts target: `/tmp/uzmax-m7-ui-66-orders-source-parity-refresh/`

- Owner/source sample: `/tmp/uzmax-m7-ui-66-orders-source-parity-refresh/owner-html-orders-source-sample.png`
- Owner/source DOM sample: `/tmp/uzmax-m7-ui-66-orders-source-parity-refresh/owner-html-orders-source-dom-sample.json`
- Unpacked source mapping: `/tmp/uzmax-m7-ui-66-orders-source-parity-refresh/unpacked-orders-source-mapping.json`
- React desktop list screenshot: `/tmp/uzmax-m7-ui-66-orders-source-parity-refresh/react-orders-desktop-list.png`
- React detail screenshot: `/tmp/uzmax-m7-ui-66-orders-source-parity-refresh/react-orders-detail.png`
- React import result screenshot: `/tmp/uzmax-m7-ui-66-orders-source-parity-refresh/react-orders-import-result.png`
- React collapsed sidebar screenshot: `/tmp/uzmax-m7-ui-66-orders-source-parity-refresh/react-orders-collapsed.png`
- React mobile 320 screenshot: `/tmp/uzmax-m7-ui-66-orders-source-parity-refresh/react-orders-mobile-320.png`
- Metrics JSON: `/tmp/uzmax-m7-ui-66-orders-source-parity-refresh/metrics.json`

Expected assertions:

- tenant shell and active page `tenant.orders`;
- topbar height about `53`, nav `232` expanded / `68` collapsed;
- tenant nav sections exactly `运营/数据/智能/管理/洞察`, group sections absent;
- source-like order title, search, import snapshot, 8 table columns, stale warning, package identity card, logistics timeline, linked customer/conversation/ticket panels and local import upload/progress/result/history/rollback;
- degraded/mock/read-only/not-production-order-data caveat visible but not replacing content;
- `320px` mobile body scrollWidth `<= 320`.

Measured React metrics:

| Metric | Desktop list | Desktop detail | Import result | Collapsed | Mobile 320 |
|---|---:|---:|---:|---:|---:|
| shell level | `tenant` | `tenant` | `tenant` | `tenant` | `tenant` |
| active page | `tenant.orders` | `tenant.orders` | `tenant.orders` | `tenant.orders` | `tenant.orders` |
| nav width | `232` | `232` | `232` | `68` | `320` |
| topbar height | `53` | `53` | `53` | `53` | `53` |
| search width | `320` | `0` detail state | `0` detail state | `0` detail state | `0` detail state |
| table columns | `8` | `0` detail state | `0` detail state | `0` detail state | `0` detail state |
| list/table width | `1208 / 1160` | `0 / 0` detail state | `0 / 0` detail state | `0 / 0` detail state | `0 / 0` detail state |
| detail/detail-card width | `0 / 0` list state | `1208 / 1160` | `1208 / 1160` | `1301 / 1253` | `320 / 296` |
| timeline/linked width | `0 / 0` list state | `599 / 545` | `599 / 545` | `648 / 589` | `296 / 296` |
| import modal width | `0` | `0` | `480` | `0` | `0` |
| body/document scrollWidth | `1440 / 1440` | `1440 / 1440` | `1440 / 1440` | `1440 / 1440` | `320 / 320` |
| tenant categories | `运营/数据/智能/管理/洞察` | `运营/数据/智能/管理/洞察` | `运营/数据/智能/管理/洞察` | `运营/数据/智能/管理/洞察` | `运营/数据/智能/管理/洞察` |
| group category/button count | `0 / 0` | `0 / 0` | `0 / 0` | `0 / 0` | `0 / 0` |
| runtime caveat | visible | visible | visible | visible | visible |

Unpacked source mapping records `amberRuntimeBar: true`, `denseEightColumnList: true`, `detailStaleWarning: true`, `importSnapshotButtonAndModal: true`, `search320: true`, `timeline: true`, linked panels `关联客户/关联客户与会话/关联工单`, fixture `orderColumnCount: 8`, hook local state terms `query/openId/importOpen/step/fileName/progress/rollback`, and import flow `history/progress/result/rollback/upload`.

## Runtime / Data Boundary

- Order data remains synthetic/prototype-shaped degraded mock fallback.
- Search, row selection, detail, import upload/progress/result/history/rollback remain local React state only.
- No backend/API/DB/package/lock/shared shell/topbar/sidebar files are touched.
- No real CSV/XLSX file is read or parsed.
- No real order API, production order runtime or production order status is claimed.

## Validation

| Command | Result | Notes |
|---|---|---|
| `git diff --check origin/codex/m7-ui-65-customer-assets-source-parity-refresh...HEAD` | pass | No whitespace output. |
| `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-65-customer-assets-source-parity-refresh --spec docs/specs/M7-UI-66-orders-source-parity-refresh.md --include-worktree` | pass | Ran after removing the temporary untracked `node_modules` symlink; docs/test-only diff within spec touch list. |
| `node node_modules/prettier/bin/prettier.cjs --check ...` | pass | Touched spec/evidence/README/ledger/test files use Prettier style. |
| `node node_modules/eslint/bin/eslint.js apps/admin/tests/m7-ui-orders-source-parity.spec.ts` | pass | Focused new test passes ESLint complexity and file-length rules. |
| `node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json --pretty false` | pass | TypeScript completed cleanly. |
| `node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir` | pass | Admin build completed; Vite emitted the existing large-chunk warning only. |
| `node node_modules/@playwright/test/cli.js test apps/admin/tests/m7-ui-orders-source-parity.spec.ts apps/admin/tests/m7-ui-orders.spec.ts` | pass | 7/7 passed with manual `node node_modules/vite/bin/vite.js preview apps/admin --host 127.0.0.1 --port 4173` because local `npm` is unavailable; writes owner/source sample, unpacked mapping, desktop list/detail/import/collapsed/mobile screenshots and metrics under `/tmp/uzmax-m7-ui-66-orders-source-parity-refresh/`. |

## Remaining Differences / Non-Claims

- This slice records parity evidence on the current #207 visible stack; it does not claim owner visual acceptance.
- Runtime remains downgraded/local-only. A future approved runtime spec is required before production order data, real file parsing, real import jobs or order connector calls can appear.
- Mobile is a readable/no-overflow fallback, not pixel-level mobile redesign.

## Boundary

This evidence does not approve page migration final acceptance, runtime closure, M7 closeout, owner acceptance, GA-0, production, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release.
