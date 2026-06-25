# M5R-08 True Integration Closeout Evidence

## Start Audit

Recorded before edits from the assigned worktree on 2026-06-25.

| Fact | Evidence |
|---|---|
| assigned worktree `pwd` | `/private/tmp/uzmax-m5r-08-true-integration-closeout` |
| assigned `git status --short --branch` | `## codex/m5r-08-true-integration-closeout` |
| assigned `git branch --show-current` | `codex/m5r-08-true-integration-closeout` |
| worker `HEAD` | `255901b22afec0c3c87f078a57c46051065a38a0` |
| expected base HEAD | `255901b22afec0c3c87f078a57c46051065a38a0` |
| open PR audit | `gh pr list --state open --json number,headRefName,title,url,isDraft` returned `[]` |
| no-merged branch audit | `git branch --no-merged main` returned no branch output |
| branch/path mismatch | none found |

## Scope

M5R-08 is the final serial runtime closeout record. It adds a focused Node closeout test that aggregates existing M5R true DB wrappers and updates M5/M5R evidence wording.

The initial local worker recorded missing-env fail-closed behavior because `UZMAX_RLS_DATABASE_URL` was absent. The M5R-08 true DB CI follow-up runs the same closeout test in GitHub Actions with the existing masked repo secret and will record `passed_true_db` only after the wrapper chain passes. It does not approve owner acceptance, production, GA-0, 1.0 release, real customer/order data, real LLM/provider calls, external SaaS onboarding, production Redis/worker deployment or M6 release hardening.

## Prior Runtime Boundary Chain

| Slice | Runtime boundary linked by M5R-08 |
|---|---|
| M5R-01 Confirmation Queue Persistence | Persists confirmation queue decisions in `confirmation_item`; true DB wrapper `runM5rConfirmationQueueTrueDbSmoke`; CI closeout status pending. |
| M5R-02 Formal Write Pipeline | Writes only approved/edited decisions to named `config_version` + `audit_log`; pending/discarded/blocked do not write; true DB wrapper `runM5rFormalWriteTrueDbSmoke`; CI closeout status pending. |
| M5R-03 Distill Scheduler + Health Runtime | Persists capped distill run/candidates/health/downshift/manual recovery evidence; true DB wrapper `runM5rDistillSchedulerHealthTrueDbSmoke`; CI closeout status pending. |
| M5R-04 AI Member Runtime Control | Persists AI emergency stop/recovery/toggle and audit behavior; true DB support runner `runM5rAiMemberRuntimeTrueDbSmoke`; CI closeout status pending. |
| M5R-05 Logs + Analytics Runtime | Persists login/presence/operation readback, fixed board and controlled export draft path; true DB wrapper `runM5rLogsAnalyticsTrueDbSmoke`; CI closeout status pending. |
| M5R-06 Template Copy Runtime | Copies controlled group template refs into independent tenant-owned `config_version` rows with audit; true DB wrapper `runM5rTemplateCopyTrueDbSmoke`; CI closeout status pending. |
| M5R-07 Admin Runtime Wiring | Wires admin shells to API runtime mode and 320px confirmation/AI emergency paths; direct DB smoke omitted because DB/RLS writes are owned by M5R-01/04/05/06. |

## Closeout Test

`scripts/tests/m5r-true-integration-closeout.test.mjs` exports `runM5rTrueIntegrationCloseout()` and reuses existing wrappers in this order:

1. `runM5rDistillSchedulerHealthTrueDbSmoke`
2. `runM5rConfirmationQueueTrueDbSmoke`
3. `runM5rFormalWriteTrueDbSmoke`
4. `runM5rLogsAnalyticsTrueDbSmoke`
5. `runM5rTemplateCopyTrueDbSmoke`
6. `runM5rAiMemberRuntimeTrueDbSmoke`

When `UZMAX_RLS_DATABASE_URL` is absent, the closeout runner first resolves every wrapper module/export without invoking the wrapper functions. It then returns:

`status=blocked_missing_env`, `trueDbStatus=blocked_missing_env`, `blocker=UZMAX_RLS_DATABASE_URL is required`, `executedSteps=[]`.

This is intentional fail-closed evidence. It does not fake a true DB pass and does not call any wrapper before the env check.

When `UZMAX_RLS_DATABASE_URL` is present, the same closeout runner executes the wrappers above and may report `passed_true_db` only after all wrappers pass.

## Acceptance Chain

