# M11-04B Atomic Close, Human Reopen And Explicit Bot Resume

Spec ID: M11-04B
Status: `approved_for_execution`
Owner confirmation point: on 2026-07-10 the project owner asked the AI agents to
complete the approved M11 Value-0 customer-service loop. M11-00 authorizes the
serial M11 slices, and M11-04A explicitly leaves this atomic lifecycle slice to
M11-04B.
Timebox: one API lifecycle slice; stop after close, human reopen and explicit
Bot resume pass focused, full-repository and true-PostgreSQL/worker race gates.

## Spec 类型

feature

## Split Decision

M11-04A closed the worker ownership/send race and is merged as
`5520bc7f4522b73d92d9c896e0a59888058deec7`. This serial M11-04B slice owns only:

1. atomic conversation + ticket close;
2. human reopen that keeps Bot suspended;
3. a separate authorized Bot-resume command that only makes the next new
   inbound Bot-eligible;
4. permission-aware lifecycle readiness and durable event/audit readback.

It does not own LLM accounting, operator reply/outbox, Telegram operator send,
admin controls or aligned-staging acceptance.

## Goal

Make the end of a human-support cycle truthful and safe:

1. closing a fully owned ticket writes a structured result/route and closes the
   conversation in the same tenant-scoped transaction;
2. close does not silently restore Bot handling;
3. reopening the latest closed ticket creates a new human-owned lifecycle state,
   not an AI-owned one;
4. only a distinct authorized resume command changes a safely quiescent closed
   conversation back to `OPEN`;
5. closed-period inbound is never replayed or silently skipped: it increments
   unread for an operator and blocks Bot resume until a human reopens, handles
   and closes the lifecycle again;
6. every successful Bot resume writes one `STATUS_CHANGED/bot_resumed` ticket
   event and one tenant-scoped `audit_log` row in the same transaction;
7. every close/reopen/resume command is bound to a client-stable request UUID
   and the exact server lifecycle-event anchor it observed, so a delayed old
   command cannot mutate a later lifecycle;
8. retry/race outcomes cannot produce `OPEN + active ticket`, duplicate
   lifecycle events, an old queued outbound in a new Bot epoch, or cross-tenant
   mutation.

`CLOSED` is an internal structured support result. It does not prove that the
customer's real-world problem was objectively solved or an external transfer
completed.

## Source Of Truth

- `AGENTS.md`
- `docs/specs/M11-00-value0-customer-service-closure-contract.md`
- `docs/specs/M11-03A-conversation-customer-read-truth.md`
- `docs/specs/M11-03B-atomic-takeover-ticket-actions.md`
- `docs/specs/M11-04A-worker-ownership-send-fence.md`
- `UZMAX智能运营系统-PRD-v1.1.md` REQ-T02, REQ-C03 and REQ-T12
- `UZMAX智能运营系统-技术架构-v1.1.md` sections 4-6
- `UZMAX智能运营系统-后台设计与前端架构-v1.1.md` sections 4.1-4.2
- `UZMAX智能运营系统-1.0验收矩阵-v1.1.md` C-06 and D-03
- existing `conversation`, `message`, `ticket`, `ticket_event` and `audit_log`
  schema/RLS policies

## Current Unsafe Boundary

- `planTicketAction` rejects `close` and `reopen` unconditionally.
- the controller accepts the names but discards close `result/destination` and
  reopen `reason`.
- the API atomic writer locks and reads only non-closed tickets, so it cannot
  safely select or reopen closed history.
- `persistPlan` updates conversation state only when a takeover result exists;
  a future ticket action that changes the conversation would not persist it.
- close metadata is written to event payload by one mapper but is not restored
  into the read model, and `STATUS_CHANGED` is falsely mapped as `note_added`.
- there is no separate Bot-resume endpoint, queued-outbound quiescence check or
  same-transaction resume audit.
- the existing handoff capability's legacy ticket-only reopen cannot represent
  the required conversation + ticket + outbound + audit atomic boundary and
  must fail closed instead of remaining a parallel lifecycle writer.

## Owner And Data Boundary

- Existing owner authorization covers controlled staging, the approved Test Bot
  and test identity, the existing DeepSeek staging route, merge/CI work and one
  staging operator. This slice does not expand that authorization.
- Actor is only `AccessContext.userId`; org/tenant are only the authenticated
  selected scope.
