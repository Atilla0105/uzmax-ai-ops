# M6B Evidence

> evidence_id: M6B-runtime-evidence-index
> milestone: M6B
> acceptance_items: J-01, J-02, J-03, J-04, J-05, K-03, K-04, L-01, L-02
> owner: project owner owns staging infra, real Bot/alert/restore/outbound inputs, GA-0, production, real data, customer LLM, provider/cost/risk and 1.0 decisions; AI agents own execution, review and evidence honesty
> status: no_go_blocked_owner_inputs_missing_not_ga0
> created_at: 2026-06-26
> updated_at: 2026-06-26
> source_files: `AGENTS.md`, four v1.1 source-of-truth docs, `docs/specs/M6B-00-ga0-runtime-bring-up-contract.md`, `docs/specs/M6B-09-ga0-runtime-evidence-rollup.md`, `docs/specs/M6B-07a-deploy-rollback-runbook-sync.md`, `docs/evidence/M6B/M6B-09-ga0-runtime-evidence-rollup.md`, `docs/evidence/M6B/M6B-07a-deploy-rollback-runbook-sync.md`, existing M6B slice specs/evidence, `docs/runbooks/deploy-rollback.md`, `docs/evidence/M6/README.md`, `docs/evidence/M6/M6-09-final-acceptance-rollup.md`, `docs/release.md`, `render.yaml`, `.github/workflows/ci.yml`, `apps/api/package.json`, `apps/worker/package.json`, `apps/cron/package.json`, `apps/api/src/app.module.ts`, `apps/api/src/telegram-bot.ts`, `apps/worker/src/order-import-bullmq-runtime.ts`, `packages/db/prisma/schema.prisma`, `packages/db/migrations/0003_channel_conversation_ticket_foundation.sql`
> sensitive_data_location: none; this file contains no customer/order/message/provider secret material
> redaction_status: no raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys, Bot tokens, webhook secrets or DB URLs
> review_notes: M6B index now includes the M6B-04 thin Render staging env wiring evidence, the M6B-09 GA-0 runtime evidence rollup and the M6B-07a deploy rollback runbook sync; owner-gated live M6B-04 deploy verification plus M6B-06/07/08 remain blocked and GA-0 is No-Go / locked
> signoff: no owner GA-0 approval recorded; owner decision remains required

## M6B Slice Index

| Slice | Evidence | Status | Notes |
|---|---|---|---|
| M6B-00 | This README and `docs/specs/M6B-00-ga0-runtime-bring-up-contract.md` | `ready_for_review` | Runtime bring-up contract only; not GA-0. |
| M6B-01 | `docs/evidence/M6B/M6B-01-api-production-artifact.md` | `merged_local_artifact_health_pass_readyz_fail_closed_not_ga0` | API artifact builds and boots; `/healthz` 200; `/readyz` exercised as default fail-closed 503. |
| M6B-02 | `docs/evidence/M6B/M6B-02-worker-service-shell.md` | `merged_local_redis_worker_artifact_pass_not_ga0` | Worker artifact builds and boots; Redis-backed order-import job consumed once; BullMQ `jobId` dedupe only, not Telegram `update_id` dedupe. |
| M6B-03 | `docs/evidence/M6B/M6B-03-cron-service-shell.md` | `merged_local_cron_artifact_one_shot_idempotent_not_ga0` | Cron artifact builds and runs one-shot distill daily health; repeated same-day invocation skips; local smoke is file-backed artifact evidence, not true DB/staging/production evidence. |
| M6B-04 | `docs/evidence/M6B/M6B-04-thin-staging-render-env.md` | `repo_wiring_ready_live_render_deploy_pending_no_pass` | Render API/worker Redis env wiring is ready for Blueprint creation; live URL, `/healthz`, webhook synthetic acceptance, worker/cron heartbeat and alerts are not yet pass. |
| M6B-05a | `docs/evidence/M6B/M6B-05a-conversation-runtime-build.md` | `merged_ci_true_db_rls_smoke_passed_not_ga0` | Merged on main via #143; local contract tests and GitHub Actions run `28232360471` true DB/RLS smoke passed. Not real Telegram/staging/outbound. |
| M6B-05b | `docs/evidence/M6B/M6B-05b-equivalent-bot-webhook-drive.md` | `merged_local_webhook_equivalent_contract_passed_true_db_webhook_drive_not_claimed_not_ga0` | Merged on main via #144; narrow webhook-equivalent local contract passed. No local true DB/RLS webhook-driven pass claimed. |
| M6B-06 | none | `blocked_owner_gated_telegram_staging_inputs_missing_no_pass` | Missing Telegram test bot token, webhook secret, setWebhook authorization, staging endpoint and outbound test-account decision; not pass. |
| M6B-07 | none | `blocked_owner_gated_staging_rollback_inputs_missing_no_pass` | Missing owner-approved deploy/rollback targets and A-to-B-to-A evidence; not pass. |
| M6B-07a | `docs/evidence/M6B/M6B-07a-deploy-rollback-runbook-sync.md` | `ready_for_review_not_j01_pass` | Docs-only runbook sync for current emitted-artifact start facts; does not close M6B-07/J-01. |
| M6B-08 | none | `blocked_owner_gated_safe_restore_target_missing_no_pass` | Missing owner-approved safe restore target, backup snapshot and restore command evidence; not pass. |
| M6B-09 | `docs/evidence/M6B/M6B-09-ga0-runtime-evidence-rollup.md` | `no_go_blocked_owner_inputs_missing_not_ga0` | Runtime rollup recorded: inner evidence counted within boundaries; M6B-04/06/07/08 remain no-go blockers; no owner GA-0 approval recorded. |

