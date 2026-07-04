# REQ-G01A-code-01 Group Overview DB/API Foundation Evidence

## Status

Docs-only evidence for `REQ-G01A-code-01-group-overview-db-api-foundation`.

This slice defines the DB + API runtime foundation implementation spec for `group.overview` aggregate data. It does not implement DB/API/admin code, migrations, Prisma models/views, tests, runtime queries, fixtures, owner HTML changes, owner acceptance, visual acceptance, GA-0, production or 1.0 release.

## Entry Evidence

| Fact | Evidence |
|---|---|
| assigned worker path | `/Users/atilla/.codex/worktrees/req-g01a-code-01-db-api-foundation-spec` |
| assigned branch | `codex/req-g01a-code-01-db-api-foundation-spec` |
| worker `pwd` at entry | `/Users/atilla/.codex/worktrees/req-g01a-code-01-db-api-foundation-spec` |
| worker `git status --short --branch` at entry | `## codex/req-g01a-code-01-db-api-foundation-spec...origin/main` |
| worker `git branch --show-current` at entry | `codex/req-g01a-code-01-db-api-foundation-spec` |
| worker HEAD at entry | `87a5ae4ef9ab5fa3b3fe8656a9a5126a11c67a5c` / `docs: plan REQ-G01A group overview runtime implementation (#188)` |
| root/main checkout | `/Users/atilla/Applications/UZMAX智能运营` |
| root/main status/head at entry | `## main...origin/main`; HEAD `87a5ae4ef9ab5fa3b3fe8656a9a5126a11c67a5c` |
| required pre-write guard, bare `npm` | failed before writing because `npm` was not on shell PATH: `zsh:1: command not found: npm` |
| required pre-write guard, Codex Node PATH | pass: `worker-write-boundary: ok (codex/req-g01a-code-01-db-api-foundation-spec, /Users/atilla/.codex/worktrees/req-g01a-code-01-db-api-foundation-spec)` |
| no-merged branch check | `git branch --no-merged main` showed #178 and #182 worker branches only: `codex/m7-ui-11-release-acceptance-page-impl`, `codex/m7-ui-20-conversation-workbench-page-impl`. |
| open PR / PR creation check | Bare `gh` was unavailable in the previous shell, but bundled gh at `/Users/atilla/Applications/Codex/tools/downloads/gh/gh_2.92.0_macOS_arm64/bin/gh` is available in this handoff; it created Draft PR #190 at `https://github.com/Atilla0105/uzmax-ai-ops/pull/190`. |

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
| group overview API | No `apps/api/src/group-overview.*` implementation exists on current main. |
| admin page | `group.overview` remains registry/scaffold-only; page population remains out of scope for code-01. |
| DB read model | No dedicated `group_overview_*` read model/view/table exists. |
| current source tables | Existing deterministic source candidates include `tenant`, `channel_connection`, `conversation`, `ticket`, `order_snapshot`, `order_query_log`, `eval_gate`, `llm_call_log`, `ai_member`, `audit_log`, `login_log`, `presence_log`. |
| source gaps | Current schema lacks `metric_daily`, `redline_event`, explicit order connector health, and tenant business-line source fields. |
| RLS strategy gap | `AccessContext.tenantIds` exists, but current DB RLS helpers and policies are selected-tenant scoped via `app.org_id` and `app.tenant_id`; group-scope aggregation must be explicitly solved or disabled/degraded. |
| API runtime pattern | Existing API code uses `ApiAccessContextGuard`, service/repository separation, runtime provider tokens, disabled modes, `rls_prisma_gateway`, `createRlsTransactionContext`, controlled refs and typed errors. |
| privacy/provenance pattern | Existing confirmation queue/logs/contracts reject raw/customer/order/phone/telegram/prompt/completion/secret/url/blob-like payloads and use controlled refs. |

## Decisions Recorded

- `REQ-G01A-code-01` is DB + API runtime foundation only.
- Admin ApiClient/page wiring remains `REQ-G01A-code-02` after code-01 merges and is validated.
- Preferred DB foundation is a read-only SQL view `group_overview_tenant_aggregate_v1` in a new sequential migration, queried by typed repository `$queryRaw` unless Prisma view mapping is proven safe.
- If current schema lacks a source, code-01 must encode degraded/partial-source metadata instead of fabricating values.
- Group-scope RLS is a first-class blocker: code-01 must implement a tested safe strategy or return disabled/degraded state rather than bypassing RLS.
- Future source file budget stays within five new API source files by consolidating DTOs, types, errors and validators into `group-overview.contracts.ts`.
- Coordinator quality review added explicit future `packages/db/scripts/**` smoke-harness paths so the required DB/RLS true-DB validation has an allowed location if code-01 needs package-local support scripts.
- No implementation, runtime closure, visual acceptance, owner acceptance, GA-0, production or 1.0 release is claimed.

## Validation

| Command | Result | Notes |
|---|---|---|
| `git diff --check` | pass | No whitespace errors after intent-to-add included the new docs files in the diff. |
| `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:/Applications/Codex.app/Contents/Resources/cua_node/bin:$PATH npm run guard:doc-triggers` | pass | `doc-trigger-paths: ok`. |
| `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:/Applications/Codex.app/Contents/Resources/cua_node/bin:$PATH node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/REQ-G01A-code-01-group-overview-db-api-foundation.md --include-worktree` | pass | Final output: `changedFiles: 4`, category `docs: 4`, source changed files `0`, source net LOC `0`, new source files `0`. Initial local attempts exposed and fixed spec-format issues: `Spec 类型` must be one of the guard enum values, and the local glob parser does not accept `**/*.spec.ts` style patterns. |
| final worker-boundary guard | pass | `worker-write-boundary: ok (codex/req-g01a-code-01-db-api-foundation-spec, /Users/atilla/.codex/worktrees/req-g01a-code-01-db-api-foundation-spec)`. |

## No-Code Boundary

- No `apps/**` or `packages/**` files were edited in this docs-only PR.
- No DB migration, Prisma schema, runtime/API/admin source, test, package/lock, generated file, CI/config, owner HTML or unpacked prototype source was changed.
- No runtime implementation, runtime closure, page implementation, owner acceptance, visual acceptance, M7 closeout, GA-0, production or 1.0 release approval is claimed.
