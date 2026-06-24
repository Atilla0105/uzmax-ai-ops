# M5R-02 Formal Write Pipeline Evidence

## Start Audit

Recorded on 2026-06-24 before source/test implementation edits from the assigned M5R-02 worktree.

| Fact | Evidence |
|---|---|
| assigned worktree `pwd` | `/Users/atilla/Documents/uzmax-m5r-02-formal-write-pipeline` |
| assigned `git status --short --branch` | `## codex/m5r-02-formal-write-pipeline...origin/main` |
| assigned `git branch --show-current` | `codex/m5r-02-formal-write-pipeline` |
| worker `HEAD` | `824491dd2738c048f4a6812f02a222e592b34c98` |
| worker `origin/main` | `824491dd2738c048f4a6812f02a222e592b34c98` |
| root/main status | `/Users/atilla/Documents/UZMAX智能运营` -> `## main...origin/main` |
| root/main branch | `main` |
| root/main `HEAD` | `824491dd2738c048f4a6812f02a222e592b34c98` |
| root/main `origin/main` | `824491dd2738c048f4a6812f02a222e592b34c98` |
| open PR audit | `gh pr list --state open --json number,headRefName,baseRefName,title,url` returned `[]` |
| root no-merged branch audit before edits | `git branch --no-merged main` returned no branch output |
| linked worktree list | root worktree `/Users/atilla/Documents/UZMAX智能运营` on `refs/heads/main`; worker worktree `/Users/atilla/Documents/uzmax-m5r-02-formal-write-pipeline` on `refs/heads/codex/m5r-02-formal-write-pipeline` |
| linked worktree git-dir/common-dir | worker git dir `/Users/atilla/Documents/UZMAX智能运营/.git/worktrees/uzmax-m5r-02-formal-write-pipeline`; common dir `/Users/atilla/Documents/UZMAX智能运营/.git`; superproject empty |
| node_modules | missing at start; `npm ci` was required before baseline validation |

## Baseline

| Command | Result | Notes |
|---|---|---|
| `npm ci` | pass | Installed 360 packages and found 0 vulnerabilities in the assigned worktree. |
| `node --test scripts/tests/m5-confirmation-queue-api.test.mjs` | pass | Baseline M5-03 focused API contract passed: 6/6 tests. |
| `node --test scripts/tests/m5r-confirmation-queue-persistence.test.mjs` | pass | Baseline M5R-01 persistence/runtime contract passed: 4/4 tests. |

## Scope

M5R-02 adds one named formal-write proof path:

- input: approved/edited confirmation queue decision;
- target: `config_version` row with `config_domain = business_config` unless the controlled target ref names another existing `config_version_domain`;
- audit: `audit_log` row with confirmer, diff and target ref;
- feedback: `confirmation_item.audit_log_id`, `target_kind`, `target_ref` and formal-write status metadata.

Allowed files are exactly the allowlist in `docs/specs/M5R-02-formal-write-pipeline.md`. Root/main checkout is read-only for this worker.

## Current DB Contract Check

The existing DB contract already contains:

- `config_version` Prisma model/table, positive version constraint, object payload constraint, tenant FK, forced RLS select/insert policies and `uzmax_app_runtime` select/insert grants.
- `audit_log` Prisma model/table, object content with required `before` and `after`, tenant FK, forced RLS select/insert policies and `uzmax_app_runtime` select/insert grants.
- `confirmation_item` Prisma model/table with `target_kind`, `target_ref`, `audit_log_id`, `metadata`, mutable status/reviewer fields, forced RLS select/insert/update policies and `uzmax_app_runtime` select/insert/update grants.

M5R-02 therefore does not add Prisma schema, migration, RLS policy or generated-client changes.

## Boundaries

This slice does not implement full H-01 knowledge authoring, admin runtime wiring, distill scheduler, worker/cron behavior, template copy runtime, eval publishing, AI member runtime control, schema/migration changes, production deploy, external SaaS onboarding, real customer/order data, customer LLM, real LLM calls, GA-0, M6, M5 owner acceptance or 1.0 release behavior.

## No Sensitive Data Statement

This evidence, spec, tests and implementation must not include raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets. M5R-02 uses synthetic UUIDs, controlled refs, synthetic org/tenant names and structured metadata only.

