# M4-27 Order Import Worker Prisma Persistence Gateway Contract Evidence

> spec: `docs/specs/M4-27-order-import-worker-prisma-persistence-gateway-contract.md`
> branch: `codex/m4-27-order-import-worker-prisma-persistence`
> worktree: `/Users/atilla/Documents/uzmax-m4-27-order-import-worker-prisma-persistence`
> adr: `docs/adr/ADR-B02-order-api.md`
> decision_type: `order_import_worker_prisma_persistence_gateway_contract__explicit_no_default_runtime`
> redaction_status: no raw customer/order data, CSV/XLSX files, screenshots, order IDs, phone numbers, addresses, payment data, credentials, token values or env files included

## Scope

M4-27 adds a Prisma-shaped worker persistence adapter for the ADR-B02 no-API import snapshot path. It exports `PrismaOrderImportWorkerPersistenceGateway`, which implements the existing M4-12 `OrderImportWorkerPersistenceGateway` and maps worker drafts to `importJob.create`, `orderSnapshot.createMany` and `importRowError.createMany`.

The adapter is opt-in and accepts only a narrow Prisma-shaped client port. It validates the client and draft records before delegate calls, uses no-op behavior for empty snapshot/error batches, and preserves the existing M4-12 persistence order when used with `runOrderImportCsvTextPersistenceJob`.

It does not default-enable Prisma/RLS runtime wiring, import `@prisma/client`, instantiate `PrismaClient`, read env, connect to or write a real database, change schema/migrations/generated client, add BullMQ/Redis queues, production config, external order API connectors, AI runtime/eval or real customer/order data access.

## Validation Table

| Check | Expected | Result |
|---|---|---|
| Worktree path | `/Users/atilla/Documents/uzmax-m4-27-order-import-worker-prisma-persistence` | passed; `pwd` matched assigned worktree |
| Branch | `codex/m4-27-order-import-worker-prisma-persistence` | passed; `git branch --show-current` matched assigned branch |
| Dependency install | `npm ci` | passed; npm audit reported existing 3 high severity findings |
| Full local boundary preflight | assigned worker + root/main clean | `root_untracked_duplicate_docs_block_full_local_preflight` |
| CI-mode boundary fallback | assigned worktree check | passed |
| Manual root tracked/index evidence | root tracked diff/index clean, no open PRs | passed before edits |
| Delegate shape | import job create, snapshot/error createMany with skipDuplicates | passed focused test |
| Existing persistence order | existing worker job calls import job -> snapshots -> row errors | passed focused test |
| Empty batch behavior | empty snapshot/error arrays do not call createMany | passed focused test |
| Fail-closed client/drafts | malformed client/drafts fail before delegate calls | passed focused test |
| Sensitive data/runtime | no raw data, env reads, DB connection, PrismaClient, BullMQ/Redis or external API call | passed focused test, static source checks and full guards |

## Boundary Preflight Note

The full local worker boundary guard is expected to keep failing on root/main untracked duplicate docs that predate this worker:

- `docs/adr/ADR-B02-order-api 2.md`
- `docs/adr/README 2.md`
- `docs/evidence/M4/README 2.md`
- `docs/evidence/M4/spikes 2/SPK-02-order-saas-api/manifest.md`
- `docs/specs/SPK-02-order-api 2.md`

This M4-27 slice does not delete those files. It proceeds with absolute assigned worktree paths plus CI-mode boundary check and manual root tracked/index clean evidence.

## Acceptance Mapping

| Item | Current M4 branch | M4-27 contribution |
|---|---|---|
| E-01 | `not_current_blocker__no_api_for_m4` | Adds no API connector and no `order_connector`. |
| E-02 | `worker_prisma_persistence_gateway_contract_supported_not_closed` | Adds a worker-side Prisma-shaped write adapter for import job/snapshot/error drafts; production DB client runtime/RLS integration, parser, queue and admin E2E remain future scope. |
| E-03 | `foundation_supported_not_closed` | Worker write adapter preserves source/update/expiry fields from existing drafts; persisted warning runtime and E2E stale sample evidence remain future scope. |
| E-04 | `foundation_supported_not_closed` | No AI runtime/eval is added; no fabricated order status path is added. |
| J-02 | `queue_runtime_not_closed` | No real BullMQ/Redis runtime, retry execution, idempotent storage locks or backlog alerting is added. |
| I-01 | `not_closed` | No admin E2E workflow is added. |

## Boundary Notes

- No external order API, LLM/provider, Telegram, real customer system or production connector was called.
- No raw CSV/XLSX files, screenshots, order IDs, phone numbers, addresses, payment information, customer plaintext, credentials or env files were read into or committed by this slice.
- No `apps/api/**`, `apps/admin/**`, `packages/db/**` schema/migration/generated client, `packages/capabilities/**`, package/lock/config/CI files were modified.
- M4-27 does not change API routes, admin UI/client, Prisma schema/migrations/generated client, production provider config, Redis connection or retry executor.
- M4 evidence index was synchronized to include M4-27 while preserving production DB runtime, RLS integration, queue runtime, admin E2E, AI runtime/eval and release blockers.

## Review Closure

| Review | Finding | Resolution |
|---|---|---|
| Spec compliance | no findings | Local read-only review confirmed changes stay inside the M4-27 touch list, preserve no-API/no-runtime boundaries, keep prior M4 blockers visible and satisfy validation evidence. |
| Code quality | no findings after type refinement | Local read-only review tightened `createMany` port data from readonly to mutable array for closer Prisma delegate compatibility; focused and full validation passed after the refinement. |

## PR Hygiene

| Metric | Result |
|---|---|
| Path categories | source 2, docs 3, test 2 |
| Changed source files | 2 |
| Net source LOC | +89 by source paths before staging: +1 in `main.ts`, +88 new adapter |
| New source files | 1 |
| Source gross churn | 89 lines by source paths before staging |
| Test weakening | none |
| External API/provider/connector evidence | existing Prisma schema/package evidence only; none added |
| Exceptions | none |

## Final Validation

| Command | Result |
|---|---|
| `node --test scripts/tests/m4-order-import-worker-prisma-persistence-contract.test.mjs scripts/tests/m4-order-import-worker-persistence-contract.test.mjs scripts/tests/m4-order-import-worker-queue-job-contract.test.mjs scripts/tests/m4-order-import-worker-contract.test.mjs scripts/tests/m4-order-import-parser-contract.test.mjs` | passed; 20 tests |
| `npm run format:check` | passed via focused rerun and `CI=true npm run check` |
| `npm run typecheck` | passed via focused rerun and `CI=true npm run check` |
| `npm run lint` | passed via focused rerun and `CI=true npm run check` |
| `npm run depcruise` | passed; 69 modules / 66 dependencies / no violations |
| `npm run jscpd` | passed; 0 clones |
| `npm run knip` | passed |
| `npm run guard:forbidden-terms` | passed |
| `npm run guard:eval-triggers` | passed; no eval-triggering paths changed |
| `npm run guard:doc-triggers` | passed |
| `git diff --check && git diff --cached --check` | passed before staging |
| `CI=true npm run check` | passed; 250 Node tests, build, size 57.17 kB admin brotli bundle, 11 Playwright tests |
| `node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M4-27-order-import-worker-prisma-persistence-gateway-contract.md --include-worktree` | passed before staging; changedFiles 7, categories source 2/docs 3/test 2 |
| assigned worktree final status | pending final commit/PR |
| root/main final status | passed before PR; tracked diff/index clean and no open PRs |
