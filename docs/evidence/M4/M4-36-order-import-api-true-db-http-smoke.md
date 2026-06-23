# M4-36 Order Import API True DB HTTP Smoke Evidence

> spec: `docs/specs/M4-36-order-import-api-true-db-http-smoke.md`
> branch: `codex/m4-36-order-import-api-true-db-http-smoke`
> worktree: `/Users/atilla/Documents/uzmax-m4-36-order-import-api-true-db-http-smoke`
> target: Supabase `uzmax-dev` dev main through `UZMAX_RLS_DATABASE_URL`
> date: 2026-06-23

## Scope

M4-36 extends the M4-35 true DB runtime signal from repository calls to real Nest HTTP routes. The smoke compiles/imports the existing API order-import modules, starts an API-owned smoke-only Nest module with the real `OrderImportController`, `OrderImportService` and `ApiAccessContextGuard`, injects the existing RLS Prisma repository provider, and uses a smoke-only access-context service only to supply controlled tenant access context for synthetic data.

The smoke exercises:

- synthetic org and two tenants in Supabase dev main;
- RLS-context writes for one import job, one order snapshot and one row error under `set local role "uzmax_app_runtime"` with tenant A settings;
- HTTP `GET /order-import/jobs`;
- HTTP `GET /order-import/jobs/:jobId/errors`;
- HTTP `GET /order-import/snapshots/search`;
- tenant A visibility and tenant B non-visibility;
- no-permission HTTP 403;
- cleanup of the synthetic org and child rows with residue check `0`.

This is not full E-02 closure. It does not cover formal auth runtime, admin browser E2E, BullMQ/Redis execution, Storage upload/download runtime, XLSX parsing, real CSV samples, real customer/order data, external order API, AI order-read runtime, eval redlines, production DB or GA release readiness.

## Synthetic Data Boundary

The smoke uses fixed non-real UUIDs and controlled refs only:

| Item | Value |
|---|---|
| Org | `11111111-1111-4111-8111-111111111136` / `m4-36-synthetic-org` |
| Tenant A | `22222222-2222-4222-8222-222222222136` |
| Tenant B | `33333333-3333-4333-8333-333333333136` |
| User | `44444444-4444-4444-8444-444444444136` |
| Import job | `55555555-5555-4555-8555-555555555136` |
| Order snapshot | `66666666-6666-4666-8666-666666666136` |
| Row error | `77777777-7777-4777-8777-777777777136` |
| Source ref | `storage://order-imports/m4-36-api-true-db-http-smoke.csv` |
| Order ref | `controlled://order/m4-36-ref-a` |
| Marker | `metadata.synthetic_spec = M4-36` |

No raw order/customer data, screenshots, phone/address/payment/order IDs, credentials, env files or secret values are written to repo or printed by the smoke.

## Verification Commands

Focused local harness validation:

```bash
node --test scripts/tests/m4-order-import-api-true-db-http-smoke.test.mjs
```

CI true DB HTTP validation target:

```bash
node packages/db/scripts/run-m4-order-import-api-true-db-http-smoke.mjs
```

The CI step must receive `UZMAX_RLS_DATABASE_URL` from GitHub Actions secrets. The local shell does not need to store or print that secret.

## Runtime Assertions

| Check | Expected |
|---|---|
| Nest runtime | smoke-only module using real `OrderImportController` and `OrderImportService` |
| Repository runtime | `rls_prisma_gateway` with `createOrderImportRlsBatchTransactionRunner(prisma)` |
| RLS write context | `uzmax_app_runtime`, tenant A |
| Tenant A `GET /order-import/jobs` | includes synthetic import job |
| Tenant A `GET /order-import/jobs/:jobId/errors` | returns one synthetic row error |
| Tenant A `GET /order-import/snapshots/search` | returns `snapshot_ready` with controlled status ref |
| Tenant B `GET /order-import/jobs` | does not include synthetic import job |
| Tenant B snapshot search | returns `handoff_required` / `order_snapshot_missing` |
| Tenant B row errors by tenant A job id | returns 404 |
| Tenant A no-permission jobs request | returns 403 |
| Cleanup residue | `0` |

