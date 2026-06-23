# M4-35 Order Import True DB Runtime Smoke

## 目标

在 M4-34 已把 M1-M4 schema/RLS baseline 应用到 Supabase `uzmax-dev` 主库之后，补上最小可自动运行的真库 runtime smoke：用 worker CSV/draft path 生成导入任务、订单快照和错误行，在 `uzmax_app_runtime` RLS 上下文下写入 dev main，再用 API order-import repository 通过同一 RLS runtime 读回，并验证跨租户不可见。

本 spec 解决“代码契约通过但不能对真库演示”的核心质量问题之一。它不引入 BullMQ/Redis、Storage downloader、admin browser E2E、真实订单/客户样本或外部订单 API，因此不单独关闭 E-02/E-03/E-04/J-02/I-01。

## 项目 Owner 确认点与 AI Agent 责任

Owner：已确认当前 M4 走 ADR-B02 no-API import snapshot 分支，并授权使用 `uzmax-dev` 里的 Supabase org/project 走推荐路线；真实 dev DB secret、成本、生产推广、真实客户/订单数据仍由 owner 决策。

AI agent：只在 `/Users/atilla/Documents/uzmax-m4-35-order-import-true-db-runtime-smoke` / `codex/m4-35-order-import-true-db-runtime-smoke` 执行；负责把 smoke 做成 CI 可运行信号，确保 synthetic 数据清理、secret 不打印、worker adapter 不绕过 Prisma enum 映射、API read path 不绕过 RLS；不得把本 smoke 写成完整 E-02 release evidence。

## 时间盒

