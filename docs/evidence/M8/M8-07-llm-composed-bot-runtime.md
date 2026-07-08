# M8-07 LLM Composed Bot Runtime Evidence

Status: `local_validation_passed`
Date: 2026-07-08

## Scope Proven

- KB hit no longer sends the raw deterministic KB card as customer-visible text; it calls the LLM route and sends the LLM-composed output after redline guard.
- KB miss and KB ambiguous states send an LLM-composed customer reply and also persist a support ticket/event as the follow-up knowledge-gap signal.
- Provider failure, missing persona, failed gate, disabled capability, redline suppression and runtime exception still suppress outbound and persist handoff-only.
- Active DB-backed runtime resolves active persona/KB/gate/capability and returns LLM-composed text in tests.
- DeepSeek provider seam builds the official chat-completion request shape and extracts `choices[0].message.content` through a mocked transport.

## Validation

Command:

```bash
PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node --test scripts/tests/m6b-conversation-runtime.test.mjs scripts/tests/m6b-equivalent-bot-webhook-drive.test.mjs scripts/tests/m8-bot-runtime-answer-loop-v0.test.mjs scripts/tests/m8-active-answer-runtime-wiring.test.mjs scripts/tests/m3-llm-gateway-routing-accounting-foundation.test.mjs scripts/tests/m8-llm-gateway-deepseek-provider.test.mjs
```

Result: pass. `tests=25`, `pass=25`, `fail=0`.

Command:

```bash
PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node node_modules/eslint/bin/eslint.js packages/llm-gateway/src/index.ts packages/llm-gateway/src/deepseek-provider.ts packages/llm-gateway/src/mock-provider.ts apps/worker/src/telegram-bot-answer-runtime.ts apps/worker/src/conversation-runtime.ts apps/worker/src/telegram-bot-ticket-follow-up.ts apps/worker/src/telegram-bot-conversation-persistence.ts apps/worker/src/telegram-bot-active-answer-runtime.ts apps/worker/src/telegram-bot-worker-service-runtime.ts apps/worker/src/worker-service-shell.ts packages/db/scripts/run-m6b-conversation-runtime-true-db-smoke.mjs packages/db/scripts/tests/m8-active-answer-worker-smoke-support.mjs packages/db/scripts/tests/run-m8-active-answer-worker-true-db-smoke.mjs scripts/tests/m6b-conversation-runtime.test.mjs scripts/tests/m6b-equivalent-bot-webhook-drive.test.mjs scripts/tests/m8-bot-runtime-answer-loop-support.mjs scripts/tests/m8-bot-runtime-answer-loop-v0.test.mjs scripts/tests/m8-active-answer-runtime-wiring.test.mjs scripts/tests/m3-llm-gateway-routing-accounting-foundation.test.mjs scripts/tests/m8-llm-gateway-deepseek-provider.test.mjs
```

Result: pass.

Command:

```bash
PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json --pretty false
```

Result: pass after worktree-local dependency install and `prisma generate`. No source, lockfile or package manifest change was made by that setup.

Command:

```bash
PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node node_modules/jscpd/run-jscpd.js apps packages scripts --config jscpd.config.json --workers 1 --no-tips
```

Result: pass. `Found 0 clones`.

Command:

```bash
PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M8-07-llm-composed-bot-runtime.md --include-worktree
```

Result: pass. `changedFiles=22`, `source=11`, `docs=2`, `test=9`, `netLoc=488`, `newFiles=3`.

Command:

```bash
PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node node_modules/prettier/bin/prettier.cjs --check docs/specs/M8-07-llm-composed-bot-runtime.md docs/evidence/M8/M8-07-llm-composed-bot-runtime.md packages/llm-gateway/src/index.ts packages/llm-gateway/src/deepseek-provider.ts packages/llm-gateway/src/mock-provider.ts apps/worker/src/telegram-bot-answer-runtime.ts apps/worker/src/conversation-runtime.ts apps/worker/src/telegram-bot-ticket-follow-up.ts apps/worker/src/telegram-bot-conversation-persistence.ts apps/worker/src/telegram-bot-active-answer-runtime.ts apps/worker/src/telegram-bot-worker-service-runtime.ts apps/worker/src/worker-service-shell.ts packages/db/scripts/run-m6b-conversation-runtime-true-db-smoke.mjs packages/db/scripts/tests/m8-active-answer-worker-smoke-support.mjs packages/db/scripts/tests/run-m8-active-answer-worker-true-db-smoke.mjs scripts/tests/m6b-conversation-runtime.test.mjs scripts/tests/m6b-equivalent-bot-webhook-drive.test.mjs scripts/tests/m8-bot-runtime-answer-loop-support.mjs scripts/tests/m8-bot-runtime-answer-loop-v0.test.mjs scripts/tests/m8-active-answer-runtime-wiring.test.mjs scripts/tests/m3-llm-gateway-routing-accounting-foundation.test.mjs scripts/tests/m8-llm-gateway-deepseek-provider.test.mjs
```

Result: pass.

Command:

```bash
git diff --check
```

Result: pass.

## External API Basis

- DeepSeek official docs checked on 2026-07-08: `base_url=https://api.deepseek.com`, current models `deepseek-v4-flash` / `deepseek-v4-pro`, and `deepseek-chat` / `deepseek-reasoner` deprecation on 2026-07-24 15:59 UTC.
- DeepSeek official Create Chat Completion docs: `POST /chat/completions`, required `messages`, required `model`, response `choices[].message.content`, and `thinking.type=enabled|disabled`.

## Boundaries

- No real DeepSeek network call was made by tests.
- No secret value was printed or committed.
- No schema, migration, generated Prisma client, lockfile or package manifest change.
- No direct realtime write to confirmation/distill/formal KB tables; KB gaps are represented as existing support ticket/event follow-up.
- No production deploy, real customer traffic, GA or release approval claim.
