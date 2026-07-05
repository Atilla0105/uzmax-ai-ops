# M7-UI-85 Customer Assets Default Visual Parity Refresh Evidence

## Status

Visible UI refresh candidate evidence for `tenant.customers` / 客户资产 on stacked branch `codex/m7-ui-85-customer-assets-default-visual-parity-refresh`, based on `origin/codex/m7-ui-84-orders-default-visual-parity-refresh`.

This slice removes visible engineering/runtime labels from the default customer-assets fallback body while preserving degraded/mock/read-only/no runtime/no write evidence in hidden DOM, `data-runtime-boundary`, `title`/ARIA and focused Playwright metrics. It does not claim customer DB/API/runtime, owner visual acceptance, merge, GA/1.0, production deployment, real customer/order-data use, customer LLM, Telegram Business automatic reply or release approval.

## Entry Evidence

| Fact | Evidence |
|---|---|
| worker path | `/Users/atilla/.codex/worktrees/m7-ui-85-customer-assets-default-visual-parity-refresh` |
| worker branch | `codex/m7-ui-85-customer-assets-default-visual-parity-refresh` |
| worker status at entry | `## codex/m7-ui-85-customer-assets-default-visual-parity-refresh` |
| entry HEAD | `9ffcfd8` |
| base | `origin/codex/m7-ui-84-orders-default-visual-parity-refresh` / current #226 stack top at entry |
| root/main checkout | Root checkout was not used for writes. |

## Required Reads / Mapping

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

| Source | Mapping summary |
|---|---|
| Owner HTML | Bundled interactive source contains customer-assets labels and remains the visual/source oracle for focused Playwright mapping. |
| Unpacked customer page/components | Source anatomy: header, five tabs, filter/search, dense list, detail identity/actions, history, order snapshots, quote records, dual-rail records, side tags/fields and tag/field management surfaces. |
| Unpacked `useCustomers.ts` | Local state source for tab, row select, note, tag, field and restore behavior. |
| Unpacked `fixtures/customers.ts` | Field-shape source only; React keeps centralized sanitized fallback records and moves runtime caveats out of visible body. |

## Implementation Summary

| Path | Summary |
|---|---|
| `apps/admin/src/pages/customers/CustomersPage.tsx` | Adds page-level hidden runtime boundary data while preserving tenant-only shell behavior and local state reset. |
| `apps/admin/src/pages/customers/CustomerHtml.ts` | Replaces visible engineering labels in the default list/detail/tags/fields/session-search body with business vocabulary; keeps runtime caveats hidden or in `data-runtime-boundary`, `title` and ARIA metadata. |
| `apps/admin/src/pages/customers/customerFallback.ts` | Centralizes visible snapshot label/reason separately from hidden runtime boundary evidence. |
| `apps/admin/src/pages/customers/customerFallback.json` | Business-izes visible fallback sample values without introducing real customer data; internal ids/testids remain unchanged where needed. |
| `apps/admin/tests/m7-ui-customer-assets.spec.ts` | Extends existing focused coverage to assert visible customer body is clean and hidden runtime boundary evidence remains present. |
| `apps/admin/tests/m7-ui-customer-assets-source-parity.spec.ts` | Keeps source-parity metrics while changing runtime-label checks to hidden/data/title evidence instead of visible body text. |
| `apps/admin/tests/m7-ui-customer-assets-default-visual-parity.spec.ts` | Adds focused default visual parity coverage for clean CustomerHtml-rendered list/detail/non-list tabs/mobile body plus boundary evidence. |
| `docs/specs/M7-UI-85-customer-assets-default-visual-parity-refresh.md` | Adds scoped spec for this default visual parity refresh. |
| `docs/evidence/M7/README.md` and `docs/admin-ui-page-migration-ledger.md` | Records UI-85 as a visible refresh candidate with hidden-runtime-boundary non-claims. |

## Browser Evidence

Artifacts target: `/tmp/uzmax-m7-ui-85-customer-assets-default-visual-parity-refresh/`

- React desktop list screenshot: `/tmp/uzmax-m7-ui-85-customer-assets-default-visual-parity-refresh/react-customer-assets-desktop-list-default.png`.
- React detail screenshot: `/tmp/uzmax-m7-ui-85-customer-assets-default-visual-parity-refresh/react-customer-assets-detail-default.png`.
- React non-list tabs screenshot: `/tmp/uzmax-m7-ui-85-customer-assets-default-visual-parity-refresh/react-customer-assets-tabs-default.png`.
- React mobile 320 screenshot: `/tmp/uzmax-m7-ui-85-customer-assets-default-visual-parity-refresh/react-customer-assets-mobile-320-default.png`.
- Metrics JSON: `/tmp/uzmax-m7-ui-85-customer-assets-default-visual-parity-refresh/metrics.json`.
- Source mapping JSON: `/tmp/uzmax-m7-ui-85-customer-assets-default-visual-parity-refresh/unpacked-customer-assets-default-source-mapping.json`.

