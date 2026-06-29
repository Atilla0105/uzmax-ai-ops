# M6-08 Backup Restore And Asset Safety Evidence

Spec: `docs/specs/M6-08-backup-restore-asset-safety.md`
Tracking issue: Linear LAY-13
Status: `m6_backup_restore_asset_safety_recorded_j03_external_blocker_h05_h06_partial_not_ga0`
Recorded: 2026-06-26
Current-state note: this is historical M6 no-go evidence. M6B-16 and M6B-17 later supersede the missing safe restore target external-input blocker with an isolated Supabase safe branch drill. That later proof does not approve PITR, production backup restore, production data restore, GA-0 or 1.0 release.

## Boundary

This evidence records the M6-08-time backup/restore and asset/material safety readiness from repo sources. It does not run a database restore or mutate Supabase. It does not approve production restore, GA-0, real customer/order data, customer LLM, real provider calls or 1.0 release.

No raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, database URLs, service role keys, LLM keys, Bot tokens or webhook secrets are stored here.

## Source Manifest

| Area | Source |
|---|---|
| Acceptance matrix | `UZMAX智能运营系统-1.0验收矩阵-v1.1.md` |
| Backup/restore runbook | `docs/runbooks/backup-restore.md` |
| Supabase environment | `docs/evidence/M0/infra/supabase-env-manifest.md` |
| Runtime baseline dependency | `docs/evidence/M6/M6-02-runtime-deploy-baseline.md` |
| Core operations dependency | `docs/evidence/M6/M6-07-core-ops-synthetic-e2e.md` |
| M3 media/material contracts | `docs/evidence/M3/M3-01-ai-capability-data-contracts-foundation.md`; `packages/db/src/m3-ai-contracts.ts` |
| KB/material candidate state | `docs/evidence/M3/M3-04-kb-journey-capability-foundation.md`; `docs/evidence/M3/M3-16-kb-material-candidates.md` |
| Screenshot/material storage refs | `docs/evidence/M3/M3-20-vision-screenshot-samples.md`; `packages/capabilities/vision/src/index.ts` |
| Telegram file id boundary | `packages/channels/src/index.ts` |
| Template/admin foundation | `docs/evidence/M5/M5-07-template-center.md` |
| Formal write safety | `docs/evidence/M5R/M5R-02-formal-write-pipeline.md` |
| Template copy safety | `docs/evidence/M5R/M5R-06-template-copy-runtime.md` |
| M5R closeout | `docs/evidence/M5R/M5R-08-true-integration-closeout.md` |

## Backup / Restore Status

J-03 M6-08 snapshot status: `external_blocker_safe_restore_target_missing`.

The repo has a dev Supabase project recorded as `uzmax-dev`, while staging and production are still `pending` in `docs/evidence/M0/infra/supabase-env-manifest.md`. No owner-approved safe restore target, backup snapshot ref, restore command output or post-restore validation output is recorded in repo evidence.

Therefore M6-08 did not close J-03 at the time. It records the concrete blocker and the required safe drill evidence. Current GA-0 activation tracking must use M6B-16/M6B-17 for the later safe branch target proof; future PITR/production backup-specific restore evidence remains separate.

| Required J-03 proof | M6-08 snapshot status | Required next evidence |
|---|---|---|
| Owner-approved safe restore target | `missing` | Target project/ref, environment class and owner approval that it is safe to overwrite. |
| Backup snapshot/source | `missing` | Backup snapshot/PITR marker, timestamp and source environment, with no secret values. |
| Restore command/run evidence | `not_run` | Command class and sanitized result, not raw credentials. |
| Post-restore DB/RLS validation | `not_run` | RLS/authz checks, audit/config version checks and synthetic residue result. |
| Storage/material reference validation | `not_run` | `storageRef` reachability/rebuild checks for synthetic assets only. |
| Owner release decision | `not_approved` | Owner GA-0/1.0 decision remains separate. |

## Asset / Material Safety Status

