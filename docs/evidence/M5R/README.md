# M5R Evidence

M5R evidence tracks the runtime-readiness follow-up queue after M5 integration smoke closeout. M5 moved from docs/test-only closeout-ready evidence to a secret-backed CI true DB/RLS closeout through M5R-08. M5/M5R are now runtime-evidence-ready for owner review, are not owner accepted, and are not production/GA/release approved.

Current M5R plan spec: `docs/specs/M5R-00-runtime-integration-plan.md`.
Current M5R implementation spec: `docs/specs/M5R-08-true-db-ci-closeout.md`.
Current active M5R implementation spec: none; final closeout status is `m5r_08_true_integration_closeout_passed_true_db_not_owner_accepted`.
Current M5R incident records: `docs/incidents/INC-2026-06-24-m5r-00-root-main-worktree-pollution.md`; `docs/incidents/INC-2026-06-25-m5r-04-root-readme-pollution.md`; `docs/incidents/INC-2026-06-25-m5r-06-root-patch-target.md`.

## Runtime Slice Status

| Slice | Status | Evidence |
|---|---|---|
| M5R-00 Runtime Integration Plan | `m5r_plan_recorded_not_owner_accepted` | `docs/specs/M5R-00-runtime-integration-plan.md`; this README; `docs/incidents/INC-2026-06-24-m5r-00-root-main-worktree-pollution.md` |
| M5R-01 Confirmation Queue Persistence | `runtime_contract_passed_true_db_blocked_missing_env_not_owner_accepted` | `docs/specs/M5R-01-confirmation-queue-persistence.md`; `docs/evidence/M5R/M5R-01-confirmation-queue-persistence.md` |
| M5R-02 Formal Write Pipeline | `formal_write_contract_passed_true_db_blocked_missing_env_not_owner_accepted` | `docs/specs/M5R-02-formal-write-pipeline.md`; `docs/evidence/M5R/M5R-02-formal-write-pipeline.md` |
| M5R-03 Distill Scheduler + Health Runtime | `distill_runtime_contract_passed_true_db_blocked_missing_env_not_owner_accepted` | `docs/specs/M5R-03-distill-scheduler-health-runtime.md`; `docs/evidence/M5R/M5R-03-distill-scheduler-health-runtime.md` |
| M5R-04 AI Member Runtime Control | `runtime_contract_passed_true_db_blocked_missing_env_not_owner_accepted` | `docs/specs/M5R-04-ai-member-runtime-control.md`; `docs/evidence/M5R/M5R-04-ai-member-runtime-control.md`; `docs/incidents/INC-2026-06-25-m5r-04-root-readme-pollution.md` |
| M5R-05 Logs + Analytics Runtime | `runtime_contract_passed_true_db_blocked_missing_env_not_owner_accepted` | `docs/specs/M5R-05-logs-analytics-runtime.md`; `docs/evidence/M5R/M5R-05-logs-analytics-runtime.md` |
| M5R-06 Template Copy Runtime | `runtime_contract_passed_true_db_blocked_missing_env_not_owner_accepted` | `docs/specs/M5R-06-template-copy-runtime.md`; `docs/evidence/M5R/M5R-06-template-copy-runtime.md` |
| M5R-07 Admin Runtime Wiring | `admin_runtime_wiring_supported_not_true_closeout_not_owner_accepted` | `docs/specs/M5R-07-admin-runtime-wiring.md`; `docs/evidence/M5R/M5R-07-admin-runtime-wiring.md` |
| M5R-08 True Integration Closeout | `m5r_08_true_integration_closeout_passed_true_db_not_owner_accepted` | `docs/specs/M5R-08-true-integration-closeout.md`; `docs/specs/M5R-08-true-db-ci-closeout.md`; `docs/evidence/M5R/M5R-08-true-integration-closeout.md`; `scripts/tests/m5r-true-integration-closeout.test.mjs`; CI run `28183737387`, job `83479977791` |

M5R-01 through M5R-06 rows preserve their original slice-local missing-env evidence status. M5R-08 records the final secret-backed CI wrapper-chain path that executed those true DB wrappers together before the evidence was marked passed.

## Start Audit

Recorded before docs edits on 2026-06-24 from the assigned M5R-00 worktree.

