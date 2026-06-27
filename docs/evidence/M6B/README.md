# M6B Evidence

> evidence_id: M6B-runtime-evidence-index
> milestone: M6B
> acceptance_items: J-01, J-02, J-03, J-04, J-05, K-03, K-04, L-01, L-02
> owner: project owner owns staging infra, real Bot/alert/restore/outbound inputs, GA-0, production, real data, customer LLM, provider/cost/risk and 1.0 decisions; AI agents own execution, review and evidence honesty
> status: m6_closed_as_evidence_runtime_hardening_package_ga0_no_go
> created_at: 2026-06-26
> updated_at: 2026-06-27
> source_files: `AGENTS.md`, four v1.1 source-of-truth docs, `docs/specs/M6B-00-ga0-runtime-bring-up-contract.md`, `docs/specs/M6B-09-ga0-runtime-evidence-rollup.md`, `docs/specs/M6B-09a-post-live-staging-evidence-sync.md`, `docs/specs/M6B-10-api-staging-identity-authz-readiness.md`, `docs/specs/M6B-11-m6-no-go-closeout.md`, `docs/specs/M6B-12-live-readyz-activation.md`, `docs/specs/M6B-14-admin-staging-deploy.md`, `docs/specs/M6B-16-safe-restore-drill.md`, `docs/specs/M6B-17-ga0-external-blocker-rollup.md`, `docs/evidence/M6B/M6B-09-ga0-runtime-evidence-rollup.md`, `docs/evidence/M6B/M6B-09a-post-live-staging-evidence-sync.md`, `docs/evidence/M6B/M6B-10-api-staging-identity-authz-readiness.md`, `docs/evidence/M6B/M6B-11-m6-no-go-closeout.md`, `docs/evidence/M6B/M6B-12-live-readyz-activation.md`, `docs/evidence/M6B/M6B-14-admin-staging-deploy.md`, `docs/evidence/M6B/M6B-16-safe-restore-drill.md`, `docs/evidence/M6B/M6B-17-ga0-external-blocker-rollup.md`, existing M6B slice specs/evidence, `docs/runbooks/deploy-rollback.md`, `docs/evidence/M6/README.md`, `docs/evidence/M6/M6-09-final-acceptance-rollup.md`, `docs/release.md`, `render.yaml`, `.github/workflows/ci.yml`, `apps/api/package.json`, `apps/worker/package.json`, `apps/cron/package.json`, `apps/api/src/app.module.ts`, `apps/api/src/telegram-bot.ts`, `apps/worker/src/order-import-bullmq-runtime.ts`, `packages/db/prisma/schema.prisma`, `packages/db/migrations/0003_channel_conversation_ticket_foundation.sql`
> sensitive_data_location: none; this file contains no customer/order/message/provider secret material
> redaction_status: no raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys, Bot tokens, webhook secrets or DB URLs
> review_notes: M6B index now includes M6B-17: LAY-19, LAY-23, LAY-24 and LAY-30 are Done from live staging/test evidence. External-input blockers are cleared, but GA-0 remains locked until explicit owner release decision and any remaining non-external release conditions are closed.
> signoff: no owner GA-0 approval recorded; owner decision remains required

## M6B Slice Index

