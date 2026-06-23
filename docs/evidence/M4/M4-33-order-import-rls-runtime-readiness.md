# M4-33 Order Import RLS Runtime Readiness Evidence

## Scope

M4-33 adds an explicit order import RLS runtime selector without changing the default in-memory API provider. It records the 2026-06-23 Supabase branch validation that `0001-0006` migrations apply and that M4 order import tables enforce tenant RLS with `uzmax_app_runtime`.

This evidence does not close E-02/E-03/E-04/J-02/I-01. It closes the immediate uncertainty that the schema had never been applied to a real Supabase Postgres target and adds a repo path for the API order import repository to use the existing RLS batch runner under explicit env.

## True DB Validation

| Check | Result | Notes |
|---|---|---|
| Supabase project | passed | Parent dev project `uzmax-dev` / `enyocaykcgcfcswycujg`; temporary branch `m4-migration-rls-verify` / ref `xbpkeeojlsrspewrkery`. |
| Cost confirmation | passed | `branch`, `0.01344/hourly`; confirmation tool returned an id before branch creation. |
| Migration apply | passed | `m1_platform_schema_authz_foundation`, `m1_audit_config_version_foundation`, `m2_channel_conversation_ticket_foundation`, `m3_ai_capability_data_contracts_foundation`, `m4_customer_asset_contracts_foundation`, `m4_order_import_snapshot_contracts_foundation`. |
| Table catalog | passed | 32 expected public tables existed after apply, including `import_job`, `order_snapshot`, `import_row_error`, `order_query_log`, `customer`, `tenant`, `org`. |
| Role | passed | `uzmax_app_runtime` exists on the branch after migration apply. |
| M4 RLS | passed | `customer`, `customer_identity`, `import_job`, `order_snapshot`, `import_row_error`, `order_query_log`, `org`, `tenant` all showed RLS enabled and forced; M4 order import tables each had 3 policies. |
| Synthetic tenant A | passed | Under `uzmax_app_runtime` with synthetic org/tenant A context, runtime could read 1 `import_job`, 1 `order_snapshot`, 1 `import_row_error`, 1 `order_query_log`. |
| Synthetic tenant B | passed | Under same org but synthetic tenant B context, the same four rows returned 0 visible rows. |
| Missing context | passed | Under `uzmax_app_runtime` with missing org/tenant context, the same four rows returned 0 visible rows. |
| Branch cleanup | passed | Temporary Supabase branch was deleted after validation to stop hourly cost. |

No raw customer/order data, API credentials, DB URLs, tokens, CSV/XLSX exports, screenshots, phone, address, payment data or secrets were written to repo. Synthetic UUIDs and refs only.

## Implementation Evidence

| Area | Result |
|---|---|
| DB runtime factory | `packages/db/src/prisma-runtime.ts` reads `UZMAX_RLS_DATABASE_URL` and creates PrismaClient only when called. |
| API runtime selector | `apps/api/src/order-import.runtime.ts` defaults to `in_memory`; explicit `rls_prisma_gateway` creates PrismaClient + `createOrderImportRlsBatchTransactionRunner`. |
| RLS-only env runtime | explicit `prisma_gateway` env mode throws, so env runtime cannot bypass RLS. |
| AppModule default | `ORDER_IMPORT_REPOSITORY` uses the env selector but still defaults to the existing in-memory repository with no DB env. |
| Runtime compiler | `apps/api/scripts/runtime-compiler.mjs` includes the new DB/runtime modules so the M1 HTTP shell smoke still boots through AppModule. |
| Existing contract update | M4-23 focused test was updated so AppModule does not directly read `process.env`; the dedicated runtime selector owns env reads and still blocks direct `@prisma/client`, `new PrismaClient`, `order_connector`, `fetch` and HTTP URLs in AppModule/repository source. |

## Validation

| Command | Status | Notes |
|---|---|---|
| `npm ci` | passed | 341 packages installed; npm audit reports 3 existing high severity issues, not changed by this PR. |
| `UZMAX_ASSIGNED_WORKTREE=/Users/atilla/Documents/uzmax-m4-33-order-import-rls-runtime-readiness UZMAX_PRIMARY_ROOT=/Users/atilla/Documents/UZMAX智能运营 npm run guard:worker-boundary` | failed expected | Root/main has five pre-existing untracked duplicate docs. |
| `CI=true UZMAX_ASSIGNED_WORKTREE=/Users/atilla/Documents/uzmax-m4-33-order-import-rls-runtime-readiness UZMAX_PRIMARY_ROOT=/Users/atilla/Documents/UZMAX智能运营 npm run guard:worker-boundary` | passed | Assigned worktree clean preflight. |
| `npm run format:check` | passed | Prettier check passed after formatting only touched files. |
| `npm run typecheck` | passed | TypeScript no-emit check passed. |
| `npm run lint` | passed | ESLint passed. |
| `npm run depcruise` | passed | 72 modules / 71 dependencies, no dependency violations. |
| `npm run jscpd` | passed | No duplicates found after removing duplicated test loader helper. |
| `npm run knip` | passed | No unused exports after keeping runtime internals private. |
| `npm run guard:prettier-ignore` | passed | Baseline unchanged. |
| `npm run guard:forbidden-terms` | passed | Engine forbidden-term guard passed. |
| `npm run guard:eval-triggers` | passed | No eval-triggering paths changed. |
| `npm run guard:doc-triggers` | passed | Documentation trigger guard passed. |
| `npm run guard:workspace` | passed | Linked worktree dirty allowed; root/main not edited by this worker. |
| `npm run guard:pr-shape -- --base origin/main` | skipped local | No PR context exists yet for this branch; guard reports PR-only checks skipped. |
| `node --test $(rg --files scripts/tests \| rg 'm4-order-import\|m4-admin-order-import')` | passed | 82 M4 order-import/admin-order-import tests passed. |
| `npm run test` | passed | 271 Node tests passed when run without inheriting local root/main dirty state. |
| `npm run build` | passed | API/worker/cron type builds and admin Vite build passed. |
| `npm run size` | passed | Size limit 250 kB; measured 57.17 kB brotlied. |
| `npm run playwright` | passed | 11 admin Playwright tests passed. |
| `CI=true ... npm run check` | failed local-only | The aggregate command makes worker-boundary tests inherit this machine's pre-existing root/main untracked duplicate docs and fails one guard self-test. The equivalent component checks above passed; the root duplicates are not part of this PR. |

## Remaining Blockers

- E-02 still needs an executable vertical demo through API/auth or a dedicated dev harness with a real `UZMAX_RLS_DATABASE_URL`, plus worker import execution and admin-visible E2E.
- E-03 still needs persisted stale-warning E2E against DB-backed snapshots.
- E-04 still needs AI order-read runtime integration and eval/redline evidence.
- J-02 still needs real BullMQ/Redis runtime, retry/idempotency/fault injection and backlog alerting.
- I-01 still needs full desktop order/customer workflow E2E with runtime data.

## Boundary Notes

- Root/main contains pre-existing untracked duplicate docs with ` 2` in the filename; this PR does not delete them.
- `git branch --no-merged main` reported `codex/m3-20-vision-screenshot-samples`; GitHub PR #58 is merged, so it is not hidden unreviewed work.
- Supabase dev main was not modified by the migration apply; the temporary branch was deleted after validation.
