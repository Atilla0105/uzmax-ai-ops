# M5R-08 True DB CI Closeout

## 目标

Use the existing GitHub Actions `UZMAX_RLS_DATABASE_URL` secret to execute the already-merged M5R-08 true integration closeout runner, then update M5/M5R evidence from missing-env blocker to runtime-evidence-ready for owner review if the secret-backed CI smoke passes.

This does not expand product scope. It only closes the final M5R true DB/RLS evidence gap that remained because the local worker shell did not have `UZMAX_RLS_DATABASE_URL`.

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner: decide whether to owner-accept M5/M5R evidence later, whether to proceed to production/GA/release, and any real account, real customer/order-data, customer LLM, provider cost, compliance or external SaaS onboarding decision.

AI agent: implement only this CI/evidence follow-up in the assigned worktree/branch, keep secret values out of logs/docs, reuse the existing M5R-08 closeout runner, record CI evidence honestly, and preserve not-owner-accepted / not-production / not-release boundaries.

## 时间盒

0.25 个工作日. If the true DB closeout requires schema/migration/API/admin/runtime source/worker/cron changes, production deployment, real customer/order data, real LLM/provider calls, external services beyond the existing repo GitHub Actions secret, lockfile changes or M6 release hardening, stop and report instead of widening this PR.

## Spec 类型

infra

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `.github/workflows/ci.yml`
  - `docs/specs/M5R-08-true-db-ci-closeout.md`
  - `docs/specs/M5R-08-true-integration-closeout.md`
  - `docs/evidence/M5R/M5R-08-true-integration-closeout.md`
  - `docs/evidence/M5R/README.md`
  - `docs/evidence/M5/README.md`
  - `scripts/tests/m5r-admin-runtime-wiring.test.mjs`
  - `scripts/tests/m5r-true-integration-closeout.test.mjs`
- 说明/备注：
  - This slice may read prior M5R specs/evidence and existing M5R true DB wrappers.
  - It may modify CI only to run the existing M5R-08 closeout test with the existing GitHub Actions secret.
  - It may apply existing, already-merged SQL migrations `packages/db/migrations/0007_m5_operations_contracts_foundation.sql` and `packages/db/migrations/0008_m5r05_logs_analytics_runtime.sql` to the configured dev smoke DB before the closeout. It must not edit or add migration files in this PR.
  - M5R docs/tests use a separate CI path flag and must not newly trigger the existing M4 true DB smoke group. M4 true DB smoke triggers remain scoped to API/worker/DB/M4 smoke paths, package manifests and lockfile.
  - It must not modify `apps/**`, `packages/**`, Prisma schema/migrations/generated client, lockfile, production/deploy files, Playwright tests or runtime source.
  - Root/main checkout `/Users/atilla/Documents/UZMAX智能运营` is coordination/read-only only.

## 变更预算与路径分类

- source budget target: changed source files <= 0, net source LOC <= 0, new source files <= 0.
- config: `.github/workflows/ci.yml`.
- docs: this spec, M5R-08 spec/evidence, M5R README and M5 README.
- test: M5R-08 closeout and M5R-07 README-status assertions only.
- source/generated/lock/schema/migration/API/admin source/worker/cron/distill/ops-assets/evals/provider/adapter/runtime source: none.
- New source/test `rg` conclusion: existing `scripts/tests/m5r-true-integration-closeout.test.mjs` already aggregates the M5R true DB wrappers and runs them when `UZMAX_RLS_DATABASE_URL` is present; no new test runner or runtime logic is needed.
- External API/SDK/provider/connector/adapter basis: none. This PR uses only the existing GitHub Actions repo secret names and existing CI workflow.
- Exceptions: none. No `large_change_exception` and no `test_weakening_exception`.

## 文档触发检查

updated

## 前置条件

- Read `AGENTS.md` completely.
- Record `pwd`, `git status --short --branch`, `git branch --show-current`, `git rev-parse HEAD`, open PR audit and no-merged branch audit.
- Read the four v1.1 source-of-truth documents enough to confirm this remains an evidence/CI closeout and not a production/release step.
- Read `docs/specs/M5R-08-true-integration-closeout.md`.
- Read `docs/evidence/M5R/M5R-08-true-integration-closeout.md`.
- Read `docs/evidence/M5R/README.md`.
- Read `docs/evidence/M5/README.md`.
- Confirm GitHub Actions has a secret named `UZMAX_RLS_DATABASE_URL` without printing its value.
- Keep M5/M5R owner status `not_owner_accepted`.

## Worktree / branch 前置条件

| Fact | Expected |
|---|---|
| worktree | `/private/tmp/uzmax-m5r-08-true-db-ci-closeout` |
| branch | `codex/m5r-08-true-db-ci-closeout` |
| base HEAD | `fe3d4bba83b19593a2166742f8dbd9d8c5c0b4c0` |
| forbidden checkout | `/Users/atilla/Documents/UZMAX智能运营` |
| root/main checkout use | coordination/read-only only |
| required pre-edit evidence | `pwd`, `git status --short --branch`, `git branch --show-current`, `git rev-parse HEAD`, open PR audit and no-merged branch audit |

## 并发派发证据

M5R-08 true DB CI closeout is serial. This worker is the only writer for this branch/spec. The touch list is CI/docs/test-only and has no overlap with DB schema, migrations, generated client, runtime source, lockfile, production deploy files or release gates. No parallel M5R worker may update M5/M5R evidence while this closeout is active.

## 事故与 closeout 记录

Known M5R incident records before this PR:

- `docs/incidents/INC-2026-06-24-m5r-00-root-main-worktree-pollution.md`.
- `docs/incidents/INC-2026-06-25-m5r-04-root-readme-pollution.md`.
- `docs/incidents/INC-2026-06-25-m5r-06-root-patch-target.md`.

