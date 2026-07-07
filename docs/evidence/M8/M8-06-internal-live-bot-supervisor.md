# M8-06 Internal Live Bot Supervisor Evidence

Status: `local_validation_passed_ci_pending`
Date: 2026-07-07

## Scope

M8-06 adds a supervised internal live Bot command for the final item-7 test:

- preflight live-readiness env without printing secret values,
- optionally check Telegram Bot API reachability,
- optionally set the test Bot webhook with Telegram `secret_token`,
- optionally verify DB readback for a real internal employee chat,
- require inbound plus outbound `SENT` or open ticket before considering readback visible.

This is not a worker orchestration rewrite. M8-01 through M8-05 already own answer-or-handoff, KB-first answer, fail-closed LLM route, redline/output safety, sendMessage adapter and DB-backed conversation-ticket API.

## Start Audit

| Fact | Evidence |
|---|---|
| root/main status before worktree creation | `## main...origin/main` |
| root HEAD before worktree creation | `291c81a6c566b4c30f159b2d7fd6e96603f13d5a` |
| root no-merged branch audit before edits | no output |
| open PR audit before edits | `[]` |
| assigned worktree `pwd` | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/m8-06-internal-live-bot-supervisor` |
| assigned branch | `codex/m8-06-internal-live-bot-supervisor` |
| assigned HEAD | `291c81a6c566b4c30f159b2d7fd6e96603f13d5a` |
| assigned status before edits | `## codex/m8-06-internal-live-bot-supervisor` |

## Current-State Finding

- Code already supports live Telegram outbound through `createTelegramBotSendMessageAdapter`.
- Render config intentionally keeps `UZMAX_WORKER_TELEGRAM_BOT_ANSWER_MODE=dry_run`.
- Local `.env.local` has test Bot token/webhook-secret names, but not `UZMAX_RLS_DATABASE_URL` or `UZMAX_REDIS_URL`.
- CI true DB smokes prove synthetic webhook -> Redis -> worker -> DB/API readback, but no repo evidence proves a real internal employee Telegram message has been sent through the test Bot.

## Change Summary

- `packages/db/scripts/run-m8-internal-live-bot-supervisor.mjs`
  - Adds preflight-only default behavior.
  - Adds explicit `--check-telegram`, `--set-webhook`, `--verify-db` and `--expect-live` flags.
  - Uses Telegram Bot API `getMe`, `getWebhookInfo` and `setWebhook` only behind explicit flags.
  - Uses DB readback to verify inbound plus outbound `SENT` or open ticket for `UZMAX_INTERNAL_TEST_CHAT_ID`.
- `package.json`
  - Adds `smoke:m8-internal-live-bot`.
- `scripts/tests/m8-internal-live-bot-supervisor.test.mjs`
  - Covers command exposure, help/boundaries, missing-env fail-closed behavior, live-mode guard, readback semantics and docs boundary.

## External API Basis

- Telegram Bot API official documentation: `https://core.telegram.org/bots/api`.
- Used methods/fields: `getMe`, `getWebhookInfo`, `setWebhook`, `secret_token`, `allowed_updates`.
- No real Telegram call is made by tests or by the default command.

## Validation

Command:

```bash
PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node --test scripts/tests/m8-internal-live-bot-supervisor.test.mjs
```

Result: pass. `tests=6`, `pass=6`, `fail=0`.

Command:

```bash
PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node /Users/atilla/Applications/UZMAX智能运营/node_modules/prettier/bin/prettier.cjs --check docs/specs/M8-06-internal-live-bot-supervisor.md docs/evidence/M8/M8-06-internal-live-bot-supervisor.md packages/db/scripts/run-m8-internal-live-bot-supervisor.mjs scripts/tests/m8-internal-live-bot-supervisor.test.mjs package.json
```

Result: pass. `All matched files use Prettier code style!`

Command:

```bash
PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node /Users/atilla/Applications/UZMAX智能运营/node_modules/eslint/bin/eslint.js --config /Users/atilla/Applications/UZMAX智能运营/eslint.config.mjs packages/db/scripts/run-m8-internal-live-bot-supervisor.mjs scripts/tests/m8-internal-live-bot-supervisor.test.mjs
```

Result: pass.

