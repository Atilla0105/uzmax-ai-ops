# M7-UI-30 Customer Assets Page Evidence

## Status

Implementation candidate evidence for `tenant.customers` / 客户资产 on stacked branch `codex/m7-ui-30-customer-assets-visible-ui`.

This PR renders the visible UI-first customer assets page using centralized sanitized synthetic degraded/mock fallback state. DB/API/runtime foundation is intentionally not implemented for this slice, so the page marks customer data as `mock`, `degraded`, `read-only` and not production customer data. It does not claim real customer runtime, owner visual acceptance, merge, GA-0, production deployment, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release approval.

## Entry Evidence

| Fact | Evidence |
|---|---|
| worker path | `/Users/atilla/.codex/worktrees/m7-ui-30-customer-assets-visible-ui` |
| worker branch | `codex/m7-ui-30-customer-assets-visible-ui` |
| worker status at entry | `## codex/m7-ui-30-customer-assets-visible-ui...origin/codex/m7-ui-21-ticket-page-visible-ui` |
| worker HEAD at entry | `2c2836ec37f3c6e4be4891b220bff9257b0ee4b5` |
| stacked base | `origin/codex/m7-ui-21-ticket-page-visible-ui` |
| root/main checkout | `/Users/atilla/Applications/UZMAX智能运营` remains read-only for this worker |

## Required Reads / Mapping

- Required reads completed before editing: `AGENTS.md`, `docs/admin-design-system.md`, `docs/admin-ui-page-migration-ledger.md`, `docs/evidence/M7/README.md`, `apps/admin/src/pages/registry.ts`, `apps/admin/src/pages/PageOutlet.tsx`, stacked group overview, conversation workbench and ticket page/source/tests/evidence.
- Owner prototype files read: `/Users/atilla/Downloads/运营塔台1.0.html`, `/Users/atilla/源码/unpacked 6/pages/customers/CustomersPage.tsx`, `CustomerListTab.tsx`, `CustomerDetail.tsx`, `ConvSearchTab.tsx`, `TagFieldTabs.tsx`, `TagFieldEditorModal.tsx`, `/Users/atilla/源码/unpacked 6/fixtures/customers.ts`, `/Users/atilla/源码/unpacked 6/hooks/useCustomers.ts`.
- Adopted Impeccable/product-register guidance: dense operational admin UI, status-first hierarchy, complete degraded/mock/read-only labels, desktop control-room primary, 320px readable fallback and no legacy-shell visual drift.
- Impeccable detector: `node .agents/skills/impeccable/scripts/detect.mjs apps/admin/src/pages/customers/CustomersPage.tsx apps/admin/src/pages/customers/CustomerHtml.ts apps/admin/src/pages/customers/customerFallback.ts` exited `0`.
- Rejected/adapted prototype runtime behavior: raw fixture imports, real-looking customer names/handles/phones/order IDs, prototype runtime hooks and any persistence claim.

## Implementation Summary

| Path | Summary |
|---|---|
| `apps/admin/src/pages/customers/CustomersPage.tsx` | Visible tenant customer-assets page route with tabs, filters/search, row open/detail/back and local-only note/tag/field/restore interactions. |
| `apps/admin/src/pages/customers/CustomerHtml.ts` | Page-local HTML renderer for list/detail/tags/fields/search surfaces, matching the prototype anatomy while keeping the runtime boundary visible. |
| `apps/admin/src/pages/customers/customerFallback.ts` | Typed page-local fallback helpers, filtering, runtime labels and scoped customer page CSS. |
| `apps/admin/src/pages/customers/customerFallback.json` | Sanitized synthetic mock customer/tag/field/conversation data; no raw prototype fixture import and no real customer data. |
| `apps/admin/src/pages/PageOutlet.tsx` | Renders `CustomersPage` for `tenant.customers` with selected tenant scope and tenant-switch remount isolation. |
| `apps/admin/src/pages/registry.ts` | Marks `tenant.customers` as implementation evidence pending PR review under this spec. |
| `apps/admin/tests/m7-ui-customer-assets.spec.ts` | Focused Playwright coverage for tenant-only routing/nav, degraded/mock/read-only labels, tabs, filters/search, detail/back, local note/tag/field/restore behavior, tenant-switch isolation, sidebar collapse, 320px no overflow and no mixed group nav. |

## Runtime / Data Boundary

- Customer rows are sanitized synthetic/prototype-shaped fallback data and are visibly labeled as `mock`, `degraded`, `read-only` and not production customer data.
- Note, tag, field and restore actions mutate only local React state.
- No backend/API/DB/schema/package/lock/global CI files are touched.
- No real customer names, phones, Telegram handles, order IDs, prices or production-looking metrics are introduced.

