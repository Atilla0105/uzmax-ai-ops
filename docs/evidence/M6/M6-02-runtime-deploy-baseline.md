# M6-02 Runtime Deploy And Rollback Baseline Evidence

> evidence_id: M6-02-runtime-deploy-baseline
> milestone: M6
> acceptance_items: J-01, J-04, K-03, K-04, L-01
> owner: project owner accepted M5 milestone/runtime evidence for starting M6; owner still owns real platform mutation, secrets/env values, costs, GA-0, production, real data, customer LLM and 1.0 release decisions
> status: ready_for_review
> created_at: 2026-06-26
> updated_at: 2026-06-26
> source_files: `AGENTS.md`, four v1.1 source-of-truth docs, `docs/specs/M6-02-runtime-deploy-baseline.md`, `render.yaml`, M0 infra manifests, app package files, `docs/runbooks/deploy-rollback.md`, `scripts/guards/m6-runtime-baseline-check.mjs`
> sensitive_data_location: none; this file contains no customer/order/message/provider secret material
> redaction_status: no raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets
> review_notes: M6-02 records runtime deploy/rollback baseline and blockers; it does not execute real Render/Vercel deploys, close rollback drills, open GA-0, approve production or approve 1.0 release
> signoff: pending owner review of this M6-02 PR

## Summary

M6-02 establishes a repeatable runtime deploy/rollback baseline check for api, worker, cron and admin.

Current checker status:

`baseline_recorded_j01_j04_partial_blockers_open`

J-01 is not closed because real deploy/rollback drills have not been executed, Render service creation remains owner-pending, and worker/cron package start commands are still M0 deployment placeholders.

J-04 is improved for deploy/rollback coverage because `docs/runbooks/deploy-rollback.md` now has per-surface rollback, health, dry-run evidence and failure-branch steps. Later M6 slices still need model-all-down, redline bad send, order/import abnormal and RLS misconfig drills.

Linear `LAY-7` is tracking only and is not a source of truth.

## Start Audit

Recorded at M6-02 entry on 2026-06-26.

| Fact | Evidence |
|---|---|
| assigned worktree `pwd` | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m6-02-runtime-deploy-baseline` |
| assigned `git status --short --branch` before edits | `## codex/m6-02-runtime-deploy-baseline` |
| assigned branch | `codex/m6-02-runtime-deploy-baseline` |
| assigned `HEAD` | `39b8b8cc40de3ccb38338f4926ad7e46d9887b75` |
| assigned `origin/main` | `39b8b8cc40de3ccb38338f4926ad7e46d9887b75` |
| root/main checkout | `/Users/atilla/Applications/UZMAX智能运营` |
| root/main status | `## main...origin/main` |
| root/main `HEAD` | `39b8b8cc40de3ccb38338f4926ad7e46d9887b75` |
| root/main `origin/main` | `39b8b8cc40de3ccb38338f4926ad7e46d9887b75` |
| open PR audit | GitHub connector returned no open PRs before this PR |
| previous slice closeout | GitHub PR #130 `M6-01 Release Gate Console` merged at `39b8b8cc40de3ccb38338f4926ad7e46d9887b75` |
| commit workflow/status audit | GitHub connector returned no PR-triggered workflow runs and no legacy commit statuses for `39b8b8c`; M6-02 merge readiness will rely on this PR's CI before merge |
| local no-merged branch audit | root `git branch --no-merged main` returned no output before M6-02 work |

## Baseline Checker

| Field | Result |
|---|---|
| checker | `scripts/guards/m6-runtime-baseline-check.mjs` |
| command | `node scripts/guards/m6-runtime-baseline-check.mjs` |
| status | `baseline_recorded_j01_j04_partial_blockers_open` |
| J-01 | `baseline_recorded_not_closed_real_rollback_drills_pending` |
| J-04 | `deploy_rollback_runbook_updated_partial_drills_pending` |

## Runtime Surface Baseline

| Surface | Platform | Repo evidence | Current status |
|---|---|---|---|
| api | Render `uzmax-api` | `render.yaml` service exists; `apps/api/package.json` has build/start; API exposes `/healthz` and `/readyz` | `api_baseline_supported_real_rollback_drill_pending` |
| worker | Render `uzmax-worker` | `render.yaml` service exists; `apps/worker/src/main.ts` exports `processName = "worker"` | `blocked_worker_runtime_baseline_incomplete`: package `start` is M0 deployment placeholder |
| cron | Render `uzmax-cron` | `render.yaml` service exists; `apps/cron/src/main.ts` exports `processName = "cron"` | `blocked_cron_runtime_baseline_incomplete`: package `start` is M0 deployment placeholder |
| admin | Vercel `uzmax-admin` | Vercel manifest project exists; `apps/admin/package.json` has build/start | `admin_baseline_supported_vercel_deployment_pending_owner` |

## Manifest Status

| Manifest | Current status | M6-02 interpretation |
|---|---|---|
| `docs/evidence/M0/infra/render-env-manifest.md` | `blueprint_placeholder_ready__service_creation_pending_owner` | Blueprint and names exist; real service creation and rollback drill remain owner/external blockers. |
| `docs/evidence/M0/infra/vercel-env-manifest.md` | `project_created__admin_build_ready_deployment_pending` | Admin project exists; preview/prod deployment and strategy remain owner/external blockers. |
| `docs/evidence/M0/infra/observability-manifest.md` | `sentry_project_ready` | Sentry project exists; alert channel remains owner-pending before GA-0. |

