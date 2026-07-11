# M11-04B1 Atomic Close And Human Reopen

Spec ID: M11-04B1
Status: `draft_for_preimplementation_review`
Owner confirmation point: the project owner authorized completion of the M11
Value-0 customer-service loop. M11-00 authorizes serial splitting when a slice
exceeds the repository source budget, and M11-04B has now measured that failure.
Timebox: one close/reopen API lifecycle slice; stop after focused, repository and
true-PostgreSQL/worker-race gates pass within budget.

## Spec 类型

feature

## Split Decision And Goal

The parent M11-04B WIP measured approximately +984 net source lines against an
approved +600 limit. This child slice narrows the first mergeable invariant:

1. a fully owned `LOCKED` or `ESCALATED` ticket can be closed together with its
   conversation in one tenant-scoped transaction;
2. close persists one exact result and bounded destination, resets unread,
   cancels only exact generating AI intent and keeps Bot suspended;
3. the latest complete closed lifecycle can be reopened by an authorized human
   into `HANDOFF + REOPENED`, preserving unread/history and keeping Bot
   suspended;
4. request UUID and exact lifecycle-event anchors make close/reopen retries
   idempotent and stale or colliding commands zero-write;
5. event/readback, RLS, worker race orders and cleanup are true in memory and on
   PostgreSQL.

M11-04B1 does not add a Bot-resume endpoint, any parent lifecycle-readiness
response fields (`canClose`, `canReopen`, `canResumeBot` or
`lifecycleReadiness`), an all-origin queued-outbound gate,
`conversation.bot_resumed`, resume audit, LLM/provider call, operator-send path
or admin UI. The entire lifecycle-readiness response contract belongs to
M11-04B2 so B1 cannot publish a partial public shape.

## Source Of Truth

- `AGENTS.md`
- `docs/specs/M11-00-value0-customer-service-closure-contract.md`
- `docs/specs/M11-03B-atomic-takeover-ticket-actions.md`
- `docs/specs/M11-04A-worker-ownership-send-fence.md`
- parent `docs/specs/M11-04B-atomic-close-reopen-bot-resume.md`
- PRD v1.1 REQ-T02, REQ-C03 and REQ-T12
- technical architecture v1.1 sections 4-6
- acceptance matrix v1.1 C-06 and D-03
- existing conversation/message/ticket/ticket_event schema and RLS policies

The parent command, replay, closed-history selection, transaction ordering,
failure-status, privacy and wrong-tenant contracts are inherited unchanged for
close/reopen. If this child conflicts with those safety rules, the parent wins.

## Owner And Runtime Boundary

- Actor is only the authenticated `AccessContext.userId`; org/tenant are only
  the selected authenticated scope.
- This slice uses controlled local/CI staging fixtures only. It does not deploy,
  mutate secrets, use production or real customer/order data, or change schema,
  migrations, RLS policy, provider adapters, worker source or permissions.
- Result/destination/reason are tenant records in ticket events. Tests/evidence
  use synthetic bounded values and sanitized failure output.
- `CLOSED` is an internal support disposition, not proof that the customer's
  real-world problem was solved.

## HTTP And State Contract

`POST /conversation-ticket/tickets/:ticketId/actions` continues to require
`ticket:write`.

Close body:

```ts
{
  type: "close";
  requestId: string; // UUID
  expectedLifecycleEventId: string; // current event UUID
  result: "resolved" | "transferred_to_human_channel" | "no_response" | "invalid" | "duplicate";
  destination: string; // trimmed, required, 1..500
}
```

Reopen body:

```ts
{
  type: "reopen";
  requestId: string; // UUID
  expectedClosedEventId: string; // exact latest CLOSED event UUID
  reason: string; // trimmed, required, 1..500
}
```

Validation is HTTP 400 before repository mutation. Missing permission is 403;
wrong tenant/not found is 404; stale anchor, ownership/state/history conflict or
request collision is opaque 409 and zero-write.

Exact same-conversation replay is evaluated before current-state/anchor checks:
same actor/action/target/payload returns the original result without a write,
including after a later lifecycle. A reused request ID with different command
data, multiple matching events or a new request with a stale anchor is 409.

