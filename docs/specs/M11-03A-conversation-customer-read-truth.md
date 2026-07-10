# M11-03A Conversation Customer Read Truth

Spec ID: M11-03A
Status: `approved_for_execution`
Owner confirmation point: on 2026-07-10 the project owner asked the AI agents to continue until the M11 Value-0 support loop is genuinely usable. M11-00 explicitly permits serial sub-slices when a source budget would otherwise be exceeded.
Timebox: one read-only runtime slice; stop after conversation/message/customer/operator truth is executed by focused, full-repository and true-DB CI gates.

## Spec 类型

feature

## Split Decision

The decision-complete M11-03 contract combined read truth, atomic takeover and
legacy ticket-action concurrency protection. Its first implementation shape
reached 615 net source lines before repository/mappers/runtime wiring and put a
single new ownership file at 559 lines. Continuing would violate both the 600
net source budget and the ordinary 400-line file limit.

M11-03 is therefore split without changing the Value-0 outcome:

- M11-03A (this spec): authorized read truth plus a CI-executed true-DB gate;
- M11-03B (next serial spec after 03A merge): atomic takeover and ticket-action
  lock protocol.

M11-03A must not claim takeover safety or expose an actionable takeover
eligibility. M11-03 remains open until both sub-slices pass.

## Goal

Turn the M11-02 tenant-scoped inbound rows into an authorized, bounded support
conversation detail:

1. return message content with real delivery status and provider message ref;
2. resolve the conversation participant to the existing Telegram Bot identity
   and customer without creating, repairing or reviving data;
3. return a strict customer context state with only bounded profile fields;
4. return deterministic operator ownership/mode truth for the current
   conversation and tickets;
5. make the server own one Value-0 SLA selector across top-level detail/tickets;
6. execute the existing conversation-ticket true-DB runner explicitly in CI.

## Source Of Truth

- `AGENTS.md`
- `docs/specs/M11-00-value0-customer-service-closure-contract.md`
- `docs/specs/M11-02-allowlisted-inbound-customer.md`
- `UZMAX智能运营系统-PRD-v1.1.md`
- `UZMAX智能运营系统-技术架构-v1.1.md`
- `docs/adr/ADR-003-llm-data-processing.md`
- merged M11-02 identity uniqueness/profile normalization
- the reviewed M11-03B handoff contract preserved in the durable appendix below

## AI Agent Responsibilities

- Write only in the assigned M11-03A worktree/branch; root/main stays read-only.
- Keep message plaintext, profile, test identity, secrets and DB URL out of logs,
  evidence and PR metadata.
- Reuse the conversation-ticket repository/service, M11-02 identity rows and
  existing M10 true-DB runner; do not call the broad customer-asset service or
  create a parallel runtime/runner.
- Keep production reads under selected org/tenant RLS and return explicit
  missing/conflict states rather than guessing or repairing.
- Run spec compliance before code quality and archive exact validation truth.

## Preconditions

- Base main: `9b49a779af4ec88e37f2ff6321383df7c184d164`.
- Worktree: `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/m11-03a-conversation-customer-read`.
- Branch: `codex/m11-03a-conversation-customer-read`.
- Root/main is clean and coordination-only.
- M11-02 merged as PR #300 and its worktree/branches were removed.
- M11-01 owner login remains a bounded M11-09 live handoff.
- The over-budget combined implementation stopped before repository/test/CI
  changes; it did not change schema, deployment or external state.

## Existing-Implementation Search

`rg` found the exact extensions:

- types/mapping/detail aggregation: `conversation-ticket.types.ts`,
  `conversation-ticket.db-mappers.ts`, `conversation-ticket.service.ts`;
- tenant RLS reads: `conversation-ticket.repository.ts`;
- direct bounded profile helper:
  `packages/channels/src/telegram-bot-inbound-contract.ts` (already compiled by
  the API runtime compiler; not re-exported by channel index);
- existing true-DB entrypoint:
  `packages/db/scripts/run-m10-conversation-ticket-actions-true-db-smoke.mjs`,
  whose helper is not currently called by CI.

One new `conversation-ticket.ownership.ts` is allowed only as a compact pure
read-model module for customer/operator state. It may not contain takeover,
interactive write transaction or ticket-action mutation code in 03A.

## 触碰模块/文件