## Summary

M6B exists because M6 completed the GA-0 decision package but did not produce a runnable GA-0 runtime closed loop. Current M6 status remains:

`m6_final_acceptance_rollup_recorded_no_go_recommended_owner_decision_pending_not_ga0`

GA-0 is not open. Production deployment, real customer/order data, customer LLM, real provider calls, Telegram Business auto-reply, P1 risk acceptance and 1.0 release are not approved.

M6B-00 is docs-only. It creates the runtime bring-up contract and queue so later slices can close gaps with runnable evidence instead of documentation assertions.

M6B-04 now has repo-level Render staging env wiring ready for platform execution. M6B-09 still records the current rollup: M6B-01/02/03/05a/05b have runnable local/CI evidence within their own boundaries, while live M6B-04 deploy verification and M6B-06/07/08 remain explicitly blocked until platform/runtime evidence exists. GA-0 recommendation remains No-Go / keep locked.

## Start Audit

Recorded at M6B-00 entry on 2026-06-26.

| Fact | Evidence |
|---|---|
| Linear tracking | LAY-15 `M6B-00: GA-0 runtime bring-up contract` |
| assigned worktree `pwd` | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m6b-00-ga0-runtime-bring-up-contract` |
| assigned `git status --short --branch` before edits | `## codex/m6b-00-ga0-runtime-bring-up-contract...origin/main` |
| assigned branch | `codex/m6b-00-ga0-runtime-bring-up-contract` |
| assigned `HEAD` | `ecdf740c643b211a963fd39988f97c96a25a34a1` |
| assigned `origin/main` | `ecdf740c643b211a963fd39988f97c96a25a34a1` |
| root/main checkout | `/Users/atilla/Applications/UZMAX智能运营` |
| root/main status | `## main...origin/main` |
| root/main `HEAD` | `ecdf740c643b211a963fd39988f97c96a25a34a1` |
| root/main `origin/main` | `ecdf740c643b211a963fd39988f97c96a25a34a1` |
| open PR audit | GitHub connector returned no open PRs before M6B-00 work |
| local no-merged branch audit | root `git branch --no-merged main` returned no output before M6B-00 work |
| existing M6B files audit | `rg --files docs/specs docs/evidence \| rg 'M6B\|m6b'` returned no output before M6B-00 work |

## Current Runtime Facts

