# M7-UI-72 Connection Center Source Parity Refresh

## Goal

Refresh the existing visible UI-first `group.connections` / `连接中心` page on top of `origin/codex/m7-ui-71-template-center-source-parity-refresh` (#213 stack) so the connection center remains browser-comparable against the owner HTML, frozen unpacked connection-center source and latest stacked group shell.

This is a source parity refresh, not a runtime implementation. Primary scope is evidence/test/docs; small `apps/admin/src/pages/group/**` corrections are allowed only where owner/source/browser comparison proves an obvious current React mismatch that must be fixed now. This slice does not implement connector DB/API/runtime, production connector changes, real connection tests, feature-flag persistence, audit writes, owner visual acceptance, merge, GA-0, production deployment, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release approval.

Owner HTML `/Users/atilla/Downloads/运营塔台1.0.html`, frozen unpacked source `/Users/atilla/源码/unpacked 6`, and `docs/admin-design-system.md` remain the visible UI source set. Connection-center data must stay centralized synthetic `mock/degraded/read-only` fallback and visibly `browser-local only`, `synthetic health`, `no production connector change`, `no real connection test` and `no audit write`.

## Owner Confirmation Points And AI Agent Responsibility

Owner/coordinator:

- Confirm this branch is stacked on #213 / `origin/codex/m7-ui-71-template-center-source-parity-refresh`.
- Confirm this page remains GROUP layer only: `/design` opens group shell, active page `group.connections`, no `data-tenant-id`, group categories only.
- Decide later whether connector runtime, feature flags, real tests, audit writes or production connector changes proceed through separate approved specs.
- Keep final production/staging, real customer/order data, LLM key, cost/compliance, GA-0, production and release decisions owner-only.

AI agent:

- Work only in `/Users/atilla/.codex/worktrees/m7-ui-72-connection-center-source-parity-refresh` on branch `codex/m7-ui-72-connection-center-source-parity-refresh`.
- Keep `/Users/atilla/Applications/UZMAX智能运营` root/main read-only.
- Read AGENTS, M7-UI-51 spec/evidence, current connection-center source/tests, owner unpacked connection-center page/fixtures/navigation/AppShell and owner HTML before edits.
- Record browser evidence comparing owner HTML/source sample, unpacked source mapping and React desktop/local-action/collapsed/mobile metrics.
- Preserve group-only routing, source-shaped centralized synthetic fallback data, browser-local toggle/test state and visible degraded/mock/read-only runtime boundaries.

## Timebox

0.5 workday. If the page requires backend/API/DB/packages/package/lock/CI/global config/shared AppShell/topbar/sidebar/registry/PageOutlet edits, real connector runtime, production connector change, real connection test, feature-flag persistence, production audit write or broad shell rewrite, stop and report `BLOCKED`.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-UI-72-connection-center-source-parity-refresh.md`
  - `docs/evidence/M7/M7-UI-72-connection-center-source-parity-refresh.md`
  - `docs/evidence/M7/README.md`
  - `docs/admin-ui-page-migration-ledger.md`
  - `apps/admin/tests/m7-ui-connection-center-source-parity.spec.ts`
- Conditional source scope, only if browser/source comparison proves a mismatch that must be fixed now:
  - `apps/admin/src/pages/group/GroupConnectionPage.tsx`
  - `apps/admin/src/pages/group/GroupConnectionViews.tsx`
  - `apps/admin/src/pages/group/groupConnectionFallback.ts`
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
  - apps/admin/src/pages/group/GroupConnectionPage.tsx
  - apps/admin/src/pages/group/GroupConnectionViews.tsx
  - apps/admin/src/pages/group/groupConnectionFallback.ts
test:
  - apps/admin/tests/m7-ui-connection-center-source-parity.spec.ts
docs:
  - docs/specs/M7-UI-72-connection-center-source-parity-refresh.md
  - docs/evidence/M7/M7-UI-72-connection-center-source-parity-refresh.md
  - docs/evidence/M7/README.md
  - docs/admin-ui-page-migration-ledger.md
generated: []
lock: []
config: []
```

## Required Reads And Source Mapping

Required reads:

- `AGENTS.md`
- `docs/specs/M7-UI-51-connection-center-page.md`
- `docs/evidence/M7/M7-UI-51-connection-center-page.md`
- `docs/admin-design-system.md`
- `docs/admin-ui-page-migration-ledger.md`
- `docs/evidence/M7/README.md`
- `apps/admin/src/pages/group/GroupConnectionPage.tsx`
- `apps/admin/src/pages/group/GroupConnectionViews.tsx`
- `apps/admin/src/pages/group/groupConnectionFallback.ts`
- `apps/admin/tests/m7-ui-connection-center.spec.ts`
- `/Users/atilla/源码/unpacked 6/pages/group/GroupConnectionPage.tsx`
- `/Users/atilla/源码/unpacked 6/fixtures/groupPlatform.ts` connection section
- `/Users/atilla/源码/unpacked 6/shell/navigation.ts`
- `/Users/atilla/源码/unpacked 6/shell/AppShell.tsx`
- `/Users/atilla/Downloads/运营塔台1.0.html`
- v1.1 connection-center boundaries: PRD REQ-G06, technical architecture channel/connector/order-import boundaries, admin group IA, mobile fallback and acceptance gate rules.

| Source | Required use |
|---|---|
| Owner HTML | Browser screenshot or DOM/text sample for connection-center owner HTML region. The HTML is a bundled executable oracle, not source to copy. |
| Unpacked group connection page | Primary structured source for title/subtitle, vertical connection rows, 40px icon block, health badge, optional ADR badge, description, tenant count, spike/ADR classification, recent error, tenant chips, toggle, test action and toast shape. |
| Unpacked `fixtures/groupPlatform.ts` | Field-shape reference for `CONN_HEALTH`, `ConnDef` and `CONN_DEFS`. React must keep centralized synthetic fallback data with visible degraded/mock/read-only labels. |
| Unpacked `navigation.ts` and `AppShell.tsx` | Group-only navigation category and `g_conn`/connection-center shell mapping reference. |
| v1.1 docs | Product/runtime boundary: connection center exists as group scope, but this slice is UI evidence only and does not imply real connector status, production toggle/test, feature flag or audit write closure. |

## Required Evidence

- Owner/source screenshot and DOM/text sample for the connection-center-related owner HTML region.
- Unpacked source mapping summary for title/subtitle/cards/icon block/health badge/ADR badge/description/tenant count/spike classification/recent error/tenant chips/toggle/test action/local toast.
- React desktop screenshot.
- React local toggle/test action screenshot.
- React collapsed-sidebar screenshot.
- React mobile `320px` screenshot.
- Metrics JSON with at least:
  - shell level `group`
  - active page `group.connections`
  - no `data-tenant-id`
  - nav width `232` expanded / `68` collapsed
  - topbar height about `53`
  - header/list/card row/icon/action/control widths and body/document scroll widths
  - runtime labels `degraded/mock/read-only/browser-local only/synthetic health/no production connector change/no real connection test/no audit write`
  - source-like booleans for title/subtitle/cards/icon block/health badge/ADR badge/description/tenant count/spike classification/recent error/tenant chips/toggle/test action/local toast
  - group sidebar categories only: `总览/平台/治理`; tenant categories absent.

## Impeccable / Design Decision Record

Adopted by default: dense product UI, source-derived group connection-center anatomy, vertical connector rows, 40px icon blocks, compact health/ADR badges, tenant chips, right-side local toggle/test controls, group-only sidebar parity, explicit local-only/no-production/no-real-test/no-audit boundary copy and mobile readable/no-overflow fallback.

Rejected: free redesign, old shell visual language, old `--uzmax-*` as visual target, raw prototype fixture imports, production-looking unlabeled connector health, production feature-flag toggles, real connector tests, audit writes and any owner-acceptance/runtime/release claim.

Accessibility/source-shape tradeoff: owner source uses a raw toggle and local test button. React keeps an accessible `role="switch"` toggle and `role="status"` toast while preserving visible source shape. The frozen source subtitle says `启停/测试写审计`; React keeps the `启停/测试` shape but adapts the visible boundary to `本地预览` / `browser-local only` / `no audit write` because this slice cannot imply audit persistence.

## Pass Conditions

- `group.connections` renders inside group shell after opening `/design` on the latest #213 stack.
- Focused browser evidence proves owner/source/React comparison, desktop/local-action/collapsed/mobile geometry, group-only sidebar categories and 320px no-overflow fallback.
- Header title/subtitle, four vertical connector rows, 40px icon blocks, health/ADR badges, descriptions, tenant counts, spike classifications, recent errors, tenant chips, right-side toggles and `测试连接` match source anatomy.
- Toggle/test interactions stay browser-local only and show a local toast with no-production/no-real-test/no-audit boundary copy.
- Existing connection-center forced-state and interaction coverage remains intact.
- Synthetic/degraded/mock/read-only labels remain visible at the page/runtime/action boundary without dominating the source-shaped row values.
- Any React visual corrections are small and limited to `apps/admin/src/pages/group/**`.
- No disallowed files are changed.

## Validation Plan

- `git diff --check origin/codex/m7-ui-71-template-center-source-parity-refresh...HEAD`
- `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-71-template-center-source-parity-refresh --spec docs/specs/M7-UI-72-connection-center-source-parity-refresh.md --include-worktree`
- touched Prettier check/write
- ESLint on touched connection-center test/source
- `node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json --pretty false`
- `node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir`
- Focused Playwright for `apps/admin/tests/m7-ui-connection-center-source-parity.spec.ts` and existing `apps/admin/tests/m7-ui-connection-center.spec.ts`.

## Failure Branches

- If source geometry cannot be kept without shared shell/topbar/sidebar edits, stop and report the shell dependency instead of editing shared shell.
- If source-shaped labels create production ambiguity, keep the visible boundary labels and record the remaining visual delta.
- If Playwright cannot open owner HTML directly, record the owner HTML as bundled executable source and use the unpacked source files plus React browser evidence as the stable mapping; do not copy compressed bundle content.

## Not Doing

- No backend/API/DB/schema/migration/generated/package/lock/global config/CI/shared AppShell/topbar/sidebar/registry/PageOutlet changes.
- No raw prototype fixture import.
- No connector DB/API/runtime/feature-flag persistence/audit write.
- No production connector change, real Telegram Bot/Business/order/import connection test, real connector status mutation or audit closure.
- No real eval gate, LLM/provider call, production prompt/model/persona change or production audit write.
- No real customer, order, Telegram, address, phone or production data.
- No owner visual acceptance, M7 closeout, GA-0, production/staging action, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release approval.
