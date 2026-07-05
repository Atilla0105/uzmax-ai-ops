# M7-UI-70 Model Cost Risk Source Parity Refresh

## Goal

Refresh the existing visible UI-first `group.modelRisk` / `模型/成本/风险` page on top of `origin/codex/m7-ui-69-ai-members-source-parity-refresh` (#211 stack) so the group model/cost/risk page is browser-comparable against the owner HTML, frozen unpacked group model source and latest stacked group shell.

This is a source parity refresh, not a runtime implementation. Small `apps/admin/src/pages/group/**` corrections are in scope only where owner/source/browser comparison proves a mismatch. This slice does not implement model DB/API/runtime, provider health, production model routing, production cost accounting, export jobs, audit write, owner visual acceptance, merge, GA-0, production deployment, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release approval.

Owner HTML `/Users/atilla/Downloads/运营塔台1.0.html`, frozen unpacked source `/Users/atilla/源码/unpacked 6`, and `docs/admin-design-system.md` remain the visible UI source set. Model/cost/risk data must stay centralized synthetic `mock/degraded/read-only` fallback and visibly `not production cost metrics`, `no production model routing` and `local action only`.

## Owner Confirmation Points And AI Agent Responsibility

Owner/coordinator:

- Confirm this branch is stacked on #211 / `origin/codex/m7-ui-69-ai-members-source-parity-refresh`.
- Confirm this page remains GROUP layer only: `/design` opens group shell, active page `group.modelRisk`, no `data-tenant-id`, group categories only.
- Decide later whether model runtime, provider health, cost accounting, export or audit closure proceeds through separate approved specs.
- Keep final production/staging, real customer/order data, LLM key, cost/compliance, GA-0, production and release decisions owner-only.

AI agent:

- Work only in `/Users/atilla/.codex/worktrees/m7-ui-70-model-cost-risk-source-parity-refresh` on branch `codex/m7-ui-70-model-cost-risk-source-parity-refresh`.
- Keep `/Users/atilla/Applications/UZMAX智能运营` root/main read-only.
- Read AGENTS, M7-UI-42 spec/evidence, current group model source/tests, owner unpacked group model page/fixtures and owner HTML before edits.
- Record browser evidence comparing owner HTML/source sample, unpacked source mapping and React desktop/local-action/collapsed/mobile metrics.
- Preserve group-only routing, source-shaped centralized synthetic fallback data, browser-local export/model switch/risk resolve state and visible degraded/mock/read-only runtime boundaries.

## Timebox

0.5 workday. If the page requires backend/API/DB/packages/package/lock/CI/global config/shared AppShell/topbar/sidebar/registry/PageOutlet edits, real model runtime, provider health, cost accounting, production export, production audit write or broad shell rewrite, stop and report `BLOCKED`.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-UI-70-model-cost-risk-source-parity-refresh.md`
  - `docs/evidence/M7/M7-UI-70-model-cost-risk-source-parity-refresh.md`
  - `docs/evidence/M7/README.md`
  - `docs/admin-ui-page-migration-ledger.md`
  - `apps/admin/tests/m7-ui-model-cost-risk-source-parity.spec.ts`
- Conditional source scope, only if browser/source comparison proves a mismatch that must be fixed now:
  - `apps/admin/src/pages/group/GroupModelRiskPage.tsx`
  - `apps/admin/src/pages/group/GroupModelRiskViews.tsx`
  - `apps/admin/src/pages/group/groupModelRiskFallback.ts`
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source changed files: <= 3 conditional only
- source net LOC: <= 220 conditional only
- new source files: 0
- test files changed/added: <= 1 focused Playwright spec
- docs changed/added: <= 4
- package/lock/generated/config/backend/API/DB/worker/cron/CI/global config/shared shell/sidebar/topbar/registry/PageOutlet: 0
- external API/SDK/provider/connector/adapter basis: none; only browser evidence and local UI fallback state are in scope.

## Required Reads And Source Mapping

Required reads:

- `AGENTS.md`
- `docs/specs/M7-UI-42-model-cost-risk-page.md`
- `docs/evidence/M7/M7-UI-42-model-cost-risk-page.md`
- `docs/admin-design-system.md`
- `docs/admin-ui-page-migration-ledger.md`
- `docs/evidence/M7/README.md`
- `apps/admin/src/pages/group/GroupModelRiskPage.tsx`
- `apps/admin/src/pages/group/GroupModelRiskViews.tsx`
- `apps/admin/src/pages/group/groupModelRiskFallback.ts`
- `apps/admin/tests/m7-ui-model-cost-risk.spec.ts`
- `/Users/atilla/源码/unpacked 6/pages/group/GroupModelPage.tsx`
- `/Users/atilla/源码/unpacked 6/fixtures/groupModel.ts`
- `/Users/atilla/Downloads/运营塔台1.0.html`
- v1.1 group model/cost/risk boundaries: PRD REQ-G04/G05, model gateway/accounting boundaries, admin group IA, mobile fallback and acceptance gate rules.

| Source | Required use |
|---|---|
| Owner HTML | Browser screenshot or DOM/text sample for model/cost/risk owner HTML region. The HTML is a bundled executable oracle, not source to copy. |
| Unpacked group model page | Primary structured source for title, export label, KPI grid, full-width model matrix, lower cost/risk panels, row switch and risk resolve behavior. |
| Unpacked `fixtures/groupModel.ts` | Field-shape reference for KPI, task, tenant cost and risk queue labels. React must keep centralized synthetic fallback data with visible degraded/mock/read-only labels. |
| v1.1 docs | Product/runtime boundary: group model/cost/risk governance exists as scope, but this slice is UI evidence only and does not imply real accounting, provider health, model route or audit write. |

## Required Evidence

- Owner/source screenshot and DOM/text sample for the model/cost/risk-related owner HTML region.
- Unpacked source mapping summary for title/export/KPI grid/full-width matrix/cost by tenant/risk queue/local resolve/model switch.
- React desktop screenshot.
- React local model-switch/risk-resolve screenshot.
- React collapsed-sidebar screenshot.
- React mobile `320px` screenshot.
- Metrics JSON with at least:
  - shell level `group`
  - active page `group.modelRisk`
  - no `data-tenant-id`
  - nav width `232` expanded / `68` collapsed
  - topbar height about `53`
  - page/KPI/matrix/cost/risk widths and body/document scroll widths
  - runtime labels `degraded/mock/read-only/not production cost metrics/no production model routing/local action only`
  - source-like booleans for title/export/KPI grid/full-width matrix/cost by tenant/risk queue/local export/model switch/risk resolve
  - group sidebar categories only: `总览/平台/治理`; tenant categories absent.

## Impeccable / Design Decision Record

Adopted by default: dense product UI, source-derived group model/cost/risk anatomy, KPI grid before full-width model matrix, lower cost/risk two-column row, group-only sidebar parity, optional/null risk scopes, source-shaped task/cost/risk labels, visible local-only boundary copy and mobile readable/no-overflow fallback.

Rejected: free redesign, old shell visual language, old `--uzmax-*` as visual target, raw prototype fixture imports, production-looking unlabeled cost/provider/export semantics, provider health, cost accounting, real model routing, production export, audit closure and any owner-acceptance/runtime/release claim.

Accessibility/source-shape tradeoff: owner source toggles primary/fallback by clicking the table row; React keeps an accessible button in the task cell with `aria-pressed` while preserving visible table shape and records the adaptation in evidence.

## Pass Conditions

- `group.modelRisk` renders inside group shell after opening `/design` on the latest #211 stack.
- Focused browser evidence proves owner/source/React comparison, desktop/local-action/collapsed/mobile geometry, group-only sidebar categories and 320px no-overflow fallback.
- The model task matrix is full-width below KPI grid; cost composition and risk queue render as two lower columns on desktop.
- Existing model/cost/risk interaction coverage remains intact.
- Synthetic/degraded/mock/read-only labels remain visible and state `not production cost metrics`, `no production model routing` and `local action only`.
- Export, primary/fallback switch and risk resolve remain browser-local only; no production CSV export, model routing, provider health or audit closure is implied.
- Any React visual corrections are small and limited to `apps/admin/src/pages/group/**`.
- No disallowed files are changed.

## Validation Plan

- `git diff --check origin/codex/m7-ui-69-ai-members-source-parity-refresh...HEAD`
- `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-69-ai-members-source-parity-refresh --spec docs/specs/M7-UI-70-model-cost-risk-source-parity-refresh.md --include-worktree`
- touched Prettier check/write
- ESLint on touched model/cost/risk test/source
- `node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json --pretty false`
- `node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir`
- Focused Playwright for `apps/admin/tests/m7-ui-model-cost-risk-source-parity.spec.ts` and existing `apps/admin/tests/m7-ui-model-cost-risk.spec.ts`.

## Failure Branches

- If source geometry cannot be kept without shared shell/topbar/sidebar edits, stop and report the shell dependency instead of editing shared shell.
- If source-shaped labels create production ambiguity, keep the visible boundary labels and record the remaining visual delta.
- If Playwright cannot open owner HTML directly, record the owner HTML as bundled executable source and use the unpacked source files plus React browser evidence as the stable mapping; do not copy compressed bundle content.

## Not Doing

- No backend/API/DB/schema/migration/generated/package/lock/global config/CI/shared AppShell/topbar/sidebar/registry/PageOutlet changes.
- No raw prototype fixture import.
- No model DB/API/runtime/provider health/cost accounting/export/audit write.
- No production model routing, production cost metrics, production provider health, production export or audit closure.
- No real eval gate, LLM/provider call, production prompt/model/persona change or production audit write.
- No real customer, order, Telegram, address, phone or production data.
- No owner visual acceptance, M7 closeout, GA-0, production/staging action, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release approval.
