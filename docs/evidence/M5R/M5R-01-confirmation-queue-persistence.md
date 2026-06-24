# M5R-01 Confirmation Queue Persistence Evidence

## Start Audit

Recorded on 2026-06-24 before source/test implementation edits from the assigned M5R-01 worktree.

| Fact | Evidence |
|---|---|
| assigned worktree `pwd` | `/Users/atilla/Documents/uzmax-m5r-01-confirmation-queue-persistence` |
| assigned `git status --short --branch` | `## codex/m5r-01-confirmation-queue-persistence...origin/main` |
| assigned `git branch --show-current` | `codex/m5r-01-confirmation-queue-persistence` |
| worker `HEAD` | `5218fa85410f123094b8c5b02f9b2f52366d1e25` |
| worker `origin/main` | `5218fa85410f123094b8c5b02f9b2f52366d1e25` |
| root/main status | `/Users/atilla/Documents/UZMAX智能运营` -> `## main...origin/main` |
| root/main branch | `main` |
| root/main `HEAD` | `5218fa85410f123094b8c5b02f9b2f52366d1e25` |
| root/main `origin/main` | `5218fa85410f123094b8c5b02f9b2f52366d1e25` |
| open PR audit | `gh pr list --state open` returned no PR output |
| root no-merged branch audit before branch creation | `git branch --no-merged main` returned no branch output |
| root no-merged branch audit after M5R-01 branch creation | `git branch --no-merged main` returned no branch output because the branch was still at `origin/main` |
| linked worktree list | root worktree `/Users/atilla/Documents/UZMAX智能运营` on `refs/heads/main`; worker worktree `/Users/atilla/Documents/uzmax-m5r-01-confirmation-queue-persistence` on `refs/heads/codex/m5r-01-confirmation-queue-persistence` |
| linked worktree git-dir/common-dir | worker git dir `/Users/atilla/Documents/UZMAX智能运营/.git/worktrees/uzmax-m5r-01-confirmation-queue-persistence`; common dir `/Users/atilla/Documents/UZMAX智能运营/.git`; superproject empty |
| node_modules | missing at start; `npm ci` was required before validation |

## Baseline

| Command | Result | Notes |
|---|---|---|
| `npm ci` | pass | Installed 360 packages and found 0 vulnerabilities in the assigned worktree. |
| `node --test scripts/tests/m5-confirmation-queue-api.test.mjs` | pass | Baseline M5-03 focused test passed: 6/6 tests. |

## Scope

M5R-01 adds an explicit Prisma/RLS repository runtime for the existing M5-03 confirmation queue API. The default AppModule path remains in-memory, and the RLS Prisma runtime is opt-in through a repository provider factory.

Allowed files are exactly the allowlist in `docs/specs/M5R-01-confirmation-queue-persistence.md`. Root/main checkout is read-only for this worker.

## Current DB Contract Check

The existing M5-01 DB contract already contains the required `confirmation_item` Prisma model, SQL table, enum mappings, forced RLS policies, scoped indexes and `uzmax_app_runtime` select/insert/update grants. M5R-01 therefore does not add Prisma schema, migration or generated-client changes.

## Boundaries

This slice does not implement M5R-02 formal write pipeline, admin runtime wiring, distill scheduler, worker/cron behavior, schema/migration changes, production deploy, external SaaS onboarding, real customer/order data, customer LLM, real LLM calls, GA-0, M6, M5 owner acceptance or 1.0 release behavior.

## No Sensitive Data Statement

This evidence, spec, tests and implementation must not include raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets. M5R-01 uses synthetic UUIDs, synthetic org/tenant names, controlled refs and synthetic metadata markers only.

## Runtime/RLS Evidence

