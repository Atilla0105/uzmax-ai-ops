# M5R-03 Distill Scheduler + Health Runtime

## 目标

Connect the M5-02 pure distill guardrail helpers to a minimal cron/worker runtime and the existing DB/RLS persistence path.

This slice proves a runtime-only H-07 path: a daily injected candidate run persists at most 10 confirmation candidates with `distillRunId`, stores 7-day pass-rate health in `distill_health_daily`, automatically records a weekly downshift after 3 consecutive days below 40%, persists an owner alert/audit draft with controlled refs, and supports manual recovery back to daily with an audit record.

M5R-03 does not perform formal writes, does not call a real LLM/provider, does not deploy production cron/worker/Redis, and does not approve M5, GA-0, M6 or 1.0 release.

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner: decide later whether to approve M5R-03 evidence, whether to proceed to later M5R slices, and any production, real customer/order-data, customer LLM, LLM key, provider cost, compliance, GA-0, M5 owner acceptance or 1.0 release decision.

AI agent: implement only this spec in the assigned worktree/branch, preserve tenant/RLS boundaries, reuse existing M5-02 helpers and M5-01 DB contracts, prove true DB/RLS behavior when `UZMAX_RLS_DATABASE_URL` is available, record any missing-env blocker honestly, and keep M5/M5R status not owner accepted.

## 时间盒

