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
- Explorer A recommended optional `TicketEvent.id` for event identity. This slice adopts that narrow domain field and inserts only events without IDs.
- `ConversationTicketService.createHandoffTicket(...)` still calls `saveConversation` and `saveTicket` separately. Full atomic handoff would require a broader repository/service transaction seam; this is recorded as residual risk unless a narrow solution emerges inside M10-01.

## Implementation

- `packages/capabilities/handoff/src/index.ts`
  - Added optional `TicketEvent.id?: string` so DB readback can carry persisted `ticket_event.id`.
  - Kept new domain events id-less; `nextTicket` behavior is otherwise unchanged.
- `apps/api/src/conversation-ticket.db-mappers.ts`
  - Maps DB `ticket_event.id` back into `TicketEvent.id`.
  - Added small helpers for conversation update data, ticket create/update data and ticket event create data.
  - Maps domain enum values to Prisma enum values and stores close destination/result only in closed-event payload when available.
- `apps/api/src/conversation-ticket.repository.ts`
  - Extended the Prisma client port only for `channelConversation.update`, `supportTicket.upsert` and `supportTicketEvent.create`.
  - Implemented DB-backed `saveConversation` with scoped `id_orgId_tenantId` update of `status`, `unreadCount` and `lastMessageAt` when present.
  - Implemented DB-backed `saveTicket` with scoped ticket upsert, insertion of events without IDs only, and same-transaction event readback.
  - Preserved `in_memory` repository behavior.
- `scripts/tests/m8-db-backed-conversation-ticket-api.test.mjs`
  - Fake Prisma now supports the mutation delegates needed by the DB repository.
  - Added service-level DB-mode coverage for handoff creation, tenant-B denial, claim/lock/note/close/reopen persistence and event-id dedupe.
- `scripts/tests/m8-conversation-ticket-api-fixture.mjs`
  - Extracted the fake Prisma fixture and shared test constants so the M8 test remains under the project `max-lines` guard after Prettier formatting.
- `packages/db/scripts/run-m10-conversation-ticket-actions-true-db-smoke.mjs`
  - Added disabled-by-env true DB smoke wrapper.
- `packages/db/scripts/tests/run-m10-conversation-ticket-actions-true-db-smoke.mjs`
  - Requires `UZMAX_RLS_DATABASE_URL`.
  - Seeds fixed synthetic org/tenant/channel/conversation rows only.
  - Runs repository/service in `rls_prisma_gateway`, executes handoff plus claim/lock/note/close/reopen, asserts same-tenant readback, wrong-tenant denial and residue=0 cleanup.
  - Prints no DB URL, token or customer payload.
- `scripts/tests/m10-conversation-ticket-actions-true-db-smoke.test.mjs`
  - Verifies smoke script anchors and fail-closed behavior when `UZMAX_RLS_DATABASE_URL` is absent.

## Validation

Initial requested command without local dependency workaround:

```bash
PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node --test scripts/tests/m8-db-backed-conversation-ticket-api.test.mjs
```

Result: blocked by missing worktree-local `typescript` for `apps/api/scripts/runtime-compiler.mjs`.

Dependency workaround:

- Root checkout has `/Users/atilla/Applications/UZMAX智能运营/node_modules/typescript`.
- `NODE_PATH` did not resolve ESM bare imports.
- Created temporary resolver `/tmp/uzmax-root-node-modules-loader.mjs` to resolve bare packages from root checkout `node_modules` while keeping `cwd` and generated runtime output in this assigned worktree.
- No root/main files were edited.

Focused DB-backed command:

```bash
NODE_OPTIONS="--experimental-loader=/tmp/uzmax-root-node-modules-loader.mjs" PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node --test scripts/tests/m8-db-backed-conversation-ticket-api.test.mjs
```

Result: pass, `tests=4`, `pass=4`, `fail=0`.

M10 smoke-definition command:

```bash
NODE_OPTIONS="--experimental-loader=/tmp/uzmax-root-node-modules-loader.mjs" PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node --test scripts/tests/m10-conversation-ticket-actions-true-db-smoke.test.mjs
```

Result: pass, `tests=1`, `pass=1`, `fail=0`.

Requested combined command plus M10 smoke-definition test:

```bash
NODE_OPTIONS="--experimental-loader=/tmp/uzmax-root-node-modules-loader.mjs" PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node --test scripts/tests/m2-conversation-ticket-api-contract.test.mjs scripts/tests/m2-conversation-ticket-api-http-hardening.test.mjs scripts/tests/m8-db-backed-conversation-ticket-api.test.mjs scripts/tests/m10-conversation-ticket-actions-true-db-smoke.test.mjs
```

Result: pass, `tests=13`, `pass=13`, `fail=0`.

Targeted lint:

```bash
node node_modules/eslint/bin/eslint.js eslint.config.mjs apps/api/src/conversation-ticket.db-mappers.ts apps/api/src/conversation-ticket.repository.ts packages/db/scripts/tests/run-m10-conversation-ticket-actions-true-db-smoke.mjs scripts/tests/m10-conversation-ticket-actions-true-db-smoke.test.mjs scripts/tests/m8-db-backed-conversation-ticket-api.test.mjs scripts/tests/m8-conversation-ticket-api-fixture.mjs
```

Result: pass after the M8 fixture extraction and repository interface tightening.

Guard:

```bash
NODE_OPTIONS="--experimental-loader=/tmp/uzmax-root-node-modules-loader.mjs" PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node scripts/guards/pr-shape.mjs --base main --spec docs/specs/M10-01-conversation-ticket-db-writes.md --include-worktree
```

Result: pass. Summary: `changedFiles=10`, categories `source=4`, `test=4`, `docs=2`, source `netLoc=156`.

Whitespace:

```bash
git diff --check
```

Result: pass.

## Boundaries And Risks

- No admin UI, schema, migration, generated Prisma client, package/lock, worker, cron, CI, Render/Vercel or staging/prod changes.
- No real token, real DB URL, real customer data, live network or production action.
- True DB smoke script was added and fail-closed behavior was verified without `UZMAX_RLS_DATABASE_URL`; live true DB smoke was not run because no owner-approved DB URL was provided in this worker turn.
- Atomicity residual risk: `ConversationTicketService.createHandoffTicket(...)` still calls `saveConversation` and `saveTicket` separately. The repository writes are individually scoped/RLS-transactional, but a ticket/event failure after conversation update could leave a partially updated handoff state. Closing that fully requires a broader service/repository transaction seam and should be handled by a follow-up spec unless owner accepts this residual risk for the current workbench path.
