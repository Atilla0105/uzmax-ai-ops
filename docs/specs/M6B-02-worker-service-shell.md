# M6B-02 Worker Service Shell

Spec ID: M6B-02
Tracking issue: Linear LAY-17
Status: `m6b_02_worker_service_shell_in_progress_not_ga0`
Owner confirmation point: project owner review of this worker service shell PR and later owner decisions for staging Redis, production worker deployment, real customer/order data, real Bot traffic, customer LLM/provider calls, GA-0 and 1.0.
Timebox: 0.5 work day.

## Spec 类型

infra

## 目标

Replace the worker M0 deployment placeholder with a runnable emitted-artifact worker service shell for the existing order-import BullMQ runtime.

M6B-02 must prove:

- `npm run build:worker` emits a runnable worker artifact.
- `npm --workspace @uzmax/worker run start` boots the emitted artifact, not a `node -e` placeholder and not runtime TypeScript compilation.
- The worker starts against Redis with a real BullMQ queue and consumes one order-import CSV job.
- Queue depth changes are observed before and after consume.
- Enqueuing the same BullMQ `jobId` twice does not double-process.
- Graceful shutdown is observed.
- DB/RLS smoke status is recorded truthfully; if `UZMAX_RLS_DATABASE_URL` is missing locally, record fail-closed/no-claim and rely on existing CI true DB gates where applicable.
- BullMQ `jobId` dedupe is explicitly not Telegram `update_id` dedupe.

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner: decide later staging Redis source, production/staging worker env, real customer/order data, real Bot/customer traffic, customer LLM/provider use, GA-0 and 1.0 release. M6B-02 does not require owner infrastructure input for local/CI Redis proof.

AI agent: create the spec and evidence, implement the narrow worker artifact build/start shell, reuse the existing order-import BullMQ runtime and M6B-01 artifact strategy, run focused Redis-backed artifact smoke and guards, and record evidence without secrets or raw customer/order data.

M6B-02 boundary: no DB schema, migrations, generated Prisma client, API/admin/cron/runtime release gates, engine/channels/capabilities changes beyond existing worker imports, production deploy, real customer/order data, Telegram runtime, customer LLM, GA-0 opening, P1/P2 decision or 1.0 release.

## 时间盒

0.5 work day. If worker artifact emission requires lockfile dependencies, shared CI/guard changes, DB schema/migration/generated changes, API/cron/admin edits, release-gate changes, production/staging secrets, real customer/order data, or a new queue contract, stop and report instead of widening silently.

## Source Links

