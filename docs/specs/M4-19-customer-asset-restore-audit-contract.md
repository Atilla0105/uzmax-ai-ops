# M4-19 Customer Asset Restore Audit Contract

## 目标

为 M4 客户资产恢复动作交付最小 audit contract：新增 customer flags restored 审计事件 helper，并让 `CustomerAssetService.restoreCustomerFlags` 通过既有 API `AuditSink` 记录 contract-shaped audit event。本 spec 不实现真实 `audit_log` 持久化、不启用 DB runtime、不创建 PrismaClient、不读取 env/secrets、不调用外部 API、不改 admin UI 或 worker。

## Owner

Owner：确认本切片只作为 D-05/B-05 的 customer asset restore audit-contract foundation，不代表真实审计持久化、审计查询 UI、RLS transaction wrapper、客户资产完整 E2E、真实客户数据或 1.0 发布验收关闭。Owner 仍负责真实客户数据、生产 DB/audit persistence、合规风险和最终发布决策。

AI agent：只在 `/Users/atilla/Documents/uzmax-m4-19-customer-asset-restore-audit-contract` / `codex/m4-19-customer-asset-restore-audit-contract` 执行；复核 no real DB runtime、no env/secrets、no PrismaClient、no raw customer/order data、复用既有 `API_AUDIT_SINK`、PR hygiene、worker boundary 和 M4 evidence index 同步。

## 时间盒

