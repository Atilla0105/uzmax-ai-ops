# M5 Evidence

M5 evidence tracks the operations loop milestone: distill health guardrails, confirmation queue, AI member console, analytics center, log center and template center.

M5 should let owner/operators process candidate changes quickly, see distill health/downshift alerts, control AI member state, and review logs/analytics/templates, without implying release approval.

Current readiness spec: `docs/specs/M5-00-operations-loop-readiness-pack.md`.
Current foundation evidence: `docs/evidence/M5/M5-01-db-contract-foundation.md`.
Current behavior-contract evidence: `docs/evidence/M5/M5-02-distill-guardrails.md`.
Current API-contract evidence: `docs/evidence/M5/M5-03-confirmation-queue-api.md`.
Current admin-shell evidence: `docs/evidence/M5/M5-04-confirmation-queue-admin.md`.
Current AI-member evidence: `docs/evidence/M5/M5-05-ai-member-console.md`.
Current logs-analytics evidence: `docs/evidence/M5/M5-06-logs-analytics.md`.
Current template-center evidence: `docs/evidence/M5/M5-07-template-center.md`.
Current closeout evidence: `docs/evidence/M5/M5-08-integration-smoke-closeout.md`.
Current runtime closeout evidence: `docs/evidence/M5R/M5R-08-true-integration-closeout.md`.

M5 current status: `m5_runtime_evidence_ready_for_owner_review__true_db_closeout_blocked_missing_env__not_owner_accepted`. This means M5-01 through M5-08 first established the operations-loop contracts and docs/test closeout, then M5R-01 through M5R-08 linked runtime persistence, formal write, distill health, AI emergency control, logs/analytics, template copy and admin API wiring evidence for project-owner review. The current worker environment lacks `UZMAX_RLS_DATABASE_URL`, so the final true DB closeout execution is explicitly `blocked_missing_env`; this does not record owner acceptance, approve production acceptance, or approve the items listed in the Boundary section.

M4 prior state: `owner_accepted_m4_milestone_evidence`. Project owner accepted M4 milestone evidence on 2026-06-24. M4 acceptance does not approve production, GA-0, real customer traffic, customer LLM, production Redis/worker deployment, formal alert routing, real customer/order data, production eval gate or 1.0 release.

## Start Audit

| Fact | Evidence |
|---|---|
| `pwd` | `/Users/atilla/Documents/uzmax-m5-00-operations-loop-readiness-pack` |
| `git status --short --branch` | `## codex/m5-00-operations-loop-readiness-pack` before edits |
| `git branch --show-current` | `codex/m5-00-operations-loop-readiness-pack` |
| worker `HEAD` | `a317b6ca5d45768176bf9a69555ab9764bf3605f` |
| worker `origin/main` | `a317b6ca5d45768176bf9a69555ab9764bf3605f` |
| root/main status | `/Users/atilla/Documents/UZMAX智能运营` -> `## main...origin/main` before edits |
| open PR audit | `gh pr list --state open --limit 50 --json number,title,headRefName,url,isDraft` returned `[]` before edits |
| no-merged branch audit | root `git branch --no-merged main` returned no branch output before edits |

## Planned Slices

