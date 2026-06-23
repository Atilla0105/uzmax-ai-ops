# M4-40 Order Import Admin Submit True DB Worker Dispatch Smoke

## 目标

把 M4-38/M4-39 的 browser-visible true DB readback 继续向 E-02 主路径纵切一层：浏览器 `/design` 在 smoke-only runtime mode 下用 existing Admin client 发起 synthetic CSV text submit，真实 Nest HTTP POST `/order-import/jobs` 进入 API service，API 通过 smoke-only dispatcher port 调用既有 worker CSV dispatch contract 和 worker Prisma persistence gateway，在 Supabase dev main RLS transaction 中写入 import job / snapshot / row error，再由同一个 Admin/browser runtime 读回 job/errors/snapshot。

M4-40 does not close full E-02/E-03/E-04/I-01/J-02/B-01. It proves a synthetic `Admin browser submit -> API POST -> worker dispatch/persistence -> DB/RLS -> Admin readback` path only. Formal auth runtime, BullMQ/Redis queue runtime, real Storage upload/download, real import sample, XLSX parser, AI order-read eval/redline gate and release signoff remain open.

## 项目 Owner 确认点与 AI Agent 责任

Owner：确认本切片只作为 M4 no-API branch 的 synthetic true DB submit/readback evidence，不代表正式订单导入、正式登录鉴权、真实文件导入、真实客户/订单数据、生产配置、成本、合规或 1.0 发布验收关闭。

AI agent：只在 `/Users/atilla/Documents/uzmax-m4-40-order-import-admin-submit-true-db-worker-dispatch-smoke` / `codex/m4-40-order-import-admin-submit-true-db-worker-dispatch-smoke` 执行；负责先创建本 spec，再实现 submit/readback smoke、focused structure test、CI wiring 和 evidence。不得写 root `/Users/atilla/Documents/UZMAX智能运营`，不得 revert 其他 worker 或 root/main 改动。

## 时间盒

