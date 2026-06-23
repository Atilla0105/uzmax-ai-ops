# M4-45 Order Import Queue Security Closeout

## 目标

把 M4-24 的 worker queue job contract 和 M4-40/M4-41/M4-42 的直接 dispatcher smoke 收束为最小真实队列/安全 closeout：新增 opt-in BullMQ/Redis runtime adapter，使现有 `order_import_csv_text` dispatch contract 可以通过真实 Redis-backed queue 入队、消费、重试，并补上 Storage source idempotency lock、队列 backlog/failed health alert、fault-injection evidence 和 `npm audit` high 风险处理。

本 spec 的目标是关闭 M4 README 中 `J-02 still_requires_m4_45_queue_security_closeout` 的 M4 级别证据缺口；它不是 production worker deployment、Render Redis 创建、正式告警接入、真实客户/订单数据验收、GA-0 或 1.0 发布签收。

## 项目 Owner 确认点与 AI Agent 责任

Owner：确认本切片允许新增 BullMQ/Redis 运行依赖、CI Redis service/smoke 和 npm security override；仍由 owner 决策生产 Redis/Render 服务、真实 worker 部署、真实客户/订单数据、成本、合规和最终 M4 closeout 签收。

AI agent：只在 `/Users/atilla/Documents/uzmax-m4-45-order-import-queue-security-closeout` / `codex/m4-45-order-import-queue-security-closeout` 执行；复核不写 root/main、复用 M4-24 dispatch contract、不重写导入链路、不触碰 DB schema/migration/generated client、不提交 raw customer/order data、secret/env、不新增外部 order API connector、不把 dev Redis smoke 伪装为 production deployment。完成后必须先做 spec compliance review，再做 code quality review。

## 时间盒

