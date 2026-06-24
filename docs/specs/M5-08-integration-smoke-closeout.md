# M5-08 Integration Smoke Closeout

## 目标

Create the final M5 closeout slice: run a narrow integration smoke over the M5 operations loop, sync M5 evidence, and record M5 as ready for project-owner closeout review.

This slice is docs/test only. It must not add runtime source, DB schema, migrations, generated code, API routes, admin source, worker/cron behavior, external SaaS onboarding, production Redis deployment, real customer/order data, customer LLM usage, GA-0, M6, production readiness or 1.0 release approval.

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner: decide whether M5 closeout evidence is accepted. Owner still owns final scope, release, production, real accounts, real customer/order data, customer LLM, LLM keys, cost, compliance, external SaaS and 1.0 decisions.

AI agent: prove the merged M5-01..M5-07 evidence is internally consistent, add integration smoke coverage for the requested M5 operations-loop paths, record incidents and validation, and keep the status at `m5_08_integration_closeout_ready__not_owner_accepted` until owner acceptance exists.

## 时间盒

0.5 个工作日. If closeout requires runtime source changes, DB migrations, new API/admin implementation, external services, real data, broad BI/reporting, M6 release hardening or production deployment, stop and report the remaining blocker instead of widening this PR.

## Spec 类型

