# M4-25 Order Import RLS Transaction Gateway Contract Evidence

> spec: `docs/specs/M4-25-order-import-rls-transaction-gateway-contract.md`
> branch: `codex/m4-25-order-import-rls-transaction`
> worktree: `/Users/atilla/Documents/uzmax-m4-25-order-import-rls-transaction`
> adr: `docs/adr/ADR-001-rls-prisma-pool.md`
> decision_type: `order_import_rls_transaction_gateway_contract__explicit_provider_no_default_runtime`
> redaction_status: no raw customer/order data, CSV/XLSX files, screenshots, order IDs, phone numbers, addresses, payment data, credentials, token values or env files included

## Scope

M4-25 adds a narrow RLS transaction gateway contract to the ADR-B02 no-API import snapshot path. The existing `AppModule` still defaults `ORDER_IMPORT_REPOSITORY` to the in-memory repository through `createOrderImportRepositoryProvider`, but future DB-backed order import reads now have an explicit `rls_prisma_gateway` selector path that requires an `OrderImportRlsTransactionRunner`. The gateway creates ADR-001-shaped context with `createRlsTransactionContext(scope)` before it hands a Prisma client port to the existing M4-11 `PrismaOrderImportPersistenceGateway`.

It does not default-enable Prisma/RLS runtime wiring, import `@prisma/client` from `apps/api`, instantiate `PrismaClient`, read env, connect to or write a real database, change schema/migrations/generated client, add BullMQ/Redis queues, production config, external order API connectors, AI runtime/eval or real customer/order data access.

## Validation Table

| Check | Expected | Result |
|---|---|---|
| Worktree path | `/Users/atilla/Documents/uzmax-m4-25-order-import-rls-transaction` | passed |
| Branch | `codex/m4-25-order-import-rls-transaction` | passed |
| Dependency install | `npm ci` | passed; npm audit reported existing 3 high severity vulnerabilities, not introduced by this PR |
| Baseline tests | `npm test` before edits | passed; 236 tests |
| Full local boundary preflight | assigned worker + root/main clean | `root_untracked_duplicate_docs_block_full_local_preflight` |
| CI-mode boundary fallback | assigned worktree check | passed |
| Manual root tracked/index evidence | root tracked diff/index clean, no index lock | passed before PR closeout; `git status --short --branch --untracked-files=no` -> `## main...origin/main`, root diff/index clean, no `.git/index.lock` |
| RLS context | `set local role "uzmax_app_runtime"` plus `app.org_id` / `app.tenant_id` before delegate access | passed focused test |
| Explicit RLS provider | `rls_prisma_gateway` requires a valid transaction runner | passed focused test |
| Fail-closed scope | incomplete org/tenant scope fails before runner/delegate access | passed focused test |
| Default runtime provider | AppModule remains in-memory by default | passed focused test and full check |
| Sensitive data/runtime | no raw data, env reads, DB connection, PrismaClient or external API call | passed focused test, diff review and guards |

## Boundary Preflight Note

The full local worker boundary guard failed before implementation because root/main contained five existing untracked duplicate docs:

- `docs/adr/ADR-B02-order-api 2.md`
- `docs/adr/README 2.md`
- `docs/evidence/M4/README 2.md`
- `docs/evidence/M4/spikes 2/SPK-02-order-saas-api/manifest.md`
- `docs/specs/SPK-02-order-api 2.md`

This M4-25 worker did not write those files. Because they may be user-retained local files, this PR does not delete or move them. The worker proceeds with absolute assigned worktree paths plus CI-mode boundary check and manual tracked/index clean evidence.

## Acceptance Mapping

