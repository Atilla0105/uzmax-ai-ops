# M6B-00 GA-0 Runtime Bring-up Contract

Spec ID: M6B-00
Tracking issue: Linear LAY-15
Status: `m6b_00_runtime_bring_up_contract_recorded_ready_for_owner_review_not_ga0`
Owner confirmation point: project owner review of this docs-only M6B contract and later explicit decisions for owner-gated infrastructure, secrets, real Bot traffic, safe restore targets, GA-0 and 1.0.
Timebox: 0.25 work day for this docs-only contract.

## Spec 类型

docs

## 目标

Create a docs-only M6B contract that turns M6's GA-0 `no_go_recommended_owner_decision_pending` rollup into an executable runtime bring-up queue.

This contract defines the rules inherited by later M6B slices:

- runnable-evidence red line;
- owner-independent inner ring and owner-gated outer ring;
- API/worker/cron production artifact strategy;
- conversation-runtime build scope left unbuilt by M6;
- BullMQ job dedupe versus Telegram `update_id` dedupe;
- cron one-shot and idempotency semantics under the Render `*/15` schedule;
- alert/observability scope;
- owner-input binding table;
- M6B-01 through M6B-09 queue and dependency order.

M6B-00 creates no runtime/source/schema/API/admin/worker/cron implementation and no M6B-01 through M6B-09 implementation spec files.

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner: decide later bring-up inputs and risk/cost boundaries: staging Redis source, Render/Vercel staging creation and env, Telegram test bot token/webhook secret/setWebhook authorization, ops alert Telegram bot token and chat id, safe restore target and snapshot, and staging outbound-to-test-account permission. None of those owner inputs are required to start the M6B inner ring.

AI agent: record the M6B queue, runnable-evidence red line, inner/outer ring binding, environment variable names and per-input fallbacks. Enforce one spec / one PR, one worker / one worktree / one branch, the existing true DB/RLS baseline, and fail-closed evidence honesty. Do not write synthetic/in-memory results as deployed or production evidence, and do not fabricate owner decisions.

M6B-00 boundary: no real customer/order data, no customer LLM, no real provider calls, no production deploy, no Telegram Business auto-reply, no GA-0 opening, no 1.0 release.

## 时间盒

0.25 work day. If this contract requires runtime/source/schema/API/admin/worker/cron implementation, new M6B implementation spec files, migrations, lockfile/config/generated/CI changes, or validation-guard scope widening, stop and report instead of widening this PR.

## Source Links

