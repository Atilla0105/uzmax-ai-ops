# M8-01 Bot Runtime Answer Loop v0

Spec ID: M8-01
Status: `bot_runtime_answer_loop_v0_in_progress`
Owner confirmation point: project owner requested moving from framework/doc churn into a usable Bot closed loop. Project owner still decides real Telegram bot token activation, real customer traffic, real LLM/provider keys, cost, compliance, staging/production deploy, GA-0 and 1.0 release.
Timebox: narrow implementation PR.

## Spec 类型

feature

## Goal

Build the first Bot runtime answer loop from the code that already exists:

1. Telegram Bot text update enters the existing webhook/queue/worker path.
2. Worker keeps existing DB-backed dedupe and inbound message persistence.
3. Worker resolves answer-or-handoff: deterministic KB hit first; if KB does not answer, LLM route stays mock/fail-closed until owner approves real provider/key/cost/customer-data boundary.
4. Output passes the existing redline guard before any outbound send.
5. Safe output is sent through a Telegram Bot `sendMessage` adapter interface and persisted as an outbound message.
6. Unsafe, missing, ambiguous, failed or non-text input stays on the existing ticket/handoff path.

This is an implementation slice. It does not reopen UI migration or create another governance/report-only loop.

## Current Repo Facts

- `apps/api/src/telegram-bot.ts` already normalizes webhook payloads and can enqueue Bot conversation jobs.
- `apps/worker/src/conversation-runtime.ts` already consumes Bot conversation jobs, dedupes by provider update id and persists conversation/message/ticket rows.
- The current worker path is handoff-only.
- `packages/capabilities/kb/src/index.ts` already selects bounded KB stage cards or fail-closed clarification/handoff results.
- `packages/llm-gateway/src/index.ts` already exposes `kb_answer`, deterministic mock provider routing and accounting drafts.
- `packages/engine/src/index.ts` already exposes redline output guard.
- `packages/db/prisma/schema.prisma` already has conversation/message/ticket, `kb_entry`/`kb_stage`, `ai_member`/`ai_member_version`, eval gate and `llm_call_log` tables.
- DB-backed admin readback is a separate missing link and is tracked as M8-02 so this PR does not become an oversized mixed change.

## Scope

- Add shared Telegram Bot outbound `sendMessage` request/result contracts and an injectable adapter seam in the existing channels package.
- Add worker answer-or-handoff orchestration in `apps/worker/src/conversation-runtime.ts`.
- Preserve current handoff/ticket behavior as the default and fail-closed branch.
- For deterministic KB hits, answer without entering LLM route.
- For KB misses, preserve mock/fail-closed LLM route behavior only. Real provider activation is owner-gated.
- For safe text answers, persist inbound + outbound messages and do not create a ticket.
- For failed/unsafe/non-text decisions, persist inbound + support ticket/event using existing behavior.
- Add focused tests proving happy-path answer, duplicate no resend, non-text handoff, KB miss/provider fail-closed and redline suppression.
- Add evidence and the required incident record for the root/main patch target error discovered during this slice.

## Out Of Scope

- DB-backed conversation-ticket API migration. This is M8-02 and may run in a separate worktree/PR.
- Production Bot token activation, `setWebhook`, live customer traffic, staging/production deploy or release approval.
- Real LLM provider SDK/key/cost-bearing call. The adapter seam can exist; provider activation cannot.
- DB schema, migration, generated Prisma client, RLS policy or lockfile changes.
- Admin UI redesign, Telegram Business auto-reply, Business draft-send reopening, knowledge publish/import automation or distill workflow changes.

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：

  - `docs/specs/M8-01-bot-runtime-answer-loop-v0.md`
  - `docs/evidence/M8/M8-01-bot-runtime-answer-loop-v0.md`
  - `docs/incidents/INC-2026-07-07-m8-01-root-patch-target.md`
  - `packages/channels/src/index.ts`
  - `apps/worker/src/conversation-runtime.ts`
  - `apps/worker/src/telegram-bot-answer-runtime.ts`
  - `apps/worker/src/telegram-bot-conversation-persistence.ts`
  - `apps/worker/src/worker-service-shell.ts`
  - `packages/db/scripts/run-m6b-conversation-runtime-true-db-smoke.mjs`
  - `packages/db/scripts/run-m6b-webhook-worker-true-db-smoke.mjs`
  - `scripts/tests/m8-bot-runtime-answer-loop-support.mjs`
  - `scripts/tests/m8-bot-runtime-answer-loop-v0.test.mjs`