Close requires `HANDOFF`, zero ownership conflict and exactly one fully
self-owned active ticket. It atomically writes `CLOSED`, one truthful event with
request/expected/result/destination, conversation `CLOSED`, unread zero and
preserved assignment with lock cleared. Bot remains suspended.

Reopen requires conversation `CLOSED` and zero active tickets. The server first
selects the latest closed ticket by `closedAt`, then ticket ID descending, and
validates that selected lifecycle only; it never falls back. The latest CLOSED
event must match ticket timestamp/assignee and contain complete close metadata.
Success writes `HANDOFF + REOPENED`, assigns the human reopener, preserves unread
and history, and writes one request-bound event.

The legacy handoff capability's ticket-only close/reopen returns
`atomic_lifecycle_required`; the API atomic facade remains the only writer.

## Worker Race Contract

- Close-first: pause the real answer runtime after its generating intent commit;
  takeover cancels that original intent, seed one separate exact generating
  intent, commit close, verify close cancels it, release and require zero send.
- Claim-first: pause at the successful synthetic send port after claimed commit,
  takeover and close while provider completion is held, then release and
  require exactly one send. Its one intent reaches `SENT`; conversation and
  ticket remain `CLOSED`, finalization never overwrites CLOSED, and no second
  send or outbound row occurs. This proof does not claim that an already-claimed
  production send can be withdrawn.
- Closed or reopened-human inbound is persisted/unread for the operator with
  zero LLM and zero outbound. No closed-period message is replayed.
- Barriers signal exact persisted checkpoints; sleep, timeout and Promise start
  order are not race evidence.

## 触碰模块/文件

- `docs/specs/M11-04B-atomic-close-reopen-bot-resume.md`
- `docs/evidence/M11/M11-04B-atomic-close-reopen-bot-resume.md`
- `docs/specs/M11-04B1-atomic-close-human-reopen.md`
- `docs/evidence/M11/M11-04B1-atomic-close-human-reopen.md`
- `.github/workflows/ci.yml`
- `apps/api/scripts/runtime-compiler.mjs`
- `apps/api/src/conversation-ticket.atomic-state.ts`
- `apps/api/src/conversation-ticket.atomic-writes.ts`
- `apps/api/src/conversation-ticket.lifecycle-state.ts`
- `apps/api/src/conversation-ticket.controller.ts`
- `apps/api/src/conversation-ticket.db-mappers.ts`
- `apps/api/src/conversation-ticket.repository.ts`
- `apps/api/src/conversation-ticket.service.ts`
- `apps/api/src/conversation-ticket.types.ts`
- `packages/capabilities/handoff/src/index.ts`
- `scripts/tests/m2-conversation-ticket-api-contract.test.mjs`
- `scripts/tests/m2-conversation-ticket-test-harness.mjs`
- `scripts/tests/m2-conversation-ticket-api-http-hardening.test.mjs`
- `scripts/tests/m8-conversation-ticket-api-fixture.mjs`
- `scripts/tests/m8-db-backed-conversation-ticket-api.test.mjs`
- `scripts/tests/m11-atomic-takeover.test.mjs`
- `scripts/tests/m11-conversation-close-reopen.test.mjs`
- `packages/db/scripts/tests/run-m10-conversation-ticket-actions-true-db-smoke.mjs`
- `packages/db/scripts/tests/run-m11-conversation-close-reopen-true-db-smoke.mjs`

Read-only: worker M11-04A runtime/fence files, schema/migrations, audit sink,
`packages/db/src/index.ts`, and all admin/provider/deploy paths.

## Change Budget

- Source: changed files <= 11, net source LOC <= 600, new source files <= 1.
- New source: only private `conversation-ticket.lifecycle-state.ts`, imported
  and re-exported solely by the existing atomic-state public facade.
- Runtime compiler begins at parent baseline 581 nonblank lines and may add only
  close/reopen helper registration/rewrite, finishing at <= baseline + 15; the
  actual smaller delta must be reported.
- Test/support: changed files <= 9, new files <= 2; no deletion, skip/only,
  weakened assertion, broad fallback/mock or snapshot expansion.
