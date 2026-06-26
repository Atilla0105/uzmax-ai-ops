# M6B-02 Worker Service Shell Evidence

> evidence_id: M6B-02-worker-service-shell
> milestone: M6B
> acceptance_items: J-01, J-02, J-04, K-03, K-04, L-01, L-02
> owner: project owner owns staging/production Redis, worker env, real customer/order data, Telegram runtime, customer LLM/provider calls, GA-0, P1/P2 decisions and 1.0 release; AI agents own implementation, review and evidence honesty
> status: ready_for_review
> created_at: 2026-06-26
> updated_at: 2026-06-26
> source_files: `AGENTS.md`, `docs/specs/README.md`, `docs/specs/M6B-00-ga0-runtime-bring-up-contract.md`, `docs/specs/M6B-01-api-production-artifact.md`, `docs/specs/M6B-02-worker-service-shell.md`, `docs/evidence/M6/README.md`, `docs/evidence/M6/M6-02-runtime-deploy-baseline.md`, `docs/evidence/M6B/README.md`, `docs/evidence/M6B/M6B-01-api-production-artifact.md`, `apps/worker/package.json`, `apps/worker/tsconfig.build.json`, `apps/worker/src/main.ts`, `apps/worker/src/worker-service-shell.ts`, `apps/worker/src/order-import-bullmq-runtime.ts`, `apps/worker/scripts/run-m4-order-import-bullmq-redis-smoke.mjs`, `apps/worker/scripts/run-m6b-worker-artifact-smoke.mjs`, `scripts/tests/m4-worker-test-loader.mjs`, `scripts/tests/m6-runtime-deploy-baseline.test.mjs`, `package.json`, `render.yaml`, `.github/workflows/ci.yml`
> sensitive_data_location: none; this file contains no customer/order/message/provider secret material
> redaction_status: no raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys, Bot tokens, webhook secrets or DB URLs
> review_notes: M6B-02 proves a local Redis-backed worker artifact shell for the existing order-import runtime; it does not approve staging, production, Telegram runtime, GA-0 or 1.0
> signoff: pending owner review of this M6B-02 PR

## Summary

M6B-02 replaces the worker M0 placeholder with an emitted-artifact worker service shell.

Current status:

`m6b_02_worker_service_shell_ready_for_review_redis_job_proof_not_ga0`

This is not GA-0, production, customer traffic, Telegram conversation runtime closure, real Telegram webhook proof, staging deploy or 1.0 release approval.

## Start Audit

Recorded at M6B-02 entry on 2026-06-26.

| Fact | Evidence |
|---|---|
| assigned worktree `pwd` | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m6b-02-worker-service-shell` |
| assigned `git status --short --branch` before edits | `## codex/m6b-02-worker-service-shell` |
| assigned branch | `codex/m6b-02-worker-service-shell` |
| assigned `HEAD` | `4234890d582c6bbb59e88eb35ece9d623e622d78` |
| assigned `origin/main` | `4234890d582c6bbb59e88eb35ece9d623e622d78` |
| root/main checkout | `/Users/atilla/Applications/UZMAX智能运营` |
| root/main status before edits | `## main...origin/main` |
| root/main `HEAD` | `4234890d582c6bbb59e88eb35ece9d623e622d78` |
| root/main `origin/main` | `4234890d582c6bbb59e88eb35ece9d623e622d78` |
| root no-merged branch audit before edits | no output |
| open PR audit before edits | GitHub connector returned `[]`; local `gh` unavailable in this shell |

## Implementation

