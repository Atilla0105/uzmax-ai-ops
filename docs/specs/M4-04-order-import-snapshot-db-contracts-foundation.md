# M4-04 Order Import Snapshot DB Contracts Foundation

## 目标

为 ADR-B02 no-API 分支交付最小订单导入快照 DB contracts foundation：`order_snapshot`、`import_job`、`import_row_error`、`order_query_log`，支持导入快照主路径、成功行可查、错误行可见、快照过期字段和查询降级/转人工记录。本 spec 只交付 schema/migration/contracts/test/evidence 地基，不实现外部 API connector、导入 runtime、admin UI、worker、真实 CSV/XLSX 读取或 AI order-read 路径。

## Owner

Owner：项目 owner 最终确认本 DB slice 是否可作为 M4 订单导入快照主路径的后续实现基础；仍负责真实订单样例、CSV/XLSX、客户数据、生产配置、外部 API、LLM key、成本和合规风险决策。

AI agent：只在 `/Users/atilla/Documents/uzmax-m4-04-order-import-snapshot-db-contracts` / `codex/m4-04-order-import-snapshot-db-contracts` 执行 spec、schema/migration/contracts/test/evidence、validation 和本地 commit；复核 no order API connector、no raw samples/order data、RLS/tenant scope、stale snapshot fields、PR hygiene 和 worker boundary。

## 时间盒

