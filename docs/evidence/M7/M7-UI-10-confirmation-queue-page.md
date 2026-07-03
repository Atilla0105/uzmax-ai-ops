# M7-UI-10 Confirmation Queue Page Evidence

## Status

Implementation branch evidence for `tenant.queue`. This PR renders the M7 confirmation queue page through `PageOutlet`, wraps the existing `createConfirmationQueueApiClient` in page-local state, adds focused Playwright coverage, and updates the page ledger/index.

Coordinator review follow-up on this branch tightened the page to the approved runtime truth: only the focused unresolved card exposes action controls, decided cards remain visible with token-based dimming, and the stats row no longer shows hardcoded daily cap/pass-rate/frequency values.

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
| `apps/admin/src/pages/queue/QueueCard.tsx` | Queue card, focused-only action footer, conflict diff, controlled-ref preview, disabled keep-current affordance, mobile edit handoff. |
| `apps/admin/src/pages/queue/QueueSupport.tsx` | Page-local runtime hook wrapper, action helpers, state rendering and token-consuming queue styles, including decided-card dimming. |
| `apps/admin/src/pages/PageOutlet.tsx` | Renders `QueuePage` for `tenant.queue`; other routes remain scaffold/legacy behavior. |
| `apps/admin/src/pages/registry.ts` | Corrects queue target spec id/status to `M7-UI-10-confirmation-queue-page` / `implemented_in_worker_pending_pr`. |
| `apps/admin/tests/m7-ui-confirmation-queue.spec.ts` | Focused synthetic route fixtures for render, decisions, focused-only actions, decided-card styling, block reason disabling, state coverage, conflict keyboard blocking and mobile fallback. |
| `apps/admin/tests/m7-ui-page-router.spec.ts` | Updates the router assertion so `tenant.queue` renders the real M7 page while the legacy evidence route remains covered. |

## Runtime / Contract Notes

- Uses only the existing `createConfirmationQueueApiClient` contract: `listItems({ status: "pending" })` and `submitDecision` with `approve`, `edit`, `discard`, `block`.
- Does not edit `apps/admin/src/confirmationQueueApiClient.ts`, backend/API, DB, distill runtime, tokens, package/lock, shared patterns or CI/global config.
- `保留当前值` is visible but disabled because the existing API has no `keep_current` / `kept` action.
- Distill health summary, daily cap, pass-rate, distill frequency and manual recovery are follow-up runtime/API spec work. This PR does not claim those contracts; it only shows true pending/conflict counts plus degraded `健康 API 未接入` wording.
- No fixture is used as runtime. Playwright route fixtures use controlled refs such as `controlled://m7-ui-10/...` only.

## Design Audit / Equivalent Review

| Check | Evidence |
|---|---|
| Focused-only actions | Only the focused unresolved card renders the full action footer; non-focused pending cards remain visible/focusable without controls. Covered in `apps/admin/tests/m7-ui-confirmation-queue.spec.ts`. |
| Decided-card dim state | Approved/edited/discarded/blocked cards keep their audit/status surface and use token-based `is-decided` dim styling instead of disappearing. Covered by Playwright class/style assertions. |
| No fake `/10` cap | Queue stats show true pending/conflict counts and `健康 API 未接入`; daily cap, pass-rate and frequency are documented follow-up runtime/API work. |
| Disabled keep-current/recovery | `保留当前值` remains disabled because no `keep_current`/`kept` contract exists; recovery remains degraded/read-only until a follow-up runtime/API spec exists. |
| No old tokens/side stripe | Queue styles consume current M7 tokens/primitives/patterns and do not add old `--uzmax-*` page tokens or side-stripe decoration. |
| 320px no overflow | Focused Playwright mobile case asserts approval/discard reachability and `document.body.scrollWidth <= 320`; refreshed mobile artifact is recorded below. |

## Visual Evidence

Desktop and 320px visual evidence is generated locally but not committed as binary artifacts. Artifact path:

- `/tmp/uzmax-m7-ui-10-confirmation-queue-page/desktop-1440-full.png` (1440x1000, 159 KB)
- `/tmp/uzmax-m7-ui-10-confirmation-queue-page/mobile-320.png` (320x1520, 106 KB)

Command used after implementation:

```sh
PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH node /tmp/uzmax-m7-ui-10-confirmation-queue-page/capture.mjs
```

## Validation

| Command | Result | Notes |
|---|---|---|
| `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH npm ci` | pass | Installed isolated worktree dependencies; 361 packages, 0 vulnerabilities. |
| `npm run format:check` | local blocked | Reports 10 unchanged out-of-scope files outside this PR (`apps/admin/src/M4CustomerAssetRuntimeState.tsx`, `apps/admin/src/orderImportApiClient.ts`, `apps/api/src/ai-member-runtime.contracts.ts`, `apps/api/src/confirmation-queue.types.ts`, `apps/api/src/conversation-ticket.types.ts`, `apps/api/src/order-import.repository.ts`, `apps/api/src/order-import.types.ts`, `packages/capabilities/kb/src/index.ts`, `packages/capabilities/order-read/src/index.ts`, `packages/channels/src/index.ts`). These were not edited because they are outside this worker boundary. |
| `npx prettier --check <touched M7-UI-10 files>` | pass | All touched source/test/docs files in this PR use Prettier code style. |
| `npm run guard:prettier-ignore -- --base origin/main` | pass | `prettier-ignore-boundary: ok (8 baseline file(s), 89/89 marker(s))`; monitored source/test diff check passed. |
| `npm run typecheck` | pass | `tsc --noEmit -p tsconfig.json`. |
| `npm run lint` | pass | ESLint/dependency-cruiser command completed with 0 problems. |
| `npm run build:admin` | pass | Vite admin production build completed. |
| `npm run playwright -- apps/admin/tests/m7-ui-confirmation-queue.spec.ts` | pass | 4/4 focused tests passed, including focused-only actions, decided-card styling, block reason disabling, conflict keyboard blocking, state coverage and 320px mobile fallback. |
| `npm run playwright -- apps/admin/tests/m7-ui-page-router.spec.ts` | pass | Router test now verifies `tenant.queue` renders `m7-confirmation-queue-page` and no scaffold while preserving legacy evidence route coverage. |
| `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH node /tmp/uzmax-m7-ui-10-confirmation-queue-page/capture.mjs` | pass | Generated `/tmp/uzmax-m7-ui-10-confirmation-queue-page/desktop-1440-full.png` (1440x1000, 159 KB) and `/tmp/uzmax-m7-ui-10-confirmation-queue-page/mobile-320.png` (320x1520, 106 KB); screenshots are not committed. |
| `git diff --check` / `git diff --cached --check` / `git diff --check origin/main...HEAD` | pass | Working, staged and committed diff whitespace checks returned no output. |
| `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M7-UI-10-confirmation-queue-page.md --include-worktree` | pass | Guard reported 11 changed files: source 5, test 2, docs 4; source changed files 5, net LOC 599, new source files 3. |

## Boundary

This evidence does not approve page acceptance, M7 closeout, M5 owner acceptance, GA-0, production, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release.
