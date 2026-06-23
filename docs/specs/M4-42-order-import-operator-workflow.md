# M4-42 Order Import Operator Workflow

## 目标

把 M4-41 的 Storage-backed true DB smoke 推进为 M4 no-API 分支下的最小 operator workflow：租户后台可以通过订单导入主路径提交受控 CSV/TSV 文件，看到导入任务、成功行、失败行、错误原因、fresh/stale/missing 查询状态，并由真实 API + worker dispatch/persistence + Supabase dev main DB/RLS 支撑浏览器可见 readback。

本 spec 的核心目标是关闭 E-02/E-03/I-01 在订单导入主路径上的 M4 级别缺口，而不是继续新增横向 contract。它不关闭完整 M4，也不关闭客户资产、AI order-read runtime、BullMQ/Redis runtime、安全依赖或 1.0 release。

M4 剩余节奏按以下顺序收束，除非当前 slice 失败分支要求调整：

1. M4-42：订单导入 operator workflow，本 spec。
2. M4-43：客户资产真实 DB/RLS-backed workflow。
3. M4-44：AI order-read runtime 与 no-fabrication eval/redline gate。
4. M4-45：队列/安全/closeout，包含 BullMQ/Redis 或等价队列证据、`npm audit` high 风险处理或阻断记录、M4 closeout evidence。

## 项目 Owner 确认点与 AI Agent 责任

Owner：确认 M4-42 只使用受控 synthetic 或 owner 明确允许的非敏感导入样例；不要求提交真实客户/订单明文、真实订单号、电话、地址、支付、截图、credentials 或 env。Owner 仍负责真实账号、真实导入样例是否可用于后续验收、生产配置、成本、合规和最终 M4 closeout 签收。

AI agent：负责在指定 worktree/branch 内实现本 spec，优先扩展 M4-41 现有 Storage-backed path，不重做并行导入实现；必须维护 ADR-B02 no-API 口径、权限/RLS/tenant isolation、no raw data、no status fabrication、PR Hygiene 和 evidence。若发现需要外部订单 API、真实客户数据、生产配置、BullMQ/Redis runtime、AI runtime 或客户资产实现才能继续，停止并进入失败分支，不扩大本 spec。

## 时间盒

