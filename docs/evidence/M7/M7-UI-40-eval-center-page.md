# M7-UI-40 Eval Center Page Evidence

## Status

`implementation_candidate_pending_pr_review_not_accepted_not_runtime_closed`

This branch implements a visible UI-first `tenant.eval` / 评测中心 candidate with sanitized synthetic mock data. It does not claim owner visual acceptance, merge, runtime closure, production eval data readiness, production publish readiness, GA-0 or 1.0 release approval.

## Scope

- Spec: `docs/specs/M7-UI-40-eval-center-page.md`
- Route: `tenant.eval`
- Source target: `apps/admin/src/pages/evals/EvalPage.tsx`, `apps/admin/src/pages/evals/EvalViews.tsx`, `apps/admin/src/pages/evals/evalFallback.ts`
- Test target: `apps/admin/tests/m7-ui-eval-center.spec.ts`

## Source Review

- Read `AGENTS.md`.
- Read `docs/admin-design-system.md`.
- Read nearby spec `docs/specs/M7-UI-32-knowledge-resources-page.md`.
- Inspected owner/prototype sources:
  - `/Users/atilla/Downloads/运营塔台1.0.html`
  - `/Users/atilla/源码/unpacked 6/pages/evals/EvalPage.tsx`
  - `/Users/atilla/源码/unpacked 6/pages/evals/evalConstants.ts`
  - `/Users/atilla/源码/unpacked 6/hooks/useEvals.ts`
  - `/Users/atilla/源码/unpacked 6/fixtures/evals.ts`
- Inspected current implementation/test neighbors:
  - `apps/admin/src/pages/knowledge/*`
  - `apps/admin/tests/m7-ui-knowledge-resources.spec.ts`
  - `apps/admin/tests/m7-ui-ticket-page.spec.ts`

## Data Boundary

- All data is synthetic and centralized in `evalFallback.ts`.
- IDs use `SYN-EVAL-*`.
- Refs use `controlled://mock/evals/...`.
- Persistent UI copy states: `degraded`, `mock`, `read-only`, `not production eval data`, `no production publish`, `manual review local only`.
- Manual override and publish confirmation mutate only browser-local state.
- No DB/API/eval runner/LLM/provider call or production publish exists in this slice.

## Validation

Passed locally with bundled Node:

- `git diff --check`
- `node scripts/guards/doc-trigger-paths.mjs`
- `node scripts/guards/prettier-ignore-boundary.mjs --base origin/codex/m7-ui-32-knowledge-resources-visible-ui-v2`
- `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-32-knowledge-resources-visible-ui-v2 --spec docs/specs/M7-UI-40-eval-center-page.md --include-worktree`
- `node_modules/.bin/prettier --check docs/specs/M7-UI-40-eval-center-page.md docs/evidence/M7/M7-UI-40-eval-center-page.md docs/admin-ui-page-migration-ledger.md docs/evidence/M7/README.md apps/admin/src/pages/PageOutlet.tsx apps/admin/src/pages/registry.ts apps/admin/src/pages/evals apps/admin/tests/m7-ui-eval-center.spec.ts`
- `find apps/admin/src/pages/evals apps/admin/tests/m7-ui-eval-center.spec.ts -type f \( -name "*.ts" -o -name "*.tsx" \) -print0 | xargs -0 node node_modules/eslint/bin/eslint.js`
- `node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json --pretty false`
- `node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir`
- `node_modules/.bin/playwright test apps/admin/tests/m7-ui-eval-center.spec.ts` (`5 passed`)
- Stacked visible UI regression across group overview, conversation workbench, conversation fallback, ticket page, knowledge resources and eval center (`33 passed`)

Build note: Vite emitted the existing large chunk warning; build succeeded.

Latest `pr-shape` source budget evidence: changedFiles `5`, netLoc `598`, newFiles `3`; no `large_change_exception` is proposed.

## Browser Evidence

- Desktop screenshot: `/tmp/uzmax-m7-ui-40-eval-center-visible-ui/react-eval-center-desktop.png`
- Mobile 320 screenshot: `/tmp/uzmax-m7-ui-40-eval-center-visible-ui/react-eval-center-mobile-320.png`
- Metrics JSON: `/tmp/uzmax-m7-ui-40-eval-center-visible-ui/react-eval-center-metrics.json`

Metrics JSON:

```json
{
  "activePageId": "tenant.eval",
  "bodyScrollWidth": 1280,
  "leftListWidth": 300,
  "shellLevel": "tenant",
  "sidebarExpandedWidth": 232,
  "topbarHeight": 53
}
```

## Remaining Deltas

- Runtime eval runner/gate evidence is not wired and remains intentionally blocked.
- Production publish is not wired and remains intentionally blocked.
- Owner visual acceptance is still required after PR review/browser comparison.
