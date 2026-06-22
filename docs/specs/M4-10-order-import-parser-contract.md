# M4-10 Order Import Parser Contract

## 目标

为 ADR-B02 no-API 分支交付最小订单导入 parser-contract foundation：把受控 synthetic CSV text 解析成 M4-09 worker 可消费的 controlled row objects，再由 M4-05 `order-read` 与 M4-04 DB contract drafts 继续校验。本 spec 只做纯 CSV text parser contract、测试加载 helper 与 focused test；不实现真实文件读取、XLSX parser、Storage 下载、Prisma client、DB 写入、BullMQ/Redis、admin API client、外部订单 API connector、真实订单数据或 AI runtime。

## Owner

Owner：确认本切片只作为 E-02 的 parser-contract foundation，不代表真实导入文件、XLSX、Storage ingestion、DB client wiring、worker queue、admin-to-API E2E、AI runtime/eval 或 1.0 发布验收关闭。Owner 仍负责真实导入样例、字段映射、客户/订单数据、生产配置、LLM key、成本和合规风险决策。

AI agent：只在 `/Users/atilla/Documents/uzmax-m4-10-order-import-parser-contract` / `codex/m4-10-order-import-parser-contract` 执行；复核 no external order API、no `order_connector`、no file/env/secrets/Storage/Prisma/Redis/BullMQ runtime、no raw customer/order data、CSV header fail-closed、row budget、M4-09 compatibility、PR hygiene、worker boundary 和 M4 evidence index 同步。

## 时间盒

