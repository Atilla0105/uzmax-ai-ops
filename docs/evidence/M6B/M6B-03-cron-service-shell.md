# M6B-03 Cron Service Shell Evidence

> evidence_id: M6B-03-cron-service-shell
> milestone: M6B
> acceptance_items: J-01, J-02, J-04, K-03, K-04, L-01, L-02
> owner: project owner owns staging/production cron env, deploy targets, real customer/order data, customer LLM/provider calls, GA-0, P1/P2 decisions and 1.0 release; AI agents own implementation, review and evidence honesty
> status: ready_for_review
> created_at: 2026-06-26
> updated_at: 2026-06-26
> source_files: `AGENTS.md`, `docs/specs/README.md`, `docs/specs/M6B-00-ga0-runtime-bring-up-contract.md`, `docs/specs/M6B-01-api-production-artifact.md`, `docs/specs/M6B-02-worker-service-shell.md`, `docs/specs/M6B-03-cron-service-shell.md`, `docs/evidence/M6/README.md`, `docs/evidence/M6/M6-02-runtime-deploy-baseline.md`, `docs/evidence/M6B/README.md`, `docs/evidence/M6B/M6B-01-api-production-artifact.md`, `docs/evidence/M6B/M6B-02-worker-service-shell.md`, `docs/incidents/INC-2026-06-26-m6b-03-root-worktree-write.md`, `apps/cron/package.json`, `apps/cron/tsconfig.build.json`, `apps/cron/src/main.ts`, `apps/cron/src/distill-scheduler.ts`, `apps/cron/src/cron-service-shell.ts`, `apps/cron/scripts/run-m6b-cron-artifact-smoke.mjs`, `apps/worker/src/distill-runtime.ts`, `apps/worker/src/distill-runtime-contracts.ts`, `scripts/tests/m6-runtime-deploy-baseline.test.mjs`, `package.json`, `render.yaml`
> sensitive_data_location: none; this file contains no customer/order/message/provider secret material
> redaction_status: no raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys, Bot tokens, webhook secrets or DB URLs
> review_notes: M6B-03 proves a local emitted-artifact one-shot cron shell and daily idempotency guard; it does not approve staging, production, true DB/RLS, Telegram runtime, GA-0 or 1.0
> signoff: pending owner review of this M6B-03 PR

## Summary

M6B-03 replaces the cron M0 placeholder with an emitted-artifact one-shot cron service shell.

Current status:

`m6b_03_cron_service_shell_ready_for_review_one_shot_idempotent_not_ga0`

This is not GA-0, production, customer traffic, true DB/RLS closure, staging deploy, real deploy/rollback evidence or 1.0 release approval.

## Start Audit

Recorded at M6B-03 entry on 2026-06-26.

| Fact | Evidence |
|---|---|
| assigned worktree `pwd` | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m6b-03-cron-service-shell` |
| assigned `git status --short --branch` before edits | `## codex/m6b-03-cron-service-shell...origin/main` |
| assigned branch | `codex/m6b-03-cron-service-shell` |
| assigned `HEAD` | `222a0902cc154e310b7729dd7fa4e0d737d4ef49` |
| assigned `origin/main` | `222a0902cc154e310b7729dd7fa4e0d737d4ef49` |
| root/main checkout | `/Users/atilla/Applications/UZMAX智能运营` |
| root/main status before edits | `## main...origin/main` |
| root no-merged branch audit before edits | no output |
| open PR audit before edits | GitHub connector returned `[]`; local `gh` unavailable in this shell |

## Implementation

