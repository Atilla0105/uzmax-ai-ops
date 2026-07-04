# M7-UI-12 Group Overview Page

## 目标

Create the page-specific migration contract for `group.overview` / 集团总览.

This is a docs-only planning slice. It supersedes the older ledger placeholder `M7-UI-04A-group-overview` for future implementation planning, but it does not implement the page, wire runtime/API data, create tests, change CSS, migrate fixtures, claim owner acceptance, close runtime gaps, approve GA-0/production, or approve 1.0 release.

The later implementation worker may not start until the coordinator confirms this spec remains the active group-overview target and confirms no overlap with other page/router/runtime workers.

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner/coordinator:

- Confirm this PR is a spec/evidence/ledger docs PR only.
- Confirm `M7-UI-12-group-overview-page` replaces the `M7-UI-04A-group-overview` placeholder as the planning spec for `group.overview`.
- Decide whether missing group aggregate runtime/API contracts should be implemented in the page worker or split first; AI agents must not invent runtime truth.
- Keep final scope, production/staging, real customer/order data, customer LLM, LLM key, cost/compliance, GA-0, production and 1.0 release decisions as owner-only.

AI agent:

- Work only in `/Users/atilla/.codex/worktrees/m7-ui-12-group-overview-page-spec` on branch `codex/m7-ui-12-group-overview-page-spec`.
- Keep `/Users/atilla/Applications/UZMAX智能运营` root/main read-only.
- Do not touch #178, #182 or #184 branches/worktrees.
- Read AGENTS, v1.1 source-of-truth docs, admin design system, current M7 ledger/evidence, registry/page outlet state, owner HTML, and the unpacked group overview sources before drafting.
- Record entry evidence, source mapping, runtime gaps and validation results in this spec/evidence.
- Do not implement UI in this spec-only PR.

## 时间盒

0.25 workday. If drafting requires UI implementation, backend/API changes, package/lock updates, raw fixture copying, DB/schema changes, CI/global config changes, release/production action, or edits to #178/#182/#184 worktrees, stop and report `BLOCKED`.

## Spec 类型

