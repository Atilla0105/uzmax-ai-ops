# M6B-05b Equivalent Bot Webhook Drive

Spec ID: M6B-05b
Tracking issue: Linear LAY-21
Status: `m6b_05b_equivalent_bot_webhook_drive_in_progress_not_ga0`
Owner confirmation point: project owner review of this inner-ring runtime evidence and later owner decisions for real Telegram bot credentials, real webhook registration, staging/production infrastructure, outbound Bot sends, real customer/order data, customer LLM/provider calls, GA-0 and 1.0.
Timebox: 0.5 work day.

## Spec 类型

feature

## 目标

Drive the M6B-05a Bot conversation runtime through a webhook-equivalent API ingress contract using only internal/synthetic traffic.

M6B-05b must prove in a focused local test:

- the existing webhook core accepts a synthetic Telegram Bot webhook body with the configured synthetic secret;
- the API ingress uses `createTelegramBotIngressQueueProviderFromEnv` in explicit BullMQ mode with an injected queue port, not the in-memory queue;
- the queued Bot conversation job payload is handed to `processTelegramBotConversationJob`;
- duplicate `update_id` / `providerUpdateId` through the webhook-equivalent path produces only one fake persistence result and one deduped result;
- the evidence clearly separates this local contract proof from true DB/RLS webhook-driven closure.

True DB/RLS tenant isolation remains anchored by the existing M6B-05a direct true DB smoke. M6B-05b does not claim a local true DB/RLS webhook-driven pass without `UZMAX_RLS_DATABASE_URL`.

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner: decide later real Telegram bot token/webhook secret/setWebhook authorization, staging/production infrastructure, outbound test-account permission, customer LLM/provider use, real customer/order data, GA-0 and 1.0 release.

AI agent: create this spec before implementation, implement the narrow focused test/evidence, reuse the M6B-05a queue adapter and worker processor, preserve redaction boundaries, and report local missing DB/Redis inputs honestly without widening scope.

M6B-05b boundary: no real Telegram webhook/setWebhook, no outbound Bot send, no staging/production deploy, no schema/migration/generated client changes, no customer LLM/provider call, no real customer/order data, no GA-0 opening, no P1/P2 owner decision and no 1.0 release.

## 时间盒

0.5 work day. If the webhook drive requires DB schema/RLS changes, new dependencies, real Telegram credentials, staging/prod mutation, outbound send, LLM/provider calls or production source changes, stop and report a split instead of widening silently.

## Source Links

- `AGENTS.md`
- `docs/specs/README.md`
- `docs/specs/M6B-00-ga0-runtime-bring-up-contract.md`
- `docs/specs/M6B-05a-conversation-runtime-build.md`
- `docs/evidence/M6B/README.md`
- `docs/evidence/M6B/M6B-05a-conversation-runtime-build.md`
- `apps/api/src/telegram-bot.ts`
- `apps/worker/src/conversation-runtime.ts`
- `packages/channels/src/index.ts`
- `packages/db/scripts/run-m6b-conversation-runtime-true-db-smoke.mjs`
- `scripts/tests/m6b-conversation-runtime.test.mjs`

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M6B-05b-equivalent-bot-webhook-drive.md`
  - `docs/evidence/M6B/README.md`
  - `docs/evidence/M6B/M6B-05b-equivalent-bot-webhook-drive.md`
  - `scripts/tests/m6b-equivalent-bot-webhook-drive.test.mjs`
- 说明/备注：
  - `scripts/tests/m6b-equivalent-bot-webhook-drive.test.mjs` owns focused local coverage for synthetic webhook-equivalent input, injectable BullMQ queue payload, worker processor handoff and fake persistence dedupe.
  - No API/worker runtime source, schema, migration, generated Prisma client, lockfile, dependency, CI, render, admin, LLM, outbound send or real Telegram credential changes.

## 变更预算与路径分类

- Source budget target: changed source files <= 0, net source LOC <= 0, new source files <= 0.
- Source: none.
- Test support: `scripts/tests/m6b-equivalent-bot-webhook-drive.test.mjs`.
- Docs: this spec, M6B README update and M6B-05b evidence.
- Generated/migration/schema/config/CI/package/lock/admin changes: none.
- New source `rg` conclusion: searched `M6B-05b`, `M6B-05a`, `conversation-runtime`, `webhook`, `TelegramBotIngressQueuePort`, `providerUpdateId`, `telegram_update_dedupe`, BullMQ and true DB smoke paths across `docs/specs`, `docs/evidence`, `apps/api`, `apps/worker`, `packages/db/scripts` and `scripts/tests`. M6B-05a has the queue adapter, worker consumer and direct true DB smoke; no focused webhook-equivalent drive contract exists. No production source file is required for this narrow slice.
- External API/SDK/provider/connector/adapter basis: none added. BullMQ, Nest and Prisma are existing repo dependencies. Telegram behavior is inherited from M2-02/M6B-05a contracts; this slice does not call Telegram APIs.
- Exceptions: none.

## 文档触发检查

updated

M6B-05b adds inner-ring runtime evidence under the existing M6B evidence path. It does not introduce a new public API beyond the existing Bot webhook endpoint and does not add staging/production runbooks.

## 前置条件

- Read `AGENTS.md`, `docs/specs/README.md`, M6B-00 contract/evidence, M6B-05a spec/evidence, Bot webhook source, worker conversation runtime and existing true DB/RLS smoke.
- Confirm assigned worktree and branch match this spec.
- Confirm M6B-05a runtime source is present on `main`.
- Confirm root/main is not used for writing.
- Confirm `gh` availability; if unavailable, record that open PR audit cannot be performed from this shell.
- Confirm no schema/migration/generated/lockfile changes are required.

## Worktree / branch 前置条件

| Fact | Expected |
|---|---|
| worktree | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m6b-05b-equivalent-bot-webhook-drive` |
| branch | `codex/m6b-05b-equivalent-bot-webhook-drive` |
| base | current `origin/main` containing M6B-05a at `95b5b7ede8744dd247df1f201158a4de83e95053` |
| forbidden checkout | root/main `/Users/atilla/Applications/UZMAX智能运营` for writing |
| required pre-edit evidence | `pwd`, `git status --short --branch`, `git branch --show-current`, worker HEAD, worker origin/main, root/main status, root no-merged branch audit, open PR audit |

