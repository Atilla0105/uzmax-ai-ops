# M4-07 Order Import API Shell

## 目标

为 ADR-B02 no-API 分支交付最小 Nest API shell：列出导入批次、查看错误行、按受控 query ref 查询 fresh/stale/missing 导入快照，并在 stale/missing 时返回 handoff-required 结果。本 spec 只做 API 合同与 in-memory repository，不实现 DB repository、CSV/XLSX parser、worker queue、admin API client、外部订单 API connector、真实订单数据或 AI runtime。

## Owner

Owner：确认本切片只作为 E-02/E-03/E-04 的 API-shell foundation，不代表导入 runtime、真实样例、DB persistence、worker、admin-to-API E2E、AI runtime/eval 或 1.0 发布验收关闭。Owner 仍负责真实导入样例、字段映射、客户/订单数据、生产配置、LLM key、成本和合规风险决策。

AI agent：只在 `/Users/atilla/Documents/uzmax-m4-07-order-import-api-shell` / `codex/m4-07-order-import-api-shell` 执行；复核 no external order API、no `order_connector`、no DB schema/repository/worker/admin, no raw CSV/XLSX/order/customer data、tenant scope、stale handoff、HTTP error mapping、PR hygiene、worker boundary 和 M4 evidence index 同步。

## 时间盒