- `AGENTS.md`
- `docs/specs/README.md`
- `docs/evidence/README.md`
- `docs/evidence/M6/README.md`
- `docs/evidence/M6/M6-09-final-acceptance-rollup.md`
- `docs/release.md`
- `UZMAX智能运营系统-PRD-v1.1.md`
- `UZMAX智能运营系统-技术架构-v1.1.md`
- `UZMAX智能运营系统-后台设计与前端架构-v1.1.md`
- `UZMAX智能运营系统-1.0验收矩阵-v1.1.md`
- `render.yaml`
- `.github/workflows/ci.yml`
- `apps/api/package.json`
- `apps/worker/package.json`
- `apps/cron/package.json`
- `apps/api/src/app.module.ts`
- `apps/api/src/telegram-bot.ts`
- `apps/worker/src/order-import-bullmq-runtime.ts`
- `packages/db/prisma/schema.prisma`
- `packages/db/migrations/0003_channel_conversation_ticket_foundation.sql`

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M6B-00-ga0-runtime-bring-up-contract.md`
  - `docs/evidence/M6B/README.md`
- 说明/备注：
  - Docs-only. May read M6/M6B-relevant specs, evidence, `render.yaml`, `.github/workflows/ci.yml`, `apps/api/src/app.module.ts`, `apps/{api,worker,cron}/package.json`, DB conversation/RLS contracts and the four v1.1 docs.
  - Do not modify `apps/**`, `packages/**`, `scripts/**`, lockfile, config, CI, generated files, release gates or M6 implementation evidence outside the two listed docs files.

## 变更预算与路径分类

- Source budget: changed source files <= 0, net source LOC <= 0, new source files <= 0.
- Docs: 2 new docs files.
- Test/generated/lock/config/CI/migration/source changes: none.
- New source `rg` conclusion: none. M6B-00 is a contract, not an ownership decision or implementation.
- External API/SDK/provider/connector/adapter basis: none added in this PR. Telegram, Sentry, Render and Vercel intent is recorded here but integrated only by later owner-gated slices.
- Exceptions: none.

## 文档触发检查

updated

M6B-00 adds a new docs-only runtime bring-up contract and a new M6B evidence directory README. `docs/doc-gates.md` does not require a new global doc index or contract/eval README for these two docs-only paths.

## 前置条件

- Read `AGENTS.md`, `docs/specs/README.md`, `docs/evidence/README.md`, `docs/evidence/M6/README.md`, `docs/evidence/M6/M6-09-final-acceptance-rollup.md` and `docs/release.md`.
- Read the four v1.1 source-of-truth docs enough to ground GA-0/release boundaries.
- Confirm current M6 status remains `m6_final_acceptance_rollup_recorded_no_go_recommended_owner_decision_pending_not_ga0`.
- Confirm no existing `docs/specs/M6B-*` or `docs/evidence/M6B/*` files exist before this PR.
- Read runtime facts this contract is built on:
  - `apps/{api,worker,cron}/package.json`: `build` scripts run `tsc --noEmit`; worker/cron `start` scripts are M0 deployment placeholders; api `start` boots through `scripts/runtime-compiler.mjs`.
  - `apps/api/src/app.module.ts`: `TelegramBotWebhookService` is wired to `DisabledTelegramBotIngressQueue`, and `ConversationTicketController` uses `InMemoryConversationTicketRepository`.
  - `apps/api/src/telegram-bot.ts`: in-memory `providerUpdateId` dedupe exists but does not qualify as DB-backed Telegram dedupe.
  - `apps/worker/src/order-import-bullmq-runtime.ts`: the existing BullMQ runtime covers order-import jobs, not the Bot conversation runtime.
  - `packages/db/prisma/schema.prisma` and migration `0003_channel_conversation_ticket_foundation.sql`: conversation, message, ticket and `telegram_update_dedupe` tables/RLS exist, but the runtime gateway is not wired for Bot conversation processing.
  - `render.yaml`: `uzmax-api`, `uzmax-worker`, `uzmax-cron` and `uzmax-redis` are declared; cron schedule is `*/15 * * * *`; `autoDeployTrigger` is off.
  - `.github/workflows/ci.yml`: `UZMAX_RLS_DATABASE_URL` / `UZMAX_REDIS_URL` patterns and fail-closed missing-secret handling are available for later slices to reuse.
- Do not create M6B-01 through M6B-09 implementation specs in this PR.

## Worktree / branch 前置条件

| Fact | Expected |
|---|---|
| worktree | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m6b-00-ga0-runtime-bring-up-contract` |
| branch | `codex/m6b-00-ga0-runtime-bring-up-contract` |
| base | `origin/main` at current main HEAD |
| forbidden checkout | root/main `/Users/atilla/Applications/UZMAX智能运营` for writing |
| required pre-edit evidence | `pwd`, `git status --short --branch`, `git branch --show-current`, worker HEAD, worker origin/main, root/main status, root no-merged branch audit, open PR audit |

## 并发派发证据

Single active docs worker for M6B-00. Touch list is two docs files with no overlap with runtime source, DB schema, migrations, lockfile, shared config, CI/guard scripts or release gates.

Later M6B slices follow one spec / one PR / one worktree / one branch. Global serial points remain serial: `packages/db` schema, migrations, RLS policy, lockfile, shared config, CI/guard, generated artifacts and release gates.

## 可运行证据红线

M6B-01 through M6B-08 may be marked passed only with observable runtime artifacts: process exit code, HTTP response from a running service, queue depth change, DB row readback under RLS, structured log line with traceId, setWebhook/webhook delivery trace, or recorded deploy/rollback/restore A-to-B-to-A evidence.

Not acceptable as a pass for M6B-01 through M6B-08:

- an evidence/spec/runbook contains string X;
- a `.test.mjs` that only asserts document wording;
- a synthetic/in-memory result presented as a deployed, staging, production or true DB result.

Doc-anchor tests may remain drift guards, but they never satisfy a runtime pass condition. M6B-09 is the only rollup slice and may aggregate prior runnable evidence; it must not invent a pass.

## 执行拓扑：内环 / 外环

| Ring | Slices | Owner infra needed |
|---|---|---|
| Inner | M6B-00, M6B-01, M6B-02, M6B-03, M6B-05a, M6B-05b | none; CI ephemeral Redis and existing `UZMAX_RLS_DATABASE_URL` cover DB/queue proof |
| Outer | M6B-04, M6B-06, M6B-07, M6B-08, alert-fires and outbound proof | owner-provided staging, Bot, alert, restore and outbound inputs |

The inner ring does not wait on owner inputs. Owner inputs only flip outer-ring slices from `blocked_owner_input` to runnable. An owner "no/later" caps exactly one outer-ring slice and does not stall the main chain.

## 三入口构建策略

M6B-01 owns the shared production artifact decision for api, worker and cron:

- `npm run build:api|worker|cron` must emit a runnable artifact;
- `start` must boot from emitted artifacts, not `runtime-compiler.mjs` or M0 placeholders;
- default strategy is an esbuild/tsup-style bundle per service;
- because NestJS uses decorators, M6B-01 either configures decorator metadata handling or keeps a tsc-emit fallback for api while worker/cron bundle directly;
- worker/cron placeholder start commands are removed in M6B-02 and M6B-03 using this toolchain.

## Conversation Runtime Scope

M6B-05a builds the Bot conversation runtime that M6 did not close:

- BullMQ-backed `TelegramBotIngressQueuePort` adapter;
- worker-side conversation/message consumer wired into `engine` and handoff;
- `AppModule` switched from `DisabledTelegramBotIngressQueue` to an env-selected real queue;
- RLS-backed conversation/ticket persistence gateway using existing conversation/ticket schema.

M6B-05a acceptance is true DB/RLS smoke with `UZMAX_RLS_DATABASE_URL`: same-tenant ingress -> dedupe -> queue -> consume -> ticket readback; tenant B cannot read tenant A's conversation/ticket; one Telegram `update_id` produces exactly one persisted result.

## Dedupe Definition

| Layer | Key | Scope | Proven in |
|---|---|---|---|
| BullMQ job dedupe | `jobId` | worker does not double-process a re-enqueued job | M6B-02 |
| Telegram ingress dedupe | `update_id` / `providerUpdateId` | DB-persisted, survives restart/multi-instance; current in-memory queue does not qualify | M6B-05a and M6B-05b, real end-to-end in M6B-06 |

BullMQ-level dedupe must never be accepted as proof of Telegram `update_id` dedupe.

## Cron Semantics

Render cron is `type: cron`, `schedule: */15 * * * *`. The cron entry is one-shot: run task, record result, exit with code. It is not a long-running internal scheduler. Because distill health is daily but Render invokes the command every 15 minutes, M6B-03 must prove idempotency/guarding so the daily unit runs at most once per day.

## Alert Scope

Primary alert channel for M6B is Telegram via a dedicated ops alert bot, separate from the product test bot:

- `UZMAX_ALERT_TELEGRAM_BOT_TOKEN`
- `UZMAX_ALERT_TELEGRAM_CHAT_ID`

Sentry remains optional/deferred through `UZMAX_SENTRY_DSN`. Until the ops alert bot is provided, M6B-01 through M6B-04 may deliver structured logs and health/heartbeat endpoints, but alert-fires acceptance remains owner-blocked and cannot be claimed closed.

## Owner Input Binding

| Owner input | Gated slice | Fallback if declined/not yet | Delivery |
|---|---|---|---|
| Staging Redis: Render `uzmax-redis` vs CI ephemeral | M6B-02, M6B-04 | M6B-02 uses CI ephemeral; staging worker waits | `UZMAX_REDIS_URL` |
| Render/Vercel staging create and env | M6B-04, M6B-06, M6B-07 | inner ring completes local/CI; staging slices stay blocked | `UZMAX_STAGING_*` manifest |
| Telegram test token, webhook secret and setWebhook auth | M6B-06 | M6B-05a/05b prove path without real Telegram | `UZMAX_TG_BOT_TOKEN`, `UZMAX_TG_WEBHOOK_SECRET` |
| Ops alert Telegram bot token and chat id | M6B-04 alert-fires, L-01 | logs/health delivered; alert-fires blocked | `UZMAX_ALERT_TELEGRAM_BOT_TOKEN`, `UZMAX_ALERT_TELEGRAM_CHAT_ID` |
| Safe restore target and snapshot | M6B-08 | J-03 remains explicit blocker | target ref and snapshot id manifest, not secret value |
| Staging outbound to test account | M6B-06 outbound | inbound/dedupe/ticket proven; outbound disabled | owner written approval recorded |

Every secret follows existing masked-GitHub-Actions / fail-closed-on-missing patterns. Evidence records run id, ref and status, never secret values.

## M6B Planned Queue

