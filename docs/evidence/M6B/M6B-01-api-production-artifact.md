# M6B-01 API Production Artifact Evidence

> evidence_id: M6B-01-api-production-artifact
> milestone: M6B
> acceptance_items: J-01, J-04, K-03, K-04, L-01, L-02
> owner: project owner owns staging/production infrastructure, secrets, real customer/order data, customer LLM/provider calls, GA-0, P1/P2 decisions and 1.0 release; AI agents own implementation, review and evidence honesty
> status: ready_for_review
> created_at: 2026-06-26
> updated_at: 2026-06-26
> source_files: `AGENTS.md`, `docs/specs/README.md`, `docs/evidence/M6B/README.md`, `docs/specs/M6B-00-ga0-runtime-bring-up-contract.md`, `docs/specs/M6B-01-api-production-artifact.md`, `apps/api/package.json`, `package.json`, `apps/api/tsconfig.build.json`, `apps/api/src/main.ts`, `apps/api/src/app.module.ts`, `apps/api/src/access-context.ts`, `apps/api/scripts/run-m6b-api-artifact-smoke.mjs`, `render.yaml`, `docs/evidence/M6/M6-02-runtime-deploy-baseline.md`, `docs/incidents/INC-2026-06-26-m6b-01-root-worktree-write.md`
> sensitive_data_location: none; this file contains no customer/order/message/provider secret material
> redaction_status: no raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys, Bot tokens, webhook secrets or DB URLs
> review_notes: M6B-01 proves the API artifact build/start/health/log red line locally; it does not approve staging, production, worker/cron runtime, GA-0 or 1.0
> signoff: pending owner review of this M6B-01 PR

## Summary

M6B-01 replaces the API typecheck-only build/start path with an emitted TypeScript artifact and points `@uzmax/api` start at the emitted JavaScript entrypoint.

Current status:

`m6b_01_api_artifact_ready_for_review_health_pass_readyz_fail_closed_not_ga0`

This is not GA-0, production, customer traffic, worker/cron runtime closure, real Bot webhook proof or 1.0 release approval.

## Start Audit

Recorded at M6B-01 entry on 2026-06-26.

| Fact | Evidence |
|---|---|
| assigned worktree `pwd` | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m6b-01-api-production-artifact` |
| assigned `git status --short --branch` before edits | `## codex/m6b-01-api-production-artifact...origin/main` |
| assigned branch | `codex/m6b-01-api-production-artifact` |
| assigned `HEAD` | `666fe3f5f98d38d68a8e9577dd49fa51a06f98bc` |
| assigned `origin/main` | `666fe3f5f98d38d68a8e9577dd49fa51a06f98bc` |
| root/main checkout | `/Users/atilla/Applications/UZMAX智能运营` |
| root/main status before intended edits | `## main...origin/main` |
| root no-merged branch audit before intended edits | no output |
| open PR audit before intended edits | local `gh` unavailable in this shell; final PR/open-state audit uses available GitHub path after push |

## Implementation

| Area | Change | Evidence |
|---|---|---|
| root API build | `package.json` `build:api` now delegates to the API workspace build. | `npm run build:api` invokes `npm --workspace @uzmax/api run build`. |
| API build | `apps/api/package.json` `build` cleans `apps/api/dist` and runs `tsc -p tsconfig.build.json`. | Emits JavaScript artifact instead of `--noEmit`. |
| API start | `apps/api/package.json` `start` now runs `node dist/apps/api/src/main.js`. | No `runtime-compiler.mjs` in the start command. |
| TypeScript emit | `apps/api/tsconfig.build.json` preserves decorators/metadata from root config and enables `rewriteRelativeImportExtensions`. | Emitted `main.js` imports `./app.module.js`, not `./app.module.ts`. |
| startup log | `apps/api/src/main.ts` prints JSON `api.startup` with `traceId`, service, status and port after `listen`. | No secrets, raw payloads, customer/order data, prompts, completions or provider values. |
| runtime smoke | `apps/api/scripts/run-m6b-api-artifact-smoke.mjs` starts `npm --workspace @uzmax/api run start`, probes HTTP and verifies observed startup log. | Smoke output below. |