0.5 个工作日。若 API shell 无法在预算内通过 focused Node test、type/lint/guard/check validation，则关闭或拆小；不得夹带 DB repository、worker parser、admin UI、真实导入样例或外部 API connector 继续推进。

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M4-07-order-import-api-shell.md`
  - `docs/evidence/M4/M4-07-order-import-api-shell.md`
  - `docs/evidence/M4/README.md`
  - `apps/api/scripts/runtime-compiler.mjs`
  - `apps/api/src/app.module.ts`
  - `apps/api/src/order-import.ts`
  - `apps/api/src/order-import.controller.ts`
  - `apps/api/src/order-import.repository.ts`
  - `apps/api/src/order-import.service.ts`
  - `apps/api/src/order-import.types.ts`
  - `scripts/tests/m4-order-import-api-shell.test.mjs`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：不得触碰 `packages/db/**`、`apps/admin/**`、`apps/worker/**`、`packages/engine/**`、package/lock/config、generated/dist、真实导入样例、root/main checkout 或其他 worktree。
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source 预算：changed source files <= 7、net source LOC <= 700、new source files <= 5。
- test/generated/lock/config/docs 预计变更：新增 1 个 focused Node test；新增 spec/evidence；同步 M4 evidence README；补充 API runtime compiler smoke harness 的 order-import module graph；不改 DB schema/migration/generated client、admin UI、worker、lockfile、config 或 package。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：`rg -n "order-import|OrderImport|order import|order-read|order_snapshot|import_job|import_row_error|order query|订单导入|导入快照" apps/api/src scripts/tests docs/specs docs/evidence/M4 packages/capabilities/order-read/src packages/db/src` 显示 `apps/api/src` 尚无 order-import API；现有同类 API 结构是 `conversation-ticket.controller/service/repository/types/barrel`，M4-04/M4-05 已提供 DB/capability contract，M4-06 已提供 admin shell。因此新增 `apps/api/src/order-import.*` 作为同类 API shell 归属，并在 `app.module.ts` 注册。
- 外部 API/SDK/provider/connector/adapter 依据：none。本 PR 不新增、不调用、不声明任何外部 API/SDK/provider/connector/adapter 能力；ADR-B02 no-API branch remains active and `order_connector` remains absent.
- 是否需要例外：无。

## 文档触发检查

- 结果：`none`。
- 判断依据：`docs/doc-gates.md`；本 slice 用 spec/evidence/M4 README 记录 API shell，不新增 OpenAPI/generated DTO/runbook/production runtime。

## 前置条件

- 已读取 `AGENTS.md`、`docs/specs/README.md`、`docs/evidence/M4/README.md`、`docs/adr/ADR-B02-order-api.md`、SPK-02 spec/evidence、M4-04/M4-05/M4-06 spec/evidence、v1.1 后台设计 §4.4、技术架构 §8/§12.3、验收矩阵 E-02/E-03/E-04/I-01、现有 conversation-ticket API module/test patterns。
- ADR-B02 当前分支为 `no_api_for_m4__import_snapshot_main_path`；本 spec 不实现订单 API connector，不新增 `order_connector`，不调用或模拟外部 API。
- Worktree / branch：预期物理 worktree `/Users/atilla/Documents/uzmax-m4-07-order-import-api-shell`；branch `codex/m4-07-order-import-api-shell`；禁止写入 `/Users/atilla/Documents/UZMAX智能运营` root/main checkout。
- 开工记录：
  - `pwd`: `/Users/atilla/Documents/uzmax-m4-07-order-import-api-shell`
  - `git status --short --branch`: `## codex/m4-07-order-import-api-shell`
  - `git branch --show-current`: `codex/m4-07-order-import-api-shell`
- Worker boundary preflight：`UZMAX_ASSIGNED_WORKTREE=/Users/atilla/Documents/uzmax-m4-07-order-import-api-shell UZMAX_PRIMARY_ROOT=/Users/atilla/Documents/UZMAX智能运营 npm run guard:worker-boundary` passed with `worker-write-boundary: ok`.
- 并发派发证据：无并发 worker。本 branch 从 latest `main@d69f581` 创建，open PR 为 `[]`，root/main clean，未合并分支为空。
- 事故触发器：若发现跨任务污染、写到分配 worktree 外、错分支/main 直接提交、secret/customer-data 边界擦边、gate 绕过、同一过程失败在一个里程碑内重复出现，停止并创建或引用 `docs/incidents/` 记录。

## 实施步骤

1. 新增 `order-import` API controller/service/repository/types/barrel，沿用 conversation-ticket 的 module split 和 in-memory repository pattern。
2. 注册 `OrderImportController`、`OrderImportService`、`InMemoryOrderImportRepository` 到 `AppModule`。
3. API 支持 `GET /order-import/jobs`、`GET /order-import/jobs/:jobId/errors`、`GET /order-import/snapshots/search`。
4. 使用 `order-read` pure contract 评估 fresh/stale/missing，stale/missing 返回 handoff-required，不输出 status ref。
5. 更新 API runtime compiler smoke harness，使既有 HTTP shell boot test 能转译新增 `order-import` barrel 与 `order-read` 依赖。
6. 新增 focused Node test 覆盖 tenant scope、permission、HTTP mapping、fresh/stale/missing、no raw/no connector、AppModule registration 和 M4 evidence。
7. 同步 M4 evidence README，运行 validation chain，记录结果并提交 PR。

## 通过条件

- API shell 不调用外部 order API、不新增 `order_connector`，不读取 env/secrets，不触碰 DB schema/repository。
- 列表、错误行、快照查询按 selected tenant scope 过滤；无权限或缺 access context fail closed。
- Fresh snapshot 返回受控 status ref；stale/missing 返回 handoff-required 且不返回 order status ref。
- Controller 映射 validation/not found/access/domain failures 到明确 HTTP status。
- Focused test 覆盖 no raw data/no adapter/no admin/worker boundary 和 AppModule registration。

## 失败分支

- 若需要 DB repository、Prisma schema/migration、generated DTO、admin UI、worker parser、real import files 或 external order API：停止并拆到后续 scoped spec。
- 若出现 raw order/customer samples、phone/address/payment/order IDs、credentials/env/secrets：停止、清理本 worker 改动并进入 incident/cleanup path。
- 若 stale/missing path 输出订单状态或让 LLM 判断状态：不得合并，修正为 handoff/fail-closed。
- 若 validation 失败且无法在 scope 内修复：提交 blocked evidence 或关闭/重开更小 spec；不得降低断言、删测试或扩大 mock。

## 不做什么

- 不新增 `order_connector`、外部 API adapter/provider/connector、DB repository、Prisma schema/migration、generated client、admin UI/client、worker parser、feature flag、production config 或 real CSV/XLSX import。
- 不提交 raw/export/jsonl/csv/xlsx、真实客户明文、电话号码、地址、支付信息、订单号、截图、Telegram payload、LLM prompt/completion、env 或 secret。
- 不关闭 E-02/E-03/E-04/I-01 的 DB persistence/worker/admin E2E/AI acceptance；只提供 API shell foundation。

## 验收映射

| Item | Status | Notes |
|---|---|---|
| E-01 | `not_current_blocker__no_api_for_m4` | No `order_connector` or external API connector added. |
| E-02 | `api_shell_supported_not_closed` | Lists import jobs/errors and supports snapshot-backed search; DB/worker/admin E2E remains future scope. |
| E-03 | `api_shell_supported_not_closed` | API returns stale warning/handoff contract; persisted runtime warning remains future scope. |
| E-04 | `api_shell_supported_not_closed` | Missing/stale API results hand off without fabricated status; AI eval/runtime integration remains future scope. |
| I-01 | `partial_api_shell_not_closed` | Adds API backing shape for order admin path; full desktop core workflow remains future scope. |

## Closeout / Incident 记录

- Incident：none found in this spec execution at authoring time。
- Closeout evidence target: `docs/evidence/M4/M4-07-order-import-api-shell.md`。
