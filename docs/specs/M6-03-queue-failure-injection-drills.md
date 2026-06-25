# M6-03 Queue Failure Injection Drills

## 目标

Turn the existing BullMQ/Redis order-import queue smoke into M6 release-hardening evidence for retry, idempotency, backlog alerts and abnormal worker paths.

This slice records the M6-level J-02 evidence and runbook without adding a new queue architecture, production worker deployment, real customer/order data or GA-0 approval. Linear `LAY-8` is tracking only; repo spec, runbook, tests and evidence are the source of truth.

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner: project owner still owns production Redis/worker deployment, formal alert-channel routing, real environment access, cost decisions, GA-0 opening and 1.0 release approval.

AI agent: preserve the existing M4-45 queue runtime boundary, record M6-level release drill evidence, add an operator runbook for the safe drill path, ensure duplicate jobs do not produce duplicate successful effects in the synthetic order-import path, and keep production/GA gates closed.

## 时间盒

0.5-1 个工作日. If this requires production Redis, real customer/order data, a new queue runtime, formal alert routing, app source changes, schema/migrations, lockfile changes, CI config changes, external platform mutation or owner approval beyond M5 signoff, stop and record blockers instead of widening this PR.

## Spec 类型

infra

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M6-03-queue-failure-injection-drills.md`
  - `docs/evidence/M6/README.md`
  - `docs/evidence/M6/M6-03-queue-failure-injection-drills.md`
  - `docs/evidence/M4/M4-45-order-import-queue-security-closeout.md`
  - `docs/runbooks/README.md`
  - `docs/runbooks/queue-failure-injection.md`
  - `docs/release.md`
  - `scripts/tests/m6-queue-failure-injection-drills.test.mjs`
- 说明/备注：
  - This slice may read `AGENTS.md`, the four v1.1 source-of-truth docs, `docs/specs/README.md`, `docs/evidence/README.md`, `docs/doc-gates.md`, M6 evidence, M4-45 queue evidence/spec, worker queue runtime sources, the M4-45 Redis smoke, Git/GitHub current-state evidence and Linear `LAY-8`.
  - `docs/evidence/M4/M4-45-order-import-queue-security-closeout.md` may only receive an M6 cross-reference and replay note; it must not rewrite historical M4 closeout claims.
  - Do not modify app runtime source, backend packages, schema/migrations, generated files, lockfile, CI/guard config, deployment config or admin UI.

## 变更预算与路径分类

- source 预算：changed source files <= 0、net source LOC <= 0、new source files <= 0.
- test/generated/lock/config/docs 预计变更：one focused Node test; one M6 spec/evidence file; M6 evidence index update; one queue failure-injection runbook; runbooks/release docs updates; one M4-45 evidence cross-reference.
- 新增 source 文件前的 `rg` 搜索结论和归属理由：no source files are added. `rg` found the existing M4-45 BullMQ/Redis runtime, Redis smoke, focused runtime test and CI path-scope evidence; M6-03 records and validates that existing drill at release-hardening level instead of creating a parallel implementation.
- 外部 API/SDK/provider/connector/adapter 依据：M4-45 already records BullMQ/ioredis package evidence and CI Redis smoke. This PR adds no external provider/connector/adapter and performs no external platform mutation.
- 是否需要例外：无.

## 文档触发检查

- 结果：updated.
- 判断依据：`docs/doc-gates.md`.

## 前置条件

- Read `AGENTS.md`.
- Read `docs/specs/README.md`, `docs/evidence/README.md`, `docs/doc-gates.md` and this spec.
- Read the four v1.1 source-of-truth docs named in `AGENTS.md`, focusing on J-02, J-04, GA-0, worker/queue and release-hardening clauses.
- Read `docs/evidence/M6/README.md`, `docs/evidence/M6/M6-00-m5-signoff-and-m6-readiness-pack.md`, `docs/evidence/M6/M6-02-runtime-deploy-baseline.md` and `docs/release.md`.
- Read `docs/evidence/M4/M4-45-order-import-queue-security-closeout.md`, `apps/worker/src/order-import-bullmq-runtime.ts`, `apps/worker/src/order-import-dispatch.ts`, `apps/worker/scripts/run-m4-order-import-bullmq-redis-smoke.mjs` and `scripts/tests/m4-order-import-bullmq-redis-runtime.test.mjs`.
- Read Linear `LAY-8`; treat it as tracking only.

## Worktree / branch 前置条件

| Fact | Expected |
|---|---|
| worker worktree | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m6-03-queue-failure-drills` |
| worker branch | `codex/m6-03-queue-failure-drills` |
| forbidden checkout for edits | `/Users/atilla/Applications/UZMAX智能运营` |
| required pre-edit evidence | worker `pwd`, `git status --short --branch`, `git branch --show-current`, worker `HEAD`, worker `origin/main`, root/main status, root/main `HEAD`, open PR audit, branch audit, latest main CI evidence |

