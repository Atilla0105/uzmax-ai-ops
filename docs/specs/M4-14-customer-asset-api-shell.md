# M4-14 Customer Asset API Shell

## 目标

为 M4 客户资产主流程交付最小 Nest API shell：租户内列出客户、查看客户详情、读取客户字段/标签定义，并提供黑名单/不可达恢复动作的 contract。本 spec 只做 API shell、in-memory repository、focused test 和 M4 evidence；不实现 admin UI、真实 DB runtime、Prisma client wiring、历史会话/订单/报价/工单聚合 runtime、conversation tag 配置、审计日志持久化、真实客户数据或生产发布关闭。

## Owner

Owner：确认本切片只作为 D-04/D-05/D-07/I-01 的 customer asset API-shell foundation，不代表客户资产中心完整 UI/E2E、真实 DB runtime、审计持久化、历史会话/订单/报价/工单回查、conversation tags/analysis filtering 或 1.0 发布验收关闭。Owner 仍负责真实客户数据、字段/标签运营口径、生产配置、合规风险和最终发布决策。

AI agent：只在 `/Users/atilla/Documents/uzmax-m4-14-customer-asset-api-shell` / `codex/m4-14-customer-asset-api-shell` 执行；复核 no raw customer/order data、no DB runtime/env/Prisma connection、tenant scope、permission fail-closed、restore audit draft、no admin UI、PR hygiene、worker boundary 和 M4 evidence index 同步。

## 时间盒