| Area | Change | Evidence |
|---|---|---|
| root cron build | `package.json` `build:cron` now delegates to the cron workspace build. | `npm run build:cron` invokes `npm --workspace @uzmax/cron run build`. |
| cron build | `apps/cron/package.json` `build` cleans `apps/cron/dist` and runs `tsc -p tsconfig.build.json`. | Emits JavaScript artifact instead of `--noEmit`. |
| cron start | `apps/cron/package.json` `start` now runs `node dist/apps/cron/src/main.js`. | No `node -e` placeholder and no runtime TypeScript compiler. |
| TypeScript emit | `apps/cron/tsconfig.build.json` emits cron-owned source plus the existing distill runtime and DB helper imports with relative `.js` rewrites. | Emitted cron files contain runnable JavaScript under `apps/cron/dist`. |
| service shell | `apps/cron/src/cron-service-shell.ts` reads a controlled distill payload, creates the existing distill daily health job plan, checks daily idempotency, runs one daily unit, logs structured JSON and exits. | RLS mode uses existing Prisma/RLS helpers; artifact smoke mode is explicitly file-backed local evidence only. |
| runtime smoke | `apps/cron/scripts/run-m6b-cron-artifact-smoke.mjs` starts `npm --workspace @uzmax/cron run start` three times: complete, same-day skip and missing-payload failure. | Smoke output below. |
| M6 drift guard | `scripts/tests/m6-runtime-deploy-baseline.test.mjs` and M6 baseline evidence now reflect that M6B-03 closes the cron placeholder while real deploy/rollback blockers remain open. | Focused baseline test is part of validation. |

## Artifact Evidence

| Item | Evidence |
|---|---|
| Build command | `pnpm dlx npm@11.9.0 run build:cron` in local shell; this executes repo script `npm --workspace @uzmax/cron run build`. |
| Result | exit 0 |
| Artifact root | `apps/cron/dist` |
| Artifact count | `find apps/cron/dist -maxdepth 6 -type f` returned `12` files. |
| Cron entrypoint | `apps/cron/dist/apps/cron/src/main.js` |
| Import rewrite check | emitted cron files contain `.js` relative imports and `rg` found no `runtime-compiler` or placeholder `node -e` reference in emitted cron entry/runtime files. |

Local tooling note: this shell exposes bundled Node and pnpm but not a direct `npm` binary. Local validation used `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH /Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/pnpm dlx npm@11.9.0 ...` to execute npm 11.9.0 scripts without changing `package-lock.json` or adding dependencies.

## One-Shot Runtime Smoke Evidence

Command:

```bash
PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH pnpm dlx npm@11.9.0 --workspace @uzmax/cron run smoke:m6b-artifact
```

Result: exit 0.

Observed sanitized output:

```json
{"completedDistillRuns":1,"dailyRunKeys":1,"event":"m6b_03_cron_artifact_smoke","failureExitCode":1,"firstExitCode":0,"secondExitCode":0,"startCommand":"npm --workspace @uzmax/cron run start","status":"pass"}
```

Interpretation:

- Cron artifact process booted through `npm --workspace @uzmax/cron run start`.
- First invocation completed one distill daily health unit and exited `0`.
- Second invocation used the same org/tenant/business date and skipped with exit `0`; the file-backed state still contained one daily run.
- Missing payload invocation exited non-zero and emitted structured failure evidence.
- The smoke cleaned its temporary file-backed state directory after validation.

## DB/RLS Smoke Status

Local artifact smoke uses `UZMAX_CRON_DISTILL_PERSISTENCE_MODE=artifact_smoke_file`. This mode is intentionally local, file-backed and not true DB/RLS evidence.

`UZMAX_RLS_DATABASE_URL` is absent in this worker environment, so M6B-03 does not claim a local true DB/RLS pass. RLS Prisma gateway mode remains fail-closed through existing DB runtime helpers when the env is missing.

## Incident

`docs/incidents/INC-2026-06-26-m6b-03-root-worktree-write.md` records an initial tool-targeting error where the first M6B-03 patch landed on root/main. The diff was moved into the assigned worktree and root/main was restored clean before validation. No commit, push, PR, deploy, secret, customer/order data, generated artifact, DB schema change or migration occurred from root/main.

## PR Hygiene

| Category | Current diff |
|---|---|
| Docs | `docs/specs/M6B-03-cron-service-shell.md`, `docs/incidents/INC-2026-06-26-m6b-03-root-worktree-write.md`, `docs/evidence/M6/README.md`, `docs/evidence/M6/M6-02-runtime-deploy-baseline.md`, `docs/evidence/M6B/README.md`, `docs/evidence/M6B/M6B-03-cron-service-shell.md` |
| Source | `apps/cron/src/main.ts`, `apps/cron/src/cron-service-shell.ts`, `apps/cron/scripts/run-m6b-cron-artifact-smoke.mjs` |
| Test support | `scripts/tests/m6-runtime-deploy-baseline.test.mjs` |
| Config | `package.json`, `apps/cron/package.json`, `apps/cron/tsconfig.build.json` |
| Changed source files | 3 of budget <= 3 |
| New source files | 2 of budget <= 2 |
| Net source LOC | +516 of budget <= 520 |
| Test weakening | none; no test deletion, `.skip`, `.only`, `xit` or `xfail` |
| Generated/lock/migration/CI/API/admin/db/schema changes | none committed |
| External dependency | none added; no lockfile change |

