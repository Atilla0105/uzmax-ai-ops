# M7-UI-76 Config Source Parity Refresh Evidence

## Status

`visible_ui_refresh_candidate_pending_pr_review_not_accepted_not_runtime_closed`

This branch refreshes source-parity details for `tenant.config` / `配置` on top of `origin/codex/m7-ui-75-team-source-parity-refresh`. It keeps config runtime downgraded: no config DB/API/runtime write, production config persistence, audit write, connector runtime switch, connector test, order import runtime, eval-gated publish, owner visual acceptance, merge, runtime closure, GA-0 or 1.0 release approval is claimed.

## Scope

- Spec: `docs/specs/M7-UI-76-config-source-parity-refresh.md`
- Route: `tenant.config`
- Base: `origin/codex/m7-ui-75-team-source-parity-refresh`
- Branch/worktree: `codex/m7-ui-76-config-source-parity-refresh` / `/Users/atilla/.codex/worktrees/m7-ui-76-config-source-parity-refresh`
- Source targets:
  - `apps/admin/src/pages/config/ConfigPage.tsx`
  - `apps/admin/src/pages/config/configFallback.ts`
- Test targets:
  - `apps/admin/tests/m7-ui-config-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-config-page.spec.ts`

## Startup Evidence

- `pwd`: `/Users/atilla/.codex/worktrees/m7-ui-76-config-source-parity-refresh`
- `git status --short --branch`: `## codex/m7-ui-76-config-source-parity-refresh...origin/codex/m7-ui-75-team-source-parity-refresh`
- `git branch --show-current`: `codex/m7-ui-76-config-source-parity-refresh`
- Root/main checkout at `/Users/atilla/Applications/UZMAX智能运营` was not used for code edits.

## Source Review

- Read `AGENTS.md`.
- Ran Impeccable context for `apps/admin/src/pages/config/ConfigPage.tsx` with the Codex runtime `node`; read the product-register guidance.
- Read `PRODUCT.md`, `DESIGN.md`, `docs/admin-design-system.md`, `docs/admin-ui-page-migration-ledger.md` and `docs/evidence/M7/README.md`.
- Read prior config spec/evidence:
  - `docs/specs/M7-UI-54-config-page.md`
  - `docs/evidence/M7/M7-UI-54-config-page.md`
- Inspected owner/prototype sources:
  - `/Users/atilla/源码/unpacked 6/pages/config/ConfigPage.tsx`
  - `/Users/atilla/源码/unpacked 6/fixtures/config.ts`
  - `/Users/atilla/源码/unpacked 6/hooks/useConfig.ts`
- Captured owner HTML `/Users/atilla/Downloads/运营塔台1.0.html` with focused Playwright under `/tmp/uzmax-m7-ui-76-config-source-parity-refresh/`.

## Source Parity Changes

- Removed visible `selectedTenantId · tenant layer` header badge from the primary config page visual hierarchy while retaining `data-selected-tenant-id` on the page root for evidence.
- Added Lucide icon+label internal nav treatment for the 8 owner config sections.
- Calibrated the config right pane to owner/source geometry: `#FAFAF8`, scroll-owned `20px 24px` content padding, version head inside the content area and no extra page-level toolbar.
- Lowered the runtime note and source mark to hidden DOM/evidence text. Runtime boundary labels remain available to tests/metrics/state copy.
- Kept owner-like version history card copy `版本历史 · 回滚需二次确认并写审计`, while preserving local-only/no-audit truth in confirmation descriptions and toasts.
- Aligned business config grid to source geometry: `max-width: 640px`, two columns, `18px` padding and `16px` gap.
- Aligned connector visible copy toward owner source (`订单 API（主路径）`, `查看导入历史 →`) while preserving `no connector switch / no API call / no audit write` in modal/toast boundary copy.
- Localized rollback and connector confirmation microcopy so the modal no longer inherits English `Cancel` / `Reason`; confirmations now show `取消` plus `回滚原因` or `切换原因` while preserving the existing required placeholders and local-only boundary copy.
- Repaired stale existing config regression assertion so it checks owner-like history copy plus local-only modal boundary instead of requiring `no audit write` inside the history card.