1 个工作日。若超过时间盒仍无法形成浏览器可见 operator workflow，不继续堆 contract；必须在 evidence 中标记 blocker，说明阻断发生在 Admin 上传、API auth/runtime、Storage submit、worker dispatch/persistence、DB/RLS、stale/missing warning、Playwright E2E 或 CI true DB 哪一层。

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M4-42-order-import-operator-workflow.md`
  - `docs/evidence/M4/M4-42-order-import-operator-workflow.md`
  - `docs/evidence/M4/README.md`
  - `.github/workflows/ci.yml`
  - `apps/admin/src/App.tsx`
  - `apps/admin/src/M4OrderImportOperatorWorkflow.tsx`
  - `apps/admin/src/M4OrderPathStatusShell.tsx`
  - `apps/admin/src/M4OrderImportVisibleSmokeState.tsx`
  - `apps/admin/src/orderImportApiClient.ts`
  - `apps/admin/src/orderImportVisibleSmokeSubmit.ts`
  - `apps/admin/src/m4-order-path-status-shell.css`
  - `apps/admin/tests/design.spec.ts`
  - `apps/api/src/order-import.submit.ts`
  - `apps/api/src/order-import.service.ts`
  - `apps/api/src/order-import.controller.ts`
  - `apps/api/src/order-import.runtime.ts`
  - `apps/api/scripts/order-import-http-smoke-harness.mjs`
  - `packages/db/scripts/order-import-admin-visible-smoke-harness.mjs`
  - `packages/db/scripts/order-import-worker-submit-smoke-support.mjs`
  - `packages/db/scripts/run-m4-order-import-storage-backed-true-db-smoke.mjs`
  - `packages/db/scripts/run-m4-order-import-operator-workflow-smoke.mjs`
  - `packages/db/package.json`
  - `scripts/tests/m4-order-import-operator-workflow.test.mjs`
  - `scripts/tests/m4-order-import-storage-backed-true-db-smoke.test.mjs`
  - `scripts/tests/m4-order-import-admin-api-bridge-contract.test.mjs`
  - `scripts/tests/m4-order-import-runtime-warning-contract.test.mjs`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：不得修改 DB schema/migration/generated client；不得新增外部 order API connector；不得新增客户资产 runtime、AI runtime 或 release gate。若 `package-lock.json` 因 package script/package dependency 变化被触碰，必须在 PR Hygiene 中作为 lock 变更报告，但本 spec 默认不需要 lockfile。

## 变更预算与路径分类

- source 预算：changed source files <= 12，net source LOC <= 650，new source files <= 3。
- path classification:
  - source: `apps/admin/src/App.tsx`, `apps/admin/src/M4OrderImportOperatorWorkflow.tsx`, `apps/admin/src/M4OrderPathStatusShell.tsx`, `apps/admin/src/M4OrderImportVisibleSmokeState.tsx`, `apps/admin/src/orderImportApiClient.ts`, `apps/admin/src/orderImportVisibleSmokeSubmit.ts`, `apps/admin/src/m4-order-path-status-shell.css`, `apps/api/src/order-import.submit.ts`, `apps/api/src/order-import.service.ts`, `apps/api/src/order-import.controller.ts`, `apps/api/src/order-import.runtime.ts`, `apps/api/scripts/order-import-http-smoke-harness.mjs`, `packages/db/scripts/order-import-admin-visible-smoke-harness.mjs`, `packages/db/scripts/order-import-worker-submit-smoke-support.mjs`, `packages/db/scripts/run-m4-order-import-storage-backed-true-db-smoke.mjs`, `packages/db/scripts/run-m4-order-import-operator-workflow-smoke.mjs`
  - test: `apps/admin/tests/design.spec.ts`, `scripts/tests/m4-order-import-operator-workflow.test.mjs`, `scripts/tests/m4-order-import-storage-backed-true-db-smoke.test.mjs`, `scripts/tests/m4-order-import-admin-api-bridge-contract.test.mjs`, `scripts/tests/m4-order-import-runtime-warning-contract.test.mjs`
  - config: `.github/workflows/ci.yml`, `packages/db/package.json`
  - docs: `docs/specs/M4-42-order-import-operator-workflow.md`, `docs/evidence/M4/M4-42-order-import-operator-workflow.md`, `docs/evidence/M4/README.md`
  - generated: none
  - lock: optional only if package metadata changes force it
- 新增 source 文件前的 `rg` 搜索结论和归属理由：已检索 `M4OrderPathStatusShell`, `M4OrderImportVisibleSmokeState`, `orderImportApiClient`, `orderImportVisibleSmokeSubmit`, `submitImportStorageObjectJob`, `run-m4-order-import-storage-backed-true-db-smoke`, `order-import-admin-visible-smoke-harness`, `createOrderImportCsvTextInputFromStorageObject`, `storage-jobs`, `Runtime smoke`, `Import snapshot batch`, `input type="file"`, `upload`。现有实现已经有 Storage-backed smoke path，但 `/design` 默认仍显示 synthetic/local states，正式 operator-facing metadata submit/readback 仍不存在；`M4OrderPathStatusShell.tsx` 已到 React 组件 250 行边界，因此新增 `M4OrderImportOperatorWorkflow.tsx` 承载 operator workflow，主 shell 只做接入。新增 `run-m4-order-import-operator-workflow-smoke.mjs` 只作为 M4-42 focused 验收锚点，不新增平行导入实现；`run-m4-order-import-storage-backed-true-db-smoke.mjs` 仅为复用 harness Storage helper 做无行为收敛，避免 M4-42 runner 复制 M4-41 的 Storage upload/download/cleanup 代码。
- 外部 API/SDK/provider/connector/adapter 依据：不新增外部订单 API/provider/connector/adapter；沿用 ADR-B02 no-API branch 和 M4-41 已验证的 Supabase Storage + DB/RLS direct path。
- 是否需要例外：默认无。若实现证明必须触碰 `package-lock.json` 或超过 source 预算，必须拆分或在 PR Hygiene 中提出 owner approval 所需例外；AI agent 不得自批。

## 文档触发检查

- 结果：updated
- 判断依据：`docs/doc-gates.md`

## 前置条件

- 已读取 `AGENTS.md`、`docs/specs/README.md`、`docs/doc-gates.md`、`docs/evidence/M4/README.md`、`docs/adr/ADR-B02-order-api.md`、M4-39/M4-40/M4-41 spec/evidence、v1.1 PRD REQ-T04、技术架构 §8/§11/§12.3、后台设计 §4.4、验收矩阵 E-02/E-03/E-04/I-01/J-02/B-01。
- 当前 root/main 干净，open PR 为空，`git branch --no-merged main` 为空。
- M4-41 已在 GitHub Actions run `28031828404` 证明 Storage upload/download -> API metadata POST -> worker Storage intake -> DB/RLS -> Admin readback synthetic smoke，且 `db_residue=0`、`storage_object_residue=0`。
- M4 evidence README 明确 M4-41 仍未关闭正式 Admin upload UI、formal auth runtime、XLSX parser、BullMQ/Redis runtime、真实导入样例、AI order-read eval/redline gate、customer asset runtime 和 M4 closeout。

## Worktree / branch 前置条件

- Worktree：`/Users/atilla/Documents/uzmax-m4-42-order-import-operator-workflow`
- Branch：`codex/m4-42-order-import-operator-workflow`
- 禁止写入 root/main checkout：`/Users/atilla/Documents/UZMAX智能运营`
- 开工前记录：
  - `pwd=/Users/atilla/Documents/uzmax-m4-42-order-import-operator-workflow`
  - `git status --short --branch=## codex/m4-42-order-import-operator-workflow`
  - `git branch --show-current=codex/m4-42-order-import-operator-workflow`

