# M4-41 Order Import Storage-backed True DB Smoke

## 目标

把 M4-40 的 browser submit -> API -> worker -> DB/RLS -> Admin readback 继续纵切到真实 Supabase Storage：浏览器 smoke 只提交 Storage object metadata，不再提交 inline `csvText` 或手写 `sourceRef`；CI runner 用 Supabase secret key 在 dev project private bucket 上传 synthetic CSV object，API smoke-only dispatcher 从 Storage 下载 object，复用既有 worker `createOrderImportCsvTextInputFromStorageObject`、dispatch contract 和 Prisma persistence gateway，在 Supabase dev main RLS transaction 中写入 import job / snapshot / row error，再由 Admin/browser 读回。

M4-41 不关闭完整 E-02/E-03/E-04/I-01/J-02/B-01。它只证明 `Storage object -> API POST metadata -> worker Storage intake/download -> DB/RLS -> Admin readback` 的 synthetic CI smoke。正式 Admin upload UI、正式 auth runtime、BullMQ/Redis runtime、XLSX parser、真实导入样本、AI order-read eval/redline gate 和 release signoff 仍然开放。

## 项目 Owner 确认点与 AI Agent 责任

Owner：确认本切片只作为 M4 no-API branch 的 synthetic Storage-backed smoke evidence，不代表正式订单导入、正式登录鉴权、真实客户/订单数据、生产配置、成本、合规或 1.0 发布验收关闭。

AI agent：只在 `/Users/atilla/Documents/uzmax-m4-41-order-import-storage-backed-true-db-smoke` / `codex/m4-41-order-import-storage-backed-true-db-smoke` 执行；负责先创建本 spec，再实现 Storage-backed submit/readback smoke、focused structure test、CI wiring 和 evidence。不得写 root `/Users/atilla/Documents/UZMAX智能运营`，不得 revert 其他 worker 或 root/main 改动。

## 时间盒

