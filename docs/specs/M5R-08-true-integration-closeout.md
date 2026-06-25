# M5R-08 True Integration Closeout

## 目标

Close the M5R runtime-integration evidence chain by adding a final scoped integration closeout test and evidence record that links M5R-01 through M5R-07 runtime boundaries.

M5R-08 does not expand product scope. It records M5 as runtime-evidence-ready for project-owner review, while still explicitly `not_owner_accepted`, not production ready, not GA/release approved, and with true DB execution honestly blocked when `UZMAX_RLS_DATABASE_URL` is absent.

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner: decide whether to accept M5/M5R evidence later, whether to provide a true DB smoke environment, whether to proceed to any production/GA/release step, and any real account, real customer/order-data, customer LLM, LLM key, provider cost, compliance or external SaaS onboarding decision.

AI agent: implement only this final closeout spec in the assigned worktree/branch, reuse existing M5R runtime contracts and true DB wrappers, expose missing-env status honestly, update M5/M5R evidence without owner acceptance wording, and avoid production/customer/LLM scope.

## 时间盒

0.5 个工作日. If closeout requires DB schema/migration changes, API/admin/runtime source changes, external services, real customer/order data, real LLM/provider calls, production deployment, CI/guard/config/lockfile changes or M6 release hardening, stop and report instead of widening this PR.

## Spec 类型