| Order | Planned slice | Scope | Parallelism rule |
|---:|---|---|---|
| 1 | M5-01 DB/contract foundation | Foundation evidence recorded for distill health, confirmation queue and AI member DB/contracts. Analytics/log/template runtime remains future. | Global serial for schema/migrations/generated contracts. |
| 2 | M5-02 distill guardrails | Behavior-contract evidence recorded for candidate cap, 7-day pass rate, downshift recommendation, owner alert draft and manual recovery audit requirement. Runtime scheduler/UI/audit persistence remains future. | Depends on M5-01; serial with worker/cron shared paths. |
| 3 | M5-03 confirmation queue API | API-contract evidence recorded for approve/edit/discard/block, conflict diff enforcement, tenant scoping and no formal write before confirmation. Runtime persistence/formal write pipeline remains future. | Depends on M5-01/M5-02; serial with shared API/authz routes. |
| 4 | M5-04 confirmation queue admin | Admin shell evidence recorded for keyboard-first queue, amber health banner, conflict diff and mobile pass/discard fallback | Depends on M5-03; frontend-only parallelism only with disjoint admin paths. |
| 5 | M5-05 AI member console | Frontend/local-contract evidence recorded for AI member status, toggles, offline/breaker state, emergency stop/recovery local drafts and mobile fallback. Runtime/persisted audit remains future. | Serial with shared audit/log/API paths. |
| 6 | M5-06 logs + analytics | Frontend/local-contract fixed analytics board, dimensions, export draft governance and login/presence/operation log readback recorded. Runtime aggregation/export/log persistence remains future. | Serial with shared metric/log/audit paths. |
| 7 | M5-07 template center | Frontend/local-contract evidence recorded for knowledge, AI member, config, eval and quick-reply templates; copy draft creates tenant-owned version refs without auto-overwrite | Serial with schema/config/template shared paths. |
| 8 | M5-08 integration smoke + closeout | Integration smoke, evidence sync and owner closeout readiness request recorded | Completed after M5-01..M5-07 were merged; marks closeout ready for owner review, not owner accepted. |
| M5R | M5 runtime integration bridge | Runtime persistence/formal write/distill health/AI control/logs/template copy/admin API wiring plus final closeout chain recorded | Runtime-evidence-ready for owner review through M5R-08; true DB closeout execution is `blocked_missing_env`; not owner accepted. |

Future workers must use distinct physical worktree paths, distinct branches and non-overlapping machine-readable touch lists. `packages/db` schema and migrations, lockfile, shared config, CI/guard scripts, global generated artifacts and release/production gates are global serial. Root/main remains coordination/read-only only.

## Acceptance Mapping

| Item | M5 current status | Planned closure path |
|---|---|---|
| A-03 | runtime_evidence_ready_true_db_blocked_missing_env_not_owner_accepted | M5R-06 proves tenant-owned template copy versions and no auto-overwrite; M5R-08 links the true DB wrapper. |
| H-01 | limited_formal_write_runtime_evidence_ready_not_full_h01_closed | M5R-02 proves a named `config_version` formal write path after confirmation; full facts/journeys/stages/materials edit, import, publish and media-upload closure remains future-scoped unless a dedicated implementation spec covers that workflow. |
| H-02 | confirmation_to_formal_write_runtime_evidence_ready | M5R-01 persists confirmation queue decisions and M5R-02 proves approved/edited decisions write only after confirmation; pending/discarded/blocked do not write. |
| H-03 | conflict_diff_to_formal_write_runtime_evidence_ready | M5R-01/M5R-02 preserve conflict diff enforcement before formal write. |
| H-04 | template_copy_runtime_evidence_ready | M5R-06 records runtime template copy drafts as independent tenant-owned `config_version` rows; M5R-08 links the wrapper. |
| H-05 | not_primary_m5_scope_not_closed | Future template/material refs must preserve storageRef as source and Telegram file_id as cache; runbook evidence remains later scope. |
| H-06 | template_kind_runtime_evidence_ready_not_full_quick_reply_closed | M5R-06 includes quick reply/config-style template copy proof; public/private quick-reply search/classification/import/export and permission tests remain future. |
| H-07 | distill_health_runtime_evidence_ready | M5R-03 links distill candidate cap, persisted health, downshift, owner alert/audit draft and manual recovery wrapper. |
| I-02 | mobile_runtime_wiring_evidence_ready | M5R-04 proves AI emergency/recovery runtime path and M5R-07 proves 320px admin API wiring for confirmation and emergency actions. |
| I-06 | logs_analytics_runtime_evidence_ready | M5R-05 proves fixed board/log/export draft runtime path and M5R-07 wires admin API mode. |
| I-07 | ai_audit_logs_runtime_evidence_ready | M5R-04/M5R-05 prove AI state/audit plus login/presence/operation log readback paths. |
| J-05 | m5_runtime_evidence_ready_for_owner_review_not_owner_accepted | M5/M5R evidence now includes runtime closeout evidence; no owner acceptance or release signoff. |
| K-03 | active | One spec / one PR; current branch implements only the active M5 slice. |
| K-04 | active | Planned queue and serial/parallel rules recorded. |

