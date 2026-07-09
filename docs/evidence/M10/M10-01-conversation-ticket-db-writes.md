# M10-01 Conversation Ticket DB Writes Evidence

Spec: `docs/specs/M10-01-conversation-ticket-db-writes.md`
Branch: `codex/m10-01-conversation-ticket-db-writes`
Worktree: `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m10-01-conversation-ticket-db-writes`

## Start Audit

| Check | Result |
|---|---|
| `pwd` | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m10-01-conversation-ticket-db-writes` |
| `git status --short --branch` | `## codex/m10-01-conversation-ticket-db-writes` |
| `git branch --show-current` | `codex/m10-01-conversation-ticket-db-writes` |

## Required Reads

- `AGENTS.md`
- `docs/specs/M8-02-db-backed-conversation-ticket-api.md`
- `docs/evidence/M8/M8-02-db-backed-conversation-ticket-api.md`
- `apps/api/src/conversation-ticket.repository.ts`
- `apps/api/src/conversation-ticket.db-mappers.ts`
- `apps/api/src/conversation-ticket.service.ts`
- `apps/api/src/conversation-ticket.types.ts`
- `packages/capabilities/handoff/src/index.ts`
- `packages/db/prisma/schema.prisma` around `ChannelConversation`, `SupportTicket`, `SupportTicketEvent`
- `packages/db/migrations/0003_channel_conversation_ticket_foundation.sql` around conversation/ticket/ticket_event RLS/grants
- `scripts/tests/m8-db-backed-conversation-ticket-api.test.mjs`
- `scripts/tests/m2-conversation-ticket-api-contract.test.mjs`

## Start Conclusions

- M8-02 already added DB-backed reads and deliberately left mutation persistence as a follow-up.
- `ConversationTicketService` already routes handoff/action writes through the repository port.
- `InMemoryConversationTicketRepository` already implements the service write paths.
- `RlsPrismaConversationTicketRepository.saveConversation` and `saveTicket` currently throw read-only errors.
- DB schema has `conversation.status`, `conversation.unread_count`, `conversation.last_message_at`, ticket state columns and `ticket_event.payload`; it has no `closeDestination` or `closeResult` ticket columns.
- Migration `0003` grants select/insert/update on `conversation`, `ticket`, and `ticket_event` to `uzmax_app_runtime`.
- M10-01 can close the write gap without schema/migration/generated changes.
