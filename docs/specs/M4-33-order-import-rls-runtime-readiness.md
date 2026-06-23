# M4-33 Order Import RLS Runtime Readiness

## 目标

为 ADR-B02 no-API import snapshot 主路径补齐最小 RLS runtime readiness：在不默认启用生产 DB 的前提下，让 `apps/api` 的 order import repository 能通过显式 env mode 装配到 `@uzmax/db` PrismaClient、ADR-001 RLS batch runner 和既有 `RlsOrderImportPersistenceGateway`。本 spec 同步记录 2026-06-23 Supabase branch 上 `0001-0006` migration apply 与最小 synthetic RLS 验证结果，作为 M4 后续竖切的真实 DB 基线。

本 spec 不关闭 E-02/E-03/E-04/J-02/I-01；它把阻断从“schema 从未真实 apply”推进为“runtime 可显式接 RLS DB，仍需 API/auth/worker/admin E2E 和真实导入样例”。

## 项目 Owner 确认点与 AI Agent 责任

Owner：确认当前无订单 API，继续采用 ADR-B02 no-API 分支；确认 Supabase dev branch 成本已按工具提示 `0.01344 USD/hour` 走确认流程，验证后 branch 已删除；真实 DB URL、客户/订单数据、生产配置、成本和合规风险仍由 owner 决策。

AI agent：只在 `/Users/atilla/Documents/uzmax-m4-33-order-import-rls-runtime-readiness` / `codex/m4-33-order-import-rls-runtime-readiness` 执行；负责复核 M4 文档、真库验证结果、RLS-only runtime selector、默认 in-memory 不变、无外部 order API/no `order_connector`、无 raw customer/order data、无裸 Prisma env runtime 绕过 RLS、PR hygiene、worker boundary 和 M4 evidence index 同步。

## 时间盒