0.5 个工作日。若真库 smoke 因 secret 缺失、Prisma enum/transaction/pooler 限制、RLS 写入失败或 CI 无法稳定运行而失败，停止并记录明确阻断；不得改成 mock 通过，也不得删除断言或把 smoke 降级为仅文档证据。

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M4-35-order-import-true-db-runtime-smoke.md`
  - `docs/evidence/M4/M4-35-order-import-true-db-runtime-smoke.md`
  - `docs/evidence/M4/README.md`
  - `.github/workflows/ci.yml`
  - `packages/db/scripts/run-m4-order-import-true-db-smoke.mjs`
  - `apps/worker/src/order-import-prisma-persistence.ts`
  - `scripts/tests/m4-order-import-worker-prisma-persistence-contract.test.mjs`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：不得修改 `packages/db/migrations/**`、Prisma schema/generated client、admin UI、BullMQ/Redis runtime、Storage runtime、external order API connector、root/main checkout 或真实样本目录。

## 变更预算与路径分类

- source 预算：changed source files <= 2，net source LOC <= 220，new source files <= 1。
- test/generated/lock/config/docs 预计变更：新增 1 个 smoke script；更新 1 个 focused test；更新 CI workflow/spec/evidence/M4 README；不改 package manifest/lockfile/generated/schema/migration。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：已检索 `PrismaOrderImportWorkerPersistenceGateway`, `createOrderImportWorkerPrismaPersistenceGateway`, `createOrderImportRlsBatchTransactionRunner`, `createOrderImportRepositoryProviderFromEnv`, `ImportJobStatus`, `OrderSnapshotSourceKind`, `scripts/smokes`, `UZMAX_RLS_DATABASE_URL`。现有 worker adapter 有 Prisma-shaped write contract，但没有 Prisma enum value mapping or true DB smoke; CI 只跑 SPK-03/04 真库 spike，不跑 M4 order import runtime smoke。因此新增 `scripts/smokes/m4-order-import-true-db-runtime-smoke.mjs` 并就地修正 worker adapter mapping。
- 外部 API/SDK/provider/connector/adapter 依据：不新增外部 order API、provider、connector 或 adapter；使用 repo 已声明的 Prisma Client 与 GitHub Actions secret `UZMAX_RLS_DATABASE_URL` 指向 Supabase dev main。
- 是否需要例外：无。

## 文档触发检查

- 结果：`updated`
- 判断依据：`docs/doc-gates.md`。
- 备注：触碰 CI 和真库 smoke evidence，更新 M4 evidence README；不新增 release/runbook/environment 文档。

## 前置条件

- 已读取 `AGENTS.md`、`docs/specs/README.md`、`docs/doc-gates.md`、`docs/evidence/M4/README.md`、`docs/evidence/M4/M4-34-dev-main-db-baseline.md`、`docs/adr/ADR-B02-order-api.md`、PRD REQ-T04、技术架构 §3/§8/§12、验收矩阵 B-01/E-02/E-03/E-04/I-01/J-02。
- M4-34 已合并到 main，Supabase `uzmax-dev` dev main 有 6 条 M1-M4 migration、32/32 expected public tables、4 张 M4 order import 表 forced RLS、synthetic residue 0。
- GitHub Actions secrets 已用于 SPK-03/SPK-04：`UZMAX_RLS_DATABASE_URL` 存在但值不得打印。
- Worktree / branch：物理 worktree `/Users/atilla/Documents/uzmax-m4-35-order-import-true-db-runtime-smoke`；branch `codex/m4-35-order-import-true-db-runtime-smoke`；禁止写入 `/Users/atilla/Documents/UZMAX智能运营` root/main checkout。开工前记录：`pwd=/Users/atilla/Documents/uzmax-m4-35-order-import-true-db-runtime-smoke`，`git status --short --branch=## codex/m4-35-order-import-true-db-runtime-smoke...origin/main`，`git branch --show-current=codex/m4-35-order-import-true-db-runtime-smoke`。
- 并发派发证据：本 spec 触碰 CI/workflow 和真库 DB smoke，必须全局串行；不并发派发其他 DB/schema/runtime/CI/release gate 改动。
- 事故触发器：若发现跨任务污染、写到分配 worktree 外、错分支或 main 直接提交、secret/customer-data 边界擦边、gate 绕过、同一过程失败在一个里程碑内重复出现，停止并创建或引用 `docs/incidents/` 记录。

## 实施步骤

1. 修正 worker Prisma persistence adapter，把 contract snake_case enum values 映射为 Prisma Client enum names，并用 focused test 锁住 mapping。
2. 新增 true DB smoke：生成 synthetic org/tenant 与 worker CSV drafts；在 `set local role "uzmax_app_runtime"` + `app.org_id/app.tenant_id` 的事务中写入 import job、snapshot、row error；用 API repository RLS runtime 读回；验证 tenant A 可见、tenant B 不可见；finally 删除 synthetic org 并复查 residue 0。
3. 在 CI 中加入 `node packages/db/scripts/run-m4-order-import-true-db-smoke.mjs`，只在相关 runtime paths 或 workflow_dispatch full 时运行，并使用 GitHub Actions secret `UZMAX_RLS_DATABASE_URL`。
4. 更新 M4 evidence，不把该 smoke 误报为完整 E-02/J-02/I-01 关闭。

## 通过条件

- Focused worker Prisma persistence test 验证 import job/snapshot/row error enum mapping。
- CI true DB smoke 使用 dev main `UZMAX_RLS_DATABASE_URL` 实际通过：worker-generated import rows 写入 DB，API RLS repository 读回 expected job/error/snapshot，cross-tenant read returns none，synthetic cleanup residue 0。
- CI 中 secret value 不打印；repo 不提交 env/secret/raw customer/order data。
- `npm run check` 或等价 CI 通过；若本地无法跑真库 smoke，必须由 GitHub CI evidence 补足。

## 失败分支

- 若 Prisma enum mapping 仍无法写入 dev main：停止，保留失败摘要，修 mapper 或拆成 DB client compatibility fix。
- 若 RLS runtime 写入/读取失败：停止，记录是 role grant、policy、pooler transaction、Prisma generated client 还是 schema mismatch；不得改成 non-RLS write/read 伪造通过。
- 若 GitHub secret 不可用：停止，记录 blocker，不把 smoke 改为 skip/pass。
- 若需要 real CSV/XLSX、Storage upload/download、BullMQ/Redis、admin browser E2E、external order API、production DB 或真实客户/订单数据：停止并拆后续 spec。

## 不做什么

- 不新增外部订单 API connector、BullMQ/Redis runtime、Storage downloader、admin UI、Playwright E2E、真实导入文件、生产配置、migration SQL、Prisma schema/generated client 或 release gate。
- 不关闭 E-02/E-03/E-04/J-02/I-01；只把真库 runtime smoke 作为后续竖切的自动化进度信号。

## 验收映射

| 验收项 | 状态 | 说明 |
|---|---|---|
| B-01 | `true_db_runtime_smoke_supported_not_closed` | CI/dev true DB smoke exercises RLS read/write for M4 import rows; durable full SQL/RLS matrix still needed. |
| E-02 | `worker_api_true_db_smoke_supported_not_closed` | Worker CSV draft -> DB/RLS -> API repository read path becomes executable against dev main; admin visible E2E, queue runtime and real import sample remain open. |
| E-03 | `not_closed` | Stale warning E2E not covered beyond snapshot-ready smoke. |
| E-04 | `not_closed` | AI no-fabrication eval/runtime not covered. |
| J-02 | `not_closed` | BullMQ/Redis retry/idempotency/backlog/fault injection not covered. |
| I-01 | `not_closed` | Full desktop workflow E2E not covered. |

## Closeout / Incident 记录

- Closeout evidence target: `docs/evidence/M4/M4-35-order-import-true-db-runtime-smoke.md`。
- Incident: none found in repo evidence for this spec at kickoff。
