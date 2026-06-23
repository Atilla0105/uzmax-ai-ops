# M4-42 Order Import Operator Workflow Evidence

> spec: `docs/specs/M4-42-order-import-operator-workflow.md`
> branch: `codex/m4-42-order-import-operator-workflow`
> worktree: `/Users/atilla/Documents/uzmax-m4-42-order-import-operator-workflow`
> target: Supabase `uzmax-dev` dev main through `UZMAX_RLS_DATABASE_URL` and Supabase Storage through `UZMAX_SUPABASE_URL` / `UZMAX_SUPABASE_SECRET_KEY`
> status: local validation passed; CI true DB/Storage validation passed in GitHub Actions run `28036581776`, job `82991469416`

## Scope

M4-42 turns the M4-41 Storage-backed smoke into a minimum operator-visible workflow for the no-API M4 order-data branch:

- Admin `/design` shows an operator import workflow with controlled Storage metadata, CSV/TSV wording and a disabled local state when no runtime config is injected.
- The true DB runner disables automatic visible-smoke submit, opens the operator surface, clicks `Submit storage metadata`, and captures only the `POST /order-import/storage-jobs` metadata body.
- The browser/API POST body must contain bucket/path/media type/ids only; no inline `csvText`, no hand-written `sourceRef`, no raw customer/order data.
- The smoke uploads a synthetic TSV object to Supabase Storage, worker intake converts the Storage object through the existing CSV/TSV path, then worker dispatch/persistence writes under DB/RLS.
- Browser-visible readback covers submitted job, row error, fresh snapshot status ref, stale warning, missing warning, tenant B isolation, DB residue `0` and Storage object residue `0`.

This evidence does not close M4 as a whole. M4-43/M4-44/M4-45 remain open for customer assets, AI order-read runtime/eval redlines, BullMQ/Redis or equivalent queue evidence, audit/security closeout and final M4 signoff.

## Synthetic Fixture

| Field | Value |
|---|---|
| Synthetic spec | `M4-42` |
| Storage bucket | `m4-order-import-smokes` |
| Storage object | `m4-42/55555555-5555-4555-8555-555555555142/orders.tsv` |
| Source ref | `storage://m4-order-import-smokes/m4-42/55555555-5555-4555-8555-555555555142/orders.tsv` |
| Import job ID | `55555555-5555-4555-8555-555555555142` |
| Snapshot ID | `66666666-6666-4666-8666-666666666142` |
| Row error ID | `77777777-7777-4777-8777-777777777142` |
| Tenant A | `22222222-2222-4222-8222-222222222142` |
| Tenant B | `33333333-3333-4333-8333-333333333142` |

## Validation

| Command / Check | Result |
|---|---|
| `node --test scripts/tests/m4-order-import-operator-workflow.test.mjs` | passed; 7 tests |
| `node --test scripts/tests/m4-order-import-storage-backed-true-db-smoke.test.mjs scripts/tests/m4-order-import-admin-api-bridge-contract.test.mjs scripts/tests/m4-order-import-runtime-warning-contract.test.mjs scripts/tests/m4-order-import-operator-workflow.test.mjs` | passed; 21 tests |
| `env -u UZMAX_RLS_DATABASE_URL node packages/db/scripts/run-m4-order-import-operator-workflow-smoke.mjs` | passed fail-closed with `UZMAX_RLS_DATABASE_URL is required` |
| GitHub Actions CI true DB Storage smoke | passed in run `28036581776`, job `82991469416`; printed `m4-order-import-operator-workflow-smoke: passed operator metadata submit->Storage TSV download->worker dispatch->DB/RLS readback and stale/missing handoff; db_residue=0` and `m4-order-import-operator-workflow-smoke: storage_object_residue=0` |
| `npm run format:check` | passed |
| `npm run guard:prettier-ignore -- --base origin/main` | passed |
| `npm run typecheck` | passed |
| `npm run lint` | passed |
| `npm run depcruise` | passed; no dependency violations |
| `npm run jscpd` | passed; no duplicates found |
| `npm run knip` | passed |
| `npm run guard:forbidden-terms` | passed |
| `npm run guard:eval-triggers -- --base origin/main` | passed; no eval-triggering paths changed |
| `npm run guard:doc-triggers` | passed |
| `npm run guard:workspace` | passed |
| `UZMAX_ASSIGNED_WORKTREE=/Users/atilla/Documents/uzmax-m4-42-order-import-operator-workflow npm run guard:worker-boundary` | passed |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M4-42-order-import-operator-workflow.md --include-worktree` | passed; changed files 15, source files 8, net source LOC 489, new source files 2 |
| `npm run test` | passed; 302 tests |
| `npm run build` | passed |
| `npm run size` | passed; 60.23 kB brotli under 250 kB |
| `npm run playwright` | passed; 11 tests |

## Safety

- No raw CSV/XLSX export, phone number, address, payment value, credential or env file belongs in this PR.
- Supabase secrets are referenced only by environment variable names.
- Browser/operator submit is Storage metadata only; the Storage object is synthetic, temporary and cleaned after the smoke.
- Formal production login/auth, owner real sample import, XLSX support and release approval are not claimed here.

## Acceptance Mapping

| Item | Status | Notes |
|---|---|---|
| B-01 | `order_import_operator_true_db_supported_not_closed` | CI proves tenant A/B DB/RLS isolation through the operator-triggered Storage metadata path; full durable SQL/RLS matrix remains future scope. |
| E-02 | `order_import_operator_workflow_closed_for_m4_no_api_branch` | Operator-visible Storage metadata submit and TSV Storage-backed readback passed in CI with `db_residue=0` and `storage_object_residue=0`; formal production auth, owner real sample, XLSX and external order API remain out of scope. |
| E-03 | `order_import_stale_missing_warning_closed_for_m4_no_api_branch` | Runner asserts stale/missing handoff without status ref after operator-created rows; CI true DB proof passed. |
| E-04 | `still_requires_m4_44_ai_order_read_runtime` | No AI runtime/eval gate change. |
| I-01 | `operator_workflow_supported_not_full_desktop_core` | Admin operator workflow is visible and runtime-clickable in smoke mode; customer assets and broader desktop core remain future scope. |
| J-02 | `worker_storage_intake_dispatch_smoke_supported_queue_runtime_open` | Uses existing worker dispatch/persistence after Storage TSV intake; real BullMQ/Redis runtime remains M4-45 scope. |
