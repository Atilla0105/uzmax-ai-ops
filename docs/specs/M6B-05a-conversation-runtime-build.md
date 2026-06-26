# M6B-05a Conversation Runtime Build

Spec ID: M6B-05a
Tracking issue: Linear LAY-20
Status: `m6b_05a_conversation_runtime_in_progress_not_ga0`
Owner confirmation point: project owner review of this inner-ring runtime PR and later owner decisions for real Telegram bot credentials, staging, production, outbound Bot sends, real customer/order data, customer LLM/provider calls, GA-0 and 1.0.
Timebox: 1 work day.

## Spec 类型

feature

## 目标

Build the missing owner-independent Bot conversation runtime chain using the existing M2 ingress contract, existing BullMQ dependency and existing DB/RLS conversation schema.

M6B-05a must prove:

- API webhook can use an env-selected BullMQ-backed `TelegramBotIngressQueuePort`.
- Worker can consume a conversation runtime job and persist conversation/message/ticket rows.
- Telegram `update_id` / `providerUpdateId` dedupe is DB-backed, not only in-memory or BullMQ `jobId`.
- True DB/RLS smoke proves same-tenant ingress -> dedupe -> queue -> consume -> ticket readback.
- Tenant B cannot read tenant A conversation/ticket rows.
- Duplicate Telegram `update_id` produces exactly one persisted result.

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner: decide later real Telegram bot token/webhook secret/setWebhook authorization, staging/production infrastructure, outbound test-account permission, customer LLM/provider use, real customer/order data, GA-0 and 1.0 release.

AI agent: create the spec and evidence, implement the narrow BullMQ ingress/worker/RLS runtime path, reuse existing channel normalization and handoff contracts, run focused local and true DB/RLS validation, preserve no-raw-payload evidence boundaries, and report missing outer-ring inputs without fabricating staging or production evidence.

M6B-05a boundary: no real Telegram webhook/setWebhook, no outbound Bot send, no production/staging deploy, no schema/migration/generated client changes, no customer LLM/provider call, no real customer/order data, no GA-0 opening, no P1/P2 owner decision and no 1.0 release.

## 时间盒

1 work day. If the runtime chain requires DB schema or RLS policy changes, generated Prisma client changes, lockfile dependencies, guard edits, engine/LLM/capabilities expansion beyond the existing handoff contract, staging/production services, real Bot credentials or outbound send, stop and report a split instead of widening silently. CI workflow wiring is allowed only for running the M6B-05a true DB smoke under the existing `run_true_db_smoke` secret boundary.

## Source Links