Command:

```bash
PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node --check packages/db/scripts/run-m8-internal-live-bot-supervisor.mjs
```

Result: pass.

Command:

```bash
PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" env -u UZMAX_TELEGRAM_BOT_TOKEN -u TELEGRAM_TEST_BOT_TOKEN -u TELEGRAM_BOT_WEBHOOK_SECRET -u UZMAX_INTERNAL_TEST_WEBHOOK_URL -u UZMAX_TELEGRAM_BOT_CHANNEL_CONNECTION_ID -u UZMAX_TELEGRAM_BOT_ORG_ID -u UZMAX_TELEGRAM_BOT_TENANT_ID node packages/db/scripts/run-m8-internal-live-bot-supervisor.mjs
```

Result: expected fail-closed. The command reports missing env names and starts no live action. No token value is printed.

Command:

```bash
PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" TELEGRAM_TEST_BOT_TOKEN="[set from .env.local]" TELEGRAM_BOT_WEBHOOK_SECRET="[set from .env.local]" UZMAX_INTERNAL_TEST_WEBHOOK_URL="https://example.com/telegram/bot/webhook" UZMAX_TELEGRAM_BOT_CHANNEL_CONNECTION_ID="33333333-3333-4333-8333-333333333604" UZMAX_TELEGRAM_BOT_ORG_ID="11111111-1111-4111-8111-111111111604" UZMAX_TELEGRAM_BOT_TENANT_ID="22222222-2222-4222-8222-222222222604" UZMAX_WORKER_TELEGRAM_BOT_ANSWER_MODE="dry_run" node packages/db/scripts/run-m8-internal-live-bot-supervisor.mjs --check-telegram
```

Result: pass. Telegram returned:

```text
botId=8575860511
botUsername=uzmaxAdminBot
pendingUpdateCount=0
webhookUrl=https://uzmax-api-staging.onrender.com/telegram/bot/webhook
```

No token value was printed. This check used `getMe` and `getWebhookInfo`; it did not call `setWebhook`, did not send a message, and did not connect to the DB.

Staging API probes:

```bash
curl -fsS -m 60 https://uzmax-api-staging.onrender.com/healthz
curl -fsS -m 60 https://uzmax-api-staging.onrender.com/readyz
```

Result: pass. `/healthz` returned `{"service":"api","status":"ok"}`. `/readyz` returned `status=ready` with `authz=configured` and `identity=configured`.

Short 10-second probes to `/healthz` and `/readyz` initially timed out before the longer probes passed. Treat this as staging cold-start/latency evidence, not a failed readiness claim.

Command:

```bash
PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M8-06-internal-live-bot-supervisor.md
```

Result: pass after commit. `changedFiles=5`, `docs=2`, `config=1`, `source=1`, `test=1`, `source.changedFiles=1`, `source.netLoc=398`, `source.newFiles=1`.

Command:

```bash
PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node scripts/guards/doc-trigger-paths.mjs
```

Result: pass. `doc-trigger-paths: ok`.

Command:

```bash
git diff --check
```

Result: pass.

## Boundaries

- No live Telegram token value is committed or printed.
- No automatic `setWebhook`.
- No repo config switches worker answer mode to `live`.
- No real customer traffic, production deploy, GA-0 or 1.0 release claim.
- No real provider SDK, LLM key, customer-data LLM processing or cost-bearing call.
- No real LLM/provider call.
- No schema, migration, generated Prisma client, RLS policy, lockfile or CI workflow change.
- No admin UI redesign or visual/prototype work.

## Remaining Owner-Gated Live Steps

After this PR, an actual internal employee Bot run still requires explicit owner action/approval for:

1. Supplying trusted env values for Render/API/worker/test chat.
2. Deploying API and worker from `main`.
3. Running `smoke:m8-internal-live-bot --check-telegram`.
4. Running `smoke:m8-internal-live-bot --set-webhook` only when the webhook URL is approved.
5. Switching the approved test boundary to `UZMAX_WORKER_TELEGRAM_BOT_ANSWER_MODE=live`.
6. Having an employee send the test message to the Bot.
7. Running `smoke:m8-internal-live-bot --expect-live --verify-db` and recording whether outbound `SENT` or ticket path appeared.
