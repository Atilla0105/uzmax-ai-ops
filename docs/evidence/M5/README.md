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

M5 current status: `m5_06_logs_analytics_recorded__not_accepted`. This means the M5 entrypoint docs remain open, M5-01 has added DB/schema/contracts/test evidence for the operations-loop vocabulary, M5-02 has added pure distill guardrail behavior contracts, M5-03 has added an in-memory confirmation queue API contract for human decisions without formal writes, M5-04 has added an admin shell/client contract slice, M5-05 has added a frontend/local-contract AI member console slice, and M5-06 has added a frontend/local-contract logs analytics slice. It does not approve M5 as a milestone, close production acceptance, or approve the items listed in the Boundary section.

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
| 7 | M5-07 template center | Knowledge, AI member, config and eval templates; copy creates tenant-owned version | Serial with schema/config/template shared paths. |
| 8 | M5-08 integration smoke + closeout | Integration smoke, evidence sync and owner closeout readiness request | Runs after M5-01..M5-07 are merged, or explicitly superseded/deferred by owner-approved evidence with affected items still `not_closed`. |

Future workers must use distinct physical worktree paths, distinct branches and non-overlapping machine-readable touch lists. `packages/db` schema and migrations, lockfile, shared config, CI/guard scripts, global generated artifacts and release/production gates are global serial. Root/main remains coordination/read-only only.

## Acceptance Mapping

| Item | M5 current status | Planned closure path |
|---|---|---|
| H-01 | queued_not_closed | M5 may contribute confirmation-backed updates through M5-03/M5-04 and template governance through M5-07. Full facts/journeys/stages/materials edit, import, publish and media-upload closure remains future-scoped unless a dedicated M5 implementation spec explicitly covers that full workflow. |
| H-02 | admin_ui_supported_not_closed | M5-01 adds confirmation candidate table/contracts, M5-02 emits candidate refs without a formal write path, M5-03 decision responses prove `formalWrite: false`, and M5-04 adds admin shell/client evidence. Formal write pipeline remains future. |
| H-03 | admin_ui_supported_not_closed | M5-01 adds conflict candidate kind and diff payload contract foundation; M5-03 requires diff payload before approve/edit; M5-04 adds admin side-by-side E2E. Formal storage integration remains future. |
| H-04 | queued_not_closed | M5-07 template copy must create tenant-independent versions. |
| H-05 | not_primary_m5_scope_not_closed | Future template/material refs must preserve storageRef as source and Telegram file_id as cache; runbook evidence remains later scope. |
| H-06 | queued_not_closed | M5-07 may cover quick-reply/template governance if scoped; public/private quick-reply workflow is not closed by M5-00. |
| H-07 | admin_ui_supported_not_closed | M5-01 adds distill run/health DB/contracts, M5-02 adds pure cap/pass-rate/downshift/recovery contracts, and M5-04 adds admin visibility. Scheduler, persisted alert/audit and full E2E remain future. |
| I-02 | supported_not_closed | M5-03 API can support mobile pass/discard fallback, M5-04 adds confirmation queue fallback UI/E2E, and M5-05 adds AI emergency stop/recovery mobile fallback as local drafts. Runtime mobile emergency path remains future. |
| I-06 | frontend_local_contract_supported_not_closed | M5-06 adds fixed board, dimension whitelist and local export draft governance. Runtime aggregation/export jobs remain future. |
| I-07 | frontend_local_contract_supported_not_closed | M5-01 adds AI member state/version/toggle refs, M5-05 adds local action/audit draft evidence, and M5-06 adds synthetic login/presence/operation readback. Persisted audit/log integration remains future. |
| J-05 | foundation_evidence_added_not_closed | M5-00, M5-01, M5-02 and M5-03 evidence exists so M5 evidence is not deferred to M6; no release signoff. |
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