- `ConfirmationQueueService` now depends on `ConfirmationQueueRepositoryPort`; existing M5-03 list/detail/approve/edit/discard/block semantics and `formalWrite: false` responses are preserved.
- `CONFIRMATION_QUEUE_REPOSITORY` keeps AppModule provider wiring explicit. Default AppModule mode uses `InMemoryConfirmationQueueRepository` and does not require `UZMAX_RLS_DATABASE_URL`.
- Explicit runtime mode is `UZMAX_CONFIRMATION_QUEUE_REPOSITORY_MODE=rls_prisma_gateway`. The runtime rejects bare `prisma_gateway` mode with `confirmation queue env runtime must use RLS Prisma gateway`.
- The Prisma/RLS repository uses the existing `confirmation_item` model/table only. `confirmation-queue.prisma-mapper.ts` maps API enum values to the existing Prisma enum values, persists candidate/diff/metadata/status/reviewer fields, and keeps `confidenceBps` inside metadata for round trip compatibility.
- RLS transaction evidence is implemented through `createRlsTransactionContext`, `set local role "uzmax_app_runtime"`, and transaction-scoped `app.org_id` / `app.tenant_id` settings before the confirmation item operation.
- Runtime compiler support imports `confirmation-queue.runtime.mjs` plus the existing DB runtime helpers so focused Node tests and true DB smoke can load the same runtime path.
- Focused contract test uses a fake Prisma client only to prove transaction shape, missing-env failure, explicit RLS mode and no bare Prisma bypass. It is not counted as true DB/RLS evidence.
- True DB smoke CLI entrypoint is `packages/db/scripts/run-m5r-confirmation-queue-true-db-smoke.mjs`; long synthetic smoke assertions live in `packages/db/scripts/tests/run-m5r-confirmation-queue-true-db-smoke.mjs` and export `runM5rConfirmationQueueTrueDbSmoke` for static contract coverage.

## True DB/RLS Smoke Status

Status: `blocked_by_missing_env`.

`UZMAX_RLS_DATABASE_URL` is absent in this worker environment. Running the true DB smoke therefore failed before opening a DB connection, as required by the spec failure branch:

| Command | Result | Evidence |
|---|---|---|
| `node packages/db/scripts/run-m5r-confirmation-queue-true-db-smoke.mjs` | expected fail-closed | Throws `Error: UZMAX_RLS_DATABASE_URL is required`. No DB connection opened and no synthetic residue was created. |

The runner is ready to prove true DB/RLS behavior when the env is available. Its covered path seeds synthetic org/tenant/confirmation rows, runs create/list/detail/approve/edit/discard/block through the RLS Prisma repository, asserts same-tenant positive reads, wrong-tenant read/mutation negatives, missing-context negative, conflict diff enforcement, persisted `formalWrite: false`, `auditLogId` remains null, and synthetic residue cleanup.

Because the DB URL is missing, M5R-01 does not claim completed true DB/RLS smoke. The focused contract test below proves the runner/runtime requires `UZMAX_RLS_DATABASE_URL` and rejects non-RLS Prisma mode.

## Validation

