# M4-23 Order Import Runtime Provider Contract

## 目标

为 ADR-B02 no-API 分支补齐订单导入 API 的最小 runtime repository provider contract：在 `AppModule` 中默认仍选择 in-memory repository，但通过显式 selector/factory 固化未来切换到 M4-11 `PrismaOrderImportPersistenceGateway` 的入口；当选择 Prisma gateway mode 却没有有效 Prisma client port 时必须 fail closed。本 spec 不读取 env、不创建 PrismaClient、不连接真实数据库、不改 schema/migration、不启用真实 DB provider、不实现 worker queue/admin E2E/外部订单 API/AI runtime。

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner：确认本切片只把 E-02/E-03 的 DB runtime wiring 前置 provider contract 固化为 M4 foundation，不代表生产 DB runtime、RLS transaction wrapper、env wiring、真实导入样例、worker queue、admin E2E、AI runtime/eval 或 1.0 发布验收关闭。Owner 仍负责真实 DB 连接配置、客户/订单数据、生产配置、LLM key、成本和合规风险决策。

AI agent：只在 `/Users/atilla/Documents/uzmax-m4-23-order-import-runtime-provider` / `codex/m4-23-order-import-runtime-provider` 执行；复核 default in-memory provider, explicit Prisma mode only, invalid Prisma client fail-closed, no env/secrets, no PrismaClient, no DB connection/write, no external order API/no `order_connector`, tenant scope, PR hygiene, worker boundary evidence 和 M4 evidence index 同步。

## 时间盒

