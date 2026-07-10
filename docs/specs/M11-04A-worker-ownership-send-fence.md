# M11-04A Worker Ownership And Send Fence

Spec ID: M11-04A
Status: `approved_for_execution`
Owner confirmation point: on 2026-07-10 the project owner asked the AI agents to
complete the approved M11 Value-0 customer-service loop. M11-00 explicitly
authorizes serial sub-slices when a source budget would otherwise be exceeded.
Timebox: one worker-ownership runtime slice; stop after durable inbound
preparation, AI dispatch fencing and the real PostgreSQL race gate pass. Atomic
close/reopen/explicit Bot resume remains M11-04B.

## Spec 类型

feature

## Split Decision

M11-04 is split into two serial specs because the current worker runtime and
persistence files are already near their lint ceilings, while close/resume must
also extend the M11-03B API state machine:

- M11-04A owns worker-side existing-ownership detection, durable inbound/AI
  intent preparation, pre-send dispatch claim, finalization and API takeover
  cancellation of unclaimed AI intents.
- M11-04B will own atomic ticket close, human reopen and the distinct authorized
  explicit Bot resume action.

M11-04B cannot start until this slice merges and is cleaned.

## Goal

Make human ownership durable across Telegram Bot worker retries and races:

1. every admitted inbound in a valid scoped ownership matrix is deduped and
   stored before any LLM or outbound work;
2. an existing `PENDING_HANDOFF`, `HANDOFF` or `CLOSED` conversation stores the
   inbound/customer observation without calling the answer runtime, sending,
   changing conversation state or creating another ticket;
3. only a Bot-eligible `OPEN` conversation with no ticket or one unowned `OPEN`
   ticket may prepare one durable AI-origin `QUEUED` intent;
4. after LLM/redline work, a conversation-first transaction must claim that
   intent immediately before the external send;
5. takeover committed before claim cancels the intent and produces zero send;
6. claim committed before takeover may complete that one send; successful
   finalization never mutates ownership, while failure may only move a still
   Bot-eligible conversation to one human handoff;
7. automatic handoff/follow-up creates at most one active ticket and never
   overwrites a human owner.

This slice closes the current worker ownership race. It does not add close,
reopen, explicit Bot resume, operator reply, LLM accounting or admin UI.

## Source Of Truth

- `AGENTS.md`
- `docs/specs/M11-00-value0-customer-service-closure-contract.md`
- `docs/specs/M11-03A-conversation-customer-read-truth.md`
- `docs/specs/M11-03B-atomic-takeover-ticket-actions.md`
- `UZMAX智能运营系统-PRD-v1.1.md` REQ-C03 and REQ-T02
- `UZMAX智能运营系统-技术架构-v1.1.md` sections 5 and 10
- `UZMAX智能运营系统-1.0验收矩阵-v1.1.md` C-06 and D-03
- existing `conversation`, `message`, `telegram_update_dedupe`, `ticket` and
  `ticket_event` schema/RLS policies

## Current Unsafe Boundary

- `conversation-runtime.ts` selects the answer path from payload/options only,
  then reserves dedupe, calls the LLM, calls Telegram and only afterwards asks
  persistence to write the conversation.
- `telegram-bot-conversation-persistence.ts` forces answer to `OPEN` and handoff
  to `PENDING_HANDOFF`, so either branch can overwrite existing human/closed
  ownership.
- automatic handoff unconditionally creates a ticket/event and does not lock or
  reuse active tickets.
- no durable AI message exists before Telegram send even though the schema
  already supports `QUEUED` and `CANCELLED`.
- worker and M11-03B do not yet share the same conversation-first lock line, so
  takeover during LLM can still send and then be overwritten back to `OPEN`.

## AI Agent Responsibilities

- Work only in the assigned worktree/branch; root/main remains read-only.
- Keep one worker transaction state machine authoritative for Prisma and focused
  fake behavior; runtime/controller code may consume outcomes but not recreate
  ownership decisions.
