# M6B-09 GA-0 Runtime Evidence Rollup

> evidence_id: M6B-09-ga0-runtime-evidence-rollup
> milestone: M6B
> acceptance_items: J-01, J-02, J-03, J-04, J-05, K-03, K-04, L-01, L-02
> owner: project owner owns staging, production, real Telegram, rollback, restore, alert, outbound, real customer/order data, customer LLM/provider/cost/compliance, P1/P2 and GA-0/1.0 decisions; AI agents own evidence aggregation, review and honesty
> status: no_go_blocked_owner_inputs_missing_not_ga0
> created_at: 2026-06-26
> updated_at: 2026-06-26
> source_files: `AGENTS.md`, `docs/specs/M6B-00-ga0-runtime-bring-up-contract.md`, `docs/evidence/M6B/README.md`, `docs/specs/M6B-01-api-production-artifact.md`, `docs/evidence/M6B/M6B-01-api-production-artifact.md`, `docs/specs/M6B-02-worker-service-shell.md`, `docs/evidence/M6B/M6B-02-worker-service-shell.md`, `docs/specs/M6B-03-cron-service-shell.md`, `docs/evidence/M6B/M6B-03-cron-service-shell.md`, `docs/specs/M6B-05a-conversation-runtime-build.md`, `docs/evidence/M6B/M6B-05a-conversation-runtime-build.md`, `docs/specs/M6B-05b-equivalent-bot-webhook-drive.md`, `docs/evidence/M6B/M6B-05b-equivalent-bot-webhook-drive.md`, `docs/evidence/M6/M6-09-final-acceptance-rollup.md`, `docs/release.md`, `UZMAX智能运营系统-1.0验收矩阵-v1.1.md`
> sensitive_data_location: none; this file contains no customer/order/message/provider secret material
> redaction_status: no raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys, Bot tokens, webhook secrets, DB URLs, non-public platform secrets or restore target secrets
> review_notes: M6B-09 aggregates the pre-M6B-09a runtime evidence and records a GA-0 No-Go posture; M6B-09a later adds live staging API/test bot webhook hygiene evidence while preserving `/readyz`, worker/cron, alert, rollback, restore and GA-0 blockers
> signoff: no owner GA-0 approval recorded; owner decision remains required

## Summary

M6B-09 records the current GA-0 runtime evidence package:

`m6b_09_runtime_evidence_rollup_no_go_blocked_owner_inputs_missing_not_ga0`

Inner-ring M6B evidence exists and is usable only within its recorded boundary. Outer-ring staging, real Telegram, rollback and restore slices are explicitly blocked. GA-0 remains locked because the checklist is not green and no owner explicit GA-0 approval is recorded.

This rollup does not approve full staging closure, production, real customer/order data, customer LLM/provider use, outbound Bot sends, restore execution, P1/P2 risk classification, GA-0 or 1.0 release.

Post-live update: M6B-09a now records that a durable staging API base exists, `/healthz` is HTTP 200, missing-secret webhook POST reaches the app and returns HTTP 401, Telegram test bot `getWebhookInfo` points to the Render staging webhook endpoint, and Linear LAY-22/LAY-27 are Done within scope. This does not change the GA-0 recommendation because `/readyz`, worker/cron heartbeat, alert fire proof, full rollback, restore and owner approval remain open.

## Start Audit

Recorded at M6B-09 entry on 2026-06-26.

| Fact | Evidence |
|---|---|
| Linear tracking | LAY-25 `M6B-09: GA-0 runtime evidence rollup and go/no-go package` |
| assigned worktree `pwd` | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m6b-09-runtime-rollup` |
| assigned `git status --short --branch` before edits | `## codex/m6b-09-runtime-rollup...origin/main` |
| assigned branch | `codex/m6b-09-runtime-rollup` |
| assigned `HEAD` | `81fdc6480914795a9737cdf8c16d4c0daa50d1e9` |
| assigned `origin/main` | `81fdc6480914795a9737cdf8c16d4c0daa50d1e9` |
| current history check | `git log --oneline --max-count=12` shows M6B-05b at `81fdc64` and M6B-05a at `95b5b7e`, both merged on current main history |
| initial diff | `git diff --name-status origin/main` returned no output before edits |

## Evidence Rollup

