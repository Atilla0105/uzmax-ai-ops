# M4-38 Order Import Admin Visible True DB Smoke Evidence

> spec: `docs/specs/M4-38-order-import-admin-visible-true-db-smoke.md`
> branch: `codex/m4-38-order-import-admin-visible-true-db-e2e`
> worktree: `/Users/atilla/Documents/uzmax-m4-38-order-import-admin-visible-true-db-e2e`
> target: Supabase `uzmax-dev` dev main through `UZMAX_RLS_DATABASE_URL`
> date: 2026-06-23

## Scope

M4-38 extends M4-37 from Admin client HTTP smoke to browser-visible Admin shell evidence. The default `/design` page remains the existing synthetic local shell. The true DB browser path only activates when Playwright injects:

```js
window.__UZMAX_M4_ORDER_IMPORT_VISIBLE_SMOKE__ = {
  enabled: true,
  now: "2026-06-23T08:30:00.000Z",
  queryRef: "controlled://order/m4-38-ref-a"
};
```

When enabled, `apps/admin/src/M4OrderImportVisibleSmokeState.tsx` uses the existing `createOrderImportApiClient({ fetcher: (input, init) => fetch(input, init) })` boundary. The smoke script routes browser `/order-import/**` requests to the real Nest HTTP smoke app, which uses `ApiAccessContextGuard`, `OrderImportController`, `OrderImportService` and the RLS Prisma repository against synthetic Supabase dev main rows.

This does not close full E-02. It does not add formal auth runtime, full worker queue execution, Storage upload/download runtime, XLSX parsing, real import samples, real customer/order data, external order API, AI order-read runtime, eval redlines, production DB or GA release readiness.

## Synthetic Data Boundary

The smoke uses fixed non-real UUIDs and controlled refs only:

| Item | Value |
|---|---|
| Org | `11111111-1111-4111-8111-111111111138` / `m4-38-synthetic-org` |
| Tenant A | `22222222-2222-4222-8222-222222222138` |
| Tenant B | `33333333-3333-4333-8333-333333333138` |
| User | `44444444-4444-4444-8444-444444444138` |
| Import job | `55555555-5555-4555-8555-555555555138` |
| Order snapshot | `66666666-6666-4666-8666-666666666138` |
| Row error | `77777777-7777-4777-8777-777777777138` |
| Source ref | `storage://order-imports/m4-38-admin-visible-true-db-smoke.csv` |
| Order ref | `controlled://order/m4-38-ref-a` |
| Marker | `metadata.synthetic_spec = M4-38` |

No raw order/customer data, screenshots, phone/address/payment/order IDs, credentials, env files or secret values are written to repo or printed by the smoke.

## Verification Commands

Focused local harness validation:

```bash
node --test scripts/tests/m4-order-import-admin-visible-true-db-smoke.test.mjs
```

CI true DB browser-visible validation target:

```bash
node packages/db/scripts/run-m4-order-import-admin-visible-true-db-smoke.mjs
```

The CI step must receive `UZMAX_RLS_DATABASE_URL` from GitHub Actions secrets and install Playwright Chromium before running this script. The local shell does not need to store or print that secret.

## Runtime Assertions

| Check | Expected |
|---|---|
| Default `/design` mode | no `m4-order-runtime-state`; existing synthetic local shell remains visible |
| Smoke runtime gate | `window.__UZMAX_M4_ORDER_IMPORT_VISIBLE_SMOKE__.enabled === true` |
| Browser client boundary | existing `createOrderImportApiClient` with relative fetcher |
| Browser route proxy | `**/order-import/**` to Nest HTTP base URL with synthetic tenant/permission headers |
| Nest runtime | smoke-only module using real `ApiAccessContextGuard`, `OrderImportController` and `OrderImportService` |
| Repository runtime | `rls_prisma_gateway` with `createOrderImportRlsBatchTransactionRunner(prisma)` |
| Visible source ref | `storage://order-imports/m4-38-admin-visible-true-db-smoke.csv` |
| Visible row error | `order_status_ref_required` |
| Visible snapshot state | `snapshot_ready` |
| Visible status ref | `status://order/ready` |
| Visible handoff | `Handoff: not required` |
| Cleanup residue | `0` |

