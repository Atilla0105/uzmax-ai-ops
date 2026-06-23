# M4-36 Order Import API True DB HTTP Smoke

## 目标

把 M4-35 的 worker -> DB/RLS -> API repository 真库 smoke 往用户可演示链路推进一层：启动真实 Nest HTTP controller/service，使用 `uzmax_app_runtime` RLS Prisma repository 从 Supabase `uzmax-dev` dev main 读取 synthetic import job、row error 和 order snapshot，并验证 tenant A 可见、tenant B 不可见、无权限请求失败。

本 spec 是从“横切 foundation 太多”转向“按能力竖切”的第一片。它只证明 order import 的 HTTP/API/DB/RLS 最小链路可以跑，不新增正式身份鉴权、不启动 admin browser E2E、不接 BullMQ/Redis、不接 Storage runtime、不导入真实文件、不关闭完整 E-02/I-01/J-02/E-03/E-04。

## 项目 Owner 确认点与 AI Agent 责任

Owner：已确认当前 M4 继续走 ADR-B02 no-API import snapshot 主路径，并授权使用 `uzmax-dev` 的 GitHub Actions secret 进行真库验证；真实账号、真实客户/订单数据、生产推广、成本与合规仍由 owner 决策。

AI agent：只在 `/Users/atilla/Documents/uzmax-m4-36-order-import-api-true-db-http-smoke` / `codex/m4-36-order-import-api-true-db-http-smoke` 执行；负责把本片做成 CI 可运行的 HTTP 真库 smoke，secret 不打印，synthetic 数据可清理，API HTTP 请求必须经过真实 `ApiAccessContextGuard`、`OrderImportController`/`OrderImportService` 和 RLS repository。不得把 smoke-only synthetic access-context service 伪装为正式 auth runtime。

## 时间盒

