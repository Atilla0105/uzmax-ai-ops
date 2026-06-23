# M4-34 Dev Main DB Baseline Evidence

> spec: `docs/specs/M4-34-dev-main-db-baseline.md`  
> branch: `codex/m4-34-dev-main-db-baseline`  
> worktree: `/Users/atilla/Documents/uzmax-m4-34-dev-main-db-baseline`  
> target: Supabase `uzmax-dev` / `enyocaykcgcfcswycujg` / org `kbuvfalyysfmptcazxnc`  
> date: 2026-06-23

## Scope

This evidence records the first dev main apply of the already-merged M1-M4 repo migrations `0001-0006`, plus minimum SQL/RLS verification against the real Supabase dev project.

This is not production, GA-0, release readiness, real customer traffic, real order data, external order API, Storage downloader, BullMQ/Redis queue runtime, admin visible E2E, AI runtime or eval evidence.

## Pre-Apply State

Read-only Supabase checks before apply showed:

| Check | Result |
|---|---|
| Project | `uzmax-dev` / `enyocaykcgcfcswycujg`, org `kbuvfalyysfmptcazxnc`, Postgres `17.6.1.127`, `ACTIVE_HEALTHY` |
| Migration history | Only SPK-03 migrations existed: `spk03_rls_prisma_pool_baseline`, `spk03_rls_pooler_qualified_role`, `spk03_grant_ci_role_to_postgres` |
| Public business tables | `0` |
| `uzmax_app_runtime` role | absent |
| M4 order import RLS tables | absent |

Supabase changelog was checked on 2026-06-23. The 2026-04-28 breaking change about tables not being exposed to Data/GraphQL API automatically does not block this direct Postgres/RLS path; future Data API usage still needs explicit grants/settings review. Reference: https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically

## Applied Migrations

Applied through Supabase MCP `_apply_migration`, using only SQL already present in repo migration files:

| Repo file | Applied migration name | Remote version |
|---|---|---|
| `packages/db/migrations/0001_platform_schema_authz_foundation.sql` | `m1_platform_schema_authz_foundation` | `20260623070625` |
| `packages/db/migrations/0002_audit_config_version_foundation.sql` | `m1_audit_config_version_foundation` | `20260623070714` |
| `packages/db/migrations/0003_channel_conversation_ticket_foundation.sql` | `m2_channel_conversation_ticket_foundation` | `20260623070823` |
| `packages/db/migrations/0004_ai_capability_data_contracts_foundation.sql` | `m3_ai_capability_data_contracts_foundation` | `20260623070957` |
| `packages/db/migrations/0005_customer_asset_contracts_foundation.sql` | `m4_customer_asset_contracts_foundation` | `20260623071107` |
| `packages/db/migrations/0006_order_import_snapshot_contracts_foundation.sql` | `m4_order_import_snapshot_contracts_foundation` | `20260623071228` |

## Structural Verification

Post-apply SQL checks returned:

| Check | Result |
|---|---|
| Expected public tables | `32/32`, missing `[]` |
| M4 order import tables | `import_job`, `order_snapshot`, `import_row_error`, `order_query_log` |
| M4 RLS | all 4 tables `relrowsecurity=true`, `relforcerowsecurity=true` |
| Runtime role | `uzmax_app_runtime`, `rolcanlogin=false`, `rolbypassrls=false` |
| M4 policy count | `3` policies per M4 order import table |
| M4 grants to runtime role | `INSERT`, `SELECT`, `UPDATE` on all 4 M4 order import tables |

## Synthetic RLS Probe

Synthetic seed used fixed test UUIDs and non-real placeholder refs only:

| Item | Value |
|---|---|
| Org | `11111111-1111-4111-8111-111111111134` / `m4-34-synthetic-org` |
| Tenant A | `22222222-2222-4222-8222-222222222134` |
| Tenant B | `33333333-3333-4333-8333-333333333134` |
| Marker | `metadata.synthetic_spec = M4-34` |
| Source refs | `synthetic://m4-34/dev-main-db-baseline.csv` |

RLS probe was executed under `set local role uzmax_app_runtime` with transaction-local `app.org_id` / `app.tenant_id` context:

| Runtime context | `import_job` | `order_snapshot` | `import_row_error` | `order_query_log` | Result |
|---|---:|---:|---:|---:|---|
| Tenant A context | 1 | 1 | 1 | 1 | pass |
| Tenant B context | 0 | 0 | 0 | 0 | pass |
| Missing context | 0 | 0 | 0 | 0 | pass |

Cleanup query deleted the synthetic org and cascaded synthetic children. Residue check returned:

| Table group | Residue count |
|---|---:|
| org | 0 |
| tenant | 0 |
| import_job | 0 |
| order_snapshot | 0 |
| import_row_error | 0 |
| order_query_log | 0 |

## Advisor Check

Supabase advisor after DDL apply:

| Advisor | Result |
|---|---|
| Security | `0` lints |
| Performance | non-blocking lints present |

Performance lints were not fixed in this spec because M4-34 is limited to applying the already-merged baseline and recording truth. The next DB hardening slice should triage at least:

- `unindexed_foreign_keys` on several composite FKs, including order import/customer/conversation/eval paths. Remediation reference: https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys
- `auth_rls_initplan` for RLS policies that call `current_setting()` per row, including M4 order import policies. Remediation reference: https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan
- `unused_index` on newly created indexes, expected to be noisy before real workload but should be rechecked after runtime usage exists. Remediation reference: https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index
- Auth connection allocation is currently an INFO performance advisor, not caused by these migrations. Remediation reference: https://supabase.com/docs/guides/deployment/going-into-prod

## Acceptance Mapping

| Item | Status | Notes |
|---|---|---|
| B-01 | `dev_main_true_db_rls_probe_supported_not_closed` | Real dev main has M1-M4 schema and M4 order import RLS probe passed for tenant A/B/default-deny. Durable automated SQL/RLS CI still needed. |
| E-01 | `not_current_blocker__no_api_for_m4` | No order API connector was added or called. |
| E-02 | `dev_main_db_baseline_supported_not_closed` | The DB/RLS substrate for import snapshot main path now exists in dev main. Still needs real API/auth runtime, worker execution, admin visible E2E and real import sample evidence. |
| E-03 | `not_closed` | Stale snapshot warning E2E was not tested here. |
| E-04 | `not_closed` | AI order-read runtime, eval fixtures and redline gate were not tested here. |
| J-02 | `not_closed` | BullMQ/Redis retry/idempotency/backlog/fault-injection evidence not present. |
| I-01 | `not_closed` | Full desktop order/customer/knowledge/eval workflow E2E not present. |

## Boundary Notes

- No raw order/customer data, CSV/XLSX export, screenshots, phone/address/payment/order IDs, credentials, env files or secret values were written to repo.
- This evidence changes the honest progress signal: dev main now has a real M1-M4 DB/RLS baseline, but runtime/E2E/eval/queue evidence remains open.
- Existing root/main untracked duplicate docs are outside this spec and were not edited.
