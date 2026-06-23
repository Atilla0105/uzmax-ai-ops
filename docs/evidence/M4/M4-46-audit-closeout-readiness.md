# M4-46 Audit Closeout Readiness Evidence

> spec: `docs/specs/M4-46-audit-closeout-readiness.md`
> branch: `codex/m4-46-audit-closeout-readiness`
> worker checkout: `/Users/atilla/Documents/uzmax-m4-46-audit-closeout-readiness-linked`
> status: local validation passed; PR CI passed for code head `5a31c8c`; current-head PR checks must be green before merge

## Scope

M4-46 clears the security blocker intentionally left by M4-45. The fix is a bounded npm nested override:

```json
{
  "overrides": {
    "@nestjs/platform-express": {
      "multer": "2.2.0"
    }
  }
}
```

`@nestjs/platform-express@11.1.27` still declares `multer: 2.1.1`; the root override changes the resolved package to `node_modules/multer@2.2.0`. This keeps the Nest package version stable and avoids a major downgrade or framework migration.

This evidence does not approve production Redis/worker deployment, formal alert routing, real customer/order data, production eval gates, GA-0, 1.0 release or owner final release signoff.

Current readiness token after local audit validation: `m4_ready_for_owner_closeout_review`.

## Audit Before / After

| Check | Result |
|---|---|
| M4-45 baseline `npm audit --json` | exit `1`; high `3`; names `@nestjs/core`, `@nestjs/platform-express`, `multer`; root cause `multer <2.2.0` through `@nestjs/platform-express@11.1.27` |
| Simple override probe | `overrides.multer=2.2.0` did not change the existing lockfile resolution and still reported high `3` |
| Nested override probe | clean lock resolution with `overrides.@nestjs/platform-express.multer=2.2.0` resolved `node_modules/multer` to `2.2.0` and reported high `0`, total `0` |
| Worker linked worktree validation | `npm ci` installed 360 packages and found 0 vulnerabilities; `npm audit --json` exits `0`; high `0`, total `0` |

## Lockfile Notes

The final lockfile is intentionally minimal. Compared with `origin/main`, only `node_modules/multer` changes version/resolved/integrity from `2.1.1` to `2.2.0`. A JSON comparison found version changes `1`, dependency-map changes `0`, added packages `0` and removed packages `0`. No app/source runtime files are changed.

Read-only reviewers flagged the earlier regenerated lockfile as a P1 blocker because it drifted 91 unrelated package versions. That lockfile was not kept. The final diff reverts the unrelated drift and keeps only the `multer` resolution change above.

## Validation

| Command / Check | Result |
|---|---|
| `npm ci` | passed in final linked worktree; installed 360 packages and found 0 vulnerabilities |
| `npm audit --json` | passed; high `0`, total `0` |
| `node --test scripts/tests/m4-audit-closeout-readiness.test.mjs` | passed; 3 tests, 0 failures |
| Focused M4 tests | passed; 26 tests, 0 failures |
| `npm run format:check` | passed |
| `npm run typecheck` | passed |
| `npm run lint` | passed |
| `npm run depcruise` | passed; 0 dependency violations, 99 modules |
| `npm run jscpd` | passed; 0 clones |
| `npm run knip` | passed |
| `npm run guard:forbidden-terms` | passed |
| `npm run guard:eval-triggers` | passed; no eval-triggering paths changed |
| `npm run guard:doc-triggers` | passed |
| `npm run guard:workspace` | passed; linked worktree clean |
| `UZMAX_ASSIGNED_WORKTREE=/Users/atilla/Documents/uzmax-m4-46-audit-closeout-readiness-linked UZMAX_PRIMARY_ROOT=/Users/atilla/Documents/uzmax-m4-46-audit-closeout-readiness-clone npm run guard:worker-boundary` | passed |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M4-46-audit-closeout-readiness.md` | passed; changed files `8`, source changed files `0`, source net LOC `0`, source new files `0` |
| Lockfile drift check | passed; only `node_modules/multer` changed from `2.1.1` to `2.2.0`; dependency-map changes `0`, added packages `0`, removed packages `0` |
| `git diff --check` | passed |
| `npm test` | passed; 324 tests, 0 failures |
| `npm run build` | passed; API/worker/cron type builds and Admin Vite build completed |
| PR CI `28060635725` / job `83073716871` | passed on head `5a31c8c35ee13dbd042c04d8dab805772234218c` in 11m37s; Redis smoke, format/typecheck/lint/guards, `guard:pr-shape`, Prisma generate, true DB runtime smokes, SPK-03, SPK-04, tests and build all passed |

## Boundary Notes

- No business source file is changed.
- No DB schema, migration, generated client, API runtime, Admin UI, worker queue runtime, order-read eval behavior or external connector is changed.
- No raw CSV/XLSX/export/jsonl, real order/customer data, phone number, address, payment data, screenshot, credential, token value or env file is committed.
- The formal root `.git/worktrees` metadata in the main checkout hung during `git worktree add`/`git worktree prune`; this slice used a fresh isolated clone as a temporary fallback, then created the final linked worker worktree from that clone. The repo metadata repair remains separate from this security fix.

## Acceptance Mapping

| Item | Status | Notes |
|---|---|---|
| E-02 | `order_import_queue_runtime_supported_for_m4_no_api_branch` | No behavior change; M4-45 queue runtime evidence remains intact. |
| E-03 | `order_import_stale_missing_warning_closed_for_m4_no_api_branch` | No behavior change; stale/missing handoff remains from M4-42/M4-44. |
| E-04 | `order_read_runtime_eval_gate_supported_not_production_gate` | No behavior change; M4-44 runtime-to-eval bridge remains intact. |
| I-01 | `m4_desktop_paths_ready_for_owner_closeout_review_not_release` | Audit high no longer blocks M4 readiness review; formal production auth and broader release remain future scope. |
| J-02 | `queue_security_closeout_supported_not_production_deployment` | npm audit high blocker is cleared by bounded nested override; production worker/Redis deployment and formal alert routing remain future scope. |
