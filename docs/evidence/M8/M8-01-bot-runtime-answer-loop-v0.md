# M8-01 Bot Runtime Answer Loop v0 Evidence

Status: `focused_runtime_answer_loop_validated_not_ga0`
Date: 2026-07-07

## Scope Closed

- Added a shared Telegram Bot outbound send request/result contract in `packages/channels/src/index.ts`; focused tests use a local dry-run send port.
- Added an injected Telegram Bot `sendMessage` adapter seam that builds `POST /bot<token>/sendMessage` requests with JSON `chat_id`, `text` and optional `reply_parameters`; focused tests use a fake transport, not a real network call.
- Extended `apps/worker/src/conversation-runtime.ts` with optional injected `answerRuntime` and `sendPort`.
- Split answer orchestration and Prisma persistence helpers into `apps/worker/src/telegram-bot-answer-runtime.ts` and `apps/worker/src/telegram-bot-conversation-persistence.ts` so the runtime file stays within project lint limits.
- Preserved default no-dependency behavior as M6B handoff-only runtime.
- Added answer branch reserve-dedupe before answer/send side effects.
- Successful deterministic KB text answer branch persists inbound safe metadata plus outbound answer message, keeps conversation `OPEN`, and creates no support ticket.
- KB miss enters the LLM route seam, but remains fail-closed until real provider/key/cost/customer-data boundaries are owner-approved.
- Non-text, ambiguous KB, unsafe, missing or failing answer decisions fail closed to existing handoff/ticket path and suppress outbound.
- Recorded `docs/incidents/INC-2026-07-07-m8-01-root-patch-target.md` for the root/main patch-target error discovered during this slice.

## Validation

Command:

```bash
PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" pnpm run lint -- apps/worker/src/conversation-runtime.ts apps/worker/src/telegram-bot-answer-runtime.ts apps/worker/src/telegram-bot-conversation-persistence.ts apps/worker/src/worker-service-shell.ts packages/channels/src/index.ts scripts/tests/m8-bot-runtime-answer-loop-v0.test.mjs scripts/tests/m8-bot-runtime-answer-loop-support.mjs
```

Result: pass.

Command:

```bash
PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node --test scripts/tests/m8-bot-runtime-answer-loop-v0.test.mjs scripts/tests/m6b-conversation-runtime.test.mjs scripts/tests/m6b-worker-telegram-consumer.test.mjs scripts/tests/m3-kb-journey-capability-foundation.test.mjs scripts/tests/m3-llm-gateway-routing-accounting-foundation.test.mjs scripts/tests/m3-breaker-radius-redline-output-guard.test.mjs
```

Result: pass. 41 tests, 0 failures.

Command:

```bash
PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M8-01-bot-runtime-answer-loop-v0.md --include-worktree
```

Result: pass. `changedFiles=10`, source `changedFiles=5`, source `netLoc=599`, source `newFiles=2`, categories `source=5/docs=3/test=2`.

Command:

```bash
git diff --check
```

Result: pass.

## Covered Behaviors

| Behavior | Evidence |
|---|---|
| sendMessage adapter | Fake transport confirms the adapter builds `https://api.telegram.org/bot<token>/sendMessage` request shape and maps Telegram `message_id` to `telegram:message:<id>`. |
| Happy text answer | Synthetic text update uses real KB foundation and redline guard through injected runtime; deterministic KB hit does not call LLM; fake dry-run send called once; fake persistence records inbound + outbound and no ticket. |
| Duplicate update | Second processing of the same provider update id is deduped before answer/send; answer runtime and send port remain called once. |
| Non-text handoff | Synthetic image update does not call answer runtime or send port; handoff ticket path is used. |
| Fail closed | Missing KB, KB miss with unavailable real answer, KB ambiguous, missing persona, provider failure, redline suppression and thrown answer runtime all persist handoff/ticket and suppress outbound. |
| M6B compatibility | Existing `scripts/tests/m6b-conversation-runtime.test.mjs` passes with no answer/send dependency injection. |

## Boundaries

- No live Telegram token, `setWebhook`, webhook secret or real network call. `sendMessage` adapter code exists but focused validation uses fake transport only.
- No real customer/order data, raw Telegram payload file, screenshot, voice transcript or support personal account.
- No real provider SDK, LLM key, customer LLM, prompt/model/persona release or cost-bearing call.
- No DB schema, migration, generated Prisma client, RLS policy, lockfile, admin UI, staging/production deploy, GA-0 or 1.0 release approval.
- The focused tests use synthetic data, fake persistence gateway, fake transport and fake dry-run send port only.

## External API Basis

- Telegram Bot API official documentation says Bot API requests use `https://api.telegram.org/bot<token>/METHOD_NAME`, support POST with `application/json`, and `sendMessage` requires `chat_id` and `text` and returns the sent Message on success: `https://core.telegram.org/bots/api#sendmessage`.

## Notes

- Root/main patch-target error was cleaned and recorded in `docs/incidents/INC-2026-07-07-m8-01-root-patch-target.md`.
- M8-02 owns DB-backed conversation-ticket API readback so this PR remains focused on worker runtime/outbound answer behavior.
