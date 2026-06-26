# M6B-05a Conversation Runtime Build Evidence

> evidence_id: M6B-05a-conversation-runtime-build
> milestone: M6B
> acceptance_items: B-01, C-01, D-01, D-02, J-02, K-03, K-04, L-01, L-02
> owner: project owner owns real Telegram bot credentials, webhook registration, staging/production infrastructure, outbound sends, real customer/order data, customer LLM/provider calls, GA-0, P1/P2 decisions and 1.0 release; AI agents own implementation, review and evidence honesty
> status: ci_passed_owner_review_pending
> created_at: 2026-06-26
> updated_at: 2026-06-26
> source_files: `AGENTS.md`, `docs/specs/M6B-00-ga0-runtime-bring-up-contract.md`, `docs/specs/M6B-05a-conversation-runtime-build.md`, `docs/evidence/M6B/README.md`, `docs/specs/M2-02-telegram-bot-ingress-dedupe-queue.md`, `apps/api/package.json`, `apps/api/scripts/runtime-compiler.mjs`, `apps/api/src/app.module.ts`, `apps/api/src/telegram-bot.ts`, `apps/worker/src/main.ts`, `apps/worker/src/conversation-runtime.ts`, `packages/channels/src/index.ts`, `packages/capabilities/handoff/src/index.ts`, `packages/db/src/index.ts`, `packages/db/prisma/schema.prisma`, `packages/db/scripts/order-import-worker-submit-smoke-support.mjs`, `packages/db/scripts/run-m4-order-import-true-db-smoke.mjs`, `packages/db/scripts/run-m6b-conversation-runtime-true-db-smoke.mjs`, `.github/workflows/ci.yml`, `package-lock.json`, `scripts/tests/m4-worker-test-loader.mjs`, `scripts/tests/m6b-conversation-runtime.test.mjs`
> sensitive_data_location: none; this file contains no customer/order/message/provider secret material
> redaction_status: no raw Telegram payload files, Bot tokens, webhook secrets, DB URLs, customer plaintext, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions or LLM keys
> review_notes: M6B-05a implements the inner-ring Bot conversation runtime build and CI true DB smoke wiring; GitHub Actions run `28232360471` passed the M6B true DB/RLS smoke, while owner review is still required for the `large_change_exception`
> signoff: pending owner review of this M6B-05a PR and owner approval of the declared `large_change_exception`

## Summary

M6B-05a builds the Bot conversation runtime that M6 did not close:

`m6b_05a_conversation_runtime_build_ci_passed_owner_review_pending_not_ga0`

This is not GA-0, staging, production, a real Telegram webhook, outbound Bot sending, real customer traffic, customer LLM/provider approval or 1.0 release approval.

## Start Audit

Recorded at M6B-05a entry on 2026-06-26.

| Fact | Evidence |
|---|---|
| Linear tracking | LAY-20 `M6B-05a Conversation runtime build with BullMQ ingress and RLS gateway` |
| assigned worktree `pwd` | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m6b-05a-conversation-runtime` |
| assigned status before edits | `## codex/m6b-05a-conversation-runtime...origin/main` |
| assigned branch | `codex/m6b-05a-conversation-runtime` |
| assigned HEAD/base | `4391d577b446874d953adaac465496bbd6557609` |
| root/main status before edits | `## main...origin/main` |
| root no-merged branch audit before edits | no output |
| open PR audit before edits | GitHub connector returned `[]` |

## Implementation