0.5 个工作日。若 API POST、worker dispatch/persistence import、Vite/Playwright browser submit、RLS write/read、Prisma transaction、GitHub secret 或 CI true DB smoke 失败，停止并记录明确阻断；不得降级成纯 mock、删除断言、扩大完成口径或关闭完整 E-02/E-03/E-04/I-01/J-02/B-01。

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M4-40-order-import-admin-submit-true-db-worker-dispatch-smoke.md`
  - `docs/evidence/M4/M4-40-order-import-admin-submit-true-db-worker-dispatch-smoke.md`
  - `docs/evidence/M4/README.md`
  - `.github/workflows/ci.yml`
  - `apps/admin/src/orderImportApiClient.ts`
  - `apps/admin/src/M4OrderImportVisibleSmokeState.tsx`
  - `apps/api/src/order-import.controller.ts`
  - `apps/api/src/order-import.service.ts`
  - `apps/api/scripts/order-import-http-smoke-harness.mjs`
  - `packages/db/scripts/order-import-admin-visible-smoke-harness.mjs`
  - `packages/db/scripts/run-m4-order-import-admin-submit-true-db-worker-dispatch-smoke.mjs`
  - `scripts/tests/m4-order-import-admin-submit-true-db-worker-dispatch-smoke.test.mjs`
  - `scripts/tests/m4-order-import-admin-api-bridge-contract.test.mjs`
  - `scripts/tests/m4-order-import-api-shell.test.mjs`
  - `scripts/tests/m4-order-import-runtime-warning-contract.test.mjs`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：不新增生产 Admin upload UI，不新增 API module 文件，不修改 runtime compiler，不引入 BullMQ/Redis，不修改 DB schema/migration/generated client/package/lockfile。两个既有 M4 API tests 只补 Nest common stub exports for `Body` / `Post` / `Optional`，以覆盖新增真实 POST route decorators。

## 变更预算与路径分类

- source 预算：changed source files <= 8，net source LOC <= 600，new source files <= 1。
- path classification:
  - source: `apps/admin/src/orderImportApiClient.ts`, `apps/admin/src/M4OrderImportVisibleSmokeState.tsx`, `apps/api/src/order-import.controller.ts`, `apps/api/src/order-import.service.ts`, `apps/api/scripts/order-import-http-smoke-harness.mjs`, `packages/db/scripts/order-import-admin-visible-smoke-harness.mjs`, `packages/db/scripts/run-m4-order-import-admin-submit-true-db-worker-dispatch-smoke.mjs`
  - test: `scripts/tests/m4-order-import-admin-submit-true-db-worker-dispatch-smoke.test.mjs`, `scripts/tests/m4-order-import-admin-api-bridge-contract.test.mjs`, `scripts/tests/m4-order-import-api-shell.test.mjs`, `scripts/tests/m4-order-import-runtime-warning-contract.test.mjs`
  - config: `.github/workflows/ci.yml`
  - docs: `docs/specs/M4-40-order-import-admin-submit-true-db-worker-dispatch-smoke.md`, `docs/evidence/M4/M4-40-order-import-admin-submit-true-db-worker-dispatch-smoke.md`, `docs/evidence/M4/README.md`
  - generated: none
  - lock: none
- 新增 source 文件前的 `rg` 搜索结论和归属理由：已检索 `submitImportCsvTextJob`, `ORDER_IMPORT_SUBMIT_DISPATCHER`, `runOrderImportCsvTextDispatchContract`, `createOrderImportWorkerPrismaPersistenceGateway`, `M4OrderImportVisibleSmokeState`, `run-m4-order-import-admin-visible`, `order-import-http-smoke-harness`, `UZMAX_RLS_DATABASE_URL`。现有 M4-35 proves worker-generated true DB rows with direct script; M4-36/M4-37/M4-38/M4-39 prove HTTP/Admin/browser readback against preseeded true DB rows. No existing script proves browser-originated submit through API POST into worker dispatch/persistence and then Admin readback, so新增 `run-m4-order-import-admin-submit-true-db-worker-dispatch-smoke.mjs` as a narrow CI smoke entrypoint.
- 外部 API/SDK/provider/connector/adapter 依据：不新增外部 order API/provider/connector/adapter；使用 repo 已声明 NestJS、Vite、Playwright、Prisma Client、TypeScript transpile helper 和 GitHub Actions secret `UZMAX_RLS_DATABASE_URL` 指向 Supabase dev main。
- 是否需要例外：无。

## 文档触发检查

- 结果：`updated`
- 判断依据：`docs/doc-gates.md`

## 前置条件

- 已读取 `AGENTS.md`、`docs/specs/README.md`、`docs/doc-gates.md`、`docs/evidence/M4/README.md`、`UZMAX智能运营系统-1.0验收矩阵-v1.1.md` 中 E-02/E-03/E-04/I-01/J-02/B-01、M4-24/M4-27/M4-31/M4-35/M4-36/M4-37/M4-38/M4-39 spec/evidence/tests/scripts、`apps/admin/src/orderImportApiClient.ts`、`apps/admin/src/M4OrderImportVisibleSmokeState.tsx`、`apps/api/src/order-import.controller.ts`、`apps/api/src/order-import.service.ts`、`apps/api/scripts/order-import-http-smoke-harness.mjs`、`apps/worker/src/main.ts`、`apps/worker/src/order-import-dispatch.ts`、`apps/worker/src/order-import-prisma-persistence.ts`、`packages/db/scripts/order-import-admin-visible-smoke-harness.mjs`、`packages/db/scripts/order-import-true-db-http-smoke-fixture.mjs` 和 `.github/workflows/ci.yml`。
- M4-39 已合并到 main，CI/dev true DB browser smoke 已证明 Admin shell 可以从真实 Nest HTTP routes 读取 Supabase dev DB/RLS synthetic fresh/stale/missing rows。
- GitHub Actions secret `UZMAX_RLS_DATABASE_URL` 存在但值不得打印；本地 shell 可以 fail-closed，不要求保存 secret。
- Worktree / branch：物理 worktree `/Users/atilla/Documents/uzmax-m4-40-order-import-admin-submit-true-db-worker-dispatch-smoke`；branch `codex/m4-40-order-import-admin-submit-true-db-worker-dispatch-smoke`；禁止写入 `/Users/atilla/Documents/UZMAX智能运营` root/main checkout。开工前记录：`pwd=/Users/atilla/Documents/uzmax-m4-40-order-import-admin-submit-true-db-worker-dispatch-smoke`，`git status --short --branch=## codex/m4-40-order-import-admin-submit-true-db-worker-dispatch-smoke`，`git branch --show-current=codex/m4-40-order-import-admin-submit-true-db-worker-dispatch-smoke`。
- 并发派发证据：本 spec 触碰 CI/workflow、API POST、Admin smoke、packages/db true DB smoke 和 M4 evidence README，必须全局串行；不并发派发其他 DB/schema/runtime/CI/release gate 改动。

## 事故与 closeout 记录

- 开工前未发现 assigned worktree 脏改；曾短暂创建 M4-40 eval/redline 方向 worktree，因切回 E-02 主路径而在无代码改动/无提交/无 PR 后清理 worktree、physical directory 和 local branch。
- 本 spec 不触发 `docs/incidents/README.md` 阈值；若发现写入越界、错分支、secret/customer-data 边界擦边或 gate 绕过，停止并记录 incident。

## 实施步骤

