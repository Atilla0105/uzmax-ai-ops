# M5R-09 Distill Smoke Residue Cleanup

## 目标

Fix the M5R distill scheduler true DB smoke cleanup so the existing M8 Bot closed-loop PR is not blocked by stale synthetic M5R residue in CI.

This slice does not reopen M5R product scope and does not add runtime capability. It only makes the already-existing M5R-03 true DB smoke delete and count its own synthetic rows by the same synthetic org/run boundaries it seeds.

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner: decide later whether to accept M5/M5R evidence, whether to merge the downstream M8 Bot closed-loop PR, and any production, real customer, real LLM key, provider cost, compliance or release decision.

AI agent: implement only this cleanup in the assigned worktree/branch, keep customer/secret data out of evidence, preserve M5/M5R `not_owner_accepted` boundaries, and use the cleanup only to unblock CI for real runtime work.

## 时间盒

0.25 个工作日. If the failure requires schema, migration, RLS policy, runtime source, CI workflow redesign, production data access, real customer/order data or real LLM/provider calls, stop and split a new spec instead of widening this cleanup.

## Spec 类型

cleanup

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M5R-09-distill-smoke-residue-cleanup.md`
  - `docs/evidence/M5R/M5R-09-distill-smoke-residue-cleanup.md`
  - `packages/db/scripts/tests/run-m5r-distill-scheduler-health-true-db-smoke.mjs`
- 说明/备注：
  - This slice may read M5R-08 specs/evidence, M5R true DB closeout tests, Prisma schema and the failing CI log.
  - It must not modify Prisma schema/migrations/generated client, app runtime source, shared CI/guard config, lockfile, production/deploy files or admin UI.

## 变更预算与路径分类

- source budget target: changed source files <= 0, net source LOC <= 0, new source files <= 0.
- test: one existing true DB smoke support file under `packages/db/scripts/tests`.
- docs: this cleanup spec and one evidence record.
- source/generated/lock/config/schema/migration/API/admin/worker/cron/runtime source/provider/adapter: none.
- New source/test `rg` conclusion: `rg -n "cleanupSyntheticRows|syntheticResidueCount|audit_log|distillRunId|deleteMany\\(|metadata" packages/db/scripts/tests scripts/tests docs/specs/M5R-*.md docs/evidence/M5R` found the existing M5R-03 smoke cleanup as the only failing location; no new runner or parallel runtime logic is needed.
- External API/SDK/provider/connector/adapter basis: none.
- Exceptions: none. No `large_change_exception` and no `test_weakening_exception`.

## 文档触发检查

updated

## 前置条件

- Read `AGENTS.md` completely.
- Record `pwd`, `git status --short --branch`, `git branch --show-current`, `git rev-parse HEAD`, open PR audit and no-merged branch audit.
- Read the four v1.1 source-of-truth documents enough to confirm this is CI/test cleanup, not production/release or product scope.
- Read `docs/specs/M5R-08-true-integration-closeout.md`.
- Read `docs/specs/M5R-08-true-db-ci-closeout.md`.
- Read `docs/evidence/M5R/README.md`.
- Read the existing M5R true DB closeout test and M5R-03 distill true DB smoke.
- Keep M5/M5R owner status `not_owner_accepted`.

## Worktree / branch 前置条件

| Fact | Expected |
|---|---|
| worktree | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m5r-08-distill-smoke-residue-cleanup` |
| branch | `codex/m5r-09-distill-smoke-residue-cleanup` |
| base HEAD | `53a39ca4483bcb79c0db93e0f2f710039265989e` |
| forbidden checkout | `/Users/atilla/Applications/UZMAX智能运营` for writes |
| root/main checkout use | coordination/read-only only |
| required pre-edit evidence | `pwd`, `git status --short --branch`, `git branch --show-current`, `git rev-parse HEAD`, open PR audit and no-merged branch audit |

## 并发派发证据

This cleanup is serial with the open M8 PR only at merge ordering. It uses a separate worktree, branch and spec. It touches no DB schema, migrations, generated client, lockfile, shared CI/guard config, runtime source or production gate.

## 事故与 closeout 记录

Known M5R incident records before this PR:

- `docs/incidents/INC-2026-06-24-m5r-00-root-main-worktree-pollution.md`.
- `docs/incidents/INC-2026-06-25-m5r-04-root-readme-pollution.md`.
- `docs/incidents/INC-2026-06-25-m5r-06-root-patch-target.md`.

If any write lands outside the assigned worktree, on the wrong branch, in root/main, or includes secret/customer-data boundary risk, stop and create or reference `docs/incidents/` before continuing.

## 实施步骤

1. Scope the failing M5R residue assertion to the M5R-03 synthetic org/run rows.
2. Explicitly delete M5R-03 synthetic `distill_health_daily`, `confirmation_item`, `audit_log`, `distill_run`, `tenant` and `org` rows instead of relying on org deletion alone.
3. Keep the existing true DB runner and closeout order unchanged.
4. Run focused local validation, PR hygiene and CI.
5. Merge this cleanup before rerunning/merging the M8 Bot closed-loop PR.

## 通过条件

- Cleanup deletes every synthetic table seeded or written by the M5R-03 distill smoke.
- Residue counting is scoped to the fixed M5R-03 synthetic org/run boundary and does not fail on unrelated `distill` audit rows.
- The smoke still proves distill candidate cap, health/downshift, owner alert, manual recovery and RLS negatives.
- M5/M5R evidence remains not owner accepted, not production ready and not release approved.
- No schema/migration/generated/runtime/CI/lockfile/production/admin UI changes.
- No test weakening, skipped tests, widened mocks or snapshot expansion.

## 失败分支

- If explicit cleanup cannot remove residue because a schema/RLS contract is wrong: stop and split a schema/RLS fix spec.
- If true DB failure exposes real customer, secret, order or prompt data: stop, clean up and create or reference an incident record.
- If CI failure is unrelated to M5R residue after this cleanup: record the new failing step and do not claim the Bot closed-loop PR is merge-ready.
- If wording implies owner acceptance, production readiness, GA-0 opening, 1.0 release approval, real customer/order-data approval, customer LLM approval or external SaaS onboarding: correct it before merge.

## 不做什么

- No Prisma schema, migration, RLS policy, generated client, lockfile, shared CI/guard config, production/deploy, API/admin/worker/cron/runtime source or source package changes.
- No new product surface, UI redesign, broad M5R rewrite, release hardening, production Redis/worker deployment, production deploy, GA-0 or 1.0 release path.
- No real customer/order data, raw messages, screenshots, voice, Telegram payloads, exports, real LLM/provider calls, LLM keys, external SaaS onboarding or production credentials.
- No owner acceptance claim.

## 验收映射

| Item | M5R-09 status | Evidence |
|---|---|---|
| H-07 | `ci_cleanup_only_no_new_runtime_scope` | Existing M5R-03 distill health smoke keeps the same runtime proof, with synthetic residue cleanup corrected. |
| J-05 | `m5r_closeout_ci_channel_preserved_not_owner_accepted` | This cleanup removes a stale residue blocker in the existing M5R true DB closeout path without changing owner acceptance or release status. |
| K-03 | `active` | One spec / one PR. |
| K-04 | `active` | Separate branch/worktree/spec from the open M8 Bot closed-loop PR. |
