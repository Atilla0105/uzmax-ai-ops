# M4-26 Order Import RLS Batch Runner Contract

## 目标

为 ADR-B02 no-API import snapshot path 补齐 M4-25 `OrderImportRlsTransactionRunner` 的最小调用方 runner contract：新增一个 Prisma-shaped batch `$transaction([...])` runner factory，按 ADR-001 顺序把 `set local role`、`set_config('app.org_id', ...)`、`set_config('app.tenant_id', ...)` 和业务查询 operation 放入同一个 batch transaction。本 spec 只定义 contract-only batch runner，不读取 env、不创建 PrismaClient、不连接真实 DB、不默认启用真实 DB provider、不新增依赖/lockfile、不调用网络、不新增 `order_connector`、不提交真实或原始订单数据。

实现必须避免通过 `async` gateway wrapper 在 `$transaction([...])` 前提前 await Prisma delegate；RLS gateway 只能把 raw Prisma-shaped operation 交给 batch runner，并在 transaction 返回后执行可选 mapper。

本 spec 不关闭 production DB runtime、admin E2E、BullMQ/Redis、真实 parser、真实导入样例、DB client wiring、AI runtime/eval 或 release acceptance。

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner：确认本切片只把 M4-25 的 RLS transaction gateway contract 接到一个可测试的 Prisma-shaped batch runner contract，不代表真实 PrismaClient 注入、生产 DB runtime、真实 RLS SQL integration、worker queue、admin E2E、真实客户/订单数据、LLM key、成本、合规或 1.0 发布验收关闭。

AI agent：只在 `/Users/atilla/Documents/uzmax-m4-26-order-import-rls-batch-runner` / `codex/m4-26-order-import-rls-batch-runner` 执行；复核 batch `$transaction([...])` operation order, fail-closed malformed client/context/query, default AppModule remains in-memory/no default RLS runner, no env/secrets, no PrismaClient, no DB connection/write, no external API/no `order_connector`, no BullMQ/Redis dependency/runtime, PR hygiene, worker boundary evidence, incident cleanup 和 M4 evidence index 同步。

## 时间盒

