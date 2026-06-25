# M5R-05 Logs + Analytics Runtime Evidence

## Start Audit

Recorded on 2026-06-25 before implementation edits from the assigned M5R-05 worktree.

| Fact | Evidence |
|---|---|
| assigned worktree `pwd` | `/private/tmp/uzmax-m5r-05-logs-analytics-runtime` |
| assigned `git status --short --branch` | `## codex/m5r-05-logs-analytics-runtime` |
| assigned `git branch --show-current` | `codex/m5r-05-logs-analytics-runtime` |
| worker `HEAD` | `73d1a2d1c382c05e5d77f7cb17b3be1ad8f9a62e` |
| worker `origin/main` | `73d1a2d1c382c05e5d77f7cb17b3be1ad8f9a62e` |
| root/main status | `/Users/atilla/Documents/UZMAX智能运营` -> `## main...origin/main` |
| open PR audit | `gh pr list --state open --json number,title,headRefName,url,isDraft` returned `[]` |
| root no-merged branch audit before edits | `git branch --no-merged main` returned no branch output |
| linked worktree git-dir/common-dir | worker git dir `/Users/atilla/Documents/UZMAX智能运营/.git/worktrees/uzmax-m5r-05-logs-analytics-runtime`; common dir `/Users/atilla/Documents/UZMAX智能运营/.git`; superproject empty |
| node_modules | missing at start; `npm ci` installed locked dependencies before validation |

## Scope

M5R-05 adds a minimal runtime source for:

- `login_log` filtered readback;
- `presence_log` filtered readback;
- operation log filtered readback through existing `audit_log`;
- fixed board values from existing `confirmation_item`, `distill_health_daily` and `ai_member`;
- controlled `export_job` draft creation with owner confirmation required and `fileRef: null`.

Allowed files are exactly the allowlist in `docs/specs/M5R-05-logs-analytics-runtime.md`. Root/main checkout is read-only for this worker.

## Current DB Contract Check

Existing DB/runtime tables before M5R-05:

- present: `audit_log`, `confirmation_item`, `distill_health_daily`, `ai_member`, `ai_member_version`, `ai_capability_toggle`;
- absent: `login_log`, `presence_log`, `export_job`, `metric_daily`.

M5R-05 adds only the missing `login_log`, `presence_log` and `export_job` objects. It does not add `metric_daily`; fixed board values are derived directly from current runtime tables for this slice.

## Boundaries

This slice does not implement admin UI runtime wiring, Playwright API-backed admin closure, broad BI aggregation, `metric_daily`, saved views, worker/cron analytics aggregation, production export pipelines, real export files, raw message scanning, customer/order data readback, external provider calls, customer LLM, production deploy, GA-0, M6, M5 owner acceptance or 1.0 release behavior.

## No Sensitive Data Statement

This evidence, spec, tests and implementation must not include raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets. M5R-05 uses synthetic UUIDs, controlled refs, synthetic org/tenant names and structured metadata only. Export draft creation records metadata and `fileRef: null`; it does not create a sensitive export file.

## Runtime/RLS Evidence

- `apps/api/src/logs-analytics-runtime.ts` exposes the minimal API controller.
- `apps/api/src/logs-analytics-runtime.contracts.ts` validates filters, controlled refs and export draft input.
- `apps/api/src/logs-analytics-runtime.repository.ts` uses explicit `rls_prisma_gateway`, rejects bare `prisma_gateway`, uses `createRlsTransactionContext`, sets restricted app runtime role and transaction-scoped `app.org_id` / `app.tenant_id`, then reads/writes only the scoped runtime tables.
- `packages/db/migrations/0008_m5r05_logs_analytics_runtime.sql` enables forced RLS and grants select/insert only for `login_log`, `presence_log` and `export_job`.
- Operation log readback omits unconstrained `audit_log.object_id`, including unsafe values like `customer-plain-123`, and strips `memberUserId` from `audit_log.findMany` where clauses because `AuditLog` has no `memberUserId` column.
- Export draft metadata persists `logKinds` along with controlled metric/reason refs so the owner can verify draft scope without opening a sensitive export file.
- `apps/api/src/app.module.ts` wires the controller/repository provider disabled by default; default runtime does not require DB env.
- `apps/api/scripts/runtime-compiler.mjs` emits the logs analytics runtime modules for focused Node tests and true DB smoke support.
- `scripts/tests/m5r-logs-analytics-runtime.test.mjs` proves filtered readback, fixed board derivation, export draft governance, missing-env fail-closed behavior and no `metric_daily`.