| Fact | Evidence |
|---|---|
| assigned worktree `pwd` | `/Users/atilla/Documents/uzmax-m5r-00-runtime-integration-plan` |
| assigned `git status --short --branch` | `## codex/m5r-00-runtime-integration-plan...origin/main` |
| assigned `git branch --show-current` | `codex/m5r-00-runtime-integration-plan` |
| worker `HEAD` | `1c3c382192ef8d223822978b5606842a05c1b6af` |
| worker `origin/main` | `1c3c382192ef8d223822978b5606842a05c1b6af` |
| root/main status before incident cleanup | `/Users/atilla/Documents/UZMAX智能运营` -> `## main...origin/main` with exactly two untracked files after the patch-target incident |
| root dirty expansion before cleanup | `?? docs/evidence/M5R/README.md`, `?? docs/specs/M5R-00-runtime-integration-plan.md` |
| root cleanup command scope | Deleted only `docs/specs/M5R-00-runtime-integration-plan.md`, `docs/evidence/M5R/README.md` and then removed the empty `docs/evidence/M5R` directory. |
| root/main status after cleanup | `/Users/atilla/Documents/UZMAX智能运营` -> `## main...origin/main`; `git status --short --untracked-files=all` returned no output |
| root/main branch | `main` |
| root/main `HEAD` | `1c3c382192ef8d223822978b5606842a05c1b6af` |
| root/main `origin/main` | `1c3c382192ef8d223822978b5606842a05c1b6af` |
| open PR audit | `gh pr list --state open --json number,headRefName,title,url` returned `[]` |
| root no-merged branch audit | `git branch --no-merged main` returned no branch output |

## Current M5 Runtime State

M5 evidence now says `m5_runtime_evidence_ready_not_owner_accepted`. M5-08 explicitly remained docs/test-only; M5R-01 through M5R-07 added runtime contracts, API/admin wiring and true DB wrappers; M5R-08 linked those wrappers into a final CI closeout chain through the masked GitHub Actions `UZMAX_RLS_DATABASE_URL` secret.

M5R therefore does not reopen M5 scope or claim owner acceptance. It records the passed CI closeout path while keeping production, GA/release, real customer/order data, real LLM/provider calls and external SaaS onboarding out of scope.

## Incident Record

M5R-00 includes `docs/incidents/INC-2026-06-24-m5r-00-root-main-worktree-pollution.md`.

M5R-04 includes `docs/incidents/INC-2026-06-25-m5r-04-root-readme-pollution.md`.

M5R-06 includes `docs/incidents/INC-2026-06-25-m5r-06-root-patch-target.md`.

M5R-00 impact was limited to two untracked root docs created by the initial patch-target mistake. Cleanup removed those two files and the empty directory from root/main; root/main returned clean. No runtime/source files, tracked root files, customer/order data, secrets, LLM calls, validation, commit, push or PR were affected by M5R-00.

M5R-04 impact was limited to root/main documentation pollution in `docs/evidence/M5R/README.md`. The coordinator restored root/main and moved the same linked worktree to `/private/tmp/uzmax-m5r-04-ai-member-runtime-control`; M5R-04 records this as process evidence only, not product scope.

M5R-06 impact included temporary tracked root/main edits to `apps/api/scripts/runtime-compiler.mjs`, `apps/api/src/app.module.ts` and `docs/evidence/M5R/README.md`, plus untracked M5R-06 files in root/main. The M5R-06 diff and untracked files were moved to the assigned worktree, root/main tracked files were restored, and no commit, push, PR, merge, production deploy, real customer/order data, real LLM call, secret, external SaaS action, generated artifact or unrelated user change was created from root/main.

Containment and cleanup are recorded in the linked incident records. The existing worker-boundary guard is detective evidence, not a new preventive control. No guard/script preventive control lands in these incident records; repeated patch-target failures remain a known orchestration risk to monitor and handle in later guard or tooling work if needed.

## True DB/RLS Smoke Baseline

Future M5R runtime slices may call a check `true DB/RLS smoke` only when it meets this baseline:

- It uses the real configured smoke database through `UZMAX_RLS_DATABASE_URL` or the repo-approved true DB smoke environment.
- It runs through the restricted app runtime role and RLS transaction context, not a service-role or privileged Prisma bypass.
- It sets transaction-scoped `app.org_id` and `app.tenant_id`, or uses the existing helper that sets those values.
- Where the slice owns data writes, it includes positive same-tenant read/write evidence and negative missing-context or wrong-tenant-context evidence.
- Repository-only filters, mocks, local arrays and privileged clients do not count as true DB/RLS smoke.
- If M5R-07 consumes prior API-backed DB/RLS evidence instead of direct DB assertions, it must link the prior runtime evidence and explain why those checks cover the admin runtime path.

