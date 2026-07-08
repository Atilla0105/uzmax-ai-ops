# M8-08 Staging Runtime Closeout Evidence

Spec: `docs/specs/M8-08-staging-runtime-closeout.md`
Branch: `codex/m8-08-staging-runtime-closeout`
Worktree: `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m8-08-staging-runtime-closeout`

## Staging Runtime Baseline

- API live deploy before closeout: `dep-d978i5hkh4rs73e1nfr0`, commit `8db04e1a491145dd331616a8866f1f192877ca00`, status `live`.
- Worker live deploy before closeout: `dep-d978i5m8bjmc73bbqubg`, commit `8db04e1a491145dd331616a8866f1f192877ca00`, status `live`.
- API health: `{"service":"api","status":"ok"}`.
- API ready: `{"service":"api","status":"ready"}` with configured authz/database/identity contract checks.
- Worker direct env keys were present on Render without printing secret values:
  - `UZMAX_WORKER_TELEGRAM_BOT_ANSWER_MODE=live`
  - `UZMAX_WORKER_TELEGRAM_BOT_LLM_PROVIDER=deepseek`
  - `UZMAX_WORKER_DEEPSEEK_MODEL=deepseek-v4-flash`
  - `UZMAXADMIN_DEEPSEEK_KEY` present as a secret value.

## Live Internal Bot Readback

Internal synthetic Telegram webhook update `1783532143252` was accepted by staging API:

```json
{
  "ok": true,
  "contentKind": "text",
  "providerUpdateId": "1783532143252",
  "status": "accepted",
  "updateKind": "message"
}
```

DB readback for the same update:

```json
{
  "providerUpdateId": "1783532143252",
  "processedAt": "2026-07-08T17:36:03.468Z",
  "conversationId": "11da9e16-af6d-476c-a7b6-b74a04ff6812",
  "externalConversationRef": "telegram:chat:6840038459",
  "conversationStatus": "open",
  "matchingInboundMessages": 1,
  "recentSentOutboundMessages": 1,
  "recentOpenTickets": 0,
  "latestOutboundText": "Hello! Welcome to Laylak Cargo. What are you planning to ship, and is speed, price, or cargo size more important for you?"
}
```

Worker log for the same update showed `runtimeBranch:"answer"`, `status:"accepted"`, and an `outboundMessageId`.

## Closeout Changes

- `render.yaml` now declares the non-secret worker runtime keys that match the staging closed loop.
- `packages/db/scripts/run-m8-internal-live-bot-supervisor.mjs` now uses mapped Postgres enum values in raw SQL DB verification.
- `scripts/tests/m8-internal-live-bot-supervisor.test.mjs` guards against regressing the raw SQL enum literals.
- `scripts/tests/m8-db-backed-conversation-ticket-api.test.mjs` now expects the Render worker to be `live` with the DeepSeek provider and no longer accepts the superseded `dry_run` answer mode.

## Validation

- `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node --test scripts/tests/m8-internal-live-bot-supervisor.test.mjs scripts/tests/m8-db-backed-conversation-ticket-api.test.mjs`
  - Result: pass, 9/9 tests.
- `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node node_modules/eslint/bin/eslint.js packages/db/scripts/run-m8-internal-live-bot-supervisor.mjs scripts/tests/m8-internal-live-bot-supervisor.test.mjs scripts/tests/m8-db-backed-conversation-ticket-api.test.mjs`
  - Result: pass.
- `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node node_modules/prettier/bin/prettier.cjs --check docs/specs/M8-08-staging-runtime-closeout.md docs/evidence/M8/M8-08-staging-runtime-closeout.md render.yaml packages/db/scripts/run-m8-internal-live-bot-supervisor.mjs scripts/tests/m8-internal-live-bot-supervisor.test.mjs scripts/tests/m8-db-backed-conversation-ticket-api.test.mjs`
  - Result: pass.
- `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M8-08-staging-runtime-closeout.md --include-worktree`
  - Result: pass. `changedFiles=6`, categories `source=1`, `config=1`, `test=2`, `docs=2`, source `netLoc=0`.
- `git diff --check`
  - Result: pass.
