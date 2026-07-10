# M11-03 Conversation Customer Read And Atomic Takeover

Spec ID: M11-03
Status: `approved_for_execution`
Owner confirmation point: on 2026-07-10 the project owner asked the AI agents to continue until the approved Value-0 customer-service loop is genuinely usable. M11-00 already assigns this slice the conversation/customer read truth and atomic operator-takeover boundary.
Timebox: one narrow serial implementation slice; stop after the authorized detail read and ownership transaction pass focused, full-repository and true-DB gates.

## Spec 类型

feature

## Goal

Turn the M11-02 tenant-scoped inbound rows into an operator-readable and safely ownable support conversation:

1. return readable message content together with real delivery outcome/provider reference;
2. resolve the Telegram Bot participant to the existing customer identity/customer without creating or repairing data on the read path;
3. return a bounded customer profile and an explicit operator/ownership state rather than synthetic placeholders;
4. make the server, not the client or LLM, own the Value-0 SLA policy selector;
5. replace the current sequential conversation/ticket handoff writes with one RLS interactive transaction that locks the conversation, reuses or creates exactly one active ticket, assigns and locks it to the authenticated operator, suspends Bot ownership and writes the audit events atomically;
6. make repeated same-operator takeover idempotent and different-operator/concurrent takeover fail closed;
7. prevent the existing ticket-action endpoint from applying a stale pre-takeover snapshot over the new ownership by using the same conversation-first lock protocol.

## Source Of Truth

- `AGENTS.md`
- `docs/specs/M11-00-value0-customer-service-closure-contract.md`
- `docs/specs/M11-02-allowlisted-inbound-customer.md`
- `UZMAX智能运营系统-PRD-v1.1.md`
- `UZMAX智能运营系统-技术架构-v1.1.md`
- `docs/adr/ADR-003-llm-data-processing.md`
- `docs/adr/ADR-B01-telegram-business.md`
- M11-02 customer identity uniqueness and profile normalization in the merged source

## AI Agent Responsibilities

- Write only in the assigned M11-03 worktree and branch; root/main remains coordination-only.
- Keep message plaintext, customer profile, test identity, secrets and database URL out of logs, evidence and PR metadata.
- Use the existing conversation-ticket API/repository, M11-02 identity rows, handoff capability and M10 true-DB runner; do not add a parallel customer or ticket runtime.
- Keep every production read/write under the selected org/tenant RLS context.
- Treat inconsistent conversation/ticket/customer links as an explicit fail-closed state; do not silently repair, relink, revive or choose a winner.
- Run spec-compliance review before code-quality review and archive the exact validation results in M11-03 evidence.

## Preconditions

- Base main: `9b49a779af4ec88e37f2ff6321383df7c184d164`.
- Worktree: `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/m11-03-conversation-customer-takeover`.
- Branch: `codex/m11-03-conversation-customer-takeover`.
- Root/main checkout `/Users/atilla/Applications/UZMAX智能运营` is clean and coordination/read-only.
- M11-02 merged as PR #300 after latest-SHA CI passed all static, true-DB, Redis/worker, test and build gates; its worktree and branches were removed.
- `git branch --no-merged main` and `gh pr list --state open` were empty before this worktree was created.
- M11-01 owner login remains a bounded M11-09 live handoff; M11-00 authorizes M11-03 machine implementation before that owner action.

## Existing-Implementation Search

`rg` before source edits found the exact extension points:

- API contract, detail aggregation and handoff endpoint: `apps/api/src/conversation-ticket.types.ts`, `conversation-ticket.service.ts` and `conversation-ticket.controller.ts`.
- RLS reads/writes and DB mapping: `conversation-ticket.repository.ts` and `conversation-ticket.db-mappers.ts`.
- Current non-atomic handoff: `getConversation -> saveConversation -> saveTicket` in `conversation-ticket.service.ts`.
- Existing ticket actions also read then save in separate transactions and can race takeover.
- Existing customer/identity rows: M11-02 writes one identity by `(orgId, tenantId, provider, externalSubjectRef)` and may update its latest `channelConnectionId`.
- Existing bounded Telegram profile helper: `normalizeTelegramBotParticipantProfile` in `packages/channels/src/telegram-bot-inbound-contract.ts`, already exported by the channel package.
- Existing conversation-ticket true-DB seam: `packages/db/scripts/run-m10-conversation-ticket-actions-true-db-smoke.mjs` and its helper under `packages/db/scripts/tests/`; CI does not currently call it.

