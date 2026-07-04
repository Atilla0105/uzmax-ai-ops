# REQ-G01A Group Overview Runtime Implementation Spec

## 目标

Implement the first truthful runtime slice for `group.overview` / 集团总览 aggregate data so `M7-UI-12-group-overview-page` can eventually render a populated health summary and tenant table without fixtures, AppShell local tenant state, copied prototype rows or LLM-generated numbers.

This is a docs-only implementation-planning PR. It turns `REQ-G01-group-overview-runtime-contract` into an unambiguous first code-worker contract, but it does not implement DB, API, admin, runtime queries, migrations, tests, owner acceptance, visual acceptance, GA-0, production or 1.0 release.

## 项目 owner/coordinator 决策点与 AI agent 执行/复核责任

Owner/coordinator:

- Confirm whether the first code implementation should start as DB+API contract/read-model foundation, with admin wiring/page population as a later PR.
- Decide production/staging data access, real customer/order-data use, RLS rollout, read-model refresh cadence, backfill, retention, compute/storage cost and compliance boundaries.
- Decide whether any real production/staging aggregate rows may be generated or backfilled. AI agents must not use real customer/order/message data without explicit owner approval.
- Keep final owner acceptance, visual acceptance, M7 closeout, GA-0, production and 1.0 release decisions owner-only.

AI agent:

- Work only in the assigned worktree/branch for this docs-only slice.
- Keep root/main checkout read-only and do not touch #178/#182 worktrees.
- Do not implement DB/API/admin code in this PR.
- Before any future code implementation, re-read this spec, `REQ-G01-group-overview-runtime-contract`, `M7-UI-12-group-overview-page`, AGENTS, v1.1 docs and current code.
- Stop if a future worker discovers overlapping DB/schema, API, admin or shared-config PRs; `packages/db` schema and migrations are globally serial.

## 时间盒

0.25 workday for this docs-only spec/evidence slice.

If expressing the implementation plan requires changing source code, migrations, tests, lockfile, CI/config, owner HTML, unpacked prototype source, production/staging data or #178/#182 worktrees, stop and report `BLOCKED`.

## Spec 类型

docs

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/REQ-G01A-group-overview-runtime-implementation.md`
  - `docs/evidence/M7/REQ-G01A-group-overview-runtime-implementation.md`
  - `docs/evidence/M7/README.md`
  - `docs/admin-ui-page-migration-ledger.md`
- 说明/备注：
  - This PR may touch only the four docs paths above.
  - Future implementation paths are listed separately below and are not part of this docs-only PR touch list.
  - If any implementation file changes in this PR, stop and clean up before validation.
- 未列出的模块默认不可改。

## Future Implementation Touch Scope

This section is for the future code worker and coordinator planning. It is not the `guard:pr-shape` touch list for this docs-only PR.

Recommended sequence:

1. `REQ-G01A-code-01`: DB + API runtime foundation.
2. `REQ-G01A-code-02`: admin ApiClient + honest page wiring after code-01 is merged and validated.

Rationale: the first slice likely touches `packages/db/prisma/schema.prisma`, migrations, DB contracts, API controller/service/repository/runtime and tests. Adding admin page rendering in the same PR would combine schema serial work, API authorization/RLS, DTO privacy/provenance, client validation, visual states and page routing in one review. That is too large for the default PR budget and too risky for cross-tenant/RLS review.

```yaml
future_implementation_touch_scope:
  code_01_db_api_foundation:
    db_serial: true
    source:
      - packages/db/prisma/schema.prisma
      - packages/db/src/**
      - apps/api/src/group-overview.controller.ts
      - apps/api/src/group-overview.service.ts
      - apps/api/src/group-overview.repository.ts
      - apps/api/src/group-overview.runtime.ts
      - apps/api/src/group-overview.contracts.ts
      - apps/api/src/app.module.ts
    migrations:
      - packages/db/migrations/**
    tests:
      - apps/api/src/**/*.spec.ts
      - packages/db/src/**/*.test.ts
      - scripts/tests/**/*.mjs
    docs_evidence:
      - docs/evidence/M7/REQ-G01A-group-overview-runtime-implementation.md
      - docs/admin-ui-page-migration-ledger.md
      - docs/evidence/M7/README.md
  code_02_admin_wiring:
    source:
      - apps/admin/src/groupOverviewApiClient.ts
      - apps/admin/src/pages/group/GroupOverviewPage.tsx
      - apps/admin/src/pages/PageOutlet.tsx
      - apps/admin/src/pages/registry.ts
    tests:
      - apps/admin/tests/m7-ui-group-overview.spec.ts
      - apps/admin/tests/groupOverviewApiClient.spec.ts
    docs_evidence:
      - docs/evidence/M7/M7-UI-12-group-overview-page.md
      - docs/evidence/M7/REQ-G01A-group-overview-runtime-implementation.md
      - docs/admin-ui-page-migration-ledger.md