| Slice | Current status | Evidence counted | Boundary |
|---|---|---|---|
| M6B-01 API Production Artifact | `merged_local_artifact_health_pass_readyz_fail_closed_not_ga0` | Local emitted API artifact builds and starts; `/healthz` returns 200; `/readyz` returns 503 fail-closed; traceId startup log observed. | Local artifact proof only; not staging, production or readyz-open evidence. |
| M6B-02 Worker Service Shell | `merged_local_redis_worker_artifact_pass_not_ga0` | Local emitted worker artifact starts against Redis; duplicate same BullMQ `jobId` leaves waiting depth 1; after consume waiting depth 0 and completed count 1; graceful shutdown observed. | BullMQ `jobId` dedupe only; not Telegram `update_id` dedupe and not local true DB/RLS pass. |
| M6B-03 Cron Service Shell | `merged_local_cron_artifact_one_shot_idempotent_not_ga0` | Local emitted cron artifact runs once and exits 0; repeated same-day invocation skips; missing payload exits non-zero. | File-backed local artifact smoke only; not true DB/RLS, staging or production cron evidence. |
| M6B-04 Thin Staging Deploy | `live_api_base_health_pass_readyz_fail_closed_worker_cron_open_not_ga0` | M6B-09a records durable API base `https://uzmax-api-staging.onrender.com`, `/healthz` HTTP 200, `/readyz` HTTP 503 due `authz=not_configured` and `identity=not_configured`, and missing-secret webhook HTTP 401. | API health and fail-closed route evidence only; live worker/cron heartbeat and alert fire proof remain absent. |
| M6B-05a Conversation Runtime Build | `merged_ci_true_db_rls_smoke_passed_not_ga0` | GitHub Actions run `28232360471` passed M6B conversation runtime true DB/RLS smoke: accepted synthetic Bot update persisted conversation/message/ticket/dedupe rows, duplicate deduped, tenant A readback allowed, tenant B denied, residue 0. | CI true DB/RLS inner-ring proof only; not real Telegram, staging, outbound or production. |
| M6B-05b Equivalent Bot Webhook Drive | `merged_local_webhook_equivalent_contract_passed_true_db_webhook_drive_not_claimed_not_ga0` | Local focused contract drives synthetic webhook-equivalent input through webhook core, explicit BullMQ-mode injected queue and worker processor; duplicate fake persistence returns one accepted and one deduped result. | Local contract proof only; true DB/RLS webhook-driven pass is not claimed. |
| M6B-06 Real Telegram Staging Webhook | `lay22_lay27_done_scoped_not_ga0` | Linear LAY-22/27 redacted evidence records test bot `getWebhookInfo` URL pointing to the Render staging webhook endpoint, pending 0, allowed updates `message` and `callback_query`, no last error; LAY-22 Done records PR #147/#148 and CI true DB/RLS smoke closure. | Test bot/staging hygiene and CI runtime proof only; no outbound send, production traffic, live worker/cron heartbeat or GA-0. |
| M6B-07 Deploy/Rollback Drill | `blocked_owner_gated_staging_rollback_inputs_missing_no_pass` | None. | Missing owner-approved staging deploy/rollback targets and A-to-B-to-A evidence for api, worker, cron and admin. |
| M6B-08 Backup/Restore Drill | `blocked_owner_gated_safe_restore_target_missing_no_pass` | None. | Missing owner-approved safe restore target, backup snapshot ref, restore command evidence and post-restore validation. |

## Evidence Red Line Review

Accepted within boundary:

- local process exit codes, HTTP responses, queue depth changes and structured logs from M6B-01/02/03;
- CI true DB/RLS readback from M6B-05a;
- local focused webhook-equivalent contract behavior from M6B-05b.

Not accepted as GA-0/staging/prod/true DB proof:

- synthetic or in-memory proof presented as real Telegram, staging, production or true DB evidence;
- doc-only assertions or string checks presented as runtime pass;
- BullMQ `jobId` dedupe presented as Telegram `update_id` dedupe;
- M6B-05b fake persistence presented as true DB/RLS webhook-driven closure;
- local file-backed cron smoke presented as DB-backed production cron evidence.

## GA-0 Go / No-Go Package

| Gate | Current posture | Reason |
|---|---|---|
| Runtime inner-ring artifacts | `partial_pass_with_boundaries` | M6B-01/02/03 local artifact evidence and M6B-05a/05b local/CI evidence exist. |
| Thin staging deploy | `partial_live_api_health_only` | M6B-09a records durable staging API and `/healthz` 200, but `/readyz`, worker/cron heartbeat and alert fire proof remain not pass. |
| Real Telegram staging webhook | `scoped_test_bot_hygiene_done_not_ga0` | M6B-09a records `getWebhookInfo` on the Render staging endpoint with pending 0 and no last error; no outbound send or production/customer traffic. |
| Deploy/rollback drill | `blocked_no_pass` | M6B-07 has no A-to-B-to-A deploy/rollback evidence. |
| Backup/restore drill | `blocked_no_pass` | M6B-08 lacks safe restore target and snapshot. |
| Alert fire / outbound proof | `blocked_no_pass` | No alert fire proof is recorded and outbound remains not approved/performed. |
| Owner explicit GA-0 approval | `not_recorded` | No owner decision opens GA-0. |