## Data And Runtime Boundary

- All config data remains synthetic/local fallback state in `configFallback.ts`.
- Save/version/history/rollback only update browser-local state and toast.
- Channel test/toggle only updates browser-local state and toast.
- Connector test/switch only updates browser-local state and toast.
- No API request, DB write, audit write, connector switch, order import runtime or eval-gated publish is implemented.
- Runtime labels remain present in DOM/test evidence: `degraded`, `mock`, `browser-local only`, `no production config write`, `no audit write`, `no connector switch`, `no eval-gated publish`.

## Browser Evidence

Artifact directory target:

- `/tmp/uzmax-m7-ui-76-config-source-parity-refresh/`

Captured artifacts:

- Owner HTML desktop screenshot: `/tmp/uzmax-m7-ui-76-config-source-parity-refresh/owner-html-config-desktop.png`
- Owner HTML rendered sample: `/tmp/uzmax-m7-ui-76-config-source-parity-refresh/owner-html-config-rendered-sample.json`
- Unpacked/source mapping: `/tmp/uzmax-m7-ui-76-config-source-parity-refresh/unpacked-config-source-mapping.json`
- React desktop business config screenshot: `/tmp/uzmax-m7-ui-76-config-source-parity-refresh/react-config-desktop-biz.png`
- React dirty state screenshot: `/tmp/uzmax-m7-ui-76-config-source-parity-refresh/react-config-dirty-state.png`
- React version history screenshot: `/tmp/uzmax-m7-ui-76-config-source-parity-refresh/react-config-version-history.png`
- React connector confirm modal screenshot: `/tmp/uzmax-m7-ui-76-config-source-parity-refresh/react-config-connector-confirm-modal.png` refreshed after Chinese `取消` / `切换原因` microcopy fix.
- React connector section screenshot: `/tmp/uzmax-m7-ui-76-config-source-parity-refresh/react-config-connector-section.png`
- React collapsed nav screenshot: `/tmp/uzmax-m7-ui-76-config-source-parity-refresh/react-config-collapsed-nav.png`
- React mobile 320 screenshot: `/tmp/uzmax-m7-ui-76-config-source-parity-refresh/react-config-mobile-320.png`
- Metrics JSON: `/tmp/uzmax-m7-ui-76-config-source-parity-refresh/metrics.json`

Owner HTML rendered sample highlights:

- `title=true`, `sectionLabels=true`, `versionHead=true`, `history=true`, `save=true`.
- 8 owner internal config nav labels rendered at the expected internal-nav x-range; first row `业务配置` measured as `x=242`, `width=215`, `height=36`.
- Rendered owner HTML table cells are blank in the captured sample (`blankRenderedTable=true`), so React keeps structured unpacked/source table anatomy where required.

Unpacked/source mapping highlights:

- `reactFollows=rendered-owner-html-first-then-unpacked-config-source-for-structured-details`
- Owner bundle contains `cfgSecLabel`, `cfgVerBadge`, `cfgVerMeta`, `cfgConnSwitchLabel`.
- Unpacked fixtures carry all 8 nav labels/icons; unpacked page carries icon nav and source geometry (`width:236`, `padding:'20px 24px'`, `maxWidth:640`); unpacked hook carries local `dirty`, `switchConnector` and `rollback` state.

React metrics highlights:

