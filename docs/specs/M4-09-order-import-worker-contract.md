# M4-09 Order Import Worker Contract

## 目标

为 ADR-B02 no-API 分支交付最小 worker import contract：把受控表格行输入转换为 M4-05 `order-read` batch result，并生成 M4-04 DB contract drafts（`import_job`、`order_snapshot`、`import_row_error`）。本 spec 只做纯 worker 合同与 focused test，不实现真实 CSV/XLSX parser、Storage 下载、Prisma client、DB 写入、BullMQ/Redis、admin API client、外部订单 API connector、真实订单数据或 AI runtime。

## Owner

Owner：确认本切片只作为 E-02/E-03/E-04 的 worker-contract foundation，不代表导入 runtime、真实样例、DB client wiring、worker queue、admin-to-API E2E、AI runtime/eval 或 1.0 发布验收关闭。Owner 仍负责真实导入样例、字段映射、客户/订单数据、生产配置、LLM key、成本和合规风险决策。

AI agent：只在 `/Users/atilla/Documents/uzmax-m4-09-order-import-worker-contract` / `codex/m4-09-order-import-worker-contract` 执行；复核 no external order API、no `order_connector`、no Prisma client/env/secrets、no Redis/BullMQ runtime, no raw CSV/XLSX/order/customer data、tenant scope、row error visibility、PR hygiene、worker boundary 和 M4 evidence index 同步。

## 时间盒

