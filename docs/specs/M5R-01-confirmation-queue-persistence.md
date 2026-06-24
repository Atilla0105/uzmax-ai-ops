# M5R-01 Confirmation Queue Persistence

## 目标

Put a Prisma/RLS-backed runtime repository behind the M5-03 confirmation queue API so confirmation candidates and decisions can persist in the existing `confirmation_item` table.

This slice preserves the M5-03 controller/service API contract and default in-memory runtime, adds an explicit RLS Prisma runtime repository, proves true DB create/list/detail/approve/edit/discard/block plus tenant isolation, and keeps every decision as `formalWrite: false`.

M5R-01 does not implement the M5R-02 formal write pipeline and does not write formal knowledge, config, profile, eval or template targets.

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner: decide later whether to approve M5R-01 evidence, whether to proceed to M5R-02 formal write pipeline, and any production, real customer/order-data, customer LLM, LLM key, cost, compliance, GA-0, M5 owner acceptance or 1.0 release decision.

AI agent: implement only this spec in the assigned worktree/branch, preserve tenant/RLS boundaries, use the existing `confirmation_item` Prisma model/table/RLS policy without schema or migration changes, prove true DB/RLS runtime behavior when `UZMAX_RLS_DATABASE_URL` is available, record any missing-env blocker honestly, and keep M5/M5R status not owner accepted.

## 时间盒