| Command | Result | Notes |
|---|---|---|
| `node --test scripts/tests/m5-confirmation-queue-api.test.mjs` | pass | M5-03 focused API contract still passes: 6/6 tests. |
| `node --test scripts/tests/m5r-confirmation-queue-persistence.test.mjs` | pass | M5R-01 runtime contract passes: 4/4 tests. |
| `node packages/db/scripts/run-m5r-confirmation-queue-true-db-smoke.mjs` | expected fail-closed | Blocked by missing `UZMAX_RLS_DATABASE_URL`; this is recorded above, not counted as true DB/RLS pass. |
| `npm run typecheck -- --pretty false` | pass | TypeScript no-emit check passed. |
| `npm run lint` | pass | ESLint passed for apps/packages/scripts. |
| `npm run knip` | pass | No unused public exports after runtime/smoke runner wiring. |
| `npm run format:check` | pass | Prettier reported all matched files use Prettier code style. |
| `npm run jscpd` | pass | Found 0 clones. |
| `npm run depcruise` | pass | No dependency violations found. |
| `npm run guard:prettier-ignore -- --base origin/main` | pass | Frozen prettier-ignore boundary and diff check passed. |
| `npm run guard:forbidden-terms` | pass | Forbidden business-term guard passed. |
| `npm run guard:eval-triggers -- --base origin/main` | pass | No eval-triggering paths changed. |
| `npm run guard:doc-triggers` | pass | `doc-trigger-paths: ok`. |
| `npm run guard:workspace` | pass | Linked worker worktree accepted; dirty allowed. |
| `npm run guard:worker-boundary -- --assigned /Users/atilla/Documents/uzmax-m5r-01-confirmation-queue-persistence --root /Users/atilla/Documents/UZMAX智能运营` | pass | Assigned/root boundary check passed. |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M5R-01-confirmation-queue-persistence.md --include-worktree` | pass | Worktree-mode guard passed with 13 changed files, categories source 7 / docs 3 / test 3. |
| `git diff --check origin/main` | pass | No whitespace errors. |
| `npm run test` | pass | Full suite passed: 360/360 tests. |

## Spec Compliance Review

- Spec ID and file exist: `M5R-01`, `docs/specs/M5R-01-confirmation-queue-persistence.md`.
- Changed files are within the M5R-01 allowlist. No admin, worker, cron, distill, lockfile, shared config/CI/guard, schema, migration or generated Prisma client changes were made.
- Existing DB contract was sufficient: `confirmation_item` Prisma model, migration table, RLS policy and `uzmax_app_runtime` grants already exist.
- Default runtime remains in-memory. Prisma/RLS runtime is explicit and fail-closed when env is missing.
- Source budget estimate from `git diff --numstat origin/main`: source changed files 7, source net LOC 530, new source files 3. This is within changed source files <= 8, net source LOC <= 600, new source files <= 3.
- Conflict candidates still require side-by-side diff for approve/edit. Focused tests assert this in M5-03 and the true DB runner includes the same negative.
- Decisions still return and persist `formalWrite: false`. No formal knowledge/config/profile/eval/template/customer-profile write path was added.
- True DB/RLS smoke is not claimed because `UZMAX_RLS_DATABASE_URL` is missing. The runner fails before connecting and leaves no DB residue.

## Code Quality Review

- Repository port is intentionally narrow: `listItems`, `getItem`, `saveItem`. API semantics remain in the service/controller, not duplicated in the Prisma runtime.
- The RLS runtime is split into `confirmation-queue.runtime.ts` plus a Prisma mapper so ordinary source files stay within line budgets and in-memory behavior remains easy to test.
- Runtime mode names are explicit. Bare `prisma_gateway` is rejected to prevent privileged/service-role bypass in this slice.
- RLS scope comes from `AccessContext` for reads and from the item's org/tenant for saves; every Prisma operation runs inside the restricted transaction runner.
- Tests use synthetic UUIDs and controlled refs only. No raw customer data, real order data, real LLM calls, secrets or external SaaS calls were introduced.
- No tests were deleted, weakened, skipped, marked `.only`, `xit` or `xfail`; no snapshots or broad mocks were added.

## Acceptance Mapping

| Item | M5R-01 status | Evidence target |
|---|---|---|
| H-02 | `runtime_persistence_supported_not_formal_write_closed` | Confirmation queue decisions persist with `formalWrite: false`; no pending/discarded/blocked formal write path exists in M5R-01. |
| H-03 | `runtime_diff_supported_not_formal_write_closed` | Conflict candidate approve/edit still requires side-by-side diff; formal target write remains future. |
| I-02 | `api_runtime_persistence_supported_not_admin_closed` | Runtime repository supports later admin/mobile fallback; admin runtime wiring remains M5R-07. |
| J-05 | `m5r_01_runtime_evidence_added_not_owner_accepted` | This evidence records M5R-01 only; no M5 owner acceptance or release signoff. |
| K-03 | `active` | One spec / one PR; current branch implements only M5R-01. |
| K-04 | `active` | Worker worktree/branch/touch list are scoped; schema/migration/global gates remain untouched. |

M5R-01 performs no formal writes and does not update M5 owner acceptance status.
