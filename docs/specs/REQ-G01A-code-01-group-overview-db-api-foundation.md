# REQ-G01A-code-01 Group Overview DB/API Foundation

## 目标

Define the authoritative DB + API implementation contract for the first truthful runtime foundation behind `group.overview` / 集团总览.

This spec is created by a docs-only PR. The current PR does not implement DB migrations, Prisma schema, NestJS controllers/services/repositories/runtime providers, tests, admin wiring, page rendering, owner acceptance, visual acceptance, GA-0, production or 1.0 release. A later code worker may use this same spec only after the coordinator confirms `packages/db` is globally serial and no overlapping API/runtime worker is active.

The code-01 implementation must produce a backend-owned aggregate runtime foundation that can return authorized, aggregate-only group overview data or an honest disabled/degraded/stale/partial-source state. It must not populate the admin page; admin ApiClient/page wiring remains `REQ-G01A-code-02` after code-01 merges and is validated.

## 项目 owner/coordinator 决策点与 AI agent 执行/复核责任

Owner/coordinator:

- Confirm the `packages/db` queue is globally serial before any code PR touches schema or migrations.
- Decide any production/staging data access, real customer/order/message data use, backfill, refresh cadence, materialized-view/table storage cost, retention, RLS rollout and compliance boundary.
- Confirm the exact group overview permission key if `group:overview:read` is not acceptable.
- Decide whether code-01 may ship with partial-source/degraded fields when current schema lacks a dedicated source, such as business-line labels, redline event table or order connector health table.
- Keep final owner product acceptance, visual acceptance, runtime closure, M7 closeout, GA-0, production and 1.0 release decisions owner-only.

AI agent/code worker:

- Work only in the assigned worktree/branch for code-01 and record `pwd`, `git status --short --branch`, `git branch --show-current` and worker-boundary guard evidence before writing.
- Re-read `AGENTS.md`, this spec, `REQ-G01-group-overview-runtime-contract`, `REQ-G01A-group-overview-runtime-implementation`, `M7-UI-12-group-overview-page`, M7 ledger/evidence, v1.1 source docs and current DB/API code before implementation.
- Use existing DB/API patterns first: `ApiAccessContextGuard`, `AccessContext`, service/repository separation, runtime provider token, disabled runtime mode, `rls_prisma_gateway`, `createRlsTransactionContext`, controlled refs, bounded validators and typed domain errors.
- Stop if implementation requires admin page wiring, owner HTML/prototype edits, real data/secrets, external connector mutation, prompt/model/knowledge changes, CI/global config changes or touching #178/#182 worktrees.
- Stop if the code needs more than five new source files or exceeds budget without an owner-approved exception. Do not self-approve exceptions.

## 时间盒

Docs-only spec PR: 0.25 workday.

Future code-01 implementation: 0.75 workday target. If DB group-scope RLS strategy, Prisma view support, or source-table availability cannot be resolved inside that box without unsafe scope expansion, stop and report `BLOCKED_RUNTIME_STRATEGY` with evidence.

## Spec 类型

feature

Current PR type: docs-only implementation spec.

