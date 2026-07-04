# M7-UI-21 Ticket Page Evidence

## Status

Implementation candidate evidence for `tenant.tickets` / 工单 on stacked branch `codex/m7-ui-21-ticket-page-visible-ui`.

This PR renders the visible UI-first ticket page using centralized synthetic degraded/mock fallback state. DB/API/runtime foundation is intentionally not implemented for this slice, so the page marks ticket data as `mock`, `degraded` and `read-only`; it does not claim production ticket metrics, real ticket runtime, owner visual acceptance, merge, GA-0, production deployment, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release approval.

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
| `apps/admin/src/pages/tickets/ticketFallback.ts` | Centralizes synthetic degraded/mock ticket rows, tabs, team members, close options, helper functions and scoped CSS. |
| `apps/admin/src/pages/PageOutlet.tsx` | Renders `TicketsPage` for `tenant.tickets` with selected tenant scope. |
| `apps/admin/src/pages/registry.ts` | Marks `tenant.tickets` as implementation evidence pending PR review under this spec. |
| `apps/admin/tests/m7-ui-ticket-page.spec.ts` | Focused Playwright coverage for tenant-only routing/nav, tabs/counts, row select, claim, transfer, note add, close two-step required note, degraded/mock labels, sidebar collapse, 320px no overflow and no mixed group nav. |
| `docs/incidents/INC-2026-07-04-m7-ui-21-root-patch-target.md` | Records and cleans the process incident where initial untracked worker files were briefly created in root/main before being moved into the assigned worktree. |

## Runtime / Data Boundary

- Ticket rows are synthetic/prototype-shaped fallback data and are visibly labeled as `mock`, `degraded` and `read-only`.
- Claim, transfer, note and close actions mutate only local state.
- No backend/API/DB/schema/package/lock/global CI files are touched.
- No real customer names, phones, Telegram handles, order ids or prices are introduced.

## Browser Evidence

Artifacts captured under `/tmp/uzmax-m7-ui-21-ticket-page-visible-ui/`:

- React desktop screenshot: `/tmp/uzmax-m7-ui-21-ticket-page-visible-ui/react-ticket-desktop.png`
- React mobile 320 screenshot: `/tmp/uzmax-m7-ui-21-ticket-page-visible-ui/react-ticket-mobile-320.png`
- Owner/source HTML screenshot: `/tmp/uzmax-m7-ui-21-ticket-page-visible-ui/owner-html-ticket-source.png`
- Source ticket screenshot after sidebar text click: `/tmp/uzmax-m7-ui-21-ticket-page-visible-ui/source-ticket-after-click.png`
- Metrics JSON: `/tmp/uzmax-m7-ui-21-ticket-page-visible-ui/metrics.json`

Measured React metrics:

| Metric | Value |
|---|---|
| page id | `tenant.tickets` |
| runtime state | `degraded` |
| nav width | `232` |
| topbar height | `53` |
| ticket list width | `381` offset pixels (`380px` column plus border) |
| side column width | `248` |
| desktop body/viewport overflow | `1440 / 1440`, `false` |
| mobile body/viewport overflow | `320 / 320`, `false` |

Source HTML note: direct file load of `/Users/atilla/Downloads/运营塔台1.0.html` defaulted to conversation; clicking the left sidebar text `工单` produced the source ticket screenshot. The target is text/DOM-clickable rather than `role=button`. The source screenshot supports layout/source comparison, but no owner visual acceptance is claimed.

## Validation

| Command | Result | Notes |
|---|---|---|
| `npm run format:check` | pass | Prettier clean after targeted formatting of new page/test files. |
| `git diff --check` | pass | No whitespace output. |
| `npm run guard:doc-triggers` | pass | `doc-trigger-paths: ok`. |
| `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-12-group-overview-visible-ui --spec docs/specs/M7-UI-21-ticket-page.md --include-worktree` | pass | `changedFiles: 10`; categories `source: 4`, `docs: 5`, `test: 1`; all paths are spec-listed, including the required incident record. |
| `npm run lint` | pass | ESLint completed cleanly; `TicketsPage.tsx` remains under the 250-line React file limit. |
| `npm run typecheck -- --pretty false` | pass | TypeScript completed cleanly. |
| `npm run build:admin` | pass | Vite admin build completed; bundle size unchanged from current admin baseline for this worker's purposes. |
| `npm run playwright -- apps/admin/tests/m7-ui-ticket-page.spec.ts apps/admin/tests/m7-ui-page-router.spec.ts apps/admin/tests/m7-ui-group-overview.spec.ts apps/admin/tests/m7-ui-conversation-workbench.spec.ts apps/admin/tests/m7-ui-conversation-workbench-fallback.spec.ts` | pass | 22/22 tests passed. |
| `npm run playwright` | pass | Full admin Playwright suite: 58/58 tests passed. |
| `git branch --no-merged main` | checked | Listed `codex/m7-ui-11-release-acceptance-page-impl`, `codex/m7-ui-12-group-overview-visible-ui`, `codex/m7-ui-20-conversation-workbench-page-impl`, this branch and `codex/req-g01a-code-01-db-api-foundation-impl`; no branch was modified by this worker except this branch. |
| `gh pr list --state open --limit 50` | unavailable | `gh` command is not installed/available in this shell. |

Validation environment note: plain `node` was not on the initial shell PATH. Commands used the bundled runtime path `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin` plus `/Applications/Codex.app/Contents/Resources/cua_node/bin`. `npm ci` installed dependencies from the existing lockfile in the assigned worktree only and did not change package/lock files.

## Boundary

This evidence does not approve page migration final acceptance, runtime closure, M7 closeout, owner acceptance, GA-0, production, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release.