- `AGENTS.md`
- `docs/specs/README.md`
- `docs/specs/M6B-00-ga0-runtime-bring-up-contract.md`
- `docs/evidence/M6B/README.md`
- `docs/specs/M2-02-telegram-bot-ingress-dedupe-queue.md`
- `docs/evidence/M2/M2-02-telegram-bot-ingress-dedupe-queue.md`
- `docs/specs/M6-06-telegram-bot-ga0-main-path.md`
- `UZMAX智能运营系统-技术架构-v1.1.md`
- `UZMAX智能运营系统-1.0验收矩阵-v1.1.md`
- `apps/api/src/app.module.ts`
- `apps/api/src/telegram-bot.ts`
- `apps/worker/src/main.ts`
- `apps/worker/src/order-import-bullmq-runtime.ts`
- `packages/channels/src/index.ts`
- `packages/capabilities/handoff/src/index.ts`
- `packages/db/src/index.ts`
- `packages/db/prisma/schema.prisma`
- `packages/db/migrations/0003_channel_conversation_ticket_foundation.sql`
- `packages/db/scripts/order-import-true-db-http-smoke-fixture.mjs`

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M6B-05a-conversation-runtime-build.md`
  - `docs/evidence/M6B/README.md`
  - `docs/evidence/M6B/M6B-05a-conversation-runtime-build.md`
  - `packages/channels/src/index.ts`
  - `apps/api/package.json`
  - `apps/api/scripts/runtime-compiler.mjs`
  - `apps/api/src/app.module.ts`
  - `apps/api/src/telegram-bot.ts`
  - `apps/worker/src/main.ts`
  - `apps/worker/src/conversation-runtime.ts`
  - `packages/db/scripts/order-import-worker-submit-smoke-support.mjs`
  - `packages/db/scripts/run-m4-order-import-true-db-smoke.mjs`
  - `packages/db/scripts/run-m6b-conversation-runtime-true-db-smoke.mjs`
  - `scripts/tests/m4-worker-test-loader.mjs`
  - `scripts/tests/m6b-conversation-runtime.test.mjs`
  - `.github/workflows/ci.yml`
  - `package-lock.json`
- 说明/备注：
  - `apps/api/package.json` and `package-lock.json` may add the existing repo BullMQ version to API workspace runtime dependencies because API owns the explicit BullMQ enqueue adapter.
  - `apps/api/scripts/runtime-compiler.mjs` may add only the Bot webhook module to the existing local Nest runtime compiler used by smoke/tests.
  - `packages/channels/src/index.ts` may add shared Bot conversation queue names/job payload contracts only.
  - `apps/api/src/telegram-bot.ts` may add the BullMQ queue adapter and env-selected queue provider while preserving fail-closed disabled/default behavior.
  - `apps/api/src/app.module.ts` may switch the webhook service wiring from hard disabled queue to env-selected queue provider.
  - `apps/worker/src/main.ts` may export conversation runtime support only.
  - `apps/worker/src/conversation-runtime.ts` owns the worker-side job processor and RLS persistence gateway for existing conversation/ticket tables.
  - `packages/db/scripts/order-import-worker-submit-smoke-support.mjs` may strip the new worker export from its shared legacy M4 true DB data-url loader only.
  - `packages/db/scripts/run-m4-order-import-true-db-smoke.mjs` may strip the new worker export from its legacy data-url loader only, preserving existing M4 smoke behavior.
  - `packages/db/scripts/run-m6b-conversation-runtime-true-db-smoke.mjs` owns the true DB/RLS smoke using existing `UZMAX_RLS_DATABASE_URL` fail-closed pattern.
  - `scripts/tests/m4-worker-test-loader.mjs` may strip the new worker export from older M4 data-url loader tests only.
  - `.github/workflows/ci.yml` may add only the M6B-05a true DB smoke step under the existing `run_true_db_smoke` gate.
  - No schema, migration, generated Prisma client, lockfile, guard, render, admin, LLM, outbound send or real Telegram credential changes.

## 变更预算与路径分类

- Source budget target: default changed source files <= 12, net source LOC <= 600, new source files <= 5 unless the explicit `large_change_exception` below is owner-approved in review.
- Source: `packages/channels/src/index.ts`, `apps/api/scripts/runtime-compiler.mjs`, `apps/api/src/app.module.ts`, `apps/api/src/telegram-bot.ts`, `apps/worker/src/main.ts`, `apps/worker/src/conversation-runtime.ts`, `packages/db/scripts/order-import-worker-submit-smoke-support.mjs`, `packages/db/scripts/run-m4-order-import-true-db-smoke.mjs`, `packages/db/scripts/run-m6b-conversation-runtime-true-db-smoke.mjs`.
- Test support: `scripts/tests/m4-worker-test-loader.mjs`, `scripts/tests/m6b-conversation-runtime.test.mjs`.
- Config/CI: `.github/workflows/ci.yml`.
- Package/lock: `apps/api/package.json`, `package-lock.json`.
- Docs: this spec, M6B README update and M6B-05a evidence.
- Generated/migration/schema/release gate/admin changes: none.
- New source `rg` conclusion: searched `TelegramBotIngressQueuePort`, `providerUpdateId`, `telegram_update_dedupe`, `conversation`, `ticket`, `BullMQ`, `createRlsTransactionContext`, true DB smoke fixtures, `engine`, and `handoff` across `apps`, `packages`, `scripts/tests`, `docs/specs` and `docs/evidence`. Existing M2 code has in-memory queue and disabled AppModule wiring; existing DB schema has conversation/message/ticket/dedupe tables; existing worker BullMQ runtime is order-import only. No Bot conversation runtime worker/RLS gateway exists. The new source belongs in API Bot ingress, worker conversation runtime and DB smoke script paths because those are the current ownership boundaries.
- External API/SDK/provider/connector/adapter basis: BullMQ is already an installed repo dependency and M6B-02 proved Redis-backed BullMQ usage; this slice only declares the same BullMQ version for the API workspace because the API now owns an enqueue adapter. Telegram behavior is inherited from M2-02 official-doc-backed Bot ingress contract; this PR does not call Telegram APIs.
- Exceptions: `large_change_exception` for net source LOC exceeding the AGENTS.md default after adding the worker conversation runtime plus true DB/RLS smoke in the same inner-ring closure. Splitting them would leave either an unverified worker runtime or a smoke without the runtime gateway, so the exception is limited to source-size governance and requires project owner review approval before merge. No `test_weakening_exception` and no `external_dependency_exception`.

## 文档触发检查

updated

M6B-05a adds inner-ring runtime evidence under the existing M6B evidence path. It does not introduce a new public API surface beyond the existing Bot webhook endpoint and does not add staging/production runbooks. If `docs/doc-gates.md` requires more, stop and update this spec before widening.

## 前置条件

- Read `AGENTS.md`, M6B-00 contract/evidence, M2 Bot ingress spec/evidence, v1.1 technical architecture, v1.1 acceptance matrix, Bot ingress source, conversation/ticket source, worker BullMQ runtime source, DB schema/migration and existing true DB/RLS smoke fixtures.
- Confirm M6B-01, M6B-02 and M6B-03 are merged and root/main is clean.
- Confirm M6B-04 is owner-gated and not required for this inner-ring slice.
- Confirm no open PRs and no unmerged local branches before starting this slice.
- Confirm `packages/db` schema/migrations are not changed by this slice.

## Worktree / branch 前置条件

| Fact | Expected |
|---|---|
| worktree | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m6b-05a-conversation-runtime` |
| branch | `codex/m6b-05a-conversation-runtime` |
| base | current `origin/main` containing M6B-03 at `4391d577b446874d953adaac465496bbd6557609` |
| forbidden checkout | root/main `/Users/atilla/Applications/UZMAX智能运营` for writing |
| required pre-edit evidence | `pwd`, `git status --short --branch`, `git branch --show-current`, worker HEAD, root/main status, root no-merged branch audit, open PR audit |

