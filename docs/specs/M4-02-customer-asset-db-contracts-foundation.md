# M4-02 Customer Asset DB Contracts Foundation

## 目标

为 M4 客户资产中心交付最小 durable DB contracts foundation：客户记录、渠道/外部身份、客户自定义字段定义和值、客户标签定义和分配、租户/集团 scope、审计时间戳与黑名单/不可达状态 flags。本 spec 只交付 schema/migration/contracts/test/evidence 地基，不实现订单导入、订单快照、外部 API、admin UI、runtime repository 或真实数据接入。

## Owner

Owner：项目 owner 最终确认本 DB slice 是否可作为 M4 客户资产后续实现基础；仍负责真实客户数据、订单数据、外部 API、生产配置、LLM key、成本和合规风险决策。

AI agent：只在 `/Users/atilla/Documents/uzmax-m4-02-customer-asset-db-contracts-foundation` / `codex/m4-02-customer-asset-db-contracts-foundation` 执行 spec、schema/migration/contracts/test/evidence、validation 和本地 commit；复核 no order/import/API tables、no raw samples/customer data、RLS/tenant scope、PR hygiene 和 worker boundary。

## 时间盒

0.5 个工作日。若最小 customer asset DB contracts 无法在预算内通过 focused test、Prisma/type/lint/guard validation，则关闭本分支或拆小；不得夹带 order import/snapshot/API/admin/runtime 继续推进。

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M4-02-customer-asset-db-contracts-foundation.md`
  - `docs/evidence/M4/M4-02-customer-asset-db-contracts-foundation.md`
  - `packages/db/prisma/schema.prisma`
  - `packages/db/migrations/**`
  - `packages/db/src/**`
  - `scripts/tests/m1-platform-foundation.test.mjs`
  - `scripts/tests/m2-channel-conversation-foundation.test.mjs`
  - `scripts/tests/m3-ai-capability-data-contracts-foundation.test.mjs`
  - `scripts/tests/m4-customer-asset-db-contracts-foundation.test.mjs`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：不得触碰 `docs/evidence/M4/README.md`、`apps/admin/**`、`apps/api/**`、`packages/capabilities/**`、`packages/engine/**`、package files、lockfiles、generated/dist、CI config、order import/snapshot files、root/main checkout 或其他 worktree。
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source 预算：changed source files <= 3、net source LOC <= 520、new source files <= 1。
- test/generated/lock/config/docs 预计变更：新增 1 个 focused Node test；更新 M1/M2/M3 历史边界测试，使其检查对应 milestone migration/slice 不引入 customer/order，而不是永久禁止后续 M4 customer schema；新增 1 个 SQL migration（generated 分类）；新增 spec/evidence docs；不改 lockfile/config/generated client。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：`rg -n "customer|Customer|customer_identity|custom_field|tag_definition|tag_assignment|field_definition|identity" packages/db/prisma/schema.prisma packages/db/src packages/db/migrations scripts/tests docs/contracts` 只命中既有 identity 约束、历史测试的禁止 customer/order 边界和 docs prose，未发现 customer asset/customer identity/custom field/tag source home；`packages/db/src/index.ts` 已接近文件长度上限，且现有测试 harness 会用 data URL 导入 `index.ts`，因此新增 `packages/db/src/m4-customer-asset-contracts.ts` 作为与 `m3-ai-contracts.ts` 同类的 DB contract module，并在 `index.ts` 只做 type-only bridge。
- 外部 API/SDK/provider/connector/adapter 依据：none。本 PR 不新增、不调用、不声明任何外部 API/SDK/provider/connector/adapter 能力；ADR-B02 no-API branch remains active for current M4 order work。
- 是否需要例外：无。

## 文档触发检查

- 结果：`none`。
- 判断依据：`docs/doc-gates.md`；当前 slice 用本 spec 与 focused M4 evidence 记录合同边界，不新增 OpenAPI/generated DTO/runbook/production runtime 触发项。

## 前置条件

- 已读取 `AGENTS.md`、`docs/specs/README.md`、`docs/specs/SPEC-template.md`、`docs/adr/ADR-B02-order-api.md`、`docs/evidence/M4/README.md`、v1.1 PRD/技术架构/后台设计/验收矩阵相关 D-04/D-05/D-07/M4/customer asset sections、现有 Prisma schema/migrations、`packages/db/src` exports 和 DB contract tests。
- ADR-B02 当前分支为 `no_api_for_m4__import_snapshot_main_path`；本 spec 不实现订单 API connector、导入快照主路径、订单快照或订单状态 AI 路径。
- Worktree / branch：预期物理 worktree `/Users/atilla/Documents/uzmax-m4-02-customer-asset-db-contracts-foundation`；branch `codex/m4-02-customer-asset-db-contracts-foundation`；禁止写入 `/Users/atilla/Documents/UZMAX智能运营` root/main checkout。
- 开工记录：
  - `pwd`: `/Users/atilla/Documents/uzmax-m4-02-customer-asset-db-contracts-foundation`
  - `git status --short --branch`: `## codex/m4-02-customer-asset-db-contracts-foundation`
  - `git branch --show-current`: `codex/m4-02-customer-asset-db-contracts-foundation`
- Worker boundary preflight：`UZMAX_ASSIGNED_WORKTREE=/Users/atilla/Documents/uzmax-m4-02-customer-asset-db-contracts-foundation UZMAX_PRIMARY_ROOT=/Users/atilla/Documents/UZMAX智能运营 npm run guard:worker-boundary` passed with `worker-write-boundary: ok`.
- 并发派发证据：无并发 worker；`packages/db` schema/migration 为全局串行点。本 branch 从最新 `main@3a5a5e3` 创建，open PR 为 `[]`，root/main clean。
- 事故触发器：若发现跨任务污染、写到分配 worktree 外、错分支或 main 直接提交、secret/customer-data 边界擦边、gate 绕过、同一过程失败在一个里程碑内重复出现，停止并创建或引用 `docs/incidents/` 记录。

## 实施步骤

1. 新增最小 Prisma customer asset models/enums：`customer`、`customer_identity`、`custom_field_definition`、`customer_field_value`、`tag_definition`、`tag_assignment`。
2. 新增 SQL migration：tenant FK、scope-preserving cross-table FK、RLS enable/force、select/insert/update policies、least-privilege grants、no delete grant。
3. 新增 `packages/db/src/m4-customer-asset-contracts.ts` pure constants/builders，保持 ref/object payloads，避免 raw customer sample assumptions。
4. 新增 focused Node test 覆盖 Prisma model presence、SQL RLS/policies/grants、scope constraints、contract builders 与 forbidden order/import/API tables；同步更新 M1/M2/M3 历史测试，使旧 milestone 边界仍成立但不阻断 M4 customer schema。
5. 新增 M4-02 evidence file，记录验证、scope notes 和未关闭项。
6. 运行要求的 validation chain，记录结果并本地 commit；由 coordinator 验收后再 push/建 PR/merge/cleanup。

## 通过条件

- Prisma schema 显式建模 M4-02 customer asset tables/contracts，并保持 `org_id`/`tenant_id` scope。
- SQL migration 对所有新增 tenant-scoped tables enable/force RLS，缺少 `app.org_id` / `app.tenant_id` fail closed，只授予 runtime role select/insert/update。
- Focused test 覆盖 model/table/enums、scope constraints、RLS/policies/grants、pure contract builders 和 no order/import/API table boundary。
- Evidence file 记录 validation table、scope notes 和 no raw data/no API/no order snapshot boundary。
- Worktree/root boundary guard 和 final statuses clean。

## 失败分支

- 若 schema/RLS 需要 order import/snapshot/API connector/admin/runtime config：停止并拆到后续 M4 scoped spec；本 PR 只保留 customer asset DB contracts。
- 若发现 raw customer/order samples、phone/address/payment/order IDs、credentials/env/secrets：停止、清理本 worker 改动并进入 incident/cleanup path。
- 若 validation 失败且无法在 scope 内修复：提交 blocked evidence 或关闭/重开更小 spec；不得降低断言、删测试或扩大 mock。

## 不做什么

- 不新增 `order_connector`、`order_snapshot`、`order_query_log`、`import_job`、`import_row_error` 或任何 order API/import/snapshot table。
- 不实现外部 API adapter、provider、connector、runtime repository、worker、admin UI、API endpoint、feature flag、production config 或 generated client。
- 不提交 raw/export/jsonl/csv/xlsx、真实客户明文、电话号码、地址、支付信息、订单号、截图、Telegram payload、LLM prompt/completion、env 或 secret。
- 不关闭 D-04/D-05/D-07 的 E2E/API/admin acceptance；只提供 DB contract foundation。
- 不触碰 M4-01 admin UI、root/main checkout 或其他 worktree。

## 验收映射

| Item | Status | Notes |
|---|---|---|
| B-01 | `foundation_supported_not_closed` | 新增客户资产表的 RLS/tenant scope contract；完整越权自动化仍在后续 integration/RLS suites。 |
| D-04 | `foundation_supported_not_closed` | 客户详情核心 customer/identity/field/tag persistence foundation；历史会话、订单、报价、工单回查 UI/API 不在本 slice。 |
| D-05 | `foundation_supported_not_closed` | `is_blacklisted` / `is_unreachable` flags and timestamps exist；解除流程与 audit write API/admin remain future specs。 |
| D-07 | `foundation_supported_not_closed` | Customer custom field/tag definitions and assignments exist；conversation tags/analysis filtering/admin config remain future specs。 |
| E-01/E-02/E-03/E-04 | `not_touched` | ADR-B02 no-API branch remains; no order API/import/snapshot/AI order status implementation in this slice. |

## Closeout / Incident 记录

- Incident：none found in this spec execution at authoring time。
- Closeout evidence target: `docs/evidence/M4/M4-02-customer-asset-db-contracts-foundation.md`。
