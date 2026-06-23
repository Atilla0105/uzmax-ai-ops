# M4-43 Customer Asset Runtime Workflow Evidence

> spec: `docs/specs/M4-43-customer-asset-runtime-workflow.md`
> branch: `codex/m4-43-customer-asset-runtime-workflow`
> worktree: `/Users/atilla/Documents/uzmax-m4-43-customer-asset-runtime-workflow`
> target: Supabase `uzmax-dev` dev main through `UZMAX_RLS_DATABASE_URL`
> status: implementation complete; local validation passed; CI true DB smoke pending; `large_change_exception` requested for source LOC budget

## Scope

M4-43 connects the existing M4-14 through M4-20 customer asset foundations into a minimum runtime workflow:

- smoke-only API runtime uses the real `CustomerAssetController`, `CustomerAssetService`, `ApiAccessContextGuard`, `PersistenceCustomerAssetRepository`, Prisma-shaped customer asset delegates and Prisma audit sink mapping;
- default `AppModule` remains in-memory for customer assets and audit, with no default env read or DB connection;
- true DB fixture seeds synthetic tenant A/B customer asset rows under RLS for customer, identity, custom field definition/value, tag definition/assignment and controlled related refs;
- Admin/browser smoke uses the existing `customerAssetApiClient` under an injected global only; default `/design` remains the synthetic local shell and does not fetch customer asset runtime data;
- restore clears blacklist/unreachable flags through DB/RLS and writes a real `audit_log` row, then cleanup returns residue to `0`.

This evidence does not close M4 as a whole. M4-44 remains open for AI order-read runtime/eval/redline gate, and M4-45 remains open for queue/security/closeout.

## Synthetic Fixture

| Field | Value |
|---|---|
| Synthetic spec | `M4-43` |
| Tenant A | `22222222-2222-4222-8222-222222222143` |
| Tenant B | `33333333-3333-4333-8333-333333333143` |
| Customer A | `55555555-5555-4555-8555-555555555143` |
| Customer B | `55555555-5555-4555-8555-555555556143` |
| Identity ref | `identity://m4-43-alpha-primary` |
| Field key | `m4_43.journey_stage` |
| Tag key | `m4-43-needs-review` |
| Related refs | `conversation://m4-43-history`, `snapshot://m4-43-order`, `quote://m4-43-draft`, `ticket://m4-43-open` |
| Restore reason | `reason://customer/m4-43-manual-review` |

## Runtime Assertions

| Check | Expected |
|---|---|
| Default API runtime | `CUSTOMER_ASSET_REPOSITORY` uses `InMemoryCustomerAssetRepository`; `API_AUDIT_SINK` uses `InMemoryAuditSink` |
| Smoke API runtime | explicit `rls_prisma_gateway` repository plus RLS Prisma audit sink |
| Browser runtime gate | `window.__UZMAX_M4_CUSTOMER_ASSET_RUNTIME_SMOKE__.enabled === true` |
| Customer readback | list/detail/identity refs/fields/tags/controlled related refs visible through API, admin client and browser |
| Restore writeback | blacklist and unreachable cleared in DB through customer asset API |
| Audit persistence | one real `audit_log` row with `customer.flags_restored`, actor, before/after, reason and restored flags |
| Tenant isolation | tenant B cannot read tenant A customer detail |
| Permission failure | missing `customer:read` returns 403 |
| Cleanup | synthetic DB residue returns `0` |

## Validation