| Slice | Evidence | Status | Notes |
|---|---|---|---|
| M6B-00 | This README and `docs/specs/M6B-00-ga0-runtime-bring-up-contract.md` | `ready_for_review` | Runtime bring-up contract only; not GA-0. |
| M6B-01 | `docs/evidence/M6B/M6B-01-api-production-artifact.md` | `merged_local_artifact_health_pass_readyz_fail_closed_not_ga0` | API artifact builds and boots; `/healthz` 200; `/readyz` exercised as default fail-closed 503. |
| M6B-02 | `docs/evidence/M6B/M6B-02-worker-service-shell.md` | `merged_local_redis_worker_artifact_pass_not_ga0` | Worker artifact builds and boots; Redis-backed order-import job consumed once; BullMQ `jobId` dedupe only, not Telegram `update_id` dedupe. |
| M6B-03 | `docs/evidence/M6B/M6B-03-cron-service-shell.md` | `merged_local_cron_artifact_one_shot_idempotent_not_ga0` | Cron artifact builds and runs one-shot distill daily health; repeated same-day invocation skips; local smoke is file-backed artifact evidence, not true DB/staging/production evidence. |
| M6B-04 | `docs/evidence/M6B/M6B-04-thin-staging-render-env.md`; `docs/evidence/M6B/M6B-17-ga0-external-blocker-rollup.md`; Linear LAY-19/30 | `live_staging_api_worker_cron_redis_alert_closed_not_ga0` | Durable Render API base is `https://uzmax-api-staging.onrender.com`; `/healthz` 200; `/readyz` 200; missing-secret webhook POST returns 401. Worker/cron heartbeat and alert fire proof are closed in Linear LAY-19; LAY-30 live identity/authz activation is Done. |
| M6B-05a | `docs/evidence/M6B/M6B-05a-conversation-runtime-build.md` | `merged_ci_true_db_rls_smoke_passed_not_ga0` | Merged on main via #143; local contract tests and GitHub Actions run `28232360471` true DB/RLS smoke passed. Not real Telegram/staging/outbound. |
| M6B-05b | `docs/evidence/M6B/M6B-05b-equivalent-bot-webhook-drive.md` | `merged_local_webhook_equivalent_contract_passed_true_db_webhook_drive_not_claimed_not_ga0` | Merged on main via #144; narrow webhook-equivalent local contract passed. No local true DB/RLS webhook-driven pass claimed. |
| M6B-06 | Linear LAY-22 comments plus M6B-06a/06b evidence | `lay22_done_scoped_webhook_worker_path_not_ga0` | LAY-22 is Done within scope: PR #147/#148 merged and CI true DB/RLS smoke passed for synthetic webhook -> Redis -> worker -> DB/RLS. No outbound send, production endpoint, customer/order data or live worker/cron heartbeat is claimed. |
| M6B-06a | `docs/evidence/M6B/M6B-06a-bullmq-job-id-fix.md` | `validated_not_ga0` | BullMQ-safe Bot conversation job IDs fixed the real enqueue blocker. Not real Telegram delivery, outbound or GA-0. |
| M6B-06b | `docs/evidence/M6B/M6B-06b-telegram-worker-consumer.md` | `merged_ci_true_db_smoke_supported_not_ga0` | Worker service shell supports `telegram-bot-conversation`; Linear records CI run `28250801530` passed the masked-secret true DB/RLS smoke. Evidence file still contains historical pending wording; M6B-09a records the current tracker/repo sync. |
| M6B-07 | `docs/evidence/M6B/M6B-17-ga0-external-blocker-rollup.md`; Linear LAY-23 | `live_deploy_rollback_drill_closed_not_ga0` | API, worker, cron and admin completed A -> B -> A rollback on staging/preview resources. Final API/worker/cron state returned to `main` / `4de3f9a`; admin final Vercel preview is `dpl_FF8arhXgtBXmcr9p7T2LfQfSsQ4t` with `target=null`. |
| M6B-07a | `docs/evidence/M6B/M6B-07a-deploy-rollback-runbook-sync.md` | `historical_runbook_sync_superseded_by_m6b17` | Docs-only runbook sync for current emitted-artifact start facts. It did not close M6B-07 by itself; M6B-17 now records the later live rollback drill closure. |
| M6B-08 | `docs/evidence/M6B/M6B-17-ga0-external-blocker-rollup.md`; Linear LAY-24 | `safe_restore_drill_closed_not_ga0` | Safe restore drill ran against an isolated Supabase safe target/branch, RLS smoke passed and the safe target was cleaned up. |
| M6B-09 | `docs/evidence/M6B/M6B-09-ga0-runtime-evidence-rollup.md` | `historical_no_go_rollup_superseded_by_m6b17_for_external_inputs` | Runtime rollup recorded before M6B-09a and M6B-17. It remains valid historical no-go evidence, but its external-input blocker list is superseded by M6B-17. |
| M6B-09a | `docs/evidence/M6B/M6B-09a-post-live-staging-evidence-sync.md` | `historical_post_live_sync_superseded_by_m6b17_for_external_inputs` | Docs-only post-live sync: LAY-22 and LAY-27 were Done within scope; durable staging API and test bot webhook hygiene were recorded. Its `/readyz`, worker/cron, alert, rollback and restore gaps are superseded by M6B-17. |
| M6B-10 | `docs/evidence/M6B/M6B-10-api-staging-identity-authz-readiness.md` | `implementation_ready_live_env_closed_by_lay30_not_ga0` | API authz repository wiring is env-selected instead of hard-wired disabled; default remains fail-closed. Live `/readyz` 200 and synthetic authz closure are recorded in LAY-30/M6B-17. |
| M6B-11 | `docs/evidence/M6B/M6B-11-m6-no-go-closeout.md` | `historical_m6_no_go_closeout_superseded_by_m6b17_for_external_inputs` | Docs-only closeout sync: M6/M6B closed as the then-current evidence/runtime-hardening package. Its LAY-19/LAY-23/LAY-24 open-blocker statement is superseded by M6B-17. |
| M6B-12 | `docs/evidence/M6B/M6B-12-live-readyz-activation.md` | `historical_readyz_activation_attempt_superseded_by_m6b17` | Initial live activation attempt prepared synthetic Supabase Auth/DB facts but could not change Render env in that worker context, so it did not close LAY-30. Later M6B-12a/M6B-12b and M6B-17 supersede this gap with live `/readyz` 200 evidence. |
| M6B-12a | `docs/evidence/M6B/M6B-12a-rls-access-context-provider.md`; Linear LAY-30 | `code_unblock_live_readyz_closed_not_ga0` | Code fix for the RLS-backed API authz provider: request org context is read and the Prisma authz repository sets RLS role/context before reading facts. Live Render `/readyz` 200 and synthetic authz closure are recorded in LAY-30. |
| M6B-12b | `docs/evidence/M6B/M6B-12b-render-prisma-generate.md`; Linear LAY-30/19/23 | `config_fix_live_render_validated_not_ga0` | Render deploy `dep-d8voptlaeets73daij5g` failed on startup because `@prisma/client` was not generated. `render.yaml` now generates Prisma client before API/worker/cron builds, and later live API/worker/cron deploys validated the command path. |
| M6B-14 | `docs/evidence/M6B/M6B-14-admin-staging-deploy.md` | `admin_preview_deploy_prerequisite_superseded_by_m6b17_rollback_closure` | Existing Vercel project `uzmax-admin` received a READY preview deployment with admin HTML and protected bundle evidence; GA-0 action stayed locked. This was a LAY-23 prerequisite, and M6B-17 later records the full API/worker/cron/admin rollback drill closure. |
| M6B-16 | `docs/evidence/M6B/M6B-16-safe-restore-drill.md`; Linear LAY-24 | `safe_restore_branch_schema_rls_drill_passed_not_ga0` | Supabase safe branch `uzmax-restore-drill-20260627` was created at lowest returned cost, schema/RLS smoke passed with synthetic rows, and wrong-tenant context saw zero rows. This supports M6B-17 LAY-24 closure; it is not PITR or production-data restore. |
| M6B-17 | `docs/evidence/M6B/M6B-17-ga0-external-blocker-rollup.md` | `external_input_blockers_cleared_ga0_still_locked_not_release` | LAY-19, LAY-23, LAY-24 and LAY-30 are Done. This clears the external-input blocker class only; GA-0 is still locked until explicit owner release decision and remaining non-external release conditions are closed. |

