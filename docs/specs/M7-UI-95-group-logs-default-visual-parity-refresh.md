# M7-UI-95 Group Logs Default Visual Parity Refresh

## Goal

Refresh the default visible `group.logs` / `集团日志` page on top of `codex/m7-ui-94-template-center-default-visual-parity-refresh` so the default body, header, runtime/source note, export/detail feedback, empty/search no-results copy, forced URL states and mobile fallback read like a real group-level audit-log operations page instead of a fixture/runtime explanation surface.

This is default visual parity only. It preserves the M7-UI-74 source-shaped group-log header, chips, search, export, seven-column table, local detail actions and mobile fallback. It does not implement audit DB/API/runtime/authz, production audit export, file writing, export jobs, real audit queries, real record navigation, trace closure, owner visual acceptance, runtime closure, GA/1.0, production deployment, real customer/order data, customer LLM or release approval.

Default visible `group.logs` body/header/subtitle/runtime/source note/toast/export/detail feedback/empty/filter states/forced states/mobile body must not visibly contain `degraded`, `mock`, `read-only`, `browser-local only`, `synthetic audit rows`, `Synthetic`, `synthetic`, `no production audit export`, `no file written`, `no audit runtime call` or `no real tenant/action navigation`. Runtime/export/file/navigation boundaries must remain available in hidden DOM, `data-runtime-boundary`, `title`, `aria-description` and focused Playwright metrics.

## Owner Confirmation Points And AI Agent Responsibility

Owner/coordinator:

- Confirm this is a default visual parity refresh only, not audit-log runtime or release closure.
- Confirm `group.logs` remains GROUP layer only: `/design` opens group shell, active page `group.logs`, no `data-tenant-id`, group categories only and tenant nav does not mix into group nav.
- Keep final owner visual acceptance, production/staging, real customer/order data, LLM key, cost, compliance, GA/1.0 and release decisions owner-only.
- Decide any future audit DB/API/runtime/authz, production audit export, export job, file writing, real audit query or real record navigation through separate approved specs.

AI agent:

- Work only in `/Users/atilla/.codex/worktrees/m7-ui-95-group-logs-default-visual-parity-refresh` on branch `codex/m7-ui-95-group-logs-default-visual-parity-refresh`.
- Keep `/Users/atilla/Applications/UZMAX智能运营` root/main read-only.
- Read `AGENTS.md`, `PRODUCT.md`, `DESIGN.md`, Impeccable context/product register/clarify guidance, M7-UI-57/74 group-logs spec/evidence, M7-UI-93/94 default-refresh pattern, current group-logs source/tests/evidence, owner HTML and unpacked group-logs source before edits.
- Modify only the allowed group-logs page/test/doc paths.
- Preserve group shell, active page `group.logs`, no `data-tenant-id`, group-only nav, owner/source-shaped title/subtitle/chips/search/export/table/mobile cards, loading/empty/error/permission/degraded URL states, collapsed sidebar and mobile 320 fallback.

## Timebox

0.5 workday. If API client, backend/API, DB, package/lock, shared shell/topbar/sidebar/router/PageOutlet/registry, global config, CI, production/staging, audit runtime, production audit export, export jobs, file writing or real record navigation are required, stop and report `BLOCKED`.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `apps/admin/src/pages/group/GroupLogsPage.tsx`
  - `apps/admin/src/pages/group/GroupLogsViews.tsx`
  - `apps/admin/src/pages/group/groupLogsFallback.ts`
  - `apps/admin/tests/m7-ui-group-logs.spec.ts`
  - `apps/admin/tests/m7-ui-group-logs-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-group-logs-default-visual-parity.spec.ts`
  - `apps/admin/tests/m7-ui-group-logs.helpers.ts`
  - `docs/specs/M7-UI-95-group-logs-default-visual-parity-refresh.md`
  - `docs/evidence/M7/M7-UI-95-group-logs-default-visual-parity-refresh.md`
  - `docs/evidence/M7/README.md`
  - `docs/admin-ui-page-migration-ledger.md`
- Unlisted modules are out of scope.

## Change Budget And Path Classification

- source changed files: <= 3
- source net LOC: <= 180
- new source files: 0
- test files changed/added: <= 4
- docs changed/added: <= 4
- package/lock/generated/config/backend/API/DB/worker/cron/CI/global config/shared shell/topbar/router/PageOutlet/registry/API: 0
- external API/SDK/provider/connector/adapter basis: none; local browser evidence only.
- exceptions: none.

