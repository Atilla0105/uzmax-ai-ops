# M6-02 Runtime Deploy And Rollback Baseline

## 目标

Establish the M6 runtime deploy and rollback baseline for api, worker, cron and admin surfaces without performing a real production cutover.

This slice turns the current repo deployment manifests, package start commands, health endpoints and rollback runbook into repeatable evidence for J-01/J-04. Linear `LAY-7` is tracking only; repo spec, checks and evidence are the source of truth.

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner: project owner still owns real Render/Vercel service creation, preview/prod exposure, production deploy, rollback execution in real environments, secrets/env values, cost decisions, GA-0 opening and 1.0 release approval.

AI agent: audit the current runtime baseline, add a deterministic repo check, update the rollback runbook with per-surface dry-run expectations, record explicit blockers where the current repo only has placeholders or pending owner/environment access, and keep GA-0 locked.

## 时间盒

0.5-1 个工作日. If this requires real platform mutation, secret creation, production deployment, runtime architecture refactor, worker/cron start-command implementation, source package behavior changes, schema/migration changes, lockfile/config/CI changes or owner approval beyond M5 signoff, stop and record blockers instead of widening this PR.

## Spec 类型

infra

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M6-02-runtime-deploy-baseline.md`
  - `docs/evidence/M6/README.md`
  - `docs/evidence/M6/M6-02-runtime-deploy-baseline.md`
  - `docs/runbooks/deploy-rollback.md`
  - `docs/release.md`
  - `scripts/guards/m6-runtime-baseline-check.mjs`
  - `scripts/tests/m6-runtime-deploy-baseline.test.mjs`
- 说明/备注：
  - This slice may read `AGENTS.md`, the four v1.1 source-of-truth docs, `docs/specs/README.md`, `docs/evidence/README.md`, `docs/doc-gates.md`, M0 infra manifests, M6 evidence, `render.yaml`, app package files, runtime entrypoints, Git/GitHub current-state evidence and Linear `LAY-7`.
  - Do not modify app runtime source, backend packages, schema/migrations, generated files, lockfile, CI/guard config, deployment config or admin UI.

## 变更预算与路径分类

- source 预算：changed source files <= 1、net source LOC <= 360、new source files <= 1.
- test/generated/lock/config/docs 预计变更：one focused Node test, one M6 spec/evidence file, M6 evidence index update, deploy rollback runbook update and release boundary update.
- 新增 source 文件前的 `rg` 搜索结论和归属理由：`rg` found only the high-level `docs/runbooks/deploy-rollback.md`, M0 infra manifests and app package start commands; no repeatable M6 runtime baseline check exists. Add `scripts/guards/m6-runtime-baseline-check.mjs` because `scripts/guards/*.mjs` is the repo's existing stable entry pattern for deterministic governance/evidence checks, and this is release-hardening evidence tooling, not app runtime behavior.
- 外部 API/SDK/provider/connector/adapter 依据：无. This PR performs no external platform mutation and uses existing repo manifests only.
- 是否需要例外：无.

## 文档触发检查

- 结果：updated.
- 判断依据：`docs/doc-gates.md`.

## 前置条件

- Read `AGENTS.md`.
- Read `docs/specs/README.md`, `docs/evidence/README.md`, `docs/doc-gates.md` and this spec.
- Read the four v1.1 source-of-truth docs named in `AGENTS.md`, focusing on deployment, operations, runbook, GA-0 and release-gate clauses.
- Read `docs/evidence/M6/README.md`, `docs/evidence/M6/M6-00-m5-signoff-and-m6-readiness-pack.md`, `docs/evidence/M6/M6-01-release-gate-console.md` and `docs/release.md`.
- Read M0 infra manifests for Render, Vercel and observability.
- Read `render.yaml`, `apps/api/package.json`, `apps/worker/package.json`, `apps/cron/package.json`, `apps/admin/package.json`, API health route and worker/cron entrypoints.
- Read Linear `LAY-7`; treat it as tracking only.

## Worktree / branch 前置条件

| Fact | Expected |
|---|---|
| worker worktree | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m6-02-runtime-deploy-baseline` |
| worker branch | `codex/m6-02-runtime-deploy-baseline` |
| forbidden checkout for edits | `/Users/atilla/Applications/UZMAX智能运营` |
| required pre-edit evidence | worker `pwd`, `git status --short --branch`, `git branch --show-current`, worker `HEAD`, worker `origin/main`, root/main status, root/main `HEAD`, open PR audit, branch audit, latest main CI evidence |

## 并发派发证据

Single active writing worker for M6-02. This slice touches release/deploy baseline evidence and runbooks, so it must not run concurrently with other deployment config, release gate, runtime start-command or runbook slices.

No DB/schema, migration, lockfile, shared config, CI/guard script, generated artifact, app runtime source or deployment config changes are allowed in this branch.

## 事故与 closeout 记录

If any write lands outside the assigned worktree, on root/main, on the wrong branch, in an unlisted path, or includes secret/customer-data boundary risk, stop and create or reference `docs/incidents/` before continuing.

M6-02 creates no new incident if execution stays inside the assigned worktree and allowed paths.

Known inherited incidents remain the M5R root/main pollution records listed by M6-00.

## 实施步骤

1. Record current repo, CI, PR and branch state for M6-02 entry.
2. Add this spec before release baseline edits.
3. Add `scripts/guards/m6-runtime-baseline-check.mjs` to inspect repo manifests, package commands, health routes and runbook coverage, returning deterministic JSON.
4. Add focused Node tests for the baseline checker and docs/evidence wording.
5. Update `docs/runbooks/deploy-rollback.md` with api/worker/cron/admin rollback dry-run and evidence expectations.
6. Add `docs/evidence/M6/M6-02-runtime-deploy-baseline.md` with current baseline, blockers, validation and remaining J-01/J-04 gaps.
7. Update `docs/evidence/M6/README.md` and `docs/release.md` so M6-02 is visible without implying GA-0 or production approval.
8. Run focused validation, create a one-spec PR, update Linear `LAY-7`, merge after CI green, then clean local and remote branches.

## 通过条件

- Runtime baseline checker exists and reports api, worker, cron, admin and runbook status from repo files.
- Checker records:
  - API `render.yaml` service and package start command are present and `/healthz` exists.
  - Worker and cron have Render service definitions, but package `start` scripts are still M0 deployment placeholders.
  - Admin package build/start scripts exist and Vercel manifest remains deployment-pending.
  - Render service creation and real rollback drill are not closed by this PR.
- Deploy/rollback runbook includes per-surface rollback, health checks, dry-run evidence and failure branches for api, worker, cron and admin.
- M6 evidence records J-01/J-04 as partial/baseline only, with explicit blockers for real platform mutation and placeholder runtime starts.
- Diff is limited to this spec's touch list and remains within source budget.
- Linear `LAY-7` receives a comment with repo paths, PR and result.

## 失败分支

- If current repo evidence contradicts M6-01 or M6 readiness state: keep GA-0 locked and record blocker instead of showing ready.
- If a real deploy/rollback drill is required but external platform mutation or owner environment decision is unavailable: record owner/external blocker and do not fake closure.
- If worker/cron start commands are placeholders: record J-01 blocker instead of marking worker/cron rollback ready.
- If validation requires source/runtime/schema/config/lockfile changes outside the touch list: stop and split later M6 specs.
- If wording implies GA-0 opened, production-ready, real customer/order-data approved, customer LLM approved, real LLM/provider key approved, external SaaS onboarding approved or 1.0 release approved: correct before merge.
- If raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets appear: stop, clean up and create or reference incident evidence before continuing.

## 不做什么

- Do not start M6-03.
- Do not perform Render/Vercel deployment, service creation, rollback or secret/env mutation.
- Do not implement worker/cron production start behavior.
- Do not change `render.yaml`, package scripts, app runtime source, schema/migrations, generated files, lockfile, CI/guard scripts or admin UI.
- Do not approve GA-0, production, real customer/order data, customer LLM, external SaaS onboarding or 1.0 release.
- Do not use Linear as source of truth.
- Do not weaken tests.

## 验收映射

- J-01: baseline records deploy/rollback readiness and explicit blockers for api, worker, cron and admin; it does not close final real rollback drills.
- J-04: runbook coverage is improved for deploy/rollback response and dry-run evidence; later M6 slices still cover model-all-down, redline bad send, order/import abnormal and RLS misconfig drills.
- L-01: GA-0 remains locked until required rollback/drill and owner gates are green.
- K-03/K-04: one spec / one PR and deployment/release work stays serial.
