# M7-UI-70 Model Cost Risk Source Parity Refresh Evidence

## Status

`visible_ui_refresh_candidate_pending_pr_review_not_accepted_not_runtime_closed`

This branch refreshes browser-comparable source-parity evidence for `group.modelRisk` / `模型/成本/风险` on top of the latest #211 visible UI stack. It keeps model/cost/risk runtime downgraded: no model DB/API/runtime, provider health, production model routing, cost accounting, export job, audit write, owner visual acceptance, merge, runtime closure, GA-0 or 1.0 release approval is claimed.

## Scope

- Spec: `docs/specs/M7-UI-70-model-cost-risk-source-parity-refresh.md`
- Route: `group.modelRisk`
- Base: `origin/codex/m7-ui-69-ai-members-source-parity-refresh`
- Branch/worktree: `codex/m7-ui-70-model-cost-risk-source-parity-refresh` / `/Users/atilla/.codex/worktrees/m7-ui-70-model-cost-risk-source-parity-refresh`
- Source target:
  - `apps/admin/src/pages/group/GroupModelRiskPage.tsx`
  - `apps/admin/src/pages/group/GroupModelRiskViews.tsx`
  - `apps/admin/src/pages/group/groupModelRiskFallback.ts`
- Test targets:
  - `apps/admin/tests/m7-ui-model-cost-risk-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-model-cost-risk.spec.ts`

## Source Review

- Read `AGENTS.md`.
- Read `PRODUCT.md`, `DESIGN.md`, Impeccable product register and `docs/admin-design-system.md`.
- Read v1.1 PRD, technical architecture, admin design/frontend architecture and acceptance matrix model/cost/risk, group layer, model gateway/cost and release-boundary sections.
- Read prior M7 model/cost/risk spec/evidence:
  - `docs/specs/M7-UI-42-model-cost-risk-page.md`
  - `docs/evidence/M7/M7-UI-42-model-cost-risk-page.md`
- Inspected owner/prototype sources:
  - `/Users/atilla/Downloads/运营塔台1.0.html`
  - `/Users/atilla/源码/unpacked 6/pages/group/GroupModelPage.tsx`
  - `/Users/atilla/源码/unpacked 6/fixtures/groupModel.ts`
- Inspected current implementation/test:
  - `apps/admin/src/pages/group/GroupModelRiskPage.tsx`
  - `apps/admin/src/pages/group/GroupModelRiskViews.tsx`
  - `apps/admin/src/pages/group/groupModelRiskFallback.ts`
  - `apps/admin/tests/m7-ui-model-cost-risk.spec.ts`

## Source Parity Changes

- Fixed the confirmed anatomy mismatch: KPI grid now precedes a full-width model task matrix, with cost composition and risk queue as the two lower desktop columns.
- Updated visible header/source copy to `模型 / 成本 / 风险`, `集团级 · 实时`, `导出成本`, and `成本构成 · 按租户（今日 ¥418）`.
- Replaced overly abstract `SYN-MODEL-PRIMARY-*` visible labels with source-shaped synthetic task rows: `意图识别`, `教程问答`, `报价计算`, `截图理解`, `乌语翻译`, `红线检查`, including source-shaped primary/fallback/cost/latency/failure/eval values.
- Replaced mock tenant labels with source-shaped tenant cost labels while keeping synthetic tenant ids for local navigation.
- Matched risk action labels `恢复确认`, `查看明细`, `查看会话`, `复核` and stopped forcing a scope badge for source rows whose scope is `null`.
- Preserved the accessible task-cell button for primary/fallback switching instead of row-level click. This is a deliberate accessibility/source-shape adaptation and remains visibly close to the owner source.

## Data And Runtime Boundary

- All model/cost/risk data remains centralized synthetic fallback data in `groupModelRiskFallback.ts`.
- Persistent UI copy states: `degraded`, `mock`, `read-only`, `not production cost metrics`, `no production model routing`, `local action only`.
- Export toast states no production CSV export.
- Model switch toast states no production model routing.
- Risk resolve toast states no production provider health or audit closure changed.
- No DB/API/runtime/LLM/provider/cost accounting/export/audit write is wired.

## Browser Evidence

Artifact directory:

- `/tmp/uzmax-m7-ui-70-model-cost-risk-source-parity-refresh/`

Expected artifacts:

- Owner HTML screenshot: `/tmp/uzmax-m7-ui-70-model-cost-risk-source-parity-refresh/owner-html-model-cost-risk-source-sample.png`
- Owner HTML DOM/text sample: `/tmp/uzmax-m7-ui-70-model-cost-risk-source-parity-refresh/owner-html-model-cost-risk-source-dom-sample.json`
- Unpacked source mapping: `/tmp/uzmax-m7-ui-70-model-cost-risk-source-parity-refresh/unpacked-model-cost-risk-source-mapping.json`
- React desktop screenshot: `/tmp/uzmax-m7-ui-70-model-cost-risk-source-parity-refresh/react-model-cost-risk-desktop.png`
- React local-action screenshot: `/tmp/uzmax-m7-ui-70-model-cost-risk-source-parity-refresh/react-model-cost-risk-local-actions.png`
- React collapsed-sidebar screenshot: `/tmp/uzmax-m7-ui-70-model-cost-risk-source-parity-refresh/react-model-cost-risk-collapsed.png`
- React mobile 320 screenshot: `/tmp/uzmax-m7-ui-70-model-cost-risk-source-parity-refresh/react-model-cost-risk-mobile-320.png`
- Metrics JSON: `/tmp/uzmax-m7-ui-70-model-cost-risk-source-parity-refresh/metrics.json`

## Validation

Passed locally in this worker:

- `git diff --check origin/codex/m7-ui-69-ai-members-source-parity-refresh...HEAD`
- `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-69-ai-members-source-parity-refresh --spec docs/specs/M7-UI-70-model-cost-risk-source-parity-refresh.md --include-worktree`
- `node node_modules/prettier/bin/prettier.cjs --check docs/specs/M7-UI-70-model-cost-risk-source-parity-refresh.md docs/evidence/M7/M7-UI-70-model-cost-risk-source-parity-refresh.md docs/evidence/M7/README.md docs/admin-ui-page-migration-ledger.md apps/admin/tests/m7-ui-model-cost-risk-source-parity.spec.ts apps/admin/src/pages/group/GroupModelRiskPage.tsx apps/admin/src/pages/group/GroupModelRiskViews.tsx apps/admin/src/pages/group/groupModelRiskFallback.ts`
- `node node_modules/eslint/bin/eslint.js apps/admin/src/pages/group/GroupModelRiskPage.tsx apps/admin/src/pages/group/GroupModelRiskViews.tsx apps/admin/src/pages/group/groupModelRiskFallback.ts apps/admin/tests/m7-ui-model-cost-risk-source-parity.spec.ts`
- `node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json --pretty false`
- `node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir`
- `node_modules/.bin/playwright test apps/admin/tests/m7-ui-model-cost-risk-source-parity.spec.ts apps/admin/tests/m7-ui-model-cost-risk.spec.ts`

Build note: Vite emitted the existing large chunk warning; the build exited 0.

Playwright note: this worktree did not have its own `node_modules`; validation temporarily used a sibling `node_modules` symlink and a manually started Vite preview server on `127.0.0.1:4173`, then the symlink was removed before final guard/status/commit.

Metrics summary from `/tmp/uzmax-m7-ui-70-model-cost-risk-source-parity-refresh/metrics.json`:

- Desktop: `shellLevel=group`, `activePageId=group.modelRisk`, `navWidth=232`, `topbarHeight=53`, `bodyScrollWidth=1440`, `documentScrollWidth=1440`.
- Desktop anatomy: KPI grid width `1160`, full-width matrix width `1160`, lower cost width `521`, lower risk width `625`, `fullWidthMatrixAnatomy=true`.
- Local actions: model switch and risk resolve screenshots captured; toast copy included `no production model routing`, `no production provider health` and `audit closure`.
- Collapsed: `navWidth=68`, group categories `总览/平台/治理`, tenant category/button count `0`.
- Mobile 320: `bodyScrollWidth=320`, `documentScrollWidth=320`, readable fallback `true`.

## Remaining Deltas

- Runtime model/cost/risk DB/API/provider-health/accounting/export/audit wiring remains not implemented.
- Real model route, latency, failure-rate, provider-health and cost-accounting evidence remains intentionally blocked.
- Local tenant cost-row navigation remains a UI boundary demonstration only, not authorization/cache invalidation/runtime closure.
- Owner visual acceptance, merge, runtime closure, GA-0 and 1.0 release approval are still required later and are not claimed here.
