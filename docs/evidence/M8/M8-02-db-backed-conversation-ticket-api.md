# M8-02 DB-Backed Conversation Ticket API Evidence

Spec: `docs/specs/M8-02-db-backed-conversation-ticket-api.md`
Branch: `codex/m8-02-db-backed-conversation-ticket-api`
Worktree: `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m8-02-db-backed-conversation-ticket-api`

## Start Audit

| Check | Result |
|---|---|
| `pwd` | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m8-02-db-backed-conversation-ticket-api` |
| `git status --short --branch` | `## codex/m8-02-db-backed-conversation-ticket-api`; pre-existing untracked `docs/specs/M8-02-db-backed-conversation-ticket-api.md` observed before edits |
| `git branch --show-current` | `codex/m8-02-db-backed-conversation-ticket-api` |

## Implementation

- `apps/api/src/conversation-ticket.repository.ts`
  - Kept `InMemoryConversationTicketRepository` as the default local fallback.
  - Added `ConversationTicketRepositoryPort`, `CONVERSATION_TICKET_REPOSITORY`, env runtime mode parsing, RLS transaction runner, and `RlsPrismaConversationTicketRepository`.
  - DB read paths scope every query by `{ orgId, tenantId: accessContext.selectedTenantId }`.
- `apps/api/src/conversation-ticket.db-mappers.ts`
  - DB conversations map to existing `HandoffConversation` shape.
  - DB messages map to existing `ConversationMessage` shape and sort by `occurredAt`.
  - DB support tickets/events map to `TicketState` and event shape for readback.
- `apps/api/src/conversation-ticket.service.ts`
  - Constructor now depends on the repository port.
  - Existing permission checks remain in service methods.
  - Conversation detail now returns `conversation`, `messages`, and `tickets`.
- `apps/api/src/app.module.ts`
  - Wires `ConversationTicketService` through the repository token.
  - Defaults to `in_memory`.
  - Leaves direct Prisma client construction as follow-up dependency wiring; this slice validates the RLS Prisma gateway through injected client/runner seams.
- `scripts/tests/m8-db-backed-conversation-ticket-api.test.mjs`
  - Uses fake Prisma delegates only; no network and no real DB.
  - Covers env provider fallback/fail-closed behavior, RLS transaction settings, conversation list filters, conversation detail readback pieces, message ordering, ticket/event mapping, and tenant isolation.

## Validation

Lint command:

```bash
PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" pnpm run lint -- apps/api/src/conversation-ticket.db-mappers.ts apps/api/src/conversation-ticket.repository.ts apps/api/src/conversation-ticket.service.ts apps/api/src/app.module.ts scripts/tests/m8-db-backed-conversation-ticket-api.test.mjs
```

Result: pass.

Focused command:

```bash
PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node --test scripts/tests/m8-db-backed-conversation-ticket-api.test.mjs
```

Result:

```text
tests 2
pass 2
fail 0
```

Additional checks:

| Command | Result |
|---|---|
| `git diff --check` | passed |
| `node --check scripts/tests/m8-db-backed-conversation-ticket-api.test.mjs` with the Codex Node runtime | passed |
| `rg -n "[ \t]+$" ...changed files...` | no trailing whitespace |
| `node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M8-02-db-backed-conversation-ticket-api.md --include-worktree` with the Codex Node runtime | passed: `changedFiles=7`, source `changedFiles=4`, source `netLoc=507`, source `newFiles=1`, categories `source=4/docs=2/test=1` |

## Boundaries And Risks

- No admin UI changes.
- No schema, migration, generated Prisma client or lockfile changes.
- No real customer data, real Telegram token, production DB, network, or provider key touched.
- DB-backed repository is read-only for M8-02. Existing handoff/action mutation behavior remains supported in `in_memory`; DB persistence for ticket mutations is a follow-up slice.
- AppModule true DB/RLS smoke remains blocked until owner-approved internal database URL plus an API-owned Prisma dependency/wiring slice are provided.
