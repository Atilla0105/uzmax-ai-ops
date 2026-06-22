# M4-20 API Audit Prisma Sink Contract

## 目标

为 M4 客户资产恢复审计补上最小 API audit persistence adapter contract：新增 `PrismaAuditSink`，把既有 `AuditLogContract` 映射到 Prisma-shaped `auditLog.create` data，并在 `AppModule` 只保留 type/constructor anchor。本 spec 不默认启用真实 DB provider、不创建 PrismaClient、不读取 env/secrets、不改 schema/migration/generated client、不实现 RLS transaction wrapper、审计查询 UI、客户资产完整 E2E 或生产发布关闭。

## Owner

Owner：确认本切片只作为 B-05/D-05 的 audit persistence adapter contract foundation，不代表真实生产 audit_log 写入、DB runtime provider 切换、RLS transaction wrapper、审计查询 UI、真实客户数据或 1.0 发布验收关闭。Owner 仍负责生产 DB/audit persistence 配置、真实客户数据、合规风险和最终发布决策。

AI agent：只在 `/Users/atilla/Documents/uzmax-m4-20-api-audit-prisma-sink` / `codex/m4-20-api-audit-prisma-sink` 执行；复核 no default DB runtime、no env/secrets、no PrismaClient、no raw customer/order data、复用既有 `API_AUDIT_SINK`/`AuditLogContract`、PR hygiene、worker boundary 和 M4 evidence index 同步。

## 时间盒