## Planned Queue

| Order | Slice | Required runtime proof | Acceptance boundary |
|---:|---|---|---|
| 1 | M5R-01 Confirmation Queue Persistence | Prisma/RLS repository behind M5-03 `InMemoryConfirmationQueueRepository`; true DB create/list/detail/approve/edit/discard/block; tenant isolation; conflict diff; no unconfirmed formal write. | Persists confirmation decisions only; no formal write pipeline yet. |
| 2 | M5R-02 Formal Write Pipeline | Minimal proof path for one or more explicitly named target paths from knowledge/config/eval/template. The M5R-02 spec must name each target table/version record and list non-closures before implementation. Current read-only inventory suggests `config_version` + `audit_log` + `confirmation_item.auditLogId/status` as the preferred smallest candidate, but M5R-02 must make the final scoped choice. Pending/discarded/blocked cannot write; approved/edited write only to named target table/version records with `audit_log` confirmer/diff/target ref. | Minimal named proof path only, not full H-01 knowledge/resource authoring and not all knowledge/config/eval/template domains in one PR unless explicitly scoped. |
| 3 | M5R-03 Distill Scheduler + Health Runtime | Connect M5-02 pure functions to `apps/cron`/`apps/worker`; max 10 daily candidates; 7-day pass rate persisted to `distill_health_daily`; 3 days below 40% downshifts weekly; owner alert/audit draft persisted; true DB smoke for downshift/manual recovery. | Runtime distill health only; no real customer messages or real LLM calls. |
| 4 | M5R-04 AI Member Runtime Control | API+DB emergency stop/recovery/capability toggles; writes `ai_member`/`ai_member_version`/`ai_capability_toggle`; `audit_log` for emergency actions; mobile fallback through real API; no bypass of M3 eval gate/breaker. | Runtime control only; no AI persona/prompt release approval. |
| 5 | M5R-05 Logs + Analytics Runtime | Real data sources for login/presence/operation logs; fixed board includes confirmation pass rate, distill frequency and AI member state; export as controlled export job/draft, not direct sensitive file. | Runtime analytics/log/export governance only; no sensitive file committed. |
| 6 | M5R-06 Template Copy Runtime | API/DB template copy; group template creates tenant-owned independent version; group update does not auto-pollute tenant; at least one quick reply/config/AI member/eval template path; RLS smoke for cross-tenant invisibility. | Runtime template copy proof only; no external SaaS onboarding. |
| 7 | M5R-07 Admin Runtime Wiring | M5-04..M5-07 admin shells use API client runtime mode; Playwright goes through API; 320px mobile fallback processes confirmation queue and AI emergency stop/recovery. | Admin runtime wiring only; DB/RLS proof may be consumed through prior API-backed runtime evidence if explicitly linked. |
| 8 | M5R-08 True Integration Closeout | Final serial chain: distill candidate -> confirmation persistence -> owner confirm/conflict diff -> formal write -> audit/log readback -> analytics board -> independent template copy -> AI emergency stop/recovery. | Secret-backed CI true DB/RLS closeout passed; still not owner accepted. |

## Dependency / Parallelism Matrix

| Slice | Depends on | May run parallel with | Serial points |
|---|---|---|---|
| M5R-01 | M5 closeout evidence | none | `packages/db`, migrations, RLS, confirmation API/repository, audit/runtime helper paths |
| M5R-02 | M5R-01 | none | explicitly named formal-write paths, named target table/version records, `audit_log`, DB/RLS |
| M5R-03 | M5R-01 and usually M5R-02 boundaries | none by default | `apps/cron`, `apps/worker`, `packages/distill`, shared runtime helper, `distill_health_daily`, audit |
| M5R-04 | M5R-01 and relevant eval-gate/breaker state | none by default | AI member tables/API, audit, emergency runtime control, eval-gate/breaker integration |
| M5R-05 | M5R-01 plus log/audit data contracts | M5R-06 only if completely disjoint | log/analytics repositories, export job/draft, metric aggregation, any shared audit/log helpers |
| M5R-06 | M5R-01 plus template/version contracts | M5R-05 only if completely disjoint | template copy repositories/API, tenant-owned version records, `packages/ops-assets` template paths |
| M5R-07 | Runtime APIs from M5R-01..M5R-06 as applicable | none unless touch list is admin-only and disjoint | `apps/admin` runtime clients, Playwright API-backed fixtures, overlapping API-client paths |
| M5R-08 | M5R-01..M5R-07 merged or explicitly owner-superseded | none | final closeout chain, M5/M5R evidence sync, integration smoke |

