# Release Gate Boundary

This document records the current repo release-gate contract. It is not a production launch runbook and does not approve GA-0, production traffic, real customer/order data, customer LLM, external SaaS onboarding or 1.0 release.

## Source Of Truth

| Scope | Source |
|---|---|
| Release blockers | `UZMAX智能运营系统-1.0验收矩阵-v1.1.md` |
| GA-0 rules | `UZMAX智能运营系统-技术架构-v1.1.md` §11.1 |
| Admin release console | `UZMAX智能运营系统-后台设计与前端架构-v1.1.md` |
| Current M6 entry | `docs/evidence/M6/README.md` |
| Current M6B runtime rollup | `docs/evidence/M6B/M6B-09-ga0-runtime-evidence-rollup.md` |
| Current M6 no-go closeout | `docs/evidence/M6B/M6B-11-m6-no-go-closeout.md` |
| Current external-input closure | `docs/evidence/M6B/M6B-17-ga0-external-blocker-rollup.md` |
| Minimal GA-0 boundary | `docs/evidence/GA-0/GA0-00-minimal-boundary.md` |
| M9-04 employee admin read evidence | `docs/evidence/M9/M9-04-admin-employee-read-evidence.md` |
| Admin gate contract | `apps/admin/src/releaseGateContracts.ts` |

## Current Boundary

GA-0 remains locked. The admin console may show current gate state and evidence links, but it must not expose an enabled open action until:

- GA-0 checklist is green;
- required release-hardening drills are closed or explicitly no-go;
- audit write path is implemented and verified;
- project owner explicitly opens GA-0.

1.0 remains blocked until all P0 acceptance items pass and P1/P2 handling matches the acceptance matrix.

M6 is closed as an evidence/runtime-hardening package. This closeout is not a GA-0 open decision and not a 1.0 readiness decision. LAY-19, LAY-23, LAY-24 and LAY-30 are now Done from staging/test-only evidence; this clears the external-input blocker class, but it does not by itself open GA-0.

## M9-03 Minimal GA-0 Boundary

Current status token: `ga0_minimal_bot_only_boundary_recorded_ai_quality_deferred_not_open`.

GA-0 remains locked. The minimal Bot-only GA-0 signoff path is now selected for controlled internal/staging use, but this is only a boundary record and not the final GA-0 open action.

The project owner approved deferring G-04/G-06 for this minimal Bot-only GA-0 path only. G-04/G-06 are deferred not passed, and the deferral does not count as 1.0 acceptance or full release approval.

Before GA-0 can be marked opened, all three follow-up records are required: M9-04 employee admin read evidence, M9-05 Bot redline/fuse leave-ticket drill and M9-06 owner signoff/open record.

M9-04 is not closable from local environment alone; it requires real employee session evidence through Vercel admin/Supabase, or an explicit owner-input blocker if employee credentials/session evidence is not provided. M9-05 cannot be honestly closed with the current M8 supervisor alone because that path does not prove redline/fuse suppression, zero outbound for a canary or a reason code; a tiny M9-05 follow-up drill script/test is required unless an existing runtime-evidence path can prove those exact facts.

This boundary does not approve production, customer data expansion, customer LLM, Telegram Business automatic reply, formal knowledge write, broad real customer traffic or 1.0 release. 1.0 remains blocked.

## M9-04 Employee Admin Read Evidence

Current status token: `m9_04_owner_input_employee_session_required_not_ga0`.

M9-04 employee admin read evidence is recorded at `docs/evidence/M9/M9-04-admin-employee-read-evidence.md`. The current worker environment has no trusted real employee Supabase access token, email/password pair or session proof, so M9-04 is owner-input blocked and cannot be treated as passed.

The only M9-04 live pass condition is HTTP 200 from the Vercel admin / Render API conversation read path using a real employee session: Vercel admin HTML 2xx, employee Supabase session token, then `GET /conversation-ticket/conversations` with `authorization`, `x-org-id` and `x-tenant-id`. Supabase SQL/admin direct database reads do not count for M9-04.

GA-0 remains locked. M9-05 Bot redline/fuse leave-ticket drill and M9-06 owner signoff/open record are still required. This evidence does not approve production, broad real customer traffic, customer LLM, Telegram Business automatic reply, formal knowledge write or 1.0 release. 1.0 remains blocked.

## M6-01 Console Contract

The M6-01 admin contract renders M0-M6, GA-0 and 1.0 status from one maintained source:

- M0-M4: accepted milestone evidence.
- M5: owner accepted for milestone/runtime evidence only.
- M6: evidence/runtime-hardening package closed as no-go.
- GA-0: locked by L-01 checklist and owner decision.
- 1.0: blocked by final P0/P1/P2 rollup.

Evidence links in the admin shell are repo paths only. They are not sensitive artifacts and must not include raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets.

## M6-02 Runtime Baseline

The M6-02 runtime baseline records deploy/rollback readiness from repo manifests and app package commands. M6B later replaced the API/worker/cron placeholder starts with emitted-artifact starts, and M6B-17 records the live staging deploy/rollback closure:

- api: Render `uzmax-api-staging` ends on `main` / `4de3f9a`; `/healthz` 200, `/readyz` 200 and missing-secret webhook 401 passed after A rollback.
- worker: Render `uzmax-worker-staging` ends on `main` / `4de3f9a`; `worker.ready` and controlled webhook completion passed after A rollback.
- cron: Render `uzmax-cron-staging` ends on `main` / `4de3f9a`; final A run preserved idempotency with `daily_unit_already_completed`.
- admin: Vercel `uzmax-admin` preview rollback ended on deployment `dpl_FF8arhXgtBXmcr9p7T2LfQfSsQ4t`, `target=null`; no production promotion occurred.

`docs/runbooks/deploy-rollback.md` covers api, worker, cron and admin rollback paths. M6B-17 closes the staging/test rollback drill evidence; production release remains unapproved.

## M6B Runtime Rollup

Current status token: `m6_closed_as_evidence_runtime_hardening_package_ga0_no_go`.

The M6B runtime rollup records the current post-M6 bring-up state:

- M6B-01, M6B-02 and M6B-03 have local emitted-artifact evidence for API, worker and cron.
- M6B-05a has CI true DB/RLS Bot conversation runtime evidence.
- M6B-05b has local webhook-equivalent contract evidence without claiming webhook-driven true DB closure.
- M6B-17 later clears the external-input blocker class: LAY-19, LAY-23, LAY-24 and LAY-30 are Done from staging/test-only evidence.

This rollup does not approve GA-0, production deployment, real Telegram traffic, outbound Bot sending, backup/restore execution, real customer/order data, customer LLM/provider use, P1/P2 risk classification or 1.0 release.

M6B-11 records the historical closeout boundary. M6B-17 updates the current truth: LAY-19, LAY-23, LAY-24 and LAY-30 are Done from live staging/test evidence, so the external-input blocker class is cleared. GA-0 remains locked until the project owner explicitly opens it and any remaining non-external release conditions are closed.

M6B-12a and M6B-12b are follow-up unblocking slices for LAY-30: M6B-12a wires the RLS-backed access-context provider, and M6B-12b adds Prisma generation to Render Node service build commands after staging deploy `dep-d8voptlaeets73daij5g` failed on ungenerated `@prisma/client`. LAY-30 is now Done with live `/readyz` 200 plus synthetic authz proof recorded outside git; these slices still do not open GA-0.

M6B-14 added the minimal Vercel project configuration needed for the admin deploy target. Vercel deployment `dpl_FUymF9iFuZ8WMRe17UTDHLbp7Prg` reached READY for `uzmax-admin`, the admin HTML loaded from the preview URL, and the protected bundle still contained the locked/disabled GA-0 action state. This was prerequisite evidence for LAY-23; M6B-17 later records the full API/worker/cron/admin rollback drill closure. Neither slice opens GA-0.

M6B-16 records a safe restore target drill for LAY-24 using a Supabase branch restore target with `with_data=false`. The branch schema/RLS smoke passed with synthetic rows and wrong-tenant isolation, then the temporary branch was deleted to stop ongoing cost and avoid any runtime attachment. This closes the safe branch target proof but does not claim PITR, production backup restore, production data restore, GA-0 or 1.0 approval.

## M6-03 Queue Failure Injection

The M6-03 queue drill records J-02 support from the existing M4-45 BullMQ/Redis order-import smoke:

- duplicate deterministic `jobId` enqueue does not create duplicate successful dispatch effects;
- first-attempt handler failure reaches a completed job through retry;
- permanent failed job and backlog counts produce `order_import_queue_failed_high` and `order_import_queue_backlog_high`;
- Storage source lock duplicate/release behavior is token-checked;
- disposable Redis queue and run-scoped lock keys are cleaned with `run residue 0`.

