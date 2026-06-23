# M4 Evidence

M4 evidence tracks order/customer milestone records: SPK-02 order SaaS API branch decision, import-snapshot main path evidence, customer asset/order snapshot workflows, fields/tags, quote records and identity merge/split evidence.

Current M4 evidence contains:

- SPK-02 no-API branch evidence: `spikes/SPK-02-order-saas-api/manifest.md`, `docs/specs/SPK-02-order-api.md`, `docs/adr/ADR-B02-order-api.md`.
- M4-01 admin order-path status shell evidence: `M4-01-admin-order-path-status-shell.md`.
- M4-02 customer asset DB contracts foundation evidence: `M4-02-customer-asset-db-contracts-foundation.md`.
- M4-03 evidence-index sync evidence: `M4-03-m4-evidence-index-sync.md`.
- M4-04 order import snapshot DB contracts foundation evidence: `M4-04-order-import-snapshot-db-contracts-foundation.md`.
- M4-05 order-read import snapshot contract evidence: `M4-05-order-read-import-snapshot-contract.md`.
- M4-06 admin order import snapshot shell evidence: `M4-06-admin-order-import-snapshot-shell.md`.
- M4-07 order import API shell evidence: `M4-07-order-import-api-shell.md`.
- M4-08 order import repository port evidence: `M4-08-order-import-repository-port.md`.
- M4-09 order import worker contract evidence: `M4-09-order-import-worker-contract.md`.
- M4-10 order import parser contract evidence: `M4-10-order-import-parser-contract.md`.
- M4-11 order import Prisma gateway evidence: `M4-11-order-import-prisma-gateway.md`.
- M4-12 order import worker persistence contract evidence: `M4-12-order-import-worker-persistence-contract.md`.
- M4-13 admin order import API client contract evidence: `M4-13-admin-order-import-api-client-contract.md`.
- M4-14 customer asset API shell evidence: `M4-14-customer-asset-api-shell.md`.
- M4-15 admin customer asset API client contract evidence: `M4-15-admin-customer-asset-api-client-contract.md`.
- M4-16 customer asset admin shell evidence: `M4-16-customer-asset-admin-shell.md`.
- M4-17 customer asset persistence gateway evidence: `M4-17-customer-asset-persistence-gateway.md`.
- M4-18 customer asset Prisma gateway evidence: `M4-18-customer-asset-prisma-gateway.md`.
- M4-19 customer asset restore audit contract evidence: `M4-19-customer-asset-restore-audit-contract.md`.
- M4-20 API audit Prisma sink contract evidence: `M4-20-api-audit-prisma-sink-contract.md`.
- M4-21 order import runtime warning contract evidence: `M4-21-order-import-runtime-warning-contract.md`.
- M4-22 order-read no-fabrication eval contract evidence: `M4-22-order-read-no-fabrication-eval-contract.md`.
- M4-23 order import runtime provider contract evidence: `M4-23-order-import-runtime-provider-contract.md`.
- M4-24 order import worker queue job contract evidence: `M4-24-order-import-worker-queue-job-contract.md`.

Current SPK-02 branch status is `no_api_for_m4__import_snapshot_main_path`: project owner provided the input “暂时没有api” on 2026-06-22. This records only the current M4 no-API branch. It does not claim the order SaaS API is permanently impossible and can be superseded by a new spec/ADR revision/superseding ADR after owner provides API docs, sandbox credentials or controlled test evidence.

Current acceptance mapping:

| Item | Status | Notes |
|---|---|---|
| B-01 | `api_shell_supported_not_closed` | M4-02 adds tenant-scoped customer asset tables with forced RLS and no runtime delete grant; M4-14 adds selected-tenant API shell checks; M4-17 adds selected-tenant persistence mapper contract; M4-18 adds Prisma delegate scope contract. Full unauthorized-access SQL/RLS integration evidence remains future scope. |
| B-05 | `audit_prisma_sink_contract_supported_not_closed` | M4-19 adds a contract-shaped restore audit event recorded through the existing API audit sink. M4-20 adds an opt-in Prisma-shaped audit sink adapter for `AuditLogContract`. Real audit_log runtime provider, RLS transaction integration and query UI evidence remain future scope. |
| D-04 | `admin_shell_supported_not_closed` | M4-02 adds customer, identity, field and tag persistence foundation; M4-14 adds customer list/detail API shell with controlled related refs; M4-15 adds admin client contract; M4-16 adds visible customer list/detail shell; M4-17 maps customer asset DB contract rows through an API repository gateway; M4-18 adds the Prisma delegate gateway contract. Real history/order/quote/ticket aggregation remains future scope. |
| D-05 | `audit_prisma_sink_contract_supported_not_closed` | M4-02 adds blacklist/unreachable flags and timestamps; M4-14 adds restore API shell with audit draft; M4-15 validates admin restore request/response shape; M4-16 adds visible local restore action; M4-17 lets restore flag changes hand off to a persistence gateway; M4-18 scopes the restore update delegate; M4-19 records a controlled before/after restore audit event through the API audit sink; M4-20 maps that `AuditLogContract` shape to opt-in Prisma `auditLog.create` data. Admin owner flow and real audit persistence integration remain future scope. |
| D-07 | `admin_shell_supported_not_closed` | M4-02 adds customer field and customer tag definitions/assignments; M4-14 exposes field/tag definition API shell; M4-15 adds admin client contract for definitions; M4-16 shows field/tag surfaces; M4-17 maps field/tag rows through the repository gateway; M4-18 covers Prisma delegates for those rows. Conversation tag config save and analysis reuse remain future scope. |
| E-01 | `not_current_blocker__no_api_for_m4` | No usable API docs/sandbox credentials for current M4 branch; no API connector claim. |
| E-02 | `queue_job_contract_supported_not_closed` | CSV/table import snapshot is the current order-data main path. M4-04 adds DB contracts, M4-05 adds pure row/batch contracts, M4-06 adds synthetic admin visibility, M4-07 adds API shell visibility for import jobs/errors/search, M4-08 adds repository port/persistence mappers, M4-09 adds worker-side controlled-row draft generation, M4-10 adds bounded CSV text parser contract, M4-11 adds Prisma gateway contract, M4-12 adds worker-side persistence gateway ordering, M4-13 adds the admin API client contract, M4-21 strengthens snapshot handoff warning shape, M4-23 adds a fail-closed runtime provider selector contract and M4-24 adds a controlled worker job/idempotency dispatch contract; real parser, DB repository/runtime wiring, worker integration, DB client wiring, queue runtime, worker import queue runtime, RLS transaction wrapper, real BullMQ/Redis runtime and admin E2E remain future scope until production DB/runtime wiring is enabled and tested. The blocker cluster remains: real parser, DB client wiring, queue runtime. |
| E-03 | `runtime_provider_contract_supported_not_closed` | M4-04 adds expiry fields, M4-05 adds stale handoff contract, M4-06 adds admin stale warning shell, M4-07 adds stale API response contract, M4-08 preserves expiry/source fields through repository mapping, M4-09 preserves expiry/source fields in worker snapshot drafts, M4-10 parser rows preserve those fields for downstream validation, M4-11 preserves them through Prisma gateway mapping, M4-12 preserves them through worker persistence handoff, M4-13 preserves stale/missing handoff in the admin client, M4-21 adds API/admin client runtime warning envelope validation, M4-22 requires stale eval candidates to hand off without status exposure and M4-23 keeps future DB-backed runtime selection explicit/fail-closed; persisted warning, real DB runtime and E2E stale sample evidence remain future scope. |
| E-04 | `eval_contract_supported_not_closed` | M4-05 pure contract, M4-06 admin shell, M4-07 API shell, M4-08 repository mapping, M4-09 worker contract, M4-10 parser contract, M4-11 Prisma gateway contract, M4-12 worker persistence contract, M4-13 admin client and M4-21 warning envelope validation hand off missing/stale/degraded reads without status fabrication. M4-22 adds a pure no-fabrication eval contract for order-read candidates and M4-23 preserves explicit code/data repository selection; AI runtime integration, real fixtures and production eval gate remain future scope. |
| I-01 | `partial_customer_asset_admin_shell_not_closed` | M4-01 adds visible admin order-path status shell, M4-06 extends import/search states, M4-13 adds the order import admin API client contract, M4-15 adds the customer asset admin API client contract, M4-16 adds the visible customer asset shell, M4-17 adds a customer asset API repository gateway contract, M4-18 adds the Prisma delegate gateway contract, M4-19 adds restore audit contract behavior, M4-20 adds the opt-in API audit Prisma sink contract, M4-21 adds order import runtime warning validation, M4-22 adds order-read no-fabrication eval validation, M4-23 adds an API runtime provider selector contract and M4-24 adds a worker job/idempotency dispatch contract; full desktop core order/customer workflow with runtime data remains future scope. |
| J-02 | `queue_job_contract_supported_not_closed` | M4-12 adds deterministic worker persistence ordering, and M4-24 adds controlled job id/idempotency/retry metadata before that handler. Real BullMQ/Redis runtime, retry execution, idempotent storage locks, backlog alerting and fault-injection evidence remain future scope. |

M4 current evidence boundary:

- No production, GA-0, real customer traffic, customer LLM, formal 1.0 release signoff or order/customer milestone closeout is approved by this README.
- No external order API, LLM/provider, Telegram, real customer system or production connector call is represented as evidence here.
- No raw order/customer data belongs in this directory: no CSV/XLSX exports, raw payloads, screenshots, order IDs, phone numbers, addresses, payment information, customer plaintext, credentials or env files.
- Future admin order UI wording for the no-API branch must be `订单数据主路径：导入快照`; do not present the branch as a temporary API outage.
- Future API reopening requires owner-provided docs/sandbox credentials or controlled test evidence, plus a new spec and ADR revision/superseding ADR.
- M4-01, M4-02, M4-04, M4-05, M4-06, M4-07, M4-08, M4-09, M4-10, M4-11, M4-12, M4-13, M4-14, M4-15, M4-16, M4-17, M4-18, M4-19, M4-20, M4-21, M4-22, M4-23 and M4-24 are foundation/partial evidence only. They do not close the order import workflow runtime/admin/E2E blockers, real parser, DB repository/runtime wiring, worker integration beyond the pure M4-09 draft contract, M4-10 CSV text parser contract, M4-12 persistence gateway ordering and M4-24 dispatch contract, DB client wiring, worker import queue runtime beyond the M4-11 Prisma gateway contract, M4-23 provider selector contract and M4-24 job/idempotency contract, real BullMQ/Redis runtime, DB client runtime/RLS transaction wrapper, persisted warning storage and E2E stale sample evidence beyond the M4-21 runtime warning contract, customer asset admin UI/E2E beyond the M4-16 synthetic shell, customer asset production DB runtime/default provider/RLS transaction wrapper beyond the M4-17 gateway contract and M4-18 Prisma delegate contract, customer asset real audit persistence integration beyond the M4-19 contract event and M4-20 opt-in Prisma sink adapter, customer asset history-order-quote-ticket aggregation, AI order-read runtime integration, real eval fixtures, production eval gate, production readiness or release signoff.

This M4 directory is an evidence index, not a runtime implementation or release gate approval.
