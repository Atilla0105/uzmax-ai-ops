# REQ-G01 Group Overview Runtime Contract

## 目标

Define the runtime/API/DB contract required before `group.overview` / 集团总览 can render populated REQ-G01 aggregate data.

This is a docs-only contract slice. It creates the precondition for the later real `M7-UI-12-group-overview-page` implementation to use true aggregate data instead of unpacked prototype fixtures, local AppShell tenant state, copied demo rows or LLM-derived values.

This PR does not implement a React page, DB migration, Prisma model/view, NestJS controller/service, admin ApiClient/hook, runtime query, tests, owner acceptance, release approval, GA-0 opening, production/staging mutation, real customer/order-data processing, customer LLM use or 1.0 release.

## 项目 owner/coordinator 决策点与 AI agent 执行/复核责任

Owner/coordinator:

- Decide whether the implementation path should use a DB read model, SQL view, materialized view, repository aggregate query, or a staged hybrid. AI agents may recommend and implement only after an approved implementation spec.
- Decide any real production/staging data access, real customer/order data use, RLS policy rollout, compute/storage cost, refresh cadence, backfill, retention and compliance boundary.
- Decide whether `REQ-G01` implementation may touch DB migrations/read-model support. `packages/db` remains globally serial and must not overlap other DB workers.
- Decide final owner acceptance, GA-0, production and 1.0 release. This contract only defines preconditions and validation expectations.

AI agent:

- Work only in the assigned worktree/branch for this docs-only slice.
- Keep root/main read-only and do not touch worker branches for #178 or #182.
- Do not implement code or change runtime behavior in this PR.
- Record current repo/GitHub facts and keep all implementation claims explicitly future-tense.
- Stop if creating this contract would require modifying `apps/**`, `packages/**`, DB migrations, tests, lockfile, CI/config, owner HTML or unpacked prototype source.

## 时间盒

0.25 workday. If the runtime contract cannot be expressed without code, DB/API implementation, raw customer/order examples, real credentials, production/staging mutation or cross-worker edits, stop and record `BLOCKED`.

## Spec 类型

docs

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/REQ-G01-group-overview-runtime-contract.md`
  - `docs/evidence/M7/REQ-G01-group-overview-runtime-contract.md`
  - `docs/evidence/M7/README.md`
  - `docs/admin-ui-page-migration-ledger.md`
- 说明/备注：
  - This PR may touch only the four docs paths above.
  - Future implementation paths are listed in a separate non-guard section below.
  - If any implementation file must change, open a later approved implementation spec instead of widening this docs-only PR.
- 未列出的模块默认不可改。

## Future Implementation Touch Scope

This section is machine-readable for coordinator planning, but it is not the `guard:pr-shape` touch list for this docs-only PR.

```yaml
future_implementation_touch_scope:
  db:
    serial: true
    paths:
      - packages/db/migrations/**
      - packages/db/src/**
  api:
    paths:
      - apps/api/src/group-overview/**
      - apps/api/src/group-overview.controller.ts
      - apps/api/src/group-overview.service.ts
      - apps/api/src/group-overview.repository.ts
      - apps/api/src/group-overview.types.ts
      - apps/api/src/group-overview.contracts.ts
  admin:
    paths:
      - apps/admin/src/groupOverviewApiClient.ts
      - apps/admin/src/pages/group/GroupOverviewPage.tsx
      - apps/admin/src/pages/PageOutlet.tsx
      - apps/admin/src/pages/registry.ts
  tests:
    paths:
      - apps/api/src/**/*.spec.ts
      - apps/admin/tests/m7-ui-group-overview.spec.ts
      - apps/admin/tests/groupOverviewApiClient.spec.ts
```

Equivalent file names are allowed only if the later implementation spec explains ownership and keeps the same boundaries: DB read model/repository, API controller/service/contracts, admin API client/page wiring and focused tests. The future worker must run `rg` before adding new source files and must record why existing controllers/clients cannot be extended.

## 变更预算与路径分类

Current docs-only PR budget:

- source changed files: 0
- source net LOC: 0
- new source files: 0
- test files changed: 0
- docs changed: <= 4
- package/lock/generated/config/backend/API/DB/worker/cron/CI/global config: 0
- prototype or unpacked source edits: 0
- external API/SDK/provider/connector/adapter basis: none
- exceptions: none

Future implementation budget must be declared by the future implementation spec. This docs-only contract does not authorize code budget.

## 文档触发检查

updated

## Entry Evidence

Worktree / branch entry:

| Fact | Evidence |
|---|---|
| worker `pwd` | `/Users/atilla/.codex/worktrees/req-g01-group-overview-runtime-contract` |
| worker `git status --short --branch` | `## codex/req-g01-group-overview-runtime-contract...origin/main` |
| worker `git branch --show-current` | `codex/req-g01-group-overview-runtime-contract` |
| worker HEAD | `ef6c40264280b4d5366e0895a2556a08c72b3f54` / `docs: add M7 group overview page spec (#185)` |
| root/main checkout | `/Users/atilla/Applications/UZMAX智能运营` |
| root/main status/head before worktree creation | `## main...origin/main`; `ef6c40264280b4d5366e0895a2556a08c72b3f54` |
| root/main policy | Root/main was used only for read/fetch/worktree creation; edits happen only in the assigned worktree. |

