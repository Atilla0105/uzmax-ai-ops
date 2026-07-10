# M11-03B Atomic Takeover And Ticket Actions

Spec ID: M11-03B
Status: `approved_for_execution`
Owner confirmation point: on 2026-07-10 the project owner asked the AI agents to
continue until the M11 Value-0 customer-service loop is genuinely usable. M11-00
authorizes the serial M11 slices, and M11-03A preserves this slice's reviewed
handoff contract in its durable appendix.
Timebox: one atomic-write runtime slice; stop after takeover and the allowed
ticket actions pass focused, full-repository and true-PostgreSQL race gates.

## Spec 类型

feature

## Goal

Replace the current read-then-save handoff path with one tenant-scoped state
machine that makes customer-service ownership truthful under retries and races:

1. the API takeover/action path cannot create or overwrite more than one active
   Value-0 ticket/owner outcome;
2. same-actor takeover retries are idempotent;
3. different actors cannot overwrite each other;
4. legacy ticket actions use the same conversation-first lock order;
5. client actor, SLA, owner, lock and time values never drive writes;
6. close/reopen remain fail-closed until M11-04 changes conversation and ticket
   together and explicitly resumes Bot handling;
7. the read contract exposes permission-aware atomic takeover readiness without
   enabling the current legacy admin button.

M11-03 is complete only when M11-03A and this slice are both merged. Worker
ownership/send fencing and explicit resume still belong to M11-04; therefore
03B does not claim global exclusion against a worker path that does not yet use
the same fence.

## Source Of Truth

- `AGENTS.md`
- `docs/specs/M11-00-value0-customer-service-closure-contract.md`
- `docs/specs/M11-03A-conversation-customer-read-truth.md`
- `UZMAX智能运营系统-PRD-v1.1.md`
- `UZMAX智能运营系统-技术架构-v1.1.md`
- `docs/adr/ADR-003-llm-data-processing.md`
- existing `conversation`, `ticket` and `ticket_event` schema/RLS policies

## Current Unsafe Boundary

- `createHandoffTicket` reads a conversation, then saves the conversation and
  ticket in separate transactions. A failure or race can leave partial state or
  multiple active tickets.
- `applyTicketAction` reads and saves separately, so a stale actor can overwrite
  a newer owner/lock.
- the controller currently requires client `slaPolicyRef`; service input accepts
  client time/action fields even though actor is overwritten.
- close/reopen currently mutate only the ticket, so they cannot safely represent
  Bot resume or closed conversation truth.
- the in-memory repository has no mutation serialization and the Prisma port
  exposes only eager batch transactions.

## AI Agent Responsibilities

- Work only in the assigned worktree/branch; root/main remains coordination-only.
- Keep one transition planner authoritative for in-memory, Prisma writes and
  read eligibility; do not create a second state machine in controller/UI.
- Use parameterized scoped SQL only for row locks; all returned business rows
  still pass through existing bounded mappers.
- Keep messages, profiles, participant refs, DB URLs and secrets out of errors,
  evidence and CI output.
- Run spec compliance before code quality/security/RLS review and archive exact
  local/CI truth before merge.

## Preconditions

