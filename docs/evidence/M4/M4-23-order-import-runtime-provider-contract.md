# M4-23 Order Import Runtime Provider Contract Evidence

> spec: `docs/specs/M4-23-order-import-runtime-provider-contract.md`
> branch: `codex/m4-23-order-import-runtime-provider`
> worktree: `/Users/atilla/Documents/uzmax-m4-23-order-import-runtime-provider`
> adr: `docs/adr/ADR-B02-order-api.md`
> decision_type: `order_import_runtime_provider_contract__in_memory_default_explicit_prisma_fail_closed`
> redaction_status: no raw customer/order data, CSV/XLSX files, screenshots, order IDs, phone numbers, addresses, payment data, credentials, token values or env files included

## Scope

M4-23 adds a narrow runtime repository provider selector to the ADR-B02 no-API import snapshot path. `AppModule` still defaults `ORDER_IMPORT_REPOSITORY` to the existing in-memory repository, but now reaches it through `createOrderImportRepositoryProvider` with `orderImportRepositoryRuntimeModes.inMemory`. Future Prisma-backed wiring has an explicit `prisma_gateway` selector path that requires a valid `OrderImportPrismaClientPort` and wraps M4-11 `PrismaOrderImportPersistenceGateway` plus M4-08 `PersistenceOrderImportRepository`.

It does not default-enable Prisma, import `@prisma/client` from `apps/api`, instantiate `PrismaClient`, read env, connect to or write a real database, change schema/migrations/generated client, add worker queues, production config, external order API connectors, AI runtime/eval or real customer/order data access.

## Validation Table

| Check | Expected | Result |
|---|---|---|
| Worktree path | `/Users/atilla/Documents/uzmax-m4-23-order-import-runtime-provider` | passed |
| Branch | `codex/m4-23-order-import-runtime-provider` | passed |
| Dependency install | `npm ci` | passed; npm audit reported existing 3 high severity vulnerabilities, not introduced by this PR |
| Baseline tests | `npm test` before edits | passed; 227 tests |
| Full local boundary preflight | assigned worker + root/main clean | `root_untracked_duplicate_docs_block_full_local_preflight` |
| CI-mode boundary fallback | assigned worktree check | passed |
| Manual root tracked/index evidence | root tracked diff/index clean, no index lock | passed |
| Default runtime provider | AppModule routes through selector but keeps in-memory default | passed focused test and full check |
| Explicit Prisma mode | valid client port uses Prisma gateway + persistence adapter | passed focused test |
| Fail-closed runtime mode | missing/malformed Prisma client and unsupported modes throw before use | passed focused test |
| Sensitive data/runtime | no raw data, env reads, DB connection, PrismaClient or external API call | passed focused test, diff review and guards |

## Boundary Preflight Note

The full local worker boundary guard failed before implementation because root/main contained five existing untracked duplicate docs:

- `docs/adr/ADR-B02-order-api 2.md`
- `docs/adr/README 2.md`
- `docs/evidence/M4/README 2.md`
- `docs/evidence/M4/spikes 2/SPK-02-order-saas-api/manifest.md`
- `docs/specs/SPK-02-order-api 2.md`

This M4-23 worker did not write those files. Because they may be user-retained local files, this PR does not delete or move them. The worker proceeded with absolute assigned worktree paths plus CI-mode boundary check and manual tracked/index clean evidence.

## Acceptance Mapping

| Item | Current M4 branch | M4-23 contribution |
|---|---|---|
| E-01 | `not_current_blocker__no_api_for_m4` | Adds no API connector and no `order_connector`. |
| E-02 | `runtime_provider_contract_supported_not_closed` | Adds a fail-closed provider selector between current in-memory default and explicit Prisma gateway; production DB runtime, RLS transaction wrapper, queue and admin E2E remain future scope. |
| E-03 | `runtime_provider_contract_supported_not_closed` | Future DB-backed stale/missing warning path now has an explicit provider selection contract; persisted warning, real DB/runtime and E2E stale sample evidence remain future scope. |
| E-04 | `foundation_supported_not_closed` | No AI runtime/eval is added; repository selection remains code/data controlled and does not fabricate order status. |
| I-01 | `partial_api_runtime_not_closed` | API module has a runtime provider selector contract; full desktop order/customer workflow remains future scope. |

## Boundary Notes

- No external order API, LLM/provider, Telegram, real customer system or production connector was called.
- No raw CSV/XLSX files, screenshots, order IDs, phone numbers, addresses, payment information, customer plaintext, credentials or env files were read into or committed by this slice.
- No `packages/db/**`, `packages/capabilities/**`, `apps/worker/**`, `apps/admin/**`, `packages/engine/**`, package/lock/config/CI files were modified.
- M4-23 does not change API routes, admin UI/client, worker import queue, Prisma schema/migrations/generated client, RLS transaction wrapper, or production provider config.
- M4 evidence index was synchronized to include M4-23 while preserving production DB runtime, queue runtime, admin E2E, AI runtime/eval and release blockers.

## Review Closure

| Review | Finding | Resolution |
|---|---|---|
| Spec compliance | none | Read-only reviewer found no spec compliance findings; residual risks were PR lifecycle evidence and the existing root untracked duplicate docs blocker. |
| Code quality | none | Read-only reviewer and self-review found no blocking quality finding; the untracked-test residual risk was resolved by staging, and `order-import.repository.ts` remains within ESLint max-lines because blank lines are skipped. |

## PR Hygiene

| Metric | Result |
|---|---|
| Path categories | source 2, docs 3, test 2 |
| Changed source files | 2 |
| Net source LOC | 0 by `guard:pr-shape` source budget output; source text +72/-3 by git numstat, within spec budget |
| New source files | 0 |
| Source gross churn | 75 |
| Test weakening | none |
| External API/provider/connector evidence | existing Prisma dependency/generated client only; none added |
| Exceptions | none |

## Final Validation

| Command | Result |
|---|---|
| `node --test scripts/tests/m4-order-import-runtime-provider-contract.test.mjs scripts/tests/m4-order-import-repository-port.test.mjs scripts/tests/m4-order-import-api-shell.test.mjs scripts/tests/m4-order-import-runtime-warning-contract.test.mjs` | passed; 22 tests |
| `npm run format:check` | passed via `CI=true npm run check` |
| `npm run typecheck` | passed via `CI=true npm run check` |
| `npm run lint` | passed via `CI=true npm run check` |
| `npm run depcruise` | passed; 64 modules / 60 dependencies / no violations |
| `npm run jscpd` | passed; 0 clones |
| `npm run knip` | passed |
| `npm run guard:forbidden-terms` | passed |
| `npm run guard:eval-triggers` | passed; no eval-triggering paths changed |
| `npm run guard:doc-triggers` | passed |
| `git diff --check` | passed |
| `CI=true npm run check` | passed; 232 Node tests, build, size 57.17 kB brotlied, 11 Playwright tests |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M4-23-order-import-runtime-provider-contract.md --include-worktree` | passed pre-commit; 7 changed files, categories source 2/docs 3/test 2, source netLoc 0/new source files 0 |
| assigned worktree final status | pending |
| root/main final status | pending; root tracked/index clean expected, existing untracked duplicate docs remain unless owner authorizes cleanup |