| Area | Change | Evidence |
|---|---|---|
| root worker build | `package.json` `build:worker` now delegates to the worker workspace build. | `npm run build:worker` invokes `npm --workspace @uzmax/worker run build`. |
| worker build | `apps/worker/package.json` `build` cleans `apps/worker/dist` and runs `tsc -p tsconfig.build.json`. | Emits JavaScript artifact instead of `--noEmit`. |
| worker start | `apps/worker/package.json` `start` now runs `node dist/apps/worker/src/main.js`. | No `node -e` placeholder and no runtime TypeScript compiler. |
| TypeScript emit | `apps/worker/tsconfig.build.json` emits worker-owned source plus existing order-read/db contract imports with relative `.js` rewrites. | Emitted `main.js` dynamically imports `./worker-service-shell.js` only when executed as the CLI entrypoint. |
| service shell | `apps/worker/src/worker-service-shell.ts` reads `UZMAX_REDIS_URL`, creates the existing order-import BullMQ worker, logs JSON lifecycle/job events and closes on `SIGTERM`/`SIGINT`. | The shell uses the existing `createOrderImportCsvTextBullmqWorker` and `runOrderImportCsvTextPersistenceJob`. |
| runtime smoke | `apps/worker/scripts/run-m6b-worker-artifact-smoke.mjs` starts `npm --workspace @uzmax/worker run start`, enqueues duplicate same-`jobId` jobs, checks queue depth, verifies one completion and sends shutdown. | Smoke output below. |
| focused tests | `scripts/tests/m4-worker-test-loader.mjs` preserves legacy data-URL contract loading while excluding CLI-only service-shell startup code. | Existing worker contract tests still assert no runtime systems inside the pure contract source. |
| M6 drift guard | `scripts/tests/m6-runtime-deploy-baseline.test.mjs` and M6 baseline evidence now reflect that M6B-02 closes the worker placeholder while cron and real deploy/rollback blockers remain open. | Full CI exposed this after the worker artifact change; the fix strengthens the current-state assertion instead of weakening the test. |

## Artifact Evidence

| Item | Evidence |
|---|---|
| Build command | `pnpm dlx npm@11.9.0 run build:worker` in local shell; this executes repo script `npm --workspace @uzmax/worker run build`. |
| Result | exit 0 |
| Artifact root | `apps/worker/dist` |
| Artifact count | `find apps/worker/dist -maxdepth 6 -type f` returned `15` files. |
| Worker entrypoint | `apps/worker/dist/apps/worker/src/main.js` |
| Import rewrite check | emitted worker files contain `.js` relative imports and `rg` found no `runtime-compiler` or placeholder `node -e` reference in emitted worker entry/runtime files. |

Local tooling note: this shell exposes bundled Node and pnpm but not a direct `npm` binary. Local validation used `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH /Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/pnpm dlx npm@11.9.0 ...` to execute npm 11.9.0 scripts without changing `package-lock.json` or adding dependencies.

## Redis Runtime Smoke Evidence

Local Docker was unavailable:

```text
failed to connect to the docker API at unix:///Users/atilla/.docker/run/docker.sock
```

For local Redis proof, a transient `pnpm dlx redis-memory-server` process downloaded and ran a Redis `stable` `redis-server` binary outside the repo. It exposed `redis://127.0.0.1:58405` for this validation run and was stopped after the smoke. No dependency, lockfile or repo config was changed.

Command:

```bash
PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH UZMAX_REDIS_URL=redis://127.0.0.1:58405 /Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/pnpm dlx npm@11.9.0 --workspace @uzmax/worker run smoke:m6b-artifact
```

Result: exit 0.

Observed sanitized output:

```json
{"event":"m6b_02_worker_queue_depth_after_enqueue","jobId":"44444444-4444-4444-8444-444444446202","queueName":"order-import-m6b-02-1782462437611-bf3d2b8a","waiting":1}
{"completed":1,"duplicateSameJobIdProcessedCount":1,"event":"m6b_02_worker_artifact_smoke","jobId":"44444444-4444-4444-8444-444444446202","queueDepthAfterConsume":0,"queueDepthAfterDuplicateEnqueue":1,"queueName":"order-import-m6b-02-1782462437611-bf3d2b8a","shutdown":"graceful","startCommand":"npm --workspace @uzmax/worker run start","status":"pass"}
```

