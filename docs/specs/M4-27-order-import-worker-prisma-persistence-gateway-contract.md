# M4-27 Order Import Worker Prisma Persistence Gateway Contract

## 目标

为 ADR-B02 no-API import snapshot path 补齐 worker 写入侧的最小 Prisma-shaped persistence gateway contract：在 M4-12 `OrderImportWorkerPersistenceGateway` 抽象后新增一个 opt-in adapter，把 worker 生成的 `import_job`、`order_snapshot`、`import_row_error` draft 映射为 Prisma `create` / `createMany` delegate 调用。本 spec 只定义 worker-side Prisma-shaped write adapter，不读取 env、不创建 PrismaClient、不连接真实 DB、不默认启用生产 DB provider、不新增依赖/lockfile、不实现 BullMQ/Redis queue runtime、不新增 `order_connector`、不提交真实或原始订单数据。

本 spec 不关闭 production DB runtime、admin E2E、BullMQ/Redis、真实导入样例、DB client runtime wiring/RLS integration、AI runtime/eval 或 release acceptance。

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner：确认本切片只把 M4-12 worker persistence gateway 接到一个可测试的 Prisma-shaped write adapter contract，不代表真实 PrismaClient 注入、生产 DB runtime、RLS write integration、worker queue、admin E2E、真实客户/订单数据、LLM key、成本、合规或 1.0 发布验收关闭。

AI agent：只在 `/Users/atilla/Documents/uzmax-m4-27-order-import-worker-prisma-persistence` / `codex/m4-27-order-import-worker-prisma-persistence` 执行；复核 create/createMany delegate shape, deterministic persistence order through existing worker job, empty batch no-op, fail-closed malformed client/draft, no env/secrets, no PrismaClient, no DB connection/write, no external API/no `order_connector`, no BullMQ/Redis dependency/runtime, PR hygiene, worker boundary evidence 和 M4 evidence index 同步。

## 时间盒

