# M4-13 Admin Order Import API Client Contract

## 目标

为 ADR-B02 no-API 分支交付最小 admin-to-API bridge foundation：在 `apps/admin` 新增纯 `orderImportApiClient`，以显式注入的 `fetcher` 调用既有 M4-07 `/order-import/jobs`、`/order-import/jobs/:jobId/errors`、`/order-import/snapshots/search` 合同，并校验 job/error/snapshot response shape。本 spec 不改 UI runtime、不默认调用 `global fetch`、不连接真实 API/DB/Storage、不导入后端包、不实现真实导入上传、worker queue、外部订单 API connector、真实订单数据或 AI runtime。

## Owner

Owner：确认本切片只作为 E-02/I-01 的 admin API client contract foundation，不代表 admin-to-API E2E、真实 API runtime、真实 DB runtime、文件上传、错误下载、回滚、BullMQ/Redis queue、AI runtime/eval 或 1.0 发布验收关闭。Owner 仍负责真实账号、客户/订单数据、生产配置、成本和合规风险决策。

AI agent：只在 `/Users/atilla/Documents/uzmax-m4-13-admin-order-import-api-client` / `codex/m4-13-admin-order-import-api-client` 执行；复核 admin 只调用 API/WS、不 import 后端包、no default real network call、no external order API/no `order_connector`、stale/missing fail-closed、PR hygiene、worker boundary 和 M4 evidence index 同步。

## 时间盒