Interpretation:

- Worker artifact process booted through `npm --workspace @uzmax/worker run start`.
- The smoke used a real Redis-backed BullMQ queue.
- Duplicate enqueue with the same BullMQ `jobId` left queue waiting depth at `1`.
- After consume, queue waiting depth was `0` and completed count was `1`.
- The worker observed one completion for the deterministic `jobId`; duplicate same-`jobId` enqueue did not double-process.
- The smoke sent `SIGTERM` and observed graceful shutdown.
- The smoke cleaned the run-scoped queue keys and the transient Redis process was stopped after validation.

## Dedupe Boundary

M6B-02 proves BullMQ `jobId` dedupe only: re-enqueuing the same BullMQ job ID does not create two processed jobs in this worker queue.

This is not Telegram `update_id` / `providerUpdateId` dedupe. Telegram ingress dedupe must be DB-persisted and restart/multi-instance safe; that remains owned by M6B-05a, M6B-05b and M6B-06.

## True DB/RLS Smoke Status

`UZMAX_RLS_DATABASE_URL` is absent in this worker environment. The existing true DB smoke therefore failed before opening a DB connection:

```text
Error: UZMAX_RLS_DATABASE_URL is required
```

Command:

```bash
env -u UZMAX_RLS_DATABASE_URL node packages/db/scripts/run-m4-order-import-true-db-smoke.mjs
```

Result: expected fail-closed missing-env path. M6B-02 does not claim a local true DB/RLS pass. Existing CI path scope still runs order-import true DB smokes when worker/package paths change and masked `UZMAX_RLS_DATABASE_URL` is available.

## PR Hygiene

| Category | Current diff |
|---|---|
| Docs | `docs/specs/M6B-02-worker-service-shell.md`, `docs/evidence/M6/README.md`, `docs/evidence/M6/M6-02-runtime-deploy-baseline.md`, `docs/evidence/M6B/README.md`, `docs/evidence/M6B/M6B-02-worker-service-shell.md` |
| Source | `apps/worker/src/main.ts`, `apps/worker/src/worker-service-shell.ts`, `apps/worker/scripts/run-m6b-worker-artifact-smoke.mjs` |
| Test support | `scripts/tests/m4-worker-test-loader.mjs`, `scripts/tests/m6-runtime-deploy-baseline.test.mjs` |
| Config | `package.json`, `apps/worker/package.json`, `apps/worker/tsconfig.build.json` |
| Changed source files | 3 of budget <= 4 |
| New source files | 2 of budget <= 3 |
| Net source LOC | +440 of budget <= 520 |
| Test weakening | none; no test deletion, `.skip`, `.only`, `xit` or `xfail` |
| Generated/lock/migration/CI/API/admin/cron/db/schema changes | none committed |
| External dependency | none added; no lockfile change |

## Validation

Recorded on 2026-06-26 from the assigned worktree unless noted.