GitHub state before creating this PR:

| Item | Current state |
|---|---|
| PR #178 | Open Draft, `codex/m7-ui-11-release-acceptance-page-impl`, transitional release acceptance candidate, not merged. |
| PR #182 | Open Draft, `codex/m7-ui-20-conversation-workbench-page-impl`, conversation workbench implementation candidate, not merged. |
| PR #184 | Merged, merge commit `d7ea07154b6c39d955d26783e1e7bcf021526113`, durable page visual acceptance notes. |
| PR #185 | Merged, merge commit `ef6c40264280b4d5366e0895a2556a08c72b3f54`, `M7-UI-12-group-overview-page` spec-ready docs-only. |

## Process Incident Reference

After this PR was opened, the process incident for the initial root/main patch target slip was recorded and merged via PR #187 / commit `7045967` at `docs/incidents/INC-2026-07-04-req-g01-runtime-root-patch-target.md`. That incident record documents workspace-boundary cleanup and controls only; it does not change this PR's scope, does not approve DB/API/admin implementation, and does not approve owner acceptance, runtime closure, GA-0, production or 1.0 release.

## Source-Of-Truth Reads

- `AGENTS.md`
- `UZMAX智能运营系统-PRD-v1.1.md`
- `UZMAX智能运营系统-技术架构-v1.1.md`
- `UZMAX智能运营系统-后台设计与前端架构-v1.1.md`
- `UZMAX智能运营系统-1.0验收矩阵-v1.1.md`
- `docs/admin-design-system.md`
- `docs/specs/M7-UI-12-group-overview-page.md`
- `docs/evidence/M7/M7-UI-12-group-overview-page.md`
- `docs/evidence/M7/README.md`
- `docs/admin-ui-page-migration-ledger.md`
- Current admin/runtime code read-only for explorer facts: `apps/admin/src/pages/registry.ts`, `apps/admin/src/pages/PageOutlet.tsx`, `apps/admin/src/App.tsx`, `apps/admin/src/shell/AppShell.tsx`, `apps/api/src/**` file inventory.

## Current Repo Facts

| Fact | Evidence |
|---|---|
| #184 visual-source baseline is on `main`. | PR #184 merged via `d7ea071`; `docs/evidence/M7/README.md` records owner HTML and `/Users/atilla/源码/unpacked 6` as hard visual/source baseline. |
| #185 M7-UI-12 is on `main` but docs-only. | PR #185 merged via `ef6c402`; `docs/specs/M7-UI-12-group-overview-page.md` says it does not implement page, runtime/API data, tests, DB/API changes or owner acceptance. |
| `group.overview` exists only as registry/scaffold. | `apps/admin/src/pages/registry.ts:39-51` defines the row with `status: "not_started"` and old target spec placeholder; `apps/admin/src/pages/PageOutlet.tsx:20-34` only handles legacy evidence and `tenant.queue`; `PageOutlet.tsx:36-91` falls through to the planned-page scaffold. |
| AppShell tenant list is local state, not runtime truth. | `apps/admin/src/App.tsx:17-50` defines a local `tenants` array; `App.tsx:52-92` stores route/selected tenant in React state; `App.tsx:218-229` passes local tenants into `AppShell`. |
| AppShell tenant switching is UI routing, not backend authorization. | `apps/admin/src/shell/AppShell.tsx:52-69` derives selected tenant from props; `AppShell.tsx:143-157` renders options from props; `AppShell.tsx:243-257` creates routes from selected ids. |
| There is no group aggregate admin ApiClient/hook. | `rg` across `apps/admin/src` finds existing clients such as confirmation queue, order import, customer asset, AI member, logs/analytics and templates, but no `groupOverview`, `GroupOverview`, `group-overview` aggregate client or hook. |
| There is no group overview/aggregate API controller. | `find apps/api/src -maxdepth 2 -type f` shows controller/runtime files for confirmation queue and conversation ticket; no `group-overview` controller/service/repository/contracts path exists. |

