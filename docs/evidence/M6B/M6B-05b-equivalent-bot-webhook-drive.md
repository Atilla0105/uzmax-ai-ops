# M6B-05b Equivalent Bot Webhook Drive Evidence

> evidence_id: M6B-05b-equivalent-bot-webhook-drive
> milestone: M6B
> acceptance_items: B-01, C-01, D-01, D-02, J-02, K-03, K-04, L-01, L-02
> owner: project owner owns real Telegram bot credentials, webhook registration, staging/production infrastructure, outbound sends, real customer/order data, customer LLM/provider calls, GA-0, P1/P2 decisions and 1.0 release; AI agents own implementation, review and evidence honesty
> status: local_contract_passed_true_db_webhook_drive_not_claimed
> created_at: 2026-06-26
> updated_at: 2026-06-26
> source_files: `AGENTS.md`, `docs/specs/M6B-00-ga0-runtime-bring-up-contract.md`, `docs/specs/M6B-05a-conversation-runtime-build.md`, `docs/specs/M6B-05b-equivalent-bot-webhook-drive.md`, `docs/evidence/M6B/README.md`, `docs/evidence/M6B/M6B-05a-conversation-runtime-build.md`, `apps/api/src/telegram-bot.ts`, `apps/worker/src/conversation-runtime.ts`, `packages/channels/src/index.ts`, `packages/db/scripts/run-m6b-conversation-runtime-true-db-smoke.mjs`, `scripts/tests/m6b-equivalent-bot-webhook-drive.test.mjs`
> sensitive_data_location: none; this file contains no customer/order/message/provider secret material
> redaction_status: no raw Telegram payload files, Bot tokens, webhook secrets, DB URLs, customer plaintext, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions or LLM keys
> review_notes: M6B-05b is intentionally narrow after owner direction: local focused contract proof only; true DB/RLS webhook-driven closure is not claimed locally without `UZMAX_RLS_DATABASE_URL`
> signoff: pending owner review of this M6B-05b PR

## Summary

M6B-05b records a narrow local webhook-equivalent drive:

`m6b_05b_equivalent_bot_webhook_drive_local_contract_passed_true_db_webhook_drive_not_claimed_not_ga0`

This is not GA-0, staging, production, a real Telegram webhook, outbound Bot sending, real customer traffic, customer LLM/provider approval or 1.0 release approval.

## Start Audit

Recorded at M6B-05b entry on 2026-06-26.

| Fact | Evidence |
|---|---|
| Linear tracking | LAY-21 `M6B-05b Equivalent Bot webhook drive through conversation runtime` |
| assigned worktree `pwd` | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m6b-05b-equivalent-bot-webhook-drive` |
| assigned status before edits | `## codex/m6b-05b-equivalent-bot-webhook-drive` |
| assigned branch | `codex/m6b-05b-equivalent-bot-webhook-drive` |
| assigned HEAD/base | `95b5b7ede8744dd247df1f201158a4de83e95053` |
| root/main status before edits | `## main...origin/main` |
| root no-merged branch audit before edits | no output |
| open PR audit before edits | coordinator ran GitHub API audit with `curl` from root/main; open PR list returned `[]` because `gh` command is unavailable in this shell |

## Implementation

| Area | Change | Evidence |
|---|---|---|
| spec | Added `docs/specs/M6B-05b-equivalent-bot-webhook-drive.md`. | Scope is one focused test plus M6B docs/evidence; no production source changes. |
| focused local contract test | Added `scripts/tests/m6b-equivalent-bot-webhook-drive.test.mjs`. | Test drives `TelegramBotWebhookCore` with synthetic secret/body, uses `createTelegramBotIngressQueueProviderFromEnv` BullMQ mode with injected fake queue, then passes queued payloads to `processTelegramBotConversationJob`. |
| duplicate handling | Fake persistence gateway accepts first `providerUpdateId=6506` and returns `deduped` for duplicate. | Local contract proves the webhook-equivalent path hands the same stable provider update to worker persistence. |
| true DB/RLS boundary | No new true DB smoke or CI wiring in this narrow slice. | M6B-05a direct true DB/RLS smoke remains the DB baseline; M6B-05b does not claim webhook-driven true DB closure locally. |

## Validation

Recorded on 2026-06-26 from the assigned worktree unless noted.

