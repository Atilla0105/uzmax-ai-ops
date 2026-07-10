# M11-02 Allowlisted Inbound Customer Truth

Spec ID: M11-02
Status: `approved_for_execution`
Owner confirmation point: on 2026-07-10 the project owner asked the AI agents to complete the Value-0 customer-service loop approved and bounded by M11-00. This slice only admits the approved internal Telegram Test Bot chat, persists its bounded business message and customer identity/profile under tenant RLS, and rejects every other chat before business work.
Timebox: one narrow implementation slice; stop after the approved-chat ingress and customer persistence gates pass.

## Spec 类型

implementation

## Goal

Make inbound support data real and safe enough for the remaining Value-0 path:

1. fail startup for the real BullMQ Telegram Bot ingress/worker path when no valid approved-chat allowlist is configured;
2. reject an unapproved Telegram chat before API queue insertion and again at the worker boundary;
3. retain only bounded, allowlisted Telegram participant profile fields;
4. persist bounded readable inbound business content in `message.content` without copying plaintext to telemetry, audit or evidence;
5. idempotently link the Telegram participant to one tenant-scoped `customer` plus `customer_identity` inside the existing RLS transaction;
6. reuse the current schema, queue, conversation runtime and persistence adapter rather than creating a parallel customer-ingest path.

## Source Of Truth

- `AGENTS.md`
- `docs/specs/M11-00-value0-customer-service-closure-contract.md`
- `UZMAX智能运营系统-PRD-v1.1.md`
- `UZMAX智能运营系统-技术架构-v1.1.md`
- `docs/adr/ADR-003-llm-data-processing.md`
- `docs/adr/ADR-B01-telegram-business.md`
- Telegram Bot API update and user/message contracts already represented by the existing generated/local channel adapter contract
- Supabase RLS guidance: <https://supabase.com/docs/guides/database/postgres/row-level-security>
- Supabase Prisma guidance: <https://supabase.com/docs/guides/database/prisma>

## AI Agent Responsibilities

- Write only in the assigned M11-02 worktree and branch.
- Keep the configured allowlist, raw Telegram update and message plaintext out of logs, evidence, fixtures and committed config.
- Treat the webhook secret as transport authentication, not human-chat authorization.
- Enforce the same approved-chat rule at API ingress and worker consumption so an injected/stale queue item cannot bypass it.
- Keep identity and message writes inside the existing tenant RLS transaction and verify tenant separation.
- Run spec-compliance review before code-quality review, then archive the exact validation results here and in M11-02 evidence.

## Preconditions

- Base main: `dd73cc6fb196f859b18908332a9eefc1a7ff4133`.
- Worktree: `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/m11-02-allowlisted-inbound-customer`.
- Branch: `codex/m11-02-allowlisted-inbound-customer`.
- Root/main checkout `/Users/atilla/Applications/UZMAX智能运营` is coordination/read-only.
- Start audit showed a clean assigned worktree, clean root/main, no open PR and no other unmerged branch.
- M11-01 owner login remains a bounded live handoff; M11-00 explicitly allows M11-02 through M11-08 machine work to continue before live browser acceptance.

## Existing-Implementation Search

`rg` before source edits found the exact extension points:

- Telegram update normalization: `packages/channels/src/index.ts`.
- BullMQ ingress reservation: `apps/api/src/telegram-bot.ts`.
- Worker admission/runtime composition: `apps/worker/src/telegram-bot-worker-service-runtime.ts` and `apps/worker/src/worker-service-shell.ts`.
- Inbound business content shaping: `apps/worker/src/conversation-runtime.ts`.
- Tenant RLS transaction and message/conversation writes: `apps/worker/src/telegram-bot-conversation-persistence.ts`.

No new source module is justified. The existing Prisma schema already contains `customer`, `customer_identity`, `message` and the required compound identity uniqueness, so this spec forbids schema/migration work.

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：

  - `docs/specs/M11-02-allowlisted-inbound-customer.md`
  - `docs/evidence/M11/M11-02-allowlisted-inbound-customer.md`
  - `packages/channels/src/index.ts`
  - `apps/api/src/telegram-bot.ts`
  - `apps/worker/src/conversation-runtime.ts`
  - `apps/worker/src/telegram-bot-conversation-persistence.ts`
  - `apps/worker/src/telegram-bot-worker-service-runtime.ts`
  - `apps/worker/src/worker-service-shell.ts`
  - `scripts/tests/m2-telegram-bot-ingress.test.mjs`
  - `scripts/tests/m6b-conversation-runtime.test.mjs`
  - `scripts/tests/m6b-worker-telegram-consumer.test.mjs`
  - `scripts/tests/m8-bot-runtime-answer-loop-v0.test.mjs`

Read-only anchors:

- `AGENTS.md`
- `docs/specs/M11-00-value0-customer-service-closure-contract.md`
- `packages/db/prisma/schema.prisma`
- `packages/db/prisma/migrations/**`
- `render.yaml`

## Change Budget

