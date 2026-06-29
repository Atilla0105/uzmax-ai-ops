# M6-09 Final Acceptance Rollup And GA-0 Decision Package

Spec: `docs/specs/M6-09-final-acceptance-rollup.md`
Tracking issue: Linear LAY-14
Status: `m6_final_acceptance_rollup_recorded_no_go_recommended_owner_decision_pending_not_ga0`
Recorded: 2026-06-26
Current-state note: this is historical M6 no-go evidence. M6B-17 later supersedes the J-01/J-03 missing-external-input blocker class with staging/test-only rollback and safe restore evidence. GA-0, production, real customer/order data, customer LLM and 1.0 release remain locked.

## Boundary

This evidence is the historical final M6 owner decision package. It rolls up repo evidence and blockers as of M6-09; it does not approve GA-0, production deployment, real customer/order data, customer LLM, real provider calls, P1 risk acceptance, external SaaS onboarding or 1.0 release.

No raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, database URLs, service role keys, LLM keys, Bot tokens or webhook secrets are stored here.

## Source Manifest

| Scope | Source |
|---|---|
| Project rules | `AGENTS.md` |
| Product release boundary | `UZMAX智能运营系统-PRD-v1.1.md` |
| Technical GA-0 rules | `UZMAX智能运营系统-技术架构-v1.1.md` |
| Admin/release boundary | `UZMAX智能运营系统-后台设计与前端架构-v1.1.md` |
| Acceptance matrix | `UZMAX智能运营系统-1.0验收矩阵-v1.1.md` |
| Evidence index | `docs/evidence/README.md`; `docs/evidence/M6/README.md` |
| Current external-input closure overlay | `docs/evidence/M6B/M6B-17-ga0-external-blocker-rollup.md` |
| M6 entry and plan | `docs/evidence/M6/M6-00-m5-signoff-and-m6-readiness-pack.md` |
| M6 slice evidence | `docs/evidence/M6/M6-01-release-gate-console.md`; `docs/evidence/M6/M6-02-runtime-deploy-baseline.md`; `docs/evidence/M6/M6-03-queue-failure-injection-drills.md`; `docs/evidence/M6/M6-04-rls-authz-release-matrix.md`; `docs/evidence/M6/M6-05-ai-safety-eval-gates.md`; `docs/evidence/M6/M6-06-telegram-bot-ga0-main-path.md`; `docs/evidence/M6/M6-07-core-ops-synthetic-e2e.md`; `docs/evidence/M6/M6-08-backup-restore-asset-safety.md` |
| Release boundary | `docs/release.md` |
| Runbook index | `docs/runbooks/README.md` |

## Decision Posture

| Decision | Current repo posture | Owner action required |
|---|---|---|
| GA-0 | `no_go_recommended_owner_decision_pending` | Owner may review this package, but current repo evidence keeps GA-0 closed. |
| 1.0 release | `blocked_p0_gaps_open` | 1.0 cannot be approved while P0-equivalent blockers remain open. |
| P1 risk acceptance | `none_recorded` | No explicit owner P1 signoff, fix date and impact note are recorded in repo. |
| P2 backlog | `none_recorded` | No explicit owner P2 backlog classification is recorded in repo. |
| Production / real data / customer LLM | `not_approved` | Requires separate owner/platform/key/cost/compliance decisions and evidence. |

The v1.1 acceptance matrix defines P0/P1/P2 levels but does not tag every row with an item-level priority. Therefore this rollup does not silently downgrade open rows. Any future P1 or P2 treatment must be explicit and must include owner signoff, fix date, impact note or backlog classification as required by the matrix.

M6B-17 later clears the missing external input blocker class for LAY-19, LAY-23, LAY-24 and LAY-30. That overlay changes current J-01/J-03 external-input posture only; it does not change this file's historical no-go decision, GA-0 lock, P1/P2 register or remaining non-external release conditions.

## GA-0 Checklist Rollup

Technical architecture v1.1 §11.1 says GA-0 opens only when all entry conditions are met. Current repo evidence does not meet that bar.