0.7 个工作日. If implementation requires Prisma schema/migration changes, admin/worker/cron/distill/formal-write target changes, lockfile/shared config/CI/guard changes, or source budget overrun, stop and report before widening scope.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M5R-01-confirmation-queue-persistence.md`
  - `docs/evidence/M5R/M5R-01-confirmation-queue-persistence.md`
  - `docs/evidence/M5R/README.md`
  - `apps/api/src/confirmation-queue.prisma-mapper.ts`
  - `apps/api/src/confirmation-queue.repository.ts`
  - `apps/api/src/confirmation-queue.runtime.ts`
  - `apps/api/src/confirmation-queue.service.ts`
  - `apps/api/src/app.module.ts`
  - `apps/api/scripts/runtime-compiler.mjs`
  - `scripts/tests/m5-confirmation-queue-api.test.mjs`
  - `scripts/tests/m5r-confirmation-queue-persistence.test.mjs`
  - `packages/db/scripts/run-m5r-confirmation-queue-true-db-smoke.mjs`
  - `packages/db/scripts/tests/run-m5r-confirmation-queue-true-db-smoke.mjs`
- 说明/备注：
  - Root/main checkout `/Users/atilla/Documents/UZMAX智能运营` is read-only coordination/audit only.
  - This PR may read `AGENTS.md`, M5R-00, M5-03, M5-01, M4 RLS runtime/smoke patterns, Prisma schema/migration and current API source.
  - This PR must not touch `packages/db/prisma/schema.prisma`, `packages/db/migrations/**`, generated Prisma client, lockfile, shared config/CI/guards, `apps/admin`, `apps/worker`, `apps/cron`, `packages/distill`, formal write targets, raw samples, external providers/connectors/adapters or production/release docs.

## 变更预算与路径分类

- source budget target: changed source files <= 8, net source LOC <= 600, new source files <= 3.
- docs: this spec, M5R-01 evidence, M5R evidence README.
- source: confirmation queue repository/runtime/service wiring, Prisma mapper, `app.module.ts`, runtime compiler cache path, and a thin true DB smoke CLI wrapper under `packages/db/scripts`.
- test: existing M5-03 confirmation queue API test update, one focused M5R-01 persistence/runtime contract test, and true DB smoke support implementation under `packages/db/scripts/tests`.
- generated/lock/config/schema/migration/admin/worker/cron/distill/formal-write targets/external provider/adapter: none.
- New source `rg` conclusion: searched current confirmation queue API, M5-01 DB contracts, `confirmation_item` Prisma/migration, M4 RLS runtime/smoke patterns, `UZMAX_RLS_DATABASE_URL`, `createRlsTransactionContext` and runtime compiler paths. Existing confirmation queue runtime is in-memory only; the existing DB contract already contains `confirmation_item` model/table/RLS policy. New runtime source belongs in `apps/api/src/confirmation-queue.runtime.ts`; Prisma enum/row mapping is split into `apps/api/src/confirmation-queue.prisma-mapper.ts` to keep ordinary source files within line budgets; the executable smoke command belongs in `packages/db/scripts/run-m5r-confirmation-queue-true-db-smoke.mjs`; its long synthetic true DB assertions live under `packages/db/scripts/tests` as validation support.
- External API/SDK/provider/connector/adapter basis: none. Prisma usage relies on existing generated Prisma client/model and repo-local `createRlsTransactionContext`/`UZMAX_RLS_DATABASE_URL` runtime helpers, not a new external API.
- Exceptions: none. No `large_change_exception` and no `test_weakening_exception`.

## 文档触发检查

updated

## 前置条件

- Read `AGENTS.md`.
- Read `docs/specs/README.md`.
- Read `docs/specs/M5R-00-runtime-integration-plan.md`.
- Read `docs/evidence/M5R/README.md`.
- Read `docs/specs/M5-03-confirmation-queue-api.md`.
- Read `docs/evidence/M5/M5-03-confirmation-queue-api.md`.
- Read `docs/specs/M5-01-db-contract-foundation.md`.
- Read `docs/evidence/M5/M5-01-db-contract-foundation.md`.
- Read relevant current files under `apps/api/src/confirmation-queue.*`, `apps/api/src/app.module.ts`, `apps/api/scripts/runtime-compiler.mjs`.
- Read DB/RLS helpers and patterns: `packages/db/src/index.ts`, `packages/db/src/prisma-runtime.ts`, `apps/api/src/order-import.rls-runner.ts`, `apps/api/src/order-import.runtime.ts`, `apps/api/src/customer-asset.runtime.ts`, and relevant M4 true DB smoke scripts/tests using `UZMAX_RLS_DATABASE_URL`.
- Confirm current `origin/main` is the M5R-00 merge base `5218fa85410f123094b8c5b02f9b2f52366d1e25`.
- Record start audit in `docs/evidence/M5R/M5R-01-confirmation-queue-persistence.md` before source/test implementation edits.
- Keep M5 status not owner accepted; do not update M5 owner acceptance status.

## Worktree / branch 前置条件

| Fact | Expected |
|---|---|
| worktree | `/Users/atilla/Documents/uzmax-m5r-01-confirmation-queue-persistence` |
| branch | `codex/m5r-01-confirmation-queue-persistence` |
| base | `origin/main` at `5218fa85410f123094b8c5b02f9b2f52366d1e25` |
| forbidden checkout | `/Users/atilla/Documents/UZMAX智能运营` |
| root/main checkout use | coordination/read-only only |
| required pre-edit evidence | `pwd`, `git status --short --branch`, `git branch --show-current`, worker `HEAD`, worker `origin/main`, root/main status, open PR audit, root no-merged branch audit, worktree list and git-dir/common-dir isolation proof |

## 并发派发证据

M5R-01 is the only writer for this branch/worktree/spec. The assigned physical path and branch are unique. The touch list overlaps confirmation queue API/runtime paths and a `packages/db/scripts` smoke runner, so any parallel M5R worker touching confirmation queue API files, shared runtime compiler paths or `packages/db` scripts must wait or show disjoint evidence. This slice does not touch global serial schema/migration/RLS policy/lockfile/shared config/CI/guard/generated/release gates.

## 事故与 closeout 记录

- Incident: none at start.
- If any write lands outside the assigned worktree, on root/main, on the wrong branch, in an unlisted path, or includes secret/customer-data boundary risk, stop and create or reference `docs/incidents/` before continuing.
- If validation proves schema/migration/formal-write/admin/worker/cron/distill scope is required, stop and report rather than widening M5R-01.

## 实施步骤

1. Record start audit and baseline M5-03 focused test evidence.
2. Create this M5R-01 spec and evidence file, and add an M5R README index/status entry for M5R-01 only.
3. Introduce a confirmation queue repository port behind `ConfirmationQueueService` while preserving in-memory default behavior.
4. Add an explicit Prisma/RLS runtime repository for existing `confirmation_item`, using `createRlsTransactionContext` and a restricted RLS transaction runner with `UZMAX_RLS_DATABASE_URL`.
5. Wire AppModule through a provider factory so default runtime stays in-memory and explicit env runtime can use the RLS Prisma gateway.
6. Update runtime compiler cache support for confirmation queue runtime modules.
7. Add focused tests proving default in-memory runtime, explicit RLS env mode, missing-env failure, no bare Prisma bypass, RLS transaction settings, M5-03 contract preservation and no formal writes.
8. Add a true DB smoke runner proving create/list/detail/approve/edit/discard/block, conflict diff enforcement, same-tenant positive behavior, wrong-tenant/missing-context negative behavior and cleanup.
9. Run required validation and record results.
10. Commit, push and open a PR with PR hygiene table.

## 通过条件

- Spec has all required fields from `docs/specs/README.md`.
- Evidence records start audit, implementation scope, validation, true DB/RLS status, acceptance mapping, boundaries and no sensitive data statement.
- Default AppModule path remains in-memory and does not require `UZMAX_RLS_DATABASE_URL`.
- Explicit confirmation queue DB runtime requires `UZMAX_RLS_DATABASE_URL` and rejects a bare non-RLS Prisma gateway mode.
- Runtime repository uses `createRlsTransactionContext`, restricted app role and transaction-scoped `app.org_id`/`app.tenant_id`.
- Existing M5-03 list/detail/approve/edit/discard/block API semantics remain intact.
- True DB smoke proves create/list/detail/approve/edit/discard/block for a selected tenant if `UZMAX_RLS_DATABASE_URL` is available.
- True DB smoke proves tenant isolation with same-tenant positive evidence plus wrong-tenant and missing-context negative evidence using real DB/RLS, not only repository filters.
- Conflict candidates still require side-by-side diff for approve/edit.
- Decision responses and persisted metadata still record `formalWrite: false`.
- No formal knowledge/config/profile/eval/template/customer-profile write occurs in this slice.
- Required validation passes or failures are honestly recorded.
- Source budget remains within changed source files <= 8, net source LOC <= 600, new source files <= 3.

## 失败分支

- If worktree/branch/root boundary differs: stop and report `BLOCKED`.
- If current DB contract is insufficient and schema/migration changes are required: stop and report `BLOCKED` with evidence; do not add schema/migration in M5R-01.
- If true DB smoke cannot run because `UZMAX_RLS_DATABASE_URL` is absent: record the missing-env blocker in evidence and keep the contract test proving the runner/runtime requires `UZMAX_RLS_DATABASE_URL`.
- If source budget exceeds target: stop and report with proposed split.
- If tests require admin UI, worker/cron, distill scheduler, formal write pipeline, external provider calls, production deploy or real customer/order data: stop and split to later M5R specs.
- If raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets appear: stop, clean up and create or reference incident evidence before continuing.
- If validation fails from this slice, fix within allowed files; do not weaken tests or expand mocks to pass.

## 不做什么

- No Prisma schema, migration, RLS policy, generated client, lockfile, shared config/CI/guard, admin, worker, cron, distill scheduler, formal write pipeline or production/release gate changes.
- No formal knowledge, config, profile, eval, template or customer-profile write.
- No real customer data, real order data, real LLM calls, customer LLM, external SaaS onboarding, production Redis/worker deployment, GA-0, M6, production readiness, M5 owner acceptance or 1.0 release claim.
- No raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets.
- No M5 owner acceptance status update.

## 验收映射

| Item | M5R-01 status | Notes |
|---|---|---|
| H-02 | `runtime_persistence_supported_not_formal_write_closed` | Confirmation queue decisions persist with `formalWrite: false`; M5R-02 must prove formal write gating. |
| H-03 | `runtime_diff_supported_not_formal_write_closed` | Conflict candidates still require side-by-side diff before approve/edit; formal target write remains future. |
| I-02 | `api_runtime_persistence_supported_not_admin_closed` | Runtime API repository can support later mobile/admin fallback; admin runtime wiring remains M5R-07. |
| J-05 | `m5r_01_runtime_evidence_added_not_owner_accepted` | This evidence records M5R-01 only; no M5 owner acceptance or release signoff. |
| K-03 | `active` | One spec / one PR; current branch implements only M5R-01. |
| K-04 | `active` | Worktree/branch/touch list are scoped; schema/migration/global gates remain untouched. |

M5R-01 closes no production acceptance item. It only persists the confirmation queue runtime loop while keeping formal writes disabled until a later explicitly scoped M5R-02 PR.