Expected assertions:

- default visible customer-assets body contains `客户资产`, `客户列表`, `会话搜索`, `客户标签`, `会话标签`, `自定义字段`, `标签配置`, `归并身份`, `匿名化删除`, `订单快照`, `报价记录` and source-like operational customer values;
- default visible body does not contain forbidden engineering terms;
- page root, hidden runtime note and guarded controls contain runtime boundary evidence;
- tenant shell and active page `tenant.customers`;
- topbar height about `53`, nav `232` expanded, tenant nav sections exactly `运营/数据/智能/管理/洞察`, group sections absent;
- `320px` mobile body scrollWidth `<= 320`.

## Runtime / Data Boundary

- Customer data remains centralized sanitized fallback data.
- Search, filters, row selection, detail, note, tag, field and restore flows remain local React state only.
- No backend/API/DB/package/lock/shared shell/topbar/sidebar/router files are touched.
- No real customer/order data, production customer runtime or write is claimed.

## Validation

| Command | Result | Notes |
|---|---|---|
| `PATH=/tmp/uzmax-node-runtime/node-v24.18.0-darwin-arm64/bin:$PATH npm ci --ignore-scripts` | pass | Installed local validation deps from existing lockfile. |
| `git diff --check` | pass | Clean. |
| `PATH=/tmp/uzmax-node-runtime/node-v24.18.0-darwin-arm64/bin:$PATH pnpm guard:pr-shape --base codex/m7-ui-84-orders-default-visual-parity-refresh` | pass with warning | `pnpm` reported missing `pnpm-workspace.yaml` and `guard:pr-shape: no PR context detected; skipping PR-only checks`; temporary `pnpm-lock.yaml` generated by the command was removed and `npm ci --ignore-scripts` was rerun. This did not provide full PR-only guard coverage. |
| `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node scripts/guards/pr-shape.mjs --base codex/m7-ui-84-orders-default-visual-parity-refresh --spec docs/specs/M7-UI-85-customer-assets-default-visual-parity-refresh.md --include-worktree` | pass | Coordinator fresh run: `changedFiles=11`; `categories.source=3`; `categories.config=1`; `categories.test=3`; `categories.docs=4`; `source.changedFiles=3`; `source.netLoc=14`; `source.newFiles=0`. |
| `PATH=/tmp/uzmax-node-runtime/node-v24.18.0-darwin-arm64/bin:$PATH node node_modules/prettier/bin/prettier.cjs --check ...touched files...` | pass | `All matched files use Prettier code style!` |
| `PATH=/tmp/uzmax-node-runtime/node-v24.18.0-darwin-arm64/bin:$PATH node node_modules/eslint/bin/eslint.js ...touched source/tests...` | pass | No findings. |
| `PATH=/tmp/uzmax-node-runtime/node-v24.18.0-darwin-arm64/bin:$PATH npm run build:admin` | pass | Vite build passed; existing chunk-size warning only. |
| `PATH=/tmp/uzmax-node-runtime/node-v24.18.0-darwin-arm64/bin:$PATH node node_modules/@playwright/test/cli.js test apps/admin/tests/m7-ui-customer-assets.spec.ts apps/admin/tests/m7-ui-customer-assets-source-parity.spec.ts apps/admin/tests/m7-ui-customer-assets-default-visual-parity.spec.ts` | pass | `7 passed (2.9s)`; web server emitted existing `NO_COLOR/FORCE_COLOR` and Vite chunk-size warnings. |

An earlier Playwright attempt failed because tests expected hidden boundary text `not production customer data` while the implementation boundary correctly used `no production customer data`; the tests/spec/ledger wording were aligned and the focused run above passed.

## Remaining Differences / Non-Claims

- This slice records a default visual parity refresh only; it does not claim owner visual acceptance.
- Runtime remains downgraded/local-only. A future approved runtime spec is required before production customer data or real write flows can appear.
- Mobile is a readable/no-overflow fallback, not pixel-level mobile redesign.

## Boundary

This evidence does not approve page migration final acceptance, runtime closure, M7 closeout, owner acceptance, GA/1.0, production, real customer/order-data use, customer LLM, Telegram Business automatic reply or release.