0.5 个工作日。若 runner contract 无法在预算内通过 focused Node tests、type/lint/guards/check validation，则关闭或拆小；不得夹带真实 DB env wiring、schema/migration、queue runtime、admin UI/E2E、真实导入样例或外部 API connector 继续推进。

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M4-26-order-import-rls-batch-runner-contract.md`
  - `docs/evidence/M4/M4-26-order-import-rls-batch-runner-contract.md`
  - `docs/evidence/M4/README.md`
  - `docs/incidents/INC-2026-06-23-m4-26-root-write-boundary.md`
  - `apps/api/src/order-import.persistence-gateway.ts`
  - `apps/api/src/order-import.rls-runner.ts`
  - `apps/api/src/order-import.repository.ts`
  - `apps/api/src/order-import.ts`
  - `apps/api/src/app.module.ts`
  - `apps/api/scripts/runtime-compiler.mjs`
  - `scripts/tests/m4-order-import-rls-batch-runner-contract.test.mjs`
  - `scripts/tests/m4-order-import-api-shell.test.mjs`
  - `scripts/tests/m4-order-import-repository-port.test.mjs`
  - `scripts/tests/m4-order-import-rls-transaction-gateway-contract.test.mjs`
  - `scripts/tests/m4-order-import-runtime-provider-contract.test.mjs`
  - `scripts/tests/m4-order-import-runtime-warning-contract.test.mjs`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：`order-import.repository.ts` / `order-import.ts` 只允许导出或复用 M4-25 runner input/client port；`order-import.persistence-gateway.ts` 只允许承载既有 Prisma/RLS persistence gateway 与 raw operation helpers；`app.module.ts` 只允许增加 type/value contract anchor，不允许注册默认 provider；`runtime-compiler.mjs` 只允许为 runtime loader 增加 TS import mapping。额外测试文件只允许同步 module loader/static assertions for the gateway split。不得触碰 `packages/db/**`、`packages/capabilities/**`、`apps/worker/**`、`apps/admin/**`、`packages/engine/**`、package/lock/config、generated/dist、真实导入样例、root/main checkout 或其他 worktree。
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source 预算：changed source files <= 6、net source LOC <= 260、new source files <= 2。
- test/generated/lock/config/docs 预计变更：新增 1 个 focused Node test；同步 existing order-import loader/static contract tests for the gateway split；新增 spec/evidence/incident；同步 M4 evidence README；不改 DB schema/migration/generated client、admin UI、worker、lockfile、package 或 dependency config。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：`rg -n "OrderImportRlsTransactionInput|OrderImportRlsTransactionRunner|Prisma-shaped|batch transaction|\\$executeRawUnsafe|\\$queryRaw|\\$transaction|set_config|RlsBatch|rls-runner|order-import.rls|PrismaOrderImportPersistenceGateway|RlsOrderImportPersistenceGateway|new PrismaClient|@prisma/client|process\\.env|fetch\\(|https?://|order_connector|BullMQ|Redis" apps/api/src scripts/tests docs/specs/M4-*.md docs/evidence/M4 docs/adr/ADR-001-rls-prisma-pool.md docs/adr/ADR-B02-order-api.md package.json package-lock.json packages/db/src packages/db/prisma/schema.prisma` shows M4-25 has the `OrderImportRlsTransactionRunner` gateway contract and ADR-001 documents batch `$transaction([...])`, but there is no order import RLS batch runner implementation or source home. A new `apps/api/src/order-import.rls-runner.ts` keeps the batch runner contract separate from provider wiring and avoids default runtime side effects. A new `apps/api/src/order-import.persistence-gateway.ts` is a same-domain split of existing Prisma/RLS gateway classes so raw operation helpers can be added without pushing `order-import.repository.ts` over the ESLint max-lines guard; it does not add a parallel provider or new capability.
- 外部 API/SDK/provider/connector/adapter 依据：ADR-001 accepted path for Prisma batch `$transaction([...])` with `SET LOCAL ROLE` and `set_config(..., true)`, plus M4-25 runner input contract. This PR does not add a new external API/SDK/provider/connector/adapter dependency, does not import `@prisma/client`, does not instantiate `PrismaClient`, and does not call external order APIs; `order_connector` remains absent.
- 是否需要例外：无。

## 文档触发检查

- 结果：`none`。
- 判断依据：`docs/doc-gates.md`；本 slice uses spec/evidence/M4 README for a contract-only RLS batch runner, and does not add OpenAPI/generated DTO/runbook/production runtime docs trigger.

## 前置条件

- 已读取 `AGENTS.md`、`docs/specs/README.md`、`docs/doc-gates.md`、`docs/evidence/M4/README.md`、`docs/adr/ADR-001-rls-prisma-pool.md`、`docs/adr/ADR-B02-order-api.md`、`docs/specs/M4-25-order-import-rls-transaction-gateway-contract.md`、`docs/evidence/M4/M4-25-order-import-rls-transaction-gateway-contract.md`、`apps/api/src/order-import.repository.ts`、`apps/api/src/app.module.ts`、existing M4 order import RLS/runtime provider tests 和 `apps/api/scripts/runtime-compiler.mjs`。
- ADR-B02 当前分支为 `no_api_for_m4__import_snapshot_main_path`；本 spec 不实现订单 API connector，不新增 `order_connector`，不调用或模拟外部 API。
- Root/main full local worker boundary preflight is blocked by existing untracked duplicate docs in `/Users/atilla/Documents/UZMAX智能运营`:
  - `docs/adr/ADR-B02-order-api 2.md`
  - `docs/adr/README 2.md`
  - `docs/evidence/M4/README 2.md`
  - `docs/evidence/M4/spikes 2/SPK-02-order-saas-api/manifest.md`
  - `docs/specs/SPK-02-order-api 2.md`
- Because those files pre-existed this worker and may be user-retained local files, this spec does not delete them. Implementation uses absolute assigned worktree paths; CI-mode worker boundary and manual root tracked/index clean evidence are recorded.

## Worktree / branch 前置条件

- Worktree / branch：预期物理 worktree `/Users/atilla/Documents/uzmax-m4-26-order-import-rls-batch-runner`；branch `codex/m4-26-order-import-rls-batch-runner`；禁止写入 `/Users/atilla/Documents/UZMAX智能运营` root/main checkout。
- 开工记录：
  - `pwd`: `/Users/atilla/Documents/uzmax-m4-26-order-import-rls-batch-runner`
  - `git status --short --branch`: `## codex/m4-26-order-import-rls-batch-runner`
  - `git branch --show-current`: `codex/m4-26-order-import-rls-batch-runner`
  - `git rev-parse HEAD`: `6b51e38cbd137de4a7a6024f27b36bc8432e838c`
  - remote main at planning time: `6b51e38cbd137de4a7a6024f27b36bc8432e838c`
- Worker boundary evidence:
  - Full local guard result: `root_write_boundary_incident_then_root_untracked_duplicate_docs_block_full_local_preflight`; see `docs/incidents/INC-2026-06-23-m4-26-root-write-boundary.md` for the root write incident and cleanup.
  - After incident detection, `CI=true UZMAX_ASSIGNED_WORKTREE=/Users/atilla/Documents/uzmax-m4-26-order-import-rls-batch-runner UZMAX_PRIMARY_ROOT=/Users/atilla/Documents/UZMAX智能运营 npm run guard:worker-boundary` must pass assigned-worktree check.
  - Manual root tracked/index clean evidence is required before PR/merge; existing untracked duplicate docs remain out of scope.

## 并发派发证据

Single implementation worker after incident cleanup. This spec touches shared API order-import contract files, AppModule and M4 docs/tests, so no parallel implementation worker is safe. Coordinator may dispatch read-only spec compliance and code quality reviewers after implementation because they do not write files.

## 事故与 closeout 记录

- Incident：`docs/incidents/INC-2026-06-23-m4-26-root-write-boundary.md` records an M4-26 subagent writing draft files to root/main instead of the assigned worktree. Implementation proceeds only after migrating reviewed patches to the assigned worktree and cleaning root/main tracked/index state.
- Existing local blocker：root/main contains the five untracked duplicate docs listed in the preconditions; this blocks full local worker-boundary enforcement but was not written by this M4-26 worktree implementation.
- Closeout evidence target: `docs/evidence/M4/M4-26-order-import-rls-batch-runner-contract.md`。

## 实施步骤

1. Export or reuse the M4-25 `OrderImportRlsTransactionInput` type so the runner factory can consume the same context/query contract.
2. Add `apps/api/src/order-import.rls-runner.ts` with a Prisma-shaped client port that extends/uses `OrderImportPrismaClientPort` and requires `$executeRawUnsafe(sql: string)`, `$queryRaw` tag support and `$transaction(operations)`.
3. Implement `createOrderImportRlsBatchTransactionRunner(prisma)` so it validates required Prisma-shaped raw/transaction methods before returning and before use.
4. Inside the runner, validate `input.context.roleSql`, `input.context.settings`, and `input.query`; call `input.query(prisma)` to obtain the raw Prisma-shaped business operation; pass operations to `$transaction` in exact order: role SQL, org `set_config`, tenant `set_config`, business query; return the final transaction result or apply `input.mapResult` after the transaction.
5. Use only `input.context.roleSql` and `input.context.settings`; do not reconstruct org/tenant from env or other globals.
6. Keep RLS gateway reads on raw Prisma-shaped operation helpers so nullable row mapping happens after the batch transaction, not through pre-transaction `async` wrappers.
7. Add AppModule type/value anchor for the batch runner factory/client contract without default provider registration or default runtime switch.
8. Add focused Node test using stubs only: operation ordering in one `$transaction`, business result return, RLS gateway raw operation + post-transaction mapper path, fail-closed malformed client/context/query before transaction, AppModule default remains in-memory/no default RLS runner, and static forbidden runtime/API/dependency strings remain absent in source.
9. Update M4 evidence file and M4 README without claiming production DB runtime/admin E2E/BullMQ/Redis closeout.

## 通过条件

- `createOrderImportRlsBatchTransactionRunner(prisma)` produces a runner that calls one Prisma-shaped batch `$transaction([...])` with operations ordered role SQL -> org `set_config` -> tenant `set_config` -> business query.
- Returned runner result is the business query result from the final transaction element.
- RLS persistence gateway uses raw Prisma-shaped operation helpers and optional post-transaction result mapping, so async nullable wrappers are not the business operation passed to the runner.
- Malformed Prisma-shaped client, malformed/synthetic unsafe role SQL, malformed settings context, missing org/tenant settings or invalid query operation fail closed before `$transaction`.
- AppModule default provider remains in-memory and does not register/use the RLS batch runner as a default provider.
- This PR does not read env, instantiate PrismaClient, import `@prisma/client`, connect/write DB, add `order_connector`, call network/fetch, add BullMQ/Redis dependency/runtime, modify schema/migration/generated client, package/lock/config, or submit raw customer/order data.
- Evidence file records validation table, incident cleanup, boundary notes and no production DB runtime/admin E2E/BullMQ/Redis closure.

## 失败分支

- 若需要真实 DB connection、env validation、PrismaClient provider、schema/migration、generated client commit、worker queue、admin UI/E2E、real import files 或 external order API：停止并拆到后续 scoped spec。
- 若 Prisma batch runner cannot be expressed without importing `@prisma/client`, reading env or default-enabling runtime wiring：停止并 record blocked evidence; do not create a hidden runtime provider.
- 若出现 raw order/customer samples、phone/address/payment/order IDs、credentials/env/secrets：停止、清理本 worker 改动并进入 incident/cleanup path。
- 若 root/main cannot be cleaned back to tracked/index clean after the boundary incident：stop M4-26 and keep only cleanup/incident evidence; do not continue implementation.
- 若 validation 失败且无法在 scope 内修复：提交 blocked evidence 或关闭/重开更小 spec；不得降低断言、删测试或扩大 mock。

## 不做什么

- 不新增 `order_connector`、外部 API adapter/provider/connector、DB schema/migration、generated client、DB env/runtime default provider、worker queue、admin visible UI/E2E、AI runtime/eval、feature flag、production config 或 real CSV/XLSX import。
- 不读取 `process.env`、不创建 `new PrismaClient()`、不连接或写入真实数据库、不提交 raw/export/jsonl/csv/xlsx、真实客户明文、电话号码、地址、支付信息、订单号、截图、Telegram payload、LLM prompt/completion、env 或 secret。
- 不删除 root/main 中既有未跟踪 duplicate docs；后续若 owner 确认可清理，应单独 cleanup。
- 不关闭 E-02/E-03/E-04/J-02/I-01 的生产 DB/runtime、queue/admin E2E、真实导入样例、AI runtime/eval 或 release acceptance。

## 验收映射

| Item | Status | Notes |
|---|---|---|
| B-01 | `rls_batch_runner_contract_supported_not_closed` | Adds a Prisma-shaped ADR-001 batch transaction runner contract for order import reads; full SQL/RLS unauthorized integration evidence remains future scope. |
| E-01 | `not_current_blocker__no_api_for_m4` | No `order_connector` or external API connector added. |
| E-02 | `rls_batch_runner_contract_supported_not_closed` | Completes the M4-25 runner call-site contract with a batch runner contract; real DB client runtime, parser, queue and admin E2E remain future scope. |
| E-03 | `runtime_provider_contract_supported_not_closed` | Future DB-backed stale/missing warning path can run behind explicit RLS transaction mode and batch runner contract; persisted warning, real DB/runtime and E2E stale sample evidence remain future scope. |
| E-04 | `foundation_supported_not_closed` | No AI runtime/eval is added; no fabricated order status path is added. |
| J-02 | `queue_runtime_not_closed` | No real BullMQ/Redis runtime, retry execution, idempotent storage locks or backlog alerting added. |
| I-01 | `partial_api_runtime_not_closed` | API module has a contract anchor for the batch runner; full desktop order/customer workflow with runtime data remains future scope. |
