# M4-38 Order Import Admin Visible True DB Smoke

## 目标

把 M4-37 的 `Admin client -> Nest HTTP -> API -> DB/RLS` true DB smoke 推进到实际 Admin shell 页面：浏览器访问 `/design` 时，在 smoke-only runtime mode 下让 M4 order import UI 通过现有 `createOrderImportApiClient` 调用相对 `/order-import` endpoints，显示来自 Supabase dev main synthetic rows 的 import job、row error 和 fresh snapshot，并继续保持 stale/missing 不关闭的口径。

本 spec 只新增 visible smoke evidence。不新增正式订单 API connector、正式 auth runtime、Storage runtime、BullMQ/Redis、XLSX、真实客户/订单数据、env/secret、schema/migration/generated client、package/lockfile，也不关闭完整 E-02/I-01/J-02/E-03/E-04。

## 项目 Owner 确认点与 AI Agent 责任

Owner：确认本切片只作为 M4 order import admin visible true DB smoke 证据，不代表完整订单导入流程、正式登录鉴权、真实文件导入、worker queue、Storage runtime、真实客户/订单数据或 1.0 发布验收关闭。真实账号、真实订单/客户数据、生产配置、成本、合规和最终发布仍由 owner 决策。

AI agent：只在 `/Users/atilla/Documents/uzmax-m4-38-order-import-admin-visible-true-db-e2e` / `codex/m4-38-order-import-admin-visible-true-db-e2e` 执行；负责先创建本 spec，再实现 smoke-only browser runtime mode、true DB browser smoke script、CI wiring、focused structure test 和 evidence。不得写 root `/Users/atilla/Documents/UZMAX智能运营`，不得 revert 其他 worker 或 root/main 改动。

## 时间盒

