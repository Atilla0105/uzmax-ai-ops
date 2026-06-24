# M5R-00 Runtime Integration Plan

## 目标

Create a docs-only M5R runtime-readiness plan that converts M5 from shape-complete / closeout-ready evidence into a follow-up queue for a runnable runtime operations loop.

This spec does not expand product scope. It records the minimum follow-up slices needed to turn M5 contracts and admin shells into persisted DB/RLS/API/worker/cron/admin runtime behavior, while preserving M5's current state: `m5_08_integration_closeout_ready__not_owner_accepted`.

M5R-00 itself creates no runtime/source/schema/API/admin implementation and no `M5R-01` through `M5R-08` implementation spec files.

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner: decide whether to approve the M5R follow-up queue, any later production/GA-0/release decision, any real account onboarding, any real customer/order-data usage, any customer LLM usage, LLM keys/provider cost risk, external SaaS onboarding, compliance risk and final 1.0 release signoff.

AI agent: record the M5 runtime gap, create the M5R queue, enforce one PR per spec and one worker/worktree/branch per spec, expose serial/parallel constraints, require true DB/RLS smoke for each runtime slice unless explicitly justified, and keep all owner-only decisions out of AI status wording.

M5R-00 boundary: no real customer data, no real order data, no real LLM calls, no production deploy, no production Redis/worker deployment, no external SaaS onboarding, no GA-0 opening, no 1.0 release signoff, no owner acceptance claim.

## 时间盒

0.2 个工作日. If the M5R plan requires runtime/source/schema/API/admin/worker/cron implementation, new M5R implementation specs, changes to `docs/evidence/M5/README.md`, lockfile/config/generated changes, or validation-guard scope widening, stop and report instead of widening this PR.

## Spec 类型