| Area | Change | Evidence |
|---|---|---|
| shared channel contract | Added Bot conversation queue defaults, sanitized job payload builder and stable job id helper. | Payload stores bounded refs and lengths, not a raw Telegram update file. |
| API queue provider | Added `BullmqTelegramBotIngressQueue` and env-selected provider. | Default remains disabled/fail-closed; explicit `UZMAX_TELEGRAM_BOT_INGRESS_QUEUE_MODE=bullmq` requires Redis, org, tenant and channel connection IDs. |
| API dependency | Declared the existing repo BullMQ version in the API workspace. | API owns the enqueue adapter, so runtime dependency is explicit; no new package/version is introduced. |
| API AppModule | Webhook service now receives the env-selected queue provider through Nest provider wiring. | `process.env` access remains inside runtime factory code, not the module shell. |
| API runtime compiler | Added Bot webhook source to the existing local Nest runtime compiler. | Existing runtime smoke tests can boot AppModule after the new import. |
| worker consumer | Added `processTelegramBotConversationJob` and a BullMQ processor/worker factory. | Worker converts one accepted Bot update into conversation, inbound message, support ticket and ticket event drafts. |
| DB/RLS gateway | Added Prisma gateway using existing `createRlsTransactionContext` and `telegram_update_dedupe`. | Duplicate `providerUpdateId` returns `deduped` before writing conversation/message/ticket rows. |
| M4 true DB loader compatibility | Stripped the new conversation runtime export from the legacy M4 true DB data-url loaders. | Preserves existing M4 smoke behavior after `apps/worker/src/main.ts` gained a new runtime export. |
| true DB smoke | Added `packages/db/scripts/run-m6b-conversation-runtime-true-db-smoke.mjs`. | Requires `UZMAX_RLS_DATABASE_URL`, seeds synthetic tenants/channel, runs accepted + duplicate update, checks tenant A/B RLS readback and cleans residue. |
| CI wiring | Added an M6B true DB smoke step under the existing `run_true_db_smoke` path. | Uses the existing masked `UZMAX_RLS_DATABASE_URL` secret boundary. |

## Validation

Recorded on 2026-06-26 from the assigned worktree unless noted.

| Command | Result | Notes |
|---|---|---|
| `node --test scripts/tests/m6b-conversation-runtime.test.mjs` | pass | 4/4 tests passed: payload/job id, disabled default, BullMQ enqueue adapter with fake queue, worker persistence input and AppModule wiring. |
| `node --test scripts/tests/m6b-conversation-runtime.test.mjs scripts/tests/m4-order-import-worker-contract.test.mjs scripts/tests/m4-order-import-bullmq-redis-runtime.test.mjs scripts/tests/m4-order-import-worker-prisma-persistence-contract.test.mjs` | pass | 20/20 focused tests passed after M4 true DB loader compatibility fix. |
| `node --test scripts/tests/m2-telegram-bot-ingress.test.mjs` | pass | 4/4 legacy Bot ingress tests passed after moving BullMQ loading out of top-level API module import. |
| `node --test scripts/tests/m4-order-import-runtime-provider-contract.test.mjs` | pass | 5/5 tests passed; AppModule no longer contains direct `process.env` access. |
| `node --test scripts/tests/m1-02-api-access-context.test.mjs scripts/tests/m4-order-import-worker-queue-job-contract.test.mjs scripts/tests/m6b-conversation-runtime.test.mjs` | pass | 13/13 targeted regression tests passed after runtime compiler and worker loader updates. |
| `pnpm dlx npm@11.9.0 run format:check` | pass | All matched files use Prettier style. |
| `pnpm dlx npm@11.9.0 run typecheck` | pass | Full repo TypeScript check passed. |
| `pnpm dlx npm@11.9.0 run lint` | pass | Full repo ESLint passed. |
| `pnpm dlx npm@11.9.0 run depcruise` | pass | `no dependency violations found`. |
| `pnpm dlx npm@11.9.0 run jscpd` | pass | `Found 0 clones`. |
| `pnpm dlx npm@11.9.0 run knip` | pass | No unused/unlisted dependency findings. |
| `pnpm dlx npm@11.9.0 run test` | pass | 451/451 tests passed. |
| `pnpm dlx npm@11.9.0 run build` | pass | API, worker, cron and admin build completed. |
| `node scripts/guards/prettier-ignore-boundary.mjs --base origin/main` | pass | Baseline and monitored diff checks passed. |
| `node scripts/guards/doc-trigger-paths.mjs` | pass | `doc-trigger-paths: ok`. |
| `node scripts/guards/eval-trigger-paths.mjs --base origin/main` | pass | `no eval-triggering paths changed`. |
| `node scripts/guards/forbidden-terms.mjs` | pass | `forbidden-terms: ok`. |
| `node scripts/guards/workspace-isolation.mjs` | pass | Linked worker worktree on `codex/m6b-05a-conversation-runtime`; dirty allowed before commit. |
| `node scripts/guards/worker-write-boundary.mjs --assigned ... --root ...` | pass | Assigned worktree boundary check passed. |
| GitHub Actions run `28231843724` / job `83637229702` | failed_then_fixed | CI failed in M4 true DB runtime smokes before reaching M6B smoke because one legacy M4 data-url loader did not strip the new `./conversation-runtime.ts` worker export; this branch now strips that export in `packages/db/scripts/run-m4-order-import-true-db-smoke.mjs`. |
| GitHub Actions run `28232098772` / job `83638076216` | failed_then_fixed | CI found the same legacy export-loader issue in the shared M4 worker submit smoke support helper; this branch now strips the new export in `packages/db/scripts/order-import-worker-submit-smoke-support.mjs` too. |
| GitHub Actions run `28232360471` / job `83638929312` | pass | Full CI passed. M4 true DB runtime smokes, M6B conversation runtime true DB smoke, M5R true integration closeout, SPK-03, SPK-04, full test and build all completed successfully. |
| `node packages/db/scripts/run-m4-order-import-true-db-smoke.mjs` | blocked_missing_env | Fail-closed with `UZMAX_RLS_DATABASE_URL is required`; no local true DB pass is claimed. |
| `node packages/db/scripts/run-m6b-conversation-runtime-true-db-smoke.mjs` | blocked_missing_env | Fail-closed with `UZMAX_RLS_DATABASE_URL is required`; no true DB pass is claimed locally. |

