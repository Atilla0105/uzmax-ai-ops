# M6-07 Core Operations Synthetic E2E Evidence

Spec: `docs/specs/M6-07-core-ops-synthetic-e2e.md`
Tracking issue: Linear LAY-12
Status: `m6_core_ops_synthetic_e2e_recorded_a_d_e_h_i_supported_not_ga0`
Recorded: 2026-06-26

## Boundary

This evidence records a repo-level synthetic operations path by linking already merged source, tests and evidence. It does not claim one new live browser-to-DB runtime drill, and it does not approve GA-0, production deployment, real customer traffic, real customer/order data, customer LLM, real provider calls, production Redis/worker deployment, external SaaS onboarding or 1.0 release.

No raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys, Bot tokens or webhook secrets are stored here.

## Source Manifest

| Area | Source |
|---|---|
| Acceptance matrix | `UZMAX智能运营系统-1.0验收矩阵-v1.1.md` |
| Product and release boundary | `UZMAX智能运营系统-PRD-v1.1.md`; `UZMAX智能运营系统-技术架构-v1.1.md` |
| Admin/release console boundary | `UZMAX智能运营系统-后台设计与前端架构-v1.1.md`; `docs/evidence/M6/M6-01-release-gate-console.md` |
| RLS/authz dependency | `docs/evidence/M6/M6-04-rls-authz-release-matrix.md` |
| AI/no-fabrication dependency | `docs/evidence/M6/M6-05-ai-safety-eval-gates.md`; `docs/evidence/M4/M4-44-order-read-runtime-eval-gate.md` |
| Bot/handoff dependency | `docs/evidence/M6/M6-06-telegram-bot-ga0-main-path.md` |
| Conversation and ticket | `docs/evidence/M2/M2-03-conversation-handoff-ticket-api-contract.md`; `docs/evidence/M2/M2-04-admin-conversation-ticket-shell.md`; `docs/evidence/M2/M2-07-conversation-ticket-api-http-hardening.md` |
| Customer asset | `docs/evidence/M4/M4-43-customer-asset-runtime-workflow.md` |
| Order snapshot | `docs/evidence/M4/M4-37-order-import-admin-true-db-http-smoke.md`; `docs/evidence/M4/M4-42-order-import-operator-workflow.md` |
| Confirmation and formal write | `docs/evidence/M5/M5-03-confirmation-queue-api.md`; `docs/evidence/M5/M5-04-confirmation-queue-admin.md`; `docs/evidence/M5R/M5R-01-confirmation-queue-persistence.md`; `docs/evidence/M5R/M5R-02-formal-write-pipeline.md` |
| Logs and admin readback | `docs/evidence/M5/M5-06-logs-analytics.md`; `docs/evidence/M5/M5-08-integration-smoke-closeout.md`; `docs/evidence/M5R/M5R-05-logs-analytics-runtime.md`; `docs/evidence/M5R/M5R-07-admin-runtime-wiring.md`; `docs/evidence/M5R/M5R-08-true-integration-closeout.md` |
| M6 replay runbook | `docs/runbooks/core-ops-synthetic-e2e.md` |

## Synthetic Golden Path

