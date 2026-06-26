# M6B-06b Telegram Worker Consumer

Spec ID: M6B-06b
Tracking issue: Linear LAY-22
Status: `m6b_06b_telegram_worker_consumer_in_progress_not_ga0`
Owner confirmation point: project owner authorized continuing to true closure, using computer/browser if needed, while production, outbound Bot send, real customer/order data, customer LLM/provider calls, GA-0 and 1.0 remain not approved.
Timebox: 0.5 work day.

## Spec 类型

fix

## 目标

Close the runtime gap found during M6B-06 staging-equivalent webhook work: API can enqueue Telegram Bot conversation jobs after M6B-06a, and `apps/worker/src/conversation-runtime.ts` can process those jobs, but the worker service shell still starts only the `order-import` worker.

M6B-06b wires the existing Telegram Bot conversation BullMQ worker into the worker service shell behind explicit queue configuration.

The closure evidence must prove the code chain with synthetic data: webhook core accepts a Bot update, queues it into BullMQ/Redis, worker service shell consumes it, and the persistence gateway writes ticket/conversation rows visible only through the correct DB/RLS tenant context.

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner: authorized continuing the default closure path and browser/computer use, with escalation only for real external blockers.

AI agent: implement the narrow service-shell wiring, keep defaults conservative, validate locally without secrets, and rely on GitHub Actions masked `UZMAX_RLS_DATABASE_URL` for true DB/RLS smoke where available. Do not print DB URLs, Bot tokens or webhook secrets.

## Source Links

- `AGENTS.md`
- `docs/specs/M6B-00-ga0-runtime-bring-up-contract.md`
- `docs/specs/M6B-05a-conversation-runtime-build.md`
- `docs/specs/M6B-06a-bullmq-job-id-fix.md`
- `apps/worker/src/worker-service-shell.ts`
- `apps/worker/src/conversation-runtime.ts`
- `.github/workflows/ci.yml`

## 触碰模块/文件

- `apps/worker/src/worker-service-shell.ts`
- `apps/worker/package.json`
- `packages/db/package.json`
- `packages/db/scripts/run-m6b-webhook-worker-true-db-smoke.mjs`
- `.github/workflows/ci.yml`
- `package.json`
- `package-lock.json`
- `scripts/tests/m6b-worker-telegram-consumer.test.mjs`
- `docs/specs/M6B-06b-telegram-worker-consumer.md`
- `docs/evidence/M6B/M6B-06b-telegram-worker-consumer.md`

## 变更预算与路径分类

- Source budget: changed source files <= 3, net source LOC <= 600, new source files <= 1.
- Test budget: new focused test files <= 1.
- Docs: 2 files.
- Config/lock: GitHub Actions M6B true DB smoke wiring, package dependency metadata and package-lock updates are allowed only for this worker/DB smoke closure.
- New source `rg` conclusion: searched `telegram-bot-conversation`, `createTelegramBotConversationBullmqWorker`, `processTelegramBotConversationJob`, `run-m6b-conversation-runtime-true-db-smoke`, `worker-service-shell` and `UZMAX_WORKER_*`. Existing conversation runtime already exists; the missing production owner is the worker service shell entrypoint. The only new source file is the synthetic CI true DB smoke runner.
- External API/SDK/provider/connector/adapter basis: no new external provider; uses existing BullMQ, Prisma Client already used by `packages/db`, and existing GitHub Actions masked DB secret pattern.

## 文档触发检查

updated

## 前置条件

- M6B-06a job ID fix exists or is merged before this branch, because BullMQ rejects `:` in custom job IDs.
- Root/main checkout remains coordination-only.
- No outbound Bot send and no production deploy are authorized by this spec.

## Worktree / branch 前置条件

| Fact | Expected |
|---|---|
| worktree | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m6b-06b-telegram-worker-consumer` |
| branch | `codex/m6b-06b-telegram-worker-consumer` |
| base | `main` after M6B-06a merge (`8316829`) |
| forbidden checkout | `/Users/atilla/Applications/UZMAX智能运营` for writing |

## 实施步骤

1. Add explicit `UZMAX_WORKER_QUEUES` support while preserving default `order-import`.
2. Wire `telegram-bot-conversation` to the existing conversation BullMQ worker.
3. Default Bot persistence to `rls_prisma_gateway` and require `UZMAX_RLS_DATABASE_URL`; allow explicit `telemetry` only for artifact smoke.
4. Add focused test coverage for worker service configuration and fail-closed persistence mode.
5. Add a CI true DB smoke runner for synthetic webhook -> BullMQ Redis -> worker service shell -> DB/RLS ticket readback.
6. Use PR CI with masked `UZMAX_RLS_DATABASE_URL` and disposable Redis for the full code chain.

## 通过条件

- Default worker behavior remains order-import only.
- Explicit Bot worker config starts `telegram-bot-conversation`.
- Missing `UZMAX_RLS_DATABASE_URL` fails closed for default Bot persistence mode.
- CI true DB/RLS smoke verifies synthetic webhook -> queue -> worker consume -> same-tenant ticket readback and wrong-tenant zero visibility.

## 失败分支

- If Bot worker DB persistence requires schema or migration changes, stop and split.
- If local or CI lacks `UZMAX_RLS_DATABASE_URL`, record fail-closed status and do not claim true DB/RLS closure.
- If outbound send, production deploy or real customer data is needed, stop and request owner approval.

## 不做什么

- No production deploy.
- No outbound Bot send.
- No real customer/order data.
- No customer LLM/provider call.
- No schema/migration/generated client change.
- No GA-0 or 1.0 approval.
