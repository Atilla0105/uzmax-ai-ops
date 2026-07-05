# M7-UI-63 Confirmation Queue Visible Parity Evidence

## Status

Visible-UI-first refresh candidate for `tenant.queue` on branch `codex/m7-ui-63-confirmation-queue-visible-parity`.

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

## Non-Claims

No owner visual acceptance, M7 closeout, runtime/API/DB foundation closure, distill health recovery API, conflict keep-current runtime semantics, production/staging action, real customer/order data, customer LLM, Telegram Business automatic reply, GA-0 or 1.0 release approval is claimed.

## Validation

| Command | Result | Notes |
|---|---|---|
| `npm ci` | pass | Installed isolated worktree dependencies from existing lockfile; package/lock unchanged. |
| `npx prettier --check <touched files>` | pass | Touched queue source/test/docs files use Prettier style. |
| `node node_modules/eslint/bin/eslint.js <touched queue source/tests>` | pass | Complexity and file-length gates pass after queue-local fallback/overlay split. |
| `npm run typecheck` | pass | TypeScript no-emit check passed. |
| `npm run build:admin` | pass | Vite build passed; existing chunk-size warning remains non-blocking. |
| `npm run playwright -- apps/admin/tests/m7-ui-confirmation-queue.spec.ts apps/admin/tests/m7-ui-confirmation-queue-visible-parity.spec.ts` | pass | 5/5 focused tests passed. |
| `git diff --check` | pass | No whitespace errors in worktree diff. |
| `git diff --check origin/codex/m7-ui-62b-tenant-entry-visible-proof...HEAD` | pass | No committed-range whitespace errors before commit; rerun after commit expected. |
| `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-62b-tenant-entry-visible-proof --spec docs/specs/M7-UI-63-confirmation-queue-visible-parity.md --include-worktree` | pass | 11 changed files: source 5, test 2, docs 4. |

## Boundary Note

An initial patch was accidentally applied to root/main because the patch tool has no workdir parameter. The exact two task changes were transferred into this assigned worktree, then reverse-applied from root/main. Root/main now shows only unrelated pre-existing untracked files and no tracked modifications from M7-UI-63.
