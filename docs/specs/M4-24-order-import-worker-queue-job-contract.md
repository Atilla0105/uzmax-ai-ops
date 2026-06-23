# M4-24 Order Import Worker Queue Job Contract

## 目标

为 ADR-B02 no-API 分支补齐订单导入 worker queue-job-contract foundation：在现有 worker parser/persistence contract 之上，固化 `order_import_csv_text` job name、jobId、idempotencyKey、attempt/maxAttempts、backoffMs 与 dispatch payload 形状，并确保合法 job 才能进入 M4-12 `runOrderImportCsvTextPersistenceJob`。本 spec 不新增 BullMQ/Redis 依赖、不读取文件/Storage/env、不连接真实 DB、不改 schema/migration、不实现真实 queue runtime、积压告警、admin E2E、外部订单 API connector、真实订单数据或 AI runtime。

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner：确认本切片只作为 E-02/J-02 的 queue job/idempotency contract foundation，不代表生产 BullMQ/Redis runtime、真实导入任务、重试执行器、积压告警、DB transaction/RLS runtime、admin E2E、AI runtime/eval 或 1.0 发布验收关闭。Owner 仍负责真实 Redis/worker runtime 配置、客户/订单数据、生产配置、成本和合规风险决策。

AI agent：只在 `/Users/atilla/Documents/uzmax-m4-24-order-import-queue-job-contract` / `codex/m4-24-order-import-queue-job-contract` 执行；复核 job metadata fail-closed, idempotency/retry contract, no BullMQ/Redis dependency, no DB/env/file/network runtime, no external order API/no `order_connector`, no raw data, PR hygiene, worker boundary evidence 和 M4 evidence index 同步。

## 时间盒

