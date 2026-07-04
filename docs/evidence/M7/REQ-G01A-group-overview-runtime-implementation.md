# REQ-G01A Group Overview Runtime Implementation Evidence

## Status

Docs-only evidence for `REQ-G01A-group-overview-runtime-implementation`.

This slice creates the implementation spec for the first truthful runtime path behind `group.overview` aggregate data. It does not implement DB/API/admin code, migrations, Prisma models/views, tests, runtime queries, fixtures, owner HTML changes, owner acceptance, visual acceptance, GA-0, production or 1.0 release.

## Entry Evidence

| Fact | Evidence |
|---|---|
| assigned worker path | `/Users/atilla/.codex/worktrees/req-g01a-group-overview-runtime-implementation-spec` |
| assigned branch | `codex/req-g01a-group-overview-runtime-implementation-spec` |
| worker `pwd` | `/Users/atilla/.codex/worktrees/req-g01a-group-overview-runtime-implementation-spec` |
| worker `git status --short --branch` at entry | `## codex/req-g01a-group-overview-runtime-implementation-spec...origin/main` |
| worker `git branch --show-current` at entry | `codex/req-g01a-group-overview-runtime-implementation-spec` |
| worker HEAD at entry | `4af55f2` / `docs: define REQ-G01 group overview runtime contract (#186)` |
| root/main checkout | `/Users/atilla/Applications/UZMAX智能运营` |
| root/main status/head at entry | `## main...origin/main`; branch `main`; HEAD `4af55f2` |
| root/main boundary | Root/main was intended to be read-only, but an initial patch-target slip occurred. It was cleaned before #188 validation and is now recorded by merged PR #189 / commit `4487843` / `docs/incidents/INC-2026-07-04-req-g01a-root-patch-target.md`. |
| no-merged branch check | `git branch --no-merged main` showed #178 and #182 worker branches only: `codex/m7-ui-11-release-acceptance-page-impl`, `codex/m7-ui-20-conversation-workbench-page-impl`. |
| open PR check | Bundled `gh` later verified open PRs: #182 `Implement M7 conversation workbench page` from `codex/m7-ui-20-conversation-workbench-page-impl` and #178 `Paused: transitional M7 release acceptance page` from `codex/m7-ui-11-release-acceptance-page-impl`; both Draft, both targeting `main`. |
| patch-target slip cleanup | An initial patch accidentally landed in root/main; the same docs content was reapplied to the assigned worktree and root/main was cleaned before validation. The incident record is merged via PR #189 / commit `4487843818e39bed7aa91886de61e800f0e9f912`. |

## Current Update

After #189 merged to `main`, this #188 branch was rebased onto `origin/main` commit `4487843818e39bed7aa91886de61e800f0e9f912` so the incident record is included in the PR base. Current root/main check is clean (`## main...origin/main`). This update changes evidence wording only; it does not implement DB/API/admin runtime, migrations, tests, page wiring, owner acceptance, visual acceptance, GA-0, production or 1.0 release.

## Required Reads

- `AGENTS.md`
- `.agents/skills/impeccable/SKILL.md`
- `.agents/skills/impeccable/reference/product.md`
- Impeccable context for `apps/admin`, which loaded `PRODUCT.md` and `DESIGN.md`
- `docs/specs/REQ-G01-group-overview-runtime-contract.md`
- `docs/evidence/M7/REQ-G01-group-overview-runtime-contract.md`
- `docs/specs/M7-UI-12-group-overview-page.md`
- `docs/evidence/M7/M7-UI-12-group-overview-page.md`
- `docs/admin-ui-page-migration-ledger.md`
- `docs/evidence/M7/README.md`
- `docs/admin-design-system.md`
- `UZMAX智能运营系统-PRD-v1.1.md`
- `UZMAX智能运营系统-技术架构-v1.1.md`
- `UZMAX智能运营系统-后台设计与前端架构-v1.1.md`
- `UZMAX智能运营系统-1.0验收矩阵-v1.1.md`

Read-only code inspections:

- `rg` for `groupOverview|GroupOverview|group-overview|group.overview|REQ-G01|tenant health|health summary|aggregate`
- `packages/db/prisma/schema.prisma`
- `packages/db/src/index.ts`
- `packages/db/src/prisma-runtime.ts`
- `packages/db/migrations/**`
- `apps/api/src/access-context.ts`
- `apps/api/src/access-context-core.ts`
- `apps/api/src/app.module.ts`
- representative API runtime/controller/service/repository files for logs analytics, confirmation queue and customer asset
- representative admin ApiClients for customer asset and confirmation queue
- `apps/admin/src/pages/registry.ts`
- `apps/admin/src/pages/PageOutlet.tsx`
- representative admin Playwright tests for page router, foundation and confirmation queue

## Current State Findings

| Area | Finding |
|---|---|
| `group.overview` page | Registry-only/scaffold-only on `main`; no M7 page implementation is merged. |
| runtime API | No `group-overview` controller/service/repository/contracts/runtime path exists under `apps/api/src`. |
| admin client | No group overview aggregate ApiClient or hook exists under `apps/admin/src`. |
| DB read model | Existing schema has platform, tenant, permissions, channels, tickets, customer/order/eval/LLM/distill/AI/confirmation entities, but no dedicated group overview aggregate read model/view contract. |
| existing pattern to extend | API runtime should extend current `ApiAccessContextGuard`, `AccessContext`, controller/service/repository/runtime provider and RLS transaction-runner patterns. |
| RLS/provenance pattern | Existing runtime code already uses `rls_prisma_gateway`, `createRlsTransactionContext`, controlled refs, forbidden-key checks and typed domain errors. |
| page boundary | `M7-UI-12` and `REQ-G01` require populated group overview to wait for approved runtime; absent runtime, page may only be honest degraded/read-only shell. |

## Decisions Recorded

- Recommended first implementation split: DB+API runtime foundation first, admin ApiClient/page wiring second.
- DB/API foundation likely needs `packages/db/prisma/schema.prisma`, `packages/db/migrations/**` and `packages/db/src/**` if it creates a read model or SQL/materialized view; these paths are explicitly recorded in the future touch scope.
- Admin-only fixture/local-state population is rejected.
- A single combined DB+API+admin+visual PR is not recommended because it would combine schema serial work, RLS/auth review, aggregate DTO privacy/provenance, client validation, page states and visual acceptance in one PR.
- Quality review found and fixed a future new-source-file budget mismatch: code-01 now consolidates DTOs, types, errors and validators into `apps/api/src/group-overview.contracts.ts` so the proposed API shape fits `new source files <= 5`, unless a later owner-approved exception is requested before implementation.
- Backend authority, org/tenant auth, RLS/repository isolation, aggregate-only DTO, deterministic provenance and stale/degraded/partial-source encoding are mandatory.
- Production/staging data access, real customer/order data, RLS rollout, cost/refresh/backfill/retention, GA-0, production and 1.0 remain owner/coordinator decisions.

## Validation

| Command | Result | Notes |
|---|---|---|
| `git diff --check` | pass | No whitespace errors. |
| `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:/Applications/Codex.app/Contents/Resources/cua_node/bin:$PATH npm run guard:doc-triggers` | pass | `doc-trigger-paths: ok`. |
| `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:/Applications/Codex.app/Contents/Resources/cua_node/bin:$PATH node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/REQ-G01A-group-overview-runtime-implementation.md --include-worktree` | pass | `changedFiles: 4`, category `docs: 4`, source changed files `0`, source net LOC `0`, new source files `0`. |
| `git -C /Users/atilla/Applications/UZMAX智能运营 status --short --branch` | pass | Root/main clean: `## main...origin/main`. |

## No-Code Boundary

- No `apps/**` or `packages/**` files were edited.
- No DB migration, Prisma schema, runtime/API/admin source, test, package/lock, generated file, CI/config, owner HTML or unpacked prototype source was changed.
- No runtime implementation, runtime closure, page implementation, owner acceptance, visual acceptance, M7 closeout, GA-0, production or 1.0 release approval is claimed.
