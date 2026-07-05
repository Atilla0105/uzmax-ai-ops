# M7-UI-65 Customer Assets Source Parity Refresh Evidence

## Status

Visible UI refresh candidate evidence for `tenant.customers` / 客户资产 on stacked branch `codex/m7-ui-65-customer-assets-source-parity-refresh`, based on `origin/codex/m7-ui-64-ticket-source-parity-refresh` (#206 stack).

This slice adds a focused source-parity Playwright pass for the existing customer-assets page on the latest tenant shell stack. It does not claim customer DB/API/runtime, owner visual acceptance, merge, GA-0, production deployment, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release approval.

## Entry Evidence

| Fact | Evidence |
|---|---|
| worker path | `/Users/atilla/.codex/worktrees/m7-ui-65-customer-assets-source-parity-refresh` |
| worker branch | `codex/m7-ui-65-customer-assets-source-parity-refresh` |
| worker status at entry | `## codex/m7-ui-65-customer-assets-source-parity-refresh...origin/codex/m7-ui-64-ticket-source-parity-refresh` |
| entry HEAD | `b72dfa9f0c13cbbceb6f05342b61f7fdf3e8e12f` |
| base | `origin/codex/m7-ui-64-ticket-source-parity-refresh` / #206 stack |
| root/main checkout | Root checkout was read-only for this worker. Existing unrelated root/main untracked visible-UI files were observed and not touched. |

## Required Reads / Mapping

- `AGENTS.md`
- `docs/specs/M7-UI-30-customer-assets-page.md`
- `docs/evidence/M7/M7-UI-30-customer-assets-page.md`
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

| Source | Mapping summary |
|---|---|
| Owner HTML | Bundled interactive source opened by Playwright for customer-assets owner/source sample. |
| Unpacked customer page/components | Source anatomy: header, five tabs, list filters/table, detail identity, history, order snapshots, quote records, dual-rail records, `320px` side column, customer tags and custom fields. |
| Unpacked `useCustomers.ts` | Local state source for tab, row select, note, tag, field and restore behavior. |
| Unpacked `fixtures/customers.ts` | Field-shape source for prototype-like customer entities; React keeps centralized synthetic/degraded fallback labeling. |

## Implementation Summary

| Path | Summary |
|---|---|
| `docs/specs/M7-UI-65-customer-assets-source-parity-refresh.md` | Adds scoped source-parity refresh spec for customer assets on the latest #206 stack. |
| `apps/admin/tests/m7-ui-customer-assets-source-parity.spec.ts` | Adds focused Playwright evidence for owner/source sample, unpacked mapping, tenant shell, active page, nav/topbar geometry, tenant-only categories, customer source anatomy, degraded caveat, desktop list/detail, collapsed sidebar and mobile fallback artifacts. |
| `docs/evidence/M7/README.md` | Records M7-UI-65 as visible refresh candidate, not runtime or owner acceptance. |
| `docs/admin-ui-page-migration-ledger.md` | Updates the `tenant.customers` row/status to include this source-parity refresh. |

No UI source changes are included unless later validation records otherwise.

## Browser Evidence

Artifacts target: `/tmp/uzmax-m7-ui-65-customer-assets-source-parity-refresh/`

- Owner/source sample: `/tmp/uzmax-m7-ui-65-customer-assets-source-parity-refresh/owner-html-customer-assets-source-sample.png`
- Owner/source DOM sample: `/tmp/uzmax-m7-ui-65-customer-assets-source-parity-refresh/owner-html-customer-assets-source-dom-sample.json`
- Unpacked source mapping: `/tmp/uzmax-m7-ui-65-customer-assets-source-parity-refresh/unpacked-customer-assets-source-mapping.json`
- React desktop list screenshot: `/tmp/uzmax-m7-ui-65-customer-assets-source-parity-refresh/react-customer-assets-desktop-list.png`
- React detail screenshot: `/tmp/uzmax-m7-ui-65-customer-assets-source-parity-refresh/react-customer-assets-detail.png`
- React collapsed sidebar screenshot: `/tmp/uzmax-m7-ui-65-customer-assets-source-parity-refresh/react-customer-assets-collapsed.png`
- React mobile 320 screenshot: `/tmp/uzmax-m7-ui-65-customer-assets-source-parity-refresh/react-customer-assets-mobile-320.png`
- Metrics JSON: `/tmp/uzmax-m7-ui-65-customer-assets-source-parity-refresh/metrics.json`

Expected assertions:

- tenant shell and active page `tenant.customers`;
- topbar height about `53`, nav `232` expanded / `68` collapsed;
- tenant nav sections exactly `运营/数据/智能/管理/洞察`, group sections absent;
- five customer tabs, source-like customer table/filter/search, detail identity, history, order snapshots, quote records, dual-rail records, customer tags and custom fields;
- degraded/mock/read-only/not-production-customer-data caveat visible but not replacing content;
- `320px` mobile body scrollWidth `<= 320`.

Measured React metrics:

| Metric | Desktop list | Desktop detail | Collapsed | Mobile 320 |
|---|---:|---:|---:|---:|
| shell level | `tenant` | `tenant` | `tenant` | `tenant` |
| active page | `tenant.customers` | `tenant.customers` | `tenant.customers` | `tenant.customers` |
| nav width | `232` | `232` | `68` | `320` |
| topbar height | `53` | `53` | `53` | `53` |
| customer tabs | `5` | `0` detail state | `0` detail state | `0` detail state |
| search width | `300` | `0` detail state | `0` detail state | `0` detail state |
| list/table width | `1217 / 1169` | `0 / 0` detail state | `0 / 0` detail state | `0 / 0` detail state |
| detail/identity width | `0 / 0` list state | `1217 / 1169` | `1217 / 1169` | `320 / 296` |
| side column width | `0` list state | `320` | `320` | `296` fallback |
| body/document scrollWidth | `1440 / 1440` | `1440 / 1440` | `1440 / 1440` | `320 / 320` |
| tenant categories | `运营/数据/智能/管理/洞察` | `运营/数据/智能/管理/洞察` | `运营/数据/智能/管理/洞察` | `运营/数据/智能/管理/洞察` |
| group category/button count | `0 / 0` | `0 / 0` | `0 / 0` | `0 / 0` |
| source-like anatomy | list visible | detail visible | detail visible | detail readable |
| runtime caveat | visible | visible | visible | visible |

Unpacked source mapping records `fiveTabs: true`, detail sections `客户资产/客户/语言 / 文字/最近会话/历史会话/订单快照/报价记录/双轨引导记录/客户标签/自定义字段`, `sideColumn320: true`, hook local actions `addNote/restore/tag/field`, and fixture terms `custTags/custFields/custRecords`.

## Runtime / Data Boundary

- Customer data remains synthetic/prototype-shaped degraded mock fallback.
- Note, tag, custom-field and restore actions remain local React state only.
- No backend/API/DB/package/lock/shared shell/topbar/sidebar files are touched.
- No real customer/order data or production customer runtime is claimed.

## Validation

| Command | Result | Notes |
|---|---|---|
| `git diff --check origin/codex/m7-ui-64-ticket-source-parity-refresh...HEAD` | pass | No whitespace output. |
| `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-64-ticket-source-parity-refresh --spec docs/specs/M7-UI-65-customer-assets-source-parity-refresh.md --include-worktree` | pass | `changedFiles: 5`; categories `docs: 4`, `test: 1`; source `changedFiles: 0`, `netLoc: 0`, `newFiles: 0`. |
| `node node_modules/prettier/bin/prettier.cjs --check ...` | pass | Touched spec/evidence/README/ledger/test files use Prettier style. |
| `node node_modules/eslint/bin/eslint.js apps/admin/tests/m7-ui-customer-assets-source-parity.spec.ts` | pass | Helper complexity kept under project limit. |
| `node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json --pretty false` | pass | Required local setup: `npm ci --ignore-scripts` with Codex tools Node, then `prisma generate --schema packages/db/prisma/schema.prisma` to restore ignored generated client in this worker. |
| `node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir` | pass | Admin build completed; Vite emitted the existing large-chunk warning only. |
| `node node_modules/@playwright/test/cli.js test apps/admin/tests/m7-ui-customer-assets-source-parity.spec.ts apps/admin/tests/m7-ui-customer-assets.spec.ts` | pass | 6/6 passed; writes owner/source sample, unpacked mapping, desktop list/detail/collapsed/mobile screenshots and metrics under `/tmp/uzmax-m7-ui-65-customer-assets-source-parity-refresh/`. |
| `node node_modules/@playwright/test/cli.js test apps/admin/tests/m7-ui-customer-assets-source-parity.spec.ts` | pass | Re-ran after improving unpacked mapping detection; 1/1 passed and refreshed mapping artifact. |

## Remaining Differences / Non-Claims

- This slice records parity evidence on the current #206 visible stack; it does not claim owner visual acceptance.
- Runtime remains downgraded/local-only. A future approved runtime spec is required before production customer data or real write flows can appear.
- Mobile is a readable/no-overflow fallback, not pixel-level mobile redesign.

## Boundary

This evidence does not approve page migration final acceptance, runtime closure, M7 closeout, owner acceptance, GA-0, production, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release.