0.5 个工作日。若 admin API client contract 无法在预算内通过 focused Node test、type/lint/guard/check validation，则关闭或拆小；不得夹带 UI runtime wiring、真实 API/DB、upload/download、worker queue、真实导入样例或外部 API connector 继续推进。

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M4-13-admin-order-import-api-client-contract.md`
  - `docs/evidence/M4/M4-13-admin-order-import-api-client-contract.md`
  - `docs/evidence/M4/README.md`
  - `apps/admin/src/orderImportApiClient.ts`
  - `apps/admin/src/M4OrderPathStatusShell.tsx`
  - `scripts/tests/m4-admin-order-import-api-client-contract.test.mjs`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：`M4OrderPathStatusShell.tsx` 只增加 contract anchor 以让 client 进入 admin module graph，不改变可见 UI。不得触碰 `apps/api/**`、`apps/worker/**`、`packages/db/**`、`packages/capabilities/**`、package/lock/config、真实导入样例、root/main checkout 或其他 worktree。
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source 预算：changed source files <= 2、net source LOC <= 180、new source files <= 1。
- test/generated/lock/config/docs 预计变更：新增 1 个 focused Node test；新增 spec/evidence；同步 M4 evidence README；不改 API/worker/DB schema/migration/generated client、admin UI layout、lockfile、config 或 package。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：`rg -n "order-import|OrderImport|M4Order|fetch\\(|api client|client" apps/admin/src apps/admin/tests scripts/tests docs/specs/M4-*.md docs/evidence/M4/*.md` 显示 admin 当前只有 synthetic `M4OrderPathStatusShell`，没有 order import API client；M4-07 已提供 API shell，M4 evidence 仍保留 admin E2E blocker。因此新增 `apps/admin/src/orderImportApiClient.ts` 作为 admin-only API client contract，并在 M4 shell 用非运行 anchor 引入。
- 外部 API/SDK/provider/connector/adapter 依据：不新增外部 API/SDK/provider/connector/adapter；只面向本 repo 已有 M4-07 Nest API route contract；不调用外部订单 API；`order_connector` remains absent。
- 是否需要例外：无。

## 文档触发检查

- 结果：`none`。
- 判断依据：`docs/doc-gates.md`；本 slice 只增加 admin client contract 和 M4 evidence，不新增 OpenAPI/generated DTO、production env validation、observability、runbook 或 release workflow。

## 前置条件

- 已读取 `AGENTS.md`、`docs/specs/README.md`、`docs/doc-gates.md`、`docs/evidence/M4/README.md`、`docs/adr/ADR-B02-order-api.md`、M4-06/M4-07/M4-08/M4-11/M4-12 spec/evidence、v1.1 PRD REQ-T04、技术架构 §8、后台设计 §4.4、验收矩阵 E-02/E-03/E-04/I-01、现有 admin M4 shell/API tests。
- ADR-B02 当前分支为 `no_api_for_m4__import_snapshot_main_path`；本 spec 不实现订单 API connector，不新增 `order_connector`，不调用或模拟外部 API。
- Worktree / branch：预期物理 worktree `/Users/atilla/Documents/uzmax-m4-13-admin-order-import-api-client`；branch `codex/m4-13-admin-order-import-api-client`；禁止写入 `/Users/atilla/Documents/UZMAX智能运营` root/main checkout。
- 开工记录：
  - `pwd`: `/Users/atilla/Documents/uzmax-m4-13-admin-order-import-api-client`
  - `git status --short --branch`: `## codex/m4-13-admin-order-import-api-client`
  - `git branch --show-current`: `codex/m4-13-admin-order-import-api-client`
- Worker boundary preflight：`UZMAX_ASSIGNED_WORKTREE=/Users/atilla/Documents/uzmax-m4-13-admin-order-import-api-client UZMAX_PRIMARY_ROOT=/Users/atilla/Documents/UZMAX智能运营 npm run guard:worker-boundary` passed with `worker-write-boundary: ok`.
- 并发派发证据：无并发 worker。本 branch 从 latest `main@ca6a06b` 创建，open PR 为 `[]`，root/main clean，未合并分支为空。
- 事故触发器：若发现跨任务污染、写到分配 worktree 外、错分支/main 直接提交、secret/customer-data 边界擦边、gate 绕过、同一过程失败在一个里程碑内重复出现，停止并创建或引用 `docs/incidents/` 记录。

## 实施步骤

1. 新增 `apps/admin/src/orderImportApiClient.ts`，提供显式注入 fetcher 的 `createOrderImportApiClient`。
2. Client 覆盖 jobs、row errors、snapshot search path construction and response shape validation。
3. Stale/missing/handoff response 必须 fail closed：handoff required 且不得暴露 `orderStatusRef`。
4. 在 M4 shell 增加非运行 contract anchor；不改变 UI。
5. 新增 focused Node test 覆盖 URL、response parsing、HTTP/error shape failure、no backend import/no default real network/no raw/no connector boundary。
6. 同步 M4 evidence README，运行 validation chain，记录结果并提交 PR。

## 通过条件

- Admin client 只依赖注入 fetcher，不默认调用真实网络。
- Admin source 不 import `apps/api/**`、`packages/db/**`、`packages/capabilities/**` 或任何后端包。
- Jobs/errors/snapshot search 三条路径 URL 与 M4-07 API contract 一致。
- Stale/missing handoff response 不向 admin client 暴露 order status ref。
- Evidence file 记录 validation table、scope notes 和 no raw data/no API/no runtime DB/no external connector boundary。

## 失败分支

- 若需要真实 API base URL/env、global fetch 默认调用、TanStack Query runtime、admin UI wiring、file upload/download、DB connection、RLS transaction wrapper、BullMQ/Redis、real import files 或 external order API：停止并拆到后续 scoped spec。
- 若出现 raw order/customer samples、phone/address/payment/order IDs、credentials/env/secrets：停止、清理本 worker 改动并进入 incident/cleanup path。
- 若 admin client import 后端包或 stale/missing path 暴露 `orderStatusRef`：不得合并，修正为 admin-only/fail-closed contract。
- 若 validation 失败且无法在 scope 内修复：提交 blocked evidence 或关闭/重开更小 spec；不得降低断言、删测试或扩大 mock。

## 不做什么

- 不新增 `order_connector`、外部 API adapter/provider/connector、DB schema/migration、generated client、API route、worker runtime、admin visible UI wiring、TanStack Query runtime、file upload/download、BullMQ/Redis runtime、Storage downloader、feature flag、production config、real CSV/XLSX sample file 或 XLSX import。
- 不读取 `process.env`、不默认调用 `global fetch`、不连接或写入真实数据库、不提交 raw/export/jsonl/csv/xlsx 文件、真实客户明文、电话号码、地址、支付信息、订单号、截图、Telegram payload、LLM prompt/completion、env 或 secret。
- 不关闭 E-02/E-03/E-04/I-01 的 DB runtime/queue/admin E2E/AI acceptance；只提供 admin API client contract foundation。

## 验收映射

| Item | Status | Notes |
|---|---|---|
| E-01 | `not_current_blocker__no_api_for_m4` | No `order_connector` or external API connector added. |
| E-02 | `admin_api_client_supported_not_closed` | Adds admin client contract for import jobs/errors/snapshot search; production DB/runtime, queue and UI E2E remain future scope. |
| E-03 | `admin_api_client_supported_not_closed` | Client preserves stale/missing handoff contract and blocks status ref exposure on handoff responses. |
| E-04 | `foundation_supported_not_closed` | Client consumes order-read API results without fabricating status; AI eval/runtime integration remains future scope. |
| I-01 | `partial_admin_client_not_closed` | Adds admin-to-API client foundation; full desktop core workflow remains future scope. |
| J-02 | `not_closed` | No real queue/retry/idempotency runtime is added. |

## Closeout / Incident 记录

- Incident：none found in this spec execution at authoring time。
- Closeout evidence target: `docs/evidence/M4/M4-13-admin-order-import-api-client-contract.md`。