| Area | Current repo fact | M6B implication |
|---|---|---|
| M6 rollup | `docs/evidence/M6/M6-09-final-acceptance-rollup.md` records GA-0 `no_go_recommended_owner_decision_pending` and 1.0 `blocked_p0_gaps_open`. | M6B starts from no-go, not release readiness. |
| API build/start | Current main emits an API artifact and `@uzmax/api` start boots `apps/api/dist/apps/api/src/main.js`. | M6B-01 local artifact proof is merged; real staging deploy/rollback remains M6B-04/M6B-07. |
| Worker build/start | Current main emits a worker artifact and `@uzmax/worker` start boots `apps/worker/dist/apps/worker/src/main.js`. | M6B-02 local Redis/order-import proof is merged; production/staging worker and Bot runtime staging proof remain blocked. |
| Cron build/start | Current main emits a cron artifact and `@uzmax/cron` start boots `apps/cron/dist/apps/cron/src/main.js`. | M6B-03 local one-shot/idempotency proof is merged; real Render deploy/rollback remains M6B-04/M6B-07. |
| Render | `render.yaml` declares api, worker, cron and `uzmax-redis`; cron schedule is `*/15 * * * *`; auto deploy is off. | M6B-04 can stage once owner infra/env exists. |
| Bot webhook | Current main wires webhook service to an env-selected queue provider that defaults to disabled/fail-closed and can explicitly use BullMQ. | Real Telegram webhook/setWebhook remains M6B-06. |
| Bot dedupe | Current main has stable Bot conversation job payload IDs and a DB-backed `telegram_update_dedupe` persistence gateway; GitHub Actions run `28232360471` passed the true DB/RLS smoke. | In-memory dedupe remains contract support only; BullMQ `jobId` proof is not accepted as Telegram `update_id` proof. |
| Conversation/ticket | Current main has a worker-side Bot conversation processor and Prisma/RLS persistence gateway for conversation/message/ticket/ticket_event rows. | True DB/RLS smoke passed in CI; real Telegram/staging/outbound proof remains owner-gated. |
| Existing BullMQ runtime | `apps/worker/src/order-import-bullmq-runtime.ts` covers order-import jobs. | Order-import worker proof cannot be treated as Bot conversation runtime proof. |
| DB/RLS schema | Migration `0003` and Prisma schema include conversation/message/ticket and `telegram_update_dedupe`; current main includes the M6B-05a Prisma/RLS runtime gateway and CI smoke. | Schema and inner-ring runtime gateway exist; real Telegram/staging/outbound and restore proof remain owner-gated. |
| CI secrets pattern | `.github/workflows/ci.yml` uses masked `UZMAX_RLS_DATABASE_URL` and Redis patterns. | Later M6B slices should reuse fail-closed secret behavior. |

## Runnable Evidence Red Line

M6B-01 through M6B-08 may be marked passed only with an observable runtime artifact:

- process exit code;
- HTTP response from a running service;
- queue depth change;
- DB row readback under RLS;
- structured log line with traceId;
- setWebhook/webhook delivery trace;
- deploy/rollback/restore A-to-B-to-A evidence.

Not acceptable as pass evidence for M6B-01 through M6B-08:

- "an evidence/spec/runbook contains string X";
- a `.test.mjs` that only asserts document wording;
- a synthetic/in-memory result presented as deployed, staging, production or true DB evidence.

Doc-anchor tests may remain drift guards. M6B-09 may aggregate prior runnable evidence but must not invent a pass.

## Execution Rings

| Ring | Slices | Owner infra needed |
|---|---|---|
| Inner | M6B-00, M6B-01, M6B-02, M6B-03, M6B-05a, M6B-05b | none; CI ephemeral Redis and existing `UZMAX_RLS_DATABASE_URL` can cover DB/queue proof |
| Outer | M6B-04, M6B-06, M6B-07, M6B-08, alert-fires and outbound proof | owner staging, Bot, alert, restore and outbound inputs |

An owner "no/later" caps only the gated outer slice. It does not stall the owner-independent inner ring.

## Build Strategy

M6B-01 owns the three-entrypoint artifact decision:

- `npm run build:api|worker|cron` must emit runnable artifacts.
- `start` must boot emitted artifacts.
- API may need decorator metadata handling or a tsc-emit fallback because NestJS uses decorators.
- Worker and cron should use the same toolchain where possible.
- Worker/cron placeholder starts are removed in M6B-02 and M6B-03.

## Conversation Runtime Scope

M6B-05a owns the missing Bot runtime path:

- BullMQ-backed `TelegramBotIngressQueuePort`;
- worker-side conversation/message consumer wired into `engine` and handoff;
- AppModule switch from disabled queue to env-selected real queue;
- RLS-backed conversation/ticket persistence gateway.

Required acceptance: true DB/RLS smoke using `UZMAX_RLS_DATABASE_URL` where same-tenant ingress -> dedupe -> queue -> consume -> ticket readback succeeds, tenant B cannot read tenant A's rows and one Telegram `update_id` produces exactly one persisted result.

