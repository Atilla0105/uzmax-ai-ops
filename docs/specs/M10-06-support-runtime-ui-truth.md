# M10-06 Support Runtime UI Truth

Spec ID: M10-06
Status: `implementation_in_progress`
Owner confirmation point: project owner asked why live customer-support pages still show mock/degraded data and authorized continued execution. Owner still owns real production traffic, real customer/order-data approval, live credentials/tokens, LLM keys, cost/compliance, GA and 1.0 release.
Timebox: narrow admin support UI runtime-truth repair.

## Spec 类型

feature

## Goal

Make the live admin customer-support surfaces product-grade by preventing strict staging/runtime pages from filling missing API data with M7 synthetic support data.

The customer-support surfaces must:

1. Use `conversation-ticket` runtime truth for conversation and ticket support workbench data when a real/staging API is configured.
2. Render true loading, empty, permission and error states when runtime data is unavailable.
3. Stop showing static ticket rows, static support nav badges or confirmation queue fallback candidates in strict runtime.
4. Preserve local no-API design preview behavior only when runtime is not strict.

## AI Agent Responsibilities

- Coordinator keeps root/main read-only and performs edits only in the assigned worktree.
- Implementation worker owns only the touch list and must not revert unrelated work.
- Implementation worker must use existing approved API contracts before adding files or behavior.
- Spec compliance reviewer must verify strict runtime does not show synthetic support rows, candidates or nav counts.
- Code quality reviewer must verify React/runtime behavior, unsupported-action handling and test coverage.

## Source Of Truth

- `AGENTS.md`
- `UZMAX智能运营系统-PRD-v1.1.md` REQ-T01, REQ-T02, REQ-T06 and data-truth principles.
- `UZMAX智能运营系统-技术架构-v1.1.md` admin as pure API client and DTO/contract boundaries.
- `UZMAX智能运营系统-后台设计与前端架构-v1.1.md` conversation/ticket/confirmation queue states.
- `UZMAX智能运营系统-1.0验收矩阵-v1.1.md` B-02, B-04, D-01, H-01, I-01, J-05.
- `docs/admin-design-system.md` and project Impeccable product register.
- Existing runtime closure specs: `M10-01`, `M10-02`, `M10-03`, `M10-05`.
- Existing visible UI specs: `M7-UI-21`, `M7-UI-63`, `M7-UI-64`.

## Current Repo Facts

| Fact | Evidence |
|---|---|
| Conversation page already creates a `conversation-ticket` API client from selected tenant. | `apps/admin/src/pages/conversations/conversationWorkbenchRuntime.ts` uses `createConversationClient(createAdminRuntimeFetcher(config, { selectedTenantId }))`. |
| Unauthenticated live staging shows `API session required`; conversation rows are not successfully runtime-backed. | Live screenshot on 2026-07-09 shows staging access panel and conversation page loading/empty/degraded context. |
| Ticket page is still M7 synthetic UI. | `apps/admin/src/pages/tickets/TicketsPage.tsx` initializes `ticketRecords`, sets `data-runtime-state="degraded"` and has no API client. |
| Ticket tests still protect the mock state. | `apps/admin/tests/m7-ui-ticket-page.spec.ts` asserts `degraded`, `mock`, `not production ticket data` and `6 tickets`. |
| Confirmation queue fills fallback candidates on API empty/error/permission. | `apps/admin/src/pages/queue/QueueSupport.tsx` sets `fallbackItems` on empty/catch; live screenshot shows `status 404` followed by mock/degraded cards. |
| Support nav counts are static. | `apps/admin/src/shell/AppShellNavigation.tsx` hard-codes `tenant.conversations: 7`, `tenant.tickets: 3`, `tenant.queue: 9`. |

## Scope

- Wire `tenant.tickets` to existing approved `conversation-ticket` API paths:
  - `GET /conversation-ticket/conversations`
  - `GET /conversation-ticket/conversations/:conversationId`
  - `POST /conversation-ticket/tickets/:ticketId/actions`
- Use conversation details to aggregate returned `tickets`; do not add a backend ticket-list endpoint in this slice.
- Map runtime tickets into the existing ticket layout where data exists.
- Render true strict-runtime loading/empty/permission/error states when no runtime ticket data is available.
- Disable or clearly block unsupported ticket actions that have no approved API contract, such as transfer to a specific teammate.
- Make confirmation queue use the configured admin runtime fetcher and selected tenant; in strict runtime, empty/error/permission must not inject `fallbackItems`.
- Remove hard-coded support nav badge counts unless they come from runtime truth.
- Update focused Node/Playwright/static tests for the above behavior.
- Record evidence for validation.

## Out Of Scope