| Item | Current M4 branch | M4-25 contribution |
|---|---|---|
| B-01 | `rls_transaction_gateway_contract_supported_not_closed` | Adds an ADR-001-shaped RLS transaction context contract before order import Prisma delegate access; full SQL/RLS unauthorized integration evidence remains future scope. |
| E-01 | `not_current_blocker__no_api_for_m4` | Adds no API connector and no `order_connector`. |
| E-02 | `rls_transaction_gateway_contract_supported_not_closed` | Adds a fail-closed RLS transaction gateway between current provider selector and Prisma delegate gateway; production DB runtime, queue and admin E2E remain future scope. |
| E-03 | `runtime_provider_contract_supported_not_closed` | Future DB-backed stale/missing warning path can now run under an explicit RLS transaction mode; persisted warning, real DB/runtime and E2E stale sample evidence remain future scope. |
| E-04 | `foundation_supported_not_closed` | No AI runtime/eval is added; repository selection remains code/data controlled and does not fabricate order status. |
| J-02 | `queue_runtime_not_closed` | No real BullMQ/Redis runtime, retry execution, idempotent storage locks or backlog alerting is added. |
| I-01 | `partial_api_runtime_not_closed` | API module has an RLS transaction gateway contract; full desktop order/customer workflow remains future scope. |

## Boundary Notes

- No external order API, LLM/provider, Telegram, real customer system or production connector was called.
- No raw CSV/XLSX files, screenshots, order IDs, phone numbers, addresses, payment information, customer plaintext, credentials or env files were read into or committed by this slice.
- No `packages/db/**`, `packages/capabilities/**`, `apps/worker/**`, `apps/admin/**`, `packages/engine/**`, package/lock/config/CI files were modified.
- M4-25 does not change API routes, admin UI/client, worker import queue, Prisma schema/migrations/generated client, production provider config, or real transaction implementation. It only defines the gateway contract and provider selector path.
- M4 evidence index was synchronized to include M4-25 while preserving production DB runtime, queue runtime, admin E2E, AI runtime/eval and release blockers.

## Review Closure

| Review | Finding | Resolution |
|---|---|---|
| Spec compliance | evidence closeout pending | Reviewer found code/scope aligned and only flagged pending validation + PR Hygiene evidence; this table now records actual validation and hygiene results. |
| Code quality | none | Read-only reviewer found no code quality findings; residual risks are expected contract-only boundaries: no real transaction runner, DB integration or RLS policy proof in this slice. |

## PR Hygiene

| Metric | Result |
|---|---|
| Path categories | source 4, docs 3, test 5 |
| Changed source files | 4 |
| Net source LOC | +96 by `git diff --numstat` source paths |
| New source files | 1: `apps/api/src/order-import.defaults.ts` only moves controlled default seed constants out of the repository file |
| Source gross churn | 224 |
| Test weakening | none |
| External API/provider/connector evidence | ADR-001 existing RLS helper and M4-11/M4-23 existing Prisma contract only; none added |
| Exceptions | none |

## Final Validation

| Command | Result |
|---|---|
| `node --test scripts/tests/m4-order-import-rls-transaction-gateway-contract.test.mjs scripts/tests/m4-order-import-runtime-provider-contract.test.mjs scripts/tests/m4-order-import-repository-port.test.mjs scripts/tests/m4-order-import-api-shell.test.mjs scripts/tests/m4-order-import-runtime-warning-contract.test.mjs` | passed; 27 tests |
| `node --test scripts/tests/m1-02-api-access-context.test.mjs` | passed; 5 tests |
| `npm run format:check` | passed |
| `npm run typecheck` | passed |
| `npm run lint` | passed via `CI=true npm run check` |
| `npm run depcruise` | passed; 65 modules / 63 dependencies / no violations |
| `npm run jscpd` | passed; 0 clones |
| `npm run knip` | passed |
| `npm run guard:forbidden-terms` | passed |
| `npm run guard:eval-triggers` | passed; no eval-triggering paths changed |
| `npm run guard:doc-triggers` | passed |
| `git diff --check` | passed |
| `CI=true npm run check` | passed; 241 Node tests, build, size 57.17 kB brotlied, 11 Playwright tests |
| `node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M4-25-order-import-rls-transaction-gateway-contract.md` | passed post-commit; 12 changed files, categories source 4/docs 3/test 5, source netLoc 96/new source files 1 |
| assigned worktree final status | expected clean after commit/merge cleanup |
| root/main final status | root tracked/index clean before PR closeout; existing untracked duplicate docs remain unless owner authorizes cleanup |