0.5 个工作日。若 worker Prisma persistence gateway contract 无法在预算内通过 focused Node tests、type/lint/guards/check validation，则关闭或拆小；不得夹带真实 DB env wiring、schema/migration、queue runtime、admin UI/E2E、真实导入样例或外部 API connector 继续推进。

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M4-27-order-import-worker-prisma-persistence-gateway-contract.md`
  - `docs/evidence/M4/M4-27-order-import-worker-prisma-persistence-gateway-contract.md`
  - `docs/evidence/M4/README.md`
  - `apps/worker/src/main.ts`
  - `apps/worker/src/order-import-prisma-persistence.ts`
  - `scripts/tests/m4-worker-test-loader.mjs`
  - `scripts/tests/m4-order-import-worker-prisma-persistence-contract.test.mjs`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：不得触碰 `apps/api/**`、`apps/admin/**`、`packages/db/**` schema/migration/generated client、`packages/capabilities/**`、package/lock/config、真实导入样例、root/main checkout 或其他 worktree。
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source 预算：changed source files <= 2、net source LOC <= 180、new source files <= 1。
- test/generated/lock/config/docs 预计变更：新增 1 个 focused Node test；小改 worker test loader 以加载新 adapter module；新增 spec/evidence；同步 M4 evidence README；不改 DB schema/migration/generated client、API/admin、lockfile、config 或 package。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：`rg -n "OrderImportWorkerPersistenceGateway|PrismaOrderImportWorker|worker.*Prisma|createMany|persistOrderSnapshots|persistImportRowErrors|new PrismaClient|@prisma/client|process\\.env|fetch\\(|https?://|order_connector|BullMQ|Redis" apps/worker/src apps/api/src scripts/tests docs/specs/M4-*.md docs/evidence/M4 package.json package-lock.json packages/db/src packages/db/prisma/schema.prisma` 显示 M4-12 已有 worker persistence gateway ordering，M4-11/M4-25/M4-26 已有 API read-side Prisma/RLS contracts，但 worker 写入侧没有 Prisma-shaped adapter source home。新增 `apps/worker/src/order-import-prisma-persistence.ts` 复用既有 `OrderImportWorkerPersistenceGateway`，避免把 DB-shaped write adapter 挤入接近多职责的 `main.ts`，也不新增平行 worker/import pipeline。
- 外部 API/SDK/provider/connector/adapter 依据：Prisma dependency/generated schema model already exists in repo via `packages/db/prisma/schema.prisma` and prior M4 Prisma-shaped contracts; this PR imports no `@prisma/client`, creates no `PrismaClient`, adds no new external dependency/provider/connector, and calls no external order API; `order_connector` remains absent.
- 是否需要例外：无。

## 文档触发检查

- 结果：`none`。
- 判断依据：`docs/doc-gates.md`；本 slice uses spec/evidence/M4 README for a contract-only worker persistence adapter, and does not add OpenAPI/generated DTO/runbook/production runtime docs trigger.

## 前置条件

- 已读取 `AGENTS.md`、`docs/specs/README.md`、`docs/doc-gates.md`、`docs/evidence/M4/README.md`、`docs/adr/ADR-B02-order-api.md`、M4-09/M4-10/M4-12/M4-24/M4-25/M4-26 spec/evidence、`apps/worker/src/main.ts`、`apps/worker/src/order-import-dispatch.ts`、`packages/db/src/m4-order-import-contracts.ts`、order import Prisma schema/migration snippets、existing worker/import tests 和 API-side Prisma gateway/audit sink patterns。
- ADR-B02 当前分支为 `no_api_for_m4__import_snapshot_main_path`；本 spec 不实现订单 API connector，不新增 `order_connector`，不调用或模拟外部 API。
- `npm ci` passed in assigned worktree; npm audit reported existing 3 high severity vulnerabilities, not introduced by this spec。
- Root/main full local worker boundary preflight is blocked by existing untracked duplicate docs in `/Users/atilla/Documents/UZMAX智能运营`:
  - `docs/adr/ADR-B02-order-api 2.md`
  - `docs/adr/README 2.md`
  - `docs/evidence/M4/README 2.md`
  - `docs/evidence/M4/spikes 2/SPK-02-order-saas-api/manifest.md`
  - `docs/specs/SPK-02-order-api 2.md`
- Because those files pre-existed this worker and may be user-retained local files, this spec does not delete them. Implementation uses absolute assigned worktree paths; CI-mode worker boundary and manual root tracked/index clean evidence are recorded.

## Worktree / branch 前置条件

- Worktree / branch：预期物理 worktree `/Users/atilla/Documents/uzmax-m4-27-order-import-worker-prisma-persistence`；branch `codex/m4-27-order-import-worker-prisma-persistence`；禁止写入 `/Users/atilla/Documents/UZMAX智能运营` root/main checkout。
- 开工记录：
  - `pwd`: `/Users/atilla/Documents/uzmax-m4-27-order-import-worker-prisma-persistence`
  - `git status --short --branch`: `## codex/m4-27-order-import-worker-prisma-persistence`
  - `git branch --show-current`: `codex/m4-27-order-import-worker-prisma-persistence`
  - `git rev-parse HEAD`: `a11ee3528dfbfde070aaa1a27e38d7772ccde6c2`
  - local root/main at planning time: `a11ee3528dfbfde070aaa1a27e38d7772ccde6c2`
- Worker boundary evidence:
  - Full local guard result: `root_untracked_duplicate_docs_block_full_local_preflight` for the five duplicate docs listed above.
  - `CI=true UZMAX_ASSIGNED_WORKTREE=/Users/atilla/Documents/uzmax-m4-27-order-import-worker-prisma-persistence UZMAX_PRIMARY_ROOT=/Users/atilla/Documents/UZMAX智能运营 npm run guard:worker-boundary` passed assigned-worktree check.
  - Root tracked/index clean evidence before edits: `git status --short --branch --untracked-files=no` -> `## main...origin/main`; `git diff --quiet` passed; `git diff --cached --quiet` passed; `gh pr list --state open --json ...` -> `[]`.

## 并发派发证据

Single implementation worker. This spec touches `apps/worker/src/main.ts`, worker test loader and shared M4 docs, so no parallel implementation worker is safe. Coordinator may dispatch read-only spec compliance and code quality reviewers after implementation because they do not write files.

## 事故与 closeout 记录

- Incident：none introduced by this spec execution at authoring time。
- Existing local blocker：root/main contains the five untracked duplicate docs listed in the preconditions; this blocks full local worker-boundary enforcement but was not written by this M4-27 worker.
- Closeout evidence target: `docs/evidence/M4/M4-27-order-import-worker-prisma-persistence-gateway-contract.md`。

## 实施步骤

1. Add `apps/worker/src/order-import-prisma-persistence.ts` implementing `PrismaOrderImportWorkerPersistenceGateway` against a narrow `OrderImportWorkerPrismaPersistenceClientPort`.
2. Use `importJob.create({ data })` for import job drafts and `orderSnapshot.createMany({ data, skipDuplicates: true })` / `importRowError.createMany({ data, skipDuplicates: true })` for batch drafts.
3. Validate the Prisma-shaped client in constructor and before delegate use; validate draft inputs as records/arrays before delegate calls.
4. Treat empty snapshot/error draft arrays as no-op so valid empty batches do not depend on Prisma `createMany([])` behavior.
5. Re-export the adapter from worker main without default runtime wiring or PrismaClient construction.
6. Add focused Node test covering delegate shape/order through the existing worker job, empty batch no-op, malformed client/draft fail-closed, absence of env/DB/network/queue side effects, and M4 evidence mapping.
7. Update M4 evidence file and M4 README without claiming production DB runtime/admin E2E/BullMQ/Redis closeout.

## 通过条件

- Valid worker CSV text persistence job can use `PrismaOrderImportWorkerPersistenceGateway` and produce delegate calls ordered import job -> snapshots -> row errors.
- Import job delegate receives the exact worker import job draft as Prisma `create({ data })`.
- Snapshot/error delegates receive arrays through `createMany({ data, skipDuplicates: true })`.
- Empty snapshot/error arrays return without delegate calls.
- Malformed Prisma-shaped client, non-record import job draft, non-array batch draft or non-record batch item fail closed before delegate calls.
- This PR does not read env, instantiate PrismaClient, import `@prisma/client`, connect/write DB, add `order_connector`, call network/fetch, add BullMQ/Redis dependency/runtime, modify schema/migration/generated client, package/lock/config, or submit raw customer/order data.
- Evidence file records validation table, boundary notes and no production DB runtime/admin E2E/BullMQ/Redis closure.

## 失败分支

- 若需要真实 DB connection、env validation、PrismaClient provider、schema/migration、generated client commit、worker queue runtime、admin UI/E2E、real import files 或 external order API：停止并拆到后续 scoped spec。
- 若 adapter cannot be expressed without importing `@prisma/client`, reading env or default-enabling runtime wiring：停止并 record blocked evidence; do not create a hidden runtime provider.
- 若出现 raw order/customer samples、phone/address/payment/order IDs、credentials/env/secrets：停止、清理本 worker 改动并进入 incident/cleanup path。
- 若 validation 失败且无法在 scope 内修复：提交 blocked evidence 或关闭/重开更小 spec；不得降低断言、删测试或扩大 mock。

## 不做什么

- 不新增 `order_connector`、外部 API adapter/provider/connector、DB schema/migration、generated client、DB env/runtime default provider、real PrismaClient injection、worker queue runtime、admin visible UI/E2E、AI runtime/eval、feature flag、production config 或 real CSV/XLSX import。
- 不读取 `process.env`、不创建 `new PrismaClient()`、不连接或写入真实数据库、不提交 raw/export/jsonl/csv/xlsx、真实客户明文、电话号码、地址、支付信息、订单号、截图、Telegram payload、LLM prompt/completion、env 或 secret。
- 不删除 root/main 中既有未跟踪 duplicate docs；后续若 owner 确认可清理，应单独 cleanup。
- 不关闭 E-02/E-03/E-04/J-02/I-01 的生产 DB/runtime、queue/admin E2E、真实导入样例、AI runtime/eval 或 release acceptance。

## 验收映射

| Item | Status | Notes |
|---|---|---|
| E-01 | `not_current_blocker__no_api_for_m4` | No `order_connector` or external API connector added. |
| E-02 | `worker_prisma_persistence_gateway_contract_supported_not_closed` | Adds a worker-side Prisma-shaped write adapter for import job/snapshot/error drafts; production DB client runtime/RLS integration, parser, queue and admin E2E remain future scope. |
| E-03 | `foundation_supported_not_closed` | Worker write adapter preserves source/update/expiry fields from existing drafts; persisted warning runtime and E2E stale sample evidence remain future scope. |
| E-04 | `foundation_supported_not_closed` | No AI runtime/eval is added; no fabricated order status path is added. |
| J-02 | `queue_runtime_not_closed` | No real BullMQ/Redis runtime, retry execution, idempotent storage locks or backlog alerting added. |
| I-01 | `not_closed` | No admin E2E workflow is added. |