| Stage | Traceable artifact contract | Current repo evidence | Remaining gap |
|---|---|---|---|
| 1. Conversation intake and handoff | `conversation://m6-07-core-ops`, status, unread/awaiting/SLA-risk flags, handoff event refs | M2-03 covers list/detail filters, access-context scoping and handoff ticket draft creation. M2-04 shows the synthetic admin conversation/ticket shell. M6-06 links Bot-only intake to handoff readiness. | Real Bot staging traffic and worker/engine consumer processing remain open. |
| 2. Ticket action | `ticket://m6-07-handoff`, claim/lock/note/escalate/close/reopen action refs | M2-03 covers ticket state machine. M2-07 maps validation, not found, lock conflict and permission failures to HTTP errors. | Real multi-support-account production drill and notification delivery remain open. |
| 3. Customer asset | `customer://m6-07-alpha`, identity, custom field, tag and related refs | M4-43 proves customer list/detail, identity refs, fields, tags, controlled related refs, restore writeback, audit persistence, tenant isolation and permission failure through API/admin/browser smoke. | Full customer aggregation across every production source and owner real-sample review remain open. |
| 4. Order snapshot | `storage://...`, import job ref, row error ref, `snapshot://m6-07-order`, stale/missing warning refs | M4-37 proves Admin client -> Nest HTTP -> API -> DB/RLS synthetic order rows. M4-42 proves operator-visible Storage metadata submit, TSV readback, row error, fresh snapshot, stale/missing handoff and residue cleanup. M4-44 maps missing/stale/degraded order reads to handoff and no-fabrication eval behavior. | External order API branch remains out by ADR-B02/no-API posture unless superseded; owner real sample, XLSX and production auth remain open. |
| 5. Confirmation queue | `confirmation://m6-07-decision`, candidate/diff refs, reviewer refs | M5-03 covers confirmation API decisions with `formalWrite: false`. M5-04 covers admin confirmation queue UI. M5R-01 adds RLS persistence. M5R-02 adds a named config-version plus audit-log formal-write proof path. | Full H-01 facts/journeys/stages/materials authoring remains open; broad publish flow remains M6-08/M6-09. |
| 6. Logs and analytics | audit refs, login/presence/operation log refs, board/export-draft refs | M5-06 covers local fixed board/log/export draft governance. M5R-05 adds runtime login/presence/operation log readback and controlled export draft creation. M5R-07 routes admin runtime shells through API paths. M5R-08 true DB closeout includes logs analytics in the serial wrapper chain. | Production export files, broad BI aggregation and final log-center release review remain open. |
| 7. Admin visibility | release console evidence links, design shell test ids and runtime-mode API paths | M6-01 records the release gate console; M2-04, M4-42, M4-43, M5-04, M5-06 and M5R-07 provide operator/admin visibility evidence. | I-01 full desktop core is supported at synthetic/repo-evidence level only; performance, realtime and visual-regression closure remain M6-09 concerns. |

## Operator Replay Steps

Use `docs/runbooks/core-ops-synthetic-e2e.md` for the operator-facing replay path. Safe repo replay uses only controlled refs and these validation commands:

```bash
node --test scripts/tests/m6-core-ops-synthetic-e2e.test.mjs
node --test scripts/tests/m2-conversation-ticket-api-contract.test.mjs
node --test scripts/tests/m2-conversation-ticket-api-http-hardening.test.mjs
node --test scripts/tests/m4-customer-asset-runtime-workflow.test.mjs
node --test scripts/tests/m4-order-import-operator-workflow.test.mjs
node --test scripts/tests/m4-order-read-runtime-eval-gate.test.mjs
node --test scripts/tests/m5-confirmation-queue-api.test.mjs
node --test scripts/tests/m5r-formal-write-pipeline.test.mjs
node --test scripts/tests/m5r-logs-analytics-runtime.test.mjs
node --test scripts/tests/m5r-admin-runtime-wiring.test.mjs
```

True DB wrappers remain environment-dependent. M5R-08 records the latest true DB closeout chain as `passed_true_db` in CI, while this M6-07 slice does not rerun or mutate true DB state.

## Acceptance Matrix Mapping