## Validation

Recorded on 2026-06-26 from the assigned worktree unless noted.

| Command | Result | Notes |
|---|---|---|
| `pnpm dlx npm@11.9.0 ci` | pass | Installed isolated dependencies in the assigned worktree after setting bundled Node/PATH; no lockfile change. |
| `pnpm dlx npm@11.9.0 run build:cron` | pass | Emits cron artifact through npm scripts; local npm fallback noted above. |
| `pnpm dlx npm@11.9.0 --workspace @uzmax/cron run smoke:m6b-artifact` | pass | First artifact invocation completed; repeated same-day invocation skipped; missing payload exited non-zero. |
| `node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json` | pass | Full repo typecheck. |
| `node node_modules/eslint/bin/eslint.js apps/cron/src/main.ts apps/cron/src/cron-service-shell.ts apps/cron/scripts/run-m6b-cron-artifact-smoke.mjs scripts/tests/m6-runtime-deploy-baseline.test.mjs` | pass | Focused lint for touched source/test support after reducing shell complexity. |
| full repo ESLint command from `package.json` | pass | `pnpm dlx npm@11.9.0 run lint` completed with no errors. |
| `node --test scripts/tests/m6-runtime-deploy-baseline.test.mjs scripts/tests/m5r-distill-scheduler-health-runtime.test.mjs scripts/tests/m5-distill-guardrails.test.mjs` | pass | 12/12 focused M6 baseline, M5R distill runtime and M5 distill guardrail tests passed. |
| `pnpm dlx npm@11.9.0 run test` | pass | 447/447 tests passed. |
| `pnpm dlx npm@11.9.0 run build` | pass | API artifact, worker artifact, cron artifact and admin Vite build completed. |
| `node node_modules/dependency-cruiser/bin/dependency-cruise.mjs apps packages --config dependency-cruiser.config.cjs` | pass | `no dependency violations found`. |
| `node node_modules/knip/bin/knip.js -c package.json#knip --no-progress --duration --no-config-hints --no-tag-hints` | pass | New cron shell/smoke entries are reachable. |
| `node node_modules/jscpd/run-jscpd.js apps packages scripts --config jscpd.config.json --workers 1 --no-tips` | pass | `Found 0 clones`. |
| `node scripts/guards/doc-trigger-paths.mjs` | pass | `doc-trigger-paths: ok`. |
| `node scripts/guards/eval-trigger-paths.mjs --base origin/main` | pass | `no eval-triggering paths changed`. |
| `node scripts/guards/forbidden-terms.mjs` | pass | `forbidden-terms: ok`. |
| `node scripts/guards/workspace-isolation.mjs` | pass | Linked worktree on `codex/m6b-03-cron-service-shell`; dirty allowed before commit. |
| `node scripts/guards/worker-write-boundary.mjs --assigned /Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m6b-03-cron-service-shell --root /Users/atilla/Applications/UZMAX智能运营` | pass | Assigned worktree boundary check passed after the root/main incident cleanup. |
| `node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M6B-03-cron-service-shell.md` | pass | Post-commit diff: changed files 13; categories config 3, source 3, docs 6, test 1; source changed files 3, net LOC +516, new files 2. |
| root/main `git status --short --branch` | pass | `## main...origin/main`; confirms incident cleanup. |

## Boundaries

M6B-03 does not approve:

- true DB/RLS distill runtime pass in this local environment;
- M6B-04 staging deploy;
- M6B-05a/M6B-05b conversation runtime;
- real Render cron deployment or rollback;
- real customer/order data;
- customer LLM or real provider calls;
- real Telegram Bot token/webhook secret, Telegram Business auto-reply or outbound Bot send;
- DB schema, migrations, generated client or RLS policy changes;
- GA-0 opening, P1/P2 owner decision or 1.0 release.
