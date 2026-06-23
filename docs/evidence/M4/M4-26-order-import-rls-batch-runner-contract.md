# M4-26 Order Import RLS Batch Runner Contract Evidence

> spec: `docs/specs/M4-26-order-import-rls-batch-runner-contract.md`
> branch: `codex/m4-26-order-import-rls-batch-runner`
> worktree: `/Users/atilla/Documents/uzmax-m4-26-order-import-rls-batch-runner`
> adr: `docs/adr/ADR-001-rls-prisma-pool.md`
> incident: `docs/incidents/INC-2026-06-23-m4-26-root-write-boundary.md`
> decision_type: `order_import_rls_batch_runner_contract__explicit_no_default_runtime`
> redaction_status: no raw customer/order data, CSV/XLSX files, screenshots, order IDs, phone numbers, addresses, payment data, credentials, token values or env files included

## Scope

M4-26 adds a narrow Prisma-shaped RLS batch transaction runner contract for the ADR-B02 no-API import snapshot path. It exports `createOrderImportRlsBatchTransactionRunner`, which consumes the M4-25 `OrderImportRlsTransactionInput` context and creates one batch `$transaction([...])` ordered as `SET LOCAL ROLE`, org `set_config`, tenant `set_config`, then the business Prisma-shaped operation.

The RLS persistence gateway path was split into `apps/api/src/order-import.persistence-gateway.ts` so nullable row reads use raw Prisma-shaped operation helpers and optional post-transaction mapping. This prevents async gateway wrappers from awaiting delegate calls before the batch transaction.

It does not default-enable Prisma/RLS runtime wiring, import `@prisma/client`, instantiate `PrismaClient`, read env, connect to or write a real database, change schema/migrations/generated client, add BullMQ/Redis queues, production config, external order API connectors, AI runtime/eval or real customer/order data access.

## Validation Table

| Check | Expected | Result |
|---|---|---|
| Worktree path | `/Users/atilla/Documents/uzmax-m4-26-order-import-rls-batch-runner` | passed; `pwd` matched assigned worktree |
| Branch | `codex/m4-26-order-import-rls-batch-runner` | passed; `git branch --show-current` matched assigned branch |
| Dependency install | `npm ci` | passed; npm audit reported existing 3 high severity findings |
| Baseline tests | `npm test` before edits or after dependency install | not run before accepted worktree edits; full focused and full check validation were run after boundary cleanup |
| Boundary incident | root/main accidental M4-26 draft write recorded and cleaned | passed; incident file added and root/main tracked diff/index cleaned |
| Full local boundary preflight | assigned worker + root/main clean | `root_untracked_duplicate_docs_block_full_local_preflight` expected after cleanup |
| CI-mode boundary fallback | assigned worktree check | passed; `CI=true UZMAX_ASSIGNED_WORKTREE=... UZMAX_PRIMARY_ROOT=... npm run guard:worker-boundary` |
| Manual root tracked/index evidence | root tracked diff/index clean, no index lock | passed; root/main `git status --short --branch --untracked-files=no` returned only `## main...origin/main`, `git diff --quiet` and `git diff --cached --quiet` passed |
| Batch transaction order | role -> org set_config -> tenant set_config -> business query | passed by focused Node test |
| Business result | runner returns final transaction result | passed by focused Node test |
| Raw operation mapping | RLS gateway raw operations enter `$transaction`; nullable mapping happens after transaction | passed by focused Node test |
| Fail-closed client/context | malformed client/context/query and unsafe `roleSql` fail before `$transaction` | passed by focused Node test |
| Default runtime provider | AppModule remains in-memory by default and does not register runner | passed by focused Node test |
| Sensitive data/runtime | no raw data, env reads, DB connection, PrismaClient, BullMQ/Redis or external API call | passed by focused Node test and static source checks |

## Boundary Preflight Note

The full local worker boundary guard is expected to keep failing on root/main untracked duplicate docs that predate this worker:

- `docs/adr/ADR-B02-order-api 2.md`
- `docs/adr/README 2.md`
- `docs/evidence/M4/README 2.md`
- `docs/evidence/M4/spikes 2/SPK-02-order-saas-api/manifest.md`
- `docs/specs/SPK-02-order-api 2.md`

This M4-26 slice does not delete those files. It records a separate root write incident because the first delegated worker draft wrote M4-26 files into root/main before the coordinator migrated reviewed patches into the assigned worktree.

## Acceptance Mapping