`docs/runbooks/queue-failure-injection.md` now covers the safe synthetic drill path and failure branches. This does not approve production Redis/worker deployment, production alert-channel routing, real customer/order data or GA-0.

## M6-04 RLS Authz Matrix

The M6-04 RLS/authz matrix records B-01 through B-05 support from current repo evidence:

- ADR-001, SPK-03, M1 platform tests, M4 order-import RLS tests and M5R true-DB closeout support the dev/staging RLS boundary without approving production DB/RLS use.
- ADR-002, `packages/authz/src/index.ts`, `apps/api/src/access-context.ts` and M1 access-context tests support server-side tenant selection, forged-context rejection and backend permission enforcement.
- Group aggregate-only behavior is recorded as contract-level support; production customer-plaintext surface review remains a final-release concern.
- Permission/config audit contracts and selected true-DB writes support B-05 for known paths; full high-risk action coverage remains in final rollup.
- `docs/runbooks/rls-misconfig.md` now contains the M6-04 release drill and failure branches.

This matrix does not approve production DB/RLS, GA-0, real customer/order data, customer LLM, external SaaS onboarding or 1.0 release.

## M6-05 AI Safety Eval Gates

The M6-05 AI safety/eval-gate record maps F-01 through F-06, G-01 through G-06, J-04 and L-02 to current repo evidence:

- ADR-003 keeps customer LLM blocked for real customer messages, screenshots, voice transcripts and customer profiles.
- M3-02 LLM gateway evidence supports mock model-all-down routing and accounting without raw prompt/completion exposure or real provider calls.
- M3-03 eval-gate evidence refuses prompt, knowledge, model route and persona publish decisions when gates are failed, blocked, pending, stale, mismatched or incomplete.
- M3-08 engine evidence suppresses unsafe redline output and records fuse radius behavior without echoing unsafe content.
- M4 order-read no-fabrication evidence requires handoff when order data is missing, stale or degraded.
- M5R-04 AI member runtime evidence supports emergency stop, recovery and capability enable checks with controlled evidence refs.
- `docs/runbooks/ai-safety-fuse.md` covers model-all-down, redline bad send and AI fuse/recovery release drills.

This record does not approve GA-0, production prompt/knowledge/model/persona publishing, customer LLM, real provider calls, real customer/order data, external SaaS onboarding or 1.0 release. G-04 owner language blind review, G-06 full >=200 eval set, L-02 real Bot leave-ticket drill and production `llm_call_log` rollup remain open release gaps.

## M6-06 Telegram Bot GA-0 Main Path

The M6-06 Bot-only readiness record maps C-01, C-02, C-03b, C-06, J-04, L-01 and L-02 to current repo evidence:

- M2-02 Telegram Bot ingress covers bounded text, image, voice and callback normalization, secret fail-closed behavior, duplicate `update_id` dedupe and unsupported/Business-deferred classification.
- M2-03/M2-07 conversation handoff/ticket contracts cover manual escalation, ticket draft metadata, AI suspended state, in-flight message cancel semantics and HTTP error hardening.
- ADR-B01/SPK-01 keeps Telegram Business in the `no_go_owner_inputs_missing` branch; Business auto-reply, Business draft-send and Business feasibility are not opened.
- M6-03 queue evidence and M6-05 AI safety evidence remain dependencies for any later GA-0 checklist.
- `docs/runbooks/telegram-bot-main-path.md` covers bot no response, duplicate/out-of-order ingress, Business-disabled handling and manual escalation failure branches.

This record does not approve GA-0, production Bot traffic, real customer data, production Bot tokens, production webhook secrets, Telegram Business automatic reply, outbound Bot sending, production worker/queue deployment or 1.0 release. Real staging Bot evidence, DB-backed dedupe/order restore, worker/engine consumer processing, outbound leave-ticket behavior and final owner GA-0 open decision remain open release gaps.

## M6-07 Core Operations Synthetic E2E

Current status token: `m6_core_ops_synthetic_e2e_recorded_a_d_e_h_i_supported_not_ga0`.

The M6-07 core operations record maps A/D/E/H/I release-readiness status to one repo-level synthetic golden path:

