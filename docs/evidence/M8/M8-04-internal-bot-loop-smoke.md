# M8-04 Internal Bot Loop Smoke Evidence

Status: `operator_entry_added_local_preflight_validated_true_db_ci_pending`
Date: 2026-07-07

## Scope

M8-04 adds a named internal smoke entrypoint for the already-merged M8 closed loop:

- customer text enters the Telegram Bot webhook service,
- webhook enqueues a BullMQ job in Redis,
- worker service resolves active AI member/persona gate/capability and active KB,
- KB hit returns a dry-run outbound answer,
- KB miss creates a support ticket/handoff,
- conversation-ticket backend readback sees conversations, messages and ticket,
- tenant B isolation returns no rows,
- synthetic DB residue is cleaned up.

The command delegates to the canonical M8 true DB smoke instead of duplicating runtime logic.

## Start Audit

| Fact | Evidence |
|---|---|
| root/main status before worktree creation | `## main...origin/main` |
| root no-merged branch audit before edits | no output |
| open PR audit before edits | `[]` |
| assigned worktree `pwd` | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m8-04-internal-bot-loop-smoke` |
| assigned branch | `codex/m8-04-internal-bot-loop-smoke` |
| assigned HEAD | `0597cb22208171c832d871f8079f649d6fe9dd84` |
| assigned status before edits | `## codex/m8-04-internal-bot-loop-smoke...origin/main` |

## Local Environment Boundary

- Bundled runtime provides Node but not npm/corepack in PATH, so no dependency install was performed in this worktree.
- Root checkout has existing `node_modules`; focused validation uses explicit local/runtime paths and records that limitation.
- Current local shell lacks `UZMAX_RLS_DATABASE_URL` and `UZMAX_REDIS_URL`, so the true DB smoke cannot honestly run locally until those are provided.

## Validation

Command:

```bash
PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node --test scripts/tests/m8-internal-bot-loop-smoke.test.mjs
```

Result: pass. 5 tests, 0 failures.

Command:

```bash
PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node --check packages/db/scripts/run-m8-internal-bot-loop-smoke.mjs
```

Result: pass.

Command:

```bash
PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node packages/db/scripts/run-m8-internal-bot-loop-smoke.mjs --help
```

Result: pass. Help prints the webhook -> Redis -> worker -> active KB answer -> dry-run outbound -> KB miss ticket -> conversation-ticket readback scope.

Command:

```bash
PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" env -u UZMAX_RLS_DATABASE_URL -u UZMAX_REDIS_URL node packages/db/scripts/run-m8-internal-bot-loop-smoke.mjs
```

Result: expected failure. The wrapper reports missing `UZMAX_RLS_DATABASE_URL` and `UZMAX_REDIS_URL`, does not print secret values and does not start the smoke.

Local true DB smoke availability check:

```bash
if [ -n "${UZMAX_RLS_DATABASE_URL:-}" ]; then echo has_rls_db; else echo missing_rls_db; fi
if [ -n "${UZMAX_REDIS_URL:-}" ]; then echo has_redis; else echo missing_redis; fi
```

Result:

```text
missing_rls_db
missing_redis
```

Local true DB smoke was not run because the local shell lacks both required env values. PR CI should run the existing canonical M8 true DB smoke because this PR changes `package.json` and `packages/db/scripts/**`, which are in the true DB smoke path scope.

Command:

```bash
PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node /Users/atilla/Applications/UZMAX智能运营/node_modules/prettier/bin/prettier.cjs --check docs/specs/M8-04-internal-bot-loop-smoke.md docs/evidence/M8/M8-04-internal-bot-loop-smoke.md packages/db/scripts/run-m8-internal-bot-loop-smoke.mjs scripts/tests/m8-internal-bot-loop-smoke.test.mjs package.json
```

Result: pass. `All matched files use Prettier code style!`

Command:

```bash
PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node /Users/atilla/Applications/UZMAX智能运营/node_modules/eslint/bin/eslint.js --config /Users/atilla/Applications/UZMAX智能运营/eslint.config.mjs packages/db/scripts/run-m8-internal-bot-loop-smoke.mjs scripts/tests/m8-internal-bot-loop-smoke.test.mjs
```

Result: pass.

Command:

```bash
PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M8-04-internal-bot-loop-smoke.md --include-worktree
```

Result: pass. Worktree pre-stage report: `changedFiles=5`, categories `config=1/docs=2/source=1/test=1`.

Post-commit rerun result: pass. Report: `changedFiles=5`, categories `docs=2/config=1/source=1/test=1`, source `changedFiles=1/netLoc=43/newFiles=1`.

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

- No live Telegram token, `setWebhook`, real network send, real customer traffic or production deploy.
- No real provider SDK, LLM key, customer-data LLM processing or cost-bearing call.
- No schema, migration, generated Prisma client, RLS policy, lockfile or CI workflow change.
- No admin UI redesign or visual/prototype work.
- This is an internal dry-run smoke entrypoint. Owner still decides live credentials, test account boundary, customer-data boundary, GA-0 and 1.0 release.