0.5 个工作日。若 restore audit contract 无法在预算内通过 focused Node test、type/lint/guard/check validation，则关闭或拆小；不得夹带真实 audit persistence、DB runtime、admin UI 改造、worker queue、schema/migration、真实客户样例或外部系统 connector 继续推进。

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M4-19-customer-asset-restore-audit-contract.md`
  - `docs/evidence/M4/M4-19-customer-asset-restore-audit-contract.md`
  - `docs/evidence/M4/README.md`
  - `packages/db/src/index.ts`
  - `apps/api/scripts/runtime-compiler.mjs`
  - `apps/api/src/customer-asset.service.ts`
  - `scripts/tests/m1-platform-foundation.test.mjs`
  - `scripts/tests/m4-customer-asset-api-shell.test.mjs`
  - `scripts/tests/m4-customer-asset-persistence-gateway.test.mjs`
  - `scripts/tests/m4-customer-asset-restore-audit-contract.test.mjs`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：不得触碰 `packages/db/prisma/**`、`packages/db/migrations/**`、`apps/admin/**`、`apps/worker/**`、`packages/capabilities/**`、package/lock/config、真实客户样例、root/main checkout 或其他 worktree。
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source 预算：changed source files <= 3、net source LOC <= 220、new source files <= 0。
- test/generated/lock/config/docs 预计变更：新增 1 个 focused Node test；更新 M1/M4 focused compatibility tests；新增 spec/evidence；同步 M4 evidence README；不改 DB schema/migration/generated client、admin UI、worker、lockfile、config 或 package。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：`rg -n "customer\\.flags_restored|createCustomerAssetRestoreAuditContract|CustomerAssetRestoreAudit|API_AUDIT_SINK|auditDraft|restoreCustomerFlags|customer asset audit|audit persistence" apps packages scripts docs/specs docs/evidence/M4 -S` 显示现有 `API_AUDIT_SINK`、`AuditLogContract`、M4 restore `auditDraft` 和 customer asset service/persistence foundations；没有 customer asset restore audit helper，也没有独立 customer asset audit sink。按就地优先，本 spec 只扩展 `packages/db/src/index.ts` 的治理 contract helper 与 `apps/api/src/customer-asset.service.ts` 的既有 restore flow，不新增 source 文件。
- 外部 API/SDK/provider/connector/adapter 依据：无；不新增外部 API/SDK/provider/connector/adapter；不调用外部客户系统、订单 API、LLM/provider 或真实 DB。
- 是否需要例外：无。

## 文档触发检查

- 结果：`none`。
- 判断依据：`docs/doc-gates.md`；本 slice 只增加 audit contract helper、API service sink handoff 和 M4 evidence，不新增 OpenAPI/generated DTO、production env validation、observability、runbook 或 release workflow。

## 前置条件

- 已读取 `AGENTS.md`、`docs/specs/README.md`、`docs/doc-gates.md`、`docs/evidence/M4/README.md`、M4-14/M4-17/M4-18 spec/evidence、v1.1 PRD REQ-T03/REQ-T13 与审计原则、技术架构 audit_log/customer asset sections、后台设计 §4.3、验收矩阵 B-05/D-05/I-01、现有 API `AuditSink` 与 customer asset service/tests。
- Worktree / branch：预期物理 worktree `/Users/atilla/Documents/uzmax-m4-19-customer-asset-restore-audit-contract`；branch `codex/m4-19-customer-asset-restore-audit-contract`；禁止写入 `/Users/atilla/Documents/UZMAX智能运营` root/main checkout。
- 开工记录：
  - `pwd`: `/Users/atilla/Documents/uzmax-m4-19-customer-asset-restore-audit-contract`
  - `git status --short --branch`: `## codex/m4-19-customer-asset-restore-audit-contract`
  - `git branch --show-current`: `codex/m4-19-customer-asset-restore-audit-contract`
- Worker boundary preflight：`UZMAX_ASSIGNED_WORKTREE=/Users/atilla/Documents/uzmax-m4-19-customer-asset-restore-audit-contract UZMAX_PRIMARY_ROOT=/Users/atilla/Documents/UZMAX智能运营 npm run guard:worker-boundary` passed with `worker-write-boundary: ok`.
- 并发派发证据：无并发 worker。M4 evidence README、`packages/db/src/index.ts` 和 customer asset service files 均为共享触碰点，因此本 slice 串行执行。本 branch 从 latest `main@93b6188` 创建，open PR 为 `[]`，root/main clean，未合并分支为空。
- 事故触发器：若发现跨任务污染、写到分配 worktree 外、错分支/main 直接提交、secret/customer-data 边界擦边、gate 绕过、同一过程失败在一个里程碑内重复出现，停止并创建或引用 `docs/incidents/` 记录。

## 实施步骤

1. 在 DB governance contract helper 中新增 `customer.flags_restored` 事件类型与 `createCustomerAssetRestoreAuditContract`。
2. Restore audit content 只包含受控 before/after flag snapshot、reasonRef、restoredFlags、actor、org/tenant、customer object id；不包含 raw customer/order payload。
3. `CustomerAssetService` 注入既有 `API_AUDIT_SINK`，restore 保存后记录 contract-shaped audit event。
4. 保持 `auditDraft` response 兼容既有 admin client 顶层字段，同时把 contract-shaped event 字段返回给 API caller；audit sink 中记录纯 event。
5. 更新 runtime compiler customer asset service import mapping。
6. 新增/更新 focused tests 覆盖 DB helper、service sink record、compat response、no duplicate audit sink、no real DB/env/Prisma boundary。
7. 同步 M4 evidence README，运行 validation chain，记录结果并提交 PR。

## 通过条件

- `createCustomerAssetRestoreAuditContract` 生成 `AuditLogContract` 形状，eventType/action/module/objectType/objectId/org/tenant/actor/content before-after 均可断言。
- Restore action 在 repository save 后通过既有 API audit sink record 一条事件；无权限、缺 access context、跨租户 customer 仍沿用既有 fail-closed 行为。
- 不新增 customer asset 专用 audit sink infrastructure；`AppModule` 仍使用 `api.API_AUDIT_SINK` / `api.InMemoryAuditSink`。
- 本 PR 不读取 env、不创建 PrismaClient、不连接 DB、不改 schema/migration、不触碰 admin UI/worker。
- Evidence file 记录 validation table、scope notes 和 no raw data/no production DB audit persistence boundary。

## 失败分支

- 若需要真实 `audit_log` repository、DB connection、env validation、RLS transaction wrapper、schema/migration、generated client commit、admin audit UI、worker queue、real customer data 或 external connector：停止并拆到后续 scoped spec。
- 若出现 raw customer/order samples、phone/address/payment/order IDs、Telegram usernames、credentials/env/secrets：停止、清理本 worker 改动并进入 incident/cleanup path。
- 若 restore audit event 缺 actor/time/before/after、越权记录跨租户 customer 或新建重复 audit sink infrastructure：不得合并，修正为复用既有 sink 与 fail-closed contract。
- 若 validation 失败且无法在 scope 内修复：提交 blocked evidence 或关闭/重开更小 spec；不得降低断言、删测试或扩大 mock。

## 不做什么

- 不新增外部 API adapter/provider/connector、DB schema/migration/generated client、PrismaClient provider、API route、admin UI/client、worker runtime、RLS transaction wrapper、audit persistence repository、history/order/quote/ticket aggregation runtime、field/tag management save、feature flag、production config 或 real customer sample。
- 不读取 `process.env`、不默认调用 `global fetch`、不连接或写入真实数据库、不提交 raw/export/jsonl/csv/xlsx 文件、真实客户明文、电话号码、地址、支付信息、订单号、截图、Telegram payload、LLM prompt/completion、env 或 secret。
- 不关闭 B-05/D-05/I-01 的 full audit persistence/admin owner flow/UI/E2E/release acceptance；只提供 restore audit contract foundation。

## 验收映射

| Item | Status | Notes |
|---|---|---|
| B-05 | `audit_contract_supported_not_closed` | Restore action now creates and records a contract-shaped audit event through the API audit sink; real audit_log persistence/integration evidence remains future scope. |
| D-05 | `audit_contract_supported_not_closed` | Blacklist/unreachable restore keeps persistence handoff and adds audit sink record; admin owner flow and real audit persistence remain future scope. |
| I-01 | `partial_customer_asset_api_runtime_not_closed` | Adds audit contract behavior to customer restore API foundation; full desktop core workflow with runtime data remains future scope. |

## Closeout / Incident 记录

- Incident：none found in this spec execution at authoring time。
- Closeout evidence target: `docs/evidence/M4/M4-19-customer-asset-restore-audit-contract.md`。