Pre-edit evidence recorded before this spec was created:

| Fact | Evidence |
|---|---|
| assigned worktree `pwd` | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m6b-05a-conversation-runtime` |
| assigned status before edits | `## codex/m6b-05a-conversation-runtime...origin/main` |
| assigned branch | `codex/m6b-05a-conversation-runtime` |
| assigned `HEAD` | `4391d577b446874d953adaac465496bbd6557609` |
| root/main status before edits | `## main...origin/main` |
| root no-merged branch audit before edits | no output |
| open PR audit before edits | GitHub connector returned `[]` |

## 并发派发证据

Single M6B-05a worker in a dedicated physical worktree and branch. This slice is serial with any work touching `apps/api`, `apps/worker`, DB gateway paths, CI or lockfile. It does not touch global serial DB schema/migrations/RLS policy/generated client, guard or release gates.

## 实施步骤

1. Create this M6B-05a spec before source implementation.
2. Add shared Bot conversation queue payload/contract helpers.
3. Add BullMQ-backed API queue adapter and env-selected queue provider while keeping default disabled/fail-closed behavior.
4. Add worker conversation runtime processor and RLS persistence gateway over existing tables.
5. Add true DB/RLS smoke that seeds synthetic org/tenants/channel, enqueues duplicate updates, consumes one worker job, checks tenant isolation and cleans residue.
6. Update M6B evidence with runtime observations and honest boundaries.
7. Run focused validation and guards.

## 通过条件

- API queue provider defaults to disabled/fail-closed unless explicitly configured for BullMQ.
- BullMQ adapter enqueues a normalized Bot update with a stable DB-backed dedupe key.
- Worker consumer persists one conversation, one inbound message, one support ticket and one created ticket event for an accepted update.
- Duplicate same-tenant `providerUpdateId` creates one dedupe row and one persisted result.
- True DB/RLS smoke with `UZMAX_RLS_DATABASE_URL` proves tenant A readback and tenant B denial for conversation/ticket rows.
- The smoke records no raw Telegram payloads, Bot tokens, webhook secrets, customer/order data, prompts/completions or provider keys.
- PR diff stays inside this spec touch list; net source LOC overrun is allowed only through the declared `large_change_exception` and owner review approval.

## 失败分支

- If `UZMAX_RLS_DATABASE_URL` is unavailable locally, record local missing-secret status and rely on CI only if CI has the secret; do not claim true DB/RLS from in-memory evidence.
- If duplicate `providerUpdateId` produces more than one conversation/message/ticket, do not mark M6B-05a passed.
- If tenant B can read tenant A rows, stop and do not merge.
- If implementation requires schema/migration/RLS policy/generated changes, split into a DB serial spec.
- If implementation requires real Telegram, staging, outbound send, LLM/provider calls or real customer/order data, stop and defer to the owner-gated outer slice.
- If any write occurs outside assigned worktree or on root/main, stop and record an incident before continuing.

## 不做什么

- No real Telegram webhook/setWebhook, Bot token, webhook secret or outbound Bot send.
- No staging deploy, production deploy, Render/Vercel mutation or real Redis service mutation.
- No DB schema, migrations, RLS policy, generated Prisma client, guard/release gate or admin UI changes. CI changes are limited to running the M6B-05a smoke under the existing true DB secret gate. Package/lockfile changes are limited to declaring the already-used BullMQ version in the API workspace.
- No customer LLM/provider call, raw prompts/completions, real customer/order data, Telegram raw payload files, screenshots, voice transcripts or support personal accounts.
- No GA-0 opening, P1/P2 owner decision or 1.0 release.

## 验收映射

- C-01: proves inner-ring Bot ingress to queue to worker persistence without real Telegram staging.
- D-01/D-02: proves persisted conversation/message/ticket baseline for handoff readback; broader desktop workflow remains later.
- B-01: proves tenant isolation for this conversation/ticket runtime path.
- J-02: proves queue idempotency at Telegram `update_id` layer, distinct from M6B-02 BullMQ jobId proof.
- K-03/K-04: one spec / one branch / one worktree / one PR with scoped validation.
- L-01/L-02: GA-0 and 1.0 remain locked pending later M6B runtime evidence and owner decisions.