| Area | Current evidence | Release status |
|---|---|---|
| Durable media source | M3-01 defines `media_asset.storageRef`; vision input requires controlled `storage://`, `manifest://` and `redaction://` refs. M3-20 stores screenshot manifests as controlled refs only. | `storage_ref_contract_supported_not_real_rebuild_drilled` |
| Telegram file ids | `packages/channels/src/index.ts` extracts Bot photo/voice `file_id` values from inbound updates as provider metadata; no evidence treats those IDs as durable storage. | `file_id_cache_boundary_recorded` |
| KB/material candidates | M3-16 records owner-reviewed candidate materials as not published; source materials stay in owner-local controlled storage. | `candidate_not_published` |
| Formal write gate | M5R-02 writes only approved/edited confirmation decisions to the named `config_version` + `audit_log` path; pending/discarded/blocked decisions produce no formal write. | `confirmation_required_for_named_write` |
| Template copy safety | M5R-06 copies controlled template refs into tenant-owned DRAFT `template_copy` config versions, with `formalTenantWrite: false` and `templateAutoOverwrite: false`; group source changes do not auto-pollute copied tenant payloads. | `template_copy_draft_no_auto_overwrite_supported` |
| Quick reply scope | M5-07/M5R-06 prove quick-reply template kind/copy path; full public/private search, classification, import/export and permission behavior remains open. | `quick_reply_partial_not_full_h06_closed` |

No formal knowledge write occurs without the confirmation queue or a named approved proof path in the current repo evidence.

## Acceptance Matrix Mapping

| Item | Current M6-08 release status | Evidence |
|---|---|---|
| A-03 | `template_copy_independent_version_supported_not_final_rollup` | M5R-06 and M5R-08 support independent tenant template-copy versions; final owner rollup remains M6-09. |
| H-01 | `limited_material_candidate_and_config_write_supported_not_full_authoring_closed` | M3-16 candidate materials are owner-reviewed but not published; M5R-02 proves a named config formal-write path only. Full facts/journeys/stages/materials management remains open. |
| H-02 | `confirmation_required_for_named_write_supported` | M5R-02 approved/edited decisions can write only through the named formal path; pending/discarded/blocked cannot write. |
| H-03 | `diff_required_before_named_write_supported` | M5R-02 rechecks conflict diff before formal write. |
| H-04 | `template_copy_runtime_supported_not_final_rollup` | M5R-06 proves DRAFT tenant-owned template-copy versions and no auto-overwrite. |
| H-05 | `storage_ref_contract_supported_real_rebuild_drill_open` | M3/M6-08 runbook records `storageRef` as durable material body and Telegram `file_id` as cache/provider metadata; no real token-rotation/storage rebuild drill is recorded. |
| H-06 | `quick_reply_template_copy_supported_full_library_open` | Quick-reply template copy path exists; full public/private quick-reply search/classification/import/export/permission flow remains open. |
| J-03 | `historical_external_blocker_safe_restore_target_missing_superseded_by_m6b16_m6b17_for_safe_branch_target` | M6-08 did not record safe restore target, backup snapshot ref or restore command evidence. M6B-16/M6B-17 later close the safe branch target proof for GA-0 activation, not PITR or production restore. |
| J-04 | `backup_restore_runbook_updated_partial` | `docs/runbooks/backup-restore.md` now covers safe target, validation, asset/material safety and failure branches. |
| L-01 | `ga0_locked` | Backup/restore and asset-safety gaps keep GA-0 closed. |

## Remaining Gap Classification

| Class | Gap | Next owner |
|---|---|---|
| P0 before release | Historical M6-08 gap: J-03 could not close until owner provided or approved a safe restore target and backup snapshot/restore evidence. Current M6B-16/M6B-17 evidence closes the safe branch target branch only; PITR/production backup-specific restore evidence remains separate. | Project owner + future restore drill spec if production/PITR scope is opened |
| P0/P1 classification | H-01 full facts/journeys/stages/materials authoring remains outside the limited config/template proof path. | M6-09 owner scope decision or future implementation spec |
| P0/P1 classification | H-05 real storage rebuild/token-rotation drill is not recorded. | M6-09 owner scope decision or future asset recovery spec |
| P0/P1 classification | H-06 full quick-reply public/private library workflow remains open. | M6-09 owner scope decision or future quick-reply spec |
| Release decision | GA-0 and 1.0 remain closed. | Project owner |

## Validation Commands

Focused validation for this PR:

```bash
node --test scripts/tests/m6-backup-restore-asset-safety.test.mjs
```

Supporting evidence commands:

```bash
node --test scripts/tests/m5r-formal-write-pipeline.test.mjs
node --test scripts/tests/m5r-template-copy-runtime.test.mjs
node --test scripts/tests/m3-kb-journey-capability-foundation.test.mjs
node --test scripts/tests/m3-ai-capability-data-contracts-foundation.test.mjs
```
