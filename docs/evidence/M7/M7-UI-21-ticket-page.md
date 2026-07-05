# M7-UI-21 Ticket Page Evidence

## Status

Implementation candidate evidence for `tenant.tickets` / 工单 on stacked branch `codex/m7-ui-21-ticket-page-visible-ui`.

This PR renders the visible UI-first ticket page using centralized prototype-shaped synthetic degraded/mock fallback state. DB/API/runtime foundation is intentionally not implemented for this slice, so the page preserves a lightweight `mock` / `degraded` / `read-only` caveat while the main visual content follows the owner source shape (`T-1042`, `T-1039`, `Dilnoza Rashidova`, `Иван Петров`, `UZ-20413`, source-like summaries, quotes and timelines). It does not claim production ticket metrics, real ticket runtime, owner visual acceptance, merge, GA-0, production deployment, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release approval.

## Entry Evidence

| Fact | Evidence |
|---|---|
| worker path | `/Users/atilla/.codex/worktrees/m7-ui-21-ticket-page-visible-ui` |
| worker branch | `codex/m7-ui-21-ticket-page-visible-ui` |
| worker status at entry | `## codex/m7-ui-21-ticket-page-visible-ui...origin/codex/m7-ui-12-group-overview-visible-ui` |
| worker HEAD | `6f3581431905992e217f40384b21ccf1140402d1` |
| stacked base | `origin/codex/m7-ui-12-group-overview-visible-ui` / `6f3581431905992e217f40384b21ccf1140402d1` |
| root/main checkout | `/Users/atilla/Applications/UZMAX智能运营` remains read-only for this worker |

## Required Reads / Mapping

- Required reads completed before editing: `AGENTS.md`, `docs/admin-design-system.md`, `docs/admin-ui-page-migration-ledger.md`, `docs/evidence/M7/README.md`, `apps/admin/src/pages/registry.ts`, `apps/admin/src/pages/PageOutlet.tsx`, #195 group overview files and #182 conversation workbench files.
- Owner prototype files read: `/Users/atilla/Downloads/运营塔台1.0.html`, `/Users/atilla/源码/unpacked 6/pages/tickets/TicketsPage.tsx`, `/Users/atilla/源码/unpacked 6/fixtures/tickets.ts`, `/Users/atilla/源码/unpacked 6/hooks/useTickets.ts`.
- Adopted Impeccable/product-register guidance: dense operational admin UI, status-first hierarchy, complete degraded/mock labeling, desktop control-room primary, 320px readable fallback and no legacy-shell visual drift.
- Rejected/adapted prototype runtime behavior: raw fixture imports, inline style system and prototype values as runtime facts.

## Implementation Summary

| Path | Summary |
|---|---|
| `apps/admin/src/pages/tickets/TicketsPage.tsx` | Visible tenant ticket workbench with tabbed ticket list, detail header, summary/AI/snippet/quote/timeline/note cards, customer/order/close side column and local interactions. |
| `apps/admin/src/pages/tickets/TicketHtml.ts` | Demotes runtime caveat from banner to small evidence text, removes `mock` from tab/count primary labels, uses full customer names in the side card and keeps ticket actions source-like. |
| `apps/admin/src/pages/tickets/ticketFallback.ts` | Replaces engineering placeholder rows with owner-source-like T-1042/T-1039/T-1051/T-1033/T-1028/T-1019 fallback data, summaries, AI suggestions, snippets, quotes, timeline and customer/order details. |
| `apps/admin/tests/m7-ui-ticket-page.spec.ts` | Focused Playwright coverage for tenant-only routing/nav, source-like IDs/content, absence of T-MOCK/Mock/MOCK-ORDER main-visual placeholders, tabs/counts, row select, claim, transfer, note add, close two-step required note, degraded/mock caveat, sidebar collapse, 320px no overflow and no mixed group nav. |

## Runtime / Data Boundary

- Ticket rows are synthetic/prototype-shaped fallback data. Runtime boundary is visible through `data-runtime-source="prototype-shaped-synthetic-mock-degraded"`, `data-runtime-state="degraded"` and the small caveat `degraded mock · read-only evidence only · not production ticket data`.
- Claim, transfer, note and close actions mutate only local state.
- No backend/API/DB/schema/package/lock/global CI files are touched.
- Customer/order content is owner-prototype-shaped fallback evidence, not production runtime truth.