- `AGENTS.md`
- `docs/specs/README.md`
- `docs/specs/M6B-00-ga0-runtime-bring-up-contract.md`
- `docs/specs/M6B-01-api-production-artifact.md`
- `docs/evidence/M6B/README.md`
- `docs/evidence/M6B/M6B-01-api-production-artifact.md`
- `apps/worker/package.json`
- `apps/worker/src/main.ts`
- `apps/worker/src/order-import-bullmq-runtime.ts`
- `apps/worker/scripts/run-m4-order-import-bullmq-redis-smoke.mjs`
- `package.json`
- `render.yaml`
- `.github/workflows/ci.yml`

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M6B-02-worker-service-shell.md`
  - `docs/evidence/M6/README.md`
  - `docs/evidence/M6/M6-02-runtime-deploy-baseline.md`
  - `docs/evidence/M6B/README.md`
  - `docs/evidence/M6B/M6B-02-worker-service-shell.md`
  - `package.json`
  - `apps/worker/package.json`
  - `apps/worker/tsconfig.build.json`
  - `apps/worker/src/main.ts`
  - `apps/worker/src/worker-service-shell.ts`
  - `apps/worker/scripts/run-m6b-worker-artifact-smoke.mjs`
  - `scripts/tests/m4-worker-test-loader.mjs`
  - `scripts/tests/m6-runtime-deploy-baseline.test.mjs`
- 说明/备注：
  - `package.json` may change only `build:worker` and Knip worker entries for the new worker smoke if needed.
  - `apps/worker/package.json` may change only worker build/start/smoke scripts.
  - `apps/worker/tsconfig.build.json` may define worker-only artifact emit and TypeScript `.ts` import rewriting.
  - `apps/worker/src/main.ts` may export and invoke the worker service shell while keeping existing order-import parsing/draft exports available.
  - `apps/worker/src/worker-service-shell.ts` may own the runtime process shell so `main.ts` stays under source file length budgets.
  - `scripts/tests/m4-worker-test-loader.mjs` may update only focused worker contract test loading for the new service shell import/export shape; it must not weaken assertions.
  - `scripts/tests/m6-runtime-deploy-baseline.test.mjs` and the M6 baseline evidence/index may update only the worker placeholder drift guard after this slice replaces the worker start placeholder; cron and real deploy/rollback blockers must remain visible.
  - Do not modify `render.yaml` because it already calls `npm run build:worker` and `npm --workspace @uzmax/worker run start`.

## 变更预算与路径分类

- Source budget: changed source files <= 4, net source LOC <= 520, new source files <= 3.
- Source: `apps/worker/src/main.ts`, `apps/worker/src/worker-service-shell.ts`, `apps/worker/scripts/run-m6b-worker-artifact-smoke.mjs`.
- Test: `scripts/tests/m4-worker-test-loader.mjs`, `scripts/tests/m6-runtime-deploy-baseline.test.mjs`.
- Config: `package.json`, `apps/worker/package.json`, `apps/worker/tsconfig.build.json`.
- Docs: this spec, M6B README update, M6B-02 evidence, and M6 runtime baseline/index drift sync for the worker placeholder status only.
- Test/generated/lock/migration/CI/API/admin/cron/db/schema changes: none.
- New source `rg` conclusion: searched worker, order-import, BullMQ, Redis, artifact, build/start and smoke paths across `apps/worker`, `scripts`, `packages/db/scripts`, `docs/specs`, `docs/evidence` and root `package.json`. Existing M4 smoke proves opt-in BullMQ runtime through runtime TypeScript compilation and does not boot `npm --workspace @uzmax/worker run start`; no worker emitted-artifact service shell or artifact smoke exists. The service shell belongs under `apps/worker/src` because it is the worker entrypoint process owner, and the smoke belongs under `apps/worker/scripts` because it is worker-owned runtime evidence and must start the same workspace command Render uses for the worker service.
- External API/SDK/provider/connector/adapter basis: none added. This uses existing TypeScript, BullMQ and ioredis dependencies already declared in the repo.
- Exceptions: none.

## 文档触发检查

updated

M6B-02 adds worker runtime/artifact evidence under the existing M6B evidence path and does not introduce a new global doc index, release gate, runbook or external integration document. If `docs/doc-gates.md` requires more, stop and update this spec before widening.

## 前置条件

- Read `AGENTS.md`, `docs/specs/README.md`, `docs/specs/M6B-00-ga0-runtime-bring-up-contract.md`, `docs/specs/M6B-01-api-production-artifact.md`, `docs/evidence/M6B/README.md`, `docs/evidence/M6B/M6B-01-api-production-artifact.md`, `apps/worker/package.json`, `apps/worker/src/main.ts`, `apps/worker/src/order-import-bullmq-runtime.ts`, `apps/worker/scripts/run-m4-order-import-bullmq-redis-smoke.mjs`, `package.json`, `render.yaml` and `.github/workflows/ci.yml`.
- Confirm current worker build is typecheck-only and current worker start prints the M0 deployment placeholder.
- Confirm `render.yaml` already uses `npm run build:worker` and `npm --workspace @uzmax/worker run start`.
- Confirm M6B-01 changed only the API artifact path and did not replace worker/cron placeholders.
- Confirm M6B-02 does not touch API, cron, admin, DB schema/migration/generated, package lockfile, CI/guard scripts or release gates.

## Worktree / branch 前置条件

| Fact | Expected |
|---|---|
| worktree | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m6b-02-worker-service-shell` |
| branch | `codex/m6b-02-worker-service-shell` |
| base | current `origin/main` containing M6B-01 at `4234890d582c6bbb59e88eb35ece9d623e622d78` |
| forbidden checkout | root/main `/Users/atilla/Applications/UZMAX智能运营` for writing |
| required pre-edit evidence | `pwd`, `git status --short --branch`, `git branch --show-current`, worker HEAD, worker origin/main, root/main status, root no-merged branch audit, open PR audit |

