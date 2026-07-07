# M8-02 DB-Backed Conversation Ticket API

Spec ID: M8-02
Status: `db_backed_conversation_ticket_api_in_progress`
Owner confirmation point: project owner requested that internal staff can see the real Bot conversation, inbound/outbound messages and failed handoff tickets in the backend instead of synthetic/local-only rows. Project owner still decides real customer traffic, production deploy, credentials and release.
Timebox: narrow implementation PR.

## Spec 类型

feature

## Goal

Make the existing `/conversation-ticket` backend API read the rows written by the worker runtime:

1. `GET /conversation-ticket/conversations` can list DB `conversation` rows for the selected tenant.
2. `GET /conversation-ticket/conversations/:id` can return DB conversation detail plus `message` rows and current `ticket` rows/events.
3. The existing admin workbench client can consume the API without a frontend rewrite.
4. The API preserves access-context and permission checks.
5. Local/dev can keep in-memory mode, while focused tests and later runtime wiring can opt into RLS Prisma gateway mode through an injected Prisma client/runner.

This slice is the backend readback half of the Bot closed loop. It does not implement UI redesign or worker answer logic.

## Current Repo Facts

- Worker runtime already writes `conversation`, `message`, `ticket`, `ticket_event` and `telegram_update_dedupe` rows.
- `apps/api/src/conversation-ticket.service.ts` currently reads from `InMemoryConversationTicketRepository`.
- `apps/admin/src/pages/conversations/conversationWorkbenchClient.ts` already calls `/conversation-ticket/conversations` and `/conversation-ticket/conversations/:id`.
- If the API returns DB-backed JSON, the admin route does not need a UI rewrite for this readback slice.

## Scope

- Add a DB-backed repository implementation in `apps/api/src/conversation-ticket.repository.ts`.
- Add a provider seam so API can keep `in_memory` by default and use `rls_prisma_gateway` when a Prisma client/runner is explicitly wired.
- Wire `apps/api/src/app.module.ts` to the provider without changing route/controller shapes.
- Keep existing service permission checks and response shapes.
- Add focused tests for DB row mapping, tenant scoping, messages and tickets.
- Add M8-02 evidence with exact validation and remaining live-test boundary.

## Out Of Scope

- Worker answer-or-handoff runtime and Telegram outbound adapter. That is M8-01.
- Admin UI redesign, prototype parity or fixture cleanup.
- DB schema, migration, generated Prisma client or RLS policy changes.
- Real Telegram token, production webhook, real customer data, real provider keys or release approval.
- Mutating ticket workflow beyond preserving current handoff/action behavior where already supported.

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：

  - `docs/specs/M8-02-db-backed-conversation-ticket-api.md`
  - `docs/evidence/M8/M8-02-db-backed-conversation-ticket-api.md`
  - `apps/api/src/conversation-ticket.db-mappers.ts`
  - `apps/api/src/conversation-ticket.repository.ts`
  - `apps/api/src/conversation-ticket.service.ts`
  - `apps/api/src/app.module.ts`
  - `apps/api/scripts/runtime-compiler.mjs`
  - `scripts/tests/m8-db-backed-conversation-ticket-api.test.mjs`

Read-only anchors:

- `AGENTS.md`
- `apps/api/src/conversation-ticket.controller.ts`
- `apps/api/src/conversation-ticket.types.ts`
- `apps/admin/src/pages/conversations/conversationWorkbenchClient.ts`
- `apps/admin/src/pages/conversations/conversationWorkbenchRuntime.ts`
- `apps/worker/src/conversation-runtime.ts`
- `packages/db/prisma/schema.prisma`
- `apps/api/src/ai-member-runtime.repository.ts`

## Change Budget

- Source: up to 5 changed/new files, net source LOC target <= 600.
- Test: 1 new focused test.
- Docs/evidence: this spec plus one evidence file.
- Generated, migration, schema, lock, CI/config: none.
- Exceptions: none.

## Acceptance

- Focused test proves DB repository maps `ChannelConversation` rows to existing conversation list shape.
- Focused test proves detail endpoint/repository includes inbound and outbound `ChannelMessage` rows in chronological order.
- Focused test proves open `SupportTicket` rows and events are surfaced for failed/handoff conversations.
- Focused test proves tenant B cannot read tenant A rows through the repository access context.
- AppModule keeps existing in-memory behavior for local fallback; repository-level RLS Prisma gateway can be exercised through explicit injected client/runner wiring.
- No admin frontend rewrite is required for the API readback path.

## Failure Branches

- If mapping requires schema/RLS/generated changes, stop and split a DB-serial spec.
- If existing admin response shape cannot represent DB rows, add minimal mapper fields only; do not redesign UI.
- If ticket mutations cannot be made DB-backed safely in this slice, keep reads DB-backed and clearly record mutation fallback as follow-up.
- If real customer data or production DB access is needed for validation, stop and request owner-approved internal test boundary.

## Start Audit

| Fact | Evidence |
|---|---|
| assigned worktree `pwd` | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m8-02-db-backed-conversation-ticket-api` |
| assigned status before edits | `## codex/m8-02-db-backed-conversation-ticket-api` |
| assigned branch | `codex/m8-02-db-backed-conversation-ticket-api` |
| base | `4119f17` |

## Validation

Required focused validation:

- `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" pnpm run lint -- apps/api/src/conversation-ticket.db-mappers.ts apps/api/src/conversation-ticket.repository.ts apps/api/src/conversation-ticket.service.ts apps/api/src/app.module.ts scripts/tests/m8-db-backed-conversation-ticket-api.test.mjs`
- `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node --test scripts/tests/m8-db-backed-conversation-ticket-api.test.mjs`
- `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M8-02-db-backed-conversation-ticket-api.md --include-worktree`
- `git diff --check`
