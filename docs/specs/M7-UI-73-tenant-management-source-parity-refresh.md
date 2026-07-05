# M7-UI-73 Tenant Management Source Parity Refresh

## Goal

Refresh the existing visible UI-first `group.tenants` / `租户管理` page on top of `origin/codex/m7-ui-72-connection-center-source-parity-refresh` (#214 stack) so tenant management follows the actual rendered owner HTML truth, while explicitly recording the discrepancy with `/Users/atilla/源码/unpacked 6/pages/group/GroupTenantPage.tsx`.

This is a source parity refresh, not a tenant runtime implementation. Primary scope is evidence/test/docs; small `apps/admin/src/pages/group/**` corrections are allowed only where owner/source/browser comparison proves an obvious current React mismatch that must be fixed now. This slice does not implement tenant DB/API/runtime/authz, audit writes, production tenant changes, tenant config persistence, connector or feature flag persistence, owner visual acceptance, merge, GA-0, production deployment, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release approval.

Owner HTML `/Users/atilla/Downloads/运营塔台1.0.html` is the visual acceptance baseline for this返修. Browser inspection shows its rendered `租户管理` page is a table/new-tenant shape, not the unpacked card-grid shape: header `租户管理 4 个租户`, `新建租户` button, a bordered table/panel whose visible rendered row exposes only `管理`, and note `停用租户须填写原因 · 停用后保留只读审计与数据导出入口`. The `新建租户` modal is reachable with name, line, language, timezone, capability chips and template fields. The unpacked 6 tenant page remains a conflicting/stale secondary mapping for this page until owner supplies a newer source package or HTML state proving the card grid is visible.

Tenant data must stay centralized synthetic `mock/degraded/read-only` fallback and visibly `browser-local only`, `synthetic tenant metrics`, `no production tenant change`, `no tenant config persistence`, `no connector or feature flag change` and `no audit write`.

## Owner Confirmation Points And AI Agent Responsibility

Owner/coordinator:

- Confirm this branch is stacked on `origin/codex/m7-ui-72-connection-center-source-parity-refresh` at `93a6743`.
- Confirm this page remains GROUP layer only: `/design` opens group shell, active page `group.tenants`, no `data-tenant-id`, group categories only.
- Decide later whether tenant runtime, authz, audit writes, tenant config persistence, connector or feature flag persistence proceed through separate approved specs.
- Keep final production/staging, real customer/order data, LLM key, cost/compliance, GA-0, production and release decisions owner-only.

AI agent:

- Work only in `/Users/atilla/.codex/worktrees/m7-ui-73-tenant-management-source-parity-refresh` on branch `codex/m7-ui-73-tenant-management-source-parity-refresh`.
- Keep `/Users/atilla/Applications/UZMAX智能运营` root/main read-only except worktree creation.
- Read AGENTS, M7-UI-52 spec/evidence, current tenant-management source/tests, owner unpacked tenant-management page/fixtures/navigation and owner HTML before edits.
- Record browser evidence comparing actual rendered owner HTML table/new-modal sample, conflicting unpacked source mapping and React desktop/new-modal/local-action/collapsed/mobile metrics.
- Preserve group-only routing, centralized synthetic fallback data, browser-local new-tenant preview and visible degraded/mock/read-only runtime boundaries.

## Timebox

0.5 workday. If the page requires backend/API/DB/packages/package/lock/CI/global config/shared AppShell/topbar/sidebar/registry/PageOutlet edits, real tenant runtime, production tenant change, config persistence, connector/feature-flag persistence, production audit write or broad shell rewrite, stop and report `BLOCKED`.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-UI-73-tenant-management-source-parity-refresh.md`
  - `docs/evidence/M7/M7-UI-73-tenant-management-source-parity-refresh.md`
  - `docs/evidence/M7/README.md`
  - `docs/admin-ui-page-migration-ledger.md`
  - `apps/admin/tests/m7-ui-tenant-management-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-tenant-management.spec.ts`
- Conditional source scope, only if browser/source comparison proves a mismatch that must be fixed now:
  - `apps/admin/src/pages/group/GroupTenantPage.tsx`
  - `apps/admin/src/pages/group/GroupTenantViews.tsx`
  - `apps/admin/src/pages/group/groupTenantFallback.ts`
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source changed files: <= 3 conditional only
- source net LOC: <= 90 conditional only
- new source files: 0
- test files changed/added: <= 2 focused tenant-management Playwright specs
- docs changed/added: <= 4
- package/lock/generated/config/backend/API/DB/worker/cron/CI/global config/shared shell/sidebar/topbar/registry/PageOutlet: 0
- external API/SDK/provider/connector/adapter basis: none; only browser evidence and local UI fallback state are in scope.

```yaml
source:
  - apps/admin/src/pages/group/GroupTenantPage.tsx
  - apps/admin/src/pages/group/GroupTenantViews.tsx
  - apps/admin/src/pages/group/groupTenantFallback.ts
test:
  - apps/admin/tests/m7-ui-tenant-management-source-parity.spec.ts
  - apps/admin/tests/m7-ui-tenant-management.spec.ts
docs:
  - docs/specs/M7-UI-73-tenant-management-source-parity-refresh.md
  - docs/evidence/M7/M7-UI-73-tenant-management-source-parity-refresh.md
  - docs/evidence/M7/README.md
  - docs/admin-ui-page-migration-ledger.md
generated: []
lock: []
config: []
```

## Required Reads And Source Mapping

Required reads:

- `AGENTS.md`
- `docs/specs/M7-UI-52-tenant-management-page.md`
- `docs/evidence/M7/M7-UI-52-tenant-management-page.md`
- `docs/admin-design-system.md`
- `docs/admin-ui-page-migration-ledger.md`
- `docs/evidence/M7/README.md`
- `apps/admin/src/pages/group/GroupTenantPage.tsx`
- `apps/admin/src/pages/group/GroupTenantViews.tsx`
- `apps/admin/src/pages/group/groupTenantFallback.ts`
- `apps/admin/tests/m7-ui-tenant-management.spec.ts`
- `/Users/atilla/源码/unpacked 6/pages/group/GroupTenantPage.tsx`
- `/Users/atilla/源码/unpacked 6/fixtures/groupPlatform.ts` tenant section
- `/Users/atilla/源码/unpacked 6/shell/navigation.ts`
- `/Users/atilla/Downloads/运营塔台1.0.html`
- v1.1 tenant-management boundaries: PRD REQ-G02, technical architecture multi-tenant/authz/RLS boundaries, admin group IA, mobile fallback and acceptance/release gate rules.

| Source | Required use |
|---|---|
| Owner HTML | Primary visual baseline. Browser evidence must capture the rendered table/new-tenant state: no four tenant names, no card grid, no visible table columns, no capability rows on default page, visible `新建租户`, visible inert `管理`, and visible disable-reason note. |
| Owner HTML embedded bundle | Secondary explanation of intended table/new-modal/drawer templates. It contains `tenantCols`, `tenantNewOpen`, `tenantManageOpen` and `tenantDisableOpen`, but the rendered default page does not materialize rows/columns and `管理` does not open the drawer. |
| Unpacked group tenant page | Conflicting/stale secondary source for this page. It still describes a four-card grid/right drawer/reason confirm flow; do not use it as the React visual target for this返修. |
| Unpacked `fixtures/groupPlatform.ts` | Secondary field-shape reference for synthetic tenant count/names only. React must not expose production-looking tenant rows when owner HTML rendered state does not show them. |
| Unpacked `navigation.ts` | Group-only navigation category and `g_tenant`/tenant-management shell mapping reference. |
| v1.1 docs | Product/runtime boundary: tenant management exists as group scope, but this slice is UI evidence only and does not imply real tenant disable/restore/config/authz/audit closure. |

## Required Evidence

- Owner HTML screenshot and DOM/text sample for the rendered tenant-management table/new-tenant state, including booleans proving tenant names/card grid/capability rows/table columns are absent.
- Owner HTML new-tenant modal screenshot and DOM/text sample.
- Owner HTML `管理` click no-op screenshot/sample proving the drawer fields are not reachable in the rendered state.
- Unpacked source mapping summary that explicitly flags the card-grid/drawer source as conflicting/stale for this page.
- React desktop screenshot.
- React new-tenant modal/local-create screenshot.
- React collapsed-sidebar screenshot.
- React mobile `320px` screenshot.
- Metrics JSON with at least:
  - shell level `group`
  - active page `group.tenants`
  - no `data-tenant-id`
  - nav width `232` expanded / `68` collapsed
  - topbar height about `53`
  - header/table-panel/table-scroll/new-button/modal/action/control dimensions and body/document scroll widths
  - runtime labels `degraded/mock/read-only/browser-local only/synthetic tenant metrics/no production tenant change/no tenant config persistence/no connector or feature flag change/no audit write`
  - source-like booleans for title/subtitle/new-tenant button/table panel/blank management action/source note/new-tenant modal/local create/local toast, plus absence booleans for card grid/drawer/tenant names/capability rows on default page
  - group sidebar categories only: `总览/平台/治理`; tenant categories absent.

## Impeccable / Design Decision Record

Adopted by default: owner HTML rendered table/new-tenant anatomy, compact page header, `新建租户` button, bordered horizontally scrollable table/panel with the visible `管理` action, disable-reason note, reachable create-new-tenant modal, native inputs/selects, capability chips, group-only sidebar parity, explicit local-only/no-production/no-config/no-connector/no-audit boundary copy and mobile readable/no-overflow fallback.

Rejected: using the unpacked 6 card-grid/right-drawer page as the visual target for this返修, because the actual owner HTML rendered page does not show tenant names, card grid, table columns, drawer fields or capability rows. Also rejected: free redesign, old shell visual language, old `--uzmax-*` as visual target, production-looking tenant rows, real tenant creation/disable/restore, tenant config persistence, connector or feature flag mutation, audit writes and any owner-acceptance/runtime/release claim.

Accessibility/source-shape tradeoff: owner HTML uses a span-like `管理` action inside a partially rendered table row. React keeps the same visible table/new-modal anatomy but uses accessible buttons and explicit local-only toasts. Runtime/mock boundaries remain visible in page notes, toasts, evidence and tests.

## Pass Conditions

- `group.tenants` renders inside group shell after opening `/design` on the latest #214 stack.
- Focused browser evidence proves owner HTML rendered table/new-modal truth, conflicting unpacked source mapping, React desktop/new-modal/local-create/collapsed/mobile geometry, group-only sidebar categories and 320px no-overflow fallback.
- Header title/subtitle, `新建租户`, table/panel, visible inert `管理`, disable-reason note and new-tenant modal fields match the owner HTML rendered state.
- Default React page does not show four tenant cards, tenant names, drawer fields, capability rows or card-grid stats.
- New-tenant modal interactions stay browser-local only and show local toasts with no-production/no-config/no-connector/no-audit boundary copy.
- Existing tenant-management forced-state and interaction coverage remains intact.
- Synthetic/degraded/mock/read-only labels remain visible at page/runtime/action boundaries without inventing production-looking tenant rows.
- Any React visual corrections are small and limited to `apps/admin/src/pages/group/**`.
- No disallowed files are changed.

## Validation Plan

- `git diff --check origin/codex/m7-ui-72-connection-center-source-parity-refresh...HEAD`
- `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-72-connection-center-source-parity-refresh --spec docs/specs/M7-UI-73-tenant-management-source-parity-refresh.md --include-worktree`
- touched Prettier check/write
- ESLint on touched tenant-management test/source
- `node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json --pretty false`
- `node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir`
- Focused Playwright for `apps/admin/tests/m7-ui-tenant-management-source-parity.spec.ts` and existing `apps/admin/tests/m7-ui-tenant-management.spec.ts`.

## Failure Branches

- If source geometry cannot be kept without shared shell/topbar/sidebar edits, stop and report the shell dependency instead of editing shared shell.
- If source-shaped labels create production ambiguity, keep the visible boundary labels and record the remaining visual delta.
- If Playwright cannot open owner HTML directly, record the owner HTML as bundled executable source and use the unpacked source files plus React browser evidence as the stable mapping; do not copy compressed bundle content.

## Not Doing

- No backend/API/DB/schema/migration/generated/package/lock/global config/CI/shared AppShell/topbar/sidebar/registry/PageOutlet changes.
- No raw prototype fixture import.
- No tenant DB/API/runtime/authz/audit write.
- No production tenant creation, disable, restore, tenant config persistence, connector or feature flag mutation.
- No production audit write, export, real eval gate, LLM/provider call, production prompt/model/persona change or production audit write.
- No real customer, order, Telegram, address, phone or production data.
- No owner visual acceptance, M7 closeout, GA-0, production/staging action, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release approval.
