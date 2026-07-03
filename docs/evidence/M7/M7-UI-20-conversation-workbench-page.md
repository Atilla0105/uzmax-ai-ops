# M7-UI-20 Conversation Workbench Page Evidence

## Status

Implementation evidence for `tenant.conversations` / 对话工作台.

This branch replaces the planned scaffold with a real M7 tenant conversation workbench page. It adds a page-local `conversation-ticket` read/handoff client, route rendering, focused Playwright coverage, mobile fallback and honest degraded/read-only boundaries for runtime surfaces that do not yet have approved M7 contracts.

This is not owner visual acceptance, runtime closure, M7 closeout, GA-0 opening, production deployment, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release approval.

## Entry Evidence

| Fact | Evidence |
|---|---|
| worker path | `/Users/atilla/.codex/worktrees/m7-ui-20-conversation-workbench-page-impl` |
| worker branch | `codex/m7-ui-20-conversation-workbench-page-impl` |
| worker status at entry | `## codex/m7-ui-20-conversation-workbench-page-impl` |
| worker HEAD | `6e66143e4ea5c9323ec8b25470c8892fdece08a3` |
| root/main checkout | `/Users/atilla/Applications/UZMAX智能运营` |
| root/main status before worktree creation | `## main...origin/main` |
| root/main branch before worktree creation | `main` |
| branch audit | `git branch --no-merged main` showed `codex/m7-ui-11-release-acceptance-page-impl`; owner/coordinator explicitly marked PR #178 Draft/Paused and this worker did not touch it. |
| open PR audit | GitHub connector showed only PR #178 open, Draft/Paused, head `codex/m7-ui-11-release-acceptance-page-impl`; this worker did not touch it. |

## Required Reads / Mapping

- Required reads completed before drafting: `AGENTS.md`, the four v1.1 source-of-truth docs, `docs/admin-design-system.md`, M7 README, page migration ledger, UI-05 layered navigation shell spec/evidence, UI-10 confirmation queue spec/evidence, UI-11 release acceptance spec/evidence, current registry/shell files, backend `conversation-ticket` contract files, legacy M2 conversation shell as evidence-only, and all owner prototype conversation files listed in the spec.
- Owner prototype files read: `/Users/atilla/源码/unpacked 6/pages/conversations/ConversationsPage.tsx`, `ConversationList.tsx`, `MessageThread.tsx`, `Composer.tsx`, `ContextRail.tsx`.
- Adopted Impeccable/product-register guidance: dense operational workbench, status-first hierarchy, keyboard-first desktop flow, mobile fallback only, no decorative visuals, no nested/free layout, no side-stripe copy.
- Rejected prototype/legacy behavior: raw inline styling, raw fixtures as runtime truth, local demo state, old M2 shell visuals, old `--uzmax-*` visual target and group+tenant mixed nav.

## Implementation Summary

| Path | Summary |
|---|---|
| `apps/admin/src/pages/conversations/ConversationsPage.tsx` | M7 three-column tenant conversation workbench page: 316px list, thread/header/message body, AI trace expansion, bottom composer, 340px context rail, SLA/handoff/takeover states and mobile fallback. |
| `apps/admin/src/pages/conversations/conversationWorkbenchRuntime.ts` | Page-local client/hook for existing `conversation-ticket` list/detail/handoff endpoints; no fixture imports and no backend/API expansion. |
| `apps/admin/src/pages/conversations/conversationWorkbenchStyles.tsx` | Scoped page CSS using existing design-system token variables; no new tokens, old `--uzmax-*` target or M2 shell CSS. |
| `apps/admin/src/pages/conversations/conversationWorkbenchPanels.tsx` | Page-local rail/state support split out after Prettier expansion to keep component file size and complexity within lint without moving shared primitives/patterns. |
| `apps/admin/src/pages/PageOutlet.tsx`, `apps/admin/src/pages/registry.ts` | Routes `tenant.conversations` to the real page and marks implementation evidence pending PR review. |
| `apps/admin/tests/m7-ui-conversation-workbench.spec.ts` | Focused Playwright coverage for route/layer/nav, row selection, AI trace, handoff/degraded, loading/empty/error/permission/customer-context-unavailable and 320px mobile fallback. |
| `apps/admin/tests/m7-ui-page-router.spec.ts` | Updates tenant selection assertion so `tenant.conversations` renders the real page, not the scaffold. |

## Runtime / Contract Notes

- Current repo has backend `apps/api/src/conversation-ticket.*` contracts for conversation list/detail, handoff ticket creation and ticket actions.
- This implementation adds only a page-local M7 admin client/hook under `apps/admin/src/pages/conversations/**`.
- The runtime reads approved `conversation-ticket` list/detail/handoff semantics. Business draft confirmation, human external send, customer-context aggregation, customer/order/quote rail actions, AI trace source expansion and WebSocket realtime remain read-only/degraded.
- Fixture pretending as runtime is prohibited and not used.
- UI-05 layered navigation is merged to `main` and is a mandatory baseline: `tenant.conversations` belongs only to the tenant layer.