Pre-edit evidence recorded before this spec was created:

| Fact | Evidence |
|---|---|
| assigned worktree `pwd` | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m6b-05b-equivalent-bot-webhook-drive` |
| assigned status before edits | `## codex/m6b-05b-equivalent-bot-webhook-drive` |
| assigned branch | `codex/m6b-05b-equivalent-bot-webhook-drive` |
| assigned `HEAD` | `95b5b7ede8744dd247df1f201158a4de83e95053` |
| assigned `origin/main` | `95b5b7ede8744dd247df1f201158a4de83e95053` |
| root/main status before edits | `## main...origin/main` |
| root/main `HEAD` | `95b5b7ede8744dd247df1f201158a4de83e95053` |
| root no-merged branch audit before edits | no output |
| open PR audit before edits | coordinator ran GitHub API audit with `curl` from root/main; open PR list returned `[]` because `gh` command is unavailable in this shell |

## 并发派发证据

Single M6B-05b worker in a dedicated physical worktree and branch. This slice touches only one focused test and M6B docs/evidence. It does not touch production source, global serial DB schema/migrations/RLS policy/generated client, lockfile, shared config, CI, guard scripts or release gates.

## 实施步骤

1. Create this M6B-05b spec before implementation.
2. Add focused test coverage that anchors synthetic webhook-equivalent input to `TelegramBotWebhookCore`, injected BullMQ queue mode, queued job payload, worker processor, duplicate provider update and fake tenant readback boundaries.
3. Record true DB/RLS status honestly: M6B-05a direct true DB/RLS smoke is already the DB baseline; M6B-05b local validation does not claim webhook-driven true DB closure without `UZMAX_RLS_DATABASE_URL`.
4. Update M6B evidence with validation results and honest boundaries.
5. Run scoped validation and guards.

## 通过条件

- The focused test does not require real Telegram, Redis, DB secrets, outbound or staging/prod.
- The focused test sends a synthetic webhook-equivalent body through `TelegramBotWebhookCore` with a synthetic secret.
- The focused test uses `createTelegramBotIngressQueueProviderFromEnv` in explicit BullMQ mode with an injected queue and proves a deterministic job payload/job id is added.
- The focused test processes accepted and duplicate queued payloads through `processTelegramBotConversationJob`.
- Duplicate synthetic webhook update produces one accepted fake persistence result and one deduped result.
- Evidence states that true DB/RLS webhook-driven closure is not locally claimed without `UZMAX_RLS_DATABASE_URL`.
- Evidence records no real Bot token/webhook secret, raw Telegram payload file, customer/order data, outbound send, customer LLM/provider call, staging/prod deploy, GA-0 or 1.0 approval.

## 失败分支

- If `UZMAX_RLS_DATABASE_URL` is unavailable locally, record local missing-secret status and do not claim local true DB/RLS pass.
- If Redis is unavailable locally, keep validation to the injected queue contract and do not claim real Redis queue-depth evidence.
- If duplicate `providerUpdateId` creates more than one fake persistence result, do not mark M6B-05b local contract passed.
- If implementation requires schema/migration/RLS policy/generated changes, split into a DB serial spec.
- If implementation requires real Telegram, staging, outbound send, LLM/provider calls or real customer/order data, stop and defer to owner-gated outer slices.
- If any write occurs outside assigned worktree or on root/main, stop and record an incident before continuing.

## 不做什么

- No real Telegram webhook/setWebhook, Bot token, webhook secret or outbound Bot send.
- No staging deploy, production deploy, Render/Vercel mutation or real Redis service mutation.
- No DB schema, migrations, RLS policy, generated Prisma client, dependency, lockfile, CI/guard/release gate, production source or admin UI changes.
- No customer LLM/provider call, raw prompts/completions, real customer/order data, Telegram raw payload files, screenshots, voice transcripts or support personal accounts.
- No GA-0 opening, P1/P2 owner decision or 1.0 release.

## 验收映射

- C-01: proves the Bot webhook-equivalent ingress contract can drive the queue/worker persistence path without real Telegram staging.
- D-01/D-02: proves the worker persistence handoff contract for this runtime path; DB readback remains M6B-05a direct smoke or later DB-enabled M6B-05b run.
- B-01: preserves tenant isolation boundary by not claiming local true DB/RLS without DB evidence.
- J-02: proves Telegram `update_id` / `providerUpdateId` dedupe through the worker persistence contract, distinct from BullMQ jobId-only proof.
- K-03/K-04: one spec / one branch / one worktree with scoped validation.
- L-01/L-02: GA-0 and 1.0 remain locked pending later M6B runtime evidence and owner decisions.