## Runtime/RLS Evidence

M5R-02 implements a config/audit-only proof path:

- `ConfirmationQueueService` lets the explicit RLS formal-write pipeline atomically commit approved/edited decisions before the normal repository save path; disabled/default mode still uses the existing repository save path.
- Default AppModule/runtime wiring uses `DisabledConfirmationFormalWritePipeline`, so M5-03 in-memory/no-RLS behavior still performs no formal write and does not require DB env.
- Explicit formal writes require `UZMAX_CONFIRMATION_FORMAL_WRITE_MODE=rls_prisma_gateway`; bare `prisma_gateway` is rejected with `formal write env runtime must use RLS Prisma gateway`.
- The RLS Prisma formal-write pipeline uses repo-local `createRlsTransactionContext`, `set local role "uzmax_app_runtime"`, transaction-scoped `app.org_id` and `app.tenant_id`, then creates `config_version`, creates `audit_log`, and updates `confirmation_item` status/audit/target metadata in the same RLS transaction.
- If target validation or the formal-write transaction fails, the service has not saved approved/edited status through the repository, so the confirmation item remains pending/unmodified with no `auditLogId`.
- Approved/edited decisions write only when `targetKind` is `config_version` and `targetRef` matches `controlled://config-version/<business_config|feature_flag|template_copy>/<key>`.
- Pending/discarded/blocked decisions return `formalWrite: false` and never call `configVersion.create` or `auditLog.create`.
- Conflict candidates require side-by-side diff before approve/edit through existing M5-03 validation and are rechecked before formal write.
- The audit contract includes `confirmerUserId`, `diffPayload`, `targetKind`, `targetRef`, previous version ref when present, and confirmation item trace.
- The confirmation item update records `auditLogId`, `targetKind: "config_version"`, `targetRef`, reviewer fields, and `metadata.formalWrite.status = "written"`.

Implementation source remains within M5R-02 budget: 8 changed source files, 3 new source files, and +591 net source LOC for source-classified files after the source-budget trim.

## True DB/RLS Smoke Status

`blocked_by_missing_env`

Command:

```bash
env -u UZMAX_RLS_DATABASE_URL node packages/db/scripts/run-m5r-formal-write-true-db-smoke.mjs
```

Result: expected fail-closed before DB mutation:

```text
Error: UZMAX_RLS_DATABASE_URL is required
    at readRlsDatabaseUrl (.../packages/db/scripts/tests/run-m5r-formal-write-true-db-smoke.mjs:142:21)
```

The runner calls `readRlsDatabaseUrl()` before constructing `PrismaClient`, so the missing-env path does not open a DB connection or mutate data. Static/focused tests prove the same fail-closed behavior and the non-RLS/bare Prisma bypass rejection.

If `UZMAX_RLS_DATABASE_URL` is later provided, the runner path is `node packages/db/scripts/run-m5r-formal-write-true-db-smoke.mjs`. It seeds synthetic org/tenant/confirmation rows, uses the restricted app runtime role/RLS transaction context, proves approved/edited `config_version` + `audit_log` writes, proves pending/discarded/blocked no-writes, checks wrong-tenant and missing-context RLS negatives, cleans synthetic rows, and asserts residue `0`.

## Validation

