# M4 Evidence

M4 evidence is intended to track order/customer milestone records: SPK-02 order SaaS API branch decision, import-snapshot main path evidence, customer asset/order snapshot workflows, fields/tags, quote records and identity merge/split evidence.

Current M4 evidence only contains the SPK-02 no-API branch evidence and its process-boundary record.

Current SPK-02 evidence: `spikes/SPK-02-order-saas-api/manifest.md`.

Current SPK-02 branch status is `no_api_for_m4__import_snapshot_main_path`: project owner provided the input “暂时没有api” on 2026-06-22. This records only the current M4 no-API branch. It does not claim the order SaaS API is permanently impossible and can be superseded by a new spec/ADR revision/superseding ADR after owner provides API docs, sandbox credentials or controlled test evidence.

Current acceptance mapping:

| Item | Status | Notes |
|---|---|---|
| E-01 | `not_current_blocker__no_api_for_m4` | No usable API docs/sandbox credentials for current M4 branch; no API connector claim. |
| E-02 | `p0_current_main_path__import_snapshot` | CSV/table import snapshot is the current order-data main path. |
| E-03 | `p0_remains__stale_snapshot_warning` | Stale snapshot warnings remain required. |
| E-04 | `p0_remains__no_fabricated_order_status` | AI must not fabricate logistics/order status; missing, stale or degraded order data must hand off. |

M4 current evidence boundary:

- No production, GA-0, real customer traffic, customer LLM, formal 1.0 release signoff or order/customer milestone closeout is approved by this README.
- No external order API, LLM/provider, Telegram, real customer system or production connector call is represented as evidence here.
- No raw order/customer data belongs in this directory: no CSV/XLSX exports, raw payloads, screenshots, order IDs, phone numbers, addresses, payment information, customer plaintext, credentials or env files.
- Future admin order UI wording for the no-API branch must be `订单数据主路径：导入快照`; do not present the branch as a temporary API outage.
- Future API reopening requires owner-provided docs/sandbox credentials or controlled test evidence, plus a new spec and ADR revision/superseding ADR.

This M4 directory is an evidence index, not a runtime implementation or release gate approval.
