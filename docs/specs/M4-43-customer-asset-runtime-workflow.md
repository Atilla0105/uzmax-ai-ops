# M4-43 Customer Asset Runtime Workflow

## 目标

把 M4-14/M4-15/M4-16/M4-17/M4-18/M4-19/M4-20 的客户资产 shell、admin client、persistence gateway、Prisma delegate gateway 和 audit sink 串成一个最小真实运行时闭环：Admin/browser 通过客户资产 API client 读取 dev main DB/RLS 中的 synthetic tenant customer asset rows，展示客户列表、详情、身份 refs、字段、标签、黑名单/不可达恢复、真实 `audit_log` 写入，并证明 tenant B 隔离和 residue `0`。

本 spec 的重点是 M4-43 纵向闭环，不再新增横向 contract。它不关闭完整 M4，也不实现复杂 CRM 自动化、营销、批量导入、真实客户明文、生产发布或 M5/M6 发布演练。

M4 剩余节奏保持：

1. M4-43：客户资产真实 API/DB/RLS runtime workflow，本 spec。
2. M4-44：AI order-read runtime 与 no-fabrication eval/redline gate。
3. M4-45：队列/安全/closeout，包含 BullMQ/Redis 或等价队列证据、`npm audit` high 风险处理或阻断记录、M4 closeout evidence。

## 项目 Owner 确认点与 AI Agent 责任

Owner：确认 M4-43 只使用 synthetic refs，不提交真实客户明文、真实订单号、电话、地址、支付、Telegram username、截图、credentials 或 env。Owner 仍负责真实客户数据是否可用于后续验收、生产配置、合规风险和最终 M4 closeout 签收。

AI agent：负责在指定 worktree/branch 内实现本 spec；必须优先扩展既有 customer asset API/client/Prisma/audit 代码，不新增平行客户资产系统；必须维护 no raw data、tenant isolation、RLS、audit、PR Hygiene、worker boundary 和 M4 evidence。若发现需要 schema/migration、真实客户数据、生产 auth、复杂 CRM、批量导入或 queue/security 才能继续，停止并进入失败分支，不扩大本 spec。

## 时间盒

