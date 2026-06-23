# M4-37 Order Import Admin True DB HTTP Smoke Evidence

> spec: `docs/specs/M4-37-order-import-admin-true-db-http-smoke.md`
> branch: `codex/m4-37-order-import-admin-true-db-http-smoke`
> worktree: `/Users/atilla/Documents/uzmax-m4-37-order-import-admin-true-db-http-smoke`
> target: Supabase `uzmax-dev` dev main through `UZMAX_RLS_DATABASE_URL`
> date: 2026-06-23

## Scope

M4-37 extends M4-36 from real Nest HTTP routes to the existing admin order import API client. The smoke compiles/imports `apps/admin/src/orderImportApiClient.ts`, starts the API-owned smoke-only Nest HTTP module with the real `ApiAccessContextGuard`, `OrderImportController` and `OrderImportService`, injects the RLS Prisma repository provider, and uses the Admin client fetcher boundary to call the HTTP routes.

The smoke exercises:

- synthetic org and two tenants in Supabase dev main;
- RLS-context writes for one import job, one order snapshot and one row error under `set local role "uzmax_app_runtime"` with tenant A settings;
- Admin client `listImportJobs()`;
- Admin client `listImportRowErrors(jobId)`;
- Admin client `searchSnapshot(...)`;
- tenant A visibility and tenant B non-visibility;
- tenant B row-errors request for tenant A job id maps to Admin client HTTP 404 failure;
- no-permission Admin client request maps to HTTP 403 failure;
- cleanup of the synthetic org and child rows with residue check `0`.

This is not full E-02 closure. It does not cover formal auth runtime, visible admin browser E2E, BullMQ/Redis execution, Storage upload/download runtime, XLSX parsing, real CSV samples, real customer/order data, external order API, AI order-read runtime, eval redlines, production DB or GA release readiness.

## Synthetic Data Boundary

The smoke uses fixed non-real UUIDs and controlled refs only:

| Item | Value |
|---|---|
| Org | `11111111-1111-4111-8111-111111111137` / `m4-37-synthetic-org` |
| Tenant A | `22222222-2222-4222-8222-222222222137` |
| Tenant B | `33333333-3333-4333-8333-333333333137` |
| User | `44444444-4444-4444-8444-444444444137` |
| Import job | `55555555-5555-4555-8555-555555555137` |
| Order snapshot | `66666666-6666-4666-8666-666666666137` |
| Row error | `77777777-7777-4777-8777-777777777137` |
| Source ref | `storage://order-imports/m4-37-admin-true-db-http-smoke.csv` |
| Order ref | `controlled://order/m4-37-ref-a` |
| Marker | `metadata.synthetic_spec = M4-37` |

No raw order/customer data, screenshots, phone/address/payment/order IDs, credentials, env files or secret values are written to repo or printed by the smoke.

## Verification Commands

Focused local harness validation:

```bash
node --test scripts/tests/m4-order-import-admin-true-db-http-smoke.test.mjs
node --test scripts/tests/m4-order-import-api-true-db-http-smoke.test.mjs
```

CI true DB Admin client HTTP validation target:

```bash
node packages/db/scripts/run-m4-order-import-admin-true-db-http-smoke.mjs
```

The CI step must receive `UZMAX_RLS_DATABASE_URL` from GitHub Actions secrets. The local shell does not need to store or print that secret.

## Runtime Assertions

| Check | Expected |
|---|---|
| Admin client runtime | existing `createOrderImportApiClient` imported from `apps/admin/src/orderImportApiClient.ts` |
| Nest runtime | smoke-only module using real `ApiAccessContextGuard`, `OrderImportController` and `OrderImportService` |
| Repository runtime | `rls_prisma_gateway` with `createOrderImportRlsBatchTransactionRunner(prisma)` |
| RLS write context | `uzmax_app_runtime`, tenant A |
| Tenant A `listImportJobs()` | includes synthetic import job |
| Tenant A `listImportRowErrors(jobId)` | returns one synthetic row error |
| Tenant A `searchSnapshot(...)` | returns `snapshot_ready` with controlled status ref |
| Tenant B `listImportJobs()` | does not include synthetic import job |
| Tenant B `searchSnapshot(...)` | returns `handoff_required` / `order_snapshot_missing` and runtime warning |
| Tenant B row errors by tenant A job id | Admin client rejects HTTP 404 |
| Tenant A no-permission jobs request | Admin client rejects HTTP 403 |
| Cleanup residue | `0` |