## Boundary

This M5 entrypoint does not approve:

- M5 accepted status;
- M6 release hardening;
- GA-0 opening;
- production readiness;
- real customer traffic/data;
- customer LLM;
- production Redis/worker deployment;
- external SaaS onboarding;
- automatic knowledge write without confirmation;
- 1.0 release.

M5 evidence must not include raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets. Future sensitive source material must stay in controlled storage; repo evidence may only record manifests, redaction method, storage refs, access scope, retention period and project owner confirmation status.

## M5-00 Validation

| Command | Result | Notes |
|---|---|---|
| `npm ci` | pass | Required because `node_modules` was missing at start; installed 360 packages and found 0 vulnerabilities. |
| `npm run format:check` | pass | Prettier reported all matched files use Prettier code style. |
| `npm run guard:doc-triggers` | pass | `doc-trigger-paths: ok`. |
| `npm run guard:workspace` | pass | `workspace-isolation: ok` in linked M5-00 worktree. |
| `npm run guard:worker-boundary -- --assigned /Users/atilla/Documents/uzmax-m5-00-operations-loop-readiness-pack --root /Users/atilla/Documents/UZMAX智能运营` | pass | Explicit assigned/root boundary check passed. |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M5-00-operations-loop-readiness-pack.md --include-worktree` | pass | Reported 2 docs files, source changed files 0, net source LOC 0 and new source files 0. No PR existed yet for this branch. |
| `git diff --check origin/main...HEAD` | pass | No whitespace errors. |

## M5-01 Validation

M5-01 validation is tracked in `docs/evidence/M5/M5-01-db-contract-foundation.md`. Current M5-01 status remains `foundation_supported_not_closed`; M5 is not accepted.

## M5-02 Validation

M5-02 validation is tracked in `docs/evidence/M5/M5-02-distill-guardrails.md`. Current M5-02 status remains `behavior_contract_supported_not_closed`; M5 is not accepted.

## M5-03 Validation

M5-03 validation is tracked in `docs/evidence/M5/M5-03-confirmation-queue-api.md`. Current M5-03 status remains `api_contract_supported_not_closed`; marker `m5_03_confirmation_queue_api_recorded__not_accepted`; M5 is not accepted.

## M5-04 Validation

M5-04 validation is tracked in `docs/evidence/M5/M5-04-confirmation-queue-admin.md`. Current M5-04 status is `admin_ui_supported_not_closed`; marker `m5_04_confirmation_queue_admin_recorded__not_accepted`; M5 is not accepted.

## M5-05 Validation

M5-05 validation is tracked in `docs/evidence/M5/M5-05-ai-member-console.md`. Current M5-05 status is `frontend_local_contract_supported_not_closed`; marker `m5_05_ai_member_console_recorded__not_accepted`; M5 is not accepted.

## M5-06 Validation

M5-06 validation is tracked in `docs/evidence/M5/M5-06-logs-analytics.md`. Current M5-06 status is `frontend_local_contract_supported_not_closed`; marker `m5_06_logs_analytics_recorded__not_accepted`; M5 is not accepted.

## M5-07 Validation

M5-07 validation is tracked in `docs/evidence/M5/M5-07-template-center.md`. Current M5-07 status is `frontend_local_contract_supported_not_closed`; marker `m5_07_template_center_recorded__not_accepted`; M5 is not accepted.

## M5-08 Validation

M5-08 validation is tracked in `docs/evidence/M5/M5-08-integration-smoke-closeout.md`. Current M5-08 status is `m5_closeout_ready_not_owner_accepted`; marker `m5_08_integration_closeout_ready__not_owner_accepted`; M5 awaits project-owner closeout review and is not production/release accepted.