## Results

Local validation before PR:

| Command | Result |
|---|---|
| `node --test scripts/tests/m4-order-import-admin-visible-true-db-smoke.test.mjs` | pass; 3/3 tests |
| `node --test scripts/tests/m4-order-import-admin-visible-true-db-smoke.test.mjs scripts/tests/m4-order-import-admin-true-db-http-smoke.test.mjs scripts/tests/m4-order-import-api-true-db-http-smoke.test.mjs scripts/tests/m4-order-import-admin-api-bridge-contract.test.mjs` | pass; 14/14 tests |
| `env -u UZMAX_RLS_DATABASE_URL node packages/db/scripts/run-m4-order-import-admin-visible-true-db-smoke.mjs` | expected fail-closed; `UZMAX_RLS_DATABASE_URL is required` |
| `npm run format:check` | pass |
| `npm run lint` | pass |
| `npm run typecheck` | pass |
| `npm run test` | pass; 281/281 tests |
| `npm run build` | pass |
| `npm run playwright` | pass; 11/11 tests |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M4-38-order-import-admin-visible-true-db-smoke.md --include-worktree` | pass before staging; changed files 9, source changed files 3 |

CI true DB visible smoke:

| Run | Result |
|---|---|
| GitHub Actions CI `28019553207` (`checks`, job `82932152200`) | pass; `m4-order-import-admin-visible-true-db-smoke: passed browser admin visible true DB synthetic path; residue=0` |

The same CI run also kept the previous true DB chain green:

| Smoke | CI Result |
|---|---|
| `m4-order-import-true-db-runtime-smoke` | pass; `worker->DB/RLS->API synthetic path; residue=0` |
| `m4-order-import-api-true-db-http-smoke` | pass; `Nest HTTP->API->DB/RLS synthetic path; residue=0` |
| `m4-order-import-admin-true-db-http-smoke` | pass; `admin client->Nest HTTP->API->DB/RLS synthetic path; residue=0` |
| `m4-order-import-admin-visible-true-db-smoke` | pass; `browser admin visible true DB synthetic path; residue=0` |

## Acceptance Mapping

| Item | Status | Notes |
|---|---|---|
| B-01 | `admin_visible_true_db_smoke_supported_not_closed` | Adds browser-visible Admin shell requests through Admin client -> Nest HTTP -> API -> DB/RLS against dev main synthetic rows. Full durable SQL/RLS matrix remains future scope. |
| E-01 | `not_current_blocker__no_api_for_m4` | No external order API connector was added or called. |
| E-02 | `admin_visible_true_db_smoke_supported_not_closed` | Visible Admin shell can display true DB synthetic import job, row error and fresh snapshot. Formal auth runtime, full worker queue execution, real import sample, Storage runtime and full E2E remain open. |
| E-03 | `partial_admin_visible_true_db_smoke_not_closed` | Fresh snapshot visibility is covered; stale/missing visible E2E samples and persisted warning evidence remain future scope. |
| E-04 | `not_closed` | AI order-read runtime, eval fixtures and redline gate are not covered here. |
| J-02 | `not_closed` | BullMQ/Redis retry/idempotency/backlog/fault-injection evidence is not present. |
| I-01 | `partial_admin_visible_true_db_smoke_not_closed` | `/design` Admin shell can visibly render runtime data through true DB HTTP smoke. Full desktop core order/customer workflow remains future scope. |

## Boundary Notes

- This smoke intentionally follows M4-37 vertically outward into the visible Admin browser shell.
- The browser route proxy and synthetic access-context service are smoke-only. They are not formal Supabase identity verification, authz repository integration or owner login evidence.
- The UI runtime mode is hidden behind the smoke global; default `/design` remains synthetic/local and does not call `/order-import`.
- Existing stale/missing contracts remain open for later visible E2E samples; this slice only proves the fresh true DB synthetic row can be seen in Admin shell.