docs

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M5R-00-runtime-integration-plan.md`
  - `docs/evidence/M5R/README.md`
  - `docs/incidents/INC-2026-06-24-m5r-00-root-main-worktree-pollution.md`
- 说明/备注：
  - This PR is docs-only and may read M5/M5R-relevant docs, specs, evidence, incident format files and v1.1 source-of-truth files.
  - Do not modify `apps/**`, `packages/**`, `scripts/**`, lockfile, config, generated files or `docs/evidence/M5/README.md`.
  - Root/main checkout `/Users/atilla/Documents/UZMAX智能运营` is read-only coordination only except the coordinator-authorized cleanup of the two untracked files created by the initial patch-target incident.

## 变更预算与路径分类

- source budget target: changed source files <= 0, net source LOC <= 0, new source files <= 0.
- docs: this spec, `docs/evidence/M5R/README.md` and `docs/incidents/INC-2026-06-24-m5r-00-root-main-worktree-pollution.md`.
- source/test/generated/lock/config/API/DB/runtime/admin source/worker/cron/evals/provider/adapter: none.
- New source `rg` conclusion: no new source files. Existing M5 specs/evidence and v1.1 docs show the current gap is a runtime-integration plan, not a new source ownership decision in this PR.
- External API/SDK/provider/connector/adapter basis: none. M5R-00 adds no connector/provider/adapter and performs no external SaaS or LLM call.
- Exceptions: none. No `large_change_exception` and no `test_weakening_exception`.

## 文档触发检查

updated

## 前置条件

- Read `AGENTS.md`.
- Read `docs/specs/README.md`.
- Read `docs/evidence/M5/README.md`.
- Read `docs/specs/M5-08-integration-smoke-closeout.md`.
- Read `docs/evidence/M5/M5-08-integration-smoke-closeout.md`.
- Read `docs/specs/M5-00-operations-loop-readiness-pack.md`.
- Read the four v1.1 source-of-truth docs named in `AGENTS.md` enough to ground M5R scope and boundaries.
- Read `docs/incidents/README.md` and `docs/incidents/INC-2026-06-24-m5-07-root-patch-target.md` for incident format after the initial root/main patch-target incident.
- Current M5 evidence status must remain `m5_08_integration_closeout_ready__not_owner_accepted`.
- M5-08 is docs/test-only and excludes runtime/source/schema/API/admin/worker/cron changes; M5R exists because those runtime gaps are still open.
- Do not write to `/Users/atilla/Documents/UZMAX智能运营` except the coordinator-authorized cleanup recorded in the incident.
- Do not touch other worktrees.
- Do not create M5R-01..M5R-08 implementation specs in this PR.

## Worktree / branch 前置条件

| Fact | Expected |
|---|---|
| worktree | `/Users/atilla/Documents/uzmax-m5r-00-runtime-integration-plan` |
| branch | `codex/m5r-00-runtime-integration-plan` |
| base | `origin/main` at current main HEAD |
| forbidden checkout | `/Users/atilla/Documents/UZMAX智能运营` |
| root/main checkout use | coordination/read-only only after the authorized incident cleanup |
| required pre-edit evidence | `pwd`, `git status --short --branch`, `git branch --show-current`, worker `HEAD`, worker `origin/main`, root/main status, open PR audit, root no-merged branch audit |

## 并发派发证据

Single active writing worker for M5R-00. The assigned worktree path and branch are unique for this slice. The touch list contains only this docs spec, the M5R evidence README and one incident record, and has no overlap with runtime source, DB schema, migrations, lockfile, shared config, CI/guard scripts, global generated artifacts or release/production gates.

For future M5R slices:

- One PR implements exactly one spec.
- One worker uses exactly one physical worktree, one branch and one spec.
- Root/main checkout remains coordination/read-only only.
- Workers may run in parallel only when machine-readable touch lists are disjoint and no shared serial point is touched.
- Global serial points: `packages/db`, Prisma schema, migrations, RLS policy changes, shared runtime helpers, lockfile, shared config, CI/guard scripts, global generated artifacts and release/production gates.
- `M5R-01` through `M5R-04` are basically serial because API, DB, audit, runtime helper and emergency-control paths overlap.
- `M5R-05` and `M5R-06` may run in parallel only if their touch lists are completely disjoint and neither touches a global serial point.
- `M5R-08` is last and serial.

## True DB/RLS Smoke Baseline

Future M5R runtime slices may call a check `true DB/RLS smoke` only when it meets this baseline:

- It uses the real configured smoke database through `UZMAX_RLS_DATABASE_URL` or the repo-approved true DB smoke environment.
- It runs through the restricted app runtime role and RLS transaction context, not a service-role or privileged Prisma bypass.
- It sets transaction-scoped `app.org_id` and `app.tenant_id`, or uses the existing helper that sets those values.
- Where the slice owns data writes, it includes positive same-tenant read/write evidence and negative missing-context or wrong-tenant-context evidence.
- Repository-only filters, mocks, local arrays and privileged clients do not count as true DB/RLS smoke.
- If M5R-07 consumes prior API-backed DB/RLS evidence instead of direct DB assertions, its spec must link the prior runtime evidence and explain why those checks cover the admin runtime path.

## 事故与 closeout 记录

- Incident created by M5R-00: `docs/incidents/INC-2026-06-24-m5r-00-root-main-worktree-pollution.md`.
- The incident records an initial patch-target write into root/main that created two untracked docs, the coordinator-authorized cleanup, clean root evidence, and no runtime/source/customer/secret impact.
- Containment and cleanup land in this PR. The existing worker-boundary guard remains detective evidence; M5R-00 adds no new preventive guard or script.
- Repeated patch-target failures remain a known orchestration risk to monitor and handle in later guard or tooling work if needed.
- If any further write lands outside the assigned worktree, on root/main, on the wrong branch, in an unlisted path, or includes secret/customer-data boundary risk, stop and create or reference `docs/incidents/` before continuing.
- If validation proves a scope change is required outside this touch list, stop and report before widening scope.
- M5R closeout evidence must keep sensitive material out of repo evidence and record manifests/status only.

## 实施步骤

1. Verify the only dirty root paths from the initial incident are exactly `docs/specs/M5R-00-runtime-integration-plan.md` and `docs/evidence/M5R/README.md`.
2. Delete only those untracked root files/directories and record root clean evidence.
3. Create this M5R-00 docs-only spec in the assigned worktree.
4. Create `docs/evidence/M5R/README.md` with start audit, current M5 runtime gap, planned queue, dependency/parallelism matrix, acceptance mapping, validation commands and boundaries.
5. Create one incident record at `docs/incidents/INC-2026-06-24-m5r-00-root-main-worktree-pollution.md`.
6. Do not create `M5R-01` through `M5R-08` implementation spec files.
7. Run and record required validation.
8. Commit, push and open a draft PR only if validation is green; report exact failures if not.

## M5R Planned Slices

| Order | Planned slice | Goal | Runtime touch expectation | True DB/RLS smoke expectation | Serial / parallel rule |
|---:|---|---|---|---|---|
| 1 | `M5R-01 Confirmation Queue Persistence` | Put a Prisma/RLS runtime repository behind the M5-03 `InMemoryConfirmationQueueRepository`. Prove create/list/detail/approve/edit/discard/block, tenant isolation, conflict diff and no unconfirmed formal write. | `packages/db`, confirmation queue repository/API/service paths as scoped by its future spec. | Required: true DB create/list/detail/approve/edit/discard/block smoke under at least two tenant contexts; RLS must prove cross-tenant invisibility and mutation denial. | First runtime slice; global serial for DB/schema/migration/RLS and serial with API/audit shared paths. |
| 2 | `M5R-02 Formal Write Pipeline` | Add a minimal proof path for one or more explicitly named target paths from knowledge/config/eval/template, not full H-01. The M5R-02 spec must name each target table/version record before implementation and list non-closures. Current read-only inventory suggests `config_version` + `audit_log` + `confirmation_item.auditLogId/status` as the preferred smallest candidate, but M5R-02 must make the final scoped choice. Pending/discarded/blocked candidates cannot write; approved/edited candidates write only to the named target table or version record; `audit_log` includes confirmer, diff and target ref. | Formal write orchestrator/repository paths plus the exact named target table/version refs chosen in M5R-02. | Required: true DB/RLS smoke proves only approved/edited decisions write to the named target path(s), target refs are tenant-isolated, and pending/discarded/blocked decisions produce no formal write. | Depends on M5R-01; serial with DB, audit and named target write paths. |
| 3 | `M5R-03 Distill Scheduler + Health Runtime` | Connect M5-02 pure functions to `apps/cron` and `apps/worker`. Persist max 10 daily candidates, 7-day pass rate to `distill_health_daily`, 3 days below 40% downshift weekly, owner alert/audit draft persisted, and manual recovery. | `apps/cron`, `apps/worker`, `packages/distill`, distill health repository/API paths as scoped. | Required: true DB/RLS smoke for candidate cap, health daily persistence, downshift, owner alert/audit draft and manual recovery across tenant contexts. | Depends on M5R-01 and usually M5R-02 candidate/write boundaries; serial with worker/cron/shared runtime helper paths. |
| 4 | `M5R-04 AI Member Runtime Control` | Add API+DB runtime control for emergency stop, recovery and capability toggles. Writes `ai_member`, `ai_member_version`, `ai_capability_toggle`; `audit_log` records emergency actions; mobile emergency fallback uses real API; no bypass of M3 eval gate/breaker. | AI member API/repository/admin-client paths, audit paths and eval-gate/breaker integration points as scoped. | Required: true DB/RLS smoke proves emergency stop/recovery/toggle writes, audit entries, cross-tenant isolation and no eval-gate/breaker bypass. | Basically serial with M5R-01..M5R-03 because DB/API/audit/runtime helpers overlap. |
| 5 | `M5R-05 Logs + Analytics Runtime` | Replace local-contract surfaces with real login, presence and operation log sources. Fixed board includes confirmation pass rate, distill frequency and AI member state. Export is a controlled export job/draft, not a direct sensitive file. | Logs/analytics API/repositories/aggregation/admin-client paths and controlled export job/draft paths as scoped. | Required: true DB/RLS smoke for login/presence/operation log readback, fixed-board metrics, controlled export job/draft creation and cross-tenant invisibility. | May run in parallel with M5R-06 only if touch lists are completely disjoint and no shared serial point is touched. |
| 6 | `M5R-06 Template Copy Runtime` | Add API/DB template copy. Group template creates tenant-owned independent version; group updates do not auto-pollute tenants. Prove at least one path for quick reply, config, AI member or eval template. | Template copy API/repository/admin-client paths, `packages/ops-assets` template paths and target version paths as scoped. | Required: true DB/RLS smoke for copy-to-tenant, independent version refs, group update non-pollution and cross-tenant invisibility. | May run in parallel with M5R-05 only if touch lists are completely disjoint and no shared serial point is touched. |
| 7 | `M5R-07 Admin Runtime Wiring` | Wire M5-04..M5-07 admin shells to API client runtime mode. Playwright goes through API. 320px mobile fallback can process confirmation queue and AI emergency stop/recovery. | `apps/admin` M5 feature paths, API client runtime mode and Playwright paths as scoped. | Required through API-backed fixtures: Playwright must exercise real API over true DB/RLS-backed data. If a direct DB assertion is omitted, the future spec must state why API/RLS evidence from M5R-01..M5R-06 is sufficient and link it. | Depends on the runtime APIs it wires; serial with overlapping admin/API-client paths. |
| 8 | `M5R-08 True Integration Closeout` | Run the final serial closeout chain: distill candidate -> confirmation persistence -> owner confirm/conflict diff -> formal write -> audit/log readback -> analytics board -> independent template copy -> AI emergency stop/recovery. Only then update M5 evidence to runtime evidence ready, still not owner accepted unless owner decides. | Closeout evidence plus scoped integration smoke/E2E paths; may update M5 evidence only in this final closeout if prior runtime evidence is merged. | Required: true DB/RLS end-to-end smoke for the full chain with tenant isolation and no sensitive repo artifacts. | Last and serial; cannot start until required prior runtime slices are merged or explicitly superseded by owner-approved evidence. |

## 通过条件

- M5R-00 spec contains every required field from `docs/specs/README.md`.
- Evidence README records start audit, current M5 runtime gap, planned queue, dependency/parallelism matrix, acceptance mapping, validation commands, incident reference and boundaries.
- Incident record documents the initial root/main write-boundary incident and cleanup evidence.
- Planned queue includes exactly M5R-01 through M5R-08 with the runtime acceptance boundaries listed above.
- Future slices require true DB/RLS smoke matching the baseline above, or an explicit why-not where the slice only consumes prior DB/RLS evidence through API-backed admin smoke.
- Global serial points and allowed parallelism are recorded.
- Diff only includes `docs/specs/M5R-00-runtime-integration-plan.md`, `docs/evidence/M5R/README.md` and `docs/incidents/INC-2026-06-24-m5r-00-root-main-worktree-pollution.md`.
- Required validation passes or failures are honestly recorded.
- No source/runtime/schema/API/admin/worker/cron/config/lock/generated changes.

## 失败分支

- If the worktree path or branch differs from expected: stop and report.
- If root/main has any dirty path beyond the two known untracked incident residue files before cleanup: stop and report.
- If root/main is not clean after cleanup: stop and report.
- If M5 status is not `m5_08_integration_closeout_ready__not_owner_accepted`: record the contradiction and do not present M5R as ready to queue.
- If validation requires changes outside the three allowed docs files: stop and report before widening scope.
- If wording implies owner acceptance, production readiness, GA-0 opening, real customer data approval, real LLM calls, external SaaS onboarding or 1.0 release signoff: correct it before merge.
- If raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets appear: stop, clean up and create or reference incident evidence before continuing.

## 不做什么

- No `M5R-01` through `M5R-08` implementation spec files.
- No runtime source, Prisma schema, migrations, RLS policy, generated client, API route, admin source, worker, cron, engine, capability, distill source, ops-assets, eval runner, provider, connector, adapter, config, lockfile or release-gate changes.
- No edits to `docs/evidence/M5/README.md` in M5R-00.
- No real customer/order data, raw message samples, external SaaS onboarding, production Redis/worker deployment, customer LLM, real LLM calls, prompt/model route release, M6 hardening, GA-0, production readiness, owner acceptance or 1.0 release claim.
- No automatic formal knowledge/profile/eval/template writes.
- No guard implementation in this PR; containment and cleanup are recorded here, and the existing worker-boundary guard is detective evidence rather than a new preventive control.

## 验收映射

| Item | M5R-00 status | Future M5R closure path |
|---|---|---|
| A-03 | planned_runtime_queue_not_closed | M5R-06 must prove DB/API template copy to tenant creates independent tenant-owned versions and group updates do not auto-pollute tenants. |
| H-01 | limited_proof_path_planned_not_full_h01_closed | M5R-02 proves a minimal formal write path for one or more explicitly named knowledge/config/eval/template targets chosen in its own spec; full facts/journeys/stages/materials authoring remains outside M5R unless separately scoped. |
| H-02 | runtime_queue_planned_not_closed | M5R-01 persists confirmation decisions; M5R-02 proves no pending/discarded/blocked candidate can write and only approved/edited decisions write. |
| H-03 | runtime_queue_planned_not_closed | M5R-01 and M5R-02 must prove conflict diff is required before formal write and cannot be skipped into storage. |
| H-04 | runtime_queue_planned_not_closed | M5R-06 proves template copy independence with true DB/RLS smoke. |
| H-06 | runtime_queue_planned_not_full_quick_reply_closed | M5R-06 must include at least one provable quick reply/config/AI member/eval template path; full quick-reply search/import/export/permission closure remains separately scoped unless explicitly included. |
| H-07 | runtime_queue_planned_not_closed | M5R-03 must persist candidate cap, 7-day pass rate, 3-day downshift, owner alert/audit draft and manual recovery. |
| I-02 | runtime_queue_planned_not_closed | M5R-04 and M5R-07 must prove mobile emergency stop/recovery through real API; M5R-07 must prove mobile confirmation queue processing. |
| I-06 | runtime_queue_planned_not_closed | M5R-05 must use real runtime data sources and controlled export job/draft governance. |
| I-07 | runtime_queue_planned_not_closed | M5R-04 and M5R-05 must persist AI member emergency actions and login/presence/operation logs with audit readback. |
| J-05 | m5r_plan_recorded_not_owner_accepted | M5R-00 records follow-up runtime evidence queue only; no M5 owner acceptance or release signoff. |
| K-03 | active | One spec / one PR; this PR implements only M5R-00 docs. |
| K-04 | active | M5R serial/parallel rules and global serial points are recorded. |

M5R-00 opens no production acceptance item. It only records the runtime-integration plan needed before M5 can become runtime-evidence-ready for owner review.