## Visual / Runtime Notes

- Visual structure follows owner prototype/unpacked sources for tenant sidebar context, 316px conversation list, central thread with 46px-ish header, message body, AI trace affordance, bottom composer/draft area and 340px customer context rail.
- Draft hold remediation tightened the default intercepted desktop data to resemble an operator workbench: 7 dense conversation rows, avatar initials, customer names, short previews, relative time, status/SLA chips, compact AI trace rows and customer rail fields/tags/custom fields/dual-track/notes/actions.
- Raw `controlled://...` refs were removed from the primary default UI. Synthetic Playwright data now uses safe operator-facing labels such as `WB-20413`, `ORD-REF-20413`, `order.lookup(ORD-REF-20413)` and `物流时效-中亚 v4`.
- Runtime caveat remains visible but no longer dominates the first viewport; it is scoped to the composer disabled/read-only state and evidence boundaries.
- Prototype side stripes, raw fixtures, inline styles and local demo state were rejected/adapted. List risk uses badges/dots/row tint instead of 3px side bars.
- Page-local CSS uses existing `--ink-*`, `--state-*`, spacing, radius, font and z-index token variables.
- Mobile fallback stacks list/thread/rail at 320px and keeps emergency takeover visible; complex editing remains disabled/read-only.
- Default runtime may show degraded/error if `/conversation-ticket` is unavailable; this is intentional and does not imply backend/runtime closure.

## PR Hygiene / Budget

- Changed source remains inside the allowed page-local scope: `apps/admin/src/pages/conversations/**`, `PageOutlet`, and `registry`.
- `conversationWorkbenchPanels.tsx` is intentionally added as a page-local support file. Reason: Prettier-expanded JSX/CSS pushed `conversationWorkbenchStyles.tsx` over the React file-length limit and concentrated right-rail/state complexity; splitting the rail/state support keeps lintable code without touching shared primitives, patterns, tokens or shell.
- `pr-shape --include-worktree` passes and reports `source.changedFiles=6`, `source.netLoc=542`, `source.newFiles=3`.
- Manual source budget check with `git diff --numstat origin/main -- apps/admin/src/pages/conversations apps/admin/src/pages/PageOutlet.tsx apps/admin/src/pages/registry.ts` shows the full page-local source additions as `1083` added / `5` deleted lines and four new page-local source files from `main` (`ConversationsPage.tsx`, `conversationWorkbenchPanels.tsx`, `conversationWorkbenchRuntime.ts`, `conversationWorkbenchStyles.tsx`). This is recorded as a `large_change_exception` candidate for coordinator/owner review, not hidden as acceptance.
- No package/lock, backend/API, DB/schema, shared token, shared primitive, shared pattern, shell architecture, CI/guard or PR #178 files were touched.

## Screenshots

Generated artifacts are kept outside the repo under `/tmp/uzmax-m7-ui-20-conversation-workbench-page/`.

| Artifact | Path |
|---|---|
| Desktop 1440-ish screenshot | `/tmp/uzmax-m7-ui-20-conversation-workbench-page/desktop-1440.png` |
| Mobile 320 screenshot | `/tmp/uzmax-m7-ui-20-conversation-workbench-page/mobile-320.png` |
| Owner HTML/prototype screenshot | `/tmp/uzmax-m7-ui-20-conversation-workbench-page/owner-html-1440.png` |

Owner HTML/prototype screenshot was feasible from `/Users/atilla/Downloads/运营塔台1.0.html`. The owner screenshot shows the richer prototype runtime/demo data; this implementation screenshot intentionally shows controlled Playwright route data plus degraded runtime copy instead of importing prototype fixtures.

## Validation

Validation run from `/Users/atilla/.codex/worktrees/m7-ui-20-conversation-workbench-page-impl`:

- `git diff --check` - pass.
- `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH npm run format:check` - pass.
- `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH npm run guard:doc-triggers` - pass.
- `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M7-UI-20-conversation-workbench-page.md --include-worktree` - pass.
- `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH npm run lint` - pass.
- `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH npm run typecheck -- --pretty false` - pass.
- `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH npm run build:admin` - pass.
- `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH npx playwright test apps/admin/tests/m7-ui-conversation-workbench.spec.ts apps/admin/tests/m7-ui-page-router.spec.ts` - pass, 7 tests.
- PR body includes `Spec ID` and `Spec file` metadata for CI `guard:pr-shape`.

## Boundary

This evidence does not approve page implementation, M7 closeout, owner acceptance, GA-0, production, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release.
