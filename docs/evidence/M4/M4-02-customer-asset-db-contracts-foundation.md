# M4-02 Customer Asset DB Contracts Foundation Evidence

> spec: `docs/specs/M4-02-customer-asset-db-contracts-foundation.md`
> branch: `codex/m4-02-customer-asset-db-contracts-foundation`
> worktree: `/Users/atilla/Documents/uzmax-m4-02-customer-asset-db-contracts-foundation`
> adr: `docs/adr/ADR-B02-order-api.md`
> decision_type: `customer_asset_db_foundation__no_order_import_snapshot`
> redaction_status: no raw customer/order data, CSV/XLSX, screenshots, order IDs, phone numbers, addresses, payment data, credentials, token values or env files included

## Scope

M4-02 adds the customer asset DB foundation only: `customer`, `customer_identity`, `custom_field_definition`, `customer_field_value`, `tag_definition` and `tag_assignment`, plus pure DB contract helpers and focused tests. The contract helper module exposes `m4CustomerAssetContracts`; `packages/db/src/index.ts` keeps a type-only bridge so the package boundary is visible without adding a runtime relative import to the existing data-url test harness.

It does not implement order import, order snapshots, order API connectors, admin UI, API routes, runtime repositories, generated Prisma client artifacts, production config or real customer data access.

## Validation Table

| Check | Expected | Result |
|---|---|---|
| Worktree path | `/Users/atilla/Documents/uzmax-m4-02-customer-asset-db-contracts-foundation` | passed |
| Branch | `codex/m4-02-customer-asset-db-contracts-foundation` | passed |
| Boundary preflight | `worker-write-boundary: ok` | passed before edits |
| Customer asset tables | six scoped customer asset tables only | passed focused test |
| RLS and grants | enable/force RLS, select/insert/update grants, no delete grant | passed focused test |
| No order/import tables | no order connector, snapshot, query log or import job tables | passed focused test |
| Contract helpers | constants/builders exposed through `m4CustomerAssetContracts` and package type bridge | passed focused test / knip |
| Sensitive data | no raw order/customer identifiers or payloads | passed diff review |

## Acceptance Mapping

| Item | Current M4 branch | M4-02 contribution |
|---|---|---|
| B-01 | `foundation_supported_not_closed` | Adds tenant-scoped customer asset tables with forced RLS and no runtime delete grant. |
| D-04 | `foundation_supported_not_closed` | Adds customer, identity, field and tag persistence foundation; no UI/API/history aggregation yet. |
| D-05 | `foundation_supported_not_closed` | Adds blacklist/unreachable flags and timestamps; no restore API/admin audit flow yet. |
| D-07 | `foundation_supported_not_closed` | Adds customer field and customer tag definitions/assignments; no conversation tags/admin config yet. |
| E-01/E-02/E-03/E-04 | `not_touched` | ADR-B02 no-API branch remains; no order runtime or connector table is added. |

## Boundary Notes

- No external order API, LLM/provider, Telegram, real customer system or production connector was called.
- No raw CSV/XLSX import/export, screenshots, order IDs, phone numbers, addresses, payment information, customer plaintext, credentials or env files were read into or committed by this slice.
- No `apps/**`, `packages/capabilities/**`, `packages/engine/**`, API routes, admin UI, generated client, package/lock/config/CI files or `docs/evidence/M4/README.md` were modified.
- `packages/db` schema/migration was treated as a global serial point; no concurrent DB worker was active.

## Final Validation

| Command | Result |
|---|---|
| `node --test scripts/tests/m4-customer-asset-db-contracts-foundation.test.mjs` | passed, 5/5 |
| `npm run format:check` | passed |
| `npm run typecheck` | passed |
| `UZMAX_RLS_DATABASE_URL=postgresql://uzmax:uzmax@127.0.0.1:5432/uzmax npx prisma validate --schema packages/db/prisma/schema.prisma` | passed; schema valid, no database connection performed |
| `npm run lint` | passed |
| `npm run depcruise` | passed |
| `npm run jscpd` | passed, 0 clones |
| `npm run knip` | passed |
| `npm run guard:doc-triggers` | passed |
| `npm run guard:workspace` | passed |
| boundary guard with assigned/root env | passed: `worker-write-boundary: ok` |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M4-02-customer-asset-db-contracts-foundation.md` | passed: changed files 10; source 3; net source LOC 435; new source files 1; tests 4; docs 2; generated 1 |
| `git diff --check origin/main...HEAD` | passed |
| `npm run check` | passed: 155 Node tests, build, size limit and 8 Playwright tests |
| assigned worktree final status | pending post-commit/merge cleanup |
| root/main final status | pending post-commit/merge cleanup |
