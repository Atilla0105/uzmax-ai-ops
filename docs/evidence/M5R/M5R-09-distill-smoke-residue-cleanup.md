# M5R-09 Distill Smoke Residue Cleanup Evidence

## Status

Current status: `local_validation_passed_pr_ci_pending`.

This cleanup exists only because PR #275, the M8 active Telegram Bot answer runtime wiring, is blocked by an older M5R true DB closeout residue assertion. The failing M8 CI run proved the M8 active answer smoke itself passed before the M5R closeout step failed on synthetic residue.

## Scope

Touched files:

- `packages/db/scripts/tests/run-m5r-distill-scheduler-health-true-db-smoke.mjs`
- `docs/specs/M5R-09-distill-smoke-residue-cleanup.md`
- `docs/evidence/M5R/M5R-09-distill-smoke-residue-cleanup.md`

The cleanup keeps the existing M5R true DB runner, closeout order and runtime assertions. It only changes the M5R-03 synthetic cleanup and residue count:

- delete synthetic `distill_health_daily`, `confirmation_item`, `audit_log`, `distill_run`, `tenant` and `org` rows by the fixed M5R-03 synthetic org id;
- count residue only inside the M5R-03 synthetic org/run boundary;
- avoid failing on unrelated `distill` audit rows outside the synthetic org.

## Start Audit

| Fact | Evidence |
|---|---|
| assigned worktree `pwd` | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m5r-08-distill-smoke-residue-cleanup` |
| assigned branch | `codex/m5r-09-distill-smoke-residue-cleanup` |
| base HEAD | `53a39ca4483bcb79c0db93e0f2f710039265989e` |
| root/main checkout | `/Users/atilla/Applications/UZMAX智能运营`, clean at audit time |
| open PR audit | only PR #275, `codex/m8-03-runtime-active-answer-wiring`, blocked by CI |
| no-merged branch audit | `codex/m8-03-runtime-active-answer-wiring` before this cleanup branch |

## Validation

Recorded from `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m5r-08-distill-smoke-residue-cleanup`.

| Command | Result | Notes |
|---|---|---|
| `node --check packages/db/scripts/tests/run-m5r-distill-scheduler-health-true-db-smoke.mjs` | pass | Syntax check for the touched smoke support file. |
| `node --test scripts/tests/m5r-distill-scheduler-health-runtime.test.mjs scripts/tests/m5r-true-integration-closeout.test.mjs` | pass | 12 tests passed; local `UZMAX_RLS_DATABASE_URL` was absent, so the closeout kept fail-closed missing-env behavior. |
| `node --test scripts/tests/m5r-true-integration-closeout.test.mjs` | pass | 6 tests passed for focused closeout behavior. |
| `prettier --check docs/specs/M5R-09-distill-smoke-residue-cleanup.md docs/evidence/M5R/M5R-09-distill-smoke-residue-cleanup.md packages/db/scripts/tests/run-m5r-distill-scheduler-health-true-db-smoke.mjs` | pass | All matched files use Prettier style. |
| `node scripts/guards/doc-trigger-paths.mjs` | pass | `doc-trigger-paths: ok`. |
| `node scripts/guards/workspace-isolation.mjs` | pass | Linked worktree accepted; dirty state allowed during validation. |
| `node node_modules/eslint/bin/eslint.js packages/db/scripts/tests/run-m5r-distill-scheduler-health-true-db-smoke.mjs` | pass | Targeted lint for the touched script. |
| `node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M5R-09-distill-smoke-residue-cleanup.md --include-worktree` | pass | changedFiles=3; categories test=1/docs=2; source changedFiles=0/netLoc=0/newFiles=0. |
| `git diff --check` | pass | No whitespace errors. |

PR CI must still run the true DB closeout with the configured GitHub secret before merge.

## Boundary

M5R-09 does not approve owner acceptance, production readiness, GA-0, 1.0 release, real customer/order data, real LLM/provider calls, LLM keys, external SaaS onboarding, customer-facing Bot traffic, or any new product surface.
