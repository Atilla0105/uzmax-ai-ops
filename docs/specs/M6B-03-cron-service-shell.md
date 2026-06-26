# M6B-03 Cron Service Shell

Spec ID: M6B-03
Tracking issue: Linear LAY-18
Status: `m6b_03_cron_service_shell_in_progress_not_ga0`
Owner confirmation point: project owner review of this cron service shell PR and later owner decisions for staging deploy, production cron env, real customer/order data, customer LLM/provider calls, GA-0 and 1.0.
Timebox: 0.5 work day.

## Spec 类型

infra

## 目标

Replace the cron M0 deployment placeholder with a runnable emitted-artifact one-shot cron service shell for the existing distill daily health runtime path.

M6B-03 must prove:

- `npm run build:cron` emits a runnable cron artifact.
- `npm --workspace @uzmax/cron run start` boots the emitted artifact, not a `node -e` placeholder and not runtime TypeScript compilation.
- The cron process runs one distill daily health unit and exits with code `0` on success.
- A repeated same-day invocation is skipped by an idempotency guard and does not create a second daily unit.
- A failure branch exits non-zero and records structured evidence.
- DB/RLS status is recorded honestly; local file-backed artifact smoke is not claimed as true DB/RLS, staging, production or deployed evidence.

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner: decide later staging/production cron env, deploy targets, real customer/order data, customer LLM/provider use, GA-0 and 1.0 release. M6B-03 does not require owner infrastructure input for local artifact proof.

AI agent: create the spec and evidence, implement the narrow cron artifact build/start shell, reuse existing M5R-03 distill runtime contracts, prove one-shot process behavior and daily idempotency, run focused validation and guards, and record missing secret paths without fabricating DB or production evidence.

M6B-03 boundary: no DB schema, migrations, generated Prisma client, API/admin/worker service shell behavior, release gates, CI config, production deploy, real customer/order data, Telegram runtime, customer LLM, GA-0 opening, P1/P2 decision or 1.0 release.

## 时间盒

0.5 work day. If cron artifact emission or one-shot idempotency requires schema/migration/RLS policy changes, lockfile dependencies, shared CI/guard changes, broad worker runtime rewrites, API/admin changes, release-gate changes, production secrets, real customer/order data, or external provider calls, stop and report instead of widening silently.

## Source Links