## Open Blockers

| Blocker | Release impact |
|---|---|
| `render_real_service_creation_pending_owner` | J-01 cannot close until real or owner-approved staging/equivalent Render services exist. |
| `worker_start_command_m0_placeholder` | Worker rollback cannot be drilled until worker `start` runs real runtime behavior. |
| `cron_start_command_m0_placeholder` | Cron rollback cannot be drilled until cron `start` runs real scheduler behavior. |
| `admin_vercel_deployment_pending_owner` | Admin deploy/rollback cannot close until Vercel deployment strategy is owner-approved and exercised. |
| `observability_alert_channel_pending_owner` | GA-0 operations readiness remains blocked until alert channel is decided and verified. |
| `real_deploy_and_rollback_drills_not_executed_in_this_pr` | This PR is baseline evidence only; it does not close J-01 real rollback drills. |

## Runbook Update

`docs/runbooks/deploy-rollback.md` now includes:

- api, worker, cron and admin surface matrix;
- platform rollback/redeploy steps for Render and Vercel;
- health/recovery checks for `/healthz`, `/readyz`, queue backlog, cron heartbeat/job plans and admin release gate;
- dry-run evidence requirements;
- failure branches that keep J-01, GA-0 and 1.0 locked when rollback cannot be proven.

This only improves J-04 deploy/rollback coverage. It does not complete the remaining J-04 runbooks or drills for bot no response, model all down, redline bad send, order API/import abnormal path or RLS misconfig.

## Acceptance Mapping

| Item | M6-02 status | Evidence target |
|---|---|---|
| J-01 | `baseline_recorded_not_closed_real_rollback_drills_pending` | Checker records api/worker/cron/admin deploy/rollback baseline and blockers. |
| J-04 | `deploy_rollback_runbook_updated_partial_drills_pending` | Deploy/rollback runbook is updated; later fault runbooks/drills remain open. |
| K-03/K-04 | `active` | One spec / one PR; deployment/runbook work is serial and scoped. |
| L-01 | `ga0_locked_until_checklist_green_and_owner_decision` | Rollback blockers keep GA-0 closed. |

## Validation

Recorded on 2026-06-26 from the assigned worktree.

| Command | Result | Notes |
|---|---|---|
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/m6-runtime-baseline-check.mjs` | pass | Output status `baseline_recorded_j01_j04_partial_blockers_open`; blockers listed above. |
| `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH /Users/atilla/Applications/UZMAX智能运营/node_modules/.bin/prettier --check docs/specs/M6-02-runtime-deploy-baseline.md docs/evidence/M6/README.md docs/evidence/M6/M6-02-runtime-deploy-baseline.md docs/runbooks/deploy-rollback.md docs/release.md scripts/guards/m6-runtime-baseline-check.mjs scripts/tests/m6-runtime-deploy-baseline.test.mjs` | pass | Touched files use Prettier style. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test scripts/tests/m6-runtime-deploy-baseline.test.mjs` | pass | 2/2 focused M6-02 tests passed. |
| `eslint` on repo config plus `scripts/guards/m6-runtime-baseline-check.mjs` and `scripts/tests/m6-runtime-deploy-baseline.test.mjs` | pass | Ran with temporary local `node_modules` symlink to root checkout dependencies; symlink removed after validation. |
| `dependency-cruise apps packages --config dependency-cruiser.config.cjs` | pass | `no dependency violations found`. |
| `jscpd apps packages scripts --config jscpd.config.json --workers 1 --no-tips` | pass | `No duplicates found`. |
| `knip -c package.json#knip --no-progress --duration --no-config-hints --no-tag-hints` | pass | The new checker lives under existing `scripts/guards/*.mjs` entry pattern. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/forbidden-terms.mjs` | pass | `forbidden-terms: ok`. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/eval-trigger-paths.mjs` | pass | `no eval-triggering paths changed`. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/doc-trigger-paths.mjs` | pass | `doc-trigger-paths: ok`. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/workspace-isolation.mjs` | pass | `workspace-isolation: ok (codex/m6-02-runtime-deploy-baseline, linked worktree, dirty allowed)`. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/worker-write-boundary.mjs --assigned /Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m6-02-runtime-deploy-baseline --root /Users/atilla/Applications/UZMAX智能运营` | pass | Assigned worktree boundary check passed. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M6-02-runtime-deploy-baseline.md` | pass | Commit diff: changed files 7; categories docs 5/source 1/test 1; source net LOC +336; new source files 1. |
| `git diff --check origin/main...HEAD` | pass | No whitespace errors. |
| `node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json` | blocked_local_dependency | Local root checkout dependencies do not include `bullmq`, so existing `apps/worker/src/order-import-bullmq-runtime.ts` cannot resolve that package in this machine state. |
| `node --test scripts/tests/*.test.mjs` | blocked_local_dependency | 394/395 tests passed; only `scripts/tests/m4-order-import-bullmq-redis-runtime.test.mjs` failed because local `node_modules/bullmq/dist/cjs/index.js` is missing. |

## Boundary

M6-02 does not approve:

- M6-03 implementation;
- GA-0 opening;
- production readiness;
- real Render/Vercel deploy or rollback;
- secret/env creation or mutation;
- real customer traffic/data;
- real order data;
- customer LLM or real LLM/provider calls;
- production Redis/worker/cron deployment;
- external SaaS onboarding;
- Telegram Business automatic reply;
- broad admin redesign;
- 1.0 release.
