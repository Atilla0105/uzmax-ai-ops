# M4-15 Admin Customer Asset API Client Contract

## 目标

为 M4 客户资产主流程交付最小 admin-to-API bridge foundation：在 `apps/admin` 新增纯 `customerAssetApiClient`，以显式注入的 `fetcher` 调用既有 M4-14 `/customer-assets/customers`、`/customer-assets/customers/:customerId`、`/customer-assets/field-definitions`、`/customer-assets/tag-definitions` 和 `/customer-assets/customers/:customerId/restore` 合同，并校验 list/detail/config/restore response shape。本 spec 不改可见 UI runtime、不默认调用 `global fetch`、不连接真实 API/DB、不导入后端包、不实现真实客户资产页面、审计持久化、历史聚合、字段/标签配置、真实客户数据或生产发布关闭。

## Owner

Owner：确认本切片只作为 D-04/D-05/D-07/I-01 的 admin API client contract foundation，不代表客户资产中心完整 UI/E2E、真实 API runtime、真实 DB runtime、审计持久化、历史会话/订单/报价/工单回查、conversation tags/analysis filtering 或 1.0 发布验收关闭。Owner 仍负责真实客户数据、字段/标签运营口径、生产配置、合规风险和最终发布决策。

AI agent：只在 `/Users/atilla/Documents/uzmax-m4-15-admin-customer-asset-api-client` / `codex/m4-15-admin-customer-asset-api-client` 执行；复核 admin 只调用 API/WS、不 import 后端包、no default real network call、no raw customer/order data、customer restore fail-closed、PR hygiene、worker boundary 和 M4 evidence index 同步。

## 时间盒

