# M4-31 Order Import Admin API Bridge Contract

## 目标

为 ADR-B02 no-API import snapshot path 补齐 M4-07 API shell 与 M4-13 admin API client 之间的最小 bridge contract：新增 focused test，用 controller-backed fetcher 证明 admin client 发出的 jobs、row errors 与 snapshot search 请求可由真实 `OrderImportController`/`OrderImportService`/`InMemoryOrderImportRepository` 合同处理，且 stale/missing handoff 语义和 runtime warning 能被 admin client 保持 fail-closed。本 spec 只做 admin-client-to-API-controller contract verification，不改 source，不启动真实 HTTP server，不连接真实 API/DB/Storage，不实现文件上传/错误下载/回滚/BullMQ/Redis/外部订单 API/AI runtime。

本 spec 不关闭 production DB runtime、真实 Storage downloader/upload runtime、XLSX parser、worker queue runtime、visible admin E2E、真实导入样例、AI runtime/eval 或 release acceptance。

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner：确认本切片只把现有 admin client 与 API controller/service 的合同接起来验证，不代表真实 API runtime、真实鉴权、生产 DB runtime、文件上传、错误下载、回滚、BullMQ/Redis queue、真实客户/订单数据、LLM key、成本、合规或 1.0 发布验收关闭。

AI agent：只在 `/Users/atilla/Documents/uzmax-m4-31-order-import-admin-api-bridge` / `codex/m4-31-order-import-admin-api-bridge` 执行；复核 no source changes, admin client path/query compatibility, API controller/service shape, stale/missing fail-closed, no env/secrets, no DB connection/write, no external API/no `order_connector`, no BullMQ/Redis dependency/runtime, PR hygiene, worker boundary evidence 和 M4 evidence index 同步。

## 时间盒