## Artifact Evidence

| Item | Evidence |
|---|---|
| Build command | `pnpm dlx npm@11.9.0 run build:api` in local shell; this executes repo script `npm --workspace @uzmax/api run build`. |
| Result | exit 0 |
| Artifact root | `apps/api/dist` |
| Artifact count | `find apps/api/dist -maxdepth 5 -type f` returned `56` files. |
| API entrypoint | `apps/api/dist/apps/api/src/main.js` |
| Import rewrite check | emitted `main.js` contains `import { AppModule } from "./app.module.js"`; `rg` found no `runtime-compiler` reference in emitted `main.js`, `app.module.js` or `access-context.js`. |

Local tooling note: this shell exposes bundled Node and pnpm but not a direct `npm` binary. Local validation used `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH /Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/pnpm dlx npm@11.9.0 ...` to execute npm 11.9.0 scripts without changing `package-lock.json` or adding dependencies.

## Runtime Smoke Evidence

Command:

```bash
PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH /Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/pnpm dlx npm@11.9.0 --workspace @uzmax/api run smoke:m6b-artifact
```

Result: exit 0.

Observed sanitized output:

```json
{"event":"m6b_01_api_startup_log_observed","observed":{"event":"api.startup","port":37891,"service":"api","status":"listening","traceId":"m6b-01-api-artifact:39477"},"traceId":"m6b-01-api-artifact:39477"}
{"event":"m6b_01_api_artifact_smoke","healthz":200,"readyz":503,"readyzMode":"fail_closed","startCommand":"npm --workspace @uzmax/api run start","status":"pass","traceId":"m6b-01-api-artifact:39477"}
```

Interpretation:

- API artifact process booted through `npm --workspace @uzmax/api run start`.
- `/healthz` returned HTTP 200 from the running artifact.
- `/readyz` returned HTTP 503 in the default unconfigured local environment. This is recorded as fail-closed readiness, not a ready/pass claim.
- Startup log contained structured JSON event `api.startup` with `traceId`.
- No secret, raw payload, customer/order data, Telegram payload, prompt, completion or provider value was logged.

## Incident Record

M6B-01 created `docs/incidents/INC-2026-06-26-m6b-01-root-worktree-write.md` because the first patch was accidentally applied to the root/main checkout instead of the assigned worktree.

Cleanup evidence:

- root/main dirty paths were limited to the intended M6B-01 draft files;
- intended files were moved/applied into the assigned worktree;
- root/main tracked diff was reversed and untracked draft files were removed;
- root/main `git status --short --branch` returned `## main...origin/main`;
- no commit, push, PR, deploy, secret, customer/order data, generated artifact, DB schema change or migration occurred from root/main.

This incident affects process hygiene only; it does not change M6B-01 runtime acceptance except that final validation must include root/main clean and worker-boundary evidence.

## PR Hygiene

| Category | Current diff |
|---|---|
| Docs | `docs/specs/M6B-01-api-production-artifact.md`, `docs/evidence/M6B/README.md`, `docs/evidence/M6B/M6B-01-api-production-artifact.md`, `docs/incidents/INC-2026-06-26-m6b-01-root-worktree-write.md` |
| Source | `apps/api/src/main.ts`, `apps/api/scripts/run-m6b-api-artifact-smoke.mjs` |
| Config | `package.json`, `apps/api/package.json`, `apps/api/tsconfig.build.json` |
| Changed source files | 2 of budget <= 3 |
| New source files | 1 of budget <= 2 |
| Net source LOC | +161 of budget <= 220 |
| Test weakening | none; no test deletion, `.skip`, `.only`, `xit` or `xfail` |
| Generated/lock/migration/CI/admin/worker/cron/db/schema changes | none committed |
| External dependency | none added; no lockfile change |

