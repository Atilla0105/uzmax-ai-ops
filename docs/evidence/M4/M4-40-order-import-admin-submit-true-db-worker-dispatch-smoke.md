# M4-40 Order Import Admin Submit True DB Worker Dispatch Smoke Evidence

> spec: `docs/specs/M4-40-order-import-admin-submit-true-db-worker-dispatch-smoke.md`
> branch: `codex/m4-40-order-import-admin-submit-true-db-worker-dispatch-smoke`
> worktree: `/Users/atilla/Documents/uzmax-m4-40-order-import-admin-submit-true-db-worker-dispatch-smoke`
> target: Supabase `uzmax-dev` dev main through `UZMAX_RLS_DATABASE_URL`
> date: 2026-06-23

## Scope

M4-40 adds a thin synthetic submit/readback smoke on top of M4-38/M4-39. The default `/design` page remains local/synthetic. The true DB submit path only activates when Playwright injects:

```js
window.__UZMAX_M4_ORDER_IMPORT_VISIBLE_SMOKE__ = {
  enabled: true,
  now: "2026-06-23T08:30:00.000Z",
  queryRef: "controlled://order/m4-40-ref-a",
  submit: {
    csvText: "...synthetic controlled rows...",
    importJobId: "55555555-5555-4555-8555-555555555140",
    importedAt: "2026-06-23T08:30:00.000Z",
    rowErrorIds: ["77777777-7777-4777-8777-777777777140"],
    snapshotIds: ["66666666-6666-4666-8666-666666666140"],
    sourceRef:
      "storage://order-imports/m4-40-admin-submit-true-db-worker-dispatch-smoke.csv"
  }
};
```

When enabled, the Admin component calls `createOrderImportApiClient().submitImportCsvTextJob()` before the existing jobs/errors/snapshot readback. Browser `/order-import/**` requests are proxied to the real Nest HTTP smoke app. The POST route uses `ApiAccessContextGuard`, `OrderImportController`, `OrderImportService`, a smoke-only `ORDER_IMPORT_SUBMIT_DISPATCHER`, the existing worker `runOrderImportCsvTextDispatchContract`, `runOrderImportCsvTextPersistenceJob` and `createOrderImportWorkerPrismaPersistenceGateway` inside an RLS Prisma transaction.

This does not close full E-02/E-03/E-04/I-01/J-02/B-01. It does not add formal auth runtime, real BullMQ/Redis queue execution, Storage upload/download runtime, XLSX parsing, real import samples, real customer/order data, external order API, AI order-read runtime, eval redlines, production DB or GA release readiness.

## Synthetic Data Boundary

The smoke uses fixed non-real UUIDs and controlled refs only:

| Item | Value |
|---|---|
| Org | `11111111-1111-4111-8111-111111111140` / `m4-40-synthetic-org` |
| Tenant A | `22222222-2222-4222-8222-222222222140` |
| Tenant B | `33333333-3333-4333-8333-333333333140` |
| User | `44444444-4444-4444-8444-444444444140` |
| Import job | `55555555-5555-4555-8555-555555555140` |
| Order snapshot | `66666666-6666-4666-8666-666666666140` |
| Row error | `77777777-7777-4777-8777-777777777140` |
| Source ref | `storage://order-imports/m4-40-admin-submit-true-db-worker-dispatch-smoke.csv` |
| Fresh order ref | `controlled://order/m4-40-ref-a` |
| Bad row order ref | `controlled://order/m4-40-bad` |
| Marker | `metadata.synthetic_spec = M4-40` |

No raw order/customer data, screenshots, phone/address/payment/order IDs, credentials, env files or secret values are written to repo or printed by the smoke.

## Verification Commands

Focused local harness validation:

```bash
node --test scripts/tests/m4-order-import-admin-submit-true-db-worker-dispatch-smoke.test.mjs
```

Compatibility validation with existing API shell/bridge/runtime-warning tests:

```bash
node --test scripts/tests/m4-order-import-api-shell.test.mjs scripts/tests/m4-order-import-admin-api-bridge-contract.test.mjs scripts/tests/m4-order-import-runtime-warning-contract.test.mjs scripts/tests/m4-order-import-admin-submit-true-db-worker-dispatch-smoke.test.mjs
```

Fail-closed local env validation:

```bash
env -u UZMAX_RLS_DATABASE_URL node packages/db/scripts/run-m4-order-import-admin-submit-true-db-worker-dispatch-smoke.mjs
```

CI true DB browser submit/readback validation target:

```bash
node packages/db/scripts/run-m4-order-import-admin-submit-true-db-worker-dispatch-smoke.mjs
```

The CI step must receive `UZMAX_RLS_DATABASE_URL` from GitHub Actions secrets and install Playwright Chromium before running this script. The local shell does not need to store or print that secret.

## Runtime Assertions

