# M4-39 Order Import Admin Visible Stale/Missing True DB Smoke

## 目标

把 M4-38 的 browser-visible `Admin shell -> Admin client -> Nest HTTP -> API -> DB/RLS` true DB fresh path 延伸到 E-03/E-04 相关的 stale/missing handoff 可见证据：浏览器访问 `/design` 时，在 smoke-only runtime mode 下分别查询一个已存在但过期的 synthetic snapshot 和一个 controlled missing ref，必须显示 `handoff_required`、`reasonCode`、`runtimeWarning.code` 和 `Handoff: required`，且不得显示 `Status ref` / `orderStatusRef`。

M4-39 does not close full E-02/E-03/E-04/I-01/J-02/B-01. It only adds stale/missing browser-visible true DB smoke evidence on the same synthetic Supabase dev main path as M4-38.

## 项目 Owner 确认点与 AI Agent 责任

Owner：确认本切片只作为 M4 order import admin visible stale/missing true DB smoke 证据，不代表完整订单导入流程、正式登录鉴权、真实文件导入、worker queue、Storage runtime、AI 订单问答 runtime/eval、真实客户/订单数据或 1.0 发布验收关闭。真实账号、真实订单/客户数据、生产配置、成本、合规和最终发布仍由 owner 决策。

AI agent：只在 `/Users/atilla/Documents/uzmax-m4-39-order-import-admin-visible-stale-missing-true-db-e2e` / `codex/m4-39-order-import-admin-visible-stale-missing-true-db-e2e` 执行；负责先创建本 spec，再实现 handoff-visible Admin runtime state、true DB stale/missing browser smoke script、CI wiring、focused structure test 和 evidence。不得写 root `/Users/atilla/Documents/UZMAX智能运营`，不得 revert 其他 worker 或 root/main 改动，不 push/merge/开 PR。

## 时间盒

