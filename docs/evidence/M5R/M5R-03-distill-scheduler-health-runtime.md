# M5R-03 Distill Scheduler + Health Runtime Evidence

## Start Audit

Recorded on 2026-06-25 before source/test implementation edits from the assigned M5R-03 worktree.

| Fact | Evidence |
|---|---|
| assigned worktree `pwd` | `/Users/atilla/Documents/uzmax-m5r-03-distill-scheduler-health-runtime` |
| assigned `git status --short --branch` | `## codex/m5r-03-distill-scheduler-health-runtime...origin/main` |
| assigned `git branch --show-current` | `codex/m5r-03-distill-scheduler-health-runtime` |
| worker `HEAD` | `6fd21f92eb233be1eadfedfad849ba83790d710b` |
| worker `origin/main` | `6fd21f92eb233be1eadfedfad849ba83790d710b` |
| root/main status | `/Users/atilla/Documents/UZMAX智能运营` -> `## main...origin/main` |
| root/main branch | `main` |
| root/main `HEAD` | `6fd21f92eb233be1eadfedfad849ba83790d710b` |
| root/main `origin/main` | `6fd21f92eb233be1eadfedfad849ba83790d710b` |
| open PR audit | `gh pr list --state open --json number,title,headRefName,baseRefName,url` returned `[]` |
| no-merged branch audit before edits | `codex/m4-48-owner-signoff-test-alignment`; `codex/m5-00-operations-loop-readiness-pack`; `codex/m5-01-db-contract-foundation`; `codex/m5-06-logs-analytics` |
| linked worktree list | root worktree `/Users/atilla/Documents/UZMAX智能运营` on `refs/heads/main`; worker worktree `/Users/atilla/Documents/uzmax-m5r-03-distill-scheduler-health-runtime` on `refs/heads/codex/m5r-03-distill-scheduler-health-runtime` |
| linked worktree git-dir/common-dir | worker git dir `/Users/atilla/Documents/UZMAX智能运营/.git/worktrees/uzmax-m5r-03-distill-scheduler-health-runtime`; common dir `/Users/atilla/Documents/UZMAX智能运营/.git`; superproject empty |
| node_modules | missing at start; `npm ci` was required before baseline validation |

The no-merged local branches above are pre-existing root/local branch residue. This worker records them and does not modify, delete, rebase or merge them.

## Baseline

| Command | Result | Notes |
|---|---|---|
| `npm ci` | pass | Installed 360 packages and found 0 vulnerabilities in the assigned worktree. |
| `node --test scripts/tests/m5-distill-guardrails.test.mjs` | pass | Baseline M5-02 focused distill guardrails passed: 4/4 tests. |
| `node --test scripts/tests/m5r-confirmation-queue-persistence.test.mjs` | pass | Baseline M5R-01 runtime contract passed: 4/4 tests. |
| `node --test scripts/tests/m5r-formal-write-pipeline.test.mjs` | pass | Baseline M5R-02 formal write contract passed: 6/6 tests. |

## Scope

M5R-03 adds a minimal runtime proof for distill scheduler health:

- `apps/cron` builds an injected distill job payload only;
- `apps/worker` executes the injected payload through M5-02 pure helpers;
- the runtime persists `distill_run`, capped pending `confirmation_item` rows, `distill_health_daily`, controlled owner alert/audit draft rows and manual recovery audit rows through existing DB/RLS contracts;
- the true DB smoke runner exercises the same runtime with synthetic tenants and controlled refs when `UZMAX_RLS_DATABASE_URL` is available.

Allowed files are exactly the allowlist in `docs/specs/M5R-03-distill-scheduler-health-runtime.md`. Root/main checkout is read-only for this worker.

## Current DB Contract Check

The existing DB contract already contains:

- `distill_run` Prisma model/table, candidate limit/count constraints, forced RLS select/insert/update policies and `uzmax_app_runtime` grants.
- `distill_health_daily` Prisma model/table, unique `(org_id, tenant_id, business_date)`, pass-rate/downshift/recovery fields, forced RLS select/insert/update policies and `uzmax_app_runtime` grants.
- `confirmation_item` Prisma model/table, `distill_run_id`, `candidate_payload`, target/audit metadata fields, forced RLS select/insert/update policies and `uzmax_app_runtime` grants.
- `audit_log` Prisma model/table with free text `event_type`, required before/after JSON content, forced RLS select/insert policies and `uzmax_app_runtime` grants.

M5R-03 therefore does not add Prisma schema, migration, RLS policy or generated-client changes.

## Boundaries

This slice does not implement admin UI wiring, API routes/controllers/services, formal write expansion, H-01 full knowledge/resource authoring, eval publishing, AI member runtime control, template copy runtime, analytics board runtime, schema/migration changes, production deploy, production Redis/worker/cron deployment, external SaaS onboarding, real customer/order data, customer LLM, real LLM calls, GA-0, M6, M5 owner acceptance or 1.0 release behavior.

## No Sensitive Data Statement

This evidence, spec, tests and implementation must not include raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets. M5R-03 uses synthetic UUIDs, controlled refs, synthetic org/tenant names and structured metadata only.

## Runtime/RLS Evidence

Implemented in five touched source files totaling 592 net added source lines before docs/test:

- `apps/cron/src/main.ts` exports the scheduler planner so static dependency checks see the runtime surface.
- `apps/cron/src/distill-scheduler.ts` builds a controlled `distill_daily_health_runtime` job payload. It does not create Redis schedules, call providers or mutate DB.
- `apps/worker/src/distill-runtime-contracts.ts` converts injected synthetic/control-ref candidates through M5-02 helpers, caps candidates at 10, derives 7-day pass rate/downshift state, creates pending confirmation-item drafts and owner-alert audit draft metadata.
- `apps/worker/src/distill-runtime.ts` persists through `createRlsTransactionContext` only when explicitly configured for `rls_prisma_gateway`; it rejects `prisma_gateway` and missing `UZMAX_RLS_DATABASE_URL`.
- `packages/db/scripts/run-m5r-distill-scheduler-health-true-db-smoke.mjs` is a thin CLI/export wrapper for the true DB smoke support runner.

The runtime writes, in one RLS transaction, `distill_run`, at most 10 pending `confirmation_item` rows with `distillRunId`, optional `audit_log` owner-alert draft, and `distill_health_daily`. Manual recovery first reads `distill_health_daily` under RLS, requires weekly/paused current state, then writes a controlled `audit_log` row and restores frequency to daily.

No formal write target table is touched. Candidate metadata records `formalWrite: false`.

## True DB/RLS Smoke Status

`blocked_by_missing_env`.

Command:

`env -u UZMAX_RLS_DATABASE_URL node packages/db/scripts/run-m5r-distill-scheduler-health-true-db-smoke.mjs`

Result: expected fail-closed before Prisma client construction or DB mutation.

Exact local error:

`Error: UZMAX_RLS_DATABASE_URL is required`

The support runner is ready to execute same-tenant positive and wrong-tenant/missing-context negative DB/RLS probes when `UZMAX_RLS_DATABASE_URL` is available.

## Validation

