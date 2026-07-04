# M7-UI-31 Orders Page Evidence

## Status

Implementation candidate evidence for `tenant.orders` / 订单 on stacked branch `codex/m7-ui-31-orders-visible-ui`.

This PR renders the visible UI-first orders page using centralized sanitized synthetic degraded/mock/read-only fallback state. DB/API/runtime foundation is intentionally not implemented for this slice, so the page marks order data as `mock`, `degraded`, `read-only` and not production order data. It does not claim real order runtime, real CSV/XLSX parsing, external order API, owner visual acceptance, merge, GA-0, production deployment, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release approval.

## Entry Evidence

| Fact | Evidence |
|---|---|
| worker path | `/Users/atilla/.codex/worktrees/m7-ui-31-orders-visible-ui` |
| worker branch | `codex/m7-ui-31-orders-visible-ui` |
| worker status at entry | `## codex/m7-ui-31-orders-visible-ui...origin/codex/m7-ui-30-customer-assets-visible-ui` |
| worker HEAD at entry | `53f8b43db51847a6856648ba4e94938da2f064d2` |
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
| `apps/admin/src/pages/orders/OrdersPage.tsx` | Visible tenant orders page route with list/detail/back, row keyboard activation, local import flow state and tenant-switch remount isolation through `PageOutlet`. |
| `apps/admin/src/pages/orders/orderFallback.ts` | Sanitized synthetic mock order rows, import history, deterministic URL state helper, HTML renderer and scoped page CSS. |
| `apps/admin/src/pages/PageOutlet.tsx` | Renders `OrdersPage` for `tenant.orders` with selected tenant scope and tenant-switch remount isolation. |
| `apps/admin/src/pages/registry.ts` | Marks `tenant.orders` as implementation evidence pending PR review under this spec. |
| `apps/admin/tests/m7-ui-orders.spec.ts` | Focused Playwright coverage for tenant-only routing/nav, degraded/mock/read-only labels, search geometry, list/detail/stale/timeline/linked affordances, local import modal flow, deterministic states, tenant-switch isolation, sidebar collapse and 320px no overflow. |

## Runtime / Data Boundary

- Order rows are sanitized synthetic/prototype-shaped fallback data and are visibly labeled as `mock`, `degraded`, `read-only` and not production order data.
- Search, detail and import modal flows mutate only local React state.
- No backend/API/DB/schema/package/lock/global CI files are touched.
- No real CSV/XLSX file is read or parsed.
- No external order API, order connector, real customer/order ID, phone, Telegram handle, address, payment or production-looking metric is introduced.

## Browser Evidence

Focused Playwright validates the React implementation directly. Browser artifacts were not required for this narrow completion slice unless produced during validation.

Source HTML note: direct `file://` owner HTML can expose the shell and route anatomy, but the task's reliable detailed acceptance reference for this narrow slice is the frozen unpacked source. Anatomy was verified against `/Users/atilla/源码/unpacked 6/pages/orders/OrdersPage.tsx`, `hooks/useOrders.ts` and `fixtures/orders.ts`; no owner visual acceptance is claimed.

Measured by focused Playwright:

- `tenant.orders` route is tenant-only; tenant sidebar categories are `运营/数据/智能/管理/洞察`, group sections are hidden.
- Search input width is asserted in the 300-340px range.
- Row click and keyboard activation open detail.
- Detail contains stale warning, logistics timeline and linked customer/conversation/ticket affordances.
- Import modal covers local upload, progress, result, history and rollback.
- Deterministic states cover loading, empty, error and permission.
- Tenant switch resets local detail/import state.
- 320px mobile fallback has no body horizontal overflow.

## Validation

| Command | Result | Notes |
|---|---|---|
| `git diff --check origin/codex/m7-ui-30-customer-assets-visible-ui...HEAD` | pass | No whitespace output. |
| `npm run guard:doc-triggers` | pass | `doc-trigger-paths: ok`. |
| `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-30-customer-assets-visible-ui --spec docs/specs/M7-UI-31-orders-page.md --include-worktree` | pass | Pre-stage report: changedFiles `9`, categories `source: 4`, `docs: 4`, `test: 1`; staged-index re-run also exited `0` but reports empty because staged files are not counted by that guard mode. |
| `npm run guard:prettier-ignore -- --base origin/codex/m7-ui-30-customer-assets-visible-ui` | pass | `prettier-ignore-boundary: ok`; no diff-added markers in monitored source/test paths. |
| `npm run format:check` | pass | Full Prettier check clean. |
| `npm run knip` | pass | Completed cleanly after keeping only used exports in `orderFallback.ts`. |
| `npm run jscpd` | pass | No duplicates found. |
| `npm run lint` | pass | Completed cleanly after replacing the click-handler branch chain with a command map. |
| `npm run typecheck` | pass | TypeScript completed cleanly. |
| `npm run playwright -- apps/admin/tests/m7-ui-orders.spec.ts` | pass | 6/6 focused orders tests passed. |
| `npm run build:admin` | pass | Vite admin build completed; final bundle `460.78 kB`, gzip `131.88 kB`. |

## Boundary

This evidence does not approve page migration final acceptance, runtime closure, M7 closeout, owner acceptance, GA-0, production, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release.
