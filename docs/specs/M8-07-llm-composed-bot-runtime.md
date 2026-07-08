# M8-07 LLM Composed Bot Runtime

Spec ID: M8-07
Status: `local_validation_passed`
Owner confirmation point: project owner clarified that UZMAX is an AI customer-service platform: customer-visible Bot text must be composed by the LLM using the active persona and active KB/facts. KB misses must not stay silent; they must receive an in-persona reply and leave a real follow-up/knowledge-gap record. Owner still decides production traffic, third-party LLM data policy, provider cost, GA and release.
Timebox: narrow runtime correction PR.

## Spec 类型

feature

## Goal

Correct the existing M8 Telegram Bot runtime loop so it behaves like the intended AI customer-service product instead of the current deterministic-answer-or-silent-handoff split:

1. Text inbound still resolves active AI member/persona, eval gate, capability and active KB under tenant RLS.
2. KB hit is evidence/context for the LLM, not the final customer-visible text.
3. KB miss/ambiguous/unsupported knowledge state still produces a short LLM-composed customer reply in the active persona.
4. KB gap replies also create a support ticket/event so the admin/human path has a real follow-up and future knowledge-backlog signal.
5. Only missing persona, failed eval gate, disabled capability, redline suppression, provider failure, runtime exception or send failure may suppress outbound and leave handoff-only.
6. DeepSeek provider support is available behind explicit env/config and key input; default local/test runtime remains deterministic mock.

This is a correction on the current M8 runtime. It is not a new project, not an admin UI redesign and not a schema migration.

## Current Repo Facts

- `apps/worker/src/telegram-bot-answer-runtime.ts` currently returns the KB stage card directly on `stage_card` and does not call the LLM.
- The same runtime currently converts KB miss/ambiguous states into handoff-only, suppressing outbound text.
- `apps/worker/src/conversation-runtime.ts` can persist either `runtimeBranch="answer"` or `runtimeBranch="handoff"`; it cannot yet represent "answered and also needs follow-up".
- `apps/worker/src/telegram-bot-conversation-persistence.ts` only creates a support ticket on the handoff branch.
- `packages/llm-gateway/src/index.ts` currently returns route status/accounting only; provider output text is not exposed to the worker runtime.
- `apps/worker/src/telegram-bot-active-answer-runtime.ts` wires only the mock provider.
- `packages/db/prisma/schema.prisma` already has support tickets/events and confirmation/distill tables; this PR will not add schema or direct formal KB writes.

## External API Basis

- DeepSeek official "Your First API Call" documents OpenAI-compatible `base_url=https://api.deepseek.com` and current models `deepseek-v4-flash` / `deepseek-v4-pro`; `deepseek-chat` and `deepseek-reasoner` are deprecated on 2026-07-24 15:59 UTC.
- DeepSeek official "Create Chat Completion" documents `POST /chat/completions`, required `messages`, required `model`, response `choices[].message.content`, and `thinking.type=enabled|disabled`.
- M8-07 uses `deepseek-v4-flash` by default with non-thinking mode for fast customer-service replies.

## Scope

- Update answer runtime so customer-visible text is always LLM-composed when provider succeeds.
- Add bounded prompt/context construction from active persona ref, active KB result, controlled material refs and current text.
- Add a knowledge-gap/follow-up result shape for KB miss/ambiguous states.
- Extend conversation persistence input so an answered message may also create a support ticket/event.
- Keep inbound message content redacted in DB as it is today.
- Extend LLM gateway mock result and route result with bounded `outputText`.
- Add a DeepSeek chat-completion provider seam in `packages/llm-gateway` without introducing SDK dependency or env access inside the package.
- Wire active answer runtime config/env to choose `mock` or `deepseek`, using `UZMAXADMIN_DEEPSEEK_KEY` when configured by the worker layer.
- Update focused tests and evidence for KB hit, KB gap and provider failure behavior.

## Out Of Scope