0.5 个工作日。若 Supabase Storage upload/download、API metadata POST、worker Storage intake、worker dispatch/persistence、Vite/Playwright browser submit、RLS write/read、Prisma transaction、GitHub secret 或 CI true DB smoke 失败，停止并记录明确阻断；不得降级成 inline `csvText`、纯 mock、删除断言、扩大完成口径或关闭完整 E-02/E-03/E-04/I-01/J-02/B-01。

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M4-41-order-import-storage-backed-true-db-smoke.md`
  - `docs/evidence/M4/M4-41-order-import-storage-backed-true-db-smoke.md`
  - `docs/evidence/M4/README.md`
  - `.github/workflows/ci.yml`
  - `apps/admin/src/orderImportApiClient.ts`
  - `apps/admin/src/orderImportVisibleSmokeSubmit.ts`
  - `apps/admin/src/M4OrderImportVisibleSmokeState.tsx`
  - `apps/api/src/order-import.submit.ts`
  - `apps/api/src/order-import.service.ts`
  - `apps/api/src/order-import.controller.ts`
  - `apps/api/src/order-import.ts`
  - `apps/api/scripts/runtime-compiler.mjs`
  - `packages/db/scripts/order-import-admin-visible-smoke-harness.mjs`
  - `packages/db/scripts/order-import-worker-submit-smoke-support.mjs`
  - `packages/db/scripts/run-m4-order-import-admin-submit-true-db-worker-dispatch-smoke.mjs`
  - `packages/db/scripts/run-m4-order-import-storage-backed-true-db-smoke.mjs`
  - `packages/db/package.json`
  - `package-lock.json`
  - `scripts/tests/m4-order-import-storage-backed-true-db-smoke.test.mjs`
  - `scripts/tests/m4-order-import-admin-submit-true-db-worker-dispatch-smoke.test.mjs`
  - `scripts/tests/m4-order-import-admin-api-bridge-contract.test.mjs`
  - `scripts/tests/m4-order-import-api-shell.test.mjs`
  - `scripts/tests/m4-order-import-runtime-warning-contract.test.mjs`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：不修改 DB schema/migration/generated client，不新增生产 Admin upload UI，不新增正式 Storage service，不引入 BullMQ/Redis。新增 API submit helper 是为控制 Nest service 文件长度并复用 CSV/storage submit validation；新增 Admin smoke submit helper 是为控制 React smoke component 文件长度并避免 inline CSV 路径继续膨胀；新增 worker submit smoke helper 是为避免 M4-40/M4-41 true DB runner 复制；`packages/db/package.json`/`package-lock.json` 只声明已有 workspace dependency `@supabase/supabase-js` 给 M4-41 Storage smoke script 使用。

## 变更预算与路径分类

- source 预算：changed source files <= 12，net source LOC <= 650，new source files <= 4。
- path classification:
  - source: `apps/admin/src/orderImportApiClient.ts`, `apps/admin/src/orderImportVisibleSmokeSubmit.ts`, `apps/admin/src/M4OrderImportVisibleSmokeState.tsx`, `apps/api/src/order-import.submit.ts`, `apps/api/src/order-import.service.ts`, `apps/api/src/order-import.controller.ts`, `apps/api/src/order-import.ts`, `apps/api/scripts/runtime-compiler.mjs`, `packages/db/scripts/order-import-admin-visible-smoke-harness.mjs`, `packages/db/scripts/order-import-worker-submit-smoke-support.mjs`, `packages/db/scripts/run-m4-order-import-admin-submit-true-db-worker-dispatch-smoke.mjs`, `packages/db/scripts/run-m4-order-import-storage-backed-true-db-smoke.mjs`
  - test: `scripts/tests/m4-order-import-storage-backed-true-db-smoke.test.mjs`, `scripts/tests/m4-order-import-admin-submit-true-db-worker-dispatch-smoke.test.mjs`, `scripts/tests/m4-order-import-admin-api-bridge-contract.test.mjs`, `scripts/tests/m4-order-import-api-shell.test.mjs`, `scripts/tests/m4-order-import-runtime-warning-contract.test.mjs`
  - config: `.github/workflows/ci.yml`, `packages/db/package.json`
  - docs: `docs/specs/M4-41-order-import-storage-backed-true-db-smoke.md`, `docs/evidence/M4/M4-41-order-import-storage-backed-true-db-smoke.md`, `docs/evidence/M4/README.md`
  - generated: none
  - lock: `package-lock.json`
- 新增 source 文件前的 `rg` 搜索结论和归属理由：已检索 `createOrderImportCsvTextInputFromStorageObject`, `submitImportCsvTextJob`, `ORDER_IMPORT_SUBMIT_DISPATCHER`, `run-m4-order-import-admin-submit`, `UZMAX_SUPABASE_SECRET_KEY`, `order-import-storage-object-intake`, `order-import-http-smoke-harness`。现有 M4-30 只验证已提供 content 的 Storage object intake contract；M4-40 仍由 browser inline `csvText` 进入 API/worker。没有现有脚本证明真实 Supabase Storage upload/download 后经 API metadata POST 到 worker Storage intake 并 true DB/RLS readback，所以新增 `run-m4-order-import-storage-backed-true-db-smoke.mjs` as a narrow CI smoke entrypoint。
- 外部 API/SDK/provider/connector/adapter 依据：不新增外部 order API/provider/connector/adapter；使用 repo 已依赖 `@supabase/supabase-js`。Supabase docs/changelog 已在 2026-06-23 核对：Storage upload/download API 支持 private bucket object upload/download；近期 Data API exposure breaking change 不影响本 direct Storage + Postgres/RLS path。
- 是否需要例外：无。

## 文档触发检查

- 结果：`updated`
- 判断依据：`docs/doc-gates.md`

## 前置条件

- 已读取 `AGENTS.md`、`docs/specs/README.md`、`docs/doc-gates.md`、`docs/evidence/M4/README.md`、M4-30/M4-40 spec/evidence/tests/scripts、`apps/admin/src/orderImportApiClient.ts`、`apps/admin/src/M4OrderImportVisibleSmokeState.tsx`、`apps/api/src/order-import.controller.ts`、`apps/api/src/order-import.service.ts`、`apps/api/scripts/order-import-http-smoke-harness.mjs`、`apps/worker/src/order-import-file-intake.ts`、`apps/worker/src/order-import-dispatch.ts`、`apps/worker/src/order-import-prisma-persistence.ts`、`packages/db/scripts/order-import-admin-visible-smoke-harness.mjs`、`packages/db/scripts/order-import-true-db-http-smoke-fixture.mjs` 和 `.github/workflows/ci.yml`。
- M4-40 已合并到 main，CI/dev true DB browser submit smoke 已证明 Admin browser submit 可以通过 API POST、worker dispatch/persistence 和 DB/RLS readback。
- GitHub Actions secrets `UZMAX_RLS_DATABASE_URL`、`UZMAX_SUPABASE_SECRET_KEY` 存在但值不得打印；Supabase dev project URL 沿用 CI workflow 中的 `https://enyocaykcgcfcswycujg.supabase.co`；本地 shell 可以 fail-closed，不要求保存 secret。
- Worktree / branch：物理 worktree `/Users/atilla/Documents/uzmax-m4-41-order-import-storage-backed-true-db-smoke`；branch `codex/m4-41-order-import-storage-backed-true-db-smoke`；禁止写入 `/Users/atilla/Documents/UZMAX智能运营` root/main checkout。开工前记录：`pwd=/Users/atilla/Documents/uzmax-m4-41-order-import-storage-backed-true-db-smoke`，`git status --short --branch=## codex/m4-41-order-import-storage-backed-true-db-smoke`，`git branch --show-current=codex/m4-41-order-import-storage-backed-true-db-smoke`。
- 并发派发证据：本 spec 触碰 CI/workflow、API POST、Admin smoke、packages/db true DB smoke 和 M4 evidence README，必须全局串行；不并发派发其他 DB/schema/runtime/CI/release gate 改动。可派发只读 verifier，但写入由本 worktree 单 worker 完成。