- Desktop business config: `shellLevel=tenant`, `activePageId=tenant.config`, outer nav `232`, topbar height `53`, internal nav width `236`, internal nav count `8`, internal nav icon count `8`, right pane padding `20/24/20/24`, business grid max width `640`, runtime labels present, runtime note visible `false`, group nav labels absent, tenant categories present.
- Dirty state: `dirtyBadgeVisible=true`.
- Version history: `historyVisible=true`, history card uses owner-like `版本历史 · 回滚需二次确认并写审计`; rollback modal/toast retain `no audit write / no production config write`.
- Connector section: visible with owner-like `订单 API（主路径）`; connector confirm modal/toast retain `no connector switch / no audit write / no API call`; confirm modal uses Chinese `取消` and `切换原因`.
- Collapsed sidebar: outer nav `68`, internal config nav still `236`.
- Mobile 320: body scroll width `320`, document scroll width `320`, runtime labels present, runtime note visible `false`.

Current capture status: `COMPLETE`.

## Validation

Validation status: `PASS_WITH_EXISTING_BUILD_WARNING`.

Environment notes so far:

- PATH used for Node scripts: `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH`
- Default shell had `node` unavailable until this PATH was exported.
- `npm` is unavailable in the Codex runtime PATH.
- `pnpm install --frozen-lockfile`: failed because this repo has `package-lock.json` but no `pnpm-lock.yaml`.
- `pnpm install --no-frozen-lockfile`: succeeded and created temporary worktree-local `node_modules` plus `pnpm-lock.yaml`; `pnpm-lock.yaml` was removed before final `pr-shape`.
- Because `pnpm` does not honor this repo's npm workspace field, validation added a temporary worktree-local symlink: `node_modules/@uzmax/ui-tokens -> ../../packages/ui-tokens`.

Completed validation:

- PASS: `git diff --check`
- PASS: `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-75-team-source-parity-refresh --spec docs/specs/M7-UI-76-config-source-parity-refresh.md --include-worktree`
  - changedFiles `7`
  - categories: `source=1`, `test=2`, `docs=4`
  - source changedFiles `1`, source netLoc `0`, new source files `0`
- PASS: Touched admin ESLint:
  - `node node_modules/eslint/bin/eslint.js apps/admin/src/pages/config/ConfigPage.tsx apps/admin/src/pages/config/configFallback.ts apps/admin/tests/m7-ui-config-source-parity.spec.ts apps/admin/tests/m7-ui-config-page.spec.ts`
- PASS: Focused ESLint after confirmation microcopy返修:
  - `node node_modules/eslint/bin/eslint.js apps/admin/src/pages/config/ConfigPage.tsx apps/admin/tests/m7-ui-config-source-parity.spec.ts`
- PASS: Focused Playwright:
  - Server: `node node_modules/vite/bin/vite.js apps/admin --host 127.0.0.1 --port 4173`
  - Test: `node node_modules/@playwright/test/cli.js test apps/admin/tests/m7-ui-config-source-parity.spec.ts apps/admin/tests/m7-ui-config-page.spec.ts --config=playwright.config.ts`
  - Result: `7 passed`
  - Re-run after confirmation microcopy返修 also passed `7 passed`.
- PASS: Admin build:
  - `node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir`
  - Existing Vite warning: bundle chunk larger than 500 kB after minification.
- PASS: `git merge-tree --write-tree origin/codex/m7-ui-75-team-source-parity-refresh HEAD`
  - tree `4716ef20c1dbd58994a60c6144b3114305b59ddc`

Cleanup status:

- COMPLETE: worktree-local `node_modules`, `apps/admin/node_modules`, `test-results`, `playwright-report`, `apps/admin/dist`, and temporary `pnpm-lock.yaml` were removed after validation; coordinator `find` cleanup check returned empty.

## Remaining Deltas

- This branch is source-parity/evidence refresh only; it does not claim owner visual acceptance.
- Config DB/API/runtime persistence, audit writes, connector switching/testing, order import runtime and eval-gated publish remain intentionally not implemented.
- Real tenant config data, production permission enforcement and release approval remain future runtime specs, not this UI slice.
- Merge, runtime closure, GA-0 and 1.0 release approval are still required later and are not claimed here.
