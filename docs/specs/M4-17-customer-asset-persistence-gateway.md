# M4-17 Customer Asset Persistence Gateway

## 目标

为 M4 客户资产主流程交付最小 customer asset persistence-gateway contract：将 `CustomerAssetRepositoryPort` 改为 async-compatible，并新增 `PersistenceCustomerAssetRepository` / `CustomerAssetPersistenceGateway`，把 M4-02 customer asset DB contract rows 映射到 M4-14 API domain。本 spec 不默认启用真实 DB provider、不创建 Prisma client、不读取 env、不连接或写入真实数据库、不改 schema/migration、不实现审计日志持久化、历史会话/订单/报价/工单聚合 runtime、admin UI、worker 或生产发布关闭。

## Owner

Owner：确认本切片只作为 D-04/D-05/D-07/I-01 的 customer asset persistence-gateway contract foundation，不代表客户资产中心完整 DB runtime、RLS transaction wrapper、审计持久化、历史会话/订单/报价/工单回查聚合、字段/标签配置运营、真实客户数据或 1.0 发布验收关闭。Owner 仍负责真实客户数据、生产 DB 连接配置、字段/标签运营口径、合规风险和最终发布决策。

AI agent：只在 `/Users/atilla/Documents/uzmax-m4-17-customer-asset-persistence-gateway` / `codex/m4-17-customer-asset-persistence-gateway` 执行；复核 no default DB runtime、no env/secrets、no PrismaClient、no raw customer/order data、selected-tenant scope、restore save handoff、async service compatibility、PR hygiene、worker boundary 和 M4 evidence index 同步。

## 时间盒