## True DB/RLS Smoke Status

`blocked_by_missing_env`.

Command:

`node packages/db/scripts/run-m5r-logs-analytics-true-db-smoke.mjs`

Result: expected fail-closed before Prisma client construction or DB mutation.

Exact local error:

`Error: UZMAX_RLS_DATABASE_URL is required`

The support runner is ready to execute same-tenant positive and wrong-tenant/missing-context negative DB/RLS probes when `UZMAX_RLS_DATABASE_URL` is available. The focused contract test also proves the missing-env fail-closed behavior.

## Validation

Final validation refreshed on 2026-06-25 from `/private/tmp/uzmax-m5r-05-logs-analytics-runtime` after the PR #124 review blockers were fixed.

| Command | Result | Notes |
|---|---|---|
| `npm ci` | pass | Installed locked dependencies because `node_modules` was missing at worker start. |
| `gh run view 28161810760 --log-failed` | pass/inspected | Confirmed old CI failed at `npm run guard:pr-shape -- --base origin/main` because the PR body lacked `Spec ID` and `Spec file`. |
| `npx prisma generate --schema packages/db/prisma/schema.prisma` | pass | Re-run after minimizing schema churn; no `prisma format` was run for this blocker fix. |
| `node --test scripts/tests/m5r-logs-analytics-runtime.test.mjs` | pass | 5/5 focused tests passed. |
| `node packages/db/scripts/run-m5r-logs-analytics-true-db-smoke.mjs` | expected fail-closed | Missing `UZMAX_RLS_DATABASE_URL`; exact error `UZMAX_RLS_DATABASE_URL is required`. |
| `npm run typecheck -- --pretty false` | pass | TypeScript no-emit check passed. |
| `npm run lint` | pass | ESLint passed after splitting validation helper complexity. |
| `npm run knip` | pass | No unused exports. |
| `npm run jscpd` | pass | No duplicates found. |
| `npm run depcruise` | pass | No dependency violations. |
| `npm run format:check` | pass | Prettier check passed. |
| `npm run guard:prettier-ignore -- --base origin/main` | pass | Frozen ignore boundary and diff check passed. |
| `npm run guard:forbidden-terms` | pass | Forbidden terms guard passed. |
| `npm run guard:eval-triggers -- --base origin/main` | pass | No eval-triggering paths changed. |
| `npm run guard:doc-triggers` | pass | `doc-trigger-paths: ok`. |
| `npm run guard:workspace` | pass | Linked worker worktree accepted; dirty allowed. |
| `npm run guard:worker-boundary -- --assigned /private/tmp/uzmax-m5r-05-logs-analytics-runtime --root /Users/atilla/Documents/UZMAX智能运营` | pass | Assigned/root boundary check passed. |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M5R-05-logs-analytics-runtime.md --include-worktree` | pass | PR body includes `Spec ID: M5R-05`, `Spec file: docs/specs/M5R-05-logs-analytics-runtime.md` and `Exception: large_change_exception`. Guard report: 13 changed files; categories source 7/docs 3/generated 1/test 2; source changed files 7, net LOC +722, new files 4. |
| `npm run guard:pr-shape -- --base origin/main` | pass | Re-ran the exact failed CI command after PR body metadata update. |
| `git diff --check origin/main` | pass | No whitespace errors in committed and worktree changes before amend. |
| `npm run test` | pass | Full Node suite passed: 381 tests, 76 suites, 0 failures. |
| `npm run build` | pass | API/worker/cron type-only builds and admin Vite build passed. |
| `npm run size` | pass | Admin size limit passed: 67.07 kB brotlied / 250 kB limit. |

## Source Budget

Manual source budget from `git diff --numstat origin/main`:

| Metric | Value | Budget status |
|---|---:|---|
| changed source files | 7 | within target `<= 9` |
| net source LOC | +722 | exceeds default `<= 600` and spec target `<= 650`; see `large_change_exception` |
| new source files | 4 | within target `<= 4` |
| migration LOC | +159 | migration, not source budget |
| test LOC | +533 | test, not source budget |
| docs LOC | +338 / -1 | docs, not source budget |

Source files counted:

- `apps/api/scripts/runtime-compiler.mjs`: +41 / -0
- `apps/api/src/app.module.ts`: +23 / -0
- `apps/api/src/logs-analytics-runtime.contracts.ts`: +218 / -0
- `apps/api/src/logs-analytics-runtime.repository.ts`: +235 / -0
- `apps/api/src/logs-analytics-runtime.ts`: +117 / -0
- `packages/db/prisma/schema.prisma`: +79 / -0 after removing unrelated Prisma alignment churn
- `packages/db/scripts/run-m5r-logs-analytics-true-db-smoke.mjs`: +9 / -0

`large_change_exception`: manual source net LOC is +722, which exceeds both the AGENTS.md default +600 source budget and the M5R-05 spec target +650. Changed source files are 7 and new source files are 4, both within their targets. Splitting would break M5R-05 acceptance because the minimal schema/RLS runtime, API readback, export draft creation, true DB smoke entrypoint and focused test harness are one proof loop. This exception is source-size governance only; it is not owner acceptance, production approval or release approval.

## Spec Compliance Review

Pass.

- One spec only: `docs/specs/M5R-05-logs-analytics-runtime.md`.
- Touch list is limited to M5R-05 docs/evidence, minimal DB schema/migration/RLS, minimal API runtime source, focused test and true DB smoke support.
- `metric_daily` is not added.
- Existing `audit_log`, `confirmation_item`, `distill_health_daily` and `ai_member` tables are reused for operation logs and fixed board values.
- `login_log`, `presence_log` and `export_job` have org/tenant scope, forced RLS and select/insert grants only; no delete grant.
- Export draft creation records metadata and returns `fileRef: null`; no export file is created.
- No admin UI runtime wiring, Playwright API-backed admin closure, worker/cron aggregation, real customer/order data, raw message scans, external provider calls, production deploy or owner acceptance claim is included.
- True DB/RLS remains blocked only by missing `UZMAX_RLS_DATABASE_URL`.
- No tests were deleted, skipped, weakened, broadened by mock expansion or snapshot-inflated.

## Code Quality Review

Pass.

- Runtime mode is explicit and fail-closed: default disabled, `rls_prisma_gateway` only, bare `prisma_gateway` rejected.
- RLS transaction setup mirrors prior M5R patterns while avoiding duplicate helper shapes caught by `jscpd`.
- Contracts reject unsafe raw/export/customer/order/secret/file-like payload keys and inline blob/URL/base64-like refs.
- Repository returns bounded readback rows and exposes only structured status/controlled refs, not raw audit content.
- Board derivation is intentionally narrow and avoids `metric_daily` or broad BI aggregation.
- Focused tests cover the fake Prisma transaction shape, board math, export draft governance and missing-env true DB failure.

## Acceptance Mapping

| Item | M5R-05 status | Evidence target |
|---|---|---|
| I-06 | `logs_analytics_runtime_supported_not_admin_wired` | Runtime API/DB source supports fixed board and controlled export draft; admin runtime wiring remains M5R-07. |
| I-07 | `login_presence_operation_logs_runtime_supported_not_full_logs_center_closed` | Login/presence tables and `audit_log` readback support log center runtime; full visible logs center closure remains M5R-07/M5R-08. |
| H-07 | `distill_health_board_source_read_supported_not_new_distill_runtime` | Reads existing `distill_health_daily`; no new distill scheduler behavior. |
| J-05 | `m5r_05_runtime_evidence_added_not_owner_accepted` | This evidence records M5R-05 only; no M5 owner acceptance or release signoff. |
| K-03 | `active` | One spec / one PR; current branch implements only M5R-05. |
| K-04 | `active` | Worker worktree/branch/touch list are scoped; schema/migration/RLS are globally serial for this worker. |

M5R-05 does not update M5 owner acceptance status.