No parallel API, customer-asset service, DB runner or persistence path is justified. One new `conversation-ticket.ownership.ts` source file is justified because the existing repository is already over the ordinary 400-line source limit and ownership/state derivation plus transaction commands form one focused responsibility.

## 触碰模块/文件

- `docs/specs/M11-03-conversation-customer-read-atomic-takeover.md`
- `docs/evidence/M11/M11-03-conversation-customer-read-atomic-takeover.md`
- `.github/workflows/ci.yml`
- `apps/api/src/conversation-ticket.types.ts`
- `apps/api/src/conversation-ticket.db-mappers.ts`
- `apps/api/src/conversation-ticket.repository.ts`
- `apps/api/src/conversation-ticket.ownership.ts`
- `apps/api/src/conversation-ticket.service.ts`
- `apps/api/src/conversation-ticket.controller.ts`
- `apps/api/src/conversation-ticket.errors.ts`
- `apps/api/scripts/runtime-compiler.mjs`
- `scripts/tests/m2-conversation-ticket-test-harness.mjs`
- `scripts/tests/m8-conversation-ticket-api-fixture.mjs`
- `scripts/tests/m8-db-backed-conversation-ticket-api.test.mjs`
- `scripts/tests/m10-conversation-ticket-actions-true-db-smoke.test.mjs`
- `scripts/tests/m11-conversation-customer-takeover.test.mjs`
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

- Source: changed source files <= 8, net source LOC <= 600, new source files <= 1.
- New-source justification: `apps/api/src/conversation-ticket.ownership.ts` owns bounded reason/SLA constants, customer/operator read-state derivation and the atomic ownership command contract. It avoids growing the existing 434-line repository with a second responsibility and is not a parallel repository or service.
- Test/support: changed test files <= 7, new test/support files <= 2; no deleted tests, `.skip`/`.only`, weakened assertions, expanded snapshot or broad mock.
- Config: one serialized CI workflow edit; no secret, environment value, deployment or branch-protection change.
- Docs: this spec plus one evidence record.
- Schema/migration/generated/lock/deploy: none.
- Exceptions: none.

## Detail Read Contract

`GET /conversation-ticket/conversations/:conversationId` keeps the existing conversation/messages/tickets data and adds server-owned truth.

### Message truth

Each message adds:

- `deliveryStatus`: `received | queued | sent | failed | cancelled`;
- optional `externalMessageRef`, trimmed and projected to at most 256 characters on
  read. Stored over-length/untrusted values are truncated in the response, never
  echoed to logs, and are not rewritten by this read path.

The existing bounded business `content` remains readable only through this authorized tenant-scoped response. Neither content nor provider reference may be copied to logs/evidence.

### Customer context

The response always adds exactly one discriminated `customerContext` object:

- `{ state: "identity_missing" | "identity_ambiguous" | "identity_link_mismatch" }` with no customer/profile fields; or
- `{ state: "linked" | "identity_archived" | "identity_merged" | "customer_missing" | "customer_archived", identity: {...}, customer?: {...}, profile?: {...} }` using only the whitelist below.

The linked read model may expose only:

- customer ID/status and manual `preferredLanguage`, trimmed and projected to at
  most 64 characters on read;
- identity ID/status/provider/external subject/first seen/last seen;
- normalized `firstName`, `lastName`, derived `displayName`, `username` and `languageCode`.

The repository must:

1. start from the already tenant-scoped conversation;
2. derive the provider from that conversation's scoped `channel_connection`;
3. resolve identity by `(orgId, tenantId, provider, participantExternalRef)`;
4. then resolve the customer by the identity's scoped `customerId`;
5. never use participant-only lookup and never create, relink or revive a row;
6. deliberately not require identity `channelConnectionId` to equal the conversation connection, because M11-02's canonical identity key is provider + subject and its stored connection may move to the latest Bot connection;
7. fail closed if the provider/link/customer relation is missing, duplicated or inconsistent.

Stored profile metadata is untrusted read input. Build the exact adapter
`{ first_name: profile.firstName, last_name: profile.lastName, username: profile.username, language_code: profile.languageCode }`
from known camelCase keys and pass that object through the existing
`normalizeTelegramBotParticipantProfile` helper. This reuses M11-02's
128/128/64/16/256 boundaries and re-derives display name instead of trusting the
stored value. Never pass raw metadata to the helper and never return raw
identity/customer metadata or unknown profile keys. Manual `preferredLanguage`
and Telegram `languageCode` remain separate response fields; neither overwrites
the other and this slice defines no synthetic display-language field.

Archived/merged identity and archived/missing customer states remain visible as truth but are not presented as active. A missing context is not synthesized from `displayLabelRef` or participant ref.

### Operator state and SLA

The response adds:

- `slaPolicyRef = value0-staging-support-default-v1` selected only by the server;
- `operatorState.mode = bot | awaiting_operator | human | closed | conflict`;
- `operatorState.ownership = none | unassigned | self | other | conflict`;
- optional active ticket ID and `canTakeover`.

Only `CLOSED` tickets are inactive. More than one active ticket is `conflict`.
The valid active ticket matrices are exact:

- `OPEN`: no assigned user and no lock owner;
- `CLAIMED` or `REOPENED`: assigned user present and lock owner absent;
- `LOCKED` or `ESCALATED`: assigned user and lock owner are the same user.

A lock without assignment, two different users, or any status/ownership
combination outside that matrix is `conflict`. A closed conversation with an
active ticket, a handoff conversation without one valid owned active ticket, or
any other impossible combination is also `conflict`, not auto-repaired. Closed
conversation `aiState` is `suspended`.

`ownership` is `none` when there is no active ticket, `unassigned` for valid
unowned `OPEN`, `self`/`other` by comparing the valid assigned user to
`AccessContext.userId`, and `conflict` for every invalid matrix. `canTakeover`
is true only when the access context contains `ticket:write` and a takeover
would make a state transition: an `OPEN`/`PENDING_HANDOFF` conversation with no
active ticket or one valid unowned `OPEN` ticket, or a valid same-actor
`CLAIMED`/`REOPENED` ticket that can advance to `LOCKED`. It is false for a
reader without `ticket:write`, another operator, an already-owned `LOCKED`
ticket, closed state or conflict.

Client `slaPolicyRef`, actor, lock owner and timestamp fields are ignored. The
top-level detail and every returned ticket use the same server constant
`value0-staging-support-default-v1`; the existing ticket SLA `source` remains
`config_placeholder` to state explicitly that this is a Value-0 server selector,
not a formal SLA. New/reused tickets keep their stored `slaDueAt` or null; this
slice does not claim a formal response-time promise and the LLM never computes
SLA.

## Atomic Takeover Contract

`POST /conversation-ticket/conversations/:conversationId/handoff` requires both
`conversation:read` and `ticket:write`. The authenticated
`AccessContext.userId` is the only actor. The request contributes only `reason`:
trim it, reject empty input, and reject more than 500 characters with a 400
validation error rather than truncating it. Server time and UUIDs are generated
internally.

The RLS Prisma production path uses one interactive transaction and this fixed order:

1. `SET LOCAL ROLE uzmax_app_runtime` and set `app.org_id`/`app.tenant_id`;
2. select the scoped conversation `FOR UPDATE`; missing/wrong tenant is the same 404;
3. select every non-closed ticket for that conversation in stable ID order `FOR UPDATE`;
4. reject closed conversation, more than one active ticket, contradictory ticket state or another operator ownership with 409 and zero writes;
5. reuse one valid unassigned `OPEN` ticket, advance a valid same-actor `CLAIMED`/`REOPENED` ticket, or create one when none exists;
6. set ticket status `LOCKED`, `assignedUserId` and `lockedByUserId` to the authenticated actor;
7. set conversation status `HANDOFF`;
8. write only the required `CREATED`, `CLAIMED` and `LOCKED` ticket events in the same transaction;
9. read back the committed-shape conversation/ticket/operator state before returning.

For a new ticket, write `CREATED`, `CLAIMED`, `LOCKED`. For a reused unassigned
ticket, write only `CLAIMED`, `LOCKED`; for a valid same-actor assigned-only
ticket, write only `LOCKED`. The events use monotonic server timestamps derived
from one base instant (`base`, `base + 1ms`, `base + 2ms` as applicable) so DB
readback cannot reorder semantic transitions by random UUID. Event payload may
contain the bounded reason and state-transition metadata but no message content,
profile or raw request. If the same actor repeats after a committed takeover,
return the same ticket with `takeoverResult=already_owned` and write no event.
Concurrent same-actor calls produce one active ticket and one event sequence.
Concurrent different actors produce one success and one 409; the loser cannot
overwrite the owner.

The existing `/tickets/:ticketId/actions` mutation first performs only a scoped,
unlocked lookup/join to obtain the ticket's immutable `conversationId`; it then
locks the conversation, locks and re-reads the ticket, and only then applies the
domain action. It must never lock the ticket before the conversation. Client
actor/time remain ignored. This prevents a claim/lock/note request that read
before takeover from saving a stale ticket afterward, and true-DB validation
must include takeover racing legacy claim. `close` and `reopen` are deliberately
rejected with opaque 409 after scoped row/lock validation and zero writes until
M11-04 supplies the atomic cross-row close/reopen/resume state machine. The M10
smoke must replace its previous successful close/reopen expectation with this
stronger fail-closed assertion; this is an intentional safety-contract change,
not test weakening.

## Error Contract

Add opaque 409 mappings:

- `conversation_not_takeoverable`;
- `conversation_ownership_conflict`;
- `conversation_ticket_state_conflict`.

Cross-tenant and absent rows remain `conversation_not_found`/`ticket_not_found` 404. Error bodies must not disclose another tenant, operator ID, ticket list, message or customer profile.

## CI And True-DB Contract

- Extend the existing M10 conversation-ticket true-DB helper instead of adding a parallel M11 runner.
- Add one explicit CI step that runs `node packages/db/scripts/run-m10-conversation-ticket-actions-true-db-smoke.mjs` after the M6B DB-only smoke and before Redis worker smokes.
- Add `.github/workflows/ci.yml` to the true-DB path classifier so a workflow-only edit cannot skip the new gate.
- The helper may extract reusable synthetic seed/cleanup utilities to the listed test-support file if needed to stay below the 400-line file limit.
- The in-memory repository implements the same takeover outcomes; it may not
  retain the old sequential handoff semantics.
- The fake Prisma transaction uses transaction-local snapshots with commit and
  rollback plus a real mutex/barrier; eager `Promise.all` is not accepted as
  concurrency evidence.
- The true-DB helper catches assertion/runtime failures at its exported boundary
  and throws/logs only a stable sanitized failure token. Assertions must avoid
  embedding read models. CI output never prints message content, profile,
  identity refs or DB URL.

## Implementation Steps

