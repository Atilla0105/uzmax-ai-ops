# M7-UI-82 Group Overview Default Visual Parity Refresh Evidence

## Status

`visible_ui_refresh_candidate_pending_pr_review_not_accepted_not_runtime_closed`

This branch refreshes default visual parity for `group.overview` / `集团总览`
on top of `origin/codex/m7-ui-81-eval-default-visual-parity-refresh`. It removes
engineering/runtime caveat pollution from the default visible group overview
body while preserving hidden DOM/data-attribute evidence. It does not claim group
aggregate DB/API/runtime, production authorization/cache invalidation, real
operational metrics, owner visual acceptance, merge, runtime closure, GA-0 or
1.0 release approval.

## Startup Evidence

- `pwd`: `/Users/atilla/.codex/worktrees/m7-ui-82-group-overview-default-visual-parity-refresh`
- `git status --short --branch`: `## codex/m7-ui-82-group-overview-default-visual-parity-refresh`
- `git branch --show-current`: `codex/m7-ui-82-group-overview-default-visual-parity-refresh`
- Root/main checkout at `/Users/atilla/Applications/UZMAX智能运营` was not used
  for code edits.

## Source Review

- Read `AGENTS.md`.
- Ran Impeccable context for
  `apps/admin/src/pages/group/GroupOverviewPage.tsx` with the Codex runtime
  Node; read product-register guidance.
- Read prior group overview spec/evidence:
  - `docs/specs/M7-UI-12-group-overview-page.md`
  - `docs/specs/M7-UI-61-group-overview-first-viewport-parity.md`
  - `docs/evidence/M7/M7-UI-61-group-overview-first-viewport-parity.md`
- Read current group overview source and tests:
  - `apps/admin/src/pages/group/GroupOverviewPage.tsx`
  - `apps/admin/src/pages/group/groupOverviewFallback.ts`
  - `apps/admin/tests/m7-ui-group-overview.spec.ts`
- Inspected owner/prototype sources:
  - `/Users/atilla/Downloads/运营塔台1.0.html`
  - `/Users/atilla/源码/unpacked 6/pages/group/GroupOverviewPage.tsx`
  - `/Users/atilla/源码/unpacked 6/fixtures/group.ts`
- Read `docs/admin-ui-page-migration-ledger.md` and `docs/evidence/M7/README.md`.

## Source Parity Changes

- Replaced visible default `mock/degraded` result text with `4 个租户`.
- Removed visible `mock` prefixes from business lines, eval/order status labels
  and last-abnormal labels.
- Added `data-runtime-boundary` to the group overview page root while preserving
  `data-runtime-state="degraded"` and `data-runtime-source`.
- Replaced the visible runtime note with hidden DOM evidence
  `m7-group-overview-runtime-note`.
- Kept search/filter/clear/sort and controlled UI-only row entry into
  `tenant.conversations`.
- Added focused default visual parity Playwright coverage for desktop, collapsed
  sidebar and 320px mobile.

## Data And Runtime Boundary

- All group overview health cards and rows remain centralized fallback values in
  `groupOverviewFallback.ts`.
- Runtime labels remain present in DOM/data attributes: `degraded`, `mock`,
  `read-only`, `aggregate runtime unavailable`, `not production metrics` and
  `centralized mock/degraded fallback only`.
- Default desktop/collapsed/mobile evidence requires these runtime labels to be
  present in hidden/data evidence and absent from visible body text.
- Tenant-entry remains a UI-only degraded boundary demonstration. Real backend
  authorization, tenant-scoped cache invalidation, RLS and permission reload
  remain future runtime work.

## Browser Evidence

Focused Playwright coverage records:

- default `/design` group layer and `group.overview`
- expanded sidebar width `232`
- collapsed sidebar width `68`
- topbar height `52-53`
- four visible source-like tenant rows
- source-like default visible labels including `美妆 · 中亚`, `阻断/通过/运行中`,
  `降级/故障/正常` and `红线 · 9分钟前`
- body/document scroll width within viewport at desktop and 320px mobile
- runtime labels present in data/hidden DOM and absent from visible body
- row click and keyboard entry into `tenant.conversations`

## Validation

| Command | Result | Notes |
|---|---|---|
| `node .agents/skills/impeccable/scripts/detect.mjs --json apps/admin/src/pages/group/GroupOverviewPage.tsx apps/admin/src/pages/group/groupOverviewFallback.ts` | pass | Result `[]`. |
| `node node_modules/prettier/bin/prettier.cjs --check apps/admin/src/pages/group/GroupOverviewPage.tsx apps/admin/src/pages/group/groupOverviewFallback.ts apps/admin/tests/m7-ui-group-overview.spec.ts apps/admin/tests/m7-ui-group-overview-default-visual-parity.spec.ts docs/specs/M7-UI-82-group-overview-default-visual-parity-refresh.md docs/evidence/M7/M7-UI-82-group-overview-default-visual-parity-refresh.md docs/evidence/M7/README.md docs/admin-ui-page-migration-ledger.md` | pass | All matched files use Prettier style. |
| `node node_modules/eslint/bin/eslint.js apps/admin/src/pages/group/GroupOverviewPage.tsx apps/admin/src/pages/group/groupOverviewFallback.ts apps/admin/tests/m7-ui-group-overview.spec.ts apps/admin/tests/m7-ui-group-overview-default-visual-parity.spec.ts` | pass | Focused touched source/test lint. |
| `node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir` | pass | Admin build completed; existing large chunk warning only. |
| `node node_modules/@playwright/test/cli.js test apps/admin/tests/m7-ui-group-overview.spec.ts apps/admin/tests/m7-ui-group-overview-default-visual-parity.spec.ts --config=playwright.config.ts --reporter=line` | pass | `6 passed`; used manually started `vite preview` on `127.0.0.1:4173` because project config invokes unavailable `npm/npx`. |
| `git diff --check` | pass | No whitespace output. |
| `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-81-eval-default-visual-parity-refresh --spec docs/specs/M7-UI-82-group-overview-default-visual-parity-refresh.md --include-worktree` | pass | `changedFiles=8`, `source.changedFiles=2`, `source.netLoc=0`, `source.newFiles=0`; categories: source 2, test 2, docs 4. |

Validation environment note: plain `node`, `npm`, `npx` and `gh` were not on the
shell PATH. This worker used
`/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node`
and a temporary `node_modules` symlink to
`/Users/atilla/.codex/worktrees/m7-ui-65-customer-assets-source-parity-refresh/node_modules`;
the symlink and generated `apps/admin/dist`, `test-results` and
`playwright-report` artifacts were removed before final status/commit.

## Remaining Non-Claims

- This branch is a visual-parity refresh only; it does not claim owner visual
  acceptance.
- Group aggregate DB/API/runtime, real authorization/cache invalidation and
  production operational metrics remain future approved specs.
- Mobile is a readable/no-overflow fallback, not a pixel-level mobile redesign.