## Dedupe Layers

| Layer | Key | Scope | Proven in |
|---|---|---|---|
| BullMQ job dedupe | `jobId` | worker does not double-process a re-enqueued job | M6B-02 |
| Telegram ingress dedupe | `update_id` / `providerUpdateId` | DB-persisted, restart/multi-instance safe | M6B-05a, M6B-05b and real staging in M6B-06 |

BullMQ `jobId` proof must never be accepted as Telegram `update_id` proof.

## Cron Semantics

Render cron invokes `uzmax-cron` on `*/15 * * * *`. The service must be one-shot: run a task, record result, exit with code. Because distill health is daily, M6B-03 must prove idempotency so the daily unit runs at most once per day despite repeated invocations.

## Alert Scope

M6B alert fire proof uses Telegram via a dedicated ops alert bot:

- `UZMAX_ALERT_TELEGRAM_BOT_TOKEN`
- `UZMAX_ALERT_TELEGRAM_CHAT_ID`

Sentry is optional/deferred through `UZMAX_SENTRY_DSN`. Until the ops alert bot exists, logs/health/heartbeat evidence can pass, but "alert actually fires" remains owner-blocked.

## Owner Input Binding

| Owner input | Gated slice | Fallback if declined/not yet | Delivery |
|---|---|---|---|
| Staging Redis source | M6B-02, M6B-04 | M6B-02 uses CI ephemeral Redis; staging waits | `UZMAX_REDIS_URL` |
| Render/Vercel staging create and env | M6B-04, M6B-06, M6B-07 | inner ring completes local/CI | `UZMAX_STAGING_*` manifest |
| Telegram test bot token, webhook secret, setWebhook authorization | M6B-06 | M6B-05a/05b prove path without real Telegram | `UZMAX_TG_BOT_TOKEN`, `UZMAX_TG_WEBHOOK_SECRET` |
| Ops alert Telegram bot token and chat id | M6B-04 alert-fires, L-01 | logs and health only | `UZMAX_ALERT_TELEGRAM_BOT_TOKEN`, `UZMAX_ALERT_TELEGRAM_CHAT_ID` |
| Safe restore target and snapshot | M6B-08 | J-03 remains explicit blocker | target ref and snapshot id manifest |
| Staging outbound to test account | M6B-06 outbound | inbound/dedupe/ticket proven; outbound disabled | owner written approval |

## M6B Planned Queue

| Order | Slice | Ring | Goal | Pass evidence |
|---:|---|---|---|---|
| 0 | M6B-00 Runtime Bring-up Contract | inner | this contract | spec and evidence README exist; fields present |
| 1 | M6B-01 API Production Artifact | inner | real build artifact and boot; `/healthz`, `/readyz`, traceId logs | build emits artifact; start boots artifact; health 200; traceId log |
| 2 | M6B-02 Worker Service Shell | inner | replace placeholder; one proven order-import job on Redis | worker boots; jobId no double-process; queue depth change; graceful shutdown; true DB/RLS smoke |
| 3 | M6B-03 Cron Service Shell | inner | replace placeholder; one-shot distill daily health | cron runs once and exits; `distill_run`/health evidence; failure non-zero; idempotent guard |
| 4 | M6B-04 Thin Staging Deploy | outer | api, worker, cron and Redis on staging | staging URLs/refs; Redis connected; health/heartbeat queryable |
| 5 | M6B-05a Conversation Runtime Build | inner | BullMQ ingress adapter, worker consumer, RLS conversation/ticket gateway, AppModule switch | true DB/RLS ingress -> dedupe -> consume -> ticket; tenant isolation; one update one ticket |
| 6 | M6B-05b Equivalent Bot Webhook Drive | inner | internal/synthetic webhook POST through M6B-05a chain | duplicate update -> one result; queue consumed; persisted trace |
| 7 | M6B-06 Real Telegram Staging Webhook | outer | real test bot and setWebhook to staging | secret-validated webhook delivered; duplicate no double-write; outbound only to approved test account |
| 8 | M6B-07 Deploy/Rollback Drill | outer | api, worker, cron and admin A->B->A | version trace; health/heartbeat recover; no job loss/duplication |
| 9 | M6B-08 Backup/Restore Drill | outer | restore on safe target | snapshot id; restore command class; post-restore RLS smoke; asset-ref safety; residue clean |
| 10 | M6B-09 GA-0 Runtime Rollup | inner | aggregate runnable evidence and re-judge GA-0 | only real M6B evidence; honest go/no-go; blocker specs if not green |

