# M7-UI-20 Conversation Workbench Page Evidence

## Status

Spec-only evidence stub for `tenant.conversations` / 对话工作台.

This PR creates the page-migration contract for the real tenant operational conversation workbench. It updates the M7 execution queue and page ledger, but does not implement the React page, route rendering, API hooks, tests, CSS, backend/API/runtime contracts, DB changes, package/lock changes, CI/global config, screenshots or fixture imports.

This is not page implementation, M7 closeout, owner acceptance, GA-0 opening, production deployment, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release approval.

## Entry Evidence

| Fact | Evidence |
|---|---|
| worker path | `/Users/atilla/.codex/worktrees/m7-ui-20-conversation-workbench-spec` |
| worker branch | `codex/m7-ui-20-conversation-workbench-spec` |
| worker status at entry | `## codex/m7-ui-20-conversation-workbench-spec` |
| worker HEAD / origin main | `88044142c66257dce7cecd7b003cb49be0e6b44b` / `88044142c66257dce7cecd7b003cb49be0e6b44b` |
| root/main checkout | `/Users/atilla/Applications/UZMAX智能运营` |
| root/main status before worktree creation | `## main...origin/main` |
| root/main branch before worktree creation | `main` |
| branch audit | `git branch --no-merged main` showed `codex/m7-ui-11-release-acceptance-page-impl`; owner/coordinator explicitly marked PR #178 Draft/Paused and this worker did not touch it. |
| open PR audit | `gh` is unavailable in this shell. |

## Required Reads / Mapping

- Required reads completed before drafting: `AGENTS.md`, the four v1.1 source-of-truth docs, `docs/admin-design-system.md`, M7 README, page migration ledger, UI-05 layered navigation shell spec/evidence, UI-10 confirmation queue spec/evidence, UI-11 release acceptance spec/evidence, current registry/shell files, backend `conversation-ticket` contract files, legacy M2 conversation shell as evidence-only, and all owner prototype conversation files listed in the spec.
- Owner prototype files read: `/Users/atilla/源码/unpacked 6/pages/conversations/ConversationsPage.tsx`, `ConversationList.tsx`, `MessageThread.tsx`, `Composer.tsx`, `ContextRail.tsx`.
- Adopted Impeccable/product-register guidance: dense operational workbench, status-first hierarchy, keyboard-first desktop flow, mobile fallback only, no decorative visuals, no nested/free layout, no side-stripe copy.
- Rejected prototype/legacy behavior: raw inline styling, raw fixtures as runtime truth, local demo state, old M2 shell visuals, old `--uzmax-*` visual target and group+tenant mixed nav.

## Spec Summary

| Path | Summary |
|---|---|
| `docs/specs/M7-UI-20-conversation-workbench-page.md` | Defines the source mapping, page matrix, runtime/API plan, full state coverage, visual rules, evidence plan, sequence gate and validation list for `tenant.conversations`. |
| `docs/evidence/M7/M7-UI-20-conversation-workbench-page.md` | Records this spec-only evidence stub. |
| `docs/evidence/M7/README.md` | Records UI-05 as merged baseline, UI-10 as already merged, UI-11/PR #178 as Draft/Paused transitional, and UI-20 as next high-value spec. |
| `docs/admin-ui-page-migration-ledger.md` | Updates `tenant.conversations` target spec/status/runtime blockers without claiming implementation. |

## Runtime / Contract Notes

- Current repo has backend `apps/api/src/conversation-ticket.*` contracts for conversation list/detail, handoff ticket creation and ticket actions.
- Current repo does not have a M7 admin conversation page, admin `conversationApiClient`, page hook, WebSocket hook, customer-context aggregator, Business draft confirm API, human external send API or AI trace API.
- Future implementation must prefer existing truthful clients/hooks if present at implementation time. If missing, it must render read-only/degraded or split runtime/API work; fixture pretending as runtime is prohibited.
- UI-05 layered navigation is merged to `main` and is a mandatory baseline: `tenant.conversations` belongs only to the tenant layer.

## Priority Update

`发布与验收` / PR #178 is paused as transitional owner/governance work and is not the main high-value page migration blocker. The real migration priority after the already-merged confirmation queue is `tenant.conversations` / `M7-UI-20-conversation-workbench-page`, pending coordinator review before implementation.

## Validation

Validation is recorded in the final worker report for this branch. Required commands:

- `git diff --check`
- `npm run guard:doc-triggers`
- `node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M7-UI-20-conversation-workbench-page.md --include-worktree`
- PR body includes `Spec ID` and `Spec file` metadata for CI `guard:pr-shape`.

## Boundary

This evidence does not approve page implementation, M7 closeout, owner acceptance, GA-0, production, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release.