## 事故与 closeout 记录

- 开工前 root/main clean，M4-41 assigned worktree clean；M4-40 worktree/local branch/remote branch 已清理，`git branch --no-merged main` 和 open PR 均为空。
- 本 spec 不触发 `docs/incidents/README.md` 阈值；若发现写入越界、错分支、secret/customer-data 边界擦边或 gate 绕过，停止并记录 incident。

## 实施步骤

1. 抽出 API submit validation/response helper，保留 M4-40 inline CSV smoke，并新增 Storage object metadata submit input；Storage submit route 必须拒绝 `csvText` 和手写 `sourceRef`。
2. 扩展 Admin API client 与 visible smoke submit helper：新增 `submitImportStorageObjectJob()`，POST `/order-import/storage-jobs`，browser smoke config 只携带 bucket/object metadata、UUID allocations、mediaType/maxRows。
3. 新增 M4-41 true DB runner：在 Supabase private bucket 上传 synthetic CSV object，browser inject storage submit metadata，API smoke-only dispatcher 下载 object，调用 worker `createOrderImportCsvTextInputFromStorageObject`，再调用既有 dispatch/persistence path 和 RLS transaction。
4. Browser/Admin readback 断言 fresh snapshot、row error、source ref；tenant B read remains isolated；DB residue `0`；Storage object cleanup residue `0`。
5. CI 在 “M4 order import true DB runtime smokes” 组中追加 M4-41 script，并向该组传入 Supabase URL/secret env。
6. 新增 focused structure test，断言 no inline `csvText` POST、Storage upload/download/remove、worker Storage intake、worker dispatch/persistence、RLS role/settings、tenant B isolation、CI wiring 和 evidence conservative。
7. 更新 M4 evidence README 和新增 evidence 文件，CI 结果在 PR 前保持 pending，不写假 CI pass。

## 通过条件