- DB schema, migration, generated Prisma client or RLS policy changes.
- Direct writes to `confirmation_item`, `distill_run` or formal KB tables from the realtime Bot path.
- Automatic production enablement, real customer traffic, GA, release approval or provider cost approval.
- Admin UI redesign or new admin page work.
- Changing order/pricing/SLA numeric decision rules.
- Sending any secret value to logs, docs, tests or committed files.

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：

  - `docs/specs/M8-07-llm-composed-bot-runtime.md`
  - `docs/evidence/M8/M8-07-llm-composed-bot-runtime.md`
  - `apps/worker/src/conversation-runtime.ts`
  - `apps/worker/src/telegram-bot-ticket-follow-up.ts`
  - `apps/worker/src/telegram-bot-conversation-persistence.ts`
  - `apps/worker/src/telegram-bot-answer-runtime.ts`
  - `apps/worker/src/telegram-bot-active-answer-runtime.ts`
  - `apps/worker/src/telegram-bot-worker-service-runtime.ts`
  - `apps/worker/src/worker-service-shell.ts`
  - `packages/llm-gateway/src/index.ts`
  - `packages/llm-gateway/src/deepseek-provider.ts`
  - `packages/llm-gateway/src/mock-provider.ts`
  - `packages/db/scripts/run-m6b-conversation-runtime-true-db-smoke.mjs`
  - `packages/db/scripts/tests/m8-active-answer-worker-smoke-support.mjs`
  - `packages/db/scripts/tests/run-m8-active-answer-worker-true-db-smoke.mjs`
  - `scripts/tests/m6b-conversation-runtime.test.mjs`
  - `scripts/tests/m6b-equivalent-bot-webhook-drive.test.mjs`
  - `scripts/tests/m8-bot-runtime-answer-loop-support.mjs`
  - `scripts/tests/m8-bot-runtime-answer-loop-v0.test.mjs`
  - `scripts/tests/m8-active-answer-runtime-wiring.test.mjs`
  - `scripts/tests/m3-llm-gateway-routing-accounting-foundation.test.mjs`
  - `scripts/tests/m8-llm-gateway-deepseek-provider.test.mjs`

Read-only anchors:

- `AGENTS.md`
- `docs/specs/M8-01-bot-runtime-answer-loop-v0.md`
- `docs/specs/M8-03-runtime-active-answer-wiring.md`
- `docs/specs/M8-06-internal-live-bot-supervisor.md`
- `packages/db/prisma/schema.prisma`

## Change Budget

- Source: up to 11 changed/new source files, net source LOC target <= 600.
- Test: up to 9 changed/new focused test/smoke files.
- Docs/evidence: this spec plus one evidence file.
- Generated, migration, schema, lock: none.
- Exceptions: none.

## Acceptance

- Focused test proves KB hit calls the LLM route and sends the LLM-composed text, not the raw KB card.
- Focused test proves KB miss sends an LLM-composed in-persona reply and persists a support ticket/event for follow-up.
- Focused test proves provider failure still suppresses outbound and persists handoff-only.
- Focused test proves active DB-backed runtime returns LLM-composed output from active persona/KB.
- Focused test proves DeepSeek provider builds the official chat-completion request shape and extracts `choices[0].message.content` without printing or owning the API key.
- `guard:pr-shape` passes for this spec.
- `git diff --check` passes.

## Failure Branches

- If reply-plus-ticket requires schema/RLS changes, stop and split a DB-serial spec.
- If DeepSeek live call fails locally due provider/network/key, keep provider seam tested with mocked transport and record live validation as owner-gated.
- If redline guard suppresses LLM output, do not send fallback text; persist handoff-only.
- If the Telegram send fails, persist handoff-only through the existing runtime error path.

## Start Audit

| Fact | Evidence |
|---|---|
| root checkout before work | `/Users/atilla/Applications/UZMAX智能运营` on `main`, clean against origin/main |
| no-merged branch audit before work | no output from `git branch --no-merged main` |
| open PR audit before work | `[]` |
| assigned worktree | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m8-07-llm-composed-bot-runtime` |
| assigned branch | `codex/m8-07-llm-composed-bot-runtime` |
| assigned HEAD | `0b0e55344aec3aa326a5c4e8b565b6c9c9092e26` |
| assigned status before edits | `## codex/m8-07-llm-composed-bot-runtime...origin/main` |

