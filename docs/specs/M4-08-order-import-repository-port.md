# M4-08 Order Import Repository Port

## 目标

为 ADR-B02 no-API 分支交付订单导入 API 的最小持久化 repository port 与 DB row mapper：API service 依赖稳定 `OrderImportRepositoryPort`，默认 provider 仍是 in-memory；新增 persistence gateway adapter 将 `import_job`、`import_row_error`、`order_snapshot` row shape 映射到 M4-07 API response 与 M4-05 order-read input。此 spec 不实现真实 Prisma client、DB 连接、CSV/XLSX parser、worker queue、admin API client、外部订单 API connector、真实订单数据或 AI runtime。

## Owner

Owner：确认本切片只作为 E-02/E-03/E-04 的 repository-port foundation，不代表导入 runtime、DB client wiring、真实样例、worker、admin-to-API E2E、AI runtime/eval 或 1.0 发布验收关闭。Owner 仍负责真实导入样例、字段映射、客户/订单数据、生产配置、LLM key、成本和合规风险决策。

AI agent：只在 `/Users/atilla/Documents/uzmax-m4-08-order-import-repository-port` / `codex/m4-08-order-import-repository-port` 执行；复核 no external order API、no `order_connector`、no Prisma client/env/secrets、no worker/admin, no raw CSV/XLSX/order/customer data、tenant scope、stale handoff compatibility、PR hygiene、worker boundary 和 M4 evidence index 同步。

## 时间盒