## M6B-09 Current Rollup

| Area | Status | Notes |
|---|---|---|
| Inner runtime evidence | `partial_pass_with_boundaries` | M6B-01/02/03 local artifact proofs, M6B-05a CI true DB/RLS proof and M6B-05b local webhook-equivalent contract proof are counted only as recorded. |
| Owner-gated staging/deploy/Telegram/restore | `blocked_no_pass` | M6B-04/06/07/08 have no owner-provided staging, Telegram, rollback or restore inputs/evidence. |
| Evidence honesty red line | `enforced` | Synthetic, in-memory, doc-only or file-backed proof is not counted as staging, production or true DB proof. |
| GA-0 decision | `no_go_keep_locked` | Checklist is not green and no owner explicit GA-0 approval is recorded. |

## Dependencies And Serial Points

- M6B-01 precedes M6B-02 and M6B-03.
- M6B-05a precedes M6B-05b and M6B-06.
- M6B-04 precedes M6B-06 and M6B-07.
- M6B-08 waits for owner safe restore target before any real restore drill.
- DB schema, migrations, RLS policy, lockfile, shared config, CI/guard, generated artifacts and release gates remain global serial points.
- M6B-05a is serial with anything touching `apps/api`, `apps/worker` or DB gateway paths.

## Historical M6B-00 Validation

The following table is the original M6B-00 contract PR validation record from 2026-06-26. It is preserved as history and is not the current M6B rollup validation. Current M6B-09 validation lives in `docs/evidence/M6B/M6B-09-ga0-runtime-evidence-rollup.md`.

| Command | Result | Notes |
|---|---|---|
| `npm run guard:doc-triggers` | blocked_local_tooling | This shell does not expose `npm`; reran the guard directly with bundled Node. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/doc-trigger-paths.mjs` | pass | `doc-trigger-paths: ok`. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/workspace-isolation.mjs` | pass | Linked worktree on `codex/m6b-00-ga0-runtime-bring-up-contract`; dirty allowed. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/worker-write-boundary.mjs --assigned /Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m6b-00-ga0-runtime-bring-up-contract --root /Users/atilla/Applications/UZMAX智能运营` | pass | Assigned worktree boundary check passed. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/eval-trigger-paths.mjs --base origin/main` | pass | `no eval-triggering paths changed`. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/forbidden-terms.mjs` | pass | `forbidden-terms: ok`. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/prettier-ignore-boundary.mjs --base origin/main` | pass | Baseline and monitored diff checks passed. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node /Users/atilla/Applications/UZMAX智能运营/node_modules/prettier/bin/prettier.cjs --check docs/specs/M6B-00-ga0-runtime-bring-up-contract.md docs/evidence/M6B/README.md` | pass | Both Markdown files use Prettier style. |
| `rg --files docs/specs docs/evidence \| rg 'M6B-0[1-9]\|m6b-0[1-9]'` | pass | Historical M6B-00-only check: no M6B-01 through M6B-09 spec/evidence files existed before later M6B slices. |
| `git diff --cached --name-status` | pass | Only `docs/evidence/M6B/README.md` and `docs/specs/M6B-00-ga0-runtime-bring-up-contract.md` are staged. |
| `git diff --cached --check` | pass | No whitespace errors. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M6B-00-ga0-runtime-bring-up-contract.md` | pass | Diff has 2 docs files, 0 source files, 0 net source LOC and 0 new source files. |

## Current Boundaries

M6B as currently indexed through M6B-09 does not approve:

- GA-0 opening;
- production deployment;
- real customer/order data;
- customer LLM or real provider calls;
- production Redis/worker/cron deployment;
- real Bot token/webhook secret;
- Telegram Business automatic reply;
- real Telegram staging webhook/setWebhook;
- backup/restore execution;
- outbound Bot sending;
- P1 risk acceptance or P2 backlog classification;
- 1.0 release.

## Closeout / Incident Record

No new incident was recorded by M6B-00. M6B-09 records the current rollup and keeps GA-0 locked pending owner-gated M6B-04/06/07/08 evidence and explicit owner approval.