0.5 个工作日。若 worker contract 无法在预算内通过 focused Node test、type/lint/guard/check validation，则关闭或拆小；不得夹带 DB client、queue runtime、admin UI、真实导入样例或外部 API connector 继续推进。

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M4-09-order-import-worker-contract.md`
  - `docs/evidence/M4/M4-09-order-import-worker-contract.md`
  - `docs/evidence/M4/README.md`
  - `apps/worker/src/main.ts`
  - `scripts/tests/m4-order-import-worker-contract.test.mjs`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：不得触碰 `packages/db/**`、`packages/capabilities/**`、`apps/api/**`、`apps/admin/**`、`packages/engine/**`、package/lock/config、generated/dist、真实导入样例、root/main checkout 或其他 worktree。
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source 预算：changed source files <= 1、net source LOC <= 320、new source files <= 0。
- test/generated/lock/config/docs 预计变更：新增 1 个 focused Node test；新增 spec/evidence；同步 M4 evidence README；不改 DB schema/migration/generated client、API/admin UI、lockfile、config 或 package。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：无新增 source 文件。`rg -n "worker|BullMQ|queue|import|导入|order import|CSV|XLSX|job" apps/worker apps/cron packages scripts/tests docs/specs/M4-*.md docs/evidence/M4/README.md` 显示 `apps/worker/src/main.ts` 仍是 M0 placeholder，M4-04/M4-05 已提供 DB/order-read contracts，M4-08 已提供 API repository port，但尚无 worker import contract；因此就地扩展 worker entry source，不新增平行文件。
- 外部 API/SDK/provider/connector/adapter 依据：none。本 PR 不新增、不调用、不声明任何外部 API/SDK/provider/connector/adapter 能力；ADR-B02 no-API branch remains active and `order_connector` remains absent.
- 是否需要例外：无。

## 文档触发检查

- 结果：`none`。
- 判断依据：`docs/doc-gates.md`；本 slice 用 spec/evidence/M4 README 记录 worker contract foundation，不新增 OpenAPI/generated DTO/runbook/production runtime。

## 前置条件

- 已读取 `AGENTS.md`、`docs/specs/README.md`、`docs/evidence/M4/README.md`、`docs/adr/ADR-B02-order-api.md`、M4-04/M4-05/M4-08 spec/evidence、v1.1 后台设计 §4.4、技术架构 §8/§10、验收矩阵 E-02/E-03/E-04/J-02/I-01、现有 worker placeholder 与 order-read/DB contract tests。
- ADR-B02 当前分支为 `no_api_for_m4__import_snapshot_main_path`；本 spec 不实现订单 API connector，不新增 `order_connector`，不调用或模拟外部 API。
- Worktree / branch：预期物理 worktree `/Users/atilla/Documents/uzmax-m4-09-order-import-worker-contract`；branch `codex/m4-09-order-import-worker-contract`；禁止写入 `/Users/atilla/Documents/UZMAX智能运营` root/main checkout。
- 开工记录：
  - `pwd`: `/Users/atilla/Documents/uzmax-m4-09-order-import-worker-contract`
  - `git status --short --branch`: `## codex/m4-09-order-import-worker-contract`
  - `git branch --show-current`: `codex/m4-09-order-import-worker-contract`
- Worker boundary preflight：`UZMAX_ASSIGNED_WORKTREE=/Users/atilla/Documents/uzmax-m4-09-order-import-worker-contract UZMAX_PRIMARY_ROOT=/Users/atilla/Documents/UZMAX智能运营 npm run guard:worker-boundary` passed with `worker-write-boundary: ok`.
- 并发派发证据：无并发 worker。本 branch 从 latest `main@f3beed7` 创建，open PR 为 `[]`，root/main clean，未合并分支为空。
- 事故触发器：若发现跨任务污染、写到分配 worktree 外、错分支/main 直接提交、secret/customer-data 边界擦边、gate 绕过、同一过程失败在一个里程碑内重复出现，停止并创建或引用 `docs/incidents/` 记录。

## 实施步骤

1. 在 `apps/worker/src/main.ts` 增加纯 worker contract：`createOrderImportWorkerDrafts(input)`。
2. 使用 M4-05 `createOrderImportBatchContract` 校验受控表格行，生成 accepted snapshot drafts 与 row error drafts。
3. 使用 M4-04 `m4OrderImportContracts` 生成 `import_job`、`order_snapshot`、`import_row_error` DB contract drafts；ID 由输入提供的 deterministic IDs 分配，避免 runtime side effects。
4. 对 scope、createdByUserId、sourceRef、importedAt、ID 分配数量 fail closed；不读取文件、env、Storage、Redis、Prisma 或网络。
5. 新增 focused Node test 覆盖 completed/completed_with_errors/failed summaries、row errors visible、scope propagation、no raw/no connector/no runtime side effect boundary 和 M4 evidence。
6. 同步 M4 evidence README，运行 validation chain，记录结果并提交 PR。

## 通过条件

- Worker contract 只接受 controlled row objects，不读取 raw CSV/XLSX 或真实文件。
- Import job draft 计数与 batch summary 一致，completed/completed_with_errors/failed 状态由代码确定。
- Successful rows 生成 order snapshot DB contract drafts；failed rows 生成 import row error DB contract drafts，错误行可见。
- 所有 drafts 保持 org/tenant scope，缺少 scope、user、ID 分配或 unsafe refs fail closed。
- Focused test 覆盖 E-02/E-03/E-04 worker-contract behavior 和 no API/no raw/no DB client/no queue boundary。
- Evidence file 记录 validation table、scope notes 和 no raw data/no API/no runtime DB/queue boundary。

## 失败分支

- 若需要真实 Prisma client、DB connection、RLS transaction wrapper、BullMQ/Redis、Storage 下载、CSV/XLSX parser、admin UI、real import files 或 external order API：停止并拆到后续 scoped spec。
- 若出现 raw order/customer samples、phone/address/payment/order IDs、credentials/env/secrets：停止、清理本 worker 改动并进入 incident/cleanup path。
- 若导入错误行不可见或成功行没有 snapshot contract draft：不得合并，修正为 fail-closed contract。
- 若 validation 失败且无法在 scope 内修复：提交 blocked evidence 或关闭/重开更小 spec；不得降低断言、删测试或扩大 mock。

## 不做什么

- 不新增 `order_connector`、外部 API adapter/provider/connector、Prisma client wiring、DB connection、schema/migration、generated client、admin UI/client、API route、BullMQ/Redis runtime、Storage downloader、feature flag、production config 或 real CSV/XLSX import。
- 不提交 raw/export/jsonl/csv/xlsx、真实客户明文、电话号码、地址、支付信息、订单号、截图、Telegram payload、LLM prompt/completion、env 或 secret。
- 不关闭 E-02/E-03/E-04/J-02/I-01 的 DB runtime/queue/admin E2E/AI acceptance；只提供 worker-contract foundation。

## 验收映射

| Item | Status | Notes |
|---|---|---|
| E-01 | `not_current_blocker__no_api_for_m4` | No `order_connector` or external API connector added. |
| E-02 | `worker_contract_supported_not_closed` | Adds controlled-row import worker drafts for jobs/errors/snapshots; real parser, DB client and admin E2E remain future scope. |
| E-03 | `worker_contract_supported_not_closed` | Snapshot drafts preserve source/expiry fields; persisted/runtime warning remains future scope. |
| E-04 | `worker_contract_supported_not_closed` | Worker creates data contracts only; AI eval/runtime integration remains future scope. |
| J-02 | `not_closed` | No real queue/retry/idempotency runtime is added. |
| I-01 | `partial_worker_contract_not_closed` | Adds worker-side import shape for future order workflow; full desktop core workflow remains future scope. |

## Closeout / Incident 记录

- Incident：none found in this spec execution at authoring time。
- Closeout evidence target: `docs/evidence/M4/M4-09-order-import-worker-contract.md`。
