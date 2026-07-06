# M7-UI-89 Config Default Visual Parity Refresh Evidence

## Status

`visible_ui_refresh_candidate_pending_pr_review_not_accepted_not_runtime_closed`

This branch refreshes default-visible copy for `tenant.config` / `配置` on top of `codex/m7-ui-88-team-default-visual-parity-refresh`. It keeps config runtime downgraded: no config DB/API/runtime write, production config persistence, audit write, connector runtime switch, connector API call, order import runtime, eval-gated publish, owner visual acceptance, merge, runtime closure, GA-0 or 1.0 release approval is claimed.

## Scope

- Spec: `docs/specs/M7-UI-89-config-default-visual-parity-refresh.md`
- Route: `tenant.config`
- Base: `codex/m7-ui-88-team-default-visual-parity-refresh`
- Branch/worktree: `codex/m7-ui-89-config-default-visual-parity-refresh` / `/Users/atilla/.codex/worktrees/m7-ui-89-config-default-visual-parity-refresh`
- Source targets:
  - `apps/admin/src/pages/config/ConfigPage.tsx`
  - `apps/admin/src/pages/config/configFallback.ts`
- Test targets:
  - `apps/admin/tests/m7-ui-config-page.spec.ts`
  - `apps/admin/tests/m7-ui-config-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-config-default-visual-parity.spec.ts`

## Startup Evidence

- `pwd`: `/Users/atilla/.codex/worktrees/m7-ui-89-config-default-visual-parity-refresh`
- `git status --short --branch`: `## codex/m7-ui-89-config-default-visual-parity-refresh`
- `git branch --show-current`: `codex/m7-ui-89-config-default-visual-parity-refresh`
- Root/main checkout at `/Users/atilla/Applications/UZMAX智能运营` was not used for code edits.

## Source Review

- Read `AGENTS.md`.
- Ran Impeccable context for `apps/admin/src/pages/config/ConfigPage.tsx` with the Codex runtime `node`; read the product-register guidance.
- Read `PRODUCT.md`, `DESIGN.md`, `docs/admin-design-system.md`, `docs/admin-ui-page-migration-ledger.md` and `docs/evidence/M7/README.md`.
- Read prior/default-refresh inputs:
  - `docs/specs/M7-UI-76-config-source-parity-refresh.md`
  - `docs/evidence/M7/M7-UI-76-config-source-parity-refresh.md`
  - `docs/specs/M7-UI-88-team-default-visual-parity-refresh.md`
  - `apps/admin/tests/m7-ui-team-default-visual-parity.spec.ts`
- Inspected owner/prototype sources:
  - `/Users/atilla/Downloads/运营塔台1.0.html`
  - `/Users/atilla/源码/unpacked 6/pages/config/ConfigPage.tsx`
  - `/Users/atilla/源码/unpacked 6/fixtures/config.ts`
  - `/Users/atilla/源码/unpacked 6/hooks/useConfig.ts`

## Default Visual Refresh Changes

- Replaced visible save/rollback/channel/connector toast copy with source-like operational Chinese:
  - save staged/generated version preview;
  - rollback preview queued;
  - channel connectivity check updated;
  - connector health refreshed;
  - order data primary-path preview switched.
- Replaced rollback and connector confirmation descriptions/placeholders with business-readable Chinese while keeping reason-required behavior.
- Replaced forced loading/empty/error/permission copy with business-readable state copy.
- Added `configRuntimeBoundary` so `degraded`, `mock`, `browser-local only`, `no production config write`, `no audit write`, `no connector switch`, `no eval-gated publish` and `no API call` remain present through hidden DOM, `data-runtime-boundary`, `title` and `aria-description`.
- Added scoped `[hidden]` handling for the config runtime note/source mark so hidden runtime evidence does not leak into default visible body checks.
- Added focused default visual parity Playwright coverage for clean default body, version/history interactions, connector actions, forced states, collapsed nav and mobile 320.
- Updated existing config page/source-parity tests so they assert hidden/data/title boundary evidence instead of requiring visible engineering labels.

## Data And Runtime Boundary

- All config data remains synthetic/local fallback state in `configFallback.ts`.
- Save/version/history/rollback only update page-local fallback state and toast.
- Channel test/toggle only update page-local fallback state and toast.
- Connector test/switch only update page-local fallback state and toast.
- No API request, DB write, audit write, connector switch, order import runtime or eval-gated publish is implemented.
- Runtime labels remain present in hidden DOM/data/title/ARIA evidence: `degraded`, `mock`, `browser-local only`, `no production config write`, `no audit write`, `no connector switch`, `no eval-gated publish`, `no API call`.

## Browser Evidence

Artifact directory target:

- `/tmp/uzmax-m7-ui-89-config-default-visual-parity-refresh/`

Captured artifacts:

- React default clean screenshot: `/tmp/uzmax-m7-ui-89-config-default-visual-parity-refresh/react-config-default-clean.png`
- React version/history clean screenshot: `/tmp/uzmax-m7-ui-89-config-default-visual-parity-refresh/react-config-version-history-clean.png`
- React connector clean screenshot: `/tmp/uzmax-m7-ui-89-config-default-visual-parity-refresh/react-config-connector-clean.png`
- React collapsed nav clean screenshot: `/tmp/uzmax-m7-ui-89-config-default-visual-parity-refresh/react-config-collapsed-clean.png`
- React mobile 320 clean screenshot: `/tmp/uzmax-m7-ui-89-config-default-visual-parity-refresh/react-config-mobile-320-default-clean.png`
- Metrics JSON: `/tmp/uzmax-m7-ui-89-config-default-visual-parity-refresh/metrics.json`

Metrics highlights:

- Desktop: `activePageId=tenant.config`, `navWidth=232`, `runtimeLabelsPresent=true`, `runtimeLabelsVisibleInBody=false`, `visibleBodyClean=true`.
- Collapsed: `navWidth=68`, `runtimeLabelsPresent=true`, `runtimeLabelsVisibleInBody=false`, `visibleBodyClean=true`.
- Mobile 320: `bodyScrollWidth=320`, `documentScrollWidth=320`, `runtimeLabelsPresent=true`, `runtimeLabelsVisibleInBody=false`, `visibleBodyClean=true`.

## Validation

Validation status: `PASS`.

Environment notes:

- Default shell had `node` unavailable until Codex runtime PATH was used.
- Worktree had no local `node_modules`.
- First temporary symlink to root `node_modules` failed admin build because root dependencies did not include `lucide-react`.
- Final validation used temporary worktree-local symlink: `node_modules -> /Users/atilla/.codex/worktrees/m7-ui-85-customer-assets-default-visual-parity-refresh/node_modules`.
- Playwright config webServer calls `npm`, which is unavailable in this runtime PATH; validation used the already successful build plus manual `vite preview` on `127.0.0.1:4173`, then Playwright reused the existing server.

Completed validation:

- PASS: `git diff --check codex/m7-ui-88-team-default-visual-parity-refresh...HEAD`
- PASS: `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node scripts/guards/pr-shape.mjs --base codex/m7-ui-88-team-default-visual-parity-refresh --spec docs/specs/M7-UI-89-config-default-visual-parity-refresh.md --include-worktree`
  - changedFiles `9`
  - categories: `source=2`, `test=3`, `docs=4`
  - source changedFiles `2`, source netLoc `31`, new source files `0`
- PASS: touched Prettier:
  - `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node node_modules/prettier/bin/prettier.cjs --check apps/admin/src/pages/config/ConfigPage.tsx apps/admin/src/pages/config/configFallback.ts apps/admin/tests/m7-ui-config-page.spec.ts apps/admin/tests/m7-ui-config-source-parity.spec.ts apps/admin/tests/m7-ui-config-default-visual-parity.spec.ts docs/specs/M7-UI-89-config-default-visual-parity-refresh.md`
- PASS: touched ESLint:
  - `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node node_modules/eslint/bin/eslint.js apps/admin/src/pages/config/ConfigPage.tsx apps/admin/src/pages/config/configFallback.ts apps/admin/tests/m7-ui-config-page.spec.ts apps/admin/tests/m7-ui-config-source-parity.spec.ts apps/admin/tests/m7-ui-config-default-visual-parity.spec.ts`
- PASS: admin build:
  - `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir`
  - Existing Vite warning: bundle chunk larger than 500 kB after minification.
- PASS: focused Playwright:
  - Server: `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node node_modules/vite/bin/vite.js preview apps/admin --host 127.0.0.1 --port 4173`
  - Test: `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node node_modules/@playwright/test/cli.js test apps/admin/tests/m7-ui-config-page.spec.ts apps/admin/tests/m7-ui-config-source-parity.spec.ts apps/admin/tests/m7-ui-config-default-visual-parity.spec.ts`
  - Result: `8 passed`

Cleanup status:

- COMPLETE: temporary worktree-local `node_modules` symlink, `apps/admin/dist`, `test-results` and `playwright-report` were removed after validation.
- Final pre-commit `git status --short --branch --ignored=matching` showed only the 9 in-scope changed/untracked files.

## Remaining Deltas

- This branch is default visual parity/evidence refresh only; it does not claim owner visual acceptance.
- Config DB/API/runtime persistence, audit writes, connector switching/API calls, order import runtime and eval-gated publish remain intentionally not implemented.
- Real tenant config data, production permission enforcement and release approval remain future runtime specs, not this UI slice.
- Merge, runtime closure, GA-0 and 1.0 release approval are still required later and are not claimed here.
