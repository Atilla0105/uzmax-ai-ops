# M4-08 Order Import Repository Port Evidence

> spec: `docs/specs/M4-08-order-import-repository-port.md`
> branch: `codex/m4-08-order-import-repository-port`
> worktree: `/Users/atilla/Documents/uzmax-m4-08-order-import-repository-port`
> adr: `docs/adr/ADR-B02-order-api.md`
> decision_type: `order_import_repository_port__no_prisma_client_no_runtime_db`
> redaction_status: no raw customer/order data, CSV/XLSX, screenshots, order IDs, phone numbers, addresses, payment data, credentials, token values or env files included

## Scope

M4-08 adds a stable repository port for the M4-07 order import API shell and a persistence gateway adapter/mapper for the ADR-B02 no-API import snapshot path.

It does not implement a real Prisma client, DB connection, RLS transaction wrapper, CSV/XLSX parsing, admin-to-API client calls, worker queues, generated Prisma client artifacts, production config, external order API connectors or real customer/order data access.

## Validation Table

| Check | Expected | Result |
|---|---|---|
| Worktree path | `/Users/atilla/Documents/uzmax-m4-08-order-import-repository-port` | passed |
| Branch | `codex/m4-08-order-import-repository-port` | passed |
| Boundary preflight | `worker-write-boundary: ok` | passed before edits |
| Service dependency | `OrderImportService` depends on `ORDER_IMPORT_REPOSITORY` token + `OrderImportRepositoryPort` | passed focused test and full check |
| In-memory compatibility | M4-07 API shell behavior preserved | passed focused test and full check |
| Persistence mapper | jobs/errors/snapshots mapped from scoped rows | passed focused test and full check |
| Stale/missing states | repository feeds order-read without status fabrication | passed focused test and full check |
| No order API connector | no `order_connector`, provider, adapter or external API call | passed focused test and diff review |
| Sensitive data | no raw order/customer identifiers or payloads | passed focused test and diff review |
| Source budget | changed source files <= 3, net source LOC <= 420, new source files <= 0 | passed working diff; 3 source files, net +197 LOC, 0 new source files |

## Acceptance Mapping

| Item | Current M4 branch | M4-08 contribution |
|---|---|---|
| E-01 | `not_current_blocker__no_api_for_m4` | Adds no API connector and no `order_connector`. |
| E-02 | `repository_port_supported_not_closed` | Adds persistence gateway adapter/mapper for import jobs/errors/snapshot search; DB client, worker import and admin E2E remain future scope. |
| E-03 | `repository_port_supported_not_closed` | Preserves snapshot source/update/expiry fields for stale handoff; persisted/runtime warning remains future scope. |
| E-04 | `repository_port_supported_not_closed` | Repository feeds the order-read contract without fabricated status; AI eval/runtime integration remains future scope. |
| I-01 | `partial_api_shell_not_closed` | API service now has a repository port for future admin E2E; full order/customer workflow remains future scope. |

## Boundary Notes

- No external order API, LLM/provider, Telegram, real customer system or production connector was called.
- No raw CSV/XLSX import/export, screenshots, order IDs, phone numbers, addresses, payment information, customer plaintext, credentials or env files were read into or committed by this slice.
- No `packages/db/**`, `packages/capabilities/**`, `apps/admin/**`, `apps/worker/**`, `packages/engine/**`, generated client, package/lock/config/CI files were modified.
- M4 evidence index was synchronized to include M4-08 while preserving future DB client wiring, worker parser, admin API client, AI runtime/eval and E2E blockers.

## Final Validation

| Command | Result |
|---|---|
| `node --test scripts/tests/m4-order-import-repository-port.test.mjs scripts/tests/m4-order-import-api-shell.test.mjs` | passed; 10 tests |
| `npm run format:check` | passed through full check |
| `npm run typecheck` | passed through full check |
| `npm run lint` | passed through full check |
| `npm run depcruise` | passed; 52 modules, 40 dependencies, no violations |
| `npm run jscpd` | passed; 0 clones |
| `npm run knip` | passed |
| `npm run guard:forbidden-terms` | passed |
| `npm run guard:eval-triggers` | passed; no eval-triggering paths changed |
| `npm run guard:doc-triggers` | passed |
| `npm run guard:workspace` | passed |
| boundary guard with assigned/root env | passed |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M4-08-order-import-repository-port.md --include-worktree` | passed; 8 changed files, categories source 3/docs 3/test 2 |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M4-08-order-import-repository-port.md` after commit | passed; source changed files 3, net +197 LOC, new source files 0 |
| `git diff --check` | passed |
| `npm run check` | passed; 176 Node tests, build, size 55.99 kB brotlied, 9 Playwright tests |
| assigned worktree final status | clean after local commit and evidence amend |
| root/main final status | clean before push |
