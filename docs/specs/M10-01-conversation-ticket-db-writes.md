# M10-01 Conversation Ticket DB Writes

Spec ID: M10-01
Status: `in_progress`
Owner confirmation point: project owner assigned Worker M10-01 to make DB-backed `conversation-ticket` mode persist existing service write paths for the support workbench. Project owner still decides release, production/staging actions, credentials, real customer data and live network use.
Timebox: narrow worker implementation PR.

## Spec 类型

feature

## Goal

Make `ConversationTicketService.createHandoffTicket(...)` and `ConversationTicketService.applyTicketAction(...)` work when `UZMAX_CONVERSATION_TICKET_REPOSITORY_MODE=rls_prisma_gateway`.

Acceptance target:

1. DB-backed repository updates existing conversations to the handoff/suspended state needed by the service.
2. DB-backed repository upserts ticket row state and persists newly appended ticket events.
3. Existing in-memory repository behavior remains unchanged.
4. Missing `UZMAX_RLS_DATABASE_URL` continues to fail closed.
5. No schema, migration, generated client, lockfile, admin UI, worker, cron, CI, hosting, real token, real DB URL, real customer data, live network or production action.

## AI Agent Responsibilities

- Re-read `AGENTS.md`, M8-02 spec/evidence, current repository/mappers/service/types, handoff contract, DB schema/migration sections and M8/M2 tests before edits.
- Create this spec and the M10 evidence file before source edits.
- Keep all edits inside the touch list.
- Preserve existing in-memory behavior and M8-02 readback behavior.
- Add focused fake-Prisma tests for DB write paths and tenant scoping.
- Run the requested validation where available and record exact results.
- Commit only allowed files.

## Preconditions

- Assigned worktree: `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m10-01-conversation-ticket-db-writes`
- Assigned branch: `codex/m10-01-conversation-ticket-db-writes`
- Forbidden checkout for edits: `/Users/atilla/Applications/UZMAX智能运营`
- `packages/db` schema/migrations are read-only in this slice.
- Fake Prisma/local Node tests only; no real DB/network.

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：

- `docs/specs/M10-01-conversation-ticket-db-writes.md`
- `docs/evidence/M10/M10-01-conversation-ticket-db-writes.md`
- `apps/api/src/conversation-ticket.repository.ts`
- `apps/api/src/conversation-ticket.db-mappers.ts`
- `packages/capabilities/handoff/src/index.ts`
- `packages/db/scripts/run-m10-conversation-ticket-actions-true-db-smoke.mjs`
- `packages/db/scripts/tests/run-m10-conversation-ticket-actions-true-db-smoke.mjs`
- `scripts/tests/m8-conversation-ticket-api-fixture.mjs`
- `scripts/tests/m8-db-backed-conversation-ticket-api.test.mjs`
- `scripts/tests/m10-conversation-ticket-actions-true-db-smoke.test.mjs`

## Change Budget

- Source/scripts: up to 5 changed/new source or smoke-runner files, net source LOC target <= 600.
- Tests: up to 4 changed/new test/helper files, no assertion weakening/deletion.
- Docs/evidence: this spec plus one M10 evidence file.
- Generated, migration, schema, package/lock, admin UI, worker, cron, CI/config: none.
- Exceptions: none.

## `rg` Conclusion

- `rg -n "saveConversation|saveTicket|toTicket|TicketEvent|supportTicketEvent|supportTicket\\." apps/api/src scripts/tests packages/capabilities/handoff/src` shows the existing repository port already owns `saveConversation`/`saveTicket`, in-memory mode already implements them, and the RLS repository currently throws read-only errors.
- Explorer read-only findings confirm migration `0003` already grants select/insert/update on `conversation`, `ticket`, and `ticket_event`; no schema/migration/generated change is required.
- Existing repo write gateways use Prisma compound `id_orgId_tenantId` keys for scoped updates, so M10-01 should mirror that pattern.
- Existing DB ticket read mapping lives in `apps/api/src/conversation-ticket.db-mappers.ts`; extending that mapper is the correct narrow home for ticket row/event write mapping.
- No new source file is needed.

## Implementation Steps

1. Extend the repository Prisma port only for the mutation delegates needed by existing service writes.
2. Implement `RlsPrismaConversationTicketRepository.saveConversation(conversation)` as a scoped update of existing conversation fields only: `status`, `unreadCount`, and `lastMessageAt` where present.
3. Add optional `id?: string` to `TicketEvent`; map DB event IDs back into domain events and use missing IDs as the narrow identity for newly appended events.
4. Implement `RlsPrismaConversationTicketRepository.saveTicket(ticket)` as scoped ticket upsert/update plus insertion of newly appended ticket events without IDs, followed by DB readback.
5. Add small mapper helpers for ticket row data, event row data, and enum mapping from domain values to DB enum names.
6. Extend the fake Prisma M8 test to cover DB-backed create handoff, tenant-B write/readback denial, representative action persistence, in-memory behavior and fail-closed behavior.
7. Add a true DB smoke runner if it remains a clean small fit: require `UZMAX_RLS_DATABASE_URL`, seed synthetic org/tenant/channel/conversation only, run service in `rls_prisma_gateway`, execute handoff plus claim/note/close/reopen, assert same-tenant readback, wrong-tenant denial, cleanup and residue=0 without printing DB URL/token/customer text.
8. Record close destination/result only in event payload when available; do not add schema or invent row columns.

## Pass Conditions

- Focused M8 DB-backed test proves `createHandoffTicket` persists conversation pending-handoff semantics, a ticket row, and a created event through fake Prisma.
- Focused M8 DB-backed test proves tenant B cannot write/read tenant A conversation or ticket.
- Focused M8 DB-backed test proves representative ticket actions persist row state and newly appended events.
- Optional true DB smoke script is present and fail-closed without `UZMAX_RLS_DATABASE_URL`, or evidence records it as the next required acceptance blocker if scope becomes too large.
- Existing in-memory default and missing DB URL fail-closed behavior remain covered.
- Requested validation commands pass or exact dependency blockers are recorded.
- `git diff --check` passes.

## Failure Branches

- If write persistence requires schema/RLS/generated client changes, stop and split a DB-serial spec.
- If action persistence requires broad service/controller API redesign outside the allowed files, stop and report the gap.
- If full atomic handoff requires a larger repository/service transaction seam than fits M10-01, preserve the current service contract and record residual risk instead of a broad redesign.
- If dependency resolution is blocked by missing `node_modules`, use the root checkout runtime path only for reads/execution without writing generated artifacts into the repo, and record the blocker.
- If a real DB URL, token, customer data, staging/prod action or network is required, stop and request owner approval.

## Out Of Scope

- DB schema, migration, generated Prisma client or RLS policy changes.
- Admin UI/runtime changes.
- Worker, cron, CI, Render/Vercel or staging smoke changes.
- Handoff capability behavior broadening or SLA calculations.
- Real credentials, real DB URL, live network, production/staging mutation or real customer data.

## Acceptance Mapping

| Requirement | Evidence |
|---|---|
| `createHandoffTicket` works in `rls_prisma_gateway` | `scripts/tests/m8-db-backed-conversation-ticket-api.test.mjs` DB write test |
| `applyTicketAction` persists ticket state/events in DB mode | `scripts/tests/m8-db-backed-conversation-ticket-api.test.mjs` action persistence assertions |
| in-memory behavior unchanged | existing M2 contract test plus focused M8 in-memory/fallback assertions |
| fail-closed DB URL behavior preserved | focused M8 provider assertion |
| no out-of-scope files/actions | `git diff --name-only`, `pr-shape`, evidence boundaries |
