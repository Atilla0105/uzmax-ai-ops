# M7-UI-83 Confirmation Queue Default Visual Parity Refresh Evidence

## Status

Default visual parity refresh candidate for `tenant.queue` on branch `codex/m7-ui-83-confirmation-queue-default-visual-parity-refresh`, based on `origin/codex/m7-ui-82-group-overview-default-visual-parity-refresh`.

This slice keeps the existing confirmation queue API client/runtime fixture path. For API empty/error/unavailable/403 fallback, the visible queue body now uses business Chinese copy (`待连接`, `受控引用`, `人工确认后生效`) instead of surfacing engineering caveats in the main visual layer.

## Source Baseline

- Visual/interaction baseline: owner HTML `/Users/atilla/Downloads/运营塔台1.0.html` and unpacked queue source `/Users/atilla/源码/unpacked 6/pages/queue/QueuePage.tsx`.
- State-machine baseline: `/Users/atilla/源码/unpacked 6/hooks/useConfirmationQueue.ts` and `/Users/atilla/源码/unpacked 6/fixtures/queue.ts` for queue stat labels, conflict diff, keyboard handling and action footer shape.
- Runtime baseline: M7-UI-10/M7-UI-63 queue page and existing `createConfirmationQueueApiClient`; this slice does not edit the API client.

## Implementation Summary

| Path | Summary |
|---|---|
| `apps/admin/src/pages/queue/queueFallback.ts` | Adds `queueRuntimeBoundary` hidden/data evidence, business-visible fallback copy and source-like fallback item values without visible engineering labels. |
| `apps/admin/src/pages/queue/QueuePage.tsx` | Adds hidden runtime note and page/banner `data-runtime-boundary`; replaces visible mode/banner/toast labels with business Chinese copy. |
| `apps/admin/src/pages/queue/QueueCard.tsx` | Removes visible engineering labels from stats and card mode badge; adds card-level runtime boundary attributes. |
| `apps/admin/src/pages/queue/QueueSupport.tsx` | Keeps disabled fallback actions business-labeled while storing runtime boundary on disabled buttons; removes engineering labels from loading/edit action copy. |
| `apps/admin/src/pages/queue/QueueOverlays.tsx` | Replaces read-only edit-panel meta copy with business-visible pending-connection copy while preserving hidden boundary on the input. |
| `apps/admin/tests/m7-ui-confirmation-queue.spec.ts` | Updates existing runtime/fallback assertions to check hidden runtime evidence rather than visible engineering labels. |
| `apps/admin/tests/m7-ui-confirmation-queue-visible-parity.spec.ts` | Keeps desktop/collapsed/mobile geometry coverage and now asserts engineering labels are not visible in body. |
| `apps/admin/tests/m7-ui-confirmation-queue-default-visual-parity.spec.ts` | Adds focused default visual parity proof with owner/unpacked source mapping, hidden boundary evidence, disabled-button boundary evidence, sidebar/topbar checks and 320px no-overflow. |

## Browser Evidence

Focused default visual Playwright writes artifacts to:

- `/tmp/uzmax-m7-ui-83-confirmation-queue-default-visual-parity-refresh/react-queue-desktop-default.png`
- `/tmp/uzmax-m7-ui-83-confirmation-queue-default-visual-parity-refresh/react-queue-collapsed-default.png`
- `/tmp/uzmax-m7-ui-83-confirmation-queue-default-visual-parity-refresh/react-queue-mobile-320-default.png`
- `/tmp/uzmax-m7-ui-83-confirmation-queue-default-visual-parity-refresh/metrics.json`
- `/tmp/uzmax-m7-ui-83-confirmation-queue-default-visual-parity-refresh/unpacked-queue-source-mapping.json`

Expected metrics include nav width `232/68`, topbar height `52-53`, queue flow width around `680`, body/document scroll width within viewport, card count >= 2, conflict diff present, tenant categories `运营/数据/智能/管理/洞察`, group categories absent, runtime labels present in hidden/data evidence and absent from visible body text.

## Runtime Boundary Evidence

Hidden/data boundary string retained:

`mock/degraded | mock | read-only | runtime unavailable | no runtime contract | no production truth | no write | no DB/API/runtime closure`

Locations:

- page `data-runtime-boundary`
- hidden `m7-queue-runtime-note`
- degraded banner `data-runtime-boundary`
- degraded card `data-runtime-boundary`
- disabled fallback buttons `data-runtime-boundary`, `title` and ARIA description

Visible fallback body must not contain the forbidden engineering terms listed in the spec.

## Non-Claims

No owner visual acceptance, M7 closeout, runtime/API/DB foundation closure, distill health recovery API, conflict keep-current runtime semantics, production/staging action, real customer/order data, customer LLM, Telegram Business automatic reply, GA-0 or 1.0 release approval is claimed.

## Validation

| Command | Result | Notes |
|---|---|---|
| `git diff --check` | pass | No whitespace errors in the final worktree diff. |
| `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-82-group-overview-default-visual-parity-refresh --spec docs/specs/M7-UI-83-confirmation-queue-default-visual-parity-refresh.md --include-worktree` | pass | 12 changed files: source 5, test 3, docs 4; source net LOC 44, new source files 0. |
| `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH npx prettier --check <touched files>` | pass | All touched queue source/test/docs files use Prettier style. |
| `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH node node_modules/eslint/bin/eslint.js <touched queue source/tests>` | pass | Focused ESLint passed after keeping `QueueSupport.tsx` within file-length budget. |
| `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH npm run typecheck` | pass | Extra validation; TypeScript no-emit check passed. |
| `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH npm run build:admin` | pass | Vite build passed; existing chunk-size warning remains non-blocking. |
| `CI=1 PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH npm run playwright -- apps/admin/tests/m7-ui-confirmation-queue.spec.ts apps/admin/tests/m7-ui-confirmation-queue-visible-parity.spec.ts apps/admin/tests/m7-ui-confirmation-queue-default-visual-parity.spec.ts` | pass | 6/6 focused tests passed; generated screenshots/metrics under `/tmp/uzmax-m7-ui-83-confirmation-queue-default-visual-parity-refresh`. |
