# M4-11 Order Import Prisma Gateway

## 目标

为 ADR-B02 no-API 分支交付最小订单导入 DB client wiring foundation：把 `OrderImportRepositoryPort` 改为 async-compatible，并新增 `PrismaOrderImportPersistenceGateway`，用既有 `@prisma/client` generated delegate names 读取 `import_job`、`import_row_error`、`order_snapshot` 后交给 M4-08 `PersistenceOrderImportRepository` mapper。本 spec 不默认启用 Prisma provider、不读取 env、不连接真实数据库、不写 DB、不改 schema/migration、不实现 worker queue、admin API client、外部订单 API connector、真实订单数据或 AI runtime。

## Owner

Owner：确认本切片只作为 E-02/E-03/E-04 的 Prisma gateway contract foundation，不代表生产 DB runtime、RLS transaction wrapper、env wiring、真实导入样例、worker queue、admin-to-API E2E、AI runtime/eval 或 1.0 发布验收关闭。Owner 仍负责真实 DB 连接配置、客户/订单数据、生产配置、LLM key、成本和合规风险决策。

AI agent：只在 `/Users/atilla/Documents/uzmax-m4-11-order-import-prisma-gateway` / `codex/m4-11-order-import-prisma-gateway` 执行；复核 no default Prisma provider, no env/secrets, no DB connection/write, no external order API/no `order_connector`, tenant scope, stale handoff compatibility, async API service compatibility, PR hygiene, worker boundary 和 M4 evidence index 同步。

## 时间盒