Read-only anchors:

- `AGENTS.md`
- `UZMAX智能运营系统-PRD-v1.1.md`
- `UZMAX智能运营系统-技术架构-v1.1.md`
- `UZMAX智能运营系统-后台设计与前端架构-v1.1.md`
- `UZMAX智能运营系统-1.0验收矩阵-v1.1.md`
- `docs/specs/M6B-05a-conversation-runtime-build.md`
- `docs/specs/M3-02-llm-gateway-routing-accounting-foundation.md`
- `docs/specs/M3-04-kb-journey-capability-foundation.md`
- `packages/llm-gateway/src/index.ts`
- `packages/capabilities/kb/src/index.ts`
- `packages/engine/src/index.ts`
- `packages/db/prisma/schema.prisma`

## Change Budget

- Source: up to 7 changed/new files, net source LOC target <= 600.
- Test: up to 2 new focused test/support files.
- Docs/evidence/incident: this spec, one evidence file, one incident file.
- Generated, migration, schema, lock, CI/config: none.
- Exceptions: none.

## Acceptance

- Focused test proves a text Bot job with synthetic KB/persona dependencies returns `status: accepted`, `runtimeBranch: answer`, persists one inbound and one outbound message, calls the send adapter once and creates no ticket.
- Focused test proves deterministic KB hit answers before LLM route.
- Focused test proves KB miss with mock/failing LLM route goes to handoff without outbound send.
- Focused test proves duplicate provider update id remains deduped and does not call the send adapter a second time.
- Focused test proves non-text messages stay on existing handoff/ticket path.
- Focused test proves redline-suppressed output returns handoff/ticket and suppresses outbound send.
- Existing M6B conversation-runtime focused test continues to pass.
- Evidence states this is internal/test-bot-ready runtime closure, not production/customer-LLM/live customer approval.

## Failure Branches

- If answer path requires schema/migration/generated Prisma changes, stop and split a DB-serial spec.
- If real Telegram live send needs token/customer traffic to pass, keep tests synthetic and record owner-gated live validation.
- If real provider SDK/key or customer LLM is needed, keep deterministic mock/fail-closed and split an owner-approved provider spec.
- If admin DB readback blocks end-to-end internal use, implement it under M8-02 instead of expanding this PR.
- If any write occurs outside the assigned worktree or on root/main, stop and record an incident before continuing.

## Start Audit

| Fact | Evidence |
|---|---|
| assigned worktree `pwd` | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-bot-runtime-answer-loop-v0` |
| assigned status before edits | `## codex/bot-runtime-answer-loop-v0` |
| assigned branch | `codex/bot-runtime-answer-loop-v0` |
| root/main status before worktree creation | `## main...origin/main` |
| root no-merged branch audit before edits | no output |
| open PR audit before edits | `[]` |

## Validation

Required focused validation:

- `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" pnpm run lint -- apps/worker/src/conversation-runtime.ts apps/worker/src/telegram-bot-answer-runtime.ts apps/worker/src/telegram-bot-conversation-persistence.ts apps/worker/src/worker-service-shell.ts packages/channels/src/index.ts scripts/tests/m8-bot-runtime-answer-loop-v0.test.mjs scripts/tests/m8-bot-runtime-answer-loop-support.mjs`
- `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node --test scripts/tests/m8-bot-runtime-answer-loop-v0.test.mjs scripts/tests/m6b-conversation-runtime.test.mjs scripts/tests/m6b-worker-telegram-consumer.test.mjs scripts/tests/m3-kb-journey-capability-foundation.test.mjs scripts/tests/m3-llm-gateway-routing-accounting-foundation.test.mjs scripts/tests/m3-breaker-radius-redline-output-guard.test.mjs`
- `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M8-01-bot-runtime-answer-loop-v0.md --include-worktree`
- `git diff --check`