- `node --test scripts/tests/m4-order-import-storage-backed-true-db-smoke.test.mjs` 通过。
- `node --test scripts/tests/m4-order-import-api-shell.test.mjs scripts/tests/m4-order-import-admin-api-bridge-contract.test.mjs scripts/tests/m4-order-import-runtime-warning-contract.test.mjs scripts/tests/m4-order-import-admin-submit-true-db-worker-dispatch-smoke.test.mjs scripts/tests/m4-order-import-storage-backed-true-db-smoke.test.mjs` 通过。
- `env -u UZMAX_RLS_DATABASE_URL node packages/db/scripts/run-m4-order-import-storage-backed-true-db-smoke.mjs` fail closed with `UZMAX_RLS_DATABASE_URL is required`。
- CI true DB Storage-backed smoke 使用 Supabase dev main 实际通过：Storage upload/download、browser metadata POST、API submit dispatcher、worker Storage intake、worker dispatch/persistence、RLS write/readback、tenant B 隔离、DB residue `0`、Storage object residue `0`。
- Repo 不提交 env/secret/raw customer/order data；secret value 不打印；browser/API POST body 不包含 `csvText` 或 raw customer/order data。
- `npm run format:check`、`npm run guard:pr-shape -- --base origin/main --spec docs/specs/M4-41-order-import-storage-backed-true-db-smoke.md --include-worktree`、`npm run test`、worker boundary 通过。

## 失败分支

- 若 Supabase Storage secret/env 不可用：停止，记录 blocker，不把 smoke 改为 skip/pass 或 inline `csvText`。
- 若 Storage bucket/object upload/download 需要生产配置或真实客户/订单数据：停止，记录 blocker，不在本 spec 中扩范围。
- 若 worker Storage intake 不能复用既有 M4-30 function：停止，记录 blocker；不得新增平行 parser/downloader contract。
- 若 RLS write/read 失败：停止，记录是 role grant、policy、pooler transaction、Prisma generated client、schema mismatch、metadata cleanup 还是 repository mapping；不得改成 non-RLS write/read。
- 若需要 BullMQ/Redis runtime、XLSX parser、production DB 或真实客户/订单数据：停止并拆后续 spec。

## 不做什么

- 不新增外部订单 API connector、正式身份/权限 runtime、正式 Admin upload UI、BullMQ/Redis runtime、XLSX parser、生产配置、migration SQL、Prisma schema/generated client、package/lockfile、release gate、AI runtime/eval 或真实客户/订单数据。
- 不关闭 E-02/E-03/E-04/I-01/J-02/B-01 的完整验收；只添加一个 synthetic Storage-backed true DB smoke。

## 验收映射

| 验收项 | 状态 | 说明 |
|---|---|---|
| B-01 | `storage_backed_true_db_smoke_supported_not_closed` | Synthetic Storage object rows write/read under Supabase dev main RLS; full durable SQL/RLS matrix remains future scope. |
| E-02 | `storage_backed_true_db_smoke_supported_not_closed` | M4-41 proves real Supabase Storage object upload/download can reach API metadata POST, worker Storage intake, dispatch/persistence and true DB Admin readback. Formal auth runtime, real customer sample, XLSX parser and full E2E remain open. |
| E-03 | `admin_visible_stale_missing_true_db_smoke_supported_not_closed` | No new stale sample beyond M4-39; Storage-backed path writes a fresh snapshot only. Persisted warning storage and full E2E stale samples remain future scope. |
| E-04 | `eval_contract_supported_not_closed` | No AI order-read runtime/eval gate changes; M4-41 does not alter redlines. |
| I-01 | `partial_storage_backed_admin_submit_true_db_smoke_not_closed` | `/design` smoke-only Admin shell can submit Storage metadata and read back a synthetic import path. Full desktop core order/customer workflow remains future scope. |
| J-02 | `worker_storage_intake_dispatch_smoke_supported_not_closed` | Uses worker Storage intake plus existing worker dispatch contract and persistence gateway directly in smoke; real BullMQ/Redis retry/idempotency/backlog/fault-injection evidence remains future scope. |
