# M7-UI-71 Template Center Source Parity Refresh

## Goal

Refresh the existing visible UI-first `group.templates` / `模板中心` page on top of `origin/codex/m7-ui-70-model-cost-risk-source-parity-refresh` (#212 stack) so the template center page is browser-comparable against the owner HTML, frozen unpacked template-center source and latest stacked group shell.

This is a source parity refresh, not a runtime implementation. Small `apps/admin/src/pages/group/**` corrections are in scope only where owner/source/browser comparison proves a mismatch. This slice does not implement template DB/API/runtime, ops-assets wiring, production template copy, audit write, config/KB/persona/eval/template write, owner visual acceptance, merge, GA-0, production deployment, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release approval.

Owner HTML `/Users/atilla/Downloads/运营塔台1.0.html`, frozen unpacked source `/Users/atilla/源码/unpacked 6`, and `docs/admin-design-system.md` remain the visible UI source set. Template-center data must stay centralized synthetic `mock/degraded/read-only` fallback and visibly `browser-local only`, `no production template copy`, `no audit write` and `no config write`.

## Owner Confirmation Points And AI Agent Responsibility

Owner/coordinator:

- Confirm this branch is stacked on #212 / `origin/codex/m7-ui-70-model-cost-risk-source-parity-refresh`.
- Confirm this page remains GROUP layer only: `/design` opens group shell, active page `group.templates`, no `data-tenant-id`, group categories only.
- Decide later whether template runtime, ops-assets integration, audit/config/KB/persona/eval/template writes or production template copy proceed through separate approved specs.
- Keep final production/staging, real customer/order data, LLM key, cost/compliance, GA-0, production and release decisions owner-only.

AI agent:

- Work only in `/Users/atilla/.codex/worktrees/m7-ui-71-template-center-source-parity-refresh` on branch `codex/m7-ui-71-template-center-source-parity-refresh`.
- Keep `/Users/atilla/Applications/UZMAX智能运营` root/main read-only.
- Read AGENTS, M7-UI-50 spec/evidence, current template-center source/tests, owner unpacked template-center page/fixtures/navigation/App and owner HTML before edits.
- Record browser evidence comparing owner HTML/source sample, unpacked source mapping and React desktop/modal/collapsed/mobile metrics.
- Preserve group-only routing, source-shaped centralized synthetic fallback data, browser-local copy modal/toast and visible degraded/mock/read-only runtime boundaries.

## Timebox

0.5 workday. If the page requires backend/API/DB/packages/package/lock/CI/global config/shared AppShell/topbar/sidebar/registry/PageOutlet edits, real template runtime, production copy, production audit/config write or broad shell rewrite, stop and report `BLOCKED`.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-UI-71-template-center-source-parity-refresh.md`
  - `docs/evidence/M7/M7-UI-71-template-center-source-parity-refresh.md`
  - `docs/evidence/M7/README.md`
  - `docs/admin-ui-page-migration-ledger.md`
  - `apps/admin/tests/m7-ui-template-center-source-parity.spec.ts`
- Conditional source scope, only if browser/source comparison proves a mismatch that must be fixed now:
  - `apps/admin/src/pages/group/GroupTemplatePage.tsx`
  - `apps/admin/src/pages/group/GroupTemplateViews.tsx`
  - `apps/admin/src/pages/group/groupTemplateFallback.ts`
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source changed files: <= 3 conditional only
- source net LOC: <= 80 conditional only
- new source files: 0
- test files changed/added: <= 1 focused Playwright spec
- docs changed/added: <= 4
- package/lock/generated/config/backend/API/DB/worker/cron/CI/global config/shared shell/sidebar/topbar/registry/PageOutlet: 0
- external API/SDK/provider/connector/adapter basis: none; only browser evidence and local UI fallback state are in scope.

```yaml
source:
  - apps/admin/src/pages/group/GroupTemplatePage.tsx
  - apps/admin/src/pages/group/GroupTemplateViews.tsx
  - apps/admin/src/pages/group/groupTemplateFallback.ts
test:
  - apps/admin/tests/m7-ui-template-center-source-parity.spec.ts
docs:
  - docs/specs/M7-UI-71-template-center-source-parity-refresh.md
  - docs/evidence/M7/M7-UI-71-template-center-source-parity-refresh.md
  - docs/evidence/M7/README.md
  - docs/admin-ui-page-migration-ledger.md
generated: []
lock: []
config: []
```

## Required Reads And Source Mapping

Required reads:

- `AGENTS.md`
- `docs/specs/M7-UI-50-template-center-page.md`
- `docs/evidence/M7/M7-UI-50-template-center-page.md`
- `docs/admin-design-system.md`
- `docs/admin-ui-page-migration-ledger.md`
- `docs/evidence/M7/README.md`
- `apps/admin/src/pages/group/GroupTemplatePage.tsx`
- `apps/admin/src/pages/group/GroupTemplateViews.tsx`
- `apps/admin/src/pages/group/groupTemplateFallback.ts`
- `apps/admin/tests/m7-ui-template-center.spec.ts`
- `/Users/atilla/源码/unpacked 6/pages/group/GroupTemplatePage.tsx`
- `/Users/atilla/源码/unpacked 6/fixtures/groupPlatform.ts`
- `/Users/atilla/源码/unpacked 6/shell/navigation.ts`
- `/Users/atilla/源码/unpacked 6/App.tsx`
- `/Users/atilla/Downloads/运营塔台1.0.html`
- v1.1 template-center boundaries: PRD REQ-G03, technical architecture template-copy boundary, admin group IA, mobile fallback and acceptance gate rules.

| Source | Required use |
|---|---|
| Owner HTML | Browser screenshot or DOM/text sample for template-center owner HTML region. The HTML is a bundled executable oracle, not source to copy. |
| Unpacked group template page | Primary structured source for title, subtitle, tabs, dense card grid, eval badge, version/meta/recent-copy line, copy action, centered modal and local toast shape. |
| Unpacked `fixtures/groupPlatform.ts` | Field-shape reference for `TMPL_TABS`, `TMPL_EVAL`, `TMPL_LIB` and `GROUP_TENANTS`. React must keep centralized synthetic fallback data with visible degraded/mock/read-only labels. |
| Unpacked `navigation.ts` and `App.tsx` | Group-only navigation category and `g_tmpl` route mapping reference. |
| v1.1 docs | Product/runtime boundary: template center exists as group scope, but this slice is UI evidence only and does not imply production copy, independent persisted versions, ops-assets, audit or config write closure. |

## Required Evidence

- Owner/source screenshot and DOM/text sample for the template-center-related owner HTML region.
- Unpacked source mapping summary for title/subtitle/tabs/card grid/eval badge/version-meta/recent-copy/copy action/modal/tenant targets/local toast.
- React desktop screenshot.
- React copy modal screenshot.
- React collapsed-sidebar screenshot.
- React mobile `320px` screenshot.
- Metrics JSON with at least:
  - shell level `group`
  - active page `group.templates`
  - no `data-tenant-id`
  - nav width `232` expanded / `68` collapsed
  - topbar height about `53`
  - header/tab/card grid/modal widths and body/document scroll widths
  - runtime labels `degraded/mock/read-only/browser-local only/no production template copy/no audit write/no config write`
  - source-like booleans for title/subtitle/tabs/card grid/eval badge/version/meta/recent-copy/copy action/modal/tenant targets/local toast
  - group sidebar categories only: `总览/平台/治理`; tenant categories absent.

## Impeccable / Design Decision Record

Adopted by default: dense product UI, source-derived group template-center anatomy, group-only sidebar parity, five source tabs, compact card grid, centered approximately `420px` copy modal, source-shaped Chinese toast, explicit local-only/no-production boundary copy and mobile readable/no-overflow fallback.

Rejected: free redesign, old M5 template center shell/runtime files as visual source, old shell visual language, old `--uzmax-*` as visual target, raw prototype fixture imports, production-looking unlabeled template copy, audit/config/KB/persona/eval/template writes and any owner-acceptance/runtime/release claim.

Accessibility/source-shape tradeoff: owner source uses non-semantic clickable tab/card/tenant rows and click-outside modal close; React keeps accessible buttons, dialog role, focus handling and checkbox semantics while preserving the visible source shape and records the adaptation in evidence.

## Pass Conditions

- `group.templates` renders inside group shell after opening `/design` on the latest #212 stack.
- Focused browser evidence proves owner/source/React comparison, desktop/modal/collapsed/mobile geometry, group-only sidebar categories and 320px no-overflow fallback.
- Header title/subtitle, five tabs, dense template cards, eval badge, version/meta/recent-copy line, copy action and copy modal match source anatomy.
- Copy confirmation stays disabled until a target tenant is selected, then shows a source-shaped local-only Chinese toast with no-production/audit/config-write boundary copy.
- Existing template-center interaction coverage remains intact.
- Synthetic/degraded/mock/read-only labels remain visible and state `browser-local only`, `no production template copy`, `no audit write` and `no config write`.
- Any React visual corrections are small and limited to `apps/admin/src/pages/group/**`.
- No disallowed files are changed.

## Validation Plan

- `git diff --check origin/codex/m7-ui-70-model-cost-risk-source-parity-refresh...HEAD`
- `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-70-model-cost-risk-source-parity-refresh --spec docs/specs/M7-UI-71-template-center-source-parity-refresh.md --include-worktree`
- touched Prettier check/write
- ESLint on touched template-center test/source
- `node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json --pretty false`
- `node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir`
- Focused Playwright for `apps/admin/tests/m7-ui-template-center-source-parity.spec.ts` and existing `apps/admin/tests/m7-ui-template-center.spec.ts`.

## Failure Branches

- If source geometry cannot be kept without shared shell/topbar/sidebar edits, stop and report the shell dependency instead of editing shared shell.
- If source-shaped labels create production ambiguity, keep the visible boundary labels and record the remaining visual delta.
- If Playwright cannot open owner HTML directly, record the owner HTML as bundled executable source and use the unpacked source files plus React browser evidence as the stable mapping; do not copy compressed bundle content.

## Not Doing

- No backend/API/DB/schema/migration/generated/package/lock/global config/CI/shared AppShell/topbar/sidebar/registry/PageOutlet changes.
- No raw prototype fixture import.
- No template DB/API/runtime/ops-assets/template persistence/audit/config/knowledge/eval/persona write.
- No production template copy, production audit write, production config write, formal KB write, persona publish, eval publish or template write.
- No real eval gate, LLM/provider call, production prompt/model/persona change or production audit write.
- No real customer, order, Telegram, address, phone or production data.
- No owner visual acceptance, M7 closeout, GA-0, production/staging action, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release approval.