0.5 个工作日。若最小 order import snapshot DB contracts 无法在预算内通过 focused test、Prisma/type/lint/guard validation，则关闭本分支或拆小；不得夹带 admin UI、API runtime、worker import parser、真实样本或外部 API connector 继续推进。

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M4-04-order-import-snapshot-db-contracts-foundation.md`
  - `docs/evidence/M4/M4-04-order-import-snapshot-db-contracts-foundation.md`
  - `packages/db/prisma/schema.prisma`
  - `packages/db/migrations/**`
  - `packages/db/src/**`
  - `scripts/tests/m2-channel-conversation-foundation.test.mjs`
  - `scripts/tests/m3-ai-capability-data-contracts-foundation.test.mjs`
  - `scripts/tests/m4-customer-asset-db-contracts-foundation.test.mjs`
  - `scripts/tests/m4-order-import-snapshot-db-contracts-foundation.test.mjs`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：不得触碰 `apps/**`、`packages/capabilities/**`、`packages/engine/**`、`apps/api/**`、package files、lockfiles、generated/dist、CI config、`docs/evidence/M4/README.md` 或 root/main checkout。
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source 预算：changed source files <= 3、net source LOC <= 560、new source files <= 1。
- test/generated/lock/config/docs 预计变更：新增 1 个 focused Node test；更新 M2/M3/M4-02 历史边界测试，使其检查对应 milestone migration/slice 不引入 order tables，而不是永久禁止后续 M4 order schema；新增 1 个 SQL migration（generated 分类）；新增 spec/evidence docs；不改 lockfile/config/generated client。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：`rg -n "order_connector|order_snapshot|order_query_log|import_job|import_row_error|OrderSnapshot|ImportJob|导入快照|订单快照|过期" packages apps scripts docs/contracts docs/specs docs/evidence/M4` 只命中文档、admin shell wording 和历史测试的禁止 order/import 边界，未发现 order import snapshot DB contract source home；`packages/db/src/index.ts` 已接近文件长度上限，因此新增 `packages/db/src/m4-order-import-contracts.ts` 作为与 `m4-customer-asset-contracts.ts` 同类的 DB contract module，并在 `index.ts` 只做 type-only bridge。
- 外部 API/SDK/provider/connector/adapter 依据：none。本 PR 不新增、不调用、不声明任何外部 API/SDK/provider/connector/adapter 能力；ADR-B02 no-API branch remains active and `order_connector` is intentionally not added.
- 是否需要例外：无。

## 文档触发检查

- 结果：`none`。
- 判断依据：`docs/doc-gates.md`；当前 slice 用本 spec 与 focused M4 evidence 记录合同边界，不新增 OpenAPI/generated DTO/runbook/production runtime 触发项。

## 前置条件

- 已读取 `AGENTS.md`、`docs/specs/README.md`、`docs/specs/SPEC-template.md`、`docs/adr/ADR-B02-order-api.md`、`docs/evidence/M4/README.md`、v1.1 PRD/技术架构/后台设计/验收矩阵相关 E-02/E-03/E-04/order import sections、现有 Prisma schema/migrations、`packages/db/src` exports 和 DB contract tests。
- ADR-B02 当前分支为 `no_api_for_m4__import_snapshot_main_path`；本 spec 不实现订单 API connector，不新增 `order_connector`，不调用或模拟外部 API。
- Worktree / branch：预期物理 worktree `/Users/atilla/Documents/uzmax-m4-04-order-import-snapshot-db-contracts`；branch `codex/m4-04-order-import-snapshot-db-contracts`；禁止写入 `/Users/atilla/Documents/UZMAX智能运营` root/main checkout。
- 开工记录：
  - `pwd`: `/Users/atilla/Documents/uzmax-m4-04-order-import-snapshot-db-contracts`
  - `git status --short --branch`: `## codex/m4-04-order-import-snapshot-db-contracts`
  - `git branch --show-current`: `codex/m4-04-order-import-snapshot-db-contracts`
- Worker boundary preflight：`UZMAX_ASSIGNED_WORKTREE=/Users/atilla/Documents/uzmax-m4-04-order-import-snapshot-db-contracts UZMAX_PRIMARY_ROOT=/Users/atilla/Documents/UZMAX智能运营 npm run guard:worker-boundary` passed with `worker-write-boundary: ok`.
- 并发派发证据：无并发 worker；`packages/db` schema/migration 为全局串行点。本 branch 从 latest `main@621a924` 创建，open PR 为 `[]`，root/main clean。
- 事故触发器：若发现跨任务污染、写到分配 worktree 外、错分支或 main 直接提交、secret/customer-data 边界擦边、gate 绕过、同一过程失败在一个里程碑内重复出现，停止并创建或引用 `docs/incidents/` 记录。

## 实施步骤

1. 新增最小 Prisma order import snapshot models/enums：`OrderSnapshot`、`ImportJob`、`ImportRowError`、`OrderQueryLog`，显式不新增 `OrderConnector`。
2. 新增 SQL migration：tenant FK、scope-preserving cross-table FK、RLS enable/force、select/insert/update policies、least-privilege grants、no delete grant、payload/error/query metadata object checks、stale/expires timestamp checks。
3. 新增 `packages/db/src/m4-order-import-contracts.ts` pure constants/builders，保持 controlled refs/object summaries，避免 raw order/customer samples。
4. 新增 focused Node test 覆盖 Prisma model presence、SQL RLS/policies/grants、scope constraints、contract builders、stale snapshot fields、no `order_connector` boundary；同步更新 M2/M3/M4-02 历史测试。
5. 新增 M4-04 evidence file，记录验证、scope notes 和未关闭项。
6. 运行要求的 validation chain，记录结果并本地 commit；由 coordinator 验收后再 push/建 PR/merge/cleanup。

## 通过条件

- Prisma schema 显式建模 order import snapshot tables/contracts，并保持 `org_id`/`tenant_id` scope。
- SQL migration 对所有新增 tenant-scoped tables enable/force RLS，缺少 `app.org_id` / `app.tenant_id` fail closed，只授予 runtime role select/insert/update。
- `order_snapshot` 包含来源、外部订单 ref、批次 ref、状态 ref、更新时间、过期时间、payload summary object 和可选 customer/import job link。
- `import_job` 与 `import_row_error` 支持成功/失败行计数、错误行可见、错误报告 ref，但不存 raw row/order/customer data。
- `order_query_log` 可记录 hit/miss/stale/degraded/handoff decision refs，用于后续 E-04 runtime/AI path；本 slice 不执行 AI 判断。
- Focused test 覆盖 model/table/enums、scope constraints、RLS/policies/grants、pure contract builders 和 no order API connector boundary。
- Evidence file 记录 validation table、scope notes 和 no raw data/no API/no runtime boundary。

## 失败分支

- 若 schema/RLS 需要 external order API connector、真实 CSV/XLSX、admin UI、API route 或 worker parser：停止并拆到后续 M4 scoped spec。
- 若发现 raw customer/order samples、phone/address/payment/order IDs、credentials/env/secrets：停止、清理本 worker 改动并进入 incident/cleanup path。
- 若 validation 失败且无法在 scope 内修复：提交 blocked evidence 或关闭/重开更小 spec；不得降低断言、删测试或扩大 mock。

## 不做什么

- 不新增 `order_connector`，不实现外部 API adapter、provider、connector、runtime repository、worker、admin UI、API endpoint、feature flag、production config 或 generated client。
- 不读取或提交 raw/export/jsonl/csv/xlsx、真实客户明文、电话号码、地址、支付信息、订单号、截图、Telegram payload、LLM prompt/completion、env 或 secret。
- 不关闭 E-02/E-03/E-04 的 E2E/API/admin/runtime/AI acceptance；只提供 DB contract foundation。
- 不触碰 M4-01 admin UI、M4-02 customer asset source beyond historical tests, root/main checkout or other worktree。

## 验收映射

| Item | Status | Notes |
|---|---|---|
| E-01 | `not_current_blocker__no_api_for_m4` | No `order_connector` or external API connector added. |
| E-02 | `foundation_supported_not_closed` | Adds import job, row error and order snapshot DB foundation; import parser/admin E2E remains future scope. |
| E-03 | `foundation_supported_not_closed` | Adds `sourceUpdatedAt` / `expiresAt` and stale query log outcomes; runtime warning remains future scope. |
| E-04 | `foundation_supported_not_closed` | Adds query outcome/handoff log contract; AI redline/eval/runtime behavior remains future scope. |
| D-04 | `foundation_supported_not_closed` | Order snapshot can link to customer; customer detail UI/API remains future scope. |

## Closeout / Incident 记录

- Incident：none found in this spec execution at authoring time。
- Closeout evidence target: `docs/evidence/M4/M4-04-order-import-snapshot-db-contracts-foundation.md`。
