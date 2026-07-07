# M8-03 Runtime Active Answer Wiring Evidence

Status: `focused_runtime_wiring_validated_true_db_ci_pending`
Date: 2026-07-07

## Scope Closed

- `apps/worker/src/conversation-runtime.ts` now passes org/tenant/channel/chat context into the answer runtime and passes `runtimeOptions` from the BullMQ worker factory into the processor.
- `apps/worker/src/telegram-bot-active-answer-runtime.ts` resolves:
  - online `ai_member` by `memberKey`,
  - active `ai_member_version`,
  - enabled `ai_capability_toggle`,
  - PASSED `eval_gate`,
  - active `kb_entry` and active `kb_stage`.
- Active KB stage card data is read from bounded `kb_stage.material_refs` card fields and converted into the existing KB journey runtime.
- KB hit answers through existing KB capability and redline guard.
- KB miss enters existing mock/fail-closed LLM route and returns handoff.
- `apps/worker/src/telegram-bot-worker-service-runtime.ts` owns worker answer-mode config and outbound send mode:
  - default `disabled`,
  - internal `dry_run`,
  - explicit `live` using the existing Telegram Bot `sendMessage` adapter.
- `apps/worker/src/telegram-bot-conversation-persistence.ts` gives Bot runtime DB transactions explicit `maxWait`/`timeout` values so true DB worker smokes do not fail on default interactive transaction limits before runtime assertions complete.
- `apps/worker/src/worker-service-shell.ts` now wires runtime options into the real Telegram Bot conversation worker startup path.
- `packages/db/scripts/run-m8-active-answer-worker-true-db-smoke.mjs` keeps the CI entrypoint and `packages/db/scripts/tests/run-m8-active-answer-worker-true-db-smoke.mjs` covers webhook -> Redis -> worker service -> DB -> conversation-ticket API readback with synthetic rows only.
- `packages/db/scripts/run-m6b-webhook-worker-true-db-smoke.mjs` reuses the same worker runtime compiler so existing webhook-worker true DB smoke includes the new worker runtime helper module.
- CI includes `M8 active answer worker true DB smoke`.

## Local Validation

Command:

```bash
PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node --test scripts/tests/m8-active-answer-runtime-wiring.test.mjs
```

Result: pass. 4 tests, 0 failures.

Focused regression command:

```bash
PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node --test scripts/tests/m8-active-answer-runtime-wiring.test.mjs scripts/tests/m8-bot-runtime-answer-loop-v0.test.mjs scripts/tests/m8-db-backed-conversation-ticket-api.test.mjs scripts/tests/m6b-worker-telegram-consumer.test.mjs
```

Result: pass. 14 tests, 0 failures.

Command:

```bash
PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node node_modules/eslint/bin/eslint.js packages/db/scripts/run-m6b-webhook-worker-true-db-smoke.mjs packages/db/scripts/run-m8-active-answer-worker-true-db-smoke.mjs packages/db/scripts/tests/run-m8-active-answer-worker-true-db-smoke.mjs packages/db/scripts/tests/m8-active-answer-worker-smoke-support.mjs scripts/tests/m6b-worker-telegram-consumer.test.mjs scripts/tests/m8-active-answer-runtime-wiring.test.mjs scripts/tests/m8-bot-runtime-answer-loop-support.mjs apps/worker/src/telegram-bot-worker-service-runtime.ts apps/worker/src/telegram-bot-active-answer-runtime.ts apps/worker/src/worker-service-shell.ts apps/worker/src/conversation-runtime.ts apps/worker/src/telegram-bot-conversation-persistence.ts apps/worker/src/telegram-bot-answer-runtime.ts
```

Result: pass.

Command:

```bash
PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json
```

Result: pass.

Command:

```bash
PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node node_modules/prettier/bin/prettier.cjs --check .
```

Result: pass. `All matched files use Prettier code style!`

Command:

```bash
export PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH"
node --check packages/db/scripts/run-m6b-webhook-worker-true-db-smoke.mjs
node --check packages/db/scripts/run-m8-active-answer-worker-true-db-smoke.mjs
node --check packages/db/scripts/tests/run-m8-active-answer-worker-true-db-smoke.mjs
node --check packages/db/scripts/tests/m8-active-answer-worker-smoke-support.mjs
```

Result: pass.

Command:

```bash
PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node node_modules/jscpd/run-jscpd.js apps packages scripts --config jscpd.config.json --workers 1 --no-tips
```

Result: pass. `Found 0 clones.`

Command:

```bash
PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M8-03-runtime-active-answer-wiring.md --include-worktree
```

Result: pass. `changedFiles=16`, categories `config=1/source=8/test=5/docs=2`, source `changedFiles=8/netLoc=487/newFiles=3`.

Command:

```bash
git diff --check
```

Result: pass.

Local true DB/Redis availability check:

```bash
if [ -n "$UZMAX_RLS_DATABASE_URL" ]; then echo has_rls_db; else echo missing_rls_db; fi
if [ -n "$UZMAX_REDIS_URL" ]; then echo has_redis; else echo missing_redis; fi
```

Result:

```text
missing_rls_db
missing_redis
```

Local true DB smoke was not run because the local shell lacks both `UZMAX_RLS_DATABASE_URL` and `UZMAX_REDIS_URL`. The script is wired into CI so PR validation can run with repository secrets and a Redis container.

## Covered Behaviors

| Behavior | Evidence |
|---|---|
| Active persona and KB answer | Focused fake-Prisma test returns `status: answered` and `Use active KB answer.` only when AI member is online, version active, eval gate PASSED, capability enabled and KB stage active. |
| KB miss fail-closed | Focused fake-Prisma test returns `llm_answer_unavailable` with `suppressOutbound: true`. |
| Gate/capability safety | Focused fake-Prisma test returns `persona_eval_gate_not_passed` and `capability_disabled` for unsafe runtime state. |
| Real worker startup hook | Textual test asserts worker shell calls `createTelegramBotConversationRuntimeOptions` and conversation worker processor receives `options`. |
| CI true DB hook | Textual test asserts `.github/workflows/ci.yml` contains `M8 active answer worker true DB smoke` and the new smoke script path. |

## Boundaries

- No live Telegram token, `setWebhook`, real network call, real customer traffic or production deploy.
- No real provider SDK, LLM key, customer-data LLM processing or cost-bearing call.
- No schema, migration, generated Prisma client, RLS policy or lockfile changes.
- No admin UI redesign or visual/prototype work.
- Current closure is internal/test-bot runtime wiring. Owner still needs to approve and provide live credentials before any live Bot/customer rollout.