## Results

Local validation before PR:

| Command | Result |
|---|---|
| `npm ci` | pass; worktree-local `node_modules` installed; npm audit reported existing 3 high severity findings |
| `node --test scripts/tests/m4-order-import-api-true-db-http-smoke.test.mjs` | pass, 4 tests |
| `node packages/db/scripts/run-m4-order-import-api-true-db-http-smoke.mjs` | fail-closed locally with `UZMAX_RLS_DATABASE_URL is required`; no secret value printed |
| `npm run format:check` | pass |
| `npm run typecheck` | pass |
| `npm run lint` | pass |
| `npm run depcruise` | pass, no dependency violations |
| `npm run jscpd` | pass, 0 clones |
| `npm run knip` | pass after keeping Nest dependencies inside the API-owned smoke harness |
| `npm run guard:prettier-ignore -- --base origin/main` | pass |
| `npm run guard:forbidden-terms` | pass |
| `npm run guard:eval-triggers -- --base origin/main` | pass, no eval-triggering paths changed |
| `npm run guard:doc-triggers` | pass |
| `npm run guard:workspace` | pass for linked worker worktree |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M4-36-order-import-api-true-db-http-smoke.md --include-worktree` | pass; changedFiles=8, categories config 1/source 3/docs 3/test 1 |
| `npm run test` | pass, 275 tests |
| `npm run build` | pass |
| `CI=true UZMAX_ASSIGNED_WORKTREE=/Users/atilla/Documents/uzmax-m4-36-order-import-api-true-db-http-smoke npm run guard:worker-boundary` | pass; CI-mode physical multi-worktree/root-main enforcement limited/skipped |
| `git diff --check && git diff --cached --check` | pass |

GitHub CI true DB smoke:

| Run | Result |
|---|---|
| PR #97 pull_request run `28013733098`, job `82912847896`, head `4f8e757` | pass; `M4 order import true DB runtime smokes`, `npm run test` and `npm run build` all passed. The true DB step ran both M4-35 and M4-36 smoke scripts against `UZMAX_RLS_DATABASE_URL`; frontend-only size/playwright jobs were skipped by path scope. |

## Acceptance Mapping

| Item | Status | Notes |
|---|---|---|
| B-01 | `api_http_true_db_smoke_supported_not_closed` | Adds automated dev DB RLS read/write plus Nest HTTP read smoke for M4 order import rows. Full durable SQL/RLS matrix remains future scope. |
| E-01 | `not_current_blocker__no_api_for_m4` | No external order API connector was added or called. |
| E-02 | `api_http_true_db_smoke_supported_not_closed` | HTTP jobs/errors/snapshot endpoints can read synthetic import snapshot data through the RLS repository against dev main. Admin visible E2E, formal auth runtime, queue runtime, Storage runtime and real import sample remain open. |
| E-03 | `not_closed` | Stale snapshot warning E2E is not covered here. |
| E-04 | `not_closed` | AI order-read runtime, eval fixtures and redline gate are not covered here. |
| J-02 | `not_closed` | BullMQ/Redis retry/idempotency/backlog/fault-injection evidence is not present. |
| I-01 | `not_closed` | Full desktop order/customer/knowledge/eval workflow E2E is not present. |

## Boundary Notes

- This smoke intentionally follows M4-35 vertically outward into HTTP/API instead of adding another contract-only layer.
- The synthetic access-context service is smoke-only. It is not formal Supabase identity verification, authz repository integration or owner login evidence; the Nest guard itself remains the real `ApiAccessContextGuard`.
- The Nest HTTP harness lives under `apps/api/scripts` so `packages/db` does not directly depend on API package dependencies.
- The focused test uses a worktree-local unique runtime cache under `node_modules/.cache` to avoid deleting the shared API runtime cache during full concurrent Node tests.
- Existing root/main untracked duplicate docs are outside this spec and were not edited.