0.5 个工作日。若 runtime readiness 无法在预算内通过 focused Node tests、type/lint/guards/check validation，则关闭或拆小；不得夹带 real BullMQ/Redis、Storage downloader、API auth E2E、admin UI E2E、真实导入样例、生产 DB config 或外部 API connector。

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M4-33-order-import-rls-runtime-readiness.md`
  - `docs/evidence/M4/M4-33-order-import-rls-runtime-readiness.md`
  - `docs/evidence/M4/README.md`
  - `packages/db/src/prisma-runtime.ts`
  - `apps/api/src/app.module.ts`
  - `apps/api/scripts/runtime-compiler.mjs`
  - `apps/api/src/order-import.runtime.ts`
  - `scripts/tests/m4-order-import-runtime-provider-contract.test.mjs`
  - `scripts/tests/m4-order-import-rls-batch-runner-contract.test.mjs`
  - `scripts/tests/m4-order-import-rls-runtime-readiness.test.mjs`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：不得触碰 `packages/db/prisma/**`、`packages/db/migrations/**`、`apps/admin/**`、`apps/worker/**`、package/lock/config、真实导入样例、root/main checkout 或其他 worktree。

## 变更预算与路径分类

- source 预计变更：新增 source files <= 2，changed source files <= 5，net source LOC <= 250。
- test/generated/lock/config/docs 预计变更：新增 1 个 focused Node test；更新 2 个既有 focused test；新增 spec/evidence；同步 M4 evidence README；不改 schema/migration/generated client、admin UI、worker、lockfile、config 或 package。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：已检索 `OrderImportRepositoryProvider`, `RlsOrderImportPersistenceGateway`, `createOrderImportRlsBatchTransactionRunner`, `PrismaClient`, `UZMAX_RLS_DATABASE_URL`, `ORDER_IMPORT_REPOSITORY`, `order_connector`。现有代码已有 repository selector、RLS batch runner 和 Prisma-shaped gateway，但没有 DB package PrismaClient/env factory，也没有 API env runtime adapter；因此新增 `packages/db/src/prisma-runtime.ts` 和 `apps/api/src/order-import.runtime.ts`，并就地更新 AppModule provider。
- 外部 API/SDK/provider/connector/adapter 依据：不新增外部 order API、provider、connector 或 adapter；只使用 repo 已声明的 Prisma dependency `@prisma/client` in `@uzmax/db`。ADR-B02 no-API branch remains active and `order_connector` remains absent。

## 文档触发检查

- 判断依据：`docs/doc-gates.md`。本 PR 触碰 DB runtime wiring 和 M4 evidence，因此更新 spec/evidence/M4 README；不新增 schema/migration/generated DTO/OpenAPI、eval fixtures、runbook、release workflow 或 production deployment docs。

## 前置条件

- 已读取 `AGENTS.md`、`docs/specs/README.md`、`docs/doc-gates.md`、`docs/evidence/M4/README.md`、`docs/adr/ADR-B02-order-api.md`、v1.1 PRD REQ-T04、技术架构 §3/§8/§12、验收矩阵 B-01/E-02/E-03/E-04/I-01/J-02 和现有 M4-23/M4-25/M4-26/M4-27/M4-32 code/tests/evidence。
- 2026-06-23 Supabase branch `m4-migration-rls-verify` / ref `xbpkeeojlsrspewrkery` 已创建、验证、删除；branch cost record `branch, 0.01344/hourly`。
- 真库验证结果：`0001-0006` migrations apply succeeded；32 张 public tables exist；M4 order import 表 RLS enabled + forced；`uzmax_app_runtime` exists；synthetic tenant A can read 4/4 order import rows and tenant B/missing context read 0/4。
- Root/main contains pre-existing untracked duplicate docs (`* 2.md` paths). Full worker-boundary guard fails on root cleanliness; CI-mode assigned-worktree guard passes. This spec does not delete those user/local files.
- `git branch --no-merged main` showed `codex/m3-20-vision-screenshot-samples`; GitHub PR #58 is MERGED, so it is not hidden unreviewed work.
- Worktree / branch：物理 worktree `/Users/atilla/Documents/uzmax-m4-33-order-import-rls-runtime-readiness`；branch `codex/m4-33-order-import-rls-runtime-readiness`；禁止写入 `/Users/atilla/Documents/UZMAX智能运营` root/main checkout。

## 实施步骤

1. 在 `packages/db/src/prisma-runtime.ts` 增加 `UZMAX_RLS_DATABASE_URL` env reader 和 PrismaClient factory，并由 API runtime 通过专用路径导入，避免污染既有 DB contract barrel。
2. 在 `apps/api/src/order-import.runtime.ts` 增加 `UZMAX_ORDER_IMPORT_REPOSITORY_MODE` env selector：默认 `in_memory`；显式 `rls_prisma_gateway` 时创建 PrismaClient + RLS batch runner；显式裸 `prisma_gateway` fail-closed。
3. AppModule 的 `ORDER_IMPORT_REPOSITORY` provider 改用 env selector，默认仍注入既有 in-memory repository；API runtime compiler 同步纳入新增 runtime adapter，避免 HTTP shell smoke 脱节。
4. Focused Node test 覆盖默认 in-memory、缺 DB URL fail-closed、裸 Prisma env mode 拒绝、显式 RLS mode 的 transaction operation order、文档/evidence 映射。
5. 更新 M4 evidence README，不声称 E-02/E-03/E-04/J-02/I-01 已关闭。

## 通过条件

- 默认无 env 时 AppModule/order import provider 保持 in-memory，不读取 DB URL、不实例化 PrismaClient。
- `UZMAX_ORDER_IMPORT_REPOSITORY_MODE=rls_prisma_gateway` 时必须有 `UZMAX_RLS_DATABASE_URL`，并通过 `createOrderImportRlsBatchTransactionRunner` 执行 `set local role "uzmax_app_runtime"` + `set_config(app.org_id/app.tenant_id)` 后再查业务表。
- `UZMAX_ORDER_IMPORT_REPOSITORY_MODE=prisma_gateway` 必须 fail-closed，避免 env runtime 绕过 RLS。
- Focused tests、typecheck/lint/guards/check validation 通过或记录明确阻断。
- Evidence 记录真库验证结果、branch 删除、当前仍未关闭的 M4 blockers。

## 失败分支

- 若需要 production DB URL、真实客户/订单数据、API auth token、Supabase service key、Storage downloader、BullMQ/Redis、admin visible E2E、real import files 或 external order API：停止并拆到后续 scoped spec。
- 若出现 raw order/customer samples、phone/address/payment/order IDs、credentials/env/secrets：停止、清理本 worker 改动并进入 incident/cleanup path。
- 若 runtime selector 默认启用 DB、允许裸 Prisma env mode、或绕过 RLS transaction runner：不得合并，修正为 fail-closed RLS-only path。

## 不做什么

- 不新增 `order_connector`、外部 API adapter/provider/connector、DB schema/migration/generated client、worker queue runtime、Storage downloader、admin visible UI/E2E、AI runtime/eval、feature flag、production config 或 real CSV/XLSX import sample。
- 不把刚才 Supabase branch 验证写成 dev main 已迁移；dev main 仍未 apply M1-M4 business migrations。
- 不关闭 E-02/E-03/E-04/J-02/I-01 的 API/auth runtime、worker queue、admin E2E、真实导入样例、AI runtime/eval 或 release acceptance。

## 验收映射

| 验收项 | 状态 | 说明 |
|---|---|---|
| B-01 | `true_db_rls_probe_supported_not_closed` | Supabase branch synthetic RLS probe passed; still needs durable automated SQL/RLS test in CI/dev pipeline. |
| E-01 | `not_current_blocker__no_api_for_m4` | No `order_connector` or external API connector added. |
| E-02 | `rls_runtime_readiness_supported_not_closed` | True branch migrations/RLS verified and API runtime can explicitly select RLS Prisma gateway; real API/auth/worker/admin E2E and import sample remain future scope. |
| E-03 | `runtime_readiness_supported_not_closed` | DB-backed snapshot read path can be selected under RLS; persisted stale-warning E2E remains future scope. |
| E-04 | `foundation_supported_not_closed` | No AI runtime/eval added; no fabricated order status path added. |
| J-02 | `queue_runtime_not_closed` | No real BullMQ/Redis runtime, retry execution, idempotent storage locks or backlog alerting added. |
| I-01 | `partial_runtime_not_closed` | API provider can be DB-backed under explicit env, but full desktop order/customer workflow E2E remains future scope. |

## Closeout / Incident 记录

- Closeout evidence target: `docs/evidence/M4/M4-33-order-import-rls-runtime-readiness.md`。