docs

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M5R-08-true-integration-closeout.md`
  - `docs/evidence/M5R/M5R-08-true-integration-closeout.md`
  - `docs/evidence/M5R/README.md`
  - `docs/evidence/M5/README.md`
  - `scripts/tests/m5r-admin-runtime-wiring.test.mjs`
  - `scripts/tests/m5r-true-integration-closeout.test.mjs`
- 说明/备注：
  - This slice may read M5/M5R specs, evidence, existing M5R tests and existing true DB smoke wrappers.
  - It must not modify `apps/**`, `packages/**`, Prisma schema/migrations/generated client, lockfile, shared config/CI/guard scripts, production/deploy files, Playwright tests, or any runtime source.
  - Root/main checkout `/Users/atilla/Documents/UZMAX智能运营` is read-only coordination only.

## 变更预算与路径分类

- source budget target: changed source files <= 0, net source LOC <= 0, new source files <= 0.
- docs: this spec, M5R-08 evidence, M5R README and M5 README.
- test: one focused Node closeout test under `scripts/tests`, plus one existing M5R-07 status assertion update so prior admin-wiring tests reflect that M5R-07 is no longer active after M5R-08.
- source/generated/lock/config/schema/migration/API/admin source/worker/cron/distill/ops-assets/evals/provider/adapter/runtime source: none.
- New source/test `rg` conclusion: `rg -n "M5R-08|true integration closeout|m5r-true-integration|runM5rTrueIntegration|run-m5r.*closeout|True Integration Closeout" docs scripts packages apps` found only the M5R-00 planned queue plus forward references in M5R-04/05/06/07 docs and no existing closeout aggregator. `rg -n "runM5rConfirmationQueueTrueDbSmoke|runM5rFormalWriteTrueDbSmoke|runM5rDistillSchedulerHealthTrueDbSmoke|runM5rAiMemberRuntimeTrueDbSmoke|runM5rLogsAnalyticsTrueDbSmoke|runM5rTemplateCopyTrueDbSmoke" packages/db/scripts scripts/tests docs` found existing M5R true DB wrappers/support runners, so M5R-08 reuses those wrappers in `scripts/tests/m5r-true-integration-closeout.test.mjs` rather than inventing parallel runtime logic.
- External API/SDK/provider/connector/adapter basis: none. This PR adds no provider, connector, adapter, SaaS onboarding or network call.
- Exceptions: none. No `large_change_exception` and no `test_weakening_exception`.

## 文档触发检查

updated

## 前置条件

- Read `AGENTS.md` completely.
- Record `pwd`, `git status --short --branch`, `git branch --show-current`, and `git rev-parse HEAD`.
- Read the four v1.1 source-of-truth documents named in `AGENTS.md` enough to ground M5R scope and boundaries.
- Read `docs/specs/M5R-00-runtime-integration-plan.md`.
- Read `docs/evidence/M5R/README.md`.
- Read `docs/specs/M5-08-integration-smoke-closeout.md`.
- Read `docs/evidence/M5/M5-08-integration-smoke-closeout.md`.
- Read `docs/evidence/M5/README.md`.
- Read M5R-01 through M5R-07 specs/evidence enough to link runtime boundaries and true DB status.
- Read existing M5R focused tests and true DB smoke wrappers under `scripts/tests` and `packages/db/scripts`.
- Prior M5R slices must be merged in the base HEAD or explicitly present in this worktree base.
- Keep M5/M5R owner status `not_owner_accepted`.

## Worktree / branch 前置条件

| Fact | Expected |
|---|---|
| worktree | `/private/tmp/uzmax-m5r-08-true-integration-closeout` |
| branch | `codex/m5r-08-true-integration-closeout` |
| base HEAD | `255901b22afec0c3c87f078a57c46051065a38a0` |
| forbidden checkout | `/Users/atilla/Documents/UZMAX智能运营` |
| root/main checkout use | coordination/read-only only |
| required pre-edit evidence | `pwd`, `git status --short --branch`, `git branch --show-current`, `git rev-parse HEAD`, open PR audit and no-merged branch audit |

## 并发派发证据

M5R-08 is last and serial. This worker is the only writer for this spec/branch/worktree. The touch list is docs/test only and has no overlap with DB schema, migrations, generated client, runtime source, lockfile, shared config, CI/guard scripts, production deploy files or release gates. No parallel M5R worker may update `docs/evidence/M5R/README.md` or `docs/evidence/M5/README.md` while this closeout is active.

## 事故与 closeout 记录

Known M5R incident records before this PR:

- `docs/incidents/INC-2026-06-24-m5r-00-root-main-worktree-pollution.md`.
- `docs/incidents/INC-2026-06-25-m5r-04-root-readme-pollution.md`.
- `docs/incidents/INC-2026-06-25-m5r-06-root-patch-target.md`.

If any M5R-08 write lands outside the assigned worktree, on the wrong branch, in root/main, or includes secret/customer-data boundary risk, stop and create or reference `docs/incidents/` before continuing.

## 实施步骤

1. Record start audit and prior-slice boundary summary.
2. Add `scripts/tests/m5r-true-integration-closeout.test.mjs` that reuses existing M5R true DB wrapper functions in one closeout chain.
3. Make the closeout runner return `blocked_missing_env` without executing true DB wrappers when `UZMAX_RLS_DATABASE_URL` is absent.
4. When `UZMAX_RLS_DATABASE_URL` is present, run the existing wrappers in this order: distill health/candidates, confirmation queue persistence, formal write, logs/analytics readback, template copy independence, AI emergency/recovery.
5. Create this spec and `docs/evidence/M5R/M5R-08-true-integration-closeout.md`.
6. Update `docs/evidence/M5R/README.md`: mark M5R-07 no longer active, add M5R-08 closeout status, and keep true DB missing-env status honest.
7. Update `docs/evidence/M5/README.md`: move M5 from M5-08 docs-only closeout-ready wording to runtime-evidence-ready for owner review, still `not_owner_accepted`, not production/GA/release, and true DB closeout blocked if env is missing.
8. Run and record validation.

## 通过条件

- M5R-08 spec contains all required fields from `docs/specs/README.md`.
- New test links existing M5R runtime wrappers and does not introduce production source/runtime logic.
- Missing `UZMAX_RLS_DATABASE_URL` produces explicit `blocked_missing_env` before DB runner execution.
- If `UZMAX_RLS_DATABASE_URL` is available, closeout runner executes the existing M5R true DB wrappers and reports `passed_true_db` only after they pass.
- Evidence links distill candidate/health, confirmation persistence, owner confirm/conflict diff, formal write, audit/log readback, analytics board, independent template copy, AI emergency/recovery, tenant/RLS evidence from M5R-01..06 and admin runtime wiring from M5R-07.
- M5R README marks M5R-07 completed/not active and M5R-08 as final closeout.
- M5 README status becomes runtime-evidence-ready for owner review while still `not_owner_accepted` and not production/GA/release.
- Required validation passes or failures are honestly recorded.
- No source/runtime/schema/migration/config/lock/generated/production deploy changes.

## 失败分支

- If worktree path, branch or HEAD differs from expected: stop and report.
- If prior M5R evidence is missing or contradicts runtime boundaries: record the contradiction and do not mark runtime-evidence-ready.
- If the closeout requires schema/migration/API/admin/runtime source/worker/cron/config/lockfile/CI/guard changes: stop and split to a future spec instead of widening M5R-08.
- If `UZMAX_RLS_DATABASE_URL` is absent: record true DB closeout as `blocked_missing_env`; do not fake a true DB pass.
- If any true DB wrapper fails after env is present: record the failing wrapper and do not report `passed_true_db`.
- If wording implies owner acceptance, production readiness, GA-0 opening, external SaaS onboarding, real customer/order-data approval, customer LLM approval or 1.0 release approval: correct it before merge.
- If raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets appear: stop, clean up and create or reference incident evidence before continuing.

## 不做什么

- No Prisma schema, migration, RLS policy, generated client, lockfile, shared config, CI/guard, production/deploy, API/admin/worker/cron/runtime source or source package changes.
- No new product surface, broad BI, UI redesign, M6 release hardening, production Redis/worker deployment, production deploy, GA-0 or 1.0 release path.
- No real customer/order data, raw messages, screenshots, voice, Telegram payloads, exports, real LLM/provider calls, LLM keys, external SaaS onboarding or production credentials.
- No owner acceptance claim.
- No test weakening, `.skip`, `.only`, `xit`, `xfail`, deleted coverage, widened mocks or snapshot expansion.

## 验收映射

| Item | M5R-08 status | Evidence |
|---|---|---|
| A-03 | `runtime_evidence_ready_true_db_blocked_missing_env_not_owner_accepted` | M5R-06 proves independent tenant-owned template copy path; M5R-08 links the wrapper in the final chain. |
| H-01 | `limited_formal_write_runtime_evidence_ready_not_full_h01_closed` | M5R-02 proves the named config-version formal write path only; full knowledge/resource authoring remains future scoped. |
| H-02 | `confirmation_to_formal_write_runtime_evidence_ready` | M5R-01 persists confirmation decisions; M5R-02 writes only approved/edited decisions. |
| H-03 | `conflict_diff_to_formal_write_runtime_evidence_ready` | M5R-01/M5R-02 preserve conflict diff requirement before formal write. |
| H-04 | `template_copy_runtime_evidence_ready` | M5R-06 proves copy-to-tenant independent version path. |
| H-06 | `template_kind_runtime_evidence_ready_not_full_quick_reply_closed` | M5R-06 includes quick-reply/config-style template copy proof; full quick-reply library workflows remain future. |
| H-07 | `distill_health_runtime_evidence_ready` | M5R-03 proves cap, health persistence, downshift, owner alert/audit draft and manual recovery wrapper. |
| I-02 | `mobile_runtime_wiring_evidence_ready` | M5R-04 proves emergency runtime path; M5R-07 proves 320px admin API wiring. |
| I-06 | `logs_analytics_runtime_evidence_ready` | M5R-05 proves fixed board/log/export draft runtime path; M5R-07 wires admin API mode. |
| I-07 | `ai_audit_logs_runtime_evidence_ready` | M5R-04/M5R-05 prove AI state/audit and login/presence/operation log readback paths. |
| J-05 | `m5_runtime_evidence_ready_for_owner_review_not_owner_accepted` | M5R-08 updates evidence status only; owner acceptance and release decisions remain future owner decisions. |
| K-03 | `active` | One spec / one PR; this PR implements only M5R-08. |
| K-04 | `active` | M5R-08 is final serial closeout with docs/test-only touch list. |

M5R-08 closes no production acceptance item. It provides final runtime-evidence closeout for owner review and preserves missing true DB env as an explicit blocker to live true DB execution.