- Config: one CI workflow edit. Docs: parent split record plus this spec/evidence.
- Schema/migration/generated/lock/deploy/provider/permission: none.
- Exceptions: none; no `large_change_exception`, test weakening or external
  dependency exception.

Every touched TypeScript source and both new tests/runners must pass repository
line/complexity gates. The M8 fake must recognize exact query shapes before its
existing read-only fallback; an unknown write/lock query fails.

## Focused And True-DB Proof

Focused tests table-drive both active statuses and all five close results.
Destination and reopen reason independently prove lengths 1 and 500 succeed,
while empty and 501 fail before repository mutation. A different authorized
human may reopen and becomes the assignee. Positive close/reopen each create
exactly one event; readback preserves result/destination in close history while
the reopened ticket clears current close fields.

Failure tables cover exact retry after a later lifecycle, a request UUID with
multiple matching events, same-request payload collision, a new request with a
stale anchor, wrong owner/tenant, multiple active tickets and equal-closedAt
ticket-ID tie selection. The newest candidate never falls back when its
`closedAt`, CLOSED event, request/expected metadata are missing, or when its
time/actor differs from the ticket. Every rejected transactional case compares
the complete conversation, messages, tickets and embedded events before/after.
Legacy ticket-only close/reopen remains fail closed. No lifecycle-readiness
field is added or asserted in B1.

The sanitized PostgreSQL CI runner runs after M11-04A's ownership fence and
proves close result/destination readback, close/reopen exact retry and event
uniqueness, both worker orders, and closed/reopened inbound behavior.

Under the runtime role, Tenant B independently sees zero conversation, message,
ticket, ticket_event, audit_log, dedupe, customer and identity rows. Wrong-tenant
close and reopen return opaque not-found and leave a full scoped snapshot
unchanged. The runner includes a controlled mid-run fatal child that has already
created synthetic scoped rows, injects reason/message/DB-URL/token sentinels,
cleans up in `finally`, and exits nonzero; the parent requires empty stdout and
stderr equal only to
`m11-conversation-close-reopen-true-db-smoke-failed`. Privileged counts prove
all listed tables have zero residue after both success and forced-failure paths.
The sanitizer is inside this runner; no third test/support file is permitted.

## Implementation And Review Flow

1. Commit this split spec/evidence without source.
2. Obtain independent state/security/spec and test/budget GO. Until then, do not
   continue or commit the parent WIP source.
3. Narrow the uncommitted parent WIP to this touched list and behavior; remove
   all resume/audit/all-origin queue work and all lifecycle-readiness response
   fields from the B1 diff.
4. Run focused static/tests, true PostgreSQL CI, repository guards and full
   build/test gates.
5. Run spec compliance first, then code quality/security/RLS review; merge only
   on current-head CI green and clean up branch/worktree.
6. Create M11-04B2 from the merged B1 main; do not carry an unreviewed hidden
   branch or local-only runtime claim.

## Pass Conditions

- Close and reopen satisfy the atomic, request-bound, history and readback
  contract with no contradictory conversation/ticket state.
- Bot remains suspended after both actions; closed/reopened inbound creates no
  LLM/outbound work.
- Both worker race orders, in-memory/Prisma parity, RLS and residue zero pass.
- All source/test/CI/docs changes stay within this exact child scope and budget.
- Evidence explicitly says B1 is not explicit Bot resume, usable UI, staging,
  production, GA or M11 closure.

## Failure Branches

- Source >600, changed/new limits or line/compiler ceiling -> narrow again or
  split serially; no exception or second new source helper.
- Schema/RLS-policy need -> stop and open a globally serial DB spec.
- Close/reopen cannot remain atomic or races cannot be deterministic on true DB
  -> keep B1 open; fake-only proof is insufficient.
- Hidden cross-tenant/write, raw failure output, test weakening or worker-source
  change -> stop, preserve evidence and correct before implementation resumes.

## Out Of Scope

Explicit Bot resume/readiness/audit/queued gate (M11-04B2), LLM accounting
(M11-05), operator reply/send (M11-06/07), admin workbench (M11-08), deploy/E2E
(M11-09), production/real customers/Telegram Business/orders/GA/1.0.
