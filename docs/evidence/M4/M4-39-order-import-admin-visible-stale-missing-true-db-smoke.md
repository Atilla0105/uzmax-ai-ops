# M4-39 Order Import Admin Visible Stale/Missing True DB Smoke Evidence

> spec: `docs/specs/M4-39-order-import-admin-visible-stale-missing-true-db-smoke.md`
> branch: `codex/m4-39-order-import-admin-visible-stale-missing-true-db-e2e`
> worktree: `/Users/atilla/Documents/uzmax-m4-39-order-import-admin-visible-stale-missing-true-db-e2e`
> target: Supabase `uzmax-dev` dev main through `UZMAX_RLS_DATABASE_URL`
> date: 2026-06-23

## Scope

M4-39 extends M4-38 from browser-visible fresh true DB evidence to browser-visible stale/missing handoff evidence. The default `/design` page remains the existing synthetic local shell. The true DB browser path only activates when Playwright injects:

```js
window.__UZMAX_M4_ORDER_IMPORT_VISIBLE_SMOKE__ = {
  enabled: true,
  now: "2026-07-01T08:30:00.000Z",
  queryRef: "controlled://order/m4-39-ref-a"
};
```

The smoke script also opens a separate browser page with `queryRef: "controlled://order/m4-39-missing-ref"`.

When enabled, `apps/admin/src/M4OrderImportVisibleSmokeState.tsx` uses the existing `createOrderImportApiClient({ fetcher: (input, init) => fetch(input, init) })` boundary. The smoke script routes browser `/order-import/**` requests to the real Nest HTTP smoke app, which uses `ApiAccessContextGuard`, `OrderImportController`, `OrderImportService` and the RLS Prisma repository against synthetic Supabase dev main rows.

M4-39 also extracts the M4-38/M4-39 shared Vite, Playwright, route proxy, seed and cleanup mechanics into `packages/db/scripts/order-import-admin-visible-smoke-harness.mjs`; the M4-38 entrypoint remains behaviorally the fresh visible true DB smoke.

This does not close full E-02/E-03/E-04/I-01/J-02/B-01. It does not add formal auth runtime, full worker queue execution, Storage upload/download runtime, XLSX parsing, real import samples, real customer/order data, external order API, AI order-read runtime, eval redlines, production DB or GA release readiness.

## Synthetic Data Boundary

The smoke uses fixed non-real UUIDs and controlled refs only:

| Item | Value |
|---|---|
| Org | `11111111-1111-4111-8111-111111111139` / `m4-39-synthetic-org` |
| Tenant A | `22222222-2222-4222-8222-222222222139` |
| Tenant B | `33333333-3333-4333-8333-333333333139` |
| User | `44444444-4444-4444-8444-444444444139` |
| Import job | `55555555-5555-4555-8555-555555555139` |
| Order snapshot | `66666666-6666-4666-8666-666666666139` |
| Row error | `77777777-7777-4777-8777-777777777139` |
| Source ref | `storage://order-imports/m4-39-admin-visible-stale-missing-true-db-smoke.csv` |
| Stale order ref | `controlled://order/m4-39-ref-a` |
| Missing order ref | `controlled://order/m4-39-missing-ref` |
| Marker | `metadata.synthetic_spec = M4-39` |

No raw order/customer data, screenshots, phone/address/payment/order IDs, credentials, env files or secret values are written to repo or printed by the smoke.

## Verification Commands

Focused local harness validation:

```bash
node --test scripts/tests/m4-order-import-admin-visible-stale-missing-true-db-smoke.test.mjs
```

Compatibility validation with M4-38:

```bash
node --test scripts/tests/m4-order-import-admin-visible-true-db-smoke.test.mjs scripts/tests/m4-order-import-admin-visible-stale-missing-true-db-smoke.test.mjs
```

Fail-closed local env validation:

```bash
env -u UZMAX_RLS_DATABASE_URL node packages/db/scripts/run-m4-order-import-admin-visible-stale-missing-true-db-smoke.mjs
```

CI true DB browser-visible validation target:

```bash
node packages/db/scripts/run-m4-order-import-admin-visible-stale-missing-true-db-smoke.mjs
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
| Visible source ref | `storage://order-imports/m4-39-admin-visible-stale-missing-true-db-smoke.csv` |
| Visible row error | `order_status_ref_required` |
| Stale query | `handoff_required`, `order_snapshot_stale`, `Runtime warning: order_snapshot_stale`, `Handoff: required` |
| Missing query | `handoff_required`, `order_snapshot_missing`, `Runtime warning: order_snapshot_missing`, `Handoff: required` |
| Status refs on handoff | no `Status ref`, no `orderStatusRef`, no `status://order/ready` |
| Cleanup residue | `0` |

