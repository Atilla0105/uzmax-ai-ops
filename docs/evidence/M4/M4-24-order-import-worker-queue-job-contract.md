# M4-24 Order Import Worker Queue Job Contract Evidence

> spec: `docs/specs/M4-24-order-import-worker-queue-job-contract.md`
> branch: `codex/m4-24-order-import-queue-job-contract`
> worktree: `/Users/atilla/Documents/uzmax-m4-24-order-import-queue-job-contract`
> adr: `docs/adr/ADR-B02-order-api.md`
> decision_type: `order_import_worker_queue_job_contract__no_bullmq_redis_runtime`
> redaction_status: no raw customer/order data, CSV/XLSX files, screenshots, order IDs, phone numbers, addresses, payment data, credentials, token values or env files included

## Scope

M4-24 adds a worker-side queue job/idempotency contract for the ADR-B02 no-API import snapshot path. It defines a controlled `order_import_csv_text` dispatch envelope with jobId, idempotencyKey, attempt/maxAttempts, backoffMs, enqueuedAt and a payload that reuses the existing M4-12 CSV text persistence input. Valid dispatch payloads are handed to `runOrderImportCsvTextPersistenceJob`; malformed job metadata fails before any persistence gateway method can run.

It does not add BullMQ/Redis dependencies, create a real queue consumer, connect to Redis, read files or Supabase Storage, instantiate Prisma, connect to or write a real database, change schema/migrations/generated client, add admin/API wiring, add external order API connectors, add backlog alerting or access real customer/order data.

## Validation Table

| Check | Expected | Result |
|---|---|---|
| Worktree path | `/Users/atilla/Documents/uzmax-m4-24-order-import-queue-job-contract` | passed |
| Branch | `codex/m4-24-order-import-queue-job-contract` | passed |
| Dependency install | `npm ci` | passed; npm audit reported existing 3 high severity vulnerabilities, not introduced by this PR |
| Baseline tests | `npm test` before edits | passed; 232 tests |
| Full local boundary preflight | assigned worker + root/main clean | `root_untracked_duplicate_docs_block_full_local_preflight` |
| CI-mode boundary fallback | assigned worktree check | passed |
| Manual root tracked/index evidence | root tracked diff/index clean | passed |
| Dispatch envelope | jobId/idempotencyKey/retry metadata are normalized deterministically | passed focused test |
| Fail-before-persistence | invalid metadata triggers no gateway calls | passed focused test |
| Existing persistence path | valid dispatch uses M4-12 parser/draft/persistence flow | passed focused test |
| Sensitive data/runtime | no raw data, env reads, DB connection, BullMQ/Redis dependency or external API call | passed focused test, diff review and guards |

## Boundary Preflight Note

The full local worker boundary guard failed before implementation because root/main contained five existing untracked duplicate docs:

- `docs/adr/ADR-B02-order-api 2.md`
- `docs/adr/README 2.md`
- `docs/evidence/M4/README 2.md`
- `docs/evidence/M4/spikes 2/SPK-02-order-saas-api/manifest.md`
- `docs/specs/SPK-02-order-api 2.md`

This M4-24 worker did not write those files. Because they may be user-retained local files, this PR does not delete or move them. The worker proceeded with absolute assigned worktree paths plus CI-mode boundary check and manual tracked/index clean evidence.

## Acceptance Mapping

| Item | Current M4 branch | M4-24 contribution |
|---|---|---|
| E-01 | `not_current_blocker__no_api_for_m4` | Adds no API connector and no `order_connector`. |
| E-02 | `queue_job_contract_supported_not_closed` | Adds a controlled job dispatch/idempotency contract before the existing parser/persistence path; production DB runtime, real BullMQ/Redis queue and admin E2E remain future scope. |
| E-03 | `foundation_supported_not_closed` | Valid dispatch reuses existing parser/draft path preserving expiry/source fields; persisted/runtime warning remains future scope. |
| E-04 | `foundation_supported_not_closed` | Worker only shapes import data; order-read handoff/no-fabrication path remains the AI boundary. |
| J-02 | `queue_job_contract_supported_not_closed` | Adds deterministic job id/idempotency/retry metadata contract; no real retry execution, idempotent storage lock, Redis runtime or backlog alerting is added. |
| I-01 | `not_closed` | No admin E2E workflow is added. |

## Boundary Notes

- No external order API, LLM/provider, Telegram, real customer system or production connector was called.
- No raw CSV/XLSX files, screenshots, order IDs, phone numbers, addresses, payment information, customer plaintext, credentials or env files were read into or committed by this slice.
- No `apps/api/**`, `apps/admin/**`, `packages/db/**` schema/migration/generated client, `packages/capabilities/**`, package/lock/config/CI files were modified.
- M4-24 does not change API routes, admin UI/client, Prisma schema/migrations/generated client, RLS transaction wrapper, production queue config, Redis connection, retry executor or backlog alerting.
- M4 evidence index was synchronized to include M4-24 while preserving production DB runtime, RLS transaction wrapper, real BullMQ/Redis runtime, retry execution, idempotent storage locks, backlog alerting, admin E2E, AI runtime/eval and release blockers.

## Review Closure

| Review | Finding | Resolution |
|---|---|---|
| Spec compliance | findings fixed | Read-only reviewer found incomplete M4 README J-02 mapping and pending final status rows; this evidence update adds the J-02 row and replaces pending status with current clean evidence. |
| Code quality | none | Read-only reviewer found no blocking findings; malformed dispatch metadata validates before handler/persistence, and dispatch only uses type imports from worker main. |

## PR Hygiene

| Metric | Result |
|---|---|
| Path categories | source 2, docs 3, test 2 |
| Changed source files | 2 |
| Net source LOC | 158 by `guard:pr-shape` post-commit source budget output |
| New source files | 1 |
| Source gross churn | 158 |
| Test weakening | none |
| External API/provider/connector evidence | none added |
| Exceptions | none |

## Final Validation

| Command | Result |
|---|---|
| `node --test scripts/tests/m4-order-import-worker-queue-job-contract.test.mjs scripts/tests/m4-order-import-worker-persistence-contract.test.mjs scripts/tests/m4-order-import-worker-contract.test.mjs scripts/tests/m4-order-import-parser-contract.test.mjs` | passed; 16 tests |
| `npm run format:check` | passed via focused rerun and `CI=true npm run check` |
| `npm run typecheck` | passed via focused rerun and `CI=true npm run check` |
| `npm run lint` | passed via focused rerun and `CI=true npm run check` |
| `npm run depcruise` | passed; 64 modules / 61 dependencies / no violations |
| `npm run jscpd` | passed; 0 clones |
| `npm run knip` | passed |
| `npm run guard:forbidden-terms` | passed |
| `npm run guard:eval-triggers` | passed; no eval-triggering paths changed |
| `npm run guard:doc-triggers` | passed |
| `git diff --check` | passed |
| `CI=true npm run check` | passed; 236 Node tests, build, size 57.17 kB brotlied, 11 Playwright tests |
| `node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M4-24-order-import-worker-queue-job-contract.md` | passed post-commit; 7 changed files, categories source 2/docs 3/test 2, source netLoc 158/new source files 1 |
| assigned worktree final status | clean after amend expected; final pre-PR status check required |
| root/main final status | root tracked/index clean; existing untracked duplicate docs remain unless owner authorizes cleanup |