| Chain step | Evidence link |
|---|---|
| distill generates candidate(s) and health/downshift evidence | M5R-03 runtime and `runM5rDistillSchedulerHealthTrueDbSmoke`. |
| confirmation queue persistence path is present | M5R-01 runtime and `runM5rConfirmationQueueTrueDbSmoke`. |
| owner confirm/conflict diff path exists | M5R-01/M5R-02 conflict diff enforcement and confirmation decision path. |
| formal write commits approved/edited and not pending/discarded/blocked | M5R-02 formal write runtime and `runM5rFormalWriteTrueDbSmoke`. |
| audit/log readback and analytics board path exists | M5R-05 logs analytics runtime and M5R-07 admin API wiring. |
| template copy creates independent tenant version path | M5R-06 template copy runtime and `runM5rTemplateCopyTrueDbSmoke`. |
| AI emergency stop/recovery runtime path exists | M5R-04 runtime and M5R-07 admin mobile/API wiring. |
| tenant/RLS evidence is linked | M5R-01/02/03/04/05/06 true DB wrappers and missing-env statuses are linked above. |
| admin runtime wiring is linked | M5R-07 Playwright/API-mode evidence is linked above. |

## True DB/RLS Closeout Status

Current CI true DB closeout status: `pending_secret_backed_ci`.

The local worker environment still does not print or store `UZMAX_RLS_DATABASE_URL`; local missing-env tests continue to prove fail-closed behavior. GitHub Actions reads the existing masked `UZMAX_RLS_DATABASE_URL` repo secret through a step-local base env in the `M5R true integration closeout` step, checks that it is non-empty, and only then exports the pooled URL for the test process. With that env present, `scripts/tests/m5r-true-integration-closeout.test.mjs` executes all six existing M5R true DB wrappers and returns `passed_true_db` only after they pass. This evidence will be updated with the run/job after CI proves that path.

The true DB closeout command is:

`node --test scripts/tests/m5r-true-integration-closeout.test.mjs`

The test executes the existing wrapper chain and reports failure if any wrapper fails. Secret values are not printed or committed.

## Validation

Recorded from `/private/tmp/uzmax-m5r-08-true-db-ci-closeout` on 2026-06-25.

| Command | Result | Notes |
|---|---|---|
| `npm ci` | pass | Installed locked dependencies in the assigned worktree; 360 packages, 0 vulnerabilities. |
| `node --test scripts/tests/m5r-true-integration-closeout.test.mjs` | pass | 6/6 tests passed; local true DB closeout status is `blocked_missing_env` because `UZMAX_RLS_DATABASE_URL` is absent; wrapper modules/exports resolved without wrapper execution. |
| `node --test scripts/tests/m5r-true-integration-closeout.test.mjs scripts/tests/m5r-admin-runtime-wiring.test.mjs` | pass | Focused M5R closeout/admin status subset passed: 9/9 tests. |
| `npm run format:check` | pass | Prettier reported all matched files use Prettier code style after formatting the new test. |
| `npm run lint` | pass | ESLint completed across apps, packages and scripts. |
| `npm run typecheck` | pass | TypeScript no-emit check passed. |
| `npm run knip` | pass | No unused export/dependency findings reported. |
| `npm run test` | pass | Full Node suite passed: 396/396 tests across 78 suites. |
| `git diff --check` | pass | No whitespace errors. |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M5R-08-true-db-ci-closeout.md --include-worktree` | pass | No PR existed yet for this branch; guard reported 8 changed files, categories config=1/docs=5/test=2, source changed files 0, net source LOC 0 and new source files 0. |
| GitHub Actions `M5R true integration closeout` | pending | Secret-backed CI step runs `node --test scripts/tests/m5r-true-integration-closeout.test.mjs` with masked `UZMAX_RLS_DATABASE_URL`; final run/job will be recorded in this evidence before merge. |

## No Sensitive Data Statement

M5R-08 uses only synthetic labels, controlled refs, wrapper names and structured statuses. It adds no raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets.

## Boundary

M5R-08 does not approve:

- M5/M5R owner acceptance;
- production readiness;
- GA-0 opening;
- 1.0 release;
- real customer traffic/data;
- real order data;
- customer LLM or real LLM/provider calls;
- production Redis/worker/cron deployment;
- external SaaS onboarding;
- M6 release hardening;
- full H-01 knowledge/resource authoring;
- full quick-reply CRUD/search/import/export permission closure.

## Closeout Status

M5 is now recorded as `m5_runtime_evidence_pending_secret_backed_ci_closeout_not_owner_accepted`.

M5R-08 is now recorded as `m5r_08_true_integration_closeout_pending_secret_backed_ci_not_owner_accepted`.

These are AI evidence statuses only. They record the wrapper index and pending CI true DB/RLS closeout for owner review. They do not claim owner acceptance, production/GA/release approval, real customer/order data approval, real LLM/provider approval or external SaaS onboarding approval.