Global serial points for the whole M5R queue: `packages/db`, Prisma schema, migrations, RLS policy changes, shared runtime helpers, lockfile, shared config, CI/guard scripts, global generated artifacts and release/production gates.

## Acceptance Mapping

| Item | M5R closeout status | Runtime evidence |
|---|---|---|
| A-03 | runtime_evidence_ready_not_owner_accepted | M5R-06 proves independent tenant-owned template copies; M5R-08 true DB CI executed the wrapper chain before this was marked ready. |
| H-01 | limited_formal_write_runtime_evidence_ready_not_full_h01_closed | M5R-02 proves the named config-version write path only; full H-01 authoring remains separately scoped. |
| H-02 | confirmation_to_formal_write_runtime_evidence_ready | M5R-01 and M5R-02 prove confirmation before formal write. |
| H-03 | conflict_diff_to_formal_write_runtime_evidence_ready | M5R-01 and M5R-02 prove conflict diff before write. |
| H-04 | template_copy_runtime_evidence_ready | M5R-06 proves template copy runtime independence. |
| H-06 | template_kind_runtime_evidence_ready_not_full_quick_reply_closed | M5R-06 includes quick reply/config-style template copy proof; full quick-reply workflows remain future. |
| H-07 | distill_health_runtime_evidence_ready | M5R-03 proves cap, pass rate, downshift, owner alert/audit draft and manual recovery. |
| I-02 | mobile_runtime_wiring_evidence_ready | M5R-04 and M5R-07 prove emergency and confirmation mobile fallback through API paths. |
| I-06 | logs_analytics_runtime_evidence_ready | M5R-05 proves fixed board and controlled export job/draft; M5R-07 wires admin API mode. |
| I-07 | ai_audit_logs_runtime_evidence_ready | M5R-04 and M5R-05 prove AI state/audit plus login/presence/operation logs. |
| J-05 | m5r_08_true_integration_closeout_passed_true_db_not_owner_accepted | M5R records the wrapper index and passed secret-backed true integration DB/RLS closeout; owner acceptance and release signoff remain open. |
| K-03 | active | One spec / one PR. |
| K-04 | active | Serial/parallel queue rules recorded; M5R-08 was final serial closeout. |

## Validation

Recorded from `/Users/atilla/Documents/uzmax-m5r-00-runtime-integration-plan`.

| Command | Result | Notes |
|---|---|---|
| `npm ci` | pass | Required because `node_modules` was missing in the assigned worktree; installed 360 packages and found 0 vulnerabilities. |
| `npm run format:check` | pass | Prettier reported all matched files use Prettier code style. |
| `npm run guard:doc-triggers` | pass | `doc-trigger-paths: ok`. |
| `npm run guard:workspace` | pass | `workspace-isolation: ok` in linked M5R-00 worktree. |
| `npm run guard:worker-boundary -- --assigned /Users/atilla/Documents/uzmax-m5r-00-runtime-integration-plan --root /Users/atilla/Documents/UZMAX智能运营` | pass | Explicit assigned/root boundary check passed. |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M5R-00-runtime-integration-plan.md --include-worktree` | pass | Reported 3 docs files, source changed files 0, net source LOC 0 and new source files 0. No PR existed yet for this branch. |
| `git diff --check origin/main...HEAD` | pass | No whitespace errors. |

Validation was run after the coordinator-authorized root cleanup and before commit. Root/main stayed clean during validation.

## Boundary

M5R does not approve:

- M5 owner acceptance;
- owner acceptance;
- M6 release hardening;
- GA-0 opening;
- production readiness;
- real customer traffic/data;
- real order data;
- real LLM calls or customer LLM;
- production Redis/worker deployment;
- external SaaS onboarding;
- automatic knowledge/config/eval/template write without confirmation;
- 1.0 release.

M5R evidence must not include raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets. Future sensitive source material must stay in controlled storage; repo evidence may only record manifests, redaction method, storage refs, access scope, retention period and project owner confirmation status.