## Browser Evidence

Artifacts captured under `/tmp/uzmax-m7-ui-21-ticket-page-visual-calibration/`:

- React desktop screenshot: `/tmp/uzmax-m7-ui-21-ticket-page-visual-calibration/desktop-1440x900.png`
- React mobile 320 screenshot: `/tmp/uzmax-m7-ui-21-ticket-page-visual-calibration/mobile-320x900.png`
- Metrics JSON: `/tmp/uzmax-m7-ui-21-ticket-page-visual-calibration/geometry.json`

Measured React metrics:

| Metric | Value |
|---|---|
| page id | `tenant.tickets` |
| runtime state | `degraded` |
| runtime source | `prototype-shaped-synthetic-mock-degraded` |
| desktop topbar | `1208x53` at `x=232 y=0` |
| desktop sidebar | `232x960` |
| desktop page | `1208x907` |
| desktop ticket list | `381x907` offset pixels (`380px` column plus border) |
| desktop detail | `827x907` |
| desktop side column | `248x744` |
| desktop body/document scrollWidth | `1440 / 1440` |
| mobile topbar | `320x53` |
| mobile sidebar | `320x242` |
| mobile page | `320x1824` |
| mobile ticket list | `320x261` |
| mobile detail | `320x1563` |
| mobile side column | `296x446` |
| mobile body/document scrollWidth | `320 / 320` |

Source comparison note: the desktop screenshot now presents source-like `工单` header, compact tabs/counts, `T-1042`, `T-1039`, `Dilnoza Rashidova`, `UZ-20413`, quote, timeline and close-ticket stack. The remaining caveat is deliberately smaller than the operational content and does not claim real runtime. No owner visual acceptance is claimed.

## Validation

| Command | Result | Notes |
|---|---|---|
| `git diff --check` | pass | No whitespace output. |
| `npm run format:check` | pass | Prettier clean after targeted formatting of `ticketFallback.ts` and `m7-ui-ticket-page.spec.ts`. |
| `npm run lint` | pass | ESLint completed cleanly after simplifying `ticket()` helper complexity. |
| `npm run typecheck -- --pretty false` | pass | TypeScript completed cleanly. |
| `npm run build:admin` | pass | Vite admin build completed with temporary official Node `v24.18.0` under `/tmp/uzmax-node24`; Codex bundled Node hit a Rolldown native binding code-signature mismatch before this retry. |
| `npm run playwright -- apps/admin/tests/m7-ui-ticket-page.spec.ts` | pass | 4/4 focused ticket-page tests passed. |
| `npm run guard:doc-triggers` | pass | `doc-trigger-paths: ok`. |
| `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-21-ticket-page-visible-ui --spec docs/specs/M7-UI-21-ticket-page.md --include-worktree` | pass | `changedFiles: 5`; categories `source: 3`, `test: 1`, `docs: 1`; source `netLoc: 0`, `newFiles: 0`; all changed files are spec-listed. |
| `node .agents/skills/impeccable/scripts/detect.mjs --json apps/admin/src/pages/tickets/TicketHtml.ts apps/admin/src/pages/tickets/ticketFallback.ts` | pass | `[]`; no detector findings in this ticket slice. |
| `git branch --no-merged main` | checked | Listed multiple active M7/REQ worker branches including this branch; no branch was modified by this worker except this branch. |
| `gh pr list --state open --limit 50` | unavailable | `gh` is not installed/available in this shell. |

Validation environment note: plain `node`/`npm` were not on the initial shell PATH. Static checks used `/Applications/Codex.app/Contents/Resources/cua_node/bin`. Build/preview/Playwright screenshot capture used official temporary Node `v24.18.0` downloaded to `/tmp/uzmax-node24` because Codex bundled Node could not load the Rolldown native binding due macOS library validation (`Team IDs` mismatch). No repo dependency, package or lockfile was changed.

## Boundary

This evidence does not approve page migration final acceptance, runtime closure, M7 closeout, owner acceptance, GA-0, production, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release.