0.5 个工作日。若 runtime repository provider contract 无法在预算内通过 focused Node test、type/lint/guard/check validation，则关闭或拆小；不得夹带生产 DB env wiring、schema/migration、queue runtime、admin UI/E2E、真实导入样例或外部 API connector 继续推进。

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M4-23-order-import-runtime-provider-contract.md`
  - `docs/evidence/M4/M4-23-order-import-runtime-provider-contract.md`
  - `docs/evidence/M4/README.md`
  - `apps/api/src/order-import.repository.ts`
  - `apps/api/src/app.module.ts`
  - `scripts/tests/m4-order-import-repository-port.test.mjs`
  - `scripts/tests/m4-order-import-runtime-provider-contract.test.mjs`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：不得触碰 `packages/db/**`、`packages/capabilities/**`、`apps/worker/**`、`apps/admin/**`、`packages/engine/**`、package/lock/config、generated/dist、真实导入样例、root/main checkout 或其他 worktree。
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source 预算：changed source files <= 2、net source LOC <= 180、new source files <= 0。
- test/generated/lock/config/docs 预计变更：新增 1 个 focused Node test，微调既有 M4-08/M4-11 provider assertions；新增 spec/evidence；同步 M4 evidence README；不改 DB schema/migration/generated client、admin UI、worker、lockfile、config 或 package。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：无新增 source 文件。`rg -n "OrderImportRepository|PersistenceOrderImportRepository|PrismaOrderImportPersistenceGateway|InMemoryOrderImportRepository|ORDER_IMPORT_REPOSITORY|PrismaClient|@prisma/client|DATABASE_URL|process\\.env|order_connector|create.*Repository|runtime.*provider|useFactory|useExisting" apps/api/src scripts/tests docs/specs/M4-*.md docs/evidence/M4 docs/adr/ADR-B02-order-api.md package.json package-lock.json packages/db/prisma/schema.prisma` 显示 M4-08 已有 repository port、M4-11 已有 Prisma delegate gateway，但 `AppModule` 仍直接 `useExisting` in-memory provider，缺少 fail-closed runtime provider selector；因此就地扩展 `apps/api/src/order-import.repository.ts` 与 `apps/api/src/app.module.ts`，不新增平行 source 文件。
- 外部 API/SDK/provider/connector/adapter 依据：Prisma dependency and generated client are already present in `packages/db/package.json`, `package-lock.json`, `packages/db/prisma/schema.prisma`, and local generated types. 本 PR 不新增新外部 API/SDK/provider/connector/adapter，不调用外部订单 API；`order_connector` remains absent。
- 是否需要例外：无。

## 文档触发检查

- 结果：`none`。
- 判断依据：`docs/doc-gates.md`；本 slice 用 spec/evidence/M4 README 记录 provider contract foundation，不新增 OpenAPI/generated DTO/runbook/production runtime。

## 前置条件

- 已读取 `AGENTS.md`、`docs/specs/README.md`、`docs/doc-gates.md`、`docs/evidence/M4/README.md`、`docs/adr/ADR-B02-order-api.md`、M4-08/M4-11/M4-21 spec/evidence、v1.1 PRD REQ-T04、后台设计 §4.4、技术架构 §2.1/§8/§10、验收矩阵 E-02/E-03/E-04/I-01、现有 API order-import repository/service/app module/tests。
- ADR-B02 当前分支为 `no_api_for_m4__import_snapshot_main_path`；本 spec 不实现订单 API connector，不新增 `order_connector`，不调用或模拟外部 API。
- 基线：`npm ci` passed；`npm test` passed 227 tests。`npm audit` reported existing 3 high severity vulnerabilities, not introduced by this spec。
- Root/main full local worker boundary preflight is blocked by existing untracked duplicate docs in `/Users/atilla/Documents/UZMAX智能运营`:
  - `docs/adr/ADR-B02-order-api 2.md`
  - `docs/adr/README 2.md`
  - `docs/evidence/M4/README 2.md`
  - `docs/evidence/M4/spikes 2/SPK-02-order-saas-api/manifest.md`
  - `docs/specs/SPK-02-order-api 2.md`
- Because those files pre-existed this worker and may be user-retained local files, this spec does not delete them. Implementation uses absolute assigned worktree paths; CI-mode worker boundary and manual root tracked/index clean evidence are recorded.

## Worktree / branch 前置条件

- Worktree / branch：预期物理 worktree `/Users/atilla/Documents/uzmax-m4-23-order-import-runtime-provider`；branch `codex/m4-23-order-import-runtime-provider`；禁止写入 `/Users/atilla/Documents/UZMAX智能运营` root/main checkout。
- 开工记录：
  - `pwd`: `/Users/atilla/Documents/uzmax-m4-23-order-import-runtime-provider`
  - `git status --short --branch`: `## codex/m4-23-order-import-runtime-provider`
  - `git branch --show-current`: `codex/m4-23-order-import-runtime-provider`
  - `git rev-parse HEAD`: `baca21803534553595cf5e7619bb25030b84919f`
- Worker boundary evidence:
  - Full local guard result: `root_untracked_duplicate_docs_block_full_local_preflight` for the five duplicate docs listed above.
  - `CI=true UZMAX_ASSIGNED_WORKTREE=/Users/atilla/Documents/uzmax-m4-23-order-import-runtime-provider UZMAX_PRIMARY_ROOT=/Users/atilla/Documents/UZMAX智能运营 npm run guard:worker-boundary` passed assigned-worktree check.
  - Root tracked/index clean evidence: `git status --short --branch --untracked-files=no` -> `## main...origin/main`; `git diff --quiet` passed; `git diff --cached --quiet` passed; no root `.git/index.lock`.

## 并发派发证据

Single implementation worker. This spec touches `apps/api/src/app.module.ts`, `apps/api/src/order-import.repository.ts` and shared M4 docs, so no parallel implementation worker is safe. Coordinator may dispatch read-only spec compliance and code quality reviewers after implementation because they do not write files.

## 事故与 closeout 记录

- Incident：none introduced by this spec execution at authoring time。
- Existing local blocker：root/main contains the five untracked duplicate docs listed in the preconditions; this blocks full local worker-boundary enforcement but was not written by this M4-23 worker.
- Closeout evidence target: `docs/evidence/M4/M4-23-order-import-runtime-provider-contract.md`。

## 实施步骤

1. In `apps/api/src/order-import.repository.ts`, add `orderImportRepositoryRuntimeModes`, `ORDER_IMPORT_PRISMA_CLIENT`, and `createOrderImportRepositoryProvider` selector。
2. Keep default selector mode as `in_memory`, returning the existing `InMemoryOrderImportRepository` behavior。
3. Add explicit `prisma_gateway` mode that wraps a valid `OrderImportPrismaClientPort` in `PrismaOrderImportPersistenceGateway` + `PersistenceOrderImportRepository`; missing/malformed Prisma client port must throw before use。
4. In `AppModule`, route `ORDER_IMPORT_REPOSITORY` through the selector while passing `orderImportRepositoryRuntimeModes.inMemory`; do not register Prisma provider as default。
5. Add focused Node test covering default in-memory provider, explicit Prisma delegate path, fail-closed invalid Prisma mode/client, no env/no PrismaClient/no order connector, and M4 evidence mapping。
6. Update M4 evidence README without claiming E-02/E-03/E-04/I-01 closeout。

## 通过条件

- AppModule default provider remains in-memory and M4-07/M4-08 API behavior remains compatible。
- Explicit `prisma_gateway` mode requires a valid Prisma client port and uses M4-11 `PrismaOrderImportPersistenceGateway` + M4-08 `PersistenceOrderImportRepository`。
- Missing/malformed Prisma client port and unsupported modes fail closed before repository use。
- This PR does not read env, instantiate PrismaClient, import `@prisma/client` into `apps/api`, connect/write DB, add `order_connector`, call network/fetch, modify schema/migration/generated client, or submit raw customer/order data。
- Evidence file records validation table, boundary notes and no production DB runtime/RLS transaction wrapper/admin E2E closure。

## 失败分支

- 若需要真实 DB connection、env validation、RLS transaction wrapper、schema/migration、generated client commit、worker queue、admin UI/E2E、real import files 或 external order API：停止并拆到后续 scoped spec。
- 若出现 raw order/customer samples、phone/address/payment/order IDs、credentials/env/secrets：停止、清理本 worker 改动并进入 incident/cleanup path。
- 若 AppModule 默认启用 Prisma provider 或 service 绕过 tenant scope：不得合并，修正为 fail-closed selector contract。
- 若 validation 失败且无法在 scope 内修复：提交 blocked evidence 或关闭/重开更小 spec；不得降低断言、删测试或扩大 mock。

## 不做什么

- 不新增 `order_connector`、外部 API adapter/provider/connector、DB schema/migration、generated client、DB env/runtime default provider、worker queue、admin visible UI/E2E、AI runtime/eval、feature flag、production config 或 real CSV/XLSX import。
- 不读取 `process.env`、不创建 `new PrismaClient()`、不连接或写入真实数据库、不提交 raw/export/jsonl/csv/xlsx、真实客户明文、电话号码、地址、支付信息、订单号、截图、Telegram payload、LLM prompt/completion、env 或 secret。
- 不删除 root/main 中既有未跟踪 duplicate docs；后续若 owner 确认可清理，应单独 cleanup。
- 不关闭 E-02/E-03/E-04/I-01 的生产 DB/runtime、queue/admin E2E、真实导入样例、AI runtime/eval 或 release acceptance。

## 验收映射

| Item | Status | Notes |
|---|---|---|
| E-01 | `not_current_blocker__no_api_for_m4` | No `order_connector` or external API connector added. |
| E-02 | `runtime_provider_contract_supported_not_closed` | Adds a fail-closed provider selector between current in-memory default and explicit Prisma gateway; real DB client runtime, RLS transaction wrapper, queue and admin E2E remain future scope. |
| E-03 | `runtime_provider_contract_supported_not_closed` | Keeps stale/missing warning path compatible with future DB-backed snapshots while refusing silent Prisma mode without a client; persisted warning, real DB/runtime and E2E stale sample evidence remain future scope. |
| E-04 | `foundation_supported_not_closed` | Repository selection remains code/data controlled; no AI runtime/eval integration or fabricated order status path is added. |
| I-01 | `partial_api_runtime_not_closed` | API module now has a runtime provider selector contract; full desktop order/customer workflow with runtime data remains future scope. |