## 并发派发证据

Single active writing worker for M6-03. This slice touches worker queue evidence and runbooks, so it must not run concurrently with other worker/queue, deploy/rollback, production gate or fault-drill slices.

No DB/schema, migration, lockfile, shared config, CI/guard script, generated artifact, app runtime source, deployment config or admin UI changes are allowed in this branch.

## 事故与 closeout 记录

If any write lands outside the assigned worktree, on root/main, on the wrong branch, in an unlisted path, or includes secret/customer-data boundary risk, stop and create or reference `docs/incidents/` before continuing.

M6-03 creates no new incident if execution stays inside the assigned worktree and allowed paths.

Known inherited incidents remain the M5R root/main pollution records listed by M6-00.

## 实施步骤

1. Record current repo, CI, PR and branch state for M6-03 entry.
2. Add this spec before evidence/runbook edits.
3. Add `docs/runbooks/queue-failure-injection.md` with safe synthetic Redis/BullMQ drill steps, expected evidence and failure branches.
4. Add `docs/evidence/M6/M6-03-queue-failure-injection-drills.md` mapping retry, idempotency, backlog alert and abnormal worker evidence to J-02.
5. Add a bounded M6 cross-reference to the M4-45 evidence so the existing CI path-scope reruns the Redis smoke in this PR.
6. Update `docs/evidence/M6/README.md`, `docs/runbooks/README.md` and `docs/release.md` so M6-03 is visible without implying GA-0 or production approval.
7. Add focused Node tests that verify the M6-03 repo evidence/runbook and the existing M4-45 smoke contract.
8. Run focused validation, create a one-spec PR, update Linear `LAY-8`, merge after CI green, then clean local and remote branches.

## 通过条件

- M6-03 evidence links the existing M4-45 BullMQ/Redis smoke and records retry, idempotency, backlog alert, failed-state and run cleanup behavior.
- M6-03 evidence records that duplicate deterministic jobs do not create duplicate successful order-import dispatch effects in the synthetic drill.
- Queue failure-injection runbook includes fail-closed env check, disposable Redis smoke command, expected evidence, failure branches and sensitive-data boundary.
- M6 index and release boundary show J-02 as supported by synthetic release drill evidence while preserving blockers for production Redis/worker deployment, formal alert routing and GA-0.
- The PR touches `docs/evidence/M4/M4-45-order-import-queue-security-closeout.md` only as an M6 cross-reference, causing the existing CI path-scope to rerun the M4 Redis smoke in this PR.
- Diff is limited to this spec's touch list and has zero source changes.
- Linear `LAY-8` receives a comment with repo paths, PR and result.

## 失败分支

- If current repo evidence contradicts M4-45 queue drill claims: keep J-02 open and record blocker instead of marking supported.
- If Redis/BullMQ-compatible execution is unavailable locally: rely on the existing CI smoke path and require PR CI before merge; do not fake a local Redis pass.
- If duplicate enqueue can create duplicate successful dispatch effects: block J-02 and split a worker/runtime fix spec.
- If backlog or failed-state alerts are missing: keep J-02 open and record the missing alert path.
- If validation requires source/runtime/schema/config/lockfile changes outside the touch list: stop and split a later M6 spec.
- If wording implies GA-0 opened, production-ready, real customer/order-data approved, customer LLM approved, real LLM/provider key approved, external SaaS onboarding approved or 1.0 release approved: correct before merge.
- If raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets appear: stop, clean up and create or reference incident evidence before continuing.

## 不做什么

- Do not start M6-04.
- Do not create a new queue architecture, queue package or worker runtime.
- Do not perform production Redis/worker deployment, queue migration, formal alert-channel routing or external platform mutation.
- Do not use real customer/order data, customer LLM, real LLM/provider calls or external SaaS onboarding.
- Do not modify app runtime source, schema/migrations, generated files, lockfile, CI/guard config, deployment config or admin UI.
- Do not approve GA-0, production or 1.0 release.
- Do not use Linear as source of truth.
- Do not weaken tests.

## 验收映射

- J-02: records retry, idempotency, backlog alert, failed-state and duplicate-effect evidence from the existing BullMQ/Redis synthetic drill.
- J-04: adds a runbook entry for worker accumulation and order-import abnormal path handling.
- L-01: keeps GA-0 locked until all release gates and owner decisions are green.
- K-03/K-04: one spec / one PR and queue/fault-drill work stays serial.
