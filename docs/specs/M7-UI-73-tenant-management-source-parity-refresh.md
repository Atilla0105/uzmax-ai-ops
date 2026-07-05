# M7-UI-73 Tenant Management Source Parity Refresh

## Goal

Refresh the existing visible UI-first `group.tenants` / `租户管理` page on top of `origin/codex/m7-ui-72-connection-center-source-parity-refresh` (#214 stack) so tenant management remains browser-comparable against the owner HTML, frozen unpacked tenant-management source and latest stacked group shell.

This is a source parity refresh, not a tenant runtime implementation. Primary scope is evidence/test/docs; small `apps/admin/src/pages/group/**` corrections are allowed only where owner/source/browser comparison proves an obvious current React mismatch that must be fixed now. This slice does not implement tenant DB/API/runtime/authz, audit writes, production tenant changes, tenant config persistence, connector or feature flag persistence, owner visual acceptance, merge, GA-0, production deployment, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release approval.

Owner HTML `/Users/atilla/Downloads/运营塔台1.0.html`, frozen unpacked source `/Users/atilla/源码/unpacked 6`, and `docs/admin-design-system.md` remain the visible UI source set. Tenant data must stay centralized synthetic `mock/degraded/read-only` fallback and visibly `browser-local only`, `synthetic tenant metrics`, `no production tenant change`, `no tenant config persistence`, `no connector or feature flag change` and `no audit write`.

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
- Record browser evidence comparing owner HTML/source sample, unpacked source mapping and React desktop/drawer/local-action/collapsed/mobile metrics.
- Preserve group-only routing, source-shaped centralized synthetic fallback data, browser-local drawer/actions and visible degraded/mock/read-only runtime boundaries.

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
- Conditional source scope, only if browser/source comparison proves a mismatch that must be fixed now:
  - `apps/admin/src/pages/group/GroupTenantPage.tsx`
  - `apps/admin/src/pages/group/GroupTenantViews.tsx`
  - `apps/admin/src/pages/group/groupTenantFallback.ts`
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source changed files: <= 3 conditional only
- source net LOC: <= 90 conditional only
- new source files: 0
- test files changed/added: <= 1 focused Playwright spec
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
| Owner HTML | Browser screenshot or DOM/text sample for the tenant-management owner HTML region. The HTML is a bundled executable oracle, not source to copy. |
| Unpacked group tenant page | Primary structured source for title/subtitle, four-card grid, card dot/name/status badge, line/template row, members/AI/connection stats, right drawer, language/timezone selects, channel capability rows, disabled note, disable/restore action and reason-required confirm modal. |
| Unpacked `fixtures/groupPlatform.ts` | Field-shape reference for `GROUP_TENANTS`, `TENANT_STATUS_COLORS` and capability values. React must keep centralized synthetic fallback data with visible degraded/mock/read-only labels. |
| Unpacked `navigation.ts` | Group-only navigation category and `g_tenant`/tenant-management shell mapping reference. |
| v1.1 docs | Product/runtime boundary: tenant management exists as group scope, but this slice is UI evidence only and does not imply real tenant disable/restore/config/authz/audit closure. |

## Required Evidence

- Owner/source screenshot and DOM/text sample for the tenant-management-related owner HTML region.
- Unpacked source mapping summary for title/subtitle/card grid/dot/name/status badge/line/template/stats/drawer/selects/capability rows/confirm modal/disable/restore/local toast.
- React desktop screenshot.
- React drawer screenshot.
- React local-action/confirm screenshot.
- React collapsed-sidebar screenshot.
- React mobile `320px` screenshot.
- Metrics JSON with at least:
  - shell level `group`
  - active page `group.tenants`
  - no `data-tenant-id`
  - nav width `232` expanded / `68` collapsed
  - topbar height about `53`
  - header/grid/card/drawer/action/control dimensions and body/document scroll widths
  - runtime labels `degraded/mock/read-only/browser-local only/synthetic tenant metrics/no production tenant change/no tenant config persistence/no connector or feature flag change/no audit write`
  - source-like booleans for title/subtitle/card grid/dot/name/status badge/line/template/stats/drawer/selects/capability rows/confirm modal/disable/restore/local toast
  - group sidebar categories only: `总览/平台/治理`; tenant categories absent.

## Impeccable / Design Decision Record

Adopted by default: dense product UI, source-derived tenant-management anatomy, four-card grid, compact status dots/badges, source-shaped row values, right-side management drawer, native selects, accessible switches, reason-required destructive confirm, group-only sidebar parity, explicit local-only/no-production/no-config/no-connector/no-audit boundary copy and mobile readable/no-overflow fallback.

Rejected: free redesign, old shell visual language, old `--uzmax-*` as visual target, production-looking unlabeled tenant metrics, real tenant creation/disable/restore, tenant config persistence, connector or feature flag mutation, audit writes and any owner-acceptance/runtime/release claim.

Accessibility/source-shape tradeoff: frozen source shows primary values without `mock` prefixes. React keeps primary visible card/drawer/capability values source-shaped (`运行中`, `成员`, `AI`, `连接`, `已启用/已停用`) and preserves old compatibility strings only as visually hidden text where existing tests may need them. Runtime/mock boundaries remain visible in page notes, toasts, evidence and tests.

## Pass Conditions

- `group.tenants` renders inside group shell after opening `/design` on the latest #214 stack.
- Focused browser evidence proves owner/source/React comparison, desktop/drawer/local-action/collapsed/mobile geometry, group-only sidebar categories and 320px no-overflow fallback.
- Header title/subtitle, four tenant cards, card dot/name/status badge, line/template row, members/AI/connection stats, drawer title/status/close, default language/timezone selects, channel capability rows, disabled note, full-width disable/restore action and reason-required confirm modal match source anatomy.
- Primary visible card/drawer/capability values are source-shaped, not prefixed with `mock`.
- Language/timezone/capability/disable/restore interactions stay browser-local only and show local toasts with no-production/no-config/no-connector/no-audit boundary copy.
- Existing tenant-management forced-state and interaction coverage remains intact.
- Synthetic/degraded/mock/read-only labels remain visible at page/runtime/action boundaries without dominating source-shaped row values.
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