| Command / Check | Result |
|---|---|
| `node --test scripts/tests/m4-customer-asset-runtime-workflow.test.mjs` | passed locally, 7 tests |
| `node --test scripts/tests/m4-customer-asset-api-shell.test.mjs scripts/tests/m4-admin-customer-asset-api-client-contract.test.mjs scripts/tests/m4-customer-asset-prisma-gateway.test.mjs scripts/tests/m4-api-audit-prisma-sink-contract.test.mjs scripts/tests/m4-customer-asset-runtime-workflow.test.mjs` | passed locally, 23 tests |
| `env -u UZMAX_RLS_DATABASE_URL node packages/db/scripts/run-m4-customer-asset-runtime-workflow-smoke.mjs` | passed fail-closed expectation with `UZMAX_RLS_DATABASE_URL is required` |
| CI true DB smoke | pending; requires GitHub Actions secret `UZMAX_RLS_DATABASE_URL`; local env is missing |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M4-43-customer-asset-runtime-workflow.md --include-worktree` | passed locally; guard reported 16 changed files, docs 3, config 1, source 10, test 2, but currently undercounts intent-to-add source LOC as `0` |
| `npm run format:check` | passed locally |
| `npm run guard:prettier-ignore` | passed locally |
| `npm run typecheck` | passed locally |
| `npm run lint` | passed locally |
| `npm run depcruise` | passed locally |
| `npm run jscpd` | passed locally, 0 clones |
| `npm run knip` | passed locally |
| `npm run guard:forbidden-terms` | passed locally |
| `npm run guard:eval-triggers` | passed locally; no eval-triggering paths changed |
| `npm run guard:doc-triggers` | passed locally |
| `npm run guard:workspace` | passed locally |
| `UZMAX_ASSIGNED_WORKTREE=/Users/atilla/Documents/uzmax-m4-43-customer-asset-runtime-workflow UZMAX_PRIMARY_ROOT=/Users/atilla/Documents/UZMAX智能运营 npm run guard:worker-boundary` | passed locally |
| `npm test` | passed locally, 309 tests |
| `npm run build` | passed locally |
| `npm run size` | passed locally, 61.78 kB brotli under 250 kB |
| `npm run playwright` | passed locally, 11 tests |

## PR Hygiene

| Metric | Result |
|---|---|
| Path categories | config 1; source 10; test 2; docs 3; no generated or lock changes |
| Changed source files | 10, within <= 12 |
| Net source LOC | about +1242 by `git diff --numstat origin/main` path classification; exceeds <= 750 budget |
| New source files | 6, at the <= 6 limit |
| Gross churn | about +1683 / -24 |
| Test weakening | none intended |
| External API/provider/connector evidence | none added; uses existing Prisma/Supabase dev DB runtime foundation only |
| Exceptions | `large_change_exception` requested for source LOC budget; merge requires owner approval / equivalent review record |

## Boundary Notes

- No DB schema, migration or generated Prisma client file is modified.
- No external customer system connector, order API connector, LLM/provider, Telegram runtime, queue/security runtime or release gate is added.
- No raw customer/order export, screenshot, credential, env file or secret value is written to repo.
- The smoke synthetic access context is not formal production auth. Formal auth runtime remains future scope.
- Browser runtime state is smoke-only; normal `/design` remains synthetic/local.

## Acceptance Mapping

| Item | Status | Notes |
|---|---|---|
| B-01 | `customer_asset_true_db_rls_supported_not_full_matrix` | Proves tenant A/B isolation for customer asset rows in dev DB/RLS; full durable SQL/RLS matrix remains future scope. |
| B-05 | `customer_asset_restore_audit_persistence_supported_not_full_audit_ui` | Restore writes a real synthetic `audit_log` row; audit query UI and production audit runtime remain future scope. |
| D-04 | `customer_asset_runtime_workflow_supported_not_full_aggregation` | Customer list/detail, identity refs, fields, tags and controlled related refs read back through API/admin/browser. |
| D-05 | `customer_asset_restore_runtime_supported_not_owner_signoff` | Blacklist/unreachable restore uses true API/DB/RLS and audit write; owner production flow remains future scope. |
| D-07 | `customer_asset_field_tag_runtime_supported_not_analysis_reuse` | Field/tag definitions and assignments read back through runtime; conversation tag config save and analysis reuse remain future scope. |
| I-01 | `customer_asset_runtime_workflow_supported_not_full_desktop_core` | Customer asset browser/API/DB/RLS visible path exists in smoke mode; full desktop core still needs later slices. |
| E-04 | `still_requires_m4_44_ai_order_read_runtime` | No AI order-read runtime/eval gate changes. |
| J-02 | `still_requires_m4_45_queue_security_closeout` | No queue/security closeout changes. |