- `AGENTS.md`
- `docs/specs/README.md`
- `docs/specs/M6B-00-ga0-runtime-bring-up-contract.md`
- `docs/specs/M6B-01-api-production-artifact.md`
- `docs/specs/M6B-02-worker-service-shell.md`
- `docs/evidence/M6B/README.md`
- `docs/evidence/M6B/M6B-01-api-production-artifact.md`
- `docs/evidence/M6B/M6B-02-worker-service-shell.md`
- `docs/specs/M5R-03-distill-scheduler-health-runtime.md`
- `apps/cron/package.json`
- `apps/cron/src/main.ts`
- `apps/cron/src/distill-scheduler.ts`
- `apps/worker/src/distill-runtime.ts`
- `apps/worker/src/distill-runtime-contracts.ts`
- `package.json`
- `render.yaml`
- `scripts/guards/m6-runtime-baseline-check.mjs`

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M6B-03-cron-service-shell.md`
  - `docs/incidents/INC-2026-06-26-m6b-03-root-worktree-write.md`
  - `docs/evidence/M6/README.md`
  - `docs/evidence/M6/M6-02-runtime-deploy-baseline.md`
  - `docs/evidence/M6B/README.md`
  - `docs/evidence/M6B/M6B-03-cron-service-shell.md`
  - `package.json`
  - `apps/cron/package.json`
  - `apps/cron/tsconfig.build.json`
  - `apps/cron/src/main.ts`
  - `apps/cron/src/cron-service-shell.ts`
  - `apps/cron/scripts/run-m6b-cron-artifact-smoke.mjs`
  - `scripts/tests/m6-runtime-deploy-baseline.test.mjs`
- 说明/备注：
  - `package.json` may change only `build:cron` and Knip cron entries for the new cron smoke if needed.
  - `apps/cron/package.json` may change only cron build/start/smoke scripts.
  - `apps/cron/tsconfig.build.json` may define cron-only artifact emit and TypeScript `.ts` import rewriting.
  - `apps/cron/src/main.ts` may export the existing scheduler surface and invoke the cron service shell only when executed as the CLI entrypoint.
  - `apps/cron/src/cron-service-shell.ts` may own the one-shot runtime process shell, idempotency guard and structured logs.
  - `scripts/tests/m6-runtime-deploy-baseline.test.mjs` and the M6 baseline evidence/index may update only the cron placeholder drift guard after this slice replaces the cron start placeholder; real deploy/rollback blockers must remain visible.
  - Do not modify `render.yaml` because it already calls `npm run build:cron` and `npm --workspace @uzmax/cron run start`.

## 变更预算与路径分类

- Source budget: changed source files <= 3, net source LOC <= 520, new source files <= 2.
- Source: `apps/cron/src/main.ts`, `apps/cron/src/cron-service-shell.ts`, `apps/cron/scripts/run-m6b-cron-artifact-smoke.mjs`.
- Test: `scripts/tests/m6-runtime-deploy-baseline.test.mjs`.
- Config: `package.json`, `apps/cron/package.json`, `apps/cron/tsconfig.build.json`.
- Docs: this spec, the required root-worktree incident record, M6B README update, M6B-03 evidence, and M6 runtime baseline/index drift sync for the cron placeholder status only.
- Generated/lock/migration/CI/API/admin/db/schema/release-gate changes: none.
- New source `rg` conclusion: searched cron, one-shot, distill daily health, idempotency, `distill_run`, `distill_health_daily`, artifact, build/start and smoke paths across `apps/cron`, `apps/worker`, `packages/db/scripts`, `scripts/tests`, `docs/specs`, `docs/evidence`, `render.yaml` and root `package.json`. Existing M5R-03 code proves the distill runtime contract and DB/RLS path, but no emitted-artifact cron service shell or one-shot artifact smoke exists. The shell belongs under `apps/cron/src` because it owns the cron process entrypoint, and the smoke belongs under `apps/cron/scripts` because it must start the same workspace command Render uses for cron.
- External API/SDK/provider/connector/adapter basis: none added. This uses existing TypeScript, Prisma runtime helpers and distill contract code already declared in the repo.
- Exceptions: none.

## 文档触发检查

updated

M6B-03 adds cron runtime/artifact evidence under the existing M6B evidence path and does not introduce a new global doc index, release gate, runbook or external integration document. If `docs/doc-gates.md` requires more, stop and update this spec before widening.

## 前置条件

- Read `AGENTS.md`, `docs/specs/README.md`, `docs/specs/M6B-00-ga0-runtime-bring-up-contract.md`, `docs/specs/M6B-01-api-production-artifact.md`, `docs/specs/M6B-02-worker-service-shell.md`, `docs/evidence/M6B/README.md`, `docs/evidence/M6B/M6B-01-api-production-artifact.md`, `docs/evidence/M6B/M6B-02-worker-service-shell.md`, `apps/cron/package.json`, `apps/cron/src/main.ts`, `apps/cron/src/distill-scheduler.ts`, `apps/worker/src/distill-runtime.ts`, `apps/worker/src/distill-runtime-contracts.ts`, `package.json`, `render.yaml`, `scripts/guards/m6-runtime-baseline-check.mjs` and M5R-03 distill runtime docs/tests.
- Confirm current cron build is typecheck-only and current cron start prints the M0 deployment placeholder.
- Confirm `render.yaml` already uses `npm run build:cron` and `npm --workspace @uzmax/cron run start`.
- Confirm M6B-01/M6B-02 changed API/worker artifact paths and did not replace cron placeholder.
- Confirm M6B-03 does not touch API, admin, DB schema/migration/generated, package lockfile, CI/guard scripts or release gates.

## Worktree / branch 前置条件

| Fact | Expected |
|---|---|
| worktree | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m6b-03-cron-service-shell` |
| branch | `codex/m6b-03-cron-service-shell` |
| base | current `origin/main` containing M6B-02 at `222a0902cc154e310b7729dd7fa4e0d737d4ef49` |
| forbidden checkout | root/main `/Users/atilla/Applications/UZMAX智能运营` for writing |
| required pre-edit evidence | `pwd`, `git status --short --branch`, `git branch --show-current`, worker HEAD, worker origin/main, root/main status, root no-merged branch audit, open PR audit |

Pre-edit evidence recorded before this spec was created:

| Fact | Evidence |
|---|---|
| assigned worktree `pwd` | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m6b-03-cron-service-shell` |
| assigned `git status --short --branch` before edits | `## codex/m6b-03-cron-service-shell...origin/main` |
| assigned branch | `codex/m6b-03-cron-service-shell` |
| assigned `HEAD` | `222a0902cc154e310b7729dd7fa4e0d737d4ef49` |
| assigned `origin/main` | `222a0902cc154e310b7729dd7fa4e0d737d4ef49` |
| root/main checkout | `/Users/atilla/Applications/UZMAX智能运营` |
| root/main status before edits | `## main...origin/main` |
| root no-merged branch audit before edits | no output |
| open PR audit before edits | GitHub connector returned `[]`; local `gh` unavailable in this shell |