## Results

Local validation before PR:

| Command | Result |
|---|---|
| `npm ci` | pass; existing audit output still reports 3 high severity findings unrelated to this slice |
| `node --test scripts/tests/m4-order-import-admin-true-db-http-smoke.test.mjs` | pass; 3/3 tests |
| `node --test scripts/tests/m4-order-import-api-true-db-http-smoke.test.mjs` | pass; 4/4 tests |
| `env -u UZMAX_RLS_DATABASE_URL node packages/db/scripts/run-m4-order-import-admin-true-db-http-smoke.mjs` | expected fail-closed; `UZMAX_RLS_DATABASE_URL is required` |
| `npm run format:check` | pass |
| `npm run typecheck` | pass |
| `npm run lint` | pass |
| `npm run depcruise` | pass |
| `npm run jscpd` | pass; 0 clones |
| `npm run knip` | pass |
| `npm run guard:prettier-ignore -- --base origin/main` | pass |
| `npm run guard:forbidden-terms` | pass |
| `npm run guard:eval-triggers -- --base origin/main` | pass |
| `npm run guard:doc-triggers` | pass |
| `npm run guard:workspace` | pass |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M4-37-order-import-admin-true-db-http-smoke.md --include-worktree` | pass before staging; staged `git diff --cached --numstat` source metrics are changed source files 3, source net LOC +195, new source files 2 |
| `npm run test` | pass; 278/278 tests |
| `npm run build` | pass |
| `UZMAX_ASSIGNED_WORKTREE=/Users/atilla/Documents/uzmax-m4-37-order-import-admin-true-db-http-smoke UZMAX_PRIMARY_ROOT=/Users/atilla/Documents/UZMAX智能运营 npm run guard:worker-boundary` | pass |
| `git diff --check && git diff --cached --check` | pass |

GitHub CI true DB smoke:

| Run | Result |
|---|---|
| PR #98 pull_request run `28015934849`, job `82920127613`, head `6f6c5bc` | pass; `checks` completed successfully. The `M4 order import true DB runtime smokes` step ran M4-35, M4-36 and M4-37 smoke scripts against masked `UZMAX_RLS_DATABASE_URL`; the log printed `m4-order-import-admin-true-db-http-smoke: passed admin client->Nest HTTP->API->DB/RLS synthetic path; residue=0`. |

## Review Notes

Read-only spec compliance and code quality reviewers found no blocking findings. Both reviewers flagged the initial PR hygiene evidence as misleading because it reused pre-stage `guard:pr-shape` output that did not count new source files. This evidence now uses staged `git diff --cached --numstat` source metrics: changed source files 3, source net LOC +195, new source files 2.

## Acceptance Mapping

| Item | Status | Notes |
|---|---|---|
| B-01 | `admin_client_true_db_http_smoke_supported_not_closed` | Adds automated dev DB RLS read/write plus Admin client -> Nest HTTP -> API -> DB/RLS read smoke for M4 order import rows. Full durable SQL/RLS matrix remains future scope. |
| E-01 | `not_current_blocker__no_api_for_m4` | No external order API connector was added or called. |
| E-02 | `admin_client_true_db_http_smoke_supported_not_closed` | Admin client jobs/errors/snapshot endpoints can read synthetic import snapshot data through HTTP and the RLS repository against dev main. Visible admin E2E, formal auth runtime, queue runtime, Storage runtime and real import sample remain open. |
| E-03 | `not_closed` | Stale snapshot warning visible E2E is not covered here. |
| E-04 | `not_closed` | AI order-read runtime, eval fixtures and redline gate are not covered here. |
| J-02 | `not_closed` | BullMQ/Redis retry/idempotency/backlog/fault-injection evidence is not present. |
| I-01 | `partial_admin_client_true_db_http_smoke_not_closed` | Admin client can read runtime data through a true DB HTTP smoke. Full desktop core order/customer workflow with visible UI E2E remains future scope. |

## Boundary Notes

- This smoke intentionally follows M4-36 vertically outward into the Admin client instead of adding another contract-only layer.
- The synthetic access-context service is smoke-only. It is not formal Supabase identity verification, authz repository integration or owner login evidence; the Nest guard itself remains the real `ApiAccessContextGuard`.
- The Admin client import is smoke/test-only and does not add a browser runtime, global fetch default or production API base URL.
- Existing old no-merged local branches from merged PRs #58/#89 are outside this spec and were not edited.