0.5 个工作日。若 repository port/mapper 无法在预算内通过 focused Node test、type/lint/guard/check validation，则关闭或拆小；不得夹带 DB client、worker parser、admin UI、真实导入样例或外部 API connector 继续推进。

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M4-08-order-import-repository-port.md`
  - `docs/evidence/M4/M4-08-order-import-repository-port.md`
  - `docs/evidence/M4/README.md`
  - `apps/api/src/app.module.ts`
  - `apps/api/src/order-import.repository.ts`
  - `apps/api/src/order-import.service.ts`
  - `scripts/tests/m4-order-import-api-shell.test.mjs`
  - `scripts/tests/m4-order-import-repository-port.test.mjs`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：不得触碰 `packages/db/**`、`packages/capabilities/**`、`apps/admin/**`、`apps/worker/**`、`packages/engine/**`、package/lock/config、generated/dist、真实导入样例、root/main checkout 或其他 worktree。
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source 预算：changed source files <= 3、net source LOC <= 420、new source files <= 0。
- test/generated/lock/config/docs 预计变更：新增 1 个 focused Node test；更新 M4-07 API shell test 以覆盖 repository port 兼容性；新增 spec/evidence；同步 M4 evidence README；不改 DB schema/migration/generated client、admin UI、worker、lockfile、config 或 package。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：无新增 source 文件。`rg -n "order import|OrderImport|import_job|order_snapshot|Repository|repository port|persistence|database repository|Prisma" apps/api/src packages/db/src packages/capabilities/order-read/src scripts/tests docs/evidence/M4 docs/specs/M4-*.md` 显示当前只有 M4-07 `InMemoryOrderImportRepository`，M4-04 DB contracts 与 M4-05 order-read contracts 已存在，但 API service 还依赖 concrete in-memory class，缺少持久化 adapter/port。应就地扩展 `apps/api/src/order-import.repository.ts` 和 service constructor，不新增平行实现。
- 外部 API/SDK/provider/connector/adapter 依据：none。本 PR 不新增、不调用、不声明任何外部 API/SDK/provider/connector/adapter 能力；ADR-B02 no-API branch remains active and `order_connector` remains absent.
- 是否需要例外：无。

## 文档触发检查

- 结果：`none`。
- 判断依据：`docs/doc-gates.md`；本 slice 用 spec/evidence/M4 README 记录 repository-port foundation，不新增 OpenAPI/generated DTO/runbook/production runtime。

## 前置条件

- 已读取 `AGENTS.md`、`docs/specs/README.md`、`docs/evidence/M4/README.md`、`docs/adr/ADR-B02-order-api.md`、M4-04/M4-05/M4-07 spec/evidence、v1.1 后台设计 §4.4、技术架构 §8/§12.3、验收矩阵 E-02/E-03/E-04/I-01、现有 order-import API repository/service/test patterns。
- ADR-B02 当前分支为 `no_api_for_m4__import_snapshot_main_path`；本 spec 不实现订单 API connector，不新增 `order_connector`，不调用或模拟外部 API。
- Worktree / branch：预期物理 worktree `/Users/atilla/Documents/uzmax-m4-08-order-import-repository-port`；branch `codex/m4-08-order-import-repository-port`；禁止写入 `/Users/atilla/Documents/UZMAX智能运营` root/main checkout。
- 开工记录：
  - `pwd`: `/Users/atilla/Documents/uzmax-m4-08-order-import-repository-port`
  - `git status --short --branch`: `## codex/m4-08-order-import-repository-port`
  - `git branch --show-current`: `codex/m4-08-order-import-repository-port`
- Worker boundary preflight：`UZMAX_ASSIGNED_WORKTREE=/Users/atilla/Documents/uzmax-m4-08-order-import-repository-port UZMAX_PRIMARY_ROOT=/Users/atilla/Documents/UZMAX智能运营 npm run guard:worker-boundary` passed with `worker-write-boundary: ok`.
- 并发派发证据：无并发 worker。本 branch 从 latest `main@5b08da0` 创建，open PR 为 `[]`，root/main clean，未合并分支为空。
- 事故触发器：若发现跨任务污染、写到分配 worktree 外、错分支/main 直接提交、secret/customer-data 边界擦边、gate 绕过、同一过程失败在一个里程碑内重复出现，停止并创建或引用 `docs/incidents/` 记录。

## 实施步骤

1. 在 `order-import.repository.ts` 抽出 `OrderImportRepositoryPort`、`ORDER_IMPORT_REPOSITORY` 与 `OrderImportPersistenceGateway`，让 service 依赖 provider token + port 而不是 concrete in-memory class。
2. 保留 `InMemoryOrderImportRepository` 作为默认 AppModule/local contract provider，行为与 M4-07 API shell 保持兼容。
3. 新增 `PersistenceOrderImportRepository` adapter：从 gateway 的 `import_job`、`import_row_error`、`order_snapshot` row shape 映射到 API job/error/snapshot types；scope mismatch fail closed。
4. Snapshot 查询把 `queryKind/queryRef` 传给 gateway，fresh/stale/missing 仍由 M4-05 `evaluateOrderSnapshotForRead` 判定。
5. 新增 focused Node test 覆盖 port dependency、in-memory compatibility、persistence mapper、tenant scope mismatch、no raw/connector/env/Prisma client boundary 和 M4 evidence。
6. 同步 M4 evidence README，运行 validation chain，记录结果并提交 PR。

## 通过条件

- `OrderImportService` constructor 通过 `ORDER_IMPORT_REPOSITORY` token 依赖 `OrderImportRepositoryPort`。
- 默认 AppModule provider 仍可用 `InMemoryOrderImportRepository`，M4-07 API shell tests 继续通过。
- Persistence adapter 可按 selected tenant scope 映射 job/error/snapshot rows；scope mismatch 或 archived snapshot fail closed。
- Snapshot mapper 只输出 controlled refs/summary object 给 order-read，stale/missing 不输出订单状态。
- Focused test 覆盖 E-02/E-03/E-04 repository-port behavior 和 no API/no raw/no DB client boundary。
- Evidence file 记录 validation table、scope notes 和 no raw data/no API/no runtime DB client boundary。

## 失败分支

- 若需要真实 Prisma client、DB connection、RLS transaction wrapper、generated DTO、admin UI、worker parser、real import files 或 external order API：停止并拆到后续 scoped spec。
- 若出现 raw order/customer samples、phone/address/payment/order IDs、credentials/env/secrets：停止、清理本 worker 改动并进入 incident/cleanup path。
- 若 stale/missing path 输出订单状态或让 LLM 判断状态：不得合并，修正为 handoff/fail-closed。
- 若 validation 失败且无法在 scope 内修复：提交 blocked evidence 或关闭/重开更小 spec；不得降低断言、删测试或扩大 mock。

## 不做什么

- 不新增 `order_connector`、外部 API adapter/provider/connector、Prisma client wiring、DB connection、schema/migration、generated client、admin UI/client、worker parser、feature flag、production config 或 real CSV/XLSX import。
- 不提交 raw/export/jsonl/csv/xlsx、真实客户明文、电话号码、地址、支付信息、订单号、截图、Telegram payload、LLM prompt/completion、env 或 secret。
- 不关闭 E-02/E-03/E-04/I-01 的 DB runtime/worker/admin E2E/AI acceptance；只提供 repository-port foundation。

## 验收映射

| Item | Status | Notes |
|---|---|---|
| E-01 | `not_current_blocker__no_api_for_m4` | No `order_connector` or external API connector added. |
| E-02 | `repository_port_supported_not_closed` | Adds persistence gateway adapter/mapper for import jobs/errors/snapshot search; DB client, worker import and admin E2E remain future scope. |
| E-03 | `repository_port_supported_not_closed` | Snapshot mapper preserves expiry/source timestamps for stale handoff; persisted/runtime warning remains future scope. |
| E-04 | `repository_port_supported_not_closed` | Repository feeds order-read contract without fabricated status; AI eval/runtime integration remains future scope. |
| I-01 | `partial_api_shell_not_closed` | API service now has a repository port for future admin E2E; full desktop core workflow remains future scope. |

## Closeout / Incident 记录

- Incident：none found in this spec execution at authoring time。
- Closeout evidence target: `docs/evidence/M4/M4-08-order-import-repository-port.md`。