```

`apps/api/src/group-overview.contracts.ts` must consolidate DTOs, types, errors and validators for code-01 so the future implementation stays within `new source files <= 5`. If the future worker cannot keep controller/service/repository/runtime/contracts to five new API source files, it must stop before implementation and request an owner-approved large/new-file exception in the future code spec instead of silently exceeding budget.

Equivalent filenames are allowed only if the future implementation spec explains why existing files cannot be extended, records `rg` evidence before adding new source files and still respects the five-new-source-file ceiling unless an owner-approved exception exists.

## 变更预算与路径分类

Current docs-only PR budget:

- source changed files: 0
- source net LOC: 0
- new source files: 0
- test files changed: 0
- docs changed: <= 4
- package/lock/generated/config/backend/API/DB/worker/cron/CI/global config: 0
- owner HTML or unpacked prototype source edits: 0
- external API/SDK/provider/connector/adapter basis: none
- exceptions: none

Future code-01 budget recommendation:

- source changed files: <= 12
- net source LOC: <= 600
- new source files: <= 5
- migrations: allowed only if `packages/db` is globally serial and the migration contains no raw customer/order/message payload examples
- tests: focused DB/API/RLS/provenance tests required; test LOC does not count against source budget
- admin page implementation: out of scope for code-01 unless coordinator explicitly approves a narrower no-schema/no-API path

## 文档触发检查

updated

## Required Reads Completed For This Docs Slice

- `AGENTS.md`
- `.agents/skills/impeccable/SKILL.md`
- `.agents/skills/impeccable/reference/product.md`
- `PRODUCT.md` and `DESIGN.md` through Impeccable context for `apps/admin`
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

Read-only code shape inspected before writing:

- `packages/db/prisma/schema.prisma`
- `packages/db/src/index.ts`
- `packages/db/src/prisma-runtime.ts`
- `packages/db/migrations/**`
- `apps/api/src/access-context.ts`
- `apps/api/src/access-context-core.ts`
- `apps/api/src/app.module.ts`
- `apps/api/src/logs-analytics-runtime.ts`
- `apps/api/src/logs-analytics-runtime.contracts.ts`
- `apps/api/src/logs-analytics-runtime.repository.ts`
- `apps/api/src/confirmation-queue.controller.ts`
- `apps/api/src/confirmation-queue.service.ts`
- `apps/api/src/confirmation-queue.repository.ts`
- `apps/api/src/customer-asset.controller.ts`
- `apps/api/src/customer-asset.service.ts`
- `apps/api/src/customer-asset.repository.ts`
- `apps/admin/src/customerAssetApiClient.ts`
- `apps/admin/src/confirmationQueueApiClient.ts`
- `apps/admin/src/pages/registry.ts`
- `apps/admin/src/pages/PageOutlet.tsx`
- `apps/admin/tests/m7-ui-page-router.spec.ts`
- `apps/admin/tests/m7-ui-foundation.spec.ts`
- `apps/admin/tests/m7-ui-confirmation-queue.spec.ts`

## Current Repo Facts From Read-Only Inspection

| Area | Fact | Evidence |
|---|---|---|
| page registry | `group.overview` exists only as a registry row and still points at the older placeholder spec. | `apps/admin/src/pages/registry.ts` has `id: "group.overview"`, `status: "not_started"` and `targetSpecId: "M7-UI-04A-group-overview"`. |
| page outlet | `group.overview` is not implemented. | `apps/admin/src/pages/PageOutlet.tsx` only special-cases `legacy.evidence` and `tenant.queue`; all other pages render planned-page scaffold. |
| admin shell | local tenant data is not runtime authority. | `apps/admin/src/App.tsx` and shell tests use local route/tenant state for current M7 shell behavior. |
| admin client | no group overview aggregate ApiClient/hook exists. | `rg` finds ApiClients for confirmation queue, order import, customer asset, AI member, logs/analytics and templates, but no `groupOverview`, `GroupOverview` or `group-overview` client. |
| API route | no group overview API controller/service/repository exists. | `find apps/api/src` shows access context, confirmation queue, conversation ticket, customer asset, logs/analytics, order import, template copy and AI member runtime files, but no `group-overview` path. |
| API pattern | future API should extend existing guard/controller/service/repository/runtime patterns instead of inventing a parallel stack. | Existing controllers use `@UseGuards(ApiAccessContextGuard)`, `request.accessContext`, `assertPermission`, typed domain errors and repository ports. |
| RLS pattern | future DB-backed implementation should use repository isolation and RLS transaction runners. | Existing runtime repositories use `createRlsTransactionContext`, `set_config(app.org_id/app.tenant_id, ..., true)` and `rls_prisma_gateway` modes. |
| DB schema | no dedicated group aggregate read model exists today. | `packages/db/prisma/schema.prisma` has platform, tenant, permissions, channels, tickets, customers, order snapshots/query logs, evals, LLM call logs, distill health, AI members and confirmation items; no group overview aggregate model/view contract. |
| migrations | DB migrations are already sequential and schema work is a global serial point. | Existing migrations end at `0008_m5r05_logs_analytics_runtime.sql`; AGENTS and technical architecture require `packages/db` schema changes to be globally serial. |
| privacy/provenance | existing clients/contracts already reject raw or forbidden payload shapes in sensitive areas. | Confirmation queue/logs analytics code uses controlled refs and forbidden-key checks for raw/customer/order/prompt-like payloads. |

Conclusion: a DB read model or SQL view/materialized view is likely needed for code-01 if the API must return truthful group-level health rows without scanning raw customer/message/order content at request time. A pure admin-only implementation is not acceptable, and a pure in-memory fixture implementation would violate REQ-G01 and M7-UI-12.

## Runtime Implementation Contract

Backend authority:

- The API, not the admin page, is the authority for `group.overview`.
- Admin hidden controls, disabled buttons, local route state or tenant switcher state are not authorization.
- The admin page may render populated data only from the approved runtime endpoint and typed ApiClient.

Recommended endpoint shape for code-01:

- `GET /group-overview`
- guarded by `ApiAccessContextGuard`
- service asserts a group overview read permission such as `group:overview:read` or the exact permission key approved by the future implementation spec
- repository receives `AccessContext` and returns authorized aggregate rows only
- runtime mode defaults to `disabled` and fails/degrades honestly until `rls_prisma_gateway` or equivalent approved runtime is configured

Aggregate-only DTO requirements:

- include `generatedAt`, `windowStart`, `windowEnd`, `sourceWatermark`, `readModelVersion` or equivalent provenance
- include health summary counts for tenants, abnormal tenants, AI breaker, model fault, order connector fault, channel connector fault and redline events
- include tenant rows with tenant id/ref, display label, business line, health category, sessions, human-needed, SLA risk, handoff rate, AI cost/day, eval status, order connector status, channel connector status and last abnormal aggregate event
- include state encoding for `empty`, `permission_denied`, `degraded`, `stale` and `partial_source`
- include units and windows for counts, rates, money and time-based values

Forbidden DTO/data fields:

- customer plaintext, customer name, phone, Telegram username, external user id, conversation content, message text, raw transcript, screenshot, voice transcript, raw order payload, raw address/payment data, raw prompt, raw completion, raw tool payload, provider response, storage URL, secret or inline blob
- unauthorized tenant rows or tenant details outside the caller's `AccessContext`
- any LLM-classified or LLM-calculated SLA, cost, order, connector, redline, eval or model-fault value

Auth/RLS requirements:

- request context must include org id, user id, selected tenant context if required by current guard, authorized tenant ids/permissions and actor/session trace where available
- group-role callers may see only authorized aggregate rows in the same org
- unauthorized tenants must be omitted, not masked into row-level hints, unless owner/coordinator approves a count-only variant in a later spec
- DB-backed implementation must preserve repository scoping plus RLS/session context; if the current `AccessContext` supports only one selected tenant, code-01 must explicitly solve or document the approved group-scope RLS strategy before returning multi-tenant aggregates
- cross-tenant tests are required before claiming runtime closure

Deterministic provenance:

- SLA values come from ticket/conversation SLA fields or approved metric/read-model rows
- cost values come from `llm_call_log` or approved accounting/read-model rows
- order connector values come from `order_connector`, `order_snapshot`, `order_query_log`, import jobs or approved connector health/read-model rows
- channel connector values come from channel connection/heartbeat state or approved connector health/read-model rows
- eval/redline/model values come from eval run/gate/result, redline/breaker events, LLM call failure state or approved read-model rows
- source absence, stale data and partial source availability must be encoded as degraded metadata, not fabricated values

## Page Boundary

No page worker may render populated `group.overview` health cards or tenant rows until this runtime implementation, or an equivalent owner/coordinator-approved runtime implementation, exists and is validated.

Until then, a page worker may only render an honest degraded/read-only shell that states aggregate runtime is unavailable. It must not use:

- `/Users/atilla/源码/unpacked 6/fixtures/group.ts` values as runtime truth
- local AppShell tenant state as backend authority
- copied prototype demo rows
- LLM-generated numbers or classifications
- customer/order/message plaintext at group layer

## Visual And IA Boundary To Preserve

- Owner HTML `/Users/atilla/Downloads/运营塔台1.0.html` and `/Users/atilla/源码/unpacked 6` remain the hard visual/structure baseline.
- `docs/admin-design-system.md`, `PRODUCT.md`, `DESIGN.md` and Impeccable product-register guidance require a dense, status-first operations tower, not a decorative dashboard.
- Sidebar category grouping and bottom collapse control must be checked by page workers when sidebar is visible.
- Group and tenant layers remain separate: group overview is group layer; clicking an authorized tenant enters tenant layer after backend authorization.
- Release/acceptance remains a low-priority transitional page and must not displace real admin pages.
- This runtime spec does not claim owner visual acceptance or desktop pixel/detail parity.

## Validation Plan For Future Code Worker

Code-01 DB+API foundation must run and record, as applicable:

- `git diff --check`
- `npm run guard:doc-triggers`
- `node scripts/guards/pr-shape.mjs --base origin/main --spec <future-code-spec> --include-worktree`
- Prisma generation and migration checks if `packages/db/prisma/schema.prisma` or migrations are touched
- focused DB/RLS tests for authorized group aggregates, unauthorized tenant omission, cross-tenant denial and stale/partial source encoding
- focused API tests for success, empty, permission denied, invalid access context, degraded runtime disabled/not configured, stale/partial source response and forbidden raw field rejection
- focused admin ApiClient tests only in code-02, including payload validation and forbidden field/provenance checks
- admin build/lint/typecheck only when admin source is touched
- static forbidden-field checks for DTOs, fixtures and tests: no phone, Telegram username, raw message, raw order payload, prompt/completion/provider/tool payload, secret or blob/URL values
- provenance checks proving SLA/cost/order/connector/eval/redline/model values are code/data-derived
- no `.skip`, `.only`, `xit`, `xfail`, reduced assertions, widened mocks or snapshot bloat

Code-02 admin wiring must additionally run focused Playwright coverage for loading, empty, filtered empty, error, permission denied, degraded/stale/partial-source states, search/filter/sort, authorized row click and 320px no-overflow fallback.

## Pass Conditions

- This docs-only PR changes only the allowed docs paths.
- Spec records current repo facts from read-only inspection and future implementation scope.
- Future implementation touch scope explicitly includes `packages/db/prisma/schema.prisma`, migrations and DB source paths when DB read-model work is required.
- Spec states the conservative split recommendation and page boundary.
- Evidence records required reads, entry state, decisions, validation results and no code/runtime implementation.
- M7 README and ledger point to this implementation spec without claiming runtime closure.

## Failure Branch

- If assigned worktree/branch does not match, stop and report `BLOCKED_WORKTREE_MISMATCH`.
- If any write is needed outside the allowed docs list, stop and report `BLOCKED_SCOPE_EXPANSION`.
- If code implementation appears necessary to validate the plan, stop and leave runtime implementation to the future code worker.
- If DB/schema work overlaps another active worker, future code-01 must stop until coordinator serializes the queue.

## Out Of Scope

- No DB/API/admin implementation.
- No migrations, Prisma generation, source code, tests, package/lock, generated files, CI/config, owner HTML or unpacked prototype source changes.
- No production/staging mutation or real data access.
- No runtime closure, page implementation, owner visual acceptance, owner product acceptance, M7 closeout, GA-0 opening, production deployment or 1.0 release approval.