| Command | Result | Notes |
|---|---|---|
| `node --test scripts/tests/m5r-formal-write-pipeline.test.mjs` | pass | 6/6 tests, including the approved/edited half-state regression. |
| `env -u UZMAX_RLS_DATABASE_URL node packages/db/scripts/run-m5r-formal-write-true-db-smoke.mjs` | expected fail closed | Blocked by missing env before mutation: `Error: UZMAX_RLS_DATABASE_URL is required`. |
| `node --test scripts/tests/m5-confirmation-queue-api.test.mjs` | pass | 6/6 tests; default M5-03 decisions still do not formally write. |
| `node --test scripts/tests/m5r-confirmation-queue-persistence.test.mjs` | pass | 4/4 tests; M5R-01 persistence behavior preserved. |
| `npm run typecheck -- --pretty false` | pass | TypeScript validation passed. |
| `npm run lint` | pass | ESLint validation passed. |
| `npm run jscpd` | pass | CI duplicate check passed with 0 clones after the M5R-02 helper-shape rewrite. |
| `npm run knip` | pass | No unused file/export findings. |
| `npm run format:check` | pass | Prettier check passed. |
| `npm run depcruise` | pass | Dependency boundary check passed. |
| `npm run guard:workspace` | pass | Linked worker worktree accepted; root/main remained clean. |
| `npm run guard:worker-boundary -- --assigned-worktree /Users/atilla/Documents/uzmax-m5r-02-formal-write-pipeline --primary-root /Users/atilla/Documents/UZMAX智能运营` | pass | Explicit worker/root isolation check passed. |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M5R-02-formal-write-pipeline.md --include-worktree` | pass | Scope and budget check passed. |
| `git diff --check origin/main...HEAD` | pass | No whitespace errors. |
| `npm run test` | pass | 366/366 tests passed. |

## Spec Compliance Review

- Correct spec referenced: `docs/specs/M5R-02-formal-write-pipeline.md`.
- Scope stayed within the spec touch list and named config/audit formal-write path.
- No Prisma schema, migration, RLS policy, generated client, lockfile, shared config, CI/guard, admin UI, worker, cron, distill scheduler, template runtime, eval publishing, AI member runtime control, external provider or production/release file was changed.
- Existing DB contracts were sufficient; no schema widening was needed.
- No tests were deleted, skipped, weakened, broadened by mock expansion, or snapshot-inflated.
- New source file search conclusion is recorded in the spec: no existing formal-write orchestrator existed; the new source lives in confirmation queue runtime files because it is triggered by confirmation decisions.
- Source budget is within target: changed source files <= 8, net source LOC <= 600, new source files <= 3.
- No sensitive data, real customer data, real order data, real LLM calls, secrets or external SaaS onboarding are included.

## Code Quality Review

- The formal-write port is disabled by default and injected, keeping existing M5-03/M5R-01 runtime behavior stable; the RLS implementation uses the optional atomic `commitDecision` hook for approved/edited writes.
- The DB/RLS path is explicit and fail-closed: no env means no Prisma client construction; non-RLS mode is rejected.
- The approved/edited half-state regression proves invalid formal-write target validation fails before repository persistence and leaves the confirmation item pending with no `auditLogId`.
- RLS transaction setup is centralized in the formal-write runner and mirrors existing repo patterns.
- Contract construction is separated from the orchestrator so target parsing, metadata, config-version data and audit content are testable without broad service changes.
- The M5R-02 CI duplicate fix rewrites only helper shapes in the formal-write runtime and true DB smoke support; it does not lower `jscpd` thresholds or delete smoke assertions.
- The M5R-02 focused test uses an isolated runtime compiler cache directory, avoiding parallel `npm run test` races with the M5-03 confirmation queue test.
- The true DB smoke support is synthetic-only, cleans up rows, and asserts residue `0`.
- File-length and complexity budgets remain under repo limits after the source-budget trim.

## Acceptance Mapping

| Item | M5R-02 status | Evidence target |
|---|---|---|
| H-01 | `limited_config_formal_write_supported_not_full_h01_closed` | Minimal config-version proof path only; full knowledge facts/journeys/stages/materials authoring remains future scope. |
| H-02 | `formal_write_gate_supported_for_named_config_path` | Approved/edited decisions can write only the named `config_version` + `audit_log` path; pending/discarded/blocked cannot write. |
| H-03 | `diff_required_before_named_formal_write` | Conflict candidate side-by-side diff is required before approve/edit and rechecked before formal write. |
| I-02 | `api_runtime_formal_write_supported_not_admin_closed` | Runtime API/service path supports later admin/mobile fallback; admin runtime wiring remains M5R-07. |
| J-05 | `m5r_02_runtime_evidence_added_not_owner_accepted` | This evidence records M5R-02 only; no M5 owner acceptance or release signoff. |
| K-03 | `active` | One spec / one PR; current branch implements only M5R-02. |
| K-04 | `active` | Worker worktree/branch/touch list are scoped; schema/migration/global gates remain untouched. |

M5R-02 performs no broad H-01 authoring and does not update M5 owner acceptance status.