## Validation

Recorded on 2026-06-26 from the assigned worktree unless noted.

| Command | Result | Notes |
|---|---|---|
| `npm ci` equivalent via `pnpm dlx npm@11.9.0 ci` | pass | Installed isolated dependencies in the assigned worktree; no lockfile change. |
| `node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json` | pass | Full repo typecheck. |
| `pnpm dlx npm@11.9.0 run build:api` | pass | Emits API artifact through npm scripts; local npm fallback noted above. |
| `pnpm dlx npm@11.9.0 --workspace @uzmax/api run smoke:m6b-artifact` | pass | Real process start via `npm --workspace @uzmax/api run start`; `/healthz` 200; `/readyz` 503 fail-closed; traceId startup log observed. |
| `node node_modules/eslint/bin/eslint.js apps/api/src/main.ts apps/api/scripts/run-m6b-api-artifact-smoke.mjs` | pass | Focused lint for touched source. |
| full repo ESLint command from `package.json` | pass | First attempt had local PATH scoped only to `find`, then reran with exported PATH and passed. |
| `node node_modules/dependency-cruiser/bin/dependency-cruise.mjs apps packages --config dependency-cruiser.config.cjs` | pass | `no dependency violations found`. |
| `node node_modules/knip/bin/knip.js -c package.json#knip --no-progress --duration --no-config-hints --no-tag-hints` | pass | New API smoke script is reachable through `apps/api/package.json` script. |
| `node node_modules/jscpd/run-jscpd.js apps packages scripts --config jscpd.config.json --workers 1 --no-tips` | pass | `Found 0 clones`. |
| `node node_modules/prettier/bin/prettier.cjs --check package.json apps/api/package.json apps/api/tsconfig.build.json apps/api/src/main.ts apps/api/scripts/run-m6b-api-artifact-smoke.mjs docs/specs/M6B-01-api-production-artifact.md docs/incidents/INC-2026-06-26-m6b-01-root-worktree-write.md` | pass | Initial formatting warning fixed before evidence. |
| `node --test scripts/tests/m1-02-api-access-context.test.mjs scripts/tests/m6-runtime-deploy-baseline.test.mjs` | pass | 7/7 focused tests passed; M1 readiness test still expects default `/readyz` 503. |
| `node scripts/guards/doc-trigger-paths.mjs` | pass | `doc-trigger-paths: ok`. |
| `node scripts/guards/eval-trigger-paths.mjs --base origin/main` | pass | `no eval-triggering paths changed`. |
| `node scripts/guards/forbidden-terms.mjs` | pass | `forbidden-terms: ok`. |
| `node scripts/guards/workspace-isolation.mjs` | pass | Linked worktree on `codex/m6b-01-api-production-artifact`; dirty allowed. |
| `node scripts/guards/worker-write-boundary.mjs --assigned /Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m6b-01-api-production-artifact --root /Users/atilla/Applications/UZMAX智能运营` | pass | Assigned worktree boundary check passed. |
| `git diff --check` | pass | No whitespace errors. |
| `node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M6B-01-api-production-artifact.md` | pass | Post-commit diff: changed files 9; categories config 3, source 2, docs 4; source changed files 2, net LOC +161, new files 1. |
| root/main `git status --short --branch` | pass | `## main...origin/main`; confirms incident cleanup. |

The local worktree has ignored `node_modules/` and `apps/api/dist/` artifacts after validation. They are not staged or committed.

## Boundaries

M6B-01 does not approve:

- M6B-02 worker runtime or M6B-03 cron runtime;
- worker/cron placeholder replacement;
- staging/production deploy;
- real Render service mutation;
- real customer/order data;
- customer LLM or real provider calls;
- real Telegram Bot token/webhook secret, Telegram Business auto-reply or outbound Bot send;
- DB schema, migrations, generated client or RLS policy changes;
- GA-0 opening, P1/P2 owner decision or 1.0 release.