- Base main: `ebdb05c31ded16e160729ae4050249bdcd46baa1` (PR #301).
- Worktree:
  `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/m11-03b-atomic-takeover`.
- Branch: `codex/m11-03b-atomic-takeover`.
- Root/main is clean and read-only; no open PR or other unmerged branch existed
  when this worktree was created.
- M11-03A passed implementation run `29102870268`, latest-SHA run
  `29104345624` attempt 2, then merged and was cleaned.
- No production, real customer data, secret mutation or deployment is needed.

## Existing-Implementation Search

`rg` found one implementation seam to replace, not parallelize:

- HTTP parsing/error mapping: `conversation-ticket.controller.ts` and
  `conversation-ticket.errors.ts`;
- non-atomic orchestration: `conversation-ticket.service.ts`;
- in-memory and RLS persistence: `conversation-ticket.repository.ts`;
- bounded DB mapping: `conversation-ticket.db-mappers.ts`;
- read ownership truth: `conversation-ticket.ownership.ts`;
- focused fake Prisma: `m8-conversation-ticket-api-fixture.mjs`;
- existing read/action true-DB helper:
  `run-m10-conversation-ticket-actions-true-db-smoke.mjs`.

One new `conversation-ticket.atomic-writes.ts` is authorized because the existing
repository is already 430 physical lines/at its nonblank lint ceiling. It owns
the single transition planner, in-memory mutex mutation and interactive Prisma
mutation helpers. The old public `saveConversation`/`saveTicket` seams must be
removed so they cannot remain a bypass.

## 触碰模块/文件

- `docs/specs/M11-03B-atomic-takeover-ticket-actions.md`
- `docs/evidence/M11/M11-03B-atomic-takeover-ticket-actions.md`
- `.github/workflows/ci.yml`
- `apps/api/scripts/runtime-compiler.mjs`
- `apps/api/src/conversation-ticket.atomic-writes.ts`
- `apps/api/src/conversation-ticket.controller.ts`
- `apps/api/src/conversation-ticket.errors.ts`
- `apps/api/src/conversation-ticket.repository.ts`
- `apps/api/src/conversation-ticket.service.ts`
- `apps/api/src/conversation-ticket.types.ts`
- `scripts/tests/m2-conversation-ticket-api-contract.test.mjs`
- `scripts/tests/m2-conversation-ticket-api-http-hardening.test.mjs`
- `scripts/tests/m8-conversation-ticket-api-fixture.mjs`
- `scripts/tests/m8-db-backed-conversation-ticket-api.test.mjs`
- `scripts/tests/m10-conversation-ticket-actions-true-db-smoke.test.mjs`
- `scripts/tests/m11-conversation-customer-read.test.mjs`
- `scripts/tests/m11-atomic-takeover.test.mjs`
- `packages/db/scripts/tests/run-m10-conversation-ticket-actions-true-db-smoke.mjs`
- `packages/db/scripts/tests/run-m11-atomic-takeover-true-db-smoke.mjs`

## Read-only anchors

- `apps/api/src/conversation-ticket.db-mappers.ts`
- `apps/api/src/conversation-ticket.ownership.ts`
- `packages/capabilities/handoff/src/index.ts`
- `packages/db/prisma/schema.prisma`
- `packages/db/migrations/0001_rls_foundation.sql`
- `apps/admin/src/pages/conversations/conversationWorkbenchHandoff.ts`

## Change Budget

- Source: changed source files <= 7, net source LOC <= 600, new source files <= 1.
- New source: one atomic-write module; repository growth is offset by removing
  the old non-atomic save seams and must remain within lint limits.
- Test/support: changed files <= 9, new test/support files <= 2; no deleted
  tests, skip/only, weakened assertion, broad mock or snapshot expansion.
- Config: one CI workflow edit.
- Docs: this spec and one evidence record.
- Schema/migration/generated/lock/deploy/provider adapter: none.
- Exceptions: none.

## HTTP And Read Contract

### Takeover request

`POST /conversation-ticket/conversations/:conversationId/handoff` continues to
require `conversation:read` plus `ticket:write`.

- accepted business input is only `reason`: string, trimmed, required, maximum
  500 characters;
- actor is only `AccessContext.userId`;
- client actor, SLA, assigned owner, lock owner and time fields are ignored;
- unknown compatibility fields are ignored so the currently blocked admin
  client's old SLA body cannot control the server;
- validation failure is 400 before mutation; wrong tenant/missing conversation
  is opaque 404; ownership/state conflict is one opaque 409.

Success returns exactly:

```ts
{
  result: "already_owned" | "created" | "reused";
  conversation: HandoffConversation;
  ticket: TicketState;
}
```

The ticket SLA is always server-owned
`value0-staging-support-default-v1` with no client/LLM due-time decision.

### Detail readiness

`GET /conversation-ticket/conversations/:id` keeps the M11-03A root shape but:

- `operatorState` adds `canTakeover: boolean`;
- root `takeoverReadiness` becomes
  `atomic_ready | permission_blocked | state_blocked`;
- `atomic_ready` requires `ticket:write` and a state for which takeover would
  return created/reused/already-owned or advance a same-actor assigned ticket;
- missing `ticket:write` always wins over state and returns
  `permission_blocked`; only a permitted but ineligible state returns
  `state_blocked`;
- other owner, conflict, closed conversation or missing permission is false;
- no readiness/SLA field is added inside nested `conversation`.

The existing admin still checks nested `conversation.slaPolicyRef`, so it stays
fail-closed until M11-08 deliberately consumes the new root contract.
Readiness is a non-authoritative hint from a read snapshot; every POST ignores
the hint and revalidates under locks in its own transaction.

## Atomic Takeover State Machine

One Prisma interactive RLS transaction must execute in this order:

1. `SET LOCAL ROLE uzmax_app_runtime` and set scoped org/tenant settings;
2. parameterized scoped conversation `FOR UPDATE` lock;
3. parameterized lock of every non-closed ticket for that conversation ordered
   by ticket ID;
4. scoped delegate read and full matrix validation;
5. ticket/conversation/event writes;
6. scoped conversation/ticket/event readback before commit.

No ticket is locked before its conversation. Wrong-tenant rows remain invisible
under both explicit scope and RLS.

| Conversation | Active ticket | Actor relation | Outcome |
|---|---|---|---|
| `OPEN` | none | any authorized actor | create ticket, claim+lock, set `HANDOFF`, `created` |
| `OPEN`/`PENDING_HANDOFF` | unowned `OPEN` | any authorized actor | reuse, claim+lock, set `HANDOFF`, `reused` |
| `OPEN`/`PENDING_HANDOFF`/`HANDOFF` | assigned-only `CLAIMED`/`REOPENED` | same actor | lock, set/keep `HANDOFF`, `reused` |
| `HANDOFF` | valid `LOCKED`/`ESCALATED` | same actor | no write/event, `already_owned` |
| `PENDING_HANDOFF` | none | any | 409, zero write |
| `HANDOFF` | unowned `OPEN` | any | 409, zero write |
| any non-closed | valid ticket | other actor | 409, zero write |
| non-`HANDOFF` | fully owned `LOCKED`/`ESCALATED` | any | 409, zero write |
| any | multiple active tickets or invalid ticket matrix | any | 409, zero write |
| `CLOSED` | any | any | 409, zero write |

Created tickets emit `CREATED`, `CLAIMED`, `LOCKED`; reused unowned tickets emit
`CLAIMED`, `LOCKED`; same-actor assigned-only tickets emit `LOCKED`.
`already_owned` emits nothing and never de-escalates.

Events use one server base instant and monotonic 1ms increments. Every event has
a server UUID. Payload may include the bounded reason and transition metadata,
never a message/profile/raw request/client SLA or DB detail.

## Existing Ticket Action State Machine

`POST /conversation-ticket/tickets/:ticketId/actions` keeps `ticket:write`.
Only a known action type and its bounded business text are accepted. Client
actor/time/owner/lock values are ignored. `note` is trimmed/required/max 2000;
`escalate.reason` is trimmed/required/max 500.

To preserve lock order when starting from ticket ID, all steps below run inside
the same interactive transaction:

1. perform one scoped unlocked lookup only for immutable `conversationId`;
2. lock the scoped conversation;
3. lock all active tickets in stable ID order and re-read the target;
4. validate the complete conversation/ticket matrix;
5. write state/event and read back in the same transaction.

Allowed transitions are exact:

| Action | Required state | Result |
|---|---|---|
| `claim` | conversation `OPEN`/`PENDING_HANDOFF`; one unowned `OPEN` ticket | actor-assigned `CLAIMED` |
| `lock` | conversation `HANDOFF`; same-actor assigned-only `CLAIMED`/`REOPENED` | actor-assigned+locked `LOCKED` |
| `note` | conversation `HANDOFF`; valid same-actor assigned-only or locked state | append `NOTE_ADDED`, ownership unchanged |
| `escalate` | conversation `HANDOFF`; same-actor `LOCKED` | `ESCALATED`, assignment/lock preserved |
| `close`/`reopen` | any | opaque 409, zero write until M11-04 |

OPEN-direct-lock, LOCKED-reclaim, CLAIMED-direct-escalate, other-owner action,
multiple-active-ticket and invalid-matrix attempts are opaque 409/zero-write.
Invalid action type or invalid text is 400; wrong tenant/missing ticket is opaque
404. Resulting state is revalidated before update/event insert.

## In-Memory And Concurrency Contract

- In-memory mutation uses one real async mutex around snapshot -> validate ->
  next state -> commit. Failed transitions discard the snapshot.
- Focused races synchronize request start with a barrier; they do not use eager
  `Promise.all` as evidence of transaction ordering.
- same actor concurrent/serial takeover yields one ticket, one event sequence and
  `created|reused` plus `already_owned`;
- different actors yield one success and one 409; winner ownership is unchanged;
- different-actor takeover versus legacy claim yields exactly one legal
  mutation; the loser is 409 and cannot overwrite the winner;
- same-actor claim versus takeover may serialize as claim then takeover (both
  legal, one owner, `CLAIMED` then `LOCKED`) or takeover then rejected claim;
  neither ordering may duplicate tickets/events or overwrite ownership.

## True PostgreSQL And CI Contract

- Keep the M11-03A read/RLS runner and adapt its old M10 action assertions to the
  new atomic/close-reopen-blocked semantics.
- Add a separate sanitized runner/CI step named
  `M11 atomic takeover true DB smoke` after the M11 read smoke and before Redis
  worker smokes. The new file under `packages/db/scripts/tests/` self-invokes
  when executed directly; no second top-level source wrapper is added.
- True PostgreSQL must prove: create, reuse, same-actor retry, different-actor
  race, both same-actor and different-actor takeover-vs-claim serialization,
  exact events, multi-ticket conflict, closed, pending-without-ticket, wrong
  tenant and cleanup residue zero.
- The exported runner catches every failure and emits only
  `conversation-ticket-atomic-takeover-true-db-smoke-failed`.
- CI output/evidence contains no message, identity/profile, participant ref,
  owner email, token, DB URL or secret.

## Implementation Steps

1. Commit this spec/evidence before source edits.
2. Implement the single transition planner and in-memory/Prisma atomic writers.
3. Replace service/repository non-atomic save seams and tighten controller/error
   mapping plus permission-aware read readiness.
4. Upgrade fake Prisma mutex/rollback behavior and focused matrices/races.
5. Adapt the existing M10 true-DB regression and add the new M11 race runner/CI
   step.
6. Run focused, full static/test/build and controlled CI gates.
7. Run spec compliance first, code quality/security/RLS review second; merge only
   with no blocker/major and latest-SHA CI green.

## Pass Conditions

- No public/service path can save conversation/ticket separately for takeover or
  allowed actions.
- Exact takeover/action matrices and server-only actor/SLA/time rules hold.
- Same/different actor and takeover-vs-claim races have deterministic lawful
  outcomes with no partial/duplicate writes.
- Wrong tenant/not found is 404; state/owner conflict is opaque 409; validation
  is 400; every failed branch is zero-write.
- Detail readiness is permission-aware at the root and current admin stays
  blocked on its legacy nested signal.
- In-memory and true PostgreSQL outcomes match; cleanup residue is zero and CI
  failure output is sanitized.
- Focused tests, format/type/lint/depcruise/jscpd/knip, repository guards, full
  tests/build, pr-shape, spec compliance and code quality pass within budget.

## Failure Branches

- Any schema/RLS-policy need -> stop and open a globally serial DB spec.
- If the existing Prisma client cannot support interactive transactions with
  scoped role/settings -> keep M11-03B open and create an ADR-backed runtime
  path; never fall back to batch/read-then-save writes.
- If source exceeds 600 or the new module exceeds lint limits -> stop, narrow
  the implementation surface or open a serial source sub-spec; test splitting
  is not a source-budget remedy and no silent exception is allowed.
- If true DB cannot prove races/residue -> keep the slice open; local mutex tests
  are not substitute evidence.

## Out Of Scope

- worker pre-LLM/pre-send ownership fence, close/reopen and explicit Bot resume:
  M11-04;
- LLM accounting, operator outbox/send, delivery audit, admin composer and live
  aligned-staging E2E: M11-05..09;
- schema/migration/lock/deploy/provider adapter, Telegram Business, production,
  real customer/order data, GA or 1.0.

## Validation

- focused M2/M8/M11 Node tests listed above
- controlled CI M11 read plus atomic true-DB runners
- `npm run format:check`
- `npm run typecheck`
- `npm run lint`
- `npm run depcruise`
- `npm run jscpd`
- `npm run knip`
- `npm run test`
- `npm run build`
- `node scripts/guards/pr-shape.mjs --base main --spec docs/specs/M11-03B-atomic-takeover-ticket-actions.md --include-worktree`
- `git diff --check main...HEAD`
- `git diff --check`