## Browser Evidence

Artifacts captured under `/tmp/uzmax-m7-ui-30-customer-assets-visible-ui/`:

- React desktop customer list screenshot: `/tmp/uzmax-m7-ui-30-customer-assets-visible-ui/react-customer-list-desktop.png`
- React desktop customer detail screenshot: `/tmp/uzmax-m7-ui-30-customer-assets-visible-ui/react-customer-detail-desktop.png`
- React mobile 320 screenshot: `/tmp/uzmax-m7-ui-30-customer-assets-visible-ui/react-customer-mobile-320.png`
- Owner/source HTML screenshot: `/tmp/uzmax-m7-ui-30-customer-assets-visible-ui/source-html-customer-assets.png`
- Owner/source HTML 5s retry screenshot: `/tmp/uzmax-m7-ui-30-customer-assets-visible-ui/source-html-customer-assets-wait5s.png`
- Metrics JSON: `/tmp/uzmax-m7-ui-30-customer-assets-visible-ui/metrics.json`

Measured React metrics:

| Metric | Value |
|---|---|
| page id | `tenant.customers` |
| runtime state | `degraded` |
| nav width | `232` |
| topbar height | `53` |
| customer list table width | `1160` |
| customer detail width | `1208` |
| right side column width | `320` |
| desktop body/viewport overflow | `1440 / 1440`, `false` |
| mobile body/viewport overflow | `320 / 320`, `false` |

Source HTML note: direct file load of `/Users/atilla/Downloads/运营塔台1.0.html` defaulted away from the customer page; clicking the left sidebar text `客户资产` produced the source customer screenshot. After a 5s retry, the source HTML still displayed the customer-assets shell/header/tabs/filter/count/table frame, but did not render full customer row text under `file://`. The source screenshots support shell/filter/table-frame comparison. Row/detail anatomy is verified against `/Users/atilla/源码/unpacked 6/pages/customers/*`, `/Users/atilla/源码/unpacked 6/fixtures/customers.ts` and `/Users/atilla/源码/unpacked 6/hooks/useCustomers.ts`; no owner visual acceptance is claimed.

## Validation

| Command | Result | Notes |
|---|---|---|
| `npm ci` | pass | Installed dependencies in the assigned worktree only; no package/lock edits. |
| `npm run guard:prettier-ignore -- --base origin/codex/m7-ui-21-ticket-page-visible-ui` | pass | `prettier-ignore-boundary: ok`; 8 baseline files, 89/89 markers; no diff-added markers in monitored source/test paths. |
| `npm run format:check` | pass | Full Prettier check clean. |
| `git diff --check origin/codex/m7-ui-21-ticket-page-visible-ui...HEAD` | pass | No whitespace output. |
| `npm run guard:doc-triggers` | pass | `doc-trigger-paths: ok`. |
| `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-21-ticket-page-visible-ui --spec docs/specs/M7-UI-30-customer-assets-page.md --include-worktree` | pass | Post-commit report: changedFiles `11`, categories `source: 5`, `config: 1`, `test: 1`, `docs: 4`; source `netLoc: 599`, `newFiles: 3`. |
| `npm run knip` | pass | Completed cleanly after using the `conversationTags` fallback export. |
| `npm run lint` | pass | Completed cleanly after splitting customer click/filter helpers under complexity budget. |
| `npm run typecheck -- --pretty false` | pass | TypeScript completed cleanly after JSON fallback and select handling fixes. |
| `npm run build:admin` | pass | Vite admin build completed; final bundle `441.39 kB`, gzip `127.23 kB`. |
| `npm run playwright -- apps/admin/tests/m7-ui-customer-assets.spec.ts` | pass | 5/5 customer page tests passed. |
| `npm run playwright -- apps/admin/tests/m7-ui-customer-assets.spec.ts apps/admin/tests/m7-ui-page-router.spec.ts apps/admin/tests/m7-ui-group-overview.spec.ts apps/admin/tests/m7-ui-conversation-workbench.spec.ts apps/admin/tests/m7-ui-conversation-workbench-fallback.spec.ts apps/admin/tests/m7-ui-ticket-page.spec.ts` | pass | 28/28 focused route/group/conversation/ticket/customer tests passed. |
| `node .agents/skills/impeccable/scripts/detect.mjs apps/admin/src/pages/customers/CustomersPage.tsx apps/admin/src/pages/customers/CustomerHtml.ts apps/admin/src/pages/customers/customerFallback.ts` | pass | Script exited `0`; no findings printed. |

## Boundary

This evidence does not approve page migration final acceptance, runtime closure, M7 closeout, owner acceptance, GA-0, production, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release.
