# M4-07 Order Import API Shell Evidence

> spec: `docs/specs/M4-07-order-import-api-shell.md`
> branch: `codex/m4-07-order-import-api-shell`
> worktree: `/Users/atilla/Documents/uzmax-m4-07-order-import-api-shell`
> adr: `docs/adr/ADR-B02-order-api.md`
> decision_type: `order_import_api_shell__in_memory_no_db_repository`
> redaction_status: no raw customer/order data, CSV/XLSX, screenshots, order IDs, phone numbers, addresses, payment data, credentials, token values or env files included

## Scope

M4-07 adds a Nest API shell for the no-API import snapshot path: import job list, row error list, and snapshot search results backed by the M4-05 pure order-read contract.

It does not implement DB persistence, CSV/XLSX parsing, admin-to-API client calls, worker queues, generated Prisma client artifacts, production config, external order API connectors or real customer/order data access.

## Validation Table

| Check | Expected | Result |
|---|---|---|
| Worktree path | `/Users/atilla/Documents/uzmax-m4-07-order-import-api-shell` | passed |
| Branch | `codex/m4-07-order-import-api-shell` | passed |
| Boundary preflight | `worker-write-boundary: ok` | passed before edits |
| Runtime smoke harness | `runtime-compiler.mjs` maps `order-import` module graph | passed; existing M1-02 HTTP shell boot test maps `/order-import/*` routes |
| API registration | `OrderImportController` registered in `AppModule` | passed focused test and full check |
| Import job/errors | scoped jobs and row errors visible through service/controller | passed focused test and full check |
| Stale/missing states | handoff required and no status ref | passed focused test and full check |
| No order API connector | no `order_connector`, provider, adapter or external API call | passed focused test and diff review |
| Sensitive data | no raw order/customer identifiers or payloads | passed focused test and diff review |
| Source budget | changed source files <= 7, net source LOC <= 700, new source files <= 5 | passed staged diff; 7 source files, net +372 LOC, 5 new source files |

## Acceptance Mapping

| Item | Current M4 branch | M4-07 contribution |
|---|---|---|
| E-01 | `not_current_blocker__no_api_for_m4` | Adds no API connector and no `order_connector`. |
| E-02 | `api_shell_supported_not_closed` | Adds import job/error list and snapshot-backed search API shell; DB/worker/admin E2E remains future scope. |
| E-03 | `api_shell_supported_not_closed` | Adds stale snapshot API response with handoff requirement; persisted/runtime warning remains future scope. |
| E-04 | `api_shell_supported_not_closed` | Missing/stale API results hand off without fabricated status; AI eval/runtime integration remains future scope. |
| I-01 | `partial_api_shell_not_closed` | Adds API backing shape for order admin path; full order/customer workflow remains future scope. |

## Boundary Notes

- No external order API, LLM/provider, Telegram, real customer system or production connector was called.
- No raw CSV/XLSX import/export, screenshots, order IDs, phone numbers, addresses, payment information, customer plaintext, credentials or env files were read into or committed by this slice.
- No `packages/db/**`, `apps/admin/**`, `apps/worker/**`, `packages/engine/**`, generated client, package/lock/config/CI files were modified.
- `apps/api/scripts/runtime-compiler.mjs` was updated only to let the existing HTTP shell smoke test compile the new `order-import` barrel and its `order-read` dependency.
- M4 evidence index was synchronized to include M4-07 while preserving future DB repository, worker parser, admin API client, AI runtime/eval and E2E blockers.

## Final Validation

| Command | Result |
|---|---|
| `node --test scripts/tests/m1-02-api-access-context.test.mjs scripts/tests/m4-order-import-api-shell.test.mjs` | passed; 10 tests |
| `node --test scripts/tests/m4-order-import-api-shell.test.mjs` | passed through focused and full check; 5 tests |
| `npm run format:check` | passed through full check |
| `npm run typecheck` | passed through full check |
| `npm run lint` | passed through full check |
| `npm run depcruise` | passed; 52 modules, 39 dependencies, no violations |
| `npm run jscpd` | passed; 0 clones |
| `npm run knip` | passed |
| `npm run guard:forbidden-terms` | passed |
| `npm run guard:eval-triggers` | passed; no eval-triggering paths changed |
| `npm run guard:doc-triggers` | passed |
| `npm run guard:workspace` | passed |
| boundary guard with assigned/root env | passed |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M4-07-order-import-api-shell.md --include-worktree` | passed; 11 changed files, categories source 7/docs 3/test 1 |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M4-07-order-import-api-shell.md` after commit | passed; source changed files 7, net +372 LOC, new source files 5 |
| `git diff --check` | passed |
| `npm run check` | passed; 171 Node tests, build, size 55.99 kB brotlied, 9 Playwright tests |
| assigned worktree final status | clean after local commit and evidence amend |
| root/main final status | clean before push |