| Command | Result | Notes |
|---|---|---|
| `node --test scripts/tests/m5-distill-guardrails.test.mjs` | pass | M5-02 focused guardrails: 4/4. |
| `node --test scripts/tests/m5r-confirmation-queue-persistence.test.mjs` | pass | M5R-01 baseline: 4/4. |
| `node --test scripts/tests/m5r-formal-write-pipeline.test.mjs` | pass | M5R-02 baseline: 6/6. |
| `node --test scripts/tests/m5r-distill-scheduler-health-runtime.test.mjs` | pass | M5R-03 focused runtime contract: 4/4. |
| `env -u UZMAX_RLS_DATABASE_URL node packages/db/scripts/run-m5r-distill-scheduler-health-true-db-smoke.mjs` | expected fail | `blocked_by_missing_env`; error: `UZMAX_RLS_DATABASE_URL is required`. |
| `npm run typecheck -- --pretty false` | pass | TypeScript no-emit. |
| `npm run lint` | pass | ESLint passed. |
| `npm run knip` | pass | Dependency/unused export scan passed. |
| `npm run format:check` | pass | Prettier check passed. |
| `npm run depcruise` | pass | Dependency cruiser passed. |
| `npm run jscpd` | pass | No duplicates found. |
| `npm run guard:workspace` | pass | Linked worker worktree dirty allowed; root/main checked by guard. |
| `npm run guard:worker-boundary -- --assigned-worktree /Users/atilla/Documents/uzmax-m5r-03-distill-scheduler-health-runtime --primary-root /Users/atilla/Documents/UZMAX智能运营` | pass | Assigned/root write boundary passed. |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M5R-03-distill-scheduler-health-runtime.md --include-worktree` | pass | Final committed diff: 10 files; source 5; net source LOC 592; new source files 4. |
| `git diff --check origin/main...HEAD` | pass | No whitespace errors. |
| `npm run test` | pass | Full suite: 370 tests passed. |

The full suite initially exposed that exporting the new runtime from `apps/worker/src/main.ts` broke older data-URL worker test loaders. The fix removed broad worker/cron entrypoint exports and kept M5R-03 callable through the narrow runtime/scheduler modules. The final full-suite rerun passed.

## Spec Compliance Review

Pass.

- One spec only: `docs/specs/M5R-03-distill-scheduler-health-runtime.md`.
- Touch list is limited to M5R-03 docs/evidence, minimal worker/cron runtime files, focused test and true DB smoke support.
- Existing DB contract was sufficient; no Prisma schema, migration, RLS policy or generated-client changes were made.
- Candidate source is injected/synthetic/control-ref based only.
- No real LLM/provider/external API call, real customer/order data, production Redis/worker/cron deployment, admin UI, API route/controller/service expansion or formal write expansion.
- Owner acceptance, GA-0, M6, production readiness and 1.0 release remain not approved.

## Code Quality Review

Pass with one documented tradeoff.

The runtime stays split between pure planning/mapping and DB/RLS persistence. To stay under the hard `guard:pr-shape` source budget after adding the required runtime and smoke wrapper, the two new worker proof modules use a local `@typescript-eslint/no-explicit-any` disable for narrow test-runtime port shapes. This does not change global lint config, production settings or tests, and the runtime behavior is covered by focused contract tests plus the true DB smoke runner.

## Acceptance Mapping

| Item | M5R-03 status | Evidence target |
|---|---|---|
| H-02 | `distill_candidates_persisted_not_formal_write_closed` | Distill candidates persist as pending confirmation items with `formalWrite: false`; no formal target write occurs here. |
| H-07 | `distill_scheduler_health_runtime_supported_not_owner_accepted` | Candidate cap, 7-day pass rate, 3-day downshift, owner alert/audit draft and manual recovery are runtime-persisted. |
| I-02 | `runtime_alert_recovery_supported_not_admin_mobile_closed` | Runtime state can support later admin/mobile alert/recovery UI; admin runtime wiring remains M5R-07. |
| I-06 | `distill_health_metric_source_supported_not_analytics_closed` | `distill_health_daily` is a runtime metric source; analytics board wiring remains M5R-05. |
| J-05 | `m5r_03_runtime_evidence_added_not_owner_accepted` | This evidence records M5R-03 only; no M5 owner acceptance or release signoff. |
| K-03 | `active` | One spec / one PR; current branch implements only M5R-03. |
| K-04 | `active` | Worker worktree/branch/touch list are scoped; schema/migration/global gates remain untouched. |

M5R-03 performs no formal writes and does not update M5 owner acceptance status.