| Item | Current M4 branch | M4-26 contribution |
|---|---|---|
| B-01 | `rls_batch_runner_contract_supported_not_closed` | Adds a Prisma-shaped ADR-001 batch transaction runner contract for order import reads; full SQL/RLS unauthorized integration evidence remains future scope. |
| E-01 | `not_current_blocker__no_api_for_m4` | Adds no API connector and no `order_connector`. |
| E-02 | `rls_batch_runner_contract_supported_not_closed` | Completes the M4-25 runner call-site contract with a batch runner contract; production DB runtime, parser, queue and admin E2E remain future scope. |
| E-03 | `runtime_provider_contract_supported_not_closed` | Future DB-backed stale/missing warning path can run behind explicit RLS transaction mode and batch runner contract; persisted warning, real DB/runtime and E2E stale sample evidence remain future scope. |
| E-04 | `foundation_supported_not_closed` | No AI runtime/eval is added; no fabricated order status path is added. |
| J-02 | `queue_runtime_not_closed` | No real BullMQ/Redis runtime, retry execution, idempotent storage locks or backlog alerting is added. |
| I-01 | `partial_api_runtime_not_closed` | API module has a contract anchor for the batch runner; full desktop order/customer workflow remains future scope. |

## Boundary Notes

- No external order API, LLM/provider, Telegram, real customer system or production connector was called.
- No raw CSV/XLSX files, screenshots, order IDs, phone numbers, addresses, payment information, customer plaintext, credentials or env files were read into or committed by this slice.
- No `packages/db/**`, `packages/capabilities/**`, `apps/worker/**`, `apps/admin/**`, `packages/engine/**`, package/lock/config/CI files were modified.
- M4-26 does not change API routes, admin UI/client, worker import queue, Prisma schema/migrations/generated client, production provider config, Redis connection or retry executor.
- M4 evidence index was synchronized to include M4-26 while preserving production DB runtime, queue runtime, admin E2E, AI runtime/eval and release blockers.

## Review Closure

| Review | Finding | Resolution |
|---|---|---|
| Spec compliance | no findings | final read-only re-review confirmed scope, touch list, budgets, boundaries and evidence wording |
| Code quality | prior findings fixed; no remaining findings | split raw gateway operations into `order-import.persistence-gateway.ts`, added post-transaction `mapResult`, validated exact safe `set local role "<identifier>"`, added focused tests, then final read-only re-review found no remaining code-quality issues |

## PR Hygiene

| Metric | Result |
|---|---|
| Path categories | source 6, docs 4, test 6 |
| Changed source files | 6 |
| Net source LOC | +230 by `git diff --numstat` source paths |
| New source files | 2 |
| Source gross churn | 426 lines by `git diff --numstat` source paths |
| Test weakening | none |
| External API/provider/connector evidence | ADR-001 existing RLS batch transaction decision and M4-25 runner input contract only; none added |
| Exceptions | none |

## Final Validation

| Command | Result |
|---|---|
| `node --test scripts/tests/m4-order-import-api-shell.test.mjs scripts/tests/m4-order-import-repository-port.test.mjs scripts/tests/m4-order-import-runtime-warning-contract.test.mjs scripts/tests/m4-order-import-rls-batch-runner-contract.test.mjs scripts/tests/m4-order-import-rls-transaction-gateway-contract.test.mjs scripts/tests/m4-order-import-runtime-provider-contract.test.mjs` | passed after code-quality fix; 32 tests |
| `npm run format:check` | passed |
| `npm run typecheck` | passed |
| `npm run lint` | passed |
| `npm run depcruise` | passed as part of `CI=true npm run check`; 68 modules, 65 dependencies, 0 violations |
| `npm run jscpd` | passed as part of `CI=true npm run check`; 0 clones |
| `npm run knip` | passed as part of `CI=true npm run check` |
| `npm run guard:forbidden-terms` | passed |
| `npm run guard:eval-triggers` | passed |
| `npm run guard:doc-triggers` | passed |
| `git diff --check && git diff --cached --check` | passed |
| `CI=true npm run check` | passed after code-quality fix; 246 Node tests, build, 57.17 kB admin brotli bundle, 11 Playwright tests |
| `node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M4-26-order-import-rls-batch-runner-contract.md --include-worktree` | passed; changedFiles 16, source 6, docs 4, test 6 |
| assigned worktree final status | pending final commit/PR |
| root/main final status | passed before PR; tracked diff/index clean and no open PRs |