docs

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-UI-12-group-overview-page.md`
  - `docs/evidence/M7/M7-UI-12-group-overview-page.md`
  - `docs/admin-ui-page-migration-ledger.md`
  - `docs/evidence/M7/README.md`
  - `apps/admin/src/pages/group/GroupOverviewPage.tsx`
  - `apps/admin/src/pages/PageOutlet.tsx`
  - `apps/admin/src/pages/registry.ts`
  - `apps/admin/tests/m7-ui-group-overview.spec.ts`
  - `apps/admin/tests/m7-ui-page-router.spec.ts`
- 说明/备注：
  - This PR may touch only the four docs paths above.
  - Future implementation may touch the listed `apps/admin` page/router/test paths only after coordinator approval.
  - If future implementation needs a shared group aggregate ApiClient/hook outside the listed paths, backend/API routes, WebSocket contracts, package/lock, token package, shared patterns, CI/guard scripts or DB/schema changes, stop and split to a separate approved spec.
- 未列出的模块默认不可改。

## 变更预算与路径分类

Spec-only PR budget:

- source changed files: 0
- source net LOC: 0
- new source files: 0
- test files changed: 0
- docs changed: <= 4
- package/lock/generated/config/backend/API/DB/worker/cron/CI/global config: 0
- binary screenshots/artifacts: 0

Future implementation budget after coordinator approval:

- source changed files: <= 4
- source net LOC: <= 450
- new source files: <= 2
- test files changed: <= 2 focused Playwright specs
- docs changed: <= 3 evidence/ledger updates
- package/lock/generated/config/backend/API/DB/worker/cron/CI/global config: 0
- external API/SDK/provider/connector/adapter basis: none; use approved internal runtime contracts or truthful degraded/read-only state only.
- exceptions: none expected. If runtime/API gaps force expansion, stop for a separate spec instead of declaring an exception inside this page worker.

## 文档触发检查

updated

## 前置条件与读取记录

Required reads completed for this spec-only PR:

- `AGENTS.md`
- `UZMAX智能运营系统-PRD-v1.1.md`
- `UZMAX智能运营系统-后台设计与前端架构-v1.1.md`
- `UZMAX智能运营系统-技术架构-v1.1.md`
- `UZMAX智能运营系统-1.0验收矩阵-v1.1.md`
- `docs/admin-design-system.md`
- `docs/admin-ui-page-migration-ledger.md`
- `docs/admin-ui-prototype-migration-index.md`
- `docs/evidence/M7/README.md`
- `apps/admin/src/pages/registry.ts`
- `apps/admin/src/pages/PageOutlet.tsx`
- `/Users/atilla/源码/unpacked 6/pages/group/GroupOverviewPage.tsx`
- `/Users/atilla/源码/unpacked 6/fixtures/group.ts`
- `/Users/atilla/源码/unpacked 6/App.tsx`
- `/Users/atilla/源码/unpacked 6/shell/navigation.ts`
- `/Users/atilla/Downloads/运营塔台1.0.html` as visual reference only; no large HTML content copied.
- #184 read-only acceptance notes from `/Users/atilla/.codex/worktrees/m7-ui-07-page-visual-acceptance-notes` for owner visual-baseline rules. No #184 files were edited.
- Impeccable context and product register: dense product/admin UI, status-first hierarchy, complete loading/empty/error/permission/degraded states, desktop control-room primary, mobile fallback only, and no decorative/legacy-shell visual drift.

Worktree / branch entry evidence:

| Fact | Evidence |
|---|---|
| worker `pwd` | `/Users/atilla/.codex/worktrees/m7-ui-12-group-overview-page-spec` |
| worker `git status --short --branch` | `## codex/m7-ui-12-group-overview-page-spec...origin/main` |
| worker `git branch --show-current` | `codex/m7-ui-12-group-overview-page-spec` |
| worker HEAD | `2193a51` / `M7-UI-06 shared shell topbar calibration (#183)` |
| root/main checkout | `/Users/atilla/Applications/UZMAX智能运营` |
| root/main status/head before edits | `## main...origin/main`; `2193a51` |
| root `git branch --no-merged main` before edits | `codex/m7-ui-07-page-visual-acceptance-notes`; `codex/m7-ui-11-release-acceptance-page-impl`; `codex/m7-ui-20-conversation-workbench-page-impl` |
| open PR audit | #178 Draft/Paused (`codex/m7-ui-11-release-acceptance-page-impl`, CI success); #182 Draft conversation implementation candidate (`codex/m7-ui-20-conversation-workbench-page-impl`, CI success); #184 Draft docs PR (`codex/m7-ui-07-page-visual-acceptance-notes`, CI success, not merged). |

## Source Mapping

| Source | Required use |
|---|---|
| `/Users/atilla/Downloads/运营塔台1.0.html` | Hard visual baseline for first-viewport layout density, health strip, table rhythm, sidebar grouping and shell relationship. Do not copy bundled HTML/runtime text. |
| `/Users/atilla/源码/unpacked 6/pages/group/GroupOverviewPage.tsx` | Primary structured source for page anatomy: title/result label, clear filter chip, search field, six health cards, sortable tenant table, row click into tenant layer. |
| `/Users/atilla/源码/unpacked 6/fixtures/group.ts` | Field-shape reference only: `GROUP_HEALTH`, `OV_ROWS`, `OV_COL_DEFS`, `ovFilterTest`. Fixture values are not runtime truth and must not be imported into production page code. |
| `/Users/atilla/源码/unpacked 6/App.tsx` | Source mapping for group route `overview` and `onEnterTenant` transition to tenant conversations. |
| `/Users/atilla/源码/unpacked 6/shell/navigation.ts` | Source mapping for group navigation category placement: 总览 -> 集团总览. |
| `apps/admin/src/pages/registry.ts` | Current repo route state: `group.overview` exists as a registry row and still points at the old placeholder `M7-UI-04A-group-overview`. |
| `apps/admin/src/pages/PageOutlet.tsx` | Current repo runtime state: non-migrated pages render scaffold/empty page state; `group.overview` is not implemented. |
| `docs/admin-design-system.md` | Normalization layer: group overview is health strip + data table, no customer plaintext, row click enters authorized tenant context, all states required. |

v1.1/doc references:

- PRD: REQ-G01 requires all-tenant health, conversation volume, handoff rate, SLA, cost, model fault, redline risk, order and channel connector state; NG-06 prohibits LLM numerical judgment for cost/SLA/order state.
- Backend design/frontend architecture: §3.1 requires top health strip and tenant row table; group layer must not show customer plaintext or conversation content.
- Technical architecture: group aggregate views must use `AccessContext{orgId, tenantIds, permissions}` and RLS/repository isolation; admin is API/WS-only and must not import backend packages.
- Acceptance matrix: A-01 is blocked if owner cannot see abnormal tenants, cost, redline or connector status; A-02/B-01/B-03/B-04 block unauthorized tenant access, cross-tenant leakage and group-role customer plaintext exposure.

## Page Matrix

### Objects, Fields And Behaviors

| Object | Required fields / behavior | Notes |
|---|---|---|
| Group health summary | tenant count, abnormal tenant count, AI tripped, model fault, order connector fault, redline today | Six health cards are filter controls when runtime supports filtering. Values are authorized aggregates only. |
| Tenant row | tenant id/ref, tenant name, business line, tenant health category, sessions, human-needed, SLA risk, handoff rate, AI cost/day, eval status, order status, last abnormal event, tenant navigation target | No customer name, phone, Telegram username, message text, order plaintext or conversation snippet at group layer. |
| Tenant health category | healthy, degraded, attention/human-needed, tripped/offline where runtime supports | Status color must be paired with text/icon label; not color-only. |
| Eval state | pass, blocked/fail, running, unavailable/stale | Do not imply eval gate pass if runtime lacks evidence. |
| Order connector state | normal, degraded, fault/down, unavailable/stale | Do not let LLM infer order status; use connector/runtime state. |
| Last abnormal event | safe aggregate event label, category, age/time, severity | Must not reveal customer plaintext, raw payload or cross-tenant details. |
| Tenant navigation target | authorized tenant layer route, expected default `tenant.conversations` | Row click must enter tenant layer only after authorization and clear tenant-scoped caches/permissions when real runtime exists. Back/exit path is handled by shell. |

### Filters And Actions

| Control | Required contract |
|---|---|
| Search tenant/business line | Filter authorized tenant rows by tenant display label and business line only. No customer/order/message search at group layer. |
| Health card filter | Cards filter tenant rows by aggregate state: total, abnormal, AI tripped, model fault, order connector fault, redline today. |
| Clear filter | Clears active health filter and search query without changing runtime data. |
| Sort columns | Sort numeric columns for sessions, human-needed, SLA risk, handoff rate and AI cost/day; stable dimensions and no layout shift. |
| Click row to enter tenant layer | Enter only authorized tenant context. If runtime authorization/cache invalidation is missing, render disabled/degraded affordance instead of fake navigation success. |
| Back/exit path | Handled by AppShell/layered navigation; this page must not invent a second shell. |

### Prohibited Behavior

- No customer plaintext, conversation content, phone, Telegram username, raw order payload, raw prompt/completion or customer-specific evidence at group layer.
- No unpacked fixture data as runtime truth; fixtures may only inform source mapping or sanitized tests.
- No LLM judgment for cost, SLA, order state, connector health or model fault.
- No cross-tenant data leak or unauthorized tenant row/click target.
- No old shell, old `--uzmax-*` token bridge or early visual wording as the target for new UI.
- No release/acceptance displacement: this page does not approve M7 closeout, GA-0, production, owner acceptance or 1.0 release.

## Runtime Contract

Current repo status:

- `apps/admin/src/pages/registry.ts` contains `group.overview`, but it still records `targetSpecId: "M7-UI-04A-group-overview"` and `status: "not_started"`.
- `apps/admin/src/pages/PageOutlet.tsx` renders only the legacy evidence route and the merged confirmation queue page; `group.overview` still falls through to the planned-page scaffold.
- No group aggregate ApiClient/hook exists in `apps/admin` for the REQ-G01 aggregate table/health strip.

Future implementation must choose one approved path:

1. Wire an approved real group aggregate API/client/hook that returns authorized aggregate-only data and state metadata.
2. Render an honest read-only/degraded contract if the API/hook is absent, with unbacked interactions disabled and copy that states runtime evidence is unavailable.