| Command | Result | Notes |
|---|---|---|
| `pnpm dlx npm@11.9.0 ci` | pass | Installed isolated dependencies in the assigned worktree; no lockfile change. |
| `pnpm dlx npm@11.9.0 run build:worker` | pass | Emits worker artifact through npm scripts; local npm fallback noted above. |
| `pnpm dlx npm@11.9.0 --workspace @uzmax/worker run smoke:m6b-artifact` with `UZMAX_REDIS_URL=redis://127.0.0.1:58405` | pass | Real Redis-backed BullMQ queue; duplicate same `jobId` waiting depth 1; after consume waiting 0, completed 1; graceful shutdown. |
| `pnpm dlx npm@11.9.0 run build` | pass | API artifact, worker artifact, cron typecheck and admin Vite build all completed. |
| `node node_modules/prettier/bin/prettier.cjs --check ...` | pass | Touched config, source, test-support and docs files use Prettier style. |
| `node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json` | pass | Full repo typecheck. |
| `node node_modules/eslint/bin/eslint.js apps/worker/src/main.ts apps/worker/src/worker-service-shell.ts apps/worker/scripts/run-m6b-worker-artifact-smoke.mjs scripts/tests/m4-worker-test-loader.mjs` | pass | Focused lint for touched source/test support. |
| `node --test scripts/tests/m4-order-import-bullmq-redis-runtime.test.mjs scripts/tests/m4-order-import-worker-contract.test.mjs scripts/tests/m4-order-import-worker-queue-job-contract.test.mjs` | pass | 16/16 focused tests passed after preserving the legacy worker contract loader. |
| `node --test scripts/tests/m6-runtime-deploy-baseline.test.mjs` | pass | M6 drift guard now asserts worker placeholder is closed by M6B-02 while cron placeholder and real deploy/rollback blockers remain open. |
| `pnpm dlx npm@11.9.0 run test` | pass | 447/447 tests passed after the M6 runtime baseline drift sync; this addresses CI run #438 failing at full `npm run test` on the stale worker placeholder assertion. |
| legacy data-URL loader probe for `apps/worker/src/main.ts` | pass | Replayed the true DB smoke loader's data-URL import pattern after the dynamic CLI import fix; `processName` imported as `worker` without resolving the CLI service shell. |
| `node node_modules/dependency-cruiser/bin/dependency-cruise.mjs apps packages --config dependency-cruiser.config.cjs` | pass | `no dependency violations found`. |
| `node node_modules/knip/bin/knip.js -c package.json#knip --no-progress --duration --no-config-hints --no-tag-hints` | pass | New worker shell/smoke entries are reachable. |
| `node node_modules/jscpd/run-jscpd.js apps packages scripts --config jscpd.config.json --workers 1 --no-tips` | pass | Initial helper duplication with M4 smoke was refactored; rerun found 0 clones. |
| `node scripts/guards/doc-trigger-paths.mjs` | pass | `doc-trigger-paths: ok`. |
| `node scripts/guards/eval-trigger-paths.mjs --base origin/main` | pass | `no eval-triggering paths changed`. |
| `node scripts/guards/forbidden-terms.mjs` | pass | `forbidden-terms: ok`. |
| `node scripts/guards/workspace-isolation.mjs` | pass | Linked worktree on `codex/m6b-02-worker-service-shell`; dirty allowed before commit. |
| `node scripts/guards/worker-write-boundary.mjs --assigned /Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m6b-02-worker-service-shell --root /Users/atilla/Applications/UZMAX智能运营` | pass | Assigned worktree boundary check passed. |
| `node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M6B-02-worker-service-shell.md --include-worktree` | pass | Current diff after M6 drift sync: changed files 13; categories config 3, source 3, docs 5, test 2; source changed files 3, net LOC +440, new files 2. |
| `git diff --cached --check` and post-commit diff check | pass | No whitespace errors. |
| `env -u UZMAX_RLS_DATABASE_URL node packages/db/scripts/run-m4-order-import-true-db-smoke.mjs` | expected fail closed | Missing env before DB connection: `Error: UZMAX_RLS_DATABASE_URL is required`. Not counted as true DB/RLS pass. |

The local worktree has ignored `node_modules/` and `apps/worker/dist/` artifacts after validation. They are not staged or committed.

## Boundaries

M6B-02 does not approve:

- Telegram `update_id` / `providerUpdateId` DB dedupe;
- M6B-03 cron runtime;
- M6B-04 staging deploy;
- M6B-05a/M6B-05b conversation runtime;
- production/staging Redis or worker deployment;
- real Render service mutation;
- real customer/order data;
- customer LLM or real provider calls;
- real Telegram Bot token/webhook secret, Telegram Business auto-reply or outbound Bot send;
- DB schema, migrations, generated client or RLS policy changes;
- GA-0 opening, P1/P2 owner decision or 1.0 release.
