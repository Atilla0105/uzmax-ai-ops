# M7-UI-64 Ticket Source Parity Refresh Evidence

## Status

Visible UI refresh candidate evidence for `tenant.tickets` / 工单 on stacked branch `codex/m7-ui-64-ticket-source-parity-refresh`, based on `origin/codex/m7-ui-63-confirmation-queue-visible-parity` (#205).

This slice adds a focused source-parity Playwright pass for the existing ticket page on the latest tenant shell stack. It does not claim ticket DB/API/runtime, owner visual acceptance, merge, GA-0, production deployment, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release approval.

## Entry Evidence

| Fact | Evidence |
|---|---|
| worker path | `/Users/atilla/.codex/worktrees/m7-ui-64-ticket-source-parity-refresh` |
| worker branch | `codex/m7-ui-64-ticket-source-parity-refresh` |
| worker status at entry | `## codex/m7-ui-64-ticket-source-parity-refresh...origin/codex/m7-ui-63-confirmation-queue-visible-parity` |
| base | `origin/codex/m7-ui-63-confirmation-queue-visible-parity` / #205 |
| root/main checkout | an initial untracked apply-patch mis-target created this slice's three new files in root/main; they were copied into the assigned worktree and removed from root/main before continuing. Existing unrelated root/main untracked files were not touched. |

## Required Reads / Mapping

- `AGENTS.md`
- `docs/specs/M7-UI-21-ticket-page.md`
- `docs/evidence/M7/M7-UI-21-ticket-page.md`
- `apps/admin/src/pages/tickets/**`
- `apps/admin/tests/m7-ui-ticket-page.spec.ts`
- `/Users/atilla/源码/unpacked 6/pages/tickets/TicketsPage.tsx`
- `/Users/atilla/源码/unpacked 6/hooks/useTickets.ts`
- `/Users/atilla/源码/unpacked 6/fixtures/tickets.ts`
- `/Users/atilla/Downloads/运营塔台1.0.html`

| Source | Mapping summary |
|---|---|
| Owner HTML | Bundled interactive source opened by Playwright for owner/source sample. |
| Unpacked `TicketsPage.tsx` | Source geometry: `380px` ticket list, compact tabs/counts, source-like row anatomy, detail cards and `248px` side column. |
| Unpacked `useTickets.ts` | Local state machine source for tab, select, claim, transfer, add note and close required note. |
| Unpacked `fixtures/tickets.ts` | Field-shape source for prototype-like ticket IDs/content; React keeps centralized synthetic/degraded fallback labeling. |

## Implementation Summary

| Path | Summary |
|---|---|
| `docs/specs/M7-UI-64-ticket-source-parity-refresh.md` | Adds scoped source-parity refresh spec for the ticket page on #205 stack. |
| `apps/admin/tests/m7-ui-ticket-source-parity.spec.ts` | Adds focused Playwright evidence for tenant shell, active page, nav/topbar geometry, tenant-only categories, ticket source-like text, degraded caveat, collapsed sidebar, mobile fallback and artifacts. |
| `docs/evidence/M7/README.md` | Records M7-UI-64 as visible refresh candidate, not runtime or owner acceptance. |
| `docs/admin-ui-page-migration-ledger.md` | Updates the `tenant.tickets` row/status to include this source-parity refresh. |

No UI source changes are included. The focused parity test did not expose an obvious ticket-page mismatch on the latest #205 stack.

## Browser Evidence

Artifacts target: `/tmp/uzmax-m7-ui-64-ticket-source-parity-refresh/`

- Owner/source sample: `/tmp/uzmax-m7-ui-64-ticket-source-parity-refresh/owner-html-ticket-source-sample.png`
- Owner/source DOM sample: `/tmp/uzmax-m7-ui-64-ticket-source-parity-refresh/owner-html-ticket-source-dom-sample.json`
- Unpacked source mapping: `/tmp/uzmax-m7-ui-64-ticket-source-parity-refresh/unpacked-ticket-source-mapping.json`
- React desktop screenshot: `/tmp/uzmax-m7-ui-64-ticket-source-parity-refresh/react-ticket-desktop.png`
- React collapsed sidebar screenshot: `/tmp/uzmax-m7-ui-64-ticket-source-parity-refresh/react-ticket-collapsed.png`
- React mobile 320 screenshot: `/tmp/uzmax-m7-ui-64-ticket-source-parity-refresh/react-ticket-mobile-320.png`
- Metrics JSON: `/tmp/uzmax-m7-ui-64-ticket-source-parity-refresh/metrics.json`

Expected assertions:

- tenant shell and active page `tenant.tickets`;
- topbar height `53`, nav `232` expanded / `68` collapsed;
- tenant nav sections exactly `运营/数据/智能/管理/洞察`, group sections absent;
- ticket list width `380/381`, detail visible and side column `248`;
- source-like core text visible: `工单`, `T-1042`, `Dilnoza Rashidova`, `UZ-20413`, `AI 建议处理`, `关闭工单`;
- degraded/mock/read-only caveat visible but not replacing content;
- `320px` mobile body scrollWidth `<= 320`.

Measured React metrics:

| Metric | Desktop | Collapsed | Mobile 320 |
|---|---:|---:|---:|
| shell level | `tenant` | `tenant` | `tenant` |
| active page | `tenant.tickets` | `tenant.tickets` | `tenant.tickets` |
| nav width | `232` | `68` | `320` |
| topbar height | `53` | `53` | `53` |
| ticket list width | `381` | `381` | `397` fallback |
| ticket detail visible | `true` | `true` | `true` |
| side column width | `248` | `248` | `373` fallback |
| body/document scrollWidth | `1440 / 1440` | `1440 / 1440` | `320 / 320` |
| tenant categories | `运营/数据/智能/管理/洞察` | `运营/数据/智能/管理/洞察` | `运营/数据/智能/管理/洞察` |
| group category/button count | `0 / 0` | `0 / 0` | `0 / 0` |
| source-like core text | visible | visible | visible |
| runtime caveat | visible | visible | visible |

Owner/source DOM sample contains `工单`, `即将超SLA`, `客户` and `关闭工单`, with source-like sample text including `T-1042`, `Dilnoza Rashidova`, `UZ-20413`, `AI 建议处理` and the close-ticket options.

## Runtime / Data Boundary

- Ticket data remains synthetic/prototype-shaped degraded mock fallback.
- Claim, transfer, note and close actions remain local React state only.
- No backend/API/DB/package/lock/shared shell/topbar/sidebar files are touched.
- No real customer/order data or production ticket runtime is claimed.

## Validation

| Command | Result | Notes |
|---|---|---|
| `npx playwright test apps/admin/tests/m7-ui-ticket-source-parity.spec.ts` | pass | 1/1 passed; writes owner/source sample, desktop/collapsed/mobile screenshots and metrics under `/tmp/uzmax-m7-ui-64-ticket-source-parity-refresh/`. |
| `npx playwright test apps/admin/tests/m7-ui-ticket-page.spec.ts` | pass | 4/4 existing ticket interaction tests passed. |
| `npx prettier --check docs/specs/M7-UI-64-ticket-source-parity-refresh.md docs/evidence/M7/M7-UI-64-ticket-source-parity-refresh.md docs/evidence/M7/README.md docs/admin-ui-page-migration-ledger.md apps/admin/tests/m7-ui-ticket-source-parity.spec.ts` | pass | Touched docs/test files use Prettier style after formatting the new test. |
| `node node_modules/eslint/bin/eslint.js apps/admin/tests/m7-ui-ticket-source-parity.spec.ts` | pass | Helper complexity fixed by moving most metric derivation outside `page.evaluate`. |
| `npm run typecheck` | pass | TypeScript completed cleanly. |
| `npm run build:admin` | pass | Admin build completed; Vite emitted the existing large-chunk warning only. |
| `git diff --check origin/codex/m7-ui-63-confirmation-queue-visible-parity...HEAD` | pass | No whitespace output. |
| `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-63-confirmation-queue-visible-parity --spec docs/specs/M7-UI-64-ticket-source-parity-refresh.md --include-worktree` | pass | `changedFiles: 5`; categories `docs: 4`, `test: 1`; source `changedFiles: 0`, `netLoc: 0`, `newFiles: 0`. |

Validation environment note: Codex app Node hit the known Rolldown native binding Team ID issue when starting the Playwright web server. The successful Playwright/build/typecheck runs used `/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin` first on PATH. No package or lockfile changed.

## Remaining Differences / Non-Claims

- This slice records parity evidence on the current #205 visible stack; it does not claim owner visual acceptance.
- Runtime remains downgraded/local-only. A future approved runtime spec is required before production ticket data or real write flows can appear.
- Mobile is a readable/no-overflow fallback, not pixel-level mobile redesign.

## Boundary

This evidence does not approve page migration final acceptance, runtime closure, M7 closeout, owner acceptance, GA-0, production, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release.