- Reuse the M11-03B conversation-first, active-ticket-stable-order lock contract
  and fixed `{ maxWait: 60_000, timeout: 60_000 }` transaction bounds.
- Never log or copy message/profile plaintext, Telegram refs, DB URLs, tokens or
  raw provider errors into evidence/CI output.
- Run spec compliance before code-quality/security/RLS review and archive exact
  local/CI truth before merge.

## Preconditions

- Base main: `da5e808b9bac377252acd953c9ca2d7335ba67c2` (PR #302).
- Worktree:
  `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/m11-04a-worker-fence`.
- Branch: `codex/m11-04a-worker-fence`.
- Root/main was clean and synchronized; no open PR, unmerged branch or second
  worktree existed after M11-03B cleanup.
- The assigned worktree recorded matching `pwd`, branch, status and base SHA and
  uses its own copied `node_modules` directory.
- No production, real customer/order data, secret mutation or deployment is
  needed.

## Existing-Implementation Search

`rg` found one runtime path to refactor, not a parallel implementation:

- orchestration: `apps/worker/src/conversation-runtime.ts`;
- RLS/dedupe/identity/conversation persistence:
  `apps/worker/src/telegram-bot-conversation-persistence.ts`;
- production gateway selection:
  `apps/worker/src/telegram-bot-worker-service-runtime.ts`;
- API takeover locks: `apps/api/src/conversation-ticket.atomic-writes.ts`;
- M8 runtime fake/compiler/true-DB runner and M6B persistence/loader tests;
- M11-03B fake Prisma, barrier and true-DB race patterns.

Existing enums, the dedupe unique key and conversation natural key are
sufficient for this lock-driven slice, including
`MessageDeliveryStatus.QUEUED/CANCELLED`. Active-ticket and AI-intent uniqueness
will be enforced under the conversation lock, not claimed as schema constraints;
no schema/migration is authorized.

The worker runtime is 398 nonblank lines and its Prisma persistence is 372
nonblank lines. Two new source files are authorized to move/refine the existing
path without exceeding the 400-line ceiling:

- `telegram-bot-conversation.flow.ts` owns shared runtime contracts and the
  prepare -> answer/handoff -> claim -> send -> finalize orchestration;
- `telegram-bot-conversation.atomic-writes.ts` owns the single RLS lock/state
  machine and absorbs the existing conversation/message/ticket write helpers.

The existing files remain the runtime entry/facade; no second queue, gateway,
provider adapter or persistence implementation is allowed.

## 触碰模块/文件

- `docs/specs/M11-04A-worker-ownership-send-fence.md`
- `docs/evidence/M11/M11-04A-worker-ownership-send-fence.md`
- `.github/workflows/ci.yml`
- `apps/worker/src/conversation-runtime.ts`
- `apps/worker/src/telegram-bot-conversation-persistence.ts`
- `apps/worker/src/telegram-bot-worker-service-runtime.ts`
- `apps/worker/src/telegram-bot-conversation.flow.ts`
- `apps/worker/src/telegram-bot-conversation.atomic-writes.ts`
- `apps/api/src/conversation-ticket.atomic-writes.ts`
- `apps/api/src/conversation-ticket.repository.ts`
- `scripts/tests/m6b-conversation-runtime.test.mjs`
- `scripts/tests/m6b-equivalent-bot-webhook-drive.test.mjs`
- `scripts/tests/m8-bot-runtime-answer-loop-support.mjs`
- `scripts/tests/m8-bot-runtime-answer-loop-v0.test.mjs`
- `scripts/tests/m8-conversation-ticket-api-fixture.mjs`
- `scripts/tests/m11-atomic-takeover.test.mjs`
- `scripts/tests/m11-worker-ownership-fence.test.mjs`
- `packages/db/scripts/run-m6b-conversation-runtime-true-db-smoke.mjs`
- `packages/db/scripts/tests/m8-active-answer-worker-smoke-support.mjs`
- `packages/db/scripts/tests/run-m11-worker-ownership-fence-true-db-smoke.mjs`

## Read-only Anchors

- `apps/worker/src/telegram-bot-ticket-follow-up.ts`
- `apps/worker/src/telegram-bot-active-answer-runtime.ts`
- `packages/channels/src/index.ts`
- `packages/db/prisma/schema.prisma`
- `packages/db/migrations/0003_channel_conversation_ticket_foundation.sql`
- `packages/db/scripts/tests/run-m8-active-answer-worker-true-db-smoke.mjs`
- `packages/db/scripts/tests/run-m11-atomic-takeover-true-db-smoke.mjs`

## Change Budget

- Source: changed source files <= 8, net source LOC <= 600, new source files <= 2.
- New source: one moved/refined runtime flow and one atomic RLS writer; both and
  all touched ordinary source files must remain within lint/complexity limits.
- Test/support: changed files <= 9, new files <= 2; no deletion, skip/only,
  weakened assertion, broad mock or snapshot expansion.
- Config: one CI workflow edit.
- Docs: this spec and one evidence record.
- Schema/migration/generated/lock/deploy/provider adapter: none.
- Exceptions: none.

## Durable Preparation Contract

Every admitted update on the Prisma production path enters one bounded RLS
interactive transaction before LLM/send:

1. set `uzmax_app_runtime` and scoped org/tenant settings;
2. reserve or recover the scoped Telegram update dedupe row using the stable
   update-to-intent identity defined below;
3. lock/upsert customer identity using the existing advisory-key contract;
4. create or update the conversation by its scoped channel/external natural key
   without changing an existing status;
5. lock the canonical conversation row;
6. lock every non-closed ticket in ID order;
7. persist exactly one inbound message using the canonical conversation ID;
8. validate the complete ticket matrix, then apply the disposition below. Every
   invalid-matrix error rolls the whole transaction back.

Ticket-matrix validation precedes every normal-state row. Multiple active
tickets or any invalid conversation/ticket combination wins over the table and
returns one sanitized conflict with zero dedupe/identity/inbound/intent/ticket
writes.

| Conversation | Active ticket | Requested path | Result |
|---|---|---|---|
| missing | none | answerable text | create `OPEN`; create one AI `QUEUED/generating` intent; `answer_ready` |
| `OPEN` | none or one unowned `OPEN` | answerable text | preserve `OPEN`; create one AI `QUEUED/generating` intent; `answer_ready` |
| `OPEN` | assigned-only `CLAIMED`/`REOPENED` | any | preserve state/ticket/owner; store inbound/customer; increment unread; `stored_for_operator`; zero intent/LLM/send/new ticket |
| `PENDING_HANDOFF` | one unowned `OPEN` or assigned-only `CLAIMED`/`REOPENED` | any | preserve state/ticket/owner; store inbound/customer; increment unread; `stored_for_operator`; zero intent/LLM/send/new ticket |
| `HANDOFF` | one valid assigned-only or fully owned ticket | any | preserve state/ticket/owner; store inbound/customer; increment unread; `stored_for_operator`; zero intent/LLM/send/new ticket |
| `CLOSED` | none | any | preserve `CLOSED`; store inbound/customer; increment unread; `stored_for_operator`; zero intent/LLM/send/new ticket |
| missing/`OPEN` | none or one unowned `OPEN` | non-answerable | set/create `PENDING_HANDOFF`; create one active unowned ticket only when none exists, otherwise reuse it |
| `OPEN` | fully owned `LOCKED`/`ESCALATED` | any | invalid matrix; sanitized conflict; zero writes |
| `PENDING_HANDOFF` | none/fully owned/other invalid state | any | invalid matrix; sanitized conflict; zero writes |
| `HANDOFF` | none/unowned/other invalid state | any | invalid matrix; sanitized conflict; zero writes |
| `CLOSED` | any active ticket | any | invalid matrix; sanitized conflict; zero writes |

A prepared answer whose runtime later returns handoff/failure never re-enters
the preparation table. It exclusively follows the separate Handoff And
Follow-up transaction below.

The AI intent is a normal tenant-scoped outbound `message` row with status
`QUEUED` and server-only JSON markers
`runtimeOrigin="telegram_bot_ai"` and `dispatchPhase="generating"`. It contains
no answer text until the LLM result passes the claim transaction. Existing
human-state inbound must create no outbound row at all.

The intent ID is a deterministic server UUID derived only from scoped
`orgId/tenantId/channelConnectionId/providerUpdateId`. Those marker keys/values
and the ID derivation are server-reserved and cannot be supplied by API/operator
input. The stable ID lets a restarted worker locate the exact intent without a
schema change. The runtime must use the canonical conversation ID returned by
preparation; the pre-generated draft UUID must never drive later writes.

`telegram_update_dedupe.processedAt` means terminal processing, not preparation:

- `answer_ready` leaves it `NULL`;
- stored-for-operator, automatic handoff, cancelled recovery, `SENT`, definitive
  `FAILED` and delivery-uncertain terminalization set it in the same transaction
  as their terminal state;
- a duplicate with terminal intent/state returns `deduped` with zero side
  effects;
- a duplicate with `QUEUED/generating` atomically cancels the intent, routes a
  still-Bot-owned conversation to one human ticket, sets `processedAt` and
  returns `handoff_recovered`; it never repeats the LLM/send;
- a duplicate with `QUEUED/claimed` atomically changes to
  `dispatchPhase="uncertain"` plus `deliveryUncertain=true`, routes a still-open
  conversation to one human ticket, sets `processedAt` and returns
  `delivery_uncertain`; it never sends again.

Thus a crash after preparation or claim cannot orphan a silently retryable AI
send.

## Handoff And Follow-up Contract

- An answer decision that fails or requires handoff locks conversation -> active
  tickets -> its queued AI intent, changes the intent to `CANCELLED`, and only
  when conversation is still `OPEN` moves it to `PENDING_HANDOFF` and
  creates/reuses one unowned active ticket. `OPEN` with assigned-only
  `CLAIMED/REOPENED` is already operator-owned and is preserved; fully owned or
  multiple invalid matrices conflict with zero writes.
- If API takeover/close has already changed ownership, worker preserves that
  state and the existing ticket/owner/lock/event history.
- Answer follow-up may create/reuse one unowned active ticket only in the
  successful pre-send claim while conversation is still `OPEN`; it must not
  create a second ticket after takeover.
- New automatic ticket creation emits one `CREATED` event with server UUID/time
  and sanitized trace metadata. Reuse emits no duplicate event and never
  assigns/locks/de-escalates the ticket.

## Pre-send Claim And Finalization

After an answered LLM result, the worker opens a second bounded RLS transaction:

1. lock canonical conversation;
2. lock active tickets in ID order;
3. lock the exact AI-origin queued intent;
4. re-read state and require the Bot-eligible `OPEN + none/unowned OPEN ticket`
   matrix, intent `QUEUED` and `dispatchPhase="generating"`;
5. on success write the bounded answer text and set
   `dispatchPhase="claimed"`; on a valid human/closed/cancelled state mark the
   intent `CANCELLED`, terminalize the dedupe and return `suppressed`; invalid
   ticket matrices conflict and roll back.

The successful claim commit is the send linearization point:

- takeover committed first -> claim is suppressed and Telegram is never called;
- claim committed first -> this one Telegram call may complete; a later takeover
  remains authoritative for future ownership.

The network call must not run inside a DB transaction. This leaves a narrow,
explicit claim-to-HTTP interval in which a later takeover cannot retract the
already claimed send. Eliminating that interval would require a new durable
`SENDING` lease/outbox/schema contract and is not silently claimed here.

Finalization locks the same conversation -> active tickets -> exact intent order.
A successful send only updates the intent to provider status/reference/server
time plus safe provider acknowledgement metadata and terminalizes the dedupe; it
never writes conversation status or ticket ownership.

A returned provider `SENT` acknowledgement is finalized as `SENT`. A returned
definitive `FAILED` result is finalized as `FAILED`. A timeout, network/parse
throw or returned nonterminal `QUEUED` result has unknown provider acceptance:
it remains delivery status `QUEUED`, changes to `dispatchPhase="uncertain"`,
sets `deliveryUncertain=true` and is never automatically sent again. Raw
provider errors are discarded.

Definitive failure or uncertain terminalization applies the message outcome,
dedupe terminalization and automatic handoff atomically in that finalization
transaction: only a valid still-Bot-owned `OPEN` conversation becomes
`PENDING_HANDOFF` and creates/reuses one unowned ticket; a newer human/closed
state and any persisted provider acknowledgement remain unchanged. A claimed
intent left `QUEUED/claimed` by a DB finalization failure is recovered as
uncertain by the duplicate contract above. M11-09 cannot pass with unresolved
`QUEUED/claimed` residue.

## API Takeover Cancellation

M11-03B takeover keeps its existing conversation -> active-ticket lock order,
then locks queued AI messages in stable ID order. Every read/lock/update is
scoped by exact `orgId + tenantId + conversationId`. A state-changing takeover
cancels only rows matching all of:

- direction `OUTBOUND`;
- delivery status `QUEUED`;
- `runtimeOrigin="telegram_bot_ai"`;
- `dispatchPhase="generating"`.

It must not blanket-cancel queued messages, claimed sends or future M11-06
operator replies. The conditional update repeats the exact scope plus
`QUEUED/generating` marker predicates, so a stale snapshot cannot cancel a
claimed row. Same-actor `already_owned` emits no duplicate cancellation or
event. Worker claim/finalize revalidates the marker and cannot resurrect a
cancelled intent.

The API in-memory repository snapshot/commit contract is extended with message
state so focused memory and Prisma cancellation share the same semantics; a
Prisma-only cancellation path is not accepted.

## Focused Concurrency Contract

- Existing `HANDOFF`, `PENDING_HANDOFF` and `CLOSED` each store admitted inbound
  with zero answer/send/outbound/new-ticket and unchanged state/owner/events.
- Duplicate human-state update persists one inbound and produces no LLM/send.
- Duplicate recovery cancels `QUEUED/generating` into one handoff and converts
  `QUEUED/claimed` to explicit uncertain without repeating LLM/send; terminal
  retries are plain dedupe.
- Takeover-first LLM barrier: wait for `answer()` entry, commit API takeover,
  assert the intent is `CANCELLED`, release LLM, then assert zero send, one
  human-owned ticket and `HANDOFF`.
- Claim-first barrier: send-port entry proves claim committed; assert DB marker
  phase `claimed`, record synthetic provider acceptance, commit API takeover,
  return the result, finalize, then assert one `SENT` message plus `HANDOFF`, one
  ticket and no worker `OPEN` write.
- Automatic handoff/takeover proves both orders with exact checkpoints: takeover
  commits before failed-answer handoff, and automatic handoff commits before
  takeover. Both reuse/create at most one unowned ticket and end with one lawful
  owner.
- Follow-up/takeover makes the answer runtime return a follow-up draft in both
  main barriers: takeover-first proves claim suppression discards the draft,
  while claim-first proves create/reuse before takeover is not duplicated.
- A thrown Telegram attempt produces one send call, one `QUEUED/uncertain`
  intent and one lawful automatic handoff; retry does not call Telegram again.
- Wrong tenant sees no conversation, dedupe, customer/identity, inbound/AI
  marker, ticket or ticket event and cannot mutate tenant A.

Barriers must signal exact checkpoints; eager `Promise.all` start order is not
accepted as race evidence.

## True PostgreSQL And CI Contract

- Keep existing M6B/M8 true-DB smokes and strengthen M6B's old duplicate-ticket
  expectation from two tickets to one; this is assertion strengthening.
- Add a self-invoking sanitized runner/CI step named
  `M11 worker ownership fence true DB smoke` after the M11 atomic takeover smoke
  and before Redis worker smokes.
- The new runner uses no Redis and reuses the M8 worker compiler plus compiled
  M11-03B API service against the controlled RLS database.
- It must prove existing human-state zero LLM/send/new-ticket, LLM-barrier
  takeover-first suppression, claim-first send finalization without ownership
  overwrite, generating/claimed crash recovery, exact AI marker/dedupe terminal
  states, ticket uniqueness, wrong-tenant isolation and cleanup residue zero.
- It catches every failure and emits only
  `m11-worker-ownership-fence-true-db-smoke-failed`; no plaintext, participant
  ref, user identity, raw error, SQL, DB URL or secret may reach CI output.

## Implementation Steps

1. Commit this spec/evidence before source edits.
2. Refactor the existing runtime contracts/orchestration into the authorized flow
   file without changing external queue/provider contracts.
3. Move existing persistence helpers into one atomic worker writer and implement
   preparation, handoff, claim and finalization under the frozen lock order.
4. Make the Prisma facade and telemetry fallback consume the new contract; active
   answer remains fail-closed when the durable fence is unavailable.
5. Extend API takeover with narrowly filtered unclaimed-AI cancellation.
6. Upgrade focused fakes/loaders and the existing M6B assertion; add barrier and
   true-DB race proof plus the CI step.
7. Run focused/full static/test/build gates, spec compliance first, then code
   quality/security/RLS review; merge only with latest-SHA CI green.

## Pass Conditions

- All Prisma-path admitted inbound in a valid ownership matrix is durable before
  LLM/send and deduped before those side effects.
- Existing human/closed state produces zero LLM/send/outbound/new-ticket and is
  never changed by worker persistence.
- No answer/handoff/finalization path can write conversation `OPEN` over a newer
  owner state.
- Telegram failure/ambiguity is durable, routes a still-open conversation to one
  human ticket and is never blindly retried.
- Preparation/claim crash retries recover to one explicit handoff/uncertain
  terminal state without repeating LLM/send.
- Takeover-first and claim-first races match the frozen linearization contract;
  queued generating intents are cancelled and cannot resurrect.
- Automatic handoff/follow-up creates or reuses at most one active ticket under
  the same conversation-first lock order as the API.
- RLS/wrong-tenant behavior, exact marker/event outcomes and residue zero pass in
  real PostgreSQL.
- Focused tests, format/type/lint/depcruise/jscpd/knip, repository guards, full
  tests/build, pr-shape, spec compliance and quality review pass within budget.

## Failure Branches

- Any schema/RLS-policy/`SENDING` lease requirement -> stop and open a globally
  serial DB/outbox spec; do not hide it in this slice.
- If source exceeds 600 or either new module/file exceeds lint limits -> stop,
  narrow/refactor the moved implementation or open another serial source slice;
  no silent budget exception.
- If the transaction pooler cannot run the fixed bounded interactive locks ->
  keep 04A open and use an ADR-backed runtime path; never return to
  read-then-save ownership writes.
- If true DB cannot deterministically prove both race orders, RLS and residue
  zero -> keep the slice open; local fake evidence is not a substitute.
- If multiple active tickets are encountered -> fail the update with sanitized
  conflict and zero writes; do not choose a winner or create another ticket.

## Out Of Scope

- atomic close, human reopen and explicit authorized Bot resume: M11-04B;
- LLM call-log persistence/provider-policy changes: M11-05;
- operator outbox/reply/send/ack: M11-06/M11-07;
- admin composer/controls and aligned staging E2E: M11-08/M11-09;
- schema/migration/lock/deploy/provider adapter, Telegram Business, production,
  real customer/order data, GA or 1.0.

## Validation

- focused M6B/M8/M11 Node tests listed above
- controlled CI M11 worker ownership-fence true-DB runner
- `npm run format:check`
- `npm run typecheck`
- `npm run lint`
- `npm run depcruise`
- `npm run jscpd`
- `npm run knip`
- `npm run test`
- `npm run build`
- `node scripts/guards/pr-shape.mjs --base main --spec docs/specs/M11-04A-worker-ownership-send-fence.md --include-worktree`
- `git diff --check main...HEAD`
- `git diff --check`
