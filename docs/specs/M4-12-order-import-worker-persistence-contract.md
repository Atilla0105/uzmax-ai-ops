# M4-12 Order Import Worker Persistence Contract

## 目标

为 ADR-B02 no-API 分支交付最小 worker-persistence-contract foundation：把 M4-10 CSV text parser、M4-09 worker draft generation 和一个注入式 persistence gateway 串成 `runOrderImportCsvTextPersistenceJob`。本 spec 只证明受控 CSV 文本可在 worker 内完成 parse -> draft -> persistence gateway 调用顺序；不读取文件/Storage/env、不连接或写入真实 DB、不接 BullMQ/Redis、不实现 admin API client、外部订单 API connector、真实订单数据或 AI runtime。

## Owner

Owner：确认本切片只作为 E-02/J-02 的 worker persistence contract foundation，不代表生产导入任务、真实文件上传、Storage 下载、DB transaction/RLS runtime、BullMQ/Redis queue、积压告警、admin E2E、AI runtime/eval 或 1.0 发布验收关闭。Owner 仍负责真实 DB/Redis/Storage 配置、客户/订单数据、生产配置、成本和合规风险决策。

AI agent：只在 `/Users/atilla/Documents/uzmax-m4-12-order-import-worker-persistence` / `codex/m4-12-order-import-worker-persistence` 执行；复核 no DB runtime, no queue runtime, no file/Storage/env/network reads, no external order API/no `order_connector`, deterministic persistence order, fail-before-persistence validation, PR hygiene, worker boundary 和 M4 evidence index 同步。

## 时间盒

