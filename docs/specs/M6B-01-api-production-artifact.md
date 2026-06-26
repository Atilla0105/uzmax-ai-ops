# M6B-01 API Production Artifact

Spec ID: M6B-01
Tracking issue: Linear LAY-16
Status: `m6b_01_api_production_artifact_ready_for_review_not_ga0`
Owner confirmation point: project owner review of this API artifact PR and later owner decisions for staging, production, secrets, real Bot/customer/order data, GA-0 and 1.0.
Timebox: 0.5 work day.

## Spec 类型

infra

## 目标

Make the API service produce and boot a runnable production artifact for the M6B inner ring.

M6B-01 must prove:

- `npm run build:api` emits an API artifact.
- `npm --workspace @uzmax/api run start` boots from the emitted artifact, not `apps/api/scripts/runtime-compiler.mjs` or on-start TypeScript compilation.
- `/healthz` returns HTTP 200 from the running artifact.
- `/readyz` is exercised and recorded honestly. With the default unconfigured local env it is expected to fail closed with HTTP 503, not count as ready.
- Runtime logs include a structured JSON line with `traceId`, without secrets, raw customer/order payloads, Telegram payloads, prompts, completions or provider keys.

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner: decide later staging/production env, real secrets, customer/order data, customer LLM/provider use, GA-0 and 1.0 release. M6B-01 does not require owner infrastructure input.

AI agent: create the spec and evidence, implement the narrow API artifact build/start path, preserve existing health behavior, add traceId-bearing startup/readiness evidence, run focused artifact smoke and guards, and report `/readyz` truthfully as fail-closed if default env is not configured.

M6B-01 boundary: no DB schema, migrations, generated Prisma client, admin UI, worker/cron placeholder replacement, engine/capabilities/llm/evals changes, production deploy, real customer/order data, real provider calls, customer LLM, GA-0 opening, P1/P2 decision or 1.0 release.

## 时间盒

0.5 work day. If Nest/ESM artifact emission requires a broader bundler/toolchain, shared lockfile dependency, worker/cron start replacement, schema/generated changes or CI/release gate changes, stop and report a split proposal instead of widening silently.

## Source Links

- `AGENTS.md`
- `docs/specs/README.md`
- `docs/evidence/M6B/README.md`
- `docs/specs/M6B-00-ga0-runtime-bring-up-contract.md`
- `apps/api/package.json`
- `package.json`
- `apps/api/src/app.module.ts`
- `apps/api/src/access-context.ts`
- `apps/api/src/main.ts`
- `render.yaml`
- `docs/evidence/M6/M6-02-runtime-deploy-baseline.md`

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M6B-01-api-production-artifact.md`
  - `docs/incidents/INC-2026-06-26-m6b-01-root-worktree-write.md`
  - `docs/evidence/M6B/README.md`
  - `docs/evidence/M6B/M6B-01-api-production-artifact.md`
  - `package.json`
  - `apps/api/package.json`
  - `apps/api/tsconfig.build.json`
  - `apps/api/src/main.ts`
  - `apps/api/scripts/run-m6b-api-artifact-smoke.mjs`
- 说明/备注：
  - `package.json` and `apps/api/package.json` may change only API build/start/smoke scripts.
  - `apps/api/tsconfig.build.json` may define API-only artifact emit and TypeScript `.ts` import rewriting.
  - `apps/api/src/main.ts` may change only startup logging and boot metadata; health/readiness behavior must remain in `access-context.ts`.
  - Do not modify `render.yaml` because it already calls `npm run build:api` and `npm --workspace @uzmax/api run start`.

## 变更预算与路径分类

- Source budget: changed source files <= 3, net source LOC <= 220, new source files <= 2.
- Source: `apps/api/src/main.ts`, `apps/api/scripts/run-m6b-api-artifact-smoke.mjs`.
- Config: `package.json`, `apps/api/package.json`, `apps/api/tsconfig.build.json`.
- Docs: this spec, M6B README update and M6B-01 evidence.
- Incident docs: one required write-boundary incident record for the initial root/main misplaced edit, with cleanup evidence.
- Test: none, unless the focused smoke is classified by reviewers as test-support; no test deletion or weakening is allowed.
- Generated/lock/migration/CI/admin/worker/cron/db/schema changes: none.
- New source `rg` conclusion: searched `artifact`, `build:api`, `runtime-compiler`, `healthz`, `readyz`, `traceId`, `run.*smoke`, `npm --workspace` across `apps`, `scripts`, `docs/specs`, `docs/evidence`. Existing API tests boot through `apps/api/scripts/runtime-compiler.mjs`; existing M6 baseline only checks repo strings and records blockers. No production-artifact smoke exists. The new smoke belongs under `apps/api/scripts` because it is API-owned runtime evidence and must start the same workspace command Render uses for the API service.
- External API/SDK/provider/connector/adapter basis: none added. This uses existing TypeScript, NestJS and Node runtime dependencies already declared in the repo.
- Exceptions: none.

## 文档触发检查

updated

M6B-01 adds traceId-bearing startup/runtime evidence but does not introduce a new observability subsystem beyond the existing M6B evidence path. If `docs/observability.md` becomes required by `docs/doc-gates.md`, stop and update the spec before widening.

## 前置条件

- Read `AGENTS.md`, `docs/specs/README.md`, `docs/evidence/M6B/README.md`, `docs/specs/M6B-00-ga0-runtime-bring-up-contract.md`, `apps/api/package.json`, `package.json`, `apps/api/src/app.module.ts`, `apps/api/src/access-context.ts`, `apps/api/src/main.ts`, `render.yaml` and `docs/evidence/M6/M6-02-runtime-deploy-baseline.md`.
- Confirm current API build is typecheck-only and current API start imports `apps/api/scripts/runtime-compiler.mjs`.
- Confirm `/healthz` and `/readyz` live in `apps/api/src/access-context.ts`.
- Confirm `render.yaml` already uses `npm run build:api` and `npm --workspace @uzmax/api run start`.
- Confirm no worker/cron placeholder replacement is included.

## Worktree / branch 前置条件

| Fact | Expected |
|---|---|
| worktree | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m6b-01-api-production-artifact` |
| branch | `codex/m6b-01-api-production-artifact` |
| base | current `origin/main` containing M6B-00 at `666fe3f5f98d38d68a8e9577dd49fa51a06f98bc` |
| forbidden checkout | root/main `/Users/atilla/Applications/UZMAX智能运营` for writing |
| required pre-edit evidence | `pwd`, `git status --short --branch`, `git branch --show-current`, worker HEAD, worker origin/main, root/main status, root no-merged branch audit, open PR audit |