## 并发派发证据

本 spec 触碰 Admin order UI、API order import submit/readback、packages/db true DB smoke、CI 和 M4 evidence README，必须全局串行；不得与 DB/schema/runtime/CI/release gate、客户资产 runtime、AI eval gate 或队列 runtime 切片并发写入。可派发只读 reviewer，但写入只能由本 worktree 完成。

## 事故与 closeout 记录

- 开工前 root/main clean；本 worktree 新建自 `main` commit `84084a2`。
- 本 spec 不触发新 incident。若发现写入越界、错分支、secret/customer-data 边界擦边、扩大 mock 或 gate 绕过，立即停止，记录 incident，并在 evidence 中列出影响、清理和控制。
- M4 closeout 时必须汇总本里程碑既有 incident，包括 M4-16 root patch target、M4-26 root write boundary 和 SPK-02 root/main pollution；本 spec 不尝试用新的治理层修复历史过程问题，只要求本 slice 严守 worktree 边界。

## 实施步骤

1. 将 `M4OrderPathStatusShell` 从纯 synthetic/local order shell 推进到 operator workflow UI：保留 `订单数据主路径：导入快照`，增加受控 CSV/TSV submit surface、导入结果、错误行、fresh/stale/missing 查询和清晰 handoff wording。
2. 复用 M4-41 Storage metadata submit path；浏览器/operator submit 不得发送 inline `csvText`、raw CSV 内容、真实订单号、电话、地址、支付或 customer plaintext。
3. API submit/readback 继续走 `OrderImportController` / `OrderImportService` / existing repository runtime；formal auth runtime 若仍使用 smoke access context，必须在 evidence 中明确为 M4-42 dev smoke，不伪装生产登录。
4. 新增 M4-42 true DB runner：从 Admin-visible operator flow 发起 Storage metadata submit，API/worker/DB/RLS 持久化后，浏览器读回 import job、row error、fresh snapshot、stale/missing warning；tenant B 隔离；DB residue 和 Storage object residue 为 `0`。
5. 更新 Playwright/design test，覆盖 operator workflow 在 desktop 和 320px mobile 下无水平溢出，stale/missing 不展示 status ref，fresh 只展示 controlled status ref。
6. 更新 focused structure test，断言 M4-42 没有新增外部 order API connector，没有 inline raw CSV submit，没有真实客户/订单数据 fixture，没有 `.skip`/`.only`，没有关闭客户资产/AI/queue/release scope。
7. 更新 M4 evidence README 和新增 M4-42 evidence；CI 结果在实际通过前保持 pending，不提前写 green。

## 通过条件