The implementation must not import `/Users/atilla/源码/unpacked 6/fixtures/group.ts`, copy fixture rows into runtime source, or simulate group health as if it were production truth.

Data boundary:

- Group layer data is authorized aggregate only.
- Tenant row click may enter tenant layer only for an authorized tenant.
- When real runtime exists, tenant transition must clear tenant-scoped caches, reload permissions/feature flags and avoid preserving stale tenant state from the previous tenant.
- Backend/API remains the authority for authorization; hidden or disabled frontend controls are not authorization.

## State Coverage

| State | Required behavior |
|---|---|
| `loading` | Health strip and table skeletons with stable dimensions; no spinner-only blank page. |
| `empty` | No authorized tenants exist or no aggregate data is available; explain the allowed next step without decorative illustration. |
| `filtered_empty` | Active search/health filter produces no rows; show clear-filter action. |
| `error` | Aggregate fetch failed; show retry and safe trace/reference if available. |
| `permission_denied` | User lacks group overview permission; explain role/prerequisite and render no tenant data. |
| `degraded` | Aggregate stale, partial, connector/model/eval source unavailable or runtime contract missing; show read-only truthful data where available and disable unbacked actions. |
| `mobile_fallback` | Readable stacked health cards and row summaries at 320px; table may become row summaries. Mobile polish is deferred, but no overflow/overlap is allowed. |

## Visual Acceptance

- Owner HTML `/Users/atilla/Downloads/运营塔台1.0.html` and frozen source `/Users/atilla/源码/unpacked 6` are the hard baseline.
- Desktop acceptance requires pixel/detail-level comparison against owner HTML and exact unpacked group overview source before visual acceptance can be claimed.
- The future implementation must check sidebar category grouping and the bottom collapse control if the sidebar is visible.
- Group and tenant layers remain separate: admin/home or `/design` starts at group layer/group overview; selecting/clicking an authorized tenant enters tenant layer.
- Mobile remains a readable fallback in this phase; pixel-level mobile polish can be a later mobile-specific pass.
- Visual target is current prototype + `docs/admin-design-system.md`, not legacy shell CSS or old `--uzmax-*` values.

## Future Evidence / Validation Plan

Future implementation must record:

- `git diff --check`
- `npm run guard:doc-triggers`
- `node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M7-UI-12-group-overview-page.md --include-worktree`
- format/typecheck/lint/admin build as required by the implementation scope
- focused Playwright for `group.overview`: loading, empty, filtered empty, error, permission denied, degraded, search, health-card filter/clear, sort, authorized row click
- desktop and 320px mobile screenshots/no-overflow evidence
- desktop pixel/detail comparison against owner HTML and unpacked source
- Impeccable/equivalent design audit with accepted/rejected recommendations and reasons
- spec compliance review before code quality review

This spec-only PR validation is limited to docs guards and does not provide runtime or visual acceptance evidence.

## Pass Conditions

- Only allowed docs files change.
- Ledger row for `group.overview` points to `M7-UI-12-group-overview-page` and says spec-ready/docs-only while preserving no implementation merged.
- Evidence file records required reads, entry state, open PR situation and validation results.
- Spec contains source mapping, page matrix, runtime contract, state coverage, visual acceptance and prohibited behavior.
- Validation results are recorded honestly.

## Failure Branch

- If assigned worktree/branch state is wrong, stop and report `BLOCKED`.
- If required source files or owner HTML are unavailable, record the missing path in evidence and stop before claiming spec-ready.
- If validation requires an open PR or PR metadata, create the Draft PR first if possible; otherwise record the exact blocker.
- If any file outside the allowed docs touch list changes, stop and report for cleanup.

## Out Of Scope

- No UI/page implementation.
- No `apps/**`, `packages/**`, tests, lockfile, generated, CI/guard, DB/schema, backend/API, worker/cron or dependency changes.
- No edits to `/Users/atilla/Downloads/运营塔台1.0.html` or `/Users/atilla/源码/unpacked 6`.
- No raw HTML copy or large prototype excerpt.
- No owner visual acceptance, page migration, runtime closure, GA-0, production, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release approval.
