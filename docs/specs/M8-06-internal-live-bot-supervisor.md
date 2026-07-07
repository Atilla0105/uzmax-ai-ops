# M8-06 Internal Live Bot Supervisor

Spec ID: M8-06
Status: `internal_live_supervisor_in_progress`
Owner confirmation point: project owner asked to move the Telegram Bot closed loop to real internal staff use, without reopening governance/UI work. Owner still decides live test Bot token use, webhook cutover, internal chat boundary, real customer traffic, real LLM/provider keys, cost, production deploy, GA-0 and 1.0 release.
Timebox: narrow operator/runtime supervisor PR.

## Spec 类型

infra

## 目标

Add a controlled operator command that removes the next real blocker for item 7:

1. Preflight the internal test Bot live-readiness env without printing secret values.
2. Verify Telegram Bot API reachability through `getMe` and `getWebhookInfo` only when explicitly requested.
3. Set the test Bot webhook only when explicitly requested with `--set-webhook`.
4. Require `--expect-live` for real reply verification, so a dry-run worker cannot be mistaken for a live Bot reply.
5. Verify DB readback for a real internal employee Telegram chat: inbound message exists and either an outbound `SENT` message or an open ticket exists.

This PR does not change answer-or-handoff orchestration. M8-01 through M8-05 already cover that runtime path. This PR adds the missing supervised live/internal test entrypoint needed to run the final employee-message smoke safely.

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner: decide when to provide the test Bot token/chat boundary, allow `setWebhook`, switch worker answer mode to `live`, deploy services, and run an actual employee message. Owner also decides real customer traffic, real provider/LLM keys, costs, GA-0 and 1.0 release.

AI agent: add only the supervised operator command and focused tests; keep all live external actions behind explicit flags; do not print secrets; do not enable live mode in repo config; record what remains owner-gated.

## 时间盒

0.25 个工作日. If this requires DB schema/RLS/migration/generated changes, production deployment, real customer traffic, real LLM/provider calls, or admin UI changes, stop and report the blocker instead of widening this PR.

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：

  - `docs/specs/M8-06-internal-live-bot-supervisor.md`
  - `docs/evidence/M8/M8-06-internal-live-bot-supervisor.md`
  - `packages/db/scripts/run-m8-internal-live-bot-supervisor.mjs`
  - `scripts/tests/m8-internal-live-bot-supervisor.test.mjs`
  - `package.json`

Read-only anchors:

- `AGENTS.md`
- `docs/specs/README.md`
- `docs/doc-gates.md`
- `docs/specs/M8-01-bot-runtime-answer-loop-v0.md`
- `docs/specs/M8-02-db-backed-conversation-ticket-api.md`
- `docs/specs/M8-03-runtime-active-answer-wiring.md`
- `docs/specs/M8-04-internal-bot-loop-smoke.md`
- `docs/specs/M8-05-live-readback-runtime-config.md`
- `docs/evidence/M0/infra/telegram-bot-manifest.md`
- `docs/evidence/M8/M8-05-live-readback-runtime-config.md`
- `https://core.telegram.org/bots/api`

## 变更预算与路径分类

- source: 1 new operator script under `packages/db/scripts`, target file length <= 400 lines and net source LOC <= 380.
- test: 1 focused test file.
- config: `package.json` script entry only; no lockfile change.
- docs/evidence: this spec plus one evidence file.
- generated, migration, schema, lock, CI workflow, admin UI runtime, worker runtime source and render config: none.
- New source `rg` conclusion: searched `telegram-bot`, `sendMessage`, `setWebhook`, `getWebhookInfo`, `smoke:m8`, `internal live`, `conversation-ticket`, `external_conversation_ref`, `UZMAX_INTERNAL_TEST_CHAT_ID` across scripts, tests, apps, packages and docs. Existing runtime already covers webhook -> Redis -> worker -> DB/API readback and live `sendMessage`; the missing executable piece is a supervised operator command for owner-approved test Bot webhook setup and real chat readback verification. The new script belongs beside M8 smoke scripts under `packages/db/scripts`.
- External API/SDK/provider/connector/adapter basis: Telegram Bot API official documentation at `https://core.telegram.org/bots/api` for `getMe`, `getWebhookInfo`, `setWebhook`, `secret_token`, `allowed_updates` and Bot API method URL shape. This PR adds no new provider/LLM adapter and no default live network call.
- Exceptions: none. No `large_change_exception` and no `test_weakening_exception`.