0.5 个工作日。若 async repository port / Prisma gateway contract 无法在预算内通过 focused Node test、type/lint/guard/check validation，则关闭或拆小；不得夹带生产 DB env wiring、schema/migration、queue runtime、admin UI、真实导入样例或外部 API connector 继续推进。

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M4-11-order-import-prisma-gateway.md`
  - `docs/evidence/M4/M4-11-order-import-prisma-gateway.md`
  - `docs/evidence/M4/README.md`
  - `apps/api/src/order-import.repository.ts`
  - `apps/api/src/order-import.service.ts`
  - `apps/api/src/app.module.ts`
  - `scripts/tests/m4-order-import-repository-port.test.mjs`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：不得触碰 `packages/db/**`、`packages/capabilities/**`、`apps/worker/**`、`apps/admin/**`、`packages/engine/**`、package/lock/config、generated/dist、真实导入样例、root/main checkout 或其他 worktree。
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source 预算：changed source files <= 3、net source LOC <= 320、new source files <= 0。
- test/generated/lock/config/docs 预计变更：扩展 M4-08 repository-port focused Node test，加入 M4-11 Prisma gateway coverage，并更新既有 adapter assertions 以 await async-compatible port；新增 spec/evidence；同步 M4 evidence README；不改 DB schema/migration/generated client、admin UI、lockfile、config 或 package。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：无新增 source 文件。`rg -n "PrismaClient|@prisma/client|OrderImportRepository|PersistenceOrderImportRepository|DATABASE_URL|process\\.env|order_snapshot|import_job|import_row_error" package.json package-lock.json packages apps scripts/tests docs/specs/M4-*.md docs/evidence/M4` 显示 `packages/db` / `authz` 已依赖 Prisma，M4-08 已有 persistence gateway port/mapper，但 API order-import 仍没有 Prisma delegate adapter；因此就地扩展 `apps/api/src/order-import.repository.ts`、service 与 app module anchor，不新增平行 source 文件。
- 外部 API/SDK/provider/connector/adapter 依据：Prisma dependency and generated client are already present in `packages/db/package.json`, `package-lock.json`, `packages/db/prisma/schema.prisma`, and local `@prisma/client` generated types. 本 PR 不新增新外部 API/SDK/provider/connector/adapter，不调用外部订单 API；`order_connector` remains absent。
- 是否需要例外：无。

## 文档触发检查

- 结果：`none`。
- 判断依据：`docs/doc-gates.md`；本 slice 用 spec/evidence/M4 README 记录 Prisma gateway contract foundation，不新增 OpenAPI/generated DTO/runbook/production runtime。

## 前置条件

- 已读取 `AGENTS.md`、`docs/specs/README.md`、`docs/doc-gates.md`、`docs/evidence/M4/README.md`、`docs/adr/ADR-B02-order-api.md`、M4-07/M4-08/M4-10 spec/evidence、v1.1 PRD REQ-T04、后台设计 §4.4、技术架构 §8/§10、验收矩阵 E-02/E-03/E-04/J-02/I-01、现有 API order-import repository/service/app module/tests。
- ADR-B02 当前分支为 `no_api_for_m4__import_snapshot_main_path`；本 spec 不实现订单 API connector，不新增 `order_connector`，不调用或模拟外部 API。
- Worktree / branch：预期物理 worktree `/Users/atilla/Documents/uzmax-m4-11-order-import-prisma-gateway`；branch `codex/m4-11-order-import-prisma-gateway`；禁止写入 `/Users/atilla/Documents/UZMAX智能运营` root/main checkout。
- 开工记录：
  - `pwd`: `/Users/atilla/Documents/uzmax-m4-11-order-import-prisma-gateway`
  - `git status --short --branch`: `## codex/m4-11-order-import-prisma-gateway`
  - `git branch --show-current`: `codex/m4-11-order-import-prisma-gateway`
- Worker boundary preflight：`UZMAX_ASSIGNED_WORKTREE=/Users/atilla/Documents/uzmax-m4-11-order-import-prisma-gateway UZMAX_PRIMARY_ROOT=/Users/atilla/Documents/UZMAX智能运营 npm run guard:worker-boundary` passed with `worker-write-boundary: ok`.
- 并发派发证据：无并发 worker。本 branch 从 latest `main@ce9405a` 创建，open PR 为 `[]`，root/main clean，未合并分支为空。
- 事故触发器：若发现跨任务污染、写到分配 worktree 外、错分支/main 直接提交、secret/customer-data 边界擦边、gate 绕过、同一过程失败在一个里程碑内重复出现，停止并创建或引用 `docs/incidents/` 记录。

## 实施步骤

1. 将 `OrderImportRepositoryPort` 与 `OrderImportPersistenceGateway` 改为 async-compatible，保留 in-memory sync behavior。
2. 在 `OrderImportService` 中 `await` repository calls，保持 controller/API behavior 不变。
3. 新增 `PrismaOrderImportPersistenceGateway`：包裹既有 Prisma delegates，不创建 client、不读 env、不默认注入 AppModule。
4. 在 `AppModule` 只增加 contract anchor，默认 provider 仍是 `InMemoryOrderImportRepository`。
5. 新增 focused Node test 覆盖 Prisma delegate calls、tenant scoped where、snapshot lookup mapping、async repository compatibility、no env/no default provider/no order connector。
6. 同步 M4 evidence README，运行 validation chain，记录结果并提交 PR。

## 通过条件

- API service 可 await async-compatible repository，M4-07/M4-08 behavior 继续通过。
- Prisma gateway 使用 `importJob`、`importRowError`、`orderSnapshot` delegate names，所有查询带 org/tenant scope。
- Snapshot lookup 至少支持 `order_ref`/`external_ref` -> `externalOrderRef` 与 `batch_ref` -> `externalBatchRef`；unsupported query kind fail closed by returning no snapshot.
- `AppModule` 默认仍使用 in-memory repository；本 PR 不读取 env、不创建 PrismaClient、不连接 DB。
- Focused test 覆盖 DB client gateway contract、stale handoff compatibility、no API/no raw/no env/no default runtime wiring boundary。
- Evidence file 记录 validation table、scope notes 和 no raw data/no API/no production DB runtime boundary。

## 失败分支

- 若需要真实 DB connection、env validation、RLS transaction wrapper、schema/migration、generated client commit、worker queue、admin UI、real import files 或 external order API：停止并拆到后续 scoped spec。
- 若出现 raw order/customer samples、phone/address/payment/order IDs、credentials/env/secrets：停止、清理本 worker 改动并进入 incident/cleanup path。
- 若 AppModule 默认启用 Prisma provider 或 service 绕过 tenant scope：不得合并，修正为 fail-closed contract。
- 若 validation 失败且无法在 scope 内修复：提交 blocked evidence 或关闭/重开更小 spec；不得降低断言、删测试或扩大 mock。

## 不做什么

- 不新增 `order_connector`、外部 API adapter/provider/connector、DB schema/migration、generated client、admin UI/client、API route、BullMQ/Redis runtime、Storage downloader、feature flag、production config、real file upload 或 XLSX import。
- 不读取 `process.env`、不创建 `new PrismaClient()`、不连接或写入真实数据库、不提交 raw/export/jsonl/csv/xlsx 文件、真实客户明文、电话号码、地址、支付信息、订单号、截图、Telegram payload、LLM prompt/completion、env 或 secret。
- 不关闭 E-02/E-03/E-04/J-02/I-01 的 DB production runtime/queue/admin E2E/AI acceptance；只提供 Prisma gateway contract foundation。

## 验收映射

| Item | Status | Notes |
|---|---|---|
| E-01 | `not_current_blocker__no_api_for_m4` | No `order_connector` or external API connector added. |
| E-02 | `prisma_gateway_supported_not_closed` | Adds DB client gateway contract for import jobs/errors/snapshot lookup; production DB runtime, queue and admin E2E remain future scope. |
| E-03 | `prisma_gateway_supported_not_closed` | Gateway returns expiry/source fields through existing repository mapper; persisted/runtime warning still requires production DB/runtime evidence. |
| E-04 | `prisma_gateway_supported_not_closed` | Repository still feeds order-read handoff/no-fabrication path; AI eval/runtime integration remains future scope. |
| J-02 | `not_closed` | No real queue/retry/idempotency runtime is added. |
| I-01 | `partial_api_runtime_not_closed` | Adds API DB gateway foundation for future order workflow; full desktop core workflow remains future scope. |

## Closeout / Incident 记录

- Incident：none found in this spec execution at authoring time。
- Closeout evidence target: `docs/evidence/M4/M4-11-order-import-prisma-gateway.md`。
