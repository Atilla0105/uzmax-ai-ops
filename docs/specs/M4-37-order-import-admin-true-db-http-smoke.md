# M4-37 Order Import Admin True DB HTTP Smoke

## 目标

把 M4-36 的真实 Nest HTTP -> API -> DB/RLS smoke 再往 operator-facing 链路推进一层：使用现有 `apps/admin/src/orderImportApiClient.ts` 的 `createOrderImportApiClient`，通过真实 Nest HTTP smoke app 读取 Supabase `uzmax-dev` dev main 的 synthetic import job、row error 和 order snapshot，并验证 tenant A 可见、tenant B 不可见、无权限请求失败。

本 spec 继续从“横切 foundation 太多”转向“按能力竖切”。它只证明 Admin client -> HTTP -> API -> DB/RLS 的最小链路可以跑，不启动 admin browser E2E、不改 UI、不新增正式身份鉴权、不接 BullMQ/Redis、不接 Storage runtime、不导入真实文件、不关闭完整 E-02/I-01/J-02/E-03/E-04。

## 项目 Owner 确认点与 AI Agent 责任

Owner：已授权清理 root/main 旧 duplicate docs，并确认当前 M4 继续走 ADR-B02 no-API import snapshot 主路径；真实账号、真实客户/订单数据、生产推广、成本与合规仍由 owner 决策。

AI agent：只在 `/Users/atilla/Documents/uzmax-m4-37-order-import-admin-true-db-http-smoke` / `codex/m4-37-order-import-admin-true-db-http-smoke` 执行；负责把本片做成 CI 可运行的 Admin client 真库 HTTP smoke，secret 不打印，synthetic 数据可清理，请求必须经过现有 `createOrderImportApiClient`、真实 `ApiAccessContextGuard`、`OrderImportController`/`OrderImportService` 和 RLS repository。不得把 smoke-only access-context service 伪装为正式 auth runtime。

## 时间盒

