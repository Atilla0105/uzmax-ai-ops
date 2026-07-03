# M7-UI-10 Confirmation Queue Page Evidence

## Status

Implementation branch evidence for `tenant.queue`. This PR renders the M7 confirmation queue page through `PageOutlet`, wraps the existing `createConfirmationQueueApiClient` in page-local state, adds focused Playwright coverage, and updates the page ledger/index.

This is not M7 closeout, M5 owner acceptance, GA-0, production, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release approval.

## Entry Evidence

| Fact | Evidence |
|---|---|
| worker path | `/Users/atilla/.codex/worktrees/m7-ui-10-confirmation-queue-page-impl` |
| worker branch | `codex/m7-ui-10-confirmation-queue-page-impl` |
| worker status at entry | `## codex/m7-ui-10-confirmation-queue-page-impl...origin/main` |
| worker HEAD / origin main | `e4e8e2bbeda3cc66ddc3d6017c7863aab68bb97f` / `e4e8e2bbeda3cc66ddc3d6017c7863aab68bb97f` |
| root/main checkout | `/Users/atilla/Applications/UZMAX智能运营` |
| root/main status | `## main...origin/main` |
| open PR audit | `gh` unavailable in this shell |

## Required Reads / Mapping

- Required reads completed before implementation: `AGENTS.md`, this spec, Phase 1 evidence, page migration ledger, M7 README, root-patch incident, M7-UI-04 shared operational patterns, current primitives/patterns, router/page outlet/registry, existing confirmation queue client/runtime, M5 tests/evidence as runtime contract reference, `/Users/atilla/源码/unpacked 6/pages/queue/QueuePage.tsx`, `/Users/atilla/源码/unpacked 6/hooks/useConfirmationQueue.ts`, `/Users/atilla/源码/unpacked 6/fixtures/queue.ts`, and `/Users/atilla/Downloads/运营塔台1.0.html` as visual/interaction reference only.
- Adopted Impeccable/product-register guidance: dense operational page, status-first hierarchy, keyboard-first desktop flow, mobile approval fallback, no decorative visuals, no nested cards, no side stripes.
- Rejected prototype-local behavior: inline raw styling, raw fixture/customer/order strings, local fixture runtime state, manual distill recovery fake, and runtime `kept` action.

## Implementation Summary

| Path | Summary |
|---|---|
| `apps/admin/src/pages/queue/QueuePage.tsx` | M7 page body, runtime list/decision state, keyboard handling, edit/block side paths, loading/empty/error/permission/degraded states. |
| `apps/admin/src/pages/queue/QueueCard.tsx` | Queue card, conflict diff, controlled-ref preview, disabled keep-current affordance, mobile edit handoff. |
| `apps/admin/src/pages/queue/QueuePage.css` | Page-local token-consuming layout for stats, queue stream, cards, diff and 320px fallback. |
| `apps/admin/src/pages/PageOutlet.tsx` | Renders `QueuePage` for `tenant.queue`; other routes remain scaffold/legacy behavior. |
| `apps/admin/src/pages/registry.ts` | Corrects queue target spec id to `M7-UI-10-confirmation-queue-page`. |
| `apps/admin/tests/m7-ui-confirmation-queue.spec.ts` | Focused synthetic route fixtures for render, decisions, state coverage, conflict keyboard blocking and mobile fallback. |

## Runtime / Contract Notes

- Uses only the existing `createConfirmationQueueApiClient` contract: `listItems({ status: "pending" })` and `submitDecision` with `approve`, `edit`, `discard`, `block`.
- Does not edit `apps/admin/src/confirmationQueueApiClient.ts`, backend/API, DB, distill runtime, tokens, package/lock, shared patterns or CI/global config.
- `保留当前值` is visible but disabled because the existing API has no `keep_current` / `kept` action.
- Distill health summary and manual restore-daily recovery render as degraded/read-only blockers because no approved admin API contract exists in this slice.
- No fixture is used as runtime. Playwright route fixtures use controlled refs such as `controlled://m7-ui-10/...` only.

## Validation

| Command | Result | Notes |
|---|---|---|
| `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH npm ci` | pass | Installed isolated worktree dependencies; 361 packages, 0 vulnerabilities. |
| `npm run format:check` | pass | Prettier reported all matched files use code style. |
| `npm run typecheck` | pass | `tsc --noEmit -p tsconfig.json`. |
| `npm run lint` | pass | ESLint/dependency-cruiser command completed with 0 problems. |
| `npm run build:admin` | pass | Vite admin production build completed. |
| `npm run playwright -- apps/admin/tests/m7-ui-confirmation-queue.spec.ts` | pass | 4/4 focused tests passed, including conflict keyboard blocking, state coverage and 320px mobile fallback. |
| `git diff --check` / `git diff --cached --check` / `git diff --check origin/main...HEAD` | pass | Working, staged and committed diff whitespace checks returned no output. |
| `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M7-UI-10-confirmation-queue-page.md --include-worktree` | pass | Guard reported 9 changed files: source 5, test 1, docs 3; source changed files 5, net LOC 598, new source files 3. |

## Boundary

This evidence does not approve page acceptance, M7 closeout, M5 owner acceptance, GA-0, production, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release.