- `node --test scripts/tests/m4-order-import-operator-workflow.test.mjs` 通过。
- 相关 focused tests 通过：`node --test scripts/tests/m4-order-import-storage-backed-true-db-smoke.test.mjs scripts/tests/m4-order-import-admin-api-bridge-contract.test.mjs scripts/tests/m4-order-import-runtime-warning-contract.test.mjs scripts/tests/m4-order-import-operator-workflow.test.mjs`。
- `npm run playwright` 通过，且覆盖 M4 order operator workflow visible states。
- `env -u UZMAX_RLS_DATABASE_URL node packages/db/scripts/run-m4-order-import-operator-workflow-smoke.mjs` fail closed with `UZMAX_RLS_DATABASE_URL is required`。
- CI true DB smoke 实际通过：Storage metadata submit、API write permission path、worker Storage intake、dispatch/persistence、DB/RLS write/readback、fresh/stale/missing visible states、tenant B isolation、DB residue `0`、Storage object residue `0`。
- `npm run format:check`、`npm run guard:prettier-ignore`、`npm run typecheck`、`npm run lint`、`npm run depcruise`、`npm run jscpd`、`npm run knip`、`npm run guard:forbidden-terms`、`npm run guard:eval-triggers`、`npm run guard:doc-triggers`、`npm run guard:workspace`、`UZMAX_ASSIGNED_WORKTREE=/Users/atilla/Documents/uzmax-m4-42-order-import-operator-workflow npm run guard:worker-boundary`、`npm run guard:pr-shape -- --base origin/main --spec docs/specs/M4-42-order-import-operator-workflow.md --include-worktree`、`npm run test`、`npm run build`、`npm run size` 通过。
- PR/evidence 报告 source 净增、changed source files、新增 source files、test/config/docs/lock 变更、gross churn、外部 API 依据、未关闭项和 M4 后续 M4-43/M4-44/M4-45 queue。

## 失败分支

- 若 operator upload/readback 只能靠 inline `csvText` 或 raw file content in browser POST 完成：停止，不合并；回到 Storage metadata path 或拆 API/upload design spec。
- 若 formal auth runtime 阻断本 slice：记录 auth blocker；不得把 smoke access context 写成生产登录已完成。可保留 M4-42 为 dev true DB operator evidence，但不得关闭 formal auth runtime。
- 若真实样例缺失：使用 synthetic controlled refs 完成自动化；把 owner real sample evidence 留到 M4 closeout 或后续 owner-supplied evidence，不以真实样例缺失阻断代码路径。
- 若发现需要 XLSX parser：除非 owner 当前提供 XLSX-only 样例并确认 M4 必须支持，否则记录为后续 enhancement，不阻断 CSV/TSV M4 主路径。
- 若 BullMQ/Redis runtime 是唯一剩余 J-02 blocker：停止在本 spec 内扩展，拆到 M4-45 queue/security/closeout。
- 若 `npm audit` high 漏洞影响 upload endpoint exposure：本 spec 可完成受控 dev smoke，但 M4 closeout 必须由 M4-45 处理或正式记录阻断；不得忽略。

## 不做什么

- 不新增外部订单 API connector、假 connector、LLM/provider、Telegram、真实客户系统或生产 connector call。
- 不提交 raw CSV/XLSX export、raw payload、截图、真实订单号、电话、地址、支付、客户明文、credentials、env 或 secret。
- 不新增客户资产 DB runtime、AI order-read runtime、eval gate、BullMQ/Redis runtime、XLSX parser、production DB 配置、release gate 或 M4 closeout signoff。
- 不删除测试、不降低断言、不加 `.skip`/`.only`/`xit`/`xfail`、不扩大 mock 或快照来通过 CI。

## 验收映射

| 验收项 | 目标状态 | 说明 |
|---|---|---|
| B-01 | `order_import_operator_true_db_supported_not_closed` | 证明订单导入路径在 dev main DB/RLS 下 tenant A/B 隔离；完整 durable SQL/RLS matrix 和客户资产 RLS closeout 仍在 M4-43/M4-45。 |
| E-01 | `not_current_blocker__no_api_for_m4` | 遵守 ADR-B02 no-API 分支，不新增外部订单 API connector。 |
| E-02 | `order_import_operator_workflow_closed_for_m4_no_api_branch` | CSV/TSV Storage-backed import main path 具备 operator-visible submit、成功行可查、错误行可见和 CI true DB readback；真实 owner sample evidence 可后补为 closeout evidence，不提交敏感数据。 |
| E-03 | `order_import_stale_missing_warning_closed_for_m4_no_api_branch` | Fresh/stale/missing 状态在后台可见；stale/missing 必须 handoff 且不展示 status ref。 |
| E-04 | `still_requires_m4_44_ai_order_read_runtime` | M4-42 只证明 Admin/API warning path；AI runtime/eval/redline gate 留给 M4-44，不提前关闭。 |
| I-01 | `order_import_operator_workflow_supported_not_full_desktop_core` | 订单导入主路径可在 Admin shell 形成浏览器可见 workflow；客户资产/知识/评测完整桌面主流程仍不由本 spec 关闭。 |
| J-02 | `worker_dispatch_smoke_supported_queue_runtime_open` | 复用 worker dispatch/persistence path 证明导入链路；BullMQ/Redis retry/idempotency/backlog/fault-injection 留给 M4-45。 |