0.8 个工作日. If implementation requires Prisma schema/migration/RLS policy changes, generated client, lockfile/shared config/CI/guard changes, admin UI, API route expansion, real Redis/BullMQ deployment, real LLM/provider calls, source budget overrun, or broad M5R-04+ scope, stop and report before widening scope.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M5R-03-distill-scheduler-health-runtime.md`
  - `docs/evidence/M5R/M5R-03-distill-scheduler-health-runtime.md`
  - `docs/evidence/M5R/README.md`
  - `apps/worker/src/distill-runtime-contracts.ts`
  - `apps/worker/src/distill-runtime.ts`
  - `apps/cron/src/main.ts`
  - `apps/cron/src/distill-scheduler.ts`
  - `scripts/tests/m5r-distill-scheduler-health-runtime.test.mjs`
  - `packages/db/scripts/run-m5r-distill-scheduler-health-true-db-smoke.mjs`
  - `packages/db/scripts/tests/run-m5r-distill-scheduler-health-true-db-smoke.mjs`
- 说明/备注：
  - Root/main checkout `/Users/atilla/Documents/UZMAX智能运营` is read-only coordination/audit only.
  - This PR may read `AGENTS.md`, M5R-00/M5R-01/M5R-02, M5-01/M5-02 specs/evidence, v1.1 source-of-truth docs, Prisma schema/migrations, current worker/cron source, DB/RLS helper patterns, and existing true DB smoke runners.
  - This PR must not touch `packages/db/prisma/schema.prisma`, `packages/db/migrations/**`, generated Prisma client, lockfile, package/shared config/CI/guards, `apps/admin`, API routes/controllers/services, `packages/llm-gateway`, `packages/evals`, formal write target expansion, external providers/connectors/adapters or production/release docs.

## 变更预算与路径分类

- source budget target: changed source files <= 10, net source LOC <= 650, new source files <= 4.
- docs: this spec, M5R-03 evidence, M5R evidence README.
- source: minimal `apps/worker` distill runtime/contracts, minimal `apps/cron` scheduler job planner/export and a thin true DB smoke CLI wrapper.
- test: focused M5R-03 runtime contract test and true DB smoke support under `packages/db/scripts/tests`.
- generated/lock/config/schema/migration/admin/API route/formal-write target/evals/llm-gateway/external provider/adapter: none.
- New source `rg` conclusion: searched current `distill`, `DistillRun`, `distill_health_daily`, `confirmation_item`, `AuditLog`, `createRlsTransactionContext`, `UZMAX_RLS_DATABASE_URL`, `apps/worker`, `apps/cron`, M5R smoke runners and runtime patterns. Existing `packages/distill/src/index.ts` already contains pure cap/pass-rate/downshift/alert/recovery helpers; existing DB contracts contain `DistillRun`, `DistillHealthDaily`, `ConfirmationItem` and `AuditLog`; worker/cron currently have no distill scheduler/health runtime source. New runtime source therefore belongs in `apps/worker/src/distill-runtime.ts`, with pure plan/Prisma mapping kept in `apps/worker/src/distill-runtime-contracts.ts` to stay under file-length limits; a tiny scheduler planner belongs in `apps/cron/src/distill-scheduler.ts`; the true DB smoke wrapper belongs under `packages/db/scripts`.
- External API/SDK/provider/connector/adapter basis: none. This PR adds no external API/provider/connector/adapter and performs no real LLM/provider call. Prisma usage relies on existing generated Prisma client/model and repo-local `createRlsTransactionContext`/`UZMAX_RLS_DATABASE_URL` runtime helpers.
- Exceptions: none. No `large_change_exception` and no `test_weakening_exception`.

## 文档触发检查

updated

## 前置条件

- Read `AGENTS.md`.
- Read `docs/specs/README.md`.
- Read `docs/specs/M5R-00-runtime-integration-plan.md`.
- Read `docs/evidence/M5R/README.md`.
- Read `docs/specs/M5R-01-confirmation-queue-persistence.md`.
- Read `docs/evidence/M5R/M5R-01-confirmation-queue-persistence.md`.
- Read `docs/specs/M5R-02-formal-write-pipeline.md`.
- Read `docs/evidence/M5R/M5R-02-formal-write-pipeline.md`.
- Read `docs/specs/M5-02-distill-guardrails.md`.
- Read `docs/evidence/M5/M5-02-distill-guardrails.md`.
- Read `docs/specs/M5-01-db-contract-foundation.md`.
- Read `docs/evidence/M5/M5-01-db-contract-foundation.md`.
- Read `docs/evidence/M5/README.md`.
- Read the v1.1 source-of-truth docs enough to ground REQ-A05/H-07 and runtime/RLS boundaries.
- Read relevant current files under `packages/distill/src/index.ts`, `packages/db/src/index.ts`, `packages/db/src/m5-operations-contracts.ts`, `packages/db/src/prisma-runtime.ts`, `packages/db/prisma/schema.prisma`, `packages/db/migrations/0007_m5_operations_contracts_foundation.sql`, `packages/db/migrations/0002_audit_config_version_foundation.sql`, `apps/api/src/confirmation-queue.runtime.ts`, `apps/api/src/confirmation-queue.formal-write.ts`, `apps/api/src/audit-log.prisma-sink.ts`, `apps/worker/src/*`, `apps/cron/src/*`, and current M5R true DB smoke runners.
- Confirm current `origin/main` is the M5R-02 merge base `6fd21f92eb233be1eadfedfad849ba83790d710b`.
- Record start audit in `docs/evidence/M5R/M5R-03-distill-scheduler-health-runtime.md` before source/test implementation edits.
- Keep M5 status not owner accepted; do not update M5 owner acceptance status.

## Worktree / branch 前置条件

| Fact | Expected |
|---|---|
| worktree | `/Users/atilla/Documents/uzmax-m5r-03-distill-scheduler-health-runtime` |
| branch | `codex/m5r-03-distill-scheduler-health-runtime` |
| base | `origin/main` at `6fd21f92eb233be1eadfedfad849ba83790d710b` |
| forbidden checkout | `/Users/atilla/Documents/UZMAX智能运营` |
| root/main checkout use | coordination/read-only only |
| required pre-edit evidence | `pwd`, `git status --short --branch`, `git branch --show-current`, worker `HEAD`, worker `origin/main`, root/main status, open PR audit, `git branch --no-merged main`, `git worktree list`, and git-dir/common-dir isolation proof |

## 并发派发证据

M5R-03 is the only writer for this branch/worktree/spec. The assigned physical path and branch are unique. The touch list overlaps `apps/worker`, `apps/cron`, distill health runtime and `packages/db/scripts` smoke runner paths, so any parallel M5R worker touching worker/cron/shared runtime helper paths or DB smoke support must wait or show disjoint evidence. This slice does not touch global serial schema/migration/RLS policy/lockfile/shared config/CI/guard/generated/release gates.

Pre-existing root no-merged local branches recorded before edits: `codex/m4-48-owner-signoff-test-alignment`, `codex/m5-00-operations-loop-readiness-pack`, `codex/m5-01-db-contract-foundation`, `codex/m5-06-logs-analytics`. This worker does not modify or clean them.

## 事故与 closeout 记录

- Incident: none at start.
- If any write lands outside the assigned worktree, on root/main, on the wrong branch, in an unlisted path, or includes secret/customer-data boundary risk, stop and create or reference `docs/incidents/` before continuing.
- If validation proves schema/migration/admin/API route/formal-write/eval/LLM/provider/production deployment scope is required, stop and report rather than widening M5R-03.

## 实施步骤

1. Record start audit and baseline M5-02/M5R-01/M5R-02 focused test evidence.
2. Create this M5R-03 spec and evidence file, and add an M5R README index/status entry for M5R-03 only.
3. Add a minimal cron scheduler planner that creates an injected `distill_daily_health_runtime` job payload with controlled refs only and no Redis/LLM/provider call.
4. Add a worker distill runtime that uses M5-02 helpers, creates one `distill_run`, persists at most 10 `confirmation_item` candidates with `distillRunId`, persists one `distill_health_daily` row, and optionally persists a controlled owner alert/audit draft.
5. Add manual recovery runtime that validates current weekly/paused state, writes a controlled `audit_log` row and updates `distill_health_daily` back to daily.
6. Add focused tests proving candidate cap, controlled refs, RLS transaction settings, no bare Prisma bypass, no formal write, downshift alert/audit draft, manual recovery and missing-env fail-closed behavior.
7. Add a true DB smoke runner proving same-tenant writes/readback for `distill_run`, capped `confirmation_item`, `distill_health_daily`, downshift/audit, manual recovery, plus wrong-tenant/missing-context DB/RLS negatives.
8. Run required validation and record results.
9. Commit, push and open a PR with PR hygiene table.

## 通过条件

- Spec has all required fields from `docs/specs/README.md`.
- Evidence records start audit, implementation scope, validation, true DB/RLS status, acceptance mapping, boundaries and no sensitive data statement.
- Cron helper only plans/builds an injected job payload; it does not start production scheduling, read Redis, call a provider or mutate DB.
- Worker runtime candidate source is injected/control-ref based only; no real LLM/provider or external API call exists.
- Daily candidate run persists a `distill_run` with `candidateCount <= 10` and `truncatedCount` from the M5-02 helper.
- Candidate rows persist into existing `confirmation_item` with `distillRunId`, controlled refs and no formal write status/metadata.
- 7-day pass rate and consecutive low-day count persist to `distill_health_daily`.
- Three consecutive days below 40% automatically persist weekly frequency/downshift state and a controlled owner alert/audit draft.
- Manual recovery writes a controlled audit record and restores frequency to daily only from weekly/paused state.
- Runtime DB writes use `createRlsTransactionContext`, restricted app role and transaction-scoped `app.org_id` / `app.tenant_id`.
- Explicit DB runtime requires `UZMAX_RLS_DATABASE_URL` and rejects bare `prisma_gateway` mode.
- True DB smoke proves same-tenant positive behavior and wrong-tenant/missing-context negative behavior using real DB/RLS, not repository-only filters, if `UZMAX_RLS_DATABASE_URL` is available.
- Required validation passes or failures are honestly recorded.
- Source budget remains within changed source files <= 10, net source LOC <= 650, new source files <= 4.

## 失败分支

- If worktree/branch/root boundary differs: stop and report `BLOCKED`.
- If current DB contract is insufficient and schema/migration/RLS changes are required: stop and report `BLOCKED` with evidence; do not add schema/migration in M5R-03.
- If true DB smoke cannot run because `UZMAX_RLS_DATABASE_URL` is absent: record the missing-env blocker in evidence and keep the contract test proving the runner/runtime requires `UZMAX_RLS_DATABASE_URL`.
- If source budget exceeds target: stop and report with proposed split.
- If tests require admin UI, API route expansion, formal write expansion, H-01 full authoring, eval publishing, AI-member runtime control, external provider calls, production Redis/worker deployment or real customer/order data: stop and split to later M5R specs.
- If raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets appear: stop, clean up and create or reference incident evidence before continuing.
- If validation fails from this slice, fix within allowed files; do not weaken tests or expand mocks to pass.

## 不做什么

- No Prisma schema, migration, RLS policy, generated client, lockfile, shared config/CI/guard, admin UI, API route/controller/service expansion, formal write expansion, H-01 full authoring, eval publishing, AI-member runtime control, template copy runtime or production/release gate changes.
- No real customer data, real order data, real LLM calls, customer LLM, external SaaS onboarding, production Redis/worker deployment, GA-0, M6, production readiness, M5 owner acceptance or 1.0 release claim.
- No automatic knowledge/config/profile/eval/template/customer-profile write. Candidate rows remain pending confirmation items and formal write metadata remains false/not written.
- No raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets.
- No M5 owner acceptance status update.

## 验收映射

| Item | M5R-03 status | Notes |
|---|---|---|
| H-02 | `distill_candidates_persisted_not_formal_write_closed` | Distill candidates are confirmation items with `formalWrite: false`; formal write behavior remains M5R-02 named config path only. |
| H-07 | `distill_scheduler_health_runtime_supported_not_owner_accepted` | Candidate cap, 7-day pass rate, 3-day downshift, owner alert/audit draft and manual recovery are persisted through runtime proof. |
| I-02 | `runtime_alert_recovery_supported_not_admin_mobile_closed` | Runtime data can support later admin/mobile fallback; admin runtime wiring remains M5R-07. |
| I-06 | `distill_health_metric_source_supported_not_analytics_closed` | `distill_health_daily` stores pass-rate/frequency source data; analytics runtime board remains M5R-05. |
| J-05 | `m5r_03_runtime_evidence_added_not_owner_accepted` | This evidence records M5R-03 only; no M5 owner acceptance or release signoff. |
| K-03 | `active` | One spec / one PR; current branch implements only M5R-03. |
| K-04 | `active` | Worktree/branch/touch list are scoped; schema/migration/global gates remain untouched. |

M5R-03 closes no production acceptance item. It only proves the distill scheduler/health runtime path on existing DB/RLS contracts.