Local tooling note: this shell exposes bundled Node but not direct `npm`. A temporary untracked `node_modules` symlink was used only for local test resolution and must not be committed.

## True DB/RLS Status

M6B-05a true DB/RLS acceptance is not locally closed in this worker environment because `UZMAX_RLS_DATABASE_URL` is absent.

The smoke script is wired into CI under the existing `run_true_db_smoke` gate. GitHub Actions run `28232360471` passed the M6B conversation runtime true DB smoke, showing:

- accepted synthetic Bot update persisted one conversation, one message, one ticket and one dedupe row;
- duplicate `providerUpdateId` returned `deduped` and did not create another persisted result;
- tenant A can read the rows under RLS;
- tenant B cannot read tenant A rows;
- residue cleanup returns `0`.

This CI pass does not approve owner-gated real Telegram credentials, staging/production infrastructure, outbound sends, real customer/order data, customer LLM/provider calls, GA-0, P1/P2 decisions or 1.0 release.

## PR Hygiene

| Category | Current diff |
|---|---|
| Docs | `docs/specs/M6B-05a-conversation-runtime-build.md`, `docs/evidence/M6B/README.md`, `docs/evidence/M6B/M6B-05a-conversation-runtime-build.md` |
| Source | `packages/channels/src/index.ts`, `apps/api/scripts/runtime-compiler.mjs`, `apps/api/src/app.module.ts`, `apps/api/src/telegram-bot.ts`, `apps/worker/src/main.ts`, `apps/worker/src/conversation-runtime.ts`, `packages/db/scripts/order-import-worker-submit-smoke-support.mjs`, `packages/db/scripts/run-m4-order-import-true-db-smoke.mjs`, `packages/db/scripts/run-m6b-conversation-runtime-true-db-smoke.mjs` |
| Test support | `scripts/tests/m4-worker-test-loader.mjs`, `scripts/tests/m6b-conversation-runtime.test.mjs` |
| Config/CI | `.github/workflows/ci.yml` |
| Package/lock | `apps/api/package.json`, `package-lock.json`; no new package version |
| Generated/migration/schema/admin/render changes | none |
| Test weakening | none; no test deletion, `.skip`, `.only`, `xit` or `xfail` |
| External dependency | no new package/version; API workspace now declares the existing BullMQ version it uses |
| Exception | `large_change_exception` for source LOC over the default budget; this requires owner review approval before merge |

## Boundaries

M6B-05a does not approve:

- real Telegram webhook/setWebhook, Bot token or webhook secret;
- outbound Bot send;
- staging or production deployment;
- real customer/order data;
- customer LLM/provider calls;
- DB schema, migrations, RLS policy or generated Prisma client changes;
- new dependency version changes;
- GA-0 opening, P1/P2 owner decision or 1.0 release.