| Check | Expected |
|---|---|
| Default `/design` mode | no submit/readback runtime request |
| Smoke submit gate | `window.__UZMAX_M4_ORDER_IMPORT_VISIBLE_SMOKE__.submit` present |
| Browser client boundary | existing `createOrderImportApiClient` with relative fetcher |
| Browser route proxy | `POST /order-import/jobs` with synthetic tenant and `order:read,order:write` headers |
| StrictMode submit guard | smoke submit uses a module-level promise map for `importJobId/sourceRef`; duplicate effects await the same POST result |
| Readback target | jobs/errors readback is pinned to the POST response `importJobId` |
| API fail closed | no submit dispatcher provider means submit is forbidden |
| Worker path | existing `runOrderImportCsvTextDispatchContract` plus `runOrderImportCsvTextPersistenceJob` |
| Persistence path | existing `createOrderImportWorkerPrismaPersistenceGateway` |
| RLS write path | `set local role "uzmax_app_runtime"` and `app.org_id` / `app.tenant_id` settings |
| Visible source ref | `storage://order-imports/m4-40-admin-submit-true-db-worker-dispatch-smoke.csv` |
| Visible row error | `order_status_ref_required` |
| Fresh query | `snapshot_ready`, `Status ref: status://order/ready`, `Handoff: not required` |
| Tenant B isolation | no submitted job; order query returns `handoff_required` / `order_snapshot_missing` |
| Cleanup residue | `0` |

## Results

Local validation before PR:

| Command | Result |
|---|---|
| `node --test scripts/tests/m4-order-import-admin-submit-true-db-worker-dispatch-smoke.test.mjs` | passed: 5/5 |
| `node --test scripts/tests/m4-order-import-api-shell.test.mjs scripts/tests/m4-order-import-admin-api-bridge-contract.test.mjs scripts/tests/m4-order-import-runtime-warning-contract.test.mjs scripts/tests/m4-order-import-admin-submit-true-db-worker-dispatch-smoke.test.mjs` | passed: 18/18 |
| `env -u UZMAX_RLS_DATABASE_URL node packages/db/scripts/run-m4-order-import-admin-submit-true-db-worker-dispatch-smoke.mjs` | passed fail-closed: `UZMAX_RLS_DATABASE_URL is required` |
| `npm run format:check` | passed |
| `npm run guard:prettier-ignore` | passed: 8 baseline files, 89/89 markers |
| `npm run typecheck` | passed |
| `npm run lint` | passed |
| `npm run depcruise` | passed: no dependency violations |
| `npm run jscpd` | passed: no duplicates found |
| `npm run knip` | passed |
| `npm run guard:forbidden-terms` | passed |
| `npm run guard:eval-triggers` | passed: no eval-triggering paths changed |
| `npm run guard:doc-triggers` | passed |
| `npm run guard:workspace` | passed |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M4-40-order-import-admin-submit-true-db-worker-dispatch-smoke.md` | passed: 15 files; config 1, source 7, docs 3, test 4; source net LOC 565, new source files 1 |
| `npm run guard:pr-shape -- --base origin/main` | passed after PR #101 body parsing fix: same 15-file / source net LOC 565 result |
| `npm run test` | passed: 289/289 |
| `npm run build` | passed |
| `npm run size` | passed: 59.3 kB brotlied, limit 250 kB |
| `npm run playwright` | passed: 11/11 |
| `UZMAX_ASSIGNED_WORKTREE=/Users/atilla/Documents/uzmax-m4-40-order-import-admin-submit-true-db-worker-dispatch-smoke UZMAX_PRIMARY_ROOT=/Users/atilla/Documents/UZMAX智能运营 npm run guard:worker-boundary` | passed |

CI true DB visible submit/readback smoke:

| Run | Result |
|---|---|
| GitHub Actions CI run `28027188523`, job `82957843969`, step `M4 order import true DB runtime smokes` | passed: `m4-order-import-admin-submit-true-db-worker-dispatch-smoke: passed browser admin submit->API->worker dispatch->DB/RLS readback synthetic path; residue=0` |

## Acceptance Mapping

| Item | Status | Notes |
|---|---|---|
| B-01 | `admin_submit_worker_dispatch_true_db_smoke_supported_not_closed` | Synthetic submit rows write/read under Supabase dev main RLS in CI. Full durable SQL/RLS matrix remains future scope. |
| E-01 | `not_current_blocker__no_api_for_m4` | No external order API connector was added or called. |
| E-02 | `admin_submit_worker_dispatch_true_db_smoke_supported_not_closed` | Browser-originated synthetic CSV submit reaches API POST, worker dispatch/persistence and true DB Admin readback in CI. Formal auth runtime, real Storage/file upload, real sample and full E2E remain open. |
| E-03 | `admin_visible_stale_missing_true_db_smoke_supported_not_closed` | No new stale sample beyond M4-39; submit path writes a fresh snapshot only. Persisted warning storage and full E2E stale samples remain future scope. |
| E-04 | `eval_contract_supported_not_closed` | No AI order-read runtime/eval gate changes; M4-40 does not alter redlines. |
| I-01 | `partial_admin_submit_true_db_smoke_supported_not_closed` | `/design` smoke-only Admin shell submits and reads back a synthetic import path in CI. Full desktop core order/customer workflow remains future scope. |
| J-02 | `worker_dispatch_smoke_supported_not_closed` | Uses existing worker dispatch contract and persistence gateway directly in smoke. Real BullMQ/Redis retry/idempotency/backlog/fault-injection evidence remains future scope. |

## Boundary Notes

- This smoke is deliberately vertical and thin: browser-originated synthetic submit, existing API POST, existing worker dispatch/persistence, RLS write/readback, browser-visible confirmation.
- The submit dispatcher provider is smoke-only; default API runtime remains fail-closed for submit without that provider.
- The UI runtime mode is hidden behind the smoke global; default `/design` remains synthetic/local and does not submit to `/order-import`.
- M4-40 adds no real customer/order data, screenshots, secrets or external connector calls.
