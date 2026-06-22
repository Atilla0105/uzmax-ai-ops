# M4-18 Customer Asset Prisma Gateway

## 目标

为 M4 客户资产主流程交付最小 Prisma delegate gateway contract：新增 `PrismaCustomerAssetPersistenceGateway`，用 Prisma-shaped delegates 读取 customer asset tables，并将结果交给 M4-17 `CustomerAssetPersistenceGateway` / `PersistenceCustomerAssetRepository` mapper。本 spec 不默认启用 Prisma provider、不创建 PrismaClient、不读取 env、不连接或写入真实数据库、不改 schema/migration/generated client、不实现 RLS transaction wrapper、审计日志持久化、历史会话/订单/报价/工单聚合 runtime、admin UI、worker 或生产发布关闭。

## Owner

Owner：确认本切片只作为 B-01/D-04/D-05/D-07/I-01 的 Prisma delegate gateway contract foundation，不代表客户资产中心完整 DB runtime、RLS transaction wrapper、审计持久化、历史会话/订单/报价/工单回查聚合、真实客户数据或 1.0 发布验收关闭。Owner 仍负责真实 DB 连接配置、客户数据、生产配置、合规风险和最终发布决策。

AI agent：只在 `/Users/atilla/Documents/uzmax-m4-18-customer-asset-prisma-gateway` / `codex/m4-18-customer-asset-prisma-gateway` 执行；复核 no default Prisma provider、no env/secrets、no PrismaClient、no raw customer/order data、selected-tenant delegate scope、restore update scope、PR hygiene、worker boundary 和 M4 evidence index 同步。

## 时间盒

