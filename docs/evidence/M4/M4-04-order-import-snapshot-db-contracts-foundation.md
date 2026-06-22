# M4-04 Order Import Snapshot DB Contracts Foundation Evidence

> spec: `docs/specs/M4-04-order-import-snapshot-db-contracts-foundation.md`
> branch: `codex/m4-04-order-import-snapshot-db-contracts`
> worktree: `/Users/atilla/Documents/uzmax-m4-04-order-import-snapshot-db-contracts`
> adr: `docs/adr/ADR-B02-order-api.md`
> decision_type: `order_import_snapshot_db_foundation__no_order_api_connector`
> redaction_status: no raw customer/order data, CSV/XLSX, screenshots, order IDs, phone numbers, addresses, payment data, credentials, token values or env files included

## Scope

M4-04 adds the order import snapshot DB foundation only: `order_snapshot`, `import_job`, `import_row_error` and `order_query_log`, plus pure DB contract helpers and focused tests.

It does not implement order import runtime, order API connectors, admin UI, API routes, worker parsers, generated Prisma client artifacts, production config or real customer/order data access.

## Validation Table

| Check | Expected | Result |
|---|---|---|
| Worktree path | `/Users/atilla/Documents/uzmax-m4-04-order-import-snapshot-db-contracts` | passed |
| Branch | `codex/m4-04-order-import-snapshot-db-contracts` | passed |
| Boundary preflight | `worker-write-boundary: ok` | passed before edits |
| Order import snapshot tables | four scoped order import snapshot tables only | passed focused test |
| RLS and grants | enable/force RLS, select/insert/update grants, no delete grant | passed focused test |
| No order API connector | no `order_connector` table/model/contract | passed focused test |
| Contract helpers | constants/builders exposed through `m4OrderImportContracts` and package type bridge | passed focused test / typecheck / knip |
| Sensitive data | no raw order/customer identifiers or payloads | passed diff/review |

## Acceptance Mapping

| Item | Current M4 branch | M4-04 contribution |
|---|---|---|
| E-01 | `not_current_blocker__no_api_for_m4` | Adds no API connector and no `order_connector`. |
| E-02 | `foundation_supported_not_closed` | Adds import job, row error and order snapshot DB contracts; import runtime/admin E2E remains future scope. |
| E-03 | `foundation_supported_not_closed` | Adds source/update/expiry contract fields and stale query outcome vocabulary; runtime warning remains future scope. |
| E-04 | `foundation_supported_not_closed` | Adds query outcome and handoff-required logging contract; AI eval/runtime behavior remains future scope. |
| D-04 | `foundation_supported_not_closed` | Order snapshots can link to customers; customer detail UI/API remains future scope. |

## Boundary Notes

- No external order API, LLM/provider, Telegram, real customer system or production connector was called.
- No raw CSV/XLSX import/export, screenshots, order IDs, phone numbers, addresses, payment information, customer plaintext, credentials or env files were read into or committed by this slice.
- No `apps/**`, `packages/capabilities/**`, `packages/engine/**`, API routes, admin UI, generated client, package/lock/config/CI files or `docs/evidence/M4/README.md` were modified.
- `packages/db` schema/migration was treated as a global serial point; no concurrent DB worker was active.

## Final Validation

| Command | Result |
|---|---|
| `node --test scripts/tests/m4-order-import-snapshot-db-contracts-foundation.test.mjs` | passed, 5 tests |
| `node --test scripts/tests/m2-channel-conversation-foundation.test.mjs scripts/tests/m3-ai-capability-data-contracts-foundation.test.mjs scripts/tests/m4-customer-asset-db-contracts-foundation.test.mjs` | passed, 14 tests |
| `UZMAX_RLS_DATABASE_URL=postgresql://uzmax:uzmax@127.0.0.1:5432/uzmax npx prisma validate --schema packages/db/prisma/schema.prisma` | passed |
| `npm run format:check` | passed |
| `npm run guard:prettier-ignore` | passed |
| `npm run typecheck` | passed |
| `npm run lint` | passed |
| `npm run depcruise` | passed |
| `npm run jscpd` | passed, 0 clones |
| `npm run knip` | passed |
| `npm run guard:forbidden-terms` | passed |
| `npm run guard:eval-triggers` | passed |
| `npm run guard:doc-triggers` | passed |
| `npm run guard:workspace` | passed |
| boundary guard with assigned/root env | passed |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M4-04-order-import-snapshot-db-contracts-foundation.md --include-worktree` | passed, 10 changed files, source changed files 3 |
| `git diff --check` | passed |
| `npm run check` | passed, 160 tests and 8 Playwright tests |
| assigned worktree final status | clean after local commit |
| root/main final status | clean throughout local commit |