0.5 个工作日。若真实 Nest HTTP smoke 因 runtime compiler、Nest provider override、GitHub secret、RLS policy、Prisma transaction 或 CI 稳定性问题失败，停止并记录明确阻断；不得退回纯 mock、删除断言或扩大“完成”口径。

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M4-36-order-import-api-true-db-http-smoke.md`
  - `docs/evidence/M4/M4-36-order-import-api-true-db-http-smoke.md`
  - `docs/evidence/M4/README.md`
  - `.github/workflows/ci.yml`
  - `apps/api/scripts/runtime-compiler.mjs`
  - `apps/api/scripts/order-import-http-smoke-harness.mjs`
  - `packages/db/scripts/run-m4-order-import-api-true-db-http-smoke.mjs`
  - `scripts/tests/m4-order-import-api-true-db-http-smoke.test.mjs`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：不得修改 `packages/db/prisma/**`、`packages/db/migrations/**`、generated client、admin UI、worker queue、Storage runtime、external order API connector、package/lockfile、真实样本目录、root/main checkout 或其他 worktree。

## 变更预算与路径分类

- source 预算：changed source files <= 3，net source LOC <= 420，new source files <= 2。
- test/generated/lock/config/docs 预计变更：新增 1 个 true DB smoke script；新增 1 个 API-owned HTTP smoke harness；扩展 API runtime compiler 的 order-import module import 能力；新增 1 个 focused smoke harness test；更新 CI workflow/spec/evidence/M4 README；不改 package manifest/lockfile/generated/schema/migration。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：已检索 `true DB`, `true-db`, `HTTP smoke`, `NestFactory`, `order-import.*http`, `run-m4-order-import.*smoke`, `UZMAX_RLS_DATABASE_URL`, `ApiAccessContextGuard`, `createOrderImportRepositoryProviderFromEnv`, `importApiRuntime`, `supertest`, `fetch(`, `app.listen`, `overrideGuard`, `@nestjs/testing`。现有 M4-35 只到 API repository，M4-07/M4-31 只到 API shell/bridge contract，没有真实 Nest HTTP + true DB/RLS order import smoke；因此新增 `packages/db/scripts/run-m4-order-import-api-true-db-http-smoke.mjs` 承载 true DB seed/cleanup/assertions，并新增 API-owned `apps/api/scripts/order-import-http-smoke-harness.mjs` 承载 Nest/NestJS 依赖和真实 controller/service HTTP harness，避免 `packages/db` script 直接依赖 API package dependencies。
- 外部 API/SDK/provider/connector/adapter 依据：不新增外部 order API、provider、connector 或 adapter；使用 repo 已声明的 NestJS、Prisma Client 与 GitHub Actions secret `UZMAX_RLS_DATABASE_URL` 指向 Supabase dev main。
- 是否需要例外：无。

## 文档触发检查

- 结果：`updated`
- 判断依据：`docs/doc-gates.md`。
- 备注：触碰 CI 和真库 HTTP smoke evidence，更新 M4 evidence README；不新增 release/runbook/environment 文档。

## 前置条件

- 已读取 `AGENTS.md`、`docs/specs/README.md`、`docs/doc-gates.md`、`docs/evidence/M4/README.md`、`docs/evidence/M4/M4-35-order-import-true-db-runtime-smoke.md`、`docs/adr/ADR-B02-order-api.md`、PRD REQ-T04、后台设计 §4.4、技术架构 §8/§10/§12、验收矩阵 E-02/E-03/E-04/I-01/J-02。
- M4-35 已合并到 main，CI/dev true DB smoke 已证明 worker CSV drafts 可以写入 DB/RLS 并被 API repository 读回。
- GitHub Actions secret `UZMAX_RLS_DATABASE_URL` 存在但值不得打印；本地 shell 可以 fail-closed，不要求保存 secret。
- Worktree / branch：物理 worktree `/Users/atilla/Documents/uzmax-m4-36-order-import-api-true-db-http-smoke`；branch `codex/m4-36-order-import-api-true-db-http-smoke`；禁止写入 `/Users/atilla/Documents/UZMAX智能运营` root/main checkout。开工前记录：`pwd=/Users/atilla/Documents/uzmax-m4-36-order-import-api-true-db-http-smoke`，`git status --short --branch=## codex/m4-36-order-import-api-true-db-http-smoke`，`git branch --show-current=codex/m4-36-order-import-api-true-db-http-smoke`。
- Root/main tracked/index clean evidence at kickoff: `git status --short --branch --untracked-files=no` -> `## main...origin/main`。Root/main 仍有既有未跟踪 duplicate docs，本 spec 不删除。
- 并发派发证据：本 spec 触碰 CI/workflow、runtime compiler 和真库 smoke，必须全局串行；不并发派发其他 DB/schema/runtime/CI/release gate 改动。
- 事故触发器：若发现跨任务污染、写到分配 worktree 外、错分支或 main 直接提交、secret/customer-data 边界擦边、gate 绕过、同一过程失败在一个里程碑内重复出现，停止并创建或引用 `docs/incidents/` 记录。

## Worktree / branch 前置条件

- `pwd`: `/Users/atilla/Documents/uzmax-m4-36-order-import-api-true-db-http-smoke`
- `git status --short --branch`: `## codex/m4-36-order-import-api-true-db-http-smoke`
- `git branch --show-current`: `codex/m4-36-order-import-api-true-db-http-smoke`

## 并发派发证据

Single implementation worker. This spec touches shared CI and true DB smoke paths, so no parallel implementation worker is safe. Coordinator may perform local read-only spec compliance and code quality review after implementation.

## 事故与 closeout 记录

- Incident：none introduced at kickoff。
- Existing local blocker：root/main contains pre-existing untracked duplicate docs outside this spec; this worker will use absolute assigned worktree paths and will not delete them。
- Closeout evidence target: `docs/evidence/M4/M4-36-order-import-api-true-db-http-smoke.md`。

## 实施步骤

1. 扩展 API runtime compiler，让 smoke/test 可以导入真实 order-import controller/service/repository/runner 与 access-context guard token，而不是复制 production modules。
2. 新增 API-owned HTTP smoke harness：启动 smoke-only Nest module，用真实 `ApiAccessContextGuard` / `OrderImportController` / `OrderImportService` / RLS repository，并用 smoke-only access-context service 注入 tenant A/B/no-permission access context。
3. 新增 true DB HTTP smoke：seed synthetic org/tenants；在 `set local role "uzmax_app_runtime"` + `app.org_id/app.tenant_id` 事务内写入 synthetic import job、snapshot、row error；通过 HTTP `GET /order-import/jobs`、`GET /order-import/jobs/:jobId/errors`、`GET /order-import/snapshots/search` 验证可见性、错误行、成功行可查和权限失败；finally 删除 synthetic org 并复查 residue 0。
4. 在 CI true DB smoke step 中串行执行 M4-35 和 M4-36 smoke，仍只在相关 runtime paths 或 workflow_dispatch full 时运行。
5. 更新 M4 evidence，不把 smoke-only guard 误报为正式 API/auth runtime，也不把本片误报为完整 E-02/I-01/J-02 关闭。

## 通过条件

- Focused test 验证 runtime compiler 可导入 order-import HTTP smoke 所需真实 modules，并锁住 smoke script 的 HTTP/RLS/cleanup/fail-closed 结构。
- CI true DB HTTP smoke 使用 dev main `UZMAX_RLS_DATABASE_URL` 实际通过：HTTP jobs/errors/snapshot requests 经过真实 Nest controller/service 与 RLS repository 返回 tenant A synthetic rows；tenant B 不可见；无权限请求 403；cleanup residue 0。
- CI 中 secret value 不打印；repo 不提交 env/secret/raw customer/order data。
- `npm run check` 或等价 CI 通过；若本地无法跑真库 smoke，必须由 GitHub CI evidence 补足。

## 失败分支

- 若 Nest HTTP smoke 不能在预算内复用真实 controller/service/repository：停止，记录 blocked evidence；不得降级为 controller direct-call contract。
- 若 smoke-only access-context service 无法与真实 `ApiAccessContextGuard` 配合：停止，拆更小 runtime harness spec，不改正式 auth 伪造通过。
- 若 RLS write/read 失败：停止，记录是 role grant、policy、pooler transaction、Prisma generated client、schema mismatch 还是 repository mapping；不得改成 non-RLS read/write。
- 若 GitHub secret 不可用：停止，记录 blocker，不把 smoke 改为 skip/pass。
- 若需要 admin browser E2E、real auth、real CSV/XLSX、Storage upload/download、BullMQ/Redis、external order API、production DB 或真实客户/订单数据：停止并拆后续 spec。

## 不做什么

- 不新增外部订单 API connector、正式身份/权限 repository、BullMQ/Redis runtime、Storage downloader/uploader、admin UI/Playwright、真实导入文件、XLSX parser、生产配置、migration SQL、Prisma schema/generated client、package/lockfile 或 release gate。
- 不关闭 E-02/E-03/E-04/J-02/I-01；只把真库 runtime smoke 从 repository 层推进到 HTTP controller/service 层，作为后续 Admin/E2E 竖切的进度信号。

## 验收映射

| 验收项 | 状态 | 说明 |
|---|---|---|
| B-01 | `api_http_true_db_smoke_supported_not_closed` | CI/dev true DB smoke exercises HTTP API reads through RLS repository; durable full SQL/RLS matrix still needed. |
| E-02 | `api_http_true_db_smoke_supported_not_closed` | Import snapshot main path now has HTTP jobs/errors/snapshot visibility against dev DB; admin visible E2E, real import sample, queue and Storage runtime remain open. |
| E-03 | `not_closed` | Stale warning E2E is not covered beyond existing contracts. |
| E-04 | `not_closed` | AI no-fabrication eval/runtime not covered. |
| J-02 | `not_closed` | BullMQ/Redis retry/idempotency/backlog/fault injection not covered. |
| I-01 | `not_closed` | Full desktop workflow E2E not covered. |
