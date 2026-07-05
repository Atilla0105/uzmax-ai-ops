# M7-UI-72 Connection Center Source Parity Refresh Evidence

## Status

`visible_ui_refresh_candidate_pending_pr_review_not_accepted_not_runtime_closed`

This branch refreshes browser-comparable source-parity evidence for `group.connections` / `连接中心` on top of the latest #213 visible UI stack. It keeps connection-center runtime downgraded: no connector DB/API/runtime, production connector change, real connection test, feature-flag persistence, audit write, owner visual acceptance, merge, runtime closure, GA-0 or 1.0 release approval is claimed.

## Scope

- Spec: `docs/specs/M7-UI-72-connection-center-source-parity-refresh.md`
- Route: `group.connections`
- Base: `origin/codex/m7-ui-71-template-center-source-parity-refresh`
- Branch/worktree: `codex/m7-ui-72-connection-center-source-parity-refresh` / `/Users/atilla/.codex/worktrees/m7-ui-72-connection-center-source-parity-refresh`
- Source target:
  - `apps/admin/src/pages/group/GroupConnectionPage.tsx`
  - `apps/admin/src/pages/group/GroupConnectionViews.tsx`
  - `apps/admin/src/pages/group/groupConnectionFallback.ts`
- Test targets:
  - `apps/admin/tests/m7-ui-connection-center-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-connection-center.spec.ts`

## Source Review

- Read `AGENTS.md`.
- Read `PRODUCT.md`, `DESIGN.md`, Impeccable product register and `docs/admin-design-system.md`.
- Read v1.1 PRD, technical architecture, admin design/frontend architecture and acceptance matrix connection-center, group-layer, connector/order-import, mobile fallback and release-boundary sections.
- Read prior M7 connection-center spec/evidence:
  - `docs/specs/M7-UI-51-connection-center-page.md`
  - `docs/evidence/M7/M7-UI-51-connection-center-page.md`
- Inspected owner/prototype sources:
  - `/Users/atilla/Downloads/运营塔台1.0.html`
  - `/Users/atilla/源码/unpacked 6/pages/group/GroupConnectionPage.tsx`
  - `/Users/atilla/源码/unpacked 6/fixtures/groupPlatform.ts`
  - `/Users/atilla/源码/unpacked 6/shell/navigation.ts`
  - `/Users/atilla/源码/unpacked 6/shell/AppShell.tsx`
- Inspected current implementation/test:
  - `apps/admin/src/pages/group/GroupConnectionPage.tsx`
  - `apps/admin/src/pages/group/GroupConnectionViews.tsx`
  - `apps/admin/src/pages/group/groupConnectionFallback.ts`
  - `apps/admin/tests/m7-ui-connection-center.spec.ts`

## Source Parity Changes

- Fixed the confirmed row-label mismatch: primary visible connector values now follow the frozen source (`正常`, `部分可行`, `不可用`, `4 个租户`, `标准接入`, `无`, `已启用`/`已停用`) instead of prefixing every row value with `mock`.
- Preserved visible governance/safety copy in the runtime note and local action toasts: `degraded`, `mock`, `read-only`, `browser-local only`, `synthetic health`, `no production connector change`, `no real connection test`, `no audit write`.
- Kept older M7-UI-51 Playwright compatibility strings as screen-reader-only compatibility text so existing forced-state coverage remains intact while the visual row shape is source-like.
- Updated local toggle/test toasts to start with source-shaped Chinese action feedback while retaining `browser-local only`, `synthetic test finished`, `no production connector change`, `no real connection test` and `no audit write`.
- Kept the subtitle adaptation: frozen source says `启停/测试写审计`; React keeps `启停/测试` but uses local-only/no-audit wording because this slice cannot imply production audit writes.

## Data And Runtime Boundary

- All connector rows remain centralized synthetic fallback data in `groupConnectionFallback.ts`.
- Persistent UI copy states: `degraded`, `mock`, `read-only`, `browser-local only`, `synthetic health`, `no production connector change`, `no real connection test`, `no audit write`.
- Toggle and test actions mutate browser-local state only.
- No DB/API/runtime/connector/feature-flag/audit/export/release wiring is implemented.

## Browser Evidence

Artifact directory:

- `/tmp/uzmax-m7-ui-72-connection-center-source-parity-refresh/`

Captured artifacts:

- Owner HTML screenshot: `/tmp/uzmax-m7-ui-72-connection-center-source-parity-refresh/owner-html-connection-center-source-sample.png`
- Owner HTML DOM/text sample: `/tmp/uzmax-m7-ui-72-connection-center-source-parity-refresh/owner-html-connection-center-source-dom-sample.json`
- Unpacked source mapping: `/tmp/uzmax-m7-ui-72-connection-center-source-parity-refresh/unpacked-connection-center-source-mapping.json`
- React desktop screenshot: `/tmp/uzmax-m7-ui-72-connection-center-source-parity-refresh/react-connection-center-desktop.png`
- React local-action screenshot: `/tmp/uzmax-m7-ui-72-connection-center-source-parity-refresh/react-connection-center-local-actions.png`
- React collapsed-sidebar screenshot: `/tmp/uzmax-m7-ui-72-connection-center-source-parity-refresh/react-connection-center-collapsed.png`
- React mobile 320 screenshot: `/tmp/uzmax-m7-ui-72-connection-center-source-parity-refresh/react-connection-center-mobile-320.png`
- Metrics JSON: `/tmp/uzmax-m7-ui-72-connection-center-source-parity-refresh/metrics.json`

## Validation

Passed locally in this worker:

- `git diff --check origin/codex/m7-ui-71-template-center-source-parity-refresh...HEAD`
- `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-71-template-center-source-parity-refresh --spec docs/specs/M7-UI-72-connection-center-source-parity-refresh.md --include-worktree`
- `node node_modules/prettier/bin/prettier.cjs --check docs/specs/M7-UI-72-connection-center-source-parity-refresh.md docs/evidence/M7/M7-UI-72-connection-center-source-parity-refresh.md docs/evidence/M7/README.md docs/admin-ui-page-migration-ledger.md apps/admin/tests/m7-ui-connection-center-source-parity.spec.ts apps/admin/src/pages/group/GroupConnectionViews.tsx apps/admin/src/pages/group/groupConnectionFallback.ts`
- `node node_modules/eslint/bin/eslint.js apps/admin/src/pages/group/GroupConnectionViews.tsx apps/admin/src/pages/group/groupConnectionFallback.ts apps/admin/tests/m7-ui-connection-center-source-parity.spec.ts`
- `node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json --pretty false`
- `node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir`
- `node_modules/.bin/playwright test apps/admin/tests/m7-ui-connection-center-source-parity.spec.ts apps/admin/tests/m7-ui-connection-center.spec.ts`

Validation notes:

- The shell does not expose `node`, `npm` or `npx` by default. Commands used bundled Node via `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH`.
- This worktree did not have its own `node_modules`; validation temporarily used `/Users/atilla/.codex/worktrees/m7-ui-64-ticket-source-parity-refresh/node_modules` as a symlink. The symlink was removed before final guard/status/commit.
- Playwright config's `webServer` command calls `npm`, which is unavailable in this shell. A Vite preview server was manually started with `node node_modules/vite/bin/vite.js preview apps/admin --host 127.0.0.1 --port 4173`, reused for Playwright, then stopped.
- Vite emitted the existing large chunk warning and exited 0.
- Focused Playwright result: `5 passed`.
- PR-shape output: `changedFiles=7`, categories `source=2`, `docs=4`, `test=1`, source `changedFiles=2`, source `netLoc=0`, new source files `0`.

Metrics summary from `/tmp/uzmax-m7-ui-72-connection-center-source-parity-refresh/metrics.json`:

- Desktop: `shellLevel=group`, `activePageId=group.connections`, `navWidth=232`, `topbarHeight=53`, `bodyScrollWidth=1440`, `documentScrollWidth=1440`.
- Desktop anatomy: header width `894`, list width `820`, first card width `820`, icon block `40x40`, action width `72`, four connector rows, `sourceLikeDefaultVisible=true`.
- Local actions: order API local toggle and Telegram Business synthetic test screenshots captured; toast copy included `browser-local only`, `synthetic test finished`, `no production connector change`, `no real connection test` and `no audit write`.
- Collapsed: `navWidth=68`, group categories `总览/平台/治理`, tenant category/button count `0`.
- Mobile 320: `bodyScrollWidth=320`, first card width `296`, icon block `40x40`, action width `266`, `mobileReadable=true`, group categories `总览/平台/治理`, tenant category/button count `0`.
- Mobile `documentScrollWidth=603` because the shared shell/topbar/nav baseline still contributes width at 320px; this slice did not alter shared shell. The page-local body/card/action fallback remains bounded and readable.

## Remaining Deltas

- Runtime connector DB/API/adapter/feature-flag/audit paths remain intentionally not implemented.
- Telegram Bot, Telegram Business, order API and import fallback are not real-tested by this page.
- The row data remains synthetic and connection ids remain `SYN-CONN-*`; source shape is improved, but production-looking ids/statuses are intentionally avoided.
- Mobile page-local fallback is bounded, but `documentElement.scrollWidth` still records the shared shell/topbar/nav width at 320px; shared shell changes are out of scope for this slice.
- Owner visual acceptance, merge, runtime closure, GA-0 and 1.0 release approval are still required later and are not claimed here.