## Contract DTO

The API must return aggregate-only data and metadata. Field names are illustrative; the future implementation spec may refine names, but it must preserve the privacy, provenance and state semantics below.

```ts
type GroupOverviewResponse = {
  generatedAt: string;
  sourceWatermark: GroupOverviewSourceWatermark;
  access: GroupOverviewAccessSummary;
  healthSummary: GroupOverviewHealthSummary;
  tenants: GroupOverviewTenantRow[];
  state: GroupOverviewState;
};

type GroupOverviewHealthSummary = {
  tenantCount: number;
  abnormalTenantCount: number;
  aiBreakerCount: number;
  modelFaultCount: number;
  orderConnectorFaultCount: number;
  channelConnectorFaultCount: number;
  redlineEventCountToday: number;
};

type GroupOverviewTenantRow = {
  tenantId: string;
  tenantRef: string;
  displayName: string;
  businessLine: string;
  healthCategory: "healthy" | "degraded" | "attention" | "breaker" | "offline" | "unknown";
  sessions: number;
  humanNeeded: number;
  slaRisk: number;
  handoffRate: number;
  aiCostPerDay: MoneyAmount;
  evalStatus: "pass" | "running" | "blocked" | "failed" | "stale" | "unavailable";
  orderConnectorStatus: ConnectorAggregateStatus;
  channelConnectorStatus: ConnectorAggregateStatus;
  lastAbnormalAggregateEvent: SafeAggregateEvent | null;
  stale: StaleMetadata;
  degraded: DegradedMetadata[];
  generatedAt: string;
  sourceWatermark: GroupOverviewSourceWatermark;
};
```

Required aggregate fields:

- Tenant identity: tenant id/ref, tenant display name and business line. Display labels must be tenant-level labels only.
- Health category: stable categorical health for filtering/sorting; color must never be the only signal.
- Metrics: sessions, human-needed, SLA risk, handoff rate, AI cost/day.
- Gate/source status: eval status, order connector status, channel connector status.
- Last abnormal aggregate event: category, severity, controlled ref, safe label and age/timestamp. It must not carry customer plaintext or raw payload.
- Freshness metadata: `generatedAt`, source watermark, stale/degraded source details and partial-source flags.

Forbidden DTO fields at group layer:

- Customer plaintext, customer name, phone, Telegram username, external user id, conversation content, message text, raw transcript, screenshot, voice transcript, raw order payload, raw order/customer address/payment data, raw prompt, raw completion, raw tool payload or provider response.
- Any tenant row data that would reveal unauthorized tenant details outside the caller's `AccessContext`.

## Auth / RLS Boundary

The backend is the authority. Frontend hidden states, disabled controls or route filtering are not authorization.

Required request context:

- `AccessContext.orgId`
- authorized tenant ids for the caller
- selected permissions/roles including group overview permission
- actor id/session trace for audit and debugging

Authorization rules:

- A group-role caller may see only aggregate rows for authorized tenant ids in the same org.
- Unauthorized tenants must be omitted, not included as masked rows, unless the owner/coordinator explicitly approves an aggregate-count-only variant in a later spec.
- The API must fail closed for missing/invalid org, tenant scope or permission.
- Any tenant drill-down target emitted by the API must be authorized for the caller; row click must not rely on frontend-only filtering.
- DB-backed implementation must apply repository isolation and RLS/session context where applicable. If a read model/view/materialized view is used, it must still preserve org/tenant isolation and be covered by cross-tenant tests.

## Data Provenance

REQ-G01 values must be computed by code/data, never by LLM judgment.

Required provenance rules:

- Cost, SLA, order state, connector state, model fault, redline count, eval state and handoff metrics must come from deterministic runtime tables/events/eval outputs/connector health records or approved read models.
- LLM may not classify or calculate cost/SLA/order/connector/model-fault values for the group overview contract.
- The API should expose controlled refs and source watermarks instead of raw payloads. Examples: `sourceKind`, `sourceRef`, `sourceUpdatedAt`, `windowStart`, `windowEnd`, `aggregateJobId`, `readModelVersion`.
- If a source is absent, stale or partial, the response must encode degraded metadata instead of fabricating values.
- Metrics must declare time windows and units. Money values must include currency and minor-unit or decimal representation decided by implementation spec.

## State Semantics

The response must let the page distinguish UI states without inferring truth from missing fields.