GA-0 recommendation from current repo evidence: `No-Go / keep locked`.

1.0 posture remains `blocked_p0_gaps_open` because the v1.1 acceptance matrix requires P0 evidence and explicit owner handling for P1/P2. This rollup does not downgrade any blocker.

## Blockers To Clear Before GA-0 Can Reopen

| Blocker | Owner input required | Minimum next evidence |
|---|---|---|
| M6B-04 staging deploy | staging project/env/Redis/alert input | staging refs/URLs, Redis connected, api health, worker/cron heartbeat and alert routing status |
| M6B-06 real Telegram staging webhook | outbound test-account decision only if outbound is later included | M6B-09a records test bot webhook hygiene; outbound remains not approved/performed and must stay outside pass claims unless owner explicitly approves it. |
| M6B-07 rollback drill | deploy/rollback targets and owner-approved drill window | api/worker/cron/admin A-to-B-to-A version trace, health/heartbeat recovery and no job loss/duplication |
| M6B-08 backup/restore drill | safe restore target and backup snapshot ref | restore command class, post-restore RLS smoke, asset-ref safety and residue cleanup |
| Release/GA owner decision | explicit owner approval after checklist is green | recorded owner GA-0 decision and audit/write path evidence |

## AI / Owner Boundary

AI agents may prepare specs, execute owner-independent validation, aggregate evidence and expose risks. AI agents must not decide release scope, real customer/order data use, LLM keys, provider/cost/compliance risk, P1/P2 classification, staging/prod mutation, Telegram webhook registration, restore execution, GA-0 open or 1.0 approval.

## Historical M6B-09 PR Hygiene

The following table is the original M6B-09 PR record. Current M6B-09a diff and validation are recorded in `docs/evidence/M6B/M6B-09a-post-live-staging-evidence-sync.md`.

| Category | Current diff |
|---|---|
| Docs | `docs/specs/M6B-09-ga0-runtime-evidence-rollup.md`, `docs/evidence/M6B/M6B-09-ga0-runtime-evidence-rollup.md`, `docs/evidence/M6B/README.md`, `docs/release.md` |
| Source | none |
| Test support | none |
| Config/CI/package/lock/generated/migration/schema/runtime changes | none |
| Changed source files | 0 |
| New source files | 0 |
| Net source LOC | 0 |
| Test weakening | none; no test deletion, `.skip`, `.only`, `xit` or `xfail` |
| External dependency | none |
| Exceptions | none |

## Historical M6B-09 Validation

Recorded on 2026-06-26 from the assigned worktree.

| Command | Result | Notes |
|---|---|---|
| `git diff --check` | pass | No whitespace errors in tracked diff. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node /Users/atilla/Applications/UZMAX智能运营/node_modules/prettier/bin/prettier.cjs --check docs/specs/M6B-09-ga0-runtime-evidence-rollup.md docs/evidence/M6B/M6B-09-ga0-runtime-evidence-rollup.md docs/evidence/M6B/README.md docs/release.md` | pass | This isolated worktree has no local `node_modules`; used bundled Node plus the existing root Prettier path without modifying root/main. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/workspace-isolation.mjs` | pass | Linked worker worktree on `codex/m6b-09-runtime-rollup`; dirty allowed. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/worker-write-boundary.mjs --assigned /Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m6b-09-runtime-rollup --root /Users/atilla/Applications/UZMAX智能运营` | pass | Assigned worktree boundary check passed. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/doc-trigger-paths.mjs` | pass | `doc-trigger-paths: ok`. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/eval-trigger-paths.mjs --base origin/main` | pass | `no eval-triggering paths changed`. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M6B-09-ga0-runtime-evidence-rollup.md --include-worktree` | pass | Reports 4 changed docs files, 0 source files, 0 net source LOC and 0 new source files. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/forbidden-terms.mjs` | pass | `forbidden-terms: ok`. |

## Boundaries

M6B-09 does not approve:

- M6B-04, M6B-06, M6B-07 or M6B-08 pass;
- `/readyz` pass;
- live worker/cron heartbeat or alert fire proof;
- full staging closure or production deployment;
- Bot token or webhook secret exposure;
- outbound Bot send;
- backup/restore execution;
- real customer/order data;
- customer LLM/provider calls;
- P1/P2 downgrade or risk acceptance;
- GA-0 opening or 1.0 release.