- Source: changed source files <= 6, net source LOC <= 500, new source files = 0.
- Test: changed test files <= 4; no deleted tests, skipped tests, weakened assertions, enlarged snapshots or broad mocks.
- Docs: this spec plus one evidence record.
- Schema/migration/generated/lock/config/deploy: none.
- Exceptions: none.

## Contract

### Approved-chat admission

- Runtime env key: `UZMAX_TELEGRAM_BOT_ALLOWED_CHAT_REFS`.
- Value format: comma-separated canonical refs matching `telegram:chat:-?\d+`; blanks, malformed entries and an empty effective set fail closed in real BullMQ API/worker composition.
- The value is a secret deployment input and must never be echoed in an error or log.
- A supported Telegram update whose canonical chat ref is not in the set returns `rejected`, performs zero queue insertion and exposes no distinction that would leak allowlist membership to the webhook caller beyond the existing acknowledged request contract.
- The worker repeats the check before reserve/persistence/LLM/outbound. A rejected injected/stale job performs zero business writes, LLM calls and outbound calls.

### Participant profile

- Only Telegram `from` fields needed for customer context may survive normalization: stable participant ref, bounded `firstName`, `lastName`, derived `displayName`, `username` and `languageCode`.
- Chat title/username, arbitrary Telegram payload fields and raw update are not retained.
- Profile fields are not added to an LLM prompt by this slice.

### Business content

- Bounded normalized text/callback/file references required for operator support are persisted in the tenant-scoped `message.content` JSON.
- Message plaintext must not appear in structured logs, audit metadata, LLM accounting, evidence or fixtures.
- Existing metadata such as provider, update id, content kind, text length and trace id remains safe telemetry.

### Customer identity

- The canonical identity key is `(orgId, tenantId, provider, externalSubjectRef)` using the existing compound uniqueness.
- Repeated updates for one participant reuse one customer and identity, update last-seen/profile metadata and never overwrite a previously linked customer.
- The same external participant under another tenant resolves to another tenant-scoped customer/identity.
- Customer/identity upsert and inbound message/conversation write occur in the same existing RLS transaction; no global lookup or schema bypass is allowed.

## Implementation Steps

1. Add bounded participant profile normalization to the current channel adapter contract.
2. Parse and enforce the canonical allowlist in the BullMQ API ingress without changing disabled/local-only queue behavior.
3. Require and inject the same allowlist in the real worker composition; reject before job reservation.
4. Shape bounded readable business content and the customer-identity draft in the existing conversation runtime.
5. Extend the current Prisma-shaped persistence port to upsert customer/identity inside the existing RLS transaction before completing the inbound message write.
6. Update focused tests for retained business content/profile and add assertions for API rejection, worker defense, idempotent identity reuse and tenant isolation using existing test files only.
7. Run focused tests, formatter/lint/typecheck as applicable, full repo gates, spec-compliance review, then code-quality review.

## Pass Conditions

- Missing/malformed/empty allowlist fails real BullMQ API and worker startup without logging the supplied value.
- Unknown chat: queue add = 0; DB business writes = 0; LLM calls = 0; Telegram outbound = 0.
- Approved chat: queue add = 1 and worker persists bounded readable content under the correct tenant.
- Normalized profile contains only the allowed bounded fields and never retains chat username/title or arbitrary update payload.
- Two allowed updates from the same participant in one tenant resolve to one customer/identity; a second tenant does not reuse it.
- Message plaintext is present only in the business row path and absent from telemetry/evidence.
- Existing answer/handoff behavior remains covered; no test weakening.
- Focused tests, `git diff --check`, formatter/lint/typecheck gates and `guard:pr-shape` pass.
- Spec-compliance and code-quality reviews report no blocker/major before merge.

## Failure Branches

- If the existing schema cannot provide tenant-safe idempotent identity linking, stop and open a globally serial DB/RLS spec; do not add a migration here.
- If allowing readable content would copy plaintext into logs or accounting, fail closed and repair that leakage inside the listed runtime file before proceeding.
- If a worker admission check cannot be composed without config/deploy edits, keep deployment unchanged and split a later narrow infrastructure spec; do not commit the allowlist value.
- If Telegram payload behavior is not supported by the existing adapter contract/official Bot API evidence, stop and record the unsupported branch rather than inventing fields.
- If any validation requires production or real customer/order data, stop at controlled staging/internal fixtures.

## Out Of Scope

- Live env mutation, deployment, secret provisioning or staging E2E; those belong to M11-09.
- Owner login acceptance; M11-01 remains the handoff record.
- Conversation read-model expansion, takeover, pause/resume, LLM accounting, manual reply outbox, worker send acknowledgement or admin composer; M11-03 through M11-08 own them.
- Telegram Business, other channels, orders, pricing, broad CRM/knowledge management, analytics, production, GA or 1.0.
- Schema/migration/RLS policy changes, new source files, visual changes or broad refactor.

## Validation

- Focused Node tests for the four listed test files.
- Repository formatter/lint/typecheck gates applicable to the changed workspaces.
- `node scripts/guards/pr-shape.mjs --base main --spec docs/specs/M11-02-allowlisted-inbound-customer.md --include-worktree`
- `git diff --check main...HEAD`
- `git diff --check`

