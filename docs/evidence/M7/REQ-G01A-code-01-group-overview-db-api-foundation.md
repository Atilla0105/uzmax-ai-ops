# REQ-G01A-code-01 Group Overview DB/API Foundation Evidence

## Status

Status token: `code_01_db_api_foundation_implemented_not_admin_wired_not_visual_accepted`.

This implementation candidate adds the DB/API foundation skeleton for `group.overview` aggregate data: guarded API controller wiring, contracts/DTO validators, service permission assertion, disabled-default runtime provider, a per-authorized-tenant RLS repository foundation, and a focused true DB/RLS smoke harness. The true DB/RLS smoke was not run locally because `UZMAX_RLS_DATABASE_URL` is missing, so no passed true-DB evidence or runtime closure is claimed. It does not add a DB migration, Prisma schema/view mapping, admin wiring, populated admin rendering, owner HTML changes, owner acceptance, visual acceptance, runtime final closure, GA-0, production or 1.0 release.

## Entry Evidence

| Fact | Evidence |
|---|---|
| assigned worker path | `/Users/atilla/.codex/worktrees/req-g01a-code-01-db-api-foundation-impl` |
| assigned branch | `codex/req-g01a-code-01-db-api-foundation-impl` |
| worker `pwd` at entry | `/Users/atilla/.codex/worktrees/req-g01a-code-01-db-api-foundation-impl` |
| worker `git status --short --branch` during PR #191 DB/RLS smoke follow-up | `## codex/req-g01a-code-01-db-api-foundation-impl...origin/codex/req-g01a-code-01-db-api-foundation-impl` with local smoke-harness/evidence changes before final amend/push; true DB smoke was not run because `UZMAX_RLS_DATABASE_URL` is missing |
| worker `git branch --show-current` at entry | `codex/req-g01a-code-01-db-api-foundation-impl` |
| worker HEAD before final PR #191 DB/RLS smoke-harness amend | `16189a7` / `Implement REQ-G01A group overview DB API foundation` |
| root/main checkout | `/Users/atilla/Applications/UZMAX智能运营` |
| root/main status during PR #191 follow-up | `## main...origin/main` |
| PR | PR #191 on `codex/req-g01a-code-01-db-api-foundation-impl` |
| worker-boundary guard | pass: `worker-write-boundary: ok (codex/req-g01a-code-01-db-api-foundation-impl, /Users/atilla/.codex/worktrees/req-g01a-code-01-db-api-foundation-impl)` |

## 2026-07-04 Rebase/Rerun Evidence

| Fact | Evidence |
|---|---|
| rebase target | `origin/main` at `c39ba3be6bbb993300338ae557ff458b4078b7aa` / `fix: restore M4 visible smoke legacy route` |
| assigned worker path rechecked | `/Users/atilla/.codex/worktrees/req-g01a-code-01-db-api-foundation-impl` |
| assigned branch rechecked | `codex/req-g01a-code-01-db-api-foundation-impl` |
| pre-rebase worker status | `## codex/req-g01a-code-01-db-api-foundation-impl...origin/codex/req-g01a-code-01-db-api-foundation-impl` |
| rebase result | `git rebase origin/main` applied the PR #191 implementation commit with one docs conflict in `docs/evidence/M7/README.md`; conflict was resolved by preserving current main UI-07B/UI-08/UI-09 wording and updating only the `REQ-G01A-code-01` candidate status paragraph. |
| node/npm path | plain `node` and `npm` were not available in this shell; validation used `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:/Applications/Codex.app/Contents/Resources/cua_node/bin:$PATH` with Node `v24.14.0` and npm `11.9.0`. |
| true DB/RLS smoke | still not run; no `UZMAX_RLS_DATABASE_URL` was provided, so no true DB/RLS pass or runtime closure is claimed. |

## Required Reads

- `AGENTS.md`
- `docs/specs/REQ-G01-group-overview-runtime-contract.md`
- `docs/specs/REQ-G01A-group-overview-runtime-implementation.md`
- `docs/specs/M7-UI-12-group-overview-page.md`
- `docs/admin-ui-page-migration-ledger.md`
- `docs/evidence/M7/README.md`
- `UZMAX智能运营系统-PRD-v1.1.md`
- `UZMAX智能运营系统-技术架构-v1.1.md`
- `UZMAX智能运营系统-后台设计与前端架构-v1.1.md`
- `UZMAX智能运营系统-1.0验收矩阵-v1.1.md`

Read-only code inspections:

- `packages/db/prisma/schema.prisma`
- `packages/db/src/index.ts`
- `packages/db/src/prisma-runtime.ts`
- `packages/db/src/m5-operations-contracts.ts`
- `packages/db/migrations/**`
- `packages/authz/src/index.ts`
- `apps/api/src/access-context.ts`
- `apps/api/src/access-context-core.ts`
- `apps/api/src/app.module.ts`
- `apps/api/src/logs-analytics-runtime.ts`
- `apps/api/src/logs-analytics-runtime.contracts.ts`
- `apps/api/src/logs-analytics-runtime.repository.ts`
- `apps/api/src/confirmation-queue.controller.ts`
- `apps/api/src/confirmation-queue.service.ts`
- `apps/api/src/confirmation-queue.repository.ts`
- `apps/api/src/confirmation-queue.runtime.ts`
- `apps/api/src/customer-asset.controller.ts`
- `apps/api/src/customer-asset.service.ts`
- `apps/api/src/customer-asset.repository.ts`
- `apps/api/src/conversation-ticket.controller.ts`
- `apps/api/src/conversation-ticket.service.ts`
- `rg` for `groupOverview|GroupOverview|group-overview|group.overview|M7-UI-04A|REQ-G01A-code-01|REQ-G01A-code-02`

This docs worker did not read or modify owner HTML `/Users/atilla/Downloads/运营塔台1.0.html` or `/Users/atilla/源码/unpacked 6`.

## Current State Findings

| Area | Finding |
|---|---|
| group overview API | This candidate adds `apps/api/src/group-overview.controller.ts`, `group-overview.service.ts`, `group-overview.repository.ts`, `group-overview.runtime.ts`, `group-overview.contracts.ts` and AppModule wiring for `GET /group-overview`. |
| admin page | `group.overview` remains registry/scaffold-only; admin wiring remains out of scope for code-01. |
| DB read model | No dedicated `group_overview_*` read model/view/table exists. |
| current source tables | Existing deterministic source candidates include `tenant`, `channel_connection`, `conversation`, `ticket`, `order_snapshot`, `order_query_log`, `eval_gate`, `llm_call_log`, `ai_member`, `audit_log`, `login_log`, `presence_log`. |
| source gaps | Current schema lacks `metric_daily`, `redline_event`, explicit order connector health, and tenant business-line source fields. This candidate also intentionally omits available-source deterministic provenance for `llm_call_log` cost/model-fault aggregation, `channel_connection.status`, order-source health and last-abnormal event mapping; those values are represented as bounded partial-source/degraded metadata rather than completed provenance. |
| RLS strategy gap | `AccessContext.tenantIds` exists, but current DB RLS helpers and policies are selected-tenant scoped via `app.org_id` and `app.tenant_id`; group-scope aggregation must be explicitly solved or disabled/degraded. |
| true DB/RLS smoke | Harness added at `packages/db/scripts/tests/run-req-g01a-code-01-group-overview-db-api-foundation-smoke.mjs`, but not run locally because `UZMAX_RLS_DATABASE_URL` is missing. Runtime closure remains blocked until the smoke proves the RLS repository path against a real database or the scope is explicitly reclassified. |
| API runtime pattern | Existing API code uses `ApiAccessContextGuard`, service/repository separation, runtime provider tokens, disabled modes, `rls_prisma_gateway`, `createRlsTransactionContext`, controlled refs and typed errors. |
| privacy/provenance pattern | Existing confirmation queue/logs/contracts reject raw/customer/order/phone/telegram/prompt/completion/secret/url/blob-like payloads and use controlled refs. |

## Decisions Recorded

- `REQ-G01A-code-01` is DB + API runtime foundation only, currently represented by `code_01_db_api_foundation_implemented_not_admin_wired_not_visual_accepted`.
- Admin ApiClient/page wiring remains `REQ-G01A-code-02` after code-01 merges and is validated.
- This candidate does not touch `schema.prisma`, migrations or generated Prisma artifacts; `schema.prisma` was not touched.
- The repository foundation uses per-authorized-tenant `createRlsTransactionContext` calls and omits unauthorized tenants instead of bypassing RLS.
- Detailed last-abnormal event DB loading/mapping is intentionally omitted in this budgeted candidate; `lastAbnormalAggregateEvent` remains `null` and `source_partial` plus bounded degraded/source-gap reasons make the gap explicit without exposing raw event payload.
- Available-source deterministic provenance for `llm_call_log` cost/model fault counts, `channel_connection.status`, order-source health and last abnormal event detail is intentionally not completed in this candidate; the response marks the affected fields as `null`, unavailable or partial-source instead of claiming final provenance.
- A future DB foundation may still add a read-only SQL view `group_overview_tenant_aggregate_v1` in a new sequential migration, queried by typed repository `$queryRaw` unless Prisma view mapping is proven safe.
- If current schema lacks a source, code-01 must encode degraded/partial-source metadata instead of fabricating values.
- Group-scope RLS remains conservative: this candidate does not claim materialized/read-model runtime final closure, true DB/RLS smoke pass/closure or merge-ready runtime closure, and it does not use a service role or bypass role.
- Future source file budget stays within five new API source files by consolidating DTOs, types, errors and validators into `group-overview.contracts.ts`.
- Coordinator quality review added explicit future `packages/db/scripts/**` smoke-harness paths; this follow-up uses only the allowed `packages/db/scripts/tests/**` path so the harness is classified as test, not source, under `guard:pr-shape`.
- No admin wiring, visual acceptance, owner acceptance, GA-0, production or 1.0 release is claimed.