0.5 个工作日。若 customer asset persistence-gateway contract 无法在预算内通过 focused Node test、type/lint/guard/check validation，则关闭或拆小；不得夹带真实 DB runtime、Prisma provider、schema/migration、admin UI、审计持久化、历史聚合、真实客户样例或外部系统 connector 继续推进。

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M4-17-customer-asset-persistence-gateway.md`
  - `docs/evidence/M4/M4-17-customer-asset-persistence-gateway.md`
  - `docs/evidence/M4/README.md`
  - `apps/api/src/app.module.ts`
  - `apps/api/src/customer-asset.persistence.ts`
  - `apps/api/src/customer-asset.repository.ts`
  - `apps/api/src/customer-asset.service.ts`
  - `scripts/tests/m4-customer-asset-api-shell.test.mjs`
  - `scripts/tests/m4-customer-asset-persistence-gateway.test.mjs`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：不得触碰 `packages/db/prisma/**`、`packages/db/migrations/**`、`apps/admin/**`、`apps/worker/**`、`packages/capabilities/**`、package/lock/config、真实客户样例、root/main checkout 或其他 worktree。
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source 预算：changed source files <= 4、net source LOC <= 520、new source files <= 1。
- test/generated/lock/config/docs 预计变更：新增 1 个 focused Node test；更新 M4-14 API shell test 以 await async-compatible service；新增 spec/evidence；同步 M4 evidence README；不改 DB schema/migration/generated client、admin UI、worker、lockfile、config 或 package。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：`rg -n "CustomerAssetPersistence|PersistenceCustomerAsset|CustomerAssetRepositoryPort|m4CustomerAssetContracts|customer asset persistence|customer-asset persistence" apps packages scripts docs/specs docs/evidence/M4` 显示当前只有 M4-02 DB contract helpers、M4-14 in-memory repository 和 M4-15/M4-16 admin foundations；没有 customer asset persistence gateway。由于 `customer-asset.repository.ts` 已接近文件职责边界，新增 `apps/api/src/customer-asset.persistence.ts` 专门承载 persistence gateway contract 与 row mapper；`app.module.ts` 只增加 type-only contract anchor，不默认启用 runtime provider。
- 外部 API/SDK/provider/connector/adapter 依据：不新增外部 API/SDK/provider/connector/adapter；只使用 repo 内既有 M4-02 `M4CustomerAssetContractInput` type；不调用外部客户系统、订单 API 或真实 DB。
- 是否需要例外：无。

## 文档触发检查

- 结果：`none`。
- 判断依据：`docs/doc-gates.md`；本 slice 只增加 persistence gateway contract 和 M4 evidence，不新增 OpenAPI/generated DTO、production env validation、observability、runbook 或 release workflow。

## 前置条件

- 已读取 `AGENTS.md`、`docs/specs/README.md`、`docs/doc-gates.md`、`docs/evidence/M4/README.md`、M4-14/M4-15/M4-16 spec/evidence、v1.1 PRD REQ-T03/REQ-T13、技术架构 customer asset/RLS/repository sections、后台设计 §4.3、验收矩阵 B-01/D-04/D-05/D-07/I-01、现有 order-import persistence gateway pattern、customer asset API source/tests。
- Worktree / branch：预期物理 worktree `/Users/atilla/Documents/uzmax-m4-17-customer-asset-persistence-gateway`；branch `codex/m4-17-customer-asset-persistence-gateway`；禁止写入 `/Users/atilla/Documents/UZMAX智能运营` root/main checkout。
- 开工记录：
  - `pwd`: `/Users/atilla/Documents/uzmax-m4-17-customer-asset-persistence-gateway`
  - `git status --short --branch`: `## codex/m4-17-customer-asset-persistence-gateway`
  - `git branch --show-current`: `codex/m4-17-customer-asset-persistence-gateway`
- Worker boundary preflight：`UZMAX_ASSIGNED_WORKTREE=/Users/atilla/Documents/uzmax-m4-17-customer-asset-persistence-gateway UZMAX_PRIMARY_ROOT=/Users/atilla/Documents/UZMAX智能运营 npm run guard:worker-boundary` passed with `worker-write-boundary: ok`.
- 并发派发证据：无并发 worker。M4 evidence README 是所有 M4 slice 的共享触碰点，且 customer asset API/service files 与本 slice 独占，因此本 slice 串行执行。本 branch 从 latest `main@0e28103` 创建，open PR 为 `[]`，root/main clean，未合并分支为空。
- 事故触发器：若发现跨任务污染、写到分配 worktree 外、错分支/main 直接提交、secret/customer-data 边界擦边、gate 绕过、同一过程失败在一个里程碑内重复出现，停止并创建或引用 `docs/incidents/` 记录。

## 实施步骤

1. 将 `CustomerAssetRepositoryPort` 改为 async-compatible，保留 in-memory sync behavior。
2. 新增 `CustomerAssetPersistenceGateway` 与 `PersistenceCustomerAssetRepository`，映射 customer、identity、custom field、tag definition/assignment contract rows。
3. 在 `CustomerAssetService` 中 await repository calls，保持 controller/API behavior 不变。
4. Restore action 仍只返回 audit draft，但通过 persistence gateway 保存 customer flag changes；不写真实 audit log。
5. 更新 M4-14 focused test 以覆盖 async-compatible service compatibility。
6. 新增 M4-17 focused Node test 覆盖 selected tenant scope、tag filter、detail refs、restore save handoff、invalid row fail-closed、no env/no PrismaClient/no default DB runtime boundary。
7. 同步 M4 evidence README，运行 validation chain，记录结果并提交 PR。

## 通过条件

- API service 可 await async-compatible repository，M4-14 API shell behavior 继续通过。
- Persistence gateway 输入输出使用 selected tenant scope；跨租户 rows 被过滤。
- Customer detail mapper 返回 controlled refs、identities、custom fields、tags；invalid contract row fail closed。
- Restore action 通过 gateway 保存 flag changes 并返回 audit draft；不实现真实 audit persistence。
- 本 PR 不读取 env、不创建 PrismaClient、不默认启用 DB provider、不改 schema/migration、不触碰 admin UI/worker。
- Evidence file 记录 validation table、scope notes 和 no raw data/no production DB runtime boundary。

## 失败分支

- 若需要真实 DB connection、env validation、RLS transaction wrapper、schema/migration、generated client commit、admin UI、worker queue、history/order/quote/ticket aggregation runtime、real customer data 或 external connector：停止并拆到后续 scoped spec。
- 若出现 raw customer/order samples、phone/address/payment/order IDs、Telegram usernames、credentials/env/secrets：停止、清理本 worker 改动并进入 incident/cleanup path。
- 若 persistence mapper 返回跨租户客户、restore 绕过 selected tenant scope 或 service 未正确 await repository：不得合并，修正为 fail-closed contract。
- 若 validation 失败且无法在 scope 内修复：提交 blocked evidence 或关闭/重开更小 spec；不得降低断言、删测试或扩大 mock。

## 不做什么

- 不新增外部 API adapter/provider/connector、DB schema/migration/generated client、PrismaClient provider、API route、admin UI/client、worker runtime、TanStack Query runtime、audit persistence、history/order/quote/ticket aggregation runtime、field/tag management save、feature flag、production config 或 real customer sample。
- 不读取 `process.env`、不默认调用 `global fetch`、不连接或写入真实数据库、不提交 raw/export/jsonl/csv/xlsx 文件、真实客户明文、电话号码、地址、支付信息、订单号、截图、Telegram payload、LLM prompt/completion、env 或 secret。
- 不关闭 B-01/D-04/D-05/D-07/I-01 的 full SQL/RLS runtime/UI/E2E/audit persistence/aggregation acceptance；只提供 persistence-gateway contract foundation。

## 验收映射

| Item | Status | Notes |
|---|---|---|
| B-01 | `persistence_gateway_supported_not_closed` | Adds selected-tenant repository mapper contract; full SQL/RLS transaction evidence remains future scope. |
| D-04 | `persistence_gateway_supported_not_closed` | Maps customer details, identities, fields, tags and controlled refs from DB contract rows; real history/order/quote/ticket aggregation runtime remains future scope. |
| D-05 | `persistence_gateway_supported_not_closed` | Restore flag changes can hand off to persistence gateway and still return audit draft; real audit persistence/admin owner flow remains future scope. |
| D-07 | `persistence_gateway_supported_not_closed` | Field/tag definitions and assignments map through gateway; conversation tags, admin config and analysis reuse remain future scope. |
| I-01 | `partial_customer_asset_api_runtime_not_closed` | Adds API repository gateway foundation for future customer workflow; full desktop core workflow with runtime data remains future scope. |

## Closeout / Incident 记录

- Incident：none found in this spec execution at authoring time。
- Closeout evidence target: `docs/evidence/M4/M4-17-customer-asset-persistence-gateway.md`。