- `docs/specs/M11-03A-conversation-customer-read-truth.md`
- `docs/evidence/M11/M11-03A-conversation-customer-read-truth.md`
- `.github/workflows/ci.yml`
- `apps/api/src/conversation-ticket.types.ts`
- `apps/api/src/conversation-ticket.db-mappers.ts`
- `apps/api/src/conversation-ticket.repository.ts`
- `apps/api/src/conversation-ticket.ownership.ts`
- `apps/api/src/conversation-ticket.service.ts`
- `apps/api/scripts/runtime-compiler.mjs`
- `scripts/tests/m2-conversation-ticket-test-harness.mjs`
- `scripts/tests/m8-conversation-ticket-api-fixture.mjs`
- `scripts/tests/m8-db-backed-conversation-ticket-api.test.mjs`
- `scripts/tests/m10-conversation-ticket-actions-true-db-smoke.test.mjs`
- `scripts/tests/m11-conversation-customer-read.test.mjs`
- `packages/db/scripts/tests/run-m10-conversation-ticket-actions-true-db-smoke.mjs`
- `packages/db/scripts/tests/conversation-ticket-true-db-support.mjs`

Read-only anchors:

- `packages/db/prisma/schema.prisma`
- `packages/channels/src/telegram-bot-inbound-contract.ts`
- `packages/channels/src/index.ts`
- `packages/capabilities/handoff/src/index.ts`
- `packages/db/scripts/run-m10-conversation-ticket-actions-true-db-smoke.mjs`
- `render.yaml`

## Change Budget

- Source: changed source files <= 6, net source LOC <= 450, new source files <= 1.
- New source: one compact pure read-model module, justified because the existing
  repository already exceeds the ordinary 400-line limit.
- Test/support: changed test files <= 7, new test/support files <= 2; no deleted
  tests, skip/only, weakened assertion, broad mock or snapshot expansion.
- Config: one CI workflow edit; no secret/env/deploy/branch-protection mutation.
- Docs: this spec and one evidence record.
- Schema/migration/generated/lock/deploy/provider adapter: none.
- Exceptions: none.

## Read Contract

`GET /conversation-ticket/conversations/:conversationId` keeps existing fields
and still requires only `conversation:read`.

Its exact root shape is:

```ts
{
  conversation, // existing HandoffConversation only
  messages,
  tickets,
  customerContext,
  operatorState,
  slaPolicyRef: "value0-staging-support-default-v1",
  takeoverReadiness: "blocked_pending_m11_03b"
}
```

M11-03A must not add `slaPolicyRef`, `takeoverReadiness`, `canTakeover` or any
other actionable takeover signal inside the nested `conversation`. The current
admin treats `conversation.slaPolicyRef` as permission to call the legacy
non-atomic handoff, so root-only placement is a safety boundary. Focused tests
must prove the nested conversation has none of those fields and the existing
admin remains blocked by its missing nested SLA signal.

### Message truth

Each message includes `deliveryStatus` and optional `externalMessageRef`.
`externalMessageRef` is trimmed and response-truncated to 256 characters.
Business content remains readable only in this authorized response; content/ref
is never copied to logs/evidence.

### Customer context

The response always has one discriminated object:

- state-only: `identity_missing | identity_ambiguous | identity_link_mismatch`;
- linked-shape: `linked | identity_archived | identity_merged |
  customer_missing | customer_archived`, with bounded `identity`, optional
  `customer` and optional strict `profile`.

Allowed identity fields: ID, customer ID, status, provider, external subject,
first/last seen. Allowed customer fields: ID, status and trimmed/truncated
64-character `preferredLanguage`. Allowed profile fields: `firstName`,
`lastName`, derived `displayName`, `username`, `languageCode`.

Resolution is exact:

1. start from the scoped conversation;
2. derive provider from its scoped channel connection;
3. resolve identity by `(orgId, tenantId, provider, participantExternalRef)`;
4. resolve customer by scoped identity customer ID;
5. do not require identity's latest `channelConnectionId` to equal the old
   conversation connection, because M11-02's canonical key is provider+subject;
6. never participant-only fallback, create, relink or revive.

Map only stored profile camelCase known keys into
`{first_name,last_name,username,language_code}` before calling the direct
`normalizeTelegramBotParticipantProfile` module. Do not trust stored displayName
or return raw/unknown metadata. `preferredLanguage` and `languageCode` remain
separate.