Pre-edit evidence recorded before this spec was created:

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

## 并发派发证据

Single M6B-02 worker in a dedicated physical worktree and branch. Touch list is limited to worker build/start artifact support, one worker service shell, focused worker artifact Redis smoke, M6B docs/evidence and root script/Knip metadata. This slice does not touch global serial DB schema/migration/RLS/generated/lockfile/CI/guard/release gates, API/cron/admin, engine, channels, capabilities source, LLM or eval paths.

## 实施步骤

1. Create this M6B-02 spec before source implementation.
2. Add worker artifact emit config so root `npm run build:worker` emits runnable JavaScript.
3. Change `@uzmax/worker` start to boot the emitted artifact.
4. Add the worker service shell: read `UZMAX_REDIS_URL`, create the existing order-import BullMQ worker, log startup/ready/shutdown events, and close gracefully on `SIGTERM`/`SIGINT`.
5. Add a focused smoke that builds, starts the artifact command in a real process, uses Redis to enqueue duplicate same-`jobId` order-import jobs, observes queue depth changes, verifies one process result, and sends shutdown.
6. Create M6B-02 evidence with command output summaries, artifact paths, Redis queue observations, DB/RLS status, PR budget and validation.
7. Run focused validation and guards.

## 通过条件

- `npm run build:worker` exits 0 and emits runnable worker artifact path(s).
- `npm --workspace @uzmax/worker run start` starts the emitted artifact and does not use `node -e`, `runtime-compiler.mjs` or runtime TypeScript compilation.
- A real Redis-backed BullMQ queue is used by the worker artifact smoke.
- Queue depth is observed as 1 after duplicate same-`jobId` enqueue and 0 after worker consume.
- Duplicate same BullMQ `jobId` is processed once, not twice.
- Graceful shutdown is observed after the smoke sends a termination signal.
- DB/RLS smoke status is honest: true DB pass only if `UZMAX_RLS_DATABASE_URL` is available and actually run; missing env is recorded as fail-closed/no-claim.
- Evidence states BullMQ `jobId` dedupe is not Telegram `update_id` dedupe.
- PR diff stays inside this spec touch list and source budget.

## 失败分支

- If TypeScript emit leaves non-runnable `.ts` imports, fix within worker build config or stop and propose a build-tool split.
- If `UZMAX_REDIS_URL` is missing, worker start must fail closed and the Redis smoke must not be marked passed.
- If local Redis/Docker is unavailable, record local blocker and rely only on CI Redis evidence once available; do not replace it with an in-memory fake.
- If duplicate same-`jobId` enqueue processes twice, do not mark M6B-02 passed.
- If graceful shutdown cannot be observed from the emitted artifact process, do not mark M6B-02 passed.
- If `UZMAX_RLS_DATABASE_URL` is missing locally, record fail-closed/no-claim; do not fabricate DB/RLS evidence.
- If implementation requires API/cron/admin changes, DB schema/migrations/generated changes, lockfile/shared dependency changes, CI/guard changes, production secrets or real customer/order data, stop and report.
- If any write occurs outside assigned worktree or on root/main, stop and record an incident before continuing.

## 不做什么

- No API, cron or admin changes.
- No DB schema, migrations, RLS policy, generated client, package lockfile, shared CI/guard/release gate, engine, channels, capabilities source, LLM gateway or eval changes.
- No Telegram Bot conversation runtime, Telegram `update_id` DB dedupe, real Telegram webhook, outbound Bot send, production deploy, staging service mutation or Render env mutation.
- No real customer/order data, raw Telegram payloads, raw prompts/completions, LLM keys, Bot tokens, provider calls, GA-0 opening, P1/P2 owner decision or 1.0 release.

## 验收映射

- J-01: worker artifact build/start evidence improves deploy baseline but does not close real deploy/rollback drills.
- J-02: Redis-backed worker queue consume and BullMQ `jobId` dedupe evidence improves worker readiness but does not prove Telegram `update_id` dedupe.
- J-04: worker startup/shutdown logs and queue depth evidence improve operational evidence but do not complete all drills/runbooks.
- K-03/K-04: one spec / one branch / one worktree / one PR with scoped validation.
- L-01/L-02: GA-0 and 1.0 remain locked pending later M6B runtime evidence and owner decisions.