## Validation

Required focused validation:

- `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node --test scripts/tests/m6b-conversation-runtime.test.mjs scripts/tests/m6b-equivalent-bot-webhook-drive.test.mjs scripts/tests/m8-bot-runtime-answer-loop-v0.test.mjs scripts/tests/m8-active-answer-runtime-wiring.test.mjs scripts/tests/m3-llm-gateway-routing-accounting-foundation.test.mjs scripts/tests/m8-llm-gateway-deepseek-provider.test.mjs`
- `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node node_modules/eslint/bin/eslint.js packages/llm-gateway/src/index.ts packages/llm-gateway/src/deepseek-provider.ts packages/llm-gateway/src/mock-provider.ts apps/worker/src/telegram-bot-answer-runtime.ts apps/worker/src/conversation-runtime.ts apps/worker/src/telegram-bot-ticket-follow-up.ts apps/worker/src/telegram-bot-conversation-persistence.ts apps/worker/src/telegram-bot-active-answer-runtime.ts apps/worker/src/telegram-bot-worker-service-runtime.ts apps/worker/src/worker-service-shell.ts packages/db/scripts/run-m6b-conversation-runtime-true-db-smoke.mjs packages/db/scripts/tests/m8-active-answer-worker-smoke-support.mjs packages/db/scripts/tests/run-m8-active-answer-worker-true-db-smoke.mjs scripts/tests/m6b-conversation-runtime.test.mjs scripts/tests/m6b-equivalent-bot-webhook-drive.test.mjs scripts/tests/m8-bot-runtime-answer-loop-support.mjs scripts/tests/m8-bot-runtime-answer-loop-v0.test.mjs scripts/tests/m8-active-answer-runtime-wiring.test.mjs scripts/tests/m3-llm-gateway-routing-accounting-foundation.test.mjs scripts/tests/m8-llm-gateway-deepseek-provider.test.mjs`
- `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json --pretty false`
- `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node node_modules/jscpd/run-jscpd.js apps packages scripts --config jscpd.config.json --workers 1 --no-tips`
- `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M8-07-llm-composed-bot-runtime.md --include-worktree`
- `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node node_modules/prettier/bin/prettier.cjs --check docs/specs/M8-07-llm-composed-bot-runtime.md docs/evidence/M8/M8-07-llm-composed-bot-runtime.md packages/llm-gateway/src/index.ts packages/llm-gateway/src/deepseek-provider.ts packages/llm-gateway/src/mock-provider.ts apps/worker/src/telegram-bot-answer-runtime.ts apps/worker/src/conversation-runtime.ts apps/worker/src/telegram-bot-ticket-follow-up.ts apps/worker/src/telegram-bot-conversation-persistence.ts apps/worker/src/telegram-bot-active-answer-runtime.ts apps/worker/src/telegram-bot-worker-service-runtime.ts apps/worker/src/worker-service-shell.ts packages/db/scripts/run-m6b-conversation-runtime-true-db-smoke.mjs packages/db/scripts/tests/m8-active-answer-worker-smoke-support.mjs packages/db/scripts/tests/run-m8-active-answer-worker-true-db-smoke.mjs scripts/tests/m6b-conversation-runtime.test.mjs scripts/tests/m6b-equivalent-bot-webhook-drive.test.mjs scripts/tests/m8-bot-runtime-answer-loop-support.mjs scripts/tests/m8-bot-runtime-answer-loop-v0.test.mjs scripts/tests/m8-active-answer-runtime-wiring.test.mjs scripts/tests/m3-llm-gateway-routing-accounting-foundation.test.mjs scripts/tests/m8-llm-gateway-deepseek-provider.test.mjs`
- `git diff --check`
