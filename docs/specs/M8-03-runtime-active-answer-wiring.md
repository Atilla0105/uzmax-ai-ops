# M8-03 Runtime Active Answer Wiring

Spec ID: M8-03
Status: `runtime_active_answer_wiring_in_progress`
Owner confirmation point: project owner asked to stop drifting in docs/governance and make the existing Bot plus backend path usable for internal staff. Owner still decides real Telegram token activation, webhook cutover, real customer traffic, real provider keys, LLM cost, production deploy and release.
Timebox: narrow implementation PR.

## Spec 类型

feature

## Goal

Close the first internal Bot runtime loop using the code that already exists:

1. Telegram Bot webhook enters the existing queue and worker service.
2. Worker service can explicitly enable answer mode through env config.
3. Answer mode resolves the active AI member/persona version, eval gate, capability toggle and active KB stage from DB under tenant RLS.
4. Deterministic KB hit answers first, then passes the existing redline guard.
5. Safe answer sends through Telegram Bot outbound seam; internal smoke uses dry-run send.
6. KB miss, missing persona, failed eval gate, disabled capability, unsafe answer or runtime error fail closed to ticket/handoff.
7. Backend conversation-ticket readback sees the worker-written conversation, inbound/outbound messages and handoff ticket.

This is runtime wiring for internal test-bot readiness. It is not GA, not production live traffic and not a new governance cycle.

## Current Repo Facts

- M8-01 added `answerRuntime` and `sendPort` seams in `apps/worker/src/conversation-runtime.ts`.
- M8-01 focused tests proved answer-or-handoff behavior, but `apps/worker/src/worker-service-shell.ts` did not wire the answer runtime into real worker startup.
- M8-02 added DB-backed conversation-ticket API readback, but M8-01 worker service still needed active persona/KB resolver wiring.
- `packages/capabilities/kb/src/index.ts` already selects bounded active stage cards.
- `packages/engine/src/index.ts` already exposes redline output guard.
- `packages/llm-gateway/src/index.ts` already exposes mock/fail-closed `kb_answer` route behavior.
- `packages/db/prisma/schema.prisma` already has `ai_member`, `ai_member_version`, `ai_capability_toggle`, `eval_gate`, `kb_entry`, `kb_stage`, `conversation`, `message`, `ticket` and `telegram_update_dedupe`.

## Scope

- Pass Bot job org/tenant/channel/chat context into the answer runtime.
- Add DB-backed active answer runtime resolver in `apps/worker`.
- Add worker service env switches:
  - `UZMAX_WORKER_TELEGRAM_BOT_ANSWER_MODE=disabled|dry_run|live`
  - `UZMAX_WORKER_TELEGRAM_BOT_AI_MEMBER_KEY`
  - `UZMAX_WORKER_TELEGRAM_BOT_KB_ENTRY_KEY`
  - optional locale and required capability key.
- Keep default answer mode disabled.
- Keep `dry_run` outbound for internal smoke without Telegram network or token.
- Use live `sendMessage` adapter only when explicitly configured with token.
- Add focused fake-Prisma tests for active member/gate/capability/KB resolver behavior.
- Add true DB smoke script and CI step covering webhook -> Redis -> worker service -> DB -> conversation-ticket API readback.

## Out Of Scope

- Real Telegram token, `setWebhook`, live customer traffic, staging/production deploy, GA-0 or 1.0 approval.
- Real LLM provider SDK/key/cost-bearing call or customer-data LLM processing.
- DB schema, migration, generated Prisma client, RLS policy or lockfile changes.
- Admin UI redesign, prototype parity or new page work.
- Knowledge import/publish automation or distill confirmation workflow changes.

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：

  - `.github/workflows/ci.yml`
  - `docs/specs/M8-03-runtime-active-answer-wiring.md`
  - `docs/evidence/M8/M8-03-runtime-active-answer-wiring.md`
  - `apps/worker/src/conversation-runtime.ts`
  - `apps/worker/src/telegram-bot-conversation-persistence.ts`
  - `apps/worker/src/telegram-bot-answer-runtime.ts`
  - `apps/worker/src/telegram-bot-active-answer-runtime.ts`
  - `apps/worker/src/telegram-bot-worker-service-runtime.ts`
  - `apps/worker/src/worker-service-shell.ts`
  - `packages/db/scripts/run-m6b-webhook-worker-true-db-smoke.mjs`
  - `packages/db/scripts/run-m8-active-answer-worker-true-db-smoke.mjs`
  - `packages/db/scripts/tests/run-m8-active-answer-worker-true-db-smoke.mjs`
  - `packages/db/scripts/tests/m8-active-answer-worker-smoke-support.mjs`
  - `scripts/tests/m6b-worker-telegram-consumer.test.mjs`
  - `scripts/tests/m8-active-answer-runtime-wiring.test.mjs`
  - `scripts/tests/m8-bot-runtime-answer-loop-support.mjs`

