# M7-UI-80 Model Risk Default Visual Parity Refresh Evidence

## Status

`visible_ui_refresh_candidate_pending_pr_review_not_accepted_not_runtime_closed`

This branch refreshes the default visual copy for `group.modelRisk` / `模型/成本/风险`. It removes engineering/runtime labels from the default visible page body while preserving boundary evidence in hidden DOM/data attributes and deliberate local-action toasts.

## Scope

- Spec: `docs/specs/M7-UI-80-model-risk-default-visual-parity-refresh.md`
- Route: `group.modelRisk`
- Base: `origin/codex/m7-ui-79-ticket-default-visual-parity-refresh`
- Branch/worktree: `codex/m7-ui-80-model-risk-default-visual-parity-refresh` / `/Users/atilla/.codex/worktrees/m7-ui-80-model-risk-default-visual-parity-refresh`

## Required Reads

- Read `AGENTS.md`.
- Read Impeccable project skill setup and product register. `node` was unavailable in this shell, so the context script could not run; product-register guidance was read directly.
- Read M7-UI-70 spec/evidence.
- Inspected current implementation/test:
  - `apps/admin/src/pages/group/GroupModelRiskPage.tsx`
  - `apps/admin/src/pages/group/GroupModelRiskViews.tsx`
  - `apps/admin/src/pages/group/groupModelRiskFallback.ts`
  - `apps/admin/tests/m7-ui-model-cost-risk-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-model-cost-risk.spec.ts`
- Inspected owner/prototype sources:
  - `/Users/atilla/Downloads/运营塔台1.0.html`
  - `/Users/atilla/源码/unpacked 6/pages/group/GroupModelPage.tsx`
  - `/Users/atilla/源码/unpacked 6/fixtures/groupModel.ts`

## Changes

- Moved the default runtime disclaimer from visible note copy to hidden DOM/data evidence:
  - `data-runtime-labels` on `m7-model-page`
  - `data-boundary` on `m7-model-runtime-note`
- Removed default visible engineering labels from KPI values, KPI deltas, matrix subtitle, cost subtitle, risk subtitle and risk row metadata.
- Kept owner/source-shaped default copy for title, KPI cards, matrix, cost composition and risk queue.
- Preserved deliberate local-action boundary copy in export/model-switch/risk-resolve toasts.
- Updated focused Playwright coverage so default body text must not include the engineering labels, while hidden DOM/data attributes must retain them.

## Boundary Evidence

Hidden/default evidence retained:

- `degraded`
- `mock`
- `read-only`
- `not production cost metrics`
- `no production model routing`
- `local action only`

Deliberate local-action evidence retained:

- Export toast: local-only mock export; no production CSV export.
- Model switch toast: browser-local state only; no production model routing.
- Risk resolve toast: resolved locally; no production provider health or audit closure changed.

## Non-Claims

- No model DB/API/runtime/provider health/cost accounting/export job/audit write is implemented.
- No production model routing or production cost metric truth is claimed.
- No owner visual acceptance, merge, runtime closure, GA-0 or 1.0 release approval is claimed.

## Validation

Node note: default shell PATH did not expose `node` or `npm`. Validation used `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node` and a temporary sibling `node_modules` symlink to `/Users/atilla/.codex/worktrees/m7-ui-65-customer-assets-source-parity-refresh/node_modules`. The symlink, `apps/admin/dist`, `test-results` and `playwright-report` were removed before final status.

Passed locally in this worker:

- `git diff --check`
- `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-79-ticket-default-visual-parity-refresh --spec docs/specs/M7-UI-80-model-risk-default-visual-parity-refresh.md --include-worktree`
- `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/prettier/bin/prettier.cjs --check docs/specs/M7-UI-80-model-risk-default-visual-parity-refresh.md docs/evidence/M7/M7-UI-80-model-risk-default-visual-parity-refresh.md docs/evidence/M7/README.md docs/admin-ui-page-migration-ledger.md apps/admin/tests/m7-ui-model-cost-risk-source-parity.spec.ts apps/admin/tests/m7-ui-model-cost-risk.spec.ts apps/admin/src/pages/group/GroupModelRiskPage.tsx apps/admin/src/pages/group/GroupModelRiskViews.tsx apps/admin/src/pages/group/groupModelRiskFallback.ts`
- `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/eslint/bin/eslint.js apps/admin/src/pages/group/GroupModelRiskPage.tsx apps/admin/src/pages/group/GroupModelRiskViews.tsx apps/admin/src/pages/group/groupModelRiskFallback.ts apps/admin/tests/m7-ui-model-cost-risk-source-parity.spec.ts apps/admin/tests/m7-ui-model-cost-risk.spec.ts`
- `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir`
- `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node_modules/.bin/playwright test apps/admin/tests/m7-ui-model-cost-risk.spec.ts apps/admin/tests/m7-ui-model-cost-risk-source-parity.spec.ts`

Build note: Vite emitted the existing large chunk warning; the build exited 0.

Playwright result: 5 passed.

Workspace hygiene:

- `git branch --no-merged main` was checked; this branch and the existing M7 stacked branches remain unmerged.
- `gh pr list --state open --limit 40` could not run because `gh` is not installed in this shell.