## 并发派发证据

Single M6B-03 worker in a dedicated physical worktree and branch. Touch list is limited to cron build/start artifact support, one cron service shell, focused cron artifact smoke, M6B docs/evidence and M6 drift guard sync. This slice does not touch global serial DB schema/migration/RLS/generated/lockfile/CI/guard/release gates, API/admin, engine, channels, capabilities source, LLM or eval paths.

## 事故与 closeout 记录

- Incident: `docs/incidents/INC-2026-06-26-m6b-03-root-worktree-write.md` records an initial tool-targeting error where the first M6B-03 patch landed on root/main. The diff was moved into the assigned worktree, root/main was restored to clean state before validation, and no commit, push, PR, deploy, secret, customer/order data, generated artifact, DB schema change or migration occurred from root/main.
- If any further write lands outside the assigned worktree, on root/main, on the wrong branch, in an unlisted path, or includes secret/customer-data boundary risk, stop and create/reference an incident before continuing.

## 实施步骤

1. Create this M6B-03 spec before source implementation.
2. Add cron artifact emit config so root `npm run build:cron` emits runnable JavaScript.
3. Change `@uzmax/cron` start to boot the emitted artifact.
4. Add the cron service shell: read a controlled distill payload, run a single daily health unit, log structured lifecycle/result events, exit once, and fail closed for missing/invalid runtime config.
5. Add a focused smoke that builds, starts the artifact command in a real process, proves first invocation completes, repeated same-day invocation skips without a second daily unit, and invalid input exits non-zero.
6. Create M6B-03 evidence with command output summaries, artifact paths, one-shot/idempotency observations, DB/RLS status, PR budget and validation.
7. Run focused validation and guards.

## 通过条件

- `npm run build:cron` exits 0 and emits runnable cron artifact path(s).
- `npm --workspace @uzmax/cron run start` starts the emitted artifact and does not use `node -e`, `runtime-compiler.mjs` or runtime TypeScript compilation.
- A real cron artifact process runs one distill daily health unit and exits `0`.
- Repeating the same business date exits `0` with a skip/idempotent event and does not create a second daily unit.
- An invalid or missing required payload exits non-zero and emits structured failure evidence.
- Evidence records DB/RLS truthfully: true DB pass only if `UZMAX_RLS_DATABASE_URL` is available and actually run; local artifact smoke is recorded as file-backed local evidence only.
- PR diff stays inside this spec touch list and source budget.

## 失败分支

- If TypeScript emit leaves non-runnable `.ts` imports, fix within cron build config or stop and propose a build-tool split.
- If cron start cannot run exactly once and exit with an observable code, do not mark M6B-03 passed.
- If repeated same-day invocation creates a second daily unit, do not mark M6B-03 passed.
- If `UZMAX_RLS_DATABASE_URL` is missing locally, record fail-closed/no-claim; do not fabricate DB/RLS evidence.
- If implementation requires API/admin changes, DB schema/migrations/generated changes, lockfile/shared dependency changes, CI/guard changes, production secrets or real customer/order data, stop and report.
- If any write occurs outside assigned worktree or on root/main, stop and record an incident before continuing.

## 不做什么

- No API, admin, staging deploy or production deploy changes.
- No DB schema, migrations, RLS policy, generated client, package lockfile, shared CI/guard/release gate, engine, channels, capabilities source, LLM gateway or eval changes.
- No long-running internal scheduler, real Telegram runtime, outbound Bot send, production cron env mutation or Render service mutation.
- No real customer/order data, raw Telegram payloads, raw prompts/completions, LLM keys, Bot tokens, provider calls, GA-0 opening, P1/P2 owner decision or 1.0 release.

## 验收映射

- J-01: cron artifact build/start evidence improves deploy baseline but does not close real deploy/rollback drills.
- J-02: daily idempotency evidence improves scheduled job safety but does not prove production backlog alerting.
- J-04: cron startup/result/failure logs improve operational evidence but do not complete all drills/runbooks.
- K-03/K-04: one spec / one branch / one worktree / one PR with scoped validation.
- L-01/L-02: GA-0 and 1.0 remain locked pending later M6B runtime evidence and owner decisions.
