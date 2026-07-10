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
7. retry/race outcomes cannot produce `OPEN + active ticket`, duplicate
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
  the required conversation + ticket + outbound + audit atomic boundary.

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

- Source: changed source files <= 10, net source LOC <= 600, new source files <= 1.
- New source: only the outbound-fence extraction/refinement above; every touched
  ordinary source file must remain <= 400 nonblank lines, React/Nest ceilings
  still apply.
- Test/support: changed files <= 8, new files <= 2; no deletion, skip/only,
  weakened assertion, broad mock or snapshot expansion.
- Config: one CI workflow edit.
- Docs: this spec and one evidence record.
- Schema/migration/generated/lock/deploy/provider adapter: none.
- Exceptions: none.

## HTTP And Permission Contract

### Close and human reopen

`POST /conversation-ticket/tickets/:ticketId/actions` continues to require
`ticket:write`.

Close body is exactly the bounded business contract:

```ts
{
  type: "close";
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
{ type: "reopen"; reason: string } // trimmed, required, <= 500
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
{ reason: string } // trimmed, required, <= 500
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

`auditRef` is a controlled reference to the tenant-scoped audit row, never its
raw contents.

### Error semantics

- 400: invalid action/result, missing or overlong text.
- opaque 404: wrong tenant or missing conversation/ticket.
- opaque 409 with zero writes: wrong state/owner, multiple/invalid active
  tickets, stale historical ticket, incomplete close history, unread closed
  inbound, queued outbound, non-exact retry or lifecycle race loser.
- authorization failure: 403 before repository mutation.

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
}
```

Missing `ticket:write` wins as `permission_blocked`; resume also requires
`conversation:read`, already required by detail. Readiness uses the same planner
predicates plus the read snapshot's queued outbound state. It is a hint only;
every POST revalidates under locks.

## Latest Closed Lifecycle Selection

- `CLOSED` tickets are inactive but remain immutable history until an explicit
  human reopen.
- The latest lifecycle ticket is the closed ticket with greatest valid
  `closedAt`; ID descending is the deterministic tie-breaker.
- A complete closed lifecycle requires: ticket `CLOSED`, assigned user,
  server `closedAt`, and a matching latest `CLOSED` event containing one allowed
  result plus bounded destination.
- Human reopen must target that exact latest ticket ID. Reopening older history
  is 409/zero-write.
- Bot resume accepts no ticket ID and uses the server-selected latest complete
  closed ticket.
- Prior `CLOSED`, `REOPENED` and `STATUS_CHANGED` events are never deleted or
  rewritten.

## Atomic Close State Machine

Legal first application:

| Conversation | Ticket matrix | Actor | Outcome |
|---|---|---|---|
| `HANDOFF` | exactly one active `LOCKED` or `ESCALATED`, assignment and lock both actor | self | apply close |

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

The event stores actor, server ID/time, allowed `result` and bounded
`destination`. It contains no message/profile/request body.

Claim-first M11-04A sends may complete once after close; finalization must not
overwrite `CLOSED`. Close-first cancels generating work and later worker claim
is suppressed. Close never claims it can retract an already provider-accepted
send.

An exact same-actor close retry with the same target/result/destination returns
`already_applied` and adds no event/audit. Different payload/actor or stale
target is 409.

## Atomic Human Reopen State Machine

Legal first application requires:

- conversation `CLOSED`;
- zero active tickets;
- target is the server-determined latest complete closed ticket;
- bounded reason.

The transaction assigns the ticket to the authorized reopening actor, clears
its lock/current `closedAt`/current close summary, changes ticket to `REOPENED`,
changes conversation to `HANDOFF` with Bot suspended, preserves unread count,
and inserts one `REOPENED` event with actor/server time/reason.

The prior close result/destination remain in the prior `CLOSED` event. The
reopener may be a different authorized operator because no active owner exists;
the assignment changes only inside this serialized transition. A subsequent
`lock` uses the existing `HANDOFF + REOPENED + same actor` path.

An exact same-actor reopen retry with the same target/reason returns
`already_applied` with no duplicate event. A different actor/payload after the
first transition is 409. Reopen never changes conversation to `OPEN`.

## Explicit Bot Resume State Machine

First application requires all:

- conversation `CLOSED`;
- `unreadCount === 0`;
- zero active tickets;
- a latest complete closed lifecycle ticket whose assigned user is the actor;
- zero messages of any origin matching `OUTBOUND + QUEUED`.