0.5 个工作日。若 admin API bridge contract 无法在预算内通过 focused Node tests、type/lint/guards/check validation，则关闭或拆小；不得夹带真实 HTTP/auth runtime、DB env wiring、schema/migration、queue runtime、admin UI/E2E、真实导入样例或外部 API connector 继续推进。

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M4-31-order-import-admin-api-bridge-contract.md`
  - `docs/evidence/M4/M4-31-order-import-admin-api-bridge-contract.md`
  - `docs/evidence/M4/README.md`
  - `scripts/tests/m4-order-import-admin-api-bridge-contract.test.mjs`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：不得触碰 `apps/api/**`、`apps/admin/**`、`apps/worker/**`、`packages/db/**` schema/migration/generated client、`packages/capabilities/**`、package/lock/config、真实导入样例、root/main checkout 或其他 worktree。
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source 预算：changed source files <= 0、net source LOC <= 0、new source files <= 0。
- test/generated/lock/config/docs 预计变更：新增 1 个 focused Node bridge test；新增 spec/evidence；同步 M4 evidence README；不改 API/admin/worker source、DB schema/migration/generated client、lockfile、config 或 package。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：无新增 source 文件。`rg -n "admin.*order import|order import.*admin|API client|HTTP|fetcher|integration|E2E|errors|success.*query|row errors|snapshots/search" docs/specs/M4-*.md docs/evidence/M4/*.md scripts/tests apps/admin/src apps/api/src` 显示 M4-07 覆盖 API controller/service contract，M4-13 覆盖 admin client path/shape contract，但没有 test 将 admin client fetcher 请求接到真实 API controller/service。因此新增 test-only bridge，不新增平行 runtime source。
- 外部 API/SDK/provider/connector/adapter 依据：none。本 PR 不新增、不调用、不声明任何外部 API/SDK/provider/connector/adapter 能力；只验证本 repo 内部 M4-07/M4-13 contract compatibility；ADR-B02 no-API branch remains active and `order_connector` remains absent。
- 是否需要例外：无。

## 文档触发检查

- 结果：`none`。
- 判断依据：`docs/doc-gates.md`；本 slice uses spec/evidence/M4 README for a contract-only bridge test, and does not add OpenAPI/generated DTO/runbook/production runtime docs trigger。

## 前置条件

- 已读取 `AGENTS.md`、`docs/specs/README.md`、`docs/doc-gates.md`、`docs/evidence/M4/README.md`、`docs/adr/ADR-B02-order-api.md`、M4-07/M4-13/M4-21 spec/evidence、v1.1 PRD REQ-T04、后台设计 §4.4、技术架构 §8/§10、验收矩阵 E-02/E-03/E-04/I-01、`apps/admin/src/orderImportApiClient.ts`、`apps/api/src/order-import.*`、existing order import tests 和 package dependencies。
- ADR-B02 当前分支为 `no_api_for_m4__import_snapshot_main_path`；本 spec 不实现订单 API connector，不新增 `order_connector`，不调用或模拟外部 API。
- `npm ci` passed in assigned worktree; npm audit reported existing 3 high severity vulnerabilities, not introduced by this spec。
- Root/main full local worker boundary preflight is blocked by existing untracked duplicate docs in `/Users/atilla/Documents/UZMAX智能运营`:
  - `docs/adr/ADR-B02-order-api 2.md`
  - `docs/adr/README 2.md`
  - `docs/evidence/M4/README 2.md`
  - `docs/evidence/M4/spikes 2/SPK-02-order-saas-api/manifest.md`
  - `docs/specs/SPK-02-order-api 2.md`
- Because those files pre-existed this worker and may be user-retained local files, this spec does not delete them. Implementation uses absolute assigned worktree paths; CI-mode worker boundary and manual root tracked/index clean evidence are recorded.

## Worktree / branch 前置条件

- Worktree / branch：预期物理 worktree `/Users/atilla/Documents/uzmax-m4-31-order-import-admin-api-bridge`；branch `codex/m4-31-order-import-admin-api-bridge`；禁止写入 `/Users/atilla/Documents/UZMAX智能运营` root/main checkout。
- 开工记录：
  - `pwd`: `/Users/atilla/Documents/uzmax-m4-31-order-import-admin-api-bridge`
  - `git status --short --branch`: `## codex/m4-31-order-import-admin-api-bridge`
  - `git branch --show-current`: `codex/m4-31-order-import-admin-api-bridge`
  - `git rev-parse HEAD`: `657275ff708f4f7081115f181337f14a8e36f78b`
- Worker boundary evidence:
  - Full local guard result: `root_untracked_duplicate_docs_block_full_local_preflight` for the five duplicate docs listed above.
  - `CI=true UZMAX_ASSIGNED_WORKTREE=/Users/atilla/Documents/uzmax-m4-31-order-import-admin-api-bridge UZMAX_PRIMARY_ROOT=/Users/atilla/Documents/UZMAX智能运营 npm run guard:worker-boundary` passed assigned-worktree check.
  - Root tracked/index clean evidence before edits: `git status --short --branch --untracked-files=no` -> `## main...origin/main`; `git diff --quiet` passed; `git diff --cached --quiet` passed; `gh pr list --state open --json ...` -> `[]`.

## 并发派发证据

Single implementation worker. This spec touches the shared M4 evidence README, so no parallel implementation worker is safe. Coordinator may run local read-only spec compliance and code quality reviews after implementation.

## 事故与 closeout 记录

- Incident：none introduced by this spec execution at authoring time。
- Existing local blocker：root/main contains the five untracked duplicate docs listed in the preconditions; this blocks full local worker-boundary enforcement but was not written by this M4-31 worker。
- Closeout evidence target: `docs/evidence/M4/M4-31-order-import-admin-api-bridge-contract.md`。

## 实施步骤

1. Add `scripts/tests/m4-order-import-admin-api-bridge-contract.test.mjs`.
2. Compile/import the existing admin order import API client and API order import controller/service/repository using a test-private temporary module compiler, not shared runtime cache.
3. Build a controller-backed fetcher that maps admin client GET paths to `OrderImportController` methods with a controlled `AccessContext`.
4. Verify jobs, row errors and fresh snapshot search travel through the bridge with M4-07/M4-13 response shapes.
5. Verify stale/missing bridge results preserve handoff-required behavior, runtime warnings and no status-ref exposure.
6. Verify API access/not-found failures become admin client HTTP failures.
7. Update M4 evidence file and M4 README without claiming real HTTP/auth runtime, DB runtime, worker queue, admin E2E or release closeout.

## 通过条件

- Admin client jobs/errors/snapshot search paths can be handled by the existing API controller/service/repository contract.
- Stale/missing results remain handoff-required and do not expose `orderStatusRef` through the admin client.
- Missing permission and missing job cases map to admin client HTTP failures.
- This PR does not modify source files, read env, instantiate PrismaClient, import `@prisma/client`, connect/write DB, add `order_connector`, call network/fetch, add BullMQ/Redis dependency/runtime, modify schema/migration/generated client, package/lock/config, or submit raw customer/order data.
- Evidence file records validation table, boundary notes and no production API/DB/runtime/admin E2E/BullMQ/Redis/XLSX closure.

## 失败分支

- 若需要真实 HTTP server/auth runtime、real API base URL/env、global fetch default, DB connection, env validation, PrismaClient provider, schema/migration, generated client commit, worker queue runtime, admin visible UI/E2E, real import files 或 external order API：停止并拆到后续 scoped spec。
- 若 bridge test cannot be expressed without source changes or accepting raw/uncontrolled refs：停止并 record blocked evidence; do not create hidden runtime wiring。
- 若出现 raw order/customer samples、phone/address/payment/order IDs、credentials/env/secrets：停止、清理本 worker 改动并进入 incident/cleanup path。
- 若 validation 失败且无法在 scope 内修复：提交 blocked evidence 或关闭/重开更小 spec；不得降低断言、删测试或扩大 mock。

## 不做什么

- 不新增 `order_connector`、外部 API adapter/provider/connector、API/admin/worker source、DB schema/migration、generated client、DB env/runtime default provider、real PrismaClient injection、worker queue runtime、admin visible UI/E2E、AI runtime/eval、feature flag、production config、Storage downloader/upload runtime、signed URL、XLSX parser/dependency 或 real CSV/XLSX import sample。
- 不读取 `process.env`、不默认调用 `global fetch`、不创建 `new PrismaClient()`、不连接或写入真实数据库、不提交 raw/export/jsonl/csv/xlsx、真实客户明文、电话号码、地址、支付信息、订单号、截图、Telegram payload、LLM prompt/completion、env 或 secret。
- 不删除 root/main 中既有未跟踪 duplicate docs；后续若 owner 确认可清理，应单独 cleanup。
- 不关闭 E-02/E-03/E-04/J-02/I-01 的 production API/auth runtime、Storage downloader/upload runtime、DB/runtime、queue/admin E2E、真实导入样例、AI runtime/eval 或 release acceptance。

## 验收映射

| Item | Status | Notes |
|---|---|---|
| E-01 | `not_current_blocker__no_api_for_m4` | No `order_connector` or external API connector added. |
| E-02 | `admin_api_bridge_contract_supported_not_closed` | Verifies admin client jobs/errors/snapshot search against the existing API controller/service contract; production DB/runtime, queue and visible UI E2E remain future scope. |
| E-03 | `admin_api_bridge_contract_supported_not_closed` | Verifies stale/missing warning handoff remains fail-closed through admin client and API controller/service bridge. |
| E-04 | `foundation_supported_not_closed` | Bridge consumes order-read API results without fabricating status; AI eval/runtime integration remains future scope. |
| I-01 | `partial_admin_api_bridge_not_closed` | Adds admin-client-to-API-controller bridge evidence; full desktop core workflow with runtime data remains future scope. |
| J-02 | `queue_runtime_not_closed` | No real BullMQ/Redis runtime, retry execution, idempotent storage locks or backlog alerting added. |