If any write lands outside the assigned worktree, on the wrong branch, in root/main, or includes secret/customer-data boundary risk, stop and create or reference `docs/incidents/` before continuing.

## 实施步骤

1. Add M5R-08 files to the CI true DB smoke path classifier.
2. Add a CI step named `M5R true integration closeout` that runs `node --test scripts/tests/m5r-true-integration-closeout.test.mjs` with masked `UZMAX_RLS_DATABASE_URL`.
3. Before the closeout step, apply existing idempotent M5/M5R dev smoke migrations `0007` and `0008` with the same masked DB secret so the configured smoke DB matches the repo schema.
4. Update M5R-08 evidence and indexes to record runtime evidence ready only after the CI closeout passes.
5. Update focused tests so local missing-env behavior remains fail-closed while docs can record the CI true DB pass.
6. Run local validation and PR CI; record the final run/job after it passes.

## 通过条件

- CI injects `UZMAX_RLS_DATABASE_URL` only through GitHub Actions secrets and does not print the secret value.
- CI applies existing idempotent M5/M5R dev smoke migrations `0007` and `0008` before the M5R closeout and does not edit/add migration files.
- The `M5R true integration closeout` CI step executes the existing M5R-08 closeout runner.
- The closeout runner reports `passed_true_db` in CI only after distill, confirmation queue, formal write, logs/analytics, template copy and AI member wrappers pass.
- Local missing-env tests still prove fail-closed behavior.
- CI missing-secret behavior fails before wrapper execution instead of constructing a non-empty URL from an empty secret.
- M5R docs/tests trigger the M5R closeout flag without newly triggering the existing M4 true DB smoke flag.
- M5/M5R evidence is updated to runtime-evidence-ready for owner review, while remaining `not_owner_accepted`, not production ready, not GA/release approved and not a real customer/LLM/external SaaS approval.
- No source/runtime/schema/migration/lock/generated/production deploy changes.

## 失败分支

- If the GitHub Actions secret is missing or empty: keep M5/M5R blocked and record the missing secret without printing values.
- If applying existing dev smoke migrations fails: keep M5/M5R blocked, record the failing migration/run, and do not report `passed_true_db`.
- If any wrapper fails in CI: keep M5/M5R blocked, record the failing wrapper/run, and do not report `passed_true_db`.
- If CI changes would require broad workflow redesign or new external services: stop and split to a future infra spec.
- If wording implies owner acceptance, production readiness, GA-0 opening, 1.0 release approval, real customer/order-data approval, customer LLM approval or external SaaS onboarding: correct it before merge.
- If raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets appear: stop, clean up and create or reference incident evidence before continuing.

## 不做什么

- No Prisma schema, migration, RLS policy, generated client, lockfile, production/deploy, API/admin/worker/cron/runtime source or source package changes.
- No new product surface, broad BI, UI redesign, M6 release hardening, production Redis/worker deployment, production deploy, GA-0 or 1.0 release path.
- No real customer/order data, raw messages, screenshots, voice, Telegram payloads, exports, real LLM/provider calls, LLM keys, external SaaS onboarding or production credentials.
- No owner acceptance claim.
- No test weakening, `.skip`, `.only`, `xit`, `xfail`, deleted coverage, widened mocks or snapshot expansion.

## 验收映射

| Item | M5R-08 true DB CI status | Evidence |
|---|---|---|
| A-03 | `runtime_evidence_ready_not_owner_accepted` | M5R-06 plus M5R-08 CI closeout prove independent tenant-owned template copies before runtime-evidence-ready is recorded; not owner accepted. |
| H-01 | `limited_formal_write_runtime_evidence_ready_not_full_h01_closed` | M5R-02 named config-version path only; full H-01 remains future scoped. |
| H-02 | `confirmation_to_formal_write_runtime_evidence_ready` | M5R-01/M5R-02 and M5R-08 CI closeout prove confirmation before formal write before final ready status is recorded. |
| H-03 | `conflict_diff_to_formal_write_runtime_evidence_ready` | M5R-01/M5R-02 and M5R-08 CI closeout preserve conflict diff before write before final ready status is recorded. |
| H-04 | `template_copy_runtime_evidence_ready` | M5R-06 and M5R-08 CI closeout prove template copy runtime independence before final ready status is recorded. |
| H-06 | `template_kind_runtime_evidence_ready_not_full_quick_reply_closed` | M5R-06 includes quick-reply/config-style proof; full quick-reply workflows remain future. |
| H-07 | `distill_health_runtime_evidence_ready` | M5R-03 and M5R-08 CI closeout prove cap, health, downshift, owner alert/audit draft and manual recovery path before final ready status is recorded. |
| I-02 | `mobile_runtime_wiring_evidence_ready` | M5R-04/M5R-07 prove emergency/confirmation mobile fallback through API paths. |
| I-06 | `logs_analytics_runtime_evidence_ready` | M5R-05/M5R-07 and M5R-08 CI closeout prove fixed board/log/export draft runtime path before final ready status is recorded. |
| I-07 | `ai_audit_logs_runtime_evidence_ready` | M5R-04/M5R-05 and M5R-08 CI closeout prove AI state/audit plus log readback paths before final ready status is recorded. |
| J-05 | `m5_runtime_evidence_ready_not_owner_accepted` | M5R-08 true DB CI closeout passed final runtime evidence for owner review, not owner acceptance or release signoff. |
| K-03 | `active` | One spec / one PR; this PR implements only the CI true DB closeout follow-up. |
| K-04 | `active` | Final closeout remains serial. |
