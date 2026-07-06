# M7-UI-42 Model Cost Risk Page Evidence

## Status

`implementation_candidate_pending_pr_review_not_accepted_not_runtime_closed`

This branch implements a cleanstack visible UI-first `group.modelRisk` / `模型/成本/风险` candidate with synthetic mock/degraded data on `origin/codex/m7-ui-31-orders-visible-ui` at `375417253e49a98c1bb1f2ee5f2f357b02bdc3be`.

It does not claim owner visual acceptance, runtime closure, production model routing, production cost/risk metrics, production export, GA-0, or 1.0 release approval.

## Scope

- Spec: `docs/specs/M7-UI-42-model-cost-risk-page.md`
- Route: `group.modelRisk`
- Source target: `apps/admin/src/pages/group/GroupModelRiskPage.tsx`, `apps/admin/src/pages/group/GroupModelRiskViews.tsx`, `apps/admin/src/pages/group/groupModelRiskFallback.ts`
- Test target: `apps/admin/tests/m7-ui-model-cost-risk.spec.ts`
- Branch: `codex/m7-ui-42-model-cost-risk-page-cleanstack`
- Worktree: `/Users/atilla/.codex/worktrees/m7-ui-42-model-cost-risk-page-cleanstack`

## Source Review

- Read `AGENTS.md`.
- Read `PRODUCT.md`, `DESIGN.md`, Impeccable product-register guidance, and `docs/admin-design-system.md`.
- Reviewed v1.1 PRD, technical architecture, backend design/frontend architecture, and acceptance matrix sections covering group layer, model/cost/risk, LLM gateway, frontend quality and release boundaries.
- Inspected owner/prototype sources:
  - `/Users/atilla/Downloads/运营塔台1.0.html`
  - `/Users/atilla/源码/unpacked 6/pages/group/GroupModelPage.tsx`
  - `/Users/atilla/源码/unpacked 6/fixtures/groupModel.ts`
- Inspected nearby current implementation/test:
  - `apps/admin/src/pages/group/GroupOverviewPage.tsx`
  - `apps/admin/src/pages/group/groupOverviewFallback.ts`
  - `apps/admin/tests/m7-ui-group-overview.spec.ts`
- Inspected old branch files read-only from `origin/codex/m7-ui-42-model-cost-risk-visible-ui`; this branch cleanstacks the slice onto current trunk and updates base/artifact evidence to M7-UI-31.

## Data Boundary

- All model/cost/risk data is synthetic and centralized in `groupModelRiskFallback.ts`.
- Model refs use `SYN-MODEL-*`.
- Tenants use only current synthetic ids `tenant-a` / `tenant-b` / `tenant-c` / `tenant-d`.
- Persistent UI copy states: `degraded`, `mock`, `read-only`, `not production cost metrics`, `no production model routing`, `local action only`.
- Export, primary/fallback switch and risk resolution mutate browser-local state only.
- No DB/API/runtime/LLM/provider/cost accounting/export/audit write is wired.

## Validation

Passed locally in the worker worktree with Node from `/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin`:

- `git diff --check`
- `git diff --name-only origin/codex/m7-ui-31-orders-visible-ui...HEAD`
- `npm run format:check`
- `npm run jscpd`
- `npm run knip`
- `npm run guard:pr-shape -- --base origin/codex/m7-ui-31-orders-visible-ui --spec docs/specs/M7-UI-42-model-cost-risk-page.md --include-worktree`
- `npx playwright test apps/admin/tests/m7-ui-model-cost-risk.spec.ts` (`5 passed`)
- `npm run typecheck`
- `npm run lint`

`guard:pr-shape` final source result: changed source files `5`, new source files `3`, net source LOC `595`.

## Browser Evidence

Playwright writes artifacts under:

- `/tmp/uzmax-m7-ui-42-model-cost-risk-page-cleanstack/source-availability.json`
- `/tmp/uzmax-m7-ui-42-model-cost-risk-page-cleanstack/source-sampling.json` or `/tmp/uzmax-m7-ui-42-model-cost-risk-page-cleanstack/source-unavailable.md`
- `/tmp/uzmax-m7-ui-42-model-cost-risk-page-cleanstack/react-model-cost-risk-desktop.png`
- `/tmp/uzmax-m7-ui-42-model-cost-risk-page-cleanstack/react-model-cost-risk-desktop-metrics.json`
- `/tmp/uzmax-m7-ui-42-model-cost-risk-page-cleanstack/react-model-cost-risk-mobile-320.png`
- `/tmp/uzmax-m7-ui-42-model-cost-risk-page-cleanstack/react-model-cost-risk-mobile-320-metrics.json`

Desktop metrics:

- `activePageId`: `group.modelRisk`
- `shellLevel`: `group`
- `sidebarExpandedWidth`: `232`
- `topbarHeight`: `53`
- `kpiCount`: `5`
- `matrixWidth`: `554`
- `costPanelWidth`: `432`
- `riskPanelWidth`: `432`

Mobile 320 metrics:

- `bodyScrollWidth`: `320`
- `documentScrollWidth`: `320`
- `pageWidth`: `320`
- `kpiWidths`: `296, 296, 296, 296, 296`
- `matrixPanelWidth`: `296`
- `costPanelWidth`: `296`
- `riskPanelWidth`: `296`
- `tableWrapWidth`: `294`
- `tableWrapScrollWidth`: `294`

## Remaining Deltas

- Runtime model/cost/risk DB/API/provider/accounting/export/audit wiring remains not implemented.
- Real model route, latency, failure-rate and provider-health evidence remains intentionally blocked.
- Owner visual acceptance is still required after PR review/browser comparison.
