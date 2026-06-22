# M4 Evidence

M4 evidence tracks order/customer milestone records: SPK-02 order SaaS API branch decision, import-snapshot main path evidence, customer asset/order snapshot workflows, fields/tags, quote records and identity merge/split evidence.

Current M4 evidence contains:

- SPK-02 no-API branch evidence: `spikes/SPK-02-order-saas-api/manifest.md`, `docs/specs/SPK-02-order-api.md`, `docs/adr/ADR-B02-order-api.md`.
- M4-01 admin order-path status shell evidence: `M4-01-admin-order-path-status-shell.md`.
- M4-02 customer asset DB contracts foundation evidence: `M4-02-customer-asset-db-contracts-foundation.md`.
- M4-03 evidence-index sync evidence: `M4-03-m4-evidence-index-sync.md`.

Current SPK-02 branch status is `no_api_for_m4__import_snapshot_main_path`: project owner provided the input “暂时没有api” on 2026-06-22. This records only the current M4 no-API branch. It does not claim the order SaaS API is permanently impossible and can be superseded by a new spec/ADR revision/superseding ADR after owner provides API docs, sandbox credentials or controlled test evidence.

Current acceptance mapping:

| Item | Status | Notes |
|---|---|---|
| B-01 | `foundation_supported_not_closed` | M4-02 adds tenant-scoped customer asset tables with forced RLS and no runtime delete grant; full unauthorized-access integration evidence remains future scope. |
| D-04 | `foundation_supported_not_closed` | M4-02 adds customer, identity, field and tag persistence foundation; UI/API/history/order aggregation remains future scope. |
| D-05 | `foundation_supported_not_closed` | M4-02 adds blacklist/unreachable flags and timestamps; restore API/admin/audit flow remains future scope. |
| D-07 | `foundation_supported_not_closed` | M4-02 adds customer field and customer tag definitions/assignments; conversation tags/admin config remain future scope. |
| E-01 | `not_current_blocker__no_api_for_m4` | No usable API docs/sandbox credentials for current M4 branch; no API connector claim. |
| E-02 | `p0_current_main_path__import_snapshot` | CSV/table import snapshot is the current order-data main path. |
| E-03 | `p0_remains__stale_snapshot_warning` | Stale snapshot warnings remain required. |
| E-04 | `p0_remains__no_fabricated_order_status` | AI must not fabricate logistics/order status; missing, stale or degraded order data must hand off. |
| I-01 | `partial_admin_shell_not_closed` | M4-01 adds visible admin order-path status shell; full desktop core order/customer workflow remains future scope. |

M4 current evidence boundary:

- No production, GA-0, real customer traffic, customer LLM, formal 1.0 release signoff or order/customer milestone closeout is approved by this README.
- No external order API, LLM/provider, Telegram, real customer system or production connector call is represented as evidence here.
- No raw order/customer data belongs in this directory: no CSV/XLSX exports, raw payloads, screenshots, order IDs, phone numbers, addresses, payment information, customer plaintext, credentials or env files.
- Future admin order UI wording for the no-API branch must be `订单数据主路径：导入快照`; do not present the branch as a temporary API outage.
- Future API reopening requires owner-provided docs/sandbox credentials or controlled test evidence, plus a new spec and ADR revision/superseding ADR.
- M4-01 and M4-02 are foundation/partial evidence only. They do not close the order import workflow, stale snapshot runtime, customer asset API/admin flows, production readiness or release signoff.

This M4 directory is an evidence index, not a runtime implementation or release gate approval.
