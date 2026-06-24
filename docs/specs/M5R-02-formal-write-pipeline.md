# M5R-02 Formal Write Pipeline

## 目标

Add the minimal runtime proof path for formal writes after confirmation, using exactly one named target path: `confirmation_item` approved/edited decision -> `config_version` active version -> `audit_log` event -> `confirmation_item.audit_log_id` plus target/status metadata.

This slice proves that only confirmed approved/edited decisions can write the named config/audit target path, while pending/discarded/blocked items never write. It does not implement full H-01 knowledge authoring, template copy runtime, eval publishing, AI member runtime control, distill scheduler, admin UI wiring or production release behavior.

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner: decide later whether to approve M5R-02 evidence, whether to proceed to later M5R slices, and any production, real customer/order-data, customer LLM, LLM key, cost, compliance, GA-0, M5 owner acceptance or 1.0 release decision.

AI agent: implement only this spec in the assigned worktree/branch, preserve tenant/RLS boundaries, use the existing `config_version`, `audit_log` and `confirmation_item` Prisma models/tables/RLS policies without schema or migration changes, prove true DB/RLS behavior when `UZMAX_RLS_DATABASE_URL` is available, record any missing-env blocker honestly, and keep M5/M5R status not owner accepted.

## 时间盒

0.7 个工作日. If implementation requires Prisma schema/migration/RLS policy changes, generated client, lockfile/shared config/CI/guard changes, admin UI, worker/cron/distill/template/eval/AI-member runtime expansion, or source budget overrun, stop and report before widening scope.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M5R-02-formal-write-pipeline.md`
  - `docs/evidence/M5R/M5R-02-formal-write-pipeline.md`
  - `docs/evidence/M5R/README.md`
  - `apps/api/src/confirmation-queue.formal-write-contracts.ts`
  - `apps/api/src/confirmation-queue.formal-write.ts`
  - `apps/api/src/confirmation-queue.prisma-mapper.ts`
  - `apps/api/src/confirmation-queue.service.ts`
  - `apps/api/src/confirmation-queue.types.ts`
  - `apps/api/src/app.module.ts`
  - `apps/api/scripts/runtime-compiler.mjs`
  - `scripts/tests/m5-confirmation-queue-api.test.mjs`
  - `scripts/tests/m5r-formal-write-pipeline.test.mjs`
  - `packages/db/scripts/run-m5r-formal-write-true-db-smoke.mjs`
  - `packages/db/scripts/tests/run-m5r-formal-write-true-db-smoke.mjs`
- 说明/备注：
  - Root/main checkout `/Users/atilla/Documents/UZMAX智能运营` is read-only coordination/audit only.
  - This PR may read `AGENTS.md`, M5R-00/M5R-01, M5-01/M5-03/M5-08 specs/evidence, Prisma schema/migrations and current API runtime files.
  - This PR must not touch `packages/db/prisma/schema.prisma`, `packages/db/migrations/**`, generated Prisma client, lockfile, shared config/CI/guards, `apps/admin`, `apps/worker`, `apps/cron`, `packages/distill`, `packages/evals`, `packages/ops-assets`, external providers/connectors/adapters or production/release docs.

## 变更预算与路径分类

- source budget target: changed source files <= 8, net source LOC <= 600, new source files <= 3.
- docs: this spec, M5R-02 evidence, M5R evidence README.
- source: confirmation queue formal-write contract helpers, formal-write orchestrator/runtime, service injection, AppModule provider wiring, queue item auditLogId mapping, and API runtime compiler cache support.
- test: affected M5-03 confirmation queue API harness update, one focused M5R-02 formal write contract test and true DB smoke support under `packages/db/scripts/tests`.
- generated/lock/config/schema/migration/admin/worker/cron/distill/evals/ops-assets/external provider/adapter: none.
- New source `rg` conclusion: searched current confirmation queue API/runtime, M5R-01 persistence paths, `formalWrite`, `config_version`, `audit_log`, `confirmation_item.auditLogId`, `createAuditLogContract`, `createConfigVersionContract`, `createRlsTransactionContext`, true DB smoke runners and runtime compiler paths. No formal-write orchestrator exists. The smallest source home is `apps/api/src/confirmation-queue.formal-write.ts` because the write is behind confirmation decisions and must reuse existing queue service/runtime patterns; pure target/contract helpers are split into `apps/api/src/confirmation-queue.formal-write-contracts.ts` to stay within file-length limits. The smoke CLI belongs under `packages/db/scripts/run-m5r-formal-write-true-db-smoke.mjs`; long synthetic DB/RLS assertions live under `packages/db/scripts/tests`.
- External API/SDK/provider/connector/adapter basis: none. Prisma usage relies on existing generated Prisma client/model and repo-local `createRlsTransactionContext`/`UZMAX_RLS_DATABASE_URL` runtime helpers, not a new external API.
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
- Read `docs/specs/M5-03-confirmation-queue-api.md`.
- Read `docs/evidence/M5/M5-03-confirmation-queue-api.md`.
- Read `docs/specs/M5-01-db-contract-foundation.md`.
- Read `docs/evidence/M5/M5-01-db-contract-foundation.md`.
- Read `docs/evidence/M5/README.md`.
- Read `docs/specs/M5-08-integration-smoke-closeout.md`.
- Read relevant current files under `apps/api/src/confirmation-queue.*`, `apps/api/src/app.module.ts`, `apps/api/scripts/runtime-compiler.mjs`.
- Read DB/RLS helpers and patterns: `packages/db/prisma/schema.prisma`, `packages/db/migrations/0002_audit_config_version_foundation.sql`, `packages/db/migrations/0007_m5_operations_contracts_foundation.sql`, `packages/db/src/index.ts`, `packages/db/src/prisma-runtime.ts`, `apps/api/src/audit-log.prisma-sink.ts`, `apps/api/src/customer-asset.runtime.ts` and M5R-01 true DB smoke runner.
- Confirm current `origin/main` is the M5R-01 merge base `824491dd2738c048f4a6812f02a222e592b34c98`.
- Record start audit in `docs/evidence/M5R/M5R-02-formal-write-pipeline.md` before source/test implementation edits.
- Keep M5 status not owner accepted; do not update M5 owner acceptance status.

## Worktree / branch 前置条件

| Fact | Expected |
|---|---|
| worktree | `/Users/atilla/Documents/uzmax-m5r-02-formal-write-pipeline` |
| branch | `codex/m5r-02-formal-write-pipeline` |
| base | `origin/main` at `824491dd2738c048f4a6812f02a222e592b34c98` |
| forbidden checkout | `/Users/atilla/Documents/UZMAX智能运营` |
| root/main checkout use | coordination/read-only only |
| required pre-edit evidence | `pwd`, `git status --short --branch`, `git branch --show-current`, worker `HEAD`, worker `origin/main`, root/main status, open PR audit, root no-merged branch audit, worktree list and git-dir/common-dir isolation proof |

## 并发派发证据

M5R-02 is the only writer for this branch/worktree/spec. The assigned physical path and branch are unique. The touch list overlaps confirmation queue API/runtime paths, API runtime compiler support and `packages/db/scripts` smoke runner paths, so any parallel M5R worker touching confirmation queue API files, formal-write paths, shared runtime compiler paths or `packages/db` scripts must wait or show disjoint evidence. This slice does not touch global serial schema/migration/RLS policy/lockfile/shared config/CI/guard/generated/release gates.

## 事故与 closeout 记录

- Incident: none at start.
- If any write lands outside the assigned worktree, on root/main, on the wrong branch, in an unlisted path, or includes secret/customer-data boundary risk, stop and create or reference `docs/incidents/` before continuing.
- If validation proves schema/migration/admin/worker/cron/distill/template/eval/AI-member scope is required, stop and report rather than widening M5R-02.

## 实施步骤

1. Record start audit and baseline M5-03/M5R-01 focused test evidence.
2. Create this M5R-02 spec and evidence file, and add an M5R README index/status entry for M5R-02 only.
3. Add a confirmation formal-write pipeline port behind `ConfirmationQueueService`, defaulting to disabled/no formal writes so in-memory/no-RLS runtime still needs no DB env.
4. Add an explicit RLS Prisma formal-write pipeline for the named `config_version` + `audit_log` target path, using `createRlsTransactionContext`, restricted app runtime role and transaction-scoped `app.org_id` / `app.tenant_id`; approved/edited RLS decisions must commit status, config version, audit log and confirmation metadata atomically, or leave the item pending/unmodified.
5. Preserve M5-03/M5R-01 behavior for pending/discarded/blocked and default in-memory runtime.
6. Require `targetKind: "config_version"` and controlled `targetRef` before formal write; reject bare non-RLS Prisma mode.
7. Require side-by-side diff for conflict candidate approve/edit before decision and again before formal write.
8. Update confirmation item mapping so `auditLogId`, target ref and formal-write status metadata can round trip where the current schema supports it.
9. Add focused tests proving default disabled behavior, explicit RLS mode, missing-env failure, no bare Prisma bypass, RLS transaction settings, approved/edited config/audit writes, pending/discarded/blocked no-write behavior and conflict diff enforcement.
10. Add a true DB smoke runner proving same-tenant approved/edited formal writes create named config/audit target refs; pending/discarded/blocked do not; target refs are tenant-isolated; wrong-tenant/missing-context negatives are real DB/RLS negatives.
11. Run required validation and record results.
12. Commit, push and open a PR with PR hygiene table.

## 通过条件

- Spec has all required fields from `docs/specs/README.md`.
- Evidence records start audit, implementation scope, validation, true DB/RLS status, acceptance mapping, boundaries and no sensitive data statement.
- Default AppModule/in-memory path remains disabled for formal writes and does not require `UZMAX_RLS_DATABASE_URL`.
- Explicit formal-write runtime requires `UZMAX_RLS_DATABASE_URL` and rejects bare `prisma_gateway` mode.
- Formal-write runtime uses `createRlsTransactionContext`, restricted app role and transaction-scoped `app.org_id` / `app.tenant_id`.
- Existing M5-03 list/detail/approve/edit/discard/block API semantics remain intact in default runtime.
- Pending/discarded/blocked candidates never create `config_version` or `audit_log` rows.
- Approved/edited candidates write only the named `config_version` + `audit_log` target path and only when `targetKind` / `targetRef` name that path.
- Approved/edited RLS formal-write failures do not commit an approved/edited confirmation half-state without `auditLogId`.
- Conflict candidates require side-by-side diff before approve/edit and before formal write.
- Audit entry includes confirmer, diff and target ref.
- Confirmation item records `auditLogId`, `targetKind`, `targetRef` and formal-write status metadata where the current schema supports it.
- True DB smoke proves same-tenant positive behavior and wrong-tenant/missing-context negative behavior using real DB/RLS, not repository-only filters, if `UZMAX_RLS_DATABASE_URL` is available.
- Required validation passes or failures are honestly recorded.
- Source budget remains within changed source files <= 8, net source LOC <= 600, new source files <= 3.

## 失败分支

- If worktree/branch/root boundary differs: stop and report `BLOCKED`.
- If current DB contract is insufficient and schema/migration/RLS changes are required: stop and report `BLOCKED` with evidence; do not add schema/migration in M5R-02.
- If true DB smoke cannot run because `UZMAX_RLS_DATABASE_URL` is absent: record the missing-env blocker in evidence and keep the contract test proving the runner/runtime requires `UZMAX_RLS_DATABASE_URL`.
- If source budget exceeds target: stop and report with proposed split.
- If tests require admin UI, worker/cron, distill scheduler, broad H-01 authoring, template copy runtime, eval publishing, AI-member runtime control, external provider calls, production deploy or real customer/order data: stop and split to later M5R specs.
- If raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets appear: stop, clean up and create or reference incident evidence before continuing.
- If validation fails from this slice, fix within allowed files; do not weaken tests or expand mocks to pass.

## 不做什么

- No Prisma schema, migration, RLS policy, generated client, lockfile, shared config/CI/guard, admin UI, worker, cron, distill scheduler, template copy runtime, eval publishing, AI-member runtime control or production/release gate changes.
- No full H-01 knowledge facts/journeys/stages/materials authoring, media upload, broad config center, eval set publish, template copy, customer profile write or customer-profile merge.
- No real customer data, real order data, real LLM calls, customer LLM, external SaaS onboarding, production Redis/worker deployment, GA-0, M6, production readiness, M5 owner acceptance or 1.0 release claim.
- No raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets.
- No M5 owner acceptance status update.

## 验收映射

| Item | M5R-02 status | Notes |
|---|---|---|
| H-01 | `limited_config_formal_write_supported_not_full_h01_closed` | Minimal config-version proof path only; full knowledge facts/journeys/stages/materials authoring remains future scope. |
| H-02 | `formal_write_gate_supported_for_named_config_path` | Approved/edited decisions can write only the named `config_version` + `audit_log` path; pending/discarded/blocked cannot write. |
| H-03 | `diff_required_before_named_formal_write` | Conflict candidate side-by-side diff is required before approve/edit and rechecked before formal write. |
| I-02 | `api_runtime_formal_write_supported_not_admin_closed` | Runtime API/service path supports later mobile/admin fallback; admin runtime wiring remains M5R-07. |
| J-05 | `m5r_02_runtime_evidence_added_not_owner_accepted` | This evidence records M5R-02 only; no M5 owner acceptance or release signoff. |
| K-03 | `active` | One spec / one PR; current branch implements only M5R-02. |
| K-04 | `active` | Worktree/branch/touch list are scoped; schema/migration/global gates remain untouched. |

M5R-02 closes no production acceptance item. It only proves a minimal confirmation-backed formal write path for a named config/audit target.