Precedence is: link/provider mismatch -> identity missing/ambiguous -> identity
archived/merged -> customer missing/archived -> linked. State-only variants
expose no customer/profile; archived/merged includes bounded identity/profile
and customer only if present; customer-missing omits customer.

### Operator/SLA truth

Every top-level detail and returned ticket uses server constant
`value0-staging-support-default-v1`; ticket source remains
`config_placeholder`, and dueAt stays stored/null. No client/LLM SLA input is
used and this is not a formal response-time promise.

Only `CLOSED` tickets are inactive. Valid active matrices are:

- `OPEN`: unassigned/unlocked;
- `CLAIMED` or `REOPENED`: assigned, unlocked;
- `LOCKED` or `ESCALATED`: assigned and locked to the same user.

Everything else and multiple active tickets is conflict. Mode mapping:

- closed conversation + no active ticket -> `closed`;
- open + none/unassigned -> `bot`;
- open + assigned-only -> `awaiting_operator`;
- pending handoff + unassigned/assigned-only -> `awaiting_operator`;
- handoff + valid assigned-only or same-owner locked/escalated -> `human`;
- every contradictory combination -> `conflict`.

Ownership is `none | unassigned | self | other | conflict`. M11-03A returns
`takeoverReadiness=blocked_pending_m11_03b` and does not expose actionable
`canTakeover`; M11-03B owns permission-aware eligibility and atomic mutation.
Closed conversation `aiState` is `suspended`.

Ownership maps exactly: no active ticket -> `none`; one valid unowned `OPEN`
ticket -> `unassigned`; one valid assigned-only or assigned+locked ticket ->
`self`/`other` by comparing `assignedUserId` with the requesting
`AccessContext.userId`; invalid/multiple ticket state -> `conflict`. In the mode
table, “same-owner” means `assignedUserId === lockedByUserId`; it does not mean
the requesting user until the separate ownership comparison is performed.

## M11-03B Durable Handoff Contract

This appendix preserves the already reviewed next-slice contract after squash
merge/branch cleanup. M11-03B may narrow implementation shape but must not weaken
these decisions without a new owner-visible spec decision.

### Atomic takeover

- Endpoint remains `POST /conversation-ticket/conversations/:id/handoff` and
  requires `conversation:read` plus `ticket:write`.
- Actor is only `AccessContext.userId`; client actor/SLA/owner/lock/time are
  ignored. `reason` is trimmed, required and rejected above 500 characters.
- One Prisma interactive RLS transaction executes: set runtime role and tenant
  settings -> lock scoped conversation -> lock all non-closed tickets in stable
  ID order -> validate -> ticket/conversation/events -> readback.
- Only `OPEN` with no ticket may create. `OPEN`/`PENDING_HANDOFF` may reuse one
  unassigned `OPEN`. `PENDING_HANDOFF` without a ticket is 409/zero-write.
- A same-actor `CLAIMED`/`REOPENED` ticket advances to `LOCKED`; a same-actor
  `HANDOFF` + `LOCKED`/`ESCALATED` is `already_owned`, no event/de-escalation.
- Closed conversation, multiple active tickets, invalid matrix, other owner, or
  fully owned ticket while conversation is not `HANDOFF` is opaque 409 and zero
  writes. Wrong tenant/not found remains opaque 404.
- Success sets conversation `HANDOFF`, ticket assigned+locked to actor and
  status `LOCKED`; it returns `created | reused | already_owned`.

### Events and concurrency

- New ticket events: `CREATED`, `CLAIMED`, `LOCKED`; reused unassigned:
  `CLAIMED`, `LOCKED`; assigned-only same actor: `LOCKED`.
- Events use one server base instant plus monotonic 1ms increments and stable
  UUIDs, so semantic order is deterministic. Payload may contain bounded reason
  and transition metadata, never message/profile/raw request.
- Same-actor serial/concurrent retries yield one ticket/one event sequence;
  different actors yield one success/one 409 with no owner overwrite.

### Existing ticket actions

- To start from ticket ID without reversing lock order: perform one scoped
  unlocked lookup for immutable conversation ID, lock conversation, then lock
  and re-read ticket; never lock ticket first.
- `claim`: only `OPEN`/`PENDING_HANDOFF` + unowned `OPEN` -> assigned-only
  `CLAIMED`.
- `lock`: only `HANDOFF` + same-actor assigned-only `CLAIMED`/`REOPENED` ->
  assigned+locked `LOCKED`.
- `note`: only `HANDOFF` + valid actor-owned assigned/locked state; no ownership
  change.