0.5 个工作日。若 customer asset API shell 无法在预算内通过 focused Node test、type/lint/guard/check validation，则关闭或拆小；不得夹带 admin UI、真实 DB runtime、Prisma client wiring、真实客户样例、历史聚合 runtime 或订单导入改动继续推进。

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M4-14-customer-asset-api-shell.md`
  - `docs/evidence/M4/M4-14-customer-asset-api-shell.md`
  - `docs/evidence/M4/README.md`
  - `apps/api/scripts/runtime-compiler.mjs`
  - `apps/api/src/app.module.ts`
  - `apps/api/src/customer-asset.controller.ts`
  - `apps/api/src/customer-asset.repository.ts`
  - `apps/api/src/customer-asset.service.ts`
  - `apps/api/src/customer-asset.types.ts`
  - `scripts/tests/m4-customer-asset-api-shell.test.mjs`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：不得触碰 `apps/admin/**`、`apps/worker/**`、`packages/db/prisma/**`、`packages/db/migrations/**`、`packages/capabilities/**`、package/lock/config、真实客户样例、root/main checkout 或其他 worktree。
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source 预算：changed source files <= 6、net source LOC <= 600、new source files <= 4。
- test/generated/lock/config/docs 预计变更：新增 1 个 focused Node test；新增 spec/evidence；同步 M4 evidence README；补充 API runtime compiler smoke harness 的 customer-asset module graph；不改 DB schema/migration/generated client、admin UI、worker、lockfile、config 或 package。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：`rg -n "customer-assets|CustomerAsset|customer asset|customers\\)|@Controller\\(\\\"customer|customer_identity|custom field|tag assignment|restore" apps/api/src apps/api/scripts scripts/tests docs/specs/M4-*.md docs/evidence/M4/*.md packages/db/src packages/capabilities` 显示当前只有 M4-02 customer asset DB contracts 与 docs/evidence，`apps/api/src` 尚无 customer asset API；同类 API 结构为 `conversation-ticket.*` 与 `order-import.*` split module。因此新增 `apps/api/src/customer-asset.*` 作为 customer asset API shell 归属，并在 `app.module.ts` 注册。
- 外部 API/SDK/provider/connector/adapter 依据：不新增外部 API/SDK/provider/connector/adapter；不读取真实客户系统；不调用订单 API。
- 是否需要例外：无。

## 文档触发检查

- 结果：`none`。
- 判断依据：`docs/doc-gates.md`；本 slice 增加 API shell 和 M4 evidence，不新增 OpenAPI/generated DTO、production env validation、observability、runbook 或 release workflow。

## 前置条件

- 已读取 `AGENTS.md`、`docs/specs/README.md`、`docs/doc-gates.md`、`docs/evidence/M4/README.md`、M4-02 spec/evidence、v1.1 PRD REQ-T03/REQ-T13、技术架构 §3/§5/§12、后台设计 §4.3、验收矩阵 D-04/D-05/D-07/I-01、现有 API module/test patterns。
- Worktree / branch：预期物理 worktree `/Users/atilla/Documents/uzmax-m4-14-customer-asset-api-shell`；branch `codex/m4-14-customer-asset-api-shell`；禁止写入 `/Users/atilla/Documents/UZMAX智能运营` root/main checkout。
- 开工记录：
  - `pwd`: `/Users/atilla/Documents/uzmax-m4-14-customer-asset-api-shell`
  - `git status --short --branch`: `## codex/m4-14-customer-asset-api-shell`
  - `git branch --show-current`: `codex/m4-14-customer-asset-api-shell`
- Worker boundary preflight：`UZMAX_ASSIGNED_WORKTREE=/Users/atilla/Documents/uzmax-m4-14-customer-asset-api-shell UZMAX_PRIMARY_ROOT=/Users/atilla/Documents/UZMAX智能运营 npm run guard:worker-boundary` passed with `worker-write-boundary: ok`.
- 并发派发证据：无并发 worker。M4 evidence README 是所有 M4 slice 的共享触碰点，因此本 slice 串行执行。本 branch 从 latest `main@f106126` 创建，open PR 为 `[]`，root/main clean，未合并分支为空。
- 事故触发器：若发现跨任务污染、写到分配 worktree 外、错分支/main 直接提交、secret/customer-data 边界擦边、gate 绕过、同一过程失败在一个里程碑内重复出现，停止并创建或引用 `docs/incidents/` 记录。

## 实施步骤

1. 新增 `customer-asset` API controller/service/repository/types，沿用 split module pattern。
2. 注册 `CustomerAssetController`、`CustomerAssetService`、`InMemoryCustomerAssetRepository` 到 `AppModule`。
3. API 支持 `GET /customer-assets/customers`、`GET /customer-assets/customers/:customerId`、`GET /customer-assets/field-definitions`、`GET /customer-assets/tag-definitions`、`POST /customer-assets/customers/:customerId/restore`。
4. 列表/详情/字段/标签/恢复动作按 selected tenant scope 过滤；无权限或缺 access context fail closed。
5. Restore action 只生成 audit draft 并更新 in-memory contract state；不写真实 audit log/DB。
6. 更新 API runtime compiler smoke harness，使既有 HTTP shell boot test 能转译新增 `customer-asset` module graph。
7. 新增 focused Node test 覆盖 tenant scope、permissions、detail aggregation、restore audit draft、HTTP error mapping、no raw/no DB runtime boundary 和 M4 evidence。

## 通过条件

- API shell 不读取 env/secrets、不连接 DB、不改 schema/migration、不触碰 admin UI/worker/order import。
- Customer list/detail/field/tag definitions 只返回 selected tenant 内的 controlled refs。
- Restore action 清除黑名单/不可达 flag，返回 audit draft；无权限、缺 access context、跨租户 customer 均 fail closed。
- Focused test 覆盖 AppModule registration/runtime compiler graph、no raw customer data/no runtime DB/no connector boundary 和 M4 evidence。

## 失败分支

- 若需要 Prisma client、真实 DB connection、RLS transaction wrapper、admin UI、history/order/quote/ticket aggregation runtime、conversation tags、analysis filtering、real customer data 或 production config：停止并拆到后续 scoped spec。
- 若出现 raw customer/order samples、phone/address/payment/order IDs、Telegram usernames、credentials/env/secrets：停止、清理本 worker 改动并进入 incident/cleanup path。
- 若 API 越权返回跨租户客户或 restore 绕过 `customer:write`：不得合并，修正为 tenant/permission fail-closed。
- 若 validation 失败且无法在 scope 内修复：提交 blocked evidence 或关闭/重开更小 spec；不得降低断言、删测试或扩大 mock。

## 不做什么

- 不新增真实 DB runtime、Prisma client provider、schema/migration、generated client、admin UI/client、worker、order import改动、conversation tag schema、analysis filtering、真实客户样例、raw exports、CSV/XLSX、截图、电话号码、地址、支付信息、Telegram username、env 或 secret。
- 不关闭 D-04/D-05/D-07/I-01 的 full UI/API/E2E/audit persistence/aggregation acceptance；只提供 API shell foundation。

## 验收映射

| Item | Status | Notes |
|---|---|---|
| B-01 | `api_shell_supported_not_closed` | Tenant-scoped API shell enforces selected tenant; full SQL/RLS integration evidence remains future scope. |
| D-04 | `api_shell_supported_not_closed` | Lists customers and returns detail with identities, fields, tags and controlled related refs; full history/order/quote/ticket aggregation UI/E2E remains future scope. |
| D-05 | `api_shell_supported_not_closed` | Restore action clears blacklist/unreachable in memory and returns audit draft; real audit persistence/admin owner flow remains future scope. |
| D-07 | `api_shell_supported_not_closed` | Field/tag definitions are readable through API shell; conversation tags, admin config and analysis reuse remain future scope. |
| I-01 | `partial_customer_asset_api_not_closed` | Adds API backing shape for future customer asset center; full desktop core workflow remains future scope. |

## Closeout / Incident 记录

- Incident：none found in this spec execution at authoring time。
- Closeout evidence target: `docs/evidence/M4/M4-14-customer-asset-api-shell.md`。
