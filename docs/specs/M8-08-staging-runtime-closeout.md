# M8-08 Staging Runtime Closeout

Spec ID: M8-08
Status: `local_validation_passed`
Owner confirmation point: M8-07 has been merged and deployed to staging. The remaining closeout is to keep staging runtime config and the live Bot supervisor aligned with the actual DeepSeek/live loop that was verified on the internal test Bot.
Timebox: narrow closeout PR.

## Spec 类型

cleanup

## Goal

Remove two closeout drifts found during staging validation:

1. `render.yaml` still describes the worker as `dry_run` and does not list the DeepSeek provider env keys, while the actual staging worker is `live` with `UZMAX_WORKER_TELEGRAM_BOT_LLM_PROVIDER=deepseek`.
2. `packages/db/scripts/run-m8-internal-live-bot-supervisor.mjs --verify-db` uses Prisma enum names in raw SQL, but Postgres stores the mapped lowercase enum values.

This keeps the repo operator path aligned with the already deployed closed loop. It does not change the customer-service runtime behavior.

## Scope

- Update worker runtime env declarations in `render.yaml` for non-secret live/deepseek keys and secret placeholder.
- Fix the M8 internal live Bot supervisor DB readback SQL enum literals.
- Add a focused test guard so the supervisor keeps using DB mapped enum values.
- Update the existing DB-backed conversation-ticket Render config test so it expects the live/deepseek closed-loop worker config instead of the superseded dry-run config.
- Record staging validation evidence.

## Out Of Scope

- No source runtime behavior change.
- No DB schema, migration, generated Prisma client, RLS policy, provider route or prompt change.
- No admin UI work.
- No new provider or Telegram API behavior.
- No secret values in repo, tests, logs or evidence.

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：

  - `docs/specs/M8-08-staging-runtime-closeout.md`
  - `docs/evidence/M8/M8-08-staging-runtime-closeout.md`
  - `render.yaml`
  - `packages/db/scripts/run-m8-internal-live-bot-supervisor.mjs`
  - `scripts/tests/m8-internal-live-bot-supervisor.test.mjs`
  - `scripts/tests/m8-db-backed-conversation-ticket-api.test.mjs`

Read-only anchors:

- `AGENTS.md`
- `docs/specs/M8-07-llm-composed-bot-runtime.md`
- `docs/evidence/M8/M8-07-llm-composed-bot-runtime.md`
- `packages/db/prisma/schema.prisma`

## Change Budget

- Source: up to 1 script/config file plus `render.yaml`, net source LOC <= 80.
- Test: up to 2 focused test files.
- Docs/evidence: this spec plus one evidence file.
- Generated, migration, schema, lock: none.

## Acceptance

- `render.yaml` worker env declares `UZMAX_WORKER_TELEGRAM_BOT_ANSWER_MODE=live`, `UZMAX_WORKER_TELEGRAM_BOT_LLM_PROVIDER=deepseek`, `UZMAX_WORKER_DEEPSEEK_MODEL=deepseek-v4-flash`, and `UZMAXADMIN_DEEPSEEK_KEY sync:false`.
- Supervisor DB readback uses mapped DB enum literals: `inbound`, `outbound`, `sent`, `open`.
- Focused supervisor and Render config tests pass.
- `guard:pr-shape` passes for this spec.
- `git diff --check` passes.

## Failure Branches

- If config drift belongs to a separate Render Blueprint migration, keep this PR to the supervisor fix only and record the remaining config drift.
- If a live redeploy is triggered by merge, verify the worker remains live/deepseek after deployment.

## Start Audit

| Fact | Evidence |
|---|---|
| root checkout before work | `/Users/atilla/Applications/UZMAX智能运营` on `main`, clean against origin/main |
| no-merged branch audit before work | no output from `git branch --no-merged main` |
| open PR audit before work | `[]` |
| assigned worktree | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m8-08-staging-runtime-closeout` |
| assigned branch | `codex/m8-08-staging-runtime-closeout` |
| assigned HEAD | `8db04e1a491145dd331616a8866f1f192877ca00` |
| assigned status before edits | `## codex/m8-08-staging-runtime-closeout...origin/main` |

## Validation

Required focused validation:

- `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node --test scripts/tests/m8-internal-live-bot-supervisor.test.mjs scripts/tests/m8-db-backed-conversation-ticket-api.test.mjs`
- `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node node_modules/eslint/bin/eslint.js packages/db/scripts/run-m8-internal-live-bot-supervisor.mjs scripts/tests/m8-internal-live-bot-supervisor.test.mjs scripts/tests/m8-db-backed-conversation-ticket-api.test.mjs`
- `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M8-08-staging-runtime-closeout.md --include-worktree`
- `git diff --check`