- `escalate`: only `HANDOFF` + actor-owned `LOCKED` -> `ESCALATED`, preserving
  assignment/lock.
- `close` and `reopen`: opaque 409/zero-write until M11-04 performs atomic
  conversation+ticket close/reopen and explicit Bot resume.
- Resulting state is validated before update/event insert; OPEN-direct-lock,
  LOCKED-reclaim and CLAIMED-direct-escalate are zero-write conflicts.

### Required proof

- In-memory behavior matches production outcomes; fake Prisma has transaction
  snapshots/rollback and a real mutex/barrier, not eager Promise-all evidence.
- True PostgreSQL proves same/different actor races, takeover-vs-legacy-claim,
  reused ticket, multi-ticket/closed/pending-no-ticket/wrong-tenant failures,
  exact events and residue=0.
- CI failure output is sanitized and no message/profile/identity/DB URL appears.

## CI And True-DB Contract

- Extend the existing M10 helper with M11-02 message/customer/identity seed and
  authorized detail/RLS/read-boundary assertions; retain existing M10 handoff
  action regression behavior unchanged in 03A.
- Add a CI DB-only step named `M11 conversation/customer read true DB smoke` that
  runs the existing wrapper after M6B DB smoke and before Redis worker smokes.
- Include `.github/workflows/ci.yml` in true-DB path classification.
- Extract synthetic helper utilities to the listed support file only if needed
  to keep test files under limits.
- Exported runner catches failures and exposes only a stable sanitized token;
  no content/profile/identity/ref/DB URL is logged.

## Implementation Steps

1. Freeze and commit this split spec before resuming source edits.
2. Remove the stopped takeover/controller/error/write changes from the partial
   implementation; keep only read-truth work authorized here.
3. Implement strict types, compact pure mapping/state derivation, RLS customer
   reads, message/SLA mapping and detail aggregation.
4. Extend focused fixtures/tests and the existing M10 true-DB helper, then add
   the explicit CI step.
5. Run focused/full/static/build/true-DB gates.
6. Run spec compliance first and code quality/privacy/RLS review second; merge
   only with no blocker/major.

## Pass Conditions

- Authorized detail returns readable content, delivery/ref, explicit customer
  context, bounded profile, operator mode/ownership and one server SLA value.
- Extra/overlong metadata is absent/bounded; read performs zero repair/write.
- Provider+participant resolution remains tenant/provider isolated and works
  when identity's latest connection differs from an older conversation.
- Archived/merged/missing/mismatch states follow deterministic precedence.
- Invalid/multiple ticket state is conflict; takeover readiness remains blocked.
- Root SLA/readiness never appears on nested conversation and cannot enable the
  existing admin's legacy handoff.
- Tenant B sees zero tenant A rows.
- CI explicitly runs the true-DB helper; cleanup residue=0 and logs are sanitized.
- Focused tests, format/type/lint/depcruise/jscpd/knip, full tests/build,
  pr-shape, spec compliance and code quality pass within budget.

## Failure Branches

- Any schema/RLS-policy need -> stop and open globally serial DB spec.
- If canonical identity cannot be resolved without guessing -> explicit mismatch;
  no fallback.
- If net source exceeds 450 -> stop and split mapping/repository rather than
  increasing budget.
- If CI cannot execute the existing runner safely -> keep 03A open; local tests
  are not substitute evidence.

## Out Of Scope

- Atomic takeover, `canTakeover`, ticket-action locks and close/reopen/resume:
  M11-03B/M11-04.
- Worker ownership/send fence: M11-04.
- LLM accounting, operator outbox/send, admin UI, deploy/live E2E: M11-05..09.
- Schema/migration/lock/deploy/provider adapter, broad CRM, Telegram Business,
  orders, pricing, analytics, production, GA or 1.0.

## Validation

- focused Node tests for listed read/fixture/runner files
- controlled CI `node packages/db/scripts/run-m10-conversation-ticket-actions-true-db-smoke.mjs`
- `npm run format:check`
- `npm run typecheck`
- `npm run lint`
- `npm run depcruise`
- `npm run jscpd`
- `npm run knip`
- `npm run test`
- `npm run build`
- `node scripts/guards/pr-shape.mjs --base main --spec docs/specs/M11-03A-conversation-customer-read-truth.md --include-worktree`
- `git diff --check main...HEAD`
- `git diff --check`