| GA-0 condition | Current status | Evidence |
|---|---|---|
| M2/M3 gates closed | `repo_evidence_supported_not_release_open` | M2/M3 evidence exists and M5 owner signoff allowed M6 to start, but M6 does not open GA-0. |
| Redline attack eval 100% pass and outbound filter active | `synthetic_support_real_production_filter_not_approved` | M6-05 records eval/redline support; production prompt/knowledge/model/persona publishing and customer LLM remain not approved. |
| User-level fuse drill passes | `synthetic_support_real_bot_leave_ticket_pending` | M6-05/M6-06 record fuse and handoff contracts; real Bot leave-ticket behavior remains open. |
| AI member emergency stop/recovery accepted | `runtime_contract_supported_not_ga0` | M5R/M6-05 support emergency/recovery controls without opening GA-0. |
| Heartbeat, Sentry, traceId, alert channel online | `partial_alert_channel_pending_owner` | M6-02 records Sentry project ready but alert channel remains owner-pending. |
| API and worker rollback drill | `historical_blocked_real_rollback_drills_pending_external_input_cleared_by_m6b17` | M6-02/M6-09 recorded the J-01 blocker at the time. M6B-17 later records staging/test-only api/worker/cron/admin rollback closure; GA-0 still requires owner opening and remaining non-external conditions. |
| Confirmation queue available | `supported` | M5/M5R/M6-07 record confirmation queue and named formal-write proof path. |
| Bilingual guidance/templates delivered | `owner_input_pending` | M6-00 records owner-provided GA-0 bilingual guidance/template final copy as pending. |
| Owner explicitly opens GA-0 | `not_approved` | No owner GA-0 open decision is recorded. |

GA-0 result from repo evidence: `no_go_recommended_owner_decision_pending`.

## 1.0 / Acceptance Matrix Blocker Rollup

| Area | Current rollup | Release interpretation |
|---|---|---|
| A-01 / A-05 group overview and connector center | `owner_review_and_connector_visibility_not_closed` | Owner product review and connector health/degradation evidence remain open. |
| A-02 / B-01..B-05 tenant isolation, authz and audit | `repo_supported_production_approval_and_full_high_risk_audit_review_pending` | M6-04 supports RLS/authz from repo evidence; production DB/RLS and full high-risk audit rollup remain owner/release concerns. |
| C-01 / C-02 / C-06 Bot main path | `synthetic_supported_real_staging_worker_outbound_pending` | M6-06 supports bounded Bot contracts; real staging Bot webhook, DB-backed dedupe/worker/engine/outbound leave-ticket behavior remain open. |
| C-03/C-04/C-05 Business branch | `not_current_branch_by_adr_b01` | Business feasibility and auto-reply are not part of the current branch; C-03b disabled branch remains the active path. |
| D-01..D-07 conversation, ticket and customer closure | `synthetic_supported_d06_and_full_live_ops_open` | M6-07 links core workflow evidence; D-06 anonymization and real multi-account/live operations remain open. |
| E-01..E-04 order path | `no_api_branch_import_path_supported_external_api_not_current` | Import fallback/no-fabrication path is supported; external order API branch is not current unless a later owner/ADR branch changes it. |
| F-01..F-06 AI capability safety | `repo_supported_owner_quality_inputs_and_real_provider_closed` | M6-05 supports safety contracts; owner quality inputs, real provider/customer LLM and production publish remain not approved. |
| G-01..G-06 LLM/eval governance | `repo_supported_g04_g06_production_rollup_open` | Routing/eval gates are supported; G-04 blind review and G-06 full >=200 eval set remain open owner/release items. |
| H-01..H-07 knowledge, assets, templates and distill | `h02_h03_h04_h07_supported_h01_h05_h06_open` | Confirmation/template/distill safety is supported; broad authoring, real storage rebuild and full quick-reply library remain open. |
| I-01..I-07 admin quality | `synthetic_supported_i03_i04_i05_and_final_visual_release_open` | Core admin visibility is supported; performance, realtime and final visual/token release gates remain open. |
| J-01 deploy/rollback | `historical_blocked_real_rollback_drills_pending_external_input_cleared_by_m6b17` | M6-09 recorded missing real rollback drills. M6B-17 later clears the external-input blocker with staging/test-only rollback evidence; production/release approval remains separate. |
| J-02 queue drill | `synthetic_supported_production_worker_alerting_not_approved` | M6-03 supports synthetic J-02; production Redis/worker and formal alert-channel routing remain not approved. |
| J-03 backup/restore | `historical_blocked_safe_restore_target_missing_external_input_cleared_by_m6b16_m6b17` | M6-08 recorded no safe restore target, backup snapshot or restore command evidence. M6B-16/M6B-17 later close the safe branch target proof; PITR/production backup-specific restore remains separate. |
| J-04 runbooks/fault drills | `partial` | Runbooks improved across M6, but full owner drill/review closure is not recorded. |
| J-05 release gate evidence | `rollup_recorded_not_release_approved` | This file records the rollup; owner signoff is still required. |
| J-06 ADR/spike governance | `supported_by_m0_adr_spike_evidence` | ADR-001/002 and SPK-03 evidence are linked by M6-04; final release owner review remains separate. |
| K-01..K-04 AI development governance | `supported_by_ci_guard_process_not_owner_release` | M6 slices follow spec/PR/guard rules; this does not approve release. |
| L-01 GA-0 gate | `not_open` | GA-0 checklist is not green and owner has not opened it. |
| L-02 GA redline leave-ticket path | `synthetic_support_real_bot_leave_ticket_pending` | Redline/fuse/ticket contracts exist; real Bot leave-ticket drill remains open. |

