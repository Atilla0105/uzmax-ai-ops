# M8-05 Live Readback Runtime Config Evidence

Status: `local_and_ci_validation_passed_pr_open`
Date: 2026-07-07

## Scope

M8-05 closes the deploy-runtime gap left after M8-03 and M8-04:

- API conversation-ticket readback can be enabled from env with a real Prisma client factory.
- Render API declares DB-backed conversation-ticket repository mode.
- Render worker declares DB-backed Telegram Bot persistence and active-answer dry-run config.
- Live Telegram outbound remains off by default; this PR does not activate `live` answer mode.

This is a runtime-config closeout slice, not a new governance, UI or release slice.

## Start Audit

| Fact | Evidence |
|---|---|
| root/main status before worktree creation | `## main...origin/main` |
| root no-merged branch audit before edits | no output |
| open PR audit before edits | `[]` |
| assigned worktree `pwd` | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m8-05-live-readback-runtime-config` |
| assigned branch | `codex/m8-05-live-readback-runtime-config` |
| assigned HEAD | `34fbb65f3f6d98782d68cbfeb1df03cf05ffba32` |
| assigned status before edits | `## codex/m8-05-live-readback-runtime-config...origin/main` |
| subagent dispatch | attempted; blocked by `agent thread limit reached`; main agent executed the slice |

## Change Summary

- `apps/api/src/conversation-ticket.repository.ts`
  - Preserves the existing in-memory default and explicit `prismaClient` injection path.
  - Adds `prismaClientFactory` for tests and env-controlled runtime construction.
  - Creates a default `@prisma/client` client from `UZMAX_RLS_DATABASE_URL`.
- `render.yaml`
  - API service now declares `UZMAX_CONVERSATION_TICKET_REPOSITORY_MODE=rls_prisma_gateway` and secret `UZMAX_RLS_DATABASE_URL`.
  - Worker service now declares DB-backed persistence and active-answer dry-run config.
  - Worker service keeps live outbound gated: `UZMAX_WORKER_TELEGRAM_BOT_ANSWER_MODE=dry_run`; token is a `sync: false` secret placeholder.
- `scripts/tests/m8-db-backed-conversation-ticket-api.test.mjs`
  - Covers the env factory path.
  - Covers Render dry-run DB-backed manifest config and guards against live answer mode.
- `apps/api/package.json` and `package-lock.json`
  - Declare `@prisma/client` for the API workspace because the API runtime now imports it directly.
  - Reuse the existing resolved Prisma client version already present in the workspace lockfile.

## Validation

Initial focused test without local workspace dependencies:

```bash
PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node --test scripts/tests/m8-db-backed-conversation-ticket-api.test.mjs
```

Result: blocked by missing local worktree dependency resolution: `Cannot find package 'typescript' imported from apps/api/scripts/runtime-compiler.mjs`. This worktree has no installed `node_modules`.

Local validation dependency boundary:

- Created ignored local `node_modules/.cache`.
- First mapped only `node_modules/typescript` to the root checkout dependency so the runtime compiler could run.
- Later temporarily mapped full ignored `node_modules` to the root checkout dependency for TypeScript and knip resolution.
- Removed `node_modules` and `apps/api/dist` after validation; neither is part of the commit.

Command:

```bash
PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node --test scripts/tests/m8-db-backed-conversation-ticket-api.test.mjs
```

Result: pass. `tests=3`, `pass=3`, `fail=0`.

Command:

```bash
PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node /Users/atilla/Applications/UZMAX智能运营/node_modules/prettier/bin/prettier.cjs --check docs/specs/M8-05-live-readback-runtime-config.md docs/evidence/M8/M8-05-live-readback-runtime-config.md apps/api/src/conversation-ticket.repository.ts scripts/tests/m8-db-backed-conversation-ticket-api.test.mjs render.yaml apps/api/package.json package-lock.json
```

Result: pass. `All matched files use Prettier code style!`

Command:

```bash
PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node /Users/atilla/Applications/UZMAX智能运营/node_modules/eslint/bin/eslint.js --config /Users/atilla/Applications/UZMAX智能运营/eslint.config.mjs apps/api/src/conversation-ticket.repository.ts scripts/tests/m8-db-backed-conversation-ticket-api.test.mjs
```

Result: pass.

Command:

```bash
PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node /Users/atilla/Applications/UZMAX智能运营/node_modules/typescript/lib/tsc.js -p apps/api/tsconfig.build.json
```

Result: pass.

Command:

```bash
PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node /Users/atilla/Applications/UZMAX智能运营/node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json
```

Result: pass.

Command:

```bash
PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node /Users/atilla/Applications/UZMAX智能运营/node_modules/knip/bin/knip.js -c package.json#knip --no-progress --duration --no-config-hints --no-tag-hints
```

Result: pass. `Total running time: 375ms`.

Command:

```bash
PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M8-05-live-readback-runtime-config.md --include-worktree
```

Result: pass. Worktree report: `changedFiles=7`, categories `config=2/source=1/lock=1/test=1/docs=2`, source `changedFiles=1/netLoc=0/newFiles=0`.

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

PR CI:

- PR: https://github.com/Atilla0105/uzmax-ai-ops/pull/278
- Run: https://github.com/Atilla0105/uzmax-ai-ops/actions/runs/28887705037
- Result: pass. `checks` job passed in `14m47s`.
- Final merge still requires the current PR checks to be green at merge time.
- Note: the first CI run failed in `guard:pr-shape` because the PR body did not expose plain `Spec ID` and `Spec file` fields. The PR body was corrected and an empty commit refreshed the pull request event payload; no repo code change was required for that PR-body failure.

## Boundaries

- No live Telegram token value is committed.
- No `setWebhook`, live Telegram send, real customer chat, production deploy, GA-0 or 1.0 release claim.
- No real provider SDK, LLM key, customer-data LLM processing or cost-bearing call.
- No schema, migration, generated Prisma client, RLS policy, CI workflow or new dependency version resolution.
- No admin UI redesign or visual/prototype work.

## Remaining Owner-Gated Live Steps

After this PR, a real internal employee Bot run still requires explicit owner action/approval for:

1. Supplying Render `UZMAX_RLS_DATABASE_URL` and `UZMAX_TELEGRAM_BOT_TOKEN` secrets.
2. Deploying API/worker services from `main`.
3. Pointing the test Bot webhook at the deployed API.
4. Switching answer mode from `dry_run` to `live` only for the approved test Bot/chat boundary.
5. Running one employee message and confirming backend conversation/message/ticket readback.
