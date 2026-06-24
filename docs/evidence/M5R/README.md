# M5R Evidence

M5R evidence tracks the runtime-readiness follow-up queue after M5 integration smoke closeout. M5 is currently shape-complete / closeout-ready as `m5_08_integration_closeout_ready__not_owner_accepted`, but it is not runtime-persistence closed and is not owner accepted.

Current M5R plan spec: `docs/specs/M5R-00-runtime-integration-plan.md`.
Current M5R implementation spec: `docs/specs/M5R-01-confirmation-queue-persistence.md`.
Current M5R incident record: `docs/incidents/INC-2026-06-24-m5r-00-root-main-worktree-pollution.md`.

## Runtime Slice Status

| Slice | Status | Evidence |
|---|---|---|
| M5R-00 Runtime Integration Plan | `m5r_plan_recorded_not_owner_accepted` | `docs/specs/M5R-00-runtime-integration-plan.md`; this README; `docs/incidents/INC-2026-06-24-m5r-00-root-main-worktree-pollution.md` |
| M5R-01 Confirmation Queue Persistence | `runtime_contract_passed_true_db_blocked_missing_env_not_owner_accepted` | `docs/specs/M5R-01-confirmation-queue-persistence.md`; `docs/evidence/M5R/M5R-01-confirmation-queue-persistence.md` |

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

## Current M5 Runtime Gap

M5 evidence says `m5_08_integration_closeout_ready__not_owner_accepted`. M5-08 explicitly remained docs/test-only and excluded runtime source, DB schema, migrations, generated code, API routes, admin source, worker/cron behavior, external SaaS onboarding, production Redis deployment, real customer/order data, customer LLM usage, GA-0, M6, production readiness and 1.0 release approval.

M5R therefore does not reopen M5 scope or claim owner acceptance. It records the follow-up runtime queue required before the operations loop can be treated as runtime-evidence-ready.

## Incident Record

M5R-00 includes `docs/incidents/INC-2026-06-24-m5r-00-root-main-worktree-pollution.md`.

Impact was limited to two untracked root docs created by the initial patch-target mistake. Cleanup removed those two files and the empty directory from root/main; root/main returned clean. No runtime/source files, tracked root files, customer/order data, secrets, LLM calls, validation, commit, push or PR were affected by the incident.

Containment and cleanup are recorded in this PR. The existing worker-boundary guard is detective evidence, not a new preventive control. No guard/script preventive control lands in M5R-00; repeated patch-target failures remain a known orchestration risk to monitor and handle in later guard or tooling work if needed.

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
| 8 | M5R-08 True Integration Closeout | Final serial chain: distill candidate -> confirmation persistence -> owner confirm/conflict diff -> formal write -> audit/log readback -> analytics board -> independent template copy -> AI emergency stop/recovery. | Only after this may M5 evidence be updated to runtime evidence ready; still not owner accepted unless owner decides. |

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

| Item | M5R-00 status | Planned runtime closure |
|---|---|---|
| A-03 | planned_runtime_queue_not_closed | M5R-06 proves independent tenant-owned template copies. |
| H-01 | limited_proof_path_planned_not_full_h01_closed | M5R-02 proves minimal formal writes for one or more target paths explicitly named in its own spec; full H-01 authoring remains separately scoped. |
| H-02 | runtime_queue_planned_not_closed | M5R-01 and M5R-02 prove confirmation before formal write. |
| H-03 | runtime_queue_planned_not_closed | M5R-01 and M5R-02 prove conflict diff before write. |
| H-04 | runtime_queue_planned_not_closed | M5R-06 proves template copy runtime independence. |
| H-06 | runtime_queue_planned_not_full_quick_reply_closed | M5R-06 includes at least one quick reply/config/AI member/eval template path. |
| H-07 | runtime_queue_planned_not_closed | M5R-03 proves cap, pass rate, downshift, owner alert/audit draft and manual recovery. |
| I-02 | runtime_queue_planned_not_closed | M5R-04 and M5R-07 prove emergency and confirmation mobile fallback through real API. |
| I-06 | runtime_queue_planned_not_closed | M5R-05 proves fixed board and controlled export job/draft. |
| I-07 | runtime_queue_planned_not_closed | M5R-04 and M5R-05 prove AI state/audit plus login/presence/operation logs. |
| J-05 | m5r_plan_recorded_not_owner_accepted | M5R records runtime-evidence queue only; no release signoff. |
| K-03 | active | One spec / one PR. |
| K-04 | active | Serial/parallel queue rules recorded. |

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

M5R-00 does not approve:

- M5 owner acceptance;
- M5 runtime readiness;
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