## Summary

M6B exists because M6 completed the GA-0 decision package but did not produce a runnable GA-0 runtime closed loop. Current M6 status remains:

`m6_final_acceptance_rollup_recorded_no_go_recommended_owner_decision_pending_not_ga0`

M6 is closed as an evidence/runtime-hardening package; GA-0 remains no-go. Production deployment, real customer/order data, customer LLM, real provider calls, Telegram Business auto-reply, P1 risk acceptance and 1.0 release are not approved.

M6B-00 is docs-only. It creates the runtime bring-up contract and queue so later slices can close gaps with runnable evidence instead of documentation assertions.

M6B-17 records the post-activation update: LAY-19, LAY-23, LAY-24 and LAY-30 are Done from live staging/test evidence. The durable Render API now has `/healthz` HTTP 200, `/readyz` HTTP 200 and fail-closed missing-secret webhook HTTP 401. Worker/cron heartbeat, alert fire, deploy rollback and safe restore evidence are closed. GA-0 recommendation remains keep locked because explicit owner GA-0 opening and remaining non-external release conditions are separate from external-input blocker clearance.

M6B-12 records the historical first activation attempt: it prepared Supabase synthetic Auth/RLS facts and produced a synthetic bearer token without recording the token value, but could not change Render env in that worker context. M6B-12a, M6B-12b and M6B-17 supersede that gap; current truth is live `/readyz` HTTP 200 with LAY-30 Done, while GA-0 remains locked.