The transaction uses the same lock order, additionally locks every scoped
queued outbound in stable ID order, then:

1. changes only the conversation lifecycle state to `OPEN`/Bot-active;
2. leaves the ticket `CLOSED`, assigned and historically complete;
3. inserts one `STATUS_CHANGED` ticket event with
   `action="bot_resumed"`, bounded reason and an audit-log ID;
4. inserts one `audit_log` row with
   `eventType="conversation.bot_resumed"`, module `customer_support`,
   action `resume_bot`, object type/id, actor, server time and safe
   before/after state metadata;
5. reads state/events back before commit.

Audit insertion failure rolls the whole transition back. The audit content does
not copy reason text; the ticket event is the bounded operational reason record.

Resume performs zero LLM/send, does not reopen the ticket, does not replay old
inbound and does not resurrect cancelled/failed/sent/uncertain messages. Only a
new inbound committed after resume may enter the existing M11-04A Bot path.

Any `OUTBOUND/QUEUED`, including generating, claimed, uncertain or future
operator outbox, blocks resume. It is not cancelled or retried by resume.

An exact retry recognized by the latest closed ticket's
`STATUS_CHANGED/bot_resumed` event, actor and reason returns `already_resumed`
with the original `auditRef`, even if later valid Bot work has begun. It creates
no second event/audit. Without a request idempotency key this is state-level
exact replay handling, not a claim of general request idempotency.

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
3. scoped active tickets plus lifecycle target locked in ID order;
4. queued outbound lock in ID order when required;
5. full state/history/retry validation;
6. conversation/ticket/event/audit writes;
7. scoped readback before commit.

No ticket/message is locked before its conversation. Wrong-tenant rows remain
invisible under explicit predicates and RLS. In-memory uses its existing mutex
and preserves event/audit parity.

`persistPlan` must update conversation whenever the planned conversation state
differs, not only for takeover. Failed validation/audit discards the in-memory
snapshot and rolls back Prisma writes.

## Event And Readback Contract

- `TicketEvent` exposes optional bounded `result`, `destination`,
  `action="bot_resumed"` and `auditLogId`.
- `STATUS_CHANGED` must map truthfully; it may no longer masquerade as
  `note_added`.
- A currently closed ticket exposes its latest close result/destination;
  a reopened ticket clears current close fields while preserving historical
  closed-event fields.
- Event IDs/times and audit IDs/times are server-owned. Event ordering remains
  monotonic.
- API success returns the same-transaction conversation/ticket/event readback.

## Focused Concurrency Contract

- `LOCKED` and `ESCALATED` close both succeed; every invalid close branch is
  zero-write.
- concurrent exact close retries produce one `CLOSED` event.
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
- queued generating/claimed/uncertain and future operator queued outbound each
  block resume with zero write.
- wrong tenant, multiple active tickets, stale closed ticket, incomplete close
  history and audit failure are zero-write.

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
- The runner catches every failure and emits only
  `m11-conversation-lifecycle-true-db-smoke-failed`; no raw reason/destination,
  message/profile/identity/participant ref, token, SQL, DB URL or error reaches
  CI output.

## Implementation Steps

1. Commit this spec/evidence before source edits.
2. Run independent spec-compliance and test-plan pre-review; correct every
   blocker/major before implementation.
3. Extract the existing generating-intent cancellation into the authorized
   outbound-fence helper and add the queued-outbound resume gate.
4. Extend the single planner/types/controller/service/repository with close,
   reopen, resume and permission-aware readiness.
5. Persist/read back conversation, ticket, truthful events and resume audit in
   the same transaction; preserve in-memory/Prisma parity.
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
- Exact retry/race outcomes add no duplicate event/audit and never produce a
  contradictory ownership matrix.
- Wrong tenant/not found is 404; invalid input is 400; state/history/owner/queue
  conflict is opaque 409; every failure is zero-write.
- Detail readiness is permission-aware and uses the same lifecycle predicates.
- In-memory and true PostgreSQL/worker outcomes match; cleanup residue is zero
  and CI failure output is sanitized.
- Focused tests, format/type/lint/depcruise/jscpd/knip, repository guards, full
  tests/build, pr-shape, spec compliance and quality review pass within budget.

## Failure Branches

- Any schema/RLS-policy requirement -> stop and open a globally serial DB spec.
- If source exceeds 600, touched/new file budget or a 400-line ceiling -> narrow
  or split serially; no silent exception.
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