0.5 个工作日。若 Prisma delegate gateway contract 无法在预算内通过 focused Node test、type/lint/guard/check validation，则关闭或拆小；不得夹带生产 DB env wiring、schema/migration、RLS transaction wrapper、admin UI、审计持久化、历史聚合、真实客户样例或外部系统 connector 继续推进。

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M4-18-customer-asset-prisma-gateway.md`
  - `docs/evidence/M4/M4-18-customer-asset-prisma-gateway.md`
  - `docs/evidence/M4/README.md`
  - `apps/api/src/app.module.ts`
  - `apps/api/src/customer-asset.prisma-gateway.ts`
  - `scripts/tests/m4-customer-asset-prisma-gateway.test.mjs`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：不得触碰 `packages/db/prisma/**`、`packages/db/migrations/**`、`apps/admin/**`、`apps/worker/**`、`packages/capabilities/**`、package/lock/config、真实客户样例、root/main checkout 或其他 worktree。
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source 预算：changed source files <= 2、net source LOC <= 220、new source files <= 1。
- test/generated/lock/config/docs 预计变更：新增 1 个 focused Node test；新增 spec/evidence；同步 M4 evidence README；不改 DB schema/migration/generated client、admin UI、worker、lockfile、config 或 package。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：`rg -n "PrismaCustomerAsset|CustomerAssetPrisma|customer asset Prisma|customerAsset.*Prisma|Prisma.*CustomerAsset" apps packages scripts docs/specs docs/evidence/M4` 显示当前只有 M4-17 generic persistence gateway，没有 customer asset Prisma delegate adapter；order import 已有 `PrismaOrderImportPersistenceGateway` pattern。因此新增 `apps/api/src/customer-asset.prisma-gateway.ts` 专门承载 customer asset Prisma-shaped delegate contract，避免挤压 M4-17 mapper 文件长度；`app.module.ts` 只增加 type-only contract anchor，不默认启用 runtime provider。
- 外部 API/SDK/provider/connector/adapter 依据：Prisma dependency/generated client and customer asset models already exist in repo schema/package lock; this PR imports no `@prisma/client` and creates no `PrismaClient`。不新增外部 API/SDK/provider/connector/adapter；不调用外部客户系统、订单 API 或真实 DB。
- 是否需要例外：无。

## 文档触发检查

- 结果：`none`。
- 判断依据：`docs/doc-gates.md`；本 slice 只增加 Prisma delegate gateway contract 和 M4 evidence，不新增 OpenAPI/generated DTO、production env validation、observability、runbook 或 release workflow。

## 前置条件

- 已读取 `AGENTS.md`、`docs/specs/README.md`、`docs/doc-gates.md`、`docs/evidence/M4/README.md`、M4-17 spec/evidence、v1.1 PRD REQ-T03/REQ-T13、技术架构 §3/§5/§12 customer asset/RLS/repository sections、后台设计 §4.3、验收矩阵 B-01/D-04/D-05/D-07/I-01、现有 order-import Prisma gateway pattern、customer asset persistence source/tests。
- Worktree / branch：预期物理 worktree `/Users/atilla/Documents/uzmax-m4-18-customer-asset-prisma-gateway`；branch `codex/m4-18-customer-asset-prisma-gateway`；禁止写入 `/Users/atilla/Documents/UZMAX智能运营` root/main checkout。
- 开工记录：
  - `pwd`: `/Users/atilla/Documents/uzmax-m4-18-customer-asset-prisma-gateway`
  - `git status --short --branch`: `## codex/m4-18-customer-asset-prisma-gateway`
  - `git branch --show-current`: `codex/m4-18-customer-asset-prisma-gateway`
- Worker boundary preflight：`UZMAX_ASSIGNED_WORKTREE=/Users/atilla/Documents/uzmax-m4-18-customer-asset-prisma-gateway UZMAX_PRIMARY_ROOT=/Users/atilla/Documents/UZMAX智能运营 npm run guard:worker-boundary` passed with `worker-write-boundary: ok`.
- 并发派发证据：无并发 worker。M4 evidence README 是所有 M4 slice 的共享触碰点，且 customer asset API source files 与本 slice 独占，因此本 slice 串行执行。本 branch 从 latest `main@ee47e29` 创建，open PR 为 `[]`，root/main clean，未合并分支为空。
- 事故触发器：若发现跨任务污染、写到分配 worktree 外、错分支/main 直接提交、secret/customer-data 边界擦边、gate 绕过、同一过程失败在一个里程碑内重复出现，停止并创建或引用 `docs/incidents/` 记录。

## 实施步骤

1. 新增 `CustomerAssetPrismaClientPort` 与 `PrismaCustomerAssetPersistenceGateway`，包裹 customer asset Prisma-shaped delegates。
2. Delegate methods 覆盖 customers、customer detail child tables、field/tag definitions、restore flag update。
3. 所有 delegate calls 带 org/tenant scope；customer restore update 使用 scoped compound key。
4. `AppModule` 只增加 type-only contract anchor；默认 provider 仍为 `InMemoryCustomerAssetRepository`。
5. 新增 focused Node test 覆盖 delegate calls、scope/orderBy/take、restore update data、no env/no PrismaClient/no default provider boundary。
6. 同步 M4 evidence README，运行 validation chain，记录结果并提交 PR。

## 通过条件

- Prisma gateway 使用 customer asset schema model delegate names：`customer`、`customerIdentity`、`customFieldDefinition`、`customerFieldValue`、`tagDefinition`、`tagAssignment`。
- 所有 list/get/update delegates 带 selected tenant scope；restore update 使用 `{ id_orgId_tenantId: { id, orgId, tenantId } }`。
- `AppModule` 默认仍使用 in-memory repository；本 PR 不读取 env、不创建 PrismaClient、不连接 DB。
- Focused test 覆盖 Prisma delegate contract、no raw/no env/no default runtime wiring boundary。
- Evidence file 记录 validation table、scope notes 和 no raw data/no production DB runtime boundary。

## 失败分支

- 若需要真实 DB connection、env validation、RLS transaction wrapper、schema/migration、generated client commit、admin UI、worker queue、history/order/quote/ticket aggregation runtime、real customer data 或 external connector：停止并拆到后续 scoped spec。
- 若出现 raw customer/order samples、phone/address/payment/order IDs、Telegram usernames、credentials/env/secrets：停止、清理本 worker 改动并进入 incident/cleanup path。
- 若 AppModule 默认启用 Prisma provider、delegate scope 缺 org/tenant 或 restore update 不使用 scoped key：不得合并，修正为 fail-closed contract。
- 若 validation 失败且无法在 scope 内修复：提交 blocked evidence 或关闭/重开更小 spec；不得降低断言、删测试或扩大 mock。

## 不做什么

- 不新增外部 API adapter/provider/connector、DB schema/migration/generated client、PrismaClient provider、API route、admin UI/client、worker runtime、RLS transaction wrapper、audit persistence、history/order/quote/ticket aggregation runtime、field/tag management save、feature flag、production config 或 real customer sample。
- 不读取 `process.env`、不默认调用 `global fetch`、不连接或写入真实数据库、不提交 raw/export/jsonl/csv/xlsx 文件、真实客户明文、电话号码、地址、支付信息、订单号、截图、Telegram payload、LLM prompt/completion、env 或 secret。
- 不关闭 B-01/D-04/D-05/D-07/I-01 的 full SQL/RLS runtime/UI/E2E/audit persistence/aggregation acceptance；只提供 Prisma delegate gateway contract foundation。

## 验收映射

| Item | Status | Notes |
|---|---|---|
| B-01 | `prisma_gateway_supported_not_closed` | Adds tenant-scoped Prisma delegate contract; full SQL/RLS transaction evidence remains future scope. |
| D-04 | `prisma_gateway_supported_not_closed` | Adds DB delegate gateway for customer details, identities, fields and tags; real history/order/quote/ticket aggregation runtime remains future scope. |
| D-05 | `prisma_gateway_supported_not_closed` | Restore flag updates can target a scoped customer delegate; real audit persistence/admin owner flow remains future scope. |
| D-07 | `prisma_gateway_supported_not_closed` | Field/tag definition and assignment delegates are covered; conversation tags, admin config and analysis reuse remain future scope. |
| I-01 | `partial_customer_asset_api_runtime_not_closed` | Adds API DB delegate gateway foundation for future customer workflow; full desktop core workflow with runtime data remains future scope. |

## Closeout / Incident 记录

- Incident：none found in this spec execution at authoring time。
- Closeout evidence target: `docs/evidence/M4/M4-18-customer-asset-prisma-gateway.md`。