| Item | Current M6-07 release status | Evidence |
|---|---|---|
| A-01 | `classified_not_full_group_overview_closed` | M6-01 release console and M5/M5R board evidence support owner-facing health/risk links, but full group overview/connector health owner review remains M6-09. |
| A-02 / B-01..B-05 | `depends_on_m6_04_release_matrix` | M6-04 records RLS/authz matrix support. M6-07 consumes that dependency and does not broaden authz behavior. |
| A-04 | `non_goal_boundary_unchanged_not_final_ui_audit` | No external SaaS registration/billing/onboarding surface is added by this slice; final static/UI audit remains M6-09. |
| A-05 | `classified_connector_center_not_closed` | Connector center health/add/manage/degradation visibility is not closed by this golden path and remains final acceptance scope. |
| D-01 | `conversation_filters_supported_not_live_ws_closed` | M2-03/M2-04 support conversation filters/states and admin visibility. I-04 realtime remains open. |
| D-02 | `handoff_ticket_contract_supported_not_notification_closed` | M2-03 creates ticket summary, suggested action and SLA placeholder; real notification path remains open. |
| D-03 | `ticket_state_machine_supported_not_multi_account_e2e_closed` | M2-03/M2-07 cover claim/lock/note/escalate/close/reopen and lock conflicts; real multi-account admin E2E remains open. |
| D-04 | `customer_asset_runtime_supported_not_full_aggregation_closed` | M4-43 covers customer details, identity, fields, tags, related refs and API/admin/browser readback. |
| D-05 | `customer_restore_audit_supported_not_owner_prod_flow_closed` | M4-43 covers restore writeback and audit persistence in synthetic DB/RLS smoke. |
| D-06 | `not_closed` | Deletion/anonymization of identity/content plaintext is not closed by M6-07. |
| D-07 | `customer_field_tag_supported_conversation_tag_reuse_open` | M4-43 covers customer field/tag runtime; full conversation tag config reuse in analysis remains final scope. |
| E-01 | `not_current_branch_by_no_api_import_path` | M6-07 does not depend on an external order API connector. |
| E-02 | `order_import_operator_workflow_supported_not_prod_auth_real_sample_closed` | M4-37/M4-42 support admin/API/Storage-backed order snapshot readback with synthetic residue cleanup. |
| E-03 | `stale_missing_warning_supported_not_prod_warning_store_closed` | M4-42/M4-44 support stale/missing/degraded handoff behavior. |
| E-04 | `no_fabrication_eval_supported_not_prod_gate_closed` | M4-44 and M6-05 support order no-fabrication eval behavior without real provider/prompt release approval. |
| H-01 | `limited_config_formal_write_supported_not_full_authoring_closed` | M5R-02 proves one config-version formal-write path; full facts/journeys/stages/materials management remains open. |
| H-02 | `confirmation_required_runtime_supported` | M5-03/M5R-01/M5R-02 keep confirmation decisions human-gated and bounded. |
| H-03 | `diff_required_runtime_supported` | M5-03/M5-04/M5R-02 require conflict diff before approve/edit. |
| H-04 | `template_copy_runtime_supported_from_m5r` | M5R-08 includes template copy true DB evidence in the closeout chain; M6-07 only consumes it. |
| H-05 / H-06 | `asset_quick_reply_safety_open_for_m6_08` | StorageRef/file_id recovery and full quick-reply search/classification/import/export/permission flow remain M6-08/M6-09 gaps. |
| H-07 | `distill_health_supported_from_m5_m5r` | M5/M5R evidence supports distill health/downshift/manual recovery status; final release rollup remains M6-09. |
| I-01 | `synthetic_desktop_core_supported_not_full_live_e2e_closed` | The golden path ties admin surfaces and runtime evidence together, but no single new full live E2E harness is added. |
| I-02 | `mobile_fallback_supported_from_m5r_not_final_rollup` | M5/M5R support confirmation and AI emergency mobile fallback; final P0 rollup remains M6-09. |
| I-03 | `not_closed` | 10k conversation virtual-scroll performance evidence remains open. |
| I-04 | `not_closed` | WS/realtime 200ms evidence remains open. |
| I-05 | `not_closed` | Final design-token/visual-regression release gate remains open. |
| I-06 | `logs_analytics_runtime_supported_not_export_release` | M5-06/M5R-05/M5R-07 support fixed board, log readback and controlled export draft; production export release remains open. |
| I-07 | `logs_center_runtime_supported_not_final_log_review` | M5R-05/M5R-07 support login/presence/operation log runtime/admin wiring; final high-risk log review remains M6-09. |

## Remaining Gap Classification

| Class | Gap | Next owner |
|---|---|---|
| P0 before GA-0 | GA-0 checklist and audit-open decision remain closed. | M6-09 + project owner |
| P0 before GA-0 | Real staging Bot evidence, production worker/queue deployment, outbound leave-ticket behavior and live runtime traffic remain open. | M6-09 + owner/platform inputs |
| P0 before 1.0 | D-06 anonymization, I-03 performance, I-04 realtime and I-05 final visual/token release evidence remain open. | M6-09 or future scoped specs |
| P0 before 1.0 | H-01 broad authoring, H-05 asset recovery and H-06 full quick-reply flow remain open. | M6-08/M6-09 |
| P1/P2 classification | Connector center health/degradation, group overview owner review and production export file behavior need final product judgment. | M6-09 + project owner |
| External dependency | Backup/restore safe target and any real platform credentials remain owner/environment-dependent. | M6-08 |

## Validation Commands

Focused validation for this PR:

```bash
node --test scripts/tests/m6-core-ops-synthetic-e2e.test.mjs
```

Supporting evidence commands:

```bash
node --test scripts/tests/m2-conversation-ticket-api-contract.test.mjs
node --test scripts/tests/m2-conversation-ticket-api-http-hardening.test.mjs
node --test scripts/tests/m4-customer-asset-runtime-workflow.test.mjs
node --test scripts/tests/m4-order-import-operator-workflow.test.mjs
node --test scripts/tests/m4-order-read-runtime-eval-gate.test.mjs
node --test scripts/tests/m5-confirmation-queue-api.test.mjs
node --test scripts/tests/m5r-formal-write-pipeline.test.mjs
node --test scripts/tests/m5r-logs-analytics-runtime.test.mjs
node --test scripts/tests/m5r-admin-runtime-wiring.test.mjs
```