docs

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M5-08-integration-smoke-closeout.md`
  - `docs/evidence/M5/M5-08-integration-smoke-closeout.md`
  - `docs/evidence/M5/README.md`
  - `scripts/tests/m5-integration-smoke-closeout.test.mjs`
  - `apps/admin/tests/m5-integration-smoke-closeout.spec.ts`
- 说明/备注：
  - This slice may read existing M5 source/tests/contracts but must not modify them.
  - Root/main checkout `/Users/atilla/Documents/UZMAX智能运营` is read-only coordination only.

## 变更预算与路径分类

- source budget target: changed source files <= 0, net source LOC <= 0, new source files <= 0.
- docs: this spec, M5-08 evidence, M5 evidence README.
- test: `scripts/tests/m5-integration-smoke-closeout.test.mjs`, `apps/admin/tests/m5-integration-smoke-closeout.spec.ts`.
- source/generated/lock/config/API/DB/runtime/admin source/worker/cron/ops-assets/distill source/evals/provider/adapter: none.
- New source `rg` conclusion: no new source files. Searched existing M5 tests and contracts for confirmation queue, distill, AI member, logs analytics, template center and M5 DB contract coverage; M5-08 only adds closeout tests/evidence that orchestrate existing contracts.
- External API/SDK/provider/connector/adapter basis: none. This PR adds no external integration and performs no external call.
- Exceptions: none. No `large_change_exception` and no `test_weakening_exception`.

## 文档触发检查

updated

## 前置条件

- Read `AGENTS.md`, `docs/specs/README.md`, `docs/specs/M5-00-operations-loop-readiness-pack.md`, `docs/evidence/M5/README.md`, M5-01..M5-07 specs/evidence, relevant v1.1 PRD/backoffice/technical/acceptance sections and existing M5 tests before implementation.
- Worktree must be `/Users/atilla/Documents/uzmax-m5-08-integration-closeout`.
- Branch must be `codex/m5-08-integration-closeout`.
- M5-01..M5-07 must be merged into `main`.
- Do not write to `/Users/atilla/Documents/UZMAX智能运营` root/main checkout.
- Start audit must be recorded in `docs/evidence/M5/M5-08-integration-smoke-closeout.md` before test/evidence implementation edits.

## Worktree / branch 前置条件

| Fact | Expected |
|---|---|
| worktree | `/Users/atilla/Documents/uzmax-m5-08-integration-closeout` |
| branch | `codex/m5-08-integration-closeout` |
| forbidden checkout | `/Users/atilla/Documents/UZMAX智能运营` |
| root/main checkout use | coordination/read-only only |

## 并发派发证据

Single active writing worker for this spec. Touch list is docs/test only and has no overlap with DB schema, runtime source, lockfile, shared config, CI/guard scripts, generated artifacts or release/production gates. No parallel M5 writer may touch `docs/evidence/M5/README.md` or the new M5-08 files.

## 事故与 closeout 记录

- M5 incident inventory must include all M5 incident records present in repo evidence at closeout time, including M5-04, M5-05 and M5-07 root patch-target incidents.
- If any write lands outside the assigned worktree, on root/main, on the wrong branch, or includes secret/customer-data boundary risk, stop and create or reference `docs/incidents/` before continuing.

## 实施步骤

1. Record start audit evidence for worktree/root/GitHub state and merged M5-01..M5-07 baseline.
2. Add Node integration smoke covering:
   - confirmation queue API contract and DB contract smoke by invoking the existing focused suites;
   - distill daily cap, low pass-rate downshift and manual recovery audit contract;
   - AI emergency stop/recovery local action drafts;
   - logs analytics readback/export draft governance;
   - template copy independent tenant version refs and no auto-overwrite;
   - M5 DB contract table/contract vocabulary.
3. Add Playwright integration smoke covering confirmation queue, distill recovery banner, AI emergency/recovery, logs readback/export draft, template copy and 320px mobile overflow.
4. Update M5 evidence README with M5-08 link/status and closeout-ready mapping while preserving owner-not-accepted/release boundaries.
5. Record validation, spec compliance review and code quality review.

## 通过条件

- M5-08 spec contains all required fields from `docs/specs/README.md`.
- Evidence records start audit, merged prior slices, incident inventory, validation, closeout readiness and owner/AI boundary.
- Node smoke proves confirmation queue, DB contract, distill downshift/recovery, AI emergency stop, logs readback/export and template copy independence without formal writes.
- Playwright smoke proves the admin operations-loop surface spans M5-04..M5-07 and remains usable at 320px.
- `docs/evidence/M5/README.md` points to M5-08 and marks M5 as closeout-ready but not owner accepted.
- Required validation passes or failures are honestly recorded.
- No source/runtime/schema/config/lock/generated changes.

## 失败分支

- If M5-01..M5-07 are not merged: stop and report `BLOCKED`.
- If smoke requires new runtime/source/schema/API/admin implementation: stop and split to a future spec; do not widen M5-08.
- If validation fails because existing M5 evidence contradicts closeout readiness: record the contradiction and do not mark closeout ready.
- If owner acceptance wording appears without an owner decision: correct it before merge.
- If raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets appear: stop and clean up before continuing.

## 不做什么

- No DB/Prisma schema or migration changes.
- No API/admin source, worker/cron, engine, capability, distill source, ops-assets, eval runner, provider, connector, adapter, config, lockfile, generated artifact or release-gate changes.
- No real customer/order data, raw message samples, external SaaS onboarding, production Redis/worker deployment, customer LLM, prompt/model route release, M6 hardening, GA-0, production readiness or 1.0 release claim.
- No automatic formal knowledge/profile/eval/template writes.
- No owner acceptance claim.

## 验收映射

| Item | M5-08 status | Notes |
|---|---|---|
| A-03 | `closeout_ready_not_runtime_closed` | M5-07 local template copy independence is smoke-tested; runtime tenant-copy integration remains future. |
| H-01 | `closeout_ready_not_full_content_workflow_closed` | Confirmation-backed candidate path is smoke-tested; full facts/journeys/stages/materials authoring remains future unless separately scoped. |
| H-02 | `closeout_ready_admin_api_contract_supported_not_formal_write_closed` | Confirmation queue approve/edit/discard remains no formal write before confirmation. Formal write pipeline remains future. |
| H-03 | `closeout_ready_diff_required_not_storage_closed` | Conflict diff requirement is covered by existing API smoke. Formal storage integration remains future. |
| H-04 | `closeout_ready_frontend_local_contract_supported_not_runtime_closed` | Template copy independent version refs are smoke-tested locally. DB/API persistence remains future. |
| H-06 | `closeout_ready_template_kind_supported_not_full_quick_reply_closed` | Quick-reply template kind is present; public/private search/import/export and permissions remain future. |
| H-07 | `closeout_ready_behavior_contract_supported_not_scheduler_closed` | Distill cap/downshift/recovery contracts are smoke-tested. Scheduler/persisted alert remains future. |
| I-02 | `closeout_ready_frontend_fallback_supported_not_runtime_closed` | Mobile confirmation/AI fallback is smoke-tested. Runtime emergency path remains future. |
| I-06 | `closeout_ready_frontend_local_contract_supported_not_runtime_closed` | Fixed analytics/log board and export draft governance are smoke-tested. Runtime aggregation/export jobs remain future. |
| I-07 | `closeout_ready_frontend_local_contract_supported_not_persisted_closed` | AI action draft and log readback are smoke-tested. Persisted audit/log integration remains future. |
| J-05 | `m5_closeout_ready_not_owner_accepted` | M5 evidence is present and synchronized for owner review; no release signoff. |
| K-03 | `active` | One spec / one PR; this PR implements only M5-08. |
| K-04 | `active` | Worktree/branch/touch list are scoped; global serial points are untouched. |

M5-08 closes the M5 technical evidence queue for owner review. It does not approve production acceptance, GA-0, real data, customer LLM or 1.0 release.