| Command | Result | Notes |
|---|---|---|
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test scripts/tests/m6b-equivalent-bot-webhook-drive.test.mjs` | pass | 2/2 tests passed after a temporary worktree-local `node_modules` symlink to the already-installed root dependencies; symlink was removed before closeout. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test scripts/tests/m6b-conversation-runtime.test.mjs` | pass | 4/4 M6B-05a focused regression tests passed with temporary dependency-resolution symlink support; symlink was removed before closeout. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test scripts/tests/m6b-equivalent-bot-webhook-drive.test.mjs` | blocked_then_passed | Initial run failed with `ERR_MODULE_NOT_FOUND: Cannot find package 'typescript'` because this isolated worktree has no `node_modules`; this was a local dependency-resolution issue, not a code failure. |
| `PATH=... pnpm dlx npm@11.9.0 run jscpd` | failed_then_passed | PR CI job `83655869696` failed on duplicated transpile helper code between M6B-05a and M6B-05b tests; the M6B-05b test loader helper was rewritten and local `jscpd` now reports `No duplicates found`. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node /Users/atilla/Applications/UZMAX智能运营/node_modules/prettier/bin/prettier.cjs --check docs/specs/M6B-05b-equivalent-bot-webhook-drive.md docs/evidence/M6B/M6B-05b-equivalent-bot-webhook-drive.md docs/evidence/M6B/README.md scripts/tests/m6b-equivalent-bot-webhook-drive.test.mjs` | pass | All matched files use Prettier style. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/doc-trigger-paths.mjs` | pass | `doc-trigger-paths: ok`. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/eval-trigger-paths.mjs --base origin/main` | pass | `no eval-triggering paths changed`. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/forbidden-terms.mjs` | pass | `forbidden-terms: ok`. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/workspace-isolation.mjs` | pass | Linked worker worktree on `codex/m6b-05b-equivalent-bot-webhook-drive`; dirty allowed before commit. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/worker-write-boundary.mjs --assigned /Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m6b-05b-equivalent-bot-webhook-drive --root /Users/atilla/Applications/UZMAX智能运营` | pass | Assigned worktree boundary check passed. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M6B-05b-equivalent-bot-webhook-drive.md` | pass | Script exited 0 and reported source changed files 0 / net source LOC 0; output also reported `changedFiles: 0`, so file list was separately checked with `git diff --cached --name-status`. |
| `git diff --check` | pass | No whitespace errors. |
| `git diff --cached --check` | pass | No staged whitespace errors. |
| `git diff --cached --name-status` | pass | Staged files are only this spec, M6B README, M6B-05b evidence and the focused test. |

## True DB/RLS Status

Local M6B-05b validation does not use `UZMAX_RLS_DATABASE_URL`; no local true DB/RLS webhook-driven pass is claimed.

M6B-05a already proved the direct conversation runtime DB/RLS path in GitHub Actions run `28232360471`: accepted synthetic Bot update persisted conversation/message/ticket/dedupe rows, duplicate returned `deduped`, tenant A could read and tenant B could not. M6B-05b only adds webhook-equivalent queue/worker contract coverage on top of that baseline.

## PR Hygiene

| Category | Current diff |
|---|---|
| Docs | `docs/specs/M6B-05b-equivalent-bot-webhook-drive.md`, `docs/evidence/M6B/README.md`, `docs/evidence/M6B/M6B-05b-equivalent-bot-webhook-drive.md` |
| Test support | `scripts/tests/m6b-equivalent-bot-webhook-drive.test.mjs` |
| Source | none |
| Config/CI/package/lock/generated/migration/schema/admin/render changes | none |
| Test weakening | none; no test deletion, `.skip`, `.only`, `xit` or `xfail` |
| External dependency | none |
| Exception | none |

## Boundaries

M6B-05b does not approve:

- real Telegram webhook/setWebhook, Bot token or webhook secret;
- outbound Bot send;
- staging or production deployment;
- real customer/order data;
- customer LLM/provider calls;
- DB schema, migrations, RLS policy or generated Prisma client changes;
- new dependency, lockfile, CI, guard or release-gate changes;
- webhook-driven true DB/RLS closure without a DB-enabled run;
- GA-0 opening, P1/P2 owner decision or 1.0 release.
