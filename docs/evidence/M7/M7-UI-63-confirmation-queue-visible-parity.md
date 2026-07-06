# M7-UI-63 Confirmation Queue Visible Parity Evidence

## Status

Visible-UI-first clean-stack refresh candidate for `tenant.queue` on branch `codex/m7-ui-63-confirmation-queue-visible-parity-cleanstack`, based on `origin/codex/m7-ui-31-orders-visible-ui`.

This slice keeps the existing confirmation queue API client/runtime fixture path, but when the list API is empty, unavailable, 500s or 403s, the page now renders a clearly labeled `mock/degraded`, `read-only`, `runtime unavailable` visible queue structure instead of a blank PageState-only surface.

## Source Baseline

- Visual/interaction baseline: owner HTML `/Users/atilla/Downloads/运营塔台1.0.html` and unpacked queue source `/Users/atilla/源码/unpacked 6/pages/queue/QueuePage.tsx`.
- Runtime baseline: merged M7-UI-10 queue page and existing `createConfirmationQueueApiClient`; this slice does not edit the API client.
- Sanitized fallback data uses controlled refs only under `controlled://m7-ui-63/mock/...` and does not include raw customer, order, contact, payment, provider, prompt or LLM payload values.

## Implementation Summary

| Path | Summary |
|---|---|
| `apps/admin/src/pages/queue/QueueSupport.tsx` | Adds `runtime` vs `degraded` mode; API non-empty keeps runtime mode, API empty/error/403 switches to visible read-only fallback. |
| `apps/admin/src/pages/queue/queueFallback.ts` | Centralizes sanitized fallback items/stats/display metadata and runtime display mapping. |
| `apps/admin/src/pages/queue/QueueOverlays.tsx` | Keeps existing edit side panel and block modal behavior while keeping `QueuePage.tsx` under lint file-length. |
| `apps/admin/src/pages/queue/QueuePage.tsx` | Uses owner-like header metric strip, amber degraded banner and centered card flow while preserving runtime decision behavior. |
| `apps/admin/src/pages/queue/QueueCard.tsx` | Renders fallback display fields/title/diff labels and disables action controls in degraded mode. |
| `apps/admin/tests/m7-ui-confirmation-queue-visible-parity.spec.ts` | Covers API 500 fallback visibility, tenant shell/topbar, collapse width 68, mobile 320 no-overflow and writes screenshots/metrics. |
| `apps/admin/tests/m7-ui-confirmation-queue.spec.ts` | Keeps API fixture decision coverage and updates empty/error/permission assertions to the visible-UI-first degraded contract. |

## Browser Evidence

Focused Playwright writes artifacts to:

- `/tmp/uzmax-m7-ui-63-confirmation-queue-visible-parity/react-queue-desktop.png`
- `/tmp/uzmax-m7-ui-63-confirmation-queue-visible-parity/react-queue-collapsed.png`
- `/tmp/uzmax-m7-ui-63-confirmation-queue-visible-parity/react-queue-mobile-320.png`
- `/tmp/uzmax-m7-ui-63-confirmation-queue-visible-parity/metrics.json`

Expected metrics include nav width `232/68`, topbar height `53`, queue flow width around `680`, body scroll width within viewport, degraded labels present, card count >= 2 and conflict diff present.

Generated metrics:

| Viewport | Nav | Topbar | Queue flow | Body scroll | Cards | Conflict diff | Labels |
|---|---:|---:|---:|---:|---:|---|---|
| desktop 1280 | 232 | 53 | 680 | 1280 | 2 | present | present |
| collapsed 1280 | 68 | 53 | 680 | 1280 | 2 | present | present |
| mobile 320 | 320 | 53 | 651 | 320 | 2 | present | present |

## Non-Claims

No owner visual acceptance, M7 closeout, runtime/API/DB foundation closure, distill health recovery API, conflict keep-current runtime semantics, production/staging action, real customer/order data, customer LLM, Telegram Business automatic reply, GA-0 or 1.0 release approval is claimed.

## Validation

| Command | Result | Notes |
|---|---|---|
| `git diff --name-only origin/codex/m7-ui-31-orders-visible-ui...HEAD` | pass | Shows only the allowed 11 files after commit. |
| `git diff --check origin/codex/m7-ui-31-orders-visible-ui...HEAD`; `git diff --check --cached`; `git diff --check` | pass | No whitespace errors. |
| `npm run format:check` | blocked by unrelated baseline | Current local environment has Node but no npm shim; equivalent Prettier full check reports existing non-slice formatting issues in 14 files outside the allowed list. Focused Prettier check over the 11 touched files passed. |
| `npm run jscpd` | pass | Initial duplicate helper was rewritten; rerun found 0 clones. |
| `npm run guard:pr-shape -- --base origin/codex/m7-ui-31-orders-visible-ui --spec docs/specs/M7-UI-63-confirmation-queue-visible-parity.md --include-worktree` | pass | 11 changed files: source 5, test 2, docs 4; net source LOC 349; new source files 2. |
| `npx playwright test apps/admin/tests/m7-ui-confirmation-queue.spec.ts apps/admin/tests/m7-ui-confirmation-queue-visible-parity.spec.ts` | pass | 5/5 focused tests passed using temporary `/tmp` npm/npx shims for Playwright webServer only; generated desktop/collapsed/mobile screenshots and metrics. |
| `npm run typecheck` | blocked by local dependency state | Equivalent script fails before this slice on missing backend/workspace dependencies: `@nestjs/common`, `@nestjs/core`, `@supabase/supabase-js`, `bullmq`, `@prisma/client`, `reflect-metadata`. |
| `npm run lint` | pass | Full lint passed via the same repo ESLint entrypoint. |
| `npm run build` | blocked by local dependency state | Equivalent full build reaches `apps/api` and fails on the same missing backend/workspace dependencies; admin Vite build passed during Playwright webServer startup. |

## Validation Environment Note

This worktree's PATH did not provide `npm`/`npx`; the available runtime exposed Node at `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node`. To run Playwright's configured webServer without writing package or lock files, temporary shims were created under `/tmp/uzmax-m7-ui-63-bin`. No package, lockfile or repo config file was modified, and `pnpm-lock.yaml` was removed from the worktree before validation continued.