## 并发派发证据

Single M6B-01 worker in a dedicated physical worktree and branch. Touch list is limited to API build/start artifact support, API startup log line, focused API smoke, M6B docs/evidence and the required incident record for a detected write-boundary cleanup. This slice does not touch global serial DB schema/migration/RLS/generated/lockfile/CI/guard/release gates, worker/cron placeholders, admin, engine, capabilities, LLM or eval paths.

## 实施步骤

1. Create this M6B-01 spec before source implementation.
2. Add API artifact emit config so root `npm run build:api` emits runnable JavaScript while preserving decorator metadata and rewriting relative `.ts` imports.
3. Change `@uzmax/api` start to boot the emitted artifact.
4. Add a structured traceId-bearing startup log line without secrets/raw payloads.
5. Add a focused smoke that builds, starts the artifact command in a real process, probes `/healthz` and `/readyz`, observes traceId logs and shuts down cleanly.
6. Create M6B-01 evidence with command output summaries, artifact paths, health/readiness/log observations, PR budget and validation.
7. Run focused validation and guards.

## 通过条件

- `npm run build:api` exits 0 and emits runnable artifact path(s).
- `npm --workspace @uzmax/api run start` starts the emitted artifact and does not import or invoke `apps/api/scripts/runtime-compiler.mjs`.
- A real process serving the artifact returns HTTP 200 for `/healthz`.
- `/readyz` is exercised; if default env is unconfigured, evidence records HTTP 503 fail-closed readiness rather than calling it ready.
- A structured JSON log line with `traceId` is observed from the running artifact.
- Focused smoke is executable and is not docs-only/string-only evidence.
- PR diff stays inside this spec touch list and source budget.

## 失败分支

- If TypeScript emit leaves non-runnable `.ts` imports, fix within API build config or stop and propose a build-tool split.
- If `/healthz` cannot return 200 from the emitted artifact, do not mark M6B-01 passed.
- If `/readyz` is 503 due to unconfigured authz/identity env, record fail-closed readiness and continue only if `/healthz` and startup evidence pass.
- If `npm` is unavailable locally, use the bundled local runtime fallback only for local validation and record the limitation; CI/Render contract remains the npm scripts.
- If implementation requires worker/cron placeholder changes, DB schema/migrations/generated changes, lockfile/shared dependency changes, CI/guard changes, production secrets or real customer/order data, stop and report.
- If any write occurs outside assigned worktree or on root/main, stop and record an incident before continuing.

## 不做什么

- No worker or cron placeholder replacement.
- No DB schema, migrations, RLS policy, generated client, package lockfile, shared CI/guard/release gate, admin UI/client, engine, capabilities, LLM gateway, eval, production deploy or Render service mutation.
- No real customer/order data, Telegram payloads, raw prompts/completions, LLM keys, Bot tokens, provider calls, outbound Bot send, GA-0 opening, P1/P2 owner decision or 1.0 release.

## 验收映射

- J-01: API artifact build/start and health evidence improves deploy baseline but does not close real deploy/rollback drills.
- J-04: structured traceId log and health/readiness smoke improve operational evidence but do not complete all drills/runbooks.
- K-03/K-04: one spec / one branch / one worktree / one PR with scoped validation.
- L-01/L-02: GA-0 and 1.0 remain locked pending later M6B runtime evidence and owner decisions.