0.5 个工作日。若 audit Prisma sink contract 无法在预算内通过 focused Node test、type/lint/guard/check validation，则关闭或拆小；不得夹带真实 DB runtime、schema/migration、RLS transaction wrapper、admin UI、worker queue、真实客户样例或外部系统 connector 继续推进。

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M4-20-api-audit-prisma-sink-contract.md`
  - `docs/evidence/M4/M4-20-api-audit-prisma-sink-contract.md`
  - `docs/evidence/M4/README.md`
  - `docs/contracts/README.md`
  - `apps/api/src/app.module.ts`
  - `apps/api/src/audit-log.prisma-sink.ts`
  - `scripts/tests/m4-api-audit-prisma-sink-contract.test.mjs`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：不得触碰 `packages/db/prisma/**`、`packages/db/migrations/**`、`apps/admin/**`、`apps/worker/**`、`packages/capabilities/**`、package/lock/config、真实客户样例、root/main checkout 或其他 worktree。
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source 预算：changed source files <= 2、net source LOC <= 180、new source files <= 1。
- test/generated/lock/config/docs 预计变更：新增 1 个 focused Node test；新增 spec/evidence；同步 M4 evidence README；更新 contracts README 的 audit persistence adapter 边界；不改 DB schema/migration/generated client、admin UI、worker、lockfile、config 或 package。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：`rg -n "AuditSink|PrismaAuditSink|API_AUDIT_SINK|audit_log|AuditLogContract|access_context.denied|customer.flags_restored" apps packages scripts/tests docs/specs docs/evidence/M4 docs/contracts -S` 显示现有 `AuditSink` / `InMemoryAuditSink` / `API_AUDIT_SINK`、M1 `audit_log` schema/contract、M4-19 customer restore audit event 和 customer asset service sink record；没有 Prisma-shaped API audit sink adapter。为避免挤压 `access-context-core.ts` 与 `access-context.ts` 的 guard/authn 职责，新增 `apps/api/src/audit-log.prisma-sink.ts` 专门承载 audit persistence adapter contract，`app.module.ts` 只增加 type/constructor anchor，不默认启用 runtime provider。
- 外部 API/SDK/provider/connector/adapter 依据：Prisma dependency/generated schema model already exists in repo via `packages/db/prisma/schema.prisma` and `@prisma/client` package dependency；本 PR 不 import `@prisma/client`、不创建 `PrismaClient`、不新增外部 API/SDK/provider/connector/adapter、不调用外部客户系统、订单 API、LLM/provider 或真实 DB。
- 是否需要例外：无。

## 文档触发检查

- 结果：`updated`。
- 判断依据：`docs/doc-gates.md`；本 slice 新增 API audit persistence adapter contract，更新已存在的 `docs/contracts/README.md`，不新增 OpenAPI/generated DTO、production env validation、observability、runbook 或 release workflow。

## 前置条件

- 已读取 `AGENTS.md`、`docs/specs/README.md`、`docs/doc-gates.md`、`docs/evidence/M4/README.md`、`docs/contracts/README.md`、M1-02/M1-04/M4-19 spec/evidence、v1.1 PRD 审计原则、技术架构 audit_log/RLS/customer asset sections、后台设计 §4.3、验收矩阵 B-05/D-05/I-01、现有 API `AuditSink`、M1 audit schema/tests 与 customer asset restore audit tests。
- Worktree / branch：预期物理 worktree `/Users/atilla/Documents/uzmax-m4-20-api-audit-prisma-sink`；branch `codex/m4-20-api-audit-prisma-sink`；禁止写入 `/Users/atilla/Documents/UZMAX智能运营` root/main checkout。
- 开工记录：
  - `pwd`: `/Users/atilla/Documents/uzmax-m4-20-api-audit-prisma-sink`
  - `git status --short --branch`: `## codex/m4-20-api-audit-prisma-sink`
  - `git branch --show-current`: `codex/m4-20-api-audit-prisma-sink`
- Baseline：`npm ci` completed in the worker worktree; `npm test` passed with 215 Node tests before edits. `npm audit` reported existing high-severity dependency notices; dependency/lockfile changes are out of scope for this spec.
- Worker boundary preflight：`npm run guard:worker-boundary` with `UZMAX_ASSIGNED_WORKTREE` and `UZMAX_PRIMARY_ROOT` was attempted before edits but hung on this machine's `git status --untracked-files=all` root scan and was interrupted. Manual boundary evidence before edits: assigned worktree tracked clean, root/main tracked clean, `git diff --quiet`, `git diff --cached --quiet`, no root/worker `index.lock`, open PRs `[]`, `git branch --no-merged main` empty. Runtime prevention uses absolute assigned paths for all edits.
- 并发派发证据：无并发 worker。M4 evidence README、docs/contracts README 和 `apps/api/src/app.module.ts` 是共享触碰点，因此本 slice 串行执行。本 branch 从 latest `main@c1d0c3e` 创建，open PR 为 `[]`，root/main tracked clean，未合并分支为空。
- 事故触发器：若发现跨任务污染、写到分配 worktree 外、错分支/main 直接提交、secret/customer-data 边界擦边、gate 绕过、同一过程失败在一个里程碑内重复出现，停止并创建或引用 `docs/incidents/` 记录。

## 实施步骤

1. 新增 `AuditLogPrismaClientPort`、`PrismaAuditLogCreateData`、`toPrismaAuditLogCreateData` 与 `PrismaAuditSink`。
2. Adapter 只接受既有 `AuditLogContract` 可验证事件，并映射 Prisma model fields：org/tenant/actor/event/module/action/object/content/version refs/trace/occurredAt。
3. 对无法安全持久化到正式 `audit_log` 的 pre-audit `access_context.denied` 或 malformed event fail closed，且不得调用 `auditLog.create`。
4. `AppModule` 只增加 contract anchor；默认 provider 仍为 `api.InMemoryAuditSink`。
5. 更新 `docs/contracts/README.md` 记录 M4-20 adapter boundary，尤其 `access_context.denied` 仍不直接映射正式 `audit_log`。
6. 新增 focused Node test 覆盖 create data mapping、delegate call、fail-before-create、no env/no PrismaClient/no default provider boundary。
7. 同步 M4 evidence README，运行 validation chain，记录结果并提交 PR。

## 通过条件

- `PrismaAuditSink.record` 对 M4-19 restore `AuditLogContract` 调用一次 `auditLog.create({ data })`，data 字段与 Prisma `AuditLog` model names 对齐。
- Malformed/pre-audit event 在 create 前 fail closed；不得静默吞掉无法持久化的审计事件，不得写入不完整 `audit_log` row。
- `AppModule` 默认仍使用 `api.InMemoryAuditSink`；本 PR 不读取 env、不创建 PrismaClient、不连接 DB、不改 schema/migration/generated client。
- Focused test 覆盖 Prisma delegate contract、default runtime boundary、no raw/no env/no external connector。
- Evidence file 记录 validation table、scope notes 和 no raw data/no production DB runtime boundary。

## 失败分支

- 若需要真实 DB connection、env validation、RLS transaction wrapper、schema/migration、generated client commit、admin audit UI、worker queue、real customer data 或 external connector：停止并拆到后续 scoped spec。
- 若出现 raw customer/order samples、phone/address/payment/order IDs、Telegram usernames、credentials/env/secrets：停止、清理本 worker 改动并进入 incident/cleanup path。
- 若 adapter 默认启用 Prisma provider、吞掉 malformed event、或对缺 org/tenant/content 的 event 仍调用 create：不得合并，修正为 fail-before-create contract。
- 若 validation 失败且无法在 scope 内修复：提交 blocked evidence 或关闭/重开更小 spec；不得降低断言、删测试或扩大 mock。

## 不做什么

- 不新增外部 API adapter/provider/connector、DB schema/migration/generated client、PrismaClient provider、API route、admin UI/client、worker runtime、RLS transaction wrapper、audit query API/UI、customer asset history/order/quote/ticket aggregation runtime、field/tag management save、feature flag、production config 或 real customer sample。
- 不读取 `process.env`、不默认调用 `global fetch`、不连接或写入真实数据库、不提交 raw/export/jsonl/csv/xlsx 文件、真实客户明文、电话号码、地址、支付信息、订单号、截图、Telegram payload、LLM prompt/completion、env 或 secret。
- 不关闭 B-05/D-05/I-01 的 full audit persistence integration/admin owner flow/UI/E2E/release acceptance；只提供 API audit Prisma sink adapter contract foundation。

## 验收映射

| Item | Status | Notes |
|---|---|---|
| B-05 | `audit_prisma_sink_contract_supported_not_closed` | Adds opt-in Prisma-shaped audit sink adapter for `AuditLogContract`; real DB runtime provider, transaction/RLS evidence and audit query UI remain future scope. |
| D-05 | `audit_prisma_sink_contract_supported_not_closed` | Customer restore audit event can be mapped to `audit_log` create data; admin owner flow and real audit persistence integration remain future scope. |
| I-01 | `partial_customer_asset_api_runtime_not_closed` | Strengthens API audit persistence foundation for customer restore path; full desktop core workflow with runtime data remains future scope. |

## Closeout / Incident 记录

- Incident：none found in this spec execution at authoring time. Guard full-untracked status hang was handled as local tooling behavior with no repo write; final evidence must record whether it recurred during validation.
- Closeout evidence target: `docs/evidence/M4/M4-20-api-audit-prisma-sink-contract.md`。
