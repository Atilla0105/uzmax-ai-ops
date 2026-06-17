# M2-01 Channel Conversation DB Contracts Foundation

> evidence_id: M2-01-channel-conversation-db-contracts-foundation
> milestone: M2
> spec: `docs/specs/M2-01-channel-conversation-db-contracts-foundation.md`
> status: implemented_pending_pr_review
> created_at: 2026-06-17
> updated_at: 2026-06-17
> sensitive_data_location: none
> redaction_status: no raw customer data, Telegram payloads, screenshots, voice transcripts, order IDs, phone numbers, addresses, payment data, or support personal accounts

## Scope

This evidence records only the M2-01 DB/contracts foundation for channel, conversation, message, and ticket tables.

Included:

- Prisma model/table mapping for `channel_connection`, `telegram_update_dedupe`, `conversation`, `message`, `ticket`, and `ticket_event`.
- SQL migration `0003_channel_conversation_ticket_foundation.sql` with tenant scope, forced RLS, fail-closed policies, and no delete runtime grant.
- DB contract exports for table names, status values, and pure conversation/message/ticket builders.
- Contracts README update and focused test coverage.

Not included:

- Bot webhook runtime, Telegram Business feasibility/schema, conversation API, admin UI, worker queue, WS, LLM, prompts, customer asset center, order/customer assets, distill, production traffic, or raw payload/customer samples.

## TDD Evidence

| Step | Command | Result | Summary |
|---|---|---|---|
| RED | `node --test scripts/tests/m2-channel-conversation-foundation.test.mjs` | failed as expected | 4 failures: missing Prisma M2 models, missing `0003` migration, missing DB contract exports, and missing contracts README section |
| GREEN | `node --test scripts/tests/m2-channel-conversation-foundation.test.mjs` | passed | 4/4 tests passed after schema/migration/contracts/docs implementation |

## Prisma Validate Evidence

| Command | Result | Summary |
|---|---|---|
| `npm exec --workspace @uzmax/db -- prisma validate --schema prisma/schema.prisma` | failed due environment | Prisma P1012: environment variable `UZMAX_RLS_DATABASE_URL` not found |
| `UZMAX_RLS_DATABASE_URL=postgresql://user:pass@localhost:5432/db npm exec --workspace @uzmax/db -- prisma validate --schema prisma/schema.prisma` | passed | Prisma reported schema is valid |

## Acceptance Mapping

| Item | M2-01 status | Notes |
|---|---|---|
| C-01 | foundation_queued_not_closed | `channel_connection` and `telegram_update_dedupe` are ready for later Bot ingress/dedupe spec |
| C-02 | foundation_queued_not_closed | Edge behavior remains M2-02 runtime/API work |
| C-06 | foundation_queued_not_closed | Handoff/cancel behavior remains M2-03 |
| D-01 | foundation_queued_not_closed | Admin filters/states remain M2-04 |
| D-02 | foundation_queued_not_closed | Handoff/ticket API, summary, SLA, notification remain M2-03 |
| D-03 | foundation_queued_not_closed | Claim/lock/note/escalate/close/reopen workflows remain M2-03/M2-04 |
| I-04 | foundation_queued_not_closed | WS/realtime or degraded evidence remains M2-05 |
| J-05 | foundation_updated | This manifest records the M2-01 contract foundation |
| K-03 | active | One spec / one PR |
| K-04 | active | DB schema was treated as the serial point |

## Boundary Review

- No `business_connection` table or Business-specific claim was added; SPK-01 / ADR-B01 remains the Business feasibility path.
- No customer/customer identity/customer asset/order/quote/knowledge/eval/distill schema was added.
- All new tenant-scoped tables include `org_id`, `tenant_id`, tenant FK, forced RLS, fail-closed context checks, and select/insert/update runtime grants only.
- No delete grant was added for M2 runtime role.
