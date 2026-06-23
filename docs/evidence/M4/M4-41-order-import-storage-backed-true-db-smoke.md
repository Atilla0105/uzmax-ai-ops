# M4-41 Order Import Storage-backed True DB Smoke Evidence

> spec: `docs/specs/M4-41-order-import-storage-backed-true-db-smoke.md`
> branch: `codex/m4-41-order-import-storage-backed-true-db-smoke`
> worktree: `/Users/atilla/Documents/uzmax-m4-41-order-import-storage-backed-true-db-smoke`
> target: Supabase `uzmax-dev` dev main through `UZMAX_RLS_DATABASE_URL` and Supabase Storage through `UZMAX_SUPABASE_URL` / `UZMAX_SUPABASE_SECRET_KEY`
> status: local validation passed; CI true DB/Storage validation passed in GitHub Actions run `28031828404`, job `82974312886`

## Scope

M4-41 is a synthetic, Storage-backed true DB smoke for the current no-API M4 order-data path. It must prove:

- CI uploads a synthetic CSV object into a private Supabase Storage bucket;
- Browser-visible Admin smoke submits only `{ bucketId, objectPath, mediaType, importJobId, rowErrorIds, snapshotIds }`, not inline `csvText` or hand-written `sourceRef`;
- real Nest HTTP `POST /order-import/storage-jobs` validates `order:write` and smoke-only dispatcher availability;
- smoke-only dispatcher downloads the object from Supabase Storage, converts it through worker `createOrderImportCsvTextInputFromStorageObject`, then calls existing worker dispatch/persistence and RLS transaction path;
- Admin/browser reads back the submitted job, row error and fresh snapshot through existing GET/search routes;
- tenant B cannot read the submitted tenant A rows;
- DB synthetic residue and Storage object residue are both `0`.

This evidence does not close full E-02/E-03/E-04/I-01/J-02/B-01. It does not add production upload UI, formal auth runtime, BullMQ/Redis, XLSX parser, real customer/order data, production DB, AI runtime/eval gate or release signoff.

## Synthetic Fixture

| Field | Value |
|---|---|
| Synthetic spec | `M4-41` |
| Storage bucket | `m4-order-import-smokes` |
| Storage object | `m4-41/55555555-5555-4555-8555-555555555141/orders.csv` |
| Source ref | `storage://m4-order-import-smokes/m4-41/55555555-5555-4555-8555-555555555141/orders.csv` |
| Import job ID | `55555555-5555-4555-8555-555555555141` |
| Snapshot ID | `66666666-6666-4666-8666-666666666141` |
| Row error ID | `77777777-7777-4777-8777-777777777141` |
| Tenant A | `22222222-2222-4222-8222-222222222141` |
| Tenant B | `33333333-3333-4333-8333-333333333141` |

## Validation

| Command / Check | Result |
|---|---|
| `node --test scripts/tests/m4-order-import-storage-backed-true-db-smoke.test.mjs` | passed; 6 tests |
| `node --test scripts/tests/m4-order-import-api-shell.test.mjs scripts/tests/m4-order-import-admin-api-bridge-contract.test.mjs scripts/tests/m4-order-import-runtime-warning-contract.test.mjs scripts/tests/m4-order-import-admin-submit-true-db-worker-dispatch-smoke.test.mjs scripts/tests/m4-order-import-storage-backed-true-db-smoke.test.mjs` | passed; 24 tests |
| `env -u UZMAX_RLS_DATABASE_URL node packages/db/scripts/run-m4-order-import-storage-backed-true-db-smoke.mjs` | passed fail-closed with `UZMAX_RLS_DATABASE_URL is required` |
| GitHub Actions CI true DB Storage smoke | passed in run `28031828404`, job `82974312886`; printed `m4-order-import-storage-backed-true-db-smoke: passed browser metadata submit->Storage download->worker dispatch->DB/RLS readback synthetic path; db_residue=0` and `m4-order-import-storage-backed-true-db-smoke: storage_object_residue=0` |
| `npm run format:check` | passed |
| `npm run guard:prettier-ignore` | passed |
| `npm run typecheck` | passed |
| `npm run lint` | passed |
| `npm run depcruise` | passed; no dependency violations |
| `npm run jscpd` | passed; no duplicates found |
| `npm run knip` | passed |
| `npm run guard:forbidden-terms` | passed |
| `npm run guard:eval-triggers` | passed; no eval-triggering paths changed |
| `npm run guard:doc-triggers` | passed |
| `npm run guard:workspace` | passed |
| `UZMAX_ASSIGNED_WORKTREE=/Users/atilla/Documents/uzmax-m4-41-order-import-storage-backed-true-db-smoke npm run guard:worker-boundary` | passed |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M4-41-order-import-storage-backed-true-db-smoke.md --include-worktree` | passed; changed files 23, source files 12, net source LOC 506 |
| `npm run test` | passed; 295 tests |
| `npm run build` | passed |
| `npm run size` | passed; 59.55 kB brotli under 250 kB |
| `npm run playwright` | passed; 11 tests |

## Safety

- No raw customer/order CSV export, phone number, address, payment value, credential or env file belongs in this PR.
- Supabase secret values must not be printed; evidence records only secret names and synthetic identifiers.
- Browser/API POST body must not contain `csvText` or raw customer/order data.
- Storage cleanup must remove the synthetic object; the shared synthetic bucket may remain as dev smoke infrastructure.

## Acceptance Mapping

| Item | Status | Notes |
|---|---|---|
| B-01 | `storage_backed_true_db_smoke_supported_not_closed` | CI proves the synthetic Storage metadata submit, worker Storage intake, DB/RLS readback and cleanup path in run `28031828404`; full durable SQL/RLS matrix remains future scope. |
| E-02 | `storage_backed_true_db_smoke_supported_not_closed` | CI proves real Supabase Storage upload/download into worker Storage intake and DB/RLS readback with `db_residue=0` and `storage_object_residue=0`; full workflow remains open. |
| E-03 | `admin_visible_stale_missing_true_db_smoke_supported_not_closed` | No new stale sample; M4-39 remains the stale/missing evidence. |
| E-04 | `eval_contract_supported_not_closed` | No eval/runtime change. |
| I-01 | `partial_storage_backed_admin_submit_true_db_smoke_not_closed` | CI browser smoke proves Admin sends Storage metadata only and reads back the synthetic true DB result; full desktop core workflow remains future scope. |
| J-02 | `worker_storage_intake_dispatch_smoke_supported_not_closed` | CI proves worker Storage intake plus dispatch/persistence from real Supabase Storage download; real queue runtime remains open. |