Future code PR type: DB/API runtime foundation.

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/REQ-G01A-code-01-group-overview-db-api-foundation.md`
  - `docs/evidence/M7/REQ-G01A-code-01-group-overview-db-api-foundation.md`
  - `docs/evidence/M7/README.md`
  - `docs/admin-ui-page-migration-ledger.md`
  - `packages/db/prisma/schema.prisma`
  - `packages/db/src/**`
  - `packages/db/migrations/**`
  - `apps/api/src/group-overview.controller.ts`
  - `apps/api/src/group-overview.service.ts`
  - `apps/api/src/group-overview.repository.ts`
  - `apps/api/src/group-overview.runtime.ts`
  - `apps/api/src/group-overview.contracts.ts`
  - `apps/api/src/app.module.ts`
  - `scripts/tests/req-g01a-code-01-group-overview-db-api-foundation.test.mjs`
  - `apps/api/src/group-overview*.spec.ts`
  - `packages/db/src/group-overview*.test.ts`
- 说明/备注：
  - Current docs-only PR may change only the four docs paths at the top of this list.
  - Future code-01 may use the DB/API/test paths above only for DB + API runtime foundation.
  - Admin source, admin tests, page wiring, visual evidence, owner HTML and unpacked prototype source are intentionally absent from code-01.
  - Focused DB/API tests for code-01 must use the explicit future test paths above; do not introduce non-existent package-local test roots.
  - If the future worker proves `schema.prisma` does not need a change because the SQL view is queried through a typed `$queryRaw` port, it must record that decision with read-only evidence.
- 未列出的模块默认不可改。

## 变更预算与路径分类

Current docs-only PR budget:

- source changed files: 0
- source net LOC: 0
- new source files: 0
- test files changed: 0
- docs changed: <= 4
- package/lock/generated/config/backend worker/cron/admin source/CI/global config: 0
- owner HTML or unpacked prototype source edits: 0
- external API/SDK/provider/connector/adapter basis: none
- exceptions: none

Future code-01 budget:

- changed source files: <= 12
- net source LOC: <= 600
- new source files: <= 5
- required new API source files if needed: `group-overview.controller.ts`, `group-overview.service.ts`, `group-overview.repository.ts`, `group-overview.runtime.ts`, `group-overview.contracts.ts`
- `group-overview.contracts.ts` must consolidate DTOs, types, errors, validators and forbidden-field checks so code-01 stays within five new source files.
- migration SQL and generated Prisma artifacts are reported separately; generated files are not source budget.
- tests are required and do not count against source LOC, but test deletion, assertion weakening, `.skip`, `.only`, `xit` or `xfail` is blocked.
- admin wiring budget: 0 for code-01.
- exceptions: none. If more files/LOC are required, stop before implementation and request owner-approved exception in a follow-up spec/PR.

## 文档触发检查

updated

## Required Reads Completed For This Docs Slice

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

Read-only code patterns inspected:

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

The docs-only worker did not read or modify `/Users/atilla/Downloads/运营塔台1.0.html` or `/Users/atilla/源码/unpacked 6`.

## Current Repo Facts From Read-Only Inspection

| Area | Fact | Evidence |
|---|---|---|
| branch base | Current assigned worktree and root/main are at `87a5ae4` / `docs: plan REQ-G01A group overview runtime implementation (#188)`. | `git rev-parse HEAD`; `git log -1 --oneline`; root status `## main...origin/main`. |
| no-merged branches | Non-main branches not merged into `main` are #178/#182 worker branches only. | `git branch --no-merged main` returned `codex/m7-ui-11-release-acceptance-page-impl` and `codex/m7-ui-20-conversation-workbench-page-impl`. |
| open PR tool | Bare `gh` is not installed in this shell. | `gh pr list ...` failed with `zsh:1: command not found: gh`; `/opt/homebrew/bin/gh` and `/usr/local/bin/gh` do not exist. |
| group overview API | No `group-overview` controller/service/repository/runtime/contracts path exists today. | `rg` finds only docs and admin registry references for `groupOverview`, `GroupOverview`, `group-overview`, `group.overview`. |
| app module pattern | Runtime controllers/providers are registered directly in `AppModule` with provider tokens and factory providers. | `apps/api/src/app.module.ts` registers logs analytics, AI member, template copy, confirmation queue, customer asset, order import and related provider tokens. |
| access context | `AccessContext` includes `orgId`, `selectedTenantId`, `tenantIds`, `permissions`, `membershipVersion` and `userId`. | `packages/authz/src/index.ts`. |
| current authz/RLS mode | Current RLS transaction helper sets only `app.org_id` and `app.tenant_id`; existing policies are single selected-tenant scoped. | `packages/db/src/index.ts`, `apps/api/src/access-context.ts`, `packages/db/migrations/*.sql`. |
| group-scope gap | `tenantIds` exists in `AccessContext`, but existing RLS policies and runtime repositories query by selected tenant. Multi-tenant group aggregates need an explicit group-scope strategy. | `RlsPrismaAuthzRepository`, `createRlsTransactionContext`, logs analytics and confirmation queue repositories. |
| DB source tables | Current schema has `tenant`, `channel_connection`, `conversation`, `ticket`, `order_snapshot`, `order_query_log`, `eval_gate`, `llm_call_log`, `ai_member`, `audit_log`, `login_log`, `presence_log` and related tenant-scoped tables. | `packages/db/prisma/schema.prisma`. |
| missing sources | No dedicated `group_overview_*` read model, no `metric_daily` model, no `redline_event` model and no explicit order connector health table exist on current main. | `schema.prisma` and migrations inventory. |
| tenant labels | `Tenant` has `slug`, `name`, `status`; it does not have a business-line field. | `packages/db/prisma/schema.prisma` `model Tenant`. |
| privacy pattern | Existing contracts reject raw/customer/order/phone/telegram/prompt/completion/secret/url-like fields and require controlled refs. | `confirmation-queue.service.ts`, `logs-analytics-runtime.contracts.ts`, `m5-operations-contracts.ts`. |
| disabled runtime pattern | Existing runtime providers default to `disabled` or in-memory modes and require explicit `rls_prisma_gateway` for DB-backed runtime. | `logs-analytics-runtime.repository.ts`, `confirmation-queue.runtime.ts`, `prisma-runtime.ts`. |

## DB Foundation Contract

Code-01 must create a read-only DB foundation for group overview aggregates. Preferred strategy:

1. Add a manual SQL migration named with the next sequential migration number, e.g. `0009_req_g01a_code_01_group_overview_foundation.sql`.
2. Create a read-only SQL view named `group_overview_tenant_aggregate_v1`.
3. Do not create a refresh job, cron, worker, backfill or materialized view in code-01 unless the coordinator explicitly approves the storage/refresh decision before implementation.
4. Query the view through the repository using typed `$queryRaw` if Prisma view generation is not already proven in this repo.
5. Touch `packages/db/prisma/schema.prisma` only if the future worker verifies the repo's Prisma version/generation supports the chosen read-only view mapping without generated churn. If not, leave `schema.prisma` unchanged and record the reason in evidence.
6. Grant read access only to `uzmax_app_runtime`; revoke public access.
7. Preserve RLS/depth isolation. If the view is queried under a selected tenant RLS context, code-01 must not fake a group aggregate by looping over unauthorized tenants. If group-scope requires a new RLS context or security-barrier view policy, implement and test it explicitly before claiming runtime closure.

The SQL view must be aggregate-only and must not expose message content, customer identity, raw order payloads, raw prompts/completions, provider responses, storage URLs, external subject refs or other plaintext/raw payload fields.

Minimum view columns or typed raw row fields:

- `org_id`
- `tenant_id`
- `tenant_slug`
- `tenant_name`
- `tenant_status`
- `generated_at`
- `window_start`
- `window_end`
- `source_watermark`
- `read_model_version`
- `session_count`
- `human_needed_count`
- `sla_risk_count`
- `handoff_rate_bps`
- `ai_cost_micros`
- `ai_breaker_count`
- `model_fault_count`
- `order_connector_fault_count`
- `channel_connector_fault_count`
- `redline_event_count`
- `eval_status`
- `order_source_status`
- `channel_source_status`
- `last_abnormal_kind`
- `last_abnormal_ref`
- `last_abnormal_at`
- `degraded_reasons`
- `partial_sources`

When a source is unavailable in current schema, the row must encode a bounded degraded reason and a partial-source marker instead of fabricating a number. Initial source gaps that code-01 must handle honestly:

- business-line label: no source field exists on `tenant`; do not derive it from `tenant.slug` unless the owner approves that mapping.
- redline events: no `redline_event` table exists; only use `llm_call_log.redline_summary` if the future worker defines and tests a deterministic JSON predicate, otherwise mark source unavailable.
- order connector health: no order connector health table exists; `order_snapshot`, `import_job` and `order_query_log` can support stale/import/query signals, but not a live connector-health claim unless a deterministic source exists.
- model fault: `llm_call_log.status` can support recent failure/fallback counts, but not broad provider incident claims without deterministic source evidence.

## API Foundation Contract

Recommended endpoint:

- `GET /group-overview`
- `@Controller("group-overview")`
- `@UseGuards(ApiAccessContextGuard)`
- service asserts `group:overview:read` unless owner/coordinator approves a different permission key
- returns only aggregate DTO and bounded state metadata
- defaults to disabled runtime mode until `UZMAX_GROUP_OVERVIEW_RUNTIME_MODE=rls_prisma_gateway` or an equivalent approved mode is configured

Required API source shape:

- `apps/api/src/group-overview.controller.ts`: controller, request access-context extraction, query parsing, HTTP error mapping.
- `apps/api/src/group-overview.service.ts`: permission assertion, state assembly, summary calculation from repository rows, no raw DB delegates.
- `apps/api/src/group-overview.repository.ts`: repository port and DB query implementation; owns row mapping and group-scope filtering; no controller/service raw Prisma queries.
- `apps/api/src/group-overview.runtime.ts`: runtime mode reader, disabled repository, RLS/query runner/provider factory, environment wiring.
- `apps/api/src/group-overview.contracts.ts`: DTOs, bounded enums, validators, errors, forbidden-field checks, row sanitization, provenance helpers.
- `apps/api/src/app.module.ts`: register controller and provider token only; do not create a new Nest module unless a future spec approves module restructuring.

Required runtime modes:

- `disabled`: default; endpoint returns a safe degraded/disabled response or 503 as defined by the service contract. It must not fall back to fixtures, local tenants or demo values.
- `rls_prisma_gateway`: uses `createUzmaxPrismaClientFromEnv`, explicit RLS/group-scope setup and deterministic SQL/query logic.

The API must expose enough state for code-02 admin wiring to render loading, empty, error, permission denied, disabled/degraded, stale and partial-source states without guessing.

## DTO And State Contract

The final field names may differ only if the future worker documents the mapping to `REQ-G01-group-overview-runtime-contract`. Required semantics:

```ts
type GroupOverviewRuntimeResponse = {
  generatedAt: string;
  window: { start: string; end: string };
  sourceWatermark: {
    readModelVersion: "group_overview_tenant_aggregate_v1";
    maxSourceUpdatedAt: string | null;
    partialSources: GroupOverviewSourceGap[];
  };
  access: {
    orgId: string;
    selectedTenantId: string;
    authorizedTenantIds: string[];
    permission: "group:overview:read" | string;
  };
  healthSummary: GroupOverviewHealthSummary;
  tenants: GroupOverviewTenantRow[];
  state: GroupOverviewRuntimeState;
};
```

Each tenant row must include:

- tenant id, tenant ref/slug, tenant display name
- business-line label or a nullable/controlled unavailable state with `business_line_source_unavailable`
- health category
- sessions, human-needed, SLA risk, handoff rate, AI cost/day
- eval, order source and channel source status
- safe last abnormal aggregate event with controlled ref only
- stale/degraded/partial-source metadata

Bounded states:

- `ready`
- `empty`
- `permission_denied`
- `disabled`
- `degraded`
- `stale`
- `partial_source`
- `error`

Initial bounded degraded/source-gap reasons:

- `business_line_source_unavailable`
- `source_unavailable`
- `source_stale`
- `source_partial`
- `permission_scope_partial`
- `read_model_unavailable`
- `read_model_refresh_not_configured`
- `connector_health_unavailable`
- `eval_state_unavailable`
- `cost_source_unavailable`
- `order_source_unavailable`
- `channel_source_unavailable`
- `redline_source_unavailable`
- `model_fault_source_unavailable`

Forbidden DTO/request/response fields:

- customer plaintext, customer display name, phone, Telegram username, external user id, conversation content, message text, raw transcript, screenshot, voice transcript, raw order payload, raw address/payment data, raw prompt, raw completion, raw tool payload, provider response, storage URL, secret, token, cookie, inline blob or base64 payload.

The contracts file must include tests or reusable validators that fail if forbidden keys or unsafe URL/blob/base64 values appear in request filters, row metadata or response payload.

## Authz And Group-Scope RLS Strategy

Backend authority is mandatory. Frontend hidden controls or route filtering are not authorization.

Required behavior:

- Missing/invalid bearer identity, org id, selected tenant id or access context fails closed.
- Caller must hold group overview read permission on the selected tenant context or an owner-approved group context.
- The response may include only rows whose `tenant_id` is in `AccessContext.tenantIds` and whose `org_id` equals `AccessContext.orgId`.
- Unauthorized tenants must be omitted, not masked into named rows.
- If the current RLS design cannot safely query multiple authorized tenants in one transaction, code-01 must implement a tested group-scope read strategy or return `disabled/degraded` with `permission_scope_partial`; it must not bypass RLS with application-only filtering.
- Cross-tenant tests must cover authorized tenant rows, omitted unauthorized tenant rows, forged tenant id/header/query attempts and no customer plaintext leakage.

Acceptable strategies, in preference order:

1. Security-barrier or RLS-compatible SQL view that can read authorized tenant aggregates using a bounded group-scope setting approved in code-01.
2. Per-authorized-tenant RLS transactions that aggregate sanitized rows only, if the implementation proves it does not leak unauthorized rows and stays within performance/budget.
3. Disabled/degraded runtime until a follow-up ADR/spec defines group-scope RLS, if neither strategy can be implemented safely.

Any strategy that uses a bypass role, service role, raw public grant, or production data export is out of scope for code-01.

## Deterministic Provenance Rules

REQ-G01 values must be computed from code/data only:

- Sessions: `conversation` rows in the declared window, by org/tenant.
- Human needed: open/handoff/pending handoff tickets/conversations using deterministic status fields.
- SLA risk: `ticket.sla_due_at` and ticket state; no LLM/SLA inference.
- Handoff rate: deterministic numerator/denominator from ticket/conversation rows.
- AI cost: `llm_call_log.cost_micros` in the declared window.
- AI breaker: `ai_member.status = breaker_offline` or equivalent enum.
- Model fault: bounded deterministic source such as recent failed/fallback `llm_call_log` rows; do not claim provider incident scope.
- Eval status: `eval_gate.status` and related deterministic rows.
- Order source: `order_snapshot`, `import_job`, `order_query_log` or approved connector health source; stale/partial when live health is absent.
- Channel source: `channel_connection.status`.
- Redline: deterministic redline event source only; otherwise degraded/partial.
- Last abnormal event: safe category/ref/timestamp only; no raw payload.

Every metric must declare window and unit. Money uses micros until a later owner-approved accounting contract changes the unit.

## Tests Required For Code-01

At minimum:

- Unit tests for contracts: bounded enums, disabled/degraded/stale/partial state encoding, source watermark mapping, forbidden-key/value rejection and no raw-field response.
- API tests for success, empty, permission denied, missing access context, runtime disabled, invalid runtime mode, stale/partial sources and forbidden payload rejection.
- Repository tests for authorized row filtering, unauthorized tenant omission, source gap mapping and deterministic metric calculations.
- DB/RLS tests or true-DB smoke tests for the view/query path, including two tenants in one org and at least one unauthorized tenant.
- Static grep or snapshot-safe assertion that response payload does not contain forbidden raw fields.
- AppModule wiring test/import check if existing test structure supports it.

No admin Playwright or admin ApiClient tests belong in code-01.

## Validation Commands

Current docs-only PR must run and record:

- `git diff --check`
- `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:/Applications/Codex.app/Contents/Resources/cua_node/bin:$PATH npm run guard:doc-triggers`
- `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:/Applications/Codex.app/Contents/Resources/cua_node/bin:$PATH node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/REQ-G01A-code-01-group-overview-db-api-foundation.md --include-worktree`
- final worker-boundary guard with `UZMAX_ASSIGNED_WORKTREE=/Users/atilla/.codex/worktrees/req-g01a-code-01-db-api-foundation-spec` and `UZMAX_PRIMARY_ROOT=/Users/atilla/Applications/UZMAX智能运营`

Future code-01 PR must additionally run and record, as applicable:

- worker-boundary guard before writing and before commit
- Prisma generation/migration validation if `schema.prisma` or migrations change
- focused DB/RLS true-DB tests or smoke harness
- focused API/unit tests for group overview
- API lint/typecheck/build command used by the repo
- `git diff --check`
- `npm run guard:doc-triggers`
- `node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/REQ-G01A-code-01-group-overview-db-api-foundation.md --include-worktree`

## Pass Conditions

Current docs-only PR:

- Adds this spec and evidence file only, plus M7 README/ledger updates.
- Does not edit `apps/**`, `packages/**`, tests, migrations, lockfile, generated files, CI/config, owner HTML or unpacked prototype source.
- M7 README and ledger state `REQ-G01A-code-01` as docs-only/implementation-spec-ready and preserve that no DB/API implementation exists yet.
- Validation commands pass or record exact blockers.

Future code-01 PR:

- Implements DB + API runtime foundation only within the approved touch list and budget.
- Adds a deterministic aggregate read path or explicitly returns disabled/degraded state where group-scope DB strategy is not safe.
- Preserves repository isolation and RLS/group-scope strategy with tests.
- Returns aggregate-only DTO with provenance, stale/degraded/partial-source metadata and no forbidden raw fields.
- Keeps admin page wiring/populated rendering out of scope.
- Updates this evidence file, M7 README and ledger without claiming owner acceptance, visual acceptance, GA-0, production or 1.0 release.

## Failure Branch

- `BLOCKED_WORKTREE_MISMATCH`: assigned path/branch or worker-boundary guard does not match.
- `BLOCKED_DB_SERIAL`: another active worker/PR touches `packages/db/prisma/schema.prisma` or migrations.
- `BLOCKED_RUNTIME_STRATEGY`: safe group-scope RLS/read-model strategy cannot be implemented without bypass/service role or unapproved schema/security change.
- `BLOCKED_SOURCE_GAP`: required metric would need fabricated values, raw payloads, LLM judgment or unavailable source tables.
- `BLOCKED_BUDGET`: code needs more than budgeted source files/LOC without owner-approved exception.
- `BLOCKED_SCOPE_EXPANSION`: admin wiring, visual acceptance, owner HTML/prototype edits, production/staging action, real data or #178/#182 worktree changes are required.
- `BLOCKED_VALIDATION`: required guards/tests fail and cannot be fixed within code-01 scope.

In any blocked case, stop, clean up only this worker's own unauthorized edits if any, record evidence and do not continue to implementation.

## Out Of Scope

- No admin ApiClient, hook, React page, route registry update for implementation, Playwright visual coverage or page population in code-01.
- No copied prototype fixture rows, AppShell local tenant values or LLM-generated numbers.
- No owner HTML or unpacked prototype reads/writes for this DB/API spec worker.
- No real customer/order/message data, production/staging mutation, external connector mutation, LLM key, cost commitment, backfill or refresh job without owner/coordinator approval.
- No prompt, knowledge, model route, AI persona or eval dataset changes.
- No owner acceptance, visual acceptance, runtime closure, M7 closeout, GA-0 opening, production deployment or 1.0 release approval.