0.5 个工作日。若 admin customer asset API client contract 无法在预算内通过 focused Node test、type/lint/guard/check validation，则关闭或拆小；不得夹带可见 UI runtime wiring、真实 API/DB、审计持久化、历史聚合、字段/标签配置、真实客户样例或外部系统 connector 继续推进。

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M4-15-admin-customer-asset-api-client-contract.md`
  - `docs/evidence/M4/M4-15-admin-customer-asset-api-client-contract.md`
  - `docs/evidence/M4/README.md`
  - `apps/admin/src/customerAssetApiClient.ts`
  - `apps/admin/src/main.tsx`
  - `scripts/tests/m4-admin-customer-asset-api-client-contract.test.mjs`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：`main.tsx` 只增加 contract anchor 以让 client 进入 admin module graph，不改变可见 UI。不得触碰 `apps/api/**`、`apps/worker/**`、`packages/db/**`、`packages/capabilities/**`、package/lock/config、真实客户样例、root/main checkout 或其他 worktree。
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source 预算：changed source files <= 2、net source LOC <= 320、new source files <= 1。
- test/generated/lock/config/docs 预计变更：新增 1 个 focused Node test；新增 spec/evidence；同步 M4 evidence README；不改 API/worker/DB schema/migration/generated client、admin UI layout、lockfile、config 或 package。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：`rg -n "customer-assets|CustomerAsset|customer asset|customers/:customerId|field-definitions|tag-definitions|restore|api client|client" apps/admin/src apps/admin/tests scripts/tests docs/specs/M4-*.md docs/evidence/M4/*.md apps/api/src/customer-asset.*` 显示 admin 当前只有 order import API client，没有 customer asset API client；M4-14 已提供 customer asset API shell，M4 evidence 仍保留 customer asset admin UI/E2E blocker。因此新增 `apps/admin/src/customerAssetApiClient.ts` 作为 admin-only API client contract，并在 `App.tsx` 用非运行 anchor 引入。
- 外部 API/SDK/provider/connector/adapter 依据：不新增外部 API/SDK/provider/connector/adapter；只面向本 repo 已有 M4-14 Nest API route contract；不调用外部客户系统或订单 API。
- 是否需要例外：无。

## 文档触发检查

- 结果：`none`。
- 判断依据：`docs/doc-gates.md`；本 slice 只增加 admin client contract 和 M4 evidence，不新增 OpenAPI/generated DTO、production env validation、observability、runbook 或 release workflow。

## 前置条件

- 已读取 `AGENTS.md`、`docs/specs/README.md`、`docs/doc-gates.md`、`docs/evidence/M4/README.md`、M4-14 spec/evidence、v1.1 PRD REQ-T03、技术架构 §3/§12、后台设计 §4.3、验收矩阵 D-04/D-05/D-07/I-01、现有 admin API client/test patterns。
- Worktree / branch：预期物理 worktree `/Users/atilla/Documents/uzmax-m4-15-admin-customer-asset-api-client`；branch `codex/m4-15-admin-customer-asset-api-client`；禁止写入 `/Users/atilla/Documents/UZMAX智能运营` root/main checkout。
- 开工记录：
  - `pwd`: `/Users/atilla/Documents/uzmax-m4-15-admin-customer-asset-api-client`
  - `git status --short --branch`: `## codex/m4-15-admin-customer-asset-api-client`
  - `git branch --show-current`: `codex/m4-15-admin-customer-asset-api-client`
- Worker boundary preflight：`UZMAX_ASSIGNED_WORKTREE=/Users/atilla/Documents/uzmax-m4-15-admin-customer-asset-api-client UZMAX_PRIMARY_ROOT=/Users/atilla/Documents/UZMAX智能运营 npm run guard:worker-boundary` passed with `worker-write-boundary: ok`.
- 并发派发证据：无并发 worker。M4 evidence README 是所有 M4 slice 的共享触碰点，因此本 slice 串行执行。本 branch 从 latest `main@d3c1a9b` 创建，open PR 为 `[]`，root/main clean，未合并分支为空。
- 事故触发器：若发现跨任务污染、写到分配 worktree 外、错分支/main 直接提交、secret/customer-data 边界擦边、gate 绕过、同一过程失败在一个里程碑内重复出现，停止并创建或引用 `docs/incidents/` 记录。

## 实施步骤

1. 新增 `apps/admin/src/customerAssetApiClient.ts`，提供显式注入 fetcher 的 `createCustomerAssetApiClient`。
2. Client 覆盖 customers list/detail、field definitions、tag definitions、restore path construction and response shape validation。
3. Restore request 必须要求 reason ref 和至少一个 restore flag；restore response 必须包含 `customer_restore_flags` audit draft 和受控 restored flags。
4. 在 `main.tsx` 增加非运行 contract anchor；不改变可见 UI。
5. 新增 focused Node test 覆盖 URL、response parsing、POST body、HTTP/error shape failure、no backend import/no default real network/no raw boundary。
6. 同步 M4 evidence README，运行 validation chain，记录结果并提交 PR。

## 通过条件

- Admin client 只依赖注入 fetcher，不默认调用真实网络。
- Admin source 不 import `apps/api/**`、`packages/db/**`、`packages/capabilities/**` 或任何后端包。
- Customers list/detail/config/restore 路径与 M4-14 API contract 一致。
- Restore request/response fail closed，不允许缺 reason、缺 restore flag 或未知 restored flag。
- Evidence file 记录 validation table、scope notes 和 no raw data/no API runtime/no DB/no external connector boundary。

## 失败分支

- 若需要真实 API base URL/env、global fetch 默认调用、TanStack Query runtime、admin visible UI wiring、DB connection、RLS transaction wrapper、real customer data、audit persistence、history aggregation、conversation tags 或 external connector：停止并拆到后续 scoped spec。
- 若出现 raw customer/order samples、phone/address/payment/order IDs、Telegram usernames、credentials/env/secrets：停止、清理本 worker 改动并进入 incident/cleanup path。
- 若 admin client import 后端包或 restore path 接受无 reason/无 flag/未知 restored flag：不得合并，修正为 admin-only/fail-closed contract。
- 若 validation 失败且无法在 scope 内修复：提交 blocked evidence 或关闭/重开更小 spec；不得降低断言、删测试或扩大 mock。

## 不做什么

- 不新增外部 API adapter/provider/connector、DB schema/migration/generated client、API route、worker runtime、admin visible UI wiring、TanStack Query runtime、audit persistence、history/order/quote/ticket aggregation、field/tag management UI、feature flag、production config 或 real customer sample。
- 不读取 `process.env`、不默认调用 `global fetch`、不连接或写入真实数据库、不提交 raw/export/jsonl/csv/xlsx 文件、真实客户明文、电话号码、地址、支付信息、订单号、截图、Telegram payload、LLM prompt/completion、env 或 secret。
- 不关闭 D-04/D-05/D-07/I-01 的 full UI/API/E2E/audit persistence/aggregation acceptance；只提供 admin API client contract foundation。

## 验收映射

| Item | Status | Notes |
|---|---|---|
| D-04 | `admin_api_client_supported_not_closed` | Adds admin client contract for customer list/detail and related controlled refs; full customer asset UI/history/order/quote/ticket aggregation remains future scope. |
| D-05 | `admin_api_client_supported_not_closed` | Client validates restore request/response and audit draft; real audit persistence/admin owner flow remains future scope. |
| D-07 | `admin_api_client_supported_not_closed` | Client reads field/tag definitions; conversation tags, admin config and analysis reuse remain future scope. |
| I-01 | `partial_customer_asset_admin_client_not_closed` | Adds admin-to-API client foundation; full desktop core customer workflow remains future scope. |

## Closeout / Incident 记录

- Incident：none found in this spec execution at authoring time。
- Closeout evidence target: `docs/evidence/M4/M4-15-admin-customer-asset-api-client-contract.md`。