M6B-14 records the admin staging deploy prerequisite for LAY-23: Vercel deployment `dpl_FUymF9iFuZ8WMRe17UTDHLbp7Prg` reached READY for `uzmax-admin`, admin HTML loaded from the preview URL, and the protected bundle still kept the GA-0 action locked. M6B-17 later records the full rollback drill closure.

M6B-16 adds a real Supabase safe restore target proof for LAY-24: branch `uzmax-restore-drill-20260627` / project ref `hhclgxtjiuwghyifysdc`, `with_data=false`, `preview_project_status=ACTIVE_HEALTHY`, positive and negative RLS smoke passed on synthetic rows. This does not change GA-0 by itself.

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
| API build/start | Current main emits an API artifact and `@uzmax/api` start boots `apps/api/dist/apps/api/src/main.js`. | M6B-01 local artifact proof is merged; M6B-17 records live staging deploy/rollback closure. |
| Worker build/start | Current main emits a worker artifact and `@uzmax/worker` start boots `apps/worker/dist/apps/worker/src/main.js`. | M6B-02 local Redis/order-import proof is merged; M6B-17 records live staging worker heartbeat and rollback closure. |
| Cron build/start | Current main emits a cron artifact and `@uzmax/cron` start boots `apps/cron/dist/apps/cron/src/main.js`. | M6B-03 local one-shot/idempotency proof is merged; M6B-17 records live Render cron heartbeat and rollback closure. |
| Render | Render staging API/worker/cron/Redis resources exist and final rollback state is `main` / `4de3f9a`. | M6B-17 records `/readyz`, worker/cron heartbeat, alert fire and rollback closure. |
| Bot webhook | Current main wires webhook service to an env-selected queue provider that defaults to disabled/fail-closed and can explicitly use BullMQ. | M6B-09a records the test bot webhook now points at the durable staging API; outbound, production and full release readiness remain not approved. |
| Bot dedupe | Current main has stable Bot conversation job payload IDs and a DB-backed `telegram_update_dedupe` persistence gateway; GitHub Actions run `28232360471` passed the true DB/RLS smoke. | In-memory dedupe remains contract support only; BullMQ `jobId` proof is not accepted as Telegram `update_id` proof. |
| Conversation/ticket | Current main has a worker-side Bot conversation processor and Prisma/RLS persistence gateway for conversation/message/ticket/ticket_event rows. | True DB/RLS smoke passed in CI; real Telegram/staging/outbound proof remains owner-gated. |
| Existing BullMQ runtime | `apps/worker/src/order-import-bullmq-runtime.ts` covers order-import jobs. | Order-import worker proof cannot be treated as Bot conversation runtime proof. |
| DB/RLS schema | Migration `0003` and Prisma schema include conversation/message/ticket and `telegram_update_dedupe`; current main includes the M6B-05a Prisma/RLS runtime gateway and CI smoke. | Schema and inner-ring runtime gateway exist; M6B-17 records staging worker and safe restore closure. Production/outbound/customer-data use remains not approved. |
| CI secrets pattern | `.github/workflows/ci.yml` uses masked `UZMAX_RLS_DATABASE_URL` and Redis patterns. | Later M6B slices should reuse fail-closed secret behavior. |