0.5 个工作日。若 browser smoke 因 Playwright browser install、Vite server、route proxy、Nest HTTP smoke app、RLS policy、Prisma transaction、GitHub secret 或 Admin shell runtime shape 失败，停止并记录明确阻断；不得降级成纯 mock、删除断言、扩大完成口径或关闭完整 E-02/I-01。

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M4-38-order-import-admin-visible-true-db-smoke.md`
  - `docs/evidence/M4/M4-38-order-import-admin-visible-true-db-smoke.md`
  - `docs/evidence/M4/README.md`
  - `.github/workflows/ci.yml`
  - `apps/admin/src/M4OrderPathStatusShell.tsx`
  - `apps/admin/src/M4OrderImportVisibleSmokeState.tsx`
  - `apps/admin/tests/design.spec.ts`
  - `packages/db/scripts/run-m4-order-import-admin-visible-true-db-smoke.mjs`
  - `scripts/tests/m4-order-import-admin-visible-true-db-smoke.test.mjs`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：不修改 CSS，复用现有 M4 shell classes；新增 admin source 文件只承载 smoke-only global runtime UI，避免既有 React shell 超过 lint 行数预算；不得修改 `packages/db/prisma/**`、`packages/db/migrations/**`、generated client、package/lockfile、worker queue、Storage runtime、external order API connector、真实样本目录、root/main checkout 或其他 worktree。

## 变更预算与路径分类

- source 预算：changed source files <= 4，net source LOC <= 450，new source files <= 2。
- test/generated/lock/config/docs 预计变更：新增 1 个 true DB browser smoke script；新增 1 个 focused structure test；更新既有 Playwright design test 的 default-shell assertions、CI workflow、spec/evidence/M4 README；不改 package manifest/lockfile/generated/schema/migration。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：已检索 `M4OrderPathStatusShell`, `createOrderImportApiClient`, `startOrderImportHttpSmoke`, `order-import-true-db-http-smoke-fixture`, `run-m4-order-import-admin-true-db-http-smoke`, `playwright`, `vite`, `route`, `UZMAX_RLS_DATABASE_URL`。现有 M4-37 只到 Admin client HTTP smoke，不启动 browser/admin visible E2E；现有 `/design` M4 shell 是 synthetic local shell。因此就地扩展 `apps/admin/src/M4OrderPathStatusShell.tsx` 并新增 `apps/admin/src/M4OrderImportVisibleSmokeState.tsx` 承载 smoke-only global runtime mode，避免既有 M4 shell 超过 React 文件行数 lint；新增 `packages/db/scripts/run-m4-order-import-admin-visible-true-db-smoke.mjs` 作为 true DB browser evidence entrypoint。
- 外部 API/SDK/provider/connector/adapter 依据：不新增外部 order API、provider、connector 或 adapter；使用 repo 已声明的 Playwright、Vite、NestJS、Prisma Client 和 GitHub Actions secret `UZMAX_RLS_DATABASE_URL` 指向 Supabase dev main。
- 是否需要例外：无。

## 文档触发检查

- 结果：`updated`
- 判断依据：`docs/doc-gates.md`。
- 备注：触碰 CI、Admin visible true DB smoke 和 M4 evidence README；不新增 release/runbook/environment 文档。

## 前置条件

- 已读取 `AGENTS.md`、`docs/specs/README.md`、`docs/doc-gates.md`、`docs/evidence/M4/README.md`、`docs/specs/M4-37-order-import-admin-true-db-http-smoke.md`、M4-37 evidence、`docs/adr/ADR-B02-order-api.md`、PRD REQ-T04、后台设计 §4.4、技术架构 §8/§10/§12、验收矩阵 E-02/E-03/E-04/I-01/J-02。
- M4-37 已合并到 main，CI/dev true DB HTTP smoke 已证明现有 Admin client 可以从真实 Nest HTTP routes 读取 Supabase dev DB/RLS synthetic import rows。
- GitHub Actions secret `UZMAX_RLS_DATABASE_URL` 存在但值不得打印；本地 shell 可以 fail-closed，不要求保存 secret。
- Worktree / branch：物理 worktree `/Users/atilla/Documents/uzmax-m4-38-order-import-admin-visible-true-db-e2e`；branch `codex/m4-38-order-import-admin-visible-true-db-e2e`；禁止写入 `/Users/atilla/Documents/UZMAX智能运营` root/main checkout。开工前记录：`pwd=/Users/atilla/Documents/uzmax-m4-38-order-import-admin-visible-true-db-e2e`，`git status --short --branch=## codex/m4-38-order-import-admin-visible-true-db-e2e`，`git branch --show-current=codex/m4-38-order-import-admin-visible-true-db-e2e`。
- Worker boundary evidence: `UZMAX_ASSIGNED_WORKTREE=/Users/atilla/Documents/uzmax-m4-38-order-import-admin-visible-true-db-e2e UZMAX_PRIMARY_ROOT=/Users/atilla/Documents/UZMAX智能运营 npm run guard:worker-boundary` passed.
- 并发派发证据：本 spec 触碰 CI/workflow、packages/db true DB smoke、Admin shell 和 M4 evidence README，必须全局串行；不并发派发其他 DB/schema/runtime/CI/release gate 改动。

## 实施步骤

1. 在 `M4OrderPathStatusShell` 中保留默认 `/design` synthetic local shell；新增 browser global `window.__UZMAX_M4_ORDER_IMPORT_VISIBLE_SMOKE__ = { enabled: true, now, queryRef }` 控制的 smoke-only runtime mode。
2. Runtime mode 使用现有 `createOrderImportApiClient({ fetcher: (input, init) => fetch(input, init) })` 调用相对 `/order-import` endpoints，加载 jobs、第一条 job 的 row errors 和 snapshot search。
3. Runtime mode 在现有 shell 内渲染稳定 `data-testid`，显示受控 `sourceRef`、`order_status_ref_required`、`snapshot_ready`、`status://order/ready`、`Handoff: not required`，不显示 secret/raw customer data。
4. 新增 true DB visible smoke script：seed suffix `138`，syntheticSpec `M4-38`，sourceRef `storage://order-imports/m4-38-admin-visible-true-db-smoke.csv`，orderRef `controlled://order/m4-38-ref-a`，启动真实 Nest HTTP smoke app 与 Vite dev server，Playwright Chromium 访问 `/design`，route proxy `**/order-import/**` 到 Nest HTTP base URL 并加 synthetic headers，断言可见 Admin shell runtime data，再 cleanup synthetic rows 并断言 residue `0`。
5. CI true DB smoke 在 M4-37 后执行 M4-38；true DB smoke 前安装 Playwright Chromium。
6. 新增 focused structure test 验证 smoke global、Admin client fetcher、Playwright/Vite、HTTP harness、fixture、route proxy、`residue=0`、fail-closed env 和 evidence 不声称完整 E-02 关闭。
7. 更新 M4 evidence README 和新增 evidence 文件，状态保守标为 visible smoke supported/partial not closed。

## 通过条件

- Default `/design` shell 仍通过既有 Playwright assertions，并保持 synthetic local states。
- Focused test 验证 M4-38 browser smoke 结构、CI wiring、docs/evidence 边界。
- CI true DB visible smoke 使用 dev main `UZMAX_RLS_DATABASE_URL` 实际通过：browser UI 通过 route proxy 调用真实 Nest HTTP order-import routes，并显示 tenant A synthetic import job、row error、fresh snapshot；cleanup residue `0`。
- `env -u UZMAX_RLS_DATABASE_URL node packages/db/scripts/run-m4-order-import-admin-visible-true-db-smoke.mjs` fail closed with `UZMAX_RLS_DATABASE_URL is required`。
- Repo 不提交 env/secret/raw customer/order data；secret value 不打印。
- `npm run format:check`、`npm run lint`、`npm run typecheck`、focused tests、`npm run guard:pr-shape -- --base origin/main --spec docs/specs/M4-38-order-import-admin-visible-true-db-smoke.md --include-worktree`、`npm run test`、`npm run build` 通过；`npm run playwright` practical 时通过。

## 失败分支

- 若 browser smoke 不能在预算内复用现有 `createOrderImportApiClient` 和真实 HTTP app：停止，记录 blocked evidence；不得降级为 controller direct-call contract。
- 若 Vite/Playwright browser runtime 缺失：记录精确 blocker，保持 CI-ready；不得删除 browser assertion。
- 若 RLS write/read 失败：停止，记录是 role grant、policy、pooler transaction、Prisma generated client、schema mismatch 还是 repository mapping；不得改成 non-RLS read/write。
- 若 GitHub secret 不可用：停止，记录 blocker，不把 smoke 改为 skip/pass。
- 若需要正式 auth runtime、real CSV/XLSX、Storage upload/download、BullMQ/Redis、external order API、production DB 或真实客户/订单数据：停止并拆后续 spec。

## 不做什么

- 不新增外部订单 API connector、正式身份/权限 runtime、BullMQ/Redis runtime、Storage downloader/uploader、真实导入文件、XLSX parser、生产配置、migration SQL、Prisma schema/generated client、package/lockfile、release gate 或真实客户/订单数据。
- 不关闭 E-02/E-03/E-04/J-02/I-01 的完整验收；只把 M4-37 的真库 HTTP smoke 推进到 visible Admin browser shell，作为后续完整 admin E2E 和 workflow closeout 的进度信号。

## 验收映射

| 验收项 | 状态 | 说明 |
|---|---|---|
| B-01 | `admin_visible_true_db_smoke_supported_not_closed` | Browser UI requests traverse Admin client -> Nest HTTP -> API -> DB/RLS against dev main synthetic rows. Full durable SQL/RLS matrix remains future scope. |
| E-02 | `admin_visible_true_db_smoke_supported_not_closed` | Visible Admin shell can display true DB synthetic import job, row error and fresh snapshot. Formal auth runtime, full worker queue execution, real import sample, Storage runtime and full E2E remain open. |
| E-03 | `partial_admin_visible_true_db_smoke_not_closed` | Fresh snapshot visibility is covered; stale/missing visible E2E samples and persisted warning evidence remain future scope. |
| E-04 | `not_closed` | AI no-fabrication runtime/eval is not covered. |
| J-02 | `not_closed` | BullMQ/Redis retry/idempotency/backlog/fault injection not covered. |
| I-01 | `partial_admin_visible_true_db_smoke_not_closed` | `/design` Admin shell can visibly render runtime data through true DB HTTP smoke; full desktop order/customer workflow remains future scope. |