1 个工作日。若 BullMQ/Redis adapter、CI Redis smoke、npm audit override 或 queue health/fault evidence 无法在预算内通过 validation，则停止并记录 blocker；不得把真实 Redis evidence 降级为 pure mock，也不得删除断言、扩大 mock 或提前写 M4 accepted。

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M4-45-order-import-queue-security-closeout.md`
  - `docs/evidence/M4/M4-45-order-import-queue-security-closeout.md`
  - `docs/evidence/M4/README.md`
  - `.github/workflows/ci.yml`
  - `package.json`
  - `package-lock.json`
  - `apps/worker/package.json`
  - `apps/worker/src/main.ts`
  - `apps/worker/src/order-import-bullmq-runtime.ts`
  - `apps/worker/scripts/run-m4-order-import-bullmq-redis-smoke.mjs`
  - `scripts/tests/m4-worker-test-loader.mjs`
  - `scripts/tests/m4-order-import-bullmq-redis-runtime.test.mjs`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：不得触碰 `apps/api/**`、`apps/admin/**`、`packages/db/prisma/**`、`packages/db/migrations/**`、`packages/db/src/generated/**`、`packages/capabilities/**`、真实样例、root/main checkout 或其他 worktree。CI 只允许为 M4-45 Redis smoke 增加最小 Redis service/start step 和 smoke command。
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source 预算：changed source files <= 3、net source LOC <= 500、new source files <= 2。
- path classification：
  - source: `apps/worker/src/main.ts`, `apps/worker/src/order-import-bullmq-runtime.ts`, `apps/worker/scripts/run-m4-order-import-bullmq-redis-smoke.mjs`
  - test: `scripts/tests/m4-worker-test-loader.mjs`, `scripts/tests/m4-order-import-bullmq-redis-runtime.test.mjs`
  - config: `.github/workflows/ci.yml`, `package.json`, `apps/worker/package.json`
  - lock: `package-lock.json`
  - docs: `docs/specs/M4-45-order-import-queue-security-closeout.md`, `docs/evidence/M4/M4-45-order-import-queue-security-closeout.md`, `docs/evidence/M4/README.md`
  - generated: none
- 新增 source 文件前的 `rg` 搜索结论和归属理由：`rg -n "BullMQ|Redis|queue|Worker|retry|backlog|idempot|storage lock|fault|jobId|attempts" apps packages scripts docs/specs/M4-*.md docs/evidence/M4 package.json package-lock.json` 显示：M4-24 已有 `apps/worker/src/order-import-dispatch.ts` job/idempotency/retry contract，M4-27 已有 worker Prisma persistence adapter，M4-40/M4-41/M4-42 通过 `packages/db/scripts/order-import-worker-submit-smoke-support.mjs` 直接调用 dispatcher/persistence 证明链路，但没有真实 BullMQ/Redis runtime、storage lock、backlog/failed alert 或 fault-injection evidence。新增 `apps/worker/src/order-import-bullmq-runtime.ts` 承载同域 opt-in adapter，避免把 queue runtime 挤入 `main.ts` 或 DB/API 层；新增 `apps/worker/scripts/run-m4-order-import-bullmq-redis-smoke.mjs` 作为 Redis smoke entrypoint，不新增平行导入实现。
- 外部依赖依据：`npm view bullmq version dependencies peerDependencies --json` on 2026-06-23 returned `bullmq@5.79.1` with `ioredis` dependency and `redis >=5.0.0` peer; `npm view ioredis version --json` returned `5.11.1`; `npm view @nestjs/platform-express version dependencies --json` returned `@nestjs/platform-express@11.1.27` depending on `multer@2.1.1`; `npm view multer version --json` returned `2.2.0`. Implementation must rely on installed/generated local type definitions and focused smoke evidence, not invented APIs.
- 是否需要例外：默认无。若 package/lock/security override causes broad dependency churn, must report exact lock churn and justify in PR Hygiene; no `large_change_exception` is pre-approved.

## 文档触发检查

- 结果：updated。
- 判断依据：`docs/doc-gates.md`；本 slice adds runtime dependency/security closeout evidence and CI runtime smoke, so PR/evidence must explicitly record path scope and not claim production release.

## 前置条件

- 已读取 `AGENTS.md`、`docs/specs/README.md`、`docs/doc-gates.md`、`docs/evidence/M4/README.md`、`docs/adr/ADR-B02-order-api.md`、M4-24/M4-27/M4-40/M4-41/M4-42/M4-43/M4-44 spec/evidence/tests/scripts、`apps/worker/src/order-import-dispatch.ts`、`apps/worker/src/order-import-prisma-persistence.ts`、`packages/db/scripts/order-import-worker-submit-smoke-support.mjs`、`.github/workflows/ci.yml`、`package.json`、`apps/worker/package.json`。
- Current root/main clean after PR #105 merge: `main` at `371910822bac509ee2e725d3838097ece01e2ed7`, open PR list `[]`, `git branch --no-merged main` empty, only root worktree before M4-45 creation.
- `npm audit --json` before this spec reports 3 high vulnerabilities: `@nestjs/core`, `@nestjs/platform-express`, `multer`; the concrete vulnerable payload is `multer <2.2.0`, while npm's suggested fix is an unsafe semver-major downgrade path. M4-45 must either clear this with a bounded `multer@2.2.0` override and validation, or record a real security blocker.
- Worktree / branch：
  - `pwd=/Users/atilla/Documents/uzmax-m4-45-order-import-queue-security-closeout`
  - `git status --short --branch=## codex/m4-45-order-import-queue-security-closeout`
  - `git branch --show-current=codex/m4-45-order-import-queue-security-closeout`
  - base commit `371910822bac509ee2e725d3838097ece01e2ed7`

## 并发派发证据

本 spec 触碰 worker runtime、package/lockfile、CI workflow 和 M4 evidence README，必须全局串行；不得与 DB schema、lockfile、CI、runtime gate 或 release closeout 并发写入。可派发只读 reviewer；写入只能由本 M4-45 worker worktree 完成。

## 事故与 closeout 记录

- Incident：none introduced at spec authoring time.
- 若发现写入越界、root/main 直接提交、secret/customer-data 边界擦边、gate 绕过、dependency downgrade 或 CI skip/false green，立即停止并按 `docs/incidents/README.md` 判断是否记录 incident。
- Closeout evidence target: `docs/evidence/M4/M4-45-order-import-queue-security-closeout.md`。

## 实施步骤

1. Add BullMQ/ioredis runtime dependencies to `apps/worker/package.json` and update `package-lock.json`; add a root `overrides` entry for `multer@2.2.0` only if install/test/audit prove it clears the current high findings without breaking Nest/API build.
2. Add `apps/worker/src/order-import-bullmq-runtime.ts` exporting an opt-in runtime adapter around existing `createOrderImportCsvTextDispatchContract` / `runOrderImportCsvTextDispatchContract`; no default worker startup, no env read, no PrismaClient creation, no DB or Storage downloader inside the module.
3. Adapter must support:
   - enqueue with deterministic `jobId`, `idempotencyKey`, attempts/backoff mapped from M4-24 dispatch contract;
   - a consumer handler that validates the job payload before calling the injected dispatch handler;
   - Redis-backed Storage source lock using controlled `sourceRef`, TTL, token-checked release, and duplicate-lock fail-closed behavior;
   - queue health/backlog snapshot with waiting/delayed/failed counts and threshold-based alerts.
4. Add focused Node test that compiles/imports the worker runtime module without Redis, verifies job options/payload validation, storage-lock key derivation/fail-closed shape via fake Redis port, health alert logic, no env/secret/order_connector/raw data, no DB/schema/API/admin scope, and docs/evidence wording.
5. Add `apps/worker/scripts/run-m4-order-import-bullmq-redis-smoke.mjs` requiring `UZMAX_REDIS_URL` and failing closed if absent; with real Redis it must enqueue duplicate synthetic jobs, run a real BullMQ Worker, inject one first-attempt failure, verify retry succeeds, verify duplicate job/idempotency does not double-dispatch, verify storage source lock duplicate is blocked/released, verify health snapshot/backlog alert behavior, clean Redis keys/queues, and print residue `0`.
6. Update `.github/workflows/ci.yml` so worker/package changes run the Redis smoke in PR CI with a Redis service/container and `UZMAX_REDIS_URL`, without printing secrets and without requiring DB credentials for the Redis-only smoke. Keep existing true DB smokes unchanged.
7. Update M4 evidence README and new M4-45 evidence. Do not mark M4 or production accepted; only mark queue/security closeout evidence according to actual CI/audit results.

## 通过条件

- `node --test scripts/tests/m4-order-import-bullmq-redis-runtime.test.mjs` passes.
- `env -u UZMAX_REDIS_URL node apps/worker/scripts/run-m4-order-import-bullmq-redis-smoke.mjs` fails closed with a clear missing env message.
- Real Redis smoke passes locally when Redis is available or in CI with the configured Redis service; evidence must include run id/job id before merge.
- `npm audit --json` reports high vulnerabilities `0`, or evidence records a concrete unresolved security blocker and M4 closeout remains not accepted. Prefer a bounded `multer@2.2.0` override if validation proves compatibility.
- `npm run format:check`, `npm run guard:prettier-ignore`, `npm run typecheck`, `npm run lint`, `npm run depcruise`, `npm run jscpd`, `npm run knip`, `npm run guard:forbidden-terms`, `npm run guard:eval-triggers -- --base origin/main`, `npm run guard:doc-triggers`, `npm run guard:workspace`, `UZMAX_ASSIGNED_WORKTREE=/Users/atilla/Documents/uzmax-m4-45-order-import-queue-security-closeout UZMAX_PRIMARY_ROOT=/Users/atilla/Documents/UZMAX智能运营 npm run guard:worker-boundary`, `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M4-45-order-import-queue-security-closeout.md --include-worktree`, `npm test`, `npm run build`, and applicable CI checks pass.
- PR Hygiene reports source changed files, net source LOC, new source files, total churn, lockfile/package changes, dependency/security rationale, Redis smoke status, audit status, no test weakening, and no external order API/provider/connector.

## 失败分支

- 若 BullMQ/Redis runtime requires production Redis credentials, Render service creation, DB schema changes, real customer/order data, or API/admin rewrite: stop and record blocker; do not merge partial production claims.
- 若 Redis smoke cannot be made deterministic without skipping or weakening assertions: stop and record blocker; do not replace real Redis with pure mock evidence.
- 若 `multer@2.2.0` override breaks install, typecheck, runtime build or API/Nest tests: remove the override, record the exact audit blocker, and keep M4 final closeout blocked.
- 若 dependency install causes unrelated package churn or major downgrade: stop and split a dedicated dependency/security spec.
- 若 validation fails and cannot be fixed within scope: commit blocked evidence or close/reopen a smaller spec; do not delete tests, lower assertions, add `.skip`/`.only`/`xit`/`xfail`, or expand mocks to pass.

## 不做什么

- 不新增 external order API connector、fake connector、LLM/provider、Telegram、production Redis/Render service creation、real worker deployment、real customer/order sample、production config、release gate 或 owner signoff.
- 不修改 DB schema/migrations/generated client、API controller/service、Admin UI/client、capabilities/order-read eval behavior、customer asset runtime 或 Supabase true DB smoke semantics.
- 不读取或提交 raw CSV/XLSX/export/jsonl、order IDs、phone numbers、addresses、payment data、customer plaintext、screenshots、Telegram payloads、LLM prompt/completion、env 或 secrets.
- 不把 CI Redis smoke、dependency audit cleanup 或 M4 evidence README 改写为 production-ready/GA-0/1.0 release approval.

## 验收映射

| 验收项 | 目标状态 | 说明 |
|---|---|---|
| E-01 | `not_current_blocker__no_api_for_m4` | 遵守 ADR-B02 no-API branch；不新增外部 order connector。 |
| E-02 | `order_import_queue_runtime_supported_for_m4_no_api_branch` | 现有 import snapshot main path 可通过 opt-in BullMQ/Redis queue 执行；正式生产 worker deployment 和真实样例仍由 owner 后续决策。 |
| E-03 | `order_import_stale_missing_warning_closed_for_m4_no_api_branch` | M4-45 不改变 warning shape；通过复用既有 dispatch/persistence path 保持 M4-42/M4-44 语义。 |
| E-04 | `order_read_runtime_eval_gate_supported_not_production_gate` | M4-45 不改 AI eval；M4-44 evidence 仍是受控 runtime-to-eval bridge。 |
| I-01 | `order_import_operator_and_queue_supported_not_full_desktop_core` | 队列运行支撑订单导入主路径；客户资产全聚合、正式 auth/owner flow、production release 仍不由本 PR 关闭。 |
| J-02 | `queue_security_closeout_supported_not_production_deployment` | BullMQ/Redis smoke、retry/fault、idempotent storage lock、backlog alert 和 audit high 处理形成 M4 级别 closeout evidence；生产 Redis/worker deployment 与最终 M4 signoff 仍需 owner 决策。 |