## Results

Local validation before PR:

| Command | Result |
|---|---|
| `node --test scripts/tests/m4-order-import-admin-visible-stale-missing-true-db-smoke.test.mjs` | passed: 3/3 |
| `node --test scripts/tests/m4-order-import-admin-visible-true-db-smoke.test.mjs scripts/tests/m4-order-import-admin-visible-stale-missing-true-db-smoke.test.mjs` | passed: 6/6 |
| `env -u UZMAX_RLS_DATABASE_URL node packages/db/scripts/run-m4-order-import-admin-visible-stale-missing-true-db-smoke.mjs` | passed fail-closed: `UZMAX_RLS_DATABASE_URL is required` |
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
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M4-39-order-import-admin-visible-stale-missing-true-db-smoke.md --include-worktree` | passed: 10 changed files; categories config 1, source 4, docs 3, test 2; source changed files 4, source net LOC 220, new source files 2 |
| `npm run test` | passed: 284/284 |
| `npm run build` | passed |
| `npm run size` | passed: 58.8 kB brotlied, limit 250 kB |
| `npm run playwright` | passed: 11/11 |
| `UZMAX_ASSIGNED_WORKTREE=/Users/atilla/Documents/uzmax-m4-39-order-import-admin-visible-stale-missing-true-db-e2e UZMAX_PRIMARY_ROOT=/Users/atilla/Documents/UZMAX智能运营 npm run guard:worker-boundary` | passed |

CI true DB visible stale/missing smoke:

| Run | Result |
|---|---|
| GitHub Actions CI run `28022935767`, job `82943502853`, head `5fc897294ae2b927b13b42e539804deed85a3871` | passed: M4-35/M4-36/M4-37/M4-38/M4-39 true DB smokes passed with residue `0`; `npm run test` passed 284/284; `npm run build` passed; `npm run size` passed at 58.8 kB brotlied; `npm run playwright` passed 11/11 |

Key CI smoke log:

```text
m4-order-import-admin-visible-stale-missing-true-db-smoke: passed browser admin visible stale/missing true DB synthetic path; residue=0
```

## Acceptance Mapping

| Item | Status | Notes |
|---|---|---|
| B-01 | `admin_visible_stale_missing_true_db_smoke_supported_not_closed` | Browser-visible stale/missing CI target traversed Admin client -> Nest HTTP -> API -> DB/RLS against dev main synthetic tenant A rows. Full durable SQL/RLS matrix remains future scope. |
| E-01 | `not_current_blocker__no_api_for_m4` | No external order API connector was added or called. |
| E-02 | `admin_visible_stale_missing_true_db_smoke_supported_not_closed` | Visible Admin shell has M4-38 fresh true DB smoke evidence, and M4-39 CI proved the stale/missing true DB browser smoke target. Formal auth runtime, full worker queue execution, real import sample, Storage runtime and full E2E remain open. |
| E-03 | `admin_visible_stale_missing_true_db_smoke_supported_not_closed` | M4-39 CI proved the stale true DB browser smoke target shows handoff-required warning without order status refs. Persisted warning storage and full E2E stale samples remain future scope. |
| E-04 | `visible_handoff_smoke_supported_not_closed` | M4-39 CI proved visible stale/missing handoff assertions without status ref exposure. AI order-read runtime, eval fixtures and redline gate are not covered here. |
| I-01 | `partial_admin_visible_true_db_smoke_not_closed` | `/design` Admin shell rendered stale/missing handoff runtime data through true DB HTTP smoke in CI. Full desktop core order/customer workflow remains future scope. |
| J-02 | `not_closed` | BullMQ/Redis retry/idempotency/backlog/fault-injection evidence is not present. |

## Boundary Notes

- This smoke intentionally follows M4-38 vertically outward into stale/missing visible Admin browser evidence.
- The browser route proxy and synthetic access-context service are smoke-only. They are not formal Supabase identity verification, authz repository integration or owner login evidence.
- The UI runtime mode is hidden behind the smoke global; default `/design` remains synthetic/local and does not call `/order-import`.
- M4-39 adds no real customer/order data, screenshots, secrets or external connector calls.