| Order | Slice | Ring | Goal | Pass evidence |
|---:|---|---|---|---|
| 0 | M6B-00 Runtime Bring-up Contract | inner | this contract | spec and evidence README exist; required contract fields present |
| 1 | M6B-01 API Production Artifact | inner | real build artifact and boot; `/healthz`, `/readyz`, traceId logs | build emits artifact; start boots artifact; health 200; structured traceId log |
| 2 | M6B-02 Worker Service Shell | inner | replace placeholder; one proven order-import job on Redis | worker boots; jobId no double-process; queue depth change; graceful shutdown; true DB/RLS smoke |
| 3 | M6B-03 Cron Service Shell | inner | replace placeholder; one-shot distill daily health | cron runs once and exits; `distill_run`/health evidence; failure non-zero; idempotent daily guard |
| 4 | M6B-04 Thin Staging Deploy | outer | api, worker, cron and Redis on staging | staging URLs/refs; Redis connected; health/heartbeat queryable |
| 5 | M6B-05a Conversation Runtime Build | inner | BullMQ ingress adapter, worker consumer, RLS conversation/ticket gateway, AppModule switch | true DB/RLS ingress -> dedupe -> consume -> ticket; tenant isolation; one update one ticket |
| 6 | M6B-05b Equivalent Bot Webhook Drive | inner | internal/synthetic webhook POST through M6B-05a chain | duplicate update -> one result; queue consumed; persisted trace |
| 7 | M6B-06 Real Telegram Staging Webhook | outer | real test bot and setWebhook to staging | secret-validated webhook delivered; duplicate no double-write; outbound only to approved test account |
| 8 | M6B-07 Deploy/Rollback Drill | outer | api, worker, cron and admin A->B->A | version trace; health/heartbeat recover; no job loss/duplication across rollback |
| 9 | M6B-08 Backup/Restore Drill | outer | restore on safe target | snapshot id; restore command class; post-restore RLS smoke; asset-ref safety; residue clean |
| 10 | M6B-09 GA-0 Runtime Rollup | inner | aggregate runnable evidence and re-judge GA-0 | only real M6B evidence; honest go/no-go; spawn blocker specs if not green |

## 依赖 / 串并行

- M6B-01 precedes M6B-02 and M6B-03.
- M6B-05a precedes M6B-05b and M6B-06.
- M6B-04 precedes M6B-06 and M6B-07.
- M6B-08 may prepare in parallel only after owner safe-restore target is known.
- `packages/db` schema, migrations, RLS policy, lockfile, shared config, CI/guard, generated artifacts and release gates remain global serial points.
- M6B-05a touches `apps/api`, `apps/worker` and DB gateway paths; it is serial with anything touching those paths.

## 实施步骤

1. Create this M6B-00 spec with required governance fields and current runtime facts.
2. Create `docs/evidence/M6B/README.md` with start audit, red line, queue, owner-input binding and validation status.
3. Run focused docs/guard validation.
4. Confirm diff contains only the two listed docs files.
5. Update Linear LAY-15 with result and remaining next-step queue.

## 通过条件

- This spec contains every field required by `docs/specs/README.md`.
- `docs/evidence/M6B/README.md` records start audit, runnable-evidence red line, inner/outer ring, build strategy, conversation runtime scope, dedupe layers, cron semantics, alert scope, owner-input binding, planned queue, dependencies, validation and boundaries.
- Queue is exactly M6B-01 through M6B-09, with M6B-05a and M6B-05b split; every M6B-01 through M6B-08 row states a runnable pass condition.
- No M6B-01 through M6B-09 implementation spec files are created.
- Diff is only the two listed docs files.
- Required validation passes or failures are recorded.

## 失败分支

- If validation requires changes outside the two docs files, stop and report before widening.
- If M6 status is not `m6_final_acceptance_rollup_recorded_no_go_recommended_owner_decision_pending_not_ga0`, record contradiction and do not present M6B as ready to queue.
- If wording implies GA-0 opened, production-ready, owner-accepted, real customer/order data, customer LLM, real provider approved, P1 risk accepted or 1.0 approved, correct before merge.
- If any worker writes outside assigned worktree, writes on root/main, touches unlisted paths, or secret/customer-data boundary risk appears, stop and create/reference `docs/incidents/` before continuing.

## 不做什么

- No M6B-01 through M6B-09 implementation specs.
- No runtime source, Prisma schema, migrations, RLS policy, generated client, API/admin/worker/cron source, CI/config/lockfile or release-gate changes.
- No production deploy, real customer/order data, customer LLM, real provider calls, real LLM keys, real Bot token/webhook secret, Telegram Business auto-reply, outbound Bot send, GA-0 opening, P1/P2 owner decision, or 1.0 release.

## 验收映射

- J-01: records deploy/build/rollback runtime bring-up queue, not pass.
- J-02: records queue/runnable evidence requirements, not production worker approval.
- J-03: records backup/restore owner blocker and M6B-08 path, not pass.
- J-04: records drill/runbook evidence boundary, not pass.
- J-05: records release evidence queue boundary, not release approval.
- L-01: GA-0 remains closed until M6B runtime evidence and owner decision.
- L-02: real Bot leave-ticket path remains future M6B-06 evidence.
- K-03/K-04: one spec / one PR / one worktree / one branch; M6B serial points recorded.

## 事故与 Closeout 记录

Known milestone incidents are recorded in `docs/incidents/`. M6B-00 creates no new incident.

Closeout expectation: final PR evidence must record validation, diff scope, branch hygiene, open PR audit and whether any incident was created. If no new incident occurs, record `none created by M6B-00`.