1 个工作日。若超过时间盒仍无法形成 true DB/RLS-backed customer asset workflow，不继续堆 contract；必须在 evidence 中标记 blocker，说明阻断发生在 API runtime provider、RLS transaction、Prisma delegate、audit sink、Admin client/browser readback、restore writeback、tenant isolation、CI true DB 或 cleanup residue 哪一层。

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M4-43-customer-asset-runtime-workflow.md`
  - `docs/evidence/M4/M4-43-customer-asset-runtime-workflow.md`
  - `docs/evidence/M4/README.md`
  - `.github/workflows/ci.yml`
  - `apps/api/scripts/runtime-compiler.mjs`
  - `apps/api/scripts/customer-asset-http-smoke-harness.mjs`
  - `apps/api/src/app.module.ts`
  - `apps/api/src/audit-log.prisma-sink.ts`
  - `apps/api/src/customer-asset.controller.ts`
  - `apps/api/src/customer-asset.prisma-gateway.ts`
  - `apps/api/src/customer-asset.runtime.ts`
  - `apps/api/src/customer-asset.service.ts`
  - `apps/api/src/customer-asset.types.ts`
  - `apps/admin/src/M4CustomerAssetRuntimeState.tsx`
  - `apps/admin/src/M4CustomerAssetShell.tsx`
  - `apps/admin/src/customerAssetApiClient.ts`
  - `apps/admin/tests/design.spec.ts`
  - `scripts/tests/m4-admin-customer-asset-api-client-contract.test.mjs`
  - `packages/db/scripts/customer-asset-true-db-http-smoke-fixture.mjs`
  - `packages/db/scripts/customer-asset-admin-visible-smoke-harness.mjs`
  - `packages/db/scripts/run-m4-customer-asset-runtime-workflow-smoke.mjs`
  - `scripts/tests/m4-customer-asset-runtime-workflow.test.mjs`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：不得修改 DB schema/migration/generated client；不得新增外部客户系统 connector；不得新增真实客户样例；不得修改 order import runtime、AI runtime、queue/security 或 release gate。若实现证明必须触碰 package metadata/lockfile，停止并拆到后续 spec 或在 PR Hygiene 中提出 owner approval 所需例外。

## 变更预算与路径分类

- source 预算：changed source files <= 12，net source LOC <= 750，new source files <= 6。
- path classification:
  - source: `apps/api/scripts/runtime-compiler.mjs`, `apps/api/scripts/customer-asset-http-smoke-harness.mjs`, `apps/api/src/app.module.ts`, `apps/api/src/audit-log.prisma-sink.ts`, `apps/api/src/customer-asset.controller.ts`, `apps/api/src/customer-asset.prisma-gateway.ts`, `apps/api/src/customer-asset.runtime.ts`, `apps/api/src/customer-asset.service.ts`, `apps/api/src/customer-asset.types.ts`, `apps/admin/src/M4CustomerAssetRuntimeState.tsx`, `apps/admin/src/M4CustomerAssetShell.tsx`, `apps/admin/src/customerAssetApiClient.ts`, `packages/db/scripts/customer-asset-true-db-http-smoke-fixture.mjs`, `packages/db/scripts/customer-asset-admin-visible-smoke-harness.mjs`, `packages/db/scripts/run-m4-customer-asset-runtime-workflow-smoke.mjs`
  - test: `apps/admin/tests/design.spec.ts`, `scripts/tests/m4-admin-customer-asset-api-client-contract.test.mjs`, `scripts/tests/m4-customer-asset-runtime-workflow.test.mjs`
  - config: `.github/workflows/ci.yml`
  - docs: `docs/specs/M4-43-customer-asset-runtime-workflow.md`, `docs/evidence/M4/M4-43-customer-asset-runtime-workflow.md`, `docs/evidence/M4/README.md`
  - generated: none
  - lock: none expected
- 新增 source 文件前的 `rg` 搜索结论和归属理由：已检索 `customer asset`, `CustomerAsset`, `customer-assets`, `PrismaCustomerAssetPersistenceGateway`, `PrismaAuditSink`, `M4CustomerAssetShell`, `customerAssetApiClient`, `order-import true DB smoke`, `RLS`, `auditLog.create` 于 `apps`, `packages`, `scripts/tests`, `docs/specs`, `docs/evidence/M4`。现有归属已经存在：API shell 在 `apps/api/src/customer-asset.*`，admin client 在 `apps/admin/src/customerAssetApiClient.ts`，可见 shell 在 `apps/admin/src/M4CustomerAssetShell.tsx`，Prisma gateway 在 `apps/api/src/customer-asset.prisma-gateway.ts`，audit sink 在 `apps/api/src/audit-log.prisma-sink.ts`。新增文件只允许承载 runtime provider / smoke harness / true DB runner / runtime-visible admin state，不得新增平行 customer asset implementation。
- 外部 API/SDK/provider/connector/adapter 依据：不新增外部客户系统、订单 API、LLM/provider 或 connector。Prisma and Supabase dev DB are existing repo/runtime foundations already used by M4-34 through M4-42 true DB smoke slices.
- 是否需要例外：默认无。若 source LOC 超预算或需要 lockfile/dependency/security exception，必须在 PR Hygiene 中显式说明并等待 owner approval；AI agent 不得自批。

## 文档触发检查

- 结果：updated。
- 判断依据：`docs/doc-gates.md`；本 slice 新增 M4 runtime evidence、CI true DB smoke 和 spec/evidence，不新增 production runbook、OpenAPI/generated DTO、release workflow 或 external connector docs。

## 前置条件

- 已读取 `AGENTS.md`、`docs/specs/README.md`、`docs/doc-gates.md`、`docs/evidence/M4/README.md`、M4-14/M4-15/M4-16/M4-17/M4-18/M4-19/M4-20 spec/evidence、v1.1 PRD REQ-T03/REQ-T13、技术架构 §3/§5/§12/audit/RLS/customer asset sections、后台设计 §4.3、验收矩阵 B-01/B-05/D-04/D-05/D-07/I-01、现有 order import true DB smoke patterns。
- 当前 root/main 为 `42362a8 M4-42 order import operator workflow (#103)`，open PR 为 `[]`，root/main clean，未合并分支为空。
- Baseline in assigned worktree：`npm ci` passed；`npm test` passed 302 tests；worker boundary preflight passed with `worker-write-boundary: ok`。
- M4 evidence README 明确 M4-42 仍未关闭 customer asset admin UI/E2E beyond synthetic shell、customer asset production DB runtime/default provider/RLS wrapper、customer asset real audit persistence integration、history/order/quote/ticket aggregation、AI order-read runtime、queue/security/closeout。

## Worktree / branch 前置条件

- Worktree：`/Users/atilla/Documents/uzmax-m4-43-customer-asset-runtime-workflow`
- Branch：`codex/m4-43-customer-asset-runtime-workflow`
- 禁止写入 root/main checkout：`/Users/atilla/Documents/UZMAX智能运营`
- 开工前记录：
  - `pwd=/Users/atilla/Documents/uzmax-m4-43-customer-asset-runtime-workflow`
  - `git status --short --branch=## codex/m4-43-customer-asset-runtime-workflow`
  - `git branch --show-current=codex/m4-43-customer-asset-runtime-workflow`

## 并发派发证据

本 spec 触碰 customer asset API/admin/runtime, true DB smoke, CI 和 M4 evidence README，必须全局串行；不得与 M4-44 AI eval/runtime、M4-45 queue/security/closeout 或任何 DB/schema/security/lockfile/release gate 切片并发写入。可派发只读 reviewer，但写入只能由本 worktree 完成。

## 事故与 closeout 记录

- 开工前 root/main clean；本 worktree 新建自 `main` commit `42362a8`。
- 本 spec 不触发新 incident。若发现写入越界、错分支、secret/customer-data 边界擦边、扩大 mock 或 gate 绕过，立即停止，记录 incident，并在 evidence 中列出影响、清理和控制。
- M4 closeout 时必须汇总既有 incident，包括 M4-16 root patch target、M4-26 root write boundary 和 SPK-02 root/main pollution；本 spec 不新增治理层，只要求本 slice 严守 worktree 边界。

## 实施步骤

1. 新增 customer asset runtime provider，使 M4-43 smoke 能显式启用 Prisma/RLS-backed repository 和 Prisma audit sink；默认 AppModule 仍保持 in-memory provider，不读取 env、不默认连接 DB。
2. 新增 customer asset HTTP smoke harness，复用真实 `CustomerAssetController` / `CustomerAssetService` / `ApiAccessContextGuard` / `customerAssetApiClient`，并通过 synthetic access context 注入 selected tenant 和 permissions。
3. 新增 true DB fixture：seed synthetic tenant A/B customer、identity、field definition/value、tag definition/assignment、relatedRefs 中的 controlled order snapshot/quote/ticket refs，并清理 `customer`、child rows 和 `audit_log` residue。
4. 通过 dev DB/RLS 验证 tenant A 可 list/detail/filter/read definitions，tenant B 读不到 tenant A rows，缺权限 403，restore 黑名单/不可达后写入真实 `audit_log`，且 cleanup residue 为 `0`。
5. 将 Admin visible shell 从 synthetic-only 推进到 smoke-only runtime readback：在测试注入的 smoke global 下，使用 `customerAssetApiClient` 读取真实 API response 并显示 runtime list/detail/fields/tags/restore/audit state；正常 `/design` 仍可显示 synthetic local shell，不默认真实网络。
6. 新增 focused structure test，断言 M4-43 复用既有 customer asset implementation，没有新增 schema/migration、真实客户样例、外部 connector、raw data、order import/AI/queue/release scope，且 evidence 不提前关闭 M4-44/M4-45。
7. 更新 CI true DB smoke、M4 evidence file 和 M4 README；CI 结果在实际通过前保持 pending，不提前写 green。

## 通过条件

- `node --test scripts/tests/m4-customer-asset-runtime-workflow.test.mjs` 通过。
- 相关 focused tests 通过：`node --test scripts/tests/m4-customer-asset-api-shell.test.mjs scripts/tests/m4-admin-customer-asset-api-client-contract.test.mjs scripts/tests/m4-customer-asset-prisma-gateway.test.mjs scripts/tests/m4-api-audit-prisma-sink-contract.test.mjs scripts/tests/m4-customer-asset-runtime-workflow.test.mjs`。
- `env -u UZMAX_RLS_DATABASE_URL node packages/db/scripts/run-m4-customer-asset-runtime-workflow-smoke.mjs` fail closed with `UZMAX_RLS_DATABASE_URL is required`。
- CI true DB smoke 实际通过：API/client/browser readback、customer list/detail、identity refs、field/tag definitions and assignments、controlled related refs、restore writeback、real audit sink, tenant B isolation, permission failure, DB residue `0`。
- `npm run format:check`、`npm run guard:prettier-ignore`、`npm run typecheck`、`npm run lint`、`npm run depcruise`、`npm run jscpd`、`npm run knip`、`npm run guard:forbidden-terms`、`npm run guard:eval-triggers`、`npm run guard:doc-triggers`、`npm run guard:workspace`、`UZMAX_ASSIGNED_WORKTREE=/Users/atilla/Documents/uzmax-m4-43-customer-asset-runtime-workflow UZMAX_PRIMARY_ROOT=/Users/atilla/Documents/UZMAX智能运营 npm run guard:worker-boundary`、`npm run guard:pr-shape -- --base origin/main --spec docs/specs/M4-43-customer-asset-runtime-workflow.md --include-worktree`、`npm run test`、`npm run build`、`npm run size`、`npm run playwright` 通过。
- PR/evidence 报告 source 净增、changed source files、新增 source files、test/config/docs/lock 变更、gross churn、外部 API 依据、未关闭项和 M4 后续 M4-44/M4-45。

## 失败分支

- 若 true DB/RLS path 需要 schema/migration/generated client：停止，不合并；拆 DB migration/readiness spec，不把 schema 变更混进 M4-43。
- 若 formal auth runtime 阻断本 slice：记录 auth blocker；不得把 smoke access context 写成生产登录已完成。可保留 M4-43 为 dev true DB customer asset evidence，但不得关闭 formal auth runtime。
- 若 audit sink 无法在当前 RLS/runtime 下写入真实 `audit_log`：记录 D-05/B-05 blocker，不把 audit draft 当真实 persistence。
- 若 customer asset shell 只能靠 synthetic/local state 展示：不得关闭 M4-43；必须通过 smoke-only runtime state 证明 admin client/API/DB/RLS readback。
- 若需要真实客户明文、CRM 自动化、营销、批量导入、identity merge/split、conversation tag config save 或 analysis reuse：停止并拆后续 spec。
- 若 `npm audit` high 漏洞影响 API exposure：本 spec 可完成受控 dev smoke，但 M4 closeout 必须由 M4-45 处理或正式记录阻断；不得忽略。

## 不做什么

- 不新增外部客户系统 connector、订单 API connector、LLM/provider、Telegram、真实客户系统或生产 connector call。
- 不提交 raw CSV/XLSX/export/jsonl、截图、真实客户明文、真实订单号、电话、地址、支付、Telegram username、credentials、env 或 secret。
- 不新增 DB schema/migration/generated client、complex CRM automation、marketing、bulk import、identity merge/split runtime、conversation tag config save、analysis reuse、AI order-read runtime、BullMQ/Redis runtime、安全依赖修复、production config、release gate 或 M4 closeout signoff。
- 不删除测试、不降低断言、不加 `.skip`/`.only`/`xit`/`xfail`、不扩大 mock 或快照来通过 CI。

## 验收映射

| 验收项 | 目标状态 | 说明 |
|---|---|---|
| B-01 | `customer_asset_true_db_rls_supported_not_full_matrix` | 证明客户资产路径在 dev main DB/RLS 下 tenant A/B 隔离；完整 durable SQL/RLS matrix 留给 M4-45/closeout。 |
| B-05 | `customer_asset_restore_audit_persistence_supported_not_full_audit_ui` | Restore action 写入真实 `audit_log` synthetic row；审计查询 UI、生产 audit runtime 和全量审计验收仍不由本 spec 关闭。 |
| D-04 | `customer_asset_runtime_workflow_supported_not_full_aggregation` | 客户列表、详情、identity refs、fields、tags、controlled order/quote/ticket refs 可通过 API/Admin/DB/RLS 回查；真实历史聚合/复杂 identity merge-split 仍 future scope。 |
| D-05 | `customer_asset_restore_runtime_supported_not_owner_signoff` | 黑名单/不可达恢复通过真实 API/DB/RLS 更新并写 audit；owner 手工验收和生产流程仍 future scope。 |
| D-07 | `customer_asset_field_tag_runtime_supported_not_analysis_reuse` | 自定义字段和客户标签可通过真实 DB/RLS 回查；conversation tag config save 和 analysis reuse 仍 future scope。 |
| I-01 | `customer_asset_runtime_workflow_supported_not_full_desktop_core` | 客户资产主路径形成 browser/API/DB/RLS visible workflow；完整桌面核心对话/知识/评测主流程仍不由本 spec 关闭。 |
| E-04 | `still_requires_m4_44_ai_order_read_runtime` | M4-43 不改 AI order-read；E-04 留给 M4-44。 |
| J-02 | `still_requires_m4_45_queue_security_closeout` | M4-43 不改 queue/security；BullMQ/Redis 与 `npm audit` high 留给 M4-45。 |