Read-only anchors:

- `AGENTS.md`
- `UZMAX智能运营系统-PRD-v1.1.md`
- `UZMAX智能运营系统-技术架构-v1.1.md`
- `UZMAX智能运营系统-后台设计与前端架构-v1.1.md`
- `UZMAX智能运营系统-1.0验收矩阵-v1.1.md`
- `docs/specs/M8-01-bot-runtime-answer-loop-v0.md`
- `docs/specs/M8-02-db-backed-conversation-ticket-api.md`
- `packages/db/prisma/schema.prisma`
- `apps/api/src/conversation-ticket.repository.ts`
- `apps/api/src/conversation-ticket.service.ts`

## Change Budget

- Source: up to 8 changed/new source files, net source LOC target <= 600.
- Test/smoke: up to 5 focused test, support or smoke files.
- Docs/evidence: this spec plus one evidence file.
- Config: CI may add one true DB smoke step.
- Generated, migration, schema, lock: none.
- Exceptions: none.

## Acceptance

- Focused test proves online AI member + active version + PASSED eval gate + enabled capability + active KB stage card returns answered text.
- Focused test proves KB miss enters fail-closed LLM route and returns handoff without direct outbound answer.
- Focused test proves failed eval gate and disabled capability return handoff reasons.
- Worker service shell passes runtime options into the actual Telegram Bot conversation BullMQ worker.
- Worker answer mode remains disabled by default.
- `dry_run` answer mode returns a `SENT` outbound result without Telegram network or token.
- True DB smoke script seeds synthetic active persona/KB, runs webhook -> Redis -> worker service, verifies one dry-run outbound answer, one handoff ticket, tenant isolation and conversation-ticket API readback.
- CI runs the M8 true DB smoke when true DB smoke path scope is active.

## Failure Branches

- If active answer resolver needs schema/RLS/generated changes, stop and split a DB-serial spec.
- If real Telegram network/token is required for validation, keep dry-run smoke and record owner-gated live validation.
- If real LLM/provider is required, keep mock/fail-closed behavior and split an owner-approved provider spec.
- If true DB secrets/Redis are unavailable locally, do not fake pass; record local blocker and rely on CI step for remote true DB execution.

## Start Audit

| Fact | Evidence |
|---|---|
| root checkout before worktree | `/Users/atilla/Applications/UZMAX智能运营` on `main`, clean against origin/main |
| no-merged branch audit before work | no unmerged branches |
| open PR audit before work | `[]` |
| assigned worktree | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m8-03-runtime-active-answer-wiring` |
| assigned branch | `codex/m8-03-runtime-active-answer-wiring` |
| assigned status before edits | `## codex/m8-03-runtime-active-answer-wiring...origin/main` |

## Validation

Required focused validation:

- `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node --test scripts/tests/m8-active-answer-runtime-wiring.test.mjs`
- `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node node_modules/eslint/bin/eslint.js packages/db/scripts/run-m6b-webhook-worker-true-db-smoke.mjs packages/db/scripts/run-m8-active-answer-worker-true-db-smoke.mjs packages/db/scripts/tests/run-m8-active-answer-worker-true-db-smoke.mjs packages/db/scripts/tests/m8-active-answer-worker-smoke-support.mjs scripts/tests/m8-active-answer-runtime-wiring.test.mjs apps/worker/src/telegram-bot-worker-service-runtime.ts apps/worker/src/telegram-bot-active-answer-runtime.ts apps/worker/src/worker-service-shell.ts apps/worker/src/conversation-runtime.ts apps/worker/src/telegram-bot-conversation-persistence.ts apps/worker/src/telegram-bot-answer-runtime.ts`
- `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node --check packages/db/scripts/run-m6b-webhook-worker-true-db-smoke.mjs packages/db/scripts/run-m8-active-answer-worker-true-db-smoke.mjs packages/db/scripts/tests/run-m8-active-answer-worker-true-db-smoke.mjs`
- `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M8-03-runtime-active-answer-wiring.md --include-worktree`
- `git diff --check`