- No owner email, token, DB URL, participant ref, message/profile plaintext,
  raw request or raw provider error may enter evidence, audit content or CI
  output.
- Bounded lifecycle reason/destination are tenant business records in
  `ticket_event`; the `audit_log` records only state metadata and whether a
  reason was supplied, not the reason text.
- Production, real customer/order data, Telegram Business, ADR-003 real-customer
  LLM approval, GA, 1.0, new paid infrastructure and a new permission model
  remain project-owner decisions outside this slice.

## AI Agent Responsibilities

- Work only in the assigned worktree/branch; root/main remains coordination-only.
- Keep `conversation-ticket.atomic-state.ts` the single lifecycle planner for
  in-memory and Prisma behavior; controller/UI may not recreate the matrix.
- Reuse the M11-03B/M11-04A conversation-first lock order and fixed
  `{ maxWait: 60_000, timeout: 60_000 }` transaction bounds.
- Keep external Telegram/LLM calls outside DB transactions. M11-04B resume itself
  performs neither call.
- Run spec compliance before code-quality/security/RLS review and archive exact
  local/CI truth before merge.

## Preconditions

- Base main:
  `5520bc7f4522b73d92d9c896e0a59888058deec7` (PR #303/M11-04A).
- Worktree:
  `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/m11-04b-close-resume`.
- Branch: `codex/m11-04b-close-resume`.
- Root/main and assigned worktree were clean and synchronized at creation.
- `git branch --no-merged main`, open PRs and extra worktrees were empty before
  this worktree was added.
- The assigned worktree recorded matching `pwd`, branch and base SHA and uses an
  independently copied `node_modules`.
- No schema, migration, deployment, production secret or real customer data is
  required.

## Existing-Implementation Search

`rg` found one lifecycle path to extend, not parallelize:

- HTTP/service/repository:
  `conversation-ticket.controller.ts`, `conversation-ticket.service.ts`,
  `conversation-ticket.repository.ts` and `conversation-ticket.types.ts`;
- authoritative planner/writer:
  `conversation-ticket.atomic-state.ts` and
  `conversation-ticket.atomic-writes.ts`;
- bounded read/write mapping:
  `conversation-ticket.db-mappers.ts` and
  `packages/capabilities/handoff/src/index.ts`;
- canonical audit contract and Prisma mapping: `packages/db/src/index.ts` and
  `apps/api/src/audit-log.prisma-sink.ts`;
- ownership/read readiness: `conversation-ticket.ownership.ts`;
- worker disposition and send fence:
  `conversation-runtime.ts`, `telegram-bot-conversation.flow.ts` and
  `telegram-bot-conversation.atomic-writes.ts`;
- focused fake/compiler and M10/M11 true-DB runners.

The schema already has `CLOSED`, `REOPENED`, `STATUS_CHANGED`, ticket-event JSON
payload, `closedAt` and `audit_log`; no migration is authorized.

`conversation-ticket.atomic-writes.ts` is already 383 nonblank lines. One new
source file is authorized:

- `conversation-ticket.outbound-fence.ts` extracts/refines the existing exact
  generating-AI cancellation and adds the all-origin `OUTBOUND/QUEUED` lock/read
  used by resume.

It remains a helper consumed by the existing atomic writer, not a second state
machine, repository, queue or provider adapter.

## 触碰模块/文件

- `docs/specs/M11-04B-atomic-close-reopen-bot-resume.md`
- `docs/evidence/M11/M11-04B-atomic-close-reopen-bot-resume.md`
- `.github/workflows/ci.yml`
- `apps/api/scripts/runtime-compiler.mjs`
- `apps/api/src/conversation-ticket.atomic-state.ts`
- `apps/api/src/conversation-ticket.atomic-writes.ts`
- `apps/api/src/conversation-ticket.outbound-fence.ts`
- `apps/api/src/conversation-ticket.controller.ts`
- `apps/api/src/conversation-ticket.db-mappers.ts`
- `apps/api/src/conversation-ticket.repository.ts`
- `apps/api/src/conversation-ticket.service.ts`
- `apps/api/src/conversation-ticket.types.ts`
- `packages/capabilities/handoff/src/index.ts`
- `packages/db/src/index.ts`
- `scripts/tests/m2-conversation-ticket-api-contract.test.mjs`
- `scripts/tests/m2-conversation-ticket-test-harness.mjs`
- `scripts/tests/m2-conversation-ticket-api-http-hardening.test.mjs`
- `scripts/tests/m8-conversation-ticket-api-fixture.mjs`
- `scripts/tests/m8-db-backed-conversation-ticket-api.test.mjs`
- `scripts/tests/m11-atomic-takeover.test.mjs`
- `scripts/tests/m11-conversation-lifecycle.test.mjs`
- `packages/db/scripts/tests/run-m10-conversation-ticket-actions-true-db-smoke.mjs`
- `packages/db/scripts/tests/run-m11-conversation-lifecycle-true-db-smoke.mjs`

## Read-only Anchors

- `apps/api/src/conversation-ticket.ownership.ts`
- `apps/api/src/audit-log.prisma-sink.ts`
- `apps/worker/src/conversation-runtime.ts`
- `apps/worker/src/telegram-bot-conversation.flow.ts`
- `apps/worker/src/telegram-bot-conversation.atomic-writes.ts`
- `packages/db/prisma/schema.prisma`
- `packages/db/migrations/0002_audit_config_version_foundation.sql`
- `packages/db/migrations/0003_channel_conversation_ticket_foundation.sql`
- `packages/db/scripts/tests/run-m11-atomic-takeover-true-db-smoke.mjs`
- `packages/db/scripts/tests/run-m11-worker-ownership-fence-true-db-smoke.mjs`
- `packages/db/scripts/tests/m8-active-answer-worker-smoke-support.mjs`

## Change Budget

- Source: changed source files <= 11, net source LOC <= 600, new source files <= 1.
- New source: only the outbound-fence extraction/refinement above. Every
  touched/new TypeScript runtime source must pass the repository ESLint
  `max-lines <= 400` rule as configured with blank/comment skipping;
  React/Nest ceilings still apply.
- Existing-baseline compiler allowance: `apps/api/scripts/runtime-compiler.mjs`
  is pr-shape `source` and starts at 581 nonblank lines on base `5520bc7`. It
  may receive only the module registration/import rewrite required for the new
  outbound helper and canonical audit mapper, must finish at <= baseline + 15
  nonblank lines, and remains counted in source/net totals. No unrelated
  refactor, reorder, formatter churn or second new source file is authorized.
- Test/support: changed files <= 9, new files <= 2; no deletion, skip/only,
  weakened assertion, broad mock or snapshot expansion.
- Config: one CI workflow edit.
- Docs: this spec and one evidence record.
- Schema/migration/generated/lock/deploy/provider adapter: none.
- Exceptions: only the measured existing-baseline compiler allowance above; no
  source-size, test-weakening or external-dependency exception.

## HTTP And Permission Contract

### Close and human reopen

`POST /conversation-ticket/tickets/:ticketId/actions` continues to require
`ticket:write`.

Close body is exactly the bounded business contract:

```ts
{
  type: "close";
  requestId: string; // client-stable UUID
  expectedLifecycleEventId: string; // exact current ticket-event UUID
  result:
    | "resolved"
    | "transferred_to_human_channel"
    | "no_response"
    | "invalid"
    | "duplicate";
  destination: string; // trimmed, required, <= 500; UI label is route/explanation
}
```

Reopen body is:

```ts
{
  type: "reopen";
  requestId: string; // client-stable UUID
  expectedClosedEventId: string; // exact latest CLOSED event UUID
  reason: string; // trimmed, required, <= 500
}
```

Unknown compatibility fields are ignored. Client actor, owner, lock owner,
status, result timestamps and `closedAt` are ignored. Validation is 400 before
mutation.

Every successful ticket action now returns:

```ts
{
  result: "applied" | "already_applied";
  conversation: HandoffConversation;
  ticket: TicketState;
}
```

Existing action clients remain compatible because `ticket` remains at the root.

### Explicit Bot resume

Add:

`POST /conversation-ticket/conversations/:conversationId/resume-bot`

It requires `conversation:read` plus `ticket:write`. Body is:

```ts
{
  requestId: string; // client-stable UUID
  expectedClosedEventId: string; // exact latest CLOSED event UUID
  reason: string; // trimmed, required, <= 500
}
```

The server selects and locks the latest complete closed lifecycle ticket; the
client cannot choose an old ticket. Success returns:

```ts
{
  result: "resumed" | "already_resumed";
  auditRef: string;
  conversation: HandoffConversation;
  ticket: TicketState;
}
```

`auditRef` is exactly `controlled://audit-log/{server-owned-audit-UUID}`. It is
a controlled reference to the tenant-scoped audit row, never its raw contents.

### Error semantics

- 400: invalid action/result/UUID, missing or overlong text.
- opaque 404: wrong tenant or missing conversation/ticket.
- opaque 409 with zero writes: reused request ID with non-exact command,
  expected-event mismatch, wrong state/owner, multiple/invalid active tickets,
  stale historical ticket, incomplete close history or lifecycle race loser.
- unread closed inbound and any queued outbound block only a first Bot-resume
  application. They do not block human reopen and they are evaluated after
  exact request replay, so an already-committed retry never clears unread or
  mutates a later state.
- authorization failure: 403 before repository mutation.

Action evaluation order is fixed: HTTP validation/auth; scoped not-found;
same-conversation request-ID replay; expected lifecycle-event token; action
state/history/owner/unread/queue matrix. A request ID is unique within one
conversation. One matching event with the same action, actor, target,
expected-event token and canonical payload returns the original no-op success;
any mismatch or multiple matching events is 409. A new request ID with a stale
expected-event token is 409 even when the current state and text happen to look
the same as an older lifecycle.

## Permission-aware Detail Readiness

`GET /conversation-ticket/conversations/:id` keeps the existing detail shape and
adds to `operatorState`:

- `canClose: boolean`;
- `canReopen: boolean`;
- `canResumeBot: boolean`.

Root `lifecycleReadiness` contains:

```ts
{
  close: "atomic_ready" | "permission_blocked" | "state_blocked";
  reopen: "atomic_ready" | "permission_blocked" | "state_blocked";
  resumeBot: "atomic_ready" | "permission_blocked" | "state_blocked";
  lifecycleTicketId?: string;
  lifecycleEventId?: string;
}
```

Missing `ticket:write` wins as `permission_blocked`; resume also requires
`conversation:read`, already required by detail. Readiness uses the same planner
predicates plus the read snapshot's queued outbound state. It is a hint only;
every POST revalidates under locks. For close, `lifecycleEventId` is the exact
latest event of the active owned ticket. For reopen/resume, it is the validated
latest `CLOSED` event of the selected closed ticket. Together with
`lifecycleTicketId`, it is the optimistic-concurrency token the client must
echo; it is not a substitute for `requestId`.

## Latest Closed Lifecycle Selection

- `CLOSED` tickets are inactive but remain immutable history until an explicit
  human reopen.
- Selection must not filter for completeness and then fall back to an older
  valid ticket. First collect every scoped `CLOSED` ticket. Zero candidates, or
  any candidate without server `closedAt`, is 409 because the current lifecycle
  cannot be selected safely.
- From those candidates, choose greatest `closedAt`; ticket ID descending is the
  deterministic tie-breaker. Only then validate that selected ticket.
- A complete selected lifecycle requires an assigned user and its latest
  `CLOSED` event. That event ID is the lifecycle anchor; its `occurredAt` must
  equal ticket `closedAt`, its actor must equal the assigned user, and its
  payload must contain `action="close"`, one allowed result, bounded required
  destination, request ID and expected prior event ID.
- Human reopen must target that exact latest ticket ID. Reopening older history
  is 409/zero-write.
- Bot resume accepts no ticket ID and uses that same server-selected candidate.
- A missing/malformed selected close event, mismatched time/actor or stale
  `expectedClosedEventId` is 409. It must never cause fallback to older history.
- Prior `CLOSED`, `REOPENED` and `STATUS_CHANGED` events are never deleted or
  rewritten.

## Atomic Close State Machine

Legal first application:

| Conversation | Ticket matrix | Actor | Outcome |
|---|---|---|---|
| `HANDOFF` | exactly one active `LOCKED` or `ESCALATED`, assignment and lock both actor | self | apply close |

First application also requires a unique `requestId` and
`expectedLifecycleEventId` equal to that ticket's exact latest event ID after
the conversation/ticket locks are held. Any intervening note/action makes the
token stale.

The one bounded RLS transaction:

1. sets runtime role and org/tenant scope;
2. locks the conversation;
3. locks active tickets plus target ticket in stable ID order;
4. locks exact generating AI-origin queued intents;
5. validates the full matrix and bounded close payload;
6. cancels only `OUTBOUND + QUEUED + telegram_bot_ai + generating` intents;
7. atomically sets conversation `CLOSED`, `aiState=suspended`,
   `unreadCount=0`; sets ticket `CLOSED`, preserves assignment, clears lock and
   sets server `closedAt`; inserts one `CLOSED` event;
8. reads conversation/ticket/events back before commit.

The event ID/time are server-owned; event `occurredAt` and ticket `closedAt`
are the same instant. It stores actor, `action="close"`, request ID, expected
lifecycle-event ID, allowed `result` and bounded `destination`. It contains no
message/profile/request body.

Claim-first M11-04A sends may complete once after close; finalization must not
overwrite `CLOSED`. Close-first cancels generating work and later worker claim
is suppressed. Close never claims it can retract an already provider-accepted
send.

A close retry whose request ID resolves to exactly that original actor, ticket,
expected-event token, result and destination returns `already_applied` and adds
no event/audit, even after later lifecycle state exists. Reused request ID with
different data, multiple matches, or a new request ID with stale anchor is 409.

## Atomic Human Reopen State Machine

Legal first application requires:

- conversation `CLOSED`;
- zero active tickets;
- target is the server-determined latest complete closed ticket and
  `expectedClosedEventId` equals its validated close-event anchor;
- unique request ID;
- bounded reason.

The transaction assigns the ticket to the authorized reopening actor, clears
its lock/current `closedAt`/current close summary, changes ticket to `REOPENED`,
changes conversation to `HANDOFF` with Bot suspended, preserves unread count,
and inserts one `REOPENED` event with actor/server time,
`action="reopen"`, request ID, expected closed-event ID and reason.

The prior close result/destination remain in the prior `CLOSED` event. The
reopener may be a different authorized operator because no active owner exists;
the assignment changes only inside this serialized transition. A subsequent
`lock` uses the existing `HANDOFF + REOPENED + same actor` path.

A reopen retry whose request ID resolves to exactly that original actor, target,
closed-event token and reason returns `already_applied` with no duplicate
event, regardless of later lifecycle state. Reused request ID with a mismatch,
multiple matches, or new request ID with stale anchor is 409. Reopen never
changes conversation to `OPEN`; unread/queued work does not block reopen.

## Explicit Bot Resume State Machine

First application requires all:

- conversation `CLOSED`;
- `unreadCount === 0`;
- zero active tickets;
- a latest complete closed lifecycle ticket whose assigned user is the actor;
- unique request ID and `expectedClosedEventId` equal to that lifecycle anchor;
- zero messages of any origin matching `OUTBOUND + QUEUED`.

The transaction uses the same lock order, additionally locks every scoped
queued outbound in stable ID order, then:

1. changes only the conversation lifecycle state to `OPEN`/Bot-active;
2. leaves the ticket `CLOSED`, assigned and historically complete;
3. inserts one `STATUS_CHANGED` ticket event with
   `action="bot_resumed"`, request ID, expected closed-event ID, bounded reason
   and an audit-log ID;
4. inserts one `audit_log` row with
   `eventType="conversation.bot_resumed"`, module `customer_support`,
   action `resume_bot`, object type/id, actor, server time and safe
   before/after state metadata;
5. reads state/events back before commit.

The atomic writer generates the audit UUID and uses that same UUID in the event,
database row and response. `packages/db/src/index.ts` adds only the canonical
`auditEventTypes.conversationBotResumed` token. The writer constructs the row
through `createAuditLogContract`/`toPrismaAuditLogCreateData`, adds its owned ID,
and calls the interactive transaction's `auditLog.create`; it must not bypass
the canonical contract or use a post-commit sink. Audit insertion failure rolls
the whole transition back. The audit content does not copy reason text; it
is exactly:

```ts
{
  before: {
    conversationStatus: "closed";
    lifecycleTicketId: string;
    lifecycleEventId: string;
    requestId: string;
  };
  after: {
    activeTicketCount: 0;
    botEligibility: "next_new_inbound";
    conversationStatus: "open";
  };
}
```

The ticket event is the bounded operational reason record. Audit/event
`occurredAt` use the same server instant; optional version/trace references are
absent.

Resume performs zero LLM/send, does not reopen the ticket, does not replay old
inbound and does not resurrect cancelled/failed/sent/uncertain messages. Only a
new inbound committed after resume may enter the existing M11-04A Bot path.

Any `OUTBOUND/QUEUED`, including generating, claimed, uncertain or future
operator outbox, blocks resume. It is not cancelled or retried by resume.

Before current state, unread or queued-work gates, an exact request-ID replay
must find one matching `STATUS_CHANGED/bot_resumed` event under the same
conversation and verify its referenced audit row under the same tenant/RLS
scope. The row must match ID, org/tenant, actor,
`eventType="conversation.bot_resumed"`, module `customer_support`, action
`resume_bot`, object type `conversation`, conversation object ID, request ID,
expected close-event ID and safe before/after states. Then it returns
`already_resumed` with the original `auditRef`, even if later unread, queued
work or valid Bot activity exists, and writes nothing. Missing/mismatched audit,
multiple request matches or non-exact command is 409; no unverified event JSON
may mint an `auditRef`.

## Closed Inbound And Unread Contract

- Close resets unread to zero because the closing operator is declaring the
  current lifecycle handled with a structured result.
- An inbound committed while conversation is `CLOSED` follows M11-04A:
  customer/message/dedupe persist once, unread increments once, and there is
  zero LLM/send/outbound/new ticket.
- If closed inbound wins before resume, unread is nonzero and resume returns
  409/zero-write.
- The operator must human-reopen, handle the pending inbound, lock/close again
  (which resets unread), then explicitly resume.
- If resume commits first, only the subsequent new inbound is Bot-eligible.

## Lock Order, RLS And Persistence

Every lifecycle write uses the existing fixed bounded interactive transaction:

1. `SET LOCAL ROLE uzmax_app_runtime` and set exact org/tenant settings;
2. scoped conversation `FOR UPDATE`;
3. every scoped ticket for that conversation locked in ID order, so active,
   closed history and conversation-wide request-ID matches share one boundary;
4. exact generating queued outbound locked for close, or every scoped
   `OUTBOUND/QUEUED` message locked in ID order for resume;
5. scoped ticket-event rows and any audit row referenced by an exact replay are
   read under the same RLS transaction;
6. retry, expected-event, state/history/owner/unread/queue validation;
7. conversation/ticket/event/audit writes;
8. scoped readback before commit.

No ticket/message is locked before its conversation. Wrong-tenant rows remain
invisible under explicit predicates and RLS. In-memory uses its existing mutex,
extends the seed/snapshot/commit state with tenant-scoped lifecycle audit rows,
and applies the same replay/audit verification. A successful resume stores the
canonical audit record; a focused test can preseed a missing/mismatched record
and prove 409 through public behavior. Returning an `auditRef` without a stored
and verifiable in-memory audit row is forbidden.

`persistPlan` must update conversation whenever the planned conversation state
differs, not only for takeover. Failed validation/audit discards the in-memory
snapshot and rolls back Prisma writes.

The exported legacy handoff capability is not a second lifecycle writer. Its
ticket-only `close` and `reopen` actions must fail closed with
`atomic_lifecycle_required`; only `conversation-ticket.atomic-state.ts` may plan
those actions. Existing non-lifecycle capability actions remain unchanged.

## Event And Readback Contract

- `TicketEvent` exposes optional bounded `action`, `requestId`,
  `expectedLifecycleEventId`, `result`, `destination` and `auditLogId`.
- `STATUS_CHANGED` must map truthfully; it may no longer masquerade as
  `note_added`.
- A currently closed ticket exposes its latest close result/destination;
  a reopened ticket clears current close fields while preserving historical
  closed-event fields.
- Event IDs/times and audit IDs/times are server-owned. Client request IDs and
  expected-event IDs are validated UUIDs and persisted but never used as row
  IDs. Event ordering remains monotonic.
- API success returns the same-transaction conversation/ticket/event readback.

## Focused Concurrency Contract

- `LOCKED` and `ESCALATED` close both succeed; every invalid close branch is
  zero-write. All five result tokens and destination lengths 1/500 pass while
  empty/501 and invalid token are 400 before repository mutation.
- Exact retries for close, reopen and resume produce one lifecycle event and,
  for resume, one audit. Each action is replayed again after a later lifecycle
  exists to prove the old request remains no-op; a new request ID carrying the
  old expected-event token is 409.
- close-first worker barrier cancels generating intent and yields zero send;
  claim-first may finish one send but final state remains `CLOSED`.
- closed inbound before/after human reopen stays operator-owned with zero
  LLM/send.
- human reopen retry produces one event and preserves prior close history.
- resume itself produces zero LLM/send; a subsequent new inbound answers/sends
  once.
- closed inbound first blocks resume; resume first permits only the subsequent
  inbound.
- human reopen versus Bot resume from the same closed state yields exactly one
  success. Final state is only `HANDOFF + REOPENED` or `OPEN + CLOSED`.
- queued AI generating, AI claimed, AI uncertain, operator-origin, unknown
  future-origin and missing-origin outbound each block resume with zero write;
  the gate depends only on direction/delivery status, never JSON origin/phase.
- wrong tenant, multiple active tickets, stale closed ticket, incomplete close
  history, request-ID collision, missing/mismatched referenced audit and audit
  failure are zero-write.
- Legacy capability tests prove ticket-only close/reopen return
  `atomic_lifecycle_required` while non-lifecycle actions retain coverage.

Focused tests table-drive detail readiness for: missing `ticket:write`;
self-owned `LOCKED` and `ESCALATED`; complete `CLOSED` history with zero
unread/active/queued; unread closed inbound; every queued-outbound class;
different closed-ticket assignee; multiple active tickets; stale/incomplete
history; and equal-`closedAt` ticket-ID tie-break. Every case asserts all three
booleans, all three readiness values and both lifecycle IDs. HTTP 400/403/404/
409 tests assert the repository is not called when rejection precedes it, or a
full before/after state snapshot when rejection is transactional.

The authorized M8 fixture, not the read-only shared worker helper, must match
the new all-ticket lock, event/audit read and all-origin queued-message SQL
shapes exactly. An unrecognized query fails; no permissive fallback or broad
mock expansion is evidence. Both new test files pass repository `max-lines` by
using table data and existing helpers.

Barriers signal exact DB/runtime checkpoints; eager `Promise.all` start order is
not race evidence.

## True PostgreSQL And CI Contract

- Adapt the M10 action runner and existing M11 focused blockers to the new
  required payload/matrix; do not delete legacy regression coverage.
- Add one self-invoking sanitized runner/CI step named
  `M11 close reopen and Bot resume true DB smoke` after the M11 worker ownership
  fence and before Redis worker smokes.
- Reuse the existing API runtime compiler, M11-04A worker compiler/gateway and
  deterministic barriers; add no queue/provider implementation.
- True DB proves: close/result readback, exact retry, closed inbound, human
  reopen, resume/new inbound, inbound-first block, reopen-vs-resume,
  close-vs-worker claim orders, all queued-outbound blockers, audit rollback,
  wrong tenant, event/audit uniqueness and cleanup residue zero.
- Deterministic ordering may not use sleep, timeout or Promise start order:
  - close-first pauses the existing answer runtime after the generating intent
    is committed, commits takeover plus close, verifies that separately seeded
    exact-generating intent is cancelled, then releases for zero send;
  - claim-first pauses the send port after claimed intent commit, commits
    takeover plus close while provider completion is held, then releases for
    exactly one send while final conversation remains `CLOSED`;
  - inbound-first awaits committed message/dedupe/unread readback before resume;
    resume-first awaits conversation/event/audit readback before new inbound;
  - reopen-versus-resume runs both winner orders through a runner-only Prisma
    transaction proxy: pause the winner after scoped conversation `FOR UPDATE`
    returns, signal that the contender attempted that lock, then release and
    require the loser to return 409. No production test hook is authorized.
- Audit rollback uses a runner-only transaction proxy. It lets real prior writes
  execute, then changes only the transaction-scoped `auditLog.create` data to an
  invalid UUID and delegates to the same real PostgreSQL transaction so the DB
  rejects it. Conversation, ticket, ticket_event, audit_log and message
  before/after snapshots must match; no DDL, trigger or production failpoint is
  allowed.
- The true-DB runner asserts detail readiness before close, after close, after
  closed inbound, after human reopen, with queued outbound and after resume.
- Under runtime role, Tenant B gets independent zero counts for conversation,
  message, ticket, ticket_event, audit_log, dedupe, customer and identity.
  Privileged final cleanup counts all of them and is zero after success and
  forced-failure paths.
- The runner catches every failure and emits only
  `m11-conversation-lifecycle-true-db-smoke-failed`; no raw reason/destination,
  message/profile/identity/participant ref, token, SQL, DB URL or error reaches
  CI output. A controlled fatal-test subprocess supplies sentinels and asserts
  stderr contains only that exact failure marker.

## Implementation Steps

1. Commit this spec/evidence before source edits.
2. Run independent spec-compliance and test-plan pre-review; correct every
   blocker/major before implementation.
3. Extract the existing generating-intent cancellation into the authorized
   outbound-fence helper and add the queued-outbound resume gate.
4. Extend the single planner/types/controller/service/repository with close,
   reopen, resume and permission-aware readiness.
5. Extend the canonical audit event enum, then persist/read back conversation,
   ticket, truthful request-bound events and verified resume audit in the same
   transaction; preserve in-memory/Prisma parity.
6. Upgrade focused fakes/compiler/blocker regressions, then add deterministic
   lifecycle/worker and true-DB proof plus the CI step.
7. Run focused/full static/test/build gates, spec compliance first, then code
   quality/security/RLS review; merge only with latest-SHA CI green.

## Pass Conditions

- Close atomically stores one allowed result/destination and closes conversation
  plus ticket without restoring Bot.
- Human reopen atomically creates `HANDOFF + REOPENED`, preserves close history
  and keeps Bot stopped.
- Only explicit safe resume creates `OPEN + no active ticket`; it writes exactly
  one truthful event/audit and performs no LLM/send itself.
- Closed inbound/unread and all queued outbound cannot be skipped into a new
  Bot epoch.
- Request-bound exact retry/race outcomes add no duplicate event/audit, never
  cross a lifecycle anchor and never produce a contradictory ownership matrix.
- Wrong tenant/not found is 404; invalid input is 400; state/history/owner/queue
  conflict is opaque 409; every failure is zero-write.
- Detail readiness is permission-aware and uses the same lifecycle predicates.
- In-memory and true PostgreSQL/worker outcomes match; cleanup residue is zero
  and CI failure output is sanitized.
- Focused tests, format/type/lint/depcruise/jscpd/knip, repository guards, full
  tests/build, pr-shape, spec compliance and quality review pass within budget.

## Failure Branches

- Any schema/RLS-policy requirement -> stop and open a globally serial DB spec.
- If source exceeds 600, touched/new file budget, TypeScript 400-line ceiling or
  the explicit compiler baseline+15 allowance -> narrow or split serially; no
  silent exception.
- If `audit_log` cannot be inserted in the same RLS transaction -> keep resume
  blocked; a post-commit best-effort audit is not accepted.
- If true DB cannot prove both worker race orders, reopen-vs-resume, RLS and
  residue zero -> keep M11-04B open; local fakes are not substitute evidence.
- If queued outbound cannot be locked/read without plaintext -> keep resume
  blocked and redesign the marker query; never log content or blanket retry.
- If multiple active tickets/incomplete history exist -> 409/zero-write; do not
  select a winner, synthesize close history or auto-repair.

## Out Of Scope

- LLM accounting/provider-policy persistence: M11-05.
- Operator reply permission/outbox/API: M11-06.
- Telegram operator send/ack/audit: M11-07.
- Admin lifecycle/composer controls: M11-08.
- Deployment, aligned staging and browser/Telegram/API/worker/DB E2E: M11-09.
- Automatic idle close/resume, replay of closed inbound, withdrawal of already
  sent messages, ambiguous-send retry, broad refactor, schema/migration,
  Telegram Business, production, real customer/order data, GA or 1.0.

## Validation

- focused M2/M8/M11 Node tests listed above
- controlled CI lifecycle true-DB/worker runner
- `npm run format:check`
- `npm run typecheck`
- `npm run lint`
- `npm run depcruise`
- `npm run jscpd`
- `npm run knip`
- `npm run test`
- `npm run build`
- `node scripts/guards/pr-shape.mjs --base main --spec docs/specs/M11-04B-atomic-close-reopen-bot-resume.md --include-worktree`
- `git diff --check main...HEAD`
- `git diff --check`
