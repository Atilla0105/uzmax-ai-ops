# M6B Evidence

> evidence_id: M6B-00-ga0-runtime-bring-up-contract
> milestone: M6B
> acceptance_items: J-01, J-02, J-03, J-04, J-05, K-03, K-04, L-01, L-02
> owner: project owner owns staging infra, real Bot/alert/restore/outbound inputs, GA-0, production, real data, customer LLM, provider/cost/risk and 1.0 decisions; AI agents own execution, review and evidence honesty
> status: ready_for_review
> created_at: 2026-06-26
> updated_at: 2026-06-26
> source_files: `AGENTS.md`, four v1.1 source-of-truth docs, `docs/specs/M6B-00-ga0-runtime-bring-up-contract.md`, `docs/evidence/M6/README.md`, `docs/evidence/M6/M6-09-final-acceptance-rollup.md`, `docs/release.md`, `render.yaml`, `.github/workflows/ci.yml`, `apps/api/package.json`, `apps/worker/package.json`, `apps/cron/package.json`, `apps/api/src/app.module.ts`, `apps/api/src/telegram-bot.ts`, `apps/worker/src/order-import-bullmq-runtime.ts`, `packages/db/prisma/schema.prisma`, `packages/db/migrations/0003_channel_conversation_ticket_foundation.sql`
> sensitive_data_location: none; this file contains no customer/order/message/provider secret material
> redaction_status: no raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys, Bot tokens, webhook secrets or DB URLs
> review_notes: M6B-00 records the runtime bring-up contract after M6 no-go; it does not implement runtime behavior or approve GA-0/1.0
> signoff: pending owner review of this M6B-00 PR

## M6B Slice Index

| Slice | Evidence | Status | Notes |
|---|---|---|---|
| M6B-00 | This README and `docs/specs/M6B-00-ga0-runtime-bring-up-contract.md` | `ready_for_review` | Runtime bring-up contract only; not GA-0. |
| M6B-01 | `docs/evidence/M6B/M6B-01-api-production-artifact.md` | `ready_for_review` | API artifact builds and boots; `/healthz` 200; `/readyz` exercised as default fail-closed 503. |
| M6B-02 | `docs/evidence/M6B/M6B-02-worker-service-shell.md` | `ready_for_review` | Worker artifact builds and boots; Redis-backed order-import job consumed once; BullMQ `jobId` dedupe only, not Telegram `update_id` dedupe. |
| M6B-03 | `docs/evidence/M6B/M6B-03-cron-service-shell.md` | `ready_for_review` | Cron artifact builds and runs one-shot distill daily health; repeated same-day invocation skips; local smoke is file-backed artifact evidence, not true DB/staging/production evidence. |

## Summary

M6B exists because M6 completed the GA-0 decision package but did not produce a runnable GA-0 runtime closed loop. Current M6 status remains:

`m6_final_acceptance_rollup_recorded_no_go_recommended_owner_decision_pending_not_ga0`

GA-0 is not open. Production deployment, real customer/order data, customer LLM, real provider calls, Telegram Business auto-reply, P1 risk acceptance and 1.0 release are not approved.

M6B-00 is docs-only. It creates the runtime bring-up contract and queue so later slices can close gaps with runnable evidence instead of documentation assertions.

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
| API build/start | `apps/api/package.json` has `build = tsc --noEmit`; `start` imports `scripts/runtime-compiler.mjs`. | M6B-01 must produce and boot a real artifact. |
| Worker build/start | `apps/worker/package.json` has `build = tsc --noEmit`; `start` prints M0 deployment placeholder. | M6B-02 must replace placeholder with a real worker shell. |
| Cron build/start | M6B-03 changes `apps/cron/package.json` so `build` emits an artifact and `start` boots `apps/cron/dist/apps/cron/src/main.js`. | Placeholder is closed for cron artifact proof; real Render deploy/rollback remains M6B-04/M6B-07. |
| Render | `render.yaml` declares api, worker, cron and `uzmax-redis`; cron schedule is `*/15 * * * *`; auto deploy is off. | M6B-04 can stage once owner infra/env exists. |
| Bot webhook | `apps/api/src/app.module.ts` wires webhook service to `DisabledTelegramBotIngressQueue`. | M6B-05a must switch to an env-selected BullMQ queue adapter. |
| Bot dedupe | `apps/api/src/telegram-bot.ts` has in-memory `providerUpdateId` dedupe. | In-memory dedupe is contract support only; DB-backed dedupe remains M6B-05a/05b/06. |
| Conversation/ticket | AppModule provides `InMemoryConversationTicketRepository`. | M6B-05a must add true DB/RLS conversation/ticket gateway for Bot runtime. |
| Existing BullMQ runtime | `apps/worker/src/order-import-bullmq-runtime.ts` covers order-import jobs. | Order-import worker proof cannot be treated as Bot conversation runtime proof. |
| DB/RLS schema | Migration `0003` and Prisma schema include conversation/message/ticket and `telegram_update_dedupe`. | Schema exists; runtime gateway and smoke are still missing. |
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

## Dependencies And Serial Points

- M6B-01 precedes M6B-02 and M6B-03.
- M6B-05a precedes M6B-05b and M6B-06.
- M6B-04 precedes M6B-06 and M6B-07.
- M6B-08 waits for owner safe restore target before any real restore drill.
- DB schema, migrations, RLS policy, lockfile, shared config, CI/guard, generated artifacts and release gates remain global serial points.
- M6B-05a is serial with anything touching `apps/api`, `apps/worker` or DB gateway paths.

## Validation

Recorded from the assigned worktree on 2026-06-26.

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
| `rg --files docs/specs docs/evidence \| rg 'M6B-0[1-9]\|m6b-0[1-9]'` | pass | No M6B-01 through M6B-09 spec/evidence files were created. |
| `git diff --cached --name-status` | pass | Only `docs/evidence/M6B/README.md` and `docs/specs/M6B-00-ga0-runtime-bring-up-contract.md` are staged. |
| `git diff --cached --check` | pass | No whitespace errors. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M6B-00-ga0-runtime-bring-up-contract.md` | pass | Diff has 2 docs files, 0 source files, 0 net source LOC and 0 new source files. |

## Boundaries

M6B-00 does not approve:

- M6B-01 through M6B-09 implementation;
- GA-0 opening;
- production deployment;
- real customer/order data;
- customer LLM or real provider calls;
- production Redis/worker/cron deployment;
- real Bot token/webhook secret;
- Telegram Business automatic reply;
- outbound Bot sending;
- P1 risk acceptance or P2 backlog classification;
- 1.0 release.

## Closeout / Incident Record

No new incident was created by M6B-00. Final PR closeout must confirm branch hygiene and open PR audit before merge.