## No-Go Blockers For Owner Review

| Blocker | Impact | Required next evidence |
|---|---|---|
| J-01 real deploy/rollback drills missing | Historical M6-09 blocker; current external-input branch is cleared by M6B-17, but GA-0 and 1.0 stay closed. | Future production or broader rollback evidence only if explicitly opened by owner/spec. |
| J-03 backup/restore drill missing | Historical M6-09 blocker; current safe branch target branch is cleared by M6B-16/M6B-17, but GA-0 and 1.0 stay closed. | Future PITR/production backup-specific restore evidence only if explicitly opened by owner/spec. |
| L-02 real Bot leave-ticket path pending | GA-0 incident path is not proven. | Real or owner-approved staging redline/fuse Bot leave-ticket drill. |
| C-01/C-02 real staging Bot and worker/engine runtime gaps | GA-0 Bot channel cannot be treated as live-ready. | Staging Bot webhook, DB-backed dedupe/order restore, worker consumer and outbound behavior evidence. |
| G-04 / G-06 owner quality and full eval set open | AI quality release gate remains owner-dependent. | Blind review result and full >=200 eval-set quota/signoff evidence. |
| H-01 / H-05 / H-06 knowledge and asset gaps open | 1.0 knowledge/resources scope is not closed. | Full authoring flow, real storage rebuild drill and quick-reply library evidence or explicit owner scope change. |
| D-06 / I-03 / I-04 / I-05 final product quality gates open | 1.0 cannot be considered fully verified. | Anonymization, performance, realtime and visual/token release evidence or explicit owner classification. |
| Alert channel and bilingual GA-0 copy owner inputs pending | GA-0 operations guidance is incomplete. | Owner-approved alert routing and final bilingual guidance/template copy. |

## P1 / P2 Decision Register

| Register | Current repo status | Required for acceptance |
|---|---|---|
| P1 risk signoffs | `none_recorded` | Owner signoff, fix date and impact note per item. |
| P1 candidate items | `owner_decision_required` | Candidate examples include group overview review, connector health/degradation visibility and production export/log review, but none are accepted as P1 in repo. |
| P2 backlog items | `none_recorded` | Owner classification that the item is non-blocking after GA/1.0 scope review. |

No M6-09 evidence downgrades open blockers to P1 or P2.

## Final Owner Decision Package

Recommended repo-evidence posture for owner review:

- GA-0: `no_go_recommended_owner_decision_pending`.
- 1.0: `blocked_p0_gaps_open`.
- M6 evidence rollup: `recorded_ready_for_owner_review`.
- Next step: owner chooses either to keep GA-0 closed and schedule blocker specs, or to provide explicit scope/risk decisions that create new source-of-truth evidence. AI agents cannot create those owner decisions.

## Validation Commands

Focused validation for this PR:

```bash
node --test scripts/tests/m6-final-acceptance-rollup.test.mjs
```

Supporting spot-check commands:

```bash
node --test scripts/tests/m6-release-gate-console.test.mjs
node --test scripts/tests/m6-ai-safety-eval-gates.test.mjs
node --test scripts/tests/m6-bot-ga0-main-path-readiness.test.mjs
node --test scripts/tests/m6-core-ops-synthetic-e2e.test.mjs
node --test scripts/tests/m6-backup-restore-asset-safety.test.mjs
```
