# M7-UI-88 Team Default Visual Parity Refresh Evidence

## Status

`visible_ui_refresh_candidate_pending_pr_review_not_accepted_not_runtime_closed`

This branch refreshes the default visible `tenant.team` / `团队` page on top of `codex/m7-ui-87-ai-members-default-visual-parity-refresh`. It keeps team runtime downgraded: no team DB/API/runtime/authz write, invite email sending, Telegram binding persistence, production permission mutation, audit write, owner visual acceptance, merge closure, runtime closure, GA-0 or 1.0 release approval is claimed.

## Scope

- Spec: `docs/specs/M7-UI-88-team-default-visual-parity-refresh.md`
- Route: `tenant.team`
- Base: `codex/m7-ui-87-ai-members-default-visual-parity-refresh`
- Branch/worktree: `codex/m7-ui-88-team-default-visual-parity-refresh` / `/Users/atilla/.codex/worktrees/m7-ui-88-team-default-visual-parity-refresh`
- Source target:
  - `apps/admin/src/pages/team/TeamPage.tsx`
  - `apps/admin/src/pages/team/TeamViews.tsx`
  - `apps/admin/src/pages/team/TeamDialogs.tsx`
  - `apps/admin/src/pages/team/teamFallback.ts`
- Test targets:
  - `apps/admin/tests/m7-ui-team-page.spec.ts`
  - `apps/admin/tests/m7-ui-team-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-team-default-visual-parity.spec.ts`

## Startup Evidence

- `pwd`: `/Users/atilla/.codex/worktrees/m7-ui-88-team-default-visual-parity-refresh`
- `git status --short --branch`: `## codex/m7-ui-88-team-default-visual-parity-refresh`
- `git branch --show-current`: `codex/m7-ui-88-team-default-visual-parity-refresh`
- Open PR list check: attempted with `gh pr list --state open --limit 100`; blocked because `gh` is unavailable on PATH in this worker shell.

## Source Review

- Read `AGENTS.md`.
- Ran Impeccable context for `apps/admin/src/pages/team/TeamPage.tsx` and read the product-register guidance.
- Read `docs/admin-design-system.md`, `docs/admin-ui-page-migration-ledger.md` and `docs/evidence/M7/README.md`.
- Read prior team specs/evidence:
  - `docs/specs/M7-UI-53-team-page.md`
  - `docs/specs/M7-UI-75-team-source-parity-refresh.md`
  - `docs/evidence/M7/M7-UI-75-team-source-parity-refresh.md`
- Read analogous default visual parity source:
  - `docs/specs/M7-UI-87-ai-members-default-visual-parity-refresh.md`
  - `docs/evidence/M7/M7-UI-87-ai-members-default-visual-parity-refresh.md`
  - `apps/admin/tests/m7-ui-ai-members-default-visual-parity.spec.ts`
- Inspected owner/prototype sources:
  - `/Users/atilla/源码/unpacked 6/pages/team/TeamPage.tsx`
  - `/Users/atilla/源码/unpacked 6/fixtures/team.ts`

## Change Summary

- Default visible team body no longer surfaces `degraded / mock / read-only / browser-local only / no production...` engineering labels.
- Page root, hidden runtime note, state panels, toast, invite modal, role editor, member drawer and local controls retain `data-runtime-boundary`, `title`, `aria-description` or hidden DOM boundary evidence.
- Forced loading/empty/error/permission states now show business-readable operational copy while retaining hidden/data/title boundary evidence.
- Toast/modal/drawer/confirm visible copy now says invite staged, role created/updated/deleted, notification preference updated, Telegram binding preview updated and account disabled/restored.
- Existing team tests were updated to assert hidden/data/title boundary evidence instead of visible engineering labels.
- Added focused default visual parity Playwright coverage and artifacts under `/tmp/uzmax-m7-ui-88-team-default-visual-parity-refresh`.

## Data And Runtime Boundary

- All members, roles and permission groups remain fallback rows in `teamFallback.ts`.
- Search, invite, role create/edit/delete, drawer notification preference, Telegram toggle and disable/restore remain in-memory page interactions only.
- No API request, DB write, authz mutation, invite email, Telegram binding persistence, permission persistence or audit write is implemented.
- Runtime labels remain present in hidden/data/title/ARIA evidence: `degraded`, `mock`, `read-only`, `browser-local only`, `no production authz write`, `no team mutation`, `no invite email send`, `no Telegram binding change`, `no audit write`.

## Browser Evidence

Artifact directory target:

- `/tmp/uzmax-m7-ui-88-team-default-visual-parity-refresh/`

Expected focused artifacts:

- React default desktop screenshot: `/tmp/uzmax-m7-ui-88-team-default-visual-parity-refresh/react-team-default-clean.png`
- React collapsed nav screenshot: `/tmp/uzmax-m7-ui-88-team-default-visual-parity-refresh/react-team-collapsed-clean.png`
- React mobile 320 screenshot: `/tmp/uzmax-m7-ui-88-team-default-visual-parity-refresh/react-team-mobile-320-default-clean.png`
- Metrics JSON: `/tmp/uzmax-m7-ui-88-team-default-visual-parity-refresh/metrics.json`

Focused metrics highlights:

- Desktop default: `activePageId=tenant.team`, `navWidth=232`, `runtimeLabelsPresent=true`, `runtimeLabelsVisibleInBody=false`, `visibleBodyClean=true`.
- Collapsed nav: `navWidth=68`, `runtimeLabelsPresent=true`, `runtimeLabelsVisibleInBody=false`, `visibleBodyClean=true`.
- Mobile 320: `bodyScrollWidth=320`, `documentScrollWidth=320`, `runtimeLabelsPresent=true`, `runtimeLabelsVisibleInBody=false`, `visibleBodyClean=true`.

Current capture status: `COMPLETE`. Focused screenshots and metrics were captured under `/tmp/uzmax-m7-ui-88-team-default-visual-parity-refresh/`.

## Validation

Validation status:

- PASS: `git diff --check codex/m7-ui-87-ai-members-default-visual-parity-refresh...HEAD`
- PASS: `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node scripts/guards/pr-shape.mjs --base codex/m7-ui-87-ai-members-default-visual-parity-refresh --spec docs/specs/M7-UI-88-team-default-visual-parity-refresh.md --include-worktree`
  - Exact output: `{"base":"codex/m7-ui-87-ai-members-default-visual-parity-refresh","specPath":"docs/specs/M7-UI-88-team-default-visual-parity-refresh.md","specType":"feature","bootstrapException":false,"changedFiles":11,"categories":{"source":4,"test":3,"docs":4},"source":{"changedFiles":4,"netLoc":10,"newFiles":0}}`
- PASS: touched Prettier check:
  - `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node node_modules/prettier/bin/prettier.cjs --check apps/admin/src/pages/team/TeamPage.tsx apps/admin/src/pages/team/TeamViews.tsx apps/admin/src/pages/team/TeamDialogs.tsx apps/admin/src/pages/team/teamFallback.ts apps/admin/tests/m7-ui-team-page.spec.ts apps/admin/tests/m7-ui-team-source-parity.spec.ts apps/admin/tests/m7-ui-team-default-visual-parity.spec.ts docs/specs/M7-UI-88-team-default-visual-parity-refresh.md docs/evidence/M7/M7-UI-88-team-default-visual-parity-refresh.md docs/evidence/M7/README.md docs/admin-ui-page-migration-ledger.md`
- PASS: touched ESLint:
  - `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node node_modules/eslint/bin/eslint.js apps/admin/src/pages/team/TeamPage.tsx apps/admin/src/pages/team/TeamViews.tsx apps/admin/src/pages/team/TeamDialogs.tsx apps/admin/src/pages/team/teamFallback.ts apps/admin/tests/m7-ui-team-page.spec.ts apps/admin/tests/m7-ui-team-source-parity.spec.ts apps/admin/tests/m7-ui-team-default-visual-parity.spec.ts`
- PASS: admin build:
  - `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir`
  - Result: built in 133ms; Vite reported existing chunk-size warning only.
- PASS: focused Playwright:
  - Server: `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node node_modules/vite/bin/vite.js apps/admin --host 127.0.0.1 --port 4173`
  - Test: `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node node_modules/@playwright/test/cli.js test apps/admin/tests/m7-ui-team-page.spec.ts apps/admin/tests/m7-ui-team-source-parity.spec.ts apps/admin/tests/m7-ui-team-default-visual-parity.spec.ts`
  - Result: `9 passed (3.6s)`.

Validation environment notes:

- This worktree initially had no `node_modules`.
- A temporary `node_modules` symlink to `/Users/atilla/Applications/UZMAX智能运营/node_modules` was sufficient for Prettier/ESLint, but admin build failed there because that dependency directory did not contain `lucide-react`.
- Build/Playwright used a temporary `node_modules` symlink to `/Users/atilla/.codex/worktrees/m7-ui-85-customer-assets-default-visual-parity-refresh/node_modules`, which contains `lucide-react` and the needed Vite/Playwright dependencies.
- Plain `npm` is unavailable on PATH in this worker shell, so focused Playwright reused a manually started Vite server on `127.0.0.1:4173` after the explicit admin build.
- Temporary `node_modules`, `apps/admin/dist`, `test-results` and `playwright-report` were removed after validation.

## Non-Claims

- No team DB/API/authz runtime is implemented.
- No production permission mutation, invite email sending, Telegram binding persistence or audit write is implemented.
- No owner visual acceptance, merge, runtime closure, GA-0, production readiness or 1.0 release approval is claimed.
- Real team data and production permission enforcement remain future runtime specs, not this UI slice.