- No backend, schema, migration, generated client, worker, cron, package/lock or CI changes.
- No new ticket-list API route.
- No confirmation queue persistence/API repair for the 404 itself; if the configured API still returns 404, the UI must show real error/empty state without fake candidates.
- No production release, GA approval, real credential/token handling or owner acceptance.
- No LLM prompt/model/persona/eval gate changes.
- No broad visual redesign beyond the state/connection repairs needed for runtime truth.

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：

  - `docs/specs/M10-06-support-runtime-ui-truth.md`
  - `docs/evidence/M10/M10-06-support-runtime-ui-truth.md`
  - `apps/admin/src/pages/PageOutlet.tsx`
  - `apps/admin/src/pages/conversations/ConversationsPage.tsx`
  - `apps/admin/src/pages/tickets/TicketsPage.tsx`
  - `apps/admin/src/pages/tickets/TicketHtml.ts`
  - `apps/admin/src/pages/tickets/ticketFallback.ts`
  - `apps/admin/src/pages/tickets/ticketLocalActions.ts`
  - `apps/admin/src/pages/tickets/ticketRuntime.ts`
  - `apps/admin/src/pages/queue/QueuePage.tsx`
  - `apps/admin/src/pages/queue/QueueRuntime.ts`
  - `apps/admin/src/pages/queue/QueueSupport.tsx`
  - `apps/admin/src/pages/queue/queueFallback.ts`
  - `apps/admin/src/shell/AppShellNavigation.tsx`
  - `apps/admin/tests/m7-ui-ticket-page.spec.ts`
  - `apps/admin/tests/m7-ui-confirmation-queue-visible-parity.spec.ts`
  - `apps/admin/tests/m7-ui-98-sidebar-category-collapse-parity.spec.ts`
  - `apps/admin/tests/m7-ui-conversation-workbench.spec.ts`
  - `scripts/tests/m9-admin-staging-runtime-closeout.test.mjs`
  - `scripts/tests/m10-support-operator-smoke.test.mjs`
  - `scripts/tests/m10-support-runtime-ui-truth.test.mjs`

Read-only anchors:

- `AGENTS.md`
- `docs/specs/M10-02-admin-conversation-runtime-truth-gate.md`
- `docs/specs/M7-UI-21-ticket-page.md`
- `docs/specs/M7-UI-63-confirmation-queue-visible-parity.md`
- `apps/api/src/conversation-ticket.controller.ts`
- `apps/api/src/conversation-ticket.service.ts`
- `apps/api/src/confirmation-queue.controller.ts`

## Change Budget

- Source: changed source files <= 11, new source files <= 3, net source LOC target <= 850.
- Test: changed/added test files <= 5.
- Docs/evidence: this spec and one M10 evidence file.
- Config/lock/generated/backend/CI: none.
- Exceptions: none.

## Acceptance

- In strict runtime, `tenant.tickets` does not render `ticketRecords`, `ticketFallbackMeta`, `T-1042`, `T-1039`, `6 tickets`, `degraded mock` or `not production ticket data`.
- In strict runtime, `tenant.tickets` lists only tickets returned by `conversation-ticket` detail responses.
- Runtime ticket claim/note/close actions call `POST /conversation-ticket/tickets/:ticketId/actions` with approved action bodies.
- Unsupported ticket transfer does not fake a runtime mutation.
- In strict runtime, confirmation queue empty/error/permission states do not render `fallbackItems`, `mock-degraded-normal`, `mock-degraded-conflict`, `mock/degraded read-only` candidate cards or fake queue metrics.
- Confirmation queue uses the configured admin runtime fetcher and selected tenant.
- Support nav no longer shows hard-coded support counts.
- Local no-API non-strict design preview can still render M7 synthetic visual parity where existing tests depend on it.
- Focused validation proves strict-runtime no-fallback behavior.

## Failure Branches

- If the configured API returns 401/403, show permission state and keep actions disabled.
- If the configured API returns 404/500/network error, show error state and keep actions disabled.
- If `conversation-ticket` detail returns no tickets, show empty state; do not synthesize tickets.
- If a ticket action returns an error, surface the error and keep the pre-action runtime state until reload succeeds.
- If confirmation queue API is not deployed, show error/empty state; do not backfill fake candidates.

## Start Audit

| Fact | Evidence |
|---|---|
| assigned worktree | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/m10-06-support-runtime-truth` |
| assigned branch | `codex/m10-06-support-runtime-truth` |
| preflight `pwd` | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/m10-06-support-runtime-truth` |
| preflight status | `## codex/m10-06-support-runtime-truth...origin/main` |
| preflight current branch | `codex/m10-06-support-runtime-truth` |
| root/main checkout | coordination only; source edits forbidden there |
| Impeccable context | product register: calm, exacting, operational; status/evidence over impression |

## Validation

Required focused validation:

- `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node --test scripts/tests/m10-support-runtime-ui-truth.test.mjs`
- `git diff --check origin/main...HEAD`
- `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M10-06-support-runtime-ui-truth.md --include-worktree`

Where dependencies are available:

- `npm run typecheck`
- `npm run lint`
- `npm run build:admin`
- focused Playwright for ticket and confirmation queue strict-runtime behavior