- Conversation and ticket readiness is linked from M2 conversation/ticket API, admin shell and HTTP hardening evidence, plus the M6-06 Bot handoff dependency.
- Customer asset readiness is linked from M4-43 customer asset API/admin/browser/DB/RLS runtime workflow evidence.
- Order snapshot readiness is linked from M4-37 Admin client -> Nest HTTP -> API -> DB/RLS evidence, M4-42 operator-visible Storage metadata/import readback evidence and M4-44 order no-fabrication eval evidence.
- Confirmation, formal write, logs and admin runtime visibility are linked from M5/M5R confirmation queue, formal-write, logs/analytics, admin runtime wiring and true integration closeout evidence.
- `docs/runbooks/core-ops-synthetic-e2e.md` covers the safe operator replay path using controlled refs only.

This record does not approve a new live production E2E, GA-0, real customer/order data, production worker/queue deployment, customer LLM, external SaaS onboarding or 1.0 release. D-06 anonymization, H-01 broad authoring, H-05 asset recovery, H-06 full quick-reply flow, I-03 performance, I-04 realtime, I-05 visual/token release evidence, backup/restore and final P0/P1/P2 owner rollup remain open release gaps.

## M6-08 Backup Restore And Asset Safety (Historical M6 Snapshot)

Historical M6 status token: `m6_backup_restore_asset_safety_recorded_j03_external_blocker_h05_h06_partial_not_ga0`.

The M6-08 record preserves the M6-time backup/restore and asset/material safety snapshot. Its J-03 external-input blocker conclusion is superseded for current GA-0 activation tracking by M6B-16 and M6B-17, which record a staging/test-only safe restore target proof. M6-08 still remains valid historical no-go evidence and does not claim PITR, production backup restore, production data restore, GA-0 or 1.0 approval.

- At M6-08 recording time, J-03 was blocked because no owner-approved safe restore target, backup snapshot ref or restore command output was recorded in repo evidence.
- M6B-16/M6B-17 later clear the missing safe restore target external-input blocker for GA-0 activation evidence with an isolated Supabase safe branch drill.
- `docs/runbooks/backup-restore.md` now records safe target requirements, forbidden production overwrite, post-restore RLS/audit/config/storage checks and failure branches.
- M3 media/vision contracts keep `storageRef` as the durable material body pointer; Telegram `file_id` remains cache/provider metadata.
- M5R-02 and M5R-06 record confirmation/formal-write and template-copy DRAFT safety: no broad formal knowledge/config/template write is approved without confirmation or a named proof path.
- H-01/H-05/H-06 remain partial/open where the repo lacks full authoring, real storage rebuild/token-rotation drill and full quick-reply public/private library workflow.

This record does not approve a database restore, production mutation, GA-0, real customer/order data, customer LLM, external SaaS onboarding or 1.0 release. Future PITR/production backup-specific restore evidence remains separate from the M6B-16/M6B-17 safe branch proof.

## M6-09 Final Acceptance Rollup

Current status token: `m6_final_acceptance_rollup_recorded_no_go_recommended_owner_decision_pending_not_ga0`.

The M6-09 final acceptance package is the historical M6 owner-review no-go snapshot. M6B-17 later amends the current external-input truth for J-01/J-03: those items are no longer blocked on missing owner/platform input, while GA-0 and 1.0 remain locked by owner decision and remaining non-external release conditions.

- GA-0 status is `no_go_recommended_owner_decision_pending`; GA-0 remains closed.
- 1.0 status is `blocked_p0_gaps_open`.
- M6-00 through M6-08 evidence is linked from `docs/evidence/M6/M6-09-final-acceptance-rollup.md`.
- L-02 real Bot leave-ticket/outbound behavior, G-04 blind review, G-06 full >=200 eval set, H-01/H-05/H-06 knowledge/asset gaps and D-06/I-03/I-04/I-05 final quality gates remain open or owner-decision-required. J-01 deploy/rollback and J-03 safe restore are no longer blocked on missing external input after M6B-17.
- No P1 risk signoff, fix date, impact note or P2 backlog classification is recorded in repo evidence.
- M6-09 validation is tracked in `docs/evidence/M6/M6-09-final-acceptance-rollup.md`.

This record does not approve GA-0, production deployment, real customer/order data, customer LLM, real provider calls, P1 risk acceptance, external SaaS onboarding or 1.0 release. The project owner must make any future go/no-go, risk or backlog decision explicitly.

## Not Approved

- GA-0 is not open.
- Production readiness is not approved.
- Real customer traffic or order data.
- Customer LLM or real provider calls.
- Production Redis/worker deployment.
- External SaaS onboarding.
- Telegram Business automatic reply expansion.
- 1.0 approval is not granted.