## 文档触发检查

updated

## 前置条件

- Read `AGENTS.md`.
- Read M8-01 through M8-05 specs/evidence.
- Check `git branch --no-merged main` and `gh pr list --state open`.
- Confirm `.env.local` has only test Bot/webhook secret names locally; do not print values.
- Do not activate live Telegram send, `setWebhook`, real customer data, real LLM/provider calls or production deploy from this PR.

## Worktree / branch 前置条件

| Fact | Expected |
|---|---|
| worktree | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/m8-06-internal-live-bot-supervisor` |
| branch | `codex/m8-06-internal-live-bot-supervisor` |
| base HEAD | `291c81a6c566b4c30f159b2d7fd6e96603f13d5a` |
| forbidden checkout | `/Users/atilla/Applications/UZMAX智能运营` |
| root/main checkout use | coordination/read-only only |
| required pre-edit evidence | `pwd`, `git status --short --branch`, `git branch --show-current`, open PR audit and no-merged branch audit |

## 并发派发证据

Single writer in one worktree. This PR touches only one operator script, one focused test, one package script and spec/evidence docs. It does not touch DB schema, migrations, generated client, lockfile, CI workflow, shared runtime config, production release gates, render config or admin UI source.

## 事故与 closeout 记录

Known M8 incident before this PR:

- `docs/incidents/INC-2026-07-07-m8-01-root-patch-target.md`.

If any write lands outside the assigned worktree, on root/main, on the wrong branch, or includes secret/customer-data boundary risk, stop and create or reference incident evidence before continuing.

## 实施步骤

1. Add `packages/db/scripts/run-m8-internal-live-bot-supervisor.mjs`.
2. Add package script `smoke:m8-internal-live-bot`.
3. Add focused tests for help, fail-closed missing-env behavior, explicit live/webhook flags, DB readback semantics and documentation boundaries.
4. Record validation and remaining live-run boundary.
5. Run focused validation, formatting, lint, pr-shape and diff checks.

## 通过条件

- Default command performs preflight only and fails closed when required env is missing.
- Help text names owner-gated live actions and required env names without secret values.
- Telegram API calls require explicit `--check-telegram` or `--set-webhook`.
- `--set-webhook` sends `secret_token` and `allowed_updates` only when explicitly requested.
- `--expect-live` rejects non-`live` answer mode.
- `--verify-db` waits for a conversation matching `UZMAX_INTERNAL_TEST_CHAT_ID`, and succeeds only when inbound exists plus either outbound `SENT` or open ticket exists.
- Tests prove the supervisor does not print token values in fail-closed paths.
- No repo config switches Render or worker answer mode to `live`.

## 失败分支

- If Telegram API check fails: report Bot token/webhook API blocker; do not retry blindly or print token.
- If webhook URL is not HTTPS or not reachable: report deployment/webhook blocker; do not set webhook.
- If DB readback times out: report which condition was missing: inbound, outbound or ticket.
- If live mode is required but worker config remains dry-run: stop and report the owner-gated mode switch.
- If real customer traffic, provider/LLM keys or production deploy are required: stop and split the owner-approved live activation/deploy step.

## 不做什么

- No default live Telegram network call.
- No automatic `setWebhook`.
- No live mode committed into `render.yaml`.
- No real provider SDK/key/cost-bearing LLM call.
- No schema, migration, generated Prisma client, RLS policy, lockfile or CI workflow change.
- No admin UI redesign or prototype work.
- No GA-0 or 1.0 release claim.

## 验收映射

| Item | M8-06 status | Notes |
|---|---|---|
| C-01 | `internal_live_test_supervisor_ready_not_executed` | Supervisor can prepare/check webhook and verify real chat DB readback when owner supplies live boundary. |
| I-01 | `real_chat_readback_verifier_added` | Verifier requires inbound plus outbound `SENT` or open ticket. |
| G-03/K-02 | `existing_persona_kb_runtime_preserved` | No worker orchestration rewrite; M8-03/M8-05 remain the runtime truth. |
| L-01/J-05 | `not_ga0_not_release` | No live activation, real customer traffic, production deploy or owner release approval in this PR. |
