# M5R-05 Logs + Analytics Runtime

## 目标

Connect the M5-06 local logs/analytics contract to a minimal API + DB/RLS runtime source for login logs, presence logs, operation logs and a narrow fixed analytics board.

This slice adds only the missing runtime objects needed for M5R-05: `login_log`, `presence_log` and `export_job`. Operation logs read the existing `audit_log`; fixed board values are derived from existing `confirmation_item`, `distill_health_daily` and `ai_member` runtime tables. No broad BI, `metric_daily`, raw message scans or sensitive export files are added.

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner: decide later whether to approve M5R-05 evidence, whether to proceed to M5R-06/M5R-07/M5R-08, and any production, real customer/order-data, customer LLM, LLM key, provider cost, compliance, GA-0, M5 owner acceptance or 1.0 release decision.

AI agent: implement only this spec in the assigned worktree/branch, preserve tenant/RLS boundaries, add only the minimum missing DB/RLS schema for login/presence/export jobs, reuse existing runtime tables for operation logs and board metrics, prove true DB/RLS behavior when `UZMAX_RLS_DATABASE_URL` is available, record any missing-env blocker honestly, and keep M5/M5R status not owner accepted.

## 时间盒

0.8 个工作日. If implementation requires `metric_daily`, broad BI aggregation, admin UI redesign/wiring, Playwright API-backed admin runtime closure, real export file creation, worker/cron analytics aggregation, raw message scans, external provider calls, production deploy, or unbounded schema expansion, stop and report before widening scope.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M5R-05-logs-analytics-runtime.md`
  - `docs/evidence/M5R/M5R-05-logs-analytics-runtime.md`
  - `docs/evidence/M5R/README.md`
  - `packages/db/prisma/schema.prisma`
  - `packages/db/migrations/0008_m5r05_logs_analytics_runtime.sql`
  - `apps/api/src/logs-analytics-runtime.ts`
  - `apps/api/src/logs-analytics-runtime.contracts.ts`
  - `apps/api/src/logs-analytics-runtime.repository.ts`
  - `apps/api/src/app.module.ts`
  - `apps/api/scripts/runtime-compiler.mjs`
  - `scripts/tests/m5r-logs-analytics-runtime.test.mjs`
  - `packages/db/scripts/run-m5r-logs-analytics-true-db-smoke.mjs`
  - `packages/db/scripts/tests/run-m5r-logs-analytics-true-db-smoke.mjs`
- 说明/备注：
  - Root/main checkout `/Users/atilla/Documents/UZMAX智能运营` is read-only coordination/audit only.
  - This PR may read `AGENTS.md`, M5R-00..M5R-04 specs/evidence, M5-06 spec/evidence, v1.1 source-of-truth docs, Prisma schema/migrations and current API runtime files.
  - This PR must not touch broad `apps/admin` UI wiring, Playwright admin runtime closure, `apps/worker`, `apps/cron`, `packages/distill`, `packages/evals`, `packages/llm-gateway`, `packages/engine`, `packages/capabilities`, lockfile, package/shared config/CI/guards, generated client committed artifacts, external providers/connectors/adapters or production/release docs.

## 变更预算与路径分类

- source budget target: changed source files <= 9, net source LOC <= 650, new source files <= 4 unless the exact `large_change_exception` below is accepted by owner/review.
- docs: this spec, M5R-05 evidence, M5R evidence README.
- source: minimal Prisma schema objects for `login_log`, `presence_log`, `export_job`; minimal `apps/api` logs analytics controller/contracts/repository; AppModule provider/controller wiring; runtime compiler support; thin true DB smoke CLI wrapper.
- test: focused M5R-05 runtime/API contract test and true DB smoke support under `packages/db/scripts/tests`.
- migration: `packages/db/migrations/0008_m5r05_logs_analytics_runtime.sql`.
- generated/lock/config/admin UI/Playwright/worker/cron/distill/evals/llm-gateway/engine/capabilities/external provider/adapter/production gate: none.
- New source `rg` conclusion: searched `login_log`, `presence_log`, `audit_log`, `export_job`, `metric_daily`, `logsAnalytics`, `M5LogsAnalyticsShell`, `confirmation queue`, `distill_health_daily`, `ai_member`, current M5R runtime patterns, `createRlsTransactionContext` and `UZMAX_RLS_DATABASE_URL`. Existing schema contains `audit_log`, `confirmation_item`, `distill_health_daily`, `ai_member`, `ai_member_version` and `ai_capability_toggle`, but not `login_log`, `presence_log` or `export_job`. New API source belongs under `apps/api/src/logs-analytics-runtime*.ts` because this is a backend/API runtime source for later M5R-07 admin wiring. The true DB smoke wrapper belongs under `packages/db/scripts`; long synthetic DB/RLS assertions live under `packages/db/scripts/tests`.
- External API/SDK/provider/connector/adapter basis: none. This PR adds no external API/provider/connector/adapter and performs no real LLM/provider call. Prisma usage relies on existing generated Prisma client/model and repo-local `createRlsTransactionContext`/`UZMAX_RLS_DATABASE_URL` runtime helpers.
- Exceptions: `large_change_exception` for exceeding both the AGENTS.md default net source LOC budget and this spec's target after counting all hand-written source: changed source files 7, net source LOC +722, new source files 4. Counted source files are `apps/api/scripts/runtime-compiler.mjs` (+41), `apps/api/src/app.module.ts` (+23), `apps/api/src/logs-analytics-runtime.contracts.ts` (+218), `apps/api/src/logs-analytics-runtime.repository.ts` (+235), `apps/api/src/logs-analytics-runtime.ts` (+117), `packages/db/prisma/schema.prisma` (+79) and `packages/db/scripts/run-m5r-logs-analytics-true-db-smoke.mjs` (+9). Splitting would separate the required schema/RLS/API readback/export-draft runtime from its smoke entrypoint and focused test harness, leaving M5R-05 without an end-to-end contract. No `test_weakening_exception`.

## 文档触发检查

updated

## 前置条件

- Read `AGENTS.md`.
- Read `docs/specs/README.md`.
- Read the four v1.1 source-of-truth docs named in `AGENTS.md` enough to ground REQ-T11/REQ-T12/I-06/I-07 boundaries.
- Read `docs/specs/M5R-00-runtime-integration-plan.md`.
- Read `docs/evidence/M5R/README.md`.
- Read `docs/specs/M5-06-logs-analytics.md`.
- Read `docs/evidence/M5/M5-06-logs-analytics.md`.
- Read relevant merged M5R specs/evidence: M5R-01 through M5R-04.
- Read existing DB/API/admin patterns before adding anything, using `rg` for `login_log`, `presence_log`, `audit_log`, `export_job`, `metric_daily`, `logsAnalytics`, `M5LogsAnalyticsShell`, `confirmation queue`, `distill_health_daily`, `ai_member`.
- Confirm current `origin/main` is the M5R-04 merge base `73d1a2d1c382c05e5d77f7cb17b3be1ad8f9a62e`.
- Record start audit in `docs/evidence/M5R/M5R-05-logs-analytics-runtime.md` before implementation edits.
- Keep M5 status not owner accepted; do not update M5 owner acceptance status.

## Worktree / branch 前置条件

| Fact | Expected |
|---|---|
| worktree | `/private/tmp/uzmax-m5r-05-logs-analytics-runtime` |
| branch | `codex/m5r-05-logs-analytics-runtime` |
| base | `origin/main` at `73d1a2d1c382c05e5d77f7cb17b3be1ad8f9a62e` |
| forbidden checkout | `/Users/atilla/Documents/UZMAX智能运营` |
| root/main checkout use | coordination/read-only only |
| required pre-edit evidence | `pwd`, `git status --short --branch`, `git branch --show-current`, worker `HEAD`, worker `origin/main`, root/main status, open PR audit, `git branch --no-merged main`, and git-dir/common-dir isolation proof |

## 并发派发证据

M5R-05 is the only writer for this branch/worktree/spec. The assigned physical path and branch are unique. The touch list includes `packages/db` schema/migration/RLS and logs analytics API/runtime paths, so it is a global serial writer for those paths. Any parallel worker touching `packages/db`, schema, migrations, RLS, shared runtime helpers, API logs analytics paths or DB smoke support must wait or show explicit non-overlap. This slice does not touch lockfile, shared config, CI/guard scripts, generated committed artifacts or release/production gates.

Open PR audit before edits returned `[]`. Root no-merged branch audit before edits returned no branch output. Linked worktree proof showed worker git dir under `/Users/atilla/Documents/UZMAX智能运营/.git/worktrees/uzmax-m5r-05-logs-analytics-runtime` and common dir `/Users/atilla/Documents/UZMAX智能运营/.git`.

## True DB/RLS Smoke Baseline

M5R-05 true DB/RLS smoke must:

- use `UZMAX_RLS_DATABASE_URL`;
- use the restricted `uzmax_app_runtime` role and transaction-scoped `app.org_id` / `app.tenant_id`;
- create/read synthetic same-tenant `login_log`, `presence_log`, `audit_log`, `export_job`, `confirmation_item`, `distill_health_daily` and `ai_member` rows as needed;
- prove login/presence/operation filtered readback, fixed board metrics and controlled export draft creation;
- prove wrong-tenant and missing-context negative behavior through real DB/RLS;
- fail closed with exact missing-env reason if `UZMAX_RLS_DATABASE_URL` is absent.

## 事故与 closeout 记录

- Incident: none at start.
- If any write lands outside the assigned worktree, on root/main, on the wrong branch, in an unlisted path, or includes secret/customer-data boundary risk, stop and create or reference `docs/incidents/` before continuing.
- If validation proves broad BI/admin UI/worker/cron/export-file/real-data/production scope is required, stop and report rather than widening M5R-05.

## 实施步骤

1. Record start audit and baseline M5R/M5-06 context.
2. Create this M5R-05 spec and evidence file, and update M5R README active/status entry for M5R-05 only.
3. Add minimal Prisma schema and SQL migration/RLS for missing `login_log`, `presence_log` and `export_job` only; do not add `metric_daily`.
4. Add disabled-by-default logs analytics API runtime controller/contracts/repository.
5. Add explicit `rls_prisma_gateway` runtime using `createRlsTransactionContext`, restricted app role and transaction-scoped `app.org_id` / `app.tenant_id`.
6. Implement filtered login log, presence log and operation log readback; operation logs must read existing `audit_log`.
7. Implement fixed board values from existing runtime tables: confirmation queue pass rate, latest distill frequency/pass rate and AI member status counts.
8. Implement controlled export draft creation in `export_job`; it records scope/filter/status/ref metadata, returns owner-confirmation-required status, and never writes or references a sensitive export file.
9. Add focused tests proving API wiring, disabled default, explicit RLS mode, missing-env failure, no bare Prisma bypass, filtered readback, board metrics, export draft governance and no `metric_daily`.
10. Add a true DB smoke runner proving same-tenant positive behavior and wrong-tenant/missing-context DB/RLS negatives.
11. Run required validation and record results.
12. Commit, push and open a PR with PR hygiene table.

## 通过条件

- Spec has all required fields from `docs/specs/README.md`.
- Evidence records start audit, implementation scope, validation, true DB/RLS status, acceptance mapping, boundaries and no sensitive data statement.
- `login_log`, `presence_log` and `export_job` exist in Prisma/schema SQL with tenant/org scope, forced RLS and select/insert grants only.
- `metric_daily` is not added.
- Default AppModule path is disabled/contract-safe and does not require `UZMAX_RLS_DATABASE_URL`.
- Explicit logs analytics DB runtime requires `UZMAX_RLS_DATABASE_URL` and rejects bare `prisma_gateway` mode.
- Runtime DB reads/writes use `createRlsTransactionContext`, restricted app role and transaction-scoped `app.org_id` / `app.tenant_id`.
- Login log filtered readback works by member/type/date/limit.
- Presence log filtered readback works by member/status/date/limit.
- Operation log filtered readback uses existing `audit_log` by module/type/date/limit.
- Fixed board derives confirmation pass rate, latest distill frequency/pass rate and AI member status counts from runtime tables.
- Export draft creation records `export_job` metadata with `formalExportWrite: false`, `requiresOwnerConfirmation: true`, controlled refs only and `fileRef: null`.
- True DB smoke proves same-tenant positive behavior and wrong-tenant/missing-context negative behavior using real DB/RLS if `UZMAX_RLS_DATABASE_URL` is available.
- Required validation passes or failures are honestly recorded.
- Source budget remains within changed source files <= 9, net source LOC <= 650, new source files <= 4 unless `large_change_exception` is explicitly declared.

## 失败分支

- If worktree/branch/root boundary differs: stop and report `BLOCKED`.
- If broad analytics aggregation requires `metric_daily`: stop and report why it belongs to a later analytics aggregation slice.
- If true DB smoke cannot run because `UZMAX_RLS_DATABASE_URL` is absent: record the missing-env blocker in evidence and keep the contract test proving the runner/runtime requires `UZMAX_RLS_DATABASE_URL`.
- If tests require admin UI wiring, Playwright API-backed admin runtime, worker/cron aggregation, broad BI, export file creation, real customer/order data, external provider calls, production deploy or M5R-07 scope: stop and split to later M5R specs.
- If raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets appear: stop, clean up and create or reference incident evidence before continuing.
- If validation fails from this slice, fix within allowed files; do not weaken tests or expand mocks to pass.

## 不做什么

- No `metric_daily`, broad BI/reporting warehouse, saved analysis view, dashboard redesign or admin UI runtime wiring.
- No Playwright API-backed admin closure; that remains M5R-07.
- No worker/cron analytics aggregation, production Redis/worker/cron deployment or production export pipeline.
- No real export file creation, raw CSV/JSONL file, sensitive file ref, raw message scan, customer/order plaintext, real customer data or real order data.
- No real LLM calls, customer LLM, external SaaS onboarding, GA-0, M6, production readiness, M5 owner acceptance or 1.0 release claim.
- No automatic knowledge/config/profile/eval/template/customer-profile write.
- No M5 owner acceptance status update.

## 验收映射

| Item | M5R-05 status | Notes |
|---|---|---|
| I-06 | `logs_analytics_runtime_supported_not_admin_wired` | Runtime API/DB source supports fixed board and controlled export draft; admin runtime wiring remains M5R-07. |
| I-07 | `login_presence_operation_logs_runtime_supported_not_full_logs_center_closed` | Login/presence tables and `audit_log` readback support log center runtime; full visible logs center closure remains M5R-07/M5R-08. |
| H-07 | `distill_health_board_source_read_supported_not_new_distill_runtime` | Reads existing `distill_health_daily`; no new distill scheduler behavior. |
| J-05 | `m5r_05_runtime_evidence_added_not_owner_accepted` | This evidence records M5R-05 only; no M5 owner acceptance or release signoff. |
| K-03 | `active` | One spec / one PR; current branch implements only M5R-05. |
| K-04 | `active` | Worker worktree/branch/touch list are scoped; schema/migration/RLS are globally serial for this worker. |

M5R-05 closes no production acceptance item. It only proves the logs/analytics runtime source and controlled export draft path for later admin wiring and final integration closeout.