0.5 个工作日。若 queue job contract 无法在预算内通过 focused Node test、type/lint/guard/check validation，则关闭或拆小；不得夹带真实 queue runtime、lockfile/dependency、DB wiring、admin UI/E2E、真实导入样例或外部 API connector 继续推进。

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M4-24-order-import-worker-queue-job-contract.md`
  - `docs/evidence/M4/M4-24-order-import-worker-queue-job-contract.md`
  - `docs/evidence/M4/README.md`
  - `apps/worker/src/main.ts`
  - `apps/worker/src/order-import-dispatch.ts`
  - `scripts/tests/m4-worker-test-loader.mjs`
  - `scripts/tests/m4-order-import-worker-queue-job-contract.test.mjs`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：不得触碰 `apps/api/**`、`apps/admin/**`、`packages/db/**` schema/migration/generated client、`packages/capabilities/**`、package/lock/config、真实导入样例、root/main checkout 或其他 worktree。
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source 预算：changed source files <= 2、net source LOC <= 180、new source files <= 1。
- test/generated/lock/config/docs 预计变更：新增 1 个 focused Node test；小改 worker test loader 以加载新 dispatch module；新增 spec/evidence；同步 M4 evidence README；不改 DB schema/migration/generated client、API/admin、lockfile、config 或 package。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：`rg -n "BullMQ|Queue|queue|worker|runOrderImport|parseOrderImport|idempotency|retry|backoff|order_import" package.json package-lock.json apps/worker/src scripts/tests docs/specs docs/evidence/M4` 显示没有 BullMQ/Redis dependency，M4-09/M4-10/M4-12 已在 `apps/worker/src/main.ts` 放置 worker import parser/persistence contract，但缺少 queue job/idempotency/retry payload contract。直接继续挤入 `main.ts` 会触发 ESLint `max-lines`，且既有 M4-09/M4-10/M4-12 tests intentionally assert worker main has no queue runtime vocabulary；因此新增 `apps/worker/src/order-import-dispatch.ts` 承载 dispatch/job contract，并由 `apps/worker/src/main.ts` re-export，避免新增平行实现。
- 外部 API/SDK/provider/connector/adapter 依据：none。本 PR 不新增、不调用、不声明任何外部 API/SDK/provider/connector/adapter 能力；不新增 BullMQ/Redis dependency；ADR-B02 no-API branch remains active and `order_connector` remains absent.
- 是否需要例外：无。

## 文档触发检查

- 结果：`none`。
- 判断依据：`docs/doc-gates.md`；本 slice 只增加 worker job contract 和 M4 evidence，不新增真实 env validation、production queue、observability、OpenAPI/generated DTO、runbook 或 release workflow。

## 前置条件

- 已读取 `AGENTS.md`、`docs/specs/README.md`、`docs/doc-gates.md`、`docs/evidence/M4/README.md`、`docs/adr/ADR-B02-order-api.md`、M4-09/M4-10/M4-12/M4-23 spec/evidence、v1.1 后台设计 §4.4、技术架构 §2.1/§8/§10、验收矩阵 E-02/E-03/E-04/J-02/I-01、现有 worker parser/persistence tests 与 package dependencies。
- ADR-B02 当前分支为 `no_api_for_m4__import_snapshot_main_path`；本 spec 不实现订单 API connector，不新增 `order_connector`，不调用或模拟外部 API。
- 基线：`npm ci` passed；`npm test` passed 232 tests。`npm audit` reported existing 3 high severity vulnerabilities, not introduced by this spec。
- Root/main full local worker boundary preflight is blocked by existing untracked duplicate docs in `/Users/atilla/Documents/UZMAX智能运营`:
  - `docs/adr/ADR-B02-order-api 2.md`
  - `docs/adr/README 2.md`
  - `docs/evidence/M4/README 2.md`
  - `docs/evidence/M4/spikes 2/SPK-02-order-saas-api/manifest.md`
  - `docs/specs/SPK-02-order-api 2.md`
- Because those files pre-existed this worker and may be user-retained local files, this spec does not delete them. Implementation uses absolute assigned worktree paths; CI-mode worker boundary and manual root tracked/index clean evidence are recorded.

## Worktree / branch 前置条件

- Worktree / branch：预期物理 worktree `/Users/atilla/Documents/uzmax-m4-24-order-import-queue-job-contract`；branch `codex/m4-24-order-import-queue-job-contract`；禁止写入 `/Users/atilla/Documents/UZMAX智能运营` root/main checkout。
- 开工记录：
  - `pwd`: `/Users/atilla/Documents/uzmax-m4-24-order-import-queue-job-contract`
  - `git status --short --branch`: `## codex/m4-24-order-import-queue-job-contract`
  - `git branch --show-current`: `codex/m4-24-order-import-queue-job-contract`
  - `git rev-parse HEAD`: `e2c274a37c9838e80545d557c99aa1bf411601cc`
- Baseline note：local root/main is content-equivalent to remote M4-23 merge content, but local SHA differs from remote `main` because local `git fetch` hung during M4-23 closeout. Remote true main observed by `git ls-remote` before this spec: `837f9878b496992d4f4c816818a13a790e017d59`.
- Worker boundary evidence:
  - Full local guard result: `root_untracked_duplicate_docs_block_full_local_preflight` for the five duplicate docs listed above.
  - `CI=true UZMAX_ASSIGNED_WORKTREE=/Users/atilla/Documents/uzmax-m4-24-order-import-queue-job-contract UZMAX_PRIMARY_ROOT=/Users/atilla/Documents/UZMAX智能运营 npm run guard:worker-boundary` passed assigned-worktree check.
  - Root tracked/index clean evidence: `git status --short --branch --untracked-files=no` -> `## main...origin/main`; `git diff --quiet` passed; `git diff --cached --quiet` passed.

## 并发派发证据

Single implementation worker. This spec touches `apps/worker/src/main.ts` and shared M4 docs, so no parallel implementation worker is safe. Coordinator may dispatch read-only spec compliance and code quality reviewers after implementation because they do not write files.

## 事故与 closeout 记录

- Incident：none introduced by this spec execution at authoring time。
- Existing local blocker：root/main contains the five untracked duplicate docs listed in the preconditions; this blocks full local worker-boundary enforcement but was not written by this M4-24 worker.
- Closeout evidence target: `docs/evidence/M4/M4-24-order-import-worker-queue-job-contract.md`。

## 实施步骤

1. In `apps/worker/src/order-import-dispatch.ts`, add `orderImportWorkerJobNames`, `OrderImportCsvTextDispatchInput`, `createOrderImportCsvTextDispatchContract`, and `runOrderImportCsvTextDispatchContract`; re-export it from `apps/worker/src/main.ts`。
2. Validate jobName, jobId, idempotencyKey, enqueuedAt, attempt/maxAttempts and backoffMs before parser/persistence starts。
3. Keep dispatch payload using the existing M4-12 `OrderImportCsvTextPersistenceJobInput` shape with deterministic import/snapshot/error IDs supplied by the caller。
4. Run valid job payloads through existing `runOrderImportCsvTextPersistenceJob`; malformed metadata must fail before any persistence gateway method is called。
5. Add focused Node test covering normalized retry/idempotency contract, existing parser/persistence path handoff, fail-before-persistence metadata errors, no BullMQ/Redis/env/network/DB runtime, and M4 evidence mapping。
6. Update M4 evidence README without claiming E-02/E-03/E-04/J-02/I-01 closeout。

## 通过条件

- `order_import_csv_text` job contract records jobId, idempotencyKey, attempt/maxAttempts, backoffMs and normalized payload deterministically。
- Unsupported jobName, malformed idempotencyKey/jobId/enqueuedAt or invalid attempt/retry metadata fail closed before persistence gateway calls。
- Valid dispatch contract reuses existing parser/draft/persistence path without changing DB/API/admin packages。
- This PR does not add BullMQ/Redis dependency, modify lockfile, read env, instantiate PrismaClient, import `@prisma/client`, connect/write DB, add `order_connector`, call network/fetch, modify schema/migration/generated client, or submit raw customer/order data。
- Evidence file records validation table, boundary notes and no production queue/runtime/admin E2E closure。

## 失败分支

- 若需要 BullMQ/Redis dependency, real queue consumer, Redis connection, env validation, backlog alerting, DB connection, RLS transaction wrapper, schema/migration, generated client commit, admin UI/E2E, real import files or external order API：停止并拆到后续 scoped spec。
- 若出现 raw order/customer samples、phone/address/payment/order IDs、credentials/env/secrets：停止、清理本 worker 改动并进入 incident/cleanup path。
- 若 malformed job metadata can trigger persistence, or idempotency/retry metadata is optional/ambiguous at dispatch boundary：不得合并，修正为 fail-closed contract。
- 若 validation 失败且无法在 scope 内修复：提交 blocked evidence 或关闭/重开更小 spec；不得降低断言、删测试或扩大 mock。

## 不做什么

- 不新增 `order_connector`、外部 API adapter/provider/connector、BullMQ/Redis dependency、真实 queue consumer、Redis connection、DB schema/migration、generated client、API route、admin UI/client、Storage downloader、feature flag、production config、real file upload、CSV/XLSX sample file 或 XLSX import。
- 不读取 `process.env`、不创建 `new PrismaClient()`、不连接或写入真实数据库、不提交 raw/export/jsonl/csv/xlsx 文件、真实客户明文、电话号码、地址、支付信息、订单号、截图、Telegram payload、LLM prompt/completion、env 或 secret。
- 不关闭 E-02/E-03/E-04/J-02/I-01 的 DB runtime/queue/admin E2E/AI acceptance；只提供 worker queue job/idempotency contract foundation。

## 验收映射

| Item | Status | Notes |
|---|---|---|
| E-01 | `not_current_blocker__no_api_for_m4` | No `order_connector` or external API connector added. |
| E-02 | `queue_job_contract_supported_not_closed` | Adds controlled job dispatch/idempotency contract before existing parser/persistence handler; production DB runtime, real BullMQ/Redis queue and admin E2E remain future scope. |
| E-03 | `foundation_supported_not_closed` | Valid dispatch reuses existing parser/draft path preserving expiry/source fields; persisted/runtime warning remains future scope. |
| E-04 | `foundation_supported_not_closed` | Worker only shapes import data; order-read handoff/no-fabrication path remains the AI boundary. |
| J-02 | `queue_job_contract_supported_not_closed` | Adds deterministic job id/idempotency/retry metadata contract; no real retry execution, idempotent storage lock, Redis runtime or backlog alerting is added. |
| I-01 | `not_closed` | No admin E2E workflow is added. |
