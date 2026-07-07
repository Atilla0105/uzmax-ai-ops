# M7-UI-31 Orders Page Evidence

## Status

Implementation candidate evidence for `tenant.orders` / 订单 on stacked branch `codex/m7-ui-31-orders-visible-ui`.

This PR renders the visible UI-first orders page using centralized sanitized synthetic degraded/mock/read-only fallback state. DB/API/runtime foundation is intentionally not implemented for this slice, so the page marks order data as `mock`, `degraded`, `read-only` and not production order data. It does not claim real order runtime, real CSV/XLSX parsing, external order API, owner visual acceptance, merge, GA-0, production deployment, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release approval.

## Entry Evidence

| Fact | Evidence |
|---|---|
| worker path | `/Users/atilla/.codex/worktrees/m7-ui-31-orders-visible-ui` |
| worker branch | `codex/m7-ui-31-orders-visible-ui` |
| worker status at entry | `## codex/m7-ui-31-orders-visible-ui...origin/codex/m7-ui-30-customer-assets-visible-ui [ahead 1]` |
| worker HEAD at entry | `da28a8f2445daf159bc6adc392843523de41fe58` |
| stacked base | `origin/codex/m7-ui-30-customer-assets-visible-ui` |
| root/main checkout | `/Users/atilla/Applications/UZMAX智能运营` remains read-only for this worker |

## Required Reads / Mapping

- Required reads completed before editing: `AGENTS.md`, `docs/admin-design-system.md`, `docs/admin-ui-page-migration-ledger.md`, `docs/evidence/M7/README.md`, `apps/admin/src/pages/registry.ts`, `apps/admin/src/pages/PageOutlet.tsx`, stacked customer assets, tickets and group overview page/source/tests.
- Owner prototype files read: `/Users/atilla/Downloads/运营塔台1.0.html`, `/Users/atilla/源码/unpacked 6/pages/orders/OrdersPage.tsx`, `/Users/atilla/源码/unpacked 6/hooks/useOrders.ts`, `/Users/atilla/源码/unpacked 6/fixtures/orders.ts`.
- Adopted Impeccable/product-register guidance: dense operational admin UI, status-first hierarchy, complete degraded/mock/read-only labels, desktop control-room primary, 320px readable fallback and no legacy-shell visual drift.
- Rejected/adapted prototype runtime behavior: raw fixture imports, real-looking names/phones/Telegram/order IDs, real CSV/XLSX parsing, external order API and persistence/runtime claims.

## Implementation Summary

| Path | Summary |
|---|---|
| `apps/admin/src/pages/orders/OrdersPage.tsx` | Visible tenant orders page route with list/detail/back, row keyboard activation, local import flow state, tenant-switch remount isolation through `PageOutlet` and React-rendered Lucide static snippets for source-preserved icons. |
| `apps/admin/src/pages/orders/orderFallback.ts` | Sanitized synthetic mock order rows, import history, deterministic URL state helper, HTML renderer, trusted static Lucide icon insertion points and scoped page CSS. |
| `apps/admin/src/pages/PageOutlet.tsx` | Renders `OrdersPage` for `tenant.orders` with selected tenant scope and tenant-switch remount isolation. |
| `apps/admin/src/pages/registry.ts` | Marks `tenant.orders` as implementation evidence pending PR review under this spec. |
| `apps/admin/tests/m7-ui-orders.spec.ts` | Focused Playwright coverage for tenant-only routing/nav, topbar height/environment/breadcrumb, degraded/mock/read-only labels, Lucide icon slots, search geometry, list/detail/stale/timeline/linked affordances, local import modal flow, deterministic states, tenant-switch isolation, sidebar collapse, screenshot capture and 320px no overflow. |

## Runtime / Data Boundary

- Order rows are sanitized synthetic/prototype-shaped fallback data and are visibly labeled as `mock`, `degraded`, `read-only` and not production order data.
- Search, detail and import modal flows mutate only local React state.
- No backend/API/DB/schema/package/lock/global CI files are touched.
- No real CSV/XLSX file is read or parsed.
- No external order API, order connector, real customer/order ID, phone, Telegram handle, address, payment or production-looking metric is introduced.

## Browser Evidence

Focused Playwright validates the React implementation directly and writes transient artifacts outside the repo.

Artifacts captured under `/tmp/uzmax-m7-ui-31-orders-visible-ui/`:

- React desktop orders list screenshot: `/tmp/uzmax-m7-ui-31-orders-visible-ui/react-orders-list-desktop.png`
- React desktop orders detail screenshot: `/tmp/uzmax-m7-ui-31-orders-visible-ui/react-orders-detail-desktop.png`
- React mobile 320 screenshot: `/tmp/uzmax-m7-ui-31-orders-visible-ui/react-orders-mobile-320.png`

Source HTML / unpacked / React comparison:

| Evidence item | Result |
|---|---|
| owner HTML region/caveat | `/Users/atilla/Downloads/运营塔台1.0.html` is a compressed dc-runtime owner prototype; the orders runtime region is embedded in the generated script on line `171` (`isOrders`, `orderCols`, `orders`, `orderDetail`, `orderImportOpen`, import state). Direct `file://` can expose shell/route anatomy, but the stable readable component source for detailed comparison is `/Users/atilla/源码/unpacked 6`. |
| unpacked source inspected | `/Users/atilla/源码/unpacked 6/pages/orders/OrdersPage.tsx:1-240` for Search/Upload/TriangleAlert/Package/X icon expression, header/search/import/runtime bar, list/detail/stale/timeline/import modal anatomy; `/Users/atilla/源码/unpacked 6/hooks/useOrders.ts:1-72` for local state machine; `/Users/atilla/源码/unpacked 6/fixtures/orders.ts:1-112` for field shape only. |
| React implementation comparison | Preserves list/detail/import anatomy and source Lucide icon roles while replacing raw/prototype fixture values with centralized sanitized `SYN-*` mock data, visible degraded/read-only/not-production copy and local-only disabled linked affordances. |
| sidebar result | Tenant-only sidebar categories are `运营/数据/智能/管理/洞察`; group sections/buttons are hidden; collapsed sidebar width is asserted at `68`. |
| topbar result | `.uz-topbar` height is asserted `52-53px`; `environment-marker` contains `PRODUCTION` as visual parity only; `route-breadcrumb` contains selected tenant `丝路数码`. |
| key page geometry | Search control width is asserted in the `300-340px` source range; list/detail remain visible; mobile body scroll width is asserted `<= 320`. |
| icon expression | Lucide Search, Upload, TriangleAlert, Package and X render as SVG through `IconSlot` static snippets and are asserted visible in the focused browser test. |
| mobile result | 320px fallback keeps the page visible, table/detail contained and `document.body.scrollWidth <= 320`; pixel-level mobile polish remains deferred. |

Remaining desktop visual deltas:

- Data is intentionally synthetic/mock/read-only (`SYN-*`) rather than the owner prototype's raw real-looking fixture names, phones, Telegram handles, external IDs and prices.
- Linked customer/conversation/ticket affordances remain local-only/disabled because no order runtime/API/navigation contract is implemented in this slice.
- CSV/XLSX parsing, import backend, external order API and DB persistence are not implemented; the import modal is a local UI state machine only.
- No owner visual acceptance, runtime closure, production deployment or release approval is claimed.

## Validation

| Command | Result | Notes |
|---|---|---|
| `git diff --check origin/codex/m7-ui-30-customer-assets-visible-ui...HEAD` | pass | No whitespace output. |
| `npm run guard:doc-triggers` | pass | `doc-trigger-paths: ok`. |
| `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-30-customer-assets-visible-ui --spec docs/specs/M7-UI-31-orders-page.md --include-worktree` | pass | changedFiles `9`, categories `source: 4`, `docs: 4`, `test: 1`; source net LOC `459`, new source files `2`. |
| `npm run guard:prettier-ignore -- --base origin/codex/m7-ui-30-customer-assets-visible-ui` | pass | `prettier-ignore-boundary: ok`; no diff-added markers in monitored source/test paths. |
| `npm run format:check` | pass | Full Prettier check clean. |
| `npm run knip` | pass | Completed cleanly. |
| `npm run jscpd` | pass | No duplicates found. |
| `npm run lint` | pass | Completed cleanly. |
| `npm run typecheck` | pass | TypeScript completed cleanly. |
| `npm run playwright -- apps/admin/tests/m7-ui-orders.spec.ts` | pass | 6/6 focused orders tests passed; React list/detail/mobile screenshots written under `/tmp/uzmax-m7-ui-31-orders-visible-ui/`. |
| `npm run build:admin` | pass | Vite admin build completed; final JS bundle `650.32 kB`, gzip `190.76 kB`; Vite emitted the existing chunk-size warning class (`>500 kB`) after bundling the React static icon renderer. |

## Boundary

This evidence does not approve page migration final acceptance, runtime closure, M7 closeout, owner acceptance, GA-0, production, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release.