1. Freeze this spec/evidence pair and commit it before source work.
2. Add the bounded detail/customer/operator types and pure mapping/state derivation.
3. Add the interactive RLS ownership transaction seam and route takeover plus existing ticket actions through it.
4. Make the controller accept only bounded business input and map the new opaque conflicts.
5. Extend the runtime compiler and focused fake/in-memory tests, including transaction rollback and real concurrency barriers rather than eager `Promise.all` false positives.
6. Extend the existing M10 true-DB runner and wire it as an explicit CI step.
7. Run focused tests, applicable format/type/lint/dependency gates, full repository tests/build and true-DB CI.
8. Run independent spec-compliance review first, code-quality/security/concurrency review second, then update evidence and merge only if both pass with no blocker/major.

## Pass Conditions

- Detail returns bounded readable content, delivery status/provider reference, explicit customer context, server SLA and operator state under only `conversation:read`.
- Unknown profile metadata and overlong profile fields are absent/bounded; read never creates or repairs data.
- Provider + participant identity linkage works across a moved/latest channel connection while remaining tenant/provider isolated.
- Archived/merged/missing/inconsistent customer links return explicit truth.
- Client actor/SLA/time/lock fields cannot influence state or audit.
- Takeover atomically sets conversation `HANDOFF`, reuses/creates one active ticket, assigns+locks it and writes exact events.
- Same-actor serial/concurrent retry is idempotent; different actors yield exactly one winner and one opaque 409.
- Multiple active tickets, closed conversation, contradictory ownership and wrong tenant are zero-write failures.
- Existing ticket action cannot stale-overwrite a concurrent takeover.
- Valid `CLAIMED`/`REOPENED` and `LOCKED`/`ESCALATED` ownership matrices remain
  readable, while invalid mixed ownership is conflict; close/reopen are opaque
  409 with zero mutation until M11-04.
- Takeover events read back in deterministic semantic order from monotonic
  timestamps.
- Tenant B sees zero tenant A conversation/message/customer/identity/ticket/event rows.
- True-DB cleanup leaves residue=0 and CI explicitly executes the runner.
- No test weakening, schema/migration/lock/deploy changes or plaintext/profile leakage.
- Source budget, focused tests, `git diff --check`, format/type/lint/depcruise/knip/jscpd, full tests/build, spec compliance and code quality all pass.

## Failure Branches

- If the canonical identity/customer read requires a schema/RLS-policy change, stop and open a globally serial DB spec; do not fallback to participant-only or connection-only guessing.
- If the interactive transaction cannot be composed through the current Prisma provider, split a narrow M11-03A transaction-seam spec; do not return to sequential saves.
- If the source implementation would exceed 600 net LOC, split read truth and ownership transaction into serial sub-slices before exceeding the budget.
- If a fake transaction cannot prove rollback/locking, rely on it only for contract tests and keep real PostgreSQL concurrent smoke mandatory.
- If multiple active tickets or inconsistent ownership already exist, surface conflict and stop; do not pick newest or auto-repair.

## Out Of Scope

- Worker inbound ownership fence, pre-send lease/race, close/explicit Bot resume state machine; M11-04 owns them.
- LLM accounting/prompt/model changes; M11-05 owns them.
- Operator reply permission/outbox/send/Telegram acknowledgement; M11-06/M11-07 own them.
- Admin UI/composer, deployment, secrets, owner login and live Telegram/browser E2E; M11-08/M11-09 own them.
- Customer fields/tags/journey/blacklist/broad CRM, Telegram Business, other channels, orders, pricing, analytics, production, GA or 1.0.
- Schema, migration, generated client, lockfile, deploy config or external provider adapter changes.

## Validation

- Focused Node tests for all listed conversation-ticket fixtures/tests.
- `node packages/db/scripts/run-m10-conversation-ticket-actions-true-db-smoke.mjs` in the controlled CI DB environment.
- `npm run format:check`
- `npm run typecheck`
- `npm run lint`
- `npm run depcruise`
- `npm run jscpd`
- `npm run knip`
- `npm run test`
- `npm run build`
- `node scripts/guards/pr-shape.mjs --base main --spec docs/specs/M11-03-conversation-customer-read-atomic-takeover.md --include-worktree`
- `git diff --check main...HEAD`
- `git diff --check`
