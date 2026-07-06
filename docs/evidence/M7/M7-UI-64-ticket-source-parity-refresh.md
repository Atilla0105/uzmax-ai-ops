# M7-UI-64 Ticket Source Parity Refresh Evidence

## Status

Visible UI refresh candidate evidence for `tenant.tickets` / 工单 on clean-stack branch `codex/m7-ui-64-ticket-source-parity-refresh-cleanstack`, based on `origin/codex/m7-ui-31-orders-visible-ui`.

This slice adds a focused source-parity Playwright pass for the existing ticket page on the current visible UI trunk. It is browser evidence/test only: no ticket page source, runtime/API/DB, shared shell/sidebar/topbar, package, lockfile or CI/global config changes are included. It does not claim ticket DB/API/runtime, owner visual acceptance, merge, GA-0, production deployment, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release approval.

## Entry Evidence

| Fact | Evidence |
|---|---|
| worker path | `/Users/atilla/.codex/worktrees/m7-ui-64-ticket-source-parity-refresh-cleanstack` |
| worker branch | `codex/m7-ui-64-ticket-source-parity-refresh-cleanstack` |
| worker status at entry | `## codex/m7-ui-64-ticket-source-parity-refresh-cleanstack...origin/codex/m7-ui-31-orders-visible-ui` |
| base | `origin/codex/m7-ui-31-orders-visible-ui` |
| root/main checkout | `/Users/atilla/Applications/UZMAX智能运营` was read-only for this worker; no write outside the assigned worktree was detected. |

## Required Reads / Mapping

- `AGENTS.md`
- `docs/specs/M7-UI-21-ticket-page.md`
- `docs/evidence/M7/M7-UI-21-ticket-page.md`
- the four v1.1 source-of-truth docs
- `docs/admin-design-system.md`
- `docs/admin-ui-page-migration-ledger.md`
- `docs/evidence/M7/README.md`
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

Owner HTML and unpacked source files are local-only. The focused Playwright spec captures owner/unpacked artifacts when those files exist and writes `*-unavailable.json` artifacts when they are absent in CI. React parity assertions remain hard either way.

## Implementation Summary

| Path | Summary |
|---|---|
| `docs/specs/M7-UI-64-ticket-source-parity-refresh.md` | Adds scoped source-parity refresh spec for the ticket page on the current visible UI trunk. |
| `apps/admin/tests/m7-ui-ticket-source-parity.spec.ts` | Adds focused Playwright evidence for tenant shell, active page, nav/topbar geometry, tenant-only categories, ticket source-like text, degraded caveat, collapsed sidebar, mobile fallback and artifacts. |
| `docs/evidence/M7/README.md` | Records M7-UI-64 as visible refresh candidate, not runtime or owner acceptance. |
| `docs/admin-ui-page-migration-ledger.md` | Updates the `tenant.tickets` row/status to include this source-parity refresh. |

No UI source changes are included. The focused parity test is intended to expose source/React drift without changing the ticket implementation in this slice.

## Browser Evidence

Artifacts target: `/tmp/uzmax-m7-ui-64-ticket-source-parity-refresh/`

- Owner/source sample when local owner HTML exists: `/tmp/uzmax-m7-ui-64-ticket-source-parity-refresh/owner-html-ticket-source-sample.png`
- Owner/source DOM sample when local owner HTML exists: `/tmp/uzmax-m7-ui-64-ticket-source-parity-refresh/owner-html-ticket-source-dom-sample.json`
- Owner/source unavailable marker when absent: `/tmp/uzmax-m7-ui-64-ticket-source-parity-refresh/owner-html-ticket-source-unavailable.json`
- Unpacked source mapping when local unpacked files exist: `/tmp/uzmax-m7-ui-64-ticket-source-parity-refresh/unpacked-ticket-source-mapping.json`
- Unpacked source unavailable marker when absent: `/tmp/uzmax-m7-ui-64-ticket-source-parity-refresh/unpacked-ticket-source-mapping-unavailable.json`
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

Owner/source DOM sample, when generated locally, should contain `工单`, `即将超SLA`, `客户` and `关闭工单`, with source-like sample text including `T-1042`, `Dilnoza Rashidova`, `UZ-20413`, `AI 建议处理` and the close-ticket options.

Local run generated the owner/source and unpacked source artifacts successfully:

- Owner DOM sample length: `780`
- Unpacked mapping: `TicketsPage.tsx` `251` lines, `useTickets.ts` `108` lines, `fixtures/tickets.ts` `156` lines
- Source mapping detected `380px` list, `248px` side column, required-note close, local actions `claim/reassign/addNote/confirmClose`, records `T-1042/T-1039/T-1051/T-1033/T-1028/T-1019` and sections `摘要/AI 建议处理/会话片段/报价记录/事件时间线/备注/关闭工单`

## Runtime / Data Boundary

- Ticket data remains synthetic/prototype-shaped degraded mock fallback.
- Claim, transfer, note and close actions remain local React state only.
- No backend/API/DB/package/lock/shared shell/topbar/sidebar/ticket source files are touched.
- No real customer/order data or production ticket runtime is claimed.

## Validation

| Command | Result | Notes |
|---|---|---|
| `git diff --name-only origin/codex/m7-ui-31-orders-visible-ui...HEAD` | pass | Shows only the five allowed files: `apps/admin/tests/m7-ui-ticket-source-parity.spec.ts`, `docs/admin-ui-page-migration-ledger.md`, `docs/evidence/M7/M7-UI-64-ticket-source-parity-refresh.md`, `docs/evidence/M7/README.md`, `docs/specs/M7-UI-64-ticket-source-parity-refresh.md`. |
| `git diff --check origin/codex/m7-ui-31-orders-visible-ui...HEAD` | pass | No whitespace output. |
| `npm run format:check` | pass | Prettier reported all matched files use style. |
| `npm run jscpd` | pass | No duplicates found; 0 clones. |
| `npm run knip` | pass | Completed with total running time `1.9s` under official Node. |
| `npm run guard:pr-shape -- --base origin/codex/m7-ui-31-orders-visible-ui --spec docs/specs/M7-UI-64-ticket-source-parity-refresh.md --include-worktree` | pass | `changedFiles: 5`; categories `test: 1`, `docs: 4`; source `changedFiles: 0`, `netLoc: 0`, `newFiles: 0`. |
| `npx playwright test apps/admin/tests/m7-ui-ticket-source-parity.spec.ts apps/admin/tests/m7-ui-ticket-page.spec.ts` | pass | 5/5 passed; generated owner/source sample, unpacked mapping, desktop/collapsed/mobile screenshots and metrics under `/tmp/uzmax-m7-ui-64-ticket-source-parity-refresh/`. |
| `npm run typecheck` | pass | TypeScript completed cleanly. |
| `npm run lint` | pass | ESLint completed cleanly. |

Validation environment note: this worktree required local `npm ci` because the project scripts reference `node_modules/...` inside the active checkout. The first `knip` attempt under Codex app Node hit macOS native binding Team ID validation for `oxc-parser`; rerunning with `/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin` passed. No package or lockfile changed.

## Remaining Differences / Non-Claims

- This slice records parity evidence on the current visible UI trunk; it does not claim owner visual acceptance.
- Runtime remains downgraded/local-only. A future approved runtime spec is required before production ticket data or real write flows can appear.
- Mobile is a readable/no-overflow fallback, not pixel-level mobile redesign.

## Boundary

This evidence does not approve page migration final acceptance, runtime closure, M7 closeout, owner acceptance, GA-0, production, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release.