0.5 个工作日。若 browser smoke 因 Playwright browser install、Vite server、route proxy、Nest HTTP smoke app、RLS policy、Prisma transaction、GitHub secret 或 Admin shell runtime shape 失败，停止并记录明确阻断；不得降级成纯 mock、删除断言、扩大完成口径或关闭完整 E-02/E-03/E-04/I-01/J-02/B-01。

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M4-39-order-import-admin-visible-stale-missing-true-db-smoke.md`
  - `docs/evidence/M4/M4-39-order-import-admin-visible-stale-missing-true-db-smoke.md`
  - `docs/evidence/M4/README.md`
  - `.github/workflows/ci.yml`
  - `apps/admin/src/M4OrderImportVisibleSmokeState.tsx`
  - `packages/db/scripts/order-import-admin-visible-smoke-harness.mjs`
  - `packages/db/scripts/run-m4-order-import-admin-visible-true-db-smoke.mjs`
  - `packages/db/scripts/run-m4-order-import-admin-visible-stale-missing-true-db-smoke.mjs`
  - `scripts/tests/m4-order-import-admin-visible-true-db-smoke.test.mjs`
  - `scripts/tests/m4-order-import-admin-visible-stale-missing-true-db-smoke.test.mjs`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：不新增 Admin 组件；就地扩展 M4-38 smoke-only runtime state。为满足 duplication gate，抽取 M4-38/M4-39 共享的 Vite/Playwright/HTTP proxy/cleanup smoke harness，M4-38 entrypoint 行为不变。不得修改 `packages/db/prisma/**`、`packages/db/migrations/**`、generated client、package/lockfile、worker queue、Storage runtime、external order API connector、真实样本目录、root/main checkout 或其他 worktree。

## 变更预算与路径分类

- source 预算：changed source files <= 4，net source LOC <= 600，new source files <= 2。
- path classification:
  - source: `apps/admin/src/M4OrderImportVisibleSmokeState.tsx`, `packages/db/scripts/order-import-admin-visible-smoke-harness.mjs`, `packages/db/scripts/run-m4-order-import-admin-visible-true-db-smoke.mjs`, `packages/db/scripts/run-m4-order-import-admin-visible-stale-missing-true-db-smoke.mjs`
  - test: `scripts/tests/m4-order-import-admin-visible-true-db-smoke.test.mjs`, `scripts/tests/m4-order-import-admin-visible-stale-missing-true-db-smoke.test.mjs`
  - config: `.github/workflows/ci.yml`
  - docs: `docs/specs/M4-39-order-import-admin-visible-stale-missing-true-db-smoke.md`, `docs/evidence/M4/M4-39-order-import-admin-visible-stale-missing-true-db-smoke.md`, `docs/evidence/M4/README.md`
  - generated: none
  - lock: none
- 新增 source 文件前的 `rg` 搜索结论和归属理由：已检索 `M4OrderImportVisibleSmokeState`, `createOrderImportApiClient`, `run-m4-order-import-admin-visible-true-db-smoke`, `order-import-true-db-http-smoke-fixture`, `route.fetch`, `UZMAX_RLS_DATABASE_URL`, `order_snapshot_stale`, `order_snapshot_missing`, `runtimeWarning`, `reasonCode`。现有 M4-38 只覆盖 fresh visible true DB path；现有 `/design` stale/missing 是 synthetic local state；M4-36/M4-37 只覆盖 HTTP/admin-client 层。M4-39 需要一个独立 script entrypoint 产 stale/missing browser evidence，并就地扩展现有 Admin runtime state；M4-39 复用 M4-38 的 visible true DB shell 时出现 duplication gate，因此新增 `order-import-admin-visible-smoke-harness.mjs` 作为两个 entrypoint 的共享 runtime harness。
- 外部 API/SDK/provider/connector/adapter 依据：不新增外部 order API、provider、connector 或 adapter；使用 repo 已声明的 Playwright、Vite、NestJS、Prisma Client 和 GitHub Actions secret `UZMAX_RLS_DATABASE_URL` 指向 Supabase dev main。
- 是否需要例外：无。

## 文档触发检查

- 结果：`updated`
- 判断依据：`docs/doc-gates.md`

## 前置条件

- 已读取 `AGENTS.md`、`docs/specs/README.md`、`docs/doc-gates.md`、`docs/evidence/M4/README.md`、`UZMAX智能运营系统-1.0验收矩阵-v1.1.md` 中 E-02/E-03/E-04/I-01/J-02/B-01、M4-38 spec/evidence/test/script、`apps/admin/src/M4OrderImportVisibleSmokeState.tsx`、`apps/admin/src/orderImportApiClient.ts`、`packages/db/scripts/order-import-true-db-http-smoke-fixture.mjs`、`.github/workflows/ci.yml`。
- M4-38 已合并到 main，CI/dev true DB browser smoke 已证明 Admin shell 可以从真实 Nest HTTP routes 读取 Supabase dev DB/RLS synthetic fresh import rows。
- GitHub Actions secret `UZMAX_RLS_DATABASE_URL` 存在但值不得打印；本地 shell 可以 fail-closed，不要求保存 secret。
- Worktree / branch：物理 worktree `/Users/atilla/Documents/uzmax-m4-39-order-import-admin-visible-stale-missing-true-db-e2e`；branch `codex/m4-39-order-import-admin-visible-stale-missing-true-db-e2e`；禁止写入 `/Users/atilla/Documents/UZMAX智能运营` root/main checkout。开工前记录：`pwd=/Users/atilla/Documents/uzmax-m4-39-order-import-admin-visible-stale-missing-true-db-e2e`，`git status --short --branch=## codex/m4-39-order-import-admin-visible-stale-missing-true-db-e2e`，`git branch --show-current=codex/m4-39-order-import-admin-visible-stale-missing-true-db-e2e`。
- Worker boundary evidence: `UZMAX_ASSIGNED_WORKTREE=/Users/atilla/Documents/uzmax-m4-39-order-import-admin-visible-stale-missing-true-db-e2e UZMAX_PRIMARY_ROOT=/Users/atilla/Documents/UZMAX智能运营 npm run guard:worker-boundary` passed.
- 并发派发证据：本 spec 触碰 CI/workflow、packages/db true DB smoke、Admin shell 和 M4 evidence README，必须全局串行；不并发派发其他 DB/schema/runtime/CI/release gate 改动。

## 事故与 closeout 记录

- 开工前未发现 assigned worktree 脏改。
- 本 spec 不触发 `docs/incidents/README.md` 阈值；若发现写入越界、错分支、secret/customer-data 边界擦边或 gate 绕过，停止并记录 incident。

## 实施步骤

1. 扩展 `M4OrderImportVisibleSmokeState`：保留默认 `/design` local mode 不发 runtime 请求；保留 M4-38 fresh `snapshot_ready` / `Status ref: status://order/ready` 行为；当 `searchSnapshot` 返回 `handoff_required` 时渲染 `reasonCode`、`runtimeWarning.code`、`Handoff: required`，不渲染 `Status ref` / `orderStatusRef`。
2. 新增 true DB visible stale/missing smoke script：复用 M4-38 的 Vite + Playwright + real Nest HTTP smoke + RLS Prisma repository + synthetic Supabase dev rows 模式；使用 suffix `139`、syntheticSpec `M4-39`、独立 source refs；用 query `now` 晚于 seeded snapshot `expiresAt` 形成 stale existing snapshot，再用 controlled missing ref 形成 missing handoff。
3. Script 分别验证 stale existing query 和 missing query：可见 `order_snapshot_stale` / `order_snapshot_missing`、`Runtime warning: ...`、`Handoff: required`、无 `Status ref` / `orderStatusRef`；cleanup synthetic rows 并 assert residue `0`；`UZMAX_RLS_DATABASE_URL` 缺失时 fail closed。
4. CI 在 “M4 order import true DB runtime smokes” 组中追加 M4-39 script，跟在 M4-38 后面。
5. 新增 focused structure test，断言 smoke global、handoff_required 支持、runtimeWarning/reasonCode 显示、handoff 不显示 order status refs、new script route.fetch/Vite/Playwright/RLS cleanup/fail-closed、CI wiring、evidence conservative。
6. 更新 M4 evidence README 和新增 evidence 文件，CI 结果在 PR 前保持 pending，不写假 CI pass。

## 通过条件

- `node --test scripts/tests/m4-order-import-admin-visible-stale-missing-true-db-smoke.test.mjs` 通过。
- `node --test scripts/tests/m4-order-import-admin-visible-true-db-smoke.test.mjs scripts/tests/m4-order-import-admin-visible-stale-missing-true-db-smoke.test.mjs` 通过。
- `env -u UZMAX_RLS_DATABASE_URL node packages/db/scripts/run-m4-order-import-admin-visible-stale-missing-true-db-smoke.mjs` fail closed with `UZMAX_RLS_DATABASE_URL is required`。
- CI true DB visible smoke 使用 dev main `UZMAX_RLS_DATABASE_URL` 实际通过：browser UI 通过 route proxy 调用真实 Nest HTTP order-import routes，并显示 tenant A synthetic stale/missing handoff warnings；cleanup residue `0`。
- Repo 不提交 env/secret/raw customer/order data；secret value 不打印。
- `npm run format:check`、`npm run guard:pr-shape -- --base origin/main --spec docs/specs/M4-39-order-import-admin-visible-stale-missing-true-db-smoke.md --include-worktree`、`npm run test`、worker boundary 通过。

## 失败分支

- 若 browser smoke 不能在预算内复用现有 `createOrderImportApiClient` 和真实 HTTP app：停止，记录 blocked evidence；不得降级为 controller direct-call contract。
- 若 Vite/Playwright browser runtime 缺失：记录精确 blocker，保持 CI-ready；不得删除 browser assertion。
- 若 RLS write/read 失败：停止，记录是 role grant、policy、pooler transaction、Prisma generated client、schema mismatch 还是 repository mapping；不得改成 non-RLS read/write。
- 若 GitHub secret 不可用：停止，记录 blocker，不把 smoke 改为 skip/pass。
- 若需要正式 auth runtime、real CSV/XLSX、Storage upload/download、BullMQ/Redis、external order API、production DB 或真实客户/订单数据：停止并拆后续 spec。

## 不做什么

- 不新增外部订单 API connector、正式身份/权限 runtime、BullMQ/Redis runtime、Storage downloader/uploader、真实导入文件、XLSX parser、生产配置、migration SQL、Prisma schema/generated client、package/lockfile、release gate、AI runtime/eval 或真实客户/订单数据。
- 不关闭 E-02/E-03/E-04/I-01/J-02/B-01 的完整验收；只把 M4-38 的 fresh true DB browser smoke 延伸到 stale/missing visible handoff evidence。

## 验收映射

| 验收项 | 状态 | 说明 |
|---|---|---|
| B-01 | `admin_visible_stale_missing_true_db_smoke_supported_not_closed` | Browser UI requests traverse Admin client -> Nest HTTP -> API -> DB/RLS against dev main synthetic tenant A rows. Full durable SQL/RLS matrix remains future scope. |
| E-02 | `admin_visible_stale_missing_true_db_smoke_supported_not_closed` | Import snapshot main path now has visible true DB fresh evidence from M4-38 and visible stale/missing handoff evidence from M4-39. Formal auth runtime, full worker queue execution, real import sample, Storage runtime and full E2E remain open. |
| E-03 | `admin_visible_stale_missing_true_db_smoke_supported_not_closed` | Stale true DB snapshot is visible as handoff-required warning and does not expose order status refs. Persisted warning storage and full E2E stale samples remain future scope. |
| E-04 | `visible_handoff_smoke_supported_not_closed` | Missing/stale order reads are visibly handoff-required without status ref exposure; AI order-read runtime, eval fixtures and production redline gate remain future scope. |
| I-01 | `partial_admin_visible_true_db_smoke_not_closed` | `/design` Admin shell can visibly render stale/missing handoff runtime data through true DB HTTP smoke. Full desktop core order/customer workflow remains future scope. |
| J-02 | `not_closed` | BullMQ/Redis retry/idempotency/backlog/fault-injection evidence is not present. |