0.5 个工作日。若 Admin client -> HTTP true DB smoke 因 admin client fetcher shape、Nest runtime、GitHub secret、RLS policy、Prisma transaction 或 CI 稳定性问题失败，停止并记录明确阻断；不得退回纯 mock、删除断言或扩大“完成”口径。

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M4-37-order-import-admin-true-db-http-smoke.md`
  - `docs/evidence/M4/M4-37-order-import-admin-true-db-http-smoke.md`
  - `docs/evidence/M4/README.md`
  - `.github/workflows/ci.yml`
  - `packages/db/scripts/order-import-true-db-http-smoke-fixture.mjs`
  - `packages/db/scripts/run-m4-order-import-api-true-db-http-smoke.mjs`
  - `packages/db/scripts/run-m4-order-import-admin-true-db-http-smoke.mjs`
  - `scripts/tests/m4-order-import-api-true-db-http-smoke.test.mjs`
  - `scripts/tests/m4-order-import-admin-true-db-http-smoke.test.mjs`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：不得修改 `packages/db/prisma/**`、`packages/db/migrations/**`、generated client、admin UI components/CSS、worker queue、Storage runtime、external order API connector、package/lockfile、真实样本目录、root/main checkout 或其他 worktree。

## 变更预算与路径分类

- source 预算：changed source files <= 3，net source LOC <= 420，new source files <= 2。
- test/generated/lock/config/docs 预计变更：新增 1 个 shared true DB HTTP smoke fixture；重构 M4-36 smoke 复用 fixture；新增 1 个 Admin client true DB HTTP smoke script；新增 1 个 focused smoke structure test；更新既有 M4-36 focused test、CI workflow、spec/evidence/M4 README；不改 package manifest/lockfile/generated/schema/migration。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：已检索 `true DB`, `HTTP smoke`, `admin API bridge`, `createOrderImportApiClient`, `startOrderImportHttpSmoke`, `run-m4-order-import.*http`, `UZMAX_RLS_DATABASE_URL`, `x-tenant-id`。现有 M4-31 只在 test 内把 admin client 接到 controller direct-call；M4-36 只到真实 HTTP API，没有 admin client；因此新增 `packages/db/scripts/run-m4-order-import-admin-true-db-http-smoke.mjs` 承载 Admin client -> HTTP -> true DB assertions。为避免复制 M4-36 的 seed/cleanup/RLS 逻辑，新增 `packages/db/scripts/order-import-true-db-http-smoke-fixture.mjs` 并让 M4-36/M4-37 共享。
- 外部 API/SDK/provider/connector/adapter 依据：不新增外部 order API、provider、connector 或 adapter；使用 repo 已声明的 NestJS、Prisma Client、TypeScript transpiler 与 GitHub Actions secret `UZMAX_RLS_DATABASE_URL` 指向 Supabase dev main。
- 是否需要例外：无。

## 文档触发检查

- 结果：`updated`
- 判断依据：`docs/doc-gates.md`。
- 备注：触碰 CI 和真库 Admin client HTTP smoke evidence，更新 M4 evidence README；不新增 release/runbook/environment 文档。

## 前置条件

- 已读取 `AGENTS.md`、`docs/specs/README.md`、`docs/doc-gates.md`、`docs/evidence/M4/README.md`、`docs/specs/M4-31-order-import-admin-api-bridge-contract.md`、`docs/specs/M4-36-order-import-api-true-db-http-smoke.md`、M4-31/M4-36 evidence、`docs/adr/ADR-B02-order-api.md`、PRD REQ-T04、后台设计 §4.4、技术架构 §8/§10/§12、验收矩阵 E-02/E-03/E-04/I-01/J-02。
- M4-36 已合并到 main，CI/dev true DB HTTP smoke 已证明真实 Nest HTTP routes 可以从 Supabase dev DB/RLS 读取 synthetic import rows。
- GitHub Actions secret `UZMAX_RLS_DATABASE_URL` 存在但值不得打印；本地 shell 可以 fail-closed，不要求保存 secret。
- Root/main duplicate docs 已按 owner 授权清理；`npm run guard:worker-boundary` 在 root/main 通过。
- Worktree / branch：物理 worktree `/Users/atilla/Documents/uzmax-m4-37-order-import-admin-true-db-http-smoke`；branch `codex/m4-37-order-import-admin-true-db-http-smoke`；禁止写入 `/Users/atilla/Documents/UZMAX智能运营` root/main checkout。开工前记录：`pwd=/Users/atilla/Documents/uzmax-m4-37-order-import-admin-true-db-http-smoke`，`git status --short --branch=## codex/m4-37-order-import-admin-true-db-http-smoke`，`git branch --show-current=codex/m4-37-order-import-admin-true-db-http-smoke`。
- 并发派发证据：本 spec 触碰 CI/workflow、packages/db true DB smoke 和 M4 evidence README，必须全局串行；不并发派发其他 DB/schema/runtime/CI/release gate 改动。

## Worktree / branch 前置条件

- `pwd`: `/Users/atilla/Documents/uzmax-m4-37-order-import-admin-true-db-http-smoke`
- `git status --short --branch`: `## codex/m4-37-order-import-admin-true-db-http-smoke`
- `git branch --show-current`: `codex/m4-37-order-import-admin-true-db-http-smoke`
- Worker boundary evidence: `UZMAX_ASSIGNED_WORKTREE=/Users/atilla/Documents/uzmax-m4-37-order-import-admin-true-db-http-smoke UZMAX_PRIMARY_ROOT=/Users/atilla/Documents/UZMAX智能运营 npm run guard:worker-boundary` passed.

## 并发派发证据

Single implementation worker. This spec touches shared CI and true DB smoke paths, so no parallel implementation worker is safe. Coordinator may perform local read-only spec compliance and code quality review after implementation.

## 事故与 closeout 记录

- Incident：none introduced at kickoff。
- Existing local residue：two old no-merged linked worktree branches correspond to merged PRs #58 and #89; this spec does not touch or delete them。
- Closeout evidence target: `docs/evidence/M4/M4-37-order-import-admin-true-db-http-smoke.md`。

## 实施步骤

1. 新增 shared true DB HTTP smoke fixture，统一 synthetic org/tenant/row seed、RLS transaction write、HTTP fetcher、cleanup 和 residue check。
2. 重构 M4-36 API HTTP smoke 复用 shared fixture，保持原 CI entrypoint 和行为。
3. 新增 M4-37 Admin client true DB HTTP smoke：编译/import 现有 `apps/admin/src/orderImportApiClient.ts`，启动 M4-36 的真实 Nest HTTP smoke app，通过 Admin client 调用 jobs/errors/snapshot search。
4. Admin client smoke 验证 tenant A 可见、tenant B 不可见、tenant B row-errors 404、无权限请求 403、handoff missing snapshot 保持 runtime warning 语义。
5. 在 CI true DB smoke step 中串行执行 M4-35、M4-36 和 M4-37 smoke。
6. 更新 M4 evidence，不把 smoke-only access-context service 误报为正式 auth runtime，也不把本片误报为完整 E-02/I-01/J-02 关闭。

## 通过条件

- Focused tests 验证 M4-36/M4-37 smoke 结构、shared fixture、Admin client path、cleanup/fail-closed 边界。
- CI true DB Admin client HTTP smoke 使用 dev main `UZMAX_RLS_DATABASE_URL` 实际通过：Admin client requests 经过真实 Nest HTTP controller/service 与 RLS repository 返回 tenant A synthetic rows；tenant B 不可见；无权限请求 403；cleanup residue 0。
- CI 中 secret value 不打印；repo 不提交 env/secret/raw customer/order data。
- `npm run check` 或等价 CI 通过；若本地无法跑真库 smoke，必须由 GitHub CI evidence 补足。

## 失败分支

- 若 Admin client smoke 不能在预算内复用现有 `createOrderImportApiClient` 和真实 HTTP app：停止，记录 blocked evidence；不得降级为 controller direct-call contract。
- 若 RLS write/read 失败：停止，记录是 role grant、policy、pooler transaction、Prisma generated client、schema mismatch 还是 repository mapping；不得改成 non-RLS read/write。
- 若 GitHub secret 不可用：停止，记录 blocker，不把 smoke 改为 skip/pass。
- 若需要 admin browser E2E、real auth、real CSV/XLSX、Storage upload/download、BullMQ/Redis、external order API、production DB 或真实客户/订单数据：停止并拆后续 spec。

## 不做什么

- 不新增外部订单 API connector、正式身份/权限 repository、BullMQ/Redis runtime、Storage downloader/uploader、admin UI/Playwright、真实导入文件、XLSX parser、生产配置、migration SQL、Prisma schema/generated client、package/lockfile 或 release gate。
- 不关闭 E-02/E-03/E-04/J-02/I-01；只把真库 HTTP smoke 从 API route 层推进到 Admin client 层，作为后续 visible Admin E2E 竖切的进度信号。

## 验收映射

| 验收项 | 状态 | 说明 |
|---|---|---|
| B-01 | `admin_client_true_db_http_smoke_supported_not_closed` | CI/dev true DB smoke exercises Admin client -> HTTP API reads through RLS repository; durable full SQL/RLS matrix still needed. |
| E-02 | `admin_client_true_db_http_smoke_supported_not_closed` | Import snapshot main path now has Admin client jobs/errors/snapshot visibility against dev DB; visible admin E2E, real import sample, queue and Storage runtime remain open. |
| E-03 | `not_closed` | Stale warning visible E2E is not covered beyond existing contracts. |
| E-04 | `not_closed` | AI no-fabrication runtime/eval is not covered. |
| J-02 | `not_closed` | BullMQ/Redis retry/idempotency/backlog/fault injection not covered. |
| I-01 | `partial_admin_client_true_db_http_smoke_not_closed` | Admin client can read runtime data through true DB HTTP smoke; full desktop workflow E2E is not covered. |