## Validation

Latest 2026-07-04 rebase/rerun validation:

| Command | Result | Notes |
|---|---|---|
| `git diff --check` | pass | No whitespace errors after rebase. |
| `node --test scripts/tests/req-g01a-code-01-group-overview-db-api-foundation.test.mjs` | pass | 7 tests passed; focused test covers endpoint wiring, disabled runtime, contract/forbidden-field assertions including separator variants (`external_user_id`, `customer_display_name`, `provider_response`, `storage_url`), true-DB smoke harness reference, service permission behavior and per-authorized-tenant RLS transaction setup. |
| `npm run guard:doc-triggers` | pass | `doc-trigger-paths: ok`. |
| `node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/REQ-G01A-code-01-group-overview-db-api-foundation.md --include-worktree` | pass | changed files 11, categories source 6/docs 3/test 2, source changed files 6, source net LOC 592, new source files 5. |
| `npm run lint` | pass | ESLint completed for apps, packages and scripts. |
| `npm run typecheck` | pass | `tsc --noEmit -p tsconfig.json`. |
| `npm run build:api` | pass | API TypeScript build passed. |

Earlier PR #191 implementation validation before the 2026-07-04 rebase:

| Command | Result | Notes |
|---|---|---|
| `npm run knip` | pass | No unused exports after removing test-only/internal exports. |
| `npm run lint` | pass | ESLint completed for apps, packages and scripts. |
| `npm run format:check` | pass | Prettier check passed. |
| `npm run typecheck` | pass | `tsc --noEmit -p tsconfig.json`. |
| `node --test scripts/tests/req-g01a-code-01-group-overview-db-api-foundation.test.mjs` | pass | Focused test covers permission, forbidden queries, disabled default, per-tenant RLS transaction setup, source gaps and service constructor metadata. |
| `UZMAX_RLS_DATABASE_URL=... node packages/db/scripts/tests/run-req-g01a-code-01-group-overview-db-api-foundation-smoke.mjs` | `not_run_missing_UZMAX_RLS_DATABASE_URL` | Harness added for rls_prisma_gateway true DB/RLS readback, tenant A/B authorization, unauthorized tenant omission, missing-context RLS negative, disabled default, partial-source and no-raw assertions. Current shell has no `UZMAX_RLS_DATABASE_URL`, so no passed true-DB result is claimed. |
| `npm run build:api` | pass | API TypeScript build passed. |
| `npm run guard:doc-triggers` | pass | `doc-trigger-paths: ok`. |
| `git diff --check` / `git diff --cached --check` | pass | No whitespace errors in tracked unstaged or staged diff; new smoke harness is also covered by Prettier/lint. |
| `npm run guard:worker-boundary` with assigned/root env | pass | Assigned worktree and root/main separation verified. |
| `node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/REQ-G01A-code-01-group-overview-db-api-foundation.md --include-worktree` | pass | PR shape validated for PR #191 candidate plus local smoke harness: changed files 11, categories source 6/docs 3/test 2, source net LOC 592, new source files 5. |

## Source LOC

| Source file | Net LOC |
|---|---:|
| `apps/api/src/app.module.ts` | 10 |
| `apps/api/src/group-overview.contracts.ts` | 204 |
| `apps/api/src/group-overview.controller.ts` | 51 |
| `apps/api/src/group-overview.repository.ts` | 189 |
| `apps/api/src/group-overview.runtime.ts` | 49 |
| `apps/api/src/group-overview.service.ts` | 89 |
| Total (`git diff --cached --numstat origin/main` source insertions) | 592 |
| `guard:pr-shape` source net LOC | 592 |

Test-only additions:

- `packages/db/scripts/tests/run-req-g01a-code-01-group-overview-db-api-foundation-smoke.mjs`

## No-Code Boundary

- API source and focused test files are edited only within the code-01 allowlist.
- No DB migration, Prisma schema, package/lock, generated file, CI/config, admin source, owner HTML or unpacked prototype source was changed.
- No admin wiring, populated page implementation, true DB/RLS smoke pass/closure, runtime final closure, owner acceptance, visual acceptance, M7 closeout, GA-0, production or 1.0 release approval is claimed.
