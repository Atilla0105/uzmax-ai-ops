# M10-06 Support Runtime UI Truth

Spec: `docs/specs/M10-06-support-runtime-ui-truth.md`
Status: `implementation_validated_not_release`
Recorded: 2026-07-09
Branch: `codex/m10-06-support-runtime-truth`
Worktree: `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/m10-06-support-runtime-truth`

## Current Truth

The live admin screenshots on 2026-07-09 showed customer-service pages still mixing product UI with synthetic/degraded data:

- Confirmation Queue displayed mock/degraded candidates after a 404 queue API request.
- Tickets displayed the M7 synthetic `T-1042`/`T-1039` ticket records and the copy `degraded mock · read-only evidence only · not production ticket data`.
- Conversations already used the `conversation-ticket` runtime client, but API-ready state was still visually collapsed into `degraded` when synthetic mode was not the data source.
- Support navigation showed hard-coded counts for conversations, tickets and queue.

M10-06 repairs the admin UI runtime-truth boundary. It does not repair missing backend deployment/routes by pretending data exists.

## Implemented Changes

- `tenant.tickets` now uses `createAdminRuntimeFetcher(config, { selectedTenantId })` and existing `conversation-ticket` API paths:
  - `GET /conversation-ticket/conversations`
  - `GET /conversation-ticket/conversations/:conversationId`
  - `POST /conversation-ticket/tickets/:ticketId/actions`
- Runtime ticket rows are aggregated only from conversation detail `tickets`; no new backend ticket-list endpoint was added.
- Strict runtime ticket pages start from `[]` and render loading, empty, permission or error states instead of M7 synthetic tickets.
- Ticket claim, note and close call the approved ticket action endpoint; unsupported transfer is blocked instead of faked.
- Confirmation Queue now uses the configured admin runtime fetcher and selected tenant instead of a bare relative fetch.
- Strict runtime queue empty/error/permission states no longer inject `fallbackItems`.
- Local non-strict design preview still keeps M7 synthetic visual-parity behavior for existing preview tests.
- Conversation page now distinguishes API-backed ready state from synthetic degraded ready state.
- Support nav no longer renders hard-coded support counts.

## Boundary

This evidence does not approve:

- production release or 1.0 GA;
- real customer/order-data expansion;
- production traffic;
- customer LLM/provider use;
- Telegram Business automatic reply;
- confirmation queue backend repair for the observed 404;
- formal knowledge write, distill auto-write or confirmation bypass;
- owner acceptance beyond this admin UI runtime-truth slice.

If the configured API still returns 401/403/404/500, the product-grade behavior is to show the truthful permission/error/empty state and keep writes disabled where necessary.

## Validation Log

- `node --test scripts/tests/m10-support-runtime-ui-truth.test.mjs`
  - Result: pass, 5/5 tests.
  - Coverage: spec scope, support nav hard-coded count removal, conversation synthetic-vs-runtime ready state, strict queue no-fallback behavior, strict ticket runtime wiring.
- `npm run test`
  - Result: pass, 542/542 tests.
  - Coverage: includes M9 static truth update for tickets moving from degraded-only to M10-06 runtime truth, and M10-03 evidence assertion alignment with the current live-pass state.
- `npm run typecheck -- --pretty false`
  - Result: pass.
- `npm run lint`
  - Result: pass.
- `npm run depcruise`
  - Result: pass; no dependency violations found.
- `npm run jscpd`
  - Result: pass; no duplicates found.
- `npm run build:admin`
  - Result: pass.
  - Note: Vite reported the existing chunk-size warning after minification; build succeeded.
- `npm run playwright`
  - Result: pass, 146/146 browser tests.
  - Coverage: local non-strict preview behavior, strict no-static-badge navigation, API-ready conversation state, ticket preview interactions and confirmation queue degraded preview remain intact.
- `git diff --check origin/main...HEAD`
  - Result: pass.
- `node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M10-06-support-runtime-ui-truth.md --include-worktree`
  - Result: pass.
  - Shape: changed files `18`; categories `source=11`, `docs=2`, `test=5`; source changed files `11`; source net LOC `597`; new source files `3`.

## Pending Merge/Deploy Evidence

After merge/deploy, live Vercel should be rechecked against the same screenshot problem:

- strict runtime must not display `T-1042`, `T-1039`, `6 tickets`, `degraded mock`, `not production ticket data`, `mock/degraded read-only` queue cards or hard-coded nav support counts;
- if confirmation queue API remains 404, the live page should show a true error state rather than mock candidates.