## Historical Post-live Staging Sync

Recorded by M6B-09a on 2026-06-26.

| Area | Current fact | Boundary |
|---|---|---|
| Durable staging API | `https://uzmax-api-staging.onrender.com` | Staging API web service only; not production. |
| `/healthz` | HTTP 200, body reports `service=api`, `status=ok`. | Health only; not readiness. |
| `/readyz` | HTTP 503, body reports `authz=not_configured` and `identity=not_configured`. | Historical M6B-09a fact; superseded by M6B-17 current `/readyz` 200 evidence. |
| Webhook route | Missing-secret POST reaches the app and returns HTTP 401 `telegram secret token mismatch`. | Fail-closed route evidence only; no token/secret value or outbound send. |
| Telegram `getWebhookInfo` | Linear LAY-27/28 records URL `https://uzmax-api-staging.onrender.com/telegram/bot/webhook`, pending 0, allowed updates `message` and `callback_query`, no last error. | Redacted control-plane evidence; this docs sync did not call Telegram. |
| Linear LAY-22 | Done within scoped M6B-06 boundary. | No production, outbound, customer/order data or live worker/cron heartbeat. |
| Linear LAY-27 | Done for durable test bot webhook hygiene. | Test bot only; no production, outbound or real customer traffic. |

M6B-17 supersedes the `/readyz`, worker/cron heartbeat, alert, rollback and restore gaps shown in this historical table. The current staging facts are `/readyz` HTTP 200, worker/cron heartbeat closed, alert fire closed, deploy rollback closed and safe restore closed.

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
| Render/Vercel staging create and env | M6B-04, M6B-06, M6B-07 | M6B-09a records API carrier only; worker/cron/admin rollback still wait | `UZMAX_STAGING_*` manifest |
| Telegram test bot token, webhook secret, setWebhook authorization | M6B-06 | M6B-09a records scoped test bot webhook hygiene; outbound remains disabled | `UZMAX_TG_BOT_TOKEN`, `UZMAX_TG_WEBHOOK_SECRET` |
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
| Owner-gated staging/deploy/Telegram/restore | `external_input_blockers_cleared` | M6B-17 records LAY-19, LAY-23, LAY-24 and LAY-30 Done: `/readyz`, worker/cron, alert, rollback and restore are closed in staging/test-only evidence. |
| Evidence honesty red line | `enforced` | Synthetic, in-memory, doc-only or file-backed proof is not counted as staging, production or true DB proof. |
| GA-0 decision | `locked_owner_release_decision_pending` | External-input blockers are cleared, but no owner explicit GA-0 approval is recorded and non-external release conditions may still apply. |
| M6 closeout | `closed_no_go_external_inputs_cleared_later` | M6/M6B closed as the evidence/runtime-hardening package; M6B-17 later records LAY-19/LAY-23/LAY-24/LAY-30 Done. |

## Dependencies And Serial Points

- M6B-01 precedes M6B-02 and M6B-03.
- M6B-05a precedes M6B-05b and M6B-06.
- M6B-04 precedes M6B-06 and M6B-07.
- M6B-08 safe restore target drill is closed by LAY-24; future restore drills must still use isolated safe targets.
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

M6B as currently indexed through M6B-17 does not approve:

- GA-0 opening;
- production deployment;
- real customer/order data;
- customer LLM or real provider calls;
- production Redis/worker/cron deployment;
- production Bot token/webhook secret;
- Telegram Business automatic reply;
- Telegram Business or production webhook mutation;
- outbound Bot send from the staging test bot;
- production backup/restore execution or restore into dev/staging/prod;
- P1 risk acceptance or P2 backlog classification;
- 1.0 release.

## Closeout / Incident Record

No new incident was recorded by M6B-00. M6B-09 records the historical runtime rollup; M6B-11 closes M6 at the no-go evidence boundary; M6B-17 records that LAY-19, LAY-23, LAY-24 and LAY-30 are now Done. GA-0 remains locked pending explicit owner release decision and any remaining non-external release conditions.