1. 扩展 Admin API client：增加受控 `submitImportCsvTextJob()`，只接收 synthetic CSV text payload、UUID allocations、controlled source ref，并发 POST `/order-import/jobs`。
2. 扩展 API service/controller：新增 `POST /order-import/jobs`，提交要求 `order:write`；默认无 dispatcher provider 时 fail-closed；smoke-only dispatcher 注入后把 access context 映射成 worker dispatch input。
3. 扩展 HTTP/visible smoke harness：真实 POST body、content-type、permissions 通过 browser route proxy 传到 Nest HTTP app；M4-38/M4-39 默认仍 preseed rows，M4-40 可 `seedRows: false` 并注入 dispatcher。
4. 新增 M4-40 true DB runner：创建 synthetic org/tenant only；browser inject smoke submit payload；API POST 调用 worker `runOrderImportCsvTextDispatchContract` + worker `createOrderImportWorkerPrismaPersistenceGateway` + `runOrderImportCsvTextPersistenceJob`，在 RLS transaction 内写入，然后 browser/Admin readback fresh snapshot/job/error，tenant B read remains isolated，cleanup residue `0`。
5. CI 在 “M4 order import true DB runtime smokes” 组中追加 M4-40 script，跟在 M4-39 后面。
6. 新增 focused structure test，断言 Admin client POST、smoke-only submit gate、API fail-closed dispatcher、worker dispatch/persistence path、RLS role/settings、tenant B isolation、CI wiring 和 evidence conservative。
7. 更新 M4 evidence README 和新增 evidence 文件，CI 结果在 PR 前保持 pending，不写假 CI pass。

## 通过条件

- `node --test scripts/tests/m4-order-import-admin-submit-true-db-worker-dispatch-smoke.test.mjs` 通过。
- `node --test scripts/tests/m4-order-import-api-shell.test.mjs scripts/tests/m4-order-import-admin-api-bridge-contract.test.mjs scripts/tests/m4-order-import-runtime-warning-contract.test.mjs scripts/tests/m4-order-import-admin-submit-true-db-worker-dispatch-smoke.test.mjs` 通过。
- `env -u UZMAX_RLS_DATABASE_URL node packages/db/scripts/run-m4-order-import-admin-submit-true-db-worker-dispatch-smoke.mjs` fail closed with `UZMAX_RLS_DATABASE_URL is required`。
- CI true DB visible submit smoke 使用 dev main `UZMAX_RLS_DATABASE_URL` 实际通过：browser UI 发起 POST，API submit dispatcher 调用 worker dispatch/persistence path，RLS write/readback 通过，tenant B 隔离，cleanup residue `0`。
- Repo 不提交 env/secret/raw customer/order data；secret value 不打印。
- `npm run format:check`、`npm run guard:pr-shape -- --base origin/main --spec docs/specs/M4-40-order-import-admin-submit-true-db-worker-dispatch-smoke.md --include-worktree`、`npm run test`、worker boundary 通过。

## 失败分支

- 若 API POST 需要正式 auth runtime、生产配置或外部订单 API：停止，记录 blocker，不在本 spec 中扩范围。
- 若 worker dispatch/persistence 不能在预算内通过局部 TS transpile/import 复用：停止，记录 blocker；不得把 smoke 改成 controller direct-call mock。
- 若 RLS write/read 失败：停止，记录是 role grant、policy、pooler transaction、Prisma generated client、schema mismatch、metadata cleanup 还是 repository mapping；不得改成 non-RLS write/read。
- 若 GitHub secret 不可用：停止，记录 blocker，不把 smoke 改为 skip/pass。
- 若需要 BullMQ/Redis runtime、Storage upload/download、real CSV/XLSX sample、production DB 或真实客户/订单数据：停止并拆后续 spec。

## 不做什么

- 不新增外部订单 API connector、正式身份/权限 runtime、BullMQ/Redis runtime、Storage downloader/uploader、真实导入文件、XLSX parser、生产配置、migration SQL、Prisma schema/generated client、package/lockfile、release gate、AI runtime/eval 或真实客户/订单数据。
- 不关闭 E-02/E-03/E-04/I-01/J-02/B-01 的完整验收；只添加一个 synthetic Admin browser submit -> worker dispatch/persistence -> true DB/RLS -> Admin readback smoke。

## 验收映射

| 验收项 | 状态 | 说明 |
|---|---|---|
| B-01 | `admin_submit_worker_dispatch_true_db_smoke_supported_not_closed` | Synthetic submit rows write/read under Supabase dev main RLS; full durable SQL/RLS matrix remains future scope. |
| E-02 | `admin_submit_worker_dispatch_true_db_smoke_supported_not_closed` | M4-40 proves browser-originated synthetic CSV submit reaches API POST, worker dispatch/persistence and true DB Admin readback. Formal auth runtime, real Storage/file upload, real sample and full E2E remain open. |
| E-03 | `admin_visible_stale_missing_true_db_smoke_supported_not_closed` | No new stale sample beyond M4-39; submit path writes fresh snapshot only. Persisted warning storage and full E2E stale samples remain future scope. |
| E-04 | `eval_contract_supported_not_closed` | No AI order-read runtime/eval gate changes; M4-40 does not alter redlines. |
| I-01 | `partial_admin_submit_true_db_smoke_not_closed` | `/design` smoke-only Admin shell can submit and read back a synthetic import path. Full desktop core order/customer workflow remains future scope. |
| J-02 | `worker_dispatch_smoke_supported_not_closed` | Uses existing worker dispatch contract and persistence gateway directly in smoke; real BullMQ/Redis retry/idempotency/backlog/fault-injection evidence remains future scope. |