| State | API encoding expectation | Page behavior |
|---|---|---|
| `loading` | Request in flight; no response claim. | Stable health strip/table skeletons. |
| `empty` | `state.kind: "empty"` with reason such as `no_authorized_tenants` or `no_aggregate_rows`. | No fake rows; explain allowed next step. |
| `error` | Non-2xx or `state.kind: "error"` with safe trace/ref. | Retry affordance and safe reference, no raw payload. |
| `permission_denied` | 403 or `state.kind: "permission_denied"`. | Render no tenant data; explain required role/permission. |
| `degraded` | `state.kind: "degraded"` or per-source degraded metadata. | Read-only truthful values where available; disable unbacked actions. |
| `stale` | `stale.isStale: true`, `stale.ageSeconds`, `stale.thresholdSeconds`, source watermark. | Visible stale label and refresh/read-only semantics. |
| `partial_source` | `state.partialSources[]` and row/source-level degraded reasons. | Show partial-source copy and mark affected metrics. |

Degraded reason enum must be bounded and testable. Initial allowed values:

- `source_unavailable`
- `source_stale`
- `source_partial`
- `permission_scope_partial`
- `read_model_refresh_failed`
- `connector_health_unavailable`
- `eval_state_unavailable`
- `cost_source_unavailable`
- `order_source_unavailable`
- `channel_source_unavailable`
- `redline_source_unavailable`

## Page Dependency

`M7-UI-12-group-overview-page` may render a populated health strip or tenant table only after this contract, or an equivalent owner/coordinator-approved runtime contract, exists and has an implementation path.

Until then, a page worker may only render:

- an honest degraded/read-only shell;
- source-mapped layout chrome without runtime numbers;
- explicit copy that aggregate runtime evidence is unavailable;
- disabled or safe affordances for filters/sorting/navigation that lack backend truth.

A page worker must not import `/Users/atilla/源码/unpacked 6/fixtures/group.ts`, copy fixture rows, use `apps/admin/src/App.tsx` local tenants as aggregate truth, or fill REQ-G01 values from LLM output.

## Implementation Validation Plan

A later implementation PR must include, at minimum:

- Unit/contract tests for DTO serialization, bounded degraded reasons, source watermark semantics and no forbidden fields.
- Backend permission/cross-tenant tests proving group-role callers see only authorized aggregate rows.
- DB/RLS tests for read model/view/materialized view/repository path if DB is touched.
- Tests or static grep proving no customer plaintext, conversation content, phone, Telegram username, raw order payload, raw prompt or raw completion appears in the group aggregate DTO.
- Provenance tests proving cost/SLA/order/connector/model fault/redline values are deterministic code/data values and not LLM judgments.
- Admin ApiClient tests for loading/success/empty/error/permission/degraded/stale/partial-source responses.
- Focused Playwright after page wiring for populated, loading, empty, filtered empty, error, permission denied, degraded, stale/partial source, sorting/filtering and authorized row click.
- `git diff --check`, `npm run guard:doc-triggers`, `guard:pr-shape` with the future implementation spec, and implementation-scope lint/typecheck/build as required.

## Pass Conditions

- This PR changes only the four allowed docs paths.
- Runtime contract DTO includes aggregate-only health summary and tenant rows with stale/degraded/source-watermark metadata.
- Spec states forbidden sensitive/plaintext/raw fields explicitly.
- Spec records auth/RLS/backend-authority requirements and rejects frontend-only permission hiding.
- Spec states data provenance rules and prohibits LLM judgment for numerical/business state values.
- M7 README and page migration ledger point `group.overview` runtime blocker to this spec.
- Evidence records current repo explorer findings and GitHub state without claiming implementation.
- Validation commands pass or record exact blockers.

## Failure Branch

- If any implementation file changes, stop and revert only this worker's unauthorized edits before PR creation.
- If `guard:doc-triggers` or `guard:pr-shape` fails and cannot be fixed within docs-only scope, record the exact blocker and leave the PR Draft.
- If GitHub PR state cannot be verified, record the missing verification and do not state open PR facts as current.
- If future implementation requires raw customer/order samples, secrets, production data, real external connector mutation or owner-only decisions, stop and split to an owner-approved implementation/spike spec.

## Out Of Scope

- No UI/page implementation.
- No DB/API/admin source changes.
- No migrations, Prisma/schema changes, tests, lockfile, generated files, CI/config, worker/cron or dependency changes.
- No edits to `/Users/atilla/Downloads/运营塔台1.0.html` or `/Users/atilla/源码/unpacked 6`.
- No raw prototype fixture import or copied fixture values.
- No owner acceptance, visual acceptance, runtime closure, M7 closeout, GA-0 opening, production deployment, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release approval.
