# M7-UI-42 Model Cost Risk Page Evidence

## Status

`implementation_candidate_pending_pr_review_not_accepted_not_runtime_closed`

This branch implements a lean visible UI-first `group.modelRisk` / `模型/成本/风险` candidate with synthetic mock/degraded data. It does not claim owner visual acceptance, runtime closure, production model routing, production cost/risk metrics, production export, GA-0, or 1.0 release approval.

## Scope

- Spec: `docs/specs/M7-UI-42-model-cost-risk-page.md`
- Route: `group.modelRisk`
- Source target: `apps/admin/src/pages/group/GroupModelRiskPage.tsx`, `apps/admin/src/pages/group/GroupModelRiskViews.tsx`, `apps/admin/src/pages/group/groupModelRiskFallback.ts`
- Test target: `apps/admin/tests/m7-ui-model-cost-risk.spec.ts`

## Source Review

- Read `AGENTS.md`.
- Read `docs/admin-design-system.md`.
- Read v1.1 PRD, technical architecture, backend design/frontend architecture, and acceptance matrix model/cost/risk, group layer, LLM gateway and frontend quality sections.
- Inspected owner/prototype sources:
  - `/Users/atilla/Downloads/运营塔台1.0.html`
  - `/Users/atilla/源码/unpacked 6/pages/group/GroupModelPage.tsx`
  - `/Users/atilla/源码/unpacked 6/fixtures/groupModel.ts`
- Inspected nearby current implementation/test:
  - `apps/admin/src/pages/group/GroupOverviewPage.tsx`
  - `apps/admin/src/pages/group/groupOverviewFallback.ts`
  - `apps/admin/tests/m7-ui-group-overview.spec.ts`

## Data Boundary

- All model/cost/risk data is synthetic and centralized in `groupModelRiskFallback.ts`.
- Model refs use `SYN-MODEL-*`; tenants use only current synthetic ids `tenant-a` / `tenant-b` / `tenant-c` / `tenant-d`.
- Persistent UI copy states: `degraded`, `mock`, `read-only`, `not production cost metrics`, `no production model routing`, `local action only`.
- Export, primary/fallback switch and risk resolution mutate browser-local state only.
- No DB/API/runtime/LLM/provider/cost accounting/export/audit write is wired.

## Validation

Code quality follow-up after reviewer fixes:

- Fixed stale toast timeout cleanup, toast live-region announcement, matrix button keyboard semantics/state exposure, and cost-row keyboard focus visibility.
- Re-ran the validation set below after these fixes; the focused Playwright spec now covers toast `role`/`aria-live` and matrix keyboard activation with `aria-pressed`.

Passed locally on this branch:

- `git diff --check`
- `node scripts/guards/doc-trigger-paths.mjs`
- `node scripts/guards/prettier-ignore-boundary.mjs --base origin/codex/m7-ui-41-ai-members-visible-ui-v2`
- `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-41-ai-members-visible-ui-v2 --spec docs/specs/M7-UI-42-model-cost-risk-page.md --include-worktree`
- `node node_modules/prettier/bin/prettier.cjs --check docs/specs/M7-UI-42-model-cost-risk-page.md docs/evidence/M7/M7-UI-42-model-cost-risk-page.md docs/admin-ui-page-migration-ledger.md docs/evidence/M7/README.md apps/admin/src/pages/PageOutlet.tsx apps/admin/src/pages/registry.ts apps/admin/src/pages/group/GroupModelRiskPage.tsx apps/admin/src/pages/group/GroupModelRiskViews.tsx apps/admin/src/pages/group/groupModelRiskFallback.ts apps/admin/tests/m7-ui-model-cost-risk.spec.ts`
- `node node_modules/eslint/bin/eslint.js apps/admin/src/pages/group/GroupModelRiskPage.tsx apps/admin/src/pages/group/GroupModelRiskViews.tsx apps/admin/src/pages/group/groupModelRiskFallback.ts apps/admin/tests/m7-ui-model-cost-risk.spec.ts`
- `node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json --pretty false`
- `node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir`
- `node_modules/.bin/playwright test apps/admin/tests/m7-ui-model-cost-risk.spec.ts`
- Coordinator stacked visible UI regression across group overview, conversation workbench, conversation fallback, ticket page, knowledge resources, eval center, AI members and model cost risk: `40 passed`.

Build note: Vite emitted the existing large chunk warning; the build exited 0.

Playwright note: this shell did not expose `npm`/`npx`, and Codex app Node hit a local Rolldown code-signing mismatch. The passing Playwright run used the same checked-in test against a manually started `vite preview` server with the bundled runtime Node, so Playwright reused the existing server instead of invoking the config `npm` command.

Source shape:

- Fresh coordinator `pr-shape` source result: changedFiles 5, netLoc 571, newFiles 3.
- `apps/admin/src/pages/group/GroupModelRiskPage.tsx`: 75 lines.
- `apps/admin/src/pages/group/GroupModelRiskViews.tsx`: 237 lines.
- `apps/admin/src/pages/group/groupModelRiskFallback.ts`: 249 lines.

## Browser Evidence

- Desktop screenshot: `/tmp/uzmax-m7-ui-42-model-cost-risk-visible-ui/react-model-cost-risk-desktop.png`
- Mobile 320 screenshot: `/tmp/uzmax-m7-ui-42-model-cost-risk-visible-ui/react-model-cost-risk-mobile-320.png`
- Metrics JSON: `/tmp/uzmax-m7-ui-42-model-cost-risk-visible-ui/react-model-cost-risk-metrics.json`

Metrics summary:

- `activePageId`: `group.modelRisk`
- `shellLevel`: `group`
- `sidebarExpandedWidth`: `232`
- `topbarHeight`: `53`
- `kpiCount`: `5`
- `matrixWidth`: `554`

## Remaining Deltas

- Runtime model/cost/risk DB/API/provider/accounting/export/audit wiring remains not implemented.
- Real model route, latency, failure-rate and provider-health evidence remains intentionally blocked.
- Owner visual acceptance is still required after PR review/browser comparison.