0.5 个工作日。若 parser contract 无法在预算内通过 focused Node test、type/lint/guard/check validation，则关闭或拆小；不得夹带真实文件读取、XLSX、DB client、queue runtime、admin UI、真实导入样例或外部 API connector 继续推进。

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M4-10-order-import-parser-contract.md`
  - `docs/evidence/M4/M4-10-order-import-parser-contract.md`
  - `docs/evidence/M4/README.md`
  - `apps/worker/src/main.ts`
  - `scripts/tests/m4-worker-test-loader.mjs`
  - `scripts/tests/m4-order-import-worker-contract.test.mjs`
  - `scripts/tests/m4-order-import-parser-contract.test.mjs`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：不得触碰 `packages/db/**`、`packages/capabilities/**`、`apps/api/**`、`apps/admin/**`、`packages/engine/**`、package/lock/config、generated/dist、真实导入样例、root/main checkout 或其他 worktree。
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source 预算：changed source files <= 1、net source LOC <= 260、new source files <= 0。
- test/generated/lock/config/docs 预计变更：新增 1 个 focused Node test；抽取 1 个 worker test loader；更新既有 M4-09 worker test 只复用 loader；新增 spec/evidence；同步 M4 evidence README；不改 DB schema/migration/generated client、API/admin UI、lockfile、config 或 package。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：无新增 source 文件。`rg -n "parse|parser|CSV|csv|XLSX|xlsx|import row|controlled row|OrderImportWorker|createOrderImportWorkerDrafts|sourceRef|rowNumber|payloadSummary" apps packages scripts/tests docs/specs/M4-*.md docs/evidence/M4` 显示现有 M4-05/M4-09 已有 controlled row 校验与 worker draft generation，但 `apps/worker/src/main.ts` 尚无 CSV/table text parser contract；因此就地扩展 worker entry source，不新增平行 source 文件。
- 外部 API/SDK/provider/connector/adapter 依据：none。本 PR 不新增、不调用、不声明任何外部 API/SDK/provider/connector/adapter 能力；ADR-B02 no-API branch remains active and `order_connector` remains absent.
- 是否需要例外：无。

## 文档触发检查

- 结果：`none`。
- 判断依据：`docs/doc-gates.md`；本 slice 用 spec/evidence/M4 README 记录 parser contract foundation，不新增 OpenAPI/generated DTO/runbook/production runtime。

## 前置条件

- 已读取 `AGENTS.md`、`docs/specs/README.md`、`docs/doc-gates.md`、`docs/evidence/M4/README.md`、`docs/adr/ADR-B02-order-api.md`、M4-05/M4-09 spec/evidence、v1.1 PRD REQ-T04、后台设计 §4.4、技术架构 §8、验收矩阵 E-02/E-03/E-04/J-02/I-01、现有 worker source 与 order-read/worker tests。
- ADR-B02 当前分支为 `no_api_for_m4__import_snapshot_main_path`；本 spec 不实现订单 API connector，不新增 `order_connector`，不调用或模拟外部 API。
- Worktree / branch：预期物理 worktree `/Users/atilla/Documents/uzmax-m4-10-order-import-parser-contract`；branch `codex/m4-10-order-import-parser-contract`；禁止写入 `/Users/atilla/Documents/UZMAX智能运营` root/main checkout。
- 开工记录：
  - `pwd`: `/Users/atilla/Documents/uzmax-m4-10-order-import-parser-contract`
  - `git status --short --branch`: `## codex/m4-10-order-import-parser-contract`
  - `git branch --show-current`: `codex/m4-10-order-import-parser-contract`
- Worker boundary preflight：`UZMAX_ASSIGNED_WORKTREE=/Users/atilla/Documents/uzmax-m4-10-order-import-parser-contract UZMAX_PRIMARY_ROOT=/Users/atilla/Documents/UZMAX智能运营 npm run guard:worker-boundary` passed with `worker-write-boundary: ok`.
- 并发派发证据：无并发 worker。本 branch 从 latest `main@309d155` 创建，open PR 为 `[]`，root/main clean，未合并分支为空。
- 事故触发器：若发现跨任务污染、写到分配 worktree 外、错分支/main 直接提交、secret/customer-data 边界擦边、gate 绕过、同一过程失败在一个里程碑内重复出现，停止并创建或引用 `docs/incidents/` 记录。

## 实施步骤

1. 在 `apps/worker/src/main.ts` 增加纯 `parseOrderImportCsvText(input)` contract。
2. 支持受控 CSV text 的 header normalization、quoted-field parsing、blank row skipping、row budget 与 fail-closed header validation。
3. 输出 M4-09 worker 可消费的 controlled row objects：`rowNumber`、`sourceRef`、controlled refs、timestamp fields 与 safe `payloadSummary`。
4. 复用 M4-09 worker draft contract 做端到端 focused test：parser rows -> order-read batch -> DB contract drafts。
5. 抽取测试 loader，避免 M4 worker tests 复制 TS dynamic import helper。
6. 同步 M4 evidence README，运行 validation chain，记录结果并提交 PR。

## 通过条件

- Parser 只接受传入的 controlled synthetic CSV text，不读取文件、Storage、env、网络、Prisma 或 Redis/BullMQ。
- Header normalization 支持空格/连字符到 snake_case；未知/重复/缺失必需 header fail closed。
- Parser 输出的 rows 能被 M4-09 worker draft contract 与 M4-05 order-read 校验继续处理，错误行保持可见。
- Blank rows 被跳过；超过 row budget fail closed。
- Focused test 覆盖 parse success、worker draft integration、header/malformed CSV failure、row budget、no API/no raw/no DB client/no queue boundary。
- Evidence file 记录 validation table、scope notes 和 no raw data/no API/no runtime DB/queue boundary。

## 失败分支

- 若需要真实 CSV/XLSX 文件读取、Storage 下载、browser upload、DB connection、RLS transaction wrapper、BullMQ/Redis、admin UI、real import files 或 external order API：停止并拆到后续 scoped spec。
- 若出现 raw order/customer samples、phone/address/payment/order IDs、credentials/env/secrets：停止、清理本 worker 改动并进入 incident/cleanup path。
- 若 parser 输出绕过 M4-05/M4-09 校验、错误行不可见或 header validation 允许 raw carrier：不得合并，修正为 fail-closed contract。
- 若 validation 失败且无法在 scope 内修复：提交 blocked evidence 或关闭/重开更小 spec；不得降低断言、删测试或扩大 mock。

## 不做什么

- 不新增 `order_connector`、外部 API adapter/provider/connector、Prisma client wiring、DB connection、schema/migration、generated client、admin UI/client、API route、BullMQ/Redis runtime、Storage downloader、feature flag、production config、real file upload 或 XLSX import。
- 不提交 raw/export/jsonl/csv/xlsx 文件、真实客户明文、电话号码、地址、支付信息、订单号、截图、Telegram payload、LLM prompt/completion、env 或 secret。
- 不关闭 E-02/E-03/E-04/J-02/I-01 的 DB runtime/queue/admin E2E/AI acceptance；只提供 parser-contract foundation。

## 验收映射

| Item | Status | Notes |
|---|---|---|
| E-01 | `not_current_blocker__no_api_for_m4` | No `order_connector` or external API connector added. |
| E-02 | `parser_contract_supported_not_closed` | Adds bounded CSV text parser contract for controlled rows; real file/XLSX ingestion, DB client and admin E2E remain future scope. |
| E-03 | `parser_contract_supported_not_closed` | Parser preserves source/update/expiry fields for downstream stale warning contracts; persisted/runtime warning remains future scope. |
| E-04 | `parser_contract_supported_not_closed` | Parser only shapes data; order-read still hands off stale/missing without fabrication; AI eval/runtime integration remains future scope. |
| J-02 | `not_closed` | No real queue/retry/idempotency runtime is added. |
| I-01 | `partial_worker_contract_not_closed` | Adds parser shape for future order workflow; full desktop core workflow remains future scope. |

## Closeout / Incident 记录

- Incident：none found in this spec execution at authoring time。
- Closeout evidence target: `docs/evidence/M4/M4-10-order-import-parser-contract.md`。