```yaml
source:
  - apps/admin/src/pages/group/GroupLogsPage.tsx
  - apps/admin/src/pages/group/GroupLogsViews.tsx
  - apps/admin/src/pages/group/groupLogsFallback.ts
test:
  - apps/admin/tests/m7-ui-group-logs.spec.ts
  - apps/admin/tests/m7-ui-group-logs-source-parity.spec.ts
  - apps/admin/tests/m7-ui-group-logs-default-visual-parity.spec.ts
  - apps/admin/tests/m7-ui-group-logs.helpers.ts
docs:
  - docs/specs/M7-UI-95-group-logs-default-visual-parity-refresh.md
  - docs/evidence/M7/M7-UI-95-group-logs-default-visual-parity-refresh.md
  - docs/evidence/M7/README.md
  - docs/admin-ui-page-migration-ledger.md
generated: []
lock: []
config: []
```

## Required Reads And Source Mapping

Required reads before edits:

- `AGENTS.md`
- `PRODUCT.md`
- `DESIGN.md`
- Impeccable project context, product register and clarify guidance
- `docs/admin-design-system.md`
- `docs/specs/M7-UI-57-group-logs-page.md`
- `docs/specs/M7-UI-74-group-logs-source-parity-refresh.md`
- `docs/specs/M7-UI-93-connection-center-default-visual-parity-refresh.md`
- `docs/specs/M7-UI-94-template-center-default-visual-parity-refresh.md`
- `docs/evidence/M7/M7-UI-57-group-logs-page.md`
- `docs/evidence/M7/M7-UI-74-group-logs-source-parity-refresh.md`
- `docs/evidence/M7/M7-UI-94-template-center-default-visual-parity-refresh.md`
- `docs/evidence/M7/README.md`
- `docs/admin-ui-page-migration-ledger.md`
- `apps/admin/src/pages/group/GroupLogsPage.tsx`
- `apps/admin/src/pages/group/GroupLogsViews.tsx`
- `apps/admin/src/pages/group/groupLogsFallback.ts`
- `apps/admin/tests/m7-ui-group-logs.spec.ts`
- `apps/admin/tests/m7-ui-group-logs-source-parity.spec.ts`
- `/Users/atilla/Downloads/运营塔台1.0.html`
- `/Users/atilla/源码/unpacked 6/pages/group/GroupLogsPage.tsx`
- `/Users/atilla/源码/unpacked 6/fixtures/groupPlatform.ts`
- `/Users/atilla/源码/unpacked 6/shell/navigation.ts`
- v1.1 logs/audit, group-layer, mobile fallback and acceptance/release boundaries.

Source mapping:

| Source | Required use |
|---|---|
| Owner HTML | Primary visual/source oracle for `集团日志` and group shell context. |
| Unpacked group logs page | Source anatomy: title `集团日志`, subtitle/table/search/export shape, seven columns, seven rows, link-style detail cells and empty state. |
| Unpacked `fixtures/groupPlatform.ts` | Field-shape reference for `GLOG_COLS`, `GLOG_BASE` and `GLOG_MODULES`; React keeps centralized fallback data and does not introduce production IDs/data. |
| Unpacked `navigation.ts` | Group-only category and `g_logs` shell mapping reference. |
| M7-UI-74 group logs source refresh | Preserve owner-rendered title/subtitle/search/export/chip/empty values and the recorded owner-rendered blank-table conflict while keeping source-shaped seven-column/seven-row React table. |
| M7-UI-93/94 default refreshes | Test/evidence pattern for clean visible default body with hidden/data/title/ARIA runtime boundaries. |
| Existing React group logs page | Preserve page-local fallback, focused test ids and local interactions; move engineering/runtime caveats out of default visible body and feedback into hidden/data/title/ARIA evidence. |

`rg` conclusions:

- `rg -n "degraded|mock|read-only|browser-local only|synthetic audit rows|Synthetic|synthetic|no production audit export|no file written|no audit runtime call|no real tenant/action navigation" apps/admin/src/pages/group apps/admin/tests/m7-ui-group-logs*.spec.ts` found visible leaks in runtime note, forced state copy, empty helper, export accessible label, export/detail toasts and stale focused tests.
- `rg --files apps/admin/src/pages/group apps/admin/tests docs/specs docs/evidence/M7 | rg 'GroupLogs|groupLogs|group-logs|M7-UI-(57|74|93|94)|admin-ui-page-migration-ledger|M7/README'` found the existing page-local group-logs implementation and focused tests; this slice extends them in place and adds one focused default visual parity test.
- `rg -n "GLOG|集团日志|操作日志|g_logs|gLog" /Users/atilla/Downloads/运营塔台1.0.html "/Users/atilla/源码/unpacked 6/pages/group/GroupLogsPage.tsx" "/Users/atilla/源码/unpacked 6/fixtures/groupPlatform.ts" "/Users/atilla/源码/unpacked 6/shell/navigation.ts"` confirmed the owner/source mapping to preserve.

## Worktree / Branch Preconditions

| Fact | Evidence |
|---|---|
| worker `pwd` | `/Users/atilla/.codex/worktrees/m7-ui-95-group-logs-default-visual-parity-refresh` |
| worker `git status --short --branch` | `## codex/m7-ui-95-group-logs-default-visual-parity-refresh` |
| worker `git branch --show-current` | `codex/m7-ui-95-group-logs-default-visual-parity-refresh` |
| worker `git rev-parse HEAD` | `642c43efaf72eaf7c29509a46467f7e3c2dc3cbf` |
| base | `codex/m7-ui-94-template-center-default-visual-parity-refresh` |
| forbidden checkout | `/Users/atilla/Applications/UZMAX智能运营` for writes |

## Functional Contract

- Default `group.logs` visible body, header, runtime/source note, export/detail feedback, empty/search no-results copy and URL states use business-readable Chinese operations copy.
- Hidden/data/title/ARIA evidence retains `degraded`, `mock`, `read-only`, `browser-local only`, `synthetic audit rows`, `no production audit export`, `no file written`, `no audit runtime call` and `no real tenant/action navigation`.
- Page root exposes `data-runtime-boundary`; hidden runtime note exposes the same boundary; export/detail controls, toasts and forced state surfaces expose boundary metadata.
- Group log rows remain centralized fallback data, source-shaped from M7-UI-74 and owner/unpacked source.
- Export remains page-local feedback only and does not write files, generate production audit export or call audit runtime/export jobs.
- Detail remains page-local feedback only and does not navigate to real tenant/action records or close trace/audit runtime.
- The default group layer remains unchanged: `/design` opens group layer and `集团日志` maps to `group.logs`.

## Design Skill Layer

Adopted Impeccable/product-register/clarify guidance: restrained product UI, dense operational audit-log copy, owner/source-like table vocabulary, hidden-but-present runtime/export/file/navigation boundaries, familiar search/filter/export/detail controls and mobile no-overflow fallback.

Rejected: visible engineering labels in default body/feedback/accessibility labels, old shell visual vocabulary, old `--uzmax-*` as visual source, broad redesign, production-looking audit runtime, production audit export, file writing, export jobs, real record navigation and owner-acceptance/runtime/release claims.

## Pass Conditions

- Default `group.logs` visible body contains no forbidden engineering terms.
- Export/detail visible feedback and accessible names contain no forbidden engineering terms.
- Forced URL states show business-readable loading/empty/error/permission copy while hidden/data/title/ARIA evidence still contains runtime/export/file/navigation boundary labels.
- Existing group-logs interaction coverage and source-parity coverage pass after updated boundary expectations.
- Focused default visual parity Playwright covers clean default body, export/detail feedback with clean visible copy, forced states, group/tenant nav separation, collapsed nav and mobile 320 body plus hidden boundary metrics.
- `git diff --check`, direct `pr-shape`, touched Prettier/ESLint, admin build and focused Playwright pass or failures are recorded honestly.

## Non-Goals

- No API client, backend/API, DB, package/lock, shared shell/topbar/sidebar/router/PageOutlet/registry or global config changes.
- No audit DB/API/runtime/authz, production audit export, CSV/file writing, export job, audit runtime call, real audit query, real record navigation, production audit write, trace closure, owner visual acceptance, merge closure, runtime closure, GA-0, production readiness or 1.0 release approval.
- No broad redesign, raw production fixture import or real customer/order/Telegram/address/phone/production data.
