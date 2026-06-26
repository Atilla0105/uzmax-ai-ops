# M6B-04 Thin Staging Render Env

## 目标

Create the minimum repo-governed Render staging wiring needed for a durable API endpoint and Redis-backed Telegram Bot webhook ingress. This slice prepares the Blueprint/env contract only; it does not claim that Render services are deployed until live `/healthz` and webhook evidence exists.

## 项目 owner 确认点与 AI agent 执行/复核责任

Project owner has authorized default handling for the staging endpoint and Telegram test bot replacement path, with hard boundaries: no production, no outbound Bot send, no real customer traffic, no real customer/order data, and no secret values printed.

AI agent executes the narrow infra wiring, validates repo checks, records evidence honestly, and may use the owner-provided local `TELEGRAM_BOT_WEBHOOK_SECRET` only as a secret value in Render/Telegram control-plane calls. AI agent must not expose token/secret values, approve GA-0, or treat telemetry-only staging worker logs as DB/RLS evidence.

## 时间盒

0.5 work day for repo wiring and evidence. Live Render deployment and Telegram `setWebhook` can continue in the same owner-authorized operations window after this branch is merged.

## Spec 类型

infra

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `render.yaml`
  - `docs/specs/M6B-04-thin-staging-render-env.md`
  - `docs/evidence/M6B/M6B-04-thin-staging-render-env.md`
  - `docs/evidence/M6B/README.md`
- 说明/备注：
  - Infra-only Render staging env wiring for API/worker Redis and Telegram Bot webhook queue acceptance.
  - Do not modify runtime source, tests, app package files, lockfiles, CI/guard scripts, generated artifacts, DB schema/migrations, release gate code or production service state.

## 变更预算与路径分类

```text
source: changed files <= 0, net LOC <= 0, new files <= 0
config: render.yaml
docs: docs/specs/M6B-04-thin-staging-render-env.md, docs/evidence/M6B/M6B-04-thin-staging-render-env.md, docs/evidence/M6B/README.md
generated: none
lock: none
test: none
```

## 文档触发检查

updated

## 前置条件

- `AGENTS.md`, `docs/specs/README.md`, `docs/specs/M6B-00-ga0-runtime-bring-up-contract.md`, `docs/evidence/M6B/README.md`, `docs/evidence/M0/infra/render-env-manifest.md`, `render.yaml`, `apps/api/src/app.module.ts`, `apps/api/src/telegram-bot.ts`, and `apps/worker/src/worker-service-shell.ts` have been read.
- Root/main is clean and current.
- No durable staging API URL is currently recorded in repo/env/Linear.
- `.env.local` contains `TELEGRAM_BOT_WEBHOOK_SECRET`; value must not be printed.

## Worktree / branch 前置条件

```text
assigned worktree: /Users/atilla/Applications/UZMAX智能运营-m6b-04-staging-render-env
assigned branch: codex/m6b-04-staging-render-env
forbidden checkout for edits: /Users/atilla/Applications/UZMAX智能运营
pre-edit pwd: /Users/atilla/Applications/UZMAX智能运营-m6b-04-staging-render-env
pre-edit git status --short --branch: ## codex/m6b-04-staging-render-env
pre-edit git branch --show-current: codex/m6b-04-staging-render-env
```

## 并发派发证据

none; single worker slice.

## 事故与 closeout 记录

No incident at spec creation. If Render/Telegram mutation accidentally touches production, real customer traffic, or exposes secrets, stop and add an incident record before continuing.

## 实施步骤

1. Wire Render Key Value `uzmax-redis` into API and worker as `UZMAX_REDIS_URL`.
2. Add API env required for Telegram Bot webhook queue mode: `TELEGRAM_BOT_WEBHOOK_SECRET` as `sync: false`, `UZMAX_TELEGRAM_BOT_INGRESS_QUEUE_MODE=bullmq`, and synthetic staging org/tenant/channel identifiers.
3. Configure the staging worker to consume `telegram-bot-conversation` with telemetry persistence only, so staging can drain synthetic jobs without a staging DB and without claiming DB/RLS proof.
4. Record evidence and update the M6B index without marking M6B-04 passed until live Render health/webhook evidence exists.
5. After merge, create or update Render Blueprint services from `main`, set the webhook secret in Render without printing it, verify `/healthz`, then continue LAY-27 Telegram test bot `setWebhook` replacement for `<staging-api-base>/telegram/bot/webhook`.

## 通过条件

- `render.yaml` contains a Redis-backed API webhook env path and worker telemetry queue consumer config.
- `TELEGRAM_BOT_WEBHOOK_SECRET` is `sync: false` and no secret value is committed.
- Evidence states the current boundary honestly: repo wiring ready, live deploy/webhook replacement still needs platform verification.
- `npm run guard:doc-triggers` passes.
- `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M6B-04-thin-staging-render-env.md --include-worktree` passes.
- `git diff --check origin/main...HEAD` passes.

## 失败分支

- If Render Blueprint creation or deployment is unavailable, leave M6B-04 as blocked at `repo_wiring_ready_render_creation_blocked` and sync Linear.
- If the API starts but `/healthz` fails, do not call Telegram `setWebhook`; record the failing status and logs.
- If `/telegram/bot/webhook` cannot accept a safe synthetic request with the secret header, do not call Telegram `setWebhook`; record the blocker.
- If a durable staging URL cannot be produced, do not use an ephemeral tunnel as completion evidence.

## 不做什么

- No production Render/Vercel deploy.
- No outbound Telegram send.
- No real Telegram customer traffic, real customer/order data, or customer LLM/provider call.
- No DB schema, migration, generated Prisma client, package lockfile, source, worker runtime behavior, or CI workflow change.
- No GA-0, P1/P2 risk acceptance, 1.0 release, alert-fires, restore, or rollback closure.
- No secret values in repo, logs, PR text, Linear, or final chat.

## 验收映射

| Item | Mapping |
|---|---|
| M6B-04 thin staging deploy | This spec prepares Render env wiring; live deploy pass still requires URL/health/webhook evidence. |
| M6B-06 real Telegram staging webhook | Unblocked only after M6B-04 yields a durable `/healthz`-healthy API base URL. |
| LAY-27 stale webhook hygiene | After live staging API proof, replace the old test bot webhook URL with `<base>/telegram/bot/webhook` and verify `getWebhookInfo`. |
