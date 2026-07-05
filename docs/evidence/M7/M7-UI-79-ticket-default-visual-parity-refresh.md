# M7-UI-79 Ticket Default Visual Parity Refresh Evidence

## Status

`visible_ui_refresh_candidate_pending_pr_review_not_accepted_not_runtime_closed`

This branch refreshes default visual parity for `tenant.tickets` / `工单` on top of `origin/codex/m7-ui-78-logs-source-parity-refresh`. It removes engineering/runtime caveat pollution from the default visible ticket body while preserving hidden DOM/data-attribute evidence. It does not claim ticket DB/API/runtime, production ticket data, real writes, owner visual acceptance, merge, runtime closure, GA-0 or 1.0 release approval.

## Startup Evidence

- `pwd`: `/Users/atilla/.codex/worktrees/m7-ui-79-ticket-default-visual-parity-refresh`
- `git status --short --branch`: `## codex/m7-ui-79-ticket-default-visual-parity-refresh`
- `git branch --show-current`: `codex/m7-ui-79-ticket-default-visual-parity-refresh`
- Root/main checkout at `/Users/atilla/Applications/UZMAX智能运营` was not used for code edits.

## Source Review

- Read `AGENTS.md`.
- Ran Impeccable context for `apps/admin/src/pages/tickets` with the Codex runtime Node; read product-register guidance.
- Read `PRODUCT.md`, `DESIGN.md`, `docs/admin-design-system.md`, `docs/admin-ui-page-migration-ledger.md` and `docs/evidence/M7/README.md`.
- Read prior ticket specs/evidence: `M7-UI-21` and `M7-UI-64`.
- Read current ticket source and tests:
  - `apps/admin/src/pages/tickets/TicketsPage.tsx`
  - `apps/admin/src/pages/tickets/TicketHtml.ts`
  - `apps/admin/src/pages/tickets/ticketFallback.ts`
  - `apps/admin/tests/m7-ui-ticket-page.spec.ts`
  - `apps/admin/tests/m7-ui-ticket-source-parity.spec.ts`
- Inspected owner/prototype sources:
  - `/Users/atilla/Downloads/运营塔台1.0.html`
  - `/Users/atilla/源码/unpacked 6/pages/tickets/TicketsPage.tsx`
  - `/Users/atilla/源码/unpacked 6/hooks/useTickets.ts`
  - `/Users/atilla/源码/unpacked 6/fixtures/tickets.ts`

## Source Parity Changes

- Removed the visible `.uz-ticket-runtime` row from the default ticket detail body.
- Added hidden `m7-ticket-runtime-note` before the visible ticket columns so runtime labels remain inspectable without affecting default visuals.
- Added `data-runtime-boundary` to the ticket page root while preserving `data-runtime-state="degraded"` and `data-runtime-source="prototype-shaped-synthetic-mock-degraded"`.
- Updated source-parity test metrics from visible runtime caveat to hidden-but-present runtime evidence.
- Added focused Playwright evidence for owner HTML sample, unpacked mapping, default React desktop, local action evidence, collapsed sidebar, mobile 320 and runtime-label visibility checks.

## Data And Runtime Boundary

- All ticket rows remain centralized synthetic/prototype-shaped fallback data in `ticketFallback.ts`.
- Claim, transfer, note and close actions remain browser-local React state only.
- Runtime labels remain present in DOM/data attributes: `degraded`, `mock`, `read-only`, `not production ticket data`.
- Default desktop/collapsed/mobile evidence requires `runtimeLabelsPresent=true` and `runtimeLabelsVisibleInBody=false`.
- No ticket API request, DB read/write, production ticket source, audit write or real order/customer runtime is implemented.

## Browser Evidence

Artifact directory target:

- `/tmp/uzmax-m7-ui-79-ticket-default-visual-parity-refresh/`

Expected captured artifacts:

- Owner HTML sample screenshot: `/tmp/uzmax-m7-ui-79-ticket-default-visual-parity-refresh/owner-html-ticket-source-sample.png`
- Owner HTML DOM sample: `/tmp/uzmax-m7-ui-79-ticket-default-visual-parity-refresh/owner-html-ticket-source-dom-sample.json`
- Unpacked/source mapping: `/tmp/uzmax-m7-ui-79-ticket-default-visual-parity-refresh/unpacked-ticket-source-mapping.json`
- React desktop default screenshot: `/tmp/uzmax-m7-ui-79-ticket-default-visual-parity-refresh/react-ticket-desktop-default.png`
- React collapsed sidebar screenshot: `/tmp/uzmax-m7-ui-79-ticket-default-visual-parity-refresh/react-ticket-collapsed.png`
- React mobile 320 screenshot: `/tmp/uzmax-m7-ui-79-ticket-default-visual-parity-refresh/react-ticket-mobile-320.png`
- Metrics JSON: `/tmp/uzmax-m7-ui-79-ticket-default-visual-parity-refresh/metrics.json`

Measured evidence will record:

- `shellLevel=tenant`, `activePageId=tenant.tickets`
- nav `232` expanded / `68` collapsed
- topbar height `52-53`
- ticket list width `380/381`
- detail visible and desktop side column `247-249`
- tenant categories `运营/数据/智能/管理/洞察`, group categories/buttons absent
- body/document scrollWidth <= viewport on desktop and mobile
- primary source-like ticket content visible: `T-1042`, `UZ-20413`, `关闭工单`
- runtime labels present in DOM/data attributes but not visible in default body

## Validation

| Command | Result | Notes |
|---|---|---|
| `git diff --check` | pass | No whitespace output. |
| `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-78-logs-source-parity-refresh --spec docs/specs/M7-UI-79-ticket-default-visual-parity-refresh.md --include-worktree` | pass | Ran after removing temporary `node_modules` symlink and generated artifacts; all changed paths are spec-listed. |
| `node node_modules/prettier/bin/prettier.cjs --check apps/admin/src/pages/tickets/TicketHtml.ts apps/admin/src/pages/tickets/TicketsPage.tsx apps/admin/src/pages/tickets/ticketFallback.ts apps/admin/tests/m7-ui-ticket-source-parity.spec.ts apps/admin/tests/m7-ui-ticket-default-visual-parity.spec.ts docs/specs/M7-UI-79-ticket-default-visual-parity-refresh.md docs/evidence/M7/M7-UI-79-ticket-default-visual-parity-refresh.md docs/evidence/M7/README.md docs/admin-ui-page-migration-ledger.md` | pass | Touched source/test/docs use Prettier style. |
| `node node_modules/eslint/bin/eslint.js apps/admin/src/pages/tickets/TicketHtml.ts apps/admin/src/pages/tickets/TicketsPage.tsx apps/admin/src/pages/tickets/ticketFallback.ts apps/admin/tests/m7-ui-ticket-source-parity.spec.ts apps/admin/tests/m7-ui-ticket-default-visual-parity.spec.ts` | pass | Focused ESLint equivalent for changed ticket source and Playwright specs. |
| `node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir` | pass | Admin build completed; Vite emitted the existing large-chunk warning only. |
| `node node_modules/@playwright/test/cli.js test apps/admin/tests/m7-ui-ticket-default-visual-parity.spec.ts apps/admin/tests/m7-ui-ticket-source-parity.spec.ts apps/admin/tests/m7-ui-ticket-page.spec.ts` | pass | 6/6 passed using a manually started `vite preview` because the Codex runtime Node bundle has no `npm`/`npx` for the Playwright `webServer` command. |

Validation environment note: plain `node`, `npm` and `npx` were not on the shell PATH. This worker used `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node` and a temporary `node_modules` symlink to `/Users/atilla/.codex/worktrees/m7-ui-65-customer-assets-source-parity-refresh/node_modules`; the symlink and generated `apps/admin/dist`, `test-results` and `playwright-report` artifacts were removed before final status/commit.

## Remaining Non-Claims

- This branch is a visual-parity refresh only; it does not claim owner visual acceptance.
- Ticket DB/API/runtime, production ticket data, real writes, production authz enforcement and release approval remain future approved specs.
- Mobile is a readable/no-overflow fallback, not a pixel-level mobile redesign.