0.5 个工作日。若 worker persistence contract 无法在预算内通过 focused Node test、type/lint/guard/check validation，则关闭或拆小；不得夹带真实文件读取、DB wiring、queue runtime、admin UI/client、真实导入样例或外部 API connector 继续推进。

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M4-12-order-import-worker-persistence-contract.md`
  - `docs/evidence/M4/M4-12-order-import-worker-persistence-contract.md`
  - `docs/evidence/M4/README.md`
  - `apps/worker/src/main.ts`
  - `scripts/tests/m4-order-import-worker-persistence-contract.test.mjs`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：不得触碰 `apps/api/**`、`apps/admin/**`、`packages/db/**` schema/migration/generated client、`packages/capabilities/**`、package/lock/config、真实导入样例、root/main checkout 或其他 worktree。
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source 预算：changed source files <= 1、net source LOC <= 120、new source files <= 0。
- test/generated/lock/config/docs 预计变更：新增 1 个 focused Node test；新增 spec/evidence；同步 M4 evidence README；不改 DB schema/migration/generated client、API/admin、lockfile、config 或 package。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：无新增 source 文件。`rg -n "runOrderImport|OrderImportWorker|parseOrderImportCsvText|createOrderImportWorkerDrafts|persistImport|import_job|order_snapshot|import_row_error|BullMQ|Queue|Redis" apps/worker/src scripts/tests docs/specs/M4-*.md docs/evidence/M4 packages/capabilities/order-read/src packages/db/src` 显示现有 M4-09/M4-10 归属在 `apps/worker/src/main.ts`，但尚无把 parser/drafts 交给 persistence gateway 的 worker contract；因此就地扩展 worker entry source，不新增平行 source 文件。
- 外部 API/SDK/provider/connector/adapter 依据：不新增外部 API/SDK/provider/connector/adapter；不调用外部订单 API；`order_connector` remains absent。
- 是否需要例外：无。

## 文档触发检查

- 结果：`none`。
- 判断依据：`docs/doc-gates.md`；本 slice 只增加 worker contract 和 M4 evidence，不新增真实 env validation、production queue、observability、OpenAPI/generated DTO、runbook 或 release workflow。

## 前置条件

- 已读取 `AGENTS.md`、`docs/specs/README.md`、`docs/doc-gates.md`、`docs/evidence/M4/README.md`、`docs/adr/ADR-B02-order-api.md`、M4-09/M4-10/M4-11 spec/evidence、v1.1 PRD REQ-T04、技术架构 §8/§12、后台设计 §4.4、验收矩阵 E-02/E-03/E-04/J-02/I-01、现有 worker parser/draft tests。
- ADR-B02 当前分支为 `no_api_for_m4__import_snapshot_main_path`；本 spec 不实现订单 API connector，不新增 `order_connector`，不调用或模拟外部 API。
- Worktree / branch：预期物理 worktree `/Users/atilla/Documents/uzmax-m4-12-order-import-worker-persistence`；branch `codex/m4-12-order-import-worker-persistence`；禁止写入 `/Users/atilla/Documents/UZMAX智能运营` root/main checkout。
- 开工记录：
  - `pwd`: `/Users/atilla/Documents/uzmax-m4-12-order-import-worker-persistence`
  - `git status --short --branch`: `## codex/m4-12-order-import-worker-persistence`
  - `git branch --show-current`: `codex/m4-12-order-import-worker-persistence`
- Worker boundary preflight：`UZMAX_ASSIGNED_WORKTREE=/Users/atilla/Documents/uzmax-m4-12-order-import-worker-persistence UZMAX_PRIMARY_ROOT=/Users/atilla/Documents/UZMAX智能运营 npm run guard:worker-boundary` passed with `worker-write-boundary: ok`.
- 并发派发证据：无并发 worker。本 branch 从 latest `main@76f5758` 创建，open PR 为 `[]`，root/main clean，未合并分支为空。
- 事故触发器：若发现跨任务污染、写到分配 worktree 外、错分支/main 直接提交、secret/customer-data 边界擦边、gate 绕过、同一过程失败在一个里程碑内重复出现，停止并创建或引用 `docs/incidents/` 记录。

## 实施步骤

1. 在 `apps/worker/src/main.ts` 增加 `OrderImportWorkerPersistenceGateway` 与 `runOrderImportCsvTextPersistenceJob`。
2. `runOrderImportCsvTextPersistenceJob` 先 parse 与生成完整 drafts，再按 import job -> snapshots -> row errors 顺序调用注入式 gateway。
3. Focused Node test 覆盖成功顺序、counts、失败前不持久化、no DB/queue/file/network runtime side effects。
4. 同步 M4 evidence README，运行 validation chain，记录结果并提交 PR。

## 通过条件

- 成功路径从 controlled CSV text 生成 import job、snapshot、row error drafts，并按确定顺序交给 gateway。
- 若 CSV、scope、用户或 deterministic IDs 失败，任何 persistence gateway 方法都不能被调用。
- 本 PR 不读取文件/Storage/env、不开 DB/Prisma/BullMQ/Redis、无外部网络/API/`order_connector`。
- Evidence file 记录 validation table、scope notes 和 no raw data/no API/no DB/no queue runtime boundary。

## 失败分支

- 若需要真实 CSV/XLSX 文件读取、Storage 下载、browser upload、DB connection、RLS transaction wrapper、BullMQ/Redis、admin UI/client、real import files 或 external order API：停止并拆到后续 scoped spec。
- 若出现 raw order/customer samples、phone/address/payment/order IDs、credentials/env/secrets：停止、清理本 worker 改动并进入 incident/cleanup path。
- 若 persistence 在 validation 完成前可被调用，或失败路径出现部分持久化：不得合并，修正为 fail-before-persistence contract。
- 若 validation 失败且无法在 scope 内修复：提交 blocked evidence 或关闭/重开更小 spec；不得降低断言、删测试或扩大 mock。

## 不做什么

- 不新增 `order_connector`、外部 API adapter/provider/connector、DB schema/migration、generated client、admin UI/client、API route、BullMQ/Redis runtime、Storage downloader、feature flag、production config、real file upload、CSV/XLSX sample file 或 XLSX import。
- 不读取 `process.env`、不创建 `new PrismaClient()`、不连接或写入真实数据库、不提交 raw/export/jsonl/csv/xlsx 文件、真实客户明文、电话号码、地址、支付信息、订单号、截图、Telegram payload、LLM prompt/completion、env 或 secret。
- 不关闭 E-02/E-03/E-04/J-02/I-01 的 DB runtime/queue/admin E2E/AI acceptance；只提供 worker persistence contract foundation。

## 验收映射

| Item | Status | Notes |
|---|---|---|
| E-01 | `not_current_blocker__no_api_for_m4` | No `order_connector` or external API connector added. |
| E-02 | `worker_persistence_contract_supported_not_closed` | Parser/drafts can be handed to an injected persistence gateway; production DB runtime, queue and admin E2E remain future scope. |
| E-03 | `foundation_supported_not_closed` | Expiry/source fields pass through existing parser/draft path; persisted/runtime warning remains future scope. |
| E-04 | `foundation_supported_not_closed` | Worker only shapes import data; order-read still hands off stale/missing without fabrication; AI eval/runtime integration remains future scope. |
| J-02 | `worker_persistence_contract_supported_not_closed` | Adds deterministic gateway call contract and fail-before-persistence behavior; no real queue/retry/idempotency runtime is added. |
| I-01 | `not_closed` | No admin E2E workflow is added. |

## Closeout / Incident 记录

- Incident：none found in this spec execution at authoring time。
- Closeout evidence target: `docs/evidence/M4/M4-12-order-import-worker-persistence-contract.md`。
